import { MigrationInterface, QueryRunner } from 'typeorm';

export class PriceRangeEuro1713020300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Convert column to text, update values, then create new enum
    await queryRunner.query(`ALTER TABLE venues ALTER COLUMN price_range TYPE text`);
    await queryRunner.query(`UPDATE venues SET price_range = '€' WHERE price_range = '$'`);
    await queryRunner.query(`UPDATE venues SET price_range = '€€' WHERE price_range = '$$'`);
    await queryRunner.query(`UPDATE venues SET price_range = '€€€' WHERE price_range = '$$$'`);
    await queryRunner.query(`DROP TYPE IF EXISTS venues_price_range_enum`);
    await queryRunner.query(`CREATE TYPE venues_price_range_enum AS ENUM ('€', '€€', '€€€')`);
    await queryRunner.query(`ALTER TABLE venues ALTER COLUMN price_range TYPE venues_price_range_enum USING price_range::venues_price_range_enum`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE venues ALTER COLUMN price_range TYPE text`);
    await queryRunner.query(`UPDATE venues SET price_range = '$' WHERE price_range = '€'`);
    await queryRunner.query(`UPDATE venues SET price_range = '$$' WHERE price_range = '€€'`);
    await queryRunner.query(`UPDATE venues SET price_range = '$$$' WHERE price_range = '€€€'`);
    await queryRunner.query(`DROP TYPE IF EXISTS venues_price_range_enum`);
    await queryRunner.query(`CREATE TYPE venues_price_range_enum AS ENUM ('$', '$$', '$$$')`);
    await queryRunner.query(`ALTER TABLE venues ALTER COLUMN price_range TYPE venues_price_range_enum USING price_range::venues_price_range_enum`);
  }
}
