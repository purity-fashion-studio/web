import {
  sql,
  type MigrateDownArgs,
  type MigrateUpArgs,
} from "@payloadcms/db-postgres"

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payment_orders" ADD COLUMN "provider_payment_i_d" varchar;
  CREATE INDEX "payment_orders_provider_payment_i_d_idx" ON "payment_orders" USING btree ("provider_payment_i_d");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "payment_orders_provider_payment_i_d_idx";
  ALTER TABLE "payment_orders" DROP COLUMN "provider_payment_i_d";`)
}
