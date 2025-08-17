/**
 * バックエンドサービス実装
 * Developer 2: サーバーサイド・API基盤
 * 技術スタック: tRPC, Prisma
 * セキュリティレベル: High
 * 最終更新: {updated}
 */

import Stripe from 'stripe'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { SubscriptionPlan, PaymentStatus } from '@prisma/client'

// Stripe初期化
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// プランとStripe Price IDのマッピング
export const SUBSCRIPTION_PLANS = {
  [SubscriptionPlan.FREE]: {
    name: 'フリープラン',
    priceId: null,
    amount: 0,
    currency: 'jpy',
    interval: null,
    features: ['基本的な学習機能', '模擬試験（制限付き）', 'コミュニティフォーラム'],
  },
  [SubscriptionPlan.BASIC]: {
    name: 'ベーシックプラン',
    priceId: process.env.STRIPE_BASIC_PRICE_ID!,
    amount: 2980,
    currency: 'jpy',
    interval: 'month' as const,
    features: [
      'フリープランの全機能',
      '無制限の模擬試験',
      '学習進捗分析',
      'AI学習アシスタント（基本）',
      'データエクスポート',
    ],
  },
  [SubscriptionPlan.PREMIUM]: {
    name: 'プレミアムプラン',
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    amount: 4980,
    currency: 'jpy',
    interval: 'month' as const,
    features: [
      'ベーシックプランの全機能',
      'AI学習アシスタント（高度）',
      '予測分析・パフォーマンス分析',
      '個人学習コーチング',
      '優先サポート',
    ],
  },
  [SubscriptionPlan.ENTERPRISE]: {
    name: 'エンタープライズプラン',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    amount: 9980,
    currency: 'jpy',
    interval: 'month' as const,
    features: [
      'プレミアムプランの全機能',
      'チーム管理機能',
      'カスタムレポート',
      '専任サポート',
      'API アクセス',
      'シングルサインオン (SSO)',
    ],
  },
}

// 支払い方法スキーマ
export const paymentMethodSchema = z.object({
  type: z.enum(['card']),
  card: z.object({
    number: z.string().regex(/^\d{13,19}$/, '有効なカード番号を入力してください'),
    exp_month: z.number().min(1).max(12),
    exp_year: z.number().min(new Date().getFullYear()),
    cvc: z.string().regex(/^\d{3,4}$/, '有効なCVCを入力してください'),
  }),
  billing_details: z.object({
    name: z.string().min(1, '名前を入力してください'),
    email: z.string().email('有効なメールアドレスを入力してください'),
    address: z.object({
      line1: z.string().min(1, '住所を入力してください'),
      line2: z.string().optional(),
      city: z.string().min(1, '市区町村を入力してください'),
      state: z.string().optional(),
      postal_code: z.string().min(1, '郵便番号を入力してください'),
      country: z.string().length(2, '国コードは2文字で入力してください').default('JP'),
    }),
  }),
})

export type PaymentMethodData = z.infer<typeof paymentMethodSchema>

// Stripeサービスクラス
export class StripeService {
  // 顧客作成または取得
  static async createOrGetCustomer(
    userId: string,
    email: string,
    name?: string
  ): Promise<Stripe.Customer> {
    try {
      // 既存の顧客を検索
      const existingCustomers = await stripe.customers.list({
        email: email,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        const customer = existingCustomers.data[0]

        // メタデータでユーザーIDを確認・更新
        if (customer.metadata.userId !== userId) {
          await stripe.customers.update(customer.id, {
            metadata: { userId },
          })
        }

        return customer
      }

      // 新規顧客作成
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
        },
      })

      // データベースに顧客情報を保存
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customer.id },
      })

      return customer
    } catch (error) {
      console.error('Stripe顧客作成エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '顧客情報の作成中にエラーが発生しました',
      })
    }
  }

  // サブスクリプション作成
  static async createSubscription(
    userId: string,
    planId: SubscriptionPlan,
    paymentMethodId?: string
  ): Promise<{
    subscription: Stripe.Subscription
    clientSecret?: string
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'ユーザーが見つかりません',
        })
      }

      const plan = SUBSCRIPTION_PLANS[planId]
      if (!plan.priceId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'フリープランは登録不要です',
        })
      }

      // Stripe顧客作成
      const customer = await this.createOrGetCustomer(userId, user.email, user.name || undefined)

      // 支払い方法が提供された場合は添付
      if (paymentMethodId) {
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: customer.id,
        })

        await stripe.customers.update(customer.id, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        })
      }

      // サブスクリプション作成
      const subscriptionParams: Stripe.SubscriptionCreateParams = {
        customer: customer.id,
        items: [
          {
            price: plan.priceId,
          },
        ],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId,
          planId,
        },
      }

      const subscription = await stripe.subscriptions.create(subscriptionParams)

      // データベースに保存
      await this.syncSubscriptionToDatabase(subscription, userId)

      // Payment Intent の client_secret を取得
      const invoice = subscription.latest_invoice as Stripe.Invoice
      const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent
      const clientSecret = paymentIntent?.client_secret

      return {
        subscription,
        clientSecret,
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('サブスクリプション作成エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'サブスクリプションの作成中にエラーが発生しました',
      })
    }
  }

  // サブスクリプション更新
  static async updateSubscription(
    userId: string,
    newPlanId: SubscriptionPlan
  ): Promise<Stripe.Subscription> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      })

      if (!user || !user.subscription) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'アクティブなサブスクリプションが見つかりません',
        })
      }

      const newPlan = SUBSCRIPTION_PLANS[newPlanId]
      if (!newPlan.priceId) {
        // フリープランへのダウングレード
        return await this.cancelSubscription(userId, true)
      }

      const subscription = await stripe.subscriptions.retrieve(
        user.subscription.stripeSubscriptionId
      )

      // 現在のアイテムを新しいプランに更新
      const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPlan.priceId,
          },
        ],
        proration_behavior: 'create_prorations',
        metadata: {
          userId,
          planId: newPlanId,
        },
      })

      // データベース更新
      await this.syncSubscriptionToDatabase(updatedSubscription, userId)

      return updatedSubscription
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('サブスクリプション更新エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'サブスクリプションの更新中にエラーが発生しました',
      })
    }
  }

  // サブスクリプションキャンセル
  static async cancelSubscription(
    userId: string,
    immediate: boolean = false
  ): Promise<Stripe.Subscription> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      })

      if (!user || !user.subscription) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'アクティブなサブスクリプションが見つかりません',
        })
      }

      const subscription = immediate
        ? await stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId)
        : await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
            cancel_at_period_end: true,
          })

      // データベース更新
      await this.syncSubscriptionToDatabase(subscription, userId)

      return subscription
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('サブスクリプションキャンセルエラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'サブスクリプションのキャンセル中にエラーが発生しました',
      })
    }
  }

  // 支払い方法追加
  static async addPaymentMethod(
    userId: string,
    paymentMethodData: PaymentMethodData
  ): Promise<Stripe.PaymentMethod> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'ユーザーが見つかりません',
        })
      }

      // Stripe顧客作成または取得
      const customer = await this.createOrGetCustomer(userId, user.email, user.name || undefined)

      // 支払い方法作成
      const paymentMethod = await stripe.paymentMethods.create({
        type: paymentMethodData.type,
        card: paymentMethodData.card,
        billing_details: paymentMethodData.billing_details,
      })

      // 顧客に支払い方法を添付
      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: customer.id,
      })

      return paymentMethod
    } catch (error) {
      console.error('支払い方法追加エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '支払い方法の追加中にエラーが発生しました',
      })
    }
  }

  // 請求書履歴取得
  static async getInvoices(userId: string, limit: number = 10): Promise<Stripe.Invoice[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user || !user.stripeCustomerId) {
        return []
      }

      const invoices = await stripe.invoices.list({
        customer: user.stripeCustomerId,
        limit,
        status: 'paid',
      })

      return invoices.data
    } catch (error) {
      console.error('請求書履歴取得エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '請求書履歴の取得中にエラーが発生しました',
      })
    }
  }

  // 支払い方法一覧取得
  static async getPaymentMethods(userId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user || !user.stripeCustomerId) {
        return []
      }

      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: 'card',
      })

      return paymentMethods.data
    } catch (error) {
      console.error('支払い方法取得エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '支払い方法の取得中にエラーが発生しました',
      })
    }
  }

  // WebHook署名検証
  static verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    try {
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!
      return stripe.webhooks.constructEvent(payload, signature, endpointSecret)
    } catch (error) {
      console.error('WebHook署名検証エラー:', error)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'WebHook署名の検証に失敗しました',
      })
    }
  }

  // サブスクリプションをデータベースに同期
  static async syncSubscriptionToDatabase(
    subscription: Stripe.Subscription,
    userId: string
  ): Promise<void> {
    try {
      const planId = subscription.metadata.planId as SubscriptionPlan
      const status = this.mapStripeStatusToDatabase(subscription.status)

      await prisma.subscription.upsert({
        where: { userId },
        update: {
          stripeSubscriptionId: subscription.id,
          status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
        create: {
          userId,
          stripeSubscriptionId: subscription.id,
          status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      })

      // ユーザーのサブスクリプションプラン更新
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionPlan: planId || SubscriptionPlan.FREE,
        },
      })
    } catch (error) {
      console.error('データベース同期エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'サブスクリプションの同期中にエラーが発生しました',
      })
    }
  }

  // Stripeステータスをデータベースステータスにマッピング
  private static mapStripeStatusToDatabase(stripeStatus: string): string {
    const statusMap: Record<string, string> = {
      active: 'active',
      past_due: 'past_due',
      canceled: 'canceled',
      unpaid: 'unpaid',
      trialing: 'trialing',
      incomplete: 'incomplete',
      incomplete_expired: 'incomplete_expired',
    }

    return statusMap[stripeStatus] || 'unknown'
  }

  // 使用量レポート生成（エンタープライズプラン用）
  static async generateUsageReport(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    period: { start: Date; end: Date }
    usage: {
      studyHours: number
      examAttempts: number
      aiQueries: number
      dataExports: number
    }
    costs: {
      baseSubscription: number
      overage: number
      total: number
    }
  }> {
    try {
      const [studySessions, examResults, aiUsage, dataExports] = await Promise.all([
        prisma.studySession.findMany({
          where: {
            userId,
            createdAt: { gte: startDate, lte: endDate },
          },
        }),
        prisma.examResult.findMany({
          where: {
            userId,
            completedAt: { gte: startDate, lte: endDate },
          },
        }),
        // AI使用量は実装に応じて調整
        Promise.resolve([]),
        // データエクスポートは実装に応じて調整
        Promise.resolve([]),
      ])

      const studyHours =
        studySessions.reduce((total, session) => total + session.duration, 0) / 3600

      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      const plan = user ? SUBSCRIPTION_PLANS[user.subscriptionPlan] : null
      const baseSubscription = plan?.amount || 0

      return {
        period: { start: startDate, end: endDate },
        usage: {
          studyHours: Math.round(studyHours * 10) / 10,
          examAttempts: examResults.length,
          aiQueries: 0, // 実装に応じて調整
          dataExports: 0, // 実装に応じて調整
        },
        costs: {
          baseSubscription,
          overage: 0, // 使用量オーバー料金（必要に応じて実装）
          total: baseSubscription,
        },
      }
    } catch (error) {
      console.error('使用量レポート生成エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '使用量レポートの生成中にエラーが発生しました',
      })
    }
  }
}

export { stripe }
export default StripeService
