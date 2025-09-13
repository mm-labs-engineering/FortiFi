import { Request, Response, NextFunction } from 'express';
import { FastifyRequest, FastifyReply } from 'fastify';
import { RedisClient } from './redis';
import { RateLimiter } from './rate-limiter';
import { JWTManager } from './jwt';
import { FortiFiConfig, TokenPayload, RateLimitInfo, ExpressRequest } from './types';

export class FortiFiMiddleware {
  private redis: RedisClient;
  private rateLimiter: RateLimiter;
  private jwtManager: JWTManager;
  private config: FortiFiConfig;

  constructor(config: FortiFiConfig) {
    this.config = config;
    this.redis = new RedisClient(config);
    this.rateLimiter = new RateLimiter(this.redis, config);
    this.jwtManager = new JWTManager(config);
  }

  async initialize(): Promise<void> {
    await this.redis.connect();
  }

  async destroy(): Promise<void> {
    await this.redis.disconnect();
  }

  // Express middleware
  validateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const payload = this.jwtManager.verifyToken(token);
    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Attach token info to request
    (req as ExpressRequest).fortifi = {
      ...(req as ExpressRequest).fortifi,
      token: payload,
    };

    next();
  };

  rateLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = this.getClientIp(req);
    const rateLimitInfo = await this.rateLimiter.checkRateLimit(ip);

    // Attach rate limit info to request
    (req as ExpressRequest).fortifi = {
      ...(req as ExpressRequest).fortifi,
      rateLimitInfo,
    };

    if (rateLimitInfo.exceeded) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: rateLimitInfo.resetTime,
      });
      return;
    }

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': rateLimitInfo.limit.toString(),
      'X-RateLimit-Remaining': Math.max(0, rateLimitInfo.limit - rateLimitInfo.count).toString(),
      'X-RateLimit-Reset': new Date(Date.now() + rateLimitInfo.resetTime * 1000).toISOString(),
    });

    next();
  };

  security = (req: Request, res: Response, next: NextFunction): void => {
    // CORS headers
    if (this.config.security.enableCors) {
      const origin = req.headers.origin;
      if (
        this.config.security.corsOrigins.includes('*') ||
        (origin && this.config.security.corsOrigins.includes(origin))
      ) {
        res.set('Access-Control-Allow-Origin', origin || '*');
      }
      res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.set('Access-Control-Allow-Credentials', 'true');
    }

    // Security headers
    if (this.config.security.enableHelmet) {
      res.set('X-Content-Type-Options', 'nosniff');
      res.set('X-Frame-Options', 'DENY');
      res.set('X-XSS-Protection', '1; mode=block');
      res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    }

    next();
  };

  // Fastify middleware
  validateTokenFastify = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      reply.status(401).send({ error: 'No token provided' });
      return;
    }

    const payload = this.jwtManager.verifyToken(token);
    if (!payload) {
      reply.status(401).send({ error: 'Invalid or expired token' });
      return;
    }

    // Attach token info to request
    (request as ExpressRequest).fortifi = {
      ...(request as ExpressRequest).fortifi,
      token: payload,
    };
  };

  rateLimitFastify = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const ip = this.getClientIpFastify(request);
    const rateLimitInfo = await this.rateLimiter.checkRateLimit(ip);

    // Attach rate limit info to request
    (request as ExpressRequest).fortifi = {
      ...(request as ExpressRequest).fortifi,
      rateLimitInfo,
    };

    if (rateLimitInfo.exceeded) {
      reply.status(429).send({
        error: 'Rate limit exceeded',
        retryAfter: rateLimitInfo.resetTime,
      });
      return;
    }

    // Add rate limit headers
    reply.header('X-RateLimit-Limit', rateLimitInfo.limit.toString());
    reply.header(
      'X-RateLimit-Remaining',
      Math.max(0, rateLimitInfo.limit - rateLimitInfo.count).toString()
    );
    reply.header(
      'X-RateLimit-Reset',
      new Date(Date.now() + rateLimitInfo.resetTime * 1000).toISOString()
    );
  };

  securityFastify = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // CORS headers
    if (this.config.security.enableCors) {
      const origin = request.headers.origin;
      if (
        this.config.security.corsOrigins.includes('*') ||
        (origin && this.config.security.corsOrigins.includes(origin))
      ) {
        reply.header('Access-Control-Allow-Origin', origin || '*');
      }
      reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      reply.header('Access-Control-Allow-Credentials', 'true');
    }

    // Security headers
    if (this.config.security.enableHelmet) {
      reply.header('X-Content-Type-Options', 'nosniff');
      reply.header('X-Frame-Options', 'DENY');
      reply.header('X-XSS-Protection', '1; mode=block');
      reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
      reply.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    }
  };

  // Utility methods
  generateToken(userId: string, articleId: string): string {
    return this.jwtManager.generateToken(userId, articleId);
  }

  verifyToken(token: string): TokenPayload | null {
    return this.jwtManager.verifyToken(token);
  }

  async getRateLimitInfo(ip: string): Promise<RateLimitInfo> {
    return this.rateLimiter.getRateLimitInfo(ip);
  }

  async isBlocked(ip: string): Promise<boolean> {
    return this.rateLimiter.isBlocked(ip);
  }

  async blockIp(ip: string, durationMs?: number): Promise<void> {
    return this.rateLimiter.blockIp(ip, durationMs);
  }

  async unblockIp(ip: string): Promise<void> {
    return this.rateLimiter.unblockIp(ip);
  }

  private getClientIp(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      '127.0.0.1'
    );
  }

  private getClientIpFastify(request: FastifyRequest): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (request.headers['x-real-ip'] as string) ||
      request.ip ||
      '127.0.0.1'
    );
  }
}
