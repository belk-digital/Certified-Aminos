'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, Calendar, Clock, ArrowUpRight, ShoppingBag } from 'lucide-react'

export function BlogPostHero({
  title,
  excerpt,
  category,
  date,
  readTime,
  authorName,
  imageSrc,
  imageAlt,
}: {
  title: string
  excerpt?: string
  category?: string
  date?: string
  readTime?: string
  authorName?: string
  imageSrc: string
  imageAlt: string
}) {
  return (
    <div className="w-full bg-[#FAFAFA] font-sans">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 pt-32 sm:pt-36 md:pt-44 pb-8 mx-auto max-w-[1920px]">

        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-ink/40 hover:text-ink text-xs font-bold uppercase tracking-widest transition-colors mb-6"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Research Blog
          </Link>
        </motion.div>

        {/* Header Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 md:mb-10"
        >
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-ink uppercase tracking-tighter leading-[0.9] mb-4 sm:mb-6">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
            {category && (
              <span className="bg-ink text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                {category}
              </span>
            )}
            {authorName && (
              <span className="text-ink/50 text-xs md:text-sm font-bold uppercase tracking-widest">
                {authorName}
              </span>
            )}
            {date && (
              <span className="flex items-center gap-1.5 text-ink/50 text-xs md:text-sm font-bold uppercase tracking-widest">
                <Calendar className="w-3.5 h-3.5" />
                {date}
              </span>
            )}
            {readTime && (
              <span className="flex items-center gap-1.5 text-ink/50 text-xs md:text-sm font-bold uppercase tracking-widest">
                <Clock className="w-3.5 h-3.5" />
                {readTime}
              </span>
            )}
          </div>

          {excerpt && (
            <p className="text-ink/50 text-sm md:text-base tracking-wide font-medium leading-relaxed">
              {excerpt}
            </p>
          )}
        </motion.div>

        {/* Banner Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full h-[300px] sm:h-[420px] md:h-[520px] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-zinc-900"
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            className="object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

          <Link
            href="/shop"
            className="group absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 inline-flex items-center gap-2 bg-white/90 hover:bg-white backdrop-blur-md text-ink rounded-full pl-4 pr-3 py-2.5 sm:pl-5 sm:pr-4 sm:py-3 shadow-xl transition-all duration-300 hover:scale-105"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="font-heading font-bold uppercase tracking-widest text-[10px] sm:text-xs">
              Explore Products
            </span>
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-ink text-white flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </span>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
