import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PriceRange, TrainingType, UserRole, Venue } from '../entities';
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

  private async withRatings(venues: Venue[]): Promise<any[]> {
    if (venues.length === 0) return [];
    const ids = venues.map((v) => v.id);
    const ratings: { venue_id: string; avg: string; cnt: string }[] =
      await this.venueRepo.query(
        `SELECT venue_id, COALESCE(AVG(rating), 0) as avg, COUNT(id) as cnt
         FROM reviews WHERE venue_id = ANY($1) GROUP BY venue_id`,
        [ids],
      );
    const map = new Map(ratings.map((r) => [r.venue_id, r]));
    return venues.map((v) => ({
      ...v,
      avg_rating: parseFloat(map.get(v.id)?.avg ?? '0'),
      review_count: parseInt(map.get(v.id)?.cnt ?? '0'),
    }));
  }

  async findAll(): Promise<any[]> {
    const venues = await this.venueRepo.find({
      where: { is_verified: true },
      relations: ['city', 'trainingTypes'],
      order: { created_at: 'DESC' },
    });
    return this.withRatings(venues);
  }

  async findAllAdmin(): Promise<any[]> {
    const venues = await this.venueRepo.find({
      relations: ['city', 'trainingTypes'],
      order: { created_at: 'DESC' },
    });
    return this.withRatings(venues);
  }

  async findByOwner(ownerId: string): Promise<any[]> {
    const venues = await this.venueRepo.find({
      where: { owner_id: ownerId },
      relations: ['city', 'trainingTypes'],
      order: { created_at: 'DESC' },
    });
    return this.withRatings(venues);
  }

  async findOne(id: string): Promise<Venue> {
    const venue = await this.venueRepo.findOne({
      where: { id },
      relations: ['city', 'trainingTypes', 'owner', 'trainers'],
    });
    if (!venue) throw new NotFoundException('Venue not found');
    return venue;
  }

  private calcPriceRange(price: number): PriceRange {
    if (price <= 10) return PriceRange.LOW;
    if (price <= 40) return PriceRange.MEDIUM;
    return PriceRange.HIGH;
  }

  async create(dto: CreateVenueDto, ownerId: string): Promise<Venue> {
    const { training_type_ids, ...rest } = dto;

    const venue = this.venueRepo.create({
      ...rest,
      owner_id: ownerId,
      price_range: this.calcPriceRange(rest.training_price),
    });

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

    if (rest.training_price !== undefined) {
      venue.price_range = this.calcPriceRange(rest.training_price);
    }

    // Owner edits require re-approval; admin edits stay verified
    if (userRole !== UserRole.ADMIN) {
      venue.is_verified = false;
    }

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
