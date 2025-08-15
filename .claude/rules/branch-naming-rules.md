# Branch Naming Conventions & Standards

## 📋 Overview

This document defines comprehensive branch naming conventions, branching strategies, and enforcement mechanisms for the PMPLearningManagement project.

## 🎯 Objectives

### Primary Goals
- **Clarity**: Self-documenting branch names
- **Traceability**: Link branches to issues
- **Automation**: Enable automated workflows
- **Organization**: Maintain clean repository structure
- **Consistency**: Uniform naming across team

## 🌳 Branching Strategy

### GitFlow Model (Enhanced)
```
main (production)
├── develop (staging)
│   ├── feature/issue-123-user-authentication
│   ├── feature/issue-456-payment-integration
│   └── feature/issue-789-api-optimization
├── release/v2.1.0
│   └── bugfix/issue-321-release-critical-fix
├── hotfix/issue-999-security-patch
└── experimental/ai-integration
```

### Environment Branches
| Branch | Purpose | Protection | Auto-Deploy |
|--------|---------|------------|-------------|
| `main` | Production | Full protection | Production |
| `develop` | Integration | Partial protection | Staging |
| `staging` | Pre-production | Partial protection | Staging |
| `preview/*` | Feature preview | None | Preview |

## 📝 Naming Format

### Standard Pattern
```
<type>/<issue-number>-<brief-description>
```

### Detailed Patterns
```bash
# Feature branches
feature/issue-123-add-oauth-login
feature/issue-456-implement-payment-gateway
feature/issue-789-redesign-dashboard

# Bug fix branches
bugfix/issue-321-fix-memory-leak
bugfix/issue-654-resolve-login-timeout
bugfix/issue-987-correct-calculation-error

# Hotfix branches (production fixes)
hotfix/issue-111-critical-security-patch
hotfix/issue-222-production-database-fix
hotfix/issue-333-emergency-api-fix

# Release branches
release/v2.1.0
release/v2.1.0-rc1
release/v2.1.0-beta

# Experimental branches
experimental/ai-integration
experimental/new-architecture
experimental/performance-optimization

# Documentation branches
docs/issue-444-api-documentation
docs/issue-555-user-guide
docs/issue-666-deployment-guide

# Refactoring branches
refactor/issue-777-optimize-queries
refactor/issue-888-restructure-components
refactor/issue-999-improve-type-safety

# Testing branches
test/issue-135-e2e-coverage
test/issue-246-performance-testing
test/issue-357-security-testing

# CI/CD branches
ci/issue-468-github-actions
ci/issue-579-deployment-pipeline
ci/issue-680-test-automation

# Dependency update branches
deps/issue-791-update-react
deps/issue-802-security-patches
deps/issue-913-major-upgrades
```

## 🏷️ Branch Types

### Type Definitions
| Type | Purpose | Merge Target | Lifetime |
|------|---------|--------------|----------|
| `feature` | New functionality | `develop` | 1-2 weeks |
| `bugfix` | Bug fixes | `develop` | 1-3 days |
| `hotfix` | Production fixes | `main` + `develop` | < 24 hours |
| `release` | Release preparation | `main` | 1 week |
| `docs` | Documentation | `develop` | 1-3 days |
| `refactor` | Code refactoring | `develop` | 1 week |
| `test` | Testing improvements | `develop` | 1 week |
| `ci` | CI/CD changes | `develop` | 1-3 days |
| `deps` | Dependency updates | `develop` | 1-2 days |
| `experimental` | Experiments | Never/Archive | Variable |
| `chore` | Maintenance tasks | `develop` | 1-2 days |
| `perf` | Performance improvements | `develop` | 1 week |
| `security` | Security fixes | `main` + `develop` | < 48 hours |

## 📏 Naming Rules

### Mandatory Rules
```bash
# 1. Always include issue number
feature/issue-123-description  # ✅ Good
feature/new-feature            # ❌ Bad - missing issue number

# 2. Use lowercase and hyphens
feature/issue-123-add-feature  # ✅ Good
feature/Issue-123-Add_Feature  # ❌ Bad - wrong case and underscore

# 3. Keep descriptions brief (max 50 chars after issue number)
feature/issue-123-oauth        # ✅ Good
feature/issue-123-implement-complete-oauth2-authentication-system  # ❌ Bad - too long

# 4. No special characters except hyphen
feature/issue-123-api-v2       # ✅ Good
feature/issue-123-api@v2.0     # ❌ Bad - special characters

# 5. Use descriptive but concise names
bugfix/issue-456-login-timeout # ✅ Good
bugfix/issue-456-fix           # ❌ Bad - not descriptive
```

### Branch Name Validation Regex
```javascript
// Valid branch name pattern
const branchPattern = /^(feature|bugfix|hotfix|release|docs|refactor|test|ci|deps|experimental|chore|perf|security)\/(issue-\d+-)?.{1,50}$/;

// Examples of valid names
const validNames = [
  'feature/issue-123-user-auth',
  'bugfix/issue-456-memory-leak',
  'hotfix/issue-789-critical-fix',
  'release/v2.1.0',
  'experimental/new-architecture'
];

// Examples of invalid names
const invalidNames = [
  'feat/issue-123',          // Wrong type
  'feature/UserAuth',        // No issue, wrong case
  'feature/issue-123',       // No description
  'feature/add-feature',     // No issue number
  'main',                    // Protected branch
  'my-feature'              // No type prefix
];
```

## 🤖 Automation Scripts

### Branch Creation Script
```bash
#!/bin/bash
# scripts/create-branch.sh

# Usage: ./create-branch.sh <type> <issue-number> <description>

TYPE=$1
ISSUE=$2
DESCRIPTION=$3

# Validate inputs
if [[ -z "$TYPE" || -z "$ISSUE" || -z "$DESCRIPTION" ]]; then
  echo "❌ Usage: $0 <type> <issue-number> <description>"
  echo "Example: $0 feature 123 user-authentication"
  exit 1
fi

# Validate type
VALID_TYPES="feature bugfix hotfix release docs refactor test ci deps experimental chore perf security"
if ! echo "$VALID_TYPES" | grep -q "$TYPE"; then
  echo "❌ Invalid type: $TYPE"
  echo "Valid types: $VALID_TYPES"
  exit 1
fi

# Create branch name
BRANCH_NAME="$TYPE/issue-$ISSUE-$DESCRIPTION"

# Validate branch name length
if [ ${#BRANCH_NAME} -gt 100 ]; then
  echo "❌ Branch name too long (${#BRANCH_NAME} chars, max 100)"
  exit 1
fi

# Check if branch exists
if git show-ref --verify --quiet refs/heads/"$BRANCH_NAME"; then
  echo "❌ Branch already exists: $BRANCH_NAME"
  exit 1
fi

# Create and checkout branch
git checkout -b "$BRANCH_NAME"

echo "✅ Created and switched to branch: $BRANCH_NAME"

# Optional: Push branch and set upstream
read -p "Push branch to remote? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  git push -u origin "$BRANCH_NAME"
  echo "✅ Branch pushed to remote"
fi

# Optional: Create draft PR
read -p "Create draft PR? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  gh pr create --draft --title "$TYPE: $DESCRIPTION" --body "Closes #$ISSUE"
  echo "✅ Draft PR created"
fi
```

### Branch Name Validator
```javascript
// scripts/validate-branch.js
class BranchValidator {
  constructor() {
    this.rules = {
      validTypes: [
        'feature', 'bugfix', 'hotfix', 'release',
        'docs', 'refactor', 'test', 'ci', 'deps',
        'experimental', 'chore', 'perf', 'security'
      ],
      maxLength: 100,
      requireIssue: true,
      pattern: /^[a-z0-9-]+$/
    };
  }

  validate(branchName) {
    const errors = [];

    // Check if it's a protected branch
    const protectedBranches = ['main', 'develop', 'staging', 'production'];
    if (protectedBranches.includes(branchName)) {
      return { valid: true, protected: true };
    }

    // Parse branch name
    const parts = branchName.split('/');
    if (parts.length !== 2) {
      errors.push('Branch name must follow pattern: <type>/<description>');
      return { valid: false, errors };
    }

    const [type, description] = parts;

    // Validate type
    if (!this.rules.validTypes.includes(type)) {
      errors.push(`Invalid type: ${type}. Valid types: ${this.rules.validTypes.join(', ')}`);
    }

    // Validate issue reference
    if (this.rules.requireIssue && !description.startsWith('issue-')) {
      errors.push('Branch name must include issue reference (e.g., issue-123-)');
    }

    // Validate length
    if (branchName.length > this.rules.maxLength) {
      errors.push(`Branch name too long: ${branchName.length} chars (max: ${this.rules.maxLength})`);
    }

    // Validate characters
    if (!this.rules.pattern.test(description)) {
      errors.push('Branch name can only contain lowercase letters, numbers, and hyphens');
    }

    return {
      valid: errors.length === 0,
      errors,
      parsed: { type, description }
    };
  }
}

// CLI usage
if (require.main === module) {
  const branchName = process.argv[2] || require('child_process')
    .execSync('git branch --show-current')
    .toString()
    .trim();

  const validator = new BranchValidator();
  const result = validator.validate(branchName);

  if (result.protected) {
    console.log(`✅ Protected branch: ${branchName}`);
    process.exit(0);
  }

  if (!result.valid) {
    console.error(`❌ Invalid branch name: ${branchName}`);
    result.errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }

  console.log(`✅ Valid branch name: ${branchName}`);
  console.log(`  Type: ${result.parsed.type}`);
  console.log(`  Description: ${result.parsed.description}`);
}

module.exports = BranchValidator;
```

## 🚦 Git Hooks

### pre-push Hook
```bash
#!/bin/bash
# .husky/pre-push

# Get current branch name
BRANCH=$(git branch --show-current)

# Skip validation for protected branches
if [[ "$BRANCH" =~ ^(main|develop|staging|production)$ ]]; then
  echo "✅ Pushing to protected branch: $BRANCH"
  exit 0
fi

# Validate branch name
node scripts/validate-branch.js "$BRANCH"
if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Branch name validation failed"
  echo "Please rename your branch to follow the convention:"
  echo "  <type>/issue-<number>-<description>"
  echo ""
  echo "Example: feature/issue-123-user-authentication"
  echo ""
  echo "To rename your branch:"
  echo "  git branch -m $BRANCH <new-name>"
  exit 1
fi

echo "✅ Branch name validated: $BRANCH"
```

### post-checkout Hook
```bash
#!/bin/bash
# .husky/post-checkout

# Get the branch name
BRANCH=$(git branch --show-current)

# Extract issue number from branch name
ISSUE=$(echo "$BRANCH" | grep -oE 'issue-[0-9]+' | grep -oE '[0-9]+')

if [ -n "$ISSUE" ]; then
  echo "📌 Switched to branch for issue #$ISSUE"
  echo ""
  echo "Quick commands:"
  echo "  View issue: gh issue view $ISSUE"
  echo "  Create PR: gh pr create --title \"$BRANCH\" --body \"Closes #$ISSUE\""
  echo ""
  
  # Optional: Show issue details
  if command -v gh &> /dev/null; then
    echo "Issue details:"
    gh issue view "$ISSUE" --json title,state,labels --jq '.title, .state, .labels[].name' 2>/dev/null || true
  fi
fi
```

## 📊 Branch Management

### Branch Lifecycle Policy
```yaml
# .github/branch-policies.yml
policies:
  feature:
    max_age_days: 14
    stale_warning_days: 10
    auto_delete_after_merge: true
    require_issue: true
    
  bugfix:
    max_age_days: 7
    stale_warning_days: 5
    auto_delete_after_merge: true
    require_issue: true
    
  hotfix:
    max_age_days: 2
    stale_warning_days: 1
    auto_delete_after_merge: true
    require_issue: true
    
  release:
    max_age_days: 14
    stale_warning_days: 10
    auto_delete_after_merge: false
    require_issue: false
    
  experimental:
    max_age_days: 30
    stale_warning_days: 25
    auto_delete_after_merge: false
    require_issue: false
```

### Stale Branch Cleanup
```bash
#!/bin/bash
# scripts/cleanup-branches.sh

# Find and list stale branches
echo "🔍 Finding stale branches..."

# Get all branches except protected ones
BRANCHES=$(git branch -r | grep -v 'main\|develop\|staging\|production\|HEAD')

for BRANCH in $BRANCHES; do
  # Get last commit date
  LAST_COMMIT=$(git log -1 --format="%cr" "$BRANCH")
  LAST_COMMIT_TIMESTAMP=$(git log -1 --format="%ct" "$BRANCH")
  CURRENT_TIMESTAMP=$(date +%s)
  DAYS_OLD=$(( ($CURRENT_TIMESTAMP - $LAST_COMMIT_TIMESTAMP) / 86400 ))
  
  # Check if branch is stale (>30 days)
  if [ $DAYS_OLD -gt 30 ]; then
    echo "⚠️  Stale branch: $BRANCH (last commit: $LAST_COMMIT)"
    
    # Optional: Delete stale branch
    read -p "Delete this branch? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      git push origin --delete "${BRANCH#origin/}"
      echo "✅ Deleted: $BRANCH"
    fi
  fi
done
```

## 🔒 Branch Protection Rules

### GitHub Branch Protection Configuration
```yaml
# .github/branch-protection.yml
protection_rules:
  main:
    required_reviews: 2
    dismiss_stale_reviews: true
    require_code_owner_reviews: true
    required_status_checks:
      - "CI/CD Pipeline"
      - "Security Scan"
      - "Code Quality"
    enforce_admins: true
    restrict_push_access: ["senior-developers", "devops"]
    allow_force_pushes: false
    allow_deletions: false
    
  develop:
    required_reviews: 1
    dismiss_stale_reviews: true
    require_code_owner_reviews: false
    required_status_checks:
      - "CI/CD Pipeline"
      - "Tests"
    enforce_admins: false
    allow_force_pushes: false
    allow_deletions: false
    
  release/*:
    required_reviews: 2
    require_code_owner_reviews: true
    required_status_checks:
      - "CI/CD Pipeline"
      - "Security Scan"
      - "Tests"
    allow_force_pushes: false
    allow_deletions: false
```

## 📈 Metrics & Reporting

### Branch Analytics Script
```javascript
// scripts/branch-analytics.js
const { execSync } = require('child_process');

function analyzeBranches() {
  const branches = execSync('git branch -r').toString().split('\n');
  
  const analytics = {
    total: 0,
    byType: {},
    withIssue: 0,
    withoutIssue: 0,
    averageAge: 0,
    stale: []
  };

  branches.forEach(branch => {
    if (!branch.trim() || branch.includes('HEAD')) return;
    
    analytics.total++;
    
    // Parse branch type
    const match = branch.match(/origin\/(\w+)\//);
    if (match) {
      const type = match[1];
      analytics.byType[type] = (analytics.byType[type] || 0) + 1;
    }
    
    // Check for issue reference
    if (branch.includes('issue-')) {
      analytics.withIssue++;
    } else {
      analytics.withoutIssue++;
    }
    
    // Check age
    try {
      const lastCommit = execSync(`git log -1 --format="%ct" ${branch.trim()}`).toString();
      const age = Math.floor((Date.now() / 1000 - parseInt(lastCommit)) / 86400);
      
      if (age > 30) {
        analytics.stale.push({ branch: branch.trim(), age });
      }
    } catch (e) {
      // Branch might be deleted
    }
  });

  console.log(`
📊 Branch Analytics Report
==========================
Total Branches: ${analytics.total}
With Issue Reference: ${analytics.withIssue} (${((analytics.withIssue/analytics.total)*100).toFixed(1)}%)
Without Issue Reference: ${analytics.withoutIssue}

By Type:
${Object.entries(analytics.byType).map(([type, count]) => 
  `  ${type}: ${count}`).join('\n')}

Stale Branches (>30 days): ${analytics.stale.length}
${analytics.stale.slice(0, 5).map(b => 
  `  - ${b.branch} (${b.age} days old)`).join('\n')}
  `);

  return analytics;
}

analyzeBranches();
```

## 🚨 Common Violations & Fixes

### Wrong Branch Type
```bash
# ❌ Bad
git checkout -b feat/issue-123-feature

# ✅ Good - use full type name
git checkout -b feature/issue-123-feature

# Fix existing branch
git branch -m feat/issue-123-feature feature/issue-123-feature
```

### Missing Issue Number
```bash
# ❌ Bad
git checkout -b feature/new-authentication

# ✅ Good
git checkout -b feature/issue-123-authentication

# Fix by renaming
git branch -m feature/new-authentication feature/issue-123-authentication
```

### Branch Name Too Long
```bash
# ❌ Bad
git checkout -b feature/issue-123-implement-complete-user-authentication-system-with-oauth

# ✅ Good - keep it concise
git checkout -b feature/issue-123-oauth-auth
```

## 🎯 Success Metrics

### Key Performance Indicators
- **Naming Compliance**: ≥95%
- **Issue Reference Rate**: 100%
- **Average Branch Age**: <14 days
- **Stale Branch Count**: <5
- **Auto-Cleanup Success**: 100%
- **Protected Branch Violations**: 0

## 📋 Quick Reference

### Branch Commands
```bash
# Create new feature branch
git checkout -b feature/issue-123-description

# List all branches
git branch -a

# Delete local branch
git branch -d feature/issue-123-description

# Delete remote branch
git push origin --delete feature/issue-123-description

# Rename branch
git branch -m old-name new-name

# Push new branch and set upstream
git push -u origin feature/issue-123-description

# Check branch age
git log -1 --format="%cr" branch-name

# Find branches by pattern
git branch -a | grep issue-123

# Clean up local branches
git remote prune origin
git branch -vv | grep ': gone]' | awk '{print $1}' | xargs git branch -d
```

---

Created: 2025-08-15
Last Updated: 2025-08-15
Status: Active
Owner: DevOps Team