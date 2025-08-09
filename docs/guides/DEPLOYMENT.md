# Deployment Guide

This document provides comprehensive guidance for deploying the PMPLearningManagement application across different environments.

## Overview

The application uses a modern CI/CD pipeline with comprehensive testing, quality gates, and monitoring to ensure reliable deployments.

### Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │     Staging     │    │   Production    │
│                 │    │                 │    │                 │
│ • Local testing │───▶│ • Integration   │───▶│ • Live users    │
│ • Feature dev   │    │ • QA testing    │    │ • Full monitoring│
│ • Unit tests    │    │ • E2E tests     │    │ • Performance   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

### System Requirements

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **Git**: Latest stable version
- **bash**: For deployment scripts (Linux/macOS/WSL)

### Development Tools

```bash
# Install required global tools
npm install -g @lighthouse-ci/cli
npm install -g bundlesize
```

### Environment Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yusuke-kurosawa/PMPLearningManagement.git
   cd PMPLearningManagement
   ```

2. **Install dependencies**:
   ```bash
   npm ci
   ```

3. **Install Playwright browsers**:
   ```bash
   npm run playwright:install
   ```

## Environment Configuration

### Environment Files

The application supports multiple environment configurations:

- **`.env.example`**: Template with all available variables
- **`.env.local`**: Local development (not tracked)
- **`.env.staging`**: Staging environment configuration
- **`.env.production`**: Production environment configuration

### Key Environment Variables

```bash
# Application Environment
NODE_ENV=production
VITE_APP_ENV=production

# Build Information
VITE_BUILD_VERSION=$GITHUB_SHA
VITE_BUILD_TIMESTAMP=$BUILD_TIMESTAMP

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true

# Performance Budgets
VITE_MAX_BUNDLE_SIZE=5120
VITE_MAX_ASSET_SIZE=1024
```

## CI/CD Pipeline

### Pipeline Overview

The CI/CD pipeline consists of several stages:

1. **Quality Gates** - Code quality and standards
2. **Unit Testing** - Component and utility testing
3. **E2E Testing** - End-to-end user journey testing
4. **Accessibility Testing** - WCAG compliance verification
5. **Performance Analysis** - Bundle size and Lighthouse auditing
6. **Security Scanning** - Dependency and vulnerability scanning
7. **Build and Deploy** - Production build and deployment
8. **Health Checks** - Post-deployment validation

### GitHub Actions Workflow

The main workflow (`.github/workflows/deploy.yml`) handles:

- **Parallel testing** across multiple browsers and shards
- **Quality gates** with configurable thresholds
- **Performance budgets** and bundle size monitoring
- **Security audits** and vulnerability scanning
- **Automated deployment** to GitHub Pages
- **Health checks** and rollback capabilities

### Branch Strategy

#### Main Branch (`main`)
- **Protection**: Required status checks, PR reviews
- **Deployment**: Automatic to production on merge
- **Quality**: All tests must pass, 80%+ coverage

#### Develop Branch (`develop`) [Optional]
- **Protection**: Basic quality checks
- **Deployment**: Staging environment
- **Quality**: Unit tests and linting required

#### Feature Branches (`feature/*`)
- **Protection**: None (developer responsibility)
- **Deployment**: None
- **Quality**: Local testing recommended

### Pull Request Process

1. **Create Feature Branch**:
   ```bash
   git checkout -b feature/new-feature
   git push -u origin feature/new-feature
   ```

2. **Development and Testing**:
   ```bash
   npm run test
   npm run lint
   npm run test:e2e
   ```

3. **Create Pull Request**:
   - Automated checks run on PR creation
   - Quality gates must pass
   - Required reviewer approval

4. **Merge to Main**:
   - Squash merge recommended
   - Automatic deployment triggered

## Deployment Methods

### 1. Automated Deployment (Recommended)

The primary deployment method uses GitHub Actions:

```yaml
# Triggered automatically on push to main
git push origin main
```

**Process**:
1. Quality checks and testing
2. Build optimization
3. Performance validation
4. Security scanning
5. Deployment to GitHub Pages
6. Health verification

### 2. Manual Deployment

For emergency deployments or local testing:

```bash
# Production deployment
./scripts/deploy.sh production

# Staging deployment
./scripts/deploy.sh staging

# Dry run (test without deploying)
./scripts/deploy.sh production true
```

### 3. Direct GitHub Pages Deployment

```bash
# Build and deploy directly
npm run build
npm run deploy
```

**Note**: This bypasses quality checks and should only be used for hotfixes.

## Quality Gates

### Code Quality Standards

- **Linting**: ESLint with React hooks rules
- **Testing**: Minimum 80% code coverage
- **Bundle Size**: Maximum 5MB total bundle
- **Performance**: Lighthouse scores > 80

### Testing Requirements

```bash
# Unit Tests
npm run test:run          # Run all unit tests
npm run test:coverage     # Generate coverage report

# E2E Tests
npm run test:e2e         # Full E2E test suite
npm run test:e2e:headed  # Run with browser UI

# Accessibility Tests
npm run test:a11y        # WCAG compliance check

# All Tests
npm run test:all         # Complete test suite
```

### Performance Budgets

- **Total Bundle**: 5MB maximum
- **Main Bundle**: 1MB maximum
- **Vendor Bundle**: 800KB maximum
- **CSS Bundle**: 50KB maximum

### Security Requirements

```bash
# Security audit
npm run security:audit

# Check for vulnerabilities
npm audit --audit-level=high
```

## Monitoring and Observability

### Health Monitoring

The application includes comprehensive health monitoring:

```bash
# Run health check
./scripts/health-check.sh

# Check specific URL
./scripts/health-check.sh https://example.com 30 3
```

**Health Check Coverage**:
- HTTP connectivity and response codes
- Response time performance
- Content validation
- Build information verification
- Route accessibility
- Security headers
- Resource availability

### Performance Monitoring

- **Lighthouse CI**: Automated performance auditing
- **Bundle Analysis**: Size tracking and alerts
- **Core Web Vitals**: LCP, FID, CLS monitoring
- **Real User Monitoring**: Performance tracking

### Error Tracking

- **JavaScript Errors**: Client-side error capture
- **Network Errors**: API and resource failures  
- **Performance Errors**: Slow loading detection
- **User Experience**: Navigation and interaction issues

### Uptime Monitoring

Configuration in `monitoring/uptime-config.yml`:

- **Endpoints**: Main routes and critical pages
- **Intervals**: 5-minute checks for critical paths
- **Alerts**: Email and webhook notifications
- **Thresholds**: 99.9% availability target

## Rollback Procedures

### Automatic Rollback

The deployment script includes automatic rollback on:
- Health check failures
- Critical performance degradation
- Error rate spikes

### Manual Rollback

```bash
# Emergency rollback to previous version
git log --oneline -n 5
git reset --hard <previous-commit>
./scripts/deploy.sh production
```

### Rollback Validation

```bash
# Verify rollback success
./scripts/health-check.sh
curl -s https://yusuke-kurosawa.github.io/PMPLearningManagement/build-info.json | jq .
```

## Troubleshooting

### Common Issues

#### 1. Build Failures

```bash
# Clear dependencies and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 2. Test Failures

```bash
# Update test snapshots
npm run test:run -- --update-snapshots

# Run specific test file
npm run test -- --run specific-test.test.js
```

#### 3. Deployment Issues

```bash
# Check GitHub Pages settings
# Repository Settings → Pages → Source: gh-pages branch

# Verify base path in vite.config.js
base: '/PMPLearningManagement/',
```

#### 4. Performance Issues

```bash
# Analyze bundle size
npm run build:analyze

# Check bundle composition
npx bundlesize
```

### Debug Mode

Enable debug logging:

```bash
export DEBUG=deploy:*
./scripts/deploy.sh production
```

### Health Check Debug

```bash
# Verbose health check
./scripts/health-check.sh https://example.com 30 3 --verbose

# Check specific components
curl -v https://yusuke-kurosawa.github.io/PMPLearningManagement/
```

## Security

### Deployment Security

- **Branch Protection**: Required reviews and status checks
- **Secret Management**: Environment-specific configurations
- **Dependency Scanning**: Automated vulnerability detection
- **Content Security**: CSP headers and HTTPS enforcement

### Security Checklist

- [ ] No secrets in source code
- [ ] Dependencies are up to date
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] Input validation implemented
- [ ] Error messages don't leak information

## Performance Optimization

### Build Optimization

- **Code Splitting**: Separate vendor and feature bundles
- **Tree Shaking**: Remove unused code
- **Minification**: Compress JavaScript and CSS
- **Asset Optimization**: Image and font optimization

### Runtime Optimization

- **Lazy Loading**: Route-based code splitting
- **Memoization**: React.memo and useMemo
- **Virtualization**: Large list optimization
- **Caching**: Browser and CDN caching

## Compliance and Auditing

### Accessibility Compliance

- **WCAG 2.1 AA**: Automated testing with jest-axe
- **Screen Reader**: Semantic HTML and ARIA
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: Minimum 4.5:1 ratio

### Performance Compliance

- **Core Web Vitals**: Google's UX metrics
- **Lighthouse Scores**: 90+ target for all categories
- **Bundle Budgets**: Size limitations enforced
- **Response Times**: Sub-3s loading targets

## Future Enhancements

### Planned Improvements

1. **Multi-Environment Deployments**
   - Staging environment setup
   - Preview deployments for PRs
   - Blue-green deployment strategy

2. **Advanced Monitoring**
   - Real user monitoring (RUM)
   - Error tracking integration (Sentry)
   - Custom dashboard deployment

3. **Performance Enhancements**
   - Service worker implementation
   - Progressive Web App features
   - Edge computing optimization

4. **Security Enhancements**
   - Content Security Policy
   - Subresource Integrity
   - Regular security audits

### Infrastructure Scaling

When migrating from GitHub Pages:

1. **CDN Integration**: CloudFlare or AWS CloudFront
2. **Backend Services**: API server deployment
3. **Database Integration**: User data persistence
4. **Real-time Features**: WebSocket support
5. **Microservices**: Service-oriented architecture

## Support and Maintenance

### Regular Maintenance Tasks

- **Weekly**: Dependency updates and security patches
- **Monthly**: Performance review and optimization
- **Quarterly**: Infrastructure review and capacity planning
- **Annually**: Security audit and compliance review

### Monitoring Dashboard Access

- **Health Status**: Real-time uptime and performance
- **Error Tracking**: Issue identification and resolution
- **Performance Metrics**: User experience monitoring
- **Business Analytics**: Usage patterns and trends

### Contact Information

For deployment issues or questions:
- **Technical Issues**: Create GitHub issue
- **Security Concerns**: Email security@pmp-learning.com
- **Performance Issues**: Monitor alerts and dashboards
- **General Questions**: Documentation and wiki

---

*This deployment guide is maintained by the development team and updated with each major release.*