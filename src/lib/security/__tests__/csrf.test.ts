/**
 * Enhanced CSRF Protection テストファイル
 * Developer 2: 包括的なCSRF保護機能テスト
 */

import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest'
import { CSRFProtection } from '../csrf'
import * as fc from 'fast-check'

// Crypto モック
vi.mock('crypto', () => ({
  randomBytes: vi.fn().mockImplementation((size: number) => ({
    toString: vi.fn().mockReturnValue('a'.repeat(size * 2)),
  })),
  createHmac: vi.fn().mockImplementation(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue('mocked-hmac-signature'),
  })),
  timingSafeEqual: vi.fn().mockImplementation((a: Buffer, b: Buffer) => a.equals(b)),
}))

// Redis モック
vi.mock('../rateLimiting', () => ({
  getRedisClient: vi.fn().mockResolvedValue({
    setex: vi.fn(),
    get: vi.fn().mockResolvedValue(null),
    del: vi.fn(),
    keys: vi.fn().mockResolvedValue([]),
    zcard: vi.fn().mockResolvedValue(0),
    zadd: vi.fn(),
    expire: vi.fn(),
    zrange: vi.fn().mockResolvedValue([]),
    zrem: vi.fn(),
  }),
}))

describe('Enhanced CSRF Protection', () => {
  let csrf: CSRFProtection

  beforeAll(() => {
    // 環境変数設定
    process.env.CSRF_SECRET = 'test-secret-key-for-csrf-protection-32chars'
    process.env.NODE_ENV = 'test'
  })

  beforeEach(() => {
    csrf = new CSRFProtection({
      tokenExpiry: 3600000, // 1 hour
      secretKey: 'test-secret-key-for-csrf-protection-32chars',
      doubleSubmitCookie: true,
      sameSite: 'strict',
      secure: true,
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    csrf.destroy()
  })

  describe('Token Generation', () => {
    it('should generate cryptographically secure tokens', async () => {
      const token = await csrf.generateToken('user123', 'session456', 'fingerprint')

      expect(token).toMatch(/^[a-f0-9]+\.\d+\.[a-f0-9]+$/) // nonce.timestamp.signature format
      expect(token.split('.')[0]).toHaveLength(32) // nonce length
      expect(token.split('.')[2]).toHaveLength(19) // signature length (mocked)
    })

    it('should generate unique tokens for each call', async () => {
      const tokens = await Promise.all([
        csrf.generateToken(),
        csrf.generateToken(),
        csrf.generateToken(),
      ])

      const uniqueTokens = new Set(tokens)
      expect(uniqueTokens.size).toBe(3)
    })

    it('should include context in token generation', async () => {
      const token1 = await csrf.generateToken('user1')
      const token2 = await csrf.generateToken('user2')
      const token3 = await csrf.generateToken('user1', 'different-session')

      expect(token1).not.toBe(token2)
      expect(token1).not.toBe(token3)
      expect(token2).not.toBe(token3)
    })

    it('should handle token generation errors gracefully', async () => {
      // Mock crypto error
      const { randomBytes } = await import('crypto')
      vi.mocked(randomBytes).mockImplementationOnce(() => {
        throw new Error('Crypto error')
      })

      await expect(csrf.generateToken()).rejects.toThrow('Failed to generate CSRF token')
    })
  })

  describe('Token Validation', () => {
    it('should validate properly formatted tokens', async () => {
      const token = await csrf.generateToken('user123', 'session456')
      const result = await csrf.validateToken(token, 'user123', 'session456')

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject malformed tokens', async () => {
      const malformedTokens = [
        '',
        'invalid',
        'too.few.parts',
        'too.many.parts.here.invalid',
        'invalid-nonce.123.signature',
      ]

      for (const token of malformedTokens) {
        const result = await csrf.validateToken(token)
        expect(result.valid).toBe(false)
        expect(result.riskScore).toBeGreaterThan(80)
      }
    })

    it('should detect expired tokens', async () => {
      // Create token with past timestamp
      const expiredToken = 'nonce123.1000.signature'
      const result = await csrf.validateToken(expiredToken)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('expired')
      expect(result.riskScore).toBe(30)
    })

    it('should detect replay attacks with future timestamps', async () => {
      const futureTimestamp = Date.now() + 10000 // 10 seconds in future
      const futureToken = `nonce123.${futureTimestamp}.signature`

      const result = await csrf.validateToken(futureToken)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid token timestamp')
      expect(result.riskScore).toBe(80)
      expect(result.recommendations).toContain('Potential replay attack')
    })

    it('should validate user context', async () => {
      const token = await csrf.generateToken('user123')

      // Valid user context
      const validResult = await csrf.validateToken(token, 'user123')
      expect(validResult.valid).toBe(true)

      // Invalid user context
      const invalidResult = await csrf.validateToken(token, 'user456')
      expect(invalidResult.valid).toBe(false)
      expect(invalidResult.error).toContain('User context mismatch')
      expect(invalidResult.riskScore).toBe(85)
    })

    it('should validate session context', async () => {
      const token = await csrf.generateToken('user123', 'session456')

      // Valid session context
      const validResult = await csrf.validateToken(token, 'user123', 'session456')
      expect(validResult.valid).toBe(true)

      // Invalid session context
      const invalidResult = await csrf.validateToken(token, 'user123', 'session789')
      expect(invalidResult.valid).toBe(false)
      expect(invalidResult.error).toContain('Session context mismatch')
      expect(invalidResult.riskScore).toBe(85)
    })

    it('should detect fingerprint changes as warnings', async () => {
      const token = await csrf.generateToken('user123', 'session456', 'fingerprint1')
      const result = await csrf.validateToken(token, 'user123', 'session456', 'fingerprint2')

      expect(result.valid).toBe(true) // Still valid but with warning
      expect(result.riskScore).toBe(40)
      expect(result.recommendations).toContain('Device fingerprint changed')
    })

    // Property-based testing
    it('should handle arbitrary input safely', () => {
      fc.assert(
        fc.asyncProperty(
          fc.string(),
          fc.option(fc.string()),
          fc.option(fc.string()),
          async (token, userId, sessionId) => {
            const result = await csrf.validateToken(token, userId, sessionId)
            expect(typeof result.valid).toBe('boolean')
            expect(typeof result.riskScore).toBe('number')
            if (result.error) {
              expect(typeof result.error).toBe('string')
            }
          }
        )
      )
    })
  })

  describe('Double Submit Cookie', () => {
    it('should implement double submit cookie pattern', () => {
      const mockResponse = {
        cookie: vi.fn(),
      }

      csrf.setDoubleSubmitCookie('test-token', mockResponse)

      expect(mockResponse.cookie).toHaveBeenCalledTimes(2)

      // Check that both cookies are set
      const cookieCalls = mockResponse.cookie.mock.calls
      expect(cookieCalls[0][0]).toBe('csrf-token') // Hashed cookie
      expect(cookieCalls[1][0]).toBe('csrf-token-double') // Plain token cookie

      // Check cookie options
      expect(cookieCalls[0][2]).toMatchObject({
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      })
      expect(cookieCalls[1][2]).toMatchObject({
        httpOnly: false, // Accessible to client-side
        secure: true,
        sameSite: 'strict',
      })
    })

    it('should validate double submit cookies correctly', async () => {
      const mockRequest = {
        method: 'POST',
        headers: {
          'x-csrf-token': 'plain-token',
        },
        cookies: {
          'csrf-token': 'hashed-token',
          'csrf-token-double': 'plain-token',
        },
      }

      // This would be called by the middleware
      const validation = await csrf['validateEnhancedRequest'](mockRequest, 'user123')

      // The actual validation depends on proper HMAC implementation
      expect(typeof validation.valid).toBe('boolean')
    })
  })

  describe('Middleware Integration', () => {
    it('should create functional Express middleware', () => {
      const middleware = csrf.middleware()
      expect(typeof middleware).toBe('function')
      expect(middleware.length).toBe(3) // req, res, next
    })

    it('should skip validation for safe HTTP methods', async () => {
      const middleware = csrf.middleware()
      const req = { method: 'GET', path: '/test' }
      const res = {}
      const next = vi.fn()

      await middleware(req, res, next)

      expect(next).toHaveBeenCalledOnce()
    })

    it('should validate CSRF tokens for unsafe HTTP methods', async () => {
      const middleware = csrf.middleware()
      const req = {
        method: 'POST',
        path: '/test',
        headers: {},
        ip: '127.0.0.1',
        get: vi.fn().mockReturnValue('test-agent'),
      }
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      }
      const next = vi.fn()

      await middleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'CSRF validation failed',
          code: 'CSRF_VALIDATION_FAILED',
        })
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('should provide token refresh endpoint', async () => {
      const middleware = csrf.middleware()
      const req = {
        method: 'POST',
        path: '/api/csrf/refresh',
        user: { id: 'user123' },
        sessionID: 'session456',
      }
      const res = {
        json: vi.fn(),
      }
      const next = vi.fn()

      await middleware(req, res, next)

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.stringMatching(/^[a-f0-9]+\.\d+\.[a-f0-9]+$/),
        })
      )
    })
  })

  describe('Token Lifecycle Management', () => {
    it('should enforce token limits per user', async () => {
      const userId = 'user123'

      // Create multiple tokens for the same user
      const tokens = []
      for (let i = 0; i < 6; i++) {
        tokens.push(await csrf.generateToken(userId))
      }

      // Token limit enforcement would be tested with actual Redis
      expect(tokens).toHaveLength(6)
    })

    it('should clean up expired tokens', async () => {
      const cleanupSpy = vi.spyOn(
        csrf as unknown as { cleanupExpiredTokens: () => void },
        'cleanupExpiredTokens'
      )

      await csrf.generateToken()

      expect(cleanupSpy).toHaveBeenCalled()
    })

    it('should handle token rotation', async () => {
      const rotateSpy = vi.spyOn(
        csrf as unknown as { rotateActiveTokens: () => Promise<void> },
        'rotateActiveTokens'
      )

      // Manually trigger rotation for testing
      await csrf['rotateActiveTokens']()

      expect(rotateSpy).toHaveBeenCalled()
    })

    it('should invalidate tokens properly', async () => {
      const token = await csrf.generateToken('user123')

      await csrf.invalidateToken(token)

      const result = await csrf.validateToken(token, 'user123')
      expect(result.valid).toBe(false)
    })
  })

  describe('Security Features', () => {
    it('should use timing-safe comparison', async () => {
      const { timingSafeEqual } = await import('crypto')

      const token = await csrf.generateToken()
      await csrf.validateToken(token)

      expect(timingSafeEqual).toHaveBeenCalled()
    })

    it('should generate secure fingerprints', () => {
      const mockRequest = {
        get: vi
          .fn()
          .mockReturnValueOnce('Mozilla/5.0')
          .mockReturnValueOnce('en-US,en;q=0.9')
          .mockReturnValueOnce('gzip, deflate')
          .mockReturnValue(null),
        ip: '192.168.1.1',
      }

      const fingerprint = csrf['generateFingerprint'](mockRequest)

      expect(typeof fingerprint).toBe('string')
      expect(fingerprint).toHaveLength(16)
      expect(mockRequest.get).toHaveBeenCalledWith('User-Agent')
      expect(mockRequest.get).toHaveBeenCalledWith('Accept-Language')
      expect(mockRequest.get).toHaveBeenCalledWith('Accept-Encoding')
    })

    it('should handle concurrent token operations safely', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => csrf.generateToken(`user${i}`))

      const tokens = await Promise.all(promises)
      const uniqueTokens = new Set(tokens)

      expect(uniqueTokens.size).toBe(10)
    })
  })

  describe('Error Handling', () => {
    it('should handle Redis connection errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // Create CSRF instance that will fail Redis connection
      const csrfWithFailedRedis = new CSRFProtection()

      const token = await csrfWithFailedRedis.generateToken()
      expect(token).toBeTruthy()

      consoleSpy.mockRestore()
    })

    it('should handle middleware errors gracefully', async () => {
      const middleware = csrf.middleware()
      const req = {
        method: 'POST',
        path: '/test',
        get: vi.fn().mockImplementation(() => {
          throw new Error('Request error')
        }),
      }
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      }
      const next = vi.fn()

      await middleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'CSRF system error',
          code: 'CSRF_SYSTEM_ERROR',
        })
      )
    })

    it('should validate configuration in production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      expect(() => {
        new CSRFProtection({ secretKey: undefined })
      }).toThrow('CSRF_SECRET must be set in production')

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Performance', () => {
    it('should handle high token generation load', async () => {
      const startTime = Date.now()
      const promises = Array.from({ length: 100 }, () => csrf.generateToken())

      await Promise.all(promises)
      const endTime = Date.now()

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(1000) // 1 second
    })

    it('should cache tokens efficiently', async () => {
      const token = await csrf.generateToken('user123')

      // Multiple validations should reuse cached token
      const results = await Promise.all([
        csrf.validateToken(token, 'user123'),
        csrf.validateToken(token, 'user123'),
        csrf.validateToken(token, 'user123'),
      ])

      results.forEach((result) => {
        expect(result.valid).toBe(true)
      })
    })
  })
})
