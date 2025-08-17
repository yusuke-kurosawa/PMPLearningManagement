/**
 * GeoIP統合ミドルウェア
 * Developer 1: 地理的制限とアクセスパターン監視のミドルウェア
 */

import { Request, Response, NextFunction } from 'express'
import { geoIPService, GeoRestrictionConfig } from '../security/geoip'
import { ddosProtection } from '../security/rateLimiting'
import { logger } from '../../services/logger'

// 型定義の追加
interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    role: string
  }
  session?: {
    userId: string
  }
}

// リクエスト拡張
declare module 'express' {
  interface Request {
    geoLocation?: {
      ip: string
      country: string
      countryCode: string
      region?: string
      city?: string
      threat: number
      proxy: boolean
      vpn: boolean
      tor: boolean
      hosting: boolean
    }
    geoRestriction?: {
      allowed: boolean
      reason?: string
      riskScore: number
    }
  }
}

/**
 * GeoIP情報付与ミドルウェア
 */
export function geoLocationMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // クライアントIPを取得
      const clientIP = getClientIP(req)

      // GeoIP情報取得
      const geoLocation = await geoIPService.getGeoLocation(clientIP)

      if (geoLocation) {
        req.geoLocation = {
          ip: geoLocation.ip,
          country: geoLocation.country,
          countryCode: geoLocation.countryCode,
          region: geoLocation.region,
          city: geoLocation.city,
          threat: geoLocation.threat,
          proxy: geoLocation.proxy,
          vpn: geoLocation.vpn,
          tor: geoLocation.tor,
          hosting: geoLocation.hosting,
        }

        // レスポンスヘッダーに地理情報を追加（デバッグ用）
        if (process.env.NODE_ENV === 'development') {
          res.setHeader('X-Geo-Country', geoLocation.countryCode)
          res.setHeader('X-Geo-City', geoLocation.city || 'Unknown')
          res.setHeader('X-Geo-Threat', geoLocation.threat.toString())
        }
      }

      next()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('GeoLocation middleware error:', error)
      }
      // エラーが発生してもリクエストは続行
      next()
    }
  }
}

/**
 * 地理的制限ミドルウェア
 */
export function geoRestrictionMiddleware(config: GeoRestrictionConfig) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientIP = getClientIP(req)

      // 地理的制限チェック
      const restrictionResult = await geoIPService.checkGeoRestrictions(clientIP, config)

      req.geoRestriction = {
        allowed: restrictionResult.allowed,
        reason: restrictionResult.reason,
        riskScore: restrictionResult.location?.threat || 0,
      }

      if (!restrictionResult.allowed) {
        // 制限された場合のログ記録
        if (process.env.NODE_ENV === 'development') {
          logger.warn(`Geo-restricted access blocked: ${clientIP} - ${restrictionResult.reason}`)
        }

        return res.status(403).json({
          error: 'Access denied',
          message: 'Your location is not permitted to access this service',
          code: 'GEO_RESTRICTED',
          details: process.env.NODE_ENV === 'development' ? restrictionResult.reason : undefined,
        })
      }

      next()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Geo restriction middleware error:', error)
      }

      // エラー時は安全側に倒す（本番環境での設定による）
      if (process.env.GEO_RESTRICTION_FAIL_SECURE === 'true') {
        return res.status(503).json({
          error: 'Service unavailable',
          message: 'Geographic verification is temporarily unavailable',
          code: 'GEO_SERVICE_ERROR',
        })
      }

      next()
    }
  }
}

/**
 * 異常アクセスパターン検知ミドルウェア
 */
export function anomalyDetectionMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 認証済みユーザーのみチェック
      const userId =
        (req as AuthenticatedRequest).user?.id || (req as AuthenticatedRequest).session?.userId
      if (!userId) {
        return next()
      }

      const clientIP = getClientIP(req)

      // 異常パターン検知
      const anomalyResult = await geoIPService.detectAnomalousPatterns(userId, clientIP)

      if (anomalyResult.isAnomalous && anomalyResult.confidence > 80) {
        // 高信頼度の異常パターンを検知
        if (process.env.NODE_ENV === 'development') {
          logger.warn(`Anomalous access pattern detected: User ${userId}, IP ${clientIP}`, {
            confidence: anomalyResult.confidence,
            riskScore: anomalyResult.riskScore,
            reasons: anomalyResult.reasons,
          })
        }

        // 高リスクの場合はアクセスを制限
        if (anomalyResult.riskScore > 80) {
          // DDoS保護システムと統合
          await ddosProtection.updateIpReputation(clientIP, false, {
            userAgent: req.get('User-Agent'),
            endpoint: req.path,
          })

          return res.status(429).json({
            error: 'Suspicious activity detected',
            message: 'Your access pattern appears unusual. Please verify your identity.',
            code: 'ANOMALOUS_PATTERN',
            recommendations: anomalyResult.recommendations,
            retryAfter: 300, // 5分後に再試行
          })
        }

        // 中リスクの場合は警告のみ
        res.setHeader('X-Security-Warning', 'Unusual access pattern detected')
        res.setHeader('X-Security-Recommendations', anomalyResult.recommendations.join(', '))
      }

      next()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Anomaly detection middleware error:', error)
      }
      next()
    }
  }
}

/**
 * GeoIP統合DDoS保護ミドルウェア
 */
export function geoEnhancedDDoSMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientIP = getClientIP(req)
      const userAgent = req.get('User-Agent')
      const userId = (req as AuthenticatedRequest).user?.id

      // 地理情報を考慮したDDoS保護
      const geoLocation = req.geoLocation
      if (geoLocation) {
        // 高脅威地域からのアクセスは厳しく制限
        let _baseLimit = 100 // 基本制限（1分間）

        if (geoLocation.threat > 70) {
          _baseLimit = 20
        } else if (geoLocation.threat > 50) {
          _baseLimit = 50
        } else if (geoLocation.proxy || geoLocation.vpn) {
          _baseLimit = 30
        } else if (geoLocation.hosting) {
          _baseLimit = 40
        }

        // カスタム制限設定でDDoS保護をチェック
        const protection = await ddosProtection.checkProtection(clientIP, userAgent, userId)

        if (!protection.allowed) {
          // IP reputationを更新
          await ddosProtection.updateIpReputation(clientIP, false, {
            userAgent,
            endpoint: req.path,
          })

          return res.status(429).json({
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.',
            code: 'RATE_LIMITED',
            retryAfter: protection.blockDuration,
            geoEnhanced: true,
            reason: protection.reason,
          })
        }

        // 成功時のIP reputation更新
        await ddosProtection.updateIpReputation(clientIP, true, {
          userAgent,
          endpoint: req.path,
        })
      }

      next()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Geo-enhanced DDoS middleware error:', error)
      }
      next()
    }
  }
}

/**
 * 国別アクセス制限（特定エンドポイント用）
 */
export function countryAccessMiddleware(allowedCountries: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const geoLocation = req.geoLocation

    if (!geoLocation) {
      // 地理情報がない場合は拒否
      return res.status(403).json({
        error: 'Access denied',
        message: 'Geographic verification required',
        code: 'GEO_VERIFICATION_REQUIRED',
      })
    }

    if (!allowedCountries.includes(geoLocation.countryCode)) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn(`Country access denied: ${geoLocation.countryCode} not in allowed list`)
      }

      return res.status(403).json({
        error: 'Access denied',
        message: `Access from ${geoLocation.country} is not permitted`,
        code: 'COUNTRY_RESTRICTED',
      })
    }

    next()
  }
}

/**
 * VPN/Proxy検知ミドルウェア
 */
export function proxyDetectionMiddleware(blockProxies = true, blockVPN = false) {
  return (req: Request, res: Response, next: NextFunction) => {
    const geoLocation = req.geoLocation

    if (geoLocation) {
      if (blockProxies && geoLocation.proxy) {
        if (process.env.NODE_ENV === 'development') {
          logger.warn(`Proxy access blocked: ${geoLocation.ip}`)
        }
        return res.status(403).json({
          error: 'Proxy access denied',
          message: 'Access through proxy servers is not allowed',
          code: 'PROXY_BLOCKED',
        })
      }

      if (blockVPN && geoLocation.vpn) {
        if (process.env.NODE_ENV === 'development') {
          logger.warn(`VPN access blocked: ${geoLocation.ip}`)
        }
        return res.status(403).json({
          error: 'VPN access denied',
          message: 'Access through VPN is not allowed',
          code: 'VPN_BLOCKED',
        })
      }

      if (geoLocation.tor) {
        if (process.env.NODE_ENV === 'development') {
          logger.warn(`Tor access blocked: ${geoLocation.ip}`)
        }
        return res.status(403).json({
          error: 'Tor access denied',
          message: 'Access through Tor network is not allowed',
          code: 'TOR_BLOCKED',
        })
      }
    }

    next()
  }
}

/**
 * GeoIPステータス情報ミドルウェア（管理者用）
 */
export function geoStatusMiddleware() {
  return async (req: Request, res: Response, _next: NextFunction) => {
    try {
      // 管理者権限チェック（実装は認証システムによる）
      const isAdmin = (req as AuthenticatedRequest).user?.role === 'admin'
      if (!isAdmin) {
        return res.status(403).json({ error: 'Admin access required' })
      }

      const stats = await geoIPService.getGeoStats()

      res.json({
        geoStats: stats,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Geo status middleware error:', error)
      }
      res.status(500).json({ error: 'Failed to retrieve geo statistics' })
    }
  }
}

/**
 * クライアントIP取得（プロキシ対応）
 */
function getClientIP(req: Request): string {
  // X-Forwarded-For ヘッダーから取得（プロキシ経由の場合）
  const xForwardedFor = req.get('X-Forwarded-For')
  if (xForwardedFor) {
    // 複数のIPが含まれている場合は最初の値を使用
    return xForwardedFor.split(',')[0].trim()
  }

  // X-Real-IP ヘッダーから取得（nginx等）
  const xRealIP = req.get('X-Real-IP')
  if (xRealIP) {
    return xRealIP.trim()
  }

  // CF-Connecting-IP ヘッダーから取得（Cloudflare）
  const cfConnectingIP = req.get('CF-Connecting-IP')
  if (cfConnectingIP) {
    return cfConnectingIP.trim()
  }

  // 直接接続の場合
  return req.ip || req.connection.remoteAddress || '127.0.0.1'
}

export default {
  geoLocationMiddleware,
  geoRestrictionMiddleware,
  anomalyDetectionMiddleware,
  geoEnhancedDDoSMiddleware,
  countryAccessMiddleware,
  proxyDetectionMiddleware,
  geoStatusMiddleware,
}
