import { PrismaClient } from '@prisma/client';
import { TokenService } from '../types';
import { JWTManager } from '@fortifi/core';
import { config } from '../config';
import { v4 as uuidv4 } from 'uuid';

export class TokenServiceImpl implements TokenService {
  private jwtManager: JWTManager;

  constructor(private prisma: PrismaClient) {
    this.jwtManager = new JWTManager({
      jwtSecret: config.jwtSecret,
      redis: {
        host: 'localhost', // This should come from config
        port: 6379,
      },
      rateLimit: {
        maxRequests: config.rateLimit.maxRequests,
        windowMs: config.rateLimit.windowMs / 1000,
        blockDurationMs: config.rateLimit.blockDurationMs / 1000,
      },
      token: {
        ttl: 60, // 60 seconds
        algorithm: 'HS256',
      },
      security: {
        enableCors: true,
        corsOrigins: config.cors.origin,
        enableHelmet: true,
      },
    });
  }

  async generateToken(userId: string, articleId: string): Promise<string> {
    // Verify article exists
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new Error('Article not found');
    }

    // Check if user has access to the article
    const hasAccess = await this.checkUserAccess(userId, articleId);
    if (!hasAccess) {
      throw new Error('User does not have access to this article');
    }

    // Generate JWT token
    const token = this.jwtManager.generateToken(userId, articleId);

    // Store token in database for tracking
    await this.prisma.token.create({
      data: {
        id: uuidv4(),
        token,
        userId,
        articleId,
        expiresAt: new Date(Date.now() + 60 * 1000), // 60 seconds from now
      },
    });

    return token;
  }

  async validateToken(token: string): Promise<{ userId: string; articleId: string } | null> {
    // Verify JWT token
    const payload = this.jwtManager.verifyToken(token);
    if (!payload) {
      return null;
    }

    // Check if token exists in database and is not used
    const dbToken = await this.prisma.token.findUnique({
      where: { token },
    });

    if (!dbToken || dbToken.isUsed || dbToken.expiresAt < new Date()) {
      return null;
    }

    // Mark token as used
    await this.prisma.token.update({
      where: { id: dbToken.id },
      data: { isUsed: true },
    });

    return {
      userId: payload.userId,
      articleId: payload.articleId,
    };
  }

  async revokeToken(token: string): Promise<boolean> {
    try {
      await this.prisma.token.update({
        where: { token },
        data: { isUsed: true },
      });
      return true;
    } catch {
      return false;
    }
  }

  private async checkUserAccess(userId: string, articleId: string): Promise<boolean> {
    // Check if user has an active subscription
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        currentPeriodEnd: {
          gt: new Date(),
        },
      },
    });

    if (!subscription) {
      return false;
    }

    // For premium articles, check if user has premium subscription
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
    });

    if (article?.isPremium && subscription.plan === 'FREE') {
      return false;
    }

    return true;
  }
}
