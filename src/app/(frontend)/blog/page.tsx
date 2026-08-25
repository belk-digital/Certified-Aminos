import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { BlogIndexClient, type BlogIndexPost } from '@/components/blog/BlogIndexClient'
import { getFeaturedImageUrl, formatPostDate } from '@/lib/blog/postDisplay'
import { estimateReadingTime } from '@/lib/blog/readingTime'

export default async function BlogIndexPage() {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'blog-posts',
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 100,
    depth: 1,
  })

  const posts: BlogIndexPost[] = docs.map((post: any) => ({
    slug: post.slug,
    title: post.title,
    category: post.category || '',
    excerpt: post.excerpt || '',
    imageSrc: getFeaturedImageUrl(post),
    readTime: post.readTime || estimateReadingTime(post.content),
    date: formatPostDate(post.publishedAt || post.createdAt),
    sortDate: post.publishedAt || post.createdAt,
  }))

  return <BlogIndexClient posts={posts} />
}
