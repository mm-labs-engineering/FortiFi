import { APIConfig } from './types';
import dotenv from 'dotenv';

dotenv.config();

export const config: APIConfig = {
  port: parseInt(process.env['PORT'] || '3000', 10),
  host: process.env['HOST'] || '0.0.0.0',
  databaseUrl: process.env['DATABASE_URL'] || 'postgresql://localhost:5432/fortifi',
  redisUrl: process.env['REDIS_URL'] || 'redis://localhost:6379',
  jwtSecret: process.env['JWT_SECRET'] || 'your-secret-key-change-in-production',
  aws: {
    accessKeyId: process.env['AWS_ACCESS_KEY_ID'] || '',
    secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] || '',
    region: process.env['AWS_REGION'] || 'us-east-1',
    bucket: process.env['AWS_S3_BUCKET'] || 'fortifi-assets',
  },
  watermarking: {
    enabled: process.env['WATERMARKING_ENABLED'] === 'true',
    textTemplate: process.env['WATERMARK_TEXT_TEMPLATE'] || 'User: {userId} | {timestamp}',
    opacity: parseFloat(process.env['WATERMARK_OPACITY'] || '0.3'),
    position: (process.env['WATERMARK_POSITION'] as string) || 'bottom-right',
  },
  rateLimit: {
    maxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '3600000', 10), // 1 hour
    blockDurationMs: parseInt(process.env['RATE_LIMIT_BLOCK_DURATION_MS'] || '300000', 10), // 5 minutes
  },
  cors: {
    origin: process.env['CORS_ORIGINS']?.split(',') || ['*'],
    credentials: process.env['CORS_CREDENTIALS'] === 'true',
  },
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Warning: ${envVar} is not set. Using default value.`);
  }
}

// Validate JWT secret in production
if (
  process.env['NODE_ENV'] === 'production' &&
  config.jwtSecret === 'your-secret-key-change-in-production'
) {
  throw new Error('JWT_SECRET must be set to a secure value in production');
}
