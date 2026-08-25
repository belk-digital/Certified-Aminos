'use client'

import React from 'react'
import { Minus, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface QuantityStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
  theme?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'responsive'
}

export function QuantityStepper({ 
  value, 
  onChange, 
  min = 1, 
  max = 99,
  className,
  theme = 'light',
  size = 'md'
}: QuantityStepperProps) {
  const t = useTranslations('shop.quantityStepper')

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault()
    if (value > min) onChange(value - 1)
  }

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault()
    if (value < max) onChange(value + 1)
  }

  const isSm = size === 'sm'
  const isResponsive = size === 'responsive'

  return (
    <div className={cn(
      "inline-flex items-center justify-between border rounded-xl shadow-sm transition-all px-1", 
      theme === 'dark' ? "border-white/20 bg-white/5 hover:border-white/40" : "border-ink/10 bg-white hover:border-ink/20",
      isResponsive ? "h-8 md:h-10 w-[84px] md:w-[104px]" : isSm ? "h-8 w-[84px]" : "h-10 w-[104px]",
      className
    )}>
      <button 
        onClick={handleDecrement}
        disabled={value <= min}
        className={cn(
          "flex items-center justify-center rounded-full transition-colors disabled:opacity-30 flex-shrink-0",
          theme === 'dark' ? "text-white/60 hover:text-white hover:bg-white/10" : "text-ink/60 hover:text-ink hover:bg-ink/5",
          isResponsive ? "w-6 h-6 md:w-10 md:h-10" : isSm ? "w-6 h-6" : "w-10 h-10"
        )}
        aria-label={t('decreaseQuantity')}
      >
        <Minus className={cn(isResponsive ? "w-3 h-3 md:w-4 md:h-4" : isSm ? "w-3 h-3" : "w-4 h-4")} strokeWidth={2} />
      </button>
      
      <div className={cn(
        "flex-1 flex items-center justify-center font-bold select-none",
        theme === 'dark' ? "text-white" : "text-ink",
        isResponsive ? "text-xs md:text-base" : isSm ? "text-xs" : "text-base"
      )}>
        {value}
      </div>
      
      <button 
        onClick={handleIncrement}
        disabled={value >= max}
        className={cn(
          "flex items-center justify-center rounded-full transition-colors disabled:opacity-30 flex-shrink-0",
          theme === 'dark' ? "text-white/60 hover:text-white hover:bg-white/10" : "text-ink/60 hover:text-ink hover:bg-ink/5",
          isResponsive ? "w-6 h-6 md:w-10 md:h-10" : isSm ? "w-6 h-6" : "w-10 h-10"
        )}
        aria-label={t('increaseQuantity')}
      >
        <Plus className={cn(isResponsive ? "w-3 h-3 md:w-4 md:h-4" : isSm ? "w-3 h-3" : "w-4 h-4")} strokeWidth={2} />
      </button>
    </div>
  )
}
