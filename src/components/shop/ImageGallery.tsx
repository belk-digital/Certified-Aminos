'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
// Zoom-on-hover effect disabled for now.
// import { motion, AnimatePresence } from 'framer-motion'

export interface ImageGalleryProps {
  images: string[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const t = useTranslations('shop.imageGallery')
  const [activeIndex, setActiveIndex] = useState(0)
  // Zoom-on-hover effect disabled for now.
  // const [isHovering, setIsHovering] = useState(false)
  // const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Embla for mobile swipe
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setActiveIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi, setActiveIndex])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  const scrollTo = useCallback((index: number) => {
    setActiveIndex(index)
    if (emblaApi) emblaApi.scrollTo(index)
  }, [emblaApi])

  // const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  //   const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
  //   const x = ((e.clientX - left) / width) * 100
  //   const y = ((e.clientY - top) / height) * 100
  //   const img = e.currentTarget.querySelector('img')
  //   if (img) {
  //     img.style.transformOrigin = `${x}% ${y}%`
  //   }
  // }

  // const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
  //   const img = e.currentTarget.querySelector('img')
  //   if (img) {
  //     img.style.transformOrigin = 'center center'
  //     // Reset scale is handled by CSS group-hover removing the scale class
  //   }
  // }

  // const handleCursorMove = (e: React.MouseEvent<HTMLDivElement>) => {
  //   const { left, top } = e.currentTarget.getBoundingClientRect()
  //   setMousePosition({ x: e.clientX - left, y: e.clientY - top })
  // }

  if (!images || images.length === 0) return null

  return (
    <div className="w-full relative h-full">

      {/* Main Image */}
      <div
        className="relative w-full bg-transparent overflow-hidden"
        ref={emblaRef}
        // Zoom-on-hover effect disabled for now.
        // onMouseEnter={() => setIsHovering(true)}
        // onMouseLeave={() => setIsHovering(false)}
        // onMouseMove={handleCursorMove}
      >
        <div className="flex h-full">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative min-w-0 shrink-0 grow-0 basis-full overflow-hidden flex items-center justify-center"
              // onMouseMove={handleMouseMove}
              // onMouseLeave={handleMouseLeave}
            >
              <Image
                src={img}
                alt={t('productViewAlt', { number: idx + 1 })}
                width={1000}
                height={1000}
                priority={idx === 0}
                className="w-auto h-auto max-w-full max-h-[60vh] lg:max-h-[calc(100vh-160px)] object-contain transition-transform duration-700 ease-out rounded-[32px] md:rounded-[40px] shadow-sm"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>

        {/* Thumbnails Row (Inside Main Image at Bottom) */}
        {images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex justify-center gap-2.5 overflow-x-auto scrollbar-none max-w-[90%] p-2.5 rounded-full bg-white/40 backdrop-blur-md border border-white/50 shadow-sm">
            {images.map((img, idx) => {
              const isActive = activeIndex === idx
              return (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    scrollTo(idx)
                  }}
                  className={cn(
                    "relative w-12 h-12 lg:w-14 lg:h-14 shrink-0 rounded-full overflow-hidden transition-all duration-200 bg-white",
                    isActive
                      ? "ring-2 ring-black ring-offset-2 ring-offset-white/50 opacity-100"
                      : "opacity-50 hover:opacity-80"
                  )}
                  aria-label={t('viewImage', { number: idx + 1 })}
                >
                  <Image
                    src={img}
                    alt={t('thumbnailAlt', { number: idx + 1 })}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </button>
              )
            })}
          </div>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 z-20 bg-black/25 backdrop-blur-sm text-white rounded-full px-3 py-1.5 text-[9px] font-bold tracking-[0.18em] pointer-events-none tabular-nums">
            {String(activeIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
          </div>
        )}

        {/* Custom Frosted Glass Cursor — zoom-on-hover effect disabled for now.
        <AnimatePresence>
          {isHovering && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-none absolute z-50 flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
              style={{
                left: mousePosition.x - 48,
                top: mousePosition.y - 48,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-black/50">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
        */}

      </div>

    </div>
  )
}
