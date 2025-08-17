/**
 * 学習データ収集・分析サービス
 * ユーザーの学習進捗、効果、パフォーマンスを測定し、最適な学習体験を提供
 */

class LearningDataCollector {
  constructor() {
    this.storageKey = 'pmp-learning-data'
    this.sessionKey = 'pmp-session-data'
    this.data = this.loadData()
    this.currentSession = this.initSession()
    this.metricsBuffer = []
    this.flushInterval = 30000 // 30秒ごとにデータを保存

    this.startAutoSave()
  }

  /**
   * データの読み込み
   */
  loadData() {
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
  getDefaultData() {
    return {
      userId: this.generateUserId(),
      startDate: new Date().toISOString(),
      sessions: [],
      progress: {
        overall: 0,
        knowledgeAreas: {},
        processGroups: {},
        topics: {},
      },
      performance: {
        quizScores: [],
        examScores: [],
        averageScore: 0,
        bestScore: 0,
        totalQuestions: 0,
        correctAnswers: 0,
      },
      engagement: {
        totalTime: 0,
        dailyTime: {},
        streakDays: 0,
        lastActiveDate: null,
        completedModules: [],
        favoriteTopics: [],
      },
      effectiveness: {
        learningRate: 0,
        retentionRate: 0,
        improvementRate: 0,
        masteredTopics: [],
        weakAreas: [],
      },
    }
  }

  /**
   * ユーザーIDの生成
   */
  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  /**
   * セッションの初期化
   */
  initSession() {
    const session = {
      id: 'session_' + Date.now(),
      startTime: new Date().toISOString(),
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
  startAutoSave() {
    setInterval(() => {
      this.flushMetrics()
      this.saveData()
    }, this.flushInterval)

    // ページ離脱時にも保存
    window.addEventListener('beforeunload', () => {
      this.endSession()
      this.saveData()
    })
  }

  /**
   * データの保存
   */
  saveData() {
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
  trackEvent(eventType, eventData = {}) {
    const event = {
      type: eventType,
      timestamp: new Date().toISOString(),
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
  processEvent(event) {
    switch (event.type) {
      case 'page_view':
        this.trackPageView(event.data)
        break
      case 'quiz_complete':
        this.trackQuizCompletion(event.data)
        break
      case 'module_complete':
        this.trackModuleCompletion(event.data)
        break
      case 'interaction':
        this.trackInteraction(event.data)
        break
      case 'time_spent':
        this.trackTimeSpent(event.data)
        break
    }
  }

  /**
   * ページビューのトラッキング
   */
  trackPageView(data) {
    this.currentSession.pagesViewed.push({
      page: data.page,
      timestamp: new Date().toISOString(),
      duration: data.duration || 0,
    })
  }

  /**
   * クイズ完了のトラッキング
   */
  trackQuizCompletion(data) {
    const score = {
      quizId: data.quizId,
      score: data.score,
      totalQuestions: data.totalQuestions,
      correctAnswers: data.correctAnswers,
      timestamp: new Date().toISOString(),
      timeSpent: data.timeSpent,
    }

    this.currentSession.scores.push(score)
    this.data.performance.quizScores.push(score)

    // パフォーマンス統計の更新
    this.updatePerformanceStats(score)
  }

  /**
   * モジュール完了のトラッキング
   */
  trackModuleCompletion(data) {
    const module = {
      moduleId: data.moduleId,
      moduleName: data.moduleName,
      completionTime: new Date().toISOString(),
      score: data.score || null,
      timeSpent: data.timeSpent,
    }

    this.data.engagement.completedModules.push(module)

    // 進捗の更新
    this.updateProgress(data)
  }

  /**
   * インタラクションのトラッキング
   */
  trackInteraction(data) {
    this.currentSession.interactions.push({
      type: data.type,
      target: data.target,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * 学習時間のトラッキング
   */
  trackTimeSpent(data) {
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
  updatePerformanceStats(score) {
    this.data.performance.totalQuestions += score.totalQuestions
    this.data.performance.correctAnswers += score.correctAnswers

    // 平均スコアの再計算
    const allScores = this.data.performance.quizScores.map((s) => s.score)
    this.data.performance.averageScore = allScores.reduce((a, b) => a + b, 0) / allScores.length

    // 最高スコアの更新
    this.data.performance.bestScore = Math.max(this.data.performance.bestScore, score.score)
  }

  /**
   * 進捗の更新
   */
  updateProgress(moduleData) {
    // 知識エリアの進捗
    if (moduleData.knowledgeArea) {
      if (!this.data.progress.knowledgeAreas[moduleData.knowledgeArea]) {
        this.data.progress.knowledgeAreas[moduleData.knowledgeArea] = 0
      }
      this.data.progress.knowledgeAreas[moduleData.knowledgeArea] +=
        moduleData.progressIncrement || 10
    }

    // 全体進捗の再計算
    this.calculateOverallProgress()
  }

  /**
   * 全体進捗の計算
   */
  calculateOverallProgress() {
    const areas = Object.values(this.data.progress.knowledgeAreas)
    if (areas.length > 0) {
      this.data.progress.overall = areas.reduce((a, b) => a + b, 0) / areas.length
    }
  }

  /**
   * 学習効果の計算
   */
  calculateLearningEffectiveness() {
    const recentScores = this.data.performance.quizScores.slice(-10)
    const olderScores = this.data.performance.quizScores.slice(-20, -10)

    if (recentScores.length === 0 || olderScores.length === 0) {
      return 0
    }

    const recentAvg = recentScores.reduce((a, b) => a + b.score, 0) / recentScores.length
    const olderAvg = olderScores.reduce((a, b) => a + b.score, 0) / olderScores.length

    // 改善率の計算
    const improvementRate = ((recentAvg - olderAvg) / olderAvg) * 100

    // 学習率の計算（正答率の向上度）
    const learningRate =
      (this.data.performance.correctAnswers / this.data.performance.totalQuestions) * 100

    // 継続率の計算（連続学習日数）
    const retentionRate = this.calculateRetentionRate()

    this.data.effectiveness = {
      learningRate,
      retentionRate,
      improvementRate,
      masteredTopics: this.identifyMasteredTopics(),
      weakAreas: this.identifyWeakAreas(),
    }

    // 総合的な学習効果スコア（0-100）
    const effectivenessScore =
      learningRate * 0.4 + retentionRate * 0.3 + Math.max(0, improvementRate) * 0.3

    return Math.min(100, Math.max(0, effectivenessScore))
  }

  /**
   * 定着率の計算
   */
  calculateRetentionRate() {
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
    return (consecutiveDays / 30) * 100
  }

  /**
   * 習得済みトピックの特定
   */
  identifyMasteredTopics() {
    const mastered = []

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
  identifyWeakAreas() {
    const weak = []

    // クイズスコアからトピック別の弱点を分析
    const topicScores = {}

    this.data.performance.quizScores.forEach((quiz) => {
      if (quiz.topic) {
        if (!topicScores[quiz.topic]) {
          topicScores[quiz.topic] = []
        }
        topicScores[quiz.topic].push(quiz.score)
      }
    })

    Object.entries(topicScores).forEach(([topic, scores]) => {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
      if (avgScore < 70) {
        weak.push({
          topic,
          averageScore: avgScore,
          attempts: scores.length,
        })
      }
    })

    return weak
  }

  /**
   * 学習レコメンデーションの生成
   */
  generateRecommendations() {
    const recommendations = []
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
  endSession() {
    if (this.currentSession) {
      this.currentSession.endTime = new Date().toISOString()
      this.currentSession.duration =
        new Date(this.currentSession.endTime) - new Date(this.currentSession.startTime)

      this.data.sessions.push(this.currentSession)

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
  updateStreak() {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (this.data.engagement.lastActiveDate === yesterdayStr) {
      this.data.engagement.streakDays++
    } else if (this.data.engagement.lastActiveDate !== today) {
      this.data.engagement.streakDays = 1
    }

    this.data.engagement.lastActiveDate = today
  }

  /**
   * メトリクスのフラッシュ
   */
  flushMetrics() {
    if (this.metricsBuffer.length > 0) {
      // バッファに溜まったメトリクスを処理
      this.processBufferedMetrics()
      this.metricsBuffer = []
    }
  }

  /**
   * バッファされたメトリクスの処理
   */
  processBufferedMetrics() {
    // 集計処理などを実行
    const summary = {
      eventCount: this.metricsBuffer.length,
      types: {},
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
  getDashboardData() {
    return {
      progress: this.data.progress,
      performance: this.data.performance,
      engagement: this.data.engagement,
      effectiveness: {
        ...this.data.effectiveness,
        score: this.calculateLearningEffectiveness(),
      },
      recommendations: this.generateRecommendations(),
    }
  }

  /**
   * レポートの生成
   */
  generateReport(period = 'week') {
    const report = {
      period,
      generatedAt: new Date().toISOString(),
      summary: {
        totalTime: this.data.engagement.totalTime,
        sessionsCount: this.data.sessions.length,
        averageSessionDuration: this.calculateAverageSessionDuration(),
        overallProgress: this.data.progress.overall,
        effectivenessScore: this.calculateLearningEffectiveness(),
      },
      details: {
        topPerformingAreas: this.getTopPerformingAreas(),
        improvementAreas: this.identifyWeakAreas(),
        learningTrends: this.analyzeLearningTrends(),
        achievements: this.getAchievements(),
      },
    }

    return report
  }

  /**
   * 平均セッション時間の計算
   */
  calculateAverageSessionDuration() {
    if (this.data.sessions.length === 0) {
      return 0
    }

    const totalDuration = this.data.sessions.reduce(
      (total, session) => total + (session.duration || 0),
      0
    )

    return totalDuration / this.data.sessions.length
  }

  /**
   * トップパフォーマンスエリアの取得
   */
  getTopPerformingAreas() {
    const areas = []

    Object.entries(this.data.progress.knowledgeAreas).forEach(([area, progress]) => {
      if (progress >= 80) {
        areas.push({ area, progress })
      }
    })

    return areas.sort((a, b) => b.progress - a.progress)
  }

  /**
   * 学習トレンドの分析
   */
  analyzeLearningTrends() {
    const recentScores = this.data.performance.quizScores.slice(-20)

    if (recentScores.length < 2) {
      return { trend: 'insufficient_data' }
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
    }
  }

  /**
   * トレンドの解釈
   */
  interpretTrend(slope) {
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
   * 達成項目の取得
   */
  getAchievements() {
    const achievements = []

    // 初回学習
    if (this.data.sessions.length >= 1) {
      achievements.push({
        id: 'first_session',
        name: '学習開始',
        earnedAt: this.data.sessions[0].startTime,
      })
    }

    // 連続学習
    if (this.data.engagement.streakDays >= 7) {
      achievements.push({
        id: 'week_streak',
        name: '7日間連続学習',
        earnedAt: new Date().toISOString(),
      })
    }

    // 高得点
    if (this.data.performance.bestScore >= 90) {
      achievements.push({
        id: 'high_scorer',
        name: '優秀な成績',
        earnedAt: new Date().toISOString(),
      })
    }

    // モジュール完了
    const completedCount = this.data.engagement.completedModules.length
    if (completedCount >= 10) {
      achievements.push({
        id: 'module_master',
        name: '10モジュール完了',
        earnedAt: new Date().toISOString(),
      })
    }

    return achievements
  }

  /**
   * データのエクスポート
   */
  exportData() {
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
  resetData() {
    if (confirm('すべての学習データをリセットしてもよろしいですか？')) {
      this.data = this.getDefaultData()
      this.saveData()
      return true
    }
    return false
  }
}

// シングルトンインスタンスの作成
const learningDataCollector = new LearningDataCollector()

export default learningDataCollector
