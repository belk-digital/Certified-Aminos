import { config } from 'dotenv'
config({ path: '.env' })
config({ path: '.env.local' })

import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { finalizeOrder } from '../src/lib/orders/finalizeOrder'

async function main() {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'products',
    where: { name: { equals: 'BPC-157' } },
    limit: 1,
    depth: 0,
  })
  const product = docs[0]
  if (!product) throw new Error('BPC-157 product not found')
  const variant = (product.variants || []).find((v: any) => v.sku === 'bpc-157-10mg')
  if (!variant) throw new Error('bpc-157-10mg variant not found')
  console.log('Using product:', product.id, product.name, 'variant:', variant.sku, 'pepbossSku:', variant.pepbossSku, 'price:', variant.price)

  // Mirrors exactly what createPayloadOrder (checkout/actions.ts) builds, for a Zelle
  // (manual-confirmation) order — same shape a real customer checkout would produce.
  const order = await payload.create({
    collection: 'orders',
    data: {
      customerFirstName: 'Test',
      customerLastName: 'Order',
      customerPhone: '555-0100',
      guestEmail: 'main.belkdigital@gmail.com',
      items: [
        {
          product: product.id,
          variantTitle: variant.options?.map((o: any) => o.value).join(' ') || variant.sku,
          variant: variant.sku,
          price: variant.salePrice || variant.price,
          quantity: 1,
          productSnapshot: product,
        },
      ],
      shippingAddress: {
        line1: '100 Lab Way',
        line2: '',
        city: 'San Diego',
        state: 'CA',
        postalCode: '92101',
        country: 'US',
      },
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod: 'zelle',
      subtotal: variant.salePrice || variant.price,
      discountTotal: 0,
      shippingTotal: 25,
      taxTotal: 0,
      feeTotal: 0,
      total: (variant.salePrice || variant.price) + 25,
    },
    overrideAccess: true,
  })
  console.log('Created order id:', order.id, 'orderNumber:', order.orderNumber)

  console.log('\n--- Finalizing order (simulating payment confirmation, as an admin "mark as paid" would) ---')
  const finalized = await finalizeOrder(order.id, {})
  console.log('finalizeOrder result:', finalized)

  const updated = await payload.findByID({ collection: 'orders', id: order.id, depth: 0, overrideAccess: true })
  console.log('\n--- Final order state ---')
  console.log(JSON.stringify({
    id: updated.id,
    orderNumber: updated.orderNumber,
    status: updated.status,
    paymentStatus: updated.paymentStatus,
    pepbossOrderId: (updated as any).pepbossOrderId,
    pepbossStatus: (updated as any).pepbossStatus,
    pepbossSubmissionError: (updated as any).pepbossSubmissionError,
  }, null, 2))

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
