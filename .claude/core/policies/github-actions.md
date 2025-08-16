# GitHub Actions ワークフロー規則

このドキュメントは、PMPLearningManagementプロジェクトのGitHub Actionsワークフロー規則を定義します。

## 📝 基本原則

1. **命名規則**: 番号付きカテゴリシステム
2. **コメント**: 日本語で記述
3. **構造**: 標準化されたYAML構造
4. **効率**: 並列実行とキャッシュ活用
5. **監視**: メトリクス収集と通知

## 🏷️ 命名規則

### ファイル名パターン

```
<番号>-<カテゴリ>-<機能>.yml
```

### カテゴリ分類

- `01-core`: CI/CD基盤
- `02-claude`: AI支援機能
- `03-security`: セキュリティ
- `04-deploy`: デプロイメント
- `05-idd`: Issue-Driven Development
- `06-monitoring`: 監視・メトリクス
- `07-maintenance`: メンテナンス

### 例

```
01-core-ci-cd.yml
02-claude-pr-review.yml
03-security-scan.yml
04-deploy-production.yml
05-idd-compliance.yml
```

## 📄 ワークフロー構造

### 標準ヘッダー

```yaml
# ================================================================
# ワークフロー名: CI/CD基盤
# カテゴリ: CI/CD
# 目的: ビルド、テスト、品質チェックの実行
# トリガー: push, pull_request, schedule
# 依存関係: なし
# 作成日: 2025-08-14
# 最終更新: 2025-08-14
# Issue: #88 - ESLint警告ゼロ達成とTypeScript完全移行
# ================================================================

name: 🚀 CI/CD基盤

on:
  push:
    branches: [main, develop]
  pull_request:
    types: [opened, synchronize, reopened]
  schedule:
    - cron: '0 2 * * *' # 毎日AM2:00（JST AM11:00）
  workflow_dispatch:
    inputs:
      debug_enabled:
        description: 'デバッグモードを有効化'
        required: false
        default: 'false'
```

### ジョブ構造

```yaml
jobs:
  # ================================================================
  # ジョブ: セットアップ
  # 目的: 環境構築と依存関係のインストール
  # ================================================================
  setup:
    name: 🏗️ セットアップ
    runs-on: ubuntu-latest
    outputs:
      cache-hit: ${{ steps.cache.outputs.cache-hit }}

    steps:
      # リポジトリのチェックアウト
      - name: 📥 リポジトリのチェックアウト
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # 全履歴を取得

      # Node.js環境構築
      - name: 🏗️ Node.js環境構築
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      # 依存関係のキャッシュ
      - name: 📦 依存関係のキャッシュ確認
        id: cache
        uses: actions/cache@v3
        with:
          path: |
            node_modules
            ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-

      # 依存関係のインストール
      - name: 📦 依存関係のインストール
        if: steps.cache.outputs.cache-hit != 'true'
        run: npm ci --prefer-offline --no-audit
```

## 🎯 ベストプラクティス

### 1. 並列実行

```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]
    os: [ubuntu-latest, windows-latest, macos-latest]
```

### 2. 条件付き実行

```yaml
- name: 📊 カバレッジレポート生成
  if: github.event_name == 'pull_request'
  run: npm run test:coverage
```

### 3. アーティファクト管理

```yaml
- name: 📤 ビルド成果物のアップロード
  uses: actions/upload-artifact@v3
  with:
    name: build-artifacts
    path: dist/
    retention-days: 7
```

### 4. シークレット管理

```yaml
- name: 🔐 Supabase設定
  env:
    SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
  run: |
    echo "Supabase環境を設定しました"
```

## 📊 メトリクス収集

### 実行時間の記録

```yaml
- name: ⏱️ 実行時間記録
  id: timer
  run: |
    echo "start_time=$(date +%s)" >> $GITHUB_OUTPUT

# ... 処理 ...

- name: 📊 メトリクス送信
  run: |
    end_time=$(date +%s)
    duration=$((end_time - ${{ steps.timer.outputs.start_time }}))
    echo "実行時間: ${duration}秒"
```

### 成功率の追跡

```yaml
- name: 📈 成功率記録
  if: always()
  run: |
    if [ "${{ job.status }}" == "success" ]; then
      echo "✅ ジョブ成功"
    else
      echo "❌ ジョブ失敗"
    fi
```

## 🔔 通知設定

### Slack通知

```yaml
- name: 📢 Slack通知
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "ワークフロー失敗",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "❌ *${{ github.workflow }}* が失敗しました\n${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## 🛡️ セキュリティ

### 権限設定

```yaml
permissions:
  contents: read
  pull-requests: write
  issues: write
  actions: read
  checks: write
```

### 環境保護

```yaml
environment:
  name: production
  url: https://yusuke-kurosawa.github.io/PMPLearningManagement/
```

## 🔄 再利用可能ワークフロー

### 定義

```yaml
# .github/workflows/reusable-test.yml
on:
  workflow_call:
    inputs:
      node-version:
        required: false
        type: string
        default: '18'
    secrets:
      npm-token:
        required: false
```

### 使用

```yaml
jobs:
  test:
    uses: ./.github/workflows/reusable-test.yml
    with:
      node-version: '20'
    secrets:
      npm-token: ${{ secrets.NPM_TOKEN }}
```

## 📋 チェックリスト

### 新規ワークフロー作成時

- [ ] 命名規則に準拠
- [ ] 日本語コメント付与
- [ ] 標準ヘッダー記載
- [ ] キャッシュ設定
- [ ] エラーハンドリング
- [ ] メトリクス収集
- [ ] 適切な権限設定

### レビュー観点

- [ ] 実行効率
- [ ] セキュリティ
- [ ] 保守性
- [ ] 再利用性
- [ ] コスト最適化

## 🚫 アンチパターン

### 避けるべき実装

```yaml
# ❌ 悪い例: ハードコーディングされた値
- run: |
    API_KEY=abc123xyz
    curl https://api.example.com

# ✅ 良い例: シークレット使用
- run: |
    curl -H "Authorization: Bearer ${{ secrets.API_KEY }}" https://api.example.com
```

### 非効率な実装

```yaml
# ❌ 悪い例: キャッシュなし
- run: npm install

# ✅ 良い例: キャッシュ活用
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
- run: npm ci
```

## 📚 参考資料

- [GitHub Actions公式ドキュメント](https://docs.github.com/actions)
- [ワークフロー構文](https://docs.github.com/actions/reference/workflow-syntax-for-github-actions)
- [コンテキストと式構文](https://docs.github.com/actions/learn-github-actions/contexts)

---

最終更新: 2025-08-14
Issue: #92 - GitHub Actionsワークフロー規則の策定
