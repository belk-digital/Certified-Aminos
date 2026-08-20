import React from 'react';

const stats = [
  { value: '98%', label: 'RESEARCHER TRUST' },
  { value: '50K+', label: 'LOYAL CUSTOMERS' },
  { value: '12+', label: 'PEER-REVIEWED STUDIES' },
  { value: '+82%', label: 'COLLAGEN SYNTHESIS' },
];

export default function StatsSection() {
  return (
    <section className="w-full bg-[#152759] py-16 md:py-20 text-white font-inter relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
        <img src="/hero-waves.png" alt="" className="w-full h-full object-cover mix-blend-screen" />
      </div>
      
      <div className="max-w-[1200px] mx-auto px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-4 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center justify-center space-y-3">
              <div className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight">
                {stat.value}
              </div>
              <div className="text-[10px] md:text-xs font-medium tracking-[0.15em] uppercase text-blue-100/90">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
