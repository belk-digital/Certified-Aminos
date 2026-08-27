'use client'

import React, { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ArrowUpRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

gsap.registerPlugin(ScrollTrigger)

const WHY_KEYS = ['why1', 'why2', 'why3', 'why4', 'why5', 'why6', 'why7', 'why8', 'why9']

export function AffiliatesWhyGrid() {
  const containerRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('affiliate.landing')

  useGSAP(() => {
    gsap.fromTo(
      '.advantage-card',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: containerRef.current, start: 'top 70%' } }
    )
  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="py-24 bg-[#FAFAFA]">
      <div className="w-full px-6 md:px-12">
        <div className="flex justify-between items-end mb-16 border-b border-slate-200 pb-8">
          <h2 className="text-sm font-bold tracking-widest uppercase text-slate-500">{t('whyChooseTitle')}</h2>
          <h3 className="text-4xl md:text-5xl font-syncopate font-medium uppercase text-slate-900">Our Advantages</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WHY_KEYS.map((key, i) => (
            <div key={key} className="advantage-card bg-white p-8 rounded-2xl border border-slate-200 hover:border-blue-900 transition-colors group cursor-default flex flex-col h-[280px]">
              <div className="flex justify-between items-start mb-auto">
                <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">Advantage {i + 1}</div>
                <ArrowUpRight className="w-6 h-6 text-slate-400 group-hover:text-blue-900 transition-colors" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-3 leading-snug">{t(`${key}Title`)}</h4>
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{t(`${key}Desc`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
