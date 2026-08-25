'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Link } from '@/i18n/navigation'
import gsap from 'gsap'
import { Hand } from 'lucide-react'
import { getCategoryDisplayName } from '@/lib/categoryDisplay'

export interface HomeCategory {
  id: string | number
  name: string
  slug?: string
}

export interface CategoriesSectionProps {
  categories?: HomeCategory[]
}

// Real brand photography for categories we have dedicated art for; anything else falls
// back to the generic Helix imagery cycled by index.
const CATEGORY_IMAGE_BY_NAME: Record<string, string> = {
  'glp-1 & metabolic': '/categories images/GLP-1-and-metabolic.png',
  'healing & recovery': '/categories images/Healing-and-recovery.png',
  'cosmetic & skin': '/categories images/cosmetic-and-skin.png',
  'sexual & hormonal': '/categories images/sexual-and-harmonal.png',
}

const FALLBACK_CATEGORY_IMAGES = [
  '/HelixBio Images/category-1.webp',
  '/HelixBio Images/category-2.webp',
  '/HelixBio Images/category-3.webp',
  '/HelixBio Images/category-4.webp',
  '/HelixBio Images/category-5.webp',
  '/HelixBio Images/category-6.webp',
  '/HelixBio Images/category-7.webp',
  '/HelixBio Images/category-8.webp',
]

function getCategoryImage(name: string, index: number) {
  const match = CATEGORY_IMAGE_BY_NAME[name.trim().toLowerCase()]
  return match || FALLBACK_CATEGORY_IMAGES[index % FALLBACK_CATEGORY_IMAGES.length]
}

const PAGE_SIZE = 4

function CategoryCard({ category, index }: { category: HomeCategory; index: number }) {
  const displayName = getCategoryDisplayName(category.name)
  const image = getCategoryImage(category.name, index)

  return (
    <Link
      href={`/shop?category=${encodeURIComponent(category.name)}`}
      className="relative w-full h-64 md:h-auto md:flex-1 overflow-hidden group cursor-pointer rounded-lg shadow-sm transition-all duration-500 ease-out md:hover:flex-[1.5]"
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url('${image}')` }}
      ></div>

      <div className="absolute inset-0 bg-black/10 transition-colors duration-300 group-hover:bg-black/30"></div>

      <div className="absolute inset-0 p-8 flex flex-col justify-between text-white">
        <span className="font-inter text-2xl font-light opacity-90">{String(index + 1).padStart(2, '0')}</span>

        <div>
          <h3 className="font-syncopate text-[0.8rem] md:text-[0.95rem] font-normal mb-4 leading-relaxed tracking-wider uppercase">
            {displayName}
          </h3>
          <div className="flex items-center text-[0.65rem] font-bold font-inter uppercase tracking-widest opacity-90 group-hover:opacity-100 transition-opacity">
            VIEW PRODUCTS <span className="ml-2 font-normal text-sm">→</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function CategoriesSection({ categories = [] }: CategoriesSectionProps) {
  const [page, setPage] = useState(0)
  const pageCount = Math.max(1, Math.ceil(categories.length / PAGE_SIZE))
  const trackRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  const pages: HomeCategory[][] = []
  for (let i = 0; i < pageCount; i++) {
    pages.push(categories.slice(i * PAGE_SIZE, i * PAGE_SIZE + PAGE_SIZE))
  }

  useEffect(() => {
    if (!trackRef.current) return
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    gsap.to(trackRef.current, {
      xPercent: -(page * (100 / pageCount)),
      duration: 0.8,
      ease: 'power3.inOut',
    })
  }, [page, pageCount])

  const goPrev = () => setPage((p) => (p - 1 + pageCount) % pageCount)
  const goNext = () => setPage((p) => (p + 1) % pageCount)

  return (
    <section className="w-full flex flex-col px-8 py-8 bg-[#f8f9fa] gap-4">
      <div className="flex flex-col md:flex-row min-h-[70vh] gap-4">
        {/* First Column - Explore Research CTA (stays fixed, doesn't slide) */}
        <Link
          href="/shop"
          className="w-full md:w-[180px] lg:w-[210px] md:shrink-0 bg-navy-deep flex flex-col justify-start p-6 md:p-8 relative cursor-pointer rounded-lg shadow-sm"
        >
          <h2 className="text-white font-syncopate text-lg md:text-xl font-medium tracking-wide mb-6 uppercase">
            Explore
            <br />
            Research
          </h2>
          <div className="w-8 h-[2px] bg-[#8b3a3a]"></div>

          <div className="mt-auto flex items-center text-xs font-bold font-inter text-white uppercase tracking-widest pt-12">
            SHOP ALL
            <br />
            COLLECTIONS <span className="ml-2 font-normal text-lg">→</span>
          </div>
        </Link>

        {/* Sliding track viewport */}
        <div className="w-full md:flex-1 overflow-hidden">
          <div
            ref={trackRef}
            className="flex h-full"
            style={{ width: `${pageCount * 100}%` }}
          >
            {pages.map((pageCategories, pageIndex) => (
              <div
                key={pageIndex}
                className="flex flex-col md:flex-row gap-4 h-64 md:h-auto"
                style={{ width: `${100 / pageCount}%` }}
              >
                {pageCategories.map((category, i) => (
                  <CategoryCard key={category.id} category={category} index={pageIndex * PAGE_SIZE + i} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slider controls — only needed when there's more than one page of categories */}
      {pageCount > 1 && (
        <div className="flex flex-col items-center gap-3 pt-2">
          <div className="flex items-center gap-2 text-navy-deep/50 text-[11px] font-inter font-semibold uppercase tracking-[0.15em]">
            <Hand size={14} className="animate-[wiggle_1.6s_ease-in-out_infinite]" strokeWidth={2} />
            Slide to discover more categories
          </div>
          <div className="flex items-center justify-center gap-4">
          <button
            onClick={goPrev}
            aria-label="Previous categories"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-navy-deep/15 bg-white hover:bg-navy-deep hover:text-white text-navy-deep transition-colors shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-label={`Go to category page ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === page ? 'w-6 bg-navy-deep' : 'w-1.5 bg-navy-deep/25 hover:bg-navy-deep/40'}`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            aria-label="Next categories"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-navy-deep/15 bg-white hover:bg-navy-deep hover:text-white text-navy-deep transition-colors shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          </div>
        </div>
      )}
    </section>
  )
}
