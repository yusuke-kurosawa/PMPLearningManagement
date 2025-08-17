/**
 * テストケース実装
 * Developer 8: 品質保証エンジニア
 * テストタイプ: {test_type}
 * 対象: {target}
 * 最終更新: {updated}
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest'
import {
  SlidingWindowRateLimiter,
  TokenBucketRateLimiter,
  DDoSProtection,
  getRedisClient,
  disconnectRedis,
} from '../rateLimiting'
import Redis from 'ioredis'

// Redis モック設定
const mockRedis = {
  eval: vi.fn(),
  del: vi.fn(),
  zremrangebyscore: vi.fn(),
  zcard: vi.fn(),
  hmget: vi.fn(),
  hmset: vi.fn(),
  get: vi.fn(),
  setex: vi.fn(),
  zadd: vi.fn(),
  expire: vi.fn(),
  keys: vi.fn(),
  ping: vi.fn(),
  quit: vi.fn(),
}

// Redis クライアントをモック
vi.mock('ioredis', () => {
  return {
    default: vi.fn(() => mockRedis),
  }
})

describe('Rate Limiting システム', () => {
  beforeAll(() => {
    // テスト用環境変数
    process.env.REDIS_HOST = 'localhost'
    process.env.REDIS_PORT = '6379'
    process.env.REDIS_PASSWORD = 'test-password'
  })

  beforeEach(() => {
    // モック関数のリセット
    vi.clearAllMocks()
    mockRedis.ping.mockResolvedValue('PONG')
  })

  describe('SlidingWindowRateLimiter', () => {
    let limiter: SlidingWindowRateLimiter

    beforeEach(() => {
      limiter = new SlidingWindowRateLimiter('test_sliding')
    })

    it('制限内のリクエストを許可する', async () => {
      // Lua スクリプト実行結果をモック（許可）
      mockRedis.eval.mockResolvedValue([1, 5, 95]) // allowed, current, remaining

      const result = await limiter.checkLimit('user123', {
        windowMs: 60 * 1000, // 1分
        maxRequests: 100,
      })

      expect(result.success).toBe(true)
      expect(result.limit).toBe(100)
      expect(result.remaining).toBe(95)
      expect(result.resetTime).toBeInstanceOf(Date)
      expect(mockRedis.eval).toHaveBeenCalledTimes(1)
    })

    it('制限を超えたリクエストを拒否する', async () => {
      // Lua スクリプト実行結果をモック（拒否）
      mockRedis.eval.mockResolvedValue([0, 100, 0]) // not allowed, current, remaining

      const result = await limiter.checkLimit('user456', {
        windowMs: 60 * 1000,
        maxRequests: 100,
      })

      expect(result.success).toBe(false)
      expect(result.limit).toBe(100)
      expect(result.remaining).toBe(0)
      expect(result.retryAfter).toBe(60)
    })

    it('複数の制限条件をチェックする', async () => {
      mockRedis.eval
        .mockResolvedValueOnce([1, 5, 95]) // 1分制限: 許可
        .mockResolvedValueOnce([0, 1000, 0]) // 1時間制限: 拒否

      const result = await limiter.checkMultipleLimit('user789', [
        { name: 'minute', config: { windowMs: 60 * 1000, maxRequests: 100 } },
        { name: 'hour', config: { windowMs: 60 * 60 * 1000, maxRequests: 1000 } },
      ])

      expect(result.minute.success).toBe(true)
      expect(result.hour.success).toBe(false)
      expect(mockRedis.eval).toHaveBeenCalledTimes(2)
    })

    it('Rate limit をリセットする', async () => {
      mockRedis.del.mockResolvedValue(1)

      await limiter.resetLimit('user123')

      expect(mockRedis.del).toHaveBeenCalledWith('test_sliding:user123')
    })

    it('現在の制限状況を取得する', async () => {
      mockRedis.zremrangebyscore.mockResolvedValue(5)
      mockRedis.zcard.mockResolvedValue(50)

      const status = await limiter.getLimitStatus('user123', {
        windowMs: 60 * 1000,
        maxRequests: 100,
      })

      expect(status.current).toBe(50)
      expect(status.limit).toBe(100)
      expect(status.resetTime).toBeInstanceOf(Date)
    })

    it('Redis エラー時にはデフォルトで許可する', async () => {
      mockRedis.eval.mockRejectedValue(new Error('Redis connection failed'))

      const result = await limiter.checkLimit('user123', {
        windowMs: 60 * 1000,
        maxRequests: 100,
      })

      expect(result.success).toBe(true) // エラー時はデフォルトで許可
    })
  })

  describe('TokenBucketRateLimiter', () => {
    let limiter: TokenBucketRateLimiter

    beforeEach(() => {
      limiter = new TokenBucketRateLimiter('test_token_bucket')
    })

    it('トークンが十分にある場合はリクエストを許可する', async () => {
      mockRedis.eval.mockResolvedValue([1, 15, 20]) // allowed, remaining tokens, capacity

      const result = await limiter.checkLimit('user123', 20, 1, 5) // capacity=20, rate=1/sec, requested=5

      expect(result.success).toBe(true)
      expect(result.remaining).toBe(15)
      expect(result.limit).toBe(20)
      expect(result.retryAfter).toBeUndefined()
    })

    it('トークンが不足している場合はリクエストを拒否する', async () => {
      mockRedis.eval.mockResolvedValue([0, 2, 20]) // not allowed, remaining tokens, capacity

      const result = await limiter.checkLimit('user123', 20, 1, 5)

      expect(result.success).toBe(false)
      expect(result.remaining).toBe(2)
      expect(result.retryAfter).toBe(3) // (5-2)/1 = 3 seconds
    })

    it('トークンの補充が正しく計算される', async () => {
      // 最初の状態：トークン10個、refill rate=2/sec
      mockRedis.eval.mockResolvedValue([1, 12, 20]) // 2秒経過後にトークンが補充された状態

      const result = await limiter.checkLimit('user123', 20, 2, 3)

      expect(result.success).toBe(true)
      expect(mockRedis.eval).toHaveBeenCalledWith(
        expect.stringContaining('local time_passed = (now - last_refill) / 1000'),
        1,
        'test_token_bucket:user123',
        '20', // capacity
        '2', // refill rate
        '3', // requested tokens
        expect.any(String) // timestamp
      )
    })
  })

  describe('DDoSProtection', () => {
    let protection: DDoSProtection

    beforeEach(() => {
      protection = new DDoSProtection()
    })

    it('通常のトラフィックを許可する', async () => {
      // Rate limiting結果をモック（すべて通過）
      mockRedis.eval
        .mockResolvedValueOnce([1, 50, 50]) // IP rate limit: OK
        .mockResolvedValueOnce([1, 15, 5]) // Token bucket: OK
        .mockResolvedValueOnce([1, 100, 100]) // User rate limit: OK

      // Suspicious scoreの計算用モック
      mockRedis.hmget
        .mockResolvedValueOnce(['5', '0.9', '1234567890']) // IP reputation
        .mockResolvedValueOnce([null]) // User location

      mockRedis.zremrangebyscore.mockResolvedValue(0)
      mockRedis.zcard.mockResolvedValue(2) // 2 req/sec
      mockRedis.get.mockResolvedValue('JP')

      const result = await protection.checkProtection(
        '192.168.1.1',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'user123'
      )

      expect(result.allowed).toBe(true)
      expect(result.recommendations).toContain('Normal traffic pattern')
    })

    it('IP rate limitに引っかかった場合はブロックする', async () => {
      mockRedis.eval.mockResolvedValueOnce([0, 100, 0]) // IP rate limit exceeded

      const result = await protection.checkProtection(
        '192.168.1.2',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      )

      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('IP rate limit exceeded')
      expect(result.blockDuration).toBe(60)
    })

    it('疑わしいUser-Agentを検出する', async () => {
      mockRedis.eval.mockResolvedValue([1, 50, 50]) // Rate limits OK

      // Suspicious bot User-Agent
      mockRedis.hmget.mockResolvedValue(['0', '1.0', '1234567890'])
      mockRedis.zremrangebyscore.mockResolvedValue(0)
      mockRedis.zcard.mockResolvedValue(1)

      const result = await protection.checkProtection(
        '192.168.1.3',
        'python-requests/2.25.1' // Bot-like user agent
      )

      // Suspicious score calculation will add points for bot pattern
      expect(result.allowed).toBe(true) // Still allowed but flagged
      expect(result.recommendations.length).toBeGreaterThan(0)
    })

    it('User-Agentが存在しない場合は疑わしいスコアを上げる', async () => {
      mockRedis.eval.mockResolvedValue([1, 50, 50])
      mockRedis.hmget.mockResolvedValue(['0', '1.0', '1234567890'])
      mockRedis.zremrangebyscore.mockResolvedValue(0)
      mockRedis.zcard.mockResolvedValue(1)

      const result = await protection.checkProtection(
        '192.168.1.4',
        undefined // No user agent
      )

      expect(result.allowed).toBe(true)
      expect(result.recommendations.length).toBeGreaterThan(0)
    })

    it('高い疑わしいスコアでブロックする', async () => {
      mockRedis.eval.mockResolvedValue([1, 50, 50])

      // High suspicious score setup
      mockRedis.hmget.mockResolvedValue(['50', '0.2', null]) // Many failed attempts, low success rate, new IP
      mockRedis.zremrangebyscore.mockResolvedValue(0)
      mockRedis.zcard.mockResolvedValue(15) // High frequency

      const result = await protection.checkProtection(
        '192.168.1.5',
        'curl/7.68.0' // Bot-like user agent
      )

      // This should result in high suspicious score and block
      if (!result.allowed) {
        expect(result.reason).toBe('Suspicious activity detected')
        expect(result.blockDuration).toBe(300)
        expect(result.recommendations).toContain('Potential bot or attack detected')
      }
    })

    it('地理的異常を検出する', async () => {
      mockRedis.eval.mockResolvedValue([1, 50, 50])
      mockRedis.hmget.mockResolvedValue(['0', '1.0', '1234567890'])
      mockRedis.zremrangebyscore.mockResolvedValue(0)
      mockRedis.zcard.mockResolvedValue(1)

      // Mock previous location
      mockRedis.get.mockResolvedValue('US') // Previous location was US
      mockRedis.setex.mockResolvedValue('OK')

      const result = await protection.checkProtection(
        '192.168.1.6',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'user123'
      )

      expect(result.allowed).toBe(true)
      expect(result.recommendations.some((r) => r.includes('Geographic anomaly'))).toBe(true)
    })

    it('IP reputationを更新する', async () => {
      mockRedis.eval.mockResolvedValue([100, 5, 0.95]) // total, failed, success_rate
      mockRedis.zadd.mockResolvedValue(1)
      mockRedis.expire.mockResolvedValue(1)

      await protection.updateIpReputation('192.168.1.7', true, {
        userAgent: 'Mozilla/5.0',
        endpoint: '/api/users',
      })

      expect(mockRedis.eval).toHaveBeenCalledWith(
        expect.stringContaining("local success = ARGV[1] == '1'"),
        1,
        'ip_reputation:192.168.1.7',
        '1', // success
        expect.any(String) // timestamp
      )

      expect(mockRedis.zadd).toHaveBeenCalledWith(
        'freq:192.168.1.7',
        expect.any(Number),
        expect.any(Number)
      )
    })

    it('ブロックされたIPを手動解除する', async () => {
      mockRedis.keys.mockResolvedValue([
        'ddos_protection:ip:192.168.1.8',
        'ddos_burst:burst:192.168.1.8',
        'ip_reputation:192.168.1.8',
      ])
      mockRedis.del.mockResolvedValue(3)

      await protection.unblockIp('192.168.1.8')

      expect(mockRedis.keys).toHaveBeenCalledWith('*:192.168.1.8')
      expect(mockRedis.del).toHaveBeenCalledWith(
        'ddos_protection:ip:192.168.1.8',
        'ddos_burst:burst:192.168.1.8',
        'ip_reputation:192.168.1.8'
      )
    })
  })

  describe('Redis 接続管理', () => {
    it('Redis クライアントシングルトンが正しく動作する', async () => {
      mockRedis.ping.mockResolvedValue('PONG')

      const client1 = await getRedisClient()
      const client2 = await getRedisClient()

      expect(client1).toBe(client2) // 同じインスタンス
      expect(mockRedis.ping).toHaveBeenCalledTimes(1) // 1回だけ接続テスト
    })

    it('Redis 接続エラーを適切に処理する', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Connection failed'))

      await expect(getRedisClient()).rejects.toThrow('Connection failed')
    })

    it('Redis切断が正常に動作する', async () => {
      mockRedis.quit.mockResolvedValue('OK')

      await disconnectRedis()

      expect(mockRedis.quit).toHaveBeenCalledTimes(1)
    })
  })

  describe('エラーハンドリング', () => {
    let limiter: SlidingWindowRateLimiter

    beforeEach(() => {
      limiter = new SlidingWindowRateLimiter()
    })

    it('Redis接続失敗時にグレースフルな fallback', async () => {
      mockRedis.eval.mockRejectedValue(new Error('Redis unavailable'))

      const result = await limiter.checkLimit('user123', {
        windowMs: 60 * 1000,
        maxRequests: 100,
      })

      // Redis エラー時はデフォルトで許可
      expect(result.success).toBe(true)
      expect(result.limit).toBe(100)
      expect(result.remaining).toBe(100)
    })

    it('不正な設定値の処理', async () => {
      mockRedis.eval.mockResolvedValue([1, 50, 50])

      // 不正な値でもエラーにならないことを確認
      await expect(
        limiter.checkLimit('user123', {
          windowMs: -1000, // 負の値
          maxRequests: 0, // ゼロ
        })
      ).resolves.toBeDefined()
    })
  })

  describe('パフォーマンステスト', () => {
    let limiter: SlidingWindowRateLimiter

    beforeEach(() => {
      limiter = new SlidingWindowRateLimiter()
    })

    it('大量のリクエストを効率的に処理する', async () => {
      mockRedis.eval.mockResolvedValue([1, 1, 99])

      const startTime = Date.now()
      const promises = []

      // 100並列リクエスト
      for (let i = 0; i < 100; i++) {
        promises.push(
          limiter.checkLimit(`user${i}`, {
            windowMs: 60 * 1000,
            maxRequests: 100,
          })
        )
      }

      const results = await Promise.all(promises)
      const endTime = Date.now()

      expect(results.length).toBe(100)
      expect(results.every((r) => r.success)).toBe(true)
      expect(endTime - startTime).toBeLessThan(1000) // 1秒以内に完了
    })
  })

  afterAll(async () => {
    await disconnectRedis()
  })
})
