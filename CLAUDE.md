# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリのコードを扱う際のガイダンスを提供します。

> **コンテキスト管理**: このプロジェクトは`.claude/`ディレクトリを**メモリバンク**として使用し、`docs/`ディレクトリに包括的なドキュメントを保持しています。  
> **クイックアクセス**: [.claude/context/quick-navigation.md](.claude/context/quick-navigation.md)  
> **完全ドキュメント**: [docs/](docs/) ディレクトリ

## プロジェクト概要

PMPLearningManagementは、PMBOK（プロジェクトマネジメント知識体系）第6版・第7版の学習用包括的PWA対応Webアプリケーションです。49のプロセス、12のプリンシプル、8つのパフォーマンスドメイン、およびITTO（インプット、ツールと技法、アウトプット）フレームワークを多様な視覚化手法で理解し、効率的に学習するための統合プラットフォームを提供します。

**現在のシステム成熟度**:

- **実装状態**: 静的サイト + 先進的フロントエンド機能（バックエンド統合準備中）
- **IDD成熟度**: 99% - 完全自動化達成（Git hooks + GitHub Actions）
- **コンテキスト管理**: 自動化された管理システム実装済み（60%メモリ削減達成）
- **品質保証**: テストインフラ完備（Vitest + Playwright）
- **パフォーマンス**: Lighthouse最適化済み、Core Web Vitals達成
- **アーキテクチャ**: モジュラー設計 + コンテキスト管理システム実装済み

### クイックナビゲーション

#### 📋 メモリバンク（すぐにアクセス）
- [ナビゲーションガイド](.claude/context/quick-navigation.md) - 効率的なナビゲーション
- [現在のステータス](.claude/context/current-status.md) - プロジェクト現状
- [アーキテクチャサマリー](.claude/context/architecture-summary.md) - システム概要
- [コマンドリファレンス](.claude/quick-ref/commands.md) - 基本コマンド
- [ファイルロケーション](.claude/quick-ref/file-locations.md) - 重要ファイル

#### 📚 完全ドキュメント（詳細情報）
- [開発ドキュメント](docs/development/) - 開発ガイドと参考資料
- [IDD実装ステータス](docs/IDD_IMPLEMENTATION_STATUS.md) - IDD実装詳細
- [ドキュメント構成ガイド](docs/organization/NAVIGATION_GUIDE.md) - ドキュメント案内

## 主な実装済み機能

### 📊 視覚化機能（完全実装済み）

1. **PMBOKマトリックスビュー**: 10の知識エリアと5つのプロセス群で整理された49プロセスの対話型マトリックス
2. **ITTOネットワーク図**: D3.jsを使用したプロセス関係性の力学的グラフ視覚化
3. **統合ビュー**: マトリックスとネットワーク図を組み合わせた分割画面インターフェース
4. **ビジュアライゼーションハブ**: 8種類の高度な視覚化オプション
   - 拡張ネットワークグラフ（多様なレイアウトとテーマ）
   - サンキーダイアグラム（プロセスフローの可視化）
   - マインドマップビュー（階層的な知識構造）
   - プロセスヒートマップ（複雑度と進捗の可視化）
   - プロセスフロー図（時系列的な流れ）
   - 知識エリアヒートマップ（エリア別の各種指標）

### 📚 学習支援機能（実装済み）

5. **PMP用語集**: 45以上の重要用語を収録した検索可能な用語集（カテゴリフィルタリング対応）
6. **学習進捗ダッシュボード**: 知識エリア別・プロセス群別の習熟度管理と統計表示
7. **フラッシュカード学習**: ITTOを効率的に暗記する3Dアニメーション付きフラッシュカード
8. **PMP模擬試験**: 実際の試験形式を再現した180問・230分のフル模擬試験（詳細な結果分析付き）

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

## 技術スタック（実際の実装）

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

- **単体テスト**: Vitest v3.2 + @testing-library/react
- **E2Eテスト**: Playwright v1.40
  - クロスブラウザテスト（Chromium/Firefox/WebKit）
  - モバイルテスト
  - ビジュアルリグレッションテスト
  - アクセシビリティテスト
  - パフォーマンステスト
- **高度なテスト**:
  - Stryker（ミューテーションテスト）
  - fast-check（プロパティベーステスト）
  - jest-axe（アクセシビリティテスト）
- **モック**: MSW v2, Sinon, Nock
- **リンティング**: ESLint + Prettier
- **型チェック**: TypeScript v5.3（移行中）

### パフォーマンス最適化

- **コード分割**: React.lazy/Suspense による遅延ロード実装済み
- **メモ化**: React.memo, useMemo, useCallback活用
- **最適化**: スロットリング、デバウンシング実装
- **コンテキスト管理**:
  - LRUキャッシュ（50アイテム制限）
  - 自動圧縮（1KB以上のファイル）
  - TTLベース有効期限（24時間）
  - メモリ監視と自動クリーンアップ
- **外部統合**:
  - Upstash Redis（Context7キャッシング）
  - Serena MCP（コードベース分析）

### デプロイメント・インフラ

- **ホスティング**: GitHub Pages（HashRouter使用）
- **CI/CD**: GitHub Actions（40+ワークフロー実装）
  - CI: 並列パイプライン、品質チェック
  - CD: 自動デプロイ、Serena検証
  - Security: 包括的セキュリティスキャン
  - Monitoring: パフォーマンス監視
- **パッケージ管理**: npm v10+
- **デプロイ**: gh-pages v6

## Issue-Driven Development (IDD) 実装

### 🎯 IDD完全自動化システム

本プロジェクトは99%のIDD準拠率を達成し、完全自動化されたワークフローを実装しています。

#### Git Hooks（ローカル開発）

- **pre-commit**: Issue参照チェック
- **commit-msg**: メッセージフォーマット検証
- **pre-push**: 最終準拠チェック

#### GitHub Actions（CI/CD）

- **issue-driven-development.yml**: メインIDD検証
- **idd-compliance.yml**: PR準拠チェック
- **idd-metrics-collector.yml**: メトリクス収集

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

## プロダクトバックログ管理

### 📋 GitHub統合バックログシステム

本プロジェクトは完全なGitHub統合バックログ管理システムを実装しています。

#### バックログ構成

- **プロダクトバックログ**: [PRODUCT_BACKLOG.md](PRODUCT_BACKLOG.md)
  - 82ユーザーストーリー（Phase 1-4全体）
  - ストーリーフォーマット: As a / I want to / So that
  - Given/When/Then受入基準
  - ストーリーポイント見積もり（Fibonacci）
  - 依存関係マッピング

#### GitHub Issue テンプレート

- `.github/ISSUE_TEMPLATE/07_user_story.yml`: ユーザーストーリー作成用
- `.github/ISSUE_TEMPLATE/08_technical_task.yml`: 技術タスク作成用

#### Agile開発ガイド

- [GitHub バックログ管理ガイド](docs/agile/GITHUB_BACKLOG_MANAGEMENT.md)
  - ラベルシステム（40+ラベル）
  - マイルストーン構造
  - 自動化ワークフロー
  - CLI スクリプト

- [スプリント計画ガイド](docs/agile/SPRINT_PLANNING_GUIDE.md)
  - スプリントプランニング Part 1/2
  - チームキャパシティ計算
  - ベストプラクティス

- [Agileドキュメント概要](docs/agile/README.md)
  - クイックスタートガイド
  - メトリクス・KPI追跡

#### バックログ管理コマンド

```bash
# GitHub Issueの一括作成（手動実行）
gh issue create --template 07_user_story.yml

# バックログステータス確認
gh issue list --label user-story --state open

# スプリントプランニング用Issue抽出
gh issue list --label phase-1 --label P0-critical
```

## プロジェクト構造（実装ベース）

```
PMPLearningManagement/
├── src/
│   ├── api/                            # APIエンドポイント
│   │   ├── pmbok/                      # PMBOKデータAPI
│   │   └── terminology/                # 用語管理API
│   │
│   ├── components/                     # コンポーネント（32ディレクトリ）
│   │   ├── accessibility/              # アクセシビリティ
│   │   ├── ai/                         # AI機能
│   │   ├── analytics/                  # 分析機能
│   │   ├── auth/                       # 認証
│   │   ├── coaching/                   # AIコーチング
│   │   ├── collaboration/              # コラボレーション
│   │   ├── exam/                       # 試験機能
│   │   ├── layout/                     # レイアウト
│   │   ├── learning/                   # 学習機能
│   │   ├── mentorship/                 # メンターシップ
│   │   ├── mobile/                     # モバイル最適化
│   │   ├── pages/                      # ページ
│   │   ├── pmbok/                      # PMBOK関連
│   │   ├── serena/                     # Serena統合
│   │   ├── shared/                     # 共通コンポーネント
│   │   ├── simulator/                  # シミュレーター
│   │   ├── terminology/                # 用語管理
│   │   ├── ui/                         # UIコンポーネント（Radix UI）
│   │   └── visualizations/             # 視覚化
│   │
│   ├── contexts/                       # React Context
│   │   ├── AuthContext.jsx
│   │   ├── ContextManagerContext.jsx
│   │   └── ThemeContext.jsx
│   │
│   ├── services/                       # サービス層（50+ファイル）
│   │   ├── ai/                         # AIサービス
│   │   │   ├── aiLearningService.ts
│   │   │   ├── conversationMemoryService.ts
│   │   │   ├── langchainAgent.ts
│   │   │   ├── questionGenerationAgent.ts
│   │   │   └── vectorStoreService.ts
│   │   ├── analytics/                  # 分析サービス
│   │   │   ├── BusinessIntelligence.ts
│   │   │   ├── KPIFramework.ts
│   │   │   ├── MachineLearningModels.ts
│   │   │   ├── RealTimeAnalyticsEngine.ts
│   │   │   └── StatisticalAnalysis.ts
│   │   ├── ml/                         # 機械学習
│   │   │   └── LearningPredictionPipeline.ts
│   │   ├── mlops/                      # MLOps
│   │   │   └── ModelMonitoringService.ts
│   │   ├── pipeline/                   # データパイプライン
│   │   │   └── DataPipelineService.ts
│   │   ├── pwa/                        # PWA機能
│   │   │   └── cacheStrategyAPI.ts
│   │   ├── statistics/                 # 統計分析
│   │   │   └── StatisticalAnalysisFramework.ts
│   │   ├── sync/                       # 同期管理
│   │   │   └── offlineSyncManager.ts
│   │   ├── terminology/                # 用語サービス
│   │   │   └── terminology-analyzer.ts
│   │   ├── authService.ts
│   │   ├── contextManager.ts
│   │   ├── progressService.ts
│   │   └── ... (その他40+ファイル)
│   │
│   ├── data/                           # データ定義
│   │   ├── fixtures/                   # テストデータ
│   │   ├── mock/                       # モックデータ
│   │   ├── pmbok/                      # PMBOKデータ
│   │   ├── schemas/                    # スキーマ定義
│   │   └── terminology/                # 用語データベース
│   │
│   ├── lib/                            # ライブラリ・設定
│   │   ├── api/                        # API設定
│   │   ├── auth/                       # 認証設定
│   │   ├── cache/                      # キャッシュ
│   │   ├── database/                   # データベース
│   │   ├── db/                         # DB接続
│   │   ├── middleware/                 # ミドルウェア
│   │   ├── monitoring/                 # モニタリング
│   │   ├── pwa/                        # PWA設定
│   │   ├── security/                   # セキュリティ
│   │   ├── storage/                    # ストレージ
│   │   └── trpc/                       # tRPC設定
│   │
│   ├── ml/                             # 機械学習（準備中）
│   │   ├── features/                   # 特徴量
│   │   ├── models/                     # モデル
│   │   ├── monitoring/                 # 監視
│   │   ├── pipelines/                  # パイプライン
│   │   └── serving/                    # サービング
│   │
│   ├── server/                         # サーバーサイド（準備中）
│   │   ├── auth/                       # サーバー認証
│   │   ├── health/                     # ヘルスチェック
│   │   ├── monitoring/                 # サーバー監視
│   │   ├── repositories/               # リポジトリ
│   │   ├── routers/                    # tRPCルーター
│   │   └── services/                   # サーバーサービス
│   │
│   ├── hooks/                          # カスタムフック
│   ├── interfaces/                     # TypeScript型定義
│   ├── stores/                         # 状態管理ストア
│   ├── styles/                         # スタイル
│   ├── test/                           # テストユーティリティ
│   ├── types/                          # 型定義
│   ├── utils/                          # ユーティリティ
│   │
│   ├── App.jsx                         # メインアプリケーション
│   ├── main.tsx                        # エントリーポイント
│   └── index.css                       # グローバルスタイル
│
├── .github/
│   ├── workflows/                      # GitHub Actions（40+ワークフロー）
│   │   ├── 01-ci-continuous-integration.yml
│   │   ├── 02-cd-continuous-deployment.yml
│   │   ├── 02-quality-idd-compliance.yml
│   │   ├── 03-security-comprehensive-scan.yml
│   │   ├── 04-monitoring-perf--comprehensive.yml
│   │   ├── claude-enhanced.yml         # Claude統合
│   │   ├── serena-integration.yml      # Serena統合
│   │   ├── pmp-terminology-check.yml   # 用語チェック
│   │   └── ... (その他30+ファイル)
│   ├── ISSUE_TEMPLATE/                # Issue テンプレート
│   └── hooks/                         # Git Hooks
│
├── .claude/                           # Claude コンテキスト管理
│   ├── context/                       # プロジェクトコンテキスト
│   ├── agents/                        # エージェント定義
│   ├── prompts/                       # プロンプトテンプレート
│   ├── quick-ref/                     # クイックリファレンス
│   └── scripts/                       # 自動化スクリプト
│
├── docs/                              # ドキュメント（整理済み）
│   ├── api/                           # APIドキュメント
│   ├── architecture/                  # アーキテクチャ文書
│   ├── development/                   # 開発ガイド
│   ├── scripts/                       # スクリプトドキュメント
│   └── ... (その他20+ディレクトリ)
│
├── reports/                           # レポート（新規追加）
│   ├── idd/                           # IDD レポート
│   ├── optimization/                  # 最適化レポート
│   ├── performance/                   # パフォーマンスレポート
│   └── quality/                       # 品質レポート
│
├── scripts/                           # 自動化スクリプト（120+ファイル）
│   ├── auto-fix/                      # 自動修正
│   ├── idd/                           # IDD自動化
│   ├── maintenance/                   # メンテナンス
│   ├── workers/                       # ワーカースクリプト
│   ├── serena-cli.js                  # SerenaメインCLI
│   ├── context7-monitor.js            # Context7監視
│   ├── upstash-quick-start.sh         # Upstashセットアップ
│   └── ... (その他110+ファイル)
│
├── public/                            # 静的ファイル
├── index.html                         # HTMLテンプレート
├── vite.config.js                     # Vite設定
├── tailwind.config.js                 # Tailwind設定
├── package.json                       # 依存関係とスクリプト（110+スクリプト）
└── CLAUDE.md                          # このファイル
```

## アーキテクチャの決定事項

### ルーティング

- GitHub Pages互換性のため**HashRouter**を使用
- 主要ルート:
  - `/` - ホームページ
  - `/matrix` - PMBOKマトリックスビュー
  - `/network` - 力学的ネットワーク図
  - `/integrated` - 分割画面ビュー
  - `/visualizations` - ビジュアライゼーションハブ
  - `/glossary` - PMP用語集
  - `/progress` - 学習進捗ダッシュボード（認証必要）
  - `/flashcards` - フラッシュカード学習
  - `/mock-exam` - 模擬試験（認証必要）
  - `/collaboration` - コラボレーションハブ
  - `/ai-coaching` - AIコーチング
  - `/auth/*` - 認証関連ページ

### 状態管理

- **グローバル状態**: Zustand + React Context のハイブリッド
- **認証状態**: AuthContext（Supabase統合）
- **テーマ管理**: ThemeContext（ダークモード対応）
- **コンテキスト管理**: ContextManagerContext（メモリ最適化）
- **永続化**: LocalStorage（現在）→ IndexedDB（移行中）

### コンポーネント設計

- 関数コンポーネント + Hooks パターン
- 単一責任の原則
- Props による明示的なデータフロー
- React.memo による再レンダリング最適化
- Lazy Loading による初期ロード最適化

### パフォーマンス最適化

- **コード分割**: 全主要コンポーネントで React.lazy 実装
- **メモ化**: useMemo, useCallback の適切な使用
- **コンテキスト管理**:
  - LRUキャッシュによるメモリ管理
  - 自動圧縮と解凍
  - TTLベースの有効期限管理
  - メモリ使用率監視

## 開発環境のセットアップ

### 前提条件

- Node.js 18+
- npm 8+

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
```

### 開発コマンド

```bash
# 基本開発
npm run dev                 # 開発サーバーの起動
npm run build              # プロダクションビルド
npm run preview            # プロダクションプレビュー
npm run deploy             # GitHub Pagesへのデプロイ
npm run deploy:serena      # Serena検証付きデプロイ

# テスト実行
npm run test               # 単体テスト
npm run test:e2e           # E2Eテスト
npm run test:coverage      # カバレッジレポート
npm run test:e2e:auth      # 認証E2Eテスト
npm run test:e2e:learning  # 学習機能E2Eテスト
npm run test:a11y          # アクセシビリティテスト
npm run test:mutation      # ミューテーションテスト

# コード品質
npm run lint               # ESLint実行
npm run lint:fix           # ESLint自動修正
npm run format             # Prettier実行
npm run typecheck          # TypeScript型チェック
npm run quality:check      # コンテンツ品質チェック

# IDD関連
npm run idd:check          # 準拠チェック
npm run idd:report         # レポート生成

# 用語管理
npm run terminology:check  # PMP用語チェック
npm run terminology:validate # 用語検証
npm run terminology:dashboard # 用語ダッシュボード

# Serena統合（Serena MCP）
npm run serena:init        # Serena初期化
npm run serena:update      # メモリ更新
npm run serena:validate    # プロジェクト検証
npm run serena:report      # レポート生成
npm run serena:diagnose    # 診断実行
npm run serena:interactive # 対話モード

# Context7統合（Upstash + Context7 MCP）
npm run context7:setup     # セットアップ
npm run context7:test      # 接続テスト
npm run context7:monitor   # 監視開始
npm run context7:cache:clear # キャッシュクリア
npm run context7:health    # ヘルスチェック

# APIドキュメント
npm run api-docs:generate  # SDKコード生成
npm run api-docs:validate  # ドキュメント検証
npm run api-docs:serve     # ドキュメントサーバー起動

# セキュリティ
npm run security:audit     # セキュリティ監査
npm run security:check     # セキュリティチェック
```

### 環境

- 開発サーバー: http://localhost:5173
- 本番URL: https://yusuke-kurosawa.github.io/PMPLearningManagement/

## トラブルシューティング

### よくある問題と解決方法

1. **ビルドエラー**
   - Node.js 18+がインストールされていることを確認
   - `rm -rf node_modules package-lock.json && npm install`
   - Vite設定の確認

2. **GitHub Pages 404エラー**
   - HashRouterの使用を確認
   - vite.config.jsのbase設定を確認
   - デプロイ完了まで2-5分待つ

3. **コンテキストメモリエラー**
   - `npm run context:cleanup`を実行
   - ContextManagerDashboardで手動クリーンアップ
   - ブラウザのLocalStorageをクリア

4. **IDD準拠エラー**
   - コミットメッセージにIssue番号を含める（例: `feat: 機能追加 #123`）
   - `npm run idd:check`で事前チェック
   - Git hooksが正しくインストールされているか確認

## 開発ガイドライン

### コードスタイル

- 関数コンポーネント + Hooks パターンを使用
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

## 今後の実装予定

### 優先度：高

- [ ] バックエンドAPI統合（tRPC + Prisma）
  - サーバーサイド実装完了準備
  - データベーススキーマ設計済み
  - tRPCルーター構造準備完了
- [ ] WebSocket リアルタイム通信
- [ ] Upstash Redis完全統合（Context7最適化）
- [ ] PWA完全対応（オフライン機能強化）

### 優先度：中

- [ ] 多言語対応（i18n）
- [ ] AI学習アドバイザー（LangChain統合）
  - 基盤実装済み（aiLearningService.ts）
  - Question Generation Agent実装済み
  - Vector Store準備完了
- [ ] 音声読み上げ機能
- [ ] PDFエクスポート機能
- [ ] MLOps パイプライン完全稼働
  - モデル監視サービス実装済み
  - 学習予測パイプライン準備完了

### 優先度：低

- [ ] ゲーミフィケーション要素
- [ ] ソーシャル共有機能
- [ ] カスタムテーマ作成機能
- [ ] 決済システム（Stripe）統合

## 関連ドキュメント

### プロジェクト管理

- [IDD実装ステータス](docs/IDD_IMPLEMENTATION_STATUS.md)
- [IIDエージェントガイドライン](docs/IDD_AGENT_GUIDELINES.md)
- [IDD自動化実装レポート](docs/IDD_AUTOMATION_IMPLEMENTATION_REPORT.md)
- [プロダクトバックログ](PRODUCT_BACKLOG.md)
- [GitHubバックログ管理ガイド](docs/agile/GITHUB_BACKLOG_MANAGEMENT.md)
- [スプリント計画ガイド](docs/agile/SPRINT_PLANNING_GUIDE.md)
- [Agileドキュメント概要](docs/agile/README.md)

### コンテキスト管理

- [現在のステータス](.claude/context/current-status.md)
- [実装状況](.claude/context/implementation-status.md)
- [アーキテクチャサマリー](.claude/context/architecture-summary.md)
- [主要な決定事項](.claude/context/key-decisions.md)

### 開発リファレンス

- [コマンドリファレンス](.claude/quick-ref/commands.md)
- [ファイルロケーション](.claude/quick-ref/file-locations.md)
- [コードレビューテンプレート](.claude/prompts/code-review.md)
- [アーキテクチャレビューガイド](.claude/prompts/architecture-review.md)
- [テストガイドライン](.claude/prompts/testing-guidelines.md)

## GitHub Actions ワークフロー開発ガイドライン

### 🚀 ワークフロー作成・修正ルール

Claudeは以下のGitHub Actionsルールに**必ず**従ってワークフローを作成・修正します：

#### 必須要件（MUST）

1. **命名規則遵守**
   - ワークフロー名: `{絵文字} {カテゴリ名} {具体的な処理内容}`
   - ファイル名: `{数字2桁}-{カテゴリ英語}-{具体的処理英語}.yml`
   - すべてのジョブ・ステップに日本語名を付ける

2. **コメント記載**
   - ファイルヘッダーに目的・実行タイミング・主な処理を明記
   - 重要なステップに処理内容とエラーハンドリングの説明
   - 環境変数・シークレットの用途を明確化

3. **セキュリティ**
   - 最小権限の原則（必要最小限のpermissions設定）
   - シークレットは`${{ secrets.XXX }}`形式のみ使用
   - 外部アクションはバージョン固定（タグまたはcommit SHA）

4. **パフォーマンス**
   - 並行実行制御（concurrency）の適切な設定
   - キャッシュ戦略の実装（node_modules、ビルド成果物）
   - タイムアウト設定（timeout-minutes）の明示

5. **エラーハンドリング**
   - 失敗時の通知設定
   - リトライロジックの実装（必要に応じて）
   - 適切なエラーメッセージの出力

#### 推奨事項（SHOULD）

- ワークフロー実行時間の最適化（目標: 10-15分以内）
- アーティファクトの適切な保持期間設定
- 環境固有の設定はEnvironment Secretsで管理
- マトリクス戦略による効率的なテスト実行

#### 禁止事項（MUST NOT）

- 平文でのシークレット記載
- ブランチ指定での外部アクション使用（例: `@main`）
- ユーザー入力の直接的なスクリプト使用（インジェクション対策）
- 手動実行トリガー（workflow_dispatch）の省略

### 📋 ワークフロー品質チェックリスト

新規作成・修正時は以下を確認：

- [ ] 命名規則に従っている
- [ ] 日本語コメントが適切に記載されている
- [ ] セキュリティ要件を満たしている
- [ ] パフォーマンス最適化が実施されている
- [ ] エラーハンドリングが実装されている
- [ ] 関連ドキュメントが更新されている

詳細は[GitHub Actionsルール](.claude/context/github-actions-rules.md)を参照してください。

## コントリビューション

プロジェクトへの貢献を歓迎します。以下のガイドラインに従ってください：

1. Issueを作成または既存のIssueを選択
2. フィーチャーブランチを作成（`git checkout -b feature/issue-123`）
3. IDD準拠のコミットメッセージで変更をコミット
4. プルリクエストを作成（Issue番号を含める）
5. コードレビューと自動チェックの通過を待つ
6. マージ

詳細は[IIDエージェントガイドライン](docs/IDD_AGENT_GUIDELINES.md)を参照してください。

## ライセンス

MIT

---

最終更新: 2025-09-28

## 📈 高度プロジェクト分析メトリクス（自動更新: 2025-09-28）

### 🎯 プロジェクト健全度スコア

- 🔍 **品質スコア**: 87/100 🟡
- ⚡ **パフォーマンススコア**: 97/100 🟢
- 📈 **開発ベロシティ**: increasing (平均: 0.43コミット/日)

### 🔍 コード品質分析

- 🧪 テストカバレッジ: 80.1%
- 🔄 循環複雑度: 0
- 💸 技術債務: 23箇所
- 🔒 セキュリティ脆弱性: 0個
- 🏭 コードスメル: 0個

### ⚡ パフォーマンス分析

- ⏱️ ビルド時間: 53.4秒
- 📦 バンドルサイズ: 1.3MB
- 🧪 テスト実行時間: 16.6秒
- 📚 依存関係: 95個 (脆弱性: 0個)

### 📊 生産性指標

- ✨ 機能開発: 18コミット
- 🐛 バグ修正: 0コミット
- 🔧 リファクタリング: 1コミット
- 📏 平均コミットサイズ: 303行

### 📁 コードベース統計

- 📁 コンポーネントディレクトリ数: 32個
- 🔧 サービス数: 50+ファイル
- 🎣 カスタムフック: 複数実装
- 🧪 テストファイル数: 329個
- 📊 総コード行数: 26,584行（srcディレクトリ）
- 🤖 自動化スクリプト: 120+ファイル
- 📝 ドキュメント: 25+ディレクトリ

### 🚨 アラート・推奨事項

- ⚠️ **バンドルサイズ**: バンドルサイズが1.0MBを超えています（現在: 1.3MB）

### 🎯 機能実装状況

- 📈 全体進捗: 100% (10/10)

### 💎 価値提供分析

- 📊 **スクリプト価値スコア**: 4/5 (目標達成!)
- 💰 **推定ROI**: 年間50,000-80,000円相当
- 🚀 **生産性改善**: 15-25%向上

---

_このメトリクスは包括的プロジェクト分析システムにより自動生成されています_
_実用的な問題検出、パフォーマンス監視、意思決定支援を提供_
