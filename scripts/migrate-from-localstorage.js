#!/usr/bin/env node

/**
 * Migration Script: LocalStorage to PostgreSQL
 * This script migrates data from LocalStorage format to the new PostgreSQL database
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'
import bcrypt from 'bcrypt'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const prisma = new PrismaClient()

// ============================================================================
// Migration Functions
// ============================================================================

/**
 * Create or get user for migration
 */
async function getOrCreateUser(email, username) {
  let user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    const hashedPassword = await bcrypt.hash('temporaryPassword123', 10)
    user = await prisma.user.create({
      data: {
        email,
        username: username || email.split('@')[0],
        passwordHash: hashedPassword,
        emailVerified: true,
        isActive: true,
        preferences: {
          create: {
            theme: 'light',
            language: 'ja',
            dailyGoalMinutes: 60,
          },
        },
      },
    })
    console.log(`Created new user: ${email}`)
  }

  return user
}

/**
 * Migrate learning progress data
 */
async function migrateLearningProgress(userId, progressData) {
  const results = {
    success: 0,
    failed: 0,
    skipped: 0,
  }

  for (const item of progressData) {
    try {
      // Check if process exists
      const process = await prisma.process.findUnique({
        where: { code: item.processCode || item.processId?.toString() },
      })

      if (!process) {
        console.warn(`Process not found: ${item.processCode || item.processId}`)
        results.skipped++
        continue
      }

      // Upsert learning progress
      await prisma.learningProgress.upsert({
        where: {
          userId_processId: {
            userId: userId,
            processId: process.id,
          },
        },
        update: {
          status: mapProgressStatus(item.status),
          understandingLevel: item.understandingLevel || item.understanding || 0,
          studyTimeMinutes: item.studyTimeMinutes || item.studyTime || 0,
          notes: item.notes,
          lastStudiedAt: item.lastStudiedAt ? new Date(item.lastStudiedAt) : null,
          completedAt: item.completedAt ? new Date(item.completedAt) : null,
          reviewCount: item.reviewCount || 0,
        },
        create: {
          userId: userId,
          processId: process.id,
          status: mapProgressStatus(item.status),
          understandingLevel: item.understandingLevel || item.understanding || 0,
          studyTimeMinutes: item.studyTimeMinutes || item.studyTime || 0,
          notes: item.notes,
          lastStudiedAt: item.lastStudiedAt ? new Date(item.lastStudiedAt) : null,
          completedAt: item.completedAt ? new Date(item.completedAt) : null,
          reviewCount: item.reviewCount || 0,
        },
      })

      results.success++
    } catch (error) {
      console.error(`Failed to migrate progress item:`, error)
      results.failed++
    }
  }

  return results
}

/**
 * Migrate study sessions
 */
async function migrateStudySessions(userId, sessionsData) {
  const results = {
    success: 0,
    failed: 0,
  }

  for (const session of sessionsData) {
    try {
      const startedAt = new Date(session.startedAt || session.date || session.timestamp)
      const durationMinutes = session.durationMinutes || session.duration || 30
      const endedAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000)

      await prisma.studySession.create({
        data: {
          userId: userId,
          sessionType: mapSessionType(session.type || session.sessionType),
          targetId: session.targetId || session.processId?.toString(),
          durationMinutes: durationMinutes,
          itemsStudied: session.itemsStudied,
          itemsCorrect: session.itemsCorrect,
          performanceScore: session.performanceScore || session.score,
          sessionData: session.metadata || session.data || {},
          startedAt: startedAt,
          endedAt: endedAt,
        },
      })

      results.success++
    } catch (error) {
      console.error(`Failed to migrate study session:`, error)
      results.failed++
    }
  }

  return results
}

/**
 * Migrate exam attempts and results
 */
async function migrateExamResults(userId, examData) {
  const results = {
    success: 0,
    failed: 0,
  }

  for (const exam of examData) {
    try {
      const startedAt = new Date(exam.startedAt || exam.timestamp || exam.date)
      const timeSpentMinutes = exam.timeSpentMinutes || exam.duration || 0
      const completedAt =
        exam.completedAt ||
        (timeSpentMinutes > 0 ? new Date(startedAt.getTime() + timeSpentMinutes * 60 * 1000) : null)

      const attempt = await prisma.examAttempt.create({
        data: {
          userId: userId,
          examType: exam.examType || exam.type || 'practice',
          totalQuestions: exam.totalQuestions || exam.questions?.length || 0,
          questionsAnswered: exam.questionsAnswered || exam.answered || 0,
          correctAnswers: exam.correctAnswers || exam.correct || 0,
          score: exam.score || exam.percentage || 0,
          timeLimitMinutes: exam.timeLimitMinutes || 230,
          timeSpentMinutes: timeSpentMinutes,
          status: exam.status || 'completed',
          startedAt: startedAt,
          completedAt: completedAt,
        },
      })

      // Migrate individual answers if available
      if (exam.answers && Array.isArray(exam.answers)) {
        for (const answer of exam.answers) {
          if (answer.questionId) {
            await prisma.examAnswer
              .create({
                data: {
                  attemptId: attempt.id,
                  questionId: answer.questionId,
                  selectedOptions: answer.selectedOptions || [],
                  isCorrect: answer.isCorrect,
                  isBookmarked: answer.isBookmarked || false,
                  timeSpentSeconds: answer.timeSpentSeconds,
                  answeredAt: answer.answeredAt ? new Date(answer.answeredAt) : null,
                },
              })
              .catch((err) => {
                console.warn(`Failed to migrate exam answer: ${err.message}`)
              })
          }
        }
      }

      results.success++
    } catch (error) {
      console.error(`Failed to migrate exam attempt:`, error)
      results.failed++
    }
  }

  return results
}

/**
 * Migrate flashcard reviews
 */
async function migrateFlashcardReviews(userId, flashcardData) {
  const results = {
    success: 0,
    failed: 0,
    skipped: 0,
  }

  for (const review of flashcardData) {
    try {
      // First, ensure the flashcard exists
      let flashcard

      if (review.flashcardId) {
        flashcard = await prisma.flashcard.findUnique({
          where: { id: review.flashcardId },
        })
      } else if (review.processId) {
        // Create a flashcard if it doesn't exist
        const process = await prisma.process.findUnique({
          where: { id: review.processId },
        })

        if (!process) {
          results.skipped++
          continue
        }

        flashcard = await prisma.flashcard.create({
          data: {
            frontText: review.frontText || `Process: ${process.nameJa}`,
            backText: review.backText || process.description || '',
            processId: process.id,
            difficultyLevel: review.difficulty || 3,
          },
        })
      } else {
        results.skipped++
        continue
      }

      // Create or update the review
      await prisma.flashcardReview.upsert({
        where: {
          userId_flashcardId: {
            userId: userId,
            flashcardId: flashcard.id,
          },
        },
        update: {
          easeFactor: review.easeFactor || 2.5,
          intervalDays: review.intervalDays || 1,
          repetitions: review.repetitions || 0,
          quality: review.quality,
          nextReviewDate: review.nextReviewDate ? new Date(review.nextReviewDate) : null,
          lastReviewedAt: review.lastReviewedAt ? new Date(review.lastReviewedAt) : null,
        },
        create: {
          userId: userId,
          flashcardId: flashcard.id,
          easeFactor: review.easeFactor || 2.5,
          intervalDays: review.intervalDays || 1,
          repetitions: review.repetitions || 0,
          quality: review.quality,
          nextReviewDate: review.nextReviewDate ? new Date(review.nextReviewDate) : null,
          lastReviewedAt: review.lastReviewedAt ? new Date(review.lastReviewedAt) : null,
        },
      })

      results.success++
    } catch (error) {
      console.error(`Failed to migrate flashcard review:`, error)
      results.failed++
    }
  }

  return results
}

/**
 * Migrate study notes
 */
async function migrateStudyNotes(userId, notesData) {
  const results = {
    success: 0,
    failed: 0,
  }

  for (const note of notesData) {
    try {
      let processId = null

      if (note.processId || note.processCode) {
        const process = await prisma.process.findFirst({
          where: {
            OR: [{ id: note.processId }, { code: note.processCode }],
          },
        })
        processId = process?.id
      }

      await prisma.studyNote.create({
        data: {
          userId: userId,
          processId: processId,
          title: note.title || 'Untitled Note',
          content: note.content || note.text || '',
          contentType: note.contentType || 'markdown',
          isPublic: note.isPublic || false,
          tags: note.tags || [],
          viewCount: note.viewCount || 0,
        },
      })

      results.success++
    } catch (error) {
      console.error(`Failed to migrate study note:`, error)
      results.failed++
    }
  }

  return results
}

// ============================================================================
// Helper Functions
// ============================================================================

function mapProgressStatus(status) {
  const statusMap = {
    not_started: 'not_started',
    notStarted: 'not_started',
    in_progress: 'in_progress',
    inProgress: 'in_progress',
    completed: 'completed',
    reviewing: 'reviewing',
    review: 'reviewing',
  }

  return statusMap[status] || 'not_started'
}

function mapSessionType(type) {
  const typeMap = {
    process: 'process',
    flashcard: 'flashcard',
    exam: 'exam',
    reading: 'reading',
    quiz: 'exam',
    study: 'process',
  }

  return typeMap[type] || 'process'
}

// ============================================================================
// Main Migration Process
// ============================================================================

async function migrateFromLocalStorage(dataFilePath, userEmail) {
  console.log('Starting migration from LocalStorage to PostgreSQL...')
  console.log(`Data file: ${dataFilePath}`)
  console.log(`User email: ${userEmail}`)

  try {
    // Read the LocalStorage data file
    const dataContent = await fs.readFile(dataFilePath, 'utf-8')
    const localStorageData = JSON.parse(dataContent)

    // Get or create user
    const username = localStorageData.userProfile?.username || userEmail.split('@')[0]
    const user = await getOrCreateUser(userEmail, username)
    console.log(`Using user ID: ${user.id}`)

    // Migration results
    const results = {
      learningProgress: { success: 0, failed: 0, skipped: 0 },
      studySessions: { success: 0, failed: 0 },
      examResults: { success: 0, failed: 0 },
      flashcardReviews: { success: 0, failed: 0, skipped: 0 },
      studyNotes: { success: 0, failed: 0 },
    }

    // Migrate learning progress
    if (localStorageData.learningProgress || localStorageData.progress) {
      console.log('\nMigrating learning progress...')
      const progressData = localStorageData.learningProgress || localStorageData.progress || []
      results.learningProgress = await migrateLearningProgress(user.id, progressData)
    }

    // Migrate study sessions
    if (localStorageData.studySessions || localStorageData.sessions) {
      console.log('\nMigrating study sessions...')
      const sessionsData = localStorageData.studySessions || localStorageData.sessions || []
      results.studySessions = await migrateStudySessions(user.id, sessionsData)
    }

    // Migrate exam results
    if (localStorageData.examResults || localStorageData.exams) {
      console.log('\nMigrating exam results...')
      const examData = localStorageData.examResults || localStorageData.exams || []
      results.examResults = await migrateExamResults(user.id, examData)
    }

    // Migrate flashcard reviews
    if (localStorageData.flashcardReviews || localStorageData.flashcards) {
      console.log('\nMigrating flashcard reviews...')
      const flashcardData = localStorageData.flashcardReviews || localStorageData.flashcards || []
      results.flashcardReviews = await migrateFlashcardReviews(user.id, flashcardData)
    }

    // Migrate study notes
    if (localStorageData.studyNotes || localStorageData.notes) {
      console.log('\nMigrating study notes...')
      const notesData = localStorageData.studyNotes || localStorageData.notes || []
      results.studyNotes = await migrateStudyNotes(user.id, notesData)
    }

    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('Migration Summary:')
    console.log('='.repeat(60))

    Object.entries(results).forEach(([category, stats]) => {
      console.log(`\n${category}:`)
      Object.entries(stats).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`)
      })
    })

    console.log('\n' + '='.repeat(60))
    console.log('Migration completed successfully!')

    return results
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// ============================================================================
// CLI Execution
// ============================================================================

if (process.argv.length < 4) {
  console.log('Usage: node migrate-from-localstorage.js <data-file> <user-email>')
  console.log(
    'Example: node migrate-from-localstorage.js ./data/localstorage.json user@example.com'
  )
  process.exit(1)
}

const dataFile = path.resolve(process.argv[2])
const userEmail = process.argv[3]

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(userEmail)) {
  console.error('Invalid email format')
  process.exit(1)
}

// Run migration
migrateFromLocalStorage(dataFile, userEmail)
  .then(() => {
    console.log('\nMigration process completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nMigration process failed:', error)
    process.exit(1)
  })
