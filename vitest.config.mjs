/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
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
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/lib': resolve(__dirname, './src/lib'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/stores': resolve(__dirname, './src/stores'),
      '@/types': resolve(__dirname, './src/types'),
      '@/styles': resolve(__dirname, './src/styles'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/server': resolve(__dirname, './src/server'),
      '@/data': resolve(__dirname, './src/data'),
      '@/services': resolve(__dirname, './src/services'),
      '@/contexts': resolve(__dirname, './src/contexts')
    }
  }
});