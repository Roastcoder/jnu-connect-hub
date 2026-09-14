import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Registration, Attendance, Event } from '../../entities';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Registration) private regRepo: Repository<Registration>,
    @InjectRepository(Attendance) private attRepo: Repository<Attendance>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
  ) {}

  async getDashboardSummary() {
    const [totalRegistrations, totalPresent, confirmedRegistrations] = await Promise.all([
      this.regRepo.count(),
      this.attRepo.count({ where: { status: 'present' } }),
      this.regRepo.count({ where: { status: 'confirmed' } }),
    ]);

    return {
      totalRegistrations,
      totalPresent,
      confirmedRegistrations,
    };
  }

  async scanTicket(code: string) {
    if (!code) throw new BadRequestException('Invalid ticket code');

    // Registration by reg_id or id
    const reg = await this.regRepo.findOne({
      where: [{ reg_id: code }, { id: code }],
      relations: ['event', 'sub_event'],
    });

    if (!reg) {
      throw new NotFoundException('Registration pass not found');
    }

    // Check if already checked in
    const existing = await this.attRepo.findOne({
      where: {
        event_id: reg.event_id,
        full_name: reg.full_name,
      },
    });

    let alreadyCheckedIn = !!existing;
    let attendance = existing;

    if (!existing) {
      attendance = this.attRepo.create({
        event_id: reg.event_id,
        full_name: reg.full_name,
        department: reg.department,
        status: 'present',
      });
      await this.attRepo.save(attendance);
    }

    return {
      valid: true,
      alreadyCheckedIn,
      registration: {
        id: reg.id,
        reg_id: reg.reg_id,
        full_name: reg.full_name,
        email: reg.email,
        phone: reg.phone,
        department: reg.department,
        status: reg.status,
        eventName: reg.event?.name || 'JNU Event',
        subEventName: reg.sub_event?.name,
      },
      attendance,
    };
  }
}
