'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export function ContactHero() {
  const t = useTranslations('content.contactHero')
  
  return (
    <div className="w-full bg-[#FAFAFA] font-sans">
      <div className="w-full h-[95vh] min-h-[750px] p-4 md:p-6 bg-[#FAFAFA] pt-[110px] md:pt-[130px] flex flex-col pb-0 mb-4 sm:mb-8">
        <div className="relative w-full h-full flex-grow rounded-3xl overflow-hidden bg-[#111] flex flex-col justify-between shadow-2xl">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-top bg-no-repeat opacity-90"
            style={{ backgroundImage: 'url("/certified-aminos-lab-image.webp")' }}
          />
          <div className="absolute inset-0 z-0 bg-black/40" />

          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 text-center max-w-4xl mx-auto"
          >
            <h1 className="hero-title font-heading text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-medium text-white tracking-tighter uppercase mb-6">
              {t('title')}
            </h1>
            <p className="text-white/80 text-sm md:text-base font-medium leading-relaxed max-w-xl mx-auto">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 pb-4 mx-auto max-w-[1920px]">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white rounded-[1.5rem] p-6 sm:p-8 flex items-end justify-between hover:shadow-lg transition-all duration-300 cursor-default border border-black/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
          >
            <div className="flex flex-col">
              <span className="text-4xl sm:text-5xl font-black text-ink font-heading tracking-tighter">
                &lt; 24H
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-ink/50 uppercase tracking-widest mt-1">
                RESPONSE TIME
              </span>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white rounded-[1.5rem] p-6 sm:p-8 flex justify-between relative hover:shadow-lg transition-all duration-300 cursor-default border border-black/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
          >
            <div className="flex flex-col justify-end h-full">
              <span className="text-4xl sm:text-5xl font-black text-ink font-heading tracking-tighter">
                100%
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-ink/50 uppercase tracking-widest mt-1">
                US-BASED SUPPORT
              </span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-ink rounded-[1.5rem] p-6 sm:p-8 flex items-end relative hover:bg-black transition-all duration-300 cursor-default shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
          >
            <div className="flex flex-col">
              <span className="text-4xl sm:text-5xl font-black text-white font-heading tracking-tighter">
                SECURE
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-white/50 uppercase tracking-widest mt-1">
                COMMUNICATIONS
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
