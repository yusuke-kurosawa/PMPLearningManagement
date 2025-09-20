/**
 * Statistical Analysis Framework for Learning Analytics
 * Comprehensive statistical methods for rigorous data analysis
 */

export class StatisticalAnalysisFramework {
  /**
   * Descriptive Statistics
   */

  public calculateMean(data: number[]): number {
    if (data.length === 0) {
      return 0
    }
    return data.reduce((sum, val) => sum + val, 0) / data.length
  }

  public calculateMedian(data: number[]): number {
    if (data.length === 0) {
      return 0
    }
    const sorted = [...data].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
  }

  public calculateMode(data: number[]): number[] {
    const frequency: Map<number, number> = new Map()
    let maxFreq = 0

    for (const val of data) {
      const freq = (frequency.get(val) || 0) + 1
      frequency.set(val, freq)
      maxFreq = Math.max(maxFreq, freq)
    }

    return Array.from(frequency.entries())
      .filter(([_, freq]) => freq === maxFreq)
      .map(([val, _]) => val)
  }

  public calculateVariance(data: number[], sample: boolean = true): number {
    if (data.length === 0) {
      return 0
    }
    const mean = this.calculateMean(data)
    const squaredDiffs = data.map((val) => Math.pow(val - mean, 2))
    const divisor = sample ? data.length - 1 : data.length
    return divisor > 0 ? squaredDiffs.reduce((sum, val) => sum + val, 0) / divisor : 0
  }

  public calculateStandardDeviation(data: number[], sample: boolean = true): number {
    return Math.sqrt(this.calculateVariance(data, sample))
  }

  public calculateSkewness(data: number[]): number {
    if (data.length < 3) {
      return 0
    }
    const mean = this.calculateMean(data)
    const std = this.calculateStandardDeviation(data)
    if (std === 0) {
      return 0
    }

    const n = data.length
    const skew = data.reduce((sum, val) => sum + Math.pow((val - mean) / std, 3), 0)
    return (n / ((n - 1) * (n - 2))) * skew
  }

  public calculateKurtosis(data: number[]): number {
    if (data.length < 4) {
      return 0
    }
    const mean = this.calculateMean(data)
    const std = this.calculateStandardDeviation(data)
    if (std === 0) {
      return 0
    }

    const n = data.length
    const kurt = data.reduce((sum, val) => sum + Math.pow((val - mean) / std, 4), 0)
    return (
      ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * kurt -
      (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3))
    )
  }

  public calculateQuantiles(data: number[], quantiles: number[]): number[] {
    if (data.length === 0) {
      return quantiles.map(() => 0)
    }
    const sorted = [...data].sort((a, b) => a - b)

    return quantiles.map((q) => {
      const pos = q * (sorted.length - 1)
      const lower = Math.floor(pos)
      const upper = Math.ceil(pos)
      const weight = pos - lower
      return sorted[lower] * (1 - weight) + sorted[upper] * weight
    })
  }

  /**
   * Hypothesis Testing
   */

  public oneSampleTTest(data: number[], populationMean: number): HypothesisTestResult {
    const n = data.length
    if (n < 2) {
      throw new Error('Sample size must be at least 2')
    }

    const sampleMean = this.calculateMean(data)
    const sampleStd = this.calculateStandardDeviation(data, true)
    const standardError = sampleStd / Math.sqrt(n)
    const tStatistic = (sampleMean - populationMean) / standardError
    const df = n - 1
    const pValue = this.calculateTDistributionPValue(Math.abs(tStatistic), df) * 2 // Two-tailed

    return {
      statistic: tStatistic,
      pValue,
      degreesOfFreedom: df,
      confidenceInterval: this.calculateConfidenceInterval(sampleMean, standardError, df),
      reject: pValue < 0.05,
      testName: 'One-Sample t-test',
    }
  }

  public twoSampleTTest(
    data1: number[],
    data2: number[],
    equalVariance: boolean = false
  ): HypothesisTestResult {
    const n1 = data1.length
    const n2 = data2.length
    if (n1 < 2 || n2 < 2) {
      throw new Error('Both samples must have at least 2 observations')
    }

    const mean1 = this.calculateMean(data1)
    const mean2 = this.calculateMean(data2)
    const var1 = this.calculateVariance(data1, true)
    const var2 = this.calculateVariance(data2, true)

    let tStatistic: number
    let df: number
    let standardError: number

    if (equalVariance) {
      // Pooled variance
      const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2)
      standardError = Math.sqrt(pooledVar * (1 / n1 + 1 / n2))
      tStatistic = (mean1 - mean2) / standardError
      df = n1 + n2 - 2
    } else {
      // Welch's t-test
      standardError = Math.sqrt(var1 / n1 + var2 / n2)
      tStatistic = (mean1 - mean2) / standardError
      df =
        Math.pow(var1 / n1 + var2 / n2, 2) /
        (Math.pow(var1 / n1, 2) / (n1 - 1) + Math.pow(var2 / n2, 2) / (n2 - 1))
    }

    const pValue = this.calculateTDistributionPValue(Math.abs(tStatistic), df) * 2

    return {
      statistic: tStatistic,
      pValue,
      degreesOfFreedom: df,
      confidenceInterval: this.calculateConfidenceInterval(mean1 - mean2, standardError, df),
      reject: pValue < 0.05,
      testName: equalVariance ? 'Two-Sample t-test' : "Welch's t-test",
    }
  }

  public pairedTTest(data1: number[], data2: number[]): HypothesisTestResult {
    if (data1.length !== data2.length) {
      throw new Error('Paired samples must have equal length')
    }

    const differences = data1.map((val, i) => val - data2[i])
    return this.oneSampleTTest(differences, 0)
  }

  public chiSquareTest(observed: number[][], expected?: number[][]): HypothesisTestResult {
    const rows = observed.length
    const cols = observed[0].length

    // Calculate expected frequencies if not provided
    if (!expected) {
      expected = this.calculateExpectedFrequencies(observed)
    }

    let chiSquare = 0
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const e = expected[i][j]
        if (e > 0) {
          chiSquare += Math.pow(observed[i][j] - e, 2) / e
        }
      }
    }

    const df = (rows - 1) * (cols - 1)
    const pValue = this.calculateChiSquarePValue(chiSquare, df)

    return {
      statistic: chiSquare,
      pValue,
      degreesOfFreedom: df,
      reject: pValue < 0.05,
      testName: 'Chi-square test of independence',
    }
  }

  public anova(groups: number[][]): HypothesisTestResult {
    const k = groups.length // Number of groups
    if (k < 2) {
      throw new Error('ANOVA requires at least 2 groups')
    }

    const n = groups.reduce((sum, group) => sum + group.length, 0)
    const grandMean = this.calculateMean(groups.flat())

    // Between-group sum of squares
    let ssb = 0
    for (const group of groups) {
      const groupMean = this.calculateMean(group)
      ssb += group.length * Math.pow(groupMean - grandMean, 2)
    }

    // Within-group sum of squares
    let ssw = 0
    for (const group of groups) {
      const groupMean = this.calculateMean(group)
      for (const val of group) {
        ssw += Math.pow(val - groupMean, 2)
      }
    }

    const dfBetween = k - 1
    const dfWithin = n - k
    const msb = ssb / dfBetween
    const msw = ssw / dfWithin
    const fStatistic = msb / msw
    const pValue = this.calculateFDistributionPValue(fStatistic, dfBetween, dfWithin)

    return {
      statistic: fStatistic,
      pValue,
      degreesOfFreedom: dfBetween,
      degreesOfFreedom2: dfWithin,
      reject: pValue < 0.05,
      testName: 'One-way ANOVA',
    }
  }

  public mannWhitneyU(data1: number[], data2: number[]): HypothesisTestResult {
    const n1 = data1.length
    const n2 = data2.length

    // Combine and rank
    const combined = [
      ...data1.map((v) => ({ value: v, group: 1 })),
      ...data2.map((v) => ({ value: v, group: 2 })),
    ]
    combined.sort((a, b) => a.value - b.value)

    // Assign ranks
    const ranks = this.assignRanks(combined.map((item) => item.value))

    // Calculate U statistic
    let r1 = 0
    combined.forEach((item, i) => {
      if (item.group === 1) {
        r1 += ranks[i]
      }
    })

    const u1 = r1 - (n1 * (n1 + 1)) / 2
    const u2 = n1 * n2 - u1
    const uStatistic = Math.min(u1, u2)

    // Normal approximation for large samples
    const meanU = (n1 * n2) / 2
    const stdU = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12)
    const zStatistic = (uStatistic - meanU) / stdU
    const pValue = this.calculateNormalPValue(Math.abs(zStatistic)) * 2

    return {
      statistic: uStatistic,
      zStatistic,
      pValue,
      reject: pValue < 0.05,
      testName: 'Mann-Whitney U test',
    }
  }

  /**
   * Correlation and Regression
   */

  public pearsonCorrelation(x: number[], y: number[]): CorrelationResult {
    if (x.length !== y.length) {
      throw new Error('Arrays must have equal length')
    }
    const n = x.length
    if (n < 2) {
      throw new Error('Need at least 2 observations')
    }

    const meanX = this.calculateMean(x)
    const meanY = this.calculateMean(y)

    let covXY = 0
    let varX = 0
    let varY = 0

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX
      const dy = y[i] - meanY
      covXY += dx * dy
      varX += dx * dx
      varY += dy * dy
    }

    const r = covXY / Math.sqrt(varX * varY)

    // Test significance
    const t = r * Math.sqrt((n - 2) / (1 - r * r))
    const pValue = this.calculateTDistributionPValue(Math.abs(t), n - 2) * 2

    return {
      coefficient: r,
      pValue,
      confidenceInterval: this.calculateCorrelationCI(r, n),
      significant: pValue < 0.05,
    }
  }

  public spearmanCorrelation(x: number[], y: number[]): CorrelationResult {
    if (x.length !== y.length) {
      throw new Error('Arrays must have equal length')
    }

    const ranksX = this.assignRanks(x)
    const ranksY = this.assignRanks(y)

    return this.pearsonCorrelation(ranksX, ranksY)
  }

  public linearRegression(x: number[], y: number[]): RegressionResult {
    if (x.length !== y.length) {
      throw new Error('Arrays must have equal length')
    }
    const n = x.length
    if (n < 2) {
      throw new Error('Need at least 2 observations')
    }

    const meanX = this.calculateMean(x)
    const meanY = this.calculateMean(y)

    let ssXX = 0
    let ssXY = 0
    let ssYY = 0

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX
      const dy = y[i] - meanY
      ssXX += dx * dx
      ssXY += dx * dy
      ssYY += dy * dy
    }

    const slope = ssXY / ssXX
    const intercept = meanY - slope * meanX

    // Calculate R-squared
    const ssTotal = ssYY
    const ssResidual = ssYY - (ssXY * ssXY) / ssXX
    const rSquared = 1 - ssResidual / ssTotal

    // Calculate standard errors
    const residualStd = Math.sqrt(ssResidual / (n - 2))
    const slopeStdError = residualStd / Math.sqrt(ssXX)
    const interceptStdError = residualStd * Math.sqrt(1 / n + (meanX * meanX) / ssXX)

    // Test significance
    const tSlope = slope / slopeStdError
    const tIntercept = intercept / interceptStdError
    const pValueSlope = this.calculateTDistributionPValue(Math.abs(tSlope), n - 2) * 2
    const pValueIntercept = this.calculateTDistributionPValue(Math.abs(tIntercept), n - 2) * 2

    return {
      slope,
      intercept,
      rSquared,
      adjustedRSquared: 1 - ((1 - rSquared) * (n - 1)) / (n - 2),
      slopeStdError,
      interceptStdError,
      pValueSlope,
      pValueIntercept,
      residuals: x.map((xi, i) => y[i] - (slope * xi + intercept)),
    }
  }

  public multipleRegression(X: number[][], y: number[]): MultipleRegressionResult {
    const n = y.length
    const p = X[0].length
    if (n <= p) {
      throw new Error('Need more observations than predictors')
    }

    // Add intercept column
    const XWithIntercept = X.map((row) => [1, ...row])

    // Calculate coefficients using normal equation
    const XtX = this.matrixMultiply(this.matrixTranspose(XWithIntercept), XWithIntercept)
    const XtY = this.matrixVectorMultiply(this.matrixTranspose(XWithIntercept), y)
    const coefficients = this.solveLinearSystem(XtX, XtY)

    // Calculate predictions and residuals
    const predictions = XWithIntercept.map((row) =>
      row.reduce((sum, val, i) => sum + val * coefficients[i], 0)
    )
    const residuals = y.map((yi, i) => yi - predictions[i])

    // Calculate R-squared
    const meanY = this.calculateMean(y)
    const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0)
    const ssResidual = residuals.reduce((sum, r) => sum + r * r, 0)
    const rSquared = 1 - ssResidual / ssTotal
    const adjustedRSquared = 1 - ((1 - rSquared) * (n - 1)) / (n - p - 1)

    // Calculate standard errors
    const mse = ssResidual / (n - p - 1)
    const XtXInverse = this.matrixInverse(XtX)
    const standardErrors = XtXInverse.map((row, i) => Math.sqrt(mse * row[i]))

    // Calculate p-values
    const tStatistics = coefficients.map((coef, i) => coef / standardErrors[i])
    const pValues = tStatistics.map(
      (t) => this.calculateTDistributionPValue(Math.abs(t), n - p - 1) * 2
    )

    return {
      coefficients,
      standardErrors,
      tStatistics,
      pValues,
      rSquared,
      adjustedRSquared,
      fStatistic: rSquared / p / ((1 - rSquared) / (n - p - 1)),
      fPValue: this.calculateFDistributionPValue(
        rSquared / p / ((1 - rSquared) / (n - p - 1)),
        p,
        n - p - 1
      ),
      residuals,
      predictions,
    }
  }

  /**
   * Time Series Analysis
   */

  public autocorrelation(data: number[], lag: number): number {
    const n = data.length
    const mean = this.calculateMean(data)

    let numerator = 0
    let denominator = 0

    for (let i = 0; i < n - lag; i++) {
      numerator += (data[i] - mean) * (data[i + lag] - mean)
    }

    for (let i = 0; i < n; i++) {
      denominator += Math.pow(data[i] - mean, 2)
    }

    return numerator / denominator
  }

  public movingAverage(data: number[], window: number): number[] {
    const result: number[] = []

    for (let i = 0; i < data.length - window + 1; i++) {
      const windowData = data.slice(i, i + window)
      result.push(this.calculateMean(windowData))
    }

    return result
  }

  public exponentialSmoothing(data: number[], alpha: number): number[] {
    if (alpha < 0 || alpha > 1) {
      throw new Error('Alpha must be between 0 and 1')
    }

    const result: number[] = [data[0]]

    for (let i = 1; i < data.length; i++) {
      result.push(alpha * data[i] + (1 - alpha) * result[i - 1])
    }

    return result
  }

  public seasonalDecomposition(data: number[], period: number): SeasonalDecomposition {
    // Calculate trend using moving average
    const trend = this.movingAverage(data, period)

    // Calculate detrended data
    const detrended: number[] = []
    for (let i = 0; i < trend.length; i++) {
      detrended.push(data[i + Math.floor(period / 2)] - trend[i])
    }

    // Calculate seasonal component
    const seasonal: number[] = []
    for (let i = 0; i < period; i++) {
      const seasonalValues: number[] = []
      for (let j = i; j < detrended.length; j += period) {
        seasonalValues.push(detrended[j])
      }
      seasonal.push(this.calculateMean(seasonalValues))
    }

    // Extend seasonal to match data length
    const fullSeasonal: number[] = []
    for (let i = 0; i < data.length; i++) {
      fullSeasonal.push(seasonal[i % period])
    }

    // Calculate residual
    const residual: number[] = []
    for (let i = 0; i < data.length; i++) {
      const trendValue =
        i < Math.floor(period / 2) || i >= trend.length + Math.floor(period / 2)
          ? 0
          : trend[i - Math.floor(period / 2)]
      residual.push(data[i] - trendValue - fullSeasonal[i])
    }

    return {
      trend,
      seasonal: fullSeasonal,
      residual,
      period,
    }
  }

  /**
   * Bayesian Statistics
   */

  public bayesianABTest(
    successesA: number,
    trialsA: number,
    successesB: number,
    trialsB: number,
    priorAlpha: number = 1,
    priorBeta: number = 1
  ): BayesianTestResult {
    // Posterior parameters
    const alphaA = priorAlpha + successesA
    const betaA = priorBeta + trialsA - successesA
    const alphaB = priorAlpha + successesB
    const betaB = priorBeta + trialsB - successesB

    // Monte Carlo simulation
    const samples = 10000
    let countBBetterThanA = 0

    for (let i = 0; i < samples; i++) {
      const sampleA = this.sampleBeta(alphaA, betaA)
      const sampleB = this.sampleBeta(alphaB, betaB)
      if (sampleB > sampleA) {
        countBBetterThanA++
      }
    }

    const probabilityBBetter = countBBetterThanA / samples

    // Calculate expected loss
    const expectedLossA = this.calculateExpectedLoss(alphaA, betaA, alphaB, betaB)
    const expectedLossB = this.calculateExpectedLoss(alphaB, betaB, alphaA, betaA)

    return {
      probabilityABetter: 1 - probabilityBBetter,
      probabilityBBetter,
      expectedLossA,
      expectedLossB,
      posteriorA: { alpha: alphaA, beta: betaA },
      posteriorB: { alpha: alphaB, beta: betaB },
    }
  }

  /**
   * Helper Methods
   */

  private calculateExpectedFrequencies(observed: number[][]): number[][] {
    const rows = observed.length
    const cols = observed[0].length
    const total = observed.flat().reduce((sum, val) => sum + val, 0)

    const rowTotals = observed.map((row) => row.reduce((sum, val) => sum + val, 0))
    const colTotals: number[] = []
    for (let j = 0; j < cols; j++) {
      let colSum = 0
      for (let i = 0; i < rows; i++) {
        colSum += observed[i][j]
      }
      colTotals.push(colSum)
    }

    const expected: number[][] = []
    for (let i = 0; i < rows; i++) {
      expected[i] = []
      for (let j = 0; j < cols; j++) {
        expected[i][j] = (rowTotals[i] * colTotals[j]) / total
      }
    }

    return expected
  }

  private assignRanks(data: number[]): number[] {
    const indexed = data.map((val, i) => ({ value: val, index: i }))
    indexed.sort((a, b) => a.value - b.value)

    const ranks: number[] = new Array(data.length)
    let i = 0

    while (i < indexed.length) {
      const tiedValues = [indexed[i]]
      let j = i + 1

      while (j < indexed.length && indexed[j].value === indexed[i].value) {
        tiedValues.push(indexed[j])
        j++
      }

      const avgRank = (i + 1 + j) / 2
      for (const item of tiedValues) {
        ranks[item.index] = avgRank
      }

      i = j
    }

    return ranks
  }

  private calculateConfidenceInterval(
    mean: number,
    standardError: number,
    df: number,
    confidence: number = 0.95
  ): [number, number] {
    const tCritical = this.getTCriticalValue(df, 1 - confidence)
    const margin = tCritical * standardError
    return [mean - margin, mean + margin]
  }

  private calculateCorrelationCI(
    r: number,
    n: number,
    confidence: number = 0.95
  ): [number, number] {
    // Fisher transformation
    const z = 0.5 * Math.log((1 + r) / (1 - r))
    const se = 1 / Math.sqrt(n - 3)
    const zCritical = this.getZCriticalValue(1 - confidence)

    const zLower = z - zCritical * se
    const zUpper = z + zCritical * se

    // Back transformation
    const lower = (Math.exp(2 * zLower) - 1) / (Math.exp(2 * zLower) + 1)
    const upper = (Math.exp(2 * zUpper) - 1) / (Math.exp(2 * zUpper) + 1)

    return [lower, upper]
  }

  private calculateTDistributionPValue(t: number, df: number): number {
    // Approximation using normal distribution for large df
    if (df > 30) {
      return this.calculateNormalPValue(t)
    }

    // For small df, use approximation
    const x = df / (df + t * t)
    return this.incompleteBeta(x, df / 2, 0.5) / 2
  }

  private calculateChiSquarePValue(chiSquare: number, df: number): number {
    return 1 - this.gammaIncomplete(df / 2, chiSquare / 2)
  }

  private calculateFDistributionPValue(f: number, df1: number, df2: number): number {
    const x = df2 / (df2 + df1 * f)
    return this.incompleteBeta(x, df2 / 2, df1 / 2)
  }

  private calculateNormalPValue(z: number): number {
    const a1 = 0.254829592
    const a2 = -0.284496736
    const a3 = 1.421413741
    const a4 = -1.453152027
    const a5 = 1.061405429
    const p = 0.3275911

    const sign = z < 0 ? -1 : 1
    z = Math.abs(z) / Math.sqrt(2)

    const t = 1 / (1 + p * z)
    const t2 = t * t
    const t3 = t2 * t
    const t4 = t3 * t
    const t5 = t4 * t

    const erf = 1 - (a5 * t5 + a4 * t4 + a3 * t3 + a2 * t2 + a1 * t) * Math.exp(-z * z)

    return (1 - sign * erf) / 2
  }

  private getTCriticalValue(df: number, alpha: number): number {
    // Approximation for t-critical values
    if (df > 30) {
      return this.getZCriticalValue(alpha)
    }

    // Table of t-critical values for common alpha levels
    const tTable: { [key: string]: number } = {
      '1,0.05': 12.706,
      '2,0.05': 4.303,
      '3,0.05': 3.182,
      '4,0.05': 2.776,
      '5,0.05': 2.571,
      '10,0.05': 2.228,
      '20,0.05': 2.086,
      '30,0.05': 2.042,
    }

    return tTable[`${df},${alpha}`] || this.getZCriticalValue(alpha)
  }

  private getZCriticalValue(alpha: number): number {
    // Approximation for z-critical values
    const zTable: { [key: number]: number } = {
      0.01: 2.576,
      0.05: 1.96,
      0.1: 1.645,
    }

    return zTable[alpha] || 1.96
  }

  private incompleteBeta(x: number, a: number, b: number): number {
    // Continued fraction approximation
    const maxIterations = 100
    const epsilon = 1e-8

    if (x === 0) {
      return 0
    }
    if (x === 1) {
      return 1
    }

    const lnBeta = this.lnGamma(a) + this.lnGamma(b) - this.lnGamma(a + b)
    const exp = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - lnBeta)

    if (x < (a + 1) / (a + b + 2)) {
      return (exp * this.betaContinuedFraction(x, a, b)) / a
    } else {
      return 1 - (exp * this.betaContinuedFraction(1 - x, b, a)) / b
    }
  }

  private betaContinuedFraction(x: number, a: number, b: number): number {
    const maxIterations = 100
    const epsilon = 1e-8

    const m = 1
    let m2 = 2
    let aa = 1
    let c = 1
    let d = 1 - ((a + b) * x) / (a + 1)

    if (Math.abs(d) < epsilon) {
      d = epsilon
    }
    d = 1 / d
    let h = d

    for (let i = 1; i <= maxIterations; i++) {
      m2 = 2 * i
      aa = (i * (b - i) * x) / ((a - 1 + m2) * (a + m2))
      d = 1 + aa * d
      if (Math.abs(d) < epsilon) {
        d = epsilon
      }
      c = 1 + aa / c
      if (Math.abs(c) < epsilon) {
        c = epsilon
      }
      d = 1 / d
      h *= d * c
      aa = (-(a + i) * (a + b + i) * x) / ((a + m2) * (a + 1 + m2))
      d = 1 + aa * d
      if (Math.abs(d) < epsilon) {
        d = epsilon
      }
      c = 1 + aa / c
      if (Math.abs(c) < epsilon) {
        c = epsilon
      }
      d = 1 / d
      const del = d * c
      h *= del
      if (Math.abs(del - 1) < epsilon) {
        break
      }
    }

    return h
  }

  private gammaIncomplete(a: number, x: number): number {
    // Series representation for small x
    if (x < a + 1) {
      let sum = 1 / a
      let term = 1 / a

      for (let n = 1; n < 100; n++) {
        term *= x / (a + n)
        sum += term
        if (term < sum * 1e-8) {
          break
        }
      }

      return sum * Math.exp(-x + a * Math.log(x) - this.lnGamma(a))
    } else {
      // Continued fraction for large x
      return 1 - this.gammaContinuedFraction(a, x)
    }
  }

  private gammaContinuedFraction(a: number, x: number): number {
    const epsilon = 1e-8
    let b = x + 1 - a
    let c = 1 / epsilon
    let d = 1 / b
    let h = d

    for (let i = 1; i < 100; i++) {
      const an = -i * (i - a)
      b += 2
      d = an * d + b
      if (Math.abs(d) < epsilon) {
        d = epsilon
      }
      c = b + an / c
      if (Math.abs(c) < epsilon) {
        c = epsilon
      }
      d = 1 / d
      const del = d * c
      h *= del
      if (Math.abs(del - 1) < epsilon) {
        break
      }
    }

    return Math.exp(-x + a * Math.log(x) - this.lnGamma(a)) * h
  }

  private lnGamma(z: number): number {
    // Stirling's approximation
    const g = 7
    const coef = [
      0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
      -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
      1.5056327351493116e-7,
    ]

    if (z < 0.5) {
      return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - this.lnGamma(1 - z)
    }

    z--
    let x = coef[0]
    for (let i = 1; i < g + 2; i++) {
      x += coef[i] / (z + i)
    }

    const t = z + g + 0.5
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x
  }

  private sampleBeta(alpha: number, beta: number): number {
    const x = this.sampleGamma(alpha)
    const y = this.sampleGamma(beta)
    return x / (x + y)
  }

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

  private normalRandom(): number {
    const u1 = Math.random()
    const u2 = Math.random()
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  }

  private calculateExpectedLoss(
    alpha1: number,
    beta1: number,
    alpha2: number,
    beta2: number
  ): number {
    // Monte Carlo estimation of expected loss
    const samples = 10000
    let loss = 0

    for (let i = 0; i < samples; i++) {
      const sample1 = this.sampleBeta(alpha1, beta1)
      const sample2 = this.sampleBeta(alpha2, beta2)
      loss += Math.max(0, sample2 - sample1)
    }

    return loss / samples
  }

  /**
   * Matrix Operations
   */

  private matrixMultiply(A: number[][], B: number[][]): number[][] {
    const m = A.length
    const n = A[0].length
    const p = B[0].length

    const result: number[][] = []
    for (let i = 0; i < m; i++) {
      result[i] = []
      for (let j = 0; j < p; j++) {
        result[i][j] = 0
        for (let k = 0; k < n; k++) {
          result[i][j] += A[i][k] * B[k][j]
        }
      }
    }

    return result
  }

  private matrixTranspose(A: number[][]): number[][] {
    const m = A.length
    const n = A[0].length

    const result: number[][] = []
    for (let i = 0; i < n; i++) {
      result[i] = []
      for (let j = 0; j < m; j++) {
        result[i][j] = A[j][i]
      }
    }

    return result
  }

  private matrixVectorMultiply(A: number[][], b: number[]): number[] {
    return A.map((row) => row.reduce((sum, val, i) => sum + val * b[i], 0))
  }

  private matrixInverse(A: number[][]): number[][] {
    // Gauss-Jordan elimination
    const n = A.length
    const augmented: number[][] = A.map((row, i) => [
      ...row,
      ...Array(n)
        .fill(0)
        .map((_, j) => (i === j ? 1 : 0)),
    ])

    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k
        }
      }
      ;[augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]]

      // Scale pivot row
      const pivot = augmented[i][i]
      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] /= pivot
      }

      // Eliminate column
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = augmented[k][i]
          for (let j = 0; j < 2 * n; j++) {
            augmented[k][j] -= factor * augmented[i][j]
          }
        }
      }
    }

    // Extract inverse
    return augmented.map((row) => row.slice(n))
  }

  private solveLinearSystem(A: number[][], b: number[]): number[] {
    const inverse = this.matrixInverse(A)
    return this.matrixVectorMultiply(inverse, b)
  }
}

// Type definitions
export interface HypothesisTestResult {
  statistic: number
  pValue: number
  degreesOfFreedom?: number
  degreesOfFreedom2?: number
  zStatistic?: number
  confidenceInterval?: [number, number]
  reject: boolean
  testName: string
}

export interface CorrelationResult {
  coefficient: number
  pValue: number
  confidenceInterval: [number, number]
  significant: boolean
}

export interface RegressionResult {
  slope: number
  intercept: number
  rSquared: number
  adjustedRSquared: number
  slopeStdError: number
  interceptStdError: number
  pValueSlope: number
  pValueIntercept: number
  residuals: number[]
}

export interface MultipleRegressionResult {
  coefficients: number[]
  standardErrors: number[]
  tStatistics: number[]
  pValues: number[]
  rSquared: number
  adjustedRSquared: number
  fStatistic: number
  fPValue: number
  residuals: number[]
  predictions: number[]
}

export interface SeasonalDecomposition {
  trend: number[]
  seasonal: number[]
  residual: number[]
  period: number
}

export interface BayesianTestResult {
  probabilityABetter: number
  probabilityBBetter: number
  expectedLossA: number
  expectedLossB: number
  posteriorA: { alpha: number; beta: number }
  posteriorB: { alpha: number; beta: number }
}

export default StatisticalAnalysisFramework
