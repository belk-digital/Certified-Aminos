import { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    defaultColumns: ['orderNumber', 'status', 'paymentStatus', 'paymentMethod', 'orderSource', 'fulfillmentStatus', 'owner', 'orderTime'],
    description: 'Customer orders – generated server‑side only.',
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      return { owner: { equals: req.user?.id } }
    },
    create: () => false,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      async (args) => {
        const { beforeOrderChange } = await import('@/hooks/orders')
        return beforeOrderChange(args)
      },
    ],
    afterChange: [
      async (args) => {
        const { afterOrderChange } = await import('@/hooks/orders')
        return afterOrderChange(args)
      },
      // Status-change emails are now handled directly in afterOrderChange: refunded/cancelled
      // sends a customer email, shipped uses the sendTrackingEmail checkbox + trackingLink,
      // and paid is handled by finalizeOrder's confirmation email.
    ],
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      admin: { readOnly: true, description: 'Auto‑generated order identifier (e.g., 7000).' },
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      admin: { description: 'User who placed the order (null for guests).' },
    },
    {
      name: 'customerFirstName',
      type: 'text',
      admin: { description: 'First name of the customer (useful for guest orders).' },
    },
    {
      name: 'customerLastName',
      type: 'text',
    },
    {
      name: 'customerPhone',
      type: 'text',
    },
    {
      name: 'items',
      type: 'array',
      admin: {
        components: {
          RowLabel: '@/components/admin/OrderItemRowLabel#OrderItemRowLabel'
        }
      },
      fields: [
        { 
          name: 'product', 
          type: 'relationship', 
          relationTo: 'products', 
          required: false,
        },
        { name: 'variantTitle', type: 'text', admin: { description: 'The display title of the variant, e.g. "10mg Single" or "10mg 10 Kit (Best Value)"' } },
        { name: 'variant', type: 'text', admin: { description: 'The variant SKU or bundle code purchased' } },
        { name: 'price', type: 'number', admin: { description: 'Price paid per unit at the time of order' } },
        { name: 'quantity', type: 'number', required: true },
        {
          type: 'collapsible',
          label: 'Product Snapshot Data',
          admin: {
            initCollapsed: true,
          },
          fields: [
            {
              name: 'productSnapshot',
              type: 'json',
              admin: { description: 'Snapshot of product data at order time. Collapsed to save space.' },
            },
          ]
        },
      ],
    },
    {
      name: 'shippingAddress',
      type: 'group',
      fields: [
        { name: 'line1', type: 'text' },
        { name: 'line2', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'state', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'country', type: 'text' },
      ],
    },
    {
      name: 'billingAddress',
      type: 'group',
      fields: [
        { name: 'line1', type: 'text' },
        { name: 'line2', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'state', type: 'text' },
        { name: 'postalCode', type: 'text' },
        { name: 'country', type: 'text' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Fulfilled', value: 'fulfilled' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Completed', value: 'completed' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      required: true,
      defaultValue: 'pending',
    },
    {
      name: 'paymentStatus',
      type: 'select',
      options: [
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Authorized', value: 'authorized' },
        { label: 'Captured', value: 'captured' },
        { label: 'Refunded', value: 'refunded' },
      ],
      required: true,
      defaultValue: 'unpaid',
    },
    {
      name: 'fulfillmentStatus',
      type: 'select',
      options: [
        { label: 'Unfulfilled', value: 'unfulfilled' },
        { label: 'Partial', value: 'partial' },
        { label: 'Fulfilled', value: 'fulfilled' },
      ],
      required: true,
      defaultValue: 'unfulfilled',
    },
    {
      name: 'refunds',
      type: 'array',
      fields: [
        { name: 'amount', type: 'number' },
        { name: 'reason', type: 'text' },
        { name: 'createdAt', type: 'date', admin: { readOnly: true } },
      ],
    },
    { name: 'subtotal', type: 'number', admin: { position: 'sidebar', description: 'Before discounts/shipping/tax' } },
    { name: 'discountTotal', type: 'number', admin: { position: 'sidebar' } },
    { name: 'redeemedPoints', type: 'number', defaultValue: 0, admin: { position: 'sidebar', description: 'HB Points used in this order ($1 per point)' } },
    { name: 'shippingTotal', type: 'number', admin: { position: 'sidebar' }, defaultValue: 0 },
    {
      name: 'taxTotal',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'feeTotal',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: { description: 'Total of all applied processing fees in dollars' },
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'appliedFees',
      type: 'array',
      admin: { description: 'Processing fees applied to this order' },
      fields: [
        { name: 'feeId', type: 'relationship', relationTo: 'processing-fees' },
        { name: 'feeName', type: 'text' },
        { name: 'amount', type: 'number', admin: { description: 'Amount charged in dollars' } },
        {
          name: 'feeType',
          type: 'select',
          options: [
            { label: 'Percentage', value: 'percentage' },
            { label: 'Fixed Amount', value: 'fixed_amount' },
          ],
          admin: { description: 'Snapshot of the fee type at the time the order was placed' },
        },
        {
          name: 'percentage',
          type: 'number',
          admin: { description: 'Snapshot of the percentage rate charged at order time (only set when feeType is percentage). This must never be recalculated from the live processing-fees config, so historical orders keep showing the rate actually charged even after the config changes.' },
        },
      ],
    },
    { name: 'shippingMethod', type: 'text', admin: { position: 'sidebar' } },
    { name: 'trackingLink', type: 'text', admin: { position: 'sidebar', description: 'URL to track the package' } },
    { 
      name: 'sendTrackingEmail', 
      type: 'checkbox', 
      admin: { position: 'sidebar', description: 'Check this box before saving to email the tracking link to the customer.' } 
    },
    {
      name: 'paymentMethod',
      type: 'select',
      defaultValue: 'stripe',
      options: [
        { label: 'Card (Stripe)', value: 'stripe' },
        { label: 'Zelle', value: 'zelle' },
        { label: 'American Express', value: 'amex' },
        { label: 'Card (CircoFlows)', value: 'circoflows' },
        { label: 'Stripe (Custom Payment Link)', value: 'stripe_link' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Zelle orders require manual payment confirmation before fulfillment.',
      },
    },
    {
      name: 'circoflowsTransactionId',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'CircoFlows transaction_id, for support/reconciliation lookups.',
        condition: (data) => data?.paymentMethod === 'circoflows',
      },
    },
    { name: 'couponCode', type: 'text', admin: { position: 'sidebar' } },
    { name: 'affiliateId', type: 'text', admin: { position: 'sidebar', description: 'Affiliate ID if referred' } },
    { name: 'clickId', type: 'text', admin: { position: 'sidebar', description: 'Affiliate click ID if referred' } },
    {
      name: 'orderSource',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Where this order originated from (e.g. a sibling storefront that redirects its cart here), if not placed directly on this site.',
      },
    },
    { name: 'customerNote', type: 'textarea' },
    { name: 'guestEmail', type: 'text', admin: { position: 'sidebar', description: 'For orders without a registered user account' } },
    { name: 'createdAt', type: 'date', admin: { position: 'sidebar', disabled: true } },
    { name: 'updatedAt', type: 'date', admin: { position: 'sidebar', disabled: true } },
    {
      name: 'orderTime',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/admin/NullField',
          Cell: '@/components/admin/TimeAgoCell',
        },
      },
    },
    {
      name: 'isFinalized',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'True if inventory, coupons, and points have been processed for this order.',
      },
    },
    {
      name: 'notes',
      type: 'array',
      label: 'Order Notes',
      admin: {
        description: 'Keep a running history of internal notes or send messages directly to the customer.',
      },
      fields: [
        {
          name: 'type',
          type: 'radio',
          required: true,
          defaultValue: 'internal',
          options: [
            { label: 'Internal Note (Private)', value: 'internal' },
            { label: 'Message to Customer (Emailed)', value: 'customer' },
          ],
          admin: {
            layout: 'horizontal',
          },
          access: {
            update: ({ siblingData }) => !siblingData?.isEmailed,
          },
        },
        {
          name: 'note',
          type: 'textarea',
          required: true,
          access: {
            update: ({ siblingData }) => !siblingData?.isEmailed,
          },
        },
        {
          name: 'date',
          type: 'date',
          admin: {
            readOnly: true,
            description: 'Auto-stamped when you save.',
          },
        },
        {
          name: 'isEmailed',
          type: 'checkbox',
          label: 'Dispatched to Customer',
          admin: {
            readOnly: true,
            condition: (data, siblingData) => siblingData?.isEmailed,
          },
        },
      ],
    },
  ],
}
