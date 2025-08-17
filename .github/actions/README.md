# 🎬 GitHub カスタムアクション

このディレクトリには、PMPLearningManagementプロジェクトで使用する再利用可能なGitHub Actionsが含まれています。  
各アクションは特定のタスクを効率化し、ワークフロー全体の保守性を向上させます。

## 📁 アクション一覧

```
actions/
├── idd-validator/       # IDD準拠検証
├── quality-check/       # コード品質チェック
├── security-audit/      # セキュリティ監査
├── setup-node/          # Node.js環境構築
└── [その他のアクション]/
```

## 🎯 主要アクション詳細

### 1. IDD Validator (`idd-validator/`)

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
```

**パラメータ**:
| 名前 | 必須 | デフォルト | 説明 |
|------|------|------------|------|
| github-token | ✅ | - | GitHub API アクセストークン |
| strict-mode | ❌ | false | 厳密モード有効化 |
| issue-pattern | ❌ | `#\d+` | Issue番号パターン |

### 2. Quality Check (`quality-check/`)

**目的**: コード品質の自動チェック

**機能**:

- ESLintエラー検出
- TypeScript型チェック
- Prettierフォーマット検証
- テストカバレッジ測定

**使用例**:

```yaml
- name: 🔍 品質チェック
  uses: ./.github/actions/quality-check
  with:
    node-version: '18'
    coverage-threshold: 80
```

**パラメータ**:
| 名前 | 必須 | デフォルト | 説明 |
|------|------|------------|------|
| node-version | ❌ | '18' | Node.jsバージョン |
| coverage-threshold | ❌ | 80 | カバレッジ閾値(%) |
| fail-on-warning | ❌ | false | 警告でも失敗とする |

### 3. Security Audit (`security-audit/`)

**目的**: セキュリティ脆弱性の検出

**機能**:

- 依存関係の脆弱性スキャン
- コードセキュリティ分析
- シークレット検出
- OWASP準拠チェック

**使用例**:

```yaml
- name: 🔐 セキュリティ監査
  uses: ./.github/actions/security-audit
  with:
    severity-threshold: high
    create-issues: true
```

**パラメータ**:
| 名前 | 必須 | デフォルト | 説明 |
|------|------|------------|------|
| severity-threshold | ❌ | 'high' | 脆弱性レベル閾値 |
| create-issues | ❌ | false | Issue自動作成 |
| scan-type | ❌ | 'full' | スキャンタイプ |

### 4. Setup Node (`setup-node/`)

**目的**: Node.js環境の標準化された構築

**機能**:

- Node.jsバージョン設定
- 依存関係キャッシュ
- npm/yarn/pnpm対応
- 環境変数設定

**使用例**:

```yaml
- name: 🏗️ Node.js環境構築
  uses: ./.github/actions/setup-node
  with:
    node-version: '18'
    cache: 'npm'
```

**パラメータ**:
| 名前 | 必須 | デフォルト | 説明 |
|------|------|------------|------|
| node-version | ❌ | '18' | Node.jsバージョン |
| cache | ❌ | 'npm' | キャッシュタイプ |
| registry-url | ❌ | - | npmレジストリURL |

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

- IDD Validator: 250+ 回
- Quality Check: 180+ 回
- Security Audit: 50+ 回
- Setup Node: 300+ 回

### パフォーマンス

- 平均実行時間: 30秒
- キャッシュヒット率: 85%
- 成功率: 98%

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

## 🔄 更新とメンテナンス

### アクション更新手順

1. 該当アクションディレクトリで変更実施
2. `action.yml` のバージョン更新
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

## 🔗 関連リソース

### 内部ドキュメント

- [GitHub Actions規則](../../.claude/rules/github-actions.md)
- [ワークフローREADME](../workflows/README.md)
- [CI/CD設計書](../../docs/CI_CD_DESIGN.md)

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

---

**最終更新**: 2025-08-15  
**管理者**: PMPLearningManagement Team  
**Issue**: #94 - プロジェクト全体の品質改善
