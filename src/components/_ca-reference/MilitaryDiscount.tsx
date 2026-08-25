import React from 'react';
import ShinyText from './ShinyText';

export default function MilitaryDiscount() {

  return (
    <section
      className="w-full relative py-16 md:py-24 px-8 flex justify-center items-center font-inter overflow-hidden"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: "url('/military-discount-banner.png')" }}
      ></div>
      {/* Dark overlay to ensure text readability against the complex background */}
      <div className="absolute inset-0 bg-[#060a12]/30 pointer-events-none"></div>

      {/* Content Container */}
      <div className="relative z-10 w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center text-white">
        {/* Left Column: Heading and CTA */}
        <div className="flex flex-col items-start text-left">
          {/* Top Badge & Text */}
          <div className="flex items-center gap-3 mb-4">
            <svg width="24" height="28" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white opacity-90">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polygon points="12 8 13.5 11 17 11 14 13 15 16.5 12 14.5 9 16.5 10 13 7 11 10.5 11" />
              <path d="M5 24l7 3 7-3" strokeWidth="1.5" />
              <path d="M7 26l5 2 5-2" strokeWidth="1.5" />
            </svg>
            <span className="text-[11px] md:text-xs text-blue-300 tracking-[0.25em] font-semibold uppercase mt-1">
              Honoring Your Service
            </span>
          </div>

          <h2 className="font-syncopate text-4xl md:text-5xl lg:text-[4rem] font-medium tracking-wide uppercase leading-tight mb-0">
            Exclusive
          </h2>

          <div className="font-vipnagorgialla font-semibold text-8xl md:text-9xl lg:text-[10rem] tracking-tight leading-none my-6 drop-shadow-2xl opacity-90">
            <ShinyText
              text="30%"
              color="#dc2626"
              shineColor="#ffffff"
              speed={3.5}
            />
          </div>

          <h2 className="font-syncopate text-4xl md:text-5xl lg:text-[4rem] font-medium tracking-wide uppercase leading-tight mt-0 mb-4">
            Military<br /> Discount
          </h2>

          {/* Divider */}
          <div className="flex items-center gap-4 w-full max-w-sm mb-4 opacity-70">
            <div className="h-px bg-gradient-to-r from-blue-400 to-transparent flex-1"></div>
          </div>

          {/* Description */}
          <p className="text-gray-200 text-sm md:text-base leading-relaxed max-w-lg mb-6 font-light">
            As a thank you for your service, we're proud to offer an exclusive 30% discount on your order.
          </p>

        </div>

        {/* Right Column: How to Avail panel */}
        <div className="relative bg-white/5 border border-white/10 rounded-[32px] p-8 lg:p-10 backdrop-blur-[24px] shadow-2xl flex flex-col h-fit overflow-hidden">

          {/* Decorative Barcode on Left Edge */}
          <div className="absolute left-6 top-16 bottom-16 w-4 flex flex-col gap-[3px] opacity-40">
            <div className="w-full h-[2px] bg-white"></div>
            <div className="w-full h-[1px] bg-white"></div>
            <div className="w-3/4 h-[2px] bg-white"></div>
            <div className="w-full h-[3px] bg-white"></div>
            <div className="w-1/2 h-[1px] bg-white"></div>
            <div className="w-full h-[2px] bg-white"></div>
            <div className="w-full h-[1px] bg-white"></div>
            <div className="w-3/4 h-[3px] bg-white"></div>
            <div className="w-full h-[1px] bg-white"></div>
            <div className="w-1/2 h-[2px] bg-white"></div>
            <div className="w-full h-[1px] bg-white"></div>
            <div className="w-3/4 h-[2px] bg-white"></div>
            <div className="w-full h-[1px] bg-white"></div>
          </div>

          <div className="pl-10 flex flex-col h-full">

            {/* Header Text */}
            <div className="mb-8">
              <div className="font-inter font-light text-2xl md:text-3xl tracking-widest uppercase flex items-start gap-2 leading-tight">
                <div>
                  HOW IT WORKS
                </div>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-80 mt-1"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </div>
            </div>

            {/* Description Paragraph */}
            <p className="text-[10px] md:text-[11px] font-light uppercase tracking-[0.15em] leading-[1.8] opacity-70 max-w-sm mb-12">
              Securely verify your military status to receive your exclusive discount code. Documents are heavily encrypted and proactively destroyed after review.
            </p>

            {/* Steps as Form-like Fields */}
            <div className="flex flex-col gap-6 w-full mt-auto">

              <div className="border-b border-white/30 pb-2">
                <p className="text-[9px] md:text-[10px] font-medium uppercase tracking-[0.2em] opacity-60 mb-1">01. INITIATE REQUEST</p>
              </div>

              <div className="border-b border-white/30 pb-2">
                <p className="text-[9px] md:text-[10px] font-medium uppercase tracking-[0.2em] opacity-60 mb-1">02. UPLOAD DOCUMENTS (ID / DD-214)</p>
              </div>

              <div className="border-b border-white/30 pb-2">
                <p className="text-[9px] md:text-[10px] font-medium uppercase tracking-[0.2em] opacity-60 mb-1">03. GUARANTEED PROTECTION</p>
              </div>
            </div>

            {/* Bottom CTA text */}
            <div className="mt-10 flex justify-center w-full">
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] opacity-90 cursor-pointer hover:opacity-100 transition-opacity">
                BEGIN VERIFICATION
              </span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
