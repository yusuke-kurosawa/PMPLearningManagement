# PMPLearningManagement ドキュメント

プロジェクト関係者のペルソナ別に整理された包括的なプロジェクトドキュメントです。

## 📋 ディレクトリ構造（ペルソナ別）

```
docs/
├── README.md                    # このファイル（エントリーポイント）
├── for-developers/              # 開発者向け
│   ├── README.md
│   ├── IDD_IMPLEMENTATION_STATUS.md
│   ├── TYPESCRIPT_MIGRATION_ROADMAP.md
│   ├── TYPESCRIPT_TEAM_GUIDELINES.md
│   └── archive/
│       ├── implementation/      # 実装ドキュメント
│       ├── architecture/        # アーキテクチャ設計
│       └── testing/            # テスト戦略
├── for-project-managers/        # プロジェクトマネージャー向け
│   ├── README.md
│   ├── IDD_AGENT_GUIDELINES.md
│   ├── IDD_AUTOMATION_IMPLEMENTATION_REPORT.md
│   └── archive/
│       ├── planning/           # 計画文書
│       └── reports/            # レポート類
├── for-devops/                  # DevOps担当者向け
│   ├── README.md
│   ├── devops/
│   │   └── WORLD_CLASS_DEVOPS_IMPLEMENTATION.md
│   └── archive/
│       ├── deployment/         # デプロイメント
│       └── security/           # セキュリティ
├── for-claude-ai/              # Claude AI統合担当者向け
│   ├── README.md
│   ├── CLAUDE_AI_USER_GUIDE.md
│   ├── CLAUDE_INTEGRATION_CHECKLIST.md
│   ├── CLAUDE_INTEGRATION_QUICK_START.md
│   ├── CLAUDE_INTEGRATION_SETUP.md
│   ├── CLAUDE_INTEGRATION_VERIFICATION_REPORT.md
│   ├── CLAUDE_USAGE_GUIDE.md
│   ├── claude-logging-architecture.md
│   └── claude-logging-implementation-roadmap.md
├── for-qa/                     # QA担当者向け
│   ├── README.md
│   ├── questions/              # 試験問題
│   └── translated_issues_test/ # 翻訳テスト
└── consolidated/               # 統合ドキュメント
    ├── API_CONSOLIDATED.md
    ├── ARCHITECTURE_CONSOLIDATED.md
    ├── DEPLOYMENT_CONSOLIDATED.md
    ├── GUIDES_CONSOLIDATED.md
    ├── IMPLEMENTATION_CONSOLIDATED.md
    ├── MISC_CONSOLIDATED.md
    ├── PLANNING_CONSOLIDATED.md
    ├── SECURITY_CONSOLIDATED.md
    └── TESTING_CONSOLIDATED.md
```

## 👥 ペルソナ別ナビゲーション

### 🔧 開発者の方へ

**主な関心事**: コード実装、アーキテクチャ、テスト戦略

📂 **[for-developers/](for-developers/README.md)**
- IDD実装状況とガイドライン
- TypeScript移行ロードマップ
- アーキテクチャ設計書
- テスト実装戦略

### 📊 プロジェクトマネージャーの方へ

**主な関心事**: プロジェクト進捗、品質管理、Issue管理

📂 **[for-project-managers/](for-project-managers/README.md)**
- IDD エージェントガイドライン
- 自動化実装レポート
- スプリント計画書
- プロジェクト管理計画

### 🚀 DevOps担当者の方へ

**主な関心事**: デプロイメント、インフラ、セキュリティ

📂 **[for-devops/](for-devops/README.md)**
- 世界クラスDevOps実装
- クラウドデプロイメントガイド
- セキュリティ実装計画
- インフラ設計書

### 🤖 Claude AI統合担当者の方へ

**主な関心事**: AI統合、ワークフロー最適化、ログ管理

📂 **[for-claude-ai/](for-claude-ai/README.md)**
- Claude統合クイックスタート
- セットアップガイド
- ログ収集アーキテクチャ
- 検証レポート

### 🧪 QA担当者の方へ

**主な関心事**: テスト品質、問題管理、翻訳検証

📂 **[for-qa/](for-qa/README.md)**
- PMP試験問題集
- 翻訳テスト結果
- 品質保証プロセス

## 📚 文書管理規約

### 作成・更新ルール

1. **Issue-Driven Development準拠**: すべてのドキュメント変更はIssue作成から開始
2. **日本語統一**: 技術用語を除き日本語で記述
3. **ペルソナ明確化**: 対象読者を明確にした構成
4. **定期更新**: 四半期ごとの内容見直し

### 品質基準

- 📝 Markdown形式での記述
- 📑 長文書には目次を含める
- 🎯 一貫した見出し構造
- 🖼️ 適切な図表の使用
- 🔄 コード変更との同期更新

### ナビゲーション

- 🏠 **プロジェクトホーム**: [CLAUDE.md](../CLAUDE.md)
- 📊 **実装状況**: [.claude/context/implementation-status.md](../.claude/context/implementation-status.md)
- 🎯 **現在のステータス**: [.claude/context/current-status.md](../.claude/context/current-status.md)

---

**最終更新**: 2025-08-17  
**管理者**: プロダクトマネジメントチーム  
**IDD準拠度**: 99%