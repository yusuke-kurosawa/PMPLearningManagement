# 📜 GitHub 管理スクリプト

このディレクトリには、GitHub リポジトリ管理を自動化するスクリプトが含まれています。  
ラベル管理、Issue処理、ワークフロー管理などの定型作業を効率化します。

## 📁 スクリプト一覧

```
scripts/
├── label-manager.js         # ラベル管理
├── issue-processor.js       # Issue自動処理
├── workflow-optimizer.js    # ワークフロー最適化
├── metrics-collector.js     # メトリクス収集
├── team-assigner.js        # チーム自動アサイン
├── release-notes.js        # リリースノート生成
└── dependency-updater.js   # 依存関係更新
```

## 🎯 主要スクリプト詳細

### 1. ラベル管理 (`label-manager.js`)

**機能**: GitHubラベルの一括管理・同期

**使用方法**:

```bash
# ラベル同期（定義ファイルから）
node .github/scripts/label-manager.js sync

# ラベルバックアップ
node .github/scripts/label-manager.js backup

# ラベル復元
node .github/scripts/label-manager.js restore

# 未使用ラベル削除
node .github/scripts/label-manager.js cleanup
```

**設定ファイル** (`labels-definition.json`):

```json
{
  "labels": [
    {
      "name": "type: bug",
      "color": "d73a4a",
      "description": "バグ・不具合"
    },
    {
      "name": "priority: high",
      "color": "ff0000",
      "description": "優先度：高"
    }
  ]
}
```

### 2. Issue処理 (`issue-processor.js`)

**機能**: Issueの自動処理とトリアージ

**自動処理内容**:

- 古いIssueのクローズ
- ラベル自動付与
- 優先度判定
- 担当者アサイン
- 通知送信

**使用方法**:

```bash
# 古いIssueをクローズ（90日以上非アクティブ）
node .github/scripts/issue-processor.js close-stale

# ラベル自動付与
node .github/scripts/issue-processor.js auto-label

# 優先度トリアージ
node .github/scripts/issue-processor.js triage

# 全処理実行
node .github/scripts/issue-processor.js all
```

**設定**:

```javascript
const config = {
  staleAfterDays: 90,
  warningAfterDays: 60,
  exemptLabels: ['pinned', 'security'],
  autoLabels: {
    bug: /bug|error|issue/i,
    feature: /feature|enhancement|add/i,
    documentation: /docs|documentation/i,
  },
}
```

### 3. ワークフロー最適化 (`workflow-optimizer.js`)

**機能**: GitHub Actionsワークフローの分析と最適化

**分析項目**:

- 実行時間統計
- 成功率分析
- コスト計算
- ボトルネック検出

**使用方法**:

```bash
# パフォーマンス分析
node .github/scripts/workflow-optimizer.js analyze

# 最適化提案生成
node .github/scripts/workflow-optimizer.js suggest

# 重複ワークフロー検出
node .github/scripts/workflow-optimizer.js find-duplicates

# レポート生成
node .github/scripts/workflow-optimizer.js report
```

**出力例**:

```
📊 ワークフロー分析レポート
========================
CI/CD Pipeline:
  - 平均実行時間: 8分23秒
  - 成功率: 94.5%
  - 月間実行回数: 450回
  - 推定コスト: $45.00

最適化提案:
✅ キャッシュ活用で2分短縮可能
✅ 並列実行で3分短縮可能
✅ 不要なステップ削除で1分短縮可能
```

### 4. メトリクス収集 (`metrics-collector.js`)

**機能**: プロジェクトメトリクスの収集と分析

**収集データ**:

- Issue/PR統計
- コミット頻度
- コントリビューター活動
- コード品質指標
- ビルド成功率

**使用方法**:

```bash
# 日次メトリクス収集
node .github/scripts/metrics-collector.js daily

# 週次レポート生成
node .github/scripts/metrics-collector.js weekly

# カスタム期間分析
node .github/scripts/metrics-collector.js --from 2025-01-01 --to 2025-08-15

# ダッシュボード更新
node .github/scripts/metrics-collector.js update-dashboard
```

**メトリクス例**:

```json
{
  "period": "2025-08-01 to 2025-08-15",
  "issues": {
    "created": 45,
    "closed": 38,
    "averageTimeToClose": "3.2 days"
  },
  "pullRequests": {
    "created": 62,
    "merged": 58,
    "averageTimeToMerge": "1.8 days"
  },
  "commits": {
    "total": 312,
    "perDay": 20.8
  }
}
```

### 5. チーム自動アサイン (`team-assigner.js`)

**機能**: スキルマトリックスに基づく自動担当者割り当て

**アサインロジック**:

```javascript
// スキルマトリックス
const teamSkills = {
  developer1: ['frontend', 'react', 'typescript'],
  developer2: ['backend', 'nodejs', 'database'],
  developer3: ['fullstack', 'devops', 'security'],
}

// マッチングアルゴリズム
function assignIssue(issue) {
  const requiredSkills = extractSkills(issue)
  const bestMatch = findBestMatch(requiredSkills, teamSkills)
  return bestMatch
}
```

**使用方法**:

```bash
# 新規Issueに担当者アサイン
node .github/scripts/team-assigner.js assign-new

# 再アサイン（負荷分散）
node .github/scripts/team-assigner.js rebalance

# スキルマトリックス更新
node .github/scripts/team-assigner.js update-skills
```

## 🔧 共通設定

### 環境変数 (`.env`)

```bash
# GitHub設定
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
GITHUB_OWNER=yusuke-kurosawa
GITHUB_REPO=PMPLearningManagement

# 通知設定
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
EMAIL_NOTIFICATIONS=true

# 実行設定
DRY_RUN=false
DEBUG=true
```

### GitHub CLI統合

```bash
# GitHub CLIを使用した実行
gh api repos/:owner/:repo/labels | node .github/scripts/label-manager.js process

# ワークフロー連携
gh workflow run process-issues.yml -f script=issue-processor.js
```

## 🚀 自動実行設定

### GitHub Actions での定期実行

```yaml
name: 🤖 自動管理タスク

on:
  schedule:
    # 毎日 AM 2:00 (JST 11:00)
    - cron: '0 2 * * *'
  workflow_dispatch:

jobs:
  auto-management:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: 🏷️ ラベル同期
        run: node .github/scripts/label-manager.js sync

      - name: 📋 Issue処理
        run: node .github/scripts/issue-processor.js all

      - name: 📊 メトリクス収集
        run: node .github/scripts/metrics-collector.js daily
```

## 📊 実行統計

### スクリプト実行頻度（月間）

| スクリプト         | 実行回数 | 成功率 | 平均時間 |
| ------------------ | -------- | ------ | -------- |
| label-manager      | 120      | 99%    | 5秒      |
| issue-processor    | 450      | 97%    | 12秒     |
| workflow-optimizer | 30       | 100%   | 45秒     |
| metrics-collector  | 60       | 98%    | 30秒     |

## 🛠️ 開発ガイド

### 新規スクリプト作成テンプレート

```javascript
#!/usr/bin/env node

/**
 * スクリプト名: script-name.js
 * 目的: スクリプトの目的
 * 作成日: YYYY-MM-DD
 * Issue: #XXX
 */

const { Octokit } = require('@octokit/rest')
const dotenv = require('dotenv')

// 環境変数読み込み
dotenv.config()

// GitHub API クライアント初期化
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

// メイン処理
async function main() {
  try {
    console.log('🚀 処理開始')

    // 処理実装

    console.log('✅ 処理完了')
  } catch (error) {
    console.error('❌ エラー:', error.message)
    process.exit(1)
  }
}

// 実行
if (require.main === module) {
  main()
}

module.exports = { main }
```

### テスト方法

```bash
# ドライラン（実際の変更なし）
DRY_RUN=true node .github/scripts/script-name.js

# デバッグモード
DEBUG=true node .github/scripts/script-name.js

# テスト実行
npm test .github/scripts/script-name.test.js
```

## 🔒 セキュリティ

### トークン管理

- GitHub Secrets で管理
- 最小権限の原則
- 定期的なローテーション

### 権限設定

```yaml
# 必要最小限の権限
permissions:
  issues: write
  pull-requests: read
  contents: read
```

## 📚 関連ドキュメント

### プロジェクト内

- [GitHub Actions README](../workflows/README.md)
- [ラベル管理ガイド](../LABEL_MANAGEMENT_GUIDE.md)
- [チームスキルマトリックス](../team-skills-matrix.json)

### 外部リソース

- [GitHub REST API](https://docs.github.com/rest)
- [Octokit Documentation](https://octokit.github.io/rest.js/)
- [GitHub CLI Manual](https://cli.github.com/manual/)

---

**最終更新**: 2025-08-15  
**管理者**: PMPLearningManagement Team  
**Issue**: #94 - プロジェクト全体の品質改善
