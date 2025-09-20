import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine,
} from 'recharts'
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Zap,
  Brain,
  BookOpen,
  Award,
  BarChart3,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Eye,
  Gauge,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react'
import LearningMetricsCalculator, {
  LearningMetrics,
  UserLearningData,
} from '@/services/analytics/LearningMetrics'

const RealTimeAnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<LearningMetrics | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [selectedMetric, setSelectedMetric] = useState('engagement')
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const [isLive, setIsLive] = useState(true)
  const [metricsCalculator] = useState(() => new LearningMetricsCalculator())
  const chartRef = useRef<HTMLDivElement>(null)

  // Real-time data simulation
  const [realtimeData, setRealtimeData] = useState<any[]>([])
  const [activeUsers, setActiveUsers] = useState(342)
  const [sessionsCount, setSessionsCount] = useState(1205)
  const [questionsAnswered, setQuestionsAnswered] = useState(15432)
  const [avgAccuracy, setAvgAccuracy] = useState(0.78)

  useEffect(() => {
    generateInitialMetrics()
    startRealTimeUpdates()

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [])

  const generateInitialMetrics = () => {
    // Generate mock user learning data
    const mockUserData: UserLearningData = {
      userId: 'user-123',
      examAttempts: Array.from({ length: 5 }, (_, i) => ({
        examId: `exam-${i}`,
        userId: 'user-123',
        score: 70 + Math.random() * 30,
        passed: Math.random() > 0.3,
        timestamp: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
      })),
      learningEvents: Array.from({ length: 50 }, (_, i) => ({
        eventId: `event-${i}`,
        userId: 'user-123',
        score: Math.random() * 100,
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        moduleId: `module-${i % 10}`,
      })),
      progressPoints: Array.from({ length: 30 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        score: 50 + i * 1.5 + Math.random() * 10,
        moduleId: `module-${i % 10}`,
      })),
      sessions: Array.from({ length: 20 }, (_, i) => ({
        sessionId: `session-${i}`,
        userId: 'user-123',
        startTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      })),
      answers: Array.from({ length: 100 }, (_, i) => ({
        answerId: `answer-${i}`,
        questionId: `question-${i}`,
        isCorrect: Math.random() > 0.25,
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
      })),
      interactions: Array.from({ length: 200 }, (_, i) => ({
        interactionId: `interaction-${i}`,
        contentType: ['video', 'text', 'quiz', 'simulation'][i % 4],
        duration: Math.random() * 3600,
        timestamp: new Date(Date.now() - i * 30 * 60 * 1000),
      })),
      initialScore: 45,
      currentScore: 78,
      daysSinceStart: 30,
      activeDays: 25,
      totalDays: 30,
      completedModules: 8,
      totalModules: 12,
      satisfactionScore: 4.5,
      participationRate: 0.83,
      resourceUtilization: 0.72,
      practiceProblemsPerDay: 15,
      interactionsPerSession: 25,
      currentStreak: 7,
      longTermRetention: 0.85,
      careerProgressionRate: 0.15,
      certificationPassRate: 0.75,
      applicationRate: 0.68,
      peerPercentile: 72,
      pathEfficiencyScore: 0.81,
      interactionPatterns: ['read', 'practice', 'review', 'test'],
      engagementTiming: {
        hourly: Array.from({ length: 24 }, () => Math.random() * 100),
        daily: Array.from({ length: 7 }, () => Math.random() * 100),
        monthly: Array.from({ length: 30 }, () => Math.random() * 100),
      },
      preferredDifficulty: 0.7,
      motivationFactors: ['certification', 'career growth', 'knowledge'],
      engagementHistory: Array.from({ length: 30 }, () => Math.random()),
      performanceHistory: Array.from({ length: 30 }, () => 50 + Math.random() * 50),
      totalHoursSpent: 45,
    }

    const calculatedMetrics = metricsCalculator.calculateAllMetrics(mockUserData)
    setMetrics(calculatedMetrics)
  }

  const startRealTimeUpdates = () => {
    // Generate initial real-time data points
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (20 - i) * 60 * 1000).toLocaleTimeString(),
      activeUsers: 300 + Math.random() * 100,
      questionsAnswered: Math.floor(Math.random() * 50),
      accuracy: 0.7 + Math.random() * 0.2,
      engagement: 0.6 + Math.random() * 0.3,
    }))
    setRealtimeData(initialData)

    // Update every 5 seconds
    const interval = setInterval(() => {
      if (isLive) {
        updateRealTimeData()
      }
    }, 5000)
    setRefreshInterval(interval)
  }

  const updateRealTimeData = () => {
    // Update real-time metrics
    setActiveUsers((prev) => Math.max(250, prev + Math.floor(Math.random() * 20 - 10)))
    setSessionsCount((prev) => prev + Math.floor(Math.random() * 5))
    setQuestionsAnswered((prev) => prev + Math.floor(Math.random() * 50))
    setAvgAccuracy((prev) => Math.min(1, Math.max(0.5, prev + (Math.random() - 0.5) * 0.02)))

    // Update chart data
    setRealtimeData((prev) => {
      const newData = [...prev.slice(1)]
      newData.push({
        time: new Date().toLocaleTimeString(),
        activeUsers: activeUsers + Math.random() * 20 - 10,
        questionsAnswered: Math.floor(Math.random() * 50),
        accuracy: avgAccuracy + (Math.random() - 0.5) * 0.05,
        engagement: 0.6 + Math.random() * 0.3,
      })
      return newData
    })
  }

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <ArrowUp className='h-4 w-4 text-green-500' />
      case 'decreasing':
        return <ArrowDown className='h-4 w-4 text-red-500' />
      case 'stable':
        return <Minus className='h-4 w-4 text-gray-500' />
    }
  }

  const getRiskColor = (score: number) => {
    if (score < 0.3) {
      return 'text-green-500'
    }
    if (score < 0.6) {
      return 'text-yellow-500'
    }
    return 'text-red-500'
  }

  const getRiskLabel = (score: number) => {
    if (score < 0.3) {
      return 'Low Risk'
    }
    if (score < 0.6) {
      return 'Medium Risk'
    }
    return 'High Risk'
  }

  // Learning style distribution data
  const learningStyleData = metrics
    ? [
        { style: 'Visual', value: metrics.behavioral.learningStyle.visual * 100 },
        { style: 'Auditory', value: metrics.behavioral.learningStyle.auditory * 100 },
        { style: 'Kinesthetic', value: metrics.behavioral.learningStyle.kinesthetic * 100 },
        { style: 'Reading', value: metrics.behavioral.learningStyle.reading * 100 },
      ]
    : []

  // Performance radar chart data
  const performanceRadarData = metrics
    ? [
        {
          metric: 'Knowledge',
          value: metrics.primary.competencyLevel,
        },
        {
          metric: 'Retention',
          value: metrics.primary.knowledgeRetention * 100,
        },
        {
          metric: 'Engagement',
          value: metrics.secondary.engagementRate * 100,
        },
        {
          metric: 'Accuracy',
          value: metrics.leading.questionAccuracy * 100,
        },
        {
          metric: 'Velocity',
          value: Math.min(100, metrics.primary.learningVelocity * 10),
        },
        {
          metric: 'Efficiency',
          value: Math.min(100, metrics.calculated.learningEfficiency * 10),
        },
      ]
    : []

  // Engagement timing heatmap data
  const engagementHeatmapData = metrics
    ? metrics.behavioral.engagementTiming.hourly.map((value, hour) => ({
        hour: `${hour}:00`,
        value,
      }))
    : []

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div className='container mx-auto space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Real-Time Learning Analytics</h1>
          <p className='text-muted-foreground'>
            Monitor learning effectiveness and student engagement in real-time
          </p>
        </div>
        <div className='flex gap-2'>
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='1h'>Last Hour</SelectItem>
              <SelectItem value='24h'>Last 24 Hours</SelectItem>
              <SelectItem value='7d'>Last 7 Days</SelectItem>
              <SelectItem value='30d'>Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant={isLive ? 'default' : 'outline'} onClick={() => setIsLive(!isLive)}>
            {isLive ? (
              <>
                <Activity className='mr-2 h-4 w-4 animate-pulse' />
                Live
              </>
            ) : (
              <>
                <Activity className='mr-2 h-4 w-4' />
                Paused
              </>
            )}
          </Button>
          <Button variant='outline'>
            <Download className='mr-2 h-4 w-4' />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time KPI Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Users</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{activeUsers}</div>
            <div className='flex items-center text-xs text-muted-foreground'>
              <TrendingUp className='mr-1 h-3 w-3 text-green-500' />
              +12% from yesterday
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Learning Sessions</CardTitle>
            <BookOpen className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{sessionsCount.toLocaleString()}</div>
            <div className='flex items-center text-xs text-muted-foreground'>
              <Clock className='mr-1 h-3 w-3' />
              45 min avg duration
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Questions Answered</CardTitle>
            <Brain className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{questionsAnswered.toLocaleString()}</div>
            <div className='flex items-center text-xs text-muted-foreground'>
              <Target className='mr-1 h-3 w-3' />
              {(avgAccuracy * 100).toFixed(1)}% accuracy
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Pass Prediction</CardTitle>
            <Award className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {metrics ? (metrics.primary.examPassRate * 100).toFixed(1) : 0}%
            </div>
            <div className='flex items-center text-xs text-muted-foreground'>
              <Zap className='mr-1 h-3 w-3 text-yellow-500' />
              Based on current performance
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='realtime' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='realtime'>Real-Time</TabsTrigger>
          <TabsTrigger value='performance'>Performance</TabsTrigger>
          <TabsTrigger value='engagement'>Engagement</TabsTrigger>
          <TabsTrigger value='predictions'>Predictions</TabsTrigger>
          <TabsTrigger value='cohorts'>Cohort Analysis</TabsTrigger>
        </TabsList>

        {/* Real-Time Monitoring */}
        <TabsContent value='realtime' className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            {/* Live Activity Stream */}
            <Card>
              <CardHeader>
                <CardTitle>Live Activity Stream</CardTitle>
                <CardDescription>Real-time user activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <LineChart data={realtimeData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='time' />
                    <YAxis yAxisId='left' />
                    <YAxis yAxisId='right' orientation='right' />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId='left'
                      type='monotone'
                      dataKey='activeUsers'
                      stroke='#8884d8'
                      strokeWidth={2}
                      dot={false}
                      name='Active Users'
                    />
                    <Line
                      yAxisId='right'
                      type='monotone'
                      dataKey='questionsAnswered'
                      stroke='#82ca9d'
                      strokeWidth={2}
                      dot={false}
                      name='Questions'
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Live Accuracy Tracking */}
            <Card>
              <CardHeader>
                <CardTitle>Accuracy & Engagement</CardTitle>
                <CardDescription>Real-time performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <AreaChart data={realtimeData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='time' />
                    <YAxis domain={[0, 1]} />
                    <Tooltip formatter={(value: number) => `${(value * 100).toFixed(1)}%`} />
                    <Legend />
                    <Area
                      type='monotone'
                      dataKey='accuracy'
                      stackId='1'
                      stroke='#8884d8'
                      fill='#8884d8'
                      fillOpacity={0.6}
                      name='Accuracy'
                    />
                    <Area
                      type='monotone'
                      dataKey='engagement'
                      stackId='2'
                      stroke='#82ca9d'
                      fill='#82ca9d'
                      fillOpacity={0.6}
                      name='Engagement'
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Risk Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Indicators</CardTitle>
              <CardDescription>Students requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>At-Risk Students</span>
                    <Badge variant='destructive'>23</Badge>
                  </div>
                  <Progress value={23} className='h-2' />
                  <p className='text-xs text-muted-foreground'>
                    Students with risk score {'>'} 0.6
                  </p>
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Inactive (7+ days)</span>
                    <Badge variant='warning'>12</Badge>
                  </div>
                  <Progress value={12} className='h-2' />
                  <p className='text-xs text-muted-foreground'>No activity in the past week</p>
                </div>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Struggling</span>
                    <Badge variant='secondary'>45</Badge>
                  </div>
                  <Progress value={45} className='h-2' />
                  <p className='text-xs text-muted-foreground'>Accuracy {'<'} 60%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Analysis */}
        <TabsContent value='performance' className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            {/* Performance Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Multi-dimensional performance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <RadarChart data={performanceRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey='metric' />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name='Current'
                      dataKey='value'
                      stroke='#8884d8'
                      fill='#8884d8'
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Learning Style Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Style Distribution</CardTitle>
                <CardDescription>Preferred learning modalities</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <PieChart>
                    <Pie
                      data={learningStyleData}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={(entry) => `${entry.style}: ${entry.value.toFixed(1)}%`}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {learningStyleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Metrics */}
          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle>Detailed Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                  <div>
                    <div className='text-sm font-medium text-muted-foreground'>Exam Pass Rate</div>
                    <div className='text-2xl font-bold'>
                      {(metrics.primary.examPassRate * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className='text-sm font-medium text-muted-foreground'>
                      Knowledge Retention
                    </div>
                    <div className='text-2xl font-bold'>
                      {(metrics.primary.knowledgeRetention * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className='text-sm font-medium text-muted-foreground'>Time to Mastery</div>
                    <div className='text-2xl font-bold'>{metrics.primary.timeToMastery} days</div>
                  </div>
                  <div>
                    <div className='text-sm font-medium text-muted-foreground'>
                      Learning Velocity
                    </div>
                    <div className='flex items-center text-2xl font-bold'>
                      {metrics.primary.learningVelocity.toFixed(2)}
                      {getTrendIcon(metrics.calculated.performanceTrend.trend)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Engagement Analysis */}
        <TabsContent value='engagement' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Engagement Patterns</CardTitle>
              <CardDescription>When and how students engage with content</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={engagementHeatmapData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='hour' />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey='value' fill='#8884d8'>
                    {engagementHeatmapData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`rgba(136, 132, 216, ${entry.value / 100})`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {metrics && (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Engagement Rate</span>
                    <span className='font-medium'>
                      {(metrics.secondary.engagementRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Completion Rate</span>
                    <span className='font-medium'>
                      {(metrics.secondary.completionRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Participation Rate</span>
                    <span className='font-medium'>
                      {(metrics.secondary.participationRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Resource Utilization</span>
                    <span className='font-medium'>
                      {(metrics.secondary.resourceUtilization * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>User Satisfaction</span>
                    <span className='font-medium'>
                      {metrics.secondary.userSatisfaction.toFixed(1)}/5.0
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity Indicators</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Study Frequency</span>
                    <span className='font-medium'>
                      {metrics.leading.studyFrequency.toFixed(1)} sessions/week
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Session Duration</span>
                    <span className='font-medium'>
                      {metrics.leading.sessionDuration.toFixed(0)} minutes
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Practice Intensity</span>
                    <span className='font-medium'>
                      {metrics.leading.practiceIntensity} problems/day
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Learning Streak</span>
                    <span className='font-medium'>{metrics.leading.learningStreak} days</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Content Interactions</span>
                    <span className='font-medium'>
                      {metrics.leading.contentInteraction}/session
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Predictions */}
        <TabsContent value='predictions' className='space-y-4'>
          {metrics && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Risk Assessment</CardTitle>
                  <CardDescription>Student risk and potential scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <div>
                      <div className='mb-2 flex items-center justify-between'>
                        <span className='text-sm font-medium'>Dropout Risk</span>
                        <span className={`font-bold ${getRiskColor(metrics.calculated.riskScore)}`}>
                          {getRiskLabel(metrics.calculated.riskScore)}
                        </span>
                      </div>
                      <Progress value={metrics.calculated.riskScore * 100} className='h-3' />
                      <p className='mt-1 text-xs text-muted-foreground'>
                        Risk Score: {(metrics.calculated.riskScore * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <div className='mb-2 flex items-center justify-between'>
                        <span className='text-sm font-medium'>Learning Potential</span>
                        <span className='font-bold text-green-500'>
                          {(metrics.calculated.potentialScore * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={metrics.calculated.potentialScore * 100} className='h-3' />
                      <p className='mt-1 text-xs text-muted-foreground'>
                        Based on current learning patterns
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Forecast</CardTitle>
                  <CardDescription>Predicted performance trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width='100%' height={300}>
                    <ComposedChart
                      data={[
                        ...metrics.calculated.performanceTrend.values.map((v, i) => ({
                          day: `Day ${i + 1}`,
                          actual: v,
                          type: 'historical',
                        })),
                        ...metrics.calculated.performanceTrend.forecast.map((v, i) => ({
                          day: `Day ${metrics.calculated.performanceTrend.values.length + i + 1}`,
                          forecast: v,
                          type: 'forecast',
                        })),
                      ]}
                    >
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='day' />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type='monotone'
                        dataKey='actual'
                        stroke='#8884d8'
                        strokeWidth={2}
                        name='Historical'
                      />
                      <Line
                        type='monotone'
                        dataKey='forecast'
                        stroke='#82ca9d'
                        strokeWidth={2}
                        strokeDasharray='5 5'
                        name='Forecast'
                      />
                      <ReferenceLine
                        x={`Day ${metrics.calculated.performanceTrend.values.length}`}
                        stroke='gray'
                        strokeDasharray='3 3'
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm'>Predicted Pass Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {(metrics.primary.examPassRate * 100).toFixed(1)}%
                    </div>
                    <p className='text-xs text-muted-foreground'>Based on current performance</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm'>Expected Completion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {Math.max(7, 30 - metrics.primary.timeToMastery)} days
                    </div>
                    <p className='text-xs text-muted-foreground'>At current pace</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm'>Long-term Retention</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {(metrics.lagging.longTermRetention * 100).toFixed(1)}%
                    </div>
                    <p className='text-xs text-muted-foreground'>After 90 days</p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Cohort Analysis */}
        <TabsContent value='cohorts' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Cohort Performance Comparison</CardTitle>
              <CardDescription>Compare different student cohorts</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='engagement' name='Engagement' unit='%' />
                  <YAxis dataKey='performance' name='Performance' unit='%' />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter
                    name='Cohort A (Traditional)'
                    data={Array.from({ length: 30 }, () => ({
                      engagement: 40 + Math.random() * 30,
                      performance: 50 + Math.random() * 30,
                    }))}
                    fill='#8884d8'
                  />
                  <Scatter
                    name='Cohort B (Adaptive)'
                    data={Array.from({ length: 30 }, () => ({
                      engagement: 60 + Math.random() * 30,
                      performance: 65 + Math.random() * 30,
                    }))}
                    fill='#82ca9d'
                  />
                  <Scatter
                    name='Cohort C (Gamified)'
                    data={Array.from({ length: 30 }, () => ({
                      engagement: 70 + Math.random() * 25,
                      performance: 60 + Math.random() * 35,
                    }))}
                    fill='#ffc658'
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Cohort A: Traditional</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm'>Students</span>
                  <span className='font-medium'>342</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Avg Pass Rate</span>
                  <span className='font-medium'>68%</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Completion</span>
                  <span className='font-medium'>72%</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Satisfaction</span>
                  <span className='font-medium'>3.8/5</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Cohort B: Adaptive</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm'>Students</span>
                  <span className='font-medium'>428</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Avg Pass Rate</span>
                  <span className='font-medium'>82%</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Completion</span>
                  <span className='font-medium'>85%</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Satisfaction</span>
                  <span className='font-medium'>4.5/5</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Cohort C: Gamified</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm'>Students</span>
                  <span className='font-medium'>285</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Avg Pass Rate</span>
                  <span className='font-medium'>75%</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Completion</span>
                  <span className='font-medium'>88%</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Satisfaction</span>
                  <span className='font-medium'>4.7/5</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default RealTimeAnalyticsDashboard
