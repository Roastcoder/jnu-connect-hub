import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { Department } from './department.entity';

@Entity('gallery')
export class Gallery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: '' })
  title: string;

  @Column({ default: '' })
  caption: string;

  @Column({ default: '' })
  image_url: string;

  @Column({ default: 'General' })
  album: string;

  @Column({ type: 'int', default: 0 })
  count: number;

  @Column({ default: '' })
  cover: string;

  @Column({ default: '' })
  youtube_id: string;

  @Column({ default: '' })
  duration: string;

  @Column({ name: 'event_id', nullable: true })
  event_id: string;

  @Column({ name: 'department_id', nullable: true })
  department_id: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Event, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: Department;
}
