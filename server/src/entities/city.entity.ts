import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Venue } from './venue.entity';

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name_bg: string;

  @Column()
  name_en: string;

  @Column({ unique: true })
  slug: string;

  @OneToMany(() => Venue, (venue) => venue.city)
  venues: Venue[];
}
