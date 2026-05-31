import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Task, TaskStatus } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @Inject(forwardRef(() => AnalyticsService))
    private readonly analyticsService: AnalyticsService,
  ) {}

  async findAll(ownerId: string, status?: TaskStatus): Promise<Task[]> {
    const where: FindOptionsWhere<Task> = { owner_id: ownerId };
    if (status) where.status = status;
    return this.taskRepo.find({ where, order: { created_at: 'DESC' } });
  }

  async findOne(id: string, ownerId: string): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id, owner_id: ownerId },
    });
    if (!task) throw new NotFoundException(`Task not found`);
    return task;
  }

  async create(dto: CreateTaskDto, ownerId: string): Promise<Task> {
    const task = this.taskRepo.create({
      ...dto,
      owner_id: ownerId,
      due_date: dto.due_date ? new Date(dto.due_date) : null,
    });
    const saved = await this.taskRepo.save(task);
    await this.analyticsService.invalidateUserCache(ownerId);
    return saved;
  }

  async update(id: string, dto: UpdateTaskDto, ownerId: string): Promise<Task> {
    const task = await this.findOne(id, ownerId);

    if (dto.status === TaskStatus.DONE && task.status !== TaskStatus.DONE) {
      task.completed_at = new Date();
    } else if (dto.status && dto.status !== TaskStatus.DONE) {
      task.completed_at = null;
    }

    Object.assign(task, {
      ...dto,
      due_date: dto.due_date ? new Date(dto.due_date) : task.due_date,
    });

    const saved = await this.taskRepo.save(task);
    await this.analyticsService.invalidateUserCache(ownerId);
    return saved;
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const task = await this.findOne(id, ownerId);
    await this.taskRepo.remove(task);
    await this.analyticsService.invalidateUserCache(ownerId);
  }
}
