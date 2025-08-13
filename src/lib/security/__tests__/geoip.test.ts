/**
 * GeoIPサービス テストファイル
 * Developer 1: 包括的なGeoIPサービステスト
 */

import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest'
import nock from 'nock'
import { GeoIPService } from '../geoip'
import * as fc from 'fast-check'

// Redis モック
vi.mock('../rateLimiting', () => ({
  getRedisClient: vi.fn().mockResolvedValue({
    get: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
    keys: vi.fn().mockResolvedValue([]),
    hmget: vi.fn().mockResolvedValue([null, null, null]),
    zadd: vi.fn(),
    expire: vi.fn(),
    zrevrange: vi.fn().mockResolvedValue([]),
    zremrangebyscore: vi.fn(),
    zcard: vi.fn().mockResolvedValue(0),
    scard: vi.fn().mockResolvedValue(0),
    eval: vi.fn().mockResolvedValue([0, 0]),
  }),
}))

describe('GeoIPService', () => {
  let service: GeoIPService

  beforeAll(() => {
    // 環境変数の設定
    process.env.IPGEOLOCATION_API_KEY = 'test-key'
    process.env.MAXMIND_USER_ID = 'test-user'
    process.env.MAXMIND_LICENSE_KEY = 'test-license'
  })

  beforeEach(() => {
    service = new GeoIPService()
    nock.cleanAll()
  })

  afterEach(() => {
    nock.cleanAll()
    vi.clearAllMocks()
  })

  afterAll(() => {
    delete process.env.IPGEOLOCATION_API_KEY
    delete process.env.MAXMIND_USER_ID
    delete process.env.MAXMIND_LICENSE_KEY
  })

  describe('getGeoLocation', () => {
    it('should return cached location if available', async () => {
      // Redis から キャッシュされたデータを返すモック
      const mockRedis = await import('../rateLimiting').then((m) => m.getRedisClient())
      vi.mocked(mockRedis.get).mockResolvedValueOnce(
        JSON.stringify({
          ip: '203.0.113.1',
          country: 'Japan',
          countryCode: 'JP',
          threat: 10,
        })
      )

      const result = await service.getGeoLocation('203.0.113.1')

      expect(result).toEqual({
        ip: '203.0.113.1',
        country: 'Japan',
        countryCode: 'JP',
        threat: 10,
      })
    })

    it('should fetch from IP-API when no cache available', async () => {
      nock('http://ip-api.com')
        .get(
          '/json/203.0.113.1?fields=status,message,country,countryCode,region,regionName,city,lat,lon,timezone,isp,org,proxy,hosting'
        )
        .reply(200, {
          status: 'success',
          country: 'Japan',
          countryCode: 'JP',
          region: '13',
          regionName: 'Tokyo',
          city: 'Tokyo',
          lat: 35.6895,
          lon: 139.6917,
          timezone: 'Asia/Tokyo',
          isp: 'Example ISP',
          org: 'Example Org',
          proxy: false,
          hosting: false,
        })

      const result = await service.getGeoLocation('203.0.113.1')

      expect(result).toMatchObject({
        ip: '203.0.113.1',
        country: 'Japan',
        countryCode: 'JP',
        city: 'Tokyo',
        latitude: 35.6895,
        longitude: 139.6917,
      })
    })

    it('should fallback to IPGeolocation when IP-API fails', async () => {
      // IP-API を失敗させる
      nock('http://ip-api.com').get(/.*/).reply(500)

      // IPGeolocation API を成功させる
      nock('https://api.ipgeolocation.io')
        .get('/ipgeo')
        .query(true)
        .reply(200, {
          country_name: 'United States',
          country_code2: 'US',
          state_prov: 'California',
          city: 'San Francisco',
          latitude: '37.7749',
          longitude: '-122.4194',
          time_zone: { name: 'America/Los_Angeles' },
          isp: 'Example ISP',
          organization: 'Example Org',
          security: {
            is_proxy: false,
            is_vpn: true,
            is_tor: false,
            is_hosting: false,
          },
        })

      const result = await service.getGeoLocation('8.8.8.8')

      expect(result).toMatchObject({
        ip: '8.8.8.8',
        country: 'United States',
        countryCode: 'US',
        vpn: true,
        proxy: false,
      })
    })

    it('should handle private IP addresses', async () => {
      const result = await service.getGeoLocation('192.168.1.1')

      expect(result).toEqual({
        ip: '192.168.1.1',
        country: 'Private Network',
        countryCode: 'XX',
        threat: 0,
      })
    })

    it('should handle invalid IP addresses', async () => {
      await expect(service.getGeoLocation('invalid-ip')).rejects.toThrow('Invalid IP address')
    })

    // Property-based testing
    it('should handle various IP formats correctly', () => {
      fc.assert(
        fc.property(fc.ipV4(), async (ip) => {
          try {
            const result = await service.getGeoLocation(ip)
            expect(result?.ip).toBe(ip)
          } catch (error) {
            // プライベートIPの場合は例外が発生する可能性がある
          }
        })
      )
    })
  })

  describe('checkGeoRestrictions', () => {
    it('should allow access from allowed countries', async () => {
      // Mock successful geo lookup
      vi.spyOn(service, 'getGeoLocation').mockResolvedValueOnce({
        ip: '203.0.113.1',
        country: 'Japan',
        countryCode: 'JP',
        threat: 10,
        proxy: false,
        vpn: false,
        tor: false,
        hosting: false,
      })

      const result = await service.checkGeoRestrictions('203.0.113.1', {
        allowedCountries: ['JP', 'US'],
      })

      expect(result.allowed).toBe(true)
    })

    it('should block access from blocked countries', async () => {
      vi.spyOn(service, 'getGeoLocation').mockResolvedValueOnce({
        ip: '203.0.113.1',
        country: 'Example Country',
        countryCode: 'EX',
        threat: 10,
        proxy: false,
        vpn: false,
        tor: false,
        hosting: false,
      })

      const result = await service.checkGeoRestrictions('203.0.113.1', {
        blockedCountries: ['EX'],
      })

      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('Country blocked')
    })

    it('should block high threat score IPs', async () => {
      vi.spyOn(service, 'getGeoLocation').mockResolvedValueOnce({
        ip: '203.0.113.1',
        country: 'Japan',
        countryCode: 'JP',
        threat: 90,
        proxy: false,
        vpn: false,
        tor: false,
        hosting: false,
      })

      const result = await service.checkGeoRestrictions('203.0.113.1', {
        threatThreshold: 50,
      })

      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('High threat score')
    })

    it('should block proxy connections when configured', async () => {
      vi.spyOn(service, 'getGeoLocation').mockResolvedValueOnce({
        ip: '203.0.113.1',
        country: 'Japan',
        countryCode: 'JP',
        threat: 10,
        proxy: true,
        vpn: false,
        tor: false,
        hosting: false,
      })

      const result = await service.checkGeoRestrictions('203.0.113.1', {
        blockProxies: true,
      })

      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('Proxy detected')
    })

    it('should block VPN connections when configured', async () => {
      vi.spyOn(service, 'getGeoLocation').mockResolvedValueOnce({
        ip: '203.0.113.1',
        country: 'Japan',
        countryCode: 'JP',
        threat: 10,
        proxy: false,
        vpn: true,
        tor: false,
        hosting: false,
      })

      const result = await service.checkGeoRestrictions('203.0.113.1', {
        blockVpn: true,
      })

      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('VPN detected')
    })

    it('should block Tor connections', async () => {
      vi.spyOn(service, 'getGeoLocation').mockResolvedValueOnce({
        ip: '203.0.113.1',
        country: 'Japan',
        countryCode: 'JP',
        threat: 10,
        proxy: false,
        vpn: false,
        tor: true,
        hosting: false,
      })

      const result = await service.checkGeoRestrictions('203.0.113.1', {
        blockTor: true,
      })

      expect(result.allowed).toBe(false)
      expect(result.reason).toBe('Tor detected')
    })
  })

  describe('detectAnomalousPatterns', () => {
    it('should detect impossible travel patterns', async () => {
      const mockRedis = await import('../rateLimiting').then((m) => m.getRedisClient())

      // 過去の位置履歴をモック（東京）
      vi.mocked(mockRedis.zrevrange).mockResolvedValueOnce([
        JSON.stringify({
          ip: '203.0.113.1',
          country: 'Japan',
          countryCode: 'JP',
          latitude: 35.6895,
          longitude: 139.6917,
        }),
        (Date.now() - 60 * 1000).toString(), // 1分前
      ])

      // 現在の位置をニューヨークに設定
      vi.spyOn(service, 'getGeoLocation').mockResolvedValueOnce({
        ip: '8.8.8.8',
        country: 'United States',
        countryCode: 'US',
        latitude: 40.7128,
        longitude: -74.006,
        threat: 10,
        proxy: false,
        vpn: false,
        tor: false,
        hosting: false,
      })

      const result = await service.detectAnomalousPatterns('user123', '8.8.8.8')

      expect(result.isAnomalous).toBe(true)
      expect(result.reasons.some((r) => r.includes('Impossible travel speed'))).toBe(true)
      expect(result.riskScore).toBeGreaterThan(50)
    })

    it('should detect high-risk countries', async () => {
      vi.spyOn(service, 'getGeoLocation').mockResolvedValueOnce({
        ip: '203.0.113.1',
        country: 'China',
        countryCode: 'CN',
        threat: 20,
        proxy: false,
        vpn: false,
        tor: false,
        hosting: false,
      })

      const result = await service.detectAnomalousPatterns('user123', '203.0.113.1')

      expect(result.reasons.some((r) => r.includes('high-risk country'))).toBe(true)
    })

    it('should detect proxy/VPN usage', async () => {
      vi.spyOn(service, 'getGeoLocation').mockResolvedValueOnce({
        ip: '203.0.113.1',
        country: 'Japan',
        countryCode: 'JP',
        threat: 30,
        proxy: false,
        vpn: true,
        tor: false,
        hosting: false,
      })

      const result = await service.detectAnomalousPatterns('user123', '203.0.113.1')

      expect(result.reasons.some((r) => r.includes('VPN usage detected'))).toBe(true)
    })

    it('should detect Tor usage with high risk score', async () => {
      vi.spyOn(service, 'getGeoLocation').mockResolvedValueOnce({
        ip: '203.0.113.1',
        country: 'Japan',
        countryCode: 'JP',
        threat: 50,
        proxy: false,
        vpn: false,
        tor: true,
        hosting: false,
      })

      const result = await service.detectAnomalousPatterns('user123', '203.0.113.1')

      expect(result.reasons.some((r) => r.includes('Tor usage detected'))).toBe(true)
      expect(result.riskScore).toBeGreaterThanOrEqual(70)
    })

    it('should return normal pattern for typical usage', async () => {
      vi.spyOn(service, 'getGeoLocation').mockResolvedValueOnce({
        ip: '203.0.113.1',
        country: 'Japan',
        countryCode: 'JP',
        threat: 5,
        proxy: false,
        vpn: false,
        tor: false,
        hosting: false,
      })

      const result = await service.detectAnomalousPatterns('user123', '203.0.113.1')

      expect(result.isAnomalous).toBe(false)
      expect(result.riskScore).toBeLessThan(50)
    })
  })

  describe('getGeoStats', () => {
    it('should return comprehensive statistics', async () => {
      const mockRedis = await import('../rateLimiting').then((m) => m.getRedisClient())

      vi.mocked(mockRedis.eval).mockResolvedValueOnce([150, 25])
      vi.mocked(mockRedis.zrevrange).mockResolvedValueOnce([
        'Japan',
        '50',
        'United States',
        '40',
        'United Kingdom',
        '30',
        'Germany',
        '20',
        'France',
        '10',
      ])

      const stats = await service.getGeoStats()

      expect(stats.totalRequests).toBe(150)
      expect(stats.uniqueCountries).toBe(25)
      expect(stats.topCountries).toHaveLength(5)
      expect(stats.topCountries[0]).toEqual({ country: 'Japan', count: 50 })
    })
  })

  describe('clearCache', () => {
    it('should clear specific IP cache', async () => {
      const mockRedis = await import('../rateLimiting').then((m) => m.getRedisClient())

      await service.clearCache('203.0.113.1')

      expect(mockRedis.del).toHaveBeenCalledWith('geoip:203.0.113.1')
    })

    it('should clear all caches when no IP specified', async () => {
      const mockRedis = await import('../rateLimiting').then((m) => m.getRedisClient())

      vi.mocked(mockRedis.keys).mockResolvedValueOnce(['geoip:1.1.1.1', 'geoip:8.8.8.8'])

      await service.clearCache()

      expect(mockRedis.keys).toHaveBeenCalledWith('geoip:*')
      expect(mockRedis.del).toHaveBeenCalledWith('geoip:1.1.1.1', 'geoip:8.8.8.8')
    })
  })

  describe('Error Handling', () => {
    it('should handle network timeouts gracefully', async () => {
      nock('http://ip-api.com')
        .get(/.*/)
        .delay(6000) // 6秒遅延（タイムアウト）
        .reply(200, {})

      const result = await service.getGeoLocation('203.0.113.1')

      // フォールバックデータを返すことを確認
      expect(result).toMatchObject({
        ip: '203.0.113.1',
        country: 'Unknown',
        countryCode: 'XX',
        threat: 50,
      })
    })

    it('should handle API rate limits', async () => {
      nock('http://ip-api.com').get(/.*/).reply(429, { message: 'Rate limit exceeded' })

      const result = await service.getGeoLocation('203.0.113.1')

      expect(result).toMatchObject({
        ip: '203.0.113.1',
        country: 'Unknown',
        countryCode: 'XX',
      })
    })

    it('should handle malformed API responses', async () => {
      nock('http://ip-api.com').get(/.*/).reply(200, 'invalid json')

      const result = await service.getGeoLocation('203.0.113.1')

      expect(result).toMatchObject({
        ip: '203.0.113.1',
        country: 'Unknown',
        countryCode: 'XX',
      })
    })
  })

  describe('Performance Testing', () => {
    it('should handle concurrent requests efficiently', async () => {
      // 複数のリクエストを並行実行
      const ips = ['1.1.1.1', '8.8.8.8', '203.0.113.1', '192.0.2.1']

      nock('http://ip-api.com').get(/.*/).times(4).reply(200, {
        status: 'success',
        country: 'Test Country',
        countryCode: 'TC',
      })

      const promises = ips.map((ip) => service.getGeoLocation(ip))
      const results = await Promise.all(promises)

      expect(results).toHaveLength(4)
      results.forEach((result, index) => {
        expect(result?.ip).toBe(ips[index])
        expect(result?.country).toBe('Test Country')
      })
    })

    it('should cache results for performance', async () => {
      const mockRedis = await import('../rateLimiting').then((m) => m.getRedisClient())

      // 初回リクエスト
      nock('http://ip-api.com').get(/.*/).reply(200, {
        status: 'success',
        country: 'Japan',
        countryCode: 'JP',
      })

      await service.getGeoLocation('203.0.113.1')

      // キャッシュに保存されることを確認
      expect(mockRedis.setex).toHaveBeenCalled()

      // 2回目のリクエストでキャッシュから取得
      vi.mocked(mockRedis.get).mockResolvedValueOnce(
        JSON.stringify({
          ip: '203.0.113.1',
          country: 'Japan',
          countryCode: 'JP',
        })
      )

      const cachedResult = await service.getGeoLocation('203.0.113.1')
      expect(cachedResult?.country).toBe('Japan')
    })
  })

  describe('Security Testing', () => {
    it('should not expose sensitive information in logs', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // 意図的にエラーを発生させる
      nock('http://ip-api.com').get(/.*/).replyWithError('Network error')

      await service.getGeoLocation('203.0.113.1')

      // ログにAPIキーなどの機密情報が含まれていないことを確認
      expect(consoleSpy).toHaveBeenCalled()
      const logCalls = consoleSpy.mock.calls
      logCalls.forEach((call) => {
        expect(call.join(' ')).not.toContain('test-key')
        expect(call.join(' ')).not.toContain('test-license')
      })

      consoleSpy.mockRestore()
    })

    it('should validate input IP addresses', async () => {
      const maliciousInputs = [
        '../../etc/passwd',
        '<script>alert("xss")</script>',
        'DROP TABLE users;',
        "'OR'1'='1",
      ]

      for (const input of maliciousInputs) {
        await expect(service.getGeoLocation(input)).rejects.toThrow('Invalid IP address')
      }
    })
  })
})
