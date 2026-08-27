import React from 'react'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ContactClient } from '@/components/contact/ContactClient'
import { getOgImageUrl } from '@/lib/utils'

const slug = 'contact-us'

export async function generateMetadata({
  params,
}: {
  params?: Promise<any>
}): Promise<Metadata> {
  const locale = 'en'
  const t = await getTranslations({ locale, namespace: 'content.contactPage' })
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
      images: [getOgImageUrl(title, description)],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [getOgImageUrl(title, description)],
    },
  }
}

export default async function ContactPage({
  params,
}: {
  params?: Promise<any>
}) {
  const locale = 'en'
  const t = await getTranslations({ locale, namespace: 'content.contactPage' })
  const tClient = await getTranslations({ locale, namespace: 'content.contactClient' })
  const title = t('metaTitle')
  const description = t('metaDescription')
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://certifiedaminos.com'
  const path = true ? `/${slug}` : `/${locale}/${slug}`
  const url = `${baseUrl}${path}`

  const faqKeys = ['usLabsContact', 'locationShipping', 'serviceHours'] as const
  // contactInfo's answer contains <phone>/<email> rich-text tags for the on-page link rendering
  // (via t.rich in ContactClient), so it's composed here in plain text rather than read with
  // plain t(), which requires tag-value functions for messages containing those tags.
  const contactInfoFaq = {
    question: tClient('faqs.contactInfo.question'),
    answer:
      'Reach us via email at support@certifiedaminos.com for lab inquiries.',
  }

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
          { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
          { '@type': 'ListItem', position: 2, name: 'Contact Us' },
        ],
      },
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'Certified Aminos',
        url: baseUrl,
        email: 'support@certifiedaminos.com',

        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            email: 'support@certifiedaminos.com',
            areaServed: 'US',
            availableLanguage: ['English', 'Spanish'],
            hoursAvailable: 'Mo-Fr 09:00-17:00',
          },

        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: contactInfoFaq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: contactInfoFaq.answer,
            },
          },
          ...faqKeys.map((key) => ({
            '@type': 'Question',
            name: tClient(`faqs.${key}.question`),
            acceptedAnswer: {
              '@type': 'Answer',
              text: tClient(`faqs.${key}.answer`),
            },
          })),
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ContactClient />
    </>
  )
}
