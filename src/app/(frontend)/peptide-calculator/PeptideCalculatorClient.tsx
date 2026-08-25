'use client'

import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { FadeUp } from '@/components/motion/FadeUp'
import { AlertTriangle, Calculator, Syringe, CheckCircle2, Droplets, ArrowRight, ShieldCheck, TrendingDown } from 'lucide-react'
import { SharedFaqSection } from '@/components/shared/SharedFaqSection'
import { CalculatorsHub } from './components/CalculatorsHub'
import { CalculatorHero } from '@/components/calculator/CalculatorHero'
import Image from 'next/image'
import { FluidButton } from '@/components/ui/fluid-button'

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'] as const

export default function PeptideCalculatorPage() {
  const t = useTranslations('calculator.main')

  const CALCULATOR_FAQS = FAQ_KEYS.map((key) => ({
    question: t(`faq.${key}.question`),
    answer: t(`faq.${key}.answer`),
  }))

  return (
    <main className="bg-[#FAFAFA] min-h-screen relative overflow-x-clip font-sans text-ink selection:bg-primary/20">
      
      {/* HERO SECTION */}
      <CalculatorHero />

      {/* CALCULATORS HUB (The Actual Tool) */}
      <div className="relative z-20 -mt-12 sm:-mt-24">
        <div id="calculators-hub" className="scroll-mt-32">
          <CalculatorsHub />
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 flex flex-col gap-32 md:gap-48 pb-32">
        
        {/* SECTION 01: THE COST OF BAD MATH (Dramatic Editorial) */}
        <section className="relative">
          {/* Giant Background Number */}
          <div className="absolute -top-20 -left-10 text-[250px] md:text-[350px] font-black text-black/[0.02] tracking-tighter leading-none pointer-events-none select-none z-0">
            01
          </div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
            {/* Sticky Left Column */}
            <div className="lg:col-span-5 lg:sticky lg:top-32 h-fit">
              <FadeUp>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-600 text-xs font-bold tracking-[0.2em] uppercase mb-6 border border-red-500/20">
                  <AlertTriangle className="w-4 h-4" /> The Risk
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-ink tracking-tighter uppercase leading-[0.9] mb-6">
                  Precision is<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-ink to-ink/40">Non-Negotiable.</span>
                </h2>
                <p className="text-lg text-ink/60 font-light leading-relaxed mb-8">
                  Whether you are working with a 2mg or 10mg vial, guessing your math leads to ruined protocols, wasted resources, and inaccurate research data. 
                </p>
                <div className="w-full h-px bg-gradient-to-r from-black/10 to-transparent mb-8" />
                <ul className="space-y-6">
                  <li className="flex gap-4 items-start">
                    <TrendingDown className="w-6 h-6 text-red-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-ink uppercase tracking-tight">Wasted Peptides</h4>
                      <p className="text-sm text-ink/60 mt-1">Over-diluting destroys concentration efficacy.</p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
                    <div>
                      <h4 className="font-bold text-ink uppercase tracking-tight">Data Integrity</h4>
                      <p className="text-sm text-ink/60 mt-1">Inconsistent dosing ruins long-term observational data.</p>
                    </div>
                  </li>
                </ul>
              </FadeUp>
            </div>

            {/* Scrolling Right Column (Image + Context Cards) */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              <FadeUp delay={0.2}>
                <div className="relative w-full aspect-[4/3] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl group">
                  <Image src="/HelixBio Images/vial-on-sand.webp" alt="Peptide Vials" fill className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" />
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-white/40">
                    <h3 className="font-black text-xl text-ink uppercase tracking-tighter mb-2">The Solution? Automation.</h3>
                    <p className="text-sm text-ink/70">Our calculator removes human error entirely. Input your variables, get exact syringe units instantly.</p>
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* SECTION 02: THE RECONSTITUTION PROCESS (Split Screen Guide) */}
        <section className="relative">
          <div className="absolute -top-20 right-0 text-[250px] md:text-[350px] font-black text-black/[0.02] tracking-tighter leading-none pointer-events-none select-none z-0">
            02
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Visual Process Map */}
            <div className="flex flex-col gap-6 order-2 lg:order-1">
              <FadeUp>
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-black/[0.03] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 transition-transform duration-500">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-2xl uppercase tracking-tighter">Step 1: Prep</h3>
                    <span className="text-primary/20 font-black text-5xl">01</span>
                  </div>
                  <p className="text-ink/60 mb-6">Wipe the rubber stoppers of both the peptide vial and bacteriostatic water with an alcohol swab. Wait 30 seconds for it to dry completely.</p>
                  <div className="w-12 h-12 rounded-full bg-[#FAFAFA] border border-black/5 flex items-center justify-center text-ink/40">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
              </FadeUp>

              <FadeUp delay={0.1}>
                <div className="bg-ink p-8 md:p-10 rounded-[2.5rem] shadow-2xl hover:-translate-y-2 transition-transform duration-500 text-white">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-2xl uppercase tracking-tighter">Step 2: Transfer</h3>
                    <span className="text-white/10 font-black text-5xl">02</span>
                  </div>
                  <p className="text-white/60 mb-6">Draw the exact amount of bacteriostatic water. Inject it into the peptide vial slowly, aiming for the glass wall, not the powder directly, to avoid damaging the fragile bonds.</p>
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <Droplets className="w-5 h-5" />
                  </div>
                </div>
              </FadeUp>

              <FadeUp delay={0.2}>
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-black/[0.03] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 transition-transform duration-500">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-2xl uppercase tracking-tighter">Step 3: Dissolve</h3>
                    <span className="text-primary/20 font-black text-5xl">03</span>
                  </div>
                  <p className="text-ink/60 mb-6">Do not shake. Gently swirl the vial in a circular motion until the powder is completely dissolved and the liquid is perfectly clear.</p>
                  <div className="w-12 h-12 rounded-full bg-[#FAFAFA] border border-black/5 flex items-center justify-center text-ink/40">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </FadeUp>
            </div>

            {/* Sticky Context */}
            <div className="lg:sticky lg:top-32 h-fit order-1 lg:order-2">
              <FadeUp>
                <h2 className="text-sm uppercase tracking-[0.2em] text-primary mb-6 font-bold flex items-center gap-3">
                  <span className="w-8 h-px bg-primary"></span>
                  Reconstitution Guide
                </h2>
                <h2 className="text-4xl md:text-6xl font-black text-ink tracking-tighter uppercase leading-[0.9] mb-8">
                  The Perfect<br/>Mix.
                </h2>
                <p className="text-lg text-ink/60 font-light leading-relaxed mb-10">
                  Peptides are delicate amino acid chains. Rough handling during the reconstitution process can break these bonds, rendering the compound useless.
                </p>

                <div className="bg-white p-8 rounded-[2rem] border border-black/5 shadow-sm">
                  <h4 className="font-bold uppercase tracking-widest text-xs text-ink/40 mb-6">Variables Required</h4>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="font-bold text-ink">Vial Size</span>
                      <span className="text-ink/40 ml-auto">Total mg</span>
                    </li>
                    <li className="flex items-center gap-4 border-t border-black/5 pt-4">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="font-bold text-ink">BAC Water</span>
                      <span className="text-ink/40 ml-auto">Volume (mL)</span>
                    </li>
                    <li className="flex items-center gap-4 border-t border-black/5 pt-4">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="font-bold text-ink">Desired Dose</span>
                      <span className="text-ink/40 ml-auto">Target mcg/mg</span>
                    </li>
                  </ul>
                </div>
              </FadeUp>
            </div>

          </div>
        </section>

        {/* SECTION 03: VISUAL SYRINGE GUIDE (CSS Art / Diagram) */}
        <section className="relative">
          <div className="relative z-10 bg-white rounded-[3rem] p-8 md:p-16 border border-black/[0.03] shadow-[0_20px_60px_rgb(0,0,0,0.05)] overflow-hidden">
            
            {/* Giant Background Number Inside the Card */}
            <div className="absolute -top-10 -left-6 md:-top-20 md:-left-10 text-[200px] md:text-[350px] font-black text-black/[0.02] tracking-tighter leading-none pointer-events-none select-none z-0">
              03
            </div>

            <FadeUp className="relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-4xl md:text-5xl font-black text-ink tracking-tighter uppercase mb-6">Reading a U-100 Syringe</h2>
                <p className="text-ink/60 text-lg">The most common mistake is confusing "Units" with "mL" or "mg". A standard U-100 insulin syringe holds 1mL of liquid, which is divided into 100 units.</p>
              </div>

              {/* CSS Syringe Visualization */}
              <div className="w-full max-w-4xl mx-auto mb-16">
                <div className="relative h-24 md:h-32 bg-[#FAFAFA] border-2 border-black/10 rounded-full overflow-hidden flex items-center">
                  
                  {/* The plunger fluid (visual representation of 10 units = 0.1mL) */}
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '10%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-primary/80 to-primary flex items-center justify-end pr-4 shadow-[inset_0_0_20px_rgba(255,255,255,0.4)]"
                  >
                    <span className="text-white font-black text-xl hidden sm:block">10 U</span>
                  </motion.div>

                  {/* Tick Marks Overlay */}
                  <div className="absolute inset-0 flex justify-between px-[5%] items-end pb-2">
                    {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((unit) => (
                      <div key={unit} className="flex flex-col items-center gap-1">
                        <div className="w-px h-6 bg-black/20" />
                        <span className="text-[10px] font-bold text-ink/40 hidden md:block">{unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between mt-6 text-sm font-bold uppercase tracking-widest text-ink/40 px-[5%]">
                  <span>0 Units (0mL)</span>
                  <span>100 Units (1mL)</span>
                </div>
              </div>

              {/* Sleek Conversion Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {[
                  { ml: "0.1mL", unit: "10 Units" },
                  { ml: "0.25mL", unit: "25 Units" },
                  { ml: "0.5mL", unit: "50 Units" },
                  { ml: "1.0mL", unit: "100 Units" },
                ].map((item, idx) => (
                  <div key={idx} className="bg-[#FAFAFA] border border-black/5 p-6 rounded-2xl text-center hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div className="text-2xl font-black text-ink mb-1">{item.ml}</div>
                    <div className="text-xs font-bold text-primary uppercase tracking-widest">Equals {item.unit}</div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </section>

        {/* SECTION 04: THE MATHEMATICS OF RECONSTITUTION */}
        <section className="relative">
          <div className="relative z-10 bg-white rounded-[3rem] p-8 md:p-16 border border-black/[0.03] shadow-[0_20px_60px_rgb(0,0,0,0.05)] overflow-hidden">
            
            {/* Giant Background Number Inside the Card */}
            <div className="absolute -top-10 -right-6 md:-top-20 md:-right-10 text-[200px] md:text-[350px] font-black text-black/[0.02] tracking-tighter leading-none pointer-events-none select-none z-0">
              04
            </div>

            <FadeUp className="relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-4xl md:text-5xl font-black text-ink tracking-tighter uppercase mb-6">The Mathematics of Reconstitution</h2>
                <p className="text-ink/60 text-lg">Understanding the formula behind the calculator is critical. It allows you to verify your math and ensure complete dosing accuracy.</p>
              </div>

              <div className="bg-[#FAFAFA] border border-black/5 rounded-[2rem] p-8 md:p-12 mb-12 flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 w-full text-center md:text-left">
                  <h3 className="font-black uppercase tracking-widest text-primary text-sm mb-4">The Universal Formula</h3>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 font-mono text-base md:text-xl font-bold text-ink flex flex-wrap items-center justify-center md:justify-start gap-y-2">
                    <span className="text-primary mr-1">(</span>Desired Dose <span className="text-ink/40 text-sm mx-2 italic">in mcg</span><span className="text-primary mx-1">/</span> Total Peptide <span className="text-ink/40 text-sm mx-2 italic">in mcg</span><span className="text-primary ml-1">)</span> <span className="mx-3 text-ink/40">×</span> Volume <span className="text-ink/40 text-sm mx-2 italic">in mL</span> <span className="mx-3 text-ink/40">=</span> Draw
                  </div>
                </div>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mx-auto">
                  <Calculator className="w-8 h-8 text-primary" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2rem] border border-black/5">
                  <h4 className="font-bold text-ink uppercase tracking-tight mb-6 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> Example Scenario</h4>
                  <ul className="space-y-4 text-ink/70">
                    <li className="flex justify-between border-b border-black/5 pb-2"><strong>Vial Size:</strong> <span>5mg (5,000mcg)</span></li>
                    <li className="flex justify-between border-b border-black/5 pb-2"><strong>BAC Water Added:</strong> <span>2mL</span></li>
                    <li className="flex justify-between"><strong>Desired Dose:</strong> <span>250mcg</span></li>
                  </ul>
                </div>
                <div className="bg-ink p-8 rounded-[2rem] text-white">
                  <h4 className="font-bold text-white uppercase tracking-tight mb-6 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white" /> The Calculation</h4>
                  <p className="font-mono text-white/80 mb-6 text-lg">(250 ÷ 5,000) × 2mL = <span className="font-bold text-white">0.1mL</span></p>
                  <div className="bg-white/10 p-5 rounded-xl text-center">
                    <span className="text-xs uppercase tracking-widest text-white/60 block mb-1">Final Syringe Draw</span>
                    <span className="font-black text-2xl text-primary">10 Units</span>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* SECTION 05: BACTERIOSTATIC WATER DILUTION GUIDE */}
        <section className="relative">
          <div className="absolute -top-20 -left-10 text-[250px] md:text-[350px] font-black text-black/[0.02] tracking-tighter leading-none pointer-events-none select-none z-0">
            05
          </div>
          
          <div className="relative z-10">
            <FadeUp>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black text-ink tracking-tighter uppercase mb-6">Dilution Guidelines</h2>
                <p className="text-ink/60 text-lg max-w-3xl mx-auto">How much bacteriostatic water should you add? While the volume of water does not change the total mg of peptide in the vial, it drastically alters the concentration. Here are the standard recommended dilution ratios.</p>
              </div>

              <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-black/5 shadow-xl overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="border-b-2 border-black/10">
                      <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-ink/40">Vial Size</th>
                      <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-ink/40">BAC Water Volume</th>
                      <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-ink/40">Resulting Concentration</th>
                      <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-ink/40">Example: 250mcg Dose</th>
                    </tr>
                  </thead>
                  <tbody className="text-base font-medium">
                    <tr className="border-b border-black/5 hover:bg-[#FAFAFA] transition-colors">
                      <td className="py-6 px-4 text-ink font-black text-xl">2mg</td>
                      <td className="py-6 px-4 text-ink/70">1mL</td>
                      <td className="py-6 px-4 text-ink/70">2mg per mL</td>
                      <td className="py-6 px-4 font-bold text-primary">12.5 Units (0.125mL)</td>
                    </tr>
                    <tr className="border-b border-black/5 hover:bg-[#FAFAFA] transition-colors">
                      <td className="py-6 px-4 text-ink font-black text-xl">5mg</td>
                      <td className="py-6 px-4 text-ink/70">2mL</td>
                      <td className="py-6 px-4 text-ink/70">2.5mg per mL</td>
                      <td className="py-6 px-4 font-bold text-primary">10 Units (0.1mL)</td>
                    </tr>
                    <tr className="border-b border-black/5 hover:bg-[#FAFAFA] transition-colors">
                      <td className="py-6 px-4 text-ink font-black text-xl">10mg</td>
                      <td className="py-6 px-4 text-ink/70">2mL</td>
                      <td className="py-6 px-4 text-ink/70">5mg per mL</td>
                      <td className="py-6 px-4 font-bold text-primary">5 Units (0.05mL)</td>
                    </tr>
                    <tr className="border-b border-black/5 hover:bg-[#FAFAFA] transition-colors">
                      <td className="py-6 px-4 text-ink font-black text-xl">10mg</td>
                      <td className="py-6 px-4 text-ink/70">3mL</td>
                      <td className="py-6 px-4 text-ink/70">3.33mg per mL</td>
                      <td className="py-6 px-4 font-bold text-primary">7.5 Units (0.075mL)</td>
                    </tr>
                    <tr className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="py-6 px-4 text-ink font-black text-xl">30mg</td>
                      <td className="py-6 px-4 text-ink/70">3mL</td>
                      <td className="py-6 px-4 text-ink/70">10mg per mL</td>
                      <td className="py-6 px-4 font-bold text-primary">2.5 Units (0.025mL)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* SECTION 06: STORAGE MASTERCLASS (Side-by-Side Cards) */}
        <section className="relative">
          <div className="absolute -top-20 right-0 text-[250px] md:text-[350px] font-black text-black/[0.02] tracking-tighter leading-none pointer-events-none select-none z-0">
            06
          </div>
          
          <div className="relative z-10">
            <FadeUp>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black text-ink tracking-tighter uppercase mb-6">Storage Masterclass</h2>
                <p className="text-ink/60 text-lg max-w-2xl mx-auto">Improper storage degrades peptide purity rapidly. Follow these strict guidelines to maximize shelf life.</p>
              </div>
            </FadeUp>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
              {/* Lyophilized (Light Card) */}
              <FadeUp>
                <div className="bg-white rounded-[3rem] p-10 md:p-12 border border-black/5 shadow-xl h-full hover:-translate-y-2 transition-transform duration-500">
                  <div className="w-16 h-16 rounded-full bg-[#FAFAFA] border border-black/5 flex items-center justify-center mb-8 text-ink/40">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-black text-ink uppercase tracking-tighter mb-4">Lyophilized<br/><span className="text-xl text-ink/40 tracking-widest">Powder</span></h3>
                  <p className="text-ink/70 mb-8 font-light">In their dry, freeze-dried state, peptides are highly stable and can last for extended periods.</p>
                  <ul className="space-y-4 font-medium">
                    <li className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Room Temp: ~30-60 Days
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Refrigerated (4°C): ~2-3 Years
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Frozen (-20°C): ~3-5 Years
                    </li>
                  </ul>
                </div>
              </FadeUp>

              {/* Reconstituted (Dark Card) */}
              <FadeUp delay={0.2}>
                <div className="bg-zinc-900 rounded-[3rem] p-10 md:p-12 border border-white/5 shadow-2xl h-full text-white hover:-translate-y-2 transition-transform duration-500">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-8 text-white/80">
                    <Droplets className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Reconstituted<br/><span className="text-xl text-white/40 tracking-widest">Liquid</span></h3>
                  <p className="text-white/60 mb-8 font-light">Once mixed with bacteriostatic water, the bonds become fragile and begin degrading slowly over time.</p>
                  <ul className="space-y-4 font-medium text-white/90">
                    <li className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/40" /> Refrigerated (4°C): ~20-30 Days
                    </li>
                    <li className="flex items-center gap-3 text-red-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400" /> Never Freeze After Mixing!
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/40" /> Keep away from direct light.
                    </li>
                  </ul>
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* SECTION 07: THE 3 FATAL MISTAKES */}
        <section className="relative">
          <div className="absolute -top-20 -left-10 text-[250px] md:text-[350px] font-black text-black/[0.02] tracking-tighter leading-none pointer-events-none select-none z-0">
            07
          </div>
          
          <div className="relative z-10">
            <FadeUp>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black text-ink tracking-tighter uppercase mb-6">The 3 Fatal Mistakes</h2>
                <p className="text-ink/60 text-lg max-w-2xl mx-auto">Peptides are notoriously fragile. Avoid these three common errors that will instantly ruin your research compounds.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100 hover:shadow-lg hover:-translate-y-1 transition-all">
                  <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-6">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-ink uppercase text-xl mb-3">Shaking the Vial</h3>
                  <p className="text-ink/70">Amino acid bonds are incredibly delicate. Shaking a reconstituted vial vigorously will shatter these bonds, completely destroying the peptide's efficacy. Always swirl gently.</p>
                </div>
                <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mb-6">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-ink uppercase text-xl mb-3">Freezing Liquid</h3>
                  <p className="text-ink/70">While lyophilized powder should be frozen for long-term storage, freezing a reconstituted liquid peptide will cause crystallization that irreparably damages the compound.</p>
                </div>
                <div className="bg-amber-50 p-8 rounded-[2rem] border border-amber-100 hover:shadow-lg hover:-translate-y-1 transition-all">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center mb-6">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-ink uppercase text-xl mb-3">Wrong Water</h3>
                  <p className="text-ink/70">Using standard sterile water instead of Bacteriostatic water allows bacteria to breed rapidly in the vial. BAC water contains 0.9% benzyl alcohol to prevent this.</p>
                </div>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* SECTION 08: SYRINGE TYPES (U-100 vs U-40) */}
        <section className="relative">
          <div className="relative z-10 bg-white rounded-[3rem] p-8 md:p-16 border border-black/[0.03] shadow-[0_20px_60px_rgb(0,0,0,0.05)] overflow-hidden">
            
            {/* Giant Background Number Inside the Card */}
            <div className="absolute -top-10 -right-6 md:-top-20 md:-right-10 text-[200px] md:text-[350px] font-black text-black/[0.02] tracking-tighter leading-none pointer-events-none select-none z-0">
              08
            </div>

            <FadeUp className="relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-ink tracking-tighter uppercase mb-6">Syringe Danger:<br/><span className="text-primary">U-100</span> vs U-40</h2>
                  <p className="text-ink/60 text-lg mb-8">Not all syringes are created equal. Using the wrong type of syringe is the number one cause of massive overdosing in research.</p>
                  
                  <div className="space-y-6">
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-1"><CheckCircle2 className="w-5 h-5" /></div>
                      <div>
                        <h4 className="font-bold text-ink uppercase">U-100 Syringes (Standard)</h4>
                        <p className="text-ink/60 text-sm mt-1">Holds 100 units per 1mL. This calculator, and nearly all human-grade research, uses U-100 syringes exclusively.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0 mt-1"><AlertTriangle className="w-5 h-5" /></div>
                      <div>
                        <h4 className="font-bold text-ink uppercase">U-40 Syringes (Veterinary)</h4>
                        <p className="text-ink/60 text-sm mt-1">Holds 40 units per 1mL. If you use a U-40 syringe with U-100 math, you will draw 2.5x the intended dose.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#FAFAFA] p-6 sm:p-8 rounded-[2rem] border border-black/5 text-center relative z-10">
                  <h4 className="font-black text-ink uppercase tracking-widest text-sm mb-8">Visual Difference</h4>
                  
                  <div className="text-left font-bold text-ink/50 text-xs sm:text-sm uppercase tracking-widest mb-2 pl-4">U-100 (0.5mL Volume)</div>
                  <div className="relative h-12 sm:h-16 bg-white border-2 border-black/10 rounded-full overflow-hidden flex items-center mb-6">
                    <div className="w-1/2 h-full bg-green-500/20 border-r-2 border-green-500 flex items-center justify-end pr-4"><span className="font-bold text-green-700 text-sm sm:text-base">50 Units</span></div>
                  </div>
                  
                  <div className="text-left font-bold text-ink/50 text-xs sm:text-sm uppercase tracking-widest mb-2 pl-4 mt-6">U-40 (0.5mL Volume)</div>
                  <div className="relative h-12 sm:h-16 bg-white border-2 border-black/10 rounded-full overflow-hidden flex items-center">
                    <div className="w-2/5 h-full bg-red-500/20 border-r-2 border-red-500 flex items-center justify-end pr-4"><span className="font-bold text-red-700 text-sm sm:text-base">20 Units</span></div>
                  </div>
                  
                  <p className="text-[10px] sm:text-xs text-ink/40 mt-8 font-bold uppercase tracking-widest leading-relaxed">Notice how 0.5mL is 50 units on U-100, but only 20 units on U-40.</p>
                </div>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* SECTION 09: THE SCIENCE OF DEGRADATION */}
        <section className="relative">
          <div className="relative z-10 bg-ink rounded-[3rem] p-8 md:p-16 shadow-2xl text-white overflow-hidden">
            
            {/* Giant Background Number Inside the Card */}
            <div className="absolute -top-10 -left-6 md:-top-20 md:-left-10 text-[200px] md:text-[350px] font-black text-white/[0.03] tracking-tighter leading-none pointer-events-none select-none z-0">
              09
            </div>

            <FadeUp className="relative z-10">
              <div className="text-center mb-20 md:mb-24 relative z-20">
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-6">The Science of Degradation</h2>
                <p className="text-white/60 text-lg max-w-2xl mx-auto">Peptide bonds are fragile amino acid chains. Understanding their half-life is crucial for research viability.</p>
              </div>

              <div className="relative max-w-5xl mx-auto">
                {/* Visual Gradient Timeline */}
                <div className="absolute top-7 left-0 right-0 h-1.5 bg-gradient-to-r from-green-500 via-amber-500 to-red-600 rounded-full hidden md:block shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                  {[
                    { title: "Day 1", desc: "100% Efficacy", sub: "Peak Purity", color: "text-green-400", dot: "bg-green-500", border: "border-green-500/30" },
                    { title: "Day 15", desc: "95% Efficacy", sub: "Slight Degradation", color: "text-lime-400", dot: "bg-lime-500", border: "border-lime-500/30" },
                    { title: "Day 30", desc: "85% Efficacy", sub: "Noticeable Drop", color: "text-amber-400", dot: "bg-amber-500", border: "border-amber-500/30" },
                    { title: "Day 60+", desc: "<50% Efficacy", sub: "Severely Degraded", color: "text-red-400", dot: "bg-red-500", border: "border-red-500/30" }
                  ].map((point, idx) => (
                    <div key={idx} className="flex flex-col items-center mb-8 md:mb-0 group">
                      <div className={`w-14 h-14 rounded-full bg-ink border-[4px] ${point.border} flex items-center justify-center mb-6 relative z-10 transition-transform duration-500 group-hover:scale-110 shadow-2xl`}>
                        <div className={`w-4 h-4 rounded-full ${point.dot} shadow-[0_0_15px_rgba(255,255,255,0.4)]`} />
                      </div>
                      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-[2rem] text-center w-full shadow-2xl hover:bg-white/10 transition-colors">
                        <h4 className="font-black text-2xl text-white mb-2">{point.title}</h4>
                        <div className={`font-black uppercase tracking-widest text-sm mb-2 ${point.color}`}>{point.desc}</div>
                        <div className="w-full h-px bg-white/10 my-4" />
                        <p className="text-white/40 text-[10px] sm:text-xs font-bold uppercase tracking-widest">{point.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* SECTION 10: THE ESSENTIAL GLOSSARY */}
        <section className="relative">
          <div className="absolute -top-20 right-0 text-[250px] md:text-[350px] font-black text-black/[0.02] tracking-tighter leading-none pointer-events-none select-none z-0">
            10
          </div>
          
          <div className="relative z-10">
            <FadeUp>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black text-ink tracking-tighter uppercase mb-6">The Essential Glossary</h2>
                <p className="text-ink/60 text-lg max-w-2xl mx-auto">Master the terminology of peptide research to ensure complete accuracy in your protocols.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { term: "Lyophilized", def: "A freeze-drying process that removes water to increase shelf life and stability." },
                  { term: "Bacteriostatic Water", def: "Sterile water containing 0.9% benzyl alcohol to prevent bacterial growth over time." },
                  { term: "Subcutaneous", def: "Injection into the tissue layer between the skin and the muscle." },
                  { term: "mg vs mcg", def: "1 milligram (mg) equals 1,000 micrograms (mcg). A critical conversion." }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-[2rem] border border-black/5 hover:-translate-y-2 hover:shadow-xl transition-all duration-500">
                    <h4 className="font-black text-primary uppercase tracking-widest text-sm mb-4">{item.term}</h4>
                    <p className="text-ink/70 font-medium leading-relaxed">{item.def}</p>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </section>

      </div>

      {/* FAQS */}
      <SharedFaqSection
        title={t('faq.title')}
        description={t('faq.description')}
        faqs={CALCULATOR_FAQS}
      />

    </main>
  )
}
