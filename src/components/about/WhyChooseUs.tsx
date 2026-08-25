'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { FadeUp } from '@/components/motion/FadeUp'

const PILLAR_META = [
  { id: '01', key: 'synthesis', image: '/HelixBio Images/category-3.webp' },
  { id: '02', key: 'purity', image: '/HelixBio Images/category-1.webp' },
  { id: '03', key: 'innovation', image: '/HelixBio Images/military-3.webp' },
  { id: '04', key: 'transparency', image: '/HelixBio Images/category-8.webp' },
]

export function WhyChooseUs() {
  const t = useTranslations('content.aboutWhyChooseUs')
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const pillars = PILLAR_META.map((meta) => ({
    ...meta,
    title: t(`pillars.${meta.key}.title`),
    desc: t(`pillars.${meta.key}.desc`),
  }))

  useEffect(() => {
    if (isPaused) return

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % pillars.length)
    }, 4000)

    return () => clearInterval(timer)
  }, [activeIndex, isPaused, pillars.length])

  return (
    <section className="py-16 lg:py-32 px-4 sm:px-6 bg-[#f8fafd] text-ink relative">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] xl:grid-cols-[1.5fr_1fr] gap-8 lg:gap-24 items-start relative">
          {/* Left Side: Dynamic Image Slider (Desktop & Mobile) */}
          <div className="lg:sticky lg:top-32 h-[300px] md:h-[400px] lg:h-[75vh] w-full relative rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-2xl bg-white border border-slate-100 z-10 order-1">
            <motion.div
              className="absolute inset-0 w-full h-full flex flex-col"
              animate={{ y: `-${activeIndex * 100}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {pillars.map((pillar, index) => (
                <div key={index} className="w-full h-full relative shrink-0">
                  <Image src={pillar.image} alt={pillar.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-ink/5 mix-blend-overlay" />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Side: Content & Interaction */}
          <div className="flex flex-col w-full h-full z-20 order-2">
            <FadeUp>
              <h2 className="text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-primary mb-6 lg:mb-12 font-bold mt-4 lg:mt-0">
                {t('eyebrow')}
              </h2>
            </FadeUp>

            {/* Top area: Dynamic Content */}
            <div className="relative min-h-[240px] md:min-h-[160px] lg:min-h-[220px] mb-4 lg:mb-16">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="w-full"
                >
                  <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading mb-3 md:mb-4 lg:mb-6 tracking-tight leading-[1.1] text-ink">
                    {pillars[activeIndex].title}
                  </h3>
                  <p className="text-base lg:text-lg text-ink/70 leading-relaxed font-light max-w-lg">
                    {pillars[activeIndex].desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom area: Hoverable List */}
            <div
              className="flex flex-col w-full mt-auto"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <FadeUp delay={0.2}>
                <div className="border-t border-slate-200" />
                {pillars.map((pillar, index) => {
                  const isActive = activeIndex === index
                  return (
                    <button
                      key={pillar.id}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => setActiveIndex(index)}
                      className="group border-b border-slate-200 py-4 lg:py-8 flex items-center justify-between text-left transition-colors duration-500 hover:border-primary/30 w-full"
                    >
                      <span
                        className={`text-xl md:text-2xl lg:text-3xl font-heading tracking-tight transition-colors duration-500 pr-4 ${isActive ? 'text-primary' : 'text-ink/50 group-hover:text-ink/80'}`}
                      >
                        {pillar.title}
                      </span>

                      {/* Interactive Arrow Indicator */}
                      <motion.div
                        initial={false}
                        animate={{
                          rotate: isActive ? 0 : -45,
                          x: isActive ? 0 : -8,
                          opacity: isActive ? 1 : 0.3,
                        }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="text-primary shrink-0"
                      >
                        <svg width="20" height="20" className="lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </motion.div>
                    </button>
                  )
                })}
              </FadeUp>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
