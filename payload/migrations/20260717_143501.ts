import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_directions_blocks_media_text_media_position" AS ENUM('start', 'end');
  CREATE TYPE "public"."enum__directions_v_blocks_media_text_media_position" AS ENUM('start', 'end');
  CREATE TYPE "public"."enum_services_blocks_media_text_media_position" AS ENUM('start', 'end');
  CREATE TYPE "public"."enum__services_v_blocks_media_text_media_position" AS ENUM('start', 'end');
  CREATE TYPE "public"."enum_courses_blocks_media_text_media_position" AS ENUM('start', 'end');
  CREATE TYPE "public"."enum__courses_v_blocks_media_text_media_position" AS ENUM('start', 'end');
  CREATE TYPE "public"."enum_fashion_collections_blocks_media_text_media_position" AS ENUM('start', 'end');
  CREATE TYPE "public"."enum__fashion_collections_v_blocks_media_text_media_position" AS ENUM('start', 'end');
  CREATE TYPE "public"."enum_pages_blocks_media_text_media_position" AS ENUM('start', 'end');
  CREATE TYPE "public"."enum__pages_v_blocks_media_text_media_position" AS ENUM('start', 'end');
  CREATE TABLE "directions_blocks_rich_text" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"body" varchar,
	"block_name" varchar
  );

  CREATE TABLE "directions_blocks_media_text" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"body" varchar,
	"media_id" uuid,
	"media_position" "enum_directions_blocks_media_text_media_position" DEFAULT 'start',
	"block_name" varchar
  );

  CREATE TABLE "directions_blocks_feature_grid_items" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar
  );

  CREATE TABLE "directions_blocks_feature_grid" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "directions_blocks_steps_items" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar
  );

  CREATE TABLE "directions_blocks_steps" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "directions_blocks_relation_grid" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "directions_blocks_gallery" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "directions_blocks_testimonials" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "directions_blocks_faq_items" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"question" varchar,
	"answer" varchar
  );

  CREATE TABLE "directions_blocks_faq" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "directions_blocks_cta" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"body" varchar,
	"label" varchar,
	"path" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_directions_v_blocks_rich_text" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"body" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_directions_v_blocks_media_text" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"body" varchar,
	"media_id" uuid,
	"media_position" "enum__directions_v_blocks_media_text_media_position" DEFAULT 'start',
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_directions_v_blocks_feature_grid_items" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_directions_v_blocks_feature_grid" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_directions_v_blocks_steps_items" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_directions_v_blocks_steps" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_directions_v_blocks_relation_grid" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_directions_v_blocks_gallery" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_directions_v_blocks_testimonials" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_directions_v_blocks_faq_items" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" varchar,
	"answer" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_directions_v_blocks_faq" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_directions_v_blocks_cta" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"body" varchar,
	"label" varchar,
	"path" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "services_blocks_rich_text" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"body" varchar,
	"block_name" varchar
  );

  CREATE TABLE "services_blocks_media_text" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"body" varchar,
	"media_id" uuid,
	"media_position" "enum_services_blocks_media_text_media_position" DEFAULT 'start',
	"block_name" varchar
  );

  CREATE TABLE "services_blocks_feature_grid_items" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar
  );

  CREATE TABLE "services_blocks_feature_grid" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "services_blocks_steps_items" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar
  );

  CREATE TABLE "services_blocks_steps" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "services_blocks_relation_grid" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "services_blocks_gallery" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "services_blocks_testimonials" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "services_blocks_faq_items" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"question" varchar,
	"answer" varchar
  );

  CREATE TABLE "services_blocks_faq" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "services_blocks_cta" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"body" varchar,
	"label" varchar,
	"path" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_services_v_blocks_rich_text" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"body" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_services_v_blocks_media_text" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"body" varchar,
	"media_id" uuid,
	"media_position" "enum__services_v_blocks_media_text_media_position" DEFAULT 'start',
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_services_v_blocks_feature_grid_items" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_services_v_blocks_feature_grid" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_services_v_blocks_steps_items" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_services_v_blocks_steps" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_services_v_blocks_relation_grid" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_services_v_blocks_gallery" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_services_v_blocks_testimonials" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_services_v_blocks_faq_items" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" varchar,
	"answer" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_services_v_blocks_faq" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_services_v_blocks_cta" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"body" varchar,
	"label" varchar,
	"path" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "courses_blocks_rich_text" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"body" varchar,
	"block_name" varchar
  );

  CREATE TABLE "courses_blocks_media_text" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"body" varchar,
	"media_id" uuid,
	"media_position" "enum_courses_blocks_media_text_media_position" DEFAULT 'start',
	"block_name" varchar
  );

  CREATE TABLE "courses_blocks_feature_grid_items" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar
  );

  CREATE TABLE "courses_blocks_feature_grid" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "courses_blocks_steps_items" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar
  );

  CREATE TABLE "courses_blocks_steps" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "courses_blocks_relation_grid" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "courses_blocks_gallery" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "courses_blocks_testimonials" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "courses_blocks_faq_items" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"question" varchar,
	"answer" varchar
  );

  CREATE TABLE "courses_blocks_faq" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "courses_blocks_cta" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"body" varchar,
	"label" varchar,
	"path" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_courses_v_blocks_rich_text" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"body" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_courses_v_blocks_media_text" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"body" varchar,
	"media_id" uuid,
	"media_position" "enum__courses_v_blocks_media_text_media_position" DEFAULT 'start',
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_courses_v_blocks_feature_grid_items" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_courses_v_blocks_feature_grid" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_courses_v_blocks_steps_items" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_courses_v_blocks_steps" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_courses_v_blocks_relation_grid" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_courses_v_blocks_gallery" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_courses_v_blocks_testimonials" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_courses_v_blocks_faq_items" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" varchar,
	"answer" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_courses_v_blocks_faq" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_courses_v_blocks_cta" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"body" varchar,
	"label" varchar,
	"path" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "fashion_collections_blocks_rich_text" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"body" varchar,
	"block_name" varchar
  );

  CREATE TABLE "fashion_collections_blocks_media_text" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"body" varchar,
	"media_id" uuid,
	"media_position" "enum_fashion_collections_blocks_media_text_media_position" DEFAULT 'start',
	"block_name" varchar
  );

  CREATE TABLE "fashion_collections_blocks_feature_grid_items" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar
  );

  CREATE TABLE "fashion_collections_blocks_feature_grid" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "fashion_collections_blocks_steps_items" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar
  );

  CREATE TABLE "fashion_collections_blocks_steps" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "fashion_collections_blocks_relation_grid" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "fashion_collections_blocks_gallery" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "fashion_collections_blocks_testimonials" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "fashion_collections_blocks_faq_items" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"question" varchar,
	"answer" varchar
  );

  CREATE TABLE "fashion_collections_blocks_faq" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "fashion_collections_blocks_cta" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"body" varchar,
	"label" varchar,
	"path" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_fashion_collections_v_blocks_rich_text" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"body" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_fashion_collections_v_blocks_media_text" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"body" varchar,
	"media_id" uuid,
	"media_position" "enum__fashion_collections_v_blocks_media_text_media_position" DEFAULT 'start',
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_fashion_collections_v_blocks_feature_grid_items" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_fashion_collections_v_blocks_feature_grid" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_fashion_collections_v_blocks_steps_items" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_fashion_collections_v_blocks_steps" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_fashion_collections_v_blocks_relation_grid" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_fashion_collections_v_blocks_gallery" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_fashion_collections_v_blocks_testimonials" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_fashion_collections_v_blocks_faq_items" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" varchar,
	"answer" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_fashion_collections_v_blocks_faq" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_fashion_collections_v_blocks_cta" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"body" varchar,
	"label" varchar,
	"path" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "pages_blocks_rich_text" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"body" varchar,
	"block_name" varchar
  );

  CREATE TABLE "pages_blocks_media_text" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"body" varchar,
	"media_id" uuid,
	"media_position" "enum_pages_blocks_media_text_media_position" DEFAULT 'start',
	"block_name" varchar
  );

  CREATE TABLE "pages_blocks_feature_grid_items" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar
  );

  CREATE TABLE "pages_blocks_feature_grid" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "pages_blocks_steps_items" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"text" varchar
  );

  CREATE TABLE "pages_blocks_steps" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "pages_blocks_relation_grid" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "pages_blocks_gallery" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "pages_blocks_testimonials" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "pages_blocks_faq_items" (
	"_order" integer NOT NULL,
	"_parent_id" varchar NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"question" varchar,
	"answer" varchar
  );

  CREATE TABLE "pages_blocks_faq" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"block_name" varchar
  );

  CREATE TABLE "pages_blocks_cta" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"heading" varchar,
	"body" varchar,
	"label" varchar,
	"path" varchar,
	"block_name" varchar
  );

  CREATE TABLE "pages_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"locale" "_locales",
	"services_id" uuid,
	"courses_id" uuid,
	"fashion_collections_id" uuid,
	"portfolio_cases_id" uuid,
	"media_id" uuid,
	"testimonials_id" uuid
  );

  CREATE TABLE "_pages_v_blocks_rich_text" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"body" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_media_text" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"body" varchar,
	"media_id" uuid,
	"media_position" "enum__pages_v_blocks_media_text_media_position" DEFAULT 'start',
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_feature_grid_items" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_pages_v_blocks_feature_grid" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_steps_items" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar,
	"text" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_pages_v_blocks_steps" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_relation_grid" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_gallery" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_testimonials" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_faq_items" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" varchar,
	"answer" varchar,
	"_uuid" varchar
  );

  CREATE TABLE "_pages_v_blocks_faq" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_cta" (
	"_order" integer NOT NULL,
	"_parent_id" uuid NOT NULL,
	"_path" text NOT NULL,
	"_locale" "_locales" NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heading" varchar,
	"body" varchar,
	"label" varchar,
	"path" varchar,
	"_uuid" varchar,
	"block_name" varchar
  );

  CREATE TABLE "_pages_v_rels" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer,
	"parent_id" uuid NOT NULL,
	"path" varchar NOT NULL,
	"locale" "_locales",
	"services_id" uuid,
	"courses_id" uuid,
	"fashion_collections_id" uuid,
	"portfolio_cases_id" uuid,
	"media_id" uuid,
	"testimonials_id" uuid
  );

  DROP INDEX "directions_rels_services_id_idx";
  DROP INDEX "directions_rels_courses_id_idx";
  DROP INDEX "directions_rels_fashion_collections_id_idx";
  DROP INDEX "_directions_v_rels_services_id_idx";
  DROP INDEX "_directions_v_rels_courses_id_idx";
  DROP INDEX "_directions_v_rels_fashion_collections_id_idx";
  DROP INDEX "services_rels_directions_id_idx";
  DROP INDEX "services_rels_media_id_idx";
  DROP INDEX "services_rels_offers_id_idx";
  DROP INDEX "services_rels_portfolio_cases_id_idx";
  DROP INDEX "services_rels_services_id_idx";
  DROP INDEX "services_rels_courses_id_idx";
  DROP INDEX "services_rels_fashion_collections_id_idx";
  DROP INDEX "_services_v_rels_directions_id_idx";
  DROP INDEX "_services_v_rels_media_id_idx";
  DROP INDEX "_services_v_rels_offers_id_idx";
  DROP INDEX "_services_v_rels_portfolio_cases_id_idx";
  DROP INDEX "_services_v_rels_services_id_idx";
  DROP INDEX "_services_v_rels_courses_id_idx";
  DROP INDEX "_services_v_rels_fashion_collections_id_idx";
  DROP INDEX "courses_rels_offers_id_idx";
  DROP INDEX "courses_rels_media_id_idx";
  DROP INDEX "courses_rels_services_id_idx";
  DROP INDEX "courses_rels_fashion_collections_id_idx";
  DROP INDEX "_courses_v_rels_offers_id_idx";
  DROP INDEX "_courses_v_rels_media_id_idx";
  DROP INDEX "_courses_v_rels_services_id_idx";
  DROP INDEX "_courses_v_rels_fashion_collections_id_idx";
  DROP INDEX "fashion_collections_rels_media_id_idx";
  DROP INDEX "fashion_collections_rels_offers_id_idx";
  DROP INDEX "fashion_collections_rels_services_id_idx";
  DROP INDEX "_fashion_collections_v_rels_media_id_idx";
  DROP INDEX "_fashion_collections_v_rels_offers_id_idx";
  DROP INDEX "_fashion_collections_v_rels_services_id_idx";
  ALTER TABLE "directions_rels" ADD COLUMN "locale" "_locales";
  ALTER TABLE "directions_rels" ADD COLUMN "portfolio_cases_id" uuid;
  ALTER TABLE "directions_rels" ADD COLUMN "media_id" uuid;
  ALTER TABLE "directions_rels" ADD COLUMN "testimonials_id" uuid;
  ALTER TABLE "_directions_v_rels" ADD COLUMN "locale" "_locales";
  ALTER TABLE "_directions_v_rels" ADD COLUMN "portfolio_cases_id" uuid;
  ALTER TABLE "_directions_v_rels" ADD COLUMN "media_id" uuid;
  ALTER TABLE "_directions_v_rels" ADD COLUMN "testimonials_id" uuid;
  ALTER TABLE "services_rels" ADD COLUMN "locale" "_locales";
  ALTER TABLE "services_rels" ADD COLUMN "testimonials_id" uuid;
  ALTER TABLE "_services_v_rels" ADD COLUMN "locale" "_locales";
  ALTER TABLE "_services_v_rels" ADD COLUMN "testimonials_id" uuid;
  ALTER TABLE "courses_rels" ADD COLUMN "locale" "_locales";
  ALTER TABLE "courses_rels" ADD COLUMN "courses_id" uuid;
  ALTER TABLE "courses_rels" ADD COLUMN "portfolio_cases_id" uuid;
  ALTER TABLE "courses_rels" ADD COLUMN "testimonials_id" uuid;
  ALTER TABLE "_courses_v_rels" ADD COLUMN "locale" "_locales";
  ALTER TABLE "_courses_v_rels" ADD COLUMN "courses_id" uuid;
  ALTER TABLE "_courses_v_rels" ADD COLUMN "portfolio_cases_id" uuid;
  ALTER TABLE "_courses_v_rels" ADD COLUMN "testimonials_id" uuid;
  ALTER TABLE "fashion_collections_rels" ADD COLUMN "locale" "_locales";
  ALTER TABLE "fashion_collections_rels" ADD COLUMN "courses_id" uuid;
  ALTER TABLE "fashion_collections_rels" ADD COLUMN "fashion_collections_id" uuid;
  ALTER TABLE "fashion_collections_rels" ADD COLUMN "portfolio_cases_id" uuid;
  ALTER TABLE "fashion_collections_rels" ADD COLUMN "testimonials_id" uuid;
  ALTER TABLE "_fashion_collections_v_rels" ADD COLUMN "locale" "_locales";
  ALTER TABLE "_fashion_collections_v_rels" ADD COLUMN "courses_id" uuid;
  ALTER TABLE "_fashion_collections_v_rels" ADD COLUMN "fashion_collections_id" uuid;
  ALTER TABLE "_fashion_collections_v_rels" ADD COLUMN "portfolio_cases_id" uuid;
  ALTER TABLE "_fashion_collections_v_rels" ADD COLUMN "testimonials_id" uuid;
  ALTER TABLE "directions_blocks_rich_text" ADD CONSTRAINT "directions_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."directions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "directions_blocks_media_text" ADD CONSTRAINT "directions_blocks_media_text_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "directions_blocks_media_text" ADD CONSTRAINT "directions_blocks_media_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."directions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "directions_blocks_feature_grid_items" ADD CONSTRAINT "directions_blocks_feature_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."directions_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "directions_blocks_feature_grid" ADD CONSTRAINT "directions_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."directions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "directions_blocks_steps_items" ADD CONSTRAINT "directions_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."directions_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "directions_blocks_steps" ADD CONSTRAINT "directions_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."directions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "directions_blocks_relation_grid" ADD CONSTRAINT "directions_blocks_relation_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."directions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "directions_blocks_gallery" ADD CONSTRAINT "directions_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."directions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "directions_blocks_testimonials" ADD CONSTRAINT "directions_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."directions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "directions_blocks_faq_items" ADD CONSTRAINT "directions_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."directions_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "directions_blocks_faq" ADD CONSTRAINT "directions_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."directions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "directions_blocks_cta" ADD CONSTRAINT "directions_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."directions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_directions_v_blocks_rich_text" ADD CONSTRAINT "_directions_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_directions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_directions_v_blocks_media_text" ADD CONSTRAINT "_directions_v_blocks_media_text_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_directions_v_blocks_media_text" ADD CONSTRAINT "_directions_v_blocks_media_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_directions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_directions_v_blocks_feature_grid_items" ADD CONSTRAINT "_directions_v_blocks_feature_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_directions_v_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_directions_v_blocks_feature_grid" ADD CONSTRAINT "_directions_v_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_directions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_directions_v_blocks_steps_items" ADD CONSTRAINT "_directions_v_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_directions_v_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_directions_v_blocks_steps" ADD CONSTRAINT "_directions_v_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_directions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_directions_v_blocks_relation_grid" ADD CONSTRAINT "_directions_v_blocks_relation_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_directions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_directions_v_blocks_gallery" ADD CONSTRAINT "_directions_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_directions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_directions_v_blocks_testimonials" ADD CONSTRAINT "_directions_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_directions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_directions_v_blocks_faq_items" ADD CONSTRAINT "_directions_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_directions_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_directions_v_blocks_faq" ADD CONSTRAINT "_directions_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_directions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_directions_v_blocks_cta" ADD CONSTRAINT "_directions_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_directions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_rich_text" ADD CONSTRAINT "services_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_media_text" ADD CONSTRAINT "services_blocks_media_text_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_blocks_media_text" ADD CONSTRAINT "services_blocks_media_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_feature_grid_items" ADD CONSTRAINT "services_blocks_feature_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_feature_grid" ADD CONSTRAINT "services_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_steps_items" ADD CONSTRAINT "services_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_steps" ADD CONSTRAINT "services_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_relation_grid" ADD CONSTRAINT "services_blocks_relation_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_gallery" ADD CONSTRAINT "services_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_testimonials" ADD CONSTRAINT "services_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_faq_items" ADD CONSTRAINT "services_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_faq" ADD CONSTRAINT "services_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_blocks_cta" ADD CONSTRAINT "services_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_rich_text" ADD CONSTRAINT "_services_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_media_text" ADD CONSTRAINT "_services_v_blocks_media_text_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_media_text" ADD CONSTRAINT "_services_v_blocks_media_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_feature_grid_items" ADD CONSTRAINT "_services_v_blocks_feature_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_feature_grid" ADD CONSTRAINT "_services_v_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_steps_items" ADD CONSTRAINT "_services_v_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_steps" ADD CONSTRAINT "_services_v_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_relation_grid" ADD CONSTRAINT "_services_v_blocks_relation_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_gallery" ADD CONSTRAINT "_services_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_testimonials" ADD CONSTRAINT "_services_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_faq_items" ADD CONSTRAINT "_services_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_faq" ADD CONSTRAINT "_services_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_blocks_cta" ADD CONSTRAINT "_services_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_blocks_rich_text" ADD CONSTRAINT "courses_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_blocks_media_text" ADD CONSTRAINT "courses_blocks_media_text_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses_blocks_media_text" ADD CONSTRAINT "courses_blocks_media_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_blocks_feature_grid_items" ADD CONSTRAINT "courses_blocks_feature_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_blocks_feature_grid" ADD CONSTRAINT "courses_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_blocks_steps_items" ADD CONSTRAINT "courses_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_blocks_steps" ADD CONSTRAINT "courses_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_blocks_relation_grid" ADD CONSTRAINT "courses_blocks_relation_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_blocks_gallery" ADD CONSTRAINT "courses_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_blocks_testimonials" ADD CONSTRAINT "courses_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_blocks_faq_items" ADD CONSTRAINT "courses_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_blocks_faq" ADD CONSTRAINT "courses_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_blocks_cta" ADD CONSTRAINT "courses_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_blocks_rich_text" ADD CONSTRAINT "_courses_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_blocks_media_text" ADD CONSTRAINT "_courses_v_blocks_media_text_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v_blocks_media_text" ADD CONSTRAINT "_courses_v_blocks_media_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_blocks_feature_grid_items" ADD CONSTRAINT "_courses_v_blocks_feature_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_blocks_feature_grid" ADD CONSTRAINT "_courses_v_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_blocks_steps_items" ADD CONSTRAINT "_courses_v_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_blocks_steps" ADD CONSTRAINT "_courses_v_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_blocks_relation_grid" ADD CONSTRAINT "_courses_v_blocks_relation_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_blocks_gallery" ADD CONSTRAINT "_courses_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_blocks_testimonials" ADD CONSTRAINT "_courses_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_blocks_faq_items" ADD CONSTRAINT "_courses_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_blocks_faq" ADD CONSTRAINT "_courses_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_blocks_cta" ADD CONSTRAINT "_courses_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections_blocks_rich_text" ADD CONSTRAINT "fashion_collections_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections_blocks_media_text" ADD CONSTRAINT "fashion_collections_blocks_media_text_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "fashion_collections_blocks_media_text" ADD CONSTRAINT "fashion_collections_blocks_media_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections_blocks_feature_grid_items" ADD CONSTRAINT "fashion_collections_blocks_feature_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fashion_collections_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections_blocks_feature_grid" ADD CONSTRAINT "fashion_collections_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections_blocks_steps_items" ADD CONSTRAINT "fashion_collections_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fashion_collections_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections_blocks_steps" ADD CONSTRAINT "fashion_collections_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections_blocks_relation_grid" ADD CONSTRAINT "fashion_collections_blocks_relation_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections_blocks_gallery" ADD CONSTRAINT "fashion_collections_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections_blocks_testimonials" ADD CONSTRAINT "fashion_collections_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections_blocks_faq_items" ADD CONSTRAINT "fashion_collections_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fashion_collections_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections_blocks_faq" ADD CONSTRAINT "fashion_collections_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections_blocks_cta" ADD CONSTRAINT "fashion_collections_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_blocks_rich_text" ADD CONSTRAINT "_fashion_collections_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_fashion_collections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_blocks_media_text" ADD CONSTRAINT "_fashion_collections_v_blocks_media_text_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_blocks_media_text" ADD CONSTRAINT "_fashion_collections_v_blocks_media_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_fashion_collections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_blocks_feature_grid_items" ADD CONSTRAINT "_fashion_collections_v_blocks_feature_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_fashion_collections_v_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_blocks_feature_grid" ADD CONSTRAINT "_fashion_collections_v_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_fashion_collections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_blocks_steps_items" ADD CONSTRAINT "_fashion_collections_v_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_fashion_collections_v_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_blocks_steps" ADD CONSTRAINT "_fashion_collections_v_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_fashion_collections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_blocks_relation_grid" ADD CONSTRAINT "_fashion_collections_v_blocks_relation_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_fashion_collections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_blocks_gallery" ADD CONSTRAINT "_fashion_collections_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_fashion_collections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_blocks_testimonials" ADD CONSTRAINT "_fashion_collections_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_fashion_collections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_blocks_faq_items" ADD CONSTRAINT "_fashion_collections_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_fashion_collections_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_blocks_faq" ADD CONSTRAINT "_fashion_collections_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_fashion_collections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_blocks_cta" ADD CONSTRAINT "_fashion_collections_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_fashion_collections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_text" ADD CONSTRAINT "pages_blocks_media_text_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_text" ADD CONSTRAINT "pages_blocks_media_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_grid_items" ADD CONSTRAINT "pages_blocks_feature_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_grid" ADD CONSTRAINT "pages_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps_items" ADD CONSTRAINT "pages_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps" ADD CONSTRAINT "pages_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_relation_grid" ADD CONSTRAINT "pages_blocks_relation_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery" ADD CONSTRAINT "pages_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials" ADD CONSTRAINT "pages_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_fashion_collections_fk" FOREIGN KEY ("fashion_collections_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_portfolio_cases_fk" FOREIGN KEY ("portfolio_cases_id") REFERENCES "public"."portfolio_cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_text" ADD CONSTRAINT "_pages_v_blocks_media_text_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_text" ADD CONSTRAINT "_pages_v_blocks_media_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_grid_items" ADD CONSTRAINT "_pages_v_blocks_feature_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_grid" ADD CONSTRAINT "_pages_v_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps_items" ADD CONSTRAINT "_pages_v_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_steps" ADD CONSTRAINT "_pages_v_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_relation_grid" ADD CONSTRAINT "_pages_v_blocks_relation_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery" ADD CONSTRAINT "_pages_v_blocks_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items" ADD CONSTRAINT "_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_fashion_collections_fk" FOREIGN KEY ("fashion_collections_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_portfolio_cases_fk" FOREIGN KEY ("portfolio_cases_id") REFERENCES "public"."portfolio_cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "directions_blocks_rich_text_order_idx" ON "directions_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "directions_blocks_rich_text_parent_id_idx" ON "directions_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "directions_blocks_rich_text_path_idx" ON "directions_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "directions_blocks_rich_text_locale_idx" ON "directions_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "directions_blocks_media_text_order_idx" ON "directions_blocks_media_text" USING btree ("_order");
  CREATE INDEX "directions_blocks_media_text_parent_id_idx" ON "directions_blocks_media_text" USING btree ("_parent_id");
  CREATE INDEX "directions_blocks_media_text_path_idx" ON "directions_blocks_media_text" USING btree ("_path");
  CREATE INDEX "directions_blocks_media_text_locale_idx" ON "directions_blocks_media_text" USING btree ("_locale");
  CREATE INDEX "directions_blocks_media_text_media_idx" ON "directions_blocks_media_text" USING btree ("media_id");
  CREATE INDEX "directions_blocks_feature_grid_items_order_idx" ON "directions_blocks_feature_grid_items" USING btree ("_order");
  CREATE INDEX "directions_blocks_feature_grid_items_parent_id_idx" ON "directions_blocks_feature_grid_items" USING btree ("_parent_id");
  CREATE INDEX "directions_blocks_feature_grid_items_locale_idx" ON "directions_blocks_feature_grid_items" USING btree ("_locale");
  CREATE INDEX "directions_blocks_feature_grid_order_idx" ON "directions_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "directions_blocks_feature_grid_parent_id_idx" ON "directions_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "directions_blocks_feature_grid_path_idx" ON "directions_blocks_feature_grid" USING btree ("_path");
  CREATE INDEX "directions_blocks_feature_grid_locale_idx" ON "directions_blocks_feature_grid" USING btree ("_locale");
  CREATE INDEX "directions_blocks_steps_items_order_idx" ON "directions_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "directions_blocks_steps_items_parent_id_idx" ON "directions_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "directions_blocks_steps_items_locale_idx" ON "directions_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "directions_blocks_steps_order_idx" ON "directions_blocks_steps" USING btree ("_order");
  CREATE INDEX "directions_blocks_steps_parent_id_idx" ON "directions_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "directions_blocks_steps_path_idx" ON "directions_blocks_steps" USING btree ("_path");
  CREATE INDEX "directions_blocks_steps_locale_idx" ON "directions_blocks_steps" USING btree ("_locale");
  CREATE INDEX "directions_blocks_relation_grid_order_idx" ON "directions_blocks_relation_grid" USING btree ("_order");
  CREATE INDEX "directions_blocks_relation_grid_parent_id_idx" ON "directions_blocks_relation_grid" USING btree ("_parent_id");
  CREATE INDEX "directions_blocks_relation_grid_path_idx" ON "directions_blocks_relation_grid" USING btree ("_path");
  CREATE INDEX "directions_blocks_relation_grid_locale_idx" ON "directions_blocks_relation_grid" USING btree ("_locale");
  CREATE INDEX "directions_blocks_gallery_order_idx" ON "directions_blocks_gallery" USING btree ("_order");
  CREATE INDEX "directions_blocks_gallery_parent_id_idx" ON "directions_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "directions_blocks_gallery_path_idx" ON "directions_blocks_gallery" USING btree ("_path");
  CREATE INDEX "directions_blocks_gallery_locale_idx" ON "directions_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "directions_blocks_testimonials_order_idx" ON "directions_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "directions_blocks_testimonials_parent_id_idx" ON "directions_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "directions_blocks_testimonials_path_idx" ON "directions_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "directions_blocks_testimonials_locale_idx" ON "directions_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "directions_blocks_faq_items_order_idx" ON "directions_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "directions_blocks_faq_items_parent_id_idx" ON "directions_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "directions_blocks_faq_items_locale_idx" ON "directions_blocks_faq_items" USING btree ("_locale");
  CREATE INDEX "directions_blocks_faq_order_idx" ON "directions_blocks_faq" USING btree ("_order");
  CREATE INDEX "directions_blocks_faq_parent_id_idx" ON "directions_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "directions_blocks_faq_path_idx" ON "directions_blocks_faq" USING btree ("_path");
  CREATE INDEX "directions_blocks_faq_locale_idx" ON "directions_blocks_faq" USING btree ("_locale");
  CREATE INDEX "directions_blocks_cta_order_idx" ON "directions_blocks_cta" USING btree ("_order");
  CREATE INDEX "directions_blocks_cta_parent_id_idx" ON "directions_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "directions_blocks_cta_path_idx" ON "directions_blocks_cta" USING btree ("_path");
  CREATE INDEX "directions_blocks_cta_locale_idx" ON "directions_blocks_cta" USING btree ("_locale");
  CREATE INDEX "_directions_v_blocks_rich_text_order_idx" ON "_directions_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_directions_v_blocks_rich_text_parent_id_idx" ON "_directions_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_directions_v_blocks_rich_text_path_idx" ON "_directions_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_directions_v_blocks_rich_text_locale_idx" ON "_directions_v_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "_directions_v_blocks_media_text_order_idx" ON "_directions_v_blocks_media_text" USING btree ("_order");
  CREATE INDEX "_directions_v_blocks_media_text_parent_id_idx" ON "_directions_v_blocks_media_text" USING btree ("_parent_id");
  CREATE INDEX "_directions_v_blocks_media_text_path_idx" ON "_directions_v_blocks_media_text" USING btree ("_path");
  CREATE INDEX "_directions_v_blocks_media_text_locale_idx" ON "_directions_v_blocks_media_text" USING btree ("_locale");
  CREATE INDEX "_directions_v_blocks_media_text_media_idx" ON "_directions_v_blocks_media_text" USING btree ("media_id");
  CREATE INDEX "_directions_v_blocks_feature_grid_items_order_idx" ON "_directions_v_blocks_feature_grid_items" USING btree ("_order");
  CREATE INDEX "_directions_v_blocks_feature_grid_items_parent_id_idx" ON "_directions_v_blocks_feature_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_directions_v_blocks_feature_grid_items_locale_idx" ON "_directions_v_blocks_feature_grid_items" USING btree ("_locale");
  CREATE INDEX "_directions_v_blocks_feature_grid_order_idx" ON "_directions_v_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "_directions_v_blocks_feature_grid_parent_id_idx" ON "_directions_v_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "_directions_v_blocks_feature_grid_path_idx" ON "_directions_v_blocks_feature_grid" USING btree ("_path");
  CREATE INDEX "_directions_v_blocks_feature_grid_locale_idx" ON "_directions_v_blocks_feature_grid" USING btree ("_locale");
  CREATE INDEX "_directions_v_blocks_steps_items_order_idx" ON "_directions_v_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "_directions_v_blocks_steps_items_parent_id_idx" ON "_directions_v_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "_directions_v_blocks_steps_items_locale_idx" ON "_directions_v_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "_directions_v_blocks_steps_order_idx" ON "_directions_v_blocks_steps" USING btree ("_order");
  CREATE INDEX "_directions_v_blocks_steps_parent_id_idx" ON "_directions_v_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "_directions_v_blocks_steps_path_idx" ON "_directions_v_blocks_steps" USING btree ("_path");
  CREATE INDEX "_directions_v_blocks_steps_locale_idx" ON "_directions_v_blocks_steps" USING btree ("_locale");
  CREATE INDEX "_directions_v_blocks_relation_grid_order_idx" ON "_directions_v_blocks_relation_grid" USING btree ("_order");
  CREATE INDEX "_directions_v_blocks_relation_grid_parent_id_idx" ON "_directions_v_blocks_relation_grid" USING btree ("_parent_id");
  CREATE INDEX "_directions_v_blocks_relation_grid_path_idx" ON "_directions_v_blocks_relation_grid" USING btree ("_path");
  CREATE INDEX "_directions_v_blocks_relation_grid_locale_idx" ON "_directions_v_blocks_relation_grid" USING btree ("_locale");
  CREATE INDEX "_directions_v_blocks_gallery_order_idx" ON "_directions_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_directions_v_blocks_gallery_parent_id_idx" ON "_directions_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_directions_v_blocks_gallery_path_idx" ON "_directions_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_directions_v_blocks_gallery_locale_idx" ON "_directions_v_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "_directions_v_blocks_testimonials_order_idx" ON "_directions_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_directions_v_blocks_testimonials_parent_id_idx" ON "_directions_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_directions_v_blocks_testimonials_path_idx" ON "_directions_v_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_directions_v_blocks_testimonials_locale_idx" ON "_directions_v_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "_directions_v_blocks_faq_items_order_idx" ON "_directions_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_directions_v_blocks_faq_items_parent_id_idx" ON "_directions_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_directions_v_blocks_faq_items_locale_idx" ON "_directions_v_blocks_faq_items" USING btree ("_locale");
  CREATE INDEX "_directions_v_blocks_faq_order_idx" ON "_directions_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_directions_v_blocks_faq_parent_id_idx" ON "_directions_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_directions_v_blocks_faq_path_idx" ON "_directions_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_directions_v_blocks_faq_locale_idx" ON "_directions_v_blocks_faq" USING btree ("_locale");
  CREATE INDEX "_directions_v_blocks_cta_order_idx" ON "_directions_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_directions_v_blocks_cta_parent_id_idx" ON "_directions_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_directions_v_blocks_cta_path_idx" ON "_directions_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_directions_v_blocks_cta_locale_idx" ON "_directions_v_blocks_cta" USING btree ("_locale");
  CREATE INDEX "services_blocks_rich_text_order_idx" ON "services_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "services_blocks_rich_text_parent_id_idx" ON "services_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_rich_text_path_idx" ON "services_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "services_blocks_rich_text_locale_idx" ON "services_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "services_blocks_media_text_order_idx" ON "services_blocks_media_text" USING btree ("_order");
  CREATE INDEX "services_blocks_media_text_parent_id_idx" ON "services_blocks_media_text" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_media_text_path_idx" ON "services_blocks_media_text" USING btree ("_path");
  CREATE INDEX "services_blocks_media_text_locale_idx" ON "services_blocks_media_text" USING btree ("_locale");
  CREATE INDEX "services_blocks_media_text_media_idx" ON "services_blocks_media_text" USING btree ("media_id");
  CREATE INDEX "services_blocks_feature_grid_items_order_idx" ON "services_blocks_feature_grid_items" USING btree ("_order");
  CREATE INDEX "services_blocks_feature_grid_items_parent_id_idx" ON "services_blocks_feature_grid_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_feature_grid_items_locale_idx" ON "services_blocks_feature_grid_items" USING btree ("_locale");
  CREATE INDEX "services_blocks_feature_grid_order_idx" ON "services_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "services_blocks_feature_grid_parent_id_idx" ON "services_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_feature_grid_path_idx" ON "services_blocks_feature_grid" USING btree ("_path");
  CREATE INDEX "services_blocks_feature_grid_locale_idx" ON "services_blocks_feature_grid" USING btree ("_locale");
  CREATE INDEX "services_blocks_steps_items_order_idx" ON "services_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "services_blocks_steps_items_parent_id_idx" ON "services_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_steps_items_locale_idx" ON "services_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "services_blocks_steps_order_idx" ON "services_blocks_steps" USING btree ("_order");
  CREATE INDEX "services_blocks_steps_parent_id_idx" ON "services_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_steps_path_idx" ON "services_blocks_steps" USING btree ("_path");
  CREATE INDEX "services_blocks_steps_locale_idx" ON "services_blocks_steps" USING btree ("_locale");
  CREATE INDEX "services_blocks_relation_grid_order_idx" ON "services_blocks_relation_grid" USING btree ("_order");
  CREATE INDEX "services_blocks_relation_grid_parent_id_idx" ON "services_blocks_relation_grid" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_relation_grid_path_idx" ON "services_blocks_relation_grid" USING btree ("_path");
  CREATE INDEX "services_blocks_relation_grid_locale_idx" ON "services_blocks_relation_grid" USING btree ("_locale");
  CREATE INDEX "services_blocks_gallery_order_idx" ON "services_blocks_gallery" USING btree ("_order");
  CREATE INDEX "services_blocks_gallery_parent_id_idx" ON "services_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_gallery_path_idx" ON "services_blocks_gallery" USING btree ("_path");
  CREATE INDEX "services_blocks_gallery_locale_idx" ON "services_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "services_blocks_testimonials_order_idx" ON "services_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "services_blocks_testimonials_parent_id_idx" ON "services_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_testimonials_path_idx" ON "services_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "services_blocks_testimonials_locale_idx" ON "services_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "services_blocks_faq_items_order_idx" ON "services_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "services_blocks_faq_items_parent_id_idx" ON "services_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_faq_items_locale_idx" ON "services_blocks_faq_items" USING btree ("_locale");
  CREATE INDEX "services_blocks_faq_order_idx" ON "services_blocks_faq" USING btree ("_order");
  CREATE INDEX "services_blocks_faq_parent_id_idx" ON "services_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_faq_path_idx" ON "services_blocks_faq" USING btree ("_path");
  CREATE INDEX "services_blocks_faq_locale_idx" ON "services_blocks_faq" USING btree ("_locale");
  CREATE INDEX "services_blocks_cta_order_idx" ON "services_blocks_cta" USING btree ("_order");
  CREATE INDEX "services_blocks_cta_parent_id_idx" ON "services_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "services_blocks_cta_path_idx" ON "services_blocks_cta" USING btree ("_path");
  CREATE INDEX "services_blocks_cta_locale_idx" ON "services_blocks_cta" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_rich_text_order_idx" ON "_services_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_rich_text_parent_id_idx" ON "_services_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_rich_text_path_idx" ON "_services_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_rich_text_locale_idx" ON "_services_v_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_media_text_order_idx" ON "_services_v_blocks_media_text" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_media_text_parent_id_idx" ON "_services_v_blocks_media_text" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_media_text_path_idx" ON "_services_v_blocks_media_text" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_media_text_locale_idx" ON "_services_v_blocks_media_text" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_media_text_media_idx" ON "_services_v_blocks_media_text" USING btree ("media_id");
  CREATE INDEX "_services_v_blocks_feature_grid_items_order_idx" ON "_services_v_blocks_feature_grid_items" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_feature_grid_items_parent_id_idx" ON "_services_v_blocks_feature_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_feature_grid_items_locale_idx" ON "_services_v_blocks_feature_grid_items" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_feature_grid_order_idx" ON "_services_v_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_feature_grid_parent_id_idx" ON "_services_v_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_feature_grid_path_idx" ON "_services_v_blocks_feature_grid" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_feature_grid_locale_idx" ON "_services_v_blocks_feature_grid" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_steps_items_order_idx" ON "_services_v_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_steps_items_parent_id_idx" ON "_services_v_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_steps_items_locale_idx" ON "_services_v_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_steps_order_idx" ON "_services_v_blocks_steps" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_steps_parent_id_idx" ON "_services_v_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_steps_path_idx" ON "_services_v_blocks_steps" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_steps_locale_idx" ON "_services_v_blocks_steps" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_relation_grid_order_idx" ON "_services_v_blocks_relation_grid" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_relation_grid_parent_id_idx" ON "_services_v_blocks_relation_grid" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_relation_grid_path_idx" ON "_services_v_blocks_relation_grid" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_relation_grid_locale_idx" ON "_services_v_blocks_relation_grid" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_gallery_order_idx" ON "_services_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_gallery_parent_id_idx" ON "_services_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_gallery_path_idx" ON "_services_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_gallery_locale_idx" ON "_services_v_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_testimonials_order_idx" ON "_services_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_testimonials_parent_id_idx" ON "_services_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_testimonials_path_idx" ON "_services_v_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_testimonials_locale_idx" ON "_services_v_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_faq_items_order_idx" ON "_services_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_faq_items_parent_id_idx" ON "_services_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_faq_items_locale_idx" ON "_services_v_blocks_faq_items" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_faq_order_idx" ON "_services_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_faq_parent_id_idx" ON "_services_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_faq_path_idx" ON "_services_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_faq_locale_idx" ON "_services_v_blocks_faq" USING btree ("_locale");
  CREATE INDEX "_services_v_blocks_cta_order_idx" ON "_services_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_services_v_blocks_cta_parent_id_idx" ON "_services_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_services_v_blocks_cta_path_idx" ON "_services_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_services_v_blocks_cta_locale_idx" ON "_services_v_blocks_cta" USING btree ("_locale");
  CREATE INDEX "courses_blocks_rich_text_order_idx" ON "courses_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "courses_blocks_rich_text_parent_id_idx" ON "courses_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "courses_blocks_rich_text_path_idx" ON "courses_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "courses_blocks_rich_text_locale_idx" ON "courses_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "courses_blocks_media_text_order_idx" ON "courses_blocks_media_text" USING btree ("_order");
  CREATE INDEX "courses_blocks_media_text_parent_id_idx" ON "courses_blocks_media_text" USING btree ("_parent_id");
  CREATE INDEX "courses_blocks_media_text_path_idx" ON "courses_blocks_media_text" USING btree ("_path");
  CREATE INDEX "courses_blocks_media_text_locale_idx" ON "courses_blocks_media_text" USING btree ("_locale");
  CREATE INDEX "courses_blocks_media_text_media_idx" ON "courses_blocks_media_text" USING btree ("media_id");
  CREATE INDEX "courses_blocks_feature_grid_items_order_idx" ON "courses_blocks_feature_grid_items" USING btree ("_order");
  CREATE INDEX "courses_blocks_feature_grid_items_parent_id_idx" ON "courses_blocks_feature_grid_items" USING btree ("_parent_id");
  CREATE INDEX "courses_blocks_feature_grid_items_locale_idx" ON "courses_blocks_feature_grid_items" USING btree ("_locale");
  CREATE INDEX "courses_blocks_feature_grid_order_idx" ON "courses_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "courses_blocks_feature_grid_parent_id_idx" ON "courses_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "courses_blocks_feature_grid_path_idx" ON "courses_blocks_feature_grid" USING btree ("_path");
  CREATE INDEX "courses_blocks_feature_grid_locale_idx" ON "courses_blocks_feature_grid" USING btree ("_locale");
  CREATE INDEX "courses_blocks_steps_items_order_idx" ON "courses_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "courses_blocks_steps_items_parent_id_idx" ON "courses_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "courses_blocks_steps_items_locale_idx" ON "courses_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "courses_blocks_steps_order_idx" ON "courses_blocks_steps" USING btree ("_order");
  CREATE INDEX "courses_blocks_steps_parent_id_idx" ON "courses_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "courses_blocks_steps_path_idx" ON "courses_blocks_steps" USING btree ("_path");
  CREATE INDEX "courses_blocks_steps_locale_idx" ON "courses_blocks_steps" USING btree ("_locale");
  CREATE INDEX "courses_blocks_relation_grid_order_idx" ON "courses_blocks_relation_grid" USING btree ("_order");
  CREATE INDEX "courses_blocks_relation_grid_parent_id_idx" ON "courses_blocks_relation_grid" USING btree ("_parent_id");
  CREATE INDEX "courses_blocks_relation_grid_path_idx" ON "courses_blocks_relation_grid" USING btree ("_path");
  CREATE INDEX "courses_blocks_relation_grid_locale_idx" ON "courses_blocks_relation_grid" USING btree ("_locale");
  CREATE INDEX "courses_blocks_gallery_order_idx" ON "courses_blocks_gallery" USING btree ("_order");
  CREATE INDEX "courses_blocks_gallery_parent_id_idx" ON "courses_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "courses_blocks_gallery_path_idx" ON "courses_blocks_gallery" USING btree ("_path");
  CREATE INDEX "courses_blocks_gallery_locale_idx" ON "courses_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "courses_blocks_testimonials_order_idx" ON "courses_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "courses_blocks_testimonials_parent_id_idx" ON "courses_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "courses_blocks_testimonials_path_idx" ON "courses_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "courses_blocks_testimonials_locale_idx" ON "courses_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "courses_blocks_faq_items_order_idx" ON "courses_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "courses_blocks_faq_items_parent_id_idx" ON "courses_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "courses_blocks_faq_items_locale_idx" ON "courses_blocks_faq_items" USING btree ("_locale");
  CREATE INDEX "courses_blocks_faq_order_idx" ON "courses_blocks_faq" USING btree ("_order");
  CREATE INDEX "courses_blocks_faq_parent_id_idx" ON "courses_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "courses_blocks_faq_path_idx" ON "courses_blocks_faq" USING btree ("_path");
  CREATE INDEX "courses_blocks_faq_locale_idx" ON "courses_blocks_faq" USING btree ("_locale");
  CREATE INDEX "courses_blocks_cta_order_idx" ON "courses_blocks_cta" USING btree ("_order");
  CREATE INDEX "courses_blocks_cta_parent_id_idx" ON "courses_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "courses_blocks_cta_path_idx" ON "courses_blocks_cta" USING btree ("_path");
  CREATE INDEX "courses_blocks_cta_locale_idx" ON "courses_blocks_cta" USING btree ("_locale");
  CREATE INDEX "_courses_v_blocks_rich_text_order_idx" ON "_courses_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_courses_v_blocks_rich_text_parent_id_idx" ON "_courses_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_blocks_rich_text_path_idx" ON "_courses_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_courses_v_blocks_rich_text_locale_idx" ON "_courses_v_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "_courses_v_blocks_media_text_order_idx" ON "_courses_v_blocks_media_text" USING btree ("_order");
  CREATE INDEX "_courses_v_blocks_media_text_parent_id_idx" ON "_courses_v_blocks_media_text" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_blocks_media_text_path_idx" ON "_courses_v_blocks_media_text" USING btree ("_path");
  CREATE INDEX "_courses_v_blocks_media_text_locale_idx" ON "_courses_v_blocks_media_text" USING btree ("_locale");
  CREATE INDEX "_courses_v_blocks_media_text_media_idx" ON "_courses_v_blocks_media_text" USING btree ("media_id");
  CREATE INDEX "_courses_v_blocks_feature_grid_items_order_idx" ON "_courses_v_blocks_feature_grid_items" USING btree ("_order");
  CREATE INDEX "_courses_v_blocks_feature_grid_items_parent_id_idx" ON "_courses_v_blocks_feature_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_blocks_feature_grid_items_locale_idx" ON "_courses_v_blocks_feature_grid_items" USING btree ("_locale");
  CREATE INDEX "_courses_v_blocks_feature_grid_order_idx" ON "_courses_v_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "_courses_v_blocks_feature_grid_parent_id_idx" ON "_courses_v_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_blocks_feature_grid_path_idx" ON "_courses_v_blocks_feature_grid" USING btree ("_path");
  CREATE INDEX "_courses_v_blocks_feature_grid_locale_idx" ON "_courses_v_blocks_feature_grid" USING btree ("_locale");
  CREATE INDEX "_courses_v_blocks_steps_items_order_idx" ON "_courses_v_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "_courses_v_blocks_steps_items_parent_id_idx" ON "_courses_v_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_blocks_steps_items_locale_idx" ON "_courses_v_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "_courses_v_blocks_steps_order_idx" ON "_courses_v_blocks_steps" USING btree ("_order");
  CREATE INDEX "_courses_v_blocks_steps_parent_id_idx" ON "_courses_v_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_blocks_steps_path_idx" ON "_courses_v_blocks_steps" USING btree ("_path");
  CREATE INDEX "_courses_v_blocks_steps_locale_idx" ON "_courses_v_blocks_steps" USING btree ("_locale");
  CREATE INDEX "_courses_v_blocks_relation_grid_order_idx" ON "_courses_v_blocks_relation_grid" USING btree ("_order");
  CREATE INDEX "_courses_v_blocks_relation_grid_parent_id_idx" ON "_courses_v_blocks_relation_grid" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_blocks_relation_grid_path_idx" ON "_courses_v_blocks_relation_grid" USING btree ("_path");
  CREATE INDEX "_courses_v_blocks_relation_grid_locale_idx" ON "_courses_v_blocks_relation_grid" USING btree ("_locale");
  CREATE INDEX "_courses_v_blocks_gallery_order_idx" ON "_courses_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_courses_v_blocks_gallery_parent_id_idx" ON "_courses_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_blocks_gallery_path_idx" ON "_courses_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_courses_v_blocks_gallery_locale_idx" ON "_courses_v_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "_courses_v_blocks_testimonials_order_idx" ON "_courses_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_courses_v_blocks_testimonials_parent_id_idx" ON "_courses_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_blocks_testimonials_path_idx" ON "_courses_v_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_courses_v_blocks_testimonials_locale_idx" ON "_courses_v_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "_courses_v_blocks_faq_items_order_idx" ON "_courses_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_courses_v_blocks_faq_items_parent_id_idx" ON "_courses_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_blocks_faq_items_locale_idx" ON "_courses_v_blocks_faq_items" USING btree ("_locale");
  CREATE INDEX "_courses_v_blocks_faq_order_idx" ON "_courses_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_courses_v_blocks_faq_parent_id_idx" ON "_courses_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_blocks_faq_path_idx" ON "_courses_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_courses_v_blocks_faq_locale_idx" ON "_courses_v_blocks_faq" USING btree ("_locale");
  CREATE INDEX "_courses_v_blocks_cta_order_idx" ON "_courses_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_courses_v_blocks_cta_parent_id_idx" ON "_courses_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_blocks_cta_path_idx" ON "_courses_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_courses_v_blocks_cta_locale_idx" ON "_courses_v_blocks_cta" USING btree ("_locale");
  CREATE INDEX "fashion_collections_blocks_rich_text_order_idx" ON "fashion_collections_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "fashion_collections_blocks_rich_text_parent_id_idx" ON "fashion_collections_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "fashion_collections_blocks_rich_text_path_idx" ON "fashion_collections_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "fashion_collections_blocks_rich_text_locale_idx" ON "fashion_collections_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "fashion_collections_blocks_media_text_order_idx" ON "fashion_collections_blocks_media_text" USING btree ("_order");
  CREATE INDEX "fashion_collections_blocks_media_text_parent_id_idx" ON "fashion_collections_blocks_media_text" USING btree ("_parent_id");
  CREATE INDEX "fashion_collections_blocks_media_text_path_idx" ON "fashion_collections_blocks_media_text" USING btree ("_path");
  CREATE INDEX "fashion_collections_blocks_media_text_locale_idx" ON "fashion_collections_blocks_media_text" USING btree ("_locale");
  CREATE INDEX "fashion_collections_blocks_media_text_media_idx" ON "fashion_collections_blocks_media_text" USING btree ("media_id");
  CREATE INDEX "fashion_collections_blocks_feature_grid_items_order_idx" ON "fashion_collections_blocks_feature_grid_items" USING btree ("_order");
  CREATE INDEX "fashion_collections_blocks_feature_grid_items_parent_id_idx" ON "fashion_collections_blocks_feature_grid_items" USING btree ("_parent_id");
  CREATE INDEX "fashion_collections_blocks_feature_grid_items_locale_idx" ON "fashion_collections_blocks_feature_grid_items" USING btree ("_locale");
  CREATE INDEX "fashion_collections_blocks_feature_grid_order_idx" ON "fashion_collections_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "fashion_collections_blocks_feature_grid_parent_id_idx" ON "fashion_collections_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "fashion_collections_blocks_feature_grid_path_idx" ON "fashion_collections_blocks_feature_grid" USING btree ("_path");
  CREATE INDEX "fashion_collections_blocks_feature_grid_locale_idx" ON "fashion_collections_blocks_feature_grid" USING btree ("_locale");
  CREATE INDEX "fashion_collections_blocks_steps_items_order_idx" ON "fashion_collections_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "fashion_collections_blocks_steps_items_parent_id_idx" ON "fashion_collections_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "fashion_collections_blocks_steps_items_locale_idx" ON "fashion_collections_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "fashion_collections_blocks_steps_order_idx" ON "fashion_collections_blocks_steps" USING btree ("_order");
  CREATE INDEX "fashion_collections_blocks_steps_parent_id_idx" ON "fashion_collections_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "fashion_collections_blocks_steps_path_idx" ON "fashion_collections_blocks_steps" USING btree ("_path");
  CREATE INDEX "fashion_collections_blocks_steps_locale_idx" ON "fashion_collections_blocks_steps" USING btree ("_locale");
  CREATE INDEX "fashion_collections_blocks_relation_grid_order_idx" ON "fashion_collections_blocks_relation_grid" USING btree ("_order");
  CREATE INDEX "fashion_collections_blocks_relation_grid_parent_id_idx" ON "fashion_collections_blocks_relation_grid" USING btree ("_parent_id");
  CREATE INDEX "fashion_collections_blocks_relation_grid_path_idx" ON "fashion_collections_blocks_relation_grid" USING btree ("_path");
  CREATE INDEX "fashion_collections_blocks_relation_grid_locale_idx" ON "fashion_collections_blocks_relation_grid" USING btree ("_locale");
  CREATE INDEX "fashion_collections_blocks_gallery_order_idx" ON "fashion_collections_blocks_gallery" USING btree ("_order");
  CREATE INDEX "fashion_collections_blocks_gallery_parent_id_idx" ON "fashion_collections_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "fashion_collections_blocks_gallery_path_idx" ON "fashion_collections_blocks_gallery" USING btree ("_path");
  CREATE INDEX "fashion_collections_blocks_gallery_locale_idx" ON "fashion_collections_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "fashion_collections_blocks_testimonials_order_idx" ON "fashion_collections_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "fashion_collections_blocks_testimonials_parent_id_idx" ON "fashion_collections_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "fashion_collections_blocks_testimonials_path_idx" ON "fashion_collections_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "fashion_collections_blocks_testimonials_locale_idx" ON "fashion_collections_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "fashion_collections_blocks_faq_items_order_idx" ON "fashion_collections_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "fashion_collections_blocks_faq_items_parent_id_idx" ON "fashion_collections_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "fashion_collections_blocks_faq_items_locale_idx" ON "fashion_collections_blocks_faq_items" USING btree ("_locale");
  CREATE INDEX "fashion_collections_blocks_faq_order_idx" ON "fashion_collections_blocks_faq" USING btree ("_order");
  CREATE INDEX "fashion_collections_blocks_faq_parent_id_idx" ON "fashion_collections_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "fashion_collections_blocks_faq_path_idx" ON "fashion_collections_blocks_faq" USING btree ("_path");
  CREATE INDEX "fashion_collections_blocks_faq_locale_idx" ON "fashion_collections_blocks_faq" USING btree ("_locale");
  CREATE INDEX "fashion_collections_blocks_cta_order_idx" ON "fashion_collections_blocks_cta" USING btree ("_order");
  CREATE INDEX "fashion_collections_blocks_cta_parent_id_idx" ON "fashion_collections_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "fashion_collections_blocks_cta_path_idx" ON "fashion_collections_blocks_cta" USING btree ("_path");
  CREATE INDEX "fashion_collections_blocks_cta_locale_idx" ON "fashion_collections_blocks_cta" USING btree ("_locale");
  CREATE INDEX "_fashion_collections_v_blocks_rich_text_order_idx" ON "_fashion_collections_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_fashion_collections_v_blocks_rich_text_parent_id_idx" ON "_fashion_collections_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_fashion_collections_v_blocks_rich_text_path_idx" ON "_fashion_collections_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_fashion_collections_v_blocks_rich_text_locale_idx" ON "_fashion_collections_v_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "_fashion_collections_v_blocks_media_text_order_idx" ON "_fashion_collections_v_blocks_media_text" USING btree ("_order");
  CREATE INDEX "_fashion_collections_v_blocks_media_text_parent_id_idx" ON "_fashion_collections_v_blocks_media_text" USING btree ("_parent_id");
  CREATE INDEX "_fashion_collections_v_blocks_media_text_path_idx" ON "_fashion_collections_v_blocks_media_text" USING btree ("_path");
  CREATE INDEX "_fashion_collections_v_blocks_media_text_locale_idx" ON "_fashion_collections_v_blocks_media_text" USING btree ("_locale");
  CREATE INDEX "_fashion_collections_v_blocks_media_text_media_idx" ON "_fashion_collections_v_blocks_media_text" USING btree ("media_id");
  CREATE INDEX "_fashion_collections_v_blocks_feature_grid_items_order_idx" ON "_fashion_collections_v_blocks_feature_grid_items" USING btree ("_order");
  CREATE INDEX "_fashion_collections_v_blocks_feature_grid_items_parent_id_idx" ON "_fashion_collections_v_blocks_feature_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_fashion_collections_v_blocks_feature_grid_items_locale_idx" ON "_fashion_collections_v_blocks_feature_grid_items" USING btree ("_locale");
  CREATE INDEX "_fashion_collections_v_blocks_feature_grid_order_idx" ON "_fashion_collections_v_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "_fashion_collections_v_blocks_feature_grid_parent_id_idx" ON "_fashion_collections_v_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "_fashion_collections_v_blocks_feature_grid_path_idx" ON "_fashion_collections_v_blocks_feature_grid" USING btree ("_path");
  CREATE INDEX "_fashion_collections_v_blocks_feature_grid_locale_idx" ON "_fashion_collections_v_blocks_feature_grid" USING btree ("_locale");
  CREATE INDEX "_fashion_collections_v_blocks_steps_items_order_idx" ON "_fashion_collections_v_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "_fashion_collections_v_blocks_steps_items_parent_id_idx" ON "_fashion_collections_v_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "_fashion_collections_v_blocks_steps_items_locale_idx" ON "_fashion_collections_v_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "_fashion_collections_v_blocks_steps_order_idx" ON "_fashion_collections_v_blocks_steps" USING btree ("_order");
  CREATE INDEX "_fashion_collections_v_blocks_steps_parent_id_idx" ON "_fashion_collections_v_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "_fashion_collections_v_blocks_steps_path_idx" ON "_fashion_collections_v_blocks_steps" USING btree ("_path");
  CREATE INDEX "_fashion_collections_v_blocks_steps_locale_idx" ON "_fashion_collections_v_blocks_steps" USING btree ("_locale");
  CREATE INDEX "_fashion_collections_v_blocks_relation_grid_order_idx" ON "_fashion_collections_v_blocks_relation_grid" USING btree ("_order");
  CREATE INDEX "_fashion_collections_v_blocks_relation_grid_parent_id_idx" ON "_fashion_collections_v_blocks_relation_grid" USING btree ("_parent_id");
  CREATE INDEX "_fashion_collections_v_blocks_relation_grid_path_idx" ON "_fashion_collections_v_blocks_relation_grid" USING btree ("_path");
  CREATE INDEX "_fashion_collections_v_blocks_relation_grid_locale_idx" ON "_fashion_collections_v_blocks_relation_grid" USING btree ("_locale");
  CREATE INDEX "_fashion_collections_v_blocks_gallery_order_idx" ON "_fashion_collections_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_fashion_collections_v_blocks_gallery_parent_id_idx" ON "_fashion_collections_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_fashion_collections_v_blocks_gallery_path_idx" ON "_fashion_collections_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_fashion_collections_v_blocks_gallery_locale_idx" ON "_fashion_collections_v_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "_fashion_collections_v_blocks_testimonials_order_idx" ON "_fashion_collections_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_fashion_collections_v_blocks_testimonials_parent_id_idx" ON "_fashion_collections_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_fashion_collections_v_blocks_testimonials_path_idx" ON "_fashion_collections_v_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_fashion_collections_v_blocks_testimonials_locale_idx" ON "_fashion_collections_v_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "_fashion_collections_v_blocks_faq_items_order_idx" ON "_fashion_collections_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_fashion_collections_v_blocks_faq_items_parent_id_idx" ON "_fashion_collections_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_fashion_collections_v_blocks_faq_items_locale_idx" ON "_fashion_collections_v_blocks_faq_items" USING btree ("_locale");
  CREATE INDEX "_fashion_collections_v_blocks_faq_order_idx" ON "_fashion_collections_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_fashion_collections_v_blocks_faq_parent_id_idx" ON "_fashion_collections_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_fashion_collections_v_blocks_faq_path_idx" ON "_fashion_collections_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_fashion_collections_v_blocks_faq_locale_idx" ON "_fashion_collections_v_blocks_faq" USING btree ("_locale");
  CREATE INDEX "_fashion_collections_v_blocks_cta_order_idx" ON "_fashion_collections_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_fashion_collections_v_blocks_cta_parent_id_idx" ON "_fashion_collections_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_fashion_collections_v_blocks_cta_path_idx" ON "_fashion_collections_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_fashion_collections_v_blocks_cta_locale_idx" ON "_fashion_collections_v_blocks_cta" USING btree ("_locale");
  CREATE INDEX "pages_blocks_rich_text_order_idx" ON "pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_parent_id_idx" ON "pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_path_idx" ON "pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_rich_text_locale_idx" ON "pages_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "pages_blocks_media_text_order_idx" ON "pages_blocks_media_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_text_parent_id_idx" ON "pages_blocks_media_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_text_path_idx" ON "pages_blocks_media_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_text_locale_idx" ON "pages_blocks_media_text" USING btree ("_locale");
  CREATE INDEX "pages_blocks_media_text_media_idx" ON "pages_blocks_media_text" USING btree ("media_id");
  CREATE INDEX "pages_blocks_feature_grid_items_order_idx" ON "pages_blocks_feature_grid_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_grid_items_parent_id_idx" ON "pages_blocks_feature_grid_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_grid_items_locale_idx" ON "pages_blocks_feature_grid_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_feature_grid_order_idx" ON "pages_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_grid_parent_id_idx" ON "pages_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_grid_path_idx" ON "pages_blocks_feature_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_feature_grid_locale_idx" ON "pages_blocks_feature_grid" USING btree ("_locale");
  CREATE INDEX "pages_blocks_steps_items_order_idx" ON "pages_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_items_parent_id_idx" ON "pages_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_steps_items_locale_idx" ON "pages_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_steps_order_idx" ON "pages_blocks_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_parent_id_idx" ON "pages_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_steps_path_idx" ON "pages_blocks_steps" USING btree ("_path");
  CREATE INDEX "pages_blocks_steps_locale_idx" ON "pages_blocks_steps" USING btree ("_locale");
  CREATE INDEX "pages_blocks_relation_grid_order_idx" ON "pages_blocks_relation_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_relation_grid_parent_id_idx" ON "pages_blocks_relation_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_relation_grid_path_idx" ON "pages_blocks_relation_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_relation_grid_locale_idx" ON "pages_blocks_relation_grid" USING btree ("_locale");
  CREATE INDEX "pages_blocks_gallery_order_idx" ON "pages_blocks_gallery" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_parent_id_idx" ON "pages_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_path_idx" ON "pages_blocks_gallery" USING btree ("_path");
  CREATE INDEX "pages_blocks_gallery_locale_idx" ON "pages_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "pages_blocks_testimonials_order_idx" ON "pages_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_parent_id_idx" ON "pages_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_path_idx" ON "pages_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "pages_blocks_testimonials_locale_idx" ON "pages_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "pages_blocks_faq_items_order_idx" ON "pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_items_parent_id_idx" ON "pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_items_locale_idx" ON "pages_blocks_faq_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_locale_idx" ON "pages_blocks_faq" USING btree ("_locale");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_locale_idx" ON "pages_blocks_cta" USING btree ("_locale");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_locale_idx" ON "pages_rels" USING btree ("locale");
  CREATE INDEX "pages_rels_services_id_idx" ON "pages_rels" USING btree ("services_id","locale");
  CREATE INDEX "pages_rels_courses_id_idx" ON "pages_rels" USING btree ("courses_id","locale");
  CREATE INDEX "pages_rels_fashion_collections_id_idx" ON "pages_rels" USING btree ("fashion_collections_id","locale");
  CREATE INDEX "pages_rels_portfolio_cases_id_idx" ON "pages_rels" USING btree ("portfolio_cases_id","locale");
  CREATE INDEX "pages_rels_media_id_idx" ON "pages_rels" USING btree ("media_id","locale");
  CREATE INDEX "pages_rels_testimonials_id_idx" ON "pages_rels" USING btree ("testimonials_id","locale");
  CREATE INDEX "_pages_v_blocks_rich_text_order_idx" ON "_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_text_parent_id_idx" ON "_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_path_idx" ON "_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_rich_text_locale_idx" ON "_pages_v_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_media_text_order_idx" ON "_pages_v_blocks_media_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_media_text_parent_id_idx" ON "_pages_v_blocks_media_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_media_text_path_idx" ON "_pages_v_blocks_media_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_text_locale_idx" ON "_pages_v_blocks_media_text" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_media_text_media_idx" ON "_pages_v_blocks_media_text" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_feature_grid_items_order_idx" ON "_pages_v_blocks_feature_grid_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_grid_items_parent_id_idx" ON "_pages_v_blocks_feature_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_grid_items_locale_idx" ON "_pages_v_blocks_feature_grid_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_feature_grid_order_idx" ON "_pages_v_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_grid_parent_id_idx" ON "_pages_v_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_grid_path_idx" ON "_pages_v_blocks_feature_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_feature_grid_locale_idx" ON "_pages_v_blocks_feature_grid" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_steps_items_order_idx" ON "_pages_v_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_steps_items_parent_id_idx" ON "_pages_v_blocks_steps_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_steps_items_locale_idx" ON "_pages_v_blocks_steps_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_steps_order_idx" ON "_pages_v_blocks_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_steps_parent_id_idx" ON "_pages_v_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_steps_path_idx" ON "_pages_v_blocks_steps" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_steps_locale_idx" ON "_pages_v_blocks_steps" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_relation_grid_order_idx" ON "_pages_v_blocks_relation_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_relation_grid_parent_id_idx" ON "_pages_v_blocks_relation_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_relation_grid_path_idx" ON "_pages_v_blocks_relation_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_relation_grid_locale_idx" ON "_pages_v_blocks_relation_grid" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_gallery_order_idx" ON "_pages_v_blocks_gallery" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_parent_id_idx" ON "_pages_v_blocks_gallery" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_path_idx" ON "_pages_v_blocks_gallery" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_gallery_locale_idx" ON "_pages_v_blocks_gallery" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_testimonials_order_idx" ON "_pages_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_parent_id_idx" ON "_pages_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_path_idx" ON "_pages_v_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_testimonials_locale_idx" ON "_pages_v_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_faq_items_order_idx" ON "_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_items_parent_id_idx" ON "_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_items_locale_idx" ON "_pages_v_blocks_faq_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_faq_locale_idx" ON "_pages_v_blocks_faq" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_locale_idx" ON "_pages_v_blocks_cta" USING btree ("_locale");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_locale_idx" ON "_pages_v_rels" USING btree ("locale");
  CREATE INDEX "_pages_v_rels_services_id_idx" ON "_pages_v_rels" USING btree ("services_id","locale");
  CREATE INDEX "_pages_v_rels_courses_id_idx" ON "_pages_v_rels" USING btree ("courses_id","locale");
  CREATE INDEX "_pages_v_rels_fashion_collections_id_idx" ON "_pages_v_rels" USING btree ("fashion_collections_id","locale");
  CREATE INDEX "_pages_v_rels_portfolio_cases_id_idx" ON "_pages_v_rels" USING btree ("portfolio_cases_id","locale");
  CREATE INDEX "_pages_v_rels_media_id_idx" ON "_pages_v_rels" USING btree ("media_id","locale");
  CREATE INDEX "_pages_v_rels_testimonials_id_idx" ON "_pages_v_rels" USING btree ("testimonials_id","locale");
  ALTER TABLE "directions_rels" ADD CONSTRAINT "directions_rels_portfolio_cases_fk" FOREIGN KEY ("portfolio_cases_id") REFERENCES "public"."portfolio_cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "directions_rels" ADD CONSTRAINT "directions_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "directions_rels" ADD CONSTRAINT "directions_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_directions_v_rels" ADD CONSTRAINT "_directions_v_rels_portfolio_cases_fk" FOREIGN KEY ("portfolio_cases_id") REFERENCES "public"."portfolio_cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_directions_v_rels" ADD CONSTRAINT "_directions_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_directions_v_rels" ADD CONSTRAINT "_directions_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_portfolio_cases_fk" FOREIGN KEY ("portfolio_cases_id") REFERENCES "public"."portfolio_cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_rels" ADD CONSTRAINT "_courses_v_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_rels" ADD CONSTRAINT "_courses_v_rels_portfolio_cases_fk" FOREIGN KEY ("portfolio_cases_id") REFERENCES "public"."portfolio_cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_rels" ADD CONSTRAINT "_courses_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections_rels" ADD CONSTRAINT "fashion_collections_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections_rels" ADD CONSTRAINT "fashion_collections_rels_fashion_collections_fk" FOREIGN KEY ("fashion_collections_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections_rels" ADD CONSTRAINT "fashion_collections_rels_portfolio_cases_fk" FOREIGN KEY ("portfolio_cases_id") REFERENCES "public"."portfolio_cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "fashion_collections_rels" ADD CONSTRAINT "fashion_collections_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_rels" ADD CONSTRAINT "_fashion_collections_v_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_rels" ADD CONSTRAINT "_fashion_collections_v_rels_fashion_collections_fk" FOREIGN KEY ("fashion_collections_id") REFERENCES "public"."fashion_collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_rels" ADD CONSTRAINT "_fashion_collections_v_rels_portfolio_cases_fk" FOREIGN KEY ("portfolio_cases_id") REFERENCES "public"."portfolio_cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_fashion_collections_v_rels" ADD CONSTRAINT "_fashion_collections_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "directions_rels_locale_idx" ON "directions_rels" USING btree ("locale");
  CREATE INDEX "directions_rels_portfolio_cases_id_idx" ON "directions_rels" USING btree ("portfolio_cases_id","locale");
  CREATE INDEX "directions_rels_media_id_idx" ON "directions_rels" USING btree ("media_id","locale");
  CREATE INDEX "directions_rels_testimonials_id_idx" ON "directions_rels" USING btree ("testimonials_id","locale");
  CREATE INDEX "_directions_v_rels_locale_idx" ON "_directions_v_rels" USING btree ("locale");
  CREATE INDEX "_directions_v_rels_portfolio_cases_id_idx" ON "_directions_v_rels" USING btree ("portfolio_cases_id","locale");
  CREATE INDEX "_directions_v_rels_media_id_idx" ON "_directions_v_rels" USING btree ("media_id","locale");
  CREATE INDEX "_directions_v_rels_testimonials_id_idx" ON "_directions_v_rels" USING btree ("testimonials_id","locale");
  CREATE INDEX "services_rels_locale_idx" ON "services_rels" USING btree ("locale");
  CREATE INDEX "services_rels_testimonials_id_idx" ON "services_rels" USING btree ("testimonials_id","locale");
  CREATE INDEX "_services_v_rels_locale_idx" ON "_services_v_rels" USING btree ("locale");
  CREATE INDEX "_services_v_rels_testimonials_id_idx" ON "_services_v_rels" USING btree ("testimonials_id","locale");
  CREATE INDEX "courses_rels_locale_idx" ON "courses_rels" USING btree ("locale");
  CREATE INDEX "courses_rels_courses_id_idx" ON "courses_rels" USING btree ("courses_id","locale");
  CREATE INDEX "courses_rels_portfolio_cases_id_idx" ON "courses_rels" USING btree ("portfolio_cases_id","locale");
  CREATE INDEX "courses_rels_testimonials_id_idx" ON "courses_rels" USING btree ("testimonials_id","locale");
  CREATE INDEX "_courses_v_rels_locale_idx" ON "_courses_v_rels" USING btree ("locale");
  CREATE INDEX "_courses_v_rels_courses_id_idx" ON "_courses_v_rels" USING btree ("courses_id","locale");
  CREATE INDEX "_courses_v_rels_portfolio_cases_id_idx" ON "_courses_v_rels" USING btree ("portfolio_cases_id","locale");
  CREATE INDEX "_courses_v_rels_testimonials_id_idx" ON "_courses_v_rels" USING btree ("testimonials_id","locale");
  CREATE INDEX "fashion_collections_rels_locale_idx" ON "fashion_collections_rels" USING btree ("locale");
  CREATE INDEX "fashion_collections_rels_courses_id_idx" ON "fashion_collections_rels" USING btree ("courses_id","locale");
  CREATE INDEX "fashion_collections_rels_fashion_collections_id_idx" ON "fashion_collections_rels" USING btree ("fashion_collections_id","locale");
  CREATE INDEX "fashion_collections_rels_portfolio_cases_id_idx" ON "fashion_collections_rels" USING btree ("portfolio_cases_id","locale");
  CREATE INDEX "fashion_collections_rels_testimonials_id_idx" ON "fashion_collections_rels" USING btree ("testimonials_id","locale");
  CREATE INDEX "_fashion_collections_v_rels_locale_idx" ON "_fashion_collections_v_rels" USING btree ("locale");
  CREATE INDEX "_fashion_collections_v_rels_courses_id_idx" ON "_fashion_collections_v_rels" USING btree ("courses_id","locale");
  CREATE INDEX "_fashion_collections_v_rels_fashion_collections_id_idx" ON "_fashion_collections_v_rels" USING btree ("fashion_collections_id","locale");
  CREATE INDEX "_fashion_collections_v_rels_portfolio_cases_id_idx" ON "_fashion_collections_v_rels" USING btree ("portfolio_cases_id","locale");
  CREATE INDEX "_fashion_collections_v_rels_testimonials_id_idx" ON "_fashion_collections_v_rels" USING btree ("testimonials_id","locale");
  CREATE INDEX "directions_rels_services_id_idx" ON "directions_rels" USING btree ("services_id","locale");
  CREATE INDEX "directions_rels_courses_id_idx" ON "directions_rels" USING btree ("courses_id","locale");
  CREATE INDEX "directions_rels_fashion_collections_id_idx" ON "directions_rels" USING btree ("fashion_collections_id","locale");
  CREATE INDEX "_directions_v_rels_services_id_idx" ON "_directions_v_rels" USING btree ("services_id","locale");
  CREATE INDEX "_directions_v_rels_courses_id_idx" ON "_directions_v_rels" USING btree ("courses_id","locale");
  CREATE INDEX "_directions_v_rels_fashion_collections_id_idx" ON "_directions_v_rels" USING btree ("fashion_collections_id","locale");
  CREATE INDEX "services_rels_directions_id_idx" ON "services_rels" USING btree ("directions_id","locale");
  CREATE INDEX "services_rels_media_id_idx" ON "services_rels" USING btree ("media_id","locale");
  CREATE INDEX "services_rels_offers_id_idx" ON "services_rels" USING btree ("offers_id","locale");
  CREATE INDEX "services_rels_portfolio_cases_id_idx" ON "services_rels" USING btree ("portfolio_cases_id","locale");
  CREATE INDEX "services_rels_services_id_idx" ON "services_rels" USING btree ("services_id","locale");
  CREATE INDEX "services_rels_courses_id_idx" ON "services_rels" USING btree ("courses_id","locale");
  CREATE INDEX "services_rels_fashion_collections_id_idx" ON "services_rels" USING btree ("fashion_collections_id","locale");
  CREATE INDEX "_services_v_rels_directions_id_idx" ON "_services_v_rels" USING btree ("directions_id","locale");
  CREATE INDEX "_services_v_rels_media_id_idx" ON "_services_v_rels" USING btree ("media_id","locale");
  CREATE INDEX "_services_v_rels_offers_id_idx" ON "_services_v_rels" USING btree ("offers_id","locale");
  CREATE INDEX "_services_v_rels_portfolio_cases_id_idx" ON "_services_v_rels" USING btree ("portfolio_cases_id","locale");
  CREATE INDEX "_services_v_rels_services_id_idx" ON "_services_v_rels" USING btree ("services_id","locale");
  CREATE INDEX "_services_v_rels_courses_id_idx" ON "_services_v_rels" USING btree ("courses_id","locale");
  CREATE INDEX "_services_v_rels_fashion_collections_id_idx" ON "_services_v_rels" USING btree ("fashion_collections_id","locale");
  CREATE INDEX "courses_rels_offers_id_idx" ON "courses_rels" USING btree ("offers_id","locale");
  CREATE INDEX "courses_rels_media_id_idx" ON "courses_rels" USING btree ("media_id","locale");
  CREATE INDEX "courses_rels_services_id_idx" ON "courses_rels" USING btree ("services_id","locale");
  CREATE INDEX "courses_rels_fashion_collections_id_idx" ON "courses_rels" USING btree ("fashion_collections_id","locale");
  CREATE INDEX "_courses_v_rels_offers_id_idx" ON "_courses_v_rels" USING btree ("offers_id","locale");
  CREATE INDEX "_courses_v_rels_media_id_idx" ON "_courses_v_rels" USING btree ("media_id","locale");
  CREATE INDEX "_courses_v_rels_services_id_idx" ON "_courses_v_rels" USING btree ("services_id","locale");
  CREATE INDEX "_courses_v_rels_fashion_collections_id_idx" ON "_courses_v_rels" USING btree ("fashion_collections_id","locale");
  CREATE INDEX "fashion_collections_rels_media_id_idx" ON "fashion_collections_rels" USING btree ("media_id","locale");
  CREATE INDEX "fashion_collections_rels_offers_id_idx" ON "fashion_collections_rels" USING btree ("offers_id","locale");
  CREATE INDEX "fashion_collections_rels_services_id_idx" ON "fashion_collections_rels" USING btree ("services_id","locale");
  CREATE INDEX "_fashion_collections_v_rels_media_id_idx" ON "_fashion_collections_v_rels" USING btree ("media_id","locale");
  CREATE INDEX "_fashion_collections_v_rels_offers_id_idx" ON "_fashion_collections_v_rels" USING btree ("offers_id","locale");
  CREATE INDEX "_fashion_collections_v_rels_services_id_idx" ON "_fashion_collections_v_rels" USING btree ("services_id","locale");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "directions_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "directions_blocks_media_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "directions_blocks_feature_grid_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "directions_blocks_feature_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "directions_blocks_steps_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "directions_blocks_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "directions_blocks_relation_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "directions_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "directions_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "directions_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "directions_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "directions_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_directions_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_directions_v_blocks_media_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_directions_v_blocks_feature_grid_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_directions_v_blocks_feature_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_directions_v_blocks_steps_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_directions_v_blocks_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_directions_v_blocks_relation_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_directions_v_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_directions_v_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_directions_v_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_directions_v_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_directions_v_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_media_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_feature_grid_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_feature_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_steps_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_relation_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_media_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_feature_grid_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_feature_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_steps_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_relation_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses_blocks_media_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses_blocks_feature_grid_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses_blocks_feature_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses_blocks_steps_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses_blocks_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses_blocks_relation_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_courses_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_courses_v_blocks_media_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_courses_v_blocks_feature_grid_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_courses_v_blocks_feature_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_courses_v_blocks_steps_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_courses_v_blocks_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_courses_v_blocks_relation_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_courses_v_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_courses_v_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_courses_v_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_courses_v_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_courses_v_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "fashion_collections_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "fashion_collections_blocks_media_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "fashion_collections_blocks_feature_grid_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "fashion_collections_blocks_feature_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "fashion_collections_blocks_steps_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "fashion_collections_blocks_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "fashion_collections_blocks_relation_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "fashion_collections_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "fashion_collections_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "fashion_collections_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "fashion_collections_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "fashion_collections_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_fashion_collections_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_fashion_collections_v_blocks_media_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_fashion_collections_v_blocks_feature_grid_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_fashion_collections_v_blocks_feature_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_fashion_collections_v_blocks_steps_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_fashion_collections_v_blocks_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_fashion_collections_v_blocks_relation_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_fashion_collections_v_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_fashion_collections_v_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_fashion_collections_v_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_fashion_collections_v_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_fashion_collections_v_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_media_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_feature_grid_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_feature_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_steps_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_relation_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_media_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_feature_grid_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_feature_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_steps_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_relation_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "directions_blocks_rich_text" CASCADE;
  DROP TABLE "directions_blocks_media_text" CASCADE;
  DROP TABLE "directions_blocks_feature_grid_items" CASCADE;
  DROP TABLE "directions_blocks_feature_grid" CASCADE;
  DROP TABLE "directions_blocks_steps_items" CASCADE;
  DROP TABLE "directions_blocks_steps" CASCADE;
  DROP TABLE "directions_blocks_relation_grid" CASCADE;
  DROP TABLE "directions_blocks_gallery" CASCADE;
  DROP TABLE "directions_blocks_testimonials" CASCADE;
  DROP TABLE "directions_blocks_faq_items" CASCADE;
  DROP TABLE "directions_blocks_faq" CASCADE;
  DROP TABLE "directions_blocks_cta" CASCADE;
  DROP TABLE "_directions_v_blocks_rich_text" CASCADE;
  DROP TABLE "_directions_v_blocks_media_text" CASCADE;
  DROP TABLE "_directions_v_blocks_feature_grid_items" CASCADE;
  DROP TABLE "_directions_v_blocks_feature_grid" CASCADE;
  DROP TABLE "_directions_v_blocks_steps_items" CASCADE;
  DROP TABLE "_directions_v_blocks_steps" CASCADE;
  DROP TABLE "_directions_v_blocks_relation_grid" CASCADE;
  DROP TABLE "_directions_v_blocks_gallery" CASCADE;
  DROP TABLE "_directions_v_blocks_testimonials" CASCADE;
  DROP TABLE "_directions_v_blocks_faq_items" CASCADE;
  DROP TABLE "_directions_v_blocks_faq" CASCADE;
  DROP TABLE "_directions_v_blocks_cta" CASCADE;
  DROP TABLE "services_blocks_rich_text" CASCADE;
  DROP TABLE "services_blocks_media_text" CASCADE;
  DROP TABLE "services_blocks_feature_grid_items" CASCADE;
  DROP TABLE "services_blocks_feature_grid" CASCADE;
  DROP TABLE "services_blocks_steps_items" CASCADE;
  DROP TABLE "services_blocks_steps" CASCADE;
  DROP TABLE "services_blocks_relation_grid" CASCADE;
  DROP TABLE "services_blocks_gallery" CASCADE;
  DROP TABLE "services_blocks_testimonials" CASCADE;
  DROP TABLE "services_blocks_faq_items" CASCADE;
  DROP TABLE "services_blocks_faq" CASCADE;
  DROP TABLE "services_blocks_cta" CASCADE;
  DROP TABLE "_services_v_blocks_rich_text" CASCADE;
  DROP TABLE "_services_v_blocks_media_text" CASCADE;
  DROP TABLE "_services_v_blocks_feature_grid_items" CASCADE;
  DROP TABLE "_services_v_blocks_feature_grid" CASCADE;
  DROP TABLE "_services_v_blocks_steps_items" CASCADE;
  DROP TABLE "_services_v_blocks_steps" CASCADE;
  DROP TABLE "_services_v_blocks_relation_grid" CASCADE;
  DROP TABLE "_services_v_blocks_gallery" CASCADE;
  DROP TABLE "_services_v_blocks_testimonials" CASCADE;
  DROP TABLE "_services_v_blocks_faq_items" CASCADE;
  DROP TABLE "_services_v_blocks_faq" CASCADE;
  DROP TABLE "_services_v_blocks_cta" CASCADE;
  DROP TABLE "courses_blocks_rich_text" CASCADE;
  DROP TABLE "courses_blocks_media_text" CASCADE;
  DROP TABLE "courses_blocks_feature_grid_items" CASCADE;
  DROP TABLE "courses_blocks_feature_grid" CASCADE;
  DROP TABLE "courses_blocks_steps_items" CASCADE;
  DROP TABLE "courses_blocks_steps" CASCADE;
  DROP TABLE "courses_blocks_relation_grid" CASCADE;
  DROP TABLE "courses_blocks_gallery" CASCADE;
  DROP TABLE "courses_blocks_testimonials" CASCADE;
  DROP TABLE "courses_blocks_faq_items" CASCADE;
  DROP TABLE "courses_blocks_faq" CASCADE;
  DROP TABLE "courses_blocks_cta" CASCADE;
  DROP TABLE "_courses_v_blocks_rich_text" CASCADE;
  DROP TABLE "_courses_v_blocks_media_text" CASCADE;
  DROP TABLE "_courses_v_blocks_feature_grid_items" CASCADE;
  DROP TABLE "_courses_v_blocks_feature_grid" CASCADE;
  DROP TABLE "_courses_v_blocks_steps_items" CASCADE;
  DROP TABLE "_courses_v_blocks_steps" CASCADE;
  DROP TABLE "_courses_v_blocks_relation_grid" CASCADE;
  DROP TABLE "_courses_v_blocks_gallery" CASCADE;
  DROP TABLE "_courses_v_blocks_testimonials" CASCADE;
  DROP TABLE "_courses_v_blocks_faq_items" CASCADE;
  DROP TABLE "_courses_v_blocks_faq" CASCADE;
  DROP TABLE "_courses_v_blocks_cta" CASCADE;
  DROP TABLE "fashion_collections_blocks_rich_text" CASCADE;
  DROP TABLE "fashion_collections_blocks_media_text" CASCADE;
  DROP TABLE "fashion_collections_blocks_feature_grid_items" CASCADE;
  DROP TABLE "fashion_collections_blocks_feature_grid" CASCADE;
  DROP TABLE "fashion_collections_blocks_steps_items" CASCADE;
  DROP TABLE "fashion_collections_blocks_steps" CASCADE;
  DROP TABLE "fashion_collections_blocks_relation_grid" CASCADE;
  DROP TABLE "fashion_collections_blocks_gallery" CASCADE;
  DROP TABLE "fashion_collections_blocks_testimonials" CASCADE;
  DROP TABLE "fashion_collections_blocks_faq_items" CASCADE;
  DROP TABLE "fashion_collections_blocks_faq" CASCADE;
  DROP TABLE "fashion_collections_blocks_cta" CASCADE;
  DROP TABLE "_fashion_collections_v_blocks_rich_text" CASCADE;
  DROP TABLE "_fashion_collections_v_blocks_media_text" CASCADE;
  DROP TABLE "_fashion_collections_v_blocks_feature_grid_items" CASCADE;
  DROP TABLE "_fashion_collections_v_blocks_feature_grid" CASCADE;
  DROP TABLE "_fashion_collections_v_blocks_steps_items" CASCADE;
  DROP TABLE "_fashion_collections_v_blocks_steps" CASCADE;
  DROP TABLE "_fashion_collections_v_blocks_relation_grid" CASCADE;
  DROP TABLE "_fashion_collections_v_blocks_gallery" CASCADE;
  DROP TABLE "_fashion_collections_v_blocks_testimonials" CASCADE;
  DROP TABLE "_fashion_collections_v_blocks_faq_items" CASCADE;
  DROP TABLE "_fashion_collections_v_blocks_faq" CASCADE;
  DROP TABLE "_fashion_collections_v_blocks_cta" CASCADE;
  DROP TABLE "pages_blocks_rich_text" CASCADE;
  DROP TABLE "pages_blocks_media_text" CASCADE;
  DROP TABLE "pages_blocks_feature_grid_items" CASCADE;
  DROP TABLE "pages_blocks_feature_grid" CASCADE;
  DROP TABLE "pages_blocks_steps_items" CASCADE;
  DROP TABLE "pages_blocks_steps" CASCADE;
  DROP TABLE "pages_blocks_relation_grid" CASCADE;
  DROP TABLE "pages_blocks_gallery" CASCADE;
  DROP TABLE "pages_blocks_testimonials" CASCADE;
  DROP TABLE "pages_blocks_faq_items" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_pages_v_blocks_media_text" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_grid_items" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_steps_items" CASCADE;
  DROP TABLE "_pages_v_blocks_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_relation_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  ALTER TABLE "directions_rels" DROP CONSTRAINT "directions_rels_portfolio_cases_fk";

  ALTER TABLE "directions_rels" DROP CONSTRAINT "directions_rels_media_fk";

  ALTER TABLE "directions_rels" DROP CONSTRAINT "directions_rels_testimonials_fk";

  ALTER TABLE "_directions_v_rels" DROP CONSTRAINT "_directions_v_rels_portfolio_cases_fk";

  ALTER TABLE "_directions_v_rels" DROP CONSTRAINT "_directions_v_rels_media_fk";

  ALTER TABLE "_directions_v_rels" DROP CONSTRAINT "_directions_v_rels_testimonials_fk";

  ALTER TABLE "services_rels" DROP CONSTRAINT "services_rels_testimonials_fk";

  ALTER TABLE "_services_v_rels" DROP CONSTRAINT "_services_v_rels_testimonials_fk";

  ALTER TABLE "courses_rels" DROP CONSTRAINT "courses_rels_courses_fk";

  ALTER TABLE "courses_rels" DROP CONSTRAINT "courses_rels_portfolio_cases_fk";

  ALTER TABLE "courses_rels" DROP CONSTRAINT "courses_rels_testimonials_fk";

  ALTER TABLE "_courses_v_rels" DROP CONSTRAINT "_courses_v_rels_courses_fk";

  ALTER TABLE "_courses_v_rels" DROP CONSTRAINT "_courses_v_rels_portfolio_cases_fk";

  ALTER TABLE "_courses_v_rels" DROP CONSTRAINT "_courses_v_rels_testimonials_fk";

  ALTER TABLE "fashion_collections_rels" DROP CONSTRAINT "fashion_collections_rels_courses_fk";

  ALTER TABLE "fashion_collections_rels" DROP CONSTRAINT "fashion_collections_rels_fashion_collections_fk";

  ALTER TABLE "fashion_collections_rels" DROP CONSTRAINT "fashion_collections_rels_portfolio_cases_fk";

  ALTER TABLE "fashion_collections_rels" DROP CONSTRAINT "fashion_collections_rels_testimonials_fk";

  ALTER TABLE "_fashion_collections_v_rels" DROP CONSTRAINT "_fashion_collections_v_rels_courses_fk";

  ALTER TABLE "_fashion_collections_v_rels" DROP CONSTRAINT "_fashion_collections_v_rels_fashion_collections_fk";

  ALTER TABLE "_fashion_collections_v_rels" DROP CONSTRAINT "_fashion_collections_v_rels_portfolio_cases_fk";

  ALTER TABLE "_fashion_collections_v_rels" DROP CONSTRAINT "_fashion_collections_v_rels_testimonials_fk";

  DROP INDEX "directions_rels_locale_idx";
  DROP INDEX "directions_rels_portfolio_cases_id_idx";
  DROP INDEX "directions_rels_media_id_idx";
  DROP INDEX "directions_rels_testimonials_id_idx";
  DROP INDEX "_directions_v_rels_locale_idx";
  DROP INDEX "_directions_v_rels_portfolio_cases_id_idx";
  DROP INDEX "_directions_v_rels_media_id_idx";
  DROP INDEX "_directions_v_rels_testimonials_id_idx";
  DROP INDEX "services_rels_locale_idx";
  DROP INDEX "services_rels_testimonials_id_idx";
  DROP INDEX "_services_v_rels_locale_idx";
  DROP INDEX "_services_v_rels_testimonials_id_idx";
  DROP INDEX "courses_rels_locale_idx";
  DROP INDEX "courses_rels_courses_id_idx";
  DROP INDEX "courses_rels_portfolio_cases_id_idx";
  DROP INDEX "courses_rels_testimonials_id_idx";
  DROP INDEX "_courses_v_rels_locale_idx";
  DROP INDEX "_courses_v_rels_courses_id_idx";
  DROP INDEX "_courses_v_rels_portfolio_cases_id_idx";
  DROP INDEX "_courses_v_rels_testimonials_id_idx";
  DROP INDEX "fashion_collections_rels_locale_idx";
  DROP INDEX "fashion_collections_rels_courses_id_idx";
  DROP INDEX "fashion_collections_rels_fashion_collections_id_idx";
  DROP INDEX "fashion_collections_rels_portfolio_cases_id_idx";
  DROP INDEX "fashion_collections_rels_testimonials_id_idx";
  DROP INDEX "_fashion_collections_v_rels_locale_idx";
  DROP INDEX "_fashion_collections_v_rels_courses_id_idx";
  DROP INDEX "_fashion_collections_v_rels_fashion_collections_id_idx";
  DROP INDEX "_fashion_collections_v_rels_portfolio_cases_id_idx";
  DROP INDEX "_fashion_collections_v_rels_testimonials_id_idx";
  DROP INDEX "directions_rels_services_id_idx";
  DROP INDEX "directions_rels_courses_id_idx";
  DROP INDEX "directions_rels_fashion_collections_id_idx";
  DROP INDEX "_directions_v_rels_services_id_idx";
  DROP INDEX "_directions_v_rels_courses_id_idx";
  DROP INDEX "_directions_v_rels_fashion_collections_id_idx";
  DROP INDEX "services_rels_directions_id_idx";
  DROP INDEX "services_rels_media_id_idx";
  DROP INDEX "services_rels_offers_id_idx";
  DROP INDEX "services_rels_portfolio_cases_id_idx";
  DROP INDEX "services_rels_services_id_idx";
  DROP INDEX "services_rels_courses_id_idx";
  DROP INDEX "services_rels_fashion_collections_id_idx";
  DROP INDEX "_services_v_rels_directions_id_idx";
  DROP INDEX "_services_v_rels_media_id_idx";
  DROP INDEX "_services_v_rels_offers_id_idx";
  DROP INDEX "_services_v_rels_portfolio_cases_id_idx";
  DROP INDEX "_services_v_rels_services_id_idx";
  DROP INDEX "_services_v_rels_courses_id_idx";
  DROP INDEX "_services_v_rels_fashion_collections_id_idx";
  DROP INDEX "courses_rels_offers_id_idx";
  DROP INDEX "courses_rels_media_id_idx";
  DROP INDEX "courses_rels_services_id_idx";
  DROP INDEX "courses_rels_fashion_collections_id_idx";
  DROP INDEX "_courses_v_rels_offers_id_idx";
  DROP INDEX "_courses_v_rels_media_id_idx";
  DROP INDEX "_courses_v_rels_services_id_idx";
  DROP INDEX "_courses_v_rels_fashion_collections_id_idx";
  DROP INDEX "fashion_collections_rels_media_id_idx";
  DROP INDEX "fashion_collections_rels_offers_id_idx";
  DROP INDEX "fashion_collections_rels_services_id_idx";
  DROP INDEX "_fashion_collections_v_rels_media_id_idx";
  DROP INDEX "_fashion_collections_v_rels_offers_id_idx";
  DROP INDEX "_fashion_collections_v_rels_services_id_idx";
  CREATE INDEX "directions_rels_services_id_idx" ON "directions_rels" USING btree ("services_id");
  CREATE INDEX "directions_rels_courses_id_idx" ON "directions_rels" USING btree ("courses_id");
  CREATE INDEX "directions_rels_fashion_collections_id_idx" ON "directions_rels" USING btree ("fashion_collections_id");
  CREATE INDEX "_directions_v_rels_services_id_idx" ON "_directions_v_rels" USING btree ("services_id");
  CREATE INDEX "_directions_v_rels_courses_id_idx" ON "_directions_v_rels" USING btree ("courses_id");
  CREATE INDEX "_directions_v_rels_fashion_collections_id_idx" ON "_directions_v_rels" USING btree ("fashion_collections_id");
  CREATE INDEX "services_rels_directions_id_idx" ON "services_rels" USING btree ("directions_id");
  CREATE INDEX "services_rels_media_id_idx" ON "services_rels" USING btree ("media_id");
  CREATE INDEX "services_rels_offers_id_idx" ON "services_rels" USING btree ("offers_id");
  CREATE INDEX "services_rels_portfolio_cases_id_idx" ON "services_rels" USING btree ("portfolio_cases_id");
  CREATE INDEX "services_rels_services_id_idx" ON "services_rels" USING btree ("services_id");
  CREATE INDEX "services_rels_courses_id_idx" ON "services_rels" USING btree ("courses_id");
  CREATE INDEX "services_rels_fashion_collections_id_idx" ON "services_rels" USING btree ("fashion_collections_id");
  CREATE INDEX "_services_v_rels_directions_id_idx" ON "_services_v_rels" USING btree ("directions_id");
  CREATE INDEX "_services_v_rels_media_id_idx" ON "_services_v_rels" USING btree ("media_id");
  CREATE INDEX "_services_v_rels_offers_id_idx" ON "_services_v_rels" USING btree ("offers_id");
  CREATE INDEX "_services_v_rels_portfolio_cases_id_idx" ON "_services_v_rels" USING btree ("portfolio_cases_id");
  CREATE INDEX "_services_v_rels_services_id_idx" ON "_services_v_rels" USING btree ("services_id");
  CREATE INDEX "_services_v_rels_courses_id_idx" ON "_services_v_rels" USING btree ("courses_id");
  CREATE INDEX "_services_v_rels_fashion_collections_id_idx" ON "_services_v_rels" USING btree ("fashion_collections_id");
  CREATE INDEX "courses_rels_offers_id_idx" ON "courses_rels" USING btree ("offers_id");
  CREATE INDEX "courses_rels_media_id_idx" ON "courses_rels" USING btree ("media_id");
  CREATE INDEX "courses_rels_services_id_idx" ON "courses_rels" USING btree ("services_id");
  CREATE INDEX "courses_rels_fashion_collections_id_idx" ON "courses_rels" USING btree ("fashion_collections_id");
  CREATE INDEX "_courses_v_rels_offers_id_idx" ON "_courses_v_rels" USING btree ("offers_id");
  CREATE INDEX "_courses_v_rels_media_id_idx" ON "_courses_v_rels" USING btree ("media_id");
  CREATE INDEX "_courses_v_rels_services_id_idx" ON "_courses_v_rels" USING btree ("services_id");
  CREATE INDEX "_courses_v_rels_fashion_collections_id_idx" ON "_courses_v_rels" USING btree ("fashion_collections_id");
  CREATE INDEX "fashion_collections_rels_media_id_idx" ON "fashion_collections_rels" USING btree ("media_id");
  CREATE INDEX "fashion_collections_rels_offers_id_idx" ON "fashion_collections_rels" USING btree ("offers_id");
  CREATE INDEX "fashion_collections_rels_services_id_idx" ON "fashion_collections_rels" USING btree ("services_id");
  CREATE INDEX "_fashion_collections_v_rels_media_id_idx" ON "_fashion_collections_v_rels" USING btree ("media_id");
  CREATE INDEX "_fashion_collections_v_rels_offers_id_idx" ON "_fashion_collections_v_rels" USING btree ("offers_id");
  CREATE INDEX "_fashion_collections_v_rels_services_id_idx" ON "_fashion_collections_v_rels" USING btree ("services_id");
  ALTER TABLE "directions_rels" DROP COLUMN "locale";
  ALTER TABLE "directions_rels" DROP COLUMN "portfolio_cases_id";
  ALTER TABLE "directions_rels" DROP COLUMN "media_id";
  ALTER TABLE "directions_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "_directions_v_rels" DROP COLUMN "locale";
  ALTER TABLE "_directions_v_rels" DROP COLUMN "portfolio_cases_id";
  ALTER TABLE "_directions_v_rels" DROP COLUMN "media_id";
  ALTER TABLE "_directions_v_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "services_rels" DROP COLUMN "locale";
  ALTER TABLE "services_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "_services_v_rels" DROP COLUMN "locale";
  ALTER TABLE "_services_v_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "courses_rels" DROP COLUMN "locale";
  ALTER TABLE "courses_rels" DROP COLUMN "courses_id";
  ALTER TABLE "courses_rels" DROP COLUMN "portfolio_cases_id";
  ALTER TABLE "courses_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "_courses_v_rels" DROP COLUMN "locale";
  ALTER TABLE "_courses_v_rels" DROP COLUMN "courses_id";
  ALTER TABLE "_courses_v_rels" DROP COLUMN "portfolio_cases_id";
  ALTER TABLE "_courses_v_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "fashion_collections_rels" DROP COLUMN "locale";
  ALTER TABLE "fashion_collections_rels" DROP COLUMN "courses_id";
  ALTER TABLE "fashion_collections_rels" DROP COLUMN "fashion_collections_id";
  ALTER TABLE "fashion_collections_rels" DROP COLUMN "portfolio_cases_id";
  ALTER TABLE "fashion_collections_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "_fashion_collections_v_rels" DROP COLUMN "locale";
  ALTER TABLE "_fashion_collections_v_rels" DROP COLUMN "courses_id";
  ALTER TABLE "_fashion_collections_v_rels" DROP COLUMN "fashion_collections_id";
  ALTER TABLE "_fashion_collections_v_rels" DROP COLUMN "portfolio_cases_id";
  ALTER TABLE "_fashion_collections_v_rels" DROP COLUMN "testimonials_id";
  DROP TYPE "public"."enum_directions_blocks_media_text_media_position";
  DROP TYPE "public"."enum__directions_v_blocks_media_text_media_position";
  DROP TYPE "public"."enum_services_blocks_media_text_media_position";
  DROP TYPE "public"."enum__services_v_blocks_media_text_media_position";
  DROP TYPE "public"."enum_courses_blocks_media_text_media_position";
  DROP TYPE "public"."enum__courses_v_blocks_media_text_media_position";
  DROP TYPE "public"."enum_fashion_collections_blocks_media_text_media_position";
  DROP TYPE "public"."enum__fashion_collections_v_blocks_media_text_media_position";
  DROP TYPE "public"."enum_pages_blocks_media_text_media_position";
  DROP TYPE "public"."enum__pages_v_blocks_media_text_media_position";`)
}
