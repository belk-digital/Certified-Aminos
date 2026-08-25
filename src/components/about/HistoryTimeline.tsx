'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'

const MILESTONE_KEYS = ['m1', 'm2', 'm3', 'm4']

export function HistoryTimeline() {
  const t = useTranslations('content.aboutHistory')
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.from('.history-header > *', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      })

      gsap.from('.history-item', {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.history-track', start: 'top 85%' },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="w-full bg-navy-deep py-16 md:py-24 px-4 sm:px-6 md:px-8 lg:px-10 overflow-hidden">
      <div className="max-w-[1920px] mx-auto">
        <div className="history-header flex flex-col items-start mb-12 md:mb-16">
          <span className="text-[11px] text-white/40 tracking-[0.2em] font-bold uppercase mb-4">
            {t('eyebrow')}
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            {t('title')}
          </h2>
        </div>

        <div className="history-track grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 relative">
          <div className="hidden lg:block absolute top-[10px] left-0 right-0 h-px bg-white/15" />
          {MILESTONE_KEYS.map((key, i) => (
            <div key={key} className="history-item relative flex flex-col gap-4 lg:pt-8">
              <div className="hidden lg:flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary shrink-0" />
              </div>
              <span className="font-heading text-2xl md:text-3xl font-black text-primary tracking-tight">
                {t(`milestones.${key}.year`)}
              </span>
              <h3 className="text-white font-semibold text-lg">{t(`milestones.${key}.title`)}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{t(`milestones.${key}.description`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
