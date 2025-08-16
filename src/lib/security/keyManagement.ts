/**
 * 自動キーローテーション・マルチバージョンキー管理システム
 * Developer 3: エンタープライズ級キー管理機能
 */

import crypto from 'crypto'
import Redis from 'ioredis'
import { getRedisClient } from './rateLimiting'
import type { KeyVersion, KeyRotationConfig, EncryptionMetadata } from './encryption'
import { logger } from '../../services/logger'

/**
 * キー管理システム
 */
export class KeyManagementSystem {
  private redis: Redis | null = null
  private masterKey: Buffer
  private config: KeyRotationConfig
  private rotationTimer: NodeJS.Timeout | null = null
  private keyUsageCounter: Map<string, number> = new Map()
  private keyCache: Map<string, KeyVersion> = new Map()

  constructor(masterKey: string, config?: Partial<KeyRotationConfig>) {
    this.masterKey = Buffer.from(masterKey, 'hex')
    this.config = {
      rotationInterval: config?.rotationInterval || 86400000, // 24時間
      keyRetentionPeriod: config?.keyRetentionPeriod || 7 * 86400000, // 7日間
      autoRotationEnabled: config?.autoRotationEnabled ?? true,
      masterKeyRotationThreshold: config?.masterKeyRotationThreshold || 10000,
      keyDerivationRounds: config?.keyDerivationRounds || 100000,
      maxActiveKeys: config?.maxActiveKeys || 5,
    }

    this.initializeRedis()
    this.startKeyRotationScheduler()
  }

  /**
   * Redis接続初期化
   */
  private async initializeRedis(): Promise<void> {
    try {
      this.redis = await getRedisClient()
      if (process.env.NODE_ENV === 'development') {
        logger.info('Key Management System: Redis connected')
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Key Management System: Redis not available, using in-memory storage:', error)
      }
    }
  }

  /**
   * キーローテーションスケジューラーの開始
   */
  private startKeyRotationScheduler(): void {
    if (!this.config.autoRotationEnabled) {
      return
    }

    this.rotationTimer = setInterval(async () => {
      try {
        await this.performKeyRotation()
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          logger.error('Scheduled key rotation failed:', error)
        }
      }
    }, this.config.rotationInterval)

    if (process.env.NODE_ENV === 'development') {
      logger.info(`Key rotation scheduler started (interval: ${this.config.rotationInterval}ms)`)
    }
  }

  /**
   * 新しい暗号化キーの生成
   */
  async generateEncryptionKey(purpose: KeyVersion['purpose'] = 'encryption'): Promise<KeyVersion> {
    const keyId = crypto.randomUUID()
    const salt = crypto.randomBytes(32)

    // PBKDF2でマスターキーから派生キーを生成
    const derivedKey = crypto.pbkdf2Sync(
      this.masterKey,
      salt,
      this.config.keyDerivationRounds,
      32, // 256-bit key
      'sha512'
    )

    const keyVersion: KeyVersion = {
      id: keyId,
      key: derivedKey,
      derivedFrom: salt.toString('hex'),
      createdAt: Date.now(),
      status: 'active',
      algorithm: 'aes-256-gcm',
      purpose,
      rotationSchedule: this.config.rotationInterval,
    }

    // キーをストレージに保存
    await this.storeKey(keyVersion)
    this.keyCache.set(keyId, keyVersion)

    if (process.env.NODE_ENV === 'development') {
      logger.info(`New encryption key generated: ${keyId.substring(0, 8)}... (${purpose})`)
    }
    return keyVersion
  }

  /**
   * アクティブな暗号化キーの取得
   */
  async getActiveEncryptionKey(): Promise<KeyVersion> {
    try {
      // キャッシュから最新のアクティブキーを取得
      let activeKey = Array.from(this.keyCache.values())
        .filter((key) => key.status === 'active' && key.purpose === 'encryption')
        .sort((a, b) => b.createdAt - a.createdAt)[0]

      if (!activeKey) {
        // Redisから最新のアクティブキーを検索
        activeKey = await this.findActiveKeyFromStorage('encryption')
      }

      if (!activeKey) {
        // アクティブキーが存在しない場合は新規生成
        if (process.env.NODE_ENV === 'development') {
          logger.warn('No active encryption key found, generating new key')
        }
        activeKey = await this.generateEncryptionKey()
      }

      // 使用回数をカウント
      const usage = this.keyUsageCounter.get(activeKey.id) || 0
      this.keyUsageCounter.set(activeKey.id, usage + 1)

      // 使用回数が閾値を超えた場合はローテーション
      if (usage >= this.config.masterKeyRotationThreshold) {
        if (process.env.NODE_ENV === 'development') {
          logger.info(`Key usage threshold exceeded for ${activeKey.id}, triggering rotation`)
        }
        await this.performKeyRotation()
        // 新しいアクティブキーを取得
        return await this.getActiveEncryptionKey()
      }

      return activeKey
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to get active encryption key:', error)
      }
      throw new Error('Encryption key retrieval failed')
    }
  }

  /**
   * 特定のキーIDでキーを取得
   */
  async getKeyById(keyId: string): Promise<KeyVersion | null> {
    try {
      // キャッシュから確認
      if (this.keyCache.has(keyId)) {
        return this.keyCache.get(keyId)!
      }

      // Redisから取得
      if (this.redis) {
        const keyData = await this.redis.get(`key:${keyId}`)
        if (keyData) {
          const keyVersion = this.deserializeKey(keyData)
          this.keyCache.set(keyId, keyVersion)
          return keyVersion
        }
      }

      if (process.env.NODE_ENV === 'development') {
        logger.warn(`Key not found: ${keyId}`)
      }
      return null
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error(`Failed to retrieve key ${keyId}:`, error)
      }
      return null
    }
  }

  /**
   * キーローテーション実行
   */
  async performKeyRotation(): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'development') {
        logger.info('Starting key rotation process...')
      }

      // 現在のアクティブキーを取得
      const activeKeys = await this.getActiveKeys()

      // 新しいキーを生成
      const newKey = await this.generateEncryptionKey()

      // 古いキーを非推奨に変更
      for (const oldKey of activeKeys) {
        await this.deprecateKey(oldKey.id)
      }

      // 期限切れキーのクリーンアップ
      await this.cleanupExpiredKeys()

      if (process.env.NODE_ENV === 'development') {
        logger.info(`Key rotation completed. New key: ${newKey.id.substring(0, 8)}...`)
      }

      // ローテーション統計を更新
      await this.updateRotationStatistics()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Key rotation failed:', error)
      }
      throw error
    }
  }

  /**
   * キーの非推奨化
   */
  async deprecateKey(keyId: string): Promise<void> {
    const key = await this.getKeyById(keyId)
    if (!key) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn(`Cannot deprecate non-existent key: ${keyId}`)
      }
      return
    }

    key.status = 'deprecated'
    key.expiresAt = Date.now() + this.config.keyRetentionPeriod

    await this.storeKey(key)
    this.keyCache.set(keyId, key)

    if (process.env.NODE_ENV === 'development') {
      logger.info(
        `Key deprecated: ${keyId.substring(0, 8)}... (expires: ${new Date(key?.expiresAt)})`
      )
    }
  }

  /**
   * キーの取り消し
   */
  async revokeKey(keyId: string, reason?: string): Promise<void> {
    const key = await this.getKeyById(keyId)
    if (!key) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn(`Cannot revoke non-existent key: ${keyId}`)
      }
      return
    }

    key.status = 'revoked'
    key.expiresAt = Date.now() // 即座に期限切れに

    await this.storeKey(key)
    this.keyCache.set(keyId, key)

    if (process.env.NODE_ENV === 'development') {
      logger.warn(`Key revoked: ${keyId.substring(0, 8)}... ${reason ? `(reason: ${reason})` : ''}`)
    }

    // セキュリティログ記録
    await this.logSecurityEvent('KEY_REVOKED', {
      keyId,
      reason,
      timestamp: Date.now(),
    })
  }

  /**
   * 段階的再暗号化の実行
   */
  async performGradualReEncryption(
    oldKeyId: string,
    newKeyId: string,
    batchSize: number = 100
  ): Promise<{
    processed: number
    failed: number
    completed: boolean
  }> {
    try {
      const oldKey = await this.getKeyById(oldKeyId)
      const newKey = await this.getKeyById(newKeyId)

      if (!oldKey || !newKey) {
        throw new Error('Required keys not found for re-encryption')
      }

      // 再暗号化が必要なデータのリストを取得
      const dataToReEncrypt = await this.getDataForReEncryption(oldKeyId, batchSize)

      let processed = 0
      let failed = 0

      for (const dataItem of dataToReEncrypt) {
        try {
          // 旧キーで復号
          const decryptedData = this.decryptWithKey(dataItem.encryptedData, oldKey)

          // 新キーで再暗号化
          const reEncryptedData = this.encryptWithKey(decryptedData, newKey)

          // データベース更新
          await this.updateEncryptedData(dataItem.id, reEncryptedData, newKeyId)

          processed++
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            logger.error(`Re-encryption failed for data item ${dataItem.id}:`, error)
          }
          failed++
        }
      }

      const completed = dataToReEncrypt.length < batchSize // 最後のバッチの場合

      if (process.env.NODE_ENV === 'development') {
        logger.info(
          `Re-encryption batch completed: ${processed} processed, ${failed} failed, completed: ${completed}`
        )
      }

      return { processed, failed, completed }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Gradual re-encryption failed:', error)
      }
      throw error
    }
  }

  /**
   * キー使用統計の取得
   */
  async getKeyUsageStatistics(): Promise<{
    activeKeys: number
    deprecatedKeys: number
    revokedKeys: number
    totalUsage: number
    rotationHistory: Array<{ timestamp: number; keyId: string; action: string }>
  }> {
    try {
      const allKeys = await this.getAllKeys()

      const stats = {
        activeKeys: allKeys.filter((k) => k.status === 'active').length,
        deprecatedKeys: allKeys.filter((k) => k.status === 'deprecated').length,
        revokedKeys: allKeys.filter((k) => k.status === 'revoked').length,
        totalUsage: Array.from(this.keyUsageCounter.values()).reduce(
          (sum, count) => sum + count,
          0
        ),
        rotationHistory: await this.getRotationHistory(),
      }

      return stats
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to get key usage statistics:', error)
      }
      throw error
    }
  }

  /**
   * 本番環境用キー管理戦略
   */
  async setupProductionKeyStrategy(): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      logger.warn('Production key strategy setup called in non-production environment')
      return
    }

    try {
      // HSM統合の準備（将来実装）
      await this.prepareHSMIntegration()

      // 分散キー管理の設定
      await this.setupDistributedKeyManagement()

      // 暗号化キー監査ログの有効化
      await this.enableKeyAuditLogging()

      // 災害復旧用キーバックアップの設定
      await this.setupKeyBackupStrategy()

      if (process.env.NODE_ENV === 'development') {
        logger.info('Production key management strategy initialized')
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to setup production key strategy:', error)
      }
      throw error
    }
  }

  /**
   * キーをストレージに保存
   */
  private async storeKey(keyVersion: KeyVersion): Promise<void> {
    const serializedKey = this.serializeKey(keyVersion)

    if (this.redis) {
      await this.redis.setex(
        `key:${keyVersion.id}`,
        Math.ceil(this.config.keyRetentionPeriod / 1000),
        serializedKey
      )

      // インデックス更新
      await this.redis.zadd('keys:by_created', keyVersion.createdAt, keyVersion.id)
    } else {
      // メモリ内ストレージ（開発環境用）
      this.keyCache.set(keyVersion.id, keyVersion)
    }
  }

  /**
   * アクティブキーの取得
   */
  private async getActiveKeys(): Promise<KeyVersion[]> {
    const allKeys = await this.getAllKeys()
    return allKeys.filter((key) => key.status === 'active')
  }

  /**
   * ストレージからアクティブキーを検索
   */
  private async findActiveKeyFromStorage(purpose: string): Promise<KeyVersion | null> {
    if (!this.redis) {return null}

    try {
      const keyIds = await this.redis.zrevrange('keys:by_created', 0, 10)

      for (const keyId of keyIds) {
        const keyData = await this.redis.get(`key:${keyId}`)
        if (keyData) {
          const key = this.deserializeKey(keyData)
          if (key.status === 'active' && key.purpose === purpose) {
            return key
          }
        }
      }

      return null
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to find active key from storage:', error)
      }
      return null
    }
  }

  /**
   * 期限切れキーのクリーンアップ
   */
  private async cleanupExpiredKeys(): Promise<void> {
    try {
      const now = Date.now()
      const allKeys = await this.getAllKeys()

      for (const key of allKeys) {
        if (key.expiresAt && key.expiresAt < now) {
          // キーを完全に削除
          await this.deleteKey(key.id)
          if (process.env.NODE_ENV === 'development') {
            logger.info(`Expired key cleaned up: ${key.id.substring(0, 8)}...`)
          }
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Key cleanup failed:', error)
      }
    }
  }

  /**
   * キーの削除
   */
  private async deleteKey(keyId: string): Promise<void> {
    if (this.redis) {
      await this.redis.del(`key:${keyId}`)
      await this.redis.zrem('keys:by_created', keyId)
    }

    this.keyCache.delete(keyId)
    this.keyUsageCounter.delete(keyId)
  }

  /**
   * 全キーの取得
   */
  private async getAllKeys(): Promise<KeyVersion[]> {
    const keys: KeyVersion[] = []

    if (this.redis) {
      const keyIds = await this.redis.zrange('keys:by_created', 0, -1)

      for (const keyId of keyIds) {
        const keyData = await this.redis.get(`key:${keyId}`)
        if (keyData) {
          keys.push(this.deserializeKey(keyData))
        }
      }
    } else {
      keys.push(...Array.from(this.keyCache.values()))
    }

    return keys
  }

  /**
   * キーのシリアライゼーション
   */
  private serializeKey(key: KeyVersion): string {
    return JSON.stringify({
      ...key,
      key: key.key.toString('hex'),
    })
  }

  /**
   * キーのデシリアライゼーション
   */
  private deserializeKey(data: string): KeyVersion {
    const parsed = JSON.parse(data)
    return {
      ...parsed,
      key: Buffer.from(parsed.key, 'hex'),
    }
  }

  /**
   * 特定のキーでデータ暗号化
   */
  private encryptWithKey(data: string, key: KeyVersion): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(key.algorithm, key.key)

    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    return JSON.stringify({
      encrypted,
      iv: iv.toString('hex'),
      keyId: key.id,
    })
  }

  /**
   * 特定のキーでデータ復号化
   */
  private decryptWithKey(encryptedData: string, key: KeyVersion): string {
    const { encrypted } = JSON.parse(encryptedData)
    const decipher = crypto.createDecipher(key.algorithm, key.key)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }

  /**
   * 再暗号化対象データの取得（実装は実際のデータベース構造に依存）
   */
  private async getDataForReEncryption(
    _oldKeyId: string,
    _limit: number
  ): Promise<Array<{ id: string; encryptedData: string }>> {
    // 実際の実装では、データベースクエリを実行
    // ここではダミーデータを返す
    return []
  }

  /**
   * 暗号化データの更新（実装は実際のデータベース構造に依存）
   */
  private async updateEncryptedData(
    dataId: string,
    newEncryptedData: string,
    newKeyId: string
  ): Promise<void> {
    // 実際の実装では、データベース更新を実行
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Updated data ${dataId} with new key ${newKeyId}`)
    }
  }

  /**
   * ローテーション統計の更新
   */
  private async updateRotationStatistics(): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.incr('key_rotation_count')
        await this.redis.set('last_rotation_time', Date.now())
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to update rotation statistics:', error)
      }
    }
  }

  /**
   * ローテーション履歴の取得
   */
  private async getRotationHistory(): Promise<
    Array<{ timestamp: number; keyId: string; action: string }>
  > {
    try {
      if (this.redis) {
        const history = await this.redis.lrange('key_rotation_history', 0, 9)
        return history.map((item) => JSON.parse(item))
      }
      return []
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to get rotation history:', error)
      }
      return []
    }
  }

  /**
   * セキュリティイベントログ記録
   */
  private async logSecurityEvent(event: string, details: unknown): Promise<void> {
    try {
      const logEntry = {
        event,
        details,
        timestamp: Date.now(),
      }

      if (this.redis) {
        await this.redis.lpush('security_events', JSON.stringify(logEntry))
        await this.redis.ltrim('security_events', 0, 999) // 最新1000件を保持
      }

      if (process.env.NODE_ENV === 'development') {
        logger.warn(`Security event logged: ${event}`, details)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to log security event:', error)
      }
    }
  }

  /**
   * HSM統合準備（将来実装）
   */
  private async prepareHSMIntegration(): Promise<void> {
    // HSM (Hardware Security Module) 統合の準備
    if (process.env.NODE_ENV === 'development') {
      logger.info('HSM integration preparation (placeholder)')
    }
  }

  /**
   * 分散キー管理設定
   */
  private async setupDistributedKeyManagement(): Promise<void> {
    // 分散環境でのキー管理設定
    if (process.env.NODE_ENV === 'development') {
      logger.info('Distributed key management setup (placeholder)')
    }
  }

  /**
   * キー監査ログ有効化
   */
  private async enableKeyAuditLogging(): Promise<void> {
    // キー使用の監査ログ機能を有効化
    if (process.env.NODE_ENV === 'development') {
      logger.info('Key audit logging enabled (placeholder)')
    }
  }

  /**
   * キーバックアップ戦略設定
   */
  private async setupKeyBackupStrategy(): Promise<void> {
    // 災害復旧用のキーバックアップ戦略を設定
    if (process.env.NODE_ENV === 'development') {
      logger.info('Key backup strategy setup (placeholder)')
    }
  }

  /**
   * システム終了処理
   */
  destroy(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer)
      this.rotationTimer = null
    }

    if (process.env.NODE_ENV === 'development') {
      logger.info('Key Management System destroyed')
    }
  }
}

/**
 * 拡張された暗号化サービス（キーローテーション対応）
 */
export class EnhancedEncryptionService {
  private keyManager: KeyManagementSystem

  constructor(masterKey: string, config?: Partial<KeyRotationConfig>) {
    this.keyManager = new KeyManagementSystem(masterKey, config)
  }

  /**
   * データ暗号化（自動キーローテーション対応）
   */
  async encrypt(data: string): Promise<{
    encrypted: string
    iv: string
    tag: string
    metadata: EncryptionMetadata
  }> {
    try {
      const activeKey = await this.keyManager.getActiveEncryptionKey()
      const iv = crypto.randomBytes(16)

      const cipher = crypto.createCipher(activeKey.algorithm, activeKey.key)
      let encrypted = cipher.update(data, 'utf8', 'hex')
      encrypted += cipher.final('hex')

      const tag = cipher.getAuthTag?.()?.toString('hex') || ''

      const metadata: EncryptionMetadata = {
        keyId: activeKey.id,
        keyVersion: 1, // TODO: バージョニング実装
        algorithm: activeKey.algorithm,
        timestamp: Date.now(),
        rotationGeneration: 1, // TODO: 世代管理実装
      }

      return {
        encrypted,
        iv: iv.toString('hex'),
        tag,
        metadata,
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Enhanced encryption failed:', error)
      }
      throw new Error('Encryption failed')
    }
  }

  /**
   * データ復号化（マルチバージョンキー対応）
   */
  async decrypt(
    encryptedData: string,
    iv: string,
    tag: string,
    metadata: EncryptionMetadata
  ): Promise<string> {
    try {
      const key = await this.keyManager.getKeyById(metadata.keyId)

      if (!key) {
        throw new Error(`Decryption key not found: ${metadata.keyId}`)
      }

      if (key.status === 'revoked') {
        throw new Error(`Cannot decrypt with revoked key: ${metadata.keyId}`)
      }

      const decipher = crypto.createDecipher(key.algorithm, key.key)

      if (tag) {
        decipher.setAuthTag?.(Buffer.from(tag, 'hex'))
      }

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
      decrypted += decipher.final('utf8')

      return decrypted
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Enhanced decryption failed:', error)
      }
      throw new Error('Decryption failed')
    }
  }

  /**
   * キー管理システムへのアクセス
   */
  getKeyManager(): KeyManagementSystem {
    return this.keyManager
  }

  /**
   * システム終了処理
   */
  destroy(): void {
    this.keyManager.destroy()
  }
}

// 環境変数からキーマネージャーを初期化
const env = process.env
export const keyManager = new KeyManagementSystem(
  env.ENCRYPTION_MASTER_KEY || crypto.randomBytes(32).toString('hex'),
  {
    rotationInterval: parseInt(env.ENCRYPTION_KEY_ROTATION_INTERVAL || '86400000'),
    keyRetentionPeriod: parseInt(env.ENCRYPTION_KEY_RETENTION_PERIOD || '604800000'), // 7日
    autoRotationEnabled: env.ENCRYPTION_AUTO_ROTATION !== 'false',
    keyDerivationRounds: parseInt(env.ENCRYPTION_KEY_DERIVATION_ITERATIONS || '100000'),
  }
)

export const enhancedEncryption = new EnhancedEncryptionService(
  env.ENCRYPTION_MASTER_KEY || crypto.randomBytes(32).toString('hex')
)

export default {
  KeyManagementSystem,
  EnhancedEncryptionService,
  keyManager,
  enhancedEncryption,
}
