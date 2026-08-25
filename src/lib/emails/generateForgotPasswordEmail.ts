import { emailLayout } from './emailLayout'

export async function generateForgotPasswordEmail(url: string, user?: any): Promise<string> {
  const name = user?.firstName || 'there'
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://helixbiochem.com';
  
  return emailLayout({
    title: 'Reset Your Password',
    serverUrl,
    content: `
              <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #0A0A0A; font-weight: 800; letter-spacing: -0.5px;">Password Reset Request</h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #4A4A4A; line-height: 1.6;">Hi ${name},</p>
              <p style="margin: 0 0 32px 0; font-size: 16px; color: #4A4A4A; line-height: 1.6;">We received a request to reset the password for your account at Helix Bio. If you made this request, please click the button below to securely set a new password.</p>
              
              <!-- CTAs -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <a href="${url}" style="display: inline-block; background-color: #0A0A0A; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; font-size: 13px; width: 100%; max-width: 250px; text-align: center;">Reset Password</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 12px 0; font-size: 14px; color: #4A4A4A; line-height: 1.6;">If the button above does not work, copy and paste the following link into your browser:</p>
              <p style="margin: 0 0 32px 0; font-size: 14px; color: #0A0A0A; font-weight: 500; line-height: 1.6; word-break: break-all;">
                <a href="${url}" style="color: #0A0A0A;">${url}</a>
              </p>
              
              <p style="margin: 0; font-size: 14px; color: #8A8A8A; line-height: 1.6;">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email and your account will remain secure.</p>
    `
  })
}
