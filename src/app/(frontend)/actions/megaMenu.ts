'use server'

import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export async function getMegaMenuData() {
  const payload = await getPayload({ config: configPromise })
  const categoriesRes = await payload.find({
    collection: 'categories',
    where: { isVisible: { equals: true } },
    sort: 'sortOrder',
    limit: 100,
    overrideAccess: true,
  })
  
  const categoriesWithProducts = [];
  
  for (const doc of categoriesRes.docs) {
    if (!doc || !doc.id) continue;

    const productsRes = await payload.find({
      collection: 'products',
      where: {
        categories: { in: [doc.id] },
        status: { equals: 'active' },
        isVisible: { equals: true }
      },
      limit: 3,
      overrideAccess: true,
    })

    categoriesWithProducts.push({
      id: doc.id,
      name: doc.name,
      slug: doc.slug,
      products: productsRes.docs.map(prod => {
        let imageUrl = '/placeholder.jpg'
        if (typeof prod.images?.[0]?.image === 'object' && prod.images[0].image?.url) {
          const rawUrl = prod.images[0].image.url
          try {
            if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
              const parsed = new URL(rawUrl)
              parsed.pathname = parsed.pathname.split('/').map((s: string) => encodeURIComponent(decodeURIComponent(s))).join('/')
              imageUrl = parsed.toString()
            } else {
              imageUrl = rawUrl.split('/').map((s: string) => encodeURIComponent(decodeURIComponent(s))).join('/')
            }
          } catch (e) {
            imageUrl = rawUrl
          }
        }
        
        // Fallback to variant images if no global image exists
        if (imageUrl === '/placeholder.jpg' && prod.hasVariants && prod.variants && prod.variants.length > 0) {
          for (const variant of prod.variants) {
            if (variant.images && variant.images.length > 0 && typeof variant.images[0].image === 'object' && variant.images[0].image?.url) {
              const rawUrl = variant.images[0].image.url
              try {
                if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
                  const parsed = new URL(rawUrl)
                  parsed.pathname = parsed.pathname.split('/').map((s: string) => encodeURIComponent(decodeURIComponent(s))).join('/')
                  imageUrl = parsed.toString()
                } else {
                  imageUrl = rawUrl.split('/').map((s: string) => encodeURIComponent(decodeURIComponent(s))).join('/')
                }
              } catch (e) {
                imageUrl = rawUrl
              }
              break
            }
          }
        }
        return {
          name: prod.name,
          slug: prod.slug,
          image: imageUrl,
          price: prod.price
        }
      })
    })
  }

  return categoriesWithProducts;
}
