'use client'
import React, { useEffect, useRef } from 'react'
import { motion, useMotionValue, useAnimationFrame, useTransform } from 'framer-motion'

interface ShinyBadgeProps {
  children: React.ReactNode
  disabled?: boolean
  speed?: number
  className?: string
  color?: string
  shineColor?: string
  spread?: number
  direction?: 'left' | 'right'
  delay?: number
}

export const ShinyBadge: React.FC<ShinyBadgeProps> = ({
  children,
  disabled = false,
  speed = 2.2,
  className = '',
  color = '#c7c7c7',
  shineColor = '#ffffff',
  spread = 120,
  direction = 'left',
  delay = 0,
}) => {
  const progress = useMotionValue(0)
  const elapsedRef = useRef(0)
  const lastTimeRef = useRef<number | null>(null)
  const directionRef = useRef(direction === 'left' ? 1 : -1)

  const animationDuration = speed * 1000
  const delayDuration = delay * 1000

  useAnimationFrame((time) => {
    if (disabled) {
      lastTimeRef.current = null
      return
    }

    if (lastTimeRef.current === null) {
      lastTimeRef.current = time
      return
    }

    const deltaTime = time - lastTimeRef.current
    lastTimeRef.current = time
    elapsedRef.current += deltaTime

    const cycleDuration = animationDuration + delayDuration
    const cycleTime = elapsedRef.current % cycleDuration

    if (cycleTime < animationDuration) {
      const p = (cycleTime / animationDuration) * 100
      progress.set(directionRef.current === 1 ? p : 100 - p)
    } else {
      progress.set(directionRef.current === 1 ? 100 : 0)
    }
  })

  useEffect(() => {
    directionRef.current = direction === 'left' ? 1 : -1
    elapsedRef.current = 0
    progress.set(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction])

  const backgroundPosition = useTransform(progress, (p) => `${150 - p * 2}% center`)

  const gradientStyle = {
    backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
    backgroundSize: '200% auto',
  }

  return (
    <motion.div className={className} style={{ ...gradientStyle, backgroundPosition }}>
      {children}
    </motion.div>
  )
}
