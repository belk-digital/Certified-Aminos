import { escapeHtml } from './escapeHtml'
import { emailLayout } from './emailLayout'

export function generateMilitaryAdminEmail(rawName: string, rawEmail: string, rawBranch: string, token: string): string {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://helixbiochem.com';
  const approveUrl = `${serverUrl}/api/military/action?action=approve&token=${token}`;
  const rejectUrl = `${serverUrl}/api/military/action?action=reject&token=${token}`;
  const name = escapeHtml(rawName)
  const email = escapeHtml(rawEmail)
  const branch = escapeHtml(rawBranch)

  return emailLayout({
    title: 'Verification Request Received',
    serverUrl,
    content: `
              <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #0A0A0A; font-weight: 800; letter-spacing: -0.5px;">Applicant Details</h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #4A4A4A; line-height: 1.6;">A new military/first-responder discount verification request has been received. Please review the attached ID photo.</p>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fdfbf7; border-radius: 12px; border: 1px solid #e2ddd3; margin-bottom: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #8A8A8A; font-weight: bold;">Name</p>
                    <p style="margin: 0 0 16px 0; font-size: 16px; color: #0A0A0A; font-weight: 500;">${name}</p>
                    
                    <p style="margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #8A8A8A; font-weight: bold;">Email</p>
                    <p style="margin: 0 0 16px 0; font-size: 16px; color: #0A0A0A; font-weight: 500;">${email}</p>
                    
                    <p style="margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #8A8A8A; font-weight: bold;">Service Branch</p>
                    <p style="margin: 0; font-size: 16px; color: #0A0A0A; font-weight: 500; text-transform: capitalize;">${branch}</p>
                  </td>
                </tr>
              </table>

              <!-- Action Buttons -->
              <div style="text-align: center; margin-top: 16px;">
                <a href="${approveUrl}" style="display: inline-block; padding: 14px 28px; background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; border-radius: 8px; margin: 8px;">Approve Request</a>
                <a href="${rejectUrl}" style="display: inline-block; padding: 14px 28px; background-color: transparent; color: #ef4444; border: 2px solid #ef4444; text-decoration: none; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; border-radius: 8px; margin: 8px;">Deny Request</a>
              </div>
    `
  })
}
