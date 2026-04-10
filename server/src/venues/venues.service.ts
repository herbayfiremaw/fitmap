import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TrainingType, UserRole, Venue } from '../entities';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';

@Injectable()
export class VenuesService {
  constructor(
    @InjectRepository(Venue)
    private readonly venueRepo: Repository<Venue>,
    @InjectRepository(TrainingType)
    private readonly ttRepo: Repository<TrainingType>,
  ) {}

  findAll(): Promise<Venue[]> {
    return this.venueRepo.find({
      relations: ['city', 'trainingTypes'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Venue> {
    const venue = await this.venueRepo.findOne({
      where: { id },
      relations: ['city', 'trainingTypes', 'owner', 'trainers'],
    });
    if (!venue) throw new NotFoundException('Venue not found');
    return venue;
  }

  async create(dto: CreateVenueDto, ownerId: string): Promise<Venue> {
    const { training_type_ids, ...rest } = dto;

    const venue = this.venueRepo.create({ ...rest, owner_id: ownerId });

    if (training_type_ids?.length) {
      venue.trainingTypes = await this.ttRepo.findBy({
        id: In(training_type_ids),
      });
    }

    return this.venueRepo.save(venue);
  }

  async update(
    id: string,
    dto: UpdateVenueDto,
    userId: string,
    userRole: UserRole,
  ): Promise<Venue> {
    const venue = await this.findOne(id);

    if (venue.owner_id !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only edit your own venues');
    }

    const { training_type_ids, ...rest } = dto;
    Object.assign(venue, rest);

    if (training_type_ids) {
      venue.trainingTypes = await this.ttRepo.findBy({
        id: In(training_type_ids),
      });
    }

    return this.venueRepo.save(venue);
  }

  async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
    const venue = await this.findOne(id);

    if (venue.owner_id !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own venues');
    }

    await this.venueRepo.remove(venue);
  }

  async addPhoto(
    id: string,
    photoUrl: string,
    userId: string,
    userRole: UserRole,
  ): Promise<Venue> {
    const venue = await this.findOne(id);
    if (venue.owner_id !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only manage your own venues');
    }
    venue.photos = [...venue.photos, photoUrl];
    return this.venueRepo.save(venue);
  }

  async removePhoto(
    id: string,
    photoUrl: string,
    userId: string,
    userRole: UserRole,
  ): Promise<Venue> {
    const venue = await this.findOne(id);
    if (venue.owner_id !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only manage your own venues');
    }
    venue.photos = venue.photos.filter((p) => p !== photoUrl);
    return this.venueRepo.save(venue);
  }

  async verify(id: string, verified: boolean): Promise<Venue> {
    const venue = await this.findOne(id);
    venue.is_verified = verified;
    return this.venueRepo.save(venue);
  }

  async feature(id: string, featured: boolean): Promise<Venue> {
    const venue = await this.findOne(id);
    venue.is_featured = featured;
    return this.venueRepo.save(venue);
  }
}
