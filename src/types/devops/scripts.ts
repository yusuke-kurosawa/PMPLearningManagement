/**
 * DevOps Script Types
 * Type definitions for Node.js automation scripts and CI/CD pipelines
 */

import type { SpawnOptions } from 'child_process'
import type { Stats } from 'fs'

// ==================== Core Script Types ====================

export interface ScriptConfig {
  name: string
  version: string
  description?: string
  author?: string
  dependencies?: Record<string, string>
  environment?: NodeJS.ProcessEnv
  timeout?: number
  retries?: number
  logLevel?: LogLevel
}

export interface ScriptResult<T = unknown> {
  success: boolean
  data?: T
  error?: Error | string
  duration: number
  timestamp: Date
  exitCode?: number
}

export interface ScriptContext {
  workingDirectory: string
  environment: NodeJS.ProcessEnv
  args: string[]
  options: Record<string, unknown>
}

// ==================== CLI and Process Types ====================

export interface CliOptions {
  verbose?: boolean
  dryRun?: boolean
  force?: boolean
  silent?: boolean
  output?: string
  config?: string
  help?: boolean
  version?: boolean
}

export interface ProcessExecutionOptions extends SpawnOptions {
  timeout?: number
  retries?: number
  ignoreErrors?: boolean
  logOutput?: boolean
}

export interface CommandResult {
  stdout: string
  stderr: string
  exitCode: number
  command: string
  duration: number
  success: boolean
}

// ==================== File System Types ====================

export interface FileOperation {
  type: 'read' | 'write' | 'copy' | 'move' | 'delete' | 'mkdir'
  source: string
  destination?: string
  content?: string
  options?: FileOperationOptions
}

export interface FileOperationOptions {
  encoding?: BufferEncoding
  mode?: number
  recursive?: boolean
  force?: boolean
  backup?: boolean
}

export interface FileInfo {
  path: string
  name: string
  extension: string
  size: number
  modified: Date
  stats: Stats
  isDirectory: boolean
  isFile: boolean
}

export interface DirectoryInfo {
  path: string
  files: FileInfo[]
  directories: DirectoryInfo[]
  totalSize: number
  fileCount: number
  directoryCount: number
}

// ==================== Build and Optimization Types ====================

export interface BuildConfig {
  input: string
  output: string
  mode: 'development' | 'production' | 'test'
  target: string[]
  optimization: OptimizationConfig
  plugins?: BuildPlugin[]
  externals?: Record<string, string>
}

export interface OptimizationConfig {
  minimize: boolean
  treeshake: boolean
  splitChunks: boolean
  compressionLevel?: number
  removeUnusedCSS: boolean
  optimizeImages: boolean
}

export interface BuildPlugin {
  name: string
  options?: Record<string, unknown>
  apply?: string[]
}

export interface BundleAnalysis {
  totalSize: number
  gzippedSize: number
  files: BundleFile[]
  dependencies: DependencyInfo[]
  duplicates: string[]
  suggestions: OptimizationSuggestion[]
}

export interface BundleFile {
  name: string
  size: number
  gzippedSize: number
  type: 'js' | 'css' | 'html' | 'image' | 'font' | 'other'
  chunks: string[]
}

export interface DependencyInfo {
  name: string
  version: string
  size: number
  used: boolean
  treeshakeable: boolean
  license?: string
}

export interface OptimizationSuggestion {
  type: 'remove' | 'replace' | 'compress' | 'treeshake' | 'split'
  target: string
  description: string
  potentialSavings: number
  impact: 'low' | 'medium' | 'high'
}

// ==================== Quality Assurance Types ====================

export interface QualityCheck {
  name: string
  type: 'lint' | 'test' | 'security' | 'accessibility' | 'performance'
  status: 'passed' | 'failed' | 'warning' | 'skipped'
  result: QualityResult
  duration: number
}

export interface QualityResult {
  score?: number
  issues: QualityIssue[]
  suggestions: string[]
  details?: Record<string, unknown>
}

export interface QualityIssue {
  id: string
  severity: 'error' | 'warning' | 'info'
  message: string
  file?: string
  line?: number
  column?: number
  rule?: string
  category?: string
}

export interface SecurityAudit {
  timestamp: Date
  vulnerabilities: SecurityVulnerability[]
  summary: SecuritySummary
  recommendations: SecurityRecommendation[]
}

export interface SecurityVulnerability {
  id: string
  title: string
  severity: 'critical' | 'high' | 'moderate' | 'low' | 'info'
  package: string
  version: string
  description: string
  fixedIn?: string
  cve?: string[]
}

export interface SecuritySummary {
  total: number
  critical: number
  high: number
  moderate: number
  low: number
  info: number
}

export interface SecurityRecommendation {
  action: 'update' | 'replace' | 'remove' | 'audit'
  package: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

// ==================== Accessibility Types ====================

export interface AccessibilityAudit {
  url: string
  timestamp: Date
  violations: AccessibilityViolation[]
  summary: AccessibilitySummary
  compliance: AccessibilityCompliance
}

export interface AccessibilityViolation {
  id: string
  impact: 'critical' | 'serious' | 'moderate' | 'minor'
  tags: string[]
  description: string
  help: string
  helpUrl: string
  nodes: AccessibilityNode[]
}

export interface AccessibilityNode {
  target: string[]
  html: string
  impact: string
  any: AccessibilityCheck[]
  all: AccessibilityCheck[]
  none: AccessibilityCheck[]
}

export interface AccessibilityCheck {
  id: string
  impact: string
  message: string
  data: Record<string, unknown>
}

export interface AccessibilitySummary {
  violations: number
  passes: number
  incomplete: number
  inapplicable: number
}

export interface AccessibilityCompliance {
  level: 'A' | 'AA' | 'AAA'
  standards: ('WCAG2A' | 'WCAG2AA' | 'WCAG2AAA' | 'Section508')[]
  score: number
}

// ==================== Performance Types ====================

export interface PerformanceAudit {
  url: string
  timestamp: Date
  metrics: PerformanceMetrics
  opportunities: PerformanceOpportunity[]
  diagnostics: PerformanceDiagnostic[]
  scores: PerformanceScores
}

export interface PerformanceMetrics {
  firstContentfulPaint: number
  largestContentfulPaint: number
  firstInputDelay: number
  cumulativeLayoutShift: number
  timeToInteractive: number
  speedIndex: number
  totalBlockingTime: number
}

export interface PerformanceOpportunity {
  id: string
  title: string
  description: string
  score: number
  numericValue: number
  numericUnit: string
  displayValue: string
  details?: Record<string, unknown>
}

export interface PerformanceDiagnostic {
  id: string
  title: string
  description: string
  score: number
  displayValue: string
  details?: Record<string, unknown>
}

export interface PerformanceScores {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
  pwa: number
}

export interface PerformanceBudget {
  resourceCounts: ResourceBudget[]
  resourceSizes: ResourceBudget[]
  timings: TimingBudget[]
}

export interface ResourceBudget {
  resourceType: 'document' | 'script' | 'stylesheet' | 'image' | 'media' | 'font' | 'other'
  budget: number
}

export interface TimingBudget {
  metric:
    | 'first-contentful-paint'
    | 'largest-contentful-paint'
    | 'interactive'
    | 'first-meaningful-paint'
  budget: number
}

// ==================== GitHub and Git Types ====================

export interface GitHubConfig {
  owner: string
  repo: string
  token: string
  apiUrl?: string
}

export interface GitHubIssue {
  number: number
  title: string
  body: string
  state: 'open' | 'closed'
  labels: GitHubLabel[]
  assignees: GitHubUser[]
  milestone?: GitHubMilestone
  createdAt: Date
  updatedAt: Date
  author: GitHubUser
}

export interface GitHubLabel {
  id: number
  name: string
  color: string
  description?: string
}

export interface GitHubUser {
  id: number
  login: string
  name?: string
  email?: string
  avatarUrl?: string
}

export interface GitHubMilestone {
  id: number
  number: number
  title: string
  description?: string
  state: 'open' | 'closed'
  dueOn?: Date
}

export interface GitHubPullRequest {
  number: number
  title: string
  body: string
  state: 'open' | 'closed' | 'merged'
  head: GitBranch
  base: GitBranch
  mergeable?: boolean
  createdAt: Date
  updatedAt: Date
  author: GitHubUser
}

export interface GitBranch {
  ref: string
  sha: string
  repo: GitHubRepository
}

export interface GitHubRepository {
  id: number
  name: string
  fullName: string
  owner: GitHubUser
  private: boolean
  htmlUrl: string
  cloneUrl: string
}

// ==================== Issue Driven Development Types ====================

export interface IDDConfig {
  enabled: boolean
  requireIssueReference: boolean
  branchNamingPattern: string
  commitMessagePattern: string
  autoCloseIssues: boolean
  qualityGates: IDDQualityGate[]
}

export interface IDDQualityGate {
  name: string
  type: 'commit' | 'branch' | 'pr' | 'merge'
  rules: IDDRule[]
  required: boolean
}

export interface IDDRule {
  name: string
  pattern: string
  message: string
  severity: 'error' | 'warning'
}

export interface IDDMetrics {
  issueCount: number
  closedIssues: number
  averageResolutionTime: number
  commitCompliance: number
  branchCompliance: number
  qualityScore: number
}

export interface IDDReport {
  timestamp: Date
  period: { start: Date; end: Date }
  metrics: IDDMetrics
  violations: IDDViolation[]
  recommendations: string[]
}

export interface IDDViolation {
  type: 'commit' | 'branch' | 'pr'
  reference: string
  rule: string
  message: string
  severity: 'error' | 'warning'
  timestamp: Date
}

// ==================== Monitoring and Analytics Types ====================

export interface MonitoringConfig {
  interval: number
  endpoints: string[]
  metrics: MonitoringMetric[]
  alerts: AlertConfig[]
}

export interface MonitoringMetric {
  name: string
  type: 'gauge' | 'counter' | 'histogram' | 'summary'
  description: string
  labels?: string[]
}

export interface AlertConfig {
  name: string
  condition: string
  threshold: number
  severity: 'critical' | 'warning' | 'info'
  channels: AlertChannel[]
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'github'
  config: Record<string, unknown>
}

export interface HealthCheck {
  service: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: HealthCheckResult[]
  timestamp: Date
  responseTime: number
}

export interface HealthCheckResult {
  name: string
  status: 'pass' | 'fail' | 'warn'
  details?: Record<string, unknown>
  duration: number
}

// ==================== Logging Types ====================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  context?: LogContext
  metadata?: Record<string, unknown>
}

export interface LogContext {
  service?: string
  version?: string
  environment?: string
  userId?: string
  sessionId?: string
  requestId?: string
  [key: string]: unknown
}

export interface LoggerConfig {
  level: LogLevel
  format: 'json' | 'text' | 'structured'
  output: 'console' | 'file' | 'syslog' | 'custom'
  file?: {
    path: string
    maxSize: number
    maxFiles: number
    compress: boolean
  }
  custom?: {
    transport: (entry: LogEntry) => void
  }
}

// ==================== Utility Types ====================

export interface ScriptOptions {
  dryRun?: boolean
  verbose?: boolean
  force?: boolean
  parallel?: boolean
  maxConcurrency?: number
  timeout?: number
  retries?: number
  continueOnError?: boolean
}

export interface ProgressTracker {
  total: number
  completed: number
  failed: number
  skipped: number
  startTime: Date
  estimatedCompletion?: Date
}

export interface TaskQueue<T> {
  add: (task: T) => void
  process: () => Promise<void>
  clear: () => void
  size: () => number
  isEmpty: () => boolean
}

export interface Cache<T> {
  get: (key: string) => T | undefined
  set: (key: string, value: T, ttl?: number) => void
  delete: (key: string) => boolean
  clear: () => void
  size: () => number
}

// ==================== Migration Types ====================

export interface MigrationScript {
  version: string
  description: string
  up: () => Promise<void>
  down: () => Promise<void>
  dependencies?: string[]
}

export interface MigrationStatus {
  version: string
  appliedAt: Date
  duration: number
  success: boolean
  error?: string
}

export interface MigrationPlan {
  current: string
  target: string
  migrations: MigrationScript[]
  estimatedDuration: number
}

// ==================== Environment Types ====================

export interface EnvironmentConfig {
  name: string
  variables: Record<string, string>
  secrets: string[]
  services: ServiceConfig[]
}

export interface ServiceConfig {
  name: string
  type: 'web' | 'worker' | 'database' | 'cache' | 'queue'
  image?: string
  command?: string[]
  environment?: Record<string, string>
  ports?: number[]
  volumes?: VolumeMount[]
  healthCheck?: HealthCheckConfig
}

export interface VolumeMount {
  source: string
  target: string
  readOnly?: boolean
}

export interface HealthCheckConfig {
  command: string[]
  interval: number
  timeout: number
  retries: number
  startPeriod?: number
}

// ==================== Export Collections ====================

export type DevOpsScriptTypes = {
  ScriptConfig: ScriptConfig
  ScriptResult: ScriptResult
  CommandResult: CommandResult
  BundleAnalysis: BundleAnalysis
  QualityCheck: QualityCheck
  SecurityAudit: SecurityAudit
  AccessibilityAudit: AccessibilityAudit
  PerformanceAudit: PerformanceAudit
  GitHubIssue: GitHubIssue
  IDDReport: IDDReport
  HealthCheck: HealthCheck
  LogEntry: LogEntry
  MigrationScript: MigrationScript
  EnvironmentConfig: EnvironmentConfig
}

// ==================== Default Configurations ====================

export const DEFAULT_SCRIPT_CONFIG: Partial<ScriptConfig> = {
  timeout: 300000, // 5 minutes
  retries: 3,
  logLevel: 'info',
}

export const DEFAULT_CLI_OPTIONS: CliOptions = {
  verbose: false,
  dryRun: false,
  force: false,
  silent: false,
}

export const DEFAULT_PERFORMANCE_BUDGET: PerformanceBudget = {
  resourceCounts: [
    { resourceType: 'script', budget: 10 },
    { resourceType: 'stylesheet', budget: 5 },
    { resourceType: 'image', budget: 20 },
  ],
  resourceSizes: [
    { resourceType: 'script', budget: 300000 }, // 300KB
    { resourceType: 'stylesheet', budget: 100000 }, // 100KB
  ],
  timings: [
    { metric: 'first-contentful-paint', budget: 2000 },
    { metric: 'largest-contentful-paint', budget: 2500 },
    { metric: 'interactive', budget: 5000 },
  ],
}

export const IDD_PATTERNS = {
  BRANCH_NAMING: /^(feature|fix|hotfix|chore)\/issue-\d+/,
  COMMIT_MESSAGE: /(feat|fix|docs|style|refactor|test|chore).*#\d+/,
  ISSUE_REFERENCE: /#\d+/,
} as const
