'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Microscope, ShieldCheck, FlaskConical } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

export function MissionPhilosophyJourney() {
  const t = useTranslations('content.missionPhilosophyJourney')
  
  // Track which pillar is active. Default to 0.
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const cards = [
    {
      id: 0,
      label: t('card1Label'),
      title: t('card1Title'),
      text: t('card1Text'),
      icon: Microscope,
      image: "/HelixBio Images/multiple-vial.webp",
      number: "01"
    },
    {
      id: 1,
      label: t('card2Label'),
      title: t('card2Title'),
      text: t('card2Text'),
      icon: ShieldCheck,
      image: "/HelixBio Images/helixbio-as-routine.webp",
      number: "02"
    },
    {
      id: 2,
      label: t('card3Label'),
      title: t('card3Title'),
      text: t('card3Text'),
      icon: FlaskConical,
      image: "/HelixBio Images/package-box.webp",
      number: "03"
    }
  ]

  // Auto-play interval with pause-on-hover
  useEffect(() => {
    if (isHovered) return; // Pause timer if user is hovering
    
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [cards.length, isHovered]);

  return (
    <section className="py-24 lg:py-40 px-4 sm:px-6 md:px-8 lg:px-10 bg-[#FAFAFA] relative overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      </div>

      <div className="max-w-[1920px] mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12 lg:mb-24">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-[1px] w-8 md:w-12 bg-primary/40" />
            <h2 className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.3em] text-primary font-bold">
              {t('eyebrow')}
            </h2>
            <div className="h-[1px] w-8 md:w-12 bg-primary/40" />
          </div>
          <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-heading font-black text-ink tracking-tighter uppercase leading-[0.95]">
            {t('title')}
          </h3>
        </div>

        {/* Expanding Pillars Accordion */}
        <div 
          className="w-full max-w-7xl mx-auto h-[600px] lg:h-[700px] flex flex-col md:flex-row gap-2 sm:gap-4"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {cards.map((card, index) => {
            const isActive = activeIndex === index;
            const Icon = card.icon;

            return (
              <motion.div
                key={card.id}
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
                animate={{
                  flex: isActive ? 5 : 1,
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`relative rounded-[2rem] overflow-hidden cursor-pointer flex flex-col md:flex-row shadow-2xl transition-all duration-300 ${
                  isActive ? 'bg-zinc-900 border border-white/10' : 'bg-white border border-black/5 hover:bg-zinc-50'
                }`}
              >
                
                {/* Background Image (Only visible when active) */}
                <div className={`absolute inset-0 z-0 transition-opacity duration-700 ease-in-out ${isActive ? 'opacity-40' : 'opacity-0'}`}>
                  <Image 
                    src={card.image} 
                    alt={card.title} 
                    fill 
                    className={`object-cover ${isActive ? 'scale-100' : 'scale-110'} transition-transform duration-1000 ease-out`} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                </div>

                {/* Number Watermark */}
                <div className={`absolute -bottom-4 md:-bottom-10 right-4 md:-right-6 font-heading font-black leading-none transition-all duration-700 pointer-events-none z-10 ${
                  isActive ? 'text-[120px] md:text-[250px] text-white/[0.03]' : 'text-[60px] text-ink/[0.03]'
                }`}>
                  {card.number}
                </div>

                {/* Content Container */}
                <div className="relative z-20 flex flex-col md:flex-row w-full h-full p-6 md:p-8">
                  
                  {/* Always Visible Header / Icon Area */}
                  <div className={`flex md:flex-col items-center justify-between md:justify-start gap-4 md:w-16 shrink-0 transition-all duration-500 ${isActive ? '' : 'w-full'}`}>
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500 ${
                      isActive ? 'bg-primary/20 border-primary/40 shadow-[0_0_20px_rgba(14,165,233,0.3)]' : 'bg-zinc-100 border-black/5'
                    }`}>
                      <Icon className={`w-6 h-6 md:w-8 md:h-8 transition-colors duration-500 ${isActive ? 'text-primary' : 'text-ink/40'}`} strokeWidth={1.5} />
                    </div>
                    
                    {/* Vertical Title (Desktop Inactive) or Horizontal Title (Mobile Inactive) */}
                    <div className={`transition-all duration-500 flex-1 flex md:items-center justify-center md:pt-8 ${isActive ? 'opacity-0 w-0 h-0 hidden md:block' : 'opacity-100 w-full'}`}>
                      <h3 
                        className={`font-heading font-bold uppercase tracking-widest whitespace-nowrap text-lg md:text-2xl md:[writing-mode:vertical-rl] md:rotate-180 ${isActive ? 'text-white' : 'text-ink/40'}`}
                      >
                        {card.label}
                      </h3>
                    </div>
                  </div>

                  {/* Expanding Detailed Content */}
                  <div className={`flex flex-col justify-end overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isActive ? 'opacity-100 flex-1 ml-0 md:ml-8 mt-4 md:mt-0' : 'opacity-0 w-0 h-0'
                  }`}>
                    <div className="min-w-[250px]">
                      <span className="text-primary font-mono tracking-widest text-xs md:text-sm font-bold uppercase mb-2 block">
                        {card.label}
                      </span>
                      <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-black uppercase text-white mb-4 tracking-tighter leading-[0.95]">
                        {card.title}
                      </h3>
                      <p className="text-base md:text-lg text-white/70 leading-relaxed font-light max-w-xl">
                        {card.text}
                      </p>
                    </div>
                  </div>
                  
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
