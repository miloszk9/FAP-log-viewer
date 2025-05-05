import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUser1746475466686 implements MigrationInterface {
  name = 'CreateUser1746475466686';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "refreshToken" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "fap_analysis" DROP COLUMN "stage"`);
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ADD "fileName" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "fap_analysis" ADD "userId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" DROP CONSTRAINT "PK_f51effaf07fcbcb4ec31fe6b0cb"`,
    );
    await queryRunner.query(`ALTER TABLE "fap_analysis" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ADD CONSTRAINT "PK_f51effaf07fcbcb4ec31fe6b0cb" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ADD CONSTRAINT "FK_d3f0ce015affc8f99693df10d1a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" DROP CONSTRAINT "FK_d3f0ce015affc8f99693df10d1a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" DROP CONSTRAINT "PK_f51effaf07fcbcb4ec31fe6b0cb"`,
    );
    await queryRunner.query(`ALTER TABLE "fap_analysis" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ADD "id" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ADD CONSTRAINT "PK_f51effaf07fcbcb4ec31fe6b0cb" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "fap_analysis" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" DROP COLUMN "fileName"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fap_analysis" ADD "stage" character varying NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
