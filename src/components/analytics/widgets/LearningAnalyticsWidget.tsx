/**
 * Learning Analytics Widget
 * Detailed performance metrics, knowledge area analysis, progress tracking
 */

import React, { useMemo } from 'react'
import { BookOpen, TrendingUp, Clock, Target, BarChart, Users, Award, Brain } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Progress } from '../../ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from 'recharts'
import { InteractiveTooltip } from '../components/InteractiveTooltip'
import type { FilterSettings } from '../types/dashboard'

interface LearningAnalyticsWidgetProps {
  progressData: any
  filters: FilterSettings
  showTooltips?: boolean
  className?: string
}

const mockKnowledgeAreaData = [
  { area: 'Integration Management', mastery: 85, studyTime: 240, processes: 7, completion: 92 },
  { area: 'Scope Management', mastery: 78, studyTime: 180, processes: 6, completion: 88 },
  { area: 'Schedule Management', mastery: 82, studyTime: 220, processes: 6, completion: 85 },
  { area: 'Cost Management', mastery: 75, studyTime: 160, processes: 4, completion: 90 },
  { area: 'Quality Management', mastery: 88, studyTime: 200, processes: 3, completion: 95 },
  { area: 'Resource Management', mastery: 80, studyTime: 190, processes: 6, completion: 87 },
  { area: 'Communications Management', mastery: 92, studyTime: 150, processes: 3, completion: 98 },
  { area: 'Risk Management', mastery: 76, studyTime: 210, processes: 7, completion: 82 },
  { area: 'Procurement Management', mastery: 84, studyTime: 170, processes: 3, completion: 91 },
  { area: 'Stakeholder Management', mastery: 89, studyTime: 140, processes: 4, completion: 94 },
]

const mockProcessGroupData = [
  { group: 'Initiating', processes: 2, avgMastery: 90, completion: 95, studyTime: 80 },
  { group: 'Planning', processes: 24, avgMastery: 82, completion: 87, studyTime: 960 },
  { group: 'Executing', processes: 10, avgMastery: 85, completion: 89, studyTime: 400 },
  { group: 'M&C', processes: 12, avgMastery: 79, completion: 84, studyTime: 480 },
  { group: 'Closing', processes: 1, avgMastery: 95, completion: 98, studyTime: 40 },
]

const mockLearningPathData = [
  { week: 'Week 1', target: 15, actual: 12, efficiency: 80 },
  { week: 'Week 2', target: 30, actual: 28, efficiency: 93 },
  { week: 'Week 3', target: 45, actual: 42, efficiency: 93 },
  { week: 'Week 4', target: 60, actual: 58, efficiency: 97 },
  { week: 'Week 5', target: 75, actual: 69, efficiency: 92 },
  { week: 'Week 6', target: 90, actual: 85, efficiency: 94 },
]

export const LearningAnalyticsWidget: React.FC<LearningAnalyticsWidgetProps> = ({
  progressData,
  filters,
  showTooltips = true,
  className = '',
}) => {
  const analytics = useMemo(() => {
    const totalProcesses = 49
    const completedProcesses = mockKnowledgeAreaData.reduce(
      (sum, area) => sum + Math.floor((area.processes * area.completion) / 100),
      0
    )
    const totalStudyTime = mockKnowledgeAreaData.reduce((sum, area) => sum + area.studyTime, 0)
    const avgMastery =
      mockKnowledgeAreaData.reduce((sum, area) => sum + area.mastery, 0) /
      mockKnowledgeAreaData.length

    return {
      totalProcesses,
      completedProcesses,
      progressPercentage: Math.round((completedProcesses / totalProcesses) * 100),
      totalStudyTime,
      avgMastery: Math.round(avgMastery),
      strongestArea: mockKnowledgeAreaData.reduce((prev, current) =>
        prev.mastery > current.mastery ? prev : current
      ),
      weakestArea: mockKnowledgeAreaData.reduce((prev, current) =>
        prev.mastery < current.mastery ? prev : current
      ),
    }
  }, [])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-blue-50 p-2'>
                <BookOpen className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Processes Completed</p>
                <p className='text-xl font-bold'>
                  {analytics.completedProcesses}/{analytics.totalProcesses}
                </p>
                <p className='text-xs text-green-600'>+3 this week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-green-50 p-2'>
                <Target className='h-5 w-5 text-green-600' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Overall Progress</p>
                <p className='text-xl font-bold'>{analytics.progressPercentage}%</p>
                <Progress value={analytics.progressPercentage} className='mt-1 h-1' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-purple-50 p-2'>
                <Clock className='h-5 w-5 text-purple-600' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Total Study Time</p>
                <p className='text-xl font-bold'>
                  {Math.floor(analytics.totalStudyTime / 60)}h {analytics.totalStudyTime % 60}m
                </p>
                <p className='text-xs text-blue-600'>32m today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-orange-50 p-2'>
                <Award className='h-5 w-5 text-orange-600' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Average Mastery</p>
                <p className='text-xl font-bold'>{analytics.avgMastery}%</p>
                <p className='text-xs text-green-600'>↑ 2.3% improvement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Content */}
      <Tabs defaultValue='knowledge-areas' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='knowledge-areas'>Knowledge Areas</TabsTrigger>
          <TabsTrigger value='process-groups'>Process Groups</TabsTrigger>
          <TabsTrigger value='learning-path'>Learning Path</TabsTrigger>
          <TabsTrigger value='performance'>Performance</TabsTrigger>
        </TabsList>

        {/* Knowledge Areas Tab */}
        <TabsContent value='knowledge-areas' className='space-y-4'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* Knowledge Area Mastery Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Area Mastery</CardTitle>
                <CardDescription>Proficiency levels across all knowledge areas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <RechartsBarChart data={mockKnowledgeAreaData} layout='horizontal'>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis type='number' domain={[0, 100]} />
                    <YAxis dataKey='area' type='category' width={120} tick={{ fontSize: 12 }} />
                    {showTooltips && (
                      <Tooltip
                        content={({ active, payload, label }: any) => {
                          if (!active || !payload?.length) {
                            return null
                          }
                          return (
                            <InteractiveTooltip
                              data={{
                                label: label as string,
                                values: [
                                  {
                                    name: 'Mastery Level',
                                    value: payload[0].value,
                                    color: payload[0].color,
                                    unit: '%',
                                  },
                                ],
                              }}
                            />
                          )
                        }}
                      />
                    )}
                    <Bar dataKey='mastery' fill='#3b82f6' radius={[0, 4, 4, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Study Time Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Study Time Distribution</CardTitle>
                <CardDescription>Time spent per knowledge area</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <RechartsBarChart data={mockKnowledgeAreaData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                      dataKey='area'
                      tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }}
                      height={80}
                    />
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
                                label: label as string,
                                values: [
                                  {
                                    name: 'Study Time',
                                    value: payload[0].value,
                                    color: payload[0].color,
                                    unit: 'minutes',
                                  },
                                ],
                              }}
                            />
                          )
                        }}
                      />
                    )}
                    <Bar dataKey='studyTime' fill='#10b981' radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Knowledge Area Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
              <CardDescription>In-depth view of each knowledge area</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {mockKnowledgeAreaData.map((area, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between rounded-lg border p-4'
                  >
                    <div className='flex flex-1 items-center gap-4'>
                      <div className='min-w-0 flex-1'>
                        <h4 className='truncate font-semibold'>{area.area}</h4>
                        <p className='text-sm text-muted-foreground'>
                          {area.processes} processes • {area.studyTime} minutes
                        </p>
                      </div>
                      <div className='flex items-center gap-4'>
                        <div className='text-center'>
                          <p className='text-xs text-muted-foreground'>Mastery</p>
                          <p className='font-semibold'>{area.mastery}%</p>
                        </div>
                        <div className='text-center'>
                          <p className='text-xs text-muted-foreground'>Completion</p>
                          <p className='font-semibold'>{area.completion}%</p>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        area.mastery >= 85
                          ? 'default'
                          : area.mastery >= 70
                            ? 'secondary'
                            : 'outline'
                      }
                      className='ml-4'
                    >
                      {area.mastery >= 85 ? 'Strong' : area.mastery >= 70 ? 'Good' : 'Needs Work'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Process Groups Tab */}
        <TabsContent value='process-groups' className='space-y-4'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* Process Group Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Process Group Performance</CardTitle>
                <CardDescription>Performance across the 5 process groups</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <RadarChart data={mockProcessGroupData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey='group' />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name='Average Mastery'
                      dataKey='avgMastery'
                      stroke='#8b5cf6'
                      fill='#8b5cf6'
                      fillOpacity={0.3}
                    />
                    <Radar
                      name='Completion Rate'
                      dataKey='completion'
                      stroke='#10b981'
                      fill='#10b981'
                      fillOpacity={0.2}
                    />
                    {showTooltips && <Tooltip />}
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Process Group Details */}
            <Card>
              <CardHeader>
                <CardTitle>Process Group Details</CardTitle>
                <CardDescription>Breakdown by process group</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {mockProcessGroupData.map((group, index) => (
                    <div key={index} className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <h4 className='font-semibold'>{group.group}</h4>
                          <p className='text-sm text-muted-foreground'>
                            {group.processes} processes
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='font-semibold'>{group.avgMastery}%</p>
                          <p className='text-sm text-muted-foreground'>mastery</p>
                        </div>
                      </div>
                      <div className='grid grid-cols-2 gap-2 text-xs'>
                        <div>
                          <div className='flex justify-between'>
                            <span>Completion:</span>
                            <span>{group.completion}%</span>
                          </div>
                          <Progress value={group.completion} className='h-1' />
                        </div>
                        <div>
                          <div className='flex justify-between'>
                            <span>Study Time:</span>
                            <span>{Math.floor(group.studyTime / 60)}h</span>
                          </div>
                          <Progress value={(group.studyTime / 960) * 100} className='h-1' />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Learning Path Tab */}
        <TabsContent value='learning-path' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Learning Path Progress</CardTitle>
              <CardDescription>Target vs actual progress over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={mockLearningPathData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='week' />
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
                              label: label as string,
                              values: payload.map((p: any) => ({
                                name:
                                  p.dataKey === 'target'
                                    ? 'Target'
                                    : p.dataKey === 'actual'
                                      ? 'Actual'
                                      : 'Efficiency',
                                value: p.value,
                                color: p.color,
                                unit: p.dataKey === 'efficiency' ? '%' : 'processes',
                              })),
                            }}
                            showTrend
                          />
                        )
                      }}
                    />
                  )}
                  <Line
                    type='monotone'
                    dataKey='target'
                    stroke='#94a3b8'
                    strokeDasharray='5 5'
                    name='Target'
                  />
                  <Line
                    type='monotone'
                    dataKey='actual'
                    stroke='#3b82f6'
                    strokeWidth={2}
                    name='Actual'
                  />
                  <Line
                    type='monotone'
                    dataKey='efficiency'
                    stroke='#10b981'
                    strokeWidth={2}
                    name='Efficiency %'
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value='performance' className='space-y-4'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5 text-green-600' />
                  Strongest Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {mockKnowledgeAreaData
                    .sort((a, b) => b.mastery - a.mastery)
                    .slice(0, 5)
                    .map((area, index) => (
                      <div key={index} className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm font-medium'>{area.area}</p>
                          <p className='text-xs text-muted-foreground'>
                            {area.processes} processes
                          </p>
                        </div>
                        <Badge variant='default' className='bg-green-600'>
                          {area.mastery}%
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Areas for Improvement */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Brain className='h-5 w-5 text-orange-600' />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {mockKnowledgeAreaData
                    .sort((a, b) => a.mastery - b.mastery)
                    .slice(0, 5)
                    .map((area, index) => (
                      <div key={index} className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm font-medium'>{area.area}</p>
                          <p className='text-xs text-muted-foreground'>
                            {area.processes} processes
                          </p>
                        </div>
                        <Badge variant='outline' className='border-orange-300'>
                          {area.mastery}%
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default LearningAnalyticsWidget
