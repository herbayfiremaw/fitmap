import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, UserRole } from '../entities';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  findByVenue(venueId: string): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { venue_id: venueId },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async create(dto: CreateReviewDto, userId: string): Promise<Review> {
    return this.reviewRepo.save(
      this.reviewRepo.create({ ...dto, user_id: userId }),
    );
  }

  async remove(
    id: string,
    userId: string,
    userRole: UserRole,
  ): Promise<void> {
    const review = await this.reviewRepo.findOneBy({ id });
    if (!review) throw new NotFoundException('Review not found');

    if (review.user_id !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.reviewRepo.remove(review);
  }
}
