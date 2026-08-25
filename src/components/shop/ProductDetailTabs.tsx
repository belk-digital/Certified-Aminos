'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { Tab } from './ProductTabs'
import { cn } from '@/lib/utils'

interface ProductDetailTabsProps {
  tabs: Tab[]
}

export function ProductDetailTabs({ tabs }: ProductDetailTabsProps) {
  const [activeIds, setActiveIds] = useState<string[]>([tabs[0]?.id].filter(Boolean) as string[])

  if (!tabs || tabs.length === 0) return null

  const toggleTab = (id: string) => {
    setActiveIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto border-t border-ink/10">
      {tabs.map((tab) => {
        const isActive = activeIds.includes(tab.id)
        
        return (
          <div key={tab.id} className="border-b border-ink/10">
            <button
              onClick={() => toggleTab(tab.id)}
              className="w-full flex items-center justify-between py-8 lg:py-12 group focus:outline-none"
            >
              <h3 className={cn(
                "font-heading font-black text-2xl sm:text-4xl lg:text-5xl tracking-tighter uppercase text-left transition-colors duration-500",
                isActive ? "text-ink" : "text-ink/30 group-hover:text-ink/60"
              )}>
                {tab.label}
              </h3>
              
              <div className={cn(
                "w-10 h-10 lg:w-14 lg:h-14 rounded-full flex items-center justify-center shrink-0 transition-all duration-500",
                isActive 
                  ? "bg-primary text-white shadow-[0_0_20px_rgba(146,220,229,0.3)] scale-105" 
                  : "bg-ink/5 text-ink/30 group-hover:bg-ink/10 group-hover:text-ink/60"
              )}>
                {isActive ? <Minus size={24} strokeWidth={2.5} className="w-5 h-5 lg:w-6 lg:h-6" /> : <Plus size={24} strokeWidth={2.5} className="w-5 h-5 lg:w-6 lg:h-6" />}
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isActive && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pb-12 lg:pb-16 max-w-4xl pr-8 lg:pr-16">
                    {typeof tab.content === 'string' ? (
                      <div
                        className="text-ink/60 leading-[1.8] text-[15px] lg:text-[18px] prose prose-lg max-w-none prose-headings:text-ink prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase prose-a:text-ink prose-a:underline-offset-4 prose-strong:text-ink prose-li:text-ink/60"
                        dangerouslySetInnerHTML={{ __html: tab.content }}
                      />
                    ) : (
                      <div className="text-ink/60 leading-[1.8] text-[15px] lg:text-[18px]">
                        {tab.content}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
