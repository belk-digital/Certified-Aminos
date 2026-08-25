"use client";
import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const faqs = [
  {
    question: "What is the purity of your peptides?",
    answer: "Our research-grade peptides are guaranteed to be >99% pure. Every single batch undergoes rigorous third-party laboratory testing, and we provide Certificates of Analysis (COA) for complete transparency."
  },
  {
    question: "Are these products intended for human consumption?",
    answer: "No. All of our products are strictly for research and laboratory use only. They are not intended for human consumption, diagnostic, therapeutic, or any other medical use."
  },
  {
    question: "How should peptides be stored upon arrival?",
    answer: "Lyophilized (freeze-dried) peptides should be stored in a cool, dark place, ideally in a freezer at -20°C for long-term stability. Once reconstituted with bacteriostatic water, they must be refrigerated (2°C to 8°C) and typically used within a few weeks."
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes, we ship globally. However, it is the researcher's responsibility to understand and comply with their local laws and customs regulations regarding the importation of research chemicals."
  },
  {
    question: "How fast is your shipping?",
    answer: "All domestic orders are processed and shipped within 24 business hours. Depending on the shipping option selected at checkout, domestic delivery typically takes 2-5 business days."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sectionRef = useRef<HTMLElement>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    const ctx = gsap.context(() => {
      // Header text animation
      gsap.from(".faq-header-elem", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".faq-header",
          start: "top 80%",
        }
      });

      // FAQ items animation
      gsap.from(".faq-item", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".faq-container",
          start: "top 75%",
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Update max-height for accordion animation when state changes
  useEffect(() => {
    contentRefs.current.forEach((ref, index) => {
      if (ref) {
        if (openIndex === index) {
          ref.style.maxHeight = `${ref.scrollHeight}px`;
        } else {
          ref.style.maxHeight = '0px';
        }
      }
    });
  }, [openIndex]);

  return (
    <section ref={sectionRef} className="w-full bg-[#011638] font-inter relative overflow-hidden flex flex-col lg:flex-row">
      
      {/* Main Content Area */}
      <div className="w-full lg:flex-1 py-20 px-8 lg:px-12 flex flex-col justify-center">
        
        {/* Header Section */}
        <div className="faq-header flex flex-col items-start text-left mb-16">
          <span className="faq-header-elem text-[11px] text-gray-400 tracking-[0.2em] font-semibold uppercase mb-4">
            Knowledge Base
          </span>
          <h2 className="faq-header-elem font-syncopate text-white text-4xl md:text-5xl lg:text-[68px] font-medium leading-[1.1] tracking-wide mb-6 uppercase">
            Frequently<br /> Asked Questions
          </h2>
          <p className="faq-header-elem text-gray-400 text-[15px] max-w-2xl leading-relaxed mb-8">
            Find answers to common questions about our products, testing standards, and shipping policies.
          </p>
          <div className="faq-header-elem mt-2">
            <button className="px-10 py-5 bg-white text-[#011638] text-[11px] md:text-xs font-bold tracking-[0.2em] uppercase rounded hover:bg-gray-200 transition-all shadow-md flex items-center gap-2 group">
              View All FAQs
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        </div>

        {/* FAQ Container */}
        <div className="faq-container w-full flex flex-col">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className="faq-item border-b border-gray-700 py-6"
              >
                <button 
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between text-left group cursor-pointer"
                >
                  <h3 className={`text-[18px] md:text-[22px] lg:text-[26px] uppercase font-syncopate font-medium tracking-wide transition-colors duration-300 text-left leading-snug ${isOpen ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                    {faq.question}
                  </h3>
                  <div className={`ml-4 flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${isOpen ? 'border-[#1e3a8a] bg-[#1e3a8a] text-white' : 'border-gray-500 text-gray-400 group-hover:border-white group-hover:text-white'}`}>
                    <svg 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </button>
                <div 
                  ref={(el) => {
                    contentRefs.current[index] = el;
                  }}
                  className="overflow-hidden transition-all duration-500 ease-in-out"
                  style={{ maxHeight: '0px' }}
                >
                  <p className="pt-6 pb-2 text-gray-400 text-[14px] md:text-[16px] leading-relaxed pr-12">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Right Side Decorative Strip */}
      <div 
        className="hidden lg:block lg:w-[25%] xl:w-[35%] max-w-[500px] bg-contain bg-right bg-no-repeat opacity-90"
        style={{ backgroundImage: "url('/red-strip.png')" }}
      ></div>

    </section>
  );
}
