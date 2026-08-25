'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Loader2, Zap, Sparkles, BatteryCharging, Dna, ArrowRight, CornerDownLeft, Activity, Brain, ShieldPlus, Network } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { getCategoryDisplayName } from '@/lib/categoryDisplay'

export interface QuickCategory {
  id: string | number
  name: string
  slug?: string
}

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
  categories?: QuickCategory[]
}

// Payload has no per-category icon field, so icons are assigned by position.
const QUICK_CATEGORY_ICONS = [Zap, Sparkles, BatteryCharging, Dna, Activity, Brain, ShieldPlus, Network]

export function SearchOverlay({ isOpen, onClose, categories = [] }: SearchOverlayProps) {
  const t = useTranslations('searchOverlay')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const featuredImages = [
    '/HelixBio Images/featured-research-1.webp',
    '/HelixBio Images/featured-research-2.webp',
    '/HelixBio Images/mutiple-vial-1.webp'
  ]

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setResults([])
      setActiveImageIndex(0)
    }
  }, [isOpen])

  // Slider Interval
  useEffect(() => {
    if (!isOpen) return
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % featuredImages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [isOpen, featuredImages.length])

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Cmd+K to open (if we want to add that globally, we'd do it outside, but we can mention it here)

  // Debounced search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data)
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsLoading(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [query])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />

          {/* Mega Menu Dropdown Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full bg-white relative z-10 shadow-2xl border-b border-black/5 max-h-[100dvh] lg:max-h-[75vh] overflow-hidden"
          >
            <div className="max-w-[1440px] mx-auto w-full flex flex-col lg:flex-row h-full max-h-[100dvh] lg:max-h-[75vh]">
              
              {/* Left Column: Search & Results */}
              <div data-lenis-prevent className="flex-1 flex flex-col p-4 sm:p-12 lg:p-16 lg:pr-12 h-full overflow-y-auto overflow-x-hidden w-full">
                {/* Search Input */}
                <div className="flex items-center gap-3 sm:gap-6 border-b border-black/10 pb-4 sm:pb-6 w-full">
                  {isLoading ? (
                    <Loader2 className="text-black/30 animate-spin shrink-0 w-6 h-6 sm:w-10 sm:h-10" strokeWidth={1} />
                  ) : (
                    <Search className="text-black/30 shrink-0 w-6 h-6 sm:w-10 sm:h-10" strokeWidth={1} />
                  )}
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={t('placeholder')}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 min-w-0 w-full bg-transparent text-2xl sm:text-5xl lg:text-6xl font-light text-black placeholder:text-black/20 focus:outline-none tracking-tight"
                  />
                  <button
                    onClick={onClose}
                    className="p-2 sm:p-3 text-black/40 hover:text-black bg-[#F5F5F7] hover:bg-black/10 rounded-full transition-colors shrink-0"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Content Area */}
                <div data-lenis-prevent className="flex-1 pt-8 overflow-y-auto min-h-[40vh]">
                  {/* Quick Categories (Empty State) */}
                  {!query && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                      <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-black/30">
                        {t('quickCategories')}
                      </span>
                      <div className="flex flex-wrap gap-3 sm:gap-4">
                        {categories.map((cat, index) => {
                          const Icon = QUICK_CATEGORY_ICONS[index % QUICK_CATEGORY_ICONS.length]
                          return (
                            <Link
                              key={cat.id}
                              href={`/shop?category=${encodeURIComponent(cat.name)}`}
                              onClick={onClose}
                              className="group flex items-center gap-3 px-5 sm:px-6 py-3 sm:py-4 rounded-[16px] bg-[#F5F5F7] hover:bg-black hover:text-white transition-all cursor-pointer border border-transparent shadow-sm"
                            >
                              <Icon size={18} className="text-black/50 group-hover:text-white/80 transition-colors" strokeWidth={1.5} />
                              <span className="text-xs sm:text-sm font-bold text-black group-hover:text-white transition-colors whitespace-nowrap">
                                {getCategoryDisplayName(cat.name)}
                              </span>
                            </Link>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Results */}
                  {query && !isLoading && results.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12">
                      <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-black/40 mb-4">{t('noResults')}</p>
                      <p className="text-base sm:text-lg text-black/60 font-light">{t('tryAdjusting')}</p>
                    </motion.div>
                  )}

                  {results.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                      <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-black/30">
                        {t('searchResults', { count: results.length })}
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {results.map((product) => (
                          <Link
                            key={product.id}
                            href={`/product/${product.slug}`}
                            onClick={onClose}
                            className="group flex items-center gap-4 p-4 rounded-[24px] bg-white border border-black/5 hover:border-black/10 hover:shadow-lg transition-all"
                          >
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-[16px] overflow-hidden bg-[#F5F5F7] shrink-0 border border-black/5">
                              {product.imageUrl && (
                                <Image
                                  src={product.imageUrl}
                                  alt={product.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              )}
                            </div>
                            <div className="flex flex-col min-w-0 pr-2">
                              <h3 className="text-sm sm:text-base font-bold text-black truncate group-hover:text-primary transition-colors uppercase tracking-widest">
                                {product.name}
                              </h3>
                              {product.descriptor && (
                                <p className="text-[10px] sm:text-xs text-black/50 mt-1 truncate">
                                  {product.descriptor}
                                </p>
                              )}
                              <p className="text-xs font-bold text-black mt-2 tracking-widest">${product.price}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Footer hints */}
                <div className="pt-8 mt-8 border-t border-black/5 flex items-center gap-4 text-black/40 shrink-0">
                  <CornerDownLeft size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{t('pressEnter')}</span>
                </div>
              </div>

              {/* Right Column: Featured Banner (Desktop Only) */}
              <div className="hidden lg:block w-[40%] bg-cream relative overflow-hidden border-l border-black/5">
                <div className="absolute inset-0">
                  {featuredImages.map((src, idx) => (
                    <Image
                      key={src}
                      src={src}
                      alt={`Featured Helix Bio research peptide, image ${idx + 1}`}
                      fill
                      className={`object-cover scale-105 transition-opacity duration-1000 ${
                        idx === activeImageIndex ? 'opacity-90' : 'opacity-0 z-[-1]'
                      }`}
                    />
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                </div>
                <div className="absolute bottom-0 left-0 w-full p-12 flex flex-col gap-4">
                  <span className="px-3 py-1 bg-primary text-black text-[10px] font-bold uppercase tracking-[0.2em] rounded-full w-fit">Featured</span>
                  <h2 className="text-4xl font-light text-white leading-tight">Advanced Research Compounds</h2>
                  <p className="text-white/80 font-light text-sm max-w-sm">Explore our curated selection of high-purity peptides for your laboratory needs.</p>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
