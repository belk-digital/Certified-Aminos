import React from 'react'
import { Metadata } from 'next'
import { OrdersClient, OrderItem } from './OrdersClient'
import { getPayloadUser } from '@/lib/auth/getPayloadUser'
import { getPayload } from 'payload'
import config from '@payload-config'
import { redirect } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('account.orders')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const user = await getPayloadUser()
  if (!user) redirect('/login')

  const locale = await getLocale()
  const payload = await getPayload({ config })

  const { docs: orders } = await payload.find({
    collection: 'orders',
    where: {
      or: [
        { owner: { equals: user.id } },
        { guestEmail: { equals: user.email } }
      ]
    },
    sort: '-createdAt',
    limit: 100, // Fetch up to 100 orders
    overrideAccess: true,
  })

  const orderItems: OrderItem[] = orders.map(order => ({
    id: order.orderNumber || String(order.id),
    date: new Date(order.createdAt).toLocaleDateString(false ? 'es-US' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: order.status,
    total: order.total || 0,
    itemCount: order.items?.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) || 0
  }))

  return <OrdersClient orders={orderItems} />
}
