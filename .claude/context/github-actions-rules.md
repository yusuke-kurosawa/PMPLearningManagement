# GitHub Actions 統合ガイドライン

> **完全統合版**: この文書は開発者・Claude双方向けの統合ガイドラインです  
> **最終更新**: 2025-08-17  
> **Issue**: #80 - GitHub Actions完全準拠化

## 📚 概要

PMPLearningManagementプロジェクトのGitHub Actionsワークフローに関する統合ガイドラインです。開発者とClaude Codeエージェントの両方が参照し、一貫性のあるワークフロー作成・保守を実現します。

## 🎯 絶対的ルール（MUST）

### 1. 命名規則

#### ワークフロー名
```yaml
name: "{絵文字} {カテゴリ名} {具体的な処理内容}"
# 例: 🚀 CI - Main Build Pipeline
```

#### ファイル名
```
{数字2桁}-{カテゴリ英語}-{具体的処理英語}.yml
# 例: 01-ci-build-main.yml
```

#### 実際のカテゴリ番号体系:
- `00-meta-*`: メタ検証・オーケストレーション
- `01-{ci|core|deploy}-*`: CI/CD・ビルド・デプロイ
- `02-{quality|test|cd|performance}-*`: 品質・テスト・CD・パフォーマンス
- `03-security-*`: セキュリティ
- `04-{monitoring|integration|deployment|security}-*`: 監視・統合・追加デプロイ・セキュリティ
- `05-{automation|performance}-*`: 自動化・パフォーマンス
- `07-self-healing-*`: 自己修復
- `08-developer-*`: 開発支援
- `09-reusable-*`: 再利用可能コンポーネント

#### カテゴリ別絵文字マッピング:
- **00**: 🎯 (メタ・オーケストレーション)
- **01**: 🚀 (CI/Core/Deploy)  
- **02**: 🧪 (品質・テスト・パフォーマンス)
- **03**: 🔒 (セキュリティ)
- **04**: 📊 (監視・統合)
- **05**: 🤖 (自動化・パフォーマンス)
- **07**: ♻️ (自己修復)
- **08**: 🔧 (開発ツール)
- **09**: 🔄 (再利用可能コンポーネント)

### 2. 必須構造要素

#### トリガー設定
```yaml
on:
  # 基本トリガー（必要に応じて）
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  
  # 手動実行（必須）
  workflow_dispatch:
    inputs:
      debug:
        description: 'デバッグモードを有効にする'
        required: false
        default: 'false'
        type: 'boolean'

  # スケジュール実行（任意）
  schedule:
    - cron: '0 2 * * *'  # 毎日午前2時
```

#### 権限設定（必須）
```yaml
permissions:
  contents: read          # 必須最小権限
  actions: read          # Actions実行用
  checks: write          # ステータスチェック
  pull-requests: write   # PR操作（必要に応じて）
  security-events: write # セキュリティ（必要に応じて）
```

#### 並行実行制御（必須）
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}
```

#### ジョブ設定
```yaml
jobs:
  job-name:
    name: "🔧 日本語名: job-name"  # 日本語名必須
    runs-on: ubuntu-latest
    timeout-minutes: 15           # タイムアウト必須
```

### 3. セキュリティルール

#### シークレット管理
```yaml
# ✅ 正しい使用方法
env:
  API_KEY: ${{ secrets.API_KEY }}

# ❌ 絶対禁止
env:
  API_KEY: "sk-abcd1234..."  # ハードコーディング禁止
```

#### アクションバージョン固定
```yaml
# ✅ 正しい使用方法
uses: actions/checkout@v4
uses: actions/setup-node@v4

# ❌ 避けるべき
uses: actions/checkout@main    # @main, @master, @latest禁止
uses: custom/action@latest
```

### 4. ドキュメント要件

#### ファイルヘッダー（必須）
```yaml
# ====================================================================
# 🚀 ワークフロー名: CI - Main Build Pipeline
# ====================================================================
# 目的: メインブランチのビルドとテスト実行
#
# 実行タイミング:
#   - メインブランチへのプッシュ
#   - プルリクエスト作成・更新
#   - 手動実行
#
# 主な処理:
#   1. 環境セットアップ
#   2. 依存関係のインストール
#   3. リント・テスト実行
#   4. ビルド・パッケージング
#
# 依存関係: Node.js 18, npm
# 実行時間目安: 約10-15分
# 最終更新: 2025-08-17
# ====================================================================
```

#### 重要ステップのコメント
```yaml
steps:
  # リポジトリのチェックアウト（全履歴取得）
  - name: 📥 リポジトリのチェックアウト
    uses: actions/checkout@v4
    with:
      fetch-depth: 0  # セキュリティスキャンのため全履歴が必要
```

## 🔧 カスタムアクション

### アクション定義構造
```yaml
# .github/actions/{action-name}/action.yml
name: '🏗️ Action名（日本語）'
description: 'アクションの説明（日本語）'

inputs:
  input-name:
    description: '入力の説明'
    required: false
    default: 'default-value'

outputs:
  output-name:
    description: '出力の説明'

runs:
  using: 'composite'
  steps:
    - name: 実行ステップ
      run: echo "処理内容"
      shell: bash
```

### 利用可能なカスタムアクション
- `cache-dependencies/`: 依存関係キャッシュ管理
- `checkout-code/`: リポジトリコードのチェックアウト
- `setup-node/`: Node.js環境設定（統合版）
- `composite/build-optimize/`: ビルド最適化処理
- `composite/quality-gate/`: 品質ゲート検証
- `composite/setup-node-cache/`: Node.jsキャッシュ設定

### アクション使用例
```yaml
- name: 🏗️ Node.js環境セットアップ
  uses: ./.github/actions/setup-node
  with:
    node-version: '18'
    install-deps: 'true'
```

## 🛡️ セキュリティルール

### シークレット検出パターン
```bash
# 検出対象パターン
password\s*[:=]\s*["'][^"']+["']     # パスワード
api[_-]?key\s*[:=]\s*["'][^"']+["']  # APIキー
token\s*[:=]\s*["'][^"']+["']        # トークン
```

### アクション検証
```yaml
# セキュリティ検証済みアクション使用推奨
uses: actions/checkout@v4           # ✅ GitHub公式
uses: actions/setup-node@v4         # ✅ GitHub公式
uses: actions/cache@v4              # ✅ GitHub公式
uses: ./.github/actions/setup-node  # ✅ 自作アクション
```

## 📊 ベストプラクティス

### パフォーマンス最適化
```yaml
# キャッシュ戦略
- name: 📦 依存関係キャッシュ
  uses: actions/cache@v4
  with:
    path: |
      node_modules
      ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

# 並列実行
strategy:
  fail-fast: false
  matrix:
    test-type: [unit, integration, e2e]
```

### エラーハンドリング
```yaml
- name: 🧪 テスト実行
  run: |
    npm run test || test_exit_code=$?
    
    # 結果分析
    if [ "${test_exit_code:-0}" -ne 0 ]; then
      echo "❌ テスト失敗"
      exit $test_exit_code
    fi
```

### アーティファクト管理
```yaml
- name: 📤 テスト結果アップロード
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: test-results-${{ github.run_number }}
    path: |
      test-results.json
      coverage/
    retention-days: 30
```

## 🔍 トラブルシューティング

### よくある問題と解決方法

| 問題 | 原因 | 解決方法 |
|------|------|----------|
| `incomplete explicit mapping pair` | YAML構文エラー | 日本語文字列をクォートで囲む |
| `Missing permissions` | 権限不足 | `permissions:`セクション追加 |
| `workflow_dispatch not found` | 手動実行不可 | `workflow_dispatch:`トリガー追加 |
| セキュリティアラート | ハードコードされたシークレット | `${{ secrets.XXX }}`に変更 |

### YAML構文修正例
```yaml
# ❌ エラーになる例
name: 🔍 検証: ワークフロー発見と構文チェック

# ✅ 修正後
name: "🔍 検証: ワークフロー発見と構文チェック"
```

## 📋 コンプライアンスチェック

### 自動チェックツール
```bash
# 健康チェック実行
node scripts/github-actions-health-check.js

# コンプライアンス監視
node .github/workflows/scripts/guidelines-compliance-monitor.js

# 自動修正実行
node scripts/fix-workflow-compliance.js
```

### チェック項目
- [ ] 絵文字プレフィックス
- [ ] 日本語ジョブ名
- [ ] workflow_dispatch設定
- [ ] permissions設定
- [ ] concurrency設定
- [ ] timeout-minutes設定
- [ ] セキュリティ検証

## 🔄 継続的改善

### メトリクス収集
```yaml
- name: 📊 パフォーマンスメトリクス
  run: |
    echo "execution_time=${SECONDS}" >> $GITHUB_OUTPUT
    echo "build_size=$(du -sh dist | cut -f1)" >> $GITHUB_OUTPUT
```

### 定期見直し
- **週次**: ワークフロー実行統計レビュー
- **月次**: セキュリティ設定見直し
- **四半期**: アーキテクチャ改善検討

## 📚 参考リンク

### GitHub Actions公式
- [ワークフロー構文](https://docs.github.com/actions/reference/workflow-syntax-for-github-actions)
- [セキュリティガイド](https://docs.github.com/actions/security-guides)
- [ベストプラクティス](https://docs.github.com/actions/learn-github-actions/best-practices)

### プロジェクト内リンク
- [カスタムアクション詳細](../../.github/actions/README.md)
- [開発者向けGitHub Actionsリファレンス](../../docs/development/github-actions-reference.md)
- [GitHub Actionsヘルスチェック結果](../../github-actions-health-summary.md)

---

**このガイドラインは、プロジェクトの品質と保守性向上のため継続的に更新されます。**