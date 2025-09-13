import { PrismaClient } from '@prisma/client';
import { RateLimitService, RateLimitResponse } from '../types';
import { config } from '../config';

export class RateLimitServiceImpl implements RateLimitService {
  constructor(private prisma: PrismaClient) {}

  async checkRateLimit(ip: string, userId?: string): Promise<RateLimitResponse> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - config.rateLimit.windowMs);
    const windowEnd = now;

    // Get or create rate limit record
    let rateLimit = await this.prisma.rateLimit.findUnique({
      where: {
        ip_windowStart: {
          ip,
          windowStart,
        },
      },
    });

    if (!rateLimit) {
      // Create new rate limit record
      rateLimit = await this.prisma.rateLimit.create({
        data: {
          ip,
          count: 1,
          windowStart,
          windowEnd,
          isBlocked: false,
          userId: userId || null,
        },
      });
    } else {
      // Update existing record
      rateLimit = await this.prisma.rateLimit.update({
        where: { id: rateLimit.id },
        data: {
          count: rateLimit.count + 1,
          windowEnd: now,
        },
      });
    }

    const exceeded = rateLimit.count > config.rateLimit.maxRequests;
    const resetTime = Math.ceil((rateLimit.windowEnd.getTime() + config.rateLimit.windowMs - now.getTime()) / 1000);

    // Block IP if limit exceeded
    if (exceeded && !rateLimit.isBlocked) {
      await this.blockIp(ip, config.rateLimit.blockDurationMs);
    }

    return {
      count: rateLimit.count,
      limit: config.rateLimit.maxRequests,
      windowMs: config.rateLimit.windowMs,
      resetTime,
      exceeded,
    };
  }

  async blockIp(ip: string, durationMs: number): Promise<void> {
    const blockUntil = new Date(Date.now() + durationMs);

    await this.prisma.rateLimit.updateMany({
      where: { ip },
      data: {
        isBlocked: true,
        blockUntil,
      },
    });
  }

  async unblockIp(ip: string): Promise<void> {
    await this.prisma.rateLimit.updateMany({
      where: { ip },
      data: {
        isBlocked: false,
        blockUntil: null,
      },
    });
  }

  async isBlocked(ip: string): Promise<boolean> {
    const now = new Date();
    
    const blockedRecord = await this.prisma.rateLimit.findFirst({
      where: {
        ip,
        isBlocked: true,
        blockUntil: {
          gt: now,
        },
      },
    });

    return !!blockedRecord;
  }
}
