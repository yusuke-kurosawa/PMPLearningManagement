# GitHub Actions Workflow Naming Convention

## 命名規則

### カテゴリ別プレフィックス

すべてのワークフローファイルは以下のプレフィックスで始める必要があります：

| プレフィックス | カテゴリ | 説明 |
|------------|---------|------|
| `01-core-` | Core CI/CD | ビルド、テスト、デプロイの基本ワークフロー |
| `02-quality-` | Quality Assurance | コード品質、テスト、カバレッジ |
| `03-security-` | Security | セキュリティスキャン、脆弱性チェック |
| `04-performance-` | Performance | パフォーマンス監視、最適化 |
| `05-automation-` | Automation | 自動化タスク、Issue/PR管理 |
| `06-monitoring-` | Monitoring | 監視、アラート、分析 |
| `07-compliance-` | Compliance | コンプライアンス、ガバナンス |
| `08-claude-` | Claude Integration | Claude AI関連の統合 |
| `09-experimental-` | Experimental | 実験的、先進的な機能 |

### ファイル名形式

```
{prefix}{feature-name}.yml
```

例：
- `01-core-deploy.yml`
- `02-quality-test-coverage.yml`
- `03-security-vulnerability-scan.yml`
- `08-claude-pr-review.yml`

### ワークフロー名（name フィールド）

```yaml
name: "[Category] Feature Name"
```

例：
```yaml
name: "[Core CI/CD] Production Deployment"
name: "[Quality] Code Coverage Analysis"
name: "[Security] Dependency Vulnerability Scan"
name: "[Claude] PR Review Assistant"
```

## 標準コメント構造

### ファイルヘッダー

すべてのワークフローファイルは以下のヘッダーコメントを含める必要があります：

```yaml
# ============================================================================
# Workflow Name: [Category] Feature Name
# Description: 簡潔な説明（1-2行）
# Category: Core CI/CD | Quality | Security | Performance | Automation | etc.
# Triggers: push | pull_request | schedule | workflow_dispatch | etc.
# Dependencies: 依存する他のワークフロー、Actions、サービス
# Maintainer: @username or team name
# Last Updated: YYYY-MM-DD
# ============================================================================
```

### セクション区切り

主要なセクションは以下のように区切ります：

```yaml
# ----------------------------------------------------------------------------
# Environment Configuration
# ----------------------------------------------------------------------------

# ----------------------------------------------------------------------------
# Job: Build and Test
# Purpose: アプリケーションのビルドとテスト実行
# ----------------------------------------------------------------------------

# ----------------------------------------------------------------------------
# Step: Setup Node.js
# Purpose: Node.js環境のセットアップ
# ----------------------------------------------------------------------------
```

### インラインコメント

複雑なロジックや重要な設定には必ずコメントを追加：

```yaml
steps:
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: '18'  # LTS version, 更新時は package.json も確認
      cache: 'npm'         # 依存関係のキャッシュによりビルド時間を短縮
```

## ワークフロー内部構造

### 1. メタデータセクション

```yaml
name: "[Category] Feature Name"
run-name: "${{ github.actor }} triggered [Feature Name] on ${{ github.ref }}"

on:
  # トリガー条件を明確に記述
  push:
    branches: [main]
    paths:
      - 'src/**'  # ソースコード変更時のみ実行
```

### 2. 環境変数セクション

```yaml
env:
  # グローバル環境変数
  NODE_VERSION: '18'
  TIMEZONE: 'Asia/Tokyo'
```

### 3. ジョブセクション

```yaml
jobs:
  # ジョブ名は snake_case で記述
  build_and_test:
    name: "Build and Test"  # 表示名は Title Case
    runs-on: ubuntu-latest
    
    # 実行条件を明確に
    if: github.event_name == 'push' || github.event.pull_request.draft == false
```

### 4. ステップセクション

```yaml
steps:
  # チェックアウト（必須）
  - name: "📥 Checkout Code"
    uses: actions/checkout@v4
    with:
      fetch-depth: 0  # 全履歴を取得（必要な場合のみ）

  # セットアップ
  - name: "🔧 Setup Environment"
    # ...

  # ビルド
  - name: "🏗️ Build Application"
    # ...

  # テスト
  - name: "🧪 Run Tests"
    # ...

  # レポート
  - name: "📊 Generate Reports"
    # ...
```

## アイコン使用ガイドライン

ステップ名に絵文字を使用して視認性を向上：

| 用途 | アイコン | 例 |
|-----|---------|-----|
| チェックアウト | 📥 | `📥 Checkout Code` |
| セットアップ | 🔧 | `🔧 Setup Node.js` |
| ビルド | 🏗️ | `🏗️ Build Application` |
| テスト | 🧪 | `🧪 Run Tests` |
| セキュリティ | 🔒 | `🔒 Security Scan` |
| デプロイ | 🚀 | `🚀 Deploy to Production` |
| 通知 | 📢 | `📢 Send Notification` |
| レポート | 📊 | `📊 Generate Report` |
| キャッシュ | 💾 | `💾 Cache Dependencies` |
| クリーンアップ | 🧹 | `🧹 Cleanup Resources` |

## ベストプラクティス

### 1. 再利用可能なワークフロー

共通処理は再利用可能なワークフローとして定義：

```yaml
# .github/workflows/reusable-test.yml
name: "[Reusable] Test Suite"
on:
  workflow_call:
    inputs:
      node-version:
        required: false
        type: string
        default: '18'
```

### 2. シークレット管理

```yaml
env:
  # シークレットは明示的にコメント
  API_KEY: ${{ secrets.API_KEY }}  # 外部API認証用
  DATABASE_URL: ${{ secrets.DATABASE_URL }}  # 本番DB接続文字列
```

### 3. エラーハンドリング

```yaml
- name: "🚀 Deploy"
  id: deploy
  continue-on-error: true  # エラーでも続行
  run: |
    npm run deploy
    
- name: "📢 Notify Failure"
  if: steps.deploy.outcome == 'failure'
  run: |
    echo "Deployment failed, sending notification..."
```

### 4. マトリックスビルド

```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]  # 複数バージョンでテスト
    os: [ubuntu-latest, windows-latest]
  fail-fast: false  # 一つ失敗しても他は続行
```

## 移行ガイド

既存のワークフローを新しい命名規則に移行する手順：

1. ワークフローの分類（カテゴリ決定）
2. 新しいファイル名の決定
3. ヘッダーコメントの追加
4. セクションコメントの追加
5. ステップ名の更新（アイコン追加）
6. 古いファイルの削除

## チェックリスト

新規ワークフロー作成時のチェックリスト：

- [ ] カテゴリプレフィックスが正しい
- [ ] ファイル名が命名規則に従っている
- [ ] ヘッダーコメントが完備している
- [ ] セクション区切りコメントがある
- [ ] 複雑なロジックにインラインコメントがある
- [ ] ステップ名にアイコンが使用されている
- [ ] エラーハンドリングが適切
- [ ] シークレットが適切に管理されている
- [ ] 再利用可能な部分が抽出されている

---

最終更新: 2025-08-12
メンテナー: Claude Code Assistant