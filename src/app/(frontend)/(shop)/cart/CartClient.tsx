'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { X, CreditCard, ShoppingBag, ArrowRight, ArrowLeft, ChevronRight as ChevronRightIcon, Loader2, Check, Trash2, Lock, ShieldCheck, Package, Receipt, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/container'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QuantityStepper } from '@/components/shop/QuantityStepper'
import { useCartStore } from '@/lib/cart/store'
import { ProductCard } from '@/components/shared/ProductCard'
import { StaggerChildren, staggerItemVariants } from '@/components/motion/StaggerChildren'


import { useSearchParams, useRouter } from 'next/navigation'
import { getProductsFromAffiliateCart } from '@/app/(frontend)/actions/cart'

export function CartClient() {
  const t = useTranslations('checkout.cartClient')
  const { items, removeItem, updateQuantity, couponCode: storedCouponCode, setCoupon, clear, setItems } = useCartStore()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Dynamic Data States
  const [shippingCost, setShippingCost] = useState<number | null>(null)
  const [taxAmount, setTaxAmount] = useState<number>(0)
  const [feePercentage, setFeePercentage] = useState<number | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Cart Hydration State — zustand's persist middleware reads localStorage asynchronously,
  // so `items` is briefly `[]` (subtotal 0) on first render. Without waiting for hydration,
  // the shipping/fee fetch below would run once against that empty-cart subtotal and finish
  // before the real items arrive, flashing a total based on stale shipping/tax data.
  // `useCartStore.persist` only exists client-side (its localStorage-backed storage isn't
  // available during SSR, so the middleware never attaches `.persist` on the server) — this
  // check must stay inside an effect, never in a render-phase initializer.
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    if (useCartStore.persist.hasHydrated()) {
      setHasHydrated(true)
      return
    }
    return useCartStore.persist.onFinishHydration(() => setHasHydrated(true))
  }, [])

  // Coupon States
  const [couponCode, setCouponCode] = useState('')
  const [couponState, setCouponState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [couponMessage, setCouponMessage] = useState('')
  const [activeCoupon, setActiveCoupon] = useState<any>(null)

  // Related Products State
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])

  // Base Subtotal
  const subtotal = items.reduce((acc, item) => acc + item.priceSnapshot * item.quantity, 0)

  // Handle Affiliate Cart URL Parameters
  useEffect(() => {
    const affiliateCartParams = searchParams.get('affiliate-cart')
    const shouldClear = searchParams.get('clear-cart') === '1'
    
    if (affiliateCartParams) {
      // Record which sibling storefront's cart handoff this came from (e.g. Scarlett-Peptides
      // sends origin=peptides7) so the order created at checkout can be tagged with it. Whitelisted
      // to a safe charset since this value is attacker-controlled (arrives via a public URL param).
      const origin = searchParams.get('origin')
      if (origin && /^[a-zA-Z0-9_-]{1,50}$/.test(origin)) {
        document.cookie = `order_source=${origin}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
      }

      setIsLoadingData(true)
      getProductsFromAffiliateCart(affiliateCartParams).then((fetchedItems) => {
        if (fetchedItems && fetchedItems.length > 0) {
          if (shouldClear) {
            setItems(fetchedItems)
          } else {
            // Append and merge quantities if same sku
            const merged = [...items]
            fetchedItems.forEach(fi => {
              const existing = merged.find(mi => mi.productId === fi.productId && mi.variantSku === fi.variantSku)
              if (existing) {
                existing.quantity += fi.quantity
              } else {
                merged.push(fi)
              }
            })
            setItems(merged)
          }
        }
        
        // Remove params from URL to avoid re-triggering
        const url = new URL(window.location.href)
        url.searchParams.delete('affiliate-cart')
        url.searchParams.delete('clear-cart')
        url.searchParams.delete('empty-cart')
        url.searchParams.delete('origin')
        url.searchParams.delete('utm_source')
        url.searchParams.delete('utm_medium')
        url.searchParams.delete('utm_campaign')
        router.replace(url.pathname + url.search)
      }).catch(err => {
        console.error("Failed to parse affiliate cart:", err)
      }).finally(() => {
        setIsLoadingData(false)
      })
    }
  }, [searchParams, router, setItems])

  // Fetch Shipping and Tax on mount — waits for cart hydration so it runs against the real
  // subtotal instead of the transient empty-cart (0) subtotal.
  useEffect(() => {
    if (!hasHydrated) return

    async function fetchCartData() {
      setIsLoadingData(true)
      try {
        // Fetch Shipping Zones to get an estimated base shipping cost
        const shippingRes = await fetch('/api/shippingzones')
        const shippingData = await shippingRes.json()
        
        let estimatedShipping = 15 // Fallback
        if (shippingData?.docs?.length > 0) {
          // Grab the first available shipping method price from the first zone
          const firstZone = shippingData.docs[0]
          if (firstZone.methods?.length > 0) {
            estimatedShipping = firstZone.methods[0].price // Use dollar value directly
          }
        }
        
        // Fetch Processing Fees (Taxes/Fees)
        const feesRes = await fetch('/api/processing-fees')
        const feesData = await feesRes.json()
        
        let calculatedTax = 0
        let percentageFee: number | null = null
        if (feesData?.docs?.length > 0) {
          feesData.docs.forEach((fee: any) => {
            if (fee.isActive && !fee.isOptional) {
              if (fee.type === 'percentage') {
                calculatedTax += subtotal * (fee.amount / 100)
                percentageFee = fee.amount
              } else if (fee.type === 'fixed_amount') {
                calculatedTax += fee.amount
              }
            }
          })
        }

        setShippingCost(estimatedShipping)
        setTaxAmount(calculatedTax)
        setFeePercentage(percentageFee)
      } catch (err) {
        console.error("Error fetching dynamic cart data", err)
        setShippingCost(15) // Fallback
      } finally {
        setIsLoadingData(false)
      }
    }

    async function fetchRelatedProducts() {
      try {
        const res = await fetch('/api/products?limit=4&depth=1')
        const data = await res.json()
        if (data?.docs?.length > 0) {
          const mapped = data.docs.map((p: any) => {
            let displayPrice = typeof p.price === 'number' ? p.price : 0
            let displaySalePrice = typeof p.salePrice === 'number' && p.salePrice > 0 ? p.salePrice : undefined
            let isFrom = false

            if (p.hasVariants && p.variants && p.variants.length > 0) {
              const prices = p.variants.map((v: any) => typeof v.salePrice === 'number' && v.salePrice > 0 ? v.salePrice : v.price).filter(Boolean)
              if (prices.length > 0) {
                const minVariantPrice = Math.min(...prices)
                const maxVariantPrice = Math.max(...prices)
                if (minVariantPrice !== maxVariantPrice) {
                  isFrom = true
                }
                displayPrice = minVariantPrice
                
                const cheapestVariant = p.variants.find((v: any) => (v.salePrice || v.price) === minVariantPrice)
                if (cheapestVariant && typeof cheapestVariant.salePrice === 'number' && cheapestVariant.salePrice > 0) {
                  displaySalePrice = cheapestVariant.salePrice
                  displayPrice = cheapestVariant.price
                } else {
                  displaySalePrice = undefined
                }
              }
            }

            return {
              id: p.id,
              name: p.name,
              slug: p.slug,
              image: p.images?.[0]?.image?.url || p.imageUrl || '/placeholder.png',
              hoverImage: p.images?.[1]?.image?.url || undefined,
              shortDescription: p.shortDescription || p.description || p.descriptor || '',
              priceRange: displaySalePrice
                ? `${isFrom ? t('fromPricePrefix') : ''}$${displaySalePrice.toFixed(2)}`
                : `${isFrom ? t('fromPricePrefix') : ''}$${displayPrice.toFixed(2)}`,
              originalPrice: (displaySalePrice && !isFrom)
                ? `$${displayPrice.toFixed(2)}` 
                : undefined,
              discountPercentage: (displaySalePrice && displayPrice > 0)
                ? Math.round(((displayPrice - displaySalePrice) / displayPrice) * 100)
                : undefined,
              category: typeof p.category === 'object' ? p.category?.name : t('categoryFallback'),
            }
          })
          setRelatedProducts(mapped)
        }
      } catch (err) {
        console.error("Error fetching related products", err)
      }
    }

    fetchCartData()
    fetchRelatedProducts()
  }, [subtotal, hasHydrated])

  // Handle Coupon Application
  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = typeof codeToApply === 'string' ? codeToApply : couponCode;
    if (!code) return
    
    setCouponState('loading')
    setCouponMessage('')
    
    try {
      const res = await fetch(`/api/validate-coupon?code=${encodeURIComponent(code.trim())}`)
      const data = await res.json()
      const coupon = data?.coupon

      if (coupon && coupon.isActive !== false) {
        // Prevent Self-Referral Coupon Usage
        try {
          const meRes = await fetch('/api/users/me')
          const meData = await meRes.json()
          const userId = meData?.user?.id
          
          if (userId) {
            const affRes = await fetch(`/api/affiliates?where[user][equals]=${userId}&where[couponCode][equals]=${coupon.code}`)
            const affData = await affRes.json()
            if (affData?.docs?.length > 0) {
              setCouponState('error')
              setCouponMessage('You cannot use your own affiliate coupon.')
              return
            }
          }
        } catch (e) {
          console.error("Error checking coupon affiliate:", e)
        }
        
        // Validate Expiration
        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
          setCouponState('error')
          setCouponMessage(t('couponExpired'))
          return
        }

        // Validate Usage Limit
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
          setCouponState('error')
          setCouponMessage(t('couponUsageLimitReached'))
          return
        }

        // Validate Min Spend (both are in dollars)
        if (coupon.minSpend && subtotal < coupon.minSpend) {
          setCouponState('error')
          setCouponMessage(t('couponMinSpend', { amount: coupon.minSpend.toFixed(2) }))
          return
        }

        setActiveCoupon(coupon)
        setCouponState('success')
        setCouponMessage(t('couponAppliedSuccess'))
        setCoupon(coupon.code)
      } else {
        setCouponState('error')
        setCouponMessage(t('couponInvalid'))
      }
    } catch (err) {
      setCouponState('error')
      setCouponMessage(t('couponValidationError'))
    }
  }

  const handleRemoveCoupon = () => {
    setActiveCoupon(null)
    setCouponCode('')
    setCouponState('idle')
    setCouponMessage('')
    setCoupon(null)
  }

  // Pre-fill stored coupon and re-validate on subtotal change
  useEffect(() => {
    if (activeCoupon) {
      // Re-validate minSpend locally
      if (activeCoupon.minSpend && subtotal < activeCoupon.minSpend) {
        setActiveCoupon(null)
        setCouponCode('')
        setCouponState('error')
        setCouponMessage(t('couponMinSpend', { amount: activeCoupon.minSpend.toFixed(2) }))
        setCoupon(null) // Remove from global store
      }
    } else if (storedCouponCode && couponState === 'idle') {
      setCouponCode(storedCouponCode)
      handleApplyCoupon(storedCouponCode)
    }
  }, [subtotal, storedCouponCode, activeCoupon, couponState])

  // Calculate Discounts
  let discountAmount = 0
  let isFreeShipping = false
  let eligibleSubtotal = 0

  if (activeCoupon) {
    if (activeCoupon.freeShipping) {
      isFreeShipping = true
    }
    
    // Calculate eligible subtotal
    items.forEach(item => {
      let eligible = true
      
      if (activeCoupon.excludeSaleItems && (item.product as any)?.salePrice) {
        eligible = false
      }
      
      if (activeCoupon.applicableProductTypes && activeCoupon.applicableProductTypes !== 'all') {
        const isBulkBundle = typeof item.variantSku === 'string' && item.variantSku.includes(' - ')
        if (activeCoupon.applicableProductTypes === 'normal_only' && isBulkBundle) {
          eligible = false
        } else if (activeCoupon.applicableProductTypes === 'bulk_only' && !isBulkBundle) {
          eligible = false
        }
      }
      
      if (eligible && activeCoupon.appliesTo === 'specific_products') {
        const allowedProductIds = (activeCoupon.products || []).map((p: any) => typeof p.product === 'object' ? p.product.id : p.product)
        if (!allowedProductIds.includes(item.productId)) eligible = false
      }
      
      if (eligible && activeCoupon.appliesTo === 'specific_categories') {
        // Simple check: we don't have full category data in cart item, but this is a best-effort frontend display.
        // The backend `actions.ts` will rigorously validate it anyway.
        // We will assume it's eligible on the frontend unless we explicitly know it's not.
      }
      
      if (eligible) {
        eligibleSubtotal += item.priceSnapshot * item.quantity
      }
    })

    if (activeCoupon.type === 'percentage') {
      discountAmount = eligibleSubtotal * (activeCoupon.value / 100)
    } else if (activeCoupon.type === 'fixed_amount') {
      discountAmount = Math.min((activeCoupon.value / 100), eligibleSubtotal)
    }
  }

  // Mirrors the rule enforced server-side in checkout/actions.ts —
  // Express shipping is never free.
  const qualifiesForFreeShipping = isFreeShipping || false
  const finalShipping = (qualifiesForFreeShipping || subtotal === 0) ? 0 : (shippingCost || 0)
  const finalTotal = Math.max(0, subtotal - discountAmount + finalShipping + taxAmount)

  if (!hasHydrated) {
    return (
      <Container size="page" className="py-24 flex items-center justify-center min-h-[50vh]">
        <Loader2 size={24} className="animate-spin text-ink/30" />
      </Container>
    )
  }

  if (items.length === 0) {
    return (
      <Container size="page" className="py-24 flex flex-col items-center justify-center text-center min-h-[50vh]">
        <ShoppingBag size={32} className="text-ink/20 mb-6" />
        <h1 className="text-2xl font-light tracking-tight text-ink mb-2">
          {t('emptyTitle')}
        </h1>
        <p className="text-sm text-ink/50 mb-8 max-w-sm font-light">
          {t('emptyText')}
        </p>
        <Link
          href="/shop"
          className="bg-ink text-white px-6 py-2.5 rounded-md font-medium text-xs uppercase tracking-widest hover:bg-ink/90 transition-colors"
        >
          {t('browseProducts')}
        </Link>
      </Container>
    )
  }

  return (
    <Container size="wide" className="py-12 md:py-16">
      
      {/* Top Header: < Back and YOUR CART */}
      <div className="mb-12">
        <Link href="/shop" className="text-[11px] font-bold uppercase tracking-widest text-black hover:text-gray-500 transition-colors flex items-center gap-2 w-fit mb-6">
          <ArrowLeft size={14} />
          BACK
        </Link>
        <h1 className="text-4xl md:text-5xl font-light text-black tracking-tight leading-none uppercase">
          {t('yourCart')}
        </h1>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-0">
        
        {/* Left Column: Dense Item List */}
        <div className="flex-1 flex flex-col lg:pr-16">
          <div className="flex flex-col">
            {items.map((item) => (
              <div key={item.lineId} className="flex flex-row items-start sm:items-center py-6 sm:py-8 border-b border-gray-200 gap-4 sm:gap-6 group w-full">
                
                {/* 1. Remove (X) Desktop only */}
                <button
                  onClick={() => removeItem(item.lineId)}
                  className="hidden sm:flex text-gray-400 hover:text-red-500 transition-colors shrink-0"
                  aria-label={t('removeItemAria')}
                >
                  <X size={18} strokeWidth={1.5} />
                </button>

                {/* 2. Thumbnail */}
                <Link href={`/product/${item.product?.slug || item.productId}`} className="relative w-24 h-24 sm:w-20 sm:h-20 shrink-0 rounded-[16px] overflow-hidden bg-[#f0f0f0]">
                  <Image 
                    src={item.product?.imageUrl || '/placeholder.png'} 
                    alt={item.product?.name || 'Product'} 
                    width={600}
                    height={600}
                    quality={100}
                    className="w-full h-full object-cover object-center mix-blend-multiply group-hover:scale-105 transition-transform" 
                  />
                </Link>
                
                {/* 3. Details (Name & Variant) + Stepper & Price */}
                <div className="flex flex-col sm:flex-row sm:items-center flex-1 min-w-0 gap-3 sm:gap-4">
                  
                  {/* Title & Info */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-start w-full">
                      <Link href={`/product/${item.product?.slug || item.productId}`} className="text-sm sm:text-base font-bold text-black hover:text-gray-600 transition-colors pr-2 leading-tight">
                        {item.product?.name}
                      </Link>
                      <button onClick={() => removeItem(item.lineId)} className="sm:hidden text-gray-400 hover:text-red-500 shrink-0 mt-0.5">
                        <X size={16} />
                      </button>
                    </div>
                    
                    {(item.variantTitle || item.variantSku) && !['DEFAULT', 'DEFAULT TITLE'].includes((item.variantTitle || item.variantSku || '').toUpperCase()) && (
                      <span className="text-[11px] text-gray-400 mt-1.5 truncate">
                        {item.variantTitle || item.variantSku}
                      </span>
                    )}
                  </div>

                  {/* Mobile Price & Stepper Row */}
                  <div className="flex items-center justify-between sm:hidden mt-2 w-full">
                    <span className="text-sm font-bold text-black">
                      ${(item.priceSnapshot * item.quantity).toFixed(2)}
                    </span>
                    <div className="flex items-center justify-center border border-gray-200 rounded-full bg-transparent px-2 h-8 w-20">
                      <button onClick={() => updateQuantity(item.lineId, Math.max(1, item.quantity - 1))} className="px-2 text-gray-500 hover:text-black transition-colors">-</button>
                      <span className="flex-1 text-center text-[10px] font-bold text-black">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.lineId, item.quantity + 1)} className="px-2 text-gray-500 hover:text-black transition-colors">+</button>
                    </div>
                  </div>

                  {/* Desktop Stepper */}
                  <div className="hidden sm:flex items-center justify-center border border-gray-200 rounded-full bg-transparent px-2 h-9 w-24">
                    <button onClick={() => updateQuantity(item.lineId, Math.max(1, item.quantity - 1))} className="px-2 text-gray-500 hover:text-black transition-colors">-</button>
                    <span className="flex-1 text-center text-xs font-bold text-black">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.lineId, item.quantity + 1)} className="px-2 text-gray-500 hover:text-black transition-colors">+</button>
                  </div>

                  {/* Desktop Total Price */}
                  <div className="hidden sm:flex flex-col items-end min-w-[80px]">
                    <span className="text-base font-bold text-black">
                      ${(item.priceSnapshot * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Bottom Left: Coupon Area */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12 lg:mb-0">
            <div className="flex flex-col gap-3 w-full sm:w-auto">
              <span className="text-xs text-gray-500 font-light">{t('haveCoupon')}</span>
              
              <div className="flex gap-4 items-center w-full">
                <div className="relative w-full sm:w-64">
                  <input
                    placeholder={t('couponCode')}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={activeCoupon !== null || couponState === 'loading'}
                    className="w-full bg-transparent border-b border-gray-300 focus:border-black h-10 px-0 text-[11px] tracking-widest text-black placeholder:text-gray-300 transition-all outline-none disabled:opacity-50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleApplyCoupon()
                    }}
                  />
                </div>
                <button
                  onClick={activeCoupon ? handleRemoveCoupon : () => handleApplyCoupon()}
                  disabled={(!couponCode && !activeCoupon) || couponState === 'loading'}
                  className={`h-10 px-6 border rounded-[12px] text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center shrink-0 ${
                    activeCoupon
                      ? 'border-red-200 text-red-500 hover:bg-red-50'
                      : 'border-gray-300 text-black hover:border-black disabled:opacity-50'
                  }`}
                >
                  {couponState === 'loading' ? <Loader2 size={12} className="animate-spin" /> : (activeCoupon ? t('remove') : t('apply', { fallback: 'APPLY' }))}
                </button>
              </div>
              <AnimatePresence>
                {couponMessage && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${couponState === 'error' ? 'text-red-500' : 'text-emerald-600'}`}
                  >
                    {couponMessage}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="w-full lg:w-[420px] lg:pl-12 border-t lg:border-t-0 lg:border-l border-gray-200 lg:border-gray-300 pt-10 lg:pt-0 shrink-0">
          <div className="sticky top-32">
            
            <div className="mb-10">
              <h2 className="text-xl font-light text-black tracking-wide uppercase">
                {t('orderSummary')}
              </h2>
            </div>

            <div className="flex flex-col gap-4 text-xs pb-6 border-b-[2px] border-black mb-6">
              
              <div className="flex justify-between items-center text-gray-500">
                <span>{t('estimatedShipping')}</span>
                <span className="text-black font-medium">
                  {isLoadingData ? <Loader2 size={12} className="animate-spin text-gray-400" /> : (finalShipping === 0 ? t('free') : `$${finalShipping.toFixed(2)}`)}
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-500">
                <span>{t('processingFee')}{feePercentage ? ` (${feePercentage}%)` : ''}</span>
                <span className="text-black font-medium">
                  {isLoadingData ? <Loader2 size={12} className="animate-spin text-gray-400" /> : `$${taxAmount.toFixed(2)}`}
                </span>
              </div>

              {activeCoupon && (
                <div className="flex justify-between items-center text-emerald-600">
                  <span>{t('discount')}</span>
                  <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-gray-500 mt-2">
                <span>{t('subtotal')}</span>
                <span className="text-black font-medium">${subtotal.toFixed(2)}</span>
              </div>

            </div>

            <div className="flex justify-between items-center mb-10">
              <span className="text-sm font-bold text-black uppercase">{t('total')}</span>
              {isLoadingData ? (
                <Loader2 size={24} className="animate-spin text-gray-300" />
              ) : (
                <span className="text-base font-bold text-black">
                  ${finalTotal.toFixed(2)}
                </span>
              )}
            </div>

            <Link
              href="/checkout"
              className="w-full bg-[#121212] text-white h-[52px] rounded-[16px] font-bold text-[10px] tracking-widest uppercase flex items-center justify-center transition-colors hover:bg-black mb-6 shadow-sm"
            >
              {t('secureCheckout')}
            </Link>

            <div className="flex justify-center">
              <Link
                href="/shop"
                className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={10} strokeWidth={2.5} />
                {t('continueExploring')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Sells: Compact Format */}
      {relatedProducts.length > 0 && (
        <div className="mt-24 pt-16 border-t border-gray-200">
          <div className="mb-8">
            <h2 className="text-2xl font-light tracking-tight text-black">
              {t('alsoConsidered', { fallback: 'Also Considered' })}
            </h2>
          </div>
          
          <StaggerChildren staggerDelay={0.05} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {relatedProducts.map((p) => (
              <motion.div variants={staggerItemVariants} key={p.id}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </StaggerChildren>
        </div>
      )}
    </Container>
  )
}

