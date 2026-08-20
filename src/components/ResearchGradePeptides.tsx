"use client";
import React from 'react';

export default function ResearchGradePeptides() {
  return (
    <section className="w-full bg-white flex flex-col pt-16 md:pt-24 pb-0">

      {/* Header Section */}
      <div className="w-full max-w-[1400px] mx-auto px-8 mb-12">
        <div className="flex flex-col items-start max-w-4xl">
          <h2 className="font-syncopate text-[#1f2533] text-4xl md:text-[3.5rem] lg:text-[4.5rem] font-medium leading-[1.1] tracking-wide mb-6">
            RESEARCH<br /><span className="whitespace-nowrap">GRADE PEPTIDES</span>
          </h2>
          <p className="text-gray-500 font-inter text-[9px] md:text-[11px] tracking-[0.2em] uppercase font-semibold leading-relaxed max-w-[400px]">
            High-purity compounds. Transparent testing.<br className="hidden md:block" /> Consistent research standards.
          </p>
        </div>
      </div>

      {/* Image Section with Overlays */}
      <div className="w-full relative max-w-[1600px] mx-auto flex justify-center">
        <img
          src="/research-grade-peptides-image.png"
          alt="Research Grade Peptides"
          className="w-full h-auto object-cover"
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

          {/* --- Top Center Pointer (COA Available) --- */}
          <div className="absolute flex flex-col items-center" style={{ left: '50%', top: '20%', transform: 'translate(-50%, -50%)' }}>
            <div className="flex items-center gap-2 text-[#354363] font-inter text-[9px] lg:text-[11px] font-bold uppercase tracking-[0.15em] mb-2 whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
              <span>COA Available</span>
            </div>
            {/* Dot */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#566c9c] border-[2px] border-white shadow-md relative z-10"></div>
          </div>

          {/* --- Left Pointer (Batch Verified) --- */}
          <div className="absolute flex flex-col items-center" style={{ left: '15%', top: '40%', transform: 'translate(-50%, -50%)' }}>
            <div className="flex items-center gap-2 text-[#354363] font-inter text-[9px] lg:text-[11px] font-bold uppercase tracking-[0.15em] mb-2 whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
              <span>Batch Verified</span>
            </div>
            {/* Dot */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#566c9c] border-[2px] border-white shadow-md relative z-10"></div>
          </div>

          {/* --- Right Pointer (For Research Use Only) --- */}
          <div className="absolute flex flex-col items-center" style={{ left: '85%', top: '40%', transform: 'translate(-50%, -50%)' }}>
            <div className="flex items-center gap-2 text-[#354363] font-inter text-[9px] lg:text-[11px] font-bold uppercase tracking-[0.15em] mb-2 whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.31" /><path d="M14 9.3V1.99" /><path d="M8.5 2h7" /><path d="M14 9.3a6.5 6.5 0 1 1-4 0" /><path d="M5.52 16h12.96" /></svg>
              <span>For Research Use Only</span>
            </div>
            {/* Dot */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#566c9c] border-[2px] border-white shadow-md relative z-10"></div>
          </div>

        </div>
      </div>

    </section>
  );
}
