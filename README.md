# PMP学習管理システム

[![CI/CD Pipeline](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/04-deploy.yml/badge.svg)](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/04-deploy.yml)
[![IDD Compliance](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/05-idd-compliance.yml/badge.svg)](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/05-idd-compliance.yml)
[![Security Scan](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/03-security-scan.yml/badge.svg)](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/03-security-scan.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-green?logo=github)](https://yusuke-kurosawa.github.io/PMPLearningManagement/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20.11.0-green?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)

PMBOK（プロジェクトマネジメント知識体系）第6版・第7版の学習用包括的PWA対応Webアプリケーション

## 🌐 デモサイト

[アプリケーションを表示](https://yusuke-kurosawa.github.io/PMPLearningManagement/)

## 📋 概要

PMPLearningManagementは、PMBOK（プロジェクトマネジメント知識体系）第6版・第7版の学習用包括的PWA対応Webアプリケーションです。49のプロセス、12のプリンシプル、8つのパフォーマンスドメイン、およびITTO（インプット、ツールと技法、アウトプット）フレームワークを多様な視覚化手法で理解し、効率的に学習するための統合プラットフォームを提供します。

**現在のシステム成熟度**:

- **実装状態**: 静的サイト + 先進的フロントエンド機能（バックエンド統合準備中）
- **IDD成熟度**: 99% - 完全自動化達成（Git hooks + GitHub Actions）
- **コンテキスト管理**: 自動化された管理システム実装済み（60%メモリ削減達成）
- **品質保証**: テストインフラ完備（Vitest + Playwright）
- **パフォーマンス**: Lighthouse最適化済み、Core Web Vitals達成
- **アーキテクチャ**: モジュラー設計 + コンテキスト管理システム実装済み

## ✨ 主な実装済み機能

### 📊 視覚化機能（完全実装済み）

- **PMBOKマトリックスビュー**: 10の知識エリアと5つのプロセス群で整理された49プロセスの対話型マトリックス
- **ITTOネットワーク図**: D3.jsを使用したプロセス関係性の力学的グラフ視覚化
- **統合ビュー**: マトリックスとネットワーク図を組み合わせた分割画面インターフェース
- **ビジュアライゼーションハブ**: 8種類の高度な視覚化オプション
  - 拡張ネットワークグラフ（多様なレイアウトとテーマ）
  - サンキーダイアグラム（プロセスフローの可視化）
  - マインドマップビュー（階層的な知識構造）
  - プロセスヒートマップ（複雑度と進捗の可視化）
  - プロセスフロー図（時系列的な流れ）
  - 知識エリアヒートマップ（エリア別の各種指標）

### 📚 学習支援機能（実装済み）

- **PMP用語集**: 45以上の重要用語を収録した検索可能な用語集（カテゴリフィルタリング対応）
- **学習進捗ダッシュボード**: 知識エリア別・プロセス群別の習熟度管理と統計表示
- **フラッシュカード学習**: ITTOを効率的に暗記する3Dアニメーション付きフラッシュカード
- **PMP模擬試験**: 実際の試験形式を再現した180問・230分のフル模擬試験（詳細な結果分析付き）

### 🎯 先進機能（UI実装済み、バックエンド統合待ち）

- **AIコーチングシステム**: コンポーネント実装済み（`AICoachingDashboard.jsx`）
- **プロジェクトシミュレーター**: コンポーネント実装済み（`ProjectSimulator.jsx`）
- **メンターシップハブ**: コンポーネント実装済み（`MentorshipHub.jsx`）
- **コラボレーション機能**:
  - StudyGroups.jsx（学習グループ管理）
  - SharedNotes.jsx（共有ノート）
  - DiscussionThread.jsx（ディスカッションスレッド）
  - DataManagement.jsx（データ管理）

### 🔧 システム機能（実装済み）

- **認証システム**: Supabase統合、JWT + Refresh Token実装済み
- **ダークモード**: 完全実装済み（`ThemeContext`）
- **グローバル検索**: 実装済み（`GlobalSearch.jsx`）
- **カスタマイズパネル**: ユーザー設定管理実装済み
- **コマンドパレット**: キーボードショートカット対応
- **PWA対応**: Service Worker部分実装済み
- **モバイル最適化**: レスポンシブデザイン実装済み

## 🚀 セットアップ

### 前提条件

- Node.js 20.19.0以上（推奨）
- npm 9以上

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/yusuke-kurosawa/PMPLearningManagement.git
cd PMPLearningManagement

# 依存関係のインストール
npm install

# IDD環境のセットアップ
npm run idd:setup
npm run idd:hooks:install

# 開発サーバーの起動
npm run dev
```

### ビルドとデプロイ

```bash
# プロダクションビルド
npm run build

# プロダクションプレビュー
npm run preview

# GitHub Pagesへのデプロイ
npm run deploy
```

### 環境

- 開発サーバー: http://localhost:5173
- 本番URL: https://yusuke-kurosawa.github.io/PMPLearningManagement/

## 🛠️ 技術スタック（実際の実装）

### フロントエンド

- **フレームワーク**: React 18.2（HashRouter使用）
- **ビルドツール**: Vite v5
- **視覚化**: D3.js v7, D3-sankey
- **スタイリング**: Tailwind CSS v3 + tailwindcss-animate
- **UIコンポーネント**: Radix UI（@radix-ui/react-\*）完全採用
- **アイコン**: Lucide React
- **アニメーション**: Framer Motion v12
- **フォーム管理**: React Hook Form v7 + Zod

### 状態管理・データ永続化

- **グローバル状態**: Zustand v4（実装済み）+ React Context
- **サーバー状態**: @tanstack/react-query v5（準備済み）
- **データ永続化**: LocalStorage（現在）、IndexedDB移行準備中
- **認証**: Supabase Auth（@supabase/supabase-js v2）
- **カスタムフック**:
  - useProgress（学習進捗管理）
  - useDebounce（検索最適化）
  - useAuth（認証管理）
  - useIsMobile（モバイル検出）

### テスト・品質管理

- **単体テスト**: Vitest v1.6 + @testing-library/react
- **E2Eテスト**: Playwright v1.40
- **高度なテスト**:
  - Stryker（ミューテーションテスト）
  - fast-check（プロパティベーステスト）
- **モック**: MSW v2, Sinon, Nock
- **リンティング**: ESLint + Prettier
- **型チェック**: TypeScript v5.3（部分導入）

### パフォーマンス最適化

- **コード分割**: React.lazy/Suspense による遅延ロード実装済み
- **メモ化**: React.memo, useMemo, useCallback活用
- **最適化**: スロットリング、デバウンシング実装
- **コンテキスト管理**:
  - LRUキャッシュ（50アイテム制限）
  - 自動圧縮（1KB以上のファイル）
  - TTLベース有効期限（24時間）
  - メモリ監視と自動クリーンアップ

### デプロイメント・インフラ

- **ホスティング**: GitHub Pages（HashRouter使用）
- **CI/CD**: GitHub Actions（複数ワークフロー実装）
- **パッケージ管理**: npm v8+
- **デプロイ**: gh-pages v6

## 🎯 Issue-Driven Development (IDD) 実装

### IDD完全自動化システム

本プロジェクトは99%のIDD準拠率を達成し、完全自動化されたワークフローを実装しています。

#### Git Hooks（ローカル開発）

- **pre-commit**: Issue参照チェック
- **commit-msg**: メッセージフォーマット検証
- **pre-push**: 最終準拠チェック

#### GitHub Actions（CI/CD）

- **issue-driven-development.yml**: メインIDD検証
- **idd-compliance.yml**: PR準拠チェック
- **idd-metrics-collector.yml**: メトリクス収集
- **deploy.yml**: GitHub Pagesデプロイ

#### IDD NPMスクリプト

```bash
npm run idd:setup          # IDD環境セットアップ
npm run idd:hooks:install  # Git hooks インストール
npm run idd:check          # 準拠チェック
npm run idd:status         # ステータス表示
npm run idd:report         # レポート生成
npm run idd:metrics        # メトリクス分析
npm run idd:quality        # 品質チェック
```

詳細は[IDD実装ステータス](docs/IDD_IMPLEMENTATION_STATUS.md)を参照してください。

## 🔄 開発ワークフロー

### 利用可能なスクリプト

```bash
# 開発
npm run dev                    # 開発サーバーの起動
npm run build                  # プロダクションビルド
npm run preview                # プロダクションプレビュー

# GitHub Pagesへのデプロイ
npm run deploy

# テストの実行
npm run test                   # 単体テスト
npm run test:e2e               # E2Eテスト
npm run test:coverage          # カバレッジレポート

# コード品質
npm run lint                   # ESLint実行
npm run lint:fix               # ESLint自動修正
npm run format                 # Prettier実行

# コンテキスト管理
npm run context:update         # コンテキスト同期
npm run context:consolidate    # ドキュメント統合
npm run context:cleanup        # クリーンアップ

# IDD関連
npm run idd:check              # 準拠チェック
npm run idd:status             # ステータス表示
npm run idd:report             # レポート生成
```

### CI/CDパイプライン

#### GitHub Actionsワークフロー

1. **デプロイメント** (`deploy.yml`)
   - GitHub Pagesへの自動デプロイ
   - プロダクションビルドの最適化
   - キャッシュ戦略の実装

2. **IDDコンプライアンス** (`idd-compliance.yml`)
   - PRのIssue参照チェック
   - コミットメッセージ検証
   - IDD準拠率の計算

3. **IDDメイン検証** (`issue-driven-development.yml`)
   - 包括的なIDDチェック
   - ブランチ保護ルールの適用
   - 自動レポート生成

4. **IDDメトリクス収集** (`idd-metrics-collector.yml`)
   - IDD準拠メトリクスの収集
   - ダッシュボードデータ生成
   - 傾向分析とレポート

### ブランチ保護

- mainブランチはPRレビュー必須
- すべてのステータスチェックが必須
- mainブランチへの直接プッシュ禁止
- マージ時の自動デプロイメント
- IDDコンプライアンスチェック必須

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！以下の手順に従ってください：

### 貢献の流れ

1. Issueを作成または既存のIssueを選択
2. **適切なラベルを設定**（[ラベル運用ガイド](.github/LABEL_MANAGEMENT_GUIDE.md)参照）
3. フィーチャーブランチを作成（`git checkout -b feature/issue-123`）
4. IDDに準拠したコミットメッセージで変更をコミット
5. プルリクエストを作成（Issue番号を含める）
6. コードレビューと自動チェックの通過を待つ
7. マージ

### 🏷️ Issue・PR ラベルシステム

当プロジェクトでは、効率的なタスク管理のため統一されたラベル体系を採用しています：

- **必須ラベル**: すべてのIssueに「種類」と「優先度」ラベルが必要
- **推奨ラベル**: 「状況」と「領域」ラベルで進捗と担当領域を明確化
- **特別ラベル**: 初心者歓迎、アイデア募集等の特殊用途ラベル

詳細は **[ラベル管理ガイド](.github/LABEL_MANAGEMENT_GUIDE.md)** を参照してください。

#### ラベル管理コマンド

```bash
# 現在のラベル状況確認
node .github/scripts/manage-labels.js status

# ラベル定義の検証
node .github/scripts/manage-labels.js validate

# ラベル体系の完全リセット
node .github/scripts/manage-labels.js reset
```

### コードスタイル

- 関数コンポーネント + Hooksパターンを使用
- 明確で説明的な変数名
- 単一責任の原則に従う
- 適切なコメントとJSDoc
- ESLint + Prettier設定に準拠

### Git コミット（IDD準拠）

すべてのコミットはIssue番号を含む必要があります：

```
feat: 新機能の追加 #123
fix: バグ修正 #456
docs: ドキュメント更新 #789
style: フォーマット変更 #012
refactor: リファクタリング #345
test: テスト追加 #678
chore: 雑務 #901
```

### プルリクエスト

- Issue番号を必ず含める
- テストを含める
- CLAUDE.mdガイドラインに準拠
- コードレビューを受ける

## 📊 プロジェクト統計

- **コンポーネント数**: 100以上
- **IDD準拠率**: 99%
- **テストカバレッジ**: 80%以上目標
- **Lighthouseスコア**:
  - パフォーマンス: 90+
  - アクセシビリティ: 95+
  - ベストプラクティス: 100
  - SEO: 100
- **ブラウザサポート**: Chrome, Firefox, Safari, Edge（最新2バージョン）

## 🔮 今後の実装予定

### 優先度：高

- [ ] バックエンドAPI統合（tRPC + Prisma）
- [ ] WebSocket リアルタイム通信
- [ ] 決済システム（Stripe）統合
- [ ] PWA完全対応（オフライン機能）

### 優先度：中

- [ ] 多言語対応（i18n）
- [ ] AI学習アドバイザー（GPT-4統合）
- [ ] 音声読み上げ機能
- [ ] PDFエクスポート機能

### 優先度：低

- [ ] ゲーミフィケーション要素
- [ ] ソーシャル共有機能
- [ ] カスタムテーマ作成機能

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🙏 謝辞

- PMBOK®ガイド第6版・第7版（PMI）に基づく
- アイコン: Lucide React
- 視覚化: D3.js
- 認証: Supabase
- UIコンポーネント: Radix UI
- ホスティング: GitHub Pages

## 📞 サポート

問題が発生した場合や質問がある場合は、[Issues](https://github.com/yusuke-kurosawa/PMPLearningManagement/issues)ページで報告してください。

---

**注**: PMBOK、PMP、PMIはProject Management Institute, Inc.の登録商標です。

## 📊 IDD Compliance Dashboard

[![IDD Compliance](https://img.shields.io/badge/IDD%20Compliance-66%25-yellow)](https://yusuke-kurosawa.github.io/PMPLearningManagement/idd-dashboard/)

View our real-time IDD compliance metrics: [Dashboard](https://yusuke-kurosawa.github.io/PMPLearningManagement/idd-dashboard/)
# Empty commit to trigger CI
