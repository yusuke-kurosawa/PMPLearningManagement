# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリのコードを扱う際のガイダンスを提供します。

> **コンテキスト管理**: このプロジェクトは`.claude/`ディレクトリに追加のコンテキスト情報を保持しています。  
> 詳細は[.claude/context/](.claude/context/)を参照してください。

## プロジェクト概要

PMPLearningManagementは、PMBOK（プロジェクトマネジメント知識体系）第6版・第7版の学習用包括的Webアプリケーションです。49のプロセス、それらの関係性、およびITTO（インプット、ツールと技法、アウトプット）フレームワークを多様な視覚化手法で理解し、効率的に学習するための統合プラットフォームを提供します。

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

### 🎯 その他の特徴

- **レスポンシブデザイン**: デスクトップとモバイルデバイスに完全最適化
- **日本語ローカライゼーション**: すべてのUI要素と用語の日本語対応
- **進捗データの永続化**: LocalStorage → IndexedDB移行中
- **GitHub Pagesデプロイ**: GitHub Actions経由で自動デプロイ
- **PWA対応**: オフライン機能とプッシュ通知（実装中）
- **コラボレーション機能**: 学習グループと共有ノート（実装中）

## 技術スタック

### フロントエンド

- **フレームワーク**: React 18.2 + React Router v6
- **型システム**: TypeScript（段階的移行中）
- **視覚化**: D3.js v7, D3-sankey
- **スタイリング**: Tailwind CSS v3
- **ビルドツール**: Vite v5
- **アイコン**: Lucide React
- **UIコンポーネント**: shadcn/ui（一部採用）

### 状態管理・データ永続化

- **状態管理**: React Hooks (useState, useEffect, useMemo, useCallback)
- **データ永続化**: LocalStorage → IndexedDB（移行中）
- **カスタムフック**: useProgress, useDebounce, useTouchGestures
- **サーバー状態**: tRPC Query（実装中）

### パフォーマンス最適化

- **コード分割**: React.lazy/Suspense による遅延ロード
- **メモ化**: React.memo, useMemo
- **最適化**: スロットリング、デバウンシング

### デプロイメント

- **ホスティング**: GitHub Pages → AWS移行予定（2025 Q2）
- **CI/CD**: GitHub Actions + 品質ゲート
- **パッケージ管理**: npm
- **モニタリング**: Prometheus + Grafana（計画中）

### バックエンド（実装済み・統合待ち）

- **API**: tRPC + Node.js
- **ORM**: Prisma
- **データベース**: PostgreSQL
- **キャッシュ**: Redis
- **認証**: JWT + Refresh Token

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
│   └── workflows/
│       └── deploy.yml                  # GitHub Actionsデプロイメント
│
├── index.html                          # HTMLテンプレート
├── vite.config.js                      # Vite設定
├── tailwind.config.js                  # Tailwind設定
├── postcss.config.js                   # PostCSS設定
├── package.json                        # 依存関係とスクリプト
├── CLAUDE.md                           # このファイル
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

### GitHub Actions

- mainブランチへのプッシュで自動デプロイ
- Node.js 18環境
- npm依存関係のキャッシュ
- gh-pagesブランチへの自動プッシュ

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

## コントリビューション

プロジェクトへの貢献を歓迎します。詳細は以下を参照:

- [コードレビューテンプレート](.claude/prompts/code-review.md)
- [アーキテクチャレビューガイド](.claude/prompts/architecture-review.md)
- [テストガイドライン](.claude/prompts/testing-guidelines.md)
