import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../entities';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favRepo: Repository<Favorite>,
  ) {}

  async getByUser(userId: string): Promise<Favorite[]> {
    return this.favRepo.find({
      where: { user_id: userId },
      relations: ['venue', 'venue.city', 'venue.trainingTypes'],
      order: { created_at: 'DESC' },
    });
  }

  async getVenueIds(userId: string): Promise<string[]> {
    const favs = await this.favRepo.find({
      where: { user_id: userId },
      select: ['venue_id'],
    });
    return favs.map((f) => f.venue_id);
  }

  async toggle(userId: string, venueId: string): Promise<{ favorited: boolean }> {
    const existing = await this.favRepo.findOneBy({ user_id: userId, venue_id: venueId });
    if (existing) {
      await this.favRepo.remove(existing);
      return { favorited: false };
    }
    await this.favRepo.save(this.favRepo.create({ user_id: userId, venue_id: venueId }));
    return { favorited: true };
  }
}
