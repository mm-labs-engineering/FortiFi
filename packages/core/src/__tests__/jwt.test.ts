import { JWTManager } from '../jwt';
import { FortiFiConfig } from '../types';

describe('JWTManager', () => {
  const config: FortiFiConfig = {
    jwtSecret: 'test-secret-key',
    redis: {
      host: 'localhost',
      port: 6379,
    },
    rateLimit: {
      maxRequests: 100,
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

  let jwtManager: JWTManager;

  beforeEach(() => {
    jwtManager = new JWTManager(config);
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const userId = 'user123';
      const articleId = 'article456';
      
      const token = jwtManager.generateToken(userId, articleId);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include correct payload in token', () => {
      const userId = 'user123';
      const articleId = 'article456';
      
      const token = jwtManager.generateToken(userId, articleId);
      const decoded = jwtManager.decodeToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(userId);
      expect(decoded?.articleId).toBe(articleId);
      expect(decoded?.type).toBe('access');
      expect(decoded?.iat).toBeDefined();
      expect(decoded?.exp).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const userId = 'user123';
      const articleId = 'article456';
      
      const token = jwtManager.generateToken(userId, articleId);
      const payload = jwtManager.verifyToken(token);
      
      expect(payload).toBeDefined();
      expect(payload?.userId).toBe(userId);
      expect(payload?.articleId).toBe(articleId);
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const payload = jwtManager.verifyToken(invalidToken);
      
      expect(payload).toBeNull();
    });

    it('should return null for expired token', () => {
      // Create a token with very short TTL
      const shortConfig = { ...config, token: { ...config.token, ttl: 0.001 } }; // 1ms
      const shortJwtManager = new JWTManager(shortConfig);
      
      const token = shortJwtManager.generateToken('user123', 'article456');
      
      // Wait for token to expire
      setTimeout(() => {
        const payload = shortJwtManager.verifyToken(token);
        expect(payload).toBeNull();
      }, 10);
    });
  });

  describe('isTokenExpired', () => {
    it('should detect expired token', () => {
      const shortConfig = { ...config, token: { ...config.token, ttl: 0.001 } }; // 1ms
      const shortJwtManager = new JWTManager(shortConfig);
      
      const token = shortJwtManager.generateToken('user123', 'article456');
      
      setTimeout(() => {
        const isExpired = shortJwtManager.isTokenExpired(token);
        expect(isExpired).toBe(true);
      }, 10);
    });

    it('should detect valid token as not expired', () => {
      const token = jwtManager.generateToken('user123', 'article456');
      const isExpired = jwtManager.isTokenExpired(token);
      
      expect(isExpired).toBe(false);
    });
  });
});
