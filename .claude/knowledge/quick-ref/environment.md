# Environment Variables & Configuration Reference / 環境変数・設定リファレンス

> 🔐 **Validate environment**: `npm run env:validate`  
> 🔄 **Sync environments**: `npm run env:sync`  
> 📊 **Environment dashboard**: `npm run env:dashboard`

## 🎯 Environment Overview

### Environment Hierarchy

```yaml
Environments:
  Local Development: .env.local (gitignored)
  Development: .env.development
  Staging: .env.staging
  Production: .env.production
  Test: .env.test

Priority (highest to lowest): 1. Process environment variables
  2. .env.local
  3. .env.[mode]
  4. .env

Never commit:
  - .env.local
  - .env.production.local
  - Any file with secrets
```

## 🔧 Core Configuration

### Application Settings

```bash
# Node Environment
NODE_ENV=development|staging|production
# Controls: Build optimizations, error handling, logging level

# Application URL
VITE_APP_URL=http://localhost:5173
# Production: https://pmp-learning.com

# API Base URL
VITE_API_URL=http://localhost:3000/api/v1
# Production: https://api.pmp-learning.com/api/v1

# WebSocket URL
VITE_WS_URL=ws://localhost:3000
# Production: wss://ws.pmp-learning.com

# Public Path (for CDN)
VITE_PUBLIC_PATH=/
# CDN: https://cdn.pmp-learning.com/

# Version Info
VITE_APP_VERSION=$npm_package_version
VITE_BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
VITE_COMMIT_SHA=$(git rev-parse --short HEAD)
```

### Feature Flags

```bash
# Feature Toggles
VITE_FEATURE_AI_COACHING=true
VITE_FEATURE_COLLABORATION=false
VITE_FEATURE_MOCK_EXAM=true
VITE_FEATURE_PREMIUM_CONTENT=false
VITE_FEATURE_OFFLINE_MODE=true
VITE_FEATURE_DARK_MODE=true
VITE_FEATURE_MULTILINGUAL=false
VITE_FEATURE_SOCIAL_LOGIN=true

# Beta Features
VITE_BETA_FEATURES=false
VITE_BETA_USER_IDS=user1,user2,user3

# Maintenance Mode
VITE_MAINTENANCE_MODE=false
VITE_MAINTENANCE_MESSAGE="Scheduled maintenance until 2 PM UTC"
```

## 🔐 Authentication & Security

### Supabase Configuration

```bash
# Supabase (Public keys only!)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# Never expose service role key in frontend!

# Auth Settings
VITE_AUTH_REDIRECT_URL=http://localhost:5173/auth/callback
VITE_AUTH_PASSWORD_MIN_LENGTH=8
VITE_AUTH_SESSION_TIMEOUT=3600000 # 1 hour in ms
VITE_AUTH_REFRESH_THRESHOLD=300000 # 5 minutes before expiry

# OAuth Providers (Public IDs only!)
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
VITE_GITHUB_CLIENT_ID=xxxxx
VITE_MICROSOFT_CLIENT_ID=xxxxx
```

### Security Headers

```bash
# Content Security Policy
VITE_CSP_DEFAULT_SRC="'self'"
VITE_CSP_SCRIPT_SRC="'self' 'unsafe-inline' https://www.google-analytics.com"
VITE_CSP_STYLE_SRC="'self' 'unsafe-inline' https://fonts.googleapis.com"
VITE_CSP_IMG_SRC="'self' data: https:"
VITE_CSP_CONNECT_SRC="'self' https://api.pmp-learning.com wss://ws.pmp-learning.com"

# CORS Settings
VITE_CORS_ORIGINS=http://localhost:5173,https://pmp-learning.com
VITE_CORS_CREDENTIALS=true

# Security Keys (Backend only!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
ENCRYPTION_KEY=your-encryption-key-min-32-chars
SESSION_SECRET=your-session-secret-min-32-chars
API_KEY_SALT=your-api-key-salt
```

## 🗄️ Database Configuration

### PostgreSQL (Prisma)

```bash
# Database URL
DATABASE_URL=postgresql://user:password@localhost:5432/pmp_learning_dev
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA

# Database Pool Settings
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_POOL_ACQUIRE=30000
DATABASE_POOL_IDLE=10000

# Prisma Settings
PRISMA_LOG_LEVEL=info,warn,error
PRISMA_QUERY_LOG=false
SHADOW_DATABASE_URL=postgresql://user:password@localhost:5432/shadow

# Migration Settings
AUTO_MIGRATE=false
SEED_DATABASE=true
```

### Redis Cache

```bash
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0
REDIS_KEY_PREFIX=pmp:

# Cache Settings
CACHE_TTL_DEFAULT=300 # 5 minutes
CACHE_TTL_SESSION=3600 # 1 hour
CACHE_TTL_STATIC=86400 # 1 day
CACHE_MAX_SIZE=100MB
```

### MongoDB (Future)

```bash
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/pmp_learning
MONGODB_USER=admin
MONGODB_PASSWORD=password
MONGODB_AUTH_SOURCE=admin
```

## 📧 Third-Party Services

### Email Service (SendGrid)

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@pmp-learning.com
SENDGRID_FROM_NAME="PMP Learning"
SENDGRID_TEMPLATE_WELCOME=d-xxxxx
SENDGRID_TEMPLATE_RESET_PASSWORD=d-xxxxx
SENDGRID_TEMPLATE_EXAM_RESULT=d-xxxxx

# Email Settings
EMAIL_ENABLED=true
EMAIL_PREVIEW_MODE=false # Show emails in console
EMAIL_RATE_LIMIT=100 # per hour
```

### Payment Processing (Stripe)

```bash
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx # Backend only!
STRIPE_WEBHOOK_SECRET=whsec_xxxxx # Backend only!
STRIPE_PRICE_MONTHLY=price_xxxxx
STRIPE_PRICE_ANNUAL=price_xxxxx
STRIPE_TAX_RATE=txr_xxxxx

# Payment Settings
PAYMENT_CURRENCY=USD
PAYMENT_TRIAL_DAYS=7
PAYMENT_REFUND_WINDOW=30
```

### Analytics & Monitoring

```bash
# Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXX
VITE_GA_DEBUG_MODE=false

# Sentry Error Tracking
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
VITE_SENTRY_ENVIRONMENT=development
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
VITE_SENTRY_PROFILES_SAMPLE_RATE=0.1
SENTRY_AUTH_TOKEN=xxxxx # For source maps upload

# LogRocket Session Recording
VITE_LOGROCKET_APP_ID=xxxxx/pmp-learning
VITE_LOGROCKET_ENABLED=false

# Datadog APM
DD_API_KEY=xxxxx
DD_APP_KEY=xxxxx
DD_SITE=datadoghq.com
DD_ENV=development
DD_SERVICE=pmp-learning-frontend
DD_VERSION=1.0.0
```

### Cloud Storage (AWS S3)

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=AKIAXXXXX
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_REGION=us-east-1
AWS_S3_BUCKET=pmp-learning-uploads
AWS_S3_ENDPOINT=https://s3.amazonaws.com
AWS_CLOUDFRONT_URL=https://d1xxxxx.cloudfront.net

# Storage Settings
UPLOAD_MAX_SIZE=10485760 # 10MB
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,application/pdf
UPLOAD_PATH_PREFIX=uploads/
```

## 🚀 Deployment Configuration

### Build Settings

```bash
# Build Configuration
VITE_BUILD_TARGET=es2020
VITE_BUILD_SOURCEMAP=true
VITE_BUILD_MINIFY=true
VITE_BUILD_CHUNK_SIZE_WARNING=500 # KB
VITE_BUILD_ROLLUP_OPTIONS={}

# Output Settings
BUILD_PATH=dist
PUBLIC_PATH=/
ASSET_PATH=assets/

# Optimization
VITE_LEGACY_BROWSER_SUPPORT=false
VITE_PRELOAD_STRATEGY=modulepreload
VITE_TREE_SHAKING=true
```

### CI/CD Settings

```bash
# GitHub Actions
CI=true
GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }}
GITHUB_REPOSITORY=owner/repo
GITHUB_REF=refs/heads/main
GITHUB_SHA=commit-sha
GITHUB_RUN_ID=run-id

# Deployment
DEPLOY_URL=https://pmp-learning.com
DEPLOY_PREVIEW_URL=https://preview-$PR_NUMBER.pmp-learning.com
NETLIFY_AUTH_TOKEN=xxxxx
VERCEL_TOKEN=xxxxx
```

### Docker Configuration

```bash
# Docker Settings
DOCKER_REGISTRY=docker.io
DOCKER_USERNAME=username
DOCKER_PASSWORD=password
DOCKER_IMAGE_NAME=pmp-learning
DOCKER_IMAGE_TAG=latest

# Container Settings
CONTAINER_PORT=5173
CONTAINER_HOST=0.0.0.0
CONTAINER_MEMORY_LIMIT=512M
CONTAINER_CPU_LIMIT=0.5
```

## 🔍 Development Tools

### Development Server

```bash
# Vite Dev Server
VITE_SERVER_HOST=localhost
VITE_SERVER_PORT=5173
VITE_SERVER_HTTPS=false
VITE_SERVER_OPEN=true
VITE_SERVER_CORS=true
VITE_SERVER_PROXY_API=/api:http://localhost:3000

# HMR Settings
VITE_HMR_PROTOCOL=ws
VITE_HMR_HOST=localhost
VITE_HMR_PORT=5173
VITE_HMR_TIMEOUT=30000
```

### Testing Configuration

```bash
# Test Environment
TEST_TIMEOUT=30000
TEST_RETRIES=3
TEST_PARALLEL=true
TEST_COVERAGE_THRESHOLD=80
TEST_WATCH_MODE=false

# E2E Testing
E2E_BASE_URL=http://localhost:5173
E2E_HEADLESS=true
E2E_SLOW_MO=0
E2E_SCREENSHOT_ON_FAILURE=true
E2E_VIDEO_ON_FAILURE=false

# Test Users
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=Test123!
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=Admin123!
```

### Debugging

```bash
# Debug Settings
DEBUG=app:*
DEBUG_HIDE_DATE=false
DEBUG_COLORS=true
DEBUG_DEPTH=2
LOG_LEVEL=debug

# Source Maps
GENERATE_SOURCEMAP=true
INLINE_RUNTIME_CHUNK=false

# Performance Profiling
REACT_PROFILER=true
WEBPACK_BUNDLE_ANALYZER=false
```

## 📋 Environment Templates

### .env.example

```bash
# This is a template for environment variables
# Copy this file to .env.local and fill in your values

# Required Variables
NODE_ENV=development
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000/api/v1
DATABASE_URL=postgresql://user:password@localhost:5432/db

# Optional Variables
# VITE_FEATURE_AI_COACHING=false
# REDIS_URL=redis://localhost:6379
# SENDGRID_API_KEY=your-key-here
```

### Development Setup Script

```bash
#!/bin/bash
# setup-env.sh

echo "🔧 Setting up environment..."

# Copy template if .env.local doesn't exist
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "✅ Created .env.local from template"
fi

# Generate secrets
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

# Update .env.local
echo "JWT_SECRET=$JWT_SECRET" >> .env.local
echo "SESSION_SECRET=$SESSION_SECRET" >> .env.local

echo "✅ Environment setup complete"
echo "📝 Please update .env.local with your API keys"
```

## 🔐 Secret Management

### Using GitHub Secrets

```bash
# Set secret via GitHub CLI
gh secret set DATABASE_URL

# Set from file
gh secret set PRODUCTION_ENV < .env.production

# List secrets
gh secret list

# Remove secret
gh secret delete API_KEY
```

### Using Vault (HashiCorp)

```bash
# Store secret
vault kv put secret/pmp-learning/api api_key="xxxxx"

# Retrieve secret
vault kv get -field=api_key secret/pmp-learning/api

# Use in application
export API_KEY=$(vault kv get -field=api_key secret/pmp-learning/api)
```

### Using AWS Secrets Manager

```bash
# Create secret
aws secretsmanager create-secret \
  --name pmp-learning/production \
  --secret-string file://.env.production

# Retrieve secret
aws secretsmanager get-secret-value \
  --secret-id pmp-learning/production \
  --query SecretString \
  --output text
```

## 🔄 Environment Validation

### Validation Script

```javascript
// scripts/validate-env.js
const required = ['NODE_ENV', 'VITE_APP_URL', 'VITE_API_URL', 'DATABASE_URL']

const validate = () => {
  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach((key) => console.error(`  - ${key}`))
    process.exit(1)
  }

  console.log('✅ All required environment variables are set')
}

validate()
```

### Type-Safe Environment

```typescript
// src/env.d.ts
interface ImportMetaEnv {
  readonly VITE_APP_URL: string
  readonly VITE_API_URL: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_FEATURE_AI_COACHING?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Usage with type safety
const apiUrl = import.meta.env.VITE_API_URL // typed as string
```

## 🚨 Security Best Practices

### DO's ✅

```yaml
- Use separate .env files for each environment
- Keep .env.local in .gitignore
- Use environment-specific secrets
- Rotate secrets regularly
- Use least privilege principle
- Encrypt sensitive values
- Validate environment variables on startup
- Use secret management tools in production
- Document all required variables
- Use type-safe environment access
```

### DON'Ts ❌

```yaml
- Never commit secrets to git
- Don't use production secrets in development
- Don't hardcode secrets in code
- Don't share .env.local files
- Don't use weak secrets
- Don't expose backend secrets to frontend
- Don't log sensitive values
- Don't use same secrets across environments
- Don't ignore security warnings
- Don't trust user-provided environment values
```

## 📊 Environment Monitoring

### Health Check Endpoint

```javascript
// GET /api/health
{
  "status": "healthy",
  "environment": "production",
  "version": "1.2.3",
  "uptime": 123456,
  "checks": {
    "database": "connected",
    "redis": "connected",
    "storage": "accessible"
  }
}
```

### Environment Info Component

```jsx
// Only show in development
{
  process.env.NODE_ENV === 'development' && (
    <div className="env-info">
      Environment: {process.env.NODE_ENV}
      API: {import.meta.env.VITE_API_URL}
      Version: {import.meta.env.VITE_APP_VERSION}
    </div>
  )
}
```

---

_Environment configuration is validated on every build. Last validation: Check with `npm run env:validate`_
