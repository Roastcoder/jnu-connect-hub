import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DeptAdminService } from './dept-admin.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@ApiTags('Department Admin')
@Controller('dept-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'dept_admin')
@ApiBearerAuth()
export class DeptAdminController {
  constructor(private readonly deptAdminService: DeptAdminService) {}

  @Get('reports')
  @ApiOperation({ summary: 'Get department analytics and reports' })
  async getDepartmentReports(@Query('deptId') deptId?: string) {
    return this.deptAdminService.getDepartmentReports(deptId);
  }
}
