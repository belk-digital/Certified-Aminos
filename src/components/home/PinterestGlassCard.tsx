"use client";

import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface PinterestGlassCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  tag?: string;
  microcopy?: string;
  className?: string;
  iconPosition?: 'left' | 'top-left' | 'none'; // Kept for backwards compatibility
  index?: number;
  scrollFanning?: boolean; // Kept for backwards compatibility
  theme?: 'cream' | 'black'; // Kept for backwards compatibility
  size?: 'standard' | 'large';
  hover3D?: boolean;
}

export function PinterestGlassCard({ 
  title, description, icon, tag, microcopy, 
  className = '', iconPosition = 'left', index = 0, 
  scrollFanning = false, theme = 'cream', size = 'standard', hover3D = true 
}: PinterestGlassCardProps) {
  const t = useTranslations('home.pinterestGlassCard')
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Magnetic scroll effect (from original)
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start 5%", "start -30%"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100, damping: 25, mass: 0.2
  });
  
  const yOffset = scrollFanning ? -250 : 0; 
  const y = useTransform(smoothProgress, [0, 1], [0, yOffset]);
  const opacity = useTransform(smoothProgress, [0, 0.8, 1], [1, 1, scrollFanning ? 0 : 1]);

  // 3D Magnetic Hover
  const [isHovering, setIsHovering] = useState(false);
  const mouseX = useSpring(0, { stiffness: 400, damping: 40 });
  const mouseY = useSpring(0, { stiffness: 400, damping: 40 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!hover3D || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseEnter() {
    if (!hover3D) return;
    setIsHovering(true);
  }

  function handleMouseLeave() {
    if (!hover3D) return;
    setIsHovering(false);
    mouseX.set(0);
    mouseY.set(0);
  }

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);
  
  // Dynamic Glare (Optimized for GPU)
  const glareX = useTransform(mouseX, [-0.5, 0.5], ['-50%', '50%']);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ['-50%', '50%']);

  const isLarge = size === 'large';

  // Base 3D styles
  const baseStyle: any = {
    rotateX: hover3D ? rotateX : 0,
    rotateY: hover3D ? rotateY : 0,
    scale: hover3D ? (isHovering ? 1.02 : 1) : 1,
    z: hover3D ? (isHovering ? 50 : 0) : 0,
    transformPerspective: 1000
  };

  // Only attach heavy scroll physics to style if scrollFanning is actually enabled
  const animatedStyle = scrollFanning ? { ...baseStyle, y, opacity } : baseStyle;

  return (
    <motion.div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={animatedStyle}
      className={`relative w-full rounded-[2.5rem] bg-white/90 border border-white ${isLarge ? 'p-8 sm:p-10' : 'p-6 sm:p-8'} flex flex-col justify-between overflow-hidden shadow-[0_12px_40px_rgb(0,0,0,0.06)] group ${className}`}
    >
      
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none z-0">
        
        {/* Noise Texture Overlay (Premium Frosted Glass Grain) */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.25]"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.055 0 0 0 0 0.647 0 0 0 0 0.914 0.21 0.72 0.07 0 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Massive Faint Icon Watermark (Static) */}
        {icon && (
          <div 
            className="absolute -bottom-12 -right-12 w-64 h-64 text-[#0ea5e9] opacity-[0.08] pointer-events-none flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:stroke-[0.5]"
          >
            {icon}
          </div>
        )}


        {/* Dynamic Holographic Glare (Optimized for GPU) */}
        {hover3D && (
          <motion.div 
            className="absolute -inset-[100%] z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ 
              background: 'radial-gradient(circle at center, rgba(255,255,255,0.7) 0%, transparent 40%)',
              x: glareX,
              y: glareY
            }}
          />
        )}
        
        <div className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/80" />
      </div>

      {/* Top Header Section (Icon & Tag) */}
      <div className={`relative z-20 flex justify-between items-start ${isLarge ? 'mb-16 lg:mb-24' : 'mb-6 sm:mb-8'}`}>
        {icon && (
          <motion.div 
            className={`flex items-center justify-center rounded-2xl bg-[#d9f0ff] border border-[#0ea5e9]/20 text-[#0ea5e9] backdrop-blur-md shadow-sm ${
              isLarge ? 'w-16 h-16 [&>svg]:w-8 [&>svg]:h-8' : 'w-12 h-12 [&>svg]:w-6 [&>svg]:h-6'
            }`}
          >
            {icon}
          </motion.div>
        )}

        {(tag || t('defaultTag')) && (
          <motion.div 
            className="px-4 py-2 bg-[#d9f0ff] text-[#0ea5e9] rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] shadow-sm"
          >
            {tag || t('defaultTag')}
          </motion.div>
        )}
      </div>

      {/* Main Content */}
      <motion.div 
        className="relative z-20"
      >
        <h3 className={`font-heading font-bold text-zinc-900 mb-2 sm:mb-4 leading-tight ${
          isLarge ? 'text-4xl sm:text-5xl lg:text-6xl max-w-xl' : 'text-xl sm:text-2xl lg:text-3xl'
        }`}>
          {title}
        </h3>
        <p className={`text-zinc-600 font-medium leading-relaxed ${
          isLarge ? 'text-lg sm:text-xl lg:text-2xl max-w-xl' : 'text-xs sm:text-sm lg:text-base'
        }`}>
          {description}
        </p>
        {microcopy && (
          <div className="mt-8">
            <p className="text-[#0ea5e9] font-extrabold tracking-[0.2em] text-[10px] sm:text-xs uppercase drop-shadow-[0_0_12px_rgba(14,165,233,0.2)]">
              {microcopy}
            </p>
          </div>
        )}
      </motion.div>

    </motion.div>
  );
}
