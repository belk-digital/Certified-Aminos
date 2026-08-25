import { sql } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

/**
 * Atomic (single-statement) stock/coupon/points reservation, used at order-creation time
 * instead of the old check-then-later-write pattern, which let concurrent checkouts both
 * pass a stale read and oversell the last unit / over-redeem a capped coupon or points
 * balance. Every function here does its check-and-write in one SQL statement so concurrent
 * requests serialize correctly at the database level.
 */

type ReserveItem = { productId: number; quantity: number }

export async function reserveStock(
  payload: Payload,
  items: ReserveItem[],
): Promise<{ success: true } | { success: false; error: string }> {
  const db = payload.db as any
  const reserved: ReserveItem[] = []

  for (const item of items) {
    const result: any = await db.drizzle.execute(sql`
      UPDATE "products" SET "stock" = "stock" - ${item.quantity}
      WHERE "id" = ${item.productId} AND "stock" >= ${item.quantity}
      RETURNING "stock"`)
    const rows = result.rows || result
    if (!rows || rows.length === 0) {
      // Roll back whatever we already reserved for earlier items in this same order.
      await releaseStock(payload, reserved)
      return { success: false, error: 'One or more items just sold out. Please review your cart.' }
    }
    reserved.push(item)
  }

  return { success: true }
}

export async function releaseStock(payload: Payload, items: ReserveItem[]): Promise<void> {
  const db = payload.db as any
  for (const item of items) {
    await db.drizzle.execute(sql`
      UPDATE "products" SET "stock" = "stock" + ${item.quantity}
      WHERE "id" = ${item.productId}`)
  }
}

export async function reserveCouponUsage(
  payload: Payload,
  couponId: number,
  discountAmount: number,
  isStoreCredit: boolean,
): Promise<{ success: true } | { success: false; error: string }> {
  const db = payload.db as any

  const usageResult: any = await db.drizzle.execute(sql`
    UPDATE "coupons" SET "usage_count" = COALESCE("usage_count", 0) + 1
    WHERE "id" = ${couponId} AND "is_active" IS NOT FALSE
      AND ("usage_limit" IS NULL OR COALESCE("usage_count", 0) < "usage_limit")
    RETURNING "id"`)
  const usageRows = usageResult.rows || usageResult
  if (!usageRows || usageRows.length === 0) {
    return { success: false, error: 'This coupon just reached its usage limit. Please remove it and try again.' }
  }

  if (isStoreCredit && discountAmount > 0) {
    const creditResult: any = await db.drizzle.execute(sql`
      UPDATE "coupons" SET "remaining_balance" = "remaining_balance" - ${discountAmount}
      WHERE "id" = ${couponId} AND "remaining_balance" >= ${discountAmount}
      RETURNING "id"`)
    const creditRows = creditResult.rows || creditResult
    if (!creditRows || creditRows.length === 0) {
      // Undo the usage-count increment above since the credit portion failed.
      await db.drizzle.execute(sql`
        UPDATE "coupons" SET "usage_count" = GREATEST(0, COALESCE("usage_count", 0) - 1)
        WHERE "id" = ${couponId}`)
      return { success: false, error: 'This store credit coupon no longer has enough balance.' }
    }
  }

  return { success: true }
}

export async function releaseCouponUsage(
  payload: Payload,
  couponId: number,
  discountAmount: number,
  isStoreCredit: boolean,
): Promise<void> {
  const db = payload.db as any
  await db.drizzle.execute(sql`
    UPDATE "coupons" SET "usage_count" = GREATEST(0, COALESCE("usage_count", 0) - 1)
    WHERE "id" = ${couponId}`)
  if (isStoreCredit && discountAmount > 0) {
    await db.drizzle.execute(sql`
      UPDATE "coupons" SET "remaining_balance" = COALESCE("remaining_balance", 0) + ${discountAmount}
      WHERE "id" = ${couponId}`)
  }
}

/**
 * Atomically deducts up to `desired` points from the user's balance, returning the amount
 * actually deducted (0 if they had none left, less than `desired` if a concurrent request
 * already spent some of it). The caller should use the returned amount — not `desired` — to
 * compute the order total, so the two can never disagree.
 */
export async function reservePoints(payload: Payload, userId: number, desired: number): Promise<number> {
  if (desired <= 0) return 0
  const db = payload.db as any

  const result: any = await db.drizzle.execute(sql`
    UPDATE "users" SET "hb_points" = "hb_points" - ${desired}
    WHERE "id" = ${userId} AND "hb_points" >= ${desired}
    RETURNING "hb_points"`)
  const rows = result.rows || result
  if (rows && rows.length > 0) {
    return desired
  }

  // Someone else spent some of the balance concurrently — fall back to whatever is left.
  const current = await payload.findByID({ collection: 'users', id: userId, overrideAccess: true, depth: 0 })
  const available = Math.max(0, Math.floor(current?.hbPoints || 0))
  if (available <= 0) return 0

  const fallback: any = await db.drizzle.execute(sql`
    UPDATE "users" SET "hb_points" = "hb_points" - ${available}
    WHERE "id" = ${userId} AND "hb_points" >= ${available}
    RETURNING "hb_points"`)
  const fallbackRows = fallback.rows || fallback
  return fallbackRows && fallbackRows.length > 0 ? available : 0
}

export async function releasePoints(payload: Payload, userId: number, amount: number): Promise<void> {
  if (amount <= 0) return
  const db = payload.db as any
  await db.drizzle.execute(sql`
    UPDATE "users" SET "hb_points" = "hb_points" + ${amount}
    WHERE "id" = ${userId}`)
}
