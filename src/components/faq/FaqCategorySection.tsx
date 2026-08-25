'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { FaqCategoryType, FaqItemType } from '@/data/faqs'

const FaqItem = ({ 
  faq, 
  index,
}: { 
  faq: FaqItemType; 
  index: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/10 bg-transparent rounded-xl overflow-hidden transition-colors duration-300 hover:border-white/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group cursor-pointer focus:outline-none py-5 px-5 md:px-6"
      >
        <h3
          className={`font-sans text-[15px] md:text-[16px] font-medium transition-colors duration-300 text-left leading-snug pr-4 ${isOpen ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}
        >
          {faq.question}
        </h3>
        
        <div className="flex-shrink-0 text-gray-400 group-hover:text-white transition-colors duration-300">
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Plus className="w-5 h-5" />
          </motion.div>
        </div>
      </button>

      {/* Answer Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div 
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: 'auto', opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             transition={{ duration: 0.3, ease: 'easeInOut' }}
             className="overflow-hidden w-full"
          >
            <div 
              className="pb-5 px-5 md:px-6 text-gray-400 text-[14px] leading-relaxed prose prose-sm max-w-none prose-a:text-blue-400 hover:prose-a:text-blue-300"
              dangerouslySetInnerHTML={{ __html: faq.answer }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function FaqCategorySection({
  category,
}: {
  category: FaqCategoryType;
}) {
  return (
    <div className="mb-12">
      <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 font-medium text-[13px] tracking-wide mb-6">
        {category.category}
      </div>
      <div className="w-full flex flex-col gap-3">
        {category.items.map((faq, index) => (
          <FaqItem 
            key={index} 
            faq={faq} 
            index={index} 
          />
        ))}
      </div>
    </div>
  );
}
