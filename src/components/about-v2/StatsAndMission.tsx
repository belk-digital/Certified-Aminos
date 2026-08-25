'use client'

import React, { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

export function StatsAndMission() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.fromTo(
      '.stat-item',
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        },
      }
    )
    
    gsap.fromTo(
      '.mission-text',
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 70%',
        }
      }
    )
    gsap.fromTo(
      '.mission-ring',
      { scale: 0.8, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 1.2,
        stagger: 0.15,
        ease: 'back.out(1.2)',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 70%',
        }
      }
    )
  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="py-24 bg-white overflow-hidden relative">
      <div className="w-full px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <h2 className="mission-text text-xl md:text-3xl font-syncopate font-medium uppercase text-slate-900 mb-12 leading-tight">
              Our mission is to empower the researcher in your <span className="font-bold text-blue-900">scientific circle</span>, providing you with the most detailed <span className="italic text-slate-500">analytical insights</span>.
            </h2>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-12 mt-16">
              <div className="stat-item border-l border-blue-900 pl-6">
                <div className="text-5xl font-bold text-slate-900 mb-2">15</div>
                <div className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Years Of Expertise</div>
              </div>
              <div className="stat-item border-l border-blue-900 pl-6">
                <div className="text-5xl font-bold text-slate-900 mb-2">50+</div>
                <div className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Professionals</div>
              </div>
              <div className="stat-item border-l border-blue-900 pl-6">
                <div className="text-5xl font-bold text-slate-900 mb-2">99%</div>
                <div className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Purity Standard</div>
              </div>
              <div className="stat-item border-l border-blue-900 pl-6">
                <div className="text-5xl font-bold text-slate-900 mb-2">30k+</div>
                <div className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Satisfied Clients</div>
              </div>
            </div>
          </div>

          <div className="relative h-[600px] flex items-center justify-center hidden lg:flex ml-8">
             <div className="relative w-[500px] h-[500px]">
                {/* Circle 1: Largest, Transparent border */}
                <div className="mission-ring absolute inset-0 border border-slate-200 rounded-full">
                    <div className="absolute top-[65%] left-0 w-2 h-2 bg-blue-400 rounded-full -translate-x-1/2 -translate-y-1/2">
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-right whitespace-nowrap text-sm font-medium text-slate-700 leading-tight">Research<br/>Support</span>
                    </div>
                </div>
                
                {/* Circle 2: bg-slate-50 */}
                <div className="mission-ring absolute top-[2%] right-[2%] w-[85%] h-[85%] bg-slate-50 border border-slate-100 rounded-full">
                    <div className="absolute bottom-0 left-[45%] w-2 h-2 bg-blue-400 rounded-full -translate-x-1/2 translate-y-1/2">
                       <span className="absolute top-4 left-1/2 -translate-x-1/2 text-center whitespace-nowrap text-sm font-medium text-slate-700 leading-tight">Quality<br/>Assurance</span>
                    </div>
                </div>
                
                {/* Circle 3 */}
                <div className="mission-ring absolute top-[6%] right-[6%] w-[70%] h-[70%] bg-slate-100/50 border border-slate-100 rounded-full">
                    <div className="absolute top-[35%] left-0 w-2 h-2 bg-blue-400 rounded-full -translate-y-1/2 -translate-x-1/2">
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-right whitespace-nowrap text-sm font-medium text-slate-700 leading-tight">Technical<br/>Consultation</span>
                    </div>
                </div>

                {/* Circle 4 */}
                <div className="mission-ring absolute top-[12%] right-[12%] w-[55%] h-[55%] bg-slate-100 border border-slate-200 rounded-full">
                    <div className="absolute bottom-[15%] left-[5%] w-2 h-2 bg-blue-400 rounded-full -translate-x-1/2 translate-y-1/2">
                       <span className="absolute left-4 top-0 text-left whitespace-nowrap text-sm font-medium text-slate-700 leading-tight">HPLC &<br/>MS Testing</span>
                    </div>
                </div>

                {/* Circle 5 */}
                <div className="mission-ring absolute top-[20%] right-[20%] w-[40%] h-[40%] bg-white border border-slate-200 rounded-full shadow-sm">
                    <div className="absolute top-[15%] left-[5%] w-2 h-2 bg-blue-400 rounded-full -translate-y-1/2 -translate-x-1/2">
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-right whitespace-nowrap text-sm font-medium text-slate-700 leading-tight">Peptide<br/>Synthesis</span>
                    </div>
                </div>
                
                {/* The main pivot dot - Top Right */}
                <div className="mission-ring absolute top-[15%] right-[15%] w-6 h-6 bg-blue-400 rounded-full ring-[8px] ring-blue-100 shadow-sm translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="absolute bottom-6 right-6 text-right">
                       <span className="whitespace-nowrap text-sm font-bold text-slate-800 leading-tight">Raw Material<br/>Sourcing</span>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  )
}
