/**
 * Learning Effectiveness Metrics System
 * Comprehensive metrics for measuring learning outcomes and engagement
 */

export interface LearningMetrics {
  primary: PrimaryMetrics
  secondary: SecondaryMetrics
  leading: LeadingIndicators
  lagging: LaggingIndicators
  behavioral: BehavioralMetrics
  calculated: CalculatedMetrics
}

export interface PrimaryMetrics {
  examPassRate: number // Percentage of users passing exams
  knowledgeRetention: number // Retention rate over time
  timeToMastery: number // Average days to achieve mastery
  learningVelocity: number // Rate of knowledge acquisition
  competencyLevel: number // Overall competency score (0-100)
}

export interface SecondaryMetrics {
  engagementRate: number // Daily active users / total users
  completionRate: number // Course completion percentage
  userSatisfaction: number // NPS or satisfaction score
  participationRate: number // Active participation in activities
  resourceUtilization: number // Usage of learning resources
}

export interface LeadingIndicators {
  studyFrequency: number // Sessions per week
  sessionDuration: number // Average minutes per session
  questionAccuracy: number // Correct answer percentage
  practiceIntensity: number // Practice problems per day
  contentInteraction: number // Interactions per session
  learningStreak: number // Consecutive days of learning
}

export interface LaggingIndicators {
  longTermRetention: number // Knowledge retained after 90 days
  careerAdvancement: number // Job progression rate
  certificationSuccess: number // Certification pass rate
  knowledgeApplication: number // Real-world application rate
  peerComparison: number // Performance vs peer group
}

export interface BehavioralMetrics {
  learningPathOptimization: number // Path efficiency score
  contentInteractionPatterns: string[] // Interaction sequence patterns
  engagementTiming: TimeDistribution // When users engage
  difficultyPreference: number // Preferred difficulty level
  learningStyle: LearningStyle // Identified learning style
  motivationFactors: string[] // Key motivation drivers
}

export interface CalculatedMetrics {
  learningEfficiency: number // Knowledge gained / time spent
  masteryProgression: number // Rate of mastery achievement
  engagementTrend: TrendData // Engagement over time
  performanceTrend: TrendData // Performance over time
  riskScore: number // Risk of dropout or failure
  potentialScore: number // Learning potential estimate
}

export interface TimeDistribution {
  hourly: number[] // 24-hour distribution
  daily: number[] // 7-day week distribution
  monthly: number[] // 30-day month distribution
}

export interface LearningStyle {
  visual: number
  auditory: number
  kinesthetic: number
  reading: number
}

export interface TrendData {
  values: number[]
  trend: 'increasing' | 'decreasing' | 'stable'
  changeRate: number
  forecast: number[]
}

export interface MetricEvent {
  userId: string
  timestamp: Date
  eventType: string
  eventData: any
  sessionId: string
  context: EventContext
}

export interface EventContext {
  platform: string
  deviceType: string
  location?: string
  experimentId?: string
  variantId?: string
}

export class LearningMetricsCalculator {
  /**
   * Calculate exam pass rate
   */
  calculateExamPassRate(attempts: ExamAttempt[]): number {
    if (attempts.length === 0) {
      return 0
    }
    const passed = attempts.filter((a) => a.passed).length
    return passed / attempts.length
  }

  /**
   * Calculate knowledge retention using Ebbinghaus forgetting curve
   */
  calculateKnowledgeRetention(
    initialScore: number,
    currentScore: number,
    daysSinceLearn: number
  ): number {
    // Ebbinghaus forgetting curve: R = e^(-t/S)
    // where t is time and S is strength of memory
    const memoryStrength = 5 // Adjustable based on learning method
    const theoreticalRetention = Math.exp(-daysSinceLearn / memoryStrength)
    const actualRetention = currentScore / initialScore

    // Weight actual vs theoretical (60% actual, 40% theoretical)
    return 0.6 * actualRetention + 0.4 * theoreticalRetention
  }

  /**
   * Calculate time to mastery
   */
  calculateTimeToMastery(learningEvents: LearningEvent[], masteryThreshold: number = 0.8): number {
    const sortedEvents = learningEvents.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    )

    const startDate = sortedEvents[0]?.timestamp
    const masteryEvent = sortedEvents.find((e) => e.score >= masteryThreshold)

    if (!startDate || !masteryEvent) {
      return -1
    }

    const daysDiff = Math.floor(
      (masteryEvent.timestamp.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    return daysDiff
  }

  /**
   * Calculate learning velocity
   */
  calculateLearningVelocity(
    progressData: ProgressPoint[],
    timeWindow: number = 7 // days
  ): number {
    if (progressData.length < 2) {
      return 0
    }

    const recentData = progressData.filter((p) => {
      const daysDiff = (Date.now() - p.timestamp.getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff <= timeWindow
    })

    if (recentData.length < 2) {
      return 0
    }

    const firstPoint = recentData[0]
    const lastPoint = recentData[recentData.length - 1]
    const scoreDiff = lastPoint.score - firstPoint.score
    const timeDiff =
      (lastPoint.timestamp.getTime() - firstPoint.timestamp.getTime()) / (1000 * 60 * 60 * 24)

    return timeDiff > 0 ? scoreDiff / timeDiff : 0
  }

  /**
   * Calculate engagement rate
   */
  calculateEngagementRate(
    activeUsers: number,
    totalUsers: number,
    timeWindow: number = 1 // days
  ): number {
    if (totalUsers === 0) {
      return 0
    }
    return activeUsers / totalUsers
  }

  /**
   * Calculate completion rate
   */
  calculateCompletionRate(completedModules: number, totalModules: number): number {
    if (totalModules === 0) {
      return 0
    }
    return completedModules / totalModules
  }

  /**
   * Calculate study frequency
   */
  calculateStudyFrequency(sessions: Session[], weeks: number = 4): number {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - weeks * 7)

    const recentSessions = sessions.filter((s) => s.startTime > cutoffDate)
    return recentSessions.length / weeks
  }

  /**
   * Calculate average session duration
   */
  calculateSessionDuration(sessions: Session[]): number {
    if (sessions.length === 0) {
      return 0
    }

    const totalDuration = sessions.reduce((sum, s) => {
      const duration = s.endTime.getTime() - s.startTime.getTime()
      return sum + duration
    }, 0)

    return totalDuration / sessions.length / (1000 * 60) // Convert to minutes
  }

  /**
   * Calculate question accuracy
   */
  calculateQuestionAccuracy(answers: Answer[]): number {
    if (answers.length === 0) {
      return 0
    }
    const correct = answers.filter((a) => a.isCorrect).length
    return correct / answers.length
  }

  /**
   * Calculate learning efficiency
   */
  calculateLearningEfficiency(
    knowledgeGained: number,
    timeSpent: number // in hours
  ): number {
    if (timeSpent === 0) {
      return 0
    }
    return knowledgeGained / timeSpent
  }

  /**
   * Calculate risk score for dropout or failure
   */
  calculateRiskScore(metrics: Partial<LearningMetrics>): number {
    const weights = {
      engagement: 0.3,
      performance: 0.3,
      frequency: 0.2,
      duration: 0.2,
    }

    let riskScore = 0

    // Low engagement increases risk
    if (metrics.secondary?.engagementRate) {
      riskScore += (1 - metrics.secondary.engagementRate) * weights.engagement
    }

    // Poor performance increases risk
    if (metrics.leading?.questionAccuracy) {
      riskScore += (1 - metrics.leading.questionAccuracy) * weights.performance
    }

    // Low frequency increases risk
    if (metrics.leading?.studyFrequency) {
      const normalizedFrequency = Math.min(metrics.leading.studyFrequency / 5, 1)
      riskScore += (1 - normalizedFrequency) * weights.frequency
    }

    // Short duration increases risk
    if (metrics.leading?.sessionDuration) {
      const normalizedDuration = Math.min(metrics.leading.sessionDuration / 30, 1)
      riskScore += (1 - normalizedDuration) * weights.duration
    }

    return riskScore
  }

  /**
   * Identify learning style based on interaction patterns
   */
  identifyLearningStyle(interactions: Interaction[]): LearningStyle {
    const styleCounts = {
      visual: 0,
      auditory: 0,
      kinesthetic: 0,
      reading: 0,
    }

    for (const interaction of interactions) {
      switch (interaction.contentType) {
        case 'video':
        case 'diagram':
        case 'chart':
          styleCounts.visual++
          break
        case 'audio':
        case 'podcast':
          styleCounts.auditory++
          break
        case 'simulation':
        case 'practice':
        case 'quiz':
          styleCounts.kinesthetic++
          break
        case 'text':
        case 'article':
        case 'documentation':
          styleCounts.reading++
          break
      }
    }

    const total = Object.values(styleCounts).reduce((a, b) => a + b, 0)

    return {
      visual: total > 0 ? styleCounts.visual / total : 0.25,
      auditory: total > 0 ? styleCounts.auditory / total : 0.25,
      kinesthetic: total > 0 ? styleCounts.kinesthetic / total : 0.25,
      reading: total > 0 ? styleCounts.reading / total : 0.25,
    }
  }

  /**
   * Calculate trend from time series data
   */
  calculateTrend(values: number[]): TrendData {
    if (values.length < 2) {
      return {
        values,
        trend: 'stable',
        changeRate: 0,
        forecast: [],
      }
    }

    // Simple linear regression
    const n = values.length
    const xSum = (n * (n - 1)) / 2
    const xSquaredSum = (n * (n - 1) * (2 * n - 1)) / 6
    const ySum = values.reduce((a, b) => a + b, 0)
    const xySum = values.reduce((sum, y, x) => sum + x * y, 0)

    const slope = (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum)
    const intercept = (ySum - slope * xSum) / n

    // Determine trend
    let trend: 'increasing' | 'decreasing' | 'stable'
    if (Math.abs(slope) < 0.01) {
      trend = 'stable'
    } else if (slope > 0) {
      trend = 'increasing'
    } else {
      trend = 'decreasing'
    }

    // Generate forecast
    const forecast: number[] = []
    for (let i = 0; i < 5; i++) {
      forecast.push(intercept + slope * (n + i))
    }

    return {
      values,
      trend,
      changeRate: slope,
      forecast,
    }
  }

  /**
   * Calculate all metrics for a user
   */
  calculateAllMetrics(userData: UserLearningData): LearningMetrics {
    const primary: PrimaryMetrics = {
      examPassRate: this.calculateExamPassRate(userData.examAttempts),
      knowledgeRetention: this.calculateKnowledgeRetention(
        userData.initialScore,
        userData.currentScore,
        userData.daysSinceStart
      ),
      timeToMastery: this.calculateTimeToMastery(userData.learningEvents),
      learningVelocity: this.calculateLearningVelocity(userData.progressPoints),
      competencyLevel: userData.currentScore,
    }

    const secondary: SecondaryMetrics = {
      engagementRate: this.calculateEngagementRate(userData.activeDays, userData.totalDays),
      completionRate: this.calculateCompletionRate(
        userData.completedModules,
        userData.totalModules
      ),
      userSatisfaction: userData.satisfactionScore,
      participationRate: userData.participationRate,
      resourceUtilization: userData.resourceUtilization,
    }

    const leading: LeadingIndicators = {
      studyFrequency: this.calculateStudyFrequency(userData.sessions),
      sessionDuration: this.calculateSessionDuration(userData.sessions),
      questionAccuracy: this.calculateQuestionAccuracy(userData.answers),
      practiceIntensity: userData.practiceProblemsPerDay,
      contentInteraction: userData.interactionsPerSession,
      learningStreak: userData.currentStreak,
    }

    const lagging: LaggingIndicators = {
      longTermRetention: userData.longTermRetention,
      careerAdvancement: userData.careerProgressionRate,
      certificationSuccess: userData.certificationPassRate,
      knowledgeApplication: userData.applicationRate,
      peerComparison: userData.peerPercentile,
    }

    const behavioral: BehavioralMetrics = {
      learningPathOptimization: userData.pathEfficiencyScore,
      contentInteractionPatterns: userData.interactionPatterns,
      engagementTiming: userData.engagementTiming,
      difficultyPreference: userData.preferredDifficulty,
      learningStyle: this.identifyLearningStyle(userData.interactions),
      motivationFactors: userData.motivationFactors,
    }

    const calculated: CalculatedMetrics = {
      learningEfficiency: this.calculateLearningEfficiency(
        primary.competencyLevel - userData.initialScore,
        userData.totalHoursSpent
      ),
      masteryProgression: primary.learningVelocity,
      engagementTrend: this.calculateTrend(userData.engagementHistory),
      performanceTrend: this.calculateTrend(userData.performanceHistory),
      riskScore: this.calculateRiskScore({ primary, secondary, leading }),
      potentialScore: this.calculatePotentialScore(primary, leading),
    }

    return {
      primary,
      secondary,
      leading,
      lagging,
      behavioral,
      calculated,
    }
  }

  /**
   * Calculate learning potential score
   */
  private calculatePotentialScore(primary: PrimaryMetrics, leading: LeadingIndicators): number {
    const weights = {
      velocity: 0.3,
      accuracy: 0.3,
      frequency: 0.2,
      streak: 0.2,
    }

    let potential = 0

    potential += Math.min(primary.learningVelocity / 10, 1) * weights.velocity
    potential += leading.questionAccuracy * weights.accuracy
    potential += Math.min(leading.studyFrequency / 7, 1) * weights.frequency
    potential += Math.min(leading.learningStreak / 30, 1) * weights.streak

    return potential
  }
}

// Type definitions for data structures
export interface ExamAttempt {
  examId: string
  userId: string
  score: number
  passed: boolean
  timestamp: Date
}

export interface LearningEvent {
  eventId: string
  userId: string
  score: number
  timestamp: Date
  moduleId: string
}

export interface ProgressPoint {
  timestamp: Date
  score: number
  moduleId: string
}

export interface Session {
  sessionId: string
  userId: string
  startTime: Date
  endTime: Date
}

export interface Answer {
  answerId: string
  questionId: string
  isCorrect: boolean
  timestamp: Date
}

export interface Interaction {
  interactionId: string
  contentType: string
  duration: number
  timestamp: Date
}

export interface UserLearningData {
  userId: string
  examAttempts: ExamAttempt[]
  learningEvents: LearningEvent[]
  progressPoints: ProgressPoint[]
  sessions: Session[]
  answers: Answer[]
  interactions: Interaction[]
  initialScore: number
  currentScore: number
  daysSinceStart: number
  activeDays: number
  totalDays: number
  completedModules: number
  totalModules: number
  satisfactionScore: number
  participationRate: number
  resourceUtilization: number
  practiceProblemsPerDay: number
  interactionsPerSession: number
  currentStreak: number
  longTermRetention: number
  careerProgressionRate: number
  certificationPassRate: number
  applicationRate: number
  peerPercentile: number
  pathEfficiencyScore: number
  interactionPatterns: string[]
  engagementTiming: TimeDistribution
  preferredDifficulty: number
  motivationFactors: string[]
  engagementHistory: number[]
  performanceHistory: number[]
  totalHoursSpent: number
}

export default LearningMetricsCalculator
