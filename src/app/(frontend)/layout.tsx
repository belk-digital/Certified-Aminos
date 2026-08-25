import React from 'react'
import { getTranslations, getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import Script from 'next/script'
import { AuthSessionProvider } from '@/components/providers/AuthSessionProvider'
import { LayoutClientWrapper } from '@/components/shared/LayoutClientWrapper'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'
import { SmoothScroll } from '@/components/shared/SmoothScroll'
import { Toaster } from '@/components/ui/sonner'
import { GlobalNavigationSpinner } from '@/components/shared/GlobalNavigationSpinner'
import { CustomScrollbar } from '@/components/shared/CustomScrollbar'
import { getOgImageUrl } from '@/lib/utils'

import '@/app/globals.css'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export async function generateMetadata() {
  const t = await getTranslations('common')
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'https://certifiedaminos.com'),
    title: 'Certified Aminos',
    description: t('siteTagline'),
    openGraph: {
      images: [{ url: getOgImageUrl('Certified Aminos', t('siteTagline')) }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [getOgImageUrl('Certified Aminos', t('siteTagline'))],
    },
  }
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages()

  return (
    <html lang="en" translate="no" className="min-h-screen notranslate" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pub-0b0f2f98407442588d161ae09cb84207.r2.dev" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Syncopate:wght@400;700&display=swap"
          rel="stylesheet"
        />
        {GA_MEASUREMENT_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        {process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID && (
          <Script id="microsoft-clarity-init" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}");
            `}
          </Script>
        )}
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <AuthSessionProvider>
          <NextIntlClientProvider messages={messages}>
            <div className="min-h-screen bg-cream text-ink font-sans antialiased print:bg-white print:min-h-0">
              <React.Suspense fallback={null}>
                <GlobalNavigationSpinner />
              </React.Suspense>
              <SmoothScroll>
                <CustomScrollbar />
                <LayoutClientWrapper header={<Header />} footer={<Footer />}>
                  {children}
                </LayoutClientWrapper>
                <Toaster />
              </SmoothScroll>
            </div>
          </NextIntlClientProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
