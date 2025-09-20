# Testing Strategy and Best Practices

## 🎯 テスト戦略

### テストピラミッド
```
         /\        E2E Tests (10%)
        /  \       - Critical user flows
       /    \      - Cross-browser testing
      /======\     Integration Tests (30%)
     /        \    - API integration
    /          \   - Component interaction
   /============\  Unit Tests (60%)
  /              \ - Components, hooks, utils
 /________________\- Business logic
```

## 🧪 Vitest (Unit Testing)

### 基本設定
```javascript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'dist', '*.config.*'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    }
  }
})
```

### コンポーネントテスト例
```javascript
// UserProfile.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import UserProfile from './UserProfile'

describe('UserProfile', () => {
  it('should display user information', () => {
    const user = { name: 'John', email: 'john@example.com' }
    render(<UserProfile user={user} />)
    
    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })
  
  it('should handle edit click', async () => {
    const onEdit = vi.fn()
    render(<UserProfile user={user} onEdit={onEdit} />)
    
    await fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(user)
  })
})
```

### カスタムフックテスト
```javascript
// useDebounce.test.ts
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from './useDebounce'

test('should debounce value', async () => {
  const { result, rerender } = renderHook(
    ({ value, delay }) => useDebounce(value, delay),
    { initialProps: { value: 'initial', delay: 500 } }
  )
  
  expect(result.current).toBe('initial')
  
  rerender({ value: 'updated', delay: 500 })
  expect(result.current).toBe('initial')
  
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 600))
  })
  
  expect(result.current).toBe('updated')
})
```

## 🎭 Playwright (E2E Testing)

### 基本設定
```javascript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e/tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }},
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }},
    { name: 'webkit', use: { ...devices['Desktop Safari'] }},
    { name: 'mobile', use: { ...devices['Pixel 5'] }},
  ]
})
```

### E2Eテスト例
```javascript
// auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should complete login process', async ({ page }) => {
    await page.goto('/auth/login')
    
    // ログインフォーム入力
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    
    // ログインボタンクリック
    await page.click('button[type="submit"]')
    
    // ダッシュボードへリダイレクト確認
    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.locator('h1')).toContainText('Dashboard')
  })
})
```

### Page Object Model
```javascript
// e2e/pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}
  
  async navigate() {
    await this.page.goto('/auth/login')
  }
  
  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email)
    await this.page.fill('[name="password"]', password)
    await this.page.click('button[type="submit"]')
  }
  
  async getErrorMessage() {
    return await this.page.locator('.error-message').textContent()
  }
}
```

## 🔬 高度なテスト手法

### ミューテーションテスト (Stryker)
```bash
# 実行
npm run test:mutation

# 設定
// stryker.config.mjs
export default {
  mutate: ['src/**/*.{js,jsx,ts,tsx}'],
  testRunner: 'vitest',
  reporters: ['html', 'progress'],
  thresholds: { high: 80, low: 60, break: 50 }
}
```

### プロパティベーステスト (fast-check)
```javascript
import fc from 'fast-check'

test('calculate total should be commutative', () => {
  fc.assert(
    fc.property(
      fc.array(fc.integer({ min: 0, max: 1000 })),
      (numbers) => {
        const sum1 = calculateTotal(numbers)
        const sum2 = calculateTotal([...numbers].reverse())
        return sum1 === sum2
      }
    )
  )
})
```

## 📊 テストデータ管理

### Factory パターン
```javascript
// test/factories/userFactory.ts
import { faker } from '@faker-js/faker'

export const createUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  role: 'user',
  ...overrides
})

// 使用例
const admin = createUser({ role: 'admin' })
```

### モック戦略
```javascript
// MSW でAPIモック
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json({ users: [createUser()] }))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## 🚀 CI/CDテスト自動化

### GitHub Actions
```yaml
name: Test Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      
      # Unit tests with coverage
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
      
      # E2E tests
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      
      # Upload artifacts
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: test-results
          path: |
            coverage/
            playwright-report/
```

## 📈 テストコマンド

```bash
# Unit Tests
npm run test              # Watch mode
npm run test:run          # Single run
npm run test:coverage     # With coverage

# E2E Tests
npm run test:e2e          # All E2E
npm run test:e2e:headed   # With browser
npm run test:e2e:debug    # Debug mode

# Specific suites
npm run test:e2e:auth     # Auth tests only
npm run test:e2e:mobile   # Mobile tests

# Advanced
npm run test:mutation     # Mutation testing
npm run test:a11y         # Accessibility

# Full suite
npm run test:all          # Everything
```

## ✅ ベストプラクティス

### Do's
- ✅ AAA パターン使用 (Arrange, Act, Assert)
- ✅ テストを独立させる（相互依存なし）
- ✅ わかりやすいテスト名
- ✅ データビルダー使用
- ✅ 非同期処理は await/async

### Don'ts
- ❌ 実装詳細のテスト
- ❌ 過度なモック
- ❌ スナップショットの乱用
- ❌ sleepの使用（waitForを使う）
- ❌ グローバル状態の変更

## 🔍 トラブルシューティング

### テストがタイムアウトする
```javascript
// タイムアウト増加
test('slow test', async () => {
  // test code
}, 10000) // 10秒
```

### フレーキーテスト対策
```javascript
// リトライ設定
test.retry(3)('flaky test', async () => {
  // test code
})
```

### デバッグ
```bash
# Vitest UI
npm run test:ui

# Playwright デバッグ
PWDEBUG=1 npm run test:e2e

# 特定テストのみ
npm run test -- UserProfile.test.tsx
```