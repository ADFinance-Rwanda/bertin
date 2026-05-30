import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CurrentUser, JwtUser } from '../auth/current-user.decorator';

@ApiTags('analytics')
@ApiBearerAuth('access-token')
@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('tasks-by-status')
  @ApiOperation({ summary: 'Task count grouped by status (cached)' })
  tasksByStatus(@CurrentUser() user: JwtUser) {
    return this.analyticsService.getTasksByStatus(user.sub);
  }

  @Get('tasks-created-over-time')
  @ApiOperation({ summary: 'Tasks created per day over last N days (cached)' })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 30 })
  tasksCreatedOverTime(
    @CurrentUser() user: JwtUser,
    @Query('days') days?: string,
  ) {
    return this.analyticsService.getTasksCreatedOverTime(
      user.sub,
      days ? parseInt(days, 10) : 30,
    );
  }

  @Get('summary')
  @ApiOperation({ summary: 'User productivity summary (cached)' })
  summary(@CurrentUser() user: JwtUser) {
    return this.analyticsService.getSummary(user.sub);
  }
}
