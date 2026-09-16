import { config } from 'dotenv'
config({ path: '.env' })
config({ path: '.env.local' })

import { getWalletBalance, checkAvailability, PepBossError } from '../src/lib/pepboss/client'

async function main() {
  console.log('--- Wallet balance ---')
  try {
    const wallet = await getWalletBalance()
    console.log(JSON.stringify(wallet, null, 2))
  } catch (e: any) {
    console.error('Wallet check failed:', e instanceof PepBossError ? `${e.message} (${e.status})` : e.message)
  }

  console.log('\n--- Availability check (read-only, no order created) ---')
  try {
    const avail = await checkAvailability([{ sku: 'BC10', quantity: 1 }])
    console.log(JSON.stringify(avail, null, 2))
  } catch (e: any) {
    console.error('Availability check failed:', e instanceof PepBossError ? `${e.message} (${e.status})` : e.message)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
