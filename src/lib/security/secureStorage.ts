/**
 * セキュアストレージシステム
 * @description IndexedDBベースの暗号化されたストレージ層
 * XSS攻撃に対する耐性を持つセキュアなデータ保存機能を提供
 * @author Claude Code Actions
 * @version 1.0.0
 * @since 2025-09-28
 */

import { logger } from '../../services/logger'

// ========================================
// 型定義
// ========================================

/**
 * ストレージタイプ
 */
export enum StorageType {
  ENCRYPTION_KEY = 'encryption_key',
  SESSION_DATA = 'session_data',
  USER_PREFERENCES = 'user_preferences',
  CACHED_DATA = 'cached_data',
}

/**
 * 暗号化されたデータ構造
 */
export interface EncryptedData {
  id: string
  type: StorageType
  data: ArrayBuffer
  iv: ArrayBuffer
  salt?: ArrayBuffer
  timestamp: number
  expiresAt?: number
}

/**
 * キー情報
 */
export interface KeyInfo {
  key: CryptoKey
  algorithm: string
  extractable: boolean
  usages: KeyUsage[]
  createdAt: number
  expiresAt?: number
}

// ========================================
// セキュアキーストアクラス
// ========================================

/**
 * 暗号化キーの安全な管理
 * IndexedDBを使用してCryptoKeyを永続化
 */
export class SecureKeyStore {
  private static readonly DB_NAME = 'PMPSecureKeyStore'
  private static readonly DB_VERSION = 1
  private static readonly STORE_NAME = 'keys'
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null

  /**
   * データベース初期化
   */
  private async initialize(): Promise<void> {
    if (this.db) return
    if (this.initPromise) return this.initPromise

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(SecureKeyStore.DB_NAME, SecureKeyStore.DB_VERSION)

      request.onerror = () => {
        logger.error('SecureKeyStore: Failed to open database')
        reject(new Error('Failed to initialize secure key store'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // キーストアの作成
        if (!db.objectStoreNames.contains(SecureKeyStore.STORE_NAME)) {
          const store = db.createObjectStore(SecureKeyStore.STORE_NAME, { keyPath: 'id' })
          store.createIndex('type', 'type', { unique: false })
          store.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })

    return this.initPromise
  }

  /**
   * 暗号化キーの保存
   */
  async storeEncryptionKey(key: CryptoKey, id: string = 'master'): Promise<void> {
    await this.initialize()
    if (!this.db) throw new Error('Database not initialized')

    try {
      // キーのエクスポート（IndexedDBに保存するため）
      const exportedKey = await crypto.subtle.exportKey('raw', key)

      const transaction = this.db.transaction([SecureKeyStore.STORE_NAME], 'readwrite')
      const store = transaction.objectStore(SecureKeyStore.STORE_NAME)

      const keyData = {
        id,
        type: StorageType.ENCRYPTION_KEY,
        key: exportedKey,
        algorithm: key.algorithm.name,
        extractable: key.extractable,
        usages: key.usages,
        timestamp: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24時間
      }

      await new Promise((resolve, reject) => {
        const request = store.put(keyData)
        request.onsuccess = resolve
        request.onerror = () => reject(new Error('Failed to store encryption key'))
      })

      logger.info('SecureKeyStore: Encryption key stored successfully')
    } catch (error) {
      logger.error('SecureKeyStore: Failed to store encryption key', error)
      throw error
    }
  }

  /**
   * 暗号化キーの取得
   */
  async getEncryptionKey(id: string = 'master'): Promise<CryptoKey | null> {
    await this.initialize()
    if (!this.db) throw new Error('Database not initialized')

    try {
      const transaction = this.db.transaction([SecureKeyStore.STORE_NAME], 'readonly')
      const store = transaction.objectStore(SecureKeyStore.STORE_NAME)

      const keyData = await new Promise<any>((resolve, reject) => {
        const request = store.get(id)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(new Error('Failed to retrieve encryption key'))
      })

      if (!keyData) return null

      // 有効期限チェック
      if (keyData.expiresAt && Date.now() > keyData.expiresAt) {
        await this.clearKeys()
        return null
      }

      // CryptoKeyのインポート
      const key = await crypto.subtle.importKey(
        'raw',
        keyData.key,
        { name: 'AES-GCM', length: 256 },
        keyData.extractable,
        keyData.usages
      )

      return key
    } catch (error) {
      logger.error('SecureKeyStore: Failed to retrieve encryption key', error)
      return null
    }
  }

  /**
   * すべてのキーをクリア
   */
  async clearKeys(): Promise<void> {
    await this.initialize()
    if (!this.db) throw new Error('Database not initialized')

    try {
      const transaction = this.db.transaction([SecureKeyStore.STORE_NAME], 'readwrite')
      const store = transaction.objectStore(SecureKeyStore.STORE_NAME)

      await new Promise<void>((resolve, reject) => {
        const request = store.clear()
        request.onsuccess = () => resolve()
        request.onerror = () => reject(new Error('Failed to clear keys'))
      })

      logger.info('SecureKeyStore: All keys cleared')
    } catch (error) {
      logger.error('SecureKeyStore: Failed to clear keys', error)
      throw error
    }
  }

  /**
   * データベース接続を閉じる
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
      this.initPromise = null
    }
  }
}

// ========================================
// メモリ内トークン管理クラス
// ========================================

/**
 * XSS耐性のあるトークン管理
 * トークンをメモリ内のみで管理し、DOMやストレージに露出させない
 */
export class TokenManager {
  private static instance: TokenManager | null = null
  private readonly tokens: Map<string, string>
  private readonly tokenMetadata: Map<string, { createdAt: number; expiresAt?: number }>
  private cleanupInterval: number | null = null

  private constructor() {
    this.tokens = new Map()
    this.tokenMetadata = new Map()
    this.startCleanupTask()
  }

  /**
   * シングルトンインスタンスの取得
   */
  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  /**
   * トークンの設定
   */
  setToken(type: string, token: string, expiresIn?: number): void {
    if (!type || !token) {
      throw new Error('Invalid token parameters')
    }

    this.tokens.set(type, token)
    this.tokenMetadata.set(type, {
      createdAt: Date.now(),
      expiresAt: expiresIn ? Date.now() + expiresIn : undefined
    })

    logger.debug(`TokenManager: Token set for type: ${type}`)
  }

  /**
   * トークンの取得
   */
  getToken(type: string): string | null {
    const metadata = this.tokenMetadata.get(type)

    // 有効期限チェック
    if (metadata?.expiresAt && Date.now() > metadata.expiresAt) {
      this.removeToken(type)
      return null
    }

    return this.tokens.get(type) || null
  }

  /**
   * トークンの削除
   */
  removeToken(type: string): void {
    this.tokens.delete(type)
    this.tokenMetadata.delete(type)
    logger.debug(`TokenManager: Token removed for type: ${type}`)
  }

  /**
   * すべてのトークンをクリア
   */
  clearTokens(): void {
    this.tokens.clear()
    this.tokenMetadata.clear()
    logger.info('TokenManager: All tokens cleared')
  }

  /**
   * 有効期限切れトークンの自動クリーンアップ
   */
  private startCleanupTask(): void {
    // 1分ごとに有効期限切れトークンをチェック
    this.cleanupInterval = window.setInterval(() => {
      const now = Date.now()
      const expiredTokens: string[] = []

      for (const [type, metadata] of this.tokenMetadata.entries()) {
        if (metadata.expiresAt && now > metadata.expiresAt) {
          expiredTokens.push(type)
        }
      }

      expiredTokens.forEach(type => this.removeToken(type))

      if (expiredTokens.length > 0) {
        logger.debug(`TokenManager: Cleaned up ${expiredTokens.length} expired tokens`)
      }
    }, 60000) as unknown as number
  }

  /**
   * クリーンアップタスクの停止
   */
  stopCleanupTask(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }

  /**
   * トークンの存在確認
   */
  hasToken(type: string): boolean {
    const metadata = this.tokenMetadata.get(type)

    // 有効期限チェック
    if (metadata?.expiresAt && Date.now() > metadata.expiresAt) {
      this.removeToken(type)
      return false
    }

    return this.tokens.has(type)
  }

  /**
   * トークン情報の取得（デバッグ用）
   */
  getTokenInfo(type: string): { exists: boolean; createdAt?: number; expiresAt?: number } | null {
    if (!this.hasToken(type)) {
      return { exists: false }
    }

    const metadata = this.tokenMetadata.get(type)
    return {
      exists: true,
      createdAt: metadata?.createdAt,
      expiresAt: metadata?.expiresAt
    }
  }
}

// ========================================
// セキュアストレージクラス
// ========================================

/**
 * IndexedDBを使用した暗号化ストレージ
 * すべてのデータを暗号化してから保存
 */
export class SecureStorage {
  private static readonly DB_NAME = 'PMPSecureStorage'
  private static readonly DB_VERSION = 1
  private static readonly STORE_NAME = 'encrypted_data'
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null
  private encryptionKey: CryptoKey | null = null
  private readonly keyStore: SecureKeyStore

  constructor() {
    this.keyStore = new SecureKeyStore()
  }

  /**
   * データベース初期化
   */
  private async initialize(): Promise<void> {
    if (this.db) return
    if (this.initPromise) return this.initPromise

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(SecureStorage.DB_NAME, SecureStorage.DB_VERSION)

      request.onerror = () => {
        logger.error('SecureStorage: Failed to open database')
        reject(new Error('Failed to initialize secure storage'))
      }

      request.onsuccess = async () => {
        this.db = request.result

        // 暗号化キーの取得または生成
        await this.initializeEncryptionKey()

        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // 暗号化データストアの作成
        if (!db.objectStoreNames.contains(SecureStorage.STORE_NAME)) {
          const store = db.createObjectStore(SecureStorage.STORE_NAME, { keyPath: 'id' })
          store.createIndex('type', 'type', { unique: false })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('expiresAt', 'expiresAt', { unique: false })
        }
      }
    })

    return this.initPromise
  }

  /**
   * 暗号化キーの初期化
   */
  private async initializeEncryptionKey(): Promise<void> {
    // 既存のキーを取得
    this.encryptionKey = await this.keyStore.getEncryptionKey()

    // キーが存在しない場合は新規生成
    if (!this.encryptionKey) {
      this.encryptionKey = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      )

      // キーを保存
      await this.keyStore.storeEncryptionKey(this.encryptionKey)
    }
  }

  /**
   * データの暗号化と保存
   */
  async setItem(key: string, value: any, type: StorageType = StorageType.CACHED_DATA, ttl?: number): Promise<void> {
    await this.initialize()
    if (!this.db || !this.encryptionKey) throw new Error('Storage not initialized')

    try {
      // データをJSON文字列化
      const jsonString = JSON.stringify(value)
      const encoder = new TextEncoder()
      const data = encoder.encode(jsonString)

      // 暗号化パラメータ
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const salt = crypto.getRandomValues(new Uint8Array(32))

      // データの暗号化
      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        data
      )

      // IndexedDBに保存
      const transaction = this.db.transaction([SecureStorage.STORE_NAME], 'readwrite')
      const store = transaction.objectStore(SecureStorage.STORE_NAME)

      const storageData: EncryptedData = {
        id: key,
        type,
        data: encryptedData,
        iv: iv.buffer,
        salt: salt.buffer,
        timestamp: Date.now(),
        expiresAt: ttl ? Date.now() + ttl : undefined
      }

      await new Promise((resolve, reject) => {
        const request = store.put(storageData)
        request.onsuccess = resolve
        request.onerror = () => reject(new Error('Failed to store encrypted data'))
      })

      logger.debug(`SecureStorage: Data stored with key: ${key}`)
    } catch (error) {
      logger.error('SecureStorage: Failed to store data', error)
      throw error
    }
  }

  /**
   * データの取得と復号化
   */
  async getItem(key: string): Promise<any> {
    await this.initialize()
    if (!this.db || !this.encryptionKey) throw new Error('Storage not initialized')

    try {
      const transaction = this.db.transaction([SecureStorage.STORE_NAME], 'readonly')
      const store = transaction.objectStore(SecureStorage.STORE_NAME)

      const storageData = await new Promise<EncryptedData | undefined>((resolve, reject) => {
        const request = store.get(key)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(new Error('Failed to retrieve data'))
      })

      if (!storageData) return null

      // 有効期限チェック
      if (storageData.expiresAt && Date.now() > storageData.expiresAt) {
        await this.removeItem(key)
        return null
      }

      // データの復号化
      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(storageData.iv) },
        this.encryptionKey,
        storageData.data
      )

      // JSONパース
      const decoder = new TextDecoder()
      const jsonString = decoder.decode(decryptedData)
      return JSON.parse(jsonString)
    } catch (error) {
      logger.error('SecureStorage: Failed to retrieve data', error)
      return null
    }
  }

  /**
   * データの削除
   */
  async removeItem(key: string): Promise<void> {
    await this.initialize()
    if (!this.db) throw new Error('Storage not initialized')

    try {
      const transaction = this.db.transaction([SecureStorage.STORE_NAME], 'readwrite')
      const store = transaction.objectStore(SecureStorage.STORE_NAME)

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(key)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(new Error('Failed to remove data'))
      })

      logger.debug(`SecureStorage: Data removed with key: ${key}`)
    } catch (error) {
      logger.error('SecureStorage: Failed to remove data', error)
      throw error
    }
  }

  /**
   * すべてのデータをクリア
   */
  async clear(): Promise<void> {
    await this.initialize()
    if (!this.db) throw new Error('Storage not initialized')

    try {
      const transaction = this.db.transaction([SecureStorage.STORE_NAME], 'readwrite')
      const store = transaction.objectStore(SecureStorage.STORE_NAME)

      await new Promise<void>((resolve, reject) => {
        const request = store.clear()
        request.onsuccess = () => resolve()
        request.onerror = () => reject(new Error('Failed to clear storage'))
      })

      logger.info('SecureStorage: All data cleared')
    } catch (error) {
      logger.error('SecureStorage: Failed to clear storage', error)
      throw error
    }
  }

  /**
   * 有効期限切れデータのクリーンアップ
   */
  async cleanupExpiredData(): Promise<number> {
    await this.initialize()
    if (!this.db) throw new Error('Storage not initialized')

    try {
      const transaction = this.db.transaction([SecureStorage.STORE_NAME], 'readwrite')
      const store = transaction.objectStore(SecureStorage.STORE_NAME)
      const index = store.index('expiresAt')

      const now = Date.now()
      const range = IDBKeyRange.upperBound(now)
      let deletedCount = 0

      await new Promise<void>((resolve, reject) => {
        const request = index.openCursor(range)

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result
          if (cursor) {
            cursor.delete()
            deletedCount++
            cursor.continue()
          } else {
            resolve()
          }
        }

        request.onerror = () => reject(new Error('Failed to cleanup expired data'))
      })

      if (deletedCount > 0) {
        logger.info(`SecureStorage: Cleaned up ${deletedCount} expired items`)
      }

      return deletedCount
    } catch (error) {
      logger.error('SecureStorage: Failed to cleanup expired data', error)
      return 0
    }
  }

  /**
   * データベース接続を閉じる
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
      this.initPromise = null
      this.encryptionKey = null
    }
    this.keyStore.close()
  }
}

// ========================================
// XSS対策ユーティリティ
// ========================================

/**
 * XSS攻撃からデータを保護するためのサニタイザー
 */
export class XSSProtection {
  /**
   * HTML文字列のエスケープ
   */
  static escapeHtml(str: string): string {
    const div = document.createElement('div')
    div.textContent = str
    return div.innerHTML
  }

  /**
   * 属性値のエスケープ
   */
  static escapeAttribute(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  /**
   * JavaScript文字列のエスケープ
   */
  static escapeJs(str: string): string {
    return JSON.stringify(str).slice(1, -1)
  }

  /**
   * URLパラメータのサニタイズ
   */
  static sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url, window.location.origin)

      // 危険なプロトコルをブロック
      const allowedProtocols = ['http:', 'https:']
      if (!allowedProtocols.includes(parsed.protocol)) {
        throw new Error('Unsafe protocol')
      }

      return parsed.href
    } catch {
      return ''
    }
  }

  /**
   * CSPヘッダーの生成
   */
  static generateCSPHeader(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // 必要に応じて調整
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.supabase.co https://api.github.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  }
}

// ========================================
// エクスポート
// ========================================

// シングルトンインスタンス
export const secureKeyStore = new SecureKeyStore()
export const tokenManager = TokenManager.getInstance()
export const secureStorage = new SecureStorage()

// デフォルトエクスポート
export default {
  SecureKeyStore,
  TokenManager,
  SecureStorage,
  XSSProtection,
  StorageType,
  // インスタンス
  secureKeyStore,
  tokenManager,
  secureStorage
}