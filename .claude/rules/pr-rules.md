# Pull Request Standards & Templates

## 📋 Overview

This document defines comprehensive pull request (PR) standards, templates, review processes, and automation for the PMPLearningManagement project.

## 🎯 Objectives

### Primary Goals
- **Quality**: Ensure code quality through structured reviews
- **Traceability**: Link PRs to issues and requirements
- **Automation**: Automate checks and merging
- **Documentation**: Maintain clear change history
- **Collaboration**: Foster effective team communication

## 📝 PR Title Format

### Standard Format
```
<type>(<scope>): <description> (#<issue-number>)
```

### Examples
```
feat(auth): implement OAuth2 authentication (#123)
fix(api): resolve memory leak in webhook handler (#456)
docs(readme): update installation instructions (#789)
chore(deps): update React to v18.2.0 (#012)
refactor(db): optimize query performance (#345)
```

## 📄 PR Template

### Default Template (.github/pull_request_template.md)
```markdown
## 📋 概要 / Summary

<!-- PRの概要を簡潔に記述 / Brief description of changes -->

Closes #[issue-number]

## 🎯 変更内容 / Changes

<!-- 主な変更点をリスト形式で記載 / List main changes -->

- [ ] Feature/Fix/Enhancement description
- [ ] Related change 1
- [ ] Related change 2

## 📊 変更の種類 / Type of Change

<!-- 該当するものをチェック / Check relevant items -->

- [ ] 🐛 Bug fix (non-breaking change)
- [ ] ✨ New feature (non-breaking change)
- [ ] 💥 Breaking change (fix or feature with breaking changes)
- [ ] 📚 Documentation update
- [ ] 🔧 Configuration change
- [ ] ♻️ Code refactoring
- [ ] ⚡ Performance improvement
- [ ] 🔒 Security fix

## ✅ チェックリスト / Checklist

### 必須項目 / Required

- [ ] コードは自己レビュー済み / Self-reviewed code
- [ ] コメントを追加（特に複雑な箇所）/ Added comments for complex areas
- [ ] ドキュメントを更新 / Updated documentation
- [ ] 変更によって既存機能が壊れていない / No breaking changes to existing features
- [ ] Issue番号を含めた / Included issue number

### テスト / Testing

- [ ] 新規テストを追加 / Added new tests
- [ ] 既存テストがすべて成功 / All existing tests pass
- [ ] テストカバレッジ80%以上 / Test coverage ≥80%
- [ ] E2Eテスト実行済み / E2E tests executed

### 品質 / Quality

- [ ] ESLintエラー: 0個 / No ESLint errors
- [ ] TypeScriptエラー: 0個 / No TypeScript errors
- [ ] コンソールエラーなし / No console errors
- [ ] パフォーマンス影響を確認 / Performance impact verified

## 🧪 テスト手順 / How to Test

<!-- テスト手順を記載 / Describe testing steps -->

1. Step 1
2. Step 2
3. Expected result

## 📸 スクリーンショット / Screenshots

<!-- UI変更の場合は必須 / Required for UI changes -->

<details>
<summary>変更前 / Before</summary>

<!-- Add before screenshot -->

</details>

<details>
<summary>変更後 / After</summary>

<!-- Add after screenshot -->

</details>

## 📈 パフォーマンス影響 / Performance Impact

<!-- パフォーマンスへの影響を記載 / Describe performance impact -->

- Bundle size change: +X KB
- Load time impact: +X ms
- Memory usage: +X MB

## 🔄 破壊的変更 / Breaking Changes

<!-- 破壊的変更がある場合は詳細を記載 / Describe breaking changes if any -->

- [ ] なし / None
- [ ] あり / Yes (詳細を以下に記載 / describe below)

## 📝 追加情報 / Additional Notes

<!-- レビュアーへの追加情報 / Additional information for reviewers -->

## 🔗 関連リンク / Related Links

- Issue: #[issue-number]
- Design Doc: [link]
- Spec: [link]
- Related PRs: #[pr-number]
```

### Feature-Specific Templates

#### Security Fix Template
```markdown
## 🔒 Security Fix

### Vulnerability Details
- **Type**: [XSS/SQL Injection/etc.]
- **Severity**: [Critical/High/Medium/Low]
- **CVE**: [CVE-YYYY-NNNN if applicable]
- **CVSS Score**: [0.0-10.0]

### Fix Description
<!-- Describe the fix without revealing exploit details -->

### Testing
- [ ] Security scan passed
- [ ] Penetration test executed
- [ ] No regression in functionality

### Deployment Notes
- [ ] Requires immediate deployment
- [ ] Backport to previous versions needed
- [ ] Security advisory to be published
```

## 🔍 PR Review Process

### Review Checklist
```markdown
## 👀 Code Review Checklist

### 機能性 / Functionality
- [ ] 要件を満たしている / Meets requirements
- [ ] エッジケースを処理 / Handles edge cases
- [ ] エラーハンドリング適切 / Proper error handling
- [ ] 期待通りの動作 / Works as expected

### コード品質 / Code Quality
- [ ] 読みやすい / Readable
- [ ] DRY原則に従う / Follows DRY principle
- [ ] SOLID原則に従う / Follows SOLID principles
- [ ] 適切な抽象化 / Proper abstraction

### パフォーマンス / Performance
- [ ] 効率的なアルゴリズム / Efficient algorithms
- [ ] 不要な再レンダリングなし / No unnecessary re-renders
- [ ] メモリリークなし / No memory leaks
- [ ] 適切なキャッシング / Proper caching

### セキュリティ / Security
- [ ] 入力検証 / Input validation
- [ ] 認証・認可確認 / Auth checks
- [ ] SQLインジェクション対策 / SQL injection prevention
- [ ] XSS対策 / XSS prevention

### テスト / Testing
- [ ] 十分なテストカバレッジ / Sufficient test coverage
- [ ] テストが明確 / Clear test cases
- [ ] モックが適切 / Proper mocking
- [ ] E2Eシナリオ網羅 / E2E scenarios covered

### ドキュメント / Documentation
- [ ] コメントが適切 / Appropriate comments
- [ ] README更新 / README updated
- [ ] API docs更新 / API docs updated
- [ ] 変更履歴記載 / Changelog updated
```

### Review Assignment Rules
```yaml
# .github/CODEOWNERS
# Global owners
* @tech-lead @senior-dev

# Frontend
/src/components/ @frontend-team
/src/styles/ @ui-team
/src/hooks/ @frontend-team

# Backend
/src/api/ @backend-team
/src/services/ @backend-team
/src/db/ @database-team

# DevOps
/.github/ @devops-team
/docker/ @devops-team
/k8s/ @devops-team

# Documentation
/docs/ @docs-team
*.md @docs-team

# Security
/src/auth/ @security-team
/src/security/ @security-team
```

## 🤖 Automation

### Auto-labeling Configuration
```yaml
# .github/labeler.yml
frontend:
  - src/components/**
  - src/styles/**
  - src/hooks/**

backend:
  - src/api/**
  - src/services/**
  - src/db/**

documentation:
  - docs/**
  - '**/*.md'

tests:
  - '**/*.test.ts'
  - '**/*.test.tsx'
  - '**/*.spec.ts'
  - e2e/**

dependencies:
  - package.json
  - package-lock.json
  - yarn.lock

ci-cd:
  - .github/**
  - .gitlab-ci.yml
  - Jenkinsfile

security:
  - src/auth/**
  - src/security/**
  - '**/*security*'
```

### PR Size Labeling
```javascript
// .github/scripts/label-pr-size.js
const labelPRSize = async ({ github, context }) => {
  const pr = context.payload.pull_request;
  const additions = pr.additions;
  const deletions = pr.deletions;
  const total = additions + deletions;
  
  let sizeLabel;
  if (total < 10) {
    sizeLabel = 'size/XS';
  } else if (total < 50) {
    sizeLabel = 'size/S';
  } else if (total < 200) {
    sizeLabel = 'size/M';
  } else if (total < 500) {
    sizeLabel = 'size/L';
  } else {
    sizeLabel = 'size/XL';
  }
  
  // Remove old size labels
  const labels = await github.rest.issues.listLabelsOnIssue({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: pr.number
  });
  
  for (const label of labels.data) {
    if (label.name.startsWith('size/')) {
      await github.rest.issues.removeLabel({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: pr.number,
        name: label.name
      });
    }
  }
  
  // Add new size label
  await github.rest.issues.addLabels({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: pr.number,
    labels: [sizeLabel]
  });
};
```

### Auto-merge Configuration
```yaml
# .github/auto-merge.yml
merge_rules:
  - name: Auto-merge Dependabot PRs
    conditions:
      - author = dependabot[bot]
      - status-check = CI/CD Pipeline
      - status-check = Security Scan
      - '#approved-reviews >= 1'
    actions:
      merge:
        method: squash
        commit_message: title
        
  - name: Auto-merge minor updates
    conditions:
      - label = dependencies
      - label = 'size/S'
      - '#approved-reviews >= 1'
      - status-check = CI/CD Pipeline
    actions:
      merge:
        method: squash
        
  - name: Auto-merge documentation
    conditions:
      - label = documentation
      - files ~= '^docs/'
      - '#approved-reviews >= 1'
    actions:
      merge:
        method: squash
```

## 📊 PR Metrics

### Metrics Collection Script
```javascript
// .github/scripts/pr-metrics.js
const collectPRMetrics = async ({ github, context }) => {
  const pr = context.payload.pull_request;
  
  const metrics = {
    pr_number: pr.number,
    title: pr.title,
    author: pr.user.login,
    created_at: pr.created_at,
    merged_at: pr.merged_at,
    size: pr.additions + pr.deletions,
    files_changed: pr.changed_files,
    commits: pr.commits,
    review_comments: pr.review_comments,
    time_to_merge: null,
    reviewers: [],
    labels: []
  };
  
  // Calculate time to merge
  if (pr.merged_at) {
    const created = new Date(pr.created_at);
    const merged = new Date(pr.merged_at);
    metrics.time_to_merge = (merged - created) / (1000 * 60 * 60); // hours
  }
  
  // Get reviewers
  const reviews = await github.rest.pulls.listReviews({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: pr.number
  });
  
  metrics.reviewers = [...new Set(reviews.data.map(r => r.user.login))];
  
  // Get labels
  const labels = await github.rest.issues.listLabelsOnIssue({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: pr.number
  });
  
  metrics.labels = labels.data.map(l => l.name);
  
  // Send to analytics service
  await fetch('https://analytics.example.com/pr-metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metrics)
  });
  
  return metrics;
};
```

### PR Quality Score
```javascript
// .github/scripts/pr-quality-score.js
const calculateQualityScore = (pr) => {
  let score = 100;
  const penalties = [];
  const bonuses = [];
  
  // Size penalties
  if (pr.additions + pr.deletions > 500) {
    score -= 10;
    penalties.push('Large PR (>500 lines)');
  }
  if (pr.additions + pr.deletions > 1000) {
    score -= 10;
    penalties.push('Very large PR (>1000 lines)');
  }
  
  // Description quality
  if (pr.body.length < 100) {
    score -= 5;
    penalties.push('Short description (<100 chars)');
  }
  
  // Testing bonuses
  if (pr.body.includes('- [x]') && pr.body.includes('test')) {
    score += 5;
    bonuses.push('Includes tests');
  }
  
  // Documentation bonuses
  if (pr.files.some(f => f.filename.endsWith('.md'))) {
    score += 5;
    bonuses.push('Includes documentation');
  }
  
  // Screenshots for UI changes
  if (pr.labels.includes('ui') && pr.body.includes('![')) {
    score += 5;
    bonuses.push('Includes screenshots');
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    penalties,
    bonuses
  };
};
```

## 🚨 PR Validation Rules

### Required Checks
```yaml
# .github/required-checks.yml
checks:
  critical:
    - name: CI/CD Pipeline
      required: true
      blocking: true
      
    - name: Security Scan
      required: true
      blocking: true
      
    - name: Type Check
      required: true
      blocking: true
      
  important:
    - name: ESLint
      required: true
      blocking: false
      max_warnings: 50
      
    - name: Test Coverage
      required: true
      blocking: false
      min_coverage: 80
      
  optional:
    - name: Performance Test
      required: false
      blocking: false
      
    - name: Accessibility Check
      required: false
      blocking: false
```

### PR Validation Workflow
```yaml
name: 🔍 PR Validation

on:
  pull_request:
    types: [opened, edited, synchronize, reopened]

jobs:
  validate:
    name: 📋 Validate PR
    runs-on: ubuntu-latest
    
    steps:
      - name: 🔍 Check PR Title
        uses: actions/github-script@v7
        with:
          script: |
            const title = context.payload.pull_request.title;
            const pattern = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|security)(\(.+\))?: .+ \(#\d+\)$/;
            
            if (!pattern.test(title)) {
              core.setFailed(`Invalid PR title format: ${title}`);
              
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body: `❌ PR title doesn't follow the convention:
                
                Expected format: \`<type>(<scope>): <description> (#<issue>)\`
                Example: \`feat(auth): add OAuth2 support (#123)\`
                
                Valid types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert, security`
              });
            }
      
      - name: 🔍 Check PR Description
        uses: actions/github-script@v7
        with:
          script: |
            const body = context.payload.pull_request.body || '';
            
            // Check for issue reference
            if (!body.includes('Closes #') && !body.includes('Fixes #')) {
              core.warning('PR description should reference an issue');
            }
            
            // Check for empty description
            if (body.length < 50) {
              core.setFailed('PR description is too short (min 50 characters)');
            }
            
            // Check for checklist completion
            const checklistItems = (body.match(/- \[ \]/g) || []).length;
            const checkedItems = (body.match(/- \[x\]/gi) || []).length;
            
            if (checklistItems > 0) {
              const completion = (checkedItems / (checklistItems + checkedItems)) * 100;
              core.notice(`Checklist completion: ${completion.toFixed(0)}%`);
            }
      
      - name: 📊 Calculate PR Metrics
        uses: actions/github-script@v7
        with:
          script: |
            const pr = context.payload.pull_request;
            const metrics = {
              size: pr.additions + pr.deletions,
              files: pr.changed_files,
              commits: pr.commits
            };
            
            // Add warning for large PRs
            if (metrics.size > 500) {
              core.warning(`Large PR: ${metrics.size} lines changed. Consider breaking into smaller PRs.`);
            }
            
            // Create metrics comment
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `## 📊 PR Metrics
              
              - **Size**: ${metrics.size} lines (${pr.additions} additions, ${pr.deletions} deletions)
              - **Files**: ${metrics.files} files changed
              - **Commits**: ${metrics.commits} commits
              
              ${metrics.size > 500 ? '⚠️ **Warning**: Large PR detected. Consider breaking into smaller PRs for easier review.' : ''}
              ${metrics.commits > 20 ? '⚠️ **Warning**: Many commits. Consider squashing before merge.' : ''}`
            });
```

## 🔄 Merge Strategies

### Merge Rules by Branch
| Target Branch | Strategy | Requirements |
|--------------|----------|--------------|
| `main` | Squash and merge | 2 approvals, all checks pass |
| `develop` | Squash and merge | 1 approval, critical checks pass |
| `release/*` | Create merge commit | 2 approvals, all checks pass |
| `hotfix/*` | Squash and merge | 1 approval (emergency) |

### Merge Commit Message Template
```
<type>(<scope>): <PR title> (#<PR number>)

<PR description summary>

Co-authored-by: <reviewers>
Closes #<issue-number>
```

## 📋 PR Best Practices

### Do's
- ✅ Keep PRs small and focused (< 400 lines)
- ✅ Write clear, descriptive titles
- ✅ Include screenshots for UI changes
- ✅ Complete all checklist items
- ✅ Respond to review comments promptly
- ✅ Test locally before submitting
- ✅ Update documentation
- ✅ Squash commits if needed

### Don'ts
- ❌ Submit PRs without testing
- ❌ Ignore review comments
- ❌ Mix unrelated changes
- ❌ Submit PRs with failing tests
- ❌ Leave TODO comments without issues
- ❌ Commit sensitive information
- ❌ Force push after reviews

## 🎯 Success Metrics

### Key Performance Indicators
- **Average PR Size**: <400 lines
- **Time to First Review**: <4 hours
- **Time to Merge**: <24 hours
- **Review Coverage**: 100%
- **Auto-merge Rate**: >30%
- **Quality Score**: >85

---

Created: 2025-08-15
Last Updated: 2025-08-15
Status: Active
Owner: DevOps Team