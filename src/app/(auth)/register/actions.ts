'use server'

import jwt from 'jsonwebtoken'
import { getPayload } from 'payload'
import config from '@payload-config'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { sendTrackedEmail } from '@/lib/emails/sendTrackedEmail'
import { generateVerifyEmailEmail } from '@/lib/emails/generateVerifyEmailEmail'
import { checkRateLimit } from '@/lib/rateLimit'
import { headers } from 'next/headers'

export async function registerUser(input: RegisterInput) {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { allowed } = await checkRateLimit(`register:${ip}`, 5, 60 * 60)
  if (!allowed) {
    return { success: false as const, error: 'generic' as const }
  }

  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false as const, error: 'invalid' as const }
  }

  const { firstName, lastName, email, password } = parsed.data
  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email.toLowerCase() } },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs.length > 0) {
    return { success: false as const, error: 'emailInUse' as const }
  }

  try {
    const created = await payload.create({
      collection: 'users',
      data: {
        firstName,
        lastName,
        email,
        password,
        role: 'customer',
        authProvider: 'credentials',
      },
      overrideAccess: true,
    })

    // Send a verification email; login is blocked for credentials accounts until this
    // completes (see authorize() in authOptions.ts) — keeps a random email address from
    // being able to sign up and place orders as someone else.
    if (process.env.PAYLOAD_SECRET) {
      try {
        const token = jwt.sign({ userId: created.id, purpose: 'verify-email' }, process.env.PAYLOAD_SECRET, { expiresIn: '48h' })
        const base = process.env.NEXT_PUBLIC_SERVER_URL || 'https://certifiedaminos.com'
        const verifyUrl = `${base}/api/verify-email?token=${token}`
        const html = generateVerifyEmailEmail(firstName, verifyUrl)
        await sendTrackedEmail(payload, {
          from: 'Support | Certified Aminos <support@certifiedaminos.com>',
          to: email.toLowerCase(),
          subject: 'Verify your email - Certified Aminos',
          html,
        })
      } catch (err) {
        console.error('Failed to send verification email:', err)
      }
    }

    return { success: true as const }
  } catch {
    return { success: false as const, error: 'generic' as const }
  }
}
