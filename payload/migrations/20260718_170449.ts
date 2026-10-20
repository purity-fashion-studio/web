import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres"

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "leads" ADD COLUMN "phone_identity_key" varchar;
  WITH ranked_leads AS (
    SELECT "id", CASE
      WHEN trim("phone") LIKE '+%' THEN '+' ELSE ''
    END || regexp_replace("phone", '\\D', '', 'g') AS normalized_phone,
    row_number() OVER (
      PARTITION BY CASE
        WHEN trim("phone") LIKE '+%' THEN '+' ELSE ''
      END || regexp_replace("phone", '\\D', '', 'g')
      ORDER BY "created_at", "id"
    ) AS occurrence
    FROM "leads"
    WHERE nullif(regexp_replace("phone", '\\D', '', 'g'), '') IS NOT NULL
  )
  UPDATE "leads"
    SET "phone_identity_key" = 'phone:' || ranked_leads.normalized_phone
    FROM ranked_leads
    WHERE "leads"."id" = ranked_leads."id" AND ranked_leads.occurrence = 1;
  CREATE UNIQUE INDEX "leads_phone_identity_key_idx" ON "leads" USING btree ("phone_identity_key");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "leads_phone_identity_key_idx";
  ALTER TABLE "leads" DROP COLUMN "phone_identity_key";`)
}
