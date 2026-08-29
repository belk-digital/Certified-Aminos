'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

export function BlogHero() {
  const t = useTranslations('blog.hero')
  
  return (
    <div className="w-full bg-[#FAFAFA] font-sans">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 pt-[160px] sm:pt-[180px] md:pt-[220px] pb-8 mx-auto max-w-[1920px]">
        
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-ink uppercase tracking-tighter leading-[0.9] mb-2 sm:mb-4">
              {t('title') || 'RESEARCH BLOG'}
            </h1>
            <p className="text-ink/50 text-sm md:text-base tracking-wide font-medium max-w-xl">
              {t('description') || 'LATEST RESEARCH, INSIGHTS, AND PROTOCOLS IN PEPTIDE SCIENCE'}
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
            src="/HelixBio Images/hero_blog_research.jpg"
            alt="Certified Aminos Research Blog"
            fill
            className="object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105"
            priority
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
          
          {/* Bottom Info Pill */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-10 sm:left-10 sm:right-28 z-20 pointer-events-none">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6 shadow-2xl transition-transform duration-500 group-hover:-translate-y-2">
              <span className="bg-white/20 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2 sm:mb-3 inline-block shadow-sm">
                KNOWLEDGE BASE
              </span>
              <p className="text-white text-xs sm:text-base md:text-lg font-medium tracking-wide mb-1 leading-relaxed line-clamp-3 sm:line-clamp-none">
                Stay updated with our latest scientific articles, comprehensive guides, and expert perspectives on synthetic research peptides. Our database provides valuable information regarding reconstitution, storage protocols, and advanced analytical testing methods.
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
            className="bg-white rounded-[1.5rem] p-6 sm:p-8 flex items-end justify-between hover:shadow-lg transition-all duration-300 cursor-default border border-black/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
          >
            <div className="flex flex-col">
              <span className="text-4xl sm:text-5xl font-black text-ink font-heading tracking-tighter">
                100+
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-ink/50 uppercase tracking-widest mt-1">
                RESEARCH ARTICLES
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
                EXPERT
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-ink/50 uppercase tracking-widest mt-1">
                WRITTEN BY SCIENTISTS
              </span>
            </div>
            <span className="absolute top-6 right-6 border border-ink/10 text-ink/60 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-ink/5">
              VERIFIED
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
                WEEKLY
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-white/50 uppercase tracking-widest mt-1">
                NEW PROTOCOLS
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
