import React, { ReactElement } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Mock contexts
const MockThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="theme-provider">{children}</div>
)

const MockProgressProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="progress-provider">{children}</div>
)

// All the providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <MockThemeProvider>
        <MockProgressProvider>{children}</MockProgressProvider>
      </MockThemeProvider>
    </BrowserRouter>
  )
}

// Custom render function
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>): RenderResult => {
  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Create a mock user event instance
export const createMockUserEvent = () => ({
  click: vi.fn(),
  type: vi.fn(),
  clear: vi.fn(),
  selectOptions: vi.fn(),
  deselectOptions: vi.fn(),
  tab: vi.fn(),
  hover: vi.fn(),
  unhover: vi.fn(),
  upload: vi.fn(),
  keyboard: vi.fn(),
})

// Mock data generators
export const mockProgressData = () => ({
  knowledgeAreas: {
    integration: { totalProcesses: 7, completedProcesses: 3, completionRate: 43 },
    scope: { totalProcesses: 6, completedProcesses: 6, completionRate: 100 },
    schedule: { totalProcesses: 6, completedProcesses: 2, completionRate: 33 },
    cost: { totalProcesses: 4, completedProcesses: 1, completionRate: 25 },
    quality: { totalProcesses: 3, completedProcesses: 0, completionRate: 0 },
    resource: { totalProcesses: 6, completedProcesses: 4, completionRate: 67 },
    communications: { totalProcesses: 3, completedProcesses: 2, completionRate: 67 },
    risk: { totalProcesses: 7, completedProcesses: 5, completionRate: 71 },
    procurement: { totalProcesses: 3, completedProcesses: 1, completionRate: 33 },
    stakeholder: { totalProcesses: 4, completedProcesses: 2, completionRate: 50 },
  },
  processGroups: {
    initiating: { totalProcesses: 2, completedProcesses: 1, completionRate: 50 },
    planning: { totalProcesses: 24, completedProcesses: 12, completionRate: 50 },
    executing: { totalProcesses: 10, completedProcesses: 5, completionRate: 50 },
    monitoring: { totalProcesses: 12, completedProcesses: 6, completionRate: 50 },
    closing: { totalProcesses: 1, completedProcesses: 1, completionRate: 100 },
  },
  totalStudyTime: 3600, // seconds
  lastStudyDate: new Date().toISOString(),
  completedProcesses: 26,
  totalProcesses: 49,
})

export const mockExamQuestion = () => ({
  id: 1,
  question: 'Which process group contains the most processes?',
  options: ['Initiating', 'Planning', 'Executing', 'Monitoring and Controlling'],
  correctAnswer: 1, // Planning
  explanation:
    'Planning process group contains 24 out of 49 processes, making it the largest process group.',
  knowledgeArea: 'integration',
  difficulty: 'medium',
  tags: ['process-groups', 'planning'],
})

// Utility functions for testing
export const waitForElementToBeRemoved = async (element: HTMLElement) => {
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (!document.contains(element)) {
        observer.disconnect()
        resolve(void 0)
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
  })
}

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }
