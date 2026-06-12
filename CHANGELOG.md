# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- FortiFi Editions comparison table
- Beta versioning system
- Enterprise feature roadmap

## [0.1.0-beta.1] - 2025-09-13

### Added
- Initial beta release of FortiFi Core
- Core middleware SDK (`@fortifi/core`)
- Browser client library (`@fortifi/client`)
- Cloud API service (`@fortifi/cloud`)
- Demo application with full paywall flow
- Docker and Docker Compose setup
- Comprehensive test suite (unit, integration, E2E)
- CI/CD pipeline with GitHub Actions
- OpenAPI specification
- Documentation and contributing guidelines

### Core Features
- JWT token generation and validation (60-second TTL)
- Redis-based rate limiting with IP blocking
- Server-side content delivery enforcement
- Express and Fastify middleware support
- Security headers and CORS protection
- Input validation and sanitization
- Basic watermarking support
- Presigned URL generation
- Prometheus metrics integration
- Structured logging with Pino

### Client Features
- UMD build for easy browser integration
- Token management and storage
- DOM manipulation for content updates
- Error handling and retry logic
- Customizable CTA templates
- Metadata injection

### API Features
- RESTful API endpoints
- Token generation and validation
- Article content management
- Rate limiting enforcement
- Watermarking job processing
- Health check endpoints
- Swagger/OpenAPI documentation

### Development Features
- TypeScript with full type safety
- ESLint and Prettier configuration
- Husky pre-commit hooks
- Commitlint for conventional commits
- Turborepo for monorepo management
- pnpm for package management
- Jest for unit testing
- Playwright for E2E testing
- Supertest for integration testing

### Infrastructure
- PostgreSQL database with Prisma ORM
- Redis for caching and rate limiting
- Docker containerization
- Kubernetes manifests
- Nginx reverse proxy configuration
- Environment-based configuration

### Security
- JWT-based authentication
- Rate limiting and IP blocking
- Input validation and sanitization
- Security headers (Helmet)
- CORS protection
- SQL injection prevention
- XSS protection
- CSRF protection

### Monitoring
- Prometheus metrics
- Structured JSON logging
- Health check endpoints
- Error tracking and reporting
- Performance monitoring

### Documentation
- Comprehensive README
- API documentation (OpenAPI)
- Architecture documentation
- Contributing guidelines
- Security policy
- Code examples and tutorials

## [0.0.1-alpha.1] - 2025-09-01

### Added
- Initial project setup
- Monorepo structure with pnpm and turborepo
- Basic TypeScript configuration
- ESLint and Prettier setup
- Git hooks with Husky
- Initial package structure

---

## Versioning Strategy

### Beta Phase (0.1.x-beta.x)
- **Current**: 0.1.0-beta.1
- **Purpose**: Feature development and testing
- **Stability**: Breaking changes expected
- **Release**: Every 2-4 weeks
- **Audience**: Early adopters and contributors

### Release Candidate Phase (0.1.x-rc.x)
- **Purpose**: Pre-release testing
- **Stability**: API stable, minor changes possible
- **Release**: 2-4 weeks before stable release
- **Audience**: Beta testers and enterprise customers

### Stable Release (1.0.0)
- **Purpose**: Production-ready release
- **Stability**: API stable, semantic versioning
- **Release**: Quarterly or as needed
- **Audience**: General public and enterprise customers

## Roadmap

### FortiFi Core (Open Source) - Q2 2024
- [ ] Stable 1.0.0 release
- [ ] Performance optimizations
- [ ] Additional framework support (Koa, Hapi)
- [ ] Enhanced documentation
- [ ] Community contributions

### FortiFi Cloud/Enterprise - Q3 2024
- [ ] Advanced watermarking (invisible IDs, steganography)
- [ ] ML-based bot detection
- [ ] Real-time monitoring dashboard
- [ ] Enterprise compliance features (GDPR, SOC2)
- [ ] Managed hosting and auto-scaling
- [ ] Advanced rate limiting (fingerprinting, behavioral)
- [ ] CDN and WAF integration
- [ ] Multi-tenant architecture
- [ ] Enterprise support and SLA

## Migration Guide

### From Alpha to Beta
- Update package versions to `0.1.0-beta.1`
- Review breaking changes in this changelog
- Update configuration if needed
- Run full test suite

### From Beta to Stable
- Update package versions to `1.0.0`
- Review migration guide (to be published)
- Update production configurations
- Monitor for any issues

## Support

- **Documentation**: [docs.fortifi.dev](https://docs.fortifi.dev)
- **Issues**: [GitHub Issues](https://github.com/mm-labs-engineering/FortiFi/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mm-labs-engineering/FortiFi/discussions)
- **Security**: security@fortifi.dev
- **Enterprise**: enterprise@fortifi.dev
