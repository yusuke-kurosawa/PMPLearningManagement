/**
 * Authentication Providers Configuration
 * NextAuth.js providers setup with Google, GitHub, and Credentials
 * 担当: 認証・セキュリティエンジニア
 */

import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { UserRole, SubscriptionPlan } from '@prisma/client'
import type { DefaultSession } from 'next-auth'
import { logger } from '../../services/logger'

// NextAuth型拡張
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: UserRole
      subscriptionPlan: SubscriptionPlan
      subscriptionActive: boolean
      profileComplete: boolean
    } & DefaultSession['user']
  }

  interface User {
    role: UserRole
    subscriptionPlan: SubscriptionPlan
    subscriptionActive: boolean
    profileComplete: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    subscriptionPlan: SubscriptionPlan
    subscriptionActive: boolean
    profileComplete: boolean
  }
}

// 入力検証スキーマ
const credentialsSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上である必要があります')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'パスワードは大文字、小文字、数字、特殊文字を含む必要があります'
    ),
})

// パスワードハッシュ化ユーティリティ
export const _hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// パスワード検証ユーティリティ
export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

// ユーザー作成ユーティリティ
const createUserWithDefaults = async (userData: {
  email: string
  name?: string | null
  image?: string | null
  hashedPassword?: string
}) => {
  return await prisma.user.create({
    data: {
      email: userData.email,
      name: userData.name,
      image: userData.image,
      hashedPassword: userData.hashedPassword,
      role: UserRole.USER,
      subscriptionPlan: SubscriptionPlan.FREE,
      subscriptionActive: true,
      profileComplete: false,
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
    include: {
      settings: true,
      learningProgress: true,
    },
  })
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,

  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // GitHub OAuth Provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),

    // Email/Password Credentials Provider
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'user@example.com',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials) {
        try {
          // 入力検証
          const validatedCredentials = credentialsSchema.parse(credentials)

          // ユーザー検索
          const user = await prisma.user.findUnique({
            where: {
              email: validatedCredentials.email,
            },
            include: {
              settings: true,
              subscription: true,
            },
          })

          // ユーザーが存在しない、またはパスワードが設定されていない
          if (!user || !user.hashedPassword) {
            return null
          }

          // パスワード検証
          const isValidPassword = await verifyPassword(
            validatedCredentials.password,
            user.hashedPassword
          )

          if (!isValidPassword) {
            return null
          }

          // サブスクリプション状態確認
          const subscriptionActive =
            user.subscription?.status === 'active' ||
            user.subscriptionPlan === SubscriptionPlan.FREE

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            subscriptionPlan: user.subscriptionPlan,
            subscriptionActive,
            profileComplete: user.profileComplete,
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            logger.error('認証エラー:', error)
          }
          return null
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30日
    updateAge: 24 * 60 * 60, // 24時間
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30日
  },

  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },

  callbacks: {
    async signIn({ user, account, _profile, _email, _credentials }) {
      try {
        // OAuth プロバイダーの場合、既存ユーザーをチェック
        if (account?.provider !== 'credentials') {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          // 新規ユーザーの場合、デフォルト設定で作成
          if (!existingUser) {
            await createUserWithDefaults({
              email: user.email!,
              name: user.name,
              image: user.image,
            })
          }
        }

        return true
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          logger.error('サインインエラー:', error)
        }
        return false
      }
    },

    async jwt({ token, user, _account }) {
      // 初回ログイン時
      if (user) {
        token.role = user.role
        token.subscriptionPlan = user.subscriptionPlan
        token.subscriptionActive = user.subscriptionActive
        token.profileComplete = user.profileComplete
      }

      // トークン更新時にユーザー情報を最新化
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            include: {
              subscription: true,
            },
          })

          if (dbUser) {
            token.role = dbUser.role
            token.subscriptionPlan = dbUser.subscriptionPlan
            token.subscriptionActive =
              dbUser.subscription?.status === 'active' ||
              dbUser.subscriptionPlan === SubscriptionPlan.FREE
            token.profileComplete = dbUser.profileComplete
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            logger.error('JWT更新エラー:', error)
          }
        }
      }

      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role
        session.user.subscriptionPlan = token.subscriptionPlan
        session.user.subscriptionActive = token.subscriptionActive
        session.user.profileComplete = token.profileComplete
      }

      return session
    },
  },

  events: {
    async signIn({ user, account, _profile, isNewUser }) {
      // ログイン記録
      await prisma.userActivity.create({
        data: {
          userId: user.id,
          action: 'SIGN_IN',
          details: {
            provider: account?.provider,
            isNewUser,
            ip: null, // Request IPは後でミドルウェアで設定
          },
        },
      })

      if (process.env.NODE_ENV === 'development') {
        logger.debug(`ユーザーサインイン: ${user.email} (${account?.provider})`)
      }
    },

    async signOut({ session, token }) {
      if (token?.sub) {
        // ログアウト記録
        await prisma.userActivity.create({
          data: {
            userId: token.sub,
            action: 'SIGN_OUT',
            details: {
              sessionDuration: null, // 後で計算
            },
          },
        })

        if (process.env.NODE_ENV === 'development') {
          logger.debug(`ユーザーサインアウト: ${session?.user?.email}`)
        }
      }
    },

    async createUser({ user }) {
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`新規ユーザー作成: ${user.email}`)
      }
    },
  },

  debug: process.env.NODE_ENV === 'development',

  logger: {
    error(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        logger.error(`NextAuth Error [${code}]:`, metadata)
      }
    },
    warn(code) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn(`NextAuth Warning [${code}]`)
      }
    },
    debug(_code, _metadata) {
      if (process.env.NODE_ENV === 'development') {
        // デバッグ情報は開発環境でのみログ出力
        logger.debug(`NextAuth Debug [${_code}]:`, _metadata)
      }
    },
  },
}

// サーバーサイド認証ヘルパー
// export const _getServerAuthSession = async (req: unknown, res: unknown) => { // TODO: Will be used in future
//   // サーバーサイドでの認証状態取得
//   // 実装は使用するフレームワークによって異なる
// }

// 認証状態検証ヘルパー
export const requireAuth = (session: unknown) => {
  if (!session?.user) {
    throw new Error('認証が必要です')
  }
  return session
}

// 管理者権限検証ヘルパー
export const _requireAdmin = (session: unknown) => {
  const user = requireAuth(session).user
  if (user.role !== UserRole.ADMIN) {
    throw new Error('管理者権限が必要です')
  }
  return session
}

// プレミアム権限検証ヘルパー
export const _requirePremium = (session: unknown) => {
  const user = requireAuth(session).user
  if (user.subscriptionPlan === SubscriptionPlan.FREE || !user.subscriptionActive) {
    throw new Error('プレミアムプランが必要です')
  }
  return session
}

export default authOptions
