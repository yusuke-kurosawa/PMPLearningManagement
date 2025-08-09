import { vi } from 'vitest'
import { createMocks, RequestMethod } from 'node-mocks-http'
import { TRPCError } from '@trpc/server'
import superjson from 'superjson'

// API test utilities
export function createMockRequest(options?: any) {
  const { req, res } = createMocks({
    method: options?.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    query: options?.query || {},
    body: options?.body || {},
    params: options?.params || {},
    ...options,
  })

  return { req, res }
}

// tRPC test context
export function createTestContext(overrides?: any) {
  return {
    session: null,
    prisma: mockPrismaClient(),
    req: createMockRequest().req,
    res: createMockRequest().res,
    ...overrides,
  }
}

// Mock tRPC caller
export function createMockCaller(router: any, context?: any) {
  const ctx = createTestContext(context)
  return router.createCaller(ctx)
}

// API response factory
export class ApiResponse<T = any> {
  constructor(
    public data: T,
    public status: number = 200,
    public headers: Record<string, string> = {}
  ) {}

  static success<T>(data: T, status = 200) {
    return new ApiResponse(data, status)
  }

  static error(message: string, status = 400, code?: string) {
    return new ApiResponse({ error: { message, code } }, status)
  }

  static notFound(message = 'Resource not found') {
    return this.error(message, 404, 'NOT_FOUND')
  }

  static unauthorized(message = 'Unauthorized') {
    return this.error(message, 401, 'UNAUTHORIZED')
  }

  static forbidden(message = 'Forbidden') {
    return this.error(message, 403, 'FORBIDDEN')
  }

  static badRequest(message = 'Bad request') {
    return this.error(message, 400, 'BAD_REQUEST')
  }

  static serverError(message = 'Internal server error') {
    return this.error(message, 500, 'INTERNAL_SERVER_ERROR')
  }
}

// Mock fetch for API calls
export function mockApiCall(endpoint: string, response: any, status = 200) {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url.includes(endpoint)) {
      return Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(response),
        text: () => Promise.resolve(JSON.stringify(response)),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      })
    }
    return Promise.reject(new Error('Endpoint not mocked'))
  })
}

// tRPC error factory
export function createTRPCError(
  code: 'BAD_REQUEST' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'INTERNAL_SERVER_ERROR',
  message: string,
  cause?: any
) {
  return new TRPCError({
    code,
    message,
    cause,
  })
}

// Request validator
export class RequestValidator {
  private errors: string[] = []

  validateRequired(data: any, fields: string[]) {
    fields.forEach((field) => {
      if (!data[field]) {
        this.errors.push(`Field "${field}" is required`)
      }
    })
    return this
  }

  validateEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      this.errors.push('Invalid email format')
    }
    return this
  }

  validateLength(value: string, field: string, min?: number, max?: number) {
    if (min && value.length < min) {
      this.errors.push(`${field} must be at least ${min} characters`)
    }
    if (max && value.length > max) {
      this.errors.push(`${field} must be at most ${max} characters`)
    }
    return this
  }

  validateEnum(value: any, field: string, validValues: any[]) {
    if (!validValues.includes(value)) {
      this.errors.push(`${field} must be one of: ${validValues.join(', ')}`)
    }
    return this
  }

  hasErrors() {
    return this.errors.length > 0
  }

  getErrors() {
    return this.errors
  }

  throwIfErrors() {
    if (this.hasErrors()) {
      throw createTRPCError('BAD_REQUEST', this.errors.join(', '))
    }
  }
}

// Rate limiter mock
export class MockRateLimiter {
  private requests = new Map<string, number[]>()
  private limit: number
  private windowMs: number

  constructor(limit = 10, windowMs = 60000) {
    this.limit = limit
    this.windowMs = windowMs
  }

  check(identifier: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []

    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < this.windowMs)

    if (validRequests.length >= this.limit) {
      return false
    }

    validRequests.push(now)
    this.requests.set(identifier, validRequests)
    return true
  }

  reset(identifier?: string) {
    if (identifier) {
      this.requests.delete(identifier)
    } else {
      this.requests.clear()
    }
  }
}

// Pagination helper
export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function paginate<T>(
  data: T[],
  options: PaginationOptions = {}
): {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
} {
  const page = options.page || 1
  const limit = options.limit || 10
  const start = (page - 1) * limit
  const end = start + limit

  // Sort if needed
  let sorted = [...data]
  if (options.sortBy) {
    sorted.sort((a: any, b: any) => {
      const aVal = a[options.sortBy!]
      const bVal = b[options.sortBy!]

      if (options.sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1
      }
      return aVal > bVal ? 1 : -1
    })
  }

  const paginated = sorted.slice(start, end)
  const total = data.length
  const totalPages = Math.ceil(total / limit)

  return {
    data: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}

// Mock WebSocket
export class MockWebSocket {
  private listeners = new Map<string, Function[]>()
  public readyState = 1 // OPEN

  addEventListener(event: string, handler: Function) {
    const handlers = this.listeners.get(event) || []
    handlers.push(handler)
    this.listeners.set(event, handlers)
  }

  removeEventListener(event: string, handler: Function) {
    const handlers = this.listeners.get(event) || []
    const index = handlers.indexOf(handler)
    if (index > -1) {
      handlers.splice(index, 1)
    }
  }

  send(data: any) {
    // Mock send
  }

  close() {
    this.readyState = 3 // CLOSED
    this.emit('close', {})
  }

  emit(event: string, data: any) {
    const handlers = this.listeners.get(event) || []
    handlers.forEach((handler) => handler(data))
  }

  mockMessage(data: any) {
    this.emit('message', { data: JSON.stringify(data) })
  }

  mockError(error: any) {
    this.emit('error', error)
  }
}

// Mock server-sent events
export class MockEventSource {
  private listeners = new Map<string, Function[]>()
  public readyState = 1 // OPEN

  addEventListener(event: string, handler: Function) {
    const handlers = this.listeners.get(event) || []
    handlers.push(handler)
    this.listeners.set(event, handlers)
  }

  removeEventListener(event: string, handler: Function) {
    const handlers = this.listeners.get(event) || []
    const index = handlers.indexOf(handler)
    if (index > -1) {
      handlers.splice(index, 1)
    }
  }

  close() {
    this.readyState = 2 // CLOSED
  }

  emit(event: string, data: any) {
    const handlers = this.listeners.get(event) || []
    handlers.forEach((handler) => handler(data))
  }

  mockMessage(data: any, eventType = 'message') {
    this.emit(eventType, { data: JSON.stringify(data) })
  }
}

// Export mock Prisma client from db utils
import { mockPrismaClient } from './db'
