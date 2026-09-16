'use client'

import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

const LABELS: Record<string, string> = {
  zelle: 'Zelle',
  circoflows: 'Card (CircoFlows)',
  stripe_link: 'Stripe (Custom Payment Link)',
  dataopt: 'Crypto (Data-opt)',
}

export const PaymentGatewayRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<{ key?: string; enabled?: boolean; title?: string }>()

  const fallback = `Method ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`
  const label = data?.title || (data?.key ? LABELS[data.key] || data.key : fallback)

  return (
    <div>
      {label}{data?.enabled === false ? ' (disabled)' : ''}
    </div>
  )
}
