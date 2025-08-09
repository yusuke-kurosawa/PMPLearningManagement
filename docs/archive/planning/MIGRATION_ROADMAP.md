# Next.js 14 + TypeScript 移行ロードマップ

## エグゼクティブサマリー

現在のReact SPAから Next.js 14 + TypeScript モノリスアーキテクチャへの段階的移行計画。
既存の33コンポーネントと機能を維持しながら、パフォーマンス、型安全性、スケーラビリティを向上させます。

## 移行目標

### 主要目標

- **パフォーマンス**: 初期ロード時間を50-70%短縮
- **型安全性**: TypeScriptによる実行時エラーの削減
- **SEO**: サーバーサイドレンダリングによる検索エンジン最適化
- **スケーラビリティ**: モノリスアーキテクチャによる段階的拡張

### 成功指標

- Lighthouse スコア: 90+
- TypeScriptカバレッジ: 100%
- テストカバレッジ: 80%+
- ビルド時間: 3分以内

## フェーズ別実装計画

### フェーズ1: 基盤構築（Week 1-2）

#### Week 1: プロジェクトセットアップ

**Day 1-2: Next.js初期化**

```bash
# Next.js 14プロジェクト作成
npx create-next-app@14 . --typescript --tailwind --app --src-dir

# 追加パッケージインストール
npm install @prisma/client prisma
npm install @trpc/server @trpc/client @trpc/react-query
npm install next-auth @auth/prisma-adapter
npm install zustand @tanstack/react-query
npm install zod react-hook-form
npm install d3 d3-sankey recharts
```

**Day 3-4: 設定ファイル整備**

- [x] next.config.mjs
- [x] tsconfig.json
- [x] tailwind.config.ts
- [ ] prettier.config.js
- [ ] eslint.config.js
- [ ] jest.config.js

**Day 5: ディレクトリ構造作成**

- [x] 基本ディレクトリ作成
- [ ] パスエイリアス設定
- [ ] gitignore更新

#### Week 2: データベース・認証基盤

**Day 6-7: Prisma設定**

```typescript
// prisma/schema.prisma
- [x] スキーマ定義
- [ ] マイグレーション作成
- [ ] シードデータ作成
```

**Day 8-9: 認証システム**

```typescript
// lib/auth/nextauth.ts
- [ ] NextAuth.js設定
- [ ] プロバイダー設定（Google, GitHub）
- [ ] セッション管理
```

**Day 10: API基盤**

```typescript
// server/trpc/trpc.ts
- [ ] tRPC初期設定
- [ ] コンテキスト作成
- [ ] ミドルウェア設定
```

### フェーズ2: コンポーネント移行（Week 3-4）

#### Week 3: UIコンポーネント移行

**既存コンポーネントのTypeScript化**

優先度1: 基本コンポーネント

- [ ] Navigation.jsx → Navigation.tsx
- [ ] Home.jsx → Home.tsx
- [ ] PageTransition.jsx → PageTransition.tsx

優先度2: 学習機能

- [ ] LearningProgressDashboard.jsx → LearningProgressDashboard.tsx
- [ ] MockExam.jsx → MockExam.tsx
- [ ] FlashCardLearning.jsx → FlashCardLearning.tsx
- [ ] PMPGlossary.jsx → PMPGlossary.tsx

優先度3: 視覚化コンポーネント

- [ ] PMBOKMatrix.jsx → PMBOKMatrix.tsx
- [ ] ITTOForceGraph.jsx → ITTOForceGraph.tsx
- [ ] EnhancedNetworkGraph.jsx → EnhancedNetworkGraph.tsx
- [ ] SankeyDiagram.jsx → SankeyDiagram.tsx

**型定義作成**

```typescript
// types/pmbok.ts
export interface Process {
  id: string
  name: string
  nameJa: string
  knowledgeArea: KnowledgeArea
  processGroup: ProcessGroup
  inputs: ITTO[]
  tools: ITTO[]
  outputs: ITTO[]
}
```

#### Week 4: Shadcn/ui統合

**UIライブラリ移行**

```bash
# Shadcn/uiコンポーネント追加
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card dialog tabs
npx shadcn-ui@latest add form input select checkbox
npx shadcn-ui@latest add toast alert badge avatar
```

**コンポーネント置換マップ**
| 現在 | 移行先 |
|------|--------|
| カスタムButton | shadcn/ui Button |
| カスタムCard | shadcn/ui Card |
| カスタムModal | shadcn/ui Dialog |
| カスタムForm | shadcn/ui Form + react-hook-form |

### フェーズ3: API実装（Week 5-6）

#### Week 5: tRPCルーター実装

**ルーター構成**

```typescript
// server/trpc/router/index.ts
export const appRouter = router({
  auth: authRouter,
  progress: progressRouter,
  exam: examRouter,
  collaboration: collaborationRouter,
  pmbok: pmbokRouter,
})
```

**エンドポイント実装優先順位**

1. 認証関連
   - [ ] register
   - [ ] login
   - [ ] logout
   - [ ] session

2. 学習進捗
   - [ ] getProgress
   - [ ] updateProgress
   - [ ] getStatistics
   - [ ] resetProgress

3. 試験機能
   - [ ] startExam
   - [ ] submitAnswer
   - [ ] finishExam
   - [ ] getResults

#### Week 6: サービス層実装

**ビジネスロジック移行**

```typescript
// server/services/progress/ProgressService.ts
export class ProgressService {
  async updateProgress(userId: string, processId: string, data: UpdateProgressDto) {
    // トランザクション処理
    // キャッシュ更新
    // 通知送信
  }
}
```

**リポジトリ層実装**

```typescript
// server/repositories/ProgressRepository.ts
export class ProgressRepository {
  async findByUserId(userId: string) {
    return await prisma.progress.findMany({
      where: { userId },
      include: {
        /* relations */
      },
    })
  }
}
```

### フェーズ4: 統合・最適化（Week 7-8）

#### Week 7: 機能統合

**ページ実装**

- [ ] app/(public)/page.tsx - ホームページ
- [ ] app/(public)/pmbok/matrix/page.tsx - PMBOKマトリックス
- [ ] app/(auth)/dashboard/page.tsx - ダッシュボード
- [ ] app/(learning)/exam/page.tsx - 模擬試験

**データフェッチング最適化**

```typescript
// React Query設定
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})
```

#### Week 8: テスト・デプロイ

**テスト実装**

```typescript
// tests/unit/components/PMBOKMatrix.test.tsx
describe('PMBOKMatrix', () => {
  it('should render all 49 processes', () => {
    // テスト実装
  })
})
```

**E2Eテスト**

```typescript
// tests/e2e/learning-flow.spec.ts
test('complete learning flow', async ({ page }) => {
  // ログイン
  // 学習開始
  // 進捗確認
  // 試験実施
})
```

## リスク管理

### 技術的リスク

| リスク             | 影響度 | 発生確率 | 対策                           |
| ------------------ | ------ | -------- | ------------------------------ |
| D3.js互換性問題    | 高     | 中       | 段階的移行、代替ライブラリ検討 |
| パフォーマンス劣化 | 高     | 低       | プロファイリング、最適化       |
| 型定義の複雑性     | 中     | 高       | 段階的型付け、any許容          |
| データ移行エラー   | 高     | 低       | バックアップ、ロールバック計画 |

### ビジネスリスク

| リスク       | 影響度 | 発生確率 | 対策                       |
| ------------ | ------ | -------- | -------------------------- |
| 開発期間超過 | 中     | 中       | バッファ期間確保、MVP優先  |
| 機能欠落     | 高     | 低       | 詳細なテスト、段階リリース |
| ユーザー影響 | 高     | 低       | A/Bテスト、段階的切り替え  |

## チェックリスト

### 移行前チェックリスト

- [ ] 全コンポーネントのバックアップ
- [ ] 依存関係の互換性確認
- [ ] テストケースの準備
- [ ] ロールバック計画の策定

### 各フェーズ完了条件

**フェーズ1完了条件**

- [ ] Next.js 14が正常に起動
- [ ] TypeScript設定完了
- [ ] Prismaデータベース接続確認
- [ ] 基本的な認証フロー動作

**フェーズ2完了条件**

- [ ] 全コンポーネントのTypeScript化
- [ ] Shadcn/ui統合完了
- [ ] コンポーネントテスト通過
- [ ] Storybookで確認可能

**フェーズ3完了条件**

- [ ] 全APIエンドポイント実装
- [ ] データベース操作正常
- [ ] 認証・認可機能動作
- [ ] APIテスト通過

**フェーズ4完了条件**

- [ ] 全機能の統合完了
- [ ] E2Eテスト通過
- [ ] パフォーマンス目標達成
- [ ] 本番環境デプロイ成功

## コマンドリファレンス

### 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# TypeScriptチェック
npm run type-check

# テスト実行
npm run test
npm run test:e2e

# ビルド
npm run build
npm run build:analyze
```

### データベースコマンド

```bash
# マイグレーション
npx prisma migrate dev
npx prisma migrate deploy

# スキーマ同期
npx prisma db push

# Prisma Studio
npx prisma studio
```

### デプロイコマンド

```bash
# プロダクションビルド
npm run build:production

# デプロイ
npm run deploy:production
```

## サポートリソース

### ドキュメント

- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [TypeScript Migration Guide](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html)
- [Prisma with Next.js](https://www.prisma.io/nextjs)
- [tRPC with Next.js](https://trpc.io/docs/nextjs)

### 内部ドキュメント

- `/docs/architecture/DIRECTORY_STRUCTURE.md` - ディレクトリ構成
- `/docs/architecture/SYSTEM_ARCHITECTURE_PLAN.md` - システムアーキテクチャ
- `/docs/api/BACKEND_ARCHITECTURE.md` - バックエンドアーキテクチャ
- `/docs/security/SECURITY_IMPLEMENTATION_PLAN.md` - セキュリティ実装

## 連絡先

技術的な質問や課題については、以下のチャンネルで連絡してください：

- Slackチャンネル: #pmp-migration
- 技術リード: tech-lead@example.com
- プロジェクトマネージャー: pm@example.com
