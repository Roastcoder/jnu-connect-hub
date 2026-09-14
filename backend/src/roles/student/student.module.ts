import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { Event, SubEvent, Registration, Vote, Contestant, Certificate, Profile } from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      SubEvent,
      Registration,
      Vote,
      Contestant,
      Certificate,
      Profile,
    ]),
  ],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
