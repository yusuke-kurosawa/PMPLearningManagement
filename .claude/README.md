# .claude ディレクトリ

このディレクトリは、Claude Code (claude.ai/code) がプロジェクトコンテキストを効率的に管理するための専用ディレクトリです。

## 目的

- プロジェクトの最新状態をClaudeが即座に把握できるようにする
- 重要な決定事項や技術的詳細を集約する
- 開発チームが参照しやすいドキュメント構造を提供する
- コンテキストの一貫性と最新性を保証する

## ディレクトリ構造

```
.claude/
├── context/                    # プロジェクトコンテキスト
│   ├── project-map.md         # プロジェクト全体の構造マップ
│   ├── architecture-summary.md # アーキテクチャの要約
│   ├── current-status.md      # 現在の開発ステータス
│   ├── key-decisions.md       # 主要な技術的決定事項
│   ├── project-summary.md     # プロジェクトサマリー（自動生成）
│   ├── todo-list.md          # TODOリスト（自動抽出）
│   └── recent-changes.md      # 最近の変更履歴（自動生成）
│
├── quick-ref/                  # クイックリファレンス
│   ├── commands.md            # よく使うコマンド一覧
│   └── file-locations.md      # 重要ファイルの配置
│
├── prompts/                    # プロンプトテンプレート
│   ├── code-review.md         # コードレビュー用テンプレート
│   ├── architecture-review.md # アーキテクチャレビュー用
│   └── testing-guidelines.md  # テストガイドライン
│
├── scripts/                    # 自動化スクリプト
│   └── sync-context.sh        # コンテキスト同期スクリプト
│
└── templates/                  # 各種テンプレート（将来用）
```

## 使い方

### 1. コンテキストの確認

Claudeに質問する前に、以下のファイルを参照してプロジェクトの状態を把握：

- **初めての場合**: `context/project-map.md`から開始
- **アーキテクチャについて**: `context/architecture-summary.md`を参照
- **現在の状況**: `context/current-status.md`で最新状態を確認
- **技術的決定**: `context/key-decisions.md`で過去の決定を確認

### 2. クイックリファレンス

よく使う情報への素早いアクセス：

- **コマンド**: `quick-ref/commands.md`
- **ファイル配置**: `quick-ref/file-locations.md`

### 3. プロンプトテンプレート

Claudeへの質問時に使用：

```bash
# コードレビューを依頼する場合
cat .claude/prompts/code-review.md

# アーキテクチャレビューを依頼する場合
cat .claude/prompts/architecture-review.md

# テスト作成を依頼する場合
cat .claude/prompts/testing-guidelines.md
```

### 4. コンテキストの同期

プロジェクトの最新状態を反映：

```bash
# コンテキストを同期
./.claude/scripts/sync-context.sh

# package.jsonに追加してnpmコマンドとして実行
npm run sync-context
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
