import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres"

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_notification_outbox_recipient_type" AS ENUM('client', 'internal');
  CREATE TYPE "public"."enum_notification_outbox_status" AS ENUM('pending', 'processing', 'retryable', 'sent', 'dead');
  CREATE TABLE "notification_outbox" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "deduplication_key" varchar NOT NULL,
    "recipient_type" "enum_notification_outbox_recipient_type" NOT NULL,
    "recipient" varchar NOT NULL,
    "subject" varchar NOT NULL,
    "text" varchar NOT NULL,
    "status" "enum_notification_outbox_status" DEFAULT 'pending' NOT NULL,
    "attempts" numeric DEFAULT 0 NOT NULL,
    "next_attempt_at" timestamp(3) with time zone NOT NULL,
    "locked_at" timestamp(3) with time zone,
    "provider_message_i_d" varchar,
    "sanitized_error" varchar,
    "booking_request_id" uuid,
    "payment_order_id" uuid,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "webhook_events" RENAME COLUMN "retry_count" TO "attempts";
  DROP INDEX "webhook_events_provider_event_i_d_idx";
  ALTER TABLE "leads" ADD COLUMN "identity_key" varchar;
  ALTER TABLE "payment_orders" ADD COLUMN "last_reconciled_at" timestamp(3) with time zone;
  ALTER TABLE "payment_orders" ADD COLUMN "next_reconcile_at" timestamp(3) with time zone;
  ALTER TABLE "payment_orders" ADD COLUMN "reconciliation_attempts" numeric DEFAULT 0 NOT NULL;
  ALTER TABLE "webhook_events" ADD COLUMN "deduplication_key" varchar;
  ALTER TABLE "webhook_events" ADD COLUMN "normalized_payload" jsonb;
  ALTER TABLE "webhook_events" ADD COLUMN "next_retry_at" timestamp(3) with time zone;
  ALTER TABLE "webhook_events" ADD COLUMN "locked_at" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "notification_outbox_id" uuid;
  UPDATE "webhook_events"
    SET "deduplication_key" = "provider"::text || ':' || "provider_event_i_d",
        "normalized_payload" = '{}'::jsonb;
  ALTER TABLE "webhook_events" ALTER COLUMN "deduplication_key" SET NOT NULL;
  ALTER TABLE "webhook_events" ALTER COLUMN "normalized_payload" SET NOT NULL;
  WITH ranked_leads AS (
    SELECT "id", row_number() OVER (
      PARTITION BY lower(trim("email")) ORDER BY "created_at", "id"
    ) AS occurrence
    FROM "leads"
    WHERE "email" IS NOT NULL
  )
  UPDATE "leads"
    SET "identity_key" = 'email:' || lower(trim("leads"."email"))
    FROM ranked_leads
    WHERE "leads"."id" = ranked_leads."id" AND ranked_leads.occurrence = 1;
  ALTER TABLE "notification_outbox" ADD CONSTRAINT "notification_outbox_booking_request_id_booking_requests_id_fk" FOREIGN KEY ("booking_request_id") REFERENCES "public"."booking_requests"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "notification_outbox" ADD CONSTRAINT "notification_outbox_payment_order_id_payment_orders_id_fk" FOREIGN KEY ("payment_order_id") REFERENCES "public"."payment_orders"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "notification_outbox_deduplication_key_idx" ON "notification_outbox" USING btree ("deduplication_key");
  CREATE INDEX "notification_outbox_status_idx" ON "notification_outbox" USING btree ("status");
  CREATE INDEX "notification_outbox_next_attempt_at_idx" ON "notification_outbox" USING btree ("next_attempt_at");
  CREATE INDEX "notification_outbox_locked_at_idx" ON "notification_outbox" USING btree ("locked_at");
  CREATE INDEX "notification_outbox_provider_message_i_d_idx" ON "notification_outbox" USING btree ("provider_message_i_d");
  CREATE INDEX "notification_outbox_booking_request_idx" ON "notification_outbox" USING btree ("booking_request_id");
  CREATE INDEX "notification_outbox_payment_order_idx" ON "notification_outbox" USING btree ("payment_order_id");
  CREATE INDEX "notification_outbox_updated_at_idx" ON "notification_outbox" USING btree ("updated_at");
  CREATE INDEX "notification_outbox_created_at_idx" ON "notification_outbox" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_notification_outbox_fk" FOREIGN KEY ("notification_outbox_id") REFERENCES "public"."notification_outbox"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "leads_identity_key_idx" ON "leads" USING btree ("identity_key");
  CREATE INDEX "payment_orders_last_reconciled_at_idx" ON "payment_orders" USING btree ("last_reconciled_at");
  CREATE INDEX "payment_orders_next_reconcile_at_idx" ON "payment_orders" USING btree ("next_reconcile_at");
  CREATE UNIQUE INDEX "webhook_events_deduplication_key_idx" ON "webhook_events" USING btree ("deduplication_key");
  CREATE INDEX "webhook_events_next_retry_at_idx" ON "webhook_events" USING btree ("next_retry_at");
  CREATE INDEX "webhook_events_locked_at_idx" ON "webhook_events" USING btree ("locked_at");
  CREATE INDEX "payload_locked_documents_rels_notification_outbox_id_idx" ON "payload_locked_documents_rels" USING btree ("notification_outbox_id");
  CREATE INDEX "webhook_events_provider_event_i_d_idx" ON "webhook_events" USING btree ("provider_event_i_d");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_notification_outbox_fk";
   ALTER TABLE "notification_outbox" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "notification_outbox" CASCADE;
  ALTER TABLE "webhook_events" RENAME COLUMN "attempts" TO "retry_count";

  DROP INDEX "leads_identity_key_idx";
  DROP INDEX "payment_orders_last_reconciled_at_idx";
  DROP INDEX "payment_orders_next_reconcile_at_idx";
  DROP INDEX "webhook_events_deduplication_key_idx";
  DROP INDEX "webhook_events_next_retry_at_idx";
  DROP INDEX "webhook_events_locked_at_idx";
  DROP INDEX "payload_locked_documents_rels_notification_outbox_id_idx";
  DROP INDEX "webhook_events_provider_event_i_d_idx";
  CREATE UNIQUE INDEX "webhook_events_provider_event_i_d_idx" ON "webhook_events" USING btree ("provider_event_i_d");
  ALTER TABLE "leads" DROP COLUMN "identity_key";
  ALTER TABLE "payment_orders" DROP COLUMN "last_reconciled_at";
  ALTER TABLE "payment_orders" DROP COLUMN "next_reconcile_at";
  ALTER TABLE "payment_orders" DROP COLUMN "reconciliation_attempts";
  ALTER TABLE "webhook_events" DROP COLUMN "deduplication_key";
  ALTER TABLE "webhook_events" DROP COLUMN "normalized_payload";
  ALTER TABLE "webhook_events" DROP COLUMN "next_retry_at";
  ALTER TABLE "webhook_events" DROP COLUMN "locked_at";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "notification_outbox_id";
  DROP TYPE "public"."enum_notification_outbox_recipient_type";
  DROP TYPE "public"."enum_notification_outbox_status";`)
}
