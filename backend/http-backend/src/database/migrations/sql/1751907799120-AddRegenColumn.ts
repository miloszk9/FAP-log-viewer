import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRegenColumn1751907799120 implements MigrationInterface {
  name = 'AddRegenColumn1751907799120';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ADD "regen" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "fap_analysis" DROP COLUMN "regen"`);
  }
}
