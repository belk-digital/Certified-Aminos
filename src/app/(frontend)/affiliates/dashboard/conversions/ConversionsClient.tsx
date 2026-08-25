'use client'

import React, { useState, useMemo } from 'react'
import { motion, Variants } from 'framer-motion'
import { Target } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ConversionsClientProps {
  conversions: {
    id: string;
    date: string;
    orderValue: number; // in dollars
    commissionAmount: number; // in dollars
    status: string;
  }[];
}

export function ConversionsClient({ conversions }: ConversionsClientProps) {
  const t = useTranslations('affiliate.conversions')
  const formatMoney = (dollars: number) => `$${dollars.toFixed(2)}`

  const statusLabel = (status: string) => {
    if (status === 'pending') return t('statusPending')
    if (status === 'approved') return t('statusApproved')
    if (status === 'paid') return t('statusPaid')
    if (status === 'rejected') return t('statusRejected')
    return status
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

  // Pagination and sorting
  const [page, setPage] = useState(1)
  const itemsPerPage = 10
  
  // Sort from newest to oldest just to be absolutely sure
  const sortedConversions = useMemo(() => {
    return [...conversions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [conversions])

  const paginatedConversions = useMemo(() => {
    return sortedConversions.slice(0, page * itemsPerPage)
  }, [sortedConversions, page])

  const hasMore = paginatedConversions.length < sortedConversions.length

  return (
    <motion.div 
      variants={containerVars}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-12"
    >
      <motion.div variants={itemVars} className="border-b-2 border-black pb-8">
        <h1 className="text- -light tracking-tight text-[#1e5661] uppercase leading-none mb-4">
          {t('title')}
        </h1>
        <p className="text-gray-500 max-w-xl text-lg">{t('subtitle')}</p>
      </motion.div>

      <div className="flex flex-col">
        {/* Ledger Header - Desktop Only */}
        {conversions.length > 0 && (
          <motion.div variants={itemVars} className="hidden md:flex items-center justify-between pb-4 border-b border-gray-200 px-4">
            <span className="w-1/4 text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400">{t('orderIdLabel')}</span>
            <span className="w-1/4 text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400">{t('dateLabel')}</span>
            <span className="w-1/4 text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400">{t('orderValueLabel')}</span>
            <span className="w-1/4 text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 text-right">{t('commissionLabel')}</span>
          </motion.div>
        )}

        {conversions.length === 0 ? (
          <motion.div variants={itemVars} className="py-24 flex flex-col items-center justify-center text-center gap-6 text-gray-400 border-b border-gray-100">
            <Target size={48} className="opacity-20" />
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-light text-black uppercase tracking-widest">{t('emptyTitle')}</h3>
              <p className="text-base">{t('emptyDesc')}</p>
            </div>
          </motion.div>
        ) : (
          paginatedConversions.map((conv) => (
            <motion.div 
              key={conv.id} 
              variants={itemVars}
              className="group flex flex-col md:flex-row md:items-center justify-between py-6 md:py-8 border-b border-gray-100 hover:bg-gray-50 transition-colors px-4 -mx-4 rounded-lg"
            >
              <div className="flex flex-col gap-2 md:w-1/4">
                <span className="md:hidden text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400">{t('orderIdLabel')}</span>
                <span className="text-lg font-light text-black tracking-widest">#{conv.id.substring(0, 8)}</span>
              </div>

              <div className="flex flex-col gap-2 md:w-1/4 mt-4 md:mt-0">
                <span className="md:hidden text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400">{t('dateLabel')}</span>
                <span className="text-sm font-medium text-gray-600">{conv.date}</span>
              </div>

              <div className="flex flex-col gap-2 md:w-1/4 mt-4 md:mt-0">
                <span className="md:hidden text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400">{t('orderValueLabel')}</span>
                <span className="text-lg text-black">{formatMoney(conv.orderValue)}</span>
              </div>

              <div className="flex flex-col md:items-end gap-2 md:w-1/4 mt-6 md:mt-0">
                <span className="md:hidden text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 text-right">{t('commissionLabel')}</span>
                <div className="flex items-center justify-between md:justify-end gap-6 w-full">
                  <span className="text-2xl text-emerald-600 font-bold tracking-tight">+{formatMoney(conv.commissionAmount)}</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      conv.status === 'pending' ? 'bg-amber-400' :
                      conv.status === 'approved' ? 'bg-blue-500' :
                      conv.status === 'paid' ? 'bg-[#1e5661]' :
                      'bg-red-500'
                    }`} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500">{statusLabel(conv.status)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {hasMore && (
        <motion.div variants={itemVars} className="flex justify-center mt-8">
          <button
            onClick={() => setPage(p => p + 1)}
            className="bg-black hover:bg-gray-800 text-white px-10 py-4 rounded-full text-xs font-medium uppercase tracking-[0.2em] transition-all shadow-md"
          >
            Load More
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
