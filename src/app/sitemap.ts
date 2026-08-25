import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import * as Sentry from '@sentry/nextjs'

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://helixbiochem.com'

// Grouped by crawl priority rather than alphabetically, so the sitemap's own ordering
// reflects which pages matter most (highest first) — homepage/shop first, then core
// conversion-adjacent pages, then supporting/legal pages.
const STATIC_PATHS: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '', priority: 1.0, changeFrequency: 'daily' },
  { path: '/shop', priority: 0.9, changeFrequency: 'daily' },
  { path: '/blog', priority: 0.8, changeFrequency: 'daily' },
  { path: '/peptide-calculator', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/certificates', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/about-us', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/affiliates', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/contact-us', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms-and-conditions', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/refund-policy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/shipping-policy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/medical-disclaimer', priority: 0.3, changeFrequency: 'yearly' },
]

function entry(
  path: string,
  opts?: { lastModified?: Date; priority?: number; changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency'] },
) {
  return {
    url: `${baseUrl}${path}`,
    lastModified: opts?.lastModified || new Date(),
    ...(opts?.priority !== undefined ? { priority: opts.priority } : {}),
    ...(opts?.changeFrequency ? { changeFrequency: opts.changeFrequency } : {}),
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  for (const { path, priority, changeFrequency } of STATIC_PATHS) {
    entries.push(entry(path, { priority, changeFrequency }))
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const { docs: products } = await payload.find({
      collection: 'products',
      where: { status: { equals: 'active' } },
      limit: 1000,
      depth: 0,
    })

    for (const product of products) {
      const path = `/product/${product.slug}`
      const lastModified = product.updatedAt ? new Date(product.updatedAt) : undefined
      entries.push(entry(path, { lastModified, priority: 0.8, changeFrequency: 'weekly' }))
    }
  } catch (error) {
    console.error('sitemap: failed to fetch products', error)
    Sentry.captureException(error, { tags: { route: 'sitemap.xml' } })
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const { docs: posts } = await payload.find({
      collection: 'blog-posts',
      where: { status: { equals: 'published' } },
      limit: 1000,
      depth: 0,
    })

    for (const post of posts) {
      const path = `/${post.slug}`
      const lastModified = post.updatedAt ? new Date(post.updatedAt) : undefined
      entries.push(entry(path, { lastModified, priority: 0.6, changeFrequency: 'monthly' }))
    }
  } catch (error) {
    console.error('sitemap: failed to fetch blog posts', error)
    Sentry.captureException(error, { tags: { route: 'sitemap.xml' } })
  }

  return entries
}
