import { SITE_URL } from '@/lib/siteUrl'
import type { MetadataRoute } from 'next'

// Paths that exist under the application.
const LOCALIZED_PRIVATE_PATHS = [
  '/account',
  '/cart',
  '/checkout',
  '/wishlist',
  '/order-confirmation',
  '/affiliates/dashboard',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]

// Global paths
const GLOBAL_PRIVATE_PATHS = [
  '/admin',
  '/api',
  '/my-route',
  '/ref',
]

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL

  const disallow = [
    ...GLOBAL_PRIVATE_PATHS,
    ...LOCALIZED_PRIVATE_PATHS,
  ]

  return {
    rules: {
      userAgent: '*',
      // /api/og serves the social/share preview images referenced by og:image — must stay crawlable
      // (the longer path wins over the /api disallow below).
      allow: ['/', '/api/og'],
      disallow,
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
