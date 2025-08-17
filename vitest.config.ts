/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  plugins: [],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.ts',
        '*.config.js',
        'dist/',
        '.next/',
        'coverage/',
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/*.spec.ts',
        'src/**/*.spec.tsx',
        '**/*.d.ts',
        'src/types/**',
        'src/test/**',
        'playwright.config.ts',
      ],
      thresholds: {
        branches: 90,
        functions: 92,
        lines: 91,
        statements: 90,
        // 高品質水準要件（90%+）
        perFile: true, // ファイル単位での厳格な閾値適用
      },
      // Mutation testing設定
      all: true,
      skipFull: false,
      watermarks: {
        statements: [90, 95],
        functions: [90, 95],
        branches: [90, 95],
        lines: [90, 95],
      },
    },
    testTimeout: 30000, // 30秒以内維持
    hookTimeout: 10000,
    teardownTimeout: 10000,
    isolate: true,
    threads: true,
    // 6人チーム並列実行設定
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 6,
        minThreads: 6,
        useAtomics: true,
      },
    },
    // チーム専門分野別の並列実行
    sequence: {
      concurrent: true,
      shuffle: true,
      hooks: 'parallel',
    },
    // 高度品質ゲート
    // Flaky test防止
    retry: 2,
    bail: 0,
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/server': path.resolve(__dirname, './src/server'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/data': path.resolve(__dirname, './src/data'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/stores': path.resolve(__dirname, './src/stores'),
    },
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', 'dist', '.next', 'playwright-report', 'e2e/**/*'],
    reporters: [
      'verbose',
      'json',
      'html',
      // 高度レポーティング
      ['junit', { outputFile: './test-results.xml' }],
    ],
    outputFile: {
      json: './test-results.json',
      html: './test-results.html',
      junit: './test-results.xml',
    },
    // 高度テストモード
    passWithNoTests: false,
    logHeapUsage: true,
    // チーム別実行ログ
    silent: false,
    ui: true,
    benchmark: {
      include: ['**/*.bench.{js,ts}'],
      exclude: ['node_modules', 'dist', '.next'],
      outputFile: 'benchmark-results.json',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
