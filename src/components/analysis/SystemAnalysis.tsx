/**
 * System Analysis
 * System goals, objectives, process flow diagrams, and optimization opportunities
 */

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Target, TrendingUp, Zap, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'

interface SystemGoal {
  id: string
  name: string
  category: 'user' | 'technical' | 'business'
  achievement: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  metrics: string[]
  status: 'achieved' | 'on-track' | 'at-risk' | 'blocked'
}

interface ProcessFlow {
  id: string
  name: string
  steps: string[]
  efficiency: number
  bottlenecks: string[]
  optimizationPotential: number
}

interface OptimizationOpportunity {
  id: string
  area: string
  impact: 'high' | 'medium' | 'low'
  effort: 'high' | 'medium' | 'low'
  expectedImprovement: string
  roi: number
}

export const SystemAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState('goals')

  const systemGoals: SystemGoal[] = useMemo(
    () => [
      {
        id: 'user-experience',
        name: 'Exceptional User Experience',
        category: 'user',
        achievement: 92,
        priority: 'critical',
        status: 'achieved',
        metrics: ['User satisfaction: 4.6/5', 'Task completion rate: 94%', 'NPS: 68'],
      },
      {
        id: 'learning-effectiveness',
        name: 'Maximize Learning Effectiveness',
        category: 'user',
        achievement: 88,
        priority: 'critical',
        status: 'on-track',
        metrics: [
          'Knowledge retention: 85%',
          'Exam pass rate: 85.2%',
          'Average study time reduction: 30%',
        ],
      },
      {
        id: 'performance',
        name: 'High Performance & Scalability',
        category: 'technical',
        achievement: 97,
        priority: 'high',
        status: 'achieved',
        metrics: [
          'Page load: <2s',
          'Lighthouse score: 97',
          'Concurrent users: 10K+',
          'Uptime: 99.9%',
        ],
      },
      {
        id: 'reliability',
        name: 'System Reliability',
        category: 'technical',
        achievement: 95,
        priority: 'high',
        status: 'achieved',
        metrics: [
          'Error rate: <0.1%',
          'MTBF: 720hrs',
          'Recovery time: <5min',
          'Data integrity: 100%',
        ],
      },
      {
        id: 'maintainability',
        name: 'Easy Maintenance & Updates',
        category: 'technical',
        achievement: 85,
        priority: 'medium',
        status: 'on-track',
        metrics: [
          'Test coverage: 80.1%',
          'Technical debt: 23 items',
          'Documentation: 90%',
          'Code quality: A',
        ],
      },
      {
        id: 'engagement',
        name: 'User Engagement & Retention',
        category: 'business',
        achievement: 82,
        priority: 'high',
        status: 'on-track',
        metrics: [
          'Daily active users: 1.2K',
          'Avg session: 28min',
          'Retention (7-day): 75%',
          'Feature adoption: 68%',
        ],
      },
      {
        id: 'accessibility',
        name: 'Universal Accessibility',
        category: 'user',
        achievement: 78,
        priority: 'medium',
        status: 'on-track',
        metrics: [
          'WCAG 2.1 AA: 95%',
          'Mobile responsive: 100%',
          'Keyboard nav: 100%',
          'Screen reader: 90%',
        ],
      },
      {
        id: 'cost-efficiency',
        name: 'Cost Optimization',
        category: 'business',
        achievement: 90,
        priority: 'medium',
        status: 'achieved',
        metrics: [
          'Infrastructure cost: $50/mo',
          'CDN cost: $0',
          'Storage: <100MB',
          'Bandwidth: <500GB',
        ],
      },
    ],
    []
  )

  const processFlows: ProcessFlow[] = useMemo(
    () => [
      {
        id: 'user-onboarding',
        name: 'User Onboarding',
        steps: ['Landing', 'Registration', 'Profile Setup', 'Tour', 'First Study Session'],
        efficiency: 85,
        bottlenecks: ['Profile setup takes 3-5 min', 'Tour skip rate: 40%'],
        optimizationPotential: 15,
      },
      {
        id: 'study-flow',
        name: 'Study Session Flow',
        steps: ['Login', 'Select Topic', 'Study Content', 'Practice', 'Review', 'Track Progress'],
        efficiency: 92,
        bottlenecks: ['Topic selection average 2min', 'Progress sync delay'],
        optimizationPotential: 8,
      },
      {
        id: 'exam-preparation',
        name: 'Exam Preparation',
        steps: [
          'Assessment',
          'Study Plan',
          'Content Review',
          'Practice Tests',
          'Weak Area Focus',
          'Final Exam',
        ],
        efficiency: 88,
        bottlenecks: ['Weak area identification manual', 'Study plan creation time'],
        optimizationPotential: 12,
      },
      {
        id: 'content-discovery',
        name: 'Content Discovery',
        steps: ['Search', 'Browse', 'Filter', 'Preview', 'Select'],
        efficiency: 78,
        bottlenecks: ['Search relevance issues', 'Too many filter options', 'Preview loading'],
        optimizationPotential: 22,
      },
      {
        id: 'collaboration',
        name: 'Collaboration Flow',
        steps: ['Find Group', 'Join', 'Share', 'Discuss', 'Coordinate'],
        efficiency: 65,
        bottlenecks: ['Group discovery poor', 'Real-time sync issues', 'Notification delays'],
        optimizationPotential: 35,
      },
    ],
    []
  )

  const optimizationOpportunities: OptimizationOpportunity[] = useMemo(
    () => [
      {
        id: 'ai-search',
        area: 'AI-Powered Search',
        impact: 'high',
        effort: 'medium',
        expectedImprovement: '40% faster content discovery, 60% better relevance',
        roi: 8.5,
      },
      {
        id: 'adaptive-learning',
        area: 'Adaptive Learning Paths',
        impact: 'high',
        effort: 'high',
        expectedImprovement: '25% faster learning, 15% better retention',
        roi: 7.2,
      },
      {
        id: 'realtime-collab',
        area: 'Real-time Collaboration',
        impact: 'high',
        effort: 'high',
        expectedImprovement: '50% better engagement, 30% more active users',
        roi: 6.8,
      },
      {
        id: 'mobile-app',
        area: 'Native Mobile App',
        impact: 'high',
        effort: 'high',
        expectedImprovement: '35% mobile engagement increase, offline support',
        roi: 5.5,
      },
      {
        id: 'bundle-optimization',
        area: 'Bundle Size Reduction',
        impact: 'medium',
        effort: 'low',
        expectedImprovement: '30% faster load, 20% lower bounce rate',
        roi: 9.2,
      },
      {
        id: 'caching-strategy',
        area: 'Enhanced Caching',
        impact: 'medium',
        effort: 'low',
        expectedImprovement: '50% API call reduction, better offline experience',
        roi: 8.8,
      },
      {
        id: 'personalization',
        area: 'Content Personalization',
        impact: 'medium',
        effort: 'medium',
        expectedImprovement: '20% engagement increase, 15% better completion',
        roi: 6.5,
      },
      {
        id: 'gamification',
        area: 'Gamification Elements',
        impact: 'medium',
        effort: 'medium',
        expectedImprovement: '40% engagement boost, 25% better retention',
        roi: 7.0,
      },
      {
        id: 'accessibility',
        area: 'Accessibility Improvements',
        impact: 'low',
        effort: 'low',
        expectedImprovement: '10% user base increase, better compliance',
        roi: 5.0,
      },
    ],
    []
  )

  const efficiencyTrends = useMemo(
    () => [
      { month: 'Jan', efficiency: 72, throughput: 850 },
      { month: 'Feb', efficiency: 75, throughput: 920 },
      { month: 'Mar', efficiency: 78, throughput: 1050 },
      { month: 'Apr', efficiency: 81, throughput: 1180 },
      { month: 'May', efficiency: 84, throughput: 1320 },
      { month: 'Jun', efficiency: 87, throughput: 1480 },
    ],
    []
  )

  const goalDistribution = useMemo(() => {
    const achieved = systemGoals.filter((g) => g.status === 'achieved').length
    const onTrack = systemGoals.filter((g) => g.status === 'on-track').length
    const atRisk = systemGoals.filter((g) => g.status === 'at-risk').length
    const blocked = systemGoals.filter((g) => g.status === 'blocked').length

    return [
      { name: 'Achieved', value: achieved, color: '#10b981' },
      { name: 'On Track', value: onTrack, color: '#3b82f6' },
      { name: 'At Risk', value: atRisk, color: '#f59e0b' },
      { name: 'Blocked', value: blocked, color: '#ef4444' },
    ]
  }, [systemGoals])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'on-track':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'at-risk':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'blocked':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-green-700 bg-green-50'
      case 'medium':
        return 'text-blue-700 bg-blue-50'
      case 'low':
        return 'text-gray-700 bg-gray-50'
      default:
        return 'text-gray-700 bg-gray-50'
    }
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>System Analysis</CardTitle>
          <CardDescription>
            Goals, objectives, process flows, efficiency metrics, and optimization opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className='grid w-full grid-cols-4'>
              <TabsTrigger value='goals'>Goals & Objectives</TabsTrigger>
              <TabsTrigger value='processes'>Process Flows</TabsTrigger>
              <TabsTrigger value='efficiency'>Efficiency</TabsTrigger>
              <TabsTrigger value='optimization'>Optimization</TabsTrigger>
            </TabsList>

            <TabsContent value='goals' className='space-y-6'>
              <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>Goal Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width='100%' height={250}>
                      <PieChart>
                        <Pie
                          data={goalDistribution}
                          cx='50%'
                          cy='50%'
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill='#8884d8'
                          dataKey='value'
                        >
                          {goalDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className='space-y-3'>
                  <Card className='border-green-200 bg-green-50 p-4'>
                    <div className='flex items-center gap-3'>
                      <CheckCircle2 className='h-8 w-8 text-green-600' />
                      <div>
                        <div className='text-2xl font-bold text-green-700'>
                          {goalDistribution.find((g) => g.name === 'Achieved')?.value || 0}
                        </div>
                        <div className='text-sm text-green-600'>Goals Achieved</div>
                      </div>
                    </div>
                  </Card>

                  <Card className='border-blue-200 bg-blue-50 p-4'>
                    <div className='flex items-center gap-3'>
                      <TrendingUp className='h-8 w-8 text-blue-600' />
                      <div>
                        <div className='text-2xl font-bold text-blue-700'>
                          {goalDistribution.find((g) => g.name === 'On Track')?.value || 0}
                        </div>
                        <div className='text-sm text-blue-600'>On Track</div>
                      </div>
                    </div>
                  </Card>

                  <Card className='border-yellow-200 bg-yellow-50 p-4'>
                    <div className='flex items-center gap-3'>
                      <AlertCircle className='h-8 w-8 text-yellow-600' />
                      <div>
                        <div className='text-2xl font-bold text-yellow-700'>
                          {(goalDistribution.find((g) => g.name === 'At Risk')?.value || 0) +
                            (goalDistribution.find((g) => g.name === 'Blocked')?.value || 0)}
                        </div>
                        <div className='text-sm text-yellow-600'>Needs Attention</div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <div className='space-y-4'>
                {systemGoals.map((goal) => (
                  <Card key={goal.id}>
                    <CardHeader className='pb-3'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <div className='mb-2 flex items-center gap-2'>
                            <CardTitle className='text-base'>{goal.name}</CardTitle>
                            <Badge className={getPriorityColor(goal.priority)}>
                              {goal.priority}
                            </Badge>
                            <Badge variant='outline'>{goal.category}</Badge>
                          </div>
                        </div>
                        <Badge className={getStatusColor(goal.status)}>{goal.status}</Badge>
                      </div>
                      <div className='space-y-1'>
                        <div className='flex justify-between text-sm'>
                          <span>Achievement</span>
                          <span className='font-medium'>{goal.achievement}%</span>
                        </div>
                        <Progress value={goal.achievement} className='h-2' />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-1'>
                        <p className='mb-2 text-sm font-medium'>Key Metrics:</p>
                        <ul className='space-y-1 text-sm text-muted-foreground'>
                          {goal.metrics.map((metric, idx) => (
                            <li key={idx}>• {metric}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value='processes' className='space-y-6'>
              <div className='space-y-4'>
                {processFlows.map((flow) => (
                  <Card key={flow.id}>
                    <CardHeader>
                      <div className='flex items-center justify-between'>
                        <CardTitle className='text-base'>{flow.name}</CardTitle>
                        <div className='flex items-center gap-3'>
                          <span className='text-sm font-medium'>
                            Efficiency: {flow.efficiency}%
                          </span>
                          <Badge
                            className={
                              flow.efficiency >= 90
                                ? getStatusColor('achieved')
                                : flow.efficiency >= 75
                                  ? getStatusColor('on-track')
                                  : getStatusColor('at-risk')
                            }
                          >
                            {flow.efficiency >= 90
                              ? 'Excellent'
                              : flow.efficiency >= 75
                                ? 'Good'
                                : 'Needs Improvement'}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={flow.efficiency} className='mt-2 h-2' />
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div>
                        <p className='mb-3 text-sm font-medium'>Process Steps:</p>
                        <div className='flex flex-wrap items-center gap-2'>
                          {flow.steps.map((step, idx) => (
                            <React.Fragment key={idx}>
                              <Badge variant='secondary' className='px-3 py-1'>
                                {step}
                              </Badge>
                              {idx < flow.steps.length - 1 && (
                                <ArrowRight className='h-4 w-4 text-muted-foreground' />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-3'>
                          <p className='mb-2 text-sm font-medium text-yellow-900'>Bottlenecks:</p>
                          <ul className='space-y-1 text-sm text-yellow-800'>
                            {flow.bottlenecks.map((bottleneck, idx) => (
                              <li key={idx}>• {bottleneck}</li>
                            ))}
                          </ul>
                        </div>

                        <div className='rounded-lg border border-green-200 bg-green-50 p-3'>
                          <p className='mb-2 text-sm font-medium text-green-900'>
                            Optimization Potential:
                          </p>
                          <div className='text-2xl font-bold text-green-700'>
                            +{flow.optimizationPotential}%
                          </div>
                          <p className='mt-1 text-xs text-green-600'>
                            Efficiency improvement possible
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value='efficiency' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>System Efficiency Trends</CardTitle>
                  <CardDescription>
                    Historical efficiency and throughput metrics over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width='100%' height={350}>
                    <AreaChart data={efficiencyTrends}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='month' />
                      <YAxis yAxisId='left' />
                      <YAxis yAxisId='right' orientation='right' />
                      <Tooltip />
                      <Legend />
                      <Area
                        yAxisId='left'
                        type='monotone'
                        dataKey='efficiency'
                        stroke='#3b82f6'
                        fill='#3b82f6'
                        fillOpacity={0.6}
                        name='Efficiency %'
                      />
                      <Line
                        yAxisId='right'
                        type='monotone'
                        dataKey='throughput'
                        stroke='#10b981'
                        strokeWidth={2}
                        name='Throughput (users/day)'
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <Card className='border-green-200 bg-green-50'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-sm text-green-900'>Current Efficiency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='text-3xl font-bold text-green-700'>87%</div>
                    <p className='mt-1 text-sm text-green-600'>↑ 15% from baseline</p>
                  </CardContent>
                </Card>

                <Card className='border-blue-200 bg-blue-50'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-sm text-blue-900'>Throughput</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='text-3xl font-bold text-blue-700'>1,480</div>
                    <p className='mt-1 text-sm text-blue-600'>users/day (↑ 74%)</p>
                  </CardContent>
                </Card>

                <Card className='border-purple-200 bg-purple-50'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-sm text-purple-900'>System Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='text-3xl font-bold text-purple-700'>72%</div>
                    <p className='mt-1 text-sm text-purple-600'>Optimal range: 70-80%</p>
                  </CardContent>
                </Card>
              </div>

              <Card className='border-blue-200 bg-blue-50'>
                <CardHeader>
                  <CardTitle className='text-blue-900'>Efficiency Summary</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2 text-sm text-blue-800'>
                  <p>• System efficiency improved 15% over 6 months (72% → 87%)</p>
                  <p>• User throughput increased 74% (850 → 1,480 users/day)</p>
                  <p>• Average response time decreased 40% (150ms → 90ms)</p>
                  <p>• Resource utilization optimized at 72% (within target range)</p>
                  <p>• Error rate reduced by 65% (0.3% → 0.1%)</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='optimization' className='space-y-6'>
              <div className='space-y-4'>
                {optimizationOpportunities
                  .sort((a, b) => b.roi - a.roi)
                  .map((opp) => (
                    <Card key={opp.id}>
                      <CardHeader>
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            <div className='mb-2 flex items-center gap-2'>
                              <CardTitle className='text-base'>{opp.area}</CardTitle>
                              <Badge className={getImpactColor(opp.impact)}>
                                {opp.impact} impact
                              </Badge>
                              <Badge variant='outline'>{opp.effort} effort</Badge>
                            </div>
                          </div>
                          <div className='text-right'>
                            <div className='text-sm text-muted-foreground'>ROI</div>
                            <div className='text-2xl font-bold text-green-600'>{opp.roi}x</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className='rounded-lg border border-blue-200 bg-blue-50 p-3'>
                          <p className='mb-1 text-sm font-medium text-blue-900'>
                            Expected Improvement:
                          </p>
                          <p className='text-sm text-blue-800'>{opp.expectedImprovement}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              <Card className='border-green-200 bg-green-50'>
                <CardHeader>
                  <CardTitle className='text-green-900'>Top Priorities</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2 text-sm text-green-800'>
                  <p>
                    <strong>1. Bundle Size Reduction</strong> (9.2x ROI) - Quick win with low
                    effort, high impact on load times
                  </p>
                  <p>
                    <strong>2. Enhanced Caching</strong> (8.8x ROI) - Reduce API calls and improve
                    offline experience
                  </p>
                  <p>
                    <strong>3. AI-Powered Search</strong> (8.5x ROI) - Significant improvement to
                    content discovery
                  </p>
                  <p>
                    <strong>4. Adaptive Learning Paths</strong> (7.2x ROI) - Major feature with high
                    learning impact
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default SystemAnalysis
