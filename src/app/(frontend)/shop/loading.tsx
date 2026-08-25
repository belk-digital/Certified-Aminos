import React from 'react'
import { Container } from '@/components/ui/container'
import { Skeleton, ProductCardSkeleton } from '@/components/ui/skeleton'

export default function ShopLoading() {
  return (
    <div className="w-full bg-[#fafafa] min-h-screen flex flex-col font-sans">
      
      {/* Header Area Skeleton */}
      <section className="w-full bg-[#fafafa] pt-32 pb-8 sm:pt-40 sm:pb-12 px-4 sm:px-6 md:px-8">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-4 w-full animate-pulse">
            <div className="h-12 md:h-16 w-64 bg-gray-200 rounded-lg" />
            <div className="h-4 w-full max-w-xl bg-gray-100 rounded-md mt-2" />
            <div className="h-4 w-3/4 max-w-md bg-gray-100 rounded-md" />
          </div>
          
          <div className="hidden md:flex items-center gap-6 animate-pulse">
             {[1, 2, 3].map(i => (
               <div key={i} className="flex items-center gap-2">
                 <div className="w-5 h-5 rounded-full bg-gray-200" />
                 <div className="h-3 w-20 bg-gray-100 rounded-sm" />
               </div>
             ))}
          </div>
        </div>
      </section>

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pb-12">
        {/* Top Toolbar Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-3 rounded-[24px] shadow-sm border border-black/5 animate-pulse">
          
          {/* Filter Toggle & Categories */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="h-10 w-28 bg-gray-200 rounded-full" />
            <div className="h-6 w-px bg-gray-100 mx-2 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2 overflow-hidden">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className="h-10 w-24 bg-gray-100 rounded-full" />
               ))}
            </div>
          </div>

          {/* Sort & Search */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="h-10 w-full sm:w-48 md:w-64 bg-gray-100 rounded-full" />
            <div className="h-10 w-[140px] shrink-0 bg-gray-100 rounded-full" />
          </div>
        </div>

        {/* Results Area Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="flex h-full w-full">
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
