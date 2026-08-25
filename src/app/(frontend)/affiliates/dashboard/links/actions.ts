'use server'

import { getPayloadUser } from '@/lib/auth/getPayloadUser'
import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePath } from 'next/cache'
import { getTranslations } from 'next-intl/server'

export async function updateCouponCode(newCode: string) {
  const t = await getTranslations('affiliate.links')
  try {
    const user = await getPayloadUser()
    if (!user) {
      return { success: false, error: t('errorUnauthorized') }
    }

    // 1. Validation
    const cleanCode = newCode.trim().toUpperCase()

    if (cleanCode.length < 6) {
      return { success: false, error: t('errorTooShort') }
    }

    if (cleanCode.length > 20) {
      return { success: false, error: t('errorTooLong') }
    }

    // Check for alphanumeric only
    if (!/^[A-Z0-9]+$/.test(cleanCode)) {
      return { success: false, error: t('errorInvalidChars') }
    }

    const payload = await getPayload({ config })
    
    // 2. Fetch User's Affiliate Record
    const { docs: affiliates } = await payload.find({
      collection: 'affiliates',
      where: { user: { equals: user.id } },
      limit: 1,
      overrideAccess: true,
    })

    if (affiliates.length === 0 || affiliates[0].status !== 'approved') {
      return { success: false, error: t('errorNoActiveAccount') }
    }

    const affiliate = affiliates[0]
    const affiliateId = affiliate.id

    // 3. Uniqueness Check
    // Check if any *other* affiliate is already using this code
    const { docs: existingAffiliates } = await payload.find({
      collection: 'affiliates',
      where: { 
        and: [
          { couponCode: { equals: cleanCode } },
          { id: { not_equals: affiliateId } }
        ]
      },
      limit: 1,
      overrideAccess: true,
    })

    if (existingAffiliates.length > 0) {
      return { success: false, error: t('errorCodeTakenAffiliate') }
    }

    // Check if the code exists in the `coupons` collection and belongs to a different coupon
    const couponId = typeof affiliate.coupon === 'object' ? affiliate.coupon?.id : affiliate.coupon
    if (couponId) {
      const { docs: existingCoupons } = await payload.find({
        collection: 'coupons',
        where: {
          and: [
            { code: { equals: cleanCode } },
            { id: { not_equals: couponId } }
          ]
        },
        limit: 1,
        overrideAccess: true,
      })

      if (existingCoupons.length > 0) {
        return { success: false, error: t('errorCodeTakenStore') }
      }
    }

    // 4. Update the affiliate record
    await payload.update({
      collection: 'affiliates',
      id: affiliateId,
      data: {
        couponCode: cleanCode
      },
      overrideAccess: true,
    })

    // 5. Sync with the actual Coupon document if it exists
    if (couponId) {
      await payload.update({
        collection: 'coupons',
        id: couponId,
        data: {
          code: cleanCode
        },
        overrideAccess: true,
      })
    }

    // Revalidate the links page
    revalidatePath('/affiliates/dashboard/links', 'page')

    return { success: true, code: cleanCode }
    
  } catch (error: any) {
    console.error('Error updating coupon code:', error)
    return { success: false, error: error.message || t('errorUnexpected') }
  }
}
