import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoordinatorController } from './coordinator.controller';
import { CoordinatorService } from './coordinator.service';
import { Event, SubEvent, Contestant, Vote, Judge, Registration } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Event, SubEvent, Contestant, Vote, Judge, Registration])],
  controllers: [CoordinatorController],
  providers: [CoordinatorService],
  exports: [CoordinatorService],
})
export class CoordinatorModule {}
