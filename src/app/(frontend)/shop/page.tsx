import React from 'react'
import { ShopClient } from '@/components/shop/ShopClient'
import { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getTranslations } from 'next-intl/server'
import { getShopProducts } from '../(shop)/actions'
import { getOgImageUrl } from '@/lib/utils'

const SHOP_FAQ_KEYS = [
  'availablePeptides',
  'purityQualityTested',
  'standardPurityLevels',
  'interpretCoa',
  'customSynthesis',
  'storageInstructions',
  'reconstitution',
  'shelfLife',
  'shippingDamage',
  'aliquotAfterReconstitution',
  'orderDocumentation',
  'orderQuantities',
  'coaBeforeOrdering',
  'findSpecificPeptides',
  'productPageInfo',
  'manufacturedInUsa',
  'researchUseOnlyMeaning',
  'specialHandling',
  'nonResearchUse',
  'fdaApproval',
]

const title = 'Research Peptides Shop | Lab-Verified Purity | Helix Bio'
const description = 'Shop research peptides online with verified COA on every batch, 99% purity, and fast USA shipping. Browse the Helix Bio catalog and order today.'

export async function generateMetadata({
  params,
}: {
  params?: Promise<any>
}): Promise<Metadata> {
  const locale = 'en'
  const path = true ? '/shop' : `/${locale}/shop`

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
      images: [{ url: getOgImageUrl('Shop Peptides', description) }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [getOgImageUrl('Shop Peptides', description)],
    },
  }
}

export const dynamic = 'force-dynamic'

export default async function ShopPage() {
  let categories: any[] = []
  let dbError = null

  try {
    const payload = await getPayload({ config: configPromise })

    // Fetch all categories for the sidebar
    const categoriesRes = await payload.find({
      collection: 'categories',
      where: { isVisible: { equals: true } },
      limit: 100,
      sort: 'name',
      overrideAccess: true,
    })

    categories = categoriesRes.docs.map(cat => ({
      id: cat.id as string | number,
      name: cat.name,
      slug: cat.slug || ''
    }))
  } catch (error: any) {
    console.error("DB Connection Error on /shop:", error)
    dbError = error.message || 'Unknown database error'
  }

  // Fetch initial page of products
  const initialProductsRes = await getShopProducts({ page: 1, limit: 24 })

  if (dbError) {
    return (
      <div className="min-h-screen bg-white pt-32 px-6 flex flex-col items-center">
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl max-w-2xl w-full">
          <h2 className="text-xl font-bold mb-2">Database Connection Error</h2>
          <p className="mb-4">The shop page crashed because it couldn't connect to Supabase on Vercel.</p>
          <pre className="bg-red-100 p-4 rounded-lg overflow-x-auto text-xs font-mono">{dbError}</pre>
        </div>
      </div>
    )
  }

  const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://helixbiochem.com'

  const t = await getTranslations('shop.shopClient')
  const shopFaqs = SHOP_FAQ_KEYS.map((key) => ({
    question: t(`faqs.${key}.question`),
    answer: t(`faqs.${key}.answer`),
  }))

  return (
    <>
      <ShopClient
        initialProducts={initialProductsRes.success ? (initialProductsRes.products as any) : []}
        totalPages={initialProductsRes.success ? initialProductsRes.totalPages : 0}
        categories={categories}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebPage',
                '@id': `${siteUrl}/shop#webpage`,
                url: `${siteUrl}/shop`,
                name: title,
                description,
              },
              {
                '@type': 'CollectionPage',
                '@id': `${siteUrl}/shop#collectionpage`,
                url: `${siteUrl}/shop`,
                name: title,
                description,
              },
              {
                '@type': 'BreadcrumbList',
                '@id': `${siteUrl}/shop#breadcrumb`,
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
                  { '@type': 'ListItem', position: 2, name: 'Shop', item: `${siteUrl}/shop` },
                  { '@type': 'ListItem', position: 3, name: 'All Research Peptides', item: `${siteUrl}/shop` },
                ],
              },
              {
                '@type': 'WebSite',
                '@id': `${siteUrl}/#website`,
                url: siteUrl,
                name: 'Helix Bio',
              },
              {
                '@type': 'Organization',
                '@id': `${siteUrl}/#organization`,
                name: 'Helix Bio',
                url: siteUrl,
                description: 'USA-based supplier of research-use-only synthetic peptides for laboratory research.',
              },
              {
                '@type': 'FAQPage',
                '@id': `${siteUrl}/shop#faq`,
                mainEntity: shopFaqs.map((faq) => ({
                  '@type': 'Question',
                  name: faq.question,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.answer,
                  },
                })),
              },
            ],
          }),
        }}
      />
    </>
  )
}
