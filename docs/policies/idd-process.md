# Issue-Driven Development (IDD) プロセス規則

このドキュメントは、PMPLearningManagementプロジェクトのIDD（Issue-Driven Development）プロセス規則を定義します。

## 📝 基本原則

1. **すべての変更はIssueから開始**
2. **1 Issue = 1 Pull Request**
3. **コミットメッセージにIssue番号を含める**
4. **自動化による品質保証**
5. **継続的な改善とメトリクス収集**

## 🎯 IDD準拠率目標

- **目標準拠率**: 99%以上
- **現在の達成率**: 99%
- **測定頻度**: 毎日自動収集
- **レポート**: 週次でサマリー生成

## 📋 Issue管理

### Issue作成規則

#### タイトルフォーマット
```
[カテゴリ] 簡潔な説明
```

カテゴリ例:
- `[feat]`: 新機能
- `[fix]`: バグ修正
- `[docs]`: ドキュメント
- `[style]`: スタイル変更
- `[refactor]`: リファクタリング
- `[test]`: テスト
- `[chore]`: 雑務
- `[perf]`: パフォーマンス改善
- `[security]`: セキュリティ

#### Issue本文テンプレート
```markdown
## 概要
問題や要望の簡潔な説明

## 背景・動機
なぜこの変更が必要なのか

## 提案内容
具体的な実装方針や解決策

## 受入条件
- [ ] 条件1
- [ ] 条件2
- [ ] 条件3

## 関連Issue
- #XXX
- #YYY
```

### ラベル管理

#### 優先度ラベル
- `priority: critical` - 緊急対応必要
- `priority: high` - 高優先度
- `priority: medium` - 中優先度
- `priority: low` - 低優先度

#### タイプラベル
- `type: bug` - バグ
- `type: feature` - 新機能
- `type: enhancement` - 機能改善
- `type: documentation` - ドキュメント
- `type: maintenance` - メンテナンス

#### ステータスラベル
- `status: ready` - 作業開始可能
- `status: in-progress` - 作業中
- `status: review` - レビュー中
- `status: blocked` - ブロック中
- `status: done` - 完了

## 🔄 開発フロー

### 1. Issue作成
```bash
# GitHub CLIを使用
gh issue create --title "[feat] 新機能の追加" --body "詳細説明"

# ブラウザで作成
# GitHubリポジトリ > Issues > New Issue
```

### 2. ブランチ作成
```bash
# Issue番号を含むブランチ名
git checkout -b feature/issue-123-add-new-feature

# 命名規則
# <type>/issue-<number>-<description>
# type: feature, fix, docs, style, refactor, test, chore
```

### 3. 開発作業
```bash
# 作業開始時にIssueを自分にアサイン
gh issue edit 123 --add-assignee @me

# ステータス更新
gh issue edit 123 --add-label "status: in-progress"
```

### 4. コミット
```bash
# コミットメッセージフォーマット
git commit -m "feat: 新機能を追加 #123

- 詳細な変更内容1
- 詳細な変更内容2

Issue #123 を解決"

# 自動フォーマットチェック（Git Hook）
# .git/hooks/commit-msg が自動検証
```

### 5. プルリクエスト
```bash
# PR作成（Issue自動リンク）
gh pr create --title "feat: 新機能を追加" --body "Closes #123

## 変更内容
- 変更点1
- 変更点2

## テスト
- [x] 単体テスト追加
- [x] E2Eテスト確認

## チェックリスト
- [x] ESLintエラーなし
- [x] TypeScriptエラーなし
- [x] テスト全て成功"
```

### 6. レビュー・マージ
```bash
# レビュー依頼
gh pr review 456 --request-reviewer @reviewer

# 承認後のマージ
gh pr merge 456 --squash --delete-branch
```

## 🤖 自動化

### Git Hooks（ローカル）

#### pre-commit
```bash
#!/bin/bash
# Issue番号チェック
branch=$(git branch --show-current)
if ! echo "$branch" | grep -qE "issue-[0-9]+"; then
  echo "❌ ブランチ名にIssue番号が含まれていません"
  exit 1
fi
```

#### commit-msg
```bash
#!/bin/bash
# コミットメッセージにIssue番号チェック
if ! grep -qE "#[0-9]+" "$1"; then
  echo "❌ コミットメッセージにIssue番号が含まれていません"
  exit 1
fi
```

### GitHub Actions

#### IDD準拠チェック
```yaml
name: 📋 IDD準拠チェック

on:
  pull_request:
    types: [opened, edited, synchronize]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: 🔍 Issue参照チェック
        run: |
          if ! echo "${{ github.event.pull_request.body }}" | grep -qE "#[0-9]+|Closes #[0-9]+|Fixes #[0-9]+"; then
            echo "❌ PRにIssue参照が含まれていません"
            exit 1
          fi
```

## 📊 メトリクス

### 収集指標
- **Issue作成数**: 日次/週次/月次
- **Issue解決時間**: 平均/中央値
- **PR作成からマージまでの時間**: 平均
- **IDD準拠率**: コミット単位で測定
- **レビュー時間**: 平均応答時間

### レポート生成
```bash
# 日次レポート
npm run idd:report

# 週次サマリー
npm run idd:metrics

# KPI分析
npm run idd:kpi
```

## 🏆 ベストプラクティス

### Issue作成時
- 明確で具体的なタイトル
- 再現手順の記載（バグの場合）
- スクリーンショットや動画の添付
- 関連Issueのリンク

### PR作成時
- Issue番号の明記
- 変更内容の詳細説明
- テスト結果の記載
- レビューポイントの明示

### コミット時
- 小さく頻繁なコミット
- 意味のある単位でコミット
- わかりやすいメッセージ
- Issue番号の必須記載

## 🚫 アンチパターン

### 避けるべき行為
```bash
# ❌ Issue番号なしのコミット
git commit -m "バグ修正"

# ✅ Issue番号ありのコミット
git commit -m "fix: ログイン時のエラーを修正 #123"

# ❌ 巨大なPR
# 1000行以上の変更

# ✅ 適切なサイズのPR
# 200-300行程度の変更
```

## 📋 チェックリスト

### Issue作成前
- [ ] 既存Issueの重複確認
- [ ] 適切なテンプレート選択
- [ ] ラベルの付与
- [ ] マイルストーンの設定

### PR提出前
- [ ] Issue番号の記載
- [ ] テスト実行
- [ ] ESLintチェック
- [ ] TypeScriptチェック
- [ ] ドキュメント更新

### マージ前
- [ ] レビュー承認
- [ ] CI/CD成功
- [ ] IDD準拠チェック通過
- [ ] コンフリクト解決

## 🔧 ツール

### NPMスクリプト
```json
{
  "scripts": {
    "idd:setup": "IDD環境セットアップ",
    "idd:hooks:install": "Git Hooksインストール",
    "idd:check": "IDD準拠チェック",
    "idd:status": "現在のステータス表示",
    "idd:report": "レポート生成",
    "idd:metrics": "メトリクス分析",
    "idd:quality": "品質チェック"
  }
}
```

### GitHub CLI
```bash
# Issue操作
gh issue list
gh issue create
gh issue edit

# PR操作
gh pr list
gh pr create
gh pr review
gh pr merge

# ワークフロー操作
gh workflow list
gh workflow run
```

## 📚 参考資料

- [IDD実装ステータス](../../docs/IDD_IMPLEMENTATION_STATUS.md)
- [IDDエージェントガイドライン](../../docs/IDD_AGENT_GUIDELINES.md)
- [IDD自動化実装レポート](../../docs/IDD_AUTOMATION_IMPLEMENTATION_REPORT.md)

---

最終更新: 2025-08-14
Issue: #92 - IDDプロセス規則の策定