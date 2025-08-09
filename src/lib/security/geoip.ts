/**
 * 実用的なGeoIPサービス実装
 * Developer 1: GeoIPサービス統合・IP地理的制限機能・異常アクセスパターン検知
 */

import Redis from 'ioredis'
import { z } from 'zod'
import { getRedisClient } from './rateLimiting'

// GeoIP レスポンススキーマ
const GeoLocationSchema = z.object({
  ip: z.string().ip(),
  country: z.string(),
  countryCode: z.string().length(2),
  region: z.string().optional(),
  regionCode: z.string().optional(),
  city: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  timezone: z.string().optional(),
  isp: z.string().optional(),
  org: z.string().optional(),
  proxy: z.boolean().default(false),
  vpn: z.boolean().default(false),
  tor: z.boolean().default(false),
  hosting: z.boolean().default(false),
  threat: z.number().min(0).max(100).default(0),
})

export type GeoLocation = z.infer<typeof GeoLocationSchema>

// 地理制限設定
export interface GeoRestrictionConfig {
  allowedCountries?: string[]  // 許可する国コード
  blockedCountries?: string[]  // 禁止する国コード
  allowedRegions?: string[]    // 許可する地域
  blockedRegions?: string[]    // 禁止する地域
  blockProxies?: boolean       // プロキシをブロック
  blockVpn?: boolean          // VPNをブロック
  blockTor?: boolean          // Torをブロック
  blockHosting?: boolean      // ホスティングプロバイダーをブロック
  threatThreshold?: number    // 脅威スコア閾値
}

// 異常パターン検知結果
export interface AnomalyDetectionResult {
  isAnomalous: boolean
  confidence: number  // 0-100
  reasons: string[]
  riskScore: number   // 0-100
  recommendations: string[]
}

/**
 * 統合GeoIPサービス
 * 複数のGeoIPプロバイダーを統合し、フォールバック機能を提供
 */
export class GeoIPService {
  private redis: Redis | null = null
  private cachePrefix = 'geoip'
  private cacheTTL = 24 * 60 * 60 // 24時間

  // 複数のGeoIPプロバイダー設定
  private providers = {
    ipapi: {
      url: 'http://ip-api.com/json/',
      fields: 'status,message,country,countryCode,region,regionName,city,lat,lon,timezone,isp,org,proxy,hosting',
      rateLimitPerMinute: 1000,
      free: true,
    },
    ipgeolocation: {
      url: 'https://api.ipgeolocation.io/ipgeo',
      apiKey: process.env.IPGEOLOCATION_API_KEY,
      rateLimitPerMonth: 1000,
      accuracyLevel: 'high',
    },
    maxmind: {
      url: 'https://geoip.maxmind.com/geoip/v2.1/insights/',
      userId: process.env.MAXMIND_USER_ID,
      licenseKey: process.env.MAXMIND_LICENSE_KEY,
      accuracyLevel: 'enterprise',
    },
  }

  constructor() {
    this.initializeRedis()
  }

  private async initializeRedis(): Promise<void> {
    if (!this.redis) {
      this.redis = await getRedisClient()
    }
  }

  /**
   * IPアドレスの地理情報取得（キャッシュ機能付き）
   */
  async getGeoLocation(ip: string): Promise<GeoLocation | null> {
    try {
      // IPアドレス検証
      if (!this.isValidIP(ip)) {
        throw new Error(`Invalid IP address: ${ip}`)
      }

      // プライベートIPやローカルホストの場合は特別処理
      if (this.isPrivateIP(ip)) {
        return this.getPrivateIPLocation(ip)
      }

      // キャッシュから確認
      const cached = await this.getCachedLocation(ip)
      if (cached) {
        return cached
      }

      // 複数プロバイダーから順次取得
      let geoData: GeoLocation | null = null

      // 1. IP-API (無料、高速)
      geoData = await this.fetchFromIPAPI(ip)
      if (geoData) {
        await this.cacheLocation(ip, geoData)
        return geoData
      }

      // 2. IPGeolocation (API Key必要)
      if (process.env.IPGEOLOCATION_API_KEY) {
        geoData = await this.fetchFromIPGeolocation(ip)
        if (geoData) {
          await this.cacheLocation(ip, geoData)
          return geoData
        }
      }

      // 3. MaxMind (有料、高精度)
      if (process.env.MAXMIND_USER_ID && process.env.MAXMIND_LICENSE_KEY) {
        geoData = await this.fetchFromMaxMind(ip)
        if (geoData) {
          await this.cacheLocation(ip, geoData)
          return geoData
        }
      }

      // フォールバック: 基本情報のみ
      const fallbackData: GeoLocation = {
        ip,
        country: 'Unknown',
        countryCode: 'XX',
        threat: 50, // 不明な場合は中程度のリスク
      }

      await this.cacheLocation(ip, fallbackData)
      return fallbackData

    } catch (error) {
      console.error('GeoIP lookup error:', error)
      return null
    }
  }

  /**
   * IP-API からの地理情報取得
   */
  private async fetchFromIPAPI(ip: string): Promise<GeoLocation | null> {
    try {
      const response = await fetch(
        `${this.providers.ipapi.url}${ip}?fields=${this.providers.ipapi.fields}`,
        {
          timeout: 5000,
          headers: {
            'User-Agent': 'PMPLearningManagement/1.0',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`IP-API request failed: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === 'fail') {
        throw new Error(data.message || 'IP-API query failed')
      }

      return {
        ip,
        country: data.country || 'Unknown',
        countryCode: data.countryCode || 'XX',
        region: data.regionName || undefined,
        regionCode: data.region || undefined,
        city: data.city || undefined,
        latitude: data.lat || undefined,
        longitude: data.lon || undefined,
        timezone: data.timezone || undefined,
        isp: data.isp || undefined,
        org: data.org || undefined,
        proxy: data.proxy || false,
        vpn: false, // IP-APIはVPN検知なし
        tor: false, // IP-APIはTor検知なし
        hosting: data.hosting || false,
        threat: this.calculateThreatScore(data),
      }
    } catch (error) {
      console.error('IP-API fetch error:', error)
      return null
    }
  }

  /**
   * IPGeolocation からの地理情報取得
   */
  private async fetchFromIPGeolocation(ip: string): Promise<GeoLocation | null> {
    try {
      const response = await fetch(
        `${this.providers.ipgeolocation.url}?apiKey=${this.providers.ipgeolocation.apiKey}&ip=${ip}&include=security`,
        {
          timeout: 5000,
          headers: {
            'User-Agent': 'PMPLearningManagement/1.0',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`IPGeolocation request failed: ${response.status}`)
      }

      const data = await response.json()

      return {
        ip,
        country: data.country_name || 'Unknown',
        countryCode: data.country_code2 || 'XX',
        region: data.state_prov || undefined,
        city: data.city || undefined,
        latitude: parseFloat(data.latitude) || undefined,
        longitude: parseFloat(data.longitude) || undefined,
        timezone: data.time_zone?.name || undefined,
        isp: data.isp || undefined,
        org: data.organization || undefined,
        proxy: data.security?.is_proxy || false,
        vpn: data.security?.is_vpn || false,
        tor: data.security?.is_tor || false,
        hosting: data.security?.is_hosting || false,
        threat: this.calculateThreatScore(data.security),
      }
    } catch (error) {
      console.error('IPGeolocation fetch error:', error)
      return null
    }
  }

  /**
   * MaxMind からの地理情報取得
   */
  private async fetchFromMaxMind(ip: string): Promise<GeoLocation | null> {
    try {
      const auth = Buffer.from(`${process.env.MAXMIND_USER_ID}:${process.env.MAXMIND_LICENSE_KEY}`).toString('base64')
      
      const response = await fetch(
        `${this.providers.maxmind.url}${ip}`,
        {
          timeout: 5000,
          headers: {
            'Authorization': `Basic ${auth}`,
            'User-Agent': 'PMPLearningManagement/1.0',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`MaxMind request failed: ${response.status}`)
      }

      const data = await response.json()

      return {
        ip,
        country: data.country?.names?.en || 'Unknown',
        countryCode: data.country?.iso_code || 'XX',
        region: data.subdivisions?.[0]?.names?.en || undefined,
        regionCode: data.subdivisions?.[0]?.iso_code || undefined,
        city: data.city?.names?.en || undefined,
        latitude: data.location?.latitude || undefined,
        longitude: data.location?.longitude || undefined,
        timezone: data.location?.time_zone || undefined,
        isp: data.traits?.isp || undefined,
        org: data.traits?.organization || undefined,
        proxy: data.traits?.is_anonymous_proxy || false,
        vpn: data.traits?.is_anycast || false,
        tor: false, // MaxMind別API
        hosting: data.traits?.is_hosting_provider || false,
        threat: this.calculateThreatScore(data.traits),
      }
    } catch (error) {
      console.error('MaxMind fetch error:', error)
      return null
    }
  }

  /**
   * キャッシュされた地理情報の取得
   */
  private async getCachedLocation(ip: string): Promise<GeoLocation | null> {
    try {
      await this.initializeRedis()
      if (!this.redis) return null

      const cacheKey = `${this.cachePrefix}:${ip}`
      const cached = await this.redis.get(cacheKey)
      
      if (cached) {
        return JSON.parse(cached) as GeoLocation
      }
      
      return null
    } catch (error) {
      console.error('Cache retrieval error:', error)
      return null
    }
  }

  /**
   * 地理情報をキャッシュに保存
   */
  private async cacheLocation(ip: string, location: GeoLocation): Promise<void> {
    try {
      await this.initializeRedis()
      if (!this.redis) return

      const cacheKey = `${this.cachePrefix}:${ip}`
      await this.redis.setex(
        cacheKey,
        this.cacheTTL,
        JSON.stringify(location)
      )
    } catch (error) {
      console.error('Cache storage error:', error)
    }
  }

  /**
   * 脅威スコア計算
   */
  private calculateThreatScore(securityData: any): number {
    let score = 0

    if (securityData?.is_proxy || securityData?.proxy) score += 30
    if (securityData?.is_vpn || securityData?.vpn) score += 20
    if (securityData?.is_tor || securityData?.tor) score += 50
    if (securityData?.is_hosting || securityData?.hosting) score += 15
    if (securityData?.is_anonymous_proxy) score += 40
    if (securityData?.threat_level === 'high') score += 60
    if (securityData?.threat_level === 'medium') score += 30

    return Math.min(100, score)
  }

  /**
   * IPアドレス検証
   */
  private isValidIP(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
    return ipv4Regex.test(ip) || ipv6Regex.test(ip)
  }

  /**
   * プライベートIP判定
   */
  private isPrivateIP(ip: string): boolean {
    if (ip === '127.0.0.1' || ip === '::1') return true
    if (ip.startsWith('192.168.')) return true
    if (ip.startsWith('10.')) return true
    if (ip.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) return true
    return false
  }

  /**
   * プライベートIP用の地理情報
   */
  private getPrivateIPLocation(ip: string): GeoLocation {
    return {
      ip,
      country: 'Private Network',
      countryCode: 'XX',
      threat: 0, // プライベートIPは脅威なし
    }
  }

  /**
   * 地理制限チェック
   */
  async checkGeoRestrictions(
    ip: string,
    config: GeoRestrictionConfig
  ): Promise<{
    allowed: boolean
    reason?: string
    location?: GeoLocation
  }> {
    try {
      const location = await this.getGeoLocation(ip)
      if (!location) {
        return {
          allowed: false,
          reason: 'Unable to determine location',
        }
      }

      // 脅威スコアチェック
      if (config.threatThreshold && location.threat > config.threatThreshold) {
        return {
          allowed: false,
          reason: `High threat score: ${location.threat}`,
          location,
        }
      }

      // プロキシ・VPN・Torチェック
      if (config.blockProxies && location.proxy) {
        return { allowed: false, reason: 'Proxy detected', location }
      }
      if (config.blockVpn && location.vpn) {
        return { allowed: false, reason: 'VPN detected', location }
      }
      if (config.blockTor && location.tor) {
        return { allowed: false, reason: 'Tor detected', location }
      }
      if (config.blockHosting && location.hosting) {
        return { allowed: false, reason: 'Hosting provider detected', location }
      }

      // 国レベル制限
      if (config.blockedCountries?.includes(location.countryCode)) {
        return {
          allowed: false,
          reason: `Country blocked: ${location.country}`,
          location,
        }
      }

      if (config.allowedCountries?.length > 0 && 
          !config.allowedCountries.includes(location.countryCode)) {
        return {
          allowed: false,
          reason: `Country not in allowed list: ${location.country}`,
          location,
        }
      }

      // 地域レベル制限
      if (location.regionCode) {
        if (config.blockedRegions?.includes(location.regionCode)) {
          return {
            allowed: false,
            reason: `Region blocked: ${location.region}`,
            location,
          }
        }

        if (config.allowedRegions?.length > 0 && 
            !config.allowedRegions.includes(location.regionCode)) {
          return {
            allowed: false,
            reason: `Region not in allowed list: ${location.region}`,
            location,
          }
        }
      }

      return { allowed: true, location }

    } catch (error) {
      console.error('Geo restriction check error:', error)
      return {
        allowed: false,
        reason: 'Geo restriction check failed',
      }
    }
  }

  /**
   * 異常アクセスパターン検知
   */
  async detectAnomalousPatterns(
    userId: string,
    ip: string,
    timeWindow: number = 24 * 60 * 60 * 1000 // 24時間
  ): Promise<AnomalyDetectionResult> {
    try {
      await this.initializeRedis()
      if (!this.redis) {
        throw new Error('Redis not available')
      }

      const location = await this.getGeoLocation(ip)
      if (!location) {
        return {
          isAnomalous: true,
          confidence: 80,
          reasons: ['Unable to determine location'],
          riskScore: 80,
          recommendations: ['Block until location can be verified'],
        }
      }

      const reasons: string[] = []
      const recommendations: string[] = []
      let riskScore = 0

      // 1. 地理的移動パターン解析
      const locationHistory = await this.getUserLocationHistory(userId, timeWindow)
      if (locationHistory.length > 0) {
        const lastLocation = locationHistory[0]
        const distance = this.calculateDistance(
          lastLocation.latitude || 0,
          lastLocation.longitude || 0,
          location.latitude || 0,
          location.longitude || 0
        )

        // 物理的に不可能な移動速度チェック
        const timeDiff = Date.now() - lastLocation.timestamp
        const maxPossibleSpeed = 1000 // km/h (商用航空機)
        const actualSpeed = distance / (timeDiff / (1000 * 60 * 60)) // km/h

        if (actualSpeed > maxPossibleSpeed && distance > 100) {
          reasons.push(`Impossible travel speed: ${actualSpeed.toFixed(0)} km/h`)
          recommendations.push('Verify user identity with additional authentication')
          riskScore += 60
        }

        // 短時間での多国間移動
        const recentCountries = new Set(locationHistory.map(l => l.countryCode))
        if (recentCountries.size > 3 && timeWindow <= 4 * 60 * 60 * 1000) { // 4時間以内
          reasons.push(`Multiple countries in short time: ${recentCountries.size}`)
          recommendations.push('Implement step-up authentication')
          riskScore += 40
        }
      }

      // 2. 高リスク国・地域からのアクセス
      const highRiskCountries = ['CN', 'RU', 'KP', 'IR'] // 例
      if (highRiskCountries.includes(location.countryCode)) {
        reasons.push(`Access from high-risk country: ${location.country}`)
        recommendations.push('Enhanced monitoring required')
        riskScore += 30
      }

      // 3. プロキシ・VPN・Tor使用
      if (location.proxy || location.vpn || location.tor) {
        const serviceType = location.tor ? 'Tor' : location.vpn ? 'VPN' : 'Proxy'
        reasons.push(`${serviceType} usage detected`)
        recommendations.push(`Block ${serviceType} connections`)
        riskScore += location.tor ? 70 : location.vpn ? 40 : 50
      }

      // 4. 時間帯パターン解析
      const hour = new Date().getHours()
      const isUnusualHour = hour < 6 || hour > 23 // 深夜・早朝
      if (isUnusualHour && location.countryCode !== 'JP') {
        reasons.push('Unusual access time for region')
        recommendations.push('Monitor for automated behavior')
        riskScore += 20
      }

      // 5. ISP・組織パターン
      if (location.isp && this.isSuspiciousISP(location.isp)) {
        reasons.push(`Suspicious ISP: ${location.isp}`)
        recommendations.push('Additional verification required')
        riskScore += 30
      }

      // 現在の位置を履歴に保存
      await this.saveUserLocationHistory(userId, {
        ...location,
        timestamp: Date.now(),
      })

      const isAnomalous = riskScore > 50
      const confidence = Math.min(100, riskScore + (reasons.length * 5))

      return {
        isAnomalous,
        confidence,
        reasons: reasons.length > 0 ? reasons : ['Normal access pattern'],
        riskScore: Math.min(100, riskScore),
        recommendations: recommendations.length > 0 ? recommendations : ['Continue normal monitoring'],
      }

    } catch (error) {
      console.error('Anomaly detection error:', error)
      return {
        isAnomalous: true,
        confidence: 60,
        reasons: ['Anomaly detection system error'],
        riskScore: 60,
        recommendations: ['Manual review required'],
      }
    }
  }

  /**
   * ユーザーの位置履歴取得
   */
  private async getUserLocationHistory(
    userId: string,
    timeWindow: number
  ): Promise<Array<GeoLocation & { timestamp: number }>> {
    try {
      if (!this.redis) return []

      const key = `user_location_history:${userId}`
      const cutoff = Date.now() - timeWindow

      // 古いエントリを削除
      await this.redis.zremrangebyscore(key, '-inf', cutoff)

      // 最新のエントリを取得
      const entries = await this.redis.zrevrange(key, 0, 10, 'WITHSCORES')
      const history: Array<GeoLocation & { timestamp: number }> = []

      for (let i = 0; i < entries.length; i += 2) {
        const locationData = JSON.parse(entries[i])
        const timestamp = parseInt(entries[i + 1])
        history.push({ ...locationData, timestamp })
      }

      return history
    } catch (error) {
      console.error('Location history retrieval error:', error)
      return []
    }
  }

  /**
   * ユーザーの位置履歴保存
   */
  private async saveUserLocationHistory(
    userId: string,
    location: GeoLocation & { timestamp: number }
  ): Promise<void> {
    try {
      if (!this.redis) return

      const key = `user_location_history:${userId}`
      const locationData = JSON.stringify(location)

      await this.redis.zadd(key, location.timestamp, locationData)
      await this.redis.expire(key, 30 * 24 * 60 * 60) // 30日間保持
    } catch (error) {
      console.error('Location history save error:', error)
    }
  }

  /**
   * 2点間の距離計算（Haversine公式）
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // 地球の半径 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  /**
   * 疑わしいISP判定
   */
  private isSuspiciousISP(isp: string): boolean {
    const suspiciousKeywords = [
      'hosting', 'datacenter', 'cloud', 'vps', 'proxy',
      'vpn', 'anonymous', 'tor', 'dedicated', 'colocation'
    ]
    
    const lowerISP = isp.toLowerCase()
    return suspiciousKeywords.some(keyword => lowerISP.includes(keyword))
  }

  /**
   * 統計情報取得
   */
  async getGeoStats(timeWindow: number = 24 * 60 * 60 * 1000): Promise<{
    totalRequests: number
    uniqueCountries: number
    topCountries: Array<{ country: string; count: number }>
    threatLevel: { low: number; medium: number; high: number }
    proxyDetection: { proxy: number; vpn: number; tor: number }
  }> {
    try {
      await this.initializeRedis()
      if (!this.redis) {
        throw new Error('Redis not available')
      }

      const statsKey = 'geo_stats'
      const cutoff = Date.now() - timeWindow

      // 統計データ集約のLuaスクリプト
      const luaScript = `
        local stats_key = KEYS[1]
        local cutoff = ARGV[1]
        
        -- 期限切れエントリ削除
        redis.call('ZREMRANGEBYSCORE', stats_key .. ':requests', '-inf', cutoff)
        
        -- 統計計算
        local requests = redis.call('ZCARD', stats_key .. ':requests')
        local countries = redis.call('SCARD', stats_key .. ':countries')
        
        return {requests, countries}
      `

      const result = await this.redis.eval(
        luaScript,
        1,
        statsKey,
        cutoff.toString()
      ) as [number, number]

      // より詳細な統計は別途取得
      const topCountries = await this.redis.zrevrange(
        `${statsKey}:country_counts`, 0, 9, 'WITHSCORES'
      )

      const countryStats: Array<{ country: string; count: number }> = []
      for (let i = 0; i < topCountries.length; i += 2) {
        countryStats.push({
          country: topCountries[i],
          count: parseInt(topCountries[i + 1])
        })
      }

      return {
        totalRequests: result[0],
        uniqueCountries: result[1],
        topCountries: countryStats,
        threatLevel: { low: 0, medium: 0, high: 0 }, // 実装略
        proxyDetection: { proxy: 0, vpn: 0, tor: 0 }, // 実装略
      }
    } catch (error) {
      console.error('Geo stats error:', error)
      return {
        totalRequests: 0,
        uniqueCountries: 0,
        topCountries: [],
        threatLevel: { low: 0, medium: 0, high: 0 },
        proxyDetection: { proxy: 0, vpn: 0, tor: 0 },
      }
    }
  }

  /**
   * キャッシュクリア
   */
  async clearCache(ip?: string): Promise<void> {
    try {
      await this.initializeRedis()
      if (!this.redis) return

      if (ip) {
        const cacheKey = `${this.cachePrefix}:${ip}`
        await this.redis.del(cacheKey)
      } else {
        const pattern = `${this.cachePrefix}:*`
        const keys = await this.redis.keys(pattern)
        if (keys.length > 0) {
          await this.redis.del(...keys)
        }
      }
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  }
}

// シングルトンインスタンス
export const geoIPService = new GeoIPService()

export default {
  GeoIPService,
  geoIPService,
}