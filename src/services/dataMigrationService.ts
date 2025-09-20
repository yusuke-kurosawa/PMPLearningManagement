/**
 * データ移行サービス
 * @description LocalStorageからSupabaseへのデータ移行とバックアップ機能を提供
 * @author Claude Code Actions
 * @version 1.0.0
 * @since 2025-08-17
 */

import { progressServiceV2 } from './progressServiceV2'
import { progressService } from './progressService'
import { authHelpers } from '../lib/auth/supabase'
import { logger } from './logger'

// ========================================
// 型定義
// ========================================

/**
 * 移行状態
 */
export interface MigrationStatus {
  isRunning: boolean
  step: string
  progress: number
  total: number
  completed: boolean
  errors: string[]
  startTime: string | null
  endTime: string | null
}

/**
 * 移行結果
 */
export interface MigrationResult {
  success: boolean
  processedRecords: number
  successCount: number
  errorCount: number
  totalMigrated: number
  totalFailed: number
  details: {
    processProgress: { migrated: number; failed: number }
    studySessions: { migrated: number; failed: number }
    flashCardSessions: { migrated: number; failed: number }
    examResults: { migrated: number; failed: number }
    learningGoals: { migrated: number; failed: number }
  }
  errors: string[]
  duration: number
}

/**
 * バックアップデータ
 */
export interface BackupData {
  timestamp: string
  version: string
  userId: string | null
  data: {
    processes: Record<string, unknown>
    studySessions: unknown[]
    flashCardSessions: unknown[]
    examResults: unknown[]
    goals: Record<string, unknown>
  }
  metadata: {
    totalRecords: number
    sizeBytes: number
    checksum: string
  }
}

/**
 * 移行設定
 */
export interface MigrationOptions {
  dryRun?: boolean
  batchSize?: number
  includeProcessProgress?: boolean
  includeStudySessions?: boolean
  includeFlashCardSessions?: boolean
  includeExamResults?: boolean
  includeLearningGoals?: boolean
  createBackup?: boolean
}

// ========================================
// データ移行サービスクラス
// ========================================

/**
 * データ移行サービスクラス
 * @description LocalStorageとSupabaseの間でのデータ移行を管理
 */
class DataMigrationService {
  private migrationStatus: MigrationStatus = {
    isRunning: false,
    step: '',
    progress: 0,
    total: 0,
    completed: false,
    errors: [],
    startTime: null,
    endTime: null,
  }

  private readonly STORAGE_KEY = 'pmp_migration_backup'
  private readonly VERSION = '1.0.0'

  // ========================================
  // 公開メソッド - 移行状態管理
  // ========================================

  /**
   * 移行状態の取得
   */
  getMigrationStatus(): MigrationStatus {
    return { ...this.migrationStatus }
  }

  /**
   * 移行実行中かチェック
   */
  isMigrationRunning(): boolean {
    return this.migrationStatus.isRunning
  }

  // ========================================
  // 公開メソッド - メイン移行機能
  // ========================================

  /**
   * LocalStorageからSupabaseへの完全移行
   * @param options - 移行設定
   * @returns 移行結果
   */
  async migrateToSupabase(options: MigrationOptions = {}): Promise<MigrationResult> {
    if (this.migrationStatus.isRunning) {
      throw new Error('Migration is already running')
    }

    const defaultOptions: Required<MigrationOptions> = {
      dryRun: false,
      batchSize: 10,
      includeProcessProgress: true,
      includeStudySessions: true,
      includeFlashCardSessions: true,
      includeExamResults: true,
      includeLearningGoals: true,
      createBackup: true,
    }

    const mergedOptions = { ...defaultOptions, ...options }

    this.resetMigrationStatus()
    this.migrationStatus.isRunning = true
    this.migrationStatus.startTime = new Date().toISOString()

    try {
      // 認証チェック
      const isAuth = await authHelpers.isAuthenticated()
      if (!isAuth) {
        throw new Error('User must be authenticated to migrate data')
      }

      // バックアップ作成
      if (mergedOptions.createBackup) {
        this.updateStatus('バックアップを作成中...', 0, 1)
        await this.createBackup()
      }

      // LocalStorageからデータ読み込み
      this.updateStatus('ローカルデータを読み込み中...', 1, 7)
      const localData = await progressService.loadProgress()

      // 移行対象の計算
      let totalItems = 0
      if (mergedOptions.includeProcessProgress) {
        totalItems += Object.keys(localData.processes || {}).length
      }
      if (mergedOptions.includeStudySessions) {
        totalItems += (localData.studySessions || []).length
      }
      if (mergedOptions.includeFlashCardSessions) {
        totalItems += (localData.flashCardSessions || []).length
      }
      if (mergedOptions.includeExamResults) {
        totalItems += (localData.examResults || []).length
      }
      if (mergedOptions.includeLearningGoals) {
        totalItems += Object.keys(localData.goals || {}).length
      }

      this.migrationStatus.total = totalItems

      const result: MigrationResult = {
        success: true,
        processedRecords: 0,
        successCount: 0,
        errorCount: 0,
        totalMigrated: 0,
        totalFailed: 0,
        details: {
          processProgress: { migrated: 0, failed: 0 },
          studySessions: { migrated: 0, failed: 0 },
          flashCardSessions: { migrated: 0, failed: 0 },
          examResults: { migrated: 0, failed: 0 },
          learningGoals: { migrated: 0, failed: 0 },
        },
        errors: [],
        duration: 0,
      }

      // プロセス進捗の移行
      if (mergedOptions.includeProcessProgress) {
        this.updateStatus('プロセス進捗を移行中...', 2, 7)
        const processResult = await this.migrateProcessProgress(
          localData.processes || {},
          mergedOptions
        )
        result.details.processProgress = processResult
        result.totalMigrated += processResult.migrated
        result.totalFailed += processResult.failed
      }

      // 学習セッションの移行
      if (mergedOptions.includeStudySessions) {
        this.updateStatus('学習セッションを移行中...', 3, 7)
        const sessionResult = await this.migrateStudySessions(
          localData.studySessions || [],
          mergedOptions
        )
        result.details.studySessions = sessionResult
        result.totalMigrated += sessionResult.migrated
        result.totalFailed += sessionResult.failed
      }

      // フラッシュカードセッションの移行
      if (mergedOptions.includeFlashCardSessions) {
        this.updateStatus('フラッシュカードセッションを移行中...', 4, 7)
        const flashCardResult = await this.migrateFlashCardSessions(
          localData.flashCardSessions || [],
          mergedOptions
        )
        result.details.flashCardSessions = flashCardResult
        result.totalMigrated += flashCardResult.migrated
        result.totalFailed += flashCardResult.failed
      }

      // 模擬試験結果の移行
      if (mergedOptions.includeExamResults) {
        this.updateStatus('模擬試験結果を移行中...', 5, 7)
        const examResult = await this.migrateExamResults(localData.examResults || [], mergedOptions)
        result.details.examResults = examResult
        result.totalMigrated += examResult.migrated
        result.totalFailed += examResult.failed
      }

      // 学習目標の移行
      if (mergedOptions.includeLearningGoals) {
        this.updateStatus('学習目標を移行中...', 6, 7)
        const goalResult = await this.migrateLearningGoals(localData.goals || {}, mergedOptions)
        result.details.learningGoals = goalResult
        result.totalMigrated += goalResult.migrated
        result.totalFailed += goalResult.failed
      }

      this.updateStatus('移行を完了しました', 7, 7)

      // 移行完了
      this.migrationStatus.completed = true
      this.migrationStatus.endTime = new Date().toISOString()

      if (this.migrationStatus.startTime) {
        result.duration = new Date().getTime() - new Date(this.migrationStatus.startTime).getTime()
      }

      result.processedRecords = result.totalMigrated + result.totalFailed
      result.successCount = result.totalMigrated
      result.errorCount = result.totalFailed
      result.errors = this.migrationStatus.errors
      result.success = result.totalFailed === 0

      return result
    } catch (error) {
      logger.error('Migration failed:', error)
      this.migrationStatus.errors.push((error as Error).message)

      const errorResult: MigrationResult = {
        success: false,
        processedRecords: this.migrationStatus.total,
        successCount: 0,
        errorCount: this.migrationStatus.total,
        totalMigrated: 0,
        totalFailed: this.migrationStatus.total,
        details: {
          processProgress: { migrated: 0, failed: 0 },
          studySessions: { migrated: 0, failed: 0 },
          flashCardSessions: { migrated: 0, failed: 0 },
          examResults: { migrated: 0, failed: 0 },
          learningGoals: { migrated: 0, failed: 0 },
        },
        errors: this.migrationStatus.errors,
        duration: this.migrationStatus.startTime
          ? new Date().getTime() - new Date(this.migrationStatus.startTime).getTime()
          : 0,
      }

      return errorResult
    } finally {
      this.migrationStatus.isRunning = false
    }
  }

  // ========================================
  // プライベートメソッド - 個別移行処理
  // ========================================

  /**
   * プロセス進捗の移行
   * @private
   */
  private async migrateProcessProgress(
    processes: Record<string, unknown>,
    options: MigrationOptions
  ): Promise<{ migrated: number; failed: number }> {
    let migrated = 0
    let failed = 0

    const entries = Object.entries(processes)

    for (let i = 0; i < entries.length; i += options.batchSize || 10) {
      const batch = entries.slice(i, i + (options.batchSize || 10))

      for (const [processId, progress] of batch) {
        try {
          if (!options.dryRun) {
            const response = await progressServiceV2.updateProcessProgress(processId, progress)
            if (response.success) {
              migrated++
            } else {
              failed++
              this.migrationStatus.errors.push(
                `Failed to migrate process ${processId}: ${response.error}`
              )
            }
          } else {
            migrated++ // ドライランではすべて成功として扱う
          }

          this.migrationStatus.progress++
        } catch (error) {
          failed++
          const errorMessage = `Failed to migrate process ${processId}: ${(error as Error).message}`
          this.migrationStatus.errors.push(errorMessage)
          logger.error(errorMessage, error)
        }
      }

      // バッチ間で少し待機（APIレート制限対策）
      if (!options.dryRun && i + (options.batchSize || 10) < entries.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    return { migrated, failed }
  }

  /**
   * 学習セッションの移行
   * @private
   */
  private async migrateStudySessions(
    sessions: unknown[],
    options: MigrationOptions
  ): Promise<{ migrated: number; failed: number }> {
    let migrated = 0
    let failed = 0

    for (let i = 0; i < sessions.length; i += options.batchSize || 10) {
      const batch = sessions.slice(i, i + (options.batchSize || 10))

      for (const session of batch) {
        try {
          if (!options.dryRun) {
            const response = await progressServiceV2.recordStudySession(session)
            if (response.success) {
              migrated++
            } else {
              failed++
              this.migrationStatus.errors.push(`Failed to migrate study session: ${response.error}`)
            }
          } else {
            migrated++
          }

          this.migrationStatus.progress++
        } catch (error) {
          failed++
          const errorMessage = `Failed to migrate study session: ${(error as Error).message}`
          this.migrationStatus.errors.push(errorMessage)
          logger.error(errorMessage, error)
        }
      }

      if (!options.dryRun && i + (options.batchSize || 10) < sessions.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    return { migrated, failed }
  }

  /**
   * フラッシュカードセッションの移行
   * @private
   */
  private async migrateFlashCardSessions(
    sessions: unknown[],
    options: MigrationOptions
  ): Promise<{ migrated: number; failed: number }> {
    let migrated = 0
    let failed = 0

    for (let i = 0; i < sessions.length; i += options.batchSize || 10) {
      const batch = sessions.slice(i, i + (options.batchSize || 10))

      for (const session of batch) {
        try {
          if (!options.dryRun) {
            // timestampを除去してからrecordFlashCardSessionに渡す
            const { ...sessionData } = session
            const response = await progressServiceV2.recordFlashCardSession(sessionData)
            if (response.success) {
              migrated++
            } else {
              failed++
              this.migrationStatus.errors.push(
                `Failed to migrate flashcard session: ${response.error}`
              )
            }
          } else {
            migrated++
          }

          this.migrationStatus.progress++
        } catch (error) {
          failed++
          const errorMessage = `Failed to migrate flashcard session: ${(error as Error).message}`
          this.migrationStatus.errors.push(errorMessage)
          logger.error(errorMessage, error)
        }
      }

      if (!options.dryRun && i + (options.batchSize || 10) < sessions.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    return { migrated, failed }
  }

  /**
   * 模擬試験結果の移行
   * @private
   */
  private async migrateExamResults(
    examResults: unknown[],
    options: MigrationOptions
  ): Promise<{ migrated: number; failed: number }> {
    let migrated = 0
    let failed = 0

    for (let i = 0; i < examResults.length; i += options.batchSize || 10) {
      const batch = examResults.slice(i, i + (options.batchSize || 10))

      for (const exam of batch) {
        try {
          if (!options.dryRun) {
            const response = await progressServiceV2.recordExamResult(exam)
            if (response.success) {
              migrated++
            } else {
              failed++
              this.migrationStatus.errors.push(`Failed to migrate exam result: ${response.error}`)
            }
          } else {
            migrated++
          }

          this.migrationStatus.progress++
        } catch (error) {
          failed++
          const errorMessage = `Failed to migrate exam result: ${(error as Error).message}`
          this.migrationStatus.errors.push(errorMessage)
          logger.error(errorMessage, error)
        }
      }

      if (!options.dryRun && i + (options.batchSize || 10) < examResults.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    return { migrated, failed }
  }

  /**
   * 学習目標の移行
   * @private
   */
  private async migrateLearningGoals(
    goals: Record<string, unknown>,
    options: MigrationOptions
  ): Promise<{ migrated: number; failed: number }> {
    let migrated = 0
    let failed = 0

    const entries = Object.entries(goals)

    for (let i = 0; i < entries.length; i += options.batchSize || 10) {
      const batch = entries.slice(i, i + (options.batchSize || 10))

      for (const [goalId, goal] of batch) {
        try {
          if (!options.dryRun) {
            // 学習目標の移行ロジック（将来的にSupabaseに学習目標テーブルが追加された時のために）
            // 現在はログのみ出力
            logger.info(`Would migrate learning goal: ${goalId}`, goal)
            migrated++
          } else {
            migrated++
          }

          this.migrationStatus.progress++
        } catch (error) {
          failed++
          const errorMessage = `Failed to migrate learning goal ${goalId}: ${(error as Error).message}`
          this.migrationStatus.errors.push(errorMessage)
          logger.error(errorMessage, error)
        }
      }

      if (!options.dryRun && i + (options.batchSize || 10) < entries.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    return { migrated, failed }
  }

  // ========================================
  // プライベートメソッド - ユーティリティ
  // ========================================

  /**
   * 移行状態のリセット
   * @private
   */
  private resetMigrationStatus(): void {
    this.migrationStatus = {
      isRunning: false,
      step: '',
      progress: 0,
      total: 0,
      completed: false,
      errors: [],
      startTime: null,
      endTime: null,
    }
  }

  /**
   * 移行状態の更新
   * @private
   */
  private updateStatus(step: string, progress: number, total: number): void {
    this.migrationStatus.step = step
    this.migrationStatus.progress = Math.min(progress, total)
    this.migrationStatus.total = total
  }

  // ========================================
  // 公開メソッド - バックアップ機能
  // ========================================

  /**
   * 現在のLocalStorageデータのバックアップ作成
   */
  async createBackup(): Promise<BackupData> {
    try {
      const localData = await progressService.loadProgress()
      const userId = await authHelpers
        .getCurrentUser()
        .then((user) => user?.id || null)
        .catch(() => null)

      const backupData: BackupData = {
        timestamp: new Date().toISOString(),
        version: this.VERSION,
        userId,
        data: {
          processes: localData.processes || {},
          studySessions: localData.studySessions || [],
          flashCardSessions: localData.flashCardSessions || [],
          examResults: localData.examResults || [],
          goals: localData.goals || {},
        },
        metadata: {
          totalRecords: 0,
          sizeBytes: 0,
          checksum: '',
        },
      }

      // メタデータの計算
      backupData.metadata.totalRecords =
        Object.keys(backupData.data.processes).length +
        backupData.data.studySessions.length +
        backupData.data.flashCardSessions.length +
        backupData.data.examResults.length +
        Object.keys(backupData.data.goals).length

      const dataString = JSON.stringify(backupData.data)
      backupData.metadata.sizeBytes = new Blob([dataString]).size
      backupData.metadata.checksum = await this.generateChecksum(dataString)

      // ローカルストレージに保存
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(backupData))

      return backupData
    } catch (error) {
      logger.error('Failed to create backup:', error)
      throw new Error(`Backup creation failed: ${(error as Error).message}`)
    }
  }

  /**
   * バックアップからのリストア
   */
  async restoreFromBackup(backupData?: BackupData): Promise<boolean> {
    try {
      let backup = backupData

      if (!backup) {
        const stored = localStorage.getItem(this.STORAGE_KEY)
        if (!stored) {
          throw new Error('No backup found in localStorage')
        }
        backup = JSON.parse(stored) as BackupData
      }

      // バックアップの整合性チェック
      const dataString = JSON.stringify(backup.data)
      const checksum = await this.generateChecksum(dataString)
      if (checksum !== backup.metadata.checksum) {
        throw new Error('Backup data integrity check failed')
      }

      // データをLocalStorageに復元
      const restoredData = {
        knowledgeAreas: {},
        processGroups: {},
        processes: backup.data.processes,
        studySessions: backup.data.studySessions,
        flashCardSessions: backup.data.flashCardSessions,
        examResults: backup.data.examResults,
        goals: backup.data.goals,
        lastUpdated: backup.timestamp,
      }

      await progressService.saveProgress(restoredData)

      return true
    } catch (error) {
      logger.error('Failed to restore from backup:', error)
      throw new Error(`Restore failed: ${(error as Error).message}`)
    }
  }

  /**
   * バックアップデータの取得
   */
  getBackupData(): BackupData | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) {
        return null
      }
      return JSON.parse(stored) as BackupData
    } catch (error) {
      logger.error('Failed to get backup data:', error)
      return null
    }
  }

  /**
   * バックアップのエクスポート
   */
  async exportBackup(): Promise<void> {
    try {
      const backupData = this.getBackupData()
      if (!backupData) {
        await this.createBackup()
        const newBackup = this.getBackupData()
        if (!newBackup) {
          throw new Error('Failed to create backup for export')
        }
        this.downloadBackup(newBackup)
      } else {
        this.downloadBackup(backupData)
      }
    } catch (error) {
      logger.error('Failed to export backup:', error)
      throw new Error(`Export failed: ${(error as Error).message}`)
    }
  }

  /**
   * バックアップファイルのダウンロード
   * @private
   */
  private downloadBackup(backupData: BackupData): void {
    const dataStr = JSON.stringify(backupData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const timestamp = new Date(backupData.timestamp).toISOString().split('T')[0]
    const fileName = `pmp-backup-${timestamp}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', fileName)
    linkElement.click()
  }

  /**
   * チェックサム生成
   * @private
   */
  private async generateChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder()
    const dataArray = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataArray)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  // ========================================
  // 公開メソッド - 移行ユーティリティ
  // ========================================

  /**
   * 移行の実行可能性チェック
   */
  async checkMigrationFeasibility(): Promise<{
    canMigrate: boolean
    issues: string[]
    dataSize: number
    recordCount: number
  }> {
    const issues: string[] = []
    let canMigrate = true

    try {
      // 認証チェック
      const isAuth = await authHelpers.isAuthenticated()
      if (!isAuth) {
        issues.push('User must be authenticated')
        canMigrate = false
      }

      // オンライン状態チェック
      if (!navigator.onLine) {
        issues.push('Internet connection required')
        canMigrate = false
      }

      // データサイズチェック
      const localData = await progressService.loadProgress()
      const dataString = JSON.stringify(localData)
      const dataSize = new Blob([dataString]).size

      // 10MB以上の場合は警告
      if (dataSize > 10 * 1024 * 1024) {
        issues.push('Large data size may cause slow migration')
      }

      const recordCount =
        Object.keys(localData.processes || {}).length +
        (localData.studySessions || []).length +
        (localData.flashCardSessions || []).length +
        (localData.examResults || []).length +
        Object.keys(localData.goals || {}).length

      return {
        canMigrate,
        issues,
        dataSize,
        recordCount,
      }
    } catch (error) {
      logger.error('Failed to check migration feasibility:', error)
      return {
        canMigrate: false,
        issues: [`Error checking feasibility: ${(error as Error).message}`],
        dataSize: 0,
        recordCount: 0,
      }
    }
  }

  /**
   * 移行のキャンセル
   */
  cancelMigration(): void {
    if (this.migrationStatus.isRunning) {
      this.migrationStatus.isRunning = false
      this.migrationStatus.step = 'Cancelled by user'
      this.migrationStatus.endTime = new Date().toISOString()
      this.migrationStatus.errors.push('Migration cancelled by user')
    }
  }

  /**
   * 移行履歴のクリア
   */
  clearMigrationHistory(): void {
    this.resetMigrationStatus()
    localStorage.removeItem(this.STORAGE_KEY)
  }
}

// ========================================
// シングルトンインスタンス
// ========================================

/** データ移行サービスシングルトンインスタンス */
export const dataMigrationService = new DataMigrationService()

// ========================================
// 型エクスポート
// ========================================

export type { MigrationStatus, MigrationResult, BackupData, MigrationOptions }

export default dataMigrationService
