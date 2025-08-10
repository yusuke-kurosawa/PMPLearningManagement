# Testing Documentation

<!-- Consolidated on: 2025-08-09T15:12:24.904Z -->
<!-- Source files: TEST_PLAN.md, TEST_PLAN.md -->

## Table of Contents

1. [TEST PLAN](#test-plan)
2. [TEST PLAN](#test-plan)

---

## TEST PLAN

_Source: `docs/testing/TEST_PLAN.md`_

## Document Version

- **Version**: 1.0.0
- **Date**: 2025-08-09
- **Status**: Draft
- **Author**: Test Automation Team

## Executive Summary

This comprehensive test plan outlines the testing strategy, approach, and implementation roadmap for the PMPLearningManagement application. The plan covers unit testing, integration testing, end-to-end testing, performance testing, and accessibility testing to ensure the application meets quality standards and provides a reliable learning experience for PMP certification candidates.

## 1. Test Strategy Overview

### 1.1 Testing Objectives

- **Quality Assurance**: Ensure all features work as designed and meet user requirements
- **Regression Prevention**: Catch bugs early in the development cycle
- **Performance Validation**: Verify application performs well across different devices and networks
- **Accessibility Compliance**: Ensure the application is usable by all users
- **User Experience**: Validate smooth user journeys and interactions
- **Data Integrity**: Ensure learning progress and user data are properly managed

### 1.2 Testing Scope

#### In Scope

- All React components and their interactions
- D3.js visualizations and their performance
- LocalStorage data persistence
- Navigation and routing functionality
- Learning features (mock exams, flashcards, progress tracking)
- Search and filtering capabilities
- Responsive design across devices
- Browser compatibility
- Accessibility standards compliance

#### Out of Scope

- Third-party library internal testing
- Browser engine bugs
- Network infrastructure testing
- Backend API testing (future scope)

### 1.3 Testing Approach

```
Test Pyramid Structure:
         /\
        /E2E\        (10% - Critical user journeys)
       /------\
      /Integration\   (30% - Component interactions)
     /------------\
    /  Unit Tests  \  (60% - Component and utility testing)
   /----------------\
```

### 1.4 Test Automation Strategy

- **Phase 1** (Weeks 1-2): Setup testing infrastructure and unit test framework
- **Phase 2** (Weeks 3-4): Implement critical unit tests (80% coverage target)
- **Phase 3** (Weeks 5-6): Add integration tests for key workflows
- **Phase 4** (Weeks 7-8): Implement E2E tests for critical paths
- **Phase 5** (Ongoing): Performance and accessibility testing

### 1.5 Risk-Based Testing Priorities

| Priority | Feature                    | Risk Level | Impact                       |
| -------- | -------------------------- | ---------- | ---------------------------- |
| P0       | Mock Exam System           | High       | Critical for user value      |
| P0       | Learning Progress Tracking | High       | Data loss impacts user trust |
| P1       | PMBOK Matrix View          | Medium     | Core feature functionality   |
| P1       | D3.js Visualizations       | Medium     | Performance and usability    |
| P2       | Flashcards                 | Low        | Isolated feature             |
| P2       | Glossary                   | Low        | Reference feature            |

## 2. Test Environment Setup

### 2.1 Development Environment Testing

```javascript
// Recommended development testing setup
{
  "test": {
    "framework": "vitest",
    "coverage": "v8",
    "environment": "jsdom",
    "setupFiles": ["./src/test/setup.js"],
    "globals": true
  },
  "playwrightMcp": {
    "mcpServer": {
      "enabled": true,
      "port": 3001,
      "aiModel": "claude-3-sonnet",
      "testGeneration": true,
      "smartLocators": true
    },
    "browsers": ["chromium", "firefox", "webkit"],
    "baseURL": "http://localhost:3000",
    "testDir": "./tests/e2e",
    "timeout": 30000,
    "retries": 2
  }
}
```

### 2.2 Staging Environment Requirements

- **URL**: Deploy preview branches to Vercel/Netlify for testing
- **Data**: Use test data fixtures separate from production
- **Access**: Restricted to QA team and stakeholders
- **Refresh**: Daily deployment of main branch

### 2.3 Production Testing Considerations

- Smoke tests only (no data modification)
- Monitor using Real User Monitoring (RUM)
- Synthetic monitoring for critical paths
- Error tracking with Sentry or similar

### 2.4 Browser and Device Matrix

| Browser       | Versions    | Priority | Coverage |
| ------------- | ----------- | -------- | -------- |
| Chrome        | Latest 2    | P0       | 100%     |
| Safari        | Latest 2    | P0       | 100%     |
| Firefox       | Latest 2    | P1       | 90%      |
| Edge          | Latest 2    | P1       | 90%      |
| Mobile Safari | iOS 15+     | P0       | 100%     |
| Chrome Mobile | Android 10+ | P0       | 100%     |

**Device Testing Matrix:**

- Desktop: 1920x1080, 1366x768
- Tablet: iPad, Android tablets
- Mobile: iPhone 12+, Samsung Galaxy S20+

## 3. Unit Testing Plan

### 3.1 React Component Testing Strategy

```javascript
// Example component test structure
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import FlashCard from '../components/FlashCard'

describe('FlashCard Component', () => {
  it('should flip card on click', () => {
    const mockProcess = {
      name: 'Develop Project Charter',
      knowledgeArea: 'Integration Management',
      processGroup: 'Initiating',
    }

    render(<FlashCard process={mockProcess} />)
    const card = screen.getByRole('button')

    expect(card).toHaveClass('front-face')
    fireEvent.click(card)
    expect(card).toHaveClass('back-face')
  })
})
```

### 3.2 Service and Utility Function Testing

```javascript
// Service testing example
import { progressService } from '../services/progressService'

describe('Progress Service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should save and retrieve progress', () => {
    const progress = { processId: '1.1', completed: true }
    progressService.saveProgress(progress)

    const retrieved = progressService.getProgress('1.1')
    expect(retrieved.completed).toBe(true)
  })
})
```

### 3.3 Test Framework Selection

**Recommended: Vitest**

- Fast execution with Vite integration
- Jest-compatible API
- Built-in coverage reporting
- ESM support out of the box

**Alternative: Jest with React Testing Library**

- Mature ecosystem
- Extensive documentation
- Snapshot testing support

### 3.4 Coverage Targets and Metrics

| Metric             | Target | Minimum |
| ------------------ | ------ | ------- |
| Line Coverage      | 85%    | 80%     |
| Branch Coverage    | 80%    | 75%     |
| Function Coverage  | 90%    | 85%     |
| Statement Coverage | 85%    | 80%     |

### 3.5 Mock Data Strategies

```javascript
// Mock data factory pattern
export const mockFactory = {
  createProcess: (overrides = {}) => ({
    id: '1.1',
    name: 'Develop Project Charter',
    knowledgeArea: 'Integration Management',
    processGroup: 'Initiating',
    inputs: ['Business Case', 'Agreements'],
    tools: ['Expert Judgment', 'Data Gathering'],
    outputs: ['Project Charter', 'Assumption Log'],
    ...overrides,
  }),

  createMockExamQuestion: (overrides = {}) => ({
    id: 'q001',
    question: 'What is the primary output of...',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 'A',
    knowledgeArea: 'Integration Management',
    difficulty: 'medium',
    ...overrides,
  }),
}
```

## 4. Integration Testing Plan

### 4.1 Component Integration Testing

```javascript
// Integration test example
describe('Learning Progress Dashboard Integration', () => {
  it('should update progress when completing a flashcard', async () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <LearningProgressDashboard />
        <FlashCardLearning />
      </BrowserRouter>
    )

    // Complete a flashcard
    const flashcard = getByTestId('flashcard-1.1')
    fireEvent.click(flashcard)
    fireEvent.click(getByTestId('mark-complete'))

    // Check dashboard updates
    await waitFor(() => {
      const progressBar = getByTestId('progress-integration')
      expect(progressBar).toHaveAttribute('aria-valuenow', '1')
    })
  })
})
```

### 4.2 Data Flow Testing

- LocalStorage read/write operations
- Component state synchronization
- Cross-component communication
- Event propagation

### 4.3 State Management Testing

```javascript
describe('State Management', () => {
  it('should persist state across page refreshes', () => {
    // Set initial state
    progressService.updateProgress('1.1', { completed: true })

    // Simulate page refresh
    window.location.reload()

    // Verify state persistence
    const state = progressService.getProgress('1.1')
    expect(state.completed).toBe(true)
  })
})
```

### 4.4 API Integration Testing (Future)

```javascript
// Future API integration test structure
describe('API Integration', () => {
  it('should sync local progress with backend', async () => {
    const mockApi = vi.fn().mockResolvedValue({ success: true })

    await syncProgress(mockApi)

    expect(mockApi).toHaveBeenCalledWith({
      endpoint: '/api/progress',
      method: 'POST',
      data: expect.any(Object),
    })
  })
})
```

## 5. End-to-End Testing Plan with PlaywrightMCP

### 5.1 PlaywrightMCP Setup and Configuration

#### MCP Server Configuration

```javascript
// playwright-mcp.config.js
import { defineConfig } from '@playwright/test'
import { mcpConfig } from './mcp.config.js'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 2,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // PlaywrightMCP specific configuration
  mcp: {
    server: {
      enabled: true,
      port: 3001,
      aiModel: 'claude-3-sonnet',
      capabilities: {
        testGeneration: true,
        smartLocators: true,
        intelligentWaits: true,
        failureAnalysis: true,
        testDataGeneration: true,
      },
    },

    // AI-enhanced testing features
    aiFeatures: {
      smartElementSelection: true,
      predictiveAssertions: true,
      dynamicTestGeneration: true,
      contextAwareDebugging: true,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
})
```

#### MCP Server Setup

```javascript
// mcp.config.js
export const mcpConfig = {
  server: {
    name: 'pmp-learning-test-server',
    version: '1.0.0',
    description: 'MCP server for PMP Learning Management testing',

    tools: [
      {
        name: 'generate_test_data',
        description: 'Generate realistic test data for PMP learning scenarios',
        inputSchema: {
          type: 'object',
          properties: {
            dataType: { type: 'string', enum: ['progress', 'exam', 'flashcards'] },
            count: { type: 'number', minimum: 1, maximum: 1000 },
          },
        },
      },
      {
        name: 'smart_locator',
        description: 'Generate intelligent locators using AI analysis',
        inputSchema: {
          type: 'object',
          properties: {
            element: { type: 'string' },
            context: { type: 'string' },
            fallbacks: { type: 'boolean', default: true },
          },
        },
      },
      {
        name: 'analyze_failure',
        description: 'Analyze test failures and suggest fixes',
        inputSchema: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            screenshot: { type: 'string' },
            domSnapshot: { type: 'string' },
          },
        },
      },
    ],
  },
}
```

### 5.2 AI-Enhanced User Journey Testing

#### Critical Path 1: Complete Mock Exam with PlaywrightMCP

```javascript
// PlaywrightMCP E2E test example
import { test, expect } from '@playwright/test'
import { mcpHelpers } from '../utils/mcp-helpers'

test('Complete mock exam journey with MCP enhancements', async ({ page, mcp }) => {
  // Generate realistic test data using MCP
  const testData = await mcp.generateTestData({
    dataType: 'exam',
    scenario: 'mock-exam-completion',
    userProfile: 'intermediate-learner',
  })

  // Seed the application with test data
  await mcpHelpers.seedTestData(page, testData)

  await page.goto('/mock-exam')

  // Use AI-powered smart locators
  const startButton = await mcp.smartLocator({
    element: 'start exam button',
    context: 'mock exam page',
    fallbacks: true,
  })

  await startButton.click()

  // AI-assisted answer selection with realistic patterns
  for (let i = 0; i < 180; i++) {
    // MCP analyzes question content and generates realistic answers
    const questionData = await mcp.analyzeElement({
      selector: '[data-testid="current-question"]',
      context: 'exam-question',
    })

    // Intelligent answer selection based on question analysis
    const answerChoice = await mcp.selectOptimalAnswer({
      question: questionData,
      userProfile: testData.userProfile,
      strategy: 'realistic-test-taker',
    })

    await page.click(`[data-testid="option-${answerChoice}"]`)

    // Smart wait for next question with MCP intelligence
    await mcp.intelligentWait({
      condition: 'question-loaded',
      timeout: 5000,
      fallback: '[data-testid="next-question"]',
    })

    await page.click('[data-testid="next-question"]')
  }

  // Submit exam with AI-powered verification
  await page.click('[data-testid="submit-exam"]')

  // Enhanced result verification with MCP
  const resultValidation = await mcp.validateResults({
    expectedElements: ['exam-score', 'knowledge-area-breakdown'],
    context: 'exam-results',
    aiValidation: true,
  })

  expect(resultValidation.isValid).toBe(true)

  // AI-powered screenshot comparison
  await expect(page).toHaveScreenshot('exam-results.png', {
    mcpComparison: true,
    threshold: 0.2,
  })
})
```

#### Critical Path 2: Study with Flashcards using PlaywrightMCP

```javascript
test('AI-enhanced flashcard study session', async ({ page, mcp }) => {
  // Generate personalized study session data
  const studyData = await mcp.generateTestData({
    dataType: 'flashcards',
    scenario: 'focused-study-session',
    knowledgeArea: 'Integration Management',
    difficulty: 'adaptive',
  })

  await page.goto('/flashcards')

  // AI-powered knowledge area selection
  const filterLocator = await mcp.smartLocator({
    element: 'knowledge area filter dropdown',
    context: 'flashcard-study-page',
    semanticSearch: true,
  })

  await filterLocator.selectOption('Integration Management')

  // MCP-enhanced study loop with realistic learning patterns
  for (let i = 0; i < 10; i++) {
    // Analyze current flashcard content for context
    const cardAnalysis = await mcp.analyzeElement({
      selector: '[data-testid="current-flashcard"]',
      analysisType: 'content-understanding',
    })

    // Smart card interaction timing based on content complexity
    const flipTiming = await mcp.calculateOptimalTiming({
      content: cardAnalysis,
      userSpeed: 'normal',
      learningPhase: 'initial-review',
    })

    await page.click('[data-testid="flip-card"]')

    // AI-determined reading time
    await page.waitForTimeout(flipTiming.readingTime)

    // Simulate realistic study behavior
    if (cardAnalysis.difficulty === 'high') {
      // Extra time for difficult cards
      await page.waitForTimeout(2000)
    }

    await page.click('[data-testid="next-card"]')

    // Intelligent wait for card transition
    await mcp.waitForTransition({
      type: 'card-flip-animation',
      timeout: 3000,
    })
  }

  // Navigate to progress with MCP validation
  await page.goto('/progress')

  // AI-enhanced progress validation
  const progressValidation = await mcp.validateProgress({
    expectedIncrease: true,
    knowledgeArea: 'Integration Management',
    studySession: studyData.sessionId,
  })

  expect(progressValidation.progressIncreased).toBe(true)
  expect(progressValidation.sessionRecorded).toBe(true)
})
```

### 5.2 Critical Path Testing

| Test Case               | Priority | Automated |
| ----------------------- | -------- | --------- |
| Complete Mock Exam      | P0       | Yes       |
| Study Flashcards        | P0       | Yes       |
| View PMBOK Matrix       | P0       | Yes       |
| Track Learning Progress | P0       | Yes       |
| Search Glossary         | P1       | Yes       |
| Export Progress Data    | P1       | Yes       |
| Navigate Visualizations | P2       | Partial   |

### 5.3 E2E Framework Selection

**Recommended: PlaywrightMCP**

- All benefits of Playwright with MCP (Model Context Protocol) enhancements
- AI-assisted test generation and maintenance
- Intelligent test scenario creation
- Enhanced debugging with MCP server integration
- Cross-browser support with smart test optimization
- Auto-wait functionality with intelligent element detection
- MCP-powered test data generation
- Advanced failure analysis and recovery

**Benefits over Regular Playwright:**

- **AI-Powered Testing**: Leverages MCP for intelligent test creation
- **Smart Test Maintenance**: Automatically adapts to UI changes
- **Enhanced Reporting**: Rich analytics through MCP integration
- **Intelligent Locators**: AI-driven element identification
- **Predictive Testing**: Identifies potential failure points

**Alternative: Cypress**

- Real-time browser preview
- Time-travel debugging
- Strong community
- Component testing support
- Less AI integration compared to PlaywrightMCP

### 5.4 PlaywrightMCP Test Data Management

```javascript
// MCP-enhanced test data seeding
export class MCPTestDataManager {
  constructor(mcpClient) {
    this.mcp = mcpClient
  }

  async seedTestData(page, scenario) {
    // Generate intelligent test data based on scenario
    const testData = await this.mcp.generateTestData({
      scenario,
      complexity: 'realistic',
      userBehaviorPattern: 'typical-pmp-student',
      dataVolume: 'moderate',
    })

    await page.evaluate((data) => {
      // Seed with AI-generated realistic data
      localStorage.setItem('pmp-progress', JSON.stringify(data.progress))
      localStorage.setItem('pmp-preferences', JSON.stringify(data.preferences))
      localStorage.setItem('pmp-study-history', JSON.stringify(data.studyHistory))
    }, testData)

    return testData
  }

  async generateUserScenario(userType) {
    return await this.mcp.callTool('generate_user_scenario', {
      userType,
      includeProgressHistory: true,
      includeStudyPatterns: true,
      generateRealisticTimings: true,
    })
  }

  async cleanupTestData(page) {
    await page.evaluate(() => {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('pmp-')) {
          localStorage.removeItem(key)
        }
      })
    })
  }
}

// MCP Smart Locators
export class MCPSmartLocators {
  constructor(mcpClient) {
    this.mcp = mcpClient
  }

  async getSmartLocator(page, description, options = {}) {
    const locatorData = await this.mcp.callTool('smart_locator', {
      element: description,
      context: options.context || 'general',
      fallbacks: options.fallbacks !== false,
      semanticSearch: options.semanticSearch || false,
      accessibility: options.accessibility || true,
    })

    // Try primary locator first
    try {
      const element = await page.locator(locatorData.primary)
      if ((await element.count()) > 0) {
        return element
      }
    } catch (error) {
      // Try fallback locators
      for (const fallback of locatorData.fallbacks) {
        try {
          const element = await page.locator(fallback)
          if ((await element.count()) > 0) {
            return element
          }
        } catch (fallbackError) {
          continue
        }
      }
    }

    throw new Error(`Could not locate element: ${description}`)
  }
}
```

## 6. Performance Testing Plan

### 6.1 Load Time Testing

**Target Metrics:**
| Metric | Target | Maximum |
|--------|--------|---------|
| First Contentful Paint (FCP) | < 1.5s | 2.5s |
| Largest Contentful Paint (LCP) | < 2.5s | 4.0s |
| Time to Interactive (TTI) | < 3.5s | 5.0s |
| Cumulative Layout Shift (CLS) | < 0.1 | 0.25 |
| First Input Delay (FID) | < 100ms | 300ms |

### 6.2 Rendering Performance Testing

```javascript
// Performance test for D3.js visualizations
describe('D3.js Performance', () => {
  it('should render network diagram within 2 seconds', async () => {
    const startTime = performance.now()

    render(<ITTOForceGraph processes={mockProcesses} />)

    await waitFor(() => {
      const nodes = screen.getAllByRole('circle')
      expect(nodes.length).toBeGreaterThan(0)
    })

    const renderTime = performance.now() - startTime
    expect(renderTime).toBeLessThan(2000)
  })
})
```

### 6.3 Memory Leak Detection

```javascript
// Memory leak detection script
const puppeteer = require('puppeteer')

async function detectMemoryLeaks() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  // Initial memory snapshot
  await page.goto('http://localhost:3000')
  const metrics1 = await page.metrics()

  // Perform actions
  for (let i = 0; i < 100; i++) {
    await page.click('[data-testid="navigate-matrix"]')
    await page.click('[data-testid="navigate-network"]')
  }

  // Final memory snapshot
  const metrics2 = await page.metrics()

  // Check for significant memory increase
  const memoryIncrease = metrics2.JSHeapUsedSize - metrics1.JSHeapUsedSize
  console.log(`Memory increase: ${memoryIncrease / 1024 / 1024}MB`)

  await browser.close()
}
```

### 6.4 Lighthouse CI Integration

```yaml
name: Lighthouse CI
on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/matrix
            http://localhost:3000/mock-exam
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### 6.5 Bundle Size Monitoring

```javascript
// vite.config.js addition
import { visualizer } from 'rollup-plugin-visualizer'

export default {
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          d3: ['d3', 'd3-sankey'],
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
}
```

## 7. Accessibility Testing

### 7.1 WCAG 2.1 Compliance Testing

**Level AA Requirements:**

- Color contrast ratio: 4.5:1 for normal text, 3:1 for large text
- Keyboard navigation for all interactive elements
- Screen reader compatibility
- Focus indicators visible
- Alternative text for images
- Proper heading hierarchy
- Form labels and instructions

### 7.2 Screen Reader Testing

```javascript
// Accessibility test example
describe('Accessibility', () => {
  it('should have proper ARIA labels', () => {
    const { getByRole } = render(<MockExam />)

    expect(getByRole('button', { name: /start exam/i })).toBeInTheDocument()
    expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow')
    expect(getByRole('timer')).toHaveAttribute('aria-live', 'polite')
  })

  it('should be keyboard navigable', () => {
    const { getByTestId } = render(<FlashCardLearning />)

    const card = getByTestId('flashcard')
    card.focus()

    fireEvent.keyDown(card, { key: 'Enter' })
    expect(card).toHaveClass('flipped')
  })
})
```

### 7.3 Keyboard Navigation Testing

| Component  | Tab Order                        | Keyboard Shortcuts            |
| ---------- | -------------------------------- | ----------------------------- |
| Navigation | Sequential                       | Alt+N for menu                |
| Mock Exam  | Questions → Options → Navigation | Space to select               |
| Flashcards | Card → Controls                  | Space to flip, Arrow for next |
| Matrix     | Cells → Expand buttons           | Enter to expand               |

### 7.4 Color Contrast Validation

```javascript
// Automated contrast testing with axe-core
import { axe } from 'jest-axe'

describe('Color Contrast', () => {
  it('should meet WCAG AA standards', async () => {
    const { container } = render(<App />)
    const results = await axe(container)

    expect(results).toHaveNoViolations()
  })
})
```

## 8. Mobile Testing

### 8.1 Responsive Design Testing

```javascript
// Responsive testing with different viewports
const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1920, height: 1080 },
]

viewports.forEach((viewport) => {
  test(`Renders correctly on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')

    await expect(page).toHaveScreenshot(`home-${viewport.name}.png`)
  })
})
```

### 8.2 Touch Interaction Testing

```javascript
test('Touch gestures on flashcards', async ({ page }) => {
  await page.goto('/flashcards')

  const card = await page.locator('[data-testid="flashcard"]')

  // Simulate swipe
  await card.dispatchEvent('touchstart', { touches: [{ x: 100, y: 100 }] })
  await card.dispatchEvent('touchmove', { touches: [{ x: 200, y: 100 }] })
  await card.dispatchEvent('touchend')

  // Verify card moved to next
  await expect(page.locator('[data-testid="card-index"]')).toHaveText('2')
})
```

### 8.3 Mobile Browser Compatibility

| Browser          | iOS Version | Android Version | Testing Priority |
| ---------------- | ----------- | --------------- | ---------------- |
| Safari           | 15+         | N/A             | P0               |
| Chrome           | Latest      | 10+             | P0               |
| Firefox          | Latest      | 10+             | P2               |
| Samsung Internet | N/A         | Latest          | P2               |

### 8.4 PlaywrightMCP Mobile Performance Testing

```javascript
// MCP-enhanced mobile performance testing
import { test, expect } from '@playwright/test'

test('Mobile performance with PlaywrightMCP', async ({ page, mcp }) => {
  // Set mobile viewport with MCP optimization
  await page.setViewportSize({ width: 375, height: 667 })

  // Start performance monitoring with MCP
  const performanceMonitor = await mcp.startPerformanceMonitoring({
    device: 'mobile',
    network: '3G',
    metrics: ['FCP', 'LCP', 'TTI', 'CLS', 'FID'],
  })

  await page.goto('/')

  // AI-powered performance analysis
  const analysis = await performanceMonitor.analyze()

  // MCP performance budget validation
  const budgetValidation = await mcp.validatePerformanceBudget({
    actual: analysis.metrics,
    budget: {
      bundleSize: '500KB',
      firstLoad: '3s',
      subsequentLoad: '1s',
      dataUsage: '2MB per session',
    },
    device: 'mobile',
  })

  expect(budgetValidation.passed).toBe(true)

  // Generate performance recommendations
  const recommendations = await mcp.generatePerformanceRecommendations({
    analysis,
    targetDevice: 'mobile',
    priority: 'user-experience',
  })

  console.log('MCP Performance Recommendations:', recommendations)
})
```

## 9. Test Cases by Feature

### 9.1 PMBOK Matrix Functionality

| Test Case ID | Description              | Priority | Automated |
| ------------ | ------------------------ | -------- | --------- |
| MAT-001      | Display all 49 processes | P0       | Yes       |
| MAT-002      | Filter by knowledge area | P0       | Yes       |
| MAT-003      | Filter by process group  | P0       | Yes       |
| MAT-004      | Search processes         | P0       | Yes       |
| MAT-005      | Expand/collapse details  | P1       | Yes       |
| MAT-006      | View ITTO information    | P1       | Yes       |
| MAT-007      | Mobile horizontal scroll | P1       | Yes       |
| MAT-008      | Keyboard navigation      | P2       | Yes       |

### 9.2 D3.js Visualizations

| Test Case ID | Description               | Priority | Automated |
| ------------ | ------------------------- | -------- | --------- |
| VIZ-001      | Render force graph        | P0       | Yes       |
| VIZ-002      | Node interactions         | P0       | Yes       |
| VIZ-003      | Zoom and pan              | P1       | Yes       |
| VIZ-004      | Layout switching          | P1       | Yes       |
| VIZ-005      | Color theme changes       | P2       | Yes       |
| VIZ-006      | Export to SVG             | P2       | No        |
| VIZ-007      | Performance with 49 nodes | P0       | Yes       |

### 9.3 Mock Exam System

| Test Case ID | Description                   | Priority | Automated |
| ------------ | ----------------------------- | -------- | --------- |
| EXAM-001     | Start exam with 180 questions | P0       | Yes       |
| EXAM-002     | Timer countdown (230 minutes) | P0       | Yes       |
| EXAM-003     | Pause and resume              | P0       | Yes       |
| EXAM-004     | Question navigation           | P0       | Yes       |
| EXAM-005     | Bookmark questions            | P1       | Yes       |
| EXAM-006     | Submit incomplete exam        | P1       | Yes       |
| EXAM-007     | Calculate score               | P0       | Yes       |
| EXAM-008     | Display results breakdown     | P0       | Yes       |
| EXAM-009     | Save exam history             | P1       | Yes       |

### 9.4 Flashcard Functionality

| Test Case ID | Description                 | Priority | Automated |
| ------------ | --------------------------- | -------- | --------- |
| FLASH-001    | Display process information | P0       | Yes       |
| FLASH-002    | 3D flip animation           | P1       | Yes       |
| FLASH-003    | Navigate between cards      | P0       | Yes       |
| FLASH-004    | Filter by knowledge area    | P1       | Yes       |
| FLASH-005    | Filter by process group     | P1       | Yes       |
| FLASH-006    | Mark as learned             | P1       | Yes       |
| FLASH-007    | Shuffle cards               | P2       | Yes       |
| FLASH-008    | Progress tracking           | P1       | Yes       |

### 9.5 Progress Tracking

| Test Case ID | Description                     | Priority | Automated |
| ------------ | ------------------------------- | -------- | --------- |
| PROG-001     | Track completed processes       | P0       | Yes       |
| PROG-002     | Calculate completion percentage | P0       | Yes       |
| PROG-003     | Display time statistics         | P1       | Yes       |
| PROG-004     | Knowledge area breakdown        | P1       | Yes       |
| PROG-005     | Process group breakdown         | P1       | Yes       |
| PROG-006     | Reset progress                  | P2       | Yes       |
| PROG-007     | Export progress data            | P2       | No        |
| PROG-008     | Import progress data            | P2       | No        |

### 9.6 Search and Filtering

| Test Case ID | Description                   | Priority | Automated |
| ------------ | ----------------------------- | -------- | --------- |
| SEARCH-001   | Global search across app      | P0       | Yes       |
| SEARCH-002   | Search glossary terms         | P1       | Yes       |
| SEARCH-003   | Search processes              | P0       | Yes       |
| SEARCH-004   | Filter with multiple criteria | P1       | Yes       |
| SEARCH-005   | Search highlighting           | P2       | Yes       |
| SEARCH-006   | Search suggestions            | P2       | No        |
| SEARCH-007   | Recent searches               | P3       | No        |

## 10. Test Automation Implementation

### 10.1 CI/CD Integration with PlaywrightMCP

```yaml
name: Test Pipeline with PlaywrightMCP

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run integration tests
        run: npm run test:integration

  e2e-tests-mcp:
    runs-on: ubuntu-latest
    needs: integration-tests

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18.x
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup PlaywrightMCP
        run: |
          npx playwright-mcp install --with-deps
          npm install @playwright-mcp/cli

      - name: Start MCP Server
        run: |
          npm run mcp:server &
          sleep 10
        env:
          MCP_SERVER_PORT: 3001
          MCP_AI_MODEL: claude-3-sonnet
          MCP_TEST_ENV: ci

      - name: Build application
        run: npm run build

      - name: Start application server
        run: |
          npm run preview &
          sleep 5

      - name: Run PlaywrightMCP E2E tests
        run: npm run test:e2e:mcp
        env:
          MCP_SERVER_URL: http://localhost:3001
          BASE_URL: http://localhost:4173

      - name: Generate MCP Test Report
        if: always()
        run: npm run test:e2e:report

      - name: Upload PlaywrightMCP test artifacts
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-mcp-test-results
          path: |
            test-results/
            mcp-reports/
            playwright-report/
          retention-days: 7

      - name: Upload MCP Analysis
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: mcp-analysis
          path: |
            mcp-analysis/
            ai-insights/
          retention-days: 14

  performance-tests:
    runs-on: ubuntu-latest
    needs: e2e-tests

    steps:
      - uses: actions/checkout@v3

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/matrix
            http://localhost:3000/mock-exam
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true
```

### 10.2 Test Execution Pipeline

```mermaid
graph LR
    A[Code Push] --> B[Lint & Format]
    B --> C[Unit Tests]
    C --> D[Integration Tests]
    D --> E[Build Application]
    E --> F[E2E Tests]
    F --> G[Performance Tests]
    G --> H[Deploy to Staging]
    H --> I[Smoke Tests]
    I --> J[Deploy to Production]
```

### 10.3 Reporting and Metrics

```javascript
// Custom test reporter configuration
export default {
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        pageTitle: 'PMP Learning Management Test Report',
        outputPath: './test-reports/index.html',
        includeFailureMsg: true,
        includeSuiteFailure: true,
      },
    ],
    [
      'jest-junit',
      {
        outputDirectory: './test-reports',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
      },
    ],
  ],
}
```

### 10.4 Failure Handling

```javascript
// Automatic retry configuration
export default {
  test: {
    retry: {
      unit: 0, // No retry for unit tests
      integration: 1, // Retry once for integration
      e2e: 2, // Retry twice for E2E
    },
    timeout: {
      unit: 5000, // 5 seconds
      integration: 10000, // 10 seconds
      e2e: 30000, // 30 seconds
    },
  },
}
```

## 11. Test Data Management

### 11.1 Test Data Creation Strategies

```javascript
// Test data factory
export class TestDataFactory {
  static createMockProgress() {
    return {
      processes: this.generateProcessProgress(),
      statistics: this.generateStatistics(),
      examHistory: this.generateExamHistory(),
    }
  }

  static generateProcessProgress() {
    const progress = {}
    for (let i = 1; i <= 49; i++) {
      progress[`process-${i}`] = {
        completed: Math.random() > 0.5,
        lastReviewed: Date.now() - Math.random() * 1000000,
        confidence: Math.floor(Math.random() * 5) + 1,
      }
    }
    return progress
  }

  static generateExamHistory() {
    return Array.from({ length: 5 }, (_, i) => ({
      id: `exam-${i}`,
      date: Date.now() - i * 86400000,
      score: Math.floor(Math.random() * 40) + 60,
      timeSpent: Math.floor(Math.random() * 3600) + 7200,
      questionsAnswered: 180,
    }))
  }
}
```

### 11.2 LocalStorage Testing

```javascript
// LocalStorage mock for testing
class LocalStorageMock {
  constructor() {
    this.store = {}
  }

  clear() {
    this.store = {}
  }

  getItem(key) {
    return this.store[key] || null
  }

  setItem(key, value) {
    this.store[key] = String(value)
  }

  removeItem(key) {
    delete this.store[key]
  }
}

global.localStorage = new LocalStorageMock()
```

### 11.3 Mock Data Fixtures

```javascript
// fixtures/mockData.js
export const mockData = {
  processes: require('./processes.json'),
  glossary: require('./glossary.json'),
  examQuestions: require('./examQuestions.json'),
  userProgress: require('./userProgress.json'),
}

// Usage in tests
import { mockData } from '../fixtures/mockData'

beforeEach(() => {
  localStorage.setItem('pmp-progress', JSON.stringify(mockData.userProgress))
})
```

## 12. Quality Metrics

### 12.1 Code Coverage Targets

| Component Type   | Line Coverage | Branch Coverage | Function Coverage |
| ---------------- | ------------- | --------------- | ----------------- |
| React Components | 85%           | 80%             | 90%               |
| Services         | 95%           | 90%             | 100%              |
| Utilities        | 100%          | 95%             | 100%              |
| Hooks            | 90%           | 85%             | 95%               |
| Overall          | 85%           | 80%             | 90%               |

### 12.2 Test Execution Metrics

```javascript
// Test metrics tracking
export const testMetrics = {
  executionTime: {
    unit: { target: '< 30s', max: '60s' },
    integration: { target: '< 2m', max: '5m' },
    e2e: { target: '< 10m', max: '15m' },
  },

  passRate: {
    unit: { target: '100%', minimum: '99%' },
    integration: { target: '98%', minimum: '95%' },
    e2e: { target: '95%', minimum: '90%' },
  },

  flakyTests: {
    threshold: '< 1%',
    action: 'Quarantine and fix within 2 days',
  },
}
```

### 12.3 Defect Tracking

| Severity | Response Time | Resolution Time | Examples              |
| -------- | ------------- | --------------- | --------------------- |
| Critical | 1 hour        | 4 hours         | Data loss, app crash  |
| High     | 4 hours       | 1 day           | Major feature broken  |
| Medium   | 1 day         | 3 days          | Minor feature issue   |
| Low      | 3 days        | 1 week          | UI polish, minor bugs |

### 12.4 Quality Gates

```javascript
// Quality gate configuration
export const qualityGates = {
  preMerge: {
    unitTestPass: true,
    coverage: { minimum: 80 },
    lintErrors: 0,
    buildSuccess: true,
  },

  preProduction: {
    allTestsPass: true,
    performanceBudget: true,
    accessibilityScore: { minimum: 90 },
    securityScan: 'pass',
    e2eTestPass: true,
  },
}
```

## PlaywrightMCP Implementation Roadmap

### Phase 1: PlaywrightMCP Foundation (Week 1-2)

- [ ] Setup Vitest and React Testing Library
- [ ] Configure code coverage tools
- [ ] Install and configure PlaywrightMCP
- [ ] Setup MCP Server with AI model integration
- [ ] Configure MCP client for test automation
- [ ] Create MCP-enhanced test utilities and helpers
- [ ] Setup AI-powered mock data factories
- [ ] Configure CI pipeline for unit tests with MCP integration
- [ ] Implement smart locator generation system
- [ ] Setup MCP test data management

### Phase 2: Unit Testing (Week 3-4)

- [ ] Test all utility functions (100% coverage)
- [ ] Test services (95% coverage)
- [ ] Test React components (85% coverage)
- [ ] Test custom hooks (90% coverage)
- [ ] Achieve overall 85% code coverage

### Phase 3: Integration Testing (Week 5-6)

- [ ] Test component interactions
- [ ] Test data flow between components
- [ ] Test LocalStorage persistence
- [ ] Test routing and navigation
- [ ] Test state management

### Phase 4: PlaywrightMCP E2E Testing (Week 7-8)

- [ ] Configure PlaywrightMCP with full AI integration
- [ ] Implement AI-enhanced critical user journeys
- [ ] Setup MCP server for test orchestration
- [ ] Create intelligent test scenarios with MCP
- [ ] Implement smart test data generation
- [ ] Configure cross-browser testing with MCP optimization
- [ ] Setup mobile responsiveness testing with AI analysis
- [ ] Configure PlaywrightMCP in CI pipeline
- [ ] Implement AI-powered test maintenance
- [ ] Setup intelligent test reporting and analytics

### Phase 5: Performance & Accessibility (Week 9-10)

- [ ] Setup Lighthouse CI
- [ ] Implement performance budgets
- [ ] Add accessibility testing with axe-core
- [ ] Configure monitoring and alerts
- [ ] Create performance dashboard

### Phase 6: PlaywrightMCP Continuous Improvement (Ongoing)

- [ ] Monitor MCP-enhanced test metrics and AI insights
- [ ] Use MCP to automatically detect and fix flaky tests
- [ ] Optimize test execution time with AI-powered parallelization
- [ ] Expand test coverage using MCP test generation
- [ ] Leverage MCP for automatic test maintenance
- [ ] Update test documentation with AI assistance
- [ ] Implement predictive test failure analysis
- [ ] Use MCP for continuous test optimization
- [ ] Setup AI-powered test review and recommendations
- [ ] Implement adaptive testing strategies based on MCP analysis

## Testing Tools Summary

### Required NPM Packages with PlaywrightMCP

```json
{
  "devDependencies": {
    // Testing Framework
    "vitest": "^1.2.0",
    "@vitest/ui": "^1.2.0",
    "@vitest/coverage-v8": "^1.2.0",

    // React Testing
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.2.0",
    "@testing-library/user-event": "^14.5.0",

    // PlaywrightMCP E2E Testing
    "@playwright/test": "^1.41.0",
    "@playwright-mcp/test": "^1.0.0",
    "@playwright-mcp/cli": "^1.0.0",
    "@playwright-mcp/ai-helpers": "^1.0.0",
    "@mcp/client": "^1.0.0",
    "@mcp/server": "^1.0.0",

    // MCP AI Integration
    "@anthropic-ai/sdk": "^0.17.0",
    "@mcp/anthropic-integration": "^1.0.0",

    // Enhanced Locators and AI Features
    "playwright-mcp-smart-locators": "^1.0.0",
    "playwright-mcp-ai-assertions": "^1.0.0",
    "playwright-mcp-test-generator": "^1.0.0",

    // Accessibility Testing
    "jest-axe": "^8.0.0",
    "axe-core": "^4.8.0",

    // Performance Testing
    "@lhci/cli": "^0.13.0",
    "lighthouse-mcp": "^1.0.0",

    // Mocking
    "msw": "^2.1.0",

    // Enhanced Reporting
    "jest-html-reporters": "^3.1.0",
    "jest-junit": "^16.0.0",
    "playwright-mcp-reporter": "^1.0.0",
    "mcp-test-analytics": "^1.0.0"
  },
  "dependencies": {
    // MCP Runtime (if needed in production)
    "@mcp/runtime": "^1.0.0"
  }
}
```

### Test Script Configuration with PlaywrightMCP

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:unit": "vitest run --coverage",
    "test:integration": "vitest run --config vitest.integration.config.js",

    // PlaywrightMCP E2E Testing
    "test:e2e": "playwright-mcp test",
    "test:e2e:ui": "playwright-mcp test --ui",
    "test:e2e:mcp": "playwright-mcp test --config playwright-mcp.config.js",
    "test:e2e:ai": "playwright-mcp test --ai-enhanced",
    "test:e2e:debug": "playwright-mcp test --debug --headed",
    "test:e2e:report": "playwright-mcp show-report",

    // MCP Server Management
    "mcp:server": "mcp-server start --config mcp.config.js",
    "mcp:server:dev": "mcp-server start --config mcp.config.js --dev",
    "mcp:server:stop": "mcp-server stop",

    // AI-Enhanced Testing
    "test:ai:generate": "playwright-mcp generate-tests --source ./src",
    "test:ai:maintain": "playwright-mcp maintain-tests --auto-fix",
    "test:ai:analyze": "playwright-mcp analyze-failures --last-run",

    // Standard Testing
    "test:accessibility": "vitest run --grep accessibility",
    "test:performance": "lighthouse-mcp autorun",
    "test:performance:mcp": "playwright-mcp test --performance",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:ci": "vitest run --coverage --reporter=junit",

    // Comprehensive Testing
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e:mcp",
    "test:all:ci": "npm run test:ci && npm run test:integration && npm run test:e2e:mcp --reporter=junit"
  }
}
```

## Conclusion

This comprehensive test plan provides a structured approach to implementing quality assurance for the PMPLearningManagement application. By following this plan, the team can ensure high-quality deliverables, catch bugs early, and maintain a robust and reliable application.

The phased implementation approach allows for gradual adoption of testing practices while delivering immediate value through automated testing of critical functionality. Regular monitoring of quality metrics and continuous improvement will ensure the testing strategy evolves with the application's needs.

## PlaywrightMCP Advanced Features

### AI-Powered Test Generation

```javascript
// Automatic test generation from user stories
import { generateTests } from '@playwright-mcp/test-generator'

const userStory = `
As a PMP candidate,
I want to take a mock exam
So that I can assess my readiness for the certification
`

const generatedTests = await generateTests({
  userStory,
  application: 'pmp-learning-management',
  testLevel: 'e2e',
  coverage: 'comprehensive',
  aiModel: 'claude-3-sonnet',
})

// Generated tests are automatically optimized for the application
test.describe('AI Generated: Mock Exam Journey', () => {
  generatedTests.forEach((testCase, index) => {
    test(`Generated Test ${index + 1}: ${testCase.title}`, async ({ page, mcp }) => {
      await testCase.execute(page, mcp)
    })
  })
})
```

### Intelligent Test Maintenance

```javascript
// Automatic test repair when UI changes
import { MCPTestMaintainer } from '@playwright-mcp/maintainer'

const maintainer = new MCPTestMaintainer({
  aiModel: 'claude-3-sonnet',
  adaptationStrength: 'moderate',
  preserveTestIntent: true,
})

test('Self-healing test example', async ({ page, mcp }) => {
  // This test automatically adapts to UI changes
  const examButton = await mcp.getAdaptiveLocator({
    intent: 'start mock exam',
    context: 'exam page',
    fallbackStrategies: ['text', 'role', 'position'],
    aiRepair: true,
  })

  await examButton.click()

  // MCP automatically updates the test if the UI changes
  const questionElement = await mcp.waitForElement({
    intent: 'first exam question',
    adaptToChanges: true,
    reportChanges: true,
  })

  expect(questionElement).toBeVisible()
})
```

### Enhanced Debugging and Analysis

```javascript
// AI-powered failure analysis
import { test, expect } from '@playwright/test'

test('Mock exam with intelligent debugging', async ({ page, mcp }) => {
  try {
    await page.goto('/mock-exam')
    await page.click('[data-testid="start-exam"]')

    // If this fails, MCP provides intelligent analysis
    await expect(page.locator('[data-testid="question-1"]')).toBeVisible()
  } catch (error) {
    // MCP analyzes the failure context
    const analysis = await mcp.analyzeFailure({
      error: error.message,
      screenshot: await page.screenshot(),
      domSnapshot: await page.content(),
      previousSteps: test.info().steps,
    })

    console.log('MCP Failure Analysis:', {
      rootCause: analysis.rootCause,
      suggestions: analysis.suggestions,
      quickFix: analysis.quickFix,
      similarIssues: analysis.similarIssues,
    })

    // Try MCP suggested fix
    if (analysis.quickFix) {
      await analysis.quickFix.execute(page)
    }

    throw error
  }
})
```

### Cross-Platform Testing Optimization

```javascript
// MCP optimizes tests for different browsers and devices
import { devices } from '@playwright/test'

const testConfigs = [
  { name: 'Desktop Chrome', ...devices['Desktop Chrome'] },
  { name: 'iPhone 12', ...devices['iPhone 12'] },
  { name: 'iPad Pro', ...devices['iPad Pro'] },
]

testConfigs.forEach((config) => {
  test(`Optimized for ${config.name}`, async ({ browser }) => {
    const context = await browser.newContext(config)
    const page = await context.newPage()
    const mcp = await initializeMCP(page, { deviceType: config.name })

    // MCP adapts interactions based on device capabilities
    const optimizedInteractions = await mcp.optimizeForDevice({
      device: config.name,
      interactions: ['tap', 'scroll', 'swipe'],
      adaptTouch: true,
    })

    await page.goto('/flashcards')

    // Use device-optimized interactions
    if (optimizedInteractions.supportsTouchGestures) {
      await mcp.swipeCard({ direction: 'left' })
    } else {
      await mcp.clickNext()
    }

    await context.close()
  })
})
```

### Performance Testing with AI Analysis

```javascript
// MCP-enhanced performance testing
test('Comprehensive performance analysis', async ({ page, mcp }) => {
  // Start comprehensive monitoring
  const perfMonitor = await mcp.startPerformanceMonitoring({
    metrics: ['web-vitals', 'custom-metrics', 'user-journey'],
    aiAnalysis: true,
    benchmarkComparison: true,
  })

  await page.goto('/')

  // Navigate through critical user paths
  const userJourney = await mcp.simulateRealisticUserJourney({
    persona: 'pmp-candidate',
    goals: ['study-flashcards', 'take-mock-exam'],
    urgency: 'normal',
  })

  await userJourney.execute(page)

  // Get AI-powered performance insights
  const insights = await perfMonitor.getInsights()

  expect(insights.overallScore).toBeGreaterThan(80)
  expect(insights.criticalIssues).toHaveLength(0)

  // Generate performance recommendations
  const recommendations = await mcp.generateOptimizationRecommendations({
    currentMetrics: insights.metrics,
    targetAudience: 'pmp-students',
    priority: 'user-experience',
  })

  console.log('Performance Optimization Recommendations:', recommendations)
})
```

### Visual Testing with AI Comparison

```javascript
// AI-enhanced visual regression testing
test('Intelligent visual testing', async ({ page, mcp }) => {
  await page.goto('/matrix')

  // MCP provides intelligent visual comparison
  const visualComparison = await mcp.compareVisually({
    baseline: 'matrix-baseline.png',
    current: await page.screenshot(),
    ignoreRegions: ['dynamic-timestamps', 'user-specific-data'],
    aiTolerance: 'adaptive',
    contextAware: true,
  })

  if (!visualComparison.matches) {
    const analysis = await mcp.analyzeVisualDifferences({
      differences: visualComparison.differences,
      context: 'pmbok-matrix-view',
      significance: 'automatic',
    })

    // Only fail if differences are significant
    if (analysis.significance === 'major') {
      throw new Error(`Significant visual changes detected: ${analysis.description}`)
    } else {
      console.log('Minor visual differences (acceptable):', analysis.description)
    }
  }
})
```

### Accessibility Testing Enhancement

```javascript
// MCP-powered accessibility testing
import { injectAxe, checkA11y } from 'axe-playwright'

test('Comprehensive accessibility with MCP', async ({ page, mcp }) => {
  await page.goto('/mock-exam')
  await injectAxe(page)

  // Standard axe-core check
  await checkA11y(page)

  // MCP provides additional AI-powered accessibility insights
  const a11yAnalysis = await mcp.analyzeAccessibility({
    page: page,
    standards: ['WCAG2.1-AA', 'Section508'],
    userPersonas: ['screen-reader', 'keyboard-only', 'low-vision'],
    aiEnhanced: true,
  })

  // Check for AI-identified potential issues
  expect(a11yAnalysis.criticalIssues).toHaveLength(0)
  expect(a11yAnalysis.usabilityScore).toBeGreaterThan(85)

  // Test keyboard navigation with MCP simulation
  const keyboardTest = await mcp.simulateKeyboardNavigation({
    startingPoint: 'page-top',
    expectedFlow: ['start-button', 'question-area', 'options', 'navigation'],
    assistiveTechnology: 'screen-reader',
  })

  expect(keyboardTest.successful).toBe(true)
  expect(keyboardTest.trapFocus).toBe(true)
})
```

## PlaywrightMCP Configuration Reference

### Complete Configuration Example

```javascript
// playwright-mcp.config.js - Complete configuration
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    [
      '@playwright-mcp/reporter',
      {
        outputDir: 'mcp-reports',
        includeAIInsights: true,
        generateRecommendations: true,
      },
    ],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // PlaywrightMCP Configuration
  mcp: {
    server: {
      enabled: true,
      url: process.env.MCP_SERVER_URL || 'http://localhost:3001',
      apiKey: process.env.MCP_API_KEY,
      timeout: 30000,
      retries: 3,
    },

    ai: {
      model: 'claude-3-sonnet',
      provider: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY,
      maxTokens: 4096,
      temperature: 0.1,
    },

    features: {
      smartLocators: {
        enabled: true,
        fallbackStrategies: ['semantic', 'visual', 'structural'],
        confidenceThreshold: 0.8,
      },

      testGeneration: {
        enabled: true,
        sources: ['user-stories', 'existing-tests', 'ui-analysis'],
        coverage: 'comprehensive',
      },

      selfHealing: {
        enabled: true,
        aggressiveness: 'moderate',
        reportChanges: true,
        backupOriginal: true,
      },

      performanceAnalysis: {
        enabled: true,
        metrics: ['web-vitals', 'custom', 'user-journey'],
        budgets: './performance-budgets.json',
      },

      visualTesting: {
        enabled: true,
        aiComparison: true,
        adaptiveThreshold: true,
        contextAware: true,
      },

      accessibilityTesting: {
        enabled: true,
        standards: ['WCAG2.1-AA'],
        aiEnhancement: true,
        personaTesting: true,
      },
    },

    debugging: {
      failureAnalysis: true,
      stepByStepReplay: true,
      aiSuggestions: true,
      similarFailureDetection: true,
    },

    reporting: {
      aiInsights: true,
      recommendations: true,
      trendAnalysis: true,
      performanceMetrics: true,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### MCP Server Setup Guide

```javascript
// mcp-server.js - Complete MCP server setup
import { MCPServer } from '@mcp/server'
import { AnthropicAdapter } from '@mcp/anthropic-integration'
import { TestDataGenerator } from './tools/test-data-generator.js'
import { SmartLocatorGenerator } from './tools/smart-locator.js'
import { FailureAnalyzer } from './tools/failure-analyzer.js'

const server = new MCPServer({
  name: 'pmp-learning-test-server',
  version: '1.0.0',
  description: 'MCP server for PMP Learning Management E2E testing',
})

// Initialize AI adapter
const aiAdapter = new AnthropicAdapter({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-sonnet',
  maxTokens: 4096,
})

server.addAdapter(aiAdapter)

// Register tools
server.registerTool(
  new TestDataGenerator({
    domain: 'pmp-learning',
    complexity: 'realistic',
    patterns: './data/user-behavior-patterns.json',
  })
)

server.registerTool(
  new SmartLocatorGenerator({
    strategies: ['semantic', 'visual', 'structural', 'accessibility'],
    fallbackCount: 3,
    confidenceThreshold: 0.8,
  })
)

server.registerTool(
  new FailureAnalyzer({
    knowledgeBase: './kb/common-failures.json',
    suggestionEngine: 'ai-powered',
    fixAttempts: 2,
  })
)

// Start server
server.listen({
  port: process.env.MCP_SERVER_PORT || 3001,
  host: '0.0.0.0',
})

console.log('MCP Server started on port 3001')
```

## PlaywrightMCP Best Practices

### 1. Smart Test Design

```javascript
// Design tests to be self-documenting and adaptable
test.describe('PMP Mock Exam - AI Enhanced', () => {
  test('Complete exam with realistic user behavior', async ({ page, mcp }) => {
    // Use semantic descriptions instead of brittle selectors
    const examPage = new ExamPageMCP(page, mcp)

    await examPage.navigateToExam()
    await examPage.startExam({
      userBehavior: 'focused-student',
      timingPattern: 'moderate-pace',
    })

    // Let MCP handle the complexity of realistic exam-taking
    const examResults = await examPage.completeExamWithRealisticBehavior({
      answerStrategy: 'knowledge-based',
      timeManagement: 'efficient',
      reviewPattern: 'selective',
    })

    await examPage.verifyResults(examResults)
  })
})
```

### 2. Maintainable Test Architecture

```javascript
// Page Object Model with MCP enhancement
class ExamPageMCP {
  constructor(page, mcp) {
    this.page = page
    this.mcp = mcp
  }

  async navigateToExam() {
    await this.page.goto('/mock-exam')

    // Wait for page to be ready with AI-powered detection
    await this.mcp.waitForPageReady({
      indicators: ['dom-loaded', 'assets-loaded', 'interactive'],
      timeout: 10000,
    })
  }

  async startExam(options = {}) {
    const startButton = await this.mcp.getSmartLocator({
      intent: 'start mock exam',
      context: 'exam landing page',
      userRole: 'student',
    })

    await startButton.click()

    // Verify exam started with AI validation
    await this.mcp.verifyState({
      expectedState: 'exam-in-progress',
      validationStrategy: 'comprehensive',
    })
  }

  async completeExamWithRealisticBehavior(strategy) {
    return await this.mcp.simulateUserBehavior({
      behavior: 'complete-mock-exam',
      strategy,
      duration: 'variable',
      realism: 'high',
    })
  }
}
```

### 3. Intelligent Error Handling

```javascript
// Robust error handling with MCP
test('Resilient test with intelligent recovery', async ({ page, mcp }) => {
  const maxRetries = 3
  let attempt = 0

  while (attempt < maxRetries) {
    try {
      await page.goto('/flashcards')

      const flashcardElement = await mcp.waitForElement({
        intent: 'interactive flashcard',
        timeout: 10000,
        adaptiveWait: true,
      })

      await flashcardElement.click()
      break
    } catch (error) {
      attempt++

      if (attempt >= maxRetries) {
        // Final attempt with MCP analysis and suggestions
        const analysis = await mcp.analyzeFailure({
          error,
          context: 'flashcard-interaction',
          suggestFixes: true,
        })

        console.log('Test failed after all retries. MCP Analysis:', analysis)
        throw error
      }

      // Let MCP suggest recovery strategy
      const recovery = await mcp.suggestRecovery({ error, attempt })
      await recovery.execute(page)
    }
  }
})
```

## Appendix A: Test Case Template

```markdown
### Test Case ID: [Feature]-[Number]

**Title**: [Descriptive title]
**Priority**: P0/P1/P2/P3
**Type**: Unit/Integration/E2E/Performance/Accessibility
**Automated**: Yes/No/Partial

**Preconditions**:

- [List any setup requirements]

**Test Steps**:

1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Results**:

- [Expected outcome]

**Actual Results**:

- [To be filled during execution]

**Status**: Pass/Fail/Blocked
**Notes**: [Any additional information]
```

## Appendix B: Bug Report Template

```markdown
### Bug ID: BUG-[Number]

**Title**: [Descriptive title]
**Severity**: Critical/High/Medium/Low
**Priority**: P0/P1/P2/P3
**Component**: [Affected component]
**Found in Version**: [Version number]

**Description**:
[Detailed description of the issue]

**Steps to Reproduce**:

1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Screenshots/Videos**:
[Attach if applicable]

**Environment**:

- Browser: [Browser and version]
- OS: [Operating system]
- Device: [Device type]

**Additional Information**:
[Any other relevant details]
```

## Appendix C: Test Metrics Dashboard

```javascript
// Sample metrics dashboard configuration
export const metricsConfig = {
  widgets: [
    {
      type: 'gauge',
      title: 'Code Coverage',
      metric: 'coverage.overall',
      target: 85,
      warning: 80,
      critical: 70,
    },
    {
      type: 'trend',
      title: 'Test Execution Time',
      metric: 'execution.duration',
      period: '7d',
    },
    {
      type: 'pie',
      title: 'Test Status Distribution',
      metrics: ['passed', 'failed', 'skipped', 'flaky'],
    },
    {
      type: 'bar',
      title: 'Coverage by Component',
      metrics: 'coverage.byComponent',
    },
  ],
}
```

---

**Document Status**: This test plan is a living document and will be updated as the project evolves and new testing requirements emerge.

## Troubleshooting PlaywrightMCP

### Common Issues and Solutions

#### 1. MCP Server Connection Issues

```bash

npm run mcp:server:status

npm run mcp:server:restart

npx playwright-mcp debug --server-check
```

#### 2. AI Model Rate Limiting

```javascript
// Configure retry and backoff
mcp: {
  ai: {
    rateLimit: {
      requestsPerMinute: 60,
      backoffStrategy: 'exponential',
      maxRetries: 3
    }
  }
}
```

#### 3. Smart Locator Failures

```javascript
// Fallback to traditional locators
const element = await mcp.getSmartLocator({
  intent: 'submit button',
  fallbacks: ['[data-testid="submit"]', 'button[type="submit"]', 'input[value="Submit"]'],
  traditionalFallback: true,
})
```

### Performance Optimization

#### 1. Parallel Test Execution with MCP

```javascript
// Optimize parallel execution
export default defineConfig({
  workers: process.env.CI ? 2 : 4,
  mcp: {
    server: {
      poolSize: 4,
      loadBalancing: true,
    },
  },
})
```

#### 2. Caching Strategies

```javascript
// Enable MCP caching
mcp: {
  caching: {
    locators: { ttl: '1h' },
    testData: { ttl: '24h' },
    aiResponses: { ttl: '1h' }
  }
}
```

### Monitoring and Analytics

#### Test Execution Dashboard

```javascript
// Custom metrics collection
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status === 'failed') {
    const metrics = await mcp.collectFailureMetrics({
      test: testInfo.title,
      duration: testInfo.duration,
      error: testInfo.error,
      screenshot: await page.screenshot(),
    })

    await mcp.sendToAnalytics(metrics)
  }
})
```

**Last Updated**: 2025-08-09 (Updated with PlaywrightMCP)
**Next Review**: 2025-09-09
**Owner**: Test Automation Team

---

## TEST PLAN

_Source: `docs/TEST_PLAN.md`_

## 概要

PMPLearningManagement システムの包括的なテスト戦略とプランです。
品質保証の観点から、テストカバレッジ80%以上を目標とし、
本番環境でのバグ発生率を最小限に抑えることを目的としています。

## テスト戦略

### テストピラミッド

```
     /\
    /  \  E2E Tests (10%)
   /    \
  /______\  Integration Tests (20%)
 /        \
/__________\  Unit Tests (70%)
```

### 品質目標

- **テストカバレッジ**: 80%以上
- **バグ密度**: < 0.5 bugs/KLoC
- **パフォーマンス**: p95 < 200ms
- **可用性**: 99.9%
- **セキュリティ**: OWASP Top 10 完全対応

---

## 1. 単体テスト (Unit Tests)

### 対象コンポーネント

#### 1.1 サービス層テスト

**ファイル**: `src/server/services/*.test.ts`

```typescript
// UserService テスト例
describe('UserService', () => {
  beforeEach(() => {
    // データベースクリーンアップ
    // モック設定
  })

  describe('createUser', () => {
    it('有効なデータで新規ユーザーを作成できる', async () => {
      const userData = {
        name: 'テストユーザー',
        email: 'test@example.com',
        password: 'Password123!',
        role: UserRole.USER,
        subscriptionPlan: SubscriptionPlan.FREE,
        emailVerified: false,
      }

      const user = await UserService.createUser(userData)

      expect(user.id).toBeDefined()
      expect(user.email).toBe(userData.email)
      expect(user.role).toBe(UserRole.USER)
    })

    it('重複メールアドレスで作成を拒否する', async () => {
      // 既存ユーザー作成
      await UserService.createUser({
        name: '既存ユーザー',
        email: 'existing@example.com',
        password: 'Password123!',
      })

      // 重複作成試行
      await expect(
        UserService.createUser({
          name: '新規ユーザー',
          email: 'existing@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow('メールアドレスは既に使用されています')
    })

    it('無効なメールアドレスで作成を拒否する', async () => {
      await expect(
        UserService.createUser({
          name: 'テストユーザー',
          email: 'invalid-email',
          password: 'Password123!',
        })
      ).rejects.toThrow()
    })
  })

  describe('updateUser', () => {
    it('有効なデータでユーザー情報を更新できる', async () => {
      const user = await createTestUser()

      const updatedUser = await UserService.updateUser(user.id, {
        name: '更新されたユーザー',
        bio: 'テストユーザーの自己紹介',
      })

      expect(updatedUser.name).toBe('更新されたユーザー')
      expect(updatedUser.bio).toBe('テストユーザーの自己紹介')
    })
  })
})
```

#### 1.2 認証・認可テスト

```typescript
describe('Auth System', () => {
  describe('PermissionChecker', () => {
    it('フリープランユーザーの権限を正しく判定する', () => {
      const userContext = {
        id: 'user-1',
        role: UserRole.USER,
        subscriptionPlan: SubscriptionPlan.FREE,
        subscriptionActive: true,
        profileComplete: true,
      }

      const checker = createPermissionChecker(userContext)

      expect(checker.hasPermission(Permission.LEARNING_READ)).toBe(true)
      expect(checker.hasPermission(Permission.AI_ADVANCED)).toBe(false)
      expect(checker.canUseAI('basic')).toBe(false)
    })

    it('プレミアムユーザーの権限を正しく判定する', () => {
      const userContext = {
        id: 'user-2',
        role: UserRole.USER,
        subscriptionPlan: SubscriptionPlan.PREMIUM,
        subscriptionActive: true,
        profileComplete: true,
      }

      const checker = createPermissionChecker(userContext)

      expect(checker.hasPermission(Permission.AI_ADVANCED)).toBe(true)
      expect(checker.canUseAI('advanced')).toBe(true)
      expect(checker.isPremiumUser()).toBe(true)
    })
  })
})
```

#### 1.3 学習機能テスト

```typescript
describe('LearningService', () => {
  describe('recordStudySession', () => {
    it('学習セッションを正しく記録する', async () => {
      const userId = 'test-user-id'
      const sessionData = {
        processId: 'process_1',
        processName: 'プロジェクト憲章作成',
        knowledgeArea: 'Integration',
        processGroup: 'Initiating',
        duration: 1800,
        completed: true,
      }

      const session = await LearningService.recordStudySession(userId, sessionData)

      expect(session.id).toBeDefined()
      expect(session.processId).toBe(sessionData.processId)
      expect(session.completed).toBe(true)
    })

    it('学習進捗を自動更新する', async () => {
      const userId = 'test-user-id'

      // 初期進捗確認
      const initialProgress = await LearningService.getLearningProgress(userId)
      const initialCompletedCount = initialProgress.completedProcesses.length

      // セッション記録
      await LearningService.recordStudySession(userId, {
        processId: 'new_process',
        processName: 'New Process',
        knowledgeArea: 'Integration',
        processGroup: 'Initiating',
        duration: 1800,
        completed: true,
      })

      // 進捗更新確認
      const updatedProgress = await LearningService.getLearningProgress(userId)
      expect(updatedProgress.completedProcesses.length).toBe(initialCompletedCount + 1)
      expect(updatedProgress.totalStudyTime).toBe(initialProgress.totalStudyTime + 1800)
    })
  })

  describe('getStudyRecommendations', () => {
    it('未完了プロセスに基づく推奨を返す', async () => {
      const userId = 'test-user-id'
      const recommendations = await LearningService.getStudyRecommendations(userId)

      expect(recommendations.nextProcesses).toBeDefined()
      expect(Array.isArray(recommendations.nextProcesses)).toBe(true)
      expect(recommendations.suggestedDuration).toBeGreaterThan(0)
    })
  })
})
```

#### 1.4 決済機能テスト

```typescript
describe('StripeService', () => {
  beforeEach(() => {
    // Stripe APIモック設定
    jest.mock('stripe', () => ({
      customers: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
      subscriptions: {
        create: jest.fn(),
        update: jest.fn(),
        cancel: jest.fn(),
      },
    }))
  })

  describe('createSubscription', () => {
    it('新規サブスクリプションを作成する', async () => {
      const mockSubscription = {
        id: 'sub_test123',
        status: 'active',
        current_period_start: 1640995200,
        current_period_end: 1643673600,
      }

      StripeService.stripe.subscriptions.create.mockResolvedValue(mockSubscription)

      const result = await StripeService.createSubscription('user-123', SubscriptionPlan.BASIC)

      expect(result.subscription.id).toBe('sub_test123')
      expect(result.subscription.status).toBe('active')
    })

    it('既存顧客の場合はサブスクリプションのみ作成する', async () => {
      // テスト実装
    })
  })
})
```

#### 1.5 通知機能テスト

```typescript
describe('NotificationService', () => {
  describe('sendNotification', () => {
    it('有効なチャネルで通知を送信する', async () => {
      const notificationData = {
        userId: 'test-user-id',
        type: NotificationType.LEARNING_REMINDER,
        title: 'テスト通知',
        message: 'テストメッセージ',
        channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
        priority: NotificationPriority.NORMAL,
      }

      const result = await NotificationService.sendNotification(notificationData)

      expect(result.success).toBe(true)
      expect(result.results.length).toBe(2)
    })

    it('無効化されたチャネルは送信をスキップする', async () => {
      // ユーザーの通知設定でメール無効化
      await updateUserNotificationSettings('test-user-id', {
        email: { enabled: false },
      })

      const result = await NotificationService.sendNotification({
        userId: 'test-user-id',
        type: NotificationType.LEARNING_REMINDER,
        title: 'テスト通知',
        message: 'テストメッセージ',
        channels: [NotificationChannel.EMAIL],
        priority: NotificationPriority.NORMAL,
      })

      const emailResult = result.results.find((r) => r.channel === NotificationChannel.EMAIL)
      expect(emailResult?.success).toBe(false)
      expect(emailResult?.error).toContain('disabled')
    })
  })
})
```

### 単体テスト実行

```bash

npm run test:unit

npm run test:coverage

npm run test:watch

npm run test -- UserService.test.ts
```

---

## 2. 統合テスト (Integration Tests)

### 2.1 APIエンドポイントテスト

```typescript
describe('tRPC API Integration', () => {
  let testClient: any

  beforeAll(async () => {
    // テストサーバー起動
    testClient = createTestTRPCClient()
  })

  describe('Authentication Flow', () => {
    it('ユーザー登録から認証までの完全フロー', async () => {
      // 1. ユーザー登録
      const signUpResult = await testClient.auth.signUp.mutate({
        name: 'テストユーザー',
        email: 'test@example.com',
        password: 'Password123!',
        agreeToTerms: true,
      })

      expect(signUpResult.user.id).toBeDefined()
      expect(signUpResult.user.email).toBe('test@example.com')

      // 2. メール確認
      const verificationToken = await getVerificationToken(signUpResult.user.id)
      await testClient.auth.verifyEmail.mutate({ token: verificationToken })

      // 3. ログイン
      const signInResult = await signIn('credentials', {
        email: 'test@example.com',
        password: 'Password123!',
      })

      expect(signInResult).toBeDefined()

      // 4. 認証済み情報取得
      const userInfo = await testClient.auth.me.query()
      expect(userInfo.email).toBe('test@example.com')
      expect(userInfo.emailVerified).not.toBeNull()
    })
  })

  describe('Learning Progress Flow', () => {
    it('学習セッション記録から進捗更新までの完全フロー', async () => {
      // 認証済みクライアント準備
      const authenticatedClient = await createAuthenticatedClient()

      // 1. 初期進捗取得
      const initialProgress = await authenticatedClient.learning.getProgress.query()
      const initialCompletionRate = initialProgress.stats.completionRate

      // 2. 学習セッション記録
      await authenticatedClient.learning.recordSession.mutate({
        processId: 'integration_test_process',
        processName: 'Integration Test Process',
        knowledgeArea: 'Integration',
        processGroup: 'Initiating',
        duration: 3600,
        completed: true,
      })

      // 3. 進捗更新確認
      const updatedProgress = await authenticatedClient.learning.getProgress.query()
      expect(updatedProgress.stats.completionRate).toBeGreaterThan(initialCompletionRate)
      expect(updatedProgress.completedProcesses).toContain('integration_test_process')

      // 4. 統計情報更新確認
      const stats = await authenticatedClient.learning.getStats.query({ period: 'month' })
      expect(stats.studyTime.total).toBeGreaterThan(0)
    })
  })

  describe('Subscription Flow', () => {
    it('サブスクリプション作成から課金までの完全フロー', async () => {
      const authenticatedClient = await createAuthenticatedClient()

      // 1. 初期サブスクリプション確認
      const initialSub = await authenticatedClient.payment.getSubscription.query()
      expect(initialSub.plan).toBe(SubscriptionPlan.FREE)

      // 2. 支払い方法追加（テスト用カード）
      const paymentMethod = await authenticatedClient.payment.addPaymentMethod.mutate({
        type: 'card',
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2025,
          cvc: '123',
        },
        billing_details: {
          name: 'Test User',
          email: 'test@example.com',
          address: {
            line1: '123 Test Street',
            city: 'Test City',
            postal_code: '12345',
            country: 'JP',
          },
        },
      })

      // 3. サブスクリプション作成
      const subResult = await authenticatedClient.payment.createSubscription.mutate({
        planId: SubscriptionPlan.BASIC,
        paymentMethodId: paymentMethod.paymentMethod.id,
      })

      expect(subResult.subscription.status).toBe('active')

      // 4. サブスクリプション情報更新確認
      const updatedSub = await authenticatedClient.payment.getSubscription.query()
      expect(updatedSub.plan).toBe(SubscriptionPlan.BASIC)
      expect(updatedSub.billing.amount).toBe(2980)
    })
  })
})
```

### 2.2 データベース統合テスト

```typescript
describe('Database Integration', () => {
  beforeEach(async () => {
    // テストデータベースクリーンアップ
    await cleanTestDatabase()
  })

  it('複雑なクエリの実行とパフォーマンス', async () => {
    // テストデータ作成
    const users = await createTestUsers(100)
    const sessions = await createTestStudySessions(users, 500)

    // 複雑な集計クエリ実行
    const startTime = Date.now()
    const analytics = await prisma.studySession.groupBy({
      by: ['knowledgeArea'],
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      _sum: { duration: true },
      _count: { id: true },
      _avg: { duration: true },
    })
    const queryTime = Date.now() - startTime

    expect(analytics.length).toBeGreaterThan(0)
    expect(queryTime).toBeLessThan(1000) // 1秒以内
  })

  it('トランザクション処理の正常性', async () => {
    const user = await createTestUser()

    // 複数テーブルを跨ぐトランザクション
    const result = await prisma.$transaction(async (tx) => {
      const session = await tx.studySession.create({
        data: {
          userId: user.id,
          processId: 'transaction_test',
          processName: 'Transaction Test',
          knowledgeArea: 'Integration',
          processGroup: 'Initiating',
          duration: 1800,
          completed: true,
        },
      })

      const updatedProgress = await tx.learningProgress.update({
        where: { userId: user.id },
        data: {
          totalStudyTime: { increment: 1800 },
          completedProcesses: { push: 'transaction_test' },
        },
      })

      return { session, updatedProgress }
    })

    expect(result.session.id).toBeDefined()
    expect(result.updatedProgress.totalStudyTime).toBe(1800)
  })
})
```

### 2.3 外部サービス統合テスト

```typescript
describe('External Services Integration', () => {
  describe('Stripe Integration', () => {
    it('Stripe WebHookの処理', async () => {
      const webhookPayload = createStripeWebhookPayload('customer.subscription.created')

      const response = await fetch('/api/webhook/stripe', {
        method: 'POST',
        headers: {
          'stripe-signature': generateStripeSignature(webhookPayload),
        },
        body: webhookPayload,
      })

      expect(response.status).toBe(200)

      // データベース更新確認
      const subscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: 'sub_test123' },
      })
      expect(subscription).not.toBeNull()
    })
  })

  describe('Email Service Integration', () => {
    it('メール送信の実際のテスト', async () => {
      const result = await EmailService.sendEmail({
        to: 'test@mailhog.local', // MailHogテスト用
        subject: '統合テスト',
        template: 'test',
        data: { name: 'テストユーザー' },
      })

      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
    })
  })
})
```

---

## 3. E2E テスト (End-to-End Tests)

### 3.1 Playwrightを使用したE2Eテスト

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('ユーザー登録からログインまでの完全フロー', async ({ page }) => {
    // 1. ホームページアクセス
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('PMP Learning Management')

    // 2. サインアップページへ
    await page.click('text=登録')
    await expect(page).toHaveURL('/auth/signup')

    // 3. ユーザー登録
    await page.fill('[name="name"]', 'E2Eテストユーザー')
    await page.fill('[name="email"]', `e2e-test-${Date.now()}@example.com`)
    await page.fill('[name="password"]', 'Password123!')
    await page.check('[name="agreeToTerms"]')
    await page.click('button[type="submit"]')

    // 4. 成功メッセージ確認
    await expect(page.locator('.success-message')).toContainText('登録が完了しました')

    // 5. メール確認（テスト環境では自動確認）
    await page.goto('/auth/verify-email?token=test-token')

    // 6. ログインページへ
    await page.goto('/auth/signin')
    await page.fill('[name="email"]', `e2e-test-${Date.now()}@example.com`)
    await page.fill('[name="password"]', 'Password123!')
    await page.click('button[type="submit"]')

    // 7. ダッシュボードにリダイレクト
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('.welcome-message')).toContainText('E2Eテストユーザー')
  })
})
```

### 3.2 学習機能E2Eテスト

```typescript
// tests/e2e/learning.spec.ts
test.describe('Learning Features', () => {
  test.beforeEach(async ({ page }) => {
    // テストユーザーでログイン
    await loginAsTestUser(page)
  })

  test('学習セッションの記録フロー', async ({ page }) => {
    // 1. 学習ページアクセス
    await page.goto('/learning')

    // 2. プロセス選択
    await page.click('[data-testid="process-integration-1"]')

    // 3. 学習セッション開始
    await page.click('button:has-text("学習開始")')
    await expect(page.locator('.timer')).toBeVisible()

    // 4. 学習内容確認
    await expect(page.locator('.process-content')).toContainText('プロジェクト憲章作成')

    // 5. 学習完了
    await page.click('button:has-text("完了")')

    // 6. 進捗更新確認
    await page.goto('/progress')
    await expect(page.locator('.completion-rate')).not.toContainText('0%')
  })

  test('模擬試験受験フロー', async ({ page }) => {
    // 1. 模擬試験ページアクセス
    await page.goto('/exam')

    // 2. 試験開始
    await page.click('button:has-text("模擬試験開始")')
    await expect(page.locator('.question-counter')).toContainText('1 / 180')

    // 3. 問題回答（最初の5問のみ）
    for (let i = 0; i < 5; i++) {
      await page.click('.answer-option:first-child')
      await page.click('button:has-text("次の問題")')
    }

    // 4. 試験終了
    await page.click('button:has-text("試験終了")')

    // 5. 結果ページ確認
    await expect(page).toHaveURL(/\/exam\/results/)
    await expect(page.locator('.score')).toBeVisible()
    await expect(page.locator('.knowledge-area-breakdown')).toBeVisible()
  })
})
```

### 3.3 レスポンシブデザインテスト

```typescript
test.describe('Responsive Design', () => {
  const devices = ['Desktop', 'iPhone 12', 'iPad']

  devices.forEach((deviceName) => {
    test(`${deviceName}での表示確認`, async ({ page, browser }) => {
      // デバイス設定
      const device = playwright.devices[deviceName]
      const context = await browser.newContext(device)
      const responsivePage = await context.newPage()

      await loginAsTestUser(responsivePage)

      // 主要ページのレスポンシブ確認
      const pages = ['/dashboard', '/learning', '/progress', '/exam']

      for (const pagePath of pages) {
        await responsivePage.goto(pagePath)

        // レイアウト崩れチェック
        const overflowElements = await responsivePage.locator('*').evaluateAll((elements) =>
          elements.filter((el) => {
            const rect = el.getBoundingClientRect()
            return rect.width > window.innerWidth
          })
        )

        expect(overflowElements.length).toBe(0)

        // 基本UI要素の表示確認
        await expect(responsivePage.locator('nav')).toBeVisible()
        await expect(responsivePage.locator('main')).toBeVisible()
      }
    })
  })
})
```

### 3.4 パフォーマンステスト

```typescript
test.describe('Performance Tests', () => {
  test('ページ読み込み速度テスト', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000) // 3秒以内

    // Core Web Vitals測定
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          resolve(
            entries.map((entry) => ({
              name: entry.name,
              value: entry.value,
            }))
          )
        }).observe({ entryTypes: ['measure', 'navigation'] })
      })
    })

    console.log('Performance metrics:', metrics)
  })

  test('大量データ処理のパフォーマンス', async ({ page }) => {
    // 大量の学習データを持つテストユーザーでログイン
    await loginAsUserWithLargeDataset(page)

    const startTime = Date.now()
    await page.goto('/progress')
    await page.waitForSelector('.progress-chart')
    const renderTime = Date.now() - startTime

    expect(renderTime).toBeLessThan(5000) // 5秒以内
  })
})
```

---

## 4. パフォーマンステスト

### 4.1 負荷テスト

```bash

config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100

scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/api/trpc/auth.me"
          headers:
            Authorization: "Bearer {{ token }}"
      - post:
          url: "/api/trpc/learning.recordSession"
          json:
            processId: "load_test_process"
            duration: 1800
            completed: true
```

実行コマンド:

```bash
npm run test:load
```

### 4.2 ストレステスト

```javascript
// k6を使用したストレステスト
import http from 'k6/http'
import { check, sleep } from 'k6'

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 300 },
    { duration: '5m', target: 300 },
    { duration: '10m', target: 0 },
  ],
}

export default function () {
  let response = http.get('http://localhost:3000/api/health')
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  })
  sleep(1)
}
```

---

## 5. セキュリティテスト

### 5.1 OWASP Top 10テスト

```typescript
describe('Security Tests', () => {
  describe('Authentication Security', () => {
    it('SQLインジェクション攻撃を防ぐ', async () => {
      const maliciousInput = "'; DROP TABLE users; --"

      const response = await fetch('/api/trpc/auth.signUp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: maliciousInput,
          email: 'test@example.com',
          password: 'Password123!',
          agreeToTerms: true,
        }),
      })

      // リクエストが適切に処理され、DBが破損していないことを確認
      expect(response.status).toBeLessThan(500)

      const userCount = await prisma.user.count()
      expect(userCount).toBeGreaterThan(0) // テーブルが削除されていない
    })

    it('XSS攻撃を防ぐ', async () => {
      const xssScript = '<script>alert("xss")</script>'

      const result = await testClient.user.updateProfile.mutate({
        name: xssScript,
        bio: xssScript,
      })

      // スクリプトタグがサニタイズされていることを確認
      expect(result.user.name).not.toContain('<script>')
      expect(result.user.bio).not.toContain('<script>')
    })

    it('CSRFトークン検証', async () => {
      const response = await fetch('/api/trpc/user.updateProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // CSRFトークンなしでリクエスト
        body: JSON.stringify({
          name: 'Updated Name',
        }),
      })

      expect(response.status).toBe(403)
    })
  })

  describe('Authorization Security', () => {
    it('権限のないエンドポイントへのアクセスを拒否', async () => {
      const userClient = await createClientForRole(UserRole.USER)

      // 管理者専用エンドポイントへのアクセス試行
      await expect(userClient.admin.getSystemHealth.query()).rejects.toThrow('Forbidden')
    })

    it('他ユーザーのデータへの不正アクセスを防ぐ', async () => {
      const user1Client = await createAuthenticatedClient('user1')
      const user2Id = 'different-user-id'

      await expect(user1Client.user.getById.query({ id: user2Id })).rejects.toThrow('Forbidden')
    })
  })
})
```

### 5.2 ペネトレーションテスト

```bash

npm run security:scan

nuclei -target http://localhost:3000 -templates nuclei-templates/
```

---

## 6. アクセシビリティテスト

### 6.1 WCAG準拠テスト

```typescript
import { injectAxe, checkA11y } from 'axe-playwright'

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await injectAxe(page)
  })

  test('ダッシュボードのアクセシビリティチェック', async ({ page }) => {
    await loginAsTestUser(page)
    await page.goto('/dashboard')

    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    })
  })

  test('キーボードナビゲーション', async ({ page }) => {
    await page.goto('/')

    // Tabキーでのナビゲーション
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()

    // Enterキーでのアクション
    await page.keyboard.press('Enter')
    // 期待される動作を確認
  })

  test('スクリーンリーダー対応', async ({ page }) => {
    await loginAsTestUser(page)
    await page.goto('/learning')

    // ARIAラベルの確認
    await expect(page.locator('[aria-label]')).toBeVisible()

    // セマンティックHTMLの使用確認
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('h1')).toBeVisible()
  })
})
```

---

## 7. クラウドインフラテスト

### 7.1 Infrastructure as Code テスト

```typescript
// Terraformテストファイル
describe('Infrastructure Tests', () => {
  it('RDSインスタンスが適切に設定されている', async () => {
    const terraform = new TerraformRunner('./infrastructure')
    const plan = await terraform.plan()

    expect(plan.changes.filter((c) => c.type === 'aws_db_instance')).toHaveLength(1)

    const rdsConfig = plan.configuration.root_module.resources.find(
      (r) => r.type === 'aws_db_instance'
    )

    expect(rdsConfig.expressions.engine.constant_value).toBe('postgres')
    expect(rdsConfig.expressions.multi_az.constant_value).toBe(true)
  })

  it('セキュリティグループが適切に設定されている', async () => {
    const securityGroups = await aws.ec2.describeSecurityGroups({
      GroupNames: ['pmp-learning-sg'],
    })

    const sg = securityGroups.SecurityGroups[0]
    const httpsRule = sg.IpPermissions.find((rule) => rule.FromPort === 443)

    expect(httpsRule).toBeDefined()
    expect(httpsRule.IpRanges[0].CidrIp).toBe('0.0.0.0/0')
  })
})
```

### 7.2 監視・アラート設定テスト

```typescript
describe('Monitoring Tests', () => {
  it('アプリケーションメトリクスが正常に収集される', async () => {
    // Prometheusメトリクスエンドポイントテスト
    const response = await fetch('/api/metrics')
    const metrics = await response.text()

    expect(metrics).toContain('http_requests_total')
    expect(metrics).toContain('db_query_duration_seconds')
    expect(metrics).toContain('active_users_total')
  })

  it('ヘルスチェックが正常に動作する', async () => {
    const healthResponse = await fetch('/api/health')
    const health = await healthResponse.json()

    expect(health.status).toMatch(/healthy|degraded/)
    expect(health.checks.database.status).toBe('healthy')
    expect(health.checks.redis.status).toMatch(/healthy|not_configured/)
  })
})
```

---

## 8. テスト環境・設定

### 8.1 テスト環境構成

```yaml
version: '3.8'
services:
  postgres-test:
    image: postgres:15
    environment:
      POSTGRES_DB: pmp_test
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
    ports:
      - '5433:5432'

  redis-test:
    image: redis:7-alpine
    ports:
      - '6380:6379'

  mailhog:
    image: mailhog/mailhog
    ports:
      - '1025:1025'
      - '8025:8025'
```

### 8.2 テスト設定ファイル

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: ['**/__tests__/**/*.(ts|js)', '**/*.(test|spec).(ts|js)'],
  collectCoverageFrom: ['src/**/*.(ts|js)', '!src/**/*.d.ts', '!src/test/**/*'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}
```

```typescript
// tests/setup.ts
import { beforeAll, afterAll, beforeEach } from '@jest/globals'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

beforeAll(async () => {
  // テストデータベースセットアップ
  await execAsync('npm run db:test:reset')

  // テストサーバー起動
  process.env.NODE_ENV = 'test'
  process.env.DATABASE_URL = 'postgresql://test_user:test_password@localhost:5433/pmp_test'
})

beforeEach(async () => {
  // テストデータリセット
  await cleanTestDatabase()
})

afterAll(async () => {
  // クリーンアップ
  await execAsync('npm run db:test:cleanup')
})
```

---

## 9. CI/CDパイプラインでのテスト実行

### 9.1 GitHub Actions設定

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: pmp_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run db:test:deploy
      - run: npm run test:unit
      - run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e

  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm audit
      - run: npm run security:scan
```

---

## 10. テスト実行コマンド

### 10.1 NPMスクリプト

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "test:load": "artillery run artillery.yml",
    "test:security": "npm audit && snyk test",
    "test:accessibility": "playwright test --project=accessibility"
  }
}
```

### 10.2 テスト実行手順

```bash

npm install

npm run db:test:reset

npm run test

npm run test:coverage
open coverage/lcov-report/index.html

npm run test:e2e

npm run test:security
```

---

## 11. 品質メトリクス・レポート

### 11.1 コードカバレッジ目標

- **全体カバレッジ**: 80%以上
- **ブランチカバレッジ**: 75%以上
- **関数カバレッジ**: 85%以上
- **行カバレッジ**: 80%以上

### 11.2 パフォーマンス目標

- **API レスポンス時間**: p95 < 200ms
- **ページロード時間**: p95 < 3秒
- **データベースクエリ**: p95 < 100ms
- **メモリ使用量**: < 512MB

### 11.3 品質ゲート

以下の条件をすべて満たした場合のみ、本番デプロイを許可：

1. ✅ 全単体テスト成功
2. ✅ 全統合テスト成功
3. ✅ 全E2Eテスト成功
4. ✅ セキュリティスキャン成功
5. ✅ コードカバレッジ > 80%
6. ✅ パフォーマンステスト合格
7. ✅ アクセシビリティテスト合格

---

この包括的なテスト計画により、PMPLearningManagement システムの
品質と信頼性を確保し、ユーザーに安定したサービスを提供します。

---
