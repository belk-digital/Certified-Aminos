'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { FadeUp } from '@/components/motion/FadeUp'
import { BlogPostCard } from '@/components/editorial/BlogPostCard'
import { FluidButton } from '@/components/ui/fluid-button'
import { BlogHero } from '@/components/blog/BlogHero'
import { useTranslations } from 'next-intl'

export type BlogIndexPost = {
  slug: string
  title: string
  category: string
  excerpt: string
  imageSrc: string
  readTime: string
  date: string
  sortDate: string
}

const ALL_LABEL = 'View all'
const CATEGORIES_FIXED = ['Growth research', 'Muscle studies', 'Recovery protocols', 'Metabolic research']

export function BlogIndexClient({ posts }: { posts: BlogIndexPost[] }) {
  const t = useTranslations('blog')
  const categories = useMemo(() => {
    const present = new Set(posts.map((p) => p.category).filter(Boolean))
    return [ALL_LABEL, ...CATEGORIES_FIXED.filter((c) => present.has(c))]
  }, [posts])

  const [activeCategory, setActiveCategory] = useState(ALL_LABEL)
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false)
  const [visibleCount, setVisibleCount] = useState(6)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(scrollContainerRef, { once: true, amount: 0.5 })

  useEffect(() => {
    if (isInView && scrollContainerRef.current) {
      if (scrollContainerRef.current.scrollWidth > scrollContainerRef.current.clientWidth) {
        const timer1 = setTimeout(() => {
          scrollContainerRef.current?.scrollBy({ left: 50, behavior: 'smooth' })
        }, 500)

        const timer2 = setTimeout(() => {
          scrollContainerRef.current?.scrollBy({ left: -50, behavior: 'smooth' })
        }, 1100)

        return () => {
          clearTimeout(timer1)
          clearTimeout(timer2)
        }
      }
    }
  }, [isInView])

  const handleTabsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.currentTarget
    setIsScrolledToEnd(scrollWidth - clientWidth - scrollLeft < 10)
  }

  const { scrollYProgress: heroScroll } = useScroll({ offset: ['start start', 'end start'] })
  useTransform(heroScroll, [0, 1], ['0%', '100%'])

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())
  }, [posts])

  const latestPost = sortedPosts[0]

  const filteredPosts =
    activeCategory === ALL_LABEL ? sortedPosts : sortedPosts.filter((post) => post.category === activeCategory)

  const displayedPosts = filteredPosts.slice(0, visibleCount)
  const hasMore = visibleCount < filteredPosts.length

  return (
    <main className="bg-[#FAFAFA] min-h-screen text-ink font-sans overflow-x-clip">
      <BlogHero />

      {/* Compliance Notice */}
      <section className="px-4 md:px-6 mb-12 lg:mb-16 max-w-[1280px] mx-auto">
        <FadeUp delay={0.3}>
          <div className="bg-white border border-ink/10 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
            <div className="shrink-0 bg-ink/5 p-3 rounded-full hidden sm:block">
              <svg className="w-6 h-6 text-ink/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-ink text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-ink/60 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {t('compliance.title')}
              </h3>
              <p className="text-sm text-ink/70 leading-relaxed font-medium">{t('compliance.description')}</p>
            </div>
          </div>
        </FadeUp>
      </section>

      {latestPost && (
        <section className="px-4 md:px-6 mb-24 lg:mb-32 max-w-[1280px] mx-auto">
          <FadeUp delay={0.4}>
            <div className="mb-6 lg:mb-8 px-2 lg:px-4">
              <h2 className="font-heading text-xl md:text-2xl font-black uppercase tracking-tighter text-ink/60">
                {t('latestArticle')}
              </h2>
            </div>
            <Link
              href={`/${latestPost.slug}`}
              className="group flex flex-col lg:flex-row gap-6 lg:gap-12 items-stretch w-full bg-white p-4 sm:p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-ink/5 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
              <div className="relative w-full lg:w-[55%] aspect-[4/3] lg:aspect-auto rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden border border-ink/5 shrink-0">
                <Image
                  src={latestPost.imageSrc}
                  alt={latestPost.title}
                  fill
                  className="object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-[1.03]"
                  unoptimized
                />
              </div>

              <div className="w-full lg:w-[45%] flex flex-col justify-center px-2 sm:px-4 lg:px-6 py-4 lg:py-8 min-w-0">
                <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-8 flex-wrap">
                  <span className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-ink text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-sm">
                    {latestPost.category || 'Emerging'}
                  </span>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="text-[11px] sm:text-xs font-medium text-ink/50 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {latestPost.date}
                    </span>
                    <span className="text-[11px] sm:text-xs font-medium text-ink/50 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {latestPost.readTime}
                    </span>
                  </div>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-3xl xl:text-4xl font-extrabold font-sans text-ink mb-4 sm:mb-6 tracking-tight leading-[1.1] group-hover:text-primary transition-colors duration-500">
                  {latestPost.title}
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-ink/60 mb-8 sm:mb-10 leading-relaxed font-medium line-clamp-3 sm:line-clamp-4">
                  {latestPost.excerpt}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="w-[155px] md:w-[215px] flex shrink-0 items-center">
                    <FluidButton text={t('readArticle')} className="scale-[0.75] origin-left" />
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (navigator.share) {
                        navigator
                          .share({
                            title: latestPost.title,
                            text: latestPost.excerpt,
                            url: window.location.origin + '/' + latestPost.slug,
                          })
                          .catch(console.error)
                      } else {
                        navigator.clipboard.writeText(window.location.origin + '/' + latestPost.slug)
                        alert(t('linkCopied'))
                      }
                    }}
                    className="p-2 sm:p-3 bg-cream border border-ink/5 rounded-full hover:bg-primary/10 hover:text-primary transition-colors text-ink/40 group-hover:border-primary/20 shrink-0"
                    aria-label={t('shareArticle')}
                    title={t('shareArticle')}
                  >
                    <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
                    </svg>
                  </button>
                </div>
              </div>
            </Link>
          </FadeUp>
        </section>
      )}

      {/* Filter Chips */}
      {categories.length > 1 && (
        <section className="px-4 md:px-6 mb-16 max-w-[1280px] mx-auto flex justify-start lg:justify-center">
          <div className="relative w-full lg:w-auto bg-white rounded-full shadow-sm border border-ink/5">
            <div
              className={`absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white via-white/90 to-transparent pointer-events-none lg:hidden rounded-r-full z-10 transition-opacity duration-300 ${isScrolledToEnd ? 'opacity-0' : 'opacity-100'}`}
            />

            <div
              ref={scrollContainerRef}
              className="flex items-center gap-2 md:gap-4 overflow-x-auto snap-x w-full p-2 relative z-0 rounded-full"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onScroll={handleTabsScroll}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat)
                    setVisibleCount(6)
                  }}
                  className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 snap-center shrink-0 relative z-20 ${
                    activeCategory === cat ? 'bg-ink text-white shadow-md' : 'bg-transparent text-ink/60 hover:text-ink hover:bg-ink/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Grid */}
      <section className="px-4 md:px-6 max-w-[1280px] mx-auto mb-16 md:mb-24">
        {displayedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            {displayedPosts.map((post, index) => (
              <FadeUp key={post.slug} delay={0.1 * (index % 3)}>
                <BlogPostCard {...post} />
              </FadeUp>
            ))}
          </div>
        ) : (
          <FadeUp className="w-full flex flex-col items-center justify-center py-24 text-center">
            <h3 className="text-2xl font-black font-sans text-ink mb-4">{t('noArticlesFound')}</h3>
            <p className="text-ink/60">{t('noArticlesDesc', { category: activeCategory })}</p>
            <button
              onClick={() => {
                setActiveCategory(ALL_LABEL)
                setVisibleCount(6)
              }}
              className="mt-8 px-6 py-2.5 rounded-full bg-ink text-white font-bold text-sm tracking-wide hover:bg-primary transition-colors"
            >
              {t('viewAllArticles')}
            </button>
          </FadeUp>
        )}
      </section>

      {hasMore && (
        <section className="pb-32 flex justify-center items-center px-4 w-full">
          <FadeUp>
            <button
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-ink text-white rounded-full shadow hover:shadow-md hover:bg-ink/80 transition-all duration-300 text-xs font-bold tracking-widest uppercase"
            >
              {t('loadMore')}
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </FadeUp>
        </section>
      )}
    </main>
  )
}
