import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "footer_phones" (
    "_order" integer NOT NULL,
    "_parent_id" uuid NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "number" varchar
  );

  CREATE TABLE "_footer_v_version_phones" (
    "_order" integer NOT NULL,
    "_parent_id" uuid NOT NULL,
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "number" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "site_settings_contacts_phones" (
    "_order" integer NOT NULL,
    "_parent_id" uuid NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "number" varchar NOT NULL
  );

  ALTER TABLE "pages_locales" ADD COLUMN "effective_date_label" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_effective_date_label" varchar;
  ALTER TABLE "footer_phones" ADD CONSTRAINT "footer_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_phones" ADD CONSTRAINT "_footer_v_version_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_contacts_phones" ADD CONSTRAINT "site_settings_contacts_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "footer_phones_order_idx" ON "footer_phones" USING btree ("_order");
  CREATE INDEX "footer_phones_parent_id_idx" ON "footer_phones" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_phones_order_idx" ON "_footer_v_version_phones" USING btree ("_order");
  CREATE INDEX "_footer_v_version_phones_parent_id_idx" ON "_footer_v_version_phones" USING btree ("_parent_id");
  CREATE INDEX "site_settings_contacts_phones_order_idx" ON "site_settings_contacts_phones" USING btree ("_order");
  CREATE INDEX "site_settings_contacts_phones_parent_id_idx" ON "site_settings_contacts_phones" USING btree ("_parent_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "footer_phones" CASCADE;
  DROP TABLE "_footer_v_version_phones" CASCADE;
  DROP TABLE "site_settings_contacts_phones" CASCADE;
  ALTER TABLE "pages_locales" DROP COLUMN "effective_date_label";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_effective_date_label";`)
}
