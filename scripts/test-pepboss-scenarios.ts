import { config } from 'dotenv'
config({ path: '.env' })
config({ path: '.env.local' })

import { checkAvailability, createOrder, cancelOrder, PepBossError } from '../src/lib/pepboss/client'

const AVAILABLE_SKU = 'BC10' // BPC-157 10mg — Available
const RESTOCKING_SKU = 'AR50' // AICAR 50mg — Restocking (backorder-eligible)
const OUT_OF_STOCK_SKU = 'B12' // B12 — Out of stock (not backorder-eligible per site)

const recipient = {
  name: 'Research Receiving',
  addressLine1: '100 Lab Way',
  city: 'San Diego',
  region: 'CA',
  postalCode: '92101',
  countryCode: 'US',
}

async function section(title: string, fn: () => Promise<void>) {
  console.log(`\n=== ${title} ===`)
  try {
    await fn()
  } catch (err) {
    if (err instanceof PepBossError) {
      console.error(`PepBoss API error (${err.status}):`, JSON.stringify(err.body, null, 2))
    } else {
      console.error(err)
    }
  }
}

async function main() {
  await section('1. Mixed availability check (available + restocking + out-of-stock)', async () => {
    const result = await checkAvailability([
      { sku: AVAILABLE_SKU, quantity: 1 },
      { sku: RESTOCKING_SKU, quantity: 1 },
      { sku: OUT_OF_STOCK_SKU, quantity: 1 },
    ])
    console.log(JSON.stringify(result, null, 2))
  })

  await section('2. Multi-item order (2 different SKUs), require_available', async () => {
    const externalOrderId = `web:test:multi-${Date.now()}`
    const order = await createOrder({
      externalOrderId,
      recipient,
      items: [
        { sku: AVAILABLE_SKU, quantity: 2 },
        { sku: 'BT10', quantity: 1 }, // TB-500 10mg — Available
      ],
      inventoryPolicy: 'require_available',
      idempotencyKey: `${externalOrderId}:v1`,
    })
    console.log('order id:', order.id, 'status:', order.status, 'totalCents:', order.totalCents)
    await cancelOrder(order.id, 'test_cleanup', `${externalOrderId}:cancel:v1`)
    console.log('cleaned up (cancelled)')
  })

  await section('3. Order with an OUT_OF_STOCK item + require_available (expect no order/no debit)', async () => {
    const externalOrderId = `web:test:oos-required-${Date.now()}`
    const order = await createOrder({
      externalOrderId,
      recipient,
      items: [{ sku: OUT_OF_STOCK_SKU, quantity: 1 }],
      inventoryPolicy: 'require_available',
      idempotencyKey: `${externalOrderId}:v1`,
    })
    console.log('UNEXPECTED: order created ->', JSON.stringify(order, null, 2))
  })

  await section('4. Order with an OUT_OF_STOCK item + allow_backorder (expect charged, backordered line)', async () => {
    const externalOrderId = `web:test:oos-backorder-${Date.now()}`
    const order = await createOrder({
      externalOrderId,
      recipient,
      items: [{ sku: OUT_OF_STOCK_SKU, quantity: 1 }],
      inventoryPolicy: 'allow_backorder',
      idempotencyKey: `${externalOrderId}:v1`,
    })
    console.log('order id:', order.id, 'status:', order.status, 'fulfillment:', JSON.stringify(order.fulfillment))
    await cancelOrder(order.id, 'test_cleanup', `${externalOrderId}:cancel:v1`)
    console.log('cleaned up (cancelled)')
  })

  await section('5. Idempotency replay (same key + same body twice)', async () => {
    const externalOrderId = `web:test:idem-${Date.now()}`
    const idempotencyKey = `${externalOrderId}:v1`
    const params = {
      externalOrderId,
      recipient,
      items: [{ sku: AVAILABLE_SKU, quantity: 1 }],
      inventoryPolicy: 'require_available' as const,
      idempotencyKey,
    }
    const first = await createOrder(params)
    const second = await createOrder(params)
    console.log('same order id?', first.id === second.id, first.id, second.id)
    await cancelOrder(first.id, 'test_cleanup', `${externalOrderId}:cancel:v1`)
    console.log('cleaned up (cancelled)')
  })

  await section('6. Idempotency conflict (same key, different body -> expect rejection)', async () => {
    const externalOrderId = `web:test:idem-conflict-${Date.now()}`
    const idempotencyKey = `${externalOrderId}:v1`
    const first = await createOrder({
      externalOrderId,
      recipient,
      items: [{ sku: AVAILABLE_SKU, quantity: 1 }],
      inventoryPolicy: 'require_available',
      idempotencyKey,
    })
    console.log('first order id:', first.id)
    try {
      const second = await createOrder({
        externalOrderId,
        recipient,
        items: [{ sku: AVAILABLE_SKU, quantity: 2 }], // different body, same key
        inventoryPolicy: 'require_available',
        idempotencyKey,
      })
      console.log('UNEXPECTED: second order created ->', second.id)
    } catch (err) {
      if (err instanceof PepBossError) {
        console.log(`EXPECTED rejection (${err.status}):`, JSON.stringify(err.body, null, 2))
      } else {
        throw err
      }
    }
    await cancelOrder(first.id, 'test_cleanup', `${externalOrderId}:cancel:v1`)
    console.log('cleaned up (cancelled)')
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
