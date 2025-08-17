# ディレクトリ構成ガイド

## 概要

このドキュメントは、PMP Learning Management SystemのNext.js 14 + TypeScriptモノリスアーキテクチャにおけるディレクトリ構成を説明します。

## ディレクトリ構成図

```
PMPLearningManagement/
├── app/                    # Next.js App Router
├── src/                    # ソースコード
├── prisma/                 # データベーススキーマ
├── public/                 # 静的ファイル
├── tests/                  # テストコード
├── config/                 # 設定ファイル
├── scripts/                # ユーティリティスクリプト
├── docs/                   # ドキュメント
└── .github/                # GitHub設定
```

## 詳細説明

### app/ - Next.js App Router

App Routerを使用したルーティングとレイアウト管理。

#### ルートグループ

- **(auth)/** - 認証が必要なページ
  - `dashboard/` - ダッシュボード
  - `progress/` - 学習進捗
  - `collaboration/` - コラボレーション機能

- **(public)/** - 公開ページ
  - `pmbok/` - PMBOK関連ページ
  - `visualizations/` - 視覚化ツール
  - `glossary/` - 用語集

- **(learning)/** - 学習機能
  - `flashcards/` - フラッシュカード
  - `exam/` - 模擬試験

#### API Routes

- **api/trpc/** - tRPCエンドポイント
- **api/auth/** - NextAuth.js認証
- **api/webhook/** - Webhook処理
- **api/health/** - ヘルスチェック

### src/ - ソースコード

#### components/ - UIコンポーネント

**構成原則:**

- `ui/` - 基本的なUIコンポーネント（Shadcn/ui）
- `features/` - 機能固有のコンポーネント
- `layout/` - レイアウトコンポーネント
- `shared/` - 共有コンポーネント

**命名規則:**

- PascalCase for コンポーネント名
- index.ts for バレルエクスポート
- \*.stories.tsx for Storybook
- \*.test.tsx for テスト

#### lib/ - ライブラリ層

**役割:**

- 外部サービスとの接続
- ユーティリティ関数
- 設定管理

**構成:**

- `api/` - APIクライアント
- `db/` - データベース接続
- `auth/` - 認証設定
- `utils/` - ユーティリティ

#### server/ - サーバーサイド

**アーキテクチャ:**

```
server/
├── trpc/          # API層
├── services/      # ビジネスロジック層
└── repositories/  # データアクセス層
```

**レイヤー責任:**

- **tRPC Router**: リクエスト処理、バリデーション
- **Service**: ビジネスロジック、トランザクション管理
- **Repository**: データベースアクセス、クエリ最適化

#### hooks/ - カスタムフック

**カテゴリ:**

- `queries/` - データフェッチ（useQuery）
- `mutations/` - データ更新（useMutation）
- `ui/` - UI関連フック

**命名規則:**

- use接頭辞を使用
- 単一責任の原則

#### stores/ - 状態管理

**使用技術:** Zustand

**ストア分類:**

- `theme.ts` - テーマ設定
- `preferences.ts` - ユーザー設定
- `exam.ts` - 試験状態

#### types/ - 型定義

**構成:**

- ドメイン別に分離
- 共通型は`common.ts`
- APIレスポンス型は`api.ts`

### prisma/ - データベース

**ファイル:**

- `schema.prisma` - スキーマ定義
- `migrations/` - マイグレーション履歴
- `seed.ts` - シードデータ

### tests/ - テスト

**テスト戦略:**

```
tests/
├── unit/         # 単体テスト（Vitest）
├── integration/  # 統合テスト
├── e2e/          # E2Eテスト（Playwright）
└── fixtures/     # テストデータ
```

**カバレッジ目標:**

- Unit: 80%以上
- Integration: 60%以上
- E2E: Critical Path 100%

## ベストプラクティス

### 1. インポートパス

```typescript
// Good - エイリアス使用
import { Button } from '@/components/ui/button'
import { useProgress } from '@/hooks/queries/useProgress'

// Bad - 相対パス
import { Button } from '../../../components/ui/button'
```

### 2. コンポーネント構成

```typescript
// components/features/pmbok/matrix/PMBOKMatrix.tsx
export const PMBOKMatrix = () => {
  // ロジック
}

// components/features/pmbok/matrix/index.ts
export { PMBOKMatrix } from './PMBOKMatrix'
export { ProcessCard } from './ProcessCard'
```

### 3. サービス層の実装

```typescript
// server/services/progress/ProgressService.ts
export class ProgressService {
  constructor(
    private progressRepo: ProgressRepository,
    private cacheService: CacheService
  ) {}

  async updateProgress(userId: string, data: UpdateProgressDto) {
    // ビジネスロジック
    // トランザクション管理
    // キャッシュ更新
  }
}
```

### 4. 型の共有

```typescript
// types/pmbok.ts
export interface Process {
  id: string
  name: string
  knowledgeArea: KnowledgeArea
  processGroup: ProcessGroup
}

// コンポーネントとAPIで共有
```

## 移行ガイド

### フェーズ1: 基盤構築

1. Next.js 14セットアップ
2. TypeScript設定
3. Prismaスキーマ作成
4. 基本ディレクトリ作成

### フェーズ2: コンポーネント移行

1. JSX → TSX変換
2. 型定義追加
3. テスト移行
4. Storybook設定

### フェーズ3: API実装

1. tRPCルーター作成
2. サービス層実装
3. リポジトリ層実装
4. 認証統合

### フェーズ4: 最適化

1. パフォーマンス最適化
2. SEO対応
3. アクセシビリティ
4. セキュリティ強化

## セキュリティ考慮事項

### 環境変数管理

```bash
.env.local        # ローカル開発
.env.production   # 本番環境
.env.test         # テスト環境
```

### アクセス制御

```typescript
// app/(auth)/layout.tsx
import { requireAuth } from '@/lib/auth/requireAuth'

export default async function AuthLayout({ children }) {
  await requireAuth()
  return children
}
```

### データ検証

```typescript
// server/trpc/router/progress.ts
import { z } from 'zod'

const updateProgressSchema = z.object({
  processId: z.string().cuid(),
  mastery: z.number().min(0).max(100),
})
```

## パフォーマンス最適化

### コード分割

```typescript
// 動的インポート
const VisualizationHub = dynamic(
  () => import('@/components/features/visualizations/VisualizationHub'),
  {
    loading: () => <VisualizationSkeleton />,
    ssr: false
  }
)
```

### キャッシング戦略

```typescript
// React Query設定
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分
      cacheTime: 10 * 60 * 1000, // 10分
    },
  },
})
```

### 画像最適化

```typescript
import Image from 'next/image'

<Image
  src="/pmbok-matrix.png"
  alt="PMBOK Matrix"
  width={800}
  height={600}
  priority
  placeholder="blur"
/>
```

## 開発ワークフロー

### 新機能追加

1. 型定義作成（types/）
2. APIルーター追加（server/trpc/）
3. サービス実装（server/services/）
4. UIコンポーネント作成（components/）
5. ページ作成（app/）
6. テスト作成（tests/）

### コードレビューチェックリスト

- [ ] TypeScript型が適切に定義されている
- [ ] エラーハンドリングが実装されている
- [ ] テストが書かれている
- [ ] アクセシビリティが考慮されている
- [ ] パフォーマンスが最適化されている
- [ ] セキュリティが考慮されている

## リソース

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com)
