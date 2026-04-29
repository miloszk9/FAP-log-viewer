import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDateProperties1777492642463 implements MigrationInterface {
    name = 'AddDateProperties1777492642463'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fap_average" DROP CONSTRAINT "FK_fap_average_user_id"`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" DROP CONSTRAINT "FK_fap_analysis_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_fap_average_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_fap_analysis_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_fap_analysis_user_sha256"`);
        await queryRunner.query(`DROP INDEX "public"."idx_fap_analysis_user_filename"`);
        await queryRunner.query(`CREATE TYPE "public"."fap_average_type_enum" AS ENUM('OVERALL', 'MONTHLY', 'YEARLY')`);
        await queryRunner.query(`ALTER TABLE "fap_average" ADD "type" "public"."fap_average_type_enum" NOT NULL DEFAULT 'OVERALL'`);
        await queryRunner.query(`ALTER TABLE "fap_average" ADD "year" integer`);
        await queryRunner.query(`ALTER TABLE "fap_average" ADD "month" integer`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" ADD "log_year" integer`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" ADD "log_month" integer`);
        await queryRunner.query(`UPDATE "fap_analysis" SET "log_year" = EXTRACT(YEAR FROM "log_date"), "log_month" = EXTRACT(MONTH FROM "log_date") WHERE "log_date" IS NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fap_average" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fap_average" DROP CONSTRAINT "UQ_fap_average_user_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "email" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_hash"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password_hash" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" DROP COLUMN "file_name"`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" ADD "file_name" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."analysis_status_enum" RENAME TO "analysis_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."fap_analysis_status_enum" AS ENUM('Processing', 'Success', 'Failed')`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" ALTER COLUMN "status" TYPE "public"."fap_analysis_status_enum" USING "status"::"text"::"public"."fap_analysis_status_enum"`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" ALTER COLUMN "status" SET DEFAULT 'Processing'`);
        await queryRunner.query(`DROP TYPE "public"."analysis_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" DROP COLUMN "message"`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" ADD "message" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" ADD "version" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d02b6cec19c953f5b66bd57ec6" ON "fap_average" ("user_id", "type", "year", "month") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_8dcd91be588c37bb039b5f698d" ON "fap_analysis" ("user_id", "sha256") `);
        await queryRunner.query(`ALTER TABLE "fap_average" ADD CONSTRAINT "FK_41b3f92a60a6deb53387cc891d8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" ADD CONSTRAINT "FK_e43096b60c0a9895f017f84f36a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fap_analysis" DROP CONSTRAINT "FK_e43096b60c0a9895f017f84f36a"`);
        await queryRunner.query(`ALTER TABLE "fap_average" DROP CONSTRAINT "FK_41b3f92a60a6deb53387cc891d8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8dcd91be588c37bb039b5f698d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d02b6cec19c953f5b66bd57ec6"`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" ADD "version" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" DROP COLUMN "message"`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" ADD "message" character varying NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."analysis_status_enum_old" AS ENUM('Processing', 'Success', 'Failed')`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" ALTER COLUMN "status" TYPE "public"."analysis_status_enum_old" USING "status"::"text"::"public"."analysis_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" ALTER COLUMN "status" SET DEFAULT 'Processing'`);
        await queryRunner.query(`DROP TYPE "public"."fap_analysis_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."analysis_status_enum_old" RENAME TO "analysis_status_enum"`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" DROP COLUMN "file_name"`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" ADD "file_name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_hash"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password_hash" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "email" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "fap_average" ADD CONSTRAINT "UQ_fap_average_user_id" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "fap_average" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" DROP COLUMN "log_month"`);
        await queryRunner.query(`ALTER TABLE "fap_analysis" DROP COLUMN "log_year"`);
        await queryRunner.query(`ALTER TABLE "fap_average" DROP COLUMN "month"`);
        await queryRunner.query(`ALTER TABLE "fap_average" DROP COLUMN "year"`);
        await queryRunner.query(`ALTER TABLE "fap_average" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."fap_average_type_enum"`);
        await queryRunner.query(`CREATE INDEX "idx_fap_analysis_user_filename" ON "fap_analysis" ("file_name", "user_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_fap_analysis_user_sha256" ON "fap_analysis" ("sha256", "user_id") `);
        await queryRunner.query(`CREATE INDEX "idx_fap_analysis_user_id" ON "fap_analysis" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "idx_fap_average_user_id" ON "fap_average" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "fap_analysis" ADD CONSTRAINT "FK_fap_analysis_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fap_average" ADD CONSTRAINT "FK_fap_average_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
