/**
 * 包括的暗号化システム
 * Developer 2: データ暗号化・ハッシュ化・暗号化ユーティリティ実装
 */

import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { logger } from '../../services/logger'
// import Redis from 'ioredis' // TODO: Will be used in future
// import { getRedisClient } from './rateLimiting' // TODO: Will be used in future

// 暗号化設定
const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm' as const,
  keyLength: 32, // 256 bits
  ivLength: 16, // 128 bits
  tagLength: 16, // 128 bits
  saltLength: 32, // 256 bits
  iterations: 100000, // PBKDF2 反復回数
} as const

// キーバージョン情報
export interface KeyVersion {
  id: string
  key: Buffer
  derivedFrom?: string
  createdAt: number
  expiresAt?: number
  status: 'active' | 'deprecated' | 'revoked'
  algorithm: string
  purpose: 'encryption' | 'signing' | 'derivation'
  rotationSchedule?: number
}

// キーローテーション設定
export interface KeyRotationConfig {
  rotationInterval: number // milliseconds
  keyRetentionPeriod: number // milliseconds
  autoRotationEnabled: boolean
  masterKeyRotationThreshold: number // number of encryptions before rotation
  keyDerivationRounds: number
  maxActiveKeys: number
}

// 暗号化メタデータ
export interface EncryptionMetadata {
  keyId: string
  keyVersion: number
  algorithm: string
  timestamp: number
  rotationGeneration: number
}

// 拡張された暗号化結果
export interface EnhancedEncryptionResult extends EncryptionResult {
  metadata: EncryptionMetadata
  keyId: string
  version: number
}

// 環境変数スキーマ（キーローテーション対応）
const EncryptionEnvSchema = z.object({
  ENCRYPTION_MASTER_KEY: z.string().min(32),
  ENCRYPTION_KEY_ROTATION_INTERVAL: z.string().default('86400000'), // 24時間
  ENCRYPTION_KEY_DERIVATION_ITERATIONS: z.string().default('100000'),
  HASH_PEPPER: z.string().min(16),
  APP_SECRET: z.string().min(32),
})

// 環境変数の検証（キーローテーション対応）
const getEncryptionEnv = () => {
  try {
    return EncryptionEnvSchema.parse({
      ENCRYPTION_MASTER_KEY:
        process.env.ENCRYPTION_MASTER_KEY ||
        (() => {
          if (process.env.NODE_ENV === 'production') {
            throw new Error('ENCRYPTION_MASTER_KEY must be set in production')
          }
          return crypto.randomBytes(32).toString('hex')
        })(),
      ENCRYPTION_KEY_ROTATION_INTERVAL: process.env.ENCRYPTION_KEY_ROTATION_INTERVAL || '86400000',
      ENCRYPTION_KEY_DERIVATION_ITERATIONS:
        process.env.ENCRYPTION_KEY_DERIVATION_ITERATIONS || '100000',
      HASH_PEPPER:
        process.env.HASH_PEPPER ||
        (() => {
          if (process.env.NODE_ENV === 'production') {
            throw new Error('HASH_PEPPER must be set in production')
          }
          return crypto.randomBytes(16).toString('hex')
        })(),
      APP_SECRET:
        process.env.APP_SECRET ||
        process.env.NEXTAUTH_SECRET ||
        (() => {
          if (process.env.NODE_ENV === 'production') {
            throw new Error('APP_SECRET must be set in production')
          }
          return 'default-app-secret-change-in-production'
        })(),
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('暗号化環境変数が正しく設定されていません:', error)
    }
    throw new Error('暗号化設定エラー')
  }
}

// 暗号化結果の型定義
export interface EncryptionResult {
  encrypted: string
  iv: string
  tag: string
  salt?: string
}

export interface DecryptionInput {
  encrypted: string
  iv: string
  tag: string
  salt?: string
}

// パスワードハッシュ結果
export interface PasswordHashResult {
  hash: string
  salt: string
  rounds: number
}

/**
 * 対称暗号化クラス（キーローテーション統合）
 */
export class SymmetricEncryption {
  private readonly masterKey: Buffer
  private keyManager?: unknown // Circular dependency回避のため動的インポート

  constructor() {
    const env = getEncryptionEnv()
    this.masterKey = Buffer.from(env.ENCRYPTION_MASTER_KEY, 'hex')
    this.initializeKeyManager()
  }

  private async initializeKeyManager(): Promise<void> {
    try {
      const { keyManager } = await import('./keyManagement')
      this.keyManager = keyManager
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Key manager not available, using direct master key:', error)
      }
    }
  }

  /**
   * データの暗号化
   */
  encrypt(data: string, useKeyDerivation: boolean = false): EncryptionResult {
    try {
      let key = this.masterKey
      let salt: Buffer | undefined

      // キー派生を使用する場合
      if (useKeyDerivation) {
        salt = crypto.randomBytes(ENCRYPTION_CONFIG.saltLength)
        key = crypto.pbkdf2Sync(
          this.masterKey,
          salt,
          ENCRYPTION_CONFIG.iterations,
          ENCRYPTION_CONFIG.keyLength,
          'sha512'
        )
      }

      const iv = crypto.randomBytes(ENCRYPTION_CONFIG.ivLength)
      const cipher = crypto.createCipheriv(ENCRYPTION_CONFIG.algorithm, key, iv)
      cipher.setAAD(Buffer.from('pmp-learning-system'))

      let encrypted = cipher.update(data, 'utf8', 'hex')
      encrypted += cipher.final('hex')

      const tag = cipher.getAuthTag()

      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        salt: salt?.toString('hex'),
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('暗号化エラー:', error)
      }
      throw new Error('暗号化に失敗しました')
    }
  }

  /**
   * データの復号化
   */
  decrypt(input: DecryptionInput): string {
    try {
      let key = this.masterKey

      // キー派生が使用されている場合
      if (input.salt) {
        const salt = Buffer.from(input.salt, 'hex')
        key = crypto.pbkdf2Sync(
          this.masterKey,
          salt,
          ENCRYPTION_CONFIG.iterations,
          ENCRYPTION_CONFIG.keyLength,
          'sha512'
        )
      }

      const decipher = crypto.createDecipheriv(ENCRYPTION_CONFIG.algorithm, key, Buffer.from(input.iv, 'hex'))
      decipher.setAAD(Buffer.from('pmp-learning-system'))
      decipher.setAuthTag(Buffer.from(input.tag, 'hex'))

      let decrypted = decipher.update(input.encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')

      return decrypted
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('復号化エラー:', error)
      }
      throw new Error('復号化に失敗しました')
    }
  }

  /**
   * ファイルデータの暗号化
   */
  encryptFile(fileBuffer: Buffer): EncryptionResult {
    const base64Data = fileBuffer.toString('base64')
    return this.encrypt(base64Data, true)
  }

  /**
   * ファイルデータの復号化
   */
  decryptFile(input: DecryptionInput): Buffer {
    const base64Data = this.decrypt(input)
    return Buffer.from(base64Data, 'base64')
  }
}

/**
 * 一方向ハッシュ化クラス
 */
export class HashingService {
  private readonly pepper: string

  constructor() {
    const env = getEncryptionEnv()
    this.pepper = env.HASH_PEPPER
  }

  /**
   * パスワードのハッシュ化（bcrypt使用）
   */
  async hashPassword(password: string, rounds: number = 12): Promise<PasswordHashResult> {
    try {
      // ペッパーを追加してからハッシュ化
      const pepperedPassword = password + this.pepper
      const salt = await bcrypt.genSalt(rounds)
      const hash = await bcrypt.hash(pepperedPassword, salt)

      return {
        hash,
        salt,
        rounds,
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('パスワードハッシュ化エラー:', error)
      }
      throw new Error('パスワードハッシュ化に失敗しました')
    }
  }

  /**
   * パスワードの検証
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const pepperedPassword = password + this.pepper
      return await bcrypt.compare(pepperedPassword, hash)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('パスワード検証エラー:', error)
      }
      return false
    }
  }

  /**
   * 機密データのハッシュ化（SHA-256 + HMAC）
   */
  hashSensitiveData(data: string, useTimestamp: boolean = false): string {
    try {
      const env = getEncryptionEnv()
      const hmac = crypto.createHmac('sha256', env.APP_SECRET)

      let hashData = data + this.pepper
      if (useTimestamp) {
        hashData += Date.now().toString()
      }

      hmac.update(hashData)
      return hmac.digest('hex')
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('機密データハッシュ化エラー:', error)
      }
      throw new Error('データハッシュ化に失敗しました')
    }
  }

  /**
   * メールアドレスの匿名化ハッシュ
   */
  hashEmailForAnalytics(email: string): string {
    return this.hashSensitiveData(email.toLowerCase().trim())
  }

  /**
   * ユーザーIDの匿名化ハッシュ
   */
  hashUserIdForAnalytics(userId: string): string {
    return this.hashSensitiveData(userId)
  }

  /**
   * セッション署名
   */
  signSession(sessionData: object): string {
    const dataString = JSON.stringify(sessionData)
    // セッション署名にはタイムスタンプを使用しない（検証可能にするため）
    return this.hashSensitiveData(dataString, false)
  }

  /**
   * セッション署名検証
   */
  verifySessionSignature(sessionData: object, signature: string): boolean {
    const expectedSignature = this.signSession(sessionData)
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  }
}

/**
 * セキュアなトークン生成サービス
 */
export class TokenGenerator {
  /**
   * 暗号論的に安全なランダム文字列生成
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  /**
   * URLセーフなランダム文字列生成
   */
  generateUrlSafeToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64url')
  }

  /**
   * 数値ベースのOTP生成
   */
  generateOTP(digits: number = 6): string {
    const max = Math.pow(10, digits) - 1
    const min = Math.pow(10, digits - 1)
    const randomNum = crypto.randomInt(min, max + 1)
    return randomNum.toString().padStart(digits, '0')
  }

  /**
   * 期限付きトークンの生成
   */
  generateTimedToken(payload: object, expirationMinutes: number = 60): string {
    const expirationTime = Date.now() + expirationMinutes * 60 * 1000
    const tokenData = {
      payload,
      exp: expirationTime,
      iat: Date.now(),
      nonce: this.generateSecureToken(16),
    }

    const encoder = new SymmetricEncryption()
    return encoder.encrypt(JSON.stringify(tokenData), true).encrypted
  }

  /**
   * 期限付きトークンの検証・復号
   */
  verifyTimedToken(encryptedToken: string, iv: string, tag: string, salt: string): object | null {
    try {
      const encoder = new SymmetricEncryption()
      const decrypted = encoder.decrypt({
        encrypted: encryptedToken,
        iv,
        tag,
        salt,
      })

      const tokenData = JSON.parse(decrypted)

      // 期限チェック
      if (Date.now() > tokenData.exp) {
        return null
      }

      return tokenData.payload
    } catch {
      return null
    }
  }
}

/**
 * 個人情報暗号化サービス
 */
export class PIIEncryption {
  private readonly encryption: SymmetricEncryption
  private readonly hashing: HashingService

  constructor() {
    this.encryption = new SymmetricEncryption()
    this.hashing = new HashingService()
  }

  /**
   * 個人情報の暗号化
   */
  encryptPII(data: {
    email?: string
    name?: string
    phone?: string
    address?: string
    [key: string]: string | undefined
  }): Record<string, EncryptionResult> {
    const encrypted: Record<string, EncryptionResult> = {}

    for (const [key, value] of Object.entries(data)) {
      if (value) {
        encrypted[key] = this.encryption.encrypt(value, true)
      }
    }

    return encrypted
  }

  /**
   * 個人情報の復号化
   */
  decryptPII(encryptedData: Record<string, DecryptionInput>): Record<string, string> {
    const decrypted: Record<string, string> = {}

    for (const [key, value] of Object.entries(encryptedData)) {
      try {
        decrypted[key] = this.encryption.decrypt(value)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          logger.error(`PII復号化エラー (${key}):`, error)
        }
        // 復号化に失敗した場合は空文字を返す
        decrypted[key] = ''
      }
    }

    return decrypted
  }

  /**
   * 検索可能暗号化（ハッシュベース）
   */
  createSearchableHash(data: string): string {
    // 検索用のハッシュを生成（大文字小文字を統一）
    const normalized = data.toLowerCase().trim()
    return this.hashing.hashSensitiveData(normalized)
  }

  /**
   * 部分マッチング用のハッシュセット生成
   */
  createPartialSearchHashes(data: string): string[] {
    const normalized = data.toLowerCase().trim()
    const hashes: string[] = []

    // プレフィックスハッシュ（最初の3文字以上）
    for (let i = 3; i <= Math.min(normalized.length, 10); i++) {
      const prefix = normalized.substring(0, i)
      hashes.push(this.hashing.hashSensitiveData(`prefix:${prefix}`))
    }

    // サフィックスハッシュ（最後の3文字以上）
    for (let i = 3; i <= Math.min(normalized.length, 10); i++) {
      const suffix = normalized.substring(normalized.length - i)
      hashes.push(this.hashing.hashSensitiveData(`suffix:${suffix}`))
    }

    return Array.from(new Set(hashes)) // 重複除去
  }
}

/**
 * データベース暗号化ヘルパー
 */
export class DatabaseEncryption {
  private readonly piiEncryption: PIIEncryption

  constructor() {
    this.piiEncryption = new PIIEncryption()
  }

  /**
   * ユーザーデータの暗号化（データベース保存前）
   */
  encryptUserData(userData: { email: string; name?: string; phone?: string; address?: string }) {
    const encrypted = this.piiEncryption.encryptPII(userData)

    return {
      // 暗号化されたデータ
      encryptedData: encrypted,
      // 検索用ハッシュ
      emailHash: this.piiEncryption.createSearchableHash(userData.email),
      nameHash: userData.name ? this.piiEncryption.createSearchableHash(userData.name) : null,
      // 部分検索用ハッシュ
      emailSearchHashes: this.piiEncryption.createPartialSearchHashes(userData.email),
      nameSearchHashes: userData.name
        ? this.piiEncryption.createPartialSearchHashes(userData.name)
        : [],
    }
  }

  /**
   * ユーザーデータの復号化（データベース読み取り後）
   */
  decryptUserData(encryptedUserData: { encryptedData: Record<string, DecryptionInput> }) {
    return this.piiEncryption.decryptPII(encryptedUserData.encryptedData)
  }

  /**
   * 検索クエリ用ハッシュ生成
   */
  generateSearchHash(searchTerm: string): string {
    return this.piiEncryption.createSearchableHash(searchTerm)
  }
}

// エクスポートされるサービスインスタンス
export const symmetricEncryption = new SymmetricEncryption()
export const hashingService = new HashingService()
export const tokenGenerator = new TokenGenerator()
export const piiEncryption = new PIIEncryption()
export const databaseEncryption = new DatabaseEncryption()

// デフォルトエクスポート
export default {
  SymmetricEncryption,
  HashingService,
  TokenGenerator,
  PIIEncryption,
  DatabaseEncryption,
  // インスタンス
  symmetricEncryption,
  hashingService,
  tokenGenerator,
  piiEncryption,
  databaseEncryption,
}
