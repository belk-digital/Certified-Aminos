/**
 * Client for the PepBoss supplier API (https://pepboss.com/docs/api).
 * Server-only — PEPBOSS_API_KEY must never reach the browser bundle.
 */

const PEPBOSS_API_URL = process.env.PEPBOSS_API_URL || 'https://api.pepboss.com/v1'

export interface PepBossRecipient {
  name: string
  company?: string
  addressLine1: string
  addressLine2?: string
  city: string
  region: string
  postalCode: string
  countryCode: string
  phone?: string
}

export interface PepBossOrderItem {
  sku: string
  quantity: number
}

export type PepBossInventoryPolicy = 'require_available' | 'allow_backorder'

export interface PepBossAvailabilityItem {
  sku: string
  status: 'available' | 'out_of_stock' | 'restocking' | string
  orderableNow: boolean
  backorderEligible: boolean
  requestedQuantity: number
}

export interface PepBossAvailabilityResult {
  environment: 'test' | 'live'
  livemode: boolean
  simulated: boolean
  available: boolean
  canBackorder: boolean
  items: PepBossAvailabilityItem[]
  unavailableItems: PepBossAvailabilityItem[]
}

export interface PepBossOrder {
  id: string
  orderNumber: string
  externalOrderId: string
  status: string
  environment: 'test' | 'live'
  livemode: boolean
  simulated: boolean
  subtotalCents: number
  shippingCents: number
  totalCents: number
  inventoryPolicy: PepBossInventoryPolicy
  fulfillment: {
    state: string
    backorderedItemCount: number
    backorderedQuantity: number
    pendingBackorderedItemCount: number
    pendingBackorderedQuantity: number
  }
  items: Array<{
    sku: string
    quantity: number
    unitPriceCents: number
    lineTotalCents: number
  }>
  productionEffects: {
    walletDebited: boolean
    inventoryReserved: boolean
    fulfillmentCreated: boolean
    emailQueued: boolean
    productionWebhookQueued: boolean
  }
}

export class PepBossError extends Error {
  status: number
  body: any

  constructor(message: string, status: number, body: any) {
    super(message)
    this.name = 'PepBossError'
    this.status = status
    this.body = body
  }
}

function apiKey(): string {
  const key = process.env.PEPBOSS_API_KEY
  if (!key) throw new Error('PEPBOSS_API_KEY is not set')
  return key
}

async function pepbossFetch<T>(path: string, init: RequestInit & { idempotencyKey?: string } = {}): Promise<T> {
  const { idempotencyKey, headers, ...rest } = init

  const response = await fetch(`${PEPBOSS_API_URL}${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      ...headers,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new PepBossError(data?.error?.message || data?.message || `PepBoss request failed (${response.status})`, response.status, data)
  }

  return (data?.data ?? data) as T
}

/**
 * Checks stock without creating an order, charging shipping, or touching the wallet.
 * Call before payment to fail fast on out-of-stock lines.
 */
export async function checkAvailability(items: PepBossOrderItem[]): Promise<PepBossAvailabilityResult> {
  return pepbossFetch<PepBossAvailabilityResult>('/orders/availability', {
    method: 'POST',
    body: JSON.stringify({ items }),
  })
}

/**
 * Creates a server-priced, idempotent order. `idempotencyKey` must be unique per distinct
 * order body — reusing it with the same body replays the original result; reusing it with a
 * different body is rejected.
 */
export async function createOrder(params: {
  externalOrderId: string
  recipient: PepBossRecipient
  items: PepBossOrderItem[]
  inventoryPolicy: PepBossInventoryPolicy
  idempotencyKey: string
}): Promise<PepBossOrder> {
  const { idempotencyKey, ...body } = params
  return pepbossFetch<PepBossOrder>('/orders', {
    method: 'POST',
    idempotencyKey,
    body: JSON.stringify(body),
  })
}

export async function getOrder(id: string): Promise<PepBossOrder> {
  return pepbossFetch<PepBossOrder>(`/orders/${id}`, { method: 'GET' })
}

/**
 * Cancels an order before packing/postage begins. Reuse one stable idempotency key for
 * retries of the same cancellation — this is a distinct key from the order-creation one.
 */
export async function cancelOrder(id: string, reason: string, idempotencyKey: string): Promise<PepBossOrder> {
  return pepbossFetch<PepBossOrder>(`/orders/${id}/cancel`, {
    method: 'POST',
    idempotencyKey,
    body: JSON.stringify({ reason }),
  })
}

export async function getWalletBalance(): Promise<{ availableCents: number; currency: string }> {
  return pepbossFetch('/wallet', { method: 'GET' })
}
