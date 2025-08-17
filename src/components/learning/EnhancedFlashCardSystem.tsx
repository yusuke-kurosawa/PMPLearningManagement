/**
 * Enhanced Flashcard System with Spaced Repetition and Backend Integration
 * Developer 3: Flashcard System Developer Implementation
 */

import React, { useState, useEffect } from 'react'
import { logger } from '../../services/logger'
import {
  BookOpen,
  Brain,
  Plus,
  Edit3,
  Trash2,
  Play,
  Download,
  Search,
  Eye,
  Settings,
  BarChart3,
  Trophy,
  Clock,
  XCircle,
  SkipForward,
  ArrowLeft,
  ArrowRight,
  Flag,
  Star,
  Calendar,
  Zap,
  RefreshCw,
} from 'lucide-react'
import {
  useFlashCardStore,
  // type FlashCard,
  // type FlashCardDeck,
  // type _StudySession,
} from '../../stores/flashcardStore'
import { useToast } from '../../hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'
import { format } from 'date-fns'

const EnhancedFlashCardSystem: React.FC = () => {
  const { toast } = useToast()

  // Store state and actions
  const {
    decks,
    // cards, // Will be used when deck display is implemented
    currentDeck,
    currentCards,
    currentCardIndex,
    isStudying,
    showAnswer,
    sessionStats,
    studySettings,
    isLoading,
    error,
    loadDecks,
    loadCards,
    createCard,
    // updateCard, // Will be used for card editing
    // deleteCard, // Will be used for card deletion
    createDeck,
    // updateDeck, // Will be used for deck management
    deleteDeck,
    startStudySession,
    endStudySession,
    nextCard,
    previousCard,
    skipCard,
    revealAnswer,
    rateCard,
    getDueCards,
    getSpacedRepetitionStats,
    getStudyStatistics,
    getCurrentCard,
    hasNextCard,
    hasPreviousCard,
    // searchCards, // Will be used for card search
    exportDeck,
    // importDeck, // Will be used for deck import
    // updateStudySettings, // Will be used for settings management
  } = useFlashCardStore()

  // Local state
  const [activeView, setActiveView] = useState<'decks' | 'study' | 'create' | 'statistics'>('decks')
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateCardDialog, setShowCreateCardDialog] = useState(false)
  //   const [showCreateDeckDialog] = useState(false) // setShowCreateDeckDialog will be used in UI // TODO: Will be used in future
  //   const [showSettingsDialog, setShowSettingsDialog] = useState(false) // TODO: Will be used in future
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  //   const [studyStartTime, setStudyStartTime] = useState<Date | null>(null) // TODO: Will be used in future
  const [cardResponseStartTime, setCardResponseStartTime] = useState<Date | null>(null)
  const [autoRevealTimer, setAutoRevealTimer] = useState<NodeJS.Timeout | null>(null)

  // Form state
  const [newCard, setNewCard] = useState({
    front: '',
    back: '',
    knowledgeArea: '',
    processGroup: '',
    tags: '',
    difficulty: 'medium' as const,
    type: 'definition' as const,
  })

  const [newDeck, setNewDeck] = useState({
    name: '',
    description: '',
    category: 'custom' as const,
    tags: '',
    isPublic: false,
  })

  // Load data on mount
  useEffect(() => {
    loadDecks()
    loadCards()
  }, [])

  // Auto-reveal timer
  useEffect(() => {
    if (
      isStudying &&
      !showAnswer &&
      studySettings.autoReveal &&
      studySettings.autoRevealDelay > 0
    ) {
      const timer = setTimeout(() => {
        revealAnswer()
      }, studySettings.autoRevealDelay * 1000)

      setAutoRevealTimer(timer)

      return () => {
        if (timer) {
          clearTimeout(timer)
        }
      }
    }
  }, [
    isStudying,
    showAnswer,
    studySettings.autoReveal,
    studySettings.autoRevealDelay,
    currentCardIndex,
  ])

  // Track card response time
  useEffect(() => {
    if (isStudying && !showAnswer) {
      setCardResponseStartTime(new Date())
    }
  }, [isStudying, showAnswer, currentCardIndex])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isStudying) {
        switch (event.key) {
          case ' ':
            event.preventDefault()
            if (!showAnswer) {
              revealAnswer()
            }
            break
          case 'ArrowLeft':
            if (hasPreviousCard()) {
              previousCard()
            }
            break
          case 'ArrowRight':
            if (hasNextCard()) {
              nextCard()
            } else if (showAnswer) {
              skipCard()
            }
            break
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
            if (showAnswer) {
              const rating = parseInt(event.key) as 1 | 2 | 3 | 4 | 5
              handleRateCard(rating)
            }
            break
          case 'Escape':
            handleEndSession()
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isStudying, showAnswer, hasNextCard, hasPreviousCard])

  const handleCreateCard = async () => {
    try {
      const cardId = await createCard({
        front: newCard.front,
        back: newCard.back,
        knowledgeArea: newCard.knowledgeArea,
        processGroup: newCard.processGroup,
        tags: newCard.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        difficulty: newCard.difficulty,
        type: newCard.type,
        createdBy: 'user',
        isActive: true,
      })

      // Add to selected deck if one is selected
      if (selectedDeckId) {
        await useFlashCardStore.getState().addCardToDeck(selectedDeckId, cardId)
      }

      setNewCard({
        front: '',
        back: '',
        knowledgeArea: '',
        processGroup: '',
        tags: '',
        difficulty: 'medium',
        type: 'definition',
      })
      setShowCreateCardDialog(false)

      toast({
        title: 'Card Created',
        description: 'Your flashcard has been created successfully.',
      })
    } catch (error) {
      toast({
        title: 'Failed to Create Card',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    }
  }

  const __handleCreateDeck = async () => {
    try {
      await createDeck({
        name: newDeck.name,
        description: newDeck.description,
        cardIds: [],
        isPublic: newDeck.isPublic,
        createdBy: 'current-user',
        tags: newDeck.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        category: newDeck.category,
        difficulty: 'mixed',
      })

      setNewDeck({
        name: '',
        description: '',
        category: 'custom',
        tags: '',
        isPublic: false,
      })
      // setShowCreateDeckDialog(false) // TODO: Will be used when dialog is implemented

      toast({
        title: 'Deck Created',
        description: 'Your deck has been created successfully.',
      })
    } catch (error) {
      toast({
        title: 'Failed to Create Deck',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    }
  }

  const handleStartStudy = async (deckId: string) => {
    try {
      await startStudySession(deckId, { dueOnly: true })
      setActiveView('study')
      setStudyStartTime(new Date())

      toast({
        title: 'Study Session Started',
        description: `Starting study with ${currentCards.length} cards`,
      })
    } catch (error) {
      toast({
        title: 'Failed to Start Study',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    }
  }

  const handleEndSession = async () => {
    try {
      await endStudySession()
      setActiveView('decks')
      setStudyStartTime(null)

      toast({
        title: 'Session Completed',
        description: `Studied ${sessionStats.studied} cards with ${((sessionStats.correct / sessionStats.studied) * 100).toFixed(1)}% accuracy`,
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to end session:', error)
      }
    }
  }

  const handleRateCard = async (difficulty: 1 | 2 | 3 | 4 | 5) => {
    if (!cardResponseStartTime) {
      return
    }

    const responseTime = Date.now() - cardResponseStartTime.getTime()

    try {
      await rateCard(difficulty, responseTime)

      if (autoRevealTimer) {
        clearTimeout(autoRevealTimer)
        setAutoRevealTimer(null)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.error('Failed to rate card:', error)
      }
    }
  }

  const handleDeleteDeck = async (deckId: string) => {
    try {
      await deleteDeck(deckId)
      setShowDeleteConfirm(null)

      toast({
        title: 'Deck Deleted',
        description: 'The deck has been deleted successfully.',
      })
    } catch (error) {
      toast({
        title: 'Failed to Delete Deck',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    }
  }

  const handleExportDeck = (deckId: string) => {
    try {
      const data = exportDeck(deckId)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `flashcard-deck-${deckId}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: 'Deck Exported',
        description: 'Your deck has been exported successfully.',
      })
    } catch (__error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export deck.',
        variant: 'destructive',
      })
    }
  }

  const spacedRepetitionStats = getSpacedRepetitionStats()
  const currentCard = getCurrentCard()
  const filteredDecks = Object.values(decks).filter(
    (deck) =>
      deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <Card className='w-96'>
          <CardContent className='p-6 text-center'>
            <RefreshCw className='mx-auto mb-4 h-8 w-8 animate-spin text-blue-600' />
            <h3 className='mb-2 text-lg font-semibold'>Loading Flashcards</h3>
            <p className='text-gray-600'>Please wait...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-7xl p-4'>
        {/* Header */}
        <div className='mb-8'>
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Flashcard Learning System</h1>
              <p className='text-gray-600'>Master PMP concepts with spaced repetition</p>
            </div>
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm' onClick={() => setShowSettingsDialog(true)}>
                <Settings className='mr-2 h-4 w-4' />
                Settings
              </Button>
              <Button size='sm' onClick={() => setShowCreateCardDialog(true)}>
                <Plus className='mr-2 h-4 w-4' />
                New Card
              </Button>
              <Button size='sm' onClick={() => setShowCreateDeckDialog(true)}>
                <Plus className='mr-2 h-4 w-4' />
                New Deck
              </Button>
            </div>
          </div>

          {error && (
            <div className='mb-4 rounded-lg border border-red-200 bg-red-50 p-4'>
              <div className='flex items-center gap-2'>
                <XCircle className='h-4 w-4 text-red-600' />
                <span className='text-red-800'>{error}</span>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-3'>
                  <div className='rounded-full bg-blue-100 p-2'>
                    <Calendar className='h-5 w-5 text-blue-600' />
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Due Today</p>
                    <p className='text-xl font-bold text-gray-900'>
                      {spacedRepetitionStats.dueToday}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-3'>
                  <div className='rounded-full bg-green-100 p-2'>
                    <Trophy className='h-5 w-5 text-green-600' />
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Mastered</p>
                    <p className='text-xl font-bold text-gray-900'>
                      {spacedRepetitionStats.mastered}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-3'>
                  <div className='rounded-full bg-yellow-100 p-2'>
                    <Brain className='h-5 w-5 text-yellow-600' />
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Learning</p>
                    <p className='text-xl font-bold text-gray-900'>
                      {spacedRepetitionStats.learning}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center gap-3'>
                  <div className='rounded-full bg-orange-100 p-2'>
                    <Zap className='h-5 w-5 text-orange-600' />
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Streak</p>
                    <p className='text-xl font-bold text-gray-900'>
                      {spacedRepetitionStats.streak} days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs
          value={activeView}
          onValueChange={(value) =>
            setActiveView(value as 'decks' | 'study' | 'create' | 'statistics')
          }
          className='space-y-6'
        >
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='decks'>Decks</TabsTrigger>
            <TabsTrigger value='study' disabled={!isStudying}>
              Study
            </TabsTrigger>
            <TabsTrigger value='create'>Create</TabsTrigger>
            <TabsTrigger value='statistics'>Statistics</TabsTrigger>
          </TabsList>

          {/* Decks Tab */}
          <TabsContent value='decks' className='space-y-6'>
            <div className='flex items-center gap-4'>
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <Input
                  placeholder='Search decks...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-10'
                />
              </div>
              <Select value={selectedDeckId || ''} onValueChange={setSelectedDeckId}>
                <SelectTrigger className='w-48'>
                  <SelectValue placeholder='Select deck' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=''>All Decks</SelectItem>
                  {Object.values(decks).map((deck) => (
                    <SelectItem key={deck.id} value={deck.id}>
                      {deck.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {filteredDecks.map((deck) => {
                const dueCards = getDueCards(deck.id)
                //                 const deckStats = getStudyStatistics(deck.id, 7) // TODO: Will be used in future

                return (
                  <Card key={deck.id} className='transition-shadow hover:shadow-lg'>
                    <CardHeader>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <CardTitle className='text-lg'>{deck.name}</CardTitle>
                          <p className='mt-1 text-sm text-gray-600'>{deck.description}</p>
                        </div>
                        <div className='flex items-center gap-1'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleExportDeck(deck.id)}
                          >
                            <Download className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setShowDeleteConfirm(deck.id)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                      <div className='mt-2 flex flex-wrap gap-1'>
                        {deck.tags.map((tag) => (
                          <Badge key={tag} variant='outline' className='text-xs'>
                            {tag}
                          </Badge>
                        ))}
                        <Badge
                          variant={deck.category === 'pmbok' ? 'default' : 'secondary'}
                          className='text-xs'
                        >
                          {deck.category.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3'>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-gray-600'>Total Cards:</span>
                          <span className='font-medium'>{deck.totalCards}</span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-gray-600'>Due Today:</span>
                          <span className='font-medium text-blue-600'>{dueCards.length}</span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-gray-600'>Mastered:</span>
                          <span className='font-medium text-green-600'>{deck.masteredCards}</span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='text-gray-600'>Last Studied:</span>
                          <span className='font-medium'>
                            {deck.lastStudied ? format(deck.lastStudied, 'MMM dd') : 'Never'}
                          </span>
                        </div>

                        <Progress
                          value={
                            deck.totalCards > 0 ? (deck.masteredCards / deck.totalCards) * 100 : 0
                          }
                          className='mt-3'
                        />

                        <div className='mt-4 flex gap-2'>
                          <Button
                            size='sm'
                            className='flex-1'
                            onClick={() => handleStartStudy(deck.id)}
                            disabled={dueCards.length === 0}
                          >
                            <Play className='mr-2 h-4 w-4' />
                            Study ({dueCards.length})
                          </Button>
                          <Button variant='outline' size='sm'>
                            <Edit3 className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Study Tab */}
          <TabsContent value='study' className='space-y-6'>
            {isStudying && currentCard ? (
              <div className='mx-auto max-w-4xl'>
                {/* Study Header */}
                <div className='mb-6 rounded-lg border bg-white p-4 shadow-sm'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                      <h2 className='text-xl font-semibold'>{currentDeck?.name}</h2>
                      <Badge variant='outline'>
                        {currentCardIndex + 1} / {currentCards.length}
                      </Badge>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button variant='outline' size='sm' onClick={handleEndSession}>
                        <ArrowLeft className='mr-2 h-4 w-4' />
                        End Session
                      </Button>
                    </div>
                  </div>

                  <div className='mt-4'>
                    <div className='mb-2 flex items-center justify-between text-sm text-gray-600'>
                      <span>Session Progress</span>
                      <span>
                        Correct: {sessionStats.correct} | Incorrect: {sessionStats.incorrect} |
                        Skipped: {sessionStats.skipped}
                      </span>
                    </div>
                    <Progress value={(currentCardIndex / currentCards.length) * 100} />
                  </div>
                </div>

                {/* Flashcard */}
                <Card className='perspective-1000 min-h-[400px]'>
                  <CardContent className='p-0'>
                    <div
                      className={`transform-style-preserve-3d relative h-full w-full transition-transform duration-700 ${
                        showAnswer ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* Front of card */}
                      <div className='backface-hidden absolute inset-0 h-full w-full'>
                        <div className='flex min-h-[400px] flex-col items-center justify-center p-8'>
                          <div className='w-full max-w-2xl'>
                            <div className='mb-4 flex items-center justify-between'>
                              <div className='flex gap-2'>
                                <Badge variant='outline'>{currentCard.type.toUpperCase()}</Badge>
                                <Badge
                                  variant={
                                    currentCard.difficulty === 'easy'
                                      ? 'secondary'
                                      : currentCard.difficulty === 'medium'
                                        ? 'default'
                                        : 'destructive'
                                  }
                                >
                                  {currentCard.difficulty.toUpperCase()}
                                </Badge>
                                {currentCard.knowledgeArea && (
                                  <Badge variant='outline'>{currentCard.knowledgeArea}</Badge>
                                )}
                              </div>
                              <div className='flex gap-1'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() =>
                                    useFlashCardStore.getState().bookmarkQuestion?.(currentCard.id)
                                  }
                                >
                                  <Flag className='h-4 w-4' />
                                </Button>
                                <Button variant='ghost' size='sm'>
                                  <Star className='h-4 w-4' />
                                </Button>
                              </div>
                            </div>

                            <div className='text-center'>
                              <h3 className='mb-6 text-2xl font-medium leading-relaxed text-gray-900'>
                                {currentCard.front}
                              </h3>

                              {currentCard.imageUrl && (
                                <div className='mb-6'>
                                  <img
                                    src={currentCard.imageUrl}
                                    alt='Flashcard visual'
                                    className='mx-auto h-auto max-w-full rounded-lg'
                                  />
                                </div>
                              )}

                              {!showAnswer && (
                                <Button size='lg' onClick={revealAnswer} className='mt-8'>
                                  <Eye className='mr-2 h-5 w-5' />
                                  Reveal Answer
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Back of card */}
                      <div className='backface-hidden rotate-y-180 absolute inset-0 h-full w-full'>
                        <div className='flex min-h-[400px] flex-col items-center justify-center p-8'>
                          <div className='w-full max-w-2xl'>
                            <div className='mb-8 text-center'>
                              <h3 className='mb-4 text-xl font-medium text-gray-700'>Answer:</h3>
                              <div className='whitespace-pre-wrap text-lg leading-relaxed text-gray-900'>
                                {currentCard.back}
                              </div>
                            </div>

                            <div className='border-t pt-6'>
                              <h4 className='mb-4 text-center text-lg font-medium text-gray-900'>
                                How well did you know this?
                              </h4>
                              <div className='flex justify-center gap-2'>
                                <Button
                                  variant='outline'
                                  size='lg'
                                  onClick={() => handleRateCard(1)}
                                  className='max-w-[120px] flex-1 border-red-200 bg-red-50 hover:bg-red-100'
                                >
                                  <span className='mr-1 text-lg font-bold'>1</span>
                                  <span className='text-sm'>Again</span>
                                </Button>
                                <Button
                                  variant='outline'
                                  size='lg'
                                  onClick={() => handleRateCard(2)}
                                  className='max-w-[120px] flex-1 border-orange-200 bg-orange-50 hover:bg-orange-100'
                                >
                                  <span className='mr-1 text-lg font-bold'>2</span>
                                  <span className='text-sm'>Hard</span>
                                </Button>
                                <Button
                                  variant='outline'
                                  size='lg'
                                  onClick={() => handleRateCard(3)}
                                  className='max-w-[120px] flex-1 border-yellow-200 bg-yellow-50 hover:bg-yellow-100'
                                >
                                  <span className='mr-1 text-lg font-bold'>3</span>
                                  <span className='text-sm'>Good</span>
                                </Button>
                                <Button
                                  variant='outline'
                                  size='lg'
                                  onClick={() => handleRateCard(4)}
                                  className='max-w-[120px] flex-1 border-green-200 bg-green-50 hover:bg-green-100'
                                >
                                  <span className='mr-1 text-lg font-bold'>4</span>
                                  <span className='text-sm'>Easy</span>
                                </Button>
                                <Button
                                  variant='outline'
                                  size='lg'
                                  onClick={() => handleRateCard(5)}
                                  className='max-w-[120px] flex-1 border-blue-200 bg-blue-50 hover:bg-blue-100'
                                >
                                  <span className='mr-1 text-lg font-bold'>5</span>
                                  <span className='text-sm'>Perfect</span>
                                </Button>
                              </div>

                              <div className='mt-4 text-center'>
                                <Button
                                  variant='ghost'
                                  onClick={skipCard}
                                  className='text-gray-500'
                                >
                                  <SkipForward className='mr-2 h-4 w-4' />
                                  Skip Card
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className='mt-6 flex items-center justify-between'>
                  <Button variant='outline' onClick={previousCard} disabled={!hasPreviousCard()}>
                    <ArrowLeft className='mr-2 h-4 w-4' />
                    Previous
                  </Button>

                  <div className='text-center text-sm text-gray-600'>
                    <p>Keyboard Shortcuts: Space (reveal), 1-5 (rate), ← → (navigate), Esc (end)</p>
                  </div>

                  <Button variant='outline' onClick={nextCard} disabled={!hasNextCard()}>
                    Next
                    <ArrowRight className='ml-2 h-4 w-4' />
                  </Button>
                </div>
              </div>
            ) : (
              <div className='py-12 text-center'>
                <BookOpen className='mx-auto mb-4 h-16 w-16 text-gray-400' />
                <h3 className='mb-2 text-xl font-semibold text-gray-900'>
                  No Active Study Session
                </h3>
                <p className='mb-4 text-gray-600'>
                  Select a deck from the Decks tab to start studying.
                </p>
                <Button onClick={() => setActiveView('decks')}>Go to Decks</Button>
              </div>
            )}
          </TabsContent>

          {/* Create Tab */}
          <TabsContent value='create' className='space-y-6'>
            <div className='mx-auto max-w-2xl'>
              <Card>
                <CardHeader>
                  <CardTitle>Create New Flashcard</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <label className='mb-2 block text-sm font-medium text-gray-700'>
                      Front (Question)
                    </label>
                    <Textarea
                      placeholder='Enter the question or term...'
                      value={newCard.front}
                      onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className='mb-2 block text-sm font-medium text-gray-700'>
                      Back (Answer)
                    </label>
                    <Textarea
                      placeholder='Enter the answer or definition...'
                      value={newCard.back}
                      onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='mb-2 block text-sm font-medium text-gray-700'>
                        Knowledge Area
                      </label>
                      <Input
                        placeholder='e.g., Integration Management'
                        value={newCard.knowledgeArea}
                        onChange={(e) => setNewCard({ ...newCard, knowledgeArea: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className='mb-2 block text-sm font-medium text-gray-700'>
                        Process Group
                      </label>
                      <Select
                        value={newCard.processGroup}
                        onValueChange={(value) => setNewCard({ ...newCard, processGroup: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select group' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='initiating'>Initiating</SelectItem>
                          <SelectItem value='planning'>Planning</SelectItem>
                          <SelectItem value='executing'>Executing</SelectItem>
                          <SelectItem value='monitoring'>Monitoring & Controlling</SelectItem>
                          <SelectItem value='closing'>Closing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='mb-2 block text-sm font-medium text-gray-700'>
                        Card Type
                      </label>
                      <Select
                        value={newCard.type}
                        onValueChange={(value: unknown) => setNewCard({ ...newCard, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='definition'>Definition</SelectItem>
                          <SelectItem value='itto'>ITTO</SelectItem>
                          <SelectItem value='concept'>Concept</SelectItem>
                          <SelectItem value='formula'>Formula</SelectItem>
                          <SelectItem value='example'>Example</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className='mb-2 block text-sm font-medium text-gray-700'>
                        Difficulty
                      </label>
                      <Select
                        value={newCard.difficulty}
                        onValueChange={(value: unknown) =>
                          setNewCard({ ...newCard, difficulty: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='easy'>Easy</SelectItem>
                          <SelectItem value='medium'>Medium</SelectItem>
                          <SelectItem value='hard'>Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className='mb-2 block text-sm font-medium text-gray-700'>
                      Tags (comma-separated)
                    </label>
                    <Input
                      placeholder='e.g., planning, scope, requirements'
                      value={newCard.tags}
                      onChange={(e) => setNewCard({ ...newCard, tags: e.target.value })}
                    />
                  </div>

                  <div className='flex gap-2 pt-4'>
                    <Button
                      onClick={handleCreateCard}
                      className='flex-1'
                      disabled={!newCard.front || !newCard.back}
                    >
                      <Plus className='mr-2 h-4 w-4' />
                      Create Card
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() =>
                        setNewCard({
                          front: '',
                          back: '',
                          knowledgeArea: '',
                          processGroup: '',
                          tags: '',
                          difficulty: 'medium',
                          type: 'definition',
                        })
                      }
                    >
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value='statistics' className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
              {/* Overall Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <BarChart3 className='h-5 w-5' />
                    Study Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {Object.entries(decks)
                      .slice(0, 5)
                      .map(([deckId, deck]) => {
                        const deckStats = getStudyStatistics(deckId, 30)
                        return (
                          <div key={deckId} className='flex items-center justify-between'>
                            <div>
                              <p className='font-medium text-gray-900'>{deck.name}</p>
                              <p className='text-sm text-gray-600'>
                                {deckStats.totalCards} cards studied
                              </p>
                            </div>
                            <div className='text-right'>
                              <p className='text-lg font-semibold text-green-600'>
                                {deckStats.averageAccuracy.toFixed(1)}%
                              </p>
                              <p className='text-sm text-gray-600'>accuracy</p>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Clock className='h-5 w-5' />
                    Recent Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {studySessions.slice(0, 5).map((session) => (
                      <div key={session.id} className='flex items-center justify-between'>
                        <div>
                          <p className='font-medium text-gray-900'>
                            {decks[session.deckId]?.name || 'Unknown Deck'}
                          </p>
                          <p className='text-sm text-gray-600'>
                            {format(session.startTime, 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='text-sm font-medium'>{session.cardsStudied} cards</p>
                          <p className='text-sm text-gray-600'>
                            {session.cardsStudied > 0
                              ? ((session.correctAnswers / session.cardsStudied) * 100).toFixed(0)
                              : 0}
                            % accuracy
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <Dialog open={showCreateCardDialog} onOpenChange={setShowCreateCardDialog}>
          <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Create New Flashcard</DialogTitle>
              <DialogDescription>
                Create a new flashcard to add to your learning collection.
              </DialogDescription>
            </DialogHeader>

            {/* Dialog content matches the Create tab content */}

            <DialogFooter>
              <Button variant='outline' onClick={() => setShowCreateCardDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCard} disabled={!newCard.front || !newCard.back}>
                Create Card
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={!!showDeleteConfirm}
          onOpenChange={(open) => !open && setShowDeleteConfirm(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Deck</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this deck? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => showDeleteConfirm && handleDeleteDeck(showDeleteConfirm)}
                className='bg-red-600 hover:bg-red-700'
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export default EnhancedFlashCardSystem
