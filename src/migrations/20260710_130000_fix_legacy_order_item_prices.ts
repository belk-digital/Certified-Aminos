import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Follow-up to 20260710_120000_convert_cents_to_dollars: that migration converted
// orders.subtotal/shipping_total/total for legacy (orderNumber < 7000) orders, but missed
// orders_items.price for those same orders — the WooCommerce import script
// (scripts/migrate-all-wc.ts) stored line-item price in cents too. Anything that sums
// item.price * item.quantity directly (e.g. the account spending-overview breakdown)
// was showing these legacy line items ~100x too large relative to the now-corrected
// order totals.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "orders_items" oi
    SET "price" = oi."price" / 100.0
    FROM "orders" o
    WHERE oi."_parent_id" = o."id"
      AND oi."price" IS NOT NULL
      AND o."order_number" IS NOT NULL
      AND o."order_number" ~ '^[0-9]+$'
      AND o."order_number"::int < 7000;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "orders_items" oi
    SET "price" = oi."price" * 100
    FROM "orders" o
    WHERE oi."_parent_id" = o."id"
      AND oi."price" IS NOT NULL
      AND o."order_number" IS NOT NULL
      AND o."order_number" ~ '^[0-9]+$'
      AND o."order_number"::int < 7000;
  `)
}
