/**
 * Progress Page Object Model for PMP Learning Management System
 * 
 * This page object handles all progress tracking and dashboard interactions:
 * - Overall learning progress monitoring
 * - Knowledge area completion tracking
 * - Individual process progress
 * - Study time and analytics
 * - Learning recommendations
 * - Goal setting and tracking
 * - Performance metrics
 * 
 * @fileoverview Progress Dashboard Page Object Model
 * @author PMP Learning Management Team
 * @since 2.0.0
 */

import { type Page, type Locator } from '@playwright/test'
import { BasePage } from './base-page'

export interface ProgressMetrics {
  percentage: number
  completedProcesses: number
  totalProcesses: number
  studyTimeHours: number
  currentStreak: number
}

export interface KnowledgeAreaProgress {
  name: string
  completedProcesses: number
  totalProcesses: number
  percentage: number
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

export class ProgressPage extends BasePage {
  private readonly selectors = {
    // Main progress dashboard
    progressDashboard: '[data-testid="progress-dashboard"]',
    overallProgress: '[data-testid="overall-progress"]',
    overallPercentage: '[data-testid="overall-percentage"]',
    completedProcessCount: '[data-testid="completed-process-count"]',
    totalProcessCount: '[data-testid="total-process-count"]',
    
    // Progress metrics
    studyTime: '[data-testid="study-time"]',
    studyStreak: '[data-testid="study-streak"]',
    sessionsCompleted: '[data-testid="sessions-completed"]',
    averageSessionTime: '[data-testid="average-session-time"]',
    
    // Knowledge areas
    knowledgeAreasGrid: '[data-testid="knowledge-areas-grid"]',
    knowledgeAreaCard: '[data-testid="knowledge-area-card"]',
    knowledgeAreaProgress: '[data-testid="knowledge-area-progress"]',
    knowledgeAreaName: '[data-testid="knowledge-area-name"]',
    knowledgeAreaPercentage: '[data-testid="knowledge-area-percentage"]',
    
    // Specific knowledge areas
    integrationArea: '[data-testid="knowledge-area-integration"]',
    scopeArea: '[data-testid="knowledge-area-scope"]',
    scheduleArea: '[data-testid="knowledge-area-schedule"]',
    costArea: '[data-testid="knowledge-area-cost"]',
    qualityArea: '[data-testid="knowledge-area-quality"]',
    resourceArea: '[data-testid="knowledge-area-resource"]',
    communicationArea: '[data-testid="knowledge-area-communication"]',
    riskArea: '[data-testid="knowledge-area-risk"]',
    procurementArea: '[data-testid="knowledge-area-procurement"]',
    stakeholderArea: '[data-testid="knowledge-area-stakeholder"]',
    
    // Process tracking
    processGrid: '[data-testid="process-grid"]',
    processCard: '[data-testid="process-card"]',
    processStatus: '[data-testid="process-status"]',
    processName: '[data-testid="process-name"]',
    processCompleted: '[data-testid="process-completed"]',
    processInProgress: '[data-testid="process-in-progress"]',
    processNotStarted: '[data-testid="process-not-started"]',
    
    // Learning recommendations
    recommendationsSection: '[data-testid="learning-recommendations"]',
    recommendationItem: '[data-testid="recommendation-item"]',
    recommendationType: '[data-testid="recommendation-type"]',
    recommendationTitle: '[data-testid="recommendation-title"]',
    recommendationDescription: '[data-testid="recommendation-description"]',
    
    // Mastery tests
    masteryTestsSection: '[data-testid="mastery-tests-section"]',
    masteryTestCard: '[data-testid="mastery-test-card"]',
    masteryTestStatus: '[data-testid="mastery-test-status"]',
    
    // Charts and visualizations
    progressChart: '[data-testid="progress-chart"]',
    timeChart: '[data-testid="time-chart"]',
    competencyRadar: '[data-testid="competency-radar"]',
    
    // Goals and targets
    goalsSection: '[data-testid="goals-section"]',
    currentGoals: '[data-testid="current-goals"]',
    goalProgress: '[data-testid="goal-progress"]',
    setNewGoal: '[data-testid="set-new-goal"]',
    
    // Achievement badges
    achievementsSection: '[data-testid="achievements-section"]',
    achievementBadge: '[data-testid="achievement-badge"]',
    recentAchievements: '[data-testid="recent-achievements"]',
    
    // Analytics and insights
    analyticsTab: '[data-testid="analytics-tab"]',
    learningAnalytics: '[data-testid="learning-analytics"]',
    performanceInsights: '[data-testid="performance-insights"]',
    learningJourneyTimeline: '[data-testid="learning-journey-timeline"]',
    skillDevelopmentChart: '[data-testid="skill-development-chart"]',
    knowledgeRetentionGraph: '[data-testid="knowledge-retention-graph"]',
    totalLearningTime: '[data-testid="total-learning-time"]',
    averageSessionTime: '[data-testid="average-session-time"]',
    studyConsistencyScore: '[data-testid="study-consistency-score"]',
    
    // Exam readiness
    examReadinessSection: '[data-testid="exam-readiness-section"]',
    examReadinessScore: '[data-testid="exam-readiness-score"]',
    examReadinessAssessment: '[data-testid="exam-readiness-assessment"]',
    readinessCriterion: '[data-testid="readiness-criterion"]',
    
    // Study plan
    studyPlanSection: '[data-testid="study-plan-section"]',
    weeklyGoals: '[data-testid="weekly-goals"]',
    upcomingSessions: '[data-testid="upcoming-sessions"]',
    studySchedule: '[data-testid="study-schedule"]',
    
    // Ongoing learning
    ongoingLearningSection: '[data-testid="ongoing-learning-section"]',
    advancedLearningPath: '[data-testid="advanced-learning-path"]',
    maintenanceRecommendation: '[data-testid="maintenance-recommendation"]',
    realWorldApplications: '[data-testid="real-world-applications"]',
    applicationScenario: '[data-testid="application-scenario"]'
  }

  constructor(page: Page) {
    super(page)
  }

  /**
   * Navigate to progress dashboard
   */
  async navigate(): Promise<void> {
    await super.navigate('/#/progress')
    await this.waitForElement(this.selectors.progressDashboard)
  }

  /**
   * Get overall progress metrics
   */
  async getOverallProgress(): Promise<ProgressMetrics> {
    await this.waitForElement(this.selectors.overallProgress)
    
    const percentageText = await this.getTextContent(this.selectors.overallPercentage)
    const completedText = await this.getTextContent(this.selectors.completedProcessCount)
    const totalText = await this.getTextContent(this.selectors.totalProcessCount)
    const studyTimeText = await this.getTextContent(this.selectors.studyTime)
    const streakText = await this.getTextContent(this.selectors.studyStreak)
    
    return {
      percentage: parseInt(percentageText.replace('%', '')) || 0,
      completedProcesses: parseInt(completedText) || 0,
      totalProcesses: parseInt(totalText) || 49,
      studyTimeHours: parseFloat(studyTimeText.replace(/[^\d.]/g, '')) || 0,
      currentStreak: parseInt(streakText.replace(/\D/g, '')) || 0
    }
  }

  /**
   * Get progress for a specific knowledge area
   */
  async getKnowledgeAreaProgress(areaId: string): Promise<KnowledgeAreaProgress> {
    const areaSelector = this.selectors[`${areaId}Area` as keyof typeof this.selectors] as string
    await this.waitForElement(areaSelector)
    
    const areaElement = await this.getElement(areaSelector)
    
    const name = await areaElement.locator(this.selectors.knowledgeAreaName).textContent() || ''
    const percentageText = await areaElement.locator(this.selectors.knowledgeAreaPercentage).textContent() || '0%'
    const percentage = parseInt(percentageText.replace('%', ''))
    
    // Extract process completion info from area card
    const progressText = await areaElement.locator('[data-testid="process-completion"]').textContent() || '0/0'
    const [completed, total] = progressText.split('/').map(n => parseInt(n.trim()) || 0)
    
    // Determine mastery level based on percentage
    let masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    if (percentage >= 95) masteryLevel = 'expert'
    else if (percentage >= 80) masteryLevel = 'advanced'
    else if (percentage >= 60) masteryLevel = 'intermediate'
    else masteryLevel = 'beginner'
    
    return {
      name,
      completedProcesses: completed,
      totalProcesses: total,
      percentage,
      masteryLevel
    }
  }

  /**
   * Get all knowledge area progress
   */
  async getAllKnowledgeAreaProgress(): Promise<KnowledgeAreaProgress[]> {
    await this.waitForElement(this.selectors.knowledgeAreasGrid)
    
    const areaCards = await this.page.locator(this.selectors.knowledgeAreaCard).all()
    const progress: KnowledgeAreaProgress[] = []
    
    for (const card of areaCards) {
      const name = await card.locator(this.selectors.knowledgeAreaName).textContent() || ''
      const percentageText = await card.locator(this.selectors.knowledgeAreaPercentage).textContent() || '0%'
      const percentage = parseInt(percentageText.replace('%', ''))
      
      const progressText = await card.locator('[data-testid="process-completion"]').textContent() || '0/0'
      const [completed, total] = progressText.split('/').map(n => parseInt(n.trim()) || 0)
      
      let masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
      if (percentage >= 95) masteryLevel = 'expert'
      else if (percentage >= 80) masteryLevel = 'advanced'
      else if (percentage >= 60) masteryLevel = 'intermediate'
      else masteryLevel = 'beginner'
      
      progress.push({
        name,
        completedProcesses: completed,
        totalProcesses: total,
        percentage,
        masteryLevel
      })
    }
    
    return progress
  }

  /**
   * Get current learning recommendations
   */
  async getLearningRecommendations(): Promise<Array<{
    type: string
    title: string
    description: string
  }>> {
    await this.waitForElement(this.selectors.recommendationsSection)
    
    const recommendationItems = await this.page.locator(this.selectors.recommendationItem).all()
    const recommendations = []
    
    for (const item of recommendationItems) {
      const type = await item.locator(this.selectors.recommendationType).textContent() || ''
      const title = await item.locator(this.selectors.recommendationTitle).textContent() || ''
      const description = await item.locator(this.selectors.recommendationDescription).textContent() || ''
      
      recommendations.push({ type, title, description })
    }
    
    return recommendations
  }

  /**
   * Start a recommended learning activity
   */
  async followRecommendation(index: number): Promise<void> {
    const recommendations = await this.page.locator(this.selectors.recommendationItem).all()
    
    if (index < recommendations.length) {
      await recommendations[index].click()
      await this.waitForPageLoad()
    } else {
      throw new Error(`Recommendation index ${index} out of range`)
    }
  }

  /**
   * Check mastery test status for a knowledge area
   */
  async getMasteryTestStatus(knowledgeArea: string): Promise<{
    available: boolean
    completed: boolean
    score?: number
    passed?: boolean
  }> {
    await this.scrollToElement(this.selectors.masteryTestsSection)
    
    const testCard = this.page.locator(`[data-testid="mastery-test-${knowledgeArea}"]`)
    const available = await testCard.count() > 0
    
    if (!available) {
      return { available: false, completed: false }
    }
    
    const status = await testCard.locator(this.selectors.masteryTestStatus).textContent() || ''
    const completed = status.includes('完了') || status.includes('Completed')
    
    let score, passed
    if (completed) {
      const scoreText = await testCard.locator('[data-testid="test-score"]').textContent()
      score = scoreText ? parseInt(scoreText.replace(/\D/g, '')) : undefined
      passed = score ? score >= 80 : undefined
    }
    
    return { available, completed, score, passed }
  }

  /**
   * Start mastery test for a knowledge area
   */
  async startMasteryTest(knowledgeArea: string): Promise<void> {
    const testButton = this.page.locator(`[data-testid="mastery-test-${knowledgeArea}"]`)
    await testButton.click()
    
    // Wait for test interface to load
    await this.waitForPageLoad()
  }

  /**
   * Set a new learning goal
   */
  async setLearningGoal(goal: {
    type: 'completion' | 'time' | 'score'
    target: string
    deadline: string
  }): Promise<void> {
    await this.scrollToElement(this.selectors.goalsSection)
    await this.clickElement(this.selectors.setNewGoal)
    
    // Fill goal form
    await this.page.locator(`[data-testid="goal-type-${goal.type}"]`).click()
    await this.fillInput('[data-testid="goal-target"]', goal.target)
    await this.fillInput('[data-testid="goal-deadline"]', goal.deadline)
    
    await this.clickElement('[data-testid="save-goal"]')
    await this.waitForElement('[data-testid="goal-saved-message"]')
  }

  /**
   * Get current goals and their progress
   */
  async getCurrentGoals(): Promise<Array<{
    type: string
    target: string
    progress: number
    deadline: string
    status: 'on-track' | 'behind' | 'completed'
  }>> {
    await this.scrollToElement(this.selectors.goalsSection)
    
    const goalItems = await this.page.locator('[data-testid="goal-item"]').all()
    const goals = []
    
    for (const item of goalItems) {
      const type = await item.locator('[data-testid="goal-type"]').textContent() || ''
      const target = await item.locator('[data-testid="goal-target"]').textContent() || ''
      const progressText = await item.locator('[data-testid="goal-progress-value"]').textContent() || '0'
      const progress = parseInt(progressText)
      const deadline = await item.locator('[data-testid="goal-deadline"]').textContent() || ''
      const statusElement = await item.locator('[data-testid="goal-status"]')
      const statusClass = await statusElement.getAttribute('class') || ''
      
      let status: 'on-track' | 'behind' | 'completed'
      if (statusClass.includes('completed')) status = 'completed'
      else if (statusClass.includes('behind')) status = 'behind'
      else status = 'on-track'
      
      goals.push({ type, target, progress, deadline, status })
    }
    
    return goals
  }

  /**
   * Get recent achievements
   */
  async getRecentAchievements(): Promise<Array<{
    name: string
    description: string
    earnedDate: string
    type: 'process' | 'knowledge-area' | 'exam' | 'streak' | 'time'
  }>> {
    await this.scrollToElement(this.selectors.achievementsSection)
    
    const achievementBadges = await this.page.locator(this.selectors.achievementBadge).all()
    const achievements = []
    
    for (const badge of achievementBadges) {
      const name = await badge.locator('[data-testid="achievement-name"]').textContent() || ''
      const description = await badge.locator('[data-testid="achievement-description"]').textContent() || ''
      const earnedDate = await badge.locator('[data-testid="achievement-date"]').textContent() || ''
      const typeAttribute = await badge.getAttribute('data-type') || 'process'
      
      achievements.push({
        name,
        description,
        earnedDate,
        type: typeAttribute as any
      })
    }
    
    return achievements
  }

  /**
   * View detailed learning analytics
   */
  async viewLearningAnalytics(): Promise<{
    totalStudyTime: number
    averageSessionDuration: number
    consistencyScore: number
    knowledgeRetention: number
    learningVelocity: number
  }> {
    await this.clickElement(this.selectors.analyticsTab)
    await this.waitForElement(this.selectors.learningAnalytics)
    
    const totalTime = await this.getTextContent(this.selectors.totalLearningTime)
    const avgSession = await this.getTextContent(this.selectors.averageSessionTime)
    const consistency = await this.getTextContent(this.selectors.studyConsistencyScore)
    
    // Extract retention and velocity from performance insights
    await this.waitForElement(this.selectors.performanceInsights)
    
    const retentionText = await this.getTextContent('[data-testid="retention-score"]')
    const velocityText = await this.getTextContent('[data-testid="learning-velocity"]')
    
    return {
      totalStudyTime: parseInt(totalTime.replace(/\D/g, '')) || 0,
      averageSessionDuration: parseInt(avgSession.replace(/\D/g, '')) || 0,
      consistencyScore: parseInt(consistency.replace(/\D/g, '')) || 0,
      knowledgeRetention: parseInt(retentionText?.replace(/\D/g, '')) || 0,
      learningVelocity: parseFloat(velocityText?.replace(/[^\d.]/g, '')) || 0
    }
  }

  /**
   * Check exam readiness status
   */
  async getExamReadinessStatus(): Promise<{
    overallScore: number
    readyForExam: boolean
    weakAreas: string[]
    recommendedActions: string[]
  }> {
    await this.scrollToElement(this.selectors.examReadinessSection)
    
    const scoreText = await this.getTextContent(this.selectors.examReadinessScore)
    const overallScore = parseInt(scoreText.replace(/\D/g, '')) || 0
    const readyForExam = overallScore >= 85
    
    // Get weak areas from criteria that aren't met
    const criteriaItems = await this.page.locator(this.selectors.readinessCriterion).all()
    const weakAreas = []
    const recommendedActions = []
    
    for (const criterion of criteriaItems) {
      const status = await criterion.locator('[data-testid="criterion-status"]').textContent()
      
      if (status?.includes('未達成') || status?.includes('要改善')) {
        const areaName = await criterion.locator('[data-testid="criterion-name"]').textContent()
        const action = await criterion.locator('[data-testid="recommended-action"]').textContent()
        
        if (areaName) weakAreas.push(areaName)
        if (action) recommendedActions.push(action)
      }
    }
    
    return {
      overallScore,
      readyForExam,
      weakAreas,
      recommendedActions
    }
  }

  /**
   * Export progress report
   */
  async exportProgressReport(format: 'pdf' | 'excel' | 'json' = 'pdf'): Promise<void> {
    await this.clickElement(`[data-testid="export-${format}"]`)
    
    // Wait for download to initiate
    await this.page.waitForTimeout(2000)
    
    // Verify export success message
    await this.waitForElement('[data-testid="export-success-message"]')
  }

  /**
   * Compare progress with peers (if available)
   */
  async getPeerComparison(): Promise<{
    myRank: number
    totalParticipants: number
    averageProgress: number
    myProgress: number
    topPercentile: boolean
  } | null> {
    const peerComparisonSection = '[data-testid="peer-comparison-section"]'
    
    if (!(await this.elementExists(peerComparisonSection))) {
      return null
    }
    
    await this.scrollToElement(peerComparisonSection)
    
    const rankText = await this.getTextContent('[data-testid="my-rank"]')
    const totalText = await this.getTextContent('[data-testid="total-participants"]')
    const avgProgressText = await this.getTextContent('[data-testid="average-progress"]')
    const myProgressText = await this.getTextContent('[data-testid="my-progress-comparison"]')
    
    const myRank = parseInt(rankText.replace(/\D/g, '')) || 0
    const totalParticipants = parseInt(totalText.replace(/\D/g, '')) || 0
    const averageProgress = parseInt(avgProgressText.replace(/\D/g, '')) || 0
    const myProgress = parseInt(myProgressText.replace(/\D/g, '')) || 0
    
    const topPercentile = totalParticipants > 0 && (myRank / totalParticipants) <= 0.1
    
    return {
      myRank,
      totalParticipants,
      averageProgress,
      myProgress,
      topPercentile
    }
  }

  /**
   * Schedule study sessions
   */
  async scheduleStudySession(session: {
    date: string
    time: string
    duration: number
    topics: string[]
  }): Promise<void> {
    await this.scrollToElement(this.selectors.studySchedule)
    await this.clickElement('[data-testid="add-study-session"]')
    
    // Fill session details
    await this.fillInput('[data-testid="session-date"]', session.date)
    await this.fillInput('[data-testid="session-time"]', session.time)
    await this.fillInput('[data-testid="session-duration"]', session.duration.toString())
    
    // Select topics
    for (const topic of session.topics) {
      await this.clickElement(`[data-testid="topic-${topic}"]`)
    }
    
    await this.clickElement('[data-testid="save-study-session"]')
    await this.waitForElement('[data-testid="session-saved-message"]')
  }

  /**
   * Test progress dashboard responsiveness
   */
  async testResponsiveness(): Promise<boolean> {
    const viewports = [
      { width: 375, height: 812, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1280, height: 720, name: 'desktop' }
    ]
    
    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport)
      await this.page.waitForTimeout(500)
      
      // Check key elements are visible
      const elementsVisible = await Promise.all([
        this.elementExists(this.selectors.overallProgress, 2000),
        this.elementExists(this.selectors.knowledgeAreasGrid, 2000),
        this.elementExists(this.selectors.recommendationsSection, 2000)
      ])
      
      if (!elementsVisible.every(visible => visible)) {
        console.warn(`Progress dashboard not responsive at ${viewport.name}`)
        return false
      }
    }
    
    return true
  }
}