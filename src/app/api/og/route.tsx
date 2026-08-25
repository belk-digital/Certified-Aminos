import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    let title = searchParams.has('title')
      ? searchParams.get('title') || 'Helix Bio'
      : 'Helix Bio'
      
    // Strip redundant brand name to keep text short and clean
    if (title.includes(' | HelixBioPeptides')) {
      title = title.replace(' | HelixBioPeptides', '')
    }
    title = title.slice(0, 90)
      
    let description = searchParams.has('description')
      ? searchParams.get('description')?.slice(0, 120) // Shorter limit for description
      : 'Research-grade excellence. Dedicated to purity.'

    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://helixbiochem.com'
    const logoUrl = `${serverUrl}/HelixBio%20Images/hb-logo.png`

    // We must use a PNG or JPG because OG image generator does not support WebP —
    // og-background.png is a pre-converted copy of HelixBio Images/multiple-vial.webp.
    const bgUrl = `${serverUrl}/HelixBio%20Images/og-background.png`

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#050505',
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            fontFamily: 'sans-serif',
            padding: '80px',
            position: 'relative'
          }}
        >
          {/* Dark Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              zIndex: 1,
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              zIndex: 2,
              width: '100%',
              height: '100%',
              justifyContent: 'space-between',
            }}
          >
            {/* Logo - Made bigger */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={logoUrl}
                alt="Helix Bio"
                style={{ height: '95px', objectFit: 'contain' }}
              />
            </div>

            {/* Content block */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                marginTop: 'auto',
                marginBottom: 'auto',
              }}
            >
              <h1
                style={{
                  fontSize: '76px',
                  fontWeight: 800,
                  color: '#ffffff',
                  margin: 0,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                {title}
              </h1>
              
              {description && (
                <p
                  style={{
                    fontSize: '32px',
                    color: '#e2e8f0',
                    margin: 0,
                    lineHeight: 1.4,
                    maxWidth: '90%',
                    fontWeight: 500,
                  }}
                >
                  {description}
                </p>
              )}
            </div>
            
            {/* Footer / Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '12px 32px',
                  borderRadius: '100px',
                  color: '#ffffff',
                  fontSize: '24px',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                }}
              >
                helixbiochem.com
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
