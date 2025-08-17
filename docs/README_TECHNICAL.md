# PMP Learning Management System - Technical Documentation

## 🏗️ Architecture Overview

### Technology Stack

#### Frontend
- **Framework**: React 18.2 with TypeScript
- **Build Tool**: Vite 5.x
- **Routing**: React Router v6 (HashRouter for GitHub Pages)
- **State Management**: Zustand + React Context API
- **UI Components**: Radix UI + Tailwind CSS
- **Visualization**: D3.js v7
- **Animation**: Framer Motion
- **Form Handling**: React Hook Form + Zod

#### Testing
- **Unit Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright
- **Coverage**: ~64% (improving to 80%)
- **Mutation Testing**: Stryker
- **Property Testing**: Fast-check

#### DevOps & CI/CD
- **Hosting**: GitHub Pages
- **CI/CD**: GitHub Actions
- **Package Manager**: npm
- **Code Quality**: ESLint + Prettier
- **Git Hooks**: Husky (IDD compliance)

## 📊 Performance Metrics

### Current Status (2025-08-16)
- **Bundle Size**: 1.09 MB total JS
- **Main Bundle**: 162 KB ✅
- **Vendor Bundle**: 156 KB ✅
- **CSS Size**: 85 KB ✅
- **Code Splitting**: 20+ lazy-loaded chunks
- **Lighthouse Score**: Target 70+ (Performance)

### Optimization Features
- Lazy loading with React.lazy/Suspense
- Code splitting per route
- Asset hashing for cache optimization
- Service Worker for offline support (PWA)
- Performance monitoring (Web Vitals)
- Image optimization pipeline

## 🚀 Quick Start

### Prerequisites
```bash
Node.js 18+
npm 8+
```

### Installation
```bash
git clone https://github.com/yusuke-kurosawa/PMPLearningManagement.git
cd PMPLearningManagement
npm install
npm run idd:setup  # Setup IDD hooks
```

### Development
```bash
npm run dev         # Start dev server (http://localhost:5173)
npm run test:watch  # Run tests in watch mode
npm run lint        # Check code quality
```

### Build & Deploy
```bash
npm run build       # Production build
npm run preview     # Preview production build
npm run deploy      # Deploy to GitHub Pages
```

### Performance Analysis
```bash
npm run analyze     # Build and analyze bundle size
npm run perf:check  # Run performance checks
```

## 📁 Project Structure

```
PMPLearningManagement/
├── src/
│   ├── components/        # React components
│   │   ├── auth/         # Authentication
│   │   ├── coaching/     # AI coaching features
│   │   ├── collaboration/# Collaboration tools
│   │   ├── layout/       # Layout components
│   │   ├── learning/     # Learning features
│   │   ├── mobile/       # Mobile-optimized
│   │   ├── pages/        # Page components
│   │   ├── shared/       # Shared components
│   │   ├── simulator/    # Project simulator
│   │   └── visualizations/ # D3.js visualizations
│   │
│   ├── contexts/         # React contexts
│   ├── services/         # Business logic
│   ├── lib/             # Libraries & utilities
│   │   ├── auth/        # Authentication
│   │   ├── cache/       # Redis caching
│   │   ├── db/          # Database utilities
│   │   └── security/    # Security features
│   │
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   └── data/            # Static data
│
├── .github/
│   ├── workflows/       # GitHub Actions
│   └── hooks/          # Git hooks
│
├── .claude/            # Claude AI context
├── scripts/            # Build & automation
├── docs/              # Documentation
└── tests/             # Test files
```

## 🔒 Security Features

### Implemented
- JWT authentication with refresh tokens
- CSRF protection
- Rate limiting (Redis-based)
- Input validation (Zod schemas)
- Content Security Policy (CSP)
- Secure headers (HSTS, X-Frame-Options)
- Encryption for sensitive data

### Authentication Flow
1. User login → JWT + Refresh token
2. Token stored in httpOnly cookies
3. Automatic token refresh
4. Role-based access control (RBAC)

## 🧪 Testing Strategy

### Test Coverage Goals
- Unit Tests: 80% coverage
- Integration Tests: Critical paths
- E2E Tests: User journeys
- Performance Tests: Core Web Vitals

### Running Tests
```bash
npm run test           # Run all tests
npm run test:coverage  # Generate coverage report
npm run test:e2e       # Run E2E tests
npm run test:mutation  # Run mutation tests
```

## 📈 IDD (Issue-Driven Development)

### Compliance: 99%
All commits must reference an issue:
```bash
git commit -m "feat: Add feature #123"
git commit -m "fix: Fix bug #456"
```

### Automated Checks
- Pre-commit hooks validate issue references
- GitHub Actions enforce IDD compliance
- Automated metrics collection

## 🚢 Deployment

### GitHub Pages (Production)
```yaml
# Automatic deployment on main branch push
npm run deploy
```

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
ENCRYPTION_MASTER_KEY=your_encryption_key
```

## 📊 Monitoring

### Performance Monitoring
- Web Vitals tracking
- Bundle size analysis
- Memory usage monitoring
- Error tracking

### Metrics Tracked
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to First Byte (TTFB)

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

1. **Test CI** (`test-ci.yml`)
   - Matrix testing (Node 18.x, 20.x)
   - Unit & integration tests
   - Coverage reporting

2. **Deploy** (`deploy.yml`)
   - Production build
   - Asset optimization
   - Lighthouse audit
   - GitHub Pages deployment

3. **IDD Compliance** (`idd-compliance.yml`)
   - Issue reference validation
   - Commit message format
   - Automated metrics

## 🛠️ Development Tools

### VS Code Extensions (Recommended)
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Vitest Runner
- GitLens

### Browser Extensions
- React Developer Tools
- Redux DevTools (for Zustand)
- Lighthouse

## 📝 API Documentation

### Key Services

#### AuthService
```typescript
authService.login(email, password)
authService.logout()
authService.refreshToken()
authService.getCurrentUser()
```

#### ProgressService
```typescript
progressService.getProgress(userId)
progressService.updateProgress(data)
progressService.calculateScore()
```

#### CacheService
```typescript
cacheManager.get(key)
cacheManager.set(key, value, ttl)
cacheManager.invalidate(pattern)
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Test Failures**
   ```bash
   npm run test:run -- --no-coverage
   ```

3. **GitHub Pages 404**
   - Ensure HashRouter is used
   - Check base URL in vite.config.js

## 📚 Resources

- [Project Repository](https://github.com/yusuke-kurosawa/PMPLearningManagement)
- [Live Demo](https://yusuke-kurosawa.github.io/PMPLearningManagement/)
- [PMBOK Guide](https://www.pmi.org/pmbok-guide-standards)

## 🤝 Contributing

1. Create an issue first
2. Branch from main: `feature/issue-123`
3. Follow IDD commit format
4. Ensure tests pass
5. Submit PR with issue reference

## 📄 License

MIT License - See LICENSE file for details