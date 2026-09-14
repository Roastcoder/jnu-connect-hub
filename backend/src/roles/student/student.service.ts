import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, SubEvent, Registration, Vote, Contestant, Certificate, Profile } from '../../entities';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(SubEvent) private subEventRepo: Repository<SubEvent>,
    @InjectRepository(Registration) private regRepo: Repository<Registration>,
    @InjectRepository(Vote) private voteRepo: Repository<Vote>,
    @InjectRepository(Contestant) private contestantRepo: Repository<Contestant>,
    @InjectRepository(Certificate) private certRepo: Repository<Certificate>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
  ) {}

  async registerForEvent(userId: string, data: {
    event_id: string;
    sub_event_id?: string;
    full_name: string;
    email?: string;
    phone?: string;
    department?: string;
  }) {
    const regId = 'JNU-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const reg = this.regRepo.create({
      reg_id: regId,
      event_id: data.event_id,
      sub_event_id: data.sub_event_id || null,
      user_id: userId,
      full_name: data.full_name,
      email: data.email || null,
      phone: data.phone || null,
      department: data.department || null,
      status: 'confirmed',
    });

    const saved = await this.regRepo.save(reg);

    // decrease seats_left if event exists
    const event = await this.eventRepo.findOne({ where: { id: data.event_id } });
    if (event && event.seats_left > 0) {
      event.seats_left = event.seats_left - 1;
      await this.eventRepo.save(event);
    }

    return saved;
  }

  async castVote(userId: string, contestantId: string) {
    const contestant = await this.contestantRepo.findOne({ where: { id: contestantId } });
    if (!contestant) throw new NotFoundException('Contestant not found');

    const existingVote = await this.voteRepo.findOne({
      where: { user_id: userId, contestant_id: contestantId },
    });

    if (existingVote) {
      throw new ConflictException('You have already voted for this contestant');
    }

    const vote = this.voteRepo.create({
      user_id: userId,
      contestant_id: contestantId,
    });

    await this.voteRepo.save(vote);
    return { success: true, message: 'Vote recorded successfully' };
  }

  async getMyRegistrations(userId: string) {
    return this.regRepo.find({
      where: { user_id: userId },
      relations: ['event', 'sub_event'],
      order: { created_at: 'DESC' },
    });
  }

  async getMyCertificates(recipientName: string) {
    return this.certRepo.find({
      where: { recipient_name: recipientName },
      relations: ['event', 'department'],
      order: { issued_at: 'DESC' },
    });
  }

  async verifyCertificate(certificateId: string) {
    const cert = await this.certRepo.findOne({
      where: { id: certificateId },
      relations: ['event', 'department'],
    });

    if (!cert) {
      return { valid: false, message: 'Certificate not found or invalid' };
    }

    return {
      valid: true,
      certificate: cert,
    };
  }
}
