import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeptAdminController } from './dept-admin.controller';
import { DeptAdminService } from './dept-admin.service';
import {
  Department,
  Student,
  Faculty,
  Registration,
  Attendance,
  Certificate,
  Gallery,
} from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Department,
      Student,
      Faculty,
      Registration,
      Attendance,
      Certificate,
      Gallery,
    ]),
  ],
  controllers: [DeptAdminController],
  providers: [DeptAdminService],
  exports: [DeptAdminService],
})
export class DeptAdminModule {}
