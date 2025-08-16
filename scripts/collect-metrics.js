#!/usr/bin/env node

/**
 * DevOps メトリクス収集スクリプト
 * GitHub ActionsやプロジェクトのメトリクスをJSON形式で収集
 * Issue: #77
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// メトリクス収集クラス
class MetricsCollector {
  constructor() {
    this.metrics = {
      timestamp: new Date().toISOString(),
      github_actions: {},
      repository: {},
      performance: {},
      quality: {},
    }
  }

  // GitHub Actions メトリクス収集
  async collectGitHubActionsMetrics() {
    console.log('📊 GitHub Actions メトリクスを収集中...')

    try {
      // 直近のワークフロー実行を取得
      const runsJson = execSync(
        'gh run list --limit 100 --json status,conclusion,createdAt,updatedAt,name',
        {
          encoding: 'utf-8',
        }
      )

      const runs = JSON.parse(runsJson)

      // 統計計算
      const totalRuns = runs.length
      const successRuns = runs.filter((r) => r.conclusion === 'success').length
      const failedRuns = runs.filter((r) => r.conclusion === 'failure').length
      const inProgressRuns = runs.filter((r) => r.status === 'in_progress').length

      // 平均実行時間計算
      const durations = runs
        .filter((r) => r.conclusion && r.createdAt && r.updatedAt)
        .map((r) => {
          const start = new Date(r.createdAt)
          const end = new Date(r.updatedAt)
          return (end - start) / 1000 / 60 // 分単位
        })

      const avgDuration =
        durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0

      this.metrics.github_actions = {
        total_runs: totalRuns,
        success_runs: successRuns,
        failed_runs: failedRuns,
        in_progress_runs: inProgressRuns,
        success_rate: totalRuns > 0 ? ((successRuns / totalRuns) * 100).toFixed(1) : 0,
        avg_duration_minutes: avgDuration.toFixed(1),
      }

      console.log('✅ GitHub Actions メトリクス収集完了')
    } catch (error) {
      console.error('❌ GitHub Actions メトリクス収集エラー:', error.message)
      this.metrics.github_actions = { error: error.message }
    }
  }

  // リポジトリメトリクス収集
  async collectRepositoryMetrics() {
    console.log('📚 リポジトリメトリクスを収集中...')

    try {
      // コミット数（過去30日）
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const commitCount = execSync(
        `git rev-list --count --since="${thirtyDaysAgo.toISOString()}" HEAD`,
        {
          encoding: 'utf-8',
        }
      ).trim()

      // ブランチ数
      const branchCount = execSync('git branch -r | wc -l', {
        encoding: 'utf-8',
      }).trim()

      // ファイル数統計
      const jsFiles = execSync('find src -name "*.js" -o -name "*.jsx" | wc -l', {
        encoding: 'utf-8',
      }).trim()

      const tsFiles = execSync('find src -name "*.ts" -o -name "*.tsx" | wc -l', {
        encoding: 'utf-8',
      }).trim()

      // Issue & PR統計
      const openIssues = execSync('gh issue list --state open --json number | jq length', {
        encoding: 'utf-8',
      }).trim()

      const openPRs = execSync('gh pr list --state open --json number | jq length', {
        encoding: 'utf-8',
      }).trim()

      this.metrics.repository = {
        commits_last_30_days: parseInt(commitCount),
        total_branches: parseInt(branchCount),
        js_files: parseInt(jsFiles),
        ts_files: parseInt(tsFiles),
        open_issues: parseInt(openIssues),
        open_prs: parseInt(openPRs),
      }

      console.log('✅ リポジトリメトリクス収集完了')
    } catch (error) {
      console.error('❌ リポジトリメトリクス収集エラー:', error.message)
      this.metrics.repository = { error: error.message }
    }
  }

  // パフォーマンスメトリクス収集
  async collectPerformanceMetrics() {
    console.log('⚡ パフォーマンスメトリクスを収集中...')

    try {
      // ビルド時間測定（シミュレート）
      const buildStartTime = Date.now()
      execSync('npm run build --if-present', {
        encoding: 'utf-8',
        stdio: 'pipe',
      })
      const buildTime = (Date.now() - buildStartTime) / 1000

      // バンドルサイズ
      let bundleSize = 0
      if (fs.existsSync('dist')) {
        const distSize = execSync('du -sb dist | cut -f1', {
          encoding: 'utf-8',
        }).trim()
        bundleSize = parseInt(distSize) / 1024 / 1024 // MB単位
      }

      this.metrics.performance = {
        build_time_seconds: buildTime.toFixed(1),
        bundle_size_mb: bundleSize.toFixed(2),
      }

      console.log('✅ パフォーマンスメトリクス収集完了')
    } catch (error) {
      console.error('❌ パフォーマンスメトリクス収集エラー:', error.message)
      this.metrics.performance = { error: error.message }
    }
  }

  // 品質メトリクス収集
  async collectQualityMetrics() {
    console.log('🎯 品質メトリクスを収集中...')

    try {
      // ESLintエラー/警告
      let eslintResults = { errors: 0, warnings: 0 }
      try {
        const eslintOutput = execSync('npm run lint --silent 2>&1 || true', {
          encoding: 'utf-8',
        })

        // ESLint出力からエラー/警告をパース
        const errorMatch = eslintOutput.match(/(\d+) errors?/)
        const warningMatch = eslintOutput.match(/(\d+) warnings?/)

        if (errorMatch) eslintResults.errors = parseInt(errorMatch[1])
        if (warningMatch) eslintResults.warnings = parseInt(warningMatch[1])
      } catch (e) {
        // ESLintエラーは無視
      }

      // テストカバレッジ（存在する場合）
      let coverage = null
      if (fs.existsSync('coverage/coverage-summary.json')) {
        const coverageSummary = JSON.parse(
          fs.readFileSync('coverage/coverage-summary.json', 'utf-8')
        )
        coverage = {
          lines: coverageSummary.total.lines.pct,
          statements: coverageSummary.total.statements.pct,
          functions: coverageSummary.total.functions.pct,
          branches: coverageSummary.total.branches.pct,
        }
      }

      this.metrics.quality = {
        eslint_errors: eslintResults.errors,
        eslint_warnings: eslintResults.warnings,
        test_coverage: coverage,
      }

      console.log('✅ 品質メトリクス収集完了')
    } catch (error) {
      console.error('❌ 品質メトリクス収集エラー:', error.message)
      this.metrics.quality = { error: error.message }
    }
  }

  // 全メトリクス収集
  async collectAll() {
    console.log('🚀 DevOps メトリクス収集開始...')
    console.log('================================')

    await this.collectGitHubActionsMetrics()
    await this.collectRepositoryMetrics()
    await this.collectPerformanceMetrics()
    await this.collectQualityMetrics()

    console.log('================================')
    console.log('✅ 全メトリクス収集完了')

    return this.metrics
  }

  // メトリクスをファイルに保存
  saveToFile(filename = 'devops-metrics.json') {
    const filepath = path.join(process.cwd(), filename)
    fs.writeFileSync(filepath, JSON.stringify(this.metrics, null, 2))
    console.log(`📄 メトリクスを ${filename} に保存しました`)
  }

  // メトリクスサマリー表示
  displaySummary() {
    console.log('\n📊 メトリクスサマリー')
    console.log('================================')

    if (this.metrics.github_actions.total_runs) {
      console.log('GitHub Actions:')
      console.log(`  成功率: ${this.metrics.github_actions.success_rate}%`)
      console.log(`  平均実行時間: ${this.metrics.github_actions.avg_duration_minutes}分`)
    }

    if (this.metrics.repository.commits_last_30_days !== undefined) {
      console.log('\nリポジトリ:')
      console.log(`  30日間のコミット: ${this.metrics.repository.commits_last_30_days}`)
      console.log(`  TypeScriptファイル: ${this.metrics.repository.ts_files}`)
      console.log(`  オープンIssue: ${this.metrics.repository.open_issues}`)
    }

    if (this.metrics.quality.eslint_errors !== undefined) {
      console.log('\n品質:')
      console.log(`  ESLintエラー: ${this.metrics.quality.eslint_errors}`)
      console.log(`  ESLint警告: ${this.metrics.quality.eslint_warnings}`)
    }

    console.log('================================\n')
  }
}

// メイン実行
async function main() {
  const collector = new MetricsCollector()

  try {
    await collector.collectAll()
    collector.displaySummary()
    collector.saveToFile()

    // GitHub Actions環境の場合、出力変数を設定
    if (process.env.GITHUB_ACTIONS) {
      console.log(`::set-output name=metrics::${JSON.stringify(collector.metrics)}`)
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ メトリクス収集に失敗しました:', error)
    process.exit(1)
  }
}

// 実行
if (require.main === module) {
  main()
}

module.exports = MetricsCollector
