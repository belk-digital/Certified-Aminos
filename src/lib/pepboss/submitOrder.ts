import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createOrder, PepBossError, type PepBossOrderItem } from './client'

/**
 * Submits the PepBoss-sourced line items of an already-paid order to the PepBoss supplier
 * API. Called from finalizeOrder after payment is confirmed — a PepBoss failure here must
 * never roll back or block the (already captured) storefront order, so every error is caught
 * and recorded on the order for manual review rather than thrown.
 *
 * Uses `allow_backorder` rather than `require_available`: the customer has already paid, so
 * an out-of-stock line should hold for restock rather than reject the whole submission.
 */
export async function submitOrderToPepBoss(order: any) {
  const payload = await getPayload({ config: configPromise })

  const itemsBySku = new Map<string, PepBossOrderItem>()
  for (const line of order.items || []) {
    const snapshot = line.productSnapshot
    if (!snapshot) continue

    const pepbossSku = snapshot.hasVariants
      ? snapshot.variants?.find((v: any) => v.sku === line.variant)?.pepbossSku
      : snapshot.pepbossSku

    if (!pepbossSku) continue

    const existing = itemsBySku.get(pepbossSku)
    itemsBySku.set(pepbossSku, {
      sku: pepbossSku,
      quantity: (existing?.quantity || 0) + (line.quantity || 1),
    })
  }

  const items = Array.from(itemsBySku.values())
  if (items.length === 0) {
    // No PepBoss-mapped products in this order — nothing to submit, leave status as default.
    return
  }

  const shipping = order.shippingAddress || {}
  const recipient = {
    name: `${order.customerFirstName || ''} ${order.customerLastName || ''}`.trim() || 'Customer',
    addressLine1: shipping.line1 || '',
    addressLine2: shipping.line2 || undefined,
    city: shipping.city || '',
    region: shipping.state || '',
    postalCode: shipping.postalCode || '',
    countryCode: (shipping.country || 'US').toUpperCase(),
    phone: order.customerPhone || undefined,
  }

  try {
    const pepbossOrder = await createOrder({
      externalOrderId: `web:${order.id}`,
      recipient,
      items,
      inventoryPolicy: 'allow_backorder',
      idempotencyKey: `web:${order.id}:v1`,
    })

    await payload.update({
      collection: 'orders',
      id: order.id,
      data: {
        pepbossOrderId: pepbossOrder.id,
        pepbossStatus: pepbossOrder.fulfillment.backorderedItemCount > 0 ? 'backordered' : 'submitted',
      },
      overrideAccess: true,
    })
  } catch (error: any) {
    const message = error instanceof PepBossError ? `${error.message} (${error.status})` : error.message || 'Unknown error'
    console.error(`Failed to submit order ${order.id} to PepBoss:`, message)
    await payload.update({
      collection: 'orders',
      id: order.id,
      data: {
        pepbossStatus: 'failed',
        pepbossSubmissionError: message,
      },
      overrideAccess: true,
    }).catch((err) => console.error('Failed to record PepBoss submission failure on order:', err))
  }
}
