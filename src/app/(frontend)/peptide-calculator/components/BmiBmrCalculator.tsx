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

export function BmiBmrCalculator() {
  const t = useTranslations('calculator.bmiBmr')
  const [system, setSystem] = useState<System>('imperial');
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState('30');
  
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('10');
  const [lbs, setLbs] = useState('170');
  
  const [cm, setCm] = useState('178');
  const [kg, setKg] = useState('77');

  const handleSystemChange = (newSystem: System) => {
    if (newSystem === system) return;
    
    if (newSystem === 'metric') {
      const f = parseInt(feet) || 0;
      const i = parseInt(inches) || 0;
      const hCm = (f * 12 + i) * 2.54;
      setCm(Math.round(hCm).toString());
      const wKg = (parseFloat(lbs) || 0) / 2.20462;
      setKg(wKg.toFixed(1));
    } else {
      const hCm = parseFloat(cm) || 0;
      const totalInches = hCm / 2.54;
      const f = Math.floor(totalInches / 12);
      const i = Math.round(totalInches % 12);
      setFeet(f.toString());
      setInches(i.toString());
      const wKg = parseFloat(kg) || 0;
      const wLbs = wKg * 2.20462;
      setLbs(Math.round(wLbs).toString());
    }
    setSystem(newSystem);
  }

  let heightCm = 0;
  let weightKg = 0;
  let parsedAge = parseInt(age) || 0;

  if (system === 'imperial') {
    const f = parseInt(feet) || 0;
    const i = parseInt(inches) || 0;
    heightCm = (f * 12 + i) * 2.54;
    weightKg = (parseFloat(lbs) || 0) / 2.20462;
  } else {
    heightCm = parseFloat(cm) || 0;
    weightKg = parseFloat(kg) || 0;
  }

  let bmi = 0;
  let bmr = 0;
  let category = '—';
  let categoryColor = 'text-ink/40';

  if (heightCm > 0 && weightKg > 0 && parsedAge > 0) {
    const heightM = heightCm / 100;
    bmi = weightKg / (heightM * heightM);
    
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * parsedAge;
    bmr += (gender === 'male' ? 5 : -161);

    if (bmi < 18.5) { category = t('categoryUnderweight'); categoryColor = 'text-blue-500'; }
    else if (bmi < 25) { category = t('categoryNormal'); categoryColor = 'text-green-500'; }
    else if (bmi < 30) { category = t('categoryOverweight'); categoryColor = 'text-amber-500'; }
    else { category = t('categoryObese'); categoryColor = 'text-red-500'; }
  }

  const isValid = bmi > 0;
  
  // BMI visual calculation
  // Let's cap the gauge between 15 (min) and 40 (max)
  const minBmi = 15;
  const maxBmi = 40;
  const pointerPercentage = isValid ? Math.max(0, Math.min(100, ((bmi - minBmi) / (maxBmi - minBmi)) * 100)) : 0;

  return (
    <section className="w-full rounded-3xl bg-white p-4 sm:p-6 md:p-12 lg:p-16 border border-black/5 shadow-[0_20px_60px_rgb(0,0,0,0.05)] relative z-10 flex flex-col lg:flex-row gap-8 lg:gap-20">
      
      {/* Left: Conversational Form */}
      <div className="flex-1 flex flex-col justify-center">
        <FadeUp>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-ink/30">BMI & BMR Configurator</h2>
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
                  setAge('30'); setFeet('5'); setInches('10'); setLbs('170'); setCm('178'); setKg('77');
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
            />. 
            I measure 
            {system === 'imperial' ? (
              <>
                <DynamicInput value={feet} onChange={setFeet} /> ft <DynamicInput value={inches} onChange={setInches} /> in
              </>
            ) : (
              <>
                <DynamicInput value={cm} onChange={setCm} minWidth={3} /> cm
              </>
            )}
            {' '}in height and weigh 
            {system === 'imperial' ? (
              <>
                <DynamicInput value={lbs} onChange={setLbs} minWidth={3} /> lbs.
              </>
            ) : (
              <>
                <DynamicInput value={kg} onChange={setKg} minWidth={3} /> kg.
              </>
            )}
          </div>
        </FadeUp>
      </div>

      {/* Right: Result Display */}
      <div className="w-full lg:w-[450px] shrink-0 flex flex-col gap-6 h-full">
        <FadeUp delay={0.2} className="flex-1">
          <div className="bg-[#FAFAFA] rounded-2xl border border-black/5 p-8 flex flex-col items-center justify-center text-center h-full shadow-[inset_0_2px_20px_rgba(0,0,0,0.02)] relative min-h-[250px]">
            <h3 className="absolute top-8 font-black uppercase tracking-[0.2em] text-ink/30 text-xs">Body Mass Index (BMI)</h3>
            
            <div className="relative w-full flex flex-col items-center mt-6">
              <AnimatePresence mode="popLayout">
                <motion.div 
                  key={isValid ? bmi.toFixed(1) : 'empty'}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-6xl md:text-7xl font-black tracking-tighter leading-none mb-2 ${isValid ? categoryColor : 'text-ink/20'}`}
                >
                  {isValid ? bmi.toFixed(1) : '—'}
                </motion.div>
              </AnimatePresence>
              <div className={`text-sm font-black uppercase tracking-widest mb-6 ${isValid ? categoryColor : 'text-ink/20'}`}>{category}</div>
            </div>

            {/* Dynamic BMI Gauge */}
            <div className="w-full max-w-[250px] relative h-2 rounded-full overflow-visible mt-2 flex">
              <div className="h-full w-[14%] bg-blue-500 rounded-l-full" />
              <div className="h-full w-[26%] bg-green-500" />
              <div className="h-full w-[20%] bg-amber-500" />
              <div className="h-full w-[40%] bg-red-500 rounded-r-full" />
              
              <motion.div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-[3px] border-black rounded-full shadow-md z-10"
                style={{ left: `calc(${pointerPercentage}% - 8px)` }}
                initial={{ left: 0, opacity: 0 }}
                animate={{ left: `calc(${pointerPercentage}% - 8px)`, opacity: isValid ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              />
            </div>
            <div className="w-full max-w-[250px] flex justify-between mt-2 text-[8px] font-bold text-ink/30 uppercase">
              <span>15</span>
              <span>40+</span>
            </div>

          </div>
        </FadeUp>

        <FadeUp delay={0.3} className="flex-1">
          <div className="bg-[#FAFAFA] rounded-2xl border border-black/5 p-8 flex flex-col items-center justify-center text-center h-full shadow-[inset_0_2px_20px_rgba(0,0,0,0.02)] relative min-h-[220px]">
            <h3 className="absolute top-8 font-black uppercase tracking-[0.2em] text-ink/30 text-xs">Basal Metabolic Rate</h3>
            <div className="relative w-full flex flex-col items-center mt-6">
              <AnimatePresence mode="popLayout">
                <motion.div 
                  key={isValid ? Math.round(bmr) : 'empty2'}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl md:text-6xl font-black text-amber-500 tracking-tighter leading-none mb-2"
                >
                  {isValid ? Math.round(bmr).toLocaleString() : '—'}
                </motion.div>
              </AnimatePresence>
              <div className="text-sm font-black uppercase tracking-widest text-ink/40">Calories / Day</div>
            </div>
          </div>
        </FadeUp>
      </div>

    </section>
  )
}
