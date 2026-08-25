'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hexagon } from 'lucide-react'

export function HiddenMolecule() {
  const [isActivated, setIsActivated] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!isActivated) return
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    
    // Auto-deactivate after 6 seconds
    const timer = setTimeout(() => {
      setIsActivated(false)
    }, 6000)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(timer)
    }
  }, [isActivated])

  return (
    <>
      {/* The trigger - hidden in plain sight */}
      <div className="absolute bottom-10 right-10 z-40 hidden md:block">
        <button
          onClick={() => setIsActivated(true)}
          className="opacity-5 hover:opacity-100 hover:text-primary transition-all duration-500 hover:scale-110 focus:outline-none"
          title="Analyze"
        >
          <Hexagon size={14} strokeWidth={1.5} />
        </button>
      </div>

      {/* The 3D Molecule Overlay */}
      <AnimatePresence>
        {isActivated && (
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed pointer-events-none z-[99999]"
            style={{
              left: mousePos.x,
              top: mousePos.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Simple CSS Molecule structure */}
            <div className="relative w-32 h-32 animate-spin" style={{ animationDuration: '4s' }}>
              <div className="absolute inset-0 border-2 border-primary rounded-full animate-ping opacity-20" />
              <div className="absolute inset-4 border border-primary/50 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <Hexagon size={48} className="text-primary animate-pulse" />
              </div>
              
              {/* Atoms */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_#fff]" />
              <div className="absolute bottom-2 left-0 w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_#008B8B]" />
              <div className="absolute bottom-2 right-0 w-5 h-5 bg-cyan-300 rounded-full shadow-[0_0_15px_#67e8f9]" />
              
              {/* Connecting Bonds (Lines) */}
              <div className="absolute top-2 left-1/2 w-[2px] h-10 bg-white/50 -translate-x-1/2 origin-top -rotate-[35deg]" />
              <div className="absolute top-2 left-1/2 w-[2px] h-10 bg-white/50 -translate-x-1/2 origin-top rotate-[35deg]" />
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute top-full mt-6 left-1/2 -translate-x-1/2 flex flex-col items-center"
            >
              <p className="text-primary font-mono text-[10px] whitespace-nowrap bg-black/90 px-4 py-1.5 rounded-full border border-primary/30 uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(0,139,139,0.3)]">
                Sequence Identified
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
