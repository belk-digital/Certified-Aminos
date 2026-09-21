import { verifyWebhookSignature } from '@/lib/payzentric/client'

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-payzentric-signature')

    if (!verifyWebhookSignature(rawBody, signature)) {
      console.warn('Payzentric webhook: invalid or missing X-Payzentric-Signature — ignoring.')
      return new Response('Invalid signature', { status: 401 })
    }

    const event = req.headers.get('x-payzentric-event')
    const body = JSON.parse(rawBody)
    const receiptId = body?.receiptId
    if (event !== 'receipt.status_updated' || !receiptId) {
      return new Response('Ignored', { status: 200 })
    }

    // The webhook body only tells us *which* receipt changed — the actual status/amount truth
    // always comes from our own authenticated call to Payzentric's status endpoint,
    // so a forged webhook body can't finalize an order on its own.
    const { syncPayzentricPaymentStatus } = await import('@/app/(frontend)/(shop)/checkout/payzentricActions')
    const result = await syncPayzentricPaymentStatus(String(receiptId))
    if (result.error) {
      return new Response(result.error, { status: 500 })
    }

    return new Response('Webhook handled successfully', { status: 200 })
  } catch (error: any) {
    console.error('Payzentric webhook error:', error)
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }
}
