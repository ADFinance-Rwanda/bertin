import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private config: ConfigService) {
    const host = config.get('REDIS_HOST', 'localhost');
    const port = parseInt(config.get('REDIS_PORT', '6379'));
    const password = config.get('REDIS_PASSWORD', '');

    this.client = new Redis({ host, port, password, lazyConnect: true });

    this.client.on('error', (err) =>
      this.logger.error('Redis connection error', err.message),
    );
    this.client.on('connect', () => this.logger.log('Redis connected'));
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (e) {
      this.logger.warn(`Redis GET failed for key ${key}: ${e.message}`);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    try {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } catch (e) {
      this.logger.warn(`Redis SET failed for key ${key}: ${e.message}`);
    }
  }

  async del(...keys: string[]): Promise<void> {
    try {
      if (keys.length > 0) await this.client.del(...keys);
    } catch (e) {
      this.logger.warn(`Redis DEL failed: ${e.message}`);
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (e) {
      this.logger.warn(`Redis KEYS failed for pattern ${pattern}: ${e.message}`);
      return [];
    }
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
