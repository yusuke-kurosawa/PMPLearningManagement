/**
 * Advanced Difficulty Adjustment Engine with Item Response Theory (IRT)
 * Implements psychometric models for adaptive testing and difficulty calibration
 */

import { Matrix, inverse, multiply, transpose } from 'mathjs'

/**
 * Item Response Theory Models
 */

// 3-Parameter Logistic Model (3PL) for question difficulty
export interface IRTParameters {
  a: number // Discrimination parameter (how well item differentiates)
  b: number // Difficulty parameter (location on ability scale)
  c: number // Guessing parameter (probability of correct guess)
  theta?: number // Ability parameter (student ability level)
}

// Question performance data
export interface QuestionPerformance {
  questionId: string
  attempts: number
  correctCount: number
  incorrectCount: number
  averageTimeSpent: number
  averageAbilityOfCorrect: number
  averageAbilityOfIncorrect: number
  discriminationIndex: number
  difficultyIndex: number
  guessingRate: number
}

// Student performance data
export interface StudentPerformance {
  studentId: string
  abilityEstimate: number // Theta in IRT
  standardError: number
  questionsAnswered: number
  correctAnswers: number
  responsePattern: ResponseItem[]
  domainAbilities: Record<string, number>
  confidenceInterval: [number, number]
  adaptiveLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

export interface ResponseItem {
  questionId: string
  isCorrect: boolean
  timeSpent: number
  attemptNumber: number
  timestamp: Date
}

// Computer Adaptive Testing (CAT) configuration
export interface CATConfig {
  minQuestions: number
  maxQuestions: number
  stoppingCriterion: 'precision' | 'fixed' | 'confidence'
  targetPrecision: number // Standard error threshold
  confidenceLevel: number // For confidence interval stopping
  initialTheta: number // Starting ability estimate
  startingDifficulty: 'easy' | 'medium' | 'hard' | 'adaptive'
}

export class DifficultyAdjustmentEngine {
  private questionBank: Map<string, IRTParameters> = new Map()
  private studentProfiles: Map<string, StudentPerformance> = new Map()
  private performanceHistory: Map<string, QuestionPerformance> = new Map()
  private catConfig: CATConfig

  constructor(config?: Partial<CATConfig>) {
    this.catConfig = {
      minQuestions: 20,
      maxQuestions: 180,
      stoppingCriterion: 'precision',
      targetPrecision: 0.3,
      confidenceLevel: 0.95,
      initialTheta: 0,
      startingDifficulty: 'adaptive',
      ...config,
    }
  }

  /**
   * 3-Parameter Logistic Model
   * P(correct) = c + (1-c) / (1 + exp(-a(theta - b)))
   */
  calculate3PLProbability(params: IRTParameters): number {
    const { a, b, c, theta = 0 } = params
    const exponential = Math.exp(-a * (theta - b))
    return c + (1 - c) / (1 + exponential)
  }

  /**
   * 2-Parameter Logistic Model (no guessing)
   * P(correct) = 1 / (1 + exp(-a(theta - b)))
   */
  calculate2PLProbability(a: number, b: number, theta: number): number {
    return 1 / (1 + Math.exp(-a * (theta - b)))
  }

  /**
   * Rasch Model (1-parameter, discrimination = 1)
   * P(correct) = 1 / (1 + exp(-(theta - b)))
   */
  calculateRaschProbability(b: number, theta: number): number {
    return 1 / (1 + Math.exp(-(theta - b)))
  }

  /**
   * Maximum Likelihood Estimation for ability (theta)
   */
  estimateAbilityMLE(
    responses: ResponseItem[],
    maxIterations: number = 50
  ): {
    theta: number
    standardError: number
    convergence: boolean
  } {
    let theta = this.catConfig.initialTheta
    let previousTheta = theta
    let iteration = 0
    let converged = false

    while (iteration < maxIterations && !converged) {
      // Calculate first and second derivatives
      let firstDerivative = 0
      let secondDerivative = 0

      for (const response of responses) {
        const params = this.questionBank.get(response.questionId)
        if (!params) {
          continue
        }

        const p = this.calculate3PLProbability({ ...params, theta })
        const q = 1 - p
        const w = (p - params.c) / (1 - params.c)

        // First derivative of log-likelihood
        firstDerivative += (params.a * w * (response.isCorrect ? 1 : 0 - p)) / p

        // Second derivative of log-likelihood
        secondDerivative -= Math.pow(params.a, 2) * w * q
      }

      // Newton-Raphson update
      if (Math.abs(secondDerivative) > 0.001) {
        theta = previousTheta - firstDerivative / secondDerivative
      }

      // Check convergence
      if (Math.abs(theta - previousTheta) < 0.01) {
        converged = true
      }

      previousTheta = theta
      iteration++
    }

    // Calculate standard error
    let information = 0
    for (const response of responses) {
      const params = this.questionBank.get(response.questionId)
      if (!params) {
        continue
      }

      const p = this.calculate3PLProbability({ ...params, theta })
      const q = 1 - p
      const w = Math.pow((p - params.c) / (1 - params.c), 2)

      information += (Math.pow(params.a, 2) * w * q) / p
    }

    const standardError = information > 0 ? 1 / Math.sqrt(information) : 999

    return {
      theta: Math.max(-4, Math.min(4, theta)), // Bound theta between -4 and 4
      standardError,
      convergence: converged,
    }
  }

  /**
   * Expected A Posteriori (EAP) estimation with Bayesian approach
   */
  estimateAbilityEAP(
    responses: ResponseItem[],
    priorMean: number = 0,
    priorSD: number = 1
  ): {
    theta: number
    standardError: number
  } {
    const quadraturePoints = 40
    const range = 6 // -3 to +3 standard deviations
    const step = range / quadraturePoints

    let posteriorSum = 0
    let posteriorMean = 0
    let posteriorVariance = 0

    // Quadrature integration
    for (let i = 0; i < quadraturePoints; i++) {
      const theta = -range / 2 + i * step

      // Prior probability (normal distribution)
      const prior = this.normalPDF(theta, priorMean, priorSD)

      // Likelihood
      let likelihood = 1
      for (const response of responses) {
        const params = this.questionBank.get(response.questionId)
        if (!params) {
          continue
        }

        const p = this.calculate3PLProbability({ ...params, theta })
        likelihood *= response.isCorrect ? p : 1 - p
      }

      const posterior = prior * likelihood
      posteriorSum += posterior
      posteriorMean += theta * posterior
      posteriorVariance += Math.pow(theta, 2) * posterior
    }

    // Normalize
    posteriorMean /= posteriorSum
    posteriorVariance = posteriorVariance / posteriorSum - Math.pow(posteriorMean, 2)

    return {
      theta: posteriorMean,
      standardError: Math.sqrt(posteriorVariance),
    }
  }

  /**
   * Item Information Function
   * Measures how much information an item provides at a given ability level
   */
  calculateItemInformation(params: IRTParameters, theta: number): number {
    const p = this.calculate3PLProbability({ ...params, theta })
    const q = 1 - p
    const numerator = Math.pow(params.a, 2) * Math.pow(p - params.c, 2)
    const denominator = Math.pow(1 - params.c, 2) * p * q

    return denominator > 0 ? numerator / denominator : 0
  }

  /**
   * Test Information Function
   * Sum of all item information functions
   */
  calculateTestInformation(questionIds: string[], theta: number): number {
    let totalInformation = 0

    for (const questionId of questionIds) {
      const params = this.questionBank.get(questionId)
      if (params) {
        totalInformation += this.calculateItemInformation(params, theta)
      }
    }

    return totalInformation
  }

  /**
   * Select next question using Maximum Information criterion
   */
  selectNextQuestion(
    studentId: string,
    availableQuestions: string[],
    constraints?: {
      domain?: string
      knowledgeArea?: string
      excludeIds?: string[]
    }
  ): string | null {
    const student = this.studentProfiles.get(studentId)
    if (!student) {
      return null
    }

    let maxInformation = 0
    let selectedQuestion: string | null = null

    for (const questionId of availableQuestions) {
      // Apply constraints
      if (constraints?.excludeIds?.includes(questionId)) {
        continue
      }

      const params = this.questionBank.get(questionId)
      if (!params) {
        continue
      }

      // Calculate information at current ability estimate
      const information = this.calculateItemInformation(params, student.abilityEstimate)

      // Add randomness to avoid always selecting the same question
      const randomizedInfo = information * (0.9 + Math.random() * 0.2)

      if (randomizedInfo > maxInformation) {
        maxInformation = randomizedInfo
        selectedQuestion = questionId
      }
    }

    return selectedQuestion
  }

  /**
   * Update student ability after answering a question
   */
  updateStudentAbility(
    studentId: string,
    questionId: string,
    isCorrect: boolean,
    timeSpent: number
  ): StudentPerformance {
    let student = this.studentProfiles.get(studentId)

    if (!student) {
      student = this.initializeStudent(studentId)
    }

    // Add response to pattern
    student.responsePattern.push({
      questionId,
      isCorrect,
      timeSpent,
      attemptNumber: 1,
      timestamp: new Date(),
    })

    // Re-estimate ability
    const estimation = this.estimateAbilityEAP(student.responsePattern)
    student.abilityEstimate = estimation.theta
    student.standardError = estimation.standardError

    // Update counts
    student.questionsAnswered++
    if (isCorrect) {
      student.correctAnswers++
    }

    // Calculate confidence interval
    const z = 1.96 // 95% confidence
    student.confidenceInterval = [
      student.abilityEstimate - z * student.standardError,
      student.abilityEstimate + z * student.standardError,
    ]

    // Determine adaptive level
    student.adaptiveLevel = this.determineAdaptiveLevel(student.abilityEstimate)

    // Update question performance
    this.updateQuestionPerformance(questionId, isCorrect, student.abilityEstimate)

    this.studentProfiles.set(studentId, student)
    return student
  }

  /**
   * Calibrate question difficulty using response data
   */
  calibrateQuestionDifficulty(
    questionId: string,
    responses: Array<{ studentAbility: number; isCorrect: boolean }>
  ): IRTParameters {
    // Use marginal maximum likelihood or JMLE for parameter estimation
    // Simplified version using method of moments

    const correctRate = responses.filter((r) => r.isCorrect).length / responses.length
    const avgAbilityCorrect =
      responses.filter((r) => r.isCorrect).reduce((sum, r) => sum + r.studentAbility, 0) /
        responses.filter((r) => r.isCorrect).length || 0

    const avgAbilityIncorrect =
      responses.filter((r) => !r.isCorrect).reduce((sum, r) => sum + r.studentAbility, 0) /
        responses.filter((r) => !r.isCorrect).length || 0

    // Estimate difficulty (b parameter) - ability level at 50% probability
    const b = (avgAbilityCorrect + avgAbilityIncorrect) / 2

    // Estimate discrimination (a parameter) - slope at difficulty point
    const a = Math.max(0.5, Math.min(2.5, (1.7 * (avgAbilityCorrect - avgAbilityIncorrect)) / 4))

    // Estimate guessing (c parameter) - lower asymptote
    const c = Math.max(0, Math.min(0.35, correctRate - 1 / (1 + Math.exp(-a * (-3 - b)))))

    const params: IRTParameters = { a, b, c }
    this.questionBank.set(questionId, params)

    return params
  }

  /**
   * Dynamic difficulty adjustment based on performance
   */
  adjustDifficultyDynamically(
    currentDifficulty: number,
    studentAbility: number,
    recentPerformance: boolean[],
    targetSuccessRate: number = 0.75
  ): number {
    // Calculate recent success rate
    const recentSuccessRate = recentPerformance.filter((p) => p).length / recentPerformance.length

    // PID controller for smooth adjustment
    const error = targetSuccessRate - recentSuccessRate
    const adjustment = 0.3 * error // Proportional control

    // Adjust difficulty towards student ability with momentum
    const momentum = 0.7
    const targetDifficulty = studentAbility + adjustment
    const newDifficulty = momentum * currentDifficulty + (1 - momentum) * targetDifficulty

    // Bound difficulty
    return Math.max(-3, Math.min(3, newDifficulty))
  }

  /**
   * Predict probability of correct answer
   */
  predictSuccessProbability(studentId: string, questionId: string): number {
    const student = this.studentProfiles.get(studentId)
    const question = this.questionBank.get(questionId)

    if (!student || !question) {
      return 0.5
    }

    return this.calculate3PLProbability({
      ...question,
      theta: student.abilityEstimate,
    })
  }

  /**
   * Calculate time to mastery prediction
   */
  predictTimeToMastery(
    studentId: string,
    targetAbility: number,
    averageQuestionsPerSession: number = 20
  ): {
    estimatedQuestions: number
    estimatedSessions: number
    confidenceInterval: [number, number]
  } {
    const student = this.studentProfiles.get(studentId)
    if (!student) {
      return {
        estimatedQuestions: 100,
        estimatedSessions: 5,
        confidenceInterval: [50, 150],
      }
    }

    // Calculate learning rate from history
    const learningRate = this.calculateLearningRate(student.responsePattern)

    // Estimate questions needed
    const abilityGap = targetAbility - student.abilityEstimate
    const questionsNeeded = Math.ceil(Math.abs(abilityGap) / learningRate)

    // Calculate sessions
    const sessionsNeeded = Math.ceil(questionsNeeded / averageQuestionsPerSession)

    // Confidence interval based on standard error
    const uncertainty = student.standardError * 2
    const lowerBound = Math.max(0, questionsNeeded - questionsNeeded * uncertainty)
    const upperBound = questionsNeeded + questionsNeeded * uncertainty

    return {
      estimatedQuestions: questionsNeeded,
      estimatedSessions: sessionsNeeded,
      confidenceInterval: [Math.floor(lowerBound), Math.ceil(upperBound)],
    }
  }

  /**
   * Analyze question effectiveness
   */
  analyzeQuestionEffectiveness(questionId: string): {
    discrimination: number
    difficulty: number
    reliability: number
    informationPeak: number
    optimalAbilityRange: [number, number]
    recommendations: string[]
  } {
    const params = this.questionBank.get(questionId)
    const performance = this.performanceHistory.get(questionId)

    if (!params || !performance) {
      return {
        discrimination: 0,
        difficulty: 0,
        reliability: 0,
        informationPeak: 0,
        optimalAbilityRange: [-1, 1],
        recommendations: ['Insufficient data for analysis'],
      }
    }

    // Find where information is maximized
    let maxInfo = 0
    let peakTheta = params.b

    for (let theta = -3; theta <= 3; theta += 0.1) {
      const info = this.calculateItemInformation(params, theta)
      if (info > maxInfo) {
        maxInfo = info
        peakTheta = theta
      }
    }

    // Find optimal ability range (where information > 50% of peak)
    const threshold = maxInfo * 0.5
    let lowerBound = peakTheta
    let upperBound = peakTheta

    for (let theta = peakTheta; theta >= -3; theta -= 0.1) {
      if (this.calculateItemInformation(params, theta) < threshold) {
        lowerBound = theta + 0.1
        break
      }
    }

    for (let theta = peakTheta; theta <= 3; theta += 0.1) {
      if (this.calculateItemInformation(params, theta) < threshold) {
        upperBound = theta - 0.1
        break
      }
    }

    // Generate recommendations
    const recommendations: string[] = []

    if (params.a < 0.5) {
      recommendations.push(
        'Low discrimination - question may not differentiate well between ability levels'
      )
    }
    if (params.a > 2.5) {
      recommendations.push(
        'Very high discrimination - may be too sensitive to small ability differences'
      )
    }
    if (params.c > 0.3) {
      recommendations.push('High guessing parameter - consider revising answer options')
    }
    if (Math.abs(params.b) > 2) {
      recommendations.push(
        'Extreme difficulty - question may be too easy or too hard for most students'
      )
    }
    if (performance.attempts < 30) {
      recommendations.push('Limited data - more responses needed for reliable calibration')
    }

    // Calculate reliability (simplified)
    const reliability =
      Math.min(1, performance.attempts / 100) *
      (1 - Math.abs(performance.discriminationIndex - 0.3))

    return {
      discrimination: params.a,
      difficulty: params.b,
      reliability,
      informationPeak: maxInfo,
      optimalAbilityRange: [lowerBound, upperBound],
      recommendations,
    }
  }

  /**
   * Helper methods
   */

  private normalPDF(x: number, mean: number, sd: number): number {
    const coefficient = 1 / (sd * Math.sqrt(2 * Math.PI))
    const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(sd, 2))
    return coefficient * Math.exp(exponent)
  }

  private initializeStudent(studentId: string): StudentPerformance {
    return {
      studentId,
      abilityEstimate: this.catConfig.initialTheta,
      standardError: 1,
      questionsAnswered: 0,
      correctAnswers: 0,
      responsePattern: [],
      domainAbilities: {},
      confidenceInterval: [-1, 1],
      adaptiveLevel: 'intermediate',
    }
  }

  private determineAdaptiveLevel(
    theta: number
  ): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    if (theta < -1) {
      return 'beginner'
    }
    if (theta < 0.5) {
      return 'intermediate'
    }
    if (theta < 2) {
      return 'advanced'
    }
    return 'expert'
  }

  private updateQuestionPerformance(
    questionId: string,
    isCorrect: boolean,
    studentAbility: number
  ) {
    let performance = this.performanceHistory.get(questionId)

    if (!performance) {
      performance = {
        questionId,
        attempts: 0,
        correctCount: 0,
        incorrectCount: 0,
        averageTimeSpent: 0,
        averageAbilityOfCorrect: 0,
        averageAbilityOfIncorrect: 0,
        discriminationIndex: 0,
        difficultyIndex: 0,
        guessingRate: 0,
      }
    }

    // Update counts
    performance.attempts++
    if (isCorrect) {
      performance.correctCount++
      performance.averageAbilityOfCorrect =
        (performance.averageAbilityOfCorrect * (performance.correctCount - 1) + studentAbility) /
        performance.correctCount
    } else {
      performance.incorrectCount++
      performance.averageAbilityOfIncorrect =
        (performance.averageAbilityOfIncorrect * (performance.incorrectCount - 1) +
          studentAbility) /
        performance.incorrectCount
    }

    // Update indices
    performance.difficultyIndex = performance.correctCount / performance.attempts
    performance.discriminationIndex =
      (performance.averageAbilityOfCorrect - performance.averageAbilityOfIncorrect) / 4

    this.performanceHistory.set(questionId, performance)
  }

  private calculateLearningRate(responses: ResponseItem[]): number {
    if (responses.length < 10) {
      return 0.05
    } // Default learning rate

    // Calculate ability improvement over time
    const windowSize = 10
    const windows: number[] = []

    for (let i = 0; i <= responses.length - windowSize; i += 5) {
      const window = responses.slice(i, i + windowSize)
      const successRate = window.filter((r) => r.isCorrect).length / windowSize
      windows.push(successRate)
    }

    if (windows.length < 2) {
      return 0.05
    }

    // Calculate average improvement
    let totalImprovement = 0
    for (let i = 1; i < windows.length; i++) {
      totalImprovement += windows[i] - windows[i - 1]
    }

    return Math.max(0.01, Math.min(0.2, totalImprovement / (windows.length - 1)))
  }

  /**
   * Export calibration data for analysis
   */
  exportCalibrationData(): {
    questions: Array<{ id: string; params: IRTParameters; performance: QuestionPerformance }>
    students: Array<{ id: string; profile: StudentPerformance }>
  } {
    const questions = Array.from(this.questionBank.entries())
      .map(([id, params]) => ({
        id,
        params,
        performance: this.performanceHistory.get(id)!,
      }))
      .filter((q) => q.performance)

    const students = Array.from(this.studentProfiles.entries()).map(([id, profile]) => ({
      id,
      profile,
    }))

    return { questions, students }
  }

  /**
   * Import calibration data
   */
  importCalibrationData(data: {
    questions: Array<{ id: string; params: IRTParameters }>
    students?: Array<{ id: string; profile: StudentPerformance }>
  }) {
    // Import question parameters
    for (const { id, params } of data.questions) {
      this.questionBank.set(id, params)
    }

    // Import student profiles if provided
    if (data.students) {
      for (const { id, profile } of data.students) {
        this.studentProfiles.set(id, profile)
      }
    }
  }
}

/**
 * Question Selection Strategies for different testing scenarios
 */
export class AdaptiveTestingStrategies {
  /**
   * Maximum Information Strategy
   * Selects questions that provide most information at current ability
   */
  static maximumInformation(
    questions: Array<{ id: string; params: IRTParameters }>,
    currentAbility: number,
    excludeIds: string[] = []
  ): string | null {
    let maxInfo = 0
    let selectedId: string | null = null

    for (const { id, params } of questions) {
      if (excludeIds.includes(id)) {
        continue
      }

      const p = 1 / (1 + Math.exp(-params.a * (currentAbility - params.b)))
      const info = Math.pow(params.a, 2) * p * (1 - p)

      if (info > maxInfo) {
        maxInfo = info
        selectedId = id
      }
    }

    return selectedId
  }

  /**
   * Randomesque Strategy
   * Adds randomness to avoid exposure and pattern recognition
   */
  static randomesque(
    questions: Array<{ id: string; params: IRTParameters }>,
    currentAbility: number,
    randomness: number = 0.2
  ): string | null {
    const scored = questions.map(({ id, params }) => {
      const p = 1 / (1 + Math.exp(-params.a * (currentAbility - params.b)))
      const info = Math.pow(params.a, 2) * p * (1 - p)
      const randomFactor = 1 + (Math.random() - 0.5) * randomness

      return { id, score: info * randomFactor }
    })

    scored.sort((a, b) => b.score - a.score)
    return scored[0]?.id || null
  }

  /**
   * Progressive Strategy
   * Gradually increases difficulty for confidence building
   */
  static progressive(
    questions: Array<{ id: string; params: IRTParameters }>,
    currentAbility: number,
    questionsAnswered: number,
    targetDifficulty?: number
  ): string | null {
    // Start easier and progress to harder
    const progressFactor = Math.min(1, questionsAnswered / 20)
    const adjustedDifficulty = targetDifficulty || currentAbility - 1 + progressFactor * 2

    // Find question closest to target difficulty
    let minDiff = Infinity
    let selectedId: string | null = null

    for (const { id, params } of questions) {
      const diff = Math.abs(params.b - adjustedDifficulty)
      if (diff < minDiff) {
        minDiff = diff
        selectedId = id
      }
    }

    return selectedId
  }

  /**
   * Content Balancing Strategy
   * Ensures coverage across different domains/topics
   */
  static contentBalanced(
    questions: Array<{ id: string; params: IRTParameters; domain: string }>,
    currentAbility: number,
    answeredByDomain: Record<string, number>,
    targetDistribution: Record<string, number>
  ): string | null {
    // Calculate which domain needs more questions
    let maxNeed = 0
    let neededDomain = ''

    for (const [domain, target] of Object.entries(targetDistribution)) {
      const answered = answeredByDomain[domain] || 0
      const totalAnswered = Object.values(answeredByDomain).reduce((a, b) => a + b, 0)
      const currentRatio = totalAnswered > 0 ? answered / totalAnswered : 0
      const need = target - currentRatio

      if (need > maxNeed) {
        maxNeed = need
        neededDomain = domain
      }
    }

    // Filter questions by needed domain
    const domainQuestions = questions.filter((q) => q.domain === neededDomain)

    // Select best question from domain using maximum information
    return AdaptiveTestingStrategies.maximumInformation(domainQuestions, currentAbility)
  }
}

/**
 * Spaced Repetition Algorithm for long-term retention
 */
export class SpacedRepetitionEngine {
  private intervals = [1, 3, 7, 14, 30, 60, 120, 240] // Days

  calculateNextReview(
    currentInterval: number,
    performance: 'fail' | 'hard' | 'good' | 'easy',
    consecutiveCorrect: number
  ): {
    nextInterval: number
    nextReviewDate: Date
  } {
    let newInterval: number

    switch (performance) {
      case 'fail':
        newInterval = 1 // Reset to 1 day
        break
      case 'hard':
        newInterval = Math.max(1, currentInterval * 0.6)
        break
      case 'good':
        newInterval = currentInterval * 1.3
        break
      case 'easy':
        newInterval = currentInterval * 2.5
        break
    }

    // Apply consecutive correct bonus
    if (consecutiveCorrect > 3) {
      newInterval *= 1 + (consecutiveCorrect - 3) * 0.1
    }

    // Cap at reasonable maximum (1 year)
    newInterval = Math.min(365, Math.round(newInterval))

    const nextReviewDate = new Date()
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)

    return {
      nextInterval: newInterval,
      nextReviewDate,
    }
  }
}

export default DifficultyAdjustmentEngine
