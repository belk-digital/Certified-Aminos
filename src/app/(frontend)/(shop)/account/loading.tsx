import React from 'react'

export default function AccountLoading() {
  return (
    <div className="flex flex-col gap-12 lg:gap-20 w-full animate-in fade-in duration-500 font-sans">
      
      {/* 1. Profile Hero Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-gray-200 pb-12 animate-pulse">
        <div className="flex flex-col gap-3">
          <div className="h-3 w-32 bg-gray-100 rounded-md" />
          <div className="h-16 w-64 md:w-96 bg-gray-100 rounded-2xl" />
          <div className="h-4 w-72 bg-gray-100 rounded-md mt-2" />
        </div>
        
        <div className="flex flex-col items-start md:items-end gap-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-20 bg-gray-100 rounded-md" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <div className="h-12 w-32 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      </div>

      {/* 2. Vital Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex flex-col border-l-2 border-gray-100 pl-4 gap-3">
            <div className="h-3 w-24 bg-gray-100 rounded-md" />
            <div className="h-10 w-16 bg-gray-100 rounded-xl" />
          </div>
        ))}
      </div>

      {/* 3. Main Data Canvas Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Ledger: Recent Orders (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6 animate-pulse">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="h-4 w-32 bg-gray-100 rounded-md" />
            <div className="h-3 w-16 bg-gray-100 rounded-md" />
          </div>
          
          <div className="flex flex-col divide-y divide-gray-100">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between py-6">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col gap-2 w-24">
                    <div className="h-3 w-20 bg-gray-100 rounded-sm" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="h-5 w-24 bg-gray-100 rounded-md" />
                    <div className="h-3 w-20 bg-gray-100 rounded-sm" />
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="h-6 w-20 bg-gray-100 rounded-md" />
                  <div className="w-4 h-4 bg-gray-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics & Profile (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-12 animate-pulse">
          
          {/* Spending Ring Skeleton */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="h-4 w-36 bg-gray-100 rounded-md" />
              <div className="h-3 w-12 bg-gray-100 rounded-md" />
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-8 py-4">
              <div className="relative w-48 h-48 shrink-0 rounded-full border-[12px] border-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                   <div className="h-3 w-16 bg-gray-100 rounded-md" />
                   <div className="h-6 w-24 bg-gray-100 rounded-md" />
                </div>
              </div>

              <div className="flex flex-col gap-4 w-full">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-100" />
                      <div className="h-3 w-24 bg-gray-100 rounded-sm" />
                    </div>
                    <div className="h-3 w-8 bg-gray-100 rounded-sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Default Address Skeleton */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="h-4 w-32 bg-gray-100 rounded-md" />
              <div className="h-3 w-12 bg-gray-100 rounded-md" />
            </div>
            
            <div className="py-4 flex flex-col gap-3">
               <div className="h-4 w-32 bg-gray-100 rounded-md mb-2" />
               <div className="h-3 w-48 bg-gray-100 rounded-md" />
               <div className="h-3 w-56 bg-gray-100 rounded-md" />
               <div className="h-3 w-24 bg-gray-100 rounded-md" />
            </div>
          </div>
          
        </div>
      </div>
      
    </div>
  )
}
