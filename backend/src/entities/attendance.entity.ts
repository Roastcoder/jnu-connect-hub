import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from './event.entity';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id', nullable: true })
  event_id: string;

  @Column()
  full_name: string;

  @Column({ nullable: true })
  department: string;

  @Column({ default: 'present' })
  status: string;

  @CreateDateColumn()
  marked_at: Date;

  @ManyToOne(() => Event, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'event_id' })
  event: Event;
}
