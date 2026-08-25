'use client'

import React, { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Link as LinkIcon, Target, DollarSign, Settings, LogOut, ArrowLeft, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { signOut } from 'next-auth/react'

const NAV_ITEMS = [
  { key: 'overview', href: '/affiliates/dashboard', icon: LayoutDashboard },
  { key: 'links', href: '/affiliates/dashboard/links', icon: LinkIcon },
  { key: 'conversions', href: '/affiliates/dashboard/conversions', icon: Target },
  { key: 'payouts', href: '/affiliates/dashboard/payouts', icon: DollarSign },
  { key: 'settings', href: '/affiliates/dashboard/settings', icon: Settings },
]

export function AffiliateTopNav({ 
  userName = 'Partner', 
  tier = 'standard' 
}: { 
  userName?: string
  tier?: string
}) {
  const t = useTranslations('affiliate.sidebar')
  const pathname = usePathname() || ''
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const activeNavItems = NAV_ITEMS
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <div className="w-full bg-white/80 backdrop-blur-3xl border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        
        {/* Top Header Row (Logo, Profile, Tier) */}
        <div className="flex items-center justify-between h-20">
          
          <div className="flex items-center gap-2 sm:gap-6">
            {/* Mobile Back Button */}
            <Link href="/account" className="sm:hidden flex items-center justify-center p-1.5 -ml-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors shrink-0">
              <ArrowLeft size={18} />
            </Link>

            <Link href="/" className="shrink-0 flex items-center">
              <img src="/HelixBio Images/hb-logo.png" alt="HelixBio" className="h-9 sm:h-10 w-auto object-contain" />
            </Link>

            <div className="h-6 w-px bg-gray-200 hidden sm:block" />

            <Link href="/account" className="text-[10px] font-bold text-gray-400 hover:text-black items-center gap-1.5 uppercase tracking-widest transition-colors hidden sm:flex">
              <ArrowLeft size={12} />
              {t('backToAccount')}
            </Link>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex flex-col items-end">
              <h2 className="text-xs sm:text-sm font-bold text-black truncate max-w-[90px] sm:max-w-[150px] tracking-tight leading-none text-right">{userName}</h2>
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-0.5 sm:mt-1 capitalize text-right">{tier} {t('tierSuffix')}</span>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[#1e5661] to-[#2b646c] flex items-center justify-center text-white font-bold shadow-md shrink-0 text-xs sm:text-sm">
              {userInitial}
            </div>
          </div>
        </div>

        {/* Navigation Row */}
        <nav className="flex items-center justify-between sm:justify-start sm:gap-2 h-14 border-t border-gray-100/50 relative -mx-4 px-6 sm:px-0">
          {activeNavItems.map((item) => {
            const isActive = item.href === '/affiliates/dashboard' 
              ? pathname === '/affiliates/dashboard' 
              : pathname.startsWith(item.href)
              
            return (
              <Link 
                key={item.key} 
                href={item.href}
                className={`
                  relative px-2 sm:px-5 h-full flex flex-col justify-center items-center gap-1 text-[11px] font-bold uppercase tracking-widest transition-colors font-heading group shrink-0
                  ${isActive ? 'text-[#1e5661]' : 'text-gray-400 hover:text-black'}
                `}
              >
                <div className="flex items-center gap-2 relative">
                  <item.icon size={18} className={`transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'} sm:w-4 sm:h-4`} />
                  <span className={`hidden lg:block ${isActive ? '' : ''}`}>
                    {t(`nav.${item.key}`)}
                  </span>
                  
                  {/* Mobile Active Bubble */}
                  <AnimatePresence>
                    {isActive && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 z-50 lg:hidden pointer-events-none mb-2.5">
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 2, scale: 0.9 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          className="bg-black text-white px-3 py-1.5 rounded-lg text-[9px] font-bold tracking-widest shadow-xl whitespace-nowrap flex items-center justify-center relative uppercase"
                        >
                          {t(`nav.${item.key}`)}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45" />
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
                
                {isActive && (
                  <motion.div 
                    layoutId="affiliate-nav-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1e5661]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
          
          <div className="ml-auto shrink-0 flex items-center h-full">
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors font-heading px-2 sm:px-5 h-full"
            >
              <LogOut size={18} className="sm:w-4 sm:h-4" />
              <span className="hidden lg:block">{t('signOut')}</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  )
}
