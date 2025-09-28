import React, { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  Sankey,
  Rectangle,
  ScatterPlot,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  Sunburst,
} from 'recharts'
import { EnhancedITTODiagram } from './EnhancedITTODiagram'
import {
  TrendingUp,
  Target,
  BookOpen,
  Users,
  Clock,
  Award,
  Filter,
  Download,
  RefreshCw,
  Eye,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Map,
} from 'lucide-react'

interface ITTOAnalyticsData {
  processId: string
  processName: string
  knowledgeArea: string
  processGroup: string
  inputCount: number
  toolCount: number
  outputCount: number
  totalElements: number
  complexity: number // 1-10
  userProgress: number // 0-100
  completionTime: number // minutes
  practiceScore: number // 0-100
  relationships: number
  importance: number // 1-10
  lastStudied: string
  studyTime: number // total minutes
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  difficultyRating: number // 1-5
  examFrequency: number // How often this appears in exams (1-10)
}

interface LearningMetrics {
  overallProgress: number
  knowledgeAreaProgress: { [key: string]: number }
  processGroupProgress: { [key: string]: number }
  weakAreas: string[]
  strongAreas: string[]
  studyTimeDistribution: { area: string; time: number }[]
  progressTrend: { date: string; progress: number }[]
  masteryDistribution: { level: string; count: number }[]
}

interface ITTODataVisualizationProps {
  analyticsData: ITTOAnalyticsData[]
  learningMetrics: LearningMetrics
  onProcessSelect?: (processId: string) => void
  onRecommendationRequest?: (weakAreas: string[]) => void
  className?: string
}

const COLORS = {
  primary: '#2563eb',
  success: '#16a34a',
  warning: '#ea580c',
  danger: '#dc2626',
  info: '#0891b2',
  neutral: '#6b7280',
}

const KNOWLEDGE_AREA_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
]

import { logger } from '@/utils/logger'
export const ITTODataVisualization: React.FC<ITTODataVisualizationProps> = ({
  analyticsData,
  learningMetrics,
  onProcessSelect,
  onRecommendationRequest,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedKnowledgeArea, setSelectedKnowledgeArea] = useState<string | null>(null)
  const [selectedProcessGroup, setSelectedProcessGroup] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'complexity' | 'progress' | 'importance'>('name')
  const [viewMode, setViewMode] = useState<'chart' | 'table' | 'cards'>('chart')

  // Filter and process data
  const filteredData = useMemo(() => {
    return analyticsData.filter((item) => {
      if (selectedKnowledgeArea && item.knowledgeArea !== selectedKnowledgeArea) {
        return false
      }
      if (selectedProcessGroup && item.processGroup !== selectedProcessGroup) {
        return false
      }
      if (searchTerm && !item.processName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      return true
    })
  }, [analyticsData, selectedKnowledgeArea, selectedProcessGroup, searchTerm])

  // Chart data preparation
  const knowledgeAreaChart = useMemo(() => {
    const areaData = analyticsData.reduce(
      (acc, item) => {
        if (!acc[item.knowledgeArea]) {
          acc[item.knowledgeArea] = {
            name: item.knowledgeArea,
            totalProcesses: 0,
            avgProgress: 0,
            totalComplexity: 0,
            studyTime: 0,
          }
        }
        acc[item.knowledgeArea].totalProcesses += 1
        acc[item.knowledgeArea].avgProgress += item.userProgress
        acc[item.knowledgeArea].totalComplexity += item.complexity
        acc[item.knowledgeArea].studyTime += item.studyTime
        return acc
      },
      {} as Record<string, any>
    )

    return Object.values(areaData).map((area: any) => ({
      ...area,
      avgProgress: Math.round(area.avgProgress / area.totalProcesses),
      avgComplexity: Math.round(area.totalComplexity / area.totalProcesses),
    }))
  }, [analyticsData])

  const processGroupChart = useMemo(() => {
    const groupData = analyticsData.reduce(
      (acc, item) => {
        if (!acc[item.processGroup]) {
          acc[item.processGroup] = {
            name: item.processGroup,
            processes: 0,
            avgProgress: 0,
            totalTime: 0,
          }
        }
        acc[item.processGroup].processes += 1
        acc[item.processGroup].avgProgress += item.userProgress
        acc[item.processGroup].totalTime += item.studyTime
        return acc
      },
      {} as Record<string, any>
    )

    return Object.values(groupData).map((group: any) => ({
      ...group,
      avgProgress: Math.round(group.avgProgress / group.processes),
    }))
  }, [analyticsData])

  const complexityDistribution = useMemo(() => {
    const distribution = analyticsData.reduce(
      (acc, item) => {
        const level = item.complexity <= 3 ? 'Low' : item.complexity <= 6 ? 'Medium' : 'High'
        if (!acc[level]) {
          acc[level] = 0
        }
        acc[level] += 1
        return acc
      },
      {} as Record<string, number>
    )

    return Object.entries(distribution).map(([level, count]) => ({
      name: level,
      value: count,
      percentage: Math.round((count / analyticsData.length) * 100),
    }))
  }, [analyticsData])

  const progressScatterData = useMemo(() => {
    return analyticsData.map((item) => ({
      x: item.complexity,
      y: item.userProgress,
      name: item.processName,
      knowledgeArea: item.knowledgeArea,
      studyTime: item.studyTime,
      size: item.importance * 10,
    }))
  }, [analyticsData])

  const masteryRadarData = useMemo(() => {
    const areas = Array.from(new Set(analyticsData.map((item) => item.knowledgeArea)))
    return areas.map((area) => {
      const areaData = analyticsData.filter((item) => item.knowledgeArea === area)
      const avgProgress =
        areaData.reduce((sum, item) => sum + item.userProgress, 0) / areaData.length
      const avgMastery =
        (areaData.filter((item) => item.masteryLevel === 'expert').length / areaData.length) * 100

      return {
        area,
        progress: Math.round(avgProgress),
        mastery: Math.round(avgMastery),
        fullMark: 100,
      }
    })
  }, [analyticsData])

  const ittoTreemapData = useMemo(() => {
    return analyticsData.map((item) => ({
      name: item.processName,
      size: item.totalElements,
      progress: item.userProgress,
      knowledgeArea: item.knowledgeArea,
      color: KNOWLEDGE_AREA_COLORS[Math.floor(Math.random() * KNOWLEDGE_AREA_COLORS.length)],
    }))
  }, [analyticsData])

  // Event handlers
  const handleProcessClick = useCallback(
    (processId: string) => {
      onProcessSelect?.(processId)
    },
    [onProcessSelect]
  )

  const handleRecommendation = useCallback(() => {
    onRecommendationRequest?.(learningMetrics.weakAreas)
  }, [onRecommendationRequest, learningMetrics.weakAreas])

  const exportData = useCallback(() => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Process,Knowledge Area,Process Group,Progress,Complexity,Study Time\n' +
      filteredData
        .map(
          (item) =>
            `"${item.processName}","${item.knowledgeArea}","${item.processGroup}",${item.userProgress},${item.complexity},${item.studyTime}`
        )
        .join('\n')

    const link = document.createElement('a')
    link.setAttribute('href', encodeURI(csvContent))
    link.setAttribute('download', `itto-analytics-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [filteredData])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='rounded-lg border bg-white p-3 shadow-lg'>
          <p className='font-semibold'>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name.includes('Progress') && '%'}
              {entry.name.includes('Time') && ' min'}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <Activity className='h-6 w-6' />
              ITTO Learning Analytics Dashboard
            </CardTitle>
            <div className='flex gap-2'>
              <Button variant='outline' size='sm' onClick={exportData}>
                <Download className='mr-2 h-4 w-4' />
                Export
              </Button>
              <Button variant='outline' size='sm' onClick={handleRecommendation}>
                <Target className='mr-2 h-4 w-4' />
                Get Recommendations
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap items-center gap-4'>
            {/* Search */}
            <div className='flex items-center gap-2'>
              <Input
                placeholder='Search processes...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-64'
              />
            </div>

            {/* Knowledge Area Filter */}
            <div className='flex flex-wrap gap-2'>
              <Button
                variant={selectedKnowledgeArea ? 'outline' : 'default'}
                size='sm'
                onClick={() => setSelectedKnowledgeArea(null)}
              >
                All Areas
              </Button>
              {Array.from(new Set(analyticsData.map((item) => item.knowledgeArea))).map((area) => (
                <Button
                  key={area}
                  variant={selectedKnowledgeArea === area ? 'default' : 'outline'}
                  size='sm'
                  onClick={() =>
                    setSelectedKnowledgeArea(selectedKnowledgeArea === area ? null : area)
                  }
                >
                  {area}
                </Button>
              ))}
            </div>

            {/* View Mode */}
            <div className='flex gap-2'>
              <Button
                variant={viewMode === 'chart' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setViewMode('chart')}
              >
                <BarChart3 className='h-4 w-4' />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setViewMode('table')}
              >
                <Eye className='h-4 w-4' />
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setViewMode('cards')}
              >
                <Map className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Summary */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center'>
              <div className='rounded-full bg-blue-100 p-3'>
                <TrendingUp className='h-6 w-6 text-blue-600' />
              </div>
              <div className='ml-4'>
                <h3 className='text-lg font-semibold'>{learningMetrics.overallProgress}%</h3>
                <p className='text-gray-600'>Overall Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center'>
              <div className='rounded-full bg-green-100 p-3'>
                <Award className='h-6 w-6 text-green-600' />
              </div>
              <div className='ml-4'>
                <h3 className='text-lg font-semibold'>{learningMetrics.strongAreas.length}</h3>
                <p className='text-gray-600'>Strong Areas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center'>
              <div className='rounded-full bg-orange-100 p-3'>
                <Target className='h-6 w-6 text-orange-600' />
              </div>
              <div className='ml-4'>
                <h3 className='text-lg font-semibold'>{learningMetrics.weakAreas.length}</h3>
                <p className='text-gray-600'>Areas to Focus</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center'>
              <div className='rounded-full bg-purple-100 p-3'>
                <BookOpen className='h-6 w-6 text-purple-600' />
              </div>
              <div className='ml-4'>
                <h3 className='text-lg font-semibold'>{filteredData.length}</h3>
                <p className='text-gray-600'>Total Processes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Visualization Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-6'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='progress'>Progress</TabsTrigger>
          <TabsTrigger value='complexity'>Complexity</TabsTrigger>
          <TabsTrigger value='mastery'>Mastery</TabsTrigger>
          <TabsTrigger value='relationships'>Relationships</TabsTrigger>
          <TabsTrigger value='diagram'>Interactive</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* Knowledge Area Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Area Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={knowledgeAreaChart}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='name' angle={-45} textAnchor='end' height={100} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey='avgProgress' fill={COLORS.primary} name='Avg Progress %' />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Process Group Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Process Group Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <PieChart>
                    <Pie
                      data={processGroupChart}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='processes'
                    >
                      {processGroupChart.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={KNOWLEDGE_AREA_COLORS[index % KNOWLEDGE_AREA_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Study Time Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Study Time Distribution by Knowledge Area</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={learningMetrics.studyTimeDistribution}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='area' />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey='time' fill={COLORS.info} name='Study Time (min)' />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Analysis Tab */}
        <TabsContent value='progress' className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* Progress Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Trend Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <LineChart data={learningMetrics.progressTrend}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type='monotone'
                      dataKey='progress'
                      stroke={COLORS.success}
                      strokeWidth={2}
                      name='Progress %'
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Mastery Level Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Mastery Level Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <PieChart>
                    <Pie
                      data={learningMetrics.masteryDistribution}
                      cx='50%'
                      cy='50%'
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='count'
                      label={({ level, count }) => `${level}: ${count}`}
                    >
                      {learningMetrics.masteryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={KNOWLEDGE_AREA_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Weak Areas Focus */}
          <Card>
            <CardHeader>
              <CardTitle>Areas Requiring Focus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {learningMetrics.weakAreas.map((area, index) => {
                  const areaProgress = learningMetrics.knowledgeAreaProgress[area] || 0
                  return (
                    <div key={area} className='flex items-center justify-between'>
                      <div className='flex-1'>
                        <div className='mb-2 flex items-center justify-between'>
                          <span className='font-medium'>{area}</span>
                          <Badge variant={areaProgress < 50 ? 'destructive' : 'secondary'}>
                            {areaProgress}%
                          </Badge>
                        </div>
                        <Progress value={areaProgress} className='w-full' />
                      </div>
                      <Button
                        variant='outline'
                        size='sm'
                        className='ml-4'
                        onClick={() => onProcessSelect?.(area)}
                      >
                        Focus
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Complexity Analysis Tab */}
        <TabsContent value='complexity' className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* Complexity vs Progress Scatter */}
            <Card>
              <CardHeader>
                <CardTitle>Complexity vs Progress Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <ScatterPlot>
                    <CartesianGrid />
                    <XAxis type='number' dataKey='x' name='Complexity' unit='' />
                    <YAxis type='number' dataKey='y' name='Progress' unit='%' />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter data={progressScatterData} fill={COLORS.primary} />
                  </ScatterPlot>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Complexity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Complexity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={300}>
                  <PieChart>
                    <Pie
                      data={complexityDistribution}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {complexityDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.name === 'High'
                              ? COLORS.danger
                              : entry.name === 'Medium'
                                ? COLORS.warning
                                : COLORS.success
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Mastery Radar Tab */}
        <TabsContent value='mastery' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Area Mastery Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={400}>
                <RadarChart data={masteryRadarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey='area' />
                  <PolarRadiusAxis angle={0} domain={[0, 100]} />
                  <Radar
                    name='Progress'
                    dataKey='progress'
                    stroke={COLORS.primary}
                    fill={COLORS.primary}
                    fillOpacity={0.6}
                  />
                  <Radar
                    name='Mastery'
                    dataKey='mastery'
                    stroke={COLORS.success}
                    fill={COLORS.success}
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relationships Tab */}
        <TabsContent value='relationships' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>ITTO Element Size by Knowledge Area</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={400}>
                <Treemap
                  width={800}
                  height={400}
                  data={ittoTreemapData}
                  dataKey='size'
                  aspectRatio={4 / 3}
                  stroke='#fff'
                  fill='#8884d8'
                >
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload
                        return (
                          <div className='rounded-lg border bg-white p-3 shadow-lg'>
                            <p className='font-semibold'>{data.name}</p>
                            <p>Knowledge Area: {data.knowledgeArea}</p>
                            <p>ITTO Elements: {data.size}</p>
                            <p>Progress: {data.progress}%</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </Treemap>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interactive Diagram Tab */}
        <TabsContent value='diagram' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Interactive ITTO Process Flow</CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
              <EnhancedITTODiagram
                processes={analyticsData.map((item) => ({
                  id: item.processId,
                  name: item.processName,
                  knowledgeArea: item.knowledgeArea,
                  processGroup: item.processGroup,
                  inputs: [], // Would be populated with actual ITTO data
                  tools: [],
                  outputs: [],
                }))}
                onElementSelect={(element) => {
                  if ('processId' in element) {
                    handleProcessClick(element.processId)
                  }
                }}
                onRelationshipExplore={(sourceId, targetId) => {
                  logger.interaction({
                    type: 'relationship-explore',
                    details: { sourceId, targetId, component: 'ITTODataVisualization' },
                  })
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ITTODataVisualization
