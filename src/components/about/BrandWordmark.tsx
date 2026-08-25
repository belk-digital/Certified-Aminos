'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'

export function BrandWordmark() {
  const t = useTranslations('content.aboutWordmark')
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.from('.wordmark-elem', {
        scale: 0.85,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="w-full relative flex items-center justify-center py-24 md:py-32 overflow-hidden"
      style={{ background: 'radial-gradient(circle at 50% 50%, #1a2c52 0%, #0a1323 70%, #060a12 100%)' }}
    >
      {/* Faint accent glow — stands in for a generated nebula/molecule background */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(220,245,59,0.15) 0%, transparent 55%)' }}
      />
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 75% 65%, rgba(59,138,245,0.2) 0%, transparent 50%)' }}
      />

      <h2 className="wordmark-elem relative z-10 font-syncopate text-white uppercase text-center leading-[0.9] tracking-tight text-[clamp(2.5rem,12vw,10rem)] font-semibold">
        {t('line1')}
        <br />
        {t('line2')}
      </h2>
    </section>
  )
}
