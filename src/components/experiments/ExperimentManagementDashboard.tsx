import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  AlertCircle,
  Play,
  Pause,
  StopCircle,
  Plus,
  Eye,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  FileText,
  Download,
  RefreshCw,
  Settings,
  Flask,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import ABTestingFramework, {
  Experiment,
  Variant,
  MetricDefinition,
  ExperimentResults,
} from '@/services/abTesting/ABTestingFramework'

const ExperimentManagementDashboard: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const [framework] = useState(() => new ABTestingFramework())

  // Form state for new experiment
  const [newExperiment, setNewExperiment] = useState({
    name: '',
    description: '',
    hypothesis: '',
    variants: [
      { name: 'Control', description: 'Current experience', allocation: 50 },
      { name: 'Treatment', description: 'New experience', allocation: 50 },
    ],
    primaryMetric: '',
    minimumDetectableEffect: 0.05,
    significance: 0.05,
    power: 0.8,
  })

  useEffect(() => {
    loadExperiments()
    const interval = setInterval(loadExperiments, 30000) // Refresh every 30 seconds
    setRefreshInterval(interval)
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [])

  const loadExperiments = () => {
    const allExperiments = framework.getAllExperiments()
    setExperiments(allExperiments)
  }

  const createExperiment = () => {
    const experiment = framework.createExperiment({
      name: newExperiment.name,
      description: newExperiment.description,
      hypothesis: newExperiment.hypothesis,
      startDate: new Date(),
      variants: newExperiment.variants.map((v, i) => ({
        id: `variant-${i}`,
        name: v.name,
        description: v.description,
        allocation: v.allocation,
        features: [],
      })),
      metrics: [
        {
          id: 'primary',
          name: newExperiment.primaryMetric,
          type: 'primary',
          calculationType: 'proportion',
          minimumDetectableEffect: newExperiment.minimumDetectableEffect,
          significance: newExperiment.significance,
          power: newExperiment.power,
        },
      ],
      allocation: { type: 'random' },
      sampleSize: {
        requiredSampleSize: 0,
        currentSampleSize: 0,
        confidence: 1 - newExperiment.significance,
        power: newExperiment.power,
        minimumDetectableEffect: newExperiment.minimumDetectableEffect,
      },
      config: {
        multipleTestingCorrection: 'bonferroni',
        minimumRuntime: 7,
        maximumRuntime: 30,
        dataQualityChecks: true,
      },
    })

    setExperiments([...experiments, experiment])
    setShowCreateDialog(false)
    resetNewExperiment()
  }

  const resetNewExperiment = () => {
    setNewExperiment({
      name: '',
      description: '',
      hypothesis: '',
      variants: [
        { name: 'Control', description: 'Current experience', allocation: 50 },
        { name: 'Treatment', description: 'New experience', allocation: 50 },
      ],
      primaryMetric: '',
      minimumDetectableEffect: 0.05,
      significance: 0.05,
      power: 0.8,
    })
  }

  const startExperiment = (id: string) => {
    framework.updateExperimentStatus(id, 'running')
    loadExperiments()
  }

  const pauseExperiment = (id: string) => {
    framework.updateExperimentStatus(id, 'paused')
    loadExperiments()
  }

  const stopExperiment = (id: string) => {
    framework.updateExperimentStatus(id, 'completed')
    loadExperiments()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary'
      case 'running':
        return 'default'
      case 'paused':
        return 'warning'
      case 'completed':
        return 'success'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className='h-4 w-4' />
      case 'running':
        return <Play className='h-4 w-4' />
      case 'paused':
        return <Pause className='h-4 w-4' />
      case 'completed':
        return <CheckCircle className='h-4 w-4' />
      default:
        return <AlertCircle className='h-4 w-4' />
    }
  }

  // Mock data for visualization
  const mockResults: ExperimentResults = {
    variants: [
      {
        variantId: 'control',
        metrics: [{ metricId: 'primary', value: 0.15, standardError: 0.02, confidence: 0.95 }],
        sampleSize: 5000,
        conversionRate: 0.15,
      },
      {
        variantId: 'treatment',
        metrics: [{ metricId: 'primary', value: 0.18, standardError: 0.02, confidence: 0.95 }],
        sampleSize: 5000,
        conversionRate: 0.18,
      },
    ],
    statisticalTests: [
      { type: 'ttest', statistic: 2.45, pValue: 0.014 },
      { type: 'chi-square', statistic: 12.3, pValue: 0.015, degreesOfFreedom: 1 },
    ],
    confidenceIntervals: [
      { lower: 0.13, upper: 0.17, confidence: 0.95 },
      { lower: 0.16, upper: 0.2, confidence: 0.95 },
    ],
    pValue: 0.014,
    effectSize: {
      cohensD: 0.15,
      relativeImprovement: 0.2,
      absoluteImprovement: 0.03,
    },
    recommendations: [
      'Results are statistically significant',
      'Effect size is practically significant',
      'Treatment variant shows 20% relative improvement',
    ],
    winner: 'treatment',
  }

  const timeSeriesData = Array.from({ length: 14 }, (_, i) => ({
    day: `Day ${i + 1}`,
    control: 0.15 + Math.random() * 0.02 - 0.01,
    treatment: 0.18 + Math.random() * 0.02 - 0.01,
  }))

  const sampleSizeProgress = selectedExperiment
    ? (selectedExperiment.sampleSize.currentSampleSize /
        selectedExperiment.sampleSize.requiredSampleSize) *
      100
    : 0

  return (
    <div className='container mx-auto space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Experiment Management</h1>
          <p className='text-muted-foreground'>
            Manage A/B tests and measure learning effectiveness
          </p>
        </div>
        <div className='flex gap-2'>
          <Button onClick={loadExperiments} variant='outline'>
            <RefreshCw className='mr-2 h-4 w-4' />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                New Experiment
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>Create New Experiment</DialogTitle>
                <DialogDescription>Design and configure your A/B test</DialogDescription>
              </DialogHeader>
              <div className='space-y-4'>
                <div>
                  <Label htmlFor='name'>Experiment Name</Label>
                  <Input
                    id='name'
                    value={newExperiment.name}
                    onChange={(e) => setNewExperiment({ ...newExperiment, name: e.target.value })}
                    placeholder='e.g., New Learning Path Algorithm'
                  />
                </div>
                <div>
                  <Label htmlFor='description'>Description</Label>
                  <Input
                    id='description'
                    value={newExperiment.description}
                    onChange={(e) =>
                      setNewExperiment({ ...newExperiment, description: e.target.value })
                    }
                    placeholder="Describe what you're testing"
                  />
                </div>
                <div>
                  <Label htmlFor='hypothesis'>Hypothesis</Label>
                  <Input
                    id='hypothesis'
                    value={newExperiment.hypothesis}
                    onChange={(e) =>
                      setNewExperiment({ ...newExperiment, hypothesis: e.target.value })
                    }
                    placeholder='e.g., The new algorithm will increase completion rate by 10%'
                  />
                </div>
                <div>
                  <Label htmlFor='metric'>Primary Metric</Label>
                  <Input
                    id='metric'
                    value={newExperiment.primaryMetric}
                    onChange={(e) =>
                      setNewExperiment({ ...newExperiment, primaryMetric: e.target.value })
                    }
                    placeholder='e.g., Exam Pass Rate'
                  />
                </div>
                <div className='grid grid-cols-3 gap-4'>
                  <div>
                    <Label htmlFor='mde'>Min Detectable Effect</Label>
                    <Input
                      id='mde'
                      type='number'
                      step='0.01'
                      value={newExperiment.minimumDetectableEffect}
                      onChange={(e) =>
                        setNewExperiment({
                          ...newExperiment,
                          minimumDetectableEffect: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor='significance'>Significance (α)</Label>
                    <Input
                      id='significance'
                      type='number'
                      step='0.01'
                      value={newExperiment.significance}
                      onChange={(e) =>
                        setNewExperiment({
                          ...newExperiment,
                          significance: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor='power'>Power (1-β)</Label>
                    <Input
                      id='power'
                      type='number'
                      step='0.01'
                      value={newExperiment.power}
                      onChange={(e) =>
                        setNewExperiment({
                          ...newExperiment,
                          power: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className='flex justify-end gap-2'>
                  <Button variant='outline' onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createExperiment}>Create Experiment</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Experiments</CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {experiments.filter((e) => e.status === 'running').length}
            </div>
            <p className='text-xs text-muted-foreground'>
              {experiments.filter((e) => e.status === 'paused').length} paused
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>24,532</div>
            <p className='text-xs text-muted-foreground'>+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Avg. Lift</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>+15.3%</div>
            <p className='text-xs text-muted-foreground'>Across all experiments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Success Rate</CardTitle>
            <Target className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>68%</div>
            <p className='text-xs text-muted-foreground'>Significant results</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='experiments' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='experiments'>Experiments</TabsTrigger>
          <TabsTrigger value='results'>Results</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
          <TabsTrigger value='settings'>Settings</TabsTrigger>
        </TabsList>

        <TabsContent value='experiments' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Running Experiments</CardTitle>
              <CardDescription>Monitor and manage your active A/B tests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Experiment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Variants</TableHead>
                    <TableHead>Sample Size</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {experiments.map((experiment) => (
                    <TableRow key={experiment.id}>
                      <TableCell>
                        <div>
                          <div className='font-medium'>{experiment.name}</div>
                          <div className='text-sm text-muted-foreground'>
                            {experiment.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(experiment.status)}>
                          <span className='flex items-center gap-1'>
                            {getStatusIcon(experiment.status)}
                            {experiment.status}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>{experiment.variants.length}</TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          <div className='text-sm'>
                            {experiment.sampleSize.currentSampleSize} /{' '}
                            {experiment.sampleSize.requiredSampleSize}
                          </div>
                          <Progress
                            value={
                              (experiment.sampleSize.currentSampleSize /
                                experiment.sampleSize.requiredSampleSize) *
                              100
                            }
                            className='h-2 w-20'
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {experiment.endDate
                          ? `${Math.floor(
                              (experiment.endDate.getTime() - experiment.startDate.getTime()) /
                                (1000 * 60 * 60 * 24)
                            )} days`
                          : 'Ongoing'}
                      </TableCell>
                      <TableCell>
                        <div className='flex gap-1'>
                          {experiment.status === 'draft' && (
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => startExperiment(experiment.id)}
                            >
                              <Play className='h-4 w-4' />
                            </Button>
                          )}
                          {experiment.status === 'running' && (
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => pauseExperiment(experiment.id)}
                            >
                              <Pause className='h-4 w-4' />
                            </Button>
                          )}
                          {experiment.status === 'paused' && (
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => startExperiment(experiment.id)}
                            >
                              <Play className='h-4 w-4' />
                            </Button>
                          )}
                          {(experiment.status === 'running' || experiment.status === 'paused') && (
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => stopExperiment(experiment.id)}
                            >
                              <StopCircle className='h-4 w-4' />
                            </Button>
                          )}
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => setSelectedExperiment(experiment)}
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='results' className='space-y-4'>
          {selectedExperiment && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{selectedExperiment.name} - Results</CardTitle>
                  <CardDescription>Statistical analysis and recommendations</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {/* Key Metrics */}
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <Card>
                      <CardHeader className='pb-2'>
                        <CardTitle className='text-sm'>P-Value</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='text-2xl font-bold'>{mockResults.pValue.toFixed(3)}</div>
                        <p className='text-xs text-muted-foreground'>
                          {mockResults.pValue < 0.05 ? 'Significant' : 'Not significant'}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className='pb-2'>
                        <CardTitle className='text-sm'>Relative Improvement</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='text-2xl font-bold'>
                          {(mockResults.effectSize.relativeImprovement * 100).toFixed(1)}%
                        </div>
                        <p className='text-xs text-muted-foreground'>Treatment vs Control</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className='pb-2'>
                        <CardTitle className='text-sm'>Cohen's d</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='text-2xl font-bold'>
                          {mockResults.effectSize.cohensD?.toFixed(2)}
                        </div>
                        <p className='text-xs text-muted-foreground'>Effect size</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Conversion Rate Comparison */}
                  <div>
                    <h3 className='mb-3 text-lg font-semibold'>Conversion Rates</h3>
                    <ResponsiveContainer width='100%' height={300}>
                      <BarChart data={mockResults.variants}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey='variantId' />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey='conversionRate' fill='#8884d8' />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Time Series */}
                  <div>
                    <h3 className='mb-3 text-lg font-semibold'>Performance Over Time</h3>
                    <ResponsiveContainer width='100%' height={300}>
                      <LineChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey='day' />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type='monotone' dataKey='control' stroke='#8884d8' />
                        <Line type='monotone' dataKey='treatment' stroke='#82ca9d' />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h3 className='mb-3 text-lg font-semibold'>Recommendations</h3>
                    <div className='space-y-2'>
                      {mockResults.recommendations.map((rec, i) => (
                        <Alert key={i}>
                          <CheckCircle className='h-4 w-4' />
                          <AlertDescription>{rec}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value='analytics' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Experiment Analytics</CardTitle>
              <CardDescription>Deep dive into experiment performance</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Sample Size Calculator */}
              <div>
                <h3 className='mb-3 text-lg font-semibold'>Sample Size Progress</h3>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Current: 10,000</span>
                    <span>Required: 15,000</span>
                  </div>
                  <Progress value={66} />
                  <p className='text-sm text-muted-foreground'>
                    Estimated 5 more days to reach significance
                  </p>
                </div>
              </div>

              {/* Statistical Power Analysis */}
              <div>
                <h3 className='mb-3 text-lg font-semibold'>Statistical Power</h3>
                <ResponsiveContainer width='100%' height={300}>
                  <AreaChart
                    data={[
                      { effect: 0.01, power: 0.2 },
                      { effect: 0.02, power: 0.4 },
                      { effect: 0.03, power: 0.6 },
                      { effect: 0.04, power: 0.75 },
                      { effect: 0.05, power: 0.8 },
                      { effect: 0.06, power: 0.85 },
                      { effect: 0.07, power: 0.9 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='effect' />
                    <YAxis />
                    <Tooltip />
                    <Area type='monotone' dataKey='power' stroke='#8884d8' fill='#8884d8' />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Confidence Intervals */}
              <div>
                <h3 className='mb-3 text-lg font-semibold'>Confidence Intervals (95%)</h3>
                <div className='space-y-3'>
                  {mockResults.confidenceIntervals.map((ci, i) => (
                    <div key={i} className='flex items-center gap-4'>
                      <span className='w-20 text-sm font-medium'>
                        {i === 0 ? 'Control' : 'Treatment'}
                      </span>
                      <div className='relative h-8 flex-1 rounded bg-muted'>
                        <div
                          className='absolute h-full rounded bg-primary/20'
                          style={{
                            left: `${ci.lower * 100}%`,
                            width: `${(ci.upper - ci.lower) * 100}%`,
                          }}
                        />
                        <div
                          className='absolute h-full w-1 bg-primary'
                          style={{
                            left: `${((ci.lower + ci.upper) / 2) * 100}%`,
                          }}
                        />
                      </div>
                      <span className='text-sm'>
                        [{ci.lower.toFixed(3)}, {ci.upper.toFixed(3)}]
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='settings' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Experiment Settings</CardTitle>
              <CardDescription>Configure default experiment parameters</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <Label>Default Significance Level (α)</Label>
                  <Select defaultValue='0.05'>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='0.01'>0.01 (99% confidence)</SelectItem>
                      <SelectItem value='0.05'>0.05 (95% confidence)</SelectItem>
                      <SelectItem value='0.10'>0.10 (90% confidence)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Default Statistical Power (1-β)</Label>
                  <Select defaultValue='0.80'>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='0.70'>0.70</SelectItem>
                      <SelectItem value='0.80'>0.80</SelectItem>
                      <SelectItem value='0.90'>0.90</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Multiple Testing Correction</Label>
                  <Select defaultValue='bonferroni'>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='none'>None</SelectItem>
                      <SelectItem value='bonferroni'>Bonferroni</SelectItem>
                      <SelectItem value='fdr'>False Discovery Rate (FDR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Allocation Strategy</Label>
                  <Select defaultValue='random'>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='random'>Random</SelectItem>
                      <SelectItem value='stratified'>Stratified</SelectItem>
                      <SelectItem value='bayesian'>Bayesian (Thompson Sampling)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <h3 className='mb-3 text-lg font-semibold'>Early Stopping Rules</h3>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between rounded border p-3'>
                    <div>
                      <div className='font-medium'>Futility Stopping</div>
                      <div className='text-sm text-muted-foreground'>
                        Stop if effect is too small to detect
                      </div>
                    </div>
                    <input type='checkbox' defaultChecked />
                  </div>
                  <div className='flex items-center justify-between rounded border p-3'>
                    <div>
                      <div className='font-medium'>Efficacy Stopping</div>
                      <div className='text-sm text-muted-foreground'>
                        Stop if clear winner emerges early
                      </div>
                    </div>
                    <input type='checkbox' defaultChecked />
                  </div>
                  <div className='flex items-center justify-between rounded border p-3'>
                    <div>
                      <div className='font-medium'>Harm Prevention</div>
                      <div className='text-sm text-muted-foreground'>
                        Stop if treatment performs significantly worse
                      </div>
                    </div>
                    <input type='checkbox' defaultChecked />
                  </div>
                </div>
              </div>

              <div className='flex justify-end'>
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ExperimentManagementDashboard
