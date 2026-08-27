import { emailLayout } from './emailLayout'

export async function generateAffiliateSaleEmail(affiliate: any, commissionAmount: number, isVoid: boolean): Promise<string> {
  const amount = (commissionAmount || 0).toFixed(2)
  const name = affiliate.displayName || 'Partner'
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://certifiedaminos.com'

  const title = isVoid ? 'Sale Tracked (Voided)' : 'New Sale Tracked!'
  const content = isVoid 
    ? `<p style="margin: 0 0 16px 0; font-size: 16px; color: #4A4A4A;">A sale was recently tracked to your affiliate account, but it has been marked as void.</p><p style="margin: 0 0 16px 0; font-size: 16px; color: #4A4A4A;">This typically happens if our system detects a self-referral or a policy violation.</p><p style="margin: 0 0 16px 0; font-size: 16px; color: #4A4A4A;">If you believe this was in error, please contact our support team.</p>`
    : `<p style="margin: 0 0 16px 0; font-size: 16px; color: #4A4A4A;">Great news! A new sale has been tracked to your affiliate account.</p><p style="margin: 0 0 24px 0; font-size: 16px; color: #4A4A4A;">Commission amount: <strong style="color: #1e5661; font-size: 20px;">$${amount}</strong></p><p style="margin: 0 0 16px 0; font-size: 16px; color: #4A4A4A;">Keep up the great work!</p>`

  return emailLayout({
    title,
    serverUrl,
    content: `
              <h2 style="margin: 0 0 20px 0; font-size: 24px; color: #0A0A0A; font-weight: 800; letter-spacing: -0.5px;">Hi ${name},</h2>
              ${content}
              <p style="margin: 32px 0 0 0; font-size: 16px; color: #4A4A4A; font-weight: 600;">Best regards,<br>The Certified Aminos Team</p>
    `
  })
}

