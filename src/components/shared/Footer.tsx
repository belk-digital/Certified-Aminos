'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Link } from '@/i18n/navigation'
import { ArrowRight, Check } from 'lucide-react'
import { useLenis } from 'lenis/react'

const FooterContent = () => {
  const lenis = useLenis()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to subscribe')
      }

      setStatus('success')
      setMessage('Subscribed!')
      const form = e.target as HTMLFormElement
      form.reset()

      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    } catch (err: any) {
      console.error(err)
      setStatus('error')
      setMessage(err.message || 'Error')

      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    }
  }

  const handleScrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0, {
        duration: 2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const navLinks = (
    <div className="flex gap-12">
      <div className="flex flex-col gap-4">
        <Link href="/shop" className="text-navy text-base font-medium hover:text-[#1a42a0] transition-colors">
          Shop
        </Link>
        <Link href="/shop" className="text-navy text-base font-medium hover:text-[#1a42a0] transition-colors">
          Categories
        </Link>
        <Link href="/peptide-calculator" className="text-navy text-base font-medium hover:text-[#1a42a0] transition-colors">
          Calculator
        </Link>
        <Link href="/about-us" className="text-navy text-base font-medium hover:text-[#1a42a0] transition-colors">
          About
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        <Link href="/blog" className="text-navy text-base font-medium hover:text-[#1a42a0] transition-colors">
          Blog
        </Link>
        <Link href="/faq" className="text-navy text-base font-medium hover:text-[#1a42a0] transition-colors">
          FAQ
        </Link>
        <Link href="/contact-us" className="text-navy text-base font-medium hover:text-[#1a42a0] transition-colors">
          Contact
        </Link>
        <Link href="/affiliates" className="text-navy text-base font-medium hover:text-[#1a42a0] transition-colors">
          Affiliates
        </Link>
      </div>
    </div>
  )

  return (
    <footer
      className="relative w-full flex flex-col justify-end overflow-hidden box-border pt-32 md:pt-40 pb-48 md:pb-16 px-6 md:px-16"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #e2effa 25%, #76a3da 60%, #0a1323 100%)',
      }}
    >
      <div className="w-full flex flex-col md:flex-row justify-between gap-12 relative z-10">
        {/* Left column */}
        <div className="flex flex-col justify-between flex-1 gap-12 md:gap-0">
          <div className="max-w-[400px] order-1">
            <h2 className="text-2xl font-bold text-navy mb-4">Stay connected</h2>
            <p className="text-[#5e6b7c] text-[0.95rem] leading-relaxed mb-8">
              Join our community for exclusive research insights and product updates.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-4">
              <input
                type="email"
                name="email"
                placeholder={message || 'smith@gmail.com'}
                required
                disabled={status === 'loading' || status === 'success'}
                className={`footer-newsletter-input flex-1 px-4 py-3 border rounded-lg outline-none backdrop-blur-sm transition-all disabled:opacity-80 ${
                  status === 'success'
                    ? 'text-green-700 border-green-400 bg-green-50'
                    : status === 'error'
                      ? 'text-red-700 border-red-400 bg-red-50'
                      : 'text-navy border-white/40 bg-white/30 focus:border-[#1a42a0] focus:bg-white/50'
                }`}
              />
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                aria-label="Subscribe to newsletter"
                className="w-[45px] h-[45px] shrink-0 rounded-lg bg-[#1a42a0] hover:bg-[#123075] text-white flex items-center justify-center transition-colors disabled:opacity-60"
              >
                {status === 'loading' ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : status === 'success' ? (
                  <Check className="w-5 h-5" strokeWidth={2.5} />
                ) : (
                  <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                )}
              </button>
            </form>
          </div>

          {/* Mobile-only nav — shown above the wordmark on small screens; desktop uses the right column below */}
          <div className="order-2 flex md:hidden">
            {navLinks}
          </div>

          <div className="order-3 md:order-2 mt-8 md:mt-40">
            <div className="font-syncopate text-white uppercase leading-[0.9] tracking-tight mb-10 text-[clamp(2rem,9.5vw,8rem)] md:text-[5rem] lg:text-[8rem] font-semibold">
              Certified
              <br />
              Aminos
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center flex-wrap gap-2 sm:gap-4 text-[#aed2f2] text-sm">
                <span>© {new Date().getFullYear()} Certified Aminos</span>
                <span className="flex items-center gap-2 sm:gap-4">
                  <span className="opacity-60">•</span>
                  <Link href="/privacy-policy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </span>
                <span className="flex items-center gap-2 sm:gap-4">
                  <span className="opacity-60">•</span>
                  <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </span>
              </div>
              <div className="text-[#aed2f2] text-sm">
                Designed and developed by{' '}
                <a
                  href="https://belkdigital.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white transition-colors"
                >
                  Belk Digital
                </a>
              </div>
            </div>

            <button
              onClick={handleScrollToTop}
              className="group hidden md:flex items-center gap-4 mt-8 text-white/70 hover:text-white transition-colors w-fit"
            >
              <span className="text-sm font-medium tracking-wide">Back to top</span>
              <div className="w-9 h-9 rounded-full bg-white text-navy-deep flex items-center justify-center group-hover:-translate-y-0.5 transition-transform">
                <ArrowRight className="w-4 h-4 -rotate-90" strokeWidth={2.5} />
              </div>
            </button>
          </div>
        </div>

        {/* Right column - nav (desktop only; mobile shows navLinks above the wordmark instead) */}
        <div className="hidden md:flex md:flex-col md:pl-16">
          {navLinks}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 right-0 max-w-[70vw] md:max-w-[45vw] z-0">
        <img src="/footer-image.png" alt="Products" className="w-full h-auto block" />
      </div>
    </footer>
  )
}

export function Footer() {
  const [, setFooterHeight] = useState(0)
  const footerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!footerRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      setFooterHeight(entries[0].contentRect.height)
    })
    resizeObserver.observe(footerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div id="global-footer" ref={footerRef} className="w-full relative z-40 bg-navy-deep print:hidden" style={{ pointerEvents: 'auto' }}>
      <FooterContent />
    </div>
  )
}
