import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Department,
  Student,
  Faculty,
  Registration,
  Attendance,
  Certificate,
  Gallery,
} from '../../entities';

@Injectable()
export class DeptAdminService {
  constructor(
    @InjectRepository(Department) private deptRepo: Repository<Department>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(Faculty) private facultyRepo: Repository<Faculty>,
    @InjectRepository(Registration) private regRepo: Repository<Registration>,
    @InjectRepository(Attendance) private attRepo: Repository<Attendance>,
    @InjectRepository(Certificate) private certRepo: Repository<Certificate>,
    @InjectRepository(Gallery) private galleryRepo: Repository<Gallery>,
  ) {}

  async getDepartmentReports(deptId?: string) {
    const whereDept = deptId ? { department_id: deptId } : {};

    const [totalStudents, totalFaculty, totalRegistrations, totalCertificates, presentAttendance] =
      await Promise.all([
        this.studentRepo.count({ where: whereDept }),
        this.facultyRepo.count({ where: whereDept }),
        this.regRepo.count(),
        this.certRepo.count({ where: whereDept }),
        this.attRepo.count({ where: { status: 'present' } }),
      ]);

    return {
      totalStudents,
      totalFaculty,
      totalRegistrations,
      totalCertificates,
      presentAttendance,
    };
  }
}
