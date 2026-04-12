import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, Venue, Review } from '../entities';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Venue)
    private readonly venueRepo: Repository<Venue>,
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  async getStats() {
    const [totalUsers, totalVenues, totalReviews, verifiedVenues] =
      await Promise.all([
        this.userRepo.count(),
        this.venueRepo.count(),
        this.reviewRepo.count(),
        this.venueRepo.count({ where: { is_verified: true } }),
      ]);

    return { totalUsers, totalVenues, totalReviews, verifiedVenues };
  }

  async getUsers() {
    const users = await this.userRepo.find({
      order: { created_at: 'DESC' },
      select: ['id', 'name', 'email', 'role', 'avatar_url', 'created_at'],
    });
    return users;
  }

  async changeUserRole(id: string, role: UserRole) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    user.role = role;
    await this.userRepo.save(user);
    return { id: user.id, name: user.name, role: user.role };
  }

  async deleteUser(id: string) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.remove(user);
    return { deleted: true };
  }
}
