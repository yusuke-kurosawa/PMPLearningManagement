# ブランチ保護ルール設定ガイド

## mainブランチの保護設定

### 必須設定
以下の設定をGitHubリポジトリの Settings > Branches で設定します：

```yaml
Branch name pattern: main

Protection rules:
  ✅ Require a pull request before merging
    ✅ Require approvals: 1
    ✅ Dismiss stale pull request approvals when new commits are pushed
    ✅ Require review from CODEOWNERS
    
  ✅ Require status checks to pass before merging
    ✅ Require branches to be up to date before merging
    Required status checks:
      - minimal-status-check
      - test-ci
      - build
      - lint
      
  ✅ Require conversation resolution before merging
  
  ✅ Require signed commits
  
  ✅ Require linear history
  
  ✅ Include administrators
  
  ✅ Restrict who can push to matching branches
    - Allowed users/teams: [repository owner]
    
  ✅ Allow force pushes
    ❌ Everyone (disabled)
    ✅ Specify who can force push: [repository owner only]
    
  ✅ Allow deletions
    ❌ (disabled)
```

## developブランチの保護設定（オプション）

```yaml
Branch name pattern: develop

Protection rules:
  ✅ Require a pull request before merging
    ✅ Require approvals: 1
    
  ✅ Require status checks to pass before merging
    Required status checks:
      - test-ci
      - lint
      
  ✅ Require conversation resolution before merging
```

## 自動マージ設定

### GitHub Auto-merge
PRが以下の条件を満たした場合、自動的にマージ：

```yaml
Auto-merge conditions:
  - All required status checks passed
  - Required number of approvals met
  - No merge conflicts
  - Conversation resolved
  
Merge method:
  - Squash and merge (推奨)
  - Create a merge commit
  - Rebase and merge
```

### 設定方法

1. **Repository Settings**
```bash
# GitHub CLI で設定
gh repo edit --enable-auto-merge
```

2. **PR作成時の自動マージ有効化**
```bash
# PRを作成して自動マージを有効化
gh pr create --title "タイトル" --body "本文"
gh pr merge --auto --squash
```

## マージ戦略

### Squash and Merge（推奨）
```
利点:
- コミット履歴がクリーン
- 1つのPR = 1つのコミット
- revertが簡単

使用場面:
- 機能追加
- バグ修正
- 小規模な変更
```

### Create a Merge Commit
```
利点:
- 完全な履歴を保持
- ブランチの分岐が明確

使用場面:
- 大規模な機能のマージ
- 複数人での開発
```

### Rebase and Merge
```
利点:
- 線形な履歴
- コンフリクト解決が明確

使用場面:
- 小さな修正
- 依存関係のない変更
```

## セキュリティ設定

### 署名付きコミットの強制
```bash
# GPGキーの設定
gpg --gen-key
gpg --list-secret-keys --keyid-format LONG
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true

# GitHubにGPGキーを追加
gh gpg-key add
```

### CODEOWNERS ファイル
```bash
# .github/CODEOWNERS
# グローバルオーナー
* @yusuke-kurosawa

# 特定ディレクトリのオーナー
/src/components/ @frontend-team
/src/server/ @backend-team
/docs/ @documentation-team
/.github/ @devops-team
```

## ワークフロー自動化

### Dependabot設定
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule:
      interval: weekly
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "automated"
    assignees:
      - "yusuke-kurosawa"
    reviewers:
      - "yusuke-kurosawa"
```

### 自動ラベル付け
```yaml
# .github/labeler.yml
frontend:
  - src/components/**/*
  - src/pages/**/*
  
backend:
  - src/server/**/*
  - src/api/**/*
  
documentation:
  - docs/**/*
  - README.md
  - CLAUDE.md
  
devops:
  - .github/**/*
  - scripts/**/*
  - package.json
```

## モニタリングとアラート

### ブランチ保護違反の通知
```yaml
# .github/workflows/protection-monitor.yml
name: Branch Protection Monitor
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
    
jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - name: Check protection status
        run: |
          gh api repos/${{ github.repository }}/branches/main/protection
```

### メトリクス収集
```bash
# PR マージ時間の測定
gh pr list --state merged --json number,title,createdAt,mergedAt \
  --jq '.[] | {number, title, timeToMerge: (.mergedAt - .createdAt)}'
```

## トラブルシューティング

### よくある問題と解決方法

1. **"Protected branch update failed"**
   - 解決: PRを作成してマージする
   - `gh pr create && gh pr merge --auto`

2. **"Required status check is expected"**
   - 解決: CIが完了するまで待つ
   - `gh pr checks --watch`

3. **"Review required"**
   - 解決: レビュアーを割り当てる
   - `gh pr edit --add-reviewer @username`

4. **"Merge conflict"**
   - 解決: ローカルでrebaseする
   ```bash
   git fetch origin
   git rebase origin/main
   git push --force-with-lease
   ```

## ベストプラクティス

1. **定期的なブランチクリーンアップ**
```bash
# マージ済みブランチの削除
npm run branch:cleanup

# 古いブランチの確認
git for-each-ref --format='%(refname:short) %(committerdate)' refs/heads/ | sort -k2
```

2. **PR テンプレートの活用**
- 常にテンプレートを使用
- チェックリストを完了させる
- 適切なラベルを付ける

3. **自動化の最大活用**
- Auto-mergeを積極的に使用
- GitHub Actionsでの自動チェック
- Dependabotでの依存関係更新

4. **コミュニケーション**
- PR作成時にレビュアーに通知
- ブロッカーがある場合は早めに相談
- マージ後のフォローアップ