'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { createPayloadOrder, notifyAdminFailedPayment } from './actions'
import { createReceipt, getReceiptStatus, PayzentricError, type PayzentricLineItem } from '@/lib/payzentric/client'

/**
 * Creates the pending order (same reservation/dedupe path as every other payment method),
 * then opens a Payzentric crypto payment portal session for it. Our own order id is passed as
 * the receipt id so the webhook/status lookup can find it back — mirroring how the Stripe
 * PaymentIntent metadata carries `orderId` and CircoFlows carries `merchant_transaction_id`.
 */
export async function createPayzentricPayment(
  items: any[],
  shippingMethodName: string,
  couponCode: string | undefined,
  isRedeemingPoints: boolean,
  formData: any,
  userId?: string,
  isNewAddress = false
): Promise<{ orderId?: string; redirectUrl?: string; error?: string; updatedItems?: any[]; priceChanged?: boolean }> {
  const orderRes = await createPayloadOrder(
    items,
    shippingMethodName,
    couponCode,
    isRedeemingPoints,
    formData,
    'payzentric_pending' as any,
    userId,
    'payzentric',
    isNewAddress
  )

  if (orderRes.error || !orderRes.orderId) {
    return orderRes
  }

  const payload = await getPayload({ config: configPromise })
  const order = await payload.findByID({ collection: 'orders', id: Number(orderRes.orderId), depth: 0, overrideAccess: true })
  if (!order) {
    return { error: 'Order not found after creation' }
  }

  const headersList = await headers()
  const origin = headersList.get('origin') || `https://${headersList.get('host')}`

  const lineItems: PayzentricLineItem[] = (order.items || []).map((item: any) => ({
    label: item.variantTitle || item.variant || 'Item',
    priceUsd: item.price,
    qty: item.quantity,
  }))
  if (order.shippingTotal) lineItems.push({ label: 'Shipping', priceUsd: order.shippingTotal })
  if (order.taxTotal) lineItems.push({ label: 'Tax', priceUsd: order.taxTotal })
  if (order.feeTotal) lineItems.push({ label: 'Processing Fee', priceUsd: order.feeTotal })

  try {
    const receipt = await createReceipt({
      id: String(order.id),
      lineItems,
      totalUsd: order.total || 0,
      redirectUrl: `${origin}/order-confirmation/${order.id}`,
      webhookUrl: `${origin}/api/webhooks/payzentric`,
      billingFirstName: order.customerFirstName || undefined,
      billingLastName: order.customerLastName || undefined,
      billingEmail: order.guestEmail || undefined,
    })

    await payload.update({
      collection: 'orders',
      id: order.id,
      data: { payzentricReceiptId: receipt.id },
      overrideAccess: true,
    })

    return { orderId: orderRes.orderId, redirectUrl: receipt.paymentUrl }
  } catch (error: any) {
    // Release the reservation immediately rather than leaving a dead pending order sitting
    // on reserved stock/coupon/points — same cleanup path Stripe/CircoFlows use for a failed
    // payment session (see circoflowsActions.ts, api/webhooks/stripe/route.ts).
    await cancelUnfinalizedOrder(order.id)
    const message = error instanceof PayzentricError ? `${error.message} (${error.status})` : error.message || 'Payzentric session creation threw'
    await notifyAdminFailedPayment(String(order.id), message).catch(console.error)
    console.error('Payzentric receipt creation failed:', message)
    return { error: 'Failed to reach Payzentric. Please try again.' }
  }
}

async function cancelUnfinalizedOrder(orderId: string | number) {
  try {
    const payload = await getPayload({ config: configPromise })
    const order = await payload.findByID({ collection: 'orders', id: Number(orderId), depth: 0, overrideAccess: true })
    if (order && !order.isFinalized && order.status === 'pending') {
      await payload.update({ collection: 'orders', id: Number(orderId), data: { status: 'cancelled' }, overrideAccess: true, context: { paymentFailed: true } })
    }
  } catch (err) {
    console.error(`Failed to cancel unfinalized Payzentric order ${orderId}:`, err)
  }
}

/**
 * Fallback status check for when the customer lands back on the confirmation page before the
 * webhook has arrived — mirrors syncCircoFlowsPaymentStatus's role for CircoFlows. Never
 * trusts anything the client passes beyond the orderId; the amount/status truth always comes
 * from Payzentric's own authenticated status endpoint.
 */
export async function syncPayzentricPaymentStatus(orderId: string): Promise<{ success?: boolean; status?: string; error?: string }> {
  try {
    const payload = await getPayload({ config: configPromise })
    const order = await payload.findByID({ collection: 'orders', id: Number(orderId), depth: 0, overrideAccess: true })
    if (!order) return { error: 'Order not found' }

    const receiptId = (order as any).payzentricReceiptId || String(order.id)
    const statusRes = await getReceiptStatus(receiptId)

    if (statusRes.status === 'failed') {
      // The webhook may never arrive (or may arrive later) — without this, a failed payment
      // left the order silently stuck as pending/unpaid forever, with no email to the
      // customer or support. Mirrors syncCircoFlowsPaymentStatus's declined handling.
      if (!order.isFinalized && order.status === 'pending') {
        await payload.update({ collection: 'orders', id: Number(orderId), data: { status: 'cancelled' }, overrideAccess: true, context: { paymentFailed: true } })
        await notifyAdminFailedPayment(orderId, statusRes.failureReason || statusRes.failureCode || 'Payzentric payment failed').catch(console.error)
      }
      return { success: false, status: statusRes.status }
    }

    if (statusRes.status !== 'completed') {
      // generated/pending/tx_mined/recipient_validated/tx_mismatch — nothing to finalize yet.
      return { success: false, status: statusRes.status }
    }

    const expectedAmount = (order.total || 0).toFixed(2)
    if (typeof statusRes.amount === 'number' && statusRes.amount.toFixed(2) !== expectedAmount) {
      console.error(`syncPayzentricPaymentStatus: amount mismatch for order ${orderId} (paid ${statusRes.amount}, expected ${expectedAmount})`)
      return { error: 'Payment amount does not match order total' }
    }

    if (statusRes.transactionHash) {
      await payload.update({
        collection: 'orders',
        id: Number(orderId),
        data: { payzentricTransactionHash: statusRes.transactionHash },
        overrideAccess: true,
      })
    }

    const { finalizeOrder } = await import('@/lib/orders/finalizeOrder')
    await finalizeOrder(orderId, {})
    return { success: true }
  } catch (error: any) {
    console.error('Failed to sync Payzentric payment status:', error)
    return { error: error.message }
  }
}
