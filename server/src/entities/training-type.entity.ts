import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
} from 'typeorm';
import { Venue } from './venue.entity';

@Entity('training_types')
export class TrainingType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name_bg: string;

  @Column()
  name_en: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  icon: string;

  @ManyToMany(() => Venue, (venue) => venue.trainingTypes)
  venues: Venue[];
}
