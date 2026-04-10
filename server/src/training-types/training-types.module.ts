import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingType } from '../entities';
import { TrainingTypesController } from './training-types.controller';
import { TrainingTypesService } from './training-types.service';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingType])],
  controllers: [TrainingTypesController],
  providers: [TrainingTypesService],
  exports: [TrainingTypesService],
})
export class TrainingTypesModule {}
