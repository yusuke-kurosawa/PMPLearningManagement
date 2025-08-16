# PMPLearningManagement プロジェクトマップ

## プロジェクト構造概要

```
PMPLearningManagement/
├── 📚 ドキュメント (docs/)
│   ├── 要件・計画
│   ├── アーキテクチャ
│   ├── セキュリティ
│   └── テスト・品質
├── 🎨 フロントエンド (src/)
│   ├── コンポーネント
│   ├── サービス
│   └── データスキーマ
├── 🔧 バックエンド (src/server/)
│   ├── API
│   ├── 認証・認可
│   └── データベース
├── 🧪 テスト
│   ├── 単体テスト
│   ├── 統合テスト
│   └── E2Eテスト
└── 🚀 デプロイメント
    ├── CI/CD
    ├── モニタリング
    └── インフラ
```

## 主要ディレクトリ

### /docs - プロジェクトドキュメント

- **要件定義**: `/docs/guides/REQUIREMENTS_DEFINITION.md`
- **API仕様**: `/docs/API_SPECIFICATION.md`
- **システムアーキテクチャ**: `/docs/architecture/SYSTEM_ARCHITECTURE_PLAN.md`
- **セキュリティ**: `/docs/security/`
- **テスト計画**: `/docs/TEST_PLAN.md`

### /src - ソースコード

- **コンポーネント**: `/src/components/`
  - レイアウト: `/src/components/layout/`
  - 学習機能: `/src/components/learning/`
  - 視覚化: `/src/components/visualizations/`
  - コラボレーション: `/src/components/collaboration/`
  - モバイル: `/src/components/mobile/`

- **サーバー**: `/src/server/`
  - ルーター: `/src/server/routers/`
  - サービス: `/src/server/services/`
  - 認証: `/src/server/auth/`
  - キャッシュ: `/src/server/cache/`

### /tests - テストコード

- **単体テスト**: `/tests/unit/`
- **統合テスト**: `/tests/integration/`
- **E2Eテスト**: `/tests/e2e/`
- **高度なテスト**: `/tests/advanced/`

### /config - 設定ファイル

- **環境設定**: `/config/environment/`
- **デプロイ設定**: `/config/deploy/`
- **モニタリング**: `/config/monitoring/`
- **Redis設定**: `/config/redis/`

### /scripts - 自動化スクリプト

- **デプロイメント**: `/scripts/deploy-mobile.sh`
- **テスト実行**: `/scripts/test-*.sh`
- **メンテナンス**: `/scripts/maintenance/`
- **最適化**: `/scripts/optimize-*.js`

## 重要ファイル

### 設定ファイル

- `package.json` - プロジェクト依存関係とスクリプト
- `vite.config.mjs` - Viteビルド設定
- `tailwind.config.ts` - Tailwind CSS設定
- `tsconfig.json` - TypeScript設定
- `prisma/schema.prisma` - データベーススキーマ

### エントリーポイント

- `src/main.jsx` - フロントエンドエントリー
- `src/App.jsx` - メインアプリケーションコンポーネント
- `public/sw.js` - Service Worker

## データフロー

```
ユーザー入力
    ↓
フロントエンド (React)
    ↓
API (tRPC)
    ↓
サービス層
    ↓
データベース (Prisma + PostgreSQL)
    ↓
キャッシュ (Redis)
```

## 技術スタック一覧

### フロントエンド

- React 18.2
- TypeScript
- Tailwind CSS
- D3.js (視覚化)
- Vite (ビルドツール)

### バックエンド

- Node.js
- tRPC
- Prisma ORM
- PostgreSQL
- Redis

### テスト

- Vitest
- Playwright
- Testing Library

### インフラ・DevOps

- GitHub Actions
- Docker
- Prometheus/Grafana
- Sentry

## クイックナビゲーション

- [要件定義](/docs/guides/REQUIREMENTS_DEFINITION.md)
- [アーキテクチャ設計](/docs/architecture/SYSTEM_ARCHITECTURE_PLAN.md)
- [API仕様](/docs/API_SPECIFICATION.md)
- [セキュリティ実装](/docs/security/SECURITY_IMPLEMENTATION_PLAN.md)
- [テスト計画](/docs/TEST_PLAN.md)
- [デプロイメントガイド](/docs/CLOUD_DEPLOYMENT_GUIDE.md)
