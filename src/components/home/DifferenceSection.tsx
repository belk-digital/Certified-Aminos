'use client'

import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

const STATS = [
  {
    value: "10,000+",
    label: "Vials Fulfilled",
    description: "Vials fulfilled to research labs and institutions across the USA."
  },
  {
    value: "99%+",
    label: "Guaranteed Purity",
    description: "Guaranteed purity, confirmed by third-party testing on every batch."
  },
  {
    value: "10+",
    label: "Years Experience",
    description: "Combined scientific expertise in peptide synthesis and quality assurance."
  },
  {
    value: "24/7",
    label: "Dedicated Support",
    description: "Our scientific support team is always available to answer your technical questions."
  }
]

export function DifferenceSection() {
  const t = useTranslations('home.difference') 
  
  return (
    <section className="bg-[#FAFAFA] py-16 md:py-24 relative font-sans overflow-hidden">
      <div className="container mx-auto px-4 md:px-10 max-w-[120rem]">

        <div className="mb-10 md:mb-16 max-w-3xl">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black text-ink leading-[1.05] tracking-tighter uppercase mb-4">
            {t('titleLine1')} {t('titleLine2')}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base md:text-lg leading-relaxed font-medium">
            {t('description')}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">

          {/* Left Column: Image with Badge */}
          <div className="w-full lg:w-[45%] relative rounded-[24px] md:rounded-[32px] overflow-hidden min-h-[400px] lg:min-h-[600px] shadow-sm group">

            {/* The Floating Badge */}
            <div className="absolute top-6 left-6 md:top-8 md:left-8 z-20 bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-white/60">
              <span className="text-ink font-bold text-sm tracking-tight">
                Why choose Certified Aminos?
              </span>
            </div>

            {/* The Image */}
            <Image
              src="/HelixBio Images/helixbio-as-routine.webp"
              alt={t('vialAlt')}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Soft gradient overlay just in case */}
            <div className="absolute inset-0 bg-black/5 pointer-events-none" />
          </div>

          {/* Right Column: 2x2 Stats Grid */}
          <div className="w-full lg:w-[55%] grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {STATS.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-[24px] md:rounded-[32px] p-8 md:p-10 flex flex-col min-h-[250px] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1"
              >
                <div className="mb-auto">
                  <h3 className="text-4xl md:text-[3.25rem] font-heading font-black text-ink leading-tight tracking-tighter mb-2">
                    {stat.value}
                  </h3>
                  <h4 className="text-lg md:text-xl font-bold text-ink/80 leading-tight">
                    {stat.label}
                  </h4>
                </div>
                
                <p className="text-[11px] md:text-[13px] text-ink/60 font-semibold uppercase tracking-wider leading-relaxed mt-12 md:mt-16">
                  {stat.description}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
