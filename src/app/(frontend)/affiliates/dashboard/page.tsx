import React from 'react'
import { redirect } from 'next/navigation'
import { DashboardClient } from './DashboardClient'
import { getPayloadUser } from '@/lib/auth/getPayloadUser'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('affiliate.dashboard')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function AffiliateDashboardOverview() {
  const t = await getTranslations('affiliate.sidebar')
  const user = await getPayloadUser()
  if (!user) redirect('/login')

  const payload = await getPayload({ config })
  
  // 1. Fetch Affiliate Record
  const { docs: affiliates } = await payload.find({
    collection: 'affiliates',
    where: { user: { equals: user.id } },
    limit: 1,
    overrideAccess: true,
  })

  if (affiliates.length === 0 || affiliates[0].status !== 'approved') {
    redirect('/affiliates')
  }

  const affiliate = affiliates[0]
  const userName = affiliate.displayName || user?.firstName || user?.email?.split('@')[0] || t('defaultPartnerName')
  const tier = affiliate.tier || 'standard'

  // 2. Fetch Recent Conversions
  const { docs: conversions } = await payload.find({
    collection: 'affiliate-conversions',
    where: { affiliate: { equals: affiliate.id } },
    sort: '-createdAt',
    limit: 5,
    depth: 1,
    overrideAccess: true,
  })

  // 3. Format Stats
  const stats = {
    totalClicks: affiliate.totalClicks || 0,
    totalConversions: affiliate.totalConversions || 0,
    conversionRate: affiliate.totalClicks ? `${((affiliate.totalConversions || 0) / affiliate.totalClicks * 100).toFixed(1)}%` : '0.0%',
    totalCommissionPending: affiliate.totalCommissionPending || 0,
    totalCommissionApproved: affiliate.totalCommissionApproved || 0,
    totalCommissionPaid: affiliate.totalCommissionPaid || 0,
    referralSlug: affiliate.referralSlug || '',
    couponCode: affiliate.couponCode || '',
  }

  // 4. Format Recent Conversions
  const recentConversions = conversions.map(conv => {
    const orderObj = typeof conv.order === 'object' ? conv.order : null;
    const displayId = orderObj?.orderNumber || orderObj?.id || conv.order || conv.id;
    return {
      id: String(displayId),
      date: new Date(conv.approvedAt || conv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: conv.commissionAmount || 0,
      status: conv.status || 'pending',
    }
  })

  return (
    <DashboardClient userName={userName} tier={tier} stats={stats} recentConversions={recentConversions} />
  )
}
