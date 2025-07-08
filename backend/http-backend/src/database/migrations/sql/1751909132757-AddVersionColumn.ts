import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVersionColumn1751909132757 implements MigrationInterface {
  name = 'AddVersionColumn1751909132757';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ADD "version" character varying NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "fap_analysis" DROP COLUMN "version"`);
  }
}
