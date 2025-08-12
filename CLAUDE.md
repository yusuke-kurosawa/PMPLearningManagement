# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリのコードを扱う際のガイダンスを提供します。

> **コンテキスト管理**: このプロジェクトは`.claude/`ディレクトリに詳細なコンテキスト情報を保持しています。  
> 最新の実装状況は[.claude/context/implementation-status.md](.claude/context/implementation-status.md)を参照してください。

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

- [現在のステータス](.claude/context/current-status.md)
- [実装状況](.claude/context/implementation-status.md)
- [アーキテクチャサマリー](.claude/context/architecture-summary.md)
- [主要な決定事項](.claude/context/key-decisions.md)
- [IDD実装ガイド](docs/IDD_IMPLEMENTATION_STATUS.md)
- [コマンドリファレンス](.claude/quick-ref/commands.md)
- [ファイルロケーション](.claude/quick-ref/file-locations.md)

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
- **UIコンポーネント**: Radix UI（@radix-ui/react-*）完全採用
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

## プロジェクト構造（実装ベース）

```
PMPLearningManagement/
├── src/
│   ├── components/
│   │   ├── auth/                       # 認証関連コンポーネント
│   │   │   ├── AuthPage.jsx
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── UserProfile.jsx
│   │   ├── coaching/                   # AIコーチング
│   │   │   └── AICoachingDashboard.jsx
│   │   ├── collaboration/              # コラボレーション機能
│   │   │   ├── CollaborationHub.jsx
│   │   │   ├── DataManagement.jsx
│   │   │   ├── DiscussionThread.jsx
│   │   │   ├── SharedNotes.jsx
│   │   │   └── StudyGroups.jsx
│   │   ├── layout/                     # レイアウトコンポーネント
│   │   │   ├── AppLayout.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── LoadingStates.jsx
│   │   │   └── MobileBottomNavigation.jsx
│   │   ├── learning/                   # 学習機能
│   │   │   ├── ExamResults.jsx
│   │   │   ├── FlashCard.jsx
│   │   │   ├── FlashCardLearning.jsx
│   │   │   ├── LearningProgressDashboard.jsx
│   │   │   ├── MockExam.jsx
│   │   │   └── PMPGlossary.jsx
│   │   ├── mentorship/                 # メンターシップ
│   │   │   └── MentorshipHub.jsx
│   │   ├── mobile/                     # モバイル専用
│   │   │   ├── MobileTouchComponents.jsx
│   │   │   └── MobileOptimizedApp.jsx
│   │   ├── pages/                      # ページコンポーネント
│   │   │   ├── Home.jsx
│   │   │   ├── PMBOK7PerformanceDomains.jsx
│   │   │   ├── PMBOK7Principles.jsx
│   │   │   └── PMBOKMatrix.jsx
│   │   ├── shared/                     # 共通コンポーネント
│   │   │   ├── CommandPalette.jsx
│   │   │   ├── CustomizationPanel.jsx
│   │   │   ├── GlobalSearch.jsx
│   │   │   ├── PMBOKVersionSelector.jsx
│   │   │   └── UserSettingsPanel.jsx
│   │   ├── simulator/                  # シミュレーター
│   │   │   └── ProjectSimulator.jsx
│   │   ├── visualizations/             # 視覚化コンポーネント
│   │   │   ├── EnhancedNetworkGraph.jsx
│   │   │   ├── ITTOForceGraph.jsx
│   │   │   ├── IntegratedView.jsx
│   │   │   ├── KnowledgeAreaHeatmap.jsx
│   │   │   ├── MindMapView.jsx
│   │   │   ├── ProcessFlowDiagram.jsx
│   │   │   ├── ProcessHeatmap.jsx
│   │   │   ├── SankeyDiagram.jsx
│   │   │   └── VisualizationHub.jsx
│   │   └── ContextManagerDashboard.jsx # コンテキスト管理UI
│   │
│   ├── contexts/                       # React Context
│   │   ├── AuthContext.jsx
│   │   ├── ContextManagerContext.jsx
│   │   └── ThemeContext.jsx
│   │
│   ├── services/                       # サービス層
│   │   ├── aiCoachingService.js
│   │   ├── auditService.js
│   │   ├── authService.js
│   │   ├── collaborationService.js
│   │   ├── contextManager.js          # コンテキスト管理
│   │   ├── contextMonitor.js          # メモリ監視
│   │   ├── exportService.js
│   │   ├── glossaryService.js
│   │   ├── importService.js
│   │   ├── performanceOptimizer.js    # パフォーマンス最適化
│   │   ├── progressService.js
│   │   └── searchService.js
│   │
│   ├── data/                           # データ定義
│   │   ├── pmpGlossary.js
│   │   └── pmbok7Data.js
│   │
│   ├── lib/                            # ライブラリ設定
│   │   └── auth/
│   │       └── supabase.js
│   │
│   ├── hooks/                          # カスタムフック
│   │   └── useDebounce.js
│   │
│   ├── utils/                          # ユーティリティ
│   │   └── performance.js
│   │
│   ├── App.jsx                         # メインアプリケーション
│   ├── main.jsx                        # エントリーポイント
│   └── index.css                       # グローバルスタイル
│
├── .github/
│   ├── workflows/                      # GitHub Actions
│   │   ├── deploy.yml
│   │   ├── issue-driven-development.yml
│   │   ├── idd-compliance.yml
│   │   └── idd-metrics-collector.yml
│   ├── ISSUE_TEMPLATE/                # Issue テンプレート
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── database_issue.md
│   └── hooks/                         # Git Hooks
│       ├── pre-commit
│       ├── commit-msg
│       └── pre-push
│
├── .claude/                           # Claude コンテキスト管理
│   ├── context/                       # プロジェクトコンテキスト
│   │   ├── current-status.md
│   │   ├── implementation-status.md
│   │   ├── architecture-summary.md
│   │   └── key-decisions.md
│   ├── agents/                        # エージェント定義（18ファイル）
│   ├── prompts/                       # プロンプトテンプレート
│   ├── quick-ref/                     # クイックリファレンス
│   └── scripts/                       # 自動化スクリプト
│
├── docs/                              # プロジェクトドキュメント
│   ├── IDD_IMPLEMENTATION_STATUS.md
│   ├── IDD_AGENT_GUIDELINES.md
│   └── IDD_AUTOMATION_IMPLEMENTATION_REPORT.md
│
├── scripts/                           # 自動化スクリプト
│   ├── consolidate-docs.js           # ドキュメント統合
│   ├── issue-report-generator.js     # IDD レポート生成
│   ├── issue-quality-checker.js      # Issue 品質チェック
│   └── issue-kpi-analyzer.js         # KPI 分析
│
├── public/                            # 静的ファイル
├── index.html                         # HTMLテンプレート
├── vite.config.js                     # Vite設定
├── tailwind.config.js                 # Tailwind設定
├── package.json                       # 依存関係とスクリプト
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
# 開発サーバーの起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションプレビュー
npm run preview

# GitHub Pagesへのデプロイ
npm run deploy

# テストの実行
npm run test          # 単体テスト
npm run test:e2e      # E2Eテスト
npm run test:coverage # カバレッジレポート

# コード品質
npm run lint          # ESLint実行
npm run lint:fix      # ESLint自動修正
npm run format        # Prettier実行

# コンテキスト管理
npm run context:update      # コンテキスト同期
npm run context:consolidate # ドキュメント統合
npm run context:cleanup     # クリーンアップ

# IDD関連
npm run idd:check    # 準拠チェック
npm run idd:status   # ステータス表示
npm run idd:report   # レポート生成
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

## 関連ドキュメント

### プロジェクト管理
- [IDD実装ステータス](docs/IDD_IMPLEMENTATION_STATUS.md)
- [IIDエージェントガイドライン](docs/IDD_AGENT_GUIDELINES.md)
- [IDD自動化実装レポート](docs/IDD_AUTOMATION_IMPLEMENTATION_REPORT.md)

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

最終更新: 2025-08-10
## 📈 高度プロジェクト分析メトリクス（自動更新: 2025-08-10）

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
- 📁 コンポーネント数: 92個
- 🔧 サービス数: 13個  
- 🎣 カスタムフック数: 3個
- 🧪 テストファイル数: 329個
- 📊 総コード行数: 74,047行

### 🚨 アラート・推奨事項
- ⚠️ **バンドルサイズ**: バンドルサイズが1.0MBを超えています（現在: 1.3MB）

### 🎯 機能実装状況
- 📈 全体進捗: 100% (10/10)

### 💎 価値提供分析
- 📊 **スクリプト価値スコア**: 4/5 (目標達成!)
- 💰 **推定ROI**: 年間50,000-80,000円相当
- 🚀 **生産性改善**: 15-25%向上

---
*このメトリクスは包括的プロジェクト分析システムにより自動生成されています*
*実用的な問題検出、パフォーマンス監視、意思決定支援を提供*

