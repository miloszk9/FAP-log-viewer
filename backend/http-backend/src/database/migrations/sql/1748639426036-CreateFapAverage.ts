import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFapAverage1748639426036 implements MigrationInterface {
  name = 'CreateFapAverage1748639426036';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "fap_average" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying NOT NULL, "message" character varying NOT NULL, "sha256" character varying NOT NULL, "average" jsonb NOT NULL, "userId" uuid, CONSTRAINT "REL_1ce4989ba22f408fcbeee7f1eb" UNIQUE ("userId"), CONSTRAINT "PK_92ccc03f47643efc0732ee6a2e6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_average" ADD CONSTRAINT "FK_1ce4989ba22f408fcbeee7f1ebd" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fap_average" DROP CONSTRAINT "FK_1ce4989ba22f408fcbeee7f1ebd"`,
    );
    await queryRunner.query(`DROP TABLE "fap_average"`);
  }
}
