'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from '@/i18n/navigation'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ProductCard } from '@/components/shared/ProductCard'

export function BestSellerSection({ products = [] }: { products?: any[] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const mobileProducts = products.slice(0, 4)

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: 'start', loop: true, containScroll: 'trimSnaps' },
    [Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true })],
  )

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const onSelect = useCallback((api: NonNullable<typeof emblaApi>) => {
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  useEffect(() => {
    if (!emblaApi) return
    onSelect(emblaApi)
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.from('.rc-header > *', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      })

      gsap.from('.rc-card', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.rc-cards-grid',
          start: 'top 85%',
        },
      })

      gsap.from('.rc-slider', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.rc-slider',
          start: 'top 85%',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="w-full bg-white min-h-screen py-16 px-2 md:px-8 flex flex-col justify-center font-inter overflow-hidden"
    >
      <div className="w-full">
        <div className="flex justify-between items-end mb-12 rc-header">
          <div>
            <span className="text-[10px] text-gray-500 tracking-[0.2em] font-bold uppercase block mb-3">
              THE COLLECTION
            </span>
            <h2 className="text-navy-deep font-syncopate text-2xl md:text-5xl font-medium tracking-wide leading-tight uppercase">
              Formulated Obsessively
              <br />
              Dosed Precisely.
            </h2>
          </div>

          <div className="flex items-center gap-3 mb-2">
            {/* Slider controls — desktop only */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                aria-label="Previous best sellers"
                className="h-9 w-9 rounded-full bg-white border border-navy-deep/15 flex items-center justify-center text-navy-deep hover:bg-navy-deep hover:text-white hover:border-navy-deep disabled:opacity-30 disabled:pointer-events-none shadow-sm transition-all duration-300"
              >
                <ArrowLeft size={15} />
              </button>
              <button
                onClick={scrollNext}
                disabled={!canScrollNext}
                aria-label="Next best sellers"
                className="h-9 w-9 rounded-full bg-white border border-navy-deep/15 flex items-center justify-center text-navy-deep hover:bg-navy-deep hover:text-white hover:border-navy-deep disabled:opacity-30 disabled:pointer-events-none shadow-sm transition-all duration-300"
              >
                <ArrowRight size={15} />
              </button>
            </div>

            <Link
              href="/shop"
              className="flex items-center gap-3 bg-[#0f172a] hover:bg-[#1e293b] text-white pl-5 pr-2 py-2 rounded-full transition-colors font-medium text-xs tracking-wider shadow-md"
            >
              VIEW ALL
              <div className="bg-primary rounded-full p-1.5 flex items-center justify-center">
                <ArrowRight size={14} className="text-navy-deep" />
              </div>
            </Link>
          </div>
        </div>

        {/* Mobile: static grid of the top 4 */}
        <div className="grid grid-cols-2 gap-3 rc-cards-grid mt-4 md:hidden">
          {mobileProducts.map((product, idx) => (
            <div key={product.slug || product.key || idx} className="rc-card h-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Desktop: animated, auto-playing slider showing every best seller */}
        <div className="hidden md:block mt-4 rc-slider">
          <div className="overflow-hidden -mx-3 px-3" ref={emblaRef}>
            <div className="flex gap-6">
              {products.map((product, idx) => (
                <div
                  key={product.slug || product.key || idx}
                  className="rc-slide min-w-0 flex-[0_0_31%] lg:flex-[0_0_23%]"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
