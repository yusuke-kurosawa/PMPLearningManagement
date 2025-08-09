/**
 * User Management Router (tRPC)
 * User CRUD operations, profile management, and admin functions
 * 担当: API・データエンジニア, 認証・セキュリティエンジニア
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '@/server/trpc'
import {
  UserService,
  userFilterSchema,
  createUserSchema,
  updateUserSchema,
} from '@/server/services/userService'
import { UserRepository } from '@/server/repositories/userRepository'
import { createPermissionChecker, Permission, requirePermission } from '@/server/auth/rbac'
import { UserRole, SubscriptionPlan } from '@prisma/client'
import { hashPassword } from '@/server/auth/providers'

// 入力検証スキーマ
const getUsersSchema = z.object({
  ...userFilterSchema.shape,
  page: z.number().min(1).optional().default(1),
  pageSize: z.number().min(1).max(100).optional().default(20),
})

const userIdSchema = z.object({
  id: z.string().cuid('有効なユーザーIDを指定してください'),
})

const changeRoleSchema = z.object({
  userId: z.string().cuid('有効なユーザーIDを指定してください'),
  role: z.nativeEnum(UserRole),
})

const batchUpdateSchema = z.object({
  userIds: z.array(z.string().cuid()).min(1).max(50),
  updates: updateUserSchema,
})

const adminCreateUserSchema = createUserSchema.extend({
  sendWelcomeEmail: z.boolean().optional().default(true),
  temporaryPassword: z.boolean().optional().default(false),
})

// ユーザー管理ルーター
export const userRouter = createTRPCRouter({
  // 現在のユーザー情報取得（詳細版）
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await UserRepository.findById(ctx.session.user.id, {
      include: {
        settings: true,
        learningProgress: true,
        subscription: true,
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
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'ユーザーが見つかりません',
      })
    }

    const permissionChecker = createPermissionChecker({
      id: user.id,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionActive:
        user.subscription?.status === 'active' || user.subscriptionPlan === SubscriptionPlan.FREE,
      profileComplete: user.profileComplete,
    })

    return {
      ...user,
      subscriptionActive:
        user.subscription?.status === 'active' || user.subscriptionPlan === SubscriptionPlan.FREE,
      permissions: permissionChecker.getAvailablePermissions(),
      canUseAI: {
        basic: permissionChecker.canUseAI('basic'),
        advanced: permissionChecker.canUseAI('advanced'),
        unlimited: permissionChecker.canUseAI('unlimited'),
      },
    }
  }),

  // ユーザー一覧取得（管理者・インストラクター向け）
  list: protectedProcedure.input(getUsersSchema).query(async ({ input, ctx }) => {
    // 権限チェック
    requirePermission(Permission.USER_READ)(ctx.session.user)

    const result = await UserService.findUsers(
      {
        search: input.search,
        role: input.role,
        subscriptionPlan: input.subscriptionPlan,
        subscriptionActive: input.subscriptionActive,
        emailVerified: input.emailVerified,
        profileComplete: input.profileComplete,
        createdAfter: input.createdAfter,
        createdBefore: input.createdBefore,
        sortBy: input.sortBy,
        sortOrder: input.sortOrder,
        limit: input.pageSize,
        offset: (input.page - 1) * input.pageSize,
      },
      ctx.session.user.id
    )

    return result
  }),

  // ユーザー詳細取得
  getById: protectedProcedure.input(userIdSchema).query(async ({ input, ctx }) => {
    const requestingUser = ctx.session.user
    const checker = createPermissionChecker(requestingUser)

    // 自分の情報または管理権限が必要
    if (input.id !== requestingUser.id && !checker.hasPermission(Permission.USER_READ)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'ユーザー詳細を見る権限がありません',
      })
    }

    const user = await UserService.getUserById(input.id, requestingUser.id)

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'ユーザーが見つかりません',
      })
    }

    // 管理者以外は機密情報を除外
    if (!checker.isAdmin() && input.id !== requestingUser.id) {
      const { hashedPassword, emailVerificationToken, passwordResetToken, ...safeUser } = user
      return safeUser
    }

    return user
  }),

  // プロフィール更新
  updateProfile: protectedProcedure
    .input(updateUserSchema.omit({ role: true, subscriptionPlan: true, subscriptionActive: true }))
    .mutation(async ({ input, ctx }) => {
      const user = await UserService.updateUser(ctx.session.user.id, input, ctx.session.user.id)

      return {
        user,
        message: 'プロフィールが正常に更新されました',
      }
    }),

  // 管理者によるユーザー作成
  create: protectedProcedure.input(adminCreateUserSchema).mutation(async ({ input, ctx }) => {
    // 管理者権限チェック
    requirePermission(Permission.USER_ADMIN)(ctx.session.user)

    const user = await UserService.createUser(
      {
        name: input.name,
        email: input.email,
        password: input.password,
        role: input.role,
        subscriptionPlan: input.subscriptionPlan,
        emailVerified: input.emailVerified,
      },
      ctx.session.user.id
    )

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        createdAt: user.createdAt,
      },
      message: 'ユーザーが正常に作成されました',
    }
  }),

  // 管理者によるユーザー更新
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        data: updateUserSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const requestingUser = ctx.session.user
      const checker = createPermissionChecker(requestingUser)

      // 権限チェック（自分の情報または管理権限）
      if (input.id !== requestingUser.id) {
        // 他人の情報を変更する場合
        if (!checker.hasPermission(Permission.USER_WRITE)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'ユーザー情報を更新する権限がありません',
          })
        }

        // 役割変更は管理者権限が必要
        if (input.data.role && !checker.hasPermission(Permission.USER_ADMIN)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'ユーザーの役割を変更する権限がありません',
          })
        }
      } else {
        // 自分の情報の場合、役割とサブスクリプション情報は変更不可
        const { role, subscriptionPlan, subscriptionActive, ...allowedData } = input.data
        input.data = allowedData
      }

      const user = await UserService.updateUser(input.id, input.data, requestingUser.id)

      return {
        user,
        message: 'ユーザー情報が正常に更新されました',
      }
    }),

  // ユーザー削除（論理削除）
  delete: protectedProcedure.input(userIdSchema).mutation(async ({ input, ctx }) => {
    // 管理者権限チェック
    requirePermission(Permission.USER_DELETE)(ctx.session.user)

    // 自分自身の削除は不可
    if (input.id === ctx.session.user.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: '自分自身のアカウントは削除できません',
      })
    }

    await UserService.deleteUser(input.id, ctx.session.user.id)

    return {
      message: 'ユーザーが正常に削除されました',
    }
  }),

  // 役割変更
  changeRole: protectedProcedure.input(changeRoleSchema).mutation(async ({ input, ctx }) => {
    // 管理者権限チェック
    requirePermission(Permission.USER_ADMIN)(ctx.session.user)

    // 自分自身の役割変更は不可
    if (input.userId === ctx.session.user.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: '自分自身の役割は変更できません',
      })
    }

    const user = await UserService.changeUserRole(input.userId, input.role, ctx.session.user.id)

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: `ユーザーの役割を${input.role}に変更しました`,
    }
  }),

  // バッチ更新
  batchUpdate: protectedProcedure.input(batchUpdateSchema).mutation(async ({ input, ctx }) => {
    // 管理者権限チェック
    requirePermission(Permission.USER_ADMIN)(ctx.session.user)

    // 自分自身を含む場合はエラー
    if (input.userIds.includes(ctx.session.user.id)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: '自分自身を含むバッチ更新はできません',
      })
    }

    const result = await UserService.batchUpdateUsers(
      input.userIds,
      input.updates,
      ctx.session.user.id
    )

    return {
      ...result,
      message: `${result.updated}件のユーザーが更新されました`,
    }
  }),

  // ユーザー統計取得
  stats: protectedProcedure.query(async ({ ctx }) => {
    // 管理者権限チェック
    requirePermission(Permission.USER_ADMIN)(ctx.session.user)

    return await UserService.getUserStats()
  }),

  // ユーザー検索（オートコンプリート用）
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(20).optional().default(10),
        excludeIds: z.array(z.string()).optional().default([]),
      })
    )
    .query(async ({ input, ctx }) => {
      // 基本的な検索権限チェック
      requirePermission(Permission.USER_READ)(ctx.session.user)

      const result = await UserService.findUsers(
        {
          search: input.query,
          limit: input.limit,
          offset: 0,
        },
        ctx.session.user.id
      )

      return {
        users: result.users
          .filter((user) => !input.excludeIds.includes(user.id!))
          .map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          })),
      }
    }),

  // ユーザーの権限情報取得
  permissions: protectedProcedure.input(userIdSchema.optional()).query(async ({ input, ctx }) => {
    const targetUserId = input?.id || ctx.session.user.id
    const requestingUser = ctx.session.user

    // 他人の権限情報を見るには管理者権限が必要
    if (targetUserId !== requestingUser.id) {
      requirePermission(Permission.USER_ADMIN)(requestingUser)
    }

    const user = await UserRepository.findById(targetUserId, {
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

    const userContext = {
      id: user.id,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionActive:
        user.subscription?.status === 'active' || user.subscriptionPlan === SubscriptionPlan.FREE,
      profileComplete: user.profileComplete,
    }

    const checker = createPermissionChecker(userContext)

    return {
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionActive: userContext.subscriptionActive,
      },
      permissions: checker.getAvailablePermissions(),
      roles: {
        isAdmin: checker.isAdmin(),
        isInstructor: checker.isInstructor(),
        isPremiumUser: checker.isPremiumUser(),
        isEnterpriseUser: checker.isEnterpriseUser(),
      },
      aiCapabilities: {
        basic: checker.canUseAI('basic'),
        advanced: checker.canUseAI('advanced'),
        unlimited: checker.canUseAI('unlimited'),
      },
    }
  }),

  // アクティビティログ取得
  activities: protectedProcedure
    .input(
      z.object({
        userId: z.string().cuid().optional(),
        limit: z.number().min(1).max(100).optional().default(20),
        offset: z.number().min(0).optional().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const targetUserId = input.userId || ctx.session.user.id
      const requestingUser = ctx.session.user

      // 他人のアクティビティを見るには管理者権限が必要
      if (targetUserId !== requestingUser.id) {
        requirePermission(Permission.USER_ADMIN)(requestingUser)
      }

      const activities = await prisma.userActivity.findMany({
        where: { userId: targetUserId },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
        skip: input.offset,
        select: {
          id: true,
          action: true,
          details: true,
          createdAt: true,
        },
      })

      const total = await prisma.userActivity.count({
        where: { userId: targetUserId },
      })

      return {
        activities,
        pagination: {
          total,
          limit: input.limit,
          offset: input.offset,
          hasMore: input.offset + input.limit < total,
        },
      }
    }),

  // パスワード強制リセット（管理者機能）
  forcePasswordReset: protectedProcedure.input(userIdSchema).mutation(async ({ input, ctx }) => {
    // 管理者権限チェック
    requirePermission(Permission.USER_ADMIN)(ctx.session.user)

    // 自分自身のパスワードリセットは不可
    if (input.id === ctx.session.user.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: '自分自身のパスワードをリセットすることはできません',
      })
    }

    const user = await UserRepository.findById(input.id)

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'ユーザーが見つかりません',
      })
    }

    // 一時パスワード生成
    const temporaryPassword = Math.random().toString(36).slice(-10)
    const hashedPassword = await hashPassword(temporaryPassword)

    await UserRepository.update(input.id, {
      hashedPassword,
      // 次回ログイン時にパスワード変更を強制
      forcePasswordChange: true,
    })

    // アクティビティ記録
    await prisma.userActivity.create({
      data: {
        userId: ctx.session.user.id,
        action: 'PASSWORD_FORCE_RESET',
        details: {
          targetUserId: input.id,
          targetUserEmail: user.email,
        },
      },
    })

    return {
      temporaryPassword,
      message: 'パスワードがリセットされました。ユーザーに一時パスワードを通知してください。',
    }
  }),
})

export default userRouter
