import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres"

const localizedColumns = [
  "ui_labels_menu",
  "ui_labels_footer_directions",
  "ui_labels_footer_contacts",
  "contact_labels_phone",
  "contact_labels_email",
  "contact_labels_viber",
  "contact_labels_socials",
  "contact_labels_direct",
  "contact_labels_address",
  "contact_labels_hours",
  "contact_labels_request",
  "contact_labels_request_summary",
  "booking_eyebrow",
  "booking_title",
  "booking_summary",
  "booking_private_inquiry",
  "booking_corporate_inquiry",
  "booking_submit",
  "booking_submitting",
  "booking_empty_service",
  "booking_success_title",
  "booking_success_summary",
  "booking_error_title",
  "booking_validation_error",
  "booking_checkout",
  "booking_routing_title",
  "booking_routing_summary",
  "booking_contact_title",
  "booking_payment_title",
  "booking_steps_title",
  "booking_step_details",
  "booking_step_review",
  "booking_review_title",
  "booking_review_summary",
  "booking_not_specified",
  "booking_labels_inquiry_type",
  "booking_labels_service_slug",
  "booking_labels_name",
  "booking_labels_email",
  "booking_labels_phone",
  "booking_labels_company",
  "booking_labels_format",
  "booking_labels_contact_method",
  "booking_labels_budget_currency",
  "booking_labels_preferred_at",
  "booking_labels_message",
  "booking_labels_consent",
  "booking_inquiry_types_private",
  "booking_inquiry_types_corporate",
  "booking_formats_studio",
  "booking_formats_online",
  "booking_formats_atelier",
  "booking_contact_methods_email",
  "booking_contact_methods_phone",
  "booking_contact_methods_viber",
  "booking_currencies_eur",
  "booking_currencies_uah",
  "booking_providers_stripe",
  "booking_providers_liqpay",
  "booking_errors_required",
  "booking_errors_email",
  "booking_errors_message",
  "booking_errors_consent",
  "booking_errors_company_required",
  "booking_errors_phone_required",
  "booking_payment_status_provider",
  "booking_payment_status_order",
  "booking_payment_status_not_provided",
  "booking_payment_status_reference_received",
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
