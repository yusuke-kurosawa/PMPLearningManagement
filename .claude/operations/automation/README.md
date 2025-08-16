# Automation Framework

## Overview

The automation directory contains all development automation tools, scripts, and configurations designed to streamline workflows, enforce standards, and improve developer productivity. Our automation framework follows the principle of "automate everything that can be automated."

## Directory Structure

```
automation/
├── hooks/              # Git hooks for workflow enforcement
│   ├── pre-commit      # Code quality checks
│   ├── commit-msg      # Message format validation
│   ├── pre-push        # Comprehensive validation
│   └── install.sh      # Hook installation script
├── scripts/            # Automation scripts
│   ├── daily/          # Daily automated tasks
│   ├── weekly/         # Weekly maintenance tasks
│   └── adhoc/          # On-demand scripts
├── cron/               # Scheduled job configurations
│   ├── crontab         # Cron schedule definitions
│   └── jobs/           # Cron job scripts
└── workflows/          # Automation workflows
    ├── templates/      # Workflow templates
    └── custom/         # Custom automation flows
```

## Git Hooks Configuration

### Pre-commit Hook

```bash
#!/bin/bash
# automation/hooks/pre-commit

# Purpose: Enforce code quality before commit

echo "Running pre-commit checks..."

# 1. ESLint check
npm run lint || {
    echo "ESLint check failed. Please fix linting errors."
    exit 1
}

# 2. Prettier format check
npm run format:check || {
    echo "Formatting issues found. Run 'npm run format' to fix."
    exit 1
}

# 3. TypeScript type check
npm run type-check || {
    echo "TypeScript type errors found."
    exit 1
}

# 4. Unit tests (fast subset)
npm run test:unit:fast || {
    echo "Unit tests failed."
    exit 1
}

# 5. File size check
find . -type f -size +1M | grep -v node_modules | grep -v .git | while read file; do
    echo "Warning: Large file detected: $file"
done

echo "Pre-commit checks passed!"
```

### Commit-msg Hook

```bash
#!/bin/bash
# automation/hooks/commit-msg

# Purpose: Validate commit message format and IDD compliance

commit_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .+ #[0-9]+$'
commit_msg=$(cat $1)

if ! echo "$commit_msg" | grep -qE "$commit_regex"; then
    echo "Invalid commit message format!"
    echo ""
    echo "Format: <type>(<scope>): <subject> #<issue>"
    echo ""
    echo "Types: feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert"
    echo ""
    echo "Example: feat(auth): add OAuth2 support #123"
    echo ""
    exit 1
fi

# Check for issue number
if ! echo "$commit_msg" | grep -qE '#[0-9]+'; then
    echo "Commit message must reference an issue number!"
    exit 1
fi

echo "Commit message validation passed!"
```

### Pre-push Hook

```bash
#!/bin/bash
# automation/hooks/pre-push

# Purpose: Final validation before pushing to remote

echo "Running pre-push validation..."

# 1. Full test suite
npm run test || {
    echo "Tests failed. Push aborted."
    exit 1
}

# 2. Build verification
npm run build || {
    echo "Build failed. Push aborted."
    exit 1
}

# 3. Security scan
npm audit --audit-level=high || {
    echo "Security vulnerabilities found. Please fix before pushing."
    exit 1
}

# 4. Branch protection check
current_branch=$(git symbolic-ref HEAD | sed 's!refs/heads/!!')
protected_branches="main master production"

if echo "$protected_branches" | grep -w "$current_branch" > /dev/null; then
    read -p "You're pushing to protected branch '$current_branch'. Continue? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "Pre-push validation complete!"
```

## Automation Scripts

### Daily Tasks

#### 1. Dependency Update Check

```bash
#!/bin/bash
# automation/scripts/daily/check-dependencies.sh

echo "Checking for dependency updates..."

# Check for outdated packages
outdated=$(npm outdated --json)

if [ ! -z "$outdated" ]; then
    echo "Outdated dependencies found:"
    npm outdated

    # Create issue if critical updates exist
    if echo "$outdated" | grep -q "CRITICAL"; then
        gh issue create \
            --title "Critical dependency updates available" \
            --body "$(npm outdated)" \
            --label "dependencies,security"
    fi
fi

# Security audit
npm audit --json > audit-report.json
critical_vulns=$(cat audit-report.json | jq '.metadata.vulnerabilities.critical')

if [ "$critical_vulns" -gt 0 ]; then
    echo "Critical vulnerabilities found!"
    npm audit

    # Create security issue
    gh issue create \
        --title "Critical security vulnerabilities detected" \
        --body "$(npm audit)" \
        --label "security,critical"
fi
```

#### 2. Code Quality Report

```bash
#!/bin/bash
# automation/scripts/daily/quality-report.sh

echo "Generating daily code quality report..."

# Run ESLint
npm run lint -- --format json > reports/eslint-report.json

# Run tests with coverage
npm run test:coverage

# Check code complexity
npx complexity-report src/ --format json > reports/complexity-report.json

# Generate consolidated report
node scripts/generate-quality-report.js

# Send to dashboard
curl -X POST https://metrics.internal/quality \
    -H "Content-Type: application/json" \
    -d @reports/quality-report.json

echo "Quality report generated and sent"
```

### Weekly Tasks

#### 1. Performance Baseline

```bash
#!/bin/bash
# automation/scripts/weekly/performance-baseline.sh

echo "Running weekly performance baseline..."

# Build production bundle
npm run build:production

# Analyze bundle size
npx webpack-bundle-analyzer dist/stats.json -m json > reports/bundle-analysis.json

# Run Lighthouse CI
npx lhci autorun --collect.url=http://localhost:3000 \
    --upload.target=filesystem \
    --upload.outputDir=./reports/lighthouse

# Performance benchmarks
npm run benchmark > reports/benchmark-results.txt

# Compare with previous week
node scripts/compare-performance.js

echo "Performance baseline complete"
```

#### 2. Documentation Update

```bash
#!/bin/bash
# automation/scripts/weekly/update-docs.sh

echo "Updating documentation..."

# Generate API documentation
npx typedoc --out docs/api src/

# Update dependency graph
npx madge --image docs/images/dependency-graph.svg src/

# Generate changelog
npx conventional-changelog -p angular -i CHANGELOG.md -s

# Update README badges
node scripts/update-badges.js

# Check for broken links
npx linkinator docs/ --recurse

echo "Documentation updated"
```

### Ad-hoc Scripts

#### 1. Project Setup

```bash
#!/bin/bash
# automation/scripts/adhoc/setup-project.sh

echo "Setting up project environment..."

# Install dependencies
npm ci

# Setup Git hooks
npm run hooks:install

# Create .env from template
if [ ! -f .env ]; then
    cp .env.template .env
    echo "Created .env file. Please update with your values."
fi

# Initialize database
npm run db:init

# Seed test data
npm run db:seed

# Build project
npm run build

# Run initial tests
npm test

echo "Project setup complete!"
```

#### 2. Clean Environment

```bash
#!/bin/bash
# automation/scripts/adhoc/clean-env.sh

echo "Cleaning development environment..."

# Remove node_modules
rm -rf node_modules

# Clear npm cache
npm cache clean --force

# Remove build artifacts
rm -rf dist/ build/ .next/ out/

# Clear test coverage
rm -rf coverage/ .nyc_output/

# Remove temporary files
find . -name "*.log" -type f -delete
find . -name ".DS_Store" -type f -delete
find . -name "Thumbs.db" -type f -delete

# Reset git
git clean -fdx -e .env -e .env.local

echo "Environment cleaned"
```

## Cron Job Configuration

### Crontab Configuration

```bash
# automation/cron/crontab

# Daily at 2 AM - Dependency check
0 2 * * * /path/to/project/automation/scripts/daily/check-dependencies.sh

# Daily at 3 AM - Quality report
0 3 * * * /path/to/project/automation/scripts/daily/quality-report.sh

# Daily at 4 AM - Backup
0 4 * * * /path/to/project/automation/scripts/daily/backup.sh

# Weekly on Sunday at 1 AM - Performance baseline
0 1 * * 0 /path/to/project/automation/scripts/weekly/performance-baseline.sh

# Weekly on Sunday at 2 AM - Documentation update
0 2 * * 0 /path/to/project/automation/scripts/weekly/update-docs.sh

# Monthly on 1st at 1 AM - Dependency update
0 1 1 * * /path/to/project/automation/scripts/monthly/update-dependencies.sh
```

## Workflow Templates

### Feature Development Workflow

```yaml
# automation/workflows/templates/feature-development.yml

name: Feature Development Workflow
description: Automated workflow for feature development

steps:
  - name: Create feature branch
    run: git checkout -b feature/$ISSUE_NUMBER-$FEATURE_NAME

  - name: Setup development environment
    run: npm run dev:setup

  - name: Run tests in watch mode
    run: npm run test:watch

  - name: Enable hot reload
    run: npm run dev

  - name: Pre-commit validation
    hooks:
      - pre-commit
      - commit-msg

  - name: Create pull request
    run: gh pr create --draft --title "$FEATURE_NAME" --body "Fixes #$ISSUE_NUMBER"

  - name: Run CI pipeline
    trigger: github-actions/feature-pipeline

  - name: Request review
    run: gh pr ready && gh pr review --request @team/reviewers
```

### Bug Fix Workflow

```yaml
# automation/workflows/templates/bug-fix.yml

name: Bug Fix Workflow
description: Automated workflow for bug fixes

steps:
  - name: Create fix branch
    run: git checkout -b fix/$ISSUE_NUMBER-$BUG_DESCRIPTION

  - name: Reproduce bug
    run: npm run test:reproduce -- --issue $ISSUE_NUMBER

  - name: Write failing test
    template: test-template.js

  - name: Implement fix
    validate: npm test -- --grep "$BUG_DESCRIPTION"

  - name: Verify fix
    run: npm run test:all

  - name: Update changelog
    run: npm run changelog:add -- --type fix --issue $ISSUE_NUMBER

  - name: Create pull request
    run: gh pr create --title "fix: $BUG_DESCRIPTION #$ISSUE_NUMBER"
```

## Installation & Setup

### Installing Git Hooks

```bash
#!/bin/bash
# automation/hooks/install.sh

echo "Installing Git Hooks..."

HOOKS_DIR=".git/hooks"
SOURCE_DIR=".claude/operations/automation/hooks"

# Check if in git repository
if [ ! -d ".git" ]; then
    echo "Error: Not a git repository"
    exit 1
fi

# Install each hook
for hook in pre-commit commit-msg pre-push post-merge; do
    if [ -f "$SOURCE_DIR/$hook" ]; then
        echo "Installing $hook hook..."
        cp "$SOURCE_DIR/$hook" "$HOOKS_DIR/$hook"
        chmod +x "$HOOKS_DIR/$hook"
        echo "  ✓ $hook installed"
    fi
done

# Install husky for better hook management (optional)
if [ -f "package.json" ]; then
    npm install --save-dev husky
    npx husky install
    npx husky add .husky/pre-commit "npm run pre-commit"
    npx husky add .husky/commit-msg 'npx commitlint --edit $1'
    echo "  ✓ Husky installed"
fi

echo "Git hooks installation complete!"
```

## Best Practices

### 1. Script Design

- **Idempotent**: Scripts should be safe to run multiple times
- **Error handling**: Always check return codes
- **Logging**: Provide clear output and logging
- **Documentation**: Include usage examples and parameters
- **Testing**: Test scripts in isolated environments

### 2. Automation Strategy

```yaml
Automation Levels:
  Level 1: Manual with documentation
  Level 2: Semi-automated with scripts
  Level 3: Fully automated with triggers
  Level 4: Self-healing automation
  Level 5: AI-driven automation

Current Level: 3
Target Level: 4
```

### 3. Performance Considerations

- **Parallel execution**: Run independent tasks concurrently
- **Caching**: Cache results when appropriate
- **Incremental processing**: Process only changed files
- **Resource limits**: Set timeouts and memory limits
- **Monitoring**: Track automation performance

## Monitoring & Metrics

### Automation Metrics

```yaml
Efficiency Metrics:
  - Automation Coverage: 85%
  - Manual Task Reduction: 70%
  - Error Rate: < 2%
  - Average Execution Time: < 5 minutes

Quality Metrics:
  - Pre-commit Catch Rate: 95%
  - Build Success Rate: 98%
  - Test Pass Rate: 99%
  - Code Quality Score: A
```

### Dashboard Integration

```javascript
// automation/scripts/metrics/collect.js

const metrics = {
  automationRuns: 0,
  successRate: 0,
  timesSaved: 0,
  errorsPrevent: 0,

  collect: async function () {
    // Collect from various sources
    this.automationRuns = await getRunCount()
    this.successRate = await getSuccessRate()
    this.timesSaved = await calculateTimeSaved()
    this.errorsPrevent = await getPreventedErrors()

    // Send to monitoring
    await sendToMonitoring(this)
  },
}
```

## Troubleshooting

### Common Issues

#### 1. Hook Not Executing

```bash
# Check hook permissions
ls -la .git/hooks/

# Make executable
chmod +x .git/hooks/pre-commit

# Test hook directly
./.git/hooks/pre-commit
```

#### 2. Script Failures

```bash
# Run with debug mode
bash -x automation/scripts/daily/check-dependencies.sh

# Check environment variables
env | grep -E "NODE|NPM|PATH"

# Verify dependencies
which node npm git
```

#### 3. Cron Job Not Running

```bash
# Check cron service
systemctl status cron

# View cron logs
grep CRON /var/log/syslog

# Test cron expression
crontab -l
```

## Integration with CI/CD

### GitHub Actions Integration

```yaml
name: Automation Trigger
on:
  schedule:
    - cron: '0 */6 * * *' # Every 6 hours
  workflow_dispatch:

jobs:
  run-automation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: ./automation/scripts/daily/check-dependencies.sh
      - run: ./automation/scripts/daily/quality-report.sh
```

## Future Enhancements

### Short Term (1-3 months)

- [ ] AI-powered code review automation
- [ ] Intelligent test selection based on changes
- [ ] Auto-fix for common issues
- [ ] Performance regression detection

### Medium Term (3-6 months)

- [ ] Self-healing scripts
- [ ] Predictive maintenance
- [ ] Automated documentation generation
- [ ] Custom DSL for automation workflows

### Long Term (6-12 months)

- [ ] ML-based automation optimization
- [ ] Natural language automation commands
- [ ] Autonomous incident response
- [ ] Full AIOps integration

## References

- [Git Hooks Documentation](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
- [Automation Best Practices](https://www.redhat.com/en/topics/automation/whats-it-automation)
- [Cron Expression Guide](https://crontab.guru/)
- [Shell Scripting Guide](https://www.shellscript.sh/)

---

**Last Updated**: 2025-08-15  
**Version**: 2.0.0  
**Owner**: DevOps Team
