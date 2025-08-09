# セキュリティ実装計画書

## 緊急対応プラン（1-2週間）

### 1. 認証システムの実装

```typescript
// src/server/auth/config.ts
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '~/server/db'
import { verifyPassword, hashPassword } from '~/server/auth/password'

export const authOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.passwordHash) return null

        const isValid = await verifyPassword(credentials.password, user.passwordHash)

        if (!isValid) return null

        // セキュリティログ記録
        await logSecurityEvent({
          userId: user.id,
          action: 'LOGIN_SUCCESS',
          ipAddress: context.req.ip,
          userAgent: context.req.headers['user-agent'],
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 60, // 30分
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      await logSecurityEvent({
        userId: user.id,
        action: 'LOGIN_SUCCESS',
        metadata: { provider: account?.provider, isNewUser },
      })
    },
    async signOut({ token }) {
      await logSecurityEvent({
        userId: token?.userId as string,
        action: 'LOGOUT',
      })
    },
  },
}
```

### 2. 強化されたパスワードセキュリティ

```typescript
// src/server/auth/password.ts
import argon2 from 'argon2'
import { createHash, randomBytes } from 'crypto'
import axios from 'axios'

const PEPPER = process.env.PASSWORD_PEPPER!
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16, // 64MB
  timeCost: 3,
  parallelism: 1,
}

export async function hashPassword(password: string): Promise<string> {
  // パスワード強度チェック
  const strength = await validatePasswordStrength(password)
  if (!strength.isValid) {
    throw new Error(`パスワード要件未満: ${strength.errors.join(', ')}`)
  }

  // データ漏洩チェック
  const isCompromised = await checkPasswordBreach(password)
  if (isCompromised) {
    throw new Error('このパスワードは過去のデータ漏洩で発見されています')
  }

  // Pepper追加
  const pepperedPassword = password + PEPPER

  // Argon2ハッシュ化
  return argon2.hash(pepperedPassword, ARGON2_OPTIONS)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const pepperedPassword = password + PEPPER
  return argon2.verify(hashedPassword, pepperedPassword)
}

interface PasswordStrength {
  isValid: boolean
  score: number // 0-100
  errors: string[]
}

export async function validatePasswordStrength(password: string): Promise<PasswordStrength> {
  const errors: string[] = []
  let score = 0

  // 長さチェック
  if (password.length < 12) {
    errors.push('パスワードは12文字以上必要です')
  } else {
    score += Math.min(password.length * 2, 20)
  }

  // 文字種チェック
  const patterns = [
    { regex: /[a-z]/, message: '小文字が必要です', points: 10 },
    { regex: /[A-Z]/, message: '大文字が必要です', points: 10 },
    { regex: /[0-9]/, message: '数字が必要です', points: 10 },
    { regex: /[^a-zA-Z0-9]/, message: '記号が必要です', points: 15 },
  ]

  for (const pattern of patterns) {
    if (pattern.regex.test(password)) {
      score += pattern.points
    } else {
      errors.push(pattern.message)
    }
  }

  // よくあるパスワードチェック
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'password123']

  if (commonPasswords.some((common) => password.toLowerCase().includes(common.toLowerCase()))) {
    errors.push('よくあるパスワードパターンは使用できません')
    score -= 20
  }

  return {
    isValid: errors.length === 0 && score >= 60,
    score: Math.max(0, Math.min(100, score)),
    errors,
  }
}

async function checkPasswordBreach(password: string): Promise<boolean> {
  try {
    // Have I Been Pwned APIを使用
    const sha1Hash = createHash('sha1').update(password).digest('hex').toUpperCase()
    const prefix = sha1Hash.substring(0, 5)
    const suffix = sha1Hash.substring(5)

    const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`, {
      timeout: 3000,
    })

    return response.data.split('\n').some((line: string) => line.startsWith(suffix))
  } catch (error) {
    // APIエラーの場合は侵害なしとして処理（可用性優先）
    console.warn('パスワード漏洩チェックAPIエラー:', error)
    return false
  }
}
```

### 3. セキュリティ監査ログシステム

```typescript
// src/server/security/audit-log.ts
import { db } from '~/server/db'

export enum AuditAction {
  LOGIN_ATTEMPT = 'LOGIN_ATTEMPT',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  EMAIL_CHANGE = 'EMAIL_CHANGE',
  PAYMENT_PROCESS = 'PAYMENT_PROCESS',
  DATA_EXPORT = 'DATA_EXPORT',
  ADMIN_ACTION = 'ADMIN_ACTION',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  API_ACCESS = 'API_ACCESS',
  FILE_UPLOAD = 'FILE_UPLOAD',
  PRIVILEGE_ESCALATION = 'PRIVILEGE_ESCALATION',
}

export enum RiskLevel {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4,
}

interface AuditLogEntry {
  userId?: string
  action: AuditAction
  resource?: string
  ipAddress: string
  userAgent: string
  timestamp: Date
  result: 'success' | 'failure'
  riskLevel: RiskLevel
  metadata?: Record<string, any>
  sessionId?: string
}

export class SecurityAuditLogger {
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      // データベースに記録
      await db.auditLog.create({
        data: {
          ...entry,
          metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
          fingerprint: this.generateFingerprint(entry),
        },
      })

      // Critical/Highレベルは即座にアラート
      if (entry.riskLevel >= RiskLevel.HIGH) {
        await this.sendSecurityAlert(entry)
      }

      // 異常検知
      await this.detectAnomalies(entry)
    } catch (error) {
      // ログ失敗は別途記録
      console.error('セキュリティログ記録失敗:', error)
      await this.logToFallbackSystem(entry, error)
    }
  }

  private static generateFingerprint(entry: AuditLogEntry): string {
    const data = `${entry.userId}-${entry.action}-${entry.ipAddress}-${entry.timestamp}`
    return createHash('sha256').update(data).digest('hex')
  }

  private static async detectAnomalies(entry: AuditLogEntry): Promise<void> {
    if (!entry.userId) return

    // 短時間での大量ログイン試行
    if (entry.action === AuditAction.LOGIN_FAILURE) {
      const recentFailures = await db.auditLog.count({
        where: {
          userId: entry.userId,
          action: AuditAction.LOGIN_FAILURE,
          timestamp: {
            gte: new Date(Date.now() - 15 * 60 * 1000), // 15分以内
          },
        },
      })

      if (recentFailures >= 5) {
        await this.log({
          ...entry,
          action: AuditAction.SUSPICIOUS_ACTIVITY,
          riskLevel: RiskLevel.HIGH,
          metadata: {
            anomalyType: 'BRUTE_FORCE_ATTEMPT',
            failureCount: recentFailures,
          },
        })

        // アカウント一時ロック
        await this.lockUserAccount(entry.userId!, '15 minutes')
      }
    }

    // 地理的異常検知
    await this.checkGeographicAnomaly(entry)

    // 時間帯異常検知
    await this.checkTimeAnomaly(entry)
  }

  private static async checkGeographicAnomaly(entry: AuditLogEntry): Promise<void> {
    if (!entry.userId || !entry.ipAddress) return

    try {
      const currentLocation = await this.getLocationFromIP(entry.ipAddress)

      const recentLogins = await db.auditLog.findMany({
        where: {
          userId: entry.userId,
          action: AuditAction.LOGIN_SUCCESS,
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24時間以内
          },
        },
        orderBy: { timestamp: 'desc' },
        take: 5,
      })

      // 前回ログイン地点との距離を計算
      if (recentLogins.length > 0) {
        const lastLogin = recentLogins[0]
        const lastLocation = JSON.parse(lastLogin.metadata || '{}').location

        if (lastLocation && currentLocation) {
          const distance = this.calculateDistance(lastLocation, currentLocation)
          const timeDiff = entry.timestamp.getTime() - lastLogin.timestamp.getTime()
          const maxPossibleSpeed = distance / (timeDiff / (1000 * 60 * 60)) // km/h

          // 物理的に不可能な移動速度（時速1000km以上）
          if (maxPossibleSpeed > 1000) {
            await this.log({
              ...entry,
              action: AuditAction.SUSPICIOUS_ACTIVITY,
              riskLevel: RiskLevel.HIGH,
              metadata: {
                anomalyType: 'IMPOSSIBLE_TRAVEL',
                distance: distance,
                timeHours: timeDiff / (1000 * 60 * 60),
                impliedSpeed: maxPossibleSpeed,
              },
            })
          }
        }
      }
    } catch (error) {
      // 地理的チェックエラーは警告のみ
      console.warn('地理的異常検知エラー:', error)
    }
  }

  private static async lockUserAccount(userId: string, duration: string): Promise<void> {
    const unlockTime = new Date()

    // 期間のパース
    if (duration.includes('minutes')) {
      const minutes = parseInt(duration.match(/\d+/)?.[0] || '15')
      unlockTime.setMinutes(unlockTime.getMinutes() + minutes)
    } else if (duration.includes('hours')) {
      const hours = parseInt(duration.match(/\d+/)?.[0] || '1')
      unlockTime.setHours(unlockTime.getHours() + hours)
    }

    await db.user.update({
      where: { id: userId },
      data: {
        lockedUntil: unlockTime,
        lockReason: 'SUSPICIOUS_ACTIVITY_DETECTED',
      },
    })

    // ユーザーに通知メール送信
    await this.sendAccountLockNotification(userId, unlockTime)
  }

  private static async sendSecurityAlert(entry: AuditLogEntry): Promise<void> {
    // 管理者へのSlack/Email通知
    const alertMessage = {
      title: 'セキュリティアラート',
      level: RiskLevel[entry.riskLevel],
      action: entry.action,
      userId: entry.userId,
      ipAddress: entry.ipAddress,
      timestamp: entry.timestamp,
      metadata: entry.metadata,
    }

    // 複数チャネルでアラート
    await Promise.allSettled([
      this.sendSlackAlert(alertMessage),
      this.sendEmailAlert(alertMessage),
      this.logToSIEM(alertMessage),
    ])
  }
}

// 使用例
export const logSecurityEvent = SecurityAuditLogger.log
```

### 4. API セキュリティミドルウェア

```typescript
// src/server/api/middleware/security.ts
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'
import { getClientIP, sanitizeInput } from '~/lib/utils'
import { logSecurityEvent, AuditAction, RiskLevel } from '~/server/security/audit-log'

// レート制限設定
export const createRateLimit = (
  maxRequests: number,
  windowMs: number,
  skipSuccessfulRequests = false
) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    skipSuccessfulRequests,
    message: 'リクエスト制限に達しました。しばらく待ってから再試行してください。',
    standardHeaders: true,
    legacyHeaders: false,
    handler: async (req, res) => {
      const ip = getClientIP(req)

      await logSecurityEvent({
        action: AuditAction.API_ACCESS,
        resource: req.path,
        ipAddress: ip,
        userAgent: req.headers['user-agent'] || '',
        timestamp: new Date(),
        result: 'failure',
        riskLevel: RiskLevel.MEDIUM,
        metadata: {
          reason: 'RATE_LIMIT_EXCEEDED',
          endpoint: req.path,
          method: req.method,
        },
      })

      res.status(429).json({
        error: 'Too Many Requests',
        retryAfter: windowMs / 1000,
      })
    },
  })
}

// 入力サニタイゼーション
export const inputSanitizationMiddleware = <T>() => {
  return async (opts: { input: T; ctx: any }) => {
    const sanitizedInput = sanitizeInput(opts.input)

    return {
      ...opts,
      input: sanitizedInput,
    }
  }
}

// セキュリティヘッダー設定
export const securityHeadersMiddleware = () => {
  return async (opts: { ctx: any }) => {
    const { res } = opts.ctx

    if (res) {
      // セキュリティヘッダーの設定
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.setHeader('X-Frame-Options', 'DENY')
      res.setHeader('X-XSS-Protection', '1; mode=block')
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

      // HSTS (本番環境のみ)
      if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
      }
    }

    return opts
  }
}

// RBAC (ロールベースアクセス制御)
export const rbacMiddleware = (requiredPermissions: string[]) => {
  return async (opts: { ctx: any }) => {
    const { session } = opts.ctx

    if (!session?.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: '認証が必要です',
      })
    }

    const userPermissions = await getUserPermissions(session.user.id)
    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    )

    if (!hasPermission) {
      await logSecurityEvent({
        userId: session.user.id,
        action: AuditAction.PRIVILEGE_ESCALATION,
        resource: opts.ctx.path,
        ipAddress: getClientIP(opts.ctx.req),
        userAgent: opts.ctx.req?.headers['user-agent'] || '',
        timestamp: new Date(),
        result: 'failure',
        riskLevel: RiskLevel.HIGH,
        metadata: {
          requiredPermissions,
          userPermissions,
          attemptedResource: opts.ctx.path,
        },
      })

      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'この操作を実行する権限がありません',
      })
    }

    return opts
  }
}

async function getUserPermissions(userId: string): Promise<string[]> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  })

  return user?.role?.permissions.map((p) => p.name) || []
}

// データマスキング
export const dataMaskingMiddleware = () => {
  return async (opts: { result: any; ctx: any }) => {
    const { session } = opts.ctx
    const { result } = opts

    // 管理者以外は機密データをマスク
    if (session?.user?.role !== 'ADMIN' && result) {
      return maskSensitiveData(result, session?.user?.role)
    }

    return opts
  }
}

function maskSensitiveData(data: any, userRole?: string): any {
  if (!data) return data

  // 再帰的にデータをマスク
  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item, userRole))
  }

  if (typeof data === 'object') {
    const masked = { ...data }

    // メールアドレスのマスク
    if (masked.email && userRole !== 'ADMIN') {
      const [local, domain] = masked.email.split('@')
      masked.email = `${local.substring(0, 2)}***@${domain}`
    }

    // クレジットカード情報の完全削除
    delete masked.creditCard
    delete masked.paymentMethod

    // 個人情報のマスク
    if (masked.phone && userRole !== 'ADMIN') {
      masked.phone = masked.phone.replace(/\d(?=\d{4})/g, '*')
    }

    return masked
  }

  return data
}
```

## Next.js セキュリティ設定

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.stripe.com https://api.openai.com wss:",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://checkout.stripe.com",
      "frame-ancestors 'none'",
      'upgrade-insecure-requests',
    ].join('; '),
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value:
      'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()',
  },
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },

  // セキュリティ関連の設定
  experimental: {
    serverComponentsExternalPackages: ['bcrypt', 'argon2'],
  },

  // 本番環境での最適化
  ...(process.env.NODE_ENV === 'production' && {
    compress: true,
    poweredByHeader: false,
    generateEtags: false,
  }),
}
```

## 環境変数セキュリティ

```bash
# .env.example
# データベース
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# 認証
NEXTAUTH_SECRET="..." # 32文字以上のランダム文字列
NEXTAUTH_URL="https://your-domain.com"
PASSWORD_PEPPER="..." # 64文字以上のランダム文字列

# OAuth プロバイダー
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_ID="..."
GITHUB_SECRET="..."

# 決済
STRIPE_SECRET_KEY="sk_..."
STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# 外部API
OPENAI_API_KEY="sk-..."

# セキュリティ
CSRF_SECRET="..." # 32文字以上
ENCRYPTION_KEY="..." # 32文字のランダム文字列 (AES-256)

# 監視・ログ
SENTRY_DSN="..."
LOG_LEVEL="info"

# 管理者通知
ADMIN_EMAIL="security@yourcompany.com"
SLACK_WEBHOOK_URL="..."

# レート制限
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW="900000" # 15分

# セッション設定
SESSION_MAX_AGE="1800" # 30分
REFRESH_TOKEN_MAX_AGE="604800" # 7日
```
