'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useMotionValue, useSpring } from 'framer-motion'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { Heart, ChevronRight, ChevronLeft, Download, Check, ShieldCheck, FlaskConical, MapPin, Zap, ShoppingCart, Truck, Sparkles, Loader2, Award, Globe, Lock, RotateCcw, CheckCircle2 } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { PinterestGlassCard } from '@/components/home/PinterestGlassCard'
import { Badge } from '@/components/ui/badge'
import { StockIndicator } from '@/components/ui/stock-indicator'
import { useCartStore } from '@/lib/cart/store'
import { useWishlistStore } from '@/lib/wishlist/store'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { ImageGallery } from '@/components/shop/ImageGallery'
import { VariantSelector, Variant } from '@/components/shop/VariantSelector'
import { QuantityStepper } from '@/components/shop/QuantityStepper'
import { ProductTabs, Tab } from '@/components/shop/ProductTabs'
import { ProductAccordion } from '@/components/shop/ProductAccordion'
import { ProductDetailTabs } from '@/components/shop/ProductDetailTabs'
import { PrimaryProductCard } from '@/components/shop/PrimaryProductCard'
import { ProductCard } from '@/components/shared/ProductCard'
import { SharedFaqSection } from '@/components/shared/SharedFaqSection'
import { BlogPostCard } from '@/components/editorial/BlogPostCard'
import { FadeUp } from '@/components/motion/FadeUp'
import { FluidButton } from '@/components/ui/fluid-button'

interface ProductData {
  id: string
  name: string
  slug: string
  subtitle: string
  category: string
  categories?: string[]
  averageRating?: number
  reviewCount?: number

  sku?: string
  weight?: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
  }
  badges?: string[]
  bulkBundles?: {
    id?: string
    name: string
    quantity: number
    discountPercentage?: number
    price?: number
    salePrice?: number
    image?: string
  }[]
  description: string
  shortDescription?: string
  images: string[]
  variants: Variant[]
  coaFile?: string
  tabs: Tab[]
  faqs?: any[]
  reviews: any[]
  relatedProducts: any[]
  suggestedBlogs?: any[]
}

interface ProductClientProps {
  product: ProductData
}

function SlideToCartButton({ onAdd, disabled, isAdded }: { onAdd: () => void, disabled: boolean, isAdded: boolean }) {
  const t = useTranslations('shop.productDetail')
  const containerRef = React.useRef<HTMLDivElement>(null)
  
  const handleDragEnd = (event: any, info: any) => {
    if (disabled || isAdded) return
    // threshold to trigger add to cart
    if (info.offset.x > 60) {
      onAdd()
    }
  }

  React.useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const stop = (e: Event) => e.stopPropagation()
    node.addEventListener('pointerdown', stop)
    node.addEventListener('touchstart', stop, { passive: false })
    node.addEventListener('mousedown', stop)
    return () => {
      node.removeEventListener('pointerdown', stop)
      node.removeEventListener('touchstart', stop)
      node.removeEventListener('mousedown', stop)
    }
  }, [])

  return (
    <div 
      ref={containerRef} 
      className={`relative flex-1 h-16 bg-white border border-black/10 rounded-full flex items-center overflow-hidden z-10 transition-colors hover:border-black/30 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <div className="absolute inset-0 flex items-center justify-center pl-10 text-[13px] font-bold text-black uppercase tracking-widest pointer-events-none select-none">
        {isAdded ? t('addedToCart') : <>{t('slideToAdd')} <ChevronRight size={16} className="inline ml-1 opacity-50" /></>}
      </div>
      
      <motion.button
        type="button"
        drag={disabled || isAdded ? false : "x"}
        dragConstraints={containerRef}
        dragElastic={0.05}
        dragSnapToOrigin={true}
        onDragEnd={handleDragEnd}
        whileTap={disabled || isAdded ? {} : { scale: 0.95 }}
        className={`absolute left-2 w-12 h-12 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-20 shadow-sm transition-colors duration-300 ${
          isAdded ? 'bg-green-600 text-white' : 'bg-black text-white'
        }`}
      >
        {isAdded ? <Check size={20} /> : <ShoppingCart size={20} />}
      </motion.button>
    </div>
  )
}

export function ProductClient({ product }: ProductClientProps) {
  const t = useTranslations('shop.productDetail')
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id || '')
  const [quantity, setQuantity] = useState(1)
  const [descOpen, setDescOpen] = useState(true)
  const [deliveryOpen, setDeliveryOpen] = useState(true)

  React.useEffect(() => {
    // Force scroll to top on mount to fix Next.js scroll restoration issues
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [product.id])

  // Mobile Sticky Bar Logic
  const [showMobileBar, setShowMobileBar] = useState(false)
  const { scrollY } = useScroll()

  // Swipe Cursor Logic
  const [isHoveringSlider, setIsHoveringSlider] = useState(false)
  const [isSliderAtEnd, setIsSliderAtEnd] = useState(false)
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  const handleSliderMouseMove = (e: React.MouseEvent) => {
    cursorX.set(e.clientX - 36)
    cursorY.set(e.clientY - 36)
  }



  useEffect(() => {
    // Show initially on mobile
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      const pageHeight = document.documentElement.scrollHeight
      const viewportHeight = window.innerHeight
      const isNearBottom = window.scrollY + viewportHeight >= pageHeight - 300
      setShowMobileBar(!isNearBottom)
    }
  }, [])

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      const pageHeight = document.documentElement.scrollHeight
      const viewportHeight = window.innerHeight
      // Hide when near the footer (bottom 300px)
      const isNearBottom = latest + viewportHeight >= pageHeight - 300

      if (!isNearBottom) {
        setShowMobileBar(true)
      } else {
        setShowMobileBar(false)
      }
    }
  })

  const [relatedEmblaRef, relatedEmblaApi] = useEmblaCarousel({ 
    align: 'start',
    containScroll: 'trimSnaps'
  }, [
    Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })
  ])

  useEffect(() => {
    if (!relatedEmblaApi) return
    
    let isDragging = false
    
    const checkEnd = () => {
      if (isDragging) {
        setIsSliderAtEnd(!relatedEmblaApi.canScrollNext())
      }
    }

    const onPointerDown = () => {
      isDragging = true
      checkEnd()
    }
    
    const onPointerUp = () => {
      isDragging = false
      setIsSliderAtEnd(false) // Instantly reset to SWIPE when they let go
    }

    relatedEmblaApi.on('pointerDown', onPointerDown)
    relatedEmblaApi.on('pointerUp', onPointerUp)
    relatedEmblaApi.on('scroll', checkEnd)
    relatedEmblaApi.on('select', checkEnd)
  }, [relatedEmblaApi])



  const selectedVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0]
  const currentStock = selectedVariant?.inStock ? 50 : 0 // Fake stock level for testing

  // Combine variant-specific images (first) with common product images (second). Remove duplicates.
  const allImages = [
    ...(selectedVariant?.images || []),
    ...(product.images || [])
  ]
  const galleryImages = Array.from(new Set(allImages)).filter(Boolean)

  const [justAdded, setJustAdded] = useState(false)
  const cartStore = useCartStore()
  
  const addItemToWishlist = useWishlistStore(state => state.addItem)
  const removeItemFromWishlist = useWishlistStore(state => state.removeItem)
  const isWishlistedGlobal = useWishlistStore(state => state.hasItem(product.id))
  const { status } = useSession()
  const isSignedIn = status === 'authenticated'
  
  const [inWishlist, setInWishlist] = useState(false)
  const [isWishlistPending, setIsWishlistPending] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  useEffect(() => {
    setInWishlist(isWishlistedGlobal)
  }, [isWishlistedGlobal])

  const handleWishlistClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    
    if (!isSignedIn) {
      toast.error(t('signInRequired'), {
        description: t('signInRequiredDescription'),
      })
      return
    }

    setIsWishlistPending(true)

    try {
      if (inWishlist) {
        await removeItemFromWishlist(product.id)
        toast(t('removedFromWishlist'), {
          id: `wishlist-${product.id}`,
          description: t('removedFromWishlistDescription', { name: product.name }),
        })
      } else {
        await addItemToWishlist({
          id: product.id,
          name: product.name,
          slug: product.id, // Or product.slug if we had it
          image: product.images[0],
          priceRange: selectedVariant?.price || ''
        })

        setShowParticles(true)
        setTimeout(() => setShowParticles(false), 1000)

        toast.success(t('addedToWishlist'), {
          id: `wishlist-${product.id}`,
          description: t('addedToWishlistDescription', { name: product.name }),
          action: {
            label: t('viewWishlist'),
            onClick: () => window.location.href = '/account/wishlist',
          },
        })
      }
    } catch (error: any) {
      toast.error(t('failedToUpdateWishlist'), {
        description: error.message || t('unexpectedError'),
      })
    } finally {
      setIsWishlistPending(false)
    }
  }

  // GA4 view_item tracking
  React.useEffect(() => {
    if (typeof window !== 'undefined' && selectedVariant && !sessionStorage.getItem(`ga_view_${product.id}_${selectedVariant.id}`)) {
      const w = window as any;
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({ ecommerce: null });
      w.dataLayer.push({
        event: 'view_item',
        ecommerce: {
          currency: 'USD',
          value: parseFloat((selectedVariant.salePrice || selectedVariant.price).replace(/[^0-9.]/g, '')),
          items: [{
            item_id: product.id,
            item_name: product.name,
            item_category: product.categories?.[0] || '',
            item_variant: selectedVariant.title,
            price: parseFloat((selectedVariant.salePrice || selectedVariant.price).replace(/[^0-9.]/g, ''))
          }]
        }
      });
      sessionStorage.setItem(`ga_view_${product.id}_${selectedVariant.id}`, 'true');
    }
  }, [product, selectedVariant]);

  const handleAddToCart = () => {
    if (!selectedVariant?.inStock) return

    const priceNum = parseFloat((selectedVariant.salePrice || selectedVariant.price).replace(/[^0-9.]/g, ''))

    cartStore.addItem(
      { id: product.id, name: product.name, imageUrl: selectedVariant.images?.[0] || product.images[0], slug: product.slug },
      selectedVariant.sku || selectedVariant.title,
      quantity,
      priceNum,
      selectedVariant.title
    )

    // GA4 add_to_cart tracking
    if (typeof window !== 'undefined') {
      const w = window as any;
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({ ecommerce: null });
      w.dataLayer.push({
        event: 'add_to_cart',
        ecommerce: {
          currency: 'USD',
          value: priceNum * quantity,
          items: [{
            item_id: product.id,
            item_name: product.name,
            item_variant: selectedVariant.title,
            price: priceNum,
            quantity: quantity
          }]
        }
      });
    }

    setJustAdded(true)
    toast.success(t('addedToCart'), {
      action: { label: t('view'), onClick: cartStore.openCart }
    })

    // Auto-open drawer as per standard e-com flows, or just rely on pulse
    cartStore.openCart()

    setTimeout(() => setJustAdded(false), 1500)
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#FAFAFA] overflow-x-clip">
      
      {/* 1. Vibrant 2-Column Hero Section */}
      <section className="w-full relative z-10 flex flex-col lg:flex-row bg-[#FAFAFA] px-4 sm:px-6 md:px-12 pt-[120px] lg:pt-[140px] pb-6 md:pb-12 gap-6 lg:gap-12 max-w-[1600px] mx-auto">
        
        {/* Left: Sticky Image Panel */}
        <div className="w-full lg:w-[40%] xl:w-[45%] lg:sticky lg:top-[120px] relative self-start flex items-center justify-center">
          <div className="w-full flex flex-col items-center justify-center">
            <ImageGallery key={selectedVariant?.id} images={galleryImages} />
          </div>
        </div>

        {/* Right: Editorial Product Info */}
        <div className="w-full lg:w-[60%] xl:w-[55%] flex flex-col py-4 lg:py-8 relative z-10 lg:pl-4 xl:pl-8">

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-6">
            <Link href="/" className="hover:text-ink transition-colors">{t('home')}</Link>
            <ChevronRight size={10} className="text-ink/30" />
            <Link href="/shop" className="hover:text-ink transition-colors">{t('shop')}</Link>
            <ChevronRight size={10} className="text-ink/30" />
            <span className="text-ink">{product.name}</span>
          </div>

          {/* Meta Row: Category · Badges */}
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mb-6">
            {/* Vibrant Gradient Category Pill */}
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary to-primary-dark text-white px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase shadow-lg shadow-primary/30">
              <FlaskConical size={12} strokeWidth={2.5} />
              {(product.category as any)?.name || product.category || t('researchPeptide')}
            </div>
            
            {/* Minimal Editorial Badges */}
            {product.badges?.slice(0, 3).map((badge) => (
              <div key={badge} className="flex items-center gap-3">
                <span className="w-1 h-1 rounded-full bg-ink/20" />
                <span className="text-[10px] font-bold text-ink/40 tracking-[0.15em] uppercase">{badge}</span>
              </div>
            ))}
          </div>

          {/* Product Name (Home Page Typography) */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading text-4xl md:text-5xl lg:text-6xl font-black text-ink leading-[1.1] tracking-tighter uppercase mb-5"
          >
            {product.name}
          </motion.h1>

          {/* Price */}
          <motion.div
            key={`price-${selectedVariantId}`}
            initial={{ opacity: 0.6, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-8"
          >
            <span className="text-3xl sm:text-4xl font-bold text-ink tracking-tight">
              {selectedVariant?.salePrice || selectedVariant?.price}
            </span>
            {selectedVariant?.salePrice && (
              <>
                <span className="text-lg text-ink/40 line-through font-medium">{selectedVariant.price}</span>
                <span className="inline-flex items-center text-[10px] font-black tracking-[0.2em] uppercase bg-gradient-to-r from-primary to-primary-dark text-white px-3 py-1.5 rounded-full shadow-md shadow-primary/20">
                  {t('savePercent', { percent: Math.round(((parseFloat(selectedVariant.price.replace(/[^0-9.]/g, '')) - parseFloat(selectedVariant.salePrice.replace(/[^0-9.]/g, ''))) / parseFloat(selectedVariant.price.replace(/[^0-9.]/g, ''))) * 100) })}
                </span>
              </>
            )}
          </motion.div>

          {/* Short Description */}
          <p className="text-ink/70 text-base md:text-lg leading-relaxed mb-8">
            {product.shortDescription || product.description?.substring(0, 200) + '...'}
          </p>

          {/* Variant Selector Container */}
          {product.variants.length > 1 && (
            <div className="mb-8 bg-white p-6 rounded-[32px] shadow-sm border border-ink/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-ink/50 uppercase tracking-widest">{t('selectSize')}</span>
                <span className="text-[11px] text-ink/80 font-medium">{selectedVariant?.title}</span>
              </div>
              <VariantSelector
                variants={product.variants}
                value={selectedVariantId}
                onChange={setSelectedVariantId}
              />
            </div>
          )}



          {/* CTA Action Box */}
          <div className="flex flex-col gap-4 mb-8 bg-white p-6 sm:p-8 rounded-[32px] md:rounded-[40px] shadow-[0_8px_48px_-12px_rgba(0,0,0,0.05)] border border-ink/5">
            {/* Row: Quantity + Add to Cart + Wishlist */}
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <div className="flex gap-3 h-[60px]">
                <QuantityStepper
                  value={quantity}
                  onChange={setQuantity}
                  className="flex-1 sm:flex-none sm:w-[120px] h-full shrink-0 rounded-full"
                />
                <button
                  onClick={handleWishlistClick}
                  disabled={isWishlistPending}
                  className={`h-full w-[60px] flex items-center justify-center shrink-0 rounded-full border transition-colors duration-200 ${
                    inWishlist
                      ? 'border-red-100 bg-red-50 text-red-500'
                      : 'border-ink/10 bg-white hover:bg-gray-50 text-ink/40'
                  }`}
                >
                  {isWishlistPending
                    ? <Loader2 className="w-5 h-5 animate-spin text-ink/30" />
                    : <Heart className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`} strokeWidth={inWishlist ? 2.5 : 2} />
                  }
                </button>
              </div>
              
              <button
                className={`w-full sm:w-auto sm:flex-1 h-[60px] rounded-[24px] text-sm font-semibold tracking-wide uppercase flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
                  !selectedVariant?.inStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                    : justAdded
                    ? 'bg-green-600 text-white shadow-green-600/20'
                    : 'bg-[#121212] text-white hover:bg-gray-900 hover:-translate-y-0.5'
                }`}
                onClick={handleAddToCart}
                disabled={!selectedVariant?.inStock}
              >
                <AnimatePresence mode="wait">
                  {justAdded ? (
                    <motion.span key="added" initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} className="flex items-center gap-2 whitespace-nowrap">
                      <Check className="w-5 h-5" strokeWidth={2.5} /> {t('added')}
                    </motion.span>
                  ) : (
                    <motion.span key="add" initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} className="flex items-center gap-2 whitespace-nowrap">
                      <ShoppingCart className="w-5 h-5" strokeWidth={2} />
                      {selectedVariant?.inStock ? t('addToCart') : t('outOfStock')}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>

            {/* Buy Now */}
            <button
              className="w-full h-[60px] rounded-[24px] text-sm font-semibold tracking-wide uppercase text-ink border-2 border-ink/10 bg-transparent hover:border-ink hover:bg-ink hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={() => {
                handleAddToCart()
                setTimeout(() => window.location.href = '/checkout', 300)
              }}
              disabled={!selectedVariant?.inStock}
            >
              {t('buyNow')}
            </button>
          </div>

          {/* Trust Badges (Minimalist Grid) */}
          <div className="grid grid-cols-2 gap-y-5 gap-x-6 mb-10 pb-8 border-b border-ink/10">
            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Globe size={14} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-ink/70 group-hover:text-ink transition-colors">Ships Worldwide</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Lock size={14} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-ink/70 group-hover:text-ink transition-colors">Secure Checkout</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <FlaskConical size={14} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-ink/70 group-hover:text-ink transition-colors">Lab Tested</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <CheckCircle2 size={14} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-ink/70 group-hover:text-ink transition-colors">Quality Assured</span>
            </div>
          </div>

          {/* COA Download (mobile / no left panel) */}
          {product.coaFile && (
            <a
              href={product.coaFile}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-[11px] font-bold text-ink/50 uppercase tracking-[0.2em] hover:text-ink transition-colors mb-8 lg:hidden bg-white py-4 rounded-full border border-ink/10 shadow-sm"
            >
              <Download size={14} />
              {t('certificateOfAnalysis')}
            </a>
          )}

          {/* Bulk Bundles */}
          {product.bulkBundles && product.bulkBundles.length > 0 && (
            <div className="mb-8 p-6 sm:p-8 bg-white rounded-[32px] shadow-sm border border-ink/5">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold text-ink uppercase tracking-widest">{t('bulkPricing')}</span>
                <span className="text-[10px] text-white bg-gradient-to-r from-primary to-primary-dark px-3 py-1.5 rounded-full font-black tracking-[0.2em] uppercase shadow-md shadow-primary/20">{t('buyMoreSaveMore')}</span>
              </div>
              <div className="flex flex-col gap-3">
                {product.bulkBundles.map((bundle, idx) => {
                  let priceNum = 0;
                  let salePriceNum = 0;
                  let discount = 0;
                  let bundleVariantSku = bundle.name;
                  let bundleVariantTitle = bundle.name;

                  const currentVariantSku = selectedVariant?.sku || selectedVariant?.title || t('variant');
                  const currentVariantTitle = selectedVariant?.title || t('variant');

                  const override = (bundle as any).variantOverrides?.find((vo: any) => vo.variantSku === currentVariantSku || vo.variantSku === selectedVariant?.sku || vo.variantSku === selectedVariant?.title);

                  if (override) {
                    priceNum = override.price;
                    salePriceNum = override.salePrice || 0;
                    discount = salePriceNum ? Math.round(((priceNum - salePriceNum) / priceNum) * 100) : 0;
                    bundleVariantSku = `${currentVariantSku} - ${bundle.name}`;
                    bundleVariantTitle = `${currentVariantTitle} - ${bundle.name}`;
                  } else if (typeof bundle.discountPercentage === 'number' && bundle.discountPercentage > 0) {
                    const basePrice = parseFloat(String(selectedVariant?.salePrice || selectedVariant?.price || 0).replace(/[^0-9.]/g, ''))
                    priceNum = basePrice * bundle.quantity
                    salePriceNum = priceNum * (1 - (bundle.discountPercentage / 100))
                    discount = bundle.discountPercentage
                    bundleVariantSku = `${currentVariantSku} - ${bundle.name}`
                    bundleVariantTitle = `${currentVariantTitle} - ${bundle.name}`;
                  } else {
                    priceNum = typeof bundle.price === 'number' ? bundle.price : parseFloat(String(bundle.price || 0).replace(/[^0-9.]/g, ''))
                    salePriceNum = bundle.salePrice ? (typeof bundle.salePrice === 'number' ? bundle.salePrice : parseFloat(String(bundle.salePrice).replace(/[^0-9.]/g, ''))) : 0
                    discount = salePriceNum ? Math.round(((priceNum - salePriceNum) / priceNum) * 100) : 0
                  }

                  return (
                    <button
                      key={bundle.id || idx}
                      onClick={() => {
                        cartStore.addItem({ id: product.id, name: product.name, imageUrl: product.images[0], slug: product.slug }, bundleVariantSku, 1, salePriceNum || priceNum, bundleVariantTitle)
                        setJustAdded(true)
                        toast.success(t('addedBundleToCart'), { action: { label: t('view'), onClick: cartStore.openCart } })
                        setTimeout(() => setJustAdded(false), 1500)
                      }}
                      className="w-full flex items-center justify-between px-6 py-5 rounded-[24px] bg-[#FAFAFA] border border-transparent hover:border-ink/10 hover:bg-white hover:shadow-md transition-all duration-300 text-left group"
                    >
                      <div className="flex flex-col gap-1.5">
                        <span className="font-bold text-ink text-base tracking-tight group-hover:text-primary-dark transition-colors">{bundle.name}</span>
                        {discount > 0 && (
                          <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{t('savePercent', { percent: discount })}</span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-bold text-ink text-xl tracking-tight">${(salePriceNum || priceNum).toFixed(2)}</span>
                        {salePriceNum > 0 && priceNum > 0 && salePriceNum !== priceNum && (
                          <span className="text-[12px] text-ink/40 line-through font-medium">${priceNum.toFixed(2)}</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 2. Dark Credentials Section */}
      <section className="relative overflow-hidden bg-[#121212] mx-4 sm:mx-6 lg:mx-8 xl:mx-12 w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)] xl:w-[calc(100%-6rem)] rounded-[32px] lg:rounded-[40px] mb-8 lg:mb-12">
        {/* Ghost watermark */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 font-heading font-black text-white/[0.025] select-none pointer-events-none leading-none tracking-tighter text-[180px] sm:text-[260px] lg:text-[380px] pr-4">
          99.9
        </div>

        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 py-20 lg:py-28 relative z-10">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14 lg:mb-20">
            <div>
              <span className="text-white/25 text-[9px] sm:text-[10px] font-bold tracking-[0.28em] uppercase mb-4 block">{t('compoundProfile')}</span>
              <h2 className="font-heading text-[28px] sm:text-[36px] lg:text-[48px] font-black text-white leading-[0.9] tracking-tighter uppercase break-words">
                {t('theScienceLine1')}<br />{t('theScienceLine2')}
              </h2>
            </div>
            {product.coaFile && (
              <FluidButton
                href={product.coaFile}
                target="_blank"
                rel="noopener noreferrer"
                text={t('downloadCertificate')}
                variant="white"
                className="self-start sm:self-auto"
              />
            )}
          </div>

          <div className="flex flex-wrap lg:flex-nowrap items-start gap-12 lg:gap-0 lg:divide-x lg:divide-white/10 mt-8 sm:mt-12 lg:mt-0 border-t lg:border-t-0 border-white/10 pt-12 lg:pt-0">
            {[
              { value: '≥99%',    label: t('statVerifiedPurityLabel'),  desc: t('statVerifiedPurityDesc')          },
              { value: t('statLabTestedValue'), label: t('statLabTestedLabel'),       desc: t('statLabTestedDesc')    },
              { value: t('statGradeQualityValue'),  label: t('statGradeQualityLabel'),    desc: t('statGradeQualityDesc')        },
              { value: 'COA',       label: t('statDocumentedLabel'),       desc: t('statDocumentedDesc')       },
            ].map((stat, i) => (
              <div 
                key={stat.label} 
                className="w-full sm:w-[calc(50%-1.5rem)] lg:w-1/4 lg:px-6 xl:px-8 first:lg:pl-0 last:lg:pr-0 group"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors duration-300" />
                  <span className="text-primary text-[10px] font-black tracking-[0.2em] uppercase">
                    {stat.label}
                  </span>
                </div>
                <div className="font-heading font-black text-white text-5xl sm:text-[3.5rem] tracking-tighter leading-none mb-3 group-hover:text-primary transition-colors duration-300 whitespace-nowrap">
                  {stat.value}
                </div>
                <p className="text-white/50 text-sm font-medium tracking-wide leading-relaxed max-w-[200px]">
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Details Tab Section */}
      <section className="w-full relative z-10 py-20 lg:py-32 bg-[#FAFAFA]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <ProductDetailTabs tabs={product.tabs} />
        </div>
      </section>

      {/* 5. Related Editorial Carousel */}
      <section className="w-full py-24 bg-[#FAFAFA] overflow-hidden relative">
        <Container size="wide" className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-primary text-[9px] sm:text-label-sm uppercase tracking-[0.2em] font-bold mb-3 sm:mb-4 block">{t('continueExploring')}</span>
              <h2 className="font-heading text-[28px] sm:text-[36px] lg:text-[48px] leading-none font-black tracking-tighter text-black uppercase break-words">
                {t('alsoConsidered')}
              </h2>
            </div>

            {/* Carousel Navigation */}
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => relatedEmblaApi?.scrollPrev()}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-primary/30 flex items-center justify-center text-black hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm bg-white"
                aria-label={t('previousProducts')}
              >
                <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => relatedEmblaApi?.scrollNext()}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-primary/30 flex items-center justify-center text-black hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm bg-white"
                aria-label={t('nextProducts')}
              >
                <ChevronRight size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          <div 
            className="relative -mx-4 px-4 sm:mx-0 sm:px-0 md:cursor-none md:[&_*]:!cursor-none"
            onMouseEnter={() => setIsHoveringSlider(true)}
            onMouseLeave={() => setIsHoveringSlider(false)}
            onMouseMove={handleSliderMouseMove}
          >
            <div className="overflow-hidden -m-6 p-6" ref={relatedEmblaRef}>
              <div className="flex gap-6 lg:gap-8 pb-6">
                {product.relatedProducts.map((p) => (
                  <div key={p.id} className="flex-[0_0_100%] sm:flex-[0_0_45%] lg:flex-[0_0_calc(25%-1.5rem)] min-w-0">
                    <ProductCard product={p as any} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2.5 FAQs Section (Moved to Bottom) */}
      {product.faqs && product.faqs.length > 0 && (
        <SharedFaqSection
          title={t('frequentlyAsked')}
          faqs={product.faqs}
        />
      )}

      {/* 3. Suggested Blogs Section */}
      {product.suggestedBlogs && product.suggestedBlogs.length > 0 && (
        <section className="w-full py-24 bg-[#FAFAFA] border-t border-gray-100">
          <Container size="wide">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <span className="text-primary text-label-sm uppercase tracking-[0.2em] font-bold mb-4 block">{t('educationAndResearch')}</span>
                <h2 className="font-heading text-[44px] sm:text-[56px] lg:text-[64px] leading-none font-black tracking-tighter text-black uppercase">
                  {t('furtherReading')}
                </h2>
              </div>
              <Button variant="outline" className="rounded-full font-bold border-black/20 hover:bg-black hover:text-white transition-all shadow-sm w-fit shrink-0">
                {t('viewAllResearch')}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {product.suggestedBlogs.map((post) => (
                <BlogPostCard key={post.id} {...(post as any)} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Mobile Fixed Action Bar */}
      <AnimatePresence>
        {showMobileBar && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/90 backdrop-blur-xl border-t border-gray-200 flex items-center gap-3 lg:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.05)] pb-safe"
          >
            <motion.button 
              whileHover={isWishlistPending ? {} : { scale: 1.05 }}
              whileTap={isWishlistPending ? {} : { scale: 0.9 }}
              className={`relative w-11 h-11 p-0 flex-shrink-0 rounded-full font-bold border transition-colors duration-300 flex items-center justify-center group outline-none disabled:opacity-70 ${
                inWishlist ? 'border-red-500 bg-red-50 text-red-500 shadow-sm' : 'border-black/10 bg-white text-black/60 hover:text-black hover:bg-gray-50'
              }`}
              aria-label={t('toggleWishlist')}
              onClick={handleWishlistClick}
              disabled={isWishlistPending}
            >
              <AnimatePresence>
                {showParticles && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {[...Array(8)].map((_, i) => {
                      const angle = (i * 45 * Math.PI) / 180;
                      return (
                        <motion.div
                          key={i}
                          className="absolute w-1.5 h-1.5 bg-red-400 rounded-full"
                          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                          animate={{
                            x: Math.cos(angle) * 35,
                            y: Math.sin(angle) * 35,
                            scale: [0, 1.5, 0],
                            opacity: [1, 1, 0]
                          }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      )
                    })}
                  </div>
                )}
              </AnimatePresence>
              <motion.div
                animate={inWishlist && !isWishlistPending ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {isWishlistPending ? (
                  <Loader2 size={18} className={`animate-spin ${inWishlist ? 'text-red-500' : 'text-black/60'}`} />
                ) : (
                  <Heart size={18} className={`transition-colors duration-300 ${inWishlist ? 'fill-current' : ''}`} strokeWidth={inWishlist ? 2.5 : 2} />
                )}
              </motion.div>
            </motion.button>

            <Button 
              variant="outline" 
              className="w-11 h-11 p-0 flex-shrink-0 rounded-full font-bold text-black border border-black bg-white hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center group"
              aria-label={t('addToCart')}
              onClick={handleAddToCart}
              disabled={!selectedVariant?.inStock || justAdded}
            >
              <AnimatePresence mode="wait">
                {justAdded ? (
                  <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Check size={18} strokeWidth={2.5} />
                  </motion.div>
                ) : (
                  <motion.div key="cart" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <ShoppingCart size={18} strokeWidth={1.5} className="group-hover:text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            <Button 
              variant="dark" 
              className="flex-1 h-11 rounded-full font-bold text-white bg-gradient-to-r from-black to-gray-800 hover:from-black hover:to-black transition-all duration-300 text-[11px] uppercase tracking-widest border-none shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:-translate-y-0.5"
              onClick={() => {
                handleAddToCart()
                setTimeout(() => window.location.href = '/checkout', 300)
              }}
              disabled={!selectedVariant?.inStock}
            >
              {t('buyNow')}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Swipe Cursor */}
      <AnimatePresence>
        {isHoveringSlider && (
          <motion.div
            initial={{ scale: 0, opacity: 0, padding: '0px' }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              padding: isSliderAtEnd ? '0 24px' : '0px'
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed top-0 left-0 h-[72px] bg-white/90 backdrop-blur-md text-black rounded-full flex items-center justify-center pointer-events-none z-[100] text-[10px] font-bold tracking-[0.2em] shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-black/10 hidden md:flex overflow-hidden"
            style={{
              x: cursorXSpring,
              y: cursorYSpring,
              minWidth: '72px',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={isSliderAtEnd ? 'end' : 'swipe'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="whitespace-nowrap"
              >
                {isSliderAtEnd ? t('sliderEnd') : t('swipe')}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
