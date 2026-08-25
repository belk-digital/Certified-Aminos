'use client'

import React, { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, MapPin, Heart, Settings, LogOut, ArrowLeft, BarChart, Hexagon, Star, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { signOut } from 'next-auth/react'

const NAV_ITEMS = [
  { key: 'overview', href: '/account', icon: LayoutDashboard },
  { key: 'orders', href: '/account/orders', icon: Package },
  { key: 'addresses', href: '/account/addresses', icon: MapPin },
  { key: 'wishlist', href: '/account/wishlist', icon: Heart },
  { key: 'settings', href: '/account/settings', icon: Settings },
]

export function AccountTopNav({ 
  userName = 'User', 
  hbPoints = 0,
  affiliateStatus = 'none' 
}: { 
  userName?: string
  hbPoints?: number
  affiliateStatus?: 'none' | 'pending' | 'approved' | 'rejected' | 'suspended'
}) {
  const t = useTranslations('account.sidebar')
  const pathname = usePathname() || ''
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const activeNavItems = [
    ...NAV_ITEMS,
    ...(affiliateStatus === 'approved' ? [{ key: 'affiliateDashboard', href: '/affiliates/dashboard', icon: BarChart }] : [])
  ]

  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <div className="w-full bg-white/80 backdrop-blur-3xl border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        
        {/* Top Header Row (Logo, Profile, Points) */}
        <div className="flex items-center justify-between h-20 relative">
          
          <div className="flex items-center gap-3 sm:gap-6 flex-1">
            <Link href="/" className="shrink-0 flex items-center -ml-1 sm:ml-0">
              <img src="/HelixBio Images/hb-logo.png" alt="HelixBio" className="h-9 sm:h-10 w-auto object-contain" />
            </Link>

            <div className="h-6 w-px bg-gray-200 hidden sm:block" />

            <Link href="/shop" className="text-[10px] font-bold text-gray-400 hover:text-black items-center gap-1.5 uppercase tracking-widest transition-colors font-heading hidden sm:flex">
              <ArrowLeft size={12} />
              Back to Store
            </Link>
          </div>

          {/* Center: HB Points */}
          <div className="hidden md:flex flex-col items-center justify-center -mt-1 group cursor-default">
            <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-heading">HB Points:</span>
              <span className="text-sm font-bold text-black font-heading">{Number(hbPoints).toFixed(2)}</span>
            </div>
          </div>

          {/* Right: Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-1 justify-end">
            <div className="flex flex-col items-end">
              <h2 className="text-xs sm:text-sm font-bold text-black font-heading truncate max-w-[100px] sm:max-w-[150px] tracking-tight leading-none text-right">{userName}</h2>
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-gray-400 font-heading mt-0.5 sm:mt-1 text-right">Member</span>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[#1e5661] to-[#2b646c] flex items-center justify-center text-white font-bold font-heading shadow-md shrink-0 text-xs sm:text-sm">
              {userInitial}
            </div>
          </div>
        </div>

        {/* Navigation Row */}
        <nav className="flex items-center justify-between sm:justify-start sm:gap-2 h-14 border-t border-gray-100/50 relative -mx-4 px-4 sm:px-0">
          {activeNavItems.map((item) => {
            const isActive = item.href === '/account' 
              ? pathname === '/account' 
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
                    layoutId="top-nav-indicator"
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
