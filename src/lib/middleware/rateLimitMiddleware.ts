/**
 * Next.js API Routes用 Rate Limiting ミドルウェア
 * Developer 3: API Rate Limiting・DDoS防止・Redis実装
 */

import { NextRequest, NextResponse } from 'next/server'
import {
import { logger } from '../../services/logger'
  slidingWindowLimiter,
  ddosProtection,
  type RateLimitConfig,
} from '@/lib/security/rateLimiting'
// import { z } from 'zod' // TODO: Will be used in future

// レート制限設定の種類
export enum RateLimitType {
  STRICT = 'strict', // 厳格（ログイン、パスワードリセットなど）
  NORMAL = 'normal', // 通常のAPI
  LENIENT = 'lenient', // 緩い（静的リソース、読み取り専用など）
  PREMIUM = 'premium', // プレミアムユーザー用
  ADMIN = 'admin', // 管理者用
}

// 事前定義されたレート制限設定
const RATE_LIMIT_CONFIGS: Record<RateLimitType, RateLimitConfig[]> = {
  [RateLimitType.STRICT]: [
    { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 15分間に5回
    { windowMs: 60 * 60 * 1000, maxRequests: 10 }, // 1時間に10回
  ],
  [RateLimitType.NORMAL]: [
    { windowMs: 60 * 1000, maxRequests: 100 }, // 1分間に100回
    { windowMs: 15 * 60 * 1000, maxRequests: 1000 }, // 15分間に1000回
  ],
  [RateLimitType.LENIENT]: [
    { windowMs: 60 * 1000, maxRequests: 300 }, // 1分間に300回
    { windowMs: 15 * 60 * 1000, maxRequests: 5000 }, // 15分間に5000回
  ],
  [RateLimitType.PREMIUM]: [
    { windowMs: 60 * 1000, maxRequests: 500 }, // 1分間に500回
    { windowMs: 15 * 60 * 1000, maxRequests: 10000 }, // 15分間に10000回
  ],
  [RateLimitType.ADMIN]: [
    { windowMs: 60 * 1000, maxRequests: 1000 }, // 1分間に1000回
    { windowMs: 15 * 60 * 1000, maxRequests: 20000 }, // 15分間に20000回
  ],
}

// Rate Limit オプション
export interface RateLimitOptions {
  type: RateLimitType
  customConfig?: RateLimitConfig[]
  keyGenerator?: (req: NextRequest) => string
  skipIf?: (req: NextRequest) => Promise<boolean>
  onLimitReached?: (req: NextRequest, identifier: string) => void
  enableDDoSProtection?: boolean
  whitelist?: string[] // 除外するIP一覧
}

// クライアント識別子生成
const defaultKeyGenerator = (req: NextRequest): string => {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const remoteAddr = forwarded?.split(',')[0] || realIp || req.ip || 'unknown'

  // 認証ユーザーの場合はユーザーIDも含める
  const userId = req.headers.get('x-user-id')
  if (userId) {
    return `${remoteAddr}:${userId}`
  }

  return remoteAddr
}

// User-Agent解析
// const _parseUserAgent = ( // TODO: Will be used in future
  userAgent: string | null
): {
  isMobile: boolean
  isBot: boolean
  browser: string
  os: string
} => {
  if (!userAgent) {
    return { isMobile: false, isBot: true, browser: 'unknown', os: 'unknown' }
  }

  const ua = userAgent.toLowerCase()

  return {
    isMobile: /mobile|android|iphone|ipad/.test(ua),
    isBot: /bot|crawler|spider|scraper|curl|wget/.test(ua),
    browser: ua.includes('chrome')
      ? 'chrome'
      : ua.includes('firefox')
        ? 'firefox'
        : ua.includes('safari')
          ? 'safari'
          : 'other',
    os: ua.includes('windows')
      ? 'windows'
      : ua.includes('mac')
        ? 'mac'
        : ua.includes('linux')
          ? 'linux'
          : ua.includes('android')
            ? 'android'
            : ua.includes('ios')
              ? 'ios'
              : 'other',
  }
}

/**
 * Rate Limiting ミドルウェア関数
 */
export function withRateLimit(options: RateLimitOptions) {
  return async function rateLimitMiddleware(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      const identifier = options.keyGenerator?.(request) || defaultKeyGenerator(request)
      const userAgent = request.headers.get('user-agent')
      const userId = request.headers.get('x-user-id')

      // スキップ条件チェック
      if (options.skipIf && (await options.skipIf(request))) {
        return handler(request)
      }

      // ホワイトリストチェック
      if (options.whitelist) {
        const clientIp = identifier.split(':')[0]
        if (options.whitelist.includes(clientIp)) {
          return handler(request)
        }
      }

      // DDoS保護チェック
      if (options.enableDDoSProtection) {
        const ddosResult = await ddosProtection.checkProtection(
          identifier.split(':')[0], // IP部分のみ
          userAgent || undefined,
          userId || undefined
        )

        if (!ddosResult.allowed) {
          return NextResponse.json(
            {
              error: 'Request Blocked',
              message: ddosResult.reason,
              recommendations: ddosResult.recommendations,
              retryAfter: ddosResult.blockDuration,
            },
            {
              status: 429,
              headers: {
                'Retry-After': ddosResult.blockDuration?.toString() || '60',
                'X-RateLimit-Blocked-Reason': ddosResult.reason || 'DDoS Protection',
              },
            }
          )
        }
      }

      // 設定されたレート制限をチェック
      const configs = options.customConfig || RATE_LIMIT_CONFIGS[options.type]
      const results = await slidingWindowLimiter.checkMultipleLimit(
        identifier,
        configs.map((config, index) => ({ name: `limit_${index}`, config }))
      )

      // いずれかの制限に引っかかった場合
      const failedLimit = Object.values(results).find((result) => !result.success)

      if (failedLimit) {
        // リミット到達時のコールバック
        options.onLimitReached?.(request, identifier)

        // IP reputation更新（失敗として記録）
        if (options.enableDDoSProtection) {
          await ddosProtection.updateIpReputation(identifier.split(':')[0], false, {
            userAgent: userAgent || undefined,
            endpoint: request.nextUrl.pathname,
          })
        }

        return NextResponse.json(
          {
            error: 'Too Many Requests',
            message: 'レート制限に達しました。しばらくお待ちください。',
            limit: failedLimit.limit,
            remaining: failedLimit.remaining,
            resetTime: failedLimit.resetTime,
            retryAfter: failedLimit.retryAfter,
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': failedLimit.limit.toString(),
              'X-RateLimit-Remaining': failedLimit.remaining.toString(),
              'X-RateLimit-Reset': failedLimit.resetTime.getTime().toString(),
              'Retry-After': failedLimit.retryAfter?.toString() || '60',
            },
          }
        )
      }

      // リクエスト成功
      const response = await handler(request)

      // IP reputation更新（成功として記録）
      if (options.enableDDoSProtection && response.status < 400) {
        await ddosProtection.updateIpReputation(identifier.split(':')[0], true, {
          userAgent: userAgent || undefined,
          endpoint: request.nextUrl.pathname,
        })
      }

      // レート制限情報をレスポンスヘッダーに追加
      const primaryResult = results.limit_0 // 最初の制限を主要な制限として使用
      if (primaryResult) {
        response.headers.set('X-RateLimit-Limit', primaryResult.limit.toString())
        response.headers.set('X-RateLimit-Remaining', primaryResult.remaining.toString())
        response.headers.set('X-RateLimit-Reset', primaryResult.resetTime.getTime().toString())
      }

      return response
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Rate limiting middleware error:', error)
      }
      // エラー時はリクエストを通す
      return handler(request)
    }
  }
}

/**
 * 特定のエンドポイント向けの事前設定されたミドルウェア
 */

// ログイン/認証エンドポイント用
export const withAuthRateLimit = withRateLimit({
  type: RateLimitType.STRICT,
  enableDDoSProtection: true,
  onLimitReached: (req, identifier) => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Auth rate limit reached for ${identifier} at ${req.nextUrl.pathname}`)
    }
  },
})

// API エンドポイント用
export const withApiRateLimit = withRateLimit({
  type: RateLimitType.NORMAL,
  enableDDoSProtection: true,
})

// 静的リソース・読み取り専用エンドポイント用
export const withLenientRateLimit = withRateLimit({
  type: RateLimitType.LENIENT,
  enableDDoSProtection: false,
})

// プレミアムユーザー用
export const withPremiumRateLimit = withRateLimit({
  type: RateLimitType.PREMIUM,
  enableDDoSProtection: true,
  skipIf: async (req) => {
    // プレミアムユーザーかチェック
    const userPlan = req.headers.get('x-user-plan')
    const userActive = req.headers.get('x-user-active')
    return userPlan === 'PREMIUM' || (userPlan === 'ENTERPRISE' && userActive === 'true')
  },
})

/**
 * 動的Rate Limit設定（管理者用API）
 */
export class DynamicRateLimitManager {
  private customConfigs = new Map<string, RateLimitConfig[]>()

  /**
   * 特定のエンドポイントまたはユーザーにカスタム制限を設定
   */
  setCustomLimit(
    key: string, // endpoint:/api/users または user:user123
    configs: RateLimitConfig[]
  ): void {
    this.customConfigs.set(key, configs)
  }

  /**
   * カスタム制限を取得
   */
  getCustomLimit(key: string): RateLimitConfig[] | undefined {
    return this.customConfigs.get(key)
  }

  /**
   * カスタム制限を削除
   */
  removeCustomLimit(key: string): boolean {
    return this.customConfigs.delete(key)
  }

  /**
   * すべてのカスタム制限を取得
   */
  getAllCustomLimits(): Array<{ key: string; configs: RateLimitConfig[] }> {
    return Array.from(this.customConfigs.entries()).map(([key, configs]) => ({
      key,
      configs,
    }))
  }

  /**
   * 動的レート制限ミドルウェア
   */
  createDynamicMiddleware(baseOptions: RateLimitOptions) {
    return withRateLimit({
      ...baseOptions,
      customConfig: undefined, // 動的に決定
    })
  }
}

// 動的Rate Limit マネージャーのインスタンス
export const dynamicRateLimitManager = new DynamicRateLimitManager()

/**
 * Rate Limit統計情報の取得
 */
export async function getRateLimitStats(
  identifier: string,
  type: RateLimitType
): Promise<{
  identifier: string
  type: string
  limits: Array<{
    windowMs: number
    maxRequests: number
    current: number
    remaining: number
    resetTime: Date
  }>
}> {
  const configs = RATE_LIMIT_CONFIGS[type]
  const limits = []

  for (let i = 0; i < configs.length; i++) {
    const config = configs[i]
    const status = await slidingWindowLimiter.getLimitStatus(`limit_${i}:${identifier}`, config)

    limits.push({
      windowMs: config.windowMs,
      maxRequests: config.maxRequests,
      current: status.current,
      remaining: config.maxRequests - status.current,
      resetTime: status.resetTime,
    })
  }

  return {
    identifier,
    type,
    limits,
  }
}

export default {
  withRateLimit,
  withAuthRateLimit,
  withApiRateLimit,
  withLenientRateLimit,
  withPremiumRateLimit,
  DynamicRateLimitManager,
  dynamicRateLimitManager,
  getRateLimitStats,
}
