import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  // Next 16 no longer runs ESLint as part of `next build` (the old `eslint.ignoreDuringBuilds`
  // option was removed from NextConfig) — lint separately with `pnpm lint`.
  images: {
    // Kept off deliberately: Vercel's Hobby plan caps Image Optimization at 1,000 unique
    // source images/month, then requests start failing. This catalog has 100+ products with
    // multiple images each, so re-enabling this on the free plan would break images sitewide
    // once traffic/catalog size grows past the quota. Revisit if/when on a paid Vercel plan
    // (or self-hosting where sharp runs uncapped — see Dockerfile, which already supports it).
    unoptimized: true,
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/**',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-4c2ad32bd46946819b7bd8c103044a10.r2.dev',
        port: '',
        pathname: '/**',
      },
      {
        // Current R2 bucket (set via R2_PUBLIC_URL) — the old hostname above is kept in
        // case any already-stored media URLs still point at it.
        protocol: 'https',
        hostname: 'pub-82f90d490a8048aa9629f0ae3ea6f567.r2.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return []
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withSentryConfig(
  withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false }),
  {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    widenClientFileUpload: true,
    tunnelRoute: '/monitoring',
    silent: !process.env.CI,
  },
)
