/**
 * Enterprise Cache Memory Manager
 * 10,000+ 同時ユーザー対応のメモリ管理とウォーミング戦略
 */

import { EventEmitter } from 'events'
import { performance } from 'perf_hooks'
import { HierarchicalCacheManager } from './hierarchy'

interface MemoryStats {
  heapUsed: number
  heapTotal: number
  external: number
  rss: number
  arrayBuffers: number
}

interface CacheWarmupPattern {
  pattern: string
  priority: number
  frequency: number // minutes
  batchSize: number
  dataFetcher: (key: string) => Promise<any>
}

interface MemoryPressureAlert {
  level: 'warning' | 'critical' | 'emergency'
  memoryUsage: number
  threshold: number
  recommendation: string[]
}

/**
 * 高度なメモリ管理システム
 */
export class AdvancedMemoryManager extends EventEmitter {
  private readonly WARNING_THRESHOLD = 0.75
  private readonly CRITICAL_THRESHOLD = 0.85
  private readonly EMERGENCY_THRESHOLD = 0.95
  private monitoringInterval: NodeJS.Timer | null = null
  private memoryHistory: MemoryStats[] = []
  private readonly HISTORY_SIZE = 100

  constructor(
    private cacheManager: HierarchicalCacheManager,
    private maxMemoryMB: number = 512
  ) {
    super()
    this.startMemoryMonitoring()
  }

  /**
   * メモリ監視の開始
   */
  private startMemoryMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.checkMemoryPressure()
    }, 30000) // 30秒ごと
  }

  /**
   * メモリ圧迫チェック
   */
  private checkMemoryPressure(): void {
    const memStats = process.memoryUsage()
    const heapUsedMB = memStats.heapUsed / 1024 / 1024
    const utilizationRate = heapUsedMB / this.maxMemoryMB

    // メモリ履歴を保存
    this.memoryHistory.push(memStats)
    if (this.memoryHistory.length > this.HISTORY_SIZE) {
      this.memoryHistory.shift()
    }

    // アラートレベルの判定
    if (utilizationRate >= this.EMERGENCY_THRESHOLD) {
      this.handleEmergencyMemoryPressure(utilizationRate)
    } else if (utilizationRate >= this.CRITICAL_THRESHOLD) {
      this.handleCriticalMemoryPressure(utilizationRate)
    } else if (utilizationRate >= this.WARNING_THRESHOLD) {
      this.handleWarningMemoryPressure(utilizationRate)
    }
  }

  /**
   * 警告レベルのメモリ圧迫処理
   */
  private handleWarningMemoryPressure(utilizationRate: number): void {
    const alert: MemoryPressureAlert = {
      level: 'warning',
      memoryUsage: utilizationRate,
      threshold: this.WARNING_THRESHOLD,
      recommendation: [
        'キャッシュのTTL設定を見直してください',
        '不要なデータの定期クリーンアップを検討してください'
      ]
    }

    this.emit('memory_pressure', alert)
    console.warn(`⚠️ Memory warning: ${(utilizationRate * 100).toFixed(1)}% utilization`)
  }

  /**
   * 重大レベルのメモリ圧迫処理
   */
  private handleCriticalMemoryPressure(utilizationRate: number): void {
    const alert: MemoryPressureAlert = {
      level: 'critical',
      memoryUsage: utilizationRate,
      threshold: this.CRITICAL_THRESHOLD,
      recommendation: [
        '低優先度キャッシュエントリの削除を実行します',
        'バッチサイズの削減を検討してください',
        'キャッシュ階層設定の最適化が必要です'
      ]
    }

    this.emit('memory_pressure', alert)
    console.error(`🚨 Critical memory pressure: ${(utilizationRate * 100).toFixed(1)}% utilization`)

    // 自動クリーンアップの実行
    this.performSmartCleanup()
  }

  /**
   * 緊急レベルのメモリ圧迫処理
   */
  private handleEmergencyMemoryPressure(utilizationRate: number): void {
    const alert: MemoryPressureAlert = {
      level: 'emergency',
      memoryUsage: utilizationRate,
      threshold: this.EMERGENCY_THRESHOLD,
      recommendation: [
        '緊急メモリクリーンアップを実行しています',
        '新規キャッシュエントリの作成を一時停止します',
        'システム負荷の軽減が必要です'
      ]
    }

    this.emit('memory_pressure', alert)
    console.error(`🆘 EMERGENCY memory pressure: ${(utilizationRate * 100).toFixed(1)}% utilization`)

    // 緊急クリーンアップ
    this.performEmergencyCleanup()
  }

  /**
   * スマートクリーンアップ（LRU + アクセス頻度ベース）
   */
  private performSmartCleanup(): number {
    const l1Cache = this.cacheManager['L1Cache']
    const initialSize = l1Cache.size

    // アクセス頻度とサイズを考慮したスコア計算
    const entries = Array.from(l1Cache.entries()).map(([key, entry]) => ({
      key,
      entry,
      score: this.calculateCleanupScore(entry)
    }))

    // スコアが低い（削除候補）順にソート
    entries.sort((a, b) => a.score - b.score)

    // 30%のエントリを削除
    const toDelete = Math.ceil(entries.length * 0.3)
    for (let i = 0; i < toDelete && i < entries.length; i++) {
      l1Cache.delete(entries[i].key)
    }

    const deletedCount = initialSize - l1Cache.size
    console.log(`🧹 Smart cleanup completed: removed ${deletedCount} entries`)
    this.emit('cleanup_completed', { type: 'smart', deletedCount })

    return deletedCount
  }

  /**
   * 緊急クリーンアップ（大幅な削減）
   */
  private performEmergencyCleanup(): number {
    const l1Cache = this.cacheManager['L1Cache']
    const initialSize = l1Cache.size

    // 50%のエントリを削除（最も古いものから）
    const entries = Array.from(l1Cache.entries())
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)

    const toDelete = Math.ceil(entries.length * 0.5)
    for (let i = 0; i < toDelete; i++) {
      l1Cache.delete(entries[i][0])
    }

    const deletedCount = initialSize - l1Cache.size
    console.error(`🆘 Emergency cleanup: removed ${deletedCount} entries`)
    this.emit('cleanup_completed', { type: 'emergency', deletedCount })

    // ガベージコレクションを強制実行
    if (global.gc) {
      global.gc()
      console.log('🗑️ Garbage collection triggered')
    }

    return deletedCount
  }

  /**
   * クリーンアップスコア計算（低いほど削除候補）
   */
  private calculateCleanupScore(entry: any): number {
    const now = Date.now()
    const ageMinutes = (now - entry.lastAccessed) / (1000 * 60)
    const accessFrequency = entry.accessCount / Math.max(ageMinutes, 1)
    const sizeWeight = entry.size / 1024 // KB単位

    // スコア = アクセス頻度 - (年齢ペナルティ + サイズペナルティ)
    return accessFrequency - (ageMinutes * 0.1) - (sizeWeight * 0.01)
  }

  /**
   * メモリ使用量統計の取得
   */
  getMemoryStats(): {
    current: MemoryStats
    utilizationRate: number
    trend: 'increasing' | 'decreasing' | 'stable'
    recommendations: string[]
  } {
    const current = process.memoryUsage()
    const utilizationRate = (current.heapUsed / 1024 / 1024) / this.maxMemoryMB
    const trend = this.calculateMemoryTrend()
    const recommendations = this.generateMemoryRecommendations(utilizationRate, trend)

    return {
      current,
      utilizationRate,
      trend,
      recommendations
    }
  }

  /**
   * メモリ使用量トレンドの計算
   */
  private calculateMemoryTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.memoryHistory.length < 10) return 'stable'

    const recent = this.memoryHistory.slice(-10)
    const oldAvg = recent.slice(0, 5).reduce((sum, stat) => sum + stat.heapUsed, 0) / 5
    const newAvg = recent.slice(-5).reduce((sum, stat) => sum + stat.heapUsed, 0) / 5

    const changeRate = (newAvg - oldAvg) / oldAvg

    if (changeRate > 0.05) return 'increasing'
    if (changeRate < -0.05) return 'decreasing'
    return 'stable'
  }

  /**
   * メモリ最適化の推奨事項生成
   */
  private generateMemoryRecommendations(
    utilizationRate: number,
    trend: string
  ): string[] {
    const recommendations: string[] = []

    if (utilizationRate > 0.8) {
      recommendations.push('メモリ使用量が高いです。キャッシュサイズの削減を検討してください')
    }

    if (trend === 'increasing') {
      recommendations.push('メモリ使用量が継続的に増加しています。メモリリークの可能性があります')
    }

    if (this.cacheManager['L1Cache'].size > 8000) {
      recommendations.push('L1キャッシュエントリ数が多すぎます。TTL設定を短縮してください')
    }

    if (recommendations.length === 0) {
      recommendations.push('メモリ使用量は適正範囲内です')
    }

    return recommendations
  }

  /**
   * メモリ監視の停止
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
  }

  /**
   * クリーンアップ
   */
  destroy(): void {
    this.stopMonitoring()
    this.removeAllListeners()
  }
}

/**
 * インテリジェントキャッシュウォーマー
 */
export class IntelligentCacheWarmer extends EventEmitter {
  private warmupSchedules: Map<string, NodeJS.Timer> = new Map()
  private performanceMetrics: Map<string, { hits: number; misses: number }> = new Map()

  constructor(private cacheManager: HierarchicalCacheManager) {
    super()
  }

  /**
   * ウォームアップパターンの登録
   */
  registerWarmupPattern(pattern: CacheWarmupPattern): void {
    // 既存のスケジュールをクリア
    if (this.warmupSchedules.has(pattern.pattern)) {
      clearInterval(this.warmupSchedules.get(pattern.pattern)!)
    }

    // 新しいスケジュールを設定
    const interval = setInterval(async () => {
      await this.executeWarmup(pattern)
    }, pattern.frequency * 60 * 1000) // 分をミリ秒に変換

    this.warmupSchedules.set(pattern.pattern, interval)
    console.log(`📋 Warmup pattern registered: ${pattern.pattern} (every ${pattern.frequency} minutes)`)
  }

  /**
   * ウォームアップの実行
   */
  private async executeWarmup(pattern: CacheWarmupPattern): Promise<void> {
    const startTime = performance.now()
    
    try {
      console.log(`🔥 Starting warmup for pattern: ${pattern.pattern}`)
      
      // パターンに基づいてキーを生成
      const keys = await this.generateKeysFromPattern(pattern.pattern)
      
      // 優先度順にソート
      keys.sort((a, b) => this.calculateKeyPriority(b) - this.calculateKeyPriority(a))
      
      // バッチ処理でウォームアップ
      const batches = this.chunkArray(keys, pattern.batchSize)
      let warmedCount = 0
      
      for (const batch of batches) {
        const batchPromises = batch.map(async (key) => {
          try {
            // キャッシュに既に存在するかチェック
            const cached = await this.cacheManager.get(key)
            if (cached === null) {
              // データを取得してキャッシュに保存
              const data = await pattern.dataFetcher(key)
              if (data) {
                await this.cacheManager.set(key, data)
                warmedCount++
              }
            }
          } catch (error) {
            console.warn(`Warmup failed for key ${key}:`, error)
          }
        })
        
        await Promise.allSettled(batchPromises)
        
        // バッチ間の小休止（システム負荷軽減）
        await this.sleep(100)
      }
      
      const duration = performance.now() - startTime
      console.log(`✅ Warmup completed for ${pattern.pattern}: ${warmedCount} items in ${duration.toFixed(2)}ms`)
      
      this.emit('warmup_completed', {
        pattern: pattern.pattern,
        warmedCount,
        duration
      })
      
    } catch (error) {
      console.error(`❌ Warmup failed for ${pattern.pattern}:`, error)
      this.emit('warmup_failed', { pattern: pattern.pattern, error })
    }
  }

  /**
   * パターンからキーを生成
   */
  private async generateKeysFromPattern(pattern: string): Promise<string[]> {
    // 実際の実装では、パターンに基づいてデータベースやAPIから
    // 関連するキーを取得する
    
    // 例: user_progress_* -> 全ユーザーの進捗キー
    if (pattern.includes('user_progress')) {
      return this.generateUserProgressKeys()
    }
    
    // 例: exam_questions_* -> 試験問題キー
    if (pattern.includes('exam_questions')) {
      return this.generateExamQuestionKeys()
    }
    
    // 例: leaderboard_* -> リーダーボードキー
    if (pattern.includes('leaderboard')) {
      return this.generateLeaderboardKeys()
    }
    
    return []
  }

  /**
   * ユーザー進捗キーの生成
   */
  private generateUserProgressKeys(): string[] {
    // 簡略化した実装
    // 実際には活発なユーザーのリストを取得
    const keys: string[] = []
    const knowledgeAreas = [
      'integration', 'scope', 'schedule', 'cost', 'quality',
      'resource', 'communication', 'risk', 'procurement', 'stakeholder'
    ]
    
    // 最近アクティブなユーザーの進捗データ（仮想）
    for (let userId = 1; userId <= 100; userId++) {
      for (const area of knowledgeAreas) {
        keys.push(`user_progress_${userId}_${area}`)
      }
    }
    
    return keys
  }

  /**
   * 試験問題キーの生成
   */
  private generateExamQuestionKeys(): string[] {
    const keys: string[] = []
    const difficulties = ['beginner', 'intermediate', 'advanced']
    const areas = ['integration', 'scope', 'schedule', 'cost', 'quality']
    
    for (const difficulty of difficulties) {
      for (const area of areas) {
        keys.push(`exam_questions_${difficulty}_${area}`)
      }
    }
    
    return keys
  }

  /**
   * リーダーボードキーの生成
   */
  private generateLeaderboardKeys(): string[] {
    return [
      'leaderboard_study_time_weekly',
      'leaderboard_study_time_monthly',
      'leaderboard_exam_scores_weekly',
      'leaderboard_exam_scores_monthly',
      'leaderboard_achievements_weekly',
      'leaderboard_achievements_monthly'
    ]
  }

  /**
   * キーの優先度計算
   */
  private calculateKeyPriority(key: string): number {
    // アクセス頻度に基づく優先度
    const metrics = this.performanceMetrics.get(key)
    if (!metrics) return 0
    
    const totalAccess = metrics.hits + metrics.misses
    const hitRate = totalAccess > 0 ? metrics.hits / totalAccess : 0
    
    return totalAccess * hitRate
  }

  /**
   * 配列をバッチに分割
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }

  /**
   * スリープユーティリティ
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 予測的ウォームアップ
   * ユーザー行動パターンを分析して次にアクセスされそうなデータを予測
   */
  async predictiveWarmup(userId: string, currentContext: string): Promise<void> {
    const predictions = this.predictNextAccess(userId, currentContext)
    
    for (const prediction of predictions) {
      try {
        const cached = await this.cacheManager.get(prediction.key)
        if (cached === null && prediction.probability > 0.7) {
          // 高確率で次にアクセスされる予測のみウォームアップ
          console.log(`🔮 Predictive warmup: ${prediction.key} (${(prediction.probability * 100).toFixed(1)}%)`)
          // 実装は省略（実際には機械学習モデルやルールベースの予測）
        }
      } catch (error) {
        console.warn(`Predictive warmup failed for ${prediction.key}:`, error)
      }
    }
  }

  /**
   * 次のアクセスを予測
   */
  private predictNextAccess(userId: string, currentContext: string): Array<{
    key: string
    probability: number
  }> {
    // 簡略化した予測ロジック
    // 実際にはより複雑な機械学習アルゴリズムを使用
    
    const predictions: Array<{ key: string; probability: number }> = []
    
    if (currentContext.includes('exam')) {
      // 試験中の場合、関連する学習進捗を予測
      predictions.push(
        { key: `user_progress_${userId}_integration`, probability: 0.8 },
        { key: `user_progress_${userId}_scope`, probability: 0.7 },
        { key: `exam_results_${userId}_recent`, probability: 0.9 }
      )
    }
    
    if (currentContext.includes('study')) {
      // 学習中の場合、次の学習エリアを予測
      predictions.push(
        { key: `process_details_next_topic`, probability: 0.6 },
        { key: `flashcards_${userId}_due`, probability: 0.8 }
      )
    }
    
    return predictions
  }

  /**
   * ウォームアップスケジュールの停止
   */
  stopWarmupPattern(pattern: string): void {
    const timer = this.warmupSchedules.get(pattern)
    if (timer) {
      clearInterval(timer)
      this.warmupSchedules.delete(pattern)
      console.log(`⏹️ Warmup pattern stopped: ${pattern}`)
    }
  }

  /**
   * すべてのウォームアップを停止
   */
  stopAllWarmup(): void {
    for (const [pattern, timer] of this.warmupSchedules) {
      clearInterval(timer)
      console.log(`⏹️ Warmup pattern stopped: ${pattern}`)
    }
    this.warmupSchedules.clear()
  }

  /**
   * クリーンアップ
   */
  destroy(): void {
    this.stopAllWarmup()
    this.removeAllListeners()
  }
}

// デフォルトエクスポート
export default {
  AdvancedMemoryManager,
  IntelligentCacheWarmer,
}"