import React, { useState, useEffect, useCallback } from 'react'
import {
  Brain,
  Target,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Lightbulb,
  Award,
  ArrowRight,
  RefreshCw,
  MessageSquare,
  BarChart3,
} from 'lucide-react'
import aiCoachingService from '../../services/aiCoachingService'

const AICoachingDashboard = () => {
  const [learningPath, setLearningPath] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeCoaching, setActiveCoaching] = useState(null)
  const [_userProgress, setUserProgress] = useState({})
  const [selectedWeekness, setSelectedWeekness] = useState(null)

  // Mock user ID - in real app this would come from auth context
  const userId = 'user123'

  useEffect(() => {
    loadAICoaching()
  }, [])

  const loadAICoaching = useCallback(async () => {
    setLoading(true)
    try {
      // In a real app, this would fetch from API
      const mockUserProgress = {
        p1: { masteryScore: 0.85, attempts: 5, lastStudied: '2024-01-15' },
        p2: { masteryScore: 0.45, attempts: 8, lastStudied: '2024-01-14' },
        p3: { masteryScore: 0.72, attempts: 3, lastStudied: '2024-01-13' },
        p8: { masteryScore: 0.35, attempts: 12, lastStudied: '2024-01-12' },
        p9: { masteryScore: 0.55, attempts: 6, lastStudied: '2024-01-11' },
      }

      const mockLearningGoals = {
        targetExamDate: '2024-03-15',
        intensity: 'high',
        currentRole: 'aspiring_pm',
        targetRole: 'senior_pm',
      }

      setUserProgress(mockUserProgress)

      const path = aiCoachingService.generatePersonalizedPath(
        userId,
        mockUserProgress,
        mockLearningGoals
      )

      setLearningPath(path)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading AI coaching:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [userId])

  const handleStartCoachingSession = useCallback(
    async (activity) => {
      const coaching = aiCoachingService.provideRealTimeCoaching(userId, activity, {
        accuracy: 0.75,
        speed: 1.2,
        confidence: 0.8,
      })
      setActiveCoaching(coaching)
    },
    [userId]
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!learningPath) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            AIコーチングデータを読み込めませんでした
          </h2>
          <button
            onClick={loadAICoaching}
            className="mx-auto flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            再読み込み
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <Brain className="mr-3 h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AIコーチング</h1>
          </div>
          <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-300">
            あなた専用のAIコーチが学習を分析し、最適化された学習パスと個別指導を提供します
          </p>
        </div>

        {/* Current Level & Progress */}
        <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center text-xl font-semibold text-gray-900 dark:text-white">
              <Target className="mr-2 h-5 w-5 text-green-500" />
              現在のレベル
            </h2>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Clock className="mr-1 h-4 w-4" />
              最終更新: {new Date(learningPath.generatedAt).toLocaleString('ja-JP')}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-900/20">
              <div className="text-2xl font-bold text-blue-600">{learningPath.currentLevel}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">総合習熟度</div>
            </div>
            <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-900/20">
              <div className="text-2xl font-bold text-green-600">
                {Math.ceil(
                  (new Date(learningPath.targetDate) - new Date()) / (1000 * 60 * 60 * 24)
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">試験まで残り日数</div>
            </div>
            <div className="rounded-lg bg-purple-50 p-4 text-center dark:bg-purple-900/20">
              <div className="text-2xl font-bold text-purple-600">
                {learningPath.weeklySchedule?.totalWeeklyHours || 0}h
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">週間学習時間</div>
            </div>
            <div className="rounded-lg bg-amber-50 p-4 text-center dark:bg-amber-900/20">
              <div className="text-2xl font-bold text-amber-600">A</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">学習グレード</div>
            </div>
          </div>
        </div>

        {/* Immediate Actions */}
        {learningPath.immediateActions && learningPath.immediateActions.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-white">
              <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
              今すぐ取り組むべきこと
            </h2>

            <div className="space-y-4">
              {learningPath.immediateActions.map((action, index) => (
                <div
                  key={index}
                  className={`rounded-lg border-l-4 p-4 ${
                    action.priority === 'urgent'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                      : action.priority === 'high'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10'
                        : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
                        {action.title}
                      </h3>
                      <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
                        {action.description}
                      </p>

                      {action.actions && (
                        <div className="space-y-2">
                          {action.actions.map((subAction, subIndex) => (
                            <div
                              key={subIndex}
                              className="flex items-center justify-between rounded bg-white p-2 dark:bg-gray-700"
                            >
                              <span className="text-sm font-medium">{subAction.area}</span>
                              <span className="text-xs text-gray-500">
                                {subAction.estimatedTime}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="ml-4 text-right">
                      <div className="mb-2 text-xs text-gray-500">{action.timeline}</div>
                      <button
                        onClick={() =>
                          handleStartCoachingSession({
                            type: action.type,
                            topic: action.title,
                          })
                        }
                        className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                      >
                        開始
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Schedule */}
        <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-white">
            <Calendar className="mr-2 h-5 w-5 text-blue-500" />
            週間学習スケジュール
          </h2>

          {learningPath.weeklySchedule && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
              {Object.entries(learningPath.weeklySchedule.dailyBreakdown || {}).map(
                ([day, schedule]) => (
                  <div
                    key={day}
                    className="rounded-lg border border-gray-200 p-4 dark:border-gray-600"
                  >
                    <h3 className="mb-2 font-semibold capitalize text-gray-900 dark:text-white">
                      {day}
                    </h3>
                    <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                      {schedule.duration}時間
                    </div>
                    <div className="space-y-1">
                      {schedule.activities?.map((activity, index) => (
                        <div
                          key={index}
                          className="rounded bg-blue-50 px-2 py-1 text-xs dark:bg-blue-900/20"
                        >
                          {activity}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Study Plan & Weaknesses */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Weaknesses Analysis */}
          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-white">
              <BarChart3 className="mr-2 h-5 w-5 text-orange-500" />
              弱点分析
            </h2>

            {learningPath.studyPlan?.weaknesses && learningPath.studyPlan.weaknesses.length > 0 ? (
              <div className="space-y-3">
                {learningPath.studyPlan.weaknesses.slice(0, 5).map((weakness, index) => (
                  <div
                    key={index}
                    className="cursor-pointer rounded border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                    onClick={() => setSelectedWeekness(selectedWeekness === index ? null : index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`mr-2 h-3 w-3 rounded-full ${
                            weakness.severity === 'critical'
                              ? 'bg-red-500'
                              : weakness.severity === 'moderate'
                                ? 'bg-orange-500'
                                : 'bg-yellow-500'
                          }`}
                        ></div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {weakness.area || weakness.group || weakness.processId}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.round((weakness.score || 0) * 100)}%
                      </div>
                    </div>

                    {selectedWeekness === index && (
                      <div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-600">
                        <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                          {weakness.recommendation}
                        </p>
                        <button className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700">
                          集中学習を開始
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-gray-600 dark:text-gray-300">
                重要な弱点は見つかりませんでした。順調に学習が進んでいます！
              </p>
            )}
          </div>

          {/* Career Path */}
          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-white">
              <Award className="mr-2 h-5 w-5 text-purple-500" />
              キャリア発展パス
            </h2>

            {learningPath.postCertificationPath && (
              <div className="space-y-4">
                <div className="rounded bg-purple-50 p-3 dark:bg-purple-900/20">
                  <h3 className="mb-2 font-semibold text-purple-900 dark:text-purple-100">
                    {learningPath.postCertificationPath.immediate?.title}
                  </h3>
                  <ul className="space-y-1 text-sm text-purple-800 dark:text-purple-200">
                    {learningPath.postCertificationPath.immediate?.goals.map((goal, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="mr-2 h-3 w-3 flex-shrink-0" />
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded bg-blue-50 p-3 dark:bg-blue-900/20">
                  <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                    {learningPath.postCertificationPath.shortTerm?.title}
                  </h3>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    主要マイルストーン:
                    <ul className="mt-1 space-y-1">
                      {learningPath.postCertificationPath.shortTerm?.milestones.map(
                        (milestone, index) => (
                          <li key={index} className="flex items-center">
                            <Star className="mr-2 h-3 w-3 flex-shrink-0" />
                            {milestone}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Coaching Session */}
        {activeCoaching && (
          <div className="rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 p-6 shadow-lg dark:from-purple-900/20 dark:to-blue-900/20">
            <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-white">
              <MessageSquare className="mr-2 h-5 w-5 text-purple-500" />
              リアルタイムコーチング
            </h2>

            <div className="space-y-4">
              {activeCoaching.feedback.map((feedback, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-4 ${
                    feedback.type === 'improvement'
                      ? 'border-l-4 border-orange-500 bg-orange-100 dark:bg-orange-900/20'
                      : feedback.type === 'advancement'
                        ? 'border-l-4 border-green-500 bg-green-100 dark:bg-green-900/20'
                        : 'border-l-4 border-blue-500 bg-blue-100 dark:bg-blue-900/20'
                  }`}
                >
                  <div className="flex items-start">
                    <Lightbulb className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-500" />
                    <div>
                      <p className="mb-1 font-medium text-gray-900 dark:text-white">
                        {feedback.message}
                      </p>
                      {feedback.suggestions && (
                        <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                          {feedback.suggestions.map((suggestion, suggestionIndex) => (
                            <li key={suggestionIndex} className="flex items-center">
                              <ArrowRight className="mr-2 h-3 w-3 flex-shrink-0" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="text-center">
                <p className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                  {activeCoaching.encouragement}
                </p>
                <button
                  onClick={() => setActiveCoaching(null)}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
                >
                  次のセッションに進む
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AICoachingDashboard
