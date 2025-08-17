/**
 * Payment Router (tRPC)
 * Subscription management, billing, and payment processing endpoints
 * 担当: 統合・外部APIエンジニア, ビジネスロジックエンジニア
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import Stripe from 'stripe'
import { createTRPCRouter, protectedProcedure } from '@/server/trpc'
import { StripeService, paymentMethodSchema } from '@/server/services/stripeService'
import { logger } from '../../services/logger'
import {
  SubscriptionService,
  planChangeSchema,
  USAGE_LIMITS,
} from '@/server/services/subscriptionService'
import { createPermissionChecker, Permission } from '@/server/auth/rbac'
import { SubscriptionPlan } from '@prisma/client'
import { prisma } from '@/lib/db'

// Stripe Customer型ガード
function isStripeCustomer(
  customer: Stripe.Customer | Stripe.DeletedCustomer
): customer is Stripe.Customer {
  return !customer.deleted && 'metadata' in customer
}

// 入力検証スキーマ
const createSubscriptionSchema = z.object({
  planId: z
    .nativeEnum(SubscriptionPlan)
    .refine((plan) => plan !== SubscriptionPlan.FREE, '有料プランを選択してください'),
  paymentMethodId: z.string().min(1, '支払い方法を選択してください').optional(),
})

const paymentIntentSchema = z.object({
  amount: z.number().min(100, '最低100円から設定できます'), // 最低1円（Stripeの最低金額）
  currency: z.string().length(3).default('jpy'),
  description: z.string().optional(),
})

const invoiceQuerySchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  startingAfter: z.string().optional(),
})

const usageReportSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
})

// 決済・サブスクリプションルーター
export const paymentRouter = createTRPCRouter({
  // サブスクリプション情報取得
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const checker = createPermissionChecker(ctx.session.user)

    if (!checker.hasPermission(Permission.PAYMENT_VIEW)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'サブスクリプション情報を表示する権限がありません',
      })
    }

    return await SubscriptionService.getSubscriptionInfo(ctx.session.user.id)
  }),

  // 利用可能なプラン一覧取得
  getPlans: protectedProcedure.query(async () => {
    return SubscriptionService.getAvailablePlans()
  }),

  // サブスクリプション作成
  createSubscription: protectedProcedure
    .input(createSubscriptionSchema)
    .mutation(async ({ ctx, input }) => {
      const checker = createPermissionChecker(ctx.session.user)

      if (!checker.hasPermission(Permission.PAYMENT_MANAGE)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'サブスクリプションを管理する権限がありません',
        })
      }

      // 既存のアクティブなサブスクリプションがある場合はエラー
      const existingSubscription = await prisma.subscription.findUnique({
        where: {
          userId: ctx.session.user.id,
        },
      })

      if (existingSubscription && existingSubscription.status === 'active') {
        throw new TRPCError({
          code: 'CONFLICT',
          message: '既にアクティブなサブスクリプションが存在します',
        })
      }

      const result = await StripeService.createSubscription(
        ctx.session.user.id,
        input.planId,
        input.paymentMethodId
      )

      // アクティビティログ記録
      await prisma.userActivity.create({
        data: {
          userId: ctx.session.user.id,
          action: 'SUBSCRIPTION_CREATED',
          details: {
            planId: input.planId,
            subscriptionId: result.subscription.id,
          },
        },
      })

      return {
        subscription: result.subscription,
        clientSecret: result.clientSecret,
        message: 'サブスクリプションが作成されました',
      }
    }),

  // プラン変更
  changePlan: protectedProcedure.input(planChangeSchema).mutation(async ({ ctx, input }) => {
    const checker = createPermissionChecker(ctx.session.user)

    if (!checker.hasPermission(Permission.PAYMENT_MANAGE)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'プランを変更する権限がありません',
      })
    }

    return await SubscriptionService.changePlan(ctx.session.user.id, input)
  }),

  // サブスクリプションキャンセル
  cancelSubscription: protectedProcedure
    .input(
      z.object({
        immediate: z.boolean().optional().default(false),
        reason: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const checker = createPermissionChecker(ctx.session.user)

      if (!checker.hasPermission(Permission.PAYMENT_MANAGE)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'サブスクリプションをキャンセルする権限がありません',
        })
      }

      const subscription = await StripeService.cancelSubscription(
        ctx.session.user.id,
        input.immediate
      )

      // アクティビティログ記録
      await prisma.userActivity.create({
        data: {
          userId: ctx.session.user.id,
          action: 'SUBSCRIPTION_CANCELED',
          details: {
            immediate: input.immediate,
            reason: input.reason,
            canceledAt: new Date(),
          },
        },
      })

      return {
        subscription,
        message: input.immediate
          ? 'サブスクリプションをキャンセルしました'
          : '期間終了後にキャンセルされます',
      }
    }),

  // サブスクリプション再開
  reactivateSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const checker = createPermissionChecker(ctx.session.user)

    if (!checker.hasPermission(Permission.PAYMENT_MANAGE)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'サブスクリプションを再開する権限がありません',
      })
    }

    return await SubscriptionService.reactivateSubscription(ctx.session.user.id)
  }),

  // 支払い方法追加
  addPaymentMethod: protectedProcedure
    .input(paymentMethodSchema)
    .mutation(async ({ ctx, input }) => {
      const checker = createPermissionChecker(ctx.session.user)

      if (!checker.hasPermission(Permission.PAYMENT_MANAGE)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '支払い方法を管理する権限がありません',
        })
      }

      const paymentMethod = await StripeService.addPaymentMethod(ctx.session.user.id, input)

      await prisma.userActivity.create({
        data: {
          userId: ctx.session.user.id,
          action: 'PAYMENT_METHOD_ADDED',
          details: {
            paymentMethodId: paymentMethod.id,
            last4: paymentMethod.card?.last4,
            brand: paymentMethod.card?.brand,
          },
        },
      })

      return {
        paymentMethod,
        message: '支払い方法が追加されました',
      }
    }),

  // 支払い方法一覧取得
  getPaymentMethods: protectedProcedure.query(async ({ ctx }) => {
    const checker = createPermissionChecker(ctx.session.user)

    if (!checker.hasPermission(Permission.PAYMENT_VIEW)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: '支払い方法を表示する権限がありません',
      })
    }

    return await StripeService.getPaymentMethods(ctx.session.user.id)
  }),

  // 支払い方法削除
  removePaymentMethod: protectedProcedure
    .input(
      z.object({
        paymentMethodId: z.string().min(1, '支払い方法IDが必要です'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const checker = createPermissionChecker(ctx.session.user)

      if (!checker.hasPermission(Permission.PAYMENT_MANAGE)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '支払い方法を削除する権限がありません',
        })
      }

      try {
        await StripeService.stripe.paymentMethods.detach(input.paymentMethodId)

        await prisma.userActivity.create({
          data: {
            userId: ctx.session.user.id,
            action: 'PAYMENT_METHOD_REMOVED',
            details: {
              paymentMethodId: input.paymentMethodId,
            },
          },
        })

        return {
          message: '支払い方法が削除されました',
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          logger.error('支払い方法削除エラー:', error)
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '支払い方法の削除中にエラーが発生しました',
        })
      }
    }),

  // 請求書履歴取得
  getInvoices: protectedProcedure.input(invoiceQuerySchema).query(async ({ ctx, input }) => {
    const checker = createPermissionChecker(ctx.session.user)

    if (!checker.hasPermission(Permission.PAYMENT_VIEW)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: '請求書を表示する権限がありません',
      })
    }

    return await StripeService.getInvoices(ctx.session.user.id, input.limit)
  }),

  // 使用量制限チェック
  checkUsageLimit: protectedProcedure
    .input(
      z.object({
        action: z.enum(['exam_attempt', 'ai_query', 'data_export']),
      })
    )
    .query(async ({ ctx, input }) => {
      return await SubscriptionService.checkUsageLimits(ctx.session.user.id, input.action)
    }),

  // 使用量統計取得
  getUsageStats: protectedProcedure.query(async ({ ctx }) => {
    const checker = createPermissionChecker(ctx.session.user)

    if (!checker.hasPermission(Permission.PAYMENT_VIEW)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: '使用量統計を表示する権限がありません',
      })
    }

    const usage = await SubscriptionService.calculateUsage(ctx.session.user.id)
    const limits = USAGE_LIMITS[ctx.session.user.subscriptionPlan]

    return {
      usage,
      limits,
      utilizationRates: {
        exams: limits.examAttemptsPerMonth
          ? (usage.examAttempts / limits.examAttemptsPerMonth) * 100
          : 0,
        aiQueries: limits.aiQueriesPerMonth
          ? (usage.aiQueries / limits.aiQueriesPerMonth) * 100
          : 0,
      },
    }
  }),

  // 使用量レポート生成
  generateUsageReport: protectedProcedure
    .input(usageReportSchema)
    .mutation(async ({ ctx, input }) => {
      const checker = createPermissionChecker(ctx.session.user)

      // エンタープライズプランユーザーのみ
      if (!checker.isEnterpriseUser()) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '使用量レポート機能はエンタープライズプランのみご利用いただけます',
        })
      }

      const report = await StripeService.generateUsageReport(
        ctx.session.user.id,
        input.startDate,
        input.endDate
      )

      await prisma.userActivity.create({
        data: {
          userId: ctx.session.user.id,
          action: 'USAGE_REPORT_GENERATED',
          details: {
            startDate: input.startDate,
            endDate: input.endDate,
          },
        },
      })

      return report
    }),

  // サブスクリプション履歴取得
  getSubscriptionHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const checker = createPermissionChecker(ctx.session.user)

      if (!checker.hasPermission(Permission.PAYMENT_VIEW)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'サブスクリプション履歴を表示する権限がありません',
        })
      }

      return await SubscriptionService.getSubscriptionHistory(ctx.session.user.id, input.limit)
    }),

  // PaymentIntent作成（単発決済用）
  createPaymentIntent: protectedProcedure
    .input(paymentIntentSchema)
    .mutation(async ({ ctx, input }) => {
      const checker = createPermissionChecker(ctx.session.user)

      if (!checker.hasPermission(Permission.PAYMENT_MANAGE)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '決済を実行する権限がありません',
        })
      }

      try {
        // Stripe顧客作成または取得
        const customer = await StripeService.createOrGetCustomer(
          ctx.session.user.id,
          ctx.session.user.email,
          ctx.session.user.name || undefined
        )

        // PaymentIntent作成
        const paymentIntent = await StripeService.stripe.paymentIntents.create({
          amount: input.amount,
          currency: input.currency,
          customer: customer.id,
          description: input.description,
          metadata: {
            userId: ctx.session.user.id,
          },
        })

        return {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          logger.error('PaymentIntent作成エラー:', error)
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '決済の準備中にエラーが発生しました',
        })
      }
    }),

  // プランの機能詳細取得
  getPlanFeatures: protectedProcedure
    .input(
      z.object({
        planId: z.nativeEnum(SubscriptionPlan).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const targetPlan = input.planId || ctx.session.user.subscriptionPlan
      const limits = USAGE_LIMITS[targetPlan]

      return {
        planId: targetPlan,
        limits,
        features: {
          unlimitedExams: limits.examAttemptsPerMonth === null,
          unlimitedAI: limits.aiQueriesPerMonth === null,
          unlimitedExports: limits.dataExportsPerMonth === null,
          advancedAnalytics: [SubscriptionPlan.PREMIUM, SubscriptionPlan.ENTERPRISE].includes(
            targetPlan
          ),
          prioritySupport: [SubscriptionPlan.PREMIUM, SubscriptionPlan.ENTERPRISE].includes(
            targetPlan
          ),
          teamManagement: targetPlan === SubscriptionPlan.ENTERPRISE,
          apiAccess: targetPlan === SubscriptionPlan.ENTERPRISE,
        },
      }
    }),

  // 請求書PDF生成
  generateInvoicePDF: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string().min(1, '請求書IDが必要です'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const checker = createPermissionChecker(ctx.session.user)

      if (!checker.hasPermission(Permission.PAYMENT_VIEW)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '請求書を表示する権限がありません',
        })
      }

      try {
        // 請求書取得
        const invoice = await StripeService.stripe.invoices.retrieve(input.invoiceId)

        // 顧客確認
        if (typeof invoice.customer === 'string') {
          const customer = await StripeService.stripe.customers.retrieve(invoice.customer)

          if (!isStripeCustomer(customer)) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: '削除された顧客の請求書にはアクセスできません',
            })
          }

          if (customer.metadata?.userId !== ctx.session.user.id) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'この請求書にアクセスする権限がありません',
            })
          }
        }

        return {
          invoiceUrl: invoice.invoice_pdf || invoice.hosted_invoice_url,
          invoiceNumber: invoice.number,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          paidAt: invoice.status_transitions?.paid_at
            ? new Date(invoice.status_transitions.paid_at * 1000)
            : null,
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          logger.error('請求書PDF生成エラー:', error)
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '請求書の生成中にエラーが発生しました',
        })
      }
    }),

  // サブスクリプション状態同期
  syncSubscriptionStatus: protectedProcedure.mutation(async ({ ctx }) => {
    await SubscriptionService.syncSubscriptionStatus(ctx.session.user.id)

    return {
      message: 'サブスクリプション状態を同期しました',
    }
  }),

  // プロモーションコード適用
  applyPromoCode: protectedProcedure
    .input(
      z.object({
        promoCode: z.string().min(1, 'プロモーションコードを入力してください'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const checker = createPermissionChecker(ctx.session.user)

      if (!checker.hasPermission(Permission.PAYMENT_MANAGE)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'プロモーションコードを適用する権限がありません',
        })
      }

      try {
        // プロモーションコード検索
        const promotionCodes = await StripeService.stripe.promotionCodes.list({
          code: input.promoCode,
          active: true,
          limit: 1,
        })

        if (promotionCodes.data.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '有効なプロモーションコードが見つかりません',
          })
        }

        const promoCode = promotionCodes.data[0]

        // 適用可能性チェック（実装に応じて詳細を調整）
        // - 使用回数制限
        // - 有効期限
        // - 対象プランなど

        return {
          promoCode: promoCode.code,
          coupon: promoCode.coupon,
          message: 'プロモーションコードが適用されました',
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        if (process.env.NODE_ENV === 'development') {
          logger.error('プロモーションコード適用エラー:', error)
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'プロモーションコードの適用中にエラーが発生しました',
        })
      }
    }),
})

export default paymentRouter
