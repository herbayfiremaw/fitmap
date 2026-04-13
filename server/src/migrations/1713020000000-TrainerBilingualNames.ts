import { MigrationInterface, QueryRunner } from 'typeorm';

export class TrainerBilingualNames1713020000000 implements MigrationInterface {
  name = 'TrainerBilingualNames1713020000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "trainers" ADD "name_bg" character varying`);
    await queryRunner.query(`ALTER TABLE "trainers" ADD "name_en" character varying`);

    // Copy existing name into both columns as starting point
    await queryRunner.query(`UPDATE "trainers" SET "name_bg" = "name", "name_en" = "name"`);

    await queryRunner.query(`ALTER TABLE "trainers" ALTER COLUMN "name_bg" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "trainers" ALTER COLUMN "name_en" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "trainers" DROP COLUMN "name"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "trainers" ADD "name" character varying`);
    await queryRunner.query(`UPDATE "trainers" SET "name" = "name_en"`);
    await queryRunner.query(`ALTER TABLE "trainers" ALTER COLUMN "name" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "trainers" DROP COLUMN "name_en"`);
    await queryRunner.query(`ALTER TABLE "trainers" DROP COLUMN "name_bg"`);
  }
}
