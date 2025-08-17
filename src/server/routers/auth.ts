/**
 * Authentication Router (tRPC)
 * User authentication, registration, and session management
 * 担当: 認証・セキュリティエンジニア, リード
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '@/server/trpc'
import { prisma } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/server/auth/providers'
import { logger } from '../../services/logger'
// import { createPermissionChecker, Permission } from '@/server/auth/rbac' // TODO: Will be used in future
import { UserRole, SubscriptionPlan } from '@prisma/client'
import { RateLimiterMemory } from 'rate-limiter-flexible'
import crypto from 'crypto'
import { sendEmail } from '@/server/services/emailService'

// レート制限
const signUpRateLimiter = new RateLimiterMemory({
  keyPrefix: 'signup',
  points: 3, // 3回の登録試行
  duration: 3600, // 1時間
})

const passwordResetRateLimiter = new RateLimiterMemory({
  keyPrefix: 'password_reset',
  points: 5, // 5回のリセット試行
  duration: 3600, // 1時間
})

// 入力検証スキーマ
const signUpSchema = z.object({
  name: z
    .string()
    .min(2, '名前は2文字以上である必要があります')
    .max(50, '名前は50文字以下である必要があります')
    .regex(
      /^[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s]+$/,
      '有効な文字を使用してください'
    ),
  email: z.string().email('有効なメールアドレスを入力してください').toLowerCase(),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上である必要があります')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'パスワードは大文字、小文字、数字、特殊文字を含む必要があります'
    ),
  agreeToTerms: z.boolean().refine((val) => val === true, '利用規約に同意する必要があります'),
})

const __signInSchema = z.object({
  // TODO: Will be used in future
  email: z.string().email('有効なメールアドレスを入力してください').toLowerCase(),
  password: z.string().min(1, 'パスワードを入力してください'),
  remember: z.boolean().optional().default(false),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, '現在のパスワードを入力してください'),
  newPassword: z
    .string()
    .min(8, '新しいパスワードは8文字以上である必要があります')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      '新しいパスワードは大文字、小文字、数字、特殊文字を含む必要があります'
    ),
})

const passwordResetSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください').toLowerCase(),
})

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'リセットトークンが必要です'),
  newPassword: z
    .string()
    .min(8, 'パスワードは8文字以上である必要があります')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'パスワードは大文字、小文字、数字、特殊文字を含む必要があります'
    ),
})

const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, '名前は2文字以上である必要があります')
    .max(50, '名前は50文字以下である必要があります')
    .optional(),
  bio: z.string().max(500, '自己紹介は500文字以下である必要があります').optional(),
  location: z.string().max(100, '所在地は100文字以下である必要があります').optional(),
  website: z.string().url('有効なURLを入力してください').optional().or(z.literal('')),
  linkedIn: z.string().url('有効なLinkedIn URLを入力してください').optional().or(z.literal('')),
  twitter: z
    .string()
    .regex(/^@?[A-Za-z0-9_]{1,15}$/, '有効なTwitterユーザー名を入力してください')
    .optional()
    .or(z.literal('')),
})

// ユーティリティ関数
const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex')
}

const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex')
}

// メイン認証ルーター
export const authRouter = createTRPCRouter({
  // ユーザー登録
  signUp: publicProcedure.input(signUpSchema).mutation(async ({ input, ctx }) => {
    const clientIP = ctx.req?.headers['x-forwarded-for'] || ctx.req?.ip || 'unknown'

    try {
      // レート制限チェック
      await signUpRateLimiter.consume(clientIP as string)

      // 既存ユーザーチェック
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      })

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'このメールアドレスは既に登録されています',
        })
      }

      // パスワードハッシュ化
      const hashedPassword = await hashPassword(input.password)

      // 確認トークン生成
      const verificationToken = generateVerificationToken()
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24時間

      // ユーザー作成
      const user = await prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          hashedPassword,
          role: UserRole.USER,
          subscriptionPlan: SubscriptionPlan.FREE,
          subscriptionActive: true,
          profileComplete: false,
          emailVerificationToken: verificationToken,
          emailVerificationExpires: verificationExpires,
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
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      })

      // 確認メール送信
      try {
        await sendEmail({
          to: user.email,
          subject: 'PMP Learning Management - メール確認',
          template: 'email-verification',
          data: {
            name: user.name,
            verificationLink: `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`,
            expiresAt: verificationExpires,
          },
        })
      } catch (emailError) {
        if (process.env.NODE_ENV === 'development') {
          logger.error('確認メール送信エラー:', emailError)
        }
        // メール送信失敗でもユーザー作成は継続
      }

      // アクティビティ記録
      await prisma.userActivity.create({
        data: {
          userId: user.id,
          action: 'SIGN_UP',
          details: {
            ip: clientIP,
            userAgent: ctx.req?.headers['user-agent'],
          },
        },
      })

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        message: '登録が完了しました。確認メールをご確認ください。',
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      if (process.env.NODE_ENV === 'development') {
        logger.error('ユーザー登録エラー:', error)
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '登録処理中にエラーが発生しました',
      })
    }
  }),

  // メール確認
  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const user = await prisma.user.findFirst({
          where: {
            emailVerificationToken: input.token,
            emailVerificationExpires: {
              gt: new Date(),
            },
          },
        })

        if (!user) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '無効または期限切れの確認トークンです',
          })
        }

        // メール確認完了
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: new Date(),
            emailVerificationToken: null,
            emailVerificationExpires: null,
          },
        })

        // アクティビティ記録
        await prisma.userActivity.create({
          data: {
            userId: user.id,
            action: 'EMAIL_VERIFIED',
            details: {},
          },
        })

        return {
          message: 'メールアドレスの確認が完了しました',
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        if (process.env.NODE_ENV === 'development') {
          logger.error('メール確認エラー:', error)
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'メール確認処理中にエラーが発生しました',
        })
      }
    }),

  // パスワードリセット要求
  requestPasswordReset: publicProcedure
    .input(passwordResetSchema)
    .mutation(async ({ input, ctx }) => {
      const clientIP = ctx.req?.headers['x-forwarded-for'] || ctx.req?.ip || 'unknown'

      try {
        // レート制限チェック
        await passwordResetRateLimiter.consume(clientIP as string)

        const user = await prisma.user.findUnique({
          where: { email: input.email },
        })

        // セキュリティのため、ユーザーが存在しない場合でも成功レスポンスを返す
        if (!user) {
          return {
            message: 'パスワードリセット手順をメールで送信しました（該当するアカウントがある場合）',
          }
        }

        // リセットトークン生成
        const resetToken = generateResetToken()
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1時間

        await prisma.user.update({
          where: { id: user.id },
          data: {
            passwordResetToken: resetToken,
            passwordResetExpires: resetExpires,
          },
        })

        // リセットメール送信
        try {
          await sendEmail({
            to: user.email,
            subject: 'PMP Learning Management - パスワードリセット',
            template: 'password-reset',
            data: {
              name: user.name,
              resetLink: `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`,
              expiresAt: resetExpires,
            },
          })
        } catch (emailError) {
          if (process.env.NODE_ENV === 'development') {
            logger.error('パスワードリセットメール送信エラー:', emailError)
          }
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'メール送信中にエラーが発生しました',
          })
        }

        // アクティビティ記録
        await prisma.userActivity.create({
          data: {
            userId: user.id,
            action: 'PASSWORD_RESET_REQUESTED',
            details: {
              ip: clientIP,
            },
          },
        })

        return {
          message: 'パスワードリセット手順をメールで送信しました',
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        if (process.env.NODE_ENV === 'development') {
          logger.error('パスワードリセット要求エラー:', error)
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'パスワードリセット処理中にエラーが発生しました',
        })
      }
    }),

  // パスワードリセット実行
  resetPassword: publicProcedure.input(resetPasswordSchema).mutation(async ({ input }) => {
    try {
      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: input.token,
          passwordResetExpires: {
            gt: new Date(),
          },
        },
      })

      if (!user) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '無効または期限切れのリセットトークンです',
        })
      }

      // 新しいパスワードをハッシュ化
      const hashedPassword = await hashPassword(input.newPassword)

      // パスワード更新
      await prisma.user.update({
        where: { id: user.id },
        data: {
          hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      })

      // アクティビティ記録
      await prisma.userActivity.create({
        data: {
          userId: user.id,
          action: 'PASSWORD_RESET_COMPLETED',
          details: {},
        },
      })

      return {
        message: 'パスワードが正常に変更されました',
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      if (process.env.NODE_ENV === 'development') {
        logger.error('パスワードリセットエラー:', error)
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'パスワードリセット処理中にエラーが発生しました',
      })
    }
  }),

  // 現在のユーザー情報取得
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.session.user.id },
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
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      bio: user.bio,
      location: user.location,
      website: user.website,
      linkedIn: user.linkedIn,
      twitter: user.twitter,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionActive:
        user.subscription?.status === 'active' || user.subscriptionPlan === SubscriptionPlan.FREE,
      profileComplete: user.profileComplete,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      settings: user.settings,
      learningProgress: user.learningProgress,
      subscription: user.subscription,
      stats: {
        examResults: user._count.examResults,
        collaborationPosts: user._count.collaborationPosts,
        studyGroups: user._count.studyGroups,
      },
      permissions: permissionChecker.getAvailablePermissions(),
    }
  }),

  // プロフィール更新
  updateProfile: protectedProcedure.input(updateProfileSchema).mutation(async ({ input, ctx }) => {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          ...input,
          profileComplete: true,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          bio: true,
          location: true,
          website: true,
          linkedIn: true,
          twitter: true,
          profileComplete: true,
          updatedAt: true,
        },
      })

      // アクティビティ記録
      await prisma.userActivity.create({
        data: {
          userId: ctx.session.user.id,
          action: 'PROFILE_UPDATED',
          details: {
            updatedFields: Object.keys(input),
          },
        },
      })

      return {
        user: updatedUser,
        message: 'プロフィールが更新されました',
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('プロフィール更新エラー:', error)
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'プロフィール更新中にエラーが発生しました',
      })
    }
  }),

  // パスワード変更
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { id: true, hashedPassword: true },
        })

        if (!user || !user.hashedPassword) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'パスワードが設定されていません',
          })
        }

        // 現在のパスワード確認
        const isCurrentPasswordValid = await verifyPassword(
          input.currentPassword,
          user.hashedPassword
        )

        if (!isCurrentPasswordValid) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: '現在のパスワードが正しくありません',
          })
        }

        // 新しいパスワードをハッシュ化
        const hashedPassword = await hashPassword(input.newPassword)

        // パスワード更新
        await prisma.user.update({
          where: { id: user.id },
          data: { hashedPassword },
        })

        // アクティビティ記録
        await prisma.userActivity.create({
          data: {
            userId: user.id,
            action: 'PASSWORD_CHANGED',
            details: {},
          },
        })

        return {
          message: 'パスワードが正常に変更されました',
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        if (process.env.NODE_ENV === 'development') {
          logger.error('パスワード変更エラー:', error)
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'パスワード変更中にエラーが発生しました',
        })
      }
    }),

  // アカウント削除
  deleteAccount: protectedProcedure
    .input(z.object({ password: z.string().min(1, 'パスワードを入力してください') }))
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { id: true, hashedPassword: true, email: true, name: true },
        })

        if (!user || !user.hashedPassword) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'ユーザーが見つかりません',
          })
        }

        // パスワード確認
        const isPasswordValid = await verifyPassword(input.password, user.hashedPassword)

        if (!isPasswordValid) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'パスワードが正しくありません',
          })
        }

        // アカウント削除前の記録
        await prisma.userActivity.create({
          data: {
            userId: user.id,
            action: 'ACCOUNT_DELETED',
            details: {
              email: user.email,
              name: user.name,
            },
          },
        })

        // 関連データの削除（カスケード削除設定により自動的に削除される）
        await prisma.user.delete({
          where: { id: user.id },
        })

        // 削除確認メール送信
        try {
          await sendEmail({
            to: user.email,
            subject: 'PMP Learning Management - アカウント削除完了',
            template: 'account-deleted',
            data: {
              name: user.name,
              deletedAt: new Date(),
            },
          })
        } catch (emailError) {
          if (process.env.NODE_ENV === 'development') {
            logger.error('アカウント削除確認メール送信エラー:', emailError)
          }
          // メール送信失敗でもアカウント削除は継続
        }

        return {
          message: 'アカウントが正常に削除されました',
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        if (process.env.NODE_ENV === 'development') {
          logger.error('アカウント削除エラー:', error)
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'アカウント削除中にエラーが発生しました',
        })
      }
    }),

  // セッション情報取得
  getSession: protectedProcedure.query(async ({ ctx }) => {
    return {
      user: ctx.session.user,
      expires: ctx.session.expires,
    }
  }),

  // ユーザーアクティビティ取得
  getActivity: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(20),
        offset: z.number().min(0).optional().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const activities = await prisma.userActivity.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
        skip: input.offset,
      })

      const total = await prisma.userActivity.count({
        where: { userId: ctx.session.user.id },
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
})

export default authRouter
