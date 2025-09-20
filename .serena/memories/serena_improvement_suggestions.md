# Serena MCP Server 改善提案

## 1. デバッグ支援の強化
```yaml
# .serena/serena_config.yml に追加
web_dashboard: true  # ブラウザでログを確認可能に
```

## 2. プロジェクト固有の初期プロンプト設定
```yaml
# .serena/project.yml に追加
initial_prompt: |
  このプロジェクトはPMBOK学習用のReact/TypeScriptアプリケーションです。
  主な注意点：
  - Issue駆動開発（IDD）を採用 - すべてのコミットにIssue番号を含める
  - コード変更時は必ず lint:fix と format を実行
  - GitHub Pages用にHashRouterを使用
  - Radix UIコンポーネントを優先的に使用
```

## 3. 追加除外パス（必要に応じて）
```yaml
ignored_paths:
  - "dist/**"
  - "coverage/**"
  - "*.log"
  - "playwright-report/**"
```

## 4. メモリファイルの追加提案
- `common_issues.md` - よくある問題と解決方法
- `api_endpoints.md` - APIエンドポイント一覧
- `deployment_guide.md` - デプロイ手順
- `testing_strategy.md` - テスト戦略とコマンド

## 5. 定期的なメモリ更新
- プロジェクト構造の変更時にproject_structure.mdを更新
- 新しいコマンドやスクリプト追加時にsuggested_commands.mdを更新
- コーディング規約変更時にcode_style_conventions.mdを更新