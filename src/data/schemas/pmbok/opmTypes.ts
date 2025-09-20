/**
 * TypeScript Type Definitions for OPM Framework
 * OPMフレームワークのTypeScript型定義
 *
 * PMBOKガイド第6版・第7版に基づくOPMデータの型安全性を保証
 */

// 基本的な識別子型
export type HierarchyLevel = 1 | 2 | 3
export type AuthorityLevel = 'なし' | '低' | '中' | '高'
export type AuthorityScore = 0 | 1 | 2 | 3 | 4 | 5
export type OrganizationTypeId = 'functional' | 'matrix' | 'projectized'
export type MatrixTypeId = 'weak' | 'balanced' | 'strong'

// OPMフレームワークの定義型
export interface OPMDefinition {
  title: string
  description: string
  purpose: string
  scope: string
}

// 階層レベルの詳細型
export interface HierarchyLevel {
  id: string
  name: string
  level: HierarchyLevel
  definition: string
  primaryFocus: string
  keyCharacteristics: string[]
  responsibilities: string[]
  deliverables: string[]
  metrics: string[]
}

// OPM階層型
export interface OPMHierarchy {
  portfolio: HierarchyLevel
  program: HierarchyLevel
  project: HierarchyLevel
}

// 関係性の流れ型
export interface RelationshipFlow {
  description: string
  flow: string[]
  mechanisms?: string[]
  enablers?: string[]
  direction?: 'top-down' | 'bottom-up' | 'bidirectional'
  principles?: string[]
}

// OPM関係性型
export interface OPMRelationships {
  strategic_alignment: RelationshipFlow
  value_flow: RelationshipFlow
  resource_allocation: RelationshipFlow
}

// メインOPMフレームワーク型
export interface OPMFramework {
  definition: OPMDefinition
  hierarchy: OPMHierarchy
  relationships: OPMRelationships
}

// チームメンバーの忠誠心型
export interface TeamMemberLoyalty {
  primary: string
  description: string
}

// チームメンバーの報告ライン型
export interface TeamMemberReporting {
  reportsTo: string
  description: string
}

// PMの役割型
export interface PMRole {
  existence: string
  description: string
  authority: AuthorityLevel
  responsibility: string
}

// チームメンバーの役割型
export interface TeamMemberRole {
  projectInvolvement: string
  description: string
  timeAllocation: string
}

// PMの権限型
export interface PMAuthority {
  level: AuthorityLevel
  score: AuthorityScore
  description: string
  decisionMaking: string
}

// マトリックス型のサブタイプ
export interface MatrixSubType {
  name: string
  pmAuthority: AuthorityLevel
  functionalManagerAuthority: AuthorityLevel
  description: string
}

// マトリックスタイプ型
export interface MatrixTypes {
  weak: MatrixSubType
  balanced: MatrixSubType
  strong: MatrixSubType
}

// 組織構造タイプ型
export interface OrganizationStructureType {
  id: OrganizationTypeId
  name: string
  description: string
  teamMemberLoyalty: TeamMemberLoyalty
  teamMemberReporting: TeamMemberReporting
  pmRole: PMRole
  teamMemberRole: TeamMemberRole
  pmAuthority: PMAuthority
  types?: MatrixTypes // マトリックス型のみ
  advantages: string[]
  disadvantages: string[]
  bestSuitedFor: string[]
}

// 組織構造タイプ群型
export interface OrganizationalStructureTypes {
  functional: OrganizationStructureType
  matrix: OrganizationStructureType
  projectized: OrganizationStructureType
}

// 比較マトリックス項目型
export interface ComparisonMatrixItem {
  criteria: string
  functional: string
  matrix: string
  projectized: string
}

// 権限スケール型
export interface AuthorityScale {
  functional: AuthorityScore
  weakMatrix: AuthorityScore
  balancedMatrix: AuthorityScore
  strongMatrix: AuthorityScore
  projectized: AuthorityScore
}

// 選択基準の値型
export type SelectionCriteriaValue =
  | 'low'
  | 'medium'
  | 'high'
  | 'short'
  | 'long'
  | 'limited'
  | 'shared'
  | 'dedicated'
  | 'routine'
  | 'important'
  | 'critical'

// 選択基準項目型
export interface SelectionCriteriaItem {
  [key: string]: OrganizationTypeId
}

// 選択基準型
export interface SelectionCriteria {
  projectComplexity: SelectionCriteriaItem
  projectDuration: SelectionCriteriaItem
  resourceAvailability: SelectionCriteriaItem
  strategicImportance: SelectionCriteriaItem
}

// 構造比較型
export interface StructureComparison {
  comparisonMatrix: ComparisonMatrixItem[]
  authorityScale: AuthorityScale
  selectionCriteria: SelectionCriteria
}

// OPM効果・利益型
export interface OPMBenefits {
  organizational: string[]
  financial: string[]
  operational: string[]
  strategic: string[]
}

// 実装フェーズ型
export interface ImplementationPhase {
  name: string
  duration: string
  focus: string
  activities: string[]
}

// 実装ロードマップ型
export interface ImplementationRoadmap {
  phase1: ImplementationPhase
  phase2: ImplementationPhase
  phase3: ImplementationPhase
}

// 完全なOPMデータ型
export interface OPMCompleteData {
  framework: OPMFramework
  organizationTypes: OrganizationalStructureTypes
  comparison: StructureComparison
  benefits: OPMBenefits
  implementation: ImplementationRoadmap
}

// ユーティリティ型
export type OrganizationTypeName = OrganizationStructureType['name']
export type HierarchyLevelName = HierarchyLevel['name']
export type ComparisonCriteria = ComparisonMatrixItem['criteria']

// 型ガード関数の型
export type IsOrganizationType = (value: string) => value is OrganizationTypeId
export type IsAuthorityLevel = (value: string) => value is AuthorityLevel
export type IsHierarchyLevel = (value: number) => value is HierarchyLevel

// フィルタリング・検索用の型
export interface OPMSearchCriteria {
  organizationType?: OrganizationTypeId[]
  authorityLevel?: AuthorityLevel[]
  hierarchyLevel?: HierarchyLevel[]
  keywords?: string[]
}

// 分析・レポート用の型
export interface OPMAnalysis {
  organizationType: OrganizationTypeId
  suitabilityScore: number
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

// ダッシュボード表示用の型
export interface OPMDashboardData {
  summary: {
    totalOrganizationTypes: number
    recommendedType: OrganizationTypeId
    complexity: 'low' | 'medium' | 'high'
  }
  comparison: ComparisonMatrixItem[]
  benefits: OPMBenefits
  implementation: {
    currentPhase: keyof ImplementationRoadmap
    progress: number
    nextMilestones: string[]
  }
}

// エクスポート用のメイン型
export type {
  OPMFramework,
  OrganizationalStructureTypes,
  StructureComparison,
  OPMBenefits,
  ImplementationRoadmap,
  OPMCompleteData,
}

// デフォルトエクスポート
export default OPMCompleteData
