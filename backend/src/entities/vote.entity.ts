import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Contestant } from './contestant.entity';

@Entity('votes')
@Unique(['user_id', 'contestant_id'])
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'contestant_id' })
  contestant_id: string;

  @Column()
  user_id: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Contestant, (contestant) => contestant.votes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contestant_id' })
  contestant: Contestant;
}
