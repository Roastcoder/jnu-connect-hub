import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { SubEvent } from './sub-event.entity';

@Entity('registrations')
export class Registration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: () => "''" })
  reg_id: string;

  @Column({ name: 'event_id', nullable: true })
  event_id: string;

  @Column({ name: 'sub_event_id', nullable: true })
  sub_event_id: string;

  @Column({ nullable: true })
  user_id: string;

  @Column()
  full_name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  department: string;

  @Column({ default: 'confirmed' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Event, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => SubEvent, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sub_event_id' })
  sub_event: SubEvent;
}
