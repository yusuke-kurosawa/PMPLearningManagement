# Scripts Directory

Automation and maintenance scripts for the project.

## Directory Structure

```
scripts/
└── maintenance/        # Maintenance and monitoring scripts
    └── health-check.sh     # Application health check script
```

## Scripts

### Maintenance Scripts

#### health-check.sh

- **Purpose**: Monitors application health and availability
- **Usage**: `npm run health-check` or `./scripts/maintenance/health-check.sh`
- **Features**:
  - Checks application endpoint availability
  - Verifies key functionality
  - Reports system status

## Deployment Scripts

Deployment scripts have been moved to `config/deploy/` for better organization alongside other configuration files.

## Usage Guidelines

- All scripts should be executable (`chmod +x`)
- Include error handling and logging
- Document script parameters and options
- Test scripts in development before production use
- Follow consistent naming conventions
