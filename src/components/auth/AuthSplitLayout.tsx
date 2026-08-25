'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'

interface AuthSplitLayoutProps {
  children: React.ReactNode
  mode: 'login' | 'register'
}

const COPY = {
  login: {
    eyebrow: 'Welcome back',
    headline: 'Sign in to track orders, manage your wishlist, and reorder in seconds.',
  },
  register: {
    eyebrow: 'You can easily',
    headline: 'Get access to your certificates of analysis, order history, and faster checkout.',
  },
}

export function AuthSplitLayout({ children, mode }: AuthSplitLayoutProps) {
  const copy = COPY[mode]
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.from('.auth-left-panel', { opacity: 0, scale: 0.97, duration: 0.9, ease: 'power2.out' })
        .from('.auth-left-topbar', { y: -20, opacity: 0, duration: 0.6 }, '-=0.5')
        .from('.auth-left-eyebrow', { y: 20, opacity: 0, duration: 0.6 }, '-=0.3')
        .from('.auth-left-headline', { y: 30, opacity: 0, duration: 0.8 }, '-=0.4')
        .from('.auth-right-mark', { y: -10, opacity: 0, duration: 0.5 }, '-=0.9')
        .from('.auth-right-content', { y: 24, opacity: 0, duration: 0.7 }, '-=0.5')
    }, containerRef)

    return () => ctx.revert()
  }, [mode])

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full bg-white flex flex-col lg:flex-row p-2 sm:p-3 gap-2 sm:gap-3 font-sans"
    >
      {/* Left panel — brand image, inset rounded card */}
      <div className="auth-left-panel relative w-full h-[280px] lg:h-auto lg:w-1/2 rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-14 text-white shrink-0">
        <Image
          src="/login-page-image.png"
          alt="Certified Aminos research peptides"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/40 to-navy-deep/20" />

        <div className="auth-left-topbar relative z-10 flex items-center justify-between">
          <span className="font-syncopate text-sm lg:text-base uppercase tracking-wide">Certified Aminos</span>
          <Link
            href="/"
            className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors border border-white/20 rounded-full px-4 py-2"
          >
            ← Return home
          </Link>
        </div>

        <div className="relative z-10">
          <p className="auth-left-eyebrow text-white/60 text-sm font-medium mb-2">{copy.eyebrow}</p>
          <h1 className="auth-left-headline font-heading uppercase text-2xl sm:text-3xl lg:text-4xl font-black leading-[1.15] max-w-sm">
            {copy.headline}
          </h1>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-10 lg:px-20 py-10 lg:py-10">
        <div className="w-full max-w-md mx-auto">
          <div className="auth-right-mark flex items-center gap-2 mb-8 lg:mb-10">
            <span className="font-syncopate text-sm text-ink uppercase tracking-wide">Certified Aminos</span>
          </div>
          <div className="auth-right-content">{children}</div>
        </div>
      </div>
    </div>
  )
}
