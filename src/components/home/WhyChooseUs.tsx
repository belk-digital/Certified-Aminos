'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

const CHOOSE_US_KEYS = [
  { key: 'hplcPurity', media: "/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_41_24 AM.webp" },
  { key: 'msIdentity', media: "/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_44_49 AM.webp" },
  { key: 'coaDocumentation', media: "/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_46_36 AM.webp" }
]

export function WhyChooseUs() {
  const t = useTranslations('home.whyChooseUs')
  const CHOOSE_US_DATA = CHOOSE_US_KEYS.map(({ key, media }) => ({
    tag: t(`items.${key}.tag`),
    title: t(`items.${key}.title`),
    description: t(`items.${key}.description`),
    media,
  }))
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % CHOOSE_US_DATA.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeIndex, CHOOSE_US_DATA.length]);

  return (
    <section className="bg-[#FAFAFA] py-16 md:py-24 relative font-sans overflow-hidden flex flex-col justify-center">
      <div className="container mx-auto px-4 md:px-10 max-w-[120rem] relative z-10">
        
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block border border-ink/10 rounded-full px-4 py-1.5 mb-6 bg-white shadow-sm">
            <span className="text-ink text-xs font-bold tracking-[0.2em] uppercase">{t('eyebrow')}</span>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-[5rem] font-black text-ink leading-[1] tracking-tighter uppercase drop-shadow-sm break-words">
            {t('titleLine1')}<br />{t('titleLine2')}
          </h2>
        </div>

        <div className="flex flex-col-reverse xl:flex-row gap-6 w-full max-w-[100rem] mx-auto xl:h-[700px]">
          
          {/* Left Column: Interactive Cards */}
          <div className="w-full xl:w-[40%] flex flex-col gap-4 h-auto xl:h-full shrink-0">
            {CHOOSE_US_DATA.map((item, index) => {
              const isActive = activeIndex === index;
              return (
                <button 
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-full text-left transition-all duration-500 rounded-[24px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden group ${
                    isActive 
                      ? 'bg-[#1a1a1a] text-white shadow-xl xl:scale-[1.02] z-10 min-h-[160px] xl:min-h-0 xl:flex-1' 
                      : 'bg-white text-ink hover:bg-gray-50 min-h-[100px] xl:min-h-0 xl:flex-1'
                  }`}
                >
                  <div className="flex justify-end w-full">
                    <h3 className={`font-heading text-xl sm:text-3xl xl:text-4xl uppercase tracking-tighter text-right w-full sm:max-w-[80%] leading-[1.1] break-words ${isActive ? 'text-white' : 'text-ink'}`}>
                      {item.title}
                    </h3>
                  </div>
                  
                  <div className="flex justify-between items-end mt-4 xl:mt-8 w-full gap-4">
                    <p className={`text-[10px] sm:text-xs uppercase tracking-[0.15em] max-w-[75%] leading-relaxed font-semibold transition-opacity duration-300 ${isActive ? 'opacity-100 text-white/70' : 'opacity-0 xl:opacity-100 text-ink/70 hidden xl:block'}`}>
                      {item.description}
                    </p>
                    <ArrowUpRight className={`w-8 h-8 sm:w-10 sm:h-10 transition-all duration-300 ${isActive ? 'text-[#7dd3fc]' : 'text-[#7dd3fc] group-hover:scale-110 group-hover:translate-x-1 group-hover:-translate-y-1'}`} strokeWidth={1} />
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Right Column: Image Panel */}
          <div className="w-full xl:w-[60%] h-[350px] sm:h-[450px] xl:h-full rounded-[24px] sm:rounded-[32px] overflow-hidden relative shadow-2xl bg-black shrink-0">
             <AnimatePresence>
               <motion.div
                 key={activeIndex}
                 initial={{ opacity: 0, scale: 1.05 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                 className="absolute inset-0"
               >
                 <Image 
                   src={CHOOSE_US_DATA[activeIndex].media}
                   alt={CHOOSE_US_DATA[activeIndex].title}
                   fill
                   className="object-cover"
                   sizes="(max-width: 1280px) 100vw, 60vw"
                   priority
                 />
               </motion.div>
             </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  )
}
