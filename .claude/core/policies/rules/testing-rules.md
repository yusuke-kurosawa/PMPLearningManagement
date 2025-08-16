# Testing Standards & Quality Rules

## 📋 Overview

This document defines comprehensive testing standards, coverage requirements, quality metrics, and testing strategies for the PMPLearningManagement project.

## 🎯 Testing Objectives

### Primary Goals

- **Coverage Target**: ≥80% for all code
- **Test Reliability**: 100% deterministic tests
- **Execution Speed**: <5 minutes for unit tests
- **Quality Assurance**: Zero defects in production
- **Automation**: 100% automated test execution

## 🧪 Testing Pyramid

### Test Distribution

```yaml
testing_pyramid:
  unit_tests:
    percentage: 70%
    execution_time: <5 minutes
    coverage_target: 85%
    run_frequency: every_commit

  integration_tests:
    percentage: 20%
    execution_time: <10 minutes
    coverage_target: 75%
    run_frequency: every_pr

  e2e_tests:
    percentage: 10%
    execution_time: <15 minutes
    coverage_target: critical_paths
    run_frequency: before_deploy

  performance_tests:
    execution_time: <20 minutes
    run_frequency: nightly

  security_tests:
    execution_time: <30 minutes
    run_frequency: weekly
```

## 📊 Coverage Requirements

### Coverage Targets by Type

```yaml
coverage_targets:
  statements: 80%
  branches: 75%
  functions: 80%
  lines: 80%

  by_directory:
    src/components: 85%
    src/services: 90%
    src/utils: 95%
    src/api: 85%
    src/hooks: 80%
    src/contexts: 75%

  by_file_type:
    '*.service.ts': 90%
    '*.util.ts': 95%
    '*.component.tsx': 80%
    '*.hook.ts': 85%
    '*.api.ts': 85%
```

### Coverage Configuration

```javascript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/mockData/**',
        '**/__mocks__/**',
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
        perFile: true,
      },
      watermarks: {
        statements: [80, 90],
        branches: [75, 85],
        functions: [80, 90],
        lines: [80, 90],
      },
    },
  },
})
```

## 🔧 Unit Testing

### Unit Test Standards

```typescript
// Example: Component Unit Test
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UserProfile } from './UserProfile';

describe('UserProfile Component', () => {
  // Setup and teardown
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // Test categories
  describe('Rendering', () => {
    it('should render user information correctly', () => {
      const user = { id: 1, name: 'Test User', email: 'test@example.com' };
      render(<UserProfile user={user} />);

      expect(screen.getByText(user.name)).toBeInTheDocument();
      expect(screen.getByText(user.email)).toBeInTheDocument();
    });

    it('should show loading state', () => {
      render(<UserProfile loading />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should handle empty user gracefully', () => {
      render(<UserProfile user={null} />);
      expect(screen.getByText('No user data')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onEdit when edit button is clicked', async () => {
      const onEdit = vi.fn();
      const user = { id: 1, name: 'Test User' };

      render(<UserProfile user={user} onEdit={onEdit} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(onEdit).toHaveBeenCalledWith(user.id);
        expect(onEdit).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message', () => {
      const error = 'Failed to load user';
      render(<UserProfile error={error} />);

      expect(screen.getByRole('alert')).toHaveTextContent(error);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const user = { id: 1, name: 'Test User' };
      render(<UserProfile user={user} />);

      expect(screen.getByRole('article')).toHaveAttribute('aria-label', 'User Profile');
    });

    it('should be keyboard navigable', () => {
      const { container } = render(<UserProfile />);
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      focusableElements.forEach(element => {
        expect(element).toHaveAttribute('tabindex');
      });
    });
  });
});
```

### Service Testing Pattern

```typescript
// Example: Service Unit Test
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from './authService'
import { mockApi } from '../__mocks__/api'

describe('AuthService', () => {
  let authService: AuthService

  beforeEach(() => {
    authService = new AuthService(mockApi)
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should authenticate user with valid credentials', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' }
      const expectedToken = 'jwt-token'

      mockApi.post.mockResolvedValueOnce({ data: { token: expectedToken } })

      const result = await authService.login(credentials)

      expect(mockApi.post).toHaveBeenCalledWith('/auth/login', credentials)
      expect(result.token).toBe(expectedToken)
    })

    it('should throw error for invalid credentials', async () => {
      const credentials = { email: 'test@example.com', password: 'wrong' }

      mockApi.post.mockRejectedValueOnce(new Error('Invalid credentials'))

      await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials')
    })

    it('should handle network errors', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Network error'))

      await expect(authService.login({})).rejects.toThrow('Network error')
    })
  })

  describe('token management', () => {
    it('should refresh token before expiry', async () => {
      const newToken = 'new-jwt-token'
      mockApi.post.mockResolvedValueOnce({ data: { token: newToken } })

      const result = await authService.refreshToken()

      expect(result.token).toBe(newToken)
      expect(authService.isAuthenticated()).toBe(true)
    })

    it('should clear token on logout', () => {
      authService.logout()

      expect(authService.getToken()).toBeNull()
      expect(authService.isAuthenticated()).toBe(false)
    })
  })
})
```

## 🔗 Integration Testing

### Integration Test Standards

```typescript
// Example: API Integration Test
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { ApiClient } from './apiClient'

const server = setupServer(
  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params
    return res(
      ctx.json({
        id,
        name: 'Test User',
        email: 'test@example.com',
      })
    )
  })
)

describe('API Integration', () => {
  let apiClient: ApiClient

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
    apiClient = new ApiClient({ baseURL: '/api' })
  })

  afterAll(() => {
    server.close()
  })

  describe('User API', () => {
    it('should fetch user by ID', async () => {
      const user = await apiClient.getUser(123)

      expect(user).toEqual({
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
      })
    })

    it('should handle API errors gracefully', async () => {
      server.use(
        rest.get('/api/users/:id', (req, res, ctx) => {
          return res(ctx.status(404), ctx.json({ error: 'User not found' }))
        })
      )

      await expect(apiClient.getUser(999)).rejects.toThrow('User not found')
    })

    it('should retry on network failures', async () => {
      let attempts = 0
      server.use(
        rest.get('/api/users/:id', (req, res, ctx) => {
          attempts++
          if (attempts < 3) {
            return res.networkError('Network failure')
          }
          return res(ctx.json({ id: '123' }))
        })
      )

      const user = await apiClient.getUser(123)
      expect(attempts).toBe(3)
      expect(user.id).toBe('123')
    })
  })
})
```

## 🌐 E2E Testing

### E2E Test Standards

```typescript
// Example: E2E Test with Playwright
import { test, expect } from '@playwright/test'

test.describe('User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('complete user registration flow', async ({ page }) => {
    // Navigate to registration
    await page.click('text=Sign Up')

    // Fill registration form
    await page.fill('[name="email"]', 'newuser@example.com')
    await page.fill('[name="password"]', 'SecurePass123!')
    await page.fill('[name="confirmPassword"]', 'SecurePass123!')

    // Accept terms
    await page.check('[name="terms"]')

    // Submit form
    await page.click('button[type="submit"]')

    // Verify registration success
    await expect(page).toHaveURL('/welcome')
    await expect(page.locator('h1')).toContainText('Welcome')

    // Verify email verification prompt
    await expect(page.locator('.alert-info')).toContainText('Please verify your email')
  })

  test('should handle form validation', async ({ page }) => {
    await page.click('text=Sign Up')

    // Submit empty form
    await page.click('button[type="submit"]')

    // Check validation messages
    await expect(page.locator('.error-message')).toContainText('Email is required')

    // Enter invalid email
    await page.fill('[name="email"]', 'invalid-email')
    await page.click('button[type="submit"]')

    await expect(page.locator('.error-message')).toContainText('Invalid email format')
  })

  test('should be accessible', async ({ page }) => {
    // Run accessibility checks
    const accessibilityResults = await page.evaluate(() => {
      return window.axe.run()
    })

    expect(accessibilityResults.violations).toHaveLength(0)
  })
})
```

### E2E Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
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
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

## ⚡ Performance Testing

### Performance Test Standards

```javascript
// Example: Performance Test
import { check } from 'k6'
import http from 'k6/http'
import { Rate, Trend } from 'k6/metrics'

// Custom metrics
const errorRate = new Rate('errors')
const apiDuration = new Trend('api_duration')

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    errors: ['rate<0.1'], // Error rate under 10%
    http_req_failed: ['rate<0.1'], // HTTP failure rate under 10%
  },
}

export default function () {
  const payload = JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
  })

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const response = http.post('http://localhost:3000/api/login', payload, params)

  // Record custom metrics
  apiDuration.add(response.timings.duration)
  errorRate.add(response.status !== 200)

  // Checks
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'has token': (r) => JSON.parse(r.body).token !== undefined,
  })
}
```

## 🔍 Test Quality Metrics

### Mutation Testing Configuration

```javascript
// stryker.conf.js
module.exports = {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress', 'dashboard'],
  testRunner: 'vitest',
  coverageAnalysis: 'perTest',
  mutate: [
    'src/**/*.ts',
    'src/**/*.tsx',
    '!src/**/*.test.ts',
    '!src/**/*.test.tsx',
    '!src/**/*.spec.ts',
    '!src/**/__mocks__/**',
  ],
  thresholds: {
    high: 80,
    low: 60,
    break: 50,
  },
  mutator: {
    excludedMutations: ['LogicalOperator'],
  },
  dashboard: {
    reportType: 'full',
  },
}
```

### Test Quality Metrics

```yaml
test_quality_metrics:
  mutation_score: ≥60%
  test_flakiness: <1%
  test_execution_time:
    unit: <5 minutes
    integration: <10 minutes
    e2e: <15 minutes
  test_maintainability:
    duplication: <5%
    complexity: <10
    lines_per_test: <50
  test_coverage_gaps:
    untested_files: 0
    partially_tested: <10%
```

## 📝 Test Documentation

### Test Case Template

```typescript
/**
 * Test Suite: [Component/Service Name]
 * Purpose: [What is being tested]
 * Dependencies: [External dependencies]
 * Test Data: [Location of test data]
 * Related Issues: [Issue numbers]
 */
describe('[Component/Service Name]', () => {
  /**
   * Test Case ID: TC-001
   * Scenario: [Test scenario]
   * Given: [Initial conditions]
   * When: [Action performed]
   * Then: [Expected result]
   * Priority: [High/Medium/Low]
   * Type: [Unit/Integration/E2E]
   */
  it('should [expected behavior]', () => {
    // Arrange
    // Setup test data and mocks
    // Act
    // Perform the action
    // Assert
    // Verify the result
  })
})
```

## 🤖 Test Automation

### Continuous Testing Pipeline

```yaml
# .github/workflows/testing.yml
name: 🧪 Testing Pipeline

on: [push, pull_request]

jobs:
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [16, 18, 20]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unit

  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run integration tests
        run: npm run test:integration

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  mutation-tests:
    name: Mutation Tests
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'

    steps:
      - uses: actions/checkout@v4

      - name: Run mutation tests
        run: npm run test:mutation

      - name: Upload mutation report
        uses: actions/upload-artifact@v3
        with:
          name: mutation-report
          path: reports/mutation/
```

## 🎯 Test Success Criteria

### Quality Gates

```yaml
quality_gates:
  mandatory:
    - all_tests_pass: true
    - coverage_threshold: ≥80%
    - no_skipped_tests: true
    - no_console_errors: true

  recommended:
    - mutation_score: ≥60%
    - performance_threshold: met
    - accessibility_score: ≥90
    - security_tests_pass: true
```

## 📋 Testing Checklist

### Before Commit

- [ ] All tests pass locally
- [ ] New code has tests
- [ ] Coverage meets threshold
- [ ] No `.only` or `.skip` in tests
- [ ] Tests are deterministic

### PR Review

- [ ] Tests cover new functionality
- [ ] Edge cases tested
- [ ] Error scenarios tested
- [ ] Integration points tested
- [ ] Performance impact assessed

### Before Deploy

- [ ] All test suites pass
- [ ] E2E tests successful
- [ ] Performance tests pass
- [ ] Security tests pass
- [ ] Regression tests complete

---

Created: 2025-08-15
Last Updated: 2025-08-15
Status: Active
Owner: QA Team
