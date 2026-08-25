import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export const up = async ({ db }: MigrateUpArgs) => {
  await db.execute(sql`
    DO $$ BEGIN
     CREATE TYPE "public"."enum_military_discount_requests_status" AS ENUM('pending', 'approved', 'rejected');
    EXCEPTION
     WHEN duplicate_object THEN null;
    END $$;

    CREATE TABLE IF NOT EXISTS "military_discount_requests" (
      "id" serial PRIMARY KEY NOT NULL,
      "full_name" varchar NOT NULL,
      "email" varchar NOT NULL,
      "branch" varchar NOT NULL,
      "status" "enum_military_discount_requests_status" DEFAULT 'pending' NOT NULL,
      "coupon_code" varchar,
      "reviewed_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE INDEX IF NOT EXISTS "military_discount_requests_email_idx" ON "military_discount_requests" USING btree ("email");
    CREATE INDEX IF NOT EXISTS "military_discount_requests_created_at_idx" ON "military_discount_requests" USING btree ("created_at");
  `)
}

export const down = async ({ db }: MigrateDownArgs) => {
  await db.execute(sql`
    DROP TABLE IF EXISTS "military_discount_requests";
    DROP TYPE IF EXISTS "public"."enum_military_discount_requests_status";
  `)
}
