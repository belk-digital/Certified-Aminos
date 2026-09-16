import { config } from 'dotenv'
config({ path: '.env' })
config({ path: '.env.local' })

import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

const TARGET_VARIANT_SKU = 'cjc-1295-ipamorelin-blend-5mg-5mg'

async function main() {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'products',
    where: { name: { equals: 'CJC-1295 / Ipamorelin Blend' } },
    limit: 5,
    depth: 0,
  })

  if (docs.length === 0) {
    console.error('Product "CJC-1295 / Ipamorelin Blend" not found')
    process.exit(1)
  }

  for (const p of docs) {
    if (!Array.isArray(p.variants)) continue
    const newVariants = p.variants.map((v: any) =>
      v.sku === TARGET_VARIANT_SKU ? { ...v, isVisible: false } : v
    )
    await payload.update({ collection: 'products', id: p.id, data: { variants: newVariants }, overrideAccess: true })
    console.log(`Hid variant ${TARGET_VARIANT_SKU} on product "${p.name}" (id ${p.id})`)
  }

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
