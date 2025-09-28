/**
 * Question Analytics Dashboard
 * Comprehensive analytics and performance monitoring for AI-generated questions
 */

import React, { useState, useEffect, useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Funnel,
  FunnelChart,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Progress } from '../ui/progress'
import { Alert, AlertDescription } from '../ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Activity,
  Target,
  Users,
  Clock,
  Hash,
  Zap,
  FileText,
  Award,
  AlertCircle,
  RefreshCw,
  Download,
  Filter,
  ChevronUp,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  Copy,
} from 'lucide-react'
import { api } from '../../lib/api/client'
import { useToast } from '../../hooks/use-toast'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'

// Types
interface QuestionMetrics {
  id: string
  questionText: string
  domain: string
  knowledgeArea: string
  difficulty: string
  type: string
  bloomsLevel: string

  // Performance metrics
  timesAnswered: number
  correctRate: number
  averageTimeSpent: number
  discriminationIndex: number
  difficultyIndex: number

  // IRT parameters
  irtA: number // Discrimination
  irtB: number // Difficulty
  irtC: number // Guessing

  // Quality scores
  qualityScore: number
  clarityScore: number
  relevanceScore: number
  fairnessScore: number

  // Trends
  performanceTrend: 'improving' | 'stable' | 'declining'
  lastUpdated: Date
}

interface DomainStatistics {
  domain: string
  totalQuestions: number
  averageQuality: number
  averageDifficulty: number
  averageDiscrimination: number
  correctRate: number
}

interface TimeSeriesData {
  date: string
  questionsGenerated: number
  questionsAnswered: number
  averageQuality: number
  averageCorrectRate: number
}

interface StudentPerformanceData {
  abilityLevel: number
  count: number
  averageScore: number
}

const QuestionAnalyticsDashboard: React.FC = () => {
  const { toast } = useToast()

  // State
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')
  const [selectedDomain, setSelectedDomain] = useState('all')
  const [selectedMetric, setSelectedMetric] = useState('quality')
  const [questions, setQuestions] = useState<QuestionMetrics[]>([])
  const [domainStats, setDomainStats] = useState<DomainStatistics[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [studentPerformance, setStudentPerformance] = useState<StudentPerformanceData[]>([])
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionMetrics | null>(null)

  // Fetch data
  useEffect(() => {
    fetchAnalyticsData()
  }, [selectedTimeRange, selectedDomain])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      // Fetch questions with metrics
      const questionsResponse = await api.questions.getAnalytics.query({
        timeRange: selectedTimeRange,
        domain: selectedDomain !== 'all' ? selectedDomain : undefined,
      })

      setQuestions(questionsResponse.questions)
      setDomainStats(questionsResponse.domainStatistics)
      setTimeSeriesData(questionsResponse.timeSeries)
      setStudentPerformance(questionsResponse.studentPerformance)
    } catch (error) {
      toast({
        title: 'Error loading analytics',
        description: 'Failed to fetch analytics data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    if (questions.length === 0) {
      return null
    }

    const totalQuestions = questions.length
    const averageQuality = questions.reduce((sum, q) => sum + q.qualityScore, 0) / totalQuestions
    const averageCorrectRate = questions.reduce((sum, q) => sum + q.correctRate, 0) / totalQuestions
    const averageDiscrimination =
      questions.reduce((sum, q) => sum + q.discriminationIndex, 0) / totalQuestions

    const highQualityCount = questions.filter((q) => q.qualityScore >= 0.8).length
    const lowPerformingCount = questions.filter(
      (q) => q.correctRate < 0.3 || q.correctRate > 0.9
    ).length
    const needsReviewCount = questions.filter((q) => q.performanceTrend === 'declining').length

    return {
      totalQuestions,
      averageQuality,
      averageCorrectRate,
      averageDiscrimination,
      highQualityCount,
      lowPerformingCount,
      needsReviewCount,
      highQualityPercentage: (highQualityCount / totalQuestions) * 100,
      optimalDifficultyPercentage: ((totalQuestions - lowPerformingCount) / totalQuestions) * 100,
    }
  }, [questions])

  // IRT Characteristic Curve data
  const irtCurveData = useMemo(() => {
    if (!selectedQuestion) {
      return []
    }

    const { irtA, irtB, irtC } = selectedQuestion
    const data = []

    for (let theta = -3; theta <= 3; theta += 0.1) {
      const probability = irtC + (1 - irtC) / (1 + Math.exp(-irtA * (theta - irtB)))
      data.push({
        ability: theta,
        probability: probability,
      })
    }

    return data
  }, [selectedQuestion])

  // Question effectiveness heatmap data
  const effectivenessHeatmap = useMemo(() => {
    const matrix = []
    const domains = ['people', 'process', 'business_environment']
    const difficulties = ['easy', 'medium', 'hard']

    for (const domain of domains) {
      for (const difficulty of difficulties) {
        const relevantQuestions = questions.filter(
          (q) => q.domain === domain && q.difficulty === difficulty
        )

        if (relevantQuestions.length > 0) {
          const avgDiscrimination =
            relevantQuestions.reduce((sum, q) => sum + q.discriminationIndex, 0) /
            relevantQuestions.length

          matrix.push({
            domain,
            difficulty,
            value: avgDiscrimination,
            count: relevantQuestions.length,
          })
        }
      }
    }

    return matrix
  }, [questions])

  // Render loading state
  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <RefreshCw className='mx-auto mb-4 h-8 w-8 animate-spin' />
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-3xl font-bold'>
            <Brain className='h-8 w-8' />
            Question Analytics Dashboard
          </h1>
          <p className='mt-2 text-muted-foreground'>
            Monitor and optimize AI-generated question performance
          </p>
        </div>

        <div className='flex gap-2'>
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='24h'>24 Hours</SelectItem>
              <SelectItem value='7d'>7 Days</SelectItem>
              <SelectItem value='30d'>30 Days</SelectItem>
              <SelectItem value='90d'>90 Days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedDomain} onValueChange={setSelectedDomain}>
            <SelectTrigger className='w-40'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Domains</SelectItem>
              <SelectItem value='people'>People</SelectItem>
              <SelectItem value='process'>Process</SelectItem>
              <SelectItem value='business_environment'>Business Environment</SelectItem>
            </SelectContent>
          </Select>

          <Button variant='outline' onClick={fetchAnalyticsData}>
            <RefreshCw className='mr-2 h-4 w-4' />
            Refresh
          </Button>

          <Button variant='outline'>
            <Download className='mr-2 h-4 w-4' />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summaryMetrics && (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-sm font-medium'>
                <Hash className='h-4 w-4' />
                Total Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{summaryMetrics.totalQuestions}</div>
              <p className='mt-1 text-xs text-muted-foreground'>
                {summaryMetrics.highQualityCount} high quality
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-sm font-medium'>
                <Award className='h-4 w-4' />
                Average Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {(summaryMetrics.averageQuality * 100).toFixed(1)}%
              </div>
              <Progress value={summaryMetrics.averageQuality * 100} className='mt-2' />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-sm font-medium'>
                <Target className='h-4 w-4' />
                Correct Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {(summaryMetrics.averageCorrectRate * 100).toFixed(1)}%
              </div>
              <p className='mt-1 text-xs text-muted-foreground'>Target: 60-80%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-sm font-medium'>
                <Activity className='h-4 w-4' />
                Discrimination
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {summaryMetrics.averageDiscrimination.toFixed(2)}
              </div>
              <p className='mt-1 text-xs text-muted-foreground'>Higher is better (&gt;0.3)</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alert for issues */}
      {summaryMetrics && summaryMetrics.needsReviewCount > 0 && (
        <Alert>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>
            {summaryMetrics.needsReviewCount} questions show declining performance and need review.
            {summaryMetrics.lowPerformingCount > 0 &&
              ` Additionally, ${summaryMetrics.lowPerformingCount} questions have extreme difficulty levels.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='performance'>Performance</TabsTrigger>
          <TabsTrigger value='quality'>Quality</TabsTrigger>
          <TabsTrigger value='irt'>IRT Analysis</TabsTrigger>
          <TabsTrigger value='questions'>Questions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            {/* Time Series Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Question Generation & Performance</CardTitle>
                <CardDescription>Trends over selected time period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' />
                    <YAxis yAxisId='left' />
                    <YAxis yAxisId='right' orientation='right' />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId='left'
                      type='monotone'
                      dataKey='questionsGenerated'
                      stroke='#8884d8'
                      name='Generated'
                    />
                    <Line
                      yAxisId='left'
                      type='monotone'
                      dataKey='questionsAnswered'
                      stroke='#82ca9d'
                      name='Answered'
                    />
                    <Line
                      yAxisId='right'
                      type='monotone'
                      dataKey='averageQuality'
                      stroke='#ffc658'
                      name='Avg Quality'
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Domain Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Domain Performance</CardTitle>
                <CardDescription>Comparison across PMP domains</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <RadarChart data={domainStats}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey='domain' />
                    <PolarRadiusAxis angle={90} domain={[0, 1]} />
                    <Radar
                      name='Quality'
                      dataKey='averageQuality'
                      stroke='#8884d8'
                      fill='#8884d8'
                      fillOpacity={0.6}
                    />
                    <Radar
                      name='Correct Rate'
                      dataKey='correctRate'
                      stroke='#82ca9d'
                      fill='#82ca9d'
                      fillOpacity={0.6}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Effectiveness Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>Question Effectiveness Matrix</CardTitle>
              <CardDescription>Discrimination index by domain and difficulty</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-4 gap-2'>
                <div></div>
                <div className='text-center font-medium'>Easy</div>
                <div className='text-center font-medium'>Medium</div>
                <div className='text-center font-medium'>Hard</div>

                {['people', 'process', 'business_environment'].map((domain) => (
                  <React.Fragment key={domain}>
                    <div className='font-medium capitalize'>{domain.replace('_', ' ')}</div>
                    {['easy', 'medium', 'hard'].map((difficulty) => {
                      const cell = effectivenessHeatmap.find(
                        (h) => h.domain === domain && h.difficulty === difficulty
                      )
                      const value = cell?.value || 0
                      const intensity = Math.min(100, Math.max(0, value * 100))

                      return (
                        <div
                          key={`${domain}-${difficulty}`}
                          className='flex h-20 flex-col items-center justify-center rounded font-medium text-white'
                          style={{
                            backgroundColor: `hsl(${120 * value}, 70%, 50%)`,
                            opacity: 0.8 + value * 0.2,
                          }}
                        >
                          <div>{value.toFixed(2)}</div>
                          <div className='text-xs'>({cell?.count || 0})</div>
                        </div>
                      )
                    })}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value='performance' className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            {/* Student Performance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Student Ability Distribution</CardTitle>
                <CardDescription>Performance across ability levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={studentPerformance}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='abilityLevel' />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey='count' fill='#8884d8' name='Students' />
                    <Bar dataKey='averageScore' fill='#82ca9d' name='Avg Score' />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Difficulty vs Success Rate */}
            <Card>
              <CardHeader>
                <CardTitle>Difficulty Calibration</CardTitle>
                <CardDescription>Actual vs expected difficulty</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='difficultyIndex' name='Difficulty' domain={[-3, 3]} />
                    <YAxis dataKey='correctRate' name='Correct Rate' domain={[0, 1]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter
                      name='Questions'
                      data={questions.map((q) => ({
                        difficultyIndex: q.irtB,
                        correctRate: q.correctRate,
                        discrimination: q.discriminationIndex,
                      }))}
                      fill='#8884d8'
                    >
                      {questions.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.discriminationIndex > 0.3 ? '#82ca9d' : '#ff6b6b'}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Time Spent Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Response Time Analysis</CardTitle>
              <CardDescription>Average time spent by question type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart
                  data={[
                    { type: 'Single', avgTime: 75, target: 90 },
                    { type: 'Multiple', avgTime: 120, target: 120 },
                    { type: 'Scenario', avgTime: 150, target: 150 },
                    { type: 'Calculation', avgTime: 180, target: 180 },
                  ]}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='type' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey='avgTime' fill='#8884d8' name='Actual' />
                  <Bar dataKey='target' fill='#82ca9d' name='Target' />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value='quality' className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            {/* Quality Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Score Distribution</CardTitle>
                <CardDescription>Distribution of question quality scores</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <AreaChart
                    data={[
                      {
                        range: '0-20%',
                        count: questions.filter((q) => q.qualityScore < 0.2).length,
                      },
                      {
                        range: '20-40%',
                        count: questions.filter(
                          (q) => q.qualityScore >= 0.2 && q.qualityScore < 0.4
                        ).length,
                      },
                      {
                        range: '40-60%',
                        count: questions.filter(
                          (q) => q.qualityScore >= 0.4 && q.qualityScore < 0.6
                        ).length,
                      },
                      {
                        range: '60-80%',
                        count: questions.filter(
                          (q) => q.qualityScore >= 0.6 && q.qualityScore < 0.8
                        ).length,
                      },
                      {
                        range: '80-100%',
                        count: questions.filter((q) => q.qualityScore >= 0.8).length,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='range' />
                    <YAxis />
                    <Tooltip />
                    <Area type='monotone' dataKey='count' stroke='#8884d8' fill='#8884d8' />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quality Dimensions */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Dimensions</CardTitle>
                <CardDescription>Average scores across quality metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <RadarChart
                    data={[
                      { dimension: 'Clarity', score: 0.75 },
                      { dimension: 'Relevance', score: 0.82 },
                      { dimension: 'Fairness', score: 0.88 },
                      { dimension: 'Validity', score: 0.79 },
                      { dimension: 'Reliability', score: 0.73 },
                      { dimension: 'Engagement', score: 0.68 },
                    ]}
                  >
                    <PolarGrid />
                    <PolarAngleAxis dataKey='dimension' />
                    <PolarRadiusAxis angle={90} domain={[0, 1]} />
                    <Radar
                      name='Score'
                      dataKey='score'
                      stroke='#8884d8'
                      fill='#8884d8'
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Bloom's Taxonomy Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Bloom's Taxonomy Coverage</CardTitle>
              <CardDescription>Distribution across cognitive levels</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <FunnelChart>
                  <Tooltip />
                  <Funnel
                    dataKey='value'
                    data={[
                      {
                        name: 'Remember',
                        value: questions.filter((q) => q.bloomsLevel === 'remember').length,
                        fill: '#8884d8',
                      },
                      {
                        name: 'Understand',
                        value: questions.filter((q) => q.bloomsLevel === 'understand').length,
                        fill: '#83a6ed',
                      },
                      {
                        name: 'Apply',
                        value: questions.filter((q) => q.bloomsLevel === 'apply').length,
                        fill: '#8dd1e1',
                      },
                      {
                        name: 'Analyze',
                        value: questions.filter((q) => q.bloomsLevel === 'analyze').length,
                        fill: '#82ca9d',
                      },
                      {
                        name: 'Evaluate',
                        value: questions.filter((q) => q.bloomsLevel === 'evaluate').length,
                        fill: '#a4de6c',
                      },
                      {
                        name: 'Create',
                        value: questions.filter((q) => q.bloomsLevel === 'create').length,
                        fill: '#ffc658',
                      },
                    ]}
                    isAnimationActive
                  />
                </FunnelChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IRT Analysis Tab */}
        <TabsContent value='irt' className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            {/* Item Characteristic Curve */}
            <Card>
              <CardHeader>
                <CardTitle>Item Characteristic Curve</CardTitle>
                <CardDescription>
                  {selectedQuestion ? `Question: ${selectedQuestion.id}` : 'Select a question'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedQuestion ? (
                  <ResponsiveContainer width='100%' height={300}>
                    <LineChart data={irtCurveData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis
                        dataKey='ability'
                        domain={[-3, 3]}
                        label={{
                          value: 'Student Ability (θ)',
                          position: 'insideBottom',
                          offset: -5,
                        }}
                      />
                      <YAxis
                        domain={[0, 1]}
                        label={{ value: 'P(Correct)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip />
                      <Line
                        type='monotone'
                        dataKey='probability'
                        stroke='#8884d8'
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className='flex h-[300px] items-center justify-center text-muted-foreground'>
                    Select a question from the table to view its characteristic curve
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Information Function */}
            <Card>
              <CardHeader>
                <CardTitle>Test Information Function</CardTitle>
                <CardDescription>Information provided across ability levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <AreaChart
                    data={Array.from({ length: 61 }, (_, i) => {
                      const theta = -3 + i * 0.1
                      let totalInfo = 0

                      questions.forEach((q) => {
                        const p = q.irtC + (1 - q.irtC) / (1 + Math.exp(-q.irtA * (theta - q.irtB)))
                        const info =
                          (Math.pow(q.irtA, 2) * Math.pow(p - q.irtC, 2)) /
                          (Math.pow(1 - q.irtC, 2) * p * (1 - p))
                        totalInfo += isNaN(info) ? 0 : info
                      })

                      return { ability: theta, information: totalInfo }
                    })}
                  >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='ability' domain={[-3, 3]} />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type='monotone'
                      dataKey='information'
                      stroke='#82ca9d'
                      fill='#82ca9d'
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* IRT Parameters Table */}
          <Card>
            <CardHeader>
              <CardTitle>IRT Parameters</CardTitle>
              <CardDescription>
                Discrimination (a), Difficulty (b), and Guessing (c) parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='max-h-[400px] overflow-y-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>a (Discrimination)</TableHead>
                      <TableHead>b (Difficulty)</TableHead>
                      <TableHead>c (Guessing)</TableHead>
                      <TableHead>Info Peak</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.slice(0, 20).map((question) => (
                      <TableRow
                        key={question.id}
                        className={selectedQuestion?.id === question.id ? 'bg-muted' : ''}
                      >
                        <TableCell className='max-w-xs truncate'>{question.questionText}</TableCell>
                        <TableCell>
                          <Badge variant='outline'>{question.domain}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1'>
                            {question.irtA.toFixed(2)}
                            {question.irtA < 0.5 && (
                              <AlertTriangle className='h-3 w-3 text-yellow-500' />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{question.irtB.toFixed(2)}</TableCell>
                        <TableCell>{question.irtC.toFixed(2)}</TableCell>
                        <TableCell>
                          {Math.max(
                            ...Array.from({ length: 61 }, (_, i) => {
                              const theta = -3 + i * 0.1
                              const p =
                                question.irtC +
                                (1 - question.irtC) /
                                  (1 + Math.exp(-question.irtA * (theta - question.irtB)))
                              return (
                                (Math.pow(question.irtA, 2) * Math.pow(p - question.irtC, 2)) /
                                (Math.pow(1 - question.irtC, 2) * p * (1 - p))
                              )
                            }).filter((v) => !isNaN(v))
                          ).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => setSelectedQuestion(question)}
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value='questions' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Question Bank</CardTitle>
              <CardDescription>Detailed view of all questions with metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='max-h-[600px] overflow-y-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Trend</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell className='max-w-md'>
                          <div className='space-y-1'>
                            <p className='truncate text-sm'>{question.questionText}</p>
                            <div className='flex gap-1'>
                              <Badge variant='secondary' className='text-xs'>
                                {question.knowledgeArea}
                              </Badge>
                              <Badge variant='secondary' className='text-xs'>
                                {question.bloomsLevel}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge>{question.domain}</Badge>
                        </TableCell>
                        <TableCell>{question.type}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              question.difficulty === 'easy'
                                ? 'secondary'
                                : question.difficulty === 'medium'
                                  ? 'default'
                                  : 'destructive'
                            }
                          >
                            {question.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Progress value={question.qualityScore * 100} className='w-16' />
                            <span className='text-sm'>
                              {(question.qualityScore * 100).toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-1 text-sm'>
                            <div>CR: {(question.correctRate * 100).toFixed(0)}%</div>
                            <div>DI: {question.discriminationIndex.toFixed(2)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {question.performanceTrend === 'improving' && (
                            <TrendingUp className='h-4 w-4 text-green-500' />
                          )}
                          {question.performanceTrend === 'stable' && (
                            <Activity className='h-4 w-4 text-blue-500' />
                          )}
                          {question.performanceTrend === 'declining' && (
                            <TrendingDown className='h-4 w-4 text-red-500' />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className='flex gap-1'>
                            <Button size='sm' variant='ghost'>
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button size='sm' variant='ghost'>
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button size='sm' variant='ghost'>
                              <Copy className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default QuestionAnalyticsDashboard
