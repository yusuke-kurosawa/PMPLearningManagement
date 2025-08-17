import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  Clock,
  Award,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  Target,
  Calendar,
  BarChart3,
} from 'lucide-react'
import { useProgress, processCategories, processGroups } from '../../services/progressService'

const LearningProgressDashboard = () => {
  const navigate = useNavigate()
  const { statistics, resetProgress } = useProgress()
  const [selectedView, setSelectedView] = useState('overview')
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // データがロード中または未初期化の場合のローディング表示
  if (!statistics) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='text-gray-600'>進捗データを読み込み中...</p>
        </div>
      </div>
    )
  }

  const formatStudyTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}時間${mins}分`
    }
    return `${mins}分`
  }

  const formatDate = (dateString) => {
    if (!dateString) {
      return '未開始'
    }
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 80) {
      return 'text-green-600 bg-green-100'
    }
    if (percentage >= 60) {
      return 'text-blue-600 bg-blue-100'
    }
    if (percentage >= 40) {
      return 'text-yellow-600 bg-yellow-100'
    }
    if (percentage >= 20) {
      return 'text-orange-600 bg-orange-100'
    }
    return 'text-gray-600 bg-gray-100'
  }

  const getProgressBarColor = (percentage) => {
    if (percentage >= 80) {
      return 'bg-green-600'
    }
    if (percentage >= 60) {
      return 'bg-blue-600'
    }
    if (percentage >= 40) {
      return 'bg-yellow-600'
    }
    if (percentage >= 20) {
      return 'bg-orange-600'
    }
    return 'bg-gray-400'
  }

  const handleReset = () => {
    if (showResetConfirm) {
      resetProgress()
      setShowResetConfirm(false)
    } else {
      setShowResetConfirm(true)
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-6 rounded-lg bg-white p-6 shadow-lg'>
          <div className='mb-6 flex items-center justify-between'>
            <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>学習進捗ダッシュボード</h1>
            <button
              onClick={() => setSelectedView(selectedView === 'overview' ? 'detailed' : 'overview')}
              className='flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
            >
              <BarChart3 className='h-4 w-4' />
              <span className='hidden sm:inline'>
                {selectedView === 'overview' ? '詳細表示' : '概要表示'}
              </span>
            </button>
          </div>

          <div className='mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <div className='rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4'>
              <div className='mb-2 flex items-center justify-between'>
                <Target className='h-8 w-8 text-blue-600' />
                <span
                  className={`text-2xl font-bold ${getProgressColor(statistics.overall.percentage).split(' ')[0]}`}
                >
                  {statistics.overall.percentage}%
                </span>
              </div>
              <h3 className='text-sm font-medium text-gray-700'>全体進捗率</h3>
              <p className='mt-1 text-xs text-gray-600'>
                {statistics.overall.completed}/{statistics.overall.total} プロセス完了
              </p>
            </div>

            <div className='rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-4'>
              <div className='mb-2 flex items-center justify-between'>
                <CheckCircle2 className='h-8 w-8 text-green-600' />
                <span className='text-2xl font-bold text-green-600'>
                  {statistics.overall.completed}
                </span>
              </div>
              <h3 className='text-sm font-medium text-gray-700'>完了プロセス</h3>
              <p className='mt-1 text-xs text-gray-600'>
                残り {statistics.overall.total - statistics.overall.completed} プロセス
              </p>
            </div>

            <div className='rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4'>
              <div className='mb-2 flex items-center justify-between'>
                <Clock className='h-8 w-8 text-purple-600' />
                <span className='text-lg font-bold text-purple-600'>
                  {formatStudyTime(statistics.studyTime)}
                </span>
              </div>
              <h3 className='text-sm font-medium text-gray-700'>総学習時間</h3>
              <p className='mt-1 text-xs text-gray-600'>
                平均 {Math.round(statistics.studyTime / Math.max(statistics.overall.completed, 1))}
                分/プロセス
              </p>
            </div>

            <div className='rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-4'>
              <div className='mb-2 flex items-center justify-between'>
                <Calendar className='h-8 w-8 text-orange-600' />
                <span className='text-xs font-medium text-orange-600'>
                  {formatDate(statistics.lastUpdated).split(' ')[0]}
                </span>
              </div>
              <h3 className='text-sm font-medium text-gray-700'>最終更新</h3>
              <p className='mt-1 text-xs text-gray-600'>
                {formatDate(statistics.lastUpdated).split(' ')[1]}
              </p>
            </div>
          </div>

          {selectedView === 'overview' ? (
            <div className='space-y-6'>
              <div>
                <h2 className='mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900'>
                  <BookOpen className='h-5 w-5' />
                  知識エリア別進捗
                </h2>
                <div className='space-y-3'>
                  {Object.entries(processCategories).map(([key, name]) => {
                    const stat = statistics.byCategory[key] || { completed: 0, total: 0 }
                    const percentage =
                      stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0

                    return (
                      <div key={key} className='relative'>
                        <div className='mb-1 flex items-center justify-between'>
                          <span className='text-sm font-medium text-gray-700'>{name}</span>
                          <span className='text-sm text-gray-600'>
                            {stat.completed}/{stat.total} ({percentage}%)
                          </span>
                        </div>
                        <div className='h-2 w-full rounded-full bg-gray-200'>
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(percentage)}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <h2 className='mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900'>
                  <TrendingUp className='h-5 w-5' />
                  プロセス群別進捗
                </h2>
                <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5'>
                  {Object.entries(processGroups).map(([key, name]) => {
                    const stat = statistics.byGroup[key] || { completed: 0, total: 0 }
                    const percentage =
                      stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0

                    return (
                      <div key={key} className='text-center'>
                        <div className='relative mx-auto mb-2 h-20 w-20'>
                          <svg className='h-20 w-20 -rotate-90 transform'>
                            <circle
                              cx='40'
                              cy='40'
                              r='36'
                              stroke='currentColor'
                              strokeWidth='8'
                              fill='none'
                              className='text-gray-200'
                            />
                            <circle
                              cx='40'
                              cy='40'
                              r='36'
                              stroke='currentColor'
                              strokeWidth='8'
                              fill='none'
                              strokeDasharray={`${percentage * 2.26} 226`}
                              className={getProgressBarColor(percentage)}
                            />
                          </svg>
                          <div className='absolute inset-0 flex items-center justify-center'>
                            <span className='text-sm font-bold'>{percentage}%</span>
                          </div>
                        </div>
                        <p className='text-xs font-medium text-gray-700'>{name}</p>
                        <p className='text-xs text-gray-600'>
                          {stat.completed}/{stat.total}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className='space-y-6'>
              <h2 className='mb-4 text-lg font-semibold text-gray-900'>詳細進捗データ</h2>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                        カテゴリ
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                        完了数
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                        進捗率
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                        ステータス
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200 bg-white'>
                    {Object.entries(processCategories).map(([key, name]) => {
                      const stat = statistics.byCategory[key] || { completed: 0, total: 0 }
                      const percentage =
                        stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0

                      return (
                        <tr key={key} className='hover:bg-gray-50'>
                          <td className='whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900'>
                            {name}
                          </td>
                          <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                            {stat.completed} / {stat.total}
                          </td>
                          <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                            <div className='flex items-center'>
                              <div className='mr-2 h-2 w-24 rounded-full bg-gray-200'>
                                <div
                                  className={`h-2 rounded-full ${getProgressBarColor(percentage)}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span>{percentage}%</span>
                            </div>
                          </td>
                          <td className='whitespace-nowrap px-6 py-4'>
                            <span
                              className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getProgressColor(percentage)}`}
                            >
                              {percentage === 100 ? '完了' : percentage >= 50 ? '進行中' : '開始'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className='mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row'>
            <div className='flex gap-4'>
              <button
                onClick={() => navigate('/matrix')}
                className='flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
              >
                <BookOpen className='h-4 w-4' />
                学習を続ける
              </button>
              <button
                onClick={() => navigate('/integrated')}
                className='flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700'
              >
                <Award className='h-4 w-4' />
                統合ビューで確認
              </button>
            </div>

            <button
              onClick={handleReset}
              onBlur={() => setTimeout(() => setShowResetConfirm(false), 200)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
                showResetConfirm
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <RefreshCw className='h-4 w-4' />
              {showResetConfirm ? '本当にリセットしますか？' : '進捗をリセット'}
            </button>
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-lg'>
          <h2 className='mb-4 text-lg font-semibold text-gray-900'>学習のヒント</h2>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <div className='rounded-lg bg-blue-50 p-4'>
              <h3 className='mb-2 font-medium text-blue-900'>効率的な学習方法</h3>
              <p className='text-sm text-blue-700'>
                知識エリアごとに集中して学習し、プロセス間の関係性を理解することが重要です。
              </p>
            </div>
            <div className='rounded-lg bg-green-50 p-4'>
              <h3 className='mb-2 font-medium text-green-900'>ITTOの理解</h3>
              <p className='text-sm text-green-700'>
                各プロセスのインプット、ツールと技法、アウトプットの流れを把握しましょう。
              </p>
            </div>
            <div className='rounded-lg bg-purple-50 p-4'>
              <h3 className='mb-2 font-medium text-purple-900'>実践的な応用</h3>
              <p className='text-sm text-purple-700'>
                学んだ知識を実際のプロジェクトに当てはめて考えることで、理解が深まります。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(LearningProgressDashboard)
