import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, SubEvent, Contestant, Vote, Judge, Registration } from '../../entities';

@Injectable()
export class CoordinatorService {
  constructor(
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(SubEvent) private subEventRepo: Repository<SubEvent>,
    @InjectRepository(Contestant) private contestantRepo: Repository<Contestant>,
    @InjectRepository(Vote) private voteRepo: Repository<Vote>,
    @InjectRepository(Judge) private judgeRepo: Repository<Judge>,
    @InjectRepository(Registration) private regRepo: Repository<Registration>,
  ) {}

  async getVotingStats() {
    const contestants = await this.contestantRepo.find({ relations: ['event'] });
    const votes = await this.voteRepo.find();

    const counts: Record<string, number> = {};
    for (const v of votes) {
      counts[v.contestant_id] = (counts[v.contestant_id] || 0) + 1;
    }

    return contestants.map((c) => ({
      id: c.id,
      name: c.name,
      photo: c.photo,
      department: c.department,
      eventName: c.event?.name || 'General',
      votes: counts[c.id] || 0,
    }));
  }

  async resetVotes(eventId?: string) {
    if (eventId) {
      const contestants = await this.contestantRepo.find({ where: { event_id: eventId } });
      const ids = contestants.map((c) => c.id);
      if (ids.length > 0) {
        await this.voteRepo
          .createQueryBuilder()
          .delete()
          .where('contestant_id IN (:...ids)', { ids })
          .execute();
      }
    } else {
      await this.voteRepo.clear();
    }
    return { success: true, message: 'Votes reset successfully' };
  }
}
