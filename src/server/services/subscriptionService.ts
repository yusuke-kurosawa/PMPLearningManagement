/**
 * Subscription Management Service
 * Business logic for subscription lifecycle, billing, and plan management
 * 担当: ビジネスロジックエンジニア, 統合・外部APIエンジニア
 */

import { prisma } from '@/lib/db'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { SubscriptionPlan, PaymentStatus } from '@prisma/client'
import { StripeService, SUBSCRIPTION_PLANS } from './stripeService'
import { createPermissionChecker } from '@/server/auth/rbac'

// サブスクリプション情報型定義
export interface SubscriptionInfo {
  id: string
  userId: string
  plan: SubscriptionPlan
  status: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  stripeSubscriptionId: string | null
  features: string[]
  billing: {
    amount: number
    currency: string
    interval: string | null
    nextBillingDate: Date | null
  }
  usage?: {
    studyHours: number
    examAttempts: number
    aiQueries: number
    remainingQuota?: {
      exams: number | null
      aiQueries: number | null
    }
  }
}

// プラン変更オプション
export const planChangeSchema = z.object({
  newPlan: z.nativeEnum(SubscriptionPlan),
  immediate: z.boolean().optional().default(false),
  prorationBehavior: z.enum(['create_prorations', 'none']).optional().default('create_prorations'),
})

export type PlanChangeOptions = z.infer<typeof planChangeSchema>

// 使用量制限定義
export const USAGE_LIMITS = {
  [SubscriptionPlan.FREE]: {
    examAttemptsPerMonth: 3,
    aiQueriesPerMonth: 10,
    studyHoursPerMonth: null, // 無制限
    dataExportsPerMonth: 1,
  },
  [SubscriptionPlan.BASIC]: {
    examAttemptsPerMonth: null, // 無制限
    aiQueriesPerMonth: 100,
    studyHoursPerMonth: null,
    dataExportsPerMonth: 5,
  },
  [SubscriptionPlan.PREMIUM]: {
    examAttemptsPerMonth: null,
    aiQueriesPerMonth: 500,
    studyHoursPerMonth: null,
    dataExportsPerMonth: null, // 無制限
  },
  [SubscriptionPlan.ENTERPRISE]: {
    examAttemptsPerMonth: null,
    aiQueriesPerMonth: null, // 無制限
    studyHoursPerMonth: null,
    dataExportsPerMonth: null,
  },
}

// サブスクリプション管理サービスクラス
export class SubscriptionService {
  // ユーザーのサブスクリプション情報取得
  static async getSubscriptionInfo(userId: string): Promise<SubscriptionInfo> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscription: true,
        },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'ユーザーが見つかりません',
        })
      }

      const plan = SUBSCRIPTION_PLANS[user.subscriptionPlan]
      const subscription = user.subscription

      // 使用量統計を取得
      const usage = await this.calculateUsage(userId)

      return {
        id: subscription?.id || `free-${userId}`,
        userId,
        plan: user.subscriptionPlan,
        status: subscription?.status || 'active',
        currentPeriodStart: subscription?.currentPeriodStart || user.createdAt,
        currentPeriodEnd: subscription?.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
        stripeSubscriptionId: subscription?.stripeSubscriptionId || null,
        features: plan.features,
        billing: {
          amount: plan.amount,
          currency: plan.currency,
          interval: plan.interval,
          nextBillingDate: subscription?.currentPeriodEnd || null,
        },
        usage,
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('サブスクリプション情報取得エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'サブスクリプション情報の取得中にエラーが発生しました',
      })
    }
  }

  // プラン変更
  static async changePlan(
    userId: string,
    options: PlanChangeOptions
  ): Promise<{ success: boolean; message: string; subscription?: any }> {
    try {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      })

      if (!currentUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'ユーザーが見つかりません',
        })
      }

      // 現在のプランと同じ場合はエラー
      if (currentUser.subscriptionPlan === options.newPlan) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '既に同じプランを使用中です',
        })
      }

      // フリープランへの変更
      if (options.newPlan === SubscriptionPlan.FREE) {
        return await this.downgradeToFree(userId, options.immediate)
      }

      // 有料プランへの変更
      if (currentUser.subscriptionPlan === SubscriptionPlan.FREE) {
        // フリープランから有料プランへのアップグレード
        return await this.upgradeFromFree(userId, options.newPlan)
      } else {
        // 有料プラン間の変更
        const subscription = await StripeService.updateSubscription(userId, options.newPlan)
        
        // アクティビティログ記録
        await this.recordSubscriptionActivity(userId, 'PLAN_CHANGED', {
          fromPlan: currentUser.subscriptionPlan,
          toPlan: options.newPlan,
          immediate: options.immediate,
        })

        return {
          success: true,
          message: `プランを${SUBSCRIPTION_PLANS[options.newPlan].name}に変更しました`,
          subscription,
        }
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('プラン変更エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'プランの変更中にエラーが発生しました',
      })
    }
  }

  // フリープランへのダウングレード
  private static async downgradeToFree(
    userId: string,
    immediate: boolean = false
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 既存のStripeサブスクリプションをキャンセル
      await StripeService.cancelSubscription(userId, immediate)

      // データベース更新
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionPlan: SubscriptionPlan.FREE,
        },
      })

      // アクセス権限の制限チェック（必要に応じて実装）
      await this.enforceFreePlanLimits(userId)

      await this.recordSubscriptionActivity(userId, 'DOWNGRADED_TO_FREE', {
        immediate,
      })

      return {
        success: true,
        message: immediate 
          ? 'フリープランにダウングレードしました' 
          : '期間終了後にフリープランにダウングレードされます',
      }
    } catch (error) {
      console.error('フリープランダウングレードエラー:', error)
      throw error
    }
  }

  // フリープランから有料プランへのアップグレード
  private static async upgradeFromFree(
    userId: string,
    newPlan: SubscriptionPlan
  ): Promise<{ success: boolean; message: string; clientSecret?: string }> {
    try {
      const result = await StripeService.createSubscription(userId, newPlan)

      await this.recordSubscriptionActivity(userId, 'UPGRADED_FROM_FREE', {
        toPlan: newPlan,
      })

      return {
        success: true,
        message: `${SUBSCRIPTION_PLANS[newPlan].name}にアップグレードしました`,
        clientSecret: result.clientSecret,
      }
    } catch (error) {
      console.error('フリープランアップグレードエラー:', error)
      throw error
    }
  }

  // 使用量統計計算
  static async calculateUsage(userId: string): Promise<{
    studyHours: number
    examAttempts: number
    aiQueries: number
    remainingQuota?: {
      exams: number | null
      aiQueries: number | null
    }
  }> {
    try {
      const currentMonth = new Date()
      currentMonth.setDate(1)
      currentMonth.setHours(0, 0, 0, 0)

      const [studySessions, examResults, user] = await Promise.all([
        prisma.studySession.findMany({
          where: {
            userId,
            createdAt: { gte: currentMonth },
          },
        }),
        prisma.examResult.findMany({
          where: {
            userId,
            completedAt: { gte: currentMonth },
          },
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: { subscriptionPlan: true },
        }),
      ])

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'ユーザーが見つかりません',
        })
      }

      const studyHours = studySessions.reduce(
        (total, session) => total + session.duration,
        0
      ) / 3600

      const examAttempts = examResults.length
      const aiQueries = 0 // 実装に応じて調整

      const limits = USAGE_LIMITS[user.subscriptionPlan]
      const remainingQuota = {
        exams: limits.examAttemptsPerMonth 
          ? Math.max(0, limits.examAttemptsPerMonth - examAttempts)
          : null,
        aiQueries: limits.aiQueriesPerMonth 
          ? Math.max(0, limits.aiQueriesPerMonth - aiQueries)
          : null,
      }

      return {
        studyHours: Math.round(studyHours * 10) / 10,
        examAttempts,
        aiQueries,
        remainingQuota,
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('使用量計算エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '使用量の計算中にエラーが発生しました',
      })
    }
  }

  // 使用量制限チェック
  static async checkUsageLimits(
    userId: string,
    action: 'exam_attempt' | 'ai_query' | 'data_export'
  ): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionPlan: true },
      })

      if (!user) {
        return { allowed: false, reason: 'ユーザーが見つかりません' }
      }

      const limits = USAGE_LIMITS[user.subscriptionPlan]
      const usage = await this.calculateUsage(userId)

      switch (action) {
        case 'exam_attempt':
          if (limits.examAttemptsPerMonth === null) {
            return { allowed: true } // 無制限
          }
          
          const examRemaining = limits.examAttemptsPerMonth - usage.examAttempts
          return {
            allowed: examRemaining > 0,
            reason: examRemaining <= 0 ? '今月の模擬試験上限に達しています' : undefined,
            remaining: examRemaining,
          }

        case 'ai_query':
          if (limits.aiQueriesPerMonth === null) {
            return { allowed: true } // 無制限
          }
          
          const aiRemaining = limits.aiQueriesPerMonth - usage.aiQueries
          return {
            allowed: aiRemaining > 0,
            reason: aiRemaining <= 0 ? '今月のAI質問上限に達しています' : undefined,
            remaining: aiRemaining,
          }

        case 'data_export':
          if (limits.dataExportsPerMonth === null) {
            return { allowed: true } // 無制限
          }
          
          // データエクスポート回数は別途追跡が必要（実装に応じて調整）
          return { allowed: true }

        default:
          return { allowed: false, reason: '不明なアクション' }
      }
    } catch (error) {
      console.error('使用量制限チェックエラー:', error)
      return { allowed: false, reason: 'システムエラーが発生しました' }
    }
  }

  // フリープラン制限の適用
  private static async enforceFreePlanLimits(userId: string): Promise<void> {
    try {
      // プレミアム機能データの無効化や制限（実装に応じて調整）
      // 例: AI学習履歴の制限、高度な分析データの非表示など
      
      await prisma.userSettings.updateMany({
        where: { userId },
        data: {
          // フリープラン用の設定に戻す
          notifications: {
            email: true,
            push: false,
            weekly_progress: true,
            exam_reminders: true,
          },
        },
      })
    } catch (error) {
      console.error('フリープラン制限適用エラー:', error)
      // エラーログは記録するが、処理は継続
    }
  }

  // サブスクリプション状態の同期
  static async syncSubscriptionStatus(userId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      })

      if (!user?.subscription?.stripeSubscriptionId) {
        return
      }

      // Stripeから最新情報を取得
      const stripeSubscription = await StripeService.stripe.subscriptions.retrieve(
        user.subscription.stripeSubscriptionId
      )

      // データベースに同期
      await StripeService.syncSubscriptionToDatabase(stripeSubscription, userId)
    } catch (error) {
      console.error('サブスクリプション同期エラー:', error)
      // 同期エラーは記録するが、例外を投げない
    }
  }

  // サブスクリプション履歴取得
  static async getSubscriptionHistory(
    userId: string,
    limit: number = 20
  ): Promise<Array<{
    id: string
    action: string
    details: any
    createdAt: Date
  }>> {
    try {
      const activities = await prisma.userActivity.findMany({
        where: {
          userId,
          action: {
            in: [
              'SUBSCRIPTION_CREATED',
              'PLAN_CHANGED',
              'SUBSCRIPTION_CANCELED',
              'PAYMENT_SUCCEEDED',
              'PAYMENT_FAILED',
              'UPGRADED_FROM_FREE',
              'DOWNGRADED_TO_FREE',
            ],
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      })

      return activities.map(activity => ({
        id: activity.id,
        action: activity.action,
        details: activity.details,
        createdAt: activity.createdAt,
      }))
    } catch (error) {
      console.error('サブスクリプション履歴取得エラー:', error)
      return []
    }
  }

  // 利用可能なプラン一覧取得
  static getAvailablePlans(): Array<{
    id: SubscriptionPlan
    name: string
    amount: number
    currency: string
    interval: string | null
    features: string[]
    popular?: boolean
    recommended?: boolean
  }> {
    return Object.entries(SUBSCRIPTION_PLANS).map(([planId, plan]) => ({
      id: planId as SubscriptionPlan,
      name: plan.name,
      amount: plan.amount,
      currency: plan.currency,
      interval: plan.interval,
      features: plan.features,
      popular: planId === SubscriptionPlan.BASIC,
      recommended: planId === SubscriptionPlan.PREMIUM,
    }))
  }

  // サブスクリプション再開
  static async reactivateSubscription(
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      })

      if (!user?.subscription?.stripeSubscriptionId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'キャンセル可能なサブスクリプションが見つかりません',
        })
      }

      // Stripeでキャンセル予定を取り消し
      const subscription = await StripeService.stripe.subscriptions.update(
        user.subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: false,
        }
      )

      // データベース更新
      await StripeService.syncSubscriptionToDatabase(subscription, userId)

      await this.recordSubscriptionActivity(userId, 'SUBSCRIPTION_REACTIVATED', {})

      return {
        success: true,
        message: 'サブスクリプションを再開しました',
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('サブスクリプション再開エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'サブスクリプションの再開中にエラーが発生しました',
      })
    }
  }

  // アクティビティログ記録
  private static async recordSubscriptionActivity(
    userId: string,
    action: string,
    details: any
  ): Promise<void> {
    try {
      await prisma.userActivity.create({
        data: {
          userId,
          action,
          details,
        },
      })
    } catch (error) {
      console.error('アクティビティログ記録エラー:', error)
      // ログ記録エラーは処理を妨げない
    }
  }

  // 期限切れサブスクリプションの処理
  static async processExpiredSubscriptions(): Promise<{
    processed: number
    errors: number
  }> {
    let processed = 0
    let errors = 0

    try {
      // 期限切れのサブスクリプションを検索
      const expiredSubscriptions = await prisma.subscription.findMany({
        where: {
          currentPeriodEnd: {
            lt: new Date(),
          },
          status: {
            in: ['active', 'past_due'],
          },
        },
        include: {
          user: true,
        },
      })

      for (const subscription of expiredSubscriptions) {
        try {
          await this.syncSubscriptionStatus(subscription.userId)
          processed++
        } catch (error) {
          console.error(`期限切れサブスクリプション処理エラー (${subscription.userId}):`, error)
          errors++
        }
      }

      return { processed, errors }
    } catch (error) {
      console.error('期限切れサブスクリプション一括処理エラー:', error)
      return { processed: 0, errors: 1 }
    }
  }
}

export default SubscriptionService