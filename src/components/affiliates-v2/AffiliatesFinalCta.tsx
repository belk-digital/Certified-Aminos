'use client'

import React, { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

gsap.registerPlugin(ScrollTrigger)

const BULLET_KEYS = ['finalCtaBullet1', 'finalCtaBullet2', 'finalCtaBullet3', 'finalCtaBullet4', 'finalCtaBullet5', 'finalCtaBullet6'] as const

export function AffiliatesFinalCta({ onApplyClick }: { onApplyClick: (e: React.MouseEvent) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('affiliate.landing')

  useGSAP(() => {
    gsap.fromTo('.final-cta-text',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.15, scrollTrigger: { trigger: containerRef.current, start: 'top 80%' } }
    )
    gsap.fromTo('.final-cta-bullet',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, scrollTrigger: { trigger: containerRef.current, start: 'top 75%' } }
    )
  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="py-24 bg-white">
      <div className="w-full px-6 md:px-12 max-w-[1200px] mx-auto">
        <div className="bg-navy-deep rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[140px] rounded-full pointer-events-none -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400/5 blur-[100px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/4" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="final-cta-text text-3xl md:text-5xl font-syncopate font-medium uppercase text-white tracking-tight leading-[1.1] mb-6">
                {t('finalCtaTitle')}
              </h2>
              <p className="final-cta-text text-white/60 text-lg mb-8 leading-relaxed max-w-lg">
                {t('finalCtaDesc')}
              </p>
              <p className="final-cta-text text-white/50 text-sm font-semibold mb-8 flex flex-col sm:flex-row gap-1 sm:gap-2">
                <span>{t('finalCtaQuestions')}</span>
                <a href="mailto:support@certifiedaminos.com" className="text-blue-300 hover:text-white transition-colors font-bold underline underline-offset-4">support@certifiedaminos.com</a>
              </p>
              <button
                onClick={onApplyClick}
                className="final-cta-text bg-white text-navy-deep hover:bg-blue-50 transition-colors px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest shadow-xl"
              >
                {t('finalCtaButton')}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
              {BULLET_KEYS.map((key, i) => (
                <div key={i} className="final-cta-bullet flex items-start gap-4 bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                  <span className="text-white/80 font-semibold text-sm leading-snug">{t(key)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 text-center max-w-4xl mx-auto px-4">
          <p className="text-slate-500 text-[10px] md:text-xs leading-relaxed mb-4 font-medium uppercase tracking-widest">
            <span className="text-red-500 font-bold">{t('footerResearchLabel')}</span> {t('footerResearchText')}
          </p>
          <p className="text-slate-400 text-xs font-semibold">
            {t('footerCopyright')}
          </p>
        </div>
      </div>
    </section>
  )
}
