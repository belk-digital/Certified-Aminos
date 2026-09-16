import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    let title = searchParams.has('title')
      ? searchParams.get('title') || 'Certified Aminos'
      : 'Certified Aminos'

    // Strip redundant brand name to keep text short and clean
    if (title.includes(' | Certified Aminos')) {
      title = title.replace(' | Certified Aminos', '')
    }
    title = title.slice(0, 90)

    let description = searchParams.has('description')
      ? searchParams.get('description')?.slice(0, 120) // Shorter limit for description
      : 'Research-grade excellence. Dedicated to purity.'

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
            backgroundImage: 'radial-gradient(circle at 15% 15%, #1a1a1a 0%, #050505 55%)',
            fontFamily: 'sans-serif',
            padding: '80px',
            position: 'relative'
          }}
        >

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
            {/* Wordmark */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '38px',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Certified Aminos
              </span>
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
                certified-aminos.com
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
