# FortiFi Release Notes

## v0.1.0-beta.1 - September 13, 2025

### 🎉 Initial Beta Release

FortiFi is now available in beta! This release includes the complete open-source toolkit for hardening paywalls against CSS/DOM bypasses.

### ✨ What's New

#### Core Features
- **JWT Token System**: 60-second TTL tokens for secure content access
- **Server-side Enforcement**: Content delivery with token validation
- **Rate Limiting**: Redis-based IP blocking and abuse prevention
- **Basic Watermarking**: PDF and image watermarking support
- **Multi-framework Support**: Express and Fastify middleware

#### Packages Released
- `@fortifi/core@0.1.0-beta.1` - Core middleware SDK
- `@fortifi/client@0.1.0-beta.1` - Browser client library
- `@fortifi/cloud@0.1.0-beta.1` - Cloud API service
- `@fortifi/demo@0.1.0-beta.1` - Demo application

#### Developer Experience
- **TypeScript**: Full type safety across all packages
- **Comprehensive Testing**: 80%+ test coverage with Jest and Playwright
- **Docker Support**: Complete containerization with docker-compose
- **Documentation**: Extensive docs and examples
- **CI/CD**: Automated testing and deployment pipeline

### 🚀 Quick Start

```bash
# Install packages
npm install @fortifi/core @fortifi/client

# Or use the demo
git clone https://github.com/mm-labs-engineering/FortiFi.git
cd fortifi
docker-compose up
```

### 📋 What's Working

- ✅ Complete paywall flow (teaser → token → content)
- ✅ Token generation and validation
- ✅ Rate limiting and IP blocking
- ✅ Basic watermarking for PDFs/images
- ✅ Express and Fastify integration
- ✅ Browser client with UMD build
- ✅ Docker deployment
- ✅ Comprehensive test suite
- ✅ OpenAPI documentation

### ⚠️ Beta Limitations

- Breaking changes may occur between beta releases
- API may evolve based on feedback
- Some advanced features are not yet available
- Performance optimizations are ongoing

### 🔮 What's Coming Next

#### FortiFi Core (Q4 2025)
- Performance optimizations
- Additional framework support (Koa, Hapi)
- Enhanced documentation
- Stable 1.0.0 release

#### FortiFi Enterprise (Q1 2026)
- Advanced watermarking with invisible IDs
- ML-based bot detection
- Real-time monitoring dashboard
- Enterprise compliance features
- Managed hosting and auto-scaling

### 🐛 Known Issues

- Watermarking may be slow for large files
- Rate limiting may be too aggressive in some cases
- Client library requires modern browsers (ES6+)

### 📞 Support

- **Documentation**: [docs.fortifi.dev](https://docs.fortifi.dev)
- **Issues**: [GitHub Issues](https://github.com/mm-labs-engineering/FortiFi/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mm-labs-engineering/FortiFi/discussions)
- **Email**: support@fortifi.dev

### 🙏 Acknowledgments

Thank you to all contributors and early testers who helped make this beta release possible!

---

## Version History

### v0.1.0-beta.1 (2025-09-13)
- Initial beta release
- Complete core functionality
- Docker support
- Comprehensive testing
- Full documentation

### v0.0.1-alpha.1 (2025-09-01)
- Initial project setup
- Monorepo structure
- Basic TypeScript configuration
- Development tooling
