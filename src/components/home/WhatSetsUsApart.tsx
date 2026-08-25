'use client'

import React from 'react'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'

const ADVANTAGES = [
  { key: 'purityStandards', image: '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_41_24 AM.webp' },
  { key: 'massSpecValidation', image: '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_44_49 AM.webp' },
  { key: 'comprehensiveDocs', image: '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_46_36 AM.webp' },
  { key: 'researchOnly', image: '/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_50_41 AM.webp' } 
]

export function WhatSetsUsApart() {
  const t = useTranslations('home.whatSetsUsApart')
  
  return (
    <section className="bg-zinc-950 py-20 md:py-32 lg:py-40 relative font-sans overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[100rem] h-full pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[40vw] h-[40vw] bg-cyan-900/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[10%] right-[5%] w-[30vw] h-[30vw] bg-blue-900/10 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      {/* SVG Mask Definition */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <clipPath id="stages-mask" clipPathUnits="objectBoundingBox">
            <rect x="0" y="0" width="0.75" height="0.55" rx="0.1375" ry="0.275" />
            <rect x="0.25" y="0.45" width="0.75" height="0.55" rx="0.1375" ry="0.275" />
          </clipPath>
        </defs>
      </svg>

      <div className="container mx-auto px-6 sm:px-12 md:px-16 max-w-[100rem] relative z-10">
        
        <div className="mb-20 lg:mb-32">
          <div className="inline-block border border-white/10 rounded-full px-4 py-1.5 mb-6 bg-white/5 backdrop-blur-sm">
            <span className="text-white/70 text-xs font-bold tracking-[0.2em] uppercase">The HelixBio Standard</span>
          </div>
          <h2 className="font-heading text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black text-white leading-[0.9] tracking-tighter uppercase break-words drop-shadow-2xl">
            {t('titleLine1')}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">{t('titleLine2')}</span>
          </h2>
        </div>

        <div className="flex flex-col">
          {ADVANTAGES.map((adv, index) => (
            <div key={adv.key} className="flex flex-col md:flex-row items-start md:items-center py-10 md:py-16 border-t border-white/10 gap-6 md:gap-8 lg:gap-16 group md:hover:bg-white/[0.02] transition-colors duration-500 -mx-6 px-6 sm:-mx-12 sm:px-12 md:-mx-16 md:px-16">
              
              {/* Top Row for Mobile (Number + Image) */}
              <div className="flex flex-row items-center gap-6 md:gap-0 w-full md:w-auto">
                {/* Number */}
                <div className="w-12 md:w-24 shrink-0 text-white/50 md:text-white/40 md:group-hover:text-cyan-400 font-heading text-xl sm:text-2xl md:text-3xl font-black tracking-widest transition-colors duration-500">
                  {`0${index + 1}`}
                </div>

                {/* Image Mask Container */}
                <div className="w-32 h-16 sm:w-48 sm:h-24 md:w-72 md:h-36 shrink-0 relative opacity-90 md:opacity-70 md:group-hover:opacity-100 transition-opacity duration-500">
                  <div 
                    className="absolute inset-0 w-full h-full shadow-[0_0_20px_rgba(0,0,0,0.5)] md:group-hover:shadow-[0_0_40px_rgba(14,165,233,0.2)] transition-shadow duration-700"
                    style={{ clipPath: 'url(#stages-mask)' }}
                  >
                    <Image 
                      src={adv.image} 
                      alt={t(`items.${adv.key}.title`)} 
                      fill 
                      className="object-cover transition-transform duration-1000 ease-out md:group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/40 md:bg-black/60 md:group-hover:bg-black/20 transition-colors duration-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="flex-1 min-w-[200px] w-full transform transition-transform duration-500 md:group-hover:translate-x-4">
                <h3 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white/90 md:text-white/80 md:group-hover:text-white transition-colors duration-500 leading-[1.1]">
                  {t(`items.${adv.key}.title`)}
                </h3>
              </div>

              {/* Description & Link */}
              <div className="w-full md:w-[35%] xl:w-1/3 shrink-0 flex flex-col items-start gap-4 sm:gap-5 transform transition-transform duration-500 md:group-hover:translate-x-2">
                <p className="text-white/80 md:text-white/60 md:group-hover:text-white/80 text-sm sm:text-base leading-relaxed font-medium transition-colors duration-500">
                  {t(`items.${adv.key}.description`)}
                </p>
                <Link
                  href="/about-us"
                  className="inline-flex items-center gap-3 text-white uppercase tracking-[0.2em] text-[10px] md:text-[11px] font-bold border border-white/20 bg-white/5 rounded-[10px] px-6 py-3 hover:bg-white hover:text-black transition-all duration-300 mt-2 md:mt-0"
                >
                  <span className="sr-only">Learn more about {t(`items.${adv.key}.title`)}</span>
                  <span aria-hidden="true">Learn More</span>
                  <ArrowRight size={14} className="md:group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>
          ))}
          
          <div className="border-t border-white/10 w-full -mx-6 px-6 sm:-mx-12 sm:px-12 md:-mx-16 md:px-16" />
        </div>
      </div>
    </section>
  )
}


