import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('app_settings')
export class AppSetting {
  @PrimaryColumn('text')
  key: string;

  @Column({ default: '' })
  value: string;

  @UpdateDateColumn()
  updated_at: Date;
}
