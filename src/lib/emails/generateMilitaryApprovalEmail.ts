import { emailLayout } from './emailLayout'

export function generateMilitaryApprovalEmail(name: string, couponCode: string): string {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://certifiedaminos.com';
  
  return emailLayout({
    title: 'Thank you for your service! 🇺🇸',
    serverUrl,

    content: `
              <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #0A0A0A; font-weight: 800; letter-spacing: -0.5px;">Hi ${name},</h2>
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #4A4A4A; line-height: 1.6;">Your military ID has been successfully verified by our team. We deeply appreciate your service!</p>
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #4A4A4A; line-height: 1.6;">As a token of our gratitude, here is your unique 30% off discount code:</p>
              
              <!-- Coupon Code -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <div style="background-color: #fdfbf7; border: 1px dashed #1e5661; padding: 24px; border-radius: 12px; display: inline-block;">
                      <span style="font-size: 28px; font-weight: 800; letter-spacing: 2px; color: #1e5661;">${couponCode}</span>
                    </div>
                    <p style="margin: 16px 0 0 0; font-size: 13px; color: #8A8A8A; font-style: italic;">Note: This coupon is locked exclusively to your email address and cannot be shared.</p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align: center;">
                <a href="${serverUrl}/shop" style="display: inline-block; padding: 16px 32px; background-color: #1e5661; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.05em;">Shop Now</a>
              </div>
    `
  })
}
