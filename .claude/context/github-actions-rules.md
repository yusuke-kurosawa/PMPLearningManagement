# GitHub Actions ワークフロー開発ルール

## 📚 概要

PMPLearningManagementプロジェクトにおけるGitHub Actionsワークフローの統一開発・運用ルールです。Issue #79のDevOps基盤最適化により策定されました。

## 🎯 基本原則

### 1. 命名規則（必須）
```
ファイル名: {番号2桁}-{カテゴリ英語}-{処理内容英語}.yml
ワークフロー名: '{絵文字} {カテゴリ日本語} {処理内容日本語}'
```

**例:**
- ファイル: `01-core-ci-cd.yml`
- 名前: `📦 Core CI/CD Pipeline`

### 2. カテゴリ分類
| 番号 | カテゴリ | 用途 | 絵文字 |
|------|----------|------|--------|
| 00-09 | インフラ | 再利用可能ワークフロー、基盤 | 🔧 |
| 10-19 | CI/CD | ビルド、テスト、デプロイ | 📦 |
| 20-29 | 品質管理 | コードレビュー、品質チェック | 🔍 |
| 30-39 | セキュリティ | スキャン、監査 | 🔒 |
| 40-49 | IDD管理 | Issue-Driven Development | 📋 |
| 50-59 | モニタリング | メトリクス、監視 | 📊 |
| 60-69 | 自動化 | Claude統合、AI支援 | 🤖 |
| 70-79 | 運用管理 | メンテナンス、運用 | ⚙️ |

### 3. ファイル構造（必須）
```yaml
# ================================================================
# ワークフロー: [ワークフロー名]
# カテゴリ: [カテゴリ名]
# 目的: [簡潔な目的説明]
# トリガー: [実行トリガー]
# 依存関係: [主な依存関係]
# 作成者: [作成者]
# 最終更新: [YYYY-MM-DD]
# Issue: [関連Issue番号] - [Issue概要]
# ================================================================

name: '[絵文字] [ワークフロー名]'

on:
  # トリガー設定

env:
  # 環境変数

jobs:
  # ジョブ定義
```

## 🔒 セキュリティ要件（必須）

### 1. 権限管理
```yaml
permissions:
  contents: read          # 最小権限から開始
  actions: read          # 必要に応じて追加
  # その他必要な権限のみ明示的に付与
```

### 2. シークレット管理
- 平文でのシークレット記載禁止
- `${{ secrets.XXX }}`形式のみ使用
- 環境変数経由での安全な受け渡し

### 3. 外部アクション
- バージョン固定必須（タグまたはcommit SHA）
- ブランチ指定（`@main`等）禁止
- 信頼できるアクションのみ使用

## ⚡ パフォーマンス要件（推奨）

### 1. 実行時間最適化
- 目標: 10-15分以内
- 並行実行の活用
- キャッシュ戦略の実装

### 2. 並行制御
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true  # 適切に設定
```

### 3. キャッシュ活用
```yaml
- name: キャッシュ設定
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### 4. タイムアウト設定
```yaml
jobs:
  job-name:
    timeout-minutes: 30  # 適切なタイムアウト設定
```

## 🛡️ エラーハンドリング（必須）

### 1. リトライロジック
```yaml
- name: 外部API呼び出し（リトライ付き）
  run: |
    for attempt in 1 2 3; do
      if curl -f "https://api.example.com"; then
        break
      else
        echo "試行 $attempt 失敗"
        sleep $((attempt * 2))
      fi
    done
```

### 2. 失敗時の処理
```yaml
- name: 失敗時の処理
  if: failure()
  run: |
    echo "::error::ワークフロー実行失敗"
    # 適切なクリーンアップ処理
```

### 3. 条件付き実行
```yaml
- name: 条件付きステップ
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  run: echo "メインブランチのpush時のみ実行"
```

## 📝 コメントガイドライン（必須）

### 1. ファイルヘッダーコメント
- 必須項目: 目的、トリガー、依存関係、関連Issue
- 日本語での明確な説明

### 2. ジョブ・ステップコメント
- 各ジョブに日本語の説明
- 重要なステップに処理内容の説明
- エラーハンドリングの説明

### 3. 環境変数・シークレット
- 用途の明確な記述
- 設定方法の説明（必要に応じて）

## 🔄 再利用可能ワークフロー

### 1. 再利用可能ワークフローの活用
```yaml
jobs:
  call-reusable:
    uses: ./.github/workflows/00-reusable-workflows.yml
    with:
      workflow-type: 'full'
      node-version: '18'
```

### 2. 共通機能の抽出
- セットアップ処理
- 品質チェック
- ビルド処理
- セキュリティスキャン

## 🧪 テスト・検証

### 1. ワークフロー検証
```bash
# ローカルでの構文チェック
yamllint .github/workflows/*.yml

# GitHub CLIでの実行
gh workflow run [workflow-file]
```

### 2. 段階的デプロイ
1. 開発ブランチでのテスト
2. PRでの動作確認
3. メインブランチでの本格運用

## 📊 モニタリング・メトリクス

### 1. 実行時間監視
- ジョブ別実行時間
- 全体ワークフロー時間
- パフォーマンス劣化の検出

### 2. 成功率監視
- ワークフロー成功率
- 失敗原因の分析
- 継続的改善

## 🔧 メンテナンス

### 1. 定期見直し
- 月次でのワークフロー最適化
- 不要ワークフローの削除
- アクションバージョン更新

### 2. ドキュメント更新
- ルール変更時の文書更新
- 新規参加者向けガイド整備

## 📚 関連リソース

- [GitHub Actions公式ドキュメント](https://docs.github.com/ja/actions)
- [再利用可能ワークフロー: 00-reusable-workflows.yml](../../.github/workflows/00-reusable-workflows.yml)
- [IDD実装ガイド](../../docs/IDD_IMPLEMENTATION_STATUS.md)

---

**最終更新**: 2025-08-16  
**適用開始**: Issue #79解決時点  
**対象範囲**: 全GitHub Actionsワークフロー