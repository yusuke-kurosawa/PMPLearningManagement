/**
 * MLOps Model Monitoring Service
 * Comprehensive model lifecycle management and monitoring
 */

export interface ModelRegistry {
  models: Map<string, ModelMetadata>
  versions: Map<string, ModelVersion[]>
  deployments: Map<string, DeploymentInfo>
}

export interface ModelMetadata {
  id: string
  name: string
  type: string
  description: string
  framework: 'tensorflow' | 'pytorch' | 'sklearn' | 'xgboost' | 'custom'
  createdAt: Date
  createdBy: string
  tags: string[]
  status: 'development' | 'staging' | 'production' | 'archived'
}

export interface ModelVersion {
  version: string
  modelId: string
  trainedAt: Date
  metrics: ModelPerformanceMetrics
  parameters: any
  datasetInfo: DatasetInfo
  artifacts: ModelArtifacts
  validationResults: ValidationResults
}

export interface ModelPerformanceMetrics {
  accuracy?: number
  precision?: number
  recall?: number
  f1Score?: number
  auc?: number
  rmse?: number
  mae?: number
  mape?: number
  r2?: number
  logLoss?: number
  customMetrics?: Map<string, number>
}

export interface DatasetInfo {
  trainSize: number
  validationSize: number
  testSize: number
  features: number
  dataVersion: string
  dataQuality: DataQualityMetrics
}

export interface DataQualityMetrics {
  completeness: number
  uniqueness: number
  consistency: number
  validity: number
  missingValues: number
  outliers: number
}

export interface ModelArtifacts {
  modelPath: string
  weightsPath?: string
  configPath: string
  preprocessorPath?: string
  requirements?: string[]
}

export interface ValidationResults {
  crossValidationScore: number
  holdoutScore: number
  businessMetrics: Map<string, number>
  fairnessMetrics: FairnessMetrics
}

export interface FairnessMetrics {
  demographicParity: number
  equalOpportunity: number
  equalizedOdds: number
  disparateImpact: number
}

export interface DeploymentInfo {
  modelId: string
  version: string
  environment: 'development' | 'staging' | 'production'
  endpoint: string
  deployedAt: Date
  deployedBy: string
  resourceAllocation: ResourceAllocation
  servingConfig: ServingConfig
}

export interface ResourceAllocation {
  cpu: number
  memory: number
  gpu?: number
  replicas: number
  autoScaling: boolean
}

export interface ServingConfig {
  batchSize?: number
  timeout: number
  maxConcurrent: number
  cachingEnabled: boolean
  preprocessingEnabled: boolean
}

export interface ModelMonitoringConfig {
  driftDetection: DriftDetectionConfig
  performanceMonitoring: PerformanceMonitoringConfig
  dataQualityMonitoring: DataQualityMonitoringConfig
  alerting: AlertingConfig
}

export interface DriftDetectionConfig {
  enabled: boolean
  methods: DriftDetectionMethod[]
  threshold: number
  windowSize: number
  checkFrequency: number // minutes
}

export interface DriftDetectionMethod {
  type: 'kl_divergence' | 'ks_test' | 'chi_square' | 'psi' | 'wasserstein'
  features?: string[]
  sensitivity: number
}

export interface PerformanceMonitoringConfig {
  metrics: string[]
  baselineMetrics: Map<string, number>
  degradationThreshold: number
  evaluationFrequency: number // minutes
}

export interface DataQualityMonitoringConfig {
  checks: DataQualityCheck[]
  frequency: number // minutes
}

export interface DataQualityCheck {
  type: 'schema' | 'distribution' | 'missing' | 'outlier' | 'custom'
  config: any
}

export interface AlertingConfig {
  channels: AlertChannel[]
  rules: AlertRule[]
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'pagerduty'
  config: any
}

export interface AlertRule {
  name: string
  condition: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  channels: string[]
}

export interface ModelDriftReport {
  timestamp: Date
  modelId: string
  version: string
  driftDetected: boolean
  driftScore: number
  affectedFeatures: string[]
  recommendations: string[]
}

export interface PerformanceDegradationReport {
  timestamp: Date
  modelId: string
  version: string
  currentMetrics: ModelPerformanceMetrics
  baselineMetrics: ModelPerformanceMetrics
  degradation: Map<string, number>
  alert: boolean
}

export class ModelMonitoringService {
  private registry: ModelRegistry
  private monitoringConfig: ModelMonitoringConfig
  private monitoringData: Map<string, MonitoringData>
  private alerts: Alert[]
  private isMonitoring: boolean = false
  private monitoringInterval: NodeJS.Timeout | null = null

  constructor(config: ModelMonitoringConfig) {
    this.registry = {
      models: new Map(),
      versions: new Map(),
      deployments: new Map(),
    }
    this.monitoringConfig = config
    this.monitoringData = new Map()
    this.alerts = []
  }

  /**
   * Register a new model
   */
  public registerModel(metadata: ModelMetadata): string {
    this.registry.models.set(metadata.id, metadata)
    this.registry.versions.set(metadata.id, [])
    return metadata.id
  }

  /**
   * Add a new model version
   */
  public addModelVersion(version: ModelVersion): void {
    const versions = this.registry.versions.get(version.modelId) || []
    versions.push(version)
    this.registry.versions.set(version.modelId, versions)

    // Initialize monitoring data
    this.initializeMonitoringData(version.modelId, version.version)
  }

  /**
   * Deploy a model
   */
  public deployModel(deployment: DeploymentInfo): void {
    const key = `${deployment.modelId}-${deployment.environment}`
    this.registry.deployments.set(key, deployment)

    // Start monitoring if not already running
    if (!this.isMonitoring) {
      this.startMonitoring()
    }
  }

  /**
   * Initialize monitoring data for a model
   */
  private initializeMonitoringData(modelId: string, version: string): void {
    const key = `${modelId}-${version}`
    this.monitoringData.set(key, {
      predictions: [],
      actuals: [],
      features: [],
      timestamps: [],
      performanceHistory: [],
      driftHistory: [],
    })
  }

  /**
   * Start monitoring
   */
  public startMonitoring(): void {
    if (this.isMonitoring) {
      return
    }

    this.isMonitoring = true

    // Schedule periodic checks
    this.monitoringInterval = setInterval(() => {
      this.performMonitoringChecks()
    }, 60000) // Check every minute

    console.log('Model monitoring started')
  }

  /**
   * Stop monitoring
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) {
      return
    }

    this.isMonitoring = false

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }

    console.log('Model monitoring stopped')
  }

  /**
   * Perform monitoring checks
   */
  private async performMonitoringChecks(): Promise<void> {
    for (const [key, deployment] of this.registry.deployments) {
      try {
        // Check for data drift
        if (this.monitoringConfig.driftDetection.enabled) {
          await this.checkDataDrift(deployment)
        }

        // Check performance degradation
        await this.checkPerformanceDegradation(deployment)

        // Check data quality
        await this.checkDataQuality(deployment)
      } catch (error) {
        console.error(`Monitoring error for ${key}:`, error)
        this.createAlert({
          severity: 'high',
          message: `Monitoring failed for ${deployment.modelId}`,
          details: error,
        })
      }
    }
  }

  /**
   * Check for data drift
   */
  private async checkDataDrift(deployment: DeploymentInfo): Promise<void> {
    const key = `${deployment.modelId}-${deployment.version}`
    const data = this.monitoringData.get(key)

    if (!data || data.features.length < this.monitoringConfig.driftDetection.windowSize) {
      return
    }

    const driftReport: ModelDriftReport = {
      timestamp: new Date(),
      modelId: deployment.modelId,
      version: deployment.version,
      driftDetected: false,
      driftScore: 0,
      affectedFeatures: [],
      recommendations: [],
    }

    // Check each drift detection method
    for (const method of this.monitoringConfig.driftDetection.methods) {
      const driftScore = this.calculateDriftScore(data, method)

      if (driftScore > this.monitoringConfig.driftDetection.threshold) {
        driftReport.driftDetected = true
        driftReport.driftScore = Math.max(driftReport.driftScore, driftScore)
        driftReport.affectedFeatures.push(...(method.features || []))
      }
    }

    if (driftReport.driftDetected) {
      driftReport.recommendations = this.generateDriftRecommendations(driftReport)
      this.handleDriftDetection(driftReport)
    }

    // Store drift history
    data.driftHistory.push(driftReport)
  }

  /**
   * Calculate drift score
   */
  private calculateDriftScore(data: MonitoringData, method: DriftDetectionMethod): number {
    switch (method.type) {
      case 'kl_divergence':
        return this.calculateKLDivergence(data)
      case 'ks_test':
        return this.calculateKSStatistic(data)
      case 'chi_square':
        return this.calculateChiSquareStatistic(data)
      case 'psi':
        return this.calculatePSI(data)
      case 'wasserstein':
        return this.calculateWassersteinDistance(data)
      default:
        return 0
    }
  }

  /**
   * Calculate KL Divergence
   */
  private calculateKLDivergence(data: MonitoringData): number {
    // Simplified KL divergence calculation
    const recentWindow = data.features.slice(-100)
    const baselineWindow = data.features.slice(0, 100)

    if (recentWindow.length === 0 || baselineWindow.length === 0) {
      return 0
    }

    // Calculate distributions
    const recentDist = this.calculateDistribution(recentWindow)
    const baselineDist = this.calculateDistribution(baselineWindow)

    let klDiv = 0
    for (const [key, p] of recentDist) {
      const q = baselineDist.get(key) || 0.0001
      if (p > 0) {
        klDiv += p * Math.log(p / q)
      }
    }

    return klDiv
  }

  /**
   * Calculate KS Statistic
   */
  private calculateKSStatistic(data: MonitoringData): number {
    // Kolmogorov-Smirnov test statistic
    const recent = data.features.slice(-100).sort((a, b) => a - b)
    const baseline = data.features.slice(0, 100).sort((a, b) => a - b)

    let maxDiff = 0
    let i = 0,
      j = 0

    while (i < recent.length && j < baseline.length) {
      const cdf1 = (i + 1) / recent.length
      const cdf2 = (j + 1) / baseline.length
      maxDiff = Math.max(maxDiff, Math.abs(cdf1 - cdf2))

      if (recent[i] < baseline[j]) {
        i++
      } else {
        j++
      }
    }

    return maxDiff
  }

  /**
   * Calculate Chi-Square Statistic
   */
  private calculateChiSquareStatistic(data: MonitoringData): number {
    const recent = data.features.slice(-100)
    const baseline = data.features.slice(0, 100)

    // Create bins
    const bins = 10
    const min = Math.min(...recent, ...baseline)
    const max = Math.max(...recent, ...baseline)
    const binWidth = (max - min) / bins

    const recentHist = new Array(bins).fill(0)
    const baselineHist = new Array(bins).fill(0)

    recent.forEach((val) => {
      const bin = Math.min(Math.floor((val - min) / binWidth), bins - 1)
      recentHist[bin]++
    })

    baseline.forEach((val) => {
      const bin = Math.min(Math.floor((val - min) / binWidth), bins - 1)
      baselineHist[bin]++
    })

    let chiSquare = 0
    for (let i = 0; i < bins; i++) {
      const expected = baselineHist[i] || 0.0001
      chiSquare += Math.pow(recentHist[i] - expected, 2) / expected
    }

    return chiSquare
  }

  /**
   * Calculate PSI (Population Stability Index)
   */
  private calculatePSI(data: MonitoringData): number {
    const recent = data.features.slice(-100)
    const baseline = data.features.slice(0, 100)

    // Create bins
    const bins = 10
    const recentDist = this.calculateBinnedDistribution(recent, bins)
    const baselineDist = this.calculateBinnedDistribution(baseline, bins)

    let psi = 0
    for (let i = 0; i < bins; i++) {
      const actual = recentDist[i] || 0.0001
      const expected = baselineDist[i] || 0.0001
      psi += (actual - expected) * Math.log(actual / expected)
    }

    return psi
  }

  /**
   * Calculate Wasserstein Distance
   */
  private calculateWassersteinDistance(data: MonitoringData): number {
    const recent = data.features.slice(-100).sort((a, b) => a - b)
    const baseline = data.features.slice(0, 100).sort((a, b) => a - b)

    let distance = 0
    const n = Math.min(recent.length, baseline.length)

    for (let i = 0; i < n; i++) {
      distance += Math.abs(recent[i] - baseline[i])
    }

    return distance / n
  }

  /**
   * Calculate distribution
   */
  private calculateDistribution(data: any[]): Map<string, number> {
    const dist = new Map<string, number>()
    const total = data.length

    for (const val of data) {
      const key = String(val)
      dist.set(key, (dist.get(key) || 0) + 1)
    }

    // Normalize
    for (const [key, count] of dist) {
      dist.set(key, count / total)
    }

    return dist
  }

  /**
   * Calculate binned distribution
   */
  private calculateBinnedDistribution(data: number[], bins: number): number[] {
    const min = Math.min(...data)
    const max = Math.max(...data)
    const binWidth = (max - min) / bins
    const dist = new Array(bins).fill(0)

    for (const val of data) {
      const bin = Math.min(Math.floor((val - min) / binWidth), bins - 1)
      dist[bin]++
    }

    // Normalize
    const total = data.length
    return dist.map((count) => count / total)
  }

  /**
   * Generate drift recommendations
   */
  private generateDriftRecommendations(report: ModelDriftReport): string[] {
    const recommendations: string[] = []

    if (report.driftScore > 0.5) {
      recommendations.push('Consider retraining the model with recent data')
    }

    if (report.driftScore > 0.3) {
      recommendations.push('Increase monitoring frequency')
      recommendations.push('Investigate root cause of drift')
    }

    if (report.affectedFeatures.length > 0) {
      recommendations.push(`Focus on features: ${report.affectedFeatures.join(', ')}`)
    }

    recommendations.push('Review data collection and preprocessing pipeline')

    return recommendations
  }

  /**
   * Handle drift detection
   */
  private handleDriftDetection(report: ModelDriftReport): void {
    // Create alert
    this.createAlert({
      severity: report.driftScore > 0.5 ? 'high' : 'medium',
      message: `Data drift detected for model ${report.modelId}`,
      details: report,
    })

    // Log drift event
    console.log('Data drift detected:', report)

    // Trigger automated actions if configured
    if (report.driftScore > 0.7) {
      this.triggerModelRetraining(report.modelId)
    }
  }

  /**
   * Check performance degradation
   */
  private async checkPerformanceDegradation(deployment: DeploymentInfo): Promise<void> {
    const key = `${deployment.modelId}-${deployment.version}`
    const data = this.monitoringData.get(key)

    if (!data || data.predictions.length === 0) {
      return
    }

    // Calculate current metrics
    const currentMetrics = this.calculateCurrentMetrics(data)

    // Compare with baseline
    const baselineMetrics = this.monitoringConfig.performanceMonitoring.baselineMetrics
    const degradation = new Map<string, number>()

    let alertTriggered = false
    for (const [metric, baseline] of baselineMetrics) {
      const current = currentMetrics[metric as keyof ModelPerformanceMetrics] as number
      if (current !== undefined) {
        const degradationPercent = ((baseline - current) / baseline) * 100
        degradation.set(metric, degradationPercent)

        if (degradationPercent > this.monitoringConfig.performanceMonitoring.degradationThreshold) {
          alertTriggered = true
        }
      }
    }

    const report: PerformanceDegradationReport = {
      timestamp: new Date(),
      modelId: deployment.modelId,
      version: deployment.version,
      currentMetrics,
      baselineMetrics: Object.fromEntries(baselineMetrics) as ModelPerformanceMetrics,
      degradation,
      alert: alertTriggered,
    }

    if (alertTriggered) {
      this.handlePerformanceDegradation(report)
    }

    // Store performance history
    data.performanceHistory.push(report)
  }

  /**
   * Calculate current metrics
   */
  private calculateCurrentMetrics(data: MonitoringData): ModelPerformanceMetrics {
    const recentPredictions = data.predictions.slice(-100)
    const recentActuals = data.actuals.slice(-100)

    if (recentPredictions.length === 0 || recentActuals.length === 0) {
      return {}
    }

    // Binary classification metrics
    const tp = recentPredictions.filter((pred, i) => pred === 1 && recentActuals[i] === 1).length
    const tn = recentPredictions.filter((pred, i) => pred === 0 && recentActuals[i] === 0).length
    const fp = recentPredictions.filter((pred, i) => pred === 1 && recentActuals[i] === 0).length
    const fn = recentPredictions.filter((pred, i) => pred === 0 && recentActuals[i] === 1).length

    const accuracy = (tp + tn) / (tp + tn + fp + fn)
    const precision = tp / (tp + fp) || 0
    const recall = tp / (tp + fn) || 0
    const f1Score = (2 * (precision * recall)) / (precision + recall) || 0

    // Regression metrics
    const mse =
      recentPredictions.reduce((sum, pred, i) => sum + Math.pow(pred - recentActuals[i], 2), 0) /
      recentPredictions.length
    const rmse = Math.sqrt(mse)
    const mae =
      recentPredictions.reduce((sum, pred, i) => sum + Math.abs(pred - recentActuals[i]), 0) /
      recentPredictions.length

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      rmse,
      mae,
    }
  }

  /**
   * Handle performance degradation
   */
  private handlePerformanceDegradation(report: PerformanceDegradationReport): void {
    // Create alert
    const maxDegradation = Math.max(...report.degradation.values())
    this.createAlert({
      severity: maxDegradation > 20 ? 'critical' : 'high',
      message: `Performance degradation detected for model ${report.modelId}`,
      details: report,
    })

    // Log event
    console.log('Performance degradation detected:', report)

    // Trigger automated actions
    if (maxDegradation > 30) {
      this.rollbackModel(report.modelId)
    }
  }

  /**
   * Check data quality
   */
  private async checkDataQuality(deployment: DeploymentInfo): Promise<void> {
    const key = `${deployment.modelId}-${deployment.version}`
    const data = this.monitoringData.get(key)

    if (!data || data.features.length === 0) {
      return
    }

    for (const check of this.monitoringConfig.dataQualityMonitoring.checks) {
      const issue = this.performDataQualityCheck(data, check)

      if (issue) {
        this.createAlert({
          severity: 'medium',
          message: `Data quality issue detected for model ${deployment.modelId}`,
          details: issue,
        })
      }
    }
  }

  /**
   * Perform data quality check
   */
  private performDataQualityCheck(data: MonitoringData, check: DataQualityCheck): any {
    switch (check.type) {
      case 'schema':
        return this.checkSchemaCompliance(data, check.config)
      case 'distribution':
        return this.checkDistributionAnomaly(data, check.config)
      case 'missing':
        return this.checkMissingValues(data, check.config)
      case 'outlier':
        return this.checkOutliers(data, check.config)
      default:
        return null
    }
  }

  /**
   * Check schema compliance
   */
  private checkSchemaCompliance(data: MonitoringData, config: any): any {
    // Schema validation logic
    return null
  }

  /**
   * Check distribution anomaly
   */
  private checkDistributionAnomaly(data: MonitoringData, config: any): any {
    // Distribution anomaly detection logic
    return null
  }

  /**
   * Check missing values
   */
  private checkMissingValues(data: MonitoringData, config: any): any {
    const missingCount = data.features.filter((f) => f === null || f === undefined).length
    const missingRate = missingCount / data.features.length

    if (missingRate > (config.threshold || 0.05)) {
      return {
        type: 'missing_values',
        rate: missingRate,
        count: missingCount,
      }
    }

    return null
  }

  /**
   * Check outliers
   */
  private checkOutliers(data: MonitoringData, config: any): any {
    const recent = data.features.slice(-100)
    const mean = recent.reduce((sum, val) => sum + val, 0) / recent.length
    const std = Math.sqrt(
      recent.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recent.length
    )

    const outliers = recent.filter((val) => Math.abs(val - mean) > 3 * std)
    const outlierRate = outliers.length / recent.length

    if (outlierRate > (config.threshold || 0.01)) {
      return {
        type: 'outliers',
        rate: outlierRate,
        count: outliers.length,
      }
    }

    return null
  }

  /**
   * Create alert
   */
  private createAlert(alert: Alert): void {
    this.alerts.push(alert)

    // Send alert through configured channels
    for (const channel of this.monitoringConfig.alerting.channels) {
      this.sendAlert(alert, channel)
    }
  }

  /**
   * Send alert
   */
  private sendAlert(alert: Alert, channel: AlertChannel): void {
    console.log(`Sending alert via ${channel.type}:`, alert)
    // Implementation for different alert channels
  }

  /**
   * Trigger model retraining
   */
  private triggerModelRetraining(modelId: string): void {
    console.log(`Triggering retraining for model ${modelId}`)
    // Implementation for automated retraining
  }

  /**
   * Rollback model
   */
  private rollbackModel(modelId: string): void {
    console.log(`Rolling back model ${modelId}`)
    // Implementation for model rollback
  }

  /**
   * Log prediction
   */
  public logPrediction(
    modelId: string,
    version: string,
    prediction: any,
    features: any[],
    actual?: any
  ): void {
    const key = `${modelId}-${version}`
    const data = this.monitoringData.get(key)

    if (data) {
      data.predictions.push(prediction)
      data.features.push(...features)
      data.timestamps.push(new Date())

      if (actual !== undefined) {
        data.actuals.push(actual)
      }
    }
  }

  /**
   * Get model metrics
   */
  public getModelMetrics(modelId: string, version: string): ModelPerformanceMetrics | null {
    const modelVersion = this.registry.versions.get(modelId)?.find((v) => v.version === version)
    return modelVersion?.metrics || null
  }

  /**
   * Get drift reports
   */
  public getDriftReports(modelId: string, version: string): ModelDriftReport[] {
    const key = `${modelId}-${version}`
    const data = this.monitoringData.get(key)
    return data?.driftHistory || []
  }

  /**
   * Get performance history
   */
  public getPerformanceHistory(modelId: string, version: string): PerformanceDegradationReport[] {
    const key = `${modelId}-${version}`
    const data = this.monitoringData.get(key)
    return data?.performanceHistory || []
  }

  /**
   * Get all alerts
   */
  public getAlerts(): Alert[] {
    return [...this.alerts]
  }

  /**
   * Clear alerts
   */
  public clearAlerts(): void {
    this.alerts = []
  }
}

// Supporting interfaces
interface MonitoringData {
  predictions: any[]
  actuals: any[]
  features: any[]
  timestamps: Date[]
  performanceHistory: PerformanceDegradationReport[]
  driftHistory: ModelDriftReport[]
}

interface Alert {
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  details: any
}

export default ModelMonitoringService
