'use client'

import React from 'react';
import { ArrowRight, ShieldCheck, FlaskConical, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { PinterestGlassCard } from '../home/PinterestGlassCard';
import { FluidButton } from '@/components/ui/fluid-button';
import { useTranslations } from 'next-intl';

export function TrustBadges() {
  const t = useTranslations('home.trustBadges');

  const cardContainerVariants: any = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.2, delayChildren: 0.3 } 
    }
  };

  const cardVariants: any = {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    visible: { 
      opacity: 1, y: 0, scale: 1, 
      transition: { type: "spring", damping: 20, stiffness: 100 } 
    }
  };

  return (
    <section className="bg-[#FAFAFA] px-4 md:px-10 pt-24 pb-32 md:pt-32 md:pb-48 lg:pb-64 w-full relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#ffffff,transparent_70%)] pointer-events-none" />
      <div className="max-w-[88rem] mx-auto relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-50px" }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-24 gap-8 md:gap-0"
        >
          <div className="w-full md:w-1/2">
            <p className="text-primary text-xs sm:text-sm tracking-[0.2em] uppercase mb-3 sm:mb-4 font-bold">{t('eyebrow')}</p>
            <h2 className="font-heading text-[2.5rem] sm:text-4xl md:text-5xl lg:text-7xl font-black text-zinc-900 leading-[0.9] tracking-tighter uppercase mb-2 md:mb-4 break-words">
              {t('titleLine1')} <br className="hidden md:block" /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-primary to-zinc-900">
                {t('titleLine2')}
              </span>
              <span className="text-primary">.</span>
            </h2>
            <p className="text-zinc-500 font-bold text-xs sm:text-sm md:text-base tracking-[0.15em] uppercase mb-0 md:mb-8">
              {t('subtitle')}
            </p>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-6 sm:gap-8 max-w-md mt-2 sm:mt-6 md:mt-0">
            <div title={`${t('ctaText')} →`}>
              <FluidButton href="/about-us" text={t('ctaText')} ariaLabel="Learn more about Helix Bio's purity standards" className="relative z-10" />
            </div>
            <p className="text-zinc-600 text-sm sm:text-base md:text-lg text-left md:text-right leading-relaxed font-medium">
              {t('description')}
            </p>
          </div>
        </motion.div>

        {/* Row 2 - Bento Box Grid using PinterestGlassCard */}
        <motion.div 
          variants={cardContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Card 1 (Large Featured - Left Side) */}
          <motion.div variants={cardVariants} className="lg:col-span-2 flex h-full">
            <PinterestGlassCard 
              title={t('cards.purity.title')}
              description={t('cards.purity.description')}
              icon={<ShieldCheck className="w-6 h-6" />}
              tag={t('cards.purity.tag')}
              microcopy={t('cards.purity.microcopy')}
              size="large"
            />
          </motion.div>

          {/* Cards 2 & 3 (Stacked - Right Side) */}
          <motion.div className="lg:col-span-1 flex flex-col gap-6">
            <motion.div variants={cardVariants} className="flex-1 flex">
              <PinterestGlassCard 
                title={t('cards.stability.title')}
                description={t('cards.stability.description')}
                icon={<FlaskConical className="w-5 h-5" />}
                tag={t('cards.stability.tag')}
                microcopy={t('cards.stability.microcopy')}
                size="standard"
              />
            </motion.div>

            <motion.div variants={cardVariants} className="flex-1 flex">
              <PinterestGlassCard 
                title={t('cards.dosing.title')}
                description={t('cards.dosing.description')}
                icon={<Target className="w-5 h-5" />}
                tag={t('cards.dosing.tag')}
                microcopy={t('cards.dosing.microcopy')}
                size="standard"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

