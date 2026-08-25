import { escapeHtml } from './escapeHtml'
import { emailLayout } from './emailLayout'

export function generateVerifyEmailEmail(firstName: string | null | undefined, verifyUrl: string): string {
  const name = escapeHtml(firstName || 'there')
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://helixbiochem.com';
  return emailLayout({
    title: 'Verify your email',
    serverUrl,
    content: `
              <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #111827; text-align: center;">Welcome!</h2>
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #4A4A4A; text-align: center;">Hi ${name}, please confirm this is your email address to finish setting up your account.</p>
              <div style="text-align: center;">
                <a href="${verifyUrl}" style="display: inline-block; padding: 14px 28px; background-color: #1e5661; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: bold; border-radius: 8px;">Verify Email</a>
              </div>
              <p style="margin: 20px 0 0 0; font-size: 13px; color: #8A8A8A; text-align: center;">This link expires in 48 hours. If you didn't create this account, you can safely ignore this email.</p>
    `
  })
}
