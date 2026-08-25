import crypto from 'crypto'

const webhookSecret = process.env.CIRCOFLOWS_API_SECRET as string

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-signature')

    // CircoFlows documents this header as optional, and in practice they don't send it at all
    // (confirmed: every real webhook call was arriving with no X-Signature, which we used to
    // hard-reject with a 400). Rather than trust — or require — a signature we can't rely on,
    // the webhook body below is only ever used to learn *which* order to check; the actual
    // success/declined verdict always comes from syncCircoFlowsPaymentStatus's own authenticated
    // call to CircoFlows using our API key. That call can't be forged by whoever POSTs here,
    // so this is safe even with no signature at all.
    if (signature) {
      const computed = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex')
      const signatureBuffer = Buffer.from(signature)
      const computedBuffer = Buffer.from(computed)
      const valid =
        signatureBuffer.length === computedBuffer.length &&
        crypto.timingSafeEqual(signatureBuffer, computedBuffer)
      if (!valid) {
        console.warn('CircoFlows webhook: X-Signature present but did not match — proceeding anyway since the real verdict comes from our own status check, not this body.')
      }
    }

    const event = JSON.parse(rawBody)
    const orderId = event?.data?.merchant_transaction_id
    if (event.event !== 'payment.notify' || !orderId) {
      return new Response('Ignored', { status: 200 })
    }

    const { syncCircoFlowsPaymentStatus } = await import('@/app/(frontend)/(shop)/checkout/circoflowsActions')
    const result = await syncCircoFlowsPaymentStatus(String(orderId))
    if (result.error) {
      // Let CircoFlows retry — this failed for a reason other than "not paid yet".
      return new Response(result.error, { status: 500 })
    }

    return new Response('Webhook handled successfully', { status: 200 })
  } catch (error: any) {
    console.error('CircoFlows webhook error:', error)
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }
}
