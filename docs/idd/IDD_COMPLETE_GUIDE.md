# 📚 IDD（Issue-Driven Development）完全ガイド

## 目次

1. [概要](#概要)
2. [IDD基本原則](#idd基本原則)
3. [実装ガイド](#実装ガイド)
4. [自動化システム](#自動化システム)
5. [ベストプラクティス](#ベストプラクティス)
6. [トラブルシューティング](#トラブルシューティング)

---

## 概要

IDD（Issue-Driven Development）は、すべての開発活動をIssueに基づいて行う開発手法です。このプロジェクトでは、IDD準拠率100%を目標に、完全自動化されたシステムを実装しています。

### 🎯 主な特徴

- **完全トレーサビリティ**: すべてのコード変更がIssueに紐づく
- **自動化**: Issue生成、PR作成、レビューまで自動化
- **品質保証**: IDD準拠チェックにより品質を維持
- **効率化**: 手動作業を最小限に抑える

### 📊 現在の状況

- **IDD準拠率**: 99% → 100%（目標）
- **自動化率**: 95%
- **Issue自動生成**: 実装済み
- **PR自動化**: 実装済み

---

## IDD基本原則

### 1. すべてのコミットにIssue番号を含める

```bash
# 良い例
git commit -m "feat: ユーザー認証機能を追加 #123"
git commit -m "fix: ログインエラーを修正 #456"
git commit -m "docs: README更新 #789"

# 悪い例
git commit -m "機能追加"  # Issue番号なし
git commit -m "バグ修正"   # Issue番号なし
```

### 2. ブランチ名にIssue番号を含める

```bash
# 良い例
feature/issue-123-add-authentication
fix/issue-456-login-error
hotfix/issue-789-critical-bug

# 悪い例
feature/new-feature      # Issue番号なし
fix/bug-fix             # Issue番号なし
```

### 3. PRとIssueを必ず連携する

```markdown
# PR本文の例
## 関連Issue
Closes #123

## 変更内容
- ユーザー認証機能を実装
- JWTトークンによる認証
- Refresh Token対応
```

---

## 実装ガイド

### 🚀 初期セットアップ

#### 1. IDD環境のセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/yusuke-kurosawa/PMPLearningManagement.git
cd PMPLearningManagement

# 依存関係インストール
npm install

# IDD環境セットアップ
npm run idd:setup
npm run idd:hooks:install
```

#### 2. Git Hooksの設定

Git Hooksが自動的にインストールされ、以下のチェックが行われます：

- **pre-commit**: Issue番号チェック
- **commit-msg**: メッセージフォーマット検証
- **pre-push**: 最終準拠チェック

### 📝 開発フロー

#### 1. Issue作成

1. GitHubでIssueを作成
2. 適切なラベルを付与
3. 担当者をアサイン

#### 2. ブランチ作成（自動）

Issueに`ready-for-development`ラベルが付くと、自動的にブランチが作成されます。

```bash
# 手動でブランチを作成する場合
git checkout -b feature/issue-123-feature-name
```

#### 3. 開発

```bash
# 開発作業
# ...

# コミット（Issue番号必須）
git add .
git commit -m "feat: 機能実装 #123"
```

#### 4. PR作成（自動）

ブランチにプッシュすると、自動的にPRが作成されます。

```bash
git push origin feature/issue-123-feature-name
```

#### 5. レビューとマージ

- Claude AIによる自動レビュー
- 人間のレビュアーによる確認
- 承認後、自動マージ

---

## 自動化システム

### 🤖 Issue自動生成

コード分析により、以下のIssueが自動生成されます：

| タイプ | 検出内容 | 優先度 |
|--------|----------|--------|
| バグ | ESLintエラー、console文 | High |
| セキュリティ | 脆弱性、危険なパターン | Critical |
| パフォーマンス | バンドルサイズ、複雑な関数 | Medium |
| 改善提案 | リファクタリング機会 | Low |
| メンテナンス | 依存関係更新 | Low |

### 🔄 PR自動化

| 機能 | 説明 | ステータス |
|------|------|------------|
| ブランチ自動作成 | Issueからブランチ生成 | ✅ 実装済み |
| PR自動作成 | ブランチからPR生成 | ✅ 実装済み |
| Issue自動リンク | PRとIssueを連携 | ✅ 実装済み |
| レビュアー自動アサイン | 適切なレビュアー割当 | ✅ 実装済み |

### 📊 準拠率監視

```bash
# IDD準拠率チェック
npm run idd:check

# 詳細レポート生成
npm run idd:report

# ステータス表示
npm run idd:status
```

---

## ベストプラクティス

### ✅ 推奨事項

1. **明確なIssueタイトル**
   ```
   良い例: "ユーザー認証機能の実装"
   悪い例: "機能追加"
   ```

2. **詳細なIssue本文**
   - 背景と目的
   - 実装内容
   - 受け入れ条件
   - テスト方法

3. **適切なラベル使用**
   - `bug`: バグ修正
   - `enhancement`: 機能追加
   - `documentation`: ドキュメント
   - `auto-generated`: 自動生成

4. **小さなPR**
   - 1つのPRは1つのIssueに対応
   - レビューしやすいサイズに保つ
   - 500行以下を推奨

### ⚠️ アンチパターン

1. **巨大なPR**
   - 複数のIssueを1つのPRで解決
   - 1000行以上の変更

2. **不明確なコミットメッセージ**
   ```bash
   # 悪い例
   git commit -m "fix"
   git commit -m "update"
   git commit -m "改善"
   ```

3. **Issue番号の後付け**
   - コミット後にIssue番号を追加
   - PRマージ後にIssue作成

---

## トラブルシューティング

### 🔧 よくある問題と解決方法

#### 1. コミットがIDD準拠エラーになる

**原因**: Issue番号が含まれていない

**解決方法**:
```bash
# 直前のコミットメッセージを修正
git commit --amend -m "feat: 機能追加 #123"

# 複数のコミットを修正
git rebase -i HEAD~3
```

#### 2. ブランチが自動作成されない

**原因**: `ready-for-development`ラベルが付いていない

**解決方法**:
1. Issueにラベルを追加
2. または手動でブランチ作成
```bash
git checkout -b feature/issue-123-feature-name
```

#### 3. PRが自動作成されない

**原因**: ブランチ名がIDD規則に準拠していない

**解決方法**:
```bash
# ブランチ名を変更
git branch -m old-name feature/issue-123-new-name
```

#### 4. Git Hooksが動作しない

**原因**: Hooksがインストールされていない

**解決方法**:
```bash
npm run idd:hooks:install
```

### 📞 サポート

問題が解決しない場合は、以下の手順でサポートを受けてください：

1. [IssueテンプレートでIssue作成](https://github.com/yusuke-kurosawa/PMPLearningManagement/issues/new)
2. `help-wanted`ラベルを付与
3. エラーログを添付

---

## 付録

### 📋 NPMスクリプト一覧

| コマンド | 説明 |
|---------|------|
| `npm run idd:setup` | IDD環境セットアップ |
| `npm run idd:hooks:install` | Git Hooksインストール |
| `npm run idd:check` | 準拠率チェック |
| `npm run idd:status` | ステータス表示 |
| `npm run idd:report` | レポート生成 |
| `npm run idd:metrics` | メトリクス分析 |
| `npm run idd:quality` | 品質チェック |

### 🔗 関連ドキュメント

- [IDD自動化実装](./IDD_AUTOMATION.md)
- [IDD ベストプラクティス](./IDD_BEST_PRACTICES.md)
- [GitHub Actions ガイド](../devops/GITHUB_ACTIONS_GUIDE.md)
- [CI/CD パイプライン](../devops/CI_CD_PIPELINE.md)

### 📊 メトリクス

現在のプロジェクトメトリクス：

| メトリクス | 現在値 | 目標値 |
|-----------|--------|--------|
| IDD準拠率 | 99% | 100% |
| 自動化率 | 95% | 98% |
| Issue解決時間 | 2日 | 1日 |
| PR承認時間 | 4時間 | 2時間 |
| テストカバレッジ | 80% | 90% |

---

*最終更新: 2025-08-12*
*バージョン: 1.0.0*
*作成者: Claude Code Actions + yusuke-kurosawa*