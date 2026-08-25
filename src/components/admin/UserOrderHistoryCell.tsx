'use client'

import React, { useEffect, useState } from 'react'

export const UserOrderHistoryCell: React.FC<any> = ({ rowData }) => {
  const [orderCount, setOrderCount] = useState<number | null>(null)
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    if (!rowData?.id) return
    let cancelled = false

    fetch(`/api/orders?where[owner][equals]=${rowData.id}&limit=1&depth=0`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed`)
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setOrderCount(data.totalDocs || 0)
      })
      .catch((err) => {
        if (!cancelled) setError(true)
      })

    return () => {
      cancelled = true
    }
  }, [rowData?.id])

  if (error) return <span>-</span>
  if (orderCount === null) return <span>Loading...</span>
  
  if (orderCount === 0) return <span style={{ opacity: 0.5 }}>No Orders</span>
  
  return (
    <a 
      href={`/admin/collections/orders?where[owner][equals]=${rowData.id}`} 
      style={{ textDecoration: 'underline', fontWeight: 600 }}
    >
      {orderCount} Order{orderCount === 1 ? '' : 's'}
    </a>
  )
}
