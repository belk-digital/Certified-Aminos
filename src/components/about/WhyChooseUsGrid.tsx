'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Microscope, ShieldCheck, Settings, FileCheck } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

const FEATURE_META = [
  {
    key: 'analyticalEvaluation',
    icon: Microscope,
    image: "/HelixBio Images/category-2.webp",
  },
  {
    key: 'clearClassification',
    icon: ShieldCheck,
    image: "/HelixBio Images/military-2.webp",
  },
  {
    key: 'controlledHandling',
    icon: Settings,
    image: "/HelixBio Images/category-5.webp",
  },
  {
    key: 'operationalTransparency',
    icon: FileCheck,
    image: "/HelixBio Images/category-7.webp",
  }
];

export function WhyChooseUsGrid() {
  const t = useTranslations('content.whyChooseUsGrid')
  const features = FEATURE_META.map((f) => ({
    ...f,
    title: t(`features.${f.key}.title`),
    description: t(`features.${f.key}.description`),
  }))
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Calculate opacities for the 4 background images based on scroll progress
  // [0, 0.25] -> Image 1
  // [0.25, 0.5] -> Image 2
  // [0.5, 0.75] -> Image 3
  // [0.75, 1.0] -> Image 4
  const opacity1 = useTransform(scrollYProgress, [0, 0.2, 0.25, 1], [1, 1, 0, 0]);
  const opacity2 = useTransform(scrollYProgress, [0.15, 0.25, 0.45, 0.5], [0, 1, 1, 0]);
  const opacity3 = useTransform(scrollYProgress, [0.4, 0.5, 0.7, 0.75], [0, 1, 1, 0]);
  const opacity4 = useTransform(scrollYProgress, [0.65, 0.75, 1, 1], [0, 1, 1, 1]);
  
  // Parallax scale for a subtle breathing effect on the images
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const opacities = [opacity1, opacity2, opacity3, opacity4];

  return (
    <section ref={containerRef} className="relative h-[600vh] bg-black">
      
      {/* STICKY BACKGROUND CONTAINER */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* Background Images Crossfading */}
        {features.map((feature, idx) => (
          <motion.div
            key={`bg-${feature.key}`}
            style={{ opacity: opacities[idx], scale }}
            className="absolute inset-0 z-0 will-change-transform"
          >
            <Image 
              src={feature.image} 
              alt={feature.title} 
              fill 
              className="object-cover opacity-100" 
              priority={idx === 0}
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80 md:from-black/60 md:to-black/60" />
          </motion.div>
        ))}

        {/* Floating Typography Decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full overflow-hidden pointer-events-none z-0 opacity-[0.03] flex flex-col gap-4">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
            style={{ willChange: 'transform' }}
            className="whitespace-nowrap font-heading font-black text-[15vw] text-white uppercase leading-none tracking-tighter"
          >
            ANALYTICAL PURITY &bull; ANALYTICAL PURITY &bull; ANALYTICAL PURITY &bull; ANALYTICAL PURITY
          </motion.div>
        </div>

      </div>

      {/* FOREGROUND SCROLLING CONTENT */}
      <div className="absolute top-0 left-0 w-full z-10 pointer-events-none">
        
        {/* Intro Header Section (Takes up first screen) */}
        <div className="h-screen flex items-center max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 pointer-events-auto">
          <div className="max-w-3xl pt-32">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[2px] w-12 bg-primary" />
              <h2 className="font-mono text-xs md:text-sm uppercase tracking-[0.3em] text-primary font-bold shadow-black drop-shadow-md">
                {t('eyebrow')}
              </h2>
            </div>
            <h3 className="text-5xl sm:text-6xl md:text-8xl font-heading font-black text-white tracking-tighter uppercase leading-[0.9] drop-shadow-2xl mb-8">
              {t('title')}
            </h3>
            <p className="text-white/80 font-medium max-w-xl text-lg md:text-xl drop-shadow-md border-l-2 border-primary/50 pl-6 py-2 bg-black/40 backdrop-blur-md rounded-lg">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {/* Feature Sections */}
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          const isEven = idx % 2 === 0;

          return (
            <div key={feature.key} className="h-screen flex items-center max-w-[1920px] mx-auto px-4 sm:px-6 md:px-10 lg:px-20 pointer-events-auto">
              <div className={`w-full flex ${isEven ? 'justify-start' : 'justify-end'}`}>
                
                <motion.div 
                  initial={{ opacity: 0, y: 100 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ margin: "-20% 0px -20% 0px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="w-full max-w-xl relative group"
                >
                  {/* Glass Panel without expensive backdrop blur to fix lag */}
                  <div className="relative z-10 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-black/60 border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden">
                    
                    {/* Glowing highlight orb */}
                    <div className={`absolute -top-24 ${isEven ? '-left-24' : '-right-24'} w-48 h-48 bg-primary/20 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

                    <div className="flex items-start justify-between mb-8 relative z-10">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(14,165,233,0.15)] group-hover:scale-110 transition-transform duration-500">
                        <Icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
                      </div>
                      <span className="text-white/10 font-serif text-6xl md:text-8xl leading-none select-none -mt-4 -mr-4 font-black">
                        0{idx + 1}
                      </span>
                    </div>

                    <h4 className="text-3xl md:text-5xl font-heading font-black tracking-tighter text-white uppercase mb-6 leading-[1.1] relative z-10">
                      {feature.title}
                    </h4>
                    
                    <p className="text-white/70 text-base md:text-lg leading-relaxed font-light relative z-10">
                      {feature.description}
                    </p>

                    {/* Scanning Line Decoration */}
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </motion.div>

              </div>
            </div>
          )
        })}

        {/* Buffer space at the end so the last element scrolls normally out of view */}
        <div className="h-[50vh]" />
        
      </div>
    </section>
  )
}
