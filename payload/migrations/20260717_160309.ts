import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses_locales" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "service_label" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "audience_title" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "format_title" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "method_title" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "prerequisites_title" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "curriculum_title" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "curriculum_summary" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "outcomes_title" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "outcomes_summary" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "commercial_title" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "cta_title" varchar;
  ALTER TABLE "courses_locales" ADD COLUMN "cta_summary" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_eyebrow" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_service_label" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_audience_title" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_format_title" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_method_title" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_prerequisites_title" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_curriculum_title" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_curriculum_summary" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_outcomes_title" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_outcomes_summary" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_commercial_title" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_cta_title" varchar;
  ALTER TABLE "_courses_v_locales" ADD COLUMN "version_cta_summary" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses_locales" DROP COLUMN "eyebrow";
  ALTER TABLE "courses_locales" DROP COLUMN "service_label";
  ALTER TABLE "courses_locales" DROP COLUMN "audience_title";
  ALTER TABLE "courses_locales" DROP COLUMN "format_title";
  ALTER TABLE "courses_locales" DROP COLUMN "method_title";
  ALTER TABLE "courses_locales" DROP COLUMN "prerequisites_title";
  ALTER TABLE "courses_locales" DROP COLUMN "curriculum_title";
  ALTER TABLE "courses_locales" DROP COLUMN "curriculum_summary";
  ALTER TABLE "courses_locales" DROP COLUMN "outcomes_title";
  ALTER TABLE "courses_locales" DROP COLUMN "outcomes_summary";
  ALTER TABLE "courses_locales" DROP COLUMN "commercial_title";
  ALTER TABLE "courses_locales" DROP COLUMN "cta_title";
  ALTER TABLE "courses_locales" DROP COLUMN "cta_summary";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_eyebrow";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_service_label";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_audience_title";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_format_title";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_method_title";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_prerequisites_title";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_curriculum_title";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_curriculum_summary";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_outcomes_title";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_outcomes_summary";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_commercial_title";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_cta_title";
  ALTER TABLE "_courses_v_locales" DROP COLUMN "version_cta_summary";`)
}
