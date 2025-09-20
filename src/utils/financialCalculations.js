/**
 * 財務メトリクス計算ユーティリティ
 * PMP/PMBOK学習用の財務指標計算ロジック
 */

/**
 * 現在価値（Present Value）を計算
 * @param {number} futureValue - 将来価値
 * @param {number} rate - 割引率（%）
 * @param {number} periods - 期間（年）
 * @returns {number} 現在価値
 */
export const calculatePV = (futureValue, rate, periods) => {
  const discountRate = rate / 100
  return futureValue / Math.pow(1 + discountRate, periods)
}

/**
 * 正味現在価値（Net Present Value）を計算
 * @param {number} initialInvestment - 初期投資額
 * @param {number[]} cashFlows - キャッシュフローの配列
 * @param {number} rate - 割引率（%）
 * @returns {number} NPV
 */
export const calculateNPV = (initialInvestment, cashFlows, rate) => {
  const discountRate = rate / 100
  let npv = -initialInvestment
  
  cashFlows.forEach((cashFlow, index) => {
    npv += cashFlow / Math.pow(1 + discountRate, index + 1)
  })
  
  return npv
}

/**
 * 内部収益率（Internal Rate of Return）を計算
 * Newton-Raphson法による近似計算
 * @param {number} initialInvestment - 初期投資額
 * @param {number[]} cashFlows - キャッシュフローの配列
 * @returns {number} IRR（%）
 */
export const calculateIRR = (initialInvestment, cashFlows) => {
  const maxIterations = 100
  const tolerance = 0.0001
  let irr = 0.1 // 初期推定値10%
  
  for (let i = 0; i < maxIterations; i++) {
    let npv = -initialInvestment
    let dnpv = 0
    
    cashFlows.forEach((cashFlow, index) => {
      const period = index + 1
      const pvFactor = Math.pow(1 + irr, period)
      npv += cashFlow / pvFactor
      dnpv -= period * cashFlow / (pvFactor * (1 + irr))
    })
    
    if (Math.abs(npv) < tolerance) {
      return irr * 100
    }
    
    if (dnpv === 0) {
      break
    }
    
    irr = irr - npv / dnpv
    
    // 収束しない場合の安全装置
    if (irr < -0.99 || irr > 10) {
      return null
    }
  }
  
  return irr * 100
}

/**
 * 投資収益率（Return on Investment）を計算
 * @param {number} gain - 利益
 * @param {number} investment - 投資額
 * @returns {number} ROI（%）
 */
export const calculateROI = (gain, investment) => {
  if (investment === 0) return 0
  return ((gain - investment) / investment) * 100
}

/**
 * 回収期間（Payback Period）を計算
 * @param {number} initialInvestment - 初期投資額
 * @param {number[]} cashFlows - キャッシュフローの配列
 * @returns {number} 回収期間（年）
 */
export const calculatePaybackPeriod = (initialInvestment, cashFlows) => {
  let cumulativeCashFlow = -initialInvestment
  let paybackPeriod = 0
  
  for (let i = 0; i < cashFlows.length; i++) {
    cumulativeCashFlow += cashFlows[i]
    
    if (cumulativeCashFlow >= 0) {
      // 線形補間で正確な回収期間を計算
      const previousCumulativeCashFlow = cumulativeCashFlow - cashFlows[i]
      const fraction = -previousCumulativeCashFlow / cashFlows[i]
      paybackPeriod = i + fraction
      return paybackPeriod
    }
  }
  
  // 回収期間内に回収できない場合
  return null
}

/**
 * 割引回収期間（Discounted Payback Period）を計算
 * @param {number} initialInvestment - 初期投資額
 * @param {number[]} cashFlows - キャッシュフローの配列
 * @param {number} rate - 割引率（%）
 * @returns {number} 割引回収期間（年）
 */
export const calculateDiscountedPaybackPeriod = (initialInvestment, cashFlows, rate) => {
  const discountRate = rate / 100
  let cumulativePV = -initialInvestment
  let paybackPeriod = 0
  
  for (let i = 0; i < cashFlows.length; i++) {
    const pv = cashFlows[i] / Math.pow(1 + discountRate, i + 1)
    cumulativePV += pv
    
    if (cumulativePV >= 0) {
      const previousCumulativePV = cumulativePV - pv
      const fraction = -previousCumulativePV / pv
      paybackPeriod = i + 1 - (1 - fraction)
      return paybackPeriod
    }
  }
  
  return null
}

/**
 * 費用便益比率（Benefit-Cost Ratio）を計算
 * @param {number[]} benefits - 便益の配列
 * @param {number[]} costs - コストの配列
 * @param {number} rate - 割引率（%）
 * @returns {number} BCR
 */
export const calculateBCR = (benefits, costs, rate) => {
  const discountRate = rate / 100
  let pvBenefits = 0
  let pvCosts = 0
  
  benefits.forEach((benefit, index) => {
    pvBenefits += benefit / Math.pow(1 + discountRate, index + 1)
  })
  
  costs.forEach((cost, index) => {
    pvCosts += cost / Math.pow(1 + discountRate, index + 1)
  })
  
  if (pvCosts === 0) return 0
  return pvBenefits / pvCosts
}

/**
 * 収益性指数（Profitability Index）を計算
 * @param {number} initialInvestment - 初期投資額
 * @param {number[]} cashFlows - キャッシュフローの配列
 * @param {number} rate - 割引率（%）
 * @returns {number} PI
 */
export const calculateProfitabilityIndex = (initialInvestment, cashFlows, rate) => {
  const discountRate = rate / 100
  let pvCashFlows = 0
  
  cashFlows.forEach((cashFlow, index) => {
    pvCashFlows += cashFlow / Math.pow(1 + discountRate, index + 1)
  })
  
  if (initialInvestment === 0) return 0
  return pvCashFlows / initialInvestment
}

/**
 * 感度分析用のパラメータ変動による影響計算
 * @param {Object} baseCase - 基準ケースのパラメータ
 * @param {string} parameter - 変動させるパラメータ
 * @param {number[]} variations - 変動率の配列（%）
 * @returns {Object[]} 感度分析結果
 */
export const performSensitivityAnalysis = (baseCase, parameter, variations) => {
  const results = []
  
  variations.forEach(variation => {
    const adjustedCase = { ...baseCase }
    const multiplier = 1 + variation / 100
    
    switch (parameter) {
      case 'initialInvestment':
        adjustedCase.initialInvestment = baseCase.initialInvestment * multiplier
        break
      case 'cashFlows':
        adjustedCase.cashFlows = baseCase.cashFlows.map(cf => cf * multiplier)
        break
      case 'discountRate':
        adjustedCase.discountRate = baseCase.discountRate * multiplier
        break
      default:
        break
    }
    
    const npv = calculateNPV(
      adjustedCase.initialInvestment,
      adjustedCase.cashFlows,
      adjustedCase.discountRate
    )
    
    results.push({
      variation,
      npv,
      parameter,
      change: ((npv - baseCase.npv) / baseCase.npv) * 100
    })
  })
  
  return results
}

/**
 * プロジェクト比較のためのランキング計算
 * @param {Object[]} projects - プロジェクトの配列
 * @returns {Object[]} ランキング付きプロジェクト
 */
export const rankProjects = (projects) => {
  const rankedProjects = projects.map(project => {
    const npv = calculateNPV(project.initialInvestment, project.cashFlows, project.discountRate)
    const irr = calculateIRR(project.initialInvestment, project.cashFlows)
    const roi = calculateROI(
      project.cashFlows.reduce((sum, cf) => sum + cf, 0),
      project.initialInvestment
    )
    const payback = calculatePaybackPeriod(project.initialInvestment, project.cashFlows)
    const pi = calculateProfitabilityIndex(project.initialInvestment, project.cashFlows, project.discountRate)
    
    // 総合スコアの計算（重み付け）
    const scores = {
      npv: npv > 0 ? 1 : 0,
      irr: irr && irr > project.discountRate ? 1 : 0,
      roi: roi > 0 ? 1 : 0,
      payback: payback && payback < project.cashFlows.length ? 1 : 0,
      pi: pi > 1 ? 1 : 0
    }
    
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)
    
    return {
      ...project,
      metrics: { npv, irr, roi, payback, pi },
      scores,
      totalScore
    }
  })
  
  // 総合スコアでソート
  return rankedProjects.sort((a, b) => b.totalScore - a.totalScore)
}

/**
 * モンテカルロシミュレーション（簡易版）
 * @param {Object} params - シミュレーションパラメータ
 * @param {number} iterations - シミュレーション回数
 * @returns {Object} シミュレーション結果
 */
export const monteCarloSimulation = (params, iterations = 1000) => {
  const results = []
  
  for (let i = 0; i < iterations; i++) {
    // パラメータをランダムに変動させる（正規分布を仮定）
    const randomInitialInvestment = params.initialInvestment * (1 + (Math.random() - 0.5) * params.investmentVolatility)
    const randomCashFlows = params.cashFlows.map(cf => 
      cf * (1 + (Math.random() - 0.5) * params.cashFlowVolatility)
    )
    const randomDiscountRate = params.discountRate * (1 + (Math.random() - 0.5) * params.rateVolatility)
    
    const npv = calculateNPV(randomInitialInvestment, randomCashFlows, randomDiscountRate)
    results.push(npv)
  }
  
  // 統計量の計算
  const sortedResults = results.sort((a, b) => a - b)
  const mean = results.reduce((sum, val) => sum + val, 0) / iterations
  const median = sortedResults[Math.floor(iterations / 2)]
  const percentile5 = sortedResults[Math.floor(iterations * 0.05)]
  const percentile95 = sortedResults[Math.floor(iterations * 0.95)]
  const standardDeviation = Math.sqrt(
    results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / iterations
  )
  
  return {
    mean,
    median,
    percentile5,
    percentile95,
    standardDeviation,
    probabilityPositive: results.filter(npv => npv > 0).length / iterations * 100
  }
}

/**
 * 財務指標のフォーマット
 * @param {number} value - 値
 * @param {string} type - タイプ（currency, percent, years）
 * @returns {string} フォーマット済み文字列
 */
export const formatFinancialValue = (value, type = 'currency') => {
  if (value === null || value === undefined) {
    return 'N/A'
  }
  
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    
    case 'percent':
      return `${value.toFixed(2)}%`
    
    case 'years':
      return value < 1 
        ? `${Math.round(value * 12)}ヶ月`
        : `${value.toFixed(1)}年`
    
    case 'ratio':
      return value.toFixed(2)
    
    default:
      return value.toLocaleString('ja-JP')
  }
}

/**
 * 財務指標の評価レベルを判定
 * @param {string} metric - 指標名
 * @param {number} value - 値
 * @returns {Object} 評価レベル
 */
export const evaluateMetric = (metric, value) => {
  const evaluations = {
    npv: {
      excellent: value > 10000000,
      good: value > 0,
      fair: value > -5000000,
      poor: value <= -5000000
    },
    irr: {
      excellent: value > 20,
      good: value > 15,
      fair: value > 10,
      poor: value <= 10
    },
    roi: {
      excellent: value > 30,
      good: value > 20,
      fair: value > 10,
      poor: value <= 10
    },
    payback: {
      excellent: value !== null && value < 2,
      good: value !== null && value < 3,
      fair: value !== null && value < 5,
      poor: value === null || value >= 5
    },
    bcr: {
      excellent: value > 1.5,
      good: value > 1.2,
      fair: value > 1.0,
      poor: value <= 1.0
    },
    pi: {
      excellent: value > 1.3,
      good: value > 1.1,
      fair: value > 1.0,
      poor: value <= 1.0
    }
  }
  
  const evaluation = evaluations[metric]
  if (!evaluation) return { level: 'unknown', color: 'gray' }
  
  if (evaluation.excellent) return { level: 'excellent', color: 'green', label: '優秀' }
  if (evaluation.good) return { level: 'good', color: 'blue', label: '良好' }
  if (evaluation.fair) return { level: 'fair', color: 'yellow', label: '普通' }
  return { level: 'poor', color: 'red', label: '要改善' }
}