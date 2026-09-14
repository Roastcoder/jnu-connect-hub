import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { Registration, Attendance, Event } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Registration, Attendance, Event])],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
