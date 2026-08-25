'use client'

import React, { useState } from 'react'
import { motion, Variants } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

interface Post {
  slug: string
  title: string
  category: string
  imageSrc: string
}

export function BlogBentoGrid({ posts }: { posts: Post[] }) {
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [hoveredCol2, setHoveredCol2] = useState<number | null>(null);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const scatterData = [
    { x: -200, y: -150, rotate: -10 },
    { x: 150, y: -250, rotate: 15 },
    { x: 250, y: 150, rotate: -5 },
    { x: -150, y: 200, rotate: 12 },
    { x: -300, y: 50, rotate: -8 },
    { x: 200, y: -100, rotate: 5 },
    { x: 100, y: 250, rotate: -15 },
    { x: -250, y: -200, rotate: 10 }
  ]

  const itemVariants: Variants = {
    hidden: (i: number) => ({ 
      opacity: 0, 
      x: scatterData[i % scatterData.length]?.x || 0,
      y: scatterData[i % scatterData.length]?.y || 60,
      rotate: scatterData[i % scatterData.length]?.rotate || 0,
      scale: 0.85, 
      filter: 'blur(15px)' 
    }),
    visible: { 
      opacity: 1, 
      x: 0,
      y: 0, 
      rotate: 0,
      scale: 1, 
      filter: 'blur(0px)',
      transition: { 
        type: 'spring',
        damping: 25,
        stiffness: 100,
        mass: 1.5,
        duration: 1.2,
      } 
    }
  }

  const renderPost = (post: Post, customIndex: number) => {
    if (!post) return null;
    return (
      <motion.div layout custom={customIndex} variants={itemVariants} className="group cursor-pointer relative rounded-[32px] overflow-hidden flex-1 bg-white border border-ink/5 w-full shadow-md hover:shadow-xl transition-shadow duration-500 h-full">
        <Link href={`/${post.slug}`} className="block w-full h-full relative">
          <Image
            src={post.imageSrc}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-4 left-4">
             <span className="font-mono px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">{post.category}</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end">
            <h3 className="text-white text-lg md:text-xl font-bold font-heading leading-snug group-hover:text-primary transition-colors">
              {post.title}
            </h3>
          </div>
        </Link>
      </motion.div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-4 md:gap-6">
      {/* First Row of Posts */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="flex flex-col md:flex-row gap-4 md:gap-6 w-full md:h-[600px]"
      >
        {/* Left Column */}
        <motion.div 
          layout
          onMouseEnter={() => setHoveredCol(0)}
          onMouseLeave={() => setHoveredCol(null)}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
          className={`w-full flex flex-col gap-4 md:gap-6 h-[400px] md:h-full overflow-hidden ${
            hoveredCol === 0 ? 'md:w-1/2' : (hoveredCol === null ? 'md:w-1/4' : 'md:w-1/4')
          }`}
        >
          {renderPost(posts[0], 0)}
          <motion.div layout custom={1} variants={itemVariants} className="w-[80%] aspect-square md:aspect-auto md:flex-1 max-h-[30%] self-end rounded-[32px] bg-white border border-ink/5 hidden md:block" />
        </motion.div>

        {/* Middle Column */}
        <motion.div 
          layout
          onMouseEnter={() => setHoveredCol(1)}
          onMouseLeave={() => setHoveredCol(null)}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
          className={`w-full flex flex-col gap-4 md:gap-6 h-[400px] md:h-full overflow-hidden ${
            hoveredCol === 1 ? 'md:w-1/2' : (hoveredCol === null ? 'md:w-1/2' : 'md:w-1/4')
          }`}
        >
          {renderPost(posts[1], 2)}
        </motion.div>

        {/* Right Column */}
        <motion.div 
          layout
          onMouseEnter={() => setHoveredCol(2)}
          onMouseLeave={() => setHoveredCol(null)}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
          className={`w-full flex flex-col gap-4 md:gap-6 h-[400px] md:h-full overflow-hidden ${
            hoveredCol === 2 ? 'md:w-1/2' : (hoveredCol === null ? 'md:w-1/4' : 'md:w-1/4')
          }`}
        >
          <motion.div layout custom={3} variants={itemVariants} className="w-[80%] aspect-square md:aspect-auto md:flex-1 max-h-[30%] self-start rounded-[32px] bg-white border border-ink/5 hidden md:block" />
          {renderPost(posts[2], 4)}
        </motion.div>
      </motion.div>

      {/* Second Row of Posts (Alternating Layout) */}
      {posts.length > 3 && (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="flex flex-col md:flex-row gap-4 md:gap-6 w-full md:h-[600px] mt-4 md:mt-6"
      >
        {/* Left Column (Alternated: Spacer first) */}
        <motion.div 
          layout
          onMouseEnter={() => setHoveredCol2(0)}
          onMouseLeave={() => setHoveredCol2(null)}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
          className={`w-full flex flex-col gap-4 md:gap-6 h-[400px] md:h-full overflow-hidden ${
            hoveredCol2 === 0 ? 'md:w-1/2' : (hoveredCol2 === null ? 'md:w-1/4' : 'md:w-1/4')
          }`}
        >
          <motion.div layout custom={5} variants={itemVariants} className="w-[80%] aspect-square md:aspect-auto md:flex-1 max-h-[30%] self-start rounded-[32px] bg-white border border-ink/5 hidden md:block" />
          {renderPost(posts[3], 6)}
        </motion.div>

        {/* Middle Column */}
        <motion.div 
          layout
          onMouseEnter={() => setHoveredCol2(1)}
          onMouseLeave={() => setHoveredCol2(null)}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
          className={`w-full flex flex-col gap-4 md:gap-6 h-[400px] md:h-full overflow-hidden ${
            hoveredCol2 === 1 ? 'md:w-1/2' : (hoveredCol2 === null ? 'md:w-1/2' : 'md:w-1/4')
          }`}
        >
          {renderPost(posts[4], 7)}
        </motion.div>

        {/* Right Column (Alternated: Post first) */}
        <motion.div 
          layout
          onMouseEnter={() => setHoveredCol2(2)}
          onMouseLeave={() => setHoveredCol2(null)}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
          className={`w-full flex flex-col gap-4 md:gap-6 h-[400px] md:h-full overflow-hidden ${
            hoveredCol2 === 2 ? 'md:w-1/2' : (hoveredCol2 === null ? 'md:w-1/4' : 'md:w-1/4')
          }`}
        >
          {renderPost(posts[5], 0)}
          <motion.div layout custom={1} variants={itemVariants} className="w-[80%] aspect-square md:aspect-auto md:flex-1 max-h-[30%] self-end rounded-[32px] bg-white border border-ink/5 hidden md:block" />
        </motion.div>
      </motion.div>
      )}
    </div>
  )
}
