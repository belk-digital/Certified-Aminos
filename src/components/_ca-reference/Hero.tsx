"use client";
import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import './Hero.css';

const Navbar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <a href="/" className="logo">CERTIFIED AMINOS</a>
      </div>
      <div className="nav-right">
        <button aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
        <button aria-label="Cart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </button>
        <button aria-label="User Profile">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </button>
        <button aria-label="Menu" onClick={() => setIsDrawerOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      {isDrawerOpen && (
        <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer-menu" onClick={e => e.stopPropagation()}>
            <button className="close-drawer" onClick={() => setIsDrawerOpen(false)} aria-label="Close Menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="drawer-links">
              <a href="#shop">SHOP</a>
              <a href="#categories" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                CATEGORIES
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 1l4 4 4-4" />
                </svg>
              </a>
              <a href="#calculator">CALCULATOR</a>
              <a href="#about">ABOUT</a>
              <a href="#blog">BLOG</a>
              <a href="#faq">FAQ</a>
              <a href="#contact">CONTACT</a>
              <a href="#affiliates">AFFILIATES</a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default function Hero() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // 1. Curtain appears first
      tl.from(".hero-waves-img", { 
          y: 150, 
          opacity: 0, 
          duration: 1.2,
          ease: "power2.out"
        })
        // 2. H1 text appears next
        .from(".hero-title-main", { y: 50, opacity: 0, duration: 1 }, "-=0.6")
        .from(".hero-title-sub", { y: 50, opacity: 0, duration: 1 }, "-=0.8")
        // 3. Product image
        .from(".hero-product-img", { 
          x: 100, 
          opacity: 0, 
          duration: 1.5,
          ease: "power2.out"
        }, "-=0.5")
        // 4. Other texts and UI elements
        .from(".navbar", { y: -50, opacity: 0, duration: 1 }, "-=1")
        .from(".hero-subtitle", { opacity: 0, duration: 1 }, "-=0.8")
        .from(".explore-btn", { scale: 0.9, opacity: 0, duration: 0.5 }, "-=0.8")
        .from(".pill-badge, .product-card", { 
          x: -50, 
          opacity: 0, 
          duration: 0.8, 
          stagger: 0.2 
        }, "-=1");
        
    }, container);
    
    return () => ctx.revert();
  }, []);

  return (
    <section className="hero-container" ref={container}>
      <Navbar />
      
      <div className="hero-content">
        <div className="hero-left-column">

          
          <div className="pill-badge">
            <span className="dots">••</span> RESEARCH PEPTIDE COMPOUNDS
          </div>
          
          <div className="product-card">
            <div className="card-image-bg">
              <img src="/finalized product images/certified-aminos-MT-1-10mg.png" alt="Product thumbnail" />
            </div>
            <div className="card-footer">
              <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 32 L16 58 L26 52 L32 58 L38 52 L48 58 L46 32 Z" fill="#141e3a"/>
                <path d="M32 4 L38 9 L45 6 L48 13 L55 13 L55 20 L61 25 L56 30 L61 36 L55 40 L55 47 L48 48 L45 54 L38 51 L32 56 L26 51 L19 54 L16 48 L9 47 L9 40 L3 36 L8 30 L3 25 L9 20 L9 13 L16 13 L19 6 L26 9 Z" fill="#141e3a"/>
                <circle cx="32" cy="30" r="14" fill="#ffffff"/>
                <path d="M26 31 L30 35 L39 25" stroke="#141e3a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>BATCH PURITY VERIFIED</span>
            </div>
          </div>
        </div>

        <div className="hero-main-area">
          <div className="title-row">
            <h1 className="hero-title-main">PRECISION BEYOND</h1>
          </div>
          <div className="content-row">
            <div className="text-content">
              <p className="hero-subtitle">
                Research-grade peptides created for reliable<br />quality, clear testing, and consistent<br />laboratory performance.
              </p>
              <button className="explore-btn">
                EXPLORE CATALOGUE <span className="arrow">→</span>
              </button>
            </div>
            <h1 className="hero-title-sub">PURITY</h1>
          </div>
        </div>
      </div>

      <div className="hero-background-elements">
        <img src="/hero-waves.png" alt="Waves" className="hero-waves-img" />
      </div>
      <img src="/finalized product images/hero-product-image.png" alt="Hero Product" className="hero-product-img" />
    </section>
  );
}
