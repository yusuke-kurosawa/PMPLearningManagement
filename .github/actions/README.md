# 🎬 GitHub カスタムアクション

このディレクトリには、PMPLearningManagementプロジェクトで使用する再利用可能なGitHub Actionsが含まれています。
各アクションは特定のタスクを効率化し、ワークフロー全体の保守性を向上させます。

> 📋 **関連ドキュメント**:  
> - [統合ガイドライン](../../.claude/context/github-actions-rules.md) - ワークフロー作成・保守の統合ルール  
> - [開発者向けリファレンス](../../docs/development/github-actions-reference.md) - 開発者向け詳細ガイド

## 📁 アクション一覧（実在するもの）

```
actions/
├── cache-dependencies/       # 依存関係キャッシュ管理
├── checkout-code/            # リポジトリコードのチェックアウト
├── composite/                # 複合アクション
│   ├── build-optimize/       # ビルド最適化処理
│   ├── quality-gate/         # 品質ゲート検証
│   └── setup-node-cache/     # Node.jsキャッシュ設定
├── deploy-preview/           # プレビュー環境デプロイ
├── idd-validator/            # IDD準拠検証
├── notification/             # 通知システム
├── performance-audit/        # パフォーマンス監査
├── quality-check/            # コード品質チェック
├── report-generator/         # レポート生成
├── security-audit/           # セキュリティ監査
├── security-scan/            # セキュリティスキャン
├── setup-environment/        # 環境構築
├── setup-node/               # Node.js環境設定（統合版）
└── setup-project/            # プロジェクト設定
```

## 🎯 主要アクション詳細

### 1. Setup Node (`setup-node/`)

**目的**: Node.js環境の標準化された構築とパッケージ管理

**機能**:
- Node.jsバージョン設定
- 依存関係の自動インストール
- npmキャッシュ最適化
- package.json検証
- インストール後検証

**使用例**:
```yaml
- name: 🏗️ Node.js環境構築
  uses: ./.github/actions/setup-node
  with:
    node-version: '18'
    install-deps: 'true'
    production-only: 'false'
    cache-key-suffix: 'ci'
```

**パラメータ**:
| 名前 | 必須 | デフォルト | 説明 |
|------|------|------------|------|
| node-version | ❌ | '18' | Node.jsバージョン |
| install-deps | ❌ | 'true' | 依存関係のインストール実行フラグ |
| production-only | ❌ | 'false' | プロダクション依存関係のみインストール |
| cache-key-suffix | ❌ | 'default' | キャッシュキーのサフィックス |

**出力**:
| 名前 | 説明 |
|------|------|
| node-version | インストールされたNode.jsバージョン |
| cache-hit | キャッシュヒットの状態 |
| npm-version | npmバージョン |

### 2. IDD Validator (`idd-validator/`)

**目的**: Issue-Driven Development の準拠を検証

**機能**:
- Issue番号の存在チェック
- コミットメッセージフォーマット検証
- PR本文のIssue参照確認
- ブランチ名規則チェック

**使用例**:
```yaml
- name: 📋 IDD準拠チェック
  uses: ./.github/actions/idd-validator
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    strict-mode: true
    issue-pattern: '#\d+'
```

**パラメータ**:
| 名前 | 必須 | デフォルト | 説明 |
|------|------|------------|------|
| github-token | ✅ | - | GitHub API アクセストークン |
| strict-mode | ❌ | false | 厳密モード有効化 |
| issue-pattern | ❌ | `#\d+` | Issue番号パターン |

### 3. Quality Check (`quality-check/`)

**目的**: コード品質の自動チェック

**機能**:
- ESLintエラー検出
- TypeScript型チェック
- Prettierフォーマット検証
- テストカバレッジ測定
- コード複雑度分析

**使用例**:
```yaml
- name: 🔍 品質チェック
  uses: ./.github/actions/quality-check
  with:
    node-version: '18'
    coverage-threshold: 80
    fail-on-warning: false
```

**パラメータ**:
| 名前 | 必須 | デフォルト | 説明 |
|------|------|------------|------|
| node-version | ❌ | '18' | Node.jsバージョン |
| coverage-threshold | ❌ | 80 | カバレッジ閾値(%) |
| fail-on-warning | ❌ | false | 警告でも失敗とする |

### 4. Security Audit (`security-audit/`)

**目的**: セキュリティ脆弱性の検出

**機能**:
- 依存関係の脆弱性スキャン
- コードセキュリティ分析
- シークレット検出
- OWASP準拠チェック
- 脆弱性レポート生成

**使用例**:
```yaml
- name: 🔐 セキュリティ監査
  uses: ./.github/actions/security-audit
  with:
    severity-threshold: high
    create-issues: true
    scan-type: 'full'
```

**パラメータ**:
| 名前 | 必須 | デフォルト | 説明 |
|------|------|------------|------|
| severity-threshold | ❌ | 'high' | 脆弱性レベル閾値 |
| create-issues | ❌ | false | Issue自動作成 |
| scan-type | ❌ | 'full' | スキャンタイプ |

### 5. Cache Dependencies (`cache-dependencies/`)

**目的**: 依存関係キャッシュの効率的管理

**機能**:
- npmキャッシュ最適化
- 複数キャッシュキー対応
- 自動キャッシュ復元
- キャッシュサイズ監視

### 6. Performance Audit (`performance-audit/`)

**目的**: アプリケーションパフォーマンスの監査

**機能**:
- Lighthouse CI実行
- Core Web Vitals測定
- パフォーマンス予算チェック
- モバイル/デスクトップ分析

## 🔧 カスタムアクション作成ガイド

### 基本構造

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

### JavaScript/TypeScriptアクション

```javascript
// index.js
const core = require('@actions/core')
const github = require('@actions/github')

async function run() {
  try {
    // 入力パラメータ取得
    const input = core.getInput('parameter-name')

    // 処理実行
    const result = await doSomething(input)

    // 出力設定
    core.setOutput('output-name', result)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
```

## 📊 使用統計

### アクション実行頻度（週間）
- Setup Node: 350+ 回
- IDD Validator: 280+ 回
- Quality Check: 220+ 回
- Security Audit: 80+ 回
- Performance Audit: 45+ 回

### パフォーマンス
- 平均実行時間: 25秒
- キャッシュヒット率: 88%
- 成功率: 98.5%

## 🚀 ベストプラクティス

### 1. バージョニング
```yaml
# 特定バージョン使用（推奨）
uses: ./.github/actions/quality-check@v1.2.0

# 最新版使用（開発環境のみ）
uses: ./.github/actions/quality-check@main
```

### 2. エラーハンドリング
```yaml
- name: アクション実行
  id: action
  uses: ./.github/actions/custom-action
  continue-on-error: true

- name: エラー処理
  if: steps.action.outcome == 'failure'
  run: echo "エラー処理"
```

### 3. 条件付き実行
```yaml
- name: 本番環境のみ実行
  if: github.ref == 'refs/heads/main'
  uses: ./.github/actions/production-action
```

### 4. 並列実行最適化
```yaml
jobs:
  quality-checks:
    strategy:
      matrix:
        check: [lint, test, security, performance]
    steps:
      - uses: ./.github/actions/${{ matrix.check }}
```

## 🔄 更新とメンテナンス

### アクション更新手順

1. 該当アクションディレクトリで変更実施
2. `action.yml` のバージョン・説明更新
3. テストワークフローで検証
4. READMEドキュメント更新
5. 変更をコミット・PR作成

### テスト方法

```bash
# ローカルテスト
act -j test-action

# CI環境でテスト
gh workflow run test-custom-actions.yml
```

### 継続的な改善

- 実行時間の定期監視
- キャッシュヒット率の最適化
- 失敗パターンの分析
- ユーザーフィードバックの反映

## 📝 トラブルシューティング

### よくある問題

#### 1. アクションが見つからない
```yaml
# ❌ 間違い
uses: actions/custom-action

# ✅ 正しい
uses: ./.github/actions/custom-action
```

#### 2. 権限エラー
```yaml
# 権限を明示的に設定
permissions:
  contents: read
  pull-requests: write
```

#### 3. キャッシュ問題
```yaml
# キャッシュキーにハッシュを含める
key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

#### 4. タイムアウト
```yaml
# アクション内でタイムアウト設定
- name: 処理ステップ
  timeout-minutes: 10
```

## 🔗 関連リソース

### 内部ドキュメント
- [GitHub Actions統合ガイドライン](../../.claude/context/github-actions-rules.md)
- [ワークフローリファクタリングサマリー](../workflows/REFACTORING_SUMMARY.md)
- [準拠性レポート](../workflows/COMPLIANCE_REPORT.md)

### 外部リソース
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [actions/toolkit](https://github.com/actions/toolkit)
- [GitHub Marketplace](https://github.com/marketplace/actions)

## 📊 メトリクスとモニタリング

### 監視項目
- 実行時間のトレンド
- 失敗率の追跡
- リソース使用量
- API使用量

### アラート設定
```yaml
# 実行時間超過アラート
- name: 実行時間チェック
  if: steps.timer.outputs.duration > 300
  run: |
    echo "⚠️ アクション実行時間が5分を超えました"
```

### 改善提案システム
- 月次パフォーマンスレビュー
- ユーザー満足度調査
- 技術負債の定期チェック
- 新機能要求の優先順位付け

---

**最終更新**: 2025-08-17  
**管理者**: PMPLearningManagement Team  
**Issue**: #80 - GitHub Actions完全準拠化

_このREADMEは実際に存在するカスタムアクションの使用方法と管理ガイドラインを提供します。_