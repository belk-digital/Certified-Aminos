'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getTranslations } from 'next-intl/server'
import { generateContactFormEmail } from '@/lib/emails/generateContactFormEmail'
import { sendTrackedEmail } from '@/lib/emails/sendTrackedEmail'
import { checkRateLimit } from '@/lib/rateLimit'
import { headers } from 'next/headers'

export async function submitContactForm(formData: FormData) {
  const t = await getTranslations('content.contactForm')
  try {
    const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const { allowed } = await checkRateLimit(`contact:${ip}`, 5, 60 * 60)
    if (!allowed) {
      return { error: t('errorUnexpected') }
    }

    const payload = await getPayload({ config: configPromise })

    const department = formData.get('department') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string

    if (!name || !email || !subject || !message) {
      return { error: t('errorRequiredFields') }
    }

    const html = generateContactFormEmail(name, email, department, subject, message)

    await sendTrackedEmail(payload, {
      from: `"${name}" <forms@certifiedaminos.com>`,
      to: 'support@helixbiochem.com',
      replyTo: email,
      subject: `[Contact Form] ${subject}`,
      html: html,
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error submitting contact form:', error)
    return { error: error.message || t('errorUnexpected') }
  }
}
