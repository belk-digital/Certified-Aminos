'use client'

import React, { useEffect, useRef } from 'react'
import { Link } from '@/i18n/navigation'
import { ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ProductCard } from '@/components/shared/ProductCard'

export function BestSellerSection({ products = [] }: { products?: any[] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const displayProducts = products.slice(0, 4)

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

          <Link
            href="/shop"
            className="flex items-center gap-3 bg-[#0f172a] hover:bg-[#1e293b] text-white pl-5 pr-2 py-2 rounded-full transition-colors font-medium text-xs tracking-wider mb-2 shadow-md"
          >
            VIEW ALL
            <div className="bg-primary rounded-full p-1.5 flex items-center justify-center">
              <ArrowRight size={14} className="text-navy-deep" />
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 rc-cards-grid mt-4">
          {displayProducts.map((product, idx) => (
            <div key={product.slug || product.key || idx} className="rc-card h-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
