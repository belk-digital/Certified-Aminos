'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const IDLE_MESSAGES = [
  { emoji: "🤫", text: "Shhh... my lab rats are sleeping." },
  { emoji: "🧪", text: "Currently synthesizing..." },
  { emoji: "🥼", text: "Did you forget your lab coat?" },
  { emoji: "🔬", text: "Pondering molecular structures..." },
  { emoji: "⚖️", text: "Calibrating the microscales..." }
];

export function IdleMewingCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isIdle, setIsIdle] = useState(false);
  const [activeMessage, setActiveMessage] = useState(IDLE_MESSAGES[0]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // If we are currently idle, wake up instantly
      setIsIdle(false);

      // Clear the previous timeout
      clearTimeout(timeout);

      // Set a new timeout to trigger idle state after 7 seconds of no movement
      timeout = setTimeout(() => {
        // Only a 25% chance to show the tooltip when they go idle, so it remains a surprise
        if (Math.random() < 0.25) {
          const randomMsg = IDLE_MESSAGES[Math.floor(Math.random() * IDLE_MESSAGES.length)];
          setActiveMessage(randomMsg);
          setIsIdle(true);
        }
      }, 7000);
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Initial timeout in case they never move the mouse
    timeout = setTimeout(() => {
      if (Math.random() < 0.25) {
        const randomMsg = IDLE_MESSAGES[Math.floor(Math.random() * IDLE_MESSAGES.length)];
        setActiveMessage(randomMsg);
        setIsIdle(true);
      }
    }, 7000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <AnimatePresence>
      {isIdle && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: mousePosition.x + 10, 
            top: mousePosition.y + 10,
          }}
        >
          {/* Cloud Container with Drop Shadow */}
          <div className="relative drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)]">
            {/* The Thought Trail (pointing to cursor) */}
            <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-white rounded-full"></div>
            <div className="absolute top-3 left-3 w-2.5 h-2.5 bg-white rounded-full"></div>
            
            {/* The Main Cloud */}
            <div className="relative bg-white text-ink text-[10px] font-bold px-4 py-2.5 rounded-full flex items-center gap-2 mt-6 ml-6">
              {/* Cloud Bumps for fluffiness */}
              <div className="absolute -top-2 left-4 w-6 h-6 bg-white rounded-full"></div>
              <div className="absolute -top-3 right-6 w-8 h-8 bg-white rounded-full"></div>
              <div className="absolute -bottom-1 left-6 w-4 h-4 bg-white rounded-full"></div>
              
              <span className="relative z-10 text-sm">{activeMessage.emoji}</span>
              <span className="relative z-10 opacity-80 pt-px whitespace-nowrap">{activeMessage.text}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
