'use client'

import React, { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useTranslations } from 'next-intl'

gsap.registerPlugin(ScrollTrigger)

export function AffiliatesCommissionBanner({ onApplyClick }: { onApplyClick: (e: React.MouseEvent) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('affiliate.landing')

  useGSAP(() => {
    gsap.fromTo('.commission-image-container',
      { scale: 0.95, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.5, ease: 'power2.out', scrollTrigger: { trigger: containerRef.current, start: 'top 80%' } }
    )

    gsap.fromTo('.commission-text',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.2, scrollTrigger: { trigger: '.commission-text-container', start: 'top 80%' } }
    )
  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="py-24 bg-white">
      <div className="w-full px-6 md:px-12">
        <div className="commission-image-container w-full h-[400px] md:h-[500px] rounded-[2.5rem] overflow-hidden relative mb-24 bg-slate-900 flex items-center justify-center">
          <img src="/shop-hero-image.webp" alt="Affiliate Earnings" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-navy-deep/90 via-navy-deep/60 to-transparent"></div>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full h-full p-8 md:p-16">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl max-w-sm">
              <div className="text-sm font-bold text-blue-200 mb-1">{t('monthlyEarnings50Label').toUpperCase()}</div>
              <div className="text-white text-lg">{t('monthlyEarningsTitle')}</div>
              <div className="text-6xl font-bold text-white mt-4">$1,125</div>
            </div>

            <div className="hidden md:flex h-full items-center justify-center relative w-1/2">
              <div className="w-[300px] h-[300px] border border-blue-400/30 rounded-full absolute"></div>
              <div className="w-[200px] h-[200px] border-2 border-blue-400/50 rounded-full absolute"></div>
              <div className="w-24 h-24 bg-blue-500 rounded-full blur-xl absolute opacity-50"></div>
              <div className="w-[220px] h-[220px] absolute rounded-full overflow-hidden shadow-2xl z-10 border border-white/20">
                <img src="/HelixBio Images/affiliate-commission-badge.jpg" alt="Commission Badge" className="w-full h-full object-cover opacity-90" />
              </div>
            </div>
          </div>
        </div>

        <div className="commission-text-container flex flex-col md:flex-row justify-between items-start gap-12">
          <h2 className="commission-text text-xl md:text-3xl font-syncopate font-medium uppercase text-slate-900 max-w-2xl leading-tight">
            {t('commissionStructureTitle')} — <span className="font-bold text-blue-900">{t('commissionStructureDesc')}</span>
          </h2>
          <div className="commission-text flex flex-col gap-4">
            <div className="text-slate-500 font-semibold uppercase tracking-wider text-sm flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-blue-900 flex items-center justify-center text-[10px] font-bold text-blue-900">$</span>
              {t('applyEyebrow')}
            </div>
            <button onClick={onApplyClick} className="bg-blue-100 text-blue-900 px-8 py-3 rounded-full font-bold hover:bg-blue-200 transition-colors text-center">
              {t('heroJoinButtonShort') || 'Join the Program'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
