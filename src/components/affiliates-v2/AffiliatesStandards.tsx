'use client'

import React, { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { AlertTriangle, ShieldCheck, XCircle, CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

gsap.registerPlugin(ScrollTrigger)

export function AffiliatesStandards() {
  const containerRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('affiliate.landing')

  useGSAP(() => {
    gsap.fromTo('.standards-card',
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, scrollTrigger: { trigger: containerRef.current, start: 'top 75%' } }
    )
  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="py-24 bg-[#FAFAFA]">
      <div className="w-full px-6 md:px-12 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="standards-card group bg-navy-deep rounded-[2rem] p-8 md:p-12 border border-red-500/10 hover:border-red-500/30 shadow-2xl relative overflow-hidden h-full transition-all duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] group-hover:bg-red-500/20 transition-colors duration-500 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20 group-hover:scale-110 group-hover:border-red-500/40 transition-all duration-500">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-2xl font-syncopate font-medium text-white tracking-tight uppercase">{t('prohibitedTitle')}</h3>
              </div>

              <ul className="space-y-5">
                {[1, 2, 3, 4, 5].map((num) => (
                  <li key={`prohibited-${num}`} className="flex items-start gap-4">
                    <XCircle className="w-5 h-5 text-red-400/80 shrink-0 mt-0.5" />
                    <span className="text-white/70 text-base font-medium">{t(`prohibited${num}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="standards-card group bg-navy-deep rounded-[2rem] p-8 md:p-12 border border-blue-400/10 hover:border-blue-400/30 shadow-2xl relative overflow-hidden h-full transition-all duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] group-hover:bg-blue-500/20 transition-colors duration-500 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-400/20 group-hover:scale-110 group-hover:border-blue-400/40 transition-all duration-500">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-syncopate font-medium text-white tracking-tight uppercase">{t('contentStandardsTitle')}</h3>
              </div>

              <ul className="space-y-5">
                {[1, 2, 3, 4, 5].map((num) => (
                  <li key={`content-${num}`} className="flex items-start gap-4">
                    <CheckCircle2 className="w-5 h-5 text-blue-400/80 shrink-0 mt-0.5" />
                    <span className="text-white/70 text-base font-medium">{t(`content${num}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
