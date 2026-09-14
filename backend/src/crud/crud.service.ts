import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
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

const ENTITY_MAP: Record<string, any> = {
  events: Event,
  sub_events: SubEvent,
  departments: Department,
  registrations: Registration,
  attendance: Attendance,
  contestants: Contestant,
  votes: Vote,
  judges: Judge,
  live_streams: LiveStream,
  notifications: Notification,
  special_guests: SpecialGuest,
  sponsors: Sponsor,
  gallery: Gallery,
  certificates: Certificate,
  students: Student,
  faculty: Faculty,
  staff: Staff,
  payments: Payment,
  app_settings: AppSetting,
  profiles: Profile,
  user_roles: UserRole,
};

@Injectable()
export class CrudService {
  constructor(private dataSource: DataSource) {}

  private getRepository(tableName: string): Repository<any> {
    const entity = ENTITY_MAP[tableName];
    if (!entity) {
      throw new BadRequestException(`Table "${tableName}" is not valid or supported`);
    }
    return this.dataSource.getRepository(entity);
  }

  async find(
    tableName: string,
    query: {
      select?: string;
      order?: string;
      ascending?: boolean;
      limit?: number;
      offset?: number;
      filter?: Record<string, any>;
      count?: boolean;
    },
  ) {
    const repo = this.getRepository(tableName);
    const qb = repo.createQueryBuilder(tableName);

    // Apply where filters
    if (query.filter && Object.keys(query.filter).length > 0) {
      Object.entries(query.filter).forEach(([key, val], idx) => {
        if (val !== undefined && val !== null) {
          qb.andWhere(`${tableName}.${key} = :val${idx}`, { [`val${idx}`]: val });
        }
      });
    }

    // Apply ordering
    if (query.order) {
      qb.orderBy(`${tableName}.${query.order}`, query.ascending ? 'ASC' : 'DESC');
    }

    // Apply pagination
    if (query.limit) {
      qb.take(query.limit);
    }
    if (query.offset) {
      qb.skip(query.offset);
    }

    if (query.count) {
      const [data, total] = await qb.getManyAndCount();
      return { data, count: total };
    }

    const data = await qb.getMany();
    return { data };
  }

  async findOne(tableName: string, id: string) {
    const repo = this.getRepository(tableName);
    const item = await repo.findOne({ where: { id } as any });
    if (!item) throw new NotFoundException(`Item with ID "${id}" not found in "${tableName}"`);
    return item;
  }

  async create(tableName: string, payload: any) {
    const repo = this.getRepository(tableName);
    const created = repo.create(payload);
    return await repo.save(created);
  }

  async update(tableName: string, id: string, payload: any) {
    const repo = this.getRepository(tableName);
    const item = await this.findOne(tableName, id);
    const updated = Object.assign(item, payload);
    return await repo.save(updated);
  }

  async updateByFilter(tableName: string, filter: Record<string, any>, payload: any) {
    const repo = this.getRepository(tableName);
    const items = await repo.find({ where: filter as any });
    for (const item of items) {
      Object.assign(item, payload);
      await repo.save(item);
    }
    return { count: items.length };
  }

  async delete(tableName: string, id: string) {
    const repo = this.getRepository(tableName);
    const res = await repo.delete(id);
    return { success: true, affected: res.affected };
  }

  async deleteByFilter(tableName: string, filter: Record<string, any>) {
    const repo = this.getRepository(tableName);
    const res = await repo.delete(filter as any);
    return { success: true, affected: res.affected };
  }
}
