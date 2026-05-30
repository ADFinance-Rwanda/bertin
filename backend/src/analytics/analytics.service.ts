import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from '../tasks/task.entity';
import { RedisService } from '../redis/redis.service';

const CACHE_TTL = 300; // 5 minutes

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    private readonly redis: RedisService,
  ) {}

  private cacheKey(userId: string, endpoint: string): string {
    return `analytics:${userId}:${endpoint}`;
  }

  async getTasksByStatus(userId: string) {
    const key = this.cacheKey(userId, 'tasks-by-status');
    const cached = await this.redis.get(key);
    if (cached) {
      return { ...JSON.parse(cached), cached: true };
    }

    const rows = await this.taskRepo
      .createQueryBuilder('t')
      .select('t.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('t.owner_id = :userId', { userId })
      .groupBy('t.status')
      .getRawMany();

    const data = rows.map((r) => ({ status: r.status, count: parseInt(r.count, 10) }));
    const result = { data, cached: false };
    await this.redis.set(key, JSON.stringify(result), CACHE_TTL);
    return result;
  }

  async getTasksCreatedOverTime(userId: string, days = 30) {
    const key = this.cacheKey(userId, 'tasks-created-over-time');
    const cached = await this.redis.get(key);
    if (cached) {
      return { ...JSON.parse(cached), cached: true };
    }

    const rows = await this.taskRepo
      .createQueryBuilder('t')
      .select("DATE_TRUNC('day', t.created_at)", 'day')
      .addSelect('COUNT(*)', 'count')
      .where('t.owner_id = :userId', { userId })
      .andWhere(`t.created_at >= NOW() - INTERVAL '${days} days'`)
      .groupBy("DATE_TRUNC('day', t.created_at)")
      .orderBy('day', 'ASC')
      .getRawMany();

    const data = rows.map((r) => ({
      date: new Date(r.day).toISOString().split('T')[0],
      count: parseInt(r.count, 10),
    }));

    const result = { data, cached: false };
    await this.redis.set(key, JSON.stringify(result), CACHE_TTL);
    return result;
  }

  async getSummary(userId: string) {
    const key = this.cacheKey(userId, 'summary');
    const cached = await this.redis.get(key);
    if (cached) {
      return { ...JSON.parse(cached), cached: true };
    }

    const total = await this.taskRepo.count({ where: { owner_id: userId } });
    const done = await this.taskRepo.count({
      where: { owner_id: userId, status: TaskStatus.DONE },
    });
    const inProgress = await this.taskRepo.count({
      where: { owner_id: userId, status: TaskStatus.IN_PROGRESS },
    });
    const todo = await this.taskRepo.count({
      where: { owner_id: userId, status: TaskStatus.TODO },
    });

    const overdue = await this.taskRepo
      .createQueryBuilder('t')
      .where('t.owner_id = :userId', { userId })
      .andWhere('t.due_date IS NOT NULL')
      .andWhere('t.due_date < NOW()')
      .andWhere("t.status != 'done'")
      .getCount();

    const dueSoon = await this.taskRepo
      .createQueryBuilder('t')
      .where('t.owner_id = :userId', { userId })
      .andWhere('t.due_date IS NOT NULL')
      .andWhere('t.due_date >= NOW()')
      .andWhere("t.due_date <= NOW() + INTERVAL '3 days'")
      .andWhere("t.status != 'done'")
      .getCount();

    const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;

    const data = {
      total,
      done,
      in_progress: inProgress,
      todo,
      overdue,
      due_soon: dueSoon,
      completion_pct: completionPct,
    };

    const result = { data, cached: false };
    await this.redis.set(key, JSON.stringify(result), CACHE_TTL);
    return result;
  }

  async invalidateUserCache(userId: string): Promise<void> {
    const keys = await this.redis.keys(`analytics:${userId}:*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
