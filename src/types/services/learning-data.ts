/**
 * 学習データ収集サービス型定義
 * 学習進捗、効果、パフォーマンス測定システムの型安全性を提供
 */

import type { UserId, Timestamp, Score, Percentage, Count } from '../common/base'
import type { KnowledgeAreaId, ProcessGroup } from '../pmbok/process'

// ==================== 基本学習データ型 ====================

/**
 * 学習データキー
 */
export type LearningDataKey = 'pmp-learning-data' | 'pmp-session-data'

/**
 * イベントタイプ
 */
export type EventType =
  | 'session_start'
  | 'session_end'
  | 'page_view'
  | 'quiz_complete'
  | 'module_complete'
  | 'interaction'
  | 'time_spent'
  | 'error'
  | 'achievement_unlocked'

/**
 * 学習ステータス
 */
export type LearningStatus =
  | 'not-started'
  | 'in-progress'
  | 'completed'
  | 'mastered'
  | 'needs-review'

/**
 * 改善トレンド
 */
export type ImprovementTrend = 'improving' | 'declining' | 'stable' | 'insufficient_data'

/**
 * レコメンデーションタイプ
 */
export type RecommendationType =
  | 'learning_method'
  | 'focus_area'
  | 'consistency'
  | 'practice'
  | 'review'
  | 'break'

/**
 * 優先度
 */
export type Priority = 'low' | 'medium' | 'high' | 'critical'

// ==================== 学習データ構造型 ====================

/**
 * 学習データ
 */
export type LearningData = {
  userId: UserId
  startDate: Timestamp
  sessions: LearningSession[]
  progress: LearningProgressData
  performance: PerformanceData
  engagement: EngagementData
  effectiveness: EffectivenessData
}

/**
 * 学習進捗データ
 */
export type LearningProgressData = {
  overall: Percentage
  knowledgeAreas: Record<KnowledgeAreaId, Percentage>
  processGroups: Record<ProcessGroup, Percentage>
  topics: Record<string, Percentage>
}

/**
 * パフォーマンスデータ
 */
export type PerformanceData = {
  quizScores: QuizScore[]
  examScores: ExamScore[]
  averageScore: Score
  bestScore: Score
  totalQuestions: Count
  correctAnswers: Count
  accuracyRate: Percentage
  improvementRate: Percentage
}

/**
 * エンゲージメントデータ
 */
export type EngagementData = {
  totalTime: number // 分
  dailyTime: Record<string, number> // 日付 -> 分
  streakDays: Count
  maxStreak: Count
  lastActiveDate: string | null
  completedModules: CompletedModule[]
  favoriteTopics: string[]
  sessionCount: Count
  averageSessionDuration: number // 分
}

/**
 * 効果性データ
 */
export type EffectivenessData = {
  learningRate: Percentage
  retentionRate: Percentage
  improvementRate: Percentage
  masteredTopics: string[]
  weakAreas: WeakArea[]
  efficiency: number // 進捗/時間
  consistency: Percentage
}

// ==================== セッション型 ====================

/**
 * 学習セッション
 */
export type LearningSession = {
  id: string
  startTime: Timestamp
  endTime: Timestamp | null
  duration: number // ミリ秒
  activities: SessionActivity[]
  pagesViewed: PageView[]
  interactions: UserInteraction[]
  scores: SessionScore[]
  effectiveness?: Score
  goals?: string[]
  notes?: string
}

/**
 * セッション活動
 */
export type SessionActivity = {
  type: EventType
  timestamp: Timestamp
  data: Record<string, unknown>
  duration?: number
  location?: string
}

/**
 * ページビュー
 */
export type PageView = {
  page: string
  timestamp: Timestamp
  duration: number // ミリ秒
  referrer?: string
  exitPage?: boolean
}

/**
 * ユーザーインタラクション
 */
export type UserInteraction = {
  type: string
  target: string
  timestamp: Timestamp
  value?: unknown
  context?: Record<string, unknown>
}

/**
 * セッションスコア
 */
export type SessionScore = {
  activityId: string
  score: Score
  maxScore: Score
  percentage: Percentage
  category: string
  timestamp: Timestamp
}

// ==================== クイズ・試験型 ====================

/**
 * クイズスコア
 */
export type QuizScore = {
  quizId: string
  score: Score
  totalQuestions: Count
  correctAnswers: Count
  timestamp: Timestamp
  timeSpent: number // 分
  topic?: string
  difficulty?: string
  category?: string
  details?: QuestionResult[]
}

/**
 * 試験スコア
 */
export type ExamScore = {
  examId: string
  score: Score
  totalQuestions: Count
  correctAnswers: Count
  passingScore: Score
  passed: boolean
  timestamp: Timestamp
  timeSpent: number // 分
  sections: ExamSectionResult[]
  grade?: string
}

/**
 * 質問結果
 */
export type QuestionResult = {
  questionId: string
  correct: boolean
  selectedAnswer: string
  correctAnswer: string
  timeSpent: number // 秒
  difficulty: string
  topic: string
}

/**
 * 試験セクション結果
 */
export type ExamSectionResult = {
  sectionId: string
  sectionName: string
  score: Score
  totalQuestions: Count
  correctAnswers: Count
  timeSpent: number // 分
}

// ==================== モジュール・トピック型 ====================

/**
 * 完了モジュール
 */
export type CompletedModule = {
  moduleId: string
  moduleName: string
  completionTime: Timestamp
  score?: Score
  timeSpent: number // 分
  knowledgeArea?: KnowledgeAreaId
  processGroup?: ProcessGroup
  difficulty?: string
  progressIncrement?: number
}

/**
 * 弱点エリア
 */
export type WeakArea = {
  topic: string
  averageScore: Score
  attempts: Count
  recommendation?: string
  priority: Priority
  improvementActions?: string[]
}

/**
 * トピック統計
 */
export type TopicStatistics = {
  topic: string
  timeSpent: number // 分
  sessionsCount: Count
  averageScore: Score
  completionRate: Percentage
  lastStudied: Timestamp
  masteryLevel: number // 1-5
}

// ==================== 分析・レポート型 ====================

/**
 * 学習効果性スコア
 */
export type LearningEffectivenessScore = {
  overall: Score
  components: {
    learningRate: Score
    retentionRate: Score
    improvementRate: Score
    consistency: Score
    efficiency: Score
  }
  interpretation: string
  recommendations: LearningRecommendation[]
}

/**
 * 学習レコメンデーション
 */
export type LearningRecommendation = {
  type: RecommendationType
  message: string
  priority: Priority
  actionItems?: string[]
  estimatedImpact?: string
  timeframe?: string
}

/**
 * 学習トレンド分析
 */
export type LearningTrendAnalysis = {
  trend: ImprovementTrend
  slope: number
  interpretation: string
  dataPoints: Count
  confidence: Percentage
  recommendations: string[]
}

/**
 * 学習レポート
 */
export type LearningReport = {
  period: string
  generatedAt: Timestamp
  summary: LearningReportSummary
  details: LearningReportDetails
  achievements: Achievement[]
  recommendations: LearningRecommendation[]
}

/**
 * 学習レポートサマリー
 */
export type LearningReportSummary = {
  totalTime: number // 分
  sessionsCount: Count
  averageSessionDuration: number // 分
  overallProgress: Percentage
  effectivenessScore: Score
  streakDays: Count
  completedModules: Count
}

/**
 * 学習レポート詳細
 */
export type LearningReportDetails = {
  topPerformingAreas: TopPerformingArea[]
  improvementAreas: WeakArea[]
  learningTrends: LearningTrendAnalysis
  timeDistribution: TimeDistribution
  scoreDistribution: ScoreDistribution
}

/**
 * トップパフォーマンスエリア
 */
export type TopPerformingArea = {
  area: string
  progress: Percentage
  averageScore: Score
  timeSpent: number // 分
  strengthLevel: number // 1-5
}

/**
 * 時間分布
 */
export type TimeDistribution = {
  byDay: Record<string, number>
  byHour: Record<string, number>
  byTopic: Record<string, number>
  peakHours: string[]
  totalActiveTime: number // 分
}

/**
 * スコア分布
 */
export type ScoreDistribution = {
  ranges: Record<string, Count>
  average: Score
  median: Score
  standardDeviation: number
  improvement: number
}

// ==================== 達成・目標型 ====================

/**
 * 達成項目
 */
export type Achievement = {
  id: string
  name: string
  description?: string
  category: string
  earnedAt: Timestamp
  points?: number
  icon?: string
  progress?: Percentage
}

/**
 * 学習目標
 */
export type LearningGoal = {
  id: string
  title: string
  description: string
  targetValue: number
  currentValue: number
  unit: string
  deadline: Timestamp
  priority: Priority
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  category: string
}

// ==================== ダッシュボード型 ====================

/**
 * ダッシュボードデータ
 */
export type LearningDashboardData = {
  progress: LearningProgressData
  performance: PerformanceData
  engagement: EngagementData
  effectiveness: EffectivenessData & { score: Score }
  recommendations: LearningRecommendation[]
  recentActivity: SessionActivity[]
  upcomingGoals: LearningGoal[]
  streakInfo: StreakInfo
}

/**
 * 連続学習情報
 */
export type StreakInfo = {
  current: Count
  longest: Count
  lastActiveDate: string
  nextMilestone: number
  encouragement: string
}

// ==================== 設定型 ====================

/**
 * 学習データ収集設定
 */
export type LearningDataCollectorConfig = {
  storageKey: string
  sessionKey: string
  flushInterval: number // ミリ秒
  maxBufferSize: number
  enableAnalytics: boolean
  privacyMode: boolean
  retentionDays: number
  autoSave: boolean
}

/**
 * メトリクス設定
 */
export type MetricsConfig = {
  trackPageViews: boolean
  trackInteractions: boolean
  trackTimeSpent: boolean
  trackPerformance: boolean
  detailedLogging: boolean
  anonymizeData: boolean
}

// ==================== サービスインターフェース型 ====================

/**
 * 学習データ収集サービスインターフェース
 */
export interface ILearningDataCollector {
  // データ管理
  loadData(): LearningData
  saveData(): boolean
  resetData(): boolean
  exportData(): string

  // イベント追跡
  trackEvent(eventType: EventType, eventData?: Record<string, unknown>): void
  trackPageView(data: { page: string; duration?: number }): void
  trackQuizCompletion(data: Partial<QuizScore>): void
  trackModuleCompletion(data: Partial<CompletedModule>): void
  trackTimeSpent(data: { duration: number }): void

  // セッション管理
  initSession(): LearningSession
  endSession(): void
  getCurrentSession(): LearningSession | null

  // 分析・レポート
  calculateLearningEffectiveness(): Score
  generateRecommendations(): LearningRecommendation[]
  generateReport(period?: string): LearningReport
  getDashboardData(): LearningDashboardData
  getStatistics(timeRange?: { start: string; end: string }): LearningData

  // 設定
  updateConfig(config: Partial<LearningDataCollectorConfig>): void
  getConfig(): LearningDataCollectorConfig
}

// ==================== 型ガード・ユーティリティ ====================

/**
 * クイズスコア判定
 */
export const isQuizScore = (score: unknown): score is QuizScore => {
  return typeof score === 'object' && score !== null && 'quizId' in score
}

/**
 * 高スコア判定
 */
export const isHighScore = (score: Score): boolean => {
  return score >= 80
}

/**
 * マスター判定
 */
export const isMastered = (progress: Percentage): boolean => {
  return progress >= 90
}

/**
 * 連続学習判定
 */
export const hasLearningStreak = (streakDays: Count): boolean => {
  return streakDays >= 7
}

/**
 * 改善傾向判定
 */
export const isImproving = (trend: ImprovementTrend): boolean => {
  return trend === 'improving'
}

// ==================== エクスポート統合 ====================

/**
 * 学習データ型定義の統合エクスポート
 */
export type LearningDataTypes = {
  LearningData: LearningData
  LearningSession: LearningSession
  QuizScore: QuizScore
  ExamScore: ExamScore
  PerformanceData: PerformanceData
  EngagementData: EngagementData
  LearningRecommendation: LearningRecommendation
  LearningReport: LearningReport
  LearningDashboardData: LearningDashboardData
  ILearningDataCollector: ILearningDataCollector
}
