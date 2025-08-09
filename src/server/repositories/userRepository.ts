/**
 * User Repository
 * Data access layer for user-related operations
 * 担当: API・データエンジニア
 */

import { prisma } from '@/lib/db'
import { User, UserRole, SubscriptionPlan, Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'

// 拡張ユーザー型定義
export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    settings: true
    learningProgress: true
    subscription: true
    examResults: true
    collaborationPosts: true
    studyGroups: true
    userActivities: true
  }
}>

export type UserWithStats = Prisma.UserGetPayload<{
  include: {
    learningProgress: true
    subscription: true
    _count: {
      select: {
        examResults: true
        collaborationPosts: true
        studyGroups: true
      }
    }
  }
}>

// クエリオプション型定義
export interface UserQueryOptions {
  include?: {
    settings?: boolean
    learningProgress?: boolean
    subscription?: boolean
    examResults?: boolean
    collaborationPosts?: boolean
    studyGroups?: boolean
    userActivities?: boolean
  }
  select?: Prisma.UserSelect
  orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[]
  where?: Prisma.UserWhereInput
  take?: number
  skip?: number
}

// フィルタリングオプション
export interface UserFilterOptions {
  search?: string
  role?: UserRole
  subscriptionPlan?: SubscriptionPlan
  subscriptionActive?: boolean
  emailVerified?: boolean
  profileComplete?: boolean
  createdAfter?: Date
  createdBefore?: Date
  hasActiveSubscription?: boolean
  isActive?: boolean // 過去30日以内にログインしたか
}

// ソートオプション
export type UserSortField = 'name' | 'email' | 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'totalStudyTime'
export type SortOrder = 'asc' | 'desc'

export interface UserSortOptions {
  field: UserSortField
  order: SortOrder
}

// ページネーション結果
export interface PaginatedUsers<T = User> {
  data: T[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// ユーザーリポジトリクラス
export class UserRepository {
  // 単一ユーザー取得（IDで検索）
  static async findById(id: string, options?: UserQueryOptions): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { id },
        ...options,
      })
    } catch (error) {
      console.error('ユーザーID検索エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'ユーザー検索中にエラーが発生しました',
      })
    }
  }

  // 単一ユーザー取得（メールで検索）
  static async findByEmail(email: string, options?: UserQueryOptions): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { 
          email: email.toLowerCase(),
          deletedAt: null, // 論理削除されていないユーザーのみ
        },
        ...options,
      })
    } catch (error) {
      console.error('ユーザーメール検索エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'ユーザー検索中にエラーが発生しました',
      })
    }
  }

  // 複数ユーザー取得（フィルタリング・ソート・ページネーション対応）
  static async findMany(
    filters: UserFilterOptions = {},
    sort: UserSortOptions = { field: 'createdAt', order: 'desc' },
    page: number = 1,
    pageSize: number = 20,
    options?: UserQueryOptions
  ): Promise<PaginatedUsers<any>> {
    try {
      // WHERE条件構築
      const where: Prisma.UserWhereInput = {
        deletedAt: null, // 論理削除されていないユーザーのみ
      }

      // 検索条件
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { bio: { contains: filters.search, mode: 'insensitive' } },
        ]
      }

      // ロールフィルタ
      if (filters.role) {
        where.role = filters.role
      }

      // サブスクリプションプランフィルタ
      if (filters.subscriptionPlan) {
        where.subscriptionPlan = filters.subscriptionPlan
      }

      // サブスクリプション有効性フィルタ
      if (filters.subscriptionActive !== undefined) {
        if (filters.subscriptionActive) {
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

      // メール確認フィルタ
      if (filters.emailVerified !== undefined) {
        where.emailVerified = filters.emailVerified ? { not: null } : null
      }

      // プロフィール完了フィルタ
      if (filters.profileComplete !== undefined) {
        where.profileComplete = filters.profileComplete
      }

      // 作成日時フィルタ
      if (filters.createdAfter || filters.createdBefore) {
        where.createdAt = {}
        if (filters.createdAfter) {
          where.createdAt.gte = filters.createdAfter
        }
        if (filters.createdBefore) {
          where.createdAt.lte = filters.createdBefore
        }
      }

      // アクティブユーザーフィルタ（過去30日以内にログイン）
      if (filters.isActive) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        where.lastLoginAt = { gte: thirtyDaysAgo }
      }

      // ソート条件構築
      let orderBy: Prisma.UserOrderByWithRelationInput = {}
      
      switch (sort.field) {
        case 'totalStudyTime':
          orderBy = { learningProgress: { totalStudyTime: sort.order } }
          break
        case 'lastLoginAt':
          orderBy = { lastLoginAt: sort.order }
          break
        default:
          orderBy = { [sort.field]: sort.order }
      }

      // データ取得
      const skip = (page - 1) * pageSize
      const [data, total] = await Promise.all([
        prisma.user.findMany({
          where,
          orderBy,
          skip,
          take: pageSize,
          ...options,
        }),
        prisma.user.count({ where }),
      ])

      // ページネーション情報計算
      const totalPages = Math.ceil(total / pageSize)
      const hasNext = page < totalPages
      const hasPrev = page > 1

      return {
        data,
        pagination: {
          total,
          page,
          pageSize,
          totalPages,
          hasNext,
          hasPrev,
        },
      }
    } catch (error) {
      console.error('ユーザー一覧取得エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'ユーザー一覧取得中にエラーが発生しました',
      })
    }
  }

  // ユーザー作成
  static async create(data: Prisma.UserCreateInput): Promise<User> {
    try {
      return await prisma.user.create({
        data: {
          ...data,
          email: data.email.toLowerCase(),
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'このメールアドレスは既に使用されています',
          })
        }
      }
      
      console.error('ユーザー作成エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'ユーザー作成中にエラーが発生しました',
      })
    }
  }

  // ユーザー更新
  static async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
          // メールアドレスが更新される場合は小文字に変換
          ...(data.email && { email: (data.email as string).toLowerCase() }),
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'このメールアドレスは既に使用されています',
          })
        }
        if (error.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'ユーザーが見つかりません',
          })
        }
      }
      
      console.error('ユーザー更新エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'ユーザー更新中にエラーが発生しました',
      })
    }
  }

  // ユーザー削除（論理削除）
  static async delete(id: string): Promise<User> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: { email: true },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'ユーザーが見つかりません',
        })
      }

      return await prisma.user.update({
        where: { id },
        data: {
          email: `deleted_${Date.now()}_${user.email}`,
          deletedAt: new Date(),
        },
      })
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

  // ユーザー復元
  static async restore(id: string): Promise<User> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'ユーザーが見つかりません',
        })
      }

      if (!user.deletedAt) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'このユーザーは削除されていません',
        })
      }

      // 削除時にプレフィックスされたメールアドレスを元に戻す
      const originalEmail = user.email.replace(/^deleted_\d+_/, '')

      return await prisma.user.update({
        where: { id },
        data: {
          email: originalEmail,
          deletedAt: null,
        },
      })
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }
      
      console.error('ユーザー復元エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'ユーザー復元中にエラーが発生しました',
      })
    }
  }

  // ユーザー存在確認
  static async exists(id: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { 
          id,
          deletedAt: null,
        },
        select: { id: true },
      })
      return !!user
    } catch (error) {
      console.error('ユーザー存在確認エラー:', error)
      return false
    }
  }

  // メールアドレス存在確認
  static async existsByEmail(email: string, excludeId?: string): Promise<boolean> {
    try {
      const where: Prisma.UserWhereInput = {
        email: email.toLowerCase(),
        deletedAt: null,
      }
      
      if (excludeId) {
        where.id = { not: excludeId }
      }

      const user = await prisma.user.findFirst({
        where,
        select: { id: true },
      })
      
      return !!user
    } catch (error) {
      console.error('メールアドレス存在確認エラー:', error)
      return false
    }
  }

  // ユーザー数取得
  static async count(filters: UserFilterOptions = {}): Promise<number> {
    try {
      const where: Prisma.UserWhereInput = {
        deletedAt: null,
      }

      // フィルタ適用（findManyと同じロジック）
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
        ]
      }

      if (filters.role) where.role = filters.role
      if (filters.subscriptionPlan) where.subscriptionPlan = filters.subscriptionPlan
      if (filters.emailVerified !== undefined) {
        where.emailVerified = filters.emailVerified ? { not: null } : null
      }
      if (filters.profileComplete !== undefined) {
        where.profileComplete = filters.profileComplete
      }

      return await prisma.user.count({ where })
    } catch (error) {
      console.error('ユーザー数取得エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'ユーザー数取得中にエラーが発生しました',
      })
    }
  }

  // バッチ更新
  static async batchUpdate(
    where: Prisma.UserWhereInput,
    data: Prisma.UserUpdateManyMutationInput
  ): Promise<{ count: number }> {
    try {
      const result = await prisma.user.updateMany({
        where: {
          ...where,
          deletedAt: null,
        },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      })

      return result
    } catch (error) {
      console.error('バッチ更新エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'バッチ更新中にエラーが発生しました',
      })
    }
  }

  // 統計情報取得
  static async getStats(): Promise<{
    total: number
    byRole: Record<UserRole, number>
    bySubscription: Record<SubscriptionPlan, number>
    verified: number
    active: number
    newThisMonth: number
  }> {
    try {
      const currentMonth = new Date()
      currentMonth.setDate(1)
      currentMonth.setHours(0, 0, 0, 0)

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      const [
        total,
        roleStats,
        subscriptionStats,
        verified,
        active,
        newThisMonth,
      ] = await Promise.all([
        prisma.user.count({ where: { deletedAt: null } }),
        
        prisma.user.groupBy({
          by: ['role'],
          where: { deletedAt: null },
          _count: { role: true },
        }),
        
        prisma.user.groupBy({
          by: ['subscriptionPlan'],
          where: { deletedAt: null },
          _count: { subscriptionPlan: true },
        }),
        
        prisma.user.count({
          where: {
            deletedAt: null,
            emailVerified: { not: null },
          },
        }),
        
        prisma.user.count({
          where: {
            deletedAt: null,
            lastLoginAt: { gte: thirtyDaysAgo },
          },
        }),
        
        prisma.user.count({
          where: {
            deletedAt: null,
            createdAt: { gte: currentMonth },
          },
        }),
      ])

      // 統計データ整形
      const byRole = Object.values(UserRole).reduce((acc, role) => {
        const found = roleStats.find(item => item.role === role)
        acc[role] = found?._count.role || 0
        return acc
      }, {} as Record<UserRole, number>)

      const bySubscription = Object.values(SubscriptionPlan).reduce((acc, plan) => {
        const found = subscriptionStats.find(item => item.subscriptionPlan === plan)
        acc[plan] = found?._count.subscriptionPlan || 0
        return acc
      }, {} as Record<SubscriptionPlan, number>)

      return {
        total,
        byRole,
        bySubscription,
        verified,
        active,
        newThisMonth,
      }
    } catch (error) {
      console.error('ユーザー統計取得エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'ユーザー統計取得中にエラーが発生しました',
      })
    }
  }

  // トランザクション実行
  static async transaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    try {
      return await prisma.$transaction(callback)
    } catch (error) {
      console.error('トランザクション実行エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'トランザクション実行中にエラーが発生しました',
      })
    }
  }
}

export default UserRepository