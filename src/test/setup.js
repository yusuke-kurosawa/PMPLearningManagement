import '@testing-library/jest-dom'
import { beforeAll, beforeEach, afterEach, afterAll, vi, expect } from 'vitest'
import { toHaveNoViolations } from 'jest-axe'
import { cleanup } from '@testing-library/react'
// Conditionally import server only if MSW is needed
let server
try {
  const serverModule = await import('./mocks/server')
  server = serverModule.server
} catch (error) {
  console.warn('MSW server not available, skipping mock server setup')
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
