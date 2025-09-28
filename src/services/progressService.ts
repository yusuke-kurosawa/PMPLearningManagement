/**
 * 学習進捗管理サービス
 * @description PMP学習の進捗追跡、統計計算、データ永続化を提供
 * @author Claude Code Actions
 * @version 2.0.0
 * @since 2025-08-14
 */

import { useState, useEffect } from 'react'
import { logger } from './logger'
import type {
  ProcessCategory,
  ProcessGroup,
  KnowledgeArea,
  ProcessGroupDefinition,
  PMBOKProcess,
  ProcessProgress,
  FlashCardSession,
  ExamResult,
  StudySession,
  LearningGoal,
  ProgressData,
  FlashCardStats,
  ExamStats,
  StudyStats,
  ProgressStatistics,
} from '../types/progress'

// Re-export for backward compatibility
export {
  processCategories,
  processGroups,
  type ProcessCategory,
  type ProcessGroup,
  type KnowledgeArea,
  type ProcessGroupDefinition,
  type PMBOKProcess,
  type ProcessProgress,
  type FlashCardSession,
  type ExamResult,
  type StudySession,
  type LearningGoal,
  type ProgressData,
  type FlashCardStats,
  type ExamStats,
  type StudyStats,
  type ProgressStatistics,
} from '../types/progress'

// ========================================
// 定数定義
// ========================================

/** LocalStorage保存キー */
const STORAGE_KEY = 'pmp_learning_progress'

// ========================================
// 型定義 (Service-specific)
// ========================================

/**
 * 知識エリア定義インターフェース
 */
export interface KnowledgeArea {
  /** 知識エリアID */
  id: ProcessCategory
  /** 知識エリア名 */
  name: string
  /** 説明（オプション） */
  description?: string
}

/**
 * プロセス群定義インターフェース
 */
export interface ProcessGroupDefinition {
  /** プロセス群ID */
  id: ProcessGroup
  /** プロセス群名 */
  name: string
  /** 説明（オプション） */
  description?: string
}

/**
 * PMBOKプロセス定義インターフェース
 */
export interface PMBOKProcess {
  /** プロセス一意ID */
  id: string
  /** プロセス名 */
  name: string
  /** 所属知識エリア */
  knowledgeArea: ProcessCategory
  /** 所属プロセス群 */
  processGroup: ProcessGroup
  /** プロセス説明（オプション） */
  description?: string
  /** PMBOK版数（オプション） */
  version?: number[]
}

/**
 * 個別プロセス進捗情報
 */
export interface ProcessProgress {
  /** 完了フラグ */
  completed: boolean
  /** 理解度（0-100） */
  understanding: number
  /** ユーザーノート */
  notes: string
  /** 最終学習日時 */
  lastStudied: string | null
  /** 学習回数 */
  studyCount?: number
  /** 難易度評価（1-5） */
  difficulty?: number
}

/**
 * フラッシュカード学習セッション記録
 */
export interface FlashCardSession {
  /** セッション時刻 */
  timestamp: string
  /** 総カード数 */
  totalCards: number
  /** 正解数 */
  correctAnswers: number
  /** 学習時間（分） */
  duration: number
  /** セッション種別 */
  sessionType: 'itto' | 'general' | 'custom'
  /** 対象知識エリア（オプション） */
  targetArea?: ProcessCategory
}

/**
 * 模擬試験結果記録
 */
export interface ExamResult {
  /** 受験時刻 */
  timestamp: string
  /** 試験結果詳細 */
  results: {
    /** 総得点 */
    score: number
    /** 正解数 */
    correct: number
    /** 総問題数 */
    total: number
    /** 分野別スコア */
    domainScores: Record<string, number>
    /** 所要時間（分） */
    timeSpent: number
  }
  /** 試験種別 */
  examType: 'full' | 'domain' | 'quick'
  /** 合格フラグ */
  passed: boolean
}

/**
 * 学習セッション記録
 */
export interface StudySession {
  /** セッション日時 */
  date: string
  /** 学習時間（分） */
  duration: number
  /** 学習プロセス数 */
  processCount: number
  /** セッション種別 */
  type?: 'reading' | 'practice' | 'review' | 'exam'
  /** 対象知識エリア */
  focusArea?: ProcessCategory
}

/**
 * 学習目標設定
 */
export interface LearningGoal {
  /** 目標ID */
  id: string
  /** 目標タイトル */
  title: string
  /** 目標説明 */
  description: string
  /** 目標期限 */
  deadline: string
  /** 完了フラグ */
  completed: boolean
  /** 作成日時 */
  createdAt: string
}

/**
 * 総合進捗データ構造
 */
export interface ProgressData {
  /** 知識エリア別進捗 */
  knowledgeAreas: Record<ProcessCategory, unknown>
  /** プロセス群別進捗 */
  processGroups: Record<ProcessGroup, unknown>
  /** 個別プロセス進捗 */
  processes: Record<string, ProcessProgress>
  /** 学習セッション履歴 */
  studySessions: StudySession[]
  /** フラッシュカード学習履歴 */
  flashCardSessions?: FlashCardSession[]
  /** 模擬試験結果履歴 */
  examResults?: ExamResult[]
  /** 学習目標 */
  goals: Record<string, LearningGoal>
  /** 最終更新日時 */
  lastUpdated: string | null
}

/**
 * プロセスデータ構造
 */
interface ProcessData {
  /** 知識エリア一覧 */
  knowledgeAreas: KnowledgeArea[]
  /** プロセス群一覧 */
  processGroups: ProcessGroupDefinition[]
  /** プロセス一覧 */
  processes: PMBOKProcess[]
}

/**
 * フラッシュカード統計情報
 */
export interface FlashCardStats {
  /** 総セッション数 */
  totalSessions: number
  /** 総カード数 */
  totalCards: number
  /** 平均正解率 */
  averageAccuracy: number
  /** 総学習時間（分） */
  totalStudyTime: number
  /** 最終セッション日時 */
  lastSession: string | null
}

/**
 * 模擬試験統計情報
 */
export interface ExamStats {
  /** 総受験回数 */
  totalExams: number
  /** 平均点 */
  averageScore: number
  /** 最高点 */
  highestScore: number
  /** 合格回数 */
  passCount: number
  /** 合格率 */
  passRate: number
  /** 最終受験日時 */
  lastExam: string | null
  /** 最近のスコア */
  recentScores: Array<{
    score: number
    timestamp: string
  }>
}

/**
 * 学習統計情報
 */
export interface StudyStats {
  /** 総学習時間（分） */
  totalDuration: number
  /** 総学習プロセス数 */
  totalProcesses: number
  /** 平均学習時間（分） */
  averageDuration: number
  /** 学習日数 */
  studyDays: number
  /** 日別統計 */
  dailyStats: Record<
    string,
    {
      duration: number
      processCount: number
      sessions: StudySession[]
    }
  >
  /** セッション一覧 */
  sessions: StudySession[]
}

/**
 * 統計情報総合
 */
export interface ProgressStatistics {
  /** 全体統計 */
  overall: {
    completed: number
    total: number
    percentage: number
  }
  /** カテゴリー別統計 */
  byCategory: Record<
    ProcessCategory,
    {
      total: number
      completed: number
    }
  >
  /** プロセス群別統計 */
  byGroup: Record<
    ProcessGroup,
    {
      total: number
      completed: number
    }
  >
  /** 総学習時間 */
  studyTime: number
  /** 最終更新日時 */
  lastUpdated: string | null
}

// ========================================
// メイン進捗管理サービスクラス
// ========================================

/**
 * 進捗管理サービスクラス
 * @description PMP学習の全進捗データを管理
 */
class ProgressService {
  /** 初期化フラグ */
  private initialized: boolean = false

  /** プロセスデータキャッシュ */
  private readonly processData: ProcessData

  /**
   * コンストラクタ
   * @description 進捗サービスの初期化
   */
  constructor() {
    this.processData = this.initializeProcessData()
  }

  // ========================================
  // プライベートメソッド - 初期化
  // ========================================

  /**
   * プロセスデータの初期化
   * @description PMBOK第6版のプロセス定義を作成
   * @returns プロセスデータ構造
   * @private
   */
  private initializeProcessData(): ProcessData {
    const knowledgeAreas: KnowledgeArea[] = [
      { id: 'integration', name: '統合マネジメント' },
      { id: 'scope', name: 'スコープ・マネジメント' },
      { id: 'schedule', name: 'スケジュール・マネジメント' },
      { id: 'cost', name: 'コスト・マネジメント' },
      { id: 'quality', name: '品質マネジメント' },
      { id: 'resource', name: '資源マネジメント' },
      { id: 'communications', name: 'コミュニケーション・マネジメント' },
      { id: 'risk', name: 'リスク・マネジメント' },
      { id: 'procurement', name: '調達マネジメント' },
      { id: 'stakeholder', name: 'ステークホルダー・マネジメント' },
    ]

    const processGroups: ProcessGroupDefinition[] = [
      { id: 'initiating', name: '立上げ' },
      { id: 'planning', name: '計画' },
      { id: 'executing', name: '実行' },
      { id: 'monitoring', name: '監視・コントロール' },
      { id: 'closing', name: '終結' },
    ]

    // PMBOK第6版の49プロセス（簡略化版）
    const processes: PMBOKProcess[] = [
      // 統合マネジメント（7プロセス）
      {
        id: 'p1',
        name: 'プロジェクト憲章の作成',
        knowledgeArea: 'integration',
        processGroup: 'initiating',
      },
      {
        id: 'p2',
        name: 'プロジェクトマネジメント計画書の作成',
        knowledgeArea: 'integration',
        processGroup: 'planning',
      },
      {
        id: 'p3',
        name: 'プロジェクト作業の指揮・マネジメント',
        knowledgeArea: 'integration',
        processGroup: 'executing',
      },
      {
        id: 'p4',
        name: 'プロジェクト知識のマネジメント',
        knowledgeArea: 'integration',
        processGroup: 'executing',
      },
      {
        id: 'p5',
        name: 'プロジェクト作業の監視・コントロール',
        knowledgeArea: 'integration',
        processGroup: 'monitoring',
      },
      {
        id: 'p6',
        name: '統合変更管理',
        knowledgeArea: 'integration',
        processGroup: 'monitoring',
      },
      {
        id: 'p7',
        name: 'プロジェクトやフェーズの終結',
        knowledgeArea: 'integration',
        processGroup: 'closing',
      },
      // スコープ・マネジメント（6プロセス）
      {
        id: 'p8',
        name: 'スコープ・マネジメントの計画',
        knowledgeArea: 'scope',
        processGroup: 'planning',
      },
      {
        id: 'p9',
        name: '要求事項の収集',
        knowledgeArea: 'scope',
        processGroup: 'planning',
      },
      {
        id: 'p10',
        name: 'スコープの定義',
        knowledgeArea: 'scope',
        processGroup: 'planning',
      },
      {
        id: 'p11',
        name: 'WBSの作成',
        knowledgeArea: 'scope',
        processGroup: 'planning',
      },
      {
        id: 'p12',
        name: 'スコープの妥当性確認',
        knowledgeArea: 'scope',
        processGroup: 'monitoring',
      },
      {
        id: 'p13',
        name: 'スコープのコントロール',
        knowledgeArea: 'scope',
        processGroup: 'monitoring',
      },
      // 追加のプロセスは実際の実装時に完全版を追加
    ]

    return { knowledgeAreas, processGroups, processes }
  }

  // ========================================
  // 公開メソッド - データ読み書き
  // ========================================

  /**
   * 進捗データの読み込み
   * @returns 進捗データまたはデフォルトデータ
   */
  async loadProgress(): Promise<ProgressData> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as ProgressData
        return parsed
      }
      return this.getDefaultProgress()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Error loading progress:', error)
      }
      return this.getDefaultProgress()
    }
  }

  /**
   * 進捗データの保存
   * @param progress - 保存する進捗データ
   * @returns 保存成功フラグ
   */
  async saveProgress(progress: ProgressData): Promise<boolean> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
      return true
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Error saving progress:', error)
      }
      return false
    }
  }

  /**
   * デフォルト進捗データの取得
   * @returns 初期状態の進捗データ
   */
  getDefaultProgress(): ProgressData {
    return {
      knowledgeAreas: {},
      processGroups: {},
      processes: {},
      studySessions: [],
      flashCardSessions: [],
      examResults: [],
      goals: {},
      lastUpdated: null,
    }
  }

  // ========================================
  // 公開メソッド - プロセス情報取得
  // ========================================

  /**
   * 知識エリア別プロセス取得
   * @param knowledgeAreaId - 知識エリアID
   * @returns 該当プロセス一覧
   */
  getProcessesByKnowledgeArea(knowledgeAreaId: ProcessCategory): PMBOKProcess[] {
    return this.processData.processes.filter((p) => p.knowledgeArea === knowledgeAreaId)
  }

  /**
   * プロセス群別プロセス取得
   * @param processGroupId - プロセス群ID
   * @returns 該当プロセス一覧
   */
  getProcessesByProcessGroup(processGroupId: ProcessGroup): PMBOKProcess[] {
    return this.processData.processes.filter((p) => p.processGroup === processGroupId)
  }

  /**
   * 全プロセス取得
   * @returns 全プロセス一覧
   */
  getAllProcesses(): PMBOKProcess[] {
    return this.processData.processes
  }

  /**
   * 知識エリア一覧取得
   * @returns 知識エリア定義一覧
   */
  getKnowledgeAreas(): KnowledgeArea[] {
    return this.processData.knowledgeAreas
  }

  /**
   * プロセス群一覧取得
   * @returns プロセス群定義一覧
   */
  getProcessGroups(): ProcessGroupDefinition[] {
    return this.processData.processGroups
  }

  // ========================================
  // 公開メソッド - 個別進捗管理
  // ========================================

  /**
   * 特定プロセスの進捗取得
   * @param processId - プロセスID
   * @returns プロセス進捗情報
   */
  async getProcessProgress(processId: string): Promise<ProcessProgress> {
    const progress = await this.loadProgress()
    return (
      progress.processes?.[processId] || {
        completed: false,
        understanding: 0,
        notes: '',
        lastStudied: null,
        studyCount: 0,
        difficulty: 3,
      }
    )
  }

  // ========================================
  // 公開メソッド - フラッシュカード管理
  // ========================================

  /**
   * フラッシュカード学習セッション記録
   * @param sessionData - セッションデータ
   */
  async recordFlashCardSession(sessionData: Omit<FlashCardSession, 'timestamp'>): Promise<void> {
    const progress = await this.loadProgress()
    if (!progress.flashCardSessions) {
      progress.flashCardSessions = []
    }

    progress.flashCardSessions.push({
      ...sessionData,
      timestamp: new Date().toISOString(),
    })

    // 最新100セッションのみ保持
    if (progress.flashCardSessions.length > 100) {
      progress.flashCardSessions = progress.flashCardSessions.slice(-100)
    }

    await this.saveProgress(progress)
  }

  /**
   * フラッシュカード統計取得
   * @returns フラッシュカード学習統計
   */
  async getFlashCardStats(): Promise<FlashCardStats> {
    const progress = await this.loadProgress()
    const sessions = progress.flashCardSessions || []

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalCards: 0,
        averageAccuracy: 0,
        totalStudyTime: 0,
        lastSession: null,
      }
    }

    const totalCards = sessions.reduce((sum, s) => sum + s.totalCards, 0)
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0)
    const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)

    return {
      totalSessions: sessions.length,
      totalCards,
      averageAccuracy: Math.round((totalCorrect / totalCards) * 100),
      totalStudyTime: totalTime,
      lastSession: sessions[sessions.length - 1].timestamp,
    }
  }

  // ========================================
  // 公開メソッド - 模擬試験管理
  // ========================================

  /**
   * 模擬試験結果記録
   * @param examData - 試験結果データ
   */
  async recordExamResult(examData: ExamResult): Promise<void> {
    const progress = await this.loadProgress()
    if (!progress.examResults) {
      progress.examResults = []
    }

    progress.examResults.push(examData)

    // 最新20回分の結果のみ保持
    if (progress.examResults.length > 20) {
      progress.examResults = progress.examResults.slice(-20)
    }

    await this.saveProgress(progress)
  }

  /**
   * 模擬試験統計取得
   * @returns 模擬試験統計情報
   */
  async getExamStats(): Promise<ExamStats> {
    const progress = await this.loadProgress()
    const examResults = progress.examResults || []

    if (examResults.length === 0) {
      return {
        totalExams: 0,
        averageScore: 0,
        highestScore: 0,
        passCount: 0,
        passRate: 0,
        lastExam: null,
        recentScores: [],
      }
    }

    const scores = examResults.map((r) => r.results.score)
    const totalScore = scores.reduce((sum, score) => sum + score, 0)
    const passCount = scores.filter((score) => score >= 61).length

    return {
      totalExams: examResults.length,
      averageScore: Math.round(totalScore / examResults.length),
      highestScore: Math.max(...scores),
      passCount,
      passRate: Math.round((passCount / examResults.length) * 100),
      lastExam: examResults[examResults.length - 1].timestamp,
      recentScores: examResults.slice(-5).map((r) => ({
        score: r.results.score,
        timestamp: r.timestamp,
      })),
    }
  }

  // ========================================
  // 公開メソッド - 統計分析
  // ========================================

  /**
   * 学習統計の計算
   * @param studySessions - 学習セッション配列
   * @param period - 集計期間（'week' または 'month'）
   * @returns 学習統計情報
   */
  calculateStudyStats(
    studySessions: StudySession[],
    period: 'week' | 'month' = 'week'
  ): StudyStats {
    const now = new Date()
    const periodDays = period === 'week' ? 7 : 30
    const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)

    const filteredSessions = studySessions.filter((session) => new Date(session.date) >= startDate)

    // 日別の学習時間集計
    const dailyStats: Record<
      string,
      {
        duration: number
        processCount: number
        sessions: StudySession[]
      }
    > = {}

    filteredSessions.forEach((session) => {
      const date = new Date(session.date).toLocaleDateString()
      if (!dailyStats[date]) {
        dailyStats[date] = {
          duration: 0,
          processCount: 0,
          sessions: [],
        }
      }
      dailyStats[date].duration += session.duration || 0
      dailyStats[date].processCount += session.processCount || 0
      dailyStats[date].sessions.push(session)
    })

    // 統計サマリー
    const totalDuration = filteredSessions.reduce((sum, s) => sum + (s.duration || 0), 0)
    const totalProcesses = filteredSessions.reduce((sum, s) => sum + (s.processCount || 0), 0)
    const averageDuration =
      filteredSessions.length > 0 ? totalDuration / filteredSessions.length : 0
    const studyDays = Object.keys(dailyStats).length

    return {
      totalDuration,
      totalProcesses,
      averageDuration,
      studyDays,
      dailyStats,
      sessions: filteredSessions,
    }
  }

  // ========================================
  // 公開メソッド - データ入出力
  // ========================================

  /**
   * 進捗データのエクスポート
   * @description JSON形式でファイルダウンロード
   */
  async exportProgress(): Promise<void> {
    const progress = await this.loadProgress()
    const dataStr = JSON.stringify(progress, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const exportFileDefaultName = `pmp-progress-${new Date().toISOString().split('T')[0]}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  /**
   * 進捗データのインポート
   * @param file - アップロードされたJSONファイル
   * @returns インポートされた進捗データ
   */
  async importProgress(file: File): Promise<ProgressData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const result = e.target?.result
          if (typeof result !== 'string') {
            throw new Error('Invalid file content')
          }

          const progress = JSON.parse(result) as ProgressData
          await this.saveProgress(progress)
          resolve(progress)
        } catch (_error) {
          reject(error)
        }
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }
}

// ========================================
// シングルトンインスタンス
// ========================================

/** 進捗サービスシングルトンインスタンス */
export const progressService = new ProgressService()

// ========================================
// カスタムフック
// ========================================

/**
 * 進捗管理用カスタムフック
 * @description React コンポーネントで進捗データを使用するためのフック
 * @returns 進捗データと操作関数
 */
export const useProgress = () => {
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [statistics, setStatistics] = useState<ProgressStatistics | null>(null)

  /**
   * 統計情報計算
   * @param progressData - 進捗データ
   * @returns 統計情報
   */
  const calculateStatistics = (progressData: ProgressData): ProgressStatistics => {
    const processes = progressService.getAllProcesses()
    const completedCount = Object.values(progressData.processes || {}).filter(
      (p) => p.completed
    ).length

    // カテゴリー別統計
    const categoryStats: Record<ProcessCategory, { total: number; completed: number }> =
      {} as Record<ProcessCategory, { total: number; completed: number }>

    Object.keys(processCategories).forEach((cat) => {
      const category = cat as ProcessCategory
      const catProcesses = processes.filter((p) => p.knowledgeArea === category)
      const completed = catProcesses.filter((p) => progressData.processes?.[p.id]?.completed).length
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
      const completed = groupProcesses.filter(
        (p) => progressData.processes?.[p.id]?.completed
      ).length
      groupStats[processGroup] = { total: groupProcesses.length, completed }
    })

    const totalStudyTime =
      progressData.studySessions?.reduce((sum, s) => sum + (s.duration || 0), 0) || 0

    return {
      overall: {
        completed: completedCount,
        total: processes.length,
        percentage: Math.round((completedCount / processes.length) * 100),
      },
      byCategory: categoryStats,
      byGroup: groupStats,
      studyTime: totalStudyTime,
      lastUpdated: progressData.lastUpdated,
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const progressData = await progressService.loadProgress()
        setProgress(progressData)

        // 統計情報の計算
        const stats = calculateStatistics(progressData)
        setStatistics(stats)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          logger.error('Error loading progress data:', error)
        }
        // エラーの場合もデフォルトデータで初期化
        const defaultData = progressService.getDefaultProgress()
        setProgress(defaultData)
        setStatistics(calculateStatistics(defaultData))
      }
    }

    loadData()

    // LocalStorageの変更を監視
    const handleStorageChange = () => {
      loadData()
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  /**
   * プロセス進捗更新
   * @param processId - プロセスID
   * @param progressData - 更新する進捗データ
   * @returns 更新成功フラグ
   */
  const updateProgress = async (
    processId: string,
    progressData: Partial<ProcessProgress>
  ): Promise<boolean> => {
    const currentProgress = await progressService.loadProgress()
    if (!currentProgress.processes) {
      currentProgress.processes = {}
    }

    currentProgress.processes[processId] = {
      ...currentProgress.processes[processId],
      ...progressData,
      lastStudied: new Date().toISOString(),
    }

    currentProgress.lastUpdated = new Date().toISOString()

    const success = await progressService.saveProgress(currentProgress)
    if (success) {
      setProgress(currentProgress)
      setStatistics(calculateStatistics(currentProgress))
    }
    return success
  }

  /**
   * 学習時間記録
   * @param minutes - 学習時間（分）
   * @returns 記録成功フラグ
   */
  const updateStudyTime = async (minutes: number): Promise<boolean> => {
    const currentProgress = await progressService.loadProgress()
    if (!currentProgress.studySessions) {
      currentProgress.studySessions = []
    }

    currentProgress.studySessions.push({
      date: new Date().toISOString(),
      duration: minutes,
      processCount: 1,
    })

    currentProgress.lastUpdated = new Date().toISOString()

    const success = await progressService.saveProgress(currentProgress)
    if (success) {
      setProgress(currentProgress)
      setStatistics(calculateStatistics(currentProgress))
    }
    return success
  }

  /**
   * 進捗リセット
   * @returns リセット成功フラグ
   */
  const resetProgress = async (): Promise<boolean> => {
    const defaultProgress = progressService.getDefaultProgress()
    const success = await progressService.saveProgress(defaultProgress)
    if (success) {
      setProgress(defaultProgress)
      setStatistics(calculateStatistics(defaultProgress))
    }
    return success
  }

  return {
    progress,
    statistics,
    updateProgress,
    updateStudyTime,
    resetProgress,
  }
}
