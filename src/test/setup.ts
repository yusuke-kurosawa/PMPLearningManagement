import '@testing-library/jest-dom'
import { beforeAll, beforeEach, afterEach, afterAll, vi, expect } from 'vitest'
import { toHaveNoViolations } from 'jest-axe'
import { cleanup } from '@testing-library/react'
import { logger } from '../services/logger'
// Conditionally import server only if MSW is needed
let server
try {
  const serverModule = await import('./mocks/server')
  server = serverModule.server
} catch (error) {
  if (process.env.NODE_ENV === 'development') {
    logger.warn('MSW server not available, skipping mock server setup')
  }
}

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations)

// Clean up after each test case
beforeEach(() => {
  cleanup()
})

// Start MSW server before all tests (if available)
beforeAll(() => {
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

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(() => null),
  },
  writable: true,
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(() => null),
  },
  writable: true,
})

// Mock window.ontouchstart for touch event detection
Object.defineProperty(window, 'ontouchstart', {
  value: null,
  writable: true,
})

// Mock navigator properties
Object.defineProperty(navigator, 'maxTouchPoints', {
  value: 0,
  writable: true,
})

Object.defineProperty(navigator, 'userAgent', {
  value:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  writable: true,
})

// Mock window dimensions
Object.defineProperty(window, 'innerWidth', {
  value: 1024,
  writable: true,
})

Object.defineProperty(window, 'innerHeight', {
  value: 768,
  writable: true,
})

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
