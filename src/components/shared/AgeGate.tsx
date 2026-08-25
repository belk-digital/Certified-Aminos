'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Lock } from 'lucide-react'
import { useLenis } from 'lenis/react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { FluidButton } from '@/components/ui/fluid-button'

export function AgeGate() {
  const t = useTranslations('ageGate')
  const [isVisible, setIsVisible] = useState(false)
  const [hasHydrated, setHasHydrated] = useState(false)
  const [exitDirection, setExitDirection] = useState<'up' | 'down'>('down')
  const [waitingForPreloader, setWaitingForPreloader] = useState(false)
  const [isDenied, setIsDenied] = useState(false)
  
  const lenis = useLenis()
  const pathname = usePathname()

  useEffect(() => {
    setHasHydrated(true)
    const isVerified = document.cookie.includes('age_verified=true')
    
    if (!isVerified) {
      if (pathname === '/') {
        setWaitingForPreloader(true)
        const handleDone = () => {
          if (!document.cookie.includes('age_verified=true')) {
            setWaitingForPreloader(false)
            setIsVisible(true)
          }
        }
        window.addEventListener('preloader-done', handleDone)
        
        // Fallback to show it eventually if event is missed
        const timeout = setTimeout(handleDone, 8000)
        
        return () => {
          window.removeEventListener('preloader-done', handleDone)
          clearTimeout(timeout)
        }
      } else {
        setIsVisible(true)
      }
    }
  }, [pathname])

  // Lock scroll and videos globally when visible
  useEffect(() => {
    const videos = document.querySelectorAll('video')
    if (isVisible) {
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
      lenis?.stop()
      videos.forEach(v => v.pause())
    } else {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      lenis?.start()
      videos.forEach(v => v.play().catch(() => {}))
    }
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      lenis?.start()
      videos.forEach(v => v.play().catch(() => {}))
    }
  }, [isVisible, lenis])

  const handleVerify = () => {
    setExitDirection('down')
    document.cookie = "age_verified=true; max-age=31536000; path=/";
    setTimeout(() => {
      setIsVisible(false)
    }, 50)
  }

  const handleDeny = () => {
    setIsDenied(true)
  }

  const handleGoBack = () => {
    setIsDenied(false)
  }

  if (!hasHydrated || waitingForPreloader) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[999999] pointer-events-auto">
          {/* Inner wrapper - Full Screen Editorial Split */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ y: exitDirection === 'up' ? "-100vh" : "100%", opacity: 0 }}
            className="fixed inset-0 flex flex-col lg:flex-row bg-cream overflow-y-auto lg:overflow-hidden z-[999999]"
            data-lenis-prevent="true"
          >
            {/* Left Side: Image Pane */}
            <div className="relative w-full lg:w-1/2 h-64 md:h-80 lg:h-screen shrink-0 order-first overflow-hidden bg-black">
              <Image 
                src="/HelixBio Images/age-gate-bg.webp" 
                alt="HelixBio Science" 
                fill
                priority
                className={`object-cover transition-[transform,opacity,filter] duration-1000 will-change-[transform,opacity,filter] ${isDenied ? 'opacity-30 scale-110 grayscale blur-md' : 'opacity-90 hover:scale-105'}`}
              />
              <div className="absolute inset-0 bg-black/20 pointer-events-none" />
              
              {/* Red Denied Gradient */}
              <div className={`absolute inset-0 bg-red-950/80 pointer-events-none transition-opacity duration-1000 will-change-opacity ${isDenied ? 'opacity-100' : 'opacity-0'}`} />
              
              {/* Logo */}
              <div className={`absolute top-6 left-6 md:top-12 md:left-12 w-28 md:w-48 h-12 md:h-24 pointer-events-none transition-opacity duration-500 will-change-opacity ${isDenied ? 'opacity-20' : 'opacity-100'}`}>
                <Image 
                  src="/HelixBio Images/hb-logo.webp" 
                  alt="HelixBio Logo" 
                  fill
                  priority
                  className="object-contain drop-shadow-2xl brightness-0 invert"
                />
              </div>
            </div>

            {/* Right Side: Content Pane */}
            <div 
              className="relative w-full lg:w-1/2 flex-1 lg:h-screen flex flex-col bg-white order-last lg:overflow-y-auto overflow-x-hidden"
              data-lenis-prevent="true"
            >
              <AnimatePresence mode="wait">
                {!isDenied ? (
                  <motion.div 
                    key="verify"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full max-w-2xl px-6 py-8 md:py-10 md:px-16 lg:px-24 flex flex-col lg:justify-center min-h-full mx-auto"
                  >
                    <div className="flex-shrink-0">
                      <p className="font-bold tracking-[0.3em] uppercase text-ink text-[10px] md:text-sm mb-3">
                        {t('restrictedAccess')}
                      </p>
                      <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-ink mb-6 tracking-tighter font-heading uppercase leading-none">
                        {t('titleLine1')}<br /> {t('titleLine2')}
                      </h2>

                      <div className="w-12 h-[4px] bg-primary mb-8" />

                      <div className="flex flex-col sm:flex-row w-full gap-4 max-w-lg mb-10">
                        <div className="flex-1">
                          <FluidButton
                            onClick={handleVerify}
                            text={t('confirmButton')}
                            variant="dark"
                            className="w-full min-w-full"
                          />
                        </div>
                        <button
                          onClick={handleDeny}
                          className="flex-1 bg-transparent text-ink border-2 border-ink/20 px-6 py-4 rounded-[10px] font-bold uppercase tracking-[0.2em] text-xs md:text-sm hover:bg-black/5 hover:border-black/50 transition-all active:scale-95 duration-200"
                        >
                          {t('denyButton')}
                        </button>
                      </div>

                      <div className="text-ink/80 text-sm md:text-lg leading-relaxed mb-10 space-y-4 md:space-y-6 font-medium">
                        <p>
                          <strong className="text-ink block mb-2 text-base md:text-xl uppercase tracking-widest">{t('disclaimerLabel')}</strong>
                          {t.rich('disclaimerText', { strong: (chunks) => <strong>{chunks}</strong> })}
                        </p>
                        <p className="font-bold text-ink text-base md:text-xl">
                          {t('consentText')}
                        </p>
                      </div>

                      <div className="mt-8 text-ink/60 text-[9px] md:text-[10px] uppercase tracking-[0.2em] pb-10 lg:pb-0">
                        {t('agreementPrefix')} <Link href="/terms-and-conditions" className="hover:text-primary transition-colors underline underline-offset-4 font-bold">{t('termsLink')}</Link>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="denied"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-xl px-6 py-10 md:px-16 flex flex-col items-center justify-start lg:justify-center text-center min-h-full mx-auto"
                  >
                    <div className="flex flex-col items-center flex-shrink-0 pb-10 lg:pb-0">
                      <motion.div 
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", damping: 15, delay: 0.2 }}
                      className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(220,38,38,0.3)] mb-10"
                    >
                      <Lock className="w-12 h-12 text-white" />
                    </motion.div>

                    <h2 className="text-5xl md:text-7xl font-black text-red-600 mb-6 tracking-tighter font-heading uppercase leading-none">
                      {t('deniedTitle')}
                    </h2>

                    <div className="w-16 h-[4px] bg-red-600 mb-8 mx-auto" />

                    <div className="text-ink/80 text-base md:text-xl leading-relaxed mb-12 max-w-md font-medium mx-auto">
                      <p>
                        {t('deniedText')}
                      </p>
                    </div>

                    <button
                      onClick={handleGoBack}
                      className="text-sm uppercase tracking-[0.2em] font-bold text-ink/40 hover:text-ink transition-colors border-b-2 border-ink/20 pb-1 hover:border-ink"
                    >
                      {t('goBack')}
                    </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
