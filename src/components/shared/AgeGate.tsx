'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLenis } from 'lenis/react'
import { ShieldCheck, ShieldAlert } from 'lucide-react'

const COOKIE_NAME = 'ca_age_verified'
const COOKIE_VALUE = '21'
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days = 2,592,000 seconds

function checkIsVerified(): boolean {
  if (typeof document === 'undefined') return false
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`))
  return match ? match[1] === COOKIE_VALUE : false
}

function setVerifiedCookie(): void {
  const expires = new Date(Date.now() + COOKIE_MAX_AGE * 1000).toUTCString()
  document.cookie = `${COOKIE_NAME}=${COOKIE_VALUE}; max-age=${COOKIE_MAX_AGE}; expires=${expires}; path=/; SameSite=Lax`
}

export function AgeGate() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDenied, setIsDenied] = useState(false)
  const [mounted, setMounted] = useState(false)

  const lenis = useLenis()
  const modalRef = useRef<HTMLDivElement>(null)
  const confirmBtnRef = useRef<HTMLButtonElement>(null)
  const goBackBtnRef = useRef<HTMLButtonElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Verify cookie on client mount
  useEffect(() => {
    setMounted(true)
    const verified = checkIsVerified()
    if (!verified) {
      setIsOpen(true)
    }
  }, [])

  // Lock background scroll when modal is open
  useEffect(() => {
    if (!isOpen) return

    const prevBodyOverflow = document.body.style.overflow
    const prevHtmlOverflow = document.documentElement.style.overflow

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    lenis?.stop()

    return () => {
      document.body.style.overflow = prevBodyOverflow
      document.documentElement.style.overflow = prevHtmlOverflow
      lenis?.start()
    }
  }, [isOpen, lenis])

  // Focus trap & prevent ESC bypass
  useEffect(() => {
    if (!isOpen) return

    // Remember previous active element to restore focus when closed
    if (!previousActiveElement.current) {
      previousActiveElement.current = document.activeElement as HTMLElement | null
    }

    // Auto-focus appropriate button
    const focusTimer = setTimeout(() => {
      if (isDenied) {
        goBackBtnRef.current?.focus()
      } else {
        confirmBtnRef.current?.focus()
      }
    }, 50)

    const handleKeyDown = (e: KeyboardEvent) => {
      // Strictly prevent ESC bypass
      if (e.key === 'Escape') {
        e.preventDefault()
        return
      }

      // Trap Tab key inside the modal
      if (e.key === 'Tab') {
        const modal = modalRef.current
        if (!modal) return

        const focusableSelector =
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        const focusable = Array.from(modal.querySelectorAll<HTMLElement>(focusableSelector))

        if (focusable.length === 0) {
          e.preventDefault()
          return
        }

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === first || !modal.contains(document.activeElement)) {
            e.preventDefault()
            last?.focus()
          }
        } else {
          if (document.activeElement === last || !modal.contains(document.activeElement)) {
            e.preventDefault()
            first?.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(focusTimer)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isDenied])

  const handleConfirm = useCallback(() => {
    setVerifiedCookie()
    setIsOpen(false)
    // Return focus to previous element on page
    if (previousActiveElement.current) {
      previousActiveElement.current.focus()
      previousActiveElement.current = null
    }
  }, [])

  const handleDecline = useCallback(() => {
    setIsDenied(true)
  }, [])

  const handleGoBack = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }, [])

  // Never render before mounting on client or if cookie is valid
  if (!mounted || !isOpen) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-gate-heading"
          aria-describedby="age-gate-description"
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto pointer-events-auto select-none bg-black/40 backdrop-blur-md"
          data-lenis-prevent="true"
        >
          {/* Centered Modal Card (dismissible ONLY via buttons; no click-outside dismiss) */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[90vw] sm:max-w-[520px] bg-[#0c1527]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] p-6 sm:p-10 text-center overflow-hidden my-auto"
          >
            {/* Top brand accent gradient */}
            <div
              className={`absolute top-0 inset-x-0 h-[2px] ${
                isDenied
                  ? 'bg-gradient-to-r from-transparent via-red-500 to-transparent'
                  : 'bg-gradient-to-r from-transparent via-[#dcf53b] to-transparent'
              }`}
            />

            {!isDenied ? (
              /* Standard 21+ Verification State */
              <div className="flex flex-col items-center">
                {/* Brand Badge Icon */}
                <div className="w-12 h-12 rounded-full bg-[#dcf53b]/10 border border-[#dcf53b]/30 flex items-center justify-center mb-5 text-[#dcf53b]">
                  <ShieldCheck className="w-6 h-6 stroke-[2]" />
                </div>

                {/* Eyebrow */}
                <p className="font-syncopate text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-[#dcf53b] uppercase mb-2">
                  AGE VERIFICATION
                </p>

                {/* Heading */}
                <h2
                  id="age-gate-heading"
                  className="font-syncopate text-xl sm:text-2xl md:text-[26px] font-extrabold tracking-tight text-white uppercase mb-4 leading-snug"
                >
                  RESEARCH PURPOSES ONLY
                </h2>

                {/* Divider */}
                <div className="w-10 h-[2px] bg-[#dcf53b] mb-5 opacity-75" />

                {/* Body Copy */}
                <p
                  id="age-gate-description"
                  className="font-sans text-sm sm:text-[15px] leading-relaxed text-slate-300 mb-8 max-w-md mx-auto select-text font-normal"
                >
                  The products on this website are strictly for in-vitro laboratory research use only. By
                  entering, you confirm you are 21 years of age or older and understand these compounds
                  are not for human or veterinary use.
                </p>

                {/* Action Buttons (Stacked vertically, min 48px tap targets) */}
                <div className="flex flex-col gap-3 w-full">
                  <button
                    ref={confirmBtnRef}
                    onClick={handleConfirm}
                    type="button"
                    className="w-full min-h-[48px] bg-[#dcf53b] hover:bg-[#cbe628] active:scale-[0.99] text-[#0a1323] font-syncopate font-bold text-xs sm:text-[13px] tracking-[0.1em] uppercase rounded-xl transition-all duration-200 shadow-[0_4px_20px_rgba(220,245,59,0.25)] flex items-center justify-center px-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#dcf53b] focus:ring-offset-2 focus:ring-offset-[#0c1527]"
                  >
                    I AM 21 OR OLDER — ENTER
                  </button>

                  <button
                    onClick={handleDecline}
                    type="button"
                    className="w-full min-h-[48px] bg-white/5 hover:bg-white/10 active:scale-[0.99] text-slate-300 hover:text-white border border-white/15 font-syncopate font-semibold text-xs sm:text-[12px] tracking-[0.1em] uppercase rounded-xl transition-all duration-200 flex items-center justify-center px-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-[#0c1527]"
                  >
                    I AM UNDER 21
                  </button>
                </div>
              </div>
            ) : (
              /* Denied State */
              <div className="flex flex-col items-center">
                {/* Restricted Badge Icon */}
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-5 text-red-400">
                  <ShieldAlert className="w-6 h-6 stroke-[2]" />
                </div>

                {/* Denied Heading */}
                <h2
                  id="age-gate-heading"
                  className="font-syncopate text-xl sm:text-2xl md:text-[26px] font-extrabold tracking-tight text-white uppercase mb-4 leading-snug"
                >
                  ACCESS RESTRICTED
                </h2>

                {/* Divider */}
                <div className="w-10 h-[2px] bg-red-500 mb-5 opacity-75" />

                {/* Denied Body */}
                <p
                  id="age-gate-description"
                  className="font-sans text-sm sm:text-[15px] leading-relaxed text-slate-300 mb-8 max-w-md mx-auto select-text font-normal"
                >
                  You must be 21 years of age or older to enter this site.
                </p>

                {/* Single Go Back button calling history.back() */}
                <div className="w-full">
                  <button
                    ref={goBackBtnRef}
                    onClick={handleGoBack}
                    type="button"
                    className="w-full min-h-[48px] bg-white/10 hover:bg-white/15 active:scale-[0.99] text-white border border-white/20 font-sans font-semibold text-sm tracking-wide rounded-xl transition-all duration-200 flex items-center justify-center px-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-[#0c1527]"
                  >
                    Go back
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
