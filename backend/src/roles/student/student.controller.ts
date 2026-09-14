import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StudentService } from './student.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';

@ApiTags('Student & Public')
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post('register-event')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register student for an event or sub-event' })
  async registerForEvent(
    @CurrentUser() user: any,
    @Body()
    body: {
      event_id: string;
      sub_event_id?: string;
      full_name: string;
      email?: string;
      phone?: string;
      department?: string;
    },
  ) {
    return this.studentService.registerForEvent(user.id, body);
  }

  @Post('vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cast vote for a contestant' })
  async castVote(@CurrentUser() user: any, @Body('contestant_id') contestantId: string) {
    return this.studentService.castVote(user.id, contestantId);
  }

  @Get('my-registrations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current student registrations' })
  async getMyRegistrations(@CurrentUser() user: any) {
    return this.studentService.getMyRegistrations(user.id);
  }

  @Get('my-certificates')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current student certificates' })
  async getMyCertificates(@CurrentUser() user: any) {
    const fullName = user.profile?.full_name || '';
    return this.studentService.getMyCertificates(fullName);
  }

  @Get('verify-certificate/:certId')
  @ApiOperation({ summary: 'Publicly verify a certificate authenticity' })
  async verifyCertificate(@Param('certId') certId: string) {
    return this.studentService.verifyCertificate(certId);
  }
}
