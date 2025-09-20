/**
 * アジャイル・マインドセットとテーラリングの型定義
 * PMBOK第7版準拠：アジャイル・マインドセット、テーラリング、ハイブリッド・アプローチ
 * ECO (Exam Content Outline) 対応型システム
 */

// 基本的な共通型
export interface BaseItem {
  id: string
  title: string
  description: string
}

export interface DetailedItem extends BaseItem {
  characteristics: string[]
  benefits?: string[]
  limitations?: string[]
  challenges?: string[]
}

// アジャイル・マインドセット：「すること」vs「であること」の型定義
export interface DoingVsBeingAgile extends BaseItem {
  doingAgile: {
    title: string
    description: string
    characteristics: string[]
    limitations: string[]
  }
  beingAgile: {
    title: string
    description: string
    characteristics: string[]
    benefits: string[]
  }
  keyDifferences: Array<{
    aspect: string
    doing: string
    being: string
  }>
}

export interface AgileMindsetConcepts {
  doingVsBeing: DoingVsBeingAgile
}

// アジャイル・マインドセットの要素
export interface AgileMindsetElement extends BaseItem {
  practices: string[]
  benefits?: string[]
  challenges?: string[]
  keyPrinciples?: string[]
  selectionCriteria?: string[]
  adaptationStrategies?: string[]
  coreValues?: Array<{
    value: string
    practices: string[]
  }>
  behavioralIndicators?: string[]
}

export interface AgileMindsetElements extends BaseItem {
  elements: AgileMindsetElement[]
}

// アジャイルの特徴
export interface AgileCharacteristicDetail {
  definition: string
  benefits?: string[]
  implementationPractices?: string[]
  successFactors?: string[]
  feedbackSources?: string[]
  feedbackMechanisms?: string[]
  evolutionProcess?: string[]
}

export interface AgileCharacteristic extends BaseItem {
  details: AgileCharacteristicDetail
}

export interface AgileCharacteristics extends BaseItem {
  characteristics: AgileCharacteristic[]
}

// テーラリング・フレームワーク
export interface TailoringDefinition {
  what: string
  why: string
  when: string
  who: string
}

export interface TailoringPhase {
  phase: string
  timing: string
  activities: string[]
}

export interface ContinuousTailoring {
  title: string
  description: string
  phases: TailoringPhase[]
  triggers: string[]
}

// アプローチ選定関連の型
export interface AssessmentComponent {
  title: string
  factors: string[]
  assessmentQuestions?: string[]
  options?: string[]
}

export interface ApproachCategory {
  category: string
  characteristics: string[]
  suitableFor: string[]
}

export interface AvailableOptions extends AssessmentComponent {
  categories: ApproachCategory[]
}

export interface DecisionMatrixRow {
  factor: string
  predictive: string
  agile: string
  hybrid: string
}

export interface SelectionCriteria {
  title: string
  decisionMatrix: DecisionMatrixRow[]
}

export interface ApproachSelectionComponents {
  productKnowledge: AssessmentComponent
  deliveryCadence: AssessmentComponent
  availableOptions: AvailableOptions
  selectionCriteria: SelectionCriteria
}

// テーラリング・アクション
export interface TailoringAction {
  action: string
  description: string
  examples: string[]
  considerations?: string[]
  benefits?: string[]
  techniques?: string[]
}

// 実務慣行テーラリング
export interface AdjustmentPractice {
  factor: string
  practices: string[]
}

export interface CulturalAdaptationStrategy {
  culture: string
  strategies: string[]
}

export interface TailoringDimension {
  dimension: string
  factors?: string[]
  culturalFactors?: string[]
  adjustments?: AdjustmentPractice[]
  adaptationStrategies?: CulturalAdaptationStrategy[]
}

// テーラリング・レベル
export interface TailoringLevel extends BaseItem {
  level: number
  components?: ApproachSelectionComponents
  tailoringActions?: TailoringAction[]
  tailoringDimensions?: TailoringDimension[]
}

export interface TailoringFramework extends BaseItem {
  definition: TailoringDefinition
  continuousTailoring: ContinuousTailoring
  levels: TailoringLevel[]
}

// ECOマッピング
export interface ECODomain {
  domain: string
  coverage: string[]
  examTopics: string[]
}

export interface ECOMapping extends BaseItem {
  domains: ECODomain[]
}

// 学習支援
export interface LearningPoint {
  topic: string
  points: string[]
}

export interface PracticalExercise {
  exercise: string
  description: string
  steps?: string[]
  components?: string[]
}

export interface CommonMisconception {
  misconception: string
  correction: string
}

export interface LearningSupport extends BaseItem {
  keyLearningPoints: LearningPoint[]
  practicalExercises: PracticalExercise[]
  commonMisconceptions: CommonMisconception[]
}

// メインデータ構造
export interface AgileMindsetData {
  agileMindsetConcepts: AgileMindsetConcepts
  agileMindsetElements: AgileMindsetElements
  agileCharacteristics: AgileCharacteristics
  tailoringFramework: TailoringFramework
  ecoMapping: ECOMapping
  learningSupport: LearningSupport
}

// 型ガード関数
export function isDoingVsBeingAgile(obj: any): obj is DoingVsBeingAgile {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    'description' in obj &&
    'doingAgile' in obj &&
    'beingAgile' in obj &&
    'keyDifferences' in obj
  )
}

export function isAgileMindsetElement(obj: any): obj is AgileMindsetElement {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    'description' in obj &&
    'practices' in obj &&
    Array.isArray(obj.practices)
  )
}

export function isTailoringLevel(obj: any): obj is TailoringLevel {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    'description' in obj &&
    'level' in obj &&
    typeof obj.level === 'number'
  )
}

export function isTailoringFramework(obj: any): obj is TailoringFramework {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    'description' in obj &&
    'definition' in obj &&
    'continuousTailoring' in obj &&
    'levels' in obj &&
    Array.isArray(obj.levels)
  )
}

// ユーティリティ型
export type TailoringActionType = 'Add' | 'Modify' | 'Remove' | 'Combine' | 'Align'

export type LifecycleApproach = 'predictive' | 'agile' | 'hybrid'

export type CulturalDimension =
  | 'decision-making'
  | 'communication'
  | 'risk-tolerance'
  | 'learning-culture'
  | 'change-adaptability'

export type EnvironmentalFactor =
  | 'physical-environment'
  | 'technical-environment'
  | 'regulatory-environment'
  | 'market-environment'

// 検索・フィルタリング用の型
export interface SearchableItem {
  id: string
  title: string
  description: string
  keywords: string[]
  category: string
  subcategory?: string
}

export interface FilterOptions {
  categories?: string[]
  levels?: number[]
  approaches?: LifecycleApproach[]
  complexityLevels?: ('low' | 'medium' | 'high')[]
}

// パフォーマンス最適化用の型
export interface LazyLoadableSection {
  id: string
  title: string
  loadPriority: 'high' | 'medium' | 'low'
  estimatedSize: number
  dependencies?: string[]
}

// 国際化対応用の型
export interface LocalizedContent {
  [locale: string]: {
    title: string
    description: string
    content: any
  }
}

// データ検証用の型
export interface ValidationResult {
  isValid: boolean
  errors: Array<{
    field: string
    message: string
    severity: 'error' | 'warning'
  }>
}

// エクスポート用の統合型
export default AgileMindsetData
