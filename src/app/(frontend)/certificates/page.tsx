import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { CertificatesClient, type COA } from './CertificatesClient'
import { getOgImageUrl } from '@/lib/utils'

const slug = 'certificates'

export async function generateMetadata({
  params,
}: {
  params?: Promise<any>
}): Promise<Metadata> {
  const locale = 'en'
  const t = await getTranslations('legal.certificates')
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

export default async function CertificatesPage() {
  const locale = await getLocale()
  const t = await getTranslations('legal.certificates')
  const title = t('metaTitle')
  const description = t('metaDescription')
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'products',
    where: {
      and: [
        { coaFile: { exists: true } },
        { status: { equals: 'active' } },
      ],
    },
    limit: 500,
    depth: 1,
    locale: locale as 'en' | 'es',
    fallbackLocale: 'en',
    overrideAccess: true,
    sort: '-coaAnalyzedDate',
  })

  const dateFormatter = new Intl.DateTimeFormat(false ? 'es-US' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const coas: COA[] = docs
    .filter((doc: any) => doc.coaFile && typeof doc.coaFile === 'object' && doc.coaFile.url)
    .map((doc: any) => ({
      id: doc.id,
      product: doc.name,
      category: (doc.categories?.[0] && typeof doc.categories[0] === 'object' ? doc.categories[0].name : null) || 'Research',
      purity: typeof doc.coaPurity === 'number' ? `${doc.coaPurity}%` : null,
      batch: doc.coaBatchNumber || null,
      analyzed: doc.coaAnalyzedDate ? dateFormatter.format(new Date(doc.coaAnalyzedDate)) : null,
      coaUrl: doc.coaFile.url,
    }))

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
          { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
          { '@type': 'ListItem', position: 2, name: 'Certificates' },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <CertificatesClient coas={coas} />
    </>
  )
}
