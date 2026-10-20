import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_booking_requests_notification_status" AS ENUM('pending', 'sent', 'failed');
  ALTER TABLE "booking_requests" ADD COLUMN "request_fingerprint" varchar NOT NULL;
  ALTER TABLE "booking_requests" ADD COLUMN "notification_status" "enum_booking_requests_notification_status" DEFAULT 'pending' NOT NULL;
  ALTER TABLE "booking_requests" ADD COLUMN "notification_error" varchar;
  CREATE INDEX "booking_requests_request_fingerprint_idx" ON "booking_requests" USING btree ("request_fingerprint");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "booking_requests_request_fingerprint_idx";
  ALTER TABLE "booking_requests" DROP COLUMN "request_fingerprint";
  ALTER TABLE "booking_requests" DROP COLUMN "notification_status";
  ALTER TABLE "booking_requests" DROP COLUMN "notification_error";
  DROP TYPE "public"."enum_booking_requests_notification_status";`)
}
