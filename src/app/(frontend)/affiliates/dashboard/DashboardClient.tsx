'use client'

import React, { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { ArrowRight, MousePointerClick, Target, DollarSign, Wallet, Copy, Check, ExternalLink } from 'lucide-react'
import { motion, Variants } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export interface DashboardClientProps {
  userName?: string;
  tier?: string;
  stats: {
    totalClicks: number;
    totalConversions: number;
    conversionRate: string;
    totalCommissionPending: number; // in dollars
    totalCommissionApproved: number; // in dollars
    totalCommissionPaid: number; // in dollars
    referralSlug: string;
    couponCode: string;
  };
  recentConversions: {
    id: string;
    date: string;
    amount: number; // commission amount in dollars
    status: string;
  }[];
}

export function DashboardClient({ userName = 'Partner', tier = 'standard', stats, recentConversions }: DashboardClientProps) {
  const t = useTranslations('affiliate.dashboard')
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const statusLabel = (status: string) => {
    if (status === 'pending') return t('statusPending')
    if (status === 'approved') return t('statusApproved')
    if (status === 'paid') return t('statusPaid')
    return status
  }

  const handleCopy = (text: string, type: 'link' | 'code') => {
    navigator.clipboard.writeText(text)
    if (type === 'link') {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } else {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  // Formatting helpers
  const formatMoney = (dollars: number) => `$${dollars.toFixed(2)}`
  const [baseUrl, setBaseUrl] = useState('https://helixbiochem.com')
  
  React.useEffect(() => {
    setBaseUrl(window.location.origin)
  }, [])

  const referralUrl = `${baseUrl}/ref/${stats.referralSlug}`

  // Animation variants
  const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }
  
  const itemVars: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div 
      variants={containerVars}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-12"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pb-12 border-b border-gray-100">
        <motion.div variants={itemVars} className="flex flex-col justify-between">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 mb-6">{t('totalClicks')}</span>
          <span className="text-6xl text-black leading-none font-light tracking-tight">{stats.totalClicks}</span>
        </motion.div>

        <motion.div variants={itemVars} className="flex flex-col justify-between">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 mb-6">{t('conversions')}</span>
          <div className="flex items-end gap-4">
            <span className="text-6xl text-black leading-none font-light tracking-tight">{stats.totalConversions}</span>
            <span className="text-sm font-bold text-[#1e5661] bg-[#1e5661]/10 px-3 py-1.5 rounded-full mb-1">{stats.conversionRate}</span>
          </div>
        </motion.div>

        <motion.div variants={itemVars} className="flex flex-col justify-between">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 mb-6">{t('pendingCommission')}</span>
          <span className="text-6xl text-black leading-none font-light tracking-tight">{formatMoney(stats.totalCommissionPending)}</span>
        </motion.div>

        <motion.div variants={itemVars} className="flex flex-col justify-between">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 mb-6">{t('totalPaidOut')}</span>
          <span className="text-6xl text-black leading-none font-light tracking-tight">{formatMoney(stats.totalCommissionPaid)}</span>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-16 items-start">
        
        {/* Left Column: Recent Conversions (Ledger Style) */}
        <motion.div variants={itemVars} className="flex flex-col">
          <div className="flex items-end justify-between border-b-2 border-black pb-4 mb-6">
            <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-black">{t('recentConversions')}</h3>
            <Link href="/affiliates/dashboard/conversions" className="text-[10px] font-medium uppercase tracking-[0.1em] text-gray-500 hover:text-black transition-colors">
              {t('viewAll')} →
            </Link>
          </div>

          <div className="flex flex-col">
            {recentConversions.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center gap-4 text-gray-400">
                <Target size={32} className="opacity-20" />
                <p className="text-sm font-medium">{t('noConversionsYet')}</p>
                <p className="text-xs">{t('shareLinkToEarn')}</p>
              </div>
            ) : (
              recentConversions.map((conv, i) => (
                <motion.div 
                  key={conv.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 + 0.3 }}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between py-6 border-b border-gray-100 hover:bg-gray-50 transition-colors px-2 -mx-2 rounded-lg cursor-pointer"
                >
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-widest text-black">{t('orderNumber', { id: conv.id.substring(0, 8) })}</span>
                    <span className="text-xs font-light text-gray-500">{conv.date}</span>
                  </div>
                  
                  <div className="flex flex-col sm:items-end gap-2 mt-4 sm:mt-0">
                    <span className="text-base text-black font-light">+{formatMoney(conv.amount)}</span>
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        conv.status === 'pending' ? 'bg-amber-400' : 
                        conv.status === 'approved' ? 'bg-blue-500' : 
                        'bg-[#1e5661]'
                      }`} />
                      <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-gray-500">{statusLabel(conv.status)}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Right Column: Share Tools (Clean minimal cards) */}
        <motion.div variants={itemVars} className="flex flex-col bg-gray-50 rounded-3xl p-8 lg:p-10 border border-gray-100">
          <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-black border-b border-gray-200 pb-4 mb-8">{t('shareTools')}</h3>

          {/* Referral Link */}
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400">{t('yourReferralLink')}</span>
            <div className="flex flex-col gap-3">
              <div className="bg-white rounded-xl px-4 py-4 text-sm font-mono text-gray-800 break-all border border-gray-200 selection:bg-black/10">
                {referralUrl}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleCopy(referralUrl, 'link')}
                  variant="outline"
                  className="flex-1 rounded-xl h-12 text-[10px] font-medium uppercase tracking-[0.2em] gap-2 bg-white hover:bg-gray-50 border-gray-200 text-black shadow-sm"
                >
                  {copiedLink ? <Check size={14} className="text-[#1e5661]" /> : <Copy size={14} />}
                  {copiedLink ? t('copied') : t('copy')}
                </Button>
                <a href={referralUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-black transition-colors shadow-sm">
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>

          {stats.couponCode && (
            <div className="flex flex-col gap-4 mt-10 pt-10 border-t border-gray-200/50">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400">{t('yourCouponCode')}</span>
              <div className="bg-[#1e5661] p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden shadow-xl">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="text-2xl font-mono font-bold text-white text-center relative z-10 tracking-widest py-2">
                  {stats.couponCode}
                </div>
                <Button
                  onClick={() => handleCopy(stats.couponCode, 'code')}
                  className="w-full rounded-xl h-12 text-[10px] font-medium uppercase tracking-[0.2em] gap-2 bg-white hover:bg-gray-50 text-[#1e5661] border-none shadow-sm"
                >
                  {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                  {copiedCode ? t('copied') : t('copyCode')}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

