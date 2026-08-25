'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth'
import { sendTrackedEmail } from '@/lib/emails/sendTrackedEmail'
import { checkRateLimit } from '@/lib/rateLimit'

export async function requestPasswordReset(input: ForgotPasswordInput) {
  const parsed = forgotPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false as const }
  }

  const payload = await getPayload({ config })

  const { allowed } = await checkRateLimit(`forgot-password:${parsed.data.email.toLowerCase()}`, 5, 60 * 60)
  if (!allowed) {
    return { success: true as const }
  }

  // Always return success regardless of whether the email exists, to avoid leaking account existence.
  try {
    const token = await payload.forgotPassword({
      collection: 'users',
      data: { email: parsed.data.email },
      disableEmail: true,
    })

    if (token && typeof token === 'string') {
      const userDocs = await payload.find({
        collection: 'users',
        where: { email: { equals: parsed.data.email } },
        limit: 1,
      })

      if (userDocs.docs.length > 0) {
        const user = userDocs.docs[0]
        const base = process.env.NEXT_PUBLIC_SERVER_URL || 'https://helixbiochem.com'
        const locale = ''
        const url = `${base}${locale}/reset-password/${token}`
        
        const { generateForgotPasswordEmail } = await import('@/lib/emails/generateForgotPasswordEmail')
        const html = await generateForgotPasswordEmail(url, user)

        await sendTrackedEmail(payload, {
          from: 'support@certifiedaminos.com',
          to: parsed.data.email,
          subject: 'Reset Your Password - Helix Bio',
          html,
        })
      }
    }
  } catch (err) {
    // Still return success to the caller (same reasoning as above — don't leak account
    // existence), but log so a broken email provider doesn't fail completely silently.
    console.error('Failed to process password reset request:', err)
  }

  return { success: true as const }
}
