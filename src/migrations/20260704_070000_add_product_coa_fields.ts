import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ADD COLUMN "coa_batch_number" varchar;
   ALTER TABLE "products" ADD COLUMN "coa_purity" numeric;
   ALTER TABLE "products" ADD COLUMN "coa_analyzed_date" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" DROP COLUMN "coa_batch_number";
   ALTER TABLE "products" DROP COLUMN "coa_purity";
   ALTER TABLE "products" DROP COLUMN "coa_analyzed_date";`)
}
