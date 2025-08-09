import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Trophy,
  XCircle,
  CheckCircle,
  BarChart3,
  Clock,
  AlertCircle,
  TrendingUp,
  BookOpen,
  RefreshCw,
  Home,
} from 'lucide-react'
import { examDomains } from '../../data/fixtures/examQuestions'
import { processCategories } from '../../services/progressService'

const ExamResults = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { results, examQuestions, answers } = location.state || {}
  const [showIncorrectOnly, setShowIncorrectOnly] = useState(false)

  if (!results) {
    navigate('/mock-exam')
    return null
  }

  const isPassed = results.score >= 61

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}時間${minutes}分`
  }

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 61) return 'text-blue-600'
    if (percentage >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-100'
    if (percentage >= 61) return 'bg-blue-100'
    if (percentage >= 40) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const questionsToShow = showIncorrectOnly ? results.incorrectQuestions : examQuestions

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* 結果サマリー */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-lg">
          <div className="mb-6 text-center">
            {isPassed ? (
              <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <Trophy className="h-10 w-10 text-green-600" />
              </div>
            ) : (
              <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
            )}

            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              {isPassed ? '合格おめでとうございます！' : '今回は不合格でした'}
            </h1>

            <div
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3 ${getScoreBgColor(results.score)} mb-4`}
            >
              <span className={`text-4xl font-bold ${getScoreColor(results.score)}`}>
                {results.score}%
              </span>
              <span className="text-gray-600">
                ({results.correctAnswers}/{results.totalQuestions})
              </span>
            </div>

            <p className="text-gray-600">
              {isPassed
                ? 'PMP試験の合格基準（61%）を達成しました。'
                : 'もう少しで合格です。苦手分野を重点的に復習しましょう。'}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">正解数</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{results.correctAnswers}</p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium">不正解数</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{results.incorrectAnswers}</p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-gray-600" />
                <span className="font-medium">未回答</span>
              </div>
              <p className="text-2xl font-bold text-gray-600">{results.unanswered}</p>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              onClick={() => navigate('/mock-exam')}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              <RefreshCw className="h-5 w-5" />
              もう一度挑戦
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Home className="h-5 w-5" />
              ホームに戻る
            </button>
          </div>
        </div>

        {/* ドメイン別分析 */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
            <BarChart3 className="h-6 w-6" />
            ドメイン別分析
          </h2>

          <div className="space-y-4">
            {Object.entries(examDomains).map(([key, domain]) => {
              const domainScore = results.domainScores[key]
              if (!domainScore || domainScore.total === 0) return null

              return (
                <div key={key}>
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <span className="font-medium">{domain.name}</span>
                      <span className="ml-2 text-sm text-gray-600">
                        ({domainScore.correct}/{domainScore.total})
                      </span>
                    </div>
                    <span className={`font-bold ${getScoreColor(domainScore.percentage)}`}>
                      {domainScore.percentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        domainScore.percentage >= 80
                          ? 'bg-green-600'
                          : domainScore.percentage >= 61
                            ? 'bg-blue-600'
                            : domainScore.percentage >= 40
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                      }`}
                      style={{ width: `${domainScore.percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 知識エリア別分析 */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
            <TrendingUp className="h-6 w-6" />
            知識エリア別分析
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Object.entries(results.knowledgeAreaScores).map(([area, score]) => {
              const areaName = processCategories[area] || area

              return (
                <div key={area} className="rounded-lg bg-gray-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">{areaName}</span>
                    <span className={`font-bold ${getScoreColor(score.percentage)}`}>
                      {score.percentage}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        score.percentage >= 80
                          ? 'bg-green-600'
                          : score.percentage >= 61
                            ? 'bg-blue-600'
                            : score.percentage >= 40
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                      }`}
                      style={{ width: `${score.percentage}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    {score.correct}/{score.total} 問正解
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 問題と解答の詳細 */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <BookOpen className="h-6 w-6" />
              問題と解答の詳細
            </h2>

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={showIncorrectOnly}
                onChange={(e) => setShowIncorrectOnly(e.target.checked)}
                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">不正解のみ表示</span>
            </label>
          </div>

          <div className="space-y-6">
            {questionsToShow.map((question, index) => {
              const userAnswer = answers[question.id]
              const isCorrect =
                (question.type === 'single_choice' && userAnswer === question.correctAnswer) ||
                (question.type === 'multiple_choice' &&
                  JSON.stringify((userAnswer || []).sort()) ===
                    JSON.stringify(question.correctAnswers.sort()))

              return (
                <div key={question.id} className="rounded-lg border p-6">
                  <div className="mb-4 flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                        isCorrect ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="font-medium">
                          問題 {question.questionNumber || index + 1}
                        </span>
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                          {question.domain.toUpperCase()}
                        </span>
                      </div>
                      <p className="mb-4 text-gray-900">{question.question}</p>

                      <div className="mb-4 space-y-2">
                        {question.options.map((option) => {
                          const optionLetter = option.charAt(0)
                          const isUserAnswer =
                            question.type === 'single_choice'
                              ? userAnswer === optionLetter
                              : (userAnswer || []).includes(optionLetter)
                          const isCorrectAnswer =
                            question.type === 'single_choice'
                              ? question.correctAnswer === optionLetter
                              : question.correctAnswers.includes(optionLetter)

                          return (
                            <div
                              key={option}
                              className={`rounded-lg p-3 ${
                                isCorrectAnswer
                                  ? 'border border-green-300 bg-green-50'
                                  : isUserAnswer && !isCorrectAnswer
                                    ? 'border border-red-300 bg-red-50'
                                    : 'bg-gray-50'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {isCorrectAnswer && (
                                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                                )}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                                )}
                                <span className={`${isCorrectAnswer ? 'font-medium' : ''}`}>
                                  {option}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {!isCorrect && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                          <h4 className="mb-2 font-medium text-blue-900">解説</h4>
                          <p className="text-sm text-blue-800">{question.explanation}</p>
                          {question.references && (
                            <div className="mt-2 text-xs text-blue-700">
                              参考: {question.references.join(', ')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(ExamResults)
