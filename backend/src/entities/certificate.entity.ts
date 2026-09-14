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

@Entity('certificates')
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  recipient_name: string;

  @Column({ default: 'participation' })
  kind: string;

  @Column({ default: '' })
  url: string;

  @Column({ name: 'event_id', nullable: true })
  event_id: string;

  @Column({ name: 'department_id', nullable: true })
  department_id: string;

  @CreateDateColumn()
  issued_at: Date;

  @ManyToOne(() => Event, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: Department;
}
