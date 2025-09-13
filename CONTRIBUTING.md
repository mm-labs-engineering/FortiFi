# Contributing to FortiFi

Thank you for your interest in contributing to FortiFi! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher
- Git
- Docker and Docker Compose (for local development)

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/fortifi.git
   cd fortifi
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start development services**
   ```bash
   # Start PostgreSQL and Redis
   docker-compose up -d postgres redis
   
   # Run database migrations
   cd packages/cloud
   pnpm run db:push
   ```

5. **Start development servers**
   ```bash
   pnpm run dev
   ```

## Project Structure

```
fortifi/
├── packages/
│   ├── core/           # Core middleware SDK
│   ├── client/         # Browser client library
│   └── cloud/          # SaaS API service
├── examples/
│   └── demo/           # Demo application
├── docs/               # Documentation
├── .github/
│   └── workflows/      # CI/CD workflows
└── k8s/               # Kubernetes manifests
```

## Testing

### Running Tests

```bash
pnpm run test              # Run all tests
cd packages/core && pnpm run test  # Specific package
pnpm run test:coverage     # With coverage
pnpm run test:e2e          # E2E tests
```

### Test Coverage

We maintain 80%+ test coverage across all packages. New code should include appropriate tests.

## Code Style

### TypeScript

- Use TypeScript for all new code
- Follow the existing type patterns
- Use strict type checking
- Prefer interfaces over types for object shapes

### ESLint and Prettier

```bash
pnpm run lint      # Check linting issues
pnpm run lint:fix  # Fix linting issues
pnpm run format    # Format code
```

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix bug
docs: update documentation
style: formatting changes
refactor: code refactoring
test: add or update tests
chore: maintenance tasks
```

## Bug Reports

### Before Submitting

1. Check if the issue already exists
2. Try to reproduce the issue
3. Check the latest version

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Environment:**
- OS: [e.g. macOS, Windows, Linux]
- Node.js version: [e.g. 18.17.0]
- Package version: [e.g. 1.0.0]
```

## Feature Requests

### Before Submitting

1. Check if the feature already exists
2. Consider if it fits the project's scope
3. Think about implementation complexity

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or workarounds.
```

## Pull Requests

### Before Submitting

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Add tests for new functionality
   - Update documentation as needed
   - Follow the coding style guidelines

3. **Test your changes**
   ```bash
   pnpm run test
   pnpm run lint
   pnpm run type-check
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Pull Request Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

## Documentation

### Writing Documentation

- Use clear, concise language
- Include code examples
- Update README files when needed
- Add JSDoc comments for public APIs

### Documentation Structure

- `README.md` - Main project documentation
- `CONTRIBUTING.md` - This file
- `SECURITY.md` - Security policies
- `docs/` - Detailed documentation
- `packages/*/README.md` - Package-specific docs

## Security

### Reporting Security Issues

**Do not open public issues for security vulnerabilities.**

Instead, please email security@fortifi.dev with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Security Guidelines

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Validate all user inputs
- Follow secure coding practices
- Keep dependencies updated

## Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/):
- `MAJOR` - Breaking changes
- `MINOR` - New features (backward compatible)
- `PATCH` - Bug fixes (backward compatible)

### Release Workflow

1. Changes are merged to `main` branch
2. CI/CD pipeline runs tests and builds
3. Semantic versioning determines next version
4. Packages are published to npm
5. Docker images are built and pushed
6. GitHub release is created

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Provide constructive feedback
- Focus on the code, not the person

### Getting Help

- Check existing issues and discussions
- Ask questions in GitHub Discussions
- Join our community Discord (coming soon)
- Email us at support@fortifi.dev

## Development Priorities

### High Priority
- Security improvements
- Performance optimizations
- Bug fixes
- Documentation improvements

### Medium Priority
- New features
- API enhancements
- Developer experience improvements

### Low Priority
- Nice-to-have features
- Cosmetic improvements
- Experimental features

## Performance Guidelines

### Code Performance
- Optimize for readability first
- Profile before optimizing
- Use appropriate data structures
- Minimize memory allocations

### Bundle Size
- Keep client bundle small
- Use tree shaking
- Avoid unnecessary dependencies
- Optimize images and assets

## Testing Guidelines

### Unit Tests
- Test individual functions and methods
- Mock external dependencies
- Aim for high coverage
- Test edge cases and error conditions

### Integration Tests
- Test component interactions
- Use real databases and services
- Test API endpoints
- Verify data flow

### E2E Tests
- Test user workflows
- Use realistic data
- Test across different browsers
- Include accessibility tests

## Monitoring and Observability

### Metrics
- Track key performance indicators
- Monitor error rates
- Measure response times
- Track resource usage

### Logging
- Use structured logging
- Include relevant context
- Log at appropriate levels
- Avoid logging sensitive data

## Continuous Integration

### Pre-commit Hooks
- Lint code
- Format code
- Run type checking
- Run tests

### CI Pipeline
- Install dependencies
- Run linting and type checking
- Run unit tests
- Run integration tests
- Run E2E tests
- Build packages
- Generate coverage reports

## Package Management

### Dependencies
- Use exact versions for production dependencies
- Use caret ranges for development dependencies
- Regular dependency updates
- Security vulnerability scanning

### Publishing
- Automated publishing via CI/CD
- Semantic versioning
- Proper package metadata
- Documentation generation

## Recognition

Contributors will be recognized in:
- README contributors section
- Release notes
- Annual contributor report
- Community highlights

Thank you for contributing to FortiFi!
