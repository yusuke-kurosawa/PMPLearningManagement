# 🤖 .claude ディレクトリ - Claude Code コンテキスト管理システム

> **重要**: このディレクトリは Claude Code (claude.ai/code) がプロジェクトを深く理解し、効率的に支援するための専用コンテキスト管理システムです。

## 📋 概要

`.claude`ディレクトリは、PMPLearningManagementプロジェクトのコンテキスト情報を体系的に管理し、Claude AIとの協働を最適化するための統合管理システムです。プロジェクトの現状、アーキテクチャ、開発ガイドライン、自動化ツールなどを集約しています。

## 🏗️ ディレクトリ構造と役割

```
.claude/
├── 📂 agents/                    # AIエージェント定義
│   ├── architecture/            # アーキテクチャレビュー・設計エージェント
│   ├── coordination/           # タスク調整・管理エージェント
│   ├── development/            # 開発支援エージェント
│   ├── infrastructure/         # インフラ・DevOpsエージェント
│   ├── management/             # プロジェクト管理エージェント
│   └── quality/                # 品質保証・テストエージェント
│
├── 📂 automation/                # 自動化設定・スクリプト
│   ├── hooks/                  # Git Hooks設定
│   ├── workflows/              # GitHub Actions統合
│   └── scripts/                # 自動化実行スクリプト
│
├── 📂 context/                   # プロジェクトコンテキスト（最重要）
│   ├── current-status.md       # 🔴 現在のプロジェクトステータス
│   ├── implementation-status.md # 🔴 実装状況詳細
│   ├── architecture-summary.md # 🔴 アーキテクチャサマリー
│   ├── key-decisions.md        # 🔴 主要な技術的決定事項
│   ├── project-map.md          # プロジェクト全体構造マップ
│   ├── project-summary.md      # プロジェクトサマリー（自動生成）
│   ├── todo-list.md            # TODOリスト（自動抽出）
│   └── recent-changes.md       # 最近の変更履歴（自動生成）
│
├── 📂 devops/                    # DevOps設定・ガイドライン
│   ├── ci-cd/                  # CI/CDパイプライン設定
│   ├── monitoring/             # 監視・アラート設定
│   └── deployment/             # デプロイメント設定
│
├── 📂 policies/                  # 開発ポリシー・ガイドライン
│   ├── coding-standards.md     # コーディング規約
│   ├── review-process.md       # レビュープロセス
│   └── security-policy.md      # セキュリティポリシー
│
├── 📂 prompts/                   # Claudeプロンプトテンプレート
│   ├── code-review.md          # コードレビュー用
│   ├── architecture-review.md  # アーキテクチャレビュー用
│   ├── testing-guidelines.md   # テストガイドライン
│   └── debugging.md            # デバッグ支援用
│
├── 📂 quick-ref/                 # クイックリファレンス
│   ├── commands.md             # よく使うコマンド一覧
│   ├── file-locations.md       # 重要ファイルの配置
│   └── shortcuts.md            # ショートカット・Tips
│
├── 📂 rules/                     # 開発ルール定義
│   ├── eslint-rules.md         # ESLintルール
│   ├── github-actions-rules.md # GitHub Actionsルール
│   └── workflow-comment-rules.md # ワークフローコメントルール
│
├── 📂 scripts/                   # 管理スクリプト
│   ├── sync-context.sh         # コンテキスト同期
│   ├── update-docs.sh          # ドキュメント更新
│   └── analyze-project.sh      # プロジェクト分析
│
└── 📂 templates/                 # 各種テンプレート
    ├── component/               # コンポーネントテンプレート
    ├── service/                # サービステンプレート
    └── test/                   # テストテンプレート
```

## 🎯 主要機能と使用方法

### 1. 🔍 コンテキスト管理

#### 初回利用時
```bash
# 1. 現在のステータス確認
cat .claude/context/current-status.md

# 2. 実装状況の把握
cat .claude/context/implementation-status.md

# 3. アーキテクチャ理解
cat .claude/context/architecture-summary.md
```

#### 定期メンテナンス
```bash
# コンテキスト同期（重要な変更後に実行）
npm run context:update

# ステータス確認
npm run context:status

# レポート生成
npm run context:report
```

### 2. 🤖 AIエージェント活用

各エージェントは特定の専門領域を持ち、Claude Codeと連携して作業を支援します。

```bash
# アーキテクチャレビュー
@agent-architecture-reviewer レビューを実施してください

# コード品質チェック
@agent-quality-checker 品質チェックを実行してください

# DevOps最適化
@agent-devops-optimizer GitHub Actionsを最適化してください
```

### 3. ⚡ 自動化機能

#### Git Hooks統合
```bash
# Git Hooks有効化
npm run hooks:install

# 機能:
# - pre-commit: ESLint、Prettier、テスト実行
# - commit-msg: IDD準拠チェック
# - pre-push: 包括的品質チェック
```

#### GitHub Actions連携
```yaml
# .github/workflows/*.yml で自動実行
- コンテキスト同期
- ドキュメント更新
- 品質メトリクス収集
```

### 4. 📚 プロンプトテンプレート

```bash
# コードレビュー依頼
cat .claude/prompts/code-review.md | pbcopy

# アーキテクチャ相談
cat .claude/prompts/architecture-review.md | pbcopy

# テスト作成支援
cat .claude/prompts/testing-guidelines.md | pbcopy
```

## 🔧 NPMスクリプト

```json
{
  "scripts": {
    // コンテキスト管理
    "context:update": "./.claude/scripts/sync-context.sh",
    "context:status": "cat .claude/context/current-status.md",
    "context:report": "node .claude/scripts/generate-report.js",
    
    // エージェント実行
    "agent:review": "node .claude/agents/run-agent.js review",
    "agent:test": "node .claude/agents/run-agent.js test",
    "agent:optimize": "node .claude/agents/run-agent.js optimize",
    
    // 自動化
    "hooks:install": "node .claude/automation/install-hooks.js",
    "workflow:check": "node .claude/automation/check-workflows.js"
  }
}
```

## 📊 メトリクスとレポート

### 自動収集メトリクス
- **コード品質**: ESLintエラー/警告数、型カバレッジ率
- **テストカバレッジ**: 単体テスト、E2Eテスト
- **パフォーマンス**: ビルド時間、バンドルサイズ
- **DevOps成熟度**: CI/CD実行時間、デプロイ頻度

### レポート生成
```bash
# 週次レポート
npm run report:weekly

# 品質レポート
npm run report:quality

# パフォーマンスレポート
npm run report:performance
```

## 🚀 ベストプラクティス

### ✅ 推奨事項

1. **定期的な同期**
   - 大きな変更後は必ず`context:update`を実行
   - 週次でコンテキスト全体をレビュー

2. **エージェント活用**
   - 専門的なタスクは適切なエージェントに委任
   - エージェント間の連携を活用

3. **ドキュメント更新**
   - 重要な決定は`key-decisions.md`に記録
   - 実装完了時は`implementation-status.md`を更新

4. **自動化の活用**
   - Git Hooksで品質を自動保証
   - GitHub Actionsで継続的な改善

### ❌ 避けるべきこと

1. **機密情報の記載**
   - APIキー、パスワードは絶対に記載しない
   - 環境変数で管理

2. **過度な詳細**
   - サマリーレベルを保つ
   - 詳細は元ファイルを参照

3. **手動更新の放置**
   - 自動化可能な部分は必ずスクリプト化
   - 定期的なメンテナンスを怠らない

## 🔄 継続的改善

### Issue駆動開発（IDD）
```bash
# Issue作成からPRまでの自動化
npm run idd:create-issue
npm run idd:create-branch
npm run idd:create-pr
```

### メトリクス駆動改善
```bash
# 改善ポイントの自動検出
npm run analyze:improvement-points

# 技術的負債の可視化
npm run analyze:tech-debt
```

## 🛠️ トラブルシューティング

### よくある問題

#### Q: コンテキストが古い
```bash
# 強制同期
npm run context:update -- --force

# キャッシュクリア
npm run context:clear-cache
```

#### Q: エージェントが動作しない
```bash
# エージェント診断
npm run agent:diagnose

# 依存関係チェック
npm run agent:check-deps
```

#### Q: 自動化が失敗する
```bash
# Hooks再インストール
npm run hooks:reinstall

# ワークフロー検証
npm run workflow:validate
```

## 📝 貢献ガイドライン

### 新機能追加時
1. 適切なディレクトリに配置
2. READMEを更新
3. テストを追加
4. ドキュメントを作成

### 改善提案
- Issueで提案
- PRでの実装
- レビュープロセス遵守

## 📄 ライセンス

このディレクトリの内容はプロジェクト本体（MIT）と同じライセンスに従います。

---

**最終更新**: 2025-08-15  
**メンテナー**: PMPLearningManagement開発チーム  
**Claude Code統合バージョン**: 2.0.0