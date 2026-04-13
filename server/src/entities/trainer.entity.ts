import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Venue } from './venue.entity';
import { Schedule } from './schedule.entity';

@Entity('trainers')
export class Trainer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Venue, (venue) => venue.trainers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @Column()
  venue_id: string;

  @Column()
  name_bg: string;

  @Column()
  name_en: string;

  @Column({ type: 'text', nullable: true })
  bio_bg: string;

  @Column({ type: 'text', nullable: true })
  bio_en: string;

  @Column({ nullable: true })
  photo_url: string;

  @Column({ type: 'jsonb', default: [] })
  specialties: string[];

  @OneToMany(() => Schedule, (schedule) => schedule.trainer)
  schedules: Schedule[];
}
