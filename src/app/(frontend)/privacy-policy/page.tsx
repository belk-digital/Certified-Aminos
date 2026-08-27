'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { FadeUp } from '@/components/motion/FadeUp'

export default function PrivacyPolicyPage() {
  const t = useTranslations('legal.privacyPolicy')
  const [activeSection, setActiveSection] = useState('intro')

  const sections = [
    { id: 'intro', label: 'Introduction' },
    { id: 'section1', label: t('section1Title') },
    { id: 'section2', label: t('section2Title') },
    { id: 'section3', label: t('section3Title') },
    { id: 'section4', label: t('section4Title') },
    { id: 'section5', label: t('section5Title') },
    { id: 'section6', label: t('section6Title') },
    { id: 'section7', label: t('section7Title') },
    { id: 'contact', label: t('contactTitle') },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let maxVisible = 0
        let mostVisibleId = activeSection
        
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxVisible) {
            maxVisible = entry.intersectionRatio
            mostVisibleId = entry.target.id
          }
        })
        
        if (maxVisible > 0) {
          setActiveSection(mostVisibleId)
        }
      },
      { rootMargin: '-10% 0px -80% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    )

    sections.forEach((section) => {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [t, activeSection])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const yOffset = -100 
      const y = el.getBoundingClientRect().top + window.scrollY + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <main className="bg-[#fbfcff] min-h-screen text-ink font-sans pb-32">
      {/* Left-Aligned Header Section */}
      <div className="relative pt-40 pb-16 px-4 md:px-8 bg-white border-b border-black/5 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-60" />
        <div className="max-w-7xl mx-auto text-left relative z-10 flex flex-col items-start gap-6">
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-[#1e5661] mb-4"
            >
              {t('eyebrow')}
            </motion.h2>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-black"
            >
              {t('titleLine1')} <span className="text-[#84d0d9]">{t('titleLine2')}</span>
            </motion.h1>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex items-center mt-2"
          >
            <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-black/40 font-bold">
              {t('effectiveDate')}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-12 md:pt-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        
        {/* Left Sidebar (Desktop) */}
        <div className="hidden lg:block lg:col-span-3 relative">
          <div data-lenis-prevent className="sticky top-32 flex flex-col gap-2 max-h-[calc(100vh-160px)] overflow-y-auto pb-12 pr-4 custom-scrollbar">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-black/30 mb-4 px-4">Contents</h3>
            {sections.map((section, idx) => (
              <button
                key={section.id}
                onClick={() => scrollTo(section.id)}
                className={`text-left flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group ${activeSection === section.id ? 'bg-white shadow-md border border-black/5' : 'hover:bg-black/5'}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold font-mono transition-colors ${activeSection === section.id ? 'text-[#84d0d9]' : 'text-black/30'}`}>
                    {String(idx).padStart(2, '0')}
                  </span>
                  <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${activeSection === section.id ? 'text-[#1e5661]' : 'text-black/60 group-hover:text-black'}`}>
                    {section.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-9">
          <div className="bg-white rounded-[2rem] p-8 md:p-12 lg:p-16 shadow-xl shadow-black/5 border border-black/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#84d0d9]/10 via-transparent to-transparent pointer-events-none" />
            
            <div className="prose prose-lg prose-headings:font-heading prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-black prose-p:text-black/70 prose-p:leading-relaxed prose-li:text-black/70 prose-li:leading-relaxed prose-a:text-[#1e5661] hover:prose-a:text-[#84d0d9] max-w-none relative z-10">
              
              <section id="intro" className="mb-20 scroll-mt-32">
                <p className="text-lg md:text-xl leading-relaxed text-black/80 font-medium font-sans">
                  {t('intro')}
                </p>
              </section>

              <div className="space-y-20">
                <section id="section1" className="scroll-mt-32">
                  <h2 className="text-xl md:text-2xl uppercase mb-6 flex items-center gap-4">
                    <span className="text-black/20 font-mono text-lg font-bold">01.</span> 
                    {t('section1Title')}
                  </h2>
                  <p className="text-[15px] leading-relaxed">{t('section1Text')}</p>
                  <ul className="list-disc pl-5 space-y-2 mt-4 text-[15px] marker:text-[#1e5661]">
                    <li><strong>{t('section1Item1Label')}</strong> {t('section1Item1Text')}</li>
                    <li><strong>{t('section1Item2Label')}</strong> {t('section1Item2Text')}</li>
                    <li><strong>{t('section1Item3Label')}</strong> {t('section1Item3Text')}</li>
                    <li><strong>{t('section1Item4Label')}</strong> {t('section1Item4Text')}</li>
                    <li><strong>{t('section1Item5Label')}</strong> {t('section1Item5Text')}</li>
                  </ul>
                </section>

                <section id="section2" className="scroll-mt-32">
                  <h2 className="text-xl md:text-2xl uppercase mb-6 flex items-center gap-4">
                    <span className="text-black/20 font-mono text-lg font-bold">02.</span> 
                    {t('section2Title')}
                  </h2>
                  <p className="text-[15px] leading-relaxed">{t('section2Intro')}</p>
                  <ul className="list-disc pl-5 space-y-2 mt-4 text-[15px] marker:text-[#1e5661]">
                    <li>{t('section2Item1')}</li>
                    <li>{t('section2Item2')}</li>
                    <li>{t('section2Item3')}</li>
                    <li>{t('section2Item4')}</li>
                    <li>{t('section2Item5')}</li>
                  </ul>
                </section>

                <section id="section3" className="scroll-mt-32">
                  <h2 className="text-xl md:text-2xl uppercase mb-6 flex items-center gap-4">
                    <span className="text-black/20 font-mono text-lg font-bold">03.</span> 
                    {t('section3Title')}
                  </h2>
                  <p className="text-[15px] leading-relaxed">{t('section3Intro')}</p>
                  <ul className="list-disc pl-5 space-y-2 mt-4 text-[15px] marker:text-[#1e5661]">
                    <li><strong>{t('section3Item1Label')}</strong> {t('section3Item1Text')}</li>
                    <li><strong>{t('section3Item2Label')}</strong> {t('section3Item2Text')}</li>
                    <li><strong>{t('section3Item3Label')}</strong> {t('section3Item3Text')}</li>
                    <li><strong>{t('section3Item4Label')}</strong> {t('section3Item4Text')}</li>
                  </ul>
                </section>

                <section id="section4" className="scroll-mt-32">
                  <h2 className="text-xl md:text-2xl uppercase mb-6 flex items-center gap-4">
                    <span className="text-black/20 font-mono text-lg font-bold">04.</span> 
                    {t('section4Title')}
                  </h2>
                  <p className="text-[15px] leading-relaxed">{t('section4Text1')}</p>
                  <p className="text-[15px] leading-relaxed mt-4">{t('section4Text2')}</p>
                </section>

                <section id="section5" className="scroll-mt-32">
                  <h2 className="text-xl md:text-2xl uppercase mb-6 flex items-center gap-4">
                    <span className="text-black/20 font-mono text-lg font-bold">05.</span> 
                    {t('section5Title')}
                  </h2>
                  <p className="text-[15px] leading-relaxed">{t('section5Intro')}</p>
                  <ul className="list-disc pl-5 space-y-2 mt-4 text-[15px] marker:text-[#1e5661]">
                    <li>{t('section5Item1')}</li>
                    <li>{t('section5Item2')}</li>
                    <li>{t('section5Item3')}</li>
                    <li>{t('section5Item4')}</li>
                  </ul>
                  <p className="text-[15px] leading-relaxed mt-4">
                    {t('section5ContactText')}<br/>
                    {t('section5EmailLabel')} <a href="mailto:support@certifiedaminos.com" className="hover:text-[#1e5661] transition-colors break-all">support@certifiedaminos.com</a>
                  </p>
                </section>

                <section id="section6" className="scroll-mt-32">
                  <h2 className="text-xl md:text-2xl uppercase mb-6 flex items-center gap-4">
                    <span className="text-black/20 font-mono text-lg font-bold">06.</span> 
                    {t('section6Title')}
                  </h2>
                  <p className="text-[15px] leading-relaxed">{t('section6Intro')}</p>
                  <ul className="list-disc pl-5 space-y-2 mt-4 text-[15px] marker:text-[#1e5661]">
                    <li>{t('section6Item1')}</li>
                    <li>{t('section6Item2')}</li>
                    <li>{t('section6Item3')}</li>
                  </ul>
                </section>

                <section id="section7" className="scroll-mt-32">
                  <h2 className="text-xl md:text-2xl uppercase mb-6 flex items-center gap-4">
                    <span className="text-black/20 font-mono text-lg font-bold">07.</span> 
                    {t('section7Title')}
                  </h2>
                  <p className="text-[15px] leading-relaxed">{t('section7Text1')}</p>
                  <p className="text-[15px] leading-relaxed mt-4">{t('section7Text2')}</p>
                </section>

                {/* Contact Section */}
                <section id="contact" className="scroll-mt-32 mt-12 pt-12 border-t border-black/10">
                  <h2 className="text-xl md:text-2xl uppercase mb-4 font-black font-heading tracking-tighter text-black">
                    {t('contactTitle')}
                  </h2>
                  <p className="mb-8 text-black/70 text-[15px]">
                    {t('contactIntro')}
                  </p>
                  
                  <div className="flex flex-col gap-6">

                    <div>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 block mb-1">{t('supportIssuesLabel')}</span>
                      <a href="mailto:support@certifiedaminos.com" className="text-base font-medium text-black hover:text-[#1e5661] transition-colors">support@certifiedaminos.com</a>
                    </div>

                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
