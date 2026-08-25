'use client'

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { useLenis } from 'lenis/react'
import { useCartStore } from '@/lib/cart/store'

export function CustomScrollbar() {
  const { scrollYProgress } = useScroll()
  const trackRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const [dragging, setDragging] = useState(false)
  const [hovered, setHovered] = useState(false)
  
  const isCartOpen = useCartStore((state) => state.isOpen)
  
  const trackerTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])
  const trackerTranslateY = useTransform(scrollYProgress, [0, 1], ["0%", "-100%"])
  const lenis = useLenis()

  if (isCartOpen) return null

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging.current || !trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    const percentage = clickY / rect.height
    
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
    if (lenis) {
      lenis.scrollTo(scrollableHeight * percentage, { lerp: 0.05 })
    } else {
      window.scrollTo({ top: scrollableHeight * percentage, behavior: 'smooth' })
    }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    setDragging(true)
    document.body.style.userSelect = 'none'
    
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging.current || !trackRef.current) return
    
    const rect = trackRef.current.getBoundingClientRect()
    let y = e.clientY - rect.top
    y = Math.max(0, Math.min(y, rect.height))
    const percentage = y / rect.height
    
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
    
    if (lenis) {
      lenis.scrollTo(scrollableHeight * percentage, { immediate: false, lerp: 0.1 })
    } else {
      window.scrollTo({ top: scrollableHeight * percentage, behavior: 'auto' })
    }
  }

  const handlePointerUp = () => {
    isDragging.current = false
    setDragging(false)
    document.body.style.userSelect = ''
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
  }

  const isActive = dragging || hovered;

  return (
    <div className="fixed top-12 bottom-24 right-0 w-12 pointer-events-none z-[9999] hidden sm:flex justify-end print:hidden">
      
      {/* Interactive Track Area */}
      <div 
        ref={trackRef}
        className="relative h-full w-12 pointer-events-auto cursor-pointer flex justify-center group"
        onClick={handleTrackClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Modern Sci-Fi Ruler Track */}
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-zinc-500/30 to-transparent transition-opacity duration-500 opacity-30 group-hover:opacity-100" />
        
        {/* Dynamic Glowing Capsule */}
        <motion.div 
          className="absolute right-[22px] pointer-events-auto flex flex-col items-center justify-start cursor-grab active:cursor-grabbing"
          style={{
            top: trackerTop,
            y: trackerTranslateY // Framer motion uses 'y' for translateY as a string with %
          }}
          onPointerDown={handlePointerDown}
        >
          {/* Expanded hit area */}
          <div className="absolute inset-[-20px] bg-transparent" />
          
          <motion.div 
            animate={{ 
              height: dragging ? 64 : hovered ? 48 : 32,
              width: dragging ? 6 : hovered ? 6 : 4,
              backgroundColor: isActive ? 'rgba(20, 20, 20, 0.9)' : 'rgba(20, 20, 20, 0.6)',
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="rounded-full relative flex items-center justify-center overflow-hidden border border-zinc-700 backdrop-blur-md shadow-[0_0_10px_rgba(0,0,0,0.5)]"
            style={{
              boxShadow: isActive ? "0 0 20px rgba(146, 220, 229, 0.4), 0 4px 12px rgba(0,0,0,0.8)" : "0 4px 12px rgba(0,0,0,0.5)"
            }}
          >
            {/* Inner glowing core */}
            <motion.div 
              animate={{ 
                height: isActive ? '100%' : '50%',
                opacity: isActive ? 1 : 0.7
              }}
              className="w-full bg-primary absolute bottom-0 transition-all duration-300"
            />
          </motion.div>
          
        </motion.div>
      </div>
    </div>
  )
}
