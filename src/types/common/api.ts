/**
 * API関連型定義
 * REST API、GraphQL、WebSocket通信の型安全性を提供
 */

import type { Timestamp, Result, Pagination } from './base'

// ==================== HTTP関連型 ====================

/**
 * HTTPメソッド型
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

/**
 * HTTPステータスコード型
 */
export type HttpStatusCode =
  | 200 // OK
  | 201 // Created
  | 204 // No Content
  | 400 // Bad Request
  | 401 // Unauthorized
  | 403 // Forbidden
  | 404 // Not Found
  | 409 // Conflict
  | 422 // Unprocessable Entity
  | 429 // Too Many Requests
  | 500 // Internal Server Error
  | 502 // Bad Gateway
  | 503 // Service Unavailable

/**
 * コンテンツタイプ型
 */
export type ContentType =
  | 'application/json'
  | 'application/xml'
  | 'text/plain'
  | 'text/html'
  | 'multipart/form-data'
  | 'application/x-www-form-urlencoded'

// ==================== API要求・応答型 ====================

/**
 * API要求ヘッダー型
 */
export type ApiRequestHeaders = {
  'Content-Type'?: ContentType
  'Authorization'?: string
  'Accept'?: string
  'User-Agent'?: string
  'X-Request-ID'?: string
  'X-Client-Version'?: string
  [key: string]: string | undefined
}

/**
 * API応答ヘッダー型
 */
export type ApiResponseHeaders = {
  'Content-Type'?: ContentType
  'Cache-Control'?: string
  'ETag'?: string
  'Last-Modified'?: string
  'X-Rate-Limit-Remaining'?: string
  'X-Request-ID'?: string
  [key: string]: string | undefined
}

/**
 * 基本API要求型
 */
export type ApiRequest<TBody = unknown> = {
  method: HttpMethod
  url: string
  headers?: ApiRequestHeaders
  params?: Record<string, string | number | boolean>
  body?: TBody
  timeout?: number
}

/**
 * 基本API応答型
 */
export type ApiResponse<TData = unknown> = {
  status: HttpStatusCode
  statusText: string
  headers: ApiResponseHeaders
  data: TData
  timestamp: Timestamp
  requestId?: string
}

/**
 * 標準化API応答型 - プロジェクト内統一フォーマット
 */
export type StandardApiResponse<TData = unknown> = {
  success: boolean
  data: TData | null
  message?: string
  errors?: ApiError[]
  meta?: ApiResponseMeta
  timestamp: Timestamp
}

/**
 * API応答メタデータ型
 */
export type ApiResponseMeta = {
  requestId: string
  version: string
  executionTime: number
  pagination?: Pagination
  totalCount?: number
}

// ==================== エラー型 ====================

/**
 * APIエラー型
 */
export type ApiError = {
  code: string
  message: string
  field?: string
  details?: Record<string, unknown>
  timestamp: Timestamp
}

/**
 * APIエラーレスポンス型
 */
export type ApiErrorResponse = {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
    stack?: string // 開発環境のみ
  }
  timestamp: Timestamp
  requestId?: string
}

/**
 * 認証エラー型
 */
export type AuthenticationError = ApiError & {
  code: 'AUTHENTICATION_FAILED' | 'TOKEN_EXPIRED' | 'TOKEN_INVALID'
}

/**
 * 認可エラー型
 */
export type AuthorizationError = ApiError & {
  code: 'AUTHORIZATION_FAILED' | 'INSUFFICIENT_PERMISSIONS'
  requiredPermissions?: string[]
}

/**
 * バリデーションエラー型
 */
export type ValidationApiError = ApiError & {
  code: 'VALIDATION_FAILED'
  field: string
  value?: unknown
  constraints?: string[]
}

// ==================== リクエスト種別型 ====================

/**
 * 一覧取得リクエスト型
 */
export type ListRequest<TFilter = Record<string, unknown>> = {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
  filters?: TFilter
}

/**
 * 一覧取得レスポンス型
 */
export type ListResponse<TItem> = StandardApiResponse<{
  items: TItem[]
  pagination: Pagination
  totalCount: number
}>

/**
 * 詳細取得リクエスト型
 */
export type DetailRequest = {
  id: string
  include?: string[]
}

/**
 * 詳細取得レスポンス型
 */
export type DetailResponse<TItem> = StandardApiResponse<TItem>

/**
 * 作成リクエスト型
 */
export type CreateRequest<TData> = {
  data: Omit<TData, 'id' | 'createdAt' | 'updatedAt'>
}

/**
 * 作成レスポンス型
 */
export type CreateResponse<TItem> = StandardApiResponse<TItem>

/**
 * 更新リクエスト型
 */
export type UpdateRequest<TData> = {
  id: string
  data: Partial<Omit<TData, 'id' | 'createdAt' | 'updatedAt'>>
}

/**
 * 更新レスポンス型
 */
export type UpdateResponse<TItem> = StandardApiResponse<TItem>

/**
 * 削除リクエスト型
 */
export type DeleteRequest = {
  id: string
  force?: boolean // 物理削除フラグ
}

/**
 * 削除レスポンス型
 */
export type DeleteResponse = StandardApiResponse<{ deleted: boolean; id: string }>

// ==================== WebSocket型 ====================

/**
 * WebSocketメッセージ型
 */
export type WebSocketMessage<TData = unknown> = {
  type: string
  data: TData
  timestamp: Timestamp
  id?: string
}

/**
 * WebSocket接続状態型
 */
export type WebSocketConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error'

/**
 * WebSocket設定型
 */
export type WebSocketConfig = {
  url: string
  protocols?: string[]
  heartbeatInterval?: number
  reconnectAttempts?: number
  reconnectDelay?: number
}

// ==================== ファイルアップロード型 ====================

/**
 * ファイルアップロード要求型
 */
export type FileUploadRequest = {
  file: File
  category?: string
  metadata?: Record<string, unknown>
}

/**
 * ファイルアップロード応答型
 */
export type FileUploadResponse = StandardApiResponse<{
  fileId: string
  filename: string
  size: number
  mimeType: string
  url: string
  metadata?: Record<string, unknown>
}>

// ==================== バッチ操作型 ====================

/**
 * バッチ操作要求型
 */
export type BatchRequest<TOperation> = {
  operations: TOperation[]
  transactional?: boolean
}

/**
 * バッチ操作結果型
 */
export type BatchOperationResult<TData> = {
  success: boolean
  data?: TData
  error?: ApiError
}

/**
 * バッチ操作応答型
 */
export type BatchResponse<TData> = StandardApiResponse<{
  results: BatchOperationResult<TData>[]
  successCount: number
  failureCount: number
}>

// ==================== API設定型 ====================

/**
 * API設定型
 */
export type ApiConfig = {
  baseUrl: string
  timeout: number
  retryAttempts: number
  retryDelay: number
  headers: ApiRequestHeaders
  auth?: {
    type: 'bearer' | 'basic' | 'api-key'
    token?: string
    credentials?: { username: string; password: string }
    apiKey?: { name: string; value: string; location: 'header' | 'query' }
  }
}

// ==================== フック型（React Query用） ====================

/**
 * Queryオプション型
 */
export type QueryOptions<TData> = {
  enabled?: boolean
  staleTime?: number
  cacheTime?: number
  refetchOnWindowFocus?: boolean
  retry?: boolean | number
  onSuccess?: (data: TData) => void
  onError?: (error: ApiError) => void
}

/**
 * Mutationオプション型
 */
export type MutationOptions<TData, TVariables> = {
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: ApiError, variables: TVariables) => void
  onSettled?: (data: TData | undefined, error: ApiError | null, variables: TVariables) => void
}

// ==================== 型ガード ====================

/**
 * API成功レスポンス型ガード
 */
export const isApiSuccessResponse = <T>(
  response: StandardApiResponse<T>
): response is StandardApiResponse<T> & { success: true; data: T } => {
  return response.success === true && response.data !== null
}

/**
 * APIエラーレスポンス型ガード
 */
export const isApiErrorResponse = (response: unknown): response is ApiErrorResponse => {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    'error' in response &&
    (response as ApiErrorResponse).success === false
  )
}

// ==================== エクスポート統合 ====================

/**
 * API型定義の統合エクスポート
 */
export type ApiTypes = {
  ApiRequest: ApiRequest
  ApiResponse: ApiResponse
  StandardApiResponse: StandardApiResponse
  ListRequest: ListRequest
  ListResponse: ListResponse<unknown>
  DetailRequest: DetailRequest
  DetailResponse: DetailResponse<unknown>
  CreateRequest: CreateRequest<unknown>
  CreateResponse: CreateResponse<unknown>
  UpdateRequest: UpdateRequest<unknown>
  UpdateResponse: UpdateResponse<unknown>
  DeleteRequest: DeleteRequest
  DeleteResponse: DeleteResponse
  ApiError: ApiError
  WebSocketMessage: WebSocketMessage
  FileUploadRequest: FileUploadRequest
  FileUploadResponse: FileUploadResponse
}