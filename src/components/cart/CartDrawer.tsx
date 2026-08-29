'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button, buttonVariants } from '@/components/ui/button'
import { QuantityStepper } from '@/components/shop/QuantityStepper'
import { useCartStore } from '@/lib/cart/store'
import { EmptyState } from '@/components/shared/EmptyState'
import { ShoppingBag } from 'lucide-react'
import { useLenis } from 'lenis/react'
import { FluidButton } from '@/components/ui/fluid-button'
import { toast } from 'sonner'


export function CartDrawer() {
  const t = useTranslations('checkout.cartDrawer')
  const { isOpen, closeCart, items, removeItem, updateQuantity } = useCartStore()
  const lenis = useLenis()

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      document.documentElement.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
      document.documentElement.style.overflow = 'unset'
    }
  }, [isOpen])

  // Esc key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [closeCart])

  const subtotal = items.reduce((acc, item) => acc + item.priceSnapshot * item.quantity, 0)

  const [isReady, setIsReady] = useState(false)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(null)
  const previousSubtotal = useRef(subtotal)
  
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 500) // wait for hydration
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let active = true
    fetch('/api/shippingzones')
      .then(res => res.json())
      .then(data => {
        if (active && data?.docs?.length > 0) {
          const methods = data.docs[0].methods || []
          const freeMethod = methods.find((m: any) => m.price === 0 && m.minOrderAmount > 0)
          if (freeMethod) {
            setFreeShippingThreshold(freeMethod.minOrderAmount)
          }
        }
      })
      .catch(err => console.error("Error fetching shipping zones for cart drawer", err))
      
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (isReady && freeShippingThreshold && subtotal >= freeShippingThreshold && previousSubtotal.current < freeShippingThreshold) {
      toast.success(t('freeShippingUnlockedToast'))
    }
    previousSubtotal.current = subtotal
  }, [subtotal, isReady, t, freeShippingThreshold])

  const progressToFreeShipping = freeShippingThreshold ? Math.min((subtotal / freeShippingThreshold) * 100, 100) : 0
  const amountToFreeShipping = freeShippingThreshold ? freeShippingThreshold - subtotal : 0

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            onClick={closeCart}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: 'transform' }}
            className="fixed top-0 right-0 h-[100dvh] w-full md:w-[480px] bg-[#FAFAFA] md:rounded-l-2xl z-[101] shadow-2xl flex flex-col overflow-hidden transform-gpu border-l border-slate-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-8 pb-4 md:px-8 md:pt-10 shrink-0 relative border-b border-slate-200 bg-white">
              <h2 className="font-heading text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                {t('title')}
                <span className="flex items-center justify-center bg-blue-900 text-white text-xs w-6 h-6 rounded-full font-bold shadow-sm">
                  {items.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
              </h2>
              <button
                onClick={closeCart}
                className="p-2 -mr-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-900 transition-colors focus:outline-none"
                aria-label={t('closeCartAria')}
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            {items.length === 0 ? (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
                <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-8 relative">
                  <ShoppingBag className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-3xl font-black text-slate-900 mb-3 uppercase tracking-wider text-center">{t('emptyTitle')}</h3>
                <p className="text-slate-500 text-center mb-10 max-w-xs leading-relaxed font-medium">
                  {t('emptyText')}
                </p>
                <FluidButton
                  href="/shop"
                  onClick={closeCart}
                  text={t('discoverQuality')}
                  variant="dark"
                />
              </div>
            ) : (
              /* Populated Cart */
              <>
                {/* Shipping Progress */}
                {freeShippingThreshold !== null && (
                  <div className="px-6 md:px-8 py-4 shrink-0 bg-slate-50 border-b border-slate-200">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                      {amountToFreeShipping > 0
                        ? t('freeShippingProgress', { amount: amountToFreeShipping.toFixed(2) })
                        : t('freeShippingUnlocked')}
                    </p>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                      <motion.div 
                        className="h-full bg-blue-900 rounded-full shadow-sm relative"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressToFreeShipping}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      >
                        <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)', transform: 'skewX(-20deg)' }} />
                      </motion.div>
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div 
                  className="flex-1 overflow-y-auto px-6 md:px-8 py-4 overscroll-y-contain custom-scrollbar" 
                  data-lenis-prevent="true"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  <div className="flex flex-col gap-4 pb-4">
                    <AnimatePresence>
                      {items.map((item) => (
                        <motion.div 
                          key={item.lineId}
                          layout
                          initial={{ opacity: 0, scale: 0.95, height: 0 }}
                          animate={{ opacity: 1, scale: 1, height: 'auto' }}
                          exit={{ opacity: 0, scale: 0.95, height: 0 }}
                          className="flex gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-300 relative group overflow-hidden shadow-sm"
                        >
                          <div className="relative w-20 h-20 bg-slate-100 rounded-lg shrink-0 overflow-hidden border border-slate-200">
                            <Image src={item.product?.imageUrl || '/placeholder.png'} alt={item.product?.name || 'Product'} fill className="object-cover hover:scale-110 transition-transform duration-500 group-hover:opacity-100" />
                          </div>
                          <div className="flex flex-col flex-1 justify-between py-0.5 min-w-0 relative z-10">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex flex-col">
                                <Link href={`/product/${item.product?.slug || item.productId}`} onClick={closeCart} className="text-sm font-bold font-sans text-slate-900 hover:text-blue-900 transition-colors line-clamp-1 leading-tight">
                                  {item.product?.name}
                                </Link>
                                <span className="text-[10px] uppercase tracking-wider text-slate-500 mt-1 font-bold">
                                  {item.variantTitle || item.variantSku}
                                </span>
                              </div>
                              <button
                                onClick={() => removeItem(item.lineId)}
                                className="text-slate-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-full -mt-1 -mr-1"
                                aria-label={t('removeItemAria')}
                              >
                                <X size={14} strokeWidth={2} />
                              </button>
                            </div>
                            <div className="flex items-end justify-between mt-2">
                              <div>
                                <QuantityStepper 
                                  value={item.quantity} 
                                  onChange={(val) => updateQuantity(item.lineId, val)} 
                                  size="responsive"
                                />
                              </div>
                              <span className="text-sm font-extrabold text-slate-900 tracking-wide">
                                ${(item.priceSnapshot * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Sticky Summary */}
                <div className="px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:px-8 md:pb-8 bg-white/80 backdrop-blur-xl shrink-0 border-t border-slate-200 z-10 relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{t('subtotal')}</span>
                    <span className="text-2xl text-slate-900 font-black font-heading tracking-tight">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{t('shipping')}</span>
                    <span className="text-sm text-blue-900 font-bold">
                      {t('calculatedAtCheckout')}
                    </span>
                  </div>
                  <div className="w-full flex justify-center mb-4">
                    <FluidButton
                      href="/checkout"
                      onClick={closeCart}
                      text={t('checkout')}
                      variant="dark"
                      className="w-full shadow-md shadow-black/5"
                    />
                  </div>
                  <Link href="/cart" onClick={closeCart} className="flex items-center justify-center w-full text-slate-400 hover:text-blue-900 text-[10px] uppercase tracking-[0.2em] font-bold transition-colors">
                    {t('viewFullCart')}
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
