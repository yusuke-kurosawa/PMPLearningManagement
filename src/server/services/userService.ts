/**
 * User Service
 * Business logic for user management operations
 * 担当: API・データエンジニア, 認証・セキュリティエンジニア
 */

import { prisma } from '@/lib/db'
import { UserRole, SubscriptionPlan, User } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { createPermissionChecker, Permission } from '@/server/auth/rbac'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// ユーザー検索・フィルタリング用スキーマ
export const userFilterSchema = z.object({
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  subscriptionPlan: z.nativeEnum(SubscriptionPlan).optional(),
  subscriptionActive: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  profileComplete: z.boolean().optional(),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt', 'lastLoginAt', 'totalStudyTime']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
})

export type UserFilter = z.infer<typeof userFilterSchema>

// ユーザー作成用スキーマ
export const createUserSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).optional(),
  role: z.nativeEnum(UserRole).optional().default(UserRole.USER),
  subscriptionPlan: z.nativeEnum(SubscriptionPlan).optional().default(SubscriptionPlan.FREE),
  emailVerified: z.boolean().optional().default(false),
})

export type CreateUserData = z.infer<typeof createUserSchema>

// ユーザー更新用スキーマ
export const updateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().toLowerCase().optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
  linkedIn: z.string().url().optional().or(z.literal('')),
  twitter: z.string().regex(/^@?[A-Za-z0-9_]{1,15}$/).optional().or(z.literal('')),
  role: z.nativeEnum(UserRole).optional(),
  subscriptionPlan: z.nativeEnum(SubscriptionPlan).optional(),
  subscriptionActive: z.boolean().optional(),
  profileComplete: z.boolean().optional(),
})

export type UpdateUserData = z.infer<typeof updateUserSchema>

// ユーザー統計情報
export interface UserStats {
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  usersByRole: Record<UserRole, number>
  usersBySubscription: Record<SubscriptionPlan, number>
  averageStudyTime: number
  topLearners: Array<{
    id: string
    name: string
    totalStudyTime: number
    completedProcesses: number
  }>
}

// ユーザー詳細情報（管理者向け）
export interface UserDetails extends User {
  settings?: any
  learningProgress?: any
  subscription?: any
  examResults: Array<{
    id: string
    score: number
    completedAt: Date
  }>
  activities: Array<{
    id: string
    action: string
    createdAt: Date
  }>
  _count: {
    examResults: number
    collaborationPosts: number
    studyGroups: number
  }
}

// ユーザーサービスクラス
export class UserService {
  // ユーザー検索・一覧取得
  static async findUsers(filter: UserFilter, requesterId?: string): Promise<{
    users: Partial<User>[]
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
  }> {
    try {
      // 検索条件構築
      const where: any = {}

      if (filter.search) {
        where.OR = [
          { name: { contains: filter.search, mode: 'insensitive' } },
          { email: { contains: filter.search, mode: 'insensitive' } },
        ]
      }

      if (filter.role) {
        where.role = filter.role
      }

      if (filter.subscriptionPlan) {
        where.subscriptionPlan = filter.subscriptionPlan
      }

      if (filter.subscriptionActive !== undefined) {
        if (filter.subscriptionActive) {
          where.OR = [
            { subscriptionPlan: SubscriptionPlan.FREE },
            { subscription: { status: 'active' } },
          ]
        } else {
          where.AND = [
            { subscriptionPlan: { not: SubscriptionPlan.FREE } },
            { 
              OR: [
                { subscription: null },
                { subscription: { status: { not: 'active' } } },
              ]
            },
          ]
        }
      }

      if (filter.emailVerified !== undefined) {
        where.emailVerified = filter.emailVerified ? { not: null } : null
      }

      if (filter.profileComplete !== undefined) {
        where.profileComplete = filter.profileComplete
      }

      if (filter.createdAfter) {
        where.createdAt = { ...where.createdAt, gte: filter.createdAfter }
      }

      if (filter.createdBefore) {
        where.createdAt = { ...where.createdAt, lte: filter.createdBefore }
      }

      // ソート条件
      const orderBy: any = {}
      if (filter.sortBy === 'totalStudyTime') {
        orderBy.learningProgress = { totalStudyTime: filter.sortOrder }
      } else if (filter.sortBy === 'lastLoginAt') {
        orderBy.lastLoginAt = filter.sortOrder
      } else {
        orderBy[filter.sortBy] = filter.sortOrder
      }

      // データ取得
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            subscriptionPlan: true,
            profileComplete: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
            lastLoginAt: true,
            learningProgress: {
              select: {
                totalStudyTime: true,
                currentStreak: true,
                completedProcesses: true,
              },
            },
            subscription: {
              select: {
                status: true,
                currentPeriodEnd: true,
              },
            },
            _count: {
              select: {
                examResults: true,
                collaborationPosts: true,
                studyGroups: true,
              },
            },
          },
          orderBy,
          take: filter.limit,
          skip: filter.offset,
        }),
        prisma.user.count({ where }),
      ])

      return {
        users: users.map(user => ({
          ...user,
          subscriptionActive: 
            user.subscriptionPlan === SubscriptionPlan.FREE || 
            user.subscription?.status === 'active',
        })),
        pagination: {
          total,
          limit: filter.limit,
          offset: filter.offset,
          hasMore: filter.offset + filter.limit < total,
        },
      }
    } catch (error) {
      console.error('ユーザー検索エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'ユーザー検索中にエラーが発生しました',
      })
    }
  }

  // ユーザー詳細情報取得
  static async getUserById(userId: string, requesterId?: string): Promise<UserDetails | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          settings: true,
          learningProgress: true,
          subscription: true,
          examResults: {
            select: {
              id: true,
              score: true,
              completedAt: true,
            },
            orderBy: { completedAt: 'desc' },
            take: 10,
          },
          activities: {
            select: {
              id: true,
              action: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
          _count: {
            select: {
              examResults: true,
              collaborationPosts: true,
              studyGroups: true,
            },
          },
        },
      })

      if (!user) {
        return null
      }

      return user as UserDetails
    } catch (error) {
      console.error('ユーザー詳細取得エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'ユーザー詳細取得中にエラーが発生しました',
      })
    }
  }

  // ユーザー作成
  static async createUser(data: CreateUserData, creatorId?: string): Promise<User> {
    try {
      // メールアドレス重複チェック
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      })

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'このメールアドレスは既に使用されています',
        })
      }

      // パスワードハッシュ化（提供されている場合）
      let hashedPassword: string | undefined
      if (data.password) {
        hashedPassword = await bcrypt.hash(data.password, 12)
      }

      // ユーザー作成
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          hashedPassword,
          role: data.role,
          subscriptionPlan: data.subscriptionPlan,
          subscriptionActive: data.subscriptionPlan === SubscriptionPlan.FREE,
          profileComplete: false,
          emailVerified: data.emailVerified ? new Date() : null,
          settings: {
            create: {
              theme: 'light',
              language: 'ja',
              notifications: {
                email: true,
                push: false,
                weekly_progress: true,
                exam_reminders: true,
              },
            },
          },
          learningProgress: {
            create: {
              totalStudyTime: 0,
              completedProcesses: [],
              currentStreak: 0,
              longestStreak: 0,
              lastActivityDate: new Date(),
            },
          },
        },
      })

      // 作成ログ記録
      if (creatorId) {
        await prisma.userActivity.create({
          data: {
            userId: creatorId,
            action: 'USER_CREATED',
            details: {
              createdUserId: user.id,
              createdUserEmail: user.email,
            },
          },
        })
      }

      return user
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('ユーザー作成エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'ユーザー作成中にエラーが発生しました',
      })
    }
  }

  // ユーザー更新
  static async updateUser(
    userId: string, 
    data: UpdateUserData, 
    updaterId?: string
  ): Promise<User> {
    try {
      // メールアドレス重複チェック（変更時）
      if (data.email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email: data.email,
            id: { not: userId },
          },
        })

        if (existingUser) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'このメールアドレスは既に使用されています',
          })
        }
      }

      // ユーザー更新
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      })

      // 更新ログ記録
      if (updaterId) {
        await prisma.userActivity.create({
          data: {
            userId: updaterId,
            action: 'USER_UPDATED',
            details: {
              updatedUserId: user.id,
              updatedFields: Object.keys(data),
            },
          },
        })
      }

      return user
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('ユーザー更新エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'ユーザー更新中にエラーが発生しました',
      })
    }
  }

  // ユーザー削除（論理削除）
  static async deleteUser(userId: string, deleterId?: string): Promise<void> {
    try {
      // 削除前のユーザー情報を取得
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'ユーザーが見つかりません',
        })
      }

      // 管理者の場合、他の管理者が存在するかチェック
      if (user.role === UserRole.ADMIN) {
        const adminCount = await prisma.user.count({
          where: { 
            role: UserRole.ADMIN,
            id: { not: userId },
          },
        })

        if (adminCount === 0) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: '最後の管理者は削除できません',
          })
        }
      }

      // 論理削除実行
      await prisma.user.update({
        where: { id: userId },
        data: {
          email: `deleted_${Date.now()}_${user.email}`,
          deletedAt: new Date(),
        },
      })

      // 削除ログ記録
      if (deleterId) {
        await prisma.userActivity.create({
          data: {
            userId: deleterId,
            action: 'USER_DELETED',
            details: {
              deletedUserId: user.id,
              deletedUserEmail: user.email,
              deletedUserName: user.name,
            },
          },
        })
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('ユーザー削除エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'ユーザー削除中にエラーが発生しました',
      })
    }
  }

  // ユーザー統計情報取得
  static async getUserStats(): Promise<UserStats> {
    try {
      const currentDate = new Date()
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      const [
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        usersByRole,
        usersBySubscription,
        studyTimeStats,
        topLearners,
      ] = await Promise.all([
        // 総ユーザー数
        prisma.user.count({
          where: { deletedAt: null },
        }),

        // アクティブユーザー数（過去30日間にログインしたユーザー）
        prisma.user.count({
          where: {
            deletedAt: null,
            lastLoginAt: {
              gte: thirtyDaysAgo,
            },
          },
        }),

        // 今月の新規ユーザー数
        prisma.user.count({
          where: {
            deletedAt: null,
            createdAt: {
              gte: startOfMonth,
            },
          },
        }),

        // 役割別ユーザー数
        prisma.user.groupBy({
          by: ['role'],
          where: { deletedAt: null },
          _count: { role: true },
        }),

        // サブスクリプション別ユーザー数
        prisma.user.groupBy({
          by: ['subscriptionPlan'],
          where: { deletedAt: null },
          _count: { subscriptionPlan: true },
        }),

        // 学習時間統計
        prisma.learningProgress.aggregate({
          _avg: { totalStudyTime: true },
          _sum: { totalStudyTime: true },
          _count: { totalStudyTime: true },
        }),

        // トップ学習者
        prisma.user.findMany({
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            learningProgress: {
              select: {
                totalStudyTime: true,
              },
            },
            _count: {
              select: {
                examResults: true,
              },
            },
          },
          orderBy: {
            learningProgress: {
              totalStudyTime: 'desc',
            },
          },
          take: 10,
        }),
      ])

      // データ整形
      const roleStats = Object.values(UserRole).reduce((acc, role) => {
        const found = usersByRole.find(item => item.role === role)
        acc[role] = found?._count.role || 0
        return acc
      }, {} as Record<UserRole, number>)

      const subscriptionStats = Object.values(SubscriptionPlan).reduce((acc, plan) => {
        const found = usersBySubscription.find(item => item.subscriptionPlan === plan)
        acc[plan] = found?._count.subscriptionPlan || 0
        return acc
      }, {} as Record<SubscriptionPlan, number>)

      return {
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        usersByRole: roleStats,
        usersBySubscription: subscriptionStats,
        averageStudyTime: Math.round(studyTimeStats._avg.totalStudyTime || 0),
        topLearners: topLearners.map(user => ({
          id: user.id,
          name: user.name || 'Unknown',
          totalStudyTime: user.learningProgress?.totalStudyTime || 0,
          completedProcesses: user._count.examResults,
        })),
      }
    } catch (error) {
      console.error('ユーザー統計取得エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'ユーザー統計取得中にエラーが発生しました',
      })
    }
  }

  // ユーザー権限変更
  static async changeUserRole(
    userId: string,
    newRole: UserRole,
    changerId?: string
  ): Promise<User> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, email: true },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'ユーザーが見つかりません',
        })
      }

      // 最後の管理者の権限変更を防ぐ
      if (user.role === UserRole.ADMIN && newRole !== UserRole.ADMIN) {
        const adminCount = await prisma.user.count({
          where: { 
            role: UserRole.ADMIN,
            deletedAt: null,
          },
        })

        if (adminCount === 1) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: '最後の管理者の権限は変更できません',
          })
        }
      }

      // 権限変更
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
      })

      // ログ記録
      if (changerId) {
        await prisma.userActivity.create({
          data: {
            userId: changerId,
            action: 'USER_ROLE_CHANGED',
            details: {
              targetUserId: userId,
              oldRole: user.role,
              newRole,
            },
          },
        })
      }

      return updatedUser
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('ユーザー権限変更エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'ユーザー権限変更中にエラーが発生しました',
      })
    }
  }

  // バッチユーザー操作
  static async batchUpdateUsers(
    userIds: string[],
    updates: Partial<UpdateUserData>,
    updaterId?: string
  ): Promise<{ updated: number; errors: string[] }> {
    const errors: string[] = []
    let updated = 0

    try {
      for (const userId of userIds) {
        try {
          await this.updateUser(userId, updates, updaterId)
          updated++
        } catch (error) {
          errors.push(`User ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      return { updated, errors }
    } catch (error) {
      console.error('バッチユーザー更新エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'バッチユーザー更新中にエラーが発生しました',
      })
    }
  }
}

export default UserService