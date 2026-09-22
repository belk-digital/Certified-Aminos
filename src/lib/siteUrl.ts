/**
 * Canonical public origin used for every SEO surface (canonicals, sitemap, robots, OG/JSON-LD URLs).
 * The apex domain 308-redirects to www, so www is the canonical host.
 *
 * NEXT_PUBLIC_SERVER_URL is honoured (local dev, Vercel previews), but on the production deployment
 * a *.vercel.app or localhost value is ignored — otherwise search engines and LLMs would be told the
 * site lives on the Vercel hostname instead of the real domain.
 */
export const CANONICAL_SITE_URL = 'https://www.certified-aminos.com'

function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SERVER_URL?.trim().replace(/\/+$/, '')
  if (!configured) return CANONICAL_SITE_URL

  const isProductionDeployment = process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV !== 'preview'
  if (isProductionDeployment && /(^|\.)vercel\.app|localhost|127\.0\.0\.1/i.test(configured)) {
    return CANONICAL_SITE_URL
  }
  return configured
}

export const SITE_URL = resolveSiteUrl()
