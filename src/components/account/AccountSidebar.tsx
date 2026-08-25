'use client'

import React, { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, MapPin, Heart, Settings, LogOut, ArrowLeft, Bot, Send, BarChart, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { signOut } from 'next-auth/react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'

const NAV_ITEMS = [
  { key: 'overview', href: '/account', icon: LayoutDashboard },
  { key: 'orders', href: '/account/orders', icon: Package },
  { key: 'addresses', href: '/account/addresses', icon: MapPin },
  { key: 'wishlist', href: '/account/wishlist', icon: Heart },
  { key: 'settings', href: '/account/settings', icon: Settings },
]

export function AccountSidebar({ 
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
  const [open, setOpen] = useState(false)

  const activeNavItems = [
    ...NAV_ITEMS,
    ...(affiliateStatus === 'approved' ? [{ key: 'affiliateDashboard', href: '/affiliates/dashboard', icon: BarChart }] : [])
  ]

  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <aside className="w-full h-full flex flex-col gap-6 p-6 lg:py-10 lg:px-6">
      
      {/* Profile Header */}
      <div className="flex flex-col gap-4">
        <Link href="/shop" className="text-[10px] font-bold text-gray-400 hover:text-[#1e5661] flex items-center gap-1.5 uppercase tracking-widest transition-colors mb-2 w-max font-heading">
          <ArrowLeft size={12} />
          Back to Store
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1e5661] to-[#84d0d9] rounded-2xl blur-md opacity-40"></div>
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1e5661] to-[#2b646c] flex items-center justify-center text-white text-2xl font-bold font-heading shadow-lg border border-white/20">
              {userInitial}
            </div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-black font-heading truncate max-w-[150px] tracking-tight">{userName}</h2>
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 font-heading">HelixBio Member</span>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2" />

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5 relative z-10">
        {activeNavItems.map((item) => {
          const isActive = item.href === '/account' 
            ? pathname === '/account' 
            : pathname.startsWith(item.href)
            
          const Icon = item.icon
          
          return (
            <Link 
              key={item.key} 
              href={item.href}
              onClick={() => setOpen(false)}
              className={`
                relative flex items-center justify-start gap-4 px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-[0.1em] transition-all duration-300 group
                ${isActive ? 'text-white' : 'text-gray-500 hover:text-[#1e5661]'}
              `}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav-bg"
                  className="absolute inset-0 bg-gradient-to-r from-[#1e5661] to-[#2b646c] rounded-2xl shadow-md z-0 border border-[#1e5661]/50"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {!isActive && (
                <div className="absolute inset-0 bg-gray-50/0 group-hover:bg-gray-50 rounded-2xl z-0 transition-colors duration-300" />
              )}
              
              <Icon size={16} className={`relative z-10 transition-transform duration-300 ${isActive ? 'text-white scale-110' : 'group-hover:scale-110'}`} />
              <span className="relative z-10 font-heading">{t(`nav.${item.key}`)}</span>
            </Link>
          )
        })}

        <div className="w-full h-px bg-gray-100 my-4" />

        {/* Sign out */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="relative flex items-center justify-start gap-4 px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-[0.1em] text-red-500/80 hover:text-red-600 transition-all duration-300 group bg-transparent w-full">
              <div className="absolute inset-0 bg-red-50/0 group-hover:bg-red-50 rounded-2xl z-0 transition-colors duration-300" />
              <LogOut size={16} className="relative z-10 transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="relative z-10 font-heading">{t('signOut')}</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white/90 backdrop-blur-xl border border-white p-8 rounded-[32px] shadow-2xl">
            <DialogHeader>
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <LogOut size={20} className="text-red-500 ml-1" />
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight text-black font-heading">
                {t('signOutDialogTitle')}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-2">
                {t('signOutDialogDescription')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-8 sm:justify-end">
              <DialogClose asChild>
                <button className="px-6 py-3.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] text-gray-600 bg-gray-100/50 hover:bg-gray-100 transition-colors w-full sm:w-auto text-center font-heading">
                  {t('cancel')}
                </button>
              </DialogClose>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-6 py-3.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] text-white bg-red-500 hover:bg-red-600 transition-colors shadow-[0_4px_14px_rgba(239,68,68,0.3)] w-full sm:w-auto text-center font-heading"
              >
                {t('confirmSignOut')}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </nav>

      <div className="mt-auto pt-6 flex flex-col gap-4">
        
        {/* HB Points Mini Card */}
        <div className="mt-6 mx-2 mb-4">
          <div className="bg-[#fbfcff] rounded-xl p-4 border border-gray-100 flex items-center justify-between group">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 font-heading">HB Points</span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-2xl font-bold text-black font-heading tracking-tight">{Number(hbPoints).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Affiliate Promo or Dashboard */}
        {affiliateStatus !== 'approved' && (
          <Link href="/affiliates" className="group relative bg-gradient-to-br from-[#1e5661] to-[#112a2e] rounded-2xl p-5 overflow-hidden shadow-lg border border-[#2b646c]/50">
            <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/denskvdyt/image/upload/v1783098784/partner_program_ub13f7.webp')] bg-cover bg-right opacity-20 mix-blend-screen group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#112a2e] to-transparent opacity-80" />
            
            <div className="relative z-10 flex flex-col gap-2">
              <span className="text-[9px] font-bold text-[#84d0d9] tracking-[0.2em] font-heading uppercase">{t('partnerProgram')}</span>
              <p className="text-[13px] font-bold text-white leading-snug font-heading tracking-wide">
                Earn commissions by sharing HelixBio
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold text-white uppercase tracking-widest group-hover:text-[#84d0d9] transition-colors font-heading">
                Apply Now <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        )}
        
        {/* Help Input */}
        <div className="relative">
          <input
            type="text"
            placeholder={t('askMeAnything')}
            className="w-full bg-white border border-gray-100 rounded-full px-5 py-3.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#84d0d9]/30 focus:border-[#84d0d9] pr-12 font-heading shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all placeholder:text-gray-400"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#1e5661] hover:bg-[#84d0d9]/10 transition-colors">
            <Send size={12} />
          </button>
        </div>
      </div>
    </aside>
  )
}
