import React from 'react'
import { AccountTopNav } from '@/components/account/AccountTopNav'
import { getPayloadUser } from '@/lib/auth/getPayloadUser'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('account.layout')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('account.layout')
  const user = await getPayloadUser()
  const userName = user?.firstName || user?.email?.split('@')[0] || 'User'
  const hbPoints = user?.hbPoints || 0

  let affiliateStatus: 'none' | 'pending' | 'approved' | 'rejected' | 'suspended' = 'none'
  if (user) {
    const payload = await getPayload({ config })
    const { docs: affiliates } = await payload.find({
      collection: 'affiliates',
      where: { user: { equals: user.id } },
      limit: 1,
      overrideAccess: true,
    })
    if (affiliates.length > 0) {
      affiliateStatus = affiliates[0].status || 'pending'
    }
  }

  return (
    <div className="bg-[#fbfcff] min-h-screen selection:bg-black/10 flex flex-col relative overflow-hidden">
      
      {/* Top Navigation (Replaces Sidebar) */}
      <AccountTopNav userName={userName} hbPoints={hbPoints} affiliateStatus={affiliateStatus} />

      {/* Main Content Area (Full Width) */}
      <div className="flex-1 w-full min-w-0 px-4 py-8 md:py-12 lg:py-16 relative z-10">
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
