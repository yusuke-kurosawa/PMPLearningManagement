/**
 * Learning Service
 * Business logic for learning progress management and analytics
 * 担当: ビジネスロジックエンジニア, API・データエンジニア
 */

import { prisma } from '@/lib/db'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { LearningProgress, ExamResult, StudySession } from '@prisma/client'
import { logger } from '../../services/logger'

// Knowledge Area Scores type
type KnowledgeAreaScores = Record<string, number>

// Process Group Scores type
type ProcessGroupScores = Record<string, number>

// 学習進捗データ型定義
export interface LearningProgressWithStats extends LearningProgress {
  stats: {
    completionRate: number
    averageScore: number
    studyStreak: number
    weeklyHours: number
    monthlyHours: number
    totalExams: number
    passedExams: number
    knowledgeAreas: Record<
      string,
      {
        completed: number
        total: number
        averageScore: number
      }
    >
    processGroups: Record<
      string,
      {
        completed: number
        total: number
        averageScore: number
      }
    >
  }
}

// 学習セッション記録用スキーマ
export const studySessionSchema = z.object({
  processId: z.string().min(1),
  processName: z.string().min(1),
  knowledgeArea: z.string().min(1),
  processGroup: z.string().min(1),
  duration: z.number().min(1).max(7200), // 最大2時間
  itemsStudied: z.array(z.string()).optional().default([]),
  completed: z.boolean().optional().default(false),
  notes: z.string().max(1000).optional(),
})

export type StudySessionData = z.infer<typeof studySessionSchema>

// 学習目標設定用スキーマ
export const learningGoalSchema = z.object({
  type: z.enum(['daily_time', 'weekly_time', 'process_completion', 'exam_score']),
  target: z.number().min(1),
  deadline: z.date().optional(),
  description: z.string().max(200).optional(),
})

export type LearningGoalData = z.infer<typeof learningGoalSchema>

// PMBOKプロセス定義
export const PMBOK_PROCESSES = {
  knowledgeAreas: [
    'Integration',
    'Scope',
    'Schedule',
    'Cost',
    'Quality',
    'Resource',
    'Communications',
    'Risk',
    'Procurement',
    'Stakeholder',
  ],
  processGroups: ['Initiating', 'Planning', 'Executing', 'Monitoring and Controlling', 'Closing'],
  totalProcesses: 49,
}

// 学習統計計算ヘルパー
export class LearningStatsCalculator {
  static calculateCompletionRate(completedProcesses: string[]): number {
    return Math.round((completedProcesses.length / PMBOK_PROCESSES.totalProcesses) * 100)
  }

  static calculateWeeklyHours(sessions: StudySession[]): number {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return (
      sessions
        .filter((session) => session.createdAt >= oneWeekAgo)
        .reduce((total, session) => total + (session.duration || 0), 0) / 3600
    ) // 秒を時間に変換
  }

  static calculateMonthlyHours(sessions: StudySession[]): number {
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return (
      sessions
        .filter((session) => session.createdAt >= oneMonthAgo)
        .reduce((total, session) => total + (session.duration || 0), 0) / 3600
    )
  }

  static calculateKnowledgeAreaStats(
    sessions: StudySession[],
    examResults: ExamResult[]
  ): Record<string, { completed: number; total: number; averageScore: number }> {
    const stats: Record<string, { completed: number; total: number; averageScore: number }> = {}

    PMBOK_PROCESSES.knowledgeAreas.forEach((area) => {
      const areaSessions = sessions.filter((s) => s.knowledgeArea === area)
      const areaExams = examResults.filter(
        (e) =>
          e.knowledgeAreaScores &&
          (e.knowledgeAreaScores as KnowledgeAreaScores)[area] !== undefined
      )

      stats[area] = {
        completed: areaSessions.filter((s) => s.completed).length,
        total: Math.ceil(PMBOK_PROCESSES.totalProcesses / PMBOK_PROCESSES.knowledgeAreas.length),
        averageScore:
          areaExams.length > 0
            ? areaExams.reduce(
                (sum, exam) => sum + ((exam.knowledgeAreaScores as KnowledgeAreaScores)[area] || 0),
                0
              ) / areaExams.length
            : 0,
      }
    })

    return stats
  }

  static calculateProcessGroupStats(
    sessions: StudySession[],
    examResults: ExamResult[]
  ): Record<string, { completed: number; total: number; averageScore: number }> {
    const stats: Record<string, { completed: number; total: number; averageScore: number }> = {}

    PMBOK_PROCESSES.processGroups.forEach((group) => {
      const groupSessions = sessions.filter((s) => s.processGroup === group)
      const groupExams = examResults.filter(
        (e) =>
          e.processGroupScores && (e.processGroupScores as ProcessGroupScores)[group] !== undefined
      )

      stats[group] = {
        completed: groupSessions.filter((s) => s.completed).length,
        total: Math.ceil(PMBOK_PROCESSES.totalProcesses / PMBOK_PROCESSES.processGroups.length),
        averageScore:
          groupExams.length > 0
            ? groupExams.reduce(
                (sum, exam) => sum + ((exam.processGroupScores as ProcessGroupScores)[group] || 0),
                0
              ) / groupExams.length
            : 0,
      }
    })

    return stats
  }
}

// 学習サービスクラス
export class LearningService {
  // 学習進捗取得（詳細統計付き）
  static async getLearningProgress(userId: string): Promise<LearningProgressWithStats> {
    try {
      const [progress, sessions, examResults] = await Promise.all([
        prisma.learningProgress.findUnique({
          where: { userId },
        }),
        prisma.studySession.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.examResult.findMany({
          where: { userId },
          orderBy: { completedAt: 'desc' },
        }),
      ])

      if (!progress) {
        // 学習進捗が存在しない場合は作成
        const newProgress = await prisma.learningProgress.create({
          data: {
            userId,
            totalStudyTime: 0,
            completedProcesses: [],
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: new Date(),
          },
        })

        return {
          ...newProgress,
          stats: {
            completionRate: 0,
            averageScore: 0,
            studyStreak: 0,
            weeklyHours: 0,
            monthlyHours: 0,
            totalExams: 0,
            passedExams: 0,
            knowledgeAreas: LearningStatsCalculator.calculateKnowledgeAreaStats([], []),
            processGroups: LearningStatsCalculator.calculateProcessGroupStats([], []),
          },
        }
      }

      // 統計計算
      const completionRate = LearningStatsCalculator.calculateCompletionRate(
        progress.completedProcesses as string[]
      )

      const averageScore =
        examResults.length > 0
          ? examResults.reduce((sum, exam) => sum + exam.score, 0) / examResults.length
          : 0

      const passedExams = examResults.filter((exam) => exam.passed).length

      const weeklyHours = LearningStatsCalculator.calculateWeeklyHours(sessions)
      const monthlyHours = LearningStatsCalculator.calculateMonthlyHours(sessions)

      const knowledgeAreas = LearningStatsCalculator.calculateKnowledgeAreaStats(
        sessions,
        examResults
      )

      const processGroups = LearningStatsCalculator.calculateProcessGroupStats(
        sessions,
        examResults
      )

      return {
        ...progress,
        stats: {
          completionRate: Math.round(completionRate),
          averageScore: Math.round(averageScore),
          studyStreak: progress.currentStreak,
          weeklyHours: Math.round(weeklyHours * 10) / 10, // 小数点1位まで
          monthlyHours: Math.round(monthlyHours * 10) / 10,
          totalExams: examResults.length,
          passedExams,
          knowledgeAreas,
          processGroups,
        },
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('学習進捗取得エラー:', error)
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '学習進捗の取得中にエラーが発生しました',
      })
    }
  }

  // 学習セッション記録
  static async recordStudySession(
    userId: string,
    sessionData: StudySessionData
  ): Promise<StudySession> {
    try {
      return await prisma.$transaction(async (tx) => {
        // 学習セッション作成
        const session = await tx.studySession.create({
          data: {
            userId,
            processId: sessionData.processId,
            processName: sessionData.processName,
            knowledgeArea: sessionData.knowledgeArea,
            processGroup: sessionData.processGroup,
            duration: sessionData.duration,
            itemsStudied: sessionData.itemsStudied,
            completed: sessionData.completed,
            notes: sessionData.notes,
          },
        })

        // 学習進捗更新
        const progress = await tx.learningProgress.findUnique({
          where: { userId },
        })

        if (!progress) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '学習進捗が見つかりません',
          })
        }

        const completedProcesses = progress.completedProcesses as string[]
        const updatedCompletedProcesses = [...completedProcesses]

        // プロセス完了の場合、完了リストに追加
        if (sessionData.completed && !completedProcesses.includes(sessionData.processId)) {
          updatedCompletedProcesses.push(sessionData.processId)
        }

        // ストリーク計算
        const today = new Date()
        const lastActivity = progress.lastActivityDate
        const isConsecutiveDay =
          lastActivity && Math.abs(today.getTime() - lastActivity.getTime()) <= 24 * 60 * 60 * 1000

        const newStreak = isConsecutiveDay ? progress.currentStreak + 1 : 1
        const longestStreak = Math.max(progress.longestStreak, newStreak)

        // 学習進捗更新
        await tx.learningProgress.update({
          where: { userId },
          data: {
            totalStudyTime: progress.totalStudyTime + sessionData.duration,
            completedProcesses: updatedCompletedProcesses,
            currentStreak: newStreak,
            longestStreak,
            lastActivityDate: today,
          },
        })

        return session
      })
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      if (process.env.NODE_ENV === 'development') {
        logger.error('学習セッション記録エラー:', error)
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '学習セッションの記録中にエラーが発生しました',
      })
    }
  }

  // 学習履歴取得
  static async getStudyHistory(
    userId: string,
    options: {
      limit?: number
      offset?: number
      knowledgeArea?: string
      processGroup?: string
      dateFrom?: Date
      dateTo?: Date
    } = {}
  ): Promise<{
    sessions: StudySession[]
    totalTime: number
    totalSessions: number
    pagination: {
      hasMore: boolean
      total: number
    }
  }> {
    try {
      const { limit = 20, offset = 0, knowledgeArea, processGroup, dateFrom, dateTo } = options

      const where: unknown = { userId }

      if (knowledgeArea) {
        where.knowledgeArea = knowledgeArea
      }
      if (processGroup) {
        where.processGroup = processGroup
      }
      if (dateFrom || dateTo) {
        where.createdAt = {}
        if (dateFrom) {
          where.createdAt.gte = dateFrom
        }
        if (dateTo) {
          where.createdAt.lte = dateTo
        }
      }

      const [sessions, total, totalStats] = await Promise.all([
        prisma.studySession.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.studySession.count({ where }),
        prisma.studySession.aggregate({
          where,
          _sum: { duration: true },
          _count: { id: true },
        }),
      ])

      return {
        sessions,
        totalTime: totalStats._sum.duration || 0,
        totalSessions: totalStats._count.id,
        pagination: {
          hasMore: offset + limit < total,
          total,
        },
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('学習履歴取得エラー:', error)
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '学習履歴の取得中にエラーが発生しました',
      })
    }
  }

  // 学習目標設定
  static async setLearningGoal(userId: string, goalData: LearningGoalData): Promise<unknown> {
    try {
      return await prisma.learningGoal.create({
        data: {
          userId,
          type: goalData.type,
          target: goalData.target,
          deadline: goalData.deadline,
          description: goalData.description,
          achieved: false,
        },
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('学習目標設定エラー:', error)
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '学習目標の設定中にエラーが発生しました',
      })
    }
  }

  // 学習目標取得
  static async getLearningGoals(
    userId: string,
    activeOnly: boolean = false
  ): Promise<
    Array<{ id: string; title: string; description: string; deadline?: Date; achieved: boolean }>
  > {
    try {
      const where: unknown = { userId }

      if (activeOnly) {
        where.achieved = false
        where.OR = [{ deadline: null }, { deadline: { gte: new Date() } }]
      }

      return await prisma.learningGoal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('学習目標取得エラー:', error)
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '学習目標の取得中にエラーが発生しました',
      })
    }
  }

  // 学習推奨機能
  static async getStudyRecommendations(userId: string): Promise<{
    nextProcesses: string[]
    weakAreas: string[]
    suggestedDuration: number
    priorityAreas: string[]
  }> {
    try {
      const progress = await this.getLearningProgress(userId)
      const completedProcesses = progress.completedProcesses as string[]

      // 未完了プロセスの抽出
      const allProcesses = Array.from(
        { length: PMBOK_PROCESSES.totalProcesses },
        (_, i) => `process_${i + 1}`
      )
      const incompleteProcesses = allProcesses.filter((p) => !completedProcesses.includes(p))

      // 弱点エリアの特定（スコアが低い知識エリア）
      const weakAreas = Object.entries(progress.stats.knowledgeAreas)
        .filter(([_, stats]) => stats.averageScore < 70)
        .sort(([_, a], [__, b]) => a.averageScore - b.averageScore)
        .slice(0, 3)
        .map(([area]) => area)

      // 優先エリア（完了率が低いプロセスグループ）
      const priorityAreas = Object.entries(progress.stats.processGroups)
        .filter(([_, stats]) => stats.completed / stats.total < 0.5)
        .sort(([_, a], [__, b]) => a.completed / a.total - b.completed / b.total)
        .slice(0, 2)
        .map(([group]) => group)

      // 推奨学習時間（週平均の1.2倍）
      const suggestedDuration = Math.max(
        Math.round((progress.stats.weeklyHours / 7) * 1.2 * 3600), // 秒に変換
        1800 // 最低30分
      )

      return {
        nextProcesses: incompleteProcesses.slice(0, 5),
        weakAreas,
        suggestedDuration,
        priorityAreas,
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('学習推奨取得エラー:', error)
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '学習推奨の取得中にエラーが発生しました',
      })
    }
  }

  // 学習進捗リセット
  static async resetProgress(userId: string): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // 学習セッション削除
        await tx.studySession.deleteMany({
          where: { userId },
        })

        // 学習進捗リセット
        await tx.learningProgress.update({
          where: { userId },
          data: {
            totalStudyTime: 0,
            completedProcesses: [],
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: new Date(),
          },
        })

        // 学習目標削除
        await tx.learningGoal.deleteMany({
          where: { userId },
        })
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('学習進捗リセットエラー:', error)
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '学習進捗のリセット中にエラーが発生しました',
      })
    }
  }

  // 学習データエクスポート
  static async exportLearningData(
    userId: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    try {
      const [progress, sessions, goals, examResults] = await Promise.all([
        this.getLearningProgress(userId),
        this.getStudyHistory(userId, { limit: 1000 }),
        this.getLearningGoals(userId),
        prisma.examResult.findMany({
          where: { userId },
          orderBy: { completedAt: 'desc' },
        }),
      ])

      const exportData = {
        progress,
        sessions: sessions.sessions,
        goals,
        examResults,
        exportedAt: new Date().toISOString(),
      }

      if (format === 'json') {
        return JSON.stringify(exportData, null, 2)
      }

      // CSV形式の場合はセッションデータのみ
      const csvHeaders = [
        'Date',
        'Process',
        'Knowledge Area',
        'Process Group',
        'Duration (min)',
        'Completed',
        'Notes',
      ]

      const csvRows = sessions.sessions.map((session) => [
        session.createdAt.toISOString().split('T')[0],
        session.processName,
        session.knowledgeArea,
        session.processGroup,
        Math.round(session.duration / 60),
        session.completed ? 'Yes' : 'No',
        (session.notes || '').replace(/[,\n\r]/g, ' '),
      ])

      return [csvHeaders, ...csvRows].map((row) => row.join(',')).join('\n')
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('学習データエクスポートエラー:', error)
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '学習データのエクスポート中にエラーが発生しました',
      })
    }
  }
}

export default LearningService
