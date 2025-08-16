import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle,
  AlertCircle,
  List,
  Send,
  Pause,
  Play,
} from 'lucide-react'
import { generateExam, questionTypes, analyzeExamResults } from '../../data/fixtures/examQuestions'
import { progressService } from '../../services/progressService'

const MockExam = () => {
  const navigate = useNavigate()
  const [examQuestions, setExamQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Set())
  const [examState, setExamState] = useState('not_started') // not_started, in_progress, paused, completed
  const [timeRemaining, setTimeRemaining] = useState(230 * 60) // 230分（秒単位）
  const [showQuestionList, setShowQuestionList] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef(null)

  // 試験開始
  const startExam = () => {
    const questions = generateExam(10) // デモ用に10問（実際は180問）
    setExamQuestions(questions)
    setExamState('in_progress')
    setTimeRemaining(230 * 60)
    setCurrentQuestionIndex(0)
    setAnswers({})
    setBookmarkedQuestions(new Set())
  }

  // タイマー機能
  useEffect(() => {
    if (examState === 'in_progress' && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 0) {
            submitExam()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [examState, isPaused])

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 回答の保存
  const handleAnswer = (answer) => {
    const question = examQuestions[currentQuestionIndex]
    setAnswers((prev) => ({
      ...prev,
      [question.id]: answer,
    }))
  }

  // 複数選択の回答処理
  const handleMultipleAnswer = (option) => {
    const question = examQuestions[currentQuestionIndex]
    const currentAnswers = answers[question.id] || []

    if (currentAnswers.includes(option)) {
      handleAnswer(currentAnswers.filter((a) => a !== option))
    } else {
      handleAnswer([...currentAnswers, option])
    }
  }

  // ブックマーク切り替え
  const toggleBookmark = () => {
    const question = examQuestions[currentQuestionIndex]
    const newBookmarks = new Set(bookmarkedQuestions)

    if (newBookmarks.has(question.id)) {
      newBookmarks.delete(question.id)
    } else {
      newBookmarks.add(question.id)
    }

    setBookmarkedQuestions(newBookmarks)
  }

  // 問題ナビゲーション
  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index)
    setShowQuestionList(false)
  }

  // 試験提出
  const submitExam = () => {
    setExamState('completed')
    const results = analyzeExamResults(answers, examQuestions)

    // 結果を保存
    progressService.recordExamResult({
      timestamp: new Date().toISOString(),
      duration: 230 * 60 - timeRemaining,
      results,
      bookmarkedQuestions: Array.from(bookmarkedQuestions),
    })

    // 結果ページへ遷移
    navigate('/exam-results', { state: { results, examQuestions, answers } })
  }

  if (examState === 'not_started') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-lg">
          <h1 className="mb-6 text-3xl font-bold text-gray-900">PMP模擬試験</h1>

          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-600" />
              <span>試験時間: 230分（3時間50分）</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-gray-600" />
              <span>問題数: 180問（デモ: 10問）</span>
            </div>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-gray-600" />
              <span>合格基準: 正答率61%以上</span>
            </div>
          </div>

          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-2 font-semibold text-blue-900">試験の構成</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• People (42%): チーム管理、リーダーシップ</li>
              <li>• Process (50%): プロジェクト管理プロセス</li>
              <li>• Business Environment (8%): ビジネス戦略との整合</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={startExam}
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              試験を開始する
            </button>
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (examState === 'completed') {
    return <div>試験完了 - 結果ページへ自動遷移します...</div>
  }

  const currentQuestion = examQuestions[currentQuestionIndex]
  const currentAnswer = answers[currentQuestion.id]
  const isBookmarked = bookmarkedQuestions.has(currentQuestion.id)

  return (
    <div className="min-h-screen bg-gray-50" role="main">
      {/* Screen reader announcement for exam state */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Question {currentQuestionIndex + 1} of {examQuestions.length}. Time remaining: {formatTime(timeRemaining)}.
      </div>
      
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold">PMP模擬試験</h1>
              <span className="text-sm text-gray-600" aria-label="Progress indicator">
                問題 {currentQuestionIndex + 1} / {examQuestions.length}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span
                  className={`font-mono text-lg ${timeRemaining < 600 ? 'text-red-600' : 'text-gray-900'}`}
                >
                  {formatTime(timeRemaining)}
                </span>
              </div>

              <button
                onClick={() => setIsPaused(!isPaused)}
                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={isPaused ? 'Resume exam timer' : 'Pause exam timer'}
                aria-pressed={isPaused}
              >
                {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
              </button>

              <button
                onClick={() => setShowQuestionList(!showQuestionList)}
                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Show question list"
                aria-expanded={showQuestionList}
                aria-controls="question-list-sidebar"
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl p-4">
        {/* 問題表示エリア */}
        <section className="mb-4 rounded-lg bg-white p-6 shadow-lg" aria-labelledby="current-question">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                  {currentQuestion.domain.toUpperCase()}
                </span>
                <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                  {currentQuestion.difficulty === 'easy'
                    ? '易'
                    : currentQuestion.difficulty === 'medium'
                      ? '中'
                      : '難'}
                </span>
              </div>
              <h2 id="current-question" className="text-lg font-medium leading-relaxed text-gray-900">
                {currentQuestion.question}
              </h2>
            </div>

            <button
              onClick={toggleBookmark}
              className={`rounded-lg p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                isBookmarked
                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
              aria-label={isBookmarked ? 'Remove bookmark from this question' : 'Bookmark this question'}
              aria-pressed={isBookmarked}
            >
              <Flag className="h-5 w-5" />
            </button>
          </div>

          {/* 選択肢 */}
          <fieldset className="space-y-3">
            <legend className="sr-only">
              {currentQuestion.type === questionTypes.SINGLE_CHOICE 
                ? 'Select one answer' 
                : 'Select multiple answers'}
            </legend>
            {currentQuestion.options.map((option) => {
              const optionLetter = option.charAt(0)
              const isSelected =
                currentQuestion.type === questionTypes.SINGLE_CHOICE
                  ? currentAnswer === optionLetter
                  : (currentAnswer || []).includes(optionLetter)

              return (
                <button
                  key={option}
                  onClick={() => {
                    if (currentQuestion.type === questionTypes.SINGLE_CHOICE) {
                      handleAnswer(optionLetter)
                    } else {
                      handleMultipleAnswer(optionLetter)
                    }
                  }}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <CheckCircle className="h-4 w-4 text-white" />}
                    </div>
                    <span className="text-gray-800">{option}</span>
                  </div>
                </button>
              )
            })}
          </fieldset>

          {currentQuestion.type === questionTypes.MULTIPLE_CHOICE && (
            <p className="mt-4 text-sm text-gray-600">
              ※ 複数選択問題です。該当するものをすべて選択してください。
            </p>
          )}
        </section>

        {/* ナビゲーションボタン */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            前の問題
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, examQuestions.length) }, (_, i) => {
              const index = Math.max(
                0,
                Math.min(currentQuestionIndex - 2 + i, examQuestions.length - 1)
              )
              const question = examQuestions[index]
              const hasAnswer = !!answers[question.id]

              return (
                <button
                  key={index}
                  onClick={() => goToQuestion(index)}
                  className={`h-10 w-10 rounded-lg font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : hasAnswer
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              )
            })}
          </div>

          {currentQuestionIndex < examQuestions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              次の問題
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={submitExam}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
            >
              <Send className="h-4 w-4" />
              試験を提出
            </button>
          )}
        </div>
      </div>

      {/* 問題一覧サイドバー */}
      {showQuestionList && (
        <div className="fixed inset-y-0 right-0 z-50 w-80 overflow-y-auto bg-white shadow-xl">
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">問題一覧</h3>
              <button
                onClick={() => setShowQuestionList(false)}
                className="rounded p-1 hover:bg-gray-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-5 gap-2">
              {examQuestions.map((question, index) => {
                const hasAnswer = !!answers[question.id]
                const isBookmarked = bookmarkedQuestions.has(question.id)

                return (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`relative rounded-lg p-3 text-sm font-medium transition-colors ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : hasAnswer
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                    {isBookmarked && (
                      <Flag className="absolute right-0 top-0 h-3 w-3 text-yellow-500" />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-green-100"></div>
                <span>回答済み ({Object.keys(answers).length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-gray-100"></div>
                <span>未回答 ({examQuestions.length - Object.keys(answers).length})</span>
              </div>
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-yellow-500" />
                <span>ブックマーク ({bookmarkedQuestions.size})</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(MockExam)
