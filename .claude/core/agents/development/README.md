# 💻 Development エージェントカテゴリ

> **重要**: このディレクトリは開発実装に特化したClaude Codeエージェントを管理します。

## 📋 概要

Developmentカテゴリは、フロントエンド、バックエンド、フルスタック、モバイル開発を担当する実装専門エージェント群です。高品質なコード実装と最新技術の活用を支援します。

## 🤖 配置エージェント

### frontend-developer.md

**フロントエンド開発専門エージェント**

#### 専門領域

- React/Vue/Angular開発
- TypeScript実装
- UI/UXコンポーネント開発
- レスポンシブデザイン
- パフォーマンス最適化

#### 技術スタック

- **フレームワーク**: React 18, Vue 3, Next.js
- **言語**: TypeScript, JavaScript
- **スタイリング**: Tailwind CSS, CSS Modules, Styled Components
- **状態管理**: Zustand, Redux, Context API
- **ビジュアライゼーション**: D3.js, Chart.js

#### 主要タスク

```bash
# コンポーネント開発
@agent-frontend-developer Reactコンポーネントを作成してください

# UI最適化
@agent-frontend-developer レスポンシブデザインを実装してください

# パフォーマンス改善
@agent-frontend-developer Core Web Vitalsを最適化してください
```

### backend-developer.md

**バックエンド開発専門エージェント**

#### 専門領域

- APIサーバー開発
- データベース設計・最適化
- 認証・認可実装
- マイクロサービス開発
- パフォーマンスチューニング

#### 技術スタック

- **ランタイム**: Node.js, Python, Go
- **フレームワーク**: Express, Fastify, NestJS
- **データベース**: PostgreSQL, MongoDB, Redis
- **認証**: JWT, OAuth 2.0, Supabase Auth
- **API**: REST, GraphQL, gRPC

#### 主要タスク

```bash
# API開発
@agent-backend-developer RESTful APIを実装してください

# データベース設計
@agent-backend-developer データベーススキーマを設計してください

# 認証実装
@agent-backend-developer JWT認証を実装してください
```

### fullstack-developer.md

**フルスタック開発専門エージェント**

#### 専門領域

- エンドツーエンド機能実装
- フロント・バック統合
- システム全体の最適化
- DevOps連携
- アーキテクチャ実装

#### 技術スタック

- **フルスタック**: Next.js, Remix, T3 Stack
- **API統合**: tRPC, GraphQL
- **ORM**: Prisma, TypeORM
- **デプロイ**: Vercel, Netlify, Docker
- **モニタリング**: Sentry, DataDog

#### 主要タスク

```bash
# フルスタック機能開発
@agent-fullstack-developer ユーザー管理機能を完全実装してください

# システム統合
@agent-fullstack-developer フロントエンドとバックエンドを統合してください

# パフォーマンス最適化
@agent-fullstack-developer システム全体のパフォーマンスを改善してください
```

### mobile-app-developer.md

**モバイルアプリ開発専門エージェント**

#### 専門領域

- クロスプラットフォーム開発
- ネイティブアプリ開発
- PWA実装
- モバイル最適化
- プッシュ通知実装

#### 技術スタック

- **クロスプラットフォーム**: React Native, Flutter
- **PWA**: Service Workers, Web App Manifest
- **ネイティブ**: Swift (iOS), Kotlin (Android)
- **状態管理**: Redux, MobX
- **テスト**: Detox, Appium

#### 主要タスク

```bash
# モバイルアプリ開発
@agent-mobile-app-developer React Nativeアプリを開発してください

# PWA実装
@agent-mobile-app-developer PWA機能を実装してください

# モバイル最適化
@agent-mobile-app-developer モバイルパフォーマンスを最適化してください
```

## 🎯 使用シナリオ

### 新機能開発フロー

```bash
# 1. フロントエンド開発
@agent-frontend-developer UIコンポーネントを作成してください

# 2. バックエンド開発
@agent-backend-developer APIエンドポイントを実装してください

# 3. 統合テスト
@agent-fullstack-developer フロントとバックを統合してテストしてください

# 4. モバイル対応
@agent-mobile-app-developer モバイル版を開発してください
```

### 既存機能改善

```bash
# 1. 問題分析
@agent-fullstack-developer 既存コードの問題点を分析してください

# 2. リファクタリング
@agent-backend-developer バックエンドをリファクタリングしてください

# 3. UI改善
@agent-frontend-developer UIを改善してください
```

## 📊 評価メトリクス

### パフォーマンス指標

| メトリクス       | 目標値 | 現在値 |
| ---------------- | ------ | ------ |
| コード品質スコア | 90%    | 88%    |
| テストカバレッジ | 80%    | 78%    |
| バグ発生率       | <2%    | 1.8%   |
| 実装速度         | 100%   | 95%    |

### 技術指標

- **TypeScript採用率**: 100%
- **コンポーネント再利用率**: 75%
- **API応答速度**: <200ms
- **ビルド時間**: <60秒

## 🔧 開発環境設定

### 推奨ツール

```json
{
  "editor": "VS Code",
  "formatter": "Prettier",
  "linter": "ESLint",
  "package_manager": "npm",
  "version_control": "Git"
}
```

### コード品質基準

```yaml
quality_standards:
  - eslint_errors: 0
  - eslint_warnings: 0
  - test_coverage: '>80%'
  - type_coverage: '100%'
  - performance_score: '>90'
```

## 🔗 他カテゴリとの連携

### Architecture連携

```bash
# 設計レビュー後の実装
@agent-architect-reviewer 設計承認
→ @agent-fullstack-developer 実装開始
```

### Quality連携

```bash
# 開発後のテスト
@agent-frontend-developer 実装完了
→ @agent-qa-expert テスト実施
```

### Infrastructure連携

```bash
# デプロイ準備
@agent-fullstack-developer ビルド完了
→ @agent-devops-engineer デプロイ実行
```

## 🎮 ベストプラクティス

### ✅ 推奨事項

1. **コード品質維持**
   - TypeScript厳格モード使用
   - ESLint/Prettier準拠
   - 適切なコメント記述

2. **テスト駆動開発**
   - 単体テスト必須
   - 統合テスト実施
   - E2Eテスト自動化

3. **パフォーマンス重視**
   - コード分割実装
   - 遅延ロード活用
   - メモ化の適切使用

### ❌ 避けるべきこと

1. **アンチパターン**
   - any型の使用
   - 未使用変数の放置
   - 複雑すぎる関数

2. **セキュリティリスク**
   - ハードコードされた認証情報
   - SQLインジェクション脆弱性
   - XSS攻撃への脆弱性

## 📈 継続的改善

### スキルアップ目標

- 新技術の習得と実装
- コード品質の向上
- 実装速度の改善
- ベストプラクティスの更新

### 技術トレンド追跡

- React Server Components
- Edge Functions
- WebAssembly
- AI統合開発

---

**最終更新**: 2025-08-15  
**カテゴリ責任者**: @agent-fullstack-developer  
**対象プロジェクト**: PMPLearningManagement
