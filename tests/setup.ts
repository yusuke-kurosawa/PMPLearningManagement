import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll, vi } from 'vitest'
import { server } from './mocks/server'

// MSW設定
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  vi.clearAllMocks()
  vi.clearAllTimers()
  localStorage.clear()
  sessionStorage.clear()
})

afterAll(() => {
  server.close()
  vi.restoreAllMocks()
})

// グローバルモック
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: () => [],
}))

global.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}))

// Crypto API mock
global.crypto = {
  randomUUID: () => '123e4567-e89b-12d3-a456-426614174000',
  getRandomValues: (arr: any) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256)
    }
    return arr
  },
  subtle: {} as any,
}

// Next.js Router mock
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    route: '/',
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    getAll: vi.fn(),
    has: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
    entries: vi.fn(),
    forEach: vi.fn(),
    toString: vi.fn(),
  }),
  usePathname: () => '/',
  useParams: () => ({}),
  notFound: vi.fn(),
  redirect: vi.fn(),
}))

// Environment variables
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.STRIPE_SECRET_KEY = 'sk_test_1234567890'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_1234567890'
process.env.SMTP_HOST = 'smtp.test.com'
process.env.SMTP_PORT = '587'
process.env.SMTP_USER = 'test@test.com'
process.env.SMTP_PASS = 'test-password'

// Date mock
vi.useFakeTimers()
vi.setSystemTime(new Date('2025-01-09'))
