'use client'

import React, { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ArrowUpRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export function AdvantagesGrid() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.fromTo('.advantage-card',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, scrollTrigger: { trigger: containerRef.current, start: 'top 70%' } }
    )
  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="py-24 bg-[#FAFAFA]">
      <div className="w-full px-6 md:px-12">
        <div className="flex justify-between items-end mb-16 border-b border-slate-200 pb-8">
           <h2 className="text-sm font-bold tracking-widest uppercase text-slate-500">Why Work With Us</h2>
           <h3 className="text-4xl md:text-5xl font-syncopate font-medium uppercase text-slate-900">Our Advantages</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Card 1 */}
           <div className="advantage-card bg-white p-8 rounded-2xl border border-slate-200 hover:border-blue-900 transition-colors group cursor-pointer flex flex-col h-[300px]">
              <div className="flex justify-between items-start mb-auto">
                 <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">Advantage 1</div>
                 <ArrowUpRight className="w-6 h-6 text-slate-400 group-hover:text-blue-900 transition-colors" />
              </div>
              <div>
                 <h4 className="text-2xl font-bold text-slate-900 mb-2">Precision & <br/> Personalization</h4>
                 <div className="flex items-end gap-2">
                    <span className="text-6xl font-light text-slate-300">01</span>
                 </div>
              </div>
           </div>

           {/* Card 2 */}
           <div className="advantage-card bg-white p-8 rounded-2xl border border-slate-200 hover:border-blue-900 transition-colors group cursor-pointer flex flex-col h-[300px]">
              <div className="flex justify-between items-start mb-auto">
                 <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">Advantage 2</div>
                 <ArrowUpRight className="w-6 h-6 text-slate-400 group-hover:text-blue-900 transition-colors" />
              </div>
              <div>
                 <h4 className="text-2xl font-bold text-slate-900 mb-2">Proactive & <br/> Preventative</h4>
                 <div className="flex items-end gap-2">
                    <span className="text-6xl font-light text-slate-300">02</span>
                 </div>
              </div>
           </div>

           {/* Card 3 */}
           <div className="advantage-card bg-white p-8 rounded-2xl border border-slate-200 hover:border-blue-900 transition-colors group cursor-pointer flex flex-col h-[300px]">
              <div className="flex justify-between items-start mb-auto">
                 <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">Advantage 3</div>
                 <ArrowUpRight className="w-6 h-6 text-slate-400 group-hover:text-blue-900 transition-colors" />
              </div>
              <div>
                 <h4 className="text-2xl font-bold text-slate-900 mb-2">Scientific <br/> Rigor</h4>
                 <div className="flex items-end gap-2">
                    <span className="text-6xl font-light text-slate-300">03</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  )
}
