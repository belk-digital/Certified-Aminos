'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export function FaqHero() {
  const t = useTranslations('content.faqHero')
  
  return (
    <div className="w-full bg-navy-deep font-sans">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 pt-32 sm:pt-36 md:pt-44 pb-4 mx-auto max-w-[1920px]">
        
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-syncopate text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white uppercase tracking-tighter leading-[0.9] mb-2 sm:mb-4">
              {t('titleLine1')} <br className="hidden sm:block" /> {t('titleLine2')}
            </h1>
            <p className="text-gray-400 text-sm md:text-base tracking-wide font-medium max-w-xl">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>

        {/* Banner Row */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full h-[400px] sm:h-[450px] md:h-[550px] rounded-[2rem] md:rounded-[3rem] overflow-hidden mb-4 sm:mb-6 shadow-2xl group cursor-pointer bg-zinc-900"
        >
          <Image
            src="/HelixBio Images/package-box.webp"
            alt="FAQ HelixBio Support and Resources"
            fill
            className="object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105"
            priority
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
          
          {/* Bottom Info Pill */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-10 sm:left-10 sm:right-28 z-20 pointer-events-none">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6 shadow-2xl transition-transform duration-500 group-hover:-translate-y-2">
              <span className="bg-white/20 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2 sm:mb-3 inline-block shadow-sm">
                SUPPORT & RESOURCES
              </span>
              <p className="text-white text-xs sm:text-base md:text-lg font-medium tracking-wide mb-1 leading-relaxed line-clamp-3 sm:line-clamp-none">
                Comprehensive answers regarding research peptides, analytical standards, ordering processes, and laboratory handling. We prioritize clarity and scientific accuracy in every response.
              </p>
            </div>
          </div>
          
          {/* Floating Icon */}
          <div className="absolute bottom-10 right-10 z-20 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full items-center justify-center border border-white/30 text-white transition-transform duration-500 group-hover:scale-110 group-hover:bg-white group-hover:text-ink hidden sm:flex">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white/5 backdrop-blur-sm rounded-[1.5rem] p-6 sm:p-8 flex items-end justify-between hover:bg-white/10 transition-all duration-300 cursor-default border border-white/10 shadow-[0_4px_20px_rgb(0,0,0,0.1)]"
          >
            <div className="flex flex-col">
              <span className="text-4xl sm:text-5xl font-syncopate font-medium text-white tracking-tighter">
                24/7
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-blue-200/60 uppercase tracking-widest mt-2">
                EXPERT SUPPORT
              </span>
            </div>
            <Link href="/contact-us" className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center mb-1 hover:bg-blue-500 transition-colors cursor-pointer pointer-events-auto">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white/5 backdrop-blur-sm rounded-[1.5rem] p-6 sm:p-8 flex justify-between relative hover:bg-white/10 transition-all duration-300 cursor-default border border-white/10 shadow-[0_4px_20px_rgb(0,0,0,0.1)]"
          >
            <div className="flex flex-col justify-end h-full">
              <span className="text-4xl sm:text-5xl font-syncopate font-medium text-white tracking-tighter">
                99%
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-blue-200/60 uppercase tracking-widest mt-2">
                PURITY GUARANTEED
              </span>
            </div>
            <span className="absolute top-6 right-6 border border-blue-400/30 text-blue-300 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-900/40">
              TESTED
            </span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-blue-900/40 backdrop-blur-sm rounded-[1.5rem] p-6 sm:p-8 flex items-end relative border border-blue-400/20 hover:bg-blue-800/50 transition-all duration-300 cursor-default shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
          >
            <div className="flex flex-col">
              <span className="text-4xl sm:text-5xl font-syncopate font-medium text-white tracking-tighter">
                SAME DAY
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-blue-200/70 uppercase tracking-widest mt-2">
                SHIPPING DISPATCH
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
