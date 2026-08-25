import { config } from 'dotenv'
config({ path: '.env.local' })
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function run() {
  const payload = await getPayload({ config: configPromise })
  const slug = 'bpc-157-recovery-research-overview'
  const { docs } = await payload.find({ collection: 'blog-posts', where: { slug: { equals: slug } }, limit: 1 })
  if (!docs[0]) {
    console.log('Not found:', slug)
    process.exit(0)
  }
  const post = docs[0]
  await payload.delete({ collection: 'blog-posts', id: post.id })
  console.log('Deleted blog post:', slug)

  // Clean up the featured image + author photo that were only used by this test post
  if (post.featuredImage) {
    const imgId = typeof post.featuredImage === 'object' ? post.featuredImage.id : post.featuredImage
    const { docs: usedElsewhere } = await payload.find({ collection: 'blog-posts', where: { featuredImage: { equals: imgId } }, limit: 1 })
    if (usedElsewhere.length === 0) {
      await payload.delete({ collection: 'blog-media', id: imgId })
      console.log('Deleted unused featured image:', imgId)
    }
  }
  process.exit(0)
}
run().catch((e) => { console.error(e); process.exit(1) })
