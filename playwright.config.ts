import { defineConfig, devices } from '@playwright/test'
import type { PlaywrightTestConfig } from '@playwright/test'

/**
 * Advanced E2E Test Configuration for PMP Learning Management System
 * 
 * Features:
 * - Comprehensive cross-browser testing
 * - Visual regression testing for D3.js visualizations
 * - Performance monitoring integration
 * - Accessibility testing with axe-core
 * - Self-healing test automation
 * - AI-powered test analytics
 * - Parallel execution optimization
 * - Custom reporting dashboard
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory structure
  testDir: './e2e',
  
  // Advanced test organization
  testMatch: [
    '**/tests/**/*.spec.{js,ts}',
    '**/tests/**/*.e2e.{js,ts}',
    '**/integration/**/*.spec.{js,ts}',
    '**/visual/**/*.spec.{js,ts}',
    '**/accessibility/**/*.spec.{js,ts}',
    '**/performance/**/*.spec.{js,ts}'
  ],

  // Parallel execution optimization
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  maxFailures: process.env.CI ? 10 : 0,

  // Test stability and reliability
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 3 : 1,
  timeout: 60 * 1000, // 60 seconds per test
  
  // Advanced reporting configuration
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report',
      open: !process.env.CI ? 'always' : 'never'
    }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['blob', { outputDir: 'test-results/blob' }],
    ['./e2e/utils/custom-reporter.ts'],
    process.env.CI ? ['github'] : ['list']
  ],

  // Global test configuration
  use: {
    // Base URL configuration
    baseURL: process.env.BASE_URL || (process.env.CI
      ? 'https://yusuke-kurosawa.github.io/PMPLearningManagement/'
      : 'http://localhost:5173'),

    // Enhanced debugging and tracing
    trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Performance monitoring
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Test data and state management
    storageState: process.env.STORAGE_STATE,
    
    // Extra HTTP headers for API testing
    extraHTTPHeaders: {
      'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8'
    }
  },

  // Comprehensive browser coverage
  projects: [
    // Setup project for authentication and data preparation
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      teardown: 'cleanup'
    },
    
    // Cleanup project
    {
      name: 'cleanup',
      testMatch: /.*\.cleanup\.ts/
    },

    // Desktop browsers with different configurations
    {
      name: 'desktop-chromium',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        contextOptions: {
          permissions: ['notifications', 'geolocation']
        }
      },
      dependencies: ['setup']
    },

    {
      name: 'desktop-firefox',
      use: { 
        ...devices['Desktop Firefox'],
        launchOptions: {
          firefoxUserPrefs: {
            'media.navigator.streams.fake': true,
            'media.navigator.permission.disabled': true
          }
        }
      },
      dependencies: ['setup']
    },

    {
      name: 'desktop-webkit',
      use: { 
        ...devices['Desktop Safari'],
        contextOptions: {
          permissions: ['notifications']
        }
      },
      dependencies: ['setup']
    },

    {
      name: 'desktop-edge',
      use: { 
        ...devices['Desktop Edge'], 
        channel: 'msedge' 
      },
      dependencies: ['setup']
    },

    // Mobile testing configurations
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        contextOptions: {
          permissions: ['notifications']
        }
      },
      dependencies: ['setup']
    },

    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'],
        contextOptions: {
          permissions: ['notifications']
        }
      },
      dependencies: ['setup']
    },

    {
      name: 'tablet-ipad',
      use: { 
        ...devices['iPad Pro'],
        contextOptions: {
          permissions: ['notifications']
        }
      },
      dependencies: ['setup']
    },

    // Accessibility testing project
    {
      name: 'accessibility',
      testMatch: '**/accessibility/**/*.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        contextOptions: {
          reducedMotion: 'reduce',
          colorScheme: 'light'
        }
      },
      dependencies: ['setup']
    },

    // Performance testing project
    {
      name: 'performance',
      testMatch: '**/performance/**/*.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--disable-dev-shm-usage', '--no-sandbox']
        }
      },
      dependencies: ['setup']
    },

    // Visual regression testing
    {
      name: 'visual-regression',
      testMatch: '**/visual/**/*.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        contextOptions: {
          reducedMotion: 'reduce'
        }
      },
      dependencies: ['setup']
    },

    // API testing project
    {
      name: 'api',
      testMatch: '**/api/**/*.spec.ts',
      use: {
        baseURL: process.env.API_BASE_URL || 'https://api.example.com'
      }
    }
  ],

  // Development server configuration
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe'
  },

  // Global setup and teardown
  globalSetup: require.resolve('./e2e/global-setup.ts'),
  globalTeardown: require.resolve('./e2e/global-teardown.ts'),

  // Test ignore patterns
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**', 
    '**/.next/**',
    '**/coverage/**',
    '**/playwright-report/**',
    '**/test-results/**'
  ],

  // Output directory
  outputDir: 'test-results/',

  // Enhanced expect configuration
  expect: {
    // Timeout for expect assertions
    timeout: 10000,
    
    // Visual comparison settings
    toHaveScreenshot: {
      mode: 'only-on-failure',
      animationHandling: 'disabled',
      caret: 'hide'
    },

    toMatchSnapshot: {
      mode: 'only-on-failure',
      threshold: 0.2,
      maxDiffPixels: 1000
    }
  },

  // Metadata for test analytics
  metadata: {
    testType: 'e2e',
    application: 'PMP Learning Management System',
    version: process.env.npm_package_version || '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    ci: !!process.env.CI
  }
} satisfies PlaywrightTestConfig)
