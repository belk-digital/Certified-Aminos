'use client'

import React, { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, MapPin, Heart, Settings, LogOut, BarChart, ChevronRight } from 'lucide-react'
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
  affiliateStatus = 'none'
}: {
  affiliateStatus?: 'none' | 'pending' | 'approved' | 'rejected' | 'suspended'
}) {
  const t = useTranslations('account.sidebar')
  const pathname = usePathname() || ''
  const [open, setOpen] = useState(false)

  const activeNavItems = [
    ...NAV_ITEMS,
    ...(affiliateStatus === 'approved' ? [{ key: 'affiliateDashboard', href: '/affiliates/dashboard', icon: BarChart }] : [])
  ]

  return (
    <aside className="w-full min-h-full flex flex-col gap-4 p-5 lg:py-7 lg:px-5">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-white">
          <span className="text-navy-deep font-heading text-xs font-bold">CA</span>
        </div>
        <span className="font-heading text-[13px] font-bold uppercase tracking-wide text-white leading-tight">
          Certified
          <br />
          Aminos
        </span>
      </Link>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

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
                relative flex items-center justify-start gap-4 px-4 py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-[0.1em] transition-all duration-300 group
                ${isActive ? 'text-navy-deep' : 'text-white/50 hover:text-white'}
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-bg"
                  className="absolute inset-0 bg-white rounded-2xl shadow-md z-0"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {!isActive && (
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 rounded-2xl z-0 transition-colors duration-300" />
              )}

              <Icon size={16} className={`relative z-10 transition-transform duration-300 ${isActive ? 'text-navy-deep scale-110' : 'group-hover:scale-110'}`} />
              <span className="relative z-10 font-heading">{t(`nav.${item.key}`)}</span>
            </Link>
          )
        })}

        <div className="w-full h-px bg-white/10 my-2" />

        {/* Sign out */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="relative flex items-center justify-start gap-4 px-4 py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-[0.1em] text-red-400 hover:text-red-300 transition-all duration-300 group bg-transparent w-full">
              <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/10 rounded-2xl z-0 transition-colors duration-300" />
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

      <div className="pt-2 flex flex-col gap-3">

        {/* Affiliate Promo or Dashboard */}
        {affiliateStatus !== 'approved' && (
          <Link href="/affiliates" className="group relative bg-gradient-to-br from-navy to-[#050a14] rounded-2xl p-4 overflow-hidden shadow-lg border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-t from-[#050a14] to-transparent opacity-80" />

            <div className="relative z-10 flex flex-col gap-2">
              <span className="text-[9px] font-bold text-white/60 tracking-[0.2em] font-heading uppercase">{t('partnerProgram')}</span>
              <p className="text-[13px] font-bold text-white leading-snug font-sans tracking-wide">
                Earn commissions by sharing Certified Aminos
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold text-white uppercase tracking-widest group-hover:text-white/70 transition-colors font-heading">
                Apply Now <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        )}
      </div>
    </aside>
  )
}
