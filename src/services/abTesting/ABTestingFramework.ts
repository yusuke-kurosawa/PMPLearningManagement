/**
 * A/B Testing Framework for Learning Effectiveness Measurement
 * Provides comprehensive experiment management with statistical rigor
 */

import { v4 as uuidv4 } from 'uuid'

export interface Experiment {
  id: string
  name: string
  description: string
  hypothesis: string
  startDate: Date
  endDate?: Date
  status: 'draft' | 'running' | 'paused' | 'completed'
  variants: Variant[]
  metrics: MetricDefinition[]
  allocation: AllocationStrategy
  sampleSize: SampleSizeCalculation
  results?: ExperimentResults
  config: ExperimentConfig
}

export interface Variant {
  id: string
  name: string
  description: string
  allocation: number // percentage 0-100
  features: FeatureFlag[]
  userCount?: number
}

export interface FeatureFlag {
  key: string
  value: any
  type: 'boolean' | 'string' | 'number' | 'json'
}

export interface MetricDefinition {
  id: string
  name: string
  type: 'primary' | 'secondary' | 'guardrail'
  calculationType: 'mean' | 'proportion' | 'percentile' | 'count'
  minimumDetectableEffect: number
  significance: number // alpha level
  power: number // 1 - beta
}

export interface AllocationStrategy {
  type: 'random' | 'stratified' | 'sequential' | 'bayesian'
  stratificationCriteria?: string[]
  seed?: number
}

export interface SampleSizeCalculation {
  requiredSampleSize: number
  currentSampleSize: number
  confidence: number
  power: number
  minimumDetectableEffect: number
  variance?: number
}

export interface ExperimentResults {
  variants: VariantResults[]
  statisticalTests: StatisticalTest[]
  confidenceIntervals: ConfidenceInterval[]
  pValue: number
  effectSize: EffectSize
  recommendations: string[]
  winner?: string
}

export interface VariantResults {
  variantId: string
  metrics: MetricResult[]
  sampleSize: number
  conversionRate?: number
}

export interface MetricResult {
  metricId: string
  value: number
  standardError: number
  confidence: number
}

export interface StatisticalTest {
  type: 'ttest' | 'chi-square' | 'mann-whitney' | 'anova' | 'bayesian'
  statistic: number
  pValue: number
  degreesOfFreedom?: number
}

export interface ConfidenceInterval {
  lower: number
  upper: number
  confidence: number
}

export interface EffectSize {
  cohensD?: number
  relativeImprovement: number
  absoluteImprovement: number
}

export interface ExperimentConfig {
  multipleTestingCorrection: 'bonferroni' | 'fdr' | 'none'
  earlyStoppingRules?: EarlyStoppingRule[]
  minimumRuntime: number // days
  maximumRuntime: number // days
  dataQualityChecks: boolean
}

export interface EarlyStoppingRule {
  type: 'futility' | 'efficacy' | 'harm'
  threshold: number
  checkFrequency: number // days
}

export class ABTestingFramework {
  private experiments: Map<string, Experiment> = new Map()
  private userAssignments: Map<string, Map<string, string>> = new Map() // userId -> experimentId -> variantId

  /**
   * Create a new experiment
   */
  createExperiment(params: Omit<Experiment, 'id' | 'status'>): Experiment {
    const experiment: Experiment = {
      ...params,
      id: uuidv4(),
      status: 'draft',
    }

    // Calculate required sample size
    experiment.sampleSize = this.calculateSampleSize(
      experiment.metrics[0], // Primary metric
      experiment.variants.length
    )

    this.experiments.set(experiment.id, experiment)
    return experiment
  }

  /**
   * Calculate required sample size for experiment
   */
  calculateSampleSize(metric: MetricDefinition, numVariants: number): SampleSizeCalculation {
    const { minimumDetectableEffect, significance, power } = metric

    // For proportion metrics (e.g., conversion rate)
    const p = 0.5 // Conservative estimate
    const q = 1 - p

    // Z-scores
    const zAlpha = this.getZScore(significance / (numVariants - 1)) // Bonferroni correction
    const zBeta = this.getZScore(1 - power)

    // Sample size per variant
    const n = Math.ceil(
      (2 * p * q * Math.pow(zAlpha + zBeta, 2)) / Math.pow(minimumDetectableEffect, 2)
    )

    return {
      requiredSampleSize: n * numVariants,
      currentSampleSize: 0,
      confidence: 1 - significance,
      power,
      minimumDetectableEffect,
      variance: p * q,
    }
  }

  /**
   * Get Z-score for given probability
   */
  private getZScore(p: number): number {
    // Approximate inverse normal CDF
    const a = [2.50662823884, -18.61500062529, 41.39119773534, -25.44106049637]
    const b = [-8.4735109309, 23.08336743743, -21.06224101826, 3.13082909833]
    const c = [
      0.3374754822726147, 0.9761690190917186, 0.1607979714918209, 0.0276438810333863,
      0.0038405729373609, 0.0003951896511919, 0.0000321767881768, 0.0000002888167364,
      0.0000003960315187,
    ]

    const y = p - 0.5
    if (Math.abs(y) < 0.42) {
      const r = y * y
      return (
        (y * (((a[3] * r + a[2]) * r + a[1]) * r + a[0])) /
        ((((b[3] * r + b[2]) * r + b[1]) * r + b[0]) * r + 1)
      )
    } else {
      const r = p < 0.5 ? p : 1 - p
      const s = Math.sqrt(-Math.log(r))
      let t = c[0]
      for (let i = 1; i < 9; i++) {
        t = t * s + c[i]
      }
      return p < 0.5 ? -t : t
    }
  }

  /**
   * Assign user to experiment variant
   */
  assignUserToVariant(userId: string, experimentId: string): string | null {
    const experiment = this.experiments.get(experimentId)
    if (!experiment || experiment.status !== 'running') {
      return null
    }

    // Check if user already assigned
    const userExperiments = this.userAssignments.get(userId) || new Map()
    if (userExperiments.has(experimentId)) {
      return userExperiments.get(experimentId)!
    }

    // Perform assignment based on allocation strategy
    const variantId = this.performAllocation(userId, experiment)

    userExperiments.set(experimentId, variantId)
    this.userAssignments.set(userId, userExperiments)

    return variantId
  }

  /**
   * Perform variant allocation based on strategy
   */
  private performAllocation(userId: string, experiment: Experiment): string {
    const { allocation, variants } = experiment

    switch (allocation.type) {
      case 'random':
        return this.randomAllocation(userId, variants, allocation.seed)
      case 'stratified':
        return this.stratifiedAllocation(userId, variants, allocation.stratificationCriteria)
      case 'sequential':
        return this.sequentialAllocation(variants)
      case 'bayesian':
        return this.bayesianAllocation(variants)
      default:
        return this.randomAllocation(userId, variants)
    }
  }

  /**
   * Random allocation with consistent hashing
   */
  private randomAllocation(userId: string, variants: Variant[], seed?: number): string {
    const hash = this.hashUserId(userId, seed)
    const bucket = hash % 100

    let cumulative = 0
    for (const variant of variants) {
      cumulative += variant.allocation
      if (bucket < cumulative) {
        return variant.id
      }
    }

    return variants[variants.length - 1].id
  }

  /**
   * Hash user ID for consistent assignment
   */
  private hashUserId(userId: string, seed: number = 0): number {
    let hash = seed
    for (let i = 0; i < userId.length; i++) {
      hash = (hash << 5) - hash + userId.charCodeAt(i)
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  /**
   * Stratified allocation based on user characteristics
   */
  private stratifiedAllocation(userId: string, variants: Variant[], criteria?: string[]): string {
    // Implementation would consider user characteristics
    // For now, fallback to random
    return this.randomAllocation(userId, variants)
  }

  /**
   * Sequential allocation for deterministic assignment
   */
  private sequentialAllocation(variants: Variant[]): string {
    // Round-robin assignment
    const totalAssignments = variants.reduce((sum, v) => sum + (v.userCount || 0), 0)
    const index = totalAssignments % variants.length
    return variants[index].id
  }

  /**
   * Bayesian allocation with Thompson sampling
   */
  private bayesianAllocation(variants: Variant[]): string {
    // Thompson sampling for multi-armed bandit
    const samples = variants.map((variant) => {
      const successes = (variant.userCount || 0) * 0.1 // Example conversion
      const failures = (variant.userCount || 1) - successes
      return this.sampleBeta(successes + 1, failures + 1)
    })

    const maxIndex = samples.indexOf(Math.max(...samples))
    return variants[maxIndex].id
  }

  /**
   * Sample from Beta distribution
   */
  private sampleBeta(alpha: number, beta: number): number {
    const x = this.sampleGamma(alpha)
    const y = this.sampleGamma(beta)
    return x / (x + y)
  }

  /**
   * Sample from Gamma distribution
   */
  private sampleGamma(shape: number): number {
    // Marsaglia and Tsang method
    const d = shape - 1 / 3
    const c = 1 / Math.sqrt(9 * d)

    while (true) {
      const z = this.normalRandom()
      const v = Math.pow(1 + c * z, 3)
      const u = Math.random()

      if (u < 1 - 0.0331 * Math.pow(z, 4)) {
        return d * v
      }

      if (Math.log(u) < 0.5 * z * z + d * (1 - v + Math.log(v))) {
        return d * v
      }
    }
  }

  /**
   * Generate normal random variable
   */
  private normalRandom(): number {
    const u1 = Math.random()
    const u2 = Math.random()
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  }

  /**
   * Analyze experiment results
   */
  analyzeExperiment(experimentId: string, data: any[]): ExperimentResults {
    const experiment = this.experiments.get(experimentId)
    if (!experiment) {
      throw new Error('Experiment not found')
    }

    // Aggregate data by variant
    const variantData = this.aggregateByVariant(data, experiment)

    // Perform statistical tests
    const statisticalTests = this.performStatisticalTests(variantData, experiment)

    // Calculate confidence intervals
    const confidenceIntervals = this.calculateConfidenceIntervals(variantData, experiment)

    // Calculate effect size
    const effectSize = this.calculateEffectSize(variantData)

    // Apply multiple testing correction
    const correctedPValue = this.applyMultipleTestingCorrection(
      statisticalTests[0].pValue,
      experiment.config.multipleTestingCorrection,
      experiment.metrics.length
    )

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      variantData,
      statisticalTests,
      effectSize,
      experiment
    )

    return {
      variants: variantData,
      statisticalTests,
      confidenceIntervals,
      pValue: correctedPValue,
      effectSize,
      recommendations,
      winner: this.determineWinner(variantData, correctedPValue, experiment),
    }
  }

  /**
   * Aggregate data by variant
   */
  private aggregateByVariant(data: any[], experiment: Experiment): VariantResults[] {
    const variantMap = new Map<string, any[]>()

    for (const record of data) {
      const variantId = record.variantId
      if (!variantMap.has(variantId)) {
        variantMap.set(variantId, [])
      }
      variantMap.get(variantId)!.push(record)
    }

    return Array.from(variantMap.entries()).map(([variantId, records]) => {
      const metrics = experiment.metrics.map((metric) => {
        const values = records.map((r) => r[metric.id])
        const mean = values.reduce((a, b) => a + b, 0) / values.length
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
        const standardError = Math.sqrt(variance / values.length)

        return {
          metricId: metric.id,
          value: mean,
          standardError,
          confidence: metric.significance,
        }
      })

      return {
        variantId,
        metrics,
        sampleSize: records.length,
        conversionRate: records.filter((r) => r.converted).length / records.length,
      }
    })
  }

  /**
   * Perform statistical tests
   */
  private performStatisticalTests(
    variantData: VariantResults[],
    experiment: Experiment
  ): StatisticalTest[] {
    const tests: StatisticalTest[] = []

    // T-test for continuous metrics
    if (variantData.length === 2) {
      const tTest = this.performTTest(variantData[0], variantData[1])
      tests.push(tTest)
    }

    // Chi-square for categorical metrics
    const chiSquare = this.performChiSquare(variantData)
    tests.push(chiSquare)

    // Bayesian test
    const bayesian = this.performBayesianTest(variantData)
    tests.push(bayesian)

    return tests
  }

  /**
   * Perform t-test
   */
  private performTTest(control: VariantResults, treatment: VariantResults): StatisticalTest {
    const metric = control.metrics[0] // Primary metric
    const controlMean = metric.value
    const treatmentMean = treatment.metrics[0].value
    const controlSE = metric.standardError
    const treatmentSE = treatment.metrics[0].standardError

    const pooledSE = Math.sqrt(
      Math.pow(controlSE, 2) / control.sampleSize + Math.pow(treatmentSE, 2) / treatment.sampleSize
    )

    const tStatistic = (treatmentMean - controlMean) / pooledSE
    const df = control.sampleSize + treatment.sampleSize - 2

    // Approximate p-value using normal distribution
    const pValue = 2 * (1 - this.normalCDF(Math.abs(tStatistic)))

    return {
      type: 'ttest',
      statistic: tStatistic,
      pValue,
      degreesOfFreedom: df,
    }
  }

  /**
   * Normal CDF approximation
   */
  private normalCDF(x: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(x))
    const d = 0.3989423 * Math.exp((-x * x) / 2)
    const p =
      d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
    return x > 0 ? 1 - p : p
  }

  /**
   * Perform chi-square test
   */
  private performChiSquare(variantData: VariantResults[]): StatisticalTest {
    const observed = variantData.map((v) => v.conversionRate! * v.sampleSize)
    const total = observed.reduce((a, b) => a + b, 0)
    const expected = variantData.map((v) => total / variantData.length)

    const chiSquare = observed.reduce((sum, obs, i) => {
      return sum + Math.pow(obs - expected[i], 2) / expected[i]
    }, 0)

    const df = variantData.length - 1
    const pValue = this.chiSquarePValue(chiSquare, df)

    return {
      type: 'chi-square',
      statistic: chiSquare,
      pValue,
      degreesOfFreedom: df,
    }
  }

  /**
   * Chi-square p-value approximation
   */
  private chiSquarePValue(chiSquare: number, df: number): number {
    // Approximation using Wilson-Hilferty transformation
    const z = Math.pow(chiSquare / df, 1 / 3) - (1 - 2 / (9 * df)) / Math.sqrt(2 / (9 * df))
    return 1 - this.normalCDF(z)
  }

  /**
   * Perform Bayesian test
   */
  private performBayesianTest(variantData: VariantResults[]): StatisticalTest {
    // Calculate posterior probabilities
    const posteriors = variantData.map((v) => {
      const successes = (v.conversionRate || 0) * v.sampleSize
      const failures = v.sampleSize - successes
      return { alpha: successes + 1, beta: failures + 1 }
    })

    // Monte Carlo simulation for probability of being best
    const samples = 10000
    const wins = new Array(variantData.length).fill(0)

    for (let i = 0; i < samples; i++) {
      const values = posteriors.map((p) => this.sampleBeta(p.alpha, p.beta))
      const maxIndex = values.indexOf(Math.max(...values))
      wins[maxIndex]++
    }

    const probabilities = wins.map((w) => w / samples)
    const bestVariant = probabilities.indexOf(Math.max(...probabilities))

    return {
      type: 'bayesian',
      statistic: probabilities[bestVariant],
      pValue: 1 - probabilities[bestVariant], // Probability of not being best
    }
  }

  /**
   * Calculate confidence intervals
   */
  private calculateConfidenceIntervals(
    variantData: VariantResults[],
    experiment: Experiment
  ): ConfidenceInterval[] {
    return variantData.map((variant) => {
      const metric = variant.metrics[0] // Primary metric
      const zScore = this.getZScore((1 + (1 - metric.confidence)) / 2)
      const margin = zScore * metric.standardError

      return {
        lower: metric.value - margin,
        upper: metric.value + margin,
        confidence: 1 - metric.confidence,
      }
    })
  }

  /**
   * Calculate effect size
   */
  private calculateEffectSize(variantData: VariantResults[]): EffectSize {
    if (variantData.length < 2) {
      return { relativeImprovement: 0, absoluteImprovement: 0 }
    }

    const control = variantData[0]
    const treatment = variantData[1]
    const controlMean = control.metrics[0].value
    const treatmentMean = treatment.metrics[0].value

    // Cohen's d
    const pooledSD = Math.sqrt(
      (Math.pow(control.metrics[0].standardError, 2) * control.sampleSize +
        Math.pow(treatment.metrics[0].standardError, 2) * treatment.sampleSize) /
        (control.sampleSize + treatment.sampleSize)
    )
    const cohensD = (treatmentMean - controlMean) / pooledSD

    return {
      cohensD,
      relativeImprovement: (treatmentMean - controlMean) / controlMean,
      absoluteImprovement: treatmentMean - controlMean,
    }
  }

  /**
   * Apply multiple testing correction
   */
  private applyMultipleTestingCorrection(pValue: number, method: string, numTests: number): number {
    switch (method) {
      case 'bonferroni':
        return Math.min(pValue * numTests, 1)
      case 'fdr':
        // Benjamini-Hochberg procedure
        return Math.min((pValue * numTests) / 1, 1) // Simplified
      default:
        return pValue
    }
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    variantData: VariantResults[],
    tests: StatisticalTest[],
    effectSize: EffectSize,
    experiment: Experiment
  ): string[] {
    const recommendations: string[] = []

    // Check sample size
    if (
      variantData.some(
        (v) => v.sampleSize < experiment.sampleSize.requiredSampleSize / experiment.variants.length
      )
    ) {
      recommendations.push('Continue running experiment to reach required sample size')
    }

    // Check statistical significance
    if (tests[0].pValue < experiment.metrics[0].significance) {
      recommendations.push('Results are statistically significant')

      // Check practical significance
      if (
        Math.abs(effectSize.relativeImprovement) > experiment.metrics[0].minimumDetectableEffect
      ) {
        recommendations.push('Effect size is practically significant')
      } else {
        recommendations.push('Effect size may not be practically significant')
      }
    } else {
      recommendations.push('Results are not yet statistically significant')
    }

    // Check for early stopping
    if (this.checkEarlyStoppingRules(variantData, experiment)) {
      recommendations.push('Consider early stopping based on configured rules')
    }

    return recommendations
  }

  /**
   * Check early stopping rules
   */
  private checkEarlyStoppingRules(variantData: VariantResults[], experiment: Experiment): boolean {
    if (!experiment.config.earlyStoppingRules) {
      return false
    }

    for (const rule of experiment.config.earlyStoppingRules) {
      switch (rule.type) {
        case 'futility':
          // Check if effect is too small to detect
          const effect = Math.abs(variantData[1].metrics[0].value - variantData[0].metrics[0].value)
          if (effect < rule.threshold) {
            return true
          }
          break
        case 'efficacy':
          // Check if effect is large enough
          if (effect > rule.threshold) {
            return true
          }
          break
        case 'harm':
          // Check if treatment is harmful
          if (variantData[1].metrics[0].value < variantData[0].metrics[0].value - rule.threshold) {
            return true
          }
          break
      }
    }

    return false
  }

  /**
   * Determine experiment winner
   */
  private determineWinner(
    variantData: VariantResults[],
    pValue: number,
    experiment: Experiment
  ): string | undefined {
    if (pValue >= experiment.metrics[0].significance) {
      return undefined // Not significant
    }

    // Find variant with best performance
    const primaryMetric = experiment.metrics[0]
    let bestVariant = variantData[0]
    let bestValue = bestVariant.metrics[0].value

    for (const variant of variantData.slice(1)) {
      const value = variant.metrics[0].value
      if (primaryMetric.calculationType === 'mean' && value > bestValue) {
        bestVariant = variant
        bestValue = value
      }
    }

    return bestVariant.variantId
  }

  /**
   * Get all experiments
   */
  getAllExperiments(): Experiment[] {
    return Array.from(this.experiments.values())
  }

  /**
   * Get experiment by ID
   */
  getExperiment(id: string): Experiment | undefined {
    return this.experiments.get(id)
  }

  /**
   * Update experiment status
   */
  updateExperimentStatus(id: string, status: Experiment['status']): void {
    const experiment = this.experiments.get(id)
    if (experiment) {
      experiment.status = status
      if (status === 'running') {
        experiment.startDate = new Date()
      } else if (status === 'completed') {
        experiment.endDate = new Date()
      }
    }
  }
}

export default ABTestingFramework
