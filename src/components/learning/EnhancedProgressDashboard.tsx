/**
 * Enhanced Learning Progress Dashboard with Real-time Backend Integration
 * Developer 2: Learning Progress Developer Implementation
 */

import React, { useState, useEffect } from 'react'
import {
  _BarChart3,
  TrendingUp,
  Target,
  _Calendar,
  Clock,
  Trophy,
  Star,
  _BookOpen,
  Brain,
  Zap,
  _ChevronRight,
  _Settings,
  Download,
  _Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Flame,
  Award,
} from 'lucide-react'
import {
  useProgressStore,
  type _ProcessProgress,
  type _LearningGoal,
  type _StudySession,
  type _Achievement,
} from '../../stores/progressStore'
// import { api } from '../../lib/api/client' // TODO: Will be used in future
import { useToast } from '../../hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { format, subDays } from 'date-fns'

const EnhancedProgressDashboard: React.FC = () => {
  const { toast } = useToast()
  const [activeView, setActiveView] = useState<'overview' | 'analytics' | 'goals' | 'achievements'>(
    'overview'
  )
  // //   const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('week') // TODO: Will be used in future // TODO: Will be used in future
  const [isExporting, setIsExporting] = useState(false)

  // Store state and actions
  const {
    processProgress,
    // studySessions, // TODO: Will be used in future
    achievements,
    goals,
    studyStreak,
    isLoading,
    error,
    loadProgress,
    syncWithServer,
    getWeeklyProgress,
    getMonthlyTrends,
    getTotalStudyTime,
    getOverallProgress,
    getWeakAreas,
    getStrongAreas,
    getRecommendedStudy,
    createGoal,
    // updateGoal, // TODO: Will be used in future
    checkAchievements,
    exportProgress,
  } = useProgressStore()

  // Load data on mount
  useEffect(() => {
    loadProgress()
    checkAchievements()
  }, [])

  // Auto-sync with server every 5 minutes
  useEffect(() => {
    const interval = setInterval(syncWithServer, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleExportProgress = async () => {
    setIsExporting(true)
    try {
      const data = exportProgress()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pmp-progress-${format(new Date(), 'yyyy-MM-dd')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: 'Progress Exported',
        description: 'Your learning progress has been exported successfully.',
      })
    } catch (__error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export progress data.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleCreateGoal = async (goalData: unknown) => {
    try {
      await createGoal(goalData)
      toast({
        title: 'Goal Created',
        description: 'Your new learning goal has been created.',
      })
    } catch (__error) {
      toast({
        title: 'Failed to Create Goal',
        description: 'Could not create your learning goal.',
        variant: 'destructive',
      })
    }
  }

  // Chart data preparation
  const weeklyProgress = getWeeklyProgress()
  const monthlyTrends = getMonthlyTrends()
  const totalStudyTime = getTotalStudyTime()
  const overallProgress = getOverallProgress()
  const weakAreas = getWeakAreas()
  const strongAreas = getStrongAreas()
  const recommendations = getRecommendedStudy()

  // Process mastery distribution
  const masteryDistribution = Object.values(processProgress).reduce(
    (acc, process) => {
      acc[process.masteryLevel] = (acc[process.masteryLevel] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const masteryChartData = Object.entries(masteryDistribution).map(([level, count]) => ({
    name: level.replace('_', ' ').toUpperCase(),
    value: count,
    color:
      {
        not_started: '#f3f4f6',
        beginner: '#fbbf24',
        intermediate: '#60a5fa',
        advanced: '#34d399',
        mastered: '#10b981',
      }[level] || '#gray-400',
  }))

  // Knowledge area performance
  const knowledgeAreaData = Object.entries(
    Object.values(processProgress).reduce(
      (acc, process) => {
        if (!acc[process.knowledgeArea]) {
          acc[process.knowledgeArea] = { total: 0, mastered: 0, studyTime: 0 }
        }
        acc[process.knowledgeArea].total += 1
        if (process.masteryLevel === 'mastered') {acc[process.knowledgeArea].mastered += 1}
        acc[process.knowledgeArea].studyTime += process.studyTime
        return acc
      },
      {} as Record<string, { total: number; mastered: number; studyTime: number }>
    )
  ).map(([area, data]) => ({
    area: area.replace(/([A-Z])/g, ' $1').trim(),
    mastery: (data.mastered / data.total) * 100,
    studyTime: data.studyTime,
    fullMark: 100,
  }))

  // Recent achievements (last 30 days)
  const recentAchievements = achievements
    .filter((a) => a.isUnlocked && a.unlockedAt && a.unlockedAt > subDays(new Date(), 30))
    .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
    .slice(0, 5)

  // Active goals with progress
  const activeGoals = goals
    .filter((g) => !g.isCompleted)
    .sort((a, b) => (a.targetDate?.getTime() || 0) - (b.targetDate?.getTime() || 0))
    .slice(0, 3)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
            <h3 className="mb-2 text-lg font-semibold">Loading Progress</h3>
            <p className="text-gray-600">Fetching your learning data...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Learning Progress Dashboard</h1>
              <p className="text-gray-600">Track your PMP certification journey</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={syncWithServer}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportProgress}
                disabled={isExporting}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Key Metrics Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Study Time */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-100 p-3">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Study Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overall Progress */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-100 p-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{overallProgress}%</p>
                  <Progress value={overallProgress} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Study Streak */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-orange-100 p-3">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Streak</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {studyStreak.currentStreak} days
                  </p>
                  <p className="text-xs text-gray-500">Best: {studyStreak.longestStreak} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-purple-100 p-3">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Achievements</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {achievements.filter((a) => a.isUnlocked).length}
                  </p>
                  <p className="text-xs text-gray-500">of {achievements.length} unlocked</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs
          value={activeView}
          onValueChange={(value) =>
            setActiveView(value as 'overview' | 'analytics' | 'goals' | 'achievements')
          }
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Weekly Progress Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Study Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={weeklyProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                        formatter={(value: number, name: string) => [
                          name === 'studyTime' ? `${value} min` : value,
                          name === 'studyTime' ? 'Study Time' : 'Processes Studied',
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="studyTime"
                        stroke="#3b82f6"
                        fill="#93c5fd"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Mastery Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Process Mastery Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={masteryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {masteryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {masteryChartData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs text-gray-600">
                          {entry.name} ({entry.value})
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Weak Areas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    Areas to Improve
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {weakAreas.length > 0 ? (
                    weakAreas.map((process) => (
                      <div key={process.processId} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {process.processName}
                          </p>
                          <p className="text-xs text-gray-500">{process.knowledgeArea}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {process.confidenceScore}%
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-center text-gray-500">
                      Great job! No weak areas identified.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Strong Areas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-green-600" />
                    Strong Areas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {strongAreas.length > 0 ? (
                    strongAreas.map((process) => (
                      <div key={process.processId} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {process.processName}
                          </p>
                          <p className="text-xs text-gray-500">{process.knowledgeArea}</p>
                        </div>
                        <Badge variant="default" className="bg-green-600 text-xs">
                          {process.confidenceScore}%
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-center text-gray-500">
                      Keep studying to build strong areas!
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recommendations.length > 0 ? (
                    recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                        <p className="text-sm text-gray-700">{recommendation}</p>
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-center text-gray-500">
                      No specific recommendations at this time.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Monthly Study Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Study Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyTrends.studyTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`${value} minutes`, 'Study Time']} />
                      <Line
                        type="monotone"
                        dataKey="minutes"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Knowledge Area Performance Radar */}
              <Card>
                <CardHeader>
                  <CardTitle>Knowledge Area Mastery</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={knowledgeAreaData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="area" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar
                        name="Mastery %"
                        dataKey="mastery"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Process Progress Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Process Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left">Process</th>
                        <th className="p-2 text-left">Knowledge Area</th>
                        <th className="p-2 text-left">Mastery Level</th>
                        <th className="p-2 text-left">Study Time</th>
                        <th className="p-2 text-left">Confidence</th>
                        <th className="p-2 text-left">Last Studied</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(processProgress)
                        .sort((a, b) => b.studyTime - a.studyTime)
                        .slice(0, 10)
                        .map((process) => (
                          <tr key={process.processId} className="border-b">
                            <td className="p-2 font-medium">{process.processName}</td>
                            <td className="p-2 text-gray-600">{process.knowledgeArea}</td>
                            <td className="p-2">
                              <Badge
                                variant={
                                  process.masteryLevel === 'mastered'
                                    ? 'default'
                                    : process.masteryLevel === 'advanced'
                                      ? 'secondary'
                                      : 'outline'
                                }
                                className="capitalize"
                              >
                                {process.masteryLevel.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="p-2">{process.studyTime}m</td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <Progress value={process.confidenceScore} className="h-2 w-16" />
                                <span className="text-xs">{process.confidenceScore}%</span>
                              </div>
                            </td>
                            <td className="p-2 text-gray-500">
                              {process.lastStudied
                                ? format(process.lastStudied, 'MMM dd')
                                : 'Never'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Learning Goals</h2>
              <Button
                onClick={() =>
                  handleCreateGoal({
                    title: 'New Goal',
                    description: 'Description',
                    type: 'study_time',
                    targetValue: 100,
                    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  })
                }
              >
                <Target className="mr-2 h-4 w-4" />
                Create Goal
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeGoals.map((goal) => (
                <Card key={goal.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      {goal.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-sm text-gray-600">{goal.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>
                          {goal.currentValue} / {goal.targetValue}
                        </span>
                      </div>
                      <Progress value={(goal.currentValue / goal.targetValue) * 100} />
                      {goal.targetDate && (
                        <p className="mt-2 text-xs text-gray-500">
                          Due: {format(goal.targetDate, 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Completed Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Completed Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {goals
                    .filter((g) => g.isCompleted)
                    .slice(0, 5)
                    .map((goal) => (
                      <div key={goal.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{goal.title}</p>
                          <p className="text-sm text-gray-500">{goal.description}</p>
                        </div>
                        <Badge variant="default" className="bg-green-600">
                          Completed
                        </Badge>
                      </div>
                    ))}
                  {goals.filter((g) => g.isCompleted).length === 0 && (
                    <p className="py-4 text-center text-gray-500">
                      No completed goals yet. Keep working towards your targets!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Recent Achievements */}
              <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {recentAchievements.length > 0 ? (
                      recentAchievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className="rounded-lg border border-yellow-200 bg-gradient-to-r from-yellow-50 to-yellow-100 p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{achievement.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                              <p className="text-sm text-gray-600">{achievement.description}</p>
                              <p className="mt-1 text-xs text-gray-500">
                                {achievement.unlockedAt &&
                                  format(achievement.unlockedAt, 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-8 text-center">
                        <Trophy className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                        <p className="text-gray-500">No recent achievements. Keep studying!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* All Achievements Grid */}
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`${
                    achievement.isUnlocked
                      ? 'border-yellow-300 bg-yellow-50'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl opacity-80">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4
                          className={`font-semibold ${
                            achievement.isUnlocked ? 'text-yellow-900' : 'text-gray-600'
                          }`}
                        >
                          {achievement.title}
                        </h4>
                        <p
                          className={`text-sm ${
                            achievement.isUnlocked ? 'text-yellow-700' : 'text-gray-500'
                          }`}
                        >
                          {achievement.description}
                        </p>
                        {!achievement.isUnlocked && (
                          <div className="mt-2">
                            <div className="mb-1 flex justify-between text-xs text-gray-500">
                              <span>Progress</span>
                              <span>{achievement.progress.toFixed(0)}%</span>
                            </div>
                            <Progress value={achievement.progress} className="h-1" />
                          </div>
                        )}
                        {achievement.isUnlocked && achievement.unlockedAt && (
                          <p className="mt-1 text-xs text-yellow-600">
                            Unlocked {format(achievement.unlockedAt, 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default EnhancedProgressDashboard
