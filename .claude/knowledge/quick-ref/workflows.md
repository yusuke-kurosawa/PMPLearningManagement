# GitHub Actions & CI/CD Workflows Reference / ワークフロー・CI/CDリファレンス

> 🚀 **Workflow dashboard**: `npm run quickref:workflows`  
> 📊 **Pipeline metrics**: `npm run quickref:pipeline:metrics`  
> 🔄 **Trigger workflow**: `npm run quickref:workflow:run`

## 🎯 Workflow Overview

### Active Workflows

```yaml
Production Pipelines:
  deploy.yml: Main deployment pipeline
  test.yml: Comprehensive test suite
  security.yml: Security scanning

IDD Workflows:
  issue-driven-development.yml: Issue validation
  idd-compliance.yml: PR compliance checks
  idd-metrics-collector.yml: Metrics collection

Quality Gates:
  quality-check.yml: Code quality gates
  performance.yml: Performance benchmarks
  accessibility.yml: A11y testing
```

## 🚀 Deployment Pipeline

### Main Deploy Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        default: 'production'
        type: choice
        options:
          - development
          - staging
          - production

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Validate build
        run: npm run build:validate

  test:
    needs: validate
    runs-on: ubuntu-latest
    strategy:
      matrix:
        test-suite: [unit, integration, e2e]
    steps:
      - uses: actions/checkout@v4

      - name: Run ${{ matrix.test-suite }} tests
        run: npm run test:${{ matrix.test-suite }}

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build application
        run: |
          npm ci
          npm run build

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Download artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          cname: pmp-learning.com
```

### Trigger Deployment

```bash
# Manual trigger via CLI
gh workflow run deploy.yml

# With parameters
gh workflow run deploy.yml \
  -f environment=staging \
  -f skip_tests=false

# Via API
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/owner/repo/actions/workflows/deploy.yml/dispatches \
  -d '{"ref":"main","inputs":{"environment":"production"}}'
```

## 🧪 Test Workflows

### Comprehensive Test Suite

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    types: [opened, synchronize, reopened]
  schedule:
    - cron: '0 0 * * *' # Daily at midnight

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup test environment
        run: |
          npm ci
          npm run test:setup

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Check coverage threshold
        run: npm run test:coverage:check

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4

      - name: Run integration tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        run: |
          npm ci
          npx prisma migrate deploy
          npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@v4

      - name: Install Playwright
        run: npx playwright install --with-deps ${{ matrix.browser }}

      - name: Run E2E tests
        run: npm run test:e2e:${{ matrix.browser }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report-${{ matrix.browser }}
          path: playwright-report/
```

### Performance Testing

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 */6 * * *' # Every 6 hours

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            https://pmp-learning.com
            https://pmp-learning.com/dashboard
            https://pmp-learning.com/exam
          uploadArtifacts: true
          temporaryPublicStorage: true

      - name: Check performance budget
        run: |
          npm run lighthouse:check

  load-testing:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run k6 load tests
        uses: grafana/k6-action@v0.3.0
        with:
          filename: tests/load/script.js
          flags: --vus 100 --duration 30s
```

## 🔒 Security Workflows

### Security Scanning

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0' # Weekly on Sunday

jobs:
  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run npm audit
        run: |
          npm audit --audit-level=moderate
          npm audit fix --audit-level=moderate

      - name: Run Snyk scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=medium

  code-scanning:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: javascript, typescript

      - name: Autobuild
        uses: github/codeql-action/autobuild@v2

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2

  secret-scanning:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 📊 IDD (Issue-Driven Development) Workflows

### Issue Validation

```yaml
# .github/workflows/issue-driven-development.yml
name: Issue-Driven Development

on:
  push:
    branches: [main, develop, feature/*, bugfix/*]
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  validate-commits:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Check commit messages
        run: |
          # Ensure all commits reference an issue
          git log --format="%s" origin/main..HEAD | while read commit; do
            if ! echo "$commit" | grep -qE "#[0-9]+"; then
              echo "❌ Commit missing issue reference: $commit"
              exit 1
            fi
          done

      - name: Validate issue references
        run: |
          npm run idd:validate

  pr-compliance:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4

      - name: Check PR title
        run: |
          if ! echo "${{ github.event.pull_request.title }}" | grep -qE "#[0-9]+"; then
            echo "❌ PR title must reference an issue"
            exit 1
          fi

      - name: Check PR description
        run: |
          if [ -z "${{ github.event.pull_request.body }}" ]; then
            echo "❌ PR must have a description"
            exit 1
          fi

      - name: Label PR
        uses: actions/labeler@v4
        with:
          repo-token: '${{ secrets.GITHUB_TOKEN }}'
```

### Metrics Collection

```yaml
# .github/workflows/idd-metrics-collector.yml
name: IDD Metrics Collection

on:
  schedule:
    - cron: '0 0 * * *' # Daily
  workflow_dispatch:

jobs:
  collect-metrics:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Collect IDD metrics
        run: |
          npm run idd:metrics:collect

      - name: Generate report
        run: |
          npm run idd:report:generate

      - name: Upload metrics
        uses: actions/upload-artifact@v3
        with:
          name: idd-metrics-${{ github.run_id }}
          path: reports/idd-metrics.json

      - name: Update dashboard
        run: |
          npm run idd:dashboard:update
```

## 🔄 Automation Workflows

### Auto-merge Dependabot

```yaml
# .github/workflows/auto-merge.yml
name: Auto-merge Dependabot PRs

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - uses: actions/checkout@v4

      - name: Auto-merge minor updates
        uses: pascalgn/merge-action@v0.15.0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          MERGE_LABELS: 'dependencies,minor'
          MERGE_METHOD: 'squash'
          MERGE_COMMIT_MESSAGE: 'chore: update dependencies'
```

### Scheduled Maintenance

```yaml
# .github/workflows/maintenance.yml
name: Scheduled Maintenance

on:
  schedule:
    - cron: '0 2 * * 0' # Sunday 2 AM

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Clean old artifacts
        uses: c-hive/gha-remove-artifacts@v1
        with:
          age: '7 days'

      - name: Clean old workflow runs
        uses: Mattraks/delete-workflow-runs@v2
        with:
          retain_days: 30
          keep_minimum_runs: 10

      - name: Update dependencies
        run: |
          npm update
          npm audit fix
          npm run test

      - name: Create PR if changes
        uses: peter-evans/create-pull-request@v5
        with:
          title: 'chore: weekly maintenance'
          commit-message: 'chore: update dependencies and cleanup'
          branch: maintenance/weekly
```

## 📈 Workflow Optimization

### Caching Strategies

```yaml
# Optimal caching configuration
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

- name: Cache build output
  uses: actions/cache@v3
  with:
    path: dist
    key: ${{ runner.os }}-build-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-build-

- name: Cache test results
  uses: actions/cache@v3
  with:
    path: coverage
    key: ${{ runner.os }}-coverage-${{ github.sha }}
```

### Parallel Execution

```yaml
# Matrix strategy for parallel jobs
strategy:
  matrix:
    node-version: [16, 18, 20]
    os: [ubuntu-latest, windows-latest, macos-latest]
    include:
      - os: ubuntu-latest
        node-version: 18
        coverage: true
  max-parallel: 4
  fail-fast: false

steps:
  - name: Test on ${{ matrix.os }} with Node ${{ matrix.node-version }}
    run: npm test
```

### Conditional Execution

```yaml
# Skip jobs based on conditions
jobs:
  deploy:
    if: |
      github.event_name == 'push' &&
      github.ref == 'refs/heads/main' &&
      !contains(github.event.head_commit.message, '[skip ci]')
    runs-on: ubuntu-latest
    steps:
      - name: Deploy only on main branch
        run: npm run deploy
```

## 🎯 Workflow Commands

### CLI Commands

```bash
# List all workflows
gh workflow list

# View specific workflow
gh workflow view deploy.yml

# Run workflow manually
gh workflow run deploy.yml \
  --ref main \
  -f environment=production

# View workflow runs
gh run list --workflow=deploy.yml

# Watch workflow execution
gh run watch <run-id>

# Cancel workflow run
gh run cancel <run-id>

# Re-run failed jobs
gh run rerun <run-id> --failed

# Download artifacts
gh run download <run-id>
```

### API Commands

```bash
# Trigger workflow via API
curl -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/OWNER/REPO/actions/workflows/deploy.yml/dispatches \
  -d '{"ref":"main"}'

# Get workflow runs
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/repos/OWNER/REPO/actions/runs

# Get workflow run logs
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/repos/OWNER/REPO/actions/runs/RUN_ID/logs
```

## 📊 Workflow Metrics

### Success Rates

```yaml
Daily Metrics:
  Total Runs: ~50
  Success Rate: 95%
  Average Duration: 5 minutes

Weekly Metrics:
  Deployments: 10-15
  Test Runs: 200+
  Security Scans: 7

Monthly Metrics:
  Total Actions Minutes: ~3000
  Artifacts Storage: ~10GB
  Unique Contributors: 5-10
```

### Performance Benchmarks

```yaml
Job Durations (p95):
  Checkout: < 10s
  Dependencies: < 30s
  Build: < 60s
  Unit Tests: < 90s
  E2E Tests: < 5min
  Deploy: < 2min

Total Pipeline: < 10min
```

## 🚨 Workflow Troubleshooting

### Common Issues

```yaml
Issue: Workflow not triggering
Solutions:
  - Check branch protection rules
  - Verify workflow file syntax
  - Check repository settings
  - Review workflow permissions

Issue: Tests failing in CI but passing locally
Solutions:
  - Check environment variables
  - Verify Node/npm versions
  - Clear caches
  - Check timezone differences

Issue: Deployment failures
Solutions:
  - Verify secrets are set
  - Check deployment permissions
  - Review build artifacts
  - Check target environment status
```

### Debug Mode

```yaml
# Enable debug logging
env:
  ACTIONS_RUNNER_DEBUG: true
  ACTIONS_STEP_DEBUG: true
# Or via repository secrets:
# Add secrets: ACTIONS_RUNNER_DEBUG = true
```

## 🔧 Workflow Templates

### Create Custom Workflow

```yaml
# .github/workflows/custom.yml
name: Custom Workflow Template

on:
  workflow_dispatch:
    inputs:
      task:
        description: 'Task to perform'
        required: true
        type: choice
        options:
          - build
          - test
          - deploy

env:
  NODE_VERSION: '18'
  TIMEZONE: 'UTC'

jobs:
  execute:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - uses: actions/checkout@v4

      - name: Setup environment
        uses: ./.github/actions/setup
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Execute task
        run: |
          case "${{ github.event.inputs.task }}" in
            build)
              npm run build
              ;;
            test)
              npm run test
              ;;
            deploy)
              npm run deploy
              ;;
          esac

      - name: Notify completion
        if: always()
        uses: ./.github/actions/notify
        with:
          status: ${{ job.status }}
```

## 📚 Resources

### Documentation

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Action Marketplace](https://github.com/marketplace?type=actions)
- [Self-hosted Runners](https://docs.github.com/en/actions/hosting-your-own-runners)

### Best Practices

```yaml
Security:
  - Use least privilege principle
  - Rotate secrets regularly
  - Pin action versions
  - Review third-party actions

Performance:
  - Use caching effectively
  - Parallelize when possible
  - Minimize checkout depth
  - Use matrix builds wisely

Maintenance:
  - Keep workflows DRY
  - Use reusable workflows
  - Document complex logic
  - Monitor usage and costs
```

---

_Workflow documentation is auto-synced with .github/workflows/. Last update: Check with `npm run quickref:status`_
