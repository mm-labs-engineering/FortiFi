# Core API Reference

Complete reference for the `@fortifi/core` package.

## 📦 Package Info

- **Package**: `@fortifi/core`
- **Version**: `0.1.0-beta.1`
- **Install**: `npm install @fortifi/core`
- **TypeScript**: ✅ Full support

## 🚀 Quick Start

```javascript
import { createFortiFi } from '@fortifi/core';

const fortifi = createFortiFi({
  jwtSecret: 'your-secret-key',
  redis: { host: 'localhost', port: 6379 },
  rateLimit: { maxRequests: 100, windowMs: 60 },
  token: { ttl: 60, algorithm: 'HS256' },
  security: { enableCors: true, enableHelmet: true }
});
```

## 🔧 Configuration

### **FortiFiConfig Interface**

```typescript
interface FortiFiConfig {
  jwtSecret: string;
  redis: RedisConfig;
  rateLimit: RateLimitConfig;
  token: TokenConfig;
  security: SecurityConfig;
}

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs: number;
}

interface TokenConfig {
  ttl: number;
  algorithm: 'HS256' | 'HS384' | 'HS512';
}

interface SecurityConfig {
  enableCors: boolean;
  corsOrigins: string[];
  enableHelmet: boolean;
}
```

### **Configuration Examples**

#### **Basic Configuration**
```javascript
const fortifi = createFortiFi({
  jwtSecret: 'your-secret-key',
  redis: { host: 'localhost', port: 6379 },
  rateLimit: { maxRequests: 100, windowMs: 60, blockDurationMs: 300 },
  token: { ttl: 60, algorithm: 'HS256' },
  security: { enableCors: true, corsOrigins: ['*'], enableHelmet: true }
});
```

#### **Production Configuration**
```javascript
const fortifi = createFortiFi({
  jwtSecret: process.env.JWT_SECRET,
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0')
  },
  rateLimit: {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    blockDurationMs: parseInt(process.env.RATE_LIMIT_BLOCK_DURATION_MS || '300000')
  },
  token: {
    ttl: parseInt(process.env.TOKEN_TTL || '60'),
    algorithm: process.env.TOKEN_ALGORITHM || 'HS256'
  },
  security: {
    enableCors: process.env.ENABLE_CORS !== 'false',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['https://yourdomain.com'],
    enableHelmet: process.env.ENABLE_HELMET !== 'false'
  }
});
```

## 🛠️ API Methods

### **createFortiFi(config: FortiFiConfig)**

Creates a new FortiFi middleware instance.

**Parameters:**
- `config` - Configuration object

**Returns:**
- `FortiFiMiddleware` instance

**Example:**
```javascript
const fortifi = createFortiFi({
  jwtSecret: 'secret',
  redis: { host: 'localhost', port: 6379 },
  rateLimit: { maxRequests: 100, windowMs: 60, blockDurationMs: 300 },
  token: { ttl: 60, algorithm: 'HS256' },
  security: { enableCors: true, corsOrigins: ['*'], enableHelmet: true }
});
```

### **fortifi.generateToken(userId: string, articleId: string)**

Generates a JWT token for accessing protected content.

**Parameters:**
- `userId` - User identifier
- `articleId` - Article identifier

**Returns:**
- `string` - JWT token

**Example:**
```javascript
const token = fortifi.generateToken('user-123', 'article-456');
// Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### **fortifi.verifyToken(token: string)**

Verifies a JWT token.

**Parameters:**
- `token` - JWT token to verify

**Returns:**
- `boolean` - True if token is valid

**Example:**
```javascript
const isValid = fortifi.verifyToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
// Returns: true or false
```

### **fortifi.validateToken**

Express.js middleware for validating tokens.

**Usage:**
```javascript
app.get('/api/protected', fortifi.validateToken, (req, res) => {
  res.json({ content: 'Protected content' });
});
```

**Request Headers:**
- `Authorization: Bearer <token>`

**Response:**
- `200` - Token valid, request proceeds
- `401` - Token invalid or missing
- `429` - Rate limit exceeded

### **fortifi.rateLimit**

Express.js middleware for rate limiting.

**Usage:**
```javascript
app.use('/api', fortifi.rateLimit);
```

**Features:**
- IP-based rate limiting
- Redis-backed storage
- Automatic IP blocking
- Configurable limits

### **fortifi.security**

Express.js middleware for security headers.

**Usage:**
```javascript
app.use(fortifi.security);
```

**Features:**
- CORS configuration
- Helmet security headers
- Content Security Policy
- XSS protection

## 🔌 Express.js Integration

### **Basic Setup**
```javascript
import express from 'express';
import { createFortiFi } from '@fortifi/core';

const app = express();
const fortifi = createFortiFi({
  jwtSecret: 'your-secret-key',
  redis: { host: 'localhost', port: 6379 },
  rateLimit: { maxRequests: 100, windowMs: 60, blockDurationMs: 300 },
  token: { ttl: 60, algorithm: 'HS256' },
  security: { enableCors: true, corsOrigins: ['*'], enableHelmet: true }
});

// Apply middleware
app.use(fortifi.security);
app.use('/api', fortifi.rateLimit);
app.use(express.json());

// Protected routes
app.get('/api/article/:id', fortifi.validateToken, (req, res) => {
  res.json({ content: 'Protected content' });
});

// Token generation
app.post('/api/token', (req, res) => {
  const { userId, articleId } = req.body;
  const token = fortifi.generateToken(userId, articleId);
  res.json({ token });
});

app.listen(3000);
```

### **Advanced Setup**
```javascript
import express from 'express';
import { createFortiFi } from '@fortifi/core';

const app = express();

// Custom error handling
const errorHandler = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  if (err.name === 'RateLimitError') {
    return res.status(429).json({ error: 'Too many requests' });
  }
  next(err);
};

const fortifi = createFortiFi({
  jwtSecret: process.env.JWT_SECRET,
  redis: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
  rateLimit: { maxRequests: 100, windowMs: 60, blockDurationMs: 300 },
  token: { ttl: 60, algorithm: 'HS256' },
  security: { enableCors: true, corsOrigins: process.env.CORS_ORIGINS?.split(',') }
});

app.use(fortifi.security);
app.use('/api', fortifi.rateLimit);
app.use(express.json());
app.use(errorHandler);

// Your routes here...

app.listen(process.env.PORT || 3000);
```

## 🔌 Fastify Integration

### **Basic Setup**
```javascript
import Fastify from 'fastify';
import { createFortiFi } from '@fortifi/core';

const fastify = Fastify();

const fortifi = createFortiFi({
  jwtSecret: 'your-secret-key',
  redis: { host: 'localhost', port: 6379 },
  rateLimit: { maxRequests: 100, windowMs: 60, blockDurationMs: 300 },
  token: { ttl: 60, algorithm: 'HS256' },
  security: { enableCors: true, corsOrigins: ['*'], enableHelmet: true }
});

// Register plugins
await fastify.register(require('@fastify/cors'), {
  origin: fortifi.config.security.corsOrigins
});

await fastify.register(require('@fastify/helmet'));

// Your routes here...

fastify.listen({ port: 3000 });
```

## 🧪 Testing

### **Unit Tests**
```javascript
import { createFortiFi } from '@fortifi/core';

describe('FortiFi Core', () => {
  let fortifi;

  beforeEach(() => {
    fortifi = createFortiFi({
      jwtSecret: 'test-secret',
      redis: { host: 'localhost', port: 6379 },
      rateLimit: { maxRequests: 100, windowMs: 60, blockDurationMs: 300 },
      token: { ttl: 60, algorithm: 'HS256' },
      security: { enableCors: true, corsOrigins: ['*'], enableHelmet: true }
    });
  });

  test('should generate valid token', () => {
    const token = fortifi.generateToken('user-123', 'article-456');
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  test('should verify valid token', () => {
    const token = fortifi.generateToken('user-123', 'article-456');
    const isValid = fortifi.verifyToken(token);
    expect(isValid).toBe(true);
  });

  test('should reject invalid token', () => {
    const isValid = fortifi.verifyToken('invalid-token');
    expect(isValid).toBe(false);
  });
});
```

### **Integration Tests**
```javascript
import request from 'supertest';
import express from 'express';
import { createFortiFi } from '@fortifi/core';

describe('FortiFi Integration', () => {
  let app;

  beforeEach(() => {
    app = express();
    const fortifi = createFortiFi({
      jwtSecret: 'test-secret',
      redis: { host: 'localhost', port: 6379 },
      rateLimit: { maxRequests: 100, windowMs: 60, blockDurationMs: 300 },
      token: { ttl: 60, algorithm: 'HS256' },
      security: { enableCors: true, corsOrigins: ['*'], enableHelmet: true }
    });

    app.use(fortifi.security);
    app.use('/api', fortifi.rateLimit);
    app.use(express.json());

    app.get('/api/protected', fortifi.validateToken, (req, res) => {
      res.json({ content: 'Protected content' });
    });

    app.post('/api/token', (req, res) => {
      const { userId, articleId } = req.body;
      const token = fortifi.generateToken(userId, articleId);
      res.json({ token });
    });
  });

  test('should protect routes without token', async () => {
    const response = await request(app)
      .get('/api/protected')
      .expect(401);
    
    expect(response.body.error).toBe('Token required');
  });

  test('should allow access with valid token', async () => {
    // Get token
    const tokenResponse = await request(app)
      .post('/api/token')
      .send({ userId: 'user-123', articleId: 'article-456' })
      .expect(200);

    const { token } = tokenResponse.body;

    // Access protected route
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.content).toBe('Protected content');
  });
});
```

## 🚨 Error Handling

### **Common Errors**

#### **JWT Errors**
```javascript
try {
  const token = fortifi.generateToken('user-123', 'article-456');
} catch (error) {
  if (error.name === 'JsonWebTokenError') {
    console.error('Invalid JWT secret');
  }
}
```

#### **Redis Errors**
```javascript
try {
  const isValid = fortifi.verifyToken(token);
} catch (error) {
  if (error.code === 'ECONNREFUSED') {
    console.error('Redis connection failed');
  }
}
```

#### **Rate Limit Errors**
```javascript
app.use((err, req, res, next) => {
  if (err.name === 'RateLimitError') {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: err.retryAfter
    });
  }
  next(err);
});
```

## 📊 Performance

### **Benchmarks**
- **Token Generation**: ~0.1ms
- **Token Verification**: ~0.2ms
- **Rate Limit Check**: ~1ms (with Redis)
- **Memory Usage**: ~2MB per instance

### **Optimization Tips**
1. **Use Redis** for rate limiting in production
2. **Cache tokens** when possible
3. **Monitor performance** with metrics
4. **Tune rate limits** based on usage

## 🔒 Security Considerations

### **JWT Security**
- Use strong, random secrets
- Rotate secrets regularly
- Use short token lifetimes
- Validate token claims

### **Rate Limiting**
- Set appropriate limits
- Monitor for abuse
- Implement progressive penalties
- Use IP whitelisting for trusted sources

### **CORS Configuration**
- Specify exact origins
- Avoid wildcard origins in production
- Use credentials carefully
- Validate preflight requests

## 📚 Related Documentation

- **Client API** → [Client API Reference](client-api.md)
- **Cloud API** → [Cloud API Reference](cloud-api.md)
- **Integration Guide** → [Client Usage Guide](../guides/client-usage.md)
- **Complete Example** → [Integration Example](../examples/integration-example.md)

## 🆘 Support

- **GitHub Issues** → [Report Problems](https://github.com/fortifi/fortifi/issues)
- **Documentation** → [Full Docs](../README.md)
- **Email Support** → support@fortifi.dev

---

**Core API reference complete! Ready to build secure paywalls! 🚀**
