'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { FluidButton } from '@/components/ui/fluid-button'

import { submitContactForm } from '@/app/(frontend)/contact-us/actions'

export function ContactForm() {
  const t = useTranslations('content.contactForm')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const form = e?.currentTarget
      if (!form) {
        setIsSubmitting(false)
        return
      }

      const formData = new FormData(form)
      const res = await submitContactForm(formData)
      
      if (res?.error) {
        alert(res.error) // Or show a toast message
      } else {
        setIsSubmitted(true)
        form.reset()
        // Reset after showing success message
        setTimeout(() => setIsSubmitted(false), 3000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto bg-white rounded-2xl md:rounded-3xl border border-ink/5 shadow-sm overflow-visible text-left p-8 sm:p-12 md:p-16 mb-24 font-sans">
      
      <div className="relative z-10 mb-10 md:mb-16">
        <h3 className="font-heading font-black text-3xl md:text-5xl uppercase tracking-tighter text-ink mb-3">{t('heading')}</h3>
        <p className="text-ink/60 font-light text-base md:text-lg">{t('subheading')}</p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-6 w-full text-left">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="flex flex-col gap-3">
            <label htmlFor="name" className="text-xs font-mono tracking-[0.2em] uppercase font-bold text-ink/50 pl-4">{t('nameLabel')}</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full bg-[#FAFAFA] border border-ink/10 rounded-xl px-6 py-4 text-ink placeholder-ink/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300"
              placeholder={t('namePlaceholder')}
            />
          </div>
          <div className="flex flex-col gap-3">
            <label htmlFor="email" className="text-xs font-mono tracking-[0.2em] uppercase font-bold text-ink/50 pl-4">{t('emailLabel')}</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full bg-[#FAFAFA] border border-ink/10 rounded-xl px-6 py-4 text-ink placeholder-ink/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300"
              placeholder={t('emailPlaceholder')}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <label htmlFor="subject" className="text-xs font-mono tracking-[0.2em] uppercase font-bold text-ink/50 pl-4">{t('subjectLabel')}</label>
          <input
            type="text"
            id="subject"
            name="subject"
            required
            className="w-full bg-[#FAFAFA] border border-ink/10 rounded-xl px-6 py-4 text-ink placeholder-ink/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300"
            placeholder={t('subjectPlaceholder')}
          />
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <label htmlFor="message" className="text-xs font-mono tracking-[0.2em] uppercase font-bold text-ink/50 pl-4">{t('messageLabel')}</label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            className="w-full bg-[#FAFAFA] border border-ink/10 rounded-xl px-6 py-5 text-ink placeholder-ink/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 resize-none"
            placeholder={t('messagePlaceholder')}
          />
          <div className="flex justify-end mt-6">
            <FluidButton
              type="button"
              onClick={isSubmitting || isSubmitted ? undefined : () => formRef.current?.requestSubmit()}
              text={<>{isSubmitting ? t('sending') : isSubmitted ? t('sent') : t('submit')}</>}
              className={isSubmitting || isSubmitted ? 'opacity-70' : ''}
            />
          </div>
        </div>
      </form>
    </div>
  )
}
