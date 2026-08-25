'use client'

import React, { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger)

export function LabBanner() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.fromTo('.lab-image-container',
      { scale: 0.95, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.5, ease: 'power2.out', scrollTrigger: { trigger: containerRef.current, start: 'top 80%' } }
    )
    
    gsap.fromTo('.lab-text',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.2, scrollTrigger: { trigger: '.lab-text-container', start: 'top 80%' } }
    )
  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="py-24 bg-white">
      <div className="w-full px-6 md:px-12">
        <div className="lab-image-container w-full h-[400px] md:h-[500px] rounded-[2.5rem] overflow-hidden relative mb-24 bg-slate-900 flex items-center justify-center">
           <img src="/lab-banner.jpg" alt="Scientific Laboratory" className="absolute inset-0 w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-br from-navy-deep/90 via-navy-deep/60 to-transparent"></div>
           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
           
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full h-full p-8 md:p-16">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl max-w-sm">
                 <div className="text-sm font-bold text-blue-200 mb-1">ANALYSIS</div>
                 <div className="text-white text-lg">Purity Score</div>
                 <div className="text-6xl font-bold text-white mt-4">99.9<span className="text-3xl">%</span></div>
              </div>
              
              <div className="hidden md:flex h-full items-center justify-center relative w-1/2">
                 <div className="w-[300px] h-[300px] border border-blue-400/30 rounded-full absolute"></div>
                 <div className="w-[200px] h-[200px] border-2 border-blue-400/50 rounded-full absolute"></div>
                 <div className="w-24 h-24 bg-blue-500 rounded-full blur-xl absolute opacity-50"></div>
              </div>
           </div>
        </div>

        <div className="lab-text-container flex flex-col md:flex-row justify-between items-start gap-12">
           <h2 className="lab-text text-xl md:text-3xl font-syncopate font-medium uppercase text-slate-900 max-w-2xl leading-tight">
             Our <Link href="/blog"><span className="font-bold text-blue-900 underline decoration-blue-200 decoration-4 underline-offset-8 cursor-pointer hover:decoration-blue-400 transition-colors">Educational Hub</span></Link> is <br/> a centralized public resource for anyone looking to deepen their understanding of peptide research.
           </h2>
           <div className="lab-text flex flex-col gap-4">
              <div className="text-slate-500 font-semibold uppercase tracking-wider text-sm flex items-center gap-2">
                 <span className="w-4 h-4 rounded-full border-2 border-blue-900 flex items-center justify-center text-[10px] font-bold text-blue-900">R</span> 
                 Read More
              </div>
              <Link href="/blog" className="bg-blue-100 text-blue-900 px-8 py-3 rounded-full font-bold hover:bg-blue-200 transition-colors text-center">
                 Visit Blog
              </Link>
           </div>
        </div>
      </div>
    </section>
  )
}
