/**
 * ファイル説明: {description}
 * 開発者: {developer}
 * 専門分野: {specialization}
 * 作成日: {created}
 * 最終更新: {updated}
 * 依存関係: {dependencies}
 * セキュリティレベル: {security_level}
 */ import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'ja' | 'en'
  fontSize: 'small' | 'medium' | 'large'
  autoSave: boolean
  notifications: {
    email: boolean
    push: boolean
    studyReminders: boolean
    achievementAlerts: boolean
  }
  studySettings: {
    dailyGoal: number // minutes
    preferredStudyTime: string // HH:mm format
    flashcardInterval: number // days
    examMode: 'practice' | 'timed' | 'adaptive'
  }
}

interface UserState {
  // User data
  currentUser: {
    id: string
    email: string
    name: string | null
    image: string | null
    role: string
  } | null

  // Preferences
  preferences: UserPreferences

  // Study session
  currentSession: {
    startTime: Date | null
    processId: string | null
    duration: number // minutes
  } | null

  // Actions
  setCurrentUser: (user: UserState['currentUser']) => void
  clearCurrentUser: () => void
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  startStudySession: (processId: string) => void
  endStudySession: () => void
  updateSessionDuration: (minutes: number) => void
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'ja',
  fontSize: 'medium',
  autoSave: true,
  notifications: {
    email: true,
    push: false,
    studyReminders: true,
    achievementAlerts: true,
  },
  studySettings: {
    dailyGoal: 60,
    preferredStudyTime: '19:00',
    flashcardInterval: 1,
    examMode: 'practice',
  },
}

export const useUserStore = create<UserState>()(
  persist(
    immer((set) => ({
      currentUser: null,
      preferences: defaultPreferences,
      currentSession: null,

      setCurrentUser: (user) =>
        set((state) => {
          state.currentUser = user
        }),

      clearCurrentUser: () =>
        set((state) => {
          state.currentUser = null
          state.currentSession = null
        }),

      updatePreferences: (preferences) =>
        set((state) => {
          state.preferences = { ...state.preferences, ...preferences }
        }),

      startStudySession: (processId) =>
        set((state) => {
          state.currentSession = {
            startTime: new Date(),
            processId,
            duration: 0,
          }
        }),

      endStudySession: () =>
        set((state) => {
          state.currentSession = null
        }),

      updateSessionDuration: (minutes) =>
        set((state) => {
          if (state.currentSession) {
            state.currentSession.duration = minutes
          }
        }),
    })),
    {
      name: 'pmp-user-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        preferences: state.preferences,
      }),
    }
  )
)
