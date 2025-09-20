/**
 * 学習進捗管理用カスタムフック V2 - Supabase統合版
 * @description Supabase統合による学習進捗管理とオフライン対応
 * @author Claude Code Actions
 * @version 2.0.0
 * @since 2025-08-17
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { progressServiceV2, SyncStatus } from '../services/progressServiceV2'
import { dataMigrationService, MigrationStatus } from '../services/dataMigrationService'
import { authHelpers } from '../lib/auth/supabase'
import { logger } from '../services/logger'

// 既存の型をインポート
import {
  ProcessProgress,
  FlashCardSession,
  ExamResult,
  StudySession,
  ProgressStatistics,
  FlashCardStats,
  ExamStats,
  ProcessCategory,
  ProcessGroup,
  processCategories,
  processGroups,
} from '../services/progressService'

// ========================================
// 新しい型定義
// ========================================

/**
 * フック戻り値の型
 */
export interface UseProgressV2Return {
  // データ
  statistics: ProgressStatistics | null
  isLoading: boolean
  error: string | null

  // 認証状態
  isAuthenticated: boolean

  // 同期状態
  syncStatus: SyncStatus
  migrationStatus: MigrationStatus

  // プロセス進捗操作
  getProcessProgress: (processId: string) => Promise<ProcessProgress | null>
  updateProcessProgress: (processId: string, progress: Partial<ProcessProgress>) => Promise<boolean>

  // セッション記録
  recordStudySession: (session: StudySession) => Promise<boolean>
  recordFlashCardSession: (session: Omit<FlashCardSession, 'timestamp'>) => Promise<boolean>
  recordExamResult: (exam: ExamResult) => Promise<boolean>

  // 統計取得
  getFlashCardStats: () => Promise<FlashCardStats | null>
  getExamStats: () => Promise<ExamStats | null>

  // 同期操作
  syncData: () => Promise<boolean>
  forcSync: () => Promise<boolean>

  // 移行操作
  migrateToSupabase: () => Promise<boolean>
  checkMigrationFeasibility: () => Promise<{
    canMigrate: boolean
    issues: string[]
    dataSize: number
    recordCount: number
  }>

  // ユーティリティ
  refreshData: () => Promise<void>
  resetProgress: () => Promise<boolean>
}

/**
 * フック設定オプション
 */
export interface UseProgressV2Options {
  autoSync?: boolean
  syncInterval?: number
  loadOnMount?: boolean
  enableMigration?: boolean
}

// ========================================
// メインフック
// ========================================

/**
 * 学習進捗管理用カスタムフック V2
 * @param options - フック設定オプション
 * @returns 進捗データと操作関数
 */
export const useProgressV2 = (options: UseProgressV2Options = {}): UseProgressV2Return => {
  // デフォルトオプション
  const {
    autoSync = true,
    syncInterval = 300000, // 5分
    loadOnMount = true,
    enableMigration = true,
  } = options

  // ========================================
  // 状態管理
  // ========================================

  const [statistics, setStatistics] = useState<ProgressStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(loadOnMount)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSyncTime: null,
    pendingChanges: 0,
    isOnline: navigator.onLine,
    isSyncing: false,
  })
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({
    isRunning: false,
    step: '',
    progress: 0,
    total: 0,
    completed: false,
    errors: [],
    startTime: null,
    endTime: null,
  })

  // ========================================
  // メモ化された計算
  // ========================================

  /**
   * 統計情報の計算
   */
  const calculateStatistics = useCallback(async (): Promise<ProgressStatistics | null> => {
    try {
      const response = await progressServiceV2.getAllProcessProgress()
      if (!response.success || !response.data) {
        return null
      }

      const processes = progressServiceV2.getAllProcesses()
      const processProgress = response.data

      const completedCount = processProgress.filter((p) => p.completed).length

      // カテゴリー別統計
      const categoryStats: Record<ProcessCategory, { total: number; completed: number }> =
        {} as Record<ProcessCategory, { total: number; completed: number }>

      Object.keys(processCategories).forEach((cat) => {
        const category = cat as ProcessCategory
        const catProcesses = processes.filter((p) => p.knowledgeArea === category)
        const completed = processProgress.filter(
          (p) => p.knowledge_area === category && p.completed
        ).length
        categoryStats[category] = { total: catProcesses.length, completed }
      })

      // プロセス群別統計
      const groupStats: Record<ProcessGroup, { total: number; completed: number }> = {} as Record<
        ProcessGroup,
        { total: number; completed: number }
      >

      Object.keys(processGroups).forEach((group) => {
        const processGroup = group as ProcessGroup
        const groupProcesses = processes.filter((p) => p.processGroup === processGroup)
        const completed = processProgress.filter(
          (p) => p.process_group === processGroup && p.completed
        ).length
        groupStats[processGroup] = { total: groupProcesses.length, completed }
      })

      // 総学習時間の計算（学習セッションから取得する必要があるが、ここでは簡略化）
      const totalStudyTime = processProgress.reduce((sum, p) => sum + p.time_spent_minutes, 0)

      return {
        overall: {
          completed: completedCount,
          total: processes.length,
          percentage: Math.round((completedCount / processes.length) * 100),
        },
        byCategory: categoryStats,
        byGroup: groupStats,
        studyTime: totalStudyTime,
        lastUpdated:
          processProgress.length > 0
            ? processProgress.reduce(
                (latest, p) => (p.updated_at > latest ? p.updated_at : latest),
                processProgress[0].updated_at
              )
            : null,
      }
    } catch (error) {
      logger.error('Failed to calculate statistics:', error)
      return null
    }
  }, [])

  // ========================================
  // エフェクト
  // ========================================

  /**
   * 初期化エフェクト
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true)

        // 認証状態の確認
        const authStatus = await authHelpers.isAuthenticated()
        setIsAuthenticated(authStatus)

        // 同期状態の取得
        const currentSyncStatus = progressServiceV2.getSyncStatus()
        setSyncStatus(currentSyncStatus)

        // 移行状態の取得
        if (enableMigration) {
          const currentMigrationStatus = dataMigrationService.getMigrationStatus()
          setMigrationStatus(currentMigrationStatus)
        }

        // 統計情報の読み込み
        if (loadOnMount) {
          const stats = await calculateStatistics()
          setStatistics(stats)
        }
      } catch (error) {
        logger.error('Failed to initialize useProgressV2:', error)
        setError((error as Error).message)
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [calculateStatistics, loadOnMount, enableMigration])

  /**
   * 自動同期エフェクト
   */
  useEffect(() => {
    if (!autoSync || !isAuthenticated) {
      return
    }

    const syncInterval_id = setInterval(async () => {
      try {
        const response = await progressServiceV2.syncOfflineChanges()
        if (response.success) {
          const newSyncStatus = progressServiceV2.getSyncStatus()
          setSyncStatus(newSyncStatus)
        }
      } catch (error) {
        logger.warn('Auto sync failed:', error)
      }
    }, syncInterval)

    return () => clearInterval(syncInterval_id)
  }, [autoSync, syncInterval, isAuthenticated])

  /**
   * ネットワーク状態監視エフェクト
   */
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus((prev) => ({ ...prev, isOnline: true }))
      if (autoSync && isAuthenticated) {
        // オンラインになったら自動同期を実行
        progressServiceV2.syncOfflineChanges()
      }
    }

    const handleOffline = () => {
      setSyncStatus((prev) => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [autoSync, isAuthenticated])

  // ========================================
  // プロセス進捗操作
  // ========================================

  const getProcessProgress = useCallback(
    async (processId: string): Promise<ProcessProgress | null> => {
      try {
        const response = await progressServiceV2.getProcessProgress(processId)
        if (response.success && response.data) {
          return response.data
        }
        return null
      } catch (error) {
        logger.error('Failed to get process progress:', error)
        return null
      }
    },
    []
  )

  const updateProcessProgress = useCallback(
    async (processId: string, progress: Partial<ProcessProgress>): Promise<boolean> => {
      try {
        const response = await progressServiceV2.updateProcessProgress(processId, progress)

        if (response.success) {
          // 統計情報を再計算
          const newStats = await calculateStatistics()
          setStatistics(newStats)

          // 同期状態を更新
          const newSyncStatus = progressServiceV2.getSyncStatus()
          setSyncStatus(newSyncStatus)

          return true
        }

        setError(response.error)
        return false
      } catch (error) {
        logger.error('Failed to update process progress:', error)
        setError((error as Error).message)
        return false
      }
    },
    [calculateStatistics]
  )

  // ========================================
  // セッション記録
  // ========================================

  const recordStudySession = useCallback(
    async (session: StudySession): Promise<boolean> => {
      try {
        const response = await progressServiceV2.recordStudySession(session)

        if (response.success) {
          // 統計情報を再計算
          const newStats = await calculateStatistics()
          setStatistics(newStats)

          return true
        }

        setError(response.error)
        return false
      } catch (error) {
        logger.error('Failed to record study session:', error)
        setError((error as Error).message)
        return false
      }
    },
    [calculateStatistics]
  )

  const recordFlashCardSession = useCallback(
    async (session: Omit<FlashCardSession, 'timestamp'>): Promise<boolean> => {
      try {
        const response = await progressServiceV2.recordFlashCardSession(session)

        if (response.success) {
          return true
        }

        setError(response.error)
        return false
      } catch (error) {
        logger.error('Failed to record flashcard session:', error)
        setError((error as Error).message)
        return false
      }
    },
    []
  )

  const recordExamResult = useCallback(
    async (exam: ExamResult): Promise<boolean> => {
      try {
        const response = await progressServiceV2.recordExamResult(exam)

        if (response.success) {
          // 統計情報を再計算
          const newStats = await calculateStatistics()
          setStatistics(newStats)

          return true
        }

        setError(response.error)
        return false
      } catch (error) {
        logger.error('Failed to record exam result:', error)
        setError((error as Error).message)
        return false
      }
    },
    [calculateStatistics]
  )

  // ========================================
  // 統計取得
  // ========================================

  const getFlashCardStats = useCallback(async (): Promise<FlashCardStats | null> => {
    try {
      const response = await progressServiceV2.getFlashCardStats()
      if (response.success && response.data) {
        return response.data
      }
      return null
    } catch (error) {
      logger.error('Failed to get flashcard stats:', error)
      return null
    }
  }, [])

  const getExamStats = useCallback(async (): Promise<ExamStats | null> => {
    try {
      const response = await progressServiceV2.getExamStats()
      if (response.success && response.data) {
        return response.data
      }
      return null
    } catch (error) {
      logger.error('Failed to get exam stats:', error)
      return null
    }
  }, [])

  // ========================================
  // 同期操作
  // ========================================

  const syncData = useCallback(async (): Promise<boolean> => {
    try {
      setSyncStatus((prev) => ({ ...prev, isSyncing: true }))

      const response = await progressServiceV2.syncOfflineChanges()

      if (response.success) {
        const newSyncStatus = progressServiceV2.getSyncStatus()
        setSyncStatus(newSyncStatus)

        // 同期後に統計情報を更新
        const newStats = await calculateStatistics()
        setStatistics(newStats)

        return true
      }

      setError(response.error)
      return false
    } catch (error) {
      logger.error('Failed to sync data:', error)
      setError((error as Error).message)
      return false
    } finally {
      setSyncStatus((prev) => ({ ...prev, isSyncing: false }))
    }
  }, [calculateStatistics])

  const forcSync = useCallback(async (): Promise<boolean> => {
    try {
      const response = await progressServiceV2.forcSync()

      if (response.success) {
        const newSyncStatus = progressServiceV2.getSyncStatus()
        setSyncStatus(newSyncStatus)

        // 同期後に統計情報を更新
        const newStats = await calculateStatistics()
        setStatistics(newStats)

        return true
      }

      setError(response.error)
      return false
    } catch (error) {
      logger.error('Failed to force sync:', error)
      setError((error as Error).message)
      return false
    }
  }, [calculateStatistics])

  // ========================================
  // 移行操作
  // ========================================

  const migrateToSupabase = useCallback(async (): Promise<boolean> => {
    if (!enableMigration) {
      logger.warn('Migration is disabled')
      return false
    }

    try {
      setMigrationStatus((prev) => ({ ...prev, isRunning: true }))

      const result = await dataMigrationService.migrateToSupabase({
        createBackup: true,
        batchSize: 5, // 小さなバッチサイズで安全に実行
      })

      setMigrationStatus(dataMigrationService.getMigrationStatus())

      if (result.success) {
        // 移行後に統計情報を更新
        const newStats = await calculateStatistics()
        setStatistics(newStats)

        return true
      }

      setError(`Migration failed: ${result.errors.join(', ')}`)
      return false
    } catch (error) {
      logger.error('Failed to migrate to Supabase:', error)
      setError((error as Error).message)
      return false
    }
  }, [enableMigration, calculateStatistics])

  const checkMigrationFeasibility = useCallback(async () => {
    if (!enableMigration) {
      return {
        canMigrate: false,
        issues: ['Migration is disabled'],
        dataSize: 0,
        recordCount: 0,
      }
    }

    try {
      return await dataMigrationService.checkMigrationFeasibility()
    } catch (error) {
      logger.error('Failed to check migration feasibility:', error)
      return {
        canMigrate: false,
        issues: [`Error: ${(error as Error).message}`],
        dataSize: 0,
        recordCount: 0,
      }
    }
  }, [enableMigration])

  // ========================================
  // ユーティリティ
  // ========================================

  const refreshData = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      const newStats = await calculateStatistics()
      setStatistics(newStats)

      const newSyncStatus = progressServiceV2.getSyncStatus()
      setSyncStatus(newSyncStatus)

      if (enableMigration) {
        const newMigrationStatus = dataMigrationService.getMigrationStatus()
        setMigrationStatus(newMigrationStatus)
      }
    } catch (error) {
      logger.error('Failed to refresh data:', error)
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [calculateStatistics, enableMigration])

  const resetProgress = useCallback(async (): Promise<boolean> => {
    try {
      // LocalStorageの進捗をリセット
      const defaultProgress = progressServiceV2.getDefaultProgress()
      const success = await progressServiceV2.saveProgress(defaultProgress)

      if (success) {
        // 統計情報をリセット
        const newStats = await calculateStatistics()
        setStatistics(newStats)

        return true
      }

      return false
    } catch (error) {
      logger.error('Failed to reset progress:', error)
      setError((error as Error).message)
      return false
    }
  }, [calculateStatistics])

  // ========================================
  // 戻り値
  // ========================================

  return useMemo(
    () => ({
      // データ
      statistics,
      isLoading,
      error,

      // 認証状態
      isAuthenticated,

      // 同期状態
      syncStatus,
      migrationStatus,

      // プロセス進捗操作
      getProcessProgress,
      updateProcessProgress,

      // セッション記録
      recordStudySession,
      recordFlashCardSession,
      recordExamResult,

      // 統計取得
      getFlashCardStats,
      getExamStats,

      // 同期操作
      syncData,
      forcSync,

      // 移行操作
      migrateToSupabase,
      checkMigrationFeasibility,

      // ユーティリティ
      refreshData,
      resetProgress,
    }),
    [
      statistics,
      isLoading,
      error,
      isAuthenticated,
      syncStatus,
      migrationStatus,
      getProcessProgress,
      updateProcessProgress,
      recordStudySession,
      recordFlashCardSession,
      recordExamResult,
      getFlashCardStats,
      getExamStats,
      syncData,
      forcSync,
      migrateToSupabase,
      checkMigrationFeasibility,
      refreshData,
      resetProgress,
    ]
  )
}

export default useProgressV2
