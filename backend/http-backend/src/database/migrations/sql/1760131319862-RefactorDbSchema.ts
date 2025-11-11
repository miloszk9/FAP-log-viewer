import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorDbSchema1760131319862 implements MigrationInterface {
  name = 'RefactorDbSchema1760131319862';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Handle users table changes
    // Rename password to password_hash
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "password" TO "password_hash";`,
    );

    // Refactor refreshToken to refresh_token
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "refreshToken" TO "refresh_token";`,
    );
    // Ensure varchar(255) if not already
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "refresh_token" TYPE VARCHAR(255) USING "refresh_token"::VARCHAR(255);`,
    );
    // Update any NULLs to empty string to allow NOT NULL
    await queryRunner.query(
      `UPDATE "users" SET "refresh_token" = '' WHERE "refresh_token" IS NULL;`,
    );

    // Drop unused columns (isActive remains dropped as per plan)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isActive";`);

    // Rename timestamp columns to snake_case
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";`,
    );

    // Alter timestamp types to timestamptz
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "created_at" TYPE TIMESTAMP WITH TIME ZONE USING "created_at" AT TIME ZONE 'UTC';`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "updated_at" TYPE TIMESTAMP WITH TIME ZONE USING "updated_at" AT TIME ZONE 'UTC';`,
    );

    // Step 2: Drop foreign keys to allow renaming userId columns
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" DROP CONSTRAINT "FK_d3f0ce015affc8f99693df10d1a";`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_average" DROP CONSTRAINT "FK_1ce4989ba22f408fcbeee7f1ebd";`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_average" DROP CONSTRAINT "REL_1ce4989ba22f408fcbeee7f1eb";`,
    );

    // Step 3: fap_analysis changes
    // Rename columns
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" RENAME COLUMN "fileName" TO "file_name";`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" RENAME COLUMN "userId" TO "user_id";`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" RENAME COLUMN "regen" TO "fap_regen";`,
    );

    // Add new columns
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ADD COLUMN "log_date" TIMESTAMP WITH TIME ZONE;`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ADD COLUMN "distance" NUMERIC(10,2);`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ADD COLUMN "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ADD COLUMN "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();`,
    );

    // Alter sha256 to char(64)
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ALTER COLUMN "sha256" TYPE CHAR(64) USING "sha256"::CHAR(64);`,
    );

    // Handle status enum for fap_analysis
    await queryRunner.query(
      `CREATE TYPE "public"."analysis_status_enum" AS ENUM('Processing', 'Success', 'Failed');`,
    );
    // Assume old status values match enum exactly; if not, add UPDATE statements to map them, e.g., UPDATE fap_analysis SET status = 'Processing' WHERE LOWER(status) = 'processing';
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ALTER COLUMN "status" TYPE "public"."analysis_status_enum" USING "status"::"public"."analysis_status_enum";`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ALTER COLUMN "status" SET DEFAULT 'Processing';`,
    );

    // Make analysis nullable
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ALTER COLUMN "analysis" DROP NOT NULL;`,
    );

    // Version is already NOT NULL DEFAULT '', but entity has nullable true; keeping as is for now
    // Preserve existing message column (no changes needed)

    // Step 4: fap_average changes
    // Rename userId to user_id
    await queryRunner.query(
      `ALTER TABLE "fap_average" RENAME COLUMN "userId" TO "user_id";`,
    );

    // Add timestamps
    await queryRunner.query(
      `ALTER TABLE "fap_average" ADD COLUMN "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_average" ADD COLUMN "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();`,
    );

    // Alter sha256
    await queryRunner.query(
      `ALTER TABLE "fap_average" ALTER COLUMN "sha256" TYPE CHAR(64) USING "sha256"::CHAR(64);`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_average" ALTER COLUMN "sha256" DROP NOT NULL;`,
    );

    // Alter message to text and nullable
    await queryRunner.query(
      `ALTER TABLE "fap_average" ALTER COLUMN "message" TYPE TEXT USING "message"::TEXT;`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_average" ALTER COLUMN "message" DROP NOT NULL;`,
    );

    // Make average nullable
    await queryRunner.query(
      `ALTER TABLE "fap_average" ALTER COLUMN "average" DROP NOT NULL;`,
    );

    // Handle status enum for fap_average
    await queryRunner.query(
      `CREATE TYPE "public"."fap_average_status_enum" AS ENUM('CALCULATING', 'SUCCESS', 'FAILED');`,
    );
    // Update existing status values to match enum values
    await queryRunner.query(
      `UPDATE "fap_average" SET "status" = 'SUCCESS' WHERE "status" = 'Success';`,
    );
    await queryRunner.query(
      `UPDATE "fap_average" SET "status" = 'CALCULATING' WHERE "status" = '';`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_average" ALTER COLUMN "status" TYPE "public"."fap_average_status_enum" USING "status"::"public"."fap_average_status_enum";`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_average" ALTER COLUMN "status" SET DEFAULT 'CALCULATING';`,
    );

    // Step 5: Add constraints
    // Unique on fap_average user_id
    await queryRunner.query(
      `ALTER TABLE "fap_average" ADD CONSTRAINT "UQ_fap_average_user_id" UNIQUE ("user_id");`,
    );

    // Foreign keys
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ADD CONSTRAINT "FK_fap_analysis_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_average" ADD CONSTRAINT "FK_fap_average_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;`,
    );

    // Step 6: Add indexes
    await queryRunner.query(
      `CREATE INDEX "idx_fap_analysis_user_id" ON "fap_analysis" ("user_id");`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_fap_analysis_user_sha256" ON "fap_analysis" ("user_id", "sha256");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_fap_analysis_user_filename" ON "fap_analysis" ("user_id", "file_name");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_fap_average_user_id" ON "fap_average" ("user_id");`,
    );

    // Step 7: Enable RLS
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ENABLE ROW LEVEL SECURITY;`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_average" ENABLE ROW LEVEL SECURITY;`,
    );

    // RLS Policies for fap_analysis
    await queryRunner.query(
      `CREATE POLICY "select_fap_analysis_for_user" ON "fap_analysis" FOR SELECT USING ("user_id" = current_setting('app.current_user_id')::UUID);`,
    );
    await queryRunner.query(
      `CREATE POLICY "modify_fap_analysis_for_user" ON "fap_analysis" FOR ALL USING ("user_id" = current_setting('app.current_user_id')::UUID);`,
    );

    // RLS Policies for fap_average
    await queryRunner.query(
      `CREATE POLICY "select_fap_average_for_user" ON "fap_average" FOR SELECT USING ("user_id" = current_setting('app.current_user_id')::UUID);`,
    );
    await queryRunner.query(
      `CREATE POLICY "modify_fap_average_for_user" ON "fap_average" FOR ALL USING ("user_id" = current_setting('app.current_user_id')::UUID);`,
    );

    // Step 8: Add updated_at trigger function and triggers
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(
      `CREATE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
    );
    await queryRunner.query(
      `CREATE TRIGGER "update_fap_analysis_updated_at" BEFORE UPDATE ON "fap_analysis" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
    );
    await queryRunner.query(
      `CREATE TRIGGER "update_fap_average_updated_at" BEFORE UPDATE ON "fap_average" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse triggers
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS "update_users_updated_at" ON "users";`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS "update_fap_analysis_updated_at" ON "fap_analysis";`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS "update_fap_average_updated_at" ON "fap_average";`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS update_updated_at_column();`,
    );

    // Drop RLS policies
    await queryRunner.query(
      `DROP POLICY IF EXISTS "select_fap_analysis_for_user" ON "fap_analysis";`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "modify_fap_analysis_for_user" ON "fap_analysis";`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "select_fap_average_for_user" ON "fap_average";`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS "modify_fap_average_for_user" ON "fap_average";`,
    );

    // Disable RLS
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" DISABLE ROW LEVEL SECURITY;`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_average" DISABLE ROW LEVEL SECURITY;`,
    );

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_fap_analysis_user_id";`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_fap_analysis_user_sha256";`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_fap_analysis_user_filename";`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_fap_average_user_id";`);

    // Drop constraints
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" DROP CONSTRAINT IF EXISTS "FK_fap_analysis_user_id";`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_average" DROP CONSTRAINT IF EXISTS "FK_fap_average_user_id";`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_average" DROP CONSTRAINT IF EXISTS "UQ_fap_average_user_id";`,
    );

    // Reverse fap_average changes
    await queryRunner.query(
      `ALTER TABLE "fap_average" ALTER COLUMN "status" TYPE VARCHAR USING "status"::VARCHAR;`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."fap_average_status_enum";`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_average" ALTER COLUMN "status" SET NOT NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_average" ALTER COLUMN "status" SET DEFAULT '';`,
    ); // or whatever old default

    await queryRunner.query(
      `ALTER TABLE "fap_average" ALTER COLUMN "average" SET NOT NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_average" ALTER COLUMN "message" TYPE VARCHAR USING "message"::VARCHAR;`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_average" ALTER COLUMN "message" SET NOT NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_average" ALTER COLUMN "sha256" TYPE VARCHAR USING "sha256"::VARCHAR;`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_average" ALTER COLUMN "sha256" SET NOT NULL;`,
    );

    await queryRunner.query(
      `ALTER TABLE "fap_average" DROP COLUMN "updated_at";`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_average" DROP COLUMN "created_at";`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_average" RENAME COLUMN "user_id" TO "userId";`,
    );

    // Reverse fap_analysis changes
    // Message column is preserved, no action needed

    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ALTER COLUMN "version" SET NOT NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ALTER COLUMN "version" SET DEFAULT '';`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ALTER COLUMN "analysis" SET NOT NULL;`,
    );

    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ALTER COLUMN "status" TYPE VARCHAR USING "status"::VARCHAR;`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."analysis_status_enum";`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ALTER COLUMN "status" SET NOT NULL;`,
    );

    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ALTER COLUMN "sha256" TYPE VARCHAR USING "sha256"::VARCHAR;`,
    );

    await queryRunner.query(
      `ALTER TABLE "fap_analysis" DROP COLUMN "updated_at";`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" DROP COLUMN "created_at";`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" DROP COLUMN "distance";`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" DROP COLUMN "log_date";`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" RENAME COLUMN "fap_regen" TO "regen";`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" RENAME COLUMN "user_id" TO "userId";`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" RENAME COLUMN "file_name" TO "fileName";`,
    );

    // Reverse users
    // Reverse refresh_token to refreshToken
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "refresh_token" TO "refreshToken";`,
    );

    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "updated_at" TYPE TIMESTAMP USING "updated_at" AT TIME ZONE 'UTC';`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "created_at" TYPE TIMESTAMP USING "created_at" AT TIME ZONE 'UTC';`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "updated_at" TO "updatedAt";`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "created_at" TO "createdAt";`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "password_hash" TO "password";`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;`,
    );

    // Add back FKs for old schema
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ADD CONSTRAINT "FK_d3f0ce015affc8f99693df10d1a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_average" ADD CONSTRAINT "REL_1ce4989ba22f408fcbeee7f1eb" UNIQUE ("userId");`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_average" ADD CONSTRAINT "FK_1ce4989ba22f408fcbeee7f1ebd" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`,
    );
  }
}
