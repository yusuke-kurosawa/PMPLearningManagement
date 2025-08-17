/**
 * PMBOK プロセス関連型定義
 * PMBOK 第6版・第7版のプロセス、プロセス群、知識エリアの型安全性を提供
 */

import type { ProcessId, Timestamp, EntityMetadata } from '../common/base'

// ==================== PMBOK 基本型 ====================

/**
 * プロセス群型 - PMBOK第6版の5つのプロセス群
 */
export type ProcessGroup = 
  | '立上げ'
  | '計画'
  | '実行'
  | '監視・コントロール'
  | '終結'

/**
 * 知識エリアID型
 */
export type KnowledgeAreaId = 
  | 'integration'
  | 'scope' 
  | 'schedule'
  | 'cost'
  | 'quality'
  | 'resource'
  | 'communications'
  | 'risk'
  | 'procurement'
  | 'stakeholder'

/**
 * 知識エリア型
 */
export type KnowledgeArea = {
  id: KnowledgeAreaId
  name: string
  nameEn: string
  description: string
  processCount: number
  icon?: string
  color?: string
  order: number
}

/**
 * プロセス複雑度レベル型
 */
export type ProcessComplexityLevel = 'low' | 'medium' | 'high' | 'very-high'

/**
 * プロセス実行頻度型
 */
export type ProcessFrequency = 'once' | 'periodic' | 'continuous' | 'on-demand'

/**
 * プロセス成熟度レベル型
 */
export type ProcessMaturityLevel = 1 | 2 | 3 | 4 | 5

// ==================== PMBOK プロセス型 ====================

/**
 * 基本プロセス型
 */
export type Process = {
  id: ProcessId
  name: string
  nameEn: string
  processGroup: ProcessGroup
  knowledgeArea: KnowledgeAreaId
  description: string
  purpose: string
  keyBenefits: string[]
  complexity: ProcessComplexityLevel
  frequency: ProcessFrequency
  estimatedDuration: number // 時間数
  prerequisites: ProcessId[]
  dependencies: ProcessId[]
  order: number
  isCore: boolean
  pmbokVersion: '6' | '7' | 'both'
  lastUpdated: Timestamp
}

/**
 * 詳細プロセス型 - メタデータ付き
 */
export type DetailedProcess = Process & EntityMetadata & {
  // 詳細情報
  objectives: string[]
  successCriteria: string[]
  commonChallenges: string[]
  bestPractices: string[]
  
  // 関連性
  relatedProcesses: ProcessId[]
  supportingProcesses: ProcessId[]
  
  // 実行ガイド
  executionSteps: ProcessStep[]
  checkpoints: ProcessCheckpoint[]
  
  // メトリクス
  metrics: ProcessMetric[]
  
  // 学習リソース
  resources: ProcessResource[]
  
  // タグ・分類
  tags: string[]
  categories: string[]
}

/**
 * プロセスステップ型
 */
export type ProcessStep = {
  id: string
  name: string
  description: string
  order: number
  isOptional: boolean
  estimatedTime: number
  skillsRequired: string[]
  deliverables: string[]
}

/**
 * プロセスチェックポイント型
 */
export type ProcessCheckpoint = {
  id: string
  name: string
  description: string
  criteria: string[]
  isGate: boolean
  order: number
}

/**
 * プロセスメトリック型
 */
export type ProcessMetric = {
  name: string
  description: string
  type: 'efficiency' | 'quality' | 'time' | 'cost' | 'satisfaction'
  unit: string
  target?: number
  benchmark?: number
  formula?: string
}

/**
 * プロセスリソース型
 */
export type ProcessResource = {
  type: 'document' | 'template' | 'tool' | 'training' | 'video' | 'article'
  title: string
  description: string
  url?: string
  downloadUrl?: string
  tags: string[]
}

// ==================== プロセス関係性型 ====================

/**
 * プロセス関係性タイプ型
 */
export type ProcessRelationshipType = 
  | 'sequential'     // 順次実行
  | 'parallel'       // 並行実行
  | 'overlapping'    // 重複実行
  | 'iterative'      // 反復実行
  | 'conditional'    // 条件付き実行

/**
 * プロセス関係性型
 */
export type ProcessRelationship = {
  fromProcessId: ProcessId
  toProcessId: ProcessId
  relationshipType: ProcessRelationshipType
  description: string
  conditions?: string[]
  strength: number // 0-1, 関係性の強さ
}

/**
 * プロセスフロー型
 */
export type ProcessFlow = {
  id: string
  name: string
  description: string
  processes: ProcessId[]
  relationships: ProcessRelationship[]
  isStandard: boolean
  variations: ProcessFlowVariation[]
}

/**
 * プロセスフロー変形型
 */
export type ProcessFlowVariation = {
  id: string
  name: string
  condition: string
  modifiedProcesses: ProcessId[]
  additionalProcesses: ProcessId[]
  skippedProcesses: ProcessId[]
}

// ==================== プロセス実行型 ====================

/**
 * プロセス実行状態型
 */
export type ProcessExecutionStatus = 
  | 'not-started'
  | 'in-progress'
  | 'completed'
  | 'on-hold'
  | 'cancelled'
  | 'failed'

/**
 * プロセス実行型
 */
export type ProcessExecution = {
  id: string
  processId: ProcessId
  projectId: string
  status: ProcessExecutionStatus
  startDate?: Timestamp
  endDate?: Timestamp
  actualDuration?: number
  plannedDuration: number
  completionPercentage: number
  qualityScore?: number
  notes: string
  issues: ProcessIssue[]
  lessons: ProcessLesson[]
  assignedTo: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * プロセス課題型
 */
export type ProcessIssue = {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  reportedBy: string
  assignedTo?: string
  reportedAt: Timestamp
  resolvedAt?: Timestamp
}

/**
 * プロセス教訓型
 */
export type ProcessLesson = {
  id: string
  title: string
  description: string
  category: 'best-practice' | 'pitfall' | 'improvement' | 'innovation'
  impact: 'low' | 'medium' | 'high'
  applicability: string[]
  contributedBy: string
  createdAt: Timestamp
}

// ==================== プロセス分析型 ====================

/**
 * プロセス分析メトリック型
 */
export type ProcessAnalyticsMetrics = {
  totalProcesses: number
  processesCompleted: number
  averageCompletionTime: number
  onTimeCompletionRate: number
  qualityScoreAverage: number
  mostChallenging: ProcessId[]
  mostEfficient: ProcessId[]
  processGaps: ProcessGap[]
}

/**
 * プロセスギャップ型
 */
export type ProcessGap = {
  processId: ProcessId
  expectedOutcome: string
  actualOutcome: string
  gapDescription: string
  impact: 'low' | 'medium' | 'high'
  recommendedActions: string[]
}

/**
 * プロセス能力評価型
 */
export type ProcessCapabilityAssessment = {
  processId: ProcessId
  maturityLevel: ProcessMaturityLevel
  capabilityAreas: ProcessCapabilityArea[]
  strengths: string[]
  improvementAreas: string[]
  recommendedActions: string[]
  assessmentDate: Timestamp
  assessor: string
}

/**
 * プロセス能力エリア型
 */
export type ProcessCapabilityArea = {
  name: string
  description: string
  score: number // 1-5
  evidence: string[]
  improvementActions: string[]
}

// ==================== プロセス学習型 ====================

/**
 * プロセス学習レベル型
 */
export type ProcessLearningLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

/**
 * プロセス学習目標型
 */
export type ProcessLearningObjective = {
  id: string
  processId: ProcessId
  level: ProcessLearningLevel
  objective: string
  description: string
  successCriteria: string[]
  activities: string[]
  assessmentMethod: string
  estimatedStudyTime: number
}

/**
 * プロセス学習パス型
 */
export type ProcessLearningPath = {
  id: string
  name: string
  description: string
  level: ProcessLearningLevel
  prerequisites: string[]
  objectives: ProcessLearningObjective[]
  totalEstimatedTime: number
  certification?: string
  order: number
}

// ==================== 型ガード・ユーティリティ ====================

/**
 * コアプロセス判定
 */
export const isCoreProcess = (process: Process): boolean => {
  return process.isCore
}

/**
 * プロセス完了判定
 */
export const isProcessCompleted = (execution: ProcessExecution): boolean => {
  return execution.status === 'completed' && execution.completionPercentage === 100
}

/**
 * プロセス実行中判定
 */
export const isProcessInProgress = (execution: ProcessExecution): boolean => {
  return execution.status === 'in-progress'
}

/**
 * 高複雑度プロセス判定
 */
export const isHighComplexityProcess = (process: Process): boolean => {
  return process.complexity === 'high' || process.complexity === 'very-high'
}

/**
 * プロセス群別フィルタリング
 */
export const filterProcessesByGroup = (processes: Process[], group: ProcessGroup): Process[] => {
  return processes.filter(process => process.processGroup === group)
}

/**
 * 知識エリア別フィルタリング
 */
export const filterProcessesByKnowledgeArea = (
  processes: Process[], 
  knowledgeArea: KnowledgeAreaId
): Process[] => {
  return processes.filter(process => process.knowledgeArea === knowledgeArea)
}

// ==================== エクスポート統合 ====================

/**
 * プロセス型定義の統合エクスポート
 */
export type ProcessTypes = {
  Process: Process
  DetailedProcess: DetailedProcess
  ProcessExecution: ProcessExecution
  ProcessRelationship: ProcessRelationship
  ProcessFlow: ProcessFlow
  ProcessAnalyticsMetrics: ProcessAnalyticsMetrics
  ProcessCapabilityAssessment: ProcessCapabilityAssessment
  ProcessLearningPath: ProcessLearningPath
  KnowledgeArea: KnowledgeArea
}