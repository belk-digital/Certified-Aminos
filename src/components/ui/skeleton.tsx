import React from 'react'
import { cn } from '@/lib/utils'

// Base Skeleton Component using the custom CSS class from globals.css
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('skeleton rounded-sm animate-pulse bg-ink/5', className)}
      {...props}
    />
  )
}

// 1. ProductCard Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="w-full h-full bg-[#2a2a2a] rounded-[24px] sm:rounded-[32px] p-2 sm:p-3 relative flex flex-col border border-white/10 min-h-[400px]">
       
       {/* Image Container Skeleton */}
       <div className="relative w-full aspect-[4/5] sm:aspect-square rounded-[16px] sm:rounded-[24px] overflow-hidden bg-white/5 shrink-0 animate-pulse">
         
         {/* Wishlist Button Skeleton */}
         <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-30">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10" />
         </div>
       </div>

       {/* Text Content Skeleton */}
       <div className="pt-4 px-2 sm:px-3 pb-2 flex flex-col flex-1 gap-2">
          {/* Title */}
          <Skeleton className="h-5 sm:h-6 w-3/4 mb-1 rounded-md bg-white/10" />
          {/* Category */}
          <Skeleton className="h-3 sm:h-4 w-1/3 rounded-sm bg-white/5 mb-1" />
          {/* Description */}
          <Skeleton className="h-2.5 sm:h-3 w-full rounded-sm bg-white/5" />
          <Skeleton className="h-2.5 sm:h-3 w-5/6 rounded-sm bg-white/5" />

          {/* Bottom Row */}
          <div className="mt-auto pt-4 flex items-center justify-between">
             {/* Price Skeleton */}
             <Skeleton className="h-6 sm:h-8 w-20 rounded-md bg-white/10" />
             
             {/* Action Button Skeleton */}
             <Skeleton className="w-10 h-10 sm:w-14 sm:h-14 bg-white/20 rounded-xl sm:rounded-2xl" />
          </div>
       </div>
    </div>
  )
}

// 2. BlogPostCard Skeleton
export function BlogPostCardSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full group">
      {/* Image placeholder */}
      <Skeleton className="w-full aspect-[16/10] rounded-sm" />
      {/* Content placeholders */}
      <div className="space-y-4">
        {/* Meta row */}
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-5/6" />
        </div>
        {/* Excerpt */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  )
}

// 3. Order Row Skeleton
export function OrderRowSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 border-b border-border-subtle gap-4">
      <div className="space-y-2">
        {/* Order ID */}
        <Skeleton className="h-5 w-24" />
        {/* Date */}
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
        {/* Amount */}
        <Skeleton className="h-5 w-20" />
        {/* Status Badge */}
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
    </div>
  )
}

// 4. Stat Card Skeleton
export function StatCardSkeleton() {
  return (
    <div className="bg-white border border-border-subtle rounded-md p-6 flex flex-col items-center text-center">
      {/* Large number placeholder */}
      <Skeleton className="h-10 w-24 mb-3" />
      {/* Label placeholder */}
      <Skeleton className="h-4 w-32" />
    </div>
  )
}

// 5. COA Table Row Skeleton
export function COARowSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-4 py-5 border-b border-border-subtle">
      {/* Product Name */}
      <div className="md:col-span-1">
        <Skeleton className="h-5 w-3/4" />
      </div>
      {/* Purity */}
      <div className="md:col-span-1 hidden md:block">
        <Skeleton className="h-4 w-12" />
      </div>
      {/* Batch */}
      <div className="md:col-span-1 hidden md:block">
        <Skeleton className="h-4 w-20" />
      </div>
      {/* Analyzed */}
      <div className="md:col-span-1 hidden md:block">
        <Skeleton className="h-4 w-24" />
      </div>
      {/* Download Action */}
      <div className="md:col-span-1 flex justify-end">
        <Skeleton className="h-8 w-24 rounded-sm" />
      </div>
    </div>
  )
}

// 6. Checkout Page Skeleton — mirrors CheckoutClient's real two-column layout
export function CheckoutPageSkeleton() {
  return (
    <div className="pt-32 pb-16 md:pt-36 md:pb-24 bg-[#fafafa] min-h-screen font-sans">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8">
        
        {/* Massive Header mirroring Cart */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-gray-200 pb-12 animate-pulse">
          <div className="flex flex-col gap-4">
            <div className="h-14 md:h-20 w-64 md:w-96 bg-gray-200 rounded-xl" />
            <div className="h-4 md:h-5 w-full max-w-sm bg-gray-100 rounded-md mt-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-12 lg:gap-20 animate-pulse">
          
          {/* Left Column: Form sections */}
          <div className="flex flex-col gap-10">
            {[
              { titleWidth: 'w-48', fields: 1 },
              { titleWidth: 'w-40', fields: 3 },
              { titleWidth: 'w-44', fields: 2 },
            ].map((section, i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className={`h-6 ${section.titleWidth} bg-gray-200 rounded-md mb-2`} />
                {Array.from({ length: section.fields }).map((_, j) => (
                  <div key={j} className="h-14 w-full bg-gray-50 border border-gray-100 rounded-[16px]" />
                ))}
              </div>
            ))}
            <div className="h-16 w-full bg-black/5 rounded-[24px] mt-2" />
          </div>

          {/* Right Column: Order summary card */}
          <div className="bg-[#F5F5F7]/40 rounded-3xl p-6 md:p-8 border border-slate-100 h-fit flex flex-col gap-6">
            <div className="h-6 w-36 bg-gray-200 rounded-md" />
            
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-cream border border-black/5 rounded-xl shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded-sm" />
                  <div className="h-3 w-1/3 bg-gray-100 rounded-sm" />
                </div>
                <div className="h-4 w-12 bg-gray-200 rounded-sm" />
              </div>
            ))}

            <div className="w-full h-px bg-gray-100 my-2" />

            <div className="flex flex-col gap-4">
               <div className="flex justify-between">
                 <div className="h-4 w-20 bg-gray-100 rounded-md" />
                 <div className="h-4 w-16 bg-gray-200 rounded-md" />
               </div>
               <div className="flex justify-between">
                 <div className="h-4 w-24 bg-gray-100 rounded-md" />
                 <div className="h-4 w-12 bg-gray-200 rounded-md" />
               </div>
            </div>

            <div className="w-full h-px bg-gray-100 my-2" />
            
            <div className="flex justify-between items-end">
               <div className="h-4 w-16 bg-gray-100 rounded-md" />
               <div className="h-8 w-24 bg-gray-300 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Skeleton }
