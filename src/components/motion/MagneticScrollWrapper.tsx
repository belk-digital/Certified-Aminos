"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function MagneticScrollWrapper({ children, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 5%", "start -30%"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 25,
    mass: 0.2
  });
  
  const y = useTransform(smoothProgress, [0, 1], [0, -250]);
  const opacity = useTransform(smoothProgress, [0, 0.8, 1], [1, 1, 0]);

  return (
    <motion.div 
      ref={ref}
      style={{ y, opacity }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
}
