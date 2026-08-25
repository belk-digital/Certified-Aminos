"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface MagazineGlassCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  tag?: string;
  image: string;
  className?: string;
  onClick?: () => void;
}

export function MagazineGlassCard({ title, description, icon: Icon, tag, image, className = '', onClick }: MagazineGlassCardProps) {
  const t = useTranslations('home.magazineGlassCard')
  return (
    <div 
      onClick={onClick}
      className={`relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-[2rem] sm:rounded-[2.5rem] bg-zinc-900 overflow-visible group cursor-pointer transition-all duration-500 border border-primary/20 ${className}`}
    >
      
      {/* Background Image Container */}
      <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden z-0">
        <Image 
          src={image} 
          alt={title} 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Magazine-style Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay pointer-events-none" />
        
        {/* Inner Glass Highlight */}
        <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] ring-1 ring-inset ring-white/10" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pl-12 sm:pl-14 md:pl-12 lg:pl-16 pr-4 sm:pr-10 md:pr-6 lg:pr-10 pb-12 sm:pb-16 md:pb-16 lg:pb-16 flex flex-col justify-end h-full">
        <h3 className="text-xl sm:text-3xl md:text-2xl lg:text-3xl font-heading font-black text-white mb-1 sm:mb-3 leading-[1.1] tracking-tight">{title}</h3>
        <p className="text-white/80 text-xs sm:text-base md:text-sm lg:text-base leading-relaxed font-medium mb-3 sm:mb-8 md:mb-4 lg:mb-10 line-clamp-2 sm:line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
          {description}
        </p>
      </div>

      {/* 
        FAKE CUTOUTS (Cream Solid Overlays)
        These perfectly match the `bg-cream` section background, creating 
        the illusion of flawless transparent cutouts in the glass card.
      */}

      {/* 1. Left Edge Cutout */}
      <div className="absolute top-1/2 -translate-y-1/2 -left-[2px] w-10 h-16 sm:w-16 sm:h-24 md:w-12 md:h-20 lg:w-16 lg:h-24 bg-cream rounded-r-[1.25rem] sm:rounded-r-[2rem] flex items-center justify-center z-30">
        {/* Top Fillet (Bottom-Left Cream) */}
        <div 
          className="absolute -top-[1rem] sm:-top-[1.5rem] left-0 w-4 h-4 sm:w-6 sm:h-6 bg-contain bg-no-repeat pointer-events-none" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M 0 0 V 100 H 100 A 100 100 0 0 1 0 0 Z' fill='%23FAF7F2'/%3E%3C/svg%3E")` }} 
        />
        {/* Bottom Fillet (Top-Left Cream) */}
        <div 
          className="absolute -bottom-[1rem] sm:-bottom-[1.5rem] left-0 w-4 h-4 sm:w-6 sm:h-6 bg-contain bg-no-repeat pointer-events-none" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M 100 0 H 0 V 100 A 100 100 0 0 1 100 0 Z' fill='%23FAF7F2'/%3E%3C/svg%3E")` }} 
        />
        
        {/* Floating Action Button (Vertical Pill style) */}
        <div className="w-6 h-10 sm:w-10 sm:h-16 md:w-8 md:h-14 lg:w-10 lg:h-16 bg-[#002222] border border-primary/30 text-white rounded-full flex items-center justify-center transition-all duration-300 relative z-10 -ml-1 sm:-ml-2 group-hover:bg-primary group-hover:text-white group-hover:border-primary shadow-lg">
          <Icon className="w-3 h-3 sm:w-5 sm:h-5" />
        </div>
      </div>

      {/* 2. Bottom Right Edge Cutout */}
      <div className="absolute -bottom-[2px] -right-[2px] w-fit h-10 sm:h-16 md:h-12 lg:h-16 pl-3 sm:pl-6 md:pl-4 lg:pl-6 pr-2 sm:pr-3 md:pr-2 lg:pr-3 bg-cream rounded-tl-[1.25rem] sm:rounded-tl-[2rem] rounded-br-[2rem] sm:rounded-br-[2.5rem] flex items-center justify-center z-30">
        {/* Top Fillet (Bottom-Right Cream) */}
        <div 
          className="absolute -top-[1rem] sm:-top-[1.5rem] right-0 w-4 h-4 sm:w-6 sm:h-6 bg-contain bg-no-repeat pointer-events-none" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M 100 0 V 100 H 0 A 100 100 0 0 0 100 0 Z' fill='%23FAF7F2'/%3E%3C/svg%3E")` }} 
        />
        {/* Left Fillet (Bottom-Right Cream) */}
        <div 
          className="absolute bottom-0 -left-[1rem] sm:-left-[1.5rem] w-4 h-4 sm:w-6 sm:h-6 bg-contain bg-no-repeat pointer-events-none" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M 100 0 V 100 H 0 A 100 100 0 0 0 100 0 Z' fill='%23FAF7F2'/%3E%3C/svg%3E")` }} 
        />
        
        {/* Pill (Dynamic fit) */}
        <div className="px-3 py-1.5 sm:px-6 sm:py-2.5 md:px-4 md:py-2 lg:px-6 lg:py-2.5 bg-[#002222] border border-primary/30 text-white rounded-full flex items-center justify-center text-[8px] sm:text-xs md:text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap relative z-10 transition-colors duration-300 group-hover:bg-primary group-hover:text-white group-hover:border-primary shadow-lg">
          {tag || t('defaultTag')}
        </div>
      </div>

    </div>
  );
}
