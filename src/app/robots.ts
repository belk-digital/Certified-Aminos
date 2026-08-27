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
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://certifiedaminos.com'

  const disallow = [
    ...GLOBAL_PRIVATE_PATHS,
    ...LOCALIZED_PRIVATE_PATHS,
  ]

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow,
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
