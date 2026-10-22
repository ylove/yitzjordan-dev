import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // The adapter uses schemaName "yjdev", which a fresh database does not have yet.
  await db.execute(sql`CREATE SCHEMA IF NOT EXISTS "yjdev";`)

  await db.execute(sql`
   CREATE TYPE "yjdev"."enum_articles_kind" AS ENUM('research', 'blog');
  CREATE TYPE "yjdev"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "yjdev"."enum_projects_status" AS ENUM('open-source', 'in-development', 'available', 'archived');
  CREATE TYPE "yjdev"."enum_projects_github_cta" AS ENUM('view', 'get', 'follow');
  CREATE TYPE "yjdev"."enum_projects_visual" AS ENUM('none', 'roundtable', 'lawglass', 'agent-union', 'snapwing');
  CREATE TYPE "yjdev"."enum_projects_schema_type" AS ENUM('source-code', 'application', 'organization');
  CREATE TYPE "yjdev"."enum_videos_kind" AS ENUM('tutorial', 'demo', 'talk');
  CREATE TYPE "yjdev"."enum_videos_platform" AS ENUM('youtube', 'upload', 'linkedin', 'x', 'other');
  CREATE TYPE "yjdev"."enum_skills_group" AS ENUM('ai', 'engineering', 'frontend', 'platform', 'leadership');
  CREATE TYPE "yjdev"."enum_evidence_strength" AS ENUM('production', 'open-source', 'research', 'writing');
  CREATE TYPE "yjdev"."enum_inquiries_intent" AS ENUM('hiring', 'contract', 'advisory', 'speaking', 'collaboration', 'question', 'other');
  CREATE TYPE "yjdev"."enum_inquiries_channel" AS ENUM('api', 'mcp');
  CREATE TYPE "yjdev"."enum_inquiries_status" AS ENUM('new', 'contacted', 'closed');
  CREATE TYPE "yjdev"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "yjdev"."enum_profile_experience_display" AS ENUM('named', 'generic');
  CREATE TYPE "yjdev"."enum_profile_experience_schema_role" AS ENUM('worksFor', 'alumniOf', 'none');
  CREATE TYPE "yjdev"."enum_profile_availability_status" AS ENUM('open', 'selective', 'not-looking', 'unspecified');
  CREATE TABLE "yjdev"."articles_anchors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"anchor_id" varchar NOT NULL
  );
  
  CREATE TABLE "yjdev"."articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"kind" "yjdev"."enum_articles_kind" DEFAULT 'research' NOT NULL,
  	"status" "yjdev"."enum_articles_status" DEFAULT 'draft' NOT NULL,
  	"publish_date" timestamp(3) with time zone,
  	"updated_date" timestamp(3) with time zone,
  	"excerpt" varchar NOT NULL,
  	"body" jsonb NOT NULL,
  	"previous_id" integer,
  	"legacy_path" varchar,
  	"plain_text" varchar,
  	"word_count" numeric,
  	"reading_minutes" numeric,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "yjdev"."articles_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "yjdev"."articles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"skills_id" integer,
  	"projects_id" integer,
  	"videos_id" integer
  );
  
  CREATE TABLE "yjdev"."projects_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL
  );
  
  CREATE TABLE "yjdev"."projects_audiences" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL
  );
  
  CREATE TABLE "yjdev"."projects_capabilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar
  );
  
  CREATE TABLE "yjdev"."projects_figures" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"source" varchar
  );
  
  CREATE TABLE "yjdev"."projects_engineering_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL
  );
  
  CREATE TABLE "yjdev"."projects_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"q" varchar NOT NULL,
  	"a" varchar NOT NULL
  );
  
  CREATE TABLE "yjdev"."projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"one_liner" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"status" "yjdev"."enum_projects_status" DEFAULT 'open-source' NOT NULL,
  	"status_label" varchar,
  	"hero_headline" varchar NOT NULL,
  	"hero_lead" varchar NOT NULL,
  	"github" varchar,
  	"github_cta" "yjdev"."enum_projects_github_cta" DEFAULT 'view',
  	"homepage" varchar,
  	"official_url" varchar,
  	"official_label" varchar,
  	"secondary_cta_label" varchar,
  	"secondary_cta_href" varchar,
  	"visual" "yjdev"."enum_projects_visual" DEFAULT 'none',
  	"visual_caption" varchar,
  	"steps_title" varchar,
  	"audience_title" varchar,
  	"capabilities_title" varchar,
  	"install_title" varchar,
  	"install_intro" varchar,
  	"install_commands" varchar,
  	"install_note" varchar,
  	"schema_type" "yjdev"."enum_projects_schema_type" DEFAULT 'source-code',
  	"license" varchar,
  	"language" varchar,
  	"application_category" varchar DEFAULT 'DeveloperApplication',
  	"slug" varchar NOT NULL,
  	"order" numeric DEFAULT 100,
  	"featured" boolean DEFAULT false,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "yjdev"."projects_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "yjdev"."projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"skills_id" integer,
  	"articles_id" integer,
  	"videos_id" integer
  );
  
  CREATE TABLE "yjdev"."videos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"kind" "yjdev"."enum_videos_kind" DEFAULT 'tutorial' NOT NULL,
  	"platform" "yjdev"."enum_videos_platform" DEFAULT 'youtube' NOT NULL,
  	"url" varchar NOT NULL,
  	"youtube_id" varchar,
  	"file_id" integer,
  	"thumbnail_id" integer,
  	"description" varchar NOT NULL,
  	"transcript" varchar,
  	"duration_seconds" numeric NOT NULL,
  	"upload_date" timestamp(3) with time zone NOT NULL,
  	"vertical" boolean DEFAULT false,
  	"featured" boolean DEFAULT false,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "yjdev"."videos_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"projects_id" integer,
  	"skills_id" integer
  );
  
  CREATE TABLE "yjdev"."skills" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"key" varchar NOT NULL,
  	"group" "yjdev"."enum_skills_group" DEFAULT 'engineering' NOT NULL,
  	"wikidata_id" varchar,
  	"knows_about" boolean DEFAULT true,
  	"years" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "yjdev"."skills_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "yjdev"."evidence" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"claim" varchar NOT NULL,
  	"detail" varchar,
  	"strength" "yjdev"."enum_evidence_strength" DEFAULT 'production' NOT NULL,
  	"external_url" varchar,
  	"context" varchar,
  	"period" varchar,
  	"public" boolean DEFAULT true,
  	"weight" numeric DEFAULT 50,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "yjdev"."evidence_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"skills_id" integer,
  	"projects_id" integer,
  	"articles_id" integer,
  	"videos_id" integer
  );
  
  CREATE TABLE "yjdev"."inquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"intent" "yjdev"."enum_inquiries_intent" NOT NULL,
  	"channel" "yjdev"."enum_inquiries_channel" NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"contact_role" varchar,
  	"consent" boolean DEFAULT false NOT NULL,
  	"company" varchar,
  	"team" varchar,
  	"role_title" varchar,
  	"employment_type" varchar,
  	"location" varchar,
  	"job_url" varchar,
  	"problem" varchar,
  	"stack" varchar,
  	"requirements_summary" varchar,
  	"timeline" varchar,
  	"message" varchar,
  	"agent_name" varchar,
  	"agent_platform" varchar,
  	"agent_model" varchar,
  	"raw" jsonb,
  	"status" "yjdev"."enum_inquiries_status" DEFAULT 'new' NOT NULL,
  	"ip_hash" varchar,
  	"user_agent" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "yjdev"."requirement_terms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"day" varchar NOT NULL,
  	"term" varchar NOT NULL,
  	"skill" varchar,
  	"matched" boolean DEFAULT false,
  	"count" numeric DEFAULT 1 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "yjdev"."media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"prefix" varchar DEFAULT '',
  	"_objectkey" varchar,
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
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "yjdev"."users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "yjdev"."users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "yjdev"."enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"enable_a_p_i_key" boolean,
  	"api_key" varchar,
  	"api_key_index" varchar,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "yjdev"."payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "yjdev"."payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "yjdev"."payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"articles_id" integer,
  	"projects_id" integer,
  	"videos_id" integer,
  	"skills_id" integer,
  	"evidence_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "yjdev"."payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "yjdev"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "yjdev"."payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "yjdev"."profile_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "yjdev"."profile_experience" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"display" "yjdev"."enum_profile_experience_display" DEFAULT 'generic' NOT NULL,
  	"schema_role" "yjdev"."enum_profile_experience_schema_role" DEFAULT 'none' NOT NULL,
  	"org_name" varchar,
  	"org_url" varchar,
  	"org_wikidata_id" varchar,
  	"org_id" varchar,
  	"generic_label" varchar,
  	"title" varchar NOT NULL,
  	"start" varchar,
  	"end" varchar,
  	"summary" varchar
  );
  
  CREATE TABLE "yjdev"."profile_education" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"field" varchar,
  	"url" varchar,
  	"wikidata_id" varchar
  );
  
  CREATE TABLE "yjdev"."profile_locations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"city" varchar NOT NULL,
  	"region" varchar,
  	"country" varchar DEFAULT 'US',
  	"wikidata_id" varchar
  );
  
  CREATE TABLE "yjdev"."profile_languages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"code" varchar NOT NULL
  );
  
  CREATE TABLE "yjdev"."profile_same_as" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "yjdev"."profile" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar DEFAULT 'Yitz Jordan' NOT NULL,
  	"given_name" varchar DEFAULT 'Yitz',
  	"family_name" varchar DEFAULT 'Jordan',
  	"headline" varchar NOT NULL,
  	"intro" varchar NOT NULL,
  	"summary" varchar NOT NULL,
  	"about" jsonb,
  	"photo_id" integer,
  	"availability_status" "yjdev"."enum_profile_availability_status" DEFAULT 'unspecified',
  	"availability_note" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "yjdev"."profile_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "yjdev"."articles_anchors" ADD CONSTRAINT "articles_anchors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "yjdev"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."articles" ADD CONSTRAINT "articles_previous_id_articles_id_fk" FOREIGN KEY ("previous_id") REFERENCES "yjdev"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "yjdev"."articles" ADD CONSTRAINT "articles_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "yjdev"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "yjdev"."articles_texts" ADD CONSTRAINT "articles_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "yjdev"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."articles_rels" ADD CONSTRAINT "articles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "yjdev"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."articles_rels" ADD CONSTRAINT "articles_rels_skills_fk" FOREIGN KEY ("skills_id") REFERENCES "yjdev"."skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."articles_rels" ADD CONSTRAINT "articles_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "yjdev"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."articles_rels" ADD CONSTRAINT "articles_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "yjdev"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."projects_steps" ADD CONSTRAINT "projects_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "yjdev"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."projects_audiences" ADD CONSTRAINT "projects_audiences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "yjdev"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."projects_capabilities" ADD CONSTRAINT "projects_capabilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "yjdev"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."projects_figures" ADD CONSTRAINT "projects_figures_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "yjdev"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."projects_engineering_notes" ADD CONSTRAINT "projects_engineering_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "yjdev"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."projects_faq" ADD CONSTRAINT "projects_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "yjdev"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."projects" ADD CONSTRAINT "projects_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "yjdev"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "yjdev"."projects_texts" ADD CONSTRAINT "projects_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "yjdev"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "yjdev"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."projects_rels" ADD CONSTRAINT "projects_rels_skills_fk" FOREIGN KEY ("skills_id") REFERENCES "yjdev"."skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."projects_rels" ADD CONSTRAINT "projects_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "yjdev"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."projects_rels" ADD CONSTRAINT "projects_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "yjdev"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."videos" ADD CONSTRAINT "videos_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "yjdev"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "yjdev"."videos" ADD CONSTRAINT "videos_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "yjdev"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "yjdev"."videos" ADD CONSTRAINT "videos_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "yjdev"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "yjdev"."videos_rels" ADD CONSTRAINT "videos_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "yjdev"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."videos_rels" ADD CONSTRAINT "videos_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "yjdev"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."videos_rels" ADD CONSTRAINT "videos_rels_skills_fk" FOREIGN KEY ("skills_id") REFERENCES "yjdev"."skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."skills_texts" ADD CONSTRAINT "skills_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "yjdev"."skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."evidence_rels" ADD CONSTRAINT "evidence_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "yjdev"."evidence"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."evidence_rels" ADD CONSTRAINT "evidence_rels_skills_fk" FOREIGN KEY ("skills_id") REFERENCES "yjdev"."skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."evidence_rels" ADD CONSTRAINT "evidence_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "yjdev"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."evidence_rels" ADD CONSTRAINT "evidence_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "yjdev"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."evidence_rels" ADD CONSTRAINT "evidence_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "yjdev"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "yjdev"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "yjdev"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "yjdev"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "yjdev"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "yjdev"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_skills_fk" FOREIGN KEY ("skills_id") REFERENCES "yjdev"."skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_evidence_fk" FOREIGN KEY ("evidence_id") REFERENCES "yjdev"."evidence"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "yjdev"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "yjdev"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "yjdev"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "yjdev"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."profile_highlights" ADD CONSTRAINT "profile_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "yjdev"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."profile_experience" ADD CONSTRAINT "profile_experience_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "yjdev"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."profile_education" ADD CONSTRAINT "profile_education_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "yjdev"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."profile_locations" ADD CONSTRAINT "profile_locations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "yjdev"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."profile_languages" ADD CONSTRAINT "profile_languages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "yjdev"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."profile_same_as" ADD CONSTRAINT "profile_same_as_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "yjdev"."profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yjdev"."profile" ADD CONSTRAINT "profile_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "yjdev"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "yjdev"."profile_texts" ADD CONSTRAINT "profile_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "yjdev"."profile"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articles_anchors_order_idx" ON "yjdev"."articles_anchors" USING btree ("_order");
  CREATE INDEX "articles_anchors_parent_id_idx" ON "yjdev"."articles_anchors" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "yjdev"."articles" USING btree ("slug");
  CREATE INDEX "articles_kind_idx" ON "yjdev"."articles" USING btree ("kind");
  CREATE INDEX "articles_status_idx" ON "yjdev"."articles" USING btree ("status");
  CREATE INDEX "articles_publish_date_idx" ON "yjdev"."articles" USING btree ("publish_date");
  CREATE INDEX "articles_previous_idx" ON "yjdev"."articles" USING btree ("previous_id");
  CREATE INDEX "articles_meta_meta_image_idx" ON "yjdev"."articles" USING btree ("meta_image_id");
  CREATE INDEX "articles_updated_at_idx" ON "yjdev"."articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "yjdev"."articles" USING btree ("created_at");
  CREATE INDEX "articles_texts_order_parent" ON "yjdev"."articles_texts" USING btree ("order","parent_id");
  CREATE INDEX "articles_rels_order_idx" ON "yjdev"."articles_rels" USING btree ("order");
  CREATE INDEX "articles_rels_parent_idx" ON "yjdev"."articles_rels" USING btree ("parent_id");
  CREATE INDEX "articles_rels_path_idx" ON "yjdev"."articles_rels" USING btree ("path");
  CREATE INDEX "articles_rels_skills_id_idx" ON "yjdev"."articles_rels" USING btree ("skills_id");
  CREATE INDEX "articles_rels_projects_id_idx" ON "yjdev"."articles_rels" USING btree ("projects_id");
  CREATE INDEX "articles_rels_videos_id_idx" ON "yjdev"."articles_rels" USING btree ("videos_id");
  CREATE INDEX "projects_steps_order_idx" ON "yjdev"."projects_steps" USING btree ("_order");
  CREATE INDEX "projects_steps_parent_id_idx" ON "yjdev"."projects_steps" USING btree ("_parent_id");
  CREATE INDEX "projects_audiences_order_idx" ON "yjdev"."projects_audiences" USING btree ("_order");
  CREATE INDEX "projects_audiences_parent_id_idx" ON "yjdev"."projects_audiences" USING btree ("_parent_id");
  CREATE INDEX "projects_capabilities_order_idx" ON "yjdev"."projects_capabilities" USING btree ("_order");
  CREATE INDEX "projects_capabilities_parent_id_idx" ON "yjdev"."projects_capabilities" USING btree ("_parent_id");
  CREATE INDEX "projects_figures_order_idx" ON "yjdev"."projects_figures" USING btree ("_order");
  CREATE INDEX "projects_figures_parent_id_idx" ON "yjdev"."projects_figures" USING btree ("_parent_id");
  CREATE INDEX "projects_engineering_notes_order_idx" ON "yjdev"."projects_engineering_notes" USING btree ("_order");
  CREATE INDEX "projects_engineering_notes_parent_id_idx" ON "yjdev"."projects_engineering_notes" USING btree ("_parent_id");
  CREATE INDEX "projects_faq_order_idx" ON "yjdev"."projects_faq" USING btree ("_order");
  CREATE INDEX "projects_faq_parent_id_idx" ON "yjdev"."projects_faq" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "yjdev"."projects" USING btree ("slug");
  CREATE INDEX "projects_meta_meta_image_idx" ON "yjdev"."projects" USING btree ("meta_image_id");
  CREATE INDEX "projects_updated_at_idx" ON "yjdev"."projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "yjdev"."projects" USING btree ("created_at");
  CREATE INDEX "projects_texts_order_parent" ON "yjdev"."projects_texts" USING btree ("order","parent_id");
  CREATE INDEX "projects_rels_order_idx" ON "yjdev"."projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "yjdev"."projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "yjdev"."projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_skills_id_idx" ON "yjdev"."projects_rels" USING btree ("skills_id");
  CREATE INDEX "projects_rels_articles_id_idx" ON "yjdev"."projects_rels" USING btree ("articles_id");
  CREATE INDEX "projects_rels_videos_id_idx" ON "yjdev"."projects_rels" USING btree ("videos_id");
  CREATE UNIQUE INDEX "videos_slug_idx" ON "yjdev"."videos" USING btree ("slug");
  CREATE INDEX "videos_file_idx" ON "yjdev"."videos" USING btree ("file_id");
  CREATE INDEX "videos_thumbnail_idx" ON "yjdev"."videos" USING btree ("thumbnail_id");
  CREATE INDEX "videos_meta_meta_image_idx" ON "yjdev"."videos" USING btree ("meta_image_id");
  CREATE INDEX "videos_updated_at_idx" ON "yjdev"."videos" USING btree ("updated_at");
  CREATE INDEX "videos_created_at_idx" ON "yjdev"."videos" USING btree ("created_at");
  CREATE INDEX "videos_rels_order_idx" ON "yjdev"."videos_rels" USING btree ("order");
  CREATE INDEX "videos_rels_parent_idx" ON "yjdev"."videos_rels" USING btree ("parent_id");
  CREATE INDEX "videos_rels_path_idx" ON "yjdev"."videos_rels" USING btree ("path");
  CREATE INDEX "videos_rels_projects_id_idx" ON "yjdev"."videos_rels" USING btree ("projects_id");
  CREATE INDEX "videos_rels_skills_id_idx" ON "yjdev"."videos_rels" USING btree ("skills_id");
  CREATE UNIQUE INDEX "skills_key_idx" ON "yjdev"."skills" USING btree ("key");
  CREATE INDEX "skills_updated_at_idx" ON "yjdev"."skills" USING btree ("updated_at");
  CREATE INDEX "skills_created_at_idx" ON "yjdev"."skills" USING btree ("created_at");
  CREATE INDEX "skills_texts_order_parent" ON "yjdev"."skills_texts" USING btree ("order","parent_id");
  CREATE INDEX "evidence_updated_at_idx" ON "yjdev"."evidence" USING btree ("updated_at");
  CREATE INDEX "evidence_created_at_idx" ON "yjdev"."evidence" USING btree ("created_at");
  CREATE INDEX "evidence_rels_order_idx" ON "yjdev"."evidence_rels" USING btree ("order");
  CREATE INDEX "evidence_rels_parent_idx" ON "yjdev"."evidence_rels" USING btree ("parent_id");
  CREATE INDEX "evidence_rels_path_idx" ON "yjdev"."evidence_rels" USING btree ("path");
  CREATE INDEX "evidence_rels_skills_id_idx" ON "yjdev"."evidence_rels" USING btree ("skills_id");
  CREATE INDEX "evidence_rels_projects_id_idx" ON "yjdev"."evidence_rels" USING btree ("projects_id");
  CREATE INDEX "evidence_rels_articles_id_idx" ON "yjdev"."evidence_rels" USING btree ("articles_id");
  CREATE INDEX "evidence_rels_videos_id_idx" ON "yjdev"."evidence_rels" USING btree ("videos_id");
  CREATE INDEX "inquiries_email_idx" ON "yjdev"."inquiries" USING btree ("email");
  CREATE INDEX "inquiries_status_idx" ON "yjdev"."inquiries" USING btree ("status");
  CREATE INDEX "inquiries_ip_hash_idx" ON "yjdev"."inquiries" USING btree ("ip_hash");
  CREATE INDEX "inquiries_updated_at_idx" ON "yjdev"."inquiries" USING btree ("updated_at");
  CREATE INDEX "inquiries_created_at_idx" ON "yjdev"."inquiries" USING btree ("created_at");
  CREATE INDEX "requirement_terms_day_idx" ON "yjdev"."requirement_terms" USING btree ("day");
  CREATE INDEX "requirement_terms_updated_at_idx" ON "yjdev"."requirement_terms" USING btree ("updated_at");
  CREATE INDEX "requirement_terms_created_at_idx" ON "yjdev"."requirement_terms" USING btree ("created_at");
  CREATE UNIQUE INDEX "day_term_idx" ON "yjdev"."requirement_terms" USING btree ("day","term");
  CREATE INDEX "media_updated_at_idx" ON "yjdev"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "yjdev"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "yjdev"."media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "yjdev"."media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "yjdev"."media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "yjdev"."media" USING btree ("sizes_hero_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "yjdev"."media" USING btree ("sizes_og_filename");
  CREATE INDEX "users_sessions_order_idx" ON "yjdev"."users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "yjdev"."users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "yjdev"."users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "yjdev"."users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "yjdev"."users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "yjdev"."payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "yjdev"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "yjdev"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "yjdev"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "yjdev"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "yjdev"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "yjdev"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "yjdev"."payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "yjdev"."payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_videos_id_idx" ON "yjdev"."payload_locked_documents_rels" USING btree ("videos_id");
  CREATE INDEX "payload_locked_documents_rels_skills_id_idx" ON "yjdev"."payload_locked_documents_rels" USING btree ("skills_id");
  CREATE INDEX "payload_locked_documents_rels_evidence_id_idx" ON "yjdev"."payload_locked_documents_rels" USING btree ("evidence_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "yjdev"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "yjdev"."payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "yjdev"."payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "yjdev"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "yjdev"."payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "yjdev"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "yjdev"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "yjdev"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "yjdev"."payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "yjdev"."payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "yjdev"."payload_migrations" USING btree ("created_at");
  CREATE INDEX "profile_highlights_order_idx" ON "yjdev"."profile_highlights" USING btree ("_order");
  CREATE INDEX "profile_highlights_parent_id_idx" ON "yjdev"."profile_highlights" USING btree ("_parent_id");
  CREATE INDEX "profile_experience_order_idx" ON "yjdev"."profile_experience" USING btree ("_order");
  CREATE INDEX "profile_experience_parent_id_idx" ON "yjdev"."profile_experience" USING btree ("_parent_id");
  CREATE INDEX "profile_education_order_idx" ON "yjdev"."profile_education" USING btree ("_order");
  CREATE INDEX "profile_education_parent_id_idx" ON "yjdev"."profile_education" USING btree ("_parent_id");
  CREATE INDEX "profile_locations_order_idx" ON "yjdev"."profile_locations" USING btree ("_order");
  CREATE INDEX "profile_locations_parent_id_idx" ON "yjdev"."profile_locations" USING btree ("_parent_id");
  CREATE INDEX "profile_languages_order_idx" ON "yjdev"."profile_languages" USING btree ("_order");
  CREATE INDEX "profile_languages_parent_id_idx" ON "yjdev"."profile_languages" USING btree ("_parent_id");
  CREATE INDEX "profile_same_as_order_idx" ON "yjdev"."profile_same_as" USING btree ("_order");
  CREATE INDEX "profile_same_as_parent_id_idx" ON "yjdev"."profile_same_as" USING btree ("_parent_id");
  CREATE INDEX "profile_photo_idx" ON "yjdev"."profile" USING btree ("photo_id");
  CREATE INDEX "profile_texts_order_parent" ON "yjdev"."profile_texts" USING btree ("order","parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "yjdev"."articles_anchors" CASCADE;
  DROP TABLE "yjdev"."articles" CASCADE;
  DROP TABLE "yjdev"."articles_texts" CASCADE;
  DROP TABLE "yjdev"."articles_rels" CASCADE;
  DROP TABLE "yjdev"."projects_steps" CASCADE;
  DROP TABLE "yjdev"."projects_audiences" CASCADE;
  DROP TABLE "yjdev"."projects_capabilities" CASCADE;
  DROP TABLE "yjdev"."projects_figures" CASCADE;
  DROP TABLE "yjdev"."projects_engineering_notes" CASCADE;
  DROP TABLE "yjdev"."projects_faq" CASCADE;
  DROP TABLE "yjdev"."projects" CASCADE;
  DROP TABLE "yjdev"."projects_texts" CASCADE;
  DROP TABLE "yjdev"."projects_rels" CASCADE;
  DROP TABLE "yjdev"."videos" CASCADE;
  DROP TABLE "yjdev"."videos_rels" CASCADE;
  DROP TABLE "yjdev"."skills" CASCADE;
  DROP TABLE "yjdev"."skills_texts" CASCADE;
  DROP TABLE "yjdev"."evidence" CASCADE;
  DROP TABLE "yjdev"."evidence_rels" CASCADE;
  DROP TABLE "yjdev"."inquiries" CASCADE;
  DROP TABLE "yjdev"."requirement_terms" CASCADE;
  DROP TABLE "yjdev"."media" CASCADE;
  DROP TABLE "yjdev"."users_sessions" CASCADE;
  DROP TABLE "yjdev"."users" CASCADE;
  DROP TABLE "yjdev"."payload_kv" CASCADE;
  DROP TABLE "yjdev"."payload_locked_documents" CASCADE;
  DROP TABLE "yjdev"."payload_locked_documents_rels" CASCADE;
  DROP TABLE "yjdev"."payload_preferences" CASCADE;
  DROP TABLE "yjdev"."payload_preferences_rels" CASCADE;
  DROP TABLE "yjdev"."payload_migrations" CASCADE;
  DROP TABLE "yjdev"."profile_highlights" CASCADE;
  DROP TABLE "yjdev"."profile_experience" CASCADE;
  DROP TABLE "yjdev"."profile_education" CASCADE;
  DROP TABLE "yjdev"."profile_locations" CASCADE;
  DROP TABLE "yjdev"."profile_languages" CASCADE;
  DROP TABLE "yjdev"."profile_same_as" CASCADE;
  DROP TABLE "yjdev"."profile" CASCADE;
  DROP TABLE "yjdev"."profile_texts" CASCADE;
  DROP TYPE "yjdev"."enum_articles_kind";
  DROP TYPE "yjdev"."enum_articles_status";
  DROP TYPE "yjdev"."enum_projects_status";
  DROP TYPE "yjdev"."enum_projects_github_cta";
  DROP TYPE "yjdev"."enum_projects_visual";
  DROP TYPE "yjdev"."enum_projects_schema_type";
  DROP TYPE "yjdev"."enum_videos_kind";
  DROP TYPE "yjdev"."enum_videos_platform";
  DROP TYPE "yjdev"."enum_skills_group";
  DROP TYPE "yjdev"."enum_evidence_strength";
  DROP TYPE "yjdev"."enum_inquiries_intent";
  DROP TYPE "yjdev"."enum_inquiries_channel";
  DROP TYPE "yjdev"."enum_inquiries_status";
  DROP TYPE "yjdev"."enum_users_role";
  DROP TYPE "yjdev"."enum_profile_experience_display";
  DROP TYPE "yjdev"."enum_profile_experience_schema_role";
  DROP TYPE "yjdev"."enum_profile_availability_status";`)
}
