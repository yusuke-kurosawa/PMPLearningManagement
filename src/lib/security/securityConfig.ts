/**
 * セキュリティ設定の型定義と検証
 * P0脆弱性対策: 本番環境での厳格なセキュリティチェック
 */

import { logger } from '../../services/logger'

/**
 * セキュリティ環境変数の必須項目
 */
export interface SecurityEnvironmentVars {
  ENCRYPTION_MASTER_KEY: string
  HASH_PEPPER: string
  APP_SECRET: string
  ENCRYPTION_KEY_ROTATION_INTERVAL?: string
  ENCRYPTION_KEY_DERIVATION_ITERATIONS?: string
}

/**
 * セキュリティ設定の検証結果
 */
export interface SecurityValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  environment: 'production' | 'development' | 'test'
}

/**
 * 本番環境判定
 */
export function isProductionEnvironment(): boolean {
  // 複数の条件で本番環境を判定
  const checks = [
    process.env.NODE_ENV === 'production',
    process.env.REACT_APP_ENV === 'production',
    typeof window !== 'undefined' && !window.location.hostname.includes('localhost'),
    typeof window !== 'undefined' && window.location.protocol === 'https:',
    typeof window !== 'undefined' && window.location.hostname.includes('github.io')
  ]

  // いずれか1つでも本番環境の条件を満たす場合
  return checks.some(check => check === true)
}

/**
 * セキュリティ環境変数の検証
 */
export function validateSecurityEnvironment(): SecurityValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const isProd = isProductionEnvironment()
  const environment = isProd ? 'production' : (process.env.NODE_ENV === 'test' ? 'test' : 'development')

  // 必須環境変数のチェック
  const requiredVars: (keyof SecurityEnvironmentVars)[] = [
    'ENCRYPTION_MASTER_KEY',
    'HASH_PEPPER',
    'APP_SECRET'
  ]

  // 本番環境での必須チェック
  if (isProd) {
    requiredVars.forEach(varName => {
      const value = process.env[varName]

      if (!value) {
        errors.push(`Missing required security variable: ${varName}`)
      } else {
        // 値の強度チェック
        switch (varName) {
          case 'ENCRYPTION_MASTER_KEY':
            if (value.length < 64) { // 32バイト = 64文字（16進数）
              errors.push(`${varName} is too short (minimum 64 characters for 256-bit key)`)
            }
            if (value === 'default' || value.includes('test') || value.includes('demo')) {
              errors.push(`${varName} contains weak or default value`)
            }
            break

          case 'HASH_PEPPER':
            if (value.length < 32) { // 16バイト = 32文字（16進数）
              errors.push(`${varName} is too short (minimum 32 characters)`)
            }
            break

          case 'APP_SECRET':
            if (value.length < 32) {
              errors.push(`${varName} is too short (minimum 32 characters)`)
            }
            if (value === 'default-app-secret-change-in-production') {
              errors.push(`${varName} is using default development value`)
            }
            break
        }
      }
    })

    // 追加のセキュリティチェック
    if (typeof window !== 'undefined') {
      // ブラウザ環境でのチェック
      if (window.location.protocol !== 'https:') {
        warnings.push('Production environment should use HTTPS')
      }

      // LocalStorageとSessionStorageの使用チェック
      try {
        const localStorageKeys = Object.keys(localStorage)
        const sensitivePatterns = ['key', 'token', 'password', 'secret', 'credential']

        localStorageKeys.forEach(key => {
          if (sensitivePatterns.some(pattern => key.toLowerCase().includes(pattern))) {
            warnings.push(`Potentially sensitive data in localStorage: ${key}`)
          }
        })
      } catch {
        // LocalStorage アクセスエラーは無視
      }
    }
  }

  // 開発環境での警告
  if (!isProd) {
    if (!process.env.ENCRYPTION_MASTER_KEY) {
      warnings.push('Using auto-generated encryption key (development only)')
    }
    if (!process.env.HASH_PEPPER) {
      warnings.push('Using auto-generated hash pepper (development only)')
    }
    if (!process.env.APP_SECRET) {
      warnings.push('Using default app secret (development only)')
    }
  }

  const isValid = errors.length === 0

  // ログ出力
  if (!isValid) {
    logger.error('Security validation failed', { errors, warnings, environment })
  } else if (warnings.length > 0) {
    logger.warn('Security validation passed with warnings', { warnings, environment })
  } else {
    logger.info('Security validation passed', { environment })
  }

  return {
    isValid,
    errors,
    warnings,
    environment
  }
}

/**
 * セキュリティヘッダーの生成
 */
export function generateSecurityHeaders(): Record<string, string> {
  const isProd = isProductionEnvironment()

  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    ...(isProd && {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': generateCSPHeader()
    })
  }
}

/**
 * CSPヘッダーの生成
 */
function generateCSPHeader(): string {
  const isProd = isProductionEnvironment()

  const directives = [
    `default-src 'self'`,
    `script-src 'self' ${isProd ? '' : "'unsafe-inline' 'unsafe-eval'"}`.trim(),
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https:`,
    `font-src 'self' data:`,
    `connect-src 'self' https://api.supabase.co https://api.github.com`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `upgrade-insecure-requests`
  ]

  return directives.join('; ')
}

/**
 * セキュリティ初期化チェック
 */
export async function initializeSecurity(): Promise<boolean> {
  const validation = validateSecurityEnvironment()

  if (!validation.isValid) {
    const errorMessage = `Security initialization failed:\n${validation.errors.join('\n')}`

    if (isProductionEnvironment()) {
      // 本番環境では起動を阻止
      logger.error('CRITICAL SECURITY ERROR', { errors: validation.errors })

      // ブラウザ環境の場合はアラート表示
      if (typeof window !== 'undefined') {
        // セキュリティエラーページへリダイレクト
        window.location.href = '/security-error.html'
      }

      throw new Error(errorMessage)
    } else {
      // 開発環境では警告のみ
      logger.warn('Security check failed (development mode)', validation)
      return false
    }
  }

  return true
}

// デフォルトエクスポート
export default {
  isProductionEnvironment,
  validateSecurityEnvironment,
  generateSecurityHeaders,
  initializeSecurity
}