import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { s3Storage } from '@payloadcms/storage-s3'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { resendAdapter } from '@payloadcms/email-resend'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { BlogMedia } from './collections/BlogMedia'
import { Documents } from './collections/Documents'
import { Addresses } from './collections/Addresses'
import { Categories } from './collections/Categories'
import { Products } from './collections/Products'
import { Carts } from './collections/Carts'
import { Coupons } from './collections/Coupons'
import { BlogPosts } from './collections/BlogPosts'
import { Pages } from './collections/Pages'
import { ContactMessages } from './collections/ContactMessages'
import { EmailLogs } from './collections/EmailLogs'
import { Wishlists } from './collections/Wishlists'
import { Reviews } from './collections/Reviews'
import { Orders } from './collections/Orders'
import { ShippingZones } from './collections/ShippingZones'
import { AffiliateApplications } from './collections/AffiliateApplications'
import { Affiliates } from './collections/Affiliates'
import { AffiliateClicks } from './collections/AffiliateClicks'
import { AffiliateConversions } from './collections/AffiliateConversions'
import { AffiliatePayouts } from './collections/AffiliatePayouts'
import { PayoutRequests } from './collections/PayoutRequests'
import { ProcessingFees } from './collections/ProcessingFees'
import { MilitaryDiscountRequests } from './collections/MilitaryDiscountRequests'
import { Trash } from './collections/Trash'
import { AffiliateSettings } from './globals/AffiliateSettings'
import { BlogAuthorProfile } from './globals/BlogAuthorProfile'
import { OrderCounters } from './collections/OrderCounters'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Fail fast on boot rather than silently signing tokens/emails with an empty secret or
// sending customer-facing email from Resend's shared sandbox domain in production.
if (!process.env.PAYLOAD_SECRET) {
  throw new Error('PAYLOAD_SECRET environment variable is required and was not set.')
}
if (process.env.NODE_ENV === 'production' && !process.env.RESEND_API_KEY) {
  console.warn('WARNING: RESEND_API_KEY environment variable is missing in production.')
}
if (process.env.NODE_ENV === 'production' && !process.env.RESEND_FROM_EMAIL) {
  console.error('RESEND_FROM_EMAIL is not set — emails without an explicit "from" will send from Resend\'s sandbox domain.')
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeNavLinks: ['@/components/admin/NavBadges'],
    },
  },
  routes: {
    admin: '/the-upside-down',
  },
  globals: [
    AffiliateSettings,
    BlogAuthorProfile,
  ],
  collections: [
    Trash,
    OrderCounters,
    Users,
    Media,
    BlogMedia,
    Documents,
    Addresses,
    Categories,
    Products,
    Carts,
    Wishlists,
    Coupons,
    Orders,
    Reviews,
    ShippingZones,
    BlogPosts,
    Pages,
    ContactMessages,
    EmailLogs,
    AffiliateApplications,
    Affiliates,
    AffiliateClicks,
    AffiliateConversions,
    AffiliatePayouts,
    PayoutRequests,
    ProcessingFees,
    MilitaryDiscountRequests,
  ].map((collection) => {
    if (collection.slug === 'trash') return collection

    collection.hooks = collection.hooks || {}
    collection.hooks.beforeDelete = collection.hooks.beforeDelete || []
    
    collection.hooks.beforeDelete.push(async (args: any) => {
      const { req, id, doc } = args
      try {
        let fullDoc = doc
        if (!fullDoc) {
          fullDoc = await req.payload.findByID({ collection: collection.slug as any, id, req, depth: 0 })
        }
        
        // Dynamically figure out the title of the deleted item
        const docTitle = fullDoc?.name || fullDoc?.title || fullDoc?.orderNumber || fullDoc?.code || fullDoc?.email || String(id)

        await req.payload.create({
          collection: 'trash',
          req,
          data: {
            title: String(docTitle),
            collectionSlug: collection.slug,
            originalId: String(id),
            documentData: JSON.parse(JSON.stringify(fullDoc || {})),
          },
          overrideAccess: true,
        })
      } catch (err: any) {
        console.error(`Failed to move ${collection.slug} ${id} to trash:`, err)
        require('fs').appendFileSync('trash-error.log', `\n[${new Date().toISOString()}] Error moving ${collection.slug} ${id}: ${err.message || err.toString()}`)
      }
    })

    return collection
  }),
  editor: lexicalEditor(),
  localization: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
  },
  secret: process.env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    push: process.env.NODE_ENV !== 'production',
    pool: {
      connectionString: process.env.DATABASE_URI || process.env.DATABASE_URL || '',
      max: process.env.NODE_ENV === 'production' ? 10 : 10,
      ssl: {
        rejectUnauthorized: false,
      },
    },
  }),
  sharp,
  plugins: [
    ...(process.env.R2_BUCKET ? [
      s3Storage({
        collections: {
          media: {
            disableLocalStorage: true,
            disablePayloadAccessControl: true,
            prefix: 'Product Images',
            generateFileURL: ({ filename, prefix }) => {
              const publicUrl = process.env.R2_PUBLIC_URL || ''
              const base = publicUrl.replace(/\/$/, '')
              return prefix ? `${base}/${prefix}/${filename}` : `${base}/${filename}`
            },
          },
          documents: {
            disableLocalStorage: true,
            disablePayloadAccessControl: true,
            prefix: 'COA',
            generateFileURL: ({ filename, prefix }) => {
              const publicUrl = process.env.R2_PUBLIC_URL || ''
              const base = publicUrl.replace(/\/$/, '')
              return prefix ? `${base}/${prefix}/${filename}` : `${base}/${filename}`
            },
          },
          'blog-media': {
            disableLocalStorage: true,
            disablePayloadAccessControl: true,
            prefix: 'Blog Images',
            generateFileURL: ({ filename, prefix }) => {
              const publicUrl = process.env.R2_PUBLIC_URL || ''
              const base = publicUrl.replace(/\/$/, '')
              return prefix ? `${base}/${prefix}/${filename}` : `${base}/${filename}`
            },
          },
        },
        bucket: process.env.R2_BUCKET,
        config: {
          endpoint: process.env.R2_ENDPOINT || '',
          credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
          },
          region: 'auto',
          forcePathStyle: true,
        },
      })
    ] : []),
    seoPlugin({
      collections: ['pages', 'blog-posts'],
      tabbedUI: true,
      uploadsCollection: 'media',
      generateTitle: ({ doc }: any) => (doc?.title ? `${doc.title} | Certified Aminos` : 'Certified Aminos'),
      generateDescription: ({ doc }: any) => doc?.excerpt || doc?.seoDescription || '',
      generateImage: ({ doc }: any) => doc?.featuredImage || doc?.meta?.image,
      generateURL: ({ doc }: any) => {
        const base = process.env.NEXT_PUBLIC_SERVER_URL || 'https://certifiedaminos.com'
        return `${base}/${doc?.slug || ''}`
      },
    }),
  ],
  email: resendAdapter({
    defaultFromAddress: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    defaultFromName: 'Certified Aminos',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
})
