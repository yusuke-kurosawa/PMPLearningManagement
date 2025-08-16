# Commit Message Standards & Conventions

## 📋 Overview

This document defines comprehensive commit message conventions, enforcement mechanisms, and automation tools for maintaining consistent, traceable, and meaningful commit history in the PMPLearningManagement project.

## 🎯 Objectives

### Primary Goals

- **Traceability**: Link every commit to an issue
- **Clarity**: Communicate changes effectively
- **Automation**: Enable automatic changelog generation
- **Searchability**: Support efficient history navigation
- **Compliance**: Meet IDD requirements (99% compliance)

## 📝 Commit Message Format

### Standard Format

```
<type>(<scope>): <subject> #<issue-number>

<body>

<footer>
```

### Detailed Structure

```
feat(auth): implement OAuth2 authentication flow #123

- Add Google OAuth2 provider integration
- Implement JWT token refresh mechanism
- Add session management middleware
- Update user authentication context

BREAKING CHANGE: Auth API endpoints have changed
Closes #123, Related to #124
Co-authored-by: Name <email@example.com>
```

## 🏷️ Commit Types

### Primary Types

| Type       | Description                          | Example                                      |
| ---------- | ------------------------------------ | -------------------------------------------- |
| `feat`     | New feature                          | `feat: add user profile page #123`           |
| `fix`      | Bug fix                              | `fix: resolve login timeout issue #456`      |
| `docs`     | Documentation                        | `docs: update API documentation #789`        |
| `style`    | Formatting, missing semicolons, etc. | `style: format code with prettier #012`      |
| `refactor` | Code restructuring                   | `refactor: optimize database queries #345`   |
| `perf`     | Performance improvements             | `perf: lazy load heavy components #678`      |
| `test`     | Adding tests                         | `test: add unit tests for auth service #901` |
| `build`    | Build system changes                 | `build: update webpack configuration #234`   |
| `ci`       | CI/CD changes                        | `ci: add GitHub Actions workflow #567`       |
| `chore`    | Maintenance tasks                    | `chore: update dependencies #890`            |
| `revert`   | Revert previous commit               | `revert: revert commit abc123 #111`          |
| `security` | Security fixes                       | `security: patch XSS vulnerability #999`     |

### Extended Types

| Type        | Description                | Example                                  |
| ----------- | -------------------------- | ---------------------------------------- |
| `deps`      | Dependency updates         | `deps: bump react to v18.2.0 #222`       |
| `config`    | Configuration changes      | `config: update ESLint rules #333`       |
| `db`        | Database changes           | `db: add user_roles table #444`          |
| `api`       | API changes                | `api: add pagination to endpoints #555`  |
| `ui`        | UI/UX changes              | `ui: improve mobile responsiveness #666` |
| `a11y`      | Accessibility improvements | `a11y: add ARIA labels #777`             |
| `i18n`      | Internationalization       | `i18n: add Japanese translations #888`   |
| `analytics` | Analytics/tracking         | `analytics: add event tracking #999`     |

## 📏 Commit Message Rules

### Subject Line Rules

```bash
# Format: <type>(<scope>): <subject> #<issue>

# Rules:
# 1. Maximum 72 characters
# 2. Use imperative mood ("add" not "added")
# 3. No period at the end
# 4. Include issue number
# 5. Use lowercase except for proper nouns

# ✅ Good Examples:
feat(auth): add two-factor authentication #123
fix(api): resolve memory leak in webhook handler #456
docs(readme): update installation instructions #789

# ❌ Bad Examples:
Added new feature.                          # Wrong tense, no type, no issue
fix: fixed the bug #123                    # Redundant "fixed"
FEAT(AUTH): ADD 2FA #123                   # All caps
feat(auth): implementing 2FA feature #123  # Wrong tense, too verbose
```

### Body Rules

```bash
# Optional but recommended for complex changes
# Rules:
# 1. Separate from subject with blank line
# 2. Wrap at 72 characters
# 3. Explain what and why, not how
# 4. Use bullet points for multiple changes
# 5. Write in Japanese for detailed explanations

# Example:
feat(payment): integrate Stripe payment gateway #234

このコミットは以下の変更を含みます：

- Stripe SDK の統合
- 支払いフォームコンポーネントの作成
- Webhook エンドポイントの実装
- 支払い履歴の表示機能

The payment flow now supports:
- Credit/debit card payments
- Subscription management
- Invoice generation
```

### Footer Rules

```bash
# Optional metadata and references
# Format options:

# Breaking changes (REQUIRED if breaking)
BREAKING CHANGE: <description>

# Issue references
Closes #123
Fixes #456
Resolves #789
Related to #012
See also #345

# Co-authorship
Co-authored-by: Name <email@example.com>
Signed-off-by: Name <email@example.com>

# Review references
Reviewed-by: Name <email@example.com>
Approved-by: Name <email@example.com>

# Additional metadata
Tested-by: CI/CD Pipeline
Deployment: production
Migration: required
```

## 🔧 Scope Definitions

### Component Scopes

```
auth        # Authentication & authorization
api         # API endpoints
ui          # User interface components
db          # Database operations
cache       # Caching layer
queue       # Message queues
storage     # File storage
email       # Email services
payment     # Payment processing
search      # Search functionality
```

### Technical Scopes

```
deps        # Dependencies
config      # Configuration
build       # Build process
ci          # CI/CD pipeline
docker      # Docker configuration
k8s         # Kubernetes
terraform   # Infrastructure as Code
monitoring  # Monitoring & logging
security    # Security measures
performance # Performance optimization
```

## 🤖 Automation Tools

### Commitizen Configuration

```json
// .czrc
{
  "path": "cz-conventional-changelog",
  "types": {
    "feat": {
      "description": "A new feature",
      "title": "Features"
    },
    "fix": {
      "description": "A bug fix",
      "title": "Bug Fixes"
    },
    "security": {
      "description": "A security fix",
      "title": "Security Fixes"
    }
  },
  "scopes": ["auth", "api", "ui", "db", "cache", "payment"],
  "allowCustomScopes": true,
  "allowBreakingChanges": ["feat", "fix"],
  "skipQuestions": ["footer"],
  "subjectLimit": 72
}
```

### Commitlint Configuration

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type rules
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
        'security',
        'deps',
        'config',
        'db',
        'api',
        'ui',
        'a11y',
        'i18n',
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    // Scope rules
    'scope-enum': [
      1,
      'always',
      ['auth', 'api', 'ui', 'db', 'cache', 'payment', 'search', 'email', 'storage'],
    ],
    'scope-case': [2, 'always', 'lower-case'],

    // Subject rules
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-max-length': [2, 'always', 72],

    // Body rules
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [2, 'always', 72],

    // Footer rules
    'footer-leading-blank': [2, 'always'],
    'footer-max-line-length': [2, 'always', 72],

    // Custom rules
    'issue-reference': [2, 'always'],
  },
  plugins: [
    {
      rules: {
        'issue-reference': ({ subject, body, footer }) => {
          const issuePattern = /#\d+/
          const hasIssue =
            issuePattern.test(subject) ||
            issuePattern.test(body || '') ||
            issuePattern.test(footer || '')

          return [hasIssue, `Commit must reference an issue (e.g., #123)`]
        },
      },
    },
  ],
}
```

## 🚦 Git Hooks

### commit-msg Hook

```bash
#!/bin/bash
# .husky/commit-msg

# Validate commit message format
npx --no-install commitlint --edit "$1"

# Check for issue reference
if ! grep -qE "#[0-9]+" "$1"; then
  echo "❌ Error: Commit message must include an issue reference (e.g., #123)"
  echo ""
  echo "Format: <type>(<scope>): <subject> #<issue-number>"
  echo "Example: feat(auth): add login functionality #123"
  exit 1
fi

# Check message length
FIRST_LINE=$(head -n1 "$1")
if [ ${#FIRST_LINE} -gt 72 ]; then
  echo "❌ Error: First line exceeds 72 characters (${#FIRST_LINE} chars)"
  exit 1
fi

# Validate type
VALID_TYPES="feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|security"
if ! echo "$FIRST_LINE" | grep -qE "^($VALID_TYPES)(\(.+\))?: .+ #[0-9]+"; then
  echo "❌ Error: Invalid commit message format"
  echo "Valid types: $VALID_TYPES"
  exit 1
fi

echo "✅ Commit message validated successfully"
```

### prepare-commit-msg Hook

```bash
#!/bin/bash
# .husky/prepare-commit-msg

# Auto-add issue number from branch name
BRANCH=$(git branch --show-current)
ISSUE=$(echo "$BRANCH" | grep -oE '[0-9]+' | head -1)

if [ -n "$ISSUE" ]; then
  # Check if issue number already exists
  if ! grep -q "#$ISSUE" "$1"; then
    # Add issue number to commit message
    sed -i.bak "1s/$/ #$ISSUE/" "$1"
    echo "📝 Auto-added issue #$ISSUE from branch name"
  fi
fi

# Add commit template if empty
if [ ! -s "$1" ]; then
  cat > "$1" << 'EOF'
# <type>(<scope>): <subject> #<issue>
#
# <body>
#
# <footer>
#
# Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert, security
# Scopes: auth, api, ui, db, cache, payment, search, email, storage
#
# Remember:
# - Use imperative mood in subject line
# - Maximum 72 characters for subject
# - Reference issue number
# - Explain what and why in body (optional)
# - Add breaking changes in footer if applicable
EOF
fi
```

## 📊 Validation Scripts

### Commit Message Validator

```javascript
// scripts/validate-commit.js
const fs = require('fs')

class CommitValidator {
  constructor() {
    this.rules = {
      maxSubjectLength: 72,
      maxBodyLineLength: 72,
      validTypes: [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
        'security',
        'deps',
        'config',
      ],
      validScopes: ['auth', 'api', 'ui', 'db', 'cache', 'payment', 'search', 'email', 'storage'],
      requireIssueReference: true,
    }
  }

  validate(message) {
    const errors = []
    const lines = message.split('\n')
    const firstLine = lines[0]

    // Parse first line
    const pattern = /^(\w+)(?:\(([^)]+)\))?: (.+?)(?: #(\d+))?$/
    const match = firstLine.match(pattern)

    if (!match) {
      errors.push('Invalid commit message format')
      return { valid: false, errors }
    }

    const [, type, scope, subject, issue] = match

    // Validate type
    if (!this.rules.validTypes.includes(type)) {
      errors.push(`Invalid type: ${type}. Valid types: ${this.rules.validTypes.join(', ')}`)
    }

    // Validate scope (optional)
    if (scope && !this.rules.validScopes.includes(scope)) {
      errors.push(`Invalid scope: ${scope}. Valid scopes: ${this.rules.validScopes.join(', ')}`)
    }

    // Validate subject length
    if (firstLine.length > this.rules.maxSubjectLength) {
      errors.push(
        `Subject line too long: ${firstLine.length} chars (max: ${this.rules.maxSubjectLength})`
      )
    }

    // Validate issue reference
    if (this.rules.requireIssueReference && !issue) {
      errors.push('Missing issue reference (e.g., #123)')
    }

    // Validate imperative mood
    const firstWord = subject.split(' ')[0].toLowerCase()
    const pastTenseWords = ['added', 'fixed', 'updated', 'removed', 'changed']
    if (pastTenseWords.includes(firstWord)) {
      errors.push(
        `Use imperative mood: "${firstWord.replace(/ed$/, '')}" instead of "${firstWord}"`
      )
    }

    // Validate body line length
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].length > this.rules.maxBodyLineLength) {
        errors.push(`Line ${i + 1} exceeds ${this.rules.maxBodyLineLength} characters`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      parsed: { type, scope, subject, issue },
    }
  }
}

// CLI usage
if (require.main === module) {
  const message = fs.readFileSync(process.argv[2], 'utf8')
  const validator = new CommitValidator()
  const result = validator.validate(message)

  if (!result.valid) {
    console.error('❌ Commit message validation failed:')
    result.errors.forEach((error) => console.error(`  - ${error}`))
    process.exit(1)
  }

  console.log('✅ Commit message is valid')
  console.log(`  Type: ${result.parsed.type}`)
  console.log(`  Scope: ${result.parsed.scope || 'none'}`)
  console.log(`  Issue: #${result.parsed.issue}`)
}

module.exports = CommitValidator
```

## 📈 Changelog Generation

### Conventional Changelog Configuration

```javascript
// .changelogrc.js
module.exports = {
  preset: 'angular',
  releaseCommitMessageFormat: 'chore(release): {{currentTag}} [skip ci]',
  types: [
    { type: 'feat', section: '✨ Features', hidden: false },
    { type: 'fix', section: '🐛 Bug Fixes', hidden: false },
    { type: 'security', section: '🔒 Security Fixes', hidden: false },
    { type: 'perf', section: '⚡ Performance Improvements', hidden: false },
    { type: 'docs', section: '📚 Documentation', hidden: false },
    { type: 'deps', section: '📦 Dependencies', hidden: false },
    { type: 'revert', section: '⏪ Reverts', hidden: false },
    { type: 'style', section: '💄 Styles', hidden: true },
    { type: 'chore', section: '🔧 Miscellaneous', hidden: true },
    { type: 'refactor', section: '♻️ Code Refactoring', hidden: true },
    { type: 'test', section: '✅ Tests', hidden: true },
    { type: 'build', section: '📦 Build System', hidden: true },
    { type: 'ci', section: '👷 CI/CD', hidden: true },
  ],
  commitUrlFormat: 'https://github.com/{{owner}}/{{repository}}/commit/{{hash}}',
  compareUrlFormat:
    'https://github.com/{{owner}}/{{repository}}/compare/{{previousTag}}...{{currentTag}}',
  issueUrlFormat: 'https://github.com/{{owner}}/{{repository}}/issues/{{id}}',
}
```

### Auto-generate Changelog

```bash
#!/bin/bash
# scripts/generate-changelog.sh

# Generate changelog for current version
npx conventional-changelog -p angular -i CHANGELOG.md -s

# Generate changelog for specific version range
npx conventional-changelog -p angular -i CHANGELOG.md -s -r 2

# Generate full changelog
npx conventional-changelog -p angular -i CHANGELOG.md -s -r 0
```

## 🚨 Common Violations & Fixes

### Missing Issue Reference

```bash
# ❌ Bad
git commit -m "fix: resolve login bug"

# ✅ Good
git commit -m "fix: resolve login bug #123"

# Auto-fix with amend
git commit --amend -m "$(git log -1 --pretty=%B | head -1) #123"
```

### Wrong Tense

```bash
# ❌ Bad
git commit -m "feat: added new feature #123"

# ✅ Good
git commit -m "feat: add new feature #123"
```

### Exceeding Character Limit

```bash
# ❌ Bad (85 characters)
git commit -m "feat(authentication): implement complete OAuth2 flow with Google provider #123"

# ✅ Good (72 characters)
git commit -m "feat(auth): add OAuth2 with Google provider #123"
# Add details in body if needed
```

## 📊 Metrics & Reporting

### Commit Quality Report

```javascript
// scripts/commit-quality-report.js
const { execSync } = require('child_process')

function generateCommitReport() {
  const commits = execSync('git log --oneline -n 100').toString().split('\n')

  const report = {
    total: commits.length,
    compliant: 0,
    violations: [],
    typeDistribution: {},
    averageLength: 0,
  }

  commits.forEach((commit) => {
    // Analyze each commit
    const hasIssue = /#\d+/.test(commit)
    const hasType =
      /^[a-f0-9]+ (feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|security)/.test(
        commit
      )

    if (hasIssue && hasType) {
      report.compliant++
    } else {
      report.violations.push(commit)
    }
  })

  report.complianceRate = ((report.compliant / report.total) * 100).toFixed(2)

  console.log(`
📊 Commit Quality Report
========================
Total Commits: ${report.total}
Compliant: ${report.compliant} (${report.complianceRate}%)
Violations: ${report.violations.length}

Top Violations:
${report.violations.slice(0, 5).join('\n')}
  `)

  return report
}

generateCommitReport()
```

## 🎯 Success Metrics

### Key Performance Indicators

- **IDD Compliance Rate**: ≥99%
- **Issue Reference Rate**: 100%
- **Format Compliance**: ≥95%
- **Average Commit Quality Score**: ≥85%
- **Changelog Generation Success**: 100%
- **Hook Execution Time**: <1 second

## 📋 Quick Reference

### Commit Message Template

```bash
# Save as .gitmessage
# git config commit.template .gitmessage

<type>(<scope>): <subject> #<issue>

<body>

<footer>

# Types: feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|security
# Scopes: auth|api|ui|db|cache|payment|search|email|storage
# Subject: imperative mood, max 72 chars
# Body: explain what and why, wrap at 72 chars
# Footer: breaking changes, issue references, co-authors
```

### Common Commands

```bash
# Interactive commit with commitizen
npm run commit

# Validate last commit
npm run commit:validate

# Generate changelog
npm run changelog

# Check commit history compliance
npm run commits:check

# Fix commit message
git commit --amend

# Add co-author
git commit -m "feat: add feature #123" \
  -m "Co-authored-by: Name <email@example.com>"
```

---

Created: 2025-08-15
Last Updated: 2025-08-15
Status: Active
Owner: DevOps Team
