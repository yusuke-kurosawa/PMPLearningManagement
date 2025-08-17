/**
 * 基本型・ユーティリティ型定義
 * PMPLearningManagement共通型定義の基盤
 */

// ==================== 基本識別子型 ====================

/**
 * ブランド型ヘルパー - 型安全な識別子を作成
 */
type Brand<T, U> = T & { readonly __brand: U }

/**
 * プロセスID型 - PMBOK プロセス識別子
 */
export type ProcessId = Brand<string, 'ProcessId'>

/**
 * ユーザーID型 - ユーザー識別子
 */
export type UserId = Brand<string, 'UserId'>

/**
 * セッションID型 - セッション識別子
 */
export type SessionId = Brand<string, 'SessionId'>

/**
 * タイムスタンプ型 - ISO 8601形式
 */
export type Timestamp = Brand<string, 'Timestamp'>

// ==================== 基本データ型 ====================

/**
 * 必須フィールド化ユーティリティ型
 */
export type Required<T> = {
  [P in keyof T]-?: T[P]
}

/**
 * 部分的型 - オプショナルフィールド化
 */
export type Partial<T> = {
  [P in keyof T]?: T[P]
}

/**
 * キーを指定してピック
 */
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

/**
 * キーを指定して除外
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

// ==================== 状態管理型 ====================

/**
 * 非同期状態 - データ取得・操作の状態管理
 */
export type AsyncState<T> = {
  data: T | null
  loading: boolean
  error: string | null
  lastUpdated?: Timestamp
}

/**
 * 結果型 - 成功/失敗の結果表現
 */
export type Result<TSuccess, TError = Error> =
  | { success: true; data: TSuccess }
  | { success: false; error: TError }

/**
 * オプション型 - 値の存在/非存在
 */
export type Option<T> = T | null | undefined

/**
 * ページネーション型
 */
export type Pagination = {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/**
 * ソート設定型
 */
export type SortConfig<T> = {
  field: keyof T
  direction: 'asc' | 'desc'
}

/**
 * フィルター設定型
 */
export type FilterConfig<T> = {
  field: keyof T
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan'
  value: unknown
}

// ==================== メタデータ型 ====================

/**
 * 作成・更新メタデータ
 */
export type EntityMetadata = {
  id: string
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy?: UserId
  updatedBy?: UserId
  version: number
}

/**
 * 削除可能エンティティメタデータ
 */
export type SoftDeletableMetadata = EntityMetadata & {
  deletedAt?: Timestamp
  deletedBy?: UserId
  isDeleted: boolean
}

// ==================== 設定・構成型 ====================

/**
 * 環境設定型
 */
export type Environment = 'development' | 'staging' | 'production' | 'test'

/**
 * ログレベル型
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'

/**
 * 言語コード型 (ISO 639-1)
 */
export type LanguageCode = 'ja' | 'en' | 'zh' | 'ko'

/**
 * タイムゾーン型
 */
export type TimeZone = 'Asia/Tokyo' | 'UTC' | 'America/New_York' | 'Europe/London'

// ==================== 入力検証型 ====================

/**
 * バリデーション結果型
 */
export type ValidationResult = {
  isValid: boolean
  errors: ValidationError[]
}

/**
 * バリデーションエラー型
 */
export type ValidationError = {
  field: string
  message: string
  code: string
  value?: unknown
}

/**
 * 入力制約型
 */
export type InputConstraints = {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: unknown) => ValidationResult
}

// ==================== 数値・計算型 ====================

/**
 * パーセンテージ型 (0-100)
 */
export type Percentage = Brand<number, 'Percentage'>

/**
 * スコア型 (0-100)
 */
export type Score = Brand<number, 'Score'>

/**
 * 期間型 (ミリ秒)
 */
export type Duration = Brand<number, 'Duration'>

/**
 * カウント型 (非負整数)
 */
export type Count = Brand<number, 'Count'>

// ==================== 汎用ヘルパー型 ====================

/**
 * 深い読み取り専用型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * 非空配列型
 */
export type NonEmptyArray<T> = [T, ...T[]]

/**
 * 文字列リテラル型の配列からユニオン型を生成
 */
export type ArrayToUnion<T extends readonly unknown[]> = T[number]

/**
 * オブジェクトのキーから値の型を取得
 */
export type ValueOf<T> = T[keyof T]

/**
 * 条件型 - 条件に基づく型選択
 */
export type Conditional<T, U, V> = T extends U ? V : never

/**
 * 型安全なキー配列
 */
export type KeysOf<T> = Array<keyof T>

// ==================== エクスポート ====================

/**
 * 基本型定義の統合エクスポート
 */
export type BaseTypes = {
  ProcessId: ProcessId
  UserId: UserId
  SessionId: SessionId
  Timestamp: Timestamp
  AsyncState: AsyncState<unknown>
  Result: Result<unknown, unknown>
  Option: Option<unknown>
  EntityMetadata: EntityMetadata
  ValidationResult: ValidationResult
  Percentage: Percentage
  Score: Score
  Duration: Duration
  Count: Count
}