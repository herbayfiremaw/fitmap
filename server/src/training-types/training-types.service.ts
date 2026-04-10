import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingType } from '../entities';
import { CreateTrainingTypeDto } from './dto/create-training-type.dto';
import { UpdateTrainingTypeDto } from './dto/update-training-type.dto';

@Injectable()
export class TrainingTypesService {
  constructor(
    @InjectRepository(TrainingType)
    private readonly repo: Repository<TrainingType>,
  ) {}

  findAll(): Promise<TrainingType[]> {
    return this.repo.find({ order: { name_en: 'ASC' } });
  }

  async findOne(id: number): Promise<TrainingType> {
    const tt = await this.repo.findOneBy({ id });
    if (!tt) throw new NotFoundException('Training type not found');
    return tt;
  }

  create(dto: CreateTrainingTypeDto): Promise<TrainingType> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: UpdateTrainingTypeDto): Promise<TrainingType> {
    const tt = await this.findOne(id);
    Object.assign(tt, dto);
    return this.repo.save(tt);
  }

  async remove(id: number): Promise<void> {
    const tt = await this.findOne(id);
    await this.repo.remove(tt);
  }
}
