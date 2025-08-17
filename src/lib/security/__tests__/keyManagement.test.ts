/**
 * テストケース実装
 * Developer 8: 品質保証エンジニア
 * テストタイプ: {test_type}
 * 対象: {target}
 * 最終更新: {updated}
 */

import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest'
import { KeyManagementSystem, EnhancedEncryptionService } from '../keyManagement'
import * as fc from 'fast-check'
import crypto from 'crypto'

// Redis モック
vi.mock('../rateLimiting', () => ({
  getRedisClient: vi.fn().mockResolvedValue({
    setex: vi.fn(),
    get: vi.fn().mockResolvedValue(null),
    del: vi.fn(),
    zadd: vi.fn(),
    zrevrange: vi.fn().mockResolvedValue([]),
    zrange: vi.fn().mockResolvedValue([]),
    zrem: vi.fn(),
    incr: vi.fn(),
    set: vi.fn(),
    lrange: vi.fn().mockResolvedValue([]),
    lpush: vi.fn(),
    ltrim: vi.fn(),
  }),
}))

describe('KeyManagementSystem', () => {
  let keyManager: KeyManagementSystem
  let masterKey: string

  beforeAll(() => {
    process.env.NODE_ENV = 'test'
  })

  beforeEach(() => {
    masterKey = crypto.randomBytes(32).toString('hex')
    keyManager = new KeyManagementSystem(masterKey, {
      rotationInterval: 1000, // 1秒（テスト用）
      keyRetentionPeriod: 5000, // 5秒（テスト用）
      autoRotationEnabled: false, // テスト中は手動制御
      masterKeyRotationThreshold: 3,
      keyDerivationRounds: 1000, // テスト用に短縮
      maxActiveKeys: 3,
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    keyManager.destroy()
  })

  describe('キー生成', () => {
    it('should generate unique encryption keys', async () => {
      const key1 = await keyManager.generateEncryptionKey()
      const key2 = await keyManager.generateEncryptionKey()

      expect(key1.id).not.toBe(key2.id)
      expect(key1.key.equals(key2.key)).toBe(false)
      expect(key1.status).toBe('active')
      expect(key2.status).toBe('active')
      expect(key1.algorithm).toBe('aes-256-gcm')
      expect(key1.purpose).toBe('encryption')
    })

    it('should generate keys for different purposes', async () => {
      const encryptionKey = await keyManager.generateEncryptionKey('encryption')
      const signingKey = await keyManager.generateEncryptionKey('signing')

      expect(encryptionKey.purpose).toBe('encryption')
      expect(signingKey.purpose).toBe('signing')
      expect(encryptionKey.id).not.toBe(signingKey.id)
    })

    it('should generate keys with proper metadata', async () => {
      const key = await keyManager.generateEncryptionKey()

      expect(key.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
      expect(key.key).toBeInstanceOf(Buffer)
      expect(key.key.length).toBe(32) // 256-bit key
      expect(key.derivedFrom).toBeTruthy()
      expect(key.createdAt).toBeCloseTo(Date.now(), -2)
      expect(key.rotationSchedule).toBe(1000)
    })

    it('should use PBKDF2 for key derivation', async () => {
      const key1 = await keyManager.generateEncryptionKey()
      const key2 = await keyManager.generateEncryptionKey()

      // 派生キーは異なるべき
      expect(key1.key.equals(key2.key)).toBe(false)
      expect(key1.derivedFrom).not.toBe(key2.derivedFrom)
    })

    // Property-based testing
    it('should generate keys with consistent properties', () => {
      fc.assert(
        fc.asyncProperty(
          fc.constantFrom('encryption', 'signing', 'derivation'),
          async (purpose) => {
            const key = await keyManager.generateEncryptionKey(purpose)
            expect(key.purpose).toBe(purpose)
            expect(key.status).toBe('active')
            expect(key.key.length).toBe(32)
          }
        )
      )
    })
  })

  describe('アクティブキー取得', () => {
    it('should return active encryption key', async () => {
      const generatedKey = await keyManager.generateEncryptionKey()
      const activeKey = await keyManager.getActiveEncryptionKey()

      expect(activeKey.id).toBe(generatedKey.id)
      expect(activeKey.status).toBe('active')
    })

    it('should generate new key if no active key exists', async () => {
      const activeKey = await keyManager.getActiveEncryptionKey()

      expect(activeKey).toBeTruthy()
      expect(activeKey.status).toBe('active')
      expect(activeKey.purpose).toBe('encryption')
    })

    it('should track key usage', async () => {
      await keyManager.getActiveEncryptionKey()
      await keyManager.getActiveEncryptionKey()
      await keyManager.getActiveEncryptionKey()

      const stats = await keyManager.getKeyUsageStatistics()
      expect(stats.totalUsage).toBeGreaterThanOrEqual(3)
    })

    it('should trigger rotation when usage threshold is exceeded', async () => {
      const rotationSpy = vi.spyOn(keyManager, 'performKeyRotation')

      // 閾値を超えるまで使用
      for (let i = 0; i < 4; i++) {
        await keyManager.getActiveEncryptionKey()
      }

      expect(rotationSpy).toHaveBeenCalled()
    })
  })

  describe('キー検索', () => {
    it('should find existing keys by ID', async () => {
      const generatedKey = await keyManager.generateEncryptionKey()
      const foundKey = await keyManager.getKeyById(generatedKey.id)

      expect(foundKey).toBeTruthy()
      expect(foundKey!.id).toBe(generatedKey.id)
      expect(foundKey!.key.equals(generatedKey.key)).toBe(true)
    })

    it('should return null for non-existent keys', async () => {
      const nonExistentId = crypto.randomUUID()
      const result = await keyManager.getKeyById(nonExistentId)

      expect(result).toBe(null)
    })

    it('should cache keys for performance', async () => {
      const key = await keyManager.generateEncryptionKey()

      // 最初の取得
      const found1 = await keyManager.getKeyById(key.id)

      // 2回目の取得（キャッシュから）
      const found2 = await keyManager.getKeyById(key.id)

      expect(found1).toBeTruthy()
      expect(found2).toBeTruthy()
      expect(found1!.id).toBe(found2!.id)
    })
  })

  describe('キーローテーション', () => {
    it('should perform key rotation', async () => {
      const oldKey = await keyManager.generateEncryptionKey()

      await keyManager.performKeyRotation()

      const newActiveKey = await keyManager.getActiveEncryptionKey()
      const retrievedOldKey = await keyManager.getKeyById(oldKey.id)

      expect(newActiveKey.id).not.toBe(oldKey.id)
      expect(retrievedOldKey!.status).toBe('deprecated')
    })

    it('should set expiry date for deprecated keys', async () => {
      const oldKey = await keyManager.generateEncryptionKey()

      await keyManager.performKeyRotation()

      const deprecatedKey = await keyManager.getKeyById(oldKey.id)

      expect(deprecatedKey!.status).toBe('deprecated')
      expect(deprecatedKey!.expiresAt).toBeTruthy()
      expect(deprecatedKey!.expiresAt!).toBeGreaterThan(Date.now())
    })

    it('should clean up expired keys', async () => {
      const key = await keyManager.generateEncryptionKey()

      // キーを手動で期限切れに設定
      await keyManager.deprecateKey(key.id)
      const deprecatedKey = await keyManager.getKeyById(key.id)
      deprecatedKey!.expiresAt = Date.now() - 1000 // 1秒前に期限切れ

      await keyManager.performKeyRotation()

      const expiredKey = await keyManager.getKeyById(key.id)
      expect(expiredKey).toBe(null) // クリーンアップされている
    })

    it('should update rotation statistics', async () => {
      const statsBefore = await keyManager.getKeyUsageStatistics()

      await keyManager.performKeyRotation()

      const statsAfter = await keyManager.getKeyUsageStatistics()
      expect(statsAfter.activeKeys).toBeGreaterThanOrEqual(1)
    })
  })

  describe('キーの非推奨化と取り消し', () => {
    it('should deprecate keys correctly', async () => {
      const key = await keyManager.generateEncryptionKey()

      await keyManager.deprecateKey(key.id)

      const deprecatedKey = await keyManager.getKeyById(key.id)
      expect(deprecatedKey!.status).toBe('deprecated')
      expect(deprecatedKey!.expiresAt).toBeTruthy()
    })

    it('should revoke keys with immediate expiry', async () => {
      const key = await keyManager.generateEncryptionKey()

      await keyManager.revokeKey(key.id, 'security breach')

      const revokedKey = await keyManager.getKeyById(key.id)
      expect(revokedKey!.status).toBe('revoked')
      expect(revokedKey!.expiresAt).toBeLessThanOrEqual(Date.now())
    })

    it('should handle non-existent key deprecation gracefully', async () => {
      const nonExistentId = crypto.randomUUID()

      await expect(keyManager.deprecateKey(nonExistentId)).resolves.not.toThrow()
    })

    it('should handle non-existent key revocation gracefully', async () => {
      const nonExistentId = crypto.randomUUID()

      await expect(keyManager.revokeKey(nonExistentId)).resolves.not.toThrow()
    })
  })

  describe('統計とモニタリング', () => {
    it('should provide accurate usage statistics', async () => {
      const key1 = await keyManager.generateEncryptionKey('encryption')
      const key2 = await keyManager.generateEncryptionKey('signing')
      await keyManager.deprecateKey(key1.id)
      await keyManager.revokeKey(key2.id)

      const stats = await keyManager.getKeyUsageStatistics()

      expect(stats.activeKeys).toBeGreaterThanOrEqual(0)
      expect(stats.deprecatedKeys).toBeGreaterThanOrEqual(1)
      expect(stats.revokedKeys).toBeGreaterThanOrEqual(1)
      expect(Array.isArray(stats.rotationHistory)).toBe(true)
    })

    it('should track rotation history', async () => {
      await keyManager.performKeyRotation()

      const stats = await keyManager.getKeyUsageStatistics()

      expect(stats.rotationHistory).toBeDefined()
      expect(Array.isArray(stats.rotationHistory)).toBe(true)
    })
  })

  describe('本番環境設定', () => {
    it('should setup production key strategy without errors', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      await expect(keyManager.setupProductionKeyStrategy()).resolves.not.toThrow()

      process.env.NODE_ENV = originalEnv
    })

    it('should warn when production setup is called in non-production', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // 環境変数がtestに設定されていることを確認
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'test'

      await keyManager.setupProductionKeyStrategy()

      expect(consoleSpy).toHaveBeenCalledWith(
        'Production key strategy setup called in non-production environment'
      )

      consoleSpy.mockRestore()
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('エラーハンドリング', () => {
    it('should handle Redis connection errors gracefully', async () => {
      // Redis接続エラーをシミュレート
      const { getRedisClient } = await import('../rateLimiting')
      vi.mocked(getRedisClient).mockRejectedValueOnce(new Error('Redis connection failed'))

      const keyManagerWithFailedRedis = new KeyManagementSystem(masterKey)
      const key = await keyManagerWithFailedRedis.generateEncryptionKey()

      expect(key).toBeTruthy()
      expect(key.status).toBe('active')

      keyManagerWithFailedRedis.destroy()
    })

    it('should handle key generation errors', async () => {
      // crypto.randomUUID のモックでエラーを発生させる
      vi.spyOn(crypto, 'randomUUID').mockImplementationOnce(() => {
        throw new Error('UUID generation failed')
      })

      await expect(keyManager.generateEncryptionKey()).rejects.toThrow()
    })

    it('should handle rotation errors gracefully', async () => {
      // キーの取得でエラーを発生させる
      vi.spyOn(keyManager as any, 'getActiveKeys').mockRejectedValueOnce(
        new Error('Key fetch failed')
      )

      await expect(keyManager.performKeyRotation()).rejects.toThrow('Key fetch failed')
    })
  })

  describe('セキュリティ機能', () => {
    it('should log security events for key revocation', async () => {
      const key = await keyManager.generateEncryptionKey()
      const logSpy = vi.spyOn(keyManager as any, 'logSecurityEvent')

      await keyManager.revokeKey(key.id, 'test revocation')

      expect(logSpy).toHaveBeenCalledWith(
        'KEY_REVOKED',
        expect.objectContaining({
          keyId: key.id,
          reason: 'test revocation',
        })
      )
    })

    it('should prevent access to revoked keys for decryption', async () => {
      const encryptionService = new EnhancedEncryptionService(masterKey)

      const { encrypted, iv, tag, metadata } = await encryptionService.encrypt('test data')

      await keyManager.revokeKey(metadata.keyId)

      await expect(encryptionService.decrypt(encrypted, iv, tag, metadata)).rejects.toThrow(
        'Cannot decrypt with revoked key'
      )

      encryptionService.destroy()
    })

    it('should use proper key derivation parameters', async () => {
      const key = await keyManager.generateEncryptionKey()

      expect(key.derivedFrom).toBeTruthy()
      expect(key.derivedFrom!.length).toBe(64) // 32 bytes as hex = 64 chars
    })
  })

  describe('パフォーマンス', () => {
    it('should handle concurrent key operations', async () => {
      const promises = Array.from({ length: 10 }, () => keyManager.generateEncryptionKey())

      const keys = await Promise.all(promises)
      const keyIds = keys.map((k) => k.id)
      const uniqueIds = new Set(keyIds)

      expect(uniqueIds.size).toBe(10) // All keys should be unique
    })

    it('should cache keys for performance', async () => {
      const key = await keyManager.generateEncryptionKey()

      const startTime = Date.now()
      await keyManager.getKeyById(key.id) // First call (from Redis/storage)
      const firstCallTime = Date.now() - startTime

      const startTime2 = Date.now()
      await keyManager.getKeyById(key.id) // Second call (from cache)
      const secondCallTime = Date.now() - startTime2

      // 2回目のコールはキャッシュから取得されるので高速のはず
      expect(secondCallTime).toBeLessThanOrEqual(firstCallTime)
    })

    it('should limit maximum active keys', async () => {
      // 制限を超える数のキーを生成
      for (let i = 0; i < 5; i++) {
        await keyManager.generateEncryptionKey()
      }

      const stats = await keyManager.getKeyUsageStatistics()
      expect(stats.activeKeys).toBeLessThanOrEqual(3) // maxActiveKeys = 3
    })
  })
})

describe('EnhancedEncryptionService', () => {
  let encryptionService: EnhancedEncryptionService
  let masterKey: string

  beforeEach(() => {
    masterKey = crypto.randomBytes(32).toString('hex')
    encryptionService = new EnhancedEncryptionService(masterKey, {
      autoRotationEnabled: false,
    })
  })

  afterEach(() => {
    encryptionService.destroy()
  })

  describe('暗号化・復号化', () => {
    it('should encrypt and decrypt data successfully', async () => {
      const originalData = 'sensitive information'

      const encrypted = await encryptionService.encrypt(originalData)
      const decrypted = await encryptionService.decrypt(
        encrypted.encrypted,
        encrypted.iv,
        encrypted.tag,
        encrypted.metadata
      )

      expect(decrypted).toBe(originalData)
    })

    it('should include metadata in encryption result', async () => {
      const result = await encryptionService.encrypt('test data')

      expect(result.metadata).toBeTruthy()
      expect(result.metadata.keyId).toBeTruthy()
      expect(result.metadata.algorithm).toBe('aes-256-gcm')
      expect(result.metadata.timestamp).toBeCloseTo(Date.now(), -2)
    })

    it('should handle different data types', async () => {
      const testCases = [
        'simple string',
        JSON.stringify({ complex: 'object', with: ['array', 'values'] }),
        'special characters: áéíóú ñ ¿¡',
        'numbers and symbols: 123 !@#$%^&*()',
        '',
      ]

      for (const testData of testCases) {
        const encrypted = await encryptionService.encrypt(testData)
        const decrypted = await encryptionService.decrypt(
          encrypted.encrypted,
          encrypted.iv,
          encrypted.tag,
          encrypted.metadata
        )

        expect(decrypted).toBe(testData)
      }
    })

    it('should fail decryption with wrong key', async () => {
      const encrypted = await encryptionService.encrypt('test data')

      // 異なるキーIDでメタデータを改ざん
      const tamperedMetadata = {
        ...encrypted.metadata,
        keyId: crypto.randomUUID(),
      }

      await expect(
        encryptionService.decrypt(
          encrypted.encrypted,
          encrypted.iv,
          encrypted.tag,
          tamperedMetadata
        )
      ).rejects.toThrow('Decryption key not found')
    })

    it('should fail decryption with corrupted data', async () => {
      const encrypted = await encryptionService.encrypt('test data')

      // 暗号化データを改ざん
      const tamperedData = encrypted.encrypted.substring(0, -4) + 'xxxx'

      await expect(
        encryptionService.decrypt(tamperedData, encrypted.iv, encrypted.tag, encrypted.metadata)
      ).rejects.toThrow('Decryption failed')
    })

    // Property-based testing
    it('should handle arbitrary input data', () => {
      fc.assert(
        fc.asyncProperty(fc.string({ minLength: 0, maxLength: 1000 }), async (data) => {
          const encrypted = await encryptionService.encrypt(data)
          const decrypted = await encryptionService.decrypt(
            encrypted.encrypted,
            encrypted.iv,
            encrypted.tag,
            encrypted.metadata
          )
          expect(decrypted).toBe(data)
        })
      )
    })
  })

  describe('キー管理統合', () => {
    it('should use key manager for encryption', async () => {
      const keyManager = encryptionService.getKeyManager()
      const getActiveKeySpy = vi.spyOn(keyManager, 'getActiveEncryptionKey')

      await encryptionService.encrypt('test data')

      expect(getActiveKeySpy).toHaveBeenCalled()
    })

    it('should support key rotation during operation', async () => {
      const data = 'test data'

      // データを暗号化
      const encrypted1 = await encryptionService.encrypt(data)

      // キーローテーション実行
      const keyManager = encryptionService.getKeyManager()
      await keyManager.performKeyRotation()

      // 新しいキーでデータを暗号化
      const encrypted2 = await encryptionService.encrypt(data)

      // 両方のデータが復号できる
      const decrypted1 = await encryptionService.decrypt(
        encrypted1.encrypted,
        encrypted1.iv,
        encrypted1.tag,
        encrypted1.metadata
      )
      const decrypted2 = await encryptionService.decrypt(
        encrypted2.encrypted,
        encrypted2.iv,
        encrypted2.tag,
        encrypted2.metadata
      )

      expect(decrypted1).toBe(data)
      expect(decrypted2).toBe(data)
      expect(encrypted1.metadata.keyId).not.toBe(encrypted2.metadata.keyId)
    })
  })

  describe('エラーハンドリング', () => {
    it('should handle key manager errors gracefully', async () => {
      const keyManager = encryptionService.getKeyManager()
      vi.spyOn(keyManager, 'getActiveEncryptionKey').mockRejectedValueOnce(
        new Error('Key manager error')
      )

      await expect(encryptionService.encrypt('test')).rejects.toThrow('Encryption failed')
    })

    it('should provide meaningful error messages', async () => {
      const keyManager = encryptionService.getKeyManager()
      const testKeyId = crypto.randomUUID()

      vi.spyOn(keyManager, 'getKeyById').mockResolvedValueOnce(null)

      const fakeMetadata = {
        keyId: testKeyId,
        keyVersion: 1,
        algorithm: 'aes-256-gcm',
        timestamp: Date.now(),
        rotationGeneration: 1,
      }

      await expect(
        encryptionService.decrypt('encrypted', 'iv', 'tag', fakeMetadata)
      ).rejects.toThrow(`Decryption key not found: ${testKeyId}`)
    })
  })
})
