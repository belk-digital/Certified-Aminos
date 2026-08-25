'use client'

import React from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Heart } from 'lucide-react'
import { useWishlistStore } from '@/lib/wishlist/store'
import { useCartStore } from '@/lib/cart/store'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export interface WishlistItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  descriptor: string;
  price: string;
  hasVariants?: boolean;
}

export interface AccountWishlistProps {
  items: WishlistItem[];
}

function parsePrice(price: string): number {
  return parseFloat(price.replace(/[^0-9.]/g, '')) || 0
}

export function WishlistClient({ items: serverItems }: AccountWishlistProps) {
  const t = useTranslations('account.wishlist')
  const { removeItem, setItems } = useWishlistStore()
  const cartStore = useCartStore()
  const router = useRouter()

  useEffect(() => {
    setItems(serverItems.map(({ id, name, slug, image }) => ({ id, name, slug, image })))
  }, [])

  const [displayItems, setDisplayItems] = useState(serverItems)
  
  useEffect(() => {
    setDisplayItems(serverItems)
  }, [serverItems])

  const addToCart = (item: WishlistItem) => {
    if (item.hasVariants) {
      toast.info(t('selectVariantRequired', { name: item.name }) || `Please select a variant for ${item.name}`)
      router.push(`/product/${item.slug}`)
      return
    }

    cartStore.addItem(
      { id: item.id, name: item.name, imageUrl: item.image, slug: item.slug },
      'Default',
      1,
      parsePrice(item.price)
    )
    toast.success(t('addToCart'), { action: { label: t('view'), onClick: cartStore.openCart } })
  }

  const moveAllToCart = () => {
    let itemsNeedingVariants = 0
    let itemsAdded = 0
    
    displayItems.forEach((item) => {
      if (item.hasVariants) {
        itemsNeedingVariants++
      } else {
        cartStore.addItem(
          { id: item.id, name: item.name, imageUrl: item.image, slug: item.slug },
          'Default',
          1,
          parsePrice(item.price)
        )
        itemsAdded++
      }
    })

    if (itemsAdded > 0) {
      cartStore.openCart()
    }
    
    if (itemsNeedingVariants > 0) {
      toast.info(t('someItemsNeedVariants', { count: itemsNeedingVariants }) || `${itemsNeedingVariants} item(s) require you to choose a variant first.`)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col w-full font-sans"
    >
      
      {/* Massive Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-gray-200 pb-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl md:text-7xl font-light text-black tracking-tight leading-none">
            {t('title')}
          </h1>
          <p className="text-gray-500 mt-2 max-w-lg text-sm md:text-base leading-relaxed font-light">{t('itemsSaved', { count: displayItems.length })}</p>
        </div>

        <button
          onClick={moveAllToCart}
          disabled={displayItems.length === 0}
          className="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white rounded-full px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] transition-all w-full sm:w-auto font-heading disabled:opacity-40 disabled:pointer-events-none mt-4 md:mt-0"
        >
          <ShoppingBag size={14} />
          {t('moveAllToCart')}
        </button>
      </div>

      <AnimatePresence>
        {displayItems.length > 0 ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12"
          >
            {displayItems.map((product, i) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group flex flex-col relative"
              >
                
                {/* Image Area - Clean Editorial Presentation */}
                <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-50 rounded-none mb-6">
                  <Link href={`/product/${product.slug}`}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full h-full relative"
                    >
                      <Image
                        src={product.image || '/HelixBio Images/featured-research-2.webp'}
                        alt={product.name}
                        fill
                        className="object-cover mix-blend-multiply"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    </motion.div>
                  </Link>

                  {/* Remove Button Overlay */}
                  <button 
                    onClick={async (e) => {
                      e.preventDefault()
                      const currentItems = displayItems
                      setDisplayItems(prev => prev.filter(i => i.id !== product.id))
                      try {
                        await removeItem(product.id)
                      } catch (err) {
                        setDisplayItems(currentItems)
                        toast.error('Failed to remove item')
                      }
                    }}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-white text-gray-400 hover:text-black hover:bg-gray-100 flex items-center justify-center rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 border border-gray-100"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Info Area - Clean Typography */}
                <div className="flex flex-col flex-1">
                  <Link href={`/product/${product.slug}`}>
                    <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 mb-2 block font-heading">
                      {/* @ts-ignore */}
                      {product.descriptor || t('productFallback')}
                    </span>
                    <h3 className="text-xl font-light text-black tracking-tight leading-tight group-hover:text-[#1e5661] transition-colors mb-4">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
                    <span className="text-xl font-light text-black tracking-tight">
                      {/* @ts-ignore */}
                      {product.price || product.priceRange || ''}
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-transparent hover:bg-black text-black hover:text-white border border-gray-200 hover:border-black rounded-full px-6 py-2 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors shrink-0 font-heading"
                    >
                      {t('addToCart')}
                    </button>
                  </div>
                </div>
                
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col items-center justify-center py-20 text-center"
          >
            <Heart size={48} className="text-gray-200 mb-6" strokeWidth={1} />
            <h2 className="text-2xl font-light text-black tracking-tight mb-2">{t('emptyTitle')}</h2>
            <p className="text-gray-500 font-light max-w-sm mb-8">{t('emptyDescription')}</p>
            <Link href="/shop" className="border border-gray-200 hover:border-black text-black rounded-full px-8 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors font-heading">
              {t('startBrowsing')}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}
