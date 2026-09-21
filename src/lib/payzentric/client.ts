import crypto from 'crypto'

/**
 * Client for the Payzentric cryptocurrency payment API (https://onramp.payzentric.com).
 * Server-only — PAYZENTRIC_SUBSCRIPTION_KEY must never reach the browser bundle. Wallet identity is
 * resolved server-side by Payzentric from the subscription key; we never send or store a
 * wallet address in our own code.
 */

const PAYZENTRIC_BASE_URL = 'https://onramp.payzentric.com'

function apiKey(): string {
  // Using PAYZENTRIC_SUBSCRIPTION_KEY as per Payzentric docs convention
  const key = process.env.PAYZENTRIC_SUBSCRIPTION_KEY || process.env.PAYZENTRIC_API_KEY
  if (!key) throw new Error('PAYZENTRIC_SUBSCRIPTION_KEY is not set')
  return key
}

export class PayzentricError extends Error {
  status: number
  body: any

  constructor(message: string, status: number, body: any) {
    super(message)
    this.name = 'PayzentricError'
    this.status = status
    this.body = body
  }
}

async function payzentricFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${PAYZENTRIC_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey(),
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new PayzentricError(data?.error || data?.message || `Payzentric request failed (${response.status})`, response.status, data)
  }

  return (data?.data ?? data) as T
}

export interface PayzentricLineItem {
  label: string
  priceUsd: number
  qty?: number
}

export interface PayzentricReceipt {
  id: string
  paymentUrl: string
  status: string
  redirectUrl?: string
  webhookUrl?: string
}

/**
 * Creates a receipt / payment portal link. `id` should be our own order id, frozen once —
 * Payzentric treats it as the receipt id, so it must be unique per order (never reused across
 * retries with a different body, same as any idempotency key).
 */
export async function createReceipt(params: {
  id: string
  lineItems: PayzentricLineItem[]
  totalUsd: number
  redirectUrl: string
  webhookUrl: string
  billingFirstName?: string
  billingLastName?: string
  billingEmail?: string
}): Promise<PayzentricReceipt> {
  const { redirectUrl, webhookUrl, ...rest } = params
  return payzentricFetch<PayzentricReceipt>('/api/receipts', {
    method: 'POST',
    body: JSON.stringify({
      ...rest,
      redirect_url: redirectUrl,
      webhook_url: webhookUrl,
    }),
  })
}

export interface PayzentricReceiptStatus {
  id: string
  status: 'generated' | 'pending' | 'completed' | 'failed' | 'refunded' | 'tx_mined' | 'recipient_validated' | 'tx_mismatch' | string
  transactionHash?: string | null
  currency?: string
  amount?: number
  failureCode?: string
  failureCategory?: string
  failureReason?: string
  failureAction?: string
}

export async function getReceiptStatus(receiptId: string): Promise<PayzentricReceiptStatus> {
  return payzentricFetch<PayzentricReceiptStatus>(`/api/receipts/status?receiptId=${encodeURIComponent(receiptId)}`, {
    method: 'GET',
  })
}

/**
 * Verifies the X-Payzentric-Signature header (HMAC-SHA256 of the raw body, keyed with our own
 * API key). Must be called with the raw request body text, before JSON parsing.
 */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false
  const expected = crypto.createHmac('sha256', apiKey()).update(rawBody).digest('hex')
  const received = signatureHeader.replace(/^sha256=/, '')

  const expectedBuffer = Buffer.from(expected, 'hex')
  const receivedBuffer = Buffer.from(received, 'hex')
  if (expectedBuffer.length !== receivedBuffer.length) return false
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
}
