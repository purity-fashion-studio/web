import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('uk', 'ru', 'en');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('owner', 'editor', 'support', 'finance', 'developer');
  CREATE TYPE "public"."enum_users_admin_locale" AS ENUM('uk', 'ru', 'en');
  CREATE TYPE "public"."enum_media_allowed_usage_contexts" AS ENUM('home', 'service', 'course', 'collection', 'portfolio', 'studio', 'social');
  CREATE TYPE "public"."enum_media_source" AS ENUM('client', 'generated', 'licensed', 'editorial');
  CREATE TYPE "public"."enum_media_usage_rights_status" AS ENUM('pending', 'approved', 'restricted', 'expired');
  CREATE TYPE "public"."enum_media_model_release_status" AS ENUM('not-applicable', 'pending', 'approved', 'restricted');
  CREATE TYPE "public"."enum_media_replacement_priority" AS ENUM('none', 'replace-before-launch', 'replace-when-approved');
  CREATE TYPE "public"."enum_directions_canonical_key" AS ENUM('research', 'realisation', 'transformation', 'corporate', 'school', 'collections');
  CREATE TYPE "public"."enum_directions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__directions_v_version_canonical_key" AS ENUM('research', 'realisation', 'transformation', 'corporate', 'school', 'collections');
  CREATE TYPE "public"."enum__directions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__directions_v_published_locale" AS ENUM('uk', 'ru', 'en');
  CREATE TYPE "public"."enum_services_formats" AS ENUM('online', 'studio', 'remote-atelier', 'in-person', 'hybrid');
  CREATE TYPE "public"."enum_services_cta_action" AS ENUM('inquiry', 'booking-request', 'deposit', 'instant-payment', 'waitlist', 'contact');
  CREATE TYPE "public"."enum_services_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_version_formats" AS ENUM('online', 'studio', 'remote-atelier', 'in-person', 'hybrid');
  CREATE TYPE "public"."enum__services_v_version_cta_action" AS ENUM('inquiry', 'booking-request', 'deposit', 'instant-payment', 'waitlist', 'contact');
  CREATE TYPE "public"."enum__services_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_published_locale" AS ENUM('uk', 'ru', 'en');
  CREATE TYPE "public"."enum_offers_prices_currency" AS ENUM('EUR', 'UAH');
  CREATE TYPE "public"."enum_offers_format" AS ENUM('online', 'studio', 'remote-atelier', 'in-person', 'hybrid');
  CREATE TYPE "public"."enum_offers_pricing_mode" AS ENUM('fixed', 'from', 'range', 'custom');
  CREATE TYPE "public"."enum_offers_checkout_mode" AS ENUM('instant-payment', 'deposit', 'booking-request', 'inquiry', 'waitlist');
  CREATE TYPE "public"."enum_offers_commercial_status" AS ENUM('active', 'coming-soon', 'waitlist', 'paused', 'sold-out', 'retired');
  CREATE TYPE "public"."enum_offers_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__offers_v_version_prices_currency" AS ENUM('EUR', 'UAH');
  CREATE TYPE "public"."enum__offers_v_version_format" AS ENUM('online', 'studio', 'remote-atelier', 'in-person', 'hybrid');
  CREATE TYPE "public"."enum__offers_v_version_pricing_mode" AS ENUM('fixed', 'from', 'range', 'custom');
  CREATE TYPE "public"."enum__offers_v_version_checkout_mode" AS ENUM('instant-payment', 'deposit', 'booking-request', 'inquiry', 'waitlist');
  CREATE TYPE "public"."enum__offers_v_version_commercial_status" AS ENUM('active', 'coming-soon', 'waitlist', 'paused', 'sold-out', 'retired');
  CREATE TYPE "public"."enum__offers_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__offers_v_published_locale" AS ENUM('uk', 'ru', 'en');
  CREATE TYPE "public"."enum_courses_formats" AS ENUM('online', 'studio', 'remote-atelier', 'in-person', 'hybrid');
  CREATE TYPE "public"."enum_courses_availability" AS ENUM('available', 'coming-soon', 'waitlist', 'sold-out', 'archived');
  CREATE TYPE "public"."enum_courses_cta_action" AS ENUM('inquiry', 'booking-request', 'deposit', 'instant-payment', 'waitlist', 'contact');
  CREATE TYPE "public"."enum_courses_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__courses_v_version_formats" AS ENUM('online', 'studio', 'remote-atelier', 'in-person', 'hybrid');
  CREATE TYPE "public"."enum__courses_v_version_availability" AS ENUM('available', 'coming-soon', 'waitlist', 'sold-out', 'archived');
  CREATE TYPE "public"."enum__courses_v_version_cta_action" AS ENUM('inquiry', 'booking-request', 'deposit', 'instant-payment', 'waitlist', 'contact');
  CREATE TYPE "public"."enum__courses_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__courses_v_published_locale" AS ENUM('uk', 'ru', 'en');
  CREATE TYPE "public"."enum_fashion_collections_collection_type" AS ENUM('editorial', 'commercial', 'capsule', 'collaboration', 'seasonal');
  CREATE TYPE "public"."enum_fashion_collections_availability" AS ENUM('available', 'inquiry', 'coming-soon', 'sold-out', 'archived');
  CREATE TYPE "public"."enum_fashion_collections_cta_action" AS ENUM('inquiry', 'booking-request', 'deposit', 'instant-payment', 'waitlist', 'contact');
  CREATE TYPE "public"."enum_fashion_collections_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__fashion_collections_v_version_collection_type" AS ENUM('editorial', 'commercial', 'capsule', 'collaboration', 'seasonal');
  CREATE TYPE "public"."enum__fashion_collections_v_version_availability" AS ENUM('available', 'inquiry', 'coming-soon', 'sold-out', 'archived');
  CREATE TYPE "public"."enum__fashion_collections_v_version_cta_action" AS ENUM('inquiry', 'booking-request', 'deposit', 'instant-payment', 'waitlist', 'contact');
  CREATE TYPE "public"."enum__fashion_collections_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__fashion_collections_v_published_locale" AS ENUM('uk', 'ru', 'en');
  CREATE TYPE "public"."enum_portfolio_cases_client_type" AS ENUM('private', 'corporate', 'editorial', 'collaboration');
  CREATE TYPE "public"."enum_portfolio_cases_usage_rights_status" AS ENUM('pending', 'approved', 'restricted', 'expired');
  CREATE TYPE "public"."enum_portfolio_cases_approval_status" AS ENUM('pending', 'approved', 'rejected', 'revoked');
  CREATE TYPE "public"."enum_portfolio_cases_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__portfolio_cases_v_version_client_type" AS ENUM('private', 'corporate', 'editorial', 'collaboration');
  CREATE TYPE "public"."enum__portfolio_cases_v_version_usage_rights_status" AS ENUM('pending', 'approved', 'restricted', 'expired');
  CREATE TYPE "public"."enum__portfolio_cases_v_version_approval_status" AS ENUM('pending', 'approved', 'rejected', 'revoked');
  CREATE TYPE "public"."enum__portfolio_cases_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__portfolio_cases_v_published_locale" AS ENUM('uk', 'ru', 'en');
  CREATE TYPE "public"."enum_testimonials_consent_status" AS ENUM('pending', 'approved', 'revoked');
  CREATE TYPE "public"."enum_testimonials_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__testimonials_v_version_consent_status" AS ENUM('pending', 'approved', 'revoked');
  CREATE TYPE "public"."enum__testimonials_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__testimonials_v_published_locale" AS ENUM('uk', 'ru', 'en');
  CREATE TYPE "public"."enum_pages_page_type" AS ENUM('studio', 'contacts', 'privacy', 'terms', 'cookies', 'payments', 'cancellation-refunds', 'consent', 'service-state');
  CREATE TYPE "public"."enum_pages_cta_action" AS ENUM('inquiry', 'booking-request', 'deposit', 'instant-payment', 'waitlist', 'contact');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_page_type" AS ENUM('studio', 'contacts', 'privacy', 'terms', 'cookies', 'payments', 'cancellation-refunds', 'consent', 'service-state');
  CREATE TYPE "public"."enum__pages_v_version_cta_action" AS ENUM('inquiry', 'booking-request', 'deposit', 'instant-payment', 'waitlist', 'contact');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('uk', 'ru', 'en');
  CREATE TYPE "public"."enum_leads_preferred_contact_method" AS ENUM('email', 'phone', 'viber', 'telegram', 'whatsapp');
  CREATE TYPE "public"."enum_leads_locale" AS ENUM('uk', 'ru', 'en');
  CREATE TYPE "public"."enum_leads_source_type" AS ENUM('contact', 'booking', 'corporate', 'course', 'collection', 'atelier');
  CREATE TYPE "public"."enum_leads_duplicate_state" AS ENUM('unique', 'possible-duplicate', 'merged');
  CREATE TYPE "public"."enum_booking_requests_inquiry_type" AS ENUM('private', 'corporate');
  CREATE TYPE "public"."enum_booking_requests_request_mode" AS ENUM('inquiry', 'booking-request', 'deposit', 'instant-payment', 'waitlist');
  CREATE TYPE "public"."enum_booking_requests_format" AS ENUM('online', 'studio', 'remote-atelier', 'in-person', 'hybrid');
  CREATE TYPE "public"."enum_booking_requests_currency" AS ENUM('EUR', 'UAH');
  CREATE TYPE "public"."enum_booking_requests_status" AS ENUM('new', 'qualified', 'waiting-for-client', 'awaiting-schedule', 'awaiting-payment', 'confirmed', 'completed', 'cancelled', 'closed');
  CREATE TYPE "public"."enum_payment_orders_provider" AS ENUM('stripe', 'liqpay', 'fondy');
  CREATE TYPE "public"."enum_payment_orders_currency" AS ENUM('EUR', 'UAH');
  CREATE TYPE "public"."enum_payment_orders_mode" AS ENUM('test', 'live');
  CREATE TYPE "public"."enum_payment_orders_status" AS ENUM('created', 'pending', 'requires-action', 'paid', 'failed', 'cancelled', 'expired', 'partially-refunded', 'refunded', 'disputed');
  CREATE TYPE "public"."enum_webhook_events_provider" AS ENUM('stripe', 'liqpay', 'fondy');
  CREATE TYPE "public"."enum_webhook_events_processing_status" AS ENUM('received', 'processed', 'ignored', 'failed');
  CREATE TYPE "public"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_redirects_type" AS ENUM('301', '302');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_home_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__home_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__home_v_published_locale" AS ENUM('uk', 'ru', 'en');
  CREATE TYPE "public"."enum_header_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__header_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__header_v_published_locale" AS ENUM('uk', 'ru', 'en');
  CREATE TYPE "public"."enum_footer_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__footer_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__footer_v_published_locale" AS ENUM('uk', 'ru', 'en');
  CREATE TYPE "public"."enum_site_settings_map_provider" AS ENUM('none', 'google', 'openstreetmap');
  CREATE TYPE "public"."enum_booking_settings_enabled_modes" AS ENUM('inquiry', 'booking-request', 'deposit', 'instant-payment', 'waitlist');
  CREATE TYPE "public"."enum_booking_settings_provider_routing_currency" AS ENUM('EUR', 'UAH');
  CREATE TYPE "public"."enum_booking_settings_provider_routing_provider" AS ENUM('stripe', 'liqpay', 'fondy');
  CREATE TYPE "public"."enum_booking_settings_notification_recipients_environment" AS ENUM('local', 'preview', 'production');
  CREATE TABLE "users_roles" (
	"order" integer NOT NULL,
	"parent_id" uuid NOT NULL,
	"value" "enum_users_roles",
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
  );

  CREATE TABLE "users_sessions" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp(3) with time zone,
	"expires_at" timestamp(3) with time zone NOT NULL
  );

  CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"admin_locale" "enum_users_admin_locale" DEFAULT 'uk',
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"email" varchar NOT NULL,
	"reset_password_token" varchar,
	"reset_password_expiration" timestamp(3) with time zone,
	"salt" varchar,
	"hash" varchar,
	"login_attempts" numeric DEFAULT 0,
	"lock_until" timestamp(3) with time zone
  );

  CREATE TABLE "media_allowed_usage_contexts" (
	"order" integer NOT NULL,
	"parent_id" uuid NOT NULL,
	"value" "enum_media_allowed_usage_contexts",
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
  );

  CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"internal_label" varchar NOT NULL,
	"source" "enum_media_source" NOT NULL,
	"usage_rights_status" "enum_media_usage_rights_status" DEFAULT 'pending' NOT NULL,
	"model_release_status" "enum_media_model_release_status" DEFAULT 'not-applicable' NOT NULL,
	"public_visibility" boolean DEFAULT false NOT NULL,
	"is_real_client_proof" boolean DEFAULT false NOT NULL,
	"replacement_priority" "enum_media_replacement_priority" DEFAULT 'none' NOT NULL,
	"creator" varchar,
	"rights_expiry" timestamp(3) with time zone,
	"source_metadata" varchar,
	"prefix" varchar DEFAULT '',
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"url" varchar,
	"thumbnail_u_r_l" varchar,
	"filename" varchar,
	"mime_type" varchar,
	"filesize" numeric,
	"width" numeric,
	"height" numeric,
	"focal_x" numeric,
	"focal_y" numeric,
	"sizes_thumbnail_url" varchar,
	"sizes_thumbnail_width" numeric,
	"sizes_thumbnail_height" numeric,
	"sizes_thumbnail_mime_type" varchar,
	"sizes_thumbnail_filesize" numeric,
	"sizes_thumbnail_filename" varchar,
	"sizes_card_url" varchar,
	"sizes_card_width" numeric,
	"sizes_card_height" numeric,
	"sizes_card_mime_type" varchar,
	"sizes_card_filesize" numeric,
	"sizes_card_filename" varchar,
	"sizes_editorial_url" varchar,
	"sizes_editorial_width" numeric,
	"sizes_editorial_height" numeric,
	"sizes_editorial_mime_type" varchar,
	"sizes_editorial_filesize" numeric,
	"sizes_editorial_filename" varchar,
	"sizes_hero_url" varchar,
	"sizes_hero_width" numeric,
	"sizes_hero_height" numeric,
	"sizes_hero_mime_type" varchar,
	"sizes_hero_filesize" numeric,
	"sizes_hero_filename" varchar
  );

  CREATE TABLE "media_locales" (
	"alt" varchar NOT NULL,
	"credit_line" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "directions_process_steps" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"description" varchar
  );

  CREATE TABLE "directions_outcomes" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"text" varchar
  );

  CREATE TABLE "directions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legacy_key" varchar,
	"slug" varchar,
	"enabled" boolean DEFAULT true,
	"featured" boolean DEFAULT false,
	"sort_order" numeric DEFAULT 100,
	"canonical_key" "enum_directions_canonical_key",
	"hero_media_id" uuid,
	"navigation_visible" boolean DEFAULT true,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"_status" "enum_directions_status" DEFAULT 'draft'
  );

  CREATE TABLE "directions_locales" (
	"title" varchar,
	"summary" varchar,
	"eyebrow" varchar,
	"narrative" varchar,
	"meta_title" varchar,
	"meta_description" varchar,
	"meta_image_id" uuid,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "directions_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"services_id" uuid,
	"courses_id" uuid,
	"fashion_collections_id" uuid
  );

  CREATE TABLE "_directions_v_version_process_steps" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"description" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_directions_v_version_outcomes" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_directions_v" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"version_legacy_key" varchar,
	"version_slug" varchar,
	"version_enabled" boolean DEFAULT true,
	"version_featured" boolean DEFAULT false,
	"version_sort_order" numeric DEFAULT 100,
	"version_canonical_key" "enum__directions_v_version_canonical_key",
	"version_hero_media_id" uuid,
	"version_navigation_visible" boolean DEFAULT true,
	"version_updated_at" timestamp(3) with time zone,
	"version_created_at" timestamp(3) with time zone,
	"version__status" "enum__directions_v_version_status" DEFAULT 'draft',
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"snapshot" boolean,
	"published_locale" "enum__directions_v_published_locale",
	"latest" boolean,
	"autosave" boolean
  );

  CREATE TABLE "_directions_v_locales" (
	"version_title" varchar,
	"version_summary" varchar,
	"version_eyebrow" varchar,
	"version_narrative" varchar,
	"version_meta_title" varchar,
	"version_meta_description" varchar,
	"version_meta_image_id" uuid,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "_directions_v_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"services_id" uuid,
	"courses_id" uuid,
	"fashion_collections_id" uuid
  );

  CREATE TABLE "services_formats" (
	"order" integer NOT NULL,
	"parent_id" uuid NOT NULL,
	"value" "enum_services_formats",
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
  );

  CREATE TABLE "services_process_steps" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"description" varchar
  );

  CREATE TABLE "services_benefits" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"description" varchar
  );

  CREATE TABLE "services_outcomes" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"text" varchar
  );

  CREATE TABLE "services_faq" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"question" varchar,
	"answer" varchar
  );

  CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legacy_key" varchar,
	"slug" varchar,
	"enabled" boolean DEFAULT true,
	"featured" boolean DEFAULT false,
	"sort_order" numeric DEFAULT 100,
	"primary_direction_id" uuid,
	"cta_action" "enum_services_cta_action" DEFAULT 'booking-request',
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"_status" "enum_services_status" DEFAULT 'draft'
  );

  CREATE TABLE "services_locales" (
	"title" varchar,
	"summary" varchar,
	"audience" varchar,
	"intro" varchar,
	"timing_note" varchar,
	"qualification" varchar,
	"cta_label" varchar,
	"meta_title" varchar,
	"meta_description" varchar,
	"meta_image_id" uuid,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "services_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"directions_id" uuid,
	"media_id" uuid,
	"offers_id" uuid,
	"portfolio_cases_id" uuid,
	"services_id" uuid,
	"courses_id" uuid,
	"fashion_collections_id" uuid
  );

  CREATE TABLE "_services_v_version_formats" (
	"order" integer NOT NULL,
	"parent_id" uuid NOT NULL,
	"value" "enum__services_v_version_formats",
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
  );

  CREATE TABLE "_services_v_version_process_steps" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"description" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_services_v_version_benefits" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"description" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_services_v_version_outcomes" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_services_v_version_faq" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" varchar,
	"answer" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_services_v" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"version_legacy_key" varchar,
	"version_slug" varchar,
	"version_enabled" boolean DEFAULT true,
	"version_featured" boolean DEFAULT false,
	"version_sort_order" numeric DEFAULT 100,
	"version_primary_direction_id" uuid,
	"version_cta_action" "enum__services_v_version_cta_action" DEFAULT 'booking-request',
	"version_updated_at" timestamp(3) with time zone,
	"version_created_at" timestamp(3) with time zone,
	"version__status" "enum__services_v_version_status" DEFAULT 'draft',
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"snapshot" boolean,
	"published_locale" "enum__services_v_published_locale",
	"latest" boolean,
	"autosave" boolean
  );

  CREATE TABLE "_services_v_locales" (
	"version_title" varchar,
	"version_summary" varchar,
	"version_audience" varchar,
	"version_intro" varchar,
	"version_timing_note" varchar,
	"version_qualification" varchar,
	"version_cta_label" varchar,
	"version_meta_title" varchar,
	"version_meta_description" varchar,
	"version_meta_image_id" uuid,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "_services_v_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"directions_id" uuid,
	"media_id" uuid,
	"offers_id" uuid,
	"portfolio_cases_id" uuid,
	"services_id" uuid,
	"courses_id" uuid,
	"fashion_collections_id" uuid
  );

  CREATE TABLE "offers_prices" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"currency" "enum_offers_prices_currency",
	"amount" numeric,
	"min_amount" numeric,
	"max_amount" numeric
  );

  CREATE TABLE "offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legacy_key" varchar,
	"service_id" uuid,
	"sku" varchar,
	"format" "enum_offers_format",
	"pricing_mode" "enum_offers_pricing_mode",
	"checkout_mode" "enum_offers_checkout_mode",
	"commercial_status" "enum_offers_commercial_status" DEFAULT 'active',
	"duration_minutes" numeric,
	"sessions" numeric,
	"deposit_amount" numeric,
	"deposit_percentage" numeric,
	"effective_from" timestamp(3) with time zone,
	"effective_until" timestamp(3) with time zone,
	"terms_version" varchar,
	"enabled" boolean DEFAULT true,
	"sort_order" numeric DEFAULT 100,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"_status" "enum_offers_status" DEFAULT 'draft'
  );

  CREATE TABLE "offers_locales" (
	"title" varchar,
	"short_description" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "_offers_v_version_prices" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"currency" "enum__offers_v_version_prices_currency",
	"amount" numeric,
	"min_amount" numeric,
	"max_amount" numeric,
	"_uuid" varchar
  );

  CREATE TABLE "_offers_v" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"version_legacy_key" varchar,
	"version_service_id" uuid,
	"version_sku" varchar,
	"version_format" "enum__offers_v_version_format",
	"version_pricing_mode" "enum__offers_v_version_pricing_mode",
	"version_checkout_mode" "enum__offers_v_version_checkout_mode",
	"version_commercial_status" "enum__offers_v_version_commercial_status" DEFAULT 'active',
	"version_duration_minutes" numeric,
	"version_sessions" numeric,
	"version_deposit_amount" numeric,
	"version_deposit_percentage" numeric,
	"version_effective_from" timestamp(3) with time zone,
	"version_effective_until" timestamp(3) with time zone,
	"version_terms_version" varchar,
	"version_enabled" boolean DEFAULT true,
	"version_sort_order" numeric DEFAULT 100,
	"version_updated_at" timestamp(3) with time zone,
	"version_created_at" timestamp(3) with time zone,
	"version__status" "enum__offers_v_version_status" DEFAULT 'draft',
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"snapshot" boolean,
	"published_locale" "enum__offers_v_published_locale",
	"latest" boolean,
	"autosave" boolean
  );

  CREATE TABLE "_offers_v_locales" (
	"version_title" varchar,
	"version_short_description" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "courses_formats" (
	"order" integer NOT NULL,
	"parent_id" uuid NOT NULL,
	"value" "enum_courses_formats",
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
  );

  CREATE TABLE "courses_program" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"description" varchar
  );

  CREATE TABLE "courses_faq" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"question" varchar,
	"answer" varchar
  );

  CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legacy_key" varchar,
	"slug" varchar,
	"enabled" boolean DEFAULT true,
	"featured" boolean DEFAULT false,
	"sort_order" numeric DEFAULT 100,
	"direction_id" uuid,
	"sessions" numeric,
	"availability" "enum_courses_availability" DEFAULT 'coming-soon',
	"cta_action" "enum_courses_cta_action" DEFAULT 'booking-request',
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"_status" "enum_courses_status" DEFAULT 'draft'
  );

  CREATE TABLE "courses_locales" (
	"title" varchar,
	"summary" varchar,
	"description" varchar,
	"audience" varchar,
	"prerequisites" varchar,
	"instructor" varchar,
	"credentials" varchar,
	"intake_note" varchar,
	"cta_label" varchar,
	"meta_title" varchar,
	"meta_description" varchar,
	"meta_image_id" uuid,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "courses_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"offers_id" uuid,
	"media_id" uuid,
	"services_id" uuid,
	"fashion_collections_id" uuid
  );

  CREATE TABLE "_courses_v_version_formats" (
	"order" integer NOT NULL,
	"parent_id" uuid NOT NULL,
	"value" "enum__courses_v_version_formats",
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
  );

  CREATE TABLE "_courses_v_version_program" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"description" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_courses_v_version_faq" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" varchar,
	"answer" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_courses_v" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"version_legacy_key" varchar,
	"version_slug" varchar,
	"version_enabled" boolean DEFAULT true,
	"version_featured" boolean DEFAULT false,
	"version_sort_order" numeric DEFAULT 100,
	"version_direction_id" uuid,
	"version_sessions" numeric,
	"version_availability" "enum__courses_v_version_availability" DEFAULT 'coming-soon',
	"version_cta_action" "enum__courses_v_version_cta_action" DEFAULT 'booking-request',
	"version_updated_at" timestamp(3) with time zone,
	"version_created_at" timestamp(3) with time zone,
	"version__status" "enum__courses_v_version_status" DEFAULT 'draft',
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"snapshot" boolean,
	"published_locale" "enum__courses_v_published_locale",
	"latest" boolean,
	"autosave" boolean
  );

  CREATE TABLE "_courses_v_locales" (
	"version_title" varchar,
	"version_summary" varchar,
	"version_description" varchar,
	"version_audience" varchar,
	"version_prerequisites" varchar,
	"version_instructor" varchar,
	"version_credentials" varchar,
	"version_intake_note" varchar,
	"version_cta_label" varchar,
	"version_meta_title" varchar,
	"version_meta_description" varchar,
	"version_meta_image_id" uuid,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "_courses_v_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"offers_id" uuid,
	"media_id" uuid,
	"services_id" uuid,
	"fashion_collections_id" uuid
  );

  CREATE TABLE "fashion_collections_materials" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"material" varchar
  );

  CREATE TABLE "fashion_collections_pieces" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar,
	"description" varchar
  );

  CREATE TABLE "fashion_collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legacy_key" varchar,
	"slug" varchar,
	"enabled" boolean DEFAULT true,
	"featured" boolean DEFAULT false,
	"sort_order" numeric DEFAULT 100,
	"collection_type" "enum_fashion_collections_collection_type",
	"season" varchar,
	"year" numeric,
	"video_u_r_l" varchar,
	"availability" "enum_fashion_collections_availability" DEFAULT 'inquiry',
	"related_course_id" uuid,
	"cta_action" "enum_fashion_collections_cta_action" DEFAULT 'booking-request',
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"_status" "enum_fashion_collections_status" DEFAULT 'draft'
  );

  CREATE TABLE "fashion_collections_locales" (
	"title" varchar,
	"summary" varchar,
	"narrative" varchar,
	"styling_notes" varchar,
	"collaboration_credits" varchar,
	"rights_and_credits" varchar,
	"cta_label" varchar,
	"meta_title" varchar,
	"meta_description" varchar,
	"meta_image_id" uuid,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "fashion_collections_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"media_id" uuid,
	"offers_id" uuid,
	"services_id" uuid
  );

  CREATE TABLE "_fashion_collections_v_version_materials" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"material" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_fashion_collections_v_version_pieces" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar,
	"description" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_fashion_collections_v" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"version_legacy_key" varchar,
	"version_slug" varchar,
	"version_enabled" boolean DEFAULT true,
	"version_featured" boolean DEFAULT false,
	"version_sort_order" numeric DEFAULT 100,
	"version_collection_type" "enum__fashion_collections_v_version_collection_type",
	"version_season" varchar,
	"version_year" numeric,
	"version_video_u_r_l" varchar,
	"version_availability" "enum__fashion_collections_v_version_availability" DEFAULT 'inquiry',
	"version_related_course_id" uuid,
	"version_cta_action" "enum__fashion_collections_v_version_cta_action" DEFAULT 'booking-request',
	"version_updated_at" timestamp(3) with time zone,
	"version_created_at" timestamp(3) with time zone,
	"version__status" "enum__fashion_collections_v_version_status" DEFAULT 'draft',
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"snapshot" boolean,
	"published_locale" "enum__fashion_collections_v_published_locale",
	"latest" boolean,
	"autosave" boolean
  );

  CREATE TABLE "_fashion_collections_v_locales" (
	"version_title" varchar,
	"version_summary" varchar,
	"version_narrative" varchar,
	"version_styling_notes" varchar,
	"version_collaboration_credits" varchar,
	"version_rights_and_credits" varchar,
	"version_cta_label" varchar,
	"version_meta_title" varchar,
	"version_meta_description" varchar,
	"version_meta_image_id" uuid,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "_fashion_collections_v_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"media_id" uuid,
	"offers_id" uuid,
	"services_id" uuid
  );

  CREATE TABLE "portfolio_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legacy_key" varchar,
	"slug" varchar,
	"enabled" boolean DEFAULT true,
	"featured" boolean DEFAULT false,
	"sort_order" numeric DEFAULT 100,
	"client_type" "enum_portfolio_cases_client_type",
	"has_before_after" boolean DEFAULT false,
	"consent_reference" varchar,
	"is_real_client_proof" boolean DEFAULT false,
	"usage_rights_status" "enum_portfolio_cases_usage_rights_status" DEFAULT 'pending',
	"approval_status" "enum_portfolio_cases_approval_status" DEFAULT 'pending',
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"_status" "enum_portfolio_cases_status" DEFAULT 'draft'
  );

  CREATE TABLE "portfolio_cases_locales" (
	"title" varchar,
	"summary" varchar,
	"brief" varchar,
	"constraints" varchar,
	"research" varchar,
	"process" varchar,
	"result" varchar,
	"meta_title" varchar,
	"meta_description" varchar,
	"meta_image_id" uuid,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "portfolio_cases_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"services_id" uuid,
	"media_id" uuid
  );

  CREATE TABLE "_portfolio_cases_v" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"version_legacy_key" varchar,
	"version_slug" varchar,
	"version_enabled" boolean DEFAULT true,
	"version_featured" boolean DEFAULT false,
	"version_sort_order" numeric DEFAULT 100,
	"version_client_type" "enum__portfolio_cases_v_version_client_type",
	"version_has_before_after" boolean DEFAULT false,
	"version_consent_reference" varchar,
	"version_is_real_client_proof" boolean DEFAULT false,
	"version_usage_rights_status" "enum__portfolio_cases_v_version_usage_rights_status" DEFAULT 'pending',
	"version_approval_status" "enum__portfolio_cases_v_version_approval_status" DEFAULT 'pending',
	"version_updated_at" timestamp(3) with time zone,
	"version_created_at" timestamp(3) with time zone,
	"version__status" "enum__portfolio_cases_v_version_status" DEFAULT 'draft',
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"snapshot" boolean,
	"published_locale" "enum__portfolio_cases_v_published_locale",
	"latest" boolean,
	"autosave" boolean
  );

  CREATE TABLE "_portfolio_cases_v_locales" (
	"version_title" varchar,
	"version_summary" varchar,
	"version_brief" varchar,
	"version_constraints" varchar,
	"version_research" varchar,
	"version_process" varchar,
	"version_result" varchar,
	"version_meta_title" varchar,
	"version_meta_description" varchar,
	"version_meta_image_id" uuid,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "_portfolio_cases_v_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"services_id" uuid,
	"media_id" uuid
  );

  CREATE TABLE "testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legacy_key" varchar,
	"related_service_id" uuid,
	"related_case_id" uuid,
	"consent_status" "enum_testimonials_consent_status" DEFAULT 'pending',
	"proof_reference" varchar,
	"enabled" boolean DEFAULT true,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"_status" "enum_testimonials_status" DEFAULT 'draft'
  );

  CREATE TABLE "testimonials_locales" (
	"quote" varchar,
	"attribution" varchar,
	"role_or_company" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "_testimonials_v" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"version_legacy_key" varchar,
	"version_related_service_id" uuid,
	"version_related_case_id" uuid,
	"version_consent_status" "enum__testimonials_v_version_consent_status" DEFAULT 'pending',
	"version_proof_reference" varchar,
	"version_enabled" boolean DEFAULT true,
	"version_updated_at" timestamp(3) with time zone,
	"version_created_at" timestamp(3) with time zone,
	"version__status" "enum__testimonials_v_version_status" DEFAULT 'draft',
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"snapshot" boolean,
	"published_locale" "enum__testimonials_v_published_locale",
	"latest" boolean,
	"autosave" boolean
  );

  CREATE TABLE "_testimonials_v_locales" (
	"version_quote" varchar,
	"version_attribution" varchar,
	"version_role_or_company" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "pages_sections" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"body" varchar,
	"media_id" uuid
  );

  CREATE TABLE "pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legacy_key" varchar,
	"slug" varchar,
	"enabled" boolean DEFAULT true,
	"featured" boolean DEFAULT false,
	"sort_order" numeric DEFAULT 100,
	"page_type" "enum_pages_page_type",
	"contact_configuration_show_map" boolean DEFAULT false,
	"contact_configuration_corporate_context" boolean DEFAULT true,
	"legal_version" varchar,
	"effective_date" timestamp(3) with time zone,
	"cta_action" "enum_pages_cta_action" DEFAULT 'booking-request',
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"_status" "enum_pages_status" DEFAULT 'draft'
  );

  CREATE TABLE "pages_locales" (
	"title" varchar,
	"summary" varchar,
	"eyebrow" varchar,
	"body" varchar,
	"cta_label" varchar,
	"meta_title" varchar,
	"meta_description" varchar,
	"meta_image_id" uuid,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "_pages_v_version_sections" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"body" varchar,
	"media_id" uuid,
	"_uuid" varchar
  );

  CREATE TABLE "_pages_v" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"version_legacy_key" varchar,
	"version_slug" varchar,
	"version_enabled" boolean DEFAULT true,
	"version_featured" boolean DEFAULT false,
	"version_sort_order" numeric DEFAULT 100,
	"version_page_type" "enum__pages_v_version_page_type",
	"version_contact_configuration_show_map" boolean DEFAULT false,
	"version_contact_configuration_corporate_context" boolean DEFAULT true,
	"version_legal_version" varchar,
	"version_effective_date" timestamp(3) with time zone,
	"version_cta_action" "enum__pages_v_version_cta_action" DEFAULT 'booking-request',
	"version_updated_at" timestamp(3) with time zone,
	"version_created_at" timestamp(3) with time zone,
	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"snapshot" boolean,
	"published_locale" "enum__pages_v_published_locale",
	"latest" boolean,
	"autosave" boolean
  );

  CREATE TABLE "_pages_v_locales" (
	"version_title" varchar,
	"version_summary" varchar,
	"version_eyebrow" varchar,
	"version_body" varchar,
	"version_cta_label" varchar,
	"version_meta_title" varchar,
	"version_meta_description" varchar,
	"version_meta_image_id" uuid,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar,
	"phone" varchar,
	"company" varchar,
	"preferred_contact_method" "enum_leads_preferred_contact_method" NOT NULL,
	"locale" "enum_leads_locale" NOT NULL,
	"source_type" "enum_leads_source_type" NOT NULL,
	"consent_version" varchar NOT NULL,
	"consent_accepted_at" timestamp(3) with time zone NOT NULL,
	"first_touch_landing_page" varchar,
	"first_touch_referrer" varchar,
	"first_touch_utm_source" varchar,
	"first_touch_utm_medium" varchar,
	"first_touch_utm_campaign" varchar,
	"first_touch_utm_content" varchar,
	"first_touch_utm_term" varchar,
	"last_touch_landing_page" varchar,
	"last_touch_referrer" varchar,
	"last_touch_utm_source" varchar,
	"last_touch_utm_medium" varchar,
	"last_touch_utm_campaign" varchar,
	"last_touch_utm_content" varchar,
	"last_touch_utm_term" varchar,
	"duplicate_state" "enum_leads_duplicate_state" DEFAULT 'unique' NOT NULL,
	"merged_into_id" uuid,
	"assignee_id" uuid,
	"internal_notes" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "booking_requests_preferred_dates" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"preferred_at" timestamp(3) with time zone NOT NULL
  );

  CREATE TABLE "booking_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idempotency_key" varchar NOT NULL,
	"lead_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"offer_id" uuid,
	"course_id" uuid,
	"fashion_collection_id" uuid,
	"inquiry_type" "enum_booking_requests_inquiry_type" NOT NULL,
	"request_mode" "enum_booking_requests_request_mode" NOT NULL,
	"format" "enum_booking_requests_format" NOT NULL,
	"message" varchar,
	"currency" "enum_booking_requests_currency",
	"source_page" varchar NOT NULL,
	"referrer" varchar,
	"attribution_utm_source" varchar,
	"attribution_utm_medium" varchar,
	"attribution_utm_campaign" varchar,
	"attribution_utm_content" varchar,
	"attribution_utm_term" varchar,
	"status" "enum_booking_requests_status" DEFAULT 'new' NOT NULL,
	"internal_notes" varchar,
	"payment_order_id" uuid,
	"consent_version" varchar NOT NULL,
	"consent_accepted_at" timestamp(3) with time zone NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payment_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_u_u_i_d" varchar NOT NULL,
	"booking_request_id" uuid NOT NULL,
	"commercial_snapshot_offer_i_d" varchar NOT NULL,
	"commercial_snapshot_title" varchar NOT NULL,
	"commercial_snapshot_sku" varchar NOT NULL,
	"commercial_snapshot_terms_version" varchar NOT NULL,
	"provider" "enum_payment_orders_provider" NOT NULL,
	"provider_order_i_d" varchar,
	"amount" numeric NOT NULL,
	"currency" "enum_payment_orders_currency" NOT NULL,
	"mode" "enum_payment_orders_mode" NOT NULL,
	"checkout_u_r_l" varchar,
	"checkout_expires_at" timestamp(3) with time zone,
	"status" "enum_payment_orders_status" DEFAULT 'created' NOT NULL,
	"idempotency_key" varchar NOT NULL,
	"paid_amount" numeric,
	"refunded_amount" numeric,
	"safe_failure_code" varchar,
	"paid_at" timestamp(3) with time zone,
	"refunded_at" timestamp(3) with time zone,
	"audit_note" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" "enum_webhook_events_provider" NOT NULL,
	"provider_event_i_d" varchar NOT NULL,
	"event_type" varchar NOT NULL,
	"received_at" timestamp(3) with time zone NOT NULL,
	"processing_status" "enum_webhook_events_processing_status" DEFAULT 'received' NOT NULL,
	"payment_order_id" uuid,
	"retry_count" numeric DEFAULT 0 NOT NULL,
	"sanitized_error" varchar,
	"payload_hash" varchar NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "redirects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from" varchar NOT NULL,
	"to_type" "enum_redirects_to_type" DEFAULT 'reference',
	"to_url" varchar,
	"type" "enum_redirects_type" NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "redirects_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"directions_id" uuid,
	"services_id" uuid,
	"courses_id" uuid,
	"fashion_collections_id" uuid,
	"portfolio_cases_id" uuid,
	"pages_id" uuid
  );

  CREATE TABLE "payload_kv" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar NOT NULL,
	"data" jsonb NOT NULL
  );

  CREATE TABLE "payload_jobs_log" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"executed_at" timestamp(3) with time zone NOT NULL,
	"completed_at" timestamp(3) with time zone NOT NULL,
	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
	"task_i_d" varchar NOT NULL,
	"input" jsonb,
	"output" jsonb,
	"state" "enum_payload_jobs_log_state" NOT NULL,
	"error" jsonb
  );

  CREATE TABLE "payload_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"input" jsonb,
	"completed_at" timestamp(3) with time zone,
	"total_tried" numeric DEFAULT 0,
	"has_error" boolean DEFAULT false,
	"error" jsonb,
	"task_slug" "enum_payload_jobs_task_slug",
	"queue" varchar DEFAULT 'default',
	"wait_until" timestamp(3) with time zone,
	"processing" boolean DEFAULT false,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_locked_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"global_slug" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_locked_documents_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"users_id" uuid,
	"media_id" uuid,
	"directions_id" uuid,
	"services_id" uuid,
	"offers_id" uuid,
	"courses_id" uuid,
	"fashion_collections_id" uuid,
	"portfolio_cases_id" uuid,
	"testimonials_id" uuid,
	"pages_id" uuid,
	"leads_id" uuid,
	"booking_requests_id" uuid,
	"payment_orders_id" uuid,
	"webhook_events_id" uuid,
	"redirects_id" uuid
  );

  CREATE TABLE "payload_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar,
	"value" jsonb,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_preferences_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"users_id" uuid
  );

  CREATE TABLE "payload_migrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar,
	"batch" numeric,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "home_method" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"label" varchar,
	"description" varchar
  );

  CREATE TABLE "home" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hero_media_id" uuid,
	"primary_c_t_a_path" varchar,
	"secondary_c_t_a_path" varchar,
	"_status" "enum_home_status" DEFAULT 'draft',
	"updated_at" timestamp(3) with time zone,
	"created_at" timestamp(3) with time zone
  );

  CREATE TABLE "home_locales" (
	"hero_eyebrow" varchar,
	"hero_title" varchar,
	"hero_summary" varchar,
	"primary_c_t_a_label" varchar,
	"secondary_c_t_a_label" varchar,
	"studio_intro" varchar,
	"final_c_t_a_title" varchar,
	"final_c_t_a_summary" varchar,
	"meta_title" varchar,
	"meta_description" varchar,
	"meta_image_id" uuid,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "home_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"directions_id" uuid,
	"services_id" uuid,
	"offers_id" uuid,
	"courses_id" uuid,
	"fashion_collections_id" uuid,
	"portfolio_cases_id" uuid
  );

  CREATE TABLE "_home_v_version_method" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" varchar,
	"description" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_home_v" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version_hero_media_id" uuid,
	"version_primary_c_t_a_path" varchar,
	"version_secondary_c_t_a_path" varchar,
	"version__status" "enum__home_v_version_status" DEFAULT 'draft',
	"version_updated_at" timestamp(3) with time zone,
	"version_created_at" timestamp(3) with time zone,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"snapshot" boolean,
	"published_locale" "enum__home_v_published_locale",
	"latest" boolean,
	"autosave" boolean
  );

  CREATE TABLE "_home_v_locales" (
	"version_hero_eyebrow" varchar,
	"version_hero_title" varchar,
	"version_hero_summary" varchar,
	"version_primary_c_t_a_label" varchar,
	"version_secondary_c_t_a_label" varchar,
	"version_studio_intro" varchar,
	"version_final_c_t_a_title" varchar,
	"version_final_c_t_a_summary" varchar,
	"version_meta_title" varchar,
	"version_meta_description" varchar,
	"version_meta_image_id" uuid,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "_home_v_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"directions_id" uuid,
	"services_id" uuid,
	"offers_id" uuid,
	"courses_id" uuid,
	"fashion_collections_id" uuid,
	"portfolio_cases_id" uuid
  );

  CREATE TABLE "header_navigation" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"path" varchar,
	"visible" boolean DEFAULT true,
	"external" boolean DEFAULT false
  );

  CREATE TABLE "header_navigation_locales" (
	"label" varchar,
	"accessible_label" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" varchar NOT NULL
  );

  CREATE TABLE "header" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"_status" "enum_header_status" DEFAULT 'draft',
	"updated_at" timestamp(3) with time zone,
	"created_at" timestamp(3) with time zone
  );

  CREATE TABLE "header_locales" (
	"booking_label" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "_header_v_version_navigation" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" varchar,
	"visible" boolean DEFAULT true,
	"external" boolean DEFAULT false,
	"_uuid" varchar
  );

  CREATE TABLE "_header_v_version_navigation_locales" (
	"label" varchar,
	"accessible_label" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "_header_v" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version__status" "enum__header_v_version_status" DEFAULT 'draft',
	"version_updated_at" timestamp(3) with time zone,
	"version_created_at" timestamp(3) with time zone,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"snapshot" boolean,
	"published_locale" "enum__header_v_published_locale",
	"latest" boolean,
	"autosave" boolean
  );

  CREATE TABLE "_header_v_locales" (
	"version_booking_label" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "footer_social_links" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"platform" varchar,
	"url" varchar
  );

  CREATE TABLE "footer_social_links_locales" (
	"accessible_label" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" varchar NOT NULL
  );

  CREATE TABLE "footer_legal_navigation" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"path" varchar
  );

  CREATE TABLE "footer_legal_navigation_locales" (
	"label" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" varchar NOT NULL
  );

  CREATE TABLE "footer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"phone" varchar,
	"_status" "enum_footer_status" DEFAULT 'draft',
	"updated_at" timestamp(3) with time zone,
	"created_at" timestamp(3) with time zone
  );

  CREATE TABLE "footer_locales" (
	"address" varchar,
	"hours" varchar,
	"response_time" varchar,
	"copyright" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "_footer_v_version_social_links" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" varchar,
	"url" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_footer_v_version_social_links_locales" (
	"accessible_label" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "_footer_v_version_legal_navigation" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_footer_v_version_legal_navigation_locales" (
	"label" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "_footer_v" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version_email" varchar,
	"version_phone" varchar,
	"version__status" "enum__footer_v_version_status" DEFAULT 'draft',
	"version_updated_at" timestamp(3) with time zone,
	"version_created_at" timestamp(3) with time zone,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"snapshot" boolean,
	"published_locale" "enum__footer_v_published_locale",
	"latest" boolean,
	"autosave" boolean
  );

  CREATE TABLE "_footer_v_locales" (
	"version_address" varchar,
	"version_hours" varchar,
	"version_response_time" varchar,
	"version_copyright" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "site_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_name" varchar DEFAULT 'PURITY Fashion Studio' NOT NULL,
	"canonical_origin" varchar NOT NULL,
	"default_social_image_id" uuid,
	"contacts_email" varchar NOT NULL,
	"contacts_phone" varchar NOT NULL,
	"locale_labels_uk" varchar DEFAULT 'Українська' NOT NULL,
	"locale_labels_ru" varchar DEFAULT 'Русский' NOT NULL,
	"locale_labels_en" varchar DEFAULT 'English' NOT NULL,
	"ga4_measurement_i_d" varchar,
	"map_provider" "enum_site_settings_map_provider",
	"map_latitude" numeric,
	"map_longitude" numeric,
	"maintenance_enabled" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp(3) with time zone,
	"created_at" timestamp(3) with time zone
  );

  CREATE TABLE "site_settings_locales" (
	"contacts_address" varchar NOT NULL,
	"contacts_hours" varchar NOT NULL,
	"maintenance_message" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" uuid NOT NULL
  );

  CREATE TABLE "booking_settings_enabled_modes" (
	"order" integer NOT NULL,
	"parent_id" uuid NOT NULL,
	"value" "enum_booking_settings_enabled_modes",
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
  );

  CREATE TABLE "booking_settings_provider_routing" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"currency" "enum_booking_settings_provider_routing_currency" NOT NULL,
	"provider" "enum_booking_settings_provider_routing_provider" NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL
  );

  CREATE TABLE "booking_settings_provider_routing_locales" (
	"public_label" varchar,
	"id" serial PRIMARY KEY NOT NULL,
	"_locale" "_locales" NOT NULL,
	"_parent_id" varchar NOT NULL
  );

  CREATE TABLE "booking_settings_notification_recipients" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"environment" "enum_booking_settings_notification_recipients_environment" NOT NULL,
	"email" varchar NOT NULL
  );

  CREATE TABLE "booking_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timezone" varchar DEFAULT 'Europe/Kyiv' NOT NULL,
	"hold_minutes" numeric DEFAULT 15,
	"cancellation_window_hours" numeric,
	"updated_at" timestamp(3) with time zone,
	"created_at" timestamp(3) with time zone
  );

  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_allowed_usage_contexts" ADD CONSTRAINT "media_allowed_usage_contexts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "directions_process_steps" ADD CONSTRAINT "directions_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."directions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "directions_outcomes" ADD CONSTRAINT "directions_outcomes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."directions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "directions" ADD CONSTRAINT "directions_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "directions_locales" ADD CONSTRAINT "directions_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "directions_locales" ADD CONSTRAINT "directions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."directions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "directions_rels" ADD CONSTRAINT "directions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."directions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "directions_rels" ADD CONSTRAINT "directions_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "directions_rels" ADD CONSTRAINT "directions_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "directions_rels" ADD CONSTRAINT "directions_rels_fashion_collections_fk" FOREIGN KEY ("fashion_collections_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_directions_v_version_process_steps" ADD CONSTRAINT "_directions_v_version_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_directions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_directions_v_version_outcomes" ADD CONSTRAINT "_directions_v_version_outcomes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_directions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_directions_v" ADD CONSTRAINT "_directions_v_parent_id_directions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."directions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_directions_v" ADD CONSTRAINT "_directions_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_directions_v_locales" ADD CONSTRAINT "_directions_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_directions_v_locales" ADD CONSTRAINT "_directions_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_directions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_directions_v_rels" ADD CONSTRAINT "_directions_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_directions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_directions_v_rels" ADD CONSTRAINT "_directions_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_directions_v_rels" ADD CONSTRAINT "_directions_v_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_directions_v_rels" ADD CONSTRAINT "_directions_v_rels_fashion_collections_fk" FOREIGN KEY ("fashion_collections_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_formats" ADD CONSTRAINT "services_formats_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_process_steps" ADD CONSTRAINT "services_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_benefits" ADD CONSTRAINT "services_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_outcomes" ADD CONSTRAINT "services_outcomes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_faq" ADD CONSTRAINT "services_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_primary_direction_id_directions_id_fk" FOREIGN KEY ("primary_direction_id") REFERENCES "public"."directions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_locales" ADD CONSTRAINT "services_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_locales" ADD CONSTRAINT "services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_directions_fk" FOREIGN KEY ("directions_id") REFERENCES "public"."directions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_offers_fk" FOREIGN KEY ("offers_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_portfolio_cases_fk" FOREIGN KEY ("portfolio_cases_id") REFERENCES "public"."portfolio_cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_fashion_collections_fk" FOREIGN KEY ("fashion_collections_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_formats" ADD CONSTRAINT "_services_v_version_formats_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_process_steps" ADD CONSTRAINT "_services_v_version_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_benefits" ADD CONSTRAINT "_services_v_version_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_outcomes" ADD CONSTRAINT "_services_v_version_outcomes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_faq" ADD CONSTRAINT "_services_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_primary_direction_id_directions_id_fk" FOREIGN KEY ("version_primary_direction_id") REFERENCES "public"."directions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_locales" ADD CONSTRAINT "_services_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_locales" ADD CONSTRAINT "_services_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_directions_fk" FOREIGN KEY ("directions_id") REFERENCES "public"."directions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_offers_fk" FOREIGN KEY ("offers_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_portfolio_cases_fk" FOREIGN KEY ("portfolio_cases_id") REFERENCES "public"."portfolio_cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_fashion_collections_fk" FOREIGN KEY ("fashion_collections_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offers_prices" ADD CONSTRAINT "offers_prices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offers" ADD CONSTRAINT "offers_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offers_locales" ADD CONSTRAINT "offers_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_offers_v_version_prices" ADD CONSTRAINT "_offers_v_version_prices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_offers_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_offers_v" ADD CONSTRAINT "_offers_v_parent_id_offers_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."offers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offers_v" ADD CONSTRAINT "_offers_v_version_service_id_services_id_fk" FOREIGN KEY ("version_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offers_v_locales" ADD CONSTRAINT "_offers_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_offers_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_formats" ADD CONSTRAINT "courses_formats_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_program" ADD CONSTRAINT "courses_program_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_faq" ADD CONSTRAINT "courses_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_direction_id_directions_id_fk" FOREIGN KEY ("direction_id") REFERENCES "public"."directions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses_locales" ADD CONSTRAINT "courses_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses_locales" ADD CONSTRAINT "courses_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_offers_fk" FOREIGN KEY ("offers_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_fashion_collections_fk" FOREIGN KEY ("fashion_collections_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_version_formats" ADD CONSTRAINT "_courses_v_version_formats_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_version_program" ADD CONSTRAINT "_courses_v_version_program_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_version_faq" ADD CONSTRAINT "_courses_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v" ADD CONSTRAINT "_courses_v_parent_id_courses_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v" ADD CONSTRAINT "_courses_v_version_direction_id_directions_id_fk" FOREIGN KEY ("version_direction_id") REFERENCES "public"."directions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v_locales" ADD CONSTRAINT "_courses_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v_locales" ADD CONSTRAINT "_courses_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_rels" ADD CONSTRAINT "_courses_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_rels" ADD CONSTRAINT "_courses_v_rels_offers_fk" FOREIGN KEY ("offers_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_rels" ADD CONSTRAINT "_courses_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_rels" ADD CONSTRAINT "_courses_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_rels" ADD CONSTRAINT "_courses_v_rels_fashion_collections_fk" FOREIGN KEY ("fashion_collections_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections_materials" ADD CONSTRAINT "fashion_collections_materials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections_pieces" ADD CONSTRAINT "fashion_collections_pieces_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections" ADD CONSTRAINT "fashion_collections_related_course_id_courses_id_fk" FOREIGN KEY ("related_course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "fashion_collections_locales" ADD CONSTRAINT "fashion_collections_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "fashion_collections_locales" ADD CONSTRAINT "fashion_collections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections_rels" ADD CONSTRAINT "fashion_collections_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections_rels" ADD CONSTRAINT "fashion_collections_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections_rels" ADD CONSTRAINT "fashion_collections_rels_offers_fk" FOREIGN KEY ("offers_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections_rels" ADD CONSTRAINT "fashion_collections_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_version_materials" ADD CONSTRAINT "_fashion_collections_v_version_materials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_fashion_collections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_version_pieces" ADD CONSTRAINT "_fashion_collections_v_version_pieces_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_fashion_collections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v" ADD CONSTRAINT "_fashion_collections_v_parent_id_fashion_collections_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."fashion_collections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v" ADD CONSTRAINT "_fashion_collections_v_version_related_course_id_courses_id_fk" FOREIGN KEY ("version_related_course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_locales" ADD CONSTRAINT "_fashion_collections_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_locales" ADD CONSTRAINT "_fashion_collections_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_fashion_collections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_rels" ADD CONSTRAINT "_fashion_collections_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_fashion_collections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_rels" ADD CONSTRAINT "_fashion_collections_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_rels" ADD CONSTRAINT "_fashion_collections_v_rels_offers_fk" FOREIGN KEY ("offers_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_rels" ADD CONSTRAINT "_fashion_collections_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portfolio_cases_locales" ADD CONSTRAINT "portfolio_cases_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "portfolio_cases_locales" ADD CONSTRAINT "portfolio_cases_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."portfolio_cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portfolio_cases_rels" ADD CONSTRAINT "portfolio_cases_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."portfolio_cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portfolio_cases_rels" ADD CONSTRAINT "portfolio_cases_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portfolio_cases_rels" ADD CONSTRAINT "portfolio_cases_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_portfolio_cases_v" ADD CONSTRAINT "_portfolio_cases_v_parent_id_portfolio_cases_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."portfolio_cases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_portfolio_cases_v_locales" ADD CONSTRAINT "_portfolio_cases_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_portfolio_cases_v_locales" ADD CONSTRAINT "_portfolio_cases_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_portfolio_cases_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_portfolio_cases_v_rels" ADD CONSTRAINT "_portfolio_cases_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_portfolio_cases_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_portfolio_cases_v_rels" ADD CONSTRAINT "_portfolio_cases_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_portfolio_cases_v_rels" ADD CONSTRAINT "_portfolio_cases_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_related_service_id_services_id_fk" FOREIGN KEY ("related_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_related_case_id_portfolio_cases_id_fk" FOREIGN KEY ("related_case_id") REFERENCES "public"."portfolio_cases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials_locales" ADD CONSTRAINT "testimonials_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_parent_id_testimonials_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_related_service_id_services_id_fk" FOREIGN KEY ("version_related_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_related_case_id_portfolio_cases_id_fk" FOREIGN KEY ("version_related_case_id") REFERENCES "public"."portfolio_cases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v_locales" ADD CONSTRAINT "_testimonials_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_testimonials_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_sections" ADD CONSTRAINT "pages_sections_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_sections" ADD CONSTRAINT "pages_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_sections" ADD CONSTRAINT "_pages_v_version_sections_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_sections" ADD CONSTRAINT "_pages_v_version_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_merged_into_id_leads_id_fk" FOREIGN KEY ("merged_into_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "booking_requests_preferred_dates" ADD CONSTRAINT "booking_requests_preferred_dates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."booking_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_fashion_collection_id_fashion_collections_id_fk" FOREIGN KEY ("fashion_collection_id") REFERENCES "public"."fashion_collections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_payment_order_id_payment_orders_id_fk" FOREIGN KEY ("payment_order_id") REFERENCES "public"."payment_orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payment_orders" ADD CONSTRAINT "payment_orders_booking_request_id_booking_requests_id_fk" FOREIGN KEY ("booking_request_id") REFERENCES "public"."booking_requests"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_payment_order_id_payment_orders_id_fk" FOREIGN KEY ("payment_order_id") REFERENCES "public"."payment_orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_directions_fk" FOREIGN KEY ("directions_id") REFERENCES "public"."directions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_fashion_collections_fk" FOREIGN KEY ("fashion_collections_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_portfolio_cases_fk" FOREIGN KEY ("portfolio_cases_id") REFERENCES "public"."portfolio_cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_directions_fk" FOREIGN KEY ("directions_id") REFERENCES "public"."directions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_offers_fk" FOREIGN KEY ("offers_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_fashion_collections_fk" FOREIGN KEY ("fashion_collections_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_portfolio_cases_fk" FOREIGN KEY ("portfolio_cases_id") REFERENCES "public"."portfolio_cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_booking_requests_fk" FOREIGN KEY ("booking_requests_id") REFERENCES "public"."booking_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payment_orders_fk" FOREIGN KEY ("payment_orders_id") REFERENCES "public"."payment_orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_webhook_events_fk" FOREIGN KEY ("webhook_events_id") REFERENCES "public"."webhook_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_method" ADD CONSTRAINT "home_method_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_locales" ADD CONSTRAINT "home_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_locales" ADD CONSTRAINT "home_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_directions_fk" FOREIGN KEY ("directions_id") REFERENCES "public"."directions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_offers_fk" FOREIGN KEY ("offers_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_fashion_collections_fk" FOREIGN KEY ("fashion_collections_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_portfolio_cases_fk" FOREIGN KEY ("portfolio_cases_id") REFERENCES "public"."portfolio_cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_method" ADD CONSTRAINT "_home_v_version_method_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_locales" ADD CONSTRAINT "_home_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_locales" ADD CONSTRAINT "_home_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_directions_fk" FOREIGN KEY ("directions_id") REFERENCES "public"."directions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_offers_fk" FOREIGN KEY ("offers_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_fashion_collections_fk" FOREIGN KEY ("fashion_collections_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_portfolio_cases_fk" FOREIGN KEY ("portfolio_cases_id") REFERENCES "public"."portfolio_cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_navigation" ADD CONSTRAINT "header_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_navigation_locales" ADD CONSTRAINT "header_navigation_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_locales" ADD CONSTRAINT "header_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_header_v_version_navigation" ADD CONSTRAINT "_header_v_version_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_header_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_header_v_version_navigation_locales" ADD CONSTRAINT "_header_v_version_navigation_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_header_v_version_navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_header_v_locales" ADD CONSTRAINT "_header_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_header_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_social_links" ADD CONSTRAINT "footer_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_social_links_locales" ADD CONSTRAINT "footer_social_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_social_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_legal_navigation" ADD CONSTRAINT "footer_legal_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_legal_navigation_locales" ADD CONSTRAINT "footer_legal_navigation_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_legal_navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_locales" ADD CONSTRAINT "footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_social_links" ADD CONSTRAINT "_footer_v_version_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_social_links_locales" ADD CONSTRAINT "_footer_v_version_social_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_social_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_legal_navigation" ADD CONSTRAINT "_footer_v_version_legal_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_legal_navigation_locales" ADD CONSTRAINT "_footer_v_version_legal_navigation_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_legal_navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_locales" ADD CONSTRAINT "_footer_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_social_image_id_media_id_fk" FOREIGN KEY ("default_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "booking_settings_enabled_modes" ADD CONSTRAINT "booking_settings_enabled_modes_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."booking_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "booking_settings_provider_routing" ADD CONSTRAINT "booking_settings_provider_routing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."booking_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "booking_settings_provider_routing_locales" ADD CONSTRAINT "booking_settings_provider_routing_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."booking_settings_provider_routing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "booking_settings_notification_recipients" ADD CONSTRAINT "booking_settings_notification_recipients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."booking_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_allowed_usage_contexts_order_idx" ON "media_allowed_usage_contexts" USING btree ("order");
  CREATE INDEX "media_allowed_usage_contexts_parent_idx" ON "media_allowed_usage_contexts" USING btree ("parent_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_editorial_sizes_editorial_filename_idx" ON "media" USING btree ("sizes_editorial_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "directions_process_steps_order_idx" ON "directions_process_steps" USING btree ("_order");
  CREATE INDEX "directions_process_steps_parent_id_idx" ON "directions_process_steps" USING btree ("_parent_id");
  CREATE INDEX "directions_process_steps_locale_idx" ON "directions_process_steps" USING btree ("_locale");
  CREATE INDEX "directions_outcomes_order_idx" ON "directions_outcomes" USING btree ("_order");
  CREATE INDEX "directions_outcomes_parent_id_idx" ON "directions_outcomes" USING btree ("_parent_id");
  CREATE INDEX "directions_outcomes_locale_idx" ON "directions_outcomes" USING btree ("_locale");
  CREATE UNIQUE INDEX "directions_legacy_key_idx" ON "directions" USING btree ("legacy_key");
  CREATE UNIQUE INDEX "directions_slug_idx" ON "directions" USING btree ("slug");
  CREATE INDEX "directions_sort_order_idx" ON "directions" USING btree ("sort_order");
  CREATE UNIQUE INDEX "directions_canonical_key_idx" ON "directions" USING btree ("canonical_key");
  CREATE INDEX "directions_hero_media_idx" ON "directions" USING btree ("hero_media_id");
  CREATE INDEX "directions_updated_at_idx" ON "directions" USING btree ("updated_at");
  CREATE INDEX "directions_created_at_idx" ON "directions" USING btree ("created_at");
  CREATE INDEX "directions__status_idx" ON "directions" USING btree ("_status");
  CREATE INDEX "directions_meta_meta_image_idx" ON "directions_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "directions_locales_locale_parent_id_unique" ON "directions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "directions_rels_order_idx" ON "directions_rels" USING btree ("order");
  CREATE INDEX "directions_rels_parent_idx" ON "directions_rels" USING btree ("parent_id");
  CREATE INDEX "directions_rels_path_idx" ON "directions_rels" USING btree ("path");
  CREATE INDEX "directions_rels_services_id_idx" ON "directions_rels" USING btree ("services_id");
  CREATE INDEX "directions_rels_courses_id_idx" ON "directions_rels" USING btree ("courses_id");
  CREATE INDEX "directions_rels_fashion_collections_id_idx" ON "directions_rels" USING btree ("fashion_collections_id");
  CREATE INDEX "_directions_v_version_process_steps_order_idx" ON "_directions_v_version_process_steps" USING btree ("_order");
  CREATE INDEX "_directions_v_version_process_steps_parent_id_idx" ON "_directions_v_version_process_steps" USING btree ("_parent_id");
  CREATE INDEX "_directions_v_version_process_steps_locale_idx" ON "_directions_v_version_process_steps" USING btree ("_locale");
  CREATE INDEX "_directions_v_version_outcomes_order_idx" ON "_directions_v_version_outcomes" USING btree ("_order");
  CREATE INDEX "_directions_v_version_outcomes_parent_id_idx" ON "_directions_v_version_outcomes" USING btree ("_parent_id");
  CREATE INDEX "_directions_v_version_outcomes_locale_idx" ON "_directions_v_version_outcomes" USING btree ("_locale");
  CREATE INDEX "_directions_v_parent_idx" ON "_directions_v" USING btree ("parent_id");
  CREATE INDEX "_directions_v_version_version_legacy_key_idx" ON "_directions_v" USING btree ("version_legacy_key");
  CREATE INDEX "_directions_v_version_version_slug_idx" ON "_directions_v" USING btree ("version_slug");
  CREATE INDEX "_directions_v_version_version_sort_order_idx" ON "_directions_v" USING btree ("version_sort_order");
  CREATE INDEX "_directions_v_version_version_canonical_key_idx" ON "_directions_v" USING btree ("version_canonical_key");
  CREATE INDEX "_directions_v_version_version_hero_media_idx" ON "_directions_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_directions_v_version_version_updated_at_idx" ON "_directions_v" USING btree ("version_updated_at");
  CREATE INDEX "_directions_v_version_version_created_at_idx" ON "_directions_v" USING btree ("version_created_at");
  CREATE INDEX "_directions_v_version_version__status_idx" ON "_directions_v" USING btree ("version__status");
  CREATE INDEX "_directions_v_created_at_idx" ON "_directions_v" USING btree ("created_at");
  CREATE INDEX "_directions_v_updated_at_idx" ON "_directions_v" USING btree ("updated_at");
  CREATE INDEX "_directions_v_snapshot_idx" ON "_directions_v" USING btree ("snapshot");
  CREATE INDEX "_directions_v_published_locale_idx" ON "_directions_v" USING btree ("published_locale");
  CREATE INDEX "_directions_v_latest_idx" ON "_directions_v" USING btree ("latest");
  CREATE INDEX "_directions_v_autosave_idx" ON "_directions_v" USING btree ("autosave");
  CREATE INDEX "_directions_v_version_meta_version_meta_image_idx" ON "_directions_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_directions_v_locales_locale_parent_id_unique" ON "_directions_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_directions_v_rels_order_idx" ON "_directions_v_rels" USING btree ("order");
  CREATE INDEX "_directions_v_rels_parent_idx" ON "_directions_v_rels" USING btree ("parent_id");
  CREATE INDEX "_directions_v_rels_path_idx" ON "_directions_v_rels" USING btree ("path");
  CREATE INDEX "_directions_v_rels_services_id_idx" ON "_directions_v_rels" USING btree ("services_id");
  CREATE INDEX "_directions_v_rels_courses_id_idx" ON "_directions_v_rels" USING btree ("courses_id");
  CREATE INDEX "_directions_v_rels_fashion_collections_id_idx" ON "_directions_v_rels" USING btree ("fashion_collections_id");
  CREATE INDEX "services_formats_order_idx" ON "services_formats" USING btree ("order");
  CREATE INDEX "services_formats_parent_idx" ON "services_formats" USING btree ("parent_id");
  CREATE INDEX "services_process_steps_order_idx" ON "services_process_steps" USING btree ("_order");
  CREATE INDEX "services_process_steps_parent_id_idx" ON "services_process_steps" USING btree ("_parent_id");
  CREATE INDEX "services_process_steps_locale_idx" ON "services_process_steps" USING btree ("_locale");
  CREATE INDEX "services_benefits_order_idx" ON "services_benefits" USING btree ("_order");
  CREATE INDEX "services_benefits_parent_id_idx" ON "services_benefits" USING btree ("_parent_id");
  CREATE INDEX "services_benefits_locale_idx" ON "services_benefits" USING btree ("_locale");
  CREATE INDEX "services_outcomes_order_idx" ON "services_outcomes" USING btree ("_order");
  CREATE INDEX "services_outcomes_parent_id_idx" ON "services_outcomes" USING btree ("_parent_id");
  CREATE INDEX "services_outcomes_locale_idx" ON "services_outcomes" USING btree ("_locale");
  CREATE INDEX "services_faq_order_idx" ON "services_faq" USING btree ("_order");
  CREATE INDEX "services_faq_parent_id_idx" ON "services_faq" USING btree ("_parent_id");
  CREATE INDEX "services_faq_locale_idx" ON "services_faq" USING btree ("_locale");
  CREATE UNIQUE INDEX "services_legacy_key_idx" ON "services" USING btree ("legacy_key");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_sort_order_idx" ON "services" USING btree ("sort_order");
  CREATE INDEX "services_primary_direction_idx" ON "services" USING btree ("primary_direction_id");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "services__status_idx" ON "services" USING btree ("_status");
  CREATE INDEX "services_meta_meta_image_idx" ON "services_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "services_locales_locale_parent_id_unique" ON "services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_rels_order_idx" ON "services_rels" USING btree ("order");
  CREATE INDEX "services_rels_parent_idx" ON "services_rels" USING btree ("parent_id");
  CREATE INDEX "services_rels_path_idx" ON "services_rels" USING btree ("path");
  CREATE INDEX "services_rels_directions_id_idx" ON "services_rels" USING btree ("directions_id");
  CREATE INDEX "services_rels_media_id_idx" ON "services_rels" USING btree ("media_id");
  CREATE INDEX "services_rels_offers_id_idx" ON "services_rels" USING btree ("offers_id");
  CREATE INDEX "services_rels_portfolio_cases_id_idx" ON "services_rels" USING btree ("portfolio_cases_id");
  CREATE INDEX "services_rels_services_id_idx" ON "services_rels" USING btree ("services_id");
  CREATE INDEX "services_rels_courses_id_idx" ON "services_rels" USING btree ("courses_id");
  CREATE INDEX "services_rels_fashion_collections_id_idx" ON "services_rels" USING btree ("fashion_collections_id");
  CREATE INDEX "_services_v_version_formats_order_idx" ON "_services_v_version_formats" USING btree ("order");
  CREATE INDEX "_services_v_version_formats_parent_idx" ON "_services_v_version_formats" USING btree ("parent_id");
  CREATE INDEX "_services_v_version_process_steps_order_idx" ON "_services_v_version_process_steps" USING btree ("_order");
  CREATE INDEX "_services_v_version_process_steps_parent_id_idx" ON "_services_v_version_process_steps" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_process_steps_locale_idx" ON "_services_v_version_process_steps" USING btree ("_locale");
  CREATE INDEX "_services_v_version_benefits_order_idx" ON "_services_v_version_benefits" USING btree ("_order");
  CREATE INDEX "_services_v_version_benefits_parent_id_idx" ON "_services_v_version_benefits" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_benefits_locale_idx" ON "_services_v_version_benefits" USING btree ("_locale");
  CREATE INDEX "_services_v_version_outcomes_order_idx" ON "_services_v_version_outcomes" USING btree ("_order");
  CREATE INDEX "_services_v_version_outcomes_parent_id_idx" ON "_services_v_version_outcomes" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_outcomes_locale_idx" ON "_services_v_version_outcomes" USING btree ("_locale");
  CREATE INDEX "_services_v_version_faq_order_idx" ON "_services_v_version_faq" USING btree ("_order");
  CREATE INDEX "_services_v_version_faq_parent_id_idx" ON "_services_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_faq_locale_idx" ON "_services_v_version_faq" USING btree ("_locale");
  CREATE INDEX "_services_v_parent_idx" ON "_services_v" USING btree ("parent_id");
  CREATE INDEX "_services_v_version_version_legacy_key_idx" ON "_services_v" USING btree ("version_legacy_key");
  CREATE INDEX "_services_v_version_version_slug_idx" ON "_services_v" USING btree ("version_slug");
  CREATE INDEX "_services_v_version_version_sort_order_idx" ON "_services_v" USING btree ("version_sort_order");
  CREATE INDEX "_services_v_version_version_primary_direction_idx" ON "_services_v" USING btree ("version_primary_direction_id");
  CREATE INDEX "_services_v_version_version_updated_at_idx" ON "_services_v" USING btree ("version_updated_at");
  CREATE INDEX "_services_v_version_version_created_at_idx" ON "_services_v" USING btree ("version_created_at");
  CREATE INDEX "_services_v_version_version__status_idx" ON "_services_v" USING btree ("version__status");
  CREATE INDEX "_services_v_created_at_idx" ON "_services_v" USING btree ("created_at");
  CREATE INDEX "_services_v_updated_at_idx" ON "_services_v" USING btree ("updated_at");
  CREATE INDEX "_services_v_snapshot_idx" ON "_services_v" USING btree ("snapshot");
  CREATE INDEX "_services_v_published_locale_idx" ON "_services_v" USING btree ("published_locale");
  CREATE INDEX "_services_v_latest_idx" ON "_services_v" USING btree ("latest");
  CREATE INDEX "_services_v_autosave_idx" ON "_services_v" USING btree ("autosave");
  CREATE INDEX "_services_v_version_meta_version_meta_image_idx" ON "_services_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_services_v_locales_locale_parent_id_unique" ON "_services_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_rels_order_idx" ON "_services_v_rels" USING btree ("order");
  CREATE INDEX "_services_v_rels_parent_idx" ON "_services_v_rels" USING btree ("parent_id");
  CREATE INDEX "_services_v_rels_path_idx" ON "_services_v_rels" USING btree ("path");
  CREATE INDEX "_services_v_rels_directions_id_idx" ON "_services_v_rels" USING btree ("directions_id");
  CREATE INDEX "_services_v_rels_media_id_idx" ON "_services_v_rels" USING btree ("media_id");
  CREATE INDEX "_services_v_rels_offers_id_idx" ON "_services_v_rels" USING btree ("offers_id");
  CREATE INDEX "_services_v_rels_portfolio_cases_id_idx" ON "_services_v_rels" USING btree ("portfolio_cases_id");
  CREATE INDEX "_services_v_rels_services_id_idx" ON "_services_v_rels" USING btree ("services_id");
  CREATE INDEX "_services_v_rels_courses_id_idx" ON "_services_v_rels" USING btree ("courses_id");
  CREATE INDEX "_services_v_rels_fashion_collections_id_idx" ON "_services_v_rels" USING btree ("fashion_collections_id");
  CREATE INDEX "offers_prices_order_idx" ON "offers_prices" USING btree ("_order");
  CREATE INDEX "offers_prices_parent_id_idx" ON "offers_prices" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "offers_legacy_key_idx" ON "offers" USING btree ("legacy_key");
  CREATE INDEX "offers_service_idx" ON "offers" USING btree ("service_id");
  CREATE UNIQUE INDEX "offers_sku_idx" ON "offers" USING btree ("sku");
  CREATE INDEX "offers_sort_order_idx" ON "offers" USING btree ("sort_order");
  CREATE INDEX "offers_updated_at_idx" ON "offers" USING btree ("updated_at");
  CREATE INDEX "offers_created_at_idx" ON "offers" USING btree ("created_at");
  CREATE INDEX "offers__status_idx" ON "offers" USING btree ("_status");
  CREATE UNIQUE INDEX "offers_locales_locale_parent_id_unique" ON "offers_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_offers_v_version_prices_order_idx" ON "_offers_v_version_prices" USING btree ("_order");
  CREATE INDEX "_offers_v_version_prices_parent_id_idx" ON "_offers_v_version_prices" USING btree ("_parent_id");
  CREATE INDEX "_offers_v_parent_idx" ON "_offers_v" USING btree ("parent_id");
  CREATE INDEX "_offers_v_version_version_legacy_key_idx" ON "_offers_v" USING btree ("version_legacy_key");
  CREATE INDEX "_offers_v_version_version_service_idx" ON "_offers_v" USING btree ("version_service_id");
  CREATE INDEX "_offers_v_version_version_sku_idx" ON "_offers_v" USING btree ("version_sku");
  CREATE INDEX "_offers_v_version_version_sort_order_idx" ON "_offers_v" USING btree ("version_sort_order");
  CREATE INDEX "_offers_v_version_version_updated_at_idx" ON "_offers_v" USING btree ("version_updated_at");
  CREATE INDEX "_offers_v_version_version_created_at_idx" ON "_offers_v" USING btree ("version_created_at");
  CREATE INDEX "_offers_v_version_version__status_idx" ON "_offers_v" USING btree ("version__status");
  CREATE INDEX "_offers_v_created_at_idx" ON "_offers_v" USING btree ("created_at");
  CREATE INDEX "_offers_v_updated_at_idx" ON "_offers_v" USING btree ("updated_at");
  CREATE INDEX "_offers_v_snapshot_idx" ON "_offers_v" USING btree ("snapshot");
  CREATE INDEX "_offers_v_published_locale_idx" ON "_offers_v" USING btree ("published_locale");
  CREATE INDEX "_offers_v_latest_idx" ON "_offers_v" USING btree ("latest");
  CREATE INDEX "_offers_v_autosave_idx" ON "_offers_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_offers_v_locales_locale_parent_id_unique" ON "_offers_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "courses_formats_order_idx" ON "courses_formats" USING btree ("order");
  CREATE INDEX "courses_formats_parent_idx" ON "courses_formats" USING btree ("parent_id");
  CREATE INDEX "courses_program_order_idx" ON "courses_program" USING btree ("_order");
  CREATE INDEX "courses_program_parent_id_idx" ON "courses_program" USING btree ("_parent_id");
  CREATE INDEX "courses_program_locale_idx" ON "courses_program" USING btree ("_locale");
  CREATE INDEX "courses_faq_order_idx" ON "courses_faq" USING btree ("_order");
  CREATE INDEX "courses_faq_parent_id_idx" ON "courses_faq" USING btree ("_parent_id");
  CREATE INDEX "courses_faq_locale_idx" ON "courses_faq" USING btree ("_locale");
  CREATE UNIQUE INDEX "courses_legacy_key_idx" ON "courses" USING btree ("legacy_key");
  CREATE UNIQUE INDEX "courses_slug_idx" ON "courses" USING btree ("slug");
  CREATE INDEX "courses_sort_order_idx" ON "courses" USING btree ("sort_order");
  CREATE INDEX "courses_direction_idx" ON "courses" USING btree ("direction_id");
  CREATE INDEX "courses_updated_at_idx" ON "courses" USING btree ("updated_at");
  CREATE INDEX "courses_created_at_idx" ON "courses" USING btree ("created_at");
  CREATE INDEX "courses__status_idx" ON "courses" USING btree ("_status");
  CREATE INDEX "courses_meta_meta_image_idx" ON "courses_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "courses_locales_locale_parent_id_unique" ON "courses_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "courses_rels_order_idx" ON "courses_rels" USING btree ("order");
  CREATE INDEX "courses_rels_parent_idx" ON "courses_rels" USING btree ("parent_id");
  CREATE INDEX "courses_rels_path_idx" ON "courses_rels" USING btree ("path");
  CREATE INDEX "courses_rels_offers_id_idx" ON "courses_rels" USING btree ("offers_id");
  CREATE INDEX "courses_rels_media_id_idx" ON "courses_rels" USING btree ("media_id");
  CREATE INDEX "courses_rels_services_id_idx" ON "courses_rels" USING btree ("services_id");
  CREATE INDEX "courses_rels_fashion_collections_id_idx" ON "courses_rels" USING btree ("fashion_collections_id");
  CREATE INDEX "_courses_v_version_formats_order_idx" ON "_courses_v_version_formats" USING btree ("order");
  CREATE INDEX "_courses_v_version_formats_parent_idx" ON "_courses_v_version_formats" USING btree ("parent_id");
  CREATE INDEX "_courses_v_version_program_order_idx" ON "_courses_v_version_program" USING btree ("_order");
  CREATE INDEX "_courses_v_version_program_parent_id_idx" ON "_courses_v_version_program" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_version_program_locale_idx" ON "_courses_v_version_program" USING btree ("_locale");
  CREATE INDEX "_courses_v_version_faq_order_idx" ON "_courses_v_version_faq" USING btree ("_order");
  CREATE INDEX "_courses_v_version_faq_parent_id_idx" ON "_courses_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_version_faq_locale_idx" ON "_courses_v_version_faq" USING btree ("_locale");
  CREATE INDEX "_courses_v_parent_idx" ON "_courses_v" USING btree ("parent_id");
  CREATE INDEX "_courses_v_version_version_legacy_key_idx" ON "_courses_v" USING btree ("version_legacy_key");
  CREATE INDEX "_courses_v_version_version_slug_idx" ON "_courses_v" USING btree ("version_slug");
  CREATE INDEX "_courses_v_version_version_sort_order_idx" ON "_courses_v" USING btree ("version_sort_order");
  CREATE INDEX "_courses_v_version_version_direction_idx" ON "_courses_v" USING btree ("version_direction_id");
  CREATE INDEX "_courses_v_version_version_updated_at_idx" ON "_courses_v" USING btree ("version_updated_at");
  CREATE INDEX "_courses_v_version_version_created_at_idx" ON "_courses_v" USING btree ("version_created_at");
  CREATE INDEX "_courses_v_version_version__status_idx" ON "_courses_v" USING btree ("version__status");
  CREATE INDEX "_courses_v_created_at_idx" ON "_courses_v" USING btree ("created_at");
  CREATE INDEX "_courses_v_updated_at_idx" ON "_courses_v" USING btree ("updated_at");
  CREATE INDEX "_courses_v_snapshot_idx" ON "_courses_v" USING btree ("snapshot");
  CREATE INDEX "_courses_v_published_locale_idx" ON "_courses_v" USING btree ("published_locale");
  CREATE INDEX "_courses_v_latest_idx" ON "_courses_v" USING btree ("latest");
  CREATE INDEX "_courses_v_autosave_idx" ON "_courses_v" USING btree ("autosave");
  CREATE INDEX "_courses_v_version_meta_version_meta_image_idx" ON "_courses_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_courses_v_locales_locale_parent_id_unique" ON "_courses_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_courses_v_rels_order_idx" ON "_courses_v_rels" USING btree ("order");
  CREATE INDEX "_courses_v_rels_parent_idx" ON "_courses_v_rels" USING btree ("parent_id");
  CREATE INDEX "_courses_v_rels_path_idx" ON "_courses_v_rels" USING btree ("path");
  CREATE INDEX "_courses_v_rels_offers_id_idx" ON "_courses_v_rels" USING btree ("offers_id");
  CREATE INDEX "_courses_v_rels_media_id_idx" ON "_courses_v_rels" USING btree ("media_id");
  CREATE INDEX "_courses_v_rels_services_id_idx" ON "_courses_v_rels" USING btree ("services_id");
  CREATE INDEX "_courses_v_rels_fashion_collections_id_idx" ON "_courses_v_rels" USING btree ("fashion_collections_id");
  CREATE INDEX "fashion_collections_materials_order_idx" ON "fashion_collections_materials" USING btree ("_order");
  CREATE INDEX "fashion_collections_materials_parent_id_idx" ON "fashion_collections_materials" USING btree ("_parent_id");
  CREATE INDEX "fashion_collections_materials_locale_idx" ON "fashion_collections_materials" USING btree ("_locale");
  CREATE INDEX "fashion_collections_pieces_order_idx" ON "fashion_collections_pieces" USING btree ("_order");
  CREATE INDEX "fashion_collections_pieces_parent_id_idx" ON "fashion_collections_pieces" USING btree ("_parent_id");
  CREATE INDEX "fashion_collections_pieces_locale_idx" ON "fashion_collections_pieces" USING btree ("_locale");
  CREATE UNIQUE INDEX "fashion_collections_legacy_key_idx" ON "fashion_collections" USING btree ("legacy_key");
  CREATE UNIQUE INDEX "fashion_collections_slug_idx" ON "fashion_collections" USING btree ("slug");
  CREATE INDEX "fashion_collections_sort_order_idx" ON "fashion_collections" USING btree ("sort_order");
  CREATE INDEX "fashion_collections_related_course_idx" ON "fashion_collections" USING btree ("related_course_id");
  CREATE INDEX "fashion_collections_updated_at_idx" ON "fashion_collections" USING btree ("updated_at");
  CREATE INDEX "fashion_collections_created_at_idx" ON "fashion_collections" USING btree ("created_at");
  CREATE INDEX "fashion_collections__status_idx" ON "fashion_collections" USING btree ("_status");
  CREATE INDEX "fashion_collections_meta_meta_image_idx" ON "fashion_collections_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "fashion_collections_locales_locale_parent_id_unique" ON "fashion_collections_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "fashion_collections_rels_order_idx" ON "fashion_collections_rels" USING btree ("order");
  CREATE INDEX "fashion_collections_rels_parent_idx" ON "fashion_collections_rels" USING btree ("parent_id");
  CREATE INDEX "fashion_collections_rels_path_idx" ON "fashion_collections_rels" USING btree ("path");
  CREATE INDEX "fashion_collections_rels_media_id_idx" ON "fashion_collections_rels" USING btree ("media_id");
  CREATE INDEX "fashion_collections_rels_offers_id_idx" ON "fashion_collections_rels" USING btree ("offers_id");
  CREATE INDEX "fashion_collections_rels_services_id_idx" ON "fashion_collections_rels" USING btree ("services_id");
  CREATE INDEX "_fashion_collections_v_version_materials_order_idx" ON "_fashion_collections_v_version_materials" USING btree ("_order");
  CREATE INDEX "_fashion_collections_v_version_materials_parent_id_idx" ON "_fashion_collections_v_version_materials" USING btree ("_parent_id");
  CREATE INDEX "_fashion_collections_v_version_materials_locale_idx" ON "_fashion_collections_v_version_materials" USING btree ("_locale");
  CREATE INDEX "_fashion_collections_v_version_pieces_order_idx" ON "_fashion_collections_v_version_pieces" USING btree ("_order");
  CREATE INDEX "_fashion_collections_v_version_pieces_parent_id_idx" ON "_fashion_collections_v_version_pieces" USING btree ("_parent_id");
  CREATE INDEX "_fashion_collections_v_version_pieces_locale_idx" ON "_fashion_collections_v_version_pieces" USING btree ("_locale");
  CREATE INDEX "_fashion_collections_v_parent_idx" ON "_fashion_collections_v" USING btree ("parent_id");
  CREATE INDEX "_fashion_collections_v_version_version_legacy_key_idx" ON "_fashion_collections_v" USING btree ("version_legacy_key");
  CREATE INDEX "_fashion_collections_v_version_version_slug_idx" ON "_fashion_collections_v" USING btree ("version_slug");
  CREATE INDEX "_fashion_collections_v_version_version_sort_order_idx" ON "_fashion_collections_v" USING btree ("version_sort_order");
  CREATE INDEX "_fashion_collections_v_version_version_related_course_idx" ON "_fashion_collections_v" USING btree ("version_related_course_id");
  CREATE INDEX "_fashion_collections_v_version_version_updated_at_idx" ON "_fashion_collections_v" USING btree ("version_updated_at");
  CREATE INDEX "_fashion_collections_v_version_version_created_at_idx" ON "_fashion_collections_v" USING btree ("version_created_at");
  CREATE INDEX "_fashion_collections_v_version_version__status_idx" ON "_fashion_collections_v" USING btree ("version__status");
  CREATE INDEX "_fashion_collections_v_created_at_idx" ON "_fashion_collections_v" USING btree ("created_at");
  CREATE INDEX "_fashion_collections_v_updated_at_idx" ON "_fashion_collections_v" USING btree ("updated_at");
  CREATE INDEX "_fashion_collections_v_snapshot_idx" ON "_fashion_collections_v" USING btree ("snapshot");
  CREATE INDEX "_fashion_collections_v_published_locale_idx" ON "_fashion_collections_v" USING btree ("published_locale");
  CREATE INDEX "_fashion_collections_v_latest_idx" ON "_fashion_collections_v" USING btree ("latest");
  CREATE INDEX "_fashion_collections_v_autosave_idx" ON "_fashion_collections_v" USING btree ("autosave");
  CREATE INDEX "_fashion_collections_v_version_meta_version_meta_image_idx" ON "_fashion_collections_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_fashion_collections_v_locales_locale_parent_id_unique" ON "_fashion_collections_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_fashion_collections_v_rels_order_idx" ON "_fashion_collections_v_rels" USING btree ("order");
  CREATE INDEX "_fashion_collections_v_rels_parent_idx" ON "_fashion_collections_v_rels" USING btree ("parent_id");
  CREATE INDEX "_fashion_collections_v_rels_path_idx" ON "_fashion_collections_v_rels" USING btree ("path");
  CREATE INDEX "_fashion_collections_v_rels_media_id_idx" ON "_fashion_collections_v_rels" USING btree ("media_id");
  CREATE INDEX "_fashion_collections_v_rels_offers_id_idx" ON "_fashion_collections_v_rels" USING btree ("offers_id");
  CREATE INDEX "_fashion_collections_v_rels_services_id_idx" ON "_fashion_collections_v_rels" USING btree ("services_id");
  CREATE UNIQUE INDEX "portfolio_cases_legacy_key_idx" ON "portfolio_cases" USING btree ("legacy_key");
  CREATE UNIQUE INDEX "portfolio_cases_slug_idx" ON "portfolio_cases" USING btree ("slug");
  CREATE INDEX "portfolio_cases_sort_order_idx" ON "portfolio_cases" USING btree ("sort_order");
  CREATE INDEX "portfolio_cases_updated_at_idx" ON "portfolio_cases" USING btree ("updated_at");
  CREATE INDEX "portfolio_cases_created_at_idx" ON "portfolio_cases" USING btree ("created_at");
  CREATE INDEX "portfolio_cases__status_idx" ON "portfolio_cases" USING btree ("_status");
  CREATE INDEX "portfolio_cases_meta_meta_image_idx" ON "portfolio_cases_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "portfolio_cases_locales_locale_parent_id_unique" ON "portfolio_cases_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "portfolio_cases_rels_order_idx" ON "portfolio_cases_rels" USING btree ("order");
  CREATE INDEX "portfolio_cases_rels_parent_idx" ON "portfolio_cases_rels" USING btree ("parent_id");
  CREATE INDEX "portfolio_cases_rels_path_idx" ON "portfolio_cases_rels" USING btree ("path");
  CREATE INDEX "portfolio_cases_rels_services_id_idx" ON "portfolio_cases_rels" USING btree ("services_id");
  CREATE INDEX "portfolio_cases_rels_media_id_idx" ON "portfolio_cases_rels" USING btree ("media_id");
  CREATE INDEX "_portfolio_cases_v_parent_idx" ON "_portfolio_cases_v" USING btree ("parent_id");
  CREATE INDEX "_portfolio_cases_v_version_version_legacy_key_idx" ON "_portfolio_cases_v" USING btree ("version_legacy_key");
  CREATE INDEX "_portfolio_cases_v_version_version_slug_idx" ON "_portfolio_cases_v" USING btree ("version_slug");
  CREATE INDEX "_portfolio_cases_v_version_version_sort_order_idx" ON "_portfolio_cases_v" USING btree ("version_sort_order");
  CREATE INDEX "_portfolio_cases_v_version_version_updated_at_idx" ON "_portfolio_cases_v" USING btree ("version_updated_at");
  CREATE INDEX "_portfolio_cases_v_version_version_created_at_idx" ON "_portfolio_cases_v" USING btree ("version_created_at");
  CREATE INDEX "_portfolio_cases_v_version_version__status_idx" ON "_portfolio_cases_v" USING btree ("version__status");
  CREATE INDEX "_portfolio_cases_v_created_at_idx" ON "_portfolio_cases_v" USING btree ("created_at");
  CREATE INDEX "_portfolio_cases_v_updated_at_idx" ON "_portfolio_cases_v" USING btree ("updated_at");
  CREATE INDEX "_portfolio_cases_v_snapshot_idx" ON "_portfolio_cases_v" USING btree ("snapshot");
  CREATE INDEX "_portfolio_cases_v_published_locale_idx" ON "_portfolio_cases_v" USING btree ("published_locale");
  CREATE INDEX "_portfolio_cases_v_latest_idx" ON "_portfolio_cases_v" USING btree ("latest");
  CREATE INDEX "_portfolio_cases_v_autosave_idx" ON "_portfolio_cases_v" USING btree ("autosave");
  CREATE INDEX "_portfolio_cases_v_version_meta_version_meta_image_idx" ON "_portfolio_cases_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_portfolio_cases_v_locales_locale_parent_id_unique" ON "_portfolio_cases_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_portfolio_cases_v_rels_order_idx" ON "_portfolio_cases_v_rels" USING btree ("order");
  CREATE INDEX "_portfolio_cases_v_rels_parent_idx" ON "_portfolio_cases_v_rels" USING btree ("parent_id");
  CREATE INDEX "_portfolio_cases_v_rels_path_idx" ON "_portfolio_cases_v_rels" USING btree ("path");
  CREATE INDEX "_portfolio_cases_v_rels_services_id_idx" ON "_portfolio_cases_v_rels" USING btree ("services_id");
  CREATE INDEX "_portfolio_cases_v_rels_media_id_idx" ON "_portfolio_cases_v_rels" USING btree ("media_id");
  CREATE UNIQUE INDEX "testimonials_legacy_key_idx" ON "testimonials" USING btree ("legacy_key");
  CREATE INDEX "testimonials_related_service_idx" ON "testimonials" USING btree ("related_service_id");
  CREATE INDEX "testimonials_related_case_idx" ON "testimonials" USING btree ("related_case_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE INDEX "testimonials__status_idx" ON "testimonials" USING btree ("_status");
  CREATE UNIQUE INDEX "testimonials_locales_locale_parent_id_unique" ON "testimonials_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_testimonials_v_parent_idx" ON "_testimonials_v" USING btree ("parent_id");
  CREATE INDEX "_testimonials_v_version_version_legacy_key_idx" ON "_testimonials_v" USING btree ("version_legacy_key");
  CREATE INDEX "_testimonials_v_version_version_related_service_idx" ON "_testimonials_v" USING btree ("version_related_service_id");
  CREATE INDEX "_testimonials_v_version_version_related_case_idx" ON "_testimonials_v" USING btree ("version_related_case_id");
  CREATE INDEX "_testimonials_v_version_version_updated_at_idx" ON "_testimonials_v" USING btree ("version_updated_at");
  CREATE INDEX "_testimonials_v_version_version_created_at_idx" ON "_testimonials_v" USING btree ("version_created_at");
  CREATE INDEX "_testimonials_v_version_version__status_idx" ON "_testimonials_v" USING btree ("version__status");
  CREATE INDEX "_testimonials_v_created_at_idx" ON "_testimonials_v" USING btree ("created_at");
  CREATE INDEX "_testimonials_v_updated_at_idx" ON "_testimonials_v" USING btree ("updated_at");
  CREATE INDEX "_testimonials_v_snapshot_idx" ON "_testimonials_v" USING btree ("snapshot");
  CREATE INDEX "_testimonials_v_published_locale_idx" ON "_testimonials_v" USING btree ("published_locale");
  CREATE INDEX "_testimonials_v_latest_idx" ON "_testimonials_v" USING btree ("latest");
  CREATE INDEX "_testimonials_v_autosave_idx" ON "_testimonials_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_testimonials_v_locales_locale_parent_id_unique" ON "_testimonials_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_sections_order_idx" ON "pages_sections" USING btree ("_order");
  CREATE INDEX "pages_sections_parent_id_idx" ON "pages_sections" USING btree ("_parent_id");
  CREATE INDEX "pages_sections_locale_idx" ON "pages_sections" USING btree ("_locale");
  CREATE INDEX "pages_sections_media_idx" ON "pages_sections" USING btree ("media_id");
  CREATE UNIQUE INDEX "pages_legacy_key_idx" ON "pages" USING btree ("legacy_key");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_sort_order_idx" ON "pages" USING btree ("sort_order");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_version_sections_order_idx" ON "_pages_v_version_sections" USING btree ("_order");
  CREATE INDEX "_pages_v_version_sections_parent_id_idx" ON "_pages_v_version_sections" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_sections_locale_idx" ON "_pages_v_version_sections" USING btree ("_locale");
  CREATE INDEX "_pages_v_version_sections_media_idx" ON "_pages_v_version_sections" USING btree ("media_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_legacy_key_idx" ON "_pages_v" USING btree ("version_legacy_key");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_sort_order_idx" ON "_pages_v" USING btree ("version_sort_order");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "leads_email_idx" ON "leads" USING btree ("email");
  CREATE INDEX "leads_phone_idx" ON "leads" USING btree ("phone");
  CREATE INDEX "leads_merged_into_idx" ON "leads" USING btree ("merged_into_id");
  CREATE INDEX "leads_assignee_idx" ON "leads" USING btree ("assignee_id");
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  CREATE INDEX "booking_requests_preferred_dates_order_idx" ON "booking_requests_preferred_dates" USING btree ("_order");
  CREATE INDEX "booking_requests_preferred_dates_parent_id_idx" ON "booking_requests_preferred_dates" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "booking_requests_idempotency_key_idx" ON "booking_requests" USING btree ("idempotency_key");
  CREATE INDEX "booking_requests_lead_idx" ON "booking_requests" USING btree ("lead_id");
  CREATE INDEX "booking_requests_service_idx" ON "booking_requests" USING btree ("service_id");
  CREATE INDEX "booking_requests_offer_idx" ON "booking_requests" USING btree ("offer_id");
  CREATE INDEX "booking_requests_course_idx" ON "booking_requests" USING btree ("course_id");
  CREATE INDEX "booking_requests_fashion_collection_idx" ON "booking_requests" USING btree ("fashion_collection_id");
  CREATE INDEX "booking_requests_status_idx" ON "booking_requests" USING btree ("status");
  CREATE INDEX "booking_requests_payment_order_idx" ON "booking_requests" USING btree ("payment_order_id");
  CREATE INDEX "booking_requests_updated_at_idx" ON "booking_requests" USING btree ("updated_at");
  CREATE INDEX "booking_requests_created_at_idx" ON "booking_requests" USING btree ("created_at");
  CREATE UNIQUE INDEX "payment_orders_order_u_u_i_d_idx" ON "payment_orders" USING btree ("order_u_u_i_d");
  CREATE INDEX "payment_orders_booking_request_idx" ON "payment_orders" USING btree ("booking_request_id");
  CREATE INDEX "payment_orders_provider_order_i_d_idx" ON "payment_orders" USING btree ("provider_order_i_d");
  CREATE INDEX "payment_orders_status_idx" ON "payment_orders" USING btree ("status");
  CREATE UNIQUE INDEX "payment_orders_idempotency_key_idx" ON "payment_orders" USING btree ("idempotency_key");
  CREATE INDEX "payment_orders_updated_at_idx" ON "payment_orders" USING btree ("updated_at");
  CREATE INDEX "payment_orders_created_at_idx" ON "payment_orders" USING btree ("created_at");
  CREATE UNIQUE INDEX "webhook_events_provider_event_i_d_idx" ON "webhook_events" USING btree ("provider_event_i_d");
  CREATE INDEX "webhook_events_event_type_idx" ON "webhook_events" USING btree ("event_type");
  CREATE INDEX "webhook_events_payment_order_idx" ON "webhook_events" USING btree ("payment_order_id");
  CREATE INDEX "webhook_events_updated_at_idx" ON "webhook_events" USING btree ("updated_at");
  CREATE INDEX "webhook_events_created_at_idx" ON "webhook_events" USING btree ("created_at");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "redirects_rels_order_idx" ON "redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_directions_id_idx" ON "redirects_rels" USING btree ("directions_id");
  CREATE INDEX "redirects_rels_services_id_idx" ON "redirects_rels" USING btree ("services_id");
  CREATE INDEX "redirects_rels_courses_id_idx" ON "redirects_rels" USING btree ("courses_id");
  CREATE INDEX "redirects_rels_fashion_collections_id_idx" ON "redirects_rels" USING btree ("fashion_collections_id");
  CREATE INDEX "redirects_rels_portfolio_cases_id_idx" ON "redirects_rels" USING btree ("portfolio_cases_id");
  CREATE INDEX "redirects_rels_pages_id_idx" ON "redirects_rels" USING btree ("pages_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_directions_id_idx" ON "payload_locked_documents_rels" USING btree ("directions_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_offers_id_idx" ON "payload_locked_documents_rels" USING btree ("offers_id");
  CREATE INDEX "payload_locked_documents_rels_courses_id_idx" ON "payload_locked_documents_rels" USING btree ("courses_id");
  CREATE INDEX "payload_locked_documents_rels_fashion_collections_id_idx" ON "payload_locked_documents_rels" USING btree ("fashion_collections_id");
  CREATE INDEX "payload_locked_documents_rels_portfolio_cases_id_idx" ON "payload_locked_documents_rels" USING btree ("portfolio_cases_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");
  CREATE INDEX "payload_locked_documents_rels_booking_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("booking_requests_id");
  CREATE INDEX "payload_locked_documents_rels_payment_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("payment_orders_id");
  CREATE INDEX "payload_locked_documents_rels_webhook_events_id_idx" ON "payload_locked_documents_rels" USING btree ("webhook_events_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "home_method_order_idx" ON "home_method" USING btree ("_order");
  CREATE INDEX "home_method_parent_id_idx" ON "home_method" USING btree ("_parent_id");
  CREATE INDEX "home_method_locale_idx" ON "home_method" USING btree ("_locale");
  CREATE INDEX "home_hero_media_idx" ON "home" USING btree ("hero_media_id");
  CREATE INDEX "home__status_idx" ON "home" USING btree ("_status");
  CREATE INDEX "home_meta_meta_image_idx" ON "home_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "home_locales_locale_parent_id_unique" ON "home_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_rels_order_idx" ON "home_rels" USING btree ("order");
  CREATE INDEX "home_rels_parent_idx" ON "home_rels" USING btree ("parent_id");
  CREATE INDEX "home_rels_path_idx" ON "home_rels" USING btree ("path");
  CREATE INDEX "home_rels_directions_id_idx" ON "home_rels" USING btree ("directions_id");
  CREATE INDEX "home_rels_services_id_idx" ON "home_rels" USING btree ("services_id");
  CREATE INDEX "home_rels_offers_id_idx" ON "home_rels" USING btree ("offers_id");
  CREATE INDEX "home_rels_courses_id_idx" ON "home_rels" USING btree ("courses_id");
  CREATE INDEX "home_rels_fashion_collections_id_idx" ON "home_rels" USING btree ("fashion_collections_id");
  CREATE INDEX "home_rels_portfolio_cases_id_idx" ON "home_rels" USING btree ("portfolio_cases_id");
  CREATE INDEX "_home_v_version_method_order_idx" ON "_home_v_version_method" USING btree ("_order");
  CREATE INDEX "_home_v_version_method_parent_id_idx" ON "_home_v_version_method" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_method_locale_idx" ON "_home_v_version_method" USING btree ("_locale");
  CREATE INDEX "_home_v_version_version_hero_media_idx" ON "_home_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_home_v_version_version__status_idx" ON "_home_v" USING btree ("version__status");
  CREATE INDEX "_home_v_created_at_idx" ON "_home_v" USING btree ("created_at");
  CREATE INDEX "_home_v_updated_at_idx" ON "_home_v" USING btree ("updated_at");
  CREATE INDEX "_home_v_snapshot_idx" ON "_home_v" USING btree ("snapshot");
  CREATE INDEX "_home_v_published_locale_idx" ON "_home_v" USING btree ("published_locale");
  CREATE INDEX "_home_v_latest_idx" ON "_home_v" USING btree ("latest");
  CREATE INDEX "_home_v_autosave_idx" ON "_home_v" USING btree ("autosave");
  CREATE INDEX "_home_v_version_meta_version_meta_image_idx" ON "_home_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_home_v_locales_locale_parent_id_unique" ON "_home_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_home_v_rels_order_idx" ON "_home_v_rels" USING btree ("order");
  CREATE INDEX "_home_v_rels_parent_idx" ON "_home_v_rels" USING btree ("parent_id");
  CREATE INDEX "_home_v_rels_path_idx" ON "_home_v_rels" USING btree ("path");
  CREATE INDEX "_home_v_rels_directions_id_idx" ON "_home_v_rels" USING btree ("directions_id");
  CREATE INDEX "_home_v_rels_services_id_idx" ON "_home_v_rels" USING btree ("services_id");
  CREATE INDEX "_home_v_rels_offers_id_idx" ON "_home_v_rels" USING btree ("offers_id");
  CREATE INDEX "_home_v_rels_courses_id_idx" ON "_home_v_rels" USING btree ("courses_id");
  CREATE INDEX "_home_v_rels_fashion_collections_id_idx" ON "_home_v_rels" USING btree ("fashion_collections_id");
  CREATE INDEX "_home_v_rels_portfolio_cases_id_idx" ON "_home_v_rels" USING btree ("portfolio_cases_id");
  CREATE INDEX "header_navigation_order_idx" ON "header_navigation" USING btree ("_order");
  CREATE INDEX "header_navigation_parent_id_idx" ON "header_navigation" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "header_navigation_locales_locale_parent_id_unique" ON "header_navigation_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "header__status_idx" ON "header" USING btree ("_status");
  CREATE UNIQUE INDEX "header_locales_locale_parent_id_unique" ON "header_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_header_v_version_navigation_order_idx" ON "_header_v_version_navigation" USING btree ("_order");
  CREATE INDEX "_header_v_version_navigation_parent_id_idx" ON "_header_v_version_navigation" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_header_v_version_navigation_locales_locale_parent_id_unique" ON "_header_v_version_navigation_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_header_v_version_version__status_idx" ON "_header_v" USING btree ("version__status");
  CREATE INDEX "_header_v_created_at_idx" ON "_header_v" USING btree ("created_at");
  CREATE INDEX "_header_v_updated_at_idx" ON "_header_v" USING btree ("updated_at");
  CREATE INDEX "_header_v_snapshot_idx" ON "_header_v" USING btree ("snapshot");
  CREATE INDEX "_header_v_published_locale_idx" ON "_header_v" USING btree ("published_locale");
  CREATE INDEX "_header_v_latest_idx" ON "_header_v" USING btree ("latest");
  CREATE INDEX "_header_v_autosave_idx" ON "_header_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_header_v_locales_locale_parent_id_unique" ON "_header_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_social_links_order_idx" ON "footer_social_links" USING btree ("_order");
  CREATE INDEX "footer_social_links_parent_id_idx" ON "footer_social_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_social_links_locales_locale_parent_id_unique" ON "footer_social_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_legal_navigation_order_idx" ON "footer_legal_navigation" USING btree ("_order");
  CREATE INDEX "footer_legal_navigation_parent_id_idx" ON "footer_legal_navigation" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_legal_navigation_locales_locale_parent_id_unique" ON "footer_legal_navigation_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer__status_idx" ON "footer" USING btree ("_status");
  CREATE UNIQUE INDEX "footer_locales_locale_parent_id_unique" ON "footer_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_footer_v_version_social_links_order_idx" ON "_footer_v_version_social_links" USING btree ("_order");
  CREATE INDEX "_footer_v_version_social_links_parent_id_idx" ON "_footer_v_version_social_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_footer_v_version_social_links_locales_locale_parent_id_uniq" ON "_footer_v_version_social_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_footer_v_version_legal_navigation_order_idx" ON "_footer_v_version_legal_navigation" USING btree ("_order");
  CREATE INDEX "_footer_v_version_legal_navigation_parent_id_idx" ON "_footer_v_version_legal_navigation" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_footer_v_version_legal_navigation_locales_locale_parent_id_" ON "_footer_v_version_legal_navigation_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_footer_v_version_version__status_idx" ON "_footer_v" USING btree ("version__status");
  CREATE INDEX "_footer_v_created_at_idx" ON "_footer_v" USING btree ("created_at");
  CREATE INDEX "_footer_v_updated_at_idx" ON "_footer_v" USING btree ("updated_at");
  CREATE INDEX "_footer_v_snapshot_idx" ON "_footer_v" USING btree ("snapshot");
  CREATE INDEX "_footer_v_published_locale_idx" ON "_footer_v" USING btree ("published_locale");
  CREATE INDEX "_footer_v_latest_idx" ON "_footer_v" USING btree ("latest");
  CREATE INDEX "_footer_v_autosave_idx" ON "_footer_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_footer_v_locales_locale_parent_id_unique" ON "_footer_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_default_social_image_idx" ON "site_settings" USING btree ("default_social_image_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "booking_settings_enabled_modes_order_idx" ON "booking_settings_enabled_modes" USING btree ("order");
  CREATE INDEX "booking_settings_enabled_modes_parent_idx" ON "booking_settings_enabled_modes" USING btree ("parent_id");
  CREATE INDEX "booking_settings_provider_routing_order_idx" ON "booking_settings_provider_routing" USING btree ("_order");
  CREATE INDEX "booking_settings_provider_routing_parent_id_idx" ON "booking_settings_provider_routing" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "booking_settings_provider_routing_locales_locale_parent_id_u" ON "booking_settings_provider_routing_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "booking_settings_notification_recipients_order_idx" ON "booking_settings_notification_recipients" USING btree ("_order");
  CREATE INDEX "booking_settings_notification_recipients_parent_id_idx" ON "booking_settings_notification_recipients" USING btree ("_parent_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media_allowed_usage_contexts" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "directions_process_steps" CASCADE;
  DROP TABLE "directions_outcomes" CASCADE;
  DROP TABLE "directions" CASCADE;
  DROP TABLE "directions_locales" CASCADE;
  DROP TABLE "directions_rels" CASCADE;
  DROP TABLE "_directions_v_version_process_steps" CASCADE;
  DROP TABLE "_directions_v_version_outcomes" CASCADE;
  DROP TABLE "_directions_v" CASCADE;
  DROP TABLE "_directions_v_locales" CASCADE;
  DROP TABLE "_directions_v_rels" CASCADE;
  DROP TABLE "services_formats" CASCADE;
  DROP TABLE "services_process_steps" CASCADE;
  DROP TABLE "services_benefits" CASCADE;
  DROP TABLE "services_outcomes" CASCADE;
  DROP TABLE "services_faq" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "services_locales" CASCADE;
  DROP TABLE "services_rels" CASCADE;
  DROP TABLE "_services_v_version_formats" CASCADE;
  DROP TABLE "_services_v_version_process_steps" CASCADE;
  DROP TABLE "_services_v_version_benefits" CASCADE;
  DROP TABLE "_services_v_version_outcomes" CASCADE;
  DROP TABLE "_services_v_version_faq" CASCADE;
  DROP TABLE "_services_v" CASCADE;
  DROP TABLE "_services_v_locales" CASCADE;
  DROP TABLE "_services_v_rels" CASCADE;
  DROP TABLE "offers_prices" CASCADE;
  DROP TABLE "offers" CASCADE;
  DROP TABLE "offers_locales" CASCADE;
  DROP TABLE "_offers_v_version_prices" CASCADE;
  DROP TABLE "_offers_v" CASCADE;
  DROP TABLE "_offers_v_locales" CASCADE;
  DROP TABLE "courses_formats" CASCADE;
  DROP TABLE "courses_program" CASCADE;
  DROP TABLE "courses_faq" CASCADE;
  DROP TABLE "courses" CASCADE;
  DROP TABLE "courses_locales" CASCADE;
  DROP TABLE "courses_rels" CASCADE;
  DROP TABLE "_courses_v_version_formats" CASCADE;
  DROP TABLE "_courses_v_version_program" CASCADE;
  DROP TABLE "_courses_v_version_faq" CASCADE;
  DROP TABLE "_courses_v" CASCADE;
  DROP TABLE "_courses_v_locales" CASCADE;
  DROP TABLE "_courses_v_rels" CASCADE;
  DROP TABLE "fashion_collections_materials" CASCADE;
  DROP TABLE "fashion_collections_pieces" CASCADE;
  DROP TABLE "fashion_collections" CASCADE;
  DROP TABLE "fashion_collections_locales" CASCADE;
  DROP TABLE "fashion_collections_rels" CASCADE;
  DROP TABLE "_fashion_collections_v_version_materials" CASCADE;
  DROP TABLE "_fashion_collections_v_version_pieces" CASCADE;
  DROP TABLE "_fashion_collections_v" CASCADE;
  DROP TABLE "_fashion_collections_v_locales" CASCADE;
  DROP TABLE "_fashion_collections_v_rels" CASCADE;
  DROP TABLE "portfolio_cases" CASCADE;
  DROP TABLE "portfolio_cases_locales" CASCADE;
  DROP TABLE "portfolio_cases_rels" CASCADE;
  DROP TABLE "_portfolio_cases_v" CASCADE;
  DROP TABLE "_portfolio_cases_v_locales" CASCADE;
  DROP TABLE "_portfolio_cases_v_rels" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "testimonials_locales" CASCADE;
  DROP TABLE "_testimonials_v" CASCADE;
  DROP TABLE "_testimonials_v_locales" CASCADE;
  DROP TABLE "pages_sections" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "_pages_v_version_sections" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "leads" CASCADE;
  DROP TABLE "booking_requests_preferred_dates" CASCADE;
  DROP TABLE "booking_requests" CASCADE;
  DROP TABLE "payment_orders" CASCADE;
  DROP TABLE "webhook_events" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "redirects_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "home_method" CASCADE;
  DROP TABLE "home" CASCADE;
  DROP TABLE "home_locales" CASCADE;
  DROP TABLE "home_rels" CASCADE;
  DROP TABLE "_home_v_version_method" CASCADE;
  DROP TABLE "_home_v" CASCADE;
  DROP TABLE "_home_v_locales" CASCADE;
  DROP TABLE "_home_v_rels" CASCADE;
  DROP TABLE "header_navigation" CASCADE;
  DROP TABLE "header_navigation_locales" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "header_locales" CASCADE;
  DROP TABLE "_header_v_version_navigation" CASCADE;
  DROP TABLE "_header_v_version_navigation_locales" CASCADE;
  DROP TABLE "_header_v" CASCADE;
  DROP TABLE "_header_v_locales" CASCADE;
  DROP TABLE "footer_social_links" CASCADE;
  DROP TABLE "footer_social_links_locales" CASCADE;
  DROP TABLE "footer_legal_navigation" CASCADE;
  DROP TABLE "footer_legal_navigation_locales" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_locales" CASCADE;
  DROP TABLE "_footer_v_version_social_links" CASCADE;
  DROP TABLE "_footer_v_version_social_links_locales" CASCADE;
  DROP TABLE "_footer_v_version_legal_navigation" CASCADE;
  DROP TABLE "_footer_v_version_legal_navigation_locales" CASCADE;
  DROP TABLE "_footer_v" CASCADE;
  DROP TABLE "_footer_v_locales" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "booking_settings_enabled_modes" CASCADE;
  DROP TABLE "booking_settings_provider_routing" CASCADE;
  DROP TABLE "booking_settings_provider_routing_locales" CASCADE;
  DROP TABLE "booking_settings_notification_recipients" CASCADE;
  DROP TABLE "booking_settings" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_users_admin_locale";
  DROP TYPE "public"."enum_media_allowed_usage_contexts";
  DROP TYPE "public"."enum_media_source";
  DROP TYPE "public"."enum_media_usage_rights_status";
  DROP TYPE "public"."enum_media_model_release_status";
  DROP TYPE "public"."enum_media_replacement_priority";
  DROP TYPE "public"."enum_directions_canonical_key";
  DROP TYPE "public"."enum_directions_status";
  DROP TYPE "public"."enum__directions_v_version_canonical_key";
  DROP TYPE "public"."enum__directions_v_version_status";
  DROP TYPE "public"."enum__directions_v_published_locale";
  DROP TYPE "public"."enum_services_formats";
  DROP TYPE "public"."enum_services_cta_action";
  DROP TYPE "public"."enum_services_status";
  DROP TYPE "public"."enum__services_v_version_formats";
  DROP TYPE "public"."enum__services_v_version_cta_action";
  DROP TYPE "public"."enum__services_v_version_status";
  DROP TYPE "public"."enum__services_v_published_locale";
  DROP TYPE "public"."enum_offers_prices_currency";
  DROP TYPE "public"."enum_offers_format";
  DROP TYPE "public"."enum_offers_pricing_mode";
  DROP TYPE "public"."enum_offers_checkout_mode";
  DROP TYPE "public"."enum_offers_commercial_status";
  DROP TYPE "public"."enum_offers_status";
  DROP TYPE "public"."enum__offers_v_version_prices_currency";
  DROP TYPE "public"."enum__offers_v_version_format";
  DROP TYPE "public"."enum__offers_v_version_pricing_mode";
  DROP TYPE "public"."enum__offers_v_version_checkout_mode";
  DROP TYPE "public"."enum__offers_v_version_commercial_status";
  DROP TYPE "public"."enum__offers_v_version_status";
  DROP TYPE "public"."enum__offers_v_published_locale";
  DROP TYPE "public"."enum_courses_formats";
  DROP TYPE "public"."enum_courses_availability";
  DROP TYPE "public"."enum_courses_cta_action";
  DROP TYPE "public"."enum_courses_status";
  DROP TYPE "public"."enum__courses_v_version_formats";
  DROP TYPE "public"."enum__courses_v_version_availability";
  DROP TYPE "public"."enum__courses_v_version_cta_action";
  DROP TYPE "public"."enum__courses_v_version_status";
  DROP TYPE "public"."enum__courses_v_published_locale";
  DROP TYPE "public"."enum_fashion_collections_collection_type";
  DROP TYPE "public"."enum_fashion_collections_availability";
  DROP TYPE "public"."enum_fashion_collections_cta_action";
  DROP TYPE "public"."enum_fashion_collections_status";
  DROP TYPE "public"."enum__fashion_collections_v_version_collection_type";
  DROP TYPE "public"."enum__fashion_collections_v_version_availability";
  DROP TYPE "public"."enum__fashion_collections_v_version_cta_action";
  DROP TYPE "public"."enum__fashion_collections_v_version_status";
  DROP TYPE "public"."enum__fashion_collections_v_published_locale";
  DROP TYPE "public"."enum_portfolio_cases_client_type";
  DROP TYPE "public"."enum_portfolio_cases_usage_rights_status";
  DROP TYPE "public"."enum_portfolio_cases_approval_status";
  DROP TYPE "public"."enum_portfolio_cases_status";
  DROP TYPE "public"."enum__portfolio_cases_v_version_client_type";
  DROP TYPE "public"."enum__portfolio_cases_v_version_usage_rights_status";
  DROP TYPE "public"."enum__portfolio_cases_v_version_approval_status";
  DROP TYPE "public"."enum__portfolio_cases_v_version_status";
  DROP TYPE "public"."enum__portfolio_cases_v_published_locale";
  DROP TYPE "public"."enum_testimonials_consent_status";
  DROP TYPE "public"."enum_testimonials_status";
  DROP TYPE "public"."enum__testimonials_v_version_consent_status";
  DROP TYPE "public"."enum__testimonials_v_version_status";
  DROP TYPE "public"."enum__testimonials_v_published_locale";
  DROP TYPE "public"."enum_pages_page_type";
  DROP TYPE "public"."enum_pages_cta_action";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_page_type";
  DROP TYPE "public"."enum__pages_v_version_cta_action";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_leads_preferred_contact_method";
  DROP TYPE "public"."enum_leads_locale";
  DROP TYPE "public"."enum_leads_source_type";
  DROP TYPE "public"."enum_leads_duplicate_state";
  DROP TYPE "public"."enum_booking_requests_inquiry_type";
  DROP TYPE "public"."enum_booking_requests_request_mode";
  DROP TYPE "public"."enum_booking_requests_format";
  DROP TYPE "public"."enum_booking_requests_currency";
  DROP TYPE "public"."enum_booking_requests_status";
  DROP TYPE "public"."enum_payment_orders_provider";
  DROP TYPE "public"."enum_payment_orders_currency";
  DROP TYPE "public"."enum_payment_orders_mode";
  DROP TYPE "public"."enum_payment_orders_status";
  DROP TYPE "public"."enum_webhook_events_provider";
  DROP TYPE "public"."enum_webhook_events_processing_status";
  DROP TYPE "public"."enum_redirects_to_type";
  DROP TYPE "public"."enum_redirects_type";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_home_status";
  DROP TYPE "public"."enum__home_v_version_status";
  DROP TYPE "public"."enum__home_v_published_locale";
  DROP TYPE "public"."enum_header_status";
  DROP TYPE "public"."enum__header_v_version_status";
  DROP TYPE "public"."enum__header_v_published_locale";
  DROP TYPE "public"."enum_footer_status";
  DROP TYPE "public"."enum__footer_v_version_status";
  DROP TYPE "public"."enum__footer_v_published_locale";
  DROP TYPE "public"."enum_site_settings_map_provider";
  DROP TYPE "public"."enum_booking_settings_enabled_modes";
  DROP TYPE "public"."enum_booking_settings_provider_routing_currency";
  DROP TYPE "public"."enum_booking_settings_provider_routing_provider";
  DROP TYPE "public"."enum_booking_settings_notification_recipients_environment";`)
}
