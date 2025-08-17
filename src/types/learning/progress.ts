/**
 * 学習進捗関連型定義
 * 学習進捗、試験結果、フラッシュカード、用語集の型安全性を提供
 */

import type { UserId, Timestamp, Score, Percentage, Count } from '../common/base'
import type { KnowledgeAreaId, ProcessGroup } from '../pmbok/process'

// ==================== 学習進捗基本型 ====================

/**
 * 学習レベル型
 */
export type LearningLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

/**
 * 習熟度レベル型
 */
export type ProficiencyLevel = 0 | 1 | 2 | 3 | 4 | 5

/**
 * 学習状態型
 */
export type LearningStatus =
  | 'not-started'
  | 'in-progress'
  | 'completed'
  | 'mastered'
  | 'needs-review'
  | 'paused'

/**
 * 学習方法型
 */
export type LearningMethod =
  | 'reading'
  | 'video'
  | 'practice'
  | 'flashcard'
  | 'quiz'
  | 'exam'
  | 'discussion'
  | 'hands-on'

// ==================== 基本学習進捗型 ====================

/**
 * 学習進捗型
 */
export type LearningProgress = {
  userId: UserId
  targetId: string
  targetType: 'process' | 'knowledge-area' | 'process-group' | 'principle' | 'itto'
  status: LearningStatus
  proficiencyLevel: ProficiencyLevel
  completionPercentage: Percentage
  timeSpent: number // 分
  lastStudiedAt: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * 詳細学習進捗型
 */
export type DetailedLearningProgress = LearningProgress & {
  // 学習詳細
  learningObjectives: LearningObjective[]
  milestones: LearningMilestone[]
  activities: LearningActivity[]

  // パフォーマンス
  scores: LearningScore[]
  assessments: LearningAssessment[]

  // 学習パターン
  learningPattern: LearningPattern
  preferences: LearningPreferences

  // 目標と計画
  goals: LearningGoal[]
  studyPlan: StudyPlan

  // フィードバック
  feedback: LearningFeedback[]
  notes: LearningNote[]
}

/**
 * 学習目標型
 */
export type LearningObjective = {
  id: string
  description: string
  category: 'knowledge' | 'comprehension' | 'application' | 'analysis' | 'synthesis' | 'evaluation'
  priority: 'low' | 'medium' | 'high' | 'critical'
  targetDate?: Timestamp
  completedAt?: Timestamp
  assessmentCriteria: string[]
  resources: string[]
}

/**
 * 学習マイルストーン型
 */
export type LearningMilestone = {
  id: string
  name: string
  description: string
  targetDate: Timestamp
  achievedAt?: Timestamp
  criteria: string[]
  reward?: string
  isCompleted: boolean
}

/**
 * 学習活動型
 */
export type LearningActivity = {
  id: string
  type: LearningMethod
  name: string
  description: string
  duration: number // 分
  completedAt: Timestamp
  score?: Score
  notes?: string
  resources: string[]
}

// ==================== 学習スコア・評価型 ====================

/**
 * 学習スコア型
 */
export type LearningScore = {
  id: string
  type: 'quiz' | 'exam' | 'practice' | 'assignment' | 'peer-review'
  score: Score
  maxScore: Score
  percentage: Percentage
  category: string
  details: ScoreDetail[]
  achievedAt: Timestamp
}

/**
 * スコア詳細型
 */
export type ScoreDetail = {
  category: string
  subcategory?: string
  points: number
  maxPoints: number
  feedback?: string
}

/**
 * 学習評価型
 */
export type LearningAssessment = {
  id: string
  type: 'self' | 'peer' | 'instructor' | 'automated'
  assessor: string
  targetSkills: string[]
  ratings: AssessmentRating[]
  overallRating: number // 1-5
  feedback: string
  recommendations: string[]
  conductedAt: Timestamp
}

/**
 * 評価レーティング型
 */
export type AssessmentRating = {
  skill: string
  rating: number // 1-5
  evidence: string[]
  improvementAreas: string[]
}

// ==================== 学習パターン・分析型 ====================

/**
 * 学習パターン型
 */
export type LearningPattern = {
  peakLearningTimes: string[] // 時間帯
  preferredSessionLength: number // 分
  averageSessionLength: number // 分
  consistencyScore: number // 0-1
  retentionRate: number // 0-1
  learningVelocity: number // 単位時間あたりの進捗
  strengthAreas: string[]
  challengeAreas: string[]
  learningStyle: LearningStyle
}

/**
 * 学習スタイル型
 */
export type LearningStyle = {
  visual: number // 0-1
  auditory: number // 0-1
  kinesthetic: number // 0-1
  reading: number // 0-1
  preferredPace: 'slow' | 'moderate' | 'fast'
  preferredComplexity: 'simple' | 'moderate' | 'complex'
}

/**
 * 学習設定型
 */
export type LearningPreferences = {
  dailyStudyTime: number // 分
  weeklyStudyDays: number[]
  reminderSettings: ReminderSettings
  difficultyPreference: 'adaptive' | 'challenging' | 'comfortable'
  feedbackFrequency: 'immediate' | 'session-end' | 'daily' | 'weekly'
  gamificationEnabled: boolean
  collaborativeLearning: boolean
}

/**
 * リマインダー設定型
 */
export type ReminderSettings = {
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'custom'
  time: string // HH:MM format
  methods: ('email' | 'push' | 'sms')[]
  customSchedule?: string[]
}

// ==================== 学習目標・計画型 ====================

/**
 * 学習ゴール型
 */
export type LearningGoal = {
  id: string
  title: string
  description: string
  type: 'certification' | 'skill' | 'knowledge' | 'project' | 'career'
  priority: 'low' | 'medium' | 'high' | 'critical'
  targetDate: Timestamp
  currentProgress: Percentage
  milestones: string[]
  resources: string[]
  metrics: GoalMetric[]
  status: 'active' | 'completed' | 'paused' | 'cancelled'
}

/**
 * ゴールメトリック型
 */
export type GoalMetric = {
  name: string
  current: number
  target: number
  unit: string
  trend: 'improving' | 'declining' | 'stable'
}

/**
 * 学習計画型
 */
export type StudyPlan = {
  id: string
  name: string
  description: string
  startDate: Timestamp
  endDate: Timestamp
  totalHours: number
  sessions: StudySession[]
  adjustments: PlanAdjustment[]
  isActive: boolean
}

/**
 * 学習セッション型
 */
export type StudySession = {
  id: string
  plannedDate: Timestamp
  actualDate?: Timestamp
  plannedDuration: number // 分
  actualDuration?: number // 分
  topics: string[]
  objectives: string[]
  activities: string[]
  status: 'scheduled' | 'completed' | 'skipped' | 'rescheduled'
  notes?: string
  effectiveness?: number // 1-5
}

/**
 * 計画調整型
 */
export type PlanAdjustment = {
  id: string
  reason: string
  adjustmentType: 'reschedule' | 'extend' | 'reduce' | 'add-content' | 'remove-content'
  details: string
  impact: string
  adjustedAt: Timestamp
}

// ==================== フィードバック・ノート型 ====================

/**
 * 学習フィードバック型
 */
export type LearningFeedback = {
  id: string
  type: 'system' | 'instructor' | 'peer' | 'self'
  category: 'performance' | 'progress' | 'suggestion' | 'encouragement' | 'correction'
  content: string
  actionable: boolean
  priority: 'low' | 'medium' | 'high'
  relatedContent: string[]
  createdAt: Timestamp
  acknowledgedAt?: Timestamp
}

/**
 * 学習ノート型
 */
export type LearningNote = {
  id: string
  type: 'reflection' | 'summary' | 'question' | 'insight' | 'reminder'
  title: string
  content: string
  tags: string[]
  relatedContent: string[]
  isPrivate: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ==================== 進捗統計・分析型 ====================

/**
 * 学習統計型
 */
export type LearningStatistics = {
  userId: UserId
  periodStart: Timestamp
  periodEnd: Timestamp

  // 基本統計
  totalStudyTime: number // 分
  sessionsCompleted: Count
  averageSessionDuration: number // 分
  consistencyScore: Percentage

  // 進捗統計
  processesCompleted: Count
  processesInProgress: Count
  knowledgeAreasCompleted: Count
  overallProgress: Percentage

  // パフォーマンス統計
  averageScore: Score
  improvementRate: Percentage
  retentionRate: Percentage
  streakDays: Count

  // エリア別統計
  knowledgeAreaProgress: KnowledgeAreaProgress[]
  processGroupProgress: ProcessGroupProgress[]

  // トレンド
  progressTrend: ProgressTrend[]
  performanceTrend: PerformanceTrend[]
}

/**
 * 知識エリア進捗型
 */
export type KnowledgeAreaProgress = {
  knowledgeAreaId: KnowledgeAreaId
  name: string
  completedProcesses: Count
  totalProcesses: Count
  progress: Percentage
  averageScore: Score
  timeSpent: number // 分
  lastStudied: Timestamp
}

/**
 * プロセス群進捗型
 */
export type ProcessGroupProgress = {
  processGroup: ProcessGroup
  completedProcesses: Count
  totalProcesses: Count
  progress: Percentage
  averageScore: Score
  timeSpent: number // 分
}

/**
 * 進捗トレンド型
 */
export type ProgressTrend = {
  date: Timestamp
  cumulativeProgress: Percentage
  dailyProgress: Percentage
  studyTime: number // 分
}

/**
 * パフォーマンストレンド型
 */
export type PerformanceTrend = {
  date: Timestamp
  averageScore: Score
  retentionRate: Percentage
  efficiency: number // 進捗/時間
}

// ==================== 型ガード・ユーティリティ ====================

/**
 * 学習完了判定
 */
export const isLearningCompleted = (progress: LearningProgress): boolean => {
  return progress.status === 'completed' && progress.completionPercentage >= 100
}

/**
 * 習得判定
 */
export const isLearningMastered = (progress: LearningProgress): boolean => {
  return progress.status === 'mastered' && progress.proficiencyLevel >= 4
}

/**
 * 復習必要判定
 */
export const needsReview = (progress: LearningProgress): boolean => {
  return progress.status === 'needs-review'
}

/**
 * 高スコア判定
 */
export const isHighScore = (score: LearningScore): boolean => {
  return score.percentage >= 80
}

/**
 * 学習進捗の状態別フィルタリング
 */
export const filterProgressByStatus = (
  progresses: LearningProgress[],
  status: LearningStatus
): LearningProgress[] => {
  return progresses.filter((progress) => progress.status === status)
}

/**
 * 学習進捗の習熟度別フィルタリング
 */
export const filterProgressByProficiency = (
  progresses: LearningProgress[],
  minLevel: ProficiencyLevel
): LearningProgress[] => {
  return progresses.filter((progress) => progress.proficiencyLevel >= minLevel)
}

// ==================== エクスポート統合 ====================

/**
 * 学習型定義の統合エクスポート
 */
export type LearningTypes = {
  LearningProgress: LearningProgress
  DetailedLearningProgress: DetailedLearningProgress
  LearningScore: LearningScore
  LearningAssessment: LearningAssessment
  LearningPattern: LearningPattern
  LearningGoal: LearningGoal
  StudyPlan: StudyPlan
  StudySession: StudySession
  LearningStatistics: LearningStatistics
  KnowledgeAreaProgress: KnowledgeAreaProgress
}
