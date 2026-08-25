import { config } from 'dotenv'
config({ path: '.env.local' })
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

const MIME_BY_EXT: Record<string, string> = {
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.avif': 'image/avif',
}

const KEEP_AND_MIGRATE = [12, 11, 5, 4, 1]
const DELETE_ORPHANS = [10, 9, 8, 7, 6]

async function run() {
  const payload = await getPayload({ config: configPromise })
  const localDir = path.join(process.cwd(), 'public', 'blog-media')

  for (const id of DELETE_ORPHANS) {
    await payload.delete({ collection: 'blog-media', id })
    console.log('RESULT deleted orphan', id)
  }

  for (const id of KEEP_AND_MIGRATE) {
    const doc = await payload.findByID({ collection: 'blog-media', id })
    const filePath = path.join(localDir, doc.filename as string)
    if (!fs.existsSync(filePath)) {
      console.log('RESULT MISSING FILE for', id, doc.filename)
      continue
    }
    const data = fs.readFileSync(filePath)
    await payload.update({
      collection: 'blog-media',
      id,
      data: { alt: doc.alt },
      file: {
        data,
        mimetype: MIME_BY_EXT[path.extname(doc.filename as string).toLowerCase()] || 'image/webp',
        name: doc.filename as string,
        size: data.length,
      },
    })
    console.log('RESULT migrated', id, doc.filename)
  }

  process.exit(0)
}
run().catch((e) => { console.error(e); process.exit(1) })
