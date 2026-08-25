'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'

export function CtaBanner() {
  const t = useTranslations('content.aboutCta')
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.from('.cta-elem', {
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-16 md:py-24 bg-[#FAFAFA]">
      <div className="max-w-[1920px] mx-auto relative rounded-[2rem] md:rounded-[3rem] overflow-hidden min-h-[420px] md:min-h-[520px] flex items-end shadow-2xl">
        {/* TODO: replace with generated lab-equipment/device photo — standing in with existing lab imagery for now */}
        <Image
          src="/research-grade-peptides-image.png"
          alt="Certified Aminos laboratory testing equipment"
          fill
          className="object-cover cta-elem"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/40 to-transparent" />

        <div className="relative z-10 w-full p-6 sm:p-10 md:p-14 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-xl">
            <span className="cta-elem text-primary text-xs sm:text-sm font-bold tracking-[0.2em] uppercase mb-4 block">
              {t('eyebrow')}
            </span>
            <h2 className="cta-elem font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-[1.05] mb-4">
              {t('title')}
            </h2>
            <p className="cta-elem text-white/70 text-sm sm:text-base leading-relaxed mb-6 md:mb-0 max-w-md">
              {t('description')}
            </p>
          </div>

          <div className="cta-elem flex flex-col items-start md:items-end gap-6 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 text-left md:text-right">
              <div className="text-3xl sm:text-4xl font-heading font-black text-white tracking-tight">
                {t('statValue')}
              </div>
              <div className="text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1">
                {t('statLabel')}
              </div>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-white text-navy-deep px-6 py-3 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest hover:bg-primary transition-colors group"
            >
              {t('ctaText')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
