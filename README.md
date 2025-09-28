# PMP学習管理システム

[![CI/CD Pipeline](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/deploy.yml/badge.svg)](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/deploy.yml)
[![IDD Compliance](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/idd-compliance.yml/badge.svg)](https://github.com/yusuke-kurosawa/PMPLearningManagement/actions/workflows/idd-compliance.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-green?logo=github)](https://yusuke-kurosawa.github.io/PMPLearningManagement/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

PMBOK第6版・第7版に完全準拠したPMP資格取得のための包括的学習プラットフォーム

## 🌐 アプリケーションへのアクセス

### **オンライン版（推奨）**
**[📱 今すぐアプリケーションを使用する](https://yusuke-kurosawa.github.io/PMPLearningManagement/)**

- ブラウザから直接アクセス可能
- インストール不要
- 自動的に最新版を利用可能
- PC、タブレット、スマートフォンに対応

### **ローカル開発環境**
開発者向けの詳細なセットアップ手順は下記「クイックスタート」セクションをご覧ください。

## 🎯 プロジェクト概要

PMPLearningManagementは、PMP（Project Management Professional）資格取得を目指す方のための統合学習プラットフォームです。PMBOK（プロジェクトマネジメント知識体系）第6版・第7版の内容を網羅し、49のプロセス、12のプリンシプル、8つのパフォーマンスドメイン、およびITTO（インプット、ツールと技法、アウトプット）フレームワークを多様な視覚化手法と学習ツールで効率的に習得できます。

### 主な特徴

- **📊 8種類の先進的視覚化**: 複雑なPMBOK概念を直感的に理解
- **🎓 体系的な学習サポート**: フラッシュカード、模擬試験、進捗管理
- **📱 完全レスポンシブ対応**: あらゆるデバイスで快適に利用可能
- **🌙 ダークモード対応**: 目に優しい学習環境
- **⚡ 高速パフォーマンス**: Lighthouse最適化済み、Core Web Vitals達成
- **🔒 セキュアな認証**: Supabaseによる安全な認証システム

## 📋 機能一覧（カテゴリ別）

### 🏠 メインメニュー
| パス | 機能名 | 説明 | アイコン |
|------|--------|------|----------|
| `/` | ホーム | ダッシュボード・メインページ | 🏠 |

### 📚 PMBOK基本機能
| パス | 機能名 | 説明 | アイコン |
|------|--------|------|----------|
| `/matrix` | PMBOKマトリックス | 10の知識エリアと5つのプロセス群の対話型マトリックス | 📊 |
| `/network` | ITTOネットワーク図 | プロセス関係性の力学的グラフ視覚化 | 🌐 |
| `/integrated` | 統合ビュー | マトリックスとネットワーク図の分割画面 | 🔀 |
| `/visualizations` | ビジュアライゼーションハブ | 8種類の高度な視覚化オプション | ✨ |

### 📖 学習機能
| パス | 機能名 | 説明 | アイコン |
|------|--------|------|----------|
| `/glossary` | PMP用語集 | 45以上の重要用語の検索可能な用語集 | 📖 |
| `/progress` | 学習進捗ダッシュボード | 知識エリア別・プロセス群別の習熟度管理 | 📈 |
| `/flashcards` | フラッシュカード学習 | ITTOを効率的に暗記する3Dアニメーション付きカード | 🧠 |
| `/mock-exam` | PMP模擬試験 | 180問・230分のフル模擬試験（結果分析付き） | 🎓 |
| `/pmo-learning` | PMO学習ハブ | プロジェクト管理オフィスの学習 | 🛡️ |
| `/opm-learning` | OPM学習ハブ | 組織的プロジェクトマネジメント学習 | 🏢 |
| `/organization-structure` | 組織構造比較 | 各種組織構造の比較と分析 | 👥 |

### ⚡ アジャイル機能
| パス | 機能名 | 説明 | アイコン |
|------|--------|------|----------|
| `/agile-manifesto` | アジャイル宣言ハブ | アジャイルマニフェストの詳細解説 | ⚡ |
| `/agile-principles` | アジャイル原則エクスプローラ | 12のアジャイル原則の探索 | 🌿 |
| `/agile-practices` | アジャイル実践ライブラリ | 実践的なアジャイル手法集 | ⚙️ |
| `/agile-values` | アジャイル価値比較 | アジャイル価値の比較分析 | 📊 |
| `/agile-mindset` | アジャイル・マインドセット | アジャイルマインドセットの理解 | ❤️ |
| `/tailoring-guide` | テーラリングガイド | プロジェクトに合わせた手法カスタマイズ | 🔧 |
| `/agile-hybrid` | アジャイル・ハイブリッド統合 | アジャイルと予測型の統合アプローチ | 🔄 |
| `/eco-mapping` | ECOマッピング | エンタープライズ変更管理のマッピング | 🗺️ |

### 📊 視覚化ツール
| パス | 機能名 | 説明 | アイコン |
|------|--------|------|----------|
| `/opm-hierarchy` | OPM階層図 | 組織的プロジェクトマネジメントの階層構造 | 🎯 |
| 視覚化ハブ内 | 拡張ネットワークグラフ | 多様なレイアウトとテーマオプション | 🕸️ |
| 視覚化ハブ内 | サンキーダイアグラム | プロセスフローの可視化 | 〰️ |
| 視覚化ハブ内 | マインドマップビュー | 階層的な知識構造の表示 | 🌳 |
| 視覚化ハブ内 | プロセスヒートマップ | 複雑度と進捗の可視化 | 🔥 |
| 視覚化ハブ内 | プロセスフロー図 | 時系列的な流れの表示 | ➡️ |
| 視覚化ハブ内 | 知識エリアヒートマップ | エリア別の各種指標の表示 | 🗺️ |
| 視覚化ハブ内 | ITTO相関分析 | プロセス間の相関関係分析 | 🔗 |

### 🤝 コラボレーション
| パス | 機能名 | 説明 | アイコン |
|------|--------|------|----------|
| `/collaboration` | コラボレーションハブ | 学習グループと協力機能 | 👥 |
| `/data-management` | データ管理 | 学習データのインポート/エクスポート | 💾 |
| コラボ内 | 学習グループ | グループ学習の管理と参加 | 👨‍👩‍👦 |
| コラボ内 | 共有ノート | ノートの共有と共同編集 | 📝 |
| コラボ内 | ディスカッションスレッド | トピック別の討論フォーラム | 💬 |

### 🎯 戦略・ベネフィット管理
| パス | 機能名 | 説明 | アイコン |
|------|--------|------|----------|
| `/talent-triangle` | PMIタレント・トライアングル | 技術・リーダーシップ・戦略的スキル | 📐 |
| `/strategic-alignment` | 戦略適合分析ツールキット | プロジェクトと組織戦略の整合性分析 | 🎯 |
| `/business-environment` | ビジネス環境分析 | 外部・内部環境要因の分析 | 🏢 |
| `/strategic-toolkit` | 戦略ツールキット | 戦略的意思決定のためのツール集 | 🛠️ |
| `/project-benefits` | プロジェクトベネフィット管理 | ベネフィット実現の追跡と管理 | 💰 |
| `/incremental-value` | 漸進型価値実現 | 段階的な価値提供の管理 | 📈 |

### 🛡️ ガバナンス・コンプライアンス
| パス | 機能名 | 説明 | アイコン |
|------|--------|------|----------|
| `/governance` | プロジェクト・ガバナンス学習 | ガバナンス構造と意思決定プロセス | 🛡️ |
| `/project-compliance` | プロジェクト・コンプライアンス | 規制要件と標準への準拠 | ✅ |
| `/change-management` | 組織変更管理（OCM） | 組織的な変更の計画と実行 | 🔄 |

### 🤖 AI・先進機能（UI実装済み）
| パス | 機能名 | 説明 | ステータス |
|------|--------|------|------------|
| `/ai-coaching` | AIコーチングダッシュボード | 個別学習プランの提案とアドバイス | ⏳ バックエンド統合待ち |
| `/project-simulator` | プロジェクトシミュレーター | 実践的なプロジェクト管理シミュレーション | ⏳ バックエンド統合待ち |
| `/mentorship` | メンターシップハブ | 専門家との連携機能 | ⏳ バックエンド統合待ち |
| `/ai-assistant` | AI学習アシスタント | AIによる学習支援と質問応答 | ⏳ バックエンド統合待ち |

### ⚙️ システム設定・ツール
| パス | 機能名 | 説明 | アイコン |
|------|--------|------|----------|
| `/pmbok-versions` | PMBOK版切り替え | 第6版と第7版の切り替え | 🔄 |
| `/settings` | ユーザー設定 | プロフィール・通知・表示設定 | ⚙️ |
| `/auth` | 認証ページ | ログイン・新規登録・パスワードリセット | 🔐 |
| グローバル | ダークモード切り替え | ライト/ダークテーマの切り替え | 🌙 |
| グローバル | グローバル検索 | アプリ全体の横断検索（Ctrl+K） | 🔍 |
| グローバル | コマンドパレット | キーボードショートカット機能 | ⌨️ |

## ✨ 主要機能の詳細

### 📚 学習支援機能

- **PMBOKマトリックスビュー** - 10の知識エリアと5つのプロセス群で整理された49プロセスの対話型マトリックス
- **ITTOネットワーク図** - D3.jsを使用したプロセス関係性の力学的グラフ視覚化
- **統合ビュー** - マトリックスとネットワーク図を組み合わせた分割画面インターフェース
- **PMP用語集** - 45以上の重要用語を収録した検索可能な用語集（カテゴリフィルタリング対応）
- **学習進捗ダッシュボード** - 知識エリア別・プロセス群別の習熟度管理と統計表示
- **フラッシュカード学習** - ITTOを効率的に暗記する3Dアニメーション付きフラッシュカード
- **PMP模擬試験** - 実際の試験形式を再現した180問・230分のフル模擬試験（詳細な結果分析付き）

### 📊 視覚化ハブ（8種類の高度な視覚化）

- **拡張ネットワークグラフ** - 多様なレイアウトとテーマオプション
- **サンキーダイアグラム** - プロセスフローの可視化
- **マインドマップビュー** - 階層的な知識構造の表示
- **プロセスヒートマップ** - 複雑度と進捗の可視化
- **プロセスフロー図** - 時系列的な流れの表示
- **知識エリアヒートマップ** - エリア別の各種指標の表示

### 🎯 先進機能（実装済み・バックエンド統合待ち）

- **AIコーチングシステム** - 個別学習プランの提案とアドバイス
- **プロジェクトシミュレーター** - 実践的なプロジェクト管理シミュレーション
- **メンターシップハブ** - 専門家との連携機能
- **コラボレーション機能** - 学習グループ、共有ノート、ディスカッション

### 🔧 システム機能

- **認証システム** - Supabase統合、JWT + Refresh Token実装
- **ダークモード** - 目に優しい学習環境の提供
- **グローバル検索** - アプリ全体の横断検索機能
- **コマンドパレット** - キーボードショートカット対応
- **PWA対応** - オフラインでの利用可能（部分実装）
- **モバイル最適化** - 完全レスポンシブデザイン

## 🚀 クイックスタート

### 前提条件

- Node.js 18以上
- npm 8以上
- Git

### 開発環境のセットアップ

```bash
# 1. リポジトリのクローン
git clone https://github.com/yusuke-kurosawa/PMPLearningManagement.git
cd PMPLearningManagement

# 2. 依存関係のインストール
npm install

# 3. IDD環境のセットアップ（開発者向け）
npm run idd:setup
npm run idd:hooks:install

# 4. 開発サーバーの起動
npm run dev
```

開発サーバー: http://localhost:5173

### 基本的な利用方法

1. **オンライン版**: ブラウザで https://yusuke-kurosawa.github.io/PMPLearningManagement/ にアクセス
2. **ローカル版**: `npm run dev` 実行後、http://localhost:5173 にアクセス
3. **初回利用**: アカウント登録（メールアドレスのみ必要）
4. **学習開始**: ダッシュボードから各機能にアクセス

### 利用可能なnpmスクリプト

```bash
# 開発
npm run dev          # 開発サーバーの起動
npm run build        # プロダクションビルド
npm run preview      # ビルドのプレビュー
npm run deploy       # GitHub Pagesへデプロイ

# テスト
npm run test         # 単体テストの実行
npm run test:e2e     # E2Eテストの実行
npm run test:coverage # カバレッジレポート生成

# コード品質
npm run lint         # ESLintチェック
npm run lint:fix     # ESLint自動修正
npm run format       # Prettierフォーマット

# IDD（Issue-Driven Development）
npm run idd:check    # IDD準拠チェック
npm run idd:status   # 実装ステータス表示
npm run idd:report   # レポート生成
```

## 🛠️ 技術スタック

### フロントエンド
- **フレームワーク**: React 18.2（HashRouter使用）
- **ビルドツール**: Vite v5
- **視覚化**: D3.js v7, D3-sankey
- **スタイリング**: Tailwind CSS v3 + tailwindcss-animate
- **UIコンポーネント**: Radix UI（完全採用）
- **アイコン**: Lucide React
- **アニメーション**: Framer Motion v12

### 状態管理・データ
- **グローバル状態**: Zustand v4 + React Context
- **サーバー状態**: @tanstack/react-query v5（準備済み）
- **認証**: Supabase Auth（@supabase/supabase-js v2）
- **データ永続化**: LocalStorage（現在）、IndexedDB（移行準備中）

### テスト・品質管理
- **単体テスト**: Vitest v1.6 + @testing-library/react
- **E2Eテスト**: Playwright v1.40
- **リンティング**: ESLint + Prettier
- **型チェック**: TypeScript v5.3（部分導入）

### インフラ・デプロイ
- **ホスティング**: GitHub Pages
- **CI/CD**: GitHub Actions（複数ワークフロー実装）
- **パッケージ管理**: npm v8+

詳細な技術情報は [CLAUDE.md](CLAUDE.md) を参照してください。

## 📁 プロジェクト構造

```
PMPLearningManagement/
├── src/
│   ├── components/          # Reactコンポーネント
│   │   ├── auth/           # 認証関連
│   │   ├── learning/       # 学習機能
│   │   ├── visualizations/ # 視覚化コンポーネント
│   │   ├── layout/         # レイアウト
│   │   └── pages/          # ページコンポーネント
│   ├── contexts/           # React Context
│   ├── services/           # サービス層
│   ├── data/               # データ定義
│   ├── hooks/              # カスタムフック
│   └── utils/              # ユーティリティ
├── public/                 # 静的ファイル
├── docs/                   # プロジェクトドキュメント
├── scripts/                # 自動化スクリプト
├── .github/                # GitHub Actions設定
└── .claude/                # コンテキスト管理
```

## 📊 プロジェクト品質

### パフォーマンス指標
- **Lighthouseスコア**: パフォーマンス97点、アクセシビリティ95点以上
- **Core Web Vitals**: 全指標で「良好」達成
- **ビルド時間**: 約53秒
- **バンドルサイズ**: 1.3MB（最適化済み）

### 開発品質
- **IDD準拠率**: 99%（完全自動化達成）
- **テストカバレッジ**: 80.1%
- **コード品質スコア**: 87/100
- **循環複雑度**: 0（最適）
- **セキュリティ脆弱性**: 0個

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

### 開発フロー（IDD準拠）

1. **Issue作成**: 機能追加・バグ修正の前にIssueを作成
2. **ブランチ作成**: `feature/issue-番号` または `fix/issue-番号`
3. **開発**: IDD準拠のコミットメッセージで変更をコミット
4. **プルリクエスト**: Issue番号を含めてPRを作成
5. **レビュー**: 自動チェックとコードレビューの通過
6. **マージ**: mainブランチへマージ

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
- **ドキュメント**: 重要な変更はCLAUDE.mdを更新
- **パフォーマンス**: Lighthouse指標を維持・向上

詳細なガイドラインは以下を参照：

- [IDD実装ステータス](docs/IDD_IMPLEMENTATION_STATUS.md)
- [開発者向け詳細ドキュメント](CLAUDE.md)
- [IDDエージェントガイドライン](docs/IDD_AGENT_GUIDELINES.md)

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 🙏 謝辞

- **PMBOK®ガイド第6版・第7版** - Project Management Institute (PMI)
- [D3.js](https://d3js.org/) - 強力なデータ視覚化ライブラリ
- [React](https://react.dev/) - ユーザーインターフェース構築
- [Radix UI](https://www.radix-ui.com/) - アクセシブルなUIコンポーネント
- [Supabase](https://supabase.com/) - 認証・データベース基盤
- [Tailwind CSS](https://tailwindcss.com/) - ユーティリティファーストCSS
- [Vite](https://vitejs.dev/) - 高速ビルドツール

## 📞 サポート

- **バグ報告・機能要望**: [GitHub Issues](https://github.com/yusuke-kurosawa/PMPLearningManagement/issues)
- **ディスカッション**: [GitHub Discussions](https://github.com/yusuke-kurosawa/PMPLearningManagement/discussions)
- **セキュリティ問題**: セキュリティに関する問題は直接リポジトリ管理者にご連絡ください

## 🚀 今後のロードマップ

- [ ] バックエンドAPI統合（tRPC + Prisma）
- [ ] リアルタイム協業機能（WebSocket）
- [ ] AI学習アドバイザー統合
- [ ] 多言語対応（i18n）
- [ ] PWA完全対応（オフライン機能強化）
- [ ] モバイルアプリ版リリース

---

**免責事項**: PMBOK®、PMP®、PMI®はProject Management Institute, Inc.の登録商標です。本プロジェクトはPMIと提携、承認、スポンサーされたものではありません。

最終更新: 2025-09-28
