import React from 'react'

export default function ProductLoading() {
  return (
    <div className="bg-[#fafafa] min-h-screen font-sans animate-in fade-in duration-500 overflow-x-clip">
      
      <div className="w-full px-4 sm:px-6 md:px-12 pt-[120px] lg:pt-[140px] pb-6 md:pb-12 max-w-[1600px] mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 lg:gap-12">
          
          {/* Left Column - Gallery Skeleton */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-32 h-fit animate-pulse">
            <div className="w-full aspect-[4/5] bg-gray-200 rounded-[32px]" />
            <div className="hidden lg:grid grid-cols-2 gap-4">
              <div className="h-32 bg-gray-100 rounded-3xl" />
              <div className="h-32 bg-gray-100 rounded-3xl" />
            </div>
          </div>

          {/* Right Column - Product Info Skeleton */}
          <div className="flex flex-col pt-2 lg:pt-0 pb-12 lg:pb-32 animate-pulse">
            
            {/* Title & Badge */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-6 w-24 bg-gray-200 rounded-full" />
            </div>
            <div className="h-10 md:h-14 w-3/4 bg-gray-200 rounded-xl mb-4" />
            
            {/* Price */}
            <div className="h-8 md:h-10 w-32 bg-gray-200 rounded-lg mb-8" />
            
            {/* Description */}
            <div className="flex flex-col gap-2 mb-10">
              <div className="h-4 w-full bg-gray-100 rounded-md" />
              <div className="h-4 w-full bg-gray-100 rounded-md" />
              <div className="h-4 w-3/4 bg-gray-100 rounded-md" />
            </div>

            {/* Variant Selector */}
            <div className="mb-10">
              <div className="h-4 w-20 bg-gray-100 rounded-md mb-4" />
              <div className="flex flex-wrap gap-3">
                <div className="h-12 w-24 bg-gray-200 rounded-full" />
                <div className="h-12 w-24 bg-gray-100 rounded-full" />
                <div className="h-12 w-24 bg-gray-100 rounded-full" />
              </div>
            </div>

            {/* Actions (Quantity + Add to Cart) */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-24 md:w-32 h-16 bg-gray-100 rounded-full shrink-0" />
              <div className="flex-1 h-16 bg-gray-200 rounded-full" />
            </div>

            {/* Extras */}
            <div className="flex flex-col gap-4 py-8 border-y border-gray-200">
               <div className="h-4 w-48 bg-gray-100 rounded-md" />
               <div className="h-4 w-56 bg-gray-100 rounded-md" />
               <div className="h-4 w-40 bg-gray-100 rounded-md" />
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
