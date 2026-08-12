'use client';

import React, { useState, useEffect } from 'react';
import DesktopSlider from './DesktopSlider';
import MobileSlider from './MobileSlider';

export default function Slider() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 992);
    };
    
    checkMobile(); // Check on mount
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent hydration mismatch by not rendering until client-side is ready
  if (!mounted) {
    return <div style={{ width: '100vw', height: '100vh', background: 'transparent' }} />;
  }

  if (isMobile) {
    return <MobileSlider />;
  }

  return <DesktopSlider />;
}
