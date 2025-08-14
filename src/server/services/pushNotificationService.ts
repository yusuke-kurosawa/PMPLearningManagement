/**
 * Push Notification Service
 * Web Push and mobile push notification management
 * 担当: 統合・外部APIエンジニア
 */

import webpush from 'web-push'
import { prisma } from '@/lib/db'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { NotificationPriority } from './notificationService'
import { logger } from '../../services/logger'

// Web Push設定
const VAPID_CONFIG = {
  publicKey: process.env.VAPID_PUBLIC_KEY!,
  privateKey: process.env.VAPID_PRIVATE_KEY!,
  subject: process.env.VAPID_SUBJECT || 'mailto:admin@pmplm.com',
}

// Web Push初期化
if (VAPID_CONFIG.publicKey && VAPID_CONFIG.privateKey) {
  webpush.setVapidDetails(VAPID_CONFIG.subject, VAPID_CONFIG.publicKey, VAPID_CONFIG.privateKey)
}

// プッシュ通知データスキーマ
export const pushNotificationSchema = z.object({
  userId: z.string(),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(300),
  icon: z.string().url().optional(),
  badge: z.string().url().optional(),
  image: z.string().url().optional(),
  data: z.record(z.any()).optional().default({}),
  actions: z
    .array(
      z.object({
        action: z.string(),
        title: z.string(),
        icon: z.string().url().optional(),
      })
    )
    .optional(),
  tag: z.string().optional(),
  renotify: z.boolean().optional().default(false),
  requireInteraction: z.boolean().optional().default(false),
  silent: z.boolean().optional().default(false),
  priority: z.nativeEnum(NotificationPriority).optional().default(NotificationPriority.NORMAL),
  ttl: z.number().min(0).max(2419200).optional().default(86400), // デフォルト24時間
})

export type PushNotificationData = z.infer<typeof pushNotificationSchema>

// プッシュサブスクリプション登録スキーマ
export const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
  userAgent: z.string().optional(),
  deviceType: z.enum(['desktop', 'mobile', 'tablet']).optional().default('desktop'),
})

export type PushSubscriptionData = z.infer<typeof subscriptionSchema>

// プッシュ通知サービスクラス
export class PushNotificationService {
  // プッシュ通知送信（メイン機能）
  static async sendPushNotification(data: PushNotificationData): Promise<{
    success: boolean
    sentCount: number
    failureCount: number
    errors: Array<{ subscriptionId: string; error: string }>
  }> {
    try {
      // 入力検証
      const validatedData = pushNotificationSchema.parse(data)

      // ユーザーのプッシュサブスクリプション取得
      const subscriptions = await prisma.pushSubscription.findMany({
        where: {
          userId: validatedData.userId,
          active: true,
        },
      })

      if (subscriptions.length === 0) {
        return {
          success: false,
          sentCount: 0,
          failureCount: 0,
          errors: [{ subscriptionId: 'none', error: 'No active push subscriptions found' }],
        }
      }

      // プッシュ通知ペイロード作成
      const payload = this.createNotificationPayload(validatedData)

      let sentCount = 0
      let failureCount = 0
      const errors: Array<{ subscriptionId: string; error: string }> = []

      // 各サブスクリプションに送信
      for (const subscription of subscriptions) {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          }

          const options = {
            TTL: validatedData.ttl,
            urgency: this.mapPriorityToUrgency(validatedData.priority),
            topic: validatedData.tag,
          }

          await webpush.sendNotification(pushSubscription, payload, options)

          // 成功時の記録
          await this.recordDeliverySuccess(subscription.id)
          sentCount++
        } catch (error: Error) {
          failureCount++

          // エラーの種類に応じた処理
          if (error.statusCode === 410 || error.statusCode === 404) {
            // サブスクリプションが無効な場合は削除
            await this.deactivateSubscription(subscription.id)
            errors.push({
              subscriptionId: subscription.id,
              error: 'Subscription expired and removed',
            })
          } else {
            // その他のエラー
            await this.recordDeliveryFailure(subscription.id, error.message)
            errors.push({
              subscriptionId: subscription.id,
              error: error.message || 'Unknown error',
            })
          }
        }
      }

      // 送信履歴記録
      await this.recordNotificationHistory({
        userId: validatedData.userId,
        title: validatedData.title,
        body: validatedData.body,
        sentCount,
        failureCount,
        totalSubscriptions: subscriptions.length,
      })

      return {
        success: sentCount > 0,
        sentCount,
        failureCount,
        errors,
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('プッシュ通知送信エラー:', error)
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'プッシュ通知の送信中にエラーが発生しました',
      })
    }
  }

  // プッシュサブスクリプション登録
  static async registerSubscription(
    userId: string,
    subscriptionData: PushSubscriptionData
  ): Promise<{
    subscriptionId: string
    success: boolean
  }> {
    try {
      // 入力検証
      const validatedData = subscriptionSchema.parse(subscriptionData)

      // 既存のサブスクリプションをチェック
      const existingSubscription = await prisma.pushSubscription.findUnique({
        where: { endpoint: validatedData.endpoint },
      })

      if (existingSubscription) {
        // 既存の場合は更新
        const updatedSubscription = await prisma.pushSubscription.update({
          where: { id: existingSubscription.id },
          data: {
            userId,
            p256dh: validatedData.keys.p256dh,
            auth: validatedData.keys.auth,
            userAgent: validatedData.userAgent,
            deviceType: validatedData.deviceType,
            active: true,
            lastUsedAt: new Date(),
          },
        })

        return {
          subscriptionId: updatedSubscription.id,
          success: true,
        }
      }

      // 新規登録
      const subscription = await prisma.pushSubscription.create({
        data: {
          userId,
          endpoint: validatedData.endpoint,
          p256dh: validatedData.keys.p256dh,
          auth: validatedData.keys.auth,
          userAgent: validatedData.userAgent,
          deviceType: validatedData.deviceType,
          active: true,
          lastUsedAt: new Date(),
        },
      })

      // アクティビティログ記録
      await prisma.userActivity.create({
        data: {
          userId,
          action: 'PUSH_SUBSCRIPTION_REGISTERED',
          details: {
            subscriptionId: subscription.id,
            deviceType: validatedData.deviceType,
          },
        },
      })

      return {
        subscriptionId: subscription.id,
        success: true,
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('プッシュサブスクリプション登録エラー:', error)
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'プッシュサブスクリプションの登録中にエラーが発生しました',
      })
    }
  }

  // プッシュサブスクリプション削除
  static async unregisterSubscription(
    userId: string,
    endpoint: string
  ): Promise<{ success: boolean }> {
    try {
      const result = await prisma.pushSubscription.updateMany({
        where: {
          userId,
          endpoint,
        },
        data: {
          active: false,
          deletedAt: new Date(),
        },
      })

      // アクティビティログ記録
      if (result.count > 0) {
        await prisma.userActivity.create({
          data: {
            userId,
            action: 'PUSH_SUBSCRIPTION_REMOVED',
            details: {
              endpoint,
            },
          },
        })
      }

      return { success: result.count > 0 }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('プッシュサブスクリプション削除エラー:', error)
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'プッシュサブスクリプションの削除中にエラーが発生しました',
      })
    }
  }

  // ユーザーのプッシュサブスクリプション一覧取得
  static async getUserSubscriptions(userId: string): Promise<
    Array<{
      id: string
      endpoint: string
      deviceType: string
      userAgent: string | null
      createdAt: Date
      lastUsedAt: Date | null
      active: boolean
    }>
  > {
    try {
      return await prisma.pushSubscription.findMany({
        where: { userId },
        select: {
          id: true,
          endpoint: true,
          deviceType: true,
          userAgent: true,
          createdAt: true,
          lastUsedAt: true,
          active: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('プッシュサブスクリプション取得エラー:', error)
      }
      return []
    }
  }

  // プッシュ通知ペイロード作成
  private static createNotificationPayload(data: PushNotificationData): string {
    const payload = {
      title: data.title,
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/badge-72x72.png',
      image: data.image,
      data: {
        ...data.data,
        url: data.data?.url || '/dashboard',
        timestamp: Date.now(),
      },
      actions: data.actions,
      tag: data.tag,
      renotify: data.renotify,
      requireInteraction: data.requireInteraction,
      silent: data.silent,
    }

    return JSON.stringify(payload)
  }

  // 優先度をWeb Push Urgencyにマッピング
  private static mapPriorityToUrgency(priority: NotificationPriority): string {
    const urgencyMap = {
      [NotificationPriority.LOW]: 'very-low',
      [NotificationPriority.NORMAL]: 'normal',
      [NotificationPriority.HIGH]: 'high',
      [NotificationPriority.URGENT]: 'high',
    }

    return urgencyMap[priority] || 'normal'
  }

  // 配信成功記録
  private static async recordDeliverySuccess(subscriptionId: string): Promise<void> {
    try {
      await prisma.pushSubscription.update({
        where: { id: subscriptionId },
        data: {
          lastUsedAt: new Date(),
          failureCount: 0,
        },
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('配信成功記録エラー:', error)
      }
    }
  }

  // 配信失敗記録
  private static async recordDeliveryFailure(
    subscriptionId: string,
    errorMessage: string
  ): Promise<void> {
    try {
      await prisma.pushSubscription.update({
        where: { id: subscriptionId },
        data: {
          failureCount: { increment: 1 },
          lastFailureAt: new Date(),
          lastFailureReason: errorMessage,
        },
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('配信失敗記録エラー:', error)
      }
    }
  }

  // サブスクリプション無効化
  private static async deactivateSubscription(subscriptionId: string): Promise<void> {
    try {
      await prisma.pushSubscription.update({
        where: { id: subscriptionId },
        data: {
          active: false,
          deletedAt: new Date(),
        },
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('サブスクリプション無効化エラー:', error)
      }
    }
  }

  // 通知履歴記録
  private static async recordNotificationHistory(data: {
    userId: string
    title: string
    body: string
    sentCount: number
    failureCount: number
    totalSubscriptions: number
  }): Promise<void> {
    try {
      await prisma.pushNotificationHistory.create({
        data: {
          userId: data.userId,
          title: data.title,
          body: data.body,
          sentCount: data.sentCount,
          failureCount: data.failureCount,
          totalSubscriptions: data.totalSubscriptions,
        },
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('通知履歴記録エラー:', error)
      }
    }
  }

  // バルクプッシュ通知送信
  static async sendBulkPushNotification(
    userIds: string[],
    notificationData: Omit<PushNotificationData, 'userId'>
  ): Promise<{
    totalUsers: number
    successCount: number
    failureCount: number
    totalSent: number
    errors: Array<{ userId: string; error: string }>
  }> {
    const totalUsers = userIds.length
    let successCount = 0
    let failureCount = 0
    let totalSent = 0
    const errors: Array<{ userId: string; error: string }> = []

    for (const userId of userIds) {
      try {
        const result = await this.sendPushNotification({
          ...notificationData,
          userId,
        })

        if (result.success) {
          successCount++
          totalSent += result.sentCount
        } else {
          failureCount++
          errors.push({
            userId,
            error: result.errors.map((e) => e.error).join(', ') || 'Unknown error',
          })
        }
      } catch (error) {
        failureCount++
        errors.push({
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return {
      totalUsers,
      successCount,
      failureCount,
      totalSent,
      errors,
    }
  }

  // プッシュ通知統計取得
  static async getPushNotificationStats(
    userId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalSent: number
    totalDelivered: number
    totalFailed: number
    deliveryRate: number
    topDeviceTypes: Array<{ deviceType: string; count: number }>
  }> {
    try {
      const where: unknown = {}
      if (userId) where.userId = userId
      if (startDate || endDate) {
        where.createdAt = {}
        if (startDate) where.createdAt.gte = startDate
        if (endDate) where.createdAt.lte = endDate
      }

      const [historyStats, deviceStats] = await Promise.all([
        prisma.pushNotificationHistory.aggregate({
          where,
          _sum: {
            sentCount: true,
            failureCount: true,
            totalSubscriptions: true,
          },
          _count: {
            id: true,
          },
        }),
        prisma.pushSubscription.groupBy({
          by: ['deviceType'],
          where: userId ? { userId } : {},
          _count: {
            id: true,
          },
          orderBy: {
            _count: {
              id: 'desc',
            },
          },
        }),
      ])

      const totalDelivered = historyStats._sum.sentCount || 0
      const totalFailed = historyStats._sum.failureCount || 0
      const totalSent = totalDelivered + totalFailed
      const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0

      return {
        totalSent,
        totalDelivered,
        totalFailed,
        deliveryRate: Math.round(deliveryRate * 100) / 100,
        topDeviceTypes: deviceStats.map((stat) => ({
          deviceType: stat.deviceType,
          count: stat._count.id,
        })),
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('プッシュ通知統計取得エラー:', error)
      }
      return {
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        deliveryRate: 0,
        topDeviceTypes: [],
      }
    }
  }

  // VAPID公開鍵取得
  static getVapidPublicKey(): string {
    return VAPID_CONFIG.publicKey
  }

  // プッシュ通知テスト
  static async testPushNotification(userId: string): Promise<{
    success: boolean
    message: string
  }> {
    try {
      const result = await this.sendPushNotification({
        userId,
        title: 'テスト通知',
        body: 'プッシュ通知が正常に設定されました！',
        data: {
          type: 'test',
          url: '/dashboard',
        },
        priority: NotificationPriority.NORMAL,
      })

      return {
        success: result.success,
        message: result.success
          ? `テスト通知を ${result.sentCount} 台のデバイスに送信しました`
          : 'テスト通知の送信に失敗しました',
      }
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'テスト通知の送信中にエラーが発生しました',
      }
    }
  }

  // 古いサブスクリプションのクリーンアップ
  static async cleanupOldSubscriptions(daysOld: number = 90): Promise<{
    cleaned: number
  }> {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)

      const result = await prisma.pushSubscription.deleteMany({
        where: {
          OR: [
            {
              lastUsedAt: {
                lt: cutoffDate,
              },
            },
            {
              failureCount: {
                gte: 5, // 5回以上失敗したサブスクリプション
              },
            },
          ],
        },
      })

      if (process.env.NODE_ENV === 'development') {
        logger.debug(`古いプッシュサブスクリプション削除: ${result.count}件`)
      }
      return { cleaned: result.count }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('プッシュサブスクリプションクリーンアップエラー:', error)
      }
      return { cleaned: 0 }
    }
  }
}

// 便利関数エクスポート
export const sendPushNotification =
  PushNotificationService.sendPushNotification.bind(PushNotificationService)
export const registerPushSubscription =
  PushNotificationService.registerSubscription.bind(PushNotificationService)
export const unregisterPushSubscription =
  PushNotificationService.unregisterSubscription.bind(PushNotificationService)

export default PushNotificationService
