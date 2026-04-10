import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1712700000000 implements MigrationInterface {
  name = 'InitialSchema1712700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
    );

    await queryRunner.query(`
      CREATE TYPE "users_role_enum" AS ENUM ('user', 'owner', 'admin')
    `);
    await queryRunner.query(`
      CREATE TYPE "users_preferred_language_enum" AS ENUM ('bg', 'en')
    `);
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "role" "users_role_enum" NOT NULL DEFAULT 'user',
        "avatar_url" character varying,
        "preferred_language" "users_preferred_language_enum" NOT NULL DEFAULT 'bg',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "cities" (
        "id" SERIAL NOT NULL,
        "name_bg" character varying NOT NULL,
        "name_en" character varying NOT NULL,
        "slug" character varying NOT NULL,
        CONSTRAINT "UQ_cities_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_cities" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "training_types" (
        "id" SERIAL NOT NULL,
        "name_bg" character varying NOT NULL,
        "name_en" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "icon" character varying NOT NULL,
        CONSTRAINT "UQ_training_types_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_training_types" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "venues_price_range_enum" AS ENUM ('$', '$$', '$$$')
    `);
    await queryRunner.query(`
      CREATE TABLE "venues" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "owner_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "description_bg" text NOT NULL,
        "description_en" text NOT NULL,
        "address" character varying NOT NULL,
        "city_id" integer NOT NULL,
        "latitude" numeric(10,7) NOT NULL,
        "longitude" numeric(10,7) NOT NULL,
        "phone" character varying NOT NULL,
        "email" character varying NOT NULL,
        "website" character varying,
        "price_range" "venues_price_range_enum" NOT NULL,
        "amenities" jsonb NOT NULL DEFAULT '[]',
        "photos" jsonb NOT NULL DEFAULT '[]',
        "is_verified" boolean NOT NULL DEFAULT false,
        "is_featured" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_venues" PRIMARY KEY ("id"),
        CONSTRAINT "FK_venues_owner" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_venues_city" FOREIGN KEY ("city_id") REFERENCES "cities"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "venue_training_types" (
        "venue_id" uuid NOT NULL,
        "training_type_id" integer NOT NULL,
        CONSTRAINT "PK_venue_training_types" PRIMARY KEY ("venue_id", "training_type_id"),
        CONSTRAINT "FK_vtt_venue" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_vtt_training_type" FOREIGN KEY ("training_type_id") REFERENCES "training_types"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "trainers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "venue_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "bio_bg" text,
        "bio_en" text,
        "photo_url" character varying,
        "specialties" jsonb NOT NULL DEFAULT '[]',
        CONSTRAINT "PK_trainers" PRIMARY KEY ("id"),
        CONSTRAINT "FK_trainers_venue" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "schedules" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "venue_id" uuid NOT NULL,
        "training_type_id" integer NOT NULL,
        "trainer_id" uuid,
        "day_of_week" integer NOT NULL,
        "start_time" TIME NOT NULL,
        "end_time" TIME NOT NULL,
        CONSTRAINT "PK_schedules" PRIMARY KEY ("id"),
        CONSTRAINT "FK_schedules_venue" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_schedules_training_type" FOREIGN KEY ("training_type_id") REFERENCES "training_types"("id"),
        CONSTRAINT "FK_schedules_trainer" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "reviews" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "venue_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "rating" integer NOT NULL,
        "comment" text NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reviews" PRIMARY KEY ("id"),
        CONSTRAINT "FK_reviews_venue" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reviews_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "reviews"`);
    await queryRunner.query(`DROP TABLE "schedules"`);
    await queryRunner.query(`DROP TABLE "trainers"`);
    await queryRunner.query(`DROP TABLE "venue_training_types"`);
    await queryRunner.query(`DROP TABLE "venues"`);
    await queryRunner.query(`DROP TYPE "venues_price_range_enum"`);
    await queryRunner.query(`DROP TABLE "training_types"`);
    await queryRunner.query(`DROP TABLE "cities"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "users_preferred_language_enum"`);
    await queryRunner.query(`DROP TYPE "users_role_enum"`);
  }
}
