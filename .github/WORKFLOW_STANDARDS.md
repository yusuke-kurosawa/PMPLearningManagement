# 📋 GitHub Actions ワークフロー標準化ガイド

**バージョン**: 1.0.0  
**最終更新**: 2025-08-12  
**作成者**: Claude Code

## 🎯 目的

このドキュメントは、PMPLearningManagementプロジェクトにおけるGitHub Actionsワークフローの標準化ガイドラインを定義します。すべてのワークフローはこの標準に従って作成・更新されます。

## 📁 ディレクトリ構造

```
.github/
├── actions/                    # 再利用可能なカスタムアクション
│   ├── setup-environment/      # 環境セットアップ
│   ├── quality-check/          # 品質チェック
│   ├── notification/           # 通知処理
│   └── report-generator/       # レポート生成
├── workflows/                  # ワークフロー定義
│   ├── 01-quality-*.yml       # 品質関連
│   ├── 02-performance-*.yml   # パフォーマンス関連
│   ├── 03-security-*.yml      # セキュリティ関連
│   ├── 04-integration-*.yml   # 統合テスト関連
│   └── 05-deploy-*.yml        # デプロイ関連
└── WORKFLOW_STANDARDS.md       # このドキュメント
```

## 🏷️ 命名規則

### ワークフローファイル名

```
{番号2桁}-{カテゴリ}-{具体的な処理}.yml
```

**例**:

- `01-quality-comprehensive-check.yml`
- `02-performance-optimization.yml`
- `03-security-comprehensive-scan.yml`

### ワークフロー名（name フィールド）

```yaml
name: '{絵文字} {日本語名} / {英語名}'
```

**例**:

```yaml
name: '🎯 包括的品質チェック / Comprehensive Quality Check'
```

### ジョブ名

```yaml
jobs:
  job-id:
    name: '{絵文字} {日本語名} / {英語名}'
```

## 📝 コメント規則

### ファイルヘッダー

```yaml
# ================================================================
# ワークフロー名: {ファイル名}
# 目的: {ワークフローの目的}
# トリガー: {実行条件}
# 依存関係: {他のワークフローやアクションとの関係}
# 作成者: Claude Code
# 最終更新: {日付}
# ================================================================
```

### セクションコメント

```yaml
# ============================================================
# セクション名
# Section name in English
# ============================================================
```

### インラインコメント

```yaml
- name: 'ステップ名'
  # 処理の説明（日本語）
  # Description in English
```

## 🔒 セキュリティ要件

### 1. 最小権限の原則

```yaml
permissions:
  contents: read # 必要最小限の権限のみ
  issues: write # 明示的に指定
```

### 2. シークレット管理

```yaml
env:
  API_KEY: ${{ secrets.API_KEY }} # secrets経由のみ
  # ハードコードは絶対禁止
```

### 3. 外部アクション

```yaml
- uses: actions/checkout@v4 # バージョン固定
- uses: actions/setup-node@abc123 # またはcommit SHA
# - uses: actions/checkout@main    # NG: ブランチ指定禁止
```

## ⚡ パフォーマンス最適化

### 1. 並行実行制御

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true # 古い実行をキャンセル
```

### 2. キャッシュ戦略

```yaml
- name: 'キャッシュ設定'
  uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### 3. タイムアウト設定

```yaml
jobs:
  test:
    timeout-minutes: 30 # 明示的なタイムアウト
    steps:
      - name: 'ステップ'
        timeout-minutes: 10 # ステップ単位も可能
```

## 🔄 再利用可能コンポーネント

### カスタムアクション使用例

```yaml
- name: '環境セットアップ'
  uses: ./.github/actions/setup-environment
  with:
    node-version: '18'
    cache-key: 'my-cache'

- name: '品質チェック'
  uses: ./.github/actions/quality-check
  with:
    check-type: 'all'
    threshold: 80

- name: '通知送信'
  uses: ./.github/actions/notification
  with:
    status: ${{ job.status }}
    title: '処理完了'
```

### 再利用可能ワークフロー

```yaml
jobs:
  call-reusable:
    uses: ./.github/workflows/reusable-test.yml
    with:
      environment: 'production'
    secrets: inherit
```

## 📊 出力とレポート

### GitHub Step Summary

```yaml
- name: 'サマリー出力'
  run: |
    cat >> $GITHUB_STEP_SUMMARY <<EOF
    ## 📊 結果サマリー

    | メトリクス | 値 |
    |-----------|-----|
    | テスト | ✅ 成功 |
    | カバレッジ | 85% |
    EOF
```

### アーティファクト

```yaml
- name: 'アーティファクトアップロード'
  uses: actions/upload-artifact@v4
  with:
    name: report-${{ github.run_id }}
    path: reports/
    retention-days: 30 # 保持期間を明示
```

## 🚨 エラーハンドリング

### 基本的なエラーハンドリング

```yaml
- name: 'エラーハンドリング例'
  id: step1
  continue-on-error: true # エラーでも続行
  run: |
    command || echo "failed=true" >> $GITHUB_OUTPUT

- name: 'エラー時の処理'
  if: steps.step1.outputs.failed == 'true'
  run: |
    echo "エラーが発生しました"
    # リカバリー処理
```

### リトライロジック

```yaml
- name: 'リトライ付き処理'
  uses: nick-invision/retry@v2
  with:
    timeout_minutes: 10
    max_attempts: 3
    command: npm test
```

## 📋 品質チェックリスト

新規ワークフロー作成時は以下を確認：

### 必須項目

- [ ] ファイル名が命名規則に従っている
- [ ] ワークフロー名に絵文字と日英表記がある
- [ ] ヘッダーコメントが記載されている
- [ ] permissions が最小権限で設定されている
- [ ] timeout-minutes が設定されている
- [ ] concurrency が適切に設定されている

### 推奨項目

- [ ] キャッシュが活用されている
- [ ] エラーハンドリングが実装されている
- [ ] GitHub Step Summary が出力されている
- [ ] アーティファクトの保持期間が設定されている
- [ ] 再利用可能コンポーネントを活用している

### セキュリティ

- [ ] シークレットがハードコードされていない
- [ ] 外部アクションがバージョン固定されている
- [ ] ユーザー入力が適切にサニタイズされている

## 📚 ワークフローテンプレート

### 基本テンプレート

```yaml
# ================================================================
# ワークフロー名: XX-category-specific-task.yml
# 目的: [目的を記載]
# トリガー: [トリガー条件を記載]
# 依存関係: [依存関係を記載]
# 作成者: Claude Code
# 最終更新: YYYY-MM-DD
# ================================================================

name: '🎯 タスク名 / Task Name'

on:
  push:
    branches: [main, develop]
  pull_request:
    types: [opened, synchronize, reopened]
  workflow_dispatch:

env:
  NODE_VERSION: '18'

permissions:
  contents: read

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  main-job:
    name: '📋 メインジョブ / Main Job'
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      # ============================================================
      # Step 1: セットアップ
      # Setup
      # ============================================================
      - name: '📥 チェックアウト / Checkout'
        uses: actions/checkout@v4

      - name: '🔧 環境セットアップ / Setup Environment'
        uses: ./.github/actions/setup-environment
        with:
          node-version: ${{ env.NODE_VERSION }}

      # ============================================================
      # Step 2: メイン処理
      # Main process
      # ============================================================
      - name: '🚀 メイン処理 / Main Process'
        id: main
        run: |
          echo "処理を実行"

      # ============================================================
      # Step 3: レポート
      # Report
      # ============================================================
      - name: '📊 レポート生成 / Generate Report'
        if: always()
        uses: ./.github/actions/report-generator
        with:
          report-type: 'summary'
```

## 🔧 メンテナンス

### 定期レビュー

- 月1回: ワークフローの実行時間とコストをレビュー
- 四半期ごと: 依存関係の更新と非推奨機能の確認
- 年1回: 標準化ガイドラインの見直し

### パフォーマンス監視

```bash
# ワークフロー実行時間の確認
gh run list --workflow=workflow-name.yml --json conclusion,createdAt,updatedAt \
  | jq '.[] | {conclusion, duration: (.updatedAt | fromdateiso8601) - (.createdAt | fromdateiso8601)}'
```

### コスト最適化

- 不要なワークフローの無効化
- キャッシュの積極的活用
- マトリクステストの最適化
- アーティファクトの保持期間短縮

## 📞 サポート

### トラブルシューティング

1. [GitHub Actions ドキュメント](https://docs.github.com/actions)を確認
2. `.github/workflows/README.md`のトラブルシューティングセクションを参照
3. GitHub Issuesで既知の問題を検索
4. 新しいIssueを作成（`workflow`ラベルを付与）

### 改善提案

このガイドラインの改善提案は歓迎します：

1. Issueを作成（`documentation`と`workflow`ラベルを付与）
2. 具体的な改善案を記載
3. 可能であればPRを作成

---

_このドキュメントは定期的に更新されます。最新版は常にmainブランチを参照してください。_
