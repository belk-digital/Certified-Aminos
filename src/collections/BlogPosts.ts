import { CollectionConfig } from 'payload'
import { lexicalEditor, EXPERIMENTAL_TableFeature, BlocksFeature } from '@payloadcms/richtext-lexical'
import { accessContent } from '../access/content'
import { CalloutBox } from '../blocks/CalloutBox'

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: { defaultColumns: ['title', 'author', 'status', 'publishedAt'] },
  access: accessContent,
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', admin: { position: 'sidebar' } },
    { name: 'author', type: 'relationship', relationTo: 'users', required: true },
    { name: 'featuredImage', type: 'upload', relationTo: 'blog-media', label: 'Featured Image' },
    { name: 'excerpt', type: 'textarea', localized: true, admin: { description: 'Short summary shown on blog listing cards and used as the default SEO/social description.' } },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          EXPERIMENTAL_TableFeature(),
          BlocksFeature({ blocks: [CalloutBox] }),
        ],
      }),
    },
    { name: 'publishedAt', type: 'date' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    {
      name: 'category',
      type: 'select',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Metabolic research', value: 'Metabolic research' },
        { label: 'Recovery protocols', value: 'Recovery protocols' },
        { label: 'Growth research', value: 'Growth research' },
        { label: 'Muscle studies', value: 'Muscle studies' },
      ],
    },
    {
      name: 'relatedProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'readTime',
      type: 'text',
      admin: { description: "e.g. '12 min read'. Leave blank to auto-calculate from content length when rendered." },
    },
    {
      name: 'keyTakeaways',
      type: 'array',
      admin: { description: 'Short factual bullet points summarizing the post. Used for AI answer-engine (AEO/GEO) extraction and on-page "Key Takeaways" callouts.' },
      fields: [{ name: 'text', type: 'text', localized: true, required: true }],
    },
    {
      name: 'faqs',
      type: 'array',
      admin: { description: 'Populates FAQPage schema.org markup and on-page FAQ accordion.' },
      fields: [
        { name: 'question', type: 'text', required: true, localized: true },
        { name: 'answer', type: 'textarea', required: true, localized: true },
      ],
    },
    {
      name: 'references',
      type: 'array',
      admin: { description: 'Peer-reviewed sources cited in this post (PubMed, DOI, journal links). Strengthens E-E-A-T trust signals and AI answer-engine citation likelihood.' },
      fields: [
        { name: 'citationText', type: 'text', required: true, admin: { description: 'e.g. "Smith et al., 2023, Journal of Peptide Science"' } },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'focusKeyphrase',
      type: 'text',
      admin: { position: 'sidebar', description: 'Primary target keyword/phrase for this post (editorial SEO guidance).' },
    },
    {
      name: 'keywords',
      type: 'text',
      admin: { position: 'sidebar', description: 'Comma-separated secondary keywords for meta keywords / internal search relevance.' },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' && !data.slug && data.title) {
          data.slug = data.title.toLowerCase().replace(/\s+/g, '-')
        }
        return data
      },
    ],
  },
}
