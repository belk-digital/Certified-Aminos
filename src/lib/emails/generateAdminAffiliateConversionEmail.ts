import { emailLayout } from './emailLayout'

export function generateAdminAffiliateConversionEmail(order: any, affiliate: any, commissionAmount: number): string {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://helixbiochem.com';
  
  const affiliateName = affiliate.displayName || 'Partner';
  const orderNumber = order.orderNumber || order.id || 'N/A';
  const orderTotal = `$${(order.total || 0).toFixed(2)}`;
  const commissionFormatted = `$${(commissionAmount || 0).toFixed(2)}`;
  const customerEmail = (typeof order.owner === 'object' && order.owner !== null ? order.owner.email : order.guestEmail) || 'N/A';
  const adminUrl = `${serverUrl}/admin/collections/orders/${order.id}`;

  return emailLayout({
    title: 'New Affiliate Conversion! 🎉',
    serverUrl,
    content: `
              <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #0A0A0A; font-weight: 800; letter-spacing: -0.5px;">New Conversion Tracked</h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #4A4A4A; line-height: 1.6;">An order has been placed by a customer using an affiliate link or coupon.</p>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fdfbf7; border-radius: 12px; border: 1px solid #e2ddd3; margin-bottom: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 8px 0;"><span style="font-weight: bold; color: #8A8A8A; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; width: 120px;">Affiliate:</span> <strong style="color: #0A0A0A;">${affiliateName}</strong></p>
                    <p style="margin: 0 0 8px 0;"><span style="font-weight: bold; color: #8A8A8A; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; width: 120px;">Order Number:</span> <strong style="color: #0A0A0A;">#${orderNumber}</strong></p>
                    <p style="margin: 0 0 8px 0;"><span style="font-weight: bold; color: #8A8A8A; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; width: 120px;">Order Total:</span> <strong style="color: #0A0A0A;">${orderTotal}</strong></p>
                    <p style="margin: 0 0 8px 0;"><span style="font-weight: bold; color: #8A8A8A; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; width: 120px;">Commission:</span> <strong style="color: #1e5661; font-size: 16px;">${commissionFormatted}</strong></p>
                    <p style="margin: 0;"><span style="font-weight: bold; color: #8A8A8A; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; width: 120px;">Customer:</span> <strong style="color: #0A0A0A;">${customerEmail}</strong></p>
                  </td>
                </tr>
              </table>

              <div style="text-align: center;">
                <a href="${adminUrl}" style="display: inline-block; padding: 16px 32px; background-color: #1e5661; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">View Order in Admin</a>
              </div>
    `
  })
}
