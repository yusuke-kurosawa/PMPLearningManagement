# GitHub Actions 統合ガイドライン 📋

## 概要

このドキュメントは、PMPLearningManagementプロジェクトにおけるGitHub Actionsワークフローとカスタムアクションの包括的なガイドラインです。開発者とClaudeが一貫性のある高品質なワークフローを作成するための絶対的なルールを定義します。

## 🎯 絶対的ルール（MUST FOLLOW）

### 1. 命名規則

#### ワークフロー名
```yaml
name: {絵文字} {カテゴリ名} {具体的な処理内容}
```

**カテゴリ別絵文字マッピング:**
- 🎯 メタ・検証
- 📦 CI/CD・ビルド・デプロイ
- 🧪 品質・テスト
- 🔒 セキュリティ
- 📊 監視・パフォーマンス・統合
- 🤖 自動化・AI支援
- ♻️ 自己修復
- 🔧 開発支援
- 🔄 再利用可能

#### ファイル名
```
{数字2桁}-{カテゴリ英語}-{具体的処理英語}.yml
```

**実際のカテゴリ番号体系:**
- `00-meta-*`: メタ検証・オーケストレーション
- `01-{ci|core|deploy}-*`: CI/CD・ビルド・デプロイ
- `02-{quality|test|cd|performance}-*`: 品質・テスト・CD・パフォーマンス
- `03-security-*`: セキュリティ
- `04-{monitoring|integration|deployment|security}-*`: 監視・統合・追加デプロイ・セキュリティ
- `05-{automation|performance}-*`: 自動化・パフォーマンス
- `07-self-healing-*`: 自己修復
- `08-developer-*`: 開発支援
- `09-reusable-*`: 再利用可能コンポーネント

### 2. 必須構造要素

#### ファイルヘッダー（必須）
```yaml
# ====================================================================
# {ワークフロー名} - {用途・目的}
# ====================================================================
# 目的: {このワークフローが達成する目標の詳細}
#
# 実行タイミング:
#   - {トリガー条件1の詳細}
#   - {トリガー条件2の詳細}
#
# 主な処理:
#   1. {処理ステップ1}
#   2. {処理ステップ2}
#   3. {処理ステップ3}
#
# 依存関係: {他のワークフローとの関係}
# 実行時間目安: 約{X}分
# 最終更新: {YYYY-MM-DD}
# ====================================================================
```

#### 権限設定（必須）
```yaml
permissions:
  contents: read # 最小権限の原則
  actions: read # 必要な場合のみ
  checks: write # 必要な場合のみ
  pull-requests: write # 必要な場合のみ
```

#### 並行実行制御（必須）
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}
```

#### 手動実行トリガー（必須）
```yaml
on:
  workflow_dispatch: # 必ず含める
  # その他のトリガー
```

#### タイムアウト設定（必須）
```yaml
jobs:
  build:
    timeout-minutes: 30 # 必須
    steps:
      - name: 長時間処理
        timeout-minutes: 10 # 推奨
```

### 3. セキュリティルール

#### シークレット管理
```yaml
# ✅ 正しい使用方法
env:
  API_KEY: ${{ secrets.API_KEY }}

# ❌ 禁止事項
env:
  API_KEY: "actual-secret-value"  # 絶対禁止
```

#### 外部アクション使用
```yaml
# ✅ 正しい使用方法
- uses: actions/checkout@v4
- uses: actions/setup-node@v4

# ❌ 禁止事項
- uses: actions/checkout@main # ブランチ指定禁止
- uses: random/action@latest # 未検証アクション禁止
```

#### インジェクション対策
```yaml
# ✅ 正しい使用方法
- name: 安全な入力処理
  env:
    USER_INPUT: ${{ github.event.inputs.data }}
  run: echo "$USER_INPUT"

# ❌ 禁止事項
- run: echo "${{ github.event.inputs.data }}" # 直接使用禁止
```

## 🔧 カスタムアクション

### アクション一覧（実在するもの）

```
actions/
├── cache-dependencies/       # 依存関係キャッシュ
├── checkout-code/           # コードチェックアウト
├── composite/
│   ├── build-optimize/      # ビルド最適化
│   ├── quality-gate/        # 品質ゲート
│   └── setup-node-cache/    # Node.jsキャッシュ設定
├── deploy-preview/          # プレビューデプロイ
├── idd-validator/           # IDD準拠検証
├── notification/            # 通知
├── performance-audit/       # パフォーマンス監査
├── quality-check/           # コード品質チェック
├── report-generator/        # レポート生成
├── security-audit/          # セキュリティ監査
├── security-scan/           # セキュリティスキャン
├── setup-environment/       # 環境構築
├── setup-node/              # Node.js環境設定
└── setup-project/           # プロジェクト設定
```

### 主要カスタムアクション

#### 1. Setup Node (`setup-node/`)
**目的**: Node.js環境の標準化された構築

**使用例**:
```yaml
- name: 🏗️ Node.js環境構築
  uses: ./.github/actions/setup-node
  with:
    node-version: '18'
    install-deps: 'true'
    production-only: 'false'
```

#### 2. IDD Validator (`idd-validator/`)
**目的**: Issue-Driven Development の準拠を検証

**使用例**:
```yaml
- name: 📋 IDD準拠チェック
  uses: ./.github/actions/idd-validator
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    strict-mode: true
```

#### 3. Quality Check (`quality-check/`)
**目的**: コード品質の自動チェック

**使用例**:
```yaml
- name: 🔍 品質チェック
  uses: ./.github/actions/quality-check
  with:
    node-version: '18'
    coverage-threshold: 80
```

#### 4. Security Audit (`security-audit/`)
**目的**: セキュリティ脆弱性の検出

**使用例**:
```yaml
- name: 🔐 セキュリティ監査
  uses: ./.github/actions/security-audit
  with:
    severity-threshold: high
    create-issues: true
```

### カスタムアクション作成ガイド

#### 基本構造
```yaml
# action.yml
name: 'アクション名'
description: 'アクションの説明'
author: 'PMPLearningManagement Team'

inputs:
  parameter-name:
    description: 'パラメータの説明'
    required: true
    default: 'デフォルト値'

outputs:
  output-name:
    description: '出力の説明'
    value: ${{ steps.step-id.outputs.value }}

runs:
  using: 'composite'
  steps:
    - name: ステップ名
      shell: bash
      run: |
        echo "実行内容"
```

## 🚫 禁止事項（MUST NOT）

1. **平文シークレット**: ハードコードされた認証情報
2. **無制限実行**: timeout設定なしのジョブ
3. **権限過多**: 不要な権限の付与
4. **未検証アクション**: 信頼できないサードパーティアクション
5. **日本語名なし**: ステップ名の英語のみ記載
6. **コメントなし**: 複雑な処理の説明省略
7. **エラー無視**: エラーハンドリングの欠如

## ✅ 品質チェックリスト

### 新規作成時
- [ ] 命名規則に従っている
- [ ] ファイルヘッダーが完備されている
- [ ] 権限設定が最小限である
- [ ] タイムアウトが設定されている
- [ ] 手動実行トリガーがある
- [ ] エラーハンドリングが実装されている
- [ ] 日本語コメントが適切である
- [ ] キャッシュ戦略が実装されている

### 修正時
- [ ] 既存の命名規則を維持している
- [ ] 変更内容がコメントに反映されている
- [ ] セキュリティが損なわれていない
- [ ] パフォーマンスが劣化していない
- [ ] 後方互換性が保たれている
- [ ] テストが追加/更新されている

## 📊 パフォーマンス目標

| ワークフロータイプ   | 目標実行時間 | 最大実行時間 |
| -------------------- | ------------ | ------------ |
| 単体テスト           | 5分          | 10分         |
| 統合テスト           | 10分         | 20分         |
| デプロイメント       | 15分         | 30分         |
| セキュリティスキャン | 5分          | 15分         |
| パフォーマンステスト | 10分         | 20分         |

## 🎯 ベストプラクティス

### 1. ジョブの分割
```yaml
jobs:
  # 独立したジョブは並列実行
  lint:
    runs-on: ubuntu-latest
    # ...

  test:
    runs-on: ubuntu-latest
    # ...

  build:
    needs: [lint, test] # 依存関係を明示
    runs-on: ubuntu-latest
    # ...
```

### 2. マトリクス戦略
```yaml
strategy:
  matrix:
    node: [18, 20]
    os: [ubuntu-latest, windows-latest]
  fail-fast: false # 一つ失敗しても継続
```

### 3. 条件付き実行
```yaml
- name: Production only step
  if: github.ref == 'refs/heads/main'
  run: |
    echo "本番環境へのデプロイ"
```

### 4. アーティファクト管理
```yaml
- name: Upload test results
  if: always() # 失敗時も実行
  uses: actions/upload-artifact@v4
  with:
    name: test-results
    path: test-results/
    retention-days: 7 # 保持期間を適切に設定
```

## 🔍 監視とメトリクス

### 追跡すべき指標
1. **成功率**: 過去30日間の成功率 > 95%
2. **実行時間**: P95 < 目標時間
3. **リソース使用**: 前月比改善
4. **キャッシュヒット率**: > 80%

### アラート設定
- 3回連続失敗時
- 実行時間が目標の2倍を超過時
- セキュリティスキャンで高リスク検出時

## 📝 トラブルシューティング

### よくある問題と解決策

#### 1. 権限エラー
```yaml
# 問題: "Resource not accessible by integration"
# 解決: 適切な権限を追加
permissions:
  contents: write # 必要な権限を追加
```

#### 2. キャッシュミス
```yaml
# 問題: キャッシュが効かない
# 解決: restore-keysを活用
restore-keys: |
  ${{ runner.os }}-node-
  ${{ runner.os }}-
```

#### 3. タイムアウト
```yaml
# 問題: ジョブがタイムアウト
# 解決: 処理を分割または並列化
jobs:
  parallel-job-1:
    # ...
  parallel-job-2:
    # ...
```

## 🔄 継続的改善

### ワークフロー改善プロセス

1. **分析フェーズ**
   - 現状の実行時間とリソース使用量を測定
   - ボトルネックの特定
   - 改善ポイントの洗い出し

2. **最適化フェーズ**
   - 並列化可能な処理の特定
   - キャッシュ戦略の見直し
   - 不要なステップの削除

3. **検証フェーズ**
   - 改善前後の比較
   - 安定性の確認
   - ドキュメントの更新

## 📚 関連ドキュメント

### 内部ドキュメント
- [カスタムアクション一覧](./../actions/README.md)
- [ワークフロー実装サマリー](./../../.github/workflows/REFACTORING_SUMMARY.md)
- [準拠性レポート](./../../.github/workflows/COMPLIANCE_REPORT.md)

### 外部リソース
- [GitHub Actions公式ドキュメント](https://docs.github.com/actions)
- [セキュリティベストプラクティス](https://docs.github.com/actions/security-guides)
- [パフォーマンス最適化ガイド](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions)

---

**最終更新**: 2025-08-17  
**管理者**: PMPLearningManagement Team  
**Issue**: #80 - GitHub Actions完全準拠化

_このドキュメントは、一貫性のある高品質なGitHub Actionsワークフローとカスタムアクションを作成するための統合ガイドラインです。これらのルールは例外なく適用されます。_