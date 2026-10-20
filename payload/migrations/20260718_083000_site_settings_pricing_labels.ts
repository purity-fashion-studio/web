import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres"

const localizedColumns = [
  "booking_pricing_from",
  "booking_pricing_custom",
] as const

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(
    sql.raw(`
      ALTER TABLE "site_settings_locales"
      ${localizedColumns
        .map((column) => `ADD COLUMN "${column}" varchar NOT NULL DEFAULT ''`)
        .join(",\n")};
    `)
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(
    sql.raw(`
      ALTER TABLE "site_settings_locales"
      ${localizedColumns
        .map((column) => `DROP COLUMN "${column}"`)
        .join(",\n")};
    `)
  )
}
