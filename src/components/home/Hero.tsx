'use client'
import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function Hero() {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.from('.hero-waves-img', { y: 150, opacity: 0, duration: 1.2, ease: 'power2.out' })
        .from('.hero-title-main', { y: 50, opacity: 0, duration: 1 }, '-=0.6')
        .from('.hero-title-sub', { y: 50, opacity: 0, duration: 1 }, '-=0.8')
        .from('.hero-product-img', { x: 100, opacity: 0, duration: 1.5, ease: 'power2.out' }, '-=0.5')
        .from('.hero-subtitle', { opacity: 0, duration: 1 }, '-=0.8')
        .from('.explore-btn', { scale: 0.9, opacity: 0, duration: 0.5 }, '-=0.8')
        .from('.pill-badge, .product-card', { x: -50, opacity: 0, duration: 0.8, stagger: 0.2 }, '-=1')
    }, container)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={container}
      className="relative w-full min-h-[88vh] lg:h-screen flex flex-col text-white overflow-hidden pb-[300px] lg:pb-0"
      style={{ background: 'radial-gradient(ellipse at 70% 30%, #151d30 0%, #060a12 100%)' }}
    >
      <div className="flex flex-1 relative px-8 pb-8 pt-36 sm:pt-40 lg:pt-44 flex-col lg:flex-row items-center lg:items-stretch">
        {/* Left Column */}
        <div className="flex flex-col gap-8 z-10 pt-4 w-full lg:w-[250px] items-center lg:items-stretch">
          <div className="pill-badge border border-white/15 rounded-[30px] px-4 py-2 text-[0.7rem] font-inter inline-flex items-center gap-2.5 w-fit backdrop-blur-sm text-[#e0e5ff]">
            <span className="text-lg leading-none -mt-0.5 text-white tracking-tighter">••</span>
            RESEARCH PEPTIDE COMPOUNDS
          </div>

          <div className="product-card hidden md:block bg-white border-4 border-white rounded-lg overflow-hidden w-[200px] shadow-[0_20px_40px_rgba(0,0,0,0.4)] mt-4">
            <div
              className="relative h-[200px] flex items-center justify-center p-4 overflow-hidden rounded-t"
              style={{ background: 'linear-gradient(145deg, #2a385c 0%, #172138 50%, #0d1525 100%)' }}
            >
              <img
                src="/finalized product images/certified-aminos-MT-1-10mg.png"
                alt="Product thumbnail"
                className="max-w-[90%] max-h-[90%] object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.6)] relative z-10"
              />
            </div>
            <div className="flex flex-col items-center justify-center gap-2 p-4 bg-white text-[#141e3a] font-inter">
              <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 32 L16 58 L26 52 L32 58 L38 52 L48 58 L46 32 Z" fill="#141e3a" />
                <path d="M32 4 L38 9 L45 6 L48 13 L55 13 L55 20 L61 25 L56 30 L61 36 L55 40 L55 47 L48 48 L45 54 L38 51 L32 56 L26 51 L19 54 L16 48 L9 47 L9 40 L3 36 L8 30 L3 25 L9 20 L9 13 L16 13 L19 6 L26 9 Z" fill="#141e3a" />
                <circle cx="32" cy="30" r="14" fill="#ffffff" />
                <path d="M26 31 L30 35 L39 25" stroke="#141e3a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[0.85rem] font-semibold text-center">BATCH PURITY VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Main headline area */}
        <div className="flex-1 flex flex-col relative z-10 lg:pl-8 mt-8 lg:mt-0 w-full">
          <div className="w-full">
            <h1 className="hero-title-main font-syncopate font-normal uppercase leading-[1.1] tracking-wide text-[2.2rem] sm:text-[8vw] lg:text-[5vw] text-center lg:text-left">
              PRECISION BEYOND
            </h1>
          </div>
          <div className="flex justify-between items-start mt-0 lg:mt-6 flex-col lg:flex-row items-center lg:items-start">
            <div className="order-2 lg:order-1 pt-2 text-center lg:text-left flex flex-col items-center lg:items-start mb-4 lg:mb-0">
              <p className="hero-subtitle font-inter text-[0.9rem] sm:text-base leading-relaxed opacity-80 font-light max-w-[400px] mb-6 lg:mb-10 px-4 lg:px-0">
                Research-grade peptides created for reliable
                <br className="hidden lg:block" /> quality, clear testing, and consistent
                <br className="hidden lg:block" /> laboratory performance.
              </p>
              <button className="explore-btn bg-white text-black px-8 py-4 rounded-sm font-semibold text-xs tracking-wide flex items-center gap-3 font-syncopate transition-all hover:bg-gray-100 hover:-translate-y-0.5">
                EXPLORE CATALOGUE <span>→</span>
              </button>
            </div>
            <div className="order-1 lg:order-2 hero-title-sub font-syncopate font-normal uppercase leading-[1.1] tracking-wide text-[2.2rem] sm:text-[8vw] lg:text-[5.5vw] text-center lg:text-left">
              PURITY
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[350px] lg:h-full z-[5] pointer-events-none overflow-hidden">
        <img
          src="/hero-waves.png"
          alt="Waves"
          className="hero-waves-img absolute -bottom-[2px] left-0 w-full h-full lg:h-auto lg:min-h-[150px] object-cover z-[1]"
        />
      </div>
      <img
        src="/finalized product images/hero-product-image.png"
        alt="Hero Product"
        className="hero-product-img absolute object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.7)] z-[15] pointer-events-none
          w-[115vw] max-w-[480px] bottom-0 left-1/2 -translate-x-1/2
          sm:w-[80vw] sm:min-w-[300px] sm:max-w-none
          lg:w-auto lg:h-[70vh] lg:max-h-[650px] lg:bottom-[2%] lg:right-[22%] lg:left-auto lg:translate-x-0"
      />
    </section>
  )
}
