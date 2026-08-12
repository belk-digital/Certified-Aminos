'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { ChevronLeft, ChevronRight, Info, Menu, ShoppingCart, ShoppingBag, FlaskConical, Gem, Microscope, Hand } from 'lucide-react';
import './DesktopSlider.css';

gsap.registerPlugin(ScrollTrigger);

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
    desktopScale: 1.05
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
    desktopScale: 0.75
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
    desktopScale: 0.75
  }
];

export default function DesktopSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const transitionWrapperRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const floatWrapperRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeDosage, setActiveDosage] = useState(0);
  const [qty, setQty] = useState(1);
  
  const activeProduct = products[currentIndex];
  const nextProductIndex = (currentIndex + 1) % products.length;
  const nextProduct = products[nextProductIndex];

  const previewBottleRef = useRef<HTMLImageElement>(null);

  // Hover floating animation
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.to(floatWrapperRef.current, {
        y: -15,
        rotationZ: 2,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

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
          gsap.to([leftColRef.current, rightColRef.current], {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out'
          });
          // New bottle flies in from the preview bottle's position
          gsap.fromTo(transitionWrapperRef.current, 
            { x: 400, y: -250, scale: 0.2, rotationZ: 15, opacity: 1 },
            { x: 0, y: 0, scale: 1, rotationZ: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
          );
          // Fade in the new preview bottle
          gsap.fromTo(previewBottleRef.current,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.6, delay: 0.4 }
          );
        }
      });

      // Fade out old content
      tl.to([leftColRef.current, rightColRef.current], {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: 'power2.in'
      }, 0);
      
      // Old bottle flies top-left and fades
      tl.to(transitionWrapperRef.current, {
        x: -400,
        y: -300,
        opacity: 0,
        scale: 0.5,
        duration: 0.6,
        ease: 'power2.in'
      }, 0);

      // Hide current preview bottle as it "moves" to the center
      tl.to(previewBottleRef.current, {
        opacity: 0,
        duration: 0.2
      }, 0);
    });
    
    return () => ctx.revert();
  };

  const nextSlide = () => changeSlide((currentIndex + 1) % products.length);
  const prevSlide = () => changeSlide((currentIndex - 1 + products.length) % products.length);

  // Scroll-triggered rotation
  useEffect(() => {
    // Create a scroll trigger just to link scroll progress to bottle rotation
    // Note: for a true scroll-jacking slider, we would pin a container. 
    // Here we will use Observer for a more app-like feel on wheel, but link scroll to rotation if the page is scrollable.
    let ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          // As user scrolls, rotate the bottle slightly to feel 3D
          gsap.to(scrollWrapperRef.current, {
            rotationY: self.progress * 360,
            duration: 0.5,
            overwrite: 'auto',
            ease: 'power1.out'
          });
        }
      });
      
    });
    return () => ctx.revert();
  }, [currentIndex]); // Re-bind observer to have correct currentIndex

  return (
    <div className="sliderContainer" ref={containerRef}>
      {/* Header */}
      <header className="header">
        <ul className="productTabs">
          {products.map((p, idx) => (
            <li 
              key={p.id} 
              className={`tab ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => changeSlide(idx)}
              style={{ cursor: 'pointer' }}
            >
              {p.name}
            </li>
          ))}
        </ul>
      </header>

      {/* Main Layout */}
      <main className="mainContent">
        {/* Left Column */}
        <div className="leftCol" ref={leftColRef}>
          <div className="bestSellersHeading">
            <span className="accentLine"></span> Our Best Sellers
          </div>
          <h1 className="title">{activeProduct.name}</h1>
          <div className="dosageTitle" style={{ color: activeProduct.accent }}>
            {activeProduct.dosageOptions[activeDosage]}
          </div>
          <p className="description">{activeProduct.desc}</p>
          <div className="disclaimer">
            RESEARCH USE ONLY &bull; NOT FOR HUMAN CONSUMPTION
          </div>
        </div>

        {/* Center Column - 3D Bottle */}
        <div className="centerCol">
          <div className="bottleWrapper" ref={transitionWrapperRef}>
            <div ref={scrollWrapperRef} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div ref={floatWrapperRef} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img 
                  src={activeProduct.image} 
                  alt={activeProduct.name} 
                  className="mainBottleImage"
                  style={{ transform: `scale(${activeProduct.desktopScale}) rotate(15deg)` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="rightCol" ref={rightColRef}>
          <div className="nextProduct">
            <div className="nextProductInfo">
              <div className="nextLabel">Next Product</div>
              <div className="nextTitle">{nextProduct.name}</div>
              <div className="nextDosage">{nextProduct.dosageOptions[0]}</div>
            </div>
            <img ref={previewBottleRef} src={nextProduct.image} className="previewBottle" alt="next" />
            <button className="nextBtn" onClick={nextSlide}>
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="dosageSelector">
            {activeProduct.dosageOptions.map((dosage, idx) => (
              <button 
                key={dosage}
                className={`dosageCircle ${idx === activeDosage ? 'active' : ''}`}
                onClick={() => setActiveDosage(idx)}
              >
                {dosage}
              </button>
            ))}
          </div>

          <a href="#" className="infoLink">
            <Info size={16} /> Overview, Dosage and Research
          </a>

            <div className="actionCard">
              <div className="actionFooter">
                <div className="price">
                  ${parseInt(activeProduct.price.replace('$', '')) * qty}
                </div>
                <div className="quantitySelector">
                  <button className="qtyBtn" onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                  <span className="qtyValue">{qty}</span>
                  <button className="qtyBtn" onClick={() => setQty(qty + 1)}>+</button>
                </div>
                <button className="buyBtn"><ShoppingBag size={20} /> Buy Now</button>
              </div>
            </div>
          </div>
      </main>
    </div>
  );
}
