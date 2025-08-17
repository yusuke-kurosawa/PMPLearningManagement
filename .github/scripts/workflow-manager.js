#!/usr/bin/env node

/**
 * GitHub Actions Workflow Manager
 *
 * 目的: ワークフローの実行状況監視、統計分析、最適化提案
 * 作成者: Claude Code Agent Orchestration System
 * 作成日: 2025-08-13
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

class WorkflowManager {
  constructor() {
    this.workflowsDir = '.github/workflows'
    this.reportDir = '.github/reports'
    this.ensureReportDir()
  }

  /**
   * レポートディレクトリの確保
   */
  ensureReportDir() {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true })
    }
  }

  /**
   * 全ワークフローの分析実行
   */
  async analyzeAllWorkflows() {
    console.log('🔍 GitHub Actions Workflow Analysis Starting...\n')

    try {
      const workflows = this.getWorkflowFiles()
      const runHistory = await this.getWorkflowRunHistory()
      const analysis = this.analyzeWorkflows(workflows, runHistory)

      this.generateReport(analysis)
      this.generateOptimizationSuggestions(analysis)

      console.log('✅ Analysis completed successfully!')
      console.log(`📊 Report generated: ${this.reportDir}/workflow-analysis.md`)
      console.log(`💡 Suggestions generated: ${this.reportDir}/optimization-suggestions.md`)
    } catch (error) {
      console.error('❌ Analysis failed:', error.message)
      process.exit(1)
    }
  }

  /**
   * ワークフローファイル一覧取得
   */
  getWorkflowFiles() {
    const files = fs
      .readdirSync(this.workflowsDir)
      .filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'))
      .map((file) => {
        const filePath = path.join(this.workflowsDir, file)
        const content = fs.readFileSync(filePath, 'utf8')
        return {
          filename: file,
          path: filePath,
          content,
          size: fs.statSync(filePath).size,
          modified: fs.statSync(filePath).mtime,
        }
      })

    console.log(`📁 Found ${files.length} workflow files`)
    return files
  }

  /**
   * ワークフロー実行履歴取得
   */
  async getWorkflowRunHistory() {
    try {
      const output = execSync(
        'gh run list --limit 50 --json conclusion,workflowName,createdAt,status',
        { encoding: 'utf8' }
      )
      const runs = JSON.parse(output)

      console.log(`📈 Analyzed ${runs.length} recent workflow runs`)
      return runs
    } catch (error) {
      console.warn('⚠️ Could not fetch workflow run history. Proceeding with file analysis only.')
      return []
    }
  }

  /**
   * ワークフロー分析実行
   */
  analyzeWorkflows(workflows, runs) {
    console.log('🔬 Analyzing workflows...\n')

    const analysis = {
      summary: {
        totalWorkflows: workflows.length,
        totalSize: workflows.reduce((sum, w) => sum + w.size, 0),
        avgSize: Math.round(workflows.reduce((sum, w) => sum + w.size, 0) / workflows.length),
      },
      patterns: this.findPatterns(workflows),
      duplicates: this.findDuplicates(workflows),
      performance: this.analyzePerformance(runs),
      recommendations: [],
    }

    return analysis
  }

  /**
   * パターン分析
   */
  findPatterns(workflows) {
    const patterns = {
      triggers: {},
      jobs: {},
      actions: {},
      nodeVersions: {},
      runners: {},
    }

    workflows.forEach((workflow) => {
      // トリガーパターン
      const triggerMatches = workflow.content.match(
        /on:\s*\n([\s\S]*?)(?=\n[a-zA-Z]|\nenv:|\njobs:)/
      )
      if (triggerMatches) {
        const triggers = triggerMatches[1].match(/^\s*- (\w+)|\s*(\w+):/gm) || []
        triggers.forEach((trigger) => {
          const cleaned = trigger.replace(/^\s*-?\s*/, '').replace(/:.*$/, '')
          patterns.triggers[cleaned] = (patterns.triggers[cleaned] || 0) + 1
        })
      }

      // Node.jsバージョン
      const nodeMatches = workflow.content.match(/node-version:\s*['"]*(\d+)['"]/g)
      if (nodeMatches) {
        nodeMatches.forEach((match) => {
          const version = match.match(/(\d+)/)[1]
          patterns.nodeVersions[version] = (patterns.nodeVersions[version] || 0) + 1
        })
      }

      // ランナー
      const runnerMatches = workflow.content.match(/runs-on:\s*(\S+)/g)
      if (runnerMatches) {
        runnerMatches.forEach((match) => {
          const runner = match.split(':')[1].trim()
          patterns.runners[runner] = (patterns.runners[runner] || 0) + 1
        })
      }
    })

    return patterns
  }

  /**
   * 重複検出
   */
  findDuplicates(workflows) {
    const duplicates = []
    const jobSignatures = {}

    workflows.forEach((workflow) => {
      // lint実行の重複チェック
      if (workflow.content.includes('npm run lint')) {
        if (!jobSignatures.lint) jobSignatures.lint = []
        jobSignatures.lint.push(workflow.filename)
      }

      // test実行の重複チェック
      if (workflow.content.includes('npm run test')) {
        if (!jobSignatures.test) jobSignatures.test = []
        jobSignatures.test.push(workflow.filename)
      }

      // build実行の重複チェック
      if (workflow.content.includes('npm run build')) {
        if (!jobSignatures.build) jobSignatures.build = []
        jobSignatures.build.push(workflow.filename)
      }
    })

    // 重複があるものを特定
    Object.entries(jobSignatures).forEach(([job, files]) => {
      if (files.length > 1) {
        duplicates.push({
          type: job,
          files: files,
          count: files.length,
        })
      }
    })

    return duplicates
  }

  /**
   * パフォーマンス分析
   */
  analyzePerformance(runs) {
    if (runs.length === 0) {
      return { message: 'No run history available' }
    }

    const workflowStats = {}

    runs.forEach((run) => {
      const name = run.workflowName
      if (!workflowStats[name]) {
        workflowStats[name] = {
          total: 0,
          success: 0,
          failure: 0,
          successRate: 0,
        }
      }

      workflowStats[name].total++
      if (run.conclusion === 'success') {
        workflowStats[name].success++
      } else if (run.conclusion === 'failure') {
        workflowStats[name].failure++
      }
    })

    // 成功率計算
    Object.values(workflowStats).forEach((stats) => {
      stats.successRate = Math.round((stats.success / stats.total) * 100)
    })

    return workflowStats
  }

  /**
   * 分析レポート生成
   */
  generateReport(analysis) {
    const report = `# GitHub Actions Workflow Analysis Report

Generated: ${new Date().toISOString()}

## 📊 Summary

- **Total Workflows**: ${analysis.summary.totalWorkflows}
- **Total Size**: ${Math.round(analysis.summary.totalSize / 1024)} KB
- **Average Size**: ${Math.round(analysis.summary.avgSize / 1024)} KB

## 🔍 Pattern Analysis

### Triggers
${Object.entries(analysis.patterns.triggers)
  .sort((a, b) => b[1] - a[1])
  .map(([trigger, count]) => `- ${trigger}: ${count} workflows`)
  .join('\n')}

### Node.js Versions
${Object.entries(analysis.patterns.nodeVersions)
  .map(([version, count]) => `- Node ${version}: ${count} workflows`)
  .join('\n')}

### Runners
${Object.entries(analysis.patterns.runners)
  .map(([runner, count]) => `- ${runner}: ${count} workflows`)
  .join('\n')}

## 🔄 Duplicate Analysis

${
  analysis.duplicates.length === 0
    ? 'No significant duplicates found.'
    : analysis.duplicates
        .map(
          (dup) =>
            `### ${dup.type} (${dup.count} workflows)\n${dup.files.map((f) => `- ${f}`).join('\n')}`
        )
        .join('\n\n')
}

## 📈 Performance Analysis

${
  typeof analysis.performance === 'object' && analysis.performance.message
    ? analysis.performance.message
    : Object.entries(analysis.performance)
        .sort((a, b) => b[1].successRate - a[1].successRate)
        .map(
          ([name, stats]) =>
            `### ${name}\n- Success Rate: ${stats.successRate}%\n- Total Runs: ${stats.total}\n- Failures: ${stats.failure}`
        )
        .join('\n\n')
}

---
Generated by Claude Code Agent Orchestration System
`

    fs.writeFileSync(path.join(this.reportDir, 'workflow-analysis.md'), report)
  }

  /**
   * 最適化提案生成
   */
  generateOptimizationSuggestions(analysis) {
    const suggestions = []

    // 重複削除提案
    if (analysis.duplicates.length > 0) {
      suggestions.push({
        priority: 'HIGH',
        category: 'Deduplication',
        title: 'Consolidate Duplicate Workflows',
        description: `Found ${analysis.duplicates.length} types of duplicate jobs that can be consolidated`,
        details: analysis.duplicates.map(
          (dup) => `- Merge ${dup.count} workflows running ${dup.type}: ${dup.files.join(', ')}`
        ),
      })
    }

    // Node.jsバージョン統一提案
    const nodeVersions = Object.keys(analysis.patterns.nodeVersions)
    if (nodeVersions.length > 1) {
      suggestions.push({
        priority: 'MEDIUM',
        category: 'Standardization',
        title: 'Standardize Node.js Version',
        description: `Multiple Node.js versions detected: ${nodeVersions.join(', ')}`,
        details: ['Recommend using Node.js 18 consistently across all workflows'],
      })
    }

    // パフォーマンス改善提案
    if (typeof analysis.performance === 'object' && !analysis.performance.message) {
      const lowPerforming = Object.entries(analysis.performance)
        .filter(([_, stats]) => stats.successRate < 80)
        .map(([name, stats]) => ({ name, rate: stats.successRate }))

      if (lowPerforming.length > 0) {
        suggestions.push({
          priority: 'HIGH',
          category: 'Performance',
          title: 'Fix Low-Success-Rate Workflows',
          description: 'Some workflows have low success rates',
          details: lowPerforming.map((w) => `- ${w.name}: ${w.rate}% success rate`),
        })
      }
    }

    const suggestionReport = `# Workflow Optimization Suggestions

Generated: ${new Date().toISOString()}

${
  suggestions.length === 0
    ? '## ✅ No Major Issues Found\n\nYour workflows are well-optimized!'
    : suggestions
        .map(
          (suggestion, index) => `
## ${index + 1}. ${suggestion.title} [${suggestion.priority}]

**Category**: ${suggestion.category}
**Description**: ${suggestion.description}

**Recommended Actions**:
${suggestion.details.map((detail) => `- ${detail}`).join('\n')}
`
        )
        .join('\n')
}

## 💡 General Recommendations

1. **Use Unified CI/CD**: Consider migrating to the new unified workflow (00-unified-ci-cd.yml)
2. **Cache Dependencies**: Ensure npm dependencies are cached for faster builds
3. **Fail Fast**: Use fail-fast strategies to save compute resources
4. **Conditional Execution**: Skip unnecessary jobs based on file changes
5. **Timeout Settings**: Set appropriate timeouts to prevent hanging jobs

---
Generated by Claude Code Agent Orchestration System
`

    fs.writeFileSync(path.join(this.reportDir, 'optimization-suggestions.md'), suggestionReport)
  }

  /**
   * 古いワークフローのバックアップと無効化
   */
  archiveOldWorkflows() {
    console.log('📦 Archiving old workflows...')

    const archiveDir = path.join(this.workflowsDir, 'archive')
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir)
    }

    // 重複ワークフローを特定してアーカイブ
    const duplicateFiles = [
      'test-parallel.yml',
      'advanced-quality-gates.yml',
      '02-quality-pr-validation.yml',
    ]

    duplicateFiles.forEach((file) => {
      const sourcePath = path.join(this.workflowsDir, file)
      const archivePath = path.join(archiveDir, file)

      if (fs.existsSync(sourcePath)) {
        fs.renameSync(sourcePath, archivePath)
        console.log(`📁 Archived: ${file}`)
      }
    })

    console.log('✅ Archiving completed')
  }
}

// 実行部分
if (require.main === module) {
  const manager = new WorkflowManager()

  const command = process.argv[2]

  switch (command) {
    case 'analyze':
      manager.analyzeAllWorkflows()
      break
    case 'archive':
      manager.archiveOldWorkflows()
      break
    case 'all':
      manager.analyzeAllWorkflows().then(() => {
        manager.archiveOldWorkflows()
      })
      break
    default:
      console.log(`
GitHub Actions Workflow Manager

Usage: node workflow-manager.js <command>

Commands:
  analyze  - Analyze all workflows and generate reports
  archive  - Archive duplicate/old workflows  
  all      - Run both analyze and archive

Examples:
  node workflow-manager.js analyze
  node workflow-manager.js archive
  node workflow-manager.js all
`)
      break
  }
}

module.exports = WorkflowManager
