#!/usr/bin/env node
/**
 * Claude Code Interaction Analyzer
 * TypeScript version with enhanced analytics and pattern detection
 */

import { Octokit } from '@octokit/rest'
import * as fs from 'fs/promises'
import * as path from 'path'
import type {
  CLIConfig,
  Logger,
  LogLevel,
  ExitCode,
  ScriptOptions,
  ScriptResult
} from '../src/types/devops/scripts.js'
import type {
  GitHubIssue,
  GitHubRepository,
  IssueMetrics
} from '../src/types/devops/github.js'

// ==================== Type Definitions ====================

interface ClaudeInteractionConfig {
  token: string
  owner: string
  repo: string
  labels?: string[]
}

interface InteractionAnalysis {
  total: number
  byType: Record<string, number>
  byPriority: Record<string, number>
  byMonth: Record<string, number>
  avgResolutionTime: number
  topKeywords: Record<string, number>
  trendsOverTime: TrendPoint[]
}

interface TrendPoint {
  date: string
  count: number
  type?: string
}

interface AnalysisInsight {
  type: 'development_focus' | 'priority_analysis' | 'activity_trend' | 'quality_assessment'
  title: string
  description: string
  recommendation: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  metrics?: Record<string, number>
}

interface InteractionReport {
  timestamp: string
  analysis: InteractionAnalysis
  insights: AnalysisInsight[]
  recommendations: string[]
  summary: {
    totalInteractions: number
    mostCommonType: string
    highPriorityRate: number
    activityTrend: 'increasing' | 'decreasing' | 'stable'
  }
}

// ==================== Main Class ====================

class ClaudeInteractionAnalyzer {
  private octokit: Octokit
  private config: ClaudeInteractionConfig

  constructor(config: ClaudeInteractionConfig) {
    this.octokit = new Octokit({ auth: config.token })
    this.config = {
      labels: ['claude-code'],
      ...config
    }
  }

  /**
   * Fetch all Claude-related issues
   */
  async fetchClaudeIssues(): Promise<GitHubIssue[]> {
    try {
      const issues: GitHubIssue[] = []
      
      for (const label of this.config.labels || ['claude-code']) {
        const { data } = await this.octokit.rest.issues.listForRepo({
          owner: this.config.owner,
          repo: this.config.repo,
          labels: label,
          state: 'all',
          per_page: 100,
        })
        
        issues.push(...data as GitHubIssue[])
      }

      // Remove duplicates
      const uniqueIssues = issues.filter((issue, index, self) => 
        index === self.findIndex(i => i.id === issue.id)
      )

      return uniqueIssues
    } catch (error) {
      this.log(`Error fetching issues: ${error}`, 'error')
      return []
    }
  }

  /**
   * Analyze interaction patterns
   */
  analyzePatterns(issues: GitHubIssue[]): InteractionAnalysis {
    const analysis: InteractionAnalysis = {
      total: issues.length,
      byType: {},
      byPriority: {},
      byMonth: {},
      avgResolutionTime: 0,
      topKeywords: {},
      trendsOverTime: [],
    }

    let totalResolutionTime = 0
    let resolvedIssues = 0

    issues.forEach((issue) => {
      // Extract metadata from labels
      const typeLabel = issue.labels?.find((l) => 
        typeof l === 'object' && l.name?.startsWith('type:')
      )
      const priorityLabel = issue.labels?.find((l) => 
        typeof l === 'object' && l.name?.startsWith('priority:')
      )

      if (typeLabel && typeof typeLabel === 'object' && typeLabel.name) {
        const type = typeLabel.name.replace('type:', '')
        analysis.byType[type] = (analysis.byType[type] || 0) + 1
      }

      if (priorityLabel && typeof priorityLabel === 'object' && priorityLabel.name) {
        const priority = priorityLabel.name.replace('priority:', '')
        analysis.byPriority[priority] = (analysis.byPriority[priority] || 0) + 1
      }

      // Analyze by month
      const month = new Date(issue.created_at).toISOString().slice(0, 7)
      analysis.byMonth[month] = (analysis.byMonth[month] || 0) + 1

      // Calculate resolution time for closed issues
      if (issue.state === 'closed' && issue.closed_at) {
        const created = new Date(issue.created_at).getTime()
        const closed = new Date(issue.closed_at).getTime()
        const resolutionHours = (closed - created) / (1000 * 60 * 60)
        totalResolutionTime += resolutionHours
        resolvedIssues++
      }

      // Extract keywords from titles and body
      const text = `${issue.title} ${issue.body || ''}`.toLowerCase()
      const keywords = text.match(/\b\w{4,}\b/g) || []
      keywords.forEach((word) => {
        if (!this.isStopWord(word)) {
          analysis.topKeywords[word] = (analysis.topKeywords[word] || 0) + 1
        }
      })
    })

    // Calculate average resolution time
    analysis.avgResolutionTime = resolvedIssues > 0 ? totalResolutionTime / resolvedIssues : 0

    // Sort top keywords
    const sortedKeywords = Object.entries(analysis.topKeywords)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
    
    analysis.topKeywords = Object.fromEntries(sortedKeywords)

    // Generate trend data
    analysis.trendsOverTime = this.generateTrendData(analysis.byMonth)

    return analysis
  }

  /**
   * Generate trend data points
   */
  private generateTrendData(monthlyData: Record<string, number>): TrendPoint[] {
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))
  }

  /**
   * Generate insights and recommendations
   */
  generateInsights(analysis: InteractionAnalysis): AnalysisInsight[] {
    const insights: AnalysisInsight[] = []

    // Most active development areas
    const topTypes = Object.entries(analysis.byType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)

    if (topTypes.length > 0) {
      insights.push({
        type: 'development_focus',
        title: 'Primary Development Areas',
        description: `Most activity: ${topTypes.map(([type, count]) => `${type} (${count})`).join(', ')}`,
        recommendation: 'Consider creating specialized workflows for frequently used interaction types.',
        metrics: Object.fromEntries(topTypes)
      })
    }

    // Priority distribution
    const highPriority = (analysis.byPriority.critical || 0) + (analysis.byPriority.high || 0)
    const totalPriority = Object.values(analysis.byPriority).reduce((a, b) => a + b, 0)
    const highPriorityRate = totalPriority > 0 ? (highPriority / totalPriority) * 100 : 0

    insights.push({
      type: 'priority_analysis',
      title: 'Priority Distribution',
      description: `${highPriorityRate.toFixed(1)}% of interactions are high/critical priority`,
      recommendation: highPriorityRate > 50
        ? 'High urgency rate - consider improving planning and proactive development'
        : 'Good balance of priorities - maintain current workflow',
      severity: highPriorityRate > 70 ? 'high' : highPriorityRate > 50 ? 'medium' : 'low',
      metrics: { highPriorityRate, totalPriority, highPriority }
    })

    // Growth trends
    const recentMonths = Object.entries(analysis.byMonth)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 3)

    if (recentMonths.length >= 2) {
      const currentCount = recentMonths[0][1]
      const previousCount = recentMonths[1][1]
      const trend = currentCount > previousCount ? 'increasing' : 
                   currentCount < previousCount ? 'decreasing' : 'stable'
      
      insights.push({
        type: 'activity_trend',
        title: 'Recent Activity Trend',
        description: `Development activity is ${trend} (${currentCount} vs ${previousCount} issues)`,
        recommendation: trend === 'increasing'
          ? 'Consider scaling automation and documentation processes'
          : trend === 'decreasing'
          ? 'Focus on consolidating and optimizing existing features'
          : 'Maintain current development pace and processes',
        metrics: { currentCount, previousCount, changePercent: ((currentCount - previousCount) / previousCount * 100) }
      })
    }

    // Quality assessment based on resolution time
    if (analysis.avgResolutionTime > 0) {
      const resolutionDays = analysis.avgResolutionTime / 24
      let qualitySeverity: 'low' | 'medium' | 'high' = 'low'
      let qualityDesc = ''
      let qualityRec = ''

      if (resolutionDays > 14) {
        qualitySeverity = 'high'
        qualityDesc = `Long average resolution time: ${resolutionDays.toFixed(1)} days`
        qualityRec = 'Investigate process bottlenecks and consider workflow automation'
      } else if (resolutionDays > 7) {
        qualitySeverity = 'medium'
        qualityDesc = `Moderate resolution time: ${resolutionDays.toFixed(1)} days`
        qualityRec = 'Monitor resolution efficiency and optimize where possible'
      } else {
        qualityDesc = `Good resolution time: ${resolutionDays.toFixed(1)} days`
        qualityRec = 'Maintain current resolution processes'
      }

      insights.push({
        type: 'quality_assessment',
        title: 'Resolution Efficiency',
        description: qualityDesc,
        recommendation: qualityRec,
        severity: qualitySeverity,
        metrics: { avgResolutionHours: analysis.avgResolutionTime, avgResolutionDays: resolutionDays }
      })
    }

    return insights
  }

  /**
   * Check if word is a common stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
      'will', 'one', 'use', 'her', 'was', 'she', 'now', 'his', 'has', 'have',
      'this', 'that', 'with', 'from', 'they', 'been', 'said', 'each', 'which',
      'their', 'time', 'what', 'about', 'would', 'there', 'could', 'other',
      'issue', 'claude', 'code', 'interaction', 'implementation', 'system',
      'need', 'want', 'make', 'work', 'just', 'like', 'know', 'get', 'see',
      'go', 'come', 'think', 'take', 'give', 'find', 'tell', 'ask', 'seem',
      'feel', 'try', 'leave', 'call'
    ])
    return stopWords.has(word)
  }

  /**
   * Generate markdown report
   */
  generateReport(analysis: InteractionAnalysis, insights: AnalysisInsight[]): string {
    const report = `# Claude Code Interaction Analysis Report

Generated: ${new Date().toISOString()}

## 📊 Overview

- **Total Interactions:** ${analysis.total}
- **Analysis Period:** ${Object.keys(analysis.byMonth).sort().join(' to ')}
- **Average Resolution Time:** ${(analysis.avgResolutionTime / 24).toFixed(1)} days

## 📈 Interaction Types

| Type | Count | Percentage |
|------|-------|------------|
${Object.entries(analysis.byType)
  .sort(([, a], [, b]) => b - a)
  .map(
    ([type, count]) => `| ${type} | ${count} | ${((count / analysis.total) * 100).toFixed(1)}% |`
  )
  .join('\n')}

## 🎯 Priority Distribution

| Priority | Count | Percentage |
|----------|-------|------------|
${Object.entries(analysis.byPriority)
  .sort(([, a], [, b]) => b - a)
  .map(
    ([priority, count]) =>
      `| ${priority} | ${count} | ${((count / analysis.total) * 100).toFixed(1)}% |`
  )
  .join('\n')}

## 📅 Monthly Activity

\`\`\`
${Object.entries(analysis.byMonth)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([month, count]) => `${month}: ${'█'.repeat(Math.max(1, Math.floor(count / 2)))} (${count})`)
  .join('\n')}
\`\`\`

## 🔍 Top Keywords

${Object.entries(analysis.topKeywords)
  .slice(0, 10)
  .map(([word, count]) => `- **${word}**: ${count} mentions`)
  .join('\n')}

## 💡 Insights & Recommendations

${insights
  .map(
    (insight) => `
### ${insight.title} ${insight.severity ? `(${insight.severity} severity)` : ''}

${insight.description}

**Recommendation:** ${insight.recommendation}

${insight.metrics ? `**Metrics:** ${Object.entries(insight.metrics).map(([k, v]) => `${k}: ${typeof v === 'number' ? v.toFixed(1) : v}`).join(', ')}` : ''}
`
  )
  .join('\n')}

## 🚀 Next Steps

1. **Process Optimization:** Focus on high-frequency interaction types
2. **Automation Enhancement:** Reduce manual overhead in common scenarios
3. **Knowledge Management:** Improve searchability and categorization
4. **Quality Metrics:** Implement success rate tracking for interactions
5. **Resolution Efficiency:** ${analysis.avgResolutionTime > 7 * 24 ? 'Address bottlenecks in issue resolution' : 'Maintain current resolution performance'}

## 📊 Technical Metrics

- **Data Points Analyzed:** ${analysis.total}
- **Unique Keywords Extracted:** ${Object.keys(analysis.topKeywords).length}
- **Time Periods Covered:** ${Object.keys(analysis.byMonth).length} months
- **Categories Identified:** ${Object.keys(analysis.byType).length} types, ${Object.keys(analysis.byPriority).length} priorities

---
*Generated by Claude Interaction Analyzer v2.0*
`

    return report
  }

  /**
   * Run full analysis
   */
  async analyze(options: ScriptOptions = {}): Promise<ScriptResult<InteractionReport>> {
    const startTime = Date.now()

    try {
      this.log('🔍 Fetching Claude interaction issues...', 'info')

      if (options.dryRun) {
        this.log('DRY RUN MODE: Would analyze Claude interactions but no reports will be generated', 'warn')
        return {
          success: true,
          data: {} as InteractionReport,
          duration: Date.now() - startTime,
          timestamp: new Date(),
        }
      }

      const issues = await this.fetchClaudeIssues()

      if (issues.length === 0) {
        this.log('No Claude interaction issues found.', 'warn')
        return {
          success: false,
          error: 'No Claude interaction issues found',
          duration: Date.now() - startTime,
          timestamp: new Date(),
        }
      }

      this.log(`📊 Analyzing ${issues.length} interactions...`, 'info')
      const analysis = this.analyzePatterns(issues)

      this.log('💡 Generating insights...', 'info')
      const insights = this.generateInsights(analysis)

      this.log('📝 Creating report...', 'info')
      const reportContent = this.generateReport(analysis, insights)

      // Save report
      const reportPath = path.join(process.cwd(), 'docs', 'claude-interaction-analysis.md')
      await fs.mkdir(path.dirname(reportPath), { recursive: true })
      await fs.writeFile(reportPath, reportContent)

      // Create summary
      const topType = Object.entries(analysis.byType).sort(([, a], [, b]) => b - a)[0]
      const highPriorityRate = Object.values(analysis.byPriority).reduce((a, b) => a + b, 0) > 0
        ? (((analysis.byPriority.critical || 0) + (analysis.byPriority.high || 0)) / analysis.total) * 100
        : 0

      const recentMonths = Object.entries(analysis.byMonth)
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 2)
      
      const activityTrend: 'increasing' | 'decreasing' | 'stable' = 
        recentMonths.length >= 2 
          ? recentMonths[0][1] > recentMonths[1][1] ? 'increasing' : 
            recentMonths[0][1] < recentMonths[1][1] ? 'decreasing' : 'stable'
          : 'stable'

      const report: InteractionReport = {
        timestamp: new Date().toISOString(),
        analysis,
        insights,
        recommendations: insights.map(i => i.recommendation),
        summary: {
          totalInteractions: analysis.total,
          mostCommonType: topType?.[0] || 'N/A',
          highPriorityRate,
          activityTrend
        }
      }

      this.log(`✅ Analysis complete! Report saved to: ${reportPath}`, 'info')

      // Output summary
      this.log('\n🎯 Quick Summary:', 'info')
      this.log(`- Total interactions: ${analysis.total}`, 'info')
      this.log(`- Most common type: ${topType?.[0] || 'N/A'}`, 'info')
      this.log(`- High priority rate: ${highPriorityRate.toFixed(1)}%`, 'info')
      this.log(`- Activity trend: ${activityTrend}`, 'info')

      return {
        success: true,
        data: report,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`❌ Analysis failed: ${errorMessage}`, 'error')

      return {
        success: false,
        error: errorMessage,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      }
    }
  }

  private log(message: string, level: LogLevel = 'info'): void {
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      fatal: '💀',
    }[level]

    console.log(`${emoji} ${message}`)
  }
}

// ==================== CLI Execution ====================

async function analyzeClaudeInteractionsMain(options: ScriptOptions = {}): Promise<ScriptResult<InteractionReport>> {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER || 'yusuke-kurosawa'
  const repo = process.env.GITHUB_REPO || 'PMPLearningManagement'

  if (!token) {
    console.error('Please set GITHUB_TOKEN environment variable')
    process.exit(1)
  }

  const analyzer = new ClaudeInteractionAnalyzer({ token, owner, repo })
  return analyzer.analyze(options)
}

if (require.main === module) {
  const args = process.argv.slice(2)
  const options: ScriptOptions = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    force: args.includes('--force'),
  }

  analyzeClaudeInteractionsMain(options)
    .then((result) => {
      if (result.success) {
        process.exit(0)
      } else {
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error(`Unexpected error: ${error}`)
      process.exit(1)
    })
}

export default ClaudeInteractionAnalyzer
export { ClaudeInteractionAnalyzer, analyzeClaudeInteractionsMain, type InteractionReport, type AnalysisInsight }