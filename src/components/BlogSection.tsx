"use client";
import React, { useRef } from 'react';

export default function BlogSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -350, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 350, behavior: 'smooth' });
    }
  };

  const blogPosts = [
    {
      id: 1,
      image: "/blog-1.jpg",
      category: "Clinical Research",
      title: "Understanding Peptide Purity: Why >99% Matters",
    },
    {
      id: 2,
      image: "/blog-2.jpg",
      category: "Metabolic Studies",
      title: "The Future of GLP-1 Analogues in Lab Environments",
    },
    {
      id: 3,
      image: "/blog-1.jpg", 
      category: "Laboratory Protocols",
      title: "Best Practices for Reconstituting Lyophilized Peptides",
    },
    {
      id: 4,
      image: "/blog-2.jpg",
      category: "Storage Guidelines",
      title: "How Temperature Fluctuations Affect Peptide Stability",
    },
    {
      id: 5,
      image: "/blog-1.jpg",
      category: "Safety Standards",
      title: "Navigating Third-Party Testing and COA Verification",
    },
    {
      id: 6,
      image: "/blog-2.jpg",
      category: "Industry News",
      title: "New Advancements in Peptide Synthesis Technology",
    }
  ];

  return (
    <section className="w-full py-24 px-8 flex justify-center items-center font-inter bg-white">
      <div className="w-full flex flex-col min-w-0">
        
        {/* Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8 md:gap-4">
          
          {/* Left Text Block */}
          <div className="flex flex-col items-start text-left max-w-2xl">
            <span className="text-[11px] text-gray-400 tracking-[0.2em] font-bold uppercase mb-4">
              Journal
            </span>
            <h2 className="font-syncopate text-[#1e3a8a] text-4xl md:text-5xl lg:text-[4rem] font-medium tracking-tight leading-[1.1] uppercase mb-4">
              Our Latest<br />Blogs
            </h2>
            <p className="text-gray-500 text-sm md:text-[15px] leading-relaxed mb-8">
              Explore our latest articles, clinical updates, and laboratory best practices carefully curated by our expert research team.
            </p>
            <button className="px-8 py-3 bg-[#011638] text-white border border-[#011638] text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm hover:bg-[#0a234f] transition-all shadow-sm">
              View All Blogs
            </button>
          </div>
          
          {/* Controls & Button */}
          <div className="flex flex-col items-start md:items-end gap-6">
            <div className="flex items-center gap-2 hidden sm:flex pb-2">
              <button 
                onClick={scrollLeft}
                className="w-12 h-12 flex justify-center items-center border border-gray-300 bg-white hover:bg-gray-100 transition-colors text-gray-700"
                aria-label="Previous posts"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button 
                onClick={scrollRight}
                className="w-12 h-12 flex justify-center items-center border border-gray-800 bg-gray-800 hover:bg-black transition-colors text-white"
                aria-label="Next posts"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {blogPosts.map((post) => (
            <article 
              key={post.id} 
              className="min-w-[280px] md:min-w-[340px] max-w-[340px] h-[480px] flex-shrink-0 snap-start flex flex-col bg-white border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all duration-300 rounded-2xl overflow-hidden"
            >
              <div className="w-full h-1/2 bg-gray-100">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex flex-col p-6 h-1/2">
                <span className="text-[11px] font-medium text-gray-500 mb-3 tracking-wide">
                  {post.category}
                </span>
                
                <h3 className="font-semibold text-gray-900 text-[1.1rem] leading-snug mb-6 line-clamp-3 pr-4">
                  {post.title}
                </h3>
                
                <div className="mt-auto flex items-center text-xs font-medium text-gray-500 hover:text-black cursor-pointer transition-colors group">
                  Read Blog 
                  <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination Dots (Mobile/Tablet) */}
        <div className="flex justify-center items-center gap-2 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i} 
              className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-gray-800' : 'bg-gray-300'}`}
            ></div>
          ))}
        </div>

        {/* Mobile controls (visible only on small screens) */}
        <div className="flex justify-center gap-4 mt-8 sm:hidden">
          <button onClick={scrollLeft} className="p-3 border border-gray-300 rounded-full active:bg-gray-100">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button onClick={scrollRight} className="p-3 bg-gray-800 text-white rounded-full active:bg-black">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

      </div>
      
      {/* Utility style to ensure scrollbars remain hidden on Webkit */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}} />
    </section>
  );
}
