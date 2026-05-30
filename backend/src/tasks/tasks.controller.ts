import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from './task.entity';
import { CurrentUser, JwtUser } from '../auth/current-user.decorator';

@ApiTags('tasks')
@ApiBearerAuth('access-token')
@Controller('api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tasks for the current user' })
  @ApiQuery({ name: 'status', enum: TaskStatus, required: false })
  findAll(
    @CurrentUser() user: JwtUser,
    @Query('status') status?: TaskStatus,
  ) {
    return this.tasksService.findAll(user.sub, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific task by ID' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.tasksService.findOne(id, user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created' })
  create(
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.tasksService.create(dto, user.sub);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.tasksService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 204, description: 'Task deleted' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.tasksService.remove(id, user.sub);
  }
}
