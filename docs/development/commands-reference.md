# コマンドクイックリファレンス

## 開発環境

### 基本コマンド

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview

# デプロイ
npm run deploy
```

### テストコマンド

```bash
# 単体テスト
npm run test

# E2Eテスト
npm run test:e2e

# カバレッジ付きテスト
npm run test:coverage

# 監視モード
npm run test:watch

# UI付きテスト
npm run test:ui

# 品質ゲートチェック
npm run test:quality-gate

# ミューテーションテスト
npm run test:mutation

# プロパティベーステスト
npm run test:property

# カオステスト
npm run test:chaos
```

### リンティング・フォーマット

```bash
# ESLint実行
npm run lint

# ESLint修正
npm run lint:fix

# Prettier実行
npm run format

# 型チェック
npm run type-check
```

### ビルド・最適化

```bash
# プロダクションビルド
npm run build

# ビルド解析
npm run build:analyze

# ビルド最適化
npm run optimize:build

# デプロイ最適化
npm run optimize:deployment
```

### データベース関連

```bash
# Prismaスキーマ生成
npx prisma generate

# マイグレーション作成
npx prisma migrate dev --name <migration-name>

# マイグレーション実行
npx prisma migrate deploy

# データベースリセット
npx prisma migrate reset

# Prisma Studio起動
npx prisma studio

# シード実行
npx prisma db seed
```

### パフォーマンス

```bash
# パフォーマンステスト
npm run test:performance

# Lighthouseレポート
npm run lighthouse

# バンドル分析
npm run analyze
```

### セキュリティ

```bash
# 依存関係の脆弱性チェック
npm audit

# 脆弱性の自動修正
npm audit fix

# セキュリティスキャン
npm run security:scan
```

### Docker関連

```bash
# イメージビルド
docker build -t pmp-learning .

# コンテナ起動
docker run -p 3000:3000 pmp-learning

# Docker Compose起動
docker-compose up

# Docker Compose停止
docker-compose down

# ログ確認
docker-compose logs -f
```

### Git関連

```bash
# ブランチ作成
git checkout -b feature/<feature-name>

# コミット（セマンティック）
git commit -m "feat: 新機能追加"
git commit -m "fix: バグ修正"
git commit -m "docs: ドキュメント更新"
git commit -m "style: フォーマット変更"
git commit -m "refactor: リファクタリング"
git commit -m "test: テスト追加"
git commit -m "chore: 雑務"

# プルリクエスト作成
gh pr create --title "タイトル" --body "説明"

# マージ
git merge --no-ff feature/<feature-name>
```

### スクリプト実行

```bash
# モバイルデプロイ
./scripts/deploy-mobile.sh

# ヘルスチェック
node scripts/health-check.js

# バックアップ
./scripts/backup.sh

# LocalStorage → IndexedDB移行
node scripts/migrate-from-localstorage.js

# 模擬試験データインポート
node scripts/import-mock-exam.js
```

### 環境変数

```bash
# .env.localファイル作成
touch .env.local

# 環境変数例
DATABASE_URL="postgresql://user:password@localhost:5432/pmp"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
STRIPE_SECRET_KEY="sk_test_..."
SENTRY_DSN="https://..."
```

### トラブルシューティング

```bash
# キャッシュクリア
npm cache clean --force

# node_modules再インストール
rm -rf node_modules package-lock.json
npm install

# ポート確認（3000番）
lsof -i :3000

# プロセス終了
kill -9 <PID>

# Gitリセット
git reset --hard HEAD

# ビルドエラー時
npm run build -- --debug
```

### CI/CD

```bash
# GitHub Actions手動実行
gh workflow run deploy.yml

# ワークフロー確認
gh run list

# ログ確認
gh run view <run-id>
```

### モニタリング

```bash
# ログ確認（開発環境）
npm run logs:dev

# ログ確認（本番環境）
npm run logs:prod

# メトリクス確認
npm run metrics
```

## ショートカット

### VS Code

- `Cmd+P`: ファイル検索
- `Cmd+Shift+P`: コマンドパレット
- `Cmd+B`: サイドバー切り替え
- `Cmd+J`: ターミナル切り替え

### Chrome DevTools

- `Cmd+Option+I`: DevTools開く
- `Cmd+Option+J`: コンソール
- `Cmd+Option+C`: 要素選択
- `Cmd+Shift+C`: デバイスモード

## 便利なエイリアス

`.bashrc`または`.zshrc`に追加:

```bash
# PMPLearningManagement用エイリアス
alias pmp='cd ~/PMPLearningManagement'
alias pmpdev='cd ~/PMPLearningManagement && npm run dev'
alias pmptest='cd ~/PMPLearningManagement && npm run test'
alias pmpbuild='cd ~/PMPLearningManagement && npm run build'
alias pmpdeploy='cd ~/PMPLearningManagement && npm run deploy'
```
