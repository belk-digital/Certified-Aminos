import type { GlobalConfig } from 'payload'

// Array row order IS the checkout display order — Payload's admin UI lets you drag rows to
// reorder them, no separate "sortOrder" field needed.
export const PaymentGatewaySettings: GlobalConfig = {
  slug: 'payment-gateway-settings',
  admin: {
    group: 'Checkout',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => !!user && ['admin', 'staff'].includes(user.role as string),
  },
  fields: [
    {
      name: 'gateways',
      type: 'array',
      label: 'Payment Methods',
      admin: {
        description: 'Drag rows to reorder how payment methods appear on checkout. Uncheck "Enabled" to hide one without deleting it.',
        components: {
          RowLabel: '@/components/admin/PaymentGatewayRowLabel#PaymentGatewayRowLabel',
        },
      },
      fields: [
        {
          name: 'key',
          type: 'select',
          required: true,
          options: [
            { label: 'Zelle', value: 'zelle' },
            { label: 'Card (CircoFlows)', value: 'circoflows' },
            { label: 'Stripe (Custom Payment Link)', value: 'stripe_link' },
            { label: 'Crypto (Payzentric)', value: 'payzentric' },
          ],
        },
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'Headline shown on the checkout option. Leave blank to use the built-in default.',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: {
            description: 'Small helper text shown under the title. Leave blank to use the built-in default.',
          },
        },
      ],
      defaultValue: [
        { key: 'zelle', enabled: true, title: 'Zelle', description: "You'll receive Zelle payment instructions on the next page after placing your order." },
        { key: 'circoflows', enabled: false, title: 'Credit / Debit Card', description: "You'll be securely redirected to enter your card details." },
        { key: 'stripe_link', enabled: true, title: 'Stripe (Custom Payment Link)', description: 'Secure payment via an emailed Stripe link.' },
        { key: 'payzentric', enabled: true, title: 'Secure Payment Portal', description: "You'll be securely redirected to complete payment through our payment portal." },
      ],
    },
  ],
}
