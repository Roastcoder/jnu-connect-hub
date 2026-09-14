import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import {
  User,
  Profile,
  UserRole,
  Event,
  Registration,
  Attendance,
  Department,
  Student,
  Faculty,
  Staff,
  Payment,
  Vote,
} from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Profile,
      UserRole,
      Event,
      Registration,
      Attendance,
      Department,
      Student,
      Faculty,
      Staff,
      Payment,
      Vote,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
