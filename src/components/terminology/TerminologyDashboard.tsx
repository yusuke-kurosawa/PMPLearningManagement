/**
 * PMP Terminology Dashboard Component
 * Comprehensive reporting and analytics for terminology compliance
 */

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Progress } from '../ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
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
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  TrendingUp,
  TrendingDown,
  BookOpen,
  FileText,
  Users,
  Target,
  Activity,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Settings,
  HelpCircle,
} from 'lucide-react'
import {
  TerminologyAPI,
  TeamMetrics,
  ValidationResponse,
} from '../../api/terminology/terminology-api'
import { FileAnalysis } from '../../services/terminology/terminology-analyzer'
import { TerminologyEntry } from '../../data/terminology/pmp-terminology-database'

// Component Props
interface TerminologyDashboardProps {
  initialData?: TeamMetrics
  onValidate?: (content: string) => void
  onExport?: (data: any) => void
}

// Dashboard State
interface DashboardState {
  metrics: TeamMetrics | null
  recentAnalyses: FileAnalysis[]
  searchResults: TerminologyEntry[]
  isLoading: boolean
  error: string | null
  selectedTimeframe: 'day' | 'week' | 'month' | 'all'
  selectedKnowledgeArea: string | 'all'
  searchQuery: string
  activeTab: string
  validationText: string
  validationResult: ValidationResponse | null
}

// Color schemes for charts
const COLORS = {
  error: '#ef4444',
  warning: '#f59e0b',
  suggestion: '#3b82f6',
  info: '#10b981',
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#ec4899',
}

const CHART_COLORS = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.warning, COLORS.info]

export const TerminologyDashboard: React.FC<TerminologyDashboardProps> = ({
  initialData,
  onValidate,
  onExport,
}) => {
  const [state, setState] = useState<DashboardState>({
    metrics: initialData || null,
    recentAnalyses: [],
    searchResults: [],
    isLoading: false,
    error: null,
    selectedTimeframe: 'week',
    selectedKnowledgeArea: 'all',
    searchQuery: '',
    activeTab: 'overview',
    validationText: '',
    validationResult: null,
  })

  // Load metrics on mount
  useEffect(() => {
    loadMetrics()
  }, [state.selectedTimeframe])

  // Load metrics from API
  const loadMetrics = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const endDate = new Date().toISOString()
      const startDate = getStartDate(state.selectedTimeframe)

      const response = await TerminologyAPI.getTeamMetrics({
        startDate,
        endDate,
        groupBy: state.selectedTimeframe === 'day' ? 'day' : 'week',
      })

      if (response.success && response.data) {
        setState((prev) => ({ ...prev, metrics: response.data, isLoading: false }))
      } else {
        throw new Error(response.error || 'Failed to load metrics')
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }))
    }
  }

  // Get start date based on timeframe
  const getStartDate = (timeframe: string): string => {
    const date = new Date()
    switch (timeframe) {
      case 'day':
        date.setDate(date.getDate() - 1)
        break
      case 'week':
        date.setDate(date.getDate() - 7)
        break
      case 'month':
        date.setMonth(date.getMonth() - 1)
        break
      default:
        date.setFullYear(date.getFullYear() - 1)
    }
    return date.toISOString()
  }

  // Validate text
  const handleValidate = async () => {
    if (!state.validationText.trim()) {
      return
    }

    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      const response = await TerminologyAPI.validate({
        content: state.validationText,
        fileName: 'manual-validation.md',
        options: {
          pmbokVersion: 7,
          region: 'US',
          strictMode: false,
          contextAware: true,
          semanticAnalysis: true,
        },
      })

      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          validationResult: response.data,
          isLoading: false,
          activeTab: 'validation',
        }))

        if (onValidate) {
          onValidate(state.validationText)
        }
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Validation failed',
      }))
    }
  }

  // Search terms
  const handleSearch = async () => {
    if (!state.searchQuery.trim()) {
      return
    }

    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      const response = await TerminologyAPI.searchTerms({
        query: state.searchQuery,
        filters: {
          knowledgeArea:
            state.selectedKnowledgeArea !== 'all' ? [state.selectedKnowledgeArea] : undefined,
        },
        limit: 20,
      })

      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          searchResults: response.data,
          isLoading: false,
          activeTab: 'glossary',
        }))
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Search failed',
      }))
    }
  }

  // Export data
  const handleExport = () => {
    const exportData = {
      metrics: state.metrics,
      timestamp: new Date().toISOString(),
      timeframe: state.selectedTimeframe,
    }

    if (onExport) {
      onExport(exportData)
    } else {
      // Default export to JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `terminology-report-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  // Calculate derived metrics
  const derivedMetrics = useMemo(() => {
    if (!state.metrics) {
      return null
    }

    const complianceTrend = state.metrics.averageScore > 75 ? 'up' : 'down'
    const topIssue = state.metrics.commonMistakes[0]
    const worstArea = state.metrics.knowledgeGaps[0]

    return {
      complianceTrend,
      topIssue,
      worstArea,
      improvementRate:
        (state.metrics.knowledgeGaps.filter((gap) => gap.improvement > 0).length /
          state.metrics.knowledgeGaps.length) *
        100,
    }
  }, [state.metrics])

  // Render loading state
  if (state.isLoading && !state.metrics) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-primary'></div>
      </div>
    )
  }

  return (
    <div className='w-full space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>PMP Terminology Dashboard</h1>
          <p className='text-muted-foreground'>
            Monitor and improve PMBOK terminology compliance across your codebase
          </p>
        </div>
        <div className='flex gap-2'>
          <Button onClick={loadMetrics} variant='outline' size='sm'>
            <RefreshCw className='mr-2 h-4 w-4' />
            Refresh
          </Button>
          <Button onClick={handleExport} variant='outline' size='sm'>
            <Download className='mr-2 h-4 w-4' />
            Export
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {state.error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Timeframe Selector */}
      <div className='flex items-center gap-4'>
        <Select
          value={state.selectedTimeframe}
          onValueChange={(value: any) =>
            setState((prev) => ({ ...prev, selectedTimeframe: value }))
          }
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Select timeframe' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='day'>Last 24 Hours</SelectItem>
            <SelectItem value='week'>Last 7 Days</SelectItem>
            <SelectItem value='month'>Last 30 Days</SelectItem>
            <SelectItem value='all'>All Time</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={state.selectedKnowledgeArea}
          onValueChange={(value) => setState((prev) => ({ ...prev, selectedKnowledgeArea: value }))}
        >
          <SelectTrigger className='w-[200px]'>
            <SelectValue placeholder='Filter by area' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Knowledge Areas</SelectItem>
            <SelectItem value='integration'>Integration</SelectItem>
            <SelectItem value='scope'>Scope</SelectItem>
            <SelectItem value='schedule'>Schedule</SelectItem>
            <SelectItem value='cost'>Cost</SelectItem>
            <SelectItem value='quality'>Quality</SelectItem>
            <SelectItem value='resource'>Resource</SelectItem>
            <SelectItem value='communication'>Communication</SelectItem>
            <SelectItem value='risk'>Risk</SelectItem>
            <SelectItem value='procurement'>Procurement</SelectItem>
            <SelectItem value='stakeholder'>Stakeholder</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={state.activeTab}
        onValueChange={(value) => setState((prev) => ({ ...prev, activeTab: value }))}
      >
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
          <TabsTrigger value='validation'>Validation</TabsTrigger>
          <TabsTrigger value='glossary'>Glossary</TabsTrigger>
          <TabsTrigger value='team'>Team</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-4'>
          {state.metrics && (
            <>
              {/* Key Metrics Cards */}
              <div className='grid gap-4 md:grid-cols-4'>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>Compliance Score</CardTitle>
                    <Target className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {state.metrics.averageScore.toFixed(1)}%
                    </div>
                    <Progress value={state.metrics.averageScore} className='mt-2' />
                    <p className='mt-2 text-xs text-muted-foreground'>
                      {derivedMetrics?.complianceTrend === 'up' ? (
                        <span className='flex items-center text-green-600'>
                          <TrendingUp className='mr-1 h-3 w-3' />
                          Improving
                        </span>
                      ) : (
                        <span className='flex items-center text-red-600'>
                          <TrendingDown className='mr-1 h-3 w-3' />
                          Declining
                        </span>
                      )}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>Total Issues</CardTitle>
                    <AlertCircle className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>{state.metrics.totalIssues}</div>
                    <p className='mt-2 text-xs text-muted-foreground'>
                      Across {state.metrics.totalChecks} checks
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>Top Issue</CardTitle>
                    <XCircle className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-lg font-bold'>
                      {derivedMetrics?.topIssue?.term || 'None'}
                    </div>
                    <p className='mt-2 text-xs text-muted-foreground'>
                      {derivedMetrics?.topIssue?.count || 0} occurrences
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>Improvement</CardTitle>
                    <Activity className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {derivedMetrics?.improvementRate.toFixed(0)}%
                    </div>
                    <p className='mt-2 text-xs text-muted-foreground'>Areas improving</p>
                  </CardContent>
                </Card>
              </div>

              {/* Common Mistakes */}
              <Card>
                <CardHeader>
                  <CardTitle>Common Terminology Mistakes</CardTitle>
                  <CardDescription>
                    Most frequently incorrect terms in your codebase
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Incorrect Term</TableHead>
                        <TableHead>Occurrences</TableHead>
                        <TableHead>Correct Term</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {state.metrics.commonMistakes.slice(0, 5).map((mistake, index) => (
                        <TableRow key={index}>
                          <TableCell className='font-medium'>
                            <Badge variant='destructive'>{mistake.term}</Badge>
                          </TableCell>
                          <TableCell>{mistake.count}</TableCell>
                          <TableCell>
                            <Badge variant='default'>{mistake.correctTerm}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button size='sm' variant='outline'>
                              <BookOpen className='mr-2 h-4 w-4' />
                              Learn
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Knowledge Gaps */}
              <Card>
                <CardHeader>
                  <CardTitle>Knowledge Area Performance</CardTitle>
                  <CardDescription>
                    Areas requiring additional training and attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width='100%' height={300}>
                    <BarChart data={state.metrics.knowledgeGaps}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='area' />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey='issueCount' fill={COLORS.error} name='Issues' />
                      <Bar dataKey='improvement' fill={COLORS.info} name='Improvement %' />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value='analytics' className='space-y-4'>
          {state.metrics && (
            <>
              {/* Compliance Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Score Trend</CardTitle>
                  <CardDescription>Track terminology compliance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width='100%' height={300}>
                    <LineChart
                      data={[
                        { date: 'Week 1', score: 65 },
                        { date: 'Week 2', score: 68 },
                        { date: 'Week 3', score: 72 },
                        { date: 'Week 4', score: 75 },
                        { date: 'Current', score: state.metrics.averageScore },
                      ]}
                    >
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='date' />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type='monotone'
                        dataKey='score'
                        stroke={COLORS.primary}
                        strokeWidth={2}
                        name='Compliance %'
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Issue Distribution Pie Chart */}
              <div className='grid gap-4 md:grid-cols-2'>
                <Card>
                  <CardHeader>
                    <CardTitle>Issue Severity Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width='100%' height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Errors', value: 25, color: COLORS.error },
                            { name: 'Warnings', value: 45, color: COLORS.warning },
                            { name: 'Suggestions', value: 30, color: COLORS.suggestion },
                          ]}
                          cx='50%'
                          cy='50%'
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill='#8884d8'
                          dataKey='value'
                        >
                          {[
                            { name: 'Errors', value: 25, color: COLORS.error },
                            { name: 'Warnings', value: 45, color: COLORS.warning },
                            { name: 'Suggestions', value: 30, color: COLORS.suggestion },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Knowledge Area Radar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Knowledge Area Compliance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width='100%' height={300}>
                      <RadarChart
                        data={[
                          { area: 'Integration', score: 85 },
                          { area: 'Scope', score: 78 },
                          { area: 'Schedule', score: 92 },
                          { area: 'Cost', score: 70 },
                          { area: 'Quality', score: 88 },
                          { area: 'Resource', score: 75 },
                          { area: 'Communication', score: 82 },
                          { area: 'Risk', score: 65 },
                          { area: 'Procurement', score: 90 },
                          { area: 'Stakeholder', score: 77 },
                        ]}
                      >
                        <PolarGrid />
                        <PolarAngleAxis dataKey='area' />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name='Compliance %'
                          dataKey='score'
                          stroke={COLORS.primary}
                          fill={COLORS.primary}
                          fillOpacity={0.6}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value='validation' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Text Validation</CardTitle>
              <CardDescription>Check any text for PMP terminology compliance</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <label htmlFor='validation-text' className='text-sm font-medium'>
                  Enter text to validate
                </label>
                <textarea
                  id='validation-text'
                  className='h-32 w-full rounded-md border p-3'
                  placeholder='Paste your text here...'
                  value={state.validationText}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, validationText: e.target.value }))
                  }
                />
              </div>
              <Button onClick={handleValidate} disabled={state.isLoading}>
                {state.isLoading ? (
                  <>
                    <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                    Validating...
                  </>
                ) : (
                  <>
                    <CheckCircle className='mr-2 h-4 w-4' />
                    Validate
                  </>
                )}
              </Button>

              {/* Validation Results */}
              {state.validationResult && (
                <div className='mt-6 space-y-4'>
                  <Alert>
                    <Info className='h-4 w-4' />
                    <AlertTitle>Validation Complete</AlertTitle>
                    <AlertDescription>
                      Score: {state.validationResult.analysis.metrics.terminologyScore}/100
                    </AlertDescription>
                  </Alert>

                  {/* Issues List */}
                  {state.validationResult.analysis.errors.length > 0 && (
                    <div>
                      <h4 className='mb-2 font-semibold'>Errors Found:</h4>
                      <div className='space-y-2'>
                        {state.validationResult.analysis.errors.map((error, index) => (
                          <Alert key={index} variant='destructive'>
                            <XCircle className='h-4 w-4' />
                            <AlertDescription>
                              Line {error.line}: "{error.term}" → Use "{error.suggestion}"
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Learning Paths */}
                  {state.validationResult.learningPaths.length > 0 && (
                    <div>
                      <h4 className='mb-2 font-semibold'>Recommended Learning:</h4>
                      <div className='grid gap-2'>
                        {state.validationResult.learningPaths.map((path, index) => (
                          <Card key={index}>
                            <CardHeader className='pb-3'>
                              <CardTitle className='text-sm'>{path.topic}</CardTitle>
                              <CardDescription className='text-xs'>
                                Estimated time: {path.estimatedTime}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Button size='sm' variant='outline'>
                                <BookOpen className='mr-2 h-4 w-4' />
                                Start Learning
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Glossary Tab */}
        <TabsContent value='glossary' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>PMP Terminology Search</CardTitle>
              <CardDescription>
                Search and explore standard project management terms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='mb-4 flex gap-2'>
                <Input
                  placeholder='Search terms...'
                  value={state.searchQuery}
                  onChange={(e) => setState((prev) => ({ ...prev, searchQuery: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className='mr-2 h-4 w-4' />
                  Search
                </Button>
              </div>

              {/* Search Results */}
              {state.searchResults.length > 0 && (
                <div className='space-y-2'>
                  {state.searchResults.map((term) => (
                    <Card key={term.id}>
                      <CardHeader className='pb-3'>
                        <div className='flex items-start justify-between'>
                          <div>
                            <CardTitle className='text-lg'>{term.canonical}</CardTitle>
                            {term.acronym && (
                              <Badge variant='outline' className='mt-1'>
                                {term.acronym}
                              </Badge>
                            )}
                          </div>
                          <div className='flex gap-1'>
                            {term.pmbok6 && <Badge variant='secondary'>PMBOK 6</Badge>}
                            {term.pmbok7 && <Badge variant='secondary'>PMBOK 7</Badge>}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className='mb-2 text-sm text-muted-foreground'>{term.definition}</p>
                        {term.deprecated.length > 0 && (
                          <div className='mt-2'>
                            <span className='text-xs font-semibold'>Avoid using: </span>
                            {term.deprecated.map((dep, idx) => (
                              <Badge key={idx} variant='destructive' className='mr-1'>
                                {dep}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value='team' className='space-y-4'>
          {state.metrics?.userMetrics && (
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
                <CardDescription>Individual contributor terminology compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Developer</TableHead>
                      <TableHead>Checks</TableHead>
                      <TableHead>Avg Score</TableHead>
                      <TableHead>Top Issues</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.metrics.userMetrics.map((user, index) => (
                      <TableRow key={index}>
                        <TableCell className='font-medium'>
                          <div className='flex items-center'>
                            <Users className='mr-2 h-4 w-4' />
                            {user.user}
                          </div>
                        </TableCell>
                        <TableCell>{user.checksPerformed}</TableCell>
                        <TableCell>
                          <Badge variant={user.averageScore > 80 ? 'default' : 'destructive'}>
                            {user.averageScore.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex gap-1'>
                            {user.topIssues.slice(0, 2).map((issue, idx) => (
                              <Badge key={idx} variant='outline'>
                                {issue}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Training Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Team Training Recommendations</CardTitle>
              <CardDescription>Based on common mistakes and knowledge gaps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <Alert>
                  <BookOpen className='h-4 w-4' />
                  <AlertTitle>Recommended Training</AlertTitle>
                  <AlertDescription>
                    <ul className='mt-2 list-inside list-disc'>
                      <li>Risk Management Terminology Workshop (2 hours)</li>
                      <li>Earned Value Management Terms Review (1 hour)</li>
                      <li>PMBOK 7 Performance Domains Overview (1.5 hours)</li>
                    </ul>
                  </AlertDescription>
                </Alert>
                <Button className='w-full'>
                  <FileText className='mr-2 h-4 w-4' />
                  Generate Training Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
