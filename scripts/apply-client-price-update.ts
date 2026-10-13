import { config } from 'dotenv'
config({ path: '.env' })
config({ path: '.env.local' })

import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

// New retail prices from the client's 2026-10-13 price sheet.
// Each entry: product name (as stored in DB) -> variant price updates keyed by
// the dose option value (or 'SINGLE' for single-variant products).
const UPDATES: Record<string, Record<string, number>> = {
  'Semaglutide': { '20MG': 119, '30MG': 169 },
  'GLP-1TRZ': { '30MG': 149, '60MG': 199 },
  'GLP-3RTA': { '10MG': 119, '20MG': 159, '30MG': 189 },
  'BPC-157': { '10MG': 79 },
  'TB-500': { '10MG': 95 },
  'BPC-157 / TB-500 Blend': { '5MG/5MG': 109, '10MG/10MG': 149 },
  'Glow Blend': { SINGLE: 129 },
  'Klow Blend': { SINGLE: 149 },
  'Ipamorelin': { '10MG': 79 },
  'NAD+': { '1000MG': 129 },
  'MOTS-c': { '10MG': 59, '40MG': 169 },
  'PT-141': { SINGLE: 69 },
  'GHK-Cu': { '100MG': 110 },
  'Bacteriostatic Water': { SINGLE: 18 },
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

    const singleKey = Object.keys(variantUpdates)[0]
    const isSingleUpdate = singleKey === 'SINGLE' && Object.keys(variantUpdates).length === 1

    let changed = 0

    if (isSingleUpdate) {
      if (variants.length !== 1) {
        report.push(`AMBIGUOUS (expected 1 variant, found ${variants.length}): ${name}`)
      } else {
        const oldPrice = variants[0].price
        variants[0] = { ...variants[0], price: variantUpdates.SINGLE }
        report.push(`${name}: $${oldPrice} -> $${variantUpdates.SINGLE}`)
        changed++
      }
    } else {
      for (const [doseKey, newPrice] of Object.entries(variantUpdates)) {
        const idx = variants.findIndex((v: any) =>
          (v.options || []).some((o: any) => String(o.value).toUpperCase().trim() === doseKey)
        )
        if (idx === -1) {
          report.push(`DOSE NOT FOUND (${doseKey}) on ${name}`)
          continue
        }
        const oldPrice = variants[idx].price
        variants[idx] = { ...variants[idx], price: newPrice }
        report.push(`${name} ${doseKey}: $${oldPrice} -> $${newPrice}`)
        changed++
      }
    }

    if (changed === 0) continue

    const newMinPrice = Math.min(...variants.map((v: any) => v.price))
    const oldTopPrice = doc.price

    await payload.update({
      collection: 'products',
      id: doc.id,
      data: {
        variants,
        price: newMinPrice,
      } as any,
    })

    if (newMinPrice !== oldTopPrice) {
      report.push(`   (base "price" field updated: $${oldTopPrice} -> $${newMinPrice})`)
    }
  }

  console.log('\n=== Price Update Report ===')
  report.forEach((line) => console.log(line))

  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
