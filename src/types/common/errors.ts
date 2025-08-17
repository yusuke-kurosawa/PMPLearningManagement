/**
 * エラー型定義
 * アプリケーション全体で使用されるエラーハンドリングの型安全性を提供
 */

import type { Timestamp } from './base'

// ==================== 基本エラー型 ====================

/**
 * エラーレベル型
 */
export type ErrorLevel = 'low' | 'medium' | 'high' | 'critical'

/**
 * エラーカテゴリ型
 */
export type ErrorCategory = 
  | 'validation'
  | 'authentication'
  | 'authorization' 
  | 'network'
  | 'server'
  | 'client'
  | 'business'
  | 'system'
  | 'external'

/**
 * エラーコード型
 */
export type ErrorCode = 
  // 認証・認可関連
  | 'AUTH_REQUIRED'
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_TOKEN_EXPIRED'
  | 'AUTH_TOKEN_INVALID'
  | 'AUTH_INSUFFICIENT_PERMISSIONS'
  | 'AUTH_ACCOUNT_LOCKED'
  | 'AUTH_SESSION_EXPIRED'
  
  // バリデーション関連
  | 'VALIDATION_REQUIRED_FIELD'
  | 'VALIDATION_INVALID_FORMAT'
  | 'VALIDATION_OUT_OF_RANGE'
  | 'VALIDATION_DUPLICATE_VALUE'
  | 'VALIDATION_INVALID_LENGTH'
  | 'VALIDATION_PATTERN_MISMATCH'
  
  // ネットワーク関連
  | 'NETWORK_TIMEOUT'
  | 'NETWORK_CONNECTION_FAILED'
  | 'NETWORK_OFFLINE'
  | 'NETWORK_RATE_LIMITED'
  
  // サーバー関連
  | 'SERVER_INTERNAL_ERROR'
  | 'SERVER_SERVICE_UNAVAILABLE'
  | 'SERVER_MAINTENANCE'
  | 'SERVER_OVERLOADED'
  
  // リソース関連
  | 'RESOURCE_NOT_FOUND'
  | 'RESOURCE_ALREADY_EXISTS'
  | 'RESOURCE_CONFLICT'
  | 'RESOURCE_QUOTA_EXCEEDED'
  
  // ビジネスロジック関連
  | 'BUSINESS_RULE_VIOLATION'
  | 'BUSINESS_INVALID_STATE'
  | 'BUSINESS_OPERATION_NOT_ALLOWED'
  
  // システム関連
  | 'SYSTEM_DATABASE_ERROR'
  | 'SYSTEM_FILE_ERROR'
  | 'SYSTEM_CONFIGURATION_ERROR'
  
  // 外部サービス関連
  | 'EXTERNAL_SERVICE_ERROR'
  | 'EXTERNAL_API_ERROR'
  | 'EXTERNAL_TIMEOUT'

/**
 * 基本アプリケーションエラー型
 */
export type BaseAppError = {
  code: ErrorCode
  message: string
  category: ErrorCategory
  level: ErrorLevel
  timestamp: Timestamp
  requestId?: string
  userId?: string
  context?: Record<string, unknown>
  cause?: Error
  stack?: string
}

// ==================== 特定エラー型 ====================

/**
 * バリデーションエラー詳細型
 */
export type ValidationErrorDetail = {
  field: string
  value: unknown
  constraint: string
  message: string
}

/**
 * バリデーションエラー型
 */
export type ValidationError = BaseAppError & {
  code: Extract<ErrorCode, `VALIDATION_${string}`>
  category: 'validation'
  details: ValidationErrorDetail[]
  formId?: string
}

/**
 * 認証エラー型
 */
export type AuthenticationError = BaseAppError & {
  code: Extract<ErrorCode, `AUTH_${string}`>
  category: 'authentication'
  attemptCount?: number
  lockoutDuration?: number
  supportContact?: string
}

/**
 * ネットワークエラー型
 */
export type NetworkError = BaseAppError & {
  code: Extract<ErrorCode, `NETWORK_${string}`>
  category: 'network'
  url?: string
  method?: string
  statusCode?: number
  retryAfter?: number
}

/**
 * ビジネスルールエラー型
 */
export type BusinessRuleError = BaseAppError & {
  code: Extract<ErrorCode, `BUSINESS_${string}`>
  category: 'business'
  ruleId: string
  ruleName: string
  violatedConstraints: string[]
  suggestedActions?: string[]
}

/**
 * リソースエラー型
 */
export type ResourceError = BaseAppError & {
  code: Extract<ErrorCode, `RESOURCE_${string}`>
  category: 'client'
  resourceType: string
  resourceId?: string
  availableAlternatives?: string[]
}

// ==================== エラーハンドリング型 ====================

/**
 * エラーハンドラー型
 */
export type ErrorHandler<T extends BaseAppError = BaseAppError> = (error: T) => void

/**
 * エラー回復戦略型
 */
export type ErrorRecoveryStrategy = 
  | 'retry'
  | 'fallback'
  | 'ignore'
  | 'escalate'
  | 'redirect'
  | 'manual'

/**
 * エラー回復設定型
 */
export type ErrorRecoveryConfig = {
  strategy: ErrorRecoveryStrategy
  maxRetries?: number
  retryDelay?: number
  fallbackValue?: unknown
  redirectUrl?: string
  escalationHandler?: ErrorHandler
}

/**
 * エラーコンテキスト型
 */
export type ErrorContext = {
  component?: string
  action?: string
  userId?: string
  sessionId?: string
  route?: string
  userAgent?: string
  timestamp: Timestamp
  additionalData?: Record<string, unknown>
}

// ==================== エラー報告型 ====================

/**
 * エラー報告レベル型
 */
export type ErrorReportLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

/**
 * エラー報告型
 */
export type ErrorReport = {
  id: string
  error: BaseAppError
  context: ErrorContext
  level: ErrorReportLevel
  tags: string[]
  fingerprint?: string
  breadcrumbs?: ErrorBreadcrumb[]
  environment: string
  release?: string
}

/**
 * エラーブレッドクラム型
 */
export type ErrorBreadcrumb = {
  timestamp: Timestamp
  message: string
  category: string
  level: 'debug' | 'info' | 'warning' | 'error'
  data?: Record<string, unknown>
}

// ==================== UI表示用エラー型 ====================

/**
 * ユーザー向けエラーメッセージ型
 */
export type UserErrorMessage = {
  title: string
  description: string
  actions: UserErrorAction[]
  severity: 'info' | 'warning' | 'error'
  dismissible: boolean
}

/**
 * ユーザーエラーアクション型
 */
export type UserErrorAction = {
  label: string
  type: 'primary' | 'secondary' | 'danger'
  action: () => void | Promise<void>
}

/**
 * エラーバウンダリ状態型
 */
export type ErrorBoundaryState = {
  hasError: boolean
  error: Error | null
  errorInfo: {
    componentStack: string
  } | null
  errorId?: string
  reported: boolean
}

// ==================== エラー統計型 ====================

/**
 * エラー統計型
 */
export type ErrorStatistics = {
  totalErrors: number
  errorsByCategory: Record<ErrorCategory, number>
  errorsByLevel: Record<ErrorLevel, number>
  errorsByCode: Record<ErrorCode, number>
  errorRate: number
  meanTimeToResolution: number
  recurringErrors: Array<{
    code: ErrorCode
    count: number
    lastOccurrence: Timestamp
  }>
}

/**
 * エラートレンド型
 */
export type ErrorTrend = {
  period: string
  errorCount: number
  errorRate: number
  newErrors: number
  resolvedErrors: number
}

// ==================== エラー設定型 ====================

/**
 * エラーハンドリング設定型
 */
export type ErrorHandlingConfig = {
  reportingEnabled: boolean
  reportingEndpoint?: string
  logLevel: ErrorReportLevel
  enableStackTrace: boolean
  enableErrorBoundary: boolean
  retryConfig: {
    maxRetries: number
    retryDelay: number
    exponentialBackoff: boolean
  }
  userNotification: {
    showUserFriendlyMessages: boolean
    allowDismiss: boolean
    autoHideDelay: number
  }
}

// ==================== 型ガード ====================

/**
 * バリデーションエラー型ガード
 */
export const isValidationError = (error: BaseAppError): error is ValidationError => {
  return error.category === 'validation' && error.code.startsWith('VALIDATION_')
}

/**
 * 認証エラー型ガード
 */
export const isAuthenticationError = (error: BaseAppError): error is AuthenticationError => {
  return error.category === 'authentication' && error.code.startsWith('AUTH_')
}

/**
 * ネットワークエラー型ガード
 */
export const isNetworkError = (error: BaseAppError): error is NetworkError => {
  return error.category === 'network' && error.code.startsWith('NETWORK_')
}

/**
 * ビジネスルールエラー型ガード
 */
export const isBusinessRuleError = (error: BaseAppError): error is BusinessRuleError => {
  return error.category === 'business' && error.code.startsWith('BUSINESS_')
}

/**
 * 復旧可能エラー判定
 */
export const isRecoverableError = (error: BaseAppError): boolean => {
  const recoverableCategories: ErrorCategory[] = ['network', 'external', 'server']
  const recoverableCodes: ErrorCode[] = [
    'NETWORK_TIMEOUT',
    'NETWORK_CONNECTION_FAILED',
    'SERVER_OVERLOADED',
    'EXTERNAL_TIMEOUT'
  ]
  
  return recoverableCategories.includes(error.category) || recoverableCodes.includes(error.code)
}

// ==================== エクスポート統合 ====================

/**
 * エラー型定義の統合エクスポート
 */
export type ErrorTypes = {
  BaseAppError: BaseAppError
  ValidationError: ValidationError
  AuthenticationError: AuthenticationError
  NetworkError: NetworkError
  BusinessRuleError: BusinessRuleError
  ResourceError: ResourceError
  ErrorReport: ErrorReport
  ErrorContext: ErrorContext
  UserErrorMessage: UserErrorMessage
  ErrorBoundaryState: ErrorBoundaryState
  ErrorStatistics: ErrorStatistics
  ErrorHandlingConfig: ErrorHandlingConfig
}