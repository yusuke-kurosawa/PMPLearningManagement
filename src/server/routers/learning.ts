/**
 * Learning Router (tRPC)
 * Learning progress, study sessions, and analytics endpoints
 * 担当: ビジネスロジックエンジニア, API・データエンジニア
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { createTRPCRouter, protectedProcedure } from '@/server/trpc'
import {
  LearningService,
  studySessionSchema,
  learningGoalSchema,
} from '@/server/services/learningService'
import { ProgressService } from '@/server/services/progressService'
import { createPermissionChecker, Permission } from '@/server/auth/rbac'
import { prisma } from '@/lib/db'
// import type { KnowledgeArea, ProcessGroup } from '@/types'

// Score types for exam results
type KnowledgeAreaScores = Record<string, number>
type ProcessGroupScores = Record<string, number>

// 入力検証スキーマ
const learningProgressQuerySchema = z.object({
  includeStats: z.boolean().optional().default(true),
  includeRecommendations: z.boolean().optional().default(false),
})

const studyHistorySchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
  knowledgeArea: z.string().optional(),
  processGroup: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  completedOnly: z.boolean().optional().default(false),
})

const learningGoalUpdateSchema = z.object({
  id: z.string().cuid(),
  target: z.number().min(1).optional(),
  deadline: z.date().optional(),
  description: z.string().max(200).optional(),
  achieved: z.boolean().optional(),
})

const exportDataSchema = z.object({
  format: z.enum(['json', 'csv']).default('json'),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  includeExamResults: z.boolean().default(true),
  includeGoals: z.boolean().default(true),
})

// 学習機能ルーター
export const learningRouter = createTRPCRouter({
  // 学習進捗取得
  getProgress: protectedProcedure
    .input(learningProgressQuerySchema)
    .query(async ({ ctx, input }) => {
      const progress = await LearningService.getLearningProgress(ctx.session.user.id)

      if (input.includeRecommendations) {
        const recommendations = await LearningService.getStudyRecommendations(ctx.session.user.id)
        return {
          ...progress,
          recommendations,
        }
      }

      return progress
    }),

  // 学習セッション記録
  recordSession: protectedProcedure.input(studySessionSchema).mutation(async ({ ctx, input }) => {
    const session = await LearningService.recordStudySession(ctx.session.user.id, input)

    // 学習セッション記録のアクティビティログ
    await prisma.userActivity.create({
      data: {
        userId: ctx.session.user.id,
        action: 'STUDY_SESSION_COMPLETED',
        details: {
          processId: input.processId,
          processName: input.processName,
          duration: input.duration,
          completed: input.completed,
        },
      },
    })

    return {
      session,
      message: '学習セッションが記録されました',
    }
  }),

  // 学習履歴取得
  getHistory: protectedProcedure.input(studyHistorySchema).query(async ({ ctx, input }) => {
    const history = await LearningService.getStudyHistory(ctx.session.user.id, {
      limit: input.limit,
      offset: input.offset,
      knowledgeArea: input.knowledgeArea,
      processGroup: input.processGroup,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
    })

    // 完了済みセッションのみフィルタ
    if (input.completedOnly) {
      history.sessions = history.sessions.filter((session) => session.completed)
    }

    return history
  }),

  // 学習目標設定
  setGoal: protectedProcedure.input(learningGoalSchema).mutation(async ({ ctx, input }) => {
    const goal = await LearningService.setLearningGoal(ctx.session.user.id, input)

    await prisma.userActivity.create({
      data: {
        userId: ctx.session.user.id,
        action: 'LEARNING_GOAL_SET',
        details: {
          goalType: input.type,
          target: input.target,
          deadline: input.deadline,
        },
      },
    })

    return {
      goal,
      message: '学習目標が設定されました',
    }
  }),

  // 学習目標取得
  getGoals: protectedProcedure
    .input(
      z.object({
        activeOnly: z.boolean().optional().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      return await LearningService.getLearningGoals(ctx.session.user.id, input.activeOnly)
    }),

  // 学習目標更新
  updateGoal: protectedProcedure
    .input(learningGoalUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      const goal = await prisma.learningGoal.update({
        where: {
          id,
          userId: ctx.session.user.id, // セキュリティ: 自分の目標のみ更新可能
        },
        data: updateData,
      })

      if (input.achieved) {
        await prisma.userActivity.create({
          data: {
            userId: ctx.session.user.id,
            action: 'LEARNING_GOAL_ACHIEVED',
            details: {
              goalId: id,
              goalType: goal.type,
              target: goal.target,
            },
          },
        })
      }

      return {
        goal,
        message: input.achieved ? '目標達成おめでとうございます！' : '目標が更新されました',
      }
    }),

  // 学習目標削除
  deleteGoal: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await prisma.learningGoal.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      })

      return {
        message: '学習目標が削除されました',
      }
    }),

  // 学習推奨取得
  getRecommendations: protectedProcedure.query(async ({ ctx }) => {
    return await LearningService.getStudyRecommendations(ctx.session.user.id)
  }),

  // 学習統計取得
  getStats: protectedProcedure
    .input(
      z.object({
        period: z.enum(['week', 'month', 'quarter', 'year', 'all']).default('month'),
      })
    )
    .query(async ({ ctx, input }) => {
      const checker = createPermissionChecker(ctx.session.user)

      if (!checker.hasPermission(Permission.LEARNING_ANALYTICS)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '学習統計を表示する権限がありません',
        })
      }

      return await ProgressService.calculateUserMetrics(ctx.session.user.id, input.period)
    }),

  // 進捗比較分析
  getComparison: protectedProcedure
    .input(
      z.object({
        period: z.enum(['week', 'month', 'quarter', 'year', 'all']).default('month'),
      })
    )
    .query(async ({ ctx, input }) => {
      const checker = createPermissionChecker(ctx.session.user)

      if (!checker.hasPermission(Permission.LEARNING_ANALYTICS)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '比較分析を表示する権限がありません',
        })
      }

      return await ProgressService.compareWithCohort(ctx.session.user.id, input.period)
    }),

  // 予測分析取得
  getPredictions: protectedProcedure.query(async ({ ctx }) => {
    const checker = createPermissionChecker(ctx.session.user)

    if (!checker.hasPermission(Permission.LEARNING_ANALYTICS)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: '予測分析を表示する権限がありません',
      })
    }

    return await ProgressService.generatePredictions(ctx.session.user.id)
  }),

  // 進捗サマリー取得
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    return await ProgressService.getProgressSummary(ctx.session.user.id)
  }),

  // 学習進捗リセット
  resetProgress: protectedProcedure
    .input(
      z.object({
        confirmReset: z.boolean().refine((val) => val === true, '進捗リセットの確認が必要です'),
      })
    )
    .mutation(async ({ ctx }) => {
      await LearningService.resetProgress(ctx.session.user.id)

      await prisma.userActivity.create({
        data: {
          userId: ctx.session.user.id,
          action: 'LEARNING_PROGRESS_RESET',
          details: {
            resetAt: new Date(),
          },
        },
      })

      return {
        message: '学習進捗がリセットされました',
      }
    }),

  // 学習データエクスポート
  exportData: protectedProcedure.input(exportDataSchema).mutation(async ({ ctx, input }) => {
    const checker = createPermissionChecker(ctx.session.user)

    if (!checker.hasPermission(Permission.LEARNING_EXPORT)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'データエクスポート権限がありません',
      })
    }

    const exportData = await LearningService.exportLearningData(ctx.session.user.id, input.format)

    await prisma.userActivity.create({
      data: {
        userId: ctx.session.user.id,
        action: 'LEARNING_DATA_EXPORTED',
        details: {
          format: input.format,
          exportedAt: new Date(),
        },
      },
    })

    return {
      data: exportData,
      filename: `learning-data-${ctx.session.user.id}-${new Date().toISOString().split('T')[0]}.${input.format}`,
      contentType: input.format === 'json' ? 'application/json' : 'text/csv',
    }
  }),

  // プロセス完了マーク
  markProcessCompleted: protectedProcedure
    .input(
      z.object({
        processId: z.string().min(1),
        processName: z.string().min(1),
        knowledgeArea: z.string().min(1),
        processGroup: z.string().min(1),
        notes: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 学習セッションとして記録（完了フラグ付き）
      const session = await LearningService.recordStudySession(ctx.session.user.id, {
        processId: input.processId,
        processName: input.processName,
        knowledgeArea: input.knowledgeArea,
        processGroup: input.processGroup,
        duration: 0, // 完了マークのみの場合は時間なし
        completed: true,
        notes: input.notes,
      })

      return {
        session,
        message: `プロセス「${input.processName}」を完了としてマークしました`,
      }
    }),

  // 学習ストリーク取得
  getStreak: protectedProcedure.query(async ({ ctx }) => {
    const progress = await prisma.learningProgress.findUnique({
      where: { userId: ctx.session.user.id },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastActivityDate: true,
      },
    })

    if (!progress) {
      return {
        current: 0,
        longest: 0,
        lastActivity: null,
        streakStatus: 'inactive' as const,
      }
    }

    // ストリーク状態判定
    const today = new Date()
    const lastActivity = progress.lastActivityDate
    const daysSinceLastActivity = lastActivity
      ? Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      : 999

    let streakStatus: 'active' | 'at_risk' | 'broken' | 'inactive'

    if (daysSinceLastActivity === 0) {
      streakStatus = 'active'
    } else if (daysSinceLastActivity === 1) {
      streakStatus = 'at_risk'
    } else if (daysSinceLastActivity > 1 && progress.currentStreak > 0) {
      streakStatus = 'broken'
    } else {
      streakStatus = 'inactive'
    }

    return {
      current: progress.currentStreak,
      longest: progress.longestStreak,
      lastActivity: progress.lastActivityDate,
      daysSinceLastActivity,
      streakStatus,
    }
  }),

  // 知識エリア別進捗取得
  getKnowledgeAreaProgress: protectedProcedure.query(async ({ ctx }) => {
    const [sessions, examResults] = await Promise.all([
      prisma.studySession.findMany({
        where: { userId: ctx.session.user.id },
      }),
      prisma.examResult.findMany({
        where: { userId: ctx.session.user.id },
      }),
    ])

    const knowledgeAreas = [
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
    ]

    const progress = knowledgeAreas.map((area) => {
      const areaSessions = sessions.filter((s) => s.knowledgeArea === area)
      const areaExams = examResults.filter(
        (e) =>
          e.knowledgeAreaScores &&
          (e.knowledgeAreaScores as KnowledgeAreaScores)[area] !== undefined
      )

      const completedSessions = areaSessions.filter((s) => s.completed)
      const totalStudyTime = areaSessions.reduce((sum, s) => sum + s.duration, 0)
      const averageScore =
        areaExams.length > 0
          ? areaExams.reduce(
              (sum, e) => sum + ((e.knowledgeAreaScores as KnowledgeAreaScores)[area] || 0),
              0
            ) / areaExams.length
          : 0

      return {
        knowledgeArea: area,
        totalSessions: areaSessions.length,
        completedSessions: completedSessions.length,
        totalStudyTime: Math.round((totalStudyTime / 3600) * 10) / 10, // 時間単位
        averageScore: Math.round(averageScore),
        examAttempts: areaExams.length,
        completionRate:
          areaSessions.length > 0
            ? Math.round((completedSessions.length / areaSessions.length) * 100)
            : 0,
      }
    })

    return progress
  }),

  // プロセスグループ別進捗取得
  getProcessGroupProgress: protectedProcedure.query(async ({ ctx }) => {
    const [sessions, examResults] = await Promise.all([
      prisma.studySession.findMany({
        where: { userId: ctx.session.user.id },
      }),
      prisma.examResult.findMany({
        where: { userId: ctx.session.user.id },
      }),
    ])

    const processGroups = [
      'Initiating',
      'Planning',
      'Executing',
      'Monitoring and Controlling',
      'Closing',
    ]

    const progress = processGroups.map((group) => {
      const groupSessions = sessions.filter((s) => s.processGroup === group)
      const groupExams = examResults.filter(
        (e) =>
          e.processGroupScores && (e.processGroupScores as ProcessGroupScores)[group] !== undefined
      )

      const completedSessions = groupSessions.filter((s) => s.completed)
      const totalStudyTime = groupSessions.reduce((sum, s) => sum + s.duration, 0)
      const averageScore =
        groupExams.length > 0
          ? groupExams.reduce(
              (sum, e) => sum + ((e.processGroupScores as ProcessGroupScores)[group] || 0),
              0
            ) / groupExams.length
          : 0

      return {
        processGroup: group,
        totalSessions: groupSessions.length,
        completedSessions: completedSessions.length,
        totalStudyTime: Math.round((totalStudyTime / 3600) * 10) / 10,
        averageScore: Math.round(averageScore),
        examAttempts: groupExams.length,
        completionRate:
          groupSessions.length > 0
            ? Math.round((completedSessions.length / groupSessions.length) * 100)
            : 0,
      }
    })

    return progress
  }),

  // 最近のアクティビティ取得
  getRecentActivity: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const [sessions, examResults, goals] = await Promise.all([
        prisma.studySession.findMany({
          where: { userId: ctx.session.user.id },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
        }),
        prisma.examResult.findMany({
          where: { userId: ctx.session.user.id },
          orderBy: { completedAt: 'desc' },
          take: input.limit,
        }),
        prisma.learningGoal.findMany({
          where: {
            userId: ctx.session.user.id,
            achieved: true,
          },
          orderBy: { updatedAt: 'desc' },
          take: input.limit,
        }),
      ])

      // アクティビティを統合してソート
      const activities = [
        ...sessions.map((session) => ({
          type: 'study_session' as const,
          id: session.id,
          title: `${session.processName}を学習`,
          description: `${session.knowledgeArea} - ${Math.round(session.duration / 60)}分間`,
          date: session.createdAt,
          metadata: {
            processId: session.processId,
            completed: session.completed,
            knowledgeArea: session.knowledgeArea,
          },
        })),
        ...examResults.map((exam) => ({
          type: 'exam_result' as const,
          id: exam.id,
          title: '模擬試験完了',
          description: `スコア: ${exam.score}点 ${exam.passed ? '(合格)' : '(不合格)'}`,
          date: exam.completedAt,
          metadata: {
            score: exam.score,
            passed: exam.passed,
            duration: exam.duration,
          },
        })),
        ...goals.map((goal) => ({
          type: 'goal_achieved' as const,
          id: goal.id,
          title: '学習目標達成',
          description: goal.description || `${goal.type}目標を達成`,
          date: goal.updatedAt,
          metadata: {
            goalType: goal.type,
            target: goal.target,
          },
        })),
      ]

      return activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, input.limit)
    }),
})

export default learningRouter
