'use server'

import { getPayloadUser } from '@/lib/auth/getPayloadUser'
import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePath } from 'next/cache'

export async function updatePayoutCurrency(currency: string) {
  const user = await getPayloadUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'affiliates',
    where: { user: { equals: user.id } },
    limit: 1,
    overrideAccess: true,
  })

  const affiliate = docs[0]
  if (!affiliate) return { success: false, error: 'Affiliate account not found' }

  try {
    await payload.update({
      collection: 'affiliates',
      id: affiliate.id,
      data: { payoutCurrency: currency } as any,
      overrideAccess: true,
    })
    revalidatePath('/affiliates/dashboard/settings')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update payout currency' }
  }
}
