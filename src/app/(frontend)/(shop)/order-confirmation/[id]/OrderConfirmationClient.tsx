'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Printer, Copy, MapPin, Truck, CreditCard, Wallet, Smartphone, ShieldCheck } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { FadeUp } from '@/components/motion/FadeUp'
import { buttonVariants } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { useCartStore } from '@/lib/cart/store'
import { toast } from 'sonner'

type OrderItem = {
  id: string
  name: string
  variant: string
  quantity: number
  price: number
  image: string
}

type OrderData = {
  id: string
  orderId: string
  customerName: string
  email: string
  shippingAddress: {
    line1: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  billingAddress: {
    line1: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  estimatedDeliveryType: 'express' | 'standard'
  items: OrderItem[]
  subtotal: number
  shipping: number
  processingFee: number
  processingFeePercentage?: number | null
  total: number
  discountTotal?: number
  redeemedPoints?: number
  couponCode?: string
  paymentMethod: 'stripe' | 'zelle' | 'amex' | 'circoflows' | 'stripe_link'
}

const ZELLE_RECIPIENT_EMAIL = 'support@certifiedaminos.com'

const CONFETTI_PIECES = [
  { x: -80, y: -60, color: '#92DCE5', delay: 0.0, rotation: 45, scale: 1.2 },
  { x: 40, y: -90, color: '#6B8E5E', delay: 0.1, rotation: -20, scale: 0.9 },
  { x: 90, y: -30, color: '#C4A05E', delay: 0.05, rotation: 110, scale: 1.1 },
  { x: -90, y: 20, color: '#38bdf8', delay: 0.15, rotation: -45, scale: 0.8 },
  { x: -50, y: 80, color: '#0A0A0A', delay: 0.2, rotation: 60, scale: 1.3 },
  { x: 70, y: 60, color: '#92DCE5', delay: 0.02, rotation: -80, scale: 1.0 },
  { x: 100, y: 20, color: '#6B8E5E', delay: 0.12, rotation: 15, scale: 1.1 },
  { x: -20, y: -100, color: '#C4A05E', delay: 0.08, rotation: 75, scale: 0.9 },
  { x: 20, y: 90, color: '#38bdf8', delay: 0.18, rotation: -115, scale: 0.7 },
  { x: -100, y: -20, color: '#0A0A0A', delay: 0.05, rotation: 30, scale: 1.2 },
  { x: 50, y: -50, color: '#92DCE5', delay: 0.1, rotation: -60, scale: 0.8 },
  { x: -60, y: 40, color: '#6B8E5E', delay: 0.0, rotation: 90, scale: 1.4 },
]

const ConfettiBurst = () => {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 translate-y-[-16px]">
      {CONFETTI_PIECES.map((p, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            scale: p.scale,
            opacity: 0,
            rotate: p.rotation
          }}
          transition={{
            duration: 0.8,
            delay: 0.2 + p.delay,
            ease: "easeOut"
          }}
          className="absolute w-2 h-2 md:w-3 md:h-3 rounded-[2px]"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  )
}

export function OrderConfirmationClient({ order }: { order: OrderData }) {
  const t = useTranslations('orderConfirmation')
  const isZelle = order.paymentMethod === 'zelle'
  const isStripeLink = order.paymentMethod === 'stripe_link' || order.paymentMethod === 'amex'

  React.useEffect(() => {
    // GA4 eCommerce tracking
    if (typeof window !== 'undefined' && !sessionStorage.getItem(`ga_tracked_${order.id}`)) {
      const w = window as any;
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({ ecommerce: null }); // Clear previous eCommerce object
      w.dataLayer.push({
        event: 'purchase',
        ecommerce: {
          transaction_id: order.orderId || order.id,
          value: order.total,
          tax: 0,
          shipping: order.shipping,
          currency: 'USD',
          coupon: order.couponCode || '',
          items: order.items.map((item, index) => ({
            item_id: item.id,
            item_name: item.name,
            item_variant: item.variant,
            price: item.price,
            quantity: item.quantity,
            index: index
          }))
        }
      });
      sessionStorage.setItem(`ga_tracked_${order.id}`, 'true');
    }

    useCartStore.getState().clear()
  }, [order])

  React.useEffect(() => {
    if (order.paymentMethod === 'circoflows') {
      import('../../checkout/circoflowsActions').then(m => m.syncCircoFlowsPaymentStatus(order.orderId))
    }
  }, [order.paymentMethod, order.orderId])

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.id)
    toast.success('Order number copied!')
  }

  const PAYMENT_METHOD_LABELS: Record<OrderData['paymentMethod'], string> = {
    stripe: t('paymentMethodCard'),
    zelle: t('paymentMethodZelle'),
    amex: 'American Express',
    circoflows: t('paymentMethodCard'),
    stripe_link: 'Stripe (Custom Link)',
  }

  const renderOrderSummary = () => (
    <FadeUp delay={0.2} className="bg-[#fafafa] rounded-[12px] p-6 sm:p-8 border border-gray-200 lg:sticky lg:top-32 shadow-sm print:shadow-none print:border-none print:bg-white print:p-0">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 print:border-black print:pb-2">
        <h2 className="text-lg font-bold text-black uppercase tracking-widest">Order Summary</h2>
        <button onClick={handleCopyOrderId} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black transition-colors bg-white px-2 py-1 rounded-[6px] border border-gray-200 print:hidden shadow-sm">
          #{order.id} <Copy size={12} />
        </button>
        <span className="hidden print:inline text-xs font-bold">#{order.id}</span>
      </div>

      {/* Items List (Flex Layout) */}
      <div className="flex flex-col gap-5 mb-8 max-h-[45vh] overflow-y-auto custom-scrollbar pr-2 print:overflow-visible print:max-h-none">
        {order.items.map(item => (
          <div key={item.id} className="flex gap-4 items-center">
            <div className="relative w-16 h-16 rounded-[10px] bg-white border border-gray-200 overflow-hidden shrink-0 shadow-sm print:hidden">
              <Image src={item.image} alt={item.name} fill className="object-cover" />
            </div>
            <div className="flex flex-col flex-grow">
              <span className="font-bold text-black text-sm line-clamp-2 print:line-clamp-none">{item.name}</span>
              {item.variant && !['DEFAULT', 'DEFAULT TITLE'].includes(item.variant.toUpperCase()) && (
                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mt-1">{item.variant}</span>
              )}
              <span className="text-xs text-gray-500 mt-1 font-medium">Qty: {item.quantity}</span>
            </div>
            <div className="text-right shrink-0">
              <span className="font-bold text-black text-sm">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Totals Box */}
      <div className="bg-white rounded-[12px] p-5 border border-gray-200 shadow-sm print:shadow-none print:border-none print:p-0">
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>{t('subtotal')}</span>
            <span className="font-medium text-black">${order.subtotal.toFixed(2)}</span>
          </div>
          {!!order.discountTotal && order.discountTotal > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>{t('discount')} {order.couponCode ? <span className="text-xs uppercase bg-gray-100 px-1 rounded ml-1">{order.couponCode}</span> : ''}</span>
              <span className="font-bold text-green-600">-${order.discountTotal.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>{t('shipping')}</span>
            <span className="font-medium text-black">{order.shipping === 0 ? t('free') : `$${order.shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between text-gray-600 pb-4 border-b border-gray-100">
            <span>{t('processingFee')} {order.processingFeePercentage ? <span className="text-[10px] uppercase bg-gray-100 px-1 rounded ml-1">{order.processingFeePercentage}%</span> : ''}</span>
            <span className="font-medium text-black">${order.processingFee.toFixed(2)}</span>
          </div>
          {!!order.redeemedPoints && order.redeemedPoints > 0 && (
            <div className="flex justify-between text-gray-600 pt-1 pb-4 border-b border-gray-100">
              <span>HB Points</span>
              <span className="font-bold text-green-600">-${order.redeemedPoints.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-bold uppercase tracking-widest text-gray-500">{t('totalUsd')}</span>
            <span className="text-2xl font-bold text-black">${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center print:hidden">
        <span className="text-[11px] text-gray-400 font-medium">
          {t.rich('questionsContactSupport', {
            link: (chunks) => <a href="mailto:support@certifiedaminos.com" className="text-gray-600 underline hover:text-black transition-colors">{chunks}</a>,
          })}
        </span>
      </div>
    </FadeUp>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}} />
      <div className="min-h-screen bg-[#FAFAFA] pt-24 pb-32 print:bg-white print:pt-0 print:pb-0 print:min-h-0">
        <Container size="page" className="px-4 sm:px-6 lg:px-8 max-w-[1200px] print:block print:w-full print:px-0 print:m-0 print:h-auto">
          
          {/* Print Header (Visible ONLY when printing) */}
          <div className="hidden print:flex items-center justify-between mb-8 pb-4 border-b border-black">
             <div className="flex items-center gap-3">
               <span className="font-syncopate text-lg font-medium tracking-tight text-black">
                 CERTIFIED AMINOS
               </span>
             </div>
             <div className="text-right">
               <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{t('receipt')}</p>
               <p className="text-base font-bold text-black">#{order.id}</p>
             </div>
          </div>

          {/* Main Layout: Split Screen on Desktop */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-16 xl:gap-24 print:flex-col print:gap-8">
            
            {/* LEFT COLUMN: Success Msg & Next Steps */}
            <div className="w-full lg:w-[55%] flex flex-col gap-10">
              
              {/* Header Section */}
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left print:hidden">
                <div className="relative">
                  <ConfettiBurst />
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-[16px] bg-black text-white flex items-center justify-center mb-8 shadow-lg relative z-10"
                  >
                    <Check size={36} strokeWidth={2.5} />
                  </motion.div>
                </div>
                
                <FadeUp delay={0.1}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">{t('confirmationEmailSent')} {order.email}</p>
                  <h1 className="text-3xl md:text-5xl font-bold text-black mb-4 tracking-tight">
                    {isZelle || isStripeLink ? t('orderPlaced') : t('paymentSuccessful')}
                  </h1>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-lg">
                    {isZelle
                      ? t('thankYouZelle', { name: order.customerName })
                      : isStripeLink
                      ? "Thank you for your order! Your items have been successfully reserved."
                      : t('thankYouConfirmed', { name: order.customerName })}
                  </p>
                </FadeUp>
              </div>

              {/* Dynamic Action Modules (Zelle/Amex) */}
              {isZelle && (
                <FadeUp delay={0.15} className="print:hidden">
                  <div className="bg-[#fafafa] border-2 border-purple-100 rounded-[12px] p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[12px] bg-purple-100 flex items-center justify-center text-purple-700">
                        <Wallet size={24} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-black">{t('completeZellePayment')}</h2>
                        <p className="text-sm text-gray-500 font-medium">Follow the instructions to finalize</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-6 bg-white rounded-[12px] p-4 border border-gray-200">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-white border border-gray-100 rounded-[8px] overflow-hidden p-1 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="https://res.cloudinary.com/denskvdyt/image/upload/v1783110064/zelle-qr_h2xhvt.jpg" alt="Zelle QR" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex flex-col gap-3 w-full">
                         <div className="bg-gray-50 rounded-[8px] p-3 flex justify-between items-center w-full">
                           <div className="flex flex-col">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Send To</span>
                             <span className="text-sm font-bold text-purple-700">{ZELLE_RECIPIENT_EMAIL}</span>
                           </div>
                         </div>
                         <div className="bg-gray-50 rounded-[8px] p-3 flex justify-between items-center w-full">
                           <div className="flex flex-col">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Amount</span>
                             <span className="text-sm font-bold text-black">${order.total.toFixed(2)}</span>
                           </div>
                         </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-purple-50 p-4 rounded-[12px]">
                      <ShieldCheck size={20} className="text-purple-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-purple-800 font-medium leading-relaxed">
                        {t.rich('includeOrderNumber', {
                          orderId: order.id,
                          bold: (chunks) => <span className="font-bold underline decoration-purple-300 underline-offset-2">{chunks}</span>,
                        })}
                      </p>
                    </div>
                  </div>
                </FadeUp>
              )}

              {isStripeLink && (
                <FadeUp delay={0.15} className="print:hidden">
                  <div className="bg-[#fafafa] border-2 border-blue-100 rounded-[12px] p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left relative overflow-hidden">
                    <div className="w-12 h-12 rounded-[12px] bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-black mb-2">Secure Stripe Payment Link</h2>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        One of our team members will reach out to you shortly via <strong>Email</strong> with a secure, custom Stripe payment link to finalize your order. Rest assured, your items are safely reserved for you in the meantime!
                      </p>
                    </div>
                  </div>
                </FadeUp>
              )}

              {/* MOBILE ONLY: Order Summary (Visible only on lg:hidden) */}
              <div className="block lg:hidden w-full print:hidden">
                {renderOrderSummary()}
              </div>

              {/* Customer Information Grid */}
              <FadeUp delay={0.2} className="flex flex-col gap-6 border-t border-gray-100 pt-8 print:border-none print:pt-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-black mb-2">{t('shippingAddress')} & Info</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Shipping Box */}
                  <div className="bg-white border border-gray-200 rounded-[12px] p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-3">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('shippingAddress')}</span>
                    </div>
                    <div className="text-sm text-gray-700 flex flex-col gap-1">
                      <p className="font-bold text-black">{order.customerName}</p>
                      <p>{order.shippingAddress.line1}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>

                  {/* Delivery & Payment Box */}
                  <div className="bg-white border border-gray-200 rounded-[12px] p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-3">
                      <Truck size={16} className="text-gray-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Method</span>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t('estDelivery')}</p>
                        <p className="text-sm font-bold text-black">{t(order.estimatedDeliveryType === 'express' ? 'estimatedDeliveryExpress' : 'estimatedDeliveryStandard')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t('paymentMethod')}</p>
                        <p className="text-sm font-bold text-black flex items-center gap-2">
                           {isZelle ? <Wallet size={14} className="text-purple-600"/> : isStripeLink ? <CreditCard size={14} className="text-blue-600" /> : <CreditCard size={14} className="text-gray-500" />}
                           {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </FadeUp>

              {/* Footer Actions (Desktop Left Col) */}
              <FadeUp delay={0.3} className="pt-8 flex flex-col sm:flex-row gap-4 items-center justify-between print:hidden">
                 <Link href="/shop" className={buttonVariants({ variant: 'dark', size: 'lg', className: 'w-full sm:w-auto !rounded-[12px] px-8 tracking-widest text-[11px] uppercase shadow-md hover:-translate-y-0.5 transition-all h-14' })}>
                   {t('continueShopping')}
                 </Link>
                 <button onClick={() => window.print()} className="flex items-center gap-2 hover:text-black transition-colors font-medium text-sm text-gray-500">
                   <Printer size={16} /> {t('printReceipt')}
                 </button>
              </FadeUp>

            </div>

            {/* DESKTOP ONLY: Order Summary (Sticky) (Visible only on lg:block) */}
            <div className="hidden lg:block w-full lg:w-[45%] xl:w-[40%] print:block print:w-full">
              {renderOrderSummary()}
            </div>

          </div>
        </Container>
      </div>
    </>
  )
}
