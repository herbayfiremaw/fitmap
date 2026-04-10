import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../entities';
import { SignupDto, LoginDto, AuthResponseDto, UpdateProfileDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthResponseDto> {
    const exists = await this.userRepo.findOneBy({ email: dto.email });
    if (exists) {
      throw new ConflictException('Email already registered');
    }

    const password_hash = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password_hash,
      preferred_language: dto.preferred_language,
    });

    await this.userRepo.save(user);

    return this.buildResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepo.findOneBy({ email: dto.email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildResponse(user);
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['reviews', 'reviews.venue'],
    });
    if (!user) throw new UnauthorizedException('User not found');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
      preferred_language: user.preferred_language,
      created_at: user.created_at,
      reviews: user.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        venue: r.venue ? { id: r.venue.id, name: r.venue.name } : null,
      })),
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException('User not found');

    if (dto.name) user.name = dto.name;
    if (dto.email) {
      const existing = await this.userRepo.findOneBy({ email: dto.email });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Email already in use');
      }
      user.email = dto.email;
    }
    if (dto.password) {
      user.password_hash = await bcrypt.hash(dto.password, 10);
    }
    if (dto.preferred_language) {
      user.preferred_language = dto.preferred_language;
    }

    await this.userRepo.save(user);
    return this.buildResponse(user);
  }

  private buildResponse(user: User): AuthResponseDto {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
