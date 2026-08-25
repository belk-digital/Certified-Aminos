'use client'

import React from 'react'
import { motion, Variants } from 'framer-motion'
import { Microscope, ShieldAlert, Activity, FileWarning, AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function ComplianceStatement() {
  const t = useTranslations('content.complianceStatement')
  const statements = [
    {
      icon: Microscope,
      text: t('statements.researchOnly'),
    },
    {
      icon: ShieldAlert,
      text: t('statements.notForHumanAnimalUse'),
    },
    {
      icon: Activity,
      text: t('statements.notForDiagnosisTreatment'),
    },
    {
      icon: FileWarning,
      text: t('statements.notFdaApproved'),
    }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const titleVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section className="py-32 lg:py-48 bg-ink relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:100px_100px]" />
        
        {/* Massive watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-[0.03]">
          <AlertTriangle className="w-[100vw] h-[100vw] max-w-[1200px] max-h-[1200px]" strokeWidth={0.5} />
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="text-center mb-24 lg:mb-32"
        >
          <motion.div variants={titleVariants} className="flex items-center justify-center gap-4 mb-8">
            <div className="h-[1px] w-12 md:w-24 bg-red-500/50" />
            <h2 className="font-mono text-xs uppercase tracking-[0.4em] text-red-500 font-bold">
              {t('officialNotice')}
            </h2>
            <div className="h-[1px] w-12 md:w-24 bg-red-500/50" />
          </motion.div>
          <motion.h3 variants={titleVariants} className="text-4xl sm:text-5xl md:text-7xl lg:text-[100px] font-heading font-black text-white tracking-tighter uppercase leading-[0.9] max-w-5xl mx-auto mb-6">
            {t('titleLine1')} <br className="hidden md:block" />{t('titleLine2')}
          </motion.h3>
          <motion.p variants={titleVariants} className="text-white/40 uppercase tracking-widest text-sm md:text-base font-light">
            {t('subtitle')}
          </motion.p>
        </motion.div>

        {/* Cinematic Grid */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 max-w-6xl mx-auto"
        >
          {statements.map((item, index) => (
            <motion.div 
              key={index} 
              variants={cardVariants}
              className="bg-zinc-900 border border-white/5 rounded-[2rem] p-8 md:p-12 relative overflow-hidden group hover:border-red-500/30 transition-all duration-500 flex flex-col justify-between"
            >
              
              {/* Red Accent Line */}
              <div className="absolute top-0 left-0 w-0 h-1 bg-red-500 group-hover:w-full transition-all duration-700 ease-out" />
              
              {/* Number Watermark */}
              <div className="absolute -bottom-4 -right-4 text-[150px] font-heading font-black text-white/[0.02] leading-none pointer-events-none group-hover:text-white/[0.05] transition-colors duration-500">
                0{index + 1}
              </div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-red-500/10 transition-colors duration-500">
                  <item.icon className="w-8 h-8 text-white/40 group-hover:text-red-500 transition-colors duration-500" strokeWidth={1.5} />
                </div>
                
                <p className="text-white/80 font-light text-xl lg:text-3xl leading-relaxed group-hover:text-white transition-colors duration-500">
                  {item.text}
                </p>
              </div>

            </motion.div>
          ))}
        </motion.div>
        
      </div>
    </section>
  )
}
