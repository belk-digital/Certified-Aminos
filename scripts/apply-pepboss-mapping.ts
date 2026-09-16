import { config } from 'dotenv'
config({ path: '.env' })
config({ path: '.env.local' })

import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

// variant sku -> PepBoss sku, for variants confirmed to match the PepBoss catalog exactly
// (same peptide + same dose).
const SKU_MAP: Record<string, string> = {
  'bpc-157-10mg': 'BC10',
  'tb-500-10mg': 'BT10',
  'bpc-157-tb-500-blend-5mg-5mg': 'BB10',
  'bpc-157-tb-500-blend-10mg-10mg': 'BB20',
  'cjc-1295-no-dac-10mg': 'CND10',
  'dsip-10mg': 'DS10',
  'epithalon-50mg': 'ET50',
  'ahk-cu-100mg': 'ACU100',
  'glow-blend-70mg': 'BBG70',
  'glutathione-600mg': 'GTT',
  'ipamorelin-10mg': 'IP10',
  'kisspeptin-10-10mg': 'KS10',
  'klow-blend-80mg': 'BBKG80',
  'kpv-10mg': 'KP10',
  'mots-c-40mg': 'MS40',
  'melanotan-2-10mg': 'ML10',
  'nad-plus-500mg': 'NJ500',
  'pt-141-10mg': 'P41',
  'retatrutide-20mg': 'RT20',
  'retatrutide-30mg': 'RT30',
  'selank-10mg': 'SK10',
  'semaglutide-20mg': 'SM20',
  'semax-10mg': 'XA10',
  'sermorelin-10mg': 'SMO-10',
  'snap-8-10mg': 'NP810',
  'ss-31-10mg': '2S10',
  'tesamorelin-10mg': 'TSM10',
  'thymosin-alpha-1-10mg': 'TA10',
  'tirzepatide-30mg': 'TR30',
  'tirzepatide-60mg': 'TR60',
  '5-amino-1mq-50mg': '50AM',
  'aod9604-5mg': '5AD',
  'aod9604-10mg': '10AD',
  'ara-290-10mg': 'RA10',
  'igf-1-lr3-1mg': 'IG1',
  'mots-c-10mg': 'MS10',
  'melanotan-1-10mg': 'MT1',
  'nad-plus-1000mg': 'NJ1000',
  'oxytocin-10mg': 'OT10',
  'retatrutide-10mg': 'RT10',
  'semaglutide-30mg': 'SM30',
  'ss-31-50mg': '2S50',
  'tesamorelin-20mg': 'TSM20',
  'cagrilintide-10mg': 'CGL10',
  'vip-10mg': 'VP10',
}

// Variant skus to hide (product keeps other, matching variants visible).
const HIDE_VARIANT_SKUS = new Set([
  'tirzepatide-10mg',
  'tirzepatide-20mg',
  'tb-500-5mg',
  'snap-8-20mg',
  'sermorelin-20mg',
  'semax-30mg',
  'semaglutide-5mg',
  'semaglutide-10mg',
  'retatrutide-60mg',
  'glutathione-1500mg',
  'epithalon-10mg',
  'ipamorelin-5mg',
  'ahk-cu-50mg',
  'bpc-157-5mg',
])

// Whole products to hide (isVisible=false) — every variant is unmatched.
const HIDE_PRODUCT_NAMES = new Set([
  'Lipo-C',
  'HCG',
  'H-Frag',
  'GHRP-6',
  'GHRP-2',
  'Dihexa',
  'GHK-Cu',
  'Tesamorelin / Ipamorelin Blend',
  'Semax / Selank Blend',
  'L-Carnitine',
  'LL-37',
  'CJC-1295 (with DAC)',
])

async function main() {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({ collection: 'products', limit: 500, depth: 0 })

  let skuApplied = 0
  let variantsHidden = 0
  let productsHidden = 0

  for (const p of docs) {
    let changed = false
    const data: any = {}

    if (HIDE_PRODUCT_NAMES.has(p.name)) {
      if (p.isVisible !== false) {
        data.isVisible = false
        changed = true
        productsHidden++
      }
    }

    if (p.hasVariants && Array.isArray(p.variants) && p.variants.length) {
      let variantsChanged = false
      const newVariants = p.variants.map((v: any) => {
        const updated = { ...v }
        if (SKU_MAP[v.sku] && updated.pepbossSku !== SKU_MAP[v.sku]) {
          updated.pepbossSku = SKU_MAP[v.sku]
          variantsChanged = true
          skuApplied++
        }
        if (HIDE_VARIANT_SKUS.has(v.sku) && updated.isVisible !== false) {
          updated.isVisible = false
          variantsChanged = true
          variantsHidden++
        }
        return updated
      })
      if (variantsChanged) {
        data.variants = newVariants
        changed = true
      }
    } else if (!p.hasVariants && SKU_MAP[p.sku || '']) {
      if ((p as any).pepbossSku !== SKU_MAP[p.sku as string]) {
        data.pepbossSku = SKU_MAP[p.sku as string]
        changed = true
        skuApplied++
      }
    }

    if (changed) {
      await payload.update({ collection: 'products', id: p.id, data, overrideAccess: true })
      console.log(`Updated: ${p.name}`, JSON.stringify(data.isVisible !== undefined ? { isVisible: data.isVisible } : { variantsTouched: true }))
    }
  }

  console.log(`\nDone. SKUs applied: ${skuApplied}, variants hidden: ${variantsHidden}, products hidden: ${productsHidden}`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
