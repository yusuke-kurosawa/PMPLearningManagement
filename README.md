# PMP学習管理システム

[![CI/CD Pipeline](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/deploy.yml/badge.svg)](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/deploy.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-green?logo=github)](https://yusuke-kurosawa.github.io/PMPLearningManagement/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

PMBOK第6版・第7版準拠のプロジェクトマネジメント学習プラットフォーム

## 🌐 デモサイト

**[📱 今すぐ体験](https://yusuke-kurosawa.github.io/PMPLearningManagement/)**

## 🎯 概要

PMP資格取得のための包括的学習支援システム。49プロセス、12プリンシプル、8パフォーマンスドメイン、ITTOフレームワークを視覚化で効率学習。

### 主要機能

- **📊 8種類の視覚化**: 複雑なPMBOK概念を直感的理解
- **🎓 体系的な学習サポート**: フラッシュカード、模擬試験、進捗管理
- **📱 完全レスポンシブ対応**: PC、タブレット、スマートフォンで快適に利用可能
- **🌙 ダークモード対応**: 目に優しい学習環境
- **⚡ 高速パフォーマンス**: Lighthouse最適化済み、Core Web Vitals達成

## ✨ 主要機能

### 学習機能

- **PMBOKマトリックスビュー** - 10の知識エリア×5プロセス群の対話型マトリックス
- **ITTOネットワーク図** - プロセス間の関係性を動的に視覚化
- **PMP用語集** - 45以上の重要用語を検索可能
- **フラッシュカード学習** - 3Dアニメーション付きの効率的な暗記ツール
- **PMP模擬試験** - 180問・230分の本格的な試験シミュレーション

### 視覚化オプション

- 拡張ネットワークグラフ
- サンキーダイアグラム
- マインドマップビュー
- プロセスヒートマップ
- プロセスフロー図
- 知識エリアヒートマップ

### システム機能

- Supabase認証システム
- 学習進捗の自動保存
- グローバル検索
- キーボードショートカット
- **🔧 PWA対応**: オフライン利用可能

## 🚀 クイックスタート

```bash
git clone https://github.com/yusuke-kurosawa/PMPLearningManagement.git
cd PMPLearningManagement
npm install
npm run dev
```

開発サーバー: http://localhost:5173

## 🛠️ 技術スタック

**Core**: React 18.2 + TypeScript + Vite 5  
**UI**: Tailwind CSS + Radix UI + D3.js  
**Auth**: Supabase + Zustand  
**Test**: Vitest + Playwright  
**Deploy**: GitHub Pages + Actions

## 📊 品質指標

**IDD準拠**: 99% | **Lighthouse**: 90+ | **テスト**: 80%+

## 🤝 コントリビューション

1. Issueを作成/選択
2. ブランチ作成 (`feature/issue-123`)
3. コミット（Issue番号含む）
4. PR作成とレビュー

詳細: [docs/CLAUDE_PROJECT_GUIDE.md](docs/CLAUDE_PROJECT_GUIDE.md)

## 📄 ライセンス

MIT License

## 📞 サポート

[Issues](https://github.com/yusuke-kurosawa/PMPLearningManagement/issues)で報告

---
**注**: PMBOK、PMP、PMIはProject Management Institute, Inc.の登録商標です。
