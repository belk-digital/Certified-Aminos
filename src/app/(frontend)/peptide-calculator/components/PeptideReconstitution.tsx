'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { FadeUp } from '@/components/motion/FadeUp'
import { RefreshCw } from 'lucide-react'

type SyringeVolume = 0.3 | 0.5 | 1.0;
type MassUnit = 'mg' | 'mcg';

const DynamicInput = ({ value, onChange, minWidth = 2 }: { value: string, onChange: (v: string) => void, minWidth?: number }) => (
  <input 
    type="text" 
    value={value} 
    onChange={(e) => {
      const val = e.target.value;
      if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
        onChange(val);
      }
    }} 
    className="bg-transparent border-b-2 border-black/10 hover:border-primary/50 text-primary focus:outline-none focus:border-primary px-1 mx-1 text-center font-black transition-colors inline-block"
    style={{ width: `${Math.max(minWidth, value.length || 1) + 0.5}ch` }}
  />
)

const DynamicSelect = ({ value, options, onChange }: { value: string | number, options: {label: string, value: string | number}[], onChange: (v: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find(o => o.value == value)?.label;
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block mx-1" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-transparent border-b-2 border-black/10 hover:border-primary/50 text-primary focus:outline-none px-1 mx-1 font-black transition-colors flex items-center gap-1 inline-flex"
      >
        {selectedLabel}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6"/></svg>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white rounded-2xl shadow-[0_20px_40px_rgb(0,0,0,0.1)] border border-black/5 overflow-hidden z-50 min-w-[140px]"
          >
            <div className="flex flex-col p-1">
              {options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { onChange(String(opt.value)); setIsOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${value == opt.value ? 'bg-primary text-white' : 'text-ink hover:bg-black/5'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function PeptideReconstitution() {
  const t = useTranslations('calculator.peptideReconstitution')
  
  const [peptideAmount, setPeptideAmount] = useState('5')
  const [waterMl, setWaterMl] = useState('2')
  const [desiredDose, setDesiredDose] = useState('250')
  const [doseUnit, setDoseUnit] = useState<MassUnit>('mcg')
  const [syringeVolume, setSyringeVolume] = useState<SyringeVolume>(1.0)

  const vAmt = parseFloat(peptideAmount) || 0
  const wMl = parseFloat(waterMl) || 0
  const dAmt = parseFloat(desiredDose) || 0

  const totalPeptideMcg = vAmt * 1000
  const targetDoseMcg = doseUnit === 'mg' ? dAmt * 1000 : dAmt

  let isValid = totalPeptideMcg > 0 && wMl > 0 && targetDoseMcg > 0
  let concentrationStr = '—'
  let volumePerDoseStr = '—'
  let tickMarksStr = '0'
  let errorMsg = ''
  let fillPercentage = 0
  const maxUnits = syringeVolume * 100

  if (isValid) {
    const concentration = totalPeptideMcg / wMl
    concentrationStr = `${concentration.toLocaleString(undefined, { maximumFractionDigits: 1 })} mcg/mL`
    
    const volumePerDose = targetDoseMcg / concentration
    volumePerDoseStr = `${volumePerDose.toLocaleString(undefined, { maximumFractionDigits: 3 })}mL`
    
    const tickMarks = volumePerDose * 100
    tickMarksStr = tickMarks.toLocaleString(undefined, { maximumFractionDigits: 1 })
    
    if (volumePerDose > syringeVolume) {
      errorMsg = t('doseExceedsCapacity', { doseVolume: volumePerDose.toFixed(2), syringeVolume })
      tickMarksStr = 'ERR'
      fillPercentage = 100
    } else {
      fillPercentage = (tickMarks / maxUnits) * 100
    }
  }

  const getSyringeTicks = () => {
    const steps = syringeVolume === 1.0 ? 10 : 5;
    const ticks = [];
    for (let i = maxUnits; i >= 0; i -= steps) {
      ticks.push(i);
    }
    return ticks;
  }

  return (
    <section className="w-full rounded-3xl bg-white p-4 sm:p-6 md:p-12 lg:p-16 border border-black/5 shadow-[0_20px_60px_rgb(0,0,0,0.05)] relative z-10 flex flex-col lg:flex-row gap-8 lg:gap-20">
      
      {/* Left: The Conversational Form */}
      <div className="flex-1 flex flex-col justify-center">
        <FadeUp>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-ink/30">Reconstitution Configurator</h2>
            <button
              onClick={() => {
                setPeptideAmount('5'); setWaterMl('2'); setDesiredDose('250'); setSyringeVolume(1.0);
              }}
              className="w-8 h-8 rounded-full border border-black/10 hover:bg-black/5 flex items-center justify-center text-ink/40 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-2xl sm:text-3xl md:text-[2.5rem] font-heading font-light text-ink tracking-tight leading-[1.7] md:leading-[1.7]">
            I have a <DynamicInput value={peptideAmount} onChange={setPeptideAmount} /> mg vial of peptide. 
            I will reconstitute it using <DynamicInput value={waterMl} onChange={setWaterMl} /> mL of bacteriostatic water. 
            My desired dose is <DynamicInput value={desiredDose} onChange={setDesiredDose} minWidth={3} />
            <DynamicSelect 
              value={doseUnit} 
              onChange={(v) => setDoseUnit(v as MassUnit)}
              options={[{label: 'mcg', value: 'mcg'}, {label: 'mg', value: 'mg'}]} 
            /> 
            and I am using a 
            <DynamicSelect 
              value={syringeVolume} 
              onChange={(v) => setSyringeVolume(parseFloat(v) as SyringeVolume)}
              options={[{label: '1.0mL', value: 1.0}, {label: '0.5mL', value: 0.5}, {label: '0.3mL', value: 0.3}]} 
            /> syringe.
          </div>
        </FadeUp>
      </div>

      {/* Right: Minimalist Result Display with Syringe */}
      <div className="w-full lg:w-[450px] shrink-0 flex flex-col gap-6">
        <FadeUp delay={0.2} className="h-full">
          <div className="bg-[#FAFAFA] rounded-2xl border border-black/5 p-8 md:p-10 flex flex-col items-center justify-between text-center h-full shadow-[inset_0_2px_20px_rgba(0,0,0,0.02)] min-h-[400px] relative">
            
            <div className="w-full flex-1 flex flex-col md:flex-row items-center justify-center gap-12 my-8">
              
              <div className="flex flex-col items-center">
                <h3 className="font-black uppercase tracking-[0.2em] text-ink/30 text-[10px] mb-4">Calculated Draw</h3>
                {errorMsg ? (
                  <div className="text-red-500 font-bold mb-4">{errorMsg}</div>
                ) : (
                  <div className="relative w-full flex flex-col items-center">
                    <AnimatePresence mode="popLayout">
                      <motion.div 
                        key={tickMarksStr}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-7xl md:text-8xl font-black text-primary tracking-tighter leading-none drop-shadow-sm mb-2"
                      >
                        {tickMarksStr}
                      </motion.div>
                    </AnimatePresence>
                    <div className="text-xs font-black uppercase tracking-widest text-ink/40">Units <span className="font-medium">({volumePerDoseStr})</span></div>
                  </div>
                )}
              </div>
              
              {/* Natural Syringe Visualization */}
              <div className="relative h-[200px] w-12 flex justify-center shrink-0 mt-8 md:mt-0">
                
                {/* External Tick Marks */}
                <div className="absolute right-full mr-2 top-0 bottom-0 flex flex-col justify-between py-1 pointer-events-none text-right z-30">
                  {getSyringeTicks().map((tick, i) => (
                    <span key={i} className={`text-[10px] font-bold leading-none tracking-tighter ${tick % (syringeVolume === 1.0 ? 20 : 10) === 0 ? 'text-ink/40' : 'text-transparent'}`}>
                      {tick}
                    </span>
                  ))}
                </div>

                {/* Plunger Assembly */}
                <motion.div 
                  className="absolute left-1/2 -translate-x-1/2 w-[85%] z-20 flex flex-col items-center justify-end"
                  animate={{ bottom: `${fillPercentage}%` }}
                  transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                  style={{ height: '120%' }} // Rod extends past the barrel
                >
                   {/* Rod sticking out */}
                   <div className="w-2 flex-1 bg-gradient-to-r from-zinc-200 to-zinc-300 border-x border-zinc-400 relative">
                     {/* Thumb rest */}
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-zinc-300 border border-zinc-400 rounded-sm shadow-sm" />
                   </div>
                   {/* Black Rubber Head */}
                   <div className="w-full h-3 bg-[#222] rounded-b-sm rounded-t-[1px] border-b-2 border-black flex flex-col items-center justify-evenly py-[1px] shadow-sm">
                     <div className="w-full h-px bg-white/10" />
                     <div className="w-full h-px bg-white/10" />
                   </div>
                </motion.div>

                {/* Barrel */}
                <div className="w-full h-full border-2 border-black/10 relative bg-white/40 backdrop-blur-sm overflow-hidden flex flex-col justify-end z-20 rounded-t-sm shadow-sm">
                  {/* Fluid */}
                  <motion.div 
                    className={`w-full ${errorMsg ? 'bg-red-500/80' : 'bg-primary/90'} relative z-30 border-t border-white/40`}
                    initial={{ height: 0 }}
                    animate={{ height: `${fillPercentage}%` }}
                    transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                    style={{ originY: 1 }}
                  >
                     <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent mix-blend-overlay" />
                  </motion.div>
                  
                  {/* Tick overlays */}
                  <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none z-50">
                    {getSyringeTicks().map((tick, i) => {
                      const isMajor = tick % (syringeVolume === 1.0 ? 20 : 10) === 0;
                      const isMid = tick % (syringeVolume === 1.0 ? 10 : 5) === 0;
                      let width = 'w-[30%]';
                      if (isMajor) width = 'w-[80%]';
                      else if (isMid) width = 'w-[50%]';
                      
                      return (
                        <div key={i} className="flex items-center gap-1 w-full">
                          <div className={`h-px bg-black/30 ${width}`} />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Hub & Needle */}
                <div className="absolute top-full flex flex-col items-center z-20">
                  <div className="w-4 h-2 bg-orange-400 rounded-b-sm border-x border-b border-orange-500 z-10 shadow-sm" />
                  <div className="w-0.5 h-8 bg-zinc-300 relative z-0" />
                </div>
              </div>
            </div>
            
            <div className="w-full text-center border-t border-black/5 pt-6 mt-auto">
              <div className="text-[10px] uppercase font-bold text-ink/40 mb-1 tracking-widest">Resulting Concentration</div>
              <div className="text-lg font-black text-ink">{concentrationStr}</div>
            </div>

          </div>
        </FadeUp>
      </div>

    </section>
  )
}
