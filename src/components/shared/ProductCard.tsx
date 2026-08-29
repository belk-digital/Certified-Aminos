'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useWishlistStore } from '@/lib/wishlist/store'
import { useCartStore } from '@/lib/cart/store'
import { toast } from 'sonner'
import { Product } from '@/components/shop/PrimaryProductCard' // Re-using the interface for now

export interface ProductCardProps {
  product: Product | any
}

interface ProductVariant {
  sku: string
  price: number
  dose: string
  image?: string
}

const getImageUrl = (prod: any) =>
  prod.imageUrl || prod.image || prod.images?.[0]?.image?.url || '/HelixBio Images/featured-research-2.webp'
const getCategory = (prod: any) => prod.category || prod.categories?.[0]?.title || 'RESEARCH PEPTIDE'
const getDescription = (prod: any) =>
  prod.shortDescription ||
  prod.meta?.description ||
  'Highly purified synthetic peptide prepared for rigorous laboratory research.'
const getPrice = (prod: any) => (prod.isFrom ? `From $${prod.price}` : (prod.priceRange ?? prod.price))
const getVariants = (prod: any): ProductVariant[] =>
  Array.isArray(prod.variants) ? prod.variants.filter((v: any) => v && v.sku) : []
const getBadge = (prod: any): string | null => prod.badge && prod.badge !== 'none' ? prod.badge : null

export function ProductCard({ product }: ProductCardProps) {
  const addWishlistItem = useWishlistStore((state) => state.addItem)
  const removeWishlistItem = useWishlistStore((state) => state.removeItem)
  const isWishlistedGlobal = useWishlistStore((state) => (product.id ? state.hasItem(product.id) : false))
  const { status } = useSession()
  const isSignedIn = status === 'authenticated'
  const cartStore = useCartStore()

  const [inWishlist, setInWishlist] = useState(isWishlistedGlobal)
  const [isPending, setIsPending] = useState(false)

  const variants = getVariants(product)
  const [selectedDoseIdx, setSelectedDoseIdx] = useState(0)
  const selectedVariant = variants[selectedDoseIdx]

  React.useEffect(() => {
    setInWishlist(isWishlistedGlobal)
  }, [isWishlistedGlobal])

  const handleWishlistClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isSignedIn) {
      toast.error('Sign in required', { description: 'Please log in to add items to your wishlist.' })
      return
    }

    if (!product.id) {
      toast.error('Product ID missing', { description: 'Unable to add this product to wishlist.' })
      return
    }

    setIsPending(true)
    try {
      if (inWishlist) {
        await removeWishlistItem(product.id)
        setInWishlist(false)
        toast('Removed from wishlist', { description: `${product.name} has been removed.` })
      } else {
        await addWishlistItem({
          id: product.id,
          name: product.name,
          slug: product.slug,
          image: getImageUrl(product),
          priceRange: String(getPrice(product) ?? ''),
        })
        setInWishlist(true)
        toast.success('Added to wishlist', { description: `${product.name} is now in your wishlist.` })
      }
    } catch (error: any) {
      toast.error('Failed to update wishlist', { description: error.message || 'An unexpected error occurred.' })
    } finally {
      setIsPending(false)
    }
  }

  const handleSelectDose = (e: React.MouseEvent<HTMLButtonElement>, idx: number) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedDoseIdx(idx)
  }

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (variants.length > 0) {
      const variant = selectedVariant || variants[0]
      cartStore.addItem(
        { id: product.id || product.slug, name: product.name, imageUrl: variant.image || getImageUrl(product), slug: product.slug },
        variant.sku,
        1,
        variant.price || 0,
        variant.dose,
      )
      toast.success(`Added ${variant.dose} to cart`, { action: { label: 'VIEW', onClick: cartStore.openCart } })
      cartStore.openCart()
      return
    }

    const priceRaw = getPrice(product)
    const priceVal = typeof priceRaw === 'string' ? parseFloat(priceRaw.replace(/[^0-9.]/g, '')) : Number(priceRaw)

    cartStore.addItem(
      { id: product.id || product.slug, name: product.name, imageUrl: getImageUrl(product), slug: product.slug },
      'Default',
      1,
      priceVal || 0,
    )
    toast.success('Added to cart', { action: { label: 'VIEW', onClick: cartStore.openCart } })
    cartStore.openCart()
  }

  const badge = getBadge(product)
  const displayPrice = selectedVariant ? `$${selectedVariant.price}` : (() => {
    const price = getPrice(product)
    return typeof price === 'string' && price.includes('$') ? price.replace('From ', '') : `$${price}`
  })()

  return (
    <div className="w-full h-full flex flex-col group cursor-pointer bg-[#f0f4fa] rounded-xl md:rounded-2xl border border-navy-deep/10 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative">
      <Link draggable={false} href={`/product/${product.slug}`} className="absolute inset-0 z-20" aria-label={product.name} />

      {/* Badges & Wishlist Overlay */}
      <div className="absolute top-3 left-0 w-full px-3 flex justify-between items-start z-30 pointer-events-none">
        {badge ? (
          <div
            className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
              badge === 'NEW'
                ? 'bg-navy-deep text-white'
                : badge === 'SALE'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'bg-white text-navy-deep border border-navy-deep/10 shadow-sm'
            }`}
          >
            {badge}
          </div>
        ) : (
          <span />
        )}

        <button
          disabled={isPending}
          onClick={handleWishlistClick}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`pointer-events-auto h-7 w-7 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/40 transition-colors ml-auto ${inWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500 hover:bg-white'}`}
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Heart size={14} strokeWidth={2} fill={inWishlist ? 'currentColor' : 'none'} />}
        </button>
      </div>

      {/* Image */}
      <div className="h-48 md:h-64 w-full relative flex items-center justify-center pt-8 pb-2">
        <Image
          src={(selectedVariant && selectedVariant.image) || getImageUrl(product)}
          alt={product.name}
          fill
          unoptimized
          className="object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500 ease-out p-6 pointer-events-none"
        />
      </div>

      {/* Info */}
      <div className="flex flex-col px-4 md:px-5 pb-4 md:pb-5 mt-auto relative z-30 pointer-events-none">
        <span className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">
          {getCategory(product)}
        </span>

        <div className="flex flex-col items-start gap-1 mb-3 md:mb-4">
          <h3 className="text-navy-deep font-bold text-[15px] md:text-lg tracking-tight">{product.name}</h3>
          {variants.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-1 pointer-events-auto">
              {variants.map((v, idx) => (
                <button
                  key={v.sku}
                  onClick={(e) => handleSelectDose(e, idx)}
                  aria-pressed={idx === selectedDoseIdx}
                  className={`text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded flex items-center justify-center tracking-wide transition-colors ${
                    idx === selectedDoseIdx
                      ? 'bg-navy-deep text-white'
                      : 'bg-[#e8f4ca] text-[#557e2a] hover:bg-[#dcecb0]'
                  }`}
                >
                  {v.dose}
                </button>
              ))}
            </div>
          )}
          <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed line-clamp-2">
            {getDescription(product)}
          </p>
        </div>

        <div className="flex justify-between items-center mt-auto pointer-events-auto">
          <span className="text-navy-deep font-bold text-lg md:text-xl">
            {displayPrice}
          </span>
          <button
            onClick={handleAddToCart}
            aria-label="Add to cart"
            className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-navy-deep flex items-center justify-center text-white hover:bg-[#0f172a] shadow-md transition-colors flex-shrink-0"
          >
            <ShoppingCart size={15} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}
