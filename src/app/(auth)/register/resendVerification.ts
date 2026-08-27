'use server'

import jwt from 'jsonwebtoken'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sendTrackedEmail } from '@/lib/emails/sendTrackedEmail'
import { generateVerifyEmailEmail } from '@/lib/emails/generateVerifyEmailEmail'

export async function resendVerificationEmail(rawEmail: string) {
  const email = (rawEmail || '').toLowerCase().trim()
  // Always return the same response regardless of whether the account exists, so this
  // can't be used to enumerate registered emails.
  if (!email || !process.env.PAYLOAD_SECRET) return { success: true as const }

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })
  const user = docs[0]

  if (user && !user.emailVerified && user.authProvider !== 'google') {
    try {
      const token = jwt.sign({ userId: user.id, purpose: 'verify-email' }, process.env.PAYLOAD_SECRET, { expiresIn: '48h' })
      const base = process.env.NEXT_PUBLIC_SERVER_URL || 'https://certifiedaminos.com'
      const verifyUrl = `${base}/api/verify-email?token=${token}`
      const html = generateVerifyEmailEmail(user.firstName, verifyUrl)
      await sendTrackedEmail(payload, {
        from: 'Support | Certified Aminos <support@certifiedaminos.com>',
        to: email,
        subject: 'Verify your email - Certified Aminos',
        html,
      })
    } catch (err) {
      console.error('Failed to resend verification email:', err)
    }
  }

  return { success: true as const }
}
