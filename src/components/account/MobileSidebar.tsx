'use client'

import React, { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

export function MobileSidebar({ children }: { children: React.ReactNode }) {
  const t = useTranslations('account.sidebar')
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-black transition-colors"
          >
            <Menu size={24} />
          </button>
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#1e5661] font-heading">
            {t('dashboard')}
          </span>
        </div>
      </div>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
            />
            
            {/* Sliding Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] max-w-[85vw] bg-white z-50 shadow-2xl lg:hidden flex flex-col"
            >
              {/* Close Button */}
              <div className="absolute top-4 right-4 z-50">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-black transition-colors shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden">
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
