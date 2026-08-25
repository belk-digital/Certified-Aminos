import { config } from 'dotenv'
config({ path: '.env' })
config({ path: '.env.local' })

import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import path from 'path'
import fs from 'fs'

const MT1_IMAGE = 'certified-aminos-MT-1-10mg.png'
const RETA_IMAGE = 'certified-aminos-retatrutide-10mg.png'

const productsToSeed = [
  {
    name: 'MT-1',
    slug: 'mt-1',
    imageFile: MT1_IMAGE,
    description: 'Synthetic analog of alpha-MSH used for melanogenesis research studies.',
    categoryName: 'Performance Research',
    price: 179,
    badge: 'POPULAR',
    doses: ['10MG'],
  },
  {
    name: 'Retatrutide',
    slug: 'retatrutide',
    imageFile: RETA_IMAGE,
    description: 'Triple hormone receptor agonist designed for advanced metabolic research.',
    categoryName: 'Weight Research',
    price: 199,
    badge: 'NEW',
    doses: ['5MG', '10MG', '15MG'],
  },
  {
    name: 'BPC-157',
    slug: 'bpc-157',
    imageFile: MT1_IMAGE,
    description: 'Gastric juice peptide studied for its role in accelerated tissue repair and healing.',
    categoryName: 'Recovery Research',
    price: 149,
    badge: 'SALE',
    doses: ['5MG', '10MG'],
  },
  {
    name: 'Semaglutide',
    slug: 'semaglutide',
    imageFile: RETA_IMAGE,
    description: 'GLP-1 receptor agonist widely studied for glycemic regulation and metabolic research.',
    categoryName: 'Weight Research',
    price: 189,
    badge: 'POPULAR',
    doses: ['5MG', '10MG'],
  },
  {
    name: 'Tirzepatide',
    slug: 'tirzepatide',
    imageFile: RETA_IMAGE,
    description: 'Dual GIP/GLP-1 receptor agonist researched for its combined metabolic signaling effects.',
    categoryName: 'Weight Research',
    price: 209,
    doses: ['5MG', '10MG', '15MG'],
  },
  {
    name: 'CJC-1295',
    slug: 'cjc-1295',
    imageFile: MT1_IMAGE,
    description: 'Growth hormone-releasing hormone analog studied for sustained GH secretion research.',
    categoryName: 'Performance Research',
    price: 129,
    doses: ['2MG', '5MG'],
  },
  {
    name: 'Ipamorelin',
    slug: 'ipamorelin',
    imageFile: MT1_IMAGE,
    description: 'Selective growth hormone secretagogue studied for its targeted pulsatile GH release profile.',
    categoryName: 'Performance Research',
    price: 119,
    badge: 'NEW',
    doses: ['2MG', '5MG'],
  },
  {
    name: 'TB-500',
    slug: 'tb-500',
    imageFile: RETA_IMAGE,
    description: 'Synthetic fragment of Thymosin Beta-4 studied for its role in cellular migration and wound healing.',
    categoryName: 'Recovery Research',
    price: 139,
    doses: ['5MG', '10MG'],
  },
]

async function run() {
  const payload = await getPayload({ config: configPromise })
  console.log('--- Seeding demo products ---')

  const categories = await payload.find({ collection: 'categories' })
  const categoryMap: Record<string, string | number> = {}
  for (const cat of categories.docs) {
    categoryMap[cat.name] = cat.id as string | number
  }

  const getOrCreateCategory = async (name: string) => {
    if (categoryMap[name]) return categoryMap[name]
    const newCat = await payload.create({
      collection: 'categories',
      data: {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        isVisible: true,
      } as any,
    })
    categoryMap[name] = newCat.id
    return newCat.id
  }

  for (const p of productsToSeed) {
    console.log(`Processing: ${p.name}`)

    const existing = await payload.find({ collection: 'products', where: { slug: { equals: p.slug } } })
    if (existing.docs.length > 0) {
      console.log(`  Already exists, skipping: ${p.slug}`)
      continue
    }

    const imgPath = path.join(process.cwd(), 'public', 'finalized product images', p.imageFile)
    let mediaId: string | number | null = null

    if (fs.existsSync(imgPath)) {
      const fileData = fs.readFileSync(imgPath)
      const mediaDoc = await payload.create({
        collection: 'media',
        data: { alt: p.name },
        file: {
          data: fileData,
          mimetype: 'image/png',
          name: p.imageFile,
          size: fileData.length,
        },
      })
      mediaId = mediaDoc.id
      console.log(`  Uploaded image: ${p.imageFile}`)
    } else {
      console.warn(`  Image not found: ${imgPath}`)
    }

    const catId = await getOrCreateCategory(p.categoryName)

    await payload.create({
      collection: 'products',
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        status: 'active',
        isVisible: true,
        isBestSeller: true,
        price: p.price,
        stock: 500,
        hasVariants: false,
        categories: [catId as any],
        images: mediaId ? [{ image: mediaId as any }] : [],
        badge: p.badge as any,
        doses: p.doses.map((value) => ({ value })),
      } as any,
    })
    console.log(`  Created product: ${p.name}`)
  }

  console.log('--- Done ---')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
