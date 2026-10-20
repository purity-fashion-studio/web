import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_locales" ADD COLUMN "contents_title" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_contents_title" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_locales" DROP COLUMN "contents_title";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_contents_title";`)
}
