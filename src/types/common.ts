/**
 * Common type definitions for the project
 * Provides type-safe alternatives to 'any'
 */

// Generic object types
export type UnknownObject = Record<string, unknown>
export type StringObject = Record<string, string>
export type NumberObject = Record<string, number>
export type BooleanObject = Record<string, boolean>

// JSON-like structure
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray

export type JSONObject = {
  [key: string]: JSONValue
}

export type JSONArray = JSONValue[]

// Form and event types
export type FormDataObject = Record<string, string | number | boolean | File | File[]>

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: UnknownObject
  }
  metadata?: {
    timestamp: string
    version?: string
    [key: string]: unknown
  }
}

// Error types
export interface AppError {
  code: string
  message: string
  stack?: string
  details?: UnknownObject
}

// Pagination types
export interface PaginationParams {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

// Function types
export type AsyncFunction<T = void> = () => Promise<T>
export type VoidFunction = () => void
export type Callback<T = void> = (error?: Error | null, result?: T) => void

// Utility types
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Maybe<T> = T | null | undefined

// Deep partial type for nested objects
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Extract keys of specific type
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}[keyof T]

// Omit multiple keys
export type OmitMultiple<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

// Make specific keys required
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>

// Make specific keys optional
export type PartialKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
