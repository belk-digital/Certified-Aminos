import React from 'react'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { CheckoutClient } from './CheckoutClient'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('checkout')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default function CheckoutPage() {
  return <CheckoutClient />
}
