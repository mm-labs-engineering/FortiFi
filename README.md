<div align="center">
  <svg width="200" height="80" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 15 L20 25 C20 35, 30 45, 50 50 C70 45, 80 35, 80 25 L80 15 C80 10, 75 5, 70 5 L30 5 C25 5, 20 10, 20 15 Z" fill="#4CAF50" stroke="#45a049" stroke-width="1"/>
    <circle cx="50" cy="25" r="8" fill="#212121"/>
    <rect x="46" y="25" width="8" height="12" fill="#212121"/>
    <rect x="44" y="35" width="12" height="3" fill="#212121"/>
    <text x="100" y="35" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#212121">FortiFi</text>
  </svg>
  <h1>🛡️ FortiFi</h1>
  <p><em>Paywall Hardening & Content Protection</em></p>
</div>

[![CI](https://github.com/Obetta/FortiFi/actions/workflows/ci.yml/badge.svg)](https://github.com/Obetta/FortiFi/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)

Open-source toolkit that hardens paywalls against CSS/DOM bypasses through server-side enforcement, short-lived tokens, watermarking, and rate limiting.

> **Status**: Currently in Beta (v0.1.0-beta.1) - Released September 13, 2025 - See [Roadmap](docs/roadmap.md) for upcoming features

## FortiFi Editions

| Feature                          | FortiFi Core (Open Source) | FortiFi Cloud / Enterprise (Commercial) |
|----------------------------------|----------------------------|------------------------------------------|
| Teaser-only HTML delivery        | ✅                         | ✅                                       |
| Short-lived JWT tokens           | ✅                         | ✅                                       |
| Drop-in client snippet           | ✅                         | ✅                                       |
| Example integrations & demo      | ✅                         | ✅                                       |
| Content watermarking (basic)     | ⚠️ Limited (DIY)           | ✅ Advanced (HTML/PDF/PNG, invisible IDs) |
| Rate limiting                    | ✅ Basic (per IP/session)  | ✅ Advanced (multi-factor, fingerprinting)|
| Bot detection / scraping defense | ❌                         | ✅ Behavioral, ML-based, honeypots        |
| Real-time monitoring dashboard   | ❌                         | ✅ Graphs, alerts, anomaly insights       |
| Presigned asset URLs             | ✅                         | ✅ (with CDN/WAF integration)             |
| Enterprise compliance (GDPR, SLA)| ❌                         | ✅                                       |
| Hosted & auto-scaled             | ❌ Self-host only          | ✅ Fully managed SaaS                     |
| Pricing                          | Free (MIT License)         | Subscription / Enterprise contract        |

## Current Status: Beta

FortiFi is currently in **beta phase** (v0.1.0-beta.1). This means:

- ✅ **Core functionality is stable** and ready for testing
- ⚠️ **Breaking changes may occur** between beta releases
- 🔧 **API may evolve** based on feedback
- 📝 **Documentation is complete** but may be updated
- 🧪 **Test coverage is comprehensive** (80%+)

### What's Available Now (Beta)
- Complete paywall hardening toolkit
- JWT token system with 60-second TTL
- Redis-based rate limiting
- Basic watermarking support
- Express and Fastify middleware
- Browser client library
- Docker setup for easy deployment
- Comprehensive test suite

### What's Coming (Enterprise)
- Advanced watermarking with invisible IDs
- ML-based bot detection
- Real-time monitoring dashboard
- Enterprise compliance features
- Managed hosting and auto-scaling
- Advanced rate limiting and fingerprinting

See our [Roadmap](docs/roadmap.md) for detailed feature timeline.

## Features

- Server-side content delivery with token validation
- JWT tokens with 60-second TTL
- Redis-based rate limiting with IP blocking
- Optional per-user watermarking for PDFs and images
- Presigned URLs for secure asset delivery
- Prometheus metrics and structured logging
- Express and Fastify support
- TypeScript with full type safety
- Lightweight UMD browser client

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| [`@fortifi/core`](./packages/core) | Core middleware SDK for Node.js | [![npm](https://img.shields.io/npm/v/@fortifi/core.svg)](https://www.npmjs.com/package/@fortifi/core) |
| [`@fortifi/client`](./packages/client) | Lightweight UMD client for browsers | [![npm](https://img.shields.io/npm/v/@fortifi/client.svg)](https://www.npmjs.com/package/@fortifi/client) |
| [`@fortifi/cloud`](./packages/cloud) | SaaS API with Fastify, PostgreSQL, Prisma, Redis | [![npm](https://img.shields.io/npm/v/@fortifi/cloud.svg)](https://www.npmjs.com/package/@fortifi/cloud) |

## Quick Start

### Install Dependencies

```bash
npm install -g pnpm
git clone https://github.com/fortifi/fortifi.git
cd fortifi
pnpm install
```

### Start with Docker

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- API on port 3000
- Demo on port 3001

### Access the Demo

- Demo Site: http://localhost:3001
- API Docs: http://localhost:3000/docs
- Health Check: http://localhost:3000/health

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL 15+
- Redis 7+

### Setup

```bash
pnpm install
docker-compose up -d postgres redis
cp env.example .env
cd packages/cloud && pnpm run db:push
pnpm run dev
```

### Scripts

```bash
pnpm run build      # Build all packages
pnpm run test       # Run tests
pnpm run test:e2e   # Run E2E tests
pnpm run lint       # Lint code
pnpm run format     # Format code
pnpm run type-check # Type check
```

## Usage

### Core Middleware

```typescript
import express from 'express';
import { createFortiFi } from '@fortifi/core';

const app = express();
const fortifi = createFortiFi({
  jwtSecret: 'your-secret-key',
  redis: { host: 'localhost', port: 6379 },
  rateLimit: { maxRequests: 100, windowMs: 60, blockDurationMs: 300 },
  token: { ttl: 60, algorithm: 'HS256' },
  security: { enableCors: true, corsOrigins: ['*'], enableHelmet: true },
});

app.use(fortifi.security);
app.use('/api', fortifi.rateLimit);
app.get('/api/article/:id', fortifi.validateToken, (req, res) => {
  res.json({ content: 'Premium article content' });
});
app.post('/api/token', (req, res) => {
  const { userId, articleId } = req.body;
  const token = fortifi.generateToken(userId, articleId);
  res.json({ token });
});
```

### Client Integration

```html
<script src="https://unpkg.com/@fortifi/client@latest/dist/fortifi-client.js"></script>
<script>
  FortiFi.init({
    apiUrl: 'https://api.example.com',
    articleId: 'article-123',
    userId: 'user-456',
    contentSelector: '#article-body',
  });
</script>
```

### Cloud API

```typescript
import { build } from '@fortifi/cloud';
const app = await build();
await app.listen({ port: 3000, host: '0.0.0.0' });
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://localhost:5432/fortifi` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `PORT` | API server port | `3000` |
| `HOST` | API server host | `0.0.0.0` |
| `NODE_ENV` | Environment | `development` |

### Rate Limiting

```typescript
const fortifi = createFortiFi({
  rateLimit: {
    maxRequests: 100,        // Max requests per window
    windowMs: 60,            // Time window in seconds
    blockDurationMs: 300,    // Block duration in seconds
  },
});
```

### Watermarking

```typescript
const fortifi = createFortiFi({
  watermarking: {
    enabled: true,
    textTemplate: 'User: {userId} | {timestamp}',
    opacity: 0.3,
    position: 'bottom-right',
  },
});
```

## Testing

### Unit Tests

```bash
pnpm run test              # Run all tests
cd packages/core && pnpm run test  # Specific package
pnpm run test:coverage     # With coverage
```

### E2E Tests

```bash
pnpm run test:e2e          # Run E2E tests
cd examples/demo && pnpm run test:ui  # With UI
```

## Monitoring

### Prometheus Metrics

Available at `/metrics`:
- `fortifi_requests_total` - Total requests
- `fortifi_tokens_generated_total` - Tokens generated
- `fortifi_rate_limit_exceeded_total` - Rate limit violations
- `fortifi_watermark_jobs_total` - Watermarking jobs

### Grafana Dashboard

Import provided dashboard JSON for:
- Request rates and response times
- Token generation metrics
- Rate limiting effectiveness
- Error rates

## Deployment

### Docker

```bash
docker-compose build
docker-compose up -d
docker-compose up -d --scale api=3  # Scale API
```

### Kubernetes

```bash
kubectl apply -f k8s/
kubectl get pods -l app=fortifi
```

### Environment Configuration

```bash
# Production
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db:5432/fortifi
REDIS_URL=redis://prod-redis:6379
JWT_SECRET=super-secure-secret
```

## Contributing

See [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and run tests: `pnpm run test`
4. Commit: `git commit -m 'Add amazing feature'`
5. Push and open Pull Request

### Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write tests for new features
- Update documentation as needed

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- [Documentation](https://fortifi.dev/docs)
- [Issue Tracker](https://github.com/fortifi/fortifi/issues)
- [Discussions](https://github.com/fortifi/fortifi/discussions)
- [Email Support](mailto:support@fortifi.dev)

## Acknowledgments

- [Express.js](https://expressjs.com/) - Web framework
- [Fastify](https://www.fastify.io/) - Fast web framework
- [Prisma](https://www.prisma.io/) - Database toolkit
- [Redis](https://redis.io/) - In-memory data store
- [JWT](https://jwt.io/) - JSON Web Tokens
