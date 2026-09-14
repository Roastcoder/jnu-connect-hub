import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('alumni')
export class Alumnus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: '' })
  photo: string;

  @Column({ default: '' })
  batch: string;

  @Column({ default: '' })
  course: string;

  @Column({ default: '' })
  role: string;

  @Column({ default: '' })
  company: string;

  @Column({ default: '' })
  city: string;

  @CreateDateColumn()
  created_at: Date;
}
