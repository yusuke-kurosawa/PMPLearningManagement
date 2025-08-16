# PMP学習管理システム

[![CI/CD Pipeline](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/deploy.yml/badge.svg)](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/deploy.yml)
[![IDD Compliance](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/idd-compliance.yml/badge.svg)](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/idd-compliance.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-green?logo=github)](https://yusuke-kurosawa.github.io/PMPLearningManagement/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

PMBOK第6版・第7版に完全準拠したプロジェクトマネジメント学習プラットフォーム

## 🌐 デモサイト

**[📱 アプリケーションを今すぐ体験](https://yusuke-kurosawa.github.io/PMPLearningManagement/)**

## 🎯 このプロジェクトについて

PMPLearningManagementは、PMP資格取得を目指す方のための包括的な学習支援システムです。49のプロセス、12のプリンシプル、8つのパフォーマンスドメイン、およびITTOフレームワークを多様な視覚化手法で効率的に学習できます。

### 主な特徴

- **📊 8種類の先進的な視覚化**: 複雑なPMBOK概念を直感的に理解
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
- PWA対応（オフライン利用可能）

## 🚀 クイックスタート

### 前提条件

- Node.js 18以上
- npm 8以上

### インストールと起動

```bash
# リポジトリのクローン
git clone https://github.com/yusuke-kurosawa/PMPLearningManagement.git
cd PMPLearningManagement

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

開発サーバー: http://localhost:5173

### プロダクションビルド

```bash
# ビルド
npm run build

# プレビュー
npm run preview

# GitHub Pagesへデプロイ
npm run deploy
```

## 🛠️ 技術スタック

- **フロントエンド**: React 18.2 + Vite 5
- **視覚化**: D3.js v7
- **スタイリング**: Tailwind CSS v3
- **UIコンポーネント**: Radix UI
- **状態管理**: Zustand + React Context
- **認証**: Supabase Auth
- **テスト**: Vitest + Playwright
- **ホスティング**: GitHub Pages

詳細な技術情報は [CLAUDE.md](CLAUDE.md) を参照してください。

## 📊 プロジェクト品質

- **IDD準拠率**: 99%
- **Lighthouseスコア**: パフォーマンス90+、アクセシビリティ95+
- **テストカバレッジ**: 80%以上
- **ビルド時間**: 約1分
- **バンドルサイズ**: 1.3MB

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

### 開発フロー

1. Issueを作成または選択
2. フィーチャーブランチを作成 (`feature/issue-123`)
3. 変更をコミット（Issue番号を含める）
4. プルリクエストを作成
5. レビューとマージ

### コミットメッセージ規約

```
feat: 新機能の追加 #123
fix: バグ修正 #456
docs: ドキュメント更新 #789
```

詳細なガイドラインは以下を参照：

- [IDD実装ガイド](docs/IDD_IMPLEMENTATION_STATUS.md)
- [開発者向けドキュメント](CLAUDE.md)
- [ラベル管理ガイド](.github/LABEL_MANAGEMENT_GUIDE.md)

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🙏 謝辞

- PMBOK®ガイド第6版・第7版（PMI）
- [D3.js](https://d3js.org/) - データ視覚化ライブラリ
- [Radix UI](https://www.radix-ui.com/) - アクセシブルなUIコンポーネント
- [Supabase](https://supabase.com/) - 認証・データベース基盤

## 📞 サポート

問題や質問がある場合は [Issues](https://github.com/yusuke-kurosawa/PMPLearningManagement/issues) で報告してください。

---

**注**: PMBOK、PMP、PMIはProject Management Institute, Inc.の登録商標です。
