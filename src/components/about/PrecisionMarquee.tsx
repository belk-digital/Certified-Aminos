'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useTranslations } from 'next-intl'

export function PrecisionMarquee() {
  const t = useTranslations('content.aboutMarquee')
  const trackRef = useRef<HTMLDivElement>(null)
  const items: string[] = t.raw('items')

  useEffect(() => {
    if (!trackRef.current) return
    const tween = gsap.to(trackRef.current, {
      xPercent: -50,
      duration: 22,
      ease: 'linear',
      repeat: -1,
    })
    return () => {
      tween.kill()
    }
  }, [])

  const renderItems = (keyPrefix: string) =>
    items.map((item, i) => (
      <span key={`${keyPrefix}-${i}`} className="flex items-center gap-8 shrink-0">
        <span className="font-syncopate text-[13px] md:text-base tracking-[0.15em] uppercase text-navy-deep whitespace-nowrap">
          {item}
        </span>
        <span className="text-primary text-lg leading-none">⊙</span>
      </span>
    ))

  return (
    <section className="w-full bg-[#f8f9fa] border-y border-navy-deep/10 py-5 overflow-hidden">
      <div ref={trackRef} className="flex items-center gap-8 w-max">
        {renderItems('a')}
        {renderItems('b')}
      </div>
    </section>
  )
}
