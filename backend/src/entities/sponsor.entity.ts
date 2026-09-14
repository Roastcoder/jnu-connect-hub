import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('sponsors')
export class Sponsor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: 'silver' })
  tier: string;

  @Column({ default: '' })
  logo: string;

  @Column({ default: '' })
  url: string;

  @CreateDateColumn()
  created_at: Date;
}
