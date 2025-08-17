/**
 * プロンプトログサービス型定義
 * AIプロンプトとレスポンスの包括的ログシステム型安全性を提供
 */

import type { UserId, Timestamp, Score, Percentage, Count } from '../common/base'

// ==================== 基本ログ型 ====================

/**
 * ログタイプ
 */
export type LogType = 'prompt' | 'response' | 'interaction'

/**
 * ログ状態
 */
export type LogStatus = 'pending' | 'completed' | 'error' | 'cancelled'

/**
 * ログレベル
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'

/**
 * 保持ポリシー
 */
export type RetentionPolicy = 'rolling' | 'archive' | 'delete'

/**
 * インタラクションアクション
 */
export type InteractionAction = 'like' | 'dislike' | 'flag' | 'copy' | 'share' | 'edit' | 'delete'

// ==================== プロンプトログ設定型 ====================

/**
 * プロンプトログ設定
 */
export type PromptLogConfig = {
  maxQueueSize: number
  flushInterval: number // ミリ秒
  maxLogAge: number // ミリ秒
  enableCompression: boolean
  enableEncryption: boolean
  enableAnalytics: boolean
  privacyMode: boolean
  retentionPolicy: RetentionPolicy
}

/**
 * デフォルト設定
 */
export const DEFAULT_PROMPT_LOG_CONFIG: PromptLogConfig = {
  maxQueueSize: 100,
  flushInterval: 5000,
  maxLogAge: 30 * 24 * 60 * 60 * 1000, // 30日
  enableCompression: true,
  enableEncryption: false,
  enableAnalytics: true,
  privacyMode: false,
  retentionPolicy: 'rolling',
}

// ==================== ログエントリ基本型 ====================

/**
 * 基本ログエントリ
 */
export type BaseLogEntry = {
  id: string
  timestamp: number
  sessionId: string
  type: LogType
  userId: UserId
  status: LogStatus
  metadata: LogEntryMetadata
}

/**
 * ログエントリメタデータ
 */
export type LogEntryMetadata = {
  source?: string
  category?: string
  tags?: string[]
  version?: string
  environment?: EnvironmentInfo
}

/**
 * 環境情報
 */
export type EnvironmentInfo = {
  userAgent: string
  platform: string
  language: string
  screenResolution: string
  timezone: string
  timestamp: number
}

// ==================== プロンプトログ型 ====================

/**
 * プロンプトログエントリ
 */
export type PromptLogEntry = BaseLogEntry & {
  type: 'prompt'
  prompt: string
  context: Record<string, unknown>
  metrics: PromptMetrics
}

/**
 * プロンプトメトリック
 */
export type PromptMetrics = {
  tokenCount: number
  characterCount: number
  complexity?: number
  estimatedCost?: number
}

/**
 * プロンプトデータ
 */
export type PromptData = {
  userId?: UserId
  prompt: string
  context?: Record<string, unknown>
  source?: string
  category?: string
  tags?: string[]
  version?: string
}

// ==================== レスポンスログ型 ====================

/**
 * レスポンスログエントリ
 */
export type ResponseLogEntry = BaseLogEntry & {
  type: 'response'
  promptId: string
  response: string
  model: string
  metadata: ResponseMetadata
  error?: string | null
  metrics: ResponseMetrics
}

/**
 * レスポンスメタデータ
 */
export type ResponseMetadata = {
  completionTime?: number
  totalTokens?: number
  promptTokens?: number
  completionTokens?: number
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
}

/**
 * レスポンスメトリック
 */
export type ResponseMetrics = {
  latency?: number
  throughput?: number
  cost?: CostBreakdown
  qualityScore?: Score
}

/**
 * コスト内訳
 */
export type CostBreakdown = {
  prompt: number
  completion: number
  total: number
  currency: string
}

/**
 * レスポンスデータ
 */
export type ResponseData = {
  userId?: UserId
  response: string
  model?: string
  completionTime?: number
  totalTokens?: number
  promptTokens?: number
  completionTokens?: number
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  latency?: number
  throughput?: number
  status?: LogStatus
  error?: string
}

// ==================== インタラクションログ型 ====================

/**
 * インタラクションログエントリ
 */
export type InteractionLogEntry = BaseLogEntry & {
  type: 'interaction'
  promptId?: string
  responseId?: string
  action: InteractionAction
  feedback?: string
  rating?: number
  metadata: InteractionMetadata
}

/**
 * インタラクションメタデータ
 */
export type InteractionMetadata = {
  source?: string
  context?: Record<string, unknown>
  deviceInfo?: DeviceInfo
  sessionContext?: SessionContext
}

/**
 * デバイス情報
 */
export type DeviceInfo = {
  type: 'desktop' | 'mobile' | 'tablet'
  browser: string
  os: string
  screenSize: string
  inputMethod: 'mouse' | 'touch' | 'keyboard'
}

/**
 * セッションコンテキスト
 */
export type SessionContext = {
  sessionDuration: number
  pageViews: number
  previousActions: string[]
  userState: 'engaged' | 'passive' | 'leaving'
}

/**
 * インタラクションデータ
 */
export type InteractionData = {
  userId?: UserId
  promptId?: string
  responseId?: string
  action: InteractionAction
  feedback?: string
  rating?: number
  source?: string
  context?: Record<string, unknown>
}

// ==================== クエリ・フィルター型 ====================

/**
 * ログクエリフィルター
 */
export type LogQueryFilters = {
  userId?: UserId
  sessionId?: string
  type?: LogType
  status?: LogStatus
  tags?: string[]
  startTime?: number
  endTime?: number
  index?: string
  value?: unknown
  range?: IDBKeyRange
  sort?: SortOptions
  page?: number
  limit?: number
}

/**
 * ソートオプション
 */
export type SortOptions = {
  field: string
  order: 'asc' | 'desc'
}

/**
 * クエリ結果
 */
export type QueryResult<T> = {
  data: T[]
  pagination?: PaginationInfo
  totalCount: number
  hasMore: boolean
}

/**
 * ページネーション情報
 */
export type PaginationInfo = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// ==================== 統計・分析型 ====================

/**
 * ログ統計
 */
export type LogStatistics = {
  totalLogs: Count
  promptCount: Count
  responseCount: Count
  interactionCount: Count
  averageResponseTime: number
  averageTokenUsage: number
  errorRate: Percentage
  topTags: TagStatistics[]
  userActivity: UserActivitySummary
  costAnalysis: CostAnalysis
  timeRange: {
    start: number
    end: number
  }
}

/**
 * タグ統計
 */
export type TagStatistics = {
  tag: string
  count: Count
  percentage: Percentage
}

/**
 * ユーザー活動サマリー
 */
export type UserActivitySummary = Record<string, UserActivity>

/**
 * ユーザー活動
 */
export type UserActivity = {
  promptCount: Count
  responseCount: Count
  interactionCount: Count
  totalTokens: Count
  errors: Count
  averageSessionDuration: number
  lastActiveTime: number
}

/**
 * コスト分析
 */
export type CostAnalysis = {
  totalCost: number
  promptCost: number
  completionCost: number
  averageCostPerRequest: number
  costByModel: ModelCostBreakdown
}

/**
 * モデル別コスト内訳
 */
export type ModelCostBreakdown = Record<
  string,
  {
    total: number
    count: Count
    average: number
  }
>

// ==================== エクスポート形式型 ====================

/**
 * エクスポート形式
 */
export type ExportFormat = 'json' | 'jsonl' | 'csv' | 'markdown'

/**
 * エクスポートオプション
 */
export type ExportOptions = {
  format: ExportFormat
  filters?: LogQueryFilters
  includeMetadata?: boolean
  compress?: boolean
  sanitize?: boolean
}

/**
 * エクスポート結果
 */
export type ExportResult = {
  data: string
  format: ExportFormat
  recordCount: Count
  size: number
  generatedAt: Timestamp
}

// ==================== サービスインターフェース型 ====================

/**
 * プロンプトログサービスインターフェース
 */
export interface IPromptLogService {
  // 基本操作
  logPrompt(data: PromptData): Promise<string>
  logResponse(promptId: string, data: ResponseData): Promise<string>
  logInteraction(data: InteractionData): Promise<string>

  // クエリ・検索
  queryLogs(filters?: LogQueryFilters): Promise<QueryResult<BaseLogEntry>>
  getStatistics(timeRange?: { start: number; end: number }): Promise<LogStatistics>

  // エクスポート・インポート
  exportLogs(options?: ExportOptions): Promise<ExportResult>

  // 管理操作
  clearAllLogs(): Promise<void>
  cleanupOldLogs(): Promise<Count>
  updateConfig(config: Partial<PromptLogConfig>): void
  getConfig(): PromptLogConfig

  // ライフサイクル
  flush(): Promise<void>
  destroy(): void
}

// ==================== 型ガード・ユーティリティ ====================

/**
 * プロンプトログエントリ判定
 */
export const isPromptLogEntry = (entry: BaseLogEntry): entry is PromptLogEntry => {
  return entry.type === 'prompt'
}

/**
 * レスポンスログエントリ判定
 */
export const isResponseLogEntry = (entry: BaseLogEntry): entry is ResponseLogEntry => {
  return entry.type === 'response'
}

/**
 * インタラクションログエントリ判定
 */
export const isInteractionLogEntry = (entry: BaseLogEntry): entry is InteractionLogEntry => {
  return entry.type === 'interaction'
}

/**
 * エラーログ判定
 */
export const isErrorLog = (entry: BaseLogEntry): boolean => {
  return entry.status === 'error'
}

/**
 * 高コストレスポンス判定
 */
export const isHighCostResponse = (entry: ResponseLogEntry): boolean => {
  return entry.metrics.cost?.total ? entry.metrics.cost.total > 0.1 : false
}

// ==================== エクスポート統合 ====================

/**
 * プロンプトログ型定義の統合エクスポート
 */
export type PromptLogTypes = {
  PromptLogEntry: PromptLogEntry
  ResponseLogEntry: ResponseLogEntry
  InteractionLogEntry: InteractionLogEntry
  LogQueryFilters: LogQueryFilters
  LogStatistics: LogStatistics
  PromptLogConfig: PromptLogConfig
  IPromptLogService: IPromptLogService
  ExportResult: ExportResult
}
