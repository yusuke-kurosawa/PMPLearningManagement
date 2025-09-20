/**
 * API Infrastructure Interfaces
 * @description Interface definitions for API layer, REST endpoints, and service contracts
 * @module interfaces/infrastructure/api
 */

import { z } from 'zod'
import {
  IValidator,
  IValidationResult,
  ILogger,
  ICache,
  IHealthStatus,
} from '../core/base.interfaces'

// ============================================================================
// HTTP and REST Interfaces
// ============================================================================

/**
 * HTTP Request interface
 */
export interface IHttpRequest<T = unknown> {
  readonly method: HttpMethod
  readonly url: string
  readonly headers: IHttpHeaders
  readonly params?: IQueryParams
  readonly body?: T
  readonly cookies?: ICookies
  readonly user?: IAuthenticatedUser
  readonly requestId: string
  readonly timestamp: Date
}

/**
 * HTTP Response interface
 */
export interface IHttpResponse<T = unknown> {
  readonly status: number
  readonly headers: IHttpHeaders
  readonly body: T
  readonly cookies?: ICookies
}

/**
 * HTTP Headers interface
 */
export interface IHttpHeaders {
  [key: string]: string | string[] | undefined
  'content-type'?: string
  authorization?: string
  'x-request-id'?: string
  'x-api-version'?: string
}

/**
 * Query Parameters interface
 */
export interface IQueryParams {
  [key: string]: string | string[] | number | boolean | undefined
}

/**
 * Cookies interface
 */
export interface ICookies {
  [key: string]: string
}

/**
 * API Endpoint interface
 */
export interface IApiEndpoint<TRequest = unknown, TResponse = unknown> {
  readonly path: string
  readonly method: HttpMethod
  readonly version: string
  readonly deprecated?: boolean
  readonly rateLimit?: IRateLimit
  readonly authentication?: AuthenticationType
  readonly authorization?: string[]

  /**
   * Handles the request
   */
  handle(request: IHttpRequest<TRequest>): Promise<IHttpResponse<TResponse>>

  /**
   * Validates the request
   */
  validate(request: IHttpRequest<TRequest>): IValidationResult

  /**
   * Gets endpoint documentation
   */
  getDocumentation(): IEndpointDocumentation

  /**
   * Gets request schema
   */
  getRequestSchema(): z.ZodSchema<TRequest>

  /**
   * Gets response schema
   */
  getResponseSchema(): z.ZodSchema<TResponse>
}

/**
 * API Router interface
 */
export interface IApiRouter {
  readonly basePath: string
  readonly version: string
  readonly endpoints: Map<string, IApiEndpoint>

  /**
   * Registers an endpoint
   */
  register(endpoint: IApiEndpoint): void

  /**
   * Routes a request
   */
  route(request: IHttpRequest): Promise<IHttpResponse>

  /**
   * Gets all routes
   */
  getRoutes(): IRouteInfo[]

  /**
   * Generates OpenAPI specification
   */
  generateOpenApiSpec(): IOpenApiSpec
}

// ============================================================================
// API Gateway Interfaces
// ============================================================================

/**
 * API Gateway interface
 */
export interface IApiGateway {
  readonly config: IApiGatewayConfig
  readonly routers: Map<string, IApiRouter>

  /**
   * Processes incoming request
   */
  processRequest(request: IHttpRequest): Promise<IHttpResponse>

  /**
   * Registers a router
   */
  registerRouter(router: IApiRouter): void

  /**
   * Applies middleware
   */
  use(middleware: IMiddleware): void

  /**
   * Starts the gateway
   */
  start(): Promise<void>

  /**
   * Stops the gateway
   */
  stop(): Promise<void>

  /**
   * Gets gateway metrics
   */
  getMetrics(): IApiMetrics
}

/**
 * API Gateway Configuration
 */
export interface IApiGatewayConfig {
  readonly port: number
  readonly host: string
  readonly basePath: string
  readonly corsOptions: ICorsOptions
  readonly rateLimiting: IRateLimitConfig
  readonly authentication: IAuthenticationConfig
  readonly logging: ILoggingConfig
  readonly monitoring: IMonitoringConfig
}

/**
 * Middleware interface
 */
export interface IMiddleware {
  readonly name: string
  readonly priority: number

  /**
   * Processes the request
   */
  process(request: IHttpRequest, next: IMiddlewareNext): Promise<IHttpResponse>

  /**
   * Initializes the middleware
   */
  initialize?(): Promise<void>

  /**
   * Cleans up the middleware
   */
  cleanup?(): Promise<void>
}

/**
 * Middleware Next Function
 */
export interface IMiddlewareNext {
  (request: IHttpRequest): Promise<IHttpResponse>
}

// ============================================================================
// Authentication and Authorization Interfaces
// ============================================================================

/**
 * Authenticated User interface
 */
export interface IAuthenticatedUser {
  readonly userId: string
  readonly email: string
  readonly roles: string[]
  readonly permissions: string[]
  readonly sessionId: string
  readonly expiresAt: Date
}

/**
 * Authentication Service interface
 */
export interface IAuthenticationService {
  /**
   * Authenticates a request
   */
  authenticate(request: IHttpRequest): Promise<IAuthenticatedUser | null>

  /**
   * Validates a token
   */
  validateToken(token: string): Promise<ITokenValidation>

  /**
   * Refreshes a token
   */
  refreshToken(refreshToken: string): Promise<ITokenPair>

  /**
   * Revokes a token
   */
  revokeToken(token: string): Promise<void>

  /**
   * Generates tokens
   */
  generateTokens(user: IAuthenticatedUser): Promise<ITokenPair>
}

/**
 * Authorization Service interface
 */
export interface IAuthorizationService {
  /**
   * Checks if user has permission
   */
  hasPermission(user: IAuthenticatedUser, permission: string): Promise<boolean>

  /**
   * Checks if user has role
   */
  hasRole(user: IAuthenticatedUser, role: string): Promise<boolean>

  /**
   * Checks if user can access resource
   */
  canAccess(user: IAuthenticatedUser, resource: string, action: string): Promise<boolean>

  /**
   * Gets user permissions
   */
  getUserPermissions(userId: string): Promise<string[]>
}

/**
 * Token Validation Result
 */
export interface ITokenValidation {
  readonly isValid: boolean
  readonly user?: IAuthenticatedUser
  readonly error?: string
  readonly expiresAt?: Date
}

/**
 * Token Pair interface
 */
export interface ITokenPair {
  readonly accessToken: string
  readonly refreshToken: string
  readonly expiresIn: number
  readonly tokenType: string
}

// ============================================================================
// Rate Limiting Interfaces
// ============================================================================

/**
 * Rate Limiter interface
 */
export interface IRateLimiter {
  /**
   * Checks if request is allowed
   */
  isAllowed(identifier: string, endpoint?: string): Promise<IRateLimitResult>

  /**
   * Records a request
   */
  recordRequest(identifier: string, endpoint?: string): Promise<void>

  /**
   * Resets limits for identifier
   */
  reset(identifier: string): Promise<void>

  /**
   * Gets current usage
   */
  getUsage(identifier: string): Promise<IRateLimitUsage>
}

/**
 * Rate Limit Result
 */
export interface IRateLimitResult {
  readonly allowed: boolean
  readonly limit: number
  readonly remaining: number
  readonly resetAt: Date
  readonly retryAfter?: number
}

/**
 * Rate Limit Usage
 */
export interface IRateLimitUsage {
  readonly requests: number
  readonly limit: number
  readonly windowStart: Date
  readonly windowEnd: Date
}

/**
 * Rate Limit Configuration
 */
export interface IRateLimitConfig {
  readonly enabled: boolean
  readonly windowMs: number
  readonly maxRequests: number
  readonly keyGenerator?: (request: IHttpRequest) => string
  readonly skipSuccessfulRequests?: boolean
  readonly skipFailedRequests?: boolean
}

/**
 * Rate Limit interface
 */
export interface IRateLimit {
  readonly requests: number
  readonly window: string // e.g., "1m", "1h", "1d"
  readonly burst?: number
}

// ============================================================================
// API Client Interfaces
// ============================================================================

/**
 * API Client interface
 */
export interface IApiClient {
  readonly config: IApiClientConfig

  /**
   * Makes a GET request
   */
  get<T>(path: string, options?: IRequestOptions): Promise<T>

  /**
   * Makes a POST request
   */
  post<T>(path: string, data?: unknown, options?: IRequestOptions): Promise<T>

  /**
   * Makes a PUT request
   */
  put<T>(path: string, data?: unknown, options?: IRequestOptions): Promise<T>

  /**
   * Makes a PATCH request
   */
  patch<T>(path: string, data?: unknown, options?: IRequestOptions): Promise<T>

  /**
   * Makes a DELETE request
   */
  delete<T>(path: string, options?: IRequestOptions): Promise<T>

  /**
   * Sets authentication token
   */
  setAuthToken(token: string): void

  /**
   * Adds request interceptor
   */
  addRequestInterceptor(interceptor: IRequestInterceptor): void

  /**
   * Adds response interceptor
   */
  addResponseInterceptor(interceptor: IResponseInterceptor): void
}

/**
 * API Client Configuration
 */
export interface IApiClientConfig {
  readonly baseURL: string
  readonly timeout: number
  readonly headers?: IHttpHeaders
  readonly retryConfig?: IRetryConfig
  readonly cacheConfig?: ICacheConfig
}

/**
 * Request Options
 */
export interface IRequestOptions {
  headers?: IHttpHeaders
  params?: IQueryParams
  timeout?: number
  signal?: AbortSignal
  cache?: boolean
  retry?: boolean
}

/**
 * Request Interceptor
 */
export interface IRequestInterceptor {
  (config: IRequestConfig): IRequestConfig | Promise<IRequestConfig>
}

/**
 * Response Interceptor
 */
export interface IResponseInterceptor {
  (response: IApiResponse): IApiResponse | Promise<IApiResponse>
}

/**
 * Request Configuration
 */
export interface IRequestConfig {
  url: string
  method: HttpMethod
  headers?: IHttpHeaders
  params?: IQueryParams
  data?: unknown
  timeout?: number
}

/**
 * API Response
 */
export interface IApiResponse<T = unknown> {
  readonly data: T
  readonly status: number
  readonly statusText: string
  readonly headers: IHttpHeaders
  readonly config: IRequestConfig
}

// ============================================================================
// Error Handling Interfaces
// ============================================================================

/**
 * API Error interface
 */
export interface IApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: unknown
  readonly timestamp: Date
  readonly path?: string
  readonly requestId?: string
}

/**
 * Error Handler interface
 */
export interface IErrorHandler {
  /**
   * Handles an error
   */
  handle(error: Error, request?: IHttpRequest): IHttpResponse

  /**
   * Checks if error can be handled
   */
  canHandle(error: Error): boolean

  /**
   * Formats error response
   */
  format(error: Error): IErrorResponse
}

/**
 * Error Response
 */
export interface IErrorResponse {
  readonly error: {
    readonly code: string
    readonly message: string
    readonly details?: unknown
    readonly timestamp: string
    readonly path?: string
    readonly requestId?: string
  }
}

// ============================================================================
// Pagination and Filtering Interfaces
// ============================================================================

/**
 * Paginated Request
 */
export interface IPaginatedRequest {
  readonly page?: number
  readonly pageSize?: number
  readonly sort?: ISortOptions
  readonly filter?: IFilterOptions
}

/**
 * Paginated Response
 */
export interface IPaginatedResponse<T> {
  readonly data: T[]
  readonly pagination: IPaginationMeta
}

/**
 * Pagination Metadata
 */
export interface IPaginationMeta {
  readonly page: number
  readonly pageSize: number
  readonly totalItems: number
  readonly totalPages: number
  readonly hasNext: boolean
  readonly hasPrevious: boolean
}

/**
 * Sort Options
 */
export interface ISortOptions {
  readonly field: string
  readonly direction: 'asc' | 'desc'
}

/**
 * Filter Options
 */
export interface IFilterOptions {
  [field: string]: unknown
}

// ============================================================================
// API Documentation Interfaces
// ============================================================================

/**
 * Endpoint Documentation
 */
export interface IEndpointDocumentation {
  readonly summary: string
  readonly description: string
  readonly tags: string[]
  readonly parameters?: IParameterDoc[]
  readonly requestBody?: IRequestBodyDoc
  readonly responses: IResponseDoc[]
  readonly examples?: IExampleDoc[]
}

/**
 * Parameter Documentation
 */
export interface IParameterDoc {
  readonly name: string
  readonly in: 'path' | 'query' | 'header' | 'cookie'
  readonly description: string
  readonly required: boolean
  readonly schema: unknown
}

/**
 * Request Body Documentation
 */
export interface IRequestBodyDoc {
  readonly description: string
  readonly required: boolean
  readonly content: {
    [mediaType: string]: {
      schema: unknown
      example?: unknown
    }
  }
}

/**
 * Response Documentation
 */
export interface IResponseDoc {
  readonly status: number
  readonly description: string
  readonly content?: {
    [mediaType: string]: {
      schema: unknown
      example?: unknown
    }
  }
}

/**
 * Example Documentation
 */
export interface IExampleDoc {
  readonly name: string
  readonly description?: string
  readonly request?: unknown
  readonly response?: unknown
}

/**
 * OpenAPI Specification
 */
export interface IOpenApiSpec {
  readonly openapi: string
  readonly info: IApiInfo
  readonly servers: IServerInfo[]
  readonly paths: IPathsObject
  readonly components?: IComponentsObject
  readonly security?: ISecurityRequirement[]
  readonly tags?: ITagObject[]
}

/**
 * API Information
 */
export interface IApiInfo {
  readonly title: string
  readonly version: string
  readonly description?: string
  readonly termsOfService?: string
  readonly contact?: IContactInfo
  readonly license?: ILicenseInfo
}

/**
 * Server Information
 */
export interface IServerInfo {
  readonly url: string
  readonly description?: string
  readonly variables?: Record<string, IServerVariable>
}

/**
 * Server Variable
 */
export interface IServerVariable {
  readonly default: string
  readonly description?: string
  readonly enum?: string[]
}

/**
 * Paths Object
 */
export interface IPathsObject {
  [path: string]: IPathItemObject
}

/**
 * Path Item Object
 */
export interface IPathItemObject {
  [method: string]: IOperationObject
}

/**
 * Operation Object
 */
export interface IOperationObject {
  readonly tags?: string[]
  readonly summary?: string
  readonly description?: string
  readonly operationId?: string
  readonly parameters?: IParameterDoc[]
  readonly requestBody?: IRequestBodyDoc
  readonly responses: Record<string, IResponseDoc>
  readonly security?: ISecurityRequirement[]
  readonly deprecated?: boolean
}

/**
 * Components Object
 */
export interface IComponentsObject {
  readonly schemas?: Record<string, unknown>
  readonly responses?: Record<string, IResponseDoc>
  readonly parameters?: Record<string, IParameterDoc>
  readonly securitySchemes?: Record<string, ISecurityScheme>
}

/**
 * Security Scheme
 */
export interface ISecurityScheme {
  readonly type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect'
  readonly description?: string
  readonly name?: string
  readonly in?: 'query' | 'header' | 'cookie'
  readonly scheme?: string
  readonly bearerFormat?: string
  readonly flows?: IOAuthFlows
  readonly openIdConnectUrl?: string
}

/**
 * OAuth Flows
 */
export interface IOAuthFlows {
  readonly implicit?: IOAuthFlow
  readonly password?: IOAuthFlow
  readonly clientCredentials?: IOAuthFlow
  readonly authorizationCode?: IOAuthFlow
}

/**
 * OAuth Flow
 */
export interface IOAuthFlow {
  readonly authorizationUrl?: string
  readonly tokenUrl?: string
  readonly refreshUrl?: string
  readonly scopes: Record<string, string>
}

/**
 * Security Requirement
 */
export interface ISecurityRequirement {
  [name: string]: string[]
}

/**
 * Tag Object
 */
export interface ITagObject {
  readonly name: string
  readonly description?: string
  readonly externalDocs?: IExternalDocs
}

/**
 * External Documentation
 */
export interface IExternalDocs {
  readonly description?: string
  readonly url: string
}

/**
 * Contact Information
 */
export interface IContactInfo {
  readonly name?: string
  readonly email?: string
  readonly url?: string
}

/**
 * License Information
 */
export interface ILicenseInfo {
  readonly name: string
  readonly url?: string
}

// ============================================================================
// Service Configuration Interfaces
// ============================================================================

/**
 * CORS Options
 */
export interface ICorsOptions {
  readonly origin: string | string[] | boolean
  readonly methods: HttpMethod[]
  readonly allowedHeaders: string[]
  readonly exposedHeaders?: string[]
  readonly credentials: boolean
  readonly maxAge?: number
}

/**
 * Authentication Configuration
 */
export interface IAuthenticationConfig {
  readonly enabled: boolean
  readonly providers: IAuthProvider[]
  readonly sessionConfig?: ISessionConfig
  readonly jwtConfig?: IJwtConfig
}

/**
 * Auth Provider
 */
export interface IAuthProvider {
  readonly name: string
  readonly type: 'jwt' | 'oauth' | 'basic' | 'apikey'
  readonly config: Record<string, unknown>
}

/**
 * Session Configuration
 */
export interface ISessionConfig {
  readonly secret: string
  readonly duration: number
  readonly rolling: boolean
  readonly httpOnly: boolean
  readonly secure: boolean
  readonly sameSite?: 'strict' | 'lax' | 'none'
}

/**
 * JWT Configuration
 */
export interface IJwtConfig {
  readonly secret: string
  readonly algorithm: string
  readonly expiresIn: string
  readonly issuer?: string
  readonly audience?: string
}

/**
 * Logging Configuration
 */
export interface ILoggingConfig {
  readonly level: 'debug' | 'info' | 'warn' | 'error'
  readonly format: 'json' | 'text'
  readonly destination: 'console' | 'file' | 'remote'
  readonly includeHeaders?: boolean
  readonly includeBody?: boolean
}

/**
 * Monitoring Configuration
 */
export interface IMonitoringConfig {
  readonly enabled: boolean
  readonly metricsEndpoint?: string
  readonly healthEndpoint?: string
  readonly tracingEnabled?: boolean
  readonly samplingRate?: number
}

/**
 * Retry Configuration
 */
export interface IRetryConfig {
  readonly maxAttempts: number
  readonly initialDelay: number
  readonly maxDelay: number
  readonly backoffMultiplier: number
  readonly retryableStatuses?: number[]
}

/**
 * Cache Configuration
 */
export interface ICacheConfig {
  readonly enabled: boolean
  readonly ttl: number
  readonly maxSize: number
  readonly excludePaths?: string[]
  readonly includeQuery?: boolean
}

// ============================================================================
// Metrics and Monitoring Interfaces
// ============================================================================

/**
 * API Metrics
 */
export interface IApiMetrics {
  readonly requestCount: number
  readonly errorCount: number
  readonly averageResponseTime: number
  readonly p95ResponseTime: number
  readonly p99ResponseTime: number
  readonly activeConnections: number
  readonly throughput: number
  readonly errorRate: number
}

/**
 * Route Information
 */
export interface IRouteInfo {
  readonly path: string
  readonly method: HttpMethod
  readonly version: string
  readonly deprecated: boolean
  readonly handler: string
  readonly middleware: string[]
}

// ============================================================================
// Type Definitions
// ============================================================================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

export type AuthenticationType = 'none' | 'jwt' | 'bearer' | 'basic' | 'apikey' | 'oauth2'

export type ContentType =
  | 'application/json'
  | 'application/xml'
  | 'text/plain'
  | 'text/html'
  | 'multipart/form-data'
  | 'application/octet-stream'

// Export all interfaces as a namespace
export * as ApiInterfaces from './api.interfaces'
