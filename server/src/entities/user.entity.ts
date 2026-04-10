import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Venue } from './venue.entity';
import { Review } from './review.entity';

export enum UserRole {
  USER = 'user',
  OWNER = 'owner',
  ADMIN = 'admin',
}

export enum Language {
  BG = 'bg',
  EN = 'en',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ type: 'enum', enum: Language, default: Language.BG })
  preferred_language: Language;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Venue, (venue) => venue.owner)
  venues: Venue[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];
}
