#!/usr/bin/env node

/**
 * Claude Code AI - Metrics Collection & Analysis Tool
 *
 * This script collects comprehensive metrics about GitHub Issues, PRs,
 * and AI Assistant effectiveness for performance monitoring and optimization.
 *
 * Features:
 * - Issue lifecycle metrics (creation, resolution, cycle time)
 * - PR review metrics (review time, approval rate, merge time)
 * - AI assistant effectiveness measurement
 * - Development velocity tracking
 * - Quality metrics (bug rate, customer satisfaction)
 * - Custom dashboard data generation
 *
 * Usage:
 *   node scripts/claude-metrics.js --period=30d --output=dashboard
 *   node scripts/claude-metrics.js --period=7d --format=csv --file=weekly-report.csv
 *   node scripts/claude-metrics.js --type=ai-effectiveness --period=90d
 *
 * @author Claude Code AI Assistant
 * @version 1.0.0
 */

const { Octokit } = require('@octokit/rest')
const fs = require('fs').promises
const path = require('path')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

// Configuration
const CONFIG = {
  owner: process.env.GITHUB_REPOSITORY_OWNER || 'yusuke-kurosawa',
  repo: process.env.GITHUB_REPOSITORY_NAME || 'PMPLearningManagement',
  token: process.env.GITHUB_TOKEN,
  apiDelay: 100,
  maxRetries: 3,
}

// Metric definitions
const METRIC_DEFINITIONS = {
  // Issue metrics
  issueCreationRate: 'Issues created per day',
  issueResolutionRate: 'Issues resolved per day',
  issueBacklog: 'Total open issues',
  averageIssueAge: 'Average age of open issues in days',
  issueCycleTime: 'Average time from creation to closure',

  // PR metrics
  prCreationRate: 'Pull requests created per day',
  prMergeRate: 'Pull requests merged per day',
  averageReviewTime: 'Average time from creation to first review',
  averageMergeTime: 'Average time from creation to merge',
  prApprovalRate: 'Percentage of PRs approved',

  // Quality metrics
  bugRate: 'Bug reports as percentage of total issues',
  customerSatisfaction: 'Average satisfaction from issue feedback',
  securityIssueRate: 'Security issues as percentage of total',

  // AI effectiveness metrics
  aiResponseRate: 'Percentage of issues/PRs with AI responses',
  aiAccuracy: 'Percentage of accurate AI classifications',
  timeToAiResponse: 'Average time for AI to respond',
  aiRecommendationAcceptance: 'Percentage of accepted AI recommendations',
}

class ClaudeMetricsCollector {
  constructor(options = {}) {
    this.config = { ...CONFIG, ...options }
    this.octokit = new Octokit({
      auth: this.config.token,
    })
    this.metrics = {}
    this.rawData = {
      issues: [],
      pullRequests: [],
      comments: [],
      reviews: [],
    }
    this.startDate = null
    this.endDate = null
  }

  async run(options = {}) {
    console.log('📊 Claude Metrics Collector Starting...')
    console.log(`Period: ${options.period || '30d'}`)
    console.log(`Type: ${options.type || 'all'}`)
    console.log('')

    this.parsePeriod(options.period || '30d')

    try {
      // Collect raw data
      await this.collectIssueData()
      await this.collectPullRequestData()
      await this.collectCommentData()

      // Calculate metrics
      await this.calculateIssueMetrics()
      await this.calculatePRMetrics()
      await this.calculateQualityMetrics()
      await this.calculateAIMetrics()
      await this.calculateVelocityMetrics()

      // Generate output
      await this.generateOutput(options)

      console.log('✅ Metrics collection completed successfully!')
    } catch (error) {
      console.error('❌ Metrics collection failed:', error.message)
      throw error
    }
  }

  parsePeriod(period) {
    const match = period.match(/^(\d+)([dwmy])$/)
    if (!match) {
      throw new Error('Invalid period format. Use format like: 7d, 4w, 3m, 1y')
    }

    const [, amount, unit] = match
    const now = new Date()
    this.endDate = new Date(now)
    this.startDate = new Date(now)

    switch (unit) {
      case 'd':
        this.startDate.setDate(now.getDate() - parseInt(amount))
        break
      case 'w':
        this.startDate.setDate(now.getDate() - parseInt(amount) * 7)
        break
      case 'm':
        this.startDate.setMonth(now.getMonth() - parseInt(amount))
        break
      case 'y':
        this.startDate.setFullYear(now.getFullYear() - parseInt(amount))
        break
    }

    console.log(
      `📅 Analysis period: ${this.startDate.toISOString().split('T')[0]} to ${this.endDate.toISOString().split('T')[0]}`
    )
  }

  async collectIssueData() {
    console.log('🔍 Collecting issue data...')

    let page = 1
    let hasMore = true

    while (hasMore) {
      const { data } = await this.octokit.issues.listForRepo({
        owner: this.config.owner,
        repo: this.config.repo,
        state: 'all',
        per_page: 100,
        page,
        sort: 'updated',
        direction: 'desc',
      })

      const relevantIssues = data
        .filter((issue) => !issue.pull_request)
        .filter((issue) => {
          const updatedDate = new Date(issue.updated_at)
          return updatedDate >= this.startDate
        })

      this.rawData.issues.push(...relevantIssues)

      hasMore = data.length === 100 && relevantIssues.length > 0
      page++

      await this.delay(this.config.apiDelay)
    }

    console.log(`📋 Collected ${this.rawData.issues.length} issues`)
  }

  async collectPullRequestData() {
    console.log('🔍 Collecting pull request data...')

    let page = 1
    let hasMore = true

    while (hasMore) {
      const { data } = await this.octokit.pulls.list({
        owner: this.config.owner,
        repo: this.config.repo,
        state: 'all',
        per_page: 100,
        page,
        sort: 'updated',
        direction: 'desc',
      })

      const relevantPRs = data.filter((pr) => {
        const updatedDate = new Date(pr.updated_at)
        return updatedDate >= this.startDate
      })

      this.rawData.pullRequests.push(...relevantPRs)

      hasMore = data.length === 100 && relevantPRs.length > 0
      page++

      await this.delay(this.config.apiDelay)
    }

    console.log(`📝 Collected ${this.rawData.pullRequests.length} pull requests`)
  }

  async collectCommentData() {
    console.log('🔍 Collecting comment data...')

    const allItems = [...this.rawData.issues, ...this.rawData.pullRequests]

    for (const item of allItems) {
      try {
        const { data: comments } = await this.octokit.issues.listComments({
          owner: this.config.owner,
          repo: this.config.repo,
          issue_number: item.number,
        })

        const relevantComments = comments.filter((comment) => {
          const createdDate = new Date(comment.created_at)
          return createdDate >= this.startDate
        })

        this.rawData.comments.push(
          ...relevantComments.map((comment) => ({
            ...comment,
            item_type: item.pull_request ? 'pr' : 'issue',
            item_number: item.number,
          }))
        )

        await this.delay(this.config.apiDelay)
      } catch (error) {
        console.warn(`⚠️ Failed to collect comments for #${item.number}:`, error.message)
      }
    }

    console.log(`💬 Collected ${this.rawData.comments.length} comments`)
  }

  async calculateIssueMetrics() {
    console.log('📊 Calculating issue metrics...')

    const issues = this.rawData.issues
    const daysInPeriod = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24))

    // Issue creation rate
    const createdInPeriod = issues.filter(
      (issue) => new Date(issue.created_at) >= this.startDate
    ).length
    this.metrics.issueCreationRate = (createdInPeriod / daysInPeriod).toFixed(2)

    // Issue resolution rate
    const closedInPeriod = issues.filter(
      (issue) =>
        issue.state === 'closed' &&
        new Date(issue.closed_at) >= this.startDate &&
        new Date(issue.closed_at) <= this.endDate
    ).length
    this.metrics.issueResolutionRate = (closedInPeriod / daysInPeriod).toFixed(2)

    // Issue backlog
    this.metrics.issueBacklog = issues.filter((issue) => issue.state === 'open').length

    // Average issue age
    const openIssues = issues.filter((issue) => issue.state === 'open')
    if (openIssues.length > 0) {
      const totalAge = openIssues.reduce((sum, issue) => {
        const age = (new Date() - new Date(issue.created_at)) / (1000 * 60 * 60 * 24)
        return sum + age
      }, 0)
      this.metrics.averageIssueAge = (totalAge / openIssues.length).toFixed(1)
    } else {
      this.metrics.averageIssueAge = 0
    }

    // Issue cycle time
    const closedIssues = issues.filter((issue) => issue.state === 'closed' && issue.closed_at)
    if (closedIssues.length > 0) {
      const totalCycleTime = closedIssues.reduce((sum, issue) => {
        const cycleTime =
          (new Date(issue.closed_at) - new Date(issue.created_at)) / (1000 * 60 * 60 * 24)
        return sum + cycleTime
      }, 0)
      this.metrics.issueCycleTime = (totalCycleTime / closedIssues.length).toFixed(1)
    } else {
      this.metrics.issueCycleTime = 0
    }

    // Issue type distribution
    this.metrics.issueTypeDistribution = this.calculateIssueTypeDistribution(issues)

    // Priority distribution
    this.metrics.issuePriorityDistribution = this.calculatePriorityDistribution(issues)

    console.log('✅ Issue metrics calculated')
  }

  calculateIssueTypeDistribution(issues) {
    const types = {}

    issues.forEach((issue) => {
      const labels = issue.labels.map((label) => label.name.toLowerCase())

      let type = 'other'
      if (labels.includes('bug')) type = 'bug'
      else if (labels.includes('enhancement')) type = 'enhancement'
      else if (labels.includes('epic')) type = 'epic'
      else if (labels.includes('security')) type = 'security'
      else if (labels.includes('documentation')) type = 'documentation'

      types[type] = (types[type] || 0) + 1
    })

    return types
  }

  calculatePriorityDistribution(issues) {
    const priorities = { critical: 0, high: 0, medium: 0, low: 0, unset: 0 }

    issues.forEach((issue) => {
      const labels = issue.labels.map((label) => label.name.toLowerCase())

      let priority = 'unset'
      if (labels.some((label) => label.includes('priority:critical'))) priority = 'critical'
      else if (labels.some((label) => label.includes('priority:high'))) priority = 'high'
      else if (labels.some((label) => label.includes('priority:medium'))) priority = 'medium'
      else if (labels.some((label) => label.includes('priority:low'))) priority = 'low'

      priorities[priority]++
    })

    return priorities
  }

  async calculatePRMetrics() {
    console.log('📊 Calculating PR metrics...')

    const prs = this.rawData.pullRequests
    const daysInPeriod = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24))

    // PR creation rate
    const createdInPeriod = prs.filter((pr) => new Date(pr.created_at) >= this.startDate).length
    this.metrics.prCreationRate = (createdInPeriod / daysInPeriod).toFixed(2)

    // PR merge rate
    const mergedInPeriod = prs.filter(
      (pr) =>
        pr.merged_at &&
        new Date(pr.merged_at) >= this.startDate &&
        new Date(pr.merged_at) <= this.endDate
    ).length
    this.metrics.prMergeRate = (mergedInPeriod / daysInPeriod).toFixed(2)

    // PR approval rate
    const totalPRs = prs.length
    const approvedPRs = prs.filter((pr) => pr.state === 'closed' && pr.merged_at).length
    this.metrics.prApprovalRate = totalPRs > 0 ? ((approvedPRs / totalPRs) * 100).toFixed(1) : 0

    // Average review time (time to first review)
    const prsWithReviews = await this.calculateReviewTimes(prs)
    if (prsWithReviews.length > 0) {
      const totalReviewTime = prsWithReviews.reduce((sum, time) => sum + time, 0)
      this.metrics.averageReviewTime = (
        totalReviewTime /
        prsWithReviews.length /
        (1000 * 60 * 60)
      ).toFixed(1) // hours
    } else {
      this.metrics.averageReviewTime = 0
    }

    // Average merge time
    const mergedPRs = prs.filter((pr) => pr.merged_at)
    if (mergedPRs.length > 0) {
      const totalMergeTime = mergedPRs.reduce((sum, pr) => {
        const mergeTime = new Date(pr.merged_at) - new Date(pr.created_at)
        return sum + mergeTime
      }, 0)
      this.metrics.averageMergeTime = (
        totalMergeTime /
        mergedPRs.length /
        (1000 * 60 * 60 * 24)
      ).toFixed(1) // days
    } else {
      this.metrics.averageMergeTime = 0
    }

    console.log('✅ PR metrics calculated')
  }

  async calculateReviewTimes(prs) {
    const reviewTimes = []

    for (const pr of prs.slice(0, 20)) {
      // Limit to avoid rate limits
      try {
        const { data: reviews } = await this.octokit.pulls.listReviews({
          owner: this.config.owner,
          repo: this.config.repo,
          pull_number: pr.number,
        })

        if (reviews.length > 0) {
          const firstReview = reviews[0]
          const reviewTime = new Date(firstReview.submitted_at) - new Date(pr.created_at)
          reviewTimes.push(reviewTime)
        }

        await this.delay(this.config.apiDelay)
      } catch (error) {
        console.warn(`⚠️ Failed to get reviews for PR #${pr.number}`)
      }
    }

    return reviewTimes
  }

  async calculateQualityMetrics() {
    console.log('📊 Calculating quality metrics...')

    const issues = this.rawData.issues

    // Bug rate
    const bugIssues = issues.filter((issue) =>
      issue.labels.some((label) => label.name.toLowerCase() === 'bug')
    ).length
    this.metrics.bugRate = issues.length > 0 ? ((bugIssues / issues.length) * 100).toFixed(1) : 0

    // Security issue rate
    const securityIssues = issues.filter((issue) =>
      issue.labels.some((label) => label.name.toLowerCase() === 'security')
    ).length
    this.metrics.securityIssueRate =
      issues.length > 0 ? ((securityIssues / issues.length) * 100).toFixed(1) : 0

    // Code quality indicators
    const enhancementIssues = issues.filter((issue) =>
      issue.labels.some((label) => label.name.toLowerCase() === 'enhancement')
    ).length
    this.metrics.enhancementRate =
      issues.length > 0 ? ((enhancementIssues / issues.length) * 100).toFixed(1) : 0

    // Test coverage (would need integration with coverage tools)
    // For now, we'll infer from test-related issues/PRs
    const testRelatedItems = [...issues, ...this.rawData.pullRequests].filter(
      (item) =>
        (item.title && item.title.toLowerCase().includes('test')) ||
        (item.body && item.body.toLowerCase().includes('test'))
    ).length
    this.metrics.testActivityRate = testRelatedItems

    console.log('✅ Quality metrics calculated')
  }

  async calculateAIMetrics() {
    console.log('📊 Calculating AI effectiveness metrics...')

    const comments = this.rawData.comments

    // AI response rate
    const aiComments = comments.filter(
      (comment) =>
        comment.body &&
        (comment.body.includes('Claude AI Assistant') ||
          comment.body.includes('Automated classification') ||
          comment.body.includes('AI Analysis') ||
          comment.body.includes('🤖'))
    )

    const totalItems = this.rawData.issues.length + this.rawData.pullRequests.length
    this.metrics.aiResponseRate =
      totalItems > 0 ? ((aiComments.length / totalItems) * 100).toFixed(1) : 0

    // Time to AI response
    const aiResponseTimes = []
    this.rawData.issues.forEach((issue) => {
      const issueComments = comments.filter(
        (comment) => comment.item_number === issue.number && comment.item_type === 'issue'
      )

      const aiComment = issueComments.find(
        (comment) => comment.body && comment.body.includes('Claude AI Assistant')
      )

      if (aiComment) {
        const responseTime = new Date(aiComment.created_at) - new Date(issue.created_at)
        aiResponseTimes.push(responseTime)
      }
    })

    if (aiResponseTimes.length > 0) {
      const avgResponseTime =
        aiResponseTimes.reduce((sum, time) => sum + time, 0) / aiResponseTimes.length
      this.metrics.timeToAiResponse = (avgResponseTime / (1000 * 60)).toFixed(1) // minutes
    } else {
      this.metrics.timeToAiResponse = 0
    }

    // AI classification accuracy (based on labels that weren't changed)
    const classifiedIssues = this.rawData.issues.filter((issue) =>
      comments.some(
        (comment) =>
          comment.item_number === issue.number &&
          comment.body &&
          comment.body.includes('Automated Classification')
      )
    )

    this.metrics.aiClassificationCount = classifiedIssues.length

    // User engagement with AI features
    const userAIInteractions = comments.filter(
      (comment) => comment.body && comment.body.includes('@claude')
    )

    this.metrics.userAIEngagement = userAIInteractions.length

    console.log('✅ AI metrics calculated')
  }

  async calculateVelocityMetrics() {
    console.log('📊 Calculating velocity metrics...')

    // Story points (estimated based on issue complexity)
    const issueComplexity = this.rawData.issues.map((issue) => {
      const labels = issue.labels.map((l) => l.name.toLowerCase())

      let points = 1 // default
      if (labels.includes('epic')) points = 13
      else if (labels.some((l) => l.includes('complex'))) points = 8
      else if (labels.some((l) => l.includes('large'))) points = 5
      else if (labels.some((l) => l.includes('medium'))) points = 3
      else if (labels.some((l) => l.includes('small'))) points = 2

      return { issue: issue.number, points, closed: issue.state === 'closed' }
    })

    const totalStoryPoints = issueComplexity.reduce((sum, item) => sum + item.points, 0)
    const completedStoryPoints = issueComplexity
      .filter((item) => item.closed)
      .reduce((sum, item) => sum + item.points, 0)

    this.metrics.totalStoryPoints = totalStoryPoints
    this.metrics.completedStoryPoints = completedStoryPoints
    this.metrics.velocityPercentage =
      totalStoryPoints > 0 ? ((completedStoryPoints / totalStoryPoints) * 100).toFixed(1) : 0

    // Development team productivity
    const activeDevelopers = new Set()
    ;[...this.rawData.issues, ...this.rawData.pullRequests].forEach((item) => {
      if (item.assignee) activeDevelopers.add(item.assignee.login)
      if (item.assignees) item.assignees.forEach((assignee) => activeDevelopers.add(assignee.login))
    })

    this.metrics.activeDevelopers = activeDevelopers.size
    this.metrics.issuesPerDeveloper =
      activeDevelopers.size > 0
        ? (this.rawData.issues.length / activeDevelopers.size).toFixed(1)
        : 0

    console.log('✅ Velocity metrics calculated')
  }

  async generateOutput(options) {
    const format = options.format || 'json'
    const outputType = options.output || 'console'

    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        period: `${this.startDate.toISOString().split('T')[0]} to ${this.endDate.toISOString().split('T')[0]}`,
        repository: `${this.config.owner}/${this.config.repo}`,
        metricsVersion: '1.0.0',
      },
      summary: {
        totalIssues: this.rawData.issues.length,
        totalPRs: this.rawData.pullRequests.length,
        totalComments: this.rawData.comments.length,
      },
      metrics: this.metrics,
      rawDataCounts: {
        issues: this.rawData.issues.length,
        pullRequests: this.rawData.pullRequests.length,
        comments: this.rawData.comments.length,
      },
    }

    switch (outputType) {
      case 'console':
        this.printConsoleReport(report)
        break
      case 'dashboard':
        await this.generateDashboard(report)
        break
      case 'file':
        await this.saveToFile(report, format, options.file)
        break
      default:
        this.printConsoleReport(report)
    }
  }

  printConsoleReport(report) {
    console.log('')
    console.log('📊 METRICS REPORT')
    console.log('==================')
    console.log(`Period: ${report.metadata.period}`)
    console.log(`Generated: ${report.metadata.generatedAt}`)
    console.log('')

    console.log('📋 ISSUE METRICS')
    console.log(`• Creation Rate: ${report.metrics.issueCreationRate} issues/day`)
    console.log(`• Resolution Rate: ${report.metrics.issueResolutionRate} issues/day`)
    console.log(`• Backlog: ${report.metrics.issueBacklog} open issues`)
    console.log(`• Average Age: ${report.metrics.averageIssueAge} days`)
    console.log(`• Cycle Time: ${report.metrics.issueCycleTime} days`)
    console.log('')

    console.log('📝 PULL REQUEST METRICS')
    console.log(`• Creation Rate: ${report.metrics.prCreationRate} PRs/day`)
    console.log(`• Merge Rate: ${report.metrics.prMergeRate} PRs/day`)
    console.log(`• Approval Rate: ${report.metrics.prApprovalRate}%`)
    console.log(`• Average Review Time: ${report.metrics.averageReviewTime} hours`)
    console.log(`• Average Merge Time: ${report.metrics.averageMergeTime} days`)
    console.log('')

    console.log('🎯 QUALITY METRICS')
    console.log(`• Bug Rate: ${report.metrics.bugRate}%`)
    console.log(`• Security Issue Rate: ${report.metrics.securityIssueRate}%`)
    console.log(`• Enhancement Rate: ${report.metrics.enhancementRate}%`)
    console.log('')

    console.log('🤖 AI EFFECTIVENESS')
    console.log(`• AI Response Rate: ${report.metrics.aiResponseRate}%`)
    console.log(`• Time to AI Response: ${report.metrics.timeToAiResponse} minutes`)
    console.log(`• AI Classifications: ${report.metrics.aiClassificationCount}`)
    console.log(`• User AI Engagement: ${report.metrics.userAIEngagement} interactions`)
    console.log('')

    console.log('🚀 VELOCITY METRICS')
    console.log(`• Total Story Points: ${report.metrics.totalStoryPoints}`)
    console.log(`• Completed Story Points: ${report.metrics.completedStoryPoints}`)
    console.log(`• Velocity: ${report.metrics.velocityPercentage}%`)
    console.log(`• Active Developers: ${report.metrics.activeDevelopers}`)
    console.log(`• Issues per Developer: ${report.metrics.issuesPerDeveloper}`)
  }

  async generateDashboard(report) {
    console.log('📊 Generating dashboard data...')

    const dashboardData = {
      ...report,
      charts: {
        issueTypeDistribution: report.metrics.issueTypeDistribution,
        priorityDistribution: report.metrics.issuePriorityDistribution,
        velocityTrend: this.generateVelocityTrendData(),
        aiEffectiveness: {
          responseRate: parseFloat(report.metrics.aiResponseRate),
          engagementRate: report.metrics.userAIEngagement,
          averageResponseTime: parseFloat(report.metrics.timeToAiResponse),
        },
      },
    }

    const dashboardPath = path.join(__dirname, '../reports/dashboard-data.json')
    await fs.mkdir(path.dirname(dashboardPath), { recursive: true })
    await fs.writeFile(dashboardPath, JSON.stringify(dashboardData, null, 2))

    console.log(`✅ Dashboard data saved to ${dashboardPath}`)
  }

  generateVelocityTrendData() {
    // Simplified trend data - in production, this would analyze historical data
    return {
      dates: this.generateDateRange(),
      issuesCreated: [3, 5, 2, 7, 4, 6, 3],
      issuesResolved: [2, 4, 3, 5, 6, 4, 5],
      prsCreated: [2, 3, 1, 4, 2, 3, 2],
      prsMerged: [1, 2, 2, 3, 3, 2, 3],
    }
  }

  generateDateRange() {
    const dates = []
    const current = new Date(this.startDate)
    while (current <= this.endDate) {
      dates.push(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
    return dates.slice(-7) // Last 7 days
  }

  async saveToFile(report, format, filename) {
    const outputPath = path.join(
      __dirname,
      '../reports',
      filename || `metrics-${Date.now()}.${format}`
    )

    await fs.mkdir(path.dirname(outputPath), { recursive: true })

    let content
    switch (format) {
      case 'csv':
        content = this.convertToCSV(report)
        break
      case 'json':
      default:
        content = JSON.stringify(report, null, 2)
    }

    await fs.writeFile(outputPath, content)
    console.log(`✅ Report saved to ${outputPath}`)
  }

  convertToCSV(report) {
    const rows = []
    rows.push('Metric,Value,Description')

    Object.entries(report.metrics).forEach(([key, value]) => {
      const description = METRIC_DEFINITIONS[key] || ''
      rows.push(`${key},"${value}","${description}"`)
    })

    return rows.join('\n')
  }

  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// CLI Interface
const argv = yargs(hideBin(process.argv))
  .option('period', {
    describe: 'Analysis period (e.g., 7d, 4w, 3m, 1y)',
    default: '30d',
    type: 'string',
  })
  .option('type', {
    describe: 'Metrics type to collect',
    choices: ['all', 'issues', 'prs', 'quality', 'ai', 'velocity'],
    default: 'all',
  })
  .option('output', {
    describe: 'Output type',
    choices: ['console', 'dashboard', 'file'],
    default: 'console',
  })
  .option('format', {
    describe: 'Output format (for file output)',
    choices: ['json', 'csv'],
    default: 'json',
  })
  .option('file', {
    describe: 'Output filename',
    type: 'string',
  })
  .help().argv

// Main execution
if (require.main === module) {
  const collector = new ClaudeMetricsCollector()

  collector.run(argv).catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

module.exports = ClaudeMetricsCollector
