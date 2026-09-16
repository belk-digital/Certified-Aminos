import { config } from 'dotenv'
config({ path: '.env' })
config({ path: '.env.local' })

import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function main() {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'products',
    limit: 500,
    depth: 0,
    where: { status: { equals: 'active' } },
  })

  for (const p of docs) {
    if (p.hasVariants && p.variants?.length) {
      for (const v of p.variants) {
        console.log(`${p.name} | variant sku=${v.sku} | pepbossSku=${(v as any).pepbossSku || ''}`)
      }
    } else {
      console.log(`${p.name} | sku=${p.sku || ''} | pepbossSku=${(p as any).pepbossSku || ''}`)
    }
  }

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
