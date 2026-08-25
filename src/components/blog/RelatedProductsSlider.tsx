'use client'

import React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ProductCard } from '@/components/shared/ProductCard'

export function RelatedProductsSlider({ products }: { products: any[] }) {
  const [emblaRef] = useEmblaCarousel(
    { align: 'start', loop: true, containScroll: 'trimSnaps' },
    [Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })],
  )

  if (!products || products.length === 0) return null

  return (
    <div>
      <span className="text-label-md uppercase tracking-wider text-gold-dark mb-4 block">
        Featured In This Article
      </span>

      {products.length === 1 ? (
        <div className="max-w-[280px] sm:max-w-xs">
          <ProductCard product={products[0]} />
        </div>
      ) : (
        <div className="overflow-hidden -m-3 p-3" ref={emblaRef}>
          <div className="flex gap-4 sm:gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-[0_0_100%] sm:flex-[0_0_47%] md:flex-[0_0_calc(33.333%-1rem)] min-w-0"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
