/**
 * 高度な Rate Limiting システム
 * Developer 3: API Rate Limiting・DDoS防止・Redis実装
 */

import Redis from 'ioredis'
import { z } from 'zod'

// Rate Limiting 設定スキーマ
const RateLimitConfigSchema = z.object({
  windowMs: z.number().positive(),
  maxRequests: z.number().positive(),
  skipSuccessfulRequests: z.boolean().optional().default(false),
  skipFailedRequests: z.boolean().optional().default(false),
  keyGenerator: z.function().optional(),
  onLimitReached: z.function().optional(),
})

export type RateLimitConfig = z.infer<typeof RateLimitConfigSchema>

// Rate Limiting 結果
export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: Date
  retryAfter?: number
}

// Redis設定
const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  family: 4,
  connectTimeout: 10000,
  commandTimeout: 5000,
}

/**
 * Redis クライアントシングルトン
 */
class RedisClient {
  private static instance: Redis | null = null
  private static connecting = false

  static async getInstance(): Promise<Redis> {
    if (!RedisClient.instance && !RedisClient.connecting) {
      RedisClient.connecting = true
      
      try {
        RedisClient.instance = new Redis(REDIS_CONFIG)
        
        RedisClient.instance.on('connect', () => {
          console.log('Redis connected successfully')
        })
        
        RedisClient.instance.on('error', (error) => {
          console.error('Redis connection error:', error)
        })
        
        RedisClient.instance.on('close', () => {
          console.log('Redis connection closed')
        })

        // 接続テスト
        await RedisClient.instance.ping()
        
      } catch (error) {
        console.error('Redis initialization failed:', error)
        RedisClient.instance = null
        throw error
      } finally {
        RedisClient.connecting = false
      }
    }

    // 接続中の場合は待機
    while (RedisClient.connecting) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    if (!RedisClient.instance) {
      throw new Error('Redis client not initialized')
    }

    return RedisClient.instance
  }

  static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      await RedisClient.instance.quit()
      RedisClient.instance = null
    }
  }
}

/**
 * Sliding Window Rate Limiter (Redis Sorted Set使用)
 */
export class SlidingWindowRateLimiter {
  private redis: Redis | null = null
  private keyPrefix: string

  constructor(keyPrefix: string = 'rate_limit') {
    this.keyPrefix = keyPrefix
  }

  private async getRedis(): Promise<Redis> {
    if (!this.redis) {
      this.redis = await RedisClient.getInstance()
    }
    return this.redis
  }

  /**
   * Rate limit チェック（Sliding Window アルゴリズム）
   */
  async checkLimit(
    identifier: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    try {
      const redis = await this.getRedis()
      const key = `${this.keyPrefix}:${identifier}`
      const now = Date.now()
      const windowStart = now - config.windowMs

      // Lua スクリプトで原子的操作を実行
      const luaScript = `
        local key = KEYS[1]
        local window_start = ARGV[1]
        local window_end = ARGV[2]
        local max_requests = ARGV[3]
        local ttl = ARGV[4]
        
        -- 期限切れエントリを削除
        redis.call('ZREMRANGEBYSCORE', key, '-inf', window_start)
        
        -- 現在のウィンドウ内のリクエスト数を取得
        local current_requests = redis.call('ZCARD', key)
        
        -- 制限チェック
        if current_requests < tonumber(max_requests) then
          -- リクエストを記録
          redis.call('ZADD', key, window_end, window_end)
          redis.call('EXPIRE', key, ttl)
          return {1, current_requests + 1, tonumber(max_requests) - current_requests - 1}
        else
          return {0, current_requests, 0}
        end
      `

      const result = await redis.eval(
        luaScript,
        1,
        key,
        windowStart.toString(),
        now.toString(),
        config.maxRequests.toString(),
        Math.ceil(config.windowMs / 1000).toString()
      ) as [number, number, number]

      const [allowed, currentRequests, remaining] = result
      const resetTime = new Date(now + config.windowMs)

      return {
        success: allowed === 1,
        limit: config.maxRequests,
        remaining: Math.max(0, remaining),
        resetTime,
        retryAfter: allowed === 0 ? Math.ceil(config.windowMs / 1000) : undefined,
      }
    } catch (error) {
      console.error('Rate limiting error:', error)
      // Redis エラー時はデフォルトで許可
      return {
        success: true,
        limit: config.maxRequests,
        remaining: config.maxRequests,
        resetTime: new Date(Date.now() + config.windowMs),
      }
    }
  }

  /**
   * 複数条件での Rate Limit チェック
   */
  async checkMultipleLimit(
    identifier: string,
    limits: Array<{ name: string; config: RateLimitConfig }>
  ): Promise<{ [key: string]: RateLimitResult }> {
    const results: { [key: string]: RateLimitResult } = {}

    for (const { name, config } of limits) {
      const result = await this.checkLimit(`${name}:${identifier}`, config)
      results[name] = result
    }

    return results
  }

  /**
   * Rate limit リセット
   */
  async resetLimit(identifier: string): Promise<void> {
    try {
      const redis = await this.getRedis()
      const key = `${this.keyPrefix}:${identifier}`
      await redis.del(key)
    } catch (error) {
      console.error('Rate limit reset error:', error)
    }
  }

  /**
   * 現在のRate limit状況取得
   */
  async getLimitStatus(
    identifier: string,
    config: RateLimitConfig
  ): Promise<{ current: number; limit: number; resetTime: Date }> {
    try {
      const redis = await this.getRedis()
      const key = `${this.keyPrefix}:${identifier}`
      const now = Date.now()
      const windowStart = now - config.windowMs

      await redis.zremrangebyscore(key, '-inf', windowStart)
      const current = await redis.zcard(key)

      return {
        current,
        limit: config.maxRequests,
        resetTime: new Date(now + config.windowMs),
      }
    } catch (error) {
      console.error('Get limit status error:', error)
      return {
        current: 0,
        limit: config.maxRequests,
        resetTime: new Date(),
      }
    }
  }
}

/**
 * Token Bucket Rate Limiter
 */
export class TokenBucketRateLimiter {
  private redis: Redis | null = null
  private keyPrefix: string

  constructor(keyPrefix: string = 'token_bucket') {
    this.keyPrefix = keyPrefix
  }

  private async getRedis(): Promise<Redis> {
    if (!this.redis) {
      this.redis = await RedisClient.getInstance()
    }
    return this.redis
  }

  /**
   * Token bucket アルゴリズムでレート制限
   */
  async checkLimit(
    identifier: string,
    capacity: number,
    refillRate: number,
    requested: number = 1
  ): Promise<RateLimitResult> {
    try {
      const redis = await this.getRedis()
      const key = `${this.keyPrefix}:${identifier}`
      const now = Date.now()

      const luaScript = `
        local key = KEYS[1]
        local capacity = tonumber(ARGV[1])
        local refill_rate = tonumber(ARGV[2])
        local requested = tonumber(ARGV[3])
        local now = tonumber(ARGV[4])
        local ttl = 3600  -- 1 hour TTL
        
        -- バケット情報を取得
        local bucket_data = redis.call('HMGET', key, 'tokens', 'last_refill')
        local tokens = tonumber(bucket_data[1]) or capacity
        local last_refill = tonumber(bucket_data[2]) or now
        
        -- トークンの補充計算
        local time_passed = (now - last_refill) / 1000  -- seconds
        local tokens_to_add = time_passed * refill_rate
        tokens = math.min(capacity, tokens + tokens_to_add)
        
        -- リクエスト処理
        if tokens >= requested then
          tokens = tokens - requested
          redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
          redis.call('EXPIRE', key, ttl)
          return {1, tokens, capacity}
        else
          redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
          redis.call('EXPIRE', key, ttl)
          return {0, tokens, capacity}
        end
      `

      const result = await redis.eval(
        luaScript,
        1,
        key,
        capacity.toString(),
        refillRate.toString(),
        requested.toString(),
        now.toString()
      ) as [number, number, number]

      const [allowed, remainingTokens, bucketCapacity] = result

      return {
        success: allowed === 1,
        limit: bucketCapacity,
        remaining: Math.floor(remainingTokens),
        resetTime: new Date(now + (bucketCapacity - remainingTokens) / refillRate * 1000),
        retryAfter: allowed === 0 ? Math.ceil((requested - remainingTokens) / refillRate) : undefined,
      }
    } catch (error) {
      console.error('Token bucket error:', error)
      return {
        success: true,
        limit: capacity,
        remaining: capacity,
        resetTime: new Date(),
      }
    }
  }
}

/**
 * DDoS 防止システム
 */
export class DDoSProtection {
  private slidingWindow: SlidingWindowRateLimiter
  private tokenBucket: TokenBucketRateLimiter
  private redis: Redis | null = null

  constructor() {
    this.slidingWindow = new SlidingWindowRateLimiter('ddos_protection')
    this.tokenBucket = new TokenBucketRateLimiter('ddos_burst')
  }

  private async getRedis(): Promise<Redis> {
    if (!this.redis) {
      this.redis = await RedisClient.getInstance()
    }
    return this.redis
  }

  /**
   * 多層防御によるDDoS保護
   */
  async checkProtection(
    clientIp: string,
    userAgent?: string,
    userId?: string
  ): Promise<{
    allowed: boolean
    reason?: string
    blockDuration?: number
    recommendations: string[]
  }> {
    const recommendations: string[] = []
    
    try {
      // 1. IP-based Rate Limiting
      const ipLimit = await this.slidingWindow.checkLimit(
        `ip:${clientIp}`,
        { windowMs: 60 * 1000, maxRequests: 100 } // 1分間に100リクエスト
      )

      if (!ipLimit.success) {
        return {
          allowed: false,
          reason: 'IP rate limit exceeded',
          blockDuration: 60,
          recommendations: ['Implement exponential backoff', 'Check for bot activity'],
        }
      }

      // 2. Burst protection (Token Bucket)
      const burstLimit = await this.tokenBucket.checkLimit(
        `burst:${clientIp}`,
        20, // capacity
        0.5, // refill rate per second
        1   // requested tokens
      )

      if (!burstLimit.success) {
        recommendations.push('High burst activity detected')
      }

      // 3. User-based limiting (認証済みユーザー)
      if (userId) {
        const userLimit = await this.slidingWindow.checkLimit(
          `user:${userId}`,
          { windowMs: 60 * 1000, maxRequests: 200 } // 認証ユーザーはより多く許可
        )

        if (!userLimit.success) {
          return {
            allowed: false,
            reason: 'User rate limit exceeded',
            blockDuration: 60,
            recommendations: ['User may be compromised', 'Check for automated behavior'],
          }
        }
      }

      // 4. Suspicious patterns detection
      const suspiciousScore = await this.calculateSuspiciousScore(clientIp, userAgent)
      
      if (suspiciousScore > 80) {
        recommendations.push('High suspicious score detected')
        
        if (suspiciousScore > 95) {
          return {
            allowed: false,
            reason: 'Suspicious activity detected',
            blockDuration: 300, // 5分間ブロック
            recommendations: [
              'Potential bot or attack detected',
              'Manual review recommended',
              'Consider CAPTCHA challenge',
            ],
          }
        }
      }

      // 5. Geographic anomaly detection
      const geoAnomaly = await this.checkGeographicAnomaly(clientIp, userId)
      if (geoAnomaly.isAnomalous) {
        recommendations.push(`Geographic anomaly: ${geoAnomaly.reason}`)
      }

      return {
        allowed: true,
        recommendations: recommendations.length > 0 ? recommendations : ['Normal traffic pattern'],
      }

    } catch (error) {
      console.error('DDoS protection error:', error)
      return {
        allowed: true, // エラー時はデフォルトで許可
        recommendations: ['DDoS protection system error'],
      }
    }
  }

  /**
   * 疑わしいスコア計算
   */
  private async calculateSuspiciousScore(
    clientIp: string,
    userAgent?: string
  ): Promise<number> {
    let score = 0
    const redis = await this.getRedis()

    try {
      // User-Agent パターン解析
      if (userAgent) {
        const botPatterns = [
          /bot/i, /crawler/i, /spider/i, /scraper/i,
          /curl/i, /wget/i, /python/i, /java/i,
        ]
        
        if (botPatterns.some(pattern => pattern.test(userAgent))) {
          score += 30
        }

        // 異常に短い・長いUser-Agent
        if (userAgent.length < 10 || userAgent.length > 500) {
          score += 20
        }
      } else {
        // User-Agentが存在しない場合
        score += 40
      }

      // IP reputation チェック（簡略化）
      const ipKey = `ip_reputation:${clientIp}`
      const ipReputationData = await redis.hmget(
        ipKey,
        'failed_attempts',
        'success_rate',
        'first_seen'
      )

      const failedAttempts = parseInt(ipReputationData[0] || '0')
      const successRate = parseFloat(ipReputationData[1] || '1.0')
      
      if (failedAttempts > 10) score += 25
      if (successRate < 0.5) score += 30

      // 新しいIPアドレス（初回接続）
      if (!ipReputationData[2]) {
        score += 10
      }

      // Request frequency analysis
      const requestFrequency = await this.getRequestFrequency(clientIp)
      if (requestFrequency > 10) { // 10 req/sec
        score += 20
      }

      return Math.min(100, score)
    } catch (error) {
      console.error('Suspicious score calculation error:', error)
      return 0
    }
  }

  /**
   * 地理的異常検知
   */
  private async checkGeographicAnomaly(
    clientIp: string,
    userId?: string
  ): Promise<{ isAnomalous: boolean; reason?: string }> {
    // 簡略化された実装（実際にはGeoIPサービスを使用）
    try {
      if (!userId) {
        return { isAnomalous: false }
      }

      const redis = await this.getRedis()
      const userLocationKey = `user_location:${userId}`
      const lastKnownCountry = await redis.get(userLocationKey)

      // 実際の実装では GeoIP lookup を行う
      // const currentCountry = await geoipLookup(clientIp)
      const currentCountry = 'JP' // プレースホルダー

      if (lastKnownCountry && lastKnownCountry !== currentCountry) {
        return {
          isAnomalous: true,
          reason: `Location change from ${lastKnownCountry} to ${currentCountry}`,
        }
      }

      // 現在の位置を記録
      await redis.setex(userLocationKey, 86400 * 7, currentCountry) // 1週間保持

      return { isAnomalous: false }
    } catch (error) {
      console.error('Geographic anomaly check error:', error)
      return { isAnomalous: false }
    }
  }

  /**
   * リクエスト頻度の取得
   */
  private async getRequestFrequency(clientIp: string): Promise<number> {
    try {
      const redis = await this.getRedis()
      const key = `freq:${clientIp}`
      const now = Date.now()
      const oneSecondAgo = now - 1000

      await redis.zremrangebyscore(key, '-inf', oneSecondAgo)
      const count = await redis.zcard(key)
      
      return count
    } catch (error) {
      console.error('Request frequency check error:', error)
      return 0
    }
  }

  /**
   * IP reputation の更新
   */
  async updateIpReputation(
    clientIp: string,
    success: boolean,
    additionalData?: { userAgent?: string; endpoint?: string }
  ): Promise<void> {
    try {
      const redis = await this.getRedis()
      const key = `ip_reputation:${clientIp}`
      const now = Date.now()

      // 原子的操作でreputation更新
      const luaScript = `
        local key = KEYS[1]
        local success = ARGV[1] == '1'
        local now = ARGV[2]
        local ttl = 86400 * 7  -- 1 week
        
        -- 既存データを取得
        local data = redis.call('HMGET', key, 'total_requests', 'failed_attempts', 'first_seen')
        local total = tonumber(data[1]) or 0
        local failed = tonumber(data[2]) or 0
        local first_seen = data[3] or now
        
        -- 統計更新
        total = total + 1
        if not success then
          failed = failed + 1
        end
        
        local success_rate = (total - failed) / total
        
        -- データ保存
        redis.call('HMSET', key,
          'total_requests', total,
          'failed_attempts', failed,
          'success_rate', success_rate,
          'first_seen', first_seen,
          'last_seen', now
        )
        
        redis.call('EXPIRE', key, ttl)
        
        return {total, failed, success_rate}
      `

      await redis.eval(
        luaScript,
        1,
        key,
        success ? '1' : '0',
        now.toString()
      )

      // Request frequency tracking
      const freqKey = `freq:${clientIp}`
      await redis.zadd(freqKey, now, now)
      await redis.expire(freqKey, 10) // 10秒間保持

    } catch (error) {
      console.error('IP reputation update error:', error)
    }
  }

  /**
   * ブロックされたIPの手動解除
   */
  async unblockIp(clientIp: string): Promise<void> {
    try {
      const redis = await this.getRedis()
      const pattern = `*:${clientIp}`
      
      // パターンにマッチするキーを削除
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }

      console.log(`IP ${clientIp} unblocked manually`)
    } catch (error) {
      console.error('IP unblock error:', error)
    }
  }
}

// エクスポート用インスタンス
export const slidingWindowLimiter = new SlidingWindowRateLimiter()
export const tokenBucketLimiter = new TokenBucketRateLimiter()
export const ddosProtection = new DDoSProtection()

// Redis client access
export const getRedisClient = RedisClient.getInstance
export const disconnectRedis = RedisClient.disconnect

export default {
  SlidingWindowRateLimiter,
  TokenBucketRateLimiter,
  DDoSProtection,
  slidingWindowLimiter,
  tokenBucketLimiter,
  ddosProtection,
  getRedisClient,
  disconnectRedis,
}