'use client'

import React, { useRef } from 'react'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

export type BlogSectionPost = {
  slug: string
  title: string
  category: string
  excerpt: string
  imageSrc: string
  readTime: string
  date: string
}

export function BlogSection({ posts }: { posts: BlogSectionPost[] }) {
  const t = useTranslations('home.blogSection')
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  if (!posts || posts.length === 0) return null

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -350, behavior: 'smooth' })
  }

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 350, behavior: 'smooth' })
  }

  return (
    <section className="w-full py-24 px-8 flex justify-center items-center font-inter bg-white">
      <div className="w-full flex flex-col min-w-0 max-w-[1600px]">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8 md:gap-4">
          <div className="flex flex-col items-start text-left max-w-2xl">
            <span className="text-[11px] text-gray-400 tracking-[0.2em] font-bold uppercase mb-4">
              Journal
            </span>
            <h2 className="font-syncopate text-navy-deep text-4xl md:text-5xl lg:text-[4rem] font-medium tracking-tight leading-[1.1] uppercase mb-4">
              {t('titleLine1')}
              <br />
              {t('titleLine2')}
            </h2>
            <p className="text-gray-500 text-sm md:text-[15px] leading-relaxed mb-8">
              Explore our latest articles, clinical updates, and laboratory best practices
              carefully curated by our expert research team.
            </p>
            <Link
              href="/blog"
              className="px-8 py-3 bg-navy-deep text-white border border-navy-deep text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-[#0a234f] transition-all shadow-sm inline-block"
            >
              {t('ctaText')}
            </Link>
          </div>

          <div className="flex flex-col items-start md:items-end gap-6">
            <div className="hidden sm:flex items-center gap-2 pb-2">
              <button
                onClick={scrollLeft}
                className="w-12 h-12 flex justify-center items-center border border-gray-300 bg-white hover:bg-gray-100 transition-colors text-gray-700"
                aria-label="Previous posts"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button
                onClick={scrollRight}
                className="w-12 h-12 flex justify-center items-center border border-gray-800 bg-gray-800 hover:bg-black transition-colors text-white"
                aria-label="Next posts"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-2 hide-scrollbar"
        >
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/${post.slug}`}
              className="min-w-[280px] md:min-w-[340px] max-w-[340px] h-[480px] flex-shrink-0 snap-start flex flex-col bg-white border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all duration-300 rounded-2xl overflow-hidden group"
            >
              <div className="relative w-full h-1/2 bg-gray-100">
                <Image
                  src={post.imageSrc}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
              </div>

              <div className="flex flex-col p-6 h-1/2">
                <span className="text-[11px] font-medium text-gray-500 mb-3 tracking-wide">
                  {post.category}
                </span>

                <h3 className="font-semibold text-gray-900 text-[1.1rem] leading-snug mb-6 line-clamp-3 pr-4">
                  {post.title}
                </h3>

                <div className="mt-auto flex items-center justify-between text-xs font-medium text-gray-500">
                  <span className="flex items-center group-hover:text-black transition-colors">
                    Read Blog
                    <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile controls */}
        <div className="flex justify-center gap-4 mt-8 sm:hidden">
          <button onClick={scrollLeft} className="p-3 border border-gray-300 rounded-full active:bg-gray-100">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button onClick={scrollRight} className="p-3 bg-gray-800 text-white rounded-full active:bg-black">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>
    </section>
  )
}
