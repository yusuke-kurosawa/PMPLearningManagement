/**
 * DevOps Operations Type Definitions
 * CI/CD、デプロイメント、インフラ管理、セキュリティ監査の型定義
 */

// CI/CD Pipeline
export interface Pipeline {
  readonly id: string
  readonly name: string
  readonly status: PipelineStatus
  readonly stages: PipelineStage[]
  readonly triggers: PipelineTrigger[]
  readonly configuration: PipelineConfig
}

export type PipelineStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled' | 'skipped'

export interface PipelineStage {
  readonly name: string
  readonly status: PipelineStatus
  readonly jobs: PipelineJob[]
  readonly dependencies?: string[]
  readonly condition?: string
}

export interface PipelineJob {
  readonly name: string
  readonly status: PipelineStatus
  readonly steps: PipelineStep[]
  readonly environment?: string
  readonly artifacts?: PipelineArtifact[]
}

export interface PipelineStep {
  readonly name: string
  readonly command: string
  readonly status: PipelineStatus
  readonly duration?: number
  readonly output?: string
  readonly error?: string
}

export interface PipelineTrigger {
  readonly type: 'push' | 'pull_request' | 'schedule' | 'manual' | 'webhook'
  readonly configuration: Record<string, unknown>
}

export interface PipelineConfig {
  readonly timeout?: number
  readonly retryPolicy?: RetryPolicy
  readonly environmentVariables?: Record<string, string>
  readonly secrets?: string[]
}

export interface RetryPolicy {
  readonly maxAttempts: number
  readonly backoffStrategy: 'linear' | 'exponential' | 'fixed'
  readonly delaySeconds: number
}

export interface PipelineArtifact {
  readonly name: string
  readonly path: string
  readonly type: 'build' | 'test' | 'report' | 'binary' | 'documentation'
  readonly size: number
  readonly retention?: number // days
}

// Deployment Management
export interface Deployment {
  readonly id: string
  readonly environment: Environment
  readonly version: string
  readonly status: DeploymentStatus
  readonly strategy: DeploymentStrategy
  readonly rollback?: RollbackInfo
  readonly timestamp: Date
}

export type DeploymentStatus = 'pending' | 'deploying' | 'deployed' | 'failed' | 'rolled-back'

export interface Environment {
  readonly name: string
  readonly type: 'development' | 'staging' | 'production' | 'testing'
  readonly url?: string
  readonly configuration: EnvironmentConfig
}

export interface EnvironmentConfig {
  readonly variables: Record<string, string>
  readonly secrets: Record<string, string>
  readonly resources: ResourceConfig
  readonly monitoring: MonitoringConfig
}

export interface ResourceConfig {
  readonly cpu: string
  readonly memory: string
  readonly storage: string
  readonly replicas?: number
}

export interface MonitoringConfig {
  readonly healthCheck: HealthCheckConfig
  readonly alerts: AlertConfig[]
  readonly metrics: string[]
}

export interface HealthCheckConfig {
  readonly endpoint: string
  readonly interval: number // seconds
  readonly timeout: number // seconds
  readonly retries: number
}

export interface AlertConfig {
  readonly name: string
  readonly condition: string
  readonly threshold: number
  readonly recipients: string[]
}

export type DeploymentStrategy = 'rolling' | 'blue-green' | 'canary' | 'recreate'

export interface RollbackInfo {
  readonly previousVersion: string
  readonly reason: string
  readonly timestamp: Date
  readonly automated: boolean
}

// Security Audit
export interface SecurityAudit {
  readonly id: string
  readonly type: SecurityAuditType
  readonly scope: SecurityScope
  readonly findings: SecurityFinding[]
  readonly summary: SecuritySummary
  readonly timestamp: Date
}

export type SecurityAuditType =
  | 'dependency'
  | 'code'
  | 'infrastructure'
  | 'configuration'
  | 'compliance'

export interface SecurityScope {
  readonly targets: string[]
  readonly exclude?: string[]
  readonly depth: 'shallow' | 'deep' | 'comprehensive'
}

export interface SecurityFinding {
  readonly id: string
  readonly severity: SecuritySeverity
  readonly category: SecurityCategory
  readonly title: string
  readonly description: string
  readonly location: SecurityLocation
  readonly remediation: SecurityRemediation
  readonly references?: string[]
}

export type SecuritySeverity = 'info' | 'low' | 'medium' | 'high' | 'critical'
export type SecurityCategory =
  | 'vulnerability'
  | 'misconfiguration'
  | 'policy'
  | 'compliance'
  | 'best-practice'

export interface SecurityLocation {
  readonly file?: string
  readonly line?: number
  readonly component?: string
  readonly dependency?: string
}

export interface SecurityRemediation {
  readonly description: string
  readonly steps: string[]
  readonly automated: boolean
  readonly priority: 'low' | 'medium' | 'high' | 'urgent'
  readonly estimatedEffort: string
}

export interface SecuritySummary {
  readonly totalFindings: number
  readonly bySeverity: Record<SecuritySeverity, number>
  readonly byCategory: Record<SecurityCategory, number>
  readonly riskScore: number // 0-100
  readonly complianceScore: number // 0-100
}

// Infrastructure Monitoring
export interface InfrastructureHealth {
  readonly services: ServiceHealth[]
  readonly resources: ResourceHealth[]
  readonly network: NetworkHealth
  readonly storage: StorageHealth
  readonly overall: OverallHealth
}

export interface ServiceHealth {
  readonly name: string
  readonly status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown'
  readonly uptime: number // percentage
  readonly responseTime: number // ms
  readonly errorRate: number // percentage
  readonly lastCheck: Date
}

export interface ResourceHealth {
  readonly type: 'cpu' | 'memory' | 'disk' | 'network'
  readonly usage: number // percentage
  readonly threshold: number // percentage
  readonly status: 'normal' | 'warning' | 'critical'
  readonly trend: 'increasing' | 'stable' | 'decreasing'
}

export interface NetworkHealth {
  readonly latency: number // ms
  readonly throughput: number // Mbps
  readonly packetLoss: number // percentage
  readonly connectionCount: number
}

export interface StorageHealth {
  readonly totalSpace: number // bytes
  readonly usedSpace: number // bytes
  readonly availableSpace: number // bytes
  readonly readLatency: number // ms
  readonly writeLatency: number // ms
}

export interface OverallHealth {
  readonly score: number // 0-100
  readonly status: 'healthy' | 'degraded' | 'unhealthy'
  readonly issues: HealthIssue[]
  readonly recommendations: string[]
}

export interface HealthIssue {
  readonly component: string
  readonly severity: 'low' | 'medium' | 'high' | 'critical'
  readonly message: string
  readonly since: Date
}

// Backup and Recovery
export interface BackupConfig {
  readonly schedule: CronSchedule
  readonly retention: RetentionPolicy
  readonly storage: BackupStorage
  readonly encryption: EncryptionConfig
}

export interface CronSchedule {
  readonly expression: string
  readonly timezone: string
  readonly description: string
}

export interface RetentionPolicy {
  readonly daily: number // days
  readonly weekly: number // weeks
  readonly monthly: number // months
  readonly yearly: number // years
}

export interface BackupStorage {
  readonly type: 'local' | 's3' | 'gcs' | 'azure' | 'ftp'
  readonly location: string
  readonly credentials: string // reference to secret
}

export interface EncryptionConfig {
  readonly enabled: boolean
  readonly algorithm?: string
  readonly keyId?: string
}

export interface BackupStatus {
  readonly id: string
  readonly status: 'pending' | 'running' | 'completed' | 'failed'
  readonly progress: number // percentage
  readonly size: number // bytes
  readonly duration?: number // seconds
  readonly error?: string
  readonly timestamp: Date
}

// Deployment Optimization
export interface DeploymentOptimizer {
  readonly verifyBuild: () => void
  readonly optimizeHTML: () => void
  readonly createSPA404: () => void
  readonly copyPWAAssets: () => PWAAssets
  readonly createNoJekyll: () => void
  readonly optimizeAssets: () => BundleAnalysis
  readonly generateReport: (pwaAssets: PWAAssets, bundleAnalysis?: BundleAnalysis) => DeploymentReport
}

export interface PWAAssets {
  readonly manifest: boolean
  readonly serviceWorker: boolean
  readonly offlinePage: boolean
  readonly headers: boolean
}

export interface DeploymentReport {
  readonly timestamp: string
  readonly buildPath: string
  readonly pwaAssets: PWAAssets
  readonly routing: {
    readonly spa404: boolean
    readonly nojekyll: boolean
  }
  readonly bundleAnalysis?: BundleAnalysis
  readonly performanceBudget: PerformanceBudget
}

export interface BundleAnalysis {
  readonly totalSizeBytes: number
  readonly totalSizeKB: number
  readonly gzippedSizeKB: number
  readonly fileCount: number
  readonly withinBudget: boolean
}

export interface PerformanceBudget {
  readonly limitKB: number
  readonly withinBudget: boolean
}

// Health Checking
export interface HealthChecker {
  readonly checkHealth: () => Promise<HealthReport>
}

export interface HealthReport {
  readonly timestamp: string
  readonly application: {
    readonly status: 'healthy' | 'unhealthy' | 'unknown'
    readonly responseTime: number
    readonly version?: string
    readonly details: Record<string, any>
    readonly error?: string
  }
  readonly assets: {
    readonly status: 'healthy' | 'unhealthy' | 'unknown'
    readonly responseTime: number
    readonly details: Record<string, any>
    readonly error?: string
  }
  readonly performanceTests: readonly {
    readonly name: string
    readonly duration: number
    readonly status: 'good' | 'slow'
  }[]
  readonly issues: readonly {
    readonly type: 'error' | 'warning' | 'info' | 'critical'
    readonly category: string
    readonly message: string
    readonly action?: string
    readonly details?: any
    readonly error?: string
  }[]
  readonly overallStatus: string
}

export interface SystemHealth {
  readonly status: 'healthy' | 'degraded' | 'unhealthy'
  readonly uptime: number
  readonly version: string
  readonly environment: string
  readonly lastCheck: Date
}
