import React from 'react'
import { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { OrderConfirmationClient } from './OrderConfirmationClient'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('orderConfirmation')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const t = await getTranslations('orderConfirmation')

  if (!id || id === 'success') {
    return notFound()
  }

  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const isCookieAuthorized = cookieStore.get(`order_auth_${id}`)?.value === 'true'

  const payload = await getPayload({ config: configPromise })
  
  let order;
  try {
     const numericId = parseInt(id, 10)
     order = await payload.findByID({
       collection: 'orders',
       id: isNaN(numericId) ? id : numericId,
       depth: 2
     })
  } catch (e) {
     return notFound()
  }

  if (!order) return notFound()

  // 1. Check Cookie Auth (Guest or Immediate Post-Checkout)
  let isAuthorized = isCookieAuthorized;

  // 2. Check User Auth (Logged in user returning to the page)
  if (!isAuthorized) {
     try {
       const { getServerSession } = await import('next-auth')
       const { authOptions } = await import('@/lib/auth/authOptions')
       const session = await getServerSession(authOptions)
       const userId = session?.user?.id
       if (userId && order.owner) {
          const ownerId = typeof order.owner === 'object' ? order.owner.id : order.owner
          if (String(ownerId) === String(userId)) {
             isAuthorized = true;
          }
       }
     } catch (e) {
       console.error('Auth check failed', e)
     }
  }

  if (!isAuthorized) {
    return notFound()
  }

  // Format order items
  const formattedItems = (order.items || []).map((item: any, i: number) => {
     // Use product object since depth > 0 populates relationships
     const productData = typeof item.product === 'object' ? item.product : item.productSnapshot
     
     let displayVariant = item.variantTitle || item.variant || t('defaultVariant');
     let variantImageUrl = '';
     
     if (productData?.variants?.length) {
        // try to find the matching variant by SKU
        const matchedVariant = productData.variants.find((v: any) => v.sku === item.variant || (item.variant && item.variant.includes(v.sku)));
        
        if (matchedVariant) {
           variantImageUrl = matchedVariant.images?.[0]?.image?.url || matchedVariant.images?.[0]?.url || '';
           
           if (!item.variantTitle) {
              const vTitle = matchedVariant.title || matchedVariant.options?.map((o:any) => o.value).join(' ') || `Variant`;
              if (displayVariant === matchedVariant.sku) {
                 displayVariant = vTitle;
              } else if (displayVariant.startsWith(`${matchedVariant.sku} - `)) {
                 displayVariant = displayVariant.replace(`${matchedVariant.sku} - `, `${vTitle} - `);
              }
           }
        } else if (!item.variantTitle) {
           // fallback to original loop if no match found just to fix titles
           for (const v of productData.variants) {
              const vTitle = v.title || v.options?.map((o:any) => o.value).join(' ') || `Variant`;
              if (displayVariant === v.sku) {
                 displayVariant = vTitle;
                 break;
              }
              if (displayVariant.startsWith(`${v.sku} - `)) {
                 displayVariant = displayVariant.replace(`${v.sku} - `, `${vTitle} - `);
                 break;
              }
           }
        }
     }

     return {
        id: item.id || String(i),
        name: productData?.title || productData?.name || t('unknownProductName'),
        variant: displayVariant, 
        quantity: item.quantity,
        price: typeof item.price === 'number' ? item.price : (productData?.price || productData?.basePrice || 0),
        image: (variantImageUrl || productData?.images?.[0]?.image?.url || productData?.images?.[0]?.url || '/HelixBio Images/featured-research-2.webp').replace(/ /g, '%20')
     }
  })

  // Format OrderData
  const orderData = {
    id: order.orderNumber || String(order.id),
    // Real numeric Payload id — distinct from the display `id` above (which prefers the
    // human-facing orderNumber), needed for API calls back to actions keyed by the true id
    // (e.g. CircoFlows' merchant_transaction_id, which was set to this at order-creation time).
    orderId: String(order.id),
    customerName: `${order.customerFirstName || ''} ${order.customerLastName || ''}`.trim() || t('defaultCustomerName'),
    email: order.guestEmail || '',
    shippingAddress: {
      line1: order.shippingAddress?.line1 || '',
      city: order.shippingAddress?.city || '',
      state: order.shippingAddress?.state || '',
      postalCode: order.shippingAddress?.postalCode || '',
      country: order.shippingAddress?.country || 'US'
    },
    billingAddress: {
      line1: order.billingAddress?.line1 || order.shippingAddress?.line1 || '',
      city: order.billingAddress?.city || order.shippingAddress?.city || '',
      state: order.billingAddress?.state || order.shippingAddress?.state || '',
      postalCode: order.billingAddress?.postalCode || order.shippingAddress?.postalCode || '',
      country: order.billingAddress?.country || order.shippingAddress?.country || 'US'
    },
    estimatedDeliveryType: (order.shippingMethod?.toLowerCase().includes('express') ? 'express' : 'standard') as 'express' | 'standard',
    items: formattedItems,
    subtotal: order.subtotal || 0,
    shipping: order.shippingTotal || 0,
    processingFee: (order.feeTotal || order.taxTotal) || 0,
    // Snapshot taken at order-creation time, stored on the order — never re-derived from the
    // live processing-fees config, so this stays correct even after the fee % is changed later.
    processingFeePercentage: Array.isArray(order.appliedFees)
      ? order.appliedFees.find((f: any) => f.feeType === 'percentage' && typeof f.percentage === 'number')?.percentage ?? null
      : null,
    total: order.total || 0,
    discountTotal: order.discountTotal || 0,
    redeemedPoints: order.redeemedPoints || 0,
    couponCode: order.couponCode || '',
    paymentMethod: order.paymentMethod || 'stripe',
  }

  return (
    <div className="pt-20">
      <OrderConfirmationClient order={orderData} />
    </div>
  )
}
