# Workflow Comment Standards & Rules

## 📋 Overview

This document defines comprehensive commenting standards for GitHub Actions workflows, ensuring clarity, maintainability, and knowledge transfer across the DevOps team.

## 🎯 Comment Objectives

### Primary Goals
- **Clarity**: Make workflows self-documenting
- **Maintainability**: Enable easy updates and debugging
- **Knowledge Transfer**: Facilitate team collaboration
- **Automation**: Support auto-documentation generation
- **Compliance**: Meet audit and regulatory requirements

## 📝 Comment Types & Standards

### 1. File Header Comments
```yaml
# ================================================================
# Workflow: [Workflow Name]
# ================================================================
# Category: [CI/CD | Security | Testing | Monitoring | Automation]
# Purpose: [Detailed description of what this workflow does]
# 
# Triggers:
#   - push: [branches and conditions]
#   - pull_request: [types and branches]
#   - schedule: [cron expression with timezone]
#   - workflow_dispatch: [manual trigger options]
#
# Dependencies:
#   - [List of workflows this depends on]
#   - [External services required]
#
# Outputs:
#   - [Artifacts produced]
#   - [Deployments created]
#   - [Reports generated]
#
# Performance:
#   - Expected Duration: [time]
#   - Resource Usage: [CPU/Memory]
#   - Concurrency Limit: [number]
#
# Security:
#   - Required Secrets: [list]
#   - Permissions: [required permissions]
#   - Compliance: [standards met]
#
# Maintenance:
#   - Owner: [team/person]
#   - Created: [YYYY-MM-DD]
#   - Modified: [YYYY-MM-DD]
#   - Review Date: [YYYY-MM-DD]
#   - Issue: #[Issue number]
#   - Documentation: [link to docs]
#
# Changelog:
#   - [YYYY-MM-DD]: [Change description] (#Issue)
#   - [YYYY-MM-DD]: [Change description] (#Issue)
# ================================================================
```

### 2. Section Comments
```yaml
# ----------------------------------------------------------------
# SECTION: Environment Configuration
# Purpose: Define global environment variables and settings
# ----------------------------------------------------------------
env:
  NODE_VERSION: '18'      # Node.js version for consistency
  CACHE_VERSION: v1       # Cache key version for invalidation
  TIMEOUT_MINUTES: 30     # Global timeout for all jobs

# ----------------------------------------------------------------
# SECTION: Workflow Triggers
# Purpose: Define when this workflow should execute
# ----------------------------------------------------------------
on:
  push:
    branches: [main]      # Production deployments
  pull_request:
    branches: [develop]   # Development validation

# ----------------------------------------------------------------
# SECTION: Job Definitions
# Purpose: Define the workflow execution pipeline
# ----------------------------------------------------------------
jobs:
  # Job definitions here
```

### 3. Job Comments
```yaml
jobs:
  # ==============================================================
  # JOB: Setup Environment
  # ==============================================================
  # Purpose: Initialize the build environment and install dependencies
  # Duration: ~2-3 minutes
  # Dependencies: None
  # Outputs:
  #   - cache-hit: Whether dependency cache was used
  #   - node-version: Resolved Node.js version
  # Failure Impact: Blocks all downstream jobs
  # Recovery: Retry with cache invalidation
  # ==============================================================
  setup:
    name: 🏗️ Environment Setup
    runs-on: ubuntu-latest
    timeout-minutes: 5
```

### 4. Step Comments
```yaml
steps:
  # ----------------------------------------------------------
  # STEP: Checkout Repository
  # Purpose: Clone the repository with full history
  # Duration: ~10-30 seconds
  # Critical: Yes - Required for all operations
  # Retry: Automatic with exponential backoff
  # ----------------------------------------------------------
  - name: 📥 Checkout Repository
    uses: actions/checkout@v4
    with:
      fetch-depth: 0          # Full history for changelog generation
      lfs: true              # Include Git LFS files
      submodules: recursive  # Include all submodules

  # ----------------------------------------------------------
  # STEP: Cache Dependencies
  # Purpose: Speed up builds by caching node_modules
  # Duration: ~5-10 seconds (cache hit) or ~1-2 minutes (miss)
  # Critical: No - Build continues without cache
  # Cache Strategy: Invalidate on package-lock.json change
  # ----------------------------------------------------------
  - name: 📦 Cache Dependencies
    id: cache
    uses: actions/cache@v3
    with:
      path: |
        node_modules         # NPM packages
        ~/.npm              # NPM cache
        ~/.cache            # General cache
      key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
      restore-keys: |
        ${{ runner.os }}-node-  # Fallback to partial cache
```

### 5. Inline Comments
```yaml
- name: 🔨 Build Application
  run: |
    # Set build environment based on branch
    if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
      export BUILD_ENV="production"  # Production optimizations
    else
      export BUILD_ENV="development" # Include source maps
    fi
    
    # Clean previous builds to ensure fresh state
    rm -rf dist/
    
    # Execute build with performance tracking
    time npm run build
    
    # Verify build output exists and is valid
    if [ ! -d "dist" ]; then
      echo "❌ Build failed: dist directory not created"
      exit 1
    fi
    
    # Generate build metadata for tracking
    echo "{
      \"version\": \"$(node -p 'require(\"./package.json\").version')\",
      \"commit\": \"${{ github.sha }}\",
      \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
      \"environment\": \"$BUILD_ENV\"
    }" > dist/build-info.json
```

### 6. Conditional Logic Comments
```yaml
- name: 🚀 Deploy to Environment
  # Only deploy on main branch after successful tests
  if: |
    github.ref == 'refs/heads/main' &&
    needs.test.result == 'success' &&
    needs.security.result == 'success'
  run: |
    # Deployment logic here
```

### 7. Matrix Strategy Comments
```yaml
strategy:
  # Test across multiple environments for compatibility
  # Fail-fast disabled to get complete test results
  fail-fast: false
  matrix:
    # Operating Systems: Cover major platforms
    os: [ubuntu-latest, windows-latest, macos-latest]
    
    # Node.js Versions: LTS and current
    node: [16, 18, 20]
    
    # Test Suites: Different test categories
    suite: [unit, integration, e2e]
    
    # Exclusions: Skip incompatible combinations
    exclude:
      - os: windows-latest
        suite: e2e  # E2E tests not supported on Windows
      - os: macos-latest
        node: 16    # Node 16 deprecated on macOS
```

## 🏷️ Comment Formatting Standards

### Language Requirements
```yaml
# Primary language: Japanese for detailed explanations
# Secondary: English for technical terms and commands

# ✅ Good Example:
# データベース接続を確立
# Establish database connection using Prisma ORM

# ❌ Bad Example:
# Connect to DB
```

### Comment Density
```yaml
# Minimum Requirements:
# - 1 header comment per workflow file
# - 1 section comment per major section
# - 1 comment per job
# - 1 comment per complex step
# - Inline comments for non-obvious logic

# Target: 30-40% comment-to-code ratio
```

### Special Markers
```yaml
# TODO: [Task description] - Issue #123
# FIXME: [Bug description] - Issue #456
# NOTE: [Important information]
# WARNING: [Potential issue]
# DEPRECATED: [Will be removed in version X]
# SECURITY: [Security consideration]
# PERFORMANCE: [Performance impact]
# HACK: [Temporary workaround] - Remove by [date]
```

## 📊 Comment Templates

### Template: Basic Step
```yaml
# ----------------------------------------------------------
# STEP: [Step Name]
# Purpose: [What this step does]
# Duration: [Expected time]
# Critical: [Yes/No - Impact if fails]
# ----------------------------------------------------------
```

### Template: Complex Step with Error Handling
```yaml
# ----------------------------------------------------------
# STEP: [Step Name]
# Purpose: [Detailed description]
# Inputs:
#   - [Input 1]: [Description]
#   - [Input 2]: [Description]
# Outputs:
#   - [Output 1]: [Description]
# Duration: [Expected time]
# Critical: [Yes/No]
# Error Handling:
#   - [Error Type]: [Recovery action]
#   - [Error Type]: [Recovery action]
# Monitoring:
#   - Metric: [What to track]
#   - Alert: [When to alert]
# ----------------------------------------------------------
```

### Template: Reusable Workflow
```yaml
# ================================================================
# REUSABLE WORKFLOW: [Name]
# ================================================================
# Purpose: [What this workflow provides]
#
# Inputs:
#   - [input_name]: [type] - [description] (required/optional)
#
# Outputs:
#   - [output_name]: [description]
#
# Secrets:
#   - [secret_name]: [description] (required/optional)
#
# Usage Example:
#   jobs:
#     example:
#       uses: ./.github/workflows/[workflow].yml
#       with:
#         [input_name]: [value]
#       secrets:
#         [secret_name]: ${{ secrets.SECRET }}
#
# Limitations:
#   - [Limitation 1]
#   - [Limitation 2]
# ================================================================
```

## 🔧 Automation Tools

### Comment Validator Script
```javascript
// .github/scripts/validate-comments.js
const yaml = require('js-yaml');
const fs = require('fs');

class CommentValidator {
  constructor() {
    this.rules = {
      minCommentRatio: 0.3,  // 30% comments
      requiredSections: [
        'Workflow:',
        'Category:',
        'Purpose:',
        'Owner:',
        'Created:',
        'Modified:'
      ],
      requiredStepComments: [
        'Purpose:',
        'Duration:',
        'Critical:'
      ]
    };
  }

  validateWorkflow(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const errors = [];

    // Check comment ratio
    const commentLines = lines.filter(line => line.trim().startsWith('#')).length;
    const ratio = commentLines / lines.length;
    
    if (ratio < this.rules.minCommentRatio) {
      errors.push(`Insufficient comments: ${(ratio * 100).toFixed(1)}% (minimum: 30%)`);
    }

    // Check header sections
    this.rules.requiredSections.forEach(section => {
      if (!content.includes(section)) {
        errors.push(`Missing required header section: ${section}`);
      }
    });

    // Check for TODO/FIXME without issue references
    const todoPattern = /(TODO|FIXME)(?!.*#\d+)/g;
    const matches = content.match(todoPattern);
    if (matches) {
      errors.push(`Found TODO/FIXME without issue reference: ${matches.length} instances`);
    }

    return errors;
  }
}

// Run validation
const validator = new CommentValidator();
const workflowFiles = fs.readdirSync('./.github/workflows')
  .filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));

let hasErrors = false;
workflowFiles.forEach(file => {
  const errors = validator.validateWorkflow(`./.github/workflows/${file}`);
  if (errors.length > 0) {
    console.error(`❌ ${file}:`);
    errors.forEach(e => console.error(`  - ${e}`));
    hasErrors = true;
  } else {
    console.log(`✅ ${file}`);
  }
});

if (hasErrors) {
  process.exit(1);
}
```

### Auto-Documentation Generator
```javascript
// .github/scripts/generate-docs.js
const yaml = require('js-yaml');
const fs = require('fs');

class DocGenerator {
  generateWorkflowDocs(workflowPath) {
    const content = fs.readFileSync(workflowPath, 'utf8');
    const workflow = yaml.load(content);
    
    // Extract comments
    const comments = this.extractComments(content);
    
    // Generate markdown documentation
    let doc = `# ${workflow.name}\n\n`;
    
    // Add header information from comments
    if (comments.header) {
      doc += `## Overview\n${comments.header.purpose}\n\n`;
      doc += `**Category**: ${comments.header.category}\n`;
      doc += `**Owner**: ${comments.header.owner}\n`;
      doc += `**Last Modified**: ${comments.header.modified}\n\n`;
    }
    
    // Document triggers
    doc += `## Triggers\n`;
    Object.entries(workflow.on || {}).forEach(([trigger, config]) => {
      doc += `- **${trigger}**: ${JSON.stringify(config)}\n`;
    });
    
    // Document jobs
    doc += `\n## Jobs\n`;
    Object.entries(workflow.jobs || {}).forEach(([jobName, job]) => {
      doc += `\n### ${job.name || jobName}\n`;
      if (comments.jobs[jobName]) {
        doc += `${comments.jobs[jobName].purpose}\n\n`;
        doc += `- **Duration**: ${comments.jobs[jobName].duration}\n`;
        doc += `- **Critical**: ${comments.jobs[jobName].critical}\n`;
      }
    });
    
    return doc;
  }
  
  extractComments(content) {
    // Implementation to parse YAML comments
    // Returns structured comment data
    return {
      header: {},
      jobs: {},
      steps: {}
    };
  }
}
```

## 📋 Comment Quality Metrics

### Measurement Criteria
```yaml
# Quality Score Calculation:
# - Completeness: 40% (all required sections present)
# - Clarity: 30% (clear, concise language)
# - Accuracy: 20% (comments match code)
# - Consistency: 10% (follows standards)

# Target Score: ≥ 85%
```

### Quality Report Template
```markdown
## Workflow Comment Quality Report

**Date**: 2025-08-15
**Workflows Analyzed**: 15

### Summary
- **Average Quality Score**: 87%
- **Compliant Workflows**: 13/15 (86.7%)
- **Total Comments**: 450
- **Comment Ratio**: 35%

### Issues Found
1. Missing header sections: 2 workflows
2. Outdated comments: 5 instances
3. Missing issue references: 8 TODOs

### Recommendations
1. Update workflow headers in ci-cd.yml
2. Add step duration estimates
3. Include error recovery procedures
```

## 🚨 Common Violations

### Violation: Missing Comments
```yaml
# ❌ Bad: No comments
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build

# ✅ Good: Properly commented
jobs:
  # ==============================================================
  # JOB: Build Application
  # Purpose: Compile TypeScript and bundle assets
  # ==============================================================
  build:
    name: 📦 Build Application
    runs-on: ubuntu-latest
    
    steps:
      # Checkout repository with full history
      - name: 📥 Checkout Repository
        uses: actions/checkout@v4
      
      # Install dependencies from lock file
      - name: 📦 Install Dependencies
        run: npm ci
      
      # Build production bundle
      - name: 🔨 Build Application
        run: npm run build
```

### Violation: Unclear Comments
```yaml
# ❌ Bad: Vague comment
# Do the thing
- run: ./script.sh

# ✅ Good: Clear, specific comment
# Execute database migration script
# This updates schema to version 2.0 and migrates existing data
# Duration: ~2-3 minutes depending on data volume
- run: ./script.sh
```

## 🎯 Enforcement Mechanisms

### Pre-Commit Hook
```bash
#!/bin/bash
# .husky/pre-commit

# Check workflow comments
for file in .github/workflows/*.yml; do
  if [ -f "$file" ]; then
    node .github/scripts/validate-comments.js "$file"
    if [ $? -ne 0 ]; then
      echo "❌ Workflow comment validation failed"
      exit 1
    fi
  fi
done
```

### CI/CD Check
```yaml
name: 📝 Comment Quality Check

on:
  pull_request:
    paths:
      - '.github/workflows/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: 🔍 Validate Comments
        run: |
          npm install js-yaml
          node .github/scripts/validate-comments.js
      
      - name: 📊 Generate Quality Report
        if: always()
        run: |
          node .github/scripts/comment-quality-report.js > comment-report.md
      
      - name: 💬 Post PR Comment
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const report = require('fs').readFileSync('comment-report.md', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: report
            });
```

## 📚 Best Practices

### Do's
- ✅ Write comments before writing code
- ✅ Update comments when code changes
- ✅ Include examples in complex sections
- ✅ Reference issues for TODOs
- ✅ Document error scenarios
- ✅ Explain "why" not just "what"
- ✅ Use consistent formatting
- ✅ Include performance expectations

### Don'ts
- ❌ Leave outdated comments
- ❌ Write obvious comments
- ❌ Use unclear abbreviations
- ❌ Skip error handling documentation
- ❌ Forget to update modification date
- ❌ Mix languages inconsistently
- ❌ Omit critical information

---

Created: 2025-08-15
Last Updated: 2025-08-15
Status: Active
Owner: DevOps Team