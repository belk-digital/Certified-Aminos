'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { FadeUp } from '@/components/motion/FadeUp'
import { RefreshCw } from 'lucide-react'

type System = 'imperial' | 'metric';
type Gender = 'male' | 'female';

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

const DynamicSelect = ({ value, options, onChange }: { value: string, options: {label: string, value: string}[], onChange: (v: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find(o => o.value == value)?.label;

  return (
    <div className="relative inline-block mx-1" onMouseLeave={() => setIsOpen(false)}>
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

export function CreatinineClearance() {
  const t = useTranslations('calculator.creatinineClearance')
  const [system, setSystem] = useState<System>('imperial');
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState('50');
  const [lbs, setLbs] = useState('170');
  const [kg, setKg] = useState('77');
  const [creatinine, setCreatinine] = useState('1.2');

  const handleSystemChange = (newSystem: System) => {
    if (newSystem === system) return;
    
    if (newSystem === 'metric') {
      const wKg = (parseFloat(lbs) || 0) / 2.20462;
      setKg(wKg.toFixed(1));
    } else {
      const wKg = parseFloat(kg) || 0;
      const wLbs = wKg * 2.20462;
      setLbs(Math.round(wLbs).toString());
    }
    
    setSystem(newSystem);
  }

  let weightKg = 0;
  if (system === 'imperial') {
    weightKg = (parseFloat(lbs) || 0) / 2.20462;
  } else {
    weightKg = parseFloat(kg) || 0;
  }

  const parsedAge = parseInt(age) || 0;
  const parsedCreatinine = parseFloat(creatinine) || 0;

  let crcl = 0;
  let category = '—';
  let categoryColor = 'text-ink/40';

  if (parsedAge > 0 && weightKg > 0 && parsedCreatinine > 0) {
    crcl = ((140 - parsedAge) * weightKg) / (72 * parsedCreatinine);
    if (gender === 'female') {
      crcl *= 0.85;
    }

    if (crcl > 90) { category = t('categoryNormalOrHigh'); categoryColor = 'text-green-500'; }
    else if (crcl >= 60) { category = t('categoryMildlyDecreased'); categoryColor = 'text-yellow-500'; }
    else if (crcl >= 45) { category = t('categoryMildToModerateDecrease'); categoryColor = 'text-orange-400'; }
    else if (crcl >= 30) { category = t('categoryModerateToSevereDecrease'); categoryColor = 'text-orange-500'; }
    else if (crcl >= 15) { category = t('categorySeverelyDecreased'); categoryColor = 'text-red-400'; }
    else { category = t('categoryKidneyFailure'); categoryColor = 'text-red-600'; }
  }

  const isValid = crcl > 0;
  const maxCrCl = 150;
  const pointerPercentage = isValid ? Math.max(0, Math.min(100, (crcl / maxCrCl) * 100)) : 0;

  return (
    <section className="w-full rounded-3xl bg-white p-4 sm:p-6 md:p-12 lg:p-16 border border-black/5 shadow-[0_20px_60px_rgb(0,0,0,0.05)] relative z-10 flex flex-col lg:flex-row gap-8 lg:gap-20">
      
      {/* Left: Conversational Form */}
      <div className="flex-1 flex flex-col justify-center">
        <FadeUp>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-ink/30">Creatinine Clearance Configurator</h2>
            <div className="flex items-center gap-4">
              <div className="flex bg-[#FAFAFA] p-1 rounded-xl border border-black/5">
                {(['imperial', 'metric'] as System[]).map(sys => (
                  <button
                    key={sys}
                    onClick={() => handleSystemChange(sys)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${system === sys ? 'bg-white shadow-sm text-ink border border-black/10' : 'text-ink/40 hover:text-ink'}`}
                  >
                    {sys}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setAge('50'); setLbs('170'); setKg('77'); setCreatinine('1.2');
                }}
                className="w-8 h-8 rounded-full border border-black/10 hover:bg-black/5 flex items-center justify-center text-ink/40 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="text-2xl sm:text-3xl md:text-[2.5rem] font-heading font-light text-ink tracking-tight leading-[1.7] md:leading-[1.7]">
            I am a <DynamicInput value={age} onChange={setAge} /> year old 
            <DynamicSelect 
              value={gender} 
              onChange={(v) => setGender(v as Gender)}
              options={[{label: 'Male', value: 'male'}, {label: 'Female', value: 'female'}]} 
            /> 
            weighing 
            {system === 'imperial' ? (
              <> <DynamicInput value={lbs} onChange={setLbs} minWidth={3} /> lbs. </>
            ) : (
              <> <DynamicInput value={kg} onChange={setKg} minWidth={3} /> kg. </>
            )}
            My serum creatinine level is <DynamicInput value={creatinine} onChange={setCreatinine} minWidth={3} /> mg/dL.
          </div>
        </FadeUp>
      </div>

      {/* Right: Result Display */}
      <div className="w-full lg:w-[450px] shrink-0">
        <FadeUp delay={0.2} className="h-full">
          <div className="bg-[#FAFAFA] rounded-2xl border border-black/5 p-8 md:p-10 flex flex-col items-center justify-center text-center h-full shadow-[inset_0_2px_20px_rgba(0,0,0,0.02)] min-h-[400px] relative">
            
            <h3 className="absolute top-8 font-black uppercase tracking-[0.2em] text-ink/30 text-xs">Estimated CrCl</h3>
            
            <div className="relative w-full flex flex-col items-center mt-6">
              <AnimatePresence mode="popLayout">
                <motion.div 
                  key={isValid ? crcl.toFixed(1) : 'empty'}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-6xl md:text-7xl font-black text-primary tracking-tighter leading-none mb-2"
                >
                  {isValid ? crcl.toFixed(1) : '—'}
                </motion.div>
              </AnimatePresence>
              <div className="text-sm font-black uppercase tracking-widest text-ink/40 mb-10">mL/min</div>
            </div>

            {/* Dynamic Kidney Function Gauge */}
            <div className="w-full max-w-[280px] mt-4 mb-10">
              <div className="w-full relative h-2 rounded-full flex overflow-visible">
                <div className="h-full w-[10%] bg-red-600 rounded-l-full" />
                <div className="h-full w-[10%] bg-red-400" />
                <div className="h-full w-[10%] bg-orange-500" />
                <div className="h-full w-[10%] bg-orange-400" />
                <div className="h-full w-[20%] bg-yellow-500" />
                <div className="h-full w-[40%] bg-green-500 rounded-r-full" />
                
                <motion.div 
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-[3px] border-black rounded-full shadow-md z-10"
                  style={{ left: `calc(${pointerPercentage}% - 8px)` }}
                  initial={{ left: 0, opacity: 0 }}
                  animate={{ left: `calc(${pointerPercentage}% - 8px)`, opacity: isValid ? 1 : 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                />
              </div>
              <div className="w-full flex justify-between mt-2 text-[8px] font-bold text-ink/30 uppercase">
                <span>0</span>
                <span>150+</span>
              </div>
            </div>

            <div className="w-full text-center mt-auto border-t border-black/5 pt-6">
              <div className="text-[10px] uppercase font-bold text-ink/40 mb-1 tracking-widest">Kidney Function Category</div>
              <div className={`text-lg font-black ${isValid ? categoryColor : 'text-ink/20'}`}>{category}</div>
            </div>

          </div>
        </FadeUp>
      </div>

    </section>
  )
}
