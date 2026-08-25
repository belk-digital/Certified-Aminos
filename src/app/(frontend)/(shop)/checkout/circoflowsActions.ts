'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { createPayloadOrder, notifyAdminFailedPayment } from './actions'

const CIRCOFLOWS_BASE_URL = 'https://gateway.circoflows.com/api/v1'

/**
 * Creates the pending order (same reservation/dedupe path as every other payment method),
 * then opens a CircoFlows hosted-card session for it. The order's own id is passed as
 * merchant_transaction_id so the webhook/status lookup can find it back — mirroring how the
 * Stripe PaymentIntent metadata carries `orderId`.
 */
export async function createCircoFlowsPayment(
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
    'circoflows_pending',
    userId,
    'circoflows',
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
  // x-forwarded-for can carry a "client, proxy1, proxy2" chain (Vercel included) — the first
  // entry is the actual customer, the rest are intermediate proxies.
  const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0].trim() || headersList.get('x-real-ip') || '127.0.0.1'

  try {
    const response = await fetch(`${CIRCOFLOWS_BASE_URL}/hosted/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CIRCOFLOWS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        line1: formData.address,
        city: formData.city,
        state: formData.state,
        postal_code: formData.zip,
        country: formData.country || 'US',
        ip_address: ipAddress,
        amount: String(order.total),
        currency: 'USD',
        merchant_transaction_id: String(order.id),
        return_url: `${origin}/order-confirmation/${order.id}`,
        webhook_url: `${origin}/api/webhooks/circoflows`,
      }),
    })

    const data = await response.json()

    if (!response.ok || data.status !== 'card_url' || !data.card_url) {
      // Release the reservation immediately rather than leaving a dead pending order sitting
      // on reserved stock/coupon/points — same cleanup path the Stripe webhook uses for a
      // failed PaymentIntent (see api/webhooks/stripe/route.ts, payment_intent.payment_failed).
      await cancelUnfinalizedOrder(order.id)
      await notifyAdminFailedPayment(String(order.id), data.reason || 'Failed to initialize CircoFlows payment session').catch(console.error)
      return { error: data.reason || 'Failed to initialize CircoFlows payment session' }
    }

    return { orderId: orderRes.orderId, redirectUrl: data.card_url as string }
  } catch (error: any) {
    await cancelUnfinalizedOrder(order.id)
    await notifyAdminFailedPayment(String(order.id), error.message || 'CircoFlows session creation threw').catch(console.error)
    console.error('CircoFlows session creation failed:', error)
    return { error: 'Failed to reach CircoFlows. Please try again.' }
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
    console.error(`Failed to cancel unfinalized CircoFlows order ${orderId}:`, err)
  }
}

/**
 * Fallback status check for when the customer lands back on the confirmation page before the
 * webhook has arrived — mirrors syncPaymentStatus's role for Stripe. Never trusts anything the
 * client passes beyond the orderId; the amount/status truth always comes from CircoFlows itself.
 */
export async function syncCircoFlowsPaymentStatus(orderId: string): Promise<{ success?: boolean; status?: string; error?: string }> {
  try {
    const response = await fetch(`${CIRCOFLOWS_BASE_URL}/payment/status`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CIRCOFLOWS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ merchant_transaction_id: orderId }),
    })
    const rawResponse = await response.json()
    console.log(`CircoFlows status check for order ${orderId}:`, JSON.stringify(rawResponse))
    // The real payload is nested under `data` (e.g. {"success":true,"data":{"status":...}}) —
    // not flat as the docs' example suggested. Falling back to the top level too in case a
    // future response shape flattens it back out.
    const data = rawResponse.data || rawResponse

    const payload = await getPayload({ config: configPromise })
    const order = await payload.findByID({ collection: 'orders', id: Number(orderId), depth: 0, overrideAccess: true })
    if (!order) return { error: 'Order not found' }

    if (data.status === 'declined') {
      // The webhook may never arrive (or may arrive later) — without this, a declined
      // payment left the order silently stuck as pending/unpaid forever, with no email to
      // the customer or support. Mirrors the webhook's declined handling exactly.
      //
      // Both the webhook and the client-side confirmation-page fallback call this function,
      // and CircoFlows' own status check is idempotent (it just re-reports "declined" every
      // time it's asked) — so without this guard, whichever of the two callers runs *second*
      // would still send its own admin alert for a decline someone already handled. Tying the
      // notification to the same pending-status guard as the cancellation means it only fires
      // on the one call that actually transitions the order.
      if (!order.isFinalized && order.status === 'pending') {
        await payload.update({ collection: 'orders', id: Number(orderId), data: { status: 'cancelled' }, overrideAccess: true, context: { paymentFailed: true } })
        await notifyAdminFailedPayment(orderId, data.message || data.reason || 'CircoFlows payment declined').catch(console.error)
      }
      return { success: false, status: data.status }
    }

    if (data.status !== 'success') {
      // 'processing'/'redirected' (3DS or hosted-page redirect still in flight) or an
      // unrecognized status — nothing to finalize yet.
      return { success: false, status: data.status }
    }

    const expectedAmount = (order.total || 0).toFixed(2)
    if (String(data.amount) !== expectedAmount && Number(data.amount) !== Number(expectedAmount)) {
      console.error(`syncCircoFlowsPaymentStatus: amount mismatch for order ${orderId} (paid ${data.amount}, expected ${expectedAmount})`)
      return { error: 'Payment amount does not match order total' }
    }

    if (data.transaction_id) {
      await payload.update({
        collection: 'orders',
        id: Number(orderId),
        data: { circoflowsTransactionId: data.transaction_id },
        overrideAccess: true,
      })
    }

    const { finalizeOrder } = await import('@/lib/orders/finalizeOrder')
    await finalizeOrder(orderId, {})
    return { success: true }
  } catch (error: any) {
    console.error('Failed to sync CircoFlows payment status:', error)
    return { error: error.message }
  }
}
