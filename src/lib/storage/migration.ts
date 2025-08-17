import { z } from 'zod'
import { IndexedDBStorage } from './indexedDb'
import { SyncQueue } from './syncQueue'
import { logger } from '../../services/logger'

// Migration schemas for data validation
export const LegacyProgressSchema = z.object({
  processGroups: z.record(z.number()),
  knowledgeAreas: z.record(z.number()),
  processes: z.record(z.number()),
  totalStudyTime: z.number().optional(),
  lastUpdated: z.string().optional(),
})

export const LegacyExamResultSchema = z.object({
  examId: z.string(),
  score: z.number(),
  totalQuestions: z.number(),
  correctAnswers: z.number(),
  timeSpent: z.number(),
  knowledgeAreaScores: z.record(z.number()),
  completedAt: z.string(),
  answers: z.record(z.union([z.string(), z.number()])),
})

export const LegacyFlashCardSchema = z.object({
  processId: z.string(),
  confidence: z.number(),
  reviewCount: z.number(),
  lastReviewedAt: z.string(),
  nextReviewAt: z.string(),
})

export interface MigrationStatus {
  version: string
  completed: boolean
  errors: string[]
  progress: number
  startedAt?: string
  completedAt?: string
  backupCreated?: boolean
  dataValidated?: boolean
}

export interface MigrationReport {
  status: MigrationStatus
  migratedItems: {
    progress: number
    examResults: number
    flashCards: number
    settings: number
  }
  validationErrors: string[]
  warnings: string[]
}

export class MigrationService {
  private storage: IndexedDBStorage
  private syncQueue: SyncQueue
  private readonly CURRENT_VERSION = '2.0.0'
  private readonly MIGRATION_KEY = 'pmp-migration-status'

  constructor() {
    this.storage = new IndexedDBStorage()
    this.syncQueue = new SyncQueue()
  }

  /**
   * Get current migration status
   */
  async getMigrationStatus(): Promise<MigrationStatus> {
    try {
      const status = localStorage.getItem(this.MIGRATION_KEY)
      if (status) {
        return JSON.parse(status) as MigrationStatus
      }

      return {
        version: this.CURRENT_VERSION,
        completed: false,
        errors: [],
        progress: 0,
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to get migration status:', error)
      }
      return {
        version: this.CURRENT_VERSION,
        completed: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        progress: 0,
      }
    }
  }

  /**
   * Update migration status
   */
  private async updateMigrationStatus(status: Partial<MigrationStatus>): Promise<void> {
    const currentStatus = await this.getMigrationStatus()
    const updatedStatus = { ...currentStatus, ...status }
    localStorage.setItem(this.MIGRATION_KEY, JSON.stringify(updatedStatus))
  }

  /**
   * Create backup of existing localStorage data
   */
  async createBackup(): Promise<boolean> {
    try {
      const backup: Record<string, unknown> = {}

      // Backup all PMP-related localStorage items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (
          key &&
          (key.includes('pmp-') || key.includes('learning-') || key.includes('progress-'))
        ) {
          backup[key] = localStorage.getItem(key)
        }
      }

      // Store backup in IndexedDB
      await this.storage.setItem('backup-' + Date.now(), backup)

      await this.updateMigrationStatus({
        backupCreated: true,
        progress: 10,
      })

      return true
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to create backup:', error)
      }
      await this.updateMigrationStatus({
        errors: [error instanceof Error ? error.message : 'Backup creation failed'],
      })
      return false
    }
  }

  /**
   * Validate localStorage data before migration
   */
  async validateLegacyData(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    try {
      // Validate progress data
      const progressData = localStorage.getItem('learning-progress')
      if (progressData) {
        try {
          const parsed = JSON.parse(progressData)
          LegacyProgressSchema.parse(parsed)
        } catch (err) {
          errors.push(
            `Invalid progress data: ${err instanceof Error ? err.message : 'Unknown error'}`
          )
        }
      }

      // Validate exam results
      const examResults = localStorage.getItem('exam-results')
      if (examResults) {
        try {
          const parsed = JSON.parse(examResults)
          if (Array.isArray(parsed)) {
            parsed.forEach((result, index) => {
              try {
                LegacyExamResultSchema.parse(result)
              } catch (err) {
                errors.push(
                  `Invalid exam result at index ${index}: ${err instanceof Error ? err.message : 'Unknown error'}`
                )
              }
            })
          }
        } catch (err) {
          errors.push(
            `Invalid exam results format: ${err instanceof Error ? err.message : 'Unknown error'}`
          )
        }
      }

      // Validate flashcard data
      const flashCardData = localStorage.getItem('flashcard-progress')
      if (flashCardData) {
        try {
          const parsed = JSON.parse(flashCardData)
          Object.entries(parsed).forEach(([key, value], _index) => {
            try {
              LegacyFlashCardSchema.parse(value)
            } catch (err) {
              errors.push(
                `Invalid flashcard data for ${key}: ${err instanceof Error ? err.message : 'Unknown error'}`
              )
            }
          })
        } catch (err) {
          errors.push(
            `Invalid flashcard data format: ${err instanceof Error ? err.message : 'Unknown error'}`
          )
        }
      }

      await this.updateMigrationStatus({
        dataValidated: true,
        progress: 20,
        errors: errors.length > 0 ? errors : [],
      })

      return { valid: errors.length === 0, errors }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Data validation failed'
      await this.updateMigrationStatus({
        errors: [errorMsg],
      })
      return { valid: false, errors: [errorMsg] }
    }
  }

  /**
   * Migrate learning progress data
   */
  private async migrateLearningProgress(): Promise<number> {
    try {
      const progressData = localStorage.getItem('learning-progress')
      if (!progressData) {return 0}

      const parsed = LegacyProgressSchema.parse(JSON.parse(progressData))

      // Transform to new format
      const modernProgress = {
        id: 'user-progress',
        userId: 'local-user',
        processGroups: parsed.processGroups,
        knowledgeAreas: parsed.knowledgeAreas,
        processes: parsed.processes,
        totalStudyTime: parsed.totalStudyTime || 0,
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
        version: this.CURRENT_VERSION,
        migratedFrom: 'localStorage',
        migratedAt: new Date().toISOString(),
      }

      await this.storage.setItem('learning-progress', modernProgress)
      await this.syncQueue.add('progress-update', modernProgress)

      return 1
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to migrate learning progress:', error)
      }
      throw error
    }
  }

  /**
   * Migrate exam results data
   */
  private async migrateExamResults(): Promise<number> {
    try {
      const examResults = localStorage.getItem('exam-results')
      if (!examResults) {return 0}

      const parsed = JSON.parse(examResults)
      const validResults = []

      if (Array.isArray(parsed)) {
        for (const result of parsed) {
          try {
            const validatedResult = LegacyExamResultSchema.parse(result)
            const modernResult = {
              ...validatedResult,
              id: `exam-${validatedResult.examId}-${Date.parse(validatedResult.completedAt)}`,
              userId: 'local-user',
              version: this.CURRENT_VERSION,
              migratedFrom: 'localStorage',
              migratedAt: new Date().toISOString(),
            }

            validResults.push(modernResult)
            await this.storage.setItem(`exam-result-${modernResult.id}`, modernResult)
            await this.syncQueue.add('exam-result-create', modernResult)
          } catch (err) {
            if (process.env.NODE_ENV === 'development') {
              logger.warn('Skipping invalid exam result:', err)
            }
          }
        }
      }

      return validResults.length
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to migrate exam results:', error)
      }
      throw error
    }
  }

  /**
   * Migrate flashcard progress data
   */
  private async migrateFlashCardProgress(): Promise<number> {
    try {
      const flashCardData = localStorage.getItem('flashcard-progress')
      if (!flashCardData) {return 0}

      const parsed = JSON.parse(flashCardData)
      const migratedCount = Object.keys(parsed).length

      for (const [processId, progress] of Object.entries(parsed)) {
        try {
          const validatedProgress = LegacyFlashCardSchema.parse(progress)
          const modernProgress = {
            ...validatedProgress,
            id: `flashcard-${processId}`,
            processId,
            userId: 'local-user',
            version: this.CURRENT_VERSION,
            migratedFrom: 'localStorage',
            migratedAt: new Date().toISOString(),
          }

          await this.storage.setItem(`flashcard-${processId}`, modernProgress)
          await this.syncQueue.add('flashcard-update', modernProgress)
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            logger.warn(`Skipping invalid flashcard progress for ${processId}:`, err)
          }
        }
      }

      return migratedCount
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to migrate flashcard progress:', error)
      }
      throw error
    }
  }

  /**
   * Migrate user settings
   */
  private async migrateUserSettings(): Promise<number> {
    try {
      let migratedCount = 0
      const settingsKeys = [
        'theme-preference',
        'user-preferences',
        'customization-settings',
        'notification-settings',
      ]

      for (const key of settingsKeys) {
        const value = localStorage.getItem(key)
        if (value) {
          try {
            const parsed = JSON.parse(value)
            const modernSetting = {
              key,
              value: parsed,
              userId: 'local-user',
              version: this.CURRENT_VERSION,
              migratedFrom: 'localStorage',
              migratedAt: new Date().toISOString(),
            }

            await this.storage.setItem(key, modernSetting)
            await this.syncQueue.add('setting-update', modernSetting)
            migratedCount++
          } catch (err) {
            if (process.env.NODE_ENV === 'development') {
              logger.warn(`Failed to migrate setting ${key}:`, err)
            }
          }
        }
      }

      return migratedCount
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to migrate user settings:', error)
      }
      throw error
    }
  }

  /**
   * Main migration function
   */
  async migrateFromLocalStorage(): Promise<MigrationReport> {
    const startTime = new Date().toISOString()

    await this.updateMigrationStatus({
      startedAt: startTime,
      progress: 0,
    })

    try {
      // Step 1: Create backup
      const backupSuccess = await this.createBackup()
      if (!backupSuccess) {
        throw new Error('Failed to create backup')
      }

      // Step 2: Validate data
      const validation = await this.validateLegacyData()
      if (!validation.valid && validation.errors.length > 5) {
        throw new Error(
          `Too many validation errors: ${validation.errors.slice(0, 3).join(', ')}...`
        )
      }

      // Step 3: Migrate data
      const migratedItems = {
        progress: 0,
        examResults: 0,
        flashCards: 0,
        settings: 0,
      }

      try {
        migratedItems.progress = await this.migrateLearningProgress()
        await this.updateMigrationStatus({ progress: 40 })
      } catch (err) {
        validation.errors.push(
          `Progress migration failed: ${err instanceof Error ? err.message : 'Unknown error'}`
        )
      }

      try {
        migratedItems.examResults = await this.migrateExamResults()
        await this.updateMigrationStatus({ progress: 60 })
      } catch (err) {
        validation.errors.push(
          `Exam results migration failed: ${err instanceof Error ? err.message : 'Unknown error'}`
        )
      }

      try {
        migratedItems.flashCards = await this.migrateFlashCardProgress()
        await this.updateMigrationStatus({ progress: 80 })
      } catch (err) {
        validation.errors.push(
          `Flashcard migration failed: ${err instanceof Error ? err.message : 'Unknown error'}`
        )
      }

      try {
        migratedItems.settings = await this.migrateUserSettings()
        await this.updateMigrationStatus({ progress: 90 })
      } catch (err) {
        validation.errors.push(
          `Settings migration failed: ${err instanceof Error ? err.message : 'Unknown error'}`
        )
      }

      // Step 4: Complete migration
      const completedAt = new Date().toISOString()
      const finalStatus: MigrationStatus = {
        version: this.CURRENT_VERSION,
        completed: true,
        errors: validation.errors,
        progress: 100,
        startedAt: startTime,
        completedAt,
        backupCreated: true,
        dataValidated: true,
      }

      await this.updateMigrationStatus(finalStatus)

      return {
        status: finalStatus,
        migratedItems,
        validationErrors: validation.errors,
        warnings: [],
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Migration failed'
      const failedStatus: MigrationStatus = {
        version: this.CURRENT_VERSION,
        completed: false,
        errors: [errorMsg],
        progress: 0,
        startedAt: startTime,
      }

      await this.updateMigrationStatus(failedStatus)

      return {
        status: failedStatus,
        migratedItems: { progress: 0, examResults: 0, flashCards: 0, settings: 0 },
        validationErrors: [errorMsg],
        warnings: [],
      }
    }
  }

  /**
   * Check if migration is needed
   */
  async isMigrationNeeded(): Promise<boolean> {
    const status = await this.getMigrationStatus()

    if (status.completed) {
      return false
    }

    // Check if there's any legacy data to migrate
    const hasLegacyData = [
      'learning-progress',
      'exam-results',
      'flashcard-progress',
      'theme-preference',
    ].some((key) => localStorage.getItem(key) !== null)

    return hasLegacyData
  }

  /**
   * Reset migration status (for testing)
   */
  async resetMigration(): Promise<void> {
    localStorage.removeItem(this.MIGRATION_KEY)
    await this.storage.clear()
    await this.syncQueue.clear()
  }
}

export const __migrationService = new MigrationService()
