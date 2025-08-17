/**
 * Metrics Collection & Analysis Type Definitions
 * KPI分析、レポート生成、メトリクス追跡の型定義
 */

// Core Metrics
export interface Metric<T = number> {
  readonly name: string
  readonly value: T
  readonly unit?: string
  readonly timestamp: Date
  readonly tags?: Record<string, string>
}

export interface MetricSeries<T = number> {
  readonly name: string
  readonly values: Array<Metric<T>>
  readonly aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count'
}

// Development Metrics
export interface DevelopmentMetrics {
  readonly commits: CommitMetrics
  readonly issues: IssueMetrics
  readonly pullRequests: PullRequestMetrics
  readonly codeQuality: CodeQualityMetrics
  readonly performance: PerformanceMetrics
  readonly period: TimePeriod
}

export interface CommitMetrics {
  readonly total: number
  readonly frequency: number // commits per day
  readonly averageSize: number // lines changed
  readonly byAuthor: Record<string, number>
  readonly byType: Record<string, number> // feat, fix, docs, etc.
}

export interface IssueMetrics {
  readonly total: number
  readonly open: number
  readonly closed: number
  readonly averageResolutionTime: number // hours
  readonly byLabel: Record<string, number>
  readonly byPriority: Record<string, number>
}

export interface PullRequestMetrics {
  readonly total: number
  readonly merged: number
  readonly closed: number
  readonly averageReviewTime: number // hours
  readonly averageSize: number // files changed
  readonly reviewCoverage: number // percentage
}

export interface CodeQualityMetrics {
  readonly testCoverage: number // percentage
  readonly codeComplexity: number
  readonly technicalDebt: number // hours
  readonly lintingIssues: number
  readonly securityVulnerabilities: number
  readonly maintainabilityIndex: number // 0-100
}

// Project Health Metrics
export interface ProjectHealthScore {
  readonly overall: number // 0-100
  readonly development: number
  readonly quality: number
  readonly performance: number
  readonly documentation: number
  readonly community: number
}

export interface HealthIndicator {
  readonly name: string
  readonly current: number
  readonly target: number
  readonly trend: 'improving' | 'stable' | 'declining'
  readonly status: 'healthy' | 'warning' | 'critical'
}

// KPI Analysis
export interface KPIDefinition {
  readonly name: string
  readonly description: string
  readonly formula: string
  readonly target: number
  readonly unit: string
  readonly category: string
}

export interface KPIResult {
  readonly definition: KPIDefinition
  readonly current: number
  readonly target: number
  readonly achievement: number // percentage
  readonly trend: TrendDirection
  readonly status: 'on-track' | 'at-risk' | 'off-track'
}

export type TrendDirection = 'up' | 'down' | 'stable'

// Report Generation
export interface ReportConfig {
  readonly title: string
  readonly period: TimePeriod
  readonly includeMetrics: string[]
  readonly format: 'json' | 'html' | 'pdf' | 'csv'
  readonly recipients?: string[]
}

export interface TimePeriod {
  readonly start: Date
  readonly end: Date
  readonly duration: number // days
}

export interface Report {
  readonly config: ReportConfig
  readonly metadata: ReportMetadata
  readonly sections: ReportSection[]
  readonly summary: ReportSummary
  readonly generatedAt: Date
}

export interface ReportMetadata {
  readonly version: string
  readonly generator: string
  readonly dataSource: string
  readonly filters?: Record<string, unknown>
}

export interface ReportSection {
  readonly title: string
  readonly type: 'metrics' | 'chart' | 'table' | 'text' | 'summary'
  readonly content: unknown
  readonly insights?: string[]
}

export interface ReportSummary {
  readonly keyFindings: string[]
  readonly recommendations: string[]
  readonly alerts: string[]
  readonly nextActions: string[]
}

// Quality Dashboard
export interface QualityDashboard {
  readonly overview: QualityOverview
  readonly trends: QualityTrend[]
  readonly alerts: QualityAlert[]
  readonly recommendations: QualityRecommendation[]
  readonly lastUpdated: Date
}

export interface QualityOverview {
  readonly score: number // 0-100
  readonly grade: 'A' | 'B' | 'C' | 'D' | 'F'
  readonly status: 'excellent' | 'good' | 'needs-improvement' | 'poor'
  readonly metrics: Record<string, number>
}

export interface QualityTrend {
  readonly metric: string
  readonly values: Array<{ date: Date; value: number }>
  readonly direction: TrendDirection
  readonly changeRate: number // percentage
}

export interface QualityAlert {
  readonly type: 'regression' | 'threshold' | 'anomaly'
  readonly metric: string
  readonly message: string
  readonly severity: 'low' | 'medium' | 'high' | 'critical'
  readonly timestamp: Date
}

export interface QualityRecommendation {
  readonly category: string
  readonly priority: 'low' | 'medium' | 'high'
  readonly title: string
  readonly description: string
  readonly action: string
  readonly estimatedImpact: number // score improvement
  readonly estimatedEffort: number // hours
}

// Performance Analytics
export interface PerformanceAnalytics {
  readonly vitals: WebVitals
  readonly lighthouse: LighthouseMetrics
  readonly runtime: RuntimeMetrics
  readonly trends: PerformanceTrend[]
}

export interface WebVitals {
  readonly fcp: number // First Contentful Paint
  readonly lcp: number // Largest Contentful Paint
  readonly fid: number // First Input Delay
  readonly cls: number // Cumulative Layout Shift
  readonly ttfb: number // Time to First Byte
}

export interface LighthouseMetrics {
  readonly performance: number // 0-100
  readonly accessibility: number
  readonly bestPractices: number
  readonly seo: number
  readonly pwa: number
}

export interface RuntimeMetrics {
  readonly bundleSize: number
  readonly loadTime: number
  readonly renderTime: number
  readonly memoryUsage: number
  readonly cpuUsage: number
}

export interface PerformanceTrend {
  readonly metric: string
  readonly values: Array<{ timestamp: Date; value: number }>
  readonly baseline: number
  readonly target: number
  readonly status: 'improving' | 'stable' | 'degrading'
}

// Automation Metrics
export interface AutomationMetrics {
  readonly cicdPipeline: PipelineMetrics
  readonly deployments: DeploymentMetrics
  readonly testing: TestingMetrics
  readonly monitoring: MonitoringMetrics
}

export interface PipelineMetrics {
  readonly totalRuns: number
  readonly successRate: number
  readonly averageDuration: number
  readonly failureReasons: Record<string, number>
}

export interface DeploymentMetrics {
  readonly frequency: number // per week
  readonly successRate: number
  readonly rollbackRate: number
  readonly averageDeployTime: number
}

export interface TestingMetrics {
  readonly coverage: number // percentage
  readonly passRate: number
  readonly automationRatio: number
  readonly executionTime: number
}

export interface MonitoringMetrics {
  readonly uptime: number // percentage
  readonly responseTime: number // ms
  readonly errorRate: number // percentage
  readonly alertsGenerated: number
}
