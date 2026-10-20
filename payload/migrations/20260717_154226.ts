import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_page_type" ADD VALUE 'portfolio' BEFORE 'contacts';
  ALTER TYPE "public"."enum__pages_v_version_page_type" ADD VALUE 'portfolio' BEFORE 'contacts';
  CREATE TABLE "directions_format_notes" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"text" varchar
  );

  CREATE TABLE "directions_faq" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"question" varchar,
	"answer" varchar
  );

  CREATE TABLE "directions_inquiry_steps" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar
  );

  CREATE TABLE "_directions_v_version_format_notes" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_directions_v_version_faq" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" varchar,
	"answer" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_directions_v_version_inquiry_steps" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "services_format_presentation" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar
  );

  CREATE TABLE "_services_v_version_format_presentation" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "fashion_collections_styling" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar
  );

  CREATE TABLE "fashion_collections_facts" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar
  );

  CREATE TABLE "fashion_collections_inquiry_steps" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar
  );

  CREATE TABLE "_fashion_collections_v_version_styling" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_fashion_collections_v_version_facts" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_fashion_collections_v_version_inquiry_steps" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "pages_studio_signals" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"label" varchar,
	"value" varchar
  );

  CREATE TABLE "pages_method_steps" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar
  );

  CREATE TABLE "pages_standards" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar
  );

  CREATE TABLE "pages_record_items" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"text" varchar
  );

  CREATE TABLE "pages_current_items" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar
  );

  CREATE TABLE "pages_flow_items" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"text" varchar
  );

  CREATE TABLE "_pages_v_version_studio_signals" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" varchar,
	"value" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_pages_v_version_method_steps" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_pages_v_version_standards" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_pages_v_version_record_items" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_pages_v_version_current_items" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_pages_v_version_flow_items" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "home_method_details" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"text" varchar
  );

  CREATE TABLE "home_portfolio_signals" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"text" varchar
  );

  CREATE TABLE "home_faq" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"question" varchar,
	"answer" varchar
  );

  CREATE TABLE "_home_v_version_method_details" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_home_v_version_portfolio_signals" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_home_v_version_faq" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" varchar,
	"answer" varchar,
	"_uuid" varchar
  );

  ALTER TABLE "directions" ADD COLUMN "cta_service" varchar;
  ALTER TABLE "directions_locales" ADD COLUMN "process_title" varchar;
  ALTER TABLE "directions_locales" ADD COLUMN "formats_title" varchar;
  ALTER TABLE "directions_locales" ADD COLUMN "outcomes_title" varchar;
  ALTER TABLE "directions_locales" ADD COLUMN "cta_title" varchar;
  ALTER TABLE "directions_locales" ADD COLUMN "cta_summary" varchar;
  ALTER TABLE "directions_locales" ADD COLUMN "cta_label" varchar;
  ALTER TABLE "directions_locales" ADD COLUMN "diagnostic_label" varchar;
  ALTER TABLE "directions_locales" ADD COLUMN "faq_title" varchar;
  ALTER TABLE "directions_locales" ADD COLUMN "count_label" varchar;
  ALTER TABLE "directions_locales" ADD COLUMN "availability_value" varchar;
  ALTER TABLE "directions_locales" ADD COLUMN "availability_label" varchar;
  ALTER TABLE "directions_locales" ADD COLUMN "fitting_value" varchar;
  ALTER TABLE "directions_locales" ADD COLUMN "fitting_label" varchar;
  ALTER TABLE "directions_locales" ADD COLUMN "catalogue_title" varchar;
  ALTER TABLE "directions_locales" ADD COLUMN "catalogue_summary" varchar;
  ALTER TABLE "directions_locales" ADD COLUMN "materials_label" varchar;
  ALTER TABLE "directions_locales" ADD COLUMN "inquiry_title" varchar;
  ALTER TABLE "_directions_v" ADD COLUMN "version_cta_service" varchar;
  ALTER TABLE "_directions_v_locales" ADD COLUMN "version_process_title" varchar;
  ALTER TABLE "_directions_v_locales" ADD COLUMN "version_formats_title" varchar;
  ALTER TABLE "_directions_v_locales" ADD COLUMN "version_outcomes_title" varchar;
  ALTER TABLE "_directions_v_locales" ADD COLUMN "version_cta_title" varchar;
  ALTER TABLE "_directions_v_locales" ADD COLUMN "version_cta_summary" varchar;
  ALTER TABLE "_directions_v_locales" ADD COLUMN "version_cta_label" varchar;
  ALTER TABLE "_directions_v_locales" ADD COLUMN "version_diagnostic_label" varchar;
  ALTER TABLE "_directions_v_locales" ADD COLUMN "version_faq_title" varchar;
  ALTER TABLE "_directions_v_locales" ADD COLUMN "version_count_label" varchar;
  ALTER TABLE "_directions_v_locales" ADD COLUMN "version_availability_value" varchar;
  ALTER TABLE "_directions_v_locales" ADD COLUMN "version_availability_label" varchar;
  ALTER TABLE "_directions_v_locales" ADD COLUMN "version_fitting_value" varchar;
  ALTER TABLE "_directions_v_locales" ADD COLUMN "version_fitting_label" varchar;
  ALTER TABLE "_directions_v_locales" ADD COLUMN "version_catalogue_title" varchar;
  ALTER TABLE "_directions_v_locales" ADD COLUMN "version_catalogue_summary" varchar;
  ALTER TABLE "_directions_v_locales" ADD COLUMN "version_materials_label" varchar;
  ALTER TABLE "_directions_v_locales" ADD COLUMN "version_inquiry_title" varchar;
  ALTER TABLE "services_locales" ADD COLUMN "formats_title" varchar;
  ALTER TABLE "services_locales" ADD COLUMN "process_title" varchar;
  ALTER TABLE "services_locales" ADD COLUMN "outcome_title" varchar;
  ALTER TABLE "services_locales" ADD COLUMN "commercial_title" varchar;
  ALTER TABLE "services_locales" ADD COLUMN "commercial_status_copy" varchar;
  ALTER TABLE "services_locales" ADD COLUMN "price_note" varchar;
  ALTER TABLE "services_locales" ADD COLUMN "next_step_title" varchar;
  ALTER TABLE "services_locales" ADD COLUMN "next_step_summary" varchar;
  ALTER TABLE "_services_v_locales" ADD COLUMN "version_formats_title" varchar;
  ALTER TABLE "_services_v_locales" ADD COLUMN "version_process_title" varchar;
  ALTER TABLE "_services_v_locales" ADD COLUMN "version_outcome_title" varchar;
  ALTER TABLE "_services_v_locales" ADD COLUMN "version_commercial_title" varchar;
  ALTER TABLE "_services_v_locales" ADD COLUMN "version_commercial_status_copy" varchar;
  ALTER TABLE "_services_v_locales" ADD COLUMN "version_price_note" varchar;
  ALTER TABLE "_services_v_locales" ADD COLUMN "version_next_step_title" varchar;
  ALTER TABLE "_services_v_locales" ADD COLUMN "version_next_step_summary" varchar;
  ALTER TABLE "fashion_collections_locales" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "fashion_collections_locales" ADD COLUMN "styling_title" varchar;
  ALTER TABLE "fashion_collections_locales" ADD COLUMN "facts_title" varchar;
  ALTER TABLE "fashion_collections_locales" ADD COLUMN "inquiry_title" varchar;
  ALTER TABLE "fashion_collections_locales" ADD COLUMN "materials_title" varchar;
  ALTER TABLE "fashion_collections_locales" ADD COLUMN "availability_title" varchar;
  ALTER TABLE "fashion_collections_locales" ADD COLUMN "cta_title" varchar;
  ALTER TABLE "fashion_collections_locales" ADD COLUMN "cta_summary" varchar;
  ALTER TABLE "fashion_collections_locales" ADD COLUMN "service_label" varchar;
  ALTER TABLE "_fashion_collections_v_locales" ADD COLUMN "version_eyebrow" varchar;
  ALTER TABLE "_fashion_collections_v_locales" ADD COLUMN "version_styling_title" varchar;
  ALTER TABLE "_fashion_collections_v_locales" ADD COLUMN "version_facts_title" varchar;
  ALTER TABLE "_fashion_collections_v_locales" ADD COLUMN "version_inquiry_title" varchar;
  ALTER TABLE "_fashion_collections_v_locales" ADD COLUMN "version_materials_title" varchar;
  ALTER TABLE "_fashion_collections_v_locales" ADD COLUMN "version_availability_title" varchar;
  ALTER TABLE "_fashion_collections_v_locales" ADD COLUMN "version_cta_title" varchar;
  ALTER TABLE "_fashion_collections_v_locales" ADD COLUMN "version_cta_summary" varchar;
  ALTER TABLE "_fashion_collections_v_locales" ADD COLUMN "version_service_label" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "method_eyebrow" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "method_title" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "clients_title" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "clients_summary" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "private_title" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "corporate_title" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "directions_title" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "cta_title" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "cta_summary" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "form_title" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "form_summary" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "hero_media_label" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "standards_title" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "record_title" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "record_summary" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "current_title" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "flow_title" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "secondary_c_t_a_label" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "empty_eyebrow" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "empty_title" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "empty_summary" varchar;
  ALTER TABLE "pages_locales" ADD COLUMN "empty_action" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_method_eyebrow" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_method_title" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_clients_title" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_clients_summary" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_private_title" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_corporate_title" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_directions_title" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_cta_title" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_cta_summary" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_form_title" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_form_summary" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_hero_media_label" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_standards_title" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_record_title" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_record_summary" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_current_title" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_flow_title" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_secondary_c_t_a_label" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_empty_eyebrow" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_empty_title" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_empty_summary" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_empty_action" varchar;
  ALTER TABLE "home" ADD COLUMN "section_media_research_id" uuid;
  ALTER TABLE "home" ADD COLUMN "section_media_imagine_id" uuid;
  ALTER TABLE "home" ADD COLUMN "section_media_create_id" uuid;
  ALTER TABLE "home" ADD COLUMN "section_media_directions_id" uuid;
  ALTER TABLE "home" ADD COLUMN "section_media_studio_id" uuid;
  ALTER TABLE "home" ADD COLUMN "section_media_portfolio_id" uuid;
  ALTER TABLE "home_locales" ADD COLUMN "service_intro" varchar;
  ALTER TABLE "home_locales" ADD COLUMN "price_note" varchar;
  ALTER TABLE "home_locales" ADD COLUMN "method_eyebrow" varchar;
  ALTER TABLE "home_locales" ADD COLUMN "method_title" varchar;
  ALTER TABLE "home_locales" ADD COLUMN "studio_eyebrow" varchar;
  ALTER TABLE "home_locales" ADD COLUMN "studio_title" varchar;
  ALTER TABLE "home_locales" ADD COLUMN "service_rail_title" varchar;
  ALTER TABLE "home_locales" ADD COLUMN "collection_rail_title" varchar;
  ALTER TABLE "home_locales" ADD COLUMN "portfolio_note" varchar;
  ALTER TABLE "home_locales" ADD COLUMN "portfolio_title" varchar;
  ALTER TABLE "home_locales" ADD COLUMN "portfolio_summary" varchar;
  ALTER TABLE "home_locales" ADD COLUMN "faq_title" varchar;
  ALTER TABLE "_home_v" ADD COLUMN "version_section_media_research_id" uuid;
  ALTER TABLE "_home_v" ADD COLUMN "version_section_media_imagine_id" uuid;
  ALTER TABLE "_home_v" ADD COLUMN "version_section_media_create_id" uuid;
  ALTER TABLE "_home_v" ADD COLUMN "version_section_media_directions_id" uuid;
  ALTER TABLE "_home_v" ADD COLUMN "version_section_media_studio_id" uuid;
  ALTER TABLE "_home_v" ADD COLUMN "version_section_media_portfolio_id" uuid;
  ALTER TABLE "_home_v_locales" ADD COLUMN "version_service_intro" varchar;
  ALTER TABLE "_home_v_locales" ADD COLUMN "version_price_note" varchar;
  ALTER TABLE "_home_v_locales" ADD COLUMN "version_method_eyebrow" varchar;
  ALTER TABLE "_home_v_locales" ADD COLUMN "version_method_title" varchar;
  ALTER TABLE "_home_v_locales" ADD COLUMN "version_studio_eyebrow" varchar;
  ALTER TABLE "_home_v_locales" ADD COLUMN "version_studio_title" varchar;
  ALTER TABLE "_home_v_locales" ADD COLUMN "version_service_rail_title" varchar;
  ALTER TABLE "_home_v_locales" ADD COLUMN "version_collection_rail_title" varchar;
  ALTER TABLE "_home_v_locales" ADD COLUMN "version_portfolio_note" varchar;
  ALTER TABLE "_home_v_locales" ADD COLUMN "version_portfolio_title" varchar;
  ALTER TABLE "_home_v_locales" ADD COLUMN "version_portfolio_summary" varchar;
  ALTER TABLE "_home_v_locales" ADD COLUMN "version_faq_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "contacts_action_path" varchar NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "contacts_viber_u_r_l" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "contacts_city" varchar NOT NULL;
  ALTER TABLE "site_settings_locales" ADD COLUMN "contacts_action_label" varchar NOT NULL;
  ALTER TABLE "site_settings_locales" ADD COLUMN "ui_labels_language" varchar NOT NULL;
  ALTER TABLE "site_settings_locales" ADD COLUMN "ui_labels_close" varchar NOT NULL;
  ALTER TABLE "site_settings_locales" ADD COLUMN "ui_labels_external_link" varchar NOT NULL;
  ALTER TABLE "directions_format_notes" ADD CONSTRAINT "directions_format_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."directions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "directions_faq" ADD CONSTRAINT "directions_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."directions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "directions_inquiry_steps" ADD CONSTRAINT "directions_inquiry_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."directions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_directions_v_version_format_notes" ADD CONSTRAINT "_directions_v_version_format_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_directions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_directions_v_version_faq" ADD CONSTRAINT "_directions_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_directions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_directions_v_version_inquiry_steps" ADD CONSTRAINT "_directions_v_version_inquiry_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_directions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_format_presentation" ADD CONSTRAINT "services_format_presentation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_format_presentation" ADD CONSTRAINT "_services_v_version_format_presentation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections_styling" ADD CONSTRAINT "fashion_collections_styling_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections_facts" ADD CONSTRAINT "fashion_collections_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections_inquiry_steps" ADD CONSTRAINT "fashion_collections_inquiry_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_version_styling" ADD CONSTRAINT "_fashion_collections_v_version_styling_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_fashion_collections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_version_facts" ADD CONSTRAINT "_fashion_collections_v_version_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_fashion_collections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_version_inquiry_steps" ADD CONSTRAINT "_fashion_collections_v_version_inquiry_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_fashion_collections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_studio_signals" ADD CONSTRAINT "pages_studio_signals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_method_steps" ADD CONSTRAINT "pages_method_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_standards" ADD CONSTRAINT "pages_standards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_record_items" ADD CONSTRAINT "pages_record_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_current_items" ADD CONSTRAINT "pages_current_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_flow_items" ADD CONSTRAINT "pages_flow_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_studio_signals" ADD CONSTRAINT "_pages_v_version_studio_signals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_method_steps" ADD CONSTRAINT "_pages_v_version_method_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_standards" ADD CONSTRAINT "_pages_v_version_standards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_record_items" ADD CONSTRAINT "_pages_v_version_record_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_current_items" ADD CONSTRAINT "_pages_v_version_current_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_flow_items" ADD CONSTRAINT "_pages_v_version_flow_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_method_details" ADD CONSTRAINT "home_method_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_portfolio_signals" ADD CONSTRAINT "home_portfolio_signals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_faq" ADD CONSTRAINT "home_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_method_details" ADD CONSTRAINT "_home_v_version_method_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_portfolio_signals" ADD CONSTRAINT "_home_v_version_portfolio_signals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_faq" ADD CONSTRAINT "_home_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "directions_format_notes_order_idx" ON "directions_format_notes" USING btree ("_order");
  CREATE INDEX "directions_format_notes_parent_id_idx" ON "directions_format_notes" USING btree ("_parent_id");
  CREATE INDEX "directions_format_notes_locale_idx" ON "directions_format_notes" USING btree ("_locale");
  CREATE INDEX "directions_faq_order_idx" ON "directions_faq" USING btree ("_order");
  CREATE INDEX "directions_faq_parent_id_idx" ON "directions_faq" USING btree ("_parent_id");
  CREATE INDEX "directions_faq_locale_idx" ON "directions_faq" USING btree ("_locale");
  CREATE INDEX "directions_inquiry_steps_order_idx" ON "directions_inquiry_steps" USING btree ("_order");
  CREATE INDEX "directions_inquiry_steps_parent_id_idx" ON "directions_inquiry_steps" USING btree ("_parent_id");
  CREATE INDEX "directions_inquiry_steps_locale_idx" ON "directions_inquiry_steps" USING btree ("_locale");
  CREATE INDEX "_directions_v_version_format_notes_order_idx" ON "_directions_v_version_format_notes" USING btree ("_order");
  CREATE INDEX "_directions_v_version_format_notes_parent_id_idx" ON "_directions_v_version_format_notes" USING btree ("_parent_id");
  CREATE INDEX "_directions_v_version_format_notes_locale_idx" ON "_directions_v_version_format_notes" USING btree ("_locale");
  CREATE INDEX "_directions_v_version_faq_order_idx" ON "_directions_v_version_faq" USING btree ("_order");
  CREATE INDEX "_directions_v_version_faq_parent_id_idx" ON "_directions_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_directions_v_version_faq_locale_idx" ON "_directions_v_version_faq" USING btree ("_locale");
  CREATE INDEX "_directions_v_version_inquiry_steps_order_idx" ON "_directions_v_version_inquiry_steps" USING btree ("_order");
  CREATE INDEX "_directions_v_version_inquiry_steps_parent_id_idx" ON "_directions_v_version_inquiry_steps" USING btree ("_parent_id");
  CREATE INDEX "_directions_v_version_inquiry_steps_locale_idx" ON "_directions_v_version_inquiry_steps" USING btree ("_locale");
  CREATE INDEX "services_format_presentation_order_idx" ON "services_format_presentation" USING btree ("_order");
  CREATE INDEX "services_format_presentation_parent_id_idx" ON "services_format_presentation" USING btree ("_parent_id");
  CREATE INDEX "services_format_presentation_locale_idx" ON "services_format_presentation" USING btree ("_locale");
  CREATE INDEX "_services_v_version_format_presentation_order_idx" ON "_services_v_version_format_presentation" USING btree ("_order");
  CREATE INDEX "_services_v_version_format_presentation_parent_id_idx" ON "_services_v_version_format_presentation" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_format_presentation_locale_idx" ON "_services_v_version_format_presentation" USING btree ("_locale");
  CREATE INDEX "fashion_collections_styling_order_idx" ON "fashion_collections_styling" USING btree ("_order");
  CREATE INDEX "fashion_collections_styling_parent_id_idx" ON "fashion_collections_styling" USING btree ("_parent_id");
  CREATE INDEX "fashion_collections_styling_locale_idx" ON "fashion_collections_styling" USING btree ("_locale");
  CREATE INDEX "fashion_collections_facts_order_idx" ON "fashion_collections_facts" USING btree ("_order");
  CREATE INDEX "fashion_collections_facts_parent_id_idx" ON "fashion_collections_facts" USING btree ("_parent_id");
  CREATE INDEX "fashion_collections_facts_locale_idx" ON "fashion_collections_facts" USING btree ("_locale");
  CREATE INDEX "fashion_collections_inquiry_steps_order_idx" ON "fashion_collections_inquiry_steps" USING btree ("_order");
  CREATE INDEX "fashion_collections_inquiry_steps_parent_id_idx" ON "fashion_collections_inquiry_steps" USING btree ("_parent_id");
  CREATE INDEX "fashion_collections_inquiry_steps_locale_idx" ON "fashion_collections_inquiry_steps" USING btree ("_locale");
  CREATE INDEX "_fashion_collections_v_version_styling_order_idx" ON "_fashion_collections_v_version_styling" USING btree ("_order");
  CREATE INDEX "_fashion_collections_v_version_styling_parent_id_idx" ON "_fashion_collections_v_version_styling" USING btree ("_parent_id");
  CREATE INDEX "_fashion_collections_v_version_styling_locale_idx" ON "_fashion_collections_v_version_styling" USING btree ("_locale");
  CREATE INDEX "_fashion_collections_v_version_facts_order_idx" ON "_fashion_collections_v_version_facts" USING btree ("_order");
  CREATE INDEX "_fashion_collections_v_version_facts_parent_id_idx" ON "_fashion_collections_v_version_facts" USING btree ("_parent_id");
  CREATE INDEX "_fashion_collections_v_version_facts_locale_idx" ON "_fashion_collections_v_version_facts" USING btree ("_locale");
  CREATE INDEX "_fashion_collections_v_version_inquiry_steps_order_idx" ON "_fashion_collections_v_version_inquiry_steps" USING btree ("_order");
  CREATE INDEX "_fashion_collections_v_version_inquiry_steps_parent_id_idx" ON "_fashion_collections_v_version_inquiry_steps" USING btree ("_parent_id");
  CREATE INDEX "_fashion_collections_v_version_inquiry_steps_locale_idx" ON "_fashion_collections_v_version_inquiry_steps" USING btree ("_locale");
  CREATE INDEX "pages_studio_signals_order_idx" ON "pages_studio_signals" USING btree ("_order");
  CREATE INDEX "pages_studio_signals_parent_id_idx" ON "pages_studio_signals" USING btree ("_parent_id");
  CREATE INDEX "pages_studio_signals_locale_idx" ON "pages_studio_signals" USING btree ("_locale");
  CREATE INDEX "pages_method_steps_order_idx" ON "pages_method_steps" USING btree ("_order");
  CREATE INDEX "pages_method_steps_parent_id_idx" ON "pages_method_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_method_steps_locale_idx" ON "pages_method_steps" USING btree ("_locale");
  CREATE INDEX "pages_standards_order_idx" ON "pages_standards" USING btree ("_order");
  CREATE INDEX "pages_standards_parent_id_idx" ON "pages_standards" USING btree ("_parent_id");
  CREATE INDEX "pages_standards_locale_idx" ON "pages_standards" USING btree ("_locale");
  CREATE INDEX "pages_record_items_order_idx" ON "pages_record_items" USING btree ("_order");
  CREATE INDEX "pages_record_items_parent_id_idx" ON "pages_record_items" USING btree ("_parent_id");
  CREATE INDEX "pages_record_items_locale_idx" ON "pages_record_items" USING btree ("_locale");
  CREATE INDEX "pages_current_items_order_idx" ON "pages_current_items" USING btree ("_order");
  CREATE INDEX "pages_current_items_parent_id_idx" ON "pages_current_items" USING btree ("_parent_id");
  CREATE INDEX "pages_current_items_locale_idx" ON "pages_current_items" USING btree ("_locale");
  CREATE INDEX "pages_flow_items_order_idx" ON "pages_flow_items" USING btree ("_order");
  CREATE INDEX "pages_flow_items_parent_id_idx" ON "pages_flow_items" USING btree ("_parent_id");
  CREATE INDEX "pages_flow_items_locale_idx" ON "pages_flow_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_version_studio_signals_order_idx" ON "_pages_v_version_studio_signals" USING btree ("_order");
  CREATE INDEX "_pages_v_version_studio_signals_parent_id_idx" ON "_pages_v_version_studio_signals" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_studio_signals_locale_idx" ON "_pages_v_version_studio_signals" USING btree ("_locale");
  CREATE INDEX "_pages_v_version_method_steps_order_idx" ON "_pages_v_version_method_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_version_method_steps_parent_id_idx" ON "_pages_v_version_method_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_method_steps_locale_idx" ON "_pages_v_version_method_steps" USING btree ("_locale");
  CREATE INDEX "_pages_v_version_standards_order_idx" ON "_pages_v_version_standards" USING btree ("_order");
  CREATE INDEX "_pages_v_version_standards_parent_id_idx" ON "_pages_v_version_standards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_standards_locale_idx" ON "_pages_v_version_standards" USING btree ("_locale");
  CREATE INDEX "_pages_v_version_record_items_order_idx" ON "_pages_v_version_record_items" USING btree ("_order");
  CREATE INDEX "_pages_v_version_record_items_parent_id_idx" ON "_pages_v_version_record_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_record_items_locale_idx" ON "_pages_v_version_record_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_version_current_items_order_idx" ON "_pages_v_version_current_items" USING btree ("_order");
  CREATE INDEX "_pages_v_version_current_items_parent_id_idx" ON "_pages_v_version_current_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_current_items_locale_idx" ON "_pages_v_version_current_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_version_flow_items_order_idx" ON "_pages_v_version_flow_items" USING btree ("_order");
  CREATE INDEX "_pages_v_version_flow_items_parent_id_idx" ON "_pages_v_version_flow_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_flow_items_locale_idx" ON "_pages_v_version_flow_items" USING btree ("_locale");
  CREATE INDEX "home_method_details_order_idx" ON "home_method_details" USING btree ("_order");
  CREATE INDEX "home_method_details_parent_id_idx" ON "home_method_details" USING btree ("_parent_id");
  CREATE INDEX "home_method_details_locale_idx" ON "home_method_details" USING btree ("_locale");
  CREATE INDEX "home_portfolio_signals_order_idx" ON "home_portfolio_signals" USING btree ("_order");
  CREATE INDEX "home_portfolio_signals_parent_id_idx" ON "home_portfolio_signals" USING btree ("_parent_id");
  CREATE INDEX "home_portfolio_signals_locale_idx" ON "home_portfolio_signals" USING btree ("_locale");
  CREATE INDEX "home_faq_order_idx" ON "home_faq" USING btree ("_order");
  CREATE INDEX "home_faq_parent_id_idx" ON "home_faq" USING btree ("_parent_id");
  CREATE INDEX "home_faq_locale_idx" ON "home_faq" USING btree ("_locale");
  CREATE INDEX "_home_v_version_method_details_order_idx" ON "_home_v_version_method_details" USING btree ("_order");
  CREATE INDEX "_home_v_version_method_details_parent_id_idx" ON "_home_v_version_method_details" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_method_details_locale_idx" ON "_home_v_version_method_details" USING btree ("_locale");
  CREATE INDEX "_home_v_version_portfolio_signals_order_idx" ON "_home_v_version_portfolio_signals" USING btree ("_order");
  CREATE INDEX "_home_v_version_portfolio_signals_parent_id_idx" ON "_home_v_version_portfolio_signals" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_portfolio_signals_locale_idx" ON "_home_v_version_portfolio_signals" USING btree ("_locale");
  CREATE INDEX "_home_v_version_faq_order_idx" ON "_home_v_version_faq" USING btree ("_order");
  CREATE INDEX "_home_v_version_faq_parent_id_idx" ON "_home_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_faq_locale_idx" ON "_home_v_version_faq" USING btree ("_locale");
  ALTER TABLE "home" ADD CONSTRAINT "home_section_media_research_id_media_id_fk" FOREIGN KEY ("section_media_research_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_section_media_imagine_id_media_id_fk" FOREIGN KEY ("section_media_imagine_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_section_media_create_id_media_id_fk" FOREIGN KEY ("section_media_create_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_section_media_directions_id_media_id_fk" FOREIGN KEY ("section_media_directions_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_section_media_studio_id_media_id_fk" FOREIGN KEY ("section_media_studio_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_section_media_portfolio_id_media_id_fk" FOREIGN KEY ("section_media_portfolio_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_section_media_research_id_media_id_fk" FOREIGN KEY ("version_section_media_research_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_section_media_imagine_id_media_id_fk" FOREIGN KEY ("version_section_media_imagine_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_section_media_create_id_media_id_fk" FOREIGN KEY ("version_section_media_create_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_section_media_directions_id_media_id_fk" FOREIGN KEY ("version_section_media_directions_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_section_media_studio_id_media_id_fk" FOREIGN KEY ("version_section_media_studio_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_section_media_portfolio_id_media_id_fk" FOREIGN KEY ("version_section_media_portfolio_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "home_section_media_section_media_research_idx" ON "home" USING btree ("section_media_research_id");
  CREATE INDEX "home_section_media_section_media_imagine_idx" ON "home" USING btree ("section_media_imagine_id");
  CREATE INDEX "home_section_media_section_media_create_idx" ON "home" USING btree ("section_media_create_id");
  CREATE INDEX "home_section_media_section_media_directions_idx" ON "home" USING btree ("section_media_directions_id");
  CREATE INDEX "home_section_media_section_media_studio_idx" ON "home" USING btree ("section_media_studio_id");
  CREATE INDEX "home_section_media_section_media_portfolio_idx" ON "home" USING btree ("section_media_portfolio_id");
  CREATE INDEX "_home_v_version_section_media_version_section_media_rese_idx" ON "_home_v" USING btree ("version_section_media_research_id");
  CREATE INDEX "_home_v_version_section_media_version_section_media_imag_idx" ON "_home_v" USING btree ("version_section_media_imagine_id");
  CREATE INDEX "_home_v_version_section_media_version_section_media_crea_idx" ON "_home_v" USING btree ("version_section_media_create_id");
  CREATE INDEX "_home_v_version_section_media_version_section_media_dire_idx" ON "_home_v" USING btree ("version_section_media_directions_id");
  CREATE INDEX "_home_v_version_section_media_version_section_media_stud_idx" ON "_home_v" USING btree ("version_section_media_studio_id");
  CREATE INDEX "_home_v_version_section_media_version_section_media_port_idx" ON "_home_v" USING btree ("version_section_media_portfolio_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "directions_format_notes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "directions_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "directions_inquiry_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_directions_v_version_format_notes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_directions_v_version_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_directions_v_version_inquiry_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_format_presentation" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_format_presentation" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "fashion_collections_styling" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "fashion_collections_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "fashion_collections_inquiry_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_fashion_collections_v_version_styling" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_fashion_collections_v_version_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_fashion_collections_v_version_inquiry_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_studio_signals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_method_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_standards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_record_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_current_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_flow_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_studio_signals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_method_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_standards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_record_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_current_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_flow_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_method_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_portfolio_signals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_version_method_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_version_portfolio_signals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_version_faq" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "directions_format_notes" CASCADE;
  DROP TABLE "directions_faq" CASCADE;
  DROP TABLE "directions_inquiry_steps" CASCADE;
  DROP TABLE "_directions_v_version_format_notes" CASCADE;
  DROP TABLE "_directions_v_version_faq" CASCADE;
  DROP TABLE "_directions_v_version_inquiry_steps" CASCADE;
  DROP TABLE "services_format_presentation" CASCADE;
  DROP TABLE "_services_v_version_format_presentation" CASCADE;
  DROP TABLE "fashion_collections_styling" CASCADE;
  DROP TABLE "fashion_collections_facts" CASCADE;
  DROP TABLE "fashion_collections_inquiry_steps" CASCADE;
  DROP TABLE "_fashion_collections_v_version_styling" CASCADE;
  DROP TABLE "_fashion_collections_v_version_facts" CASCADE;
  DROP TABLE "_fashion_collections_v_version_inquiry_steps" CASCADE;
  DROP TABLE "pages_studio_signals" CASCADE;
  DROP TABLE "pages_method_steps" CASCADE;
  DROP TABLE "pages_standards" CASCADE;
  DROP TABLE "pages_record_items" CASCADE;
  DROP TABLE "pages_current_items" CASCADE;
  DROP TABLE "pages_flow_items" CASCADE;
  DROP TABLE "_pages_v_version_studio_signals" CASCADE;
  DROP TABLE "_pages_v_version_method_steps" CASCADE;
  DROP TABLE "_pages_v_version_standards" CASCADE;
  DROP TABLE "_pages_v_version_record_items" CASCADE;
  DROP TABLE "_pages_v_version_current_items" CASCADE;
  DROP TABLE "_pages_v_version_flow_items" CASCADE;
  DROP TABLE "home_method_details" CASCADE;
  DROP TABLE "home_portfolio_signals" CASCADE;
  DROP TABLE "home_faq" CASCADE;
  DROP TABLE "_home_v_version_method_details" CASCADE;
  DROP TABLE "_home_v_version_portfolio_signals" CASCADE;
  DROP TABLE "_home_v_version_faq" CASCADE;
  ALTER TABLE "home" DROP CONSTRAINT "home_section_media_research_id_media_id_fk";

  ALTER TABLE "home" DROP CONSTRAINT "home_section_media_imagine_id_media_id_fk";

  ALTER TABLE "home" DROP CONSTRAINT "home_section_media_create_id_media_id_fk";

  ALTER TABLE "home" DROP CONSTRAINT "home_section_media_directions_id_media_id_fk";

  ALTER TABLE "home" DROP CONSTRAINT "home_section_media_studio_id_media_id_fk";

  ALTER TABLE "home" DROP CONSTRAINT "home_section_media_portfolio_id_media_id_fk";

  ALTER TABLE "_home_v" DROP CONSTRAINT "_home_v_version_section_media_research_id_media_id_fk";

  ALTER TABLE "_home_v" DROP CONSTRAINT "_home_v_version_section_media_imagine_id_media_id_fk";

  ALTER TABLE "_home_v" DROP CONSTRAINT "_home_v_version_section_media_create_id_media_id_fk";

  ALTER TABLE "_home_v" DROP CONSTRAINT "_home_v_version_section_media_directions_id_media_id_fk";

  ALTER TABLE "_home_v" DROP CONSTRAINT "_home_v_version_section_media_studio_id_media_id_fk";

  ALTER TABLE "_home_v" DROP CONSTRAINT "_home_v_version_section_media_portfolio_id_media_id_fk";

  ALTER TABLE "pages" ALTER COLUMN "page_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_page_type";
  CREATE TYPE "public"."enum_pages_page_type" AS ENUM('studio', 'contacts', 'privacy', 'terms', 'cookies', 'payments', 'cancellation-refunds', 'consent', 'service-state');
  ALTER TABLE "pages" ALTER COLUMN "page_type" SET DATA TYPE "public"."enum_pages_page_type" USING "page_type"::"public"."enum_pages_page_type";
  ALTER TABLE "_pages_v" ALTER COLUMN "version_page_type" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_version_page_type";
  CREATE TYPE "public"."enum__pages_v_version_page_type" AS ENUM('studio', 'contacts', 'privacy', 'terms', 'cookies', 'payments', 'cancellation-refunds', 'consent', 'service-state');
  ALTER TABLE "_pages_v" ALTER COLUMN "version_page_type" SET DATA TYPE "public"."enum__pages_v_version_page_type" USING "version_page_type"::"public"."enum__pages_v_version_page_type";
  DROP INDEX "home_section_media_section_media_research_idx";
  DROP INDEX "home_section_media_section_media_imagine_idx";
  DROP INDEX "home_section_media_section_media_create_idx";
  DROP INDEX "home_section_media_section_media_directions_idx";
  DROP INDEX "home_section_media_section_media_studio_idx";
  DROP INDEX "home_section_media_section_media_portfolio_idx";
  DROP INDEX "_home_v_version_section_media_version_section_media_rese_idx";
  DROP INDEX "_home_v_version_section_media_version_section_media_imag_idx";
  DROP INDEX "_home_v_version_section_media_version_section_media_crea_idx";
  DROP INDEX "_home_v_version_section_media_version_section_media_dire_idx";
  DROP INDEX "_home_v_version_section_media_version_section_media_stud_idx";
  DROP INDEX "_home_v_version_section_media_version_section_media_port_idx";
  ALTER TABLE "directions" DROP COLUMN "cta_service";
  ALTER TABLE "directions_locales" DROP COLUMN "process_title";
  ALTER TABLE "directions_locales" DROP COLUMN "formats_title";
  ALTER TABLE "directions_locales" DROP COLUMN "outcomes_title";
  ALTER TABLE "directions_locales" DROP COLUMN "cta_title";
  ALTER TABLE "directions_locales" DROP COLUMN "cta_summary";
  ALTER TABLE "directions_locales" DROP COLUMN "cta_label";
  ALTER TABLE "directions_locales" DROP COLUMN "diagnostic_label";
  ALTER TABLE "directions_locales" DROP COLUMN "faq_title";
  ALTER TABLE "directions_locales" DROP COLUMN "count_label";
  ALTER TABLE "directions_locales" DROP COLUMN "availability_value";
  ALTER TABLE "directions_locales" DROP COLUMN "availability_label";
  ALTER TABLE "directions_locales" DROP COLUMN "fitting_value";
  ALTER TABLE "directions_locales" DROP COLUMN "fitting_label";
  ALTER TABLE "directions_locales" DROP COLUMN "catalogue_title";
  ALTER TABLE "directions_locales" DROP COLUMN "catalogue_summary";
  ALTER TABLE "directions_locales" DROP COLUMN "materials_label";
  ALTER TABLE "directions_locales" DROP COLUMN "inquiry_title";
  ALTER TABLE "_directions_v" DROP COLUMN "version_cta_service";
  ALTER TABLE "_directions_v_locales" DROP COLUMN "version_process_title";
  ALTER TABLE "_directions_v_locales" DROP COLUMN "version_formats_title";
  ALTER TABLE "_directions_v_locales" DROP COLUMN "version_outcomes_title";
  ALTER TABLE "_directions_v_locales" DROP COLUMN "version_cta_title";
  ALTER TABLE "_directions_v_locales" DROP COLUMN "version_cta_summary";
  ALTER TABLE "_directions_v_locales" DROP COLUMN "version_cta_label";
  ALTER TABLE "_directions_v_locales" DROP COLUMN "version_diagnostic_label";
  ALTER TABLE "_directions_v_locales" DROP COLUMN "version_faq_title";
  ALTER TABLE "_directions_v_locales" DROP COLUMN "version_count_label";
  ALTER TABLE "_directions_v_locales" DROP COLUMN "version_availability_value";
  ALTER TABLE "_directions_v_locales" DROP COLUMN "version_availability_label";
  ALTER TABLE "_directions_v_locales" DROP COLUMN "version_fitting_value";
  ALTER TABLE "_directions_v_locales" DROP COLUMN "version_fitting_label";
  ALTER TABLE "_directions_v_locales" DROP COLUMN "version_catalogue_title";
  ALTER TABLE "_directions_v_locales" DROP COLUMN "version_catalogue_summary";
  ALTER TABLE "_directions_v_locales" DROP COLUMN "version_materials_label";
  ALTER TABLE "_directions_v_locales" DROP COLUMN "version_inquiry_title";
  ALTER TABLE "services_locales" DROP COLUMN "formats_title";
  ALTER TABLE "services_locales" DROP COLUMN "process_title";
  ALTER TABLE "services_locales" DROP COLUMN "outcome_title";
  ALTER TABLE "services_locales" DROP COLUMN "commercial_title";
  ALTER TABLE "services_locales" DROP COLUMN "commercial_status_copy";
  ALTER TABLE "services_locales" DROP COLUMN "price_note";
  ALTER TABLE "services_locales" DROP COLUMN "next_step_title";
  ALTER TABLE "services_locales" DROP COLUMN "next_step_summary";
  ALTER TABLE "_services_v_locales" DROP COLUMN "version_formats_title";
  ALTER TABLE "_services_v_locales" DROP COLUMN "version_process_title";
  ALTER TABLE "_services_v_locales" DROP COLUMN "version_outcome_title";
  ALTER TABLE "_services_v_locales" DROP COLUMN "version_commercial_title";
  ALTER TABLE "_services_v_locales" DROP COLUMN "version_commercial_status_copy";
  ALTER TABLE "_services_v_locales" DROP COLUMN "version_price_note";
  ALTER TABLE "_services_v_locales" DROP COLUMN "version_next_step_title";
  ALTER TABLE "_services_v_locales" DROP COLUMN "version_next_step_summary";
  ALTER TABLE "fashion_collections_locales" DROP COLUMN "eyebrow";
  ALTER TABLE "fashion_collections_locales" DROP COLUMN "styling_title";
  ALTER TABLE "fashion_collections_locales" DROP COLUMN "facts_title";
  ALTER TABLE "fashion_collections_locales" DROP COLUMN "inquiry_title";
  ALTER TABLE "fashion_collections_locales" DROP COLUMN "materials_title";
  ALTER TABLE "fashion_collections_locales" DROP COLUMN "availability_title";
  ALTER TABLE "fashion_collections_locales" DROP COLUMN "cta_title";
  ALTER TABLE "fashion_collections_locales" DROP COLUMN "cta_summary";
  ALTER TABLE "fashion_collections_locales" DROP COLUMN "service_label";
  ALTER TABLE "_fashion_collections_v_locales" DROP COLUMN "version_eyebrow";
  ALTER TABLE "_fashion_collections_v_locales" DROP COLUMN "version_styling_title";
  ALTER TABLE "_fashion_collections_v_locales" DROP COLUMN "version_facts_title";
  ALTER TABLE "_fashion_collections_v_locales" DROP COLUMN "version_inquiry_title";
  ALTER TABLE "_fashion_collections_v_locales" DROP COLUMN "version_materials_title";
  ALTER TABLE "_fashion_collections_v_locales" DROP COLUMN "version_availability_title";
  ALTER TABLE "_fashion_collections_v_locales" DROP COLUMN "version_cta_title";
  ALTER TABLE "_fashion_collections_v_locales" DROP COLUMN "version_cta_summary";
  ALTER TABLE "_fashion_collections_v_locales" DROP COLUMN "version_service_label";
  ALTER TABLE "pages_locales" DROP COLUMN "method_eyebrow";
  ALTER TABLE "pages_locales" DROP COLUMN "method_title";
  ALTER TABLE "pages_locales" DROP COLUMN "clients_title";
  ALTER TABLE "pages_locales" DROP COLUMN "clients_summary";
  ALTER TABLE "pages_locales" DROP COLUMN "private_title";
  ALTER TABLE "pages_locales" DROP COLUMN "corporate_title";
  ALTER TABLE "pages_locales" DROP COLUMN "directions_title";
  ALTER TABLE "pages_locales" DROP COLUMN "cta_title";
  ALTER TABLE "pages_locales" DROP COLUMN "cta_summary";
  ALTER TABLE "pages_locales" DROP COLUMN "form_title";
  ALTER TABLE "pages_locales" DROP COLUMN "form_summary";
  ALTER TABLE "pages_locales" DROP COLUMN "hero_media_label";
  ALTER TABLE "pages_locales" DROP COLUMN "standards_title";
  ALTER TABLE "pages_locales" DROP COLUMN "record_title";
  ALTER TABLE "pages_locales" DROP COLUMN "record_summary";
  ALTER TABLE "pages_locales" DROP COLUMN "current_title";
  ALTER TABLE "pages_locales" DROP COLUMN "flow_title";
  ALTER TABLE "pages_locales" DROP COLUMN "secondary_c_t_a_label";
  ALTER TABLE "pages_locales" DROP COLUMN "empty_eyebrow";
  ALTER TABLE "pages_locales" DROP COLUMN "empty_title";
  ALTER TABLE "pages_locales" DROP COLUMN "empty_summary";
  ALTER TABLE "pages_locales" DROP COLUMN "empty_action";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_method_eyebrow";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_method_title";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_clients_title";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_clients_summary";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_private_title";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_corporate_title";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_directions_title";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_cta_title";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_cta_summary";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_form_title";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_form_summary";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_hero_media_label";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_standards_title";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_record_title";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_record_summary";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_current_title";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_flow_title";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_secondary_c_t_a_label";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_empty_eyebrow";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_empty_title";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_empty_summary";
  ALTER TABLE "_pages_v_locales" DROP COLUMN "version_empty_action";
  ALTER TABLE "home" DROP COLUMN "section_media_research_id";
  ALTER TABLE "home" DROP COLUMN "section_media_imagine_id";
  ALTER TABLE "home" DROP COLUMN "section_media_create_id";
  ALTER TABLE "home" DROP COLUMN "section_media_directions_id";
  ALTER TABLE "home" DROP COLUMN "section_media_studio_id";
  ALTER TABLE "home" DROP COLUMN "section_media_portfolio_id";
  ALTER TABLE "home_locales" DROP COLUMN "service_intro";
  ALTER TABLE "home_locales" DROP COLUMN "price_note";
  ALTER TABLE "home_locales" DROP COLUMN "method_eyebrow";
  ALTER TABLE "home_locales" DROP COLUMN "method_title";
  ALTER TABLE "home_locales" DROP COLUMN "studio_eyebrow";
  ALTER TABLE "home_locales" DROP COLUMN "studio_title";
  ALTER TABLE "home_locales" DROP COLUMN "service_rail_title";
  ALTER TABLE "home_locales" DROP COLUMN "collection_rail_title";
  ALTER TABLE "home_locales" DROP COLUMN "portfolio_note";
  ALTER TABLE "home_locales" DROP COLUMN "portfolio_title";
  ALTER TABLE "home_locales" DROP COLUMN "portfolio_summary";
  ALTER TABLE "home_locales" DROP COLUMN "faq_title";
  ALTER TABLE "_home_v" DROP COLUMN "version_section_media_research_id";
  ALTER TABLE "_home_v" DROP COLUMN "version_section_media_imagine_id";
  ALTER TABLE "_home_v" DROP COLUMN "version_section_media_create_id";
  ALTER TABLE "_home_v" DROP COLUMN "version_section_media_directions_id";
  ALTER TABLE "_home_v" DROP COLUMN "version_section_media_studio_id";
  ALTER TABLE "_home_v" DROP COLUMN "version_section_media_portfolio_id";
  ALTER TABLE "_home_v_locales" DROP COLUMN "version_service_intro";
  ALTER TABLE "_home_v_locales" DROP COLUMN "version_price_note";
  ALTER TABLE "_home_v_locales" DROP COLUMN "version_method_eyebrow";
  ALTER TABLE "_home_v_locales" DROP COLUMN "version_method_title";
  ALTER TABLE "_home_v_locales" DROP COLUMN "version_studio_eyebrow";
  ALTER TABLE "_home_v_locales" DROP COLUMN "version_studio_title";
  ALTER TABLE "_home_v_locales" DROP COLUMN "version_service_rail_title";
  ALTER TABLE "_home_v_locales" DROP COLUMN "version_collection_rail_title";
  ALTER TABLE "_home_v_locales" DROP COLUMN "version_portfolio_note";
  ALTER TABLE "_home_v_locales" DROP COLUMN "version_portfolio_title";
  ALTER TABLE "_home_v_locales" DROP COLUMN "version_portfolio_summary";
  ALTER TABLE "_home_v_locales" DROP COLUMN "version_faq_title";
  ALTER TABLE "site_settings" DROP COLUMN "contacts_action_path";
  ALTER TABLE "site_settings" DROP COLUMN "contacts_viber_u_r_l";
  ALTER TABLE "site_settings_locales" DROP COLUMN "contacts_city";
  ALTER TABLE "site_settings_locales" DROP COLUMN "contacts_action_label";
  ALTER TABLE "site_settings_locales" DROP COLUMN "ui_labels_language";
  ALTER TABLE "site_settings_locales" DROP COLUMN "ui_labels_close";
  ALTER TABLE "site_settings_locales" DROP COLUMN "ui_labels_external_link";`)
}
