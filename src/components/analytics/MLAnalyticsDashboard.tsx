import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Users,
  RefreshCw,
  Download,
  Info,
} from 'lucide-react'

// ML Analytics Dashboard Component
const MLAnalyticsDashboard = () => {
  const [_selectedModel, _setSelectedModel] = useState('exam_success')
  const [timeRange, setTimeRange] = useState('7d')
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Simulated data - would be fetched from ML API in production
  const modelPerformance = {
    exam_success: {
      accuracy: 0.89,
      precision: 0.87,
      recall: 0.91,
      f1: 0.89,
      auc: 0.94,
      trend: 'up',
      change: 2.3,
    },
    score_predictor: {
      rmse: 8.2,
      mae: 6.5,
      r2: 0.85,
      mape: 0.12,
      trend: 'stable',
      change: -0.5,
    },
    dropout_risk: {
      precision_at_20: 0.78,
      recall: 0.82,
      f1: 0.8,
      saved_students: 156,
      trend: 'up',
      change: 5.1,
    },
  }

  const predictionStats = {
    total_predictions: 15234,
    avg_latency: 23,
    cache_hit_rate: 0.67,
    daily_predictions: [
      { date: '2024-01-01', count: 2145, latency: 22 },
      { date: '2024-01-02', count: 2287, latency: 24 },
      { date: '2024-01-03', count: 2098, latency: 21 },
      { date: '2024-01-04', count: 2356, latency: 25 },
      { date: '2024-01-05', count: 2234, latency: 23 },
      { date: '2024-01-06', count: 2089, latency: 22 },
      { date: '2024-01-07', count: 2025, latency: 24 },
    ],
  }

  const examSuccessPredictions = {
    pass_probability_distribution: [
      { range: '0-20%', count: 145, actual_pass_rate: 0.08 },
      { range: '20-40%', count: 267, actual_pass_rate: 0.28 },
      { range: '40-60%', count: 423, actual_pass_rate: 0.52 },
      { range: '60-80%', count: 687, actual_pass_rate: 0.74 },
      { range: '80-100%', count: 892, actual_pass_rate: 0.91 },
    ],
    feature_importance: [
      { feature: 'Mock Exam Score', importance: 0.28 },
      { feature: 'Study Hours', importance: 0.22 },
      { feature: 'Progress Rate', importance: 0.18 },
      { feature: 'Quiz Accuracy', importance: 0.15 },
      { feature: 'Knowledge Area Mastery', importance: 0.12 },
      { feature: 'Study Consistency', importance: 0.05 },
    ],
  }

  const scorePredictions = {
    actual_vs_predicted: [
      { actual: 65, predicted: 63, student_id: 'S001' },
      { actual: 78, predicted: 80, student_id: 'S002' },
      { actual: 82, predicted: 79, student_id: 'S003' },
      { actual: 71, predicted: 73, student_id: 'S004' },
      { actual: 88, predicted: 86, student_id: 'S005' },
      { actual: 59, predicted: 62, student_id: 'S006' },
      { actual: 94, predicted: 92, student_id: 'S007' },
    ],
    error_distribution: [
      { error_range: '-10 to -5', count: 23 },
      { error_range: '-5 to -2', count: 87 },
      { error_range: '-2 to 0', count: 156 },
      { error_range: '0 to 2', count: 189 },
      { error_range: '2 to 5', count: 112 },
      { error_range: '5 to 10', count: 45 },
    ],
  }

  const dropoutRiskAnalysis = {
    risk_distribution: [
      { level: 'Low', count: 1234, percentage: 51 },
      { level: 'Medium', count: 678, percentage: 28 },
      { level: 'High', count: 367, percentage: 15 },
      { level: 'Critical', count: 145, percentage: 6 },
    ],
    intervention_effectiveness: [
      { intervention: 'Personal Mentoring', success_rate: 0.78, students: 45 },
      { intervention: 'Study Group', success_rate: 0.65, students: 89 },
      { intervention: 'Additional Resources', success_rate: 0.52, students: 123 },
      { intervention: 'Schedule Adjustment', success_rate: 0.71, students: 67 },
    ],
  }

  const learningPathOptimization = {
    recommended_paths: [
      { path: 'Traditional Sequential', success_rate: 0.72, avg_time: 120 },
      { path: 'Adaptive Personalized', success_rate: 0.85, avg_time: 95 },
      { path: 'Fast Track', success_rate: 0.68, avg_time: 60 },
      { path: 'Comprehensive Deep', success_rate: 0.89, avg_time: 150 },
    ],
    knowledge_area_recommendations: [
      { area: 'Integration', priority: 'High', recommended_hours: 15 },
      { area: 'Scope', priority: 'Medium', recommended_hours: 10 },
      { area: 'Schedule', priority: 'High', recommended_hours: 12 },
      { area: 'Cost', priority: 'Low', recommended_hours: 8 },
      { area: 'Quality', priority: 'Medium', recommended_hours: 10 },
      { area: 'Risk', priority: 'High', recommended_hours: 14 },
    ],
  }

  const cohortAnalysis = {
    cohort_performance: [
      { cohort: 'Jan 2024', size: 234, pass_rate: 0.76, avg_score: 78 },
      { cohort: 'Dec 2023', size: 189, pass_rate: 0.72, avg_score: 75 },
      { cohort: 'Nov 2023', size: 267, pass_rate: 0.74, avg_score: 77 },
      { cohort: 'Oct 2023', size: 198, pass_rate: 0.71, avg_score: 74 },
    ],
    segment_analysis: [
      { segment: 'Working Professionals', count: 456, pass_rate: 0.78 },
      { segment: 'Recent Graduates', count: 234, pass_rate: 0.65 },
      { segment: 'Career Changers', count: 178, pass_rate: 0.72 },
      { segment: 'Senior Managers', count: 89, pass_rate: 0.85 },
    ],
  }

  const driftDetection = {
    feature_drift: [
      { feature: 'Study Hours', baseline: 25.3, current: 24.8, drift_score: 0.02 },
      { feature: 'Quiz Attempts', baseline: 45.2, current: 48.7, drift_score: 0.08 },
      { feature: 'Login Frequency', baseline: 4.2, current: 3.8, drift_score: 0.12 },
      { feature: 'Content Views', baseline: 156, current: 162, drift_score: 0.04 },
    ],
    performance_drift: [
      { date: '2024-01-01', expected: 0.85, actual: 0.84 },
      { date: '2024-01-02', expected: 0.85, actual: 0.86 },
      { date: '2024-01-03', expected: 0.85, actual: 0.83 },
      { date: '2024-01-04', expected: 0.85, actual: 0.87 },
      { date: '2024-01-05', expected: 0.85, actual: 0.85 },
      { date: '2024-01-06', expected: 0.85, actual: 0.82 },
      { date: '2024-01-07', expected: 0.85, actual: 0.84 },
    ],
  }

  const businessMetrics = {
    roi: {
      value: 3.2,
      trend: 'up',
      change: 0.4,
    },
    cost_per_student: {
      value: 45.23,
      trend: 'down',
      change: -2.15,
    },
    ltv: {
      value: 1250,
      trend: 'up',
      change: 125,
    },
    conversion_rate: {
      value: 0.34,
      trend: 'up',
      change: 0.03,
    },
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>ML Analytics Dashboard</h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Real-time insights and predictions for learning management
          </p>
        </div>
        <div className='flex gap-2'>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='1d'>Last 24h</SelectItem>
              <SelectItem value='7d'>Last 7 days</SelectItem>
              <SelectItem value='30d'>Last 30 days</SelectItem>
              <SelectItem value='90d'>Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant='outline' size='icon' onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant='outline' size='icon'>
            <Download className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Total Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {predictionStats.total_predictions.toLocaleString()}
            </div>
            <div className='flex items-center text-sm text-green-600'>
              <TrendingUp className='mr-1 h-4 w-4' />
              +12.3% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Model Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {(modelPerformance.exam_success.accuracy * 100).toFixed(1)}%
            </div>
            <div className='flex items-center text-sm text-green-600'>
              <TrendingUp className='mr-1 h-4 w-4' />+{modelPerformance.exam_success.change}%
              improvement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Avg Latency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{predictionStats.avg_latency}ms</div>
            <div className='flex items-center text-sm text-green-600'>
              <CheckCircle className='mr-1 h-4 w-4' />
              Within SLA target
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Students at Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {dropoutRiskAnalysis.risk_distribution
                .filter((r) => r.level === 'High' || r.level === 'Critical')
                .reduce((sum, r) => sum + r.count, 0)}
            </div>
            <div className='flex items-center text-sm text-orange-600'>
              <AlertTriangle className='mr-1 h-4 w-4' />
              Intervention needed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-6'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='predictions'>Predictions</TabsTrigger>
          <TabsTrigger value='performance'>Performance</TabsTrigger>
          <TabsTrigger value='insights'>Insights</TabsTrigger>
          <TabsTrigger value='monitoring'>Monitoring</TabsTrigger>
          <TabsTrigger value='business'>Business</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          {/* Model Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Model Performance Overview</CardTitle>
              <CardDescription>Key metrics across all deployed models</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {/* Exam Success Model */}
                <div className='rounded-lg border p-4'>
                  <div className='mb-2 flex items-center justify-between'>
                    <h3 className='font-semibold'>Exam Success Classifier</h3>
                    <Badge variant='outline' className='text-green-600'>
                      Production
                    </Badge>
                  </div>
                  <div className='grid grid-cols-5 gap-4'>
                    <div>
                      <p className='text-sm text-gray-600'>Accuracy</p>
                      <p className='text-lg font-semibold'>
                        {(modelPerformance.exam_success.accuracy * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-600'>Precision</p>
                      <p className='text-lg font-semibold'>
                        {(modelPerformance.exam_success.precision * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-600'>Recall</p>
                      <p className='text-lg font-semibold'>
                        {(modelPerformance.exam_success.recall * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-600'>F1 Score</p>
                      <p className='text-lg font-semibold'>
                        {(modelPerformance.exam_success.f1 * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-600'>AUC</p>
                      <p className='text-lg font-semibold'>
                        {(modelPerformance.exam_success.auc * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Progress value={modelPerformance.exam_success.accuracy * 100} className='mt-2' />
                </div>

                {/* Score Predictor Model */}
                <div className='rounded-lg border p-4'>
                  <div className='mb-2 flex items-center justify-between'>
                    <h3 className='font-semibold'>Score Predictor</h3>
                    <Badge variant='outline' className='text-green-600'>
                      Production
                    </Badge>
                  </div>
                  <div className='grid grid-cols-4 gap-4'>
                    <div>
                      <p className='text-sm text-gray-600'>RMSE</p>
                      <p className='text-lg font-semibold'>
                        {modelPerformance.score_predictor.rmse.toFixed(1)}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-600'>MAE</p>
                      <p className='text-lg font-semibold'>
                        {modelPerformance.score_predictor.mae.toFixed(1)}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-600'>R²</p>
                      <p className='text-lg font-semibold'>
                        {(modelPerformance.score_predictor.r2 * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-600'>MAPE</p>
                      <p className='text-lg font-semibold'>
                        {(modelPerformance.score_predictor.mape * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Progress value={modelPerformance.score_predictor.r2 * 100} className='mt-2' />
                </div>

                {/* Dropout Risk Model */}
                <div className='rounded-lg border p-4'>
                  <div className='mb-2 flex items-center justify-between'>
                    <h3 className='font-semibold'>Dropout Risk Classifier</h3>
                    <Badge variant='outline' className='text-green-600'>
                      Production
                    </Badge>
                  </div>
                  <div className='grid grid-cols-4 gap-4'>
                    <div>
                      <p className='text-sm text-gray-600'>Precision@20</p>
                      <p className='text-lg font-semibold'>
                        {(modelPerformance.dropout_risk.precision_at_20 * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-600'>Recall</p>
                      <p className='text-lg font-semibold'>
                        {(modelPerformance.dropout_risk.recall * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-600'>F1 Score</p>
                      <p className='text-lg font-semibold'>
                        {(modelPerformance.dropout_risk.f1 * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-600'>Students Saved</p>
                      <p className='text-lg font-semibold'>
                        {modelPerformance.dropout_risk.saved_students}
                      </p>
                    </div>
                  </div>
                  <Progress value={modelPerformance.dropout_risk.f1 * 100} className='mt-2' />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prediction Volume Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Prediction Volume</CardTitle>
              <CardDescription>Daily prediction counts and average latency</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={predictionStats.daily_predictions}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' />
                  <YAxis yAxisId='left' />
                  <YAxis yAxisId='right' orientation='right' />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId='left'
                    type='monotone'
                    dataKey='count'
                    stroke='#8884d8'
                    name='Predictions'
                  />
                  <Line
                    yAxisId='right'
                    type='monotone'
                    dataKey='latency'
                    stroke='#82ca9d'
                    name='Latency (ms)'
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='predictions' className='space-y-4'>
          {/* Exam Success Predictions */}
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Pass Probability Distribution</CardTitle>
                <CardDescription>
                  Predicted vs actual pass rates by probability range
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={examSuccessPredictions.pass_probability_distribution}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='range' />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey='count' fill='#8884d8' name='Student Count' />
                    <Bar
                      dataKey='actual_pass_rate'
                      fill='#82ca9d'
                      name='Actual Pass Rate'
                      yAxisId='right'
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Importance</CardTitle>
                <CardDescription>Top factors influencing exam success predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={examSuccessPredictions.feature_importance} layout='horizontal'>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis type='number' />
                    <YAxis dataKey='feature' type='category' width={120} />
                    <Tooltip />
                    <Bar dataKey='importance' fill='#8884d8'>
                      {examSuccessPredictions.feature_importance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Score Predictions */}
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Actual vs Predicted Scores</CardTitle>
                <CardDescription>Model prediction accuracy visualization</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='actual' name='Actual Score' />
                    <YAxis dataKey='predicted' name='Predicted Score' />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter
                      name='Students'
                      data={scorePredictions.actual_vs_predicted}
                      fill='#8884d8'
                    />
                    <ReferenceLine x={50} y={50} stroke='red' strokeDasharray='5 5' />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prediction Error Distribution</CardTitle>
                <CardDescription>Distribution of prediction errors in score points</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={scorePredictions.error_distribution}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='error_range' />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey='count' fill='#82ca9d' />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Dropout Risk Analysis */}
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>Current student risk levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <PieChart>
                    <Pie
                      data={dropoutRiskAnalysis.risk_distribution}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ level, percentage }) => `${level}: ${percentage}%`}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='count'
                    >
                      {dropoutRiskAnalysis.risk_distribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.level === 'Critical'
                              ? '#ef4444'
                              : entry.level === 'High'
                                ? '#f97316'
                                : entry.level === 'Medium'
                                  ? '#eab308'
                                  : '#22c55e'
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Intervention Effectiveness</CardTitle>
                <CardDescription>
                  Success rates of different intervention strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {dropoutRiskAnalysis.intervention_effectiveness.map((intervention, index) => (
                    <div key={index}>
                      <div className='mb-1 flex justify-between'>
                        <span className='text-sm font-medium'>{intervention.intervention}</span>
                        <span className='text-sm text-gray-600'>
                          {(intervention.success_rate * 100).toFixed(0)}% success (
                          {intervention.students} students)
                        </span>
                      </div>
                      <Progress value={intervention.success_rate * 100} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='performance' className='space-y-4'>
          {/* Learning Path Optimization */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Path Analysis</CardTitle>
              <CardDescription>Comparison of different learning path strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={learningPathOptimization.recommended_paths}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='path' />
                  <YAxis yAxisId='left' />
                  <YAxis yAxisId='right' orientation='right' />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId='left' dataKey='success_rate' fill='#8884d8' name='Success Rate' />
                  <Bar yAxisId='right' dataKey='avg_time' fill='#82ca9d' name='Avg Time (hours)' />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Knowledge Area Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Area Focus</CardTitle>
              <CardDescription>Recommended study hours by knowledge area</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <RadarChart data={learningPathOptimization.knowledge_area_recommendations}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey='area' />
                  <PolarRadiusAxis />
                  <Radar
                    name='Recommended Hours'
                    dataKey='recommended_hours'
                    stroke='#8884d8'
                    fill='#8884d8'
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cohort Analysis */}
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Cohort Performance</CardTitle>
                <CardDescription>Performance metrics by student cohort</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <LineChart data={cohortAnalysis.cohort_performance}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='cohort' />
                    <YAxis yAxisId='left' />
                    <YAxis yAxisId='right' orientation='right' />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId='left'
                      type='monotone'
                      dataKey='pass_rate'
                      stroke='#8884d8'
                      name='Pass Rate'
                    />
                    <Line
                      yAxisId='right'
                      type='monotone'
                      dataKey='avg_score'
                      stroke='#82ca9d'
                      name='Avg Score'
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Segment Analysis</CardTitle>
                <CardDescription>Performance by student segment</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={cohortAnalysis.segment_analysis}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='segment' />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey='count' fill='#8884d8' name='Students' />
                    <Bar dataKey='pass_rate' fill='#82ca9d' name='Pass Rate' />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='insights' className='space-y-4'>
          {/* Key Insights */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>🎯 High Impact Insights</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='rounded-lg bg-green-50 p-3 dark:bg-green-900/20'>
                  <div className='flex items-start gap-2'>
                    <CheckCircle className='mt-0.5 h-5 w-5 text-green-600' />
                    <div>
                      <p className='font-medium'>Strong Predictor Identified</p>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        Mock exam scores show 0.85 correlation with final exam success
                      </p>
                    </div>
                  </div>
                </div>
                <div className='rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20'>
                  <div className='flex items-start gap-2'>
                    <AlertTriangle className='mt-0.5 h-5 w-5 text-yellow-600' />
                    <div>
                      <p className='font-medium'>Early Warning Signal</p>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        Students with &lt;3 logins per week have 65% higher dropout risk
                      </p>
                    </div>
                  </div>
                </div>
                <div className='rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20'>
                  <div className='flex items-start gap-2'>
                    <Info className='mt-0.5 h-5 w-5 text-blue-600' />
                    <div>
                      <p className='font-medium'>Optimal Study Pattern</p>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        Students studying 2-3 hours daily show 23% better retention
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📊 Actionable Recommendations</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='rounded-lg border p-3'>
                  <div className='mb-2 flex items-start justify-between'>
                    <p className='font-medium'>Increase Mock Exams</p>
                    <Badge variant='outline'>High Priority</Badge>
                  </div>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Add 2 more mock exams to improve prediction accuracy by ~8%
                  </p>
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='mb-2 flex items-start justify-between'>
                    <p className='font-medium'>Target At-Risk Students</p>
                    <Badge variant='outline'>Medium Priority</Badge>
                  </div>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    156 students need immediate intervention based on risk scores
                  </p>
                </div>
                <div className='rounded-lg border p-3'>
                  <div className='mb-2 flex items-start justify-between'>
                    <p className='font-medium'>Optimize Content Sequence</p>
                    <Badge variant='outline'>Low Priority</Badge>
                  </div>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Reorder Risk Management before Quality for 12% better comprehension
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Predictive Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Predictive Insights</CardTitle>
              <CardDescription>Forward-looking predictions and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div className='rounded-lg border p-4'>
                  <div className='mb-2 flex items-center gap-2'>
                    <Target className='h-5 w-5 text-blue-600' />
                    <h4 className='font-medium'>Next Month Pass Rate</h4>
                  </div>
                  <p className='text-2xl font-bold'>78.5%</p>
                  <p className='text-sm text-gray-600'>±2.3% confidence interval</p>
                </div>
                <div className='rounded-lg border p-4'>
                  <div className='mb-2 flex items-center gap-2'>
                    <Users className='h-5 w-5 text-green-600' />
                    <h4 className='font-medium'>Expected Completions</h4>
                  </div>
                  <p className='text-2xl font-bold'>234</p>
                  <p className='text-sm text-gray-600'>By end of month</p>
                </div>
                <div className='rounded-lg border p-4'>
                  <div className='mb-2 flex items-center gap-2'>
                    <TrendingUp className='h-5 w-5 text-purple-600' />
                    <h4 className='font-medium'>Score Improvement</h4>
                  </div>
                  <p className='text-2xl font-bold'>+5.2</p>
                  <p className='text-sm text-gray-600'>Average points with intervention</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='monitoring' className='space-y-4'>
          {/* Drift Detection */}
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Feature Drift Monitoring</CardTitle>
                <CardDescription>Detecting changes in input feature distributions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {driftDetection.feature_drift.map((feature, index) => (
                    <div key={index} className='rounded-lg border p-3'>
                      <div className='mb-2 flex items-center justify-between'>
                        <span className='font-medium'>{feature.feature}</span>
                        <Badge variant={feature.drift_score > 0.1 ? 'destructive' : 'outline'}>
                          Drift: {feature.drift_score.toFixed(3)}
                        </Badge>
                      </div>
                      <div className='flex justify-between text-sm text-gray-600'>
                        <span>Baseline: {feature.baseline.toFixed(1)}</span>
                        <span>Current: {feature.current.toFixed(1)}</span>
                      </div>
                      <Progress value={feature.drift_score * 100} className='mt-2' />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Drift</CardTitle>
                <CardDescription>Model performance over time vs expected</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <LineChart data={driftDetection.performance_drift}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type='monotone'
                      dataKey='expected'
                      stroke='#8884d8'
                      strokeDasharray='5 5'
                      name='Expected'
                    />
                    <Line type='monotone' dataKey='actual' stroke='#82ca9d' name='Actual' />
                    <ReferenceLine y={0.85} stroke='red' strokeDasharray='3 3' />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Model Health Status */}
          <Card>
            <CardHeader>
              <CardTitle>Model Health Status</CardTitle>
              <CardDescription>Real-time monitoring of all deployed models</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='rounded-lg border p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='h-3 w-3 animate-pulse rounded-full bg-green-500' />
                      <div>
                        <p className='font-medium'>Exam Success Classifier</p>
                        <p className='text-sm text-gray-600'>Version 2.3.1 | Deployed 3 days ago</p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-medium'>Health Score</p>
                      <p className='text-lg font-bold text-green-600'>98%</p>
                    </div>
                  </div>
                </div>
                <div className='rounded-lg border p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='h-3 w-3 animate-pulse rounded-full bg-green-500' />
                      <div>
                        <p className='font-medium'>Score Predictor</p>
                        <p className='text-sm text-gray-600'>Version 1.8.4 | Deployed 7 days ago</p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-medium'>Health Score</p>
                      <p className='text-lg font-bold text-green-600'>95%</p>
                    </div>
                  </div>
                </div>
                <div className='rounded-lg border p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='h-3 w-3 rounded-full bg-yellow-500' />
                      <div>
                        <p className='font-medium'>Dropout Risk Classifier</p>
                        <p className='text-sm text-gray-600'>
                          Version 3.0.2 | Deployed 14 days ago
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-medium'>Health Score</p>
                      <p className='text-lg font-bold text-yellow-600'>82%</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='business' className='space-y-4'>
          {/* Business Metrics */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{businessMetrics.roi.value}x</div>
                <div className='flex items-center text-sm text-green-600'>
                  <TrendingUp className='mr-1 h-4 w-4' />+{businessMetrics.roi.change}x from last
                  quarter
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>Cost per Student</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>${businessMetrics.cost_per_student.value}</div>
                <div className='flex items-center text-sm text-green-600'>
                  <TrendingDown className='mr-1 h-4 w-4' />
                  {businessMetrics.cost_per_student.change} from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>Customer LTV</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>${businessMetrics.ltv.value}</div>
                <div className='flex items-center text-sm text-green-600'>
                  <TrendingUp className='mr-1 h-4 w-4' />
                  +${businessMetrics.ltv.change} increase
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {(businessMetrics.conversion_rate.value * 100).toFixed(1)}%
                </div>
                <div className='flex items-center text-sm text-green-600'>
                  <TrendingUp className='mr-1 h-4 w-4' />+
                  {(businessMetrics.conversion_rate.change * 100).toFixed(1)}% improvement
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Value Generation Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>ML Value Generation</CardTitle>
              <CardDescription>Business impact of ML implementations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='rounded-lg bg-green-50 p-4 dark:bg-green-900/20'>
                  <div className='mb-2 flex items-center justify-between'>
                    <h4 className='font-medium'>Improved Student Retention</h4>
                    <span className='text-lg font-bold text-green-600'>+$125,000/year</span>
                  </div>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    156 students retained through early intervention
                  </p>
                </div>
                <div className='rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20'>
                  <div className='mb-2 flex items-center justify-between'>
                    <h4 className='font-medium'>Reduced Support Costs</h4>
                    <span className='text-lg font-bold text-blue-600'>-$45,000/year</span>
                  </div>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    30% reduction in support tickets through predictive assistance
                  </p>
                </div>
                <div className='rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20'>
                  <div className='mb-2 flex items-center justify-between'>
                    <h4 className='font-medium'>Increased Pass Rates</h4>
                    <span className='text-lg font-bold text-purple-600'>+$200,000/year</span>
                  </div>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    12% improvement in first-attempt pass rates
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MLAnalyticsDashboard
