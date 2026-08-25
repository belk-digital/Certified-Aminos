'use client'

import React, { useState, useEffect, useRef, createContext, useContext } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const PreloaderContext = createContext({ isReady: true })
export const usePreloader = () => useContext(PreloaderContext)

export function HomePreloaderWrapper({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const [shouldAnimate, setShouldAnimate] = useState(true)
  const preloaderRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<HTMLDivElement>(null)
  const brandRef = useRef<HTMLDivElement>(null)

  // Check Session Storage on Mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeen = sessionStorage.getItem('hasSeenPreloader')
      if (hasSeen) {
        setShouldAnimate(false)
        setIsReady(true)
        if (preloaderRef.current) {
          preloaderRef.current.style.display = 'none'
        }
        window.dispatchEvent(new Event('preloader-done'))
      }
    }
  }, [])

  useGSAP(() => {
    if (!shouldAnimate) return;

    const tl = gsap.timeline({
      onComplete: () => {
        setIsReady(true)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('hasSeenPreloader', 'true')
        }
        gsap.set(preloaderRef.current, { display: 'none' })
        window.dispatchEvent(new Event('preloader-done'))
      }
    })

    const dots = dotsRef.current?.children || [];

    // Setup initial states
    gsap.set(dots, { scale: 0, opacity: 0, x: 0, y: 0 })
    gsap.set(brandRef.current, { opacity: 0, y: 15, filter: "blur(8px)" })
    
    // 1. Dots pop in at the exact center
    tl.to(dots, {
      scale: 1,
      opacity: 1,
      duration: 0.6,
      ease: "back.out(2)"
    })

    // 2. Dots elegantly spread out into a triangle
    const radius = 22;
    tl.to(dots, {
      x: (i) => Math.cos((i * 120 - 90) * (Math.PI / 180)) * radius,
      y: (i) => Math.sin((i * 120 - 90) * (Math.PI / 180)) * radius,
      duration: 1.2,
      ease: "power3.inOut"
    }, "-=0.2")

    // Start infinite mesmerizing rotation
    const rotationTween = gsap.to(dotsRef.current, {
      rotation: 360,
      duration: 4,
      repeat: -1,
      ease: "linear"
    });

    // Start infinite organic pulsing
    const pulseTween = gsap.to(dots, {
      scale: 1.4,
      boxShadow: "0 0 20px rgba(146, 220, 229, 0.9)",
      duration: 1,
      stagger: {
        each: 0.33,
        repeat: -1,
        yoyo: true
      },
      ease: "sine.inOut"
    });

    // 3. Brand text beautifully fades in and unblurs
    tl.to(brandRef.current, { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      duration: 1.2, 
      ease: "power3.out" 
    }, "-=0.8")

    // 4. Hold to let the user enjoy the animation
    tl.to({}, { duration: 1.8 })

    // 5. Elegant Exit Sequence
    tl.add(() => {
      // Smoothly slow down rotation before collapsing
      gsap.to(rotationTween, { timeScale: 0, duration: 0.8, ease: "power2.out" });
    })

    // Collapse dots back to a single point and vanish
    tl.to(dots, {
      x: 0,
      y: 0,
      scale: 0,
      opacity: 0,
      duration: 0.6,
      ease: "power3.in"
    })

    // Fade out brand text
    tl.to(brandRef.current, { opacity: 0, y: -10, duration: 0.4, ease: "power2.in" }, "<0.2")
    
    // Slide up black background gracefully
    tl.to(preloaderRef.current, { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, "-=0.1")

  }, { scope: preloaderRef, dependencies: [shouldAnimate] })

  return (
    <PreloaderContext.Provider value={{ isReady }}>
      {children}

      <div 
        ref={preloaderRef}
        className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#050505] overflow-hidden transform-gpu will-change-transform"
      >
         <div className="relative flex flex-col items-center justify-center z-10 gap-10">
           
           {/* Premium Orbital Dots Animation */}
           <div ref={dotsRef} className="relative w-16 h-16 flex items-center justify-center">
             <div className="absolute w-2.5 h-2.5 rounded-full bg-[#92DCE5] shadow-[0_0_10px_rgba(146,220,229,0.5)]"></div>
             <div className="absolute w-2.5 h-2.5 rounded-full bg-[#92DCE5] shadow-[0_0_10px_rgba(146,220,229,0.5)]"></div>
             <div className="absolute w-2.5 h-2.5 rounded-full bg-[#92DCE5] shadow-[0_0_10px_rgba(146,220,229,0.5)]"></div>
           </div>

           {/* Branding */}
           <div ref={brandRef} className="flex flex-col items-center opacity-0 px-6 max-w-[90vw]">
              <div className="text-2xl sm:text-3xl md:text-4xl font-heading tracking-[0.15em] text-white font-medium text-center drop-shadow-sm">
                HELIX BIO
              </div>
              <p className="text-white/40 text-[9px] sm:text-[10px] md:text-xs tracking-[0.3em] font-sans uppercase text-center mt-3">
                Clinical Research Synthesis
              </p>
           </div>

         </div>
      </div>
    </PreloaderContext.Provider>
  )
}
