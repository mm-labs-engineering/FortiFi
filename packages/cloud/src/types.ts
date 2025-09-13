import { z } from 'zod';

// Request/Response schemas
export const TokenRequestSchema = z.object({
  articleId: z.string().min(1),
  userId: z.string().min(1).optional(),
});

export const ArticleResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  metadata: z.object({
    author: z.string(),
    publishedAt: z.string(),
    tags: z.array(z.string()),
    category: z.string().optional(),
  }),
  assets: z.object({
    pdf: z.string().optional(),
    images: z.array(z.string()).optional(),
  }).optional(),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
});

export const RateLimitResponseSchema = z.object({
  count: z.number(),
  limit: z.number(),
  windowMs: z.number(),
  resetTime: z.number(),
  exceeded: z.boolean(),
});

// Type exports
export type TokenRequest = z.infer<typeof TokenRequestSchema>;
export type ArticleResponse = z.infer<typeof ArticleResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type RateLimitResponse = z.infer<typeof RateLimitResponseSchema>;

// API Configuration
export interface APIConfig {
  port: number;
  host: string;
  databaseUrl: string;
  redisUrl: string;
  jwtSecret: string;
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucket: string;
  };
  watermarking: {
    enabled: boolean;
    textTemplate: string;
    opacity: number;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  };
  rateLimit: {
    maxRequests: number;
    windowMs: number;
    blockDurationMs: number;
  };
  cors: {
    origin: string[];
    credentials: boolean;
  };
}

// Service interfaces
export interface ArticleService {
  getArticle(id: string, userId?: string): Promise<ArticleResponse | null>;
  createArticle(data: Partial<ArticleResponse>): Promise<ArticleResponse>;
  updateArticle(id: string, data: Partial<ArticleResponse>): Promise<ArticleResponse | null>;
  deleteArticle(id: string): Promise<boolean>;
}

export interface TokenService {
  generateToken(userId: string, articleId: string): Promise<string>;
  validateToken(token: string): Promise<{ userId: string; articleId: string } | null>;
  revokeToken(token: string): Promise<boolean>;
}

export interface RateLimitService {
  checkRateLimit(ip: string, userId?: string): Promise<RateLimitResponse>;
  blockIp(ip: string, durationMs: number): Promise<void>;
  unblockIp(ip: string): Promise<void>;
  isBlocked(ip: string): Promise<boolean>;
}

export interface WatermarkService {
  createWatermarkJob(articleId: string, userId: string, assetUrl: string): Promise<string>;
  processWatermarkJob(jobId: string): Promise<void>;
  getWatermarkJob(jobId: string): Promise<any>;
}

// Database types
export interface DatabaseUser {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseArticle {
  id: string;
  title: string;
  content: string;
  teaser: string | null;
  author: string;
  publishedAt: Date;
  category: string | null;
  tags: string[];
  isPremium: boolean;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface DatabaseToken {
  id: string;
  token: string;
  userId: string;
  articleId: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

// Fastify request extensions
declare module 'fastify' {
  interface FastifyRequest {
    user?: DatabaseUser;
    article?: DatabaseArticle;
    rateLimitInfo?: RateLimitResponse;
  }
}
