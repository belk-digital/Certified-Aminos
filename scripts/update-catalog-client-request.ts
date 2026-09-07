import { config } from 'dotenv'
config({ path: '.env' })
config({ path: '.env.local' })

import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

// Client's requested "main sellers" order — highest sortOrder shows first.
// (Products.sortOrder field + shop/homepage sort: ['-sortOrder', '-createdAt'])
const MAIN_SELLER_SLUGS_IN_ORDER = [
  'retatrutide',
  'glow-blend',
  'klow-blend',
  'tirzepatide',
  'semaglutide',
  'tesamorelin',
  'bpc-157',
  'tb-500',
  'bpc-157-tb-500-blend',
  'ghk-cu',
  'nad-plus',
  'pt-141',
  'mots-c',
  'cjc-1295-ipamorelin-blend',
  'ipamorelin',
]

const RENAMES: { slug: string; name: string }[] = [
  { slug: 'sermorelin', name: 'Sermorelin Acetate' },
  { slug: 'oxytocin', name: 'Oxytocin Acetate' },
]

// Client described these blends by itemized component amounts rather than a single
// combined-total dose label — relabel the dose text (display only, no price/stock change).
const DOSE_RELABELS: { slug: string; oldDose: string; newDose: string }[] = [
  { slug: 'glow-blend', oldDose: '70MG', newDose: 'TB-500 10mg + BPC-157 10mg + GHK-Cu 50mg' },
  { slug: 'klow-blend', oldDose: '80MG', newDose: 'TB-500 10mg + BPC-157 10mg + GHK-Cu 50mg + KPV 10mg' },
]

// New SKUs the client asked for that don't exist yet. Real pricing/images are still needed
// from the client, so these are seeded as hidden drafts (isVisible: false, status: draft,
// price 0) rather than going live with placeholder data.
const DRAFT_PRODUCTS = [
  { name: 'Melatonin', slug: 'melatonin', dose: '10MG' },
  { name: 'Bacteriostatic Water', slug: 'bacteriostatic-water', dose: '10ML' },
  { name: 'Sterile Water', slug: 'sterile-water', dose: '10ML' },
  { name: 'B12', slug: 'b12', dose: '10ML' },
]

async function run() {
  const payload = await getPayload({ config: configPromise })

  console.log('--- Setting main-seller sortOrder (highest = first) ---')
  const total = MAIN_SELLER_SLUGS_IN_ORDER.length
  for (let i = 0; i < total; i++) {
    const slug = MAIN_SELLER_SLUGS_IN_ORDER[i]
    const sortOrder = (total - i) * 10 // 150, 140, ... 10
    const found = await payload.find({ collection: 'products', where: { slug: { equals: slug } }, limit: 1 })
    if (found.docs.length === 0) {
      console.warn(`  NOT FOUND, skipping: ${slug}`)
      continue
    }
    await payload.update({
      collection: 'products',
      id: found.docs[0].id,
      data: { sortOrder, isBestSeller: true } as any,
    })
    console.log(`  ${slug} -> sortOrder ${sortOrder}`)
  }

  console.log('\n--- Applying name changes ---')
  for (const r of RENAMES) {
    const found = await payload.find({ collection: 'products', where: { slug: { equals: r.slug } }, limit: 1 })
    if (found.docs.length === 0) {
      console.warn(`  NOT FOUND, skipping: ${r.slug}`)
      continue
    }
    await payload.update({
      collection: 'products',
      id: found.docs[0].id,
      data: { name: r.name } as any,
    })
    console.log(`  ${r.slug} -> "${r.name}"`)
  }

  console.log('\n--- Relabeling blend dose text ---')
  for (const d of DOSE_RELABELS) {
    const found = await payload.find({ collection: 'products', where: { slug: { equals: d.slug } }, limit: 1 })
    if (found.docs.length === 0) {
      console.warn(`  NOT FOUND, skipping: ${d.slug}`)
      continue
    }
    const doc = found.docs[0] as any
    const variants = (doc.variants || []).map((v: any) => ({
      ...v,
      options: (v.options || []).map((o: any) =>
        o.key === 'Dose' && o.value === d.oldDose ? { ...o, value: d.newDose } : o
      ),
    }))
    const doses = (doc.doses || []).map((dz: any) => (dz.value === d.oldDose ? { ...dz, value: d.newDose } : dz))
    await payload.update({
      collection: 'products',
      id: doc.id,
      data: { variants, doses } as any,
    })
    console.log(`  ${d.slug}: "${d.oldDose}" -> "${d.newDose}"`)
  }

  console.log('\n--- Adding missing products as hidden drafts (need price/image from client) ---')
  for (const p of DRAFT_PRODUCTS) {
    const existing = await payload.find({ collection: 'products', where: { slug: { equals: p.slug } }, limit: 1 })
    if (existing.docs.length > 0) {
      console.log(`  Already exists, skipping: ${p.slug}`)
      continue
    }
    await payload.create({
      collection: 'products',
      data: {
        name: p.name,
        slug: p.slug,
        status: 'draft',
        isVisible: false,
        price: 0,
        stock: 0,
        hasVariants: true,
        variants: [
          {
            sku: `${p.slug}-${p.dose}`.toLowerCase(),
            isKit: false,
            images: [],
            price: 0,
            stock: 0,
            options: [{ key: 'Dose', value: p.dose }],
          },
        ],
        doses: [{ value: p.dose }],
      } as any,
    })
    console.log(`  Created draft: ${p.name} (needs price + image before publishing)`)
  }

  console.log('\n--- Done ---')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
