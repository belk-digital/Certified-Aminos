'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { CartLine } from '@/lib/cart/store'

export async function syncCartToPayload(items: CartLine[]) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    if (!userId) return { success: false, error: 'Not authenticated' }

    const payload = await getPayload({ config: configPromise })

    const payloadUser = await payload.findByID({
      collection: 'users',
      id: userId,
      overrideAccess: true,
    }).catch(() => null)
    if (!payloadUser) return { success: false, error: 'User not found' }

    const carts = await payload.find({
      collection: 'carts',
      req: { payload } as any,
      where: { user: { equals: payloadUser.id } },
      limit: 1,
      overrideAccess: true,
    })

    const mappedItems = items.map(item => ({
      product: (!isNaN(Number(item.productId)) ? Number(item.productId) : item.productId) as any,
      variantSku: item.variantSku || 'default',
      variantTitle: item.variantTitle || null,
      quantity: item.quantity,
      priceSnapshot: item.priceSnapshot,
      addedAt: new Date().toISOString(),
    }))

    let cart = carts.docs[0]

    if (!cart) {
      if (mappedItems.length === 0) return { success: true }
      
      // Create new cart
      await payload.create({
        collection: 'carts',
        req: { payload } as any,
        data: {
          user: payloadUser.id,
          // @ts-ignore
          items: mappedItems
        },
        overrideAccess: true,
      })
      return { success: true }
    }

    // Update in place rather than deleting when the cart empties out — `user` is unique on
    // this collection (one cart per user), so the doc would just get recreated on the next
    // add anyway. Deleting-and-recreating on every empty/refill cycle only served to spam
    // the Trashes collection via the global beforeDelete archival hook (payload.config.ts).
    await payload.update({
      collection: 'carts',
      id: cart.id,
      req: { payload } as any,
      data: {
        // @ts-ignore
        items: mappedItems
      },
      overrideAccess: true,
    })

    return { success: true }
  } catch (error) {
    console.error('Error syncing cart to payload:', error)
    return { success: false, error: 'Internal Server Error' }
  }
}

export async function revalidateCartPrices(items: CartLine[]): Promise<CartLine[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    const updatedItems = await Promise.all(items.map(async (item) => {
      try {
        let product;
        try {
          product = await payload.findByID({
            collection: 'products',
            id: (!isNaN(Number(item.productId)) ? Number(item.productId) : item.productId) as any,
            depth: 0,
          })
        } catch (findErr) {
          console.warn(`Product not found during revalidation for ID: ${item.productId}`)
          return item;
        }
        if (!product) return item

        let livePrice = item.priceSnapshot

        // 1. Check Bulk Bundles
        if (product.bulkBundles && product.bulkBundles.length > 0) {
          let matchedBundlePrice = null;

          // Check dynamic composite SKU first (e.g. "10mg - Kit of 5")
          if (product.variants) {
            for (const v of product.variants) {
              const vTitle = v.options?.map((o: any) => o.value).join(' ') || `Variant ${v.sku}`;
              for (const b of product.bulkBundles) {
                const expectedSkuTitle = `${vTitle} - ${b.name}`;
                const expectedSkuBase = `${v.sku} - ${b.name}`;
                const expectedSkuVariant = `Variant - ${b.name}`;

                if (item.variantSku === expectedSkuTitle || item.variantSku === expectedSkuBase || item.variantSku === expectedSkuVariant) {
                  // 1st priority: Explicit Variant Overrides
                  const override = b.variantOverrides?.find((vo: any) => vo.variantSku === v.sku || vo.variantSku === vTitle);
                  if (override) {
                    matchedBundlePrice = override.salePrice || override.price;
                    break;
                  }

                  // 2nd priority: Dynamic Percentage
                  if (typeof b.discountPercentage === 'number' && b.discountPercentage > 0) {
                    const vPrice = typeof v.price === 'number' ? v.price : parseFloat(String(v.price).replace(/[^0-9.]/g, ''));
                    const vSale = v.salePrice ? (typeof v.salePrice === 'number' ? v.salePrice : parseFloat(String(v.salePrice).replace(/[^0-9.]/g, ''))) : null;
                    const basePrice = vSale || vPrice;
                    matchedBundlePrice = (basePrice * b.quantity) * (1 - (b.discountPercentage / 100));
                    break;
                  }
                }
              }
              if (matchedBundlePrice !== null) break;
            }
          }

          if (matchedBundlePrice !== null) {
            return { ...item, priceSnapshot: matchedBundlePrice };
          }

          // Check legacy hardcoded bundles
          const bundle = product.bulkBundles.find(b => b.name === item.variantSku)
          if (bundle) {
            const bPrice = typeof bundle.price === 'number' ? bundle.price : parseFloat(String(bundle.price || 0).replace(/[^0-9.]/g, ''))
            const bSale = bundle.salePrice ? (typeof bundle.salePrice === 'number' ? bundle.salePrice : parseFloat(String(bundle.salePrice).replace(/[^0-9.]/g, ''))) : null
            livePrice = bSale || bPrice
            return { ...item, priceSnapshot: livePrice }
          }
        }

        // 2. Check Variants
        if (product.variants && product.variants.length > 0) {
          const variant = product.variants.find((v: any) => {
            const computedTitle = v.options?.map((o: any) => o.value).join(' ') || `Variant ${v.sku}`
            return computedTitle === item.variantSku || v.sku === item.variantSku
          })
          if (variant) {
            const vPrice = typeof variant.price === 'number' ? variant.price : parseFloat(String(variant.price).replace(/[^0-9.]/g, ''))
            const vSale = variant.salePrice ? (typeof variant.salePrice === 'number' ? variant.salePrice : parseFloat(String(variant.salePrice).replace(/[^0-9.]/g, ''))) : null
            livePrice = vSale || vPrice
            return { ...item, priceSnapshot: livePrice }
          }
        }

        // 3. Fallback to base product price
        const pPrice = typeof product.price === 'number' ? product.price : parseFloat(String(product.price).replace(/[^0-9.]/g, ''))
        const pSale = product.salePrice ? (typeof product.salePrice === 'number' ? product.salePrice : parseFloat(String(product.salePrice).replace(/[^0-9.]/g, ''))) : null
        livePrice = pSale || pPrice

        return { ...item, priceSnapshot: livePrice }
      } catch (err) {
        console.error('Error revalidating individual item:', err)
        throw new Error('Failed to revalidate item price due to an internal error.')
      }
    }))
    
    return updatedItems
  } catch (error) {
    console.error('Error revalidating cart prices:', error)
    throw new Error('Critical failure during cart price revalidation.')
  }
}

/**
 * Fetches the current price/stock for the two required-accessory products (BAC water's
 * 30ML variant, and the needles product) so the cart store can silently add them whenever
 * a peptide product is added. Always reads fresh from Payload rather than caching, since
 * these prices can change independently of whatever page the shopper is currently on.
 */
export async function getAutoAddAccessoryItems(): Promise<{
  bacWater: Omit<CartLine, 'lineId' | 'quantity'> | null
  needles: Omit<CartLine, 'lineId' | 'quantity'> | null
}> {
  try {
    const payload = await getPayload({ config: configPromise })

    // depth: 1 so `images[].image` (and variant images) resolve to populated media docs
    // with a usable `.url` — depth: 0 would leave them as bare numeric IDs, which is why
    // the cart line images broke.
    const [bacWaterRes, needlesRes] = await Promise.all([
      payload.find({ collection: 'products', where: { slug: { equals: 'bac-water' } }, limit: 1, depth: 1 }),
      payload.find({ collection: 'products', where: { slug: { equals: '10-needles' } }, limit: 1, depth: 1 }),
    ])

    let bacWater: Omit<CartLine, 'lineId' | 'quantity'> | null = null
    const bacProduct = bacWaterRes.docs[0]
    console.log('BAC AUTO-ADD DEBUG: bacWaterRes docs length:', bacWaterRes.docs.length)
    if (bacProduct) {
      console.log('BAC AUTO-ADD DEBUG: Found BAC product, variants length:', bacProduct.variants?.length)
      const variant = bacProduct.variants?.find((v: any) => {
        const sku = (v.sku || '').toUpperCase()
        return sku === 'BACK-WATER-30ML' || sku === 'BAC-WATER-30ML' || sku === 'BACWAT-30ML'
      }) || (bacProduct.variants && bacProduct.variants.length > 0 ? bacProduct.variants[bacProduct.variants.length - 1] : null)
      
      console.log('BAC AUTO-ADD DEBUG: Selected variant:', variant ? variant.sku : 'none')
      if (variant) {
        const vPrice = typeof variant.price === 'number' ? variant.price : parseFloat(String(variant.price).replace(/[^0-9.]/g, ''))
        const vSale = variant.salePrice ? (typeof variant.salePrice === 'number' ? variant.salePrice : parseFloat(String(variant.salePrice).replace(/[^0-9.]/g, ''))) : null
        const variantTitle = variant.options?.map((o: any) => o.value).join(' ') || `Variant ${variant.sku}`
        bacWater = {
          productId: String(bacProduct.id),
          variantSku: variant.sku,
          variantTitle,
          priceSnapshot: vSale || vPrice,
          product: {
            id: String(bacProduct.id),
            name: bacProduct.name,
            slug: bacProduct.slug,
            imageUrl: (variant.images?.[0]?.image as any)?.url || (bacProduct.images?.[0]?.image as any)?.url || '/placeholder.png',
          },
        }
        console.log('BAC AUTO-ADD DEBUG: Built bacWater object:', bacWater.variantSku)
      }
    } else {
      console.log('BAC AUTO-ADD DEBUG: bacProduct is undefined!')
    }

    let needles: Omit<CartLine, 'lineId' | 'quantity'> | null = null
    const needlesProduct = needlesRes.docs[0]
    if (needlesProduct) {
      const pPrice = typeof needlesProduct.price === 'number' ? needlesProduct.price : parseFloat(String(needlesProduct.price).replace(/[^0-9.]/g, ''))
      const pSale = needlesProduct.salePrice ? (typeof needlesProduct.salePrice === 'number' ? needlesProduct.salePrice : parseFloat(String(needlesProduct.salePrice).replace(/[^0-9.]/g, ''))) : null
      needles = {
        productId: String(needlesProduct.id),
        variantSku: needlesProduct.sku || '10-NEEDLES',
        variantTitle: null,
        priceSnapshot: pSale || pPrice,
        product: {
          id: String(needlesProduct.id),
          name: needlesProduct.name,
          slug: needlesProduct.slug,
          imageUrl: (needlesProduct.images?.[0]?.image as any)?.url || '/placeholder.png',
        },
      }
    }

    return { bacWater, needles }
  } catch (error) {
    console.error('Error fetching auto-add accessory items:', error)
    return { bacWater: null, needles: null }
  }
}

export async function getProductsFromAffiliateCart(cartParam: string): Promise<CartLine[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    const entries = cartParam.split(',')
    const items: CartLine[] = []

    for (const entry of entries) {
      const parts = entry.split(':')
      if (parts.length >= 3) {
        const slug = parts[0]
        const sku = parts.slice(1, -1).join(':') // in case sku has colons, though unlikely
        const qty = parseInt(parts[parts.length - 1], 10)

        if (!isNaN(qty) && qty > 0) {
          // depth: 1 so `images[].image` (and variant images) resolve to populated media
          // docs with a usable `.url` — depth: 0 would leave them as bare numeric IDs.
          const productRes = await payload.find({
            collection: 'products',
            where: { slug: { equals: slug } },
            limit: 1,
            depth: 1,
          })

          const product = productRes.docs[0]
          if (product) {
            let matchedPrice = typeof product.price === 'number' ? product.price : parseFloat(String(product.price).replace(/[^0-9.]/g, ''))
            let matchedSale = product.salePrice ? (typeof product.salePrice === 'number' ? product.salePrice : parseFloat(String(product.salePrice).replace(/[^0-9.]/g, ''))) : null
            let finalTitle = sku
            let finalSku = sku
            let variantImageUrl: string | undefined

            // If it's a variable product, find the variant by SKU
            if (product.variants && product.variants.length > 0) {
              const variant = product.variants.find((v: any) => v.sku === sku)
              if (variant) {
                const vPrice = typeof variant.price === 'number' ? variant.price : parseFloat(String(variant.price).replace(/[^0-9.]/g, ''))
                const vSale = variant.salePrice ? (typeof variant.salePrice === 'number' ? variant.salePrice : parseFloat(String(variant.salePrice).replace(/[^0-9.]/g, ''))) : null
                matchedPrice = vPrice
                matchedSale = vSale
                finalTitle = variant.options?.map((o: any) => o.value).join(' ') || `Variant ${variant.sku}`
                variantImageUrl = (variant.images?.[0]?.image as any)?.url
              }
            } else if (product.bulkBundles && product.bulkBundles.length > 0) {
              // It could be a bundle SKU
              const bundle = product.bulkBundles.find((b: any) => b.name === sku)
              if (bundle) {
                 const bPrice = typeof bundle.price === 'number' ? bundle.price : parseFloat(String(bundle.price || 0).replace(/[^0-9.]/g, ''))
                 const bSale = bundle.salePrice ? (typeof bundle.salePrice === 'number' ? bundle.salePrice : parseFloat(String(bundle.salePrice).replace(/[^0-9.]/g, ''))) : null
                 matchedPrice = bPrice
                 matchedSale = bSale
                 finalTitle = bundle.name
              }
            }

            const livePrice = matchedSale || matchedPrice

            items.push({
              lineId: `${product.id}-${finalSku}-${Date.now()}-${Math.random()}`,
              productId: String(product.id),
              product: {
                id: product.id,
                slug: product.slug,
                name: product.name,
                imageUrl: variantImageUrl || (product.images?.[0]?.image as any)?.url || '/placeholder.png'
              } as any,
              variantSku: finalSku,
              variantTitle: finalTitle,
              priceSnapshot: livePrice,
              quantity: qty
            })
          }
        }
      }
    }
    return items
  } catch (error) {
    console.error('Error fetching affiliate cart products:', error)
    return []
  }
}

