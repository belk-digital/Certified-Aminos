'use client'

import React, { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, Filter, Package, ChevronRight as ChevronRightIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { getBadgeStatus, type BadgeOrderStatus } from '@/lib/orders/statusLabel'

export interface OrderItem {
  id: string;
  date: string;
  status: string;
  total: number;
  itemCount: number;
}

export interface AccountOrdersProps {
  orders: OrderItem[];
}

export function OrdersClient({ orders }: AccountOrdersProps) {
  const t = useTranslations('account.orders')
  const [filter, setFilter] = useState('all')

  const STATUS_LABELS: Record<BadgeOrderStatus, string> = {
    Placed: t('statusPlaced'),
    Processing: t('statusProcessing'),
    Shipped: t('statusShipped'),
    Delivered: t('statusDelivered'),
    Cancelled: t('statusCancelled'),
  }

  const filteredOrders = orders.filter((o) => {
    if (filter === 'all') return true
    const mapped = getBadgeStatus(o.status)
    if (filter === 'returned') return mapped === 'Cancelled'
    return mapped.toLowerCase() === filter
  })

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col w-full font-sans"
    >
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl md:text-5xl font-bold text-ink tracking-tight">
            {t('title')}
          </h1>
          <p className="text-gray-500 mt-1 max-w-lg text-sm">{t('subtitle')}</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-1 rounded-full shadow-sm border border-gray-100 mt-4 md:mt-0">
          <div className="pl-4 hidden sm:flex items-center justify-center">
            <Filter size={14} className="text-gray-400" />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[160px] bg-transparent border-none shadow-none focus:ring-0 text-[10px] font-bold uppercase tracking-[0.1em] text-black font-heading">
              <SelectValue placeholder={t('filterStatus')} />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-100 rounded-xl shadow-xl shadow-black/5">
              <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-[0.1em] rounded-lg font-heading">{t('filterAll')}</SelectItem>
              <SelectItem value="processing" className="text-[10px] font-bold uppercase tracking-[0.1em] rounded-lg font-heading">{t('filterProcessing')}</SelectItem>
              <SelectItem value="delivered" className="text-[10px] font-bold uppercase tracking-[0.1em] rounded-lg font-heading">{t('filterDelivered')}</SelectItem>
              <SelectItem value="returned" className="text-[10px] font-bold uppercase tracking-[0.1em] rounded-lg text-red-500 font-heading">{t('filterReturned')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {filteredOrders.length > 0 ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          >
            <div className="flex flex-col divide-y divide-gray-100">
              {filteredOrders.map((order, i) => (
                <Link href={`/account/orders/${order.id}`} key={order.id} className="group flex flex-col md:flex-row md:items-center justify-between py-8 transition-colors hover:bg-gray-50/50 -mx-4 px-4 rounded-2xl cursor-pointer">
                  
                  <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-16 flex-1">
                    
                    {/* Order Number & Date */}
                    <div className="flex flex-col gap-1 w-32">
                      <span className="text-xs text-gray-400">{order.date}</span>
                      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 mt-2">{t('orderPlaced')}</span>
                    </div>

                    <div className="flex flex-col gap-1 w-40">
                      <span className="text-xl font-light text-black group-hover:text-navy-deep transition-colors">#{order.id}</span>
                      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 mt-2">Order ID</span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-col gap-1">
                      {(() => {
                        const mappedStatus = getBadgeStatus(order.status)
                        const isProcessing = mappedStatus === 'Processing' || mappedStatus === 'Placed'
                        return (
                          <span className={`text-[11px] font-medium uppercase tracking-widest px-3 py-1 rounded-full w-fit ${
                            isProcessing ? 'bg-amber-50 text-amber-600' : 
                            mappedStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                            mappedStatus === 'Shipped' ? 'bg-blue-50 text-blue-600' :
                            'bg-red-50 text-red-600'
                          }`}>
                            {STATUS_LABELS[mappedStatus]}
                          </span>
                        )
                      })()}
                      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 mt-2">{t('status')}</span>
                    </div>
                  </div>

                  {/* Total & Action */}
                  <div className="flex items-center gap-8 mt-6 md:mt-0">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-2xl font-light text-black">
                        ${order.total.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400">
                        {t('itemCount', { count: order.itemCount })}
                      </span>
                    </div>
                    
                    <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-navy-deep group-hover:border-navy-deep group-hover:text-white transition-all transform group-hover:translate-x-1">
                      <ChevronRightIcon size={16} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Pagination Scaffolding */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 pt-8 gap-4">
              <span className="text-xs font-light text-gray-500">
                {t.rich('showingResults', {
                  bold: (chunks) => <span className="font-medium text-black">{chunks}</span>,
                  from: 1,
                  to: filteredOrders.length,
                  total: filteredOrders.length,
                })}
              </span>
              <div className="flex items-center gap-2">
                <button disabled className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent text-gray-400 border border-gray-200 cursor-not-allowed">
                  <ChevronLeft size={16} />
                </button>
                <button disabled className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent text-gray-400 border border-gray-200 cursor-not-allowed">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col items-center justify-center py-20 text-center bg-white border border-gray-100 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          >
            <Package size={48} className="text-gray-200 mb-6" strokeWidth={1} />
            <h2 className="text-2xl font-bold text-ink tracking-tight mb-2">{t('emptyTitle')}</h2>
            <p className="text-gray-500 font-light max-w-sm mb-8">{t('emptyDescription')}</p>
            <Link href="/shop" className="border border-gray-200 hover:border-navy-deep text-black rounded-full px-8 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors font-heading">
              {t('startShopping')}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}
