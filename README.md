# PMP学習管理システム

[![CI/CD Pipeline](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/deploy.yml/badge.svg)](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/deploy.yml)
[![PR Validation](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/pr-validation.yml/badge.svg)](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/pr-validation.yml)
[![Performance Monitoring](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/performance-monitoring.yml/badge.svg)](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/performance-monitoring.yml)
[![Security Scan](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/security-scan.yml/badge.svg)](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/security-scan.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-green?logo=github)](https://yusuke-kurosawa.github.io/PMPLearningManagement/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

PMBOK（プロジェクトマネジメント知識体系）学習のための包括的なWebアプリケーション

## 🌐 デモサイト

[アプリケーションを表示](https://yusuke-kurosawa.github.io/PMPLearningManagement/)

## 📋 概要

PMP学習管理システムは、PMBOK第6版および第7版の学習を支援する最先端のWebアプリケーションです。49のプロセス、その関係性、ITTO（インプット、ツールと技法、アウトプット）フレームワークを多様な視覚化手法で理解し、効率的に学習するための統合プラットフォームを提供します。AIコーチング、プロジェクトシミュレーター、メンターシップ機能など、最新の学習支援機能を搭載しています。

## ✨ 主な機能

### 📊 視覚化機能

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

### 📚 学習支援機能

- **PMP用語集**: 45以上の重要用語を収録した検索可能な用語集（カテゴリフィルタリング対応）
- **学習進捗ダッシュボード**: 知識エリア別・プロセス群別の習熟度管理と統計表示
- **フラッシュカード学習**: ITTOを効率的に暗記する3Dアニメーション付きフラッシュカード
- **PMP模擬試験**: 実際の試験形式を再現した180問・230分のフル模擬試験（詳細な結果分析付き）

### 🤖 AI・高度な学習機能

- **AIコーチングダッシュボード**: 個人に最適化された学習アドバイスとフィードバック
- **プロジェクトシミュレーター**: 実際のプロジェクトシナリオをシミュレート
- **メンターシップハブ**: インストラクターとの1対1の学習サポート

### 👥 コラボレーション機能

- **ディスカッションフォーラム**: 学習者同士の情報交換
- **スタディグループ**: グループ学習の管理と進捗共有
- **共有ノート**: 学習メモの共有と共同編集
- **データ管理**: インポート/エクスポート機能

### 🔐 認証・セキュリティ

- **ユーザー認証**: Supabaseによる安全な認証システム
- **ロールベースアクセス制御（RBAC）**: 学習者、インストラクター、管理者の役割別アクセス管理
- **プロテクテッドルート**: 権限に基づいたコンテンツアクセス制御
- **プロファイル管理**: ユーザープロフィールのカスタマイズ

### 📱 モバイル・PWA対応

- **PWA（Progressive Web App）**: オフライン対応、インストール可能
- **レスポンシブデザイン**: デスクトップとモバイルデバイスに完全最適化
- **モバイル最適化コンポーネント**: タッチ操作に最適化された専用UI
- **モバイル専用ナビゲーション**: ボトムナビゲーションバー

### 🎨 カスタマイズ機能

- **ダークモード**: 目に優しいダークテーマ
- **カスタマイゼーションパネル**: UI設定のカスタマイズ
- **PMBOK版切り替え**: 第6版と第7版の切り替え
- **ユーザー設定**: 個人の学習設定を保存

## 🚀 セットアップ

### 前提条件

- Node.js 18以上
- npm 8以上

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/yusuke-kurosawa/PMPLearningManagement.git
cd PMPLearningManagement

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### ビルドとデプロイ

```bash
# プロダクションビルド
npm run build

# 最適化されたビルド
npm run build:optimized

# GitHub Pagesへのデプロイ
npm run deploy

# 本番環境へのデプロイ
npm run deploy:production
```

## 🛠️ 技術スタック

### フロントエンド

- **フレームワーク**: React 18.2 + React Router v6
- **状態管理**: Zustand, React Query (TanStack Query)
- **視覚化**: D3.js v7, D3-sankey, Recharts
- **スタイリング**: Tailwind CSS v3, Tailwind Animate
- **UIコンポーネント**: Radix UI, Lucide React Icons
- **アニメーション**: Framer Motion
- **ビルドツール**: Vite v5
- **型安全性**: TypeScript

### バックエンド・認証

- **認証**: Supabase Auth
- **データベース**: Supabase (PostgreSQL)
- **リアルタイム**: Supabase Realtime

### テスト

- **単体テスト**: Vitest, React Testing Library
- **E2Eテスト**: Playwright
- **アクセシビリティテスト**: Jest-axe, Axe Playwright
- **ミューテーションテスト**: Stryker
- **プロパティベーステスト**: Fast-check
- **カオステスト**: カスタム実装
- **並列テスト実行**: Vitest Pool Threads

### CI/CD・DevOps（21のワークフロー）

- **デプロイメント**: GitHub Actions → GitHub Pages
- **PRバリデーション**: 自動コードレビュー、テスト実行
- **セキュリティスキャン**: npm audit, ゼロトラストセキュリティ
- **パフォーマンス監視**: Lighthouse CI, バンドルサイズ分析
- **統合テスト**: 自動統合テスト実行
- **高度なテスト**: ミューテーション、プロパティ、カオステスト
- **AI支援レビュー**: AIによるコードレビュー
- **オブザーバビリティ**: ログ、メトリクス、トレース
- **品質ゲート**: 包括的な品質チェック
- **並列テスト**: チーム別並列実行
- **テストデータ管理**: 自動データ生成・管理
- **開発者体験**: DX向上のためのツール
- **監視設定**: アプリケーション監視
- **依存関係管理**: 依存関係の健全性チェック
- **コンプライアンス監査**: 規制要件のチェック
- **通知**: Slack/Discord統合
- **Dependabot**: 自動マージ設定
- **機能管理**: フィーチャーフラグ
- **インフラセキュリティ**: インフラストラクチャのセキュリティ監査

### 開発ツール

- **コード品質**: ESLint, Prettier
- **Git Hooks**: Husky, lint-staged
- **パッケージ管理**: npm

## 📱 モバイル・PWA対応

### Progressive Web App機能

- **オフライン対応**: Service Workerによるキャッシュ戦略
- **インストール可能**: ホーム画面への追加
- **プッシュ通知**: 学習リマインダー（実装予定）
- **バックグラウンド同期**: オフラインデータの自動同期

### モバイル最適化

- **タッチ最適化UI**: タッチジェスチャー対応
- **モバイル専用コンポーネント**:
  - MobileOptimizedApp（PWA管理）
  - MobilePMBOKMatrix（最適化されたマトリックス）
  - MobileFlashCard（スワイプ対応フラッシュカード）
  - MobileMockExam（モバイル向け試験UI）
  - MobileProgressDashboard（コンパクトな進捗表示）
- **レスポンシブブレークポイント**: sm (640px), md (768px), lg (1024px)
- **パフォーマンス最適化**: 遅延ロード、コード分割

## 🔄 開発ワークフロー

### 利用可能なスクリプト

```bash
# 開発
npm run dev                    # 開発サーバーの起動
npm run build                  # プロダクションビルド
npm run build:optimized        # 最適化されたビルド
npm run start                  # プロダクションプレビュー

# コード品質
npm run lint                   # ESLintの実行
npm run lint:fix               # ESLint問題の自動修正
npm run format                 # Prettierでコードフォーマット
npm run format:check           # フォーマットチェック
npm run typecheck              # TypeScript型チェック

# テスト
npm run test                   # 単体テストの実行
npm run test:ui                # Vitestの UIモード
npm run test:coverage          # カバレッジレポート生成
npm run test:watch             # ウォッチモードでテスト
npm run test:e2e               # E2Eテストの実行
npm run test:e2e:ui            # PlaywrightのUIモード
npm run test:a11y              # アクセシビリティテスト
npm run test:mutation          # ミューテーションテスト
npm run test:property          # プロパティベーステスト
npm run test:chaos             # カオステスト
npm run test:advanced          # 高度なテストの全実行
npm run test:quality-gate      # 品質ゲートテスト
npm run test:team-parallel     # チーム並列テスト
npm run test:all               # すべてのテストを実行

# デプロイメント
npm run deploy                 # GitHub Pagesへのデプロイ
npm run deploy:production      # 本番環境へのデプロイ

# 分析・監視
npm run analyze                # バンドル分析
npm run security:audit         # セキュリティ監査
npm run performance:budget     # パフォーマンス予算チェック

# コンテキスト管理
npm run sync-context           # Claudeコンテキストの同期
npm run context:update         # コンテキストの更新
npm run context:view           # 現在のステータス表示
```

### CI/CDパイプライン（DevOps成熟度レベル5）

#### 21の自動化されたワークフロー

1. **デプロイメント** (`deploy.yml`)
   - プロダクションビルドの最適化
   - GitHub Pagesへの自動デプロイ
   - キャッシュ戦略の実装

2. **PRバリデーション** (`pr-validation.yml`)
   - コード品質チェック（ESLint、Prettier）
   - TypeScriptコンパイル
   - 単体テストの実行
   - カバレッジレポート

3. **セキュリティスキャン** (`security-scan.yml`)
   - npm監査（高レベル脆弱性）
   - 依存関係のセキュリティチェック
   - SAST（静的アプリケーションセキュリティテスト）

4. **パフォーマンス監視** (`performance-monitoring.yml`)
   - Lighthouse CIによるパフォーマンステスト
   - バンドルサイズ分析
   - ランタイムパフォーマンスメトリクス

5. **統合テスト** (`integration-test.yml`)
   - API統合テスト
   - コンポーネント統合テスト
   - データフロー検証

6. **高度なテスト** (`advanced-testing.yml`)
   - ミューテーションテスト
   - プロパティベーステスト
   - カオステスト
   - カバレッジ閾値チェック

7. **AI支援レビュー** (`ai-assisted-review.yml`)
   - AIによるコードレビュー
   - ベストプラクティスの提案
   - セキュリティパターンの検出

8. **オブザーバビリティ** (`observability.yml`)
   - ログ集約
   - メトリクス収集
   - 分散トレーシング

9. **品質ゲート** (`advanced-quality-gates.yml`)
   - 包括的な品質チェック
   - 技術的負債の測定
   - コード複雑度分析

10. **並列テスト実行** (`test-parallel.yml`)
    - チーム別並列実行
    - テスト結果の集約
    - 最適化された実行時間

11. **テストデータ管理** (`test-data-management.yml`)
    - テストデータの自動生成
    - データのバージョン管理
    - シードデータの管理

12. **開発者体験** (`developer-experience.yml`)
    - DXメトリクスの収集
    - ビルド時間の最適化
    - 開発環境の自動セットアップ

13. **監視設定** (`monitoring-setup.yml`)
    - アプリケーション監視
    - エラートラッキング
    - パフォーマンス監視

14. **依存関係管理** (`dependency-health-check.yml`)
    - 依存関係の健全性チェック
    - ライセンスコンプライアンス
    - 更新の自動提案

15. **コンプライアンス監査** (`compliance-audit.yml`)
    - 規制要件のチェック
    - アクセシビリティ標準
    - データプライバシー

16. **ゼロトラストセキュリティ** (`zero-trust-security.yml`)
    - ランタイムセキュリティ
    - 最小権限の原則
    - セキュリティポリシーの適用

17. **通知** (`notifications.yml`)
    - Slack/Discord通知
    - ステータス更新
    - アラート管理

18. **Dependabot自動マージ** (`dependabot-auto-merge.yml`)
    - 安全な更新の自動マージ
    - バージョン制約の管理

19. **機能管理** (`feature-management.yml`)
    - フィーチャーフラグ
    - A/Bテスト設定
    - 段階的ロールアウト

20. **インフラセキュリティ** (`infrastructure-security.yml`)
    - インフラストラクチャのスキャン
    - コンテナセキュリティ
    - クラウド設定の検証

21. **標準テスト** (`test.yml`)
    - 基本的なテストスイート
    - 高速フィードバック

### ブランチ保護

- mainブランチはPRレビュー必須
- すべてのステータスチェックが必須
- mainブランチへの直接プッシュ禁止
- マージ時の自動デプロイメント
- 管理者も例外なし

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！以下の手順に従ってください：

### 貢献の流れ

1. リポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更を実装
4. テストを実行 (`npm run test:all`)
5. 変更をコミット (`git commit -m 'feat: 素晴らしい機能を追加'`)
6. ブランチにプッシュ (`git push origin feature/amazing-feature`)
7. プルリクエストを作成

### コードスタイル

- **TypeScript**: 型安全性を確保
- **ESLint/Prettier**: 設定に従ったコード品質
- **テスト**: 新機能には必ず単体テストを追加
- **アクセシビリティ**: WCAG 2.1 AA準拠
- **コメント**: 複雑な関数にはJSDocコメントを追加

### コミットメッセージ規約

```
feat: 新機能の追加
fix: バグ修正
docs: ドキュメントの更新
style: フォーマットの変更
refactor: リファクタリング
test: テストの追加・修正
chore: ビルドプロセスやツールの変更
perf: パフォーマンス改善
```

### プルリクエストのチェックリスト

- [ ] コードがプロジェクトのスタイルガイドに従っている
- [ ] 自己レビューを実施した
- [ ] コードにコメントを追加した（特に複雑な部分）
- [ ] ドキュメントを更新した
- [ ] 変更によって既存の機能が壊れていない
- [ ] テストを追加し、すべてのテストがパスしている
- [ ] 依存関係の変更を最小限に抑えた

## 📊 プロジェクト統計

- **コンポーネント数**: 100以上
- **テストカバレッジ**: 80%以上目標
- **Lighthouseスコア**:
  - パフォーマンス: 90+
  - アクセシビリティ: 95+
  - ベストプラクティス: 100
  - SEO: 100
- **ブラウザサポート**: Chrome, Firefox, Safari, Edge（最新2バージョン）

## 🔮 今後のロードマップ

### バージョン 2.1（2024 Q2）

- [ ] PMBOK第7版の完全サポート
- [ ] AI学習アシスタントの強化
- [ ] リアルタイムコラボレーション機能
- [ ] 音声認識による学習サポート

### バージョン 2.2（2024 Q3）

- [ ] 多言語対応（英語、中国語、スペイン語）
- [ ] APIバックエンドの実装
- [ ] 高度な分析ダッシュボード
- [ ] ゲーミフィケーション要素の追加

### バージョン 3.0（2024 Q4）

- [ ] ネイティブモバイルアプリ（React Native）
- [ ] 企業向けエンタープライズ機能
- [ ] LMS（Learning Management System）統合
- [ ] AIによる個別学習パスの生成

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
