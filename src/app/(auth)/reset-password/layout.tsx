import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.resetPassword')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children
}
