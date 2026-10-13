import { config } from 'dotenv'
config({ path: '.env' })
config({ path: '.env.local' })

import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

// Re-shape the 2026-10-13 client price update so the storefront shows the
// original price struck through next to the new discounted price (like the
// "LIVAGEN $69.00 -> $41.40" reference). Variant `price` becomes the old
// regular price again; `salePrice` becomes the new price.
// GHK-Cu 100MG (price went UP) and Bacteriostatic Water (previously $0,
// unpriced) are intentionally excluded — those aren't genuine discounts.
const UPDATES: Record<string, Record<string, { price: number; salePrice: number }>> = {
  'Semaglutide': {
    '20MG': { price: 279, salePrice: 119 },
    '30MG': { price: 349, salePrice: 169 },
  },
  'GLP-1TRZ': {
    '30MG': { price: 339, salePrice: 149 },
    '60MG': { price: 469, salePrice: 199 },
  },
  'GLP-3RTA': {
    '10MG': { price: 179, salePrice: 119 },
    '20MG': { price: 249, salePrice: 159 },
    '30MG': { price: 309, salePrice: 189 },
  },
  'BPC-157': {
    '10MG': { price: 89, salePrice: 79 },
  },
  'TB-500': {
    '10MG': { price: 109, salePrice: 95 },
  },
  'BPC-157 / TB-500 Blend': {
    '5MG/5MG': { price: 129, salePrice: 109 },
    '10MG/10MG': { price: 199, salePrice: 149 },
  },
  'Glow Blend': { SINGLE: { price: 179, salePrice: 129 } },
  'Klow Blend': { SINGLE: { price: 199, salePrice: 149 } },
  'Ipamorelin': {
    '10MG': { price: 89, salePrice: 79 },
  },
  'NAD+': {
    '1000MG': { price: 139, salePrice: 129 },
  },
  'MOTS-c': {
    '10MG': { price: 69, salePrice: 59 },
    '40MG': { price: 199, salePrice: 169 },
  },
  'PT-141': { SINGLE: { price: 75, salePrice: 69 } },
}

async function run() {
  const payload = await getPayload({ config: configPromise })

  const report: string[] = []

  for (const [name, variantUpdates] of Object.entries(UPDATES)) {
    const found = await payload.find({
      collection: 'products',
      where: { name: { equals: name } },
      limit: 1,
      depth: 0,
    })

    if (found.docs.length === 0) {
      report.push(`MISSING PRODUCT: ${name}`)
      continue
    }

    const doc = found.docs[0] as any
    const variants = Array.isArray(doc.variants) ? [...doc.variants] : []

    if (variants.length === 0) {
      report.push(`SKIPPED (no variants): ${name}`)
      continue
    }

    const keys = Object.keys(variantUpdates)
    const isSingleUpdate = keys.length === 1 && keys[0] === 'SINGLE'

    let changed = 0

    if (isSingleUpdate) {
      if (variants.length !== 1) {
        report.push(`AMBIGUOUS (expected 1 variant, found ${variants.length}): ${name}`)
      } else {
        const { price, salePrice } = variantUpdates.SINGLE
        const old = variants[0]
        variants[0] = { ...old, price, salePrice }
        report.push(`${name}: price $${old.price} -> $${price}, salePrice -> $${salePrice}`)
        changed++
      }
    } else {
      for (const [doseKey, vals] of Object.entries(variantUpdates)) {
        const idx = variants.findIndex((v: any) =>
          (v.options || []).some((o: any) => String(o.value).toUpperCase().trim() === doseKey)
        )
        if (idx === -1) {
          report.push(`DOSE NOT FOUND (${doseKey}) on ${name}`)
          continue
        }
        const old = variants[idx]
        variants[idx] = { ...old, price: vals.price, salePrice: vals.salePrice }
        report.push(`${name} ${doseKey}: price $${old.price} -> $${vals.price}, salePrice -> $${vals.salePrice}`)
        changed++
      }
    }

    if (changed === 0) continue

    await payload.update({
      collection: 'products',
      id: doc.id,
      data: { variants } as any,
    })
  }

  console.log('\n=== Sale Display Update Report ===')
  report.forEach((line) => console.log(line))

  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
