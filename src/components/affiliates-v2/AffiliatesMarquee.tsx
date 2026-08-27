'use client'

import React, { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { CircleIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function AffiliatesMarquee() {
  const containerRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('affiliate.landing')

  useGSAP(() => {
    gsap.to('.marquee-track', {
      xPercent: -50,
      ease: 'none',
      duration: 30,
      repeat: -1,
    })
  }, { scope: containerRef })

  const items = [
    `${t('statCookieValue')} COOKIE`,
    '15% COMMISSION',
    `${t('statDualValue')} TRACKING`,
    `${t('statMonthlyValue')} PAYOUTS`,
    'DEDICATED SUPPORT',
  ]

  const displayItems = [...items, ...items, ...items, ...items]

  return (
    <div ref={containerRef} className="w-full overflow-hidden bg-white py-8 border-y border-slate-100 flex items-center">
      <div className="marquee-track flex whitespace-nowrap items-center">
        {displayItems.map((item, i) => (
          <div key={i} className="flex items-center mx-4 md:mx-8">
            <span className="text-2xl md:text-4xl font-light tracking-widest text-slate-300 uppercase">
              {item}
            </span>
            <CircleIcon className="w-2 h-2 md:w-3 md:h-3 text-blue-900 mx-4 md:mx-8" />
          </div>
        ))}
      </div>
    </div>
  )
}
