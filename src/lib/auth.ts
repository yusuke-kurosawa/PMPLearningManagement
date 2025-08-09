import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import type { User } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      image: string | null
      role: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
    newUser: '/dashboard',
  },
  providers: [
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
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('メールアドレスとパスワードを入力してください')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            password: true,
          },
        })

        if (!user || !user.password) {
          throw new Error('メールアドレスまたはパスワードが正しくありません')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error('メールアドレスまたはパスワードが正しくありません')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role || 'USER'
      }

      // Refresh access token for OAuth providers
      if (account?.provider === 'google') {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.accessTokenExpires = account.expires_at
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Allow OAuth sign in without email verification
      if (account?.provider !== 'credentials') {
        return true
      }

      // For credentials provider, check if email is verified
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
      })

      if (!existingUser?.emailVerified) {
        // You can redirect to email verification page
        return '/auth/verify-email'
      }

      return true
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      // Log sign in event
      console.log(`User ${user.email} signed in via ${account?.provider}`)

      // Track user activity
      if (user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        })
      }
    },
    async signOut({ session, token }) {
      // Log sign out event
      console.log(`User signed out`)
    },
    async createUser({ user }) {
      // Send welcome email
      console.log(`New user created: ${user.email}`)

      // Initialize user progress
      const pmbokProcesses = await prisma.pMBOKProcess.findMany()

      if (pmbokProcesses.length > 0) {
        await prisma.learningProgress.createMany({
          data: pmbokProcesses.map((process) => ({
            userId: user.id,
            processId: process.id,
            status: 'NOT_STARTED',
            masteryLevel: 0,
            totalStudyTime: 0,
          })),
        })
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

/**
 * Wrapper for getServerSession to use with our auth options
 */
import { getServerSession as getNextAuthServerSession } from 'next-auth'

export async function getServerSession() {
  return await getNextAuthServerSession(authOptions)
}

/**
 * Wrapper for protecting API routes
 */
export async function getAuthenticatedUser() {
  const session = await getServerSession()

  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  return session.user
}

/**
 * Check if user has required role
 */
export async function requireRole(requiredRole: 'USER' | 'PREMIUM' | 'ADMIN') {
  const user = await getAuthenticatedUser()

  const roleHierarchy = {
    USER: 0,
    PREMIUM: 1,
    ADMIN: 2,
  }

  if (roleHierarchy[user.role as keyof typeof roleHierarchy] < roleHierarchy[requiredRole]) {
    throw new Error('Insufficient permissions')
  }

  return user
}
