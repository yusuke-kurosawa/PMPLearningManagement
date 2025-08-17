/**
 * JWT検証ミドルウェアのテスト
 * Developer 1: 包括的認可システム（RBAC）実装のテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  validateJWT,
  generateSecureToken,
  verifyHMACSignature,
  authMiddleware,
} from '../middleware'
import jwt from 'jsonwebtoken'

// NextRequest のモック
class MockHeaders {
  private data: Map<string, string> = new Map()

  constructor(init?: Record<string, string>) {
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this.data.set(key.toLowerCase(), value)
      })
    }
  }

  get(name: string): string | null {
    return this.data.get(name.toLowerCase()) || null
  }

  set(name: string, value: string): void {
    this.data.set(name.toLowerCase(), value)
  }
}

class NextRequest {
  url: string
  headers: MockHeaders

  constructor(url: string, init?: { headers?: Record<string, string> }) {
    this.url = url
    this.headers = new MockHeaders(init?.headers)
  }
}

// モック設定
vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
  encode: vi.fn(),
  decode: vi.fn(),
}))

vi.mock('rate-limiter-flexible', () => ({
  RateLimiterMemory: vi.fn().mockImplementation(() => ({
    consume: vi.fn().mockResolvedValue(null),
    penalty: vi.fn().mockResolvedValue(null),
    reward: vi.fn().mockResolvedValue(null),
    block: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(null),
  })),
}))

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn((_payload, _secret) => 'mocked.jwt.token'),
    verify: vi.fn((_token, _secret) => ({ sub: 'user123' })),
    decode: vi.fn((_token) => ({ sub: 'user123' })),
  },
  sign: vi.fn((_payload, _secret) => 'mocked.jwt.token'),
  verify: vi.fn((_token, _secret) => ({ sub: 'user123' })),
  decode: vi.fn((_token) => ({ sub: 'user123' })),
}))

describe('JWT検証ミドルウェア', () => {
  beforeEach(() => {
    // 環境変数のモック
    process.env.NEXTAUTH_SECRET = 'test-secret-key-for-jwt-validation'
    process.env.JWT_ISSUER = 'pmp-learning-system'
  })

  describe('validateJWT', () => {
    it('有効なJWTトークンを正しく検証する', async () => {
      const payload = {
        sub: 'user123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600, // 1時間後
        iss: 'pmp-learning-system',
      }

      const token = jwt.sign(payload, process.env.NEXTAUTH_SECRET || '')

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })

      const result = await validateJWT(request)

      expect(result.isValid).toBe(true)
      expect(result.decoded).toBeDefined()
      expect(result.decoded.sub).toBe('user123')
    })

    it('期限切れのトークンを拒否する', async () => {
      const payload = {
        sub: 'user123',
        iat: Math.floor(Date.now() / 1000) - 7200, // 2時間前
        exp: Math.floor(Date.now() / 1000) - 3600, // 1時間前（期限切れ）
        iss: 'pmp-learning-system',
      }

      const token = jwt.sign(payload, process.env.NEXTAUTH_SECRET || '')

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })

      const result = await validateJWT(request)

      expect(result.isValid).toBe(false)
      expect(result.reason).toBe('Token expired')
    })

    it('不正な署名のトークンを拒否する', async () => {
      const payload = {
        sub: 'user123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      }

      const token = jwt.sign(payload, 'wrong-secret')

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })

      const result = await validateJWT(request)

      expect(result.isValid).toBe(false)
      expect(result.reason).toBe('Invalid token signature')
    })

    it('未来の発行時刻を持つトークンを拒否する', async () => {
      const payload = {
        sub: 'user123',
        iat: Math.floor(Date.now() / 1000) + 300, // 5分後（未来の時刻）
        exp: Math.floor(Date.now() / 1000) + 3600,
        iss: 'pmp-learning-system',
      }

      const token = jwt.sign(payload, process.env.NEXTAUTH_SECRET || '')

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })

      const result = await validateJWT(request)

      expect(result.isValid).toBe(false)
      expect(result.reason).toBe('Token issued in the future')
    })

    it('不正なissuerを持つトークンを拒否する', async () => {
      const payload = {
        sub: 'user123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        iss: 'malicious-system',
      }

      const token = jwt.sign(payload, process.env.NEXTAUTH_SECRET || '')

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })

      const result = await validateJWT(request)

      expect(result.isValid).toBe(false)
      expect(result.reason).toBe('Invalid issuer')
    })

    it('トークンが提供されていない場合を正しく処理する', async () => {
      const request = new NextRequest('http://localhost:3000/api/test')

      const result = await validateJWT(request)

      expect(result.isValid).toBe(false)
      expect(result.reason).toBe('No token provided')
    })

    it('Cookieからトークンを正しく読み取る', async () => {
      const payload = {
        sub: 'user123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        iss: 'pmp-learning-system',
      }

      const token = jwt.sign(payload, process.env.NEXTAUTH_SECRET || '')

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          cookie: `next-auth.session-token=${token}`,
        },
      })

      const result = await validateJWT(request)

      expect(result.isValid).toBe(true)
      expect(result.decoded?.sub).toBe('user123')
    })
  })

  describe('generateSecureToken', () => {
    it('指定した長さのセキュアなトークンを生成する', () => {
      const token = generateSecureToken(32)

      expect(token).toHaveLength(64) // hex文字列なので32バイト = 64文字
      expect(token).toMatch(/^[a-f0-9]+$/)
    })

    it('異なる呼び出しで異なるトークンを生成する', () => {
      const token1 = generateSecureToken(16)
      const token2 = generateSecureToken(16)

      expect(token1).not.toBe(token2)
    })
  })

  describe('verifyHMACSignature', () => {
    it('正しいHMAC署名を検証する', async () => {
      const secret = 'webhook-secret-key'
      const payload = '{"event":"user.created","data":{"id":"user123"}}'
      const crypto = await import('crypto')
      const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex')

      const result = verifyHMACSignature(payload, expectedSignature, secret)

      expect(result).toBe(true)
    })

    it('不正なHMAC署名を拒否する', () => {
      const secret = 'webhook-secret-key'
      const payload = '{"event":"user.created","data":{"id":"user123"}}'
      const wrongSignature = 'invalid-signature-hash'

      const result = verifyHMACSignature(payload, wrongSignature, secret)

      expect(result).toBe(false)
    })

    it('異なるペイロードに対する署名を拒否する', async () => {
      const secret = 'webhook-secret-key'
      const originalPayload = '{"event":"user.created","data":{"id":"user123"}}'
      const modifiedPayload = '{"event":"user.deleted","data":{"id":"user123"}}'

      const crypto = await import('crypto')
      const signature = crypto.createHmac('sha256', secret).update(originalPayload).digest('hex')

      const result = verifyHMACSignature(modifiedPayload, signature, secret)

      expect(result).toBe(false)
    })
  })

  describe('レート制限とセキュリティ', () => {
    it('セキュリティヘッダーが正しく設定される', async () => {
      const request = new NextRequest('http://localhost:3000/')

      // getTokenをモックして認証不要のルートをテスト
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const { getToken } = require('next-auth/jwt')
      getToken.mockResolvedValue(null)

      const response = await authMiddleware(request)

      expect(response.headers.get('X-Frame-Options')).toBe('DENY')
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block')
      expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
      expect(response.headers.get('Strict-Transport-Security')).toContain('max-age=31536000')
      expect(response.headers.get('Content-Security-Policy')).toContain("default-src 'self'")
    })

    it('認証が必要なルートで未認証ユーザーをリダイレクトする', async () => {
      const request = new NextRequest('http://localhost:3000/dashboard')

      // getTokenをモックして未認証状態をシミュレート
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const { getToken } = require('next-auth/jwt')
      getToken.mockResolvedValue(null)

      const response = await authMiddleware(request)

      expect(response.status).toBe(307) // リダイレクトレスポンス
      expect(response.headers.get('Location')).toContain('/auth/signin')
    })

    it('管理者専用ルートで権限チェックを行う', async () => {
      const request = new NextRequest('http://localhost:3000/admin')

      // 一般ユーザーをモック
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const { getToken } = require('next-auth/jwt')
      getToken.mockResolvedValue({
        sub: 'user123',
        role: 'USER',
        subscriptionPlan: 'FREE',
        subscriptionActive: true,
      })

      const response = await authMiddleware(request)

      expect(response.status).toBe(403) // Forbidden
      const body = await response.json()
      expect(body.error).toBe('Forbidden')
      expect(body.message).toBe('管理者権限が必要です')
    })
  })

  describe('エラーハンドリング', () => {
    it('JWTシークレットが設定されていない場合のエラーハンドリング', async () => {
      delete process.env.NEXTAUTH_SECRET

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer some-token',
        },
      })

      const result = await validateJWT(request)

      expect(result.isValid).toBe(false)
      expect(result.reason).toBe('JWT secret not configured')

      // テスト後にシークレットを復元
      process.env.NEXTAUTH_SECRET = 'test-secret-key-for-jwt-validation'
    })

    it('不正なJWT形式のエラーハンドリング', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer invalid-jwt-format',
        },
      })

      const result = await validateJWT(request)

      expect(result.isValid).toBe(false)
      expect(result.reason).toBe('Invalid token signature')
    })
  })
})
