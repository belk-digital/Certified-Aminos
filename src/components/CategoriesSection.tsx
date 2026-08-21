import React from 'react';

const categories = [
  {
    id: '01',
    title: 'METABOLIC RESEARCH',
    image: '/categories images/cat-1.png'
  },
  {
    id: '02',
    title: 'RECOVERY RESEARCH',
    image: '/categories images/cat-2.png'
  },
  {
    id: '03',
    title: 'CELLULAR RESEARCH',
    image: '/categories images/cat-3.png'
  },
  {
    id: '04',
    title: 'LONGEVITY RESEARCH',
    image: '/categories images/cat-4.png'
  },
  {
    id: '05',
    title: 'PEPTIDE BLENDS',
    image: '/categories images/cat-5.png'
  }
];

export default function CategoriesSection() {
  return (
    <section className="w-full flex flex-col md:flex-row min-h-[70vh] px-8 py-8 bg-[#f8f9fa] gap-4">
      {/* First Column - Explore Research */}
      <div className="w-full md:flex-1 bg-[#011638] flex flex-col justify-start p-8 md:p-10 relative cursor-pointer rounded-lg shadow-sm">
        <h2 className="text-white font-syncopate text-lg md:text-xl font-medium tracking-wide mb-6 uppercase">
          Explore<br />Research
        </h2>
        <div className="w-8 h-[2px] bg-[#8b3a3a]"></div>
        
        <div className="mt-auto flex items-center text-xs font-bold font-inter text-white uppercase tracking-widest mt-12">
          SHOP ALL<br />COLLECTIONS <span className="ml-2 font-normal text-lg">→</span>
        </div>
      </div>

      {/* Category Columns */}
      {categories.map((cat, index) => (
        <div key={cat.id} className="relative w-full md:flex-1 h-64 md:h-auto overflow-hidden group cursor-pointer rounded-lg shadow-sm transition-all duration-500 ease-out md:hover:flex-[1.5]">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
            style={{ backgroundImage: `url('${cat.image}')` }}
          ></div>
          
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/10 transition-colors duration-300 group-hover:bg-black/30"></div>

          {/* Content */}
          <div className="absolute inset-0 p-8 flex flex-col justify-between text-white">
            <span className="font-inter text-2xl font-light opacity-90">{cat.id}</span>
            
            <div>
              <h3 className="font-syncopate text-[0.8rem] md:text-[0.95rem] font-normal mb-4 leading-relaxed tracking-wider">
                {cat.title.split(' ')[0]}<br />{cat.title.split(' ')[1]}
              </h3>
              <div className="flex items-center text-[0.65rem] font-bold font-inter uppercase tracking-widest opacity-90 group-hover:opacity-100 transition-opacity">
                VIEW PRODUCTS <span className="ml-2 font-normal text-sm">→</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
