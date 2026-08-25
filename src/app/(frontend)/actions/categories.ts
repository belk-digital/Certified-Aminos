'use server'

import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export async function getVisibleCategories() {
  const payload = await getPayload({ config: configPromise })
  const res = await payload.find({
    collection: 'categories',
    where: { isVisible: { equals: true } },
    sort: 'sortOrder',
    limit: 100,
    overrideAccess: true,
  })

  return res.docs.map(doc => ({
    id: doc.id,
    name: doc.name,
    slug: doc.slug || '',
  }))
}
