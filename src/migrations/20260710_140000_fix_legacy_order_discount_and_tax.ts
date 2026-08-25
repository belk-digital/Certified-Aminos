import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Second follow-up to 20260710_120000_convert_cents_to_dollars: the WooCommerce import
// script (scripts/migrate-all-wc.ts) stored discountTotal and taxTotal in cents for legacy
// orders (orderNumber < 7000) too, same as subtotal/shippingTotal/total which the original
// migration already fixed. Missed here because neither field is in the "current era"
// cents list (discountTotal/taxTotal are plain dollars for orders >= 7000) — the cents-ness
// was specific to how the legacy importer wrote them, not the schema itself.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "orders" SET
      "discount_total" = "discount_total" / 100.0,
      "tax_total" = "tax_total" / 100.0
    WHERE "order_number" IS NOT NULL
      AND "order_number" ~ '^[0-9]+$'
      AND "order_number"::int < 7000
      AND ("discount_total" IS NOT NULL OR "tax_total" IS NOT NULL);
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "orders" SET
      "discount_total" = "discount_total" * 100,
      "tax_total" = "tax_total" * 100
    WHERE "order_number" IS NOT NULL
      AND "order_number" ~ '^[0-9]+$'
      AND "order_number"::int < 7000
      AND ("discount_total" IS NOT NULL OR "tax_total" IS NOT NULL);
  `)
}
