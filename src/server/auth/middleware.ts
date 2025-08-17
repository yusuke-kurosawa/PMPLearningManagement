/**
 * 認証・認可システム実装
 * Developer 1: 包括的認可システム（RBAC）実装
 * セキュリティレベル: Critical
 * 依存関係: Supabase, JWT, React
 * 最終更新: {updated}
 */

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { RateLimiterMemory } from 'rate-limiter-flexible'
import { z } from 'zod'
import { UserRole } from '@prisma/client'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

// レート制限設定
const authRateLimiter = new RateLimiterMemory({
  keyPrefix: 'auth_fail',
  points: 5, // 5回の試行
  duration: 300, // 5分間
})

const apiRateLimiter = new RateLimiterMemory({
  keyPrefix: 'api_call',
  points: 100, // 100リクエスト
  duration: 60, // 1分間
})

const premiumRateLimiter = new RateLimiterMemory({
  keyPrefix: 'premium_api',
  points: 1000, // プレミアムユーザーは1000リクエスト
  duration: 60, // 1分間
})

// IPアドレス取得ヘルパー
const getClientIP = (request: NextRequest): string => {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  return real || request.ip || 'unknown'
}

// セキュリティヘッダー設定
const setSecurityHeaders = (response: NextResponse): NextResponse => {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "connect-src 'self' https://api.stripe.com wss:; " +
      'frame-src https://js.stripe.com;'
  )

  // その他のセキュリティヘッダー
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
}

// 認証が必要なルートの定義
const protectedRoutes = [
  '/dashboard',
  '/progress',
  '/collaboration',
  '/api/user',
  '/api/learning',
  '/api/exam',
]

// 管理者専用ルートの定義
const adminRoutes = ['/admin', '/api/admin']

// プレミアム機能ルートの定義
const premiumRoutes = ['/api/ai', '/api/analytics/advanced', '/collaboration/advanced']

// 認証不要なルートの定義
const publicRoutes = ['/', '/auth', '/pmbok', '/glossary', '/api/health', '/api/auth']

// ルートマッチング関数
const matchRoute = (pathname: string, routes: string[]): boolean => {
  return routes.some((route) => pathname.startsWith(route))
}

// レート制限チェック
const checkRateLimit = async (
  ip: string,
  isAuthenticated: boolean,
  isPremium: boolean
): Promise<{ success: boolean; resetTime?: Date }> => {
  try {
    let rateLimiter = apiRateLimiter

    // プレミアムユーザーはより多くのリクエストを許可
    if (isAuthenticated && isPremium) {
      rateLimiter = premiumRateLimiter
    }

    await rateLimiter.consume(ip)
    return { success: true }
  } catch (rejRes: any) {
    const resetTime = new Date(Date.now() + rejRes.msBeforeNext)
    return { success: false, resetTime }
  }
}

// 認証失敗時のレート制限
const checkAuthFailureLimit = async (ip: string): Promise<boolean> => {
  try {
    await authRateLimiter.consume(ip)
    return true
  } catch {
    return false
  }
}

// メイン認証ミドルウェア
export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const clientIP = getClientIP(request)

  try {
    // Enhanced JWT トークン取得と検証
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    // JWT の詳細検証
    if (token) {
      const jwtValidation = await validateJWT(request)
      if (!jwtValidation.isValid) {
        const response = NextResponse.json(
          {
            error: 'Invalid Token',
            message: 'JWTトークンが無効です',
            reason: jwtValidation.reason,
          },
          { status: 401 }
        )
        return setSecurityHeaders(response)
      }
    }

    const isAuthenticated = !!token
    const userRole = token?.role as UserRole
    const subscriptionPlan = token?.subscriptionPlan as string
    const subscriptionActive = token?.subscriptionActive as boolean
    const isPremium = subscriptionPlan !== 'FREE' && subscriptionActive

    // レート制限チェック（認証失敗時は別途チェック）
    if (!matchRoute(pathname, ['/api/auth/signin', '/api/auth/signup'])) {
      const rateLimitResult = await checkRateLimit(clientIP, isAuthenticated, isPremium)

      if (!rateLimitResult.success) {
        const response = NextResponse.json(
          {
            error: 'Too Many Requests',
            message: 'レート制限に達しました',
            resetTime: rateLimitResult.resetTime,
          },
          { status: 429 }
        )
        return setSecurityHeaders(response)
      }
    }

    // 認証が必要なルートのチェック
    if (matchRoute(pathname, protectedRoutes)) {
      if (!isAuthenticated) {
        // 認証失敗のレート制限
        const canProceed = await checkAuthFailureLimit(clientIP)
        if (!canProceed) {
          const response = NextResponse.json(
            {
              error: 'Too Many Authentication Attempts',
              message: '認証試行回数が上限に達しました。しばらくお待ちください。',
            },
            { status: 429 }
          )
          return setSecurityHeaders(response)
        }

        // 認証ページにリダイレクト
        const signInUrl = new URL('/auth/signin', request.url)
        signInUrl.searchParams.set('callbackUrl', pathname)
        const response = NextResponse.redirect(signInUrl)
        return setSecurityHeaders(response)
      }
    }

    // 管理者専用ルートのチェック
    if (matchRoute(pathname, adminRoutes)) {
      if (!isAuthenticated || userRole !== UserRole.ADMIN) {
        const response = NextResponse.json(
          {
            error: 'Forbidden',
            message: '管理者権限が必要です',
          },
          { status: 403 }
        )
        return setSecurityHeaders(response)
      }
    }

    // プレミアム機能ルートのチェック
    if (matchRoute(pathname, premiumRoutes)) {
      if (!isAuthenticated) {
        const response = NextResponse.json(
          {
            error: 'Unauthorized',
            message: '認証が必要です',
          },
          { status: 401 }
        )
        return setSecurityHeaders(response)
      }

      if (!isPremium) {
        const response = NextResponse.json(
          {
            error: 'Subscription Required',
            message: 'プレミアムプランが必要です',
            subscriptionPlan,
            subscriptionActive,
          },
          { status: 402 }
        )
        return setSecurityHeaders(response)
      }
    }

    // リクエストヘッダーにユーザー情報を追加（API routes用）
    const requestHeaders = new Headers(request.headers)
    if (token) {
      requestHeaders.set('x-user-id', token.sub || '')
      requestHeaders.set('x-user-role', userRole || '')
      requestHeaders.set('x-user-plan', subscriptionPlan || '')
      requestHeaders.set('x-user-active', subscriptionActive?.toString() || 'false')
    }
    requestHeaders.set('x-client-ip', clientIP)

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    return setSecurityHeaders(response)
  } catch (error) {
    console.error('認証ミドルウェアエラー:', error)

    const response = NextResponse.json(
      {
        error: 'Internal Server Error',
        message: '認証処理中にエラーが発生しました',
      },
      { status: 500 }
    )

    return setSecurityHeaders(response)
  }
}

// CSRFトークン生成
export const generateCSRFToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// CSRFトークン検証
export const verifyCSRFToken = (token: string, sessionToken: string): boolean => {
  // 実際の実装では、より安全な検証ロジックを実装
  return token && sessionToken && token.length > 10
}

// API エンドポイント用認証デコレータ
export const withAuth = (
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean
    requireAdmin?: boolean
    requirePremium?: boolean
  } = {}
) => {
  return async (req: NextRequest, context: any) => {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })

    // 認証チェック
    if (options.requireAuth && !token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: '認証が必要です' },
        { status: 401 }
      )
    }

    // 管理者権限チェック
    if (options.requireAdmin && token?.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden', message: '管理者権限が必要です' },
        { status: 403 }
      )
    }

    // プレミアム権限チェック
    if (options.requirePremium) {
      const isPremium = token?.subscriptionPlan !== 'FREE' && token?.subscriptionActive

      if (!isPremium) {
        return NextResponse.json(
          { error: 'Subscription Required', message: 'プレミアムプランが必要です' },
          { status: 402 }
        )
      }
    }

    // コンテキストにユーザー情報を追加
    const enrichedContext = {
      ...context,
      user: token
        ? {
            id: token.sub,
            email: token.email,
            name: token.name,
            role: token.role,
            subscriptionPlan: token.subscriptionPlan,
            subscriptionActive: token.subscriptionActive,
          }
        : null,
    }

    return handler(req, enrichedContext)
  }
}

// ミドルウェア設定（next.config.js で使用）
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

// JWT検証関数
interface JWTValidation {
  isValid: boolean
  reason?: string
  decoded?: any
}

export const validateJWT = async (request: NextRequest): Promise<JWTValidation> => {
  try {
    const authHeader = request.headers.get('authorization')
    const cookieToken =
      request.cookies.get('next-auth.session-token')?.value ||
      request.cookies.get('__Secure-next-auth.session-token')?.value

    let token: string | undefined

    // Bearer token または Cookie から JWT を取得
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else if (cookieToken) {
      token = cookieToken
    }

    if (!token) {
      return { isValid: false, reason: 'No token provided' }
    }

    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      return { isValid: false, reason: 'JWT secret not configured' }
    }

    // JWT検証
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
      maxAge: '24h', // 24時間の有効期限
      clockTolerance: 30, // 30秒のクロックスキュー許容
    })

    // 追加のセキュリティチェック
    if (typeof decoded === 'object' && decoded !== null) {
      const now = Math.floor(Date.now() / 1000)

      // 期限切れチェック（念のため）
      if (decoded.exp && decoded.exp < now) {
        return { isValid: false, reason: 'Token expired' }
      }

      // 発行時刻チェック（未来の時刻でないこと）
      if (decoded.iat && decoded.iat > now + 60) {
        return { isValid: false, reason: 'Token issued in the future' }
      }

      // issuer チェック（設定されている場合）
      if (process.env.JWT_ISSUER && decoded.iss !== process.env.JWT_ISSUER) {
        return { isValid: false, reason: 'Invalid issuer' }
      }

      return { isValid: true, decoded }
    }

    return { isValid: false, reason: 'Invalid token format' }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { isValid: false, reason: 'Token expired' }
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { isValid: false, reason: 'Invalid token signature' }
    }
    if (error instanceof jwt.NotBeforeError) {
      return { isValid: false, reason: 'Token not active yet' }
    }

    console.error('JWT validation error:', error)
    return { isValid: false, reason: 'Token validation failed' }
  }
}

// セキュアなランダム文字列生成
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex')
}

// HMAC署名検証（Webhook用）
export const verifyHMACSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  try {
    const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex')

    // タイミング攻撃防止のための定数時間比較
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  } catch {
    return false
  }
}

export default authMiddleware
