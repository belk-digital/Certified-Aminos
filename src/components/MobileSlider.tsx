'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, Info, Menu, ShoppingCart, ShoppingBag, FlaskConical, Gem, Microscope, Hand } from 'lucide-react';
import './MobileSlider.css';

const products = [
  {
    id: 1,
    name: 'Retatrutide',
    dosageOptions: ['10MG', '20MG', '30MG'],
    defaultDosageIndex: 0,
    desc: 'Next-generation triple agonist peptide researched for advanced metabolic health and weight management.',
    image: '/certified-aminos-retatrutide-10mg.png',
    price: '$199',
    accent: '#a8cd24',
    next: 'Semaglutide',
    mobileScale: 1.05
  },
  {
    id: 2,
    name: 'Semaglutide',
    dosageOptions: ['5MG', '10MG', '15MG'],
    defaultDosageIndex: 0,
    desc: 'GLP-1 receptor agonist studied for its potential in significant weight loss and cardiovascular risk reduction.',
    image: '/certified-aminos-semaglutide-10mg.png',
    price: '$149',
    accent: '#3bcaf5',
    next: 'BPC-157',
    mobileScale: 0.9
  },
  {
    id: 3,
    name: 'BPC-157',
    dosageOptions: ['5MG', '10MG'],
    defaultDosageIndex: 0,
    desc: 'Body Protection Compound known for accelerating healing of many different wounds, including tendon-to-bone.',
    image: '/certified-aminos-BPC-157-5mg.png',
    price: '$89',
    accent: '#dcf53b',
    next: 'Retatrutide',
    mobileScale: 0.9
  }
];

export default function MobileSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const transitionWrapperRef = useRef<HTMLDivElement>(null);
  const floatWrapperRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeDosage, setActiveDosage] = useState(0);
  const [qty, setQty] = useState(1);
  
  const activeProduct = products[currentIndex];
  const nextProductIndex = (currentIndex + 1) % products.length;
  const nextProduct = products[nextProductIndex];

  // Hover floating animation
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.to(floatWrapperRef.current, {
        y: -10,
        rotationZ: 2,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const nextSlide = () => {
    changeSlide((currentIndex + 1) % products.length);
  };

  const prevSlide = () => {
    changeSlide((currentIndex - 1 + products.length) % products.length);
  };

  // Handle slide change with animation
  const changeSlide = (newIndex: number) => {
    if (newIndex === currentIndex) return;
    
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setCurrentIndex(newIndex);
          setActiveDosage(0);
          setQty(1);
          // Fade in new content
          gsap.to([infoRef.current], {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out'
          });
          // New bottle flies in
          gsap.fromTo(transitionWrapperRef.current, 
            { x: 200, scale: 0.8, opacity: 0 },
            { x: 0, scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.2)' }
          );
        }
      });
      
      // Fade out current content
      tl.to([infoRef.current], {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: 'power2.in'
      }, 0);
      
      // Bottle flies out
      tl.to(transitionWrapperRef.current, {
        x: -200,
        scale: 0.8,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in'
      }, 0);
    });
    return () => ctx.revert();
  };

  // Handle swipe detection manually
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 75) {
      nextSlide(); // swipe left
    }
    if (touchStartX.current - touchEndX.current < -75) {
      prevSlide(); // swipe right
    }
  };

  return (
    <div 
      className="mobileSliderContainer" 
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. Mobile Header */}
      <header className="mobileHeader">
        <Menu size={28} className="mobileMenuIcon" />
        <div className="mobileLogo">
          <span className="logoBrand">CERTIFIED</span>
          <span className="logoAminos">AMINOS</span>
        </div>
        <div className="mobileCart">
          <ShoppingCart size={24} />
          <span className="cartBadge">2</span>
        </div>
      </header>
      
      {/* 2. Product Tabs */}
      <ul className="mobileProductTabs">
        {products.map((p, idx) => (
          <li 
            key={p.id} 
            className={`mobileTab ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => changeSlide(idx)}
          >
            {p.name}
          </li>
        ))}
      </ul>

      {/* Main Content Area */}
      <main className="mobileMainContent">
        
        {/* 3. Product Title Area */}
        <div className="mobileTitleArea" ref={infoRef}>
          <div className="mobileBestSellers">OUR BEST SELLERS</div>
          <h1 className="mobileTitle">{activeProduct.name}</h1>
          <div className="mobileDosageTitle" style={{ color: activeProduct.accent }}>
            {activeProduct.dosageOptions[activeDosage]}
          </div>
          <p className="mobileDesc">{activeProduct.desc}</p>
          <div className="mobileDisclaimer">
            RESEARCH USE ONLY<br/>NOT FOR HUMAN CONSUMPTION
          </div>
        </div>

        {/* 4. Bottle Area */}
        <div className="mobileBottleArea">
          <button className="mobileNavBtn prev" onClick={prevSlide}><ChevronLeft size={24} /></button>
          
          <div className="bottleWrapper" ref={transitionWrapperRef}>
            <div ref={floatWrapperRef} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img 
                src={activeProduct.image} 
                alt={activeProduct.name} 
                className="mobileBottleImage"
                style={{ transform: `scale(${activeProduct.mobileScale}) rotate(10deg)` }}
              />
            </div>
          </div>
          
          <button className="mobileNavBtn next" onClick={nextSlide}><ChevronRight size={24} /></button>
        </div>



        {/* 6. Bottom Purchase Area */}
        <div className="mobileBottomArea">
          <div className="mobileCarouselDots">
            {products.map((_, idx) => (
              <div 
                key={idx} 
                className={`mobileDot ${idx === currentIndex ? 'active' : ''}`} 
                style={idx === currentIndex ? {backgroundColor: activeProduct.accent} : {}} 
              />
            ))}
          </div>

          <div className="mobileActionCard">
            <div className="mobileActionRow">
              <div className="mobilePrice">
                ${parseInt(activeProduct.price.replace('$', '')) * qty}
              </div>
              <div className="mobileQtySelector">
                <button className="mobileQtyBtn" onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                <span className="mobileQtyValue">{qty}</span>
                <button className="mobileQtyBtn" onClick={() => setQty(qty + 1)}>+</button>
              </div>
            </div>
            
            <button className="mobileBuyBtn">
              <ShoppingBag size={20} /> Buy Now
            </button>
            
            <div className="mobileDosageSelector" style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)', justifyContent: 'center' }}>
              {activeProduct.dosageOptions.map((dosage, idx) => (
                <button 
                  key={dosage}
                  className={`mobileDosageBtn ${idx === activeDosage ? 'active' : ''}`}
                  onClick={() => setActiveDosage(idx)}
                >
                  {dosage}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mobileSwipeHint">
            <Hand size={14} className="mobileHandIcon" /> Swipe to explore more peptides
          </div>
        </div>

      </main>
    </div>
  );
}
