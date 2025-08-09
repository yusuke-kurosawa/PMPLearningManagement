# Project Directory Structure Guide

This document provides an overview of the organized directory structure for the PMP Learning Management System.

## Root Directory Structure

```
PMPLearningManagement/
├── config/                 # All configuration files
│   ├── build/             # Build tool configurations (Vite, Vitest, Playwright, etc.)
│   ├── deploy/            # Deployment scripts and configurations
│   ├── environment/       # Environment-specific variables (.env files)
│   └── monitoring/        # Monitoring and observability configs
├── data/                  # Project data and documentation
│   ├── input/            # Source materials (PMBOK PDFs, references)
│   └── output/           # Generated or processed data
├── docs/                  # Comprehensive project documentation
│   ├── api/              # API and technical documentation
│   ├── architecture/     # System architecture docs
│   ├── guides/           # User and developer guides
│   ├── security/         # Security documentation
│   ├── testing/          # Testing documentation
│   └── tutorials/        # Step-by-step tutorials
├── e2e/                   # End-to-end testing with Playwright
│   ├── fixtures/         # Test data and fixtures
│   ├── tests/            # E2E test specifications
│   └── utils/            # Testing utilities
├── public/                # Static assets (icons, manifest, etc.)
├── scripts/               # Automation and maintenance scripts
│   └── maintenance/      # Health checks and monitoring scripts
├── src/                   # Main React application source
│   ├── components/       # React components by domain
│   ├── contexts/         # React contexts for state management
│   ├── data/             # Data schemas, fixtures, and mocks
│   ├── hooks/            # Custom React hooks
│   ├── services/         # Business logic and API services
│   ├── styles/           # Organized CSS and styling
│   ├── test/             # Test utilities and configuration
│   └── utils/            # General utility functions
├── dist/                  # Build output (generated)
├── node_modules/          # Dependencies (generated)
├── playwright-report/     # Test reports (generated)
├── test-results/          # Test artifacts (generated)
└── [config files]        # Root-level config files (package.json, etc.)
```

## Key Organizational Principles

### 1. **Separation of Concerns**
- Configuration files are centralized in `config/`
- Documentation is organized by type in `docs/`
- Source code is structured by functional domain in `src/`
- Testing is separated by type (unit in `src/`, E2E in `e2e/`)

### 2. **Domain-Driven Component Organization**
Components in `src/components/` are organized by functional domain:
- **layout**: Navigation and page structure
- **pages**: Main page components
- **visualizations**: Data visualization components
- **learning**: Educational features
- **collaboration**: Team collaboration features
- **shared**: Reusable cross-domain components

### 3. **Data Management**
- Application data schemas in `src/data/schemas/`
- Test fixtures and mocks separated by purpose
- External data sources organized in `data/input/`
- Generated data in `data/output/`

### 4. **Configuration Management**
- Build configurations in `config/build/`
- Environment variables in `config/environment/`
- Deployment configurations in `config/deploy/`
- Monitoring configurations in `config/monitoring/`

## Import Patterns

### Component Imports
```javascript
// Use barrel exports for clean imports
import { Navigation, PageTransition } from 'components/layout';
import { FlashCard, MockExam } from 'components/learning';
import { EnhancedNetworkGraph } from 'components/visualizations';
```

### Data Imports
```javascript
// Import from organized data schemas
import { pmbok7Data, processData } from 'data/schemas/pmbok';
import { pmpGlossary } from 'data/schemas/glossary';
import { examQuestions } from 'data/fixtures';
```

### Style Imports
```javascript
// Main stylesheet automatically imports organized CSS
import '../styles/index.css'; // Imports all organized stylesheets
```

## Configuration Usage

### Build Commands
All npm scripts reference the new configuration paths:
```bash
npm run dev          # Uses config/build/vite.config.js
npm run test         # Uses config/build/vitest.config.js
npm run test:e2e     # Uses config/build/playwright.config.js
npm run deploy       # Uses config/deploy/deploy.sh
```

### Environment Variables
Environment-specific configurations:
- `config/environment/.env.local` - Local development
- `config/environment/.env.staging` - Staging environment
- `config/environment/.env.production` - Production builds

## Benefits of This Organization

### 1. **Developer Experience**
- Clear separation of concerns
- Easy to find relevant files
- Consistent import patterns
- Self-documenting structure

### 2. **Maintainability**
- Related files are co-located
- Clear ownership and responsibility
- Easy to refactor and update
- Scalable architecture

### 3. **Team Collaboration**
- Domain experts can focus on their areas
- Reduced merge conflicts
- Clear contribution guidelines
- Onboarding-friendly structure

### 4. **Build and Deploy**
- Centralized configuration management
- Environment-specific settings
- Clear deployment processes
- Monitoring and observability

## Migration Notes

When updating imports due to this reorganization:

1. **Component imports**: Update to use barrel exports from domain directories
2. **Data imports**: Update paths to new schema organization
3. **Config references**: Scripts automatically updated to use new paths
4. **Documentation**: All docs include their new locations and purposes

## Getting Started

1. **New developers**: Start by reading the README files in each directory
2. **Contributing**: Follow the domain-based organization patterns
3. **Testing**: Use both unit tests in `src/` and E2E tests in `e2e/`
4. **Configuration**: Environment-specific settings are in `config/environment/`

This organized structure supports the project's growth from a simple learning tool to a comprehensive PMP learning management system with mobile apps, collaboration features, and enterprise capabilities.