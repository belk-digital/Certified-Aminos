"use client";
import React, { useEffect, useRef } from 'react';
import { ArrowRight, ShoppingCart, Heart } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const products = [
  {
    id: 1,
    category: 'WEIGHT RESEARCH',
    name: 'Retatrutide',
    description: 'Triple hormone receptor agonist designed for advanced metabolic research.',
    doses: ['5MG', '10MG', '15MG'],
    price: '$199',
    badge: 'NEW',
    image: '/finalized product images/certified-aminos-retatrutide-10mg.png'
  },
  {
    id: 2,
    category: 'RECOVERY RESEARCH',
    name: 'BPC-157',
    description: 'Gastric juice peptide known for accelerated tissue repair and healing.',
    doses: ['5MG', '10MG'],
    price: '$149',
    badge: 'SALE',
    image: '/finalized product images/certified-aminos-MT-1-10mg.png'
  },
  {
    id: 3,
    category: 'PERFORMANCE RESEARCH',
    name: 'MT-1',
    description: 'Synthetic analog of alpha-MSH used for melanogenesis studies.',
    doses: ['10MG'],
    price: '$179',
    badge: 'POPULAR',
    image: '/finalized product images/certified-aminos-MT-1-10mg.png'
  },
  {
    id: 4,
    category: 'WEIGHT RESEARCH',
    name: 'Semaglutide',
    description: 'GLP-1 receptor agonist widely studied for glycemic regulation.',
    doses: ['5MG', '10MG'],
    price: '$149',
    badge: 'POPULAR',
    image: '/finalized product images/certified-aminos-retatrutide-10mg.png'
  }
];

export default function ResearchCompounds() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Header animation
      gsap.from(".rc-header > *", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        }
      });

      // Cards stagger animation
      gsap.from(".rc-card", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".rc-cards-grid",
          start: "top 85%",
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full bg-white min-h-screen py-16 px-8 flex flex-col justify-center font-inter overflow-hidden">
      <div className="w-full">
        {/* Header Section */}
        <div className="flex justify-between items-end mb-12 rc-header">
          <div>
            <span className="text-[10px] text-gray-500 tracking-[0.2em] font-bold uppercase block mb-3">
              THE COLLECTION
            </span>
            <h2 className="text-[#1e3a8a] text-3xl md:text-5xl font-medium tracking-tight leading-tight">
              Formulated Obsessively<br />Dosed Precisely.
            </h2>
          </div>
          
          <button className="flex items-center gap-3 bg-[#0f172a] hover:bg-[#1e293b] text-white pl-5 pr-2 py-2 rounded-full transition-colors font-medium text-xs tracking-wider mb-2 shadow-md">
            VIEW ALL
            <div className="bg-[#2563eb] rounded-full p-1.5 flex items-center justify-center">
              <ArrowRight size={14} className="text-white" />
            </div>
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 rc-cards-grid mt-4">
          {products.map((product) => (
            <div key={product.id} className="rc-card flex flex-col group cursor-pointer h-full bg-[#f0f4fa] rounded-xl md:rounded-2xl border border-[#1e3a8a]/10 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative">
              
              {/* Badges & Wishlist Overlay */}
              <div className="absolute top-3 left-0 w-full px-3 flex justify-between items-start z-10 pointer-events-none">
                {/* Status Badge */}
                <div className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  product.badge === 'NEW' 
                    ? 'bg-[#1e3a8a] text-white' 
                    : product.badge === 'SALE'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'bg-white text-[#1e3a8a] border border-[#1e3a8a]/10 shadow-sm'
                }`}>
                  {product.badge}
                </div>
                
                {/* Wishlist Heart */}
                <button className="pointer-events-auto h-7 w-7 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white shadow-sm border border-white/40 transition-colors ml-auto">
                  <Heart size={14} strokeWidth={2} />
                </button>
              </div>

              {/* Image Container */}
              <div className="h-48 md:h-64 w-full relative flex items-center justify-center pt-8 pb-2">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="max-h-[90%] object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
              
              {/* Product Info */}
              <div className="flex flex-col px-4 md:px-5 pb-4 md:pb-5 mt-auto">
                {/* Category */}
                <span className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                  {product.category}
                </span>
                
                {/* Title, Badge, Description */}
                <div className="flex flex-col items-start gap-1 mb-3 md:mb-4">
                  <h3 className="text-[#141e3a] font-bold text-[15px] md:text-lg tracking-tight">
                    {product.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {product.doses.map((dose, idx) => (
                      <div key={idx} className="bg-[#e8f4ca] text-[#557e2a] text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded flex items-center justify-center tracking-wide">
                        {dose}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {product.description}
                  </p>
                </div>
                
                {/* Price and Cart */}
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-[#141e3a] font-bold text-lg md:text-xl">
                    {product.price}
                  </span>
                  <button className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-[#1e3a8a] flex items-center justify-center text-white hover:bg-[#0f172a] shadow-md transition-colors flex-shrink-0">
                    <ShoppingCart size={15} strokeWidth={2} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
