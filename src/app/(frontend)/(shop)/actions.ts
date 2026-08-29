'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getPayloadUser } from '@/lib/auth/getPayloadUser'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { getLocale } from 'next-intl/server'
import { getCategoryDisplayName } from '@/lib/categoryDisplay'

export async function addToCart(productId: string | number, quantity: number = 1, providedVariantSku?: string, providedPriceSnapshot?: number, providedVariantTitle?: string) {
  try {
    const user = await getPayloadUser()
    if (!user) return { success: false, error: 'Must be logged in to add to cart' }

    const payload = await getPayload({ config: configPromise })

    // Fetch product details to get variantSku and priceSnapshot
    const product = await payload.findByID({ collection: 'products', id: productId as any })
    if (!product) return { success: false, error: 'Product not found' }

    // Normalize the product ID to a number so relationship fields and comparisons work
    const numericProductId = Number(product.id)

    const variantSku = providedVariantSku || product.sku || (product.variants && product.variants[0]?.sku) || `${product.id}`
    const priceSnapshot = providedPriceSnapshot !== undefined ? providedPriceSnapshot : (typeof product.salePrice === 'number' ? product.salePrice : (typeof product.price === 'number' ? product.price : 0))

    // Find existing cart — depth:0 so product comes back as raw ID
    const existingCarts = await payload.find({
      collection: 'carts',
      where: { user: { equals: user.id } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    let cart = existingCarts.docs[0]
    
    if (!cart) {
      cart = await payload.create({
        collection: 'carts',
        data: {
          user: user.id,
          items: [{
            product: numericProductId as any,
            variantSku,
            variantTitle: providedVariantTitle || null,
            quantity,
            priceSnapshot,
            addedAt: new Date().toISOString(),
          }],
        },
        overrideAccess: true,
      })
    } else {
      const items = (cart.items || []).map((i: any) => ({
        product: Number(typeof i.product === 'object' ? i.product.id : i.product),
        variantSku: String(i.variantSku ?? ''),
        variantTitle: i.variantTitle ?? null,
        quantity: Number(i.quantity ?? 1),
        priceSnapshot: Number(i.priceSnapshot ?? 0),
      }))

      const existingItemIndex = items.findIndex((i) =>
        i.product === numericProductId && i.variantSku === variantSku
      )

      if (existingItemIndex > -1) {
        items[existingItemIndex].quantity += quantity
        if (providedVariantTitle) items[existingItemIndex].variantTitle = providedVariantTitle
      } else {
        items.push({ product: numericProductId, quantity, variantSku, variantTitle: providedVariantTitle || null, priceSnapshot })
      }

      cart = await payload.update({
        collection: 'carts',
        id: cart.id,
        data: { items: items as any },
        overrideAccess: true,
      })
    }

    revalidatePath('/shop')
    revalidatePath('/cart')
    return { success: true, message: 'Added to cart' }
  } catch (error: any) {
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}

export async function addToWishlist(productId: string | number, providedVariantSku?: string, providedPriceSnapshot?: number) {
  try {
    const user = await getPayloadUser()
    if (!user) return { success: false, error: 'Must be logged in to add to wishlist' }

    const payload = await getPayload({ config: configPromise })

    // Fetch product details for SKU and price snapshot
    const product = await payload.findByID({ collection: 'products', id: productId as any })
    if (!product) return { success: false, error: 'Product not found' }

    // Normalize the product ID to a number so comparisons never fail due to type mismatch
    const numericProductId = Number(product.id)

    const variantSku = providedVariantSku || product.sku || (product.variants && product.variants[0]?.sku) || `${product.id}`;
    const priceSnapshot = providedPriceSnapshot !== undefined ? providedPriceSnapshot : (typeof product.salePrice === 'number' ? product.salePrice : (typeof product.price === 'number' ? product.price : 0));

    // Find existing wishlist — use depth:0 so product fields come back as raw IDs, not populated objects
    const existingLists = await payload.find({
      collection: 'wishlists',
      where: { user: { equals: user.id } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    let list = existingLists.docs[0]

    if (!list) {
      // First wishlist for this user — create it
      list = await payload.create({
        collection: 'wishlists',
        data: {
          user: user.id,
          items: [{
            product: numericProductId as any,
            variantSku,
            quantity: 1,
            priceSnapshot,
            addedAt: new Date().toISOString(),
          }],
        },
        overrideAccess: true,
      })
    } else {
      const items: Array<{ product: number; variantSku: string; quantity: number; priceSnapshot: number; addedAt: string }> = (list.items || []).map((i: any) => ({
        product: Number(typeof i.product === 'object' ? i.product.id : i.product),
        variantSku: String(i.variantSku ?? ''),
        quantity: Number(i.quantity ?? 1),
        priceSnapshot: Number(i.priceSnapshot ?? 0),
        addedAt: i.addedAt ? String(i.addedAt) : new Date().toISOString(),
      }))

      // Check for duplicate using normalized numeric IDs
      const alreadyExists = items.some((i) => i.product === numericProductId)
      if (alreadyExists) {
        revalidatePath('/shop')
        revalidatePath('/wishlist')
        return { success: false, error: 'Product is already in your wishlist' }
      }

      items.push({
        product: numericProductId,
        variantSku,
        quantity: 1,
        priceSnapshot,
        addedAt: new Date().toISOString(),
      })

      list = await payload.update({
        collection: 'wishlists',
        id: list.id,
        data: { items: items as any },
        overrideAccess: true,
      })
    }

    revalidatePath('/shop')
    revalidatePath('/wishlist')
    return { success: true, message: 'Added to wishlist' }
  } catch (error: any) {
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}

async function calculateCartTotals(cartItems: any[], payload: any, coupon?: any) {
  let eligibleSubtotal = 0;
  let totalSubtotal = 0;
  const ineligibleReasons = new Set<string>();

  for (const item of cartItems) {
    let product = item.product;
    if (typeof product !== 'object' || product === null) {
      product = await payload.findByID({ collection: 'products', id: product as number });
    }
    const itemPrice = typeof item.priceSnapshot === 'number' 
      ? item.priceSnapshot 
      : (typeof product.salePrice === 'number' ? product.salePrice : (typeof product.price === 'number' ? product.price : 0));
    const itemQuantity = item.quantity || 1;
    const itemTotal = itemPrice * itemQuantity;
    totalSubtotal += itemTotal;

    if (coupon) {
      let eligible = true;
      if (coupon.excludeSaleItems && typeof product.salePrice === 'number' && product.salePrice > 0) {
        eligible = false;
        ineligibleReasons.add('sale_excluded');
      }

      // Check applicableProductTypes (Singles vs Kits)
      if (coupon.applicableProductTypes && coupon.applicableProductTypes !== 'all') {
        const matchedVariant = Array.isArray(product.variants)
          ? product.variants.find((v: any) => v.sku === item.variantSku)
          : null;

        // A variant is a Kit if 'isKit' is true, or falls back to legacy " - " bundle check
        const isKitBundle = (matchedVariant && matchedVariant.isKit) || (typeof item.variantSku === 'string' && item.variantSku.includes(' - '));

        if (coupon.applicableProductTypes === 'normal_only' && isKitBundle) {
          eligible = false; // Coupon is for Singles Only
          ineligibleReasons.add('kit_not_allowed');
        } else if (coupon.applicableProductTypes === 'bulk_only' && !isKitBundle) {
          eligible = false; // Coupon is for Kits Only
          ineligibleReasons.add('kit_required');
        }
      }
      if (coupon.appliesTo === 'specific_products') {
        const allowedProductIds = (coupon.products || []).map((p: any) => typeof p.product === 'object' ? p.product.id : p.product);
        if (!allowedProductIds.includes(product.id)) {
          eligible = false;
          ineligibleReasons.add('not_specific_product');
        }
      }
      if (coupon.appliesTo === 'specific_categories') {
        const allowedCategoryIds = (coupon.categories || []).map((c: any) => typeof c.category === 'object' ? c.category.id : c.category);
        const productCategoryIds = (product.categories || []).map((c: any) => typeof c === 'object' ? c.id : c);
        const hasIntersect = productCategoryIds.some((id: any) => allowedCategoryIds.includes(id));
        if (!hasIntersect) {
          eligible = false;
          ineligibleReasons.add('not_specific_category');
        }
      }
      if (eligible) eligibleSubtotal += itemTotal;
    }
  }

  let discount = 0;
  let description = '';
  
  if (coupon) {
    if (eligibleSubtotal > 0 || coupon.type === 'free_shipping') {
      if (coupon.type === 'percentage' && coupon.value) {
        discount = Math.floor(eligibleSubtotal * (coupon.value / 100));
        description = `${coupon.value}% off eligible items`;
      } else if (coupon.type === 'fixed_amount' && coupon.value) {
        discount = Math.min(coupon.value, eligibleSubtotal);
        description = `$${coupon.value.toFixed(2)} off eligible items`;
      } else if (coupon.type === 'free_shipping') {
        discount = 0;
        description = 'Free shipping';
      } else if (coupon.type === 'buy_one_get_one') {
        description = 'Buy one get one free';
      } else if (coupon.type === 'store_credit' && coupon.remainingBalance) {
        discount = Math.min(coupon.remainingBalance, eligibleSubtotal);
        description = `$${coupon.remainingBalance.toFixed(2)} store credit applied`;
      }
    } else {
      description = 'No eligible items for this coupon';
    }
  }

  let freeShipping = false;
  if (coupon && coupon.type === 'free_shipping') {
    freeShipping = true;
  }

  return { discount, description, eligibleSubtotal, totalSubtotal, freeShipping, ineligibleReasons: Array.from(ineligibleReasons) };
}

export async function verifyCoupon(couponCode: string, subtotal: number, clientCartItems?: any[]) {
  try {
    const user = await getPayloadUser()

    if (!couponCode || !couponCode.trim()) return { valid: false, error: 'Please enter a coupon code' }

    const payload = await getPayload({ config: configPromise })
    const coupons = await payload.find({
      collection: 'coupons',
      where: { code: { equals: couponCode.trim().toUpperCase() } },
      limit: 1,
      overrideAccess: true,
    })



    const coupon = coupons.docs[0]
    if (!coupon) return { valid: false, error: 'Coupon code not found' }
    if ((coupon as any).isActive === false) return { valid: false, error: 'This coupon is no longer active' }

    // Prevent Self-Referral
    if (user) {
      const affiliates = await payload.find({
        collection: 'affiliates',
        where: {
          and: [
            { user: { equals: user.id } },
            { couponCode: { equals: coupon.code } }
          ]
        },
        limit: 1,
        overrideAccess: true,
      })
      
      if (affiliates.docs.length > 0) {
        return { valid: false, error: 'You cannot use your own affiliate coupon' }
      }
    }

    // Check expiration
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { valid: false, error: 'This coupon has expired' }
    }

    // Check usage limit
    if (coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit) {
      return { valid: false, error: 'This coupon has reached its usage limit' }
    }

    // Verify actual items
    let cartItems: any[] = []
    if (clientCartItems && clientCartItems.length > 0) {
      cartItems = clientCartItems.map((item: any) => ({
        product: item.productId || item.product?.id || item.product,
        quantity: item.quantity || 1,
        priceSnapshot: item.priceSnapshot,
        variantSku: item.variantSku
      }))
    } else if (user) {
      const carts = await payload.find({
        collection: 'carts',
        where: { user: { equals: user.id } },
        limit: 1,
        overrideAccess: true,
      })
      cartItems = carts.docs[0]?.items || []
    } else {
      // Dummy cart for guest testing
      cartItems = [{ product: 1, quantity: 1 }]
    }

    if (cartItems.length === 0) {
      return { valid: false, error: 'Cart is empty' }
    }

    const { discount, description, eligibleSubtotal, totalSubtotal, ineligibleReasons } = await calculateCartTotals(cartItems, payload, coupon)

    // Check minimum spend (both minSpend and totalSubtotal are in dollars)
    if (coupon.minSpend && totalSubtotal < coupon.minSpend) {
      return { valid: false, error: `Minimum spend of $${coupon.minSpend.toFixed(2)} required` }
    }

    // Check locked emails
    if (coupon.lockedEmails && coupon.lockedEmails.length > 0) {
      if (!user) return { valid: false, error: 'You must log in to use this specific coupon' }
      const allowed = coupon.lockedEmails.some((e: any) => e.email === user.email)
      if (!allowed) return { valid: false, error: 'This coupon is not available for your account' }
    }

    // New customers only
    if ((coupon as any).newCustomersOnly) {
      if (!user) return { valid: false, error: 'You must be logged in to use this coupon' }
      const priorOrders = await payload.find({
        collection: 'orders',
        where: { owner: { equals: user.id } },
        limit: 1,
        overrideAccess: true,
      })
      if (priorOrders.docs.length > 0) {
        return { valid: false, error: 'This coupon is only valid for new customers with no previous orders' }
      }
    }

    if (eligibleSubtotal === 0 && coupon.type !== 'free_shipping') {
      const reasonMessages: Record<string, string> = {
        sale_excluded: 'This coupon cannot be combined with items already on sale',
        kit_not_allowed: 'This coupon only applies to single items, not kit/bundle products',
        kit_required: 'This coupon only applies to kit/bundle products',
        not_specific_product: 'This coupon only applies to specific products that are not in your cart',
        not_specific_category: 'This coupon only applies to specific product categories that are not in your cart',
      }
      const messages = (ineligibleReasons || []).map((r: string) => reasonMessages[r]).filter(Boolean)
      return {
        valid: false,
        error: messages.length > 0 ? messages.join('. ') + '.' : 'This coupon does not apply to any items in your cart',
      }
    }

    return {
      valid: true,
      code: coupon.code,
      discount,
      description,
      freeShipping: coupon.freeShipping || coupon.type === 'free_shipping',
    }
  } catch (error: any) {
    return { valid: false, error: error.message || 'An unexpected error occurred' }
  }
}

export async function getShopProducts(params: {
  page?: number
  limit?: number
  categories?: string[]
  inStock?: boolean
  onSale?: boolean
  minPrice?: number
  maxPrice?: number
  sort?: string
  bestSellersOnly?: boolean
}) {
  try {
    const payload = await getPayload({ config: configPromise })

    const where: any = {
      and: [
        { isVisible: { equals: true } },
        { status: { equals: 'active' } }
      ]
    }

    if (params.categories && params.categories.length > 0) {
      const cats = await payload.find({
        collection: 'categories',
        where: { name: { in: params.categories } }, // In FilterSidebar we filter by Category Name
        depth: 0,
        overrideAccess: true,
      })
      const catIds = cats.docs.map(c => c.id)
      if (catIds.length > 0) {
        where.and.push({ categories: { in: catIds } })
      } else {
        // If categories filter provided but none matched, return empty
        return { success: true, products: [], totalPages: 0, page: 1, hasNextPage: false }
      }
    }

    if (params.inStock) {
      where.and.push({ stock: { greater_than: 0 } })
    }

    if (params.onSale) {
      where.and.push({ salePrice: { greater_than: 0 } })
    }

    if (params.bestSellersOnly) {
      where.and.push({ isBestSeller: { equals: true } })
    }

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      const priceQuery: any = {}
      if (params.minPrice !== undefined) priceQuery.greater_than_equal = params.minPrice
      if (params.maxPrice !== undefined) priceQuery.less_than_equal = params.maxPrice
      where.and.push({ price: priceQuery })
    }

    let sortParam = '-createdAt'
    if (params.sort === 'price-asc') sortParam = 'price'
    if (params.sort === 'price-desc') sortParam = '-price'
    if (params.sort === 'newest') sortParam = '-createdAt'
    if (params.sort === 'name-asc') sortParam = 'name'

    const limit = params.limit || 24
    const page = params.page || 1

    const locale = await getLocale()
    const results = await payload.find({
      collection: 'products',
      where,
      limit,
      page,
      sort: sortParam,
      depth: 1, // Fetches media URLs and category names
      overrideAccess: true,
      locale: locale as 'en' | 'es',
      fallbackLocale: 'en',
    })

    const uiProducts = results.docs.map(doc => {
      let imageUrl = '/HelixBio Images/featured-research-2.webp'
      let hoverImageUrl: string | undefined = undefined

      if (doc.images && doc.images.length > 0) {
        const encodeUrl = (url: string) => {
          if (!url) return url
          try {
            // Check if it's an absolute URL
            if (url.startsWith('http://') || url.startsWith('https://')) {
              const parsed = new URL(url)
              parsed.pathname = parsed.pathname.split('/').map(s => encodeURIComponent(decodeURIComponent(s))).join('/')
              return parsed.toString()
            }
            // Relative URL
            return url.split('/').map(s => encodeURIComponent(decodeURIComponent(s))).join('/')
          } catch (e) {
            return url
          }
        }

        if (typeof doc.images[0].image === 'object' && doc.images[0].image !== null) {
          imageUrl = encodeUrl((doc.images[0].image as any).url) || imageUrl
        }
        if (doc.images.length > 1 && typeof doc.images[1].image === 'object' && doc.images[1].image !== null) {
          hoverImageUrl = encodeUrl((doc.images[1].image as any).url)
        }
      }
      
      // Fallback to variant images if no global image exists
      if (imageUrl === '/HelixBio Images/featured-research-2.webp' && doc.hasVariants && doc.variants && doc.variants.length > 0) {
        for (const variant of doc.variants) {
          if (variant.images && variant.images.length > 0 && typeof variant.images[0].image === 'object' && variant.images[0].image !== null) {
            const encodeUrl = (url: string) => {
              if (!url) return url
              try {
                if (url.startsWith('http://') || url.startsWith('https://')) {
                  const parsed = new URL(url)
                  parsed.pathname = parsed.pathname.split('/').map(s => encodeURIComponent(decodeURIComponent(s))).join('/')
                  return parsed.toString()
                }
                return url.split('/').map(s => encodeURIComponent(decodeURIComponent(s))).join('/')
              } catch (e) {
                return url
              }
            }
            imageUrl = encodeUrl((variant.images[0].image as any).url)
            
            // Try to find a hover image from the same or another variant
            if (variant.images.length > 1 && typeof variant.images[1].image === 'object' && variant.images[1].image !== null) {
              hoverImageUrl = encodeUrl((variant.images[1].image as any).url)
            }
            break
          }
        }
      }

      let categoryName = 'Research'
      if (doc.categories && doc.categories.length > 0 && typeof doc.categories[0] === 'object') {
        categoryName = getCategoryDisplayName((doc.categories[0] as any).name) || categoryName
      }


      let displayPrice = typeof doc.price === 'number' ? doc.price : 0
      let displaySalePrice = typeof doc.salePrice === 'number' && doc.salePrice > 0 ? doc.salePrice : undefined
      let isFrom = false

      if (doc.hasVariants && doc.variants && doc.variants.length > 0) {
        const prices = doc.variants.map((v: any) => typeof v.salePrice === 'number' && v.salePrice > 0 ? v.salePrice : v.price).filter(Boolean)
        if (prices.length > 0) {
          const minVariantPrice = Math.min(...prices)
          // If the variants have different prices, we can add "From " prefix
          const maxVariantPrice = Math.max(...prices)
          if (minVariantPrice !== maxVariantPrice) {
            isFrom = true
          }
          displayPrice = minVariantPrice
          
          // Try to find the original price of the cheapest variant to show the discount
          const cheapestVariant = doc.variants.find((v: any) => (v.salePrice || v.price) === minVariantPrice)
          if (cheapestVariant && typeof cheapestVariant.salePrice === 'number' && cheapestVariant.salePrice > 0) {
             displaySalePrice = cheapestVariant.salePrice
             displayPrice = cheapestVariant.price
          } else {
             displaySalePrice = undefined
          }
        }
      }

      return {
        id: doc.id as number,
        name: doc.name,
        slug: doc.slug || '',
        image: imageUrl,
        hoverImage: hoverImageUrl,
        shortDescription: doc.description || '',
        priceRange: displaySalePrice 
          ? `${isFrom ? 'From ' : ''}$${displaySalePrice.toFixed(2)}` 
          : `${isFrom ? 'From ' : ''}$${displayPrice.toFixed(2)}`,
        originalPrice: (displaySalePrice && !isFrom)
          ? `$${displayPrice.toFixed(2)}` 
          : undefined,
        discountPercentage: (displaySalePrice && displayPrice > 0)
          ? Math.round(((displayPrice - displaySalePrice) / displayPrice) * 100)
          : undefined,
        hasVariants: !!(doc.hasVariants && (doc.variants?.length || 0) > 1),
        category: categoryName,
        badge: (doc as any).badge && (doc as any).badge !== 'none' ? (doc as any).badge : undefined,
        doses: Array.isArray((doc as any).doses) ? (doc as any).doses.map((d: any) => d.value).filter(Boolean) : undefined,
        // Lightweight per-dose data so product cards can let the shopper pick a dose and
        // add the exact variant (correct sku/price/image) to the cart without a page visit.
        variants: doc.hasVariants && Array.isArray(doc.variants) && doc.variants.length > 0
          ? doc.variants.map((v: any) => {
              const doseOption = Array.isArray(v.options) ? v.options.find((o: any) => o.key === 'Dose') : null
              let variantImage: string | undefined
              if (Array.isArray(v.images) && v.images.length > 0 && typeof v.images[0].image === 'object' && v.images[0].image) {
                const url = (v.images[0].image as any).url as string
                if (url) {
                  try {
                    if (url.startsWith('http://') || url.startsWith('https://')) {
                      const parsed = new URL(url)
                      parsed.pathname = parsed.pathname.split('/').map((s: string) => encodeURIComponent(decodeURIComponent(s))).join('/')
                      variantImage = parsed.toString()
                    } else {
                      variantImage = url.split('/').map((s: string) => encodeURIComponent(decodeURIComponent(s))).join('/')
                    }
                  } catch (e) {
                    variantImage = url
                  }
                }
              }
              return {
                sku: v.sku,
                price: typeof v.salePrice === 'number' && v.salePrice > 0 ? v.salePrice : v.price,
                dose: doseOption?.value || v.sku,
                image: variantImage,
              }
            })
          : undefined,
      }
    })

    return {
      success: true,
      products: uiProducts,
      totalPages: results.totalPages,
      page: results.page,
      hasNextPage: results.hasNextPage,
    }
  } catch (err: any) {
    return { success: false, error: err.message, products: [], totalPages: 0 }
  }
}

export async function getUserDefaultAddress() {
  try {
    const user = await getPayloadUser()
    if (!user) return null

    const payload = await getPayload({ config: configPromise })
    const addresses = await payload.find({
      collection: 'addresses',
      where: { 
        user: { equals: user.id },
        isDefaultShipping: { equals: true }
      },
      limit: 1,
      overrideAccess: true,
    })

    if (addresses.docs.length > 0) {
      return addresses.docs[0]
    }

    const anyAddress = await payload.find({
      collection: 'addresses',
      where: { user: { equals: user.id } },
      limit: 1,
      overrideAccess: true,
    })

    return anyAddress.docs.length > 0 ? anyAddress.docs[0] : null
  } catch (err) {
    return null
  }
}

export async function getUserHBPoints() {
  try {
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('@/lib/auth/authOptions')
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return 0

    const payload = await getPayload({ config: configPromise })
    const payloadUser = await payload.findByID({
      collection: 'users',
      id: session.user.id,
      depth: 0,
    })

    return typeof payloadUser?.hbPoints === 'number' ? payloadUser.hbPoints : 0
  } catch (error) {
    console.error('Error fetching HB points:', error)
    return 0
  }
}

export async function syncGuestOrdersToUser(payload: any, user: any) {
  try {
    const guestOrders = await payload.find({
      collection: 'orders',
      where: {
        and: [
          { guestEmail: { equals: user.email } },
          { owner: { exists: false } }
        ]
      },
      limit: 100,
      overrideAccess: true,
    });

    for (const order of guestOrders.docs) {
      // 1. Save Address if it exists
      if (order.shippingAddress && order.shippingAddress.line1) {
        const existingAddr = await payload.find({
          collection: 'addresses',
          where: {
            and: [
              { user: { equals: user.id } },
              { line1: { equals: order.shippingAddress.line1 } },
              { postalCode: { equals: order.shippingAddress.postalCode } }
            ]
          },
          limit: 1,
          overrideAccess: true,
        });

        if (existingAddr.docs.length === 0) {
          await payload.create({
            collection: 'addresses',
            data: {
              user: user.id,
              label: 'Imported Address',
              firstName: order.customerFirstName || 'Customer',
              lastName: order.customerLastName || 'User',
              line1: order.shippingAddress.line1,
              line2: order.shippingAddress.line2 || '',
              city: order.shippingAddress.city || '',
              state: order.shippingAddress.state || '',
              postalCode: order.shippingAddress.postalCode || '',
              country: order.shippingAddress.country || 'US',
              phone: order.customerPhone || '',
              isDefaultShipping: false,
            },
            overrideAccess: true,
          });
        }
      }

      // 2. Claim Order
      await payload.update({
        collection: 'orders',
        id: order.id,
        data: { owner: user.id },
        overrideAccess: true,
      });
    }
  } catch (e) {
    console.error('Failed to sync guest orders', e);
  }
}

export async function getUserAddresses() {
  try {
    const user = await getPayloadUser()
    if (!user) return []

    const payload = await getPayload({ config: configPromise })
    
    // Auto-claim any unowned guest orders and import their addresses
    await syncGuestOrdersToUser(payload, user)

    const addresses = await payload.find({
      collection: 'addresses',
      where: { user: { equals: user.id } },
      limit: 50,
      overrideAccess: true,
    })

    return addresses.docs || []
  } catch (err) {
    return []
  }
}
