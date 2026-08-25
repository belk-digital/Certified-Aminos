'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export async function toggleWishlistInPayload(productId: string | number, isAdding: boolean, providedVariantSku?: string, providedPriceSnapshot?: number) {
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

    const wishlists = await payload.find({
      collection: 'wishlists',
      req: { payload } as any,
      where: { user: { equals: payloadUser.id } },
      limit: 1,
      overrideAccess: true,
    })

    let priceSnapshot = 0
    if (isAdding) {
      if (providedPriceSnapshot !== undefined) {
        priceSnapshot = providedPriceSnapshot
      } else {
        // Fetch the product to get the accurate price snapshot
        try {
          const product = await payload.findByID({
            collection: 'products',
            id: productId,
          })
          if (product) {
            // Use salePrice if it exists, otherwise regular price. Fallback to 0.
            priceSnapshot = product.salePrice || product.price || 0
          }
        } catch (err) {
          console.warn('Could not fetch product price for snapshot', err)
        }
      }
    }

    let wishlist = wishlists.docs[0]

    if (!wishlist) {
      if (!isAdding) return { success: true }
      // Create new wishlist
      await payload.create({
        collection: 'wishlists',
        req: { payload } as any,
        data: {
          user: payloadUser.id,
          items: [{
            product: (!isNaN(Number(productId)) ? Number(productId) : productId) as any,
            variantSku: providedVariantSku || 'default',
            quantity: 1,
            addedAt: new Date().toISOString(),
            priceSnapshot: priceSnapshot
          }]
        },
        overrideAccess: true,
      })
      return { success: true }
    }

    // Update existing wishlist
    const currentItems = wishlist.items || []
    let newItems = [...currentItems]

    if (isAdding) {
      const exists = currentItems.some(item => {
        const pId = typeof item.product === 'object' ? item.product?.id : item.product
        return String(pId) === String(productId) && (item.variantSku || 'default') === (providedVariantSku || 'default')
      })
      
      if (!exists) {
        newItems.push({
          product: (!isNaN(Number(productId)) ? Number(productId) : productId) as any,
          variantSku: providedVariantSku || 'default',
          quantity: 1,
          addedAt: new Date().toISOString(),
          priceSnapshot: priceSnapshot
        })
      }
    } else {
      newItems = currentItems.filter(item => {
        const pId = typeof item.product === 'object' ? item.product?.id : item.product
        return String(pId) !== String(productId)
      })
    }

    // Update in place rather than deleting when the wishlist empties out — `user` is unique
    // on this collection (one wishlist per user), so the doc would just get recreated on the
    // next add anyway. Deleting-and-recreating on every empty/refill cycle only served to
    // spam the Trashes collection via the global beforeDelete archival hook (payload.config.ts).
    await payload.update({
      collection: 'wishlists',
      id: wishlist.id,
      req: { payload } as any,
      data: {
        // @ts-ignore
        items: newItems
      },
      overrideAccess: true,
    })

    return { success: true }
  } catch (error) {
    console.error('Error toggling wishlist in payload:', error)
    return { success: false, error: 'Internal Server Error' }
  }
}
