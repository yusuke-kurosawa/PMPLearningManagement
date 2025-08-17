# 🚀 PMPLearningManagement クイックスタート

新規開発者向けの5分セットアップガイド

## ⚡ 即座に開始

```bash
# 1. プロジェクトをクローン
git clone https://github.com/yusuke-kurosawa/PMPLearningManagement.git
cd PMPLearningManagement

# 2. Node.js バージョン確認・切り替え
nvm use  # .nvmrcに基づいて Node.js 20.11.0に切り替え

# 3. 依存関係インストール
npm install

# 4. 環境変数設定
cp .env.example .env  # 必要に応じて編集

# 5. 開発サーバー起動
npm run dev
```

🌐 **開発サーバー**: http://localhost:5173

## 📋 必須ツール

- **Node.js**: 20.11.0 (.nvmrcで管理)
- **npm**: 8+
- **Git**: 最新版
- **VSCode**: 推奨エディタ（拡張機能自動インストール）

## 🏗️ プロジェクト構造

```
PMPLearningManagement/
├── src/                 # ソースコード
│   ├── components/      # Reactコンポーネント
│   ├── services/        # ビジネスロジック
│   ├── data/           # PMBOKデータ
│   └── styles/         # スタイル定義
├── .vscode/            # エディタ設定
├── scripts/            # 自動化スクリプト
└── docs/              # ドキュメント
```

## 🔧 よく使うコマンド

```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run test         # テスト実行
npm run lint         # ESLint実行
npm run lint:fix     # 自動修正
npm run format       # Prettier実行
npm run deploy       # GitHub Pagesデプロイ
```

## 🎯 開発フロー

1. **Issue作成**: GitHubでIssueを作成
2. **ブランチ作成**: `feature/issue-123-description`
3. **開発**: 自動保存でESLint+Prettier適用
4. **コミット**: Issue番号必須 `feat: 機能追加 #123`
5. **PR作成**: Issue参照、レビュー依頼

## 🚨 即座にトラブル解決

### ❌ npm install エラー
```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ TypeScript エラー
```bash
npm run typecheck  # 型チェック実行
```

### ❌ ESLint エラー
```bash
npm run lint:fix   # 自動修正
```

### ❌ ビルドエラー
```bash
npm run build      # 詳細エラー確認
```

## 🎨 デザインシステム

- **UI Framework**: Radix UI + Tailwind CSS
- **アイコン**: Lucide React
- **アニメーション**: Framer Motion
- **テーマ**: ダークモード対応

## 📚 主要技術スタック

- **フロントエンド**: React 18 + TypeScript + Vite
- **状態管理**: Zustand + React Query
- **テスト**: Vitest + Playwright
- **デプロイ**: GitHub Pages

## 🔒 認証・セキュリティ

- **認証**: Supabase Auth
- **環境変数**: `.env`ファイルで管理
- **セキュリティ**: CSP、HTTPS、CSRF対策

## 🎓 学習リソース

- [CLAUDE.md](./CLAUDE.md) - 完全なプロジェクトガイド
- [アーキテクチャ文書](./.claude/context/architecture-summary.md)
- [実装状況](./.claude/context/implementation-status.md)
- [API仕様書](./docs/api/)

## 🆘 ヘルプが必要？

1. **CLAUDE.md**: 総合ガイド確認
2. **GitHub Issues**: 既存問題を検索
3. **Discord/Slack**: チーム内相談
4. **コードレビュー**: PRでメンバーに質問

## ⚙️ 高度な設定

### 🔄 IDD（Issue-Driven Development）有効化
```bash
npm run idd:setup           # IDD環境構築
npm run idd:hooks:install   # Git hooks設定
```

### 🧪 高度なテスト
```bash
npm run test:e2e            # E2Eテスト
npm run test:mutation       # ミューテーションテスト
npm run test:advanced       # 全高度テスト
```

### 📊 品質チェック
```bash
npm run devops:full-check   # 全品質チェック
npm run performance:budget  # バンドルサイズチェック
npm run security:audit      # セキュリティ監査
```

---

🎉 **5分で開発環境完成！** 何か困ったら遠慮なくチームに聞いてください。