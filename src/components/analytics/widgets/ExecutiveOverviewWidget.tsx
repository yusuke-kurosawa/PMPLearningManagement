/**
 * Executive Overview Widget
 * High-level KPIs, trends, and executive summary for the learning analytics dashboard
 */

import React, { useMemo } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Trophy,
  Clock,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  Zap,
  Brain,
  BarChart3,
  PieChart,
  Gauge,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Progress } from '../../ui/progress'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { InteractiveTooltip } from '../components/InteractiveTooltip'
import type { FilterSettings } from '../types/dashboard'

interface ExecutiveMetrics {
  activeUsers: number
  completionRate: number
  engagementScore: number
  performanceTrend: 'improving' | 'declining' | 'stable'
  totalStudyTime: number
  newAchievements: number
  atRiskStudents: number
  systemHealth: number
}

interface ExecutiveOverviewWidgetProps {
  metrics: ExecutiveMetrics
  filters: FilterSettings
  showTooltips?: boolean
  className?: string
}

const TREND_COLORS = {
  improving: '#10b981',
  declining: '#ef4444',
  stable: '#6b7280',
}

const mockTrendData = [
  { name: 'Jan', activeUsers: 65, completionRate: 72, engagementScore: 78 },
  { name: 'Feb', activeUsers: 78, completionRate: 75, engagementScore: 82 },
  { name: 'Mar', activeUsers: 82, completionRate: 79, engagementScore: 85 },
  { name: 'Apr', activeUsers: 88, completionRate: 83, engagementScore: 88 },
  { name: 'May', activeUsers: 92, completionRate: 86, engagementScore: 90 },
  { name: 'Jun', activeUsers: 95, completionRate: 89, engagementScore: 93 },
]

const mockPerformanceData = [
  { name: 'Integration Mgmt', value: 85, color: '#3b82f6' },
  { name: 'Scope Mgmt', value: 92, color: '#10b981' },
  { name: 'Schedule Mgmt', value: 78, color: '#f59e0b' },
  { name: 'Cost Mgmt', value: 88, color: '#8b5cf6' },
  { name: 'Quality Mgmt', value: 91, color: '#06b6d4' },
]

export const ExecutiveOverviewWidget: React.FC<ExecutiveOverviewWidgetProps> = ({
  metrics,
  filters,
  showTooltips = true,
  className = '',
}) => {
  // KPI cards data
  const kpiCards = useMemo(
    () => [
      {
        title: 'Active Learners',
        value: metrics.activeUsers,
        subtitle: 'Currently engaged',
        icon: Users,
        trend: 'up',
        trendValue: '+12%',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      },
      {
        title: 'Completion Rate',
        value: `${metrics.completionRate}%`,
        subtitle: 'Course completion',
        icon: Target,
        trend: 'up',
        trendValue: '+5.2%',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      },
      {
        title: 'Engagement Score',
        value: `${metrics.engagementScore}%`,
        subtitle: 'Average engagement',
        icon: Activity,
        trend:
          metrics.performanceTrend === 'improving'
            ? 'up'
            : metrics.performanceTrend === 'declining'
              ? 'down'
              : 'stable',
        trendValue:
          metrics.performanceTrend === 'improving'
            ? '+3.1%'
            : metrics.performanceTrend === 'declining'
              ? '-1.8%'
              : '0%',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
      },
      {
        title: 'At-Risk Students',
        value: metrics.atRiskStudents,
        subtitle: 'Need intervention',
        icon: AlertTriangle,
        trend: 'down',
        trendValue: '-8%',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
      },
    ],
    [metrics]
  )

  // Learning insights
  const insights = useMemo(
    () => [
      {
        type: 'positive',
        icon: TrendingUp,
        title: 'Strong Performance',
        description: 'Scope Management shows highest completion rates at 92%',
        action: 'Replicate success patterns',
      },
      {
        type: 'attention',
        icon: AlertTriangle,
        title: 'Schedule Management',
        description: 'Lower engagement at 78% - requires attention',
        action: 'Review content difficulty',
      },
      {
        type: 'opportunity',
        icon: Brain,
        title: 'Predictive Analysis',
        description: 'AI suggests personalized learning paths for 23 students',
        action: 'Enable recommendations',
      },
    ],
    []
  )

  const getHealthColor = (health: number) => {
    if (health >= 90) {
      return 'text-green-600'
    }
    if (health >= 75) {
      return 'text-yellow-600'
    }
    return 'text-red-600'
  }

  const getHealthBadge = (health: number) => {
    if (health >= 90) {
      return { variant: 'default' as const, text: 'Excellent', color: 'bg-green-500' }
    }
    if (health >= 75) {
      return { variant: 'secondary' as const, text: 'Good', color: 'bg-yellow-500' }
    }
    return { variant: 'destructive' as const, text: 'Needs Attention', color: 'bg-red-500' }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* KPI Cards Row */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {kpiCards.map((kpi, index) => {
          const IconComponent = kpi.icon
          return (
            <Card key={index} className='transition-shadow hover:shadow-md'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-2'>
                    <p className='text-sm font-medium text-muted-foreground'>{kpi.title}</p>
                    <div className='flex items-center gap-2'>
                      <span className='text-2xl font-bold text-foreground'>{kpi.value}</span>
                      <Badge
                        variant='outline'
                        className={`text-xs ${
                          kpi.trend === 'up'
                            ? 'border-green-200 text-green-600'
                            : kpi.trend === 'down'
                              ? 'border-red-200 text-red-600'
                              : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        {kpi.trend === 'up' && <TrendingUp className='mr-1 h-3 w-3' />}
                        {kpi.trend === 'down' && <TrendingDown className='mr-1 h-3 w-3' />}
                        {kpi.trendValue}
                      </Badge>
                    </div>
                    <p className='text-xs text-muted-foreground'>{kpi.subtitle}</p>
                  </div>
                  <div className={`rounded-full p-3 ${kpi.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Dashboard Row */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Performance Trends */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='h-5 w-5' />
              Performance Trends
            </CardTitle>
            <CardDescription>Key metrics over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <AreaChart data={mockTrendData}>
                <defs>
                  <linearGradient id='colorUsers' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.3} />
                    <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id='colorCompletion' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#10b981' stopOpacity={0.3} />
                    <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id='colorEngagement' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#8b5cf6' stopOpacity={0.3} />
                    <stop offset='95%' stopColor='#8b5cf6' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' opacity={0.3} />
                <XAxis dataKey='name' />
                <YAxis />
                {showTooltips && (
                  <Tooltip
                    content={({ active, payload, label }: any) => {
                      if (!active || !payload?.length) {
                        return null
                      }
                      return (
                        <InteractiveTooltip
                          data={{
                            label,
                            values: payload.map((p: any) => ({
                              name:
                                p.dataKey === 'activeUsers'
                                  ? 'Active Users'
                                  : p.dataKey === 'completionRate'
                                    ? 'Completion Rate'
                                    : 'Engagement Score',
                              value: p.value,
                              color: p.color,
                              unit: p.dataKey === 'activeUsers' ? '' : '%',
                            })),
                          }}
                          showTrend
                        />
                      )
                    }}
                  />
                )}
                <Area
                  type='monotone'
                  dataKey='activeUsers'
                  stroke='#3b82f6'
                  fillOpacity={1}
                  fill='url(#colorUsers)'
                  name='Active Users'
                />
                <Area
                  type='monotone'
                  dataKey='completionRate'
                  stroke='#10b981'
                  fillOpacity={1}
                  fill='url(#colorCompletion)'
                  name='Completion Rate'
                />
                <Area
                  type='monotone'
                  dataKey='engagementScore'
                  stroke='#8b5cf6'
                  fillOpacity={1}
                  fill='url(#colorEngagement)'
                  name='Engagement Score'
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* System Health & Performance Breakdown */}
        <div className='space-y-6'>
          {/* System Health Card */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Gauge className='h-5 w-5' />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='text-center'>
                <div className={`text-3xl font-bold ${getHealthColor(metrics.systemHealth)}`}>
                  {metrics.systemHealth}%
                </div>
                <Badge {...getHealthBadge(metrics.systemHealth)} className='mt-2'>
                  <div
                    className={`h-2 w-2 rounded-full ${getHealthBadge(metrics.systemHealth).color} mr-2`}
                  />
                  {getHealthBadge(metrics.systemHealth).text}
                </Badge>
              </div>

              <div className='space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span>Performance</span>
                  <span>98%</span>
                </div>
                <Progress value={98} className='h-2' />

                <div className='flex justify-between text-sm'>
                  <span>Availability</span>
                  <span>99.9%</span>
                </div>
                <Progress value={99.9} className='h-2' />

                <div className='flex justify-between text-sm'>
                  <span>Response Time</span>
                  <span>250ms</span>
                </div>
                <Progress value={75} className='h-2' />
              </div>
            </CardContent>
          </Card>

          {/* Top Knowledge Areas */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <PieChart className='h-5 w-5' />
                Top Performing Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={200}>
                <PieChart>
                  <Pie
                    data={mockPerformanceData}
                    cx='50%'
                    cy='50%'
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey='value'
                  >
                    {mockPerformanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  {showTooltips && (
                    <Tooltip
                      formatter={(value: number, name: string) => [`${value}%`, 'Performance']}
                    />
                  )}
                </PieChart>
              </ResponsiveContainer>

              <div className='mt-4 space-y-2'>
                {mockPerformanceData.slice(0, 3).map((item, index) => (
                  <div key={index} className='flex items-center justify-between text-sm'>
                    <div className='flex items-center gap-2'>
                      <div className='h-3 w-3 rounded-sm' style={{ backgroundColor: item.color }} />
                      <span className='truncate'>{item.name}</span>
                    </div>
                    <span className='font-medium'>{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Brain className='h-5 w-5' />
            Executive Insights
          </CardTitle>
          <CardDescription>AI-powered recommendations and key findings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {insights.map((insight, index) => {
              const IconComponent = insight.icon
              const colorClass =
                insight.type === 'positive'
                  ? 'text-green-600'
                  : insight.type === 'attention'
                    ? 'text-orange-600'
                    : 'text-blue-600'
              const bgClass =
                insight.type === 'positive'
                  ? 'bg-green-50'
                  : insight.type === 'attention'
                    ? 'bg-orange-50'
                    : 'bg-blue-50'

              return (
                <div key={index} className={`rounded-lg border p-4 ${bgClass}`}>
                  <div className='flex items-start gap-3'>
                    <div className={`rounded-full p-2 ${bgClass} border`}>
                      <IconComponent className={`h-4 w-4 ${colorClass}`} />
                    </div>
                    <div className='flex-1 space-y-2'>
                      <h4 className={`text-sm font-semibold ${colorClass}`}>{insight.title}</h4>
                      <p className='text-sm text-muted-foreground'>{insight.description}</p>
                      <p className={`text-xs font-medium ${colorClass}`}>→ {insight.action}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Zap className='h-5 w-5' />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-2'>
            <Badge variant='outline' className='cursor-pointer hover:bg-accent'>
              <BookOpen className='mr-1 h-3 w-3' />
              View Content Report
            </Badge>
            <Badge variant='outline' className='cursor-pointer hover:bg-accent'>
              <Users className='mr-1 h-3 w-3' />
              Student Performance
            </Badge>
            <Badge variant='outline' className='cursor-pointer hover:bg-accent'>
              <Trophy className='mr-1 h-3 w-3' />
              Achievement Analytics
            </Badge>
            <Badge variant='outline' className='cursor-pointer hover:bg-accent'>
              <Clock className='mr-1 h-3 w-3' />
              Time Analysis
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ExecutiveOverviewWidget
