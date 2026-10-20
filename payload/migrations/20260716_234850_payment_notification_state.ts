import {
  sql,
  type MigrateDownArgs,
  type MigrateUpArgs,
} from "@payloadcms/db-postgres"

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_payment_orders_notification_status" AS ENUM('pending', 'sent', 'failed');
  ALTER TABLE "payment_orders" ADD COLUMN "notification_status" "enum_payment_orders_notification_status" DEFAULT 'pending' NOT NULL;
  ALTER TABLE "payment_orders" ADD COLUMN "notification_error" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payment_orders" DROP COLUMN "notification_status";
  ALTER TABLE "payment_orders" DROP COLUMN "notification_error";
  DROP TYPE "public"."enum_payment_orders_notification_status";`)
}
