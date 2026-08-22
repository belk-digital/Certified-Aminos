"use client";
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Footer.css';

const Footer = () => {
  const container = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      });

      tl.from(".newsletter-section", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out"
      })
      .from(".footer-nav", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out"
      }, "-=0.6")
      .from(".brand-huge-text", {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      }, "-=0.4")
      .from(".copyright-links", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.6")
      .from(".footer-image-wrapper", {
        x: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      }, "-=1.2");

    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <footer className="footer-container" ref={container}>
      <div className="footer-content">
        <div className="footer-left">
          <div className="newsletter-section">
            <h2 className="stay-connected">Stay connected</h2>
            <p className="newsletter-desc">
              Join our community for exclusive research insights and product updates.
            </p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="smith@gmail.com" className="newsletter-input" required />
              <button type="submit" className="newsletter-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="19" x2="19" y2="5"></line>
                  <polyline points="9 5 19 5 19 15"></polyline>
                </svg>
              </button>
            </form>
          </div>

          <div className="footer-bottom-left">
            <h1 className="brand-huge-text">Certified<br/>Aminos</h1>
            <div className="copyright-group">
              <div className="copyright-links">
                <span>© 2026 Certified Aminos</span>
                <span className="link-group">
                  <span className="dot-separator">•</span>
                  <a href="#privacy">Privacy Policy</a>
                </span>
                <span className="link-group">
                  <span className="dot-separator">•</span>
                  <a href="#terms">Terms of Service</a>
                </span>
              </div>
              <div className="agency-credit-container">
                <span className="agency-credit">Designed and developed by <a href="https://belkdigital.com" target="_blank" rel="noopener noreferrer" className="agency-link">Belk Digital</a></span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-right">
          <div className="footer-nav">
            <div className="nav-column">
              <a href="#shop">Shop</a>
              <a href="#categories">Categories</a>
              <a href="#calculator">Calculator</a>
              <a href="#about">About</a>
            </div>
            <div className="nav-column">
              <a href="#blog">Blog</a>
              <a href="#faq">FAQ</a>
              <a href="#contact">Contact</a>
              <a href="#affiliates">Affiliates</a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-image-wrapper">
        <img src="/footer-image.png" alt="Products" className="footer-product-image" />
      </div>
    </footer>
  );
};

export default Footer;
