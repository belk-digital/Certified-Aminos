'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const slides = [
  { id: 1, src: '/HelixBio Images/slide-1.webp', alt: 'Helix Bio Slide 1' },
  { id: 2, src: '/HelixBio Images/slide-2.webp', alt: 'Helix Bio Slide 2' },
  { id: 3, src: '/HelixBio Images/slide-3.webp', alt: 'Helix Bio Slide 3' },
]

export function ImageSliderSection() {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative w-full py-16 md:py-24 bg-[#FAFAFA] overflow-hidden flex flex-col items-center">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* The Slider Container with a visible white frame and Apple-TV style hover effect */}
        <div className="relative rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-[0_8px_40px_rgb(0,0,0,0.08)] group border border-neutral-200/60 bg-white ring-1 ring-black/5 p-2 sm:p-3 md:p-4 transition-all duration-700 hover:shadow-[0_20px_60px_rgb(0,0,0,0.15)] hover:-translate-y-2">
          
          <div className="overflow-hidden w-full relative rounded-2xl md:rounded-3xl bg-neutral-100 aspect-video sm:aspect-auto sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[650px]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute inset-0 w-full h-full transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
              >
                <Image
                  src={slides[selectedIndex].src}
                  alt={slides[selectedIndex].alt}
                  fill
                  className="object-cover object-center"
                  priority={selectedIndex === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1400px"
                />
                {/* Subtle inner shadow for depth */}
                <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.05)] pointer-events-none rounded-2xl md:rounded-3xl transition-opacity duration-700 group-hover:opacity-70" />
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* Modern Progress Line Dots - Moved outside the image container */}
        <div className="mt-8 flex justify-center items-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className="min-w-[48px] min-h-[48px] flex items-center justify-center outline-none -mx-2"
              aria-label={`Go to slide ${index + 1}`}
            >
              <div
                className={cn(
                  "transition-all duration-500 rounded-full",
                  selectedIndex === index 
                    ? "w-10 h-2 bg-neutral-800" 
                    : "w-2 h-2 bg-neutral-300 hover:bg-neutral-400"
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
