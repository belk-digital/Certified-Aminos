'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

export function ParallaxImageSection() {
  const t = useTranslations('home.parallaxImage')
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  // By making the image 125% of the container's height and translating it by -20% of its own height
  // (which equals exactly 25% of the container's height), we mathematically guarantee a flawless
  // top-to-bottom parallax effect on ANY screen size, including tall mobile screens.
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"])

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[35vh] md:h-[60vh] overflow-hidden bg-[#050505] z-20 border-t border-white/5"
    >
      <motion.div
        className="absolute inset-0 w-full h-[125%]"
        style={{ y }}
      >
        <Image
          src="/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_26_58 AM.webp"
          alt={t('imageAlt')}
          fill
          className="object-cover"
          priority
        />
      </motion.div>
    </section>
  )
}
