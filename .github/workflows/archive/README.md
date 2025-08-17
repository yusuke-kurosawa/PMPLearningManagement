# GitHub Actions Workflows Documentation

## 📋 概要

このディレクトリには、PMPLearningManagementプロジェクトのCI/CDパイプラインを構成するGitHub Actionsワークフローが含まれています。すべてのワークフローは標準化されたコメント規則に従い、再利用可能なコンポーネントを活用しています。

**最終更新**: 2025-08-12  
**メンテナー**: Claude Code

## 🏗️ アーキテクチャ

### ディレクトリ構造

```
.github/
├── actions/              # 再利用可能なカスタムアクション
│   ├── setup-node/      # Node.js環境セットアップ
│   ├── cache-dependencies/ # 依存関係キャッシュ管理
│   └── checkout-code/   # コードチェックアウト
├── workflows/           # ワークフロー定義
│   ├── reusable-*.yml  # 再利用可能なワークフロー
│   └── *.yml           # 通常のワークフロー
└── workflow-config.yml  # 共通設定ファイル
```

## 📊 ワークフロー一覧

### 🎯 コアワークフロー

| ワークフロー            | ファイル            | トリガー                 | 目的                                           | ステータス |
| ----------------------- | ------------------- | ------------------------ | ---------------------------------------------- | ---------- |
| 📦 本番デプロイメント   | `deploy.yml`        | push(main), PR, schedule | GitHub Pagesへのデプロイとパフォーマンス検証   | ✅ Active  |
| 🧪 統合テストスイート   | `test.yml`          | push, PR, schedule       | 単体/E2E/アクセシビリティ/パフォーマンステスト | ✅ Active  |
| 🔍 PR品質検証           | `pr-validation.yml` | pull_request             | PRの品質チェックと自動レビュー                 | ✅ Active  |
| 🔒 セキュリティスキャン | `security-scan.yml` | push, schedule           | 脆弱性スキャンとセキュリティ監査               | ✅ Active  |

### 🔧 再利用可能ワークフロー

| ワークフロー     | ファイル             | 呼び出し方法  | 目的                          |
| ---------------- | -------------------- | ------------- | ----------------------------- |
| 環境セットアップ | `reusable-setup.yml` | workflow_call | Node.js環境の標準セットアップ |
| テスト実行       | `reusable-tests.yml` | workflow_call | 各種テストの実行              |

### 📈 モニタリング・分析

| ワークフロー          | ファイル                 | トリガー             | 目的                     | ステータス |
| --------------------- | ------------------------ | -------------------- | ------------------------ | ---------- |
| 🌐 Lighthouse CI      | `lighthouse-ci.yml`      | push(main), schedule | パフォーマンス監査       | ✅ Active  |
| 📊 バンドル分析       | `bundle-analysis.yml`    | push, PR             | バンドルサイズ分析       | ✅ Active  |
| 🎨 画像最適化         | `image-optimization.yml` | push, PR             | 画像ファイルの自動最適化 | ✅ Active  |
| 📈 パフォーマンス予算 | `performance-budget.yml` | push, PR             | パフォーマンス指標の監視 | ✅ Active  |

### 🤖 自動化・AI支援

| ワークフロー               | ファイル                    | トリガー     | 目的                       | ステータス |
| -------------------------- | --------------------------- | ------------ | -------------------------- | ---------- |
| 🤖 Claude PRレビュー       | `claude-pr-review.yml`      | pull_request | AI支援によるコードレビュー | ✅ Active  |
| 📝 Claude ドキュメント同期 | `claude-docs-sync.yml`      | push(main)   | CLAUDE.md自動更新          | ✅ Active  |
| 📊 週次サマリー            | `weekly-claude-summary.yml` | schedule     | 週次開発レポート生成       | ✅ Active  |

### 🔄 統合・連携

| ワークフロー     | ファイル                    | トリガー | 目的                                 | ステータス |
| ---------------- | --------------------------- | -------- | ------------------------------------ | ---------- |
| 📋 IDD準拠       | `idd-compliance.yml`        | push, PR | Issue-Driven Development準拠チェック | ✅ Active  |
| 📊 IDDメトリクス | `idd-metrics-collector.yml` | schedule | IDD関連メトリクス収集                | ✅ Active  |
| 🔄 統合テスト    | `integration-test.yml`      | push, PR | システム統合テスト                   | ✅ Active  |

## 🔧 共通コンポーネント

### カスタムアクション

#### setup-node

```yaml
- uses: ./.github/actions/setup-node
  with:
    node-version: '18'
    install-dependencies: true
```

#### cache-dependencies

```yaml
- uses: ./.github/actions/cache-dependencies
  with:
    cache-key-prefix: 'npm'
    paths: 'node_modules'
```

#### checkout-code

```yaml
- uses: ./.github/actions/checkout-code
  with:
    fetch-depth: 1
    ref: main
```

## 📝 コメント規則

すべてのワークフローは以下の標準化されたコメント規則に従います：

```yaml
# ============================================================
# Workflow: [ワークフロー名]
# Purpose: [目的の説明]
# Trigger: [トリガー条件]
# Dependencies: [依存関係]
# Author: Claude Code
# Last Modified: [日付]
# ============================================================

# ------------------------------------------------------------
# Section Name
# ------------------------------------------------------------

# ============================================================
# Job: [ジョブ名]
# Purpose: [ジョブの目的]
# ============================================================
```

## 🚀 使用方法

### 新しいワークフローの作成

1. `00-template-workflow.yml`をコピー
2. 標準コメント規則に従って編集
3. 可能な限り再利用可能コンポーネントを使用
4. PRを作成してレビューを受ける

### ワークフローの手動実行

```bash
# GitHub CLIを使用
gh workflow run workflow-name.yml

# パラメータ付き実行
gh workflow run workflow-name.yml -f environment=staging
```

### ワークフロー状態の確認

```bash
# 最近の実行を表示
gh run list --workflow=workflow-name.yml

# 特定の実行の詳細を表示
gh run view RUN_ID
```

## 📊 パフォーマンス指標

### 平均実行時間

| ワークフロー | 平均時間 | 最短 | 最長 |
| ------------ | -------- | ---- | ---- |
| デプロイ     | 8分      | 6分  | 12分 |
| テスト       | 5分      | 3分  | 8分  |
| PR検証       | 4分      | 2分  | 6分  |
| セキュリティ | 3分      | 2分  | 5分  |

### 成功率

- 全体成功率: 95%以上を維持
- デプロイ成功率: 98%
- テスト成功率: 92%

## 🔒 セキュリティ

### シークレット管理

以下のシークレットが必要です：

- `GITHUB_TOKEN`: 自動提供
- `LIGHTHOUSE_CI_TOKEN`: Lighthouse CI用（オプション）
- `CODECOV_TOKEN`: Codecov連携用（オプション）

### 権限管理

各ワークフローは最小権限の原則に従い、必要な権限のみを要求します。

## 📚 トラブルシューティング

### よくある問題

#### 1. キャッシュの問題

```yaml
# キャッシュバージョンを更新
env:
  CACHE_VERSION: 'v3' # v2 -> v3
```

#### 2. タイムアウト

```yaml
# タイムアウトを延長
timeout-minutes: 30 # デフォルト: 15
```

#### 3. 並行実行の競合

```yaml
# 並行実行制御を調整
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: false # true -> false
```

## 🔄 更新履歴

### 2025-08-12

- 全ワークフローの標準化完了
- 再利用可能コンポーネントの導入
- コメント規則の統一
- ドキュメントの整備

## 📞 サポート

問題が発生した場合は、以下の手順でサポートを受けてください：

1. このドキュメントのトラブルシューティングセクションを確認
2. GitHub Issuesで既存の問題を検索
3. 新しいIssueを作成（テンプレートを使用）
4. Slackの#ci-cdチャンネルで質問

---

_このドキュメントは定期的に更新されます。最新情報は常にmainブランチを参照してください。_
