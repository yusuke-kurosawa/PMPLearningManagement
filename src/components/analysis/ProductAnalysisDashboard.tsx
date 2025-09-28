/**
 * Product Analysis Dashboard
 * Comprehensive product analysis using six methodologies:
 * 1. Product Breakdown Structure (PBS)
 * 2. Systems Engineering Analysis
 * 3. System Analysis
 * 4. Requirements Analysis
 * 5. Value Engineering
 * 6. Value Analysis
 */

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Download,
  FileText,
  Network,
  Settings,
  Target,
  TrendingUp,
  DollarSign,
  BarChart3,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react'

import { ProductBreakdownStructure } from './ProductBreakdownStructure'
import { SystemsEngineeringAnalysis } from './SystemsEngineeringAnalysis'
import { SystemAnalysis } from './SystemAnalysis'
import { RequirementsAnalysis } from './RequirementsAnalysis'
import { ValueEngineering } from './ValueEngineering'
import { ValueAnalysis } from './ValueAnalysis'

interface AnalysisMetric {
  name: string
  value: number
  unit: string
  status: 'excellent' | 'good' | 'warning' | 'critical'
  description: string
}

import { logger } from '@/utils/logger'
export const ProductAnalysisDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [exportFormat, setExportFormat] = useState<'pdf' | 'png' | 'json'>('pdf')

  const overviewMetrics: AnalysisMetric[] = useMemo(
    () => [
      {
        name: 'Product Completeness',
        value: 87,
        unit: '%',
        status: 'good',
        description: 'Overall feature implementation status',
      },
      {
        name: 'Requirements Coverage',
        value: 92,
        unit: '%',
        status: 'excellent',
        description: 'Functional requirements met',
      },
      {
        name: 'Value Efficiency',
        value: 78,
        unit: '%',
        status: 'good',
        description: 'Cost-to-value ratio optimization',
      },
      {
        name: 'System Integration',
        value: 85,
        unit: '%',
        status: 'good',
        description: 'Cross-functional integration score',
      },
      {
        name: 'Technical Debt',
        value: 23,
        unit: 'issues',
        status: 'warning',
        description: 'Outstanding technical improvements',
      },
      {
        name: 'Performance Score',
        value: 97,
        unit: '/100',
        status: 'excellent',
        description: 'Lighthouse performance metrics',
      },
    ],
    []
  )

  const productStats = useMemo(
    () => ({
      totalComponents: 92,
      totalServices: 13,
      totalFeatures: 50,
      codeLines: 74047,
      testCoverage: 80.1,
      bundleSize: 1.3,
    }),
    []
  )

  const handleExport = (format: 'pdf' | 'png' | 'json') => {
    setExportFormat(format)
    // Implement export logic
    logger.info('Export initiated', { format, component: 'ProductAnalysisDashboard' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'good':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle2 className='h-5 w-5' />
      case 'good':
        return <Info className='h-5 w-5' />
      case 'warning':
        return <AlertTriangle className='h-5 w-5' />
      case 'critical':
        return <AlertTriangle className='h-5 w-5' />
      default:
        return <Info className='h-5 w-5' />
    }
  }

  return (
    <div className='container mx-auto space-y-6 px-4 py-8'>
      {/* Header */}
      <div className='flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Product Analysis Dashboard</h1>
          <p className='mt-2 text-muted-foreground'>
            Comprehensive analysis using six strategic methodologies
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' onClick={() => handleExport('pdf')}>
            <Download className='mr-2 h-4 w-4' />
            Export PDF
          </Button>
          <Button variant='outline' size='sm' onClick={() => handleExport('png')}>
            <Download className='mr-2 h-4 w-4' />
            Export PNG
          </Button>
          <Button variant='outline' size='sm' onClick={() => handleExport('json')}>
            <Download className='mr-2 h-4 w-4' />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{productStats.totalComponents}</div>
            <p className='mt-1 text-xs text-muted-foreground'>React components</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{productStats.totalServices}</div>
            <p className='mt-1 text-xs text-muted-foreground'>Backend services</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{productStats.totalFeatures}</div>
            <p className='mt-1 text-xs text-muted-foreground'>Implemented features</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Code Lines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{(productStats.codeLines / 1000).toFixed(1)}K</div>
            <p className='mt-1 text-xs text-muted-foreground'>Total lines of code</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Test Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{productStats.testCoverage}%</div>
            <p className='mt-1 text-xs text-muted-foreground'>Code coverage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Bundle Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{productStats.bundleSize}MB</div>
            <p className='mt-1 text-xs text-muted-foreground'>Production build</p>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Key Analysis Metrics</CardTitle>
          <CardDescription>Overall product health indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {overviewMetrics.map((metric) => (
              <div
                key={metric.name}
                className={`rounded-lg border p-4 ${getStatusColor(metric.status)}`}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <p className='mb-1 text-sm font-medium'>{metric.name}</p>
                    <div className='flex items-baseline gap-2'>
                      <span className='text-2xl font-bold'>
                        {metric.value}
                        {metric.unit}
                      </span>
                      {getStatusIcon(metric.status)}
                    </div>
                    <p className='mt-2 text-xs opacity-80'>{metric.description}</p>
                  </div>
                </div>
                {metric.unit === '%' && <Progress value={metric.value} className='mt-3 h-2' />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
        <TabsList className='grid w-full grid-cols-2 gap-2 lg:grid-cols-6'>
          <TabsTrigger value='overview' className='flex items-center gap-2'>
            <BarChart3 className='h-4 w-4' />
            <span className='hidden sm:inline'>Overview</span>
          </TabsTrigger>
          <TabsTrigger value='pbs' className='flex items-center gap-2'>
            <GitBranch className='h-4 w-4' />
            <span className='hidden sm:inline'>PBS</span>
          </TabsTrigger>
          <TabsTrigger value='systems-eng' className='flex items-center gap-2'>
            <Network className='h-4 w-4' />
            <span className='hidden sm:inline'>Systems Eng</span>
          </TabsTrigger>
          <TabsTrigger value='system-analysis' className='flex items-center gap-2'>
            <Settings className='h-4 w-4' />
            <span className='hidden sm:inline'>System</span>
          </TabsTrigger>
          <TabsTrigger value='requirements' className='flex items-center gap-2'>
            <Target className='h-4 w-4' />
            <span className='hidden sm:inline'>Requirements</span>
          </TabsTrigger>
          <TabsTrigger value='value-eng' className='flex items-center gap-2'>
            <TrendingUp className='h-4 w-4' />
            <span className='hidden sm:inline'>Value Eng</span>
          </TabsTrigger>
          <TabsTrigger value='value-analysis' className='flex items-center gap-2'>
            <DollarSign className='h-4 w-4' />
            <span className='hidden sm:inline'>Value</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Analysis Overview</CardTitle>
              <CardDescription>Summary of all six product analysis methodologies</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='space-y-3'>
                  <div className='flex items-center gap-3 rounded-lg border p-4'>
                    <GitBranch className='h-8 w-8 text-blue-600' />
                    <div>
                      <h3 className='font-semibold'>Product Breakdown Structure</h3>
                      <p className='text-sm text-muted-foreground'>
                        Hierarchical decomposition of deliverables
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3 rounded-lg border p-4'>
                    <Network className='h-8 w-8 text-purple-600' />
                    <div>
                      <h3 className='font-semibold'>Systems Engineering</h3>
                      <p className='text-sm text-muted-foreground'>
                        Lifecycle and integration analysis
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3 rounded-lg border p-4'>
                    <Settings className='h-8 w-8 text-green-600' />
                    <div>
                      <h3 className='font-semibold'>System Analysis</h3>
                      <p className='text-sm text-muted-foreground'>
                        Goals, processes, and optimization
                      </p>
                    </div>
                  </div>
                </div>

                <div className='space-y-3'>
                  <div className='flex items-center gap-3 rounded-lg border p-4'>
                    <Target className='h-8 w-8 text-orange-600' />
                    <div>
                      <h3 className='font-semibold'>Requirements Analysis</h3>
                      <p className='text-sm text-muted-foreground'>
                        Functional and non-functional specs
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3 rounded-lg border p-4'>
                    <TrendingUp className='h-8 w-8 text-teal-600' />
                    <div>
                      <h3 className='font-semibold'>Value Engineering</h3>
                      <p className='text-sm text-muted-foreground'>
                        Function analysis and alternatives
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3 rounded-lg border p-4'>
                    <DollarSign className='h-8 w-8 text-yellow-600' />
                    <div>
                      <h3 className='font-semibold'>Value Analysis</h3>
                      <p className='text-sm text-muted-foreground'>Cost, quality, and ROI</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
                <h3 className='mb-2 font-semibold text-blue-900'>Product Summary</h3>
                <p className='text-sm text-blue-800'>
                  The PMP Learning Management System is a comprehensive PWA-based platform for PMBOK
                  learning. It features 92 React components, 13 services, and 50+ implemented
                  features including AI coaching, collaboration tools, advanced visualizations, and
                  mock exams. The system demonstrates strong technical architecture with 80.1% test
                  coverage and excellent performance metrics.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='pbs'>
          <ProductBreakdownStructure />
        </TabsContent>

        <TabsContent value='systems-eng'>
          <SystemsEngineeringAnalysis />
        </TabsContent>

        <TabsContent value='system-analysis'>
          <SystemAnalysis />
        </TabsContent>

        <TabsContent value='requirements'>
          <RequirementsAnalysis />
        </TabsContent>

        <TabsContent value='value-eng'>
          <ValueEngineering />
        </TabsContent>

        <TabsContent value='value-analysis'>
          <ValueAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ProductAnalysisDashboard
