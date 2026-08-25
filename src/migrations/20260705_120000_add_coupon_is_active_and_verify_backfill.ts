import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // IF NOT EXISTS makes this safe to run against a database where dev-mode schema push
  // already added this column (e.g. local development pointed at the same database).
  await db.execute(sql`
   ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true;`)

  // Grandfather in every account that existed before email verification was enforced,
  // so existing customers are never locked out of logging in. Only new signups from
  // this point forward are required to verify their email before they can log in.
  await db.execute(sql`
   UPDATE "users" SET "email_verified" = true WHERE "email_verified" IS DISTINCT FROM true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "coupons" DROP COLUMN IF EXISTS "is_active";`)
}
