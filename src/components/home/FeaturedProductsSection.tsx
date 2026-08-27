'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

export function FeaturedProductsSection({ products = [] }: { products?: any[] }) {
  const t = useTranslations('home.featuredProducts')
  if (!products || products.length === 0) return null;

  const featuredProduct = products[0];
  const listProducts = products.slice(1, 4);

  const getImageUrl = (prod: any) => {
    return prod.images?.[0]?.image?.url || '/temp-homepage/hero-1.webp';
  }

  return (
    <section className="bg-cream w-full py-24 px-4 md:px-10 relative z-30 font-sans border-t border-ink/5">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-50px" }}
          className="flex flex-col md:flex-row justify-between items-end mb-16"
        >
          <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl font-black text-ink leading-[0.9] tracking-tighter uppercase w-full md:w-1/2">
            {t('titleLine1')}<br />{t('titleLine2')}<span className="text-primary">.</span>
          </h2>
          <p className="text-ink text-base md:text-[20px] max-w-md text-left md:text-right mt-6 md:mt-0 leading-relaxed font-medium">
            {t('description')}
          </p>
        </motion.div>

        {/* Grid */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Featured Card (Left) */}
          <Link href={`/product/${featuredProduct.slug}`} className="bg-ink/[0.03] backdrop-blur-md border border-ink/5 rounded-2xl p-8 w-full lg:w-1/2 flex flex-col justify-between relative overflow-hidden shadow-2xl group hover:bg-ink/[0.05] transition-colors">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 tracking-widest uppercase z-10">
              <span>{featuredProduct.sku || 'NXP-FEATURED'}</span>
              <span className="flex items-center text-ink"><span className="w-1.5 h-1.5 rounded-full bg-primary mr-2 animate-pulse"></span> {t('inStock')}</span>
            </div>
            
            {/* Giant Background Certified Aminos Helmet Icon */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
              <svg 
                viewBox="0 0 200 300" 
                className="h-[450px] w-auto opacity-10 fill-primary -mt-20 group-hover:scale-105 transition-transform duration-700"
              >
                <path d="M94.02,228.41c-5.98-3.52-19.52-15.64-19.13-22.16l3.19-52.86-55.56-24.18c-.45,9.37,1.22,17.33,2.88,25.78,2.03,13.88,15.02,16.75,26.2,22.56,3.74,2.15,9.43,5.67,9.43,11.05v94.56S2.59,206.44,2.59,206.44c-2.8-3.68-2.25-8.49-2.59-12.84l.17-90.97c.02-10.06,3.04-19.08,8.62-27.26,17.61-25.3,57.52-45.01,84.79-58.71,28.42,14.43,62.61,31.25,82.58,55.75,5.71,7.74,10.53,15.88,10.55,26.07l.26,101.36c-1.24,3.84-2.61,6.9-5,10.05l-55.98,73.44-.54-89.59c-.04-5.96.76-11.19,6.44-14.24l17.88-9.14c6.75-3.45,11.37-9.02,11.89-16.81,1.64-8.05,3.33-15.91,2.67-24.57l-55.92,24.83,3.16,54.98c-2.32,8.15-11.11,13.39-17.57,19.62Z"/>
              </svg>
            </div>

            <div className="flex-1 flex items-center justify-center py-8 z-10 relative h-96">
              <Image 
                src={getImageUrl(featuredProduct)} 
                alt={featuredProduct.name} 
                fill 
                className="object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-700" 
              />
            </div>

            <div className="flex justify-between items-end z-10 relative">
              <div>
                <p className="text-primary text-[10px] tracking-widest uppercase mb-1 font-bold">{t('featuredLabel')}</p>
                <h3 className="font-heading text-3xl font-bold text-ink uppercase mb-1 tracking-tight">{featuredProduct.name}</h3>
                <p className="text-slate-500 text-[10px] tracking-widest uppercase font-semibold">{featuredProduct.descriptor || t('researchUseOnly')}</p>
              </div>
              <div className="text-2xl font-bold text-ink font-heading tracking-tight">
                ${featuredProduct.price}
              </div>
            </div>
          </Link>

          {/* List (Right) */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            {listProducts.map((product, idx) => (
              <Link href={`/product/${product.slug}`} key={idx} className="bg-ink/[0.03] backdrop-blur-md border border-ink/5 rounded-2xl p-6 flex items-center shadow-2xl relative overflow-hidden group hover:bg-ink/[0.05] transition-colors">
                <div className="w-32 h-32 bg-ink/5 border border-ink/5 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative">
                  <Image src={getImageUrl(product)} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="ml-6 flex-1">
                  <p className="text-slate-500 text-[10px] tracking-widest uppercase mb-1 font-semibold">{product.sku || `NXP-0${idx + 1}`}</p>
                  <h3 className="font-heading text-xl font-bold text-ink uppercase mb-1 tracking-tight">{product.name}</h3>
                  <p className="text-slate-500 text-[10px] tracking-widest uppercase font-semibold">{product.descriptor || t('researchUseOnly')}</p>
                </div>
                <div className="flex flex-col items-end justify-between h-24">
                  <div className="text-lg font-bold text-ink font-heading tracking-tight">${product.price}</div>
                  <button className="bg-ink hover:bg-slate-700 text-cream text-[10px] font-bold px-8 py-3 rounded-[10px] uppercase tracking-widest transition-all shadow-md mt-auto">
                    {t('viewButton')}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer Button */}
        <div className="flex justify-center mt-12">
          <Link href="/shop" className="bg-ink hover:bg-slate-700 text-cream text-[11px] font-bold px-12 py-5 rounded-[10px] uppercase tracking-widest transition-colors shadow-lg backdrop-blur-md">
            {t('viewFullCatalogue')}
          </Link>
        </div>
      </div>
    </section>
  )
}

