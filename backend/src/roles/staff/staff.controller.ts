import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@ApiTags('Staff & Event Gate')
@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'coordinator', 'staff')
@ApiBearerAuth()
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get staff dashboard summary and check-in counts' })
  async getDashboardSummary() {
    return this.staffService.getDashboardSummary();
  }

  @Post('scan')
  @ApiOperation({ summary: 'Scan and check in a QR code ticket/pass' })
  async scanTicket(@Body('code') code: string) {
    return this.staffService.scanTicket(code);
  }
}
