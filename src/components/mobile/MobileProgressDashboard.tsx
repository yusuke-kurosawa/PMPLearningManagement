import React, { useState } from 'react'
import {
  TrendingUp,
  Target,
  Award,
  Clock,
  BookOpen,
  Brain,
  Calendar,
  ChevronRight,
  Trophy,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
// import { Badge } from '@/components/ui/badge' // TODO: Will be used in future
import { Button } from '@/components/ui/button'
import { usePullToRefresh } from '@/hooks/useTouchGestures'

interface LearningStats {
  totalStudyHours: number
  completedProcesses: number
  totalProcesses: number
  examScore: number | null
  streakDays: number
  knowledgeAreaProgress: Record<string, number>
  processGroupProgress: Record<string, number>
  weeklyGoal: number
  weeklyProgress: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ElementType
  unlockedAt?: Date
  progress?: number
  target?: number
}

interface MobileProgressDashboardProps {
  stats: LearningStats
  achievements: Achievement[]
  onRefresh?: () => Promise<void>
}

const knowledgeAreas = [
  '統合管理',
  'スコープ管理',
  'スケジュール管理',
  'コスト管理',
  '品質管理',
  '資源管理',
  'コミュニケーション管理',
  'リスク管理',
  '調達管理',
  'ステークホルダー管理',
]

const processGroups = ['立ち上げ', '計画', '実行', '監視・コントロール', '終結']

export function MobileProgressDashboard({
  stats,
  achievements,
  onRefresh,
}: MobileProgressDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'details'>('overview')

  const { isPulling, pullDistance } = usePullToRefresh(onRefresh || (() => Promise.resolve()))

  const completionRate = (stats.completedProcesses / stats.totalProcesses) * 100
  const weeklyGoalRate = (stats.weeklyProgress / stats.weeklyGoal) * 100

  const recentAchievements = achievements
    .filter((a) => a.unlockedAt)
    .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
    .slice(0, 3)

  const inProgressAchievements = achievements
    .filter((a) => !a.unlockedAt && a.progress !== undefined)
    .sort((a, b) => (b.progress || 0) - (a.progress || 0))
    .slice(0, 5)

  return (
    <div className="flex h-full flex-col bg-gray-50 dark:bg-gray-900">
      {/* Pull to refresh indicator */}
      {isPulling && (
        <div
          className="fixed left-1/2 top-0 z-50 -translate-x-1/2 transform transition-transform"
          style={{ transform: `translate(-50%, ${pullDistance - 40}px)` }}
        >
          <div className="rounded-full bg-blue-600 p-2 text-white">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex px-4">
          {[
            { key: 'overview', label: '概要', icon: TrendingUp },
            { key: 'achievements', label: '実績', icon: Trophy },
            { key: 'details', label: '詳細', icon: BookOpen },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`
                flex flex-1 items-center justify-center space-x-2 border-b-2 py-4 transition-colors
                ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400'
                }
              `}
            >
              <tab.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="space-y-4 p-4">
            {/* Key Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{stats.totalStudyHours}h</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">総学習時間</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{Math.round(completionRate)}%</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">完了率</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">{stats.streakDays}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">連続学習日</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {stats.examScore ? `${stats.examScore}%` : '--'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">最高得点</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Goal Progress */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Calendar className="h-4 w-4" />
                  <span>今週の目標</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {stats.weeklyProgress}h / {stats.weeklyGoal}h
                    </span>
                    <span className="font-medium">{Math.round(weeklyGoalRate)}%</span>
                  </div>
                  <Progress value={weeklyGoalRate} className="h-2" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    目標まであと {Math.max(0, stats.weeklyGoal - stats.weeklyProgress)}時間
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            {recentAchievements.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">最新の実績</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('achievements')}>
                      すべて見る <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center space-x-3 rounded-lg bg-yellow-50 p-2 dark:bg-yellow-900/20"
                    >
                      <achievement.icon className="h-6 w-6 text-yellow-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{achievement.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="flex h-auto flex-col items-center space-y-2 p-4">
                <BookOpen className="h-6 w-6" />
                <span className="text-sm">学習を続ける</span>
              </Button>
              <Button variant="outline" className="flex h-auto flex-col items-center space-y-2 p-4">
                <Target className="h-6 w-6" />
                <span className="text-sm">模擬試験</span>
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-4 p-4">
            {/* Unlocked Achievements */}
            <div>
              <h3 className="mb-3 font-medium">獲得した実績</h3>
              <div className="space-y-3">
                {recentAchievements.map((achievement) => (
                  <Card key={achievement.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/20">
                          <achievement.icon className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{achievement.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {achievement.description}
                          </p>
                          {achievement.unlockedAt && (
                            <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                              獲得: {achievement.unlockedAt.toLocaleDateString('ja-JP')}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* In Progress Achievements */}
            {inProgressAchievements.length > 0 && (
              <div>
                <h3 className="mb-3 font-medium">進行中の実績</h3>
                <div className="space-y-3">
                  {inProgressAchievements.map((achievement) => (
                    <Card key={achievement.id}>
                      <CardContent className="pt-4">
                        <div className="mb-3 flex items-center space-x-3">
                          <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">
                            <achievement.icon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{achievement.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                        {achievement.progress !== undefined && achievement.target && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>
                                {achievement.progress} / {achievement.target}
                              </span>
                              <span className="font-medium">
                                {Math.round((achievement.progress / achievement.target) * 100)}%
                              </span>
                            </div>
                            <Progress
                              value={(achievement.progress / achievement.target) * 100}
                              className="h-2"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-4 p-4">
            {/* Knowledge Area Progress */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">知識エリア別進捗</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {knowledgeAreas.map((area) => (
                  <div key={area}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">{area}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {Math.round(stats.knowledgeAreaProgress[area] || 0)}%
                      </span>
                    </div>
                    <Progress value={stats.knowledgeAreaProgress[area] || 0} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Process Group Progress */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">プロセス群別進捗</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {processGroups.map((group) => (
                  <div key={group}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">{group}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {Math.round(stats.processGroupProgress[group] || 0)}%
                      </span>
                    </div>
                    <Progress value={stats.processGroupProgress[group] || 0} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Learning Statistics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">学習統計</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">完了プロセス</span>
                  <span className="font-medium">
                    {stats.completedProcesses} / {stats.totalProcesses}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">平均学習時間/日</span>
                  <span className="font-medium">{(stats.totalStudyHours / 30).toFixed(1)}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">学習継続日数</span>
                  <span className="font-medium">{stats.streakDays}日</span>
                </div>
                {stats.examScore && (
                  <div className="flex justify-between">
                    <span className="text-sm">最高模擬試験得点</span>
                    <span className="font-medium">{stats.examScore}%</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default MobileProgressDashboard
