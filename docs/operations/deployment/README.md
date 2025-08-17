# 🚀 デプロイメントガイド

## 概要

PMP Learning Managementのデプロイメントに関する包括的なガイドです。開発環境からプロダクション環境まで、各種デプロイメント手順を説明します。

## 📋 目次

1. [環境概要](#環境概要)
2. [GitHub Pages デプロイ](#github-pages-デプロイ)
3. [Vercel デプロイ](#vercel-デプロイ)
4. [Docker デプロイ](#docker-デプロイ)
5. [CI/CD パイプライン](#cicd-パイプライン)
6. [環境変数管理](#環境変数管理)
7. [ヘルスチェック](#ヘルスチェック)
8. [ロールバック手順](#ロールバック手順)

## 🌍 環境概要

| 環境 | URL | 用途 | 自動デプロイ |
|------|-----|------|-------------|
| Development | http://localhost:5173 | 開発 | - |
| Staging | https://staging.example.com | テスト | PR作成時 |
| Production | https://yusuke-kurosawa.github.io/PMPLearningManagement/ | 本番 | mainマージ時 |

## 📦 GitHub Pages デプロイ

### 自動デプロイ（推奨）

mainブランチへのマージで自動的にデプロイされます。

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - run: npm run deploy
```

### 手動デプロイ

```bash
# ローカルからデプロイ
npm run build
npm run deploy

# 確認
open https://yusuke-kurosawa.github.io/PMPLearningManagement/
```

### トラブルシューティング

**404エラーの場合**
```bash
# vite.config.jsの確認
base: '/PMPLearningManagement/'

# HashRouterの使用確認
import { HashRouter } from 'react-router-dom'
```

**キャッシュの問題**
```bash
# ブラウザキャッシュをクリア
# または、バージョンパラメータを追加
?v=1.2.3
```

## 🔺 Vercel デプロイ

### 初期設定

1. [Vercel](https://vercel.com)でアカウント作成
2. GitHubリポジトリを接続
3. 環境変数を設定

### vercel.json設定

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### 環境変数設定

```bash
# Vercel CLI使用
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### デプロイコマンド

```bash
# プレビューデプロイ
vercel

# プロダクションデプロイ
vercel --prod
```

## 🐳 Docker デプロイ

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
```

### Docker コマンド

```bash
# イメージビルド
docker build -t pmp-learning:latest .

# コンテナ起動
docker run -d -p 80:80 --name pmp-learning pmp-learning:latest

# Docker Compose使用
docker-compose up -d
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3
```

## 🔄 CI/CD パイプライン

### GitHub Actions ワークフロー

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
      - run: npm run deploy
```

### デプロイメントステータス

```bash
# GitHub Actions の状態確認
gh run list --workflow=deploy.yml

# 特定のランの詳細
gh run view <run-id>

# ログ確認
gh run view <run-id> --log
```

## 🔐 環境変数管理

### 開発環境

```bash
# .env.local
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_API_URL=http://localhost:3001
VITE_ENV=development
```

### プロダクション環境

```bash
# GitHub Secrets設定
gh secret set VITE_SUPABASE_URL
gh secret set VITE_SUPABASE_ANON_KEY
```

### 環境変数の検証

```javascript
// src/config/env.js
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

requiredEnvVars.forEach(varName => {
  if (!import.meta.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```

## 🏥 ヘルスチェック

### エンドポイント実装

```javascript
// src/api/health.js
export const healthCheck = async () => {
  const checks = {
    app: 'ok',
    database: 'unknown',
    timestamp: new Date().toISOString()
  };

  try {
    // Database check
    await supabase.from('health').select('*').limit(1);
    checks.database = 'ok';
  } catch (error) {
    checks.database = 'error';
  }

  return checks;
};
```

### モニタリング

```bash
# ヘルスチェックスクリプト
#!/bin/bash
HEALTH_URL="https://yusuke-kurosawa.github.io/PMPLearningManagement/api/health"

response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $response -eq 200 ]; then
  echo "✅ Health check passed"
else
  echo "❌ Health check failed with status: $response"
  exit 1
fi
```

## ↩️ ロールバック手順

### GitHub Pages

```bash
# 前のコミットを確認
git log --oneline -10

# 特定のコミットにロールバック
git revert <commit-hash>
git push origin main

# または、前のバージョンタグにロールバック
git checkout v1.2.2
npm run build
npm run deploy
```

### Vercel

```bash
# デプロイメント一覧
vercel ls

# 特定のデプロイメントにロールバック
vercel rollback <deployment-url>
```

### Docker

```bash
# 前のバージョンに切り替え
docker stop pmp-learning
docker run -d -p 80:80 --name pmp-learning pmp-learning:v1.2.2

# または、Docker Compose
docker-compose down
git checkout v1.2.2
docker-compose up -d
```

## 📊 デプロイメントチェックリスト

### プリデプロイ

- [ ] すべてのテストがパス
- [ ] ビルドが成功
- [ ] 環境変数が設定済み
- [ ] データベースマイグレーション実行済み
- [ ] セキュリティスキャン完了

### ポストデプロイ

- [ ] ヘルスチェック成功
- [ ] 主要機能の動作確認
- [ ] パフォーマンステスト
- [ ] エラー監視確認
- [ ] ユーザー通知（必要な場合）

## 🆘 トラブルシューティング

### よくある問題

**ビルドエラー**
```bash
# node_modulesとキャッシュをクリア
rm -rf node_modules package-lock.json
npm install
npm run build
```

**デプロイ失敗**
```bash
# GitHub Pagesの設定確認
# Settings > Pages > Source: gh-pages branch

# 権限確認
gh auth status
```

**環境変数が反映されない**
```bash
# Viteの環境変数はVITE_プレフィックスが必要
# ビルド時に環境変数を注入
VITE_API_URL=https://api.example.com npm run build
```

## 📚 関連ドキュメント

- [環境設定ガイド](../configuration.md)
- [モニタリング設定](../monitoring/README.md)
- [セキュリティガイド](../security/README.md)
- [GitHub Actions ワークフロー](../../github-actions/README.md)

---

**最終更新**: 2025-08-16  
**メンテナー**: DevOps Team

> 💡 **サポート**: デプロイメントに関する質問は[#devops](https://slack.com/channels/devops)チャンネルまで