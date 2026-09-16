import { config } from 'dotenv'
config({ path: '.env' })
config({ path: '.env.local' })

import { checkAvailability, createOrder, getOrder, cancelOrder, PepBossError } from '../src/lib/pepboss/client'

const TEST_SKU = 'BC10' // BPC-157 10mg — currently "Available" in the PepBoss catalog

async function main() {
  console.log('--- 1. Checking availability ---')
  const availability = await checkAvailability([{ sku: TEST_SKU, quantity: 1 }])
  console.log(JSON.stringify(availability, null, 2))

  if (!availability.available) {
    console.log('SKU not available — stopping before order creation.')
    return
  }

  console.log('\n--- 2. Creating test order ---')
  const externalOrderId = `web:test:script-${Date.now()}`
  const order = await createOrder({
    externalOrderId,
    recipient: {
      name: 'Research Receiving',
      addressLine1: '100 Lab Way',
      city: 'San Diego',
      region: 'CA',
      postalCode: '92101',
      countryCode: 'US',
    },
    items: [{ sku: TEST_SKU, quantity: 1 }],
    inventoryPolicy: 'require_available',
    idempotencyKey: `${externalOrderId}:v1`,
  })
  console.log(JSON.stringify(order, null, 2))

  console.log('\n--- 3. Fetching order by id ---')
  const fetched = await getOrder(order.id)
  console.log(JSON.stringify(fetched, null, 2))

  console.log('\n--- 4. Cancelling test order ---')
  const cancelled = await cancelOrder(order.id, 'storefront_order_canceled', `${externalOrderId}:cancel:v1`)
  console.log(JSON.stringify(cancelled, null, 2))
}

main().catch((err) => {
  if (err instanceof PepBossError) {
    console.error(`PepBoss API error (${err.status}):`, JSON.stringify(err.body, null, 2))
  } else {
    console.error(err)
  }
  process.exit(1)
})
