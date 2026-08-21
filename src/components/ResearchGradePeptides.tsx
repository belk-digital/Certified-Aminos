"use client";
import React from 'react';

export default function ResearchGradePeptides() {
  return (
    <section className="w-full bg-white flex flex-col pt-16 md:pt-24 pb-0">

      {/* Header Section */}
      <div className="w-full max-w-[1400px] mx-auto px-8 relative z-20">
        <div className="flex flex-col items-center text-center max-w-6xl mx-auto">
          <span className="text-[11px] text-gray-500 tracking-[0.2em] font-semibold uppercase mb-4">
            CERTIFIED AMINOS
          </span>
          <h2 className="font-syncopate text-[#1e3a8a] text-4xl md:text-[3.5rem] lg:text-[4.5rem] font-medium leading-[1.1] tracking-wide mb-6 uppercase whitespace-nowrap">
            The Lab Difference
          </h2>
          <p className="text-gray-500 font-inter text-[9px] md:text-[11px] tracking-[0.2em] uppercase font-semibold leading-relaxed max-w-2xl">
            Every batch undergoes rigorous third-party testing. Access our Certificates of Analysis (COA) to verify the purity and quality of our compounds.
          </p>
          <button className="mt-8 flex items-center justify-center gap-3 px-8 py-3.5 bg-[#1f2533] text-white text-[11px] font-semibold tracking-[0.2em] uppercase rounded-sm hover:bg-[#354363] transition-colors">
            <span>View COA</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </button>
        </div>
      </div>

      {/* Image Section with Overlays */}
      <div className="w-full relative flex justify-center">
        <img
          src="/research-grade-peptides-image.png"
          alt="Research Grade Peptides"
          className="w-full h-auto object-cover"
        />
        <img
          src="/transparent_vial.png"
          alt="Transparent Vial"
          className="absolute z-10 left-[48%] bottom-[8%] md:bottom-[10%] transform -translate-x-1/2 h-[55%] md:h-[60%] lg:h-[65%] w-auto object-contain pointer-events-none drop-shadow-2xl"
        />

        {/* Blending Gradient to fade the top hard edge into the white background */}
        <div className="absolute inset-x-0 top-0 h-32 md:h-64 bg-gradient-to-b from-white via-white/50 to-transparent pointer-events-none"></div>

        {/* Pointers Overlay (Hidden on Mobile) */}
        <div className="absolute inset-0 hidden md:block pointer-events-none">

          {/* Master SVG for connecting lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
            {/* Top Center Line */}
            <line x1="500" y1="200" x2="500" y2="480" stroke="#566c9c" strokeWidth="1" vectorEffect="non-scaling-stroke" />

            {/* Left Line */}
            <polyline points="150,400 350,700 440,700" fill="none" stroke="#566c9c" strokeWidth="1" vectorEffect="non-scaling-stroke" />

            {/* Right Line */}
            <polyline points="850,400 650,700 560,700" fill="none" stroke="#566c9c" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>

          {/* --- Top Center Pointer --- */}
          <div className="absolute" style={{ left: '50%', top: '20%', transform: 'translate(-50%, -50%)' }}>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 flex items-center gap-2 text-[#354363] font-inter text-[11px] lg:text-[13px] font-bold uppercase tracking-[0.15em] whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
              <span>Independently Lab Tested</span>
            </div>
            {/* Dot */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#566c9c] border-[2px] border-white shadow-md relative z-10"></div>
          </div>

          {/* --- Left Pointer --- */}
          <div className="absolute" style={{ left: '15%', top: '40%', transform: 'translate(-50%, -50%)' }}>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 flex items-center gap-2 text-[#354363] font-inter text-[11px] lg:text-[13px] font-bold uppercase tracking-[0.15em] whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
              <span>Made in USA</span>
            </div>
            {/* Dot */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#566c9c] border-[2px] border-white shadow-md relative z-10"></div>
          </div>

          {/* --- Right Pointer --- */}
          <div className="absolute" style={{ left: '85%', top: '40%', transform: 'translate(-50%, -50%)' }}>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 flex items-center gap-2 text-[#354363] font-inter text-[11px] lg:text-[13px] font-bold uppercase tracking-[0.15em] whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.31" /><path d="M14 9.3V1.99" /><path d="M8.5 2h7" /><path d="M14 9.3a6.5 6.5 0 1 1-4 0" /><path d="M5.52 16h12.96" /></svg>
              <span>&gt;99% Purity Guaranteed</span>
            </div>
            {/* Dot */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#566c9c] border-[2px] border-white shadow-md relative z-10"></div>
          </div>

        </div>
      </div>

    </section>
  );
}
