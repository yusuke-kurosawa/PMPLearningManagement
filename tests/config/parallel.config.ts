import { defineConfig } from 'vitest/config'

/**
 * 6人チーム高度並列戦略設定
 *
 * 専門チーム編成:
 * 1. コアロジック・アルゴリズム担当（2名）
 * 2. データ整合性・トランザクション担当（1名）
 * 3. セキュリティ・認証担当（1名）
 * 4. API・統合・外部システム担当（1名）
 * 5. パフォーマンス・負荷・信頼性担当（1名）
 */

export const teamParallelConfig = defineConfig({
  test: {
    // 6人チーム並列実行最適化
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 6,
        minThreads: 6,
        useAtomics: true,
        // チーム専門分野別分離
        isolate: true,
      },
    },
    // チーム別実行シーケンス
    sequence: {
      concurrent: true,
      shuffle: false, // チーム順序維持
      hooks: 'parallel',
      setupFiles: 'parallel',
    },
    // 高度品質ゲート（90%+要件）
    coverage: {
      thresholds: {
        branches: 90,
        functions: 92,
        lines: 91,
        statements: 90,
        perFile: true,
      },
      // チーム別カバレッジ追跡
      include: ['src/server/**/*.ts', 'src/lib/**/*.ts', 'src/services/**/*.ts'],
      reporter: ['text', 'json', 'html', 'lcov', 'teamcity'],
      reportsDirectory: './coverage-team-parallel',
    },
    // 実行時間30秒以内維持
    testTimeout: 30000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    // Flaky test防止
    retry: 2,
    bail: 0,
    // 高度レポーティング
    reporters: [
      'verbose',
      'json',
      'html',
      ['junit', { outputFile: './test-results-team-parallel.xml' }],
    ],
    // チーム別ログ分離
    logHeapUsage: true,
    silent: false,
    // 境界値・エッジケース強化
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup/globalSetup.ts'],
    teardownFiles: ['./tests/teardown/globalTeardown.ts'],
  },
})

export default teamParallelConfig
