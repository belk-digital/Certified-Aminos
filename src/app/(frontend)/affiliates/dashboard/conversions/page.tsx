import { getPayloadUser } from '@/lib/auth/getPayloadUser'
import { getPayload } from 'payload'
import config from '@payload-config'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { ConversionsClient } from './ConversionsClient'

export async function generateMetadata() {
  const t = await getTranslations('affiliate.conversions')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function AffiliateConversionsPage() {
  const user = await getPayloadUser()
  
  if (!user) {
    redirect('/login')
  }

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'affiliates',
    where: { user: { equals: user.id } },
    limit: 1,
    overrideAccess: true,
  })

  const affiliate = result.docs[0]
  if (!affiliate || affiliate.status !== 'approved') {
    redirect('/affiliates/dashboard')
  }

  const conversionsRes = await payload.find({
    collection: 'affiliate-conversions',
    where: { affiliate: { equals: affiliate.id } },
    sort: '-createdAt',
    limit: 0,
    depth: 1,
    overrideAccess: true,
  })

  const mappedConversions = conversionsRes.docs.map(conv => {
    const orderObj = typeof conv.order === 'object' ? conv.order : null;
    const displayId = orderObj?.orderNumber || orderObj?.id || conv.order || conv.id;
    return {
      id: String(displayId),
      date: new Date(conv.approvedAt || conv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      orderValue: conv.orderSubtotal || conv.eligibleSubtotal || 0,
      commissionAmount: conv.commissionAmount || 0,
      status: conv.status || 'pending',
    }
  })

  return (
    <ConversionsClient conversions={mappedConversions} />
  )
}
