'use client'

import React, { useEffect, useRef } from 'react'
import { Link } from '@/i18n/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'

export function ContactCta() {
  const t = useTranslations('content.aboutContactCta')
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.from('.contact-cta-elem', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="w-full bg-[#FAFAFA] px-4 sm:px-6 md:px-8 lg:px-10 pb-16 md:pb-24">
      <div className="max-w-[1920px] mx-auto bg-ink rounded-[2rem] md:rounded-[3rem] px-8 py-14 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div>
          <h2 className="contact-cta-elem font-heading text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
            {t('title')}
          </h2>
          <p className="contact-cta-elem text-white/60 text-sm sm:text-base max-w-lg leading-relaxed">
            {t('description')}
          </p>
        </div>
        <Link
          href="/contact-us"
          className="contact-cta-elem inline-flex items-center gap-2 bg-white text-ink px-8 py-4 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest hover:bg-primary transition-colors group shrink-0"
        >
          {t('ctaText')}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  )
}
