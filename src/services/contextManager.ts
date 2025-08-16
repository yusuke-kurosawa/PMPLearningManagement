/**
 * コンテキスト管理サービス
 * @description メモリ効率的なコンテキストストレージ、圧縮、最適化を提供
 * @author Claude Code Actions
 * @version 2.0.0
 * @since 2025-08-14
 */

import { logger } from './logger'

// ========================================
// 型定義
// ========================================

/**
 * コンテキストアイテムの優先度レベル
 */
export type ContextPriority = 'critical' | 'high' | 'normal' | 'low'

/**
 * コンテキストストレージオプション
 */
export interface ContextStorageOptions {
  /** 優先度レベル（デフォルト: 'normal'） */
  priority?: ContextPriority
  /** 有効期限（ミリ秒、デフォルト: 24時間） */
  ttl?: number
  /** カスタムメタデータ */
  metadata?: Record<string, unknown>
}

/**
 * コンテキストアイテム内部構造
 */
interface ContextItem {
  /** 保存データ（圧縮済みまたは生データ） */
  data: string
  /** 圧縮フラグ */
  compressed: boolean
  /** 作成/更新タイムスタンプ */
  timestamp: number
  /** アクセス回数 */
  accessCount: number
  /** 優先度レベル */
  priority: ContextPriority
  /** 有効期限（ミリ秒） */
  ttl: number
  /** カスタムメタデータ */
  metadata?: Record<string, unknown>
}

/**
 * コンテキスト統計情報
 */
export interface ContextStats {
  /** 総エントリ数 */
  totalEntries: number
  /** 総サイズ（KB） */
  totalSizeKB: number
  /** キャッシュヒット率 */
  cacheHitRate: number
  /** 平均アクセス回数 */
  averageAccessCount: number
  /** 圧縮率 */
  compressionRatio: number
  /** 最も使用されているキー（上位5個） */
  topAccessedKeys: Array<{ key: string; accessCount: number }>
}

/**
 * 排除スコア計算用エントリ
 */
interface EvictionEntry {
  /** キー */
  key: string
  /** 優先度重み */
  priority: number
  /** 最終アクセス時刻 */
  lastAccess: number
  /** アクセス回数 */
  accessCount: number
  /** 総合スコア */
  score: number
}

/**
 * バックアップデータ構造
 */
export interface ContextBackup {
  /** キャッシュデータ */
  cache: Record<string, ContextItem>
  /** アーカイブデータ */
  archive: string | null
  /** バックアップ作成時刻 */
  timestamp: number
  /** バージョン情報 */
  version: string
}

// ========================================
// メインコンテキストマネージャークラス
// ========================================

/**
 * コンテキスト管理クラス
 * @description LRUキャッシュ、自動圧縮、TTLベース有効期限管理を提供
 */
class ContextManager {
  /** 内部キャッシュストレージ */
  private readonly cache: Map<string, ContextItem>

  /** 圧縮閾値（バイト） */
  private readonly compressionThreshold: number

  /** 最大キャッシュサイズ */
  private readonly maxCacheSize: number

  /** クリーンアップ間隔（ミリ秒） */
  private readonly cleanupInterval: number

  /** クリーンアップタイマーID */
  private cleanupTimerId: NodeJS.Timeout | null = null

  /** ヒット・ミス統計（統計計算用） */
  private hitCount: number = 0
  private missCount: number = 0

  /**
   * コンストラクタ
   * @description コンテキストマネージャーの初期化
   */
  constructor() {
    this.cache = new Map<string, ContextItem>()
    this.compressionThreshold = 1024 // 1KB
    this.maxCacheSize = 50 // 最大50アイテム
    this.cleanupInterval = 24 * 60 * 60 * 1000 // 24時間
    this.startCleanupTimer()
  }

  // ========================================
  // 公開メソッド - ストレージ操作
  // ========================================

  /**
   * コンテキストデータ保存（自動圧縮対応）
   * @param key - ストレージキー
   * @param data - 保存データ
   * @param options - ストレージオプション
   * @returns 保存成功フラグ
   */
  store(key: string, data: unknown, options: ContextStorageOptions = {}): boolean {
    try {
      const serialized = JSON.stringify(data)
      const compressed = this.shouldCompress(serialized) ? this.compress(serialized) : serialized

      const contextItem: ContextItem = {
        data: compressed,
        compressed: this.shouldCompress(serialized),
        timestamp: Date.now(),
        accessCount: 0,
        priority: options.priority || 'normal',
        ttl: options.ttl || this.cleanupInterval,
        metadata: options.metadata,
      }

      this.cache.set(key, contextItem)
      this.enforceMaxSize()

      if (process.env.NODE_ENV === 'development') {
        logger.debug(`Context stored: ${key} (${serialized.length} bytes)`)
      }

      return true
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Context storage failed:', error)
      }
      return false
    }
  }

  /**
   * コンテキストデータ取得（自動解凍対応）
   * @param key - ストレージキー
   * @returns 取得データまたはnull
   */
  retrieve<T = unknown>(key: string): T | null {
    try {
      const item = this.cache.get(key)
      if (!item) {
        this.missCount++
        return null
      }

      // TTL チェック
      if (Date.now() - item.timestamp > item.ttl) {
        this.cache.delete(key)
        this.missCount++
        return null
      }

      // アクセス統計更新
      item.accessCount++
      item.timestamp = Date.now()
      this.hitCount++

      const data = item.compressed ? this.decompress(item.data) : item.data

      return JSON.parse(data) as T
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Context retrieval failed:', error)
      }
      this.missCount++
      return null
    }
  }

  /**
   * コンテキストデータ削除
   * @param key - ストレージキー
   * @returns 削除成功フラグ
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * キーの存在チェック（TTL考慮）
   * @param key - ストレージキー
   * @returns 存在フラグ
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) {return false}

    // TTL チェック
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * 全キーの一覧取得
   * @returns 有効なキーの配列
   */
  keys(): string[] {
    const validKeys: string[] = []
    const now = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp <= item.ttl) {
        validKeys.push(key)
      }
    }

    return validKeys
  }

  // ========================================
  // プライベートメソッド - 内部処理
  // ========================================

  /**
   * シンプル圧縮（Base64エンコード）
   * @param data - 圧縮対象データ
   * @returns 圧縮後データ
   * @private
   */
  private compress(data: string): string {
    try {
      // 本番環境では適切な圧縮ライブラリを使用することを推奨
      return btoa(encodeURIComponent(data))
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Compression failed, using original data')
      }
      return data
    }
  }

  /**
   * データ解凍
   * @param compressedData - 圧縮済みデータ
   * @returns 解凍後データ
   * @private
   */
  private decompress(compressedData: string): string {
    try {
      return decodeURIComponent(atob(compressedData))
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Decompression failed, using original data')
      }
      return compressedData
    }
  }

  /**
   * 圧縮要否判定
   * @param data - 判定対象データ
   * @returns 圧縮要否フラグ
   * @private
   */
  private shouldCompress(data: string): boolean {
    return data && data.length > this.compressionThreshold
  }

  /**
   * 最大サイズ制限強制（LRU戦略）
   * @private
   */
  private enforceMaxSize(): void {
    if (this.cache.size <= this.maxCacheSize) {return}

    // 優先度と最終アクセス時刻でソート
    const entries: EvictionEntry[] = Array.from(this.cache.entries())
      .map(([key, value]) => ({
        key,
        priority: this.getPriorityWeight(value.priority),
        lastAccess: value.timestamp,
        accessCount: value.accessCount,
        score: this.calculateEvictionScore(value),
      }))
      .sort((a, b) => a.score - b.score)

    // 重要度の低いエントリを削除
    const toRemove = entries.slice(0, this.cache.size - this.maxCacheSize)
    toRemove.forEach((entry) => {
      this.cache.delete(entry.key)
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`Evicted context entry: ${entry.key}`)
      }
    })
  }

  /**
   * 排除スコア計算（低いほど排除対象）
   * @param item - コンテキストアイテム
   * @returns 排除スコア
   * @private
   */
  private calculateEvictionScore(item: ContextItem): number {
    const ageWeight = 0.3
    const accessWeight = 0.5
    const priorityWeight = 0.2

    const age = Date.now() - item.timestamp
    const ageScore = 1 / (age + 1) // 新しいアイテムほど高スコア
    const accessScore = item.accessCount
    const priorityScore = this.getPriorityWeight(item.priority)

    return ageScore * ageWeight + accessScore * accessWeight + priorityScore * priorityWeight
  }

  /**
   * 優先度の数値重み取得
   * @param priority - 優先度レベル
   * @returns 数値重み
   * @private
   */
  private getPriorityWeight(priority: ContextPriority): number {
    const weights: Record<ContextPriority, number> = {
      critical: 100,
      high: 75,
      normal: 50,
      low: 25,
    }
    return weights[priority] || 50
  }

  // ========================================
  // 公開メソッド - メンテナンス操作
  // ========================================

  /**
   * 期限切れエントリのクリーンアップ
   * @returns 削除されたエントリ数
   */
  cleanup(): number {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach((key) => this.cache.delete(key))

    if (process.env.NODE_ENV === 'development' && expiredKeys.length > 0) {
      logger.info(`Context cleanup: Removed ${expiredKeys.length} expired entries`)
    }

    return expiredKeys.length
  }

  /**
   * 自動クリーンアップタイマー開始
   * @private
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimerId) {
      clearInterval(this.cleanupTimerId)
    }

    this.cleanupTimerId = setInterval(() => {
      this.cleanup()
    }, this.cleanupInterval)
  }

  /**
   * クリーンアップタイマー停止
   */
  stopCleanupTimer(): void {
    if (this.cleanupTimerId) {
      clearInterval(this.cleanupTimerId)
      this.cleanupTimerId = null
    }
  }

  // ========================================
  // 公開メソッド - 統計・分析
  // ========================================

  /**
   * コンテキスト統計情報取得
   * @returns 詳細統計情報
   */
  getStats(): ContextStats {
    const items = Array.from(this.cache.values())
    const totalSize = items.reduce((total, item) => total + JSON.stringify(item).length, 0)

    // 最もアクセスされているキー（上位5個）
    const topAccessedKeys = Array.from(this.cache.entries())
      .map(([key, item]) => ({ key, accessCount: item.accessCount }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 5)

    return {
      totalEntries: this.cache.size,
      totalSizeKB: Math.round(totalSize / 1024),
      cacheHitRate: this.calculateHitRate(),
      averageAccessCount: this.calculateAverageAccessCount(),
      compressionRatio: this.calculateCompressionRatio(),
      topAccessedKeys,
    }
  }

  /**
   * キャッシュヒット率計算
   * @returns ヒット率（0-1）
   * @private
   */
  private calculateHitRate(): number {
    const totalAccess = this.hitCount + this.missCount
    return totalAccess > 0 ? this.hitCount / totalAccess : 0
  }

  /**
   * 平均アクセス回数計算
   * @returns 平均アクセス回数
   * @private
   */
  private calculateAverageAccessCount(): number {
    if (this.cache.size === 0) {return 0}
    const totalAccesses = Array.from(this.cache.values()).reduce(
      (total, item) => total + item.accessCount,
      0
    )
    return Math.round(totalAccesses / this.cache.size)
  }

  /**
   * 圧縮率計算
   * @returns 圧縮率（0-1）
   * @private
   */
  private calculateCompressionRatio(): number {
    const items = Array.from(this.cache.values())
    const compressedItems = items.filter((item) => item.compressed)
    return items.length > 0 ? compressedItems.length / items.length : 0
  }

  // ========================================
  // 公開メソッド - データ移行・バックアップ
  // ========================================

  /**
   * 古いデータの永続ストレージへのアーカイブ
   * @param maxAge - アーカイブ対象の最大経過時間（デフォルト: 7日）
   * @returns アーカイブされたエントリ数
   */
  async archiveOldData(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    const now = Date.now()
    const archiveData: Record<string, ContextItem> = {}
    const keysToArchive: string[] = []

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > maxAge && item.accessCount < 2) {
        archiveData[key] = item
        keysToArchive.push(key)
      }
    }

    if (keysToArchive.length > 0) {
      try {
        // LocalStorageにアーカイブとして保存
        const existingArchive = localStorage.getItem('contextArchive')
        const currentArchive = existingArchive ? JSON.parse(existingArchive) : {}
        const mergedArchive = { ...currentArchive, ...archiveData }

        localStorage.setItem('contextArchive', JSON.stringify(mergedArchive))
        keysToArchive.forEach((key) => this.cache.delete(key))

        if (process.env.NODE_ENV === 'development') {
          logger.info(`Archived ${keysToArchive.length} context entries`)
        }

        return keysToArchive.length
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          logger.error('Context archiving failed:', error)
        }
        return 0
      }
    }

    return 0
  }

  /**
   * アーカイブからのデータ復元
   * @param key - 復元するキー
   * @returns 復元されたデータまたはnull
   */
  async restoreFromArchive<T = unknown>(key: string): Promise<T | null> {
    try {
      const archive = localStorage.getItem('contextArchive')
      if (!archive) {return null}

      const archiveData = JSON.parse(archive) as Record<string, ContextItem>
      const item = archiveData[key]

      if (item) {
        // キャッシュに復元
        item.timestamp = Date.now() // タイムスタンプ更新
        this.cache.set(key, item)

        // アーカイブから削除
        delete archiveData[key]
        localStorage.setItem('contextArchive', JSON.stringify(archiveData))

        if (process.env.NODE_ENV === 'development') {
          logger.info(`Restored context from archive: ${key}`)
        }

        return this.retrieve<T>(key)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Context restoration failed:', error)
      }
    }

    return null
  }

  /**
   * 全コンテキストデータクリア
   */
  clear(): void {
    this.cache.clear()
    localStorage.removeItem('contextArchive')
    this.hitCount = 0
    this.missCount = 0

    if (process.env.NODE_ENV === 'development') {
      logger.info('All context data cleared')
    }
  }

  /**
   * コンテキストバックアップエクスポート
   * @returns バックアップデータ
   */
  export(): ContextBackup {
    return {
      cache: Object.fromEntries(this.cache),
      archive: localStorage.getItem('contextArchive'),
      timestamp: Date.now(),
      version: '2.0.0',
    }
  }

  /**
   * バックアップからのコンテキストインポート
   * @param backupData - バックアップデータ
   * @returns インポート成功フラグ
   */
  import(backupData: ContextBackup): boolean {
    try {
      // バージョン互換性チェック
      if (backupData.version && backupData.version !== '2.0.0') {
        logger.warn(`Version mismatch: expected 2.0.0, got ${backupData.version}`)
      }

      this.cache = new Map(Object.entries(backupData.cache || {}))
      if (backupData.archive) {
        localStorage.setItem('contextArchive', backupData.archive)
      }

      if (process.env.NODE_ENV === 'development') {
        logger.info('Context data imported successfully')
      }

      return true
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Context import failed:', error)
      }
      return false
    }
  }

  /**
   * デストラクタ的メソッド（クリーンアップ）
   */
  destroy(): void {
    this.stopCleanupTimer()
    this.cache.clear()
  }
}

// ========================================
// シングルトンインスタンスとエクスポート
// ========================================

/** コンテキストマネージャーシングルトンインスタンス */
const contextManager = new ContextManager()

export default contextManager

// 個別関数エクスポート（使いやすさのため）
export const {
  store: storeContext,
  retrieve: retrieveContext,
  delete: deleteContext,
  has: hasContext,
  keys: getContextKeys,
  cleanup: cleanupContext,
  getStats: getContextStats,
  archiveOldData,
  restoreFromArchive,
  clear: clearContext,
  export: exportContext,
  import: importContext,
} = contextManager
