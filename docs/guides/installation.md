# Installation Guide

Installation instructions for FortiFi packages.

## Package Overview

| Package | Purpose | Installation |
|---------|---------|--------------|
| `@fortifi/core` | Server-side middleware | `npm install @fortifi/core` |
| `@fortifi/client` | Browser client library | `npm install @fortifi/client` |
| `@fortifi/cloud` | Managed SaaS service | No installation needed |

## Server-side Installation

### Prerequisites
- Node.js 18+
- Redis server (for rate limiting)
- Express.js or Fastify

### Install Core Package
```bash
npm install @fortifi/core
```

### Install Dependencies
```bash
# For Express.js
npm install express redis ioredis jsonwebtoken

# For Fastify
npm install fastify @fastify/redis jsonwebtoken

# For TypeScript
npm install -D @types/jsonwebtoken @types/express
```

### Basic Setup
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

## Client-side Installation

### Option 1: NPM Package
```bash
npm install @fortifi/client
```

```javascript
import FortiFi from '@fortifi/client';

FortiFi.init({
  apiUrl: 'https://your-api.com',
  articleId: 'article-123',
  userId: 'user-456'
});
```

### Option 2: CDN (Recommended)
```html
<script src="https://unpkg.com/@fortifi/client@latest/dist/fortifi-client.js"></script>
<script>
  FortiFi.init({
    apiUrl: 'https://your-api.com',
    articleId: 'article-123',
    userId: 'user-456'
  });
</script>
```

## Docker Installation

```yaml
# docker-compose.yml
version: '3.8'
services:
  fortifi-api:
    image: fortifi/cloud:latest
    ports:
      - "3000:3000"
    environment:
      - JWT_SECRET=your-secret-key
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/fortifi
    depends_on:
      - redis
      - postgres

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=fortifi
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
```

```bash
docker-compose up -d
```

## Cloud Installation

No installation required. Get an API key and add script tag:

```html
<script src="https://cdn.fortifi.dev/client@latest/fortifi-client.js"></script>
<script>
  FortiFi.init({
    apiKey: 'your-api-key',
    articleId: 'article-123',
    userId: 'user-456'
  });
</script>
```

## Configuration

### Environment Variables
```bash
# Required
JWT_SECRET=your-super-secret-key-change-in-production
REDIS_URL=redis://localhost:6379

# Optional
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
TOKEN_TTL=60
```

### Configuration Object
```javascript
const config = {
  jwtSecret: process.env.JWT_SECRET,
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
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
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['*'],
    enableHelmet: process.env.ENABLE_HELMET !== 'false'
  }
};
```

## Testing Installation

### Test Server
```javascript
import express from 'express';
import { createFortiFi } from '@fortifi/core';

const app = express();
const fortifi = createFortiFi({
  jwtSecret: 'test-secret',
  redis: { host: 'localhost', port: 6379 },
  rateLimit: { maxRequests: 10, windowMs: 60 },
  token: { ttl: 60 },
  security: { enableCors: true, enableHelmet: true }
});

app.use(fortifi.security);
app.use('/api', fortifi.rateLimit);
app.use(express.json());

app.get('/api/test', fortifi.validateToken, (req, res) => {
  res.json({ message: 'Protected content!' });
});

app.post('/api/token', (req, res) => {
  const { userId, articleId } = req.body;
  const token = fortifi.generateToken(userId, articleId);
  res.json({ token });
});

app.listen(3000);
```

### Test Client
```html
<script src="https://unpkg.com/@fortifi/client@latest/dist/fortifi-client.js"></script>
<script>
  FortiFi.init({
    apiUrl: 'http://localhost:3000/api',
    articleId: 'test-article',
    userId: 'test-user',
    contentSelector: '#content'
  });

  document.getElementById('test-btn').onclick = async () => {
    try {
      await FortiFi.requestAccess();
      document.getElementById('test-btn').style.display = 'none';
    } catch (error) {
      alert('Test failed: ' + error.message);
    }
  };
</script>
```

## Troubleshooting

### Common Issues

**Redis Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
Solution: Start Redis server
```bash
# macOS
brew services start redis

# Ubuntu/Debian
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

**JWT Secret Error**
```
Error: secretOrPrivateKey must have a value
```
Solution: Set JWT secret
```bash
export JWT_SECRET="your-secret-key"
```

**CORS Error**
```
Access to fetch at 'http://localhost:3000' from origin 'http://localhost:3001' has been blocked by CORS policy
```
Solution: Configure CORS origins
```javascript
security: {
  enableCors: true,
  corsOrigins: ['http://localhost:3001', 'https://yourdomain.com']
}
```

**Rate Limit Error**
```
Error: Too Many Requests
```
Solution: Check rate limit configuration
```javascript
rateLimit: {
  maxRequests: 100,
  windowMs: 60000,
  blockDurationMs: 300000
}
```

### Debug Mode
```javascript
const fortifi = createFortiFi({
  // ... other config
  debug: true
});
```

## Next Steps

- [Client Usage Guide](client-usage.md) - Integration guide
- [Integration Example](../examples/integration-example.md) - Complete example
- [Core API](../api/core-api.md) - API reference

## Support

- [GitHub Issues](https://github.com/fortifi/fortifi/issues) - Bug reports
- [Documentation](../README.md) - Full docs
- Email: support@fortifi.dev
