import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule, UserRole, Venue } from '../entities';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
    @InjectRepository(Venue)
    private readonly venueRepo: Repository<Venue>,
  ) {}

  findByVenue(venueId: string): Promise<Schedule[]> {
    return this.scheduleRepo.find({
      where: { venue_id: venueId },
      relations: ['trainingType', 'trainer'],
      order: { day_of_week: 'ASC', start_time: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Schedule> {
    const schedule = await this.scheduleRepo.findOne({
      where: { id },
      relations: ['venue', 'trainingType', 'trainer'],
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  async create(
    dto: CreateScheduleDto,
    userId: string,
    userRole: UserRole,
  ): Promise<Schedule> {
    await this.assertVenueOwnership(dto.venue_id, userId, userRole);
    return this.scheduleRepo.save(this.scheduleRepo.create(dto));
  }

  async update(
    id: string,
    dto: UpdateScheduleDto,
    userId: string,
    userRole: UserRole,
  ): Promise<Schedule> {
    const schedule = await this.findOne(id);
    await this.assertVenueOwnership(schedule.venue_id, userId, userRole);
    Object.assign(schedule, dto);
    return this.scheduleRepo.save(schedule);
  }

  async remove(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    const schedule = await this.findOne(id);
    await this.assertVenueOwnership(schedule.venue_id, userId, userRole);
    await this.scheduleRepo.remove(schedule);
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
      throw new ForbiddenException('You can only manage schedules for your own venues');
    }
  }
}
