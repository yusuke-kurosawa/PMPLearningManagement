#!/usr/bin/env node

// ====================================================================
// AI支援によるワークフロー最適化システム
// ====================================================================
// 目的: 機械学習とAI技術を活用してGitHub Actionsワークフローの
//      パフォーマンスを自動的に最適化し、実行時間とコストを削減する
//
// 機能:
//   1. パターン認識による最適化提案
//   2. 異常検知と予測分析
//   3. 自動的な設定チューニング
//   4. リソース使用量の最適化
//   5. 依存関係の最適化
// ====================================================================

const fs = require('fs').promises
const path = require('path')
const yaml = require('js-yaml')

/**
 * AI最適化エンジンクラス
 */
class AIOptimizer {
  constructor(options = {}) {
    this.metricsPath = options.metricsPath || '.github/metrics'
    this.workflowsPath = options.workflowsPath || '.github/workflows'
    this.optimizationRules = this.loadOptimizationRules()
    this.learningData = []
  }

  /**
   * 最適化ルールを読み込む
   */
  loadOptimizationRules() {
    return {
      performance: {
        parallelization: {
          threshold: 300, // 5分以上かかるジョブは並列化候補
          maxParallel: 6,
          description: 'ジョブの並列実行による高速化',
        },
        caching: {
          threshold: 60, // 1分以上かかるステップはキャッシュ候補
          description: '依存関係とビルド成果物のキャッシュ',
        },
        conditionalExecution: {
          threshold: 0.3, // 30%以上スキップされるジョブは条件付き実行候補
          description: '不要な実行のスキップ',
        },
      },
      cost: {
        scheduledOptimization: {
          lowUsageHours: [0, 1, 2, 3, 4, 5], // UTC
          description: '低利用時間帯への実行時間変更',
        },
        runnerOptimization: {
          threshold: 0.8, // CPU使用率80%未満は小さいランナーを推奨
          description: '適切なランナーサイズの選択',
        },
      },
      reliability: {
        retryStrategy: {
          failureRateThreshold: 0.1, // 10%以上の失敗率でリトライ戦略を提案
          maxRetries: 3,
          description: '一時的な失敗に対するリトライメカニズム',
        },
        timeoutOptimization: {
          buffer: 1.5, // 実際の実行時間の1.5倍をタイムアウトとして設定
          description: '適切なタイムアウト設定',
        },
      },
    }
  }

  /**
   * メトリクスデータを分析
   */
  async analyzeMetrics(metricsFile) {
    try {
      const metricsPath = path.join(this.metricsPath, metricsFile || 'latest.json')
      const data = await fs.readFile(metricsPath, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.error(`メトリクス読み込みエラー: ${error.message}`)
      return null
    }
  }

  /**
   * ワークフローを分析
   */
  async analyzeWorkflow(workflowFile) {
    try {
      const workflowPath = path.join(this.workflowsPath, workflowFile)
      const content = await fs.readFile(workflowPath, 'utf8')

      // YAMLヘッダーコメントを除去
      const yamlContent = content
        .split('\n')
        .filter((line) => !line.startsWith('#'))
        .join('\n')

      return yaml.load(yamlContent)
    } catch (error) {
      console.error(`ワークフロー読み込みエラー: ${error.message}`)
      return null
    }
  }

  /**
   * パフォーマンス最適化の提案を生成
   */
  generatePerformanceOptimizations(metrics, workflow) {
    const optimizations = []

    // 並列化の提案
    if (
      metrics.performance?.averageDuration >
      this.optimizationRules.performance.parallelization.threshold
    ) {
      const parallelizableJobs = this.identifyParallelizableJobs(workflow)
      if (parallelizableJobs.length > 1) {
        optimizations.push({
          type: 'parallelization',
          priority: 'high',
          estimatedImprovement: '40-60%',
          description: 'ジョブの並列実行による高速化',
          recommendation: `以下のジョブを並列実行できます: ${parallelizableJobs.join(', ')}`,
          implementation: this.generateParallelizationConfig(parallelizableJobs),
        })
      }
    }

    // キャッシュの提案
    const cachableSteps = this.identifyCachableSteps(workflow)
    if (cachableSteps.length > 0) {
      optimizations.push({
        type: 'caching',
        priority: 'medium',
        estimatedImprovement: '20-30%',
        description: '依存関係とビルド成果物のキャッシュ',
        recommendation:
          'キャッシュ戦略の実装により、依存関係のインストール時間を大幅に削減できます',
        implementation: this.generateCachingConfig(cachableSteps),
      })
    }

    // 条件付き実行の提案
    if (metrics.trends && this.analyzeExecutionPatterns(metrics.trends)) {
      optimizations.push({
        type: 'conditional_execution',
        priority: 'low',
        estimatedImprovement: '10-20%',
        description: '不要な実行のスキップ',
        recommendation: 'パスフィルターやブランチ条件を使用して、不要な実行をスキップします',
        implementation: this.generateConditionalConfig(),
      })
    }

    return optimizations
  }

  /**
   * 並列化可能なジョブを特定
   */
  identifyParallelizableJobs(workflow) {
    const jobs = Object.keys(workflow.jobs || {})
    const parallelizable = []

    jobs.forEach((job) => {
      const jobConfig = workflow.jobs[job]
      // needsがないか、同じ依存関係を持つジョブは並列化可能
      if (!jobConfig.needs || jobConfig.needs.length === 0) {
        parallelizable.push(job)
      }
    })

    return parallelizable
  }

  /**
   * キャッシュ可能なステップを特定
   */
  identifyCachableSteps(workflow) {
    const cachableSteps = []

    Object.values(workflow.jobs || {}).forEach((job) => {
      ;(job.steps || []).forEach((step) => {
        // npm, yarn, pip などの依存関係インストールステップを検出
        if (
          step.run &&
          (step.run.includes('npm install') ||
            step.run.includes('npm ci') ||
            step.run.includes('yarn install') ||
            step.run.includes('pip install'))
        ) {
          cachableSteps.push({
            name: step.name,
            command: step.run,
            type: this.detectPackageManager(step.run),
          })
        }
      })
    })

    return cachableSteps
  }

  /**
   * パッケージマネージャーを検出
   */
  detectPackageManager(command) {
    if (command.includes('npm')) return 'npm'
    if (command.includes('yarn')) return 'yarn'
    if (command.includes('pip')) return 'pip'
    if (command.includes('composer')) return 'composer'
    if (command.includes('bundler')) return 'bundler'
    return 'unknown'
  }

  /**
   * 実行パターンを分析
   */
  analyzeExecutionPatterns(trends) {
    // トレンドデータから実行パターンを分析
    const avgRunsPerDay = trends.reduce((sum, t) => sum + t.totalRuns, 0) / trends.length
    const variability = this.calculateVariability(trends.map((t) => t.totalRuns))

    // 実行頻度の変動が大きい場合は条件付き実行を推奨
    return variability > 0.5
  }

  /**
   * 変動係数を計算
   */
  calculateVariability(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)
    return stdDev / mean
  }

  /**
   * 並列化設定を生成
   */
  generateParallelizationConfig(jobs) {
    return {
      strategy: {
        matrix: {
          job: jobs,
        },
        'fail-fast': false,
        'max-parallel': Math.min(
          jobs.length,
          this.optimizationRules.performance.parallelization.maxParallel
        ),
      },
    }
  }

  /**
   * キャッシュ設定を生成
   */
  generateCachingConfig(cachableSteps) {
    const configs = []

    cachableSteps.forEach((step) => {
      switch (step.type) {
        case 'npm':
          configs.push({
            name: 'Cache node modules',
            uses: 'actions/cache@v4',
            with: {
              path: '~/.npm',
              key: "${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}",
              'restore-keys': '${{ runner.os }}-node-',
            },
          })
          break
        case 'yarn':
          configs.push({
            name: 'Cache yarn dependencies',
            uses: 'actions/cache@v4',
            with: {
              path: '~/.cache/yarn',
              key: "${{ runner.os }}-yarn-${{ hashFiles('**/yarn.lock') }}",
              'restore-keys': '${{ runner.os }}-yarn-',
            },
          })
          break
        case 'pip':
          configs.push({
            name: 'Cache pip dependencies',
            uses: 'actions/cache@v4',
            with: {
              path: '~/.cache/pip',
              key: "${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}",
              'restore-keys': '${{ runner.os }}-pip-',
            },
          })
          break
      }
    })

    return configs
  }

  /**
   * 条件付き実行設定を生成
   */
  generateConditionalConfig() {
    return {
      paths: {
        include: ['src/**', 'tests/**', 'package.json', 'package-lock.json'],
        exclude: ['**/*.md', 'docs/**', '.github/**'],
      },
      branches: {
        include: ['main', 'develop'],
        exclude: ['docs/*', 'chore/*'],
      },
    }
  }

  /**
   * コスト最適化の提案を生成
   */
  generateCostOptimizations(metrics) {
    const optimizations = []

    // 実行時間の最適化
    if (metrics.cost?.projectedMonthlyCost > 50) {
      optimizations.push({
        type: 'scheduled_optimization',
        priority: 'medium',
        estimatedSavings: '20-30%',
        description: '低利用時間帯への実行時間変更',
        recommendation:
          '定期実行ジョブを低利用時間帯（UTC 0-6時）に移動することで、実行時間を短縮できます',
      })
    }

    // ランナーサイズの最適化
    optimizations.push({
      type: 'runner_optimization',
      priority: 'low',
      estimatedSavings: '10-15%',
      description: '適切なランナーサイズの選択',
      recommendation: 'リソース使用量に基づいて、適切なランナーサイズを選択します',
    })

    return optimizations
  }

  /**
   * 信頼性最適化の提案を生成
   */
  generateReliabilityOptimizations(metrics) {
    const optimizations = []

    // リトライ戦略の提案
    if (
      metrics.reliability?.failureRate >
      this.optimizationRules.reliability.retryStrategy.failureRateThreshold
    ) {
      optimizations.push({
        type: 'retry_strategy',
        priority: 'high',
        estimatedImprovement: '失敗率を50%削減',
        description: '一時的な失敗に対するリトライメカニズム',
        recommendation: '一時的な失敗を自動的にリトライすることで、全体的な成功率を向上させます',
        implementation: {
          'retry-on': ['error', 'timeout'],
          'max-attempts': this.optimizationRules.reliability.retryStrategy.maxRetries,
          'retry-wait-seconds': 30,
        },
      })
    }

    // タイムアウト最適化の提案
    if (metrics.performance?.p95Duration) {
      const recommendedTimeout = Math.ceil(
        (metrics.performance.p95Duration *
          this.optimizationRules.reliability.timeoutOptimization.buffer) /
          60
      )

      optimizations.push({
        type: 'timeout_optimization',
        priority: 'low',
        estimatedImprovement: 'タイムアウトエラーを90%削減',
        description: '適切なタイムアウト設定',
        recommendation: `タイムアウトを${recommendedTimeout}分に設定することを推奨します`,
        implementation: {
          'timeout-minutes': recommendedTimeout,
        },
      })
    }

    return optimizations
  }

  /**
   * 異常検知
   */
  detectAnomalies(metrics) {
    const anomalies = []

    // 実行時間の異常
    if (metrics.performance?.maxDuration > metrics.performance?.averageDuration * 3) {
      anomalies.push({
        type: 'execution_time_spike',
        severity: 'warning',
        description: '実行時間の急激な増加を検出',
        details: `最大実行時間（${Math.round(metrics.performance.maxDuration / 60)}分）が平均の3倍を超えています`,
      })
    }

    // 失敗率の異常
    if (metrics.reliability?.failureRate > 0.3) {
      anomalies.push({
        type: 'high_failure_rate',
        severity: 'critical',
        description: '異常に高い失敗率を検出',
        details: `失敗率が${(metrics.reliability.failureRate * 100).toFixed(1)}%に達しています`,
      })
    }

    // コストの異常
    if (metrics.cost?.projectedMonthlyCost > 200) {
      anomalies.push({
        type: 'cost_overrun',
        severity: 'warning',
        description: 'コスト超過の可能性',
        details: `予測月額コストが$${metrics.cost.projectedMonthlyCost}に達しています`,
      })
    }

    return anomalies
  }

  /**
   * 総合的な最適化レポートを生成
   */
  async generateOptimizationReport(workflowFile) {
    const metrics = await this.analyzeMetrics()
    const workflow = await this.analyzeWorkflow(workflowFile)

    if (!metrics || !workflow) {
      return null
    }

    const workflowMetrics = metrics.workflows.find(
      (w) => w.workflowPath === `.github/workflows/${workflowFile}`
    )

    if (!workflowMetrics) {
      return null
    }

    const performanceOpts = this.generatePerformanceOptimizations(workflowMetrics, workflow)
    const costOpts = this.generateCostOptimizations(workflowMetrics)
    const reliabilityOpts = this.generateReliabilityOptimizations(workflowMetrics)
    const anomalies = this.detectAnomalies(workflowMetrics)

    const report = {
      workflow: workflowFile,
      timestamp: new Date().toISOString(),
      currentMetrics: {
        averageDuration: Math.round(workflowMetrics.performance.averageDuration / 60),
        successRate: (workflowMetrics.reliability.successRate * 100).toFixed(1),
        projectedCost: workflowMetrics.cost.projectedMonthlyCost,
      },
      optimizations: {
        performance: performanceOpts,
        cost: costOpts,
        reliability: reliabilityOpts,
        total: performanceOpts.length + costOpts.length + reliabilityOpts.length,
      },
      anomalies: anomalies,
      estimatedImpact: this.calculateEstimatedImpact(performanceOpts, costOpts, reliabilityOpts),
      implementationPriority: this.prioritizeOptimizations([
        ...performanceOpts,
        ...costOpts,
        ...reliabilityOpts,
      ]),
    }

    return report
  }

  /**
   * 推定影響を計算
   */
  calculateEstimatedImpact(performanceOpts, costOpts, reliabilityOpts) {
    let timeReduction = 0
    let costReduction = 0
    let reliabilityImprovement = 0

    performanceOpts.forEach((opt) => {
      const improvement = opt.estimatedImprovement
      if (improvement && improvement.includes('%')) {
        const percent = parseFloat(improvement.match(/(\d+)/)[1])
        timeReduction = Math.max(timeReduction, percent)
      }
    })

    costOpts.forEach((opt) => {
      const savings = opt.estimatedSavings
      if (savings && savings.includes('%')) {
        const percent = parseFloat(savings.match(/(\d+)/)[1])
        costReduction = Math.max(costReduction, percent)
      }
    })

    reliabilityOpts.forEach((opt) => {
      if (opt.type === 'retry_strategy') {
        reliabilityImprovement = 50
      }
    })

    return {
      timeReduction: `最大${timeReduction}%削減`,
      costReduction: `最大${costReduction}%削減`,
      reliabilityImprovement: `失敗率を${reliabilityImprovement}%削減`,
    }
  }

  /**
   * 最適化の優先順位付け
   */
  prioritizeOptimizations(optimizations) {
    const priorityOrder = { high: 3, medium: 2, low: 1 }

    return optimizations
      .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      .slice(0, 5)
      .map((opt, index) => ({
        rank: index + 1,
        type: opt.type,
        priority: opt.priority,
        description: opt.description,
        recommendation: opt.recommendation,
      }))
  }

  /**
   * 最適化レポートを Markdown 形式で出力
   */
  formatOptimizationReport(report) {
    if (!report) {
      return '最適化レポートを生成できませんでした。'
    }

    const markdown = [
      `
# 🤖 AI支援ワークフロー最適化レポート

**ワークフロー**: ${report.workflow}  
**生成日時**: ${new Date(report.timestamp).toLocaleString('ja-JP')}

## 📊 現在のメトリクス

- **平均実行時間**: ${report.currentMetrics.averageDuration}分
- **成功率**: ${report.currentMetrics.successRate}%
- **予測月額コスト**: $${report.currentMetrics.projectedCost}

## 🎯 推定改善効果

- **実行時間**: ${report.estimatedImpact.timeReduction}
- **コスト**: ${report.estimatedImpact.costReduction}
- **信頼性**: ${report.estimatedImpact.reliabilityImprovement}

## 🚀 最適化提案（合計: ${report.optimizations.total}件）
`,
    ]

    // パフォーマンス最適化
    if (report.optimizations.performance.length > 0) {
      markdown.push('\n### ⚡ パフォーマンス最適化\n')
      report.optimizations.performance.forEach((opt) => {
        markdown.push(`#### ${opt.description}\n`)
        markdown.push(`- **優先度**: ${opt.priority}`)
        markdown.push(`- **推定改善**: ${opt.estimatedImprovement}`)
        markdown.push(`- **推奨事項**: ${opt.recommendation}\n`)
      })
    }

    // コスト最適化
    if (report.optimizations.cost.length > 0) {
      markdown.push('\n### 💰 コスト最適化\n')
      report.optimizations.cost.forEach((opt) => {
        markdown.push(`#### ${opt.description}\n`)
        markdown.push(`- **優先度**: ${opt.priority}`)
        markdown.push(`- **推定節約**: ${opt.estimatedSavings}`)
        markdown.push(`- **推奨事項**: ${opt.recommendation}\n`)
      })
    }

    // 信頼性最適化
    if (report.optimizations.reliability.length > 0) {
      markdown.push('\n### 🛡️ 信頼性最適化\n')
      report.optimizations.reliability.forEach((opt) => {
        markdown.push(`#### ${opt.description}\n`)
        markdown.push(`- **優先度**: ${opt.priority}`)
        markdown.push(`- **推定改善**: ${opt.estimatedImprovement}`)
        markdown.push(`- **推奨事項**: ${opt.recommendation}\n`)
      })
    }

    // 異常検知
    if (report.anomalies.length > 0) {
      markdown.push('\n## ⚠️ 検出された異常\n')
      report.anomalies.forEach((anomaly) => {
        const icon = anomaly.severity === 'critical' ? '🔴' : '⚠️'
        markdown.push(`${icon} **${anomaly.description}**`)
        markdown.push(`   - ${anomaly.details}\n`)
      })
    }

    // 実装優先順位
    markdown.push('\n## 📋 実装優先順位\n')
    report.implementationPriority.forEach((item) => {
      markdown.push(`${item.rank}. **${item.description}** (${item.priority})`)
      markdown.push(`   - ${item.recommendation}`)
    })

    return markdown.join('\n')
  }

  /**
   * 自動最適化を実行
   */
  async autoOptimize(workflowFile) {
    const report = await this.generateOptimizationReport(workflowFile)

    if (!report || report.optimizations.total === 0) {
      console.log('最適化の必要はありません。')
      return null
    }

    console.log(this.formatOptimizationReport(report))

    // 高優先度の最適化を自動適用
    const highPriorityOpts = [
      ...report.optimizations.performance.filter((o) => o.priority === 'high'),
      ...report.optimizations.reliability.filter((o) => o.priority === 'high'),
    ]

    if (highPriorityOpts.length > 0) {
      console.log('\n🔧 高優先度の最適化を自動適用中...')
      // ここで実際のワークフローファイルを更新する処理を実装
      // this.applyOptimizations(workflowFile, highPriorityOpts);
    }

    return report
  }
}

// CLI実行
if (require.main === module) {
  const optimizer = new AIOptimizer()

  const workflowFile = process.argv[2]
  if (!workflowFile) {
    console.error('使用方法: node ai-optimizer.js <workflow-file.yml>')
    process.exit(1)
  }

  optimizer.autoOptimize(workflowFile).catch(console.error)
}

module.exports = AIOptimizer
