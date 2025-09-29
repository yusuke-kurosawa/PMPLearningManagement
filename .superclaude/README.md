# SuperClaude統合ガイド

## 📋 概要

SuperClaudeは、Claude Codeを専門的な開発パートナーへ変換するメタプログラミングフレームワークです。
本プロジェクトでは、既存のSerena MCPとContext7と統合し、AI駆動の開発効率化を実現します。

## 🚀 クイックスタート

```bash
# セットアップ確認
npm run sc:setup

# 統合分析実行（Serena + SuperClaude）
npm run sc:analyze

# セキュリティレビュー
npm run sc:review

# アーキテクチャ分析
npm run sc:analyze:architecture
```

## 📦 コマンド一覧

| コマンド | 説明 | 使用ツール |
|---------|------|----------|
| `sc:setup` | 環境セットアップ確認 | - |
| `sc:analyze` | 統合分析（推奨） | Serena + SuperClaude |
| `sc:review` | セキュリティレビュー | SuperClaude + Serena |
| `sc:refactor` | リファクタリング提案 | SuperClaude + Sequential |
| `sc:docs` | ドキュメント生成 | SuperClaude + Context7 |
| `sc:analyze:security` | セキュリティ特化分析 | SuperClaude + Serena |
| `sc:analyze:architecture` | アーキテクチャ分析 | SuperClaude + Serena |

## 📁 ディレクトリ構造

```
.superclaude/
├── config/           # 設定ファイル
│   └── config.yml   # メイン設定
├── context/          # Serenaメモリ統合
│   └── serena-baseline.json
├── rules/            # PMBOK特化ルール
│   └── pmbok-specific.yml
├── reports/          # 分析レポート
│   └── integrated-latest.json
├── cache/            # キャッシュデータ（Upstash Redis統合）
└── README.md         # このファイル
```

## 🔧 設定

### MCPサーバー統合状況

| サーバー | 状態 | 用途 |
|---------|------|------|
| **Serena** | ✅ 有効 | コードベース分析（プライマリ） |
| **Context7** | ✅ 有効 | ドキュメント参照 |
| **Sequential** | ✅ 有効 | 多段階推論 |
| Playwright | ❌ 無効 | 既存E2Eテストと重複 |
| Tavily | ❌ 無効 | Web検索不要 |
| Magic | ❌ 無効 | Radix UI既存 |

### カスタムルール

PMBOK特化ルールを定義（`.superclaude/rules/pmbok-specific.yml`）:
- PMBOK用語の正確性チェック
- PWAオフライン互換性
- React 18ベストプラクティス
- Supabaseセキュリティ
- 機密情報露出チェック

## 🎯 使用例

### 1. プロジェクト全体の統合分析

```bash
npm run sc:analyze
```

**実行内容:**
1. Serenaでベースライン分析
2. SuperClaudeでAI分析
3. 結果を統合してJSONレポート生成

### 2. 特定ファイルのセキュリティレビュー

```bash
node scripts/superclaude-integration.js src/services/authService.ts
```

### 3. アーキテクチャ分析

```bash
npm run sc:analyze:architecture
```

## 📊 レポート確認

```bash
# 最新の統合レポート
cat .superclaude/reports/integrated-latest.json | jq

# セキュリティレポート
cat .superclaude/reports/security-pilot-test.md
```

## ⚠️ トラブルシューティング

### SuperClaudeが見つからない

```bash
# 仮想環境の確認
.venv/bin/SuperClaude --version

# 再インストール
.venv/bin/pip install --upgrade SuperClaude
```

### Serenaとの統合エラー

```bash
# Serenaメモリの確認
npm run serena:status

# メモリ再生成
npm run serena:update
```

### キャッシュのクリア

```bash
rm -rf .superclaude/cache/*
npm run context7:cache:clear
```

## 📚 参考資料

- [SuperClaude公式ドキュメント](https://github.com/SuperClaude-Org/SuperClaude_Framework)
- [Serena MCP統合ガイド](../.serena/README.md)
- [Context7設定](../docs/development/context7-integration.md)

## 🔄 次のステップ

1. **Phase 1完了確認**
   - [ ] セットアップ完了
   - [ ] パイロットテスト実施
   - [ ] セキュリティレビュー完了

2. **Phase 2準備**
   - [ ] P0脆弱性の修正
   - [ ] GitHub Actions統合
   - [ ] CI/CDパイプライン組み込み

---

最終更新: 2025-09-28
