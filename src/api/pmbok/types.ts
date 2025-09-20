/**
 * PMBOK Knowledge Area Management Type Definitions
 * Comprehensive TypeScript interfaces for the PMBOK API
 */

// Enum types matching database schema
export enum PMBOKVersion {
  V6 = '6',
  V7 = '7',
  ALL = 'all',
}

export enum ProcessComplexity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum RelationshipType {
  DEPENDENCY = 'dependency',
  PREREQUISITE = 'prerequisite',
  RELATED = 'related',
  SUCCESSOR = 'successor',
}

export enum ITTOType {
  INPUT = 'input',
  TOOL = 'tool',
  OUTPUT = 'output',
}

export enum MasteryLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum ProcessGroupCode {
  INITIATING = 'initiating',
  PLANNING = 'planning',
  EXECUTING = 'executing',
  MONITORING_CONTROLLING = 'monitoring_controlling',
  CLOSING = 'closing',
}

export enum KnowledgeAreaCode {
  INTEGRATION = 'integration',
  SCOPE = 'scope',
  SCHEDULE = 'schedule',
  COST = 'cost',
  QUALITY = 'quality',
  RESOURCE = 'resource',
  COMMUNICATIONS = 'communications',
  RISK = 'risk',
  PROCUREMENT = 'procurement',
  STAKEHOLDER = 'stakeholder',
}

// Base entity interface
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

// Audit fields interface
export interface AuditFields {
  createdBy?: string
  updatedBy?: string
}

// Knowledge Area interfaces
export interface KnowledgeArea extends BaseEntity, AuditFields {
  name: string
  code: string
  description: string
  pmbokVersion: PMBOKVersion
  processCount: number
  color?: string
  icon?: string
  displayOrder: number
  metadata?: Record<string, any>
  isActive: boolean
}

export interface KnowledgeAreaDetail extends KnowledgeArea {
  processes?: Process[]
  relationships?: ProcessRelationship[]
  metrics?: KnowledgeAreaMetrics
}

export interface CreateKnowledgeAreaDto {
  name: string
  code: string
  description: string
  pmbokVersion: PMBOKVersion
  color?: string
  icon?: string
  displayOrder?: number
  metadata?: Record<string, any>
}

export interface UpdateKnowledgeAreaDto {
  name?: string
  description?: string
  color?: string
  icon?: string
  displayOrder?: number
  metadata?: Record<string, any>
  isActive?: boolean
}

// Process Group interfaces
export interface ProcessGroup extends BaseEntity {
  name: string
  code: string
  description: string
  displayOrder: number
  processCount: number
  color?: string
  icon?: string
  metadata?: Record<string, any>
  isActive: boolean
}

export interface ProcessGroupDetail extends ProcessGroup {
  processes?: Process[]
  knowledgeAreas?: KnowledgeArea[]
}

// Process interfaces
export interface Process extends BaseEntity, AuditFields {
  name: string
  code: string
  knowledgeAreaId: string
  processGroupId: string
  description: string
  purpose?: string
  keyBenefits?: string[]
  displayOrder: number
  complexity: ProcessComplexity
  estimatedLearningTime?: number // in minutes
  tags?: string[]
  metadata?: Record<string, any>
  isActive: boolean
  version: number
}

export interface ProcessDetail extends Process {
  knowledgeArea?: KnowledgeArea
  processGroup?: ProcessGroup
  itto?: ITTO
  relationships?: ProcessRelationships
  learningPaths?: LearningPath[]
}

export interface CreateProcessDto {
  name: string
  code: string
  knowledgeAreaId: string
  processGroupId: string
  description: string
  purpose?: string
  keyBenefits?: string[]
  displayOrder?: number
  complexity?: ProcessComplexity
  estimatedLearningTime?: number
  tags?: string[]
  metadata?: Record<string, any>
}

export interface UpdateProcessDto {
  name?: string
  description?: string
  purpose?: string
  keyBenefits?: string[]
  displayOrder?: number
  complexity?: ProcessComplexity
  estimatedLearningTime?: number
  tags?: string[]
  metadata?: Record<string, any>
  isActive?: boolean
}

// ITTO interfaces
export interface ITTOItem extends BaseEntity {
  name: string
  type: ITTOType
  category?: string
  description?: string
  isEnterprise: boolean
  isOrganizational: boolean
  tags?: string[]
  metadata?: Record<string, any>
}

export interface ProcessITTO {
  id: string
  processId: string
  ittoItemId: string
  ittoType: ITTOType
  displayOrder: number
  isPrimary: boolean
  notes?: string
  createdAt: Date
}

export interface ITTO {
  inputs: ITTOItem[]
  tools: ITTOItem[]
  outputs: ITTOItem[]
}

export interface UpdateITTODto {
  inputs?: ITTOItem[]
  tools?: ITTOItem[]
  outputs?: ITTOItem[]
}

// Relationship interfaces
export interface ProcessRelationship extends BaseEntity {
  sourceProcessId: string
  targetProcessId: string
  relationshipType: RelationshipType
  strength?: number // 0-1
  description?: string
  metadata?: Record<string, any>
}

export interface ProcessRelationships {
  dependencies: ProcessRelationship[]
  prerequisites: ProcessRelationship[]
  successors: ProcessRelationship[]
  related: ProcessRelationship[]
}

// User Progress interfaces
export interface UserProgress extends BaseEntity {
  userId: string
  processId: string
  masteryLevel: MasteryLevel
  completionPercentage: number
  score?: number
  attempts: number
  timeSpent: number // in minutes
  lastAccessed?: Date
  notes?: string
  metadata?: Record<string, any>
}

export interface UserProgressSummary {
  userId: string
  knowledgeAreaId: string
  knowledgeAreaName: string
  processesAttempted: number
  avgCompletion: number
  avgScore: number
  totalTimeSpent: number
  lastActivity: Date
}

// Learning Path interfaces
export interface LearningPath extends BaseEntity, AuditFields {
  name: string
  description?: string
  difficultyLevel: ProcessComplexity
  estimatedDuration?: number // in hours
  prerequisites?: string[]
  targetRoles?: string[]
  tags?: string[]
  metadata?: Record<string, any>
  isActive: boolean
  steps?: LearningPathStep[]
}

export interface LearningPathStep {
  id: string
  learningPathId: string
  processId: string
  stepOrder: number
  isOptional: boolean
  estimatedTime?: number // in minutes
  description?: string
  successCriteria?: Record<string, any>
  process?: Process
}

// Analytics interfaces
export interface KnowledgeAreaMetrics {
  totalProcesses: number
  completedProcesses: number
  masteryLevel: number // 0-100
  averageScore: number
  totalLearningTime: number // in minutes
  lastActivity?: Date
}

export interface KnowledgeAreaAnalytics {
  summary: {
    totalAreas: number
    averageMastery: number
    strongestArea?: string
    weakestArea?: string
  }
  areas: Array<{
    areaId: string
    name: string
    metrics: KnowledgeAreaMetrics
    trend: 'improving' | 'stable' | 'declining'
  }>
}

export interface ProcessMasteryAnalytics {
  processId: string
  mastery: number
  attempts: number
  averageScore: number
  timeSpent: number
  lastAttempt?: Date
  recommendations: string[]
}

// Bulk operation interfaces
export interface BulkOperationItem<T> {
  action: 'create' | 'update' | 'delete'
  data: T
}

export interface BulkOperationRequest<T> {
  operations: BulkOperationItem<T>[]
}

export interface BulkOperationResult {
  index: number
  success: boolean
  id?: string
  error?: string
}

export interface BulkOperationResponse {
  successful: number
  failed: number
  results: BulkOperationResult[]
}

// Search interfaces
export interface SearchQuery {
  query: string
  scope?: ('processes' | 'itto' | 'descriptions' | 'all')[]
  filters?: SearchFilters
  page?: number
  limit?: number
}

export interface SearchFilters {
  knowledgeAreas?: KnowledgeAreaCode[]
  processGroups?: ProcessGroupCode[]
  complexity?: ProcessComplexity[]
  tags?: string[]
  pmbokVersion?: PMBOKVersion
}

export interface SearchResult {
  type: 'knowledge_area' | 'process' | 'itto_item'
  id: string
  name: string
  description?: string
  score: number
  highlights: string[]
}

export interface SearchResponse {
  query: string
  totalResults: number
  results: SearchResult[]
  facets?: SearchFacets
}

export interface SearchFacets {
  knowledgeAreas: FacetItem[]
  processGroups: FacetItem[]
  complexity: FacetItem[]
  tags: FacetItem[]
}

export interface FacetItem {
  value: string
  count: number
}

// Pagination interfaces
export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

// Filter interfaces
export interface KnowledgeAreaFilters {
  pmbokVersion?: PMBOKVersion
  isActive?: boolean
  includeProcesses?: boolean
  includeMetrics?: boolean
}

export interface ProcessFilters {
  knowledgeAreaId?: string
  processGroupId?: string
  complexity?: ProcessComplexity[]
  tags?: string[]
  isActive?: boolean
  includeITTO?: boolean
  includeRelationships?: boolean
}

// Analytics Event interfaces
export interface AnalyticsEvent {
  id: string
  userId: string
  eventType: string
  entityType: string
  entityId: string
  eventData?: Record<string, any>
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  timestamp: Date
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: Date
}

// Validation interfaces
export interface ValidationError {
  field: string
  message: string
  code?: string
}

export interface ValidationResult {
  isValid: boolean
  errors?: ValidationError[]
}

// Export all types as namespace for easier imports
export namespace PMBOKTypes {
  export type {
    KnowledgeArea,
    KnowledgeAreaDetail,
    ProcessGroup,
    ProcessGroupDetail,
    Process,
    ProcessDetail,
    ITTOItem,
    ITTO,
    ProcessRelationship,
    UserProgress,
    LearningPath,
    LearningPathStep,
    KnowledgeAreaMetrics,
    KnowledgeAreaAnalytics,
    ProcessMasteryAnalytics,
    SearchResult,
    SearchResponse,
    PaginatedResponse,
    ApiResponse,
    ApiError,
  }
}
