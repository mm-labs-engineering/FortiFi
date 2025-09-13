import { RedisClient } from './redis';
import { FortiFiConfig, RateLimitInfo } from './types';

export class RateLimiter {
  private redis: RedisClient;
  private config: FortiFiConfig;

  constructor(redis: RedisClient, config: FortiFiConfig) {
    this.redis = redis;
    this.config = config;
  }

  async checkRateLimit(ip: string): Promise<RateLimitInfo> {
    const key = `rate_limit:${ip}`;
    const blockKey = `blocked:${ip}`;

    // Check if IP is currently blocked
    const isBlocked = await this.redis.exists(blockKey);
    if (isBlocked) {
      const ttl = await this.redis.ttl(blockKey);
      return {
        count: this.config.rateLimit.maxRequests,
        limit: this.config.rateLimit.maxRequests,
        windowMs: this.config.rateLimit.windowMs * 1000,
        resetTime: ttl,
        exceeded: true,
      };
    }

    // Get current count
    const currentCount = await this.redis.incr(key);

    // Set expiration on first request
    if (currentCount === 1) {
      await this.redis.expire(key, this.config.rateLimit.windowMs);
    }

    const ttl = await this.redis.ttl(key);
    const exceeded = currentCount > this.config.rateLimit.maxRequests;

    // Block IP if limit exceeded
    if (exceeded) {
      await this.blockIp(ip);
    }

    return {
      count: currentCount,
      limit: this.config.rateLimit.maxRequests,
      windowMs: this.config.rateLimit.windowMs * 1000,
      resetTime: ttl,
      exceeded,
    };
  }

  async isBlocked(ip: string): Promise<boolean> {
    const blockKey = `blocked:${ip}`;
    return this.redis.exists(blockKey);
  }

  async blockIp(ip: string, customDurationMs?: number): Promise<void> {
    const blockKey = `blocked:${ip}`;
    const durationMs = customDurationMs || this.config.rateLimit.blockDurationMs * 1000;
    const ttlSeconds = Math.ceil(durationMs / 1000);

    await this.redis.set(blockKey, '1', ttlSeconds);
  }

  async unblockIp(ip: string): Promise<void> {
    const blockKey = `blocked:${ip}`;
    await this.redis.del(blockKey);
  }

  async getRateLimitInfo(ip: string): Promise<RateLimitInfo> {
    const key = `rate_limit:${ip}`;
    const blockKey = `blocked:${ip}`;

    // Check if blocked
    const isBlocked = await this.redis.exists(blockKey);
    if (isBlocked) {
      const ttl = await this.redis.ttl(blockKey);
      return {
        count: this.config.rateLimit.maxRequests,
        limit: this.config.rateLimit.maxRequests,
        windowMs: this.config.rateLimit.windowMs * 1000,
        resetTime: ttl,
        exceeded: true,
      };
    }

    // Get current count
    const countStr = await this.redis.get(key);
    const count = countStr ? parseInt(countStr, 10) : 0;
    const ttl = await this.redis.ttl(key);

    return {
      count,
      limit: this.config.rateLimit.maxRequests,
      windowMs: this.config.rateLimit.windowMs * 1000,
      resetTime: ttl,
      exceeded: count > this.config.rateLimit.maxRequests,
    };
  }
}
