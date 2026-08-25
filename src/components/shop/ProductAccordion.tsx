'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { Tab } from './ProductTabs'

export function ProductAccordion({ tabs }: { tabs: Tab[] }) {
  const [openTab, setOpenTab] = useState<string | null>(tabs.length > 0 ? tabs[0].id : null)

  const toggleTab = (id: string) => {
    setOpenTab(openTab === id ? null : id)
  }

  if (!tabs || tabs.length === 0) return null

  return (
    <div className="w-full flex flex-col border-t border-black/[0.08]">
      {tabs.map((tab, idx) => {
        const isOpen = openTab === tab.id

        return (
          <div key={tab.id} className="w-full border-b border-black/[0.08]">
            <button
              onClick={() => toggleTab(tab.id)}
              className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
            >
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-black/20 tabular-nums tracking-widest w-5 shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className={`text-[15px] md:text-[16px] font-semibold tracking-tight transition-colors duration-200 ${isOpen ? 'text-black' : 'text-black/45 group-hover:text-black'}`}>
                  {tab.label}
                </span>
              </div>
              <div className="ml-4 shrink-0 w-7 h-7 rounded-full border border-black/[0.08] flex items-center justify-center group-hover:border-black/20 transition-colors">
                <AnimatePresence initial={false} mode="wait">
                  {isOpen ? (
                    <motion.div key="minus" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                      <Minus className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />
                    </motion.div>
                  ) : (
                    <motion.div key="plus" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                      <Plus className="w-3.5 h-3.5 text-black/30 group-hover:text-black transition-colors" strokeWidth={2.5} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.25, 0, 0.1, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pl-9 pb-8 text-black/50 leading-[1.75] text-[14px] lg:text-[15px] prose prose-sm max-w-none prose-headings:text-black prose-headings:font-bold prose-a:text-black prose-strong:text-black/80">
                    {typeof tab.content === 'string' ? (
                      <div dangerouslySetInnerHTML={{ __html: tab.content as string }} />
                    ) : (
                      tab.content
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
