import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from './event.entity';

@Entity('live_streams')
export class LiveStream {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ default: '' })
  poster: string;

  @Column({ default: '' })
  stream_url: string;

  @Column({ default: 'scheduled' })
  status: string;

  @Column({ nullable: true })
  scheduled_at: Date;

  @Column({ name: 'event_id', nullable: true })
  event_id: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Event, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'event_id' })
  event: Event;
}
