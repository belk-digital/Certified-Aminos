'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

export function FaqAccordion({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  if (!faqs || faqs.length === 0) return null

  return (
    <div className="w-full flex flex-col border-t border-ink/10">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx
        return (
          <div key={idx} className="w-full border-b border-ink/10">
            <button
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full py-5 flex items-center justify-between text-left focus:outline-none group"
            >
              <span
                className={`text-body-md sm:text-body-lg font-semibold tracking-tight transition-colors duration-200 pr-4 ${
                  isOpen ? 'text-ink' : 'text-ink-muted group-hover:text-ink'
                }`}
              >
                {faq.question}
              </span>
              <div className="ml-4 shrink-0 w-7 h-7 rounded-full border border-ink/10 flex items-center justify-center group-hover:border-ink/20 transition-colors">
                <AnimatePresence initial={false} mode="wait">
                  {isOpen ? (
                    <motion.div key="minus" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                      <Minus className="w-3.5 h-3.5 text-ink" strokeWidth={2.5} />
                    </motion.div>
                  ) : (
                    <motion.div key="plus" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                      <Plus className="w-3.5 h-3.5 text-ink-muted group-hover:text-ink transition-colors" strokeWidth={2.5} />
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
                  <p className="pb-6 text-ink-muted leading-relaxed text-sm sm:text-base pr-10">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
