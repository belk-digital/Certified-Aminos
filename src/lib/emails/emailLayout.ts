export function emailLayout({ 
  title, 
  content, 
  heroImage = null, 
  serverUrl = 'https://certifiedaminos.com' 
}: { 
  title: string, 
  content: string, 
  heroImage?: string | null,
  serverUrl?: string 
}): string {
  // Enforce production domain for emails
  serverUrl = 'https://certifiedaminos.com';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAFAFA; font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAFAFA; padding: 60px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" max-width="640" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.04);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #ffffff; padding: 48px 48px 24px 48px; text-align: center;">
              <a href="${serverUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                <span style="font-family: Arial, sans-serif; font-size: 22px; font-weight: 700; letter-spacing: 2px; color: #0a1323; text-transform: uppercase;">Certified Aminos</span>
              </a>
            </td>
          </tr>
          
          ${heroImage ? `
          <!-- Hero Image -->
          <tr>
            <td style="padding: 0 48px 24px 48px; background-color: #ffffff;">
              <div style="border-radius: 12px; overflow: hidden;">
                <img src="${heroImage.startsWith('http') ? heroImage : serverUrl + heroImage}" alt="${title}" style="width: 100%; max-height: 180px; object-fit: cover; object-position: center; display: block;" />
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Content -->
          <tr>
            <td style="padding: 12px 48px 60px 48px; color: #0A0A0A; line-height: 1.6;">
              ${content}
            </td>
          </tr>
          
          <!-- Signature & Footer -->
          <tr>
            <td style="background-color: #FAFAFA; padding: 48px; text-align: center;">
              <p style="margin: 0 0 16px 0; color: #0A0A0A; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em;">
                <a href="${serverUrl}" target="_blank" style="color: #0A0A0A; text-decoration: none;">Certified Aminos</a>
              </p>
              <p style="margin: 0 0 24px 0; color: #6B7280; font-size: 13px; line-height: 1.6;">Research-grade excellence.<br/>Dedicated to purity.</p>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${serverUrl}/shop" style="color: #0A0A0A; text-decoration: none; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 12px;">Shop</a>
                    <a href="${serverUrl}/account" style="color: #0A0A0A; text-decoration: none; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 12px;">Account</a>
                    <a href="${serverUrl}/contact-us" style="color: #0A0A0A; text-decoration: none; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 12px;">Support</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #9CA3AF; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em;">&copy; ${new Date().getFullYear()} <a href="${serverUrl}" target="_blank" style="color: inherit; text-decoration: none;">Certified Aminos</a>. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
