import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.login')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
