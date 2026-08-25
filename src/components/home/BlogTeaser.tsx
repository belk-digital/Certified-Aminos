'use client'

import React, { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'

import { BLOG_POSTS as BLOG_POSTS_EN } from '@/data/blog-posts'
import { BLOG_POSTS as BLOG_POSTS_ES } from '@/data/blog-posts.es'

export function BlogTeaser() {
  const t = useTranslations('home.blogTeaser')
  const locale = useLocale()
  const BLOG_POSTS = false ? BLOG_POSTS_ES : BLOG_POSTS_EN
  const targetRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [maxScroll, setMaxScroll] = useState(0)

  useEffect(() => {
    const updateMeasurements = () => {
      if (trackRef.current && trackRef.current.parentElement) {
        const scrollWidth = trackRef.current.scrollWidth
        const viewportWidth = trackRef.current.parentElement.offsetWidth
        setMaxScroll(Math.max(0, scrollWidth - viewportWidth))
      }
    }
    
    updateMeasurements()
    window.addEventListener('resize', updateMeasurements)
    return () => window.removeEventListener('resize', updateMeasurements)
  }, [])
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
  })

  const x = useTransform(scrollYProgress, [0, 1], [0, -maxScroll])

  // Shared Card Component
  const JournalCard = ({ post }: { post: typeof BLOG_POSTS[0] }) => (
    <Link 
      href={`/${post.slug}`} 
      className="group flex flex-col w-[60vw] sm:w-[45vw] md:w-[35vw] xl:w-[28vw] max-w-[280px] 2xl:max-w-[400px] shrink-0 cursor-pointer"
    >
      <div className="relative w-full aspect-[4/5] md:aspect-[3/4] max-h-[50vh] xl:max-h-[60vh] overflow-hidden rounded-2xl md:rounded-[1.5rem] bg-white border border-slate-100 mb-4 md:mb-8 shadow-sm">
        <Image
          src={post.imageSrc}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          unoptimized
        />
        <div className="absolute inset-0 bg-[#008B8B]/5 group-hover:bg-transparent transition-colors duration-500 mix-blend-multiply" />
      </div>
      <div className="flex flex-col px-1 md:px-2">
        <span className="text-[10px] md:text-label-sm uppercase tracking-widest text-[#008B8B] mb-2 md:mb-4 font-bold">
          {post.category}
        </span>
        <h3 className="text-xl md:text-3xl font-display text-ink mb-2 md:mb-4 group-hover:text-[#008B8B] transition-colors duration-500 leading-tight">
          {post.title}
        </h3>
        <div className="mt-auto">
          <span className="text-[10px] md:text-label-sm text-ink/50 uppercase tracking-widest font-medium">
            {post.readTime}
          </span>
        </div>
      </div>
    </Link>
  )

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-[#f8fafd]">
      
      {/* Sticky Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col xl:flex-row overflow-hidden bg-[#f8fafd]">
        
        {/* Left / Top Panel: Solid Sticky Block (Slides over the cards) */}
        <div className="absolute top-0 left-0 w-full h-[40vh] xl:w-[40vw] xl:h-screen bg-white z-20 flex flex-col justify-center px-6 sm:px-12 xl:pl-16 2xl:pl-24 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.05)] border-r border-slate-100">
           <span className="text-[10px] xl:text-label-md uppercase tracking-widest text-[#008B8B] mb-2 xl:mb-6 block font-bold">
             {t('eyebrow')}
           </span>
           <h2 className="text-4xl sm:text-5xl xl:text-6xl 2xl:text-7xl font-display text-ink leading-[0.9] tracking-tight mb-4 xl:mb-8 max-w-[90%] drop-shadow-sm">
             {t('title')}
           </h2>
           <p className="text-xs xl:text-body-md text-ink/70 mb-6 xl:mb-12 max-w-md">
             {t('description')}
           </p>
           
           {/* Interactive Scroll Prompt */}
           <div className="flex items-center gap-3 mb-6 xl:mb-12">
             <div className="w-5 h-8 rounded-full border-[1.5px] border-[#008B8B]/30 flex justify-center pt-1.5 shrink-0 scale-75 xl:scale-100 origin-left">
               <motion.div 
                 animate={{ y: [0, 8, 0], opacity: [1, 0, 1] }} 
                 transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                 className="w-1 h-1.5 bg-[#008B8B] rounded-full"
               />
             </div>
             <span className="text-[8px] xl:text-[9px] font-sans uppercase tracking-[0.25em] font-bold text-[#008B8B]">
               {t('scrollToExplore')}
             </span>
           </div>

           <div>
            <Button variant="outline" asChild className="border-slate-300 text-ink hover:bg-[#008B8B] hover:border-[#008B8B] hover:text-white px-8 xl:px-10 py-5 uppercase tracking-widest text-[11px] xl:text-sm font-bold transition-all duration-300 shadow-sm">
               <Link href="/blog">{t('ctaText')} →</Link>
             </Button>
           </div>
        </div>

        {/* Right / Bottom Track: Horizontally Scrolling Cards */}
        <div className="absolute top-[40vh] xl:top-0 left-0 xl:left-[40vw] w-full xl:w-[60vw] h-[60vh] xl:h-screen flex items-center z-10 overflow-visible">
          
          <motion.div 
            ref={trackRef}
            style={{ x }} 
            className="flex gap-4 xl:gap-12 pl-6 xl:pl-12 pr-6 xl:pr-12 w-max"
          >
            {BLOG_POSTS.slice(0, 5).map((post) => (
              <JournalCard key={post.slug} post={post} />
            ))}
          </motion.div>
          
        </div>

      </div>
    </section>
  )
}

