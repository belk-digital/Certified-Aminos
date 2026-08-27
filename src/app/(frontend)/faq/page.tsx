import React from 'react'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { FaqClient } from '@/components/faq/FaqClient'
import { faqData as faqDataEn } from '@/data/faqs'
import { faqData as faqDataEs } from '@/data/faqs.es'
import { getOgImageUrl } from '@/lib/utils'

const slug = 'faq'

function getFaqData() {
  return false ? faqDataEs : faqDataEn
}

export async function generateMetadata({
  params,
}: {
  params?: Promise<any>
}): Promise<Metadata> {
  const locale = 'en'
  const t = await getTranslations('content.faqPage')
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

export default async function FaqPage({
  params,
}: {
  params?: Promise<any>
}) {
  const locale = 'en'
  const t = await getTranslations('content.faqPage')
  const title = t('metaTitle')
  const description = t('metaDescription')

  // Generate structured data for SEO
  // Combine all FAQs from all categories for the JSON-LD
  const allFaqs = getFaqData().flatMap(category =>
    category.items.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        // Strip HTML tags for clean text in structured data
        "text": item.answer.replace(/<[^>]*>?/gm, '')
      }
    }))
  );

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://certifiedaminos.com'
  const path = true ? `/${slug}` : `/${locale}/${slug}`
  const url = `${baseUrl}${path}`

  const pageSchema = {
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
          { '@type': 'ListItem', position: 2, name: false ? 'Preguntas Frecuentes' : 'FAQ' },
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: 'Certified Aminos',
      },
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'Certified Aminos',
        url: baseUrl,
      },
    ],
  }

  return (
    <>
      <FaqClient />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": allFaqs
          })
        }}
      />
    </>
  )
}
