import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // IF NOT EXISTS makes this safe to run against a database where dev-mode schema push
  // already added these columns (e.g. local development pointed at the same database).
  await db.execute(sql`
   DO $$ BEGIN
    CREATE TYPE "public"."enum_orders_applied_fees_fee_type" AS ENUM('percentage', 'fixed_amount');
   EXCEPTION
    WHEN duplicate_object THEN null;
   END $$;
  ALTER TABLE "orders_applied_fees" ADD COLUMN IF NOT EXISTS "fee_type" "enum_orders_applied_fees_fee_type";
  ALTER TABLE "orders_applied_fees" ADD COLUMN IF NOT EXISTS "percentage" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders_applied_fees" DROP COLUMN IF EXISTS "percentage";
  ALTER TABLE "orders_applied_fees" DROP COLUMN IF EXISTS "fee_type";
  DROP TYPE IF EXISTS "public"."enum_orders_applied_fees_fee_type";`)
}
