import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SubEvent } from './sub-event.entity';

@Entity('events')
export class Event {
  @PrimaryColumn('text')
  id: string;

  @Column()
  name: string;

  @Column({ default: '' })
  tagline: string;

  @Column({ default: 'Cultural' })
  category: string;

  @Column({ default: '' })
  description: string;

  @Column({ default: '' })
  venue: string;

  @Column({ nullable: true })
  start_date: Date;

  @Column({ nullable: true })
  end_date: Date;

  @Column({ type: 'float', default: 0 })
  price: number;

  @Column({ type: 'int', default: 500 })
  seats_left: number;

  @Column({ default: '' })
  image: string;

  @Column('simple-json', { nullable: true })
  rules: string[];

  @Column('simple-json', { nullable: true })
  schedule: { time: string; title: string }[];

  @Column({ default: '' })
  prize_pool: string;

  @Column({ default: '' })
  participants: string;

  @Column({ default: false })
  featured: boolean;

  @Column({ nullable: true })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => SubEvent, (sub) => sub.event)
  sub_events: SubEvent[];
}
