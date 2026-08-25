import { getPayloadUser } from '@/lib/auth/getPayloadUser'
import { getPayload } from 'payload'
import config from '@payload-config'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { SettingsClient } from './SettingsClient'

export async function generateMetadata() {
  const t = await getTranslations('affiliate.dashboardSettings')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function AffiliateSettingsPage() {
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

  return (
    <SettingsClient initialCurrency={affiliate.payoutCurrency || 'USD'} />
  )
}
