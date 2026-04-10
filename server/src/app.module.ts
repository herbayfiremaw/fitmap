import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CitiesModule } from './cities/cities.module';
import { TrainingTypesModule } from './training-types/training-types.module';
import { VenuesModule } from './venues/venues.module';
import { TrainersModule } from './trainers/trainers.module';
import { SchedulesModule } from './schedules/schedules.module';
import { ReviewsModule } from './reviews/reviews.module';
import { User, City, TrainingType, Venue, Trainer, Schedule, Review } from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        return {
          type: 'postgres' as const,
          ...(databaseUrl
            ? { url: databaseUrl }
            : {
                host: config.get('POSTGRES_HOST', 'localhost'),
                port: config.get<number>('POSTGRES_PORT', 5432),
                username: config.get('POSTGRES_USER', 'fitmap'),
                password: config.get('POSTGRES_PASSWORD', 'fitmap_dev'),
                database: config.get('POSTGRES_DB', 'fitmap'),
              }),
          entities: [User, City, TrainingType, Venue, Trainer, Schedule, Review],
          migrations: ['dist/migrations/*.js'],
          migrationsRun: true,
        };
      },
    }),
    AuthModule,
    CitiesModule,
    TrainingTypesModule,
    VenuesModule,
    TrainersModule,
    SchedulesModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
