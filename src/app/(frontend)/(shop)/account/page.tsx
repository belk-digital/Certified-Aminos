import React from 'react'
import { Metadata } from 'next'
import { AccountOverviewClient } from './AccountOverviewClient'
import { getPayloadUser } from '@/lib/auth/getPayloadUser'
import { getPayload } from 'payload'
import config from '@payload-config'
import { redirect } from 'next/navigation'
import type { Order, Address } from '@/payload-types'
import { getLocale, getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('account.overview')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function AccountOverviewPage() {
  const user = await getPayloadUser()
  if (!user) redirect('/login')

  const locale = await getLocale()
  const t = await getTranslations('account.overview')
  const payload = await getPayload({ config })

  // 1. Fetch Orders
  const { docs: orders, totalDocs: ordersPlaced } = await payload.find({
    collection: 'orders',
    where: { owner: { equals: user.id } },
    sort: '-createdAt',
    limit: 3, // Recent orders
    overrideAccess: true,
  })

  // 2. Fetch Wishlist count
  const { docs: wishlists } = await payload.find({
    collection: 'wishlists',
    where: { user: { equals: user.id } },
    limit: 1,
    overrideAccess: true,
  })
  const wishlistCount = wishlists[0]?.items?.length || 0

  // 3. Fetch Default Address
  const { docs: addresses } = await payload.find({
    collection: 'addresses',
    where: { user: { equals: user.id } },
    sort: '-updatedAt',
    overrideAccess: true,
  })
  
  const defaultAddressDoc = addresses.find(a => a.isDefaultShipping) || addresses[0] || null

  // 4. Fetch Affiliate Status
  const { docs: affiliates } = await payload.find({
    collection: 'affiliates',
    where: { user: { equals: user.id } },
    limit: 1,
    overrideAccess: true,
  })
  const affiliateStatus = affiliates.length > 0 ? (affiliates[0].status || 'pending') : 'none'

  // 5. Spending overview for the current year, broken down by product category
  const currentYear = new Date().getFullYear()
  const yearStart = new Date(currentYear, 0, 1).toISOString()
  const { docs: yearOrders } = await payload.find({
    collection: 'orders',
    where: {
      owner: { equals: user.id },
      createdAt: { greater_than_equal: yearStart },
    },
    depth: 2, // populate items.product.categories
    limit: 0,
    overrideAccess: true,
  })

  const categoryTotals = new Map<string, number>()
  let shippingTotal = 0
  for (const order of yearOrders) {
    shippingTotal += (order.shippingTotal || 0)
    for (const item of order.items || []) {
      const product = typeof item.product === 'object' ? item.product : null
      const categoryName = (product?.categories?.[0] && typeof product.categories[0] === 'object')
        ? product.categories[0].name
        : t('categoryOther')
      const lineTotal = (item.price || 0) * (item.quantity || 0)
      categoryTotals.set(categoryName, (categoryTotals.get(categoryName) || 0) + lineTotal)
    }
  }
  if (shippingTotal > 0) {
    const shippingLabel = t('categoryShipping')
    categoryTotals.set(shippingLabel, (categoryTotals.get(shippingLabel) || 0) + shippingTotal)
  }

  const totalSpent = yearOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const PALETTE = ['#112a2e', '#1e5661', '#84d0d9', '#d1e8eb', '#9ca3af']
  const sortedCategories = [...categoryTotals.entries()].sort((a, b) => b[1] - a[1])
  const topCategories = sortedCategories.slice(0, 4)
  const otherTotal = sortedCategories.slice(4).reduce((sum, [, val]) => sum + val, 0)
  if (otherTotal > 0) topCategories.push([t('categoryOther'), otherTotal])

  const spending = {
    year: currentYear,
    totalSpent,
    categories: topCategories.map(([label, value], i) => ({
      label,
      color: PALETTE[i] || PALETTE[PALETTE.length - 1],
      value,
      pct: totalSpent > 0 ? Math.round((value / totalSpent) * 100) : 0,
    })),
  }

  const stats = {
    ordersPlaced,
    wishlistCount,
    hbPoints: user.hbPoints || 0,
    memberSince: user.createdAt ? new Date(user.createdAt).getFullYear().toString() : new Date().getFullYear().toString()
  }

  const userName = user?.firstName || user?.email?.split('@')[0] || 'User'

  // Map to simple types for client component to keep it clean
  const recentOrders = orders.map(order => ({
    id: String(order.id),
    orderNumber: order.orderNumber || String(order.id),
    date: order.createdAt ? new Date(order.createdAt).toLocaleDateString(false ? 'es-US' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date',
    status: order.status,
    total: order.total || 0,
  }))

  const defaultAddress = defaultAddressDoc ? {
    name: `${defaultAddressDoc.firstName} ${defaultAddressDoc.lastName}`,
    street: `${defaultAddressDoc.line1}${defaultAddressDoc.line2 ? `, ${defaultAddressDoc.line2}` : ''}`,
    city: defaultAddressDoc.city,
    state: defaultAddressDoc.state,
    zip: defaultAddressDoc.postalCode,
    country: defaultAddressDoc.country,
  } : null

  return (
    <AccountOverviewClient
      stats={stats}
      recentOrders={recentOrders}
      defaultAddress={defaultAddress}
      affiliateStatus={affiliateStatus as any}
      userName={userName}
      spending={spending}
    />
  )
}
