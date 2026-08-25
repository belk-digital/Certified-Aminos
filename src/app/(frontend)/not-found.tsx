'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import { Search, ArrowRight, Home, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { SearchOverlay } from '@/components/shared/SearchOverlay'
import { useReducedMotion } from '@/components/motion/useReducedMotion'

// Floating particles component for luxury biotech feel
function MolecularBackground() {
  const reduced = useReducedMotion()
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || reduced) return null

  // Generate 12 elegant floating particles
  const particles = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    size: Math.random() * 100 + 40,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 25,
    delay: Math.random() * 5,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full border border-primary/20 bg-primary/5 blur-[1px]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: ['0%', '-30%', '0%'],
            x: ['0%', '10%', '0%'],
            rotate: [0, 90, 180],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}

export default function NotFound() {
  const [searchOpen, setSearchOpen] = useState(false)
  const t = useTranslations('notFound')

  return (
    <main className="relative min-h-[100dvh] bg-[#FAFAFA] flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden pt-[140px] pb-12 px-4 sm:px-6">
      <style dangerouslySetInnerHTML={{ __html: `
        #global-footer { display: none !important; }
      `}} />
      <MolecularBackground />

      {/* Massive 404 Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <h1 className="text-[35vw] font-black text-black/[0.02] select-none tracking-tighter leading-none">
          404
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-2xl mx-auto my-auto"
      >
        {/* Glassmorphism Card */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] rounded-[32px] sm:rounded-[48px] p-8 sm:p-12 lg:p-16 flex flex-col items-center text-center">
          
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/5 text-primary rounded-full flex items-center justify-center mb-8 shadow-inner">
            <Search size={32} strokeWidth={1.5} className="sm:hidden" />
            <Search size={40} strokeWidth={1.5} className="hidden sm:block" />
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light text-black tracking-tight mb-4">
            Formula <span className="font-semibold">Not Found</span>
          </h2>
          
          <p className="text-sm sm:text-base text-black/50 max-w-md mx-auto mb-10 leading-relaxed">
            The specific compound or sequence you are looking for does not exist in our current registry. It may have been archived or moved.
          </p>

          {/* Integrated Search Bar Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full max-w-md mx-auto group relative flex items-center bg-black/5 hover:bg-black/10 transition-colors rounded-full h-14 sm:h-16 px-6 mb-10 text-left"
          >
            <Search size={20} className="text-black/40 mr-4" />
            <span className="text-black/50 text-sm sm:text-base flex-1">Search the registry...</span>
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-black group-hover:scale-110 transition-transform">
              <ArrowRight size={16} />
            </div>
          </button>

          {/* Quick Links */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full justify-center">
            <Link href="/" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-black text-white hover:bg-black/80 transition-colors text-[10px] font-bold uppercase tracking-[0.2em] w-full sm:w-auto">
              <Home size={14} />
              Return Home
            </Link>
            <Link href="/shop" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-transparent border border-black/10 hover:border-black text-black transition-colors text-[10px] font-bold uppercase tracking-[0.2em] w-full sm:w-auto">
              Browse Products
              <ChevronRight size={14} />
            </Link>
          </div>
          
        </div>
      </motion.div>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </main>
  )
}
