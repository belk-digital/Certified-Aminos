import { emailLayout } from './emailLayout'

export async function generateAffiliateWelcomeEmail(affiliate: any, user: any): Promise<string> {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://certifiedaminos.com';
  
  const affiliateName = affiliate.displayName || user?.firstName || 'Partner';
  const referralLink = `${serverUrl}/ref/${affiliate.referralSlug}`;
  const couponCode = affiliate.couponCode || '';
  const commissionRate = affiliate.commissionRate || 15;
  const cookieDuration = affiliate.cookieDurationDays || 30;
  
  return emailLayout({
    title: 'Welcome to the Partner Program',
    serverUrl,
    heroImage: 'https://pub-0b0f2f98407442588d161ae09cb84207.r2.dev/email-assets/ChatGPT%20Image%20Jul%2020%2C%202026%2C%2005_23_31%20AM.webp',
    content: `
              <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #0A0A0A; font-weight: 800; letter-spacing: -0.5px;">Hi ${affiliateName},</h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #4A4A4A; line-height: 1.6;">Your application has been instantly approved! We're thrilled to have you join Certified Aminos as an official partner. You can now start earning ${commissionRate}% commission on every referral.</p>
              
              <!-- Toolkit Card -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fdfbf7; border-radius: 12px; border: 1px solid #e2ddd3; margin-bottom: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                <tr>
                  <td style="padding: 30px;">
                    <h3 style="margin: 0 0 20px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #1e5661; font-weight: 700;">Your Partner Toolkit</h3>
                    
                    <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #0A0A0A;">Your Unique Referral Link</p>
                    <div style="background-color: #ffffff; padding: 12px 16px; border-radius: 6px; border: 1px dashed #1e5661; font-family: monospace; font-size: 16px; font-weight: bold; color: #1e5661; margin-bottom: 24px; word-break: break-all;">${referralLink}</div>
                    
                    <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #0A0A0A;">Your Custom ${commissionRate}% Discount Code</p>
                    <div style="background-color: #ffffff; padding: 12px 16px; border-radius: 6px; border: 1px dashed #1e5661; font-family: monospace; font-size: 16px; font-weight: bold; color: #1e5661; word-break: break-all;">${couponCode}</div>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #4A4A4A; line-height: 1.6;">Share your link or your code with your audience. When they use it, they get ${commissionRate}% off their order, and you get ${commissionRate}% commission!</p>
              
              <!-- CTA Button -->
              <div style="text-align: center;">
                <a href="${serverUrl}/account/partner" style="display: inline-block; padding: 16px 32px; background-color: #1e5661; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.05em;">View Your Dashboard</a>
              </div>
    `
  });
}
