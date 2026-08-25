'use client'

import React from 'react'
import { Link } from '@/i18n/navigation'
import { ArrowRight, Package, Heart, Calendar, MapPin, Search, Bell, Hexagon, Star, ChevronRight, Activity } from 'lucide-react'
import { motion, Variants } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { getMappedStatus, type DisplayOrderStatus } from '@/lib/orders/statusLabel'

export interface AccountOverviewProps {
  stats: {
    ordersPlaced: number;
    wishlistCount: number;
    hbPoints: number;
    memberSince: string;
  };
  recentOrders: {
    id: string;
    orderNumber: string;
    date: string;
    status: string;
    total: number;
  }[];
  defaultAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  } | null;
  affiliateStatus?: 'none' | 'pending' | 'approved' | 'rejected' | 'suspended';
  userName?: string;
  spending: {
    year: number;
    totalSpent: number;
    categories: { label: string; color: string; value: number; pct: number }[];
  };
}

export function AccountOverviewClient({ stats, recentOrders, defaultAddress, affiliateStatus = 'none', userName = 'User', spending }: AccountOverviewProps) {
  const DONUT_RADIUS = 70
  const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS
  let cumulativePct = 0
  const t = useTranslations('account.overview')

  const STATUS_LABELS: Record<DisplayOrderStatus, string> = {
    Placed: t('statusPlaced'),
    Processing: t('statusProcessing'),
    Shipped: t('statusShipped'),
    Delivered: t('statusDelivered'),
  }

  const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }
  
  const itemVars: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  }

  return (
    <motion.div 
      variants={containerVars}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-12 lg:gap-20 w-full font-sans"
    >
      
      {/* 1. Massive Profile Hero (Health-Tech Vibe) */}
      <motion.div variants={itemVars} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-gray-200 pb-12">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-gray-400">{t('welcomeBack')}</span>
          <h1 className="text-5xl md:text-7xl font-light text-black tracking-tight leading-none">
            {userName}
          </h1>
          <p className="text-gray-500 mt-2 max-w-lg text-sm md:text-base leading-relaxed font-light">
            {t('subtitle')}
          </p>
        </div>
        
        <div className="flex flex-col items-start md:items-end gap-1">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-[#84d0d9]" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">HB Points</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl md:text-6xl font-light text-black tracking-tighter">{Number(stats.hbPoints).toFixed(2)}</span>
            <span className="text-sm font-medium text-gray-400">pts</span>
          </div>
        </div>
      </motion.div>

      {/* 2. Vital Stats (Wide Horizon) */}
      <motion.div variants={itemVars} className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
        <div className="flex flex-col border-l-2 border-[#1e5661]/20 pl-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{t('ordersPlaced')}</span>
          <span className="text-4xl font-light text-black">{stats.ordersPlaced}</span>
        </div>
        <div className="flex flex-col border-l-2 border-[#1e5661]/20 pl-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{t('wishlistItems')}</span>
          <span className="text-4xl font-light text-black">{stats.wishlistCount}</span>
        </div>
        <div className="flex flex-col border-l-2 border-[#1e5661]/20 pl-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{t('memberSince')}</span>
          <span className="text-4xl font-light text-black">{stats.memberSince || new Date().getFullYear()}</span>
        </div>
        <div className="flex flex-col border-l-2 border-[#1e5661]/20 pl-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">HB Points Value</span>
          <span className="text-4xl font-light text-black">${stats.hbPoints.toFixed(2)}</span>
        </div>
      </motion.div>

      {/* 3. Main Data Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Ledger: Recent Orders (7 cols) */}
        <motion.div variants={itemVars} className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-black">Order Ledger</h3>
            <Link href="/account/orders" className="text-xs font-medium uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-1">
              {t('viewAll')} <ArrowRight size={12} />
            </Link>
          </div>
          
          <div className="flex flex-col">
            {recentOrders.length > 0 ? (
              <div className="flex flex-col divide-y divide-gray-100">
                {recentOrders.map((order) => {
                  const mappedStatus = getMappedStatus(order.status)
                  const isProcessing = mappedStatus === 'Processing' || mappedStatus === 'Placed'
                  return (
                    <Link href={`/account/orders/${order.id}`} key={order.id} className="flex items-center justify-between py-6 group">
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col gap-1 w-24">
                          <span className="text-xs text-gray-400">{order.date}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-lg font-light text-black group-hover:text-[#1e5661] transition-colors">#{order.orderNumber}</span>
                          <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400">
                            {STATUS_LABELS[mappedStatus]}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-lg font-light text-black">${order.total.toFixed(2)}</span>
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-black transition-colors transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center bg-gray-50/50 rounded-2xl">
                <Package size={24} className="text-gray-300 mb-4" />
                <p className="text-sm font-medium text-black">{t('noOrdersYetTitle')}</p>
                <p className="text-xs text-gray-500 mt-2 max-w-[200px] font-light">{t('noOrdersYetSubtitle')}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Analytics & Profile (5 cols) */}
        <motion.div variants={itemVars} className="lg:col-span-5 flex flex-col gap-12">
          
          {/* Spending Ring (Health-style Analytics) */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-black">Annual Spending</h3>
              <span className="text-xs font-medium text-gray-400">
                {spending.year}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-8 py-4">
              <div className="relative w-48 h-48 shrink-0">
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                  <circle cx="100" cy="100" r={DONUT_RADIUS} fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                  {spending.categories.map((cat, i) => {
                    const segmentLength = (cat.pct / 100) * DONUT_CIRCUMFERENCE
                    const offset = -((cumulativePct / 100) * DONUT_CIRCUMFERENCE)
                    cumulativePct += cat.pct
                    return (
                      <circle
                        key={i}
                        cx="100"
                        cy="100"
                        r={DONUT_RADIUS}
                        fill="transparent"
                        stroke={cat.color}
                        strokeWidth="12"
                        strokeDasharray={`${segmentLength} ${DONUT_CIRCUMFERENCE - segmentLength}`}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out drop-shadow-sm"
                      />
                    )
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t('totalSpent')}</span>
                  <span className="text-2xl font-light text-black mt-1">${spending.totalSpent.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full">
                {spending.categories.length > 0 ? spending.categories.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-600 font-light truncate">{item.label}</span>
                    </div>
                    <span className="font-medium text-black">{item.pct}%</span>
                  </div>
                )) : (
                  <div className="text-xs text-gray-400 font-light">{t('noPurchasesYet')}</div>
                )}
              </div>
            </div>
          </div>

          {/* Default Address */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-black">Primary Address</h3>
              <Link href="/account/addresses" className="text-xs font-medium uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-1">
                {t('edit')} <ArrowRight size={12} />
              </Link>
            </div>
            
            <div className="py-4">
              {defaultAddress ? (
                <div className="flex flex-col text-sm text-gray-600 leading-loose font-light">
                  <span className="text-black font-medium tracking-wide mb-2">{defaultAddress.name}</span>
                  <span>{defaultAddress.street}</span>
                  <span>{defaultAddress.city}, {defaultAddress.state} {defaultAddress.zip}</span>
                  <span>{defaultAddress.country}</span>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-4">
                  <p className="text-sm text-gray-500 font-light">{t('noAddressYet')}</p>
                  <Link href="/account/addresses" className="border border-gray-200 text-black px-6 py-2 rounded-full text-xs font-medium uppercase tracking-widest hover:border-black transition-colors">
                    {t('addAddress')}
                  </Link>
                </div>
              )}
            </div>
          </div>
          
        </motion.div>
      </div>
      
    </motion.div>
  )
}

