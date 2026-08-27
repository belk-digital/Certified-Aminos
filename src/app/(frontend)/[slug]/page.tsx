import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { FadeUp } from '@/components/motion/FadeUp'
import { BlogPostCard } from '@/components/editorial/BlogPostCard'
import { StaggerChildren } from '@/components/motion/StaggerChildren'
import { ReadingProgress } from '@/components/editorial/ReadingProgress'
import { TableOfContents } from '@/components/editorial/TableOfContents'
import { BlogPostHero } from '@/components/blog/BlogPostHero'
import { PostRichText } from '@/components/blog/PostRichText'
import { KeyTakeaways } from '@/components/blog/KeyTakeaways'
import { FaqAccordion } from '@/components/blog/FaqAccordion'
import { ReferencesList } from '@/components/blog/ReferencesList'
import { AuthorCard } from '@/components/blog/AuthorCard'
import { RelatedProductsSlider } from '@/components/blog/RelatedProductsSlider'
import { estimateReadingTime } from '@/lib/blog/readingTime'
import { splitFirstParagraph } from '@/lib/blog/splitContent'
import { getFeaturedImageUrl, formatPostDate, FALLBACK_BLOG_IMAGE as FALLBACK_IMAGE } from '@/lib/blog/postDisplay'
import { encodeImageUrl, getOgImageUrl, toAbsoluteUrl } from '@/lib/utils'

async function getPost(slug: string) {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'blog-posts',
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
    },
    limit: 1,
    depth: 2,
  })
  return docs[0] || null
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'blog-posts',
    where: { status: { equals: 'published' } },
    limit: 200,
    depth: 0,
  })
  return docs.map((post: any) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    return { title: 'Post Not Found | Certified Aminos' }
  }

  const title = `${post.title} | Certified Aminos`
  const description = post.excerpt || ''
  const path = `/${slug}`
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://certifiedaminos.com'
  const imageUrl = toAbsoluteUrl(baseUrl, getFeaturedImageUrl(post))
  const payload = await getPayload({ config: configPromise })
  const authorProfile = await payload.findGlobal({ slug: 'blog-author-profile' })
  const authorName = authorProfile?.name || 'Certified Aminos Team'
  const publishedIso = post.publishedAt
    ? new Date(post.publishedAt).toISOString()
    : new Date(post.createdAt).toISOString()
  const modifiedIso = post.updatedAt ? new Date(post.updatedAt).toISOString() : publishedIso

  return {
    title,
    description,
    keywords: post.keywords
      ? post.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
      : undefined,
    authors: [{ name: authorName }],
    publisher: 'Certified Aminos',
    robots: { index: true, follow: true },
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      type: 'article',
      url: path,
      siteName: 'Certified Aminos',
      publishedTime: publishedIso,
      modifiedTime: modifiedIso,
      authors: [authorName],
      images: imageUrl.startsWith('http') ? [{ url: imageUrl }] : [getOgImageUrl(title, description)],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  const [{ docs: relatedDocs }, authorProfile] = await Promise.all([
    payload.find({
      collection: 'blog-posts',
      where: {
        and: [
          { slug: { not_equals: slug } },
          { status: { equals: 'published' } },
          ...(post.category ? [{ category: { equals: post.category } }] : []),
        ],
      },
      sort: '-publishedAt',
      limit: 3,
      depth: 1,
    }),
    payload.findGlobal({ slug: 'blog-author-profile' }),
  ])

  let relatedPosts = relatedDocs
  if (relatedPosts.length === 0) {
    const { docs } = await payload.find({
      collection: 'blog-posts',
      where: { and: [{ slug: { not_equals: slug } }, { status: { equals: 'published' } }] },
      sort: '-publishedAt',
      limit: 3,
      depth: 1,
    })
    relatedPosts = docs
  }

  const readTime = post.readTime || estimateReadingTime(post.content)
  const publishedDate = formatPostDate(post.publishedAt || post.createdAt)
  const featuredImageUrl = getFeaturedImageUrl(post)

  const relatedProducts = (post.relatedProducts || []).filter(
    (p: any) => typeof p === 'object',
  )

  // Products don't always have top-level images — many only have per-variant images
  // (e.g. BAC Water's 3mL/10mL/30mL variants), so fall back to the first variant image.
  function getProductImageUrl(product: any): string {
    const direct = product.images?.[0]?.image
    const variantImage = product.variants?.find((v: any) => v.images?.length > 0)?.images?.[0]?.image
    const image = (direct && typeof direct === 'object' ? direct : null) || (variantImage && typeof variantImage === 'object' ? variantImage : null)
    return image?.url ? encodeImageUrl(image.url) : FALLBACK_IMAGE
  }

  const sliderProducts = relatedProducts.slice(0, 6).map((product: any) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    image: getProductImageUrl(product),
    category: typeof product.categories?.[0] === 'object' ? product.categories[0].title : '',
    price: Number(product.price || 0).toFixed(2),
  }))

  const { first: introContent, rest: restContent } = splitFirstParagraph(post.content)

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://certifiedaminos.com'
  const postUrl = `${baseUrl}/${slug}`
  const isoDate = post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date(post.createdAt).toISOString()

  const productSchemas = relatedProducts.map((product: any) => {
    const productUrl = `${baseUrl}/product/${product.slug}`
    const price = Number(product.salePrice || product.price || 0)
    // getProductImageUrl already returns a fully-encoded URL (via encodeImageUrl) —
    // wrapping it in encodeURI again would double-encode already-escaped characters.
    const productImage = toAbsoluteUrl(baseUrl, getProductImageUrl(product))

    return {
      '@type': 'Product',
      '@id': `${productUrl}#product`,
      name: product.name,
      description: product.seoDescription || product.description || undefined,
      image: productImage,
      sku: product.sku || String(product.id),
      url: productUrl,
      brand: { '@type': 'Brand', name: 'Certified Aminos' },
      offers: {
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: 'USD',
        price: price.toFixed(2),
        availability:
          product.stock && product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
    }
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${postUrl}#article`,
        headline: post.title,
        description: post.excerpt,
        // featuredImageUrl is already fully encoded (via encodeImageUrl) and may already
        // be an absolute R2 URL — only prefix baseUrl if it's relative, never re-encode.
        image: toAbsoluteUrl(baseUrl, featuredImageUrl),
        datePublished: isoDate,
        dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : isoDate,
        articleSection: post.category || undefined,
        keywords: post.keywords || undefined,
        author: {
          '@type': 'Person',
          name: authorProfile?.name || 'Certified Aminos Team',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Certified Aminos',
          logo: { '@type': 'ImageObject', url: `${baseUrl}/logo.png` },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
        ...(productSchemas.length > 0
          ? { mentions: productSchemas.map((p) => ({ '@id': p['@id'] })) }
          : {}),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${postUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
          { '@type': 'ListItem', position: 2, name: 'Research Blog', item: `${baseUrl}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title, item: postUrl },
        ],
      },
      ...(post.faqs && post.faqs.length > 0
        ? [
            {
              '@type': 'FAQPage',
              mainEntity: post.faqs.map((faq: any) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: { '@type': 'Answer', text: faq.answer },
              })),
            },
          ]
        : []),
      ...productSchemas,
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="bg-[#FAFAFA] min-h-screen pb-32">
        <ReadingProgress />

        <BlogPostHero
          title={post.title}
          excerpt={post.excerpt ?? undefined}
          category={post.category ?? undefined}
          date={publishedDate}
          readTime={readTime}
          imageSrc={featuredImageUrl}
          imageAlt={post.title}
        />

        {/* Two Column Layout for Desktop (TOC + Content) */}
        <div className="px-6 max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12 xl:gap-24 pt-8">
          <aside className="hidden lg:block relative">
            <TableOfContents />
          </aside>

          <article className="max-w-[820px] w-full mx-auto lg:mx-0 space-y-10">
            <FadeUp>
              <div className="space-y-10">
                {post.keyTakeaways && post.keyTakeaways.length > 0 && (
                  <KeyTakeaways items={post.keyTakeaways.map((t: any) => t.text)} />
                )}

                {introContent && <PostRichText content={introContent} />}

                {sliderProducts.length > 0 && <RelatedProductsSlider products={sliderProducts} />}

                <PostRichText content={restContent} />

                {post.faqs && post.faqs.length > 0 && (
                  <div className="pt-4">
                    <span className="text-label-md uppercase tracking-wider text-gold-dark mb-2 block">
                      Got Questions?
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-heading font-black text-ink uppercase tracking-tight leading-[1.1] mb-6">
                      Frequently Asked Questions
                    </h3>
                    <FaqAccordion faqs={post.faqs} />
                  </div>
                )}

                {post.references && post.references.length > 0 && (
                  <div className="pt-8 border-t border-ink/10">
                    <span className="text-label-md uppercase tracking-wider text-ink-muted mb-4 block">
                      References
                    </span>
                    <ReferencesList references={post.references} />
                  </div>
                )}

                <AuthorCard
                  name={authorProfile?.name || 'Certified Aminos Team'}
                  title={authorProfile?.title ?? undefined}
                  bio={authorProfile?.bio ?? undefined}
                  credentials={authorProfile?.credentials ?? undefined}
                  photoUrl={
                    authorProfile?.photo && typeof authorProfile.photo === 'object'
                      ? encodeImageUrl((authorProfile.photo as any).url)
                      : undefined
                  }
                />
              </div>
            </FadeUp>
          </article>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="px-6 max-w-[1440px] mx-auto mt-24 pt-16 border-t border-ink/10">
            <div className="mb-12">
              <span className="text-label-md uppercase tracking-wider text-gold-dark mb-2 block">
                Related
              </span>
              <h3 className="text-editorial-lg font-heading font-black text-ink normal-case">
                Continue reading
              </h3>
            </div>

            <StaggerChildren staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost: any) => (
                <div key={relatedPost.slug} className="h-full">
                  <BlogPostCard
                    slug={relatedPost.slug}
                    title={relatedPost.title}
                    category={relatedPost.category}
                    excerpt={relatedPost.excerpt}
                    imageSrc={getFeaturedImageUrl(relatedPost)}
                    readTime={relatedPost.readTime || estimateReadingTime(relatedPost.content)}
                  />
                </div>
              ))}
            </StaggerChildren>
          </section>
        )}
      </main>
    </>
  )
}
