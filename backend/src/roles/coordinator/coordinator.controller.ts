import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CoordinatorService } from './coordinator.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@ApiTags('Event Coordinator')
@Controller('coordinator')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'coordinator')
@ApiBearerAuth()
export class CoordinatorController {
  constructor(private readonly coordinatorService: CoordinatorService) {}

  @Get('voting-stats')
  @ApiOperation({ summary: 'Get live voting metrics per contestant' })
  async getVotingStats() {
    return this.coordinatorService.getVotingStats();
  }

  @Post('reset-votes')
  @ApiOperation({ summary: 'Reset votes for an event or all events' })
  async resetVotes(@Query('eventId') eventId?: string) {
    return this.coordinatorService.resetVotes(eventId);
  }
}
