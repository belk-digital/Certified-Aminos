import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getPayloadUser } from '@/lib/auth/getPayloadUser'
import { updateAffiliateStats } from '@/lib/affiliates/stats'
import { escapeHtml } from '@/lib/emails/escapeHtml'
import { sendTrackedEmail } from '@/lib/emails/sendTrackedEmail'

export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
    
    // Auth check
    const user = await getPayloadUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    
    // Get affiliate profile
    const affiliates = await payload.find({
      collection: 'affiliates',
      where: { user: { equals: userId } },
      limit: 1,
    })
    
    const affiliate = affiliates.docs[0]
    if (!affiliate) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 })
    }

    const body = await request.json()
    const { amount, method, details } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Recompute totals from the real conversions/payout-requests instead of trusting the
    // affiliate doc's cached fields, which are now write-protected but could still be stale.
    await updateAffiliateStats(affiliate.id, payload)
    const freshAffiliate = await payload.findByID({ collection: 'affiliates', id: affiliate.id, overrideAccess: true })

    const approved = freshAffiliate.totalCommissionApproved || 0
    const requested = freshAffiliate.totalCommissionRequested || 0
    const available = approved - requested

    if (amount > available) {
      return NextResponse.json({ error: 'Amount exceeds available balance' }, { status: 400 })
    }

    // Create the request
    await payload.create({
      collection: 'payout-requests',
      data: {
        affiliate: affiliate.id,
        amount,
        payoutMethod: method,
        payoutDetails: details,
        status: 'pending',
      },
      overrideAccess: true, // Internal creation
    })

    // Send email to admin
    try {
      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb;">
        <div style="font-family: sans-serif; color: #111827; width: 100%; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; line-height: 1.6;">
          <h2 style="color: #000; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">New Affiliate Payout Request</h2>
          <p><strong>Affiliate:</strong> ${escapeHtml(affiliate.displayName || affiliate.referralSlug || 'Unknown')} (${escapeHtml(user.email)})</p>
          <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
          <p><strong>Method:</strong> <span style="text-transform: uppercase;">${escapeHtml(method)}</span></p>
          <p><strong>Payout Details:</strong></p>
          <p style="background: #f3f4f6; padding: 12px; border-radius: 6px; font-family: monospace;">${escapeHtml(details)}</p>
          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">Please log in to the Payload admin panel to review, approve, and process this payout request.</p>
        </div>
</body>
</html>
      `
      await sendTrackedEmail(payload, {
        from: `"Payout Request" <forms@certifiedaminos.com>`,
        to: 'support@certifiedaminos.com',
        subject: `[Payout Request] $${amount.toFixed(2)} from ${affiliate.displayName || affiliate.referralSlug}`,
        html: emailHtml,
      })
    } catch (emailError) {
      console.error('Failed to send payout request email:', emailError)
      // We don't fail the request if the email fails
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Payout Request Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
