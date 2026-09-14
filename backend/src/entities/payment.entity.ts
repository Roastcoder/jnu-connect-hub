import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Registration } from './registration.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'registration_id', nullable: true })
  registration_id: string;

  @Column({ type: 'float', default: 0 })
  amount: number;

  @Column({ default: 'upi' })
  method: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  reference: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Registration, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'registration_id' })
  registration: Registration;
}
