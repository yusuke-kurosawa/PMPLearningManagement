/**
 * Mock Exam State Management Store
 * Zustand store for managing exam sessions, answers, and progress
 */

import React from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { api } from '../lib/api/client'

export interface ExamQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: string | string[]
  explanation: string
  domain: 'people' | 'process' | 'business'
  difficulty: 'easy' | 'medium' | 'hard'
  type: 'single' | 'multiple'
  tags: string[]
  references?: string[]
}

export interface ExamSession {
  id: string
  userId?: string
  questions: ExamQuestion[]
  answers: Record<string, string | string[]>
  bookmarkedQuestions: Set<string>
  startTime: Date
  endTime?: Date
  timeRemaining: number
  totalDuration: number
  isPaused: boolean
  isCompleted: boolean
  currentQuestionIndex: number
  settings: ExamSettings
}

export interface ExamSettings {
  questionsCount: number
  timeLimit: number // in minutes
  domain?: 'people' | 'process' | 'business'
  difficulty?: 'easy' | 'medium' | 'hard'
  practiceMode: boolean
  showExplanations: boolean
  randomizeQuestions: boolean
  randomizeOptions: boolean
}

export interface ExamResults {
  sessionId: string
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  unanswered: number
  score: number
  percentageScore: number
  isPassing: boolean
  timeTaken: number
  domainScores: Record<string, { correct: number; total: number; percentage: number }>
  difficultyBreakdown: Record<string, { correct: number; total: number; percentage: number }>
  detailedResults: Array<{
    questionId: string
    question: string
    userAnswer?: string | string[]
    correctAnswer: string | string[]
    isCorrect: boolean
    explanation: string
    timeSpent?: number
  }>
}

export interface ExamHistory {
  sessionId: string
  date: Date
  score: number
  percentageScore: number
  isPassing: boolean
  timeTaken: number
  questionsCount: number
  settings: ExamSettings
}

interface ExamStore {
  // Current session state
  currentSession: ExamSession | null

  // Historical data
  examHistory: ExamHistory[]

  // UI state
  isLoading: boolean
  error: string | null

  // Actions
  initializeExam: (settings: ExamSettings) => Promise<void>
  startExam: () => void
  pauseExam: () => void
  resumeExam: () => void
  answerQuestion: (questionId: string, answer: string | string[]) => void
  bookmarkQuestion: (questionId: string) => void
  unbookmarkQuestion: (questionId: string) => void
  navigateToQuestion: (index: number) => void
  submitExam: () => Promise<ExamResults>
  abandonExam: () => void

  // Timer management
  updateTimer: () => void

  // History management
  loadExamHistory: () => Promise<void>
  deleteExamHistory: (sessionId: string) => Promise<void>

  // Utility functions
  getProgress: () => {
    answered: number
    total: number
    percentage: number
    bookmarked: number
  }
  getQuestionsByDomain: () => Record<string, ExamQuestion[]>
  getCurrentQuestion: () => ExamQuestion | null
  canNavigateNext: () => boolean
  canNavigatePrevious: () => boolean

  // Reset and cleanup
  reset: () => void
}

// const DEFAULT_EXAM_SETTINGS: ExamSettings = { // TODO: Will be used in future
//   questionsCount: 180,
//   timeLimit: 230, // 230 minutes;
//   practiceMode: false,
//   showExplanations: false,
//   randomizeQuestions: true,
//   randomizeOptions: true,
// }

export const useExamStore = create<ExamStore>()(
  persist(
    immer((set, get) => ({
      currentSession: null,
      examHistory: [],
      isLoading: false,
      error: null,

      initializeExam: async (settings: ExamSettings) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          // Fetch questions from API based on settings
          const questions = await api.exam.generateExam.query({
            count: settings.questionsCount,
            domain: settings.domain,
            difficulty: settings.difficulty,
            randomize: settings.randomizeQuestions,
          })

          const session: ExamSession = {
            id: crypto.randomUUID(),
            questions: questions,
            answers: {},
            bookmarkedQuestions: new Set(),
            startTime: new Date(),
            timeRemaining: settings.timeLimit * 60, // convert to seconds
            totalDuration: settings.timeLimit * 60,
            isPaused: false,
            isCompleted: false,
            currentQuestionIndex: 0,
            settings,
          }

          set((state) => {
            state.currentSession = session
            state.isLoading = false
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to initialize exam'
            state.isLoading = false
          })
        }
      },

      startExam: () => {
        set((state) => {
          if (state.currentSession) {
            state.currentSession.startTime = new Date()
            state.currentSession.isPaused = false
          }
        })
      },

      pauseExam: () => {
        set((state) => {
          if (state.currentSession) {
            state.currentSession.isPaused = true
          }
        })
      },

      resumeExam: () => {
        set((state) => {
          if (state.currentSession) {
            state.currentSession.isPaused = false
          }
        })
      },

      answerQuestion: (questionId: string, answer: string | string[]) => {
        set((state) => {
          if (state.currentSession) {
            state.currentSession.answers[questionId] = answer
          }
        })
      },

      bookmarkQuestion: (questionId: string) => {
        set((state) => {
          if (state.currentSession) {
            state.currentSession.bookmarkedQuestions.add(questionId)
          }
        })
      },

      unbookmarkQuestion: (questionId: string) => {
        set((state) => {
          if (state.currentSession) {
            state.currentSession.bookmarkedQuestions.delete(questionId)
          }
        })
      },

      navigateToQuestion: (index: number) => {
        set((state) => {
          if (state.currentSession && index >= 0 && index < state.currentSession.questions.length) {
            state.currentSession.currentQuestionIndex = index
          }
        })
      },

      submitExam: async () => {
        const session = get().currentSession
        if (!session) {
          throw new Error('No active exam session')
        }

        set((state) => {
          state.isLoading = true
        })

        try {
          // Calculate results
          const results = await api.exam.submitExam.mutate({
            sessionId: session.id,
            answers: session.answers,
            timeTaken: session.totalDuration - session.timeRemaining,
          })

          // Mark session as completed
          set((state) => {
            if (state.currentSession) {
              state.currentSession.isCompleted = true
              state.currentSession.endTime = new Date()
            }
          })

          // Add to history
          const historyEntry: ExamHistory = {
            sessionId: session.id,
            date: new Date(),
            score: results.correctAnswers,
            percentageScore: results.percentageScore,
            isPassing: results.isPassing,
            timeTaken: results.timeTaken,
            questionsCount: session.questions.length,
            settings: session.settings,
          }

          set((state) => {
            state.examHistory.unshift(historyEntry)
            state.isLoading = false
          })

          return results
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to submit exam'
            state.isLoading = false
          })
          throw error
        }
      },

      abandonExam: () => {
        set((state) => {
          state.currentSession = null
        })
      },

      updateTimer: () => {
        set((state) => {
          if (
            state.currentSession &&
            !state.currentSession.isPaused &&
            !state.currentSession.isCompleted
          ) {
            if (state.currentSession.timeRemaining > 0) {
              state.currentSession.timeRemaining -= 1
            } else {
              // Auto-submit when time runs out
              state.currentSession.isCompleted = true
              state.currentSession.endTime = new Date()
            }
          }
        })
      },

      loadExamHistory: async () => {
        set((state) => {
          state.isLoading = true
        })

        try {
          const history = await api.exam.getHistory.query()
          set((state) => {
            state.examHistory = history
            state.isLoading = false
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to load exam history'
            state.isLoading = false
          })
        }
      },

      deleteExamHistory: async (sessionId: string) => {
        try {
          await api.exam.deleteSession.mutate({ sessionId })
          set((state) => {
            state.examHistory = state.examHistory.filter((h) => h.sessionId !== sessionId)
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to delete exam history'
          })
        }
      },

      getProgress: () => {
        const session = get().currentSession
        if (!session) {
          return { answered: 0, total: 0, percentage: 0, bookmarked: 0 }
        }

        const answered = Object.keys(session.answers).length
        const total = session.questions.length
        const percentage = total > 0 ? (answered / total) * 100 : 0
        const bookmarked = session.bookmarkedQuestions.size

        return { answered, total, percentage, bookmarked }
      },

      getQuestionsByDomain: () => {
        const session = get().currentSession
        if (!session) return {}

        return session.questions.reduce(
          (acc, question) => {
            if (!acc[question.domain]) acc[question.domain] = []
            acc[question.domain].push(question)
            return acc
          },
          {} as Record<string, ExamQuestion[]>
        )
      },

      getCurrentQuestion: () => {
        const session = get().currentSession
        if (!session) return null
        return session.questions[session.currentQuestionIndex] || null
      },

      canNavigateNext: () => {
        const session = get().currentSession
        if (!session) return false
        return session.currentQuestionIndex < session.questions.length - 1
      },

      canNavigatePrevious: () => {
        const session = get().currentSession
        if (!session) return false
        return session.currentQuestionIndex > 0
      },

      reset: () => {
        set((state) => {
          state.currentSession = null
          state.error = null
          state.isLoading = false
        })
      },
    })),
    {
      name: 'exam-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        examHistory: state.examHistory,
      }),
    }
  )
)

// Timer hook for automatic updates
let timerInterval: NodeJS.Timeout | null = null

export const _useExamTimer = () => {
  const updateTimer = useExamStore((state) => state.updateTimer)
  const currentSession = useExamStore((state) => state.currentSession)

  React.useEffect(() => {
    if (currentSession && !currentSession.isPaused && !currentSession.isCompleted) {
      timerInterval = setInterval(updateTimer, 1000)
    } else if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
    }
  }, [currentSession?.isPaused, currentSession?.isCompleted, updateTimer])
}

export default useExamStore
