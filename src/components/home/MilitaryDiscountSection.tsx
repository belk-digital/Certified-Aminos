'use client'

import React, { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Upload, CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ShinyText } from '@/components/ui/ShinyText'

const branches = [
  { id: 'army', key: 'army' },
  { id: 'navy', key: 'navy' },
  { id: 'airforce', key: 'airforce' },
  { id: 'marines', key: 'marines' },
  { id: 'coastguard', key: 'coastguard' },
  { id: 'spaceforce', key: 'spaceforce' },
  { id: 'other', key: 'other' },
]

export function MilitaryDiscountSection() {
  const t = useTranslations('home.militaryDiscount')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedFile) {
      alert('Please upload your ID photo.')
      return
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('Your ID photo is too large. Please upload an image smaller than 5MB.')
      return
    }
    if (!selectedBranch) {
      alert('Please select a service branch.')
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.append('branch', selectedBranch)
    formData.append('idPhoto', selectedFile)

    setIsLoading(true)
    try {
      const res = await fetch('/api/military/submit', { method: 'POST', body: formData })
      if (res.ok) {
        setIsSubmitted(true)
      } else {
        alert('There was an error submitting your application. Please try again.')
      }
    } catch (err) {
      alert('An unexpected error occurred.')
    }
    setIsLoading(false)
  }

  return (
    <section className="w-full relative py-16 md:py-24 px-8 flex justify-center items-center font-inter overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: "url('/military-discount-banner.png')" }}
      ></div>
      <div className="absolute inset-0 bg-[#060a12]/30 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center text-white">
        {/* Left Column: Heading */}
        <div className="flex flex-col items-start text-left">
          <div className="flex items-center gap-3 mb-4">
            <svg width="24" height="28" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white opacity-90">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polygon points="12 8 13.5 11 17 11 14 13 15 16.5 12 14.5 9 16.5 10 13 7 11 10.5 11" />
              <path d="M5 24l7 3 7-3" strokeWidth="1.5" />
              <path d="M7 26l5 2 5-2" strokeWidth="1.5" />
            </svg>
            <span className="text-[11px] md:text-xs text-blue-300 tracking-[0.25em] font-semibold uppercase mt-1">
              {t('eyebrow')}
            </span>
          </div>

          <h2 className="font-syncopate text-4xl md:text-5xl lg:text-[4rem] font-medium tracking-wide uppercase leading-tight mb-0">
            {t('titleLine1')}
          </h2>

          <div className="font-vipnagorgialla font-bold text-8xl md:text-9xl lg:text-[10rem] tracking-tight leading-none my-6 drop-shadow-2xl opacity-90">
            <ShinyText text="30%" color="#dc2626" shineColor="#ffffff" speed={3.5} />
          </div>

          <h2 className="font-syncopate text-4xl md:text-5xl lg:text-[4rem] font-medium tracking-wide uppercase leading-tight mt-0 mb-4">
            {t('titleLine2')}
          </h2>

          <div className="flex items-center gap-4 w-full max-w-sm mb-4 opacity-70">
            <div className="h-px bg-gradient-to-r from-blue-400 to-transparent flex-1"></div>
          </div>

          <p className="text-gray-200 text-sm md:text-base leading-relaxed max-w-lg mb-6 font-light">
            {t('description')}
          </p>
        </div>

        {/* Right Column: real verification form */}
        <div className="relative bg-white/5 border border-white/10 rounded-[32px] p-8 lg:p-10 backdrop-blur-[24px] shadow-2xl flex flex-col h-fit overflow-hidden">
          <div className="absolute left-6 top-16 bottom-16 w-4 flex flex-col gap-[3px] opacity-40 pointer-events-none">
            <div className="w-full h-[2px] bg-white"></div>
            <div className="w-full h-[1px] bg-white"></div>
            <div className="w-3/4 h-[2px] bg-white"></div>
            <div className="w-full h-[3px] bg-white"></div>
            <div className="w-1/2 h-[1px] bg-white"></div>
            <div className="w-full h-[2px] bg-white"></div>
            <div className="w-full h-[1px] bg-white"></div>
            <div className="w-3/4 h-[3px] bg-white"></div>
            <div className="w-full h-[1px] bg-white"></div>
            <div className="w-1/2 h-[2px] bg-white"></div>
            <div className="w-full h-[1px] bg-white"></div>
            <div className="w-3/4 h-[2px] bg-white"></div>
            <div className="w-full h-[1px] bg-white"></div>
          </div>

          <div className="pl-10 flex flex-col h-full">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col h-full"
                >
                  <div className="mb-8">
                    <div className="font-inter font-light text-2xl md:text-3xl tracking-widest uppercase flex items-start gap-2 leading-tight">
                      <div>{t('formTitle')}</div>
                    </div>
                    <p className="text-[10px] md:text-[11px] font-light uppercase tracking-[0.15em] leading-[1.8] opacity-70 max-w-sm mt-4">
                      {t.rich('privacyNoticeText', {
                        redact: (chunks) => <span className="font-bold text-white">{chunks}</span>,
                        destroyed: (chunks) => <span className="font-bold text-primary">{chunks}</span>,
                      })}
                    </p>
                  </div>

                  <div className="flex flex-col gap-6 w-full">
                    {/* 01. Name + Email */}
                    <div className="border-b border-white/30 pb-2">
                      <p className="text-[9px] md:text-[10px] font-medium uppercase tracking-[0.2em] opacity-60 mb-2">
                        01. {t('fullNameLabel')}
                      </p>
                      <input
                        required
                        type="text"
                        name="fullName"
                        placeholder={t('fullNamePlaceholder')}
                        className="w-full bg-transparent outline-none text-sm font-semibold text-white placeholder:text-white/40 mb-3"
                      />
                      <p className="text-[9px] md:text-[10px] font-medium uppercase tracking-[0.2em] opacity-60 mb-2">
                        {t('emailLabel')}
                      </p>
                      <input
                        required
                        type="email"
                        name="email"
                        placeholder={t('emailPlaceholder')}
                        className="w-full bg-transparent outline-none text-sm font-semibold text-white placeholder:text-white/40"
                      />
                    </div>

                    {/* 02. Service branch */}
                    <div className="border-b border-white/30 pb-2 relative" ref={dropdownRef}>
                      <p className="text-[9px] md:text-[10px] font-medium uppercase tracking-[0.2em] opacity-60 mb-2">
                        02. {t('serviceBranchLabel')}
                      </p>
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        <span className={`text-sm ${selectedBranch ? 'text-white font-semibold' : 'text-white/40 font-medium'}`}>
                          {selectedBranch
                            ? t(`branches.${branches.find((b) => b.id === selectedBranch)?.key}`)
                            : t('selectBranchPlaceholder')}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-white/60 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>

                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-20 w-full top-[105%] bg-navy-deep border border-white/10 shadow-2xl rounded-2xl overflow-hidden py-2"
                          >
                            {branches.map((branch) => (
                              <button
                                key={branch.id}
                                type="button"
                                onClick={() => {
                                  setSelectedBranch(branch.id)
                                  setIsDropdownOpen(false)
                                }}
                                className={`w-full text-left px-5 py-3 text-sm transition-colors font-medium ${
                                  selectedBranch === branch.id
                                    ? 'bg-primary/10 text-primary font-bold'
                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                                }`}
                              >
                                {t(`branches.${branch.key}`)}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* 03. Upload documents */}
                    <div className="border-b border-white/30 pb-2">
                      <p className="text-[9px] md:text-[10px] font-medium uppercase tracking-[0.2em] opacity-60 mb-2">
                        03. {t('idPhotoLabel')}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/40 font-medium truncate max-w-[200px]">
                          {selectedFile ? (
                            <span className="text-white font-semibold">{selectedFile.name}</span>
                          ) : (
                            'Max 5MB (Secure)'
                          )}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              setSelectedFile(e.target.files[0])
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white/10 border border-white/20 text-white hover:border-primary/50 hover:text-primary transition-all rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {t('uploadButton')}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-10 flex justify-center w-full disabled:opacity-50"
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-[0.25em] opacity-90 hover:opacity-100 transition-opacity">
                      {isLoading ? 'Submitting...' : t('submitButton')}
                    </span>
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center py-16"
                >
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black font-heading text-white uppercase tracking-tighter mb-4">
                    {t('successTitle')}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed mb-8 max-w-sm font-medium">
                    {t('successText')}
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-primary transition-colors border-b border-white/20 hover:border-primary pb-1"
                  >
                    {t('submitAnother')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
