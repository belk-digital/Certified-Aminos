'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { faqData as faqDataEn } from '@/data/faqs'
import { faqData as faqDataEs } from '@/data/faqs.es'
import { FaqCategorySection } from './FaqCategorySection'
import Link from 'next/link'

export function FaqClient() {
  const t = useTranslations('content.faqClient')
  const heroT = useTranslations('content.faqHero')
  const locale = useLocale()
  const faqData = false ? faqDataEs : faqDataEn
  const [activeCategory, setActiveCategory] = useState<string>(faqData[0]?.category || '');
  const [headerHidden, setHeaderHidden] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(115); 
  const [searchQuery, setSearchQuery] = useState('');
  
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pillContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeaderHeight = () => {
      const headerEl = document.querySelector('.fixed.top-0.inset-x-0.z-sticky');
      if (headerEl) {
        setHeaderHeight(headerEl.getBoundingClientRect().height);
      }
    };
    
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    
    const observer = new MutationObserver(updateHeaderHeight);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    
    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
      observer.disconnect();
    };
  }, []);

  const { scrollY } = useScroll();
  const lastYRef = useRef(0);

  useMotionValueEvent(scrollY, 'change', (y) => {
    const difference = y - lastYRef.current;
    if (Math.abs(difference) > 20) {
      if (difference > 0 && y > 150) {
        setHeaderHidden(true);
      } else {
        setHeaderHidden(false);
      }
      lastYRef.current = y;
    }
  });

  // Intersection Observer for highlighting active tab
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let visibleSection = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleSection = entry.target.getAttribute('data-category');
            break; 
          }
        }
        if (visibleSection && !searchQuery) {
          setActiveCategory(visibleSection);
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px', 
        threshold: 0
      }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      sectionRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [searchQuery]);

  // Auto-scroll active pill into view when activeCategory changes (for mobile)
  useEffect(() => {
    const container = pillContainerRef.current;
    if (!container || !activeCategory) return;
    
    const slug = activeCategory.replace(/\s+/g, '-').toLowerCase();
    const activeButton = document.getElementById(`pill-category-${slug}`);
    
    if (activeButton) {
      const scrollLeft = activeButton.offsetLeft - (container.clientWidth / 2) + (activeButton.clientWidth / 2);
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeCategory]);

  const scrollToCategory = (category: string) => {
    setActiveCategory(category);
    const element = document.getElementById(`faq-category-${category.replace(/\s+/g, '-').toLowerCase()}`);
    if (element) {
      const offset = 180;
      const y = element.getBoundingClientRect().top + window.scrollY - offset;
      
      const html = document.documentElement;
      html.style.setProperty('scroll-behavior', 'auto', 'important');
      window.scrollTo(0, y);
      html.style.removeProperty('scroll-behavior');
    }
  };

  // Filter logic
  const filteredFaqData = faqData.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="bg-navy-deep min-h-screen relative font-sans text-white">
      
      <div className="max-w-[1920px] mx-auto px-6 lg:px-12 pt-[160px] md:pt-[200px] pb-24 md:pb-32 flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
        
        {/* Left Sidebar */}
        <div className="lg:w-[35%] xl:w-[25%] relative">
          <div className="flex flex-col gap-6 z-30">
            
            {/* Title */}
            <div className="mb-2">
               <h1 className="text-3xl md:text-4xl lg:text-5xl font-syncopate uppercase font-bold text-white tracking-tight leading-[1.1]">
                 Frequently Asked<br/>Questions
               </h1>
            </div>

            {/* Search Bar */}
            <div className="relative group w-full mb-2">
              <input 
                type="text" 
                placeholder={false ? 'Buscar preguntas...' : 'Search'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative w-full px-4 py-3 pl-11 rounded-lg border border-white/10 bg-white/5 backdrop-blur-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-white placeholder-gray-500 font-medium text-sm md:text-base"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Desktop Category Navigation */}
            {!searchQuery && (
               <div className="hidden lg:flex flex-col gap-1 border-t border-b border-white/10 py-6">
                 <span className="text-[13px] text-white font-bold mb-2 px-3 tracking-wide">All Topics</span>
                 {filteredFaqData.map((categoryData) => (
                    <button
                      key={categoryData.category}
                      onClick={() => scrollToCategory(categoryData.category)}
                      className={`text-left py-2.5 px-3 text-[14px] font-medium transition-all duration-300 border-l-2 ${
                        activeCategory === categoryData.category
                          ? 'border-blue-500 text-white bg-white/5'
                          : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {categoryData.category}
                    </button>
                 ))}
               </div>
            )}

            {/* Sidebar Contact Box */}
            <div className="hidden lg:block bg-white/5 rounded-2xl p-6 border border-white/10 mt-2">
               <h3 className="text-lg font-bold text-white mb-2">Still have questions?</h3>
               <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                 If you didn't find your answer, feel free to reach out.
               </p>
               <Link href="/contact" className="block w-full text-center py-2.5 bg-white/10 text-white border border-white/10 text-sm font-semibold rounded-lg hover:bg-white hover:text-navy-deep transition-colors">
                 Contact Support
               </Link>
            </div>
            
          </div>
        </div>

        {/* Mobile Filter Pills */}
        {!searchQuery && (
          <div className="lg:hidden sticky z-40 w-full transition-all duration-300 ease-out" style={{ top: headerHidden ? '20px' : `${headerHeight + 20}px` }}>
            <div className="relative flex w-full bg-navy-deep/90 backdrop-blur-md rounded-full shadow-md border border-white/10">
              <div 
                ref={pillContainerRef}
                className="flex items-center gap-2 overflow-x-auto snap-x p-2 relative z-0 rounded-full min-w-0"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <style jsx>{`
                  div::-webkit-scrollbar { display: none; }
                `}</style>
                {filteredFaqData.map((categoryData) => (
                  <button
                    key={categoryData.category}
                    id={`pill-category-${categoryData.category.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => scrollToCategory(categoryData.category)}
                    className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[12px] font-semibold transition-all duration-300 snap-center shrink-0 relative z-20 ${
                      activeCategory === categoryData.category
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {categoryData.category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Right Content */}
        <div className="lg:w-[65%] xl:w-[75%]">
           {filteredFaqData.length > 0 ? (
             filteredFaqData.map((categoryData, i) => (
               <div 
                 key={categoryData.category}
                 id={`faq-category-${categoryData.category.replace(/\s+/g, '-').toLowerCase()}`}
                 data-category={categoryData.category}
                 ref={(el) => { sectionRefs.current[i] = el; }}
                 className="pt-6 lg:pt-8 scroll-mt-[180px]"
               >
                 <FaqCategorySection category={categoryData} />
               </div>
             ))
           ) : (
             <div className="w-full py-24 flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                 <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
               </div>
               <h3 className="font-sans text-xl md:text-2xl font-bold text-white mb-2">
                 {false ? 'No se encontraron resultados' : 'No results found'}
               </h3>
               <p className="text-gray-400 max-w-md">
                 {false 
                   ? 'No pudimos encontrar ninguna pregunta frecuente que coincida con tu búsqueda. Intenta con otras palabras.' 
                   : 'We couldn\'t find any FAQs matching your search. Try different keywords.'}
               </p>
             </div>
           )}

           {/* Mobile Contact Box */}
           <div className="lg:hidden mt-12 mb-8 bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-2">Still have questions?</h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                If you didn't find your answer, feel free to reach out.
              </p>
              <Link href="/contact" className="block w-full text-center py-3 bg-white/10 text-white border border-white/10 text-sm font-semibold rounded-lg hover:bg-white hover:text-navy-deep transition-colors">
                Contact Support
              </Link>
           </div>

        </div>

      </div>
    </div>
  )
}
