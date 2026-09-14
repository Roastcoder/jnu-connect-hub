import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrudController } from './crud.controller';
import { CrudService } from './crud.service';
import {
  Event,
  SubEvent,
  Department,
  Registration,
  Attendance,
  Contestant,
  Vote,
  Judge,
  LiveStream,
  Notification,
  SpecialGuest,
  Sponsor,
  Gallery,
  Certificate,
  Student,
  Faculty,
  Staff,
  Payment,
  AppSetting,
  Profile,
  UserRole,
} from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      SubEvent,
      Department,
      Registration,
      Attendance,
      Contestant,
      Vote,
      Judge,
      LiveStream,
      Notification,
      SpecialGuest,
      Sponsor,
      Gallery,
      Certificate,
      Student,
      Faculty,
      Staff,
      Payment,
      AppSetting,
      Profile,
      UserRole,
    ]),
  ],
  controllers: [CrudController],
  providers: [CrudService],
  exports: [CrudService],
})
export class CrudModule {}
