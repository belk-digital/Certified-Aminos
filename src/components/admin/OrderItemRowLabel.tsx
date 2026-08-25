'use client'

import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

export const OrderItemRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<{ variantTitle?: string; variant?: string; quantity?: number }>()

  const fallback = `Item ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`
  const variantLabel = data?.variantTitle || data?.variant

  return (
    <div>
      {variantLabel ? `${variantLabel}${data?.quantity ? ` × ${data.quantity}` : ''}` : fallback}
    </div>
  )
}
