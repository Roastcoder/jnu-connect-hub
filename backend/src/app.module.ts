import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './roles/admin/admin.module';
import { DeptAdminModule } from './roles/dept-admin/dept-admin.module';
import { CoordinatorModule } from './roles/coordinator/coordinator.module';
import { StaffModule } from './roles/staff/staff.module';
import { StudentModule } from './roles/student/student.module';
import { CrudModule } from './crud/crud.module';
import {
  User,
  Profile,
  UserRole,
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
  Alumnus,
  Job,
} from './entities';

const ALL_ENTITIES = [
  User,
  Profile,
  UserRole,
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
  Alumnus,
  Job,
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');

        if (databaseUrl && databaseUrl.startsWith('postgres')) {
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: ALL_ENTITIES,
            synchronize: true,
            logging: false,
            ssl: databaseUrl.includes('sslmode=require') || databaseUrl.includes('supabase')
              ? { rejectUnauthorized: false }
              : false,
          };
        }

        return {
          type: 'sqlite',
          database: configService.get<string>('DATABASE_FILE', 'database.sqlite'),
          entities: ALL_ENTITIES,
          synchronize: true,
          logging: false,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    AdminModule,
    DeptAdminModule,
    CoordinatorModule,
    StaffModule,
    StudentModule,
    CrudModule,
  ],
})
export class AppModule {}
