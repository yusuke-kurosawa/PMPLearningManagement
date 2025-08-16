# GitHub Actions Workflow Standards & Rules

## 📋 Overview

This document defines comprehensive GitHub Actions workflow standards, naming conventions, best practices, and enforcement mechanisms for the PMPLearningManagement project.

## 🎯 Workflow Standards

### Maturity Level Requirements

- **Level 4**: 80% automation, standardized workflows
- **Level 5**: 95% automation, self-healing workflows
- **Current Target**: Level 5 (95% automation)

### Performance Requirements

- **Workflow Execution**: < 15 minutes average
- **Parallel Job Limit**: 20 concurrent jobs
- **Cache Hit Rate**: > 80%
- **Failure Recovery**: < 5 minutes

## 📁 Workflow Organization

### Directory Structure

```
.github/
├── workflows/
│   ├── 01-core/           # Core CI/CD workflows
│   │   ├── ci-cd.yml
│   │   ├── quality-gates.yml
│   │   └── deployment.yml
│   ├── 02-security/        # Security workflows
│   │   ├── dependency-scan.yml
│   │   ├── code-scan.yml
│   │   └── secrets-scan.yml
│   ├── 03-testing/         # Testing workflows
│   │   ├── unit-tests.yml
│   │   ├── integration-tests.yml
│   │   └── e2e-tests.yml
│   ├── 04-monitoring/      # Monitoring workflows
│   │   ├── metrics-collector.yml
│   │   ├── performance-check.yml
│   │   └── health-check.yml
│   ├── 05-automation/      # Automation workflows
│   │   ├── auto-merge.yml
│   │   ├── auto-release.yml
│   │   └── auto-update.yml
│   └── reusable/          # Reusable workflows
│       ├── _build.yml
│       ├── _test.yml
│       └── _deploy.yml
├── actions/               # Custom actions
│   ├── setup-environment/
│   ├── cache-dependencies/
│   └── notify-status/
└── scripts/              # Support scripts
    ├── workflow-validator.js
    ├── metrics-collector.js
    └── failure-analyzer.js
```

## 🏷️ Naming Conventions

### Workflow File Naming

```yaml
# Pattern: <priority>-<category>-<function>.yml
# Examples:
01-core-ci-cd.yml
02-security-dependency-scan.yml
03-testing-unit-tests.yml
04-monitoring-metrics.yml
05-automation-auto-merge.yml
```

### Workflow Name Format

```yaml
# Pattern: [Emoji] [Category] - [Description]
name: 🚀 Core - CI/CD Pipeline
name: 🔒 Security - Dependency Scan
name: 🧪 Testing - Unit Tests
name: 📊 Monitoring - Metrics Collection
name: 🤖 Automation - Auto Merge
```

### Job Naming

```yaml
jobs:
  setup:
    name: 🏗️ Environment Setup

  quality-checks:
    name: 🔍 Quality Checks

  security-scan:
    name: 🔒 Security Analysis

  test-suite:
    name: 🧪 Test Execution

  build-artifacts:
    name: 📦 Build & Package

  deploy-production:
    name: 🚀 Deploy to Production
```

## 📝 Workflow Structure

### Standard Workflow Template

```yaml
# ================================================================
# Workflow: [Name]
# Category: [Category]
# Purpose: [Description]
# Triggers: [push, pull_request, schedule, workflow_dispatch]
# Dependencies: [List of dependent workflows]
# SLA: [Execution time target]
# Owner: [Team/Person]
# Created: [Date]
# Modified: [Date]
# Issue: #[Issue Number]
# ================================================================

name: 🚀 [Category] - [Name]

# ----------------------------------------------------------------
# Triggers
# ----------------------------------------------------------------
on:
  push:
    branches: [main, develop]
    paths:
      - 'src/**'
      - 'package.json'
      - '.github/workflows/**'

  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]
    branches: [main, develop]

  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM UTC

  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - development
          - staging
          - production

      debug_mode:
        description: 'Enable debug logging'
        required: false
        default: false
        type: boolean

# ----------------------------------------------------------------
# Permissions
# ----------------------------------------------------------------
permissions:
  contents: read
  pull-requests: write
  issues: write
  actions: read
  checks: write
  packages: write
  deployments: write

# ----------------------------------------------------------------
# Environment Variables
# ----------------------------------------------------------------
env:
  NODE_VERSION: '18'
  CACHE_VERSION: v1
  ARTIFACT_RETENTION: 7
  MAX_PARALLEL: 5
  TIMEOUT_MINUTES: 30

# ----------------------------------------------------------------
# Jobs
# ----------------------------------------------------------------
jobs:
  # ==============================================================
  # Job: Setup & Validation
  # Purpose: Initialize environment and validate inputs
  # ==============================================================
  setup:
    name: 🏗️ Setup & Validation
    runs-on: ubuntu-latest
    timeout-minutes: 5
    outputs:
      cache-hit: ${{ steps.cache.outputs.cache-hit }}
      environment: ${{ steps.validate.outputs.environment }}
      version: ${{ steps.version.outputs.version }}

    steps:
      # ----------------------------------------------------------
      # Checkout repository
      # ----------------------------------------------------------
      - name: 📥 Checkout Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          lfs: true

      # ----------------------------------------------------------
      # Validate workflow inputs
      # ----------------------------------------------------------
      - name: ✅ Validate Inputs
        id: validate
        run: |
          echo "environment=${{ github.event.inputs.environment || 'staging' }}" >> $GITHUB_OUTPUT
          echo "debug=${{ github.event.inputs.debug_mode || 'false' }}" >> $GITHUB_OUTPUT

      # ----------------------------------------------------------
      # Setup Node.js with caching
      # ----------------------------------------------------------
      - name: 🏗️ Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      # ----------------------------------------------------------
      # Cache dependencies
      # ----------------------------------------------------------
      - name: 📦 Cache Dependencies
        id: cache
        uses: actions/cache@v3
        with:
          path: |
            node_modules
            ~/.npm
            ~/.cache
          key: ${{ runner.os }}-node-${{ env.CACHE_VERSION }}-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-${{ env.CACHE_VERSION }}-
            ${{ runner.os }}-node-

      # ----------------------------------------------------------
      # Install dependencies
      # ----------------------------------------------------------
      - name: 📦 Install Dependencies
        if: steps.cache.outputs.cache-hit != 'true'
        run: |
          npm ci --prefer-offline --no-audit --no-fund
          npm ls --depth=0

      # ----------------------------------------------------------
      # Extract version information
      # ----------------------------------------------------------
      - name: 🏷️ Extract Version
        id: version
        run: |
          VERSION=$(node -p "require('./package.json').version")
          echo "version=$VERSION" >> $GITHUB_OUTPUT
          echo "📌 Version: $VERSION"

  # ==============================================================
  # Job: Quality Checks
  # Purpose: Run linting, type checking, and code quality checks
  # ==============================================================
  quality:
    name: 🔍 Quality Checks
    needs: setup
    runs-on: ubuntu-latest
    timeout-minutes: 10
    strategy:
      fail-fast: false
      matrix:
        check: [eslint, typescript, prettier, security]

    steps:
      - uses: actions/checkout@v4

      - name: 🏗️ Setup Environment
        uses: ./.github/actions/setup-environment
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache-key: ${{ needs.setup.outputs.cache-hit }}

      - name: 🔍 Run ${{ matrix.check }}
        run: |
          case "${{ matrix.check }}" in
            eslint)
              npm run lint -- --max-warnings=50
              ;;
            typescript)
              npm run type-check
              ;;
            prettier)
              npm run format:check
              ;;
            security)
              npm audit --audit-level=high
              ;;
          esac

      - name: 📊 Upload Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: quality-${{ matrix.check }}
          path: reports/${{ matrix.check }}-report.json
          retention-days: ${{ env.ARTIFACT_RETENTION }}

  # ==============================================================
  # Job: Testing
  # Purpose: Execute test suites
  # ==============================================================
  test:
    name: 🧪 Testing
    needs: setup
    runs-on: ubuntu-latest
    timeout-minutes: 20
    strategy:
      fail-fast: false
      matrix:
        suite: [unit, integration, e2e]

    steps:
      - uses: actions/checkout@v4

      - name: 🏗️ Setup Environment
        uses: ./.github/actions/setup-environment
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: 🧪 Run ${{ matrix.suite }} Tests
        run: |
          npm run test:${{ matrix.suite }} -- --coverage

      - name: 📊 Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: coverage/coverage-${{ matrix.suite }}.json
          flags: ${{ matrix.suite }}
          name: ${{ matrix.suite }}-coverage

  # ==============================================================
  # Job: Build
  # Purpose: Build application artifacts
  # ==============================================================
  build:
    name: 📦 Build Artifacts
    needs: [quality, test]
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - uses: actions/checkout@v4

      - name: 🏗️ Setup Environment
        uses: ./.github/actions/setup-environment

      - name: 🔨 Build Application
        run: |
          npm run build
          npm run build:stats

      - name: 📊 Analyze Bundle
        run: |
          npm run analyze:bundle

      - name: 📤 Upload Artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: |
            dist/
            reports/bundle-stats.json
          retention-days: ${{ env.ARTIFACT_RETENTION }}

  # ==============================================================
  # Job: Deploy
  # Purpose: Deploy to target environment
  # ==============================================================
  deploy:
    name: 🚀 Deploy
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    timeout-minutes: 10
    environment:
      name: ${{ needs.setup.outputs.environment }}
      url: ${{ steps.deploy.outputs.url }}

    steps:
      - uses: actions/checkout@v4

      - name: 📥 Download Artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts
          path: dist/

      - name: 🚀 Deploy to Environment
        id: deploy
        run: |
          # Deployment logic here
          echo "url=https://example.com" >> $GITHUB_OUTPUT

      - name: 🔍 Verify Deployment
        run: |
          curl -f ${{ steps.deploy.outputs.url }}/health

  # ==============================================================
  # Job: Notification
  # Purpose: Send status notifications
  # ==============================================================
  notify:
    name: 📢 Notification
    needs: [setup, quality, test, build, deploy]
    if: always()
    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:
      - name: 📊 Collect Metrics
        run: |
          echo "Workflow: ${{ github.workflow }}"
          echo "Status: ${{ job.status }}"
          echo "Duration: ${{ github.run_number }}"

      - name: 📢 Send Notification
        uses: ./.github/actions/notify-status
        with:
          status: ${{ job.status }}
          webhook: ${{ secrets.NOTIFICATION_WEBHOOK }}
```

## 🔧 Reusable Workflows

### Reusable Workflow Definition

```yaml
# .github/workflows/reusable/_build.yml
name: Reusable Build Workflow

on:
  workflow_call:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        type: string
      node-version:
        description: 'Node.js version'
        required: false
        type: string
        default: '18'
    outputs:
      artifact-url:
        description: 'Build artifact URL'
        value: ${{ jobs.build.outputs.url }}
    secrets:
      npm-token:
        description: 'NPM authentication token'
        required: false

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      url: ${{ steps.upload.outputs.url }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}

      - name: Build
        run: npm run build
        env:
          ENVIRONMENT: ${{ inputs.environment }}

      - name: Upload
        id: upload
        run: echo "url=https://artifacts.example.com/build" >> $GITHUB_OUTPUT
```

### Using Reusable Workflows

```yaml
jobs:
  build-staging:
    uses: ./.github/workflows/reusable/_build.yml
    with:
      environment: staging
      node-version: '18'
    secrets:
      npm-token: ${{ secrets.NPM_TOKEN }}

  build-production:
    uses: ./.github/workflows/reusable/_build.yml
    with:
      environment: production
    secrets: inherit
```

## 🎯 Performance Optimization

### Parallel Execution Strategy

```yaml
jobs:
  tests:
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [16, 18, 20]
        test-suite: [unit, integration, e2e]
        exclude:
          - os: windows-latest
            test-suite: e2e
          - os: macos-latest
            node: 16

    runs-on: ${{ matrix.os }}

    steps:
      - name: Run Tests
        run: npm run test:${{ matrix.test-suite }}
```

### Caching Strategy

```yaml
- name: Advanced Caching
  uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      ~/.cache
      node_modules
      .next/cache
    key: ${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-
      ${{ runner.os }}-
```

### Conditional Execution

```yaml
jobs:
  deploy:
    if: |
      github.event_name == 'push' &&
      github.ref == 'refs/heads/main' &&
      contains(github.event.head_commit.message, '[deploy]')
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        run: ./deploy.sh
```

## 🔒 Security Standards

### Secrets Management

```yaml
# NEVER hardcode secrets
# ❌ Bad
- run: |
    API_KEY=sk-1234567890abcdef
    curl -H "Authorization: $API_KEY" https://api.example.com

# ✅ Good
- run: |
    curl -H "Authorization: ${{ secrets.API_KEY }}" https://api.example.com
```

### OIDC Authentication

```yaml
permissions:
  id-token: write
  contents: read

steps:
  - name: Configure AWS Credentials
    uses: aws-actions/configure-aws-credentials@v2
    with:
      role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
      aws-region: us-east-1
```

### Security Scanning

```yaml
- name: 🔒 Security Scan
  uses: github/super-linter@v5
  env:
    DEFAULT_BRANCH: main
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    VALIDATE_ALL_CODEBASE: false
    VALIDATE_JAVASCRIPT_ES: true
    VALIDATE_TYPESCRIPT_ES: true
```

## 📊 Monitoring & Metrics

### Workflow Metrics Collection

```yaml
- name: 📊 Collect Metrics
  if: always()
  run: |
    cat >> metrics.json << EOF
    {
      "workflow": "${{ github.workflow }}",
      "run_id": "${{ github.run_id }}",
      "run_number": "${{ github.run_number }}",
      "status": "${{ job.status }}",
      "started_at": "${{ github.event.head_commit.timestamp }}",
      "completed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
      "duration_seconds": $(($(date +%s) - $(date -d "${{ github.event.head_commit.timestamp }}" +%s))),
      "trigger": "${{ github.event_name }}",
      "actor": "${{ github.actor }}",
      "branch": "${{ github.ref_name }}",
      "commit": "${{ github.sha }}"
    }
    EOF

    # Send to monitoring service
    curl -X POST https://metrics.example.com/api/workflows \
      -H "Content-Type: application/json" \
      -d @metrics.json
```

### Custom Metrics Action

```yaml
# .github/actions/collect-metrics/action.yml
name: Collect Workflow Metrics
description: Collects and reports workflow execution metrics

inputs:
  metrics-endpoint:
    description: 'Metrics collection endpoint'
    required: true
  api-key:
    description: 'API key for metrics service'
    required: true

runs:
  using: composite
  steps:
    - name: Collect Metrics
      shell: bash
      run: |
        # Collect various metrics
        DURATION=$(($(date +%s) - ${{ github.run_started_at }}))
        CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}')
        MEMORY_USAGE=$(free -m | awk 'NR==2{printf "%.2f", $3*100/$2}')

        # Send metrics
        curl -X POST ${{ inputs.metrics-endpoint }} \
          -H "Authorization: Bearer ${{ inputs.api-key }}" \
          -H "Content-Type: application/json" \
          -d '{
            "workflow": "${{ github.workflow }}",
            "duration": "'$DURATION'",
            "cpu_usage": "'$CPU_USAGE'",
            "memory_usage": "'$MEMORY_USAGE'"
          }'
```

## 🚨 Error Handling

### Retry Strategy

```yaml
- name: 🔄 Deploy with Retry
  uses: nick-invision/retry@v2
  with:
    timeout_minutes: 10
    max_attempts: 3
    retry_wait_seconds: 30
    command: |
      npm run deploy
```

### Error Notifications

```yaml
- name: 🚨 Error Notification
  if: failure()
  uses: actions/github-script@v7
  with:
    script: |
      const issue = await github.rest.issues.create({
        owner: context.repo.owner,
        repo: context.repo.repo,
        title: `Workflow Failed: ${context.workflow}`,
        body: `## Workflow Failure
        
        - **Workflow**: ${context.workflow}
        - **Run**: ${context.runId}
        - **Actor**: ${context.actor}
        - **Branch**: ${context.ref}
        - **Commit**: ${context.sha}
        
        [View Run](${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId})
        `,
        labels: ['workflow-failure', 'automated']
      });
```

## 📋 Validation Rules

### Workflow Validator Script

```javascript
// .github/scripts/validate-workflows.js
const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')

const rules = {
  requiredFields: ['name', 'on', 'jobs'],
  namingPattern: /^[🚀🔒🧪📊🤖]\s[\w\s-]+$/,
  maxJobDuration: 30,
  requiredPermissions: ['contents: read'],
  forbiddenCommands: ['sudo', 'rm -rf', 'chmod 777'],
}

function validateWorkflow(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const workflow = yaml.load(content)
  const errors = []

  // Check required fields
  rules.requiredFields.forEach((field) => {
    if (!workflow[field]) {
      errors.push(`Missing required field: ${field}`)
    }
  })

  // Check naming convention
  if (!rules.namingPattern.test(workflow.name)) {
    errors.push(`Invalid workflow name format: ${workflow.name}`)
  }

  // Check job timeouts
  Object.entries(workflow.jobs || {}).forEach(([jobName, job]) => {
    if (job['timeout-minutes'] > rules.maxJobDuration) {
      errors.push(`Job ${jobName} exceeds maximum duration`)
    }
  })

  return errors
}

// Validate all workflows
const workflowsDir = path.join(__dirname, '../workflows')
const workflows = fs
  .readdirSync(workflowsDir)
  .filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'))

let hasErrors = false
workflows.forEach((file) => {
  const errors = validateWorkflow(path.join(workflowsDir, file))
  if (errors.length > 0) {
    console.error(`❌ ${file}:`)
    errors.forEach((error) => console.error(`  - ${error}`))
    hasErrors = true
  } else {
    console.log(`✅ ${file}`)
  }
})

if (hasErrors) {
  process.exit(1)
}
```

## 🎯 Compliance Checklist

### New Workflow Checklist

- [ ] Follows naming convention
- [ ] Includes comprehensive comments
- [ ] Has proper error handling
- [ ] Implements caching strategy
- [ ] Includes timeout settings
- [ ] Has retry logic for critical steps
- [ ] Collects metrics
- [ ] Sends notifications on failure
- [ ] Uses reusable workflows where applicable
- [ ] Passes validation script
- [ ] Includes documentation
- [ ] Has test coverage

### Review Checklist

- [ ] Performance optimized
- [ ] Security compliant
- [ ] Resource efficient
- [ ] Maintainable
- [ ] Well documented
- [ ] Metrics enabled
- [ ] Error handling complete
- [ ] Notifications configured

## 📈 Success Metrics

### Key Performance Indicators

- **Workflow Success Rate**: >95%
- **Average Execution Time**: <15 minutes
- **Cache Hit Rate**: >80%
- **Parallel Efficiency**: >70%
- **Recovery Time**: <5 minutes
- **Resource Utilization**: <80%

### Monitoring Dashboard

```yaml
# Generate workflow metrics dashboard
- name: 📊 Generate Dashboard
  run: |
    node .github/scripts/generate-dashboard.js > dashboard.html

- name: 📤 Upload Dashboard
  uses: actions/upload-artifact@v3
  with:
    name: workflow-dashboard
    path: dashboard.html
```

---

Created: 2025-08-15
Last Updated: 2025-08-15
Status: Active
Owner: DevOps Team
