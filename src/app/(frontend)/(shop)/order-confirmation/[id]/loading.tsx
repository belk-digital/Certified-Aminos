import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Container } from '@/components/ui/container'

export default function OrderConfirmationLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-32 lg:pt-40 pb-32">
      <Container size="page" className="px-4 sm:px-6 lg:px-8 max-w-[1200px]">
        <div className="flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-16 xl:gap-24">
          
          {/* LEFT COLUMN SKELETON */}
          <div className="w-full lg:w-[55%] flex flex-col gap-10">
            <div className="flex flex-col items-center lg:items-start">
              {/* Checkmark Box */}
              <Skeleton className="w-16 h-16 md:w-20 md:h-20 rounded-[16px] mb-8" />
              {/* Titles */}
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-10 md:h-12 w-3/4 max-w-sm mb-6" />
              <Skeleton className="h-4 w-full max-w-md mb-2" />
              <Skeleton className="h-4 w-5/6 max-w-sm" />
            </div>

            {/* Action Banner Skeleton */}
            <Skeleton className="w-full h-48 rounded-[12px]" />

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              <Skeleton className="h-40 rounded-[12px]" />
              <Skeleton className="h-40 rounded-[12px]" />
            </div>
          </div>

          {/* RIGHT COLUMN SKELETON */}
          <div className="hidden lg:block w-full lg:w-[45%] xl:w-[40%]">
            <Skeleton className="w-full h-[500px] rounded-[12px]" />
          </div>

        </div>
      </Container>
    </div>
  )
}
