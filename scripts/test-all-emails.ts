import { config } from 'dotenv'
config({ path: '.env' })
config({ path: '.env.local' })

import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import { sendTrackedEmail } from '../src/lib/emails/sendTrackedEmail'
import { generateWelcomeEmail } from '../src/lib/emails/generateWelcomeEmail'
import { generateVerifyEmailEmail } from '../src/lib/emails/generateVerifyEmailEmail'
import { generateForgotPasswordEmail } from '../src/lib/emails/generateForgotPasswordEmail'
import { generateOrderInvoiceHtml } from '../src/lib/emails/generateOrderEmail'
import { generateContactFormEmail } from '../src/lib/emails/generateContactFormEmail'
import { generateAffiliateWelcomeEmail } from '../src/lib/emails/generateAffiliateWelcomeEmail'
import { generateAffiliateSaleEmail } from '../src/lib/emails/generateAffiliateSaleEmail'
import { generateAdminAffiliateConversionEmail } from '../src/lib/emails/generateAdminAffiliateConversionEmail'
import { generateAdminAffiliateNotificationEmail } from '../src/lib/emails/generateAdminAffiliateNotificationEmail'
import { generateMilitaryAdminEmail } from '../src/lib/emails/generateMilitaryAdminEmail'
import { generateMilitaryApprovalEmail } from '../src/lib/emails/generateMilitaryApprovalEmail'
import { generateMilitaryRejectionEmail } from '../src/lib/emails/generateMilitaryRejectionEmail'

const TEST_TO = 'main.belkdigital@gmail.com'

const mockUser = { firstName: 'Alex', email: TEST_TO }

const mockOrder = {
  id: 'test-order-1',
  orderNumber: 'CA-10042',
  createdAt: new Date().toISOString(),
  customerFirstName: 'Alex',
  customerLastName: 'Doe',
  guestEmail: TEST_TO,
  customerPhone: '+1 (555) 123-4567',
  subtotal: 189,
  discountTotal: 10,
  redeemedPoints: 0,
  shippingTotal: 0,
  taxTotal: 0,
  feeTotal: 5.5,
  total: 184.5,
  couponCode: 'WELCOME10',
  paymentMethod: 'stripe',
  paymentStatus: 'paid',
  shippingMethod: 'Standard',
  trackingLink: 'https://track.example.com/1Z999AA10123456784',
  shippingAddress: { line1: '123 Main St', line2: '', city: 'Austin', state: 'TX', postalCode: '78701', country: 'US' },
  billingAddress: { line1: '123 Main St', line2: '', city: 'Austin', state: 'TX', postalCode: '78701', country: 'US' },
  items: [
    {
      productSnapshot: { name: 'Retatrutide', images: [] },
      variantTitle: '10MG',
      variant: 'retatrutide-10mg',
      quantity: 1,
      price: 179,
    },
  ],
}

const mockAffiliate = {
  id: 'test-affiliate-1',
  displayName: 'Alex Doe',
  referralSlug: 'alexdoe',
  couponCode: 'ALEXDOE15',
  commissionRate: 15,
  cookieDurationDays: 30,
}

const mockApplication = {
  displayName: 'Alex Doe',
  websiteUrl: 'https://alexdoe.example.com',
  estimatedMonthlyReach: '10,000',
  promotionMethods: 'Instagram + email newsletter',
  niche: 'Fitness & wellness',
  socialLinks: [{ platform: 'Instagram', url: 'https://instagram.com/alexdoe' }],
}

// certifiedaminos.com isn't verified in Resend yet (see email-logs — every send has been
// failing since at least Aug 23). Falling back to Resend's built-in sandbox sender here so we
// can still test template rendering/delivery; this override is local to this script only and
// doesn't touch the real RESEND_FROM_EMAIL used by the app.
const TEST_FROM = 'Certified Aminos (Test) <onboarding@resend.dev>'

async function send(payload: any, subject: string, html: string) {
  await sendTrackedEmail(payload, { to: TEST_TO, from: TEST_FROM, subject: `[TEST] ${subject}`, html })
  console.log(`  Sent: ${subject}`)
}

async function run() {
  const payload = await getPayload({ config: configPromise })
  console.log(`--- Sending all email templates to ${TEST_TO} ---`)

  await send(payload, 'Welcome Email', await generateWelcomeEmail(mockUser))
  await send(payload, 'Verify Email', generateVerifyEmailEmail(mockUser.firstName, 'https://certifiedaminos.com/verify-email?token=test-token'))
  await send(payload, 'Forgot Password', await generateForgotPasswordEmail('https://certifiedaminos.com/reset-password?token=test-token', mockUser))
  await send(payload, 'Order Confirmation (Success)', await generateOrderInvoiceHtml(mockOrder, payload, undefined, 'success'))
  await send(payload, 'Order Cancelled', await generateOrderInvoiceHtml(mockOrder, payload, undefined, 'cancelled'))
  await send(payload, 'Order Payment Failed', await generateOrderInvoiceHtml(mockOrder, payload, undefined, 'failed'))
  await send(payload, 'Contact Form Submission', generateContactFormEmail('Alex Doe', TEST_TO, 'support', 'Question about an order', 'Hi, I had a question about my recent order. Can you help?'))
  await send(payload, 'Affiliate Welcome', await generateAffiliateWelcomeEmail(mockAffiliate, mockUser))
  await send(payload, 'Affiliate Sale Tracked', await generateAffiliateSaleEmail(mockAffiliate, 26.85, false))
  await send(payload, 'Affiliate Sale Voided', await generateAffiliateSaleEmail(mockAffiliate, 26.85, true))
  await send(payload, 'Admin: Affiliate Conversion', generateAdminAffiliateConversionEmail(mockOrder, mockAffiliate, 26.85))
  await send(payload, 'Admin: New Affiliate Registration', generateAdminAffiliateNotificationEmail(mockApplication, mockAffiliate, mockUser))
  await send(payload, 'Military Discount: Admin Notification', generateMilitaryAdminEmail('Alex Doe', TEST_TO, 'U.S. Army', 'test-token'))
  await send(payload, 'Military Discount: Approved', generateMilitaryApprovalEmail('Alex Doe', 'MIL15OFF'))
  await send(payload, 'Military Discount: Rejected', generateMilitaryRejectionEmail('Alex Doe'))

  console.log('\n--- Done ---')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
