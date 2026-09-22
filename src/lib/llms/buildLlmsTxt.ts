import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SITE_URL } from '@/lib/siteUrl'

/**
 * Builds the body of /llms.txt and /llms-full.txt: the hand-written copy (with {{SITE_URL}} placeholders)
 * plus a live product catalog and published-article list from the database, so the file never goes stale
 * as products/posts change. Sections are spliced in just before the next known heading; if a heading is
 * ever renamed the section is simply appended, never dropped.
 */

const oneLine = (text: string | null | undefined, max = 160): string => {
  const flat = (text || '').replace(/\s+/g, ' ').trim()
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat
}

async function buildCatalogSections(): Promise<{ products: string; posts: string }> {
  try {
    const payload = await getPayload({ config: configPromise })

    const { docs: products } = await payload.find({
      collection: 'products',
      where: { status: { equals: 'active' } },
      sort: 'name',
      limit: 1000,
      depth: 0,
    })
    const { docs: posts } = await payload.find({
      collection: 'blog-posts',
      where: { status: { equals: 'published' } },
      sort: '-publishedAt',
      limit: 500,
      depth: 0,
    })

    const productLines = products
      .filter((p: any) => p.slug && p.name)
      .map((p: any) => {
        const desc = oneLine(p.description)
        return `- [${p.name}](${SITE_URL}/product/${p.slug})${desc ? `: ${desc}` : ''}`
      })
    const postLines = posts
      .filter((p: any) => p.slug && p.title)
      .map((p: any) => {
        const desc = oneLine(p.excerpt)
        return `- [${p.title}](${SITE_URL}/${p.slug})${desc ? `: ${desc}` : ''}`
      })

    return {
      products: productLines.length
        ? `## Products (${productLines.length} active)\n\nEach product page lists purity specs, available sizes/prices, and Certificate of Analysis links.\n\n${productLines.join('\n')}\n\n`
        : '',
      posts: postLines.length ? `## Published Articles\n\n${postLines.join('\n')}\n\n` : '',
    }
  } catch (error) {
    // Never fail the whole file over a DB hiccup — the hand-written copy is still useful on its own.
    console.error('llms.txt: failed to load catalog', error)
    return { products: '', posts: '' }
  }
}

function insertBefore(text: string, heading: string, section: string): string {
  if (!section) return text
  const idx = text.indexOf(heading)
  return idx === -1 ? `${text.trimEnd()}\n\n${section}` : `${text.slice(0, idx)}${section}${text.slice(idx)}`
}

export async function buildLlmsTxt(template: string): Promise<string> {
  const { products, posts } = await buildCatalogSections()
  let body = template.split('{{SITE_URL}}').join(SITE_URL)
  body = insertBefore(body, '## Research Guides & Blog', products)
  body = insertBefore(body, '## FAQ', posts)
  return body
}

export const LLMS_RESPONSE_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
}
