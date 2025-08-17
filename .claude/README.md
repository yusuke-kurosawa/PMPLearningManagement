# Claude Memory Bank

This directory serves as Claude Code's memory bank for efficient project context management. It contains essential information and quick references with links to comprehensive documentation in `docs/`.

## Purpose

- **Memory Bank**: Essential context for Claude to understand project state immediately
- **Quick References**: Fast access to key information with links to full documentation
- **Navigation Hub**: Efficient navigation to comprehensive documentation in `docs/`
- **Context Preservation**: Maintains project context while avoiding documentation duplication

## Directory Structure

```
.claude/
├── context/                    # Essential project context
│   ├── architecture-summary.md # Architecture overview
│   ├── current-status.md      # Current development status
│   ├── quick-navigation.md    # Navigation shortcuts
│   ├── project-summary.md     # Project summary (auto-generated)
│   ├── todo-list.md          # TODO list (auto-extracted)
│   └── recent-changes.md      # Recent changes (auto-generated)
│
├── quick-ref/                  # Quick references with links
│   ├── commands.md            # Essential commands → docs/development/
│   ├── file-locations.md      # Key file locations → docs/development/
│   └── github-actions.md      # GitHub Actions → docs/development/
│
├── prompts/                    # Minimal prompt templates
│   ├── README.md              # Links to full development guides
│   ├── code-review-template.md # Brief template → docs/development/
│   └── architecture-review-template.md # Brief template → docs/development/
│
├── agents/                     # Agent overview
│   └── README.md              # Agent overview → docs/development/agent-definitions/
│
├── rules/                      # Essential rules
│   └── documentation-rules.md # Documentation organization rules
│
└── scripts/                    # Automation scripts
    └── sync-context.sh        # Context synchronization
```

## Full Documentation

**Primary Documentation**: All comprehensive guides are in [`docs/`](../docs/)
- [Development Documentation](../docs/development/) - Complete development guides
- [Organization Guides](../docs/organization/) - Documentation structure guides

## Usage

### 1. Quick Start Navigation

**Essential shortcuts**: [`context/quick-navigation.md`](context/quick-navigation.md)

- **Current project status**: [`context/current-status.md`](context/current-status.md)
- **Architecture overview**: [`context/architecture-summary.md`](context/architecture-summary.md)
- **Quick commands**: [`quick-ref/commands.md`](quick-ref/commands.md)
- **File locations**: [`quick-ref/file-locations.md`](quick-ref/file-locations.md)

### 2. Development Workflow

**Quick references** (with links to full documentation):

- **Commands**: [`quick-ref/commands.md`](quick-ref/commands.md) → [Full Guide](../docs/development/commands-reference.md)
- **File Locations**: [`quick-ref/file-locations.md`](quick-ref/file-locations.md) → [Full Guide](../docs/development/file-locations-reference.md)
- **GitHub Actions**: [`quick-ref/github-actions.md`](quick-ref/github-actions.md) → [Full Guide](../docs/development/github-actions-reference.md)

### 3. Templates and Guides

**Quick templates** (with links to comprehensive guides):

- **Code Review**: [`prompts/code-review-template.md`](prompts/code-review-template.md) → [Full Guide](../docs/development/code-review-guide.md)
- **Architecture Review**: [`prompts/architecture-review-template.md`](prompts/architecture-review-template.md) → [Full Guide](../docs/development/architecture-review-guide.md)
- **All Development Guides**: [docs/development/](../docs/development/)

### 4. Context Synchronization

Keep project context up to date:

```bash
# Sync context
./.claude/scripts/sync-context.sh

# Or use npm scripts
npm run context:update
```

## 自動更新

以下のファイルは`sync-context.sh`スクリプトによって自動更新されます：

- `context/project-summary.md` - ファイル統計、依存関係、カバレッジ
- `context/todo-list.md` - ソースコードからTODOコメントを抽出
- `context/recent-changes.md` - Git履歴から最近の変更を記録
- `context/current-status.md` - Git情報セクションの更新

## ベストプラクティス

### DO ✅

1. **定期的な同期**: 大きな変更後は`sync-context.sh`を実行
2. **決定の記録**: 重要な技術的決定は`key-decisions.md`に記録
3. **ステータス更新**: マイルストーン達成時は`current-status.md`を更新
4. **テンプレート活用**: プロンプトテンプレートを使って一貫した質問

### DON'T ❌

1. **機密情報の記載**: パスワード、APIキー等は記載しない
2. **過度な詳細**: 要約レベルを保ち、詳細は元ドキュメントを参照
3. **重複情報**: 他のドキュメントと重複する情報は参照リンクで対応
4. **古い情報の放置**: 定期的にレビューして古い情報を更新

## 統合

### package.jsonへの追加

```json
{
  "scripts": {
    "sync-context": "./.claude/scripts/sync-context.sh",
    "context:update": "npm run sync-context",
    "context:view": "cat .claude/context/current-status.md"
  }
}
```

### Git Hooksでの自動実行

`.git/hooks/pre-commit`に以下を追加：

```bash
#!/bin/bash
# コミット前にコンテキストを同期
./.claude/scripts/sync-context.sh
```

### CI/CDパイプラインでの活用

GitHub Actionsで自動更新：

```yaml
- name: Sync Claude Context
  run: |
    chmod +x .claude/scripts/sync-context.sh
    ./.claude/scripts/sync-context.sh

- name: Commit Context Updates
  run: |
    git add .claude/context/
    git commit -m "chore: update Claude context [skip ci]" || true
```

## トラブルシューティング

### Q: sync-context.shが実行できない

A: 実行権限を付与: `chmod +x .claude/scripts/sync-context.sh`

### Q: コンテキストファイルが古い

A: 手動で`sync-context.sh`を実行するか、Git Hooksを設定

### Q: Claudeが最新情報を認識しない

A: CLAUDE.mdの先頭にある参照リンクを確認し、最新のコンテキストファイルを指定

## 貢献

このコンテキスト管理システムの改善提案は歓迎します：

1. 新しいテンプレートの追加
2. 同期スクリプトの機能拡張
3. ドキュメントの改善
4. 自動化の強化

## ライセンス

このディレクトリの内容はプロジェクト本体と同じライセンスに従います。
