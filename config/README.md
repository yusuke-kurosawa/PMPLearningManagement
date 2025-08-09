# Configuration Directory

This directory contains all build, deployment, and environment configuration files.

## Directory Structure

```
config/
├── build/              # Build tool configurations
│   ├── vite.config.js      # Vite build configuration
│   ├── vitest.config.js    # Vitest testing configuration  
│   ├── playwright.config.js # Playwright E2E testing
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── postcss.config.js   # PostCSS processing
├── deploy/             # Deployment scripts and configs
│   └── deploy.sh           # Deployment automation script
├── environment/        # Environment-specific configs
│   ├── .env.local          # Local development
│   ├── .env.staging        # Staging environment
│   └── .env.production     # Production environment
└── monitoring/         # Monitoring and observability
    ├── dashboards.yml      # Monitoring dashboards
    ├── error-tracking.yml  # Error tracking config
    ├── performance-budgets.yml # Performance budgets
    └── uptime-config.yml   # Uptime monitoring
```

## Usage

All npm scripts reference these configuration files with relative paths:
- `npm run dev` uses `config/build/vite.config.js`
- `npm run test` uses `config/build/vitest.config.js`
- `npm run deploy:production` uses `config/deploy/deploy.sh`

## Environment Variables

Environment-specific variables are stored in `config/environment/`:
- Use `.env.local` for local development
- `.env.staging` for staging deployments
- `.env.production` for production builds