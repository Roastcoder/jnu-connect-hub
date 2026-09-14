import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Event } from './event.entity';
import { Vote } from './vote.entity';

@Entity('contestants')
export class Contestant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: '' })
  bio: string;

  @Column({ default: '' })
  photo: string;

  @Column({ default: '' })
  department: string;

  @Column({ default: 'Jaipur National University' })
  college: string;

  @Column({ default: 'General' })
  event_category: string;

  @Column({ name: 'event_id', nullable: true })
  event_id: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Event, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @OneToMany(() => Vote, (vote) => vote.contestant)
  votes: Vote[];
}
