import { escapeHtml } from './escapeHtml'
import { emailLayout } from './emailLayout'

export function generateContactFormEmail(
  rawName: string,
  rawEmail: string,
  rawDepartment: string,
  rawSubject: string,
  rawMessage: string
): string {
  const name = escapeHtml(rawName)
  const email = escapeHtml(rawEmail)
  const department = escapeHtml(rawDepartment)
  const subject = escapeHtml(rawSubject)
  const message = escapeHtml(rawMessage)

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://certifiedaminos.com';

  return emailLayout({
    title: 'New Contact Form Submission',
    serverUrl,
    content: `
      <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #0A0A0A; font-weight: 800; letter-spacing: -0.5px;">Contact Form Submission</h2>
      <p style="margin: 0 0 24px 0; font-size: 16px; color: #4A4A4A; line-height: 1.6;">A new message was received from the contact page form.</p>
      
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fdfbf7; border-radius: 12px; border: 1px solid #e2ddd3; margin-bottom: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
        <tr>
          <td style="padding: 24px;">
            <p style="margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #8A8A8A; font-weight: bold;">Name</p>
            <p style="margin: 0 0 16px 0; font-size: 16px; color: #0A0A0A; font-weight: 500; word-break: break-word;">${name}</p>

            <p style="margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #8A8A8A; font-weight: bold;">Email</p>
            <p style="margin: 0 0 16px 0; font-size: 16px; color: #0A0A0A; font-weight: 500; word-break: break-word;">${email}</p>

            <p style="margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #8A8A8A; font-weight: bold;">Department</p>
            <p style="margin: 0 0 16px 0; font-size: 16px; color: #0A0A0A; font-weight: 500; text-transform: capitalize;">${department || 'General'}</p>

            <p style="margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #8A8A8A; font-weight: bold;">Subject</p>
            <p style="margin: 0; font-size: 16px; color: #0A0A0A; font-weight: 500; word-break: break-word;">${subject}</p>
          </td>
        </tr>
      </table>

      <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #1e5661; font-weight: 800;">Message</h3>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; border: 1px dashed #d1d5db; font-size: 16px; color: #4b5563; line-height: 1.6; white-space: pre-wrap; word-break: break-word;">${message}</div>
      
      <p style="margin: 24px 0 0 0; font-size: 13px; color: #8A8A8A; font-style: italic; text-align: center;">You can reply directly to this email to respond to ${name}.</p>
    `
  })
}
