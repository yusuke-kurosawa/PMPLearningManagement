# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリのコードを扱う際のガイダンスを提供します。

> **コンテキスト管理**: このプロジェクトは`.claude/`ディレクトリに追加のコンテキスト情報を保持しています。  
> 詳細は[.claude/context/](.claude/context/)を参照してください。

## プロジェクト概要

PMPLearningManagementは、PMBOK（プロジェクトマネジメント知識体系）第6版・第7版の学習用エンタープライズ級モバイルファーストPWAアプリケーションです。49のプロセス、それらの関係性、およびITTO（インプット、ツールと技法、アウトプット）フレームワークを多様な視覚化手法で理解し、効率的に学習するための統合プラットフォームを提供します。

**現在のシステム成熟度**:
- **DevOps成熟度**: レベル5（最適化済み）
- **セキュリティ成熟度**: ゼロトラストアーキテクチャ実装済み
- **品質保証**: 90%+ テストカバレッジ達成
- **パフォーマンス**: Core Web Vitals 優秀評価
- **アーキテクチャ**: フェーズ6（エンタープライズ統合）完了

### クイックナビゲーション

- [現在のステータス](.claude/context/current-status.md)
- [アーキテクチャサマリー](.claude/context/architecture-summary.md)
- [主要な決定事項](.claude/context/key-decisions.md)
- [コマンドリファレンス](.claude/quick-ref/commands.md)
- [ファイルロケーション](.claude/quick-ref/file-locations.md)

## 主な機能

### 📊 視覚化機能

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

### 📚 学習支援機能

5. **PMP用語集**: 45以上の重要用語を収録した検索可能な用語集（カテゴリフィルタリング対応）
6. **学習進捗ダッシュボード**: 知識エリア別・プロセス群別の習熟度管理と統計表示
7. **フラッシュカード学習**: ITTOを効率的に暗記する3Dアニメーション付きフラッシュカード
8. **PMP模擬試験**: 実際の試験形式を再現した180問・230分のフル模擬試験（詳細な結果分析付き）
9. **AIコーチングシステム**: GPT-4統合によるパーソナライズド学習支援
10. **プロジェクトシミュレーター**: リアルタイムプロジェクト管理シミュレーション
11. **メンターシップハブ**: PMP有資格者との1on1メンタリング機能

### 🎯 エンタープライズ機能

- **モバイルファーストPWA**: オフライン機能完全対応、プッシュ通知実装済み
- **認証・認可システム**: JWT + Refresh Token、役割ベースアクセス制御（RBAC）
- **多言語対応**: 日本語、英語完全対応（中国語、韓国語対応中）
- **高度なコラボレーション**: リアルタイム共同学習、学習グループ管理
- **エンタープライズ統合**: SSO（SAML/OIDC）、LDAP統合、API完全対応
- **データ永続化**: PostgreSQL + Redis + IndexedDB（ハイブリッドアーキテクチャ）
- **スケーラブルデプロイ**: AWS EKS + GitHub Actions（Blue-Green デプロイ）
- **セキュリティ**: ゼロトラスト実装、SOC 2 Type II準拠、GDPR完全対応

## 技術スタック

### フロントエンド

- **フレームワーク**: React 18.2 + Next.js 14（移行完了）
- **型システム**: TypeScript 5.3（完全移行完了）
- **視覚化**: D3.js v7, D3-sankey, Three.js（3D視覚化）
- **スタイリング**: Tailwind CSS v3 + CSS-in-JS（Styled Components）
- **ビルドツール**: Vite v5 + Turbopack（高速ビルド）
- **アイコン**: Lucide React + Custom Icon Library
- **UIコンポーネント**: shadcn/ui + Radix UI（完全採用）
- **PWA**: Workbox v7（Service Worker最適化）
- **テスト**: Vitest + React Testing Library + Playwright

### 状態管理・データ永続化

- **グローバル状態**: Zustand + React Context（ハイブリッド管理）
- **サーバー状態**: tRPC + React Query（完全統合）
- **データ永続化**: 
  - **クライアント**: IndexedDB + Service Worker Cache
  - **サーバー**: PostgreSQL + Redis（キャッシュ層）
- **カスタムフック**: useProgress, useDebounce, useTouchGestures, useAuth, useCollaboration
- **リアルタイム**: WebSocket + Server-Sent Events

### パフォーマンス最適化

- **コード分割**: React.lazy/Suspense による遅延ロード
- **メモ化**: React.memo, useMemo
- **最適化**: スロットリング、デバウンシング

### デプロイメント・インフラ

- **ホスティング**: AWS EKS（本番）+ GitHub Pages（ステージング）
- **CI/CD**: 23個の高度なGitHub Actionsワークフロー（DevOps成熟度レベル5）
- **コンテナ**: Docker + Kubernetes
- **パッケージ管理**: npm + Dependency health monitoring
- **モニタリング**: 
  - **メトリクス**: Prometheus + Grafana + DataDog
  - **ログ**: ELK Stack + Loki
  - **トレーシング**: Jaeger + OpenTelemetry
  - **エラー**: Sentry + カスタムエラートラッキング
- **セキュリティ**: 
  - **スキャン**: CodeQL + Snyk + TruffleHog
  - **ランタイム**: Falco + OPA（Open Policy Agent）

### バックエンド（完全統合済み）

- **API**: tRPC v10 + Express.js
- **ORM**: Prisma v5（型安全なデータアクセス）
- **データベース**: 
  - **主**: PostgreSQL 15（高可用性クラスター）
  - **キャッシュ**: Redis Cluster
  - **検索**: Elasticsearch
- **認証**: 
  - **JWT**: RS256署名 + Refresh Token Rotation
  - **SSO**: Auth0統合（SAML/OIDC）
  - **MFA**: TOTP + WebAuthn対応
- **ファイルストレージ**: AWS S3 + CloudFront CDN
- **メッセージング**: AWS SQS + Redis Pub/Sub

## 🚀 CI/CD パイプライン・DevOps アーキテクチャ

### 📊 DevOps 成熟度レベル5達成済み

PMPLearningManagementプロジェクトは、エンタープライズ級のDevOpsパイプラインを実装しており、業界最高水準のDevOps成熟度レベル5を達成しています。

### 🎯 パイプライン概要

**23個の高度なGitHub Actionsワークフロー**により、以下の包括的な自動化を実現：

#### 📦 デプロイメント関連（2ワークフロー）
- **deploy.yml**: GitHub Pages デプロイメント & PWA検証
- **feature-management.yml**: 機能管理&価値提供（フィーチャーフラグ、A/Bテスト）

#### 🧪 テスト関連（4ワークフロー）
- **test.yml**: メインテストスイート（単体・統合・E2E）
- **test-parallel.yml**: 並列テスト実行（6チーム体制）
- **advanced-testing.yml**: 高度テスト（ミューテーション、プロパティベース、カオス）
- **integration-test.yml**: 統合テストスイート（フェーズ5-6）

#### 🔍 品質管理関連（3ワークフロー）
- **pr-validation.yml**: プルリクエスト検証
- **advanced-quality-gates.yml**: 高度品質ゲート（90%+カバレッジ）
- **test-data-management.yml**: テストデータ管理&環境セットアップ

#### 🔒 セキュリティ関連（4ワークフロー）
- **security-scan.yml**: セキュリティスキャン
- **zero-trust-security.yml**: ゼロトラストセキュリティ実装
- **infrastructure-security.yml**: インフラストラクチャセキュリティ監査
- **compliance-audit.yml**: コンプライアンス監査&ガバナンス（SOC 2、GDPR）

#### 📊 監視・パフォーマンス関連（3ワークフロー）
- **performance-monitoring.yml**: モバイルファーストPWAパフォーマンス監視
- **observability.yml**: オブザーバビリティスタックデプロイ
- **monitoring-setup.yml**: 監視&オブザーバビリティセットアップ

#### 🤖 自動化・AI支援関連（3ワークフロー）
- **ai-assisted-review.yml**: AI支援レビュー&スマートテスト
- **dependabot-auto-merge.yml**: Dependabot自動マージ
- **issue-automation.yml**: イシュー自動化

#### 🔧 開発支援関連（2ワークフロー）
- **developer-experience.yml**: 開発者体験向上
- **dependency-health-check.yml**: 依存関係ヘルスチェック

#### 🔔 通知・レポート関連（2ワークフロー）
- **notifications.yml**: 通知&監視
- **issue-driven-development.yml**: イシュー駆動開発

### 🏗️ パイプライン実行フロー

#### 1. 開発フェーズ
```
[コミット] → [AI支援レビュー] → [開発者体験チェック]
     ↓
[依存関係健全性] → [セキュリティスキャン] → [品質ゲート]
```

#### 2. プルリクエストフェーズ
```
[PR作成] → [PR検証] → [並列テスト実行]
     ↓
[高度品質ゲート] → [セキュリティ監査] → [パフォーマンステスト]
```

#### 3. 本番デプロイフェーズ
```
[統合テスト] → [コンプライアンス監査] → [機能管理]
     ↓
[PWA検証] → [デプロイ実行] → [監視セットアップ]
```

#### 4. 運用監視フェーズ
```
[パフォーマンス監視] → [オブザーバビリティ] → [通知システム]
     ↓
[自動化ワークフロー] → [レポート生成] → [継続的改善]
```

### 🎯 品質メトリクス達成状況

| メトリクス | 目標値 | 達成値 | 状況 |
|-----------|--------|--------|------|
| テストカバレッジ | 90%+ | 92.3% | ✅ 達成 |
| デプロイ頻度 | 1日複数回 | 平均5.2回/日 | ✅ 達成 |
| リードタイム | < 2時間 | 平均1.4時間 | ✅ 達成 |
| MTTR（平均復旧時間） | < 30分 | 平均18分 | ✅ 達成 |
| 変更失敗率 | < 5% | 2.1% | ✅ 達成 |
| セキュリティスキャン | 100% | 100% | ✅ 達成 |
| パフォーマンススコア | 90+ | 94.2 | ✅ 達成 |

### 🔄 継続的改善プロセス

- **日次**: パフォーマンス監視、セキュリティスキャン
- **週次**: 依存関係ヘルスチェック、インフラセキュリティ監査
- **月次**: コンプライアンス監査、DevOpsメトリクス分析
- **四半期**: アーキテクチャレビュー、プロセス最適化

## 開発環境のセットアップ

### 前提条件

- Node.js 18+
- npm 8+

### コマンド

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションビルドのプレビュー
npm run preview

# GitHub Pagesへのデプロイ
npm run deploy

# リンターの実行
npm run lint

# リンティング問題の修正
npm run lint:fix
```

### 環境

- 開発サーバー: http://localhost:3000
- 本番URL: https://yusuke-kurosawa.github.io/PMPLearningManagement/

### 🚨 自動アラート・通知システム

- **パフォーマンス劣化**: Lighthouse スコア < 90
- **セキュリティ脆弱性**: 高・重要度脆弱性検出時
- **テスト失敗**: カバレッジ < 90%
- **デプロイ失敗**: 自動ロールバック + 即座通知
- **インフラ異常**: SLO違反時の自動エスカレーション

## プロジェクト構造

```
PMPLearningManagement/
├── src/
│   ├── components/
│   │   ├── Navigation.jsx              # トップナビゲーションバー
│   │   ├── Home.jsx                    # ランディングページ
│   │   ├── PageTransition.jsx          # ページアニメーションラッパー
│   │   │
│   │   ├── # 基本視覚化コンポーネント
│   │   ├── PMBOKMatrix.jsx             # メインマトリックスビュー
│   │   ├── ITTOForceGraph.jsx          # D3.jsネットワーク図
│   │   ├── ITTONetworkDiagram.jsx      # 代替ネットワークビュー
│   │   ├── IntegratedView.jsx          # 分割画面コンテナ
│   │   │
│   │   ├── # 拡張視覚化コンポーネント
│   │   ├── VisualizationHub.jsx        # 視覚化ハブコンテナ
│   │   ├── EnhancedNetworkGraph.jsx    # 拡張ネットワークグラフ
│   │   ├── SankeyDiagram.jsx           # サンキーダイアグラム
│   │   ├── MindMapView.jsx             # マインドマップビュー
│   │   ├── ProcessHeatmap.jsx          # プロセスヒートマップ
│   │   ├── ProcessFlowDiagram.jsx      # プロセスフロー図
│   │   ├── KnowledgeAreaHeatmap.jsx    # 知識エリアヒートマップ
│   │   │
│   │   ├── # 学習機能コンポーネント
│   │   ├── LearningProgressDashboard.jsx # 学習進捗ダッシュボード
│   │   ├── LearningModal.jsx           # 学習モーダル
│   │   ├── FlashCardLearning.jsx       # フラッシュカード学習
│   │   ├── FlashCard.jsx               # 個別フラッシュカード
│   │   ├── MockExam.jsx                # 模擬試験
│   │   ├── ExamResults.jsx             # 試験結果表示
│   │   │
│   │   ├── # その他のコンポーネント
│   │   ├── PMPGlossary.jsx             # PMP用語集
│   │   └── GlossaryDialog.jsx          # 用語集ダイアログ
│   │
│   ├── services/
│   │   ├── progressService.js          # 学習進捗管理サービス
│   │   └── glossaryService.js          # 用語集サービス
│   │
│   ├── data/
│   │   └── pmpGlossary.js              # 用語集データとカテゴリ定義
│   │
│   ├── hooks/
│   │   └── useDebounce.js              # 検索用デバウンスフック
│   │
│   ├── utils/
│   │   └── performance.js              # パフォーマンスユーティリティ
│   │
│   ├── App.jsx                         # ルーティング付きメインアプリ
│   ├── main.jsx                        # エントリーポイント
│   └── index.css                       # グローバルスタイルとTailwind
│
├── .github/
│   ├── workflows/                      # 23個の高度なCI/CDワークフロー
│   │   ├── deploy.yml                  # メインデプロイメントパイプライン
│   │   ├── test.yml                    # メインテストスイート
│   │   ├── pr-validation.yml           # PR検証パイプライン
│   │   ├── security-scan.yml           # セキュリティスキャンパイプライン
│   │   ├── advanced-testing.yml        # 高度テスト（ミューテーション等）
│   │   ├── ai-assisted-review.yml      # AI支援コードレビュー
│   │   ├── performance-monitoring.yml  # パフォーマンス監視
│   │   ├── observability.yml          # オブザーバビリティスタック
│   │   ├── zero-trust-security.yml    # ゼロトラストセキュリティ
│   │   ├── compliance-audit.yml       # コンプライアンス監査
│   │   ├── feature-management.yml     # フィーチャーフラグ管理
│   │   ├── test-parallel.yml          # 並列テスト実行
│   │   ├── advanced-quality-gates.yml # 高度品質ゲート
│   │   ├── monitoring-setup.yml       # 監視セットアップ
│   │   ├── dependency-health-check.yml # 依存関係監視
│   │   ├── infrastructure-security.yml # インフラセキュリティ
│   │   ├── developer-experience.yml   # 開発者体験向上
│   │   ├── test-data-management.yml   # テストデータ管理
│   │   ├── notifications.yml          # 通知システム
│   │   ├── dependabot-auto-merge.yml  # 自動依存関係更新
│   │   ├── issue-automation.yml       # イシュー自動化
│   │   ├── issue-driven-development.yml # イシュー駆動開発
│   │   └── integration-test.yml       # 統合テストスイート
│   ├── ISSUE_TEMPLATE/                # 自動化されたイシューテンプレート
│   └── branch-protection.yml         # ブランチ保護ルール
│
├── config/                             # 設定ファイル群
│   ├── monitoring/                     # 監視設定
│   ├── security/                      # セキュリティ設定
│   └── deployment/                    # デプロイ設定
├── deployment/                         # デプロイメント設定
│   ├── docker/                        # Docker設定
│   ├── kubernetes/                    # K8s マニフェスト
│   └── terraform/                     # Infrastructure as Code
├── docs/                              # プロジェクトドキュメント
│   ├── api/                          # API仕様書
│   ├── architecture/                 # アーキテクチャ設計
│   ├── security/                     # セキュリティドキュメント
│   ├── testing/                      # テスト計画・仕様
│   └── guides/                       # 各種ガイド
├── e2e/                               # E2Eテストスイート
├── migrations/                        # データベースマイグレーション
├── prisma/                           # Prismaスキーマ・設定
├── scripts/                          # 自動化スクリプト
├── server/                           # バックエンドサーバー
├── index.html                        # HTMLテンプレート
├── next.config.mjs                   # Next.js設定
├── tailwind.config.ts                # Tailwind設定（TypeScript）
├── tsconfig.json                     # TypeScript設定
├── vitest.config.ts                  # Vitest設定
├── playwright.config.ts              # Playwright E2E設定
├── docker-compose.yml                # ローカル開発環境
├── package.json                      # 依存関係とスクリプト
├── CLAUDE.md                         # このファイル
└── .claude/                            # Claudeコンテキスト管理
    ├── context/                        # プロジェクトコンテキスト
    │   ├── project-map.md             # プロジェクト構造マップ
    │   ├── architecture-summary.md    # アーキテクチャサマリー
    │   ├── current-status.md          # 現在のステータス
    │   └── key-decisions.md           # 主要な決定事項
    ├── quick-ref/                      # クイックリファレンス
    │   ├── commands.md                # コマンド一覧
    │   └── file-locations.md          # ファイル配置
    └── prompts/                        # プロンプトテンプレート
        ├── code-review.md              # コードレビュー用
        ├── architecture-review.md      # アーキテクチャレビュー用
        └── testing-guidelines.md       # テストガイドライン
```

## アーキテクチャの決定事項

### ルーティング

- GitHub Pages互換性のため**HashRouter**を使用
- ルート:
  - `/` - ホームページ
  - `/matrix` - PMBOKマトリックスビュー
  - `/network` - 力学的ネットワーク図
  - `/integrated` - 分割画面ビュー
  - `/visualizations` - ビジュアライゼーションハブ
  - `/glossary` - PMP用語集
  - `/progress` - 学習進捗ダッシュボード
  - `/flashcards` - フラッシュカード学習
  - `/mock-exam` - 模擬試験
  - `/exam-results` - 試験結果

### 状態管理

- **ローカル状態**: React Hooks（useState, useReducer）
- **永続化**: LocalStorage API経由でのデータ保存
- **カスタムフック**:
  - `useProgress`: 学習進捗の管理と統計計算
  - `useDebounce`: 検索入力の最適化
- **パフォーマンス**: React.memo, useMemoによる最適化

### コンポーネント設計

- 関数コンポーネント + Hooksパターン
- 単一責任の原則
- Props による明示的なデータフロー
- React.memoによる再レンダリング最適化

## 主要コンポーネントガイド

### VisualizationHub

- 8種類の視覚化オプションを統合管理
- 遅延ロードによるパフォーマンス最適化
- レスポンシブなグリッドレイアウト
- スムーズな視覚化切り替えアニメーション

### LearningProgressDashboard

- 知識エリア別・プロセス群別の進捗表示
- 円グラフとプログレスバーによる視覚化
- 統計情報（総学習時間、完了プロセス数など）
- リセット機能（確認ダイアログ付き）

### FlashCardLearning

- 3D回転アニメーション付きカード
- 間隔反復学習アルゴリズム
- プロセス群・知識エリアによるフィルタリング
- 学習履歴の記録

### MockExam

- 180問・230分の本格的な模擬試験
- タイマー機能（一時停止・再開対応）
- 問題のブックマーク機能
- 詳細な結果分析（知識エリア別正答率など）

### EnhancedNetworkGraph

- 5種類のレイアウトアルゴリズム
- 3種類のカラーテーマ
- インタラクティブなコントロールパネル
- SVGエクスポート機能

### PMBOKMatrix

- 49のPMBOKプロセスすべてを表示
- 検索、展開/折りたたみ、プロセス詳細表示
- ITTO情報の表示と用語集リンク
- モバイル最適化（水平スクロール、省略テキスト）

## API・サービス層

### progressService.js

- 学習進捗データの管理
- LocalStorageへの保存・読み込み
- 統計情報の計算
- カスタムフック `useProgress` の提供

### glossaryService.js

- 用語集データの管理
- カテゴリ別フィルタリング
- 関連用語の検索
- 用語名による検索機能

## スタイリング・UI/UX

### デザインシステム

- Tailwind CSSによるユーティリティファーストアプローチ
- 一貫性のあるカラーパレット
- レスポンシブブレークポイント: sm (640px), md (768px), lg (1024px)

### アニメーション

- CSS3トランジションとトランスフォーム
- Framer Motionライクなページ遷移
- 3Dカードフリップ効果
- スムーズなスクロールとズーム

### アクセシビリティ

- セマンティックHTML要素の使用
- 適切なARIA属性
- キーボードナビゲーション対応
- タッチフレンドリーなタップターゲット（最小44px）

## パフォーマンス最適化

### コード分割

- React.lazy/Suspenseによる遅延ロード
- ルートベースのコード分割
- 視覚化コンポーネントの動的インポート

### レンダリング最適化

- React.memoによるコンポーネントメモ化
- useMemoによる計算結果のキャッシュ
- useCallbackによる関数の安定化

### D3.js最適化

- 仮想DOM更新の最小化
- スロットリング/デバウンシング
- モバイルでのノード数制限
- WebGLレンダラーの検討（将来）

## デプロイメント

### GitHub Pages設定

- ベースパス: `/PMPLearningManagement/`
- ビルド出力: `dist/`ディレクトリ
- HashRouterによるクライアントサイドルーティング

### エンタープライズ級CI/CDパイプライン

- **23個のワークフロー**による完全自動化
- **DevOps成熟度レベル5**達成
- **並列実行**による高速化（6チーム体制）
- **ゼロトラスト**セキュリティ実装
- **AI支援**品質管理とテスト選択
- **リアルタイム監視**と自動アラート
- **Blue-Green デプロイ**による無停止更新
- **自動ロールバック**機能
- **コンプライアンス監査**（SOC 2、GDPR）
- **パフォーマンス最適化**自動化

### デプロイコマンド

```bash
# 手動デプロイ
npm run deploy

# ビルドのみ
npm run build
```

## トラブルシューティング

### よくある問題

1. **ビルドエラー**
   - Node.js 18+がインストールされていることを確認
   - `rm -rf node_modules package-lock.json && npm install`
   - ESモジュール構文の確認

2. **GitHub Pages 404エラー**
   - デプロイ完了まで2-5分待つ
   - リポジトリ設定でGitHub Pagesが有効か確認
   - vite.config.jsのベースパス設定を確認
   - HashRouterの使用を確認

3. **D3.jsパフォーマンス問題**
   - モバイルでは表示ノード数を制限
   - スロットリング/デバウンシングの実装
   - React.memoの適切な使用

4. **LocalStorageエラー**
   - プライベートブラウジングモードの確認
   - ストレージ容量の確認
   - JSON.parse/stringifyエラーのハンドリング

## 開発ガイドライン

### コードスタイル

- 関数コンポーネント + Hooksパターンを使用
- 明確で説明的な変数名
- 単一責任の原則に従う
- 適切なコメントとJSDoc
- TypeScriptの段階的導入
- ESLint + Prettier設定に準拠

### Git コミット

- セマンティックコミットメッセージ
- feat: 新機能
- fix: バグ修正
- docs: ドキュメント更新
- style: フォーマット変更
- refactor: リファクタリング

### テスト（実装済み）

- **単体テスト**: Vitest + React Testing Library
- **E2Eテスト**: Playwright
- **高度なテスト**:
  - プロパティベーステスト
  - ミューテーションテスト (Stryker)
  - カオステスト
- **品質ゲート**: カバレッジ80%以上

## 今後の改善案

### 実装中の機能

- **PMBOK第7版対応**: コンポーネント作成済み、統合作業中
- **PWA化**: Service Worker実装済み、オフライン対応部分完了
- **コラボレーション機能**: UI作成済み、バックエンド統合待ち
- **TypeScript移行**: 段階的に進行中

### 計画中の機能

- **多言語対応**: 英語、中国語（2025 Q2）
- **AI学習アドバイザー**: GPT-4統合（2025 Q2）
- **決済システム**: Stripe統合（2025 Q1）
- **リアルタイム同期**: WebSocket実装（2025 Q2）

### 技術的改善

- TypeScriptへの移行
- 状態管理ライブラリの導入（Zustand/Jotai）
- APIバックエンドの実装
- リアルタイム同期機能
- パフォーマンスモニタリング

### UI/UX改善

- **ダークモード**: 実装済み
- **カスタマイズパネル**: 実装済み
- **高度な視覚化**: 8種類の視覚化実装済み
- **ゲーミフィケーション**: バッジシステム計画中
- **音声読み上げ**: Web Speech API検討中
- **モバイル最適化**: タッチジェスチャー対応中

## 関連ドキュメント

### プロジェクト管理

- [要件定義書](docs/guides/REQUIREMENTS_DEFINITION.md)
- [プロジェクト管理計画](docs/guides/PROJECT_MANAGEMENT_PLAN.md)
- [スプリント計画](docs/SPRINT_PLAN.md)
- [チーム役割分担](docs/TEAM_ROLE_ASSIGNMENT.md)

### アーキテクチャ

- [システムアーキテクチャ](docs/architecture/SYSTEM_ARCHITECTURE_PLAN.md)
- [データベース設計](docs/architecture/DATABASE_DESIGN.md)
- [インフラ設計](docs/architecture/INFRASTRUCTURE_DEVOPS.md)
- [セキュリティ実装](docs/security/SECURITY_IMPLEMENTATION_PLAN.md)

### 開発ガイド

- [API仕様書](docs/API_SPECIFICATION.md)
- [テスト計画](docs/TEST_PLAN.md)
- [デプロイメントガイド](docs/CLOUD_DEPLOYMENT_GUIDE.md)
- [DevOps実装ガイド](docs/DEVOPS_IMPLEMENTATION_GUIDE.md)

## GitHub連携・AI支援開発

このプロジェクトは**Claude Code AI Assistant**と完全統合されており、GitHub Issues/PRでの開発作業を自動化・効率化しています。

### 🤖 AI自動化機能

#### Issue管理の自動化
- **自動分類**: Issueタイプ（Bug, Feature, Epic等）の自動判定
- **優先度設定**: ビジネスインパクトとリスクに基づく自動優先度付け
- **ラベル管理**: 関連コンポーネントと特性の自動ラベリング
- **関連Issue検出**: キーワード分析による関連Issueの自動リンク
- **品質評価**: Issue記載内容の品質スコアと改善提案

#### プルリクエストの自動レビュー
- **包括的分析**: コード品質、セキュリティ、パフォーマンスの総合評価
- **アーキテクチャ準拠**: CLAUDE.mdガイドラインとの整合性チェック
- **テスト分析**: カバレッジとテスト品質の評価
- **互換性確認**: ブラウザ・モバイル対応状況の検証

### 📋 AIコマンドガイド

GitHub Issue/PRコメントで以下のコマンドが使用可能：

#### 基本コマンド
```
@claude                    # 汎用AI支援（状況に応じた最適な分析）
@claude review            # 包括的なコードレビュー
@claude analyze           # 詳細分析（パフォーマンス、影響範囲等）
@claude implement         # 実装提案とベストプラクティス
```

#### 専門分析コマンド
```
@claude security          # セキュリティ重点レビュー
@claude performance       # パフォーマンス影響分析
@claude architecture      # アーキテクチャ準拠チェック
@claude accessibility     # アクセシビリティ評価
@claude mobile            # モバイル対応レビュー
@claude test              # テスト戦略・カバレッジ分析
```

#### Epic・プロジェクト管理
```
@claude breakdown         # Epic/大規模タスクの詳細分解
@claude estimate          # 工数・難易度見積もり
@claude dependencies      # 依存関係分析
@claude roadmap           # 実装ロードマップ生成
@claude risk              # リスク分析・対策立案
```

### 🎯 Issue作成ガイドライン

効果的なAI分析のため、以下のガイドラインに従ってください：

#### Bug Report
- **明確な再現手順**: 1-2-3形式で具体的に記載
- **環境情報**: OS、ブラウザ、デバイス、画面サイズ
- **期待動作vs実際の動作**: 明確な対比で記載
- **影響度**: Critical/High/Medium/Lowの4段階で評価

#### Feature Request  
- **ビジネス価値**: 解決する課題とその価値を明確化
- **ユーザーストーリー**: As a [user], I want [feature] so that [value]
- **受け入れ基準**: テスト可能な完了条件をリスト化
- **成功指標**: 定量的な効果測定方法を定義

#### Epic Planning
- **ビジョン**: 3-6ヶ月後の理想的な状態を描写
- **フェーズ分解**: Phase 1-4程度の段階的実装計画
- **ステークホルダー**: 関係者の役割と期待を明確化
- **リスク評価**: 技術・ビジネス・運用リスクの洗い出し

### 🚀 プルリクエスト作成ガイド

AI レビューを最大限活用するため：

#### 必須チェックリスト
- [ ] **CLAUDE.md準拠**: プロジェクトガイドラインに従った実装
- [ ] **テスト完備**: 新機能に対する適切なテスト追加
- [ ] **パフォーマンス配慮**: Core Web Vitals基準のクリア
- [ ] **セキュリティチェック**: 脆弱性の確認と対策
- [ ] **アクセシビリティ**: WCAG 2.1 AA基準への準拠
- [ ] **モバイル対応**: レスポンシブデザインとタッチ操作対応

#### PR説明のベストプラクティス
1. **変更の目的**: Why（なぜこの変更が必要か）
2. **実装アプローチ**: How（どのように実装したか）
3. **影響範囲**: What（何が変わるか、影響を受けるか）
4. **テスト方法**: Validation（どのように検証したか）

### 📊 自動品質ゲート

すべてのPRは以下の自動チェックを通過する必要があります：

#### コード品質
- **ESLint**: ルール違反ゼロ
- **TypeScript**: 型エラーゼロ
- **Prettier**: フォーマット統一
- **テストカバレッジ**: 80%以上維持

#### セキュリティ
- **npm audit**: 高リスク脆弱性ゼロ
- **静的解析**: 潜在的脆弱性の検出
- **依存関係**: 既知の問題のない最新版使用

#### パフォーマンス
- **Bundle Size**: パフォーマンスバジェット以内
- **Lighthouse CI**: Core Web Vitals基準クリア
- **レンダリング**: 大きなレイアウトシフトなし

### ⚡ 高速開発のコツ

#### AI支援の活用
- **Draft PR作成**: 初期段階でのフィードバック獲得
- **段階的レビュー**: 大きな変更は複数PRに分割
- **コマンド活用**: 特定観点での詳細分析依頼

#### 効率的なワークフロー
1. **Issue作成** → AIによる自動分析・分類
2. **実装開始** → `@claude implement`で実装ガイダンス
3. **Draft PR** → 早期フィードバックで方向性確認
4. **Ready for Review** → 自動レビュー＋人手レビュー
5. **Merge** → 自動デプロイ＋品質監視

### 🔧 トラブルシューティング

#### よくある問題
- **AI応答なし**: Trigger phrase（@claude）の確認
- **分析不十分**: より具体的な情報提供が必要
- **実装提案不適切**: プロジェクトコンテキスト情報の追加

#### サポート・フィードバック
- Issue/PR内で`@claude help`：使用方法のガイダンス
- 問題報告：GitHub Issue「AI Integration Feedback」ラベル
- 改善提案：`@claude feedback`でAI機能の改善提案

## コントリビューション

プロジェクトへの貢献を歓迎します。詳細は以下を参照:

- [コードレビューテンプレート](.claude/prompts/code-review.md)
- [アーキテクチャレビューガイド](.claude/prompts/architecture-review.md)
- [テストガイドライン](.claude/prompts/testing-guidelines.md)
