/**
 * PMPLearningManagement TypeScript型定義統合エクスポート
 *
 * このファイルは、プロジェクト全体で使用される型定義を統合し、
 * 一元的なインポートポイントを提供します。
 *
 * 使用例:
 * ```typescript
 * import type { User, Process, LearningProgress } from '@/types'
 * import { isAuthenticated, isProcessCompleted } from '@/types'
 * ```
 */

// ==================== 共通型エクスポート ====================

// 基本型・ユーティリティ型
export type {
  // ブランド型
  ProcessId,
  UserId,
  SessionId,
  Timestamp,

  // 基本データ型
  Required,
  Partial,
  Pick,
  Omit,

  // 状態管理型
  AsyncState,
  Result,
  Option,
  Pagination,
  SortConfig,
  FilterConfig,

  // メタデータ型
  EntityMetadata,
  SoftDeletableMetadata,

  // 数値・計算型
  Percentage,
  Score,
  Duration,
  Count,

  // ヘルパー型
  DeepReadonly,
  NonEmptyArray,
  ArrayToUnion,
  ValueOf,
  Conditional,
  KeysOf,

  // 統合型
  BaseTypes,
} from './common/base'

// API関連型
export type {
  // HTTP型
  HttpMethod,
  HttpStatusCode,
  ContentType,

  // 要求・応答型
  ApiRequest,
  ApiResponse,
  StandardApiResponse,
  ApiResponseMeta,

  // エラー型
  ApiError,
  ApiErrorResponse,
  AuthenticationError,
  AuthorizationError,
  ValidationApiError,

  // リクエスト種別型
  ListRequest,
  ListResponse,
  DetailRequest,
  DetailResponse,
  CreateRequest,
  CreateResponse,
  UpdateRequest,
  UpdateResponse,
  DeleteRequest,
  DeleteResponse,

  // WebSocket型
  WebSocketMessage,
  WebSocketConnectionState,
  WebSocketConfig,

  // ファイル・バッチ型
  FileUploadRequest,
  FileUploadResponse,
  BatchRequest,
  BatchResponse,

  // API設定型
  ApiConfig,
  QueryOptions,
  MutationOptions,

  // 統合型
  ApiTypes,
} from './common/api'

// UI関連型
export type {
  // テーマ型
  ColorPalette,
  ThemeColors,
  ThemeMode,
  Spacing,
  Typography,
  Breakpoints,
  Theme,

  // ナビゲーション型
  NavigationItem,
  NavigationState,
  BreadcrumbItem,

  // フォーム型
  InputType,
  FieldSize,
  FieldState,
  FormFieldProps,
  ValidationMessage,
  FormState,

  // モーダル型
  ModalSize,
  ModalPosition,
  ModalProps,
  ModalState,

  // 通知型
  NotificationType,
  NotificationPosition,
  Notification,
  NotificationState,

  // レイアウト型
  LayoutType,
  LayoutConfig,

  // データ表示型
  TableColumn,
  TableSort,
  TableState,

  // インタラクション型
  ClickHandler,
  KeyboardHandler,
  EventHandler,
  DragDropItem,
  DragDropHandlers,

  // 状態表示型
  LoadingState,
  EmptyState,
  ErrorState,

  // アニメーション型
  AnimationConfig,
  Transition,

  // アクセシビリティ型
  AriaAttributes,
  FocusManagement,

  // レスポンシブ型
  ResponsiveValue,
  ViewportInfo,

  // 統合型
  UITypes,
} from './common/ui'

// エラー関連型
export type {
  // 基本エラー型
  ErrorLevel,
  ErrorCategory,
  ErrorCode,
  BaseAppError,

  // 特定エラー型
  ValidationError,
  NetworkError,
  BusinessRuleError,
  ResourceError,

  // エラーハンドリング型
  ErrorHandler,
  ErrorRecoveryStrategy,
  ErrorRecoveryConfig,
  ErrorContext,

  // エラー報告型
  ErrorReportLevel,
  ErrorReport,
  ErrorBreadcrumb,

  // UI表示用エラー型
  UserErrorMessage,
  UserErrorAction,
  ErrorBoundaryState,

  // エラー統計型
  ErrorStatistics,
  ErrorTrend,
  ErrorHandlingConfig,

  // 統合型
  ErrorTypes,
} from './common/errors'

// ==================== PMBOK型エクスポート ====================

// プロセス関連型
export type {
  // 基本プロセス型
  ProcessGroup,
  KnowledgeAreaId,
  KnowledgeArea,
  ProcessComplexityLevel,
  ProcessFrequency,
  ProcessMaturityLevel,
  Process,
  DetailedProcess,

  // プロセスステップ・メトリック型
  ProcessStep,
  ProcessCheckpoint,
  ProcessMetric,
  ProcessResource,

  // プロセス関係性型
  ProcessRelationshipType,
  ProcessRelationship,
  ProcessFlow,
  ProcessFlowVariation,

  // プロセス実行型
  ProcessExecutionStatus,
  ProcessExecution,
  ProcessIssue,
  ProcessLesson,

  // プロセス分析型
  ProcessAnalyticsMetrics,
  ProcessGap,
  ProcessCapabilityAssessment,
  ProcessCapabilityArea,

  // プロセス学習型
  ProcessLearningLevel,
  ProcessLearningObjective,
  ProcessLearningPath,

  // 統合型
  ProcessTypes,
} from './pmbok/process'

// ITTO関連型
export type {
  // 基本ITTO型
  ITTOItemType,
  ITTOItemCategory,
  ITTOItem,
  DetailedITTOItem,

  // ITTOコンポーネント型
  ITTOItemComponent,
  ITTOTemplate,
  ITTOResource,
  ITTOMetric,
  ITTOVariation,

  // プロセスITTO型
  ProcessITTO,
  ITTOToolTechnique,
  ITTOVendor,
  ITTOFlowConnection,

  // ITTO関係性型
  ITTOMapping,
  ITTOItemMapping,
  ITTOTraceability,
  ITTOTransformation,

  // ITTO品質型
  ITTOQualityCheck,
  ITTOQualityCriteria,
  ITTOCheckpoint,

  // ITTO学習型
  ITTOLearningObjective,
  ITTOLearningActivity,
  ITTOAssessmentMethod,

  // ITTO分析型
  ITTOUsageAnalytics,
  ITTOCombination,
  ITTOEffectiveness,
  ITTOTrend,

  // 統合型
  ITTOTypes,
} from './pmbok/itto'

// ==================== サービス型エクスポート ====================

// プロンプトログサービス型
export type {
  // ログ型
  LogType,
  LogStatus,
  RetentionPolicy,
  InteractionAction,
  PromptLogConfig,
  BaseLogEntry,
  PromptLogEntry,
  ResponseLogEntry,
  InteractionLogEntry,

  // メトリック・分析型
  PromptMetrics,
  ResponseMetrics,
  CostBreakdown,
  LogStatistics,
  TagStatistics,
  UserActivitySummary,
  CostAnalysis,

  // クエリ・エクスポート型
  LogQueryFilters,
  QueryResult,
  ExportFormat,
  ExportOptions,
  ExportResult,

  // サービスインターフェース
  IPromptLogService,

  // 統合型
  PromptLogTypes,
} from './services/prompt-log'

// 学習データサービス型
export type {
  // 基本データ型
  LearningData,
  LearningSession,
  EventType,
  LearningProgressData,
  PerformanceData,
  EngagementData,
  EffectivenessData,

  // 活動・スコア型
  SessionActivity,
  QuizScore,
  ExamScore,
  CompletedModule,
  WeakArea,

  // 分析・レコメンデーション型
  LearningRecommendation,
  LearningReport,
  LearningTrendAnalysis,
  Achievement as LearningAchievement,
  LearningDashboardData,

  // 設定型
  LearningDataCollectorConfig,

  // サービスインターフェース
  ILearningDataCollector,

  // 統合型
  LearningDataTypes,
} from './services/learning-data'

// ==================== 学習型エクスポート ====================

// 学習進捗型
export type {
  // 基本学習型
  LearningLevel,
  ProficiencyLevel,
  LearningStatus,
  LearningMethod,
  LearningProgress,
  DetailedLearningProgress,

  // 学習目標・活動型
  LearningObjective,
  LearningMilestone,
  LearningActivity,

  // 学習スコア型
  LearningScore,
  ScoreDetail,
  LearningAssessment,
  AssessmentRating,

  // 学習パターン型
  LearningPattern,
  LearningStyle,
  LearningPreferences,
  ReminderSettings,

  // 学習計画型
  LearningGoal,
  GoalMetric,
  StudyPlan,
  StudySession,
  PlanAdjustment,

  // フィードバック型
  LearningFeedback,
  LearningNote,

  // 学習統計型
  LearningStatistics,
  KnowledgeAreaProgress,
  ProcessGroupProgress,
  ProgressTrend,
  PerformanceTrend,

  // 統合型
  LearningTypes,
} from './learning/progress'

// ==================== 認証・ユーザー型エクスポート ====================

// ユーザー・認証型
export type {
  // 基本認証型
  AuthProvider,
  AuthStatus,
  UserRole,
  AccountStatus,
  AuthenticationMethod,

  // ユーザー型
  User,
  UserProfile,
  PersonalInfo,
  EducationBackground,
  Certification,
  ContactInfo,
  Address,
  EmergencyContact,

  // 学習プロファイル型
  LearningProfile,
  StudySchedule,
  TimeSlot,
  BreakPreference,
  LearningHistory,
  Achievement,

  // ユーザー設定型
  UserPreferences,
  NotificationPreferences,
  EmailNotificationSettings,
  PushNotificationSettings,
  InAppNotificationSettings,
  SmsNotificationSettings,
  PrivacySettings,
  AccessibilitySettings,
  IntegrationSettings,
  IntegrationConfig,

  // セキュリティ型
  SecuritySettings,
  TwoFactorAuthSettings,
  TrustedDevice,
  LoginSecuritySettings,
  PasswordPolicy,
  SessionManagementSettings,
  DataEncryptionSettings,
  AuditLogSettings,

  // サブスクリプション型
  UserSubscription,
  PaymentMethod,
  SubscriptionFeature,
  UsageMetrics,
  BillingInfo,
  Invoice,

  // ユーザー統計型
  UserStatistics,

  // ソーシャル型
  SocialProfile,
  Friend,
  SocialLink,
  ReputationScore,
  Contribution,

  // 認証セッション型
  AuthSession,
  AuthState,

  // 権限型
  Permission,
  PermissionCondition,
  RolePermissions,

  // 統合型
  AuthTypes,
} from './auth/user'

// ==================== 型ガード・ユーティリティ関数エクスポート ====================

// API型ガード
export { isApiSuccessResponse, isApiErrorResponse } from './common/api'

// エラー型ガード
export {
  isValidationError,
  isAuthenticationError,
  isNetworkError,
  isBusinessRuleError,
  isRecoverableError,
} from './common/errors'

// プロセス型ガード・ユーティリティ
export {
  isCoreProcess,
  isProcessCompleted,
  isProcessInProgress,
  isHighComplexityProcess,
  filterProcessesByGroup,
  filterProcessesByKnowledgeArea,
} from './pmbok/process'

// ITTO型ガード・ユーティリティ
export {
  isInputItem,
  isToolItem,
  isTechniqueItem,
  isOutputItem,
  isReusableItem,
  isHighComplexityItem,
  filterITTOByType,
  filterITTOByCategory,
} from './pmbok/itto'

// 学習型ガード・ユーティリティ
export {
  isLearningCompleted,
  isLearningMastered,
  needsReview,
  isHighScore,
  filterProgressByStatus,
  filterProgressByProficiency,
} from './learning/progress'

// 認証・ユーザー型ガード・ユーティリティ
export {
  isAuthenticated,
  isAdmin,
  isActiveAccount,
  hasActiveSubscription,
  hasPermission,
} from './auth/user'

// ==================== 型定義統合エクスポート ====================

/**
 * 全型定義の統合エクスポート型
 * プロジェクト全体で使用される型の概要を提供
 */
export type AllTypes = {
  // 共通型
  base: string
  api: string
  ui: string
  errors: string

  // ドメイン固有型
  pmbok: {
    process: string
    itto: string
  }
  learning: string
  auth: string
}

/**
 * TypeScript設定で使用する型定義パス
 */
export const TYPE_PATHS = {
  common: './common/*',
  pmbok: './pmbok/*',
  learning: './learning/*',
  auth: './auth/*',
  visualization: './visualization/*',
} as const

/**
 * 型定義バージョン情報
 */
export const TYPE_VERSION = {
  major: 1,
  minor: 0,
  patch: 0,
  prerelease: 'beta',
  build: Date.now(),
} as const

/**
 * 型定義メタデータ
 */
export const TYPE_METADATA = {
  name: 'PMPLearningManagement Types',
  description: 'Comprehensive TypeScript type definitions for PMP Learning Management System',
  author: 'Claude Code',
  license: 'MIT',
  repository: 'https://github.com/yusuke-kurosawa/PMPLearningManagement',
  documentation: 'https://github.com/yusuke-kurosawa/PMPLearningManagement/docs/types',
  lastUpdated: new Date().toISOString(),
  totalTypes: 200, // 概算
  categories: ['common', 'pmbok', 'learning', 'auth', 'ui', 'api', 'errors'],
} as const
