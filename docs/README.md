<div align="center">
  <img width="704" height="229" alt="Screenshot 2025-09-13 at 2 56 09 PM" src="https://github.com/user-attachments/assets/1b71dbe6-fbe6-49f5-9f84-ab025426c53b" />
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

- [GitHub Issues](https://github.com/mm-labs-engineering/FortiFi/issues) - Bug reports
- [GitHub Discussions](https://github.com/mm-labs-engineering/FortiFi/discussions) - Questions
- Email: support@fortifi.dev
- Enterprise: enterprise@fortifi.dev

## Contributing

See [Contributing Guide](../CONTRIBUTING.md) for details.

## License

MIT License. See [LICENSE](../LICENSE) for details.
