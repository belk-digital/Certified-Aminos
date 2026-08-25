'use client'

import React, { useEffect, useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

type OrderRow = {
  id: string | number
  orderNumber?: string
  status?: string
  paymentStatus?: string
  total?: number
  createdAt?: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  paid: '#10b981',
  fulfilled: '#10b981',
  shipped: '#3b82f6',
  completed: '#10b981',
  refunded: '#ef4444',
  cancelled: '#6b7280',
}

export const UserOrderHistory: React.FC = () => {
  const { id } = useDocumentInfo()
  const [orders, setOrders] = useState<OrderRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    fetch(`/api/orders?where[owner][equals]=${id}&sort=-createdAt&limit=50&depth=0`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load orders (${res.status})`)
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setOrders(data.docs || [])
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load orders')
      })

    return () => {
      cancelled = true
    }
  }, [id])

  // Nothing to show yet on the "create new user" screen
  if (!id) return null

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Order History</h3>

      {error && (
        <p style={{ color: '#ef4444', fontSize: '13px' }}>{error}</p>
      )}

      {!error && orders === null && (
        <p style={{ fontSize: '13px', opacity: 0.6 }}>Loading orders...</p>
      )}

      {!error && orders !== null && orders.length === 0 && (
        <p style={{ fontSize: '13px', opacity: 0.6 }}>This user has no orders yet.</p>
      )}

      {!error && orders !== null && orders.length > 0 && (
        <div style={{ border: '1px solid var(--theme-elevation-150, #333)', borderRadius: '6px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--theme-elevation-50, rgba(255,255,255,0.03))', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px' }}>Order #</th>
                <th style={{ padding: '10px 14px' }}>Status</th>
                <th style={{ padding: '10px 14px' }}>Total</th>
                <th style={{ padding: '10px 14px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => {
                    window.location.href = `/admin/collections/orders/${order.id}`
                  }}
                  style={{
                    borderTop: '1px solid var(--theme-elevation-150, #333)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--theme-elevation-50, rgba(255,255,255,0.04))')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '10px 14px' }}>
                    <a
                      href={`/admin/collections/orders/${order.id}`}
                      style={{ color: 'var(--theme-text, inherit)', textDecoration: 'underline' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      #{order.orderNumber || order.id}
                    </a>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span
                      style={{
                        color: STATUS_COLORS[order.status || ''] || 'inherit',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    >
                      {order.status || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {typeof order.total === 'number' ? `$${order.total.toFixed(2)}` : '—'}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
