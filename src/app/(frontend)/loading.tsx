import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function HomepageLoading() {
  return (
      <div className="flex flex-col w-full min-h-screen relative z-10 bg-[#FAFAFA] overflow-x-clip">
        
        {/* Hero Section Skeleton Mimic */}
        <section className="bg-[#FAFAFA] w-full px-4 sm:px-6 md:px-12 pb-6 md:pb-12 pt-[140px] font-sans min-h-screen flex flex-col">
          <div className="relative w-full flex-1 min-h-[400px] md:min-h-[450px] rounded-[32px] overflow-visible bg-zinc-200 animate-pulse">

            {/* Text Content Skeleton */}
            <div className="absolute top-8 sm:top-12 md:top-1/4 left-6 sm:left-8 md:left-16 flex flex-col items-start z-10">
              <Skeleton className="w-[280px] md:w-[400px] h-10 md:h-16 mb-4 bg-white/40 rounded-lg" />
              <Skeleton className="w-[200px] md:w-[300px] h-10 md:h-16 mb-6 bg-white/40 rounded-lg" />
              <Skeleton className="w-[250px] md:w-[350px] h-4 md:h-5 bg-white/40 rounded-full" />
            </div>

            {/* Floating Action Bar Skeleton */}
            <div className="absolute -bottom-24 md:-bottom-10 left-1/2 -translate-x-1/2 w-[95%] md:w-[90%] lg:w-[80%] max-w-5xl bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.05)] p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0 z-20 border border-gray-100">
              <div className="flex-1 flex justify-start md:justify-center w-full md:w-auto">
                <Skeleton className="w-full md:w-32 h-[48px] bg-gray-100 rounded-xl" />
              </div>
              <div className="hidden md:block w-px h-10 bg-gray-100 shrink-0 mx-2 lg:mx-4" />
              <div className="flex-[1.5] flex justify-center w-full md:w-auto px-1 md:px-0">
                <Skeleton className="w-full h-[48px] bg-gray-100 rounded-[16px]" />
              </div>
              <div className="hidden md:block w-px h-10 bg-gray-100 shrink-0 mx-2 lg:mx-4" />
              <div className="flex-1 flex justify-end md:justify-center w-full md:w-auto">
                <Skeleton className="w-full md:w-48 h-[48px] bg-gray-100 rounded-[16px]" />
              </div>
            </div>

          </div>

          {/* Stats Cards */}
          <div className="mt-32 md:mt-20 shrink-0 w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
             <Skeleton className="h-36 w-full bg-white rounded-3xl animate-pulse" />
             <Skeleton className="h-36 w-full bg-zinc-200 rounded-3xl animate-pulse" />
             <Skeleton className="h-36 w-full bg-[#121212]/10 rounded-3xl animate-pulse" />
          </div>
        </section>
      </div>
  )
}
