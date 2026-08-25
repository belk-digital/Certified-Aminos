'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

export function AboutHero() {
  const t = useTranslations('content.aboutHero')
  return (
    <div className="w-full bg-[#FAFAFA] font-sans">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 pt-32 sm:pt-36 md:pt-44 pb-8 mx-auto max-w-[1920px]">
        
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-ink uppercase tracking-tighter leading-[0.9] mb-2 sm:mb-4">
              ABOUT US
            </h1>
            <p className="text-ink/50 text-sm md:text-base tracking-wide font-medium max-w-xl">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>

        {/* Banner Row */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full h-[350px] sm:h-[450px] md:h-[550px] rounded-[2rem] md:rounded-[3rem] overflow-hidden mb-4 sm:mb-6 shadow-2xl group cursor-pointer bg-zinc-900"
        >
          {/* TODO: replace with generated abstract particle/molecule hero art — standing in with existing wave art for now */}
          <Image
            src="/hero-waves.png"
            alt="Abstract research visual for Certified Aminos"
            fill
            className="object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105"
            priority
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Bottom Info Pill */}
          <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 z-20 pointer-events-none max-w-[80%] sm:max-w-md">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6 shadow-2xl transition-transform duration-500 group-hover:-translate-y-2">
              <span className="bg-white/20 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block shadow-sm">
                OUR STORY
              </span>
              <h2 className="text-white text-lg sm:text-xl font-bold tracking-tight mb-1 leading-tight">
                {t('titleLine1')} {t('titleLine2')}
              </h2>
            </div>
          </div>

          {/* Floating Icon */}
          <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 z-20 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white transition-transform duration-500 group-hover:scale-110 group-hover:bg-white group-hover:text-ink">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Credential Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="flex items-center justify-between gap-4 border-y border-black/10 py-4 mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-4">
            <span className="font-heading text-primary text-sm sm:text-base font-black">{t('credentialIndex')}</span>
            <span className="text-ink text-sm sm:text-base font-semibold tracking-tight">{t('credentialTitle')}</span>
          </div>
          <span className="text-ink/40 text-[10px] sm:text-xs font-bold uppercase tracking-widest whitespace-nowrap">
            {t('credentialDate')}
          </span>
        </motion.div>

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
                2018
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-ink/50 uppercase tracking-widest mt-1">
                {t('statFoundedLabel')}
              </span>
            </div>
            <button className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center mb-1 hover:bg-primary transition-colors">
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white rounded-[1.5rem] p-6 sm:p-8 flex justify-between relative hover:shadow-lg transition-all duration-300 cursor-default border border-black/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
          >
            <div className="flex flex-col justify-end h-full">
              <span className="text-4xl sm:text-5xl font-black text-ink font-heading tracking-tighter">
                {t('statCatalogValue')}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-ink/50 uppercase tracking-widest mt-1">
                {t('statCatalogLabel')}
              </span>
            </div>
            <span className="absolute top-6 right-6 border border-ink/10 text-ink/60 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-ink/5">
              {t('statCatalogBadge')}
            </span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-ink rounded-[1.5rem] p-6 sm:p-8 flex items-end relative hover:bg-black transition-all duration-300 cursor-default shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
          >
            <div className="flex flex-col">
              <span className="text-4xl sm:text-5xl font-black text-white font-heading tracking-tighter">
                {t('statTestedValue')}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-white/50 uppercase tracking-widest mt-1">
                {t('statTestedLabel')}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
