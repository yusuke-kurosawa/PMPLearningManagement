import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/e2e/**',
      '**/playwright/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        'test-results/',
        'playwright-report/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/test/**',
        '**/tests/**',
        '**/__tests__/**',
        '**/mocks/**',
        '**/fixtures/**',
        'vite.config.mjs',
        'vitest.config.ts',
        'tailwind.config.ts',
        'postcss.config.js',
        'src/main.tsx',
        'src/types/',
        'public/',
        'scripts/',
        'docs/',
        '.github/',
        '.vscode/',
        '.claude/'
      ],
      thresholds: {
        global: {
          statements: 80,
          branches: 75,
          functions: 80,
          lines: 80
        }
      }
    },
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 1
      }
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 1000,
    silent: false,
    reporter: ['verbose', 'junit'],
    outputFile: {
      junit: './test-results.xml'
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@/lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
      '@/hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@/stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
      '@/types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@/styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
      '@/utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@/server': fileURLToPath(new URL('./src/server', import.meta.url)),
      '@/data': fileURLToPath(new URL('./src/data', import.meta.url)),
      '@/services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@/contexts': fileURLToPath(new URL('./src/contexts', import.meta.url))
    }
  }
})