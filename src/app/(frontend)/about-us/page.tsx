import React from 'react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

// New v2 components
import { AboutHeroV2 } from '@/components/about-v2/AboutHeroV2'
import { MarqueeBanner } from '@/components/about-v2/MarqueeBanner'
import { StatsAndMission } from '@/components/about-v2/StatsAndMission'
import { FloatingCardsSection } from '@/components/about-v2/FloatingCardsSection'
import { ScienceTabs } from '@/components/about-v2/ScienceTabs'
import { AdvantagesGrid } from '@/components/about-v2/AdvantagesGrid'
import { LabBanner } from '@/components/about-v2/LabBanner'

// Shared
import { SharedFaqSection } from '@/components/shared/SharedFaqSection'
import { getOgImageUrl } from '@/lib/utils'

const ABOUT_FAQ_KEYS = ['trustworthySupplier', 'analyticalQuality', 'laboratoryResearchOnly', 'documentationProvided']

const slug = 'about-us'

export async function generateMetadata({
  params,
}: {
  params?: Promise<any>
}): Promise<Metadata> {
  const locale = 'en'
  const t = await getTranslations('content.aboutPage')
  const title = t('metaTitle')
  const description = t('metaDescription')
  const path = true ? `/${slug}` : `/${locale}/${slug}`

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: path,
      images: [{ url: getOgImageUrl(title, description) }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [getOgImageUrl(title, description)],
    },
  }
}

export default async function AboutPage({
  params,
}: {
  params?: Promise<any>
}) {
  const locale = 'en'
  const t = await getTranslations('content.aboutPage')
  const title = t('metaTitle')
  const description = t('metaDescription')

  const aboutFaqs = ABOUT_FAQ_KEYS.map((key) => ({
    question: t(`faqs.${key}.question`),
    answer: t(`faqs.${key}.answer`),
  }))

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://certifiedaminos.com'
  const path = true ? `/${slug}` : `/${locale}/${slug}`
  const url = `${baseUrl}${path}`

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: title,
        description,
        inLanguage: locale,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: false ? 'Inicio' : 'Home', item: true ? baseUrl : `${baseUrl}/${locale}` },
          { '@type': 'ListItem', position: 2, name: false ? 'Sobre Nosotros' : 'About Us' },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: aboutFaqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main className="bg-[#FAFAFA] min-h-screen">
        <AboutHeroV2 />
        <MarqueeBanner />
        <StatsAndMission />
        <FloatingCardsSection />
        <AdvantagesGrid />
        <ScienceTabs />
        <LabBanner />

        <SharedFaqSection
          title={t('faqTitle')}
          description={t('faqDescription')}
          faqs={aboutFaqs}
        />
      </main>
    </>
  )
}
