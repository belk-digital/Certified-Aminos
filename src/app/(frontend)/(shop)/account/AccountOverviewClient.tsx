'use client'

import React from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { ArrowRight, Package, Heart, Calendar, MapPin, Coins, ShoppingBag, DollarSign, Edit2 } from 'lucide-react'
import { motion, Variants } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { getMappedStatus, type DisplayOrderStatus } from '@/lib/orders/statusLabel'

export interface AccountOverviewProps {
  stats: {
    ordersPlaced: number
    wishlistCount: number
    caPoints: number
    memberSince: string
  }
  recentOrders: {
    id: string
    orderNumber: string
    date: string
    status: string
    total: number
    imageUrl: string | null
    itemCount: number
  }[]
  defaultAddress: {
    name: string
    street: string
    city: string
    state: string
    zip: string
    country: string
    phone: string | null
  } | null
  affiliateStatus?: 'none' | 'pending' | 'approved' | 'rejected' | 'suspended'
  userName?: string
  spending: {
    year: number
    totalSpent: number
    months: { label: string; value: number }[]
  }
}

const STATUS_STYLES: Record<DisplayOrderStatus, string> = {
  Placed: 'bg-gray-100 text-gray-600',
  Processing: 'bg-amber-50 text-amber-600',
  Shipped: 'bg-blue-50 text-blue-600',
  Delivered: 'bg-emerald-50 text-emerald-600',
}

// Builds a smooth cardinal-spline path through the given points (no external chart lib needed).
function smoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }
  return d
}

function SpendingChart({ months }: { months: { label: string; value: number }[] }) {
  const width = 600
  const height = 220
  const padding = { top: 20, right: 12, bottom: 28, left: 12 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const max = Math.max(...months.map((m) => m.value), 1)
  const points = months.map((m, i) => ({
    x: padding.left + (i / (months.length - 1)) * chartW,
    y: padding.top + chartH - (m.value / max) * chartH,
  }))

  const linePath = smoothPath(points)
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`

  const peakIndex = months.reduce((best, m, i) => (m.value > months[best].value ? i : best), 0)
  const peak = points[peakIndex]
  const hasData = months.some((m) => m.value > 0)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
      <defs>
        <linearGradient id="spendingFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1323" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0a1323" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Horizontal gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1={padding.left}
          x2={width - padding.right}
          y1={padding.top + chartH * (1 - t)}
          y2={padding.top + chartH * (1 - t)}
          stroke="#eef1f4"
          strokeWidth="1"
        />
      ))}

      {hasData && (
        <>
          <path d={areaPath} fill="url(#spendingFill)" />
          <path d={linePath} fill="none" stroke="#0a1323" strokeWidth="2.5" strokeLinecap="round" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={i === peakIndex ? 5 : 3} fill="#fff" stroke="#0a1323" strokeWidth={i === peakIndex ? 2.5 : 1.5} />
          ))}
          <circle cx={peak.x} cy={peak.y} r="9" fill="none" stroke="#0a1323" strokeWidth="1" strokeOpacity="0.25" />
        </>
      )}

      {months.map((m, i) => (
        <text
          key={m.label}
          x={padding.left + (i / (months.length - 1)) * chartW}
          y={height - 6}
          textAnchor="middle"
          className="fill-gray-400"
          fontSize="10"
        >
          {m.label}
        </text>
      ))}
    </svg>
  )
}

export function AccountOverviewClient({ stats, recentOrders, defaultAddress, affiliateStatus = 'none', userName = 'User', spending }: AccountOverviewProps) {
  const t = useTranslations('account.overview')

  const STATUS_LABELS: Record<DisplayOrderStatus, string> = {
    Placed: t('statusPlaced'),
    Processing: t('statusProcessing'),
    Shipped: t('statusShipped'),
    Delivered: t('statusDelivered'),
  }

  const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  }

  const itemVars: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  }

  const STAT_CARDS = [
    { label: 'CA Points', value: `${Number(stats.caPoints).toFixed(2)}`, suffix: 'pts', icon: Coins, bg: 'bg-blue-50', fg: 'text-blue-500' },
    { label: t('ordersPlaced'), value: String(stats.ordersPlaced), icon: ShoppingBag, bg: 'bg-emerald-50', fg: 'text-emerald-500' },
    { label: t('wishlistItems'), value: String(stats.wishlistCount), icon: Heart, bg: 'bg-purple-50', fg: 'text-purple-500' },
    { label: t('memberSince'), value: stats.memberSince, icon: Calendar, bg: 'bg-orange-50', fg: 'text-orange-500' },
    { label: 'CA Points Value', value: `$${Number(stats.caPoints).toFixed(2)}`, icon: DollarSign, bg: 'bg-cyan-50', fg: 'text-cyan-600' },
  ]

  return (
    <motion.div variants={containerVars} initial="hidden" animate="show" className="flex flex-col gap-8 w-full font-sans">
      {/* Header */}
      <motion.div variants={itemVars} className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-blue-500">{t('welcomeBack')}</span>
        <h1 className="text-4xl md:text-5xl font-bold text-ink tracking-tight">{userName}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('subtitle')}</p>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={itemVars} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white border border-gray-100 rounded-2xl p-3.5 sm:p-5 flex items-center gap-2.5 sm:gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] min-w-0">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${card.bg}`}>
                <Icon size={18} className={card.fg} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] sm:text-[11px] font-medium text-gray-400 truncate">{card.label}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg sm:text-xl font-bold text-ink">{card.value}</span>
                  {card.suffix && <span className="text-[10px] text-gray-400">{card.suffix}</span>}
                </div>
              </div>
            </div>
          )
        })}
      </motion.div>

      {/* Ledger + Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Ledger */}
        <motion.div variants={itemVars} className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 flex flex-col gap-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-ink">{t('orderLedger')}</h3>
            <Link href="/account/orders" className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1">
              {t('viewAll')} <ArrowRight size={12} />
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="flex flex-col divide-y divide-gray-50">
              {recentOrders.map((order) => {
                const mappedStatus = getMappedStatus(order.status)
                return (
                  <Link href={`/account/orders/${order.id}`} key={order.id} className="flex items-center gap-3 sm:gap-4 py-4 group">
                    <div className="w-11 h-11 rounded-xl bg-gray-50 shrink-0 overflow-hidden relative flex items-center justify-center">
                      {order.imageUrl ? (
                        <Image src={order.imageUrl} alt={order.orderNumber} fill className="object-cover" unoptimized />
                      ) : (
                        <Package size={16} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-semibold text-ink truncate group-hover:text-blue-500 transition-colors">
                        Order #{order.orderNumber}
                      </span>
                      <span className="text-xs text-gray-400">{order.date}</span>
                    </div>
                    <span className={`hidden sm:inline-block text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLES[mappedStatus]}`}>
                      {STATUS_LABELS[mappedStatus]}
                    </span>
                    <span className="text-sm font-bold text-ink shrink-0 w-14 sm:w-16 text-right">${order.total.toFixed(2)}</span>
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

          {recentOrders.length > 0 && (
            <p className="text-xs text-gray-400 pt-2 border-t border-gray-50">
              You&apos;ve placed <span className="font-semibold text-ink">{stats.ordersPlaced}</span> orders so far.
            </p>
          )}
        </motion.div>

        {/* Annual Spending */}
        <motion.div variants={itemVars} className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 flex flex-col gap-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-ink">{t('annualSpending')}</h3>
            <span className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-3 py-1">
              {spending.year}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{t('totalSpent')}</span>
            <div className="text-3xl font-bold text-ink mt-1">${spending.totalSpent.toFixed(2)}</div>
          </div>

          <SpendingChart months={spending.months} />

          <p className="text-xs text-gray-400 pt-2 border-t border-gray-50">
            You&apos;ve spent <span className="font-semibold text-ink">${spending.totalSpent.toFixed(2)}</span> so far this year.
          </p>
        </motion.div>
      </div>

      {/* Primary Address */}
      <motion.div variants={itemVars} className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 flex flex-col gap-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-ink">{t('primaryAddress')}</h3>
          <Link href="/account/addresses" className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1.5">
            <Edit2 size={12} /> {t('edit')}
          </Link>
        </div>

        {defaultAddress ? (
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <MapPin size={18} className="text-blue-500" />
            </div>
            <div className="flex flex-col text-sm text-gray-600 leading-relaxed">
              <span className="text-ink font-semibold mb-0.5">{defaultAddress.name}</span>
              <span>{defaultAddress.street}</span>
              <span>{defaultAddress.city}, {defaultAddress.state} {defaultAddress.zip}</span>
              <span>{defaultAddress.country}</span>
              {defaultAddress.phone && <span className="mt-1">{defaultAddress.phone}</span>}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-4">
            <p className="text-sm text-gray-500 font-light">{t('noAddressYet')}</p>
            <Link href="/account/addresses" className="border border-gray-200 text-black px-6 py-2 rounded-full text-xs font-medium uppercase tracking-widest hover:border-black transition-colors">
              {t('addAddress')}
            </Link>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
