# 🚀 開発環境セットアップガイド

**所要時間**: 10分 | **難易度**: 初級

> 💡 **このガイドで達成できること**  
> PMP Learning Managementの開発環境を構築し、最初のコントリビューションを行う準備を整える

## 📋 前提条件

### 必須要件

- **Node.js**: v18.0.0以上
- **npm**: v8.0.0以上
- **Git**: v2.30.0以上
- **OS**: Windows 10/11, macOS 11+, Ubuntu 20.04+

### 推奨環境

- **エディタ**: Visual Studio Code
- **ブラウザ**: Chrome/Firefox (最新版)
- **RAM**: 8GB以上
- **ストレージ**: 2GB以上の空き容量

## 🎯 セットアップ手順

### 1️⃣ リポジトリのクローン（1分）

```bash
# HTTPSを使用する場合
git clone https://github.com/yusuke-kurosawa/PMPLearningManagement.git

# SSHを使用する場合（推奨）
git clone git@github.com:yusuke-kurosawa/PMPLearningManagement.git

# ディレクトリに移動
cd PMPLearningManagement
```

### 2️⃣ 依存関係のインストール（3分）

```bash
# パッケージのインストール
npm install

# インストールの確認
npm list --depth=0
```

⚠️ **トラブルシューティング**
```bash
# キャッシュクリアが必要な場合
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 3️⃣ 環境変数の設定（2分）

```bash
# .env.localファイルを作成
cp .env.example .env.local

# エディタで.env.localを開いて編集
# 以下の環境変数を設定
```

**.env.local の設定例**
```env
# Supabase設定
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API設定
VITE_API_URL=http://localhost:3001

# 開発環境設定
VITE_ENV=development
VITE_DEBUG=true
```

### 4️⃣ IDD環境のセットアップ（2分）

Issue-Driven Development (IDD) の自動化環境を構築：

```bash
# IDD環境の初期化
npm run idd:setup

# Git hooksのインストール
npm run idd:hooks:install

# 準拠状態の確認
npm run idd:check
```

✅ **成功メッセージ**
```
✅ IDD environment setup complete!
✅ Git hooks installed successfully
✅ IDD compliance: 100%
```

### 5️⃣ 開発サーバーの起動（1分）

```bash
# 開発サーバーを起動
npm run dev

# 出力例：
# VITE v5.0.0  ready in 500 ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: http://192.168.1.100:5173/
```

🎉 **成功！** ブラウザで http://localhost:5173 にアクセスして確認

### 6️⃣ ビルドの確認（1分）

```bash
# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

## 🛠️ 開発ツール設定

### VS Code 拡張機能（推奨）

必須の拡張機能をインストール：

```bash
# 拡張機能の一括インストール
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension formulahendry.auto-rename-tag
```

### VS Code 設定

`.vscode/settings.json` を作成：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact"
  ],
  "tailwindCSS.experimental.classRegex": [
    ["className=\"([^\"]*)\"", "([^\"]*)"]
  ]
}
```

## 📝 開発ワークフロー

### 基本的な開発フロー

1. **Issueの選択または作成**
```bash
# GitHub上でIssueを確認
# https://github.com/yusuke-kurosawa/PMPLearningManagement/issues
```

2. **ブランチの作成**
```bash
# feature/issue-番号 形式でブランチを作成
git checkout -b feature/issue-123
```

3. **開発とテスト**
```bash
# 開発サーバーで動作確認
npm run dev

# テストの実行
npm run test

# リントチェック
npm run lint
```

4. **コミット（IDD準拠）**
```bash
# ステージング
git add .

# IDD準拠のコミット（Issue番号必須）
git commit -m "feat: 新機能の追加 #123"
```

5. **プッシュとPR作成**
```bash
# リモートにプッシュ
git push origin feature/issue-123

# GitHub上でPull Requestを作成
```

## 🧪 テスト実行

### 単体テスト

```bash
# すべてのテストを実行
npm run test

# ウォッチモードでテスト
npm run test:watch

# カバレッジレポート生成
npm run test:coverage
```

### E2Eテスト

```bash
# Playwrightのインストール（初回のみ）
npx playwright install

# E2Eテストの実行
npm run test:e2e

# UIモードでE2Eテスト
npm run test:e2e:ui
```

## 📊 コード品質チェック

### ESLint

```bash
# リントチェック
npm run lint

# 自動修正
npm run lint:fix
```

### Prettier

```bash
# フォーマットチェック
npm run format:check

# 自動フォーマット
npm run format
```

### IDD準拠チェック

```bash
# IDD準拠状態の確認
npm run idd:check

# 詳細レポート生成
npm run idd:report
```

## 🐛 デバッグ

### Chrome DevTools

1. 開発サーバーを起動
2. Chrome で F12 を押して DevTools を開く
3. Sources タブでブレークポイントを設定

### VS Code デバッグ

`.vscode/launch.json` を作成：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

F5キーでデバッグセッション開始

## 🚀 デプロイ

### GitHub Pages へのデプロイ

```bash
# ビルドとデプロイ
npm run deploy

# 確認URL
# https://yusuke-kurosawa.github.io/PMPLearningManagement/
```

## 📚 重要なディレクトリ構造

```
PMPLearningManagement/
├── src/
│   ├── components/      # Reactコンポーネント
│   ├── contexts/       # React Context
│   ├── services/       # ビジネスロジック
│   ├── hooks/          # カスタムフック
│   ├── data/           # 静的データ
│   └── utils/          # ユーティリティ関数
├── public/             # 静的ファイル
├── tests/              # テストファイル
├── .github/            # GitHub Actions
├── .claude/            # Claude AI用コンテキスト
└── docs/               # ドキュメント
```

## ❓ よくある質問

### Q: ポート5173が使用中の場合

```bash
# 別のポートを指定
npm run dev -- --port 3000
```

### Q: npm install でエラーが発生

```bash
# Node.jsバージョン確認
node --version  # v18以上が必要

# npmキャッシュクリア
npm cache clean --force
```

### Q: Supabaseの設定方法

1. [Supabase](https://supabase.com)でプロジェクト作成
2. Settings > API から URL と anon key を取得
3. `.env.local` に設定

## 🆘 サポート

### 開発者コミュニティ

- **Discord**: [参加リンク](https://discord.gg/example)
- **GitHub Discussions**: [ディスカッション](https://github.com/yusuke-kurosawa/PMPLearningManagement/discussions)
- **Issue報告**: [Issues](https://github.com/yusuke-kurosawa/PMPLearningManagement/issues)

### ドキュメント

- [アーキテクチャ概要](./architecture/README.md)
- [API仕様](./api/README.md)
- [コントリビューションガイド](./contributing/README.md)
- [IDD ガイドライン](./contributing/idd-guide.md)

---

**最終更新**: 2025-08-16  
**メンテナー**: Development Team

> 💡 **次のステップ**: [アーキテクチャ概要](./architecture/README.md)を読んでシステム設計を理解しましょう