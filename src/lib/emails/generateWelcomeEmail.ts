import { emailLayout } from './emailLayout'

export async function generateWelcomeEmail(user: any): Promise<string> {
  const name = user.firstName || 'there'
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://helixbiochem.com'
  
  const content = `
    <!-- Huge Header -->
    <h2 style="margin: 0 0 24px 0; font-size: 40px; color: #0A0A0A; font-weight: 800; letter-spacing: -2px; line-height: 1.1;">Welcome,<br/>${name}.</h2>
    
    <p style="margin: 0 0 48px 0; font-size: 18px; color: #4A4A4A; line-height: 1.6; max-width: 480px;">We're absolutely thrilled to have you join the Helix Bio community. You now have full access to our catalog of premium, research-grade peptides.</p>
    
    <!-- Editorial Benefits List -->
    <p style="margin: 0 0 32px 0; font-size: 12px; font-weight: 800; color: #0A0A0A; text-transform: uppercase; letter-spacing: 0.15em; border-bottom: 2px solid #0A0A0A; padding-bottom: 16px;">Your Account Benefits</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 48px;">
      <tr>
        <td width="48" valign="top" style="padding-bottom: 32px;">
          <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 800; color: #9CA3AF; font-family: monospace;">01</p>
        </td>
        <td valign="top" style="padding-bottom: 32px;">
          <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #0A0A0A; font-weight: 800; letter-spacing: -0.5px;">Speed through checkout</h3>
          <p style="margin: 0; font-size: 15px; color: #6B7280; line-height: 1.6;">Save your details securely for lightning-fast future orders.</p>
        </td>
      </tr>
      <tr>
        <td width="48" valign="top" style="padding-bottom: 32px;">
          <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 800; color: #9CA3AF; font-family: monospace;">02</p>
        </td>
        <td valign="top" style="padding-bottom: 32px;">
          <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #0A0A0A; font-weight: 800; letter-spacing: -0.5px;">Track your research</h3>
          <p style="margin: 0; font-size: 15px; color: #6B7280; line-height: 1.6;">Easily view your entire order history and live shipping status in one place.</p>
        </td>
      </tr>
      <tr>
        <td width="48" valign="top">
          <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 800; color: #9CA3AF; font-family: monospace;">03</p>
        </td>
        <td valign="top">
          <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #0A0A0A; font-weight: 800; letter-spacing: -0.5px;">Earn HB Points</h3>
          <p style="margin: 0; font-size: 15px; color: #6B7280; line-height: 1.6;">Get rewarded on every single purchase for future discounts.</p>
        </td>
      </tr>
    </table>
    
    <!-- Edge-to-edge Button CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center">
          <a href="${serverUrl}/shop" style="display: block; background-color: #0A0A0A; color: #ffffff; text-decoration: none; padding: 24px; border-radius: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; font-size: 13px; text-align: center; width: 100%; box-sizing: border-box;">Explore Our Batches</a>
        </td>
      </tr>
    </table>
  `

  return emailLayout({
    title: 'Welcome to Helix Bio',
    content,
    heroImage: 'https://pub-0b0f2f98407442588d161ae09cb84207.r2.dev/email-assets/ChatGPT%20Image%20Jul%2020%2C%202026%2C%2005_23_31%20AM.webp',
    serverUrl
  })
}
