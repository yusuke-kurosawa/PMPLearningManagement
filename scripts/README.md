# Scripts Directory

Automation and maintenance scripts for the project, including GitHub Issues label management.

## Directory Structure

```
scripts/
├── label-system-design.json     # 新しいラベル体系の設計定義
├── update-labels.js             # ラベル更新スクリプト
├── update-issue-labels.js       # Issue ラベル更新スクリプト
├── label-backup-*.json          # ラベルバックアップファイル（自動生成）
├── issue-update-log-*.json      # Issue更新ログファイル（自動生成）
└── README.md                    # このファイル
```

## Scripts

### GitHub Issues Label Management

#### 🏷️ 新しいラベル体系

**カテゴリ構成:**

1. **type:** - イシューの種類 (7個)
2. **priority:** - 優先度レベル (4個)
3. **area:** - 技術領域・機能領域 (9個)
4. **status:** - 作業状況 (5個)
5. **size:** - 作業規模 (5個)
6. **特別なラベル** (7個)

**合計: 37個のラベル**（従来の42個から12%削減）

#### update-labels.js

- **Purpose**: GitHubラベルの完全更新（削除→作成）
- **Usage**: `node scripts/update-labels.js`
- **Features**:
  - 既存ラベルの自動バックアップ
  - 古いラベル体系の一括削除
  - 新しいラベル体系の一括作成
  - 詳細なログ出力とエラーハンドリング

#### update-issue-labels.js

- **Purpose**: 既存IssueのラベルAI推測更新
- **Usage**: `node scripts/update-issue-labels.js`
- **Features**:
  - Issueタイトル・内容からのAIラベル推測
  - 古いラベルから新しいラベルへのマッピング
  - 64個のIssue一括更新（成功率100%）
  - 更新ログの自動保存

#### label-system-design.json

- **Purpose**: ラベル体系の設計定義書
- **Features**:
  - 6つのカテゴリ定義
  - 色・説明の統一管理
  - 古いラベルマッピング定義

### 実行結果（2025-08-10）

```
✅ ラベル更新: 削除 42個, 作成 37個（成功率100%）
✅ Issue更新: 64個のIssue更新（成功率100%）
📈 効率化: ラベル数12%削減, 管理性向上
```

### 使用方法

```bash
# 前提条件: Node.js 18+, GitHub CLI認証済み

# ラベル体系を完全更新
node scripts/update-labels.js

# 既存issueのラベルを新体系に更新
node scripts/update-issue-labels.js

# 結果確認
gh label list --repo yusuke-kurosawa/PMPLearningManagement
gh issue list --repo yusuke-kurosawa/PMPLearningManagement
```

### Maintenance Scripts

#### health-check.sh

- **Purpose**: Monitors application health and availability
- **Usage**: `npm run health-check` or `./scripts/maintenance/health-check.sh`
- **Features**:
  - Checks application endpoint availability
  - Verifies key functionality
  - Reports system status

## Deployment Scripts

Deployment scripts have been moved to `config/deploy/` for better organization alongside other configuration files.

## Usage Guidelines

- All scripts should be executable (`chmod +x`)
- Include error handling and logging
- Document script parameters and options
- Test scripts in development before production use
- Follow consistent naming conventions
- Create backups before destructive operations
