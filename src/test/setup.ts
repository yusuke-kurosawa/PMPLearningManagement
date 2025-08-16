import '@testing-library/jest-dom'
import { beforeAll, beforeEach, afterEach, afterAll, vi, expect } from 'vitest'
import { toHaveNoViolations } from 'jest-axe'
import { cleanup } from '@testing-library/react'
// Conditional logger import for ES modules
let logger = { warn: console.warn }

// Mock Supabase for tests
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      })
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }))
  }
}))

// Mock environment variables for tests
if (typeof process !== 'undefined' && process.env) {
  process.env.VITE_SUPABASE_URL = 'https://test.supabase.co'
  process.env.VITE_SUPABASE_ANON_KEY = 'test-key'
}
// Conditionally import server only if MSW is needed
let server = null

// Setup MSW server dynamically
async function setupMSWServer() {
  try {
    const { server: mswServer } = await import('./mocks/server.js')
    server = mswServer
    return server
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('MSW server not available, skipping mock server setup')
    }
    return null
  }
}

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations)

// Clean up after each test case
beforeEach(() => {
  cleanup()
})

// Start MSW server before all tests (if available)
beforeAll(async () => {
  await setupMSWServer()
  if (server) {
    server.listen()
  }
})

// Reset MSW handlers after each test
afterEach(() => {
  if (server) {
    server.resetHandlers()
  }
  // Clear all localStorage data
  if (typeof Storage !== 'undefined' && localStorage) {
    localStorage.clear()
  }
  // Clear all timers
  vi.clearAllTimers()
})

// Clean up server after all tests
afterAll(() => {
  if (server) {
    server.close()
  }
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock scrollTo
window.scrollTo = vi.fn()

// Mock D3 selection methods for visualization tests
vi.mock('d3-selection', () => ({
  select: vi.fn(() => ({
    selectAll: vi.fn(() => ({
      data: vi.fn(() => ({
        enter: vi.fn(() => ({
          append: vi.fn(() => ({
            attr: vi.fn(),
            style: vi.fn(),
            text: vi.fn(),
            on: vi.fn(),
          })),
        })),
        exit: vi.fn(() => ({
          remove: vi.fn(),
        })),
        attr: vi.fn(),
        style: vi.fn(),
        text: vi.fn(),
        on: vi.fn(),
      })),
    })),
    attr: vi.fn(),
    style: vi.fn(),
    text: vi.fn(),
    on: vi.fn(),
    append: vi.fn(),
    remove: vi.fn(),
  })),
}))
