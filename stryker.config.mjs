// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress', 'json'],
  testRunner: 'vitest',
  testRunnerNodeArgs: ['--loader=tsx'],
  coverageAnalysis: 'perTest',
  mutate: [
    'src/**/*.ts',
    'src/**/*.tsx',
    '!src/**/*.test.ts',
    '!src/**/*.test.tsx',
    '!src/**/*.spec.ts',
    '!src/**/*.spec.tsx',
    '!src/types/**',
    '!src/test/**',
    '!src/**/*.d.ts'
  ],
  // 高品質水準要件（85%+ Mutation score）
  thresholds: {
    high: 90,
    low: 85,
    break: 80
  },
  // 6人チーム並列実行最適化
  concurrency: 6,
  timeoutMS: 30000,
  timeoutFactor: 2,
  maxConcurrentTestRunners: 6,
  // チーム専門分野別設定
  mutators: {
    // コアロジック・アルゴリズム（2名）
    arithmeticOperator: true,
    arrayDeclaration: true,
    blockStatement: true,
    booleanLiteral: true,
    conditionalExpression: true,
    equality: true,
    logicalOperator: true,
    objectLiteral: true,
    stringLiteral: true,
    unaryOperator: true,
    updateOperator: true,
    // データ整合性・トランザクション（1名）
    methodExpression: true,
    arrowFunction: true,
    // セキュリティ・認証（1名）
    regexMutator: true,
    // API・統合・外部システム（1名）
    returnStatement: true,
    // パフォーマンス・信頼性（1名）
    functionDeclaration: true
  },
  // 高度品質メトリクス
  dashboard: {
    project: 'PMPLearningManagement',
    version: 'main',
    module: 'backend'
  },
  htmlReporter: {
    baseDir: 'mutation-report'
  },
  jsonReporter: {
    fileName: 'mutation-results.json'
  },
  // 並行処理最適化
  dryRunOnly: false,
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',
  // エラーハンドリング強化
  disableTypeChecks: false,
  allowConsoleColors: true,
  logLevel: 'info',
  fileLogLevel: 'debug',
  // Flaky test防止
  maxTestRunnerReuse: 3
};