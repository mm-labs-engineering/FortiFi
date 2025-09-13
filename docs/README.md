<div align="center">
  <svg width="150" height="60" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 15 L20 25 C20 35, 30 45, 50 50 C70 45, 80 35, 80 25 L80 15 C80 10, 75 5, 70 5 L30 5 C25 5, 20 10, 20 15 Z" fill="#4CAF50" stroke="#45a049" stroke-width="1"/>
    <circle cx="50" cy="25" r="8" fill="#212121"/>
    <rect x="46" y="25" width="8" height="12" fill="#212121"/>
    <rect x="44" y="35" width="12" height="3" fill="#212121"/>
    <text x="100" y="35" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#212121">FortiFi</text>
  </svg>
  <h1>🛡️ FortiFi Documentation</h1>
</div>

Complete guide to implementing paywall hardening with server-side enforcement.

## Getting Started

- [Quick Start](guides/quick-start.md) - 5-minute setup
- [Installation](guides/installation.md) - Detailed setup
- [Demo Setup](guides/demo-setup.md) - Run the demo

## Integration

- [Client Usage](guides/client-usage.md) - How clients integrate FortiFi
- [Integration Example](examples/integration-example.md) - Complete working example

## API Reference

- [Core API](api/core-api.md) - @fortifi/core package
- [Client API](api/client-api.md) - @fortifi/client package
- [Cloud API](api/cloud-api.md) - @fortifi/cloud package
- [OpenAPI Spec](api/openapi.yaml) - Complete API specification

## Architecture

- [System Architecture](architecture.md) - Technical overview
- [Roadmap](roadmap.md) - Features and pricing

## Packages

| Package | Purpose | Documentation |
|---------|---------|---------------|
| `@fortifi/core` | Server-side middleware | [Core API](api/core-api.md) |
| `@fortifi/client` | Browser client library | [Client API](api/client-api.md) |
| `@fortifi/cloud` | Managed SaaS service | [Cloud API](api/cloud-api.md) |

## Quick Start

```bash
# Install packages
npm install @fortifi/core @fortifi/client

# Backend setup
import { createFortiFi } from '@fortifi/core';
const fortifi = createFortiFi({
  jwtSecret: 'your-secret-key',
  redis: { host: 'localhost', port: 6379 },
  rateLimit: { maxRequests: 100, windowMs: 60 },
  token: { ttl: 60, algorithm: 'HS256' },
  security: { enableCors: true, enableHelmet: true }
});

# Frontend setup
<script src="https://unpkg.com/@fortifi/client@latest/dist/fortifi-client.js"></script>
<script>
  FortiFi.init({
    apiUrl: 'https://your-api.com',
    articleId: 'article-123',
    userId: 'user-456',
    contentSelector: '#article-content'
  });
</script>
```

## Security Features

- Server-side enforcement - Content never sent without valid token
- Short-lived tokens - 60-second default expiration
- Rate limiting - Prevent abuse and scraping
- CSS/DOM bypass protection - Cannot be manipulated client-side
- JWT-based authentication - Industry standard security

## Pricing

**Free Tier (Self-hosted)**
- Core paywall protection
- Basic watermarking
- Rate limiting
- Community support
- Cost: $0

**Cloud Tier (Managed)**
- Everything in free tier
- Advanced features
- Analytics dashboard
- Priority support
- Cost: $79-499/month

**Enterprise (On-premise)**
- Everything in cloud tier
- Custom integrations
- 24/7 support
- SLA guarantees
- Cost: Custom pricing

## Support

- [GitHub Issues](https://github.com/fortifi/fortifi/issues) - Bug reports
- [GitHub Discussions](https://github.com/fortifi/fortifi/discussions) - Questions
- Email: support@fortifi.dev
- Enterprise: enterprise@fortifi.dev

## Contributing

See [Contributing Guide](../CONTRIBUTING.md) for details.

## License

MIT License. See [LICENSE](../LICENSE) for details.
