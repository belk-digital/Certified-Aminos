'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface TocHeading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TocHeading[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // Wait for the DOM to be fully rendered
    const elements = Array.from(document.querySelectorAll('.prose-article h2, .prose-article h3'))
      .filter(el => el.textContent?.trim().length) as HTMLElement[];
    
    const seenIds = new Set<string>();

    const extractedHeadings = elements.map((element, index) => {
      // Get base ID or generate one from text
      const baseId = element.id || element.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `heading-${index}`;
      
      // Ensure it is unique
      let finalId = baseId;
      let counter = 1;
      while (seenIds.has(finalId)) {
        finalId = `${baseId}-${counter}`;
        counter++;
      }
      seenIds.add(finalId);

      // Update the DOM element's ID so scrolling works
      if (element.id !== finalId) {
        element.id = finalId;
      }

      return {
        id: finalId,
        text: element.textContent || '',
        level: element.tagName === 'H3' ? 3 : 2
      }
    })
    
    setHeadings(extractedHeadings)

    // Intersection observer to highlight active section
    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id)
        }
      })
    }

    const observer = new IntersectionObserver(callback, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 1.0
    })

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Smooth scroll to the element, adjusting for sticky headers if any
      const top = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  if (headings.length === 0) return null;

  return (
    <div className="hidden lg:block sticky top-40 w-full">
      <div className="relative">
        <div
          data-lenis-prevent
          className="max-h-[calc(100vh-220px)] overflow-y-auto toc-scrollbar pr-4 pb-6"
        >
          <h4 className="text-label-md text-gold uppercase tracking-wider mb-6">In This Article</h4>
          <nav className="space-y-4 border-l border-ink/10 pl-4">
            {headings.map((heading) => (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className={`block text-sm transition-all duration-300 relative ${
                  heading.level === 3 ? 'ml-4' : ''
                } ${
                  activeId === heading.id
                    ? 'text-ink font-medium before:content-[""] before:absolute before:-left-[17px] before:top-0 before:bottom-0 before:w-[2px] before:bg-gold'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {heading.text}
              </a>
            ))}
          </nav>
        </div>
        {/* Purely decorative veil over the scroll edge — sits on top of the box, doesn't consume its scrollable height */}
        <div className="absolute bottom-0 left-0 right-4 h-10 bg-gradient-to-t from-[#FAFAFA] to-transparent pointer-events-none" />
      </div>
    </div>
  )
}
