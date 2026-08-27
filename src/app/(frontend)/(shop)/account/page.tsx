import React from 'react'
import { Metadata } from 'next'
import { AccountOverviewClient } from './AccountOverviewClient'
import { getPayloadUser } from '@/lib/auth/getPayloadUser'
import { getPayload } from 'payload'
import config from '@payload-config'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('account.overview')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

const getImageUrl = (product: any): string | null => {
  const img = product?.images?.[0]?.image
  return typeof img === 'object' && img?.url ? img.url : null
}

export default async function AccountOverviewPage() {
  const user = await getPayloadUser()
  if (!user) redirect('/login')

  const payload = await getPayload({ config })

  // 1. Fetch Orders (recent, with product images for the ledger thumbnails)
  const { docs: orders, totalDocs: ordersPlaced } = await payload.find({
    collection: 'orders',
    where: { owner: { equals: user.id } },
    sort: '-createdAt',
    limit: 4,
    depth: 1,
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

  // 5. Annual spending, broken down by month, for the line chart
  const currentYear = new Date().getFullYear()
  const yearStart = new Date(currentYear, 0, 1).toISOString()
  const { docs: yearOrders } = await payload.find({
    collection: 'orders',
    where: {
      owner: { equals: user.id },
      createdAt: { greater_than_equal: yearStart },
    },
    depth: 0,
    limit: 0,
    overrideAccess: true,
  })

  const monthlyTotals = Array(12).fill(0)
  for (const order of yearOrders) {
    if (!order.createdAt) continue
    const month = new Date(order.createdAt).getMonth()
    monthlyTotals[month] += order.total || 0
  }

  const totalSpent = yearOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const spending = {
    year: currentYear,
    totalSpent,
    months: MONTH_LABELS.map((label, i) => ({ label, value: monthlyTotals[i] })),
  }

  const stats = {
    ordersPlaced,
    wishlistCount,
    caPoints: user.hbPoints || 0,
    memberSince: user.createdAt ? new Date(user.createdAt).getFullYear().toString() : new Date().getFullYear().toString()
  }

  const userName = user?.firstName || user?.email?.split('@')[0] || 'User'

  const recentOrders = orders.map(order => {
    const firstItem = order.items?.[0]
    const product = typeof firstItem?.product === 'object' ? firstItem.product : null
    return {
      id: String(order.id),
      orderNumber: order.orderNumber || String(order.id),
      date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date',
      status: order.status,
      total: order.total || 0,
      imageUrl: getImageUrl(product),
      itemCount: order.items?.length || 0,
    }
  })

  const defaultAddress = defaultAddressDoc ? {
    name: `${defaultAddressDoc.firstName} ${defaultAddressDoc.lastName}`,
    street: `${defaultAddressDoc.line1}${defaultAddressDoc.line2 ? `, ${defaultAddressDoc.line2}` : ''}`,
    city: defaultAddressDoc.city,
    state: defaultAddressDoc.state,
    zip: defaultAddressDoc.postalCode,
    country: defaultAddressDoc.country,
    phone: defaultAddressDoc.phone || null,
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
