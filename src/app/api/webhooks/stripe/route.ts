import { headers } from 'next/headers'
import Stripe from 'stripe'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
// getPayload/configPromise are already imported above and reused across the new
// failed-payment/refund/dispute handlers below.

// Constructing with a placeholder when the key is unset keeps this module importable at
// build time (and in dev without Stripe configured) — real API calls below still fail
// cleanly with a Stripe auth error instead of throwing at module load.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_unconfigured', {
  apiVersion: '2024-04-10' as any,
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature') as string

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret as string)
    } catch (err: any) {
      console.error(`Webhook signature verification failed.`, err.message)
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`)

      const orderId = paymentIntent.metadata?.orderId
      if (orderId) {
         try {
            const { finalizeOrder } = await import('@/lib/orders/finalizeOrder')
            const ok = await finalizeOrder(orderId, paymentIntent.metadata)
            if (!ok) {
              // Let Stripe retry — finalizeOrder failed for a reason other than "already handled".
              return new Response('finalizeOrder failed', { status: 500 })
            }
            console.log(`Successfully finalized order ${orderId} in Payload via webhook.`)
         } catch (updateErr) {
            console.error(`Failed to update order ${orderId} in Payload:`, updateErr)
            return new Response('finalizeOrder threw', { status: 500 })
         }
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const orderId = paymentIntent.metadata?.orderId
      if (orderId) {
        try {
          const payload = await getPayload({ config: configPromise })
          const order = await payload.findByID({ collection: 'orders', id: Number(orderId), depth: 0 })
          if (order && !order.isFinalized && order.status === 'pending') {
            // Cancelling releases the reserved stock/coupon/points via the afterOrderChange hook.
            await payload.update({ collection: 'orders', id: Number(orderId), data: { status: 'cancelled' }, context: { paymentFailed: true } })
          }
        } catch (err) {
          console.error(`Failed to cancel order ${orderId} after payment failure:`, err)
        }
      }
    }

    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge
      const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
      if (paymentIntentId) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
          const orderId = paymentIntent.metadata?.orderId
          if (orderId) {
            const payload = await getPayload({ config: configPromise })
            const order = await payload.findByID({ collection: 'orders', id: Number(orderId), depth: 0 })
            if (order && order.status !== 'refunded') {
              await payload.update({ collection: 'orders', id: Number(orderId), data: { status: 'refunded', paymentStatus: 'refunded' } })
            }
          }
        } catch (err) {
          console.error('Failed to sync Stripe refund to order:', err)
        }
      }
    }

    if (event.type === 'charge.dispute.created') {
      try {
        const dispute = event.data.object as Stripe.Dispute
        const payload = await getPayload({ config: configPromise })
        const { sendTrackedEmail } = await import('@/lib/emails/sendTrackedEmail')
        await sendTrackedEmail(payload, {
          from: 'Orders | Certified Aminos <support@certifiedaminos.com>',
          to: 'support@certifiedaminos.com',
          subject: `⚠️ Stripe dispute opened — charge ${dispute.charge}`,
          html: `<p>A chargeback/dispute was opened for charge <strong>${dispute.charge}</strong>, amount ${dispute.amount} ${dispute.currency}. Review it in the Stripe dashboard.</p>`,
        })
      } catch (err) {
        console.error('Failed to send dispute notification:', err)
      }
    }

    return new Response('Webhook handled successfully', { status: 200 })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }
}
