# ESLint Configuration & Custom Rules

## 📋 Overview

This document defines comprehensive ESLint configuration standards, custom rules, and enforcement mechanisms for the PMPLearningManagement project.

## 🎯 Quality Targets

### Error Thresholds

- **Critical Errors**: 0 (mandatory)
- **Warnings**: ≤50 (recommended)
- **Total Issues**: ≤100 (target)

### Enforcement Levels

- **🔴 Error**: Build fails, must fix immediately
- **🟡 Warning**: Should fix, tracked in metrics
- **🔵 Info**: Best practice recommendations

## 📦 ESLint Configuration

### Base Configuration (.eslintrc.json)

```json
{
  "root": true,
  "env": {
    "browser": true,
    "es2022": true,
    "node": true,
    "jest": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:jsx-a11y/recommended",
    "plugin:security/recommended",
    "plugin:sonarjs/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    },
    "project": ["./tsconfig.json", "./tsconfig.node.json"]
  },
  "plugins": [
    "react",
    "react-hooks",
    "@typescript-eslint",
    "import",
    "jsx-a11y",
    "security",
    "sonarjs",
    "unicorn",
    "promise",
    "n"
  ],
  "settings": {
    "react": {
      "version": "detect"
    },
    "import/resolver": {
      "typescript": {
        "alwaysTryTypes": true,
        "project": "./tsconfig.json"
      }
    }
  },
  "rules": {
    // TypeScript Rules
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "varsIgnorePattern": "^_",
        "argsIgnorePattern": "^_",
        "destructuredArrayIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/explicit-function-return-type": [
      "warn",
      {
        "allowExpressions": true,
        "allowTypedFunctionExpressions": true
      }
    ],
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "warn",
    "@typescript-eslint/prefer-optional-chain": "warn",
    "@typescript-eslint/strict-boolean-expressions": [
      "error",
      {
        "allowNullableObject": true,
        "allowNullableString": true
      }
    ],

    // React Rules
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-react": "off",
    "react/jsx-no-duplicate-props": "error",
    "react/jsx-no-undef": "error",
    "react/jsx-pascal-case": "error",
    "react/no-unescaped-entities": "error",
    "react/no-children-prop": "error",
    "react/no-danger": "warn",
    "react/no-deprecated": "error",
    "react/no-direct-mutation-state": "error",
    "react/no-find-dom-node": "error",
    "react/no-render-return-value": "error",
    "react/no-string-refs": "error",
    "react/no-unknown-property": "error",
    "react/require-render-return": "error",
    "react/self-closing-comp": "warn",

    // React Hooks Rules
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // Import Rules
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
          "object",
          "type"
        ],
        "pathGroups": [
          {
            "pattern": "react",
            "group": "builtin",
            "position": "before"
          },
          {
            "pattern": "@/**",
            "group": "internal"
          }
        ],
        "pathGroupsExcludedImportTypes": ["react"],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ],
    "import/no-duplicates": "error",
    "import/no-unresolved": "error",
    "import/no-cycle": "error",
    "import/no-self-import": "error",
    "import/no-useless-path-segments": "warn",

    // Security Rules
    "security/detect-object-injection": "warn",
    "security/detect-non-literal-regexp": "warn",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error",
    "security/detect-eval-with-expression": "error",
    "security/detect-no-csrf-before-method-override": "error",
    "security/detect-possible-timing-attacks": "warn",

    // Code Quality Rules
    "sonarjs/cognitive-complexity": ["error", 15],
    "sonarjs/no-duplicate-string": ["error", 5],
    "sonarjs/no-identical-functions": "error",
    "sonarjs/no-collapsible-if": "error",
    "sonarjs/no-collection-size-mischeck": "error",
    "sonarjs/no-duplicated-branches": "error",
    "sonarjs/no-identical-conditions": "error",
    "sonarjs/no-inverted-boolean-check": "error",
    "sonarjs/no-redundant-boolean": "error",
    "sonarjs/no-unused-collection": "error",
    "sonarjs/no-useless-catch": "error",
    "sonarjs/prefer-immediate-return": "warn",

    // General Rules
    "no-console": [
      "error",
      {
        "allow": ["warn", "error", "info"]
      }
    ],
    "no-debugger": "error",
    "no-alert": "error",
    "no-var": "error",
    "prefer-const": "error",
    "prefer-template": "warn",
    "prefer-arrow-callback": "warn",
    "no-param-reassign": "error",
    "no-nested-ternary": "warn",
    "max-depth": ["error", 4],
    "max-lines": ["warn", 500],
    "max-lines-per-function": ["warn", 100],
    "complexity": ["error", 20],

    // Promise Rules
    "promise/always-return": "error",
    "promise/no-return-wrap": "error",
    "promise/param-names": "error",
    "promise/catch-or-return": "error",
    "promise/no-nesting": "warn",
    "promise/no-promise-in-callback": "warn",
    "promise/no-callback-in-promise": "warn",
    "promise/avoid-new": "warn",

    // Node.js Rules
    "n/no-deprecated-api": "error",
    "n/no-unsupported-features/es-syntax": "off",
    "n/no-unsupported-features/node-builtins": "error"
  },
  "overrides": [
    {
      "files": ["*.test.ts", "*.test.tsx", "*.spec.ts", "*.spec.tsx"],
      "rules": {
        "@typescript-eslint/no-explicit-any": "off",
        "sonarjs/no-duplicate-string": "off",
        "security/detect-object-injection": "off"
      }
    },
    {
      "files": ["*.config.js", "*.config.ts"],
      "rules": {
        "import/no-default-export": "off"
      }
    }
  ]
}
```

## 🛠️ Custom Rules

### Custom Rule: No Direct LocalStorage Access

```javascript
// .eslintrc.local-rules.js
module.exports = {
  rules: {
    'no-direct-localstorage': {
      create(context) {
        return {
          MemberExpression(node) {
            if (node.object.name === 'localStorage' || node.object.name === 'sessionStorage') {
              context.report({
                node,
                message: 'Direct storage access is prohibited. Use storage service instead.',
                fix(fixer) {
                  return fixer.replaceText(node, `storageService.${node.property.name}`)
                },
              })
            }
          },
        }
      },
    },
  },
}
```

### Custom Rule: Require Issue Reference in TODOs

```javascript
// .eslintrc.local-rules.js
module.exports = {
  rules: {
    'todo-with-issue': {
      create(context) {
        const sourceCode = context.getSourceCode()
        return {
          Program() {
            const comments = sourceCode.getAllComments()
            comments.forEach((comment) => {
              if (comment.value.includes('TODO') || comment.value.includes('FIXME')) {
                if (!comment.value.match(/#\d+/)) {
                  context.report({
                    loc: comment.loc,
                    message: 'TODO/FIXME comments must include an issue reference (e.g., #123)',
                  })
                }
              }
            })
          },
        }
      },
    },
  },
}
```

### Custom Rule: Enforce Japanese Comments

```javascript
// .eslintrc.local-rules.js
module.exports = {
  rules: {
    'japanese-comments': {
      create(context) {
        const sourceCode = context.getSourceCode()
        return {
          Program() {
            const comments = sourceCode.getAllComments()
            comments.forEach((comment) => {
              // Check if comment contains Japanese characters
              if (!/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(comment.value)) {
                context.report({
                  loc: comment.loc,
                  message: 'Comments should be written in Japanese for better team communication',
                })
              }
            })
          },
        }
      },
    },
  },
}
```

## 🔧 Auto-Fix Scripts

### Auto-Fix Command

```bash
#!/bin/bash
# scripts/eslint-autofix.sh

echo "🔧 Starting ESLint auto-fix..."

# Stage 1: Fix formatting issues
npx eslint . --fix --rule 'indent: error' --rule 'quotes: error' --rule 'semi: error'

# Stage 2: Fix import order
npx eslint . --fix --rule 'import/order: error'

# Stage 3: Fix React issues
npx eslint . --fix --rule 'react/self-closing-comp: error'

# Stage 4: Fix TypeScript issues
npx eslint . --fix --rule '@typescript-eslint/no-unused-vars: error'

# Stage 5: Full fix
npx eslint . --fix

echo "✅ Auto-fix complete!"
```

### Progressive Fix Strategy

```javascript
// scripts/progressive-eslint-fix.js
const { ESLint } = require('eslint')

async function progressiveFix() {
  const eslint = new ESLint({ fix: true })

  // Priority 1: Critical errors
  const criticalRules = {
    'react/jsx-no-duplicate-props': 'error',
    'react/no-unescaped-entities': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
  }

  // Priority 2: Security issues
  const securityRules = {
    'security/detect-eval-with-expression': 'error',
    'security/detect-unsafe-regex': 'error',
  }

  // Priority 3: Code quality
  const qualityRules = {
    'sonarjs/no-duplicate-string': 'error',
    'sonarjs/cognitive-complexity': 'error',
  }

  // Apply fixes progressively
  for (const [priority, rules] of Object.entries({ criticalRules, securityRules, qualityRules })) {
    console.log(`Fixing ${priority}...`)
    const results = await eslint.lintFiles(['src/**/*.{ts,tsx}'])
    await ESLint.outputFixes(results)
  }
}

progressiveFix().catch(console.error)
```

## 📊 Violation Detection

### ESLint Report Generator

```javascript
// scripts/eslint-report.js
const { ESLint } = require('eslint')
const fs = require('fs').promises

async function generateReport() {
  const eslint = new ESLint()
  const results = await eslint.lintFiles(['src/**/*.{ts,tsx}'])

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: results.length,
      totalErrors: 0,
      totalWarnings: 0,
      filesWithErrors: [],
      filesWithWarnings: [],
    },
    violations: {},
  }

  results.forEach((result) => {
    if (result.errorCount > 0) {
      report.summary.totalErrors += result.errorCount
      report.summary.filesWithErrors.push(result.filePath)
    }
    if (result.warningCount > 0) {
      report.summary.totalWarnings += result.warningCount
      report.summary.filesWithWarnings.push(result.filePath)
    }

    if (result.messages.length > 0) {
      report.violations[result.filePath] = result.messages.map((msg) => ({
        rule: msg.ruleId,
        severity: msg.severity === 2 ? 'error' : 'warning',
        line: msg.line,
        column: msg.column,
        message: msg.message,
      }))
    }
  })

  await fs.writeFile('reports/eslint-report.json', JSON.stringify(report, null, 2))

  console.log(`
📊 ESLint Report Summary
========================
Total Files: ${report.summary.totalFiles}
Total Errors: ${report.summary.totalErrors}
Total Warnings: ${report.summary.totalWarnings}
Files with Errors: ${report.summary.filesWithErrors.length}
Files with Warnings: ${report.summary.filesWithWarnings.length}
  `)

  return report
}

generateReport().catch(console.error)
```

## 🚦 Pre-Commit Integration

### .husky/pre-commit

```bash
#!/bin/bash

echo "🔍 Running ESLint checks..."

# Check for errors only (warnings allowed in commit)
npx eslint . --max-warnings=0 --format=compact

if [ $? -ne 0 ]; then
  echo "❌ ESLint errors found. Please fix before committing."
  echo "💡 Run 'npm run lint:fix' to auto-fix issues."
  exit 1
fi

echo "✅ ESLint checks passed!"
```

## 🔄 CI/CD Integration

### GitHub Actions Workflow

```yaml
name: 📋 ESLint Quality Gate

on:
  pull_request:
    types: [opened, synchronize, reopened]
  push:
    branches: [main, develop]

jobs:
  eslint:
    name: 🔍 ESLint Analysis
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: 🏗️ Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: 📦 Install dependencies
        run: npm ci

      - name: 🔍 Run ESLint
        id: eslint
        run: |
          npx eslint . \
            --format=json \
            --output-file=eslint-report.json \
            --max-warnings=50 || true

      - name: 📊 Generate Report
        if: always()
        run: |
          node scripts/eslint-report.js

      - name: 📤 Upload Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: eslint-report
          path: |
            eslint-report.json
            reports/eslint-report.json

      - name: 💬 Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('reports/eslint-report.json', 'utf8'));

            const comment = `## 📋 ESLint Report

            - **Total Errors**: ${report.summary.totalErrors} ${report.summary.totalErrors === 0 ? '✅' : '❌'}
            - **Total Warnings**: ${report.summary.totalWarnings} ${report.summary.totalWarnings <= 50 ? '✅' : '⚠️'}

            ${report.summary.totalErrors > 0 ? '### ❌ Errors must be fixed before merge' : '### ✅ No errors found'}
            ${report.summary.totalWarnings > 50 ? '### ⚠️ Warning count exceeds threshold (50)' : ''}
            `;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });

      - name: 🚦 Quality Gate
        run: |
          ERRORS=$(jq '.summary.totalErrors' reports/eslint-report.json)
          WARNINGS=$(jq '.summary.totalWarnings' reports/eslint-report.json)

          if [ "$ERRORS" -gt 0 ]; then
            echo "❌ Quality gate failed: $ERRORS errors found"
            exit 1
          fi

          if [ "$WARNINGS" -gt 50 ]; then
            echo "⚠️ Warning: $WARNINGS warnings exceed threshold (50)"
          fi

          echo "✅ Quality gate passed"
```

## 📈 Gradual Adoption Strategy

### Phase 1: Critical Errors (Week 1)

- Fix all TypeScript errors
- Fix all React errors
- Fix security vulnerabilities

### Phase 2: High Priority (Week 2)

- Reduce warnings to < 200
- Fix import order issues
- Fix unused variables

### Phase 3: Medium Priority (Week 3)

- Reduce warnings to < 100
- Fix code complexity issues
- Fix duplicate code

### Phase 4: Low Priority (Week 4)

- Reduce warnings to < 50
- Apply all auto-fixable rules
- Enable stricter rules

## 🔄 Migration Guide

### From Legacy ESLint Config

```bash
# 1. Backup current config
cp .eslintrc.js .eslintrc.backup.js

# 2. Install new dependencies
npm install --save-dev \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-plugin-import \
  eslint-plugin-jsx-a11y \
  eslint-plugin-security \
  eslint-plugin-sonarjs \
  eslint-plugin-unicorn \
  eslint-plugin-promise \
  eslint-plugin-n

# 3. Apply new config
cp .claude/rules/configs/.eslintrc.json .eslintrc.json

# 4. Run migration script
node scripts/eslint-migration.js

# 5. Fix critical errors
npm run lint:fix

# 6. Generate baseline
npm run lint -- --output-file=.eslintrc-baseline.json
```

## 📋 Exemption Procedures

### Rule Exemption Request

```typescript
// For specific line
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = externalAPI.getData()

// For entire file (must include justification)
/* eslint-disable security/detect-object-injection -- 
   Reason: Dynamic property access required for form validation
   Approved by: @team-lead
   Issue: #456
*/

// For specific rule in block
/* eslint-disable sonarjs/cognitive-complexity */
function complexBusinessLogic() {
  // Complex but necessary logic
}
/* eslint-enable sonarjs/cognitive-complexity */
```

### Exemption Documentation

```markdown
# ESLint Exemptions Log

## File: src/services/legacyAdapter.ts

- **Rule**: @typescript-eslint/no-explicit-any
- **Reason**: Legacy API integration requires dynamic types
- **Approved by**: @tech-lead
- **Issue**: #789
- **Review Date**: 2025-09-01

## File: src/utils/performanceOptimizer.ts

- **Rule**: sonarjs/cognitive-complexity
- **Reason**: Performance-critical algorithm requires complex logic
- **Approved by**: @architect
- **Issue**: #890
- **Review Date**: 2025-10-01
```

## 🎯 Success Metrics

### Key Performance Indicators

- **Error Count**: 0 (mandatory)
- **Warning Count**: ≤50 (target)
- **Auto-Fix Rate**: ≥80%
- **New Issue Introduction Rate**: <5%
- **Rule Coverage**: 100%
- **False Positive Rate**: <10%

### Monitoring Dashboard

```javascript
// scripts/eslint-dashboard.js
const generateDashboard = async () => {
  const metrics = {
    timestamp: new Date().toISOString(),
    errorTrend: [],
    warningTrend: [],
    topViolations: [],
    fileCompliance: {},
    ruleEffectiveness: {},
  }

  // Generate and display dashboard
  console.log('📊 ESLint Compliance Dashboard')
  console.log('================================')
  console.log(`Current Errors: ${metrics.errorCount}`)
  console.log(`Current Warnings: ${metrics.warningCount}`)
  console.log(`Compliance Rate: ${metrics.complianceRate}%`)
}
```

---

Created: 2025-08-15
Last Updated: 2025-08-15
Status: Active
Owner: DevOps Team
