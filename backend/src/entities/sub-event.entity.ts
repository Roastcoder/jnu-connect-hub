import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from './event.entity';

@Entity('sub_events')
export class SubEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id' })
  event_id: string;

  @Column()
  name: string;

  @Column({ default: '' })
  description: string;

  @Column({ type: 'float', default: 0 })
  fee: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Event, (event) => event.sub_events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;
}
