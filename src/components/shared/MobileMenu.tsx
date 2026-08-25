import React, { useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import {
  X, Search, Heart, User, LogIn,
  Activity, Dna, Brain, ShieldPlus, Sparkles, Zap, Network, BatteryCharging,
  BookOpen, Microscope, Calculator, HelpCircle, Mail, Users, ArrowRight
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

import { getCategoryDisplayName } from '@/lib/categoryDisplay'

export interface MenuCategory {
  id: string | number
  name: string
  slug?: string
}

export interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  isLoggedIn?: boolean
  onSearchClick?: () => void
  categories?: MenuCategory[]
}

// Payload has no per-category icon field, so icons are assigned by position.
const CATEGORY_ICONS = [Activity, Dna, Brain, ShieldPlus, Sparkles, Zap, Network, BatteryCharging]

const MAIN_LINKS = [
  { key: 'shopFormulations', href: '/shop' },
  { key: 'peptideCalculator', href: '/peptide-calculator' },
  { key: 'blog', href: '/blog' },
  { key: 'ourLaboratory', href: '/about-us' },
]

const SUPPORT_LINKS = [
  { key: 'faq', href: '/faq', icon: HelpCircle },
  { key: 'contactSupport', href: '/contact-us', icon: Mail },
  { key: 'affiliateProgram', href: '/affiliates', icon: Users },
]

export function MobileMenu({ isOpen, onClose, isLoggedIn = false, onSearchClick, categories = [] }: MobileMenuProps) {
  const t = useTranslations('mobileMenu')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.classList.add('mobile-menu-open')
      
      // Hide Tidio when menu opens
      if (typeof window !== 'undefined' && (window as any).tidioChatApi) {
        (window as any).tidioChatApi.hide()
      }

      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      window.addEventListener('keydown', handleEsc)
      return () => {
        document.body.style.overflow = ''
        document.body.classList.remove('mobile-menu-open')
        
        // Show Tidio when menu closes
        if (typeof window !== 'undefined' && (window as any).tidioChatApi) {
          (window as any).tidioChatApi.show()
        }
        
        window.removeEventListener('keydown', handleEsc)
      }
    }
  }, [isOpen, onClose])

  const menuVariants: Variants = {
    closed: { opacity: 0, scale: 0.98, y: 20 },
    open: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.05,
        delayChildren: 0.1
      } 
    },
    exit: { opacity: 0, scale: 0.98, y: 20, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
  }

  const itemVariants: Variants = {
    closed: { y: 20, opacity: 0, scale: 0.95 },
    open: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="closed"
          animate="open"
          exit="exit"
          variants={menuVariants}
          className="fixed inset-0 z-[100] bg-[#F2F2F7] flex flex-col pointer-events-auto transform-gpu will-change-transform"
        >
          {/* Performant static noise texture (0 GPU overhead) */}
          <div className="absolute inset-0 opacity-10 pointer-events-none z-0 bg-noise" />

          {/* Header Block */}
          <motion.div variants={itemVariants} className="h-[72px] flex items-center justify-between px-6 shrink-0 relative z-10 border-b border-black/5">
            <div className="flex-1 flex justify-start">

            </div>
            
            <span className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-ink/50 flex-1 text-center">
              {t('menu')}
            </span>
            
            <div className="flex flex-1 justify-end">
              <button onClick={onClose} className="p-2 -mr-2 text-ink hover:text-primary hover:bg-black/5 transition-colors rounded-full" aria-label={t('closeMenu')}>
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>

          {/* Scrollable Main Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 pb-40">
            
            <div className="py-6 flex flex-col gap-8">
              
              {/* Massive Main Links - iOS Native Block Style */}
              <motion.div variants={itemVariants} className="px-4 sm:px-6">
                <div className="bg-white rounded-[24px] overflow-hidden flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  {MAIN_LINKS.map((link, index) => (
                    <Link
                      key={link.key}
                      href={link.href}
                      onClick={onClose}
                      className={`group flex items-center justify-between p-5 px-6 active:bg-black/5 transition-colors ${index !== MAIN_LINKS.length - 1 ? 'border-b border-black/5' : ''}`}
                    >
                      <h2 className="text-[19px] font-semibold text-black tracking-tight group-hover:text-primary transition-colors">
                        {t(`links.${link.key}`)}
                      </h2>
                      <ArrowRight size={20} className="text-black/20 group-hover:text-primary transition-all" strokeWidth={2} />
                    </Link>
                  ))}
                </div>
              </motion.div>

              {/* Categories Horizontal Carousel */}
              <motion.div variants={itemVariants} className="flex flex-col">
                <h3 className="px-6 sm:px-8 text-[11px] font-bold uppercase tracking-[0.2em] text-black/40 mb-4">{t('exploreCategories')}</h3>
                <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 px-4 sm:px-6 no-scrollbar snap-x snap-mandatory">
                  {categories.map((cat, index) => (
                    <Link
                      key={cat.id}
                      href={`/shop?category=${encodeURIComponent(cat.name)}`}
                      onClick={onClose}
                      className="snap-center shrink-0 w-[240px] sm:w-[280px] aspect-[4/3] sm:aspect-video rounded-[20px] overflow-hidden relative group shadow-[0_4px_12px_rgba(0,0,0,0.05)] active:scale-95 transition-transform"
                    >
                      <Image 
                        src={`/HelixBio Images/category-${(index % 8) + 1}.webp`} 
                        alt={cat.name} 
                        fill 
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/5" />
                      <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end">
                        <h4 className="text-white font-medium text-lg sm:text-xl tracking-tight leading-tight drop-shadow-md">{getCategoryDisplayName(cat.name)}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>

              {/* Support Links - iOS Native Block Style */}
              <motion.div variants={itemVariants} className="px-4 sm:px-6">
                <h3 className="px-2 text-[11px] font-bold uppercase tracking-[0.2em] text-black/40 mb-3">{t('support')}</h3>
                <div className="bg-white rounded-[24px] overflow-hidden flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  {SUPPORT_LINKS.map((link, index) => (
                    <Link
                      key={link.key}
                      href={link.href}
                      onClick={onClose}
                      className={`group flex items-center gap-4 p-4 px-6 active:bg-black/5 transition-colors ${index !== SUPPORT_LINKS.length - 1 ? 'border-b border-black/5' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                        <link.icon size={16} strokeWidth={2} className="text-black/60 group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-[17px] font-medium text-black/80 group-hover:text-black transition-colors">{t(`links.${link.key}`)}</span>
                    </Link>
                  ))}
                </div>
              </motion.div>

            </div>

          </div>

          {/* Floating Glass Pill Utility Dock */}
          <motion.div 
            variants={itemVariants} 
            className="absolute bottom-6 left-0 right-0 px-4 sm:px-6 z-20 pb-safe"
          >
            <div className="bg-white/95 border border-black/10 p-2 rounded-[2rem] flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.08)] max-w-sm mx-auto w-full">
              <button 
                onClick={() => {
                  onClose();
                  onSearchClick?.();
                }}
                className="flex flex-col items-center justify-center gap-1.5 flex-1 py-2 text-ink/60 hover:text-primary hover:bg-black/5 rounded-2xl transition-all"
                title={t('dock.search')}
              >
                <Search size={20} strokeWidth={1.5} />
                <span className="text-[9px] font-bold uppercase tracking-widest">{t('dock.search')}</span>
              </button>

              <div className="w-px h-8 bg-black/10 shrink-0" />

              <Link
                href="/account/wishlist"
                onClick={onClose}
                className="flex flex-col items-center justify-center gap-1.5 flex-1 py-2 text-ink/60 hover:text-primary hover:bg-black/5 rounded-2xl transition-all"
                title={t('dock.wishlist')}
              >
                <Heart size={20} strokeWidth={1.5} />
                <span className="text-[9px] font-bold uppercase tracking-widest">{t('dock.wishlist')}</span>
              </Link>

              <div className="w-px h-8 bg-black/10 shrink-0" />

              {isLoggedIn ? (
                <Link
                  href="/account"
                  onClick={onClose}
                  className="flex flex-col items-center justify-center gap-1.5 flex-1 py-2 text-ink/60 hover:text-primary hover:bg-black/5 rounded-2xl transition-all"
                  title={t('dock.account')}
                >
                  <User size={20} strokeWidth={1.5} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">{t('dock.account')}</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={onClose}
                  className="flex flex-col items-center justify-center gap-1.5 flex-1 py-2 text-ink/60 hover:text-primary hover:bg-black/5 rounded-2xl transition-all"
                  title={t('dock.login')}
                >
                  <LogIn size={20} strokeWidth={1.5} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">{t('dock.login')}</span>
                </Link>
              )}
            </div>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  )
}
