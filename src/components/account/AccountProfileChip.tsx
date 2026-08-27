import React from 'react'
import { Coins } from 'lucide-react'

export function AccountProfileChip({ userName, caPoints }: { userName: string; caPoints: number }) {
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <div className="inline-flex items-center gap-2 sm:gap-3 bg-navy-deep rounded-2xl pl-2 pr-3 sm:pr-5 py-1.5 sm:py-2 border border-white/10 shadow-sm max-w-full">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center shrink-0 text-navy-deep font-heading font-bold text-base sm:text-lg">
        {userInitial}
      </div>
      <div className="hidden sm:flex flex-col min-w-0">
        <span className="text-white font-heading font-bold text-sm uppercase tracking-wide leading-none truncate max-w-[140px]">{userName}</span>
        <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest font-heading mt-1">Member</span>
      </div>

      <div className="hidden sm:block w-px h-8 bg-white/10 mx-1" />

      <div className="flex items-center gap-1.5 sm:gap-2">
        <Coins size={16} className="text-white/60 shrink-0" />
        <div className="flex flex-col">
          <span className="text-white font-heading font-bold text-xs sm:text-sm leading-none">{Number(caPoints).toFixed(2)}</span>
          <span className="text-white/40 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest font-heading mt-1 whitespace-nowrap">CA Points</span>
        </div>
      </div>
    </div>
  )
}
