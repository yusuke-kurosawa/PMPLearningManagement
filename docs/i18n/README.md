# Internationalization (i18n)

## 🌍 多言語対応

PMP Learning Management Systemの多言語対応に関するドキュメントです。

## 📋 対応言語

| 言語 | コード | ステータス | 完成度 |
|------|--------|-----------|--------|
| 🇺🇸 English | `en` | ✅ 対応済み | 100% |
| 🇯🇵 日本語 | `ja` | ✅ 対応済み | 100% |
| 🇨🇳 中文 | `zh` | 🚧 準備中 | 0% |
| 🇰🇷 한국어 | `ko` | 🚧 準備中 | 0% |

## 📁 ディレクトリ構造

```
docs/i18n/
├── README.md           # このファイル
├── en/                 # English documentation
│   ├── user-guide/
│   ├── developer-guide/
│   ├── product-strategy/
│   └── operations/
├── ja/                 # 日本語ドキュメント
│   ├── user-guide/
│   ├── developer-guide/
│   ├── product-strategy/
│   └── operations/
├── zh/                 # 中文文档 (準備中)
│   └── README.md
└── ko/                 # 한국어 문서 (準備중)
    └── README.md
```

## 🔧 翻訳ガイドライン

### 1. ファイル命名規則
- 原文と同じファイル名を使用
- ディレクトリ構造も原文と同じに保つ
- 例: `en/user-guide/README.md` → `ja/user-guide/README.md`

### 2. メタデータの保持
```markdown
---
lang: ja
title: "タイトル（日本語）"
description: "説明（日本語）"
---
```

### 3. リンクの調整
- 同一言語内のリンクは相対パスを維持
- 他言語へのリンクは言語コードを含むパスに変更
- 外部リンクは各言語の公式サイトに調整

### 4. 専門用語の統一
| English | 日本語 | 中文 | 한국어 |
|---------|--------|------|--------|
| Project Management | プロジェクトマネジメント | 项目管理 | 프로젝트 관리 |
| Knowledge Area | 知識エリア | 知识领域 | 지식 영역 |
| Process Group | プロセス群 | 过程组 | 프로세스 그룹 |
| ITTO | ITTO | ITTO | ITTO |

## 🚀 翻訳プロセス

### Phase 1: 準備
1. 翻訳対象ファイルの選定
2. 専門用語集の整備
3. レビュアーの選定

### Phase 2: 翻訳
1. 原文の理解
2. 初回翻訳
3. セルフレビュー

### Phase 3: レビュー
1. ネイティブレビュー
2. 技術レビュー
3. 最終確認

### Phase 4: 公開
1. 翻訳完了
2. 品質チェック
3. 公開とアナウンス

## 📊 翻訳進捗管理

### 優先度マトリックス

| ドキュメント | 重要度 | 英語 | 日本語 | 中文 | 한국어 |
|-------------|--------|------|--------|------|--------|
| README.md | 高 | ✅ | ✅ | ⏳ | ⏳ |
| User Guide | 高 | ✅ | ✅ | ⏳ | ⏳ |
| Quick Start | 高 | ✅ | ✅ | ⏳ | ⏳ |
| API Docs | 中 | ✅ | ✅ | ⏳ | ⏳ |
| Architecture | 中 | ✅ | ⏳ | ⏳ | ⏳ |
| Operations | 低 | ✅ | ⏳ | ⏳ | ⏳ |

## 🛠️ 翻訳ツール

### 推奨ツール
- **翻訳メモリ**: OmegaT, Trados
- **品質チェック**: Grammarly, LanguageTool
- **専門用語管理**: Termbase
- **協調翻訳**: Crowdin, Weblate

### 自動化
```bash
# 翻訳ファイルの同期
npm run i18n:sync

# 翻訳の検証
npm run i18n:validate

# 翻訳統計の生成
npm run i18n:stats
```

## 📝 貢献方法

### 翻訳への参加
1. [Issue](https://github.com/yusuke-kurosawa/PMPLearningManagement/issues) で翻訳希望を表明
2. 該当言語のディレクトリに翻訳ファイルを作成
3. Pull Request を作成

### レビューへの参加
1. 翻訳PRのレビュー
2. 専門用語の提案
3. 品質改善の提案

## 🌟 謝辞

翻訳に貢献してくださっている皆様：

- **日本語**: [コントリビューター一覧](./ja/CONTRIBUTORS.md)
- **中文**: [贡献者列表](./zh/CONTRIBUTORS.md)
- **한국어**: [기여자 목록](./ko/CONTRIBUTORS.md)

## 📞 お問い合わせ

- **翻訳に関する質問**: i18n@example.com
- **専門用語に関する相談**: terminology@example.com
- **技術的な問題**: tech-support@example.com