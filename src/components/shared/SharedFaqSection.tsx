'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export type FaqItemType = {
  question: string
  answer: string | React.ReactNode
}

export function SharedFaqSection({
  title,
  subtitle,
  description,
  faqs,
}: {
  title: string | React.ReactNode
  subtitle?: string
  description?: string | React.ReactNode
  faqs: FaqItemType[]
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const sectionRef = useRef<HTMLElement>(null)
  const contentRefs = useRef<(HTMLDivElement | null)[]>([])

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.from('.faq-header-elem', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.faq-header',
          start: 'top 80%',
        },
      })

      gsap.from('.faq-item', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.faq-container',
          start: 'top 75%',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    contentRefs.current.forEach((ref, index) => {
      if (ref) {
        ref.style.maxHeight = openIndex === index ? `${ref.scrollHeight}px` : '0px'
      }
    })
  }, [openIndex])

  return (
    <section
      ref={sectionRef}
      className="w-full bg-navy-deep font-inter relative overflow-hidden flex flex-col lg:flex-row"
    >
      <div className="w-full lg:flex-1 py-20 px-8 lg:px-12 flex flex-col justify-center">
        <div className="faq-header flex flex-col items-start text-left mb-16">
          {subtitle && (
            <span className="faq-header-elem text-[11px] text-gray-400 tracking-[0.2em] font-semibold uppercase mb-4">
              {subtitle}
            </span>
          )}
          <h2 className="faq-header-elem font-syncopate text-white text-4xl md:text-5xl lg:text-[68px] font-medium leading-[1.1] tracking-wide mb-6 uppercase">
            {title}
          </h2>
          {description && (
            <p className="faq-header-elem text-gray-400 text-[15px] max-w-2xl leading-relaxed mb-8">
              {description}
            </p>
          )}
          <div className="faq-header-elem mt-2">
            <Link
              href="/faq"
              className="px-10 py-5 bg-white text-navy-deep text-[11px] md:text-xs font-bold tracking-[0.2em] uppercase rounded hover:bg-gray-200 transition-all shadow-md inline-flex items-center gap-2 group"
            >
              View All FAQs
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:translate-x-1"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        </div>

        <div className="faq-container w-full flex flex-col">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div key={index} className="faq-item border-b border-gray-700 py-6">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between text-left group cursor-pointer"
                >
                  <h3
                    className={`text-[18px] md:text-[22px] lg:text-[26px] uppercase font-syncopate font-medium tracking-wide transition-colors duration-300 text-left leading-snug ${isOpen ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}
                  >
                    {faq.question}
                  </h3>
                  <div
                    className={`ml-4 flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${isOpen ? 'border-primary bg-primary text-navy-deep' : 'border-gray-500 text-gray-400 group-hover:border-white group-hover:text-white'}`}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </button>
                <div
                  ref={(el) => {
                    contentRefs.current[index] = el
                  }}
                  className="overflow-hidden transition-all duration-500 ease-in-out"
                  style={{ maxHeight: '0px' }}
                >
                  <div className="pt-6 pb-2 text-gray-400 text-[14px] md:text-[16px] leading-relaxed pr-12">
                    {faq.answer}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div
        className="hidden lg:block lg:w-[25%] xl:w-[35%] max-w-[500px] bg-contain bg-right bg-no-repeat opacity-90"
        style={{ backgroundImage: "url('/red-strip.png')" }}
      ></div>
    </section>
  )
}
