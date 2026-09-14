import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ default: '' })
  company: string;

  @Column({ default: '' })
  location: string;

  @Column({ default: 'Full-time' })
  type: string;

  @CreateDateColumn()
  created_at: Date;
}
