import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum__locales" AS ENUM('en', 'es');

    CREATE TABLE "products_locales" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "description" varchar,
      "seo_title" varchar,
      "seo_description" varchar,
      "product_details_title" varchar DEFAULT 'Product Details',
      "product_details_description" varchar,
      "research_focus_title" varchar DEFAULT 'Research Focus & Mechanism Overview',
      "research_focus_description" varchar,
      "quality_purity_title" varchar DEFAULT 'Quality & Purity Standards',
      "quality_purity_description" varchar,
      "compliance_notice_title" varchar DEFAULT 'Compliance Notice',
      "compliance_notice_description" varchar,
      "_locale" "public"."enum__locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE "products_bulk_bundles_locales" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "_locale" "public"."enum__locales" NOT NULL,
      "_parent_id" varchar NOT NULL
    );

    CREATE TABLE "products_faqs_locales" (
      "id" serial PRIMARY KEY NOT NULL,
      "question" varchar NOT NULL,
      "answer" varchar NOT NULL,
      "_locale" "public"."enum__locales" NOT NULL,
      "_parent_id" varchar NOT NULL
    );

    CREATE TABLE "categories_locales" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "description" varchar,
      "seo_title" varchar,
      "seo_description" varchar,
      "_locale" "public"."enum__locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE "media_locales" (
      "id" serial PRIMARY KEY NOT NULL,
      "alt" varchar NOT NULL,
      "caption" varchar,
      "_locale" "public"."enum__locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE "blog_posts_locales" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "content" jsonb,
      "_locale" "public"."enum__locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    CREATE TABLE "pages_locales" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "content" jsonb,
      "_locale" "public"."enum__locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    -- Preserve existing data as the 'en' locale value before dropping the old columns
    INSERT INTO "products_locales" (
      "name", "description", "seo_title", "seo_description",
      "product_details_title", "product_details_description",
      "research_focus_title", "research_focus_description",
      "quality_purity_title", "quality_purity_description",
      "compliance_notice_title", "compliance_notice_description",
      "_locale", "_parent_id"
    )
    SELECT
      "name", "description", "seo_title", "seo_description",
      "product_details_title", "product_details_description",
      "research_focus_title", "research_focus_description",
      "quality_purity_title", "quality_purity_description",
      "compliance_notice_title", "compliance_notice_description",
      'en', "id"
    FROM "products";

    INSERT INTO "products_bulk_bundles_locales" ("name", "_locale", "_parent_id")
    SELECT "name", 'en', "id" FROM "products_bulk_bundles";

    INSERT INTO "products_faqs_locales" ("question", "answer", "_locale", "_parent_id")
    SELECT "question", "answer", 'en', "id" FROM "products_faqs";

    INSERT INTO "categories_locales" ("name", "description", "seo_title", "seo_description", "_locale", "_parent_id")
    SELECT "name", "description", "seo_title", "seo_description", 'en', "id" FROM "categories";

    INSERT INTO "media_locales" ("alt", "caption", "_locale", "_parent_id")
    SELECT "alt", "caption", 'en', "id" FROM "media" WHERE "alt" IS NOT NULL;

    INSERT INTO "blog_posts_locales" ("title", "content", "_locale", "_parent_id")
    SELECT "title", "content", 'en', "id" FROM "blog_posts";

    INSERT INTO "pages_locales" ("title", "content", "_locale", "_parent_id")
    SELECT "title", "content", 'en', "id" FROM "pages";

    -- Now that data is preserved, drop the old non-localized columns
    ALTER TABLE "products" DROP COLUMN "name";
    ALTER TABLE "products" DROP COLUMN "description";
    ALTER TABLE "products" DROP COLUMN "seo_title";
    ALTER TABLE "products" DROP COLUMN "seo_description";
    ALTER TABLE "products" DROP COLUMN "product_details_title";
    ALTER TABLE "products" DROP COLUMN "product_details_description";
    ALTER TABLE "products" DROP COLUMN "research_focus_title";
    ALTER TABLE "products" DROP COLUMN "research_focus_description";
    ALTER TABLE "products" DROP COLUMN "quality_purity_title";
    ALTER TABLE "products" DROP COLUMN "quality_purity_description";
    ALTER TABLE "products" DROP COLUMN "compliance_notice_title";
    ALTER TABLE "products" DROP COLUMN "compliance_notice_description";

    ALTER TABLE "products_bulk_bundles" DROP COLUMN "name";

    ALTER TABLE "products_faqs" DROP COLUMN "question";
    ALTER TABLE "products_faqs" DROP COLUMN "answer";

    ALTER TABLE "categories" DROP COLUMN "name";
    ALTER TABLE "categories" DROP COLUMN "description";
    ALTER TABLE "categories" DROP COLUMN "seo_title";
    ALTER TABLE "categories" DROP COLUMN "seo_description";

    ALTER TABLE "media" DROP COLUMN "alt";
    ALTER TABLE "media" DROP COLUMN "caption";

    ALTER TABLE "blog_posts" DROP COLUMN "title";
    ALTER TABLE "blog_posts" DROP COLUMN "content";

    ALTER TABLE "pages" DROP COLUMN "title";
    ALTER TABLE "pages" DROP COLUMN "content";

    -- Foreign keys and unique indexes for the new locale tables
    ALTER TABLE "products_locales" ADD CONSTRAINT "products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "products_bulk_bundles_locales" ADD CONSTRAINT "products_bulk_bundles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_bulk_bundles"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "products_faqs_locales" ADD CONSTRAINT "products_faqs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_faqs"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "categories_locales" ADD CONSTRAINT "categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "blog_posts_locales" ADD CONSTRAINT "blog_posts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;

    CREATE UNIQUE INDEX "products_locales_locale_parent_id_unique" ON "products_locales" USING btree ("_locale","_parent_id");
    CREATE UNIQUE INDEX "products_bulk_bundles_locales_locale_parent_id_unique" ON "products_bulk_bundles_locales" USING btree ("_locale","_parent_id");
    CREATE UNIQUE INDEX "products_faqs_locales_locale_parent_id_unique" ON "products_faqs_locales" USING btree ("_locale","_parent_id");
    CREATE UNIQUE INDEX "categories_locales_locale_parent_id_unique" ON "categories_locales" USING btree ("_locale","_parent_id");
    CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
    CREATE UNIQUE INDEX "blog_posts_locales_locale_parent_id_unique" ON "blog_posts_locales" USING btree ("_locale","_parent_id");
    CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" ADD COLUMN "name" varchar;
    ALTER TABLE "products" ADD COLUMN "description" varchar;
    ALTER TABLE "products" ADD COLUMN "seo_title" varchar;
    ALTER TABLE "products" ADD COLUMN "seo_description" varchar;
    ALTER TABLE "products" ADD COLUMN "product_details_title" varchar DEFAULT 'Product Details';
    ALTER TABLE "products" ADD COLUMN "product_details_description" varchar;
    ALTER TABLE "products" ADD COLUMN "research_focus_title" varchar DEFAULT 'Research Focus & Mechanism Overview';
    ALTER TABLE "products" ADD COLUMN "research_focus_description" varchar;
    ALTER TABLE "products" ADD COLUMN "quality_purity_title" varchar DEFAULT 'Quality & Purity Standards';
    ALTER TABLE "products" ADD COLUMN "quality_purity_description" varchar;
    ALTER TABLE "products" ADD COLUMN "compliance_notice_title" varchar DEFAULT 'Compliance Notice';
    ALTER TABLE "products" ADD COLUMN "compliance_notice_description" varchar;
    ALTER TABLE "products_bulk_bundles" ADD COLUMN "name" varchar;
    ALTER TABLE "products_faqs" ADD COLUMN "question" varchar;
    ALTER TABLE "products_faqs" ADD COLUMN "answer" varchar;
    ALTER TABLE "categories" ADD COLUMN "name" varchar;
    ALTER TABLE "categories" ADD COLUMN "description" varchar;
    ALTER TABLE "categories" ADD COLUMN "seo_title" varchar;
    ALTER TABLE "categories" ADD COLUMN "seo_description" varchar;
    ALTER TABLE "media" ADD COLUMN "alt" varchar;
    ALTER TABLE "media" ADD COLUMN "caption" varchar;
    ALTER TABLE "blog_posts" ADD COLUMN "title" varchar;
    ALTER TABLE "blog_posts" ADD COLUMN "content" jsonb;
    ALTER TABLE "pages" ADD COLUMN "title" varchar;
    ALTER TABLE "pages" ADD COLUMN "content" jsonb;

    UPDATE "products" p SET
      "name" = l."name", "description" = l."description", "seo_title" = l."seo_title", "seo_description" = l."seo_description",
      "product_details_title" = l."product_details_title", "product_details_description" = l."product_details_description",
      "research_focus_title" = l."research_focus_title", "research_focus_description" = l."research_focus_description",
      "quality_purity_title" = l."quality_purity_title", "quality_purity_description" = l."quality_purity_description",
      "compliance_notice_title" = l."compliance_notice_title", "compliance_notice_description" = l."compliance_notice_description"
    FROM "products_locales" l WHERE l."_parent_id" = p."id" AND l."_locale" = 'en';

    UPDATE "products_bulk_bundles" b SET "name" = l."name" FROM "products_bulk_bundles_locales" l WHERE l."_parent_id" = b."id" AND l."_locale" = 'en';
    UPDATE "products_faqs" f SET "question" = l."question", "answer" = l."answer" FROM "products_faqs_locales" l WHERE l."_parent_id" = f."id" AND l."_locale" = 'en';
    UPDATE "categories" c SET "name" = l."name", "description" = l."description", "seo_title" = l."seo_title", "seo_description" = l."seo_description" FROM "categories_locales" l WHERE l."_parent_id" = c."id" AND l."_locale" = 'en';
    UPDATE "media" m SET "alt" = l."alt", "caption" = l."caption" FROM "media_locales" l WHERE l."_parent_id" = m."id" AND l."_locale" = 'en';
    UPDATE "blog_posts" bp SET "title" = l."title", "content" = l."content" FROM "blog_posts_locales" l WHERE l."_parent_id" = bp."id" AND l."_locale" = 'en';
    UPDATE "pages" pg SET "title" = l."title", "content" = l."content" FROM "pages_locales" l WHERE l."_parent_id" = pg."id" AND l."_locale" = 'en';

    ALTER TABLE "products" ALTER COLUMN "name" SET NOT NULL;
    ALTER TABLE "products_bulk_bundles" ALTER COLUMN "name" SET NOT NULL;
    ALTER TABLE "products_faqs" ALTER COLUMN "question" SET NOT NULL;
    ALTER TABLE "products_faqs" ALTER COLUMN "answer" SET NOT NULL;
    ALTER TABLE "categories" ALTER COLUMN "name" SET NOT NULL;
    ALTER TABLE "media" ALTER COLUMN "alt" SET NOT NULL;
    ALTER TABLE "blog_posts" ALTER COLUMN "title" SET NOT NULL;
    ALTER TABLE "pages" ALTER COLUMN "title" SET NOT NULL;

    DROP TABLE "products_locales";
    DROP TABLE "products_bulk_bundles_locales";
    DROP TABLE "products_faqs_locales";
    DROP TABLE "categories_locales";
    DROP TABLE "media_locales";
    DROP TABLE "blog_posts_locales";
    DROP TABLE "pages_locales";
    DROP TYPE "public"."enum__locales";
  `)
}
