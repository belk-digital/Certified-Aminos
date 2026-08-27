'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export function BlogPostCard({
  slug,
  title,
  category,
  excerpt,
  imageSrc,
  readTime,
  date,
}: {
  slug: string
  title: string
  category: string
  excerpt: string
  imageSrc: string
  readTime: string
  date?: string
}) {
  return (
    <Link href={`/${slug}`} className="group block h-full">
      <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-black/5 hover:shadow-xl hover:-translate-y-1 hover:shadow-black/5 transition-all duration-500 h-full flex flex-col">
        <div className="relative w-full aspect-[16/10] rounded-[1.5rem] overflow-hidden mb-6">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            unoptimized
          />
        </div>
        <div className="px-2 pb-2 flex flex-col flex-1">
          <div className="inline-block px-3 py-1.5 bg-ink/5 text-ink/70 text-[11px] font-bold uppercase tracking-wider rounded-full mb-4 w-fit">
            {category}
          </div>
          <h3 className="text-xl font-bold text-ink leading-[1.3] group-hover:text-gold-dark transition-colors mb-4 line-clamp-2">
            {title}
          </h3>
          <p className="text-ink-muted text-sm md:text-base leading-relaxed mb-6 line-clamp-2 font-medium">
            {excerpt}
          </p>
          <div className="mt-auto pt-6 border-t border-ink/10 flex items-center justify-between">
             <span className="text-sm font-semibold text-ink/70">Certified Aminos</span>
             <div className="flex items-center gap-3">
               {date && (
                 <span className="text-xs text-ink/40 font-medium hidden sm:inline-block">{date}</span>
               )}
               <span className="text-xs text-ink/40 font-medium">{readTime}</span>
             </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
