/**
 * PMBOK ITTO関連型定義
 * インプット、ツールと技法、アウトプットの型安全性を提供
 */

import type { ProcessId } from '../common/base'

// ==================== ITTO基本型 ====================

/**
 * ITTOアイテムタイプ型
 */
export type ITTOItemType = 'input' | 'tool' | 'technique' | 'output'

/**
 * ITTOアイテムカテゴリ型
 */
export type ITTOItemCategory = 
  | 'document'
  | 'plan'
  | 'register'
  | 'log'
  | 'report'
  | 'analysis'
  | 'meeting'
  | 'software'
  | 'technique'
  | 'template'
  | 'standard'
  | 'policy'
  | 'procedure'
  | 'asset'
  | 'factor'

/**
 * 基本ITTOアイテム型
 */
export type ITTOItem = {
  id: string
  name: string
  nameEn: string
  type: ITTOItemType
  category: ITTOItemCategory
  description: string
  purpose: string
  characteristics: string[]
  examples: string[]
  isReusable: boolean
  complexity: 'low' | 'medium' | 'high'
  frequency: 'rare' | 'occasional' | 'frequent' | 'always'
  tags: string[]
}

/**
 * 詳細ITTOアイテム型
 */
export type DetailedITTOItem = ITTOItem & {
  // 詳細情報
  components: ITTOItemComponent[]
  qualityCriteria: string[]
  completionCriteria: string[]
  reviewCriteria: string[]
  
  // 関連性
  relatedItems: string[]
  dependencies: string[]
  alternatives: string[]
  
  // 実装ガイド
  implementationGuidance: string
  commonMistakes: string[]
  bestPractices: string[]
  
  // テンプレート・リソース
  templates: ITTOTemplate[]
  resources: ITTOResource[]
  
  // メトリクス
  qualityMetrics: ITTOMetric[]
  
  // バリエーション
  variations: ITTOVariation[]
}

/**
 * ITTOアイテムコンポーネント型
 */
export type ITTOItemComponent = {
  id: string
  name: string
  description: string
  isRequired: boolean
  order: number
  examples: string[]
}

/**
 * ITTOテンプレート型
 */
export type ITTOTemplate = {
  id: string
  name: string
  description: string
  type: 'document' | 'form' | 'checklist' | 'spreadsheet' | 'presentation'
  url?: string
  downloadUrl?: string
  previewUrl?: string
  tags: string[]
}

/**
 * ITTOリソース型
 */
export type ITTOResource = {
  id: string
  type: 'guide' | 'standard' | 'training' | 'tool' | 'example' | 'video'
  title: string
  description: string
  url?: string
  provider?: string
  tags: string[]
}

/**
 * ITTOメトリック型
 */
export type ITTOMetric = {
  name: string
  description: string
  type: 'completeness' | 'accuracy' | 'timeliness' | 'quality' | 'usability'
  measurement: string
  target?: string
  benchmark?: string
}

/**
 * ITTOバリエーション型
 */
export type ITTOVariation = {
  id: string
  name: string
  description: string
  context: string
  modifications: string[]
  applicability: string[]
}

// ==================== プロセスITTO型 ====================

/**
 * プロセスITTO型
 */
export type ProcessITTO = {
  processId: ProcessId
  inputs: ITTOItem[]
  toolsAndTechniques: ITTOToolTechnique[]
  outputs: ITTOItem[]
  flowConnections: ITTOFlowConnection[]
  lastUpdated: string
}

/**
 * ITTOツール・技法型
 */
export type ITTOToolTechnique = ITTOItem & {
  toolType: 'software' | 'hardware' | 'method' | 'technique' | 'framework'
  skillLevel: 'basic' | 'intermediate' | 'advanced' | 'expert'
  learningTime: number // 時間
  prerequisites: string[]
  certifications: string[]
  vendors?: ITTOVendor[]
}

/**
 * ITTOベンダー型
 */
export type ITTOVendor = {
  name: string
  product: string
  website?: string
  pricing?: string
  features: string[]
  advantages: string[]
  limitations: string[]
}

/**
 * ITTOフロー接続型
 */
export type ITTOFlowConnection = {
  fromItem: string
  toItem: string
  connectionType: 'direct' | 'indirect' | 'conditional' | 'optional'
  description: string
  conditions?: string[]
}

// ==================== ITTO関係性型 ====================

/**
 * ITTOマッピング型
 */
export type ITTOMapping = {
  sourceProcessId: ProcessId
  targetProcessId: ProcessId
  mappings: ITTOItemMapping[]
  connectionStrength: number // 0-1
  commonality: number // 0-1
}

/**
 * ITTOアイテムマッピング型
 */
export type ITTOItemMapping = {
  sourceItemId: string
  targetItemId: string
  mappingType: 'exact' | 'similar' | 'derived' | 'related'
  transformation?: string
  notes?: string
}

/**
 * ITTOトレーサビリティ型
 */
export type ITTOTraceability = {
  itemId: string
  sourceProcesses: ProcessId[]
  targetProcesses: ProcessId[]
  transformations: ITTOTransformation[]
  lifecycleStage: string[]
}

/**
 * ITTO変換型
 */
export type ITTOTransformation = {
  fromProcessId: ProcessId
  toProcessId: ProcessId
  transformationType: 'refine' | 'aggregate' | 'decompose' | 'format' | 'approve'
  description: string
  addedValue: string[]
}

// ==================== ITTO品質・検証型 ====================

/**
 * ITTO品質チェック型
 */
export type ITTOQualityCheck = {
  itemId: string
  checkType: 'completeness' | 'accuracy' | 'consistency' | 'format' | 'approval'
  criteria: ITTOQualityCriteria[]
  checkpoints: ITTOCheckpoint[]
  reviewers: string[]
  status: 'pending' | 'in-review' | 'approved' | 'rejected'
}

/**
 * ITTO品質基準型
 */
export type ITTOQualityCriteria = {
  name: string
  description: string
  weight: number // 重要度 1-10
  measurement: string
  acceptanceCriteria: string[]
  examples: string[]
}

/**
 * ITTOチェックポイント型
 */
export type ITTOCheckpoint = {
  id: string
  name: string
  description: string
  timing: 'creation' | 'interim' | 'completion' | 'handoff'
  isRequired: boolean
  reviewers: string[]
  criteria: string[]
}

// ==================== ITTO学習・習得型 ====================

/**
 * ITTO学習目標型
 */
export type ITTOLearningObjective = {
  itemId: string
  objective: string
  description: string
  level: 'awareness' | 'understanding' | 'application' | 'analysis' | 'synthesis'
  prerequisites: string[]
  learningActivities: ITTOLearningActivity[]
  assessmentMethods: ITTOAssessmentMethod[]
  estimatedTime: number
}

/**
 * ITTO学習活動型
 */
export type ITTOLearningActivity = {
  type: 'reading' | 'practice' | 'simulation' | 'case-study' | 'workshop'
  name: string
  description: string
  duration: number
  materials: string[]
  deliverables: string[]
}

/**
 * ITTO評価方法型
 */
export type ITTOAssessmentMethod = {
  type: 'quiz' | 'exercise' | 'project' | 'presentation' | 'peer-review'
  name: string
  description: string
  criteria: string[]
  weight: number
}

// ==================== ITTO分析・レポート型 ====================

/**
 * ITTO使用状況分析型
 */
export type ITTOUsageAnalytics = {
  itemId: string
  usageFrequency: number
  processes: ProcessId[]
  commonCombinations: ITTOCombination[]
  effectiveness: ITTOEffectiveness
  trends: ITTOTrend[]
}

/**
 * ITTO組み合わせ型
 */
export type ITTOCombination = {
  items: string[]
  frequency: number
  effectiveness: number
  context: string[]
  recommendations: string[]
}

/**
 * ITTO効果性型
 */
export type ITTOEffectiveness = {
  qualityScore: number
  efficiencyScore: number
  usabilityScore: number
  satisfactionScore: number
  improvementAreas: string[]
  successFactors: string[]
}

/**
 * ITTOトレンド型
 */
export type ITTOTrend = {
  period: string
  metric: string
  value: number
  change: number
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile'
  drivers: string[]
}

// ==================== 型ガード・ユーティリティ ====================

/**
 * 入力アイテム判定
 */
export const isInputItem = (item: ITTOItem): boolean => {
  return item.type === 'input'
}

/**
 * ツール判定
 */
export const isToolItem = (item: ITTOItem): boolean => {
  return item.type === 'tool'
}

/**
 * 技法判定
 */
export const isTechniqueItem = (item: ITTOItem): boolean => {
  return item.type === 'technique'
}

/**
 * 出力アイテム判定
 */
export const isOutputItem = (item: ITTOItem): boolean => {
  return item.type === 'output'
}

/**
 * 再利用可能アイテム判定
 */
export const isReusableItem = (item: ITTOItem): boolean => {
  return item.isReusable
}

/**
 * 高複雑度アイテム判定
 */
export const isHighComplexityItem = (item: ITTOItem): boolean => {
  return item.complexity === 'high'
}

/**
 * ITTOアイテムのタイプ別フィルタリング
 */
export const filterITTOByType = (items: ITTOItem[], type: ITTOItemType): ITTOItem[] => {
  return items.filter(item => item.type === type)
}

/**
 * ITTOアイテムのカテゴリ別フィルタリング
 */
export const filterITTOByCategory = (items: ITTOItem[], category: ITTOItemCategory): ITTOItem[] => {
  return items.filter(item => item.category === category)
}

// ==================== エクスポート統合 ====================

/**
 * ITTO型定義の統合エクスポート
 */
export type ITTOTypes = {
  ITTOItem: ITTOItem
  DetailedITTOItem: DetailedITTOItem
  ProcessITTO: ProcessITTO
  ITTOToolTechnique: ITTOToolTechnique
  ITTOMapping: ITTOMapping
  ITTOQualityCheck: ITTOQualityCheck
  ITTOLearningObjective: ITTOLearningObjective
  ITTOUsageAnalytics: ITTOUsageAnalytics
}