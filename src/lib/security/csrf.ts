import { ValidationService } from './validation'
import { randomBytes, createHmac, timingSafeEqual } from 'crypto'
import Redis from 'ioredis'
import { getRedisClient } from './rateLimiting'

export interface CSRFToken {
  token: string
  expiresAt: number
  userId?: string
  sessionId?: string
  fingerprint?: string
  nonce?: string
}

export interface CSRFConfig {
  tokenExpiry: number // milliseconds
  cookieName: string
  headerName: string
  secretKey: string
  doubleSubmitCookie: boolean
  sameSite: 'strict' | 'lax' | 'none'
  secure: boolean
  rotationInterval: number
  maxTokensPerUser: number
}

export interface CSRFValidationResult {
  valid: boolean
  error?: string
  riskScore?: number
  recommendations?: string[]
}

export class CSRFProtection {
  private config: CSRFConfig
  private tokenStore: Map<string, CSRFToken> = new Map()
  private redis: Redis | null = null
  private readonly DEFAULT_EXPIRY = 3600000 // 1 hour
  private rotationTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<CSRFConfig> = {}) {
    this.config = {
      tokenExpiry: config.tokenExpiry || this.DEFAULT_EXPIRY,
      cookieName: config.cookieName || 'csrf-token',
      headerName: config.headerName || 'X-CSRF-Token',
      secretKey: config.secretKey || this.generateSecretKey(),
      doubleSubmitCookie: config.doubleSubmitCookie ?? true,
      sameSite: config.sameSite || 'strict',
      secure: config.secure ?? process.env.NODE_ENV === 'production',
      rotationInterval: config.rotationInterval || 3600000, // 1時間
      maxTokensPerUser: config.maxTokensPerUser || 5,
    }

    this.initializeRedis()
    this.startTokenRotation()
  }

  private async initializeRedis(): Promise<void> {
    try {
      this.redis = await getRedisClient()
    } catch (error) {
      console.warn('CSRF: Redis not available, using in-memory storage:', error)
    }
  }

  /**
   * Generate a new CSRF token with enhanced security
   */
  async generateToken(userId?: string, sessionId?: string, fingerprint?: string): Promise<string> {
    try {
      // ユーザーのトークン数制限チェック
      if (userId) {
        await this.enforceTokenLimit(userId)
      }

      // 暗号学的に安全なランダムトークン生成
      const nonce = randomBytes(16).toString('hex')
      const timestamp = Date.now().toString()
      const context = [userId, sessionId, fingerprint, timestamp].filter(Boolean).join('|')

      // HMAC署名付きトークン
      const hmac = createHmac('sha256', this.config.secretKey)
      hmac.update(nonce + context)
      const signature = hmac.digest('hex')

      const tokenValue = `${nonce}.${timestamp}.${signature}`
      const expiresAt = Date.now() + this.config.tokenExpiry

      const token: CSRFToken = {
        token: tokenValue,
        expiresAt,
        userId,
        sessionId,
        fingerprint,
        nonce,
      }

      // Redis または メモリに保存
      await this.storeToken(tokenValue, token)

      return tokenValue
    } catch (error) {
      console.error('CSRF token generation error:', error)
      throw new Error('Failed to generate CSRF token')
    }
  }

  /**
   * Enhanced CSRF token validation with integrity checking
   */
  async validateToken(
    tokenValue: string,
    userId?: string,
    sessionId?: string,
    fingerprint?: string
  ): Promise<CSRFValidationResult> {
    const result: CSRFValidationResult = {
      valid: false,
      riskScore: 0,
      recommendations: [],
    }

    try {
      if (!tokenValue || typeof tokenValue !== 'string') {
        result.error = 'Missing or invalid token format'
        result.riskScore = 100
        return result
      }

      // トークン構造の検証
      const parts = tokenValue.split('.')
      if (parts.length !== 3) {
        result.error = 'Malformed token structure'
        result.riskScore = 90
        result.recommendations.push('Token tampering detected')
        return result
      }

      const [nonce, timestamp, providedSignature] = parts

      // タイムスタンプ検証
      const tokenTimestamp = parseInt(timestamp)
      const now = Date.now()
      const age = now - tokenTimestamp

      if (age > this.config.tokenExpiry) {
        result.error = 'Token expired'
        result.riskScore = 30
        result.recommendations.push('Request new token')
        // 期限切れトークンを削除
        await this.removeToken(tokenValue)
        return result
      }

      // 異常に古い/新しいタイムスタンプの検知
      if (age < -5000 || age > this.config.tokenExpiry) {
        // 5秒の許容範囲
        result.error = 'Invalid token timestamp'
        result.riskScore = 80
        result.recommendations.push('Potential replay attack')
        return result
      }

      // ストレージからトークン取得
      const storedToken = await this.getToken(tokenValue)
      if (!storedToken) {
        result.error = 'Token not found or invalidated'
        result.riskScore = 70
        result.recommendations.push('Token may have been used or invalidated')
        return result
      }

      // HMAC署名検証
      const context = [userId, sessionId, fingerprint, timestamp].filter(Boolean).join('|')
      const hmac = createHmac('sha256', this.config.secretKey)
      hmac.update(nonce + context)
      const expectedSignature = hmac.digest('hex')

      // タイミング攻撃耐性のある比較
      if (
        providedSignature.length !== expectedSignature.length ||
        !timingSafeEqual(
          Buffer.from(providedSignature, 'hex'),
          Buffer.from(expectedSignature, 'hex')
        )
      ) {
        result.error = 'Invalid token signature'
        result.riskScore = 95
        result.recommendations.push('Token integrity compromised')
        return result
      }

      // コンテキスト検証
      if (userId && storedToken.userId && storedToken.userId !== userId) {
        result.error = 'User context mismatch'
        result.riskScore = 85
        result.recommendations.push('Potential session hijacking')
        return result
      }

      if (sessionId && storedToken.sessionId && storedToken.sessionId !== sessionId) {
        result.error = 'Session context mismatch'
        result.riskScore = 85
        result.recommendations.push('Session mismatch detected')
        return result
      }

      // フィンガープリント検証（任意）
      if (fingerprint && storedToken.fingerprint && storedToken.fingerprint !== fingerprint) {
        result.riskScore = 40 // 警告レベル
        result.recommendations.push('Device fingerprint changed')
      }

      // 使い捨てトークンとして削除（オプション）
      if (process.env.CSRF_ONE_TIME_USE === 'true') {
        await this.removeToken(tokenValue)
      }

      result.valid = true
      return result
    } catch (error) {
      console.error('CSRF token validation error:', error)
      result.error = 'Validation system error'
      result.riskScore = 60
      result.recommendations.push('System error during validation')
      return result
    }
  }

  /**
   * Invalidate a token
   */
  async invalidateToken(tokenValue: string): Promise<void> {
    await this.removeToken(tokenValue)
  }

  /**
   * Redis/Memory token storage
   */
  private async storeToken(tokenValue: string, token: CSRFToken): Promise<void> {
    if (this.redis) {
      const key = `csrf:${tokenValue}`
      await this.redis.setex(key, Math.ceil(this.config.tokenExpiry / 1000), JSON.stringify(token))
    } else {
      this.tokenStore.set(tokenValue, token)
      this.cleanupExpiredTokens()
    }
  }

  /**
   * Get token from storage
   */
  private async getToken(tokenValue: string): Promise<CSRFToken | null> {
    if (this.redis) {
      const key = `csrf:${tokenValue}`
      const stored = await this.redis.get(key)
      return stored ? JSON.parse(stored) : null
    } else {
      return this.tokenStore.get(tokenValue) || null
    }
  }

  /**
   * Remove token from storage
   */
  private async removeToken(tokenValue: string): Promise<void> {
    if (this.redis) {
      const key = `csrf:${tokenValue}`
      await this.redis.del(key)
    } else {
      this.tokenStore.delete(tokenValue)
    }
  }

  /**
   * Enforce token limit per user
   */
  private async enforceTokenLimit(userId: string): Promise<void> {
    if (this.redis) {
      const userTokensKey = `csrf:user:${userId}`
      const tokenCount = await this.redis.zcard(userTokensKey)

      if (tokenCount >= this.config.maxTokensPerUser) {
        // 最も古いトークンを削除
        const oldestTokens = await this.redis.zrange(userTokensKey, 0, 0, 'WITHSCORES')
        if (oldestTokens.length > 0) {
          const oldestToken = oldestTokens[0]
          await this.removeToken(oldestToken)
          await this.redis.zrem(userTokensKey, oldestToken)
        }
      }
    }
  }

  /**
   * Track user tokens
   */
  private async trackUserToken(userId: string, tokenValue: string): Promise<void> {
    if (this.redis && userId) {
      const userTokensKey = `csrf:user:${userId}`
      const now = Date.now()
      await this.redis.zadd(userTokensKey, now, tokenValue)
      await this.redis.expire(userTokensKey, Math.ceil(this.config.tokenExpiry / 1000))
    }
  }

  /**
   * Enhanced Double Submit Cookie implementation
   */
  async setDoubleSubmitCookie(
    tokenValue: string,
    response?: any,
    options: {
      secure?: boolean
      sameSite?: 'strict' | 'lax' | 'none'
      domain?: string
      path?: string
    } = {}
  ): Promise<void> {
    const cookieOptions = {
      secure: options.secure ?? this.config.secure,
      sameSite: options.sameSite ?? this.config.sameSite,
      domain: options.domain,
      path: options.path ?? '/',
      maxAge: Math.floor(this.config.tokenExpiry / 1000),
      httpOnly: true,
    }

    if (this.config.doubleSubmitCookie) {
      // 筲名化されたトークンでDouble Submit Cookieを実装
      const hmac = createHmac('sha256', this.config.secretKey)
      hmac.update(tokenValue)
      const cookieToken = hmac.digest('hex').substring(0, 32)

      if (response) {
        // Server-side cookie setting
        response.cookie(this.config.cookieName, cookieToken, cookieOptions)
        // Additional cookie for CSRF double submit
        response.cookie(`${this.config.cookieName}-double`, tokenValue, {
          ...cookieOptions,
          httpOnly: false, // クライアントサイドでアクセス可能
        })
      } else if (typeof document !== 'undefined') {
        // Client-side cookie setting
        document.cookie = `${this.config.cookieName}=${cookieToken}; ${this.serializeCookieOptions(cookieOptions)}`
        document.cookie = `${this.config.cookieName}-double=${tokenValue}; ${this.serializeCookieOptions({ ...cookieOptions, httpOnly: false })}`
      }
    } else {
      // 通常のシングルクッキー
      if (response) {
        response.cookie(this.config.cookieName, tokenValue, cookieOptions)
      } else if (typeof document !== 'undefined') {
        document.cookie = `${this.config.cookieName}=${tokenValue}; ${this.serializeCookieOptions(cookieOptions)}`
      }
    }
  }

  /**
   * Serialize cookie options
   */
  private serializeCookieOptions(options: any): string {
    const parts: string[] = []

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'boolean' && value) {
          parts.push(key)
        } else if (typeof value !== 'boolean') {
          parts.push(`${key}=${value}`)
        }
      }
    })

    return parts.join('; ')
  }

  /**
   * Get CSRF token from cookie (enhanced for double submit)
   */
  getTokenFromCookie(request?: any): { cookieToken?: string; headerToken?: string } | null {
    const getCookieValue = (name: string): string | null => {
      if (request && request.cookies) {
        // Server-side
        return request.cookies[name] || null
      } else if (typeof document !== 'undefined') {
        // Client-side
        const cookies = document.cookie.split(';')
        const cookie = cookies.find((c) => c.trim().startsWith(`${name}=`))
        return cookie ? cookie.split('=')[1].trim() : null
      }
      return null
    }

    if (this.config.doubleSubmitCookie) {
      return {
        cookieToken: getCookieValue(this.config.cookieName),
        headerToken: getCookieValue(`${this.config.cookieName}-double`),
      }
    } else {
      const token = getCookieValue(this.config.cookieName)
      return token ? { cookieToken: token } : null
    }
  }

  /**
   * Create CSRF-protected fetch wrapper
   */
  createProtectedFetch(): (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> {
    return async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
      const method = init.method?.toUpperCase() || 'GET'

      // Only protect state-changing methods
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        // Get current token
        let token = this.getTokenFromCookie()

        // Generate new token if none exists
        if (!token) {
          token = this.generateToken()
          this.setTokenCookie(token)
        }

        // Add CSRF token to headers
        const headers = new Headers(init.headers)
        headers.set(this.config.headerName, token)

        init.headers = headers
      }

      return fetch(input, init)
    }
  }

  /**
   * Validate request for CSRF token
   */
  validateRequest(
    request: {
      method: string
      headers: { [key: string]: string }
      cookies?: { [key: string]: string }
    },
    userId?: string
  ): { valid: boolean; error?: string } {
    const method = request.method.toUpperCase()

    // Only validate state-changing methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return { valid: true }
    }

    // Get token from header
    const tokenFromHeader =
      request.headers[this.config.headerName] ||
      request.headers[this.config.headerName.toLowerCase()]

    if (!tokenFromHeader) {
      return { valid: false, error: 'CSRF token missing from header' }
    }

    // Validate token
    const isValid = this.validateToken(tokenFromHeader, userId)

    if (!isValid) {
      return { valid: false, error: 'Invalid or expired CSRF token' }
    }

    return { valid: true }
  }

  /**
   * Enhanced middleware with comprehensive protection
   */
  middleware() {
    return async (req: any, res: any, next: any) => {
      try {
        // Enhanced CSRF token generation
        req.generateCSRFToken = async (userId?: string, sessionId?: string) => {
          const fingerprint = this.generateFingerprint(req)
          const token = await this.generateToken(userId, sessionId, fingerprint)

          await this.setDoubleSubmitCookie(token, res)

          if (userId) {
            await this.trackUserToken(userId, token)
          }

          return token
        }

        // CSRF token refresh endpoint
        if (req.path === '/api/csrf/refresh' && req.method === 'POST') {
          const newToken = await req.generateCSRFToken(req.user?.id, req.sessionID)
          return res.json({ token: newToken })
        }

        // Safe methods don't require CSRF protection
        if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
          return next()
        }

        // Enhanced CSRF validation for state-changing requests
        const fingerprint = this.generateFingerprint(req)
        const validation = await this.validateEnhancedRequest(
          req,
          req.user?.id,
          req.sessionID,
          fingerprint
        )

        if (!validation.valid) {
          console.warn('CSRF validation failed:', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            userId: req.user?.id,
            error: validation.error,
            riskScore: validation.riskScore,
          })

          return res.status(403).json({
            error: 'CSRF validation failed',
            message: validation.error,
            riskScore: validation.riskScore,
            recommendations: validation.recommendations,
            code: 'CSRF_VALIDATION_FAILED',
          })
        }

        // Log high-risk validations
        if (validation.riskScore && validation.riskScore > 40) {
          console.warn('High-risk CSRF validation:', {
            ip: req.ip,
            userId: req.user?.id,
            riskScore: validation.riskScore,
            recommendations: validation.recommendations,
          })
        }

        next()
      } catch (error) {
        console.error('CSRF middleware error:', error)
        return res.status(500).json({
          error: 'CSRF system error',
          message: 'Internal security system error',
          code: 'CSRF_SYSTEM_ERROR',
        })
      }
    }
  }

  /**
   * Enhanced request validation
   */
  private async validateEnhancedRequest(
    request: any,
    userId?: string,
    sessionId?: string,
    fingerprint?: string
  ): Promise<CSRFValidationResult> {
    const method = request.method.toUpperCase()

    // Skip validation for safe methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return { valid: true }
    }

    let tokenFromHeader =
      request.headers[this.config.headerName] ||
      request.headers[this.config.headerName.toLowerCase()]

    if (this.config.doubleSubmitCookie) {
      // Double Submit Cookie validation
      const cookieTokens = this.getTokenFromCookie(request)

      if (!cookieTokens?.cookieToken || !cookieTokens?.headerToken) {
        return {
          valid: false,
          error: 'Missing double submit cookie tokens',
          riskScore: 80,
          recommendations: ['Double submit cookie validation required'],
        }
      }

      // Validate cookie token matches header token (after HMAC)
      const hmac = createHmac('sha256', this.config.secretKey)
      hmac.update(cookieTokens.headerToken)
      const expectedCookieToken = hmac.digest('hex').substring(0, 32)

      if (cookieTokens.cookieToken !== expectedCookieToken) {
        return {
          valid: false,
          error: 'Double submit cookie mismatch',
          riskScore: 95,
          recommendations: ['Potential CSRF attack detected'],
        }
      }

      tokenFromHeader = cookieTokens.headerToken
    }

    if (!tokenFromHeader) {
      return {
        valid: false,
        error: 'CSRF token missing from request',
        riskScore: 70,
        recommendations: ['Include CSRF token in request headers'],
      }
    }

    // Validate token integrity and context
    return await this.validateToken(tokenFromHeader, userId, sessionId, fingerprint)
  }

  /**
   * Generate device/request fingerprint
   */
  private generateFingerprint(request: any): string {
    const components = [
      request.get('User-Agent') || '',
      request.get('Accept-Language') || '',
      request.get('Accept-Encoding') || '',
      request.ip || '',
    ].join('|')

    const hmac = createHmac('sha256', this.config.secretKey)
    hmac.update(components)
    return hmac.digest('hex').substring(0, 16)
  }

  /**
   * Create form with CSRF token (for server-side rendering)
   */
  createFormWithToken(formHTML: string, userId?: string): string {
    const token = this.generateToken(userId)
    const hiddenInput = `<input type="hidden" name="csrf_token" value="${token}" />`

    // Insert hidden input after opening form tag
    return formHTML.replace(/(<form[^>]*>)/i, `$1\n${hiddenInput}`)
  }

  /**
   * Verify form submission token
   */
  verifyFormToken(formData: { [key: string]: any }, userId?: string): boolean {
    const token = formData.csrf_token || formData._token
    return this.validateToken(token, userId)
  }

  /**
   * Get token statistics
   */
  getTokenStats(): {
    totalTokens: number
    expiredTokens: number
    validTokens: number
  } {
    const now = Date.now()
    let expired = 0
    let valid = 0

    for (const token of this.tokenStore.values()) {
      if (now > token.expiresAt) {
        expired++
      } else {
        valid++
      }
    }

    return {
      totalTokens: this.tokenStore.size,
      expiredTokens: expired,
      validTokens: valid,
    }
  }

  /**
   * Clean up expired tokens
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now()
    for (const [key, token] of this.tokenStore.entries()) {
      if (now > token.expiresAt) {
        this.tokenStore.delete(key)
      }
    }
  }

  /**
   * Generate secret key for token signing
   */
  private generateSecretKey(): string {
    return ValidationService.generateSecureToken(64)
  }

  /**
   * Clear all tokens (for testing)
   */
  clearAllTokens(): void {
    this.tokenStore.clear()
  }

  /**
   * Start token rotation and cleanup
   */
  private startTokenRotation(): void {
    // Cleanup expired tokens every 5 minutes
    setInterval(() => {
      this.cleanupExpiredTokens()
    }, 300000)

    // Token rotation for active sessions every hour
    if (this.config.rotationInterval > 0) {
      this.rotationTimer = setInterval(() => {
        this.rotateActiveTokens()
      }, this.config.rotationInterval)
    }
  }

  /**
   * Rotate active tokens for security
   */
  private async rotateActiveTokens(): Promise<void> {
    if (!this.redis) return

    try {
      // Get all active user token keys
      const userKeys = await this.redis.keys('csrf:user:*')

      for (const userKey of userKeys) {
        const userId = userKey.split(':')[2]
        const tokens = await this.redis.zrange(userKey, 0, -1)

        // Generate new tokens to replace old ones
        for (const oldToken of tokens) {
          const storedToken = await this.getToken(oldToken)
          if (storedToken && storedToken.expiresAt > Date.now()) {
            // Generate replacement token
            const newToken = await this.generateToken(
              storedToken.userId,
              storedToken.sessionId,
              storedToken.fingerprint
            )

            // Mark old token for gradual expiry (give clients time to update)
            const graceKey = `csrf:grace:${oldToken}`
            await this.redis.setex(graceKey, 300, newToken) // 5 minutes grace

            console.info(
              `Token rotated for user ${userId}: ${oldToken.substring(0, 8)}... -> ${newToken.substring(0, 8)}...`
            )
          }
        }
      }
    } catch (error) {
      console.error('Token rotation error:', error)
    }
  }

  /**
   * Stop all timers
   */
  destroy(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer)
      this.rotationTimer = null
    }
  }
}

// Global CSRF protection instance with environment configuration
export const csrfProtection = new CSRFProtection({
  tokenExpiry: parseInt(process.env.CSRF_TOKEN_EXPIRY || '3600000'), // 1 hour default
  cookieName: process.env.CSRF_COOKIE_NAME || 'csrf-token',
  headerName: process.env.CSRF_HEADER_NAME || 'X-CSRF-Token',
  secretKey:
    process.env.CSRF_SECRET ||
    (() => {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('CSRF_SECRET must be set in production')
      }
      return 'development-secret-key-change-in-production-32-chars'
    })(),
  doubleSubmitCookie: process.env.CSRF_DOUBLE_SUBMIT !== 'false',
  sameSite: (process.env.CSRF_SAME_SITE as 'strict' | 'lax' | 'none') || 'strict',
  secure: process.env.CSRF_SECURE !== 'false',
  rotationInterval: parseInt(process.env.CSRF_ROTATION_INTERVAL || '3600000'),
  maxTokensPerUser: parseInt(process.env.CSRF_MAX_TOKENS_PER_USER || '5'),
})

// Enhanced React hook for CSRF token management
export function useCSRFToken(userId?: string): {
  token: string | null
  generateToken: () => Promise<string>
  validateToken: (token: string) => Promise<CSRFValidationResult>
  protectedFetch: typeof fetch
  refreshToken: () => Promise<string>
  clearToken: () => void
} {
  const generateToken = async (): Promise<string> => {
    const token = await csrfProtection.generateToken(userId)
    await csrfProtection.setDoubleSubmitCookie(token)
    return token
  }

  const validateToken = async (token: string): Promise<CSRFValidationResult> => {
    return await csrfProtection.validateToken(token, userId)
  }

  const refreshToken = async (): Promise<string> => {
    // Clear old token and generate new one
    const oldTokens = csrfProtection.getTokenFromCookie()
    if (oldTokens?.headerToken) {
      await csrfProtection.invalidateToken(oldTokens.headerToken)
    }

    return await generateToken()
  }

  const clearToken = (): void => {
    if (typeof document !== 'undefined') {
      document.cookie = `${csrfProtection.config.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      if (csrfProtection.config.doubleSubmitCookie) {
        document.cookie = `${csrfProtection.config.cookieName}-double=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      }
    }
  }

  const protectedFetch = async (
    input: RequestInfo | URL,
    init: RequestInit = {}
  ): Promise<Response> => {
    const method = init.method?.toUpperCase() || 'GET'

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      // Get or generate token
      const tokens = csrfProtection.getTokenFromCookie()
      let token: string

      if (csrfProtection.config.doubleSubmitCookie && tokens?.headerToken) {
        token = tokens.headerToken
      } else if (!csrfProtection.config.doubleSubmitCookie && tokens?.cookieToken) {
        token = tokens.cookieToken
      } else {
        token = await generateToken()
      }

      // Add CSRF token to headers
      const headers = new Headers(init.headers)
      headers.set(csrfProtection.config.headerName, token)
      init.headers = headers
    }

    return fetch(input, init)
  }

  const tokens = csrfProtection.getTokenFromCookie()
  const currentToken = csrfProtection.config.doubleSubmitCookie
    ? tokens?.headerToken
    : tokens?.cookieToken

  return {
    token: currentToken || null,
    generateToken,
    validateToken,
    protectedFetch,
    refreshToken,
    clearToken,
  }
}

export default CSRFProtection
