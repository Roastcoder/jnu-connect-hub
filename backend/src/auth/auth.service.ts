import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { Profile } from '../entities/profile.entity';
import { UserRole, AppRole } from '../entities/user-role.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(UserRole)
    private roleRepository: Repository<UserRole>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({ where: { email: dto.email.toLowerCase() } });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(dto.password, salt);

    const user = this.userRepository.create({
      email: dto.email.toLowerCase(),
      password_hash,
    });
    const savedUser = await this.userRepository.save(user);

    const profile = this.profileRepository.create({
      id: savedUser.id,
      full_name: dto.full_name || '',
      enrollment: dto.enrollment || '',
      course: dto.course || '',
      college: dto.college || 'Jaipur National University',
      avatar_url: '',
    });
    await this.profileRepository.save(profile);

    const roleToAssign: AppRole = (dto.role as AppRole) || 'student';
    const userRole = this.roleRepository.create({
      user_id: savedUser.id,
      role: roleToAssign,
    });
    await this.roleRepository.save(userRole);

    const token = this.generateToken(savedUser.id, savedUser.email, [roleToAssign]);

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        profile: {
          id: profile.id,
          full_name: profile.full_name,
          enrollment: profile.enrollment,
          course: profile.course,
          college: profile.college,
          avatar_url: profile.avatar_url,
        },
        roles: [roleToAssign],
      },
      access_token: token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase() },
      relations: ['profile', 'roles'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const roles = user.roles?.map((r) => r.role) || ['student'];
    const token = this.generateToken(user.id, user.email, roles);

    return {
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile || null,
        roles,
      },
      access_token: token,
    };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile', 'roles'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      profile: user.profile,
      roles: user.roles?.map((r) => r.role) || [],
    };
  }

  private generateToken(userId: string, email: string, roles: string[]): string {
    return this.jwtService.sign({
      sub: userId,
      email,
      roles,
    });
  }
}
