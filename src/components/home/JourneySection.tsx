'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { PlusCircle } from 'lucide-react'

const STEPS = [
  {
    id: 1,
    title: "Step 1.",
    heading: "Sourcing & Synthesis — Where purity starts",
    image: "/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_50_41 AM.webp",
    type: "image" 
  },
  {
    id: 2,
    title: "Step 2.",
    heading: "Validating identity and mass with 3rd-Party Testing",
    image: "/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_41_24 AM.webp",
    type: "solid" 
  },
  {
    id: 3,
    title: "Step 3.",
    heading: "Securing compounds via Cold-Chain Packaging",
    image: "/HelixBio Images/ChatGPT Image Jul 20, 2026, 05_51_21 AM.webp",
    type: "solid"
  },
  {
    id: 4,
    title: "Step 4.",
    heading: "Fast, tracked shipping straight to your lab",
    image: "/HelixBio Images/package-box.webp",
    type: "image"
  }
]

export function JourneySection() {
  return (
    <section className="bg-[#FAFAFA] py-24 md:py-40 relative font-sans overflow-hidden">
      <style>{`
        .animate-flow {
          stroke-dasharray: 8 8;
          animation: flow 20s linear infinite;
        }
        @keyframes flow {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
      
      <div className="mx-auto w-[1200px] h-[1400px] relative hidden lg:block origin-top scale-[0.8] xl:scale-100">
        
        {/* Single Master SVG for all arrows to ensure perfect pixel alignment */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 1200 1400">
          
          {/* Base wires removed so the animated dashes are clearly visible without overlapping a solid line of the exact same color */}

          {/* Manual Arrowheads (Solid, high opacity, perfectly horizontal to prevent browser marker rotation bugs) */}
          <g stroke="#d9f0ff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Arrow 1 Head (points right, 12px solid stem) */}
            <path d="M708,340 L720,340 M710,334 L720,340 L710,346" />
            {/* Arrow 2 Head (points left, 12px solid stem) */}
            <path d="M612,790 L600,790 M610,784 L600,790 L610,796" />
            {/* Arrow 3 Head (points right, 12px solid stem) */}
            <path d="M668,1160 L680,1160 M670,1154 L680,1160 L670,1166" />
          </g>

          {/* Animated pulses (Dashed, high opacity, running along the wires) */}
          <g stroke="#d9f0ff" strokeWidth="2" fill="none" strokeOpacity="1" className="animate-flow">
            <path d="M460,200 C560,200 600,340 700,340 L720,340" />
            <path d="M720,400 C650,400 650,790 620,790 L600,790" />
            <path d="M600,850 C630,850 630,1160 660,1160 L680,1160" />
          </g>
        </svg>

        {/* Text Annotations */}
        <div className="absolute top-[320px] left-[400px] w-[200px] z-10 backdrop-blur-md bg-white/70 border border-black/5 rounded-2xl p-4 shadow-sm">
          <p className="text-center text-slate-700 text-[13px] font-semibold leading-relaxed">
            Sourcing starts with careful screening of every raw material batch.
          </p>
        </div>
        <div className="absolute top-[560px] left-[730px] w-[220px] z-10 backdrop-blur-md bg-white/70 border border-black/5 rounded-2xl p-4 shadow-sm">
          <p className="text-left text-slate-700 text-[13px] font-semibold leading-relaxed">
            Independent lab verification is what makes the resulting data trustworthy.
          </p>
        </div>
        <div className="absolute top-[980px] left-[400px] w-[200px] z-10 backdrop-blur-md bg-white/70 border border-black/5 rounded-2xl p-4 shadow-sm">
          <p className="text-right text-slate-700 text-[13px] font-semibold leading-relaxed">
            Cold-chain handling keeps every vial stable, wherever it's headed.
          </p>
        </div>

        {/* Step 1 */}
        <motion.div 
          className="absolute top-0 left-[60px] w-[400px] h-[280px] rounded-[24px] border border-black/5 overflow-hidden group shadow-[0_20px_40px_rgba(0,0,0,0.1)] z-20 cursor-pointer"
          initial="hidden"
          whileInView="visible"
          whileHover="hover"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            hover: { y: -8, transition: { duration: 0.3 } }
          }}
        >
          <Image src={STEPS[0].image} alt={STEPS[0].heading} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
          <div className="absolute inset-0 bg-black/30 mix-blend-overlay pointer-events-none transition-opacity group-hover:opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute inset-0 px-8 pt-8 pb-4 flex flex-col justify-end gap-6 z-10">
            <div>
              <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full mb-3">
                <p className="text-white font-medium text-xs tracking-wider uppercase">{STEPS[0].title}</p>
              </div>
              <h3 className="text-white text-2xl font-bold leading-snug max-w-[90%] tracking-tight">{STEPS[0].heading}</h3>
            </div>
            <button className="flex items-center gap-2 text-[#d9f0ff] text-sm font-semibold hover:text-white transition-all w-fit group-hover:gap-3">
              Read more <PlusCircle size={16} />
            </button>
          </div>
        </motion.div>

        {/* Step 2 */}
        <motion.div 
          className="absolute top-[200px] left-[720px] w-[420px] h-[280px] group cursor-pointer"
          initial="hidden"
          whileInView="visible"
          whileHover="hover"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            hover: { y: -8, transition: { duration: 0.3 } }
          }}
        >
          {/* Peeking Image */}
          <motion.div 
            className="absolute top-[40px] right-0 w-[180px] h-[240px] rounded-[24px] overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.15)] z-0"
            variants={{
              hidden: { x: -20, opacity: 0, rotate: -5, scale: 0.9 },
              visible: { 
                 x: 80, opacity: 1, rotate: 6, scale: 1,
                 transition: { duration: 0.8, delay: 0.2, type: "spring", bounce: 0.4 } 
              },
              hover: { 
                 x: 100, rotate: 10, scale: 1.05,
                 transition: { duration: 0.4, type: "spring", bounce: 0.5 } 
              }
            }}
          >
             <Image src={STEPS[1].image} alt={STEPS[1].heading} fill className="object-cover" />
          </motion.div>
          {/* Solid Card */}
          <div className="absolute inset-0 bg-[#0B1221] rounded-[24px] border border-white/10 px-8 pt-8 pb-4 flex flex-col justify-end gap-6 shadow-[0_30px_60px_rgba(0,0,0,0.25)] z-10 overflow-hidden">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#0ea5e9] opacity-20 blur-[60px] rounded-full pointer-events-none group-hover:opacity-30 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="inline-block px-3 py-1 bg-white/10 rounded-full mb-3">
                <p className="text-white/90 font-medium text-xs tracking-wider uppercase">{STEPS[1].title}</p>
              </div>
              <h3 className="text-white text-3xl font-bold leading-snug max-w-[90%] tracking-tight">{STEPS[1].heading}</h3>
            </div>
            <button className="relative z-10 flex items-center gap-2 text-[#d9f0ff] text-sm font-semibold hover:text-white transition-all w-fit group-hover:gap-3">
              Read more <PlusCircle size={16} />
            </button>
          </div>
        </motion.div>

        {/* Step 3 */}
        <motion.div 
          className="absolute top-[650px] left-[180px] w-[420px] h-[280px] group cursor-pointer"
          initial="hidden"
          whileInView="visible"
          whileHover="hover"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            hover: { y: -8, transition: { duration: 0.3 } }
          }}
        >
          {/* Peeking Image Left */}
          <motion.div 
            className="absolute top-[20px] left-0 w-[200px] h-[240px] rounded-[24px] overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.15)] z-0"
            variants={{
              hidden: { x: 20, opacity: 0, rotate: 5, scale: 0.9 },
              visible: { 
                 x: -90, opacity: 1, rotate: -6, scale: 1,
                 transition: { duration: 0.8, delay: 0.2, type: "spring", bounce: 0.4 } 
              },
              hover: { 
                 x: -110, rotate: -10, scale: 1.05,
                 transition: { duration: 0.4, type: "spring", bounce: 0.5 } 
              }
            }}
          >
             <Image src={STEPS[2].image} alt={STEPS[2].heading} fill className="object-cover" />
          </motion.div>
          {/* Solid Card */}
          <div className="absolute inset-0 bg-[#0B1221] rounded-[24px] border border-white/10 px-8 pt-8 pb-4 flex flex-col justify-end gap-6 shadow-[0_30px_60px_rgba(0,0,0,0.25)] z-10 overflow-hidden">
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#0284c7] opacity-20 blur-[60px] rounded-full pointer-events-none group-hover:opacity-30 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="inline-block px-3 py-1 bg-white/10 rounded-full mb-3">
                <p className="text-white/90 font-medium text-xs tracking-wider uppercase">{STEPS[2].title}</p>
              </div>
              <h3 className="text-white text-3xl font-bold leading-snug max-w-[90%] tracking-tight">{STEPS[2].heading}</h3>
            </div>
            <button className="relative z-10 flex items-center gap-2 text-[#d9f0ff] text-sm font-semibold hover:text-white transition-all w-fit group-hover:gap-3">
              Read more <PlusCircle size={16} />
            </button>
          </div>
        </motion.div>

        {/* Step 4 */}
        <motion.div 
          className="absolute top-[1020px] left-[680px] w-[400px] h-[280px] rounded-[24px] border border-black/5 overflow-hidden group shadow-[0_20px_40px_rgba(0,0,0,0.1)] z-20 cursor-pointer"
          initial="hidden"
          whileInView="visible"
          whileHover="hover"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            hover: { y: -8, transition: { duration: 0.3 } }
          }}
        >
          <Image src={STEPS[3].image} alt={STEPS[3].heading} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
          <div className="absolute inset-0 bg-black/30 mix-blend-overlay pointer-events-none transition-opacity group-hover:opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute inset-0 px-8 pt-8 pb-4 flex flex-col justify-end gap-6 z-10">
            <div>
              <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full mb-3">
                <p className="text-white font-medium text-xs tracking-wider uppercase">{STEPS[3].title}</p>
              </div>
              <h3 className="text-white text-2xl font-bold leading-snug max-w-[90%] tracking-tight">{STEPS[3].heading}</h3>
            </div>
            <button className="flex items-center gap-2 text-[#d9f0ff] text-sm font-semibold hover:text-white transition-all w-fit group-hover:gap-3">
              Read more <PlusCircle size={16} />
            </button>
          </div>
        </motion.div>

      </div>

      {/* Mobile view (linear stack) */}
      <div className="container mx-auto px-6 md:hidden flex flex-col gap-8">
        {STEPS.map((step, i) => (
          <div key={i} className="relative w-full h-[300px] rounded-[24px] border border-black/5 overflow-hidden shadow-lg group">
            {step.type === 'image' ? (
              <>
                <Image src={step.image} alt={step.heading} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/30 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 px-6 pt-6 pb-4 flex flex-col justify-end gap-6 z-10">
                  <div>
                    <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full mb-3">
                      <p className="text-white font-medium text-xs tracking-wider uppercase">{step.title}</p>
                    </div>
                    <h3 className="text-white text-xl font-bold leading-snug tracking-tight">{step.heading}</h3>
                  </div>
                  <button className="flex items-center gap-2 text-white/90 text-sm font-semibold transition-all group-hover:gap-3">
                    Read more <PlusCircle size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 bg-[#0B1221] border border-white/10 rounded-[24px] px-6 pt-6 pb-4 flex flex-col justify-end gap-6 z-10 overflow-hidden">
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#0ea5e9] opacity-20 blur-[60px] rounded-full pointer-events-none" />
                <div className="relative z-10">
                  <div className="inline-block px-3 py-1 bg-white/10 rounded-full mb-3">
                    <p className="text-white font-medium text-xs tracking-wider uppercase">{step.title}</p>
                  </div>
                  <h3 className="text-white text-xl font-bold leading-snug tracking-tight">{step.heading}</h3>
                </div>
                <button className="relative z-10 flex items-center gap-2 text-[#0ea5e9] text-sm font-semibold transition-all group-hover:gap-3">
                  Read more <PlusCircle size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
