import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  User,
  Profile,
  UserRole,
  Event,
  SubEvent,
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
  Department,
  Payment,
  AppSetting,
} from '../../entities';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    @InjectRepository(UserRole) private roleRepo: Repository<UserRole>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(Registration) private regRepo: Repository<Registration>,
    @InjectRepository(Attendance) private attRepo: Repository<Attendance>,
    @InjectRepository(Department) private deptRepo: Repository<Department>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(Faculty) private facultyRepo: Repository<Faculty>,
    @InjectRepository(Staff) private staffRepo: Repository<Staff>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Vote) private voteRepo: Repository<Vote>,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalEvents,
      totalRegistrations,
      totalAttendance,
      totalDepartments,
      totalStudents,
      totalFaculty,
      totalStaff,
      totalPayments,
      totalVotes,
    ] = await Promise.all([
      this.userRepo.count(),
      this.eventRepo.count(),
      this.regRepo.count(),
      this.attRepo.count({ where: { status: 'present' } }),
      this.deptRepo.count(),
      this.studentRepo.count(),
      this.facultyRepo.count(),
      this.staffRepo.count(),
      this.paymentRepo.count(),
      this.voteRepo.count(),
    ]);

    const payments = await this.paymentRepo.find({ where: { status: 'paid' } });
    const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

    return {
      totalUsers,
      totalEvents,
      totalRegistrations,
      totalAttendance,
      totalDepartments,
      totalStudents,
      totalFaculty,
      totalStaff,
      totalPayments,
      totalRevenue,
      totalVotes,
    };
  }

  async getAllUsers() {
    const users = await this.userRepo.find({ relations: ['profile', 'roles'] });
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      profile: u.profile,
      roles: u.roles?.map((r) => r.role) || [],
    }));
  }

  async updateUserRole(userId: string, role: string) {
    const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['roles'] });
    if (!user) throw new NotFoundException('User not found');

    await this.roleRepo.delete({ user_id: userId });
    const newRole = this.roleRepo.create({ user_id: userId, role: role as any });
    await this.roleRepo.save(newRole);

    return { message: 'Role updated successfully', userId, role };
  }
}
