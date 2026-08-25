'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, Info, ShoppingCart } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ContactHero } from './ContactHero'
import { SharedFaqSection } from '@/components/shared/SharedFaqSection'
import { ContactForm } from './ContactForm'
import { PinterestGlassCard } from '@/components/home/PinterestGlassCard'

export function ContactClient() {
  const t = useTranslations('content.contactClient')

  const contactFaqs = [
    {
      question: t('faqs.contactInfo.question'),
      answer: (
        <>
          {t.rich('faqs.contactInfo.answer', {
            email: (chunks) => <a href="mailto:support@helixbiochem.com" className="text-primary font-bold underline underline-offset-4 hover:text-ink transition-colors !cursor-pointer pointer-events-auto" data-hide-cursor="true">{chunks}</a>,
          })}
        </>
      )
    },
    {
      question: t('faqs.usLabsContact.question'),
      answer: t('faqs.usLabsContact.answer')
    },
    {
      question: t('faqs.locationShipping.question'),
      answer: t('faqs.locationShipping.answer')
    },
    {
      question: t('faqs.serviceHours.question'),
      answer: t('faqs.serviceHours.answer')
    }
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-screen relative font-sans text-ink overflow-hidden">
      
      <ContactHero />

      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-10 py-20 md:py-32 relative z-10">
        
        {/* Contact Cards Grid */}
        <div className="flex flex-col gap-8 mb-24 relative max-w-md mx-auto">
          
          <motion.a
            href="mailto:support@helixbiochem.com"
            className="block w-full h-full cursor-pointer hover:-translate-y-2 transition-transform duration-500 ease-out"
          >
            <PinterestGlassCard
              title={t('supportEmailTitle')}
              description={t('supportEmailDescription')}
              icon={<Mail className="w-5 h-5" />}
              tag="support@helixbiochem.com"
              microcopy={t('supportEmailMicrocopy')}
              scrollFanning={true}
            />
          </motion.a>





        </div>

        {/* Contact Form Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-32"
        >
          <ContactForm />
        </motion.div>

        {/* FAQ Section */}
        <div className="w-screen relative left-1/2 -ml-[50vw]">
          <SharedFaqSection
            title={t('faqTitle')}
            subtitle={t('faqSubtitle')}
            faqs={contactFaqs}
          />
        </div>

          {/* Disclaimer Alert Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="mt-16 pt-8 border-t border-ink/10"
          >
            <div className="relative overflow-hidden rounded-3xl bg-ink/10 p-[1px] group transition-all duration-500 hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              
              <div className="relative bg-ink h-full w-full rounded-[23px] p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 overflow-hidden">
                <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.15] mix-blend-screen z-0">
                  <filter id="contact-noise">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                  </filter>
                  <rect width="100%" height="100%" filter="url(#contact-noise)" />
                </svg>
                
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary relative z-10">
                  <Info size={24} strokeWidth={1.5} />
                </div>
                
                <div className="relative z-10 text-cream/70 text-sm md:text-base font-light leading-relaxed">
                  <span className="font-heading font-bold text-primary tracking-[0.15em] uppercase text-xs block mb-1.5">
                    {t('disclaimerLabel')}
                  </span>
                  {t.rich('disclaimerText', {
                    strong: (chunks) => <strong className="text-white font-medium">{chunks}</strong>,
                  })}
                </div>
              </div>
            </div>
          </motion.div>

      </main>
    </div>
  )
}
