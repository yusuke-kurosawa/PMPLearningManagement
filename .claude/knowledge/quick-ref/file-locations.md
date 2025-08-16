# ファイルロケーション・クイックリファレンス

## 主要エントリーポイント

```
src/main.jsx                 # アプリケーションエントリー
src/App.jsx                  # メインアプリコンポーネント
index.html                   # HTMLテンプレート
public/sw.js                 # Service Worker
```

## コンポーネント配置

### ページコンポーネント

```
src/components/pages/
├── Home.jsx                 # ホームページ
├── PMBOKMatrix.jsx         # PMBOKマトリックス
├── PMBOK7Principles.jsx    # PMBOK7プリンシプル
└── PMBOK7PerformanceDomains.jsx  # PMBOK7パフォーマンスドメイン
```

### レイアウトコンポーネント

```
src/components/layout/
├── Navigation.jsx           # ナビゲーションバー
├── PageTransition.jsx      # ページ遷移アニメーション
├── MobileLayout.tsx        # モバイルレイアウト
└── MobileNavigation.tsx    # モバイルナビゲーション
```

### 学習機能コンポーネント

```
src/components/learning/
├── LearningProgressDashboard.jsx  # 学習進捗ダッシュボード
├── FlashCardLearning.jsx         # フラッシュカード学習
├── MockExam.jsx                   # 模擬試験
├── ExamResults.jsx                # 試験結果
├── PMPGlossary.jsx                # PMP用語集
├── EnhancedFlashCardSystem.tsx   # 強化版フラッシュカード
└── EnhancedProgressDashboard.tsx # 強化版進捗ダッシュボード
```

### 視覚化コンポーネント

```
src/components/visualizations/
├── VisualizationHub.jsx          # 視覚化ハブ
├── ITTOForceGraph.jsx            # 力学的グラフ
├── ITTONetworkDiagram.jsx        # ネットワーク図
├── EnhancedNetworkGraph.jsx      # 拡張ネットワークグラフ
├── SankeyDiagram.jsx              # サンキーダイアグラム
├── MindMapView.jsx                # マインドマップ
├── ProcessHeatmap.jsx             # プロセスヒートマップ
├── ProcessFlowDiagram.jsx         # プロセスフロー図
└── KnowledgeAreaHeatmap.jsx      # 知識エリアヒートマップ
```

### コラボレーション機能

```
src/components/collaboration/
├── CollaborationHub.jsx          # コラボレーションハブ
├── StudyGroups.jsx                # 学習グループ
├── SharedNotes.jsx                # 共有ノート
├── DiscussionThread.jsx           # ディスカッションスレッド
├── DataManagement.jsx             # データ管理
└── EnhancedCollaborationHub.tsx  # 強化版コラボレーション
```

### モバイル最適化コンポーネント

```
src/components/mobile/
├── MobileOptimizedApp.tsx        # モバイル最適化アプリ
├── MobilePMBOKMatrix.tsx         # モバイルPMBOKマトリックス
├── MobileFlashCard.tsx           # モバイルフラッシュカード
├── MobileMockExam.tsx            # モバイル模擬試験
└── MobileProgressDashboard.tsx   # モバイル進捗ダッシュボード
```

### 共有コンポーネント

```
src/components/shared/
├── GlobalSearch.jsx               # グローバル検索
├── CustomizationPanel.jsx        # カスタマイゼーションパネル
├── PMBOKVersionSelector.jsx      # PMBOKバージョン選択
├── EnvironmentBanner.tsx         # 環境バナー
└── EnvironmentInfo.tsx           # 環境情報
```

## データファイル

### スキーマ定義

```
src/data/schemas/
├── pmbok/
│   ├── processData.js            # プロセスデータ
│   └── pmbok7Data.js             # PMBOK7データ
├── glossary/
│   └── pmpGlossary.js            # PMP用語集データ
└── exam/                         # 試験データ
```

### モックデータ

```
src/data/mock/
├── pmbok-data.js                 # PMBOKモックデータ
└── index.js                      # エクスポート
```

### フィクスチャ

```
src/data/fixtures/
├── examQuestions.js              # 試験問題フィクスチャ
└── index.js                      # エクスポート
```

## サービス層

### フロントエンドサービス

```
src/services/
├── progressService.js            # 進捗管理サービス
├── glossaryService.js            # 用語集サービス
├── collaborationService.js       # コラボレーションサービス
├── exportService.js              # エクスポートサービス
├── importService.js              # インポートサービス
└── searchService.js              # 検索サービス
```

### バックエンドサービス

```
src/server/services/
├── userService.ts                # ユーザーサービス
├── learningService.ts            # 学習サービス
├── progressService.ts            # 進捗サービス
├── emailService.ts               # メールサービス
├── notificationService.ts        # 通知サービス
├── stripeService.ts              # Stripeサービス
├── subscriptionService.ts        # サブスクリプションサービス
└── encryptedUserService.ts       # 暗号化ユーザーサービス
```

## 設定ファイル

### ビルド設定

```
vite.config.mjs                   # Vite設定
tailwind.config.ts                # Tailwind CSS設定
postcss.config.js                 # PostCSS設定
tsconfig.json                     # TypeScript設定
```

### テスト設定

```
vitest.config.ts                  # Vitest設定
playwright.config.ts              # Playwright設定
stryker.config.mjs               # Strykerミューテーション設定
```

### CI/CD設定

```
.github/workflows/deploy.yml      # GitHub Actionsデプロイ
```

### データベース設定

```
prisma/schema.prisma              # Prismaスキーマ
```

## ドキュメント

### プロジェクトドキュメント

```
docs/
├── guides/
│   ├── REQUIREMENTS_DEFINITION.md    # 要件定義
│   ├── PROJECT_MANAGEMENT_PLAN.md    # プロジェクト管理計画
│   └── DEPLOYMENT.md                 # デプロイメントガイド
├── architecture/
│   ├── SYSTEM_ARCHITECTURE_PLAN.md   # システムアーキテクチャ
│   ├── DATABASE_DESIGN.md            # データベース設計
│   └── INFRASTRUCTURE_DEVOPS.md      # インフラ設計
├── security/
│   ├── SECURITY_IMPLEMENTATION_PLAN.md  # セキュリティ実装計画
│   └── DATABASE_SECURITY_SCHEMA.md      # DBセキュリティスキーマ
└── testing/
    └── TEST_PLAN.md                     # テスト計画
```

### Claudeコンテキスト

```
.claude/
├── context/
│   ├── project-map.md                  # プロジェクトマップ
│   ├── architecture-summary.md         # アーキテクチャサマリー
│   ├── current-status.md               # 現在ステータス
│   └── key-decisions.md                # 主要決定事項
├── quick-ref/
│   ├── commands.md                     # コマンドリファレンス
│   └── file-locations.md               # ファイルロケーション（このファイル）
└── prompts/                            # プロンプトテンプレート
```

## テストファイル

### 単体テスト

```
src/components/__tests__/         # コンポーネントテスト
src/services/__tests__/           # サービステスト
src/lib/cache/__tests__/         # キャッシュテスト
src/lib/security/__tests__/      # セキュリティテスト
```

### 統合テスト

```
tests/integration/                # 統合テスト
tests/e2e/                       # E2Eテスト
tests/performance/               # パフォーマンステスト
tests/advanced/                  # 高度なテスト
```

## スクリプト

### 自動化スクリプト

```
scripts/
├── deploy-mobile.sh             # モバイルデプロイ
├── health-check.js              # ヘルスチェック
├── backup.sh                    # バックアップ
├── optimize-build.js            # ビルド最適化
├── optimize-deployment.js       # デプロイ最適化
├── migrate-from-localstorage.js # データ移行
└── import-mock-exam.js          # 模擬試験インポート
```

### テストスクリプト

```
scripts/
├── test-coverage.sh             # カバレッジテスト
├── test-quality-gate.sh         # 品質ゲート
├── test-quality-summary.sh      # 品質サマリー
├── mutation-testing.sh          # ミューテーションテスト
├── property-based-testing.sh    # プロパティベーステスト
└── chaos-testing.sh             # カオステスト
```

## 静的ファイル

### 公開ファイル

```
public/
├── manifest.json                # PWAマニフェスト
├── sw.js                       # Service Worker
├── offline.html                # オフラインページ
├── icon-192x192.png           # PWAアイコン（小）
├── icon-512x512.png           # PWAアイコン（大）
└── _headers                    # ヘッダー設定
```

### ビルド出力

```
dist/                           # プロダクションビルド
coverage/                       # テストカバレッジ
playwright-report/              # Playwrightレポート
test-results/                   # テスト結果
```
