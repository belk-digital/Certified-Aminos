'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth'
import { sendTrackedEmail } from '@/lib/emails/sendTrackedEmail'

export async function resetPassword(token: string, input: ResetPasswordInput) {
  const parsed = resetPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false as const, error: 'invalid' as const }
  }

  const payload = await getPayload({ config })

  try {
    const result = await payload.resetPassword({
      collection: 'users',
      data: { token, password: parsed.data.password },
      overrideAccess: true,
    })
    if (!result?.user) {
      return { success: false as const, error: 'invalidToken' as const }
    }
    
    const user = result.user as any
    try {
      // Notify admin
      await sendTrackedEmail(payload, {
        to: 'support@certifiedaminos.com',
        subject: `Security Alert: User Password Reset`,
        html: `<p>The password for the user <strong>${user.email}</strong> was recently changed via the forgot password flow.</p>`
      })
    } catch (emailErr) {
      console.error('Failed to send admin notification for password reset', emailErr)
    }

    return { success: true as const }
  } catch {
    return { success: false as const, error: 'invalidToken' as const }
  }
}
