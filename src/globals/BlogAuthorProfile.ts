import type { GlobalConfig } from 'payload'

export const BlogAuthorProfile: GlobalConfig = {
  slug: 'blog-author-profile',
  label: 'Blog Author Profile',
  admin: {
    group: 'Blog',
    description: 'The single byline used across every blog post (the Helix Bio Team account is the only author). Feeds Author/Person schema.org markup for E-E-A-T.',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => !!user && ['admin', 'staff'].includes(user.role as string),
  },
  fields: [
    { name: 'name', type: 'text', required: true, defaultValue: 'Helix Bio Team' },
    { name: 'title', type: 'text', admin: { description: 'e.g. "Research & Product Team"' } },
    { name: 'bio', type: 'textarea', admin: { description: 'Short author bio shown on post pages and used in Author/Person schema.' } },
    { name: 'credentials', type: 'text', admin: { description: 'e.g. "Reviewed by in-house research chemists"' } },
    { name: 'photo', type: 'upload', relationTo: 'blog-media', label: 'Author Photo' },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: ['X', 'LinkedIn', 'Instagram', 'Facebook', 'YouTube'],
        },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
}
