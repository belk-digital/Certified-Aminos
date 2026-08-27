'use server'

import crypto from 'crypto'
import { getPayloadUser } from '@/lib/auth/getPayloadUser'
import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { sendTrackedEmail } from '@/lib/emails/sendTrackedEmail'

const CODE_TTL_MS = 10 * 60 * 1000

function hashCode(code: string) {
  return crypto.createHmac('sha256', process.env.PAYLOAD_SECRET || '').update(code).digest('hex')
}

export async function updateProfile(formData: FormData) {
  const t = await getTranslations('account.settings')
  try {
    const user = await getPayloadUser()
    if (!user) return { success: false, error: t('errorUnauthorized') }

    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const phone = formData.get('phone') as string

    const payload = await getPayload({ config })

    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        firstName,
        lastName,
        phone,
      } as any,
      overrideAccess: true,
    })

    revalidatePath('/account/settings')
    revalidatePath('/account')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || t('errorUnexpected') }
  }
}

export async function updatePreferencesAction(input: {
  preferredLocale?: 'en' | 'es'
  acceptsMarketing?: boolean
  orderSmsUpdates?: boolean
}) {
  const t = await getTranslations('account.settings')
  const user = await getPayloadUser()
  if (!user) return { success: false, error: t('errorUnauthorized') }

  const payload = await getPayload({ config })
  try {
    await payload.update({
      collection: 'users',
      id: user.id,
      data: input as any,
      overrideAccess: true,
    })

    if (input.acceptsMarketing !== undefined && process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        
        if (input.acceptsMarketing) {
          const payloadObj: any = {
            email: user.email,
            unsubscribed: false,
          }
          if (user.firstName) payloadObj.firstName = user.firstName
          if (user.lastName) payloadObj.lastName = user.lastName
          if (process.env.RESEND_AUDIENCE_ID) {
            payloadObj.audienceId = process.env.RESEND_AUDIENCE_ID
          }
          await resend.contacts.create(payloadObj)
        } else {
          const payloadObj: any = {
            email: user.email,
          }
          if (process.env.RESEND_AUDIENCE_ID) {
            payloadObj.audienceId = process.env.RESEND_AUDIENCE_ID
          }
          await resend.contacts.remove(payloadObj)
        }
      } catch (err) {
        console.error('Failed to sync Resend preference:', err)
      }
    }

    revalidatePath('/account/settings')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || t('errorUnexpected') }
  }
}

export async function updatePasswordAction(input: {
  currentPassword?: string
  newPassword: string
}) {
  const t = await getTranslations('account.securityDialogs')
  const user = await getPayloadUser()
  if (!user) return { success: false, error: t('passwordUpdateError') }

  const payload = await getPayload({ config })

  if ((user as any).authProvider !== 'google') {
    if (!input.currentPassword) return { success: false, error: t('passwordUpdateError') }
    try {
      await payload.login({
        collection: 'users',
        data: { email: user.email, password: input.currentPassword },
        overrideAccess: true,
      })
    } catch {
      return { success: false, error: t('passwordUpdateError') }
    }
  }

  try {
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { password: input.newPassword } as any,
      overrideAccess: true,
    })

    try {
      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb;">
        <div style="font-family: sans-serif; color: #111827; width: 100%; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; line-height: 1.6;">
          <h2 style="color: #000; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Security Alert: Password Changed</h2>
          <p>Hi ${user.firstName || 'there'},</p>
          <p>This is a confirmation that the password for your Certified Aminos account (${user.email}) has been changed.</p>
          <p>If you made this change, no further action is required.</p>
          <p><strong>If you did not make this change, please contact our support team immediately.</strong></p>
          <p style="margin-top: 30px;">Best regards,<br>The Certified Aminos Team</p>
        </div>
</body>
</html>
      `
      await sendTrackedEmail(payload, {
        from: 'Support | Certified Aminos <support@certifiedaminos.com>',
        to: user.email,
        subject: 'Your password has been changed',
        html: emailHtml,
      })

      // Notify admin
      await sendTrackedEmail(payload, {
        to: 'support@certifiedaminos.com',
        subject: `Security Alert: User Password Changed`,
        html: `<p>The password for the user <strong>${user.email}</strong> was recently changed.</p>`
      })
    } catch (emailErr) {
      console.error('Failed to send password change confirmation email', emailErr)
    }

    return { success: true }
  } catch {
    return { success: false, error: t('passwordUpdateError') }
  }
}

export async function requestEmailChangeAction(newEmail: string) {
  const t = await getTranslations('account.securityDialogs')
  const user = await getPayloadUser()
  if (!user) return { success: false, error: t('emailPreparationError') }

  const payload = await getPayload({ config })
  const normalizedEmail = newEmail.toLowerCase()

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: normalizedEmail } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs.length > 0) {
    return { success: false, error: t('emailInUse') }
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()

  try {
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        pendingEmail: normalizedEmail,
        pendingEmailCodeHash: hashCode(code),
        pendingEmailCodeExpiresAt: new Date(Date.now() + CODE_TTL_MS).toISOString(),
      } as any,
      overrideAccess: true,
    })

    await sendTrackedEmail(payload, {
      from: 'Support | Certified Aminos <support@certifiedaminos.com>',
      to: normalizedEmail,
      subject: 'Verify your new email address',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb;">
        <div style="font-family: sans-serif; color: #111827; width: 100%; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; line-height: 1.6;">
          <p>Your verification code is:</p>
          <p style="font-size:24px;font-weight:bold;letter-spacing:4px;">${code}</p>
          <p>This code expires in 10 minutes.</p>
        </div>
</body>
</html>
      `,
    })

    return { success: true }
  } catch {
    return { success: false, error: t('emailPreparationError') }
  }
}

export async function verifyEmailChangeAction(code: string) {
  const t = await getTranslations('account.securityDialogs')
  const user = await getPayloadUser()
  if (!user) return { success: false, error: t('invalidVerificationCode') }

  const pendingEmail = (user as any).pendingEmail as string | null
  const pendingEmailCodeHash = (user as any).pendingEmailCodeHash as string | null
  const pendingEmailCodeExpiresAt = (user as any).pendingEmailCodeExpiresAt as string | null

  if (!pendingEmail || !pendingEmailCodeHash || !pendingEmailCodeExpiresAt) {
    return { success: false, error: t('invalidVerificationCode') }
  }
  if (new Date(pendingEmailCodeExpiresAt).getTime() < Date.now()) {
    return { success: false, error: t('invalidVerificationCode') }
  }
  if (hashCode(code) !== pendingEmailCodeHash) {
    return { success: false, error: t('invalidVerificationCode') }
  }

  const payload = await getPayload({ config })
  try {
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        email: pendingEmail,
        pendingEmail: null,
        pendingEmailCodeHash: null,
        pendingEmailCodeExpiresAt: null,
      } as any,
      overrideAccess: true,
    })
    revalidatePath('/account/settings')
    return { success: true }
  } catch {
    return { success: false, error: t('emailPreparationError') }
  }
}
