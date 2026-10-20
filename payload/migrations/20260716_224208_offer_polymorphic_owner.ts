import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "offers" ADD COLUMN "course_id" uuid;
  ALTER TABLE "offers" ADD COLUMN "fashion_collection_id" uuid;
  ALTER TABLE "_offers_v" ADD COLUMN "version_course_id" uuid;
  ALTER TABLE "_offers_v" ADD COLUMN "version_fashion_collection_id" uuid;
  ALTER TABLE "offers" ADD CONSTRAINT "offers_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offers" ADD CONSTRAINT "offers_fashion_collection_id_fashion_collections_id_fk" FOREIGN KEY ("fashion_collection_id") REFERENCES "public"."fashion_collections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offers_v" ADD CONSTRAINT "_offers_v_version_course_id_courses_id_fk" FOREIGN KEY ("version_course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offers_v" ADD CONSTRAINT "_offers_v_version_fashion_collection_id_fashion_collections_id_fk" FOREIGN KEY ("version_fashion_collection_id") REFERENCES "public"."fashion_collections"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "offers_course_idx" ON "offers" USING btree ("course_id");
  CREATE INDEX "offers_fashion_collection_idx" ON "offers" USING btree ("fashion_collection_id");
  CREATE INDEX "_offers_v_version_version_course_idx" ON "_offers_v" USING btree ("version_course_id");
  CREATE INDEX "_offers_v_version_version_fashion_collection_idx" ON "_offers_v" USING btree ("version_fashion_collection_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "offers" DROP CONSTRAINT "offers_course_id_courses_id_fk";

  ALTER TABLE "offers" DROP CONSTRAINT "offers_fashion_collection_id_fashion_collections_id_fk";

  ALTER TABLE "_offers_v" DROP CONSTRAINT "_offers_v_version_course_id_courses_id_fk";

  ALTER TABLE "_offers_v" DROP CONSTRAINT "_offers_v_version_fashion_collection_id_fashion_collections_id_fk";

  DROP INDEX "offers_course_idx";
  DROP INDEX "offers_fashion_collection_idx";
  DROP INDEX "_offers_v_version_version_course_idx";
  DROP INDEX "_offers_v_version_version_fashion_collection_idx";
  ALTER TABLE "offers" DROP COLUMN "course_id";
  ALTER TABLE "offers" DROP COLUMN "fashion_collection_id";
  ALTER TABLE "_offers_v" DROP COLUMN "version_course_id";
  ALTER TABLE "_offers_v" DROP COLUMN "version_fashion_collection_id";`)
}
