'use client'

import React, { useEffect, useRef } from 'react'
import { Link } from '@/i18n/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTranslations } from 'next-intl'
import { BookOpen, Calculator, FileCheck2, ArrowRight } from 'lucide-react'

const RESOURCE_META = [
  { key: 'journal', icon: BookOpen },
  { key: 'calculator', icon: Calculator },
  { key: 'certificates', icon: FileCheck2 },
]

export function ResearchResources() {
  const t = useTranslations('content.aboutResources')
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.from('.resource-header > *', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      })

      gsap.from('.resource-item', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.resource-grid', start: 'top 85%' },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="w-full bg-[#FAFAFA] py-16 md:py-24 px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="max-w-[1920px] mx-auto">
        <div className="resource-header flex flex-col items-start mb-12 md:mb-16">
          <span className="text-[11px] text-ink/40 tracking-[0.2em] font-bold uppercase mb-4">
            {t('eyebrow')}
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black text-ink uppercase tracking-tight leading-[1.05]">
            {t('titleLine1')}
            <br />
            {t('titleLine2')}
          </h2>
        </div>

        <div className="resource-grid grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {RESOURCE_META.map(({ key, icon: Icon }) => (
            <Link
              key={key}
              href={t(`items.${key}.href`)}
              className="resource-item group bg-white rounded-[2rem] p-8 border border-black/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="w-14 h-14 rounded-2xl bg-ink/5 group-hover:bg-primary/15 flex items-center justify-center mb-6 transition-colors">
                <Icon className="w-6 h-6 text-ink group-hover:text-primary transition-colors" strokeWidth={1.75} />
              </div>
              <h3 className="font-heading text-xl font-bold text-ink mb-2">{t(`items.${key}.title`)}</h3>
              <p className="text-ink/60 text-sm leading-relaxed mb-6">{t(`items.${key}.description`)}</p>
              <div className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink/50 group-hover:text-primary transition-colors">
                Explore
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
