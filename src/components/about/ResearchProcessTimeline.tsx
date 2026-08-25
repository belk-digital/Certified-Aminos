'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { FlaskConical, Microscope, ShieldCheck, Package } from 'lucide-react'

const PROCESS_STEP_META = [
  { id: 'sourcing', key: 'sourcing', icon: Package },
  { id: 'synthesis', key: 'synthesis', icon: FlaskConical },
  { id: 'purification', key: 'purification', icon: ShieldCheck },
  { id: 'verification', key: 'verification', icon: Microscope },
];

type ProcessStep = { id: string; title: string; description: string; icon: typeof Package }

function PhaseNode({
  step,
  index,
  scrollYProgress,
  isLast
}: {
  step: ProcessStep;
  index: number;
  scrollYProgress: MotionValue<number>;
  isLast: boolean;
}) {
  const Icon = step.icon;

  // Tighter timing logic to prevent overlaps
  const startEmerge = Math.max(0, index * 0.25 - 0.05); // starts emerging later
  const readStart = index * 0.25;
  const readEnd = readStart + 0.1; // stays readable for shorter time
  const fadeOutEnd = readEnd + 0.05; // Fades out completely BEFORE the next one becomes readable
  const flyPast = readEnd + 0.15; // continues scaling up

  const scaleRanges = isLast 
    ? [startEmerge, readStart, 1] 
    : [startEmerge, readStart, readEnd, flyPast];
    
  const scaleValues = isLast 
    ? [0.2, 1, 1] 
    : [0.2, 1, 1, 7]; // Scales larger to get past camera

  const opacityRanges = isLast 
    ? [startEmerge, readStart, 1] 
    : [startEmerge, readStart, readEnd, fadeOutEnd]; // Uses fadeOutEnd to disappear sooner
    
  const opacityValues = isLast 
    ? [0, 1, 1] 
    : [0, 1, 1, 0];

  const scale = useTransform(scrollYProgress, scaleRanges, scaleValues);
  const opacity = useTransform(scrollYProgress, opacityRanges, opacityValues);
  
  // Hardware acceleration and fixing rendering overlaps
  const pointerEvents = useTransform(opacity, (v) => v > 0.5 ? "auto" : "none");
  const display = useTransform(opacity, (v) => v === 0 ? "none" : "flex");

  return (
    <motion.div
      style={{ scale, opacity, willChange: 'transform, opacity', pointerEvents, display }}
      className="absolute inset-0 flex items-center justify-center p-4 pt-32 sm:pt-40 md:pt-48"
    >
      <div className="relative bg-gradient-to-br from-white/95 to-white/60 backdrop-blur-3xl border border-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,1)] rounded-[2rem] md:rounded-[3rem] p-8 sm:p-10 md:p-14 max-w-3xl w-full text-center flex flex-col items-center group overflow-hidden">
        
        {/* Background Watermark */}
        <span className="absolute -bottom-10 -right-4 text-[150px] md:text-[250px] font-black text-black/[0.03] select-none pointer-events-none leading-none tracking-tighter">
          0{index + 1}
        </span>

        {/* Node Icon with soft glow */}
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white border border-primary/10 shadow-[0_10px_30px_rgba(14,165,233,0.15)] flex items-center justify-center mb-6 md:mb-10 relative overflow-hidden group-hover:scale-110 transition-transform duration-500 shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Icon className="w-8 h-8 md:w-10 md:h-10 text-primary relative z-10" strokeWidth={1.5} />
        </div>

        {/* Node Content */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="flex items-center justify-center gap-3 mb-4 md:mb-6">
            <div className="h-[2px] w-4 md:w-6 bg-primary/40" />
            <span className="text-primary font-mono font-bold text-xs md:text-sm tracking-[0.3em] uppercase">
              Phase 0{index + 1}
            </span>
            <div className="h-[2px] w-4 md:w-6 bg-primary/40" />
          </div>
          
          <h4 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-black text-ink uppercase tracking-tight mb-4 md:mb-8 leading-[1.1]">
            {step.title}
          </h4>
          
          <p className="text-ink/70 text-base sm:text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
            {step.description}
          </p>
        </div>

      </div>
    </motion.div>
  );
}

export function ResearchProcessTimeline() {
  const t = useTranslations('content.aboutProcessTimeline')
  const containerRef = useRef<HTMLDivElement>(null);

  const PROCESS_STEPS: ProcessStep[] = PROCESS_STEP_META.map((meta) => ({
    id: meta.id,
    icon: meta.icon,
    title: t(`steps.${meta.key}.title`),
    description: t(`steps.${meta.key}.description`),
  }))

  // Track scroll progress through this massive container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <section ref={containerRef} className="relative h-[500vh] bg-[#FAFAFA]">
      
      {/* STICKY 3D VIEWPORT */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden perspective-[1000px]">
        
        {/* Background Grid (Light Mode) */}
        <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at center, #000 2px, transparent 1px)", backgroundSize: "60px 60px" }} />
        
        {/* Title overlay (Stays fixed at the top) */}
        <div className="absolute top-6 sm:top-10 md:top-16 lg:top-24 left-0 w-full z-20 px-8 text-center pointer-events-none">
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-2 md:mb-4">
            <div className="h-[1px] w-6 md:w-12 bg-primary/40" />
            <h2 className="font-mono text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.3em] text-primary font-bold">
              {t('eyebrow')}
            </h2>
            <div className="h-[1px] w-6 md:w-12 bg-primary/40" />
          </div>
          <h3 className="text-3xl sm:text-4xl md:text-6xl font-heading font-black text-ink tracking-tighter uppercase leading-[0.95]">
            {t('title')}
          </h3>
        </div>

        {/* 3D Nodes */}
        <div className="relative w-full h-full z-10">
          {PROCESS_STEPS.map((step, index) => (
            <PhaseNode 
              key={step.id} 
              step={step} 
              index={index} 
              scrollYProgress={scrollYProgress} 
              isLast={index === PROCESS_STEPS.length - 1}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
