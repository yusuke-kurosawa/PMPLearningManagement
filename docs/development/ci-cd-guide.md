# CI/CD Pipeline Management

## Overview

This directory contains all CI/CD pipeline configurations, workflows, and automation scripts for the PMPLearningManagement project. Our CI/CD implementation follows GitOps principles and emphasizes automation, security, and reliability.

## Directory Structure

```
ci-cd/
├── github-actions/      # GitHub Actions configurations
│   ├── workflows/       # Main workflow definitions
│   ├── composite/       # Reusable composite actions
│   └── templates/       # Workflow templates
├── pipelines/           # Generic pipeline definitions
│   ├── build/          # Build pipeline configs
│   ├── test/           # Test pipeline configs
│   └── deploy/         # Deployment pipeline configs
└── scripts/            # Supporting scripts
    ├── build.sh        # Build orchestration
    ├── test.sh         # Test execution
    ├── deploy.sh       # Deployment automation
    └── rollback.sh     # Rollback procedures
```

## Core Workflows

### 1. Main CI/CD Pipeline

**File**: `github-actions/workflows/main-ci-cd.yml`

```yaml
name: Main CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/composite/setup-node
      - run: npm ci
      - run: npm run build
      
  test:
    needs: build
    runs-on: ubuntu-latest
    strategy:
      matrix:
        test-suite: [unit, integration, e2e]
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/composite/run-tests
        with:
          suite: ${{ matrix.test-suite }}
          
  deploy:
    needs: [build, test]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: ./.github/actions/composite/deploy
        with:
          environment: production
```

### 2. Security Scanning Pipeline

**Purpose**: Automated security vulnerability scanning

- **Dependency Scanning**: npm audit, Snyk
- **Container Scanning**: Trivy, Anchore
- **Code Scanning**: CodeQL, SonarQube
- **Secret Detection**: GitLeaks, TruffleHog

### 3. Performance Testing Pipeline

**Purpose**: Automated performance regression detection

- **Load Testing**: k6, Artillery
- **Lighthouse CI**: Core Web Vitals monitoring
- **Bundle Analysis**: webpack-bundle-analyzer
- **Memory Profiling**: Chrome DevTools integration

## Pipeline Stages

### 1. Source Stage
```bash
# Triggered by:
- Git push/merge
- Pull request
- Scheduled cron
- Manual dispatch
- API trigger
```

### 2. Build Stage
```bash
# Actions:
- Dependency installation
- TypeScript compilation
- Asset optimization
- Bundle creation
- Docker image build
```

### 3. Test Stage
```bash
# Test Types:
- Unit tests (Vitest)
- Integration tests
- E2E tests (Playwright)
- Performance tests
- Security scans
- Code quality checks
```

### 4. Deploy Stage
```bash
# Deployment Strategies:
- Blue-Green deployment
- Canary releases
- Rolling updates
- Feature flag activation
```

### 5. Verify Stage
```bash
# Verification:
- Smoke tests
- Health checks
- Performance validation
- Security validation
- Rollback readiness
```

## Composite Actions

### Setup Node Environment
```yaml
# .github/actions/composite/setup-node/action.yml
name: 'Setup Node Environment'
description: 'Setup Node.js with caching'
inputs:
  node-version:
    description: 'Node.js version'
    default: '18'
runs:
  using: 'composite'
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
        cache: 'npm'
```

### Run Tests
```yaml
# .github/actions/composite/run-tests/action.yml
name: 'Run Test Suite'
description: 'Execute specified test suite with coverage'
inputs:
  suite:
    description: 'Test suite to run'
    required: true
runs:
  using: 'composite'
  steps:
    - run: npm ci
    - run: npm run test:${{ inputs.suite }} -- --coverage
    - uses: actions/upload-artifact@v3
      with:
        name: coverage-${{ inputs.suite }}
        path: coverage/
```

## Environment Configuration

### Development
```yaml
environment: development
variables:
  NODE_ENV: development
  API_URL: http://localhost:3000
  LOG_LEVEL: debug
```

### Staging
```yaml
environment: staging
variables:
  NODE_ENV: staging
  API_URL: https://staging.pmplearning.com
  LOG_LEVEL: info
secrets:
  - STAGING_DB_CONNECTION
  - STAGING_API_KEY
```

### Production
```yaml
environment: production
variables:
  NODE_ENV: production
  API_URL: https://api.pmplearning.com
  LOG_LEVEL: warn
secrets:
  - PROD_DB_CONNECTION
  - PROD_API_KEY
  - PROD_CDN_KEY
```

## Scripts Usage

### Build Script
```bash
#!/bin/bash
# ci-cd/scripts/build.sh

# Usage: ./build.sh [environment]
# Example: ./build.sh production

set -e

ENVIRONMENT=${1:-development}

echo "Building for $ENVIRONMENT..."

# Install dependencies
npm ci

# Run type checking
npm run type-check

# Build application
npm run build:$ENVIRONMENT

# Optimize assets
npm run optimize:assets

# Generate source maps
npm run generate:sourcemaps

echo "Build complete for $ENVIRONMENT"
```

### Test Script
```bash
#!/bin/bash
# ci-cd/scripts/test.sh

# Usage: ./test.sh [test-suite]
# Example: ./test.sh all

set -e

SUITE=${1:-all}

echo "Running $SUITE tests..."

case $SUITE in
  unit)
    npm run test:unit -- --coverage
    ;;
  integration)
    npm run test:integration
    ;;
  e2e)
    npm run test:e2e
    ;;
  all)
    npm run test:all
    ;;
  *)
    echo "Unknown test suite: $SUITE"
    exit 1
    ;;
esac

echo "Tests complete"
```

### Deploy Script
```bash
#!/bin/bash
# ci-cd/scripts/deploy.sh

# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production

set -e

ENVIRONMENT=${1:-staging}

echo "Deploying to $ENVIRONMENT..."

# Pre-deployment checks
./scripts/pre-deploy-check.sh $ENVIRONMENT

# Deploy based on environment
case $ENVIRONMENT in
  staging)
    npm run deploy:staging
    ;;
  production)
    # Require confirmation for production
    read -p "Deploy to PRODUCTION? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
      npm run deploy:production
    else
      echo "Deployment cancelled"
      exit 0
    fi
    ;;
  *)
    echo "Unknown environment: $ENVIRONMENT"
    exit 1
    ;;
esac

# Post-deployment verification
./scripts/post-deploy-verify.sh $ENVIRONMENT

echo "Deployment complete"
```

## Best Practices

### 1. Pipeline Design
- **Keep pipelines fast**: Target < 10 minutes for PR pipelines
- **Parallelize when possible**: Run independent jobs concurrently
- **Cache dependencies**: Use GitHub Actions cache for node_modules
- **Fail fast**: Stop pipeline on first critical failure
- **Use matrix builds**: Test across multiple Node.js versions

### 2. Security
- **Never commit secrets**: Use GitHub Secrets
- **Scan dependencies**: Regular vulnerability scanning
- **Sign commits**: Enable commit signature verification
- **Audit logs**: Track all deployment activities
- **Least privilege**: Minimal permissions for CI/CD

### 3. Testing Strategy
```yaml
# Test Pyramid
Unit Tests:        70% (fast, isolated)
Integration Tests: 20% (API, database)
E2E Tests:        10% (critical paths only)
```

### 4. Deployment Safety
- **Feature flags**: Gradual rollout
- **Canary deployments**: Test with subset of users
- **Automated rollback**: Quick recovery from failures
- **Health checks**: Continuous monitoring
- **Deployment windows**: Avoid high-traffic periods

## Monitoring & Metrics

### Key Metrics
```yaml
DORA Metrics:
  - Deployment Frequency: Daily
  - Lead Time for Changes: < 2 hours
  - Mean Time to Recovery: < 30 minutes
  - Change Failure Rate: < 5%

Pipeline Metrics:
  - Build Success Rate: > 95%
  - Test Pass Rate: > 98%
  - Pipeline Duration: < 10 minutes
  - Queue Time: < 2 minutes
```

### Dashboards
- **Pipeline Status**: Real-time pipeline execution
- **Deployment History**: Track all deployments
- **Test Results**: Test trends and flaky tests
- **Performance Metrics**: Build times, test duration
- **Cost Analysis**: CI/CD resource usage

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 2. Test Failures
```bash
# Run tests locally with same environment
NODE_ENV=test npm run test:unit -- --verbose
```

#### 3. Deployment Issues
```bash
# Check deployment logs
gh run view --log

# Verify environment variables
npm run env:check

# Manual rollback if needed
npm run rollback:production
```

## Integration Points

### 1. Issue Tracking
- Automatic issue linking in commits
- Deployment notifications in issues
- Auto-close issues on deployment

### 2. Slack Integration
```yaml
- name: Notify Slack
  uses: slack-notify-action@v1
  with:
    status: ${{ job.status }}
    webhook: ${{ secrets.SLACK_WEBHOOK }}
```

### 3. Monitoring Systems
- Send deployment events to DataDog
- Update StatusPage on deployments
- Trigger synthetic monitoring after deploy

## Maintenance

### Weekly Tasks
- Review failed pipelines
- Update dependencies
- Clean up old artifacts
- Review security alerts

### Monthly Tasks
- Analyze pipeline metrics
- Update documentation
- Review and optimize workflows
- Audit access permissions

## References

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [CI/CD Best Practices](https://www.atlassian.com/continuous-delivery/principles/continuous-integration-vs-delivery-vs-deployment)
- [DORA Metrics](https://www.devops-research.com/research.html)
- [GitOps Principles](https://www.gitops.tech/)

---

**Last Updated**: 2025-08-15  
**Version**: 2.0.0  
**Owner**: DevOps Team