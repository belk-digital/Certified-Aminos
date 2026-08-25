import { NextResponse } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    
    // Calculate timestamp for 30 minutes ago
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000)

    // Find carts that were updated over 30 mins ago, and haven't had an email sent
    const { docs: carts } = await payload.find({
      collection: 'carts',
      where: {
        updatedAt: {
          less_than: thirtyMinsAgo.toISOString()
        },
        abandonedEmailSentAt: {
          exists: false
        }
      },
      depth: 1 
    })

    let sentCount = 0

    for (const cart of carts) {
      if (cart.items && cart.items.length > 0) {
        const user = cart.user as any
        
        if (user && user.email) {
          const firstName = user.firstName || 'there'

          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'Certified Aminos <support@certifiedaminos.com>',
            to: user.email,
            subject: 'Did you forget something in your cart?',
            html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Cart is Waiting</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; display: block; }
    body { margin: 0; padding: 0; background-color: #000000; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    .container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border-left: 1px solid #1f1f1f; border-right: 1px solid #1f1f1f; }
    .header { padding: 40px 20px; text-align: center; border-bottom: 1px solid #1f1f1f; background-color: #000000; }
    .logo-img { display: block; margin: 0 auto; height: 60px; max-width: 100%; }
    .content-block { padding: 50px 40px; text-align: center; }
    .eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #06b6d4; margin-bottom: 20px; }
    h1 { font-size: 32px; font-weight: 700; letter-spacing: -1px; margin: 0 0 20px 0; color: #ffffff; line-height: 1.2; }
    p { font-size: 16px; line-height: 1.6; color: #a3a3a3; margin: 0 0 30px 0; font-weight: 400; }
    .btn { display: inline-block; background-color: #06b6d4; color: #000000 !important; padding: 16px 40px; border-radius: 4px; text-decoration: none; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; transition: background-color 0.2s; }
    .footer { padding: 40px; text-align: center; background-color: #000000; border-top: 1px solid #1f1f1f; }
    .disclaimer { font-size: 11px; line-height: 1.6; color: #555555; font-weight: 400; }
  </style>
</head>
<body>
  <center style="width: 100%; background-color: #000000;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="container">
      <tr>
        <td class="header">
          <a href="https://helixbiochem.com">
            <img src="https://pub-0b0f2f98407442588d161ae09cb84207.r2.dev/email-assets/hb-logo.png" alt="Helix Bio" class="logo-img" />
          </a>
        </td>
      </tr>
      <tr>
        <td class="content-block">
          <div class="eyebrow">Inventory Notice</div>
          <h1>Your Research Is Waiting</h1>
          <p>
            Hi ${firstName}, we noticed you left high-grade research materials in your cart. Due to extremely high demand, we can only reserve this inventory for a limited time before it is released to the public.
          </p>
          <p>
            Return to the lab to secure your order and resume your research.
          </p>
          <a href="https://helixbiochem.com/cart" class="btn">Return to Cart</a>
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p class="disclaimer">
            <strong>FDA Disclaimer:</strong> These statements have not been evaluated by the Food and Drug Administration. These products are not intended to diagnose, treat, cure, or prevent any disease. All products offered are for laboratory and research use only.<br><br>
            © 2026 HelixBio. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`
          })

          // Mark this cart as emailed
          await payload.update({
            collection: 'carts',
            id: cart.id,
            data: {
              abandonedEmailSentAt: new Date().toISOString()
            }
          })

          sentCount++
        }
      }
    }

    return NextResponse.json({ success: true, message: `Processed abandoned carts. Sent ${sentCount} emails.` })
  } catch (error: any) {
    console.error('Cron Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
