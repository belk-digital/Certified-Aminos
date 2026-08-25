"use client";
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function WhyPeptides() {
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    const ctx = gsap.context(() => {
      // Text animations
      gsap.from(".wp-text-elem", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".wp-content",
          start: "top 75%",
        }
      });

      // Feature items animation
      gsap.from(".wp-feature", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".wp-features-container",
          start: "top 80%",
        }
      });

      // Image animation
      gsap.from(".wp-image", {
        y: 80,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full bg-[#f4f7fa] min-h-screen pt-20 px-8 flex items-stretch overflow-hidden font-inter relative">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-stretch">
        
        {/* Left Side - Visuals */}
        <div className="relative w-full flex items-end justify-center pt-10">
          <img 
            src="/finalized product images/products-image-for-section.png" 
            alt="Certified Aminos Products" 
            className="wp-image w-full max-h-[90vh] object-contain object-bottom drop-shadow-2xl scale-[1.15] origin-bottom"
          />
        </div>
        
        {/* Right Side - Content */}
        <div className="wp-content flex flex-col justify-center max-w-3xl lg:max-w-4xl relative z-30 pb-20">
          <span className="wp-text-elem text-[11px] text-gray-500 tracking-[0.2em] font-semibold uppercase mb-4">
            ORIGIN & INTENT
          </span>
          <h2 className="wp-text-elem text-[#1e3a8a] font-syncopate text-3xl md:text-5xl font-medium tracking-wide leading-[1.1] mb-6 uppercase">
            Why Peptides<br /><span>Change Everything.</span>
          </h2>
          <p className="wp-text-elem text-gray-600 text-[15px] md:text-[17px] leading-relaxed mb-12">
            Peptides are short chains of amino acids — the signal molecules your body already speaks. By introducing clinically-dosed peptides, we direct cells to rebuild collagen, repair tissue and restore youthful function from the inside out.
          </p>
          
          <div className="wp-features-container flex flex-col w-full">
            
            {/* Feature 1 */}
            <div className="wp-feature border-t border-gray-200 py-6 flex gap-6">
              <div className="text-[#1e3a8a] text-3xl md:text-4xl font-semibold w-12 md:w-16 flex-shrink-0">
                01
              </div>
              <div className="flex flex-col">
                <h3 className="text-[#1e3a8a] text-lg font-semibold mb-2">Bioidentical Signaling</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Peptides mimic molecules your body naturally produces — no synthetic analogs, no metabolic translation required.
                </p>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="wp-feature border-t border-gray-200 py-6 flex gap-6">
              <div className="text-[#1e3a8a] text-3xl md:text-4xl font-semibold w-12 md:w-16 flex-shrink-0">
                02
              </div>
              <div className="flex flex-col">
                <h3 className="text-[#1e3a8a] text-lg font-semibold mb-2">Targeted Cellular Action</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Each peptide binds to specific receptors, triggering precise biological pathways for collagen, elastin or repair.
                </p>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="wp-feature border-t border-b border-gray-200 py-6 flex gap-6">
              <div className="text-[#1e3a8a] text-3xl md:text-4xl font-semibold w-12 md:w-16 flex-shrink-0">
                03
              </div>
              <div className="flex flex-col">
                <h3 className="text-[#1e3a8a] text-lg font-semibold mb-2">Proven, not Promised</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Every formula is built on peer-reviewed research and validated with in-house clinical testing protocols.
                </p>
              </div>
            </div>
            
          </div>
        </div>
        
      </div>
    </section>
  );
}
