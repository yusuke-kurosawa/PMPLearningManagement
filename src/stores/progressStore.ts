/**
 * Learning Progress State Management Store
 * Zustand store for managing user learning progress, achievements, and analytics
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { api } from '../lib/api/client'
import type { UnknownObject } from '../types/common'
import { logger } from '../services/logger'

export interface ProcessProgress {
  processId: string
  processName: string
  knowledgeArea: string
  processGroup: string
  studyTime: number // in minutes
  masteryLevel: 'not_started' | 'beginner' | 'intermediate' | 'advanced' | 'mastered'
  lastStudied?: Date
  confidenceScore: number // 0-100
  quizScores: number[] // Recent quiz scores
  flashcardReviews: number
  notes?: string
}

export interface KnowledgeAreaProgress {
  knowledgeArea: string
  processes: string[]
  overallProgress: number // 0-100
  studyTime: number
  averageMasteryLevel: number
  completedProcesses: number
  totalProcesses: number
}

export interface StudySession {
  id: string
  startTime: Date
  endTime?: Date
  duration: number // in minutes
  focus: string[] // Process IDs or knowledge areas
  activities: ('reading' | 'flashcards' | 'quiz' | 'practice_exam' | 'visualization')[]
  notes?: string
  effectiveness: 'low' | 'medium' | 'high'
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  type: 'study_time' | 'mastery' | 'consistency' | 'exam_score' | 'special'
  criteria: UnknownObject
  unlockedAt?: Date
  isUnlocked: boolean
  progress: number // 0-100
}

export interface LearningGoal {
  id: string
  title: string
  description: string
  type: 'exam_date' | 'mastery_level' | 'study_time' | 'process_completion'
  targetValue: number
  currentValue: number
  targetDate?: Date
  isCompleted: boolean
  createdAt: Date
}

export interface StudyStreak {
  currentStreak: number
  longestStreak: number
  lastStudyDate?: Date
  streakHistory: Array<{ date: string; studyTime: number }>
}

interface ProgressStore {
  // Progress data
  processProgress: Record<string, ProcessProgress>
  knowledgeAreaProgress: Record<string, KnowledgeAreaProgress>
  studySessions: StudySession[]
  achievements: Achievement[]
  goals: LearningGoal[]
  studyStreak: StudyStreak

  // Current session tracking
  currentSession: StudySession | null

  // UI state
  isLoading: boolean
  error: string | null

  // Actions - Progress tracking
  startStudySession: (focus: string[], activity: string) => void
  endStudySession: (effectiveness?: 'low' | 'medium' | 'high', notes?: string) => Promise<void>
  updateProcessProgress: (processId: string, updates: Partial<ProcessProgress>) => Promise<void>
  recordQuizScore: (processId: string, score: number) => Promise<void>
  updateMasteryLevel: (processId: string, level: ProcessProgress['masteryLevel']) => Promise<void>
  updateConfidenceScore: (processId: string, score: number) => Promise<void>

  // Actions - Goals and achievements
  createGoal: (
    goal: Omit<LearningGoal, 'id' | 'currentValue' | 'isCompleted' | 'createdAt'>
  ) => Promise<void>
  updateGoal: (goalId: string, updates: Partial<LearningGoal>) => Promise<void>
  deleteGoal: (goalId: string) => Promise<void>
  checkAchievements: () => Promise<Achievement[]>

  // Data loading
  loadProgress: () => Promise<void>
  syncWithServer: () => Promise<void>

  // Analytics and insights
  getWeeklyProgress: () => Array<{ date: string; studyTime: number; processesStudied: number }>
  getMonthlyTrends: () => {
    studyTime: Array<{ month: string; minutes: number }>
    masteryProgression: Array<{ month: string; averageMastery: number }>
    examScores: Array<{ month: string; averageScore: number }>
  }
  getProcessInsights: (processId: string) => {
    studyPattern: Array<{ date: string; minutes: number }>
    masteryProgression: Array<{ date: string; level: number }>
    quizPerformance: Array<{ date: string; score: number }>
    recommendations: string[]
  }

  // Utility functions
  getTotalStudyTime: () => number
  getOverallProgress: () => number
  getWeakAreas: () => ProcessProgress[]
  getStrongAreas: () => ProcessProgress[]
  getRecommendedStudy: () => string[]

  // Reset and cleanup
  reset: () => void
  exportProgress: () => string
  importProgress: (data: string) => Promise<void>
}

const initialStudyStreak: StudyStreak = {
  currentStreak: 0,
  longestStreak: 0,
  streakHistory: [],
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    immer((set, get) => ({
      processProgress: {},
      knowledgeAreaProgress: {},
      studySessions: [],
      achievements: [],
      goals: [],
      studyStreak: initialStudyStreak,
      currentSession: null,
      isLoading: false,
      error: null,

      startStudySession: (focus: string[], activity: string) => {
        const session: StudySession = {
          id: crypto.randomUUID(),
          startTime: new Date(),
          duration: 0,
          focus,
          activities: [activity as StudySession['activities'][0]],
          effectiveness: 'medium',
        }

        set((state) => {
          state.currentSession = session
        })
      },

      endStudySession: async (effectiveness = 'medium', notes) => {
        const currentSession = get().currentSession
        if (!currentSession) {return}

        const endTime = new Date()
        const duration = Math.round(
          (endTime.getTime() - currentSession.startTime.getTime()) / 60000
        )

        const completedSession: StudySession = {
          ...currentSession,
          endTime,
          duration,
          effectiveness,
          notes,
        }

        set((state) => {
          state.studySessions.unshift(completedSession)
          state.currentSession = null
        })

        // Update streak
        const today = new Date().toISOString().split('T')[0]
        set((state) => {
          const lastStudyDate = state.studyStreak.lastStudyDate?.toISOString().split('T')[0]

          if (lastStudyDate !== today) {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayStr = yesterday.toISOString().split('T')[0]

            if (lastStudyDate === yesterdayStr) {
              state.studyStreak.currentStreak += 1
            } else {
              state.studyStreak.currentStreak = 1
            }

            state.studyStreak.longestStreak = Math.max(
              state.studyStreak.longestStreak,
              state.studyStreak.currentStreak
            )
            state.studyStreak.lastStudyDate = new Date()
            state.studyStreak.streakHistory.push({
              date: today,
              studyTime: duration,
            })
          }
        })

        try {
          await api.progress.recordStudySession.mutate({
            sessionData: completedSession,
          })
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            logger.warn('Failed to sync study session:', error)
          }
        }
      },

      updateProcessProgress: async (processId: string, updates: Partial<ProcessProgress>) => {
        set((state) => {
          if (!state.processProgress[processId]) {
            // Initialize process progress if it doesn't exist
            state.processProgress[processId] = {
              processId,
              processName: updates.processName || '',
              knowledgeArea: updates.knowledgeArea || '',
              processGroup: updates.processGroup || '',
              studyTime: 0,
              masteryLevel: 'not_started',
              confidenceScore: 0,
              quizScores: [],
              flashcardReviews: 0,
            }
          }

          Object.assign(state.processProgress[processId], updates, {
            lastStudied: new Date(),
          })
        })

        try {
          await api.progress.updateProcess.mutate({
            processId,
            updates: {
              ...updates,
              lastStudied: new Date(),
            },
          })
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            logger.warn('Failed to sync process progress:', error)
          }
        }
      },

      recordQuizScore: async (processId: string, score: number) => {
        set((state) => {
          if (!state.processProgress[processId]) {return}

          state.processProgress[processId].quizScores.push(score)
          // Keep only last 10 scores
          if (state.processProgress[processId].quizScores.length > 10) {
            state.processProgress[processId].quizScores.shift()
          }

          // Update confidence score based on recent quiz performance
          const recentScores = state.processProgress[processId].quizScores.slice(-5)
          const averageScore = recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length
          state.processProgress[processId].confidenceScore = Math.round(averageScore)
        })

        try {
          await api.progress.recordQuizScore.mutate({ processId, score })
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            logger.warn('Failed to sync quiz score:', error)
          }
        }
      },

      updateMasteryLevel: async (processId: string, level: ProcessProgress['masteryLevel']) => {
        await get().updateProcessProgress(processId, { masteryLevel: level })
      },

      updateConfidenceScore: async (processId: string, score: number) => {
        await get().updateProcessProgress(processId, { confidenceScore: score })
      },

      createGoal: async (goalData) => {
        const goal: LearningGoal = {
          ...goalData,
          id: crypto.randomUUID(),
          currentValue: 0,
          isCompleted: false,
          createdAt: new Date(),
        }

        set((state) => {
          state.goals.push(goal)
        })

        try {
          await api.progress.createGoal.mutate(goal)
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            logger.warn('Failed to sync goal creation:', error)
          }
        }
      },

      updateGoal: async (goalId: string, updates: Partial<LearningGoal>) => {
        set((state) => {
          const goal = state.goals.find((g) => g.id === goalId)
          if (goal) {
            Object.assign(goal, updates)
          }
        })

        try {
          await api.progress.updateGoal.mutate({ goalId, updates })
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            logger.warn('Failed to sync goal update:', error)
          }
        }
      },

      deleteGoal: async (goalId: string) => {
        set((state) => {
          state.goals = state.goals.filter((g) => g.id !== goalId)
        })

        try {
          await api.progress.deleteGoal.mutate({ goalId })
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            logger.warn('Failed to sync goal deletion:', error)
          }
        }
      },

      checkAchievements: async () => {
        const newAchievements: Achievement[] = []

        // Example achievement checks
        const totalStudyTime = get().getTotalStudyTime()
        const completedProcesses = Object.values(get().processProgress).filter(
          (p) => p.masteryLevel === 'mastered'
        ).length

        const achievementChecks = [
          {
            id: 'first-hour',
            title: 'First Hour',
            description: 'Complete your first hour of study',
            type: 'study_time',
            criteria: { studyTime: 60 },
            threshold: 60,
            current: totalStudyTime,
          },
          {
            id: 'process-master',
            title: 'Process Master',
            description: 'Master your first process',
            type: 'mastery',
            criteria: { masteredProcesses: 1 },
            threshold: 1,
            current: completedProcesses,
          },
          // Add more achievement checks...
        ]

        set((state) => {
          achievementChecks.forEach((check) => {
            const existing = state.achievements.find((a) => a.id === check.id)
            if (!existing) {
              const achievement: Achievement = {
                id: check.id,
                title: check.title,
                description: check.description,
                icon: '🏆',
                type: check.type as Achievement['type'],
                criteria: check.criteria,
                progress: Math.min(100, (check.current / check.threshold) * 100),
                isUnlocked: check.current >= check.threshold,
                unlockedAt: check.current >= check.threshold ? new Date() : undefined,
              }

              state.achievements.push(achievement)
              if (achievement.isUnlocked) {
                newAchievements.push(achievement)
              }
            }
          })
        })

        return newAchievements
      },

      loadProgress: async () => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          const data = await api.progress.getProgress.query()
          set((state) => {
            state.processProgress = data.processes
            state.knowledgeAreaProgress = data.knowledgeAreas
            state.studySessions = data.studySessions
            state.achievements = data.achievements
            state.goals = data.goals
            state.studyStreak = data.studyStreak
            state.isLoading = false
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to load progress'
            state.isLoading = false
          })
        }
      },

      syncWithServer: async () => {
        try {
          const localData = {
            processProgress: get().processProgress,
            studySessions: get().studySessions,
            goals: get().goals,
            studyStreak: get().studyStreak,
          }

          await api.progress.syncProgress.mutate(localData)
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            logger.warn('Failed to sync with server:', error)
          }
        }
      },

      getWeeklyProgress: () => {
        const sessions = get().studySessions
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - i)
          return date.toISOString().split('T')[0]
        }).reverse()

        return last7Days.map((date) => {
          const daySessions = sessions.filter(
            (s) => s.startTime.toISOString().split('T')[0] === date
          )

          return {
            date,
            studyTime: daySessions.reduce((sum, s) => sum + s.duration, 0),
            processesStudied: new Set(daySessions.flatMap((s) => s.focus)).size,
          }
        })
      },

      getMonthlyTrends: () => {
        const sessions = get().studySessions
        const processProgress = get().processProgress

        // Group by month for the last 12 months
        const last12Months = Array.from({ length: 12 }, (_, i) => {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          return date.toISOString().slice(0, 7) // YYYY-MM format
        }).reverse()

        const studyTime = last12Months.map((month) => ({
          month,
          minutes: sessions
            .filter((s) => s.startTime.toISOString().slice(0, 7) === month)
            .reduce((sum, s) => sum + s.duration, 0),
        }))

        const masteryProgression = last12Months.map((month) => {
          const processes = Object.values(processProgress)
          const monthProcesses = processes.filter(
            (p) => p.lastStudied && p.lastStudied.toISOString().slice(0, 7) === month
          )

          const masteryLevels = {
            not_started: 0,
            beginner: 1,
            intermediate: 2,
            advanced: 3,
            mastered: 4,
          }
          const averageMastery =
            monthProcesses.length > 0
              ? monthProcesses.reduce((sum, p) => sum + masteryLevels[p.masteryLevel], 0) /
                monthProcesses.length
              : 0

          return { month, averageMastery }
        })

        return {
          studyTime,
          masteryProgression,
          examScores: [], // TODO: Integrate with exam results
        }
      },

      getProcessInsights: (processId: string) => {
        const process = get().processProgress[processId]
        const sessions = get().studySessions.filter((s) => s.focus.includes(processId))

        if (!process) {
          return {
            studyPattern: [],
            masteryProgression: [],
            quizPerformance: [],
            recommendations: ['Process not found'],
          }
        }

        const studyPattern = sessions.map((s) => ({
          date: s.startTime.toISOString().split('T')[0],
          minutes: s.duration,
        }))

        const quizPerformance = process.quizScores.map((score, index) => ({
          date: new Date(Date.now() - (process.quizScores.length - index) * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          score,
        }))

        const recommendations = []
        if (process.studyTime < 60) {
          recommendations.push('Spend more time studying this process')
        }
        if (process.confidenceScore < 70) {
          recommendations.push('Practice more quizzes to improve confidence')
        }
        if (process.masteryLevel === 'not_started') {
          recommendations.push('Start with basic concepts and flashcards')
        }

        return {
          studyPattern,
          masteryProgression: [], // TODO: Track mastery changes over time
          quizPerformance,
          recommendations,
        }
      },

      getTotalStudyTime: () => {
        return get().studySessions.reduce((total, session) => total + session.duration, 0)
      },

      getOverallProgress: () => {
        const processes = Object.values(get().processProgress)
        if (processes.length === 0) {return 0}

        const masteryLevels = {
          not_started: 0,
          beginner: 25,
          intermediate: 50,
          advanced: 75,
          mastered: 100,
        }
        const totalProgress = processes.reduce((sum, p) => sum + masteryLevels[p.masteryLevel], 0)

        return Math.round(totalProgress / processes.length)
      },

      getWeakAreas: () => {
        return Object.values(get().processProgress)
          .filter((p) => p.masteryLevel === 'not_started' || p.confidenceScore < 60)
          .sort((a, b) => a.confidenceScore - b.confidenceScore)
          .slice(0, 5)
      },

      getStrongAreas: () => {
        return Object.values(get().processProgress)
          .filter((p) => p.masteryLevel === 'mastered' || p.confidenceScore >= 80)
          .sort((a, b) => b.confidenceScore - a.confidenceScore)
          .slice(0, 5)
      },

      getRecommendedStudy: () => {
        const weakAreas = get().getWeakAreas()
        const recommendations = []

        if (weakAreas.length > 0) {
          recommendations.push(`Focus on ${weakAreas[0].processName}`)
        }

        const totalStudyTime = get().getTotalStudyTime()
        if (totalStudyTime < 60) {
          recommendations.push('Aim for at least 1 hour of daily study')
        }

        return recommendations
      },

      reset: () => {
        set((state) => {
          state.processProgress = {}
          state.knowledgeAreaProgress = {}
          state.studySessions = []
          state.achievements = []
          state.goals = []
          state.studyStreak = initialStudyStreak
          state.currentSession = null
          state.error = null
          state.isLoading = false
        })
      },

      exportProgress: () => {
        const state = get()
        return JSON.stringify(
          {
            processProgress: state.processProgress,
            studySessions: state.studySessions,
            achievements: state.achievements,
            goals: state.goals,
            studyStreak: state.studyStreak,
            exportDate: new Date().toISOString(),
          },
          null,
          2
        )
      },

      importProgress: async (data: string) => {
        try {
          const imported = JSON.parse(data)

          set((state) => {
            state.processProgress = imported.processProgress || {}
            state.studySessions = imported.studySessions || []
            state.achievements = imported.achievements || []
            state.goals = imported.goals || []
            state.studyStreak = imported.studyStreak || initialStudyStreak
          })

          // Sync with server
          await get().syncWithServer()
        } catch (error) {
          set((state) => {
            state.error = 'Failed to import progress data'
          })
        }
      },
    })),
    {
      name: 'progress-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        processProgress: state.processProgress,
        studySessions: state.studySessions,
        achievements: state.achievements,
        goals: state.goals,
        studyStreak: state.studyStreak,
      }),
    }
  )
)

export default useProgressStore
