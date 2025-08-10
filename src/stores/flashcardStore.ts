/**
 * Enhanced Flashcard System Store with Spaced Repetition
 * Developer 3: Flashcard System Developer Implementation
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { api } from '../lib/api/client'

export interface FlashCard {
  id: string
  front: string
  back: string
  processId?: string
  knowledgeArea?: string
  processGroup?: string
  tags: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  type: 'definition' | 'itto' | 'concept' | 'formula' | 'example'
  createdBy: 'system' | 'user' | string
  createdAt: Date
  updatedAt: Date
  isActive: boolean

  // Spaced repetition data
  easeFactor: number // 2.5 default
  interval: number // Days until next review
  repetitions: number
  nextReviewDate: Date
  lastReviewDate?: Date

  // Learning analytics
  totalReviews: number
  correctReviews: number
  incorrectReviews: number
  averageResponseTime: number // milliseconds

  // Multimedia support
  imageUrl?: string
  audioUrl?: string

  // Additional metadata
  references?: string[]
  relatedCards?: string[]
}

export interface FlashCardDeck {
  id: string
  name: string
  description: string
  cardIds: string[]
  isPublic: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
  category: 'pmbok' | 'custom' | 'shared'
  difficulty: 'mixed' | 'easy' | 'medium' | 'hard'

  // Statistics
  totalCards: number
  masteredCards: number
  averageEaseFactor: number
  lastStudied?: Date
}

export interface StudySession {
  id: string
  deckId: string
  startTime: Date
  endTime?: Date
  cardsStudied: number
  correctAnswers: number
  totalTime: number // seconds
  averageResponseTime: number
  cardResults: Array<{
    cardId: string
    isCorrect: boolean
    responseTime: number
    difficulty: 1 | 2 | 3 | 4 | 5 // User-reported difficulty
    timestamp: Date
  }>
}

export interface SpacedRepetitionStats {
  totalCards: number
  dueToday: number
  dueThisWeek: number
  mastered: number
  learning: number
  review: number
  streak: number
  lastStudyDate?: Date
}

interface FlashCardStore {
  // Core data
  cards: Record<string, FlashCard>
  decks: Record<string, FlashCardDeck>
  studySessions: StudySession[]

  // Current session
  currentDeck: FlashCardDeck | null
  currentCards: FlashCard[]
  currentCardIndex: number
  isStudying: boolean
  sessionStartTime?: Date
  sessionStats: {
    studied: number
    correct: number
    incorrect: number
    skipped: number
  }

  // UI state
  isLoading: boolean
  error: string | null
  showAnswer: boolean

  // Filters and settings
  studyFilters: {
    knowledgeArea?: string
    processGroup?: string
    difficulty?: string
    tags?: string[]
    dueOnly: boolean
  }
  studySettings: {
    maxNewCardsPerDay: number
    maxReviewCardsPerDay: number
    enableAudio: boolean
    autoReveal: boolean
    autoRevealDelay: number // seconds
    shuffleCards: boolean
  }

  // Actions - Card management
  loadCards: () => Promise<void>
  createCard: (
    card: Omit<
      FlashCard,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'totalReviews'
      | 'correctReviews'
      | 'incorrectReviews'
      | 'averageResponseTime'
    >
  ) => Promise<string>
  updateCard: (cardId: string, updates: Partial<FlashCard>) => Promise<void>
  deleteCard: (cardId: string) => Promise<void>
  duplicateCard: (cardId: string) => Promise<string>

  // Actions - Deck management
  loadDecks: () => Promise<void>
  createDeck: (
    deck: Omit<
      FlashCardDeck,
      'id' | 'createdAt' | 'updatedAt' | 'totalCards' | 'masteredCards' | 'averageEaseFactor'
    >
  ) => Promise<string>
  updateDeck: (deckId: string, updates: Partial<FlashCardDeck>) => Promise<void>
  deleteDeck: (deckId: string) => Promise<void>
  addCardToDeck: (deckId: string, cardId: string) => Promise<void>
  removeCardFromDeck: (deckId: string, cardId: string) => Promise<void>

  // Actions - Study session
  startStudySession: (
    deckId: string,
    filters?: Partial<FlashCardStore['studyFilters']>
  ) => Promise<void>
  endStudySession: () => Promise<void>
  nextCard: () => void
  previousCard: () => void
  skipCard: () => void
  revealAnswer: () => void
  rateCard: (difficulty: 1 | 2 | 3 | 4 | 5, responseTime: number) => Promise<void>

  // Actions - Spaced repetition
  updateSpacedRepetition: (cardId: string, quality: number, responseTime: number) => void
  getDueCards: (deckId?: string) => FlashCard[]
  getNewCards: (deckId?: string, limit?: number) => FlashCard[]
  getSpacedRepetitionStats: () => SpacedRepetitionStats

  // Actions - Analytics
  getStudyStatistics: (
    deckId?: string,
    days?: number
  ) => {
    totalSessions: number
    totalCards: number
    averageAccuracy: number
    averageSessionTime: number
    studyStreak: number
    progressTrend: Array<{ date: string; cards: number; accuracy: number }>
  }

  // Actions - Import/Export
  exportDeck: (deckId: string) => string
  importDeck: (data: string) => Promise<string>
  exportAllData: () => string
  importAllData: (data: string) => Promise<void>

  // Actions - Sharing
  shareCard: (cardId: string) => Promise<string>
  shareDeck: (deckId: string) => Promise<string>

  // Utility functions
  searchCards: (query: string) => FlashCard[]
  getCardsByFilter: (filters: Partial<FlashCardStore['studyFilters']>) => FlashCard[]
  getCurrentCard: () => FlashCard | null
  hasNextCard: () => boolean
  hasPreviousCard: () => boolean

  // Settings
  updateStudySettings: (settings: Partial<FlashCardStore['studySettings']>) => void

  // Reset
  reset: () => void
}

const DEFAULT_STUDY_SETTINGS = {
  maxNewCardsPerDay: 20,
  maxReviewCardsPerDay: 100,
  enableAudio: false,
  autoReveal: false,
  autoRevealDelay: 3,
  shuffleCards: true,
}

// Spaced repetition algorithm (SuperMemo 2)
const calculateSpacedRepetition = (
  easeFactor: number,
  interval: number,
  repetitions: number,
  quality: number // 0-5 scale
) => {
  let newEaseFactor = easeFactor
  let newInterval = interval
  let newRepetitions = repetitions

  if (quality >= 3) {
    // Correct response
    newRepetitions += 1

    if (newRepetitions === 1) {
      newInterval = 1
    } else if (newRepetitions === 2) {
      newInterval = 6
    } else {
      newInterval = Math.round(interval * easeFactor)
    }
  } else {
    // Incorrect response
    newRepetitions = 0
    newInterval = 1
  }

  // Update ease factor
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  newEaseFactor = Math.max(1.3, newEaseFactor)

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewDate: new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000),
  }
}

export const useFlashCardStore = create<FlashCardStore>()(
  persist(
    immer((set, get) => ({
      cards: {},
      decks: {},
      studySessions: [],

      currentDeck: null,
      currentCards: [],
      currentCardIndex: 0,
      isStudying: false,
      sessionStats: {
        studied: 0,
        correct: 0,
        incorrect: 0,
        skipped: 0,
      },

      isLoading: false,
      error: null,
      showAnswer: false,

      studyFilters: {
        dueOnly: true,
      },
      studySettings: DEFAULT_STUDY_SETTINGS,

      loadCards: async () => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          const cards = await api.flashcards.getCards.query()
          set((state) => {
            state.cards = cards.reduce(
              (acc, card) => {
                acc[card.id] = {
                  ...card,
                  createdAt: new Date(card.createdAt),
                  updatedAt: new Date(card.updatedAt),
                  nextReviewDate: new Date(card.nextReviewDate),
                  lastReviewDate: card.lastReviewDate ? new Date(card.lastReviewDate) : undefined,
                }
                return acc
              },
              {} as Record<string, FlashCard>
            )
            state.isLoading = false
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to load cards'
            state.isLoading = false
          })
        }
      },

      createCard: async (cardData) => {
        const cardId = crypto.randomUUID()
        const now = new Date()

        const card: FlashCard = {
          ...cardData,
          id: cardId,
          createdAt: now,
          updatedAt: now,
          easeFactor: 2.5,
          interval: 1,
          repetitions: 0,
          nextReviewDate: now,
          totalReviews: 0,
          correctReviews: 0,
          incorrectReviews: 0,
          averageResponseTime: 0,
        }

        set((state) => {
          state.cards[cardId] = card
        })

        try {
          await api.flashcards.createCard.mutate(card)
        } catch (error) {
          // Rollback on error
          set((state) => {
            delete state.cards[cardId]
            state.error = error instanceof Error ? error.message : 'Failed to create card'
          })
          throw error
        }

        return cardId
      },

      updateCard: async (cardId: string, updates: Partial<FlashCard>) => {
        const originalCard = get().cards[cardId]
        if (!originalCard) return

        set((state) => {
          state.cards[cardId] = { ...state.cards[cardId], ...updates, updatedAt: new Date() }
        })

        try {
          await api.flashcards.updateCard.mutate({ cardId, updates })
        } catch (error) {
          // Rollback on error
          set((state) => {
            state.cards[cardId] = originalCard
            state.error = error instanceof Error ? error.message : 'Failed to update card'
          })
        }
      },

      deleteCard: async (cardId: string) => {
        const originalCard = get().cards[cardId]

        set((state) => {
          delete state.cards[cardId]
          // Remove from all decks
          Object.values(state.decks).forEach((deck) => {
            deck.cardIds = deck.cardIds.filter((id) => id !== cardId)
          })
        })

        try {
          await api.flashcards.deleteCard.mutate({ cardId })
        } catch (error) {
          // Rollback on error
          if (originalCard) {
            set((state) => {
              state.cards[cardId] = originalCard
              state.error = error instanceof Error ? error.message : 'Failed to delete card'
            })
          }
        }
      },

      duplicateCard: async (cardId: string) => {
        const originalCard = get().cards[cardId]
        if (!originalCard) throw new Error('Card not found')

        const newCardId = await get().createCard({
          ...originalCard,
          front: originalCard.front + ' (Copy)',
          easeFactor: 2.5,
          interval: 1,
          repetitions: 0,
          nextReviewDate: new Date(),
          totalReviews: 0,
          correctReviews: 0,
          incorrectReviews: 0,
          averageResponseTime: 0,
        })

        return newCardId
      },

      loadDecks: async () => {
        set((state) => {
          state.isLoading = true
        })

        try {
          const decks = await api.flashcards.getDecks.query()
          set((state) => {
            state.decks = decks.reduce(
              (acc, deck) => {
                acc[deck.id] = {
                  ...deck,
                  createdAt: new Date(deck.createdAt),
                  updatedAt: new Date(deck.updatedAt),
                  lastStudied: deck.lastStudied ? new Date(deck.lastStudied) : undefined,
                }
                return acc
              },
              {} as Record<string, FlashCardDeck>
            )
            state.isLoading = false
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to load decks'
            state.isLoading = false
          })
        }
      },

      createDeck: async (deckData) => {
        const deckId = crypto.randomUUID()
        const now = new Date()

        const deck: FlashCardDeck = {
          ...deckData,
          id: deckId,
          createdAt: now,
          updatedAt: now,
          totalCards: deckData.cardIds.length,
          masteredCards: 0,
          averageEaseFactor: 2.5,
        }

        set((state) => {
          state.decks[deckId] = deck
        })

        try {
          await api.flashcards.createDeck.mutate(deck)
        } catch (error) {
          set((state) => {
            delete state.decks[deckId]
            state.error = error instanceof Error ? error.message : 'Failed to create deck'
          })
          throw error
        }

        return deckId
      },

      updateDeck: async (deckId: string, updates: Partial<FlashCardDeck>) => {
        const originalDeck = get().decks[deckId]
        if (!originalDeck) return

        set((state) => {
          state.decks[deckId] = { ...state.decks[deckId], ...updates, updatedAt: new Date() }
        })

        try {
          await api.flashcards.updateDeck.mutate({ deckId, updates })
        } catch (error) {
          set((state) => {
            state.decks[deckId] = originalDeck
            state.error = error instanceof Error ? error.message : 'Failed to update deck'
          })
        }
      },

      deleteDeck: async (deckId: string) => {
        const originalDeck = get().decks[deckId]

        set((state) => {
          delete state.decks[deckId]
        })

        try {
          await api.flashcards.deleteDeck.mutate({ deckId })
        } catch (error) {
          if (originalDeck) {
            set((state) => {
              state.decks[deckId] = originalDeck
              state.error = error instanceof Error ? error.message : 'Failed to delete deck'
            })
          }
        }
      },

      addCardToDeck: async (deckId: string, cardId: string) => {
        const deck = get().decks[deckId]
        if (!deck || deck.cardIds.includes(cardId)) return

        set((state) => {
          state.decks[deckId].cardIds.push(cardId)
          state.decks[deckId].totalCards += 1
        })

        try {
          await api.flashcards.addCardToDeck.mutate({ deckId, cardId })
        } catch (error) {
          set((state) => {
            state.decks[deckId].cardIds = state.decks[deckId].cardIds.filter((id) => id !== cardId)
            state.decks[deckId].totalCards -= 1
            state.error = error instanceof Error ? error.message : 'Failed to add card to deck'
          })
        }
      },

      removeCardFromDeck: async (deckId: string, cardId: string) => {
        const deck = get().decks[deckId]
        if (!deck || !deck.cardIds.includes(cardId)) return

        set((state) => {
          state.decks[deckId].cardIds = state.decks[deckId].cardIds.filter((id) => id !== cardId)
          state.decks[deckId].totalCards -= 1
        })

        try {
          await api.flashcards.removeCardFromDeck.mutate({ deckId, cardId })
        } catch (error) {
          set((state) => {
            state.decks[deckId].cardIds.push(cardId)
            state.decks[deckId].totalCards += 1
            state.error = error instanceof Error ? error.message : 'Failed to remove card from deck'
          })
        }
      },

      startStudySession: async (deckId: string, filters) => {
        const deck = get().decks[deckId]
        if (!deck) throw new Error('Deck not found')

        // Apply filters to get cards for study
        const allDeckCards = deck.cardIds.map((id) => get().cards[id]).filter(Boolean)
        let studyCards = allDeckCards

        const effectiveFilters = { ...get().studyFilters, ...filters }

        // Apply filters
        if (effectiveFilters.dueOnly) {
          const now = new Date()
          studyCards = studyCards.filter((card) => card.nextReviewDate <= now)
        }

        if (effectiveFilters.knowledgeArea) {
          studyCards = studyCards.filter(
            (card) => card.knowledgeArea === effectiveFilters.knowledgeArea
          )
        }

        if (effectiveFilters.processGroup) {
          studyCards = studyCards.filter(
            (card) => card.processGroup === effectiveFilters.processGroup
          )
        }

        if (effectiveFilters.difficulty) {
          studyCards = studyCards.filter((card) => card.difficulty === effectiveFilters.difficulty)
        }

        // Shuffle cards if enabled
        if (get().studySettings.shuffleCards) {
          studyCards = studyCards.sort(() => Math.random() - 0.5)
        }

        set((state) => {
          state.currentDeck = deck
          state.currentCards = studyCards
          state.currentCardIndex = 0
          state.isStudying = true
          state.sessionStartTime = new Date()
          state.showAnswer = false
          state.sessionStats = {
            studied: 0,
            correct: 0,
            incorrect: 0,
            skipped: 0,
          }
        })

        // Create study session record
        const session: StudySession = {
          id: crypto.randomUUID(),
          deckId,
          startTime: new Date(),
          cardsStudied: 0,
          correctAnswers: 0,
          totalTime: 0,
          averageResponseTime: 0,
          cardResults: [],
        }

        set((state) => {
          state.studySessions.unshift(session)
        })
      },

      endStudySession: async () => {
        const currentSession = get().studySessions[0]
        if (!currentSession || currentSession.endTime) return

        const endTime = new Date()
        const totalTime = Math.floor(
          (endTime.getTime() - currentSession.startTime.getTime()) / 1000
        )

        set((state) => {
          if (state.studySessions[0]) {
            state.studySessions[0].endTime = endTime
            state.studySessions[0].totalTime = totalTime
            state.studySessions[0].averageResponseTime =
              state.studySessions[0].cardResults.length > 0
                ? state.studySessions[0].cardResults.reduce((sum, r) => sum + r.responseTime, 0) /
                  state.studySessions[0].cardResults.length
                : 0
          }
          state.isStudying = false
          state.currentDeck = null
          state.currentCards = []
          state.currentCardIndex = 0
          state.showAnswer = false
        })

        try {
          await api.flashcards.recordStudySession.mutate({
            sessionId: currentSession.id,
            endTime,
            totalTime,
            cardResults: currentSession.cardResults,
          })
        } catch (error) {
          console.warn('Failed to record study session:', error)
        }
      },

      nextCard: () => {
        set((state) => {
          if (state.currentCardIndex < state.currentCards.length - 1) {
            state.currentCardIndex += 1
            state.showAnswer = false
          } else {
            // End session when no more cards
            state.isStudying = false
          }
        })
      },

      previousCard: () => {
        set((state) => {
          if (state.currentCardIndex > 0) {
            state.currentCardIndex -= 1
            state.showAnswer = false
          }
        })
      },

      skipCard: () => {
        set((state) => {
          state.sessionStats.skipped += 1
        })
        get().nextCard()
      },

      revealAnswer: () => {
        set((state) => {
          state.showAnswer = true
        })
      },

      rateCard: async (difficulty: 1 | 2 | 3 | 4 | 5, responseTime: number) => {
        const currentCard = get().getCurrentCard()
        if (!currentCard) return

        const quality = difficulty - 1 // Convert to 0-4 scale for spaced repetition
        const isCorrect = difficulty >= 3

        // Update spaced repetition data
        get().updateSpacedRepetition(currentCard.id, quality, responseTime)

        // Update session stats
        set((state) => {
          state.sessionStats.studied += 1
          if (isCorrect) {
            state.sessionStats.correct += 1
          } else {
            state.sessionStats.incorrect += 1
          }

          // Record result in current session
          if (state.studySessions[0]) {
            state.studySessions[0].cardResults.push({
              cardId: currentCard.id,
              isCorrect,
              responseTime,
              difficulty,
              timestamp: new Date(),
            })
            state.studySessions[0].cardsStudied += 1
            if (isCorrect) state.studySessions[0].correctAnswers += 1
          }
        })

        // Move to next card
        get().nextCard()
      },

      updateSpacedRepetition: (cardId: string, quality: number, responseTime: number) => {
        const card = get().cards[cardId]
        if (!card) return

        const { easeFactor, interval, repetitions, nextReviewDate } = calculateSpacedRepetition(
          card.easeFactor,
          card.interval,
          card.repetitions,
          quality
        )

        set((state) => {
          const cardToUpdate = state.cards[cardId]
          cardToUpdate.easeFactor = easeFactor
          cardToUpdate.interval = interval
          cardToUpdate.repetitions = repetitions
          cardToUpdate.nextReviewDate = nextReviewDate
          cardToUpdate.lastReviewDate = new Date()
          cardToUpdate.totalReviews += 1

          if (quality >= 3) {
            cardToUpdate.correctReviews += 1
          } else {
            cardToUpdate.incorrectReviews += 1
          }

          // Update average response time
          const totalResponseTime =
            cardToUpdate.averageResponseTime * (cardToUpdate.totalReviews - 1) + responseTime
          cardToUpdate.averageResponseTime = totalResponseTime / cardToUpdate.totalReviews
        })

        // Sync with server
        api.flashcards.updateSpacedRepetition
          .mutate({
            cardId,
            easeFactor,
            interval,
            repetitions,
            nextReviewDate,
            responseTime,
            quality,
          })
          .catch((error) => {
            console.warn('Failed to sync spaced repetition data:', error)
          })
      },

      getDueCards: (deckId?: string) => {
        const now = new Date()
        let cards = Object.values(get().cards)

        if (deckId) {
          const deck = get().decks[deckId]
          if (deck) {
            cards = deck.cardIds.map((id) => get().cards[id]).filter(Boolean)
          }
        }

        return cards.filter((card) => card.nextReviewDate <= now && card.isActive)
      },

      getNewCards: (deckId?: string, limit = 20) => {
        let cards = Object.values(get().cards)

        if (deckId) {
          const deck = get().decks[deckId]
          if (deck) {
            cards = deck.cardIds.map((id) => get().cards[id]).filter(Boolean)
          }
        }

        return cards.filter((card) => card.repetitions === 0 && card.isActive).slice(0, limit)
      },

      getSpacedRepetitionStats: () => {
        const cards = Object.values(get().cards)
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

        const dueToday = cards.filter(
          (card) => card.nextReviewDate <= today && card.isActive
        ).length

        const dueThisWeek = cards.filter(
          (card) =>
            card.nextReviewDate <= oneWeekFromNow && card.nextReviewDate > today && card.isActive
        ).length

        const mastered = cards.filter(
          (card) => card.repetitions >= 5 && card.easeFactor >= 2.5 && card.isActive
        ).length

        const learning = cards.filter(
          (card) => card.repetitions > 0 && card.repetitions < 5 && card.isActive
        ).length

        const review = cards.filter(
          (card) => card.repetitions >= 5 && card.easeFactor < 2.5 && card.isActive
        ).length

        // Calculate study streak
        const sessions = get()
          .studySessions.filter((s) => s.endTime)
          .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())

        let streak = 0
        const currentDate = new Date()
        currentDate.setHours(0, 0, 0, 0)

        for (const session of sessions) {
          const sessionDate = new Date(session.startTime)
          sessionDate.setHours(0, 0, 0, 0)

          if (sessionDate.getTime() === currentDate.getTime()) {
            streak += 1
            currentDate.setDate(currentDate.getDate() - 1)
          } else if (sessionDate.getTime() < currentDate.getTime()) {
            break
          }
        }

        return {
          totalCards: cards.filter((card) => card.isActive).length,
          dueToday,
          dueThisWeek,
          mastered,
          learning,
          review,
          streak,
          lastStudyDate: sessions[0]?.startTime,
        }
      },

      getStudyStatistics: (deckId?: string, days = 30) => {
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        let sessions = get().studySessions.filter((s) => s.endTime && s.startTime >= cutoffDate)

        if (deckId) {
          sessions = sessions.filter((s) => s.deckId === deckId)
        }

        const totalSessions = sessions.length
        const totalCards = sessions.reduce((sum, s) => sum + s.cardsStudied, 0)
        const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0)
        const averageAccuracy = totalCards > 0 ? (totalCorrect / totalCards) * 100 : 0
        const averageSessionTime =
          sessions.length > 0
            ? sessions.reduce((sum, s) => sum + s.totalTime, 0) / sessions.length
            : 0

        // Calculate study streak
        const stats = get().getSpacedRepetitionStats()

        // Group sessions by date for trend analysis
        const dailyStats = sessions.reduce(
          (acc, session) => {
            const date = session.startTime.toISOString().split('T')[0]
            if (!acc[date]) {
              acc[date] = { cards: 0, correct: 0 }
            }
            acc[date].cards += session.cardsStudied
            acc[date].correct += session.correctAnswers
            return acc
          },
          {} as Record<string, { cards: number; correct: number }>
        )

        const progressTrend = Object.entries(dailyStats).map(([date, data]) => ({
          date,
          cards: data.cards,
          accuracy: data.cards > 0 ? (data.correct / data.cards) * 100 : 0,
        }))

        return {
          totalSessions,
          totalCards,
          averageAccuracy,
          averageSessionTime,
          studyStreak: stats.streak,
          progressTrend,
        }
      },

      exportDeck: (deckId: string) => {
        const deck = get().decks[deckId]
        if (!deck) throw new Error('Deck not found')

        const cards = deck.cardIds.map((id) => get().cards[id]).filter(Boolean)

        const exportData = {
          deck,
          cards,
          exportDate: new Date().toISOString(),
          version: '1.0',
        }

        return JSON.stringify(exportData, null, 2)
      },

      importDeck: async (data: string) => {
        try {
          const importData = JSON.parse(data)
          const { deck, cards } = importData

          // Create new deck with new ID
          const newDeckId = crypto.randomUUID()
          const newDeck = {
            ...deck,
            id: newDeckId,
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          // Create new cards with new IDs
          const cardIdMapping: Record<string, string> = {}
          const newCards = cards.map((card: FlashCard) => {
            const newCardId = crypto.randomUUID()
            cardIdMapping[card.id] = newCardId

            return {
              ...card,
              id: newCardId,
              createdAt: new Date(),
              updatedAt: new Date(),
              nextReviewDate: new Date(card.nextReviewDate),
              lastReviewDate: card.lastReviewDate ? new Date(card.lastReviewDate) : undefined,
            }
          })

          // Update deck card IDs
          newDeck.cardIds = newDeck.cardIds.map((id) => cardIdMapping[id])

          set((state) => {
            state.decks[newDeckId] = newDeck
            newCards.forEach((card: FlashCard) => {
              state.cards[card.id] = card
            })
          })

          // Sync with server
          await api.flashcards.importDeck.mutate({
            deck: newDeck,
            cards: newCards,
          })

          return newDeckId
        } catch (error) {
          throw new Error('Invalid deck data format')
        }
      },

      exportAllData: () => {
        const state = get()
        const exportData = {
          cards: state.cards,
          decks: state.decks,
          studySessions: state.studySessions,
          studySettings: state.studySettings,
          exportDate: new Date().toISOString(),
          version: '1.0',
        }

        return JSON.stringify(exportData, null, 2)
      },

      importAllData: async (data: string) => {
        try {
          const importData = JSON.parse(data)

          set((state) => {
            state.cards = importData.cards || {}
            state.decks = importData.decks || {}
            state.studySessions = importData.studySessions || []
            state.studySettings = { ...state.studySettings, ...importData.studySettings }
          })

          await api.flashcards.importAllData.mutate(importData)
        } catch (error) {
          throw new Error('Invalid data format')
        }
      },

      shareCard: async (cardId: string) => {
        const card = get().cards[cardId]
        if (!card) throw new Error('Card not found')

        try {
          const shareUrl = await api.flashcards.shareCard.mutate({ cardId })
          return shareUrl
        } catch (error) {
          throw new Error('Failed to share card')
        }
      },

      shareDeck: async (deckId: string) => {
        const deck = get().decks[deckId]
        if (!deck) throw new Error('Deck not found')

        try {
          const shareUrl = await api.flashcards.shareDeck.mutate({ deckId })
          return shareUrl
        } catch (error) {
          throw new Error('Failed to share deck')
        }
      },

      searchCards: (query: string) => {
        const cards = Object.values(get().cards)
        const lowercaseQuery = query.toLowerCase()

        return cards.filter(
          (card) =>
            card.front.toLowerCase().includes(lowercaseQuery) ||
            card.back.toLowerCase().includes(lowercaseQuery) ||
            card.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
        )
      },

      getCardsByFilter: (filters) => {
        let cards = Object.values(get().cards)

        if (filters.knowledgeArea) {
          cards = cards.filter((card) => card.knowledgeArea === filters.knowledgeArea)
        }

        if (filters.processGroup) {
          cards = cards.filter((card) => card.processGroup === filters.processGroup)
        }

        if (filters.difficulty) {
          cards = cards.filter((card) => card.difficulty === filters.difficulty)
        }

        if (filters.tags && filters.tags.length > 0) {
          cards = cards.filter((card) => filters.tags!.some((tag) => card.tags.includes(tag)))
        }

        if (filters.dueOnly) {
          const now = new Date()
          cards = cards.filter((card) => card.nextReviewDate <= now)
        }

        return cards
      },

      getCurrentCard: () => {
        const { currentCards, currentCardIndex } = get()
        return currentCards[currentCardIndex] || null
      },

      hasNextCard: () => {
        const { currentCards, currentCardIndex } = get()
        return currentCardIndex < currentCards.length - 1
      },

      hasPreviousCard: () => {
        const { currentCardIndex } = get()
        return currentCardIndex > 0
      },

      updateStudySettings: (settings) => {
        set((state) => {
          state.studySettings = { ...state.studySettings, ...settings }
        })
      },

      reset: () => {
        set((state) => {
          state.cards = {}
          state.decks = {}
          state.studySessions = []
          state.currentDeck = null
          state.currentCards = []
          state.currentCardIndex = 0
          state.isStudying = false
          state.sessionStats = {
            studied: 0,
            correct: 0,
            incorrect: 0,
            skipped: 0,
          }
          state.showAnswer = false
          state.error = null
          state.isLoading = false
        })
      },
    })),
    {
      name: 'flashcard-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cards: state.cards,
        decks: state.decks,
        studySessions: state.studySessions,
        studySettings: state.studySettings,
      }),
    }
  )
)

export default useFlashCardStore
