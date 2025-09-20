# GitHub Actions ワークフロー命名規則

## 📖 概要

このドキュメントは、PMPLearningManagementプロジェクトのGitHub Actionsワークフローファイルの命名規則を定義します。一貫した命名規則により、ワークフローの目的と責務を明確化し、管理性を向上させます。

## 🏷️ 命名規則

### 基本フォーマット

```
{category}-{purpose}-{detail}.yml
```

- `category`: ワークフローのカテゴリ（必須）
- `purpose`: 主要な目的（必須）
- `detail`: 詳細な説明（オプション）

### カテゴリ一覧

| カテゴリ        | プレフィックス | 絵文字 | 説明                     | 例                                  |
| --------------- | -------------- | ------ | ------------------------ | ----------------------------------- |
| **CI**          | `ci-`          | 🔍     | 継続的インテグレーション | `ci-core-pipeline.yml`              |
| **CD**          | `cd-`          | 🚀     | 継続的デプロイメント     | `cd-production-deploy.yml`          |
| **Security**    | `security-`    | 🔒     | セキュリティ関連         | `security-dependency-scan.yml`      |
| **IDD**         | `idd-`         | 📋     | Issue-Driven Development | `idd-compliance-check.yml`          |
| **AI**          | `ai-`          | 🤖     | AI支援機能               | `ai-claude-review.yml`              |
| **Maintenance** | `maintenance-` | 🔧     | メンテナンス             | `maintenance-dependency-update.yml` |
| **Automation**  | `automation-`  | ⚡     | 自動化処理               | `automation-issue-labeling.yml`     |
| **Governance**  | `governance-`  | 🏛️     | ガバナンス               | `governance-compliance-audit.yml`   |

## 📝 命名例

### ✅ 適切な命名例

#### CI関連

- `ci-core-pipeline.yml` - メインCI/CDパイプライン
- `ci-pr-validation.yml` - プルリクエスト検証
- `ci-test-unit.yml` - ユニットテスト実行
- `ci-test-integration.yml` - インテグレーションテスト
- `ci-build-validation.yml` - ビルド検証

#### CD関連

- `cd-production-deploy.yml` - 本番環境デプロイ
- `cd-staging-deploy.yml` - ステージング環境デプロイ
- `cd-preview-deploy.yml` - プレビュー環境デプロイ

#### セキュリティ関連

- `security-dependency-scan.yml` - 依存関係脆弱性スキャン
- `security-code-analysis.yml` - コードセキュリティ分析
- `security-compliance-check.yml` - セキュリティコンプライアンス
- `security-secret-scan.yml` - シークレットスキャン

#### IDD関連

- `idd-compliance-check.yml` - IDD準拠チェック
- `idd-metrics-collection.yml` - メトリクス収集
- `idd-issue-automation.yml` - Issue自動化
- `idd-pr-validation.yml` - PR検証

#### AI関連

- `ai-claude-review.yml` - Claude AIコードレビュー
- `ai-assistant-support.yml` - AI支援機能
- `ai-quality-analysis.yml` - AI品質分析
- `ai-monitoring.yml` - AI機能監視

#### メンテナンス関連

- `maintenance-dependency-update.yml` - 依存関係更新
- `maintenance-cache-cleanup.yml` - キャッシュクリーンアップ
- `maintenance-health-check.yml` - ヘルスチェック
- `maintenance-backup.yml` - バックアップ処理

#### 自動化関連

- `automation-issue-labeling.yml` - Issue自動ラベリング
- `automation-pr-management.yml` - PR管理自動化
- `automation-notification.yml` - 通知自動化
- `automation-project-board.yml` - プロジェクトボード管理

#### ガバナンス関連

- `governance-compliance-audit.yml` - コンプライアンス監査
- `governance-policy-check.yml` - ポリシーチェック
- `governance-reporting.yml` - レポート生成

### ❌ 不適切な命名例

```yaml
# 悪い例
test.yml                    # カテゴリ不明、目的不明確
workflow1.yml              # 意味不明な命名
build-and-test.yml         # カテゴリプレフィックスなし
MyWorkflow.yml             # CamelCase使用
security_scan.yml          # アンダースコア使用
ci-everything.yml          # 責務が不明確
```

## 🔄 マイグレーション

### 既存ワークフローの移行

```bash
# 現在のファイル → 新しい命名規則

# CI関連
01-core-ci-cd.yml          → ci-core-pipeline.yml
pr-validation.yml          → ci-pr-validation.yml
test-data-management.yml   → ci-test-data-management.yml

# CD関連
deploy.yml                 → cd-production-deploy.yml

# セキュリティ関連
03-security-scan.yml       → security-dependency-scan.yml
dependency-health-check.yml → security-dependency-health.yml
infrastructure-security.yml → security-infrastructure-audit.yml

# IDD関連
idd-compliance.yml         → idd-compliance-check.yml
issue-driven-development.yml → idd-workflow-automation.yml
idd-metrics-collector.yml  → idd-metrics-collection.yml

# AI関連
06-claude-pr-review.yml    → ai-claude-review.yml
claude-assistant.yml       → ai-assistant-support.yml
ai-assisted-review.yml     → ai-quality-analysis.yml

# メンテナンス関連
dependabot-auto-merge.yml  → maintenance-dependency-merge.yml
performance-monitoring.yml → maintenance-performance-monitor.yml
observability.yml          → maintenance-observability.yml

# 自動化関連
project-board-automation.yml → automation-project-board.yml
notifications.yml          → automation-notification.yml
translate-issues.yml       → automation-issue-translation.yml

# ガバナンス関連
compliance-audit.yml       → governance-compliance-audit.yml
stakeholder-validation.yml → governance-stakeholder-validation.yml
```

### マイグレーション手順

1. **段階的移行**

```bash
# ステップ 1: 新しい命名でワークフローを複製
cp old-workflow.yml new-category-purpose.yml

# ステップ 2: 新しいワークフローをテスト
# テスト環境で動作確認

# ステップ 3: 古いワークフローを無効化
# ステップ 4: 古いワークフローを削除またはアーカイブ
```

2. **バッチ移行スクリプト**

```bash
# 一括移行スクリプトの実行
node scripts/workflow-naming-optimizer.js --apply
```

## 📊 ワークフローの整理

### ディレクトリ構造

```
.github/
├── workflows/
│   ├── ci-*.yml              # CI関連
│   ├── cd-*.yml              # CD関連
│   ├── security-*.yml        # セキュリティ関連
│   ├── idd-*.yml            # IDD関連
│   ├── ai-*.yml             # AI関連
│   ├── maintenance-*.yml    # メンテナンス関連
│   ├── automation-*.yml     # 自動化関連
│   ├── governance-*.yml     # ガバナンス関連
│   └── archive/             # 廃止されたワークフロー
│
└── actions/                 # Composite Actions
    ├── setup-node/
    ├── quality-check/
    ├── security-audit/
    └── idd-validator/
```

### 優先度による分類

#### 🔴 高優先度（コアワークフロー）

- `ci-core-pipeline.yml` - メインCI/CD
- `cd-production-deploy.yml` - 本番デプロイ
- `security-dependency-scan.yml` - セキュリティスキャン
- `idd-compliance-check.yml` - IDD準拠チェック

#### 🟡 中優先度（サポートワークフロー）

- `ci-pr-validation.yml` - PR検証
- `maintenance-dependency-update.yml` - 依存関係更新
- `ai-claude-review.yml` - AIレビュー

#### 🟢 低優先度（補助ワークフロー）

- `automation-notification.yml` - 通知自動化
- `governance-reporting.yml` - レポート生成

## 🔍 検証とチェック

### 命名規則チェックスクリプト

```javascript
// scripts/check-workflow-naming.js
const fs = require('fs')
const path = require('path')

const VALID_CATEGORIES = [
  'ci',
  'cd',
  'security',
  'idd',
  'ai',
  'maintenance',
  'automation',
  'governance',
]

function validateWorkflowNaming(filename) {
  // .yml拡張子チェック
  if (!filename.endsWith('.yml')) {
    return { valid: false, reason: '.yml拡張子が必要' }
  }

  // カテゴリプレフィックスチェック
  const hasValidCategory = VALID_CATEGORIES.some((cat) => filename.startsWith(`${cat}-`))

  if (!hasValidCategory) {
    return {
      valid: false,
      reason: `有効なカテゴリプレフィックスが必要: ${VALID_CATEGORIES.join(', ')}`,
    }
  }

  // ファイル名形式チェック（小文字、ハイフン区切り）
  const namePattern = /^[a-z]+(-[a-z0-9]+)*\.yml$/
  if (!namePattern.test(filename)) {
    return {
      valid: false,
      reason: '小文字とハイフンのみ使用可能',
    }
  }

  return { valid: true }
}
```

### Pre-commit Hook

```bash
#!/bin/sh
# .github/hooks/pre-commit

# ワークフローファイルの命名規則チェック
for file in .github/workflows/*.yml; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    if ! node scripts/check-workflow-naming.js "$filename"; then
      echo "❌ ワークフロー命名規則エラー: $filename"
      exit 1
    fi
  fi
done

echo "✅ ワークフロー命名規則チェック完了"
```

## 📚 ベストプラクティス

### 1. 命名の一貫性

- 同じカテゴリ内では一貫した命名パターンを使用
- 省略形は避け、明確で読みやすい名前を使用
- 英語での命名を基本とする

### 2. 責務の分離

- 1つのワークフローは1つの主要な責務を持つ
- 複数のカテゴリにまたがる場合は、主要な責務でカテゴリを決定
- 共通処理はComposite Actionとして分離

### 3. メンテナンス性

- 定期的に命名規則の見直しを実施
- 新しいカテゴリが必要な場合は、チーム内で協議
- 廃止されたワークフローはarchiveディレクトリに移動

### 4. ドキュメント化

- 各ワークフローにはYAMLコメントで目的を明記
- README.mdまたは専用ドキュメントでワークフローの概要を説明
- 命名規則の変更は必ずドキュメントを更新

## 🔄 定期レビュー

### 月次レビュー

- [ ] 新しく追加されたワークフローの命名規則チェック
- [ ] 実行頻度の低いワークフローの特定
- [ ] 命名規則違反の修正

### 四半期レビュー

- [ ] カテゴリの見直しと最適化
- [ ] 命名規則の更新検討
- [ ] アーカイブ対象ワークフローの整理

---

**最終更新**: 2025-08-14  
**作成者**: DevOps自動化システム  
**Issue**: #88 - ESLint警告ゼロ達成とTypeScript完全移行
