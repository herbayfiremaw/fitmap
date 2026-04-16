import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrainingPrice1713020200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE venues ADD COLUMN training_price DECIMAL(8,2)`,
    );

    // Back-fill existing venues based on their current price_range
    await queryRunner.query(
      `UPDATE venues SET training_price = CASE
        WHEN price_range = '$' THEN 8
        WHEN price_range = '$$' THEN 25
        WHEN price_range = '$$$' THEN 50
        ELSE 25
      END`,
    );

    await queryRunner.query(
      `ALTER TABLE venues ALTER COLUMN training_price SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE venues DROP COLUMN training_price`,
    );
  }
}
