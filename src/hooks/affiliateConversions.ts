import type { CollectionAfterChangeHook } from 'payload'
import { updateAffiliateStats } from '@/lib/affiliates/stats'

export const afterAffiliateConversionChange: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (req.context?.disableHooks) return doc

  if (operation === 'create' || operation === 'update') {
    const affiliateId = typeof doc.affiliate === 'object' ? doc.affiliate.id : doc.affiliate
    if (affiliateId) {
      updateAffiliateStats(affiliateId, req.payload).catch(console.error)
    }
  }
  return doc
}
