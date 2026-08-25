import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_auth_provider" AS ENUM('credentials', 'google');
  ALTER TABLE "users" ADD COLUMN "google_id" varchar;
  ALTER TABLE "users" ADD COLUMN "auth_provider" "enum_users_auth_provider" DEFAULT 'credentials';
  ALTER TABLE "users" ADD COLUMN "pending_email" varchar;
  ALTER TABLE "users" ADD COLUMN "pending_email_code_hash" varchar;
  ALTER TABLE "users" ADD COLUMN "pending_email_code_expires_at" timestamp(3) with time zone;
  DROP INDEX IF EXISTS "users_clerk_user_id_idx";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "clerk_user_id";
  CREATE UNIQUE INDEX "users_google_id_idx" ON "users" USING btree ("google_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "users_google_id_idx";
  ALTER TABLE "users" ADD COLUMN "clerk_user_id" varchar;
  CREATE UNIQUE INDEX "users_clerk_user_id_idx" ON "users" USING btree ("clerk_user_id");
  ALTER TABLE "users" DROP COLUMN "google_id";
  ALTER TABLE "users" DROP COLUMN "auth_provider";
  ALTER TABLE "users" DROP COLUMN "pending_email";
  ALTER TABLE "users" DROP COLUMN "pending_email_code_hash";
  ALTER TABLE "users" DROP COLUMN "pending_email_code_expires_at";
  DROP TYPE "public"."enum_users_auth_provider";`)
}
