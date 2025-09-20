# Development Environment Setup

## System Information
- **Operating System**: Linux (WSL2)
- **Platform**: linux
- **OS Version**: Linux 5.15.167.4-microsoft-standard-WSL2
- **Working Directory**: /home/kurosawa/PMPLearningManagement
- **Git Repository**: Yes (initialized)
- **Current Date**: 2025-09-20

## Node.js Environment
- **Required Node Version**: 18+ (specified in .nvmrc)
- **Package Manager**: npm v8+
- **Package Count**: 95 dependencies (0 vulnerabilities)

## Development URLs
- **Local Dev Server**: http://localhost:5173
- **Preview Server**: http://localhost:4173
- **Production URL**: https://yusuke-kurosawa.github.io/PMPLearningManagement/
- **API Docs Server**: http://localhost:8080 (when serving)

## Environment Variables
- Configuration through `.env` files
- Example template: `.env.example`
- Production config: `.env.production`

## Git Configuration
- **Current Branch**: feat/test-improvements-and-claude-workflow
- **Main Branch**: main
- **Remote**: GitHub (yusuke-kurosawa/PMPLearningManagement)
- **Deployment Branch**: gh-pages (auto-generated)

## IDE Support
- **VSCode**: Configuration in `.vscode/`
- **EditorConfig**: `.editorconfig` for consistent formatting
- **TypeScript**: Full IDE support with path aliases

## Build & Deployment
- **Build Tool**: Vite v7.1.2
- **Deployment**: GitHub Pages via gh-pages package
- **Base Path**: `/PMPLearningManagement/` (for GitHub Pages)
- **Output Directory**: `dist/`

## Testing Infrastructure
- **Unit Tests**: Vitest with React Testing Library
- **E2E Tests**: Playwright (requires browser installation)
- **Coverage Reports**: Available in coverage directory
- **Test Results**: HTML and JSON formats

## Quality Tools
- **Linter**: ESLint v8.56.0
- **Formatter**: Prettier v3.1.1
- **Type Checker**: TypeScript v5.3.3
- **Git Hooks**: Husky for pre-commit checks

## Performance Monitoring
- **Bundle Analysis**: Available via build:analyze
- **Lighthouse**: Configuration in `.lighthouserc.js`
- **Performance Budget**: Defined in `performance-budget.json`
- **Build Time**: ~53 seconds
- **Bundle Size**: ~1.3MB

## Docker Support
- **Dockerfile**: Available for containerization
- **Docker Ignore**: `.dockerignore` configured

## CI/CD
- **GitHub Actions**: Multiple workflows in `.github/workflows/`
- **Automated Deployment**: On push to main branch
- **Quality Gates**: Automated testing and linting

## Security
- **Audit Command**: `npm run security:audit`
- **No Current Vulnerabilities**: 0 security issues
- **Secrets Management**: Via GitHub Secrets and environment variables

## Quick Setup Commands
```bash
# Clone repository
git clone https://github.com/yusuke-kurosawa/PMPLearningManagement.git
cd PMPLearningManagement

# Install dependencies
npm install

# Install Playwright browsers (for E2E tests)
npx playwright install

# Setup IDD hooks
npm run idd:setup
npm run idd:hooks:install

# Start development
npm run dev
```

## Troubleshooting
- If node_modules issues: `npm run clean:all && npm install`
- For Playwright issues: `npx playwright install --with-deps`
- For build issues: Check Node.js version (must be 18+)
- For deployment issues: Ensure on main branch

## Resource Locations
- **Documentation**: `/docs/` directory
- **Scripts**: `/scripts/` directory
- **Test Files**: `/src/**/*.test.ts`, `/e2e/tests/`
- **Static Assets**: `/public/` directory
- **Type Definitions**: `/src/types/` directory