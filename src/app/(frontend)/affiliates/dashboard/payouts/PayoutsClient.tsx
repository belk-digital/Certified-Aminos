'use client'

import React, { useState } from 'react'
import { motion, Variants } from 'framer-motion'
import { WalletCards, ArrowRight, Loader2, CheckCircle2, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface PayoutsClientProps {
  payoutRequests: {
    id: string;
    date: string;
    amount: number; // in dollars
    method: string;
    details: string;
    status: string;
  }[];
  availableBalance: number;
  totalPendingHold: number;
  minimumThreshold: number;
  pendingPeriodDays: number;
}

export function PayoutsClient({ payoutRequests, availableBalance, totalPendingHold, minimumThreshold, pendingPeriodDays }: PayoutsClientProps) {
  const t = useTranslations('affiliate.payouts')
  const router = useRouter()

  const statusLabel = (status: string) => {
    if (status === 'pending') return t('statusPending')
    if (status === 'paid') return t('statusPaid')
    if (status === 'rejected') return t('statusRejected')
    return t('statusProcessing')
  }

  const [amount, setAmount] = useState<string>('')
  const [method, setMethod] = useState<'zelle' | 'cashapp' | 'applepay'>('zelle')
  const [details, setDetails] = useState<string>('')
  
  const [isRequesting, setIsRequesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const formatMoney = (dollars: number) => `$${dollars.toFixed(2)}`

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError(t('errorInvalidAmount'))
      return
    }

    if (parsedAmount < minimumThreshold) {
      setError(t('errorMinimumAmount', { amount: formatMoney(minimumThreshold) }))
      return
    }

    if (parsedAmount > availableBalance) {
      setError(t('errorExceedsBalance'))
      return
    }

    if (!details.trim()) {
      setError(t('errorMissingDetails'))
      return
    }

    setIsRequesting(true)
    
    try {
      const res = await fetch('/api/affiliates/payout-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parsedAmount,
          method,
          details,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setSuccess(t('successRequestSubmitted'))
        setAmount('')
        setDetails('')
        router.refresh()
      } else {
        setError(data.error || t('errorSubmitFailed'))
      }
    } catch (err) {
      setError(t('errorUnexpected'))
    } finally {
      setIsRequesting(false)
    }
  }

  // Animation variants
  const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }
  
  const itemVars: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div 
      variants={containerVars}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-16"
    >
      {/* Top Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 border-b border-gray-100 pb-12">
        <motion.div variants={itemVars} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400">
              {t('availableBalanceTitle')}
            </h1>
            <p className="text-gray-500 text-sm max-w-sm">{t('availableBalanceDesc')}</p>
          </div>
          <div className="mt-2">
            <span className="text-[80px] lg:text-[100px] leading-[0.9] font-bold text-[#1e5661] tracking-tighter">{formatMoney(availableBalance)}</span>
          </div>
        </motion.div>

        <motion.div variants={itemVars} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400">
              {t('dayHoldTitle', { days: pendingPeriodDays })}
            </h1>
            <p className="text-gray-500 text-sm max-w-sm">{t('dayHoldDesc', { days: pendingPeriodDays })}</p>
          </div>
          <div className="mt-2">
            <span className="text-[80px] lg:text-[100px] leading-[0.9] font-bold text-gray-300 tracking-tighter">{formatMoney(totalPendingHold)}</span>
          </div>
        </motion.div>
      </div>

      {/* Request Form */}
      <motion.div variants={itemVars} className="flex flex-col gap-8 pb-12 border-b border-gray-100">
        <h2 className="text-sm font-medium tracking-[0.2em] uppercase text-black">
          {t('requestPayoutTitle')}
        </h2>

        <form onSubmit={handleRequestPayout} className="flex flex-col lg:flex-row gap-8 items-end max-w-5xl">
          <div className="flex-1 w-full flex flex-col gap-3">
            <label className="text-[10px] uppercase tracking-[0.2em]  font-medium">{t('amountLabel')}</label>
            <input
              type="number"
              step="0.01"
              min={minimumThreshold.toString()}
              max={availableBalance.toString()}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-transparent border-b-2 border-gray-200 px-0 py-3 text-2xl text-black font-medium focus:outline-none focus:border-black transition-colors"
              placeholder="0.00"
              required
            />
          </div>

          <div className="flex-1 w-full flex flex-col gap-3">
            <label className="text-[10px] uppercase tracking-[0.2em]  font-medium">{t('methodLabel')}</label>
            <select
              value={method}
              onChange={e => setMethod(e.target.value as any)}
              className="w-full bg-transparent border-b-2 border-gray-200 px-0 py-3 text-xl text-black font-medium focus:outline-none focus:border-black transition-colors"
            >
              <option value="zelle">{t('methodZelle')}</option>
              <option value="cashapp">{t('methodCashapp')}</option>
              <option value="applepay">{t('methodApplePay')}</option>
            </select>
          </div>

          <div className="flex-[2] w-full flex flex-col gap-3">
            <label className="text-[10px] uppercase tracking-[0.2em]  font-medium">{t('detailsLabel')}</label>
            <input
              type="text"
              value={details}
              onChange={e => setDetails(e.target.value)}
              className="w-full bg-transparent border-b-2 border-gray-200 px-0 py-3 text-xl text-black font-medium focus:outline-none focus:border-black transition-colors"
              placeholder={t('detailsPlaceholder')}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isRequesting || availableBalance < minimumThreshold}
            className="w-full lg:w-auto bg-black text-white px-10 py-4 rounded-full text-xs font-medium uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isRequesting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('requestButton')}
          </button>
        </form>

        {error && (
          <div className="mt-2 text-red-500 text-sm font-medium tracking-wide">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-2 text-emerald-600 text-sm font-medium tracking-wide flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {success}
          </div>
        )}
      </motion.div>
      
      {/* Payout Ledger */}
      <div className="flex flex-col">
        <div className="flex items-end justify-between pb-4 mb-6">
          <h2 className="text-sm font-medium tracking-[0.2em] text-black uppercase">
            {t('payoutHistoryTitle')}
          </h2>
        </div>

        {payoutRequests.length > 0 && (
          <motion.div variants={itemVars} className="hidden md:flex items-center justify-between pb-4 border-b border-gray-200 px-4">
            <span className="w-1/3 text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400">{t('dateLabel')}</span>
            <span className="w-1/3 text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400">{t('methodLabel')}</span>
            <span className="w-1/3 text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 text-right">{t('amountColumnLabel')}</span>
          </motion.div>
        )}

        {payoutRequests.length === 0 ? (
          <motion.div variants={itemVars} className="py-24 flex flex-col items-center justify-center text-center gap-6 text-gray-400 border-b border-gray-100">
            <WalletCards size={48} className="opacity-20" />
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-light text-black uppercase tracking-widest">{t('emptyTitle')}</h3>
              <p className="text-base">{t('emptyDesc')}</p>
            </div>
          </motion.div>
        ) : (
          payoutRequests.map((req) => (
            <motion.div 
              key={req.id} 
              variants={itemVars}
              className="group flex flex-col md:flex-row md:items-center justify-between py-6 md:py-8 border-b border-gray-100 hover:bg-gray-50 transition-colors px-4 -mx-4 rounded-lg"
            >
              <div className="flex flex-col gap-2 md:w-1/3">
                <span className="md:hidden text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400">{t('dateLabel')}</span>
                <span className="text-lg font-light text-black tracking-widest">{req.date}</span>
              </div>

              <div className="flex flex-col gap-2 md:w-1/3 mt-4 md:mt-0">
                <span className="md:hidden text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400">{t('methodLabel')}</span>
                <span className="text-lg font-light text-black capitalize">{req.method}</span>
                <span className="text-sm text-gray-500 truncate max-w-[200px]">{req.details}</span>
              </div>

              <div className="flex flex-col md:items-end gap-2 md:w-1/3 mt-6 md:mt-0">
                <span className="md:hidden text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 text-right">{t('amountColumnLabel')}</span>
                <div className="flex items-center justify-between md:justify-end gap-6 w-full">
                  <span className="text-2xl text-black font-light tracking-tight">{formatMoney(req.amount)}</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      req.status === 'pending' ? 'bg-amber-400' :
                      req.status === 'paid' ? 'bg-emerald-500' :
                      req.status === 'rejected' ? 'bg-red-500' :
                      'bg-emerald-400'
                    }`} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500">{statusLabel(req.status)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}

