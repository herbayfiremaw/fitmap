import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trainer, UserRole, Venue } from '../entities';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';

@Injectable()
export class TrainersService {
  constructor(
    @InjectRepository(Trainer)
    private readonly trainerRepo: Repository<Trainer>,
    @InjectRepository(Venue)
    private readonly venueRepo: Repository<Venue>,
  ) {}

  findAll(): Promise<Trainer[]> {
    return this.trainerRepo.find({
      relations: ['venue'],
      order: { name: 'ASC' },
    });
  }

  findByVenue(venueId: string): Promise<Trainer[]> {
    return this.trainerRepo.find({
      where: { venue_id: venueId },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Trainer> {
    const trainer = await this.trainerRepo.findOne({
      where: { id },
      relations: ['venue', 'schedules', 'schedules.trainingType', 'schedules.venue'],
    });
    if (!trainer) throw new NotFoundException('Trainer not found');
    return trainer;
  }

  async create(
    dto: CreateTrainerDto,
    userId: string,
    userRole: UserRole,
  ): Promise<Trainer> {
    await this.assertVenueOwnership(dto.venue_id, userId, userRole);
    return this.trainerRepo.save(this.trainerRepo.create(dto));
  }

  async update(
    id: string,
    dto: UpdateTrainerDto,
    userId: string,
    userRole: UserRole,
  ): Promise<Trainer> {
    const trainer = await this.findOne(id);
    await this.assertVenueOwnership(trainer.venue_id, userId, userRole);
    Object.assign(trainer, dto);
    return this.trainerRepo.save(trainer);
  }

  async remove(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    const trainer = await this.findOne(id);
    await this.assertVenueOwnership(trainer.venue_id, userId, userRole);
    await this.trainerRepo.remove(trainer);
  }

  private async assertVenueOwnership(
    venueId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    if (userRole === UserRole.ADMIN) return;
    const venue = await this.venueRepo.findOneBy({ id: venueId });
    if (!venue) throw new NotFoundException('Venue not found');
    if (venue.owner_id !== userId) {
      throw new ForbiddenException('You can only manage trainers for your own venues');
    }
  }
}
