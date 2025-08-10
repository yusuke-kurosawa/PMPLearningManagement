import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRequest, createResponse } from 'node-mocks-http'
import { stripeWebhookHandler } from '@/server/webhooks/stripe'
import { subscriptionService } from '@/server/services/subscriptionService'
import { emailService } from '@/server/services/emailService'
import { prisma } from '@/tests/setup/globalSetup'
import { faker } from '@faker-js/faker'
import Stripe from 'stripe'

/**
 * Stripe Webhooks・外部API統合テスト
 * 担当：統合・外部APIチーム（1名）
 *
 * テストカバレッジ：
 * - Stripeウェブフックイベント処理
 * - 決済フロー統合
 * - サブスクリプション管理
 * - エラーハンドリング・リトライ
 * - セキュリティ検証
 */

describe('Stripe Webhooks - Event Processing', () => {
  let testCustomer: any
  let mockStripe: any

  beforeEach(async () => {
    // テスト用顧客データ
    testCustomer = await prisma.user.create({
      data: {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        role: 'USER',
        stripeCustomerId: 'cus_test_123',
      },
    })

    // Stripe モック
    mockStripe = {
      webhooks: {
        constructEvent: vi.fn(),
      },
      customers: {
        retrieve: vi.fn(),
        update: vi.fn(),
      },
      subscriptions: {
        retrieve: vi.fn(),
        update: vi.fn(),
        cancel: vi.fn(),
      },
      invoices: {
        retrieve: vi.fn(),
        pay: vi.fn(),
      },
    }

    vi.mocked(subscriptionService.getStripeClient).mockReturnValue(mockStripe)
  })

  describe('Customer Events', () => {
    it('should handle customer.created webhook', async () => {
      const customerCreatedEvent = {
        id: 'evt_test_123',
        object: 'event',
        type: 'customer.created',
        data: {
          object: {
            id: 'cus_new_123',
            email: 'new-customer@example.com',
            name: 'New Customer',
            metadata: {
              userId: testCustomer.id,
            },
          },
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(customerCreatedEvent)

      const req = createRequest({
        method: 'POST',
        body: JSON.stringify(customerCreatedEvent),
        headers: {
          'stripe-signature': 'test-signature',
        },
      })
      const res = createResponse()

      await stripeWebhookHandler(req, res)

      expect(res.statusCode).toBe(200)

      // ユーザーのStripe顧客IDが更新される
      const updatedUser = await prisma.user.findUnique({
        where: { id: testCustomer.id },
      })
      expect(updatedUser?.stripeCustomerId).toBe('cus_new_123')
    })

    it('should handle customer.updated webhook', async () => {
      const customerUpdatedEvent = {
        id: 'evt_test_124',
        object: 'event',
        type: 'customer.updated',
        data: {
          object: {
            id: 'cus_test_123',
            email: 'updated-email@example.com',
            name: 'Updated Name',
            metadata: {
              userId: testCustomer.id,
            },
          },
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(customerUpdatedEvent)

      const req = createRequest({
        method: 'POST',
        body: JSON.stringify(customerUpdatedEvent),
        headers: {
          'stripe-signature': 'test-signature',
        },
      })
      const res = createResponse()

      await stripeWebhookHandler(req, res)

      expect(res.statusCode).toBe(200)

      // ユーザー情報が同期される
      const updatedUser = await prisma.user.findUnique({
        where: { id: testCustomer.id },
      })
      expect(updatedUser?.email).toBe('updated-email@example.com')
      expect(updatedUser?.name).toBe('Updated Name')
    })

    it('should handle customer.deleted webhook', async () => {
      const customerDeletedEvent = {
        id: 'evt_test_125',
        object: 'event',
        type: 'customer.deleted',
        data: {
          object: {
            id: 'cus_test_123',
            deleted: true,
            metadata: {
              userId: testCustomer.id,
            },
          },
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(customerDeletedEvent)

      const req = createRequest({
        method: 'POST',
        body: JSON.stringify(customerDeletedEvent),
        headers: {
          'stripe-signature': 'test-signature',
        },
      })
      const res = createResponse()

      await stripeWebhookHandler(req, res)

      expect(res.statusCode).toBe(200)

      // ユーザーのStripe顧客IDがクリアされる
      const updatedUser = await prisma.user.findUnique({
        where: { id: testCustomer.id },
      })
      expect(updatedUser?.stripeCustomerId).toBeNull()
    })
  })

  describe('Subscription Events', () => {
    let testSubscription: any

    beforeEach(async () => {
      testSubscription = await prisma.subscription.create({
        data: {
          userId: testCustomer.id,
          stripeCustomerId: 'cus_test_123',
          stripeSubscriptionId: 'sub_test_123',
          status: 'ACTIVE',
          plan: 'PREMIUM',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })
    })

    it('should handle customer.subscription.created webhook', async () => {
      const subscriptionCreatedEvent = {
        id: 'evt_test_200',
        object: 'event',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_new_123',
            customer: 'cus_test_123',
            status: 'active',
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
            items: {
              data: [
                {
                  price: {
                    id: 'price_premium',
                    metadata: { plan: 'PREMIUM' },
                  },
                },
              ],
            },
          },
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(subscriptionCreatedEvent)

      const req = createRequest({
        method: 'POST',
        body: JSON.stringify(subscriptionCreatedEvent),
        headers: {
          'stripe-signature': 'test-signature',
        },
      })
      const res = createResponse()

      await stripeWebhookHandler(req, res)

      expect(res.statusCode).toBe(200)

      // 新しいサブスクリプションが作成される
      const newSubscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: 'sub_new_123' },
      })
      expect(newSubscription).toBeTruthy()
      expect(newSubscription?.status).toBe('ACTIVE')
      expect(newSubscription?.plan).toBe('PREMIUM')

      // ウェルカムメールが送信される
      expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(
        testCustomer.email,
        expect.any(Object)
      )
    })

    it('should handle customer.subscription.updated webhook', async () => {
      const subscriptionUpdatedEvent = {
        id: 'evt_test_201',
        object: 'event',
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'past_due',
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
            items: {
              data: [
                {
                  price: {
                    id: 'price_premium',
                    metadata: { plan: 'PREMIUM' },
                  },
                },
              ],
            },
          },
          previous_attributes: {
            status: 'active',
          },
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(subscriptionUpdatedEvent)

      const req = createRequest({
        method: 'POST',
        body: JSON.stringify(subscriptionUpdatedEvent),
        headers: {
          'stripe-signature': 'test-signature',
        },
      })
      const res = createResponse()

      await stripeWebhookHandler(req, res)

      expect(res.statusCode).toBe(200)

      // サブスクリプション状態が更新される
      const updatedSubscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: 'sub_test_123' },
      })
      expect(updatedSubscription?.status).toBe('PAST_DUE')

      // 支払い問題の通知メールが送信される
      expect(emailService.sendPaymentIssueNotification).toHaveBeenCalledWith(
        testCustomer.email,
        expect.any(Object)
      )
    })

    it('should handle customer.subscription.deleted webhook', async () => {
      const subscriptionDeletedEvent = {
        id: 'evt_test_202',
        object: 'event',
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'canceled',
            canceled_at: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000),
          },
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(subscriptionDeletedEvent)

      const req = createRequest({
        method: 'POST',
        body: JSON.stringify(subscriptionDeletedEvent),
        headers: {
          'stripe-signature': 'test-signature',
        },
      })
      const res = createResponse()

      await stripeWebhookHandler(req, res)

      expect(res.statusCode).toBe(200)

      // サブスクリプションが無効化される
      const canceledSubscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: 'sub_test_123' },
      })
      expect(canceledSubscription?.status).toBe('CANCELED')

      // キャンセル確認メールが送信される
      expect(emailService.sendCancellationConfirmation).toHaveBeenCalledWith(
        testCustomer.email,
        expect.any(Object)
      )

      // ユーザーがFREEプランにダウングレードされる
      const updatedUser = await prisma.user.findUnique({
        where: { id: testCustomer.id },
      })
      expect(updatedUser?.subscription).toBe('FREE')
    })

    it('should handle subscription plan changes', async () => {
      const planChangeEvent = {
        id: 'evt_test_203',
        object: 'event',
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'active',
            items: {
              data: [
                {
                  price: {
                    id: 'price_enterprise',
                    metadata: { plan: 'ENTERPRISE' },
                  },
                },
              ],
            },
          },
          previous_attributes: {
            items: {
              data: [
                {
                  price: {
                    id: 'price_premium',
                    metadata: { plan: 'PREMIUM' },
                  },
                },
              ],
            },
          },
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(planChangeEvent)

      const req = createRequest({
        method: 'POST',
        body: JSON.stringify(planChangeEvent),
        headers: {
          'stripe-signature': 'test-signature',
        },
      })
      const res = createResponse()

      await stripeWebhookHandler(req, res)

      expect(res.statusCode).toBe(200)

      // プラン変更が反映される
      const updatedSubscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: 'sub_test_123' },
      })
      expect(updatedSubscription?.plan).toBe('ENTERPRISE')

      // ユーザーのサブスクリプションレベルも更新される
      const updatedUser = await prisma.user.findUnique({
        where: { id: testCustomer.id },
      })
      expect(updatedUser?.subscription).toBe('ENTERPRISE')

      // プラン変更通知メールが送信される
      expect(emailService.sendPlanChangeNotification).toHaveBeenCalledWith(
        testCustomer.email,
        expect.objectContaining({
          oldPlan: 'PREMIUM',
          newPlan: 'ENTERPRISE',
        })
      )
    })
  })

  describe('Invoice Events', () => {
    it('should handle invoice.payment_succeeded webhook', async () => {
      await prisma.subscription.create({
        data: {
          userId: testCustomer.id,
          stripeCustomerId: 'cus_test_123',
          stripeSubscriptionId: 'sub_test_123',
          status: 'ACTIVE',
          plan: 'PREMIUM',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })

      const invoicePaymentSucceededEvent = {
        id: 'evt_test_300',
        object: 'event',
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            id: 'in_test_123',
            customer: 'cus_test_123',
            subscription: 'sub_test_123',
            amount_paid: 2999,
            currency: 'jpy',
            status: 'paid',
            hosted_invoice_url: 'https://invoice.stripe.com/i/test',
            invoice_pdf: 'https://pay.stripe.com/invoice/test/pdf',
          },
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(invoicePaymentSucceededEvent)

      const req = createRequest({
        method: 'POST',
        body: JSON.stringify(invoicePaymentSucceededEvent),
        headers: {
          'stripe-signature': 'test-signature',
        },
      })
      const res = createResponse()

      await stripeWebhookHandler(req, res)

      expect(res.statusCode).toBe(200)

      // 支払い記録が作成される
      const paymentRecord = await prisma.payment.findFirst({
        where: { stripeInvoiceId: 'in_test_123' },
      })
      expect(paymentRecord).toBeTruthy()
      expect(paymentRecord?.amount).toBe(2999)
      expect(paymentRecord?.status).toBe('SUCCEEDED')

      // 領収書メールが送信される
      expect(emailService.sendReceiptEmail).toHaveBeenCalledWith(
        testCustomer.email,
        expect.objectContaining({
          amount: 2999,
          currency: 'jpy',
          invoiceUrl: 'https://invoice.stripe.com/i/test',
        })
      )
    })

    it('should handle invoice.payment_failed webhook', async () => {
      const invoicePaymentFailedEvent = {
        id: 'evt_test_301',
        object: 'event',
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'in_test_124',
            customer: 'cus_test_123',
            subscription: 'sub_test_123',
            amount_due: 2999,
            currency: 'jpy',
            status: 'open',
            attempt_count: 1,
            next_payment_attempt: Math.floor((Date.now() + 3 * 24 * 60 * 60 * 1000) / 1000),
          },
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(invoicePaymentFailedEvent)

      const req = createRequest({
        method: 'POST',
        body: JSON.stringify(invoicePaymentFailedEvent),
        headers: {
          'stripe-signature': 'test-signature',
        },
      })
      const res = createResponse()

      await stripeWebhookHandler(req, res)

      expect(res.statusCode).toBe(200)

      // 失敗した支払い記録が作成される
      const failedPayment = await prisma.payment.findFirst({
        where: { stripeInvoiceId: 'in_test_124' },
      })
      expect(failedPayment).toBeTruthy()
      expect(failedPayment?.status).toBe('FAILED')

      // 支払い失敗通知メールが送信される
      expect(emailService.sendPaymentFailedNotification).toHaveBeenCalledWith(
        testCustomer.email,
        expect.objectContaining({
          amount: 2999,
          nextRetryDate: expect.any(Date),
        })
      )
    })

    it('should handle dunning management for failed payments', async () => {
      const multipleFailureEvent = {
        id: 'evt_test_302',
        object: 'event',
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'in_test_125',
            customer: 'cus_test_123',
            subscription: 'sub_test_123',
            amount_due: 2999,
            attempt_count: 3, // 3回目の失敗
            next_payment_attempt: null, // これ以上のリトライなし
          },
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(multipleFailureEvent)

      const req = createRequest({
        method: 'POST',
        body: JSON.stringify(multipleFailureEvent),
        headers: {
          'stripe-signature': 'test-signature',
        },
      })
      const res = createResponse()

      await stripeWebhookHandler(req, res)

      expect(res.statusCode).toBe(200)

      // サブスクリプションが一時停止される
      const suspendedSubscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: 'sub_test_123' },
      })
      expect(suspendedSubscription?.status).toBe('PAST_DUE')

      // 最終警告メールが送信される
      expect(emailService.sendFinalPaymentWarning).toHaveBeenCalledWith(
        testCustomer.email,
        expect.any(Object)
      )
    })
  })

  describe('Webhook Security and Validation', () => {
    it('should verify webhook signature', async () => {
      const invalidSignatureError = new Error('Invalid signature')
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw invalidSignatureError
      })

      const req = createRequest({
        method: 'POST',
        body: JSON.stringify({ type: 'customer.created' }),
        headers: {
          'stripe-signature': 'invalid-signature',
        },
      })
      const res = createResponse()

      await stripeWebhookHandler(req, res)

      expect(res.statusCode).toBe(400)
      expect(res._getJSONData()).toEqual({
        error: 'Webhook signature verification failed',
      })
    })

    it('should handle missing webhook signature', async () => {
      const req = createRequest({
        method: 'POST',
        body: JSON.stringify({ type: 'customer.created' }),
        // stripe-signature ヘッダーなし
      })
      const res = createResponse()

      await stripeWebhookHandler(req, res)

      expect(res.statusCode).toBe(400)
      expect(res._getJSONData()).toEqual({
        error: 'Missing stripe-signature header',
      })
    })

    it('should handle duplicate webhook events', async () => {
      const duplicateEvent = {
        id: 'evt_duplicate_123',
        object: 'event',
        type: 'customer.created',
        data: {
          object: {
            id: 'cus_duplicate_123',
            email: 'duplicate@example.com',
          },
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
      }

      // 既に処理済みのイベントIDを記録
      await prisma.webhookEvent.create({
        data: {
          stripeEventId: 'evt_duplicate_123',
          eventType: 'customer.created',
          processed: true,
          processedAt: new Date(),
        },
      })

      mockStripe.webhooks.constructEvent.mockReturnValue(duplicateEvent)

      const req = createRequest({
        method: 'POST',
        body: JSON.stringify(duplicateEvent),
        headers: {
          'stripe-signature': 'test-signature',
        },
      })
      const res = createResponse()

      await stripeWebhookHandler(req, res)

      expect(res.statusCode).toBe(200)
      expect(res._getJSONData()).toEqual({
        message: 'Event already processed',
      })

      // 重複処理されていない
      expect(emailService.sendWelcomeEmail).not.toHaveBeenCalled()
    })

    it('should enforce webhook endpoint rate limiting', async () => {
      const rateLimitSpy = vi.spyOn(require('@/server/middleware/rateLimit'), 'webhookRateLimit')

      // 大量のリクエストをシミュレート
      const requests = Array.from({ length: 50 }, (_, i) => {
        const event = {
          id: `evt_rate_limit_${i}`,
          object: 'event',
          type: 'customer.updated',
          data: { object: { id: 'cus_test_123' } },
          created: Math.floor(Date.now() / 1000),
          livemode: false,
        }

        mockStripe.webhooks.constructEvent.mockReturnValue(event)

        return createRequest({
          method: 'POST',
          body: JSON.stringify(event),
          headers: {
            'stripe-signature': 'test-signature',
            'x-forwarded-for': '192.168.1.100', // 同じIPから
          },
        })
      })

      // 最初のいくつかは成功
      for (let i = 0; i < 10; i++) {
        const res = createResponse()
        await stripeWebhookHandler(requests[i], res)
        expect(res.statusCode).toBe(200)
      }

      // その後はレート制限される
      const rateLimitedRes = createResponse()
      await stripeWebhookHandler(requests[10], rateLimitedRes)
      expect(rateLimitedRes.statusCode).toBe(429)
    })
  })

  describe('Error Handling and Resilience', () => {
    it('should handle database errors gracefully', async () => {
      const customerCreatedEvent = {
        id: 'evt_db_error_123',
        object: 'event',
        type: 'customer.created',
        data: {
          object: {
            id: 'cus_db_error_123',
            email: 'db-error@example.com',
          },
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(customerCreatedEvent)

      // データベースエラーをシミュレート
      const originalCreate = prisma.user.create
      prisma.user.create = vi.fn().mockRejectedValue(new Error('Database connection failed'))

      const req = createRequest({
        method: 'POST',
        body: JSON.stringify(customerCreatedEvent),
        headers: {
          'stripe-signature': 'test-signature',
        },
      })
      const res = createResponse()

      await stripeWebhookHandler(req, res)

      expect(res.statusCode).toBe(500)
      expect(res._getJSONData()).toEqual({
        error: 'Internal server error',
        eventId: 'evt_db_error_123',
      })

      // イベントがリトライキューに追加される
      const retryRecord = await prisma.webhookRetry.findFirst({
        where: { eventId: 'evt_db_error_123' },
      })
      expect(retryRecord).toBeTruthy()
      expect(retryRecord?.retryCount).toBe(0)
      expect(retryRecord?.nextRetry).toBeInstanceOf(Date)

      prisma.user.create = originalCreate
    })

    it('should implement exponential backoff for retries', async () => {
      const failingEvent = {
        id: 'evt_retry_123',
        object: 'event',
        type: 'customer.created',
        data: { object: { id: 'cus_retry_123' } },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
      }

      // 既存のリトライ記録
      await prisma.webhookRetry.create({
        data: {
          eventId: 'evt_retry_123',
          retryCount: 2,
          lastError: 'Previous error',
          nextRetry: new Date(Date.now() - 1000), // 過去の時間（リトライ可能）
        },
      })

      mockStripe.webhooks.constructEvent.mockReturnValue(failingEvent)
      prisma.user.create = vi.fn().mockRejectedValue(new Error('Still failing'))

      const req = createRequest({
        method: 'POST',
        body: JSON.stringify(failingEvent),
        headers: {
          'stripe-signature': 'test-signature',
        },
      })
      const res = createResponse()

      await stripeWebhookHandler(req, res)

      expect(res.statusCode).toBe(500)

      // リトライカウントが増加し、次回リトライ時間が指数的に増加
      const updatedRetry = await prisma.webhookRetry.findFirst({
        where: { eventId: 'evt_retry_123' },
      })
      expect(updatedRetry?.retryCount).toBe(3)

      // 指数バックオフ: 2^3 * 60 = 480秒後
      const expectedNextRetry = new Date(Date.now() + 480 * 1000)
      const actualNextRetry = updatedRetry?.nextRetry
      const timeDiff = Math.abs(actualNextRetry!.getTime() - expectedNextRetry.getTime())
      expect(timeDiff).toBeLessThan(5000) // 5秒の誤差範囲内
    })

    it('should handle unknown webhook event types', async () => {
      const unknownEvent = {
        id: 'evt_unknown_123',
        object: 'event',
        type: 'unknown.event.type',
        data: { object: { id: 'obj_unknown_123' } },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(unknownEvent)

      const req = createRequest({
        method: 'POST',
        body: JSON.stringify(unknownEvent),
        headers: {
          'stripe-signature': 'test-signature',
        },
      })
      const res = createResponse()

      await stripeWebhookHandler(req, res)

      expect(res.statusCode).toBe(200)
      expect(res._getJSONData()).toEqual({
        message: 'Event type not handled',
        eventType: 'unknown.event.type',
      })

      // 未知のイベントがログに記録される
      const loggedEvent = await prisma.webhookEvent.findFirst({
        where: { stripeEventId: 'evt_unknown_123' },
      })
      expect(loggedEvent?.eventType).toBe('unknown.event.type')
      expect(loggedEvent?.processed).toBe(false)
    })

    it('should handle partial failures in complex events', async () => {
      const complexEvent = {
        id: 'evt_complex_123',
        object: 'event',
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_complex_123',
            customer: 'cus_test_123',
            status: 'active',
          },
        },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(complexEvent)

      // メール送信のみ失敗
      vi.mocked(emailService.sendPlanChangeNotification).mockRejectedValue(
        new Error('Email service unavailable')
      )

      const req = createRequest({
        method: 'POST',
        body: JSON.stringify(complexEvent),
        headers: {
          'stripe-signature': 'test-signature',
        },
      })
      const res = createResponse()

      await stripeWebhookHandler(req, res)

      // 主要な処理は成功（200）
      expect(res.statusCode).toBe(200)

      // 失敗した部分のリトライが記録される
      const retryRecord = await prisma.webhookRetry.findFirst({
        where: {
          eventId: 'evt_complex_123',
          operation: 'email_notification',
        },
      })
      expect(retryRecord).toBeTruthy()
    })

    it('should handle webhook timeout scenarios', async () => {
      const timeoutEvent = {
        id: 'evt_timeout_123',
        object: 'event',
        type: 'customer.created',
        data: { object: { id: 'cus_timeout_123' } },
        created: Math.floor(Date.now() / 1000),
        livemode: false,
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(timeoutEvent)

      // 長時間実行される処理をシミュレート
      prisma.user.create = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 31000)) // 31秒
      )

      const req = createRequest({
        method: 'POST',
        body: JSON.stringify(timeoutEvent),
        headers: {
          'stripe-signature': 'test-signature',
        },
      })
      const res = createResponse()

      // タイムアウト設定（30秒）
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Webhook timeout')), 30000)
      )

      await expect(Promise.race([stripeWebhookHandler(req, res), timeoutPromise])).rejects.toThrow(
        'Webhook timeout'
      )

      // タイムアウトしたイベントがリトライキューに追加される
      const timeoutRetry = await prisma.webhookRetry.findFirst({
        where: { eventId: 'evt_timeout_123' },
      })
      expect(timeoutRetry?.lastError).toContain('timeout')
    })
  })
})
