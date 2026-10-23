import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "yjdev"."enum_videos_kind" ADD VALUE 'research';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "yjdev"."videos" ALTER COLUMN "kind" SET DATA TYPE text;
  ALTER TABLE "yjdev"."videos" ALTER COLUMN "kind" SET DEFAULT 'tutorial'::text;
  DROP TYPE "yjdev"."enum_videos_kind";
  CREATE TYPE "yjdev"."enum_videos_kind" AS ENUM('tutorial', 'demo', 'talk');
  ALTER TABLE "yjdev"."videos" ALTER COLUMN "kind" SET DEFAULT 'tutorial'::"yjdev"."enum_videos_kind";
  ALTER TABLE "yjdev"."videos" ALTER COLUMN "kind" SET DATA TYPE "yjdev"."enum_videos_kind" USING "kind"::"yjdev"."enum_videos_kind";`)
}
