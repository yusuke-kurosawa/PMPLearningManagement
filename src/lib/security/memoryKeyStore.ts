/**
 * メモリ内セキュアキー管理システム
 * P0-1脆弱性修正: sessionStorageを使用せずメモリ内でキーを管理
 */

export interface KeyMetadata {
  ttl?: number
  purpose?: 'encryption' | 'signing' | 'key-agreement'
  algorithm?: string
  expiry?: number
  created?: number
}

/**
 * メモリ内でのみ暗号化キーを管理するセキュアストア
 * - sessionStorage/localStorageは一切使用しない
 * - TTLベースの自動削除
 * - ガベージコレクション対応
 */
export class MemoryKeyStore {
  private static instance: MemoryKeyStore
  private keys: Map<string, CryptoKey> = new Map()
  private keyMetadata: Map<string, KeyMetadata> = new Map()
  private timers: Map<string, NodeJS.Timeout> = new Map()

  // WeakMapを使用してガベージコレクション対応
  private keyReferences: WeakMap<object, CryptoKey> = new WeakMap()

  private constructor() {
    // シングルトンパターン
    this.setupMemoryProtection()
  }

  private setupMemoryProtection() {
    // メモリ保護の実装
    if (typeof window !== 'undefined' && window.crypto) {
      // オブジェクトの凍結で外部からの変更を防ぐ
      Object.seal(this)
    }
  }

  public static getInstance(): MemoryKeyStore {
    if (!MemoryKeyStore.instance) {
      MemoryKeyStore.instance = new MemoryKeyStore()
    }
    return MemoryKeyStore.instance
  }

  /**
   * キーをメモリに保存
   */
  async storeKey(keyId: string, key: CryptoKey, metadata?: KeyMetadata): Promise<void> {
    // 既存のタイマーをクリア
    const existingTimer = this.timers.get(keyId)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // タイムスタンプベースの有効期限
    const ttl = metadata?.ttl || 3600000 // デフォルト1時間
    const expiry = Date.now() + ttl

    this.keys.set(keyId, key)
    this.keyMetadata.set(keyId, {
      ...metadata,
      expiry,
      created: Date.now(),
    })

    // 自動削除スケジューラー
    const timer = setTimeout(() => {
      this.deleteKey(keyId)
    }, ttl)

    this.timers.set(keyId, timer)
  }

  /**
   * キーを取得
   */
  async getKey(keyId: string): Promise<CryptoKey | null> {
    const metadata = this.keyMetadata.get(keyId)

    // 有効期限チェック
    if (!metadata || (metadata.expiry && metadata.expiry < Date.now())) {
      this.deleteKey(keyId)
      return null
    }

    return this.keys.get(keyId) || null
  }

  /**
   * キーの存在確認
   */
  hasKey(keyId: string): boolean {
    const metadata = this.keyMetadata.get(keyId)
    if (!metadata || (metadata.expiry && metadata.expiry < Date.now())) {
      this.deleteKey(keyId)
      return false
    }
    return this.keys.has(keyId)
  }

  /**
   * キーのセキュアな削除
   */
  deleteKey(keyId: string): void {
    // タイマーのクリア
    const timer = this.timers.get(keyId)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(keyId)
    }

    // キーのゼロ化（可能な限り）
    const key = this.keys.get(keyId)
    if (key) {
      try {
        // CryptoKeyオブジェクトは直接ゼロ化できないが、
        // 参照を削除してガベージコレクションに任せる
        // @ts-ignore - 内部プロパティアクセス
        if (key._key && typeof key._key.fill === 'function') {
          key._key.fill(0)
        }
      } catch {
        // ベストエフォート - エラーは無視
      }
    }

    this.keys.delete(keyId)
    this.keyMetadata.delete(keyId)
  }

  /**
   * 全キーのクリア
   */
  clearAll(): void {
    // 全タイマーのクリア
    for (const timer of this.timers.values()) {
      clearTimeout(timer)
    }

    // 全キーのセキュアな削除
    for (const keyId of this.keys.keys()) {
      this.deleteKey(keyId)
    }

    this.timers.clear()
  }

  /**
   * 期限切れキーのクリーンアップ
   */
  cleanupExpiredKeys(): void {
    const now = Date.now()
    for (const [keyId, metadata] of this.keyMetadata.entries()) {
      if (metadata.expiry && metadata.expiry < now) {
        this.deleteKey(keyId)
      }
    }
  }

  /**
   * 統計情報の取得
   */
  getStats(): {
    totalKeys: number
    activeKeys: number
    expiredKeys: number
  } {
    this.cleanupExpiredKeys()
    const now = Date.now()
    let activeKeys = 0
    let expiredKeys = 0

    for (const metadata of this.keyMetadata.values()) {
      if (metadata.expiry && metadata.expiry < now) {
        expiredKeys++
      } else {
        activeKeys++
      }
    }

    return {
      totalKeys: this.keys.size,
      activeKeys,
      expiredKeys,
    }
  }

  /**
   * キーのTTLを延長
   */
  async extendKeyTTL(keyId: string, additionalTTL: number): Promise<boolean> {
    const metadata = this.keyMetadata.get(keyId)
    const key = this.keys.get(keyId)

    if (!metadata || !key) {
      return false
    }

    // 新しい有効期限
    const newExpiry = Date.now() + additionalTTL
    metadata.expiry = newExpiry

    // 既存タイマーをクリアして新しいタイマーを設定
    const existingTimer = this.timers.get(keyId)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    const timer = setTimeout(() => {
      this.deleteKey(keyId)
    }, additionalTTL)

    this.timers.set(keyId, timer)
    this.keyMetadata.set(keyId, metadata)

    return true
  }
}

// デフォルトエクスポート
export default MemoryKeyStore