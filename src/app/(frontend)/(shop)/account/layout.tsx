import React from 'react'
import { AccountSidebar } from '@/components/account/AccountSidebar'
import { MobileSidebar } from '@/components/account/MobileSidebar'
import { AccountProfileChip } from '@/components/account/AccountProfileChip'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
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
  const user = await getPayloadUser()
  const userName = user?.firstName || user?.email?.split('@')[0] || 'User'
  const caPoints = user?.hbPoints || 0

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
    <div className="bg-[#fbfcff] min-h-screen selection:bg-black/10">
      {/* Mobile top bar + drawer (the drawer panel itself is position:fixed, so its place in the DOM doesn't affect layout) */}
      <MobileSidebar>
        <AccountSidebar affiliateStatus={affiliateStatus} />
      </MobileSidebar>

      <div className="flex">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-[280px] shrink-0 bg-navy-deep">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <AccountSidebar affiliateStatus={affiliateStatus} />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 w-full min-w-0 px-4 pt-5 pb-8 md:pt-6 md:pb-12 lg:pt-5 lg:pb-10 lg:px-10 relative z-10">
          <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-3 mb-4">
            <Link href="/shop" className="text-[10px] font-bold text-gray-400 hover:text-navy-deep flex items-center gap-1.5 uppercase tracking-widest transition-colors font-heading shrink-0">
              <ArrowLeft size={12} />
              Back to Store
            </Link>
            <AccountProfileChip userName={userName} caPoints={caPoints} />
          </div>
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </div>
      </div>
    </div>
  )
}
