'use client'

import React, { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FadeUp } from '@/components/motion/FadeUp'

interface BlogPostHeroProps {
  post: {
    title: string
    category: string
    date: string
    readTime: string
    imageSrc: string
  }
}

export function BlogPostHero({ post }: BlogPostHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  // Move the image down as we scroll down to create parallax
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

  return (
    <div ref={containerRef} className="relative w-full h-[80dvh] min-h-[500px] md:min-h-[600px] bg-cream p-3 pt-[56px] [.announcement-closed_&]:pt-3 sm:p-5 sm:pt-[64px] [.announcement-closed_&]:sm:pt-5 md:p-8 md:pt-[76px] [.announcement-closed_&]:md:pt-8 overflow-hidden flex transition-[padding] duration-300 mb-12 md:mb-16">
      <div className="relative w-full h-full bg-zinc-900 rounded-[2rem] md:rounded-[4rem] overflow-hidden flex flex-col justify-center text-center">
        <div className="absolute inset-0 rounded-[2rem] md:rounded-[4rem] ring-1 ring-inset ring-white/5 pointer-events-none z-20" />

        {/* Background Image with Parallax */}
        <motion.div 
          className="absolute inset-0 w-full h-[120%] -top-[10%] z-0"
          style={{ y: imageY }}
        >
          <Image
            src={post.imageSrc}
            alt={post.title}
            fill
            className="object-cover opacity-50 mix-blend-luminosity"
            priority
            unoptimized
          />
        </motion.div>

        {/* Background Gradients & Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 z-10 pointer-events-none" />

        <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 sm:px-8 md:px-16 w-full h-full max-w-5xl pt-20 mx-auto">
          <FadeUp>
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-xs md:text-sm tracking-widest text-white/60 uppercase font-bold mb-6">
              <span className="text-gold">{post.category}</span>
              <span className="text-white/20">·</span>
              <span>{post.date}</span>
              <span className="text-white/20">·</span>
              <span>{post.readTime}</span>
            </div>

            <h1 className="w-full font-heading text-[6vw] sm:text-[4vw] md:text-[4vw] lg:text-[48px] leading-[1.1] text-white tracking-tighter uppercase font-black drop-shadow-2xl mb-6">
              {post.title}
            </h1>
          </FadeUp>
        </div>
      </div>
    </div>
  )
}
