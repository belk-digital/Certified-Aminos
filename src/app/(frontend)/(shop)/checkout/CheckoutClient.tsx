'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, ChevronUp, Lock, Loader2, ArrowRight, ArrowLeft, ShieldCheck, Tag, ShoppingCart, Sparkles, Truck, Zap, CreditCard, Wallet, Smartphone } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Container } from '@/components/ui/container'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckoutPageSkeleton } from '@/components/ui/skeleton'
import { COUNTRIES } from '@/lib/countries'
import { useCartStore } from '@/lib/cart/store'
import { verifyCoupon, getUserDefaultAddress, getUserHBPoints, getUserAddresses } from '../actions'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { StripeCheckoutForm } from './StripeCheckoutForm'
import { createPaymentIntent, getShippingMethods } from './actions'


// Card payments are temporarily disabled in favor of Zelle. Flip this back to re-enable Stripe —
// the rest of the Stripe integration below is left intact, just not rendered/called while off.
const ENABLE_STRIPE = false

// Toggle to enable/disable the CircoFlows hosted-card option without touching Stripe/Zelle/Amex.
const ENABLE_CIRCOFLOWS = false

const stripePromise = typeof window !== 'undefined' ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '') : null

export function CheckoutClient() {
  const t = useTranslations('checkout.checkoutClient')
  const { items, couponCode: storedCouponCode, setCoupon } = useCartStore()
  const { data: session } = useSession()
  const user = session?.user
  
  // Mobile summary toggle
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(true)

  // Stripe
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)

  // Maxx Points State
  const [availablePoints, setAvailablePoints] = useState(0)
  const [isRedeemingPoints, setIsRedeemingPoints] = useState(false)

  // Address Selection State
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new'>('new')

  // Form State
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'zelle' | 'amex' | 'circoflows' | 'stripe_link'>('zelle')
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    marketing: false,
    saveInfo: false
  })

  // Prefill Data
  useEffect(() => {
    const prefillData = async () => {
      if (!user) return
      
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
      }))

      try {
        const userAddresses = await getUserAddresses()
        if (userAddresses && userAddresses.length > 0) {
          setAddresses(userAddresses)
          const defaultAddress = userAddresses.find((a: any) => a.isDefaultShipping) || userAddresses[0]
          setSelectedAddressId(String(defaultAddress.id))
          setFormData(prev => ({
            ...prev,
            address: defaultAddress.line1,
            apartment: defaultAddress.line2 || '',
            city: defaultAddress.city,
            state: defaultAddress.state,
            zip: defaultAddress.postalCode,
            country: defaultAddress.country || 'US',
            phone: defaultAddress.phone || ''
          }))
        }
      } catch (err) {
        console.error('Failed to load user addresses:', err)
      }

      const points = await getUserHBPoints()
      setAvailablePoints(points)
    }
    
    prefillData()
  }, [user])

  // Shipping State
  const [availableShippingMethods, setAvailableShippingMethods] = useState<any[]>([])
  const [shippingMethod, setShippingMethod] = useState<string>('')
  const [activeFees, setActiveFees] = useState<any[]>([])
  
  const [dataLoaded, setDataLoaded] = useState(false)
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [isSavingAddress, setIsSavingAddress] = useState(false)

  const handleSaveAddressEdit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.address || !formData.city || !formData.state || !formData.zip || !formData.phone) {
      toast.error(t('errorRequiredFields', { fallback: 'Please fill out all required fields' }))
      return
    }

    setIsSavingAddress(true)
    try {
      const { updateAddress } = await import('../account/addresses/actions')
      const fd = new FormData()
      fd.append('firstName', formData.firstName)
      fd.append('lastName', formData.lastName)
      fd.append('line1', formData.address)
      if (formData.apartment) fd.append('line2', formData.apartment)
      fd.append('city', formData.city)
      fd.append('state', formData.state)
      fd.append('zip', formData.zip)
      fd.append('country', formData.country || 'US')
      fd.append('phone', formData.phone)
      
      const res = await updateAddress(selectedAddressId, fd)
      if (res.success) {
        toast.success(t('addressUpdated', { fallback: 'Address updated successfully' }))
        setIsEditingAddress(false)
        setAddresses(prev => prev.map(a => 
          String(a.id) === selectedAddressId ? {
            ...a,
            firstName: formData.firstName,
            lastName: formData.lastName,
            line1: formData.address,
            line2: formData.apartment,
            city: formData.city,
            state: formData.state,
            postalCode: formData.zip,
            country: formData.country || 'US',
            phone: formData.phone
          } : a
        ))
      } else {
        toast.error(res.error || 'Failed to update address')
      }
    } catch (e: any) {
      toast.error(e.message || 'An error occurred')
    } finally {
      setIsSavingAddress(false)
    }
  }

  // Fetch data
  useEffect(() => {
    Promise.all([
      getShippingMethods(),
      fetch('/api/processing-fees').then(res => res.json()).catch(() => ({}))
    ]).then(([methods, data]) => {
      setAvailableShippingMethods(methods)
      if (methods.length > 0) {
        setShippingMethod(methods[0].method)
      }
      
      if (data?.docs) {
        const active = data.docs.filter((f: any) => f.isActive && !f.isOptional)
        setActiveFees(active)
      }
      
      setDataLoaded(true)
    }).catch(() => {
      setDataLoaded(true)
    })
  }, [])

  // Coupon State
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; freeShipping: boolean; description: string } | null>(null)
  const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false)

  // Order Calculations
  const subtotal = items.reduce((acc, item) => acc + item.priceSnapshot * item.quantity, 0)

  // Fire the free-shipping toast once per crossing, not on every render while above the threshold.
  const previousSubtotal = useRef(subtotal)
  const [isReady, setIsReady] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 500) // wait for hydration
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    previousSubtotal.current = subtotal
  }, [subtotal, isReady, t])

  // International orders (anything outside the US) get a single flat rate — configured in the
  // Payload admin's Shipping Zones as the method with "Is International Shipping" checked —
  // instead of the configured US shipping zone's methods. No free-shipping threshold, no
  // Express option, since the US zone's methods/thresholds don't reflect real international cost.
  const isInternational = !!formData.country && formData.country !== 'US'

  const internationalMethod = availableShippingMethods.find((method: any) => method.isInternational)
    || { method: 'International Shipping', price: 50, estimatedDays: null, minOrderAmount: 0 }

  const visibleShippingMethods = isInternational
    ? [internationalMethod]
    : availableShippingMethods.filter((method: any) => {
        if (method.isInternational) return false
        if (method.minOrderAmount && method.minOrderAmount > 0) {
          return subtotal >= method.minOrderAmount
        }
        return true
      })

  // Tracks which methods were visible last time this effect ran, so the "auto-upgrade to a
  // newly available cheaper method" branch only fires the moment that set actually changes
  // (e.g. crossing the free-shipping subtotal threshold) — not on every re-run triggered by
  // the user's own manual shippingMethod selection, which would otherwise immediately revert
  // any choice other than the cheapest option.
  const previousVisibleMethodsKey = useRef<string>('')

  useEffect(() => {
    if (visibleShippingMethods.length === 0) return

    const isCurrentValid = visibleShippingMethods.some(m => m.method === shippingMethod)
    const cheapestMethod = [...visibleShippingMethods].sort((a, b) => a.price - b.price)[0]

    if (!isCurrentValid) {
      // Previously selected method dropped out (e.g. subtotal fell below its own
      // minOrderAmount) — fall back to the cheapest available option.
      setShippingMethod(cheapestMethod.method)
      return
    }

    const visibleMethodsKey = visibleShippingMethods.map(m => m.method).sort().join(',')
    const methodsSetChanged = visibleMethodsKey !== previousVisibleMethodsKey.current
    previousVisibleMethodsKey.current = visibleMethodsKey

    if (methodsSetChanged) {
      const isCurrentExpress = shippingMethod.toLowerCase().includes('express')
      const currentMethodObj = visibleShippingMethods.find(m => m.method === shippingMethod)
      if (!isCurrentExpress && currentMethodObj && cheapestMethod.price < currentMethodObj.price) {
        // Auto-select the cheaper method (like Free Shipping) the moment it becomes available.
        setShippingMethod(cheapestMethod.method)
      }
    }
  }, [subtotal, availableShippingMethods, shippingMethod, isInternational])

  const selectedMethodObj = visibleShippingMethods.find(m => m.method === shippingMethod) || visibleShippingMethods[0]
  const shippingCost = selectedMethodObj?.price || 0
  const isExpressShipping = shippingMethod.toLowerCase().includes('express')
  const qualifiesForFreeShipping = appliedCoupon?.freeShipping || false
  const finalShipping = (qualifiesForFreeShipping && !isExpressShipping && !isInternational) ? 0 : shippingCost
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount)
  
  // Calculate dynamic fees
  let processingFeeAmount = 0
  let activeFeePercentage: number | null = null
  activeFees.forEach((fee: any) => {
    if (fee.type === 'percentage') {
      processingFeeAmount += subtotalAfterDiscount * (fee.amount / 100)
      activeFeePercentage = fee.amount
    } else if (fee.type === 'fixed_amount') {
      processingFeeAmount += fee.amount
    }
  })

  const totalBeforePoints = subtotalAfterDiscount + finalShipping + processingFeeAmount
  
  const pointsToRedeem = isRedeemingPoints ? Math.min(availablePoints, totalBeforePoints) : 0
  const total = totalBeforePoints - pointsToRedeem

  // Fetch client secret when order details change (skipped while Stripe is disabled)
  useEffect(() => {
    if (ENABLE_STRIPE && items.length > 0 && total > 0) {
      createPaymentIntent(items, shippingMethod, appliedCoupon?.code, isRedeemingPoints, formData.country)
        .then(res => {
          if (res.clientSecret && res.paymentIntentId) {
            setClientSecret(res.clientSecret)
            setPaymentIntentId(res.paymentIntentId)
          } else if (res.error) {
            toast.error(res.error)
            if ((res as any).priceChanged && (res as any).updatedItems) {
              const { useCartStore } = require('@/lib/cart/store')
              useCartStore.getState().setItems((res as any).updatedItems)
            }
          }
        })
    }
  }, [items, shippingMethod, appliedCoupon, isRedeemingPoints, formData.country])

  // GA4 begin_checkout tracking
  useEffect(() => {
    if (typeof window !== 'undefined' && items.length > 0 && !sessionStorage.getItem('ga_begin_checkout')) {
      const w = window as any;
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({ ecommerce: null });
      w.dataLayer.push({
        event: 'begin_checkout',
        ecommerce: {
          currency: 'USD',
          value: subtotal,
          items: items.map((item, index) => ({
            item_id: item.productId,
            item_name: item.product.name,
            item_variant: item.variantTitle,
            price: item.priceSnapshot,
            quantity: item.quantity,
            index: index
          }))
        }
      });
      sessionStorage.setItem('ga_begin_checkout', 'true');
    }
  }, [items, subtotal])

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleApplyCoupon = async (e?: React.FormEvent, codeToApply?: string) => {
    if (e) e.preventDefault()
    const code = codeToApply || couponCode
    if (!code || !code.trim()) return

    setIsVerifyingCoupon(true)
    try {
      const result = await verifyCoupon(code.trim(), subtotal, items)
      if (result.valid) {
        setAppliedCoupon({
          code: result.code || code.trim(),
          discount: result.discount || 0,
          freeShipping: result.freeShipping || false,
          description: result.description || 'Coupon applied'
        })
        setCouponCode('')
        setCoupon(result.code || code.trim())
        if (!codeToApply) toast.success(result.description || t('couponAppliedSuccess'))
      } else {
        setAppliedCoupon(null)
        if (!codeToApply) toast.error(result.error || t('couponInvalid'))
        if (codeToApply) setCoupon(null)
      }
    } catch (err) {
      setAppliedCoupon(null)
      if (!codeToApply) toast.error(t('couponVerifyFailed'))
      if (codeToApply) setCoupon(null)
    } finally {
      setIsVerifyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCoupon(null)
    toast.info(t('couponRemoved'))
  }

  const handleZeroTotalCheckout = async () => {
    setAttemptedSubmit(true)
    if (!formData.email || !formData.firstName || !formData.address || !formData.city || !formData.state || !formData.zip || !formData.phone) {
      toast.error(t('fillRequiredFieldsOrder'))
      return
    }

    setIsProcessing(true)

    try {
      const { createPayloadOrder } = await import('./actions')
      const orderRes = await createPayloadOrder(
        items, shippingMethod, appliedCoupon?.code, isRedeemingPoints,
        { ...formData, email: user?.email || formData.email },
        'free_order',
        user?.id as string,
        'stripe',
        selectedAddressId === 'new'
      )

      if (orderRes.error || !orderRes.orderId) {
        toast.error(orderRes.error || t('freeOrderInitFailed'))
        if ((orderRes as any).priceChanged && (orderRes as any).updatedItems) {
          useCartStore.getState().setItems((orderRes as any).updatedItems)
        }
        setIsProcessing(false)
        return
      }

      toast.success(t('orderSuccessRedirecting'))
      useCartStore.getState().clear()
      window.location.href = `/order-confirmation/${orderRes.orderId}`
    } catch (e: any) {
      toast.error(t('unexpectedError'))
      setIsProcessing(false)
    }
  }

  // Zelle has no payment API — this creates the order as pending/unpaid immediately,
  // then the customer sends payment manually using the details shown. A human confirms
  // the transfer and updates the order's paymentStatus in the admin panel afterward.
  const handleZellePlaceOrder = async () => {
    setAttemptedSubmit(true)
    if (!formData.email || !formData.firstName || !formData.address || !formData.city || !formData.state || !formData.zip || !formData.phone) {
      toast.error(t('fillRequiredFieldsOrder'))
      return
    }

    setIsProcessing(true)

    try {
      const { createPayloadOrder } = await import('./actions')
      const orderRes = await createPayloadOrder(
        items, shippingMethod, appliedCoupon?.code, isRedeemingPoints,
        { ...formData, email: user?.email || formData.email },
        'zelle_pending',
        user?.id as string,
        'zelle',
        selectedAddressId === 'new'
      )

      if (orderRes.error || !orderRes.orderId) {
        toast.error(orderRes.error || t('freeOrderInitFailed'))
        if ((orderRes as any).priceChanged && (orderRes as any).updatedItems) {
          useCartStore.getState().setItems((orderRes as any).updatedItems)
        }
        setIsProcessing(false)
        return
      }

      toast.success(t('orderSuccessRedirecting'))
      useCartStore.getState().clear()
      window.location.href = `/order-confirmation/${orderRes.orderId}`
    } catch (e: any) {
      toast.error(t('unexpectedError'))
      setIsProcessing(false)
    }
  }

  const handleStripeLinkPlaceOrder = async () => {
    setAttemptedSubmit(true)
    if (!formData.email || !formData.firstName || !formData.address || !formData.city || !formData.state || !formData.zip || !formData.phone) {
      toast.error(t('fillRequiredFieldsOrder'))
      return
    }

    setIsProcessing(true)

    try {
      const { createPayloadOrder } = await import('./actions')
      const orderRes = await createPayloadOrder(
        items, shippingMethod, appliedCoupon?.code, isRedeemingPoints,
        { ...formData, email: user?.email || formData.email },
        'stripe_link_pending',
        user?.id as string,
        'stripe_link',
        selectedAddressId === 'new'
      )

      if (orderRes.error || !orderRes.orderId) {
        toast.error(orderRes.error || t('freeOrderInitFailed'))
        if ((orderRes as any).priceChanged && (orderRes as any).updatedItems) {
          useCartStore.getState().setItems((orderRes as any).updatedItems)
        }
        setIsProcessing(false)
        return
      }

      toast.success(t('orderSuccessRedirecting'))
      useCartStore.getState().clear()
      window.location.href = `/order-confirmation/${orderRes.orderId}`
    } catch (e: any) {
      toast.error(t('unexpectedError'))
      setIsProcessing(false)
    }
  }

  const handleCircoFlowsPlaceOrder = async () => {
    setAttemptedSubmit(true)
    if (!formData.email || !formData.firstName || !formData.address || !formData.city || !formData.state || !formData.zip || !formData.phone) {
      toast.error(t('fillRequiredFieldsOrder'))
      return
    }

    setIsProcessing(true)

    try {
      const { createCircoFlowsPayment } = await import('./circoflowsActions')
      const orderRes = await createCircoFlowsPayment(
        items, shippingMethod, appliedCoupon?.code, isRedeemingPoints,
        { ...formData, email: user?.email || formData.email },
        user?.id as string,
        selectedAddressId === 'new'
      )

      if (orderRes.error || !orderRes.redirectUrl) {
        toast.error(orderRes.error || t('freeOrderInitFailed'))
        if ((orderRes as any).priceChanged && (orderRes as any).updatedItems) {
          useCartStore.getState().setItems((orderRes as any).updatedItems)
        }
        setIsProcessing(false)
        return
      }

      // Cart is intentionally left intact here — the customer hasn't paid yet, they're only
      // being redirected to CircoFlows' hosted card page. It's cleared once payment actually
      // succeeds (see OrderConfirmationClient's sync fallback / the webhook-driven finalize).
      window.location.href = orderRes.redirectUrl
    } catch (e: any) {
      toast.error(t('unexpectedError'))
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (storedCouponCode && !isVerifyingCoupon) {
      handleApplyCoupon(undefined, storedCouponCode)
    }
  }, [storedCouponCode, subtotal])

  if (!isReady || (items.length > 0 && !dataLoaded)) {
    return <CheckoutPageSkeleton />
  }

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-24 min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-display-sm font-heading text-ink mb-4">{t('emptyTitle')}</h1>
          <p className="text-body-md text-ink-muted mb-8">{t('emptyText')}</p>
          <Link href="/shop">
            <Button variant="dark" className="rounded-full h-14 px-8 tracking-widest text-sm uppercase !text-white">
              {t('shopNow')}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#fafafa] min-h-screen pt-32 pb-16 md:pt-36 md:pb-24">
      <Container size="wide">

        {/* Top Header: < Back and YOUR CHECKOUT */}
        <div className="mb-12">
          <Link href="/cart" className="text-[11px] font-bold uppercase tracking-widest text-black hover:text-gray-500 transition-colors flex items-center gap-2 w-fit mb-6">
            <ArrowLeft size={14} />
            {t('backToCart', { fallback: 'BACK' })}
          </Link>
          <h1 className="text-4xl md:text-5xl font-light text-black tracking-tight leading-none uppercase">
            {t('secureCheckout')}
          </h1>
        </div>

        {/* Mobile Summary Accordion */}
        <div className="lg:hidden mb-12">
              <button
                onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
                className="w-full flex items-center justify-between text-black border-b border-black pb-4 transition-all"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart size={18} />
                  <span className="text-[11px] font-bold uppercase tracking-widest">
                    {mobileSummaryOpen ? t('hideOrderSummary') : t('showOrderSummary')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-black">${total.toFixed(2)}</span>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${mobileSummaryOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>
            
              <AnimatePresence>
                {mobileSummaryOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 flex flex-col gap-6">
                      
                      {/* Items */}
                      <div className="flex flex-col border-b border-gray-200 pb-2">
                        {items.map((item) => (
                          <div key={item.lineId} className="flex gap-4 py-4 w-full">
                            <div className="relative w-16 h-16 shrink-0 rounded-[12px] bg-[#f0f0f0]">
                              <div className="w-full h-full rounded-[12px] overflow-hidden">
                                <Image 
                                  src={item.product?.imageUrl || '/placeholder.png'} 
                                  alt={item.product?.name || 'Product'} 
                                  width={300}
                                  height={300}
                                  quality={100}
                                  className="object-cover w-full h-full mix-blend-multiply" 
                                />
                              </div>
                              <div className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[9px] font-bold z-10 shadow-sm border border-white">
                                {item.quantity}
                              </div>
                            </div>
                            <div className="flex flex-col flex-1 justify-center min-w-0 pr-2">
                              <span className="text-sm font-bold text-black leading-tight truncate">{item.product?.name}</span>
                              {(item.variantTitle || item.variantSku) && !['DEFAULT', 'DEFAULT TITLE'].includes((item.variantTitle || item.variantSku || '').toUpperCase()) && (
                                <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-1 truncate">{item.variantTitle || item.variantSku}</span>
                              )}
                            </div>
                            <span className="text-sm text-black font-bold self-center shrink-0">
                              ${(item.priceSnapshot * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Promo Code */}
                      <div className="flex flex-col gap-3">
                        {appliedCoupon ? (
                          <div className="flex items-center justify-between py-3 border-b border-gray-200">
                            <div className="flex items-center gap-3 text-emerald-600">
                              <Tag size={14} />
                              <span className="text-[11px] font-bold uppercase tracking-widest">{appliedCoupon.code}</span>
                            </div>
                            <button onClick={handleRemoveCoupon} className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors">
                              {t('remove')}
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={handleApplyCoupon} className="relative w-full flex items-center gap-4">
                            <div className="relative w-full">
                              <input
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                placeholder={t('discountCodePlaceholder', { fallback: 'Coupon code' })}
                                className="w-full bg-transparent border-b border-gray-300 focus:border-black h-10 px-0 text-[11px] tracking-widest text-black placeholder:text-gray-300 transition-all outline-none"
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={!couponCode.trim() || isVerifyingCoupon}
                              className="h-10 px-6 border border-gray-300 rounded-[12px] text-[10px] font-bold uppercase tracking-widest text-black hover:border-black transition-colors disabled:opacity-50 shrink-0"
                            >
                              {isVerifyingCoupon ? <Loader2 size={12} className="animate-spin" /> : t('apply')}
                            </button>
                          </form>
                        )}
                      </div>
                  {/* Maxx Points */}
                  {availablePoints > 0 && (
                    <div className={`flex flex-col gap-3 p-4 rounded-[16px] border transition-all ${isRedeemingPoints ? 'bg-amber-50 border-amber-200/60 shadow-inner-sm' : 'bg-white border-ink/10 shadow-sm'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isRedeemingPoints ? 'bg-amber-100 text-amber-600' : 'bg-cream text-ink/40'}`}>
                            <Sparkles size={14} />
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-sm font-bold ${isRedeemingPoints ? 'text-amber-700' : 'text-ink'}`}>HB Points</span>
                            <span className="text-xs font-medium text-ink/50">{t('youHavePoints', { points: Number(availablePoints.toFixed(2)) })}</span>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={isRedeemingPoints}
                            onChange={() => setIsRedeemingPoints(!isRedeemingPoints)}
                          />
                          <div className="w-11 h-6 bg-ink/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="w-full h-px bg-ink/5" />

                  {/* Totals */}
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center text-sm font-medium text-ink/70">
                      <span>{t('subtotal')}</span>
                      <span className="text-ink font-bold">${subtotal.toFixed(2)}</span>
                    </div>

                    <AnimatePresence>
                      {appliedCoupon && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="flex justify-between items-center text-sm font-medium text-green-600 overflow-hidden"
                        >
                          <span className="py-1">{t('discountWithCode', { code: appliedCoupon.code })}</span>
                          <span className="py-1 font-bold">-${appliedCoupon.discount.toFixed(2)}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {isRedeemingPoints && pointsToRedeem > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="flex justify-between items-center text-sm font-medium text-green-600 overflow-hidden"
                        >
                          <span className="py-1 flex items-center gap-1.5"><Sparkles size={14} /> {t('pointsApplied')}</span>
                          <span className="py-1 font-bold">-${pointsToRedeem.toFixed(2)}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex justify-between items-center text-sm font-medium text-ink/70">
                      <span>{t('shippingWithMethod', { method: selectedMethodObj?.method ? `(${selectedMethodObj.method})` : '' })}</span>
                      <span className="text-ink font-bold">{finalShipping === 0 ? t('free') : `$${finalShipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium text-ink/70">
                      <span>{t('processingFee')}{activeFeePercentage ? ` (${activeFeePercentage}%)` : ''}</span>
                      <span className="text-ink font-bold">${processingFeeAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="w-full h-px bg-ink/5" />

                  <div className="flex justify-between items-end mb-2 mt-4">
                    <span className="text-sm font-bold uppercase tracking-widest text-ink/60">{t('total')}</span>
                    <span className="text-4xl font-bold text-ink font-heading">
                      ${total.toFixed(2)}
                    </span>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-12 lg:gap-20">
          
          {/* Left Column: Flow */}
          <div className="flex flex-col gap-10">
            
            {/* Continuous Form */}
            <div className="flex flex-col gap-10">
              <input type="hidden" name="redeemPoints" value={isRedeemingPoints ? 'true' : 'false'} />
              <input type="hidden" name="couponCode" value={appliedCoupon?.code || ''} />
              
              {/* Contact */}
              <section className="flex flex-col gap-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-2">{t('contactInformation')}</h2>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t('emailAddress')}
                  type="email"
                  className={`h-14 rounded-[12px] bg-white border border-gray-200 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black text-sm text-black placeholder:text-gray-400 transition-all shadow-sm ${attemptedSubmit && !formData.email ? 'border-red-500 ring-1 ring-red-500 bg-red-50/30' : ''}`}
                  required
                />
                <div className="flex items-start gap-3 mt-1 px-1">
                  <Checkbox
                    id="marketing"
                    name="marketing"
                    checked={formData.marketing}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, marketing: !!checked }))}
                    className="mt-0.5 rounded-md data-[state=checked]:bg-ink data-[state=checked]:border-ink"
                  />
                  <label htmlFor="marketing" className="text-sm text-ink/60 cursor-pointer select-none">
                    {t('marketingOptIn')}
                  </label>
                </div>
              </section>

              {/* Delivery */}
              <section className="flex flex-col gap-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-2 mt-6">{t('deliveryAddress')}</h2>
                
                {user && addresses.length > 0 && (
                  <div className="flex flex-col gap-3 mb-4">
                    {addresses.map((addr) => (
                      <label key={addr.id} className={`flex items-start gap-4 p-5 rounded-[16px] border transition-colors cursor-pointer ${selectedAddressId === String(addr.id) ? 'border-black bg-gray-50' : 'border-gray-200 bg-transparent hover:border-gray-400'}`}>
                        <input 
                          type="radio" 
                          name="addressSelection" 
                          value={addr.id} 
                          checked={selectedAddressId === String(addr.id)}
                          onChange={() => {
                            setSelectedAddressId(String(addr.id))
                            setIsEditingAddress(false)
                            setFormData(prev => ({
                              ...prev,
                              firstName: addr.firstName || prev.firstName,
                              lastName: addr.lastName || prev.lastName,
                              address: addr.line1,
                              apartment: addr.line2 || '',
                              city: addr.city,
                              state: addr.state,
                              zip: addr.postalCode,
                              country: addr.country || 'US',
                              phone: addr.phone || ''
                            }))
                          }}
                          className="mt-0.5 w-4 h-4 accent-black text-ink border-ink/20 focus:ring-ink focus:ring-offset-0 shrink-0" 
                        />
                        <div className="flex flex-col flex-1">
                          <div className="flex items-start justify-between w-full">
                            <span className="text-sm font-bold text-ink leading-tight">
                              {addr.firstName} {addr.lastName}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              {addr.isDefaultShipping && (
                                <span className="text-[10px] font-bold uppercase tracking-widest text-ink/60 bg-white border border-slate-100 shadow-sm px-2 py-0.5 rounded-md">
                                  {t('defaultAddressBadge')}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setSelectedAddressId(String(addr.id))
                                  setFormData(prev => ({
                                    ...prev,
                                    firstName: addr.firstName || prev.firstName,
                                    lastName: addr.lastName || prev.lastName,
                                    address: addr.line1,
                                    apartment: addr.line2 || '',
                                    city: addr.city,
                                    state: addr.state,
                                    zip: addr.postalCode,
                                    country: addr.country || 'US',
                                    phone: addr.phone || ''
                                  }))
                                  setIsEditingAddress(true)
                                }}
                                className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-md transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                              </button>
                            </div>
                          </div>
                          <span className="text-xs text-ink/70 mt-1.5">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</span>
                          <span className="text-xs text-ink/70 mt-0.5">{addr.city}, {addr.state} {addr.postalCode}</span>
                        </div>
                      </label>
                    ))}

                    <label className={`flex items-center gap-4 p-5 rounded-[16px] border transition-colors cursor-pointer ${selectedAddressId === 'new' ? 'border-black bg-gray-50' : 'border-gray-200 bg-transparent hover:border-gray-400'}`}>
                      <input 
                        type="radio" 
                        name="addressSelection" 
                        value="new" 
                        checked={selectedAddressId === 'new'}
                        onChange={() => {
                          setSelectedAddressId('new')
                          setIsEditingAddress(false)
                          setFormData(prev => ({ ...prev, address: '', apartment: '', city: '', state: '', zip: '', country: 'US', phone: '' }))
                        }}
                        className="w-4 h-4 accent-black text-ink border-ink/20 focus:ring-ink focus:ring-offset-0" 
                      />
                      <span className="text-sm font-bold text-ink">{t('addNewAddress')}</span>
                    </label>
                  </div>
                )}

                <input type="hidden" name="addressId" value={selectedAddressId} />

                {(!user || selectedAddressId === 'new' || isEditingAddress) && (
                  <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <Input name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder={t('firstName')} className={`h-14 rounded-[12px] bg-white border border-gray-200 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black text-sm text-black placeholder:text-gray-400 transition-all shadow-sm ${attemptedSubmit && (selectedAddressId === 'new' || isEditingAddress) && !formData.firstName ? 'border-red-500 ring-1 ring-red-500 bg-red-50/30' : ''}`} required={selectedAddressId === 'new' || isEditingAddress} />
                      <Input name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder={t('lastName')} className={`h-14 rounded-[12px] bg-white border border-gray-200 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black text-sm text-black placeholder:text-gray-400 transition-all shadow-sm ${attemptedSubmit && (selectedAddressId === 'new' || isEditingAddress) && !formData.lastName ? 'border-red-500 ring-1 ring-red-500 bg-red-50/30' : ''}`} required={selectedAddressId === 'new' || isEditingAddress} />
                    </div>
                    <Input name="address" value={formData.address} onChange={handleInputChange} placeholder={t('address')} className={`h-14 rounded-[12px] bg-white border border-gray-200 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black text-sm text-black placeholder:text-gray-400 transition-all shadow-sm ${attemptedSubmit && (selectedAddressId === 'new' || isEditingAddress) && !formData.address ? 'border-red-500 ring-1 ring-red-500 bg-red-50/30' : ''}`} required={selectedAddressId === 'new' || isEditingAddress} />
                    <Input name="apartment" value={formData.apartment} onChange={handleInputChange} placeholder={t('apartmentOptional')} className="h-14 rounded-[12px] bg-white border border-gray-200 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black text-sm text-black placeholder:text-gray-400 transition-all shadow-sm" />
                    <div className="grid grid-cols-6 gap-4">
                      <div className="col-span-3 sm:col-span-2">
                        <Input name="city" value={formData.city} onChange={handleInputChange} placeholder={t('city')} className={`h-14 rounded-[12px] bg-white border border-gray-200 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black text-sm text-black placeholder:text-gray-400 transition-all shadow-sm ${attemptedSubmit && (selectedAddressId === 'new' || isEditingAddress) && !formData.city ? 'border-red-500 ring-1 ring-red-500 bg-red-50/30' : ''}`} required={selectedAddressId === 'new' || isEditingAddress} />
                      </div>
                      <div className="col-span-3 sm:col-span-2">
                        <Input name="state" value={formData.state} onChange={handleInputChange} placeholder={t('state')} className={`h-14 rounded-[12px] bg-white border border-gray-200 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black text-sm text-black placeholder:text-gray-400 transition-all shadow-sm ${attemptedSubmit && (selectedAddressId === 'new' || isEditingAddress) && !formData.state ? 'border-red-500 ring-1 ring-red-500 bg-red-50/30' : ''}`} required={selectedAddressId === 'new' || isEditingAddress} />
                      </div>
                      <div className="col-span-6 sm:col-span-2">
                        <Input name="zip" value={formData.zip} onChange={handleInputChange} placeholder={t('zipCode')} className={`h-14 rounded-[12px] bg-white border border-gray-200 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black text-sm text-black placeholder:text-gray-400 transition-all shadow-sm ${attemptedSubmit && (selectedAddressId === 'new' || isEditingAddress) && !formData.zip ? 'border-red-500 ring-1 ring-red-500 bg-red-50/30' : ''}`} required={selectedAddressId === 'new' || isEditingAddress} />
                      </div>
                    </div>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                    >
                      <SelectTrigger className="h-14 rounded-[12px] bg-white border border-gray-200 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black text-sm text-black placeholder:text-gray-400 w-full transition-all shadow-sm">
                        <SelectValue placeholder={t('country')} />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        sideOffset={8}
                        className="max-h-72 rounded-[16px] border-slate-100 bg-white p-2 shadow-xl shadow-black/[0.06]"
                      >
                        {COUNTRIES.map((c) => (
                          <SelectItem
                            key={c.code}
                            value={c.code}
                            className="rounded-xl py-3 px-3 text-sm cursor-pointer data-[highlighted]:bg-ink/5 data-[state=checked]:bg-ink/5 data-[state=checked]:font-semibold"
                          >
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isInternational && (
                      <p className="text-xs text-ink/50 px-1 -mt-1">{t('internationalShippingNotice')}</p>
                    )}

                    {/* Render Phone field inside the expanded block so it appears above Cancel/Save */}
                    <Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder={t('phoneForDelivery')} type="tel" className={`h-14 rounded-[12px] bg-white border border-gray-200 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black text-sm text-black placeholder:text-gray-400 transition-all shadow-sm ${attemptedSubmit && !formData.phone ? 'border-red-500 ring-1 ring-red-500 bg-red-50/30' : ''}`} required />

                    {isEditingAddress && selectedAddressId !== 'new' && (
                      <div className="flex gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditingAddress(false)
                            const addr = addresses.find(a => String(a.id) === selectedAddressId)
                            if (addr) {
                              setFormData(prev => ({
                                ...prev,
                                firstName: addr.firstName || prev.firstName,
                                lastName: addr.lastName || prev.lastName,
                                address: addr.line1,
                                apartment: addr.line2 || '',
                                city: addr.city,
                                state: addr.state,
                                zip: addr.postalCode,
                                country: addr.country || 'US',
                                phone: addr.phone || ''
                              }))
                            }
                          }}
                          className="h-12 flex-1 rounded-[12px] border-gray-200 text-black font-bold uppercase tracking-widest text-[10px]"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          disabled={isSavingAddress}
                          onClick={handleSaveAddressEdit}
                          className="h-12 flex-1 rounded-[12px] bg-black text-white font-bold uppercase tracking-widest text-[10px]"
                        >
                          {isSavingAddress ? <Loader2 className="animate-spin" /> : "Save Changes"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Render Phone field outside when the address form is collapsed (saved address selected) */}
                {user && selectedAddressId !== 'new' && !isEditingAddress && (
                  <Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder={t('phoneForDelivery')} type="tel" className={`h-14 rounded-[12px] bg-white border border-gray-200 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black text-sm text-black placeholder:text-gray-400 transition-all shadow-sm ${attemptedSubmit && !formData.phone ? 'border-red-500 ring-1 ring-red-500 bg-red-50/30' : ''}`} required />
                )}
              </section>

              {/* Shipping Method */}
              <section className="flex flex-col gap-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-2 mt-6">{t('shippingMethod')}</h2>
                <div className="flex flex-col gap-3">
                  {visibleShippingMethods.map((method: any) => (
                    <label key={method.method} className={`relative flex items-center justify-between p-5 rounded-[12px] border transition-all duration-200 ease-in-out cursor-pointer overflow-hidden ${shippingMethod === method.method ? 'border-black bg-[#fafafa] shadow-md ring-1 ring-black' : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'}`}>
                      <div className="flex items-center gap-4 relative z-10">
                        <input
                          type="radio"
                          name="shipping"
                          value={method.method}
                          checked={shippingMethod === method.method}
                          onChange={() => setShippingMethod(method.method)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-200 ${shippingMethod === method.method ? 'border-black bg-black' : 'border-gray-300 bg-white'}`}>
                          {shippingMethod === method.method && <div className="w-2 h-2 bg-white rounded-full shadow-sm animate-in zoom-in duration-200" />}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold transition-colors flex items-center gap-2 ${shippingMethod === method.method ? 'text-black' : 'text-gray-700'}`}>
                            {method.method.toLowerCase().includes('express') ? <Zap size={14} className="text-amber-500" /> : <Truck size={14} className="text-gray-400" />}
                            {method.method}
                          </span>
                          {method.estimatedDays && (
                            <span className="text-xs text-gray-500 mt-0.5">{t('businessDays', { days: method.estimatedDays })}</span>
                          )}
                        </div>
                      </div>
                      <span className={`text-sm font-bold relative z-10 transition-colors ${shippingMethod === method.method ? 'text-black' : 'text-gray-700'}`}>
                        {(() => {
                          const isExpress = method.method.toLowerCase().includes('express')
                          const isFreeShipping = qualifiesForFreeShipping && !isExpress
                          if (isFreeShipping || method.price === 0) return t('free')
                          return `$${method.price.toFixed(2)}`
                        })()}
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Payment */}
              <section className="flex flex-col gap-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-2 mt-6">{t('payment')}</h2>
                <p className="text-xs font-medium text-ink/50 mb-2 flex items-center gap-1.5"><Lock size={12} /> {t('encryptionNotice')}</p>

                {total <= 0 ? (
                  <div className="w-full h-56 bg-green-50 border border-green-500/20 rounded-[24px] flex flex-col items-center justify-center gap-4 shadow-sm relative overflow-hidden p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                       <Check size={24} />
                    </div>
                    <span className="text-sm font-bold text-green-800">{t('orderFullyCovered')}</span>
                    <Button onClick={handleZeroTotalCheckout} disabled={isProcessing} size="lg" className="w-full h-14 rounded-[12px] bg-black font-bold text-[11px] tracking-[0.2em] uppercase text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                      {isProcessing ? <Loader2 className="animate-spin" /> : t('completeFreeOrder')}
                    </Button>
                  </div>
                ) : ENABLE_STRIPE && clientSecret && stripePromise && paymentIntentId ? (
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                    <StripeCheckoutForm
                       amount={total}
                       items={items}
                       shippingMethod={shippingMethod}
                       couponCode={appliedCoupon?.code}
                       isRedeemingPoints={isRedeemingPoints}
                       formData={formData}
                       paymentIntentId={paymentIntentId}
                       userId={user?.id}
                    />
                  </Elements>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3">
                      {ENABLE_CIRCOFLOWS && (
                        <label className={`relative flex items-center justify-between p-5 rounded-[12px] border transition-all duration-200 ease-in-out cursor-pointer overflow-hidden ${
                          selectedPaymentMethod === 'circoflows' ? 'border-black bg-[#fafafa] shadow-md ring-1 ring-black' : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
                        }`}>
                          <div className="flex items-center gap-4 relative z-10">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="circoflows"
                              className="sr-only"
                              checked={selectedPaymentMethod === 'circoflows'}
                              onChange={() => setSelectedPaymentMethod('circoflows')}
                            />
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-200 ${selectedPaymentMethod === 'circoflows' ? 'border-black bg-black' : 'border-gray-300 bg-white'}`}>
                              {selectedPaymentMethod === 'circoflows' && <div className="w-2 h-2 bg-white rounded-full shadow-sm animate-in zoom-in duration-200" />}
                            </div>
                            <div className="flex flex-col">
                              <span className={`text-sm font-bold transition-colors flex items-center gap-2 ${selectedPaymentMethod === 'circoflows' ? 'text-black' : 'text-gray-700'}`}>
                                <CreditCard size={14} className="text-gray-400" />
                                {t('payWithCard')}
                                <div className="flex gap-1.5 ml-2">
                                  <span className="px-1.5 py-0.5 border border-gray-200 bg-white rounded shadow-sm text-[8px] font-black italic text-blue-900 tracking-wider">VISA</span>
                                  <span className="px-1.5 py-0.5 border border-gray-200 bg-white rounded shadow-sm text-[8px] font-bold text-red-600 tracking-wider">MC</span>
                                </div>
                              </span>
                              <span className="text-xs text-gray-500 mt-0.5">{t('circoflowsCheckoutNote')}</span>
                            </div>
                          </div>
                        </label>
                      )}
                      <label className={`relative flex items-center justify-between p-5 rounded-[12px] border transition-all duration-200 ease-in-out cursor-pointer overflow-hidden ${
                        selectedPaymentMethod === 'zelle' ? 'border-black bg-[#fafafa] shadow-md ring-1 ring-black' : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
                      }`}>
                        <div className="flex items-center gap-4 relative z-10">
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            value="zelle" 
                            className="sr-only" 
                            checked={selectedPaymentMethod === 'zelle'} 
                            onChange={() => setSelectedPaymentMethod('zelle')} 
                          />
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-200 ${selectedPaymentMethod === 'zelle' ? 'border-black bg-black' : 'border-gray-300 bg-white'}`}>
                            {selectedPaymentMethod === 'zelle' && <div className="w-2 h-2 bg-white rounded-full shadow-sm animate-in zoom-in duration-200" />}
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-sm font-bold transition-colors flex items-center gap-2 ${selectedPaymentMethod === 'zelle' ? 'text-black' : 'text-gray-700'}`}>
                              <Wallet size={14} className="text-purple-600" />
                              Zelle
                              <span className="px-1.5 py-0.5 border border-gray-200 bg-[#741acb] rounded shadow-sm text-[8px] font-black text-white tracking-widest ml-2">Z</span>
                            </span>
                            <span className="text-xs text-gray-500 mt-0.5">{t('zelleCheckoutNote')}</span>
                          </div>
                        </div>
                      </label>

                      <label className={`relative flex items-center justify-between p-5 rounded-[12px] border transition-all duration-200 ease-in-out cursor-pointer overflow-hidden ${
                        selectedPaymentMethod === 'stripe_link' ? 'border-black bg-[#fafafa] shadow-md ring-1 ring-black' : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
                      }`}>
                        <div className="flex items-center gap-4 relative z-10">
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            value="stripe_link" 
                            className="sr-only" 
                            checked={selectedPaymentMethod === 'stripe_link'} 
                            onChange={() => setSelectedPaymentMethod('stripe_link')} 
                          />
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-200 ${selectedPaymentMethod === 'stripe_link' ? 'border-black bg-black' : 'border-gray-300 bg-white'}`}>
                            {selectedPaymentMethod === 'stripe_link' && <div className="w-2 h-2 bg-white rounded-full shadow-sm animate-in zoom-in duration-200" />}
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-sm font-bold transition-colors flex items-center gap-2 ${selectedPaymentMethod === 'stripe_link' ? 'text-black' : 'text-gray-700'}`}>
                              <CreditCard size={14} className="text-gray-400" />
                              Stripe (Custom Payment Link)
                            </span>
                            <span className="text-xs text-gray-500 mt-0.5">Secure payment via an emailed Stripe link.</span>
                          </div>
                        </div>
                      </label>
                    </div>

                    <div className="w-full mt-6">
                      <Button onClick={
                        selectedPaymentMethod === 'circoflows' ? handleCircoFlowsPlaceOrder :
                        selectedPaymentMethod === 'zelle' ? handleZellePlaceOrder : handleStripeLinkPlaceOrder
                      } disabled={isProcessing} size="lg" className="w-full h-14 rounded-[12px] bg-black font-bold text-[11px] tracking-[0.2em] uppercase text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all group">
                        {isProcessing ? <Loader2 className="animate-spin" /> : t('placeOrder')}
                      </Button>
                    </div>
                  </div>
                )}
              </section>

            </div>
          </div>

          {/* Right Column: Order Summary (Desktop) */}
          <div className="hidden lg:block lg:pl-12 lg:border-l border-gray-300">
            <div className="sticky top-32">
              
              <div className="mb-10">
                <h2 className="text-xl font-light text-black tracking-wide uppercase">
                  {t('orderSummary')}
                </h2>
              </div>
              
              {/* Items List */}
              <div className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto pb-6 custom-scrollbar mb-6 border-b-[2px] border-black" data-lenis-prevent="true">
                {items.map((item) => (
                  <div key={item.lineId} className="flex gap-4 group py-2">
                    <div className="relative w-16 h-16 shrink-0 rounded-[12px] bg-[#f0f0f0]">
                      <div className="w-full h-full rounded-[12px] overflow-hidden">
                        <Image 
                          src={item.product?.imageUrl || '/placeholder.png'} 
                          alt={item.product?.name || 'Product'} 
                          width={300}
                          height={300}
                          quality={100}
                          className="object-cover w-full h-full mix-blend-multiply" 
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[9px] font-bold z-10 shadow-sm border border-white">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex flex-col flex-1 justify-center min-w-0 pr-2">
                      <span className="text-sm font-bold text-black leading-tight truncate">{item.product?.name}</span>
                      {(item.variantTitle || item.variantSku) && !['DEFAULT', 'DEFAULT TITLE'].includes((item.variantTitle || item.variantSku || '').toUpperCase()) && (
                        <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-1 truncate">{item.variantTitle || item.variantSku}</span>
                      )}
                    </div>
                    <span className="text-sm text-black font-bold self-center shrink-0">
                      ${(item.priceSnapshot * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="flex flex-col gap-3 mb-6">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div className="flex items-center gap-3 text-emerald-600">
                      <Tag size={14} />
                      <span className="text-[11px] font-bold uppercase tracking-widest">{appliedCoupon.code}</span>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors">
                      {t('remove')}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="relative w-full flex items-center gap-4">
                    <div className="relative w-full">
                      <input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder={t('discountCodePlaceholder', { fallback: 'Coupons code' })}
                        className="w-full bg-transparent border-b border-gray-300 focus:border-black h-10 px-0 text-[11px] tracking-widest text-black placeholder:text-gray-300 transition-all outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!couponCode.trim() || isVerifyingCoupon}
                      className="h-10 px-6 border border-gray-300 rounded-[12px] text-[10px] font-bold uppercase tracking-widest text-black hover:border-black transition-colors disabled:opacity-50 shrink-0"
                    >
                      {isVerifyingCoupon ? <Loader2 size={12} className="animate-spin" /> : t('apply')}
                    </button>
                  </form>
                )}
              </div>

              {/* Maxx Points */}
              {availablePoints > 0 && (
                <div className="flex flex-col gap-3 py-3 border-b border-gray-200 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isRedeemingPoints ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                        <Sparkles size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[11px] font-bold uppercase tracking-widest ${isRedeemingPoints ? 'text-amber-700' : 'text-black'}`}>HB Points</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">{t('youHavePointsWithValue', { points: Number(availablePoints.toFixed(2)), value: availablePoints.toFixed(2) })}</span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={isRedeemingPoints}
                        onChange={() => setIsRedeemingPoints(!isRedeemingPoints)}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="flex flex-col gap-4 text-xs pb-6 border-b border-gray-200 mb-6">
                
                <div className="flex justify-between items-center text-gray-500">
                  <span>{t('subtotal')}</span>
                  <span className="text-black font-medium">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-gray-500">
                  <span>{t('estimatedShipping', { fallback: 'Shipping' })}</span>
                  <span className="text-black font-medium">{finalShipping === 0 ? t('free') : `$${finalShipping.toFixed(2)}`}</span>
                </div>

                <div className="flex justify-between items-center text-gray-500">
                  <span>{t('processingFee')}{activeFeePercentage ? ` (${activeFeePercentage}%)` : ''}</span>
                  <span className="text-black font-medium">${processingFeeAmount.toFixed(2)}</span>
                </div>

                <AnimatePresence>
                  {appliedCoupon && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="flex justify-between items-center text-emerald-600 overflow-hidden"
                    >
                      <span>{t('discountWithCode', { code: appliedCoupon.code })}</span>
                      <span className="font-medium">-${appliedCoupon.discount.toFixed(2)}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {isRedeemingPoints && pointsToRedeem > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="flex justify-between items-center text-emerald-600 overflow-hidden"
                    >
                      <span className="flex items-center gap-1.5"><Sparkles size={12} /> {t('pointsApplied')}</span>
                      <span className="font-medium">-${pointsToRedeem.toFixed(2)}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex justify-between items-end mb-4">
                <span className="text-[11px] font-bold uppercase tracking-widest text-black">{t('total')}</span>
                <span className="text-2xl font-bold text-black font-heading leading-none">
                  ${total.toFixed(2)}
                </span>
              </div>

            </div>
          </div>

        </div>
      </Container>
    </div>
  )
}
