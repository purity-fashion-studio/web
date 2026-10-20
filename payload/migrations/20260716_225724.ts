import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "directions" ADD COLUMN "published_at" timestamp(3) with time zone;
  ALTER TABLE "_directions_v" ADD COLUMN "version_published_at" timestamp(3) with time zone;
  ALTER TABLE "services" ADD COLUMN "published_at" timestamp(3) with time zone;
  ALTER TABLE "_services_v" ADD COLUMN "version_published_at" timestamp(3) with time zone;
  ALTER TABLE "offers" ADD COLUMN "published_at" timestamp(3) with time zone;
  ALTER TABLE "_offers_v" ADD COLUMN "version_published_at" timestamp(3) with time zone;
  ALTER TABLE "courses" ADD COLUMN "published_at" timestamp(3) with time zone;
  ALTER TABLE "_courses_v" ADD COLUMN "version_published_at" timestamp(3) with time zone;
  ALTER TABLE "fashion_collections" ADD COLUMN "published_at" timestamp(3) with time zone;
  ALTER TABLE "_fashion_collections_v" ADD COLUMN "version_published_at" timestamp(3) with time zone;
  ALTER TABLE "portfolio_cases" ADD COLUMN "published_at" timestamp(3) with time zone;
  ALTER TABLE "_portfolio_cases_v" ADD COLUMN "version_published_at" timestamp(3) with time zone;
  ALTER TABLE "testimonials" ADD COLUMN "published_at" timestamp(3) with time zone;
  ALTER TABLE "_testimonials_v" ADD COLUMN "version_published_at" timestamp(3) with time zone;
  ALTER TABLE "pages" ADD COLUMN "published_at" timestamp(3) with time zone;
  ALTER TABLE "_pages_v" ADD COLUMN "version_published_at" timestamp(3) with time zone;
  CREATE INDEX "directions_published_at_idx" ON "directions" USING btree ("published_at");
  CREATE INDEX "_directions_v_version_version_published_at_idx" ON "_directions_v" USING btree ("version_published_at");
  CREATE INDEX "services_published_at_idx" ON "services" USING btree ("published_at");
  CREATE INDEX "_services_v_version_version_published_at_idx" ON "_services_v" USING btree ("version_published_at");
  CREATE INDEX "offers_published_at_idx" ON "offers" USING btree ("published_at");
  CREATE INDEX "_offers_v_version_version_published_at_idx" ON "_offers_v" USING btree ("version_published_at");
  CREATE INDEX "courses_published_at_idx" ON "courses" USING btree ("published_at");
  CREATE INDEX "_courses_v_version_version_published_at_idx" ON "_courses_v" USING btree ("version_published_at");
  CREATE INDEX "fashion_collections_published_at_idx" ON "fashion_collections" USING btree ("published_at");
  CREATE INDEX "_fashion_collections_v_version_version_published_at_idx" ON "_fashion_collections_v" USING btree ("version_published_at");
  CREATE INDEX "portfolio_cases_published_at_idx" ON "portfolio_cases" USING btree ("published_at");
  CREATE INDEX "_portfolio_cases_v_version_version_published_at_idx" ON "_portfolio_cases_v" USING btree ("version_published_at");
  CREATE INDEX "testimonials_published_at_idx" ON "testimonials" USING btree ("published_at");
  CREATE INDEX "_testimonials_v_version_version_published_at_idx" ON "_testimonials_v" USING btree ("version_published_at");
  CREATE INDEX "pages_published_at_idx" ON "pages" USING btree ("published_at");
  CREATE INDEX "_pages_v_version_version_published_at_idx" ON "_pages_v" USING btree ("version_published_at");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "directions_published_at_idx";
  DROP INDEX "_directions_v_version_version_published_at_idx";
  DROP INDEX "services_published_at_idx";
  DROP INDEX "_services_v_version_version_published_at_idx";
  DROP INDEX "offers_published_at_idx";
  DROP INDEX "_offers_v_version_version_published_at_idx";
  DROP INDEX "courses_published_at_idx";
  DROP INDEX "_courses_v_version_version_published_at_idx";
  DROP INDEX "fashion_collections_published_at_idx";
  DROP INDEX "_fashion_collections_v_version_version_published_at_idx";
  DROP INDEX "portfolio_cases_published_at_idx";
  DROP INDEX "_portfolio_cases_v_version_version_published_at_idx";
  DROP INDEX "testimonials_published_at_idx";
  DROP INDEX "_testimonials_v_version_version_published_at_idx";
  DROP INDEX "pages_published_at_idx";
  DROP INDEX "_pages_v_version_version_published_at_idx";
  ALTER TABLE "directions" DROP COLUMN "published_at";
  ALTER TABLE "_directions_v" DROP COLUMN "version_published_at";
  ALTER TABLE "services" DROP COLUMN "published_at";
  ALTER TABLE "_services_v" DROP COLUMN "version_published_at";
  ALTER TABLE "offers" DROP COLUMN "published_at";
  ALTER TABLE "_offers_v" DROP COLUMN "version_published_at";
  ALTER TABLE "courses" DROP COLUMN "published_at";
  ALTER TABLE "_courses_v" DROP COLUMN "version_published_at";
  ALTER TABLE "fashion_collections" DROP COLUMN "published_at";
  ALTER TABLE "_fashion_collections_v" DROP COLUMN "version_published_at";
  ALTER TABLE "portfolio_cases" DROP COLUMN "published_at";
  ALTER TABLE "_portfolio_cases_v" DROP COLUMN "version_published_at";
  ALTER TABLE "testimonials" DROP COLUMN "published_at";
  ALTER TABLE "_testimonials_v" DROP COLUMN "version_published_at";
  ALTER TABLE "pages" DROP COLUMN "published_at";
  ALTER TABLE "_pages_v" DROP COLUMN "version_published_at";`)
}
