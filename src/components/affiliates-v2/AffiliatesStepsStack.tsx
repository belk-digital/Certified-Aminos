'use client'

import React, { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

gsap.registerPlugin(ScrollTrigger)

const IMAGES = ['/HelixBio Images/affiliate-step1-1.jpg', '/HelixBio Images/affiliate-step2-1.jpg', '/HelixBio Images/affiliate-step3-1.jpg', '/HelixBio Images/affiliate-step4-1.jpg']

export function AffiliatesStepsStack() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('affiliate.landing')

  const cards = [1, 2, 3, 4].map((n, idx) => ({
    id: idx,
    title: t(`step${n}Title`),
    image: IMAGES[idx],
  }))

  useGSAP(() => {
    gsap.to('.marquee-track', {
      xPercent: -50,
      ease: 'none',
      duration: 40,
      repeat: -1,
    })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=300%',
        scrub: 1,
        pin: true,
      },
    })

    tl.to('.stack-card-0', { y: -150, scale: 1.05, opacity: 0, rotateZ: -10, duration: 1 })
      .to('.stack-card-1', { y: 0, scale: 1, rotateZ: 0, duration: 1 }, '<')
      .to('.stack-card-2', { y: 15, scale: 0.95, rotateZ: 5, duration: 1 }, '<')
      .to('.stack-card-3', { y: 30, scale: 0.9, rotateZ: -5, duration: 1 }, '<')

    tl.to('.stack-card-1', { y: -150, scale: 1.05, opacity: 0, rotateZ: 10, duration: 1 })
      .to('.stack-card-2', { y: 0, scale: 1, rotateZ: 0, duration: 1 }, '<')
      .to('.stack-card-3', { y: 15, scale: 0.95, rotateZ: 5, duration: 1 }, '<')

    tl.to('.stack-card-2', { y: -150, scale: 1.05, opacity: 0, rotateZ: -10, duration: 1 })
      .to('.stack-card-3', { y: 0, scale: 1, rotateZ: 0, duration: 1 }, '<')
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="h-screen w-full bg-navy-deep relative overflow-hidden flex items-center justify-center">

      <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none select-none z-0">
        <div className="marquee-track flex whitespace-nowrap">
          <div className="flex items-center">
            {[...Array(4)].map((_, i) => (
              <span key={i} className="text-[100px] md:text-[200px] font-syncopate font-bold text-transparent tracking-widest uppercase pl-8" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.05)' }}>
                START EARNING <span className="px-4 md:px-8">/</span> SHARE YOUR LINK <span className="px-4 md:px-8">/</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute top-16 md:top-24 left-0 right-0 z-20 px-6 text-center pointer-events-none">
        <h2 className="text-2xl md:text-4xl font-syncopate font-medium uppercase text-white drop-shadow-sm leading-tight">
          {t('stepsTitle')}
        </h2>
      </div>

      <div className="relative w-full max-w-[260px] md:max-w-[320px] aspect-[4/5] z-10 perspective-[1000px] mt-24 md:mt-32">
        {cards.map((card, idx) => {
          const initialRotation = idx === 0 ? 0 : idx % 2 === 1 ? 5 : -5

          return (
            <div
              key={card.id}
              className={`stack-card-${idx} absolute inset-0 bg-white rounded-[2rem] p-3 md:p-4 shadow-2xl border border-slate-100 flex flex-col will-change-transform`}
              style={{
                transform: `translateY(${idx * 15}px) scale(${1 - idx * 0.05}) rotateZ(${initialRotation}deg)`,
                zIndex: cards.length - idx,
                opacity: 1,
                transformOrigin: 'bottom center',
              }}
            >
              <div className="relative w-full h-[70%] rounded-2xl overflow-hidden mb-4 md:mb-6 bg-slate-100">
                <Image src={card.image} alt={card.title} fill className="object-cover" />
              </div>
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-lg md:text-xl text-slate-900 leading-tight w-2/3">{card.title}</h3>
                <span className="px-3 py-1.5 md:px-4 md:py-2 border border-slate-200 rounded-full text-[10px] md:text-xs font-bold text-slate-600 uppercase tracking-wider bg-slate-50">Step {idx + 1}</span>
              </div>
            </div>
          )
        })}
      </div>

    </section>
  )
}
