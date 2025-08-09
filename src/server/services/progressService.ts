/**
 * Progress Service
 * Advanced analytics and progress tracking for learning management
 * 担当: ビジネスロジックエンジニア
 */

import { prisma } from '@/lib/db'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { UserRole, SubscriptionPlan } from '@prisma/client'

// 進捗分析期間の定義
export type AnalysisPeriod = 'week' | 'month' | 'quarter' | 'year' | 'all'

// 学習パフォーマンス指標
export interface LearningMetrics {
  studyTime: {
    total: number
    average: number
    trend: number // 前期比較での変化率
  }
  completion: {
    rate: number
    processesCompleted: number
    totalProcesses: number
  }
  engagement: {
    activeDays: number
    averageSessionLength: number
    streak: {
      current: number
      longest: number
    }
  }
  assessment: {
    averageScore: number
    improvementRate: number
    passRate: number
    totalAttempts: number
  }
}

// 比較分析結果
export interface ProgressComparison {
  user: LearningMetrics
  cohortAverage: LearningMetrics
  percentile: number
  ranking: {
    position: number
    total: number
    category: string
  }
}

// 予測分析結果
export interface LearningPrediction {
  certificationReadiness: {
    score: number // 0-100
    estimatedPassProbability: number
    recommendedStudyHours: number
    weakAreas: string[]
  }
  progressForecast: {
    estimatedCompletionDate: Date
    requiredDailyHours: number
    confidenceInterval: {
      optimistic: Date
      pessimistic: Date
    }
  }
  recommendations: Array<{
    type: 'focus_area' | 'study_schedule' | 'exam_timing'
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    actionItems: string[]
  }>
}

// 進捗分析フィルター
export const progressFilterSchema = z.object({
  period: z.enum(['week', 'month', 'quarter', 'year', 'all']).default('month'),
  knowledgeAreas: z.array(z.string()).optional(),
  processGroups: z.array(z.string()).optional(),
  compareWith: z.enum(['previous_period', 'cohort', 'target']).optional(),
  includeInactive: z.boolean().default(false),
})

export type ProgressFilter = z.infer<typeof progressFilterSchema>

// 進捗サービスクラス
export class ProgressService {
  // 期間の日付範囲を取得
  private static getDateRange(period: AnalysisPeriod): { start: Date; end: Date; previousStart: Date; previousEnd: Date } {
    const now = new Date()
    const end = new Date(now)
    let start: Date
    let previousStart: Date
    let previousEnd: Date

    switch (period) {
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        previousStart = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000)
        previousEnd = new Date(start)
        break
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        previousEnd = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3)
        start = new Date(now.getFullYear(), quarter * 3, 1)
        previousStart = new Date(now.getFullYear(), (quarter - 1) * 3, 1)
        previousEnd = new Date(now.getFullYear(), quarter * 3, 0)
        break
      case 'year':
        start = new Date(now.getFullYear(), 0, 1)
        previousStart = new Date(now.getFullYear() - 1, 0, 1)
        previousEnd = new Date(now.getFullYear() - 1, 11, 31)
        break
      case 'all':
      default:
        start = new Date('2020-01-01')
        previousStart = new Date('2020-01-01')
        previousEnd = new Date('2020-12-31')
        break
    }

    return { start, end, previousStart, previousEnd }
  }

  // 個人の学習メトリクス計算
  static async calculateUserMetrics(
    userId: string,
    period: AnalysisPeriod = 'month'
  ): Promise<LearningMetrics> {
    try {
      const { start, end, previousStart, previousEnd } = this.getDateRange(period)

      // 現在期間のデータ取得
      const [studySessions, examResults, progress] = await Promise.all([
        prisma.studySession.findMany({
          where: {
            userId,
            createdAt: { gte: start, lte: end },
          },
        }),
        prisma.examResult.findMany({
          where: {
            userId,
            completedAt: { gte: start, lte: end },
          },
        }),
        prisma.learningProgress.findUnique({
          where: { userId },
        }),
      ])

      // 前期間のデータ取得（比較用）
      const [previousStudySessions, previousExamResults] = await Promise.all([
        prisma.studySession.findMany({
          where: {
            userId,
            createdAt: { gte: previousStart, lte: previousEnd },
          },
        }),
        prisma.examResult.findMany({
          where: {
            userId,
            completedAt: { gte: previousStart, lte: previousEnd },
          },
        }),
      ])

      // 学習時間メトリクス
      const totalStudyTime = studySessions.reduce((sum, session) => sum + session.duration, 0)
      const previousTotalStudyTime = previousStudySessions.reduce((sum, session) => sum + session.duration, 0)
      
      const averageStudyTime = studySessions.length > 0 ? totalStudyTime / studySessions.length : 0
      const studyTimeTrend = previousTotalStudyTime > 0 
        ? ((totalStudyTime - previousTotalStudyTime) / previousTotalStudyTime) * 100 
        : 0

      // 完了メトリクス
      const completedProcesses = progress?.completedProcesses as string[] || []
      const completionRate = (completedProcesses.length / 49) * 100 // 49 PMBOK processes

      // エンゲージメントメトリクス
      const uniqueDays = new Set(studySessions.map(s => 
        s.createdAt.toISOString().split('T')[0]
      )).size

      const averageSessionLength = studySessions.length > 0 
        ? totalStudyTime / studySessions.length 
        : 0

      // 評価メトリクス
      const averageScore = examResults.length > 0 
        ? examResults.reduce((sum, exam) => sum + exam.score, 0) / examResults.length 
        : 0

      const previousAverageScore = previousExamResults.length > 0 
        ? previousExamResults.reduce((sum, exam) => sum + exam.score, 0) / previousExamResults.length 
        : 0

      const improvementRate = previousAverageScore > 0 
        ? ((averageScore - previousAverageScore) / previousAverageScore) * 100 
        : 0

      const passedExams = examResults.filter(exam => exam.passed).length
      const passRate = examResults.length > 0 ? (passedExams / examResults.length) * 100 : 0

      return {
        studyTime: {
          total: Math.round(totalStudyTime / 3600 * 10) / 10, // 時間単位、小数点1位
          average: Math.round(averageStudyTime / 3600 * 10) / 10,
          trend: Math.round(studyTimeTrend * 10) / 10,
        },
        completion: {
          rate: Math.round(completionRate * 10) / 10,
          processesCompleted: completedProcesses.length,
          totalProcesses: 49,
        },
        engagement: {
          activeDays: uniqueDays,
          averageSessionLength: Math.round(averageSessionLength / 60), // 分単位
          streak: {
            current: progress?.currentStreak || 0,
            longest: progress?.longestStreak || 0,
          },
        },
        assessment: {
          averageScore: Math.round(averageScore * 10) / 10,
          improvementRate: Math.round(improvementRate * 10) / 10,
          passRate: Math.round(passRate * 10) / 10,
          totalAttempts: examResults.length,
        },
      }
    } catch (error) {
      console.error('ユーザーメトリクス計算エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'メトリクス計算中にエラーが発生しました',
      })
    }
  }

  // コホート比較分析
  static async compareWithCohort(
    userId: string,
    period: AnalysisPeriod = 'month'
  ): Promise<ProgressComparison> {
    try {
      // ユーザー情報取得
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionPlan: true, createdAt: true },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'ユーザーが見つかりません',
        })
      }

      // 同じサブスクリプションプランのユーザーを対象とする
      const cohortUsers = await prisma.user.findMany({
        where: {
          subscriptionPlan: user.subscriptionPlan,
          deletedAt: null,
          id: { not: userId },
        },
        select: { id: true },
      })

      // ユーザーのメトリクス
      const userMetrics = await this.calculateUserMetrics(userId, period)

      // コホートのメトリクス計算
      const cohortMetricsPromises = cohortUsers.map(cohortUser => 
        this.calculateUserMetrics(cohortUser.id, period)
      )
      
      const cohortMetrics = await Promise.allSettled(cohortMetricsPromises)
      const successfulMetrics = cohortMetrics
        .filter((result): result is PromiseFulfilledResult<LearningMetrics> => 
          result.status === 'fulfilled')
        .map(result => result.value)

      if (successfulMetrics.length === 0) {
        // コホートデータがない場合は、ユーザーメトリクスのみ返す
        return {
          user: userMetrics,
          cohortAverage: userMetrics,
          percentile: 50,
          ranking: {
            position: 1,
            total: 1,
            category: user.subscriptionPlan,
          },
        }
      }

      // コホート平均計算
      const cohortAverage: LearningMetrics = {
        studyTime: {
          total: successfulMetrics.reduce((sum, m) => sum + m.studyTime.total, 0) / successfulMetrics.length,
          average: successfulMetrics.reduce((sum, m) => sum + m.studyTime.average, 0) / successfulMetrics.length,
          trend: successfulMetrics.reduce((sum, m) => sum + m.studyTime.trend, 0) / successfulMetrics.length,
        },
        completion: {
          rate: successfulMetrics.reduce((sum, m) => sum + m.completion.rate, 0) / successfulMetrics.length,
          processesCompleted: Math.round(successfulMetrics.reduce((sum, m) => sum + m.completion.processesCompleted, 0) / successfulMetrics.length),
          totalProcesses: 49,
        },
        engagement: {
          activeDays: Math.round(successfulMetrics.reduce((sum, m) => sum + m.engagement.activeDays, 0) / successfulMetrics.length),
          averageSessionLength: Math.round(successfulMetrics.reduce((sum, m) => sum + m.engagement.averageSessionLength, 0) / successfulMetrics.length),
          streak: {
            current: Math.round(successfulMetrics.reduce((sum, m) => sum + m.engagement.streak.current, 0) / successfulMetrics.length),
            longest: Math.round(successfulMetrics.reduce((sum, m) => sum + m.engagement.streak.longest, 0) / successfulMetrics.length),
          },
        },
        assessment: {
          averageScore: successfulMetrics.reduce((sum, m) => sum + m.assessment.averageScore, 0) / successfulMetrics.length,
          improvementRate: successfulMetrics.reduce((sum, m) => sum + m.assessment.improvementRate, 0) / successfulMetrics.length,
          passRate: successfulMetrics.reduce((sum, m) => sum + m.assessment.passRate, 0) / successfulMetrics.length,
          totalAttempts: Math.round(successfulMetrics.reduce((sum, m) => sum + m.assessment.totalAttempts, 0) / successfulMetrics.length),
        },
      }

      // パーセンタイル計算（学習時間基準）
      const userTotalTime = userMetrics.studyTime.total
      const betterCount = successfulMetrics.filter(m => m.studyTime.total < userTotalTime).length
      const percentile = Math.round((betterCount / successfulMetrics.length) * 100)

      // ランキング計算
      const sortedMetrics = successfulMetrics.sort((a, b) => b.studyTime.total - a.studyTime.total)
      const userRanking = sortedMetrics.findIndex(m => m.studyTime.total <= userTotalTime) + 1

      return {
        user: userMetrics,
        cohortAverage,
        percentile,
        ranking: {
          position: userRanking,
          total: successfulMetrics.length + 1,
          category: user.subscriptionPlan,
        },
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('コホート比較分析エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'コホート比較分析中にエラーが発生しました',
      })
    }
  }

  // 予測分析
  static async generatePredictions(userId: string): Promise<LearningPrediction> {
    try {
      const [progress, recentSessions, examResults] = await Promise.all([
        prisma.learningProgress.findUnique({
          where: { userId },
        }),
        prisma.studySession.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        prisma.examResult.findMany({
          where: { userId },
          orderBy: { completedAt: 'desc' },
        }),
      ])

      if (!progress) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '学習進捗が見つかりません',
        })
      }

      // 現在の進捗状況分析
      const completedProcesses = progress.completedProcesses as string[]
      const completionRate = (completedProcesses.length / 49) * 100
      const averageScore = examResults.length > 0 
        ? examResults.reduce((sum, exam) => sum + exam.score, 0) / examResults.length 
        : 0

      // 学習ペース分析
      const dailyAverageTime = recentSessions.length > 0
        ? recentSessions.reduce((sum, session) => sum + session.duration, 0) / recentSessions.length
        : 1800 // デフォルト30分

      // 認定準備度スコア計算
      const readinessFactors = {
        completion: Math.min(completionRate / 100, 1) * 30, // 30%
        performance: Math.min(averageScore / 100, 1) * 40, // 40%
        consistency: Math.min(progress.currentStreak / 30, 1) * 20, // 20%
        recentActivity: recentSessions.length > 10 ? 10 : (recentSessions.length / 10) * 10, // 10%
      }

      const readinessScore = Math.round(Object.values(readinessFactors).reduce((sum, score) => sum + score, 0))

      // 合格予測確率（ロジスティック回帰風の計算）
      const passProb = Math.min(
        0.1 + (readinessScore / 100) * 0.8 + (averageScore / 100) * 0.1,
        0.95
      )

      // 弱点エリア特定
      const knowledgeAreaStats: Record<string, number> = {}
      examResults.forEach(exam => {
        if (exam.knowledgeAreaScores) {
          Object.entries(exam.knowledgeAreaScores as any).forEach(([area, score]) => {
            knowledgeAreaStats[area] = (knowledgeAreaStats[area] || 0) + (score as number)
          })
        }
      })

      const weakAreas = Object.entries(knowledgeAreaStats)
        .map(([area, totalScore]) => ({
          area,
          averageScore: totalScore / examResults.length,
        }))
        .filter(item => item.averageScore < 70)
        .sort((a, b) => a.averageScore - b.averageScore)
        .slice(0, 3)
        .map(item => item.area)

      // 完了予測日計算
      const remainingProcesses = 49 - completedProcesses.length
      const currentPace = recentSessions.length > 0
        ? recentSessions.length / 30 // 直近30セッションから日平均を計算
        : 0.5

      const daysToComplete = remainingProcesses / Math.max(currentPace, 0.1)
      const estimatedCompletionDate = new Date(Date.now() + daysToComplete * 24 * 60 * 60 * 1000)

      // 信頼区間
      const optimisticDate = new Date(Date.now() + (daysToComplete * 0.7) * 24 * 60 * 60 * 1000)
      const pessimisticDate = new Date(Date.now() + (daysToComplete * 1.5) * 24 * 60 * 60 * 1000)

      // 推奨学習時間
      const recommendedStudyHours = Math.max(
        Math.round((100 - readinessScore) * 2), // 準備度に基づく
        20 // 最低20時間
      )

      // 必要な日次学習時間
      const requiredDailyHours = Math.max(
        recommendedStudyHours / Math.max(daysToComplete, 1),
        0.5
      )

      // 推奨事項生成
      const recommendations = this.generateRecommendations(
        readinessScore,
        weakAreas,
        completionRate,
        averageScore,
        progress.currentStreak
      )

      return {
        certificationReadiness: {
          score: readinessScore,
          estimatedPassProbability: Math.round(passProb * 100) / 100,
          recommendedStudyHours,
          weakAreas,
        },
        progressForecast: {
          estimatedCompletionDate,
          requiredDailyHours: Math.round(requiredDailyHours * 10) / 10,
          confidenceInterval: {
            optimistic: optimisticDate,
            pessimistic: pessimisticDate,
          },
        },
        recommendations,
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('予測分析エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '予測分析中にエラーが発生しました',
      })
    }
  }

  // 推奨事項生成
  private static generateRecommendations(
    readinessScore: number,
    weakAreas: string[],
    completionRate: number,
    averageScore: number,
    currentStreak: number
  ): Array<{
    type: 'focus_area' | 'study_schedule' | 'exam_timing'
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    actionItems: string[]
  }> {
    const recommendations = []

    // 弱点エリアの改善
    if (weakAreas.length > 0) {
      recommendations.push({
        type: 'focus_area' as const,
        priority: 'high' as const,
        title: '弱点エリアの集中学習',
        description: `${weakAreas.join(', ')}の知識エリアでスコアが低く、重点的な学習が必要です。`,
        actionItems: [
          '該当エリアのPMBOKガイドを精読する',
          '弱点エリアに特化した模擬問題を解く',
          '理解が不十分な概念をノートにまとめる',
        ],
      })
    }

    // 学習ペースの調整
    if (completionRate < 50) {
      recommendations.push({
        type: 'study_schedule' as const,
        priority: 'high' as const,
        title: '学習ペースの向上',
        description: 'プロセス完了率が50%未満です。学習ペースを上げる必要があります。',
        actionItems: [
          '毎日最低1時間の学習時間を確保する',
          '未完了プロセスを優先的に学習する',
          '学習スケジュールを見直し、無理のない計画を立てる',
        ],
      })
    }

    // 一貫性の改善
    if (currentStreak < 7) {
      recommendations.push({
        type: 'study_schedule' as const,
        priority: 'medium' as const,
        title: '学習の継続性向上',
        description: '学習の連続性を保つことで、記憶の定着と理解度向上を図りましょう。',
        actionItems: [
          '毎日決まった時間に学習する習慣をつける',
          '短時間でも継続することを優先する',
          '学習リマインダーを設定する',
        ],
      })
    }

    // 試験対策
    if (averageScore < 75 && readinessScore > 60) {
      recommendations.push({
        type: 'exam_timing' as const,
        priority: 'medium' as const,
        title: '模擬試験の増加',
        description: '知識は身についていますが、試験での得点力を向上させる必要があります。',
        actionItems: [
          '週2-3回の模擬試験を実施する',
          '間違えた問題の解説を必ず確認する',
          '時間配分を意識した試験練習を行う',
        ],
      })
    }

    // 受験タイミング
    if (readinessScore >= 80) {
      recommendations.push({
        type: 'exam_timing' as const,
        priority: 'low' as const,
        title: '受験準備完了',
        description: '認定試験を受験する準備が整っています。',
        actionItems: [
          '最終確認として模擬試験を受験する',
          '受験日程を予約する',
          '当日の持ち物と注意事項を確認する',
        ],
      })
    }

    return recommendations
  }

  // 進捗サマリー取得
  static async getProgressSummary(userId: string): Promise<{
    overview: LearningMetrics
    trends: {
      period: AnalysisPeriod
      data: Array<{
        date: string
        studyTime: number
        sessionsCount: number
        averageScore: number
      }>
    }
    achievements: Array<{
      type: string
      title: string
      description: string
      earnedAt: Date
    }>
  }> {
    try {
      const overview = await this.calculateUserMetrics(userId)
      
      // 過去30日のトレンドデータ
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const sessions = await prisma.studySession.findMany({
        where: {
          userId,
          createdAt: { gte: thirtyDaysAgo },
        },
        orderBy: { createdAt: 'asc' },
      })

      const examResults = await prisma.examResult.findMany({
        where: {
          userId,
          completedAt: { gte: thirtyDaysAgo },
        },
        orderBy: { completedAt: 'asc' },
      })

      // 日別データ集計
      const dailyData: Record<string, { studyTime: number; sessionsCount: number; scores: number[] }> = {}

      sessions.forEach(session => {
        const date = session.createdAt.toISOString().split('T')[0]
        if (!dailyData[date]) {
          dailyData[date] = { studyTime: 0, sessionsCount: 0, scores: [] }
        }
        dailyData[date].studyTime += session.duration
        dailyData[date].sessionsCount += 1
      })

      examResults.forEach(exam => {
        const date = exam.completedAt.toISOString().split('T')[0]
        if (dailyData[date]) {
          dailyData[date].scores.push(exam.score)
        }
      })

      const trends = Object.entries(dailyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => ({
          date,
          studyTime: Math.round(data.studyTime / 3600 * 10) / 10,
          sessionsCount: data.sessionsCount,
          averageScore: data.scores.length > 0 
            ? Math.round(data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length)
            : 0,
        }))

      // 実績・バッジ（簡易版）
      const achievements = []
      if (overview.engagement.streak.current >= 7) {
        achievements.push({
          type: 'streak',
          title: '1週間連続学習',
          description: '7日間連続で学習を継続しました',
          earnedAt: new Date(),
        })
      }

      if (overview.completion.processesCompleted >= 25) {
        achievements.push({
          type: 'completion',
          title: 'ハーフウェイ達成',
          description: 'PMBOKプロセスの半分を完了しました',
          earnedAt: new Date(),
        })
      }

      return {
        overview,
        trends: {
          period: 'month',
          data: trends,
        },
        achievements,
      }
    } catch (error) {
      console.error('進捗サマリー取得エラー:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '進捗サマリー取得中にエラーが発生しました',
      })
    }
  }
}

export default ProgressService