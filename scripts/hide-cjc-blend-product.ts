import { config } from 'dotenv'
config({ path: '.env' })
config({ path: '.env.local' })

import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function main() {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'products',
    where: { name: { equals: 'CJC-1295 / Ipamorelin Blend' } },
    limit: 5,
    depth: 0,
  })
  for (const p of docs) {
    await payload.update({ collection: 'products', id: p.id, data: { isVisible: false }, overrideAccess: true })
    console.log(`Hid product "${p.name}" (id ${p.id})`)
  }
  process.exit(0)
}
main().catch((err) => { console.error(err); process.exit(1) })
