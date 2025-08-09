import React from 'react'
import { render as rtlRender } from '@testing-library/react'
import { HashRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { ThemeProvider } from '../../contexts/ThemeContext'

// Custom render function that includes providers
function render(ui, options = {}) {
  const { initialEntries: _initialEntries = ['/'], ...renderOptions } = options

  function Wrapper({ children }) {
    return (
      <HashRouter>
        <ThemeProvider>{children}</ThemeProvider>
      </HashRouter>
    )
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions })
}

// Custom render with router history
function renderWithRouter(ui, { route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route)

  return render(ui)
}

// Mock localStorage
export const mockLocalStorage = {
  store: {},
  getItem: vi.fn((key) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key, value) => {
    mockLocalStorage.store[key] = value.toString()
  }),
  removeItem: vi.fn((key) => {
    delete mockLocalStorage.store[key]
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store = {}
  }),
}

// Mock progress service data
export const mockProgressData = {
  totalProcesses: 49,
  completedProcesses: 0,
  knowledgeAreaProgress: {
    'Integration Management': { completed: 0, total: 7 },
    'Scope Management': { completed: 0, total: 6 },
    'Schedule Management': { completed: 0, total: 6 },
    'Cost Management': { completed: 0, total: 4 },
    'Quality Management': { completed: 0, total: 3 },
    'Resource Management': { completed: 0, total: 6 },
    'Communications Management': { completed: 0, total: 3 },
    'Risk Management': { completed: 0, total: 7 },
    'Procurement Management': { completed: 0, total: 3 },
    'Stakeholder Management': { completed: 0, total: 4 },
  },
  processGroupProgress: {
    Initiating: { completed: 0, total: 2 },
    Planning: { completed: 0, total: 24 },
    Executing: { completed: 0, total: 10 },
    'Monitoring and Controlling': { completed: 0, total: 12 },
    Closing: { completed: 0, total: 1 },
  },
  studyTime: 0,
  lastStudyDate: null,
}

// Helper to create mock PMBOK process data
export const createMockProcess = (overrides = {}) => ({
  id: 'test-process',
  name: 'Test Process',
  knowledgeArea: 'Integration Management',
  processGroup: 'Planning',
  inputs: ['Test Input 1', 'Test Input 2'],
  tools: ['Test Tool 1', 'Test Tool 2'],
  outputs: ['Test Output 1', 'Test Output 2'],
  description: 'Test process description',
  ...overrides,
})

// Helper to create mock exam question
export const createMockExamQuestion = (overrides = {}) => ({
  id: 1,
  question: 'Test question?',
  options: ['Option A', 'Option B', 'Option C', 'Option D'],
  correct: 0,
  knowledgeArea: 'Integration Management',
  processGroup: 'General',
  explanation: 'Test explanation',
  ...overrides,
})

// Helper to wait for async updates
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0))

// Helper to simulate user delay (for more realistic tests)
export const userDelay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms))

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { render, renderWithRouter }
