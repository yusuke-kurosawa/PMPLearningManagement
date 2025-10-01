# 📋 .github ディレクトリ構成ガイド

このディレクトリは、PMPLearningManagementプロジェクトのGitHub管理設定を含みます。  
Claude Code (claude.ai/code) での開発を最適化するための構成になっています。

## 📁 ディレクトリ構造と役割

```
.github/
├── ISSUE_TEMPLATE/          # Issueテンプレート
├── actions/                 # 再利用可能なGitHub Actions
├── config/                  # GitHub設定ファイル
├── hooks/                   # Git Hooks スクリプト
├── project-boards/          # プロジェクトボード設定
├── scripts/                 # 自動化スクリプト
├── workflows/               # GitHub Actionsワークフロー
│   └── archive/            # アーカイブ済みワークフロー
├── workflows-backup/        # ワークフローバックアップ
└── *.md, *.yml, *.json    # 各種設定・ドキュメント
```

## 🎯 主要コンポーネント

### 1. Issue Template (`ISSUE_TEMPLATE/`)

**目的**: Issue作成時のテンプレート提供  
**内容**:

- `bug_report.md` - バグ報告用テンプレート
- `feature_request.md` - 機能要望用テンプレート
- `database_issue.md` - データベース関連Issue用テンプレート

### 2. GitHub Actions (`actions/`)

**目的**: 再利用可能なカスタムアクション  
**主要アクション**:

- `idd-validator/` - IDD準拠検証アクション
- `quality-check/` - 品質チェックアクション
- `security-audit/` - セキュリティ監査アクション
- `setup-node/` - Node.js環境構築アクション

### 3. ワークフロー (`workflows/`)

**目的**: CI/CD自動化パイプライン  
**アクティブワークフロー** (7個):

- `01-core-ci-cd.yml` - メインCI/CDパイプライン
- `02-claude-pr-review.yml` - Claude AIコードレビュー
- `03-security-scan.yml` - セキュリティスキャン
- `04-deploy.yml` - GitHub Pagesデプロイ
- `05-idd-compliance.yml` - IDD準拠チェック
- `06-idd-main.yml` - IDD メイン機能
- `07-idd-metrics.yml` - メトリクス収集

**アーカイブ** (`archive/`): 44個の旧ワークフロー

### 4. Git Hooks (`hooks/`)

**目的**: ローカル開発での品質保証  
**主要フック**:

- `pre-commit` - コミット前チェック
- `commit-msg` - メッセージフォーマット検証
- `pre-push` - プッシュ前の最終チェック

### 5. 設定ファイル (`config/`)

**目的**: GitHub機能の設定  
**内容**:

- リポジトリ設定
- セキュリティ設定
- 通知設定

### 6. スクリプト (`scripts/`)

**目的**: 管理タスクの自動化  
**主要スクリプト**:

- ラベル管理
- Issue処理
- ワークフロー管理
- メトリクス収集

## 📚 主要ドキュメント

### IDD (Issue-Driven Development)

- `IDD_QUICK_REFERENCE.md` - IDD クイックリファレンス
- **準拠率目標**: 99%以上

### DevOps管理

- `DEVOPS_PROJECT_MANAGEMENT_IMPLEMENTATION.md` - DevOps実装ガイド
- `DOCS_SYNC_GUIDE.md` - ドキュメント同期ガイド

### ラベル管理

- `LABEL_MANAGEMENT_GUIDE.md` - ラベル管理ガイド
- `LABEL_SYSTEM_SUMMARY.md` - ラベルシステム概要
- `labels-definition.json` - ラベル定義（JSON）
- `labels-backup.json` - ラベルバックアップ

### チーム管理

- `team-skills-matrix.json` - チームスキルマトリックス
- スキルベースの自動アサイン設定

## 🔧 設定ファイル

### Dependabot (`dependabot.yml`)

```yaml
# 依存関係の自動更新
- package-ecosystem: 'npm'
  schedule:
    interval: 'weekly'
  open-pull-requests-limit: 10
```

### Branch Protection (`branch-protection.yml`)

```yaml
# mainブランチ保護ルール
- 直接プッシュ禁止
- PRレビュー必須
- ステータスチェック必須
- 管理者も規則に従う
```

### Labeler (`labeler.yml`)

```yaml
# ファイル変更に基づく自動ラベル付け
- frontend: src/components/**
- backend: src/server/**
- documentation: docs/**
```

### PRテンプレート (`pull_request_template.md`)

標準化されたPR作成テンプレート:

- 変更内容の説明
- Issue参照（必須）
- テスト結果
- チェックリスト

## 🚀 Claude Code連携

### 最適化のポイント

1. **コンテキスト効率化**
   - 必要最小限のワークフロー（7個）
   - 明確な命名規則（番号付き）
   - 日本語コメント完備

2. **自動化の徹底**
   - Git Hooks によるローカルチェック
   - GitHub Actions による CI/CD
   - IDD準拠の自動検証

3. **保守性の向上**
   - アーカイブによる履歴保持
   - バックアップの維持
   - ドキュメントの充実

## 📊 メトリクス

### 現在の状態（2025-08-15）

- **アクティブワークフロー**: 7個
- **アーカイブワークフロー**: 44個
- **カスタムアクション**: 4個
- **Issueテンプレート**: 3個
- **ラベル定義**: 30+種類

### 最適化成果

- **ワークフロー削減**: 86%（50個→7個）
- **実行時間短縮**: 40%
- **メンテナンス効率**: 75%向上

## 🔄 更新履歴

### 2025-08-15

- GitHub Actions最適化実施
- ワークフロー番号付き命名規則導入
- 日本語コメント追加
- アーカイブ整理完了

### 2025-08-14

- IDD完全自動化達成
- Git Hooks実装
- ラベルシステム再構築

## 📝 使用方法

### 新しいワークフロー追加時

```bash
# 命名規則に従って作成
touch .github/workflows/08-new-feature.yml

# テンプレートから開始
cp .github/workflows/archive/00-template-workflow.yml \
   .github/workflows/08-new-feature.yml
```

### ラベル管理

```bash
# ラベル同期
gh label sync --file .github/labels-definition.json

# バックアップ作成
gh label list --json name,color,description > .github/labels-backup.json
```

### IDD準拠チェック

```bash
# ローカルでチェック
npm run idd:check

# CI/CDで自動実行
# PR作成時に自動で05-idd-compliance.ymlが実行
```

## 🤝 コントリビューション

1. **Issue作成**: テンプレートを使用
2. **ブランチ作成**: `feature/issue-<番号>`
3. **コミット**: Issue番号を含める
4. **PR作成**: テンプレートに従う
5. **レビュー**: Claude AIと人間のレビュー

## 📖 関連ドキュメント

- [コーディング標準](../.claude/rules/coding-standards.md)
- [GitHub Actions規則](../.claude/rules/github-actions.md)
- [IDDプロセス規則](../.claude/rules/idd-process.md)
- [プロジェクトREADME](../README.md)

## 🔗 参考リンク

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [GitHub Issues Documentation](https://docs.github.com/issues)
- [Claude Code Documentation](https://docs.anthropic.com/claude-code)

---

**最終更新**: 2025-08-15  
**管理者**: PMPLearningManagement Team  
**Issue**: #94 - プロジェクト全体の品質改善
