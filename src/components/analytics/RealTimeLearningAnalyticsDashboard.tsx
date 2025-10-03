import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  BarChart3,
  Download,
  Eye,
  Refresh,
} from 'lucide-react'

interface LearningKPI {
  name: string
  value: number
  target: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  trendValue: number
  status: 'excellent' | 'good' | 'warning' | 'critical'
}

export const RealTimeLearningAnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLiveMode, setIsLiveMode] = useState(true)

  const learningKPIs: LearningKPI[] = [
    {
      name: 'Exam Pass Rate',
      value: 85.2,
      target: 85,
      unit: '%',
      trend: 'up',
      trendValue: 2.3,
      status: 'excellent',
    },
    {
      name: 'Knowledge Retention',
      value: 72.8,
      target: 75,
      unit: '%',
      trend: 'up',
      trendValue: 1.2,
      status: 'good',
    },
    {
      name: 'Learning Velocity',
      value: 2.4,
      target: 2.0,
      unit: 'pts/day',
      trend: 'up',
      trendValue: 0.3,
      status: 'excellent',
    },
    {
      name: 'Engagement Rate',
      value: 82.1,
      target: 80,
      unit: '%',
      trend: 'stable',
      trendValue: 0.1,
      status: 'excellent',
    },
  ]

  const learningTrendData = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        time: `${String(i).padStart(2, '0')}:00`,
        activeUsers: Math.floor(Math.random() * 100) + 50,
        engagementRate: Math.floor(Math.random() * 30) + 70,
      })),
    []
  )

  const knowledgeAreaData = useMemo(
    () => [
      { name: 'Integration', progress: 85, mastery: 78 },
      { name: 'Scope', progress: 92, mastery: 89 },
      { name: 'Schedule', progress: 76, mastery: 71 },
      { name: 'Cost', progress: 88, mastery: 82 },
      { name: 'Quality', progress: 91, mastery: 86 },
      { name: 'Resource', progress: 79, mastery: 74 },
      { name: 'Communications', progress: 94, mastery: 90 },
      { name: 'Risk', progress: 68, mastery: 62 },
      { name: 'Procurement', progress: 82, mastery: 77 },
      { name: 'Stakeholder', progress: 87, mastery: 81 },
    ],
    []
  )

  const getKPIStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600'
      case 'good':
        return 'text-blue-600'
      case 'warning':
        return 'text-yellow-600'
      case 'critical':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className='h-4 w-4 text-green-600' />
      case 'down':
        return <TrendingDown className='h-4 w-4 text-red-600' />
      case 'stable':
        return <Activity className='h-4 w-4 text-blue-600' />
      default:
        return null
    }
  }

  return (
    <div className='w-full space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-3xl font-bold'>
            <BarChart3 className='h-8 w-8 text-blue-600' />
            Learning Analytics Dashboard
          </h1>
          <p className='mt-1 text-gray-600'>Real-time insights into PMP learning effectiveness</p>
        </div>

        <div className='flex items-center gap-2'>
          <Badge variant={isLiveMode ? 'default' : 'secondary'} className='flex items-center gap-1'>
            <div
              className={`h-2 w-2 rounded-full ${isLiveMode ? 'animate-pulse bg-green-400' : 'bg-gray-400'}`}
            />
            {isLiveMode ? 'LIVE' : 'PAUSED'}
          </Badge>

          <Button variant='outline' size='sm' onClick={() => setIsLiveMode(!isLiveMode)}>
            {isLiveMode ? <Eye className='h-4 w-4' /> : <Refresh className='h-4 w-4' />}
          </Button>

          <Button variant='outline' size='sm'>
            <Download className='mr-2 h-4 w-4' />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {learningKPIs.map((kpi) => (
          <Card key={kpi.name} className='transition-shadow hover:shadow-lg'>
            <CardContent className='p-6'>
              <div>
                <p className='text-sm font-medium text-gray-600'>{kpi.name}</p>
                <div className='mt-1 flex items-center gap-2'>
                  <span className={`text-2xl font-bold ${getKPIStatusColor(kpi.status)}`}>
                    {kpi.value}
                    <span className='text-sm font-normal'>{kpi.unit}</span>
                  </span>
                  <div className='flex items-center gap-1'>
                    {getTrendIcon(kpi.trend)}
                    <span className='text-xs text-green-600'>+{kpi.trendValue}</span>
                  </div>
                </div>
                <Progress value={(kpi.value / kpi.target) * 100} className='mt-2' />
                <p className='mt-1 text-xs text-gray-500'>
                  Target: {kpi.target}
                  {kpi.unit}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='performance'>Performance</TabsTrigger>
          <TabsTrigger value='students'>Students</TabsTrigger>
          <TabsTrigger value='insights'>Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-5 w-5' />
                  Learning Activity (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <LineChart data={learningTrendData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='time' />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type='monotone'
                      dataKey='activeUsers'
                      stroke='#2563eb'
                      strokeWidth={2}
                      name='Active Users'
                    />
                    <Line
                      type='monotone'
                      dataKey='engagementRate'
                      stroke='#16a34a'
                      strokeWidth={2}
                      name='Engagement Rate'
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Knowledge Area Mastery</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <RadarChart data={knowledgeAreaData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey='name' tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={0} domain={[0, 100]} />
                    <Radar
                      name='Progress'
                      dataKey='progress'
                      stroke='#2563eb'
                      fill='#2563eb'
                      fillOpacity={0.6}
                    />
                    <Radar
                      name='Mastery'
                      dataKey='mastery'
                      stroke='#16a34a'
                      fill='#16a34a'
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value='performance' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Area Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {knowledgeAreaData.map((area) => (
                  <div
                    key={area.name}
                    className='flex items-center justify-between rounded border p-3'
                  >
                    <div className='flex-1'>
                      <div className='mb-2 flex items-center justify-between'>
                        <span className='font-medium'>{area.name}</span>
                        <Badge
                          variant={
                            area.mastery >= 80
                              ? 'default'
                              : area.mastery >= 70
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {area.mastery}% Mastery
                        </Badge>
                      </div>
                      <Progress value={area.progress} className='w-full' />
                      <span className='text-xs text-gray-500'>Progress: {area.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value='students' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Users className='h-5 w-5' />
                Student Performance Cohorts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                <div className='space-y-4'>
                  <h3 className='font-semibold text-green-600'>High Performers (18%)</h3>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-sm'>Avg Score:</span>
                      <Badge>94%</Badge>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm'>Study Time:</span>
                      <Badge variant='secondary'>3.2h/day</Badge>
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <h3 className='font-semibold text-blue-600'>Average Performers (67%)</h3>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-sm'>Avg Score:</span>
                      <Badge variant='secondary'>76%</Badge>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm'>Study Time:</span>
                      <Badge variant='secondary'>2.1h/day</Badge>
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <h3 className='font-semibold text-red-600'>At-Risk Students (15%)</h3>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-sm'>Avg Score:</span>
                      <Badge variant='destructive'>58%</Badge>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm'>Study Time:</span>
                      <Badge variant='destructive'>1.2h/day</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value='insights' className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Learning Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='rounded-lg bg-blue-50 p-4'>
                    <h3 className='font-semibold text-blue-800'>Peak Learning Time Identified</h3>
                    <p className='mt-1 text-sm text-blue-700'>
                      Students show 34% better performance when studying 9-11 AM
                    </p>
                    <Badge className='mt-2'>High Impact</Badge>
                  </div>

                  <div className='rounded-lg bg-green-50 p-4'>
                    <h3 className='font-semibold text-green-800'>ITTO Visualization Success</h3>
                    <p className='mt-1 text-sm text-green-700'>
                      Interactive diagrams increase retention by 28%
                    </p>
                    <Badge variant='secondary' className='mt-2'>
                      Medium Impact
                    </Badge>
                  </div>

                  <div className='rounded-lg bg-orange-50 p-4'>
                    <h3 className='font-semibold text-orange-800'>Risk Management Gap</h3>
                    <p className='mt-1 text-sm text-orange-700'>
                      23% of students struggle with Risk Management processes
                    </p>
                    <Badge variant='destructive' className='mt-2'>
                      Critical
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Predictive Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between rounded border p-3'>
                    <div>
                      <span className='font-medium'>Exam Success Prediction</span>
                      <p className='text-sm text-gray-600'>Next 30 days</p>
                    </div>
                    <div className='text-right'>
                      <span className='text-2xl font-bold text-green-600'>87%</span>
                      <p className='text-xs text-gray-500'>Confidence: 94%</p>
                    </div>
                  </div>

                  <div className='flex items-center justify-between rounded border p-3'>
                    <div>
                      <span className='font-medium'>At-Risk Student Count</span>
                      <p className='text-sm text-gray-600'>Intervention needed</p>
                    </div>
                    <div className='text-right'>
                      <span className='text-2xl font-bold text-orange-600'>23</span>
                      <p className='text-xs text-gray-500'>Confidence: 89%</p>
                    </div>
                  </div>

                  <div className='flex items-center justify-between rounded border p-3'>
                    <div>
                      <span className='font-medium'>Course Completion</span>
                      <p className='text-sm text-gray-600'>This month forecast</p>
                    </div>
                    <div className='text-right'>
                      <span className='text-2xl font-bold text-blue-600'>145</span>
                      <p className='text-xs text-gray-500'>Confidence: 92%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default RealTimeLearningAnalyticsDashboard
