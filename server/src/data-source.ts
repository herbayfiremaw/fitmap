import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
  username: process.env.POSTGRES_USER ?? 'fitmap',
  password: process.env.POSTGRES_PASSWORD ?? 'fitmap_dev',
  database: process.env.POSTGRES_DB ?? 'fitmap',
  entities: ['src/entities/*.ts'],
  migrations: ['src/migrations/*.ts'],
});
