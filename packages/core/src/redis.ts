import Redis from 'ioredis';
import { FortiFiConfig } from './types';

export class RedisClient {
  private client: Redis;
  private config: FortiFiConfig;

  constructor(config: FortiFiConfig) {
    this.config = config;
    const redisConfig: Record<string, unknown> = {
      host: config.redis.host,
      port: config.redis.port,
      db: config.redis.db || 0,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    };

    if (config.redis.password) {
      redisConfig.password = config.redis.password;
    }

    this.client = new Redis(redisConfig);

    this.client.on('error', err => {
      console.error('Redis connection error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis connected successfully');
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  getClient(): Redis {
    return this.client;
  }
}
