'use client'

import React from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { ArrowLeft, Package, RotateCcw, MapPin, CreditCard, Truck } from 'lucide-react'
import { Space_Grotesk } from 'next/font/google'
import { motion } from 'framer-motion'
import { useCartStore } from '@/lib/cart/store'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { getMappedStatus, type DisplayOrderStatus } from '@/lib/orders/statusLabel'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '700'] })

type OrderStatus = DisplayOrderStatus
const STATUS_STEPS: OrderStatus[] = ['Placed', 'Processing', 'Shipped', 'Delivered']

export interface OrderDetailProps {
  order: any; // We use any here to safely traverse the dynamic payload object
}

export function OrderDetailClient({ order }: OrderDetailProps) {
  const t = useTranslations('account.orderDetail')
  const locale = useLocale()
  const router = useRouter()
  const addItem = useCartStore(state => state.addItem)
  const openCart = useCartStore(state => state.openCart)
  // Use the percentage snapshot stored on the order itself, not the live processing-fees
  // config — the config may have changed since this order was placed, and this order's
  // receipt must always reflect the rate actually charged at the time.
  const feePercentage: number | null = Array.isArray(order.appliedFees)
    ? order.appliedFees.find((f: any) => f.feeType === 'percentage' && typeof f.percentage === 'number')?.percentage ?? null
    : null

  const STATUS_LABELS: Record<OrderStatus, string> = {
    Placed: t('statusPlaced'),
    Processing: t('statusProcessing'),
    Shipped: t('statusShipped'),
    Delivered: t('statusDelivered'),
  }

  const handleReorder = () => {
    if (!order.items) return
    for (const item of order.items) {
      const product = item.product || item.productSnapshot || {}
      if (product.id) {
        const title = product.title || product.name || t('unknownProduct')
        const imageUrl = (product.images?.[0]?.image?.url || product.images?.[0]?.url || '/HelixBio Images/featured-research-2.webp').replace(/ /g, '%20')
        const price = typeof item.price === 'number' ? item.price : (product.basePrice || product.price || 0)
        addItem(
          { id: product.id, name: title, imageUrl, slug: product.slug },
          item.variant || null, // variantSku
          item.quantity || 1,
          price
        )
      }
    }
    openCart()
    router.push('/cart')
  }

  const currentStepIndex = STATUS_STEPS.indexOf(getMappedStatus(order.status))
  
  const formattedDate = new Intl.DateTimeFormat(false ? 'es-US' : 'en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(order.createdAt))

  const subtotal = order.subtotal || 0
  const shipping = order.shippingTotal || 0
  const processingFee = order.feeTotal || order.taxTotal || 0
  const total = order.total || 0

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col max-w-5xl"
    >
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 border-b border-gray-200 pb-6">
        <div className="flex flex-col gap-2">
          <Link href="/account/orders" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 hover:text-black transition-colors mb-4 w-fit bg-gray-50 px-4 py-2 rounded-full">
            <ArrowLeft size={14} />
            {t('backToOrders')}
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-ink tracking-tight font-heading">
            {t('orderTitle', { orderNumber: order.orderNumber })}
          </h1>
          <p className="text-sm text-gray-500">{t('placedOn', { date: formattedDate })}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReorder}
            className="flex items-center justify-center gap-2 bg-navy-deep hover:bg-navy text-white rounded-full px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] transition-all shadow-lg"
          >
            <Package size={14} />
            {t('reorderAll')}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Column: Items and Timeline */}
        <div className="flex flex-col gap-8 flex-1 w-full">
          
          {/* Tracking Timeline */}
          <div className="bg-white border border-gray-100 p-4 sm:p-8 rounded-3xl shadow-sm overflow-hidden">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-black mb-8 border-b border-gray-100 pb-4">{t('trackingStatus')}</h2>
            <div className="relative flex justify-between px-1 sm:px-4">
              {/* Connecting Line (Background) */}
              <div className="absolute top-3 sm:top-4 left-4 right-4 h-[2px] bg-gray-100 -z-10 rounded-full" />

              {/* Connecting Line (Progress) */}
              <div
                className="absolute top-3 sm:top-4 left-4 h-[2px] bg-navy-deep -z-10 transition-all duration-1000 ease-out rounded-full"
                style={{ width: `calc(${(Math.max(currentStepIndex, 0) / (STATUS_STEPS.length - 1)) * 100}% - 2rem)` }}
              />

              {STATUS_STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex
                const isCurrent = index === currentStepIndex

                return (
                  <div key={step} className="flex flex-col items-center gap-2 sm:gap-3 bg-white px-0.5 sm:px-2">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm ${
                      isCompleted ? 'bg-navy-deep text-white border-none' : 'bg-white border-2 border-gray-100 text-gray-300'
                    }`}>
                      {isCompleted && (
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className={`text-[7px] sm:text-[10px] font-bold uppercase tracking-[0.05em] sm:tracking-[0.1em] text-center whitespace-nowrap ${
                      isCurrent ? 'text-black' : isCompleted ? 'text-gray-500' : 'text-gray-300'
                    }`}>
                      {STATUS_LABELS[step]}
                    </span>
                  </div>
                )
              })}
            </div>

            {order.status === 'cancelled' && (
              <div className="mt-8 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                {t('orderCancelled')}
              </div>
            )}
          </div>

          {/* Tracking Link Container */}
          {order.trackingLink ? (
            <div className="bg-[#ECFDF5] border border-[#10B981]/20 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-bold text-[#065F46] tracking-tight">Track Your Package</h2>
                <p className="text-sm text-[#065F46]/80">Your order is on its way. Use the tracking link to monitor your shipment.</p>
              </div>
              <a 
                href={order.trackingLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest transition-colors shadow-sm whitespace-nowrap"
              >
                Track Package
              </a>
            </div>
          ) : (
            <div className="bg-gray-50/50 border border-gray-100 border-dashed p-6 md:p-8 rounded-3xl flex flex-col items-center justify-center text-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 shadow-sm">
                <Package size={16} />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-gray-800">Tracking Information Pending</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">Your tracking link will be available here automatically once your product has been shipped.</p>
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="bg-white border border-gray-100 p-4 sm:p-8 rounded-3xl shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-black mb-6 border-b border-gray-100 pb-4">{t('itemsOrdered')}</h2>
            <div className="flex flex-col gap-4 sm:gap-6">
              {order.items?.map((item: any) => {
                // Prioritize the live populated product relation to get the actual image media objects
                const product = item.product || item.productSnapshot || {}
                const title = product.title || product.name || t('unknownProduct')
                const price = (typeof item.price === 'number' ? item.price : (product.basePrice || product.price || 0))
                let displayVariant = item.variant || t('standardVariant');
                let imageUrl = product.images?.[0]?.image?.url || product.images?.[0]?.url || '/HelixBio Images/featured-research-2.webp'

                if (product?.variants?.length) {
                  const matchedVariant = product.variants.find((v: any) => v.sku === item.variant || (item.variant && item.variant.includes(v.sku)))
                  
                  if (matchedVariant) {
                     const vImg = matchedVariant.images?.[0]?.image?.url || matchedVariant.images?.[0]?.url
                     if (vImg) imageUrl = vImg
                     
                     const vTitle = matchedVariant.title || matchedVariant.options?.map((o:any) => o.value).join(' ') || `Variant`
                     if (displayVariant === matchedVariant.sku) {
                        displayVariant = vTitle;
                     } else if (displayVariant.startsWith(`${matchedVariant.sku} - `)) {
                        displayVariant = displayVariant.replace(`${matchedVariant.sku} - `, `${vTitle} - `);
                     }
                  } else {
                     // fallback to original loop just for title
                     for (const v of product.variants) {
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
                
                imageUrl = imageUrl.replace(/ /g, '%20')
                
                return (
                  <div key={item.id || Math.random()} className="flex items-center gap-3 sm:gap-6 group">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                      <Link href={`/product/${product.slug || ''}`} className="relative block w-full h-full bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                        <Image src={imageUrl} alt={title} fill className="object-cover" sizes="80px" />
                      </Link>
                      {/* Kept outside the image's overflow-hidden container so it isn't clipped */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-navy-deep text-white rounded-full flex items-center justify-center text-[10px] font-bold z-10 border-2 border-white shadow-sm pointer-events-none">
                        {item.quantity}
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                      <Link href={`/product/${product.slug || ''}`}>
                        <span className={`text-sm sm:text-lg text-black font-bold tracking-tight hover:text-navy-deep transition-colors line-clamp-2 ${spaceGrotesk.className}`}>
                          {title}
                        </span>
                      </Link>
                      {displayVariant && !['DEFAULT', 'DEFAULT TITLE'].includes(displayVariant.toUpperCase()) && (
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-gray-400 mt-1">
                          {displayVariant}
                        </span>
                      )}
                    </div>

                    <span className={`text-base sm:text-xl font-bold text-black tracking-tighter shrink-0 whitespace-nowrap ${spaceGrotesk.className}`}>
                      ${(price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
          
        </div>

        {/* Right Column: Summaries */}
        <div className="flex flex-col gap-8 w-full lg:w-[340px] shrink-0">
          
          {/* Shipping Summary */}
          {order.shippingAddress && (
            <div className="bg-white border border-gray-100 p-5 sm:p-8 rounded-3xl shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 text-black">
                <Truck size={16} />
                <h2 className="text-xs font-bold uppercase tracking-[0.15em]">{t('shippingInfo')}</h2>
              </div>
              
              <div className="flex flex-col gap-1 text-sm text-gray-500 leading-relaxed">
                <span className={`text-lg text-black font-bold tracking-tight mb-2 ${spaceGrotesk.className}`}>
                  {order.customerFirstName} {order.customerLastName}
                </span>
                <span>{order.shippingAddress.line1}</span>
                {order.shippingAddress.line2 && <span>{order.shippingAddress.line2}</span>}
                <span>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</span>
                <span>{order.shippingAddress.country}</span>
              </div>
            </div>
          )}

          {/* Billing Summary */}
          {(order.billingAddress?.line1 || order.shippingAddress) && (
            <div className="bg-white border border-gray-100 p-5 sm:p-8 rounded-3xl shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 text-black">
                <CreditCard size={16} />
                <h2 className="text-xs font-bold uppercase tracking-[0.15em]">{t('billingAddress', { fallback: 'Billing Address' })}</h2>
              </div>
              
              <div className="flex flex-col gap-1 text-sm text-gray-500 leading-relaxed">
                <span className={`text-lg text-black font-bold tracking-tight mb-2 ${spaceGrotesk.className}`}>
                  {order.customerFirstName} {order.customerLastName}
                </span>
                <span>{order.billingAddress?.line1 || order.shippingAddress?.line1}</span>
                {(order.billingAddress?.line2 || order.shippingAddress?.line2) && <span>{order.billingAddress?.line2 || order.shippingAddress?.line2}</span>}
                <span>{order.billingAddress?.city || order.shippingAddress?.city}, {order.billingAddress?.state || order.shippingAddress?.state} {order.billingAddress?.postalCode || order.shippingAddress?.postalCode}</span>
                <span>{order.billingAddress?.country || order.shippingAddress?.country}</span>
              </div>
            </div>
          )}
          
          {/* Order Summary */}
          <div className="bg-white border border-gray-100 p-5 sm:p-8 rounded-3xl shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 text-black">
              <CreditCard size={16} />
              <h2 className="text-xs font-bold uppercase tracking-[0.15em]">{t('orderSummary')}</h2>
            </div>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>{t('subtotal')}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {!!order.discountTotal && order.discountTotal > 0 && (
                <div className="flex justify-between text-green-500">
                  <span>{order.couponCode ? t('discountWithCode', { code: order.couponCode }) : t('discount')}</span>
                  <span>-${order.discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>{t('shipping')}</span>
                <span>{shipping === 0 ? t('free') : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className={`flex justify-between text-gray-500 ${!order.redeemedPoints ? 'border-b border-gray-100 pb-4' : ''}`}>
                <span>{t('processingFee')}{feePercentage ? ` (${feePercentage}%)` : ''}</span>
                <span>${processingFee.toFixed(2)}</span>
              </div>
              {!!order.redeemedPoints && order.redeemedPoints > 0 && (
                <div className="flex justify-between text-green-500 border-b border-gray-100 pb-4 mt-1">
                  <span>CA Points</span>
                  <span>-${order.redeemedPoints.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-black font-bold mt-2">
                <span className="text-sm">{t('total')}</span>
                <span className={`text-3xl tracking-tighter ${spaceGrotesk.className}`}>${total.toFixed(2)}</span>
              </div>
              <div className={`text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-2 rounded-lg mt-2 text-center border ${
                ['captured', 'paid', 'succeeded'].includes(order.paymentStatus) ? 'bg-green-50 text-green-600 border-green-100' :
                order.paymentStatus === 'refunded' ? 'bg-red-50 text-red-600 border-red-100' :
                'bg-amber-50 text-amber-600 border-amber-100'
              }`}>
                {['captured', 'paid', 'succeeded'].includes(order.paymentStatus) ? t('paymentSuccessful') :
                 order.paymentStatus === 'refunded' ? t('paymentRefunded') :
                 t('paymentProcessing')}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </motion.div>
  )
}
