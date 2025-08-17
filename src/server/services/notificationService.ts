/**
 * Notification Service
 * Centralized notification management system
 * 担当: 統合・外部APIエンジニア
 */

import { prisma } from '@/lib/db'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { sendEmail } from './emailService'
import { sendPushNotification } from './pushNotificationService'
import { logger } from '../../services/logger'

// 通知タイプ定義
export enum NotificationType {
  LEARNING_REMINDER = 'learning_reminder',
  EXAM_REMINDER = 'exam_reminder',
  ACHIEVEMENT_EARNED = 'achievement_earned',
  GOAL_DEADLINE = 'goal_deadline',
  SUBSCRIPTION_EXPIRING = 'subscription_expiring',
  PAYMENT_FAILED = 'payment_failed',
  WEEKLY_PROGRESS = 'weekly_progress',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  COLLABORATION_INVITE = 'collaboration_invite',
  DISCUSSION_REPLY = 'discussion_reply',
  STUDY_GROUP_UPDATE = 'study_group_update',
}

// 通知チャネル定義
export enum NotificationChannel {
  EMAIL = 'email',
  PUSH = 'push',
  IN_APP = 'in_app',
}

// 通知優先度定義
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

// 通知設定スキーマ
export const notificationSettingsSchema = z.object({
  email: z.object({
    enabled: z.boolean(),
    learningReminders: z.boolean(),
    examReminders: z.boolean(),
    achievements: z.boolean(),
    weeklyProgress: z.boolean(),
    systemAnnouncements: z.boolean(),
    collaborationUpdates: z.boolean(),
  }),
  push: z.object({
    enabled: z.boolean(),
    learningReminders: z.boolean(),
    examReminders: z.boolean(),
    achievements: z.boolean(),
    systemAnnouncements: z.boolean(),
  }),
  inApp: z.object({
    enabled: z.boolean(),
    showAchievements: z.boolean(),
    showReminders: z.boolean(),
    showCollaboration: z.boolean(),
  }),
  frequency: z.object({
    learningReminders: z.enum(['never', 'daily', 'weekly']),
    progressReports: z.enum(['never', 'weekly', 'monthly']),
  }),
})

export type NotificationSettings = z.infer<typeof notificationSettingsSchema>

// 通知データ型定義
export interface NotificationData {
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  channels: NotificationChannel[]
  priority: NotificationPriority
  scheduledFor?: Date
  expiresAt?: Date
}

// 通知テンプレート定義
export const NOTIFICATION_TEMPLATES: Record<
  NotificationType,
  {
    title: string
    message: string
    emailTemplate?: string
    pushTemplate?: string
  }
> = {
  [NotificationType.LEARNING_REMINDER]: {
    title: '学習リマインダー',
    message: '今日の学習を始めませんか？継続的な学習で目標達成に近づきましょう！',
    emailTemplate: 'learning-reminder',
    pushTemplate: 'learning-reminder',
  },
  [NotificationType.EXAM_REMINDER]: {
    title: '模擬試験リマインダー',
    message: '模擬試験を受けて実力を確認しましょう！',
    emailTemplate: 'exam-reminder',
    pushTemplate: 'exam-reminder',
  },
  [NotificationType.ACHIEVEMENT_EARNED]: {
    title: '新しい実績を獲得しました！',
    message: 'おめでとうございます！新しい実績を達成しました。',
    emailTemplate: 'achievement-earned',
    pushTemplate: 'achievement-earned',
  },
  [NotificationType.GOAL_DEADLINE]: {
    title: '学習目標の期限が近づいています',
    message: '設定した学習目標の期限まであと少しです。最後のスパートをかけましょう！',
    emailTemplate: 'goal-deadline',
  },
  [NotificationType.SUBSCRIPTION_EXPIRING]: {
    title: 'サブスクリプション期限のお知らせ',
    message: 'プレミアムプランの有効期限が近づいています。継続をご検討ください。',
    emailTemplate: 'subscription-expiring',
  },
  [NotificationType.PAYMENT_FAILED]: {
    title: 'お支払いの処理に問題が発生しました',
    message: 'お支払い方法をご確認いただき、再度お試しください。',
    emailTemplate: 'payment-failed',
  },
  [NotificationType.WEEKLY_PROGRESS]: {
    title: '週間学習レポート',
    message: 'この1週間の学習進捗をまとめました。',
    emailTemplate: 'weekly-progress',
  },
  [NotificationType.SYSTEM_ANNOUNCEMENT]: {
    title: 'システムからのお知らせ',
    message: '重要なお知らせがあります。',
    emailTemplate: 'system-announcement',
    pushTemplate: 'system-announcement',
  },
  [NotificationType.COLLABORATION_INVITE]: {
    title: '学習グループへの招待',
    message: '学習グループに招待されました。',
    emailTemplate: 'collaboration-invite',
  },
  [NotificationType.DISCUSSION_REPLY]: {
    title: 'ディスカッションに新しい返信',
    message: 'あなたの投稿に新しい返信がありました。',
    emailTemplate: 'discussion-reply',
  },
  [NotificationType.STUDY_GROUP_UPDATE]: {
    title: '学習グループの更新',
    message: '参加している学習グループに新しい更新があります。',
    emailTemplate: 'study-group-update',
  },
}

// 通知サービスクラス
export class NotificationService {
  // 通知送信（メイン関数）
  static async sendNotification(notificationData: NotificationData): Promise<{
    success: boolean
    results: Array<{
      channel: NotificationChannel
      success: boolean
      error?: string
    }>
  }> {
    const results: Array<{
      channel: NotificationChannel
      success: boolean
      error?: string
    }> = []

    // ユーザーの通知設定を取得
    const userSettings = await this.getUserNotificationSettings(notificationData.userId)

    if (!userSettings) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'ユーザーの通知設定が見つかりません',
      })
    }

    // チャネル別に通知を送信
    for (const channel of notificationData.channels) {
      try {
        const canSend = await this.canSendNotification(
          notificationData.userId,
          notificationData.type,
          channel,
          userSettings
        )

        if (!canSend) {
          results.push({
            channel,
            success: false,
            error: 'User disabled this notification type',
          })
          continue
        }

        switch (channel) {
          case NotificationChannel.EMAIL:
            await this.sendEmailNotification(notificationData)
            break
          case NotificationChannel.PUSH:
            await this.sendPushNotificationInternal(notificationData)
            break
          case NotificationChannel.IN_APP:
            await this.createInAppNotification(notificationData)
            break
        }

        results.push({ channel, success: true })
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          logger.error(`通知送信エラー (${channel}):`, error)
        }
        results.push({
          channel,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // 通知履歴を記録
    await this.recordNotificationHistory(notificationData, results)

    const success = results.some((r) => r.success)
    return { success, results }
  }

  // ユーザーの通知設定取得
  static async getUserNotificationSettings(userId: string): Promise<NotificationSettings | null> {
    try {
      const userSettings = await prisma.userSettings.findUnique({
        where: { userId },
      })

      if (!userSettings) {
        return null
      }

      // デフォルト設定とマージ
      const defaultSettings: NotificationSettings = {
        email: {
          enabled: true,
          learningReminders: true,
          examReminders: true,
          achievements: true,
          weeklyProgress: true,
          systemAnnouncements: true,
          collaborationUpdates: true,
        },
        push: {
          enabled: false,
          learningReminders: false,
          examReminders: true,
          achievements: true,
          systemAnnouncements: true,
        },
        inApp: {
          enabled: true,
          showAchievements: true,
          showReminders: true,
          showCollaboration: true,
        },
        frequency: {
          learningReminders: 'daily',
          progressReports: 'weekly',
        },
      }

      // 実際の設定とマージ（深いマージが必要）
      const settings = userSettings.notifications as Record<string, unknown>
      return {
        email: { ...defaultSettings.email, ...settings?.email },
        push: { ...defaultSettings.push, ...settings?.push },
        inApp: { ...defaultSettings.inApp, ...settings?.inApp },
        frequency: { ...defaultSettings.frequency, ...settings?.frequency },
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('通知設定取得エラー:', error)
      }
      return null
    }
  }

  // 通知設定更新
  static async updateNotificationSettings(
    userId: string,
    settings: Partial<NotificationSettings>
  ): Promise<NotificationSettings> {
    try {
      const currentSettings = await this.getUserNotificationSettings(userId)

      if (!currentSettings) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'ユーザー設定が見つかりません',
        })
      }

      // 設定をマージ
      const updatedSettings: NotificationSettings = {
        email: { ...currentSettings.email, ...settings.email },
        push: { ...currentSettings.push, ...settings.push },
        inApp: { ...currentSettings.inApp, ...settings.inApp },
        frequency: { ...currentSettings.frequency, ...settings.frequency },
      }

      await prisma.userSettings.update({
        where: { userId },
        data: {
          notifications: updatedSettings,
        },
      })

      // アクティビティログ記録
      await prisma.userActivity.create({
        data: {
          userId,
          action: 'NOTIFICATION_SETTINGS_UPDATED',
          details: {
            updatedSettings: settings,
          },
        },
      })

      return updatedSettings
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      if (process.env.NODE_ENV === 'development') {
        logger.error('通知設定更新エラー:', error)
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '通知設定の更新中にエラーが発生しました',
      })
    }
  }

  // 通知送信可否判定
  private static async canSendNotification(
    userId: string,
    type: NotificationType,
    channel: NotificationChannel,
    settings: NotificationSettings
  ): Promise<boolean> {
    // チャネル自体が無効な場合
    if (!settings[channel]?.enabled) {
      return false
    }

    // 通知タイプ別の設定チェック
    switch (type) {
      case NotificationType.LEARNING_REMINDER:
        return channel === 'email'
          ? settings.email.learningReminders
          : settings.push.learningReminders

      case NotificationType.EXAM_REMINDER:
        return channel === 'email' ? settings.email.examReminders : settings.push.examReminders

      case NotificationType.ACHIEVEMENT_EARNED:
        return channel === 'email' ? settings.email.achievements : settings.push.achievements

      case NotificationType.WEEKLY_PROGRESS:
        return channel === 'email' && settings.email.weeklyProgress

      case NotificationType.SYSTEM_ANNOUNCEMENT:
        return channel === 'email'
          ? settings.email.systemAnnouncements
          : settings.push.systemAnnouncements

      case NotificationType.COLLABORATION_INVITE:
      case NotificationType.DISCUSSION_REPLY:
      case NotificationType.STUDY_GROUP_UPDATE:
        return channel === 'email' && settings.email.collaborationUpdates

      default:
        return true
    }
  }

  // メール通知送信
  private static async sendEmailNotification(notificationData: NotificationData): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: notificationData.userId },
    })

    if (!user) {
      throw new Error('ユーザーが見つかりません')
    }

    const template = NOTIFICATION_TEMPLATES[notificationData.type]

    await sendEmail({
      to: user.email,
      subject: notificationData.title || template.title,
      template: template.emailTemplate || 'notification',
      data: {
        name: user.name,
        title: notificationData.title || template.title,
        message: notificationData.message || template.message,
        ...notificationData.data,
      },
    })
  }

  // プッシュ通知送信
  private static async sendPushNotificationInternal(
    notificationData: NotificationData
  ): Promise<void> {
    await sendPushNotification({
      userId: notificationData.userId,
      title: notificationData.title,
      body: notificationData.message,
      data: notificationData.data,
      priority: notificationData.priority,
    })
  }

  // アプリ内通知作成
  private static async createInAppNotification(notificationData: NotificationData): Promise<void> {
    await prisma.notification.create({
      data: {
        userId: notificationData.userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data || {},
        priority: notificationData.priority,
        read: false,
        expiresAt: notificationData.expiresAt,
      },
    })
  }

  // スケジュール済み通知作成
  static async scheduleNotification(notificationData: NotificationData): Promise<string> {
    try {
      const scheduledNotification = await prisma.scheduledNotification.create({
        data: {
          userId: notificationData.userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          data: notificationData.data || {},
          channels: notificationData.channels,
          priority: notificationData.priority,
          scheduledFor: notificationData.scheduledFor || new Date(),
          status: 'pending',
        },
      })

      return scheduledNotification.id
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('スケジュール通知作成エラー:', error)
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'スケジュール通知の作成中にエラーが発生しました',
      })
    }
  }

  // スケジュール済み通知の実行
  static async processScheduledNotifications(): Promise<{
    processed: number
    failed: number
  }> {
    let processed = 0
    let failed = 0

    try {
      // 実行予定の通知を取得
      const scheduledNotifications = await prisma.scheduledNotification.findMany({
        where: {
          status: 'pending',
          scheduledFor: {
            lte: new Date(),
          },
        },
        take: 100, // バッチサイズ制限
      })

      for (const scheduled of scheduledNotifications) {
        try {
          // 通知送信
          await this.sendNotification({
            userId: scheduled.userId,
            type: scheduled.type as NotificationType,
            title: scheduled.title,
            message: scheduled.message,
            data: scheduled.data as Record<string, unknown>,
            channels: scheduled.channels as NotificationChannel[],
            priority: scheduled.priority as NotificationPriority,
          })

          // ステータス更新
          await prisma.scheduledNotification.update({
            where: { id: scheduled.id },
            data: {
              status: 'sent',
              sentAt: new Date(),
            },
          })

          processed++
        } catch (_error) {
          if (process.env.NODE_ENV === 'development') {
            logger.error(`スケジュール通知送信エラー (${scheduled.id}):`, error)
          }

          // 失敗回数更新
          await prisma.scheduledNotification.update({
            where: { id: scheduled.id },
            data: {
              failureCount: { increment: 1 },
              lastFailureAt: new Date(),
              status: scheduled.failureCount >= 2 ? 'failed' : 'pending', // 3回失敗で諦め
            },
          })

          failed++
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('スケジュール通知処理エラー:', error)
      }
    }

    return { processed, failed }
  }

  // アプリ内通知一覧取得
  static async getInAppNotifications(
    userId: string,
    options: {
      limit?: number
      offset?: number
      unreadOnly?: boolean
    } = {}
  ): Promise<{
    notifications: Array<{
      id: string
      type: NotificationType
      title: string
      message: string
      data: Record<string, unknown>
      read: boolean
      createdAt: Date
    }>
    unreadCount: number
    totalCount: number
  }> {
    const { limit = 20, offset = 0, unreadOnly = false } = options

    try {
      const where = {
        userId,
        ...(unreadOnly && { read: false }),
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      }

      const [notifications, unreadCount, totalCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
          select: {
            id: true,
            type: true,
            title: true,
            message: true,
            data: true,
            read: true,
            createdAt: true,
          },
        }),
        prisma.notification.count({
          where: { userId, read: false },
        }),
        prisma.notification.count({ where }),
      ])

      return {
        notifications: notifications.map((n) => ({
          ...n,
          type: n.type as NotificationType,
          data: n.data as Record<string, unknown>,
        })),
        unreadCount,
        totalCount,
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('アプリ内通知取得エラー:', error)
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'アプリ内通知の取得中にエラーが発生しました',
      })
    }
  }

  // 通知既読マーク
  static async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('通知既読マークエラー:', error)
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '通知の既読マーク中にエラーが発生しました',
      })
    }
  }

  // 全通知既読マーク
  static async markAllNotificationsAsRead(userId: string): Promise<number> {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      })

      return result.count
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('全通知既読マークエラー:', error)
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '全通知の既読マーク中にエラーが発生しました',
      })
    }
  }

  // 通知履歴記録
  private static async recordNotificationHistory(
    notificationData: NotificationData,
    results: Array<{ channel: NotificationChannel; success: boolean; error?: string }>
  ): Promise<void> {
    try {
      await prisma.notificationHistory.create({
        data: {
          userId: notificationData.userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          channels: notificationData.channels,
          results: results,
          sentAt: new Date(),
        },
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('通知履歴記録エラー:', error)
      }
      // 履歴記録エラーは処理を妨げない
    }
  }

  // 期限切れ通知のクリーンアップ
  static async cleanupExpiredNotifications(): Promise<{ deleted: number }> {
    try {
      const result = await prisma.notification.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      })

      if (process.env.NODE_ENV === 'development') {
        logger.debug(`期限切れ通知削除: ${result.count}件`)
      }
      return { deleted: result.count }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('期限切れ通知クリーンアップエラー:', error)
      }
      return { deleted: 0 }
    }
  }

  // バルク通知送信（管理者用）
  static async sendBulkNotification(
    userIds: string[],
    notificationData: Omit<NotificationData, 'userId'>
  ): Promise<{
    totalUsers: number
    successCount: number
    failureCount: number
    errors: Array<{ userId: string; error: string }>
  }> {
    const totalUsers = userIds.length
    let successCount = 0
    let failureCount = 0
    const errors: Array<{ userId: string; error: string }> = []

    for (const userId of userIds) {
      try {
        await this.sendNotification({
          ...notificationData,
          userId,
        })
        successCount++
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
      errors,
    }
  }
}

export default NotificationService
