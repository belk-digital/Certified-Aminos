import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Standardizes every monetary field that was historically stored in integer cents to
// decimal dollars, matching the convention Products/Orders totals/checkout math already
// used. See the migration plan for the full rationale — this is a staging-only direct
// value conversion (no dual-read period needed since there's no production data at risk).
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payout_requests" RENAME COLUMN "amount_cents" TO "amount";

    UPDATE "orders" SET "fee_total" = "fee_total" / 100.0 WHERE "fee_total" IS NOT NULL;
    UPDATE "orders_applied_fees" SET "amount" = "amount" / 100.0 WHERE "amount" IS NOT NULL;

    -- Legacy WooCommerce-migrated orders (orderNumber < 7000) stored subtotal/shippingTotal/total
    -- in cents too — convert them so the frontend's old isMigrated re-interpretation shim
    -- (now removed from the code) is no longer needed.
    UPDATE "orders" SET
      "subtotal" = "subtotal" / 100.0,
      "shipping_total" = "shipping_total" / 100.0,
      "total" = "total" / 100.0
    WHERE "order_number" IS NOT NULL
      AND "order_number" ~ '^[0-9]+$'
      AND "order_number"::int < 7000;

    UPDATE "coupons" SET
      "min_spend" = "min_spend" / 100.0,
      "store_credit_amount" = "store_credit_amount" / 100.0,
      "remaining_balance" = "remaining_balance" / 100.0
    WHERE "min_spend" IS NOT NULL OR "store_credit_amount" IS NOT NULL OR "remaining_balance" IS NOT NULL;

    UPDATE "coupons" SET "value" = "value" / 100.0
    WHERE "type" = 'fixed_amount' AND "value" IS NOT NULL;

    UPDATE "processing_fees" SET "amount" = "amount" / 100.0
    WHERE "type" = 'fixed_amount' AND "amount" IS NOT NULL;

    UPDATE "affiliates" SET "commission_rate" = "commission_rate" / 100.0
    WHERE "commission_type" = 'fixed_amount' AND "commission_rate" IS NOT NULL;

    UPDATE "affiliates" SET
      "total_revenue" = "total_revenue" / 100.0,
      "total_commission_earned" = "total_commission_earned" / 100.0,
      "total_commission_pending" = "total_commission_pending" / 100.0,
      "total_commission_approved" = "total_commission_approved" / 100.0,
      "total_commission_requested" = "total_commission_requested" / 100.0,
      "total_commission_paid" = "total_commission_paid" / 100.0,
      "minimum_payout_threshold" = "minimum_payout_threshold" / 100.0
    WHERE TRUE;

    UPDATE "affiliate_settings" SET "default_minimum_payout_threshold" = "default_minimum_payout_threshold" / 100.0;

    UPDATE "affiliate_conversions" SET
      "order_subtotal" = "order_subtotal" / 100.0,
      "order_discount" = "order_discount" / 100.0,
      "eligible_subtotal" = "eligible_subtotal" / 100.0,
      "commission_amount" = "commission_amount" / 100.0
    WHERE TRUE;

    UPDATE "affiliate_clicks" SET "conversion_value" = "conversion_value" / 100.0
    WHERE "conversion_value" IS NOT NULL;

    UPDATE "payout_requests" SET "amount" = "amount" / 100.0 WHERE "amount" IS NOT NULL;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "payout_requests" SET "amount" = "amount" * 100 WHERE "amount" IS NOT NULL;

    UPDATE "affiliate_clicks" SET "conversion_value" = "conversion_value" * 100
    WHERE "conversion_value" IS NOT NULL;

    UPDATE "affiliate_conversions" SET
      "order_subtotal" = "order_subtotal" * 100,
      "order_discount" = "order_discount" * 100,
      "eligible_subtotal" = "eligible_subtotal" * 100,
      "commission_amount" = "commission_amount" * 100
    WHERE TRUE;

    UPDATE "affiliate_settings" SET "default_minimum_payout_threshold" = "default_minimum_payout_threshold" * 100;

    UPDATE "affiliates" SET
      "total_revenue" = "total_revenue" * 100,
      "total_commission_earned" = "total_commission_earned" * 100,
      "total_commission_pending" = "total_commission_pending" * 100,
      "total_commission_approved" = "total_commission_approved" * 100,
      "total_commission_requested" = "total_commission_requested" * 100,
      "total_commission_paid" = "total_commission_paid" * 100,
      "minimum_payout_threshold" = "minimum_payout_threshold" * 100
    WHERE TRUE;

    UPDATE "affiliates" SET "commission_rate" = "commission_rate" * 100
    WHERE "commission_type" = 'fixed_amount' AND "commission_rate" IS NOT NULL;

    UPDATE "processing_fees" SET "amount" = "amount" * 100
    WHERE "type" = 'fixed_amount' AND "amount" IS NOT NULL;

    UPDATE "coupons" SET "value" = "value" * 100
    WHERE "type" = 'fixed_amount' AND "value" IS NOT NULL;

    UPDATE "coupons" SET
      "min_spend" = "min_spend" * 100,
      "store_credit_amount" = "store_credit_amount" * 100,
      "remaining_balance" = "remaining_balance" * 100
    WHERE "min_spend" IS NOT NULL OR "store_credit_amount" IS NOT NULL OR "remaining_balance" IS NOT NULL;

    UPDATE "orders" SET
      "subtotal" = "subtotal" * 100,
      "shipping_total" = "shipping_total" * 100,
      "total" = "total" * 100
    WHERE "order_number" IS NOT NULL
      AND "order_number" ~ '^[0-9]+$'
      AND "order_number"::int < 7000;

    UPDATE "orders_applied_fees" SET "amount" = "amount" * 100 WHERE "amount" IS NOT NULL;
    UPDATE "orders" SET "fee_total" = "fee_total" * 100 WHERE "fee_total" IS NOT NULL;

    ALTER TABLE "payout_requests" RENAME COLUMN "amount" TO "amount_cents";
  `)
}
