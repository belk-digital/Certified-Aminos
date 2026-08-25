import { config } from 'dotenv'
config({ path: '.env' })
config({ path: '.env.local' })

import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

// Order matters: the homepage Categories slider shows these 4-at-a-time, in this order.
// The first 4 are the categories with dedicated brand photography (see CATEGORY_IMAGE_BY_NAME
// in CategoriesSection.tsx) so slide 1 always shows real imagery; the rest use fallback art.
const REAL_CATEGORIES = [
  'GLP-1 & Metabolic',
  'Healing & Recovery',
  'Cosmetic & Skin',
  'Sexual & Hormonal',
  'Peptide Bundles',
  'Nasal Sprays',
  'Growth Hormone Secretagogue',
  'Cognitive & Nootropic',
]

// Old placeholder categories created by the demo product seed — replaced by the real taxonomy above.
const OLD_PLACEHOLDER_CATEGORIES = ['Performance Research', 'Weight Research', 'Recovery Research']

const PRODUCT_CATEGORY_MAP: Record<string, string> = {
  'mt-1': 'Cosmetic & Skin',
  retatrutide: 'GLP-1 & Metabolic',
  'bpc-157': 'Healing & Recovery',
  semaglutide: 'GLP-1 & Metabolic',
  tirzepatide: 'GLP-1 & Metabolic',
  'cjc-1295': 'Growth Hormone Secretagogue',
  ipamorelin: 'Growth Hormone Secretagogue',
  'tb-500': 'Healing & Recovery',
}

const slugify = (name: string) => name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

async function run() {
  const payload = await getPayload({ config: configPromise })
  console.log('--- Seeding real category taxonomy ---')

  const categoryIdByName: Record<string, string | number> = {}

  for (let i = 0; i < REAL_CATEGORIES.length; i++) {
    const name = REAL_CATEGORIES[i]
    const existing = await payload.find({ collection: 'categories', where: { name: { equals: name } } })
    if (existing.docs.length > 0) {
      const doc = existing.docs[0]
      await payload.update({
        collection: 'categories',
        id: doc.id,
        data: { isVisible: true, sortOrder: i + 1 },
      })
      categoryIdByName[name] = doc.id
      console.log(`  Updated: ${name}`)
    } else {
      const created = await payload.create({
        collection: 'categories',
        data: {
          name,
          slug: slugify(name),
          isVisible: true,
          sortOrder: i + 1,
        } as any,
      })
      categoryIdByName[name] = created.id
      console.log(`  Created: ${name}`)
    }
  }

  // Reassign seeded demo products to the correct real categories
  for (const [slug, categoryName] of Object.entries(PRODUCT_CATEGORY_MAP)) {
    const catId = categoryIdByName[categoryName]
    if (!catId) continue
    const found = await payload.find({ collection: 'products', where: { slug: { equals: slug } } })
    if (found.docs.length === 0) continue
    await payload.update({
      collection: 'products',
      id: found.docs[0].id,
      data: { categories: [catId as any] },
    })
    console.log(`  Reassigned product "${slug}" -> ${categoryName}`)
  }

  // Remove old placeholder categories now that products point at the real taxonomy
  for (const name of OLD_PLACEHOLDER_CATEGORIES) {
    const existing = await payload.find({ collection: 'categories', where: { name: { equals: name } } })
    for (const doc of existing.docs) {
      await payload.delete({ collection: 'categories', id: doc.id })
      console.log(`  Deleted placeholder category: ${name}`)
    }
  }

  console.log('--- Done ---')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
