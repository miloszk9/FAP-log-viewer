import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFapAnalysis1745658472910 implements MigrationInterface {
  name = 'CreateFapAnalysis1745658472910';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "fap_analysis" ("id" character varying NOT NULL, "stage" character varying NOT NULL, "status" character varying NOT NULL, "message" character varying NOT NULL, "sha256" character varying NOT NULL, "analysis" jsonb NOT NULL, CONSTRAINT "PK_f51effaf07fcbcb4ec31fe6b0cb" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "fap_analysis"`);
  }
}
