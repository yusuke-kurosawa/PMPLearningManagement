/**
 * PMO（プロジェクト管理オフィス）とACoE（アジャイル・センター・オブ・エクセレンス）の型定義
 * PMBOK第7版に準拠したPMOタイプとその特性を定義
 */

/**
 * PMOタイプの列挙型
 */
export enum PMOType {
  SUPPORTIVE = 'supportive', // 支援型
  CONTROLLING = 'controlling', // コントロール型
  DIRECTIVE = 'directive', // 指令型
  ACOE = 'acoe', // アジャイル・センター・オブ・エクセレンス
}

/**
 * PMOの管理レベル
 */
export enum PMOControlLevel {
  LOW = 'low', // 低い（支援型）
  MODERATE = 'moderate', // 中程度（コントロール型）
  HIGH = 'high', // 高い（指令型）
}

/**
 * PMOの責任・役割の型定義
 */
export interface PMOResponsibility {
  id: string
  title: string
  description: string
  category: 'methodology' | 'governance' | 'support' | 'training' | 'coordination' | 'coaching'
  priority: 'high' | 'medium' | 'low'
}

/**
 * ベストプラクティスの型定義
 */
export interface BestPractice {
  id: string
  title: string
  description: string
  implementation: string[]
  benefits: string[]
  challenges: string[]
  applicableContexts: string[]
}

/**
 * PMOメトリクスの型定義
 */
export interface PMOMetrics {
  id: string
  name: string
  description: string
  category: 'performance' | 'quality' | 'efficiency' | 'satisfaction' | 'value'
  measurementMethod: string
  targetValue?: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually'
}

/**
 * PMOツール・テンプレートの型定義
 */
export interface PMOTool {
  id: string
  name: string
  description: string
  type: 'template' | 'checklist' | 'framework' | 'guideline' | 'tool'
  category: string
  usageScenario: string[]
  downloadUrl?: string
}

/**
 * PMOタイプの詳細定義
 */
export interface PMOTypeDefinition {
  type: PMOType
  name: string
  japanName: string
  description: string
  controlLevel: PMOControlLevel

  // 主要特性
  characteristics: {
    managementStyle: string
    autonomyLevel: string
    supportLevel: string
    standardizationLevel: string
  }

  // 責任・役割
  responsibilities: PMOResponsibility[]

  // ベストプラクティス
  bestPractices: BestPractice[]

  // メリット・デメリット
  advantages: string[]
  disadvantages: string[]

  // 適用シナリオ
  applicableScenarios: string[]

  // 成功要因
  successFactors: string[]

  // メトリクス
  keyMetrics: PMOMetrics[]

  // ツール・テンプレート
  tools: PMOTool[]

  // 組織への影響
  organizationalImpact: {
    cultural: string[]
    structural: string[]
    operational: string[]
  }

  // 実装ガイドライン
  implementationGuidelines: {
    prerequisites: string[]
    phases: string[]
    timeline: string
    resources: string[]
    risks: string[]
    mitigationStrategies: string[]
  }
}

/**
 * ACoE特有の機能
 */
export interface ACoECapabilities {
  agileFrameworks: string[]
  coachingAreas: string[]
  trainingPrograms: string[]
  communityBuilding: string[]
  transformationSupport: string[]
  valueRealizationMethods: string[]
}

/**
 * PMO比較マトリクス用の型定義
 */
export interface PMOComparison {
  criteria: string
  supportive: string
  controlling: string
  directive: string
  acoe: string
}

/**
 * PMO実装成熟度モデル
 */
export interface PMOMaturityLevel {
  level: number
  name: string
  description: string
  characteristics: string[]
  capabilities: string[]
  nextLevelRequirements: string[]
}

/**
 * PMOと他の組織機能との関係
 */
export interface PMORelationship {
  entity: string
  relationshipType: 'reports_to' | 'collaborates_with' | 'supports' | 'oversees'
  description: string
  interactions: string[]
}

/**
 * PMOデータの全体構造
 */
export interface PMOData {
  pmoTypes: PMOTypeDefinition[]
  acoeCapabilities: ACoECapabilities
  comparisonMatrix: PMOComparison[]
  maturityModel: PMOMaturityLevel[]
  organizationalRelationships: PMORelationship[]
  metadata: {
    version: string
    lastUpdated: string
    source: string
    compliance: string[]
  }
}

/**
 * PMO評価・選択のためのユーティリティ型
 */
export interface PMOAssessment {
  organizationSize: 'small' | 'medium' | 'large' | 'enterprise'
  projectComplexity: 'low' | 'medium' | 'high'
  organizationalMaturity: 'initial' | 'developing' | 'defined' | 'managed' | 'optimizing'
  industryType: string
  recommendedPMOType: PMOType
  reasoning: string[]
  implementationRoadmap: string[]
}

/**
 * PMOパフォーマンス評価
 */
export interface PMOPerformanceEvaluation {
  pmoType: PMOType
  evaluationPeriod: string
  metrics: {
    [key: string]: {
      target: number
      actual: number
      variance: number
      trend: 'improving' | 'stable' | 'declining'
    }
  }
  qualitativeAssessment: string[]
  recommendedActions: string[]
}

// デフォルトエクスポート
export default PMOData
