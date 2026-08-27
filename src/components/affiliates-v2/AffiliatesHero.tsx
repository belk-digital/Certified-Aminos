'use client'

import React, { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useTranslations } from 'next-intl'

gsap.registerPlugin(useGSAP)

export function AffiliatesHero({ onApplyClick }: { onApplyClick: (e: React.MouseEvent) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('affiliate.landing')

  useGSAP(() => {
    gsap.fromTo(
      '.hero-title',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }
    )
    gsap.fromTo(
      '.hero-cta',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 0.4, ease: 'power3.out' }
    )
  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="w-full h-[90vh] min-h-[600px] p-4 md:p-6 bg-[#FAFAFA] pt-24 md:pt-32 flex flex-col">
      <div className="relative w-full h-full flex-grow rounded-3xl overflow-hidden bg-[#111] flex flex-col justify-between shadow-2xl">

        {/* Background Image & Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50"
          style={{ backgroundImage: 'url("/HelixBio Images/mutiple-vial-1.webp")' }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/80 via-black/20 to-black/80" />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />

        {/* Center Content */}
        <div className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 text-center">
          <h1 className="hero-title text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-medium text-white tracking-tight uppercase">
            {t('heroTitle') || 'Affiliates'}
          </h1>
          <p className="hero-title text-blue-200/80 text-sm md:text-base tracking-[0.2em] uppercase font-semibold mt-6 max-w-lg">
            Join our elite partner network
          </p>
          <button
            onClick={onApplyClick}
            className="hero-cta mt-10 bg-white text-slate-900 hover:bg-blue-50 transition-colors px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest shadow-2xl"
          >
            {t('heroJoinButtonShort') || 'Join the Program'}
          </button>
        </div>

      </div>
    </section>
  )
}
