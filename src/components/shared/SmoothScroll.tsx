'use client'

import { ReactLenis, useLenis } from 'lenis/react'
import { ReactNode, useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface SmoothScrollProps {
  children: ReactNode
}

function ScrollToTop() {
  const pathname = usePathname()
  const lenis = useLenis()

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    }
  }, [pathname, lenis])

  return null
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  return (
    <ReactLenis root options={{ lerp: 0.1, wheelMultiplier: 0.8, smoothWheel: true }}>
      <ScrollToTop />
      {children}
    </ReactLenis>
  )
}
