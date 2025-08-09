import React, { useState, useEffect, useCallback } from 'react'
import {
  Clock,
  Bookmark,
  Flag,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  List,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useTouchGestures, useHapticFeedback } from '@/hooks/useTouchGestures'

interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  explanation: string
  knowledgeArea: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface MobileMockExamProps {
  questions: Question[]
  timeLimit: number // in minutes
  onComplete?: (results: any) => void
}

export function MobileMockExam({ questions, timeLimit, onComplete }: MobileMockExamProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60)
  const [isPaused, setIsPaused] = useState(false)
  const [showQuestionList, setShowQuestionList] = useState(false)
  const haptic = useHapticFeedback()

  const currentQuestion = questions[currentQuestionIndex]
  const progress = (Object.keys(answers).length / questions.length) * 100
  const isAnswered = currentQuestion?.id in answers
  const isFlagged = flaggedQuestions.has(currentQuestion?.id)

  // Timer
  useEffect(() => {
    if (isPaused || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isPaused, timeRemaining])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      haptic.light()
    }
  }, [currentQuestionIndex, questions.length, haptic])

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
      haptic.light()
    }
  }, [currentQuestionIndex, haptic])

  const handleAnswerSelect = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: parseInt(value),
    }))
    haptic.medium()
  }

  const handleToggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id)
      } else {
        newSet.add(currentQuestion.id)
      }
      haptic.light()
      return newSet
    })
  }

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
    setShowQuestionList(false)
    haptic.light()
  }

  const handleSubmit = () => {
    const results = {
      answers,
      timeSpent: timeLimit * 60 - timeRemaining,
      flaggedQuestions: Array.from(flaggedQuestions),
      score: calculateScore(),
    }
    onComplete?.(results)
    haptic.success()
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++
      }
    })
    return (correct / questions.length) * 100
  }

  // Touch gestures
  useTouchGestures({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
  })

  if (!currentQuestion) return null

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span
              className={`font-mono text-sm ${timeRemaining < 600 ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}
            >
              {formatTime(timeRemaining)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPaused(!isPaused)}
              className="h-7 w-7"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFlag}
              className={`h-7 w-7 ${isFlagged ? 'text-orange-600' : ''}`}
            >
              <Flag className={`h-4 w-4 ${isFlagged ? 'fill-current' : ''}`} />
            </Button>

            <Sheet open={showQuestionList} onOpenChange={setShowQuestionList}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <List className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle>問題一覧</SheetTitle>
                </SheetHeader>
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => (
                    <Button
                      key={q.id}
                      variant={idx === currentQuestionIndex ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleJumpToQuestion(idx)}
                      className={`
                        relative h-10 w-10 p-0
                        ${answers[q.id] !== undefined ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
                      `}
                    >
                      {idx + 1}
                      {flaggedQuestions.has(q.id) && (
                        <Flag className="absolute right-0 top-0 h-3 w-3 fill-current text-orange-600" />
                      )}
                    </Button>
                  ))}
                </div>
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>回答済み</span>
                    <span className="font-semibold">
                      {Object.keys(answers).length} / {questions.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>フラグ付き</span>
                    <span className="font-semibold text-orange-600">{flaggedQuestions.size}</span>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            問題 {currentQuestionIndex + 1} / {questions.length}
          </span>
          <Progress value={progress} className="h-1.5 w-24" />
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="mb-4 flex items-start justify-between">
              <Badge variant="outline" className="text-xs">
                {currentQuestion.knowledgeArea}
              </Badge>
              <Badge
                variant={
                  currentQuestion.difficulty === 'easy'
                    ? 'success'
                    : currentQuestion.difficulty === 'medium'
                      ? 'warning'
                      : 'destructive'
                }
                className="text-xs"
              >
                {currentQuestion.difficulty === 'easy'
                  ? '簡単'
                  : currentQuestion.difficulty === 'medium'
                    ? '普通'
                    : '難しい'}
              </Badge>
            </div>

            <p className="mb-6 text-base leading-relaxed text-gray-800 dark:text-gray-200">
              {currentQuestion.text}
            </p>

            <RadioGroup
              value={answers[currentQuestion.id]?.toString()}
              onValueChange={handleAnswerSelect}
            >
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <div
                    key={idx}
                    className={`
                      flex items-start space-x-3 rounded-lg border p-3
                      ${
                        answers[currentQuestion.id] === idx
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }
                    `}
                  >
                    <RadioGroupItem value={idx.toString()} id={`option-${idx}`} className="mt-1" />
                    <Label
                      htmlFor={`option-${idx}`}
                      className="flex-1 cursor-pointer text-sm leading-relaxed"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {isPaused && (
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="py-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">試験を一時停止中です</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="safe-area-bottom border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-3 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="mr-2 flex-1"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            前へ
          </Button>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              variant="default"
              onClick={handleSubmit}
              className="ml-2 flex-1 bg-green-600 hover:bg-green-700"
            >
              提出する
            </Button>
          ) : (
            <Button variant="outline" onClick={handleNext} className="ml-2 flex-1">
              次へ
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          左右スワイプで問題移動
        </div>
      </div>
    </div>
  )
}

export default MobileMockExam
