'use client'

import React, { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { motion, AnimatePresence } from 'framer-motion'

gsap.registerPlugin(ScrollTrigger)

const tabs = [
  { id: '01', title: 'SYNTHESIS PLANNING', desc: 'Detailed approach to sequence assembly and coupling strategies ensuring the correct amino acid chain.', image: '/science/synthesis.jpg' },
  { id: '02', title: 'CLEAVAGE & DEPROTECTION', desc: 'Careful removal of protective groups to maintain peptide integrity without side reactions.', image: '/science/cleavage.jpg' },
  { id: '03', title: 'PURIFICATION', desc: 'Advanced preparative HPLC to isolate the target peptide from any truncated sequences or impurities.', image: '/science/purification.jpg' },
  { id: '04', title: 'LYOPHILIZATION', desc: 'Freeze-drying process ensuring maximum stability and shelf-life for the final product.', image: '/science/lyophilization.jpg' },
  { id: '05', title: 'FINAL ANALYSIS', desc: 'Comprehensive QA/QC including Mass Spectrometry and analytical HPLC for batch verification.', image: '/science/analysis.jpg' },
]

export function ScienceTabs() {
  const [activeTab, setActiveTab] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveTab((prev) => (prev + 1) % tabs.length)
    }, 5000)
    return () => clearTimeout(timer)
  }, [activeTab])

  useGSAP(() => {
    gsap.fromTo('.science-title',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, scrollTrigger: { trigger: containerRef.current, start: 'top 70%' } }
    )
    gsap.fromTo('.science-tab',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, scrollTrigger: { trigger: '.science-tabs-container', start: 'top 80%' } }
    )
  }, { scope: containerRef })

  return (
    <section ref={containerRef} id="science" className="py-24 bg-navy-deep font-inter relative overflow-hidden">
      <div className="w-full px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
           <h2 className="science-title text-4xl md:text-5xl font-syncopate font-medium uppercase text-white max-w-lg">
             The Science Behind Our Services
           </h2>
           <p className="science-title text-gray-400 max-w-md text-lg">
             Pioneering new frontiers in research. We use advanced methodologies that combine traditional synthesis with modern analytical rigor.
           </p>
        </div>

        <div className="science-tabs-container border-b border-gray-700 flex overflow-x-auto no-scrollbar mb-12 pb-[2px] relative">
           {tabs.map((tab, idx) => (
             <button 
                key={tab.id}
                onClick={() => setActiveTab(idx)}
                className={`science-tab flex-1 min-w-[220px] text-left pb-6 px-4 border-b-2 relative transition-colors duration-300 ${activeTab === idx ? 'border-transparent' : 'border-transparent hover:border-gray-500'}`}
             >
                <div className={`text-sm font-bold mb-2 ${activeTab === idx ? 'text-white' : 'text-gray-500'}`}>{tab.id}</div>
                <div className={`text-sm tracking-wider uppercase font-semibold ${activeTab === idx ? 'text-white' : 'text-gray-400'}`}>{tab.title}</div>
                {activeTab === idx && (
                  <motion.div 
                    layoutId="activeTabProgress"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                    className="absolute bottom-[-2px] left-0 h-[2px] bg-white z-10"
                  />
                )}
             </button>
           ))}
        </div>

        <div className="bg-[#0b1120] rounded-[2rem] overflow-hidden flex flex-col md:flex-row min-h-[400px] border border-white/10 shadow-2xl relative">
           <div className="w-full md:w-1/2 relative h-[300px] md:h-auto overflow-hidden">
             <AnimatePresence mode="wait">
               <motion.img 
                 key={tabs[activeTab].image}
                 initial={{ opacity: 0, scale: 1.05 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.5 }}
                 src={tabs[activeTab].image} 
                 alt={tabs[activeTab].title} 
                 className="absolute inset-0 w-full h-full object-cover" 
               />
             </AnimatePresence>
             {/* Gradient overlay to seamlessly blend the image into the dark background */}
             <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0b1120] via-[#0b1120]/40 to-transparent"></div>
           </div>
           
           <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center z-10 relative">
             <AnimatePresence mode="wait">
               <motion.div
                 key={tabs[activeTab].id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.5 }}
                 className="max-w-xl"
               >
                 <span className="text-blue-400 font-syncopate font-bold text-sm tracking-[0.2em] mb-4 block">STEP {tabs[activeTab].id}</span>
                 <h3 className="text-3xl font-bold text-white mb-6">{tabs[activeTab].title}</h3>
                 <p className="text-xl text-gray-300 leading-relaxed">{tabs[activeTab].desc}</p>
               </motion.div>
             </AnimatePresence>
           </div>
        </div>
      </div>
    </section>
  )
}
