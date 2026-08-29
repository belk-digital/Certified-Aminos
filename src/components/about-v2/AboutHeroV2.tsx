'use client'

import React, { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export function AboutHeroV2() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.fromTo(
      '.hero-title',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }
    )
  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="w-full h-[90vh] min-h-[600px] p-4 md:p-6 bg-[#FAFAFA] pt-[160px] md:pt-[200px] flex flex-col">
      <div className="relative w-full h-full flex-grow rounded-3xl overflow-hidden bg-[#111] flex flex-col justify-between shadow-2xl">
        
        {/* Background Image & Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1555664424-778a1e5e1b48?q=80&w=2070&auto=format&fit=crop")' }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/80 via-black/20 to-black/80" />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />

        {/* Center Content */}
        <div className="relative z-10 flex-grow flex items-center justify-center px-4">
          <h1 className="hero-title text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-medium text-white tracking-tight">
            About Us
          </h1>
        </div>
        
      </div>
    </section>
  )
}
