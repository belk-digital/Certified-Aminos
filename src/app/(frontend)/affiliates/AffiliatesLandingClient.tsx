'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { SharedFaqSection } from '@/components/shared/SharedFaqSection'
import { AffiliatesHero } from '@/components/affiliates-v2/AffiliatesHero'
import { AffiliatesMarquee } from '@/components/affiliates-v2/AffiliatesMarquee'
import { AffiliatesStatsAndMission } from '@/components/affiliates-v2/AffiliatesStatsAndMission'
import { AffiliatesStepsStack } from '@/components/affiliates-v2/AffiliatesStepsStack'
import { AffiliatesWhyGrid } from '@/components/affiliates-v2/AffiliatesWhyGrid'
import { AffiliatesToolsTabs } from '@/components/affiliates-v2/AffiliatesToolsTabs'
import { AffiliatesCommissionBanner } from '@/components/affiliates-v2/AffiliatesCommissionBanner'
import { AffiliatesStandards } from '@/components/affiliates-v2/AffiliatesStandards'
import { AffiliatesApplyForm } from '@/components/affiliates-v2/AffiliatesApplyForm'
import { AffiliatesFinalCta } from '@/components/affiliates-v2/AffiliatesFinalCta'

const FAQ_KEYS = [
  'faq1', 'faq2', 'faq3', 'faq4', 'faq5', 'faq6', 'faq7', 'faq8', 'faq9', 'faq10', 'faq11', 'faq12', 'faq13',
] as const

export type UserAffiliateStatus = 'guest' | 'user' | 'pending_application' | 'affiliate_approved' | 'affiliate_pending' | 'affiliate_rejected'

interface Props {
  userStatus: UserAffiliateStatus;
}

export function AffiliatesLandingClient({ userStatus }: Props) {
  const t = useTranslations('affiliate.landing')

  const scrollToApply = (e?: React.MouseEvent) => {
    e?.preventDefault()
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="bg-[#FAFAFA] min-h-screen">
      <AffiliatesHero onApplyClick={scrollToApply} />
      <AffiliatesMarquee />
      <AffiliatesStatsAndMission />
      <AffiliatesStepsStack />
      <AffiliatesWhyGrid />
      <AffiliatesToolsTabs />
      <AffiliatesCommissionBanner onApplyClick={scrollToApply} />
      <AffiliatesStandards />
      <AffiliatesApplyForm userStatus={userStatus} />

      <SharedFaqSection
        title={t('faqTitle')}
        subtitle={t('faqSubtitle')}
        faqs={FAQ_KEYS.map((key) => ({ question: t(`${key}Question`), answer: t(`${key}Answer`) }))}
      />

      <AffiliatesFinalCta onApplyClick={scrollToApply} />
    </main>
  )
}
