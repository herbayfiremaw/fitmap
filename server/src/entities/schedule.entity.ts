import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Venue } from './venue.entity';
import { TrainingType } from './training-type.entity';
import { Trainer } from './trainer.entity';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Venue, (venue) => venue.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @Column()
  venue_id: string;

  @ManyToOne(() => TrainingType)
  @JoinColumn({ name: 'training_type_id' })
  trainingType: TrainingType;

  @Column()
  training_type_id: number;

  @ManyToOne(() => Trainer, (trainer) => trainer.schedules, { nullable: true })
  @JoinColumn({ name: 'trainer_id' })
  trainer: Trainer;

  @Column({ nullable: true })
  trainer_id: string;

  @Column({ type: 'int' })
  day_of_week: number;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;
}
