import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "yjdev"."enum_opportunities_work_arrangement" AS ENUM('remote', 'hybrid', 'onsite');
  CREATE TYPE "yjdev"."enum_opportunities_employment_type" AS ENUM('FULL_TIME', 'CONTRACTOR', 'PART_TIME', 'TEMPORARY', 'OTHER');
  CREATE TYPE "yjdev"."enum_opportunities_ats_ai_screening" AS ENUM('yes', 'no', 'unknown');
  CREATE TYPE "yjdev"."enum_opportunities_status" AS ENUM('received', 'in_review', 'replied', 'declined');
  CREATE TYPE "yjdev"."enum_opportunities_channel" AS ENUM('api', 'mcp', 'form');
  CREATE TABLE "yjdev"."opportunities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"domain_check" varchar,
  	"match_line" varchar,
  	"title" varchar NOT NULL,
  	"company_name" varchar NOT NULL,
  	"company_domain" varchar NOT NULL,
  	"posting_url" varchar,
  	"no_public_posting" boolean,
  	"job_location" varchar NOT NULL,
  	"work_arrangement" "yjdev"."enum_opportunities_work_arrangement",
  	"employment_type" "yjdev"."enum_opportunities_employment_type",
  	"valid_through" varchar,
  	"contact_name" varchar NOT NULL,
  	"contact_role" varchar,
  	"contact_email" varchar NOT NULL,
  	"contact_linkedin" varchar,
  	"why_this_person" varchar NOT NULL,
  	"team_context" varchar,
  	"product_context" varchar,
  	"stack" varchar,
  	"first_ninety_days" varchar,
  	"hiring_process" varchar,
  	"ats_platform" varchar,
  	"ats_ai_screening" "yjdev"."enum_opportunities_ats_ai_screening",
  	"application_url" varchar,
  	"preferred_next_step" varchar,
  	"comp_band" varchar,
  	"requirements_matched" jsonb,
  	"found_via" varchar,
  	"agent_name" varchar,
  	"agent_platform" varchar,
  	"agent_model" varchar,
  	"consent_statement" varchar NOT NULL,
  	"brief_version" varchar NOT NULL,
  	"raw" jsonb,
  	"status" "yjdev"."enum_opportunities_status" DEFAULT 'received' NOT NULL,
  	"keep" boolean DEFAULT false,
  	"public_id" varchar NOT NULL,
  	"channel" "yjdev"."enum_opportunities_channel" NOT NULL,
  	"ip_hash" varchar,
  	"user_agent" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE INDEX "opportunities_company_domain_idx" ON "yjdev"."opportunities" USING btree ("company_domain");
  CREATE INDEX "opportunities_contact_email_idx" ON "yjdev"."opportunities" USING btree ("contact_email");
  CREATE INDEX "opportunities_status_idx" ON "yjdev"."opportunities" USING btree ("status");
  CREATE UNIQUE INDEX "opportunities_public_id_idx" ON "yjdev"."opportunities" USING btree ("public_id");
  CREATE INDEX "opportunities_ip_hash_idx" ON "yjdev"."opportunities" USING btree ("ip_hash");
  CREATE INDEX "opportunities_updated_at_idx" ON "yjdev"."opportunities" USING btree ("updated_at");
  CREATE INDEX "opportunities_created_at_idx" ON "yjdev"."opportunities" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "yjdev"."opportunities" CASCADE;
  DROP TYPE "yjdev"."enum_opportunities_work_arrangement";
  DROP TYPE "yjdev"."enum_opportunities_employment_type";
  DROP TYPE "yjdev"."enum_opportunities_ats_ai_screening";
  DROP TYPE "yjdev"."enum_opportunities_status";
  DROP TYPE "yjdev"."enum_opportunities_channel";`)
}
