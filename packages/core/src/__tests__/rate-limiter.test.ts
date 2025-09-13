import { RateLimiter } from '../rate-limiter';
import { RedisClient } from '../redis';
import { FortiFiConfig } from '../types';

// Mock Redis client
const mockRedis = {
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  setex: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  exists: jest.fn().mockResolvedValue(0),
  incr: jest.fn().mockResolvedValue(1),
  expire: jest.fn().mockResolvedValue(1),
  ttl: jest.fn().mockResolvedValue(60),
  on: jest.fn(),
};

jest.mock('../redis', () => ({
  RedisClient: jest.fn().mockImplementation(() => mockRedis),
}));

describe('RateLimiter', () => {
  const config: FortiFiConfig = {
    jwtSecret: 'test-secret-key',
    redis: {
      host: 'localhost',
      port: 6379,
    },
    rateLimit: {
      maxRequests: 5,
      windowMs: 60,
      blockDurationMs: 300,
    },
    token: {
      ttl: 60,
      algorithm: 'HS256',
    },
    security: {
      enableCors: true,
      corsOrigins: ['*'],
      enableHelmet: true,
    },
  };

  let rateLimiter: RateLimiter;
  let mockRedisClient: jest.Mocked<RedisClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisClient = new RedisClient(config) as jest.Mocked<RedisClient>;
    rateLimiter = new RateLimiter(mockRedisClient, config);
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', async () => {
      mockRedisClient.exists.mockResolvedValue(false);
      mockRedisClient.incr.mockResolvedValue(3);
      mockRedisClient.expire.mockResolvedValue(1);
      mockRedisClient.ttl.mockResolvedValue(45);

      const result = await rateLimiter.checkRateLimit('192.168.1.1');

      expect(result.count).toBe(3);
      expect(result.limit).toBe(5);
      expect(result.exceeded).toBe(false);
      expect(mockRedisClient.incr).toHaveBeenCalledWith('rate_limit:192.168.1.1');
    });

    it('should block when limit exceeded', async () => {
      mockRedisClient.exists.mockResolvedValue(false);
      mockRedisClient.incr.mockResolvedValue(6); // Exceeds limit of 5
      mockRedisClient.expire.mockResolvedValue(1);
      mockRedisClient.ttl.mockResolvedValue(45);

      const result = await rateLimiter.checkRateLimit('192.168.1.1');

      expect(result.exceeded).toBe(true);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'blocked:192.168.1.1',
        '1',
        300 // blockDurationMs converted to seconds
      );
    });

    it('should return blocked status when IP is already blocked', async () => {
      mockRedisClient.exists.mockResolvedValue(true);
      mockRedisClient.ttl.mockResolvedValue(120);

      const result = await rateLimiter.checkRateLimit('192.168.1.1');

      expect(result.exceeded).toBe(true);
      expect(result.resetTime).toBe(120);
    });
  });

  describe('isBlocked', () => {
    it('should return true when IP is blocked', async () => {
      mockRedisClient.exists.mockResolvedValue(true);

      const result = await rateLimiter.isBlocked('192.168.1.1');

      expect(result).toBe(true);
      expect(mockRedisClient.exists).toHaveBeenCalledWith('blocked:192.168.1.1');
    });

    it('should return false when IP is not blocked', async () => {
      mockRedisClient.exists.mockResolvedValue(false);

      const result = await rateLimiter.isBlocked('192.168.1.1');

      expect(result).toBe(false);
    });
  });

  describe('blockIp', () => {
    it('should block IP with default duration', async () => {
      await rateLimiter.blockIp('192.168.1.1');

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'blocked:192.168.1.1',
        '1',
        300 // blockDurationMs converted to seconds
      );
    });

    it('should block IP with custom duration', async () => {
      await rateLimiter.blockIp('192.168.1.1', 600000); // 10 minutes in ms

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'blocked:192.168.1.1',
        '1',
        600 // 10 minutes in seconds
      );
    });
  });

  describe('unblockIp', () => {
    it('should unblock IP', async () => {
      await rateLimiter.unblockIp('192.168.1.1');

      expect(mockRedisClient.del).toHaveBeenCalledWith('blocked:192.168.1.1');
    });
  });

  describe('getRateLimitInfo', () => {
    it('should return rate limit info for non-blocked IP', async () => {
      mockRedisClient.exists.mockResolvedValue(false);
      mockRedisClient.get.mockResolvedValue('3');
      mockRedisClient.ttl.mockResolvedValue(45);

      const result = await rateLimiter.getRateLimitInfo('192.168.1.1');

      expect(result.count).toBe(3);
      expect(result.limit).toBe(5);
      expect(result.exceeded).toBe(false);
      expect(result.resetTime).toBe(45);
    });

    it('should return blocked info for blocked IP', async () => {
      mockRedisClient.exists.mockResolvedValue(true);
      mockRedisClient.ttl.mockResolvedValue(120);

      const result = await rateLimiter.getRateLimitInfo('192.168.1.1');

      expect(result.exceeded).toBe(true);
      expect(result.resetTime).toBe(120);
    });
  });
});
