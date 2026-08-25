import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Third follow-up to 20260710_120000_convert_cents_to_dollars. The original WooCommerce
// importer (scripts/migrate-all-wc.ts:274) never computed a real subtotal for legacy
// orders — it just copied `total` into `subtotal` as a placeholder ("// approx"), so every
// single legacy order (607/607) has subtotal === total, which is wrong whenever a discount
// was applied (Subtotal should be the pre-discount line-item total).
//
// Verified against 8 real orders that the correct relationship is:
//   subtotal = sum(orders_items.price * quantity) + discount_total
// which reconciles exactly (subtotal - discount_total + shipping_total + tax_total +
// fee_total = total) for every order checked. This migration recomputes subtotal using
// that formula for all legacy orders (orderNumber < 7000). Must run after
// 20260710_130000_fix_legacy_order_item_prices and 20260710_140000_fix_legacy_order_discount_and_tax
// so it operates on already-corrected dollar values.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "orders" o
    SET "subtotal" = COALESCE(item_sums.total, 0) + COALESCE(o."discount_total", 0)
    FROM (
      SELECT "_parent_id", SUM("price" * "quantity") AS total
      FROM "orders_items"
      GROUP BY "_parent_id"
    ) AS item_sums
    WHERE item_sums."_parent_id" = o."id"
      AND o."order_number" IS NOT NULL
      AND o."order_number" ~ '^[0-9]+$'
      AND o."order_number"::int < 7000;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Not reversible to the original (wrong) approximation without re-deriving it from
  // `total`, which is exactly what the buggy state was — restore subtotal = total.
  await db.execute(sql`
    UPDATE "orders" SET "subtotal" = "total"
    WHERE "order_number" IS NOT NULL
      AND "order_number" ~ '^[0-9]+$'
      AND "order_number"::int < 7000;
  `)
}
