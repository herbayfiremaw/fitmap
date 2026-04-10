import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { City } from './city.entity';
import { TrainingType } from './training-type.entity';
import { Trainer } from './trainer.entity';
import { Schedule } from './schedule.entity';
import { Review } from './review.entity';

export enum PriceRange {
  LOW = '$',
  MEDIUM = '$$',
  HIGH = '$$$',
}

@Entity('venues')
export class Venue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.venues, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column()
  owner_id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description_bg: string;

  @Column({ type: 'text' })
  description_en: string;

  @Column()
  address: string;

  @ManyToOne(() => City, (city) => city.venues)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column()
  city_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'enum', enum: PriceRange })
  price_range: PriceRange;

  @Column({ type: 'jsonb', default: [] })
  amenities: string[];

  @Column({ type: 'jsonb', default: [] })
  photos: string[];

  @Column({ default: false })
  is_verified: boolean;

  @Column({ default: false })
  is_featured: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToMany(() => TrainingType, (tt) => tt.venues)
  @JoinTable({
    name: 'venue_training_types',
    joinColumn: { name: 'venue_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'training_type_id',
      referencedColumnName: 'id',
    },
  })
  trainingTypes: TrainingType[];

  @OneToMany(() => Trainer, (trainer) => trainer.venue)
  trainers: Trainer[];

  @OneToMany(() => Schedule, (schedule) => schedule.venue)
  schedules: Schedule[];

  @OneToMany(() => Review, (review) => review.venue)
  reviews: Review[];
}
