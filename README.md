# PMP学習管理システム 🎓

[![CI/CD Pipeline](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/01-ci-continuous-integration.yml/badge.svg)](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions)
[![IDD Compliance](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/02-quality-idd-compliance.yml/badge.svg)](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions)
[![GitHub Pages](https://img.shields.io/badge/demo-live-success?logo=github)](https://yusuke-kurosawa.github.io/PMPLearningManagement/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Test Coverage](https://img.shields.io/badge/coverage-80.1%25-brightgreen.svg)](reports/quality/)
[![Lighthouse Score](https://img.shields.io/badge/lighthouse-97%2F100-brightgreen.svg)](reports/performance/)

> **PMBOK第6版・第7版完全準拠** - PMP資格取得のための次世代学習プラットフォーム
> 49プロセス × 8種類の視覚化 × AI支援学習 = 効率的な合格への道

## 🚀 クイックアクセス

### 今すぐ使う
**[📱 アプリケーションを開く](https://yusuke-kurosawa.github.io/PMPLearningManagement/)** （インストール不要・無料）

### 開発者向け
```bash
git clone https://github.com/yusuke-kurosawa/PMPLearningManagement.git
cd PMPLearningManagement
npm install && npm run dev
```

**開発サーバー**: http://localhost:5173

---

## 📖 目次

- [特徴](#-特徴)
- [主要機能](#-主要機能)
- [視覚的デモ](#-視覚的デモ)
- [技術スタック](#️-技術スタック)
- [セットアップ](#-セットアップ)
- [使い方](#-使い方)
- [プロジェクト品質](#-プロジェクト品質)
- [開発ガイド](#-開発ガイド)
- [コントリビューション](#-コントリビューション)
- [ドキュメント](#-ドキュメント)
- [ライセンス](#-ライセンス)

---

## ✨ 特徴

### 🎯 包括的な学習支援
- **49プロセス完全カバー** - PMBOK第6版・第7版の全プロセスを網羅
- **ITTO詳細解説** - 各プロセスのインプット・ツールと技法・アウトプットを体系的に学習
- **12プリンシプル + 8パフォーマンスドメイン** - PMBOK第7版の新概念に完全対応

### 📊 8種類の先進的視覚化
1. **PMBOKマトリックスビュー** - 10知識エリア × 5プロセス群の対話型マトリックス
2. **ITTOネットワーク図** - D3.jsによるプロセス関係性の力学的可視化
3. **統合ビュー** - マトリックス + ネットワーク図の分割画面
4. **サンキーダイアグラム** - プロセスフローの直感的な理解
5. **マインドマップビュー** - 階層的な知識構造の表示
6. **プロセスヒートマップ** - 複雑度・進捗・習熟度の可視化
7. **知識エリアヒートマップ** - エリア別パフォーマンス分析
8. **ITTO相関分析** - プロセス間の依存関係マッピング

### 🎓 実践的な試験対策
- **フラッシュカード学習** - 3Dアニメーション付き、効率的な暗記支援
- **フル模擬試験** - 180問・230分の本番形式試験
- **詳細な結果分析** - 知識エリア別・プロセス群別の弱点診断
- **学習進捗管理** - リアルタイム習熟度トラッキング

### 💡 その他の強み
- **完全レスポンシブ** - PC・タブレット・スマートフォン対応
- **ダークモード** - 目に優しい学習環境
- **高速パフォーマンス** - Lighthouse 97点、Core Web Vitals達成
- **PWA対応** - オフライン学習可能（部分実装）
- **セキュアな認証** - Supabase統合、個人データ保護

---

## 🌟 主要機能

### 📚 学習ツール

| 機能 | 説明 | ステータス |
|------|------|-----------|
| **PMBOKマトリックス** | 10知識エリア × 5プロセス群の対話型ビュー | ✅ 完全実装 |
| **ITTOネットワーク図** | プロセス関係性の力学的グラフ | ✅ 完全実装 |
| **PMP用語集** | 45+用語の検索可能データベース | ✅ 完全実装 |
| **フラッシュカード** | 3Dアニメーション付き暗記カード | ✅ 完全実装 |
| **模擬試験** | 180問フル試験 + 結果分析 | ✅ 完全実装 |
| **学習進捗管理** | リアルタイム習熟度トラッキング | ✅ 完全実装 |

### 📊 視覚化ハブ

| 視覚化タイプ | 用途 | ステータス |
|-------------|------|-----------|
| **拡張ネットワークグラフ** | 多様なレイアウト・テーマでプロセス関係を表示 | ✅ 完全実装 |
| **サンキーダイアグラム** | プロセスフローの直感的理解 | ✅ 完全実装 |
| **マインドマップ** | 階層的な知識構造の可視化 | ✅ 完全実装 |
| **プロセスヒートマップ** | 複雑度・進捗の色分け表示 | ✅ 完全実装 |
| **知識エリアヒートマップ** | エリア別パフォーマンス分析 | ✅ 完全実装 |
| **統合ビュー** | 複数視覚化の同時表示 | ✅ 完全実装 |

### 🤖 AI・先進機能（UI実装済み）

| 機能 | 説明 | ステータス |
|------|------|-----------|
| **AIコーチング** | 個別学習プラン提案 | ⏳ バックエンド統合待ち |
| **プロジェクトシミュレーター** | 実践的なPM体験 | ⏳ バックエンド統合待ち |
| **メンターシップハブ** | 専門家との連携 | ⏳ バックエンド統合待ち |
| **コラボレーション** | 学習グループ・共有ノート | ⏳ バックエンド統合待ち |

### ⚙️ システム機能

- **認証システム** - Supabase統合、JWT + Refresh Token
- **ダークモード** - システム全体対応
- **グローバル検索** - Ctrl+K で全体検索
- **コマンドパレット** - キーボードショートカット対応
- **データエクスポート** - 学習データのバックアップ

---

## 🎨 視覚的デモ

### PMBOKマトリックスビュー
10の知識エリアと5つのプロセス群で整理された49プロセスの対話型マトリックス。各セルをクリックすると詳細なITTO情報が表示されます。

### ITTOネットワーク図
D3.jsを使用した力学的グラフで、プロセス間の依存関係を動的に可視化。ドラッグ操作で探索的に学習できます。

### フラッシュカード学習
3Dアニメーション付きカードで、ITTOを効率的に暗記。スワイプ操作で直感的に学習を進められます。

> 📷 **スクリーンショット**: [デモサイト](https://yusuke-kurosawa.github.io/PMPLearningManagement/) で実際に体験してください

---

## 🛠️ 技術スタック

### フロントエンド
- **React 18.3** - 最新のReact機能を活用
- **Vite 5** - 超高速ビルドツール
- **TypeScript 5.3** - 型安全な開発（部分導入）
- **Tailwind CSS 3** - ユーティリティファーストCSS
- **Radix UI** - アクセシブルなUIコンポーネント
- **Framer Motion 12** - 滑らかなアニメーション
- **D3.js 7** - 強力なデータ視覚化

### 状態管理・データ
- **Zustand 4** - 軽量グローバル状態管理
- **React Query 5** - サーバー状態管理（準備済み）
- **React Hook Form 7** - パフォーマンスの高いフォーム管理
- **Zod** - スキーマバリデーション

### 認証・バックエンド
- **Supabase** - 認証・データベース基盤
- **tRPC** - 型安全なAPI（準備済み）
- **Prisma** - 次世代ORM（準備済み）

### テスト・品質保証
- **Vitest 3.2** - 高速単体テスト
- **Playwright 1.40** - E2Eテスト（クロスブラウザ対応）
- **Testing Library** - ユーザー中心のテスト
- **Stryker** - ミューテーションテスト
- **ESLint + Prettier** - コード品質維持

### CI/CD・インフラ
- **GitHub Actions** - 58の自動化ワークフロー
- **GitHub Pages** - 高速デプロイ
- **Lighthouse CI** - パフォーマンス監視
- **IDD準拠システム** - 99%自動化達成

---

## 🚀 セットアップ

### 前提条件
- **Node.js 18+** ([ダウンロード](https://nodejs.org/))
- **npm 8+** (Node.jsに同梱)
- **Git** ([ダウンロード](https://git-scm.com/))

### インストール手順

```bash
# 1. リポジトリをクローン
git clone https://github.com/yusuke-kurosawa/PMPLearningManagement.git
cd PMPLearningManagement

# 2. 依存関係をインストール
npm install

# 3. 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:5173 を開いてください。

### 環境変数設定（オプション）

認証機能を使用する場合、`.env`ファイルを作成してください：

```bash
cp .env.example .env
```

`.env`に以下を設定：
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

---

## 📱 使い方

### 基本的な学習フロー

1. **アカウント登録** - 右上の「ログイン」からアカウント作成
2. **学習モード選択** - ダッシュボードから学習方法を選択
   - **視覚化**: PMBOKマトリックス・ネットワーク図で全体像を把握
   - **用語学習**: PMP用語集で基礎固め
   - **暗記**: フラッシュカードで効率的に記憶
   - **試験対策**: 模擬試験で実力確認
3. **進捗確認** - 学習進捗ダッシュボードで習熟度チェック
4. **弱点克服** - ヒートマップで苦手エリアを特定・集中学習

### 主要ページへのアクセス

- **ホーム**: `/`
- **PMBOKマトリックス**: `/matrix`
- **ITTOネットワーク図**: `/network`
- **視覚化ハブ**: `/visualizations`
- **PMP用語集**: `/glossary`
- **学習進捗**: `/progress`
- **フラッシュカード**: `/flashcards`
- **模擬試験**: `/mock-exam`

### キーボードショートカット

- **Ctrl + K** - グローバル検索
- **Ctrl + D** - ダークモード切り替え
- **Esc** - モーダルを閉じる

---

## 📊 プロジェクト品質

### パフォーマンス指標
- **Lighthouse スコア**: 97/100 🟢
- **Core Web Vitals**: 全指標で「良好」
- **バンドルサイズ**: 1.3MB（最適化済み）
- **ビルド時間**: 約53秒

### 開発品質
- **テストカバレッジ**: 80.1% 🟢
- **IDD準拠率**: 99%（完全自動化）
- **コード品質スコア**: 87/100
- **セキュリティ脆弱性**: 0個 🔒
- **循環複雑度**: 0（最適）

### コードベース統計
- **総コード行数**: 30,933行
- **コンポーネント数**: 32ディレクトリ
- **サービス数**: 50+ファイル
- **テストファイル数**: 329個
- **自動化スクリプト**: 120+ファイル
- **GitHub Actions**: 58ワークフロー

---

## 👨‍💻 開発ガイド

### 利用可能なコマンド

#### 開発
```bash
npm run dev              # 開発サーバー起動
npm run build            # プロダクションビルド
npm run preview          # ビルドプレビュー
npm run deploy           # GitHub Pagesへデプロイ
```

#### テスト
```bash
npm run test             # 単体テスト実行
npm run test:watch       # ウォッチモード
npm run test:coverage    # カバレッジレポート
npm run test:e2e         # E2Eテスト
npm run test:e2e:ui      # E2E UIモード
npm run test:mutation    # ミューテーションテスト
```

#### コード品質
```bash
npm run lint             # ESLintチェック
npm run lint:fix         # ESLint自動修正
npm run format           # Prettier実行
npm run typecheck        # TypeScript型チェック
npm run quality:check    # コンテンツ品質チェック
```

#### IDD（Issue-Driven Development）
```bash
npm run idd:check        # IDD準拠チェック
npm run idd:status       # ステータス表示
npm run idd:report       # レポート生成
npm run idd:setup        # IDD環境セットアップ
npm run idd:hooks:install # Git hooks インストール
```

#### その他
```bash
npm run terminology:check    # PMP用語チェック
npm run serena:validate      # Serena検証
npm run context7:setup       # Context7セットアップ
npm run security:audit       # セキュリティ監査
```

### プロジェクト構造

```
PMPLearningManagement/
├── src/
│   ├── components/          # Reactコンポーネント（32ディレクトリ）
│   │   ├── auth/           # 認証関連
│   │   ├── learning/       # 学習機能
│   │   ├── visualizations/ # 視覚化コンポーネント
│   │   ├── exam/           # 試験機能
│   │   ├── layout/         # レイアウト
│   │   ├── pages/          # ページコンポーネント
│   │   └── ui/             # 共通UIコンポーネント
│   ├── contexts/           # React Context（状態管理）
│   ├── services/           # ビジネスロジック（50+ファイル）
│   ├── data/               # データ定義・モック
│   ├── hooks/              # カスタムフック
│   ├── utils/              # ユーティリティ関数
│   └── types/              # TypeScript型定義
├── public/                 # 静的アセット
├── docs/                   # プロジェクトドキュメント（25+ディレクトリ）
├── scripts/                # 自動化スクリプト（120+ファイル）
├── .github/                # CI/CD設定（58ワークフロー）
├── .claude/                # Claudeコンテキスト管理
├── e2e/                    # E2Eテスト
├── tests/                  # 単体テスト
└── reports/                # 品質レポート
```

---

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

### 開発フロー（IDD準拠）

1. **Issue作成** - 機能追加・バグ修正の前にIssueを作成
2. **ブランチ作成** - `feature/issue-123` または `fix/issue-456`
3. **開発** - IDD準拠のコミットメッセージでコミット
4. **プルリクエスト** - Issue番号を含めてPR作成
5. **レビュー** - 自動チェック + コードレビュー
6. **マージ** - mainブランチへマージ

### コミットメッセージ規約

すべてのコミットにIssue番号を含める必要があります：

```
feat: 新機能の追加 #123
fix: バグ修正 #456
docs: ドキュメント更新 #789
style: フォーマット変更 #012
refactor: リファクタリング #345
test: テスト追加 #678
chore: 雑務・メンテナンス #901
```

### 開発ガイドライン

- **コードスタイル**: ESLint + Prettier設定に準拠
- **テスト**: 新機能には必ずテストを含める
- **ドキュメント**: 重要な変更は関連ドキュメントを更新
- **パフォーマンス**: Lighthouse指標を維持・向上
- **アクセシビリティ**: WCAG 2.1 AA準拠

詳細は[CONTRIBUTING.md](CONTRIBUTING.md)を参照してください。

---

## 📚 ドキュメント

### プロジェクト管理
- **[CLAUDE.md](CLAUDE.md)** - 開発者向け詳細ガイド
- **[PRODUCT_BACKLOG.md](PRODUCT_BACKLOG.md)** - プロダクトバックログ（82ストーリー）
- **[IDD実装ステータス](docs/consolidated/IDD_IMPLEMENTATION_STATUS.md)** - IDD自動化詳細

### 技術ドキュメント
- **[API ドキュメント](docs/api/)** - API設計・仕様
- **[アーキテクチャ](docs/architecture/)** - システムアーキテクチャ
- **[開発ガイド](docs/development/)** - 開発リファレンス

### Agile・管理
- **[GitHub バックログ管理](docs/agile/GITHUB_BACKLOG_MANAGEMENT.md)** - バックログ管理ガイド
- **[スプリント計画](docs/agile/SPRINT_PLANNING_GUIDE.md)** - スプリント計画手法

### クイックリファレンス（.claude/）
- **[コマンドリファレンス](.claude/quick-ref/commands.md)** - よく使うコマンド
- **[ファイルロケーション](.claude/quick-ref/file-locations.md)** - 重要ファイル一覧
- **[ナビゲーションガイド](.claude/context/quick-navigation.md)** - プロジェクト案内

---

## 🎓 PMP試験について

このプロジェクトは以下の内容をカバーしています：

### PMBOK第6版
- **10の知識エリア** - 統合、スコープ、スケジュール、コスト、品質、資源、コミュニケーション、リスク、調達、ステークホルダー
- **5つのプロセス群** - 立ち上げ、計画、実行、監視・コントロール、終結
- **49のプロセス** - 各プロセスのITTO詳細

### PMBOK第7版
- **12のプリンシプル** - プロジェクトマネジメント原則
- **8つのパフォーマンスドメイン** - ステークホルダー、チーム、開発アプローチとライフサイクル、計画、プロジェクト作業、デリバリー、測定、不確実性

### 試験対策機能
- **180問模擬試験** - 本番形式の完全シミュレーション
- **詳細な結果分析** - 弱点エリアの特定
- **フラッシュカード** - 効率的な暗記支援
- **進捗管理** - 学習習熟度のトラッキング

---

## 🚀 ロードマップ

### Phase 1（完了）
- ✅ 基本視覚化機能
- ✅ 学習ツール（用語集、フラッシュカード、模擬試験）
- ✅ 認証システム
- ✅ ダークモード
- ✅ レスポンシブデザイン

### Phase 2（現在）
- 🚧 バックエンドAPI統合（tRPC + Prisma）
- 🚧 AI学習アドバイザー機能
- 🚧 リアルタイムコラボレーション

### Phase 3（計画中）
- ⏳ PWA完全対応（オフライン機能強化）
- ⏳ 多言語対応（i18n）
- ⏳ モバイルアプリ版
- ⏳ 音声読み上げ機能

### Phase 4（検討中）
- 💡 ゲーミフィケーション要素
- 💡 ソーシャル共有機能
- 💡 カスタムテーマ作成
- 💡 決済システム統合

---

## 🙏 謝辞

このプロジェクトは以下のオープンソースプロジェクトを使用しています：

- **[React](https://react.dev/)** - UIフレームワーク
- **[Vite](https://vitejs.dev/)** - ビルドツール
- **[D3.js](https://d3js.org/)** - データ視覚化
- **[Radix UI](https://www.radix-ui.com/)** - アクセシブルなコンポーネント
- **[Tailwind CSS](https://tailwindcss.com/)** - CSSフレームワーク
- **[Supabase](https://supabase.com/)** - バックエンド基盤
- **[Vitest](https://vitest.dev/)** - テストフレームワーク
- **[Playwright](https://playwright.dev/)** - E2Eテスト

すべてのコントリビューターとオープンソースコミュニティに感謝します。

---

## 📞 サポート・連絡先

### 質問・問題報告
- **バグ報告**: [GitHub Issues](https://github.com/yusuke-kurosawa/PMPLearningManagement/issues)
- **機能要望**: [GitHub Issues](https://github.com/yusuke-kurosawa/PMPLearningManagement/issues)
- **ディスカッション**: [GitHub Discussions](https://github.com/yusuke-kurosawa/PMPLearningManagement/discussions)

### セキュリティ
セキュリティに関する問題を発見した場合は、公開Issueではなく、直接リポジトリ管理者にご連絡ください。詳細は[SECURITY.md](SECURITY.md)を参照してください。

---

## 📄 ライセンス

このプロジェクトは[MITライセンス](LICENSE)の下で公開されています。

---

## ⚠️ 免責事項

PMBOK®、PMP®、PMI®はProject Management Institute, Inc.の登録商標です。本プロジェクトはPMIと提携、承認、スポンサーされたものではありません。

---

## 📈 プロジェクト統計

- **開発期間**: 2024年～
- **総コミット数**: 19回（直近）
- **総コード行数**: 30,933行
- **テストカバレッジ**: 80.1%
- **開発ベロシティ**: 0.43コミット/日
- **GitHub Stars**: ⭐（あなたのスターをお待ちしています！）

---

<div align="center">

**[🚀 今すぐ始める](https://yusuke-kurosawa.github.io/PMPLearningManagement/)** | **[📖 ドキュメント](docs/)** | **[🤝 コントリビューション](#-コントリビューション)**

Made with ❤️ for PMP learners worldwide

最終更新: 2025-09-30

</div>