# PMP Learning Management - API仕様書

## 概要

PMPLearningManagement システムのtRPC APIエンドポイント仕様書です。
このAPIは型安全なTypeScriptベースのtRPCフレームワークを使用しており、
自動的な型推論と実行時バリデーションを提供します。

## 技術仕様

- **フレームワーク**: tRPC v10
- **認証**: NextAuth.js (JWT)
- **バリデーション**: Zod
- **データベース**: PostgreSQL + Prisma
- **型安全性**: 100% TypeScript

## ベースURL

- **開発環境**: `http://localhost:3000/api/trpc`
- **本番環境**: `https://pmplm.com/api/trpc`

---

## 1. 認証API (`auth`)

### `auth.signUp`

**概要**: 新規ユーザー登録

**タイプ**: Mutation

**入力**:

```typescript
{
  name: string (2-50文字)
  email: string (有効なメールアドレス)
  password: string (8文字以上、大文字・小文字・数字・特殊文字を含む)
  agreeToTerms: boolean (true必須)
}
```

**出力**:

```typescript
{
  user: {
    id: string
    name: string
    email: string
    role: UserRole
  }
  message: string
}
```

**エラー**:

- `CONFLICT`: メールアドレス既存
- `BAD_REQUEST`: 入力検証エラー

---

### `auth.verifyEmail`

**概要**: メールアドレス確認

**タイプ**: Mutation

**入力**:

```typescript
{
  token: string
}
```

**出力**:

```typescript
{
  message: string
}
```

---

### `auth.me`

**概要**: 現在ログインユーザー情報取得

**タイプ**: Query

**認証**: 必要

**出力**:

```typescript
{
  id: string
  name: string
  email: string
  role: UserRole
  subscriptionPlan: SubscriptionPlan
  subscriptionActive: boolean
  profileComplete: boolean
  settings: UserSettings
  learningProgress: LearningProgress
  permissions: Permission[]
  canUseAI: {
    basic: boolean
    advanced: boolean
    unlimited: boolean
  }
}
```

---

## 2. ユーザー管理API (`user`)

### `user.list`

**概要**: ユーザー一覧取得（管理者・インストラクター向け）

**タイプ**: Query

**認証**: 必要

**権限**: `USER_READ`

**入力**:

```typescript
{
  search?: string
  role?: UserRole
  subscriptionPlan?: SubscriptionPlan
  subscriptionActive?: boolean
  emailVerified?: boolean
  profileComplete?: boolean
  createdAfter?: Date
  createdBefore?: Date
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLoginAt' | 'totalStudyTime'
  sortOrder?: 'asc' | 'desc'
  page?: number (default: 1)
  pageSize?: number (1-100, default: 20)
}
```

**出力**:

```typescript
{
  users: Array<{
    id: string
    name: string
    email: string
    role: UserRole
    subscriptionPlan: SubscriptionPlan
    subscriptionActive: boolean
    profileComplete: boolean
    emailVerified: Date | null
    createdAt: Date
    learningProgress: {
      totalStudyTime: number
      currentStreak: number
      completedProcesses: string[]
    }
    _count: {
      examResults: number
      collaborationPosts: number
      studyGroups: number
    }
  }>
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}
```

---

### `user.updateProfile`

**概要**: プロフィール更新

**タイプ**: Mutation

**認証**: 必要

**入力**:

```typescript
{
  name?: string (2-50文字)
  bio?: string (最大500文字)
  location?: string (最大100文字)
  website?: string (有効なURL)
  linkedIn?: string (有効なLinkedIn URL)
  twitter?: string (有効なTwitterユーザー名)
}
```

**出力**:

```typescript
{
  user: {
    // 更新されたユーザー情報
  }
  message: string
}
```

---

## 3. 学習機能API (`learning`)

### `learning.getProgress`

**概要**: 学習進捗取得

**タイプ**: Query

**認証**: 必要

**入力**:

```typescript
{
  includeStats?: boolean (default: true)
  includeRecommendations?: boolean (default: false)
}
```

**出力**:

```typescript
{
  id: string
  userId: string
  totalStudyTime: number
  completedProcesses: string[]
  currentStreak: number
  longestStreak: number
  lastActivityDate: Date
  stats: {
    completionRate: number
    averageScore: number
    studyStreak: number
    weeklyHours: number
    monthlyHours: number
    totalExams: number
    passedExams: number
    knowledgeAreas: Record<string, {
      completed: number
      total: number
      averageScore: number
    }>
    processGroups: Record<string, {
      completed: number
      total: number
      averageScore: number
    }>
  }
  recommendations?: {
    nextProcesses: string[]
    weakAreas: string[]
    suggestedDuration: number
    priorityAreas: string[]
  }
}
```

---

### `learning.recordSession`

**概要**: 学習セッション記録

**タイプ**: Mutation

**認証**: 必要

**入力**:

```typescript
{
  processId: string
  processName: string
  knowledgeArea: string
  processGroup: string
  duration: number (1-7200秒)
  itemsStudied?: string[]
  completed?: boolean (default: false)
  notes?: string (最大1000文字)
}
```

**出力**:

```typescript
{
  session: {
    id: string
    processId: string
    processName: string
    duration: number
    completed: boolean
    createdAt: Date
  }
  message: string
}
```

---

### `learning.getStats`

**概要**: 学習統計取得

**タイプ**: Query

**認証**: 必要

**権限**: `LEARNING_ANALYTICS`

**入力**:

```typescript
{
  period?: 'week' | 'month' | 'quarter' | 'year' | 'all' (default: 'month')
}
```

**出力**:

```typescript
{
  studyTime: {
    total: number
    average: number
    trend: number
  }
  completion: {
    rate: number
    processesCompleted: number
    totalProcesses: number
  }
  engagement: {
    activeDays: number
    averageSessionLength: number
    streak: {
      current: number
      longest: number
    }
  }
  assessment: {
    averageScore: number
    improvementRate: number
    passRate: number
    totalAttempts: number
  }
}
```

---

## 4. 決済・サブスクリプションAPI (`payment`)

### `payment.getSubscription`

**概要**: サブスクリプション情報取得

**タイプ**: Query

**認証**: 必要

**権限**: `PAYMENT_VIEW`

**出力**:

```typescript
{
  id: string
  userId: string
  plan: SubscriptionPlan
  status: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  features: string[]
  billing: {
    amount: number
    currency: string
    interval: string | null
    nextBillingDate: Date | null
  }
  usage: {
    studyHours: number
    examAttempts: number
    aiQueries: number
    remainingQuota?: {
      exams: number | null
      aiQueries: number | null
    }
  }
}
```

---

### `payment.createSubscription`

**概要**: サブスクリプション作成

**タイプ**: Mutation

**認証**: 必要

**権限**: `PAYMENT_MANAGE`

**入力**:

```typescript
{
  planId: SubscriptionPlan (FREE以外)
  paymentMethodId?: string
}
```

**出力**:

```typescript
{
  subscription: {
    id: string
    status: string
    current_period_end: number
    // Stripe Subscription オブジェクト
  }
  clientSecret?: string
  message: string
}
```

---

### `payment.changePlan`

**概要**: プラン変更

**タイプ**: Mutation

**認証**: 必要

**権限**: `PAYMENT_MANAGE`

**入力**:

```typescript
{
  newPlan: SubscriptionPlan
  immediate?: boolean (default: false)
  prorationBehavior?: 'create_prorations' | 'none' (default: 'create_prorations')
}
```

**出力**:

```typescript
{
  success: boolean
  message: string
  subscription?: any
}
```

---

## 5. 通知API (`notification`)

### `notification.getSettings`

**概要**: 通知設定取得

**タイプ**: Query

**認証**: 必要

**出力**:

```typescript
{
  email: {
    enabled: boolean
    learningReminders: boolean
    examReminders: boolean
    achievements: boolean
    weeklyProgress: boolean
    systemAnnouncements: boolean
    collaborationUpdates: boolean
  }
  push: {
    enabled: boolean
    learningReminders: boolean
    examReminders: boolean
    achievements: boolean
    systemAnnouncements: boolean
  }
  inApp: {
    enabled: boolean
    showAchievements: boolean
    showReminders: boolean
    showCollaboration: boolean
  }
  frequency: {
    learningReminders: 'never' | 'daily' | 'weekly'
    progressReports: 'never' | 'weekly' | 'monthly'
  }
}
```

---

### `notification.updateSettings`

**概要**: 通知設定更新

**タイプ**: Mutation

**認証**: 必要

**入力**: 上記設定の部分オブジェクト

**出力**:

```typescript
{
  settings: NotificationSettings
  message: string
}
```

---

### `notification.getInApp`

**概要**: アプリ内通知一覧取得

**タイプ**: Query

**認証**: 必要

**入力**:

```typescript
{
  limit?: number (1-50, default: 20)
  offset?: number (default: 0)
  unreadOnly?: boolean (default: false)
}
```

**出力**:

```typescript
{
  notifications: Array<{
    id: string
    type: NotificationType
    title: string
    message: string
    data: Record<string, any>
    read: boolean
    createdAt: Date
  }>
  unreadCount: number
  totalCount: number
}
```

---

## 6. 管理者API (`admin`)

### `admin.getSystemHealth`

**概要**: システムヘルス情報取得

**タイプ**: Query

**認証**: 必要

**権限**: `SYSTEM_ADMIN`

**出力**:

```typescript
{
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  version: string
  environment: string
  checks: {
    database: HealthCheckResult
    redis: HealthCheckResult
    stripe: HealthCheckResult
    email: HealthCheckResult
    storage: HealthCheckResult
    external_apis: HealthCheckResult
    memory: HealthCheckResult
    cpu: HealthCheckResult
    disk: HealthCheckResult
  }
  summary: {
    total: number
    healthy: number
    degraded: number
    unhealthy: number
  }
}
```

---

### `admin.getMetrics`

**概要**: システムメトリクス取得

**タイプ**: Query

**認証**: 必要

**権限**: `SYSTEM_ADMIN`

**出力**: Prometheusフォーマットの文字列

---

## エラーハンドリング

### 共通エラーコード

- `UNAUTHORIZED` (401): 認証が必要
- `FORBIDDEN` (403): 権限不足
- `NOT_FOUND` (404): リソースが見つからない
- `BAD_REQUEST` (400): 入力データが無効
- `CONFLICT` (409): データ競合（例：既存メール）
- `TOO_MANY_REQUESTS` (429): レート制限超過
- `INTERNAL_SERVER_ERROR` (500): サーバー内部エラー

### エラーレスポンス形式

```typescript
{
  error: {
    code: string
    message: string
    data?: {
      code: string
      httpStatus: number
      stack?: string // 開発環境のみ
      path: string
    }
  }
}
```

---

## 認証・認可

### 認証方法

1. **セッションベース**: NextAuth.js JWT
2. **ヘッダー**: `Authorization: Bearer <token>`
3. **Cookie**: `next-auth.session-token`

### 権限システム

- **Role-Based Access Control (RBAC)**
- **サブスクリプション制限**
- **使用量制限**

### 権限レベル

1. **USER**: 基本的な学習機能
2. **INSTRUCTOR**: 学習管理・分析機能
3. **ADMIN**: システム管理機能

---

## レート制限

### 制限レベル

- **認証失敗**: 5回/5分
- **API呼び出し**: 100回/分（FREE）、1000回/分（Premium）
- **メール送信**: 10通/時間

### レスポンスヘッダー

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## パフォーマンス

### レスポンス時間目標

- **クエリ**: p95 < 200ms
- **ミューテーション**: p95 < 500ms
- **ファイルアップロード**: p95 < 2000ms

### キャッシュ戦略

- **ユーザー設定**: 5分間キャッシュ
- **学習進捗**: 1分間キャッシュ
- **システム設定**: 1時間キャッシュ

---

## WebSocket (リアルタイム機能)

### 接続エンドポイント

`ws://localhost:3000/api/websocket`

### イベント

- `progress_updated`: 学習進捗更新
- `notification_received`: 新しい通知
- `exam_completed`: 試験完了

---

## SDK・クライアント

### TypeScript Client

```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@/server/routers/_app'

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
    }),
  ],
})

// 使用例
const user = await trpc.auth.me.query()
const result = await trpc.learning.recordSession.mutate({
  processId: 'process_1',
  processName: 'プロジェクト憲章作成',
  knowledgeArea: 'Integration',
  processGroup: 'Initiating',
  duration: 1800,
  completed: true,
})
```

### React Hooks

```typescript
import { trpc } from '@/utils/trpc';

function UserProfile() {
  const { data: user, isLoading } = trpc.auth.me.useQuery();
  const updateProfile = trpc.user.updateProfile.useMutation();

  if (isLoading) return <div>読み込み中...</div>;

  return (
    <div>
      <h1>{user?.name}</h1>
      {/* プロフィール表示 */}
    </div>
  );
}
```

---

## 監視・ログ

### 構造化ログ

- **相関ID**: 各リクエストに一意ID
- **ユーザーコンテキスト**: ユーザーID、セッション情報
- **パフォーマンス**: レスポンス時間、メモリ使用量

### メトリクス

- **Prometheus**: `/api/metrics`
- **ヘルスチェック**: `/api/health`
- **詳細ヘルス**: `/api/health/detailed`

---

## セキュリティ

### OWASP Top 10対応

1. **インジェクション**: Prisma ORM + パラメータ化クエリ
2. **認証の破綻**: NextAuth.js + JWT
3. **機微情報の漏洩**: 環境変数、暗号化
4. **XXE**: JSON のみ、XML解析なし
5. **アクセス制御の不備**: RBAC実装
6. **セキュリティ設定ミス**: セキュリティヘッダー設定
7. **XSS**: サニタイゼーション、CSP
8. **安全でないデシリアライゼーション**: Zod検証
9. **脆弱性のあるコンポーネント**: 依存関係スキャン
10. **ログ・監視不足**: 構造化ログ、監視

### セキュリティヘッダー

```
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000
```

---

## バージョン管理

- **API バージョン**: セマンティックバージョニング
- **後方互換性**: マイナーバージョンで維持
- **非推奨機能**: 6ヶ月前に告知

---

この API仕様書は、開発チームと外部統合パートナーの両方が参照できる
包括的なリファレンスとして設計されています。
