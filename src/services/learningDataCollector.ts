/**
 * 学習データ収集・分析サービス
 * ユーザーの学習進捗、効果、パフォーマンスを測定し、最適な学習体験を提供
 */

import type {
  ILearningDataCollector,
  LearningData,
  LearningSession,
  EventType,
  SessionActivity,
  QuizScore,
  CompletedModule,
  LearningProgressData,
  PerformanceData,
  EngagementData,
  EffectivenessData,
  WeakArea,
  LearningRecommendation,
  LearningReport,
  LearningReportSummary,
  LearningReportDetails,
  TopPerformingArea,
  LearningTrendAnalysis,
  Achievement,
  LearningDashboardData,
  LearningDataCollectorConfig,
  ImprovementTrend,
  RecommendationType,
  Priority,
  StreakInfo,
  PageView,
  UserInteraction,
  SessionScore,
} from '../types/services/learning-data'
import type { UserId, Score, Percentage, Count, Timestamp } from '../types/common/base'
import type { KnowledgeAreaId, ProcessGroup } from '../types/pmbok/process'

class LearningDataCollector implements ILearningDataCollector {
  private storageKey: string = 'pmp-learning-data'
  private sessionKey: string = 'pmp-session-data'
  private data: LearningData
  private currentSession: LearningSession
  private metricsBuffer: SessionActivity[] = []
  private flushInterval: number = 30000 // 30秒ごとにデータを保存
  private config: LearningDataCollectorConfig
  private autoSaveTimer?: NodeJS.Timeout

  constructor() {
    this.config = {
      storageKey: this.storageKey,
      sessionKey: this.sessionKey,
      flushInterval: this.flushInterval,
      maxBufferSize: 100,
      enableAnalytics: true,
      privacyMode: false,
      retentionDays: 365,
      autoSave: true,
    }

    this.data = this.loadData()
    this.currentSession = this.initSession()

    this.startAutoSave()
  }

  /**
   * データの読み込み
   */
  loadData(): LearningData {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : this.getDefaultData()
    } catch (error) {
      console.error('学習データの読み込みエラー:', error)
      return this.getDefaultData()
    }
  }

  /**
   * デフォルトデータ構造
   */
  private getDefaultData(): LearningData {
    return {
      userId: this.generateUserId(),
      startDate: new Date().toISOString() as Timestamp,
      sessions: [],
      progress: {
        overall: 0 as Percentage,
        knowledgeAreas: {} as Record<KnowledgeAreaId, Percentage>,
        processGroups: {} as Record<ProcessGroup, Percentage>,
        topics: {},
      },
      performance: {
        quizScores: [],
        examScores: [],
        averageScore: 0 as Score,
        bestScore: 0 as Score,
        totalQuestions: 0 as Count,
        correctAnswers: 0 as Count,
        accuracyRate: 0 as Percentage,
        improvementRate: 0 as Percentage,
      },
      engagement: {
        totalTime: 0,
        dailyTime: {},
        streakDays: 0 as Count,
        maxStreak: 0 as Count,
        lastActiveDate: null,
        completedModules: [],
        favoriteTopics: [],
        sessionCount: 0 as Count,
        averageSessionDuration: 0,
      },
      effectiveness: {
        learningRate: 0 as Percentage,
        retentionRate: 0 as Percentage,
        improvementRate: 0 as Percentage,
        masteredTopics: [],
        weakAreas: [],
        efficiency: 0,
        consistency: 0 as Percentage,
      },
    }
  }

  /**
   * ユーザーIDの生成
   */
  private generateUserId(): UserId {
    return ('user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)) as UserId
  }

  /**
   * セッションの初期化
   */
  initSession(): LearningSession {
    const session: LearningSession = {
      id: 'session_' + Date.now(),
      startTime: new Date().toISOString() as Timestamp,
      endTime: null,
      duration: 0,
      activities: [],
      pagesViewed: [],
      interactions: [],
      scores: [],
    }

    // セッション開始をトラッキング
    this.trackEvent('session_start', { sessionId: session.id })

    return session
  }

  /**
   * 自動保存の開始
   */
  private startAutoSave(): void {
    if (this.config.autoSave) {
      this.autoSaveTimer = setInterval(() => {
        this.flushMetrics()
        this.saveData()
      }, this.flushInterval)

      // ページ離脱時にも保存
      window.addEventListener('beforeunload', () => {
        this.endSession()
        this.saveData()
      })
    }
  }

  /**
   * データの保存
   */
  saveData(): boolean {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data))
      return true
    } catch (error) {
      console.error('学習データの保存エラー:', error)
      return false
    }
  }

  /**
   * イベントのトラッキング
   */
  trackEvent(eventType: EventType, eventData: Record<string, unknown> = {}): void {
    const event: SessionActivity = {
      type: eventType,
      timestamp: new Date().toISOString() as Timestamp,
      data: eventData,
    }

    this.currentSession.activities.push(event)
    this.metricsBuffer.push(event)

    // 特定のイベントタイプに応じた処理
    this.processEvent(event)
  }

  /**
   * イベントの処理
   */
  private processEvent(event: SessionActivity): void {
    switch (event.type) {
      case 'page_view':
        this.trackPageView(event.data as { page: string; duration?: number })
        break
      case 'quiz_complete':
        this.trackQuizCompletion(event.data as Partial<QuizScore>)
        break
      case 'module_complete':
        this.trackModuleCompletion(event.data as Partial<CompletedModule>)
        break
      case 'interaction':
        this.trackInteraction(event.data as { type: string; target: string })
        break
      case 'time_spent':
        this.trackTimeSpent(event.data as { duration: number })
        break
    }
  }

  /**
   * ページビューのトラッキング
   */
  trackPageView(data: { page: string; duration?: number }): void {
    const pageView: PageView = {
      page: data.page,
      timestamp: new Date().toISOString() as Timestamp,
      duration: data.duration || 0,
    }

    this.currentSession.pagesViewed.push(pageView)
  }

  /**
   * クイズ完了のトラッキング
   */
  trackQuizCompletion(data: Partial<QuizScore>): void {
    const score: QuizScore = {
      quizId: data.quizId || `quiz_${Date.now()}`,
      score: data.score || (0 as Score),
      totalQuestions: data.totalQuestions || (0 as Count),
      correctAnswers: data.correctAnswers || (0 as Count),
      timestamp: new Date().toISOString() as Timestamp,
      timeSpent: data.timeSpent || 0,
      topic: data.topic,
      difficulty: data.difficulty,
      category: data.category,
    }

    const sessionScore: SessionScore = {
      activityId: score.quizId,
      score: score.score,
      maxScore: 100 as Score,
      percentage: ((score.score / 100) * 100) as Percentage,
      category: score.category || 'quiz',
      timestamp: score.timestamp,
    }

    this.currentSession.scores.push(sessionScore)
    this.data.performance.quizScores.push(score)

    // パフォーマンス統計の更新
    this.updatePerformanceStats(score)
  }

  /**
   * モジュール完了のトラッキング
   */
  trackModuleCompletion(data: Partial<CompletedModule>): void {
    const module: CompletedModule = {
      moduleId: data.moduleId || `module_${Date.now()}`,
      moduleName: data.moduleName || 'Unknown Module',
      completionTime: new Date().toISOString() as Timestamp,
      score: data.score,
      timeSpent: data.timeSpent || 0,
      knowledgeArea: data.knowledgeArea,
      processGroup: data.processGroup,
      difficulty: data.difficulty,
      progressIncrement: data.progressIncrement,
    }

    this.data.engagement.completedModules.push(module)

    // 進捗の更新
    this.updateProgress(module)
  }

  /**
   * インタラクションのトラッキング
   */
  trackInteraction(data: { type: string; target: string }): void {
    const interaction: UserInteraction = {
      type: data.type,
      target: data.target,
      timestamp: new Date().toISOString() as Timestamp,
    }

    this.currentSession.interactions.push(interaction)
  }

  /**
   * 学習時間のトラッキング
   */
  trackTimeSpent(data: { duration: number }): void {
    const today = new Date().toISOString().split('T')[0]

    if (!this.data.engagement.dailyTime[today]) {
      this.data.engagement.dailyTime[today] = 0
    }

    this.data.engagement.dailyTime[today] += data.duration
    this.data.engagement.totalTime += data.duration
  }

  /**
   * パフォーマンス統計の更新
   */
  private updatePerformanceStats(score: QuizScore): void {
    this.data.performance.totalQuestions += score.totalQuestions
    this.data.performance.correctAnswers += score.correctAnswers

    // 平均スコアの再計算
    const allScores = this.data.performance.quizScores.map((s) => s.score)
    this.data.performance.averageScore = (allScores.reduce((a, b) => a + b, 0) /
      allScores.length) as Score

    // 最高スコアの更新
    this.data.performance.bestScore = Math.max(
      this.data.performance.bestScore,
      score.score
    ) as Score

    // 正答率の計算
    this.data.performance.accuracyRate = ((this.data.performance.correctAnswers /
      this.data.performance.totalQuestions) *
      100) as Percentage
  }

  /**
   * 進捗の更新
   */
  private updateProgress(moduleData: CompletedModule): void {
    // 知識エリアの進捗
    if (moduleData.knowledgeArea) {
      if (!this.data.progress.knowledgeAreas[moduleData.knowledgeArea]) {
        this.data.progress.knowledgeAreas[moduleData.knowledgeArea] = 0 as Percentage
      }
      this.data.progress.knowledgeAreas[moduleData.knowledgeArea] = (this.data.progress
        .knowledgeAreas[moduleData.knowledgeArea] +
        (moduleData.progressIncrement || 10)) as Percentage
    }

    // 全体進捗の再計算
    this.calculateOverallProgress()
  }

  /**
   * 全体進捗の計算
   */
  private calculateOverallProgress(): void {
    const areas = Object.values(this.data.progress.knowledgeAreas)
    if (areas.length > 0) {
      this.data.progress.overall = (areas.reduce((a, b) => a + b, 0) / areas.length) as Percentage
    }
  }

  /**
   * 学習効果の計算
   */
  calculateLearningEffectiveness(): Score {
    const recentScores = this.data.performance.quizScores.slice(-10)
    const olderScores = this.data.performance.quizScores.slice(-20, -10)

    if (recentScores.length === 0 || olderScores.length === 0) {
      return 0 as Score
    }

    const recentAvg = recentScores.reduce((a, b) => a + b.score, 0) / recentScores.length
    const olderAvg = olderScores.reduce((a, b) => a + b.score, 0) / olderScores.length

    // 改善率の計算
    const improvementRate = ((recentAvg - olderAvg) / olderAvg) * 100

    // 学習率の計算（正答率の向上度）
    const learningRate = this.data.performance.accuracyRate

    // 継続率の計算（連続学習日数）
    const retentionRate = this.calculateRetentionRate()

    this.data.effectiveness = {
      learningRate: learningRate,
      retentionRate: retentionRate,
      improvementRate: improvementRate as Percentage,
      masteredTopics: this.identifyMasteredTopics(),
      weakAreas: this.identifyWeakAreas(),
      efficiency: 0,
      consistency: retentionRate,
    }

    // 総合的な学習効果スコア（0-100）
    const effectivenessScore =
      learningRate * 0.4 + retentionRate * 0.3 + Math.max(0, improvementRate) * 0.3

    return Math.min(100, Math.max(0, effectivenessScore)) as Score
  }

  /**
   * 定着率の計算
   */
  private calculateRetentionRate(): Percentage {
    const dailyActivity = Object.keys(this.data.engagement.dailyTime)
    const today = new Date()
    let consecutiveDays = 0

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]

      if (dailyActivity.includes(dateStr)) {
        consecutiveDays++
      } else if (i > 0) {
        break
      }
    }

    // 30日中の学習日数を定着率として計算
    return ((consecutiveDays / 30) * 100) as Percentage
  }

  /**
   * 習得済みトピックの特定
   */
  private identifyMasteredTopics(): string[] {
    const mastered: string[] = []

    Object.entries(this.data.progress.topics).forEach(([topic, progress]) => {
      if (progress >= 80) {
        mastered.push(topic)
      }
    })

    return mastered
  }

  /**
   * 弱点エリアの特定
   */
  private identifyWeakAreas(): WeakArea[] {
    const weak: WeakArea[] = []

    // クイズスコアからトピック別の弱点を分析
    const topicScores: Record<string, Score[]> = {}

    this.data.performance.quizScores.forEach((quiz) => {
      if (quiz.topic) {
        if (!topicScores[quiz.topic]) {
          topicScores[quiz.topic] = []
        }
        topicScores[quiz.topic].push(quiz.score)
      }
    })

    Object.entries(topicScores).forEach(([topic, scores]) => {
      const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length) as Score
      if (avgScore < 70) {
        weak.push({
          topic,
          averageScore: avgScore,
          attempts: scores.length as Count,
          priority: avgScore < 50 ? 'high' : avgScore < 60 ? 'medium' : 'low',
        })
      }
    })

    return weak
  }

  /**
   * 学習レコメンデーションの生成
   */
  generateRecommendations(): LearningRecommendation[] {
    const recommendations: LearningRecommendation[] = []
    const effectiveness = this.calculateLearningEffectiveness()

    // 効果が低い場合のレコメンデーション
    if (effectiveness < 50) {
      recommendations.push({
        type: 'learning_method',
        message: '学習方法を変えてみましょう。インタラクティブな要素を増やすことをお勧めします。',
        priority: 'high',
      })
    }

    // 弱点エリアへのフォーカス
    const weakAreas = this.identifyWeakAreas()
    if (weakAreas.length > 0) {
      recommendations.push({
        type: 'focus_area',
        message: `次の分野を重点的に学習しましょう: ${weakAreas.map((w) => w.topic).join(', ')}`,
        priority: 'high',
      })
    }

    // 学習継続の促進
    if (this.data.engagement.streakDays < 7) {
      recommendations.push({
        type: 'consistency',
        message: '毎日少しずつでも学習を続けることが重要です。',
        priority: 'medium',
      })
    }

    // 実践問題の推奨
    if (this.data.performance.quizScores.length < 10) {
      recommendations.push({
        type: 'practice',
        message: 'より多くの練習問題を解いて理解を深めましょう。',
        priority: 'medium',
      })
    }

    return recommendations
  }

  /**
   * セッションの終了
   */
  endSession(): void {
    if (this.currentSession) {
      this.currentSession.endTime = new Date().toISOString() as Timestamp
      this.currentSession.duration =
        new Date(this.currentSession.endTime).getTime() -
        new Date(this.currentSession.startTime).getTime()

      this.data.sessions.push(this.currentSession)
      this.data.engagement.sessionCount++

      // セッション平均時間の更新
      const totalDuration = this.data.sessions.reduce((sum, s) => sum + s.duration, 0)
      this.data.engagement.averageSessionDuration =
        totalDuration / this.data.sessions.length / 60000 // 分に変換

      // 連続学習日数の更新
      this.updateStreak()

      // セッション終了をトラッキング
      this.trackEvent('session_end', {
        sessionId: this.currentSession.id,
        duration: this.currentSession.duration,
      })
    }
  }

  /**
   * 連続学習日数の更新
   */
  private updateStreak(): void {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (this.data.engagement.lastActiveDate === yesterdayStr) {
      this.data.engagement.streakDays++
    } else if (this.data.engagement.lastActiveDate !== today) {
      this.data.engagement.streakDays = 1 as Count
    }

    // 最大連続日数の更新
    this.data.engagement.maxStreak = Math.max(
      this.data.engagement.maxStreak,
      this.data.engagement.streakDays
    ) as Count

    this.data.engagement.lastActiveDate = today
  }

  /**
   * メトリクスのフラッシュ
   */
  private flushMetrics(): void {
    if (this.metricsBuffer.length > 0) {
      // バッファに溜まったメトリクスを処理
      this.processBufferedMetrics()
      this.metricsBuffer = []
    }
  }

  /**
   * バッファされたメトリクスの処理
   */
  private processBufferedMetrics(): void {
    // 集計処理などを実行
    const summary = {
      eventCount: this.metricsBuffer.length,
      types: {} as Record<string, number>,
    }

    this.metricsBuffer.forEach((event) => {
      if (!summary.types[event.type]) {
        summary.types[event.type] = 0
      }
      summary.types[event.type]++
    })

    // 必要に応じてサーバーに送信（実装時）
    // this.sendToServer(summary);
  }

  /**
   * ダッシュボード用データの取得
   */
  getDashboardData(): LearningDashboardData {
    const streakInfo: StreakInfo = {
      current: this.data.engagement.streakDays,
      longest: this.data.engagement.maxStreak,
      lastActiveDate: this.data.engagement.lastActiveDate || '',
      nextMilestone: Math.ceil(this.data.engagement.streakDays / 7) * 7,
      encouragement: this.generateEncouragement(),
    }

    return {
      progress: this.data.progress,
      performance: this.data.performance,
      engagement: this.data.engagement,
      effectiveness: {
        ...this.data.effectiveness,
        score: this.calculateLearningEffectiveness(),
      },
      recommendations: this.generateRecommendations(),
      recentActivity: this.currentSession.activities.slice(-10),
      upcomingGoals: [], // 実装時に追加
      streakInfo,
    }
  }

  /**
   * 励ましメッセージの生成
   */
  private generateEncouragement(): string {
    const streak = this.data.engagement.streakDays
    if (streak >= 30) {
      return '素晴らしい継続力です！'
    }
    if (streak >= 14) {
      return '2週間連続、お疲れ様です！'
    }
    if (streak >= 7) {
      return '1週間連続達成！'
    }
    if (streak >= 3) {
      return '良いペースです！'
    }
    return '学習を続けましょう！'
  }

  /**
   * レポートの生成
   */
  generateReport(period: string = 'week'): LearningReport {
    const summary: LearningReportSummary = {
      totalTime: this.data.engagement.totalTime,
      sessionsCount: this.data.engagement.sessionCount,
      averageSessionDuration: this.data.engagement.averageSessionDuration,
      overallProgress: this.data.progress.overall,
      effectivenessScore: this.calculateLearningEffectiveness(),
      streakDays: this.data.engagement.streakDays,
      completedModules: this.data.engagement.completedModules.length as Count,
    }

    const details: LearningReportDetails = {
      topPerformingAreas: this.getTopPerformingAreas(),
      improvementAreas: this.identifyWeakAreas(),
      learningTrends: this.analyzeLearningTrends(),
      timeDistribution: this.analyzeTimeDistribution(),
      scoreDistribution: this.analyzeScoreDistribution(),
    }

    return {
      period,
      generatedAt: new Date().toISOString() as Timestamp,
      summary,
      details,
      achievements: this.getAchievements(),
      recommendations: this.generateRecommendations(),
    }
  }

  /**
   * トップパフォーマンスエリアの取得
   */
  private getTopPerformingAreas(): TopPerformingArea[] {
    const areas: TopPerformingArea[] = []

    Object.entries(this.data.progress.knowledgeAreas).forEach(([area, progress]) => {
      if (progress >= 80) {
        areas.push({
          area,
          progress,
          averageScore: 0 as Score, // 実装時に計算
          timeSpent: 0,
          strengthLevel: Math.ceil(progress / 20),
        })
      }
    })

    return areas.sort((a, b) => b.progress - a.progress)
  }

  /**
   * 学習トレンドの分析
   */
  private analyzeLearningTrends(): LearningTrendAnalysis {
    const recentScores = this.data.performance.quizScores.slice(-20)

    if (recentScores.length < 2) {
      return {
        trend: 'insufficient_data',
        slope: 0,
        interpretation: 'データが不足しています',
        dataPoints: recentScores.length as Count,
        confidence: 0 as Percentage,
        recommendations: ['もっと練習問題を解いてみましょう'],
      }
    }

    // 線形回帰で傾向を分析（簡略版）
    const xValues = recentScores.map((_, i) => i)
    const yValues = recentScores.map((s) => s.score)

    const n = xValues.length
    const sumX = xValues.reduce((a, b) => a + b, 0)
    const sumY = yValues.reduce((a, b) => a + b, 0)
    const sumXY = xValues.reduce((total, x, i) => total + x * yValues[i], 0)
    const sumX2 = xValues.reduce((total, x) => total + x * x, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)

    return {
      trend: slope > 0.5 ? 'improving' : slope < -0.5 ? 'declining' : 'stable',
      slope: slope,
      interpretation: this.interpretTrend(slope),
      dataPoints: n as Count,
      confidence: Math.min(100, (n / 20) * 100) as Percentage,
      recommendations: this.getTrendRecommendations(slope),
    }
  }

  /**
   * トレンドの解釈
   */
  private interpretTrend(slope: number): string {
    if (slope > 1) {
      return '素晴らしい上昇傾向です！'
    }
    if (slope > 0.5) {
      return '良い改善が見られます。'
    }
    if (slope > -0.5) {
      return '安定した学習を続けています。'
    }
    if (slope > -1) {
      return '少し停滞気味です。学習方法を見直しましょう。'
    }
    return '改善が必要です。サポートが必要な場合はお知らせください。'
  }

  /**
   * トレンド別推奨事項
   */
  private getTrendRecommendations(slope: number): string[] {
    if (slope > 1) {
      return ['この調子で続けましょう！', '新しい挑戦にも取り組んでみましょう']
    }
    if (slope > 0.5) {
      return ['良いペースです', '復習も忘れずに行いましょう']
    }
    if (slope > -0.5) {
      return ['安定しています', '新しい学習方法を試してみましょう']
    }
    return ['学習方法を見直しましょう', 'サポートを求めることも大切です']
  }

  /**
   * 時間分布の分析
   */
  private analyzeTimeDistribution(): any {
    // 実装の詳細は省略
    return {
      byDay: this.data.engagement.dailyTime,
      byHour: {},
      byTopic: {},
      peakHours: [],
      totalActiveTime: this.data.engagement.totalTime,
    }
  }

  /**
   * スコア分布の分析
   */
  private analyzeScoreDistribution(): any {
    const scores = this.data.performance.quizScores.map((s) => s.score)
    return {
      ranges: {},
      average: this.data.performance.averageScore,
      median: scores.length > 0 ? scores[Math.floor(scores.length / 2)] : 0,
      standardDeviation: 0, // 実装時に計算
      improvement: this.data.performance.improvementRate,
    }
  }

  /**
   * 達成項目の取得
   */
  private getAchievements(): Achievement[] {
    const achievements: Achievement[] = []

    // 初回学習
    if (this.data.sessions.length >= 1) {
      achievements.push({
        id: 'first_session',
        name: '学習開始',
        category: 'milestone',
        earnedAt: this.data.sessions[0].startTime,
      })
    }

    // 連続学習
    if (this.data.engagement.streakDays >= 7) {
      achievements.push({
        id: 'week_streak',
        name: '7日間連続学習',
        category: 'consistency',
        earnedAt: new Date().toISOString() as Timestamp,
      })
    }

    // 高得点
    if (this.data.performance.bestScore >= 90) {
      achievements.push({
        id: 'high_scorer',
        name: '優秀な成績',
        category: 'performance',
        earnedAt: new Date().toISOString() as Timestamp,
      })
    }

    // モジュール完了
    const completedCount = this.data.engagement.completedModules.length
    if (completedCount >= 10) {
      achievements.push({
        id: 'module_master',
        name: '10モジュール完了',
        category: 'completion',
        earnedAt: new Date().toISOString() as Timestamp,
      })
    }

    return achievements
  }

  /**
   * データのエクスポート
   */
  exportData(): string {
    const exportData = {
      ...this.data,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * データのリセット
   */
  resetData(): boolean {
    if (confirm('すべての学習データをリセットしてもよろしいですか？')) {
      this.data = this.getDefaultData()
      this.saveData()
      return true
    }
    return false
  }

  /**
   * 現在のセッション取得
   */
  getCurrentSession(): LearningSession | null {
    return this.currentSession
  }

  /**
   * 統計データ取得
   */
  getStatistics(timeRange?: { start: string; end: string }): LearningData {
    // フィルタリング実装は省略
    return this.data
  }

  /**
   * 設定更新
   */
  updateConfig(config: Partial<LearningDataCollectorConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 設定取得
   */
  getConfig(): LearningDataCollectorConfig {
    return { ...this.config }
  }
}

// シングルトンインスタンスの作成
const learningDataCollector = new LearningDataCollector()

export default learningDataCollector
