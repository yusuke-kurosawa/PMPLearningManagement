# PMP Learning Management - テスト計画書

## 概要

PMPLearningManagement システムの包括的なテスト戦略とプランです。
品質保証の観点から、テストカバレッジ80%以上を目標とし、
本番環境でのバグ発生率を最小限に抑えることを目的としています。

## テスト戦略

### テストピラミッド

```
     /\
    /  \  E2E Tests (10%)
   /    \
  /______\  Integration Tests (20%)
 /        \
/__________\  Unit Tests (70%)
```

### 品質目標

- **テストカバレッジ**: 80%以上
- **バグ密度**: < 0.5 bugs/KLoC
- **パフォーマンス**: p95 < 200ms
- **可用性**: 99.9%
- **セキュリティ**: OWASP Top 10 完全対応

---

## 1. 単体テスト (Unit Tests)

### 対象コンポーネント

#### 1.1 サービス層テスト

**ファイル**: `src/server/services/*.test.ts`

```typescript
// UserService テスト例
describe('UserService', () => {
  beforeEach(() => {
    // データベースクリーンアップ
    // モック設定
  })

  describe('createUser', () => {
    it('有効なデータで新規ユーザーを作成できる', async () => {
      const userData = {
        name: 'テストユーザー',
        email: 'test@example.com',
        password: 'Password123!',
        role: UserRole.USER,
        subscriptionPlan: SubscriptionPlan.FREE,
        emailVerified: false,
      }

      const user = await UserService.createUser(userData)

      expect(user.id).toBeDefined()
      expect(user.email).toBe(userData.email)
      expect(user.role).toBe(UserRole.USER)
    })

    it('重複メールアドレスで作成を拒否する', async () => {
      // 既存ユーザー作成
      await UserService.createUser({
        name: '既存ユーザー',
        email: 'existing@example.com',
        password: 'Password123!',
      })

      // 重複作成試行
      await expect(
        UserService.createUser({
          name: '新規ユーザー',
          email: 'existing@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow('メールアドレスは既に使用されています')
    })

    it('無効なメールアドレスで作成を拒否する', async () => {
      await expect(
        UserService.createUser({
          name: 'テストユーザー',
          email: 'invalid-email',
          password: 'Password123!',
        })
      ).rejects.toThrow()
    })
  })

  describe('updateUser', () => {
    it('有効なデータでユーザー情報を更新できる', async () => {
      const user = await createTestUser()

      const updatedUser = await UserService.updateUser(user.id, {
        name: '更新されたユーザー',
        bio: 'テストユーザーの自己紹介',
      })

      expect(updatedUser.name).toBe('更新されたユーザー')
      expect(updatedUser.bio).toBe('テストユーザーの自己紹介')
    })
  })
})
```

#### 1.2 認証・認可テスト

```typescript
describe('Auth System', () => {
  describe('PermissionChecker', () => {
    it('フリープランユーザーの権限を正しく判定する', () => {
      const userContext = {
        id: 'user-1',
        role: UserRole.USER,
        subscriptionPlan: SubscriptionPlan.FREE,
        subscriptionActive: true,
        profileComplete: true,
      }

      const checker = createPermissionChecker(userContext)

      expect(checker.hasPermission(Permission.LEARNING_READ)).toBe(true)
      expect(checker.hasPermission(Permission.AI_ADVANCED)).toBe(false)
      expect(checker.canUseAI('basic')).toBe(false)
    })

    it('プレミアムユーザーの権限を正しく判定する', () => {
      const userContext = {
        id: 'user-2',
        role: UserRole.USER,
        subscriptionPlan: SubscriptionPlan.PREMIUM,
        subscriptionActive: true,
        profileComplete: true,
      }

      const checker = createPermissionChecker(userContext)

      expect(checker.hasPermission(Permission.AI_ADVANCED)).toBe(true)
      expect(checker.canUseAI('advanced')).toBe(true)
      expect(checker.isPremiumUser()).toBe(true)
    })
  })
})
```

#### 1.3 学習機能テスト

```typescript
describe('LearningService', () => {
  describe('recordStudySession', () => {
    it('学習セッションを正しく記録する', async () => {
      const userId = 'test-user-id'
      const sessionData = {
        processId: 'process_1',
        processName: 'プロジェクト憲章作成',
        knowledgeArea: 'Integration',
        processGroup: 'Initiating',
        duration: 1800,
        completed: true,
      }

      const session = await LearningService.recordStudySession(userId, sessionData)

      expect(session.id).toBeDefined()
      expect(session.processId).toBe(sessionData.processId)
      expect(session.completed).toBe(true)
    })

    it('学習進捗を自動更新する', async () => {
      const userId = 'test-user-id'

      // 初期進捗確認
      const initialProgress = await LearningService.getLearningProgress(userId)
      const initialCompletedCount = initialProgress.completedProcesses.length

      // セッション記録
      await LearningService.recordStudySession(userId, {
        processId: 'new_process',
        processName: 'New Process',
        knowledgeArea: 'Integration',
        processGroup: 'Initiating',
        duration: 1800,
        completed: true,
      })

      // 進捗更新確認
      const updatedProgress = await LearningService.getLearningProgress(userId)
      expect(updatedProgress.completedProcesses.length).toBe(initialCompletedCount + 1)
      expect(updatedProgress.totalStudyTime).toBe(initialProgress.totalStudyTime + 1800)
    })
  })

  describe('getStudyRecommendations', () => {
    it('未完了プロセスに基づく推奨を返す', async () => {
      const userId = 'test-user-id'
      const recommendations = await LearningService.getStudyRecommendations(userId)

      expect(recommendations.nextProcesses).toBeDefined()
      expect(Array.isArray(recommendations.nextProcesses)).toBe(true)
      expect(recommendations.suggestedDuration).toBeGreaterThan(0)
    })
  })
})
```

#### 1.4 決済機能テスト

```typescript
describe('StripeService', () => {
  beforeEach(() => {
    // Stripe APIモック設定
    jest.mock('stripe', () => ({
      customers: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
      subscriptions: {
        create: jest.fn(),
        update: jest.fn(),
        cancel: jest.fn(),
      },
    }))
  })

  describe('createSubscription', () => {
    it('新規サブスクリプションを作成する', async () => {
      const mockSubscription = {
        id: 'sub_test123',
        status: 'active',
        current_period_start: 1640995200,
        current_period_end: 1643673600,
      }

      StripeService.stripe.subscriptions.create.mockResolvedValue(mockSubscription)

      const result = await StripeService.createSubscription('user-123', SubscriptionPlan.BASIC)

      expect(result.subscription.id).toBe('sub_test123')
      expect(result.subscription.status).toBe('active')
    })

    it('既存顧客の場合はサブスクリプションのみ作成する', async () => {
      // テスト実装
    })
  })
})
```

#### 1.5 通知機能テスト

```typescript
describe('NotificationService', () => {
  describe('sendNotification', () => {
    it('有効なチャネルで通知を送信する', async () => {
      const notificationData = {
        userId: 'test-user-id',
        type: NotificationType.LEARNING_REMINDER,
        title: 'テスト通知',
        message: 'テストメッセージ',
        channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
        priority: NotificationPriority.NORMAL,
      }

      const result = await NotificationService.sendNotification(notificationData)

      expect(result.success).toBe(true)
      expect(result.results.length).toBe(2)
    })

    it('無効化されたチャネルは送信をスキップする', async () => {
      // ユーザーの通知設定でメール無効化
      await updateUserNotificationSettings('test-user-id', {
        email: { enabled: false },
      })

      const result = await NotificationService.sendNotification({
        userId: 'test-user-id',
        type: NotificationType.LEARNING_REMINDER,
        title: 'テスト通知',
        message: 'テストメッセージ',
        channels: [NotificationChannel.EMAIL],
        priority: NotificationPriority.NORMAL,
      })

      const emailResult = result.results.find((r) => r.channel === NotificationChannel.EMAIL)
      expect(emailResult?.success).toBe(false)
      expect(emailResult?.error).toContain('disabled')
    })
  })
})
```

### 単体テスト実行

```bash
# 全単体テスト実行
npm run test:unit

# カバレッジレポート生成
npm run test:coverage

# ウォッチモード
npm run test:watch

# 特定ファイルのテスト
npm run test -- UserService.test.ts
```

---

## 2. 統合テスト (Integration Tests)

### 2.1 APIエンドポイントテスト

```typescript
describe('tRPC API Integration', () => {
  let testClient: any

  beforeAll(async () => {
    // テストサーバー起動
    testClient = createTestTRPCClient()
  })

  describe('Authentication Flow', () => {
    it('ユーザー登録から認証までの完全フロー', async () => {
      // 1. ユーザー登録
      const signUpResult = await testClient.auth.signUp.mutate({
        name: 'テストユーザー',
        email: 'test@example.com',
        password: 'Password123!',
        agreeToTerms: true,
      })

      expect(signUpResult.user.id).toBeDefined()
      expect(signUpResult.user.email).toBe('test@example.com')

      // 2. メール確認
      const verificationToken = await getVerificationToken(signUpResult.user.id)
      await testClient.auth.verifyEmail.mutate({ token: verificationToken })

      // 3. ログイン
      const signInResult = await signIn('credentials', {
        email: 'test@example.com',
        password: 'Password123!',
      })

      expect(signInResult).toBeDefined()

      // 4. 認証済み情報取得
      const userInfo = await testClient.auth.me.query()
      expect(userInfo.email).toBe('test@example.com')
      expect(userInfo.emailVerified).not.toBeNull()
    })
  })

  describe('Learning Progress Flow', () => {
    it('学習セッション記録から進捗更新までの完全フロー', async () => {
      // 認証済みクライアント準備
      const authenticatedClient = await createAuthenticatedClient()

      // 1. 初期進捗取得
      const initialProgress = await authenticatedClient.learning.getProgress.query()
      const initialCompletionRate = initialProgress.stats.completionRate

      // 2. 学習セッション記録
      await authenticatedClient.learning.recordSession.mutate({
        processId: 'integration_test_process',
        processName: 'Integration Test Process',
        knowledgeArea: 'Integration',
        processGroup: 'Initiating',
        duration: 3600,
        completed: true,
      })

      // 3. 進捗更新確認
      const updatedProgress = await authenticatedClient.learning.getProgress.query()
      expect(updatedProgress.stats.completionRate).toBeGreaterThan(initialCompletionRate)
      expect(updatedProgress.completedProcesses).toContain('integration_test_process')

      // 4. 統計情報更新確認
      const stats = await authenticatedClient.learning.getStats.query({ period: 'month' })
      expect(stats.studyTime.total).toBeGreaterThan(0)
    })
  })

  describe('Subscription Flow', () => {
    it('サブスクリプション作成から課金までの完全フロー', async () => {
      const authenticatedClient = await createAuthenticatedClient()

      // 1. 初期サブスクリプション確認
      const initialSub = await authenticatedClient.payment.getSubscription.query()
      expect(initialSub.plan).toBe(SubscriptionPlan.FREE)

      // 2. 支払い方法追加（テスト用カード）
      const paymentMethod = await authenticatedClient.payment.addPaymentMethod.mutate({
        type: 'card',
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2025,
          cvc: '123',
        },
        billing_details: {
          name: 'Test User',
          email: 'test@example.com',
          address: {
            line1: '123 Test Street',
            city: 'Test City',
            postal_code: '12345',
            country: 'JP',
          },
        },
      })

      // 3. サブスクリプション作成
      const subResult = await authenticatedClient.payment.createSubscription.mutate({
        planId: SubscriptionPlan.BASIC,
        paymentMethodId: paymentMethod.paymentMethod.id,
      })

      expect(subResult.subscription.status).toBe('active')

      // 4. サブスクリプション情報更新確認
      const updatedSub = await authenticatedClient.payment.getSubscription.query()
      expect(updatedSub.plan).toBe(SubscriptionPlan.BASIC)
      expect(updatedSub.billing.amount).toBe(2980)
    })
  })
})
```

### 2.2 データベース統合テスト

```typescript
describe('Database Integration', () => {
  beforeEach(async () => {
    // テストデータベースクリーンアップ
    await cleanTestDatabase()
  })

  it('複雑なクエリの実行とパフォーマンス', async () => {
    // テストデータ作成
    const users = await createTestUsers(100)
    const sessions = await createTestStudySessions(users, 500)

    // 複雑な集計クエリ実行
    const startTime = Date.now()
    const analytics = await prisma.studySession.groupBy({
      by: ['knowledgeArea'],
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      _sum: { duration: true },
      _count: { id: true },
      _avg: { duration: true },
    })
    const queryTime = Date.now() - startTime

    expect(analytics.length).toBeGreaterThan(0)
    expect(queryTime).toBeLessThan(1000) // 1秒以内
  })

  it('トランザクション処理の正常性', async () => {
    const user = await createTestUser()

    // 複数テーブルを跨ぐトランザクション
    const result = await prisma.$transaction(async (tx) => {
      const session = await tx.studySession.create({
        data: {
          userId: user.id,
          processId: 'transaction_test',
          processName: 'Transaction Test',
          knowledgeArea: 'Integration',
          processGroup: 'Initiating',
          duration: 1800,
          completed: true,
        },
      })

      const updatedProgress = await tx.learningProgress.update({
        where: { userId: user.id },
        data: {
          totalStudyTime: { increment: 1800 },
          completedProcesses: { push: 'transaction_test' },
        },
      })

      return { session, updatedProgress }
    })

    expect(result.session.id).toBeDefined()
    expect(result.updatedProgress.totalStudyTime).toBe(1800)
  })
})
```

### 2.3 外部サービス統合テスト

```typescript
describe('External Services Integration', () => {
  describe('Stripe Integration', () => {
    it('Stripe WebHookの処理', async () => {
      const webhookPayload = createStripeWebhookPayload('customer.subscription.created')

      const response = await fetch('/api/webhook/stripe', {
        method: 'POST',
        headers: {
          'stripe-signature': generateStripeSignature(webhookPayload),
        },
        body: webhookPayload,
      })

      expect(response.status).toBe(200)

      // データベース更新確認
      const subscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: 'sub_test123' },
      })
      expect(subscription).not.toBeNull()
    })
  })

  describe('Email Service Integration', () => {
    it('メール送信の実際のテスト', async () => {
      const result = await EmailService.sendEmail({
        to: 'test@mailhog.local', // MailHogテスト用
        subject: '統合テスト',
        template: 'test',
        data: { name: 'テストユーザー' },
      })

      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
    })
  })
})
```

---

## 3. E2E テスト (End-to-End Tests)

### 3.1 Playwrightを使用したE2Eテスト

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('ユーザー登録からログインまでの完全フロー', async ({ page }) => {
    // 1. ホームページアクセス
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('PMP Learning Management')

    // 2. サインアップページへ
    await page.click('text=登録')
    await expect(page).toHaveURL('/auth/signup')

    // 3. ユーザー登録
    await page.fill('[name="name"]', 'E2Eテストユーザー')
    await page.fill('[name="email"]', `e2e-test-${Date.now()}@example.com`)
    await page.fill('[name="password"]', 'Password123!')
    await page.check('[name="agreeToTerms"]')
    await page.click('button[type="submit"]')

    // 4. 成功メッセージ確認
    await expect(page.locator('.success-message')).toContainText('登録が完了しました')

    // 5. メール確認（テスト環境では自動確認）
    await page.goto('/auth/verify-email?token=test-token')

    // 6. ログインページへ
    await page.goto('/auth/signin')
    await page.fill('[name="email"]', `e2e-test-${Date.now()}@example.com`)
    await page.fill('[name="password"]', 'Password123!')
    await page.click('button[type="submit"]')

    // 7. ダッシュボードにリダイレクト
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('.welcome-message')).toContainText('E2Eテストユーザー')
  })
})
```

### 3.2 学習機能E2Eテスト

```typescript
// tests/e2e/learning.spec.ts
test.describe('Learning Features', () => {
  test.beforeEach(async ({ page }) => {
    // テストユーザーでログイン
    await loginAsTestUser(page)
  })

  test('学習セッションの記録フロー', async ({ page }) => {
    // 1. 学習ページアクセス
    await page.goto('/learning')

    // 2. プロセス選択
    await page.click('[data-testid="process-integration-1"]')

    // 3. 学習セッション開始
    await page.click('button:has-text("学習開始")')
    await expect(page.locator('.timer')).toBeVisible()

    // 4. 学習内容確認
    await expect(page.locator('.process-content')).toContainText('プロジェクト憲章作成')

    // 5. 学習完了
    await page.click('button:has-text("完了")')

    // 6. 進捗更新確認
    await page.goto('/progress')
    await expect(page.locator('.completion-rate')).not.toContainText('0%')
  })

  test('模擬試験受験フロー', async ({ page }) => {
    // 1. 模擬試験ページアクセス
    await page.goto('/exam')

    // 2. 試験開始
    await page.click('button:has-text("模擬試験開始")')
    await expect(page.locator('.question-counter')).toContainText('1 / 180')

    // 3. 問題回答（最初の5問のみ）
    for (let i = 0; i < 5; i++) {
      await page.click('.answer-option:first-child')
      await page.click('button:has-text("次の問題")')
    }

    // 4. 試験終了
    await page.click('button:has-text("試験終了")')

    // 5. 結果ページ確認
    await expect(page).toHaveURL(/\/exam\/results/)
    await expect(page.locator('.score')).toBeVisible()
    await expect(page.locator('.knowledge-area-breakdown')).toBeVisible()
  })
})
```

### 3.3 レスポンシブデザインテスト

```typescript
test.describe('Responsive Design', () => {
  const devices = ['Desktop', 'iPhone 12', 'iPad']

  devices.forEach((deviceName) => {
    test(`${deviceName}での表示確認`, async ({ page, browser }) => {
      // デバイス設定
      const device = playwright.devices[deviceName]
      const context = await browser.newContext(device)
      const responsivePage = await context.newPage()

      await loginAsTestUser(responsivePage)

      // 主要ページのレスポンシブ確認
      const pages = ['/dashboard', '/learning', '/progress', '/exam']

      for (const pagePath of pages) {
        await responsivePage.goto(pagePath)

        // レイアウト崩れチェック
        const overflowElements = await responsivePage.locator('*').evaluateAll((elements) =>
          elements.filter((el) => {
            const rect = el.getBoundingClientRect()
            return rect.width > window.innerWidth
          })
        )

        expect(overflowElements.length).toBe(0)

        // 基本UI要素の表示確認
        await expect(responsivePage.locator('nav')).toBeVisible()
        await expect(responsivePage.locator('main')).toBeVisible()
      }
    })
  })
})
```

### 3.4 パフォーマンステスト

```typescript
test.describe('Performance Tests', () => {
  test('ページ読み込み速度テスト', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000) // 3秒以内

    // Core Web Vitals測定
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          resolve(
            entries.map((entry) => ({
              name: entry.name,
              value: entry.value,
            }))
          )
        }).observe({ entryTypes: ['measure', 'navigation'] })
      })
    })

    console.log('Performance metrics:', metrics)
  })

  test('大量データ処理のパフォーマンス', async ({ page }) => {
    // 大量の学習データを持つテストユーザーでログイン
    await loginAsUserWithLargeDataset(page)

    const startTime = Date.now()
    await page.goto('/progress')
    await page.waitForSelector('.progress-chart')
    const renderTime = Date.now() - startTime

    expect(renderTime).toBeLessThan(5000) // 5秒以内
  })
})
```

---

## 4. パフォーマンステスト

### 4.1 負荷テスト

```bash
# Artillery.jsを使用した負荷テスト
# artillery.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100

scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/api/trpc/auth.me"
          headers:
            Authorization: "Bearer {{ token }}"
      - post:
          url: "/api/trpc/learning.recordSession"
          json:
            processId: "load_test_process"
            duration: 1800
            completed: true
```

実行コマンド:

```bash
npm run test:load
```

### 4.2 ストレステスト

```javascript
// k6を使用したストレステスト
import http from 'k6/http'
import { check, sleep } from 'k6'

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 300 },
    { duration: '5m', target: 300 },
    { duration: '10m', target: 0 },
  ],
}

export default function () {
  let response = http.get('http://localhost:3000/api/health')
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  })
  sleep(1)
}
```

---

## 5. セキュリティテスト

### 5.1 OWASP Top 10テスト

```typescript
describe('Security Tests', () => {
  describe('Authentication Security', () => {
    it('SQLインジェクション攻撃を防ぐ', async () => {
      const maliciousInput = "'; DROP TABLE users; --"

      const response = await fetch('/api/trpc/auth.signUp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: maliciousInput,
          email: 'test@example.com',
          password: 'Password123!',
          agreeToTerms: true,
        }),
      })

      // リクエストが適切に処理され、DBが破損していないことを確認
      expect(response.status).toBeLessThan(500)

      const userCount = await prisma.user.count()
      expect(userCount).toBeGreaterThan(0) // テーブルが削除されていない
    })

    it('XSS攻撃を防ぐ', async () => {
      const xssScript = '<script>alert("xss")</script>'

      const result = await testClient.user.updateProfile.mutate({
        name: xssScript,
        bio: xssScript,
      })

      // スクリプトタグがサニタイズされていることを確認
      expect(result.user.name).not.toContain('<script>')
      expect(result.user.bio).not.toContain('<script>')
    })

    it('CSRFトークン検証', async () => {
      const response = await fetch('/api/trpc/user.updateProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // CSRFトークンなしでリクエスト
        body: JSON.stringify({
          name: 'Updated Name',
        }),
      })

      expect(response.status).toBe(403)
    })
  })

  describe('Authorization Security', () => {
    it('権限のないエンドポイントへのアクセスを拒否', async () => {
      const userClient = await createClientForRole(UserRole.USER)

      // 管理者専用エンドポイントへのアクセス試行
      await expect(userClient.admin.getSystemHealth.query()).rejects.toThrow('Forbidden')
    })

    it('他ユーザーのデータへの不正アクセスを防ぐ', async () => {
      const user1Client = await createAuthenticatedClient('user1')
      const user2Id = 'different-user-id'

      await expect(user1Client.user.getById.query({ id: user2Id })).rejects.toThrow('Forbidden')
    })
  })
})
```

### 5.2 ペネトレーションテスト

```bash
# OWASP ZAPを使用した自動化セキュリティスキャン
npm run security:scan

# Nucleiを使用した脆弱性スキャン
nuclei -target http://localhost:3000 -templates nuclei-templates/
```

---

## 6. アクセシビリティテスト

### 6.1 WCAG準拠テスト

```typescript
import { injectAxe, checkA11y } from 'axe-playwright'

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await injectAxe(page)
  })

  test('ダッシュボードのアクセシビリティチェック', async ({ page }) => {
    await loginAsTestUser(page)
    await page.goto('/dashboard')

    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    })
  })

  test('キーボードナビゲーション', async ({ page }) => {
    await page.goto('/')

    // Tabキーでのナビゲーション
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()

    // Enterキーでのアクション
    await page.keyboard.press('Enter')
    // 期待される動作を確認
  })

  test('スクリーンリーダー対応', async ({ page }) => {
    await loginAsTestUser(page)
    await page.goto('/learning')

    // ARIAラベルの確認
    await expect(page.locator('[aria-label]')).toBeVisible()

    // セマンティックHTMLの使用確認
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('h1')).toBeVisible()
  })
})
```

---

## 7. クラウドインフラテスト

### 7.1 Infrastructure as Code テスト

```typescript
// Terraformテストファイル
describe('Infrastructure Tests', () => {
  it('RDSインスタンスが適切に設定されている', async () => {
    const terraform = new TerraformRunner('./infrastructure')
    const plan = await terraform.plan()

    expect(plan.changes.filter((c) => c.type === 'aws_db_instance')).toHaveLength(1)

    const rdsConfig = plan.configuration.root_module.resources.find(
      (r) => r.type === 'aws_db_instance'
    )

    expect(rdsConfig.expressions.engine.constant_value).toBe('postgres')
    expect(rdsConfig.expressions.multi_az.constant_value).toBe(true)
  })

  it('セキュリティグループが適切に設定されている', async () => {
    const securityGroups = await aws.ec2.describeSecurityGroups({
      GroupNames: ['pmp-learning-sg'],
    })

    const sg = securityGroups.SecurityGroups[0]
    const httpsRule = sg.IpPermissions.find((rule) => rule.FromPort === 443)

    expect(httpsRule).toBeDefined()
    expect(httpsRule.IpRanges[0].CidrIp).toBe('0.0.0.0/0')
  })
})
```

### 7.2 監視・アラート設定テスト

```typescript
describe('Monitoring Tests', () => {
  it('アプリケーションメトリクスが正常に収集される', async () => {
    // Prometheusメトリクスエンドポイントテスト
    const response = await fetch('/api/metrics')
    const metrics = await response.text()

    expect(metrics).toContain('http_requests_total')
    expect(metrics).toContain('db_query_duration_seconds')
    expect(metrics).toContain('active_users_total')
  })

  it('ヘルスチェックが正常に動作する', async () => {
    const healthResponse = await fetch('/api/health')
    const health = await healthResponse.json()

    expect(health.status).toMatch(/healthy|degraded/)
    expect(health.checks.database.status).toBe('healthy')
    expect(health.checks.redis.status).toMatch(/healthy|not_configured/)
  })
})
```

---

## 8. テスト環境・設定

### 8.1 テスト環境構成

```yaml
# docker-compose.test.yml
version: '3.8'
services:
  postgres-test:
    image: postgres:15
    environment:
      POSTGRES_DB: pmp_test
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
    ports:
      - '5433:5432'

  redis-test:
    image: redis:7-alpine
    ports:
      - '6380:6379'

  mailhog:
    image: mailhog/mailhog
    ports:
      - '1025:1025'
      - '8025:8025'
```

### 8.2 テスト設定ファイル

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: ['**/__tests__/**/*.(ts|js)', '**/*.(test|spec).(ts|js)'],
  collectCoverageFrom: ['src/**/*.(ts|js)', '!src/**/*.d.ts', '!src/test/**/*'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}
```

```typescript
// tests/setup.ts
import { beforeAll, afterAll, beforeEach } from '@jest/globals'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

beforeAll(async () => {
  // テストデータベースセットアップ
  await execAsync('npm run db:test:reset')

  // テストサーバー起動
  process.env.NODE_ENV = 'test'
  process.env.DATABASE_URL = 'postgresql://test_user:test_password@localhost:5433/pmp_test'
})

beforeEach(async () => {
  // テストデータリセット
  await cleanTestDatabase()
})

afterAll(async () => {
  // クリーンアップ
  await execAsync('npm run db:test:cleanup')
})
```

---

## 9. CI/CDパイプラインでのテスト実行

### 9.1 GitHub Actions設定

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: pmp_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run db:test:deploy
      - run: npm run test:unit
      - run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e

  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm audit
      - run: npm run security:scan
```

---

## 10. テスト実行コマンド

### 10.1 NPMスクリプト

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "test:load": "artillery run artillery.yml",
    "test:security": "npm audit && snyk test",
    "test:accessibility": "playwright test --project=accessibility"
  }
}
```

### 10.2 テスト実行手順

```bash
# 1. 依存関係インストール
npm install

# 2. テストデータベースセットアップ
npm run db:test:reset

# 3. 全テスト実行
npm run test

# 4. カバレッジレポート確認
npm run test:coverage
open coverage/lcov-report/index.html

# 5. E2Eテスト実行
npm run test:e2e

# 6. セキュリティテスト実行
npm run test:security
```

---

## 11. 品質メトリクス・レポート

### 11.1 コードカバレッジ目標

- **全体カバレッジ**: 80%以上
- **ブランチカバレッジ**: 75%以上
- **関数カバレッジ**: 85%以上
- **行カバレッジ**: 80%以上

### 11.2 パフォーマンス目標

- **API レスポンス時間**: p95 < 200ms
- **ページロード時間**: p95 < 3秒
- **データベースクエリ**: p95 < 100ms
- **メモリ使用量**: < 512MB

### 11.3 品質ゲート

以下の条件をすべて満たした場合のみ、本番デプロイを許可：

1. ✅ 全単体テスト成功
2. ✅ 全統合テスト成功
3. ✅ 全E2Eテスト成功
4. ✅ セキュリティスキャン成功
5. ✅ コードカバレッジ > 80%
6. ✅ パフォーマンステスト合格
7. ✅ アクセシビリティテスト合格

---

この包括的なテスト計画により、PMPLearningManagement システムの
品質と信頼性を確保し、ユーザーに安定したサービスを提供します。
