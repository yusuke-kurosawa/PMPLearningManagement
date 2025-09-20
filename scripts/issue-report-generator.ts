#!/usr/bin/env node
/**
 * Issue Report Generator
 * TypeScript version with enhanced analytics and KPI tracking
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import type {
  ScriptResult,
  ScriptOptions,
  LogLevel,
  IssueReportConfig,
  IssueReportData,
  IssueKPIs,
  IssueTrends,
  GitHubIssue,
  ReportPeriod,
  ReportType,
} from '../src/types/devops/scripts'

// ==================== Type Definitions ====================

interface IssueDataCollection {
  all: GitHubIssue[]
  created: GitHubIssue[]
  closed: GitHubIssue[]
  open: GitHubIssue[]
  byPriority: Record<string, GitHubIssue[]>
  byComponent: Record<string, GitHubIssue[]>
  byAssignee: Record<string, GitHubIssue[]>
  byType: Record<string, GitHubIssue[]>
  timeline: IssueTimeline
  comments: any[]
  reactions: any[]
}

interface IssueTimeline {
  creation: TimelineData[]
  resolution: TimelineData[]
  dailyStats: DailyStats[]
}

interface TimelineData {
  date: string
  count: number
  trend: number
}

interface DailyStats {
  date: string
  created: number
  closed: number
  netChange: number
}

interface SLACompliance {
  response: number
  resolution: number
  violations: number
}

interface PerformanceMetrics {
  velocity: number
  efficiency: number
  responsiveness: number
  qualityIndex: number
}

interface TargetStatus {
  responseTime: boolean
  resolutionTime: boolean
  qualityScore: boolean
  assignmentRate: boolean
}

interface QualityMetrics {
  templateUsageRate: number
  hasPriority: number
  hasComponent: number
  hasType: number
}

interface GitHubActionContext {
  github: any
  context: any
  core: any
}

interface GeneratedReport {
  type: ReportType
  period: ReportPeriod
  content: string
  data: {
    kpis: IssueKPIs
    trends: IssueTrends
    raw: IssueDataCollection
  }
  generatedAt: Date
  version: string
}

// ==================== Constants ====================

const CONFIG: IssueReportConfig = {
  timezone: 'Asia/Tokyo',
  dateFormat: 'ja-JP',
  kpis: {
    responseTimeSLA: 24, // hours
    resolutionTimeSLA: 72, // hours
    qualityScoreTarget: 80, // %
    assignmentRateTarget: 90, // %
  },
  periods: {
    daily: 1,
    weekly: 7,
    monthly: 30,
    quarterly: 90,
  },
  outputFormats: ['markdown', 'json'],
  includeCharts: false,
  enableAnalytics: true,
}

// ==================== Main Class ====================

class IssueReportGenerator {
  private config: IssueReportConfig
  private githubContext: GitHubActionContext

  constructor(githubContext: GitHubActionContext, customConfig?: Partial<IssueReportConfig>) {
    this.githubContext = githubContext
    this.config = { ...CONFIG, ...customConfig }
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

    // GitHub Actions core logging if available
    if (this.githubContext?.core) {
      switch (level) {
        case 'error':
        case 'fatal':
          this.githubContext.core.error(message)
          break
        case 'warn':
          this.githubContext.core.warning(message)
          break
        case 'debug':
          this.githubContext.core.debug(message)
          break
        default:
          this.githubContext.core.info(message)
      }
    }
  }

  /**
   * 指定期間のレポート生成
   */
  async generateReport(
    reportType: ReportType = 'daily',
    customDays?: number
  ): Promise<GeneratedReport> {
    this.log(`📊 ${reportType}レポートの生成を開始...`, 'info')

    const days = customDays || this.config.periods[reportType] || 1
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

    try {
      // データ収集
      const data = await this.collectIssueData(startDate, endDate)

      // KPI計算
      const kpis = await this.calculateKPIs(data, days)

      // トレンド分析
      const trends = await this.analyzeTrends(data, reportType)

      // レポート生成
      const report = await this.buildReport({
        reportType,
        period: { start: startDate, end: endDate, days },
        data,
        kpis,
        trends,
      })

      // 保存と出力
      await this.saveReport(report, reportType)

      this.log(`✅ ${reportType}レポート生成完了`, 'info')
      return report
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`❌ ${reportType}レポート生成中にエラー: ${errorMessage}`, 'error')
      throw error
    }
  }

  /**
   * Issueデータ収集
   */
  private async collectIssueData(
    startDate: Date,
    endDate: Date
  ): Promise<IssueDataCollection> {
    this.log(
      `📊 Issue データ収集中... (${this.formatDate(startDate)} - ${this.formatDate(endDate)})`,
      'info'
    )

    // 期間内のすべてのIssueを取得
    const allIssues = await this.githubContext.github.paginate(
      this.githubContext.github.rest.issues.listForRepo,
      {
        owner: this.githubContext.context.repo.owner,
        repo: this.githubContext.context.repo.repo,
        state: 'all',
        since: startDate.toISOString(),
        per_page: 100,
        sort: 'created',
        direction: 'desc',
      }
    )

    // PRを除外
    const issues = allIssues.filter((issue: any) => !issue.pull_request)

    this.log(`📈 ${issues.length}件のIssueを収集`, 'info')

    // データ分類
    const data: IssueDataCollection = {
      all: issues,
      created: issues.filter(
        (issue) =>
          new Date(issue.created_at) >= startDate && new Date(issue.created_at) <= endDate
      ),
      closed: issues.filter(
        (issue) =>
          issue.closed_at &&
          new Date(issue.closed_at) >= startDate &&
          new Date(issue.closed_at) <= endDate
      ),
      open: issues.filter((issue) => issue.state === 'open'),

      // 優先度別
      byPriority: this.groupByPriority(issues),

      // コンポーネント別
      byComponent: this.groupByComponent(issues),

      // 担当者別
      byAssignee: this.groupByAssignee(issues),

      // 種類別
      byType: this.groupByType(issues),

      // 時系列データ
      timeline: await this.generateTimeline(issues, startDate, endDate),

      // 初期化
      comments: [],
      reactions: [],
    }

    // 詳細情報の追加収集
    data.comments = await this.collectCommentsData(data.created)
    data.reactions = await this.collectReactionsData(data.created)

    return data
  }

  /**
   * KPI計算
   */
  private async calculateKPIs(
    data: IssueDataCollection,
    periodDays: number
  ): Promise<IssueKPIs> {
    this.log('📊 KPI計算中...', 'info')

    const avgResponseTime = await this.calculateAvgResponseTime(data.created)
    const avgResolutionTime = await this.calculateAvgResolutionTime(data.closed)
    const qualityScore = await this.calculateQualityScore(data.created)
    const assignmentRate = this.calculateAssignmentRate(data.created)
    const templateUsageRate = this.calculateTemplateUsage(data.created)

    const slaCompliance: SLACompliance = {
      response: await this.calculateSLACompliance(data.created, 'response'),
      resolution: await this.calculateSLACompliance(data.closed, 'resolution'),
      violations: 0, // Simplified
    }

    const performance: PerformanceMetrics = {
      velocity: data.closed.length / periodDays,
      efficiency: data.closed.length / Math.max(data.created.length, 1),
      responsiveness: slaCompliance.response,
      qualityIndex: (qualityScore + assignmentRate + templateUsageRate) / 3,
    }

    const targetStatus: TargetStatus = {
      responseTime: avgResponseTime <= this.config.kpis.responseTimeSLA,
      resolutionTime: avgResolutionTime <= this.config.kpis.resolutionTimeSLA,
      qualityScore: qualityScore >= this.config.kpis.qualityScoreTarget,
      assignmentRate: assignmentRate >= this.config.kpis.assignmentRateTarget,
    }

    const labelingQuality: QualityMetrics = {
      templateUsageRate,
      hasPriority: this.calculateLabelUsage(data.created, 'priority:'),
      hasComponent: this.calculateLabelUsage(data.created, 'component:'),
      hasType: this.calculateLabelUsage(data.created, ['bug', 'enhancement', 'feature']),
    }

    return {
      // 基本メトリクス
      totalIssues: data.all.length,
      createdCount: data.created.length,
      closedCount: data.closed.length,
      openCount: data.open.length,

      // 作成・解決率
      creationRate: data.created.length / periodDays,
      resolutionRate: data.closed.length / periodDays,
      netChange: data.created.length - data.closed.length,

      // 応答・解決時間
      avgResponseTime,
      avgResolutionTime,

      // SLA遵守率
      slaCompliance,

      // 品質指標
      qualityScore,
      assignmentRate,
      templateUsageRate: labelingQuality.templateUsageRate,
      labelingQuality,

      // エンゲージメント
      avgCommentsPerIssue: this.calculateAvgComments(data.created, data.comments),
      activeContributors: this.countActiveContributors(data.created),

      // セキュリティ関連
      securityIssues: data.created.filter((i) =>
        i.labels.some((l: any) => l.name.includes('security'))
      ).length,

      // 重複・クリーンアップ
      duplicateDetected: data.created.filter((i) =>
        i.labels.some((l: any) => l.name.includes('duplicate'))
      ).length,
      staleIssues: data.open.filter((i) => this.isStale(i)).length,

      // パフォーマンス指標
      performance,

      // 目標達成状況
      targetStatus,

      // メタデータ
      calculatedAt: new Date().toISOString(),
    }
  }

  /**
   * トレンド分析
   */
  private async analyzeTrends(
    data: IssueDataCollection,
    reportType: ReportType
  ): Promise<IssueTrends> {
    this.log('📈 トレンド分析中...', 'info')

    // 過去の同期間データと比較
    const comparisonPeriods = await this.getComparisonPeriods(reportType)

    const trends: IssueTrends = {
      creation: await this.calculateTrend(data.timeline.creation, comparisonPeriods.creation),
      resolution: await this.calculateTrend(data.timeline.resolution, comparisonPeriods.resolution),
      quality: await this.calculateQualityTrend(data, comparisonPeriods),

      // 優先度別トレンド
      priorityTrends: {},

      // 予測
      forecast: await this.generateForecast(data.timeline, reportType),

      // 季節性分析
      seasonality: await this.analyzeSeasonality(data.timeline, reportType),

      // メタデータ
      analyzedAt: new Date().toISOString(),
      period: reportType,
    }

    // 優先度別トレンド計算
    for (const [priority, issues] of Object.entries(data.byPriority)) {
      trends.priorityTrends[priority] = {
        count: issues.length,
        trend: await this.calculateSimpleTrend(issues, 'created_at'),
        changePercent: 0, // Simplified
      }
    }

    return trends
  }

  /**
   * レポート構築
   */
  private async buildReport(reportData: {
    reportType: ReportType
    period: ReportPeriod
    data: IssueDataCollection
    kpis: IssueKPIs
    trends: IssueTrends
  }): Promise<GeneratedReport> {
    const { reportType, period, data, kpis, trends } = reportData

    let report = this.generateReportHeader(reportType, period)
    report += this.generateExecutiveSummary(kpis, trends)
    report += this.generateDetailedMetrics(data, kpis)
    report += this.generateTrendAnalysis(trends)
    report += this.generateQualityAnalysis(data, kpis)
    report += this.generateRecommendations(kpis, trends)
    report += this.generateAppendix(data)

    return {
      type: reportType,
      period,
      content: report,
      data: {
        kpis,
        trends,
        raw: data,
      },
      generatedAt: new Date(),
      version: '2.0',
    }
  }

  // ==================== Report Generation Methods ====================

  /**
   * レポートヘッダー生成
   */
  private generateReportHeader(reportType: ReportType, period: ReportPeriod): string {
    const typeDisplayName: Record<ReportType, string> = {
      daily: '日次',
      weekly: '週次',
      monthly: '月次',
      quarterly: '四半期',
    }

    return `# 📊 Issue運用${typeDisplayName[reportType] || reportType}レポート

**リポジトリ**: ${this.githubContext.context.repo.owner}/${this.githubContext.context.repo.repo}
**期間**: ${this.formatDate(period.start)} - ${this.formatDate(period.end)} (${period.days}日間)
**生成日時**: ${new Date().toLocaleString(this.config.dateFormat)}

---

`
  }

  /**
   * エグゼクティブサマリー生成
   */
  private generateExecutiveSummary(kpis: IssueKPIs, trends: IssueTrends): string {
    const statusIcon = (achieved: boolean): string => (achieved ? '✅' : '❌')
    const trendIcon = (value: number): string => (value > 0 ? '📈' : value < 0 ? '📉' : '➡️')

    return `## 📋 エグゼクティブサマリー

### 🎯 主要KPI
| 指標 | 実績 | 目標 | 達成 | トレンド |
|------|------|------|------|----------|
| 平均応答時間 | ${kpis.avgResponseTime.toFixed(1)}h | ${this.config.kpis.responseTimeSLA}h | ${statusIcon(kpis.targetStatus.responseTime)} | ${trendIcon(trends.quality.responseTime || 0)} |
| 平均解決時間 | ${kpis.avgResolutionTime.toFixed(1)}h | ${this.config.kpis.resolutionTimeSLA}h | ${statusIcon(kpis.targetStatus.resolutionTime)} | ${trendIcon(trends.quality.resolutionTime || 0)} |
| Issue品質スコア | ${kpis.qualityScore.toFixed(1)}% | ${this.config.kpis.qualityScoreTarget}% | ${statusIcon(kpis.targetStatus.qualityScore)} | ${trendIcon(trends.quality.overall || 0)} |
| 担当者アサイン率 | ${kpis.assignmentRate.toFixed(1)}% | ${this.config.kpis.assignmentRateTarget}% | ${statusIcon(kpis.targetStatus.assignmentRate)} | ${trendIcon(trends.quality.assignment || 0)} |

### 📊 期間サマリー
- **作成**: ${kpis.createdCount} Issues (日平均: ${kpis.creationRate.toFixed(1)})
- **解決**: ${kpis.closedCount} Issues (日平均: ${kpis.resolutionRate.toFixed(1)})
- **未解決**: ${kpis.openCount} Issues
- **純増減**: ${kpis.netChange >= 0 ? '+' : ''}${kpis.netChange} Issues

### ⚡ パフォーマンス指標
- **処理効率**: ${(kpis.performance.efficiency * 100).toFixed(1)}%
- **応答性**: ${(kpis.performance.responsiveness * 100).toFixed(1)}%
- **品質指数**: ${kpis.performance.qualityIndex.toFixed(1)}%
- **処理速度**: ${kpis.performance.velocity.toFixed(1)} Issues/日

---

`
  }

  /**
   * 詳細メトリクス生成
   */
  private generateDetailedMetrics(data: IssueDataCollection, kpis: IssueKPIs): string {
    let section = `## 📊 詳細メトリクス

### 🏷️ 優先度別分析
| 優先度 | 件数 | 割合 |
|--------|------|------|
`

    for (const [priority, issues] of Object.entries(data.byPriority)) {
      const percentage = data.created.length > 0 ? ((issues.length / data.created.length) * 100).toFixed(1) : '0.0'
      section += `| ${priority || '未設定'} | ${issues.length} | ${percentage}% |\n`
    }

    section += `
### 🎯 コンポーネント別分析
| コンポーネント | 件数 | 割合 |
|----------------|------|------|
`

    const topComponents = Object.entries(data.byComponent)
      .sort(([, a], [, b]) => b.length - a.length)
      .slice(0, 10)

    for (const [component, issues] of topComponents) {
      const percentage = data.created.length > 0 ? ((issues.length / data.created.length) * 100).toFixed(1) : '0.0'
      section += `| ${component || '未分類'} | ${issues.length} | ${percentage}% |\n`
    }

    section += `
### 👥 担当者別分析
| 担当者 | アサイン数 | 完了数 | 完了率 |
|--------|------------|--------|--------|
`

    const topAssignees = Object.entries(data.byAssignee)
      .sort(([, a], [, b]) => b.length - a.length)
      .slice(0, 10)

    for (const [assignee, issues] of topAssignees) {
      const completed = issues.filter((i) => i.state === 'closed').length
      const completionRate = issues.length > 0 ? ((completed / issues.length) * 100).toFixed(1) : '0.0'
      section += `| ${assignee || '未アサイン'} | ${issues.length} | ${completed} | ${completionRate}% |\n`
    }

    section += `
### 🏭 品質指標詳細
- **テンプレート使用率**: ${kpis.templateUsageRate.toFixed(1)}%
- **優先度ラベル率**: ${kpis.labelingQuality.hasPriority.toFixed(1)}%
- **コンポーネントラベル率**: ${kpis.labelingQuality.hasComponent.toFixed(1)}%
- **種類ラベル率**: ${kpis.labelingQuality.hasType.toFixed(1)}%
- **Issue当たり平均コメント数**: ${kpis.avgCommentsPerIssue.toFixed(1)}
- **アクティブ貢献者数**: ${kpis.activeContributors}

---

`

    return section
  }

  /**
   * トレンド分析セクション生成
   */
  private generateTrendAnalysis(trends: IssueTrends): string {
    const trendDescription = (trend: number): string => {
      if (trend > 10) return '大幅な増加傾向 📈'
      if (trend > 5) return '増加傾向 📈'
      if (trend > -5) return '安定 ➡️'
      if (trend > -10) return '減少傾向 📉'
      return '大幅な減少傾向 📉'
    }

    return `## 📈 トレンド分析

### 📊 全体トレンド
- **Issue作成**: ${trendDescription(trends.creation)}
- **Issue解決**: ${trendDescription(trends.resolution)}
- **品質指標**: ${trendDescription(trends.quality.overall || 0)}

### 🔮 予測分析
${trends.forecast ? this.generateForecastSection(trends.forecast) : '予測データなし'}

### 📅 季節性分析
${trends.seasonality ? this.generateSeasonalitySection(trends.seasonality) : '季節性データなし'}

---

`
  }

  /**
   * 品質分析セクション生成
   */
  private generateQualityAnalysis(data: IssueDataCollection, kpis: IssueKPIs): string {
    const qualityLevel = (score: number): string => {
      if (score >= 90) return '優秀 🌟'
      if (score >= 80) return '良好 ✅'
      if (score >= 70) return '改善推奨 ⚠️'
      if (score >= 60) return '要改善 ❌'
      return '大幅改善必要 🚨'
    }

    return `## 🔍 品質分析

### 📋 総合品質評価
**品質スコア**: ${kpis.qualityScore.toFixed(1)}% - ${qualityLevel(kpis.qualityScore)}

### 🎯 品質改善点
${this.generateQualityImprovements(kpis)}

### 🚨 注意が必要な項目
- **セキュリティIssue**: ${kpis.securityIssues}件 ${kpis.securityIssues > 0 ? '⚠️' : '✅'}
- **重複検出**: ${kpis.duplicateDetected}件
- **長期未解決**: ${kpis.staleIssues}件
- **SLA違反リスク**: ${this.calculateSLARisk(data.open)}件

---

`
  }

  /**
   * 推奨事項生成
   */
  private generateRecommendations(kpis: IssueKPIs, trends: IssueTrends): string {
    const recommendations: string[] = []

    // パフォーマンス系推奨事項
    if (!kpis.targetStatus.responseTime) {
      recommendations.push('⚡ 応答時間の改善が必要です。担当者アサインの自動化を検討してください')
    }

    if (!kpis.targetStatus.resolutionTime) {
      recommendations.push(
        '🎯 解決時間の短縮が必要です。Issue分類の最適化や優先度設定を見直してください'
      )
    }

    // 品質系推奨事項
    if (!kpis.targetStatus.qualityScore) {
      recommendations.push(
        '📋 Issue品質の向上が必要です。テンプレート利用の促進とトレーニングを実施してください'
      )
    }

    if (!kpis.targetStatus.assignmentRate) {
      recommendations.push(
        '👥 担当者アサイン率の向上が必要です。自動アサイン機能の導入を検討してください'
      )
    }

    // セキュリティ系推奨事項
    if (kpis.securityIssues > 0) {
      recommendations.push(
        '🔒 セキュリティIssueが検出されています。優先的な対応と定期的なセキュリティレビューを実施してください'
      )
    }

    // トレンド系推奨事項
    if (trends.creation > trends.resolution) {
      recommendations.push(
        '📊 Issue作成数が解決数を上回っています。処理能力の向上またはリソースの追加を検討してください'
      )
    }

    // デフォルト推奨事項
    if (recommendations.length === 0) {
      recommendations.push(
        '✅ 現在の運用品質は良好です。継続的な改善とモニタリングを実施してください'
      )
    }

    return `## 💡 改善推奨事項

### 🎯 今期の重点取り組み
${recommendations.map((rec) => `- ${rec}`).join('\n')}

### 📋 具体的アクションプラン
- [ ] Issue品質チェックリストの作成と共有
- [ ] 担当者アサイン基準の明確化
- [ ] SLA違反アラートシステムの活用
- [ ] 定期的なIssue運用レビューの実施
- [ ] チーム内でのベストプラクティス共有

### 🔄 継続改善項目
- [ ] 自動化可能な作業の特定と実装
- [ ] Issue分類精度の向上
- [ ] レスポンス時間の短縮施策
- [ ] 品質指標の継続的なモニタリング

---

`
  }

  /**
   * 付録セクション生成
   */
  private generateAppendix(data: IssueDataCollection): string {
    return `## 📚 付録

### 📊 データサマリー
- **分析対象Issue総数**: ${data.all.length}
- **新規作成Issue**: ${data.created.length}
- **期間内完了Issue**: ${data.closed.length}
- **現在の未解決Issue**: ${data.open.length}
- **収集コメント数**: ${data.comments ? data.comments.length : 0}

### 🏷️ ラベル使用統計
${this.generateLabelStatistics(data.all)}

### ⏰ 時系列データポイント
- 最古Issue: ${data.all.length > 0 ? this.formatDate(new Date(data.all[data.all.length - 1].created_at)) : 'なし'}
- 最新Issue: ${data.all.length > 0 ? this.formatDate(new Date(data.all[0].created_at)) : 'なし'}

### 🤖 レポート情報
- **生成システム**: Issue運用自動監査システム v2.0
- **実行環境**: GitHub Actions
- **データ取得**: GitHub REST API v3
- **生成日時**: ${new Date().toLocaleString(this.config.dateFormat)}

---
*このレポートは自動生成されました 🤖*`
  }

  // ==================== Helper Methods ====================

  /**
   * 優先度別グループ化
   */
  private groupByPriority(issues: GitHubIssue[]): Record<string, GitHubIssue[]> {
    return this.groupByLabel(issues, 'priority:', 'priority')
  }

  /**
   * コンポーネント別グループ化
   */
  private groupByComponent(issues: GitHubIssue[]): Record<string, GitHubIssue[]> {
    return this.groupByLabel(issues, 'component:', 'component')
  }

  /**
   * 種類別グループ化
   */
  private groupByType(issues: GitHubIssue[]): Record<string, GitHubIssue[]> {
    const types = ['bug', 'enhancement', 'feature', 'documentation', 'security']
    return this.groupByLabelList(issues, types)
  }

  /**
   * 担当者別グループ化
   */
  private groupByAssignee(issues: GitHubIssue[]): Record<string, GitHubIssue[]> {
    const groups: Record<string, GitHubIssue[]> = {}

    for (const issue of issues) {
      if (issue.assignees && issue.assignees.length > 0) {
        for (const assignee of issue.assignees) {
          if (!groups[assignee.login]) groups[assignee.login] = []
          groups[assignee.login].push(issue)
        }
      } else {
        if (!groups['未アサイン']) groups['未アサイン'] = []
        groups['未アサイン'].push(issue)
      }
    }

    return groups
  }

  /**
   * ラベル別グループ化
   */
  private groupByLabel(
    issues: GitHubIssue[],
    prefix: string,
    defaultKey = '未分類'
  ): Record<string, GitHubIssue[]> {
    const groups: Record<string, GitHubIssue[]> = {}

    for (const issue of issues) {
      let found = false
      for (const label of issue.labels) {
        const labelName = typeof label === 'string' ? label : label.name
        if (labelName.startsWith(prefix)) {
          const key = labelName.replace(prefix, '') || defaultKey
          if (!groups[key]) groups[key] = []
          groups[key].push(issue)
          found = true
          break
        }
      }
      if (!found) {
        if (!groups[defaultKey]) groups[defaultKey] = []
        groups[defaultKey].push(issue)
      }
    }

    return groups
  }

  /**
   * ラベルリスト別グループ化
   */
  private groupByLabelList(
    issues: GitHubIssue[],
    labelList: string[]
  ): Record<string, GitHubIssue[]> {
    const groups: Record<string, GitHubIssue[]> = {}

    for (const issue of issues) {
      let found = false
      for (const targetLabel of labelList) {
        if (
          issue.labels.some((label) => {
            const labelName = typeof label === 'string' ? label : label.name
            return labelName === targetLabel
          })
        ) {
          if (!groups[targetLabel]) groups[targetLabel] = []
          groups[targetLabel].push(issue)
          found = true
          break
        }
      }
      if (!found) {
        if (!groups['その他']) groups['その他'] = []
        groups['その他'].push(issue)
      }
    }

    return groups
  }

  // ==================== KPI Calculation Methods ====================

  /**
   * 平均応答時間計算
   */
  private async calculateAvgResponseTime(issues: GitHubIssue[]): Promise<number> {
    if (issues.length === 0) return 0

    let totalResponseTime = 0
    let count = 0

    for (const issue of issues.slice(0, 50)) {
      // 最新50件でサンプリング
      try {
        const comments = await this.githubContext.github.rest.issues.listComments({
          owner: this.githubContext.context.repo.owner,
          repo: this.githubContext.context.repo.repo,
          issue_number: issue.number,
        })

        const validComments = comments.data.filter(
          (c: any) => !c.user.login.includes('[bot]')
        )
        if (validComments.length > 0) {
          const firstResponse = new Date(validComments[0].created_at)
          const created = new Date(issue.created_at)
          totalResponseTime += (firstResponse.getTime() - created.getTime()) / (1000 * 60 * 60)
          count++
        }
      } catch (error) {
        // エラーは無視してスキップ
      }
    }

    return count > 0 ? totalResponseTime / count : 24 // デフォルト24時間
  }

  /**
   * 平均解決時間計算
   */
  private async calculateAvgResolutionTime(issues: GitHubIssue[]): Promise<number> {
    if (issues.length === 0) return 0

    const resolutionTimes = issues
      .filter((issue) => issue.closed_at)
      .map((issue) => {
        const created = new Date(issue.created_at)
        const closed = new Date(issue.closed_at!)
        return (closed.getTime() - created.getTime()) / (1000 * 60 * 60)
      })

    return resolutionTimes.length > 0
      ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
      : 72 // デフォルト72時間
  }

  /**
   * SLA遵守率計算
   */
  private async calculateSLACompliance(
    issues: GitHubIssue[],
    type: 'response' | 'resolution'
  ): Promise<number> {
    if (issues.length === 0) return 100

    // 簡略化した計算（実際はより複雑な要件に基づく）
    const slaHours = type === 'response' ? 24 : 72
    const compliantCount = issues.filter((issue) => {
      const hours = type === 'response' ? this.getResponseTime(issue) : this.getResolutionTime(issue)
      return hours <= slaHours
    }).length

    return (compliantCount / issues.length) * 100
  }

  /**
   * 品質スコア計算
   */
  private async calculateQualityScore(issues: GitHubIssue[]): Promise<number> {
    if (issues.length === 0) return 100

    let totalScore = 0

    for (const issue of issues) {
      let score = 0

      // タイトル品質 (20点)
      if (issue.title && issue.title.length > 10) score += 20

      // 説明品質 (25点)
      if (issue.body && issue.body.length > 50) score += 25

      // ラベル品質 (25点)
      if (issue.labels && issue.labels.length > 0) score += 25

      // 担当者アサイン (15点)
      if (issue.assignees && issue.assignees.length > 0) score += 15

      // テンプレート使用 (15点)
      if (
        issue.body &&
        (issue.body.includes('## Bug Description') || issue.body.includes('## Feature Summary'))
      ) {
        score += 15
      }

      totalScore += score
    }

    return totalScore / issues.length
  }

  /**
   * アサイン率計算
   */
  private calculateAssignmentRate(issues: GitHubIssue[]): number {
    if (issues.length === 0) return 100

    const assignedCount = issues.filter(
      (issue) => issue.assignees && issue.assignees.length > 0
    ).length

    return (assignedCount / issues.length) * 100
  }

  /**
   * テンプレート使用率計算
   */
  private calculateTemplateUsage(issues: GitHubIssue[]): number {
    if (issues.length === 0) return 100

    const templateCount = issues.filter(
      (issue) =>
        issue.body &&
        (issue.body.includes('## Bug Description') ||
          issue.body.includes('## Feature Summary') ||
          issue.body.includes('## Security Issue Summary'))
    ).length

    return (templateCount / issues.length) * 100
  }

  /**
   * ラベル使用率計算
   */
  private calculateLabelUsage(
    issues: GitHubIssue[],
    labelPattern: string | string[]
  ): number {
    if (issues.length === 0) return 100

    let count = 0

    for (const issue of issues) {
      if (Array.isArray(labelPattern)) {
        if (
          issue.labels.some((label) => {
            const labelName = typeof label === 'string' ? label : label.name
            return labelPattern.includes(labelName)
          })
        ) {
          count++
        }
      } else {
        if (
          issue.labels.some((label) => {
            const labelName = typeof label === 'string' ? label : label.name
            return labelName.startsWith(labelPattern)
          })
        ) {
          count++
        }
      }
    }

    return (count / issues.length) * 100
  }

  // ==================== Utility Methods ====================

  /**
   * 日付フォーマット
   */
  private formatDate(date: Date): string {
    return date.toLocaleDateString(this.config.dateFormat)
  }

  /**
   * レポート保存
   */
  private async saveReport(report: GeneratedReport, reportType: ReportType): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `issue-report-${reportType}-${timestamp}.md`
    const filepath = `/tmp/${filename}`

    await fs.writeFile(filepath, report.content)

    // GitHub Outputsに設定
    if (this.githubContext?.core) {
      this.githubContext.core.setOutput('report_path', filepath)
      this.githubContext.core.setOutput('report_type', reportType)
      this.githubContext.core.setOutput('report_data', JSON.stringify(report.data))
    }

    this.log(`💾 レポート保存完了: ${filepath}`, 'info')
  }

  // ==================== Placeholder Methods ====================
  // 実装時に詳細化される簡略版メソッド

  private async generateTimeline(
    issues: GitHubIssue[],
    startDate: Date,
    endDate: Date
  ): Promise<IssueTimeline> {
    return {
      creation: [],
      resolution: [],
      dailyStats: [],
    }
  }

  private async collectCommentsData(issues: GitHubIssue[]): Promise<any[]> {
    return []
  }

  private async collectReactionsData(issues: GitHubIssue[]): Promise<any[]> {
    return []
  }

  private async getComparisonPeriods(reportType: ReportType): Promise<any> {
    return { creation: [], resolution: [] }
  }

  private async calculateTrend(current: any, comparison: any): Promise<number> {
    return 0
  }

  private async calculateQualityTrend(data: any, comparison: any): Promise<any> {
    return { overall: 0, responseTime: 0, resolutionTime: 0, assignment: 0 }
  }

  private async generateForecast(timeline: any, reportType: ReportType): Promise<any> {
    return null
  }

  private async analyzeSeasonality(timeline: any, reportType: ReportType): Promise<any> {
    return null
  }

  private async calculateSimpleTrend(issues: GitHubIssue[], field: string): Promise<number> {
    return 0
  }

  private generateForecastSection(forecast: any): string {
    return '予測分析機能は開発中です'
  }

  private generateSeasonalitySection(seasonality: any): string {
    return '季節性分析機能は開発中です'
  }

  private generateQualityImprovements(kpis: IssueKPIs): string {
    const improvements: string[] = []
    if (kpis.templateUsageRate < 80) improvements.push('- テンプレート使用率の向上')
    if (kpis.assignmentRate < 90) improvements.push('- 担当者アサイン率の向上')
    return improvements.join('\n') || '- 現在、大きな改善点は検出されていません'
  }

  private calculateSLARisk(openIssues: GitHubIssue[]): number {
    return openIssues.filter((issue) => this.isStale(issue)).length
  }

  private isStale(issue: GitHubIssue): boolean {
    const daysSinceUpdate =
      (new Date().getTime() - new Date(issue.updated_at).getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceUpdate > 30
  }

  private generateLabelStatistics(issues: GitHubIssue[]): string {
    const labelCounts: Record<string, number> = {}
    for (const issue of issues) {
      for (const label of issue.labels) {
        const labelName = typeof label === 'string' ? label : label.name
        labelCounts[labelName] = (labelCounts[labelName] || 0) + 1
      }
    }
    const topLabels = Object.entries(labelCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([label, count]) => `- ${label}: ${count}件`)
      .join('\n')
    return topLabels || '- ラベル使用データなし'
  }

  private getResponseTime(issue: GitHubIssue): number {
    return 24 // 簡略化
  }

  private getResolutionTime(issue: GitHubIssue): number {
    return 72 // 簡略化
  }

  private calculateAvgComments(issues: GitHubIssue[], comments: any[]): number {
    return comments.length / Math.max(issues.length, 1)
  }

  private countActiveContributors(issues: GitHubIssue[]): number {
    const contributors = new Set<string>()
    for (const issue of issues) {
      contributors.add(issue.user.login)
      if (issue.assignees) {
        for (const assignee of issue.assignees) {
          contributors.add(assignee.login)
        }
      }
    }
    return contributors.size
  }
}

// ==================== Main Execution Function ====================

async function generateIssueReportMain(
  reportType: ReportType,
  options: ScriptOptions = {},
  githubContext?: GitHubActionContext,
  customDays?: number
): Promise<ScriptResult<IssueReportData>> {
  const startTime = Date.now()
  
  try {
    if (!githubContext) {
      throw new Error('GitHub context is required for issue report generation')
    }
    
    const generator = new IssueReportGenerator(githubContext)
    
    if (options.dryRun) {
      console.log('DRY RUN MODE: Would generate issue report but no files will be created')
      return {
        success: true,
        data: {} as IssueReportData,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      }
    }
    
    const report = await generator.generateReport(reportType, customDays)
    
    const reportData: IssueReportData = {
      report,
      metrics: report.data.kpis,
      trends: report.data.trends,
      generatedAt: report.generatedAt.toISOString(),
      reportType,
      version: report.version,
    }
    
    return {
      success: true,
      data: reportData,
      duration: Date.now() - startTime,
      timestamp: new Date(),
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`Issue report generation failed: ${errorMessage}`)
    
    return {
      success: false,
      error: errorMessage,
      duration: Date.now() - startTime,
      timestamp: new Date(),
    }
  }
}

// ==================== CLI Execution ====================

if (require.main === module) {
  const args = process.argv.slice(2)
  const options: ScriptOptions = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    force: args.includes('--force'),
  }
  
  const reportType = (args.find(arg => ['daily', 'weekly', 'monthly', 'quarterly'].includes(arg)) as ReportType) || 'daily'
  
  // CLI usage would require proper GitHub context setup
  console.log('Issue report generator requires GitHub Actions context')
  console.log(`Would generate ${reportType} report with options:`, options)
  process.exit(0)
}

export default IssueReportGenerator
export { IssueReportGenerator, generateIssueReportMain, type GeneratedReport, type IssueDataCollection }