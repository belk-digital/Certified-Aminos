import { emailLayout } from './emailLayout'

export function generateMilitaryRejectionEmail(name: string): string {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://certifiedaminos.com';
  
  return emailLayout({
    title: 'Verification Update',
    serverUrl,
    content: `
              <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #0A0A0A; font-weight: 800; letter-spacing: -0.5px;">Hi ${name},</h2>
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #4A4A4A; line-height: 1.6;">We recently received your request for our military discount program.</p>
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #4A4A4A; line-height: 1.6;">Unfortunately, we were unable to clearly verify the ID document you provided, and your request could not be approved at this time.</p>
              
              <div style="background-color: #fdfbf7; border-left: 4px solid #1e5661; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <p style="margin: 0; font-size: 15px; color: #2A2A2A; line-height: 1.6;">If you believe this was an error, please try submitting a clearer photo of your ID on our website, or reply directly to this email to speak with our support team.</p>
              </div>
              
              <p style="margin: 0; font-size: 16px; color: #4A4A4A; line-height: 1.6; font-weight: 600;">Best regards,<br>The Certified Aminos Team</p>
    `
  })
}
