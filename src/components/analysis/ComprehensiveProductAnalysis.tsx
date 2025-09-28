import React, { useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
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
} from 'recharts'
import {
  Network,
  GitBranch,
  Target,
  FileCheck,
  Sparkles,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Filter,
} from 'lucide-react'
import { productAnalysisData } from '../../data/productAnalysisData'
import type {
  PBSNode,
  SystemsEngineeringPhase,
  Requirement,
  FASTFunction,
} from '../../types/analysis'

const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#a855f7',
  pink: '#ec4899',
}

const STATUS_COLORS = {
  implemented: COLORS.success,
  'in-progress': COLORS.warning,
  planned: COLORS.info,
  testing: COLORS.secondary,
  pending: COLORS.danger,
  validated: COLORS.primary,
  completed: COLORS.success,
}

const ComprehensiveProductAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('pbs')
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(['pbs-1', 'pbs-2', 'pbs-3'])
  )
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const tabs = [
    { id: 'pbs', label: 'Product Breakdown', icon: Network },
    { id: 'systems', label: 'Systems Engineering', icon: GitBranch },
    { id: 'system-analysis', label: 'System Analysis', icon: Target },
    { id: 'requirements', label: 'Requirements', icon: FileCheck },
    { id: 'value-engineering', label: 'Value Engineering', icon: Sparkles },
    { id: 'value-analysis', label: 'Value Analysis', icon: TrendingUp },
  ]

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const renderPBSNode = (node: PBSNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes.has(node.id)
    const indent = depth * 24

    const typeColors = {
      platform: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      module: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      feature: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      component: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    }

    const statusIcons = {
      implemented: <CheckCircle2 className='h-4 w-4 text-green-500' />,
      'in-progress': <Clock className='h-4 w-4 text-yellow-500' />,
      planned: <AlertTriangle className='h-4 w-4 text-blue-500' />,
    }

    return (
      <div key={node.id} className='pbs-node'>
        <div
          className='group flex cursor-pointer items-center rounded-lg px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800'
          style={{ marginLeft: `${indent}px` }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          <div className='w-6 flex-shrink-0'>
            {hasChildren &&
              (isExpanded ? (
                <ChevronDown className='h-4 w-4 text-gray-500' />
              ) : (
                <ChevronRight className='h-4 w-4 text-gray-500' />
              ))}
          </div>
          <div className='flex flex-1 items-center gap-3'>
            <span className={`rounded px-2 py-1 text-xs font-medium ${typeColors[node.type]}`}>
              L{node.level}
            </span>
            <span className='font-medium text-gray-900 dark:text-white'>{node.name}</span>
            {node.details?.status && (
              <span className='flex items-center gap-1'>{statusIcons[node.details.status]}</span>
            )}
            {node.details?.priority && (
              <span
                className={`rounded px-2 py-0.5 text-xs ${
                  node.details.priority === 'high'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : node.details.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}
              >
                {node.details.priority}
              </span>
            )}
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className='ml-2'>
            {node.children!.map((child) => renderPBSNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const renderPBS = () => (
    <div className='space-y-6'>
      <div className='rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-white'>
        <h2 className='mb-2 text-2xl font-bold'>Product Breakdown Structure (PBS)</h2>
        <p className='text-purple-100'>
          Hierarchical decomposition of the PMP Learning Platform into modules, features, and
          components
        </p>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-4'>
        <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
          <div className='mb-1 text-sm text-gray-500'>Total Components</div>
          <div className='text-3xl font-bold text-gray-900 dark:text-white'>92</div>
        </div>
        <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
          <div className='mb-1 text-sm text-gray-500'>Implemented</div>
          <div className='text-3xl font-bold text-green-600'>68</div>
        </div>
        <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
          <div className='mb-1 text-sm text-gray-500'>In Progress</div>
          <div className='text-3xl font-bold text-yellow-600'>16</div>
        </div>
        <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
          <div className='mb-1 text-sm text-gray-500'>Planned</div>
          <div className='text-3xl font-bold text-blue-600'>8</div>
        </div>
      </div>

      <div className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
        <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
          Hierarchical Structure
        </h3>
        <div className='space-y-1'>{renderPBSNode(productAnalysisData.pbs)}</div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <div className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
            Status Distribution
          </h3>
          <ResponsiveContainer width='100%' height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Implemented', value: 68 },
                  { name: 'In Progress', value: 16 },
                  { name: 'Planned', value: 8 },
                ]}
                cx='50%'
                cy='50%'
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'
              >
                <Cell fill={COLORS.success} />
                <Cell fill={COLORS.warning} />
                <Cell fill={COLORS.info} />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
            Components by Type
          </h3>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart
              data={[
                { type: 'Platform', count: 1 },
                { type: 'Module', count: 4 },
                { type: 'Feature', count: 15 },
                { type: 'Component', count: 72 },
              ]}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='type' />
              <YAxis />
              <Tooltip />
              <Bar dataKey='count' fill={COLORS.primary} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )

  const renderSystemsEngineering = () => {
    const phases = productAnalysisData.systemsEngineering.phases

    return (
      <div className='space-y-6'>
        <div className='rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white'>
          <h2 className='mb-2 text-2xl font-bold'>Systems Engineering Lifecycle</h2>
          <p className='text-blue-100'>
            Complete lifecycle from concept to operations with quality and risk metrics
          </p>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
            Lifecycle Phases
          </h3>
          <div className='space-y-4'>
            {phases.map((phase, index) => (
              <div key={phase.id} className='rounded-lg border p-4 dark:border-gray-700'>
                <div className='mb-3 flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-white ${
                        phase.status === 'completed'
                          ? 'bg-green-500'
                          : phase.status === 'in-progress'
                            ? 'bg-yellow-500'
                            : 'bg-gray-400'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-900 dark:text-white'>{phase.name}</h4>
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          phase.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : phase.status === 'in-progress'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {phase.status}
                      </span>
                    </div>
                  </div>
                  <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {phase.metrics.progress}%
                  </div>
                </div>

                <div className='mb-3'>
                  <div className='mb-1 flex justify-between text-sm'>
                    <span className='text-gray-600 dark:text-gray-400'>Progress</span>
                  </div>
                  <div className='h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
                    <div
                      className='h-2 rounded-full bg-blue-500 transition-all'
                      style={{ width: `${phase.metrics.progress}%` }}
                    />
                  </div>
                </div>

                <div className='mb-3 grid grid-cols-3 gap-4'>
                  <div>
                    <div className='mb-1 text-xs text-gray-500'>Quality</div>
                    <div className='text-lg font-semibold text-green-600'>
                      {phase.metrics.quality}%
                    </div>
                  </div>
                  <div>
                    <div className='mb-1 text-xs text-gray-500'>Risk Level</div>
                    <div
                      className={`text-lg font-semibold ${
                        phase.metrics.risk < 10
                          ? 'text-green-600'
                          : phase.metrics.risk < 20
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }`}
                    >
                      {phase.metrics.risk}%
                    </div>
                  </div>
                  <div>
                    <div className='mb-1 text-xs text-gray-500'>Deliverables</div>
                    <div className='text-lg font-semibold text-gray-900 dark:text-white'>
                      {phase.deliverables.length}
                    </div>
                  </div>
                </div>

                <div>
                  <div className='mb-2 text-xs font-medium text-gray-700 dark:text-gray-300'>
                    Key Deliverables:
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    {phase.deliverables.map((deliverable, i) => (
                      <span
                        key={i}
                        className='rounded bg-blue-50 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      >
                        {deliverable}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <div className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
              Progress Overview
            </h3>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={phases}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='phase' angle={-45} textAnchor='end' height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey='metrics.progress' name='Progress' fill={COLORS.primary} />
                <Bar dataKey='metrics.quality' name='Quality' fill={COLORS.success} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
              Risk Analysis
            </h3>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={phases}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='phase' angle={-45} textAnchor='end' height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='metrics.risk'
                  name='Risk Level'
                  stroke={COLORS.danger}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
            Architecture Layers
          </h3>
          <div className='space-y-3'>
            {productAnalysisData.systemsEngineering.architecture.layers.map((layer, index) => (
              <div key={index} className='rounded-lg border p-4 dark:border-gray-700'>
                <h4 className='mb-2 font-semibold text-gray-900 dark:text-white'>{layer} Layer</h4>
                <div className='flex flex-wrap gap-2'>
                  {productAnalysisData.systemsEngineering.architecture.components[layer]?.map(
                    (component, i) => (
                      <span
                        key={i}
                        className='rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                      >
                        {component}
                      </span>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderSystemAnalysis = () => {
    const goals = productAnalysisData.systemAnalysis.goals

    return (
      <div className='space-y-6'>
        <div className='rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white'>
          <h2 className='mb-2 text-2xl font-bold'>System Analysis</h2>
          <p className='text-green-100'>
            Goals, KPIs, process flows, and optimization opportunities
          </p>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {goals.map((goal) => (
            <div key={goal.id} className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='font-semibold text-gray-900 dark:text-white'>{goal.name}</h3>
                <span
                  className={`rounded px-2 py-1 text-xs ${
                    goal.category === 'primary'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : goal.category === 'secondary'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}
                >
                  {goal.category}
                </span>
              </div>
              <p className='mb-4 text-sm text-gray-600 dark:text-gray-400'>{goal.description}</p>

              <div className='mb-4'>
                <div className='mb-2 flex justify-between text-sm'>
                  <span className='text-gray-600 dark:text-gray-400'>Current Progress</span>
                  <span className='font-semibold text-gray-900 dark:text-white'>
                    {goal.currentValue}% / {goal.targetValue}%
                  </span>
                </div>
                <div className='h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
                  <div
                    className='h-2 rounded-full bg-green-500'
                    style={{ width: `${(goal.currentValue! / goal.targetValue!) * 100}%` }}
                  />
                </div>
              </div>

              <div className='space-y-3'>
                <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Key Performance Indicators
                </h4>
                {goal.kpis.map((kpi) => (
                  <div key={kpi.id} className='rounded border p-3 dark:border-gray-700'>
                    <div className='mb-2 flex items-center justify-between'>
                      <span className='text-sm font-medium text-gray-900 dark:text-white'>
                        {kpi.name}
                      </span>
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          kpi.status === 'achieved'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : kpi.status === 'on-track'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : kpi.status === 'at-risk'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {kpi.status}
                      </span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600 dark:text-gray-400'>
                        {kpi.value} {kpi.unit}
                      </span>
                      <span className='text-gray-500 dark:text-gray-500'>
                        Target: {kpi.target} {kpi.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
            Optimization Opportunities
          </h3>
          <div className='space-y-3'>
            {productAnalysisData.systemAnalysis.optimizations.map((opt) => (
              <div key={opt.id} className='rounded-lg border p-4 dark:border-gray-700'>
                <div className='mb-3 flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='mb-2 flex items-center gap-3'>
                      <h4 className='font-semibold text-gray-900 dark:text-white'>{opt.area}</h4>
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          opt.effort === 'low'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : opt.effort === 'medium'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {opt.effort} effort
                      </span>
                      <span className='text-sm font-medium text-purple-600 dark:text-purple-400'>
                        Priority: {opt.priority}/10
                      </span>
                    </div>
                    <p className='mb-2 text-sm text-gray-600 dark:text-gray-400'>
                      {opt.description}
                    </p>
                    <p className='text-sm text-gray-700 dark:text-gray-300'>
                      <span className='font-medium'>Implementation:</span> {opt.implementation}
                    </p>
                  </div>
                  <div className='ml-4 text-right'>
                    <div className='mb-1 text-xs text-gray-500'>Savings</div>
                    <div className='text-2xl font-bold text-green-600'>
                      ${(opt.potentialSavings / 1000).toFixed(0)}K
                    </div>
                    <div className='mt-1 text-xs text-gray-500'>ROI: {opt.roi.toFixed(1)}x</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
            KPI Performance Radar
          </h3>
          <ResponsiveContainer width='100%' height={400}>
            <RadarChart
              data={[
                { metric: 'Pass Rate', current: 78, target: 85 },
                { metric: 'Completion', current: 72, target: 80 },
                { metric: 'Engagement', current: 88, target: 90 },
                { metric: 'Satisfaction', current: 90, target: 94 },
                { metric: 'Efficiency', current: 82, target: 85 },
                { metric: 'Quality', current: 85, target: 90 },
              ]}
            >
              <PolarGrid />
              <PolarAngleAxis dataKey='metric' />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name='Current'
                dataKey='current'
                stroke={COLORS.primary}
                fill={COLORS.primary}
                fillOpacity={0.6}
              />
              <Radar
                name='Target'
                dataKey='target'
                stroke={COLORS.success}
                fill={COLORS.success}
                fillOpacity={0.3}
              />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  const renderRequirements = () => {
    const filteredReqs = productAnalysisData.requirements.items.filter((req) => {
      const priorityMatch = filterPriority === 'all' || req.priority === filterPriority
      const statusMatch = filterStatus === 'all' || req.status === filterStatus
      return priorityMatch && statusMatch
    })

    const summary = productAnalysisData.requirements.summary

    return (
      <div className='space-y-6'>
        <div className='rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white'>
          <h2 className='mb-2 text-2xl font-bold'>Requirements Analysis</h2>
          <p className='text-indigo-100'>
            Comprehensive requirements tracking with MoSCoW prioritization
          </p>
        </div>

        <div className='grid grid-cols-2 gap-4 lg:grid-cols-5'>
          <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
            <div className='mb-1 text-sm text-gray-500'>Total Requirements</div>
            <div className='text-3xl font-bold text-gray-900 dark:text-white'>{summary.total}</div>
          </div>
          <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
            <div className='mb-1 text-sm text-gray-500'>Must Have</div>
            <div className='text-3xl font-bold text-red-600'>{summary.byPriority.must}</div>
          </div>
          <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
            <div className='mb-1 text-sm text-gray-500'>Should Have</div>
            <div className='text-3xl font-bold text-yellow-600'>{summary.byPriority.should}</div>
          </div>
          <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
            <div className='mb-1 text-sm text-gray-500'>Could Have</div>
            <div className='text-3xl font-bold text-blue-600'>{summary.byPriority.could}</div>
          </div>
          <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
            <div className='mb-1 text-sm text-gray-500'>Completion Rate</div>
            <div className='text-3xl font-bold text-green-600'>
              {summary.completionRate.toFixed(0)}%
            </div>
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
          <div className='mb-4 flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Requirements Matrix
            </h3>
            <div className='flex gap-3'>
              <div className='flex items-center gap-2'>
                <Filter className='h-4 w-4 text-gray-500' />
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className='rounded-lg border bg-white px-3 py-1 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
                >
                  <option value='all'>All Priorities</option>
                  <option value='must'>Must Have</option>
                  <option value='should'>Should Have</option>
                  <option value='could'>Could Have</option>
                </select>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className='rounded-lg border bg-white px-3 py-1 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
              >
                <option value='all'>All Status</option>
                <option value='implemented'>Implemented</option>
                <option value='testing'>Testing</option>
                <option value='pending'>Pending</option>
              </select>
            </div>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b dark:border-gray-700'>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white'>
                    ID
                  </th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white'>
                    Category
                  </th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white'>
                    Description
                  </th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white'>
                    Priority
                  </th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white'>
                    Status
                  </th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white'>
                    Effort
                  </th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white'>
                    Risk
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredReqs.map((req) => (
                  <tr
                    key={req.id}
                    className='border-b hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50'
                  >
                    <td className='px-4 py-3 font-mono text-sm text-gray-600 dark:text-gray-400'>
                      {req.id}
                    </td>
                    <td className='px-4 py-3'>
                      <span className='rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'>
                        {req.subcategory}
                      </span>
                    </td>
                    <td className='max-w-md px-4 py-3 text-sm text-gray-900 dark:text-white'>
                      {req.description}
                    </td>
                    <td className='px-4 py-3'>
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          req.priority === 'must'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : req.priority === 'should'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : req.priority === 'could'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {req.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          req.status === 'implemented'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : req.status === 'testing'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              : req.status === 'pending'
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-900 dark:text-white'>
                      {req.effort}h
                    </td>
                    <td className='px-4 py-3'>
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          req.riskLevel === 'low'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : req.riskLevel === 'medium'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {req.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <div className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
              Priority Distribution
            </h3>
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Must Have', value: summary.byPriority.must },
                    { name: 'Should Have', value: summary.byPriority.should },
                    { name: 'Could Have', value: summary.byPriority.could },
                  ]}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill='#8884d8'
                  dataKey='value'
                >
                  <Cell fill={COLORS.danger} />
                  <Cell fill={COLORS.warning} />
                  <Cell fill={COLORS.info} />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
              Status Distribution
            </h3>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart
                data={[
                  { status: 'Implemented', count: summary.byStatus.implemented },
                  { status: 'Testing', count: summary.byStatus.testing },
                  { status: 'Pending', count: summary.byStatus.pending },
                  { status: 'Validated', count: summary.byStatus.validated },
                ]}
              >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='status' />
                <YAxis />
                <Tooltip />
                <Bar dataKey='count' fill={COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )
  }

  const renderValueEngineering = () => {
    const functions = productAnalysisData.valueEngineering.functions
    const costValueData = productAnalysisData.valueEngineering.costValueMatrix

    return (
      <div className='space-y-6'>
        <div className='rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white'>
          <h2 className='mb-2 text-2xl font-bold'>Value Engineering (FAST Diagram)</h2>
          <p className='text-pink-100'>
            Function Analysis System Technique with cost-value optimization
          </p>
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-4'>
          <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
            <div className='mb-1 text-sm text-gray-500'>Total Functions</div>
            <div className='text-3xl font-bold text-gray-900 dark:text-white'>
              {functions.length}
            </div>
          </div>
          <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
            <div className='mb-1 text-sm text-gray-500'>Total Cost</div>
            <div className='text-3xl font-bold text-red-600'>
              ${(functions.reduce((sum, f) => sum + f.cost, 0) / 1000).toFixed(0)}K
            </div>
          </div>
          <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
            <div className='mb-1 text-sm text-gray-500'>Total Value</div>
            <div className='text-3xl font-bold text-green-600'>
              ${(functions.reduce((sum, f) => sum + f.value, 0) / 1000).toFixed(0)}K
            </div>
          </div>
          <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
            <div className='mb-1 text-sm text-gray-500'>Value/Cost Ratio</div>
            <div className='text-3xl font-bold text-purple-600'>
              {(
                functions.reduce((sum, f) => sum + f.value, 0) /
                functions.reduce((sum, f) => sum + f.cost, 0)
              ).toFixed(2)}
            </div>
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
            Cost vs Value Matrix
          </h3>
          <ResponsiveContainer width='100%' height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                type='number'
                dataKey='cost'
                name='Cost'
                unit='$'
                label={{ value: 'Cost ($)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                type='number'
                dataKey='value'
                name='Value'
                unit='$'
                label={{ value: 'Value ($)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name='Functions' data={costValueData} fill={COLORS.primary}>
                {costValueData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.value / entry.cost > 2
                        ? COLORS.success
                        : entry.value / entry.cost > 1.5
                          ? COLORS.warning
                          : COLORS.danger
                    }
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
            Value/Cost Ratio Analysis
          </h3>
          <ResponsiveContainer width='100%' height={400}>
            <BarChart
              data={functions
                .map((f) => ({ name: f.name, ratio: f.value / f.cost }))
                .sort((a, b) => b.ratio - a.ratio)}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='name' angle={-45} textAnchor='end' height={120} />
              <YAxis label={{ value: 'Value/Cost Ratio', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey='ratio' fill={COLORS.purple}>
                {functions.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.value / entry.cost > 2
                        ? COLORS.success
                        : entry.value / entry.cost > 1.5
                          ? COLORS.warning
                          : COLORS.danger
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  const renderValueAnalysis = () => {
    const costs = productAnalysisData.valueAnalysis.costs
    const metrics = productAnalysisData.valueAnalysis.metrics
    const risks = productAnalysisData.valueAnalysis.risks
    const opportunities = productAnalysisData.valueAnalysis.opportunities

    const totalCost = costs.reduce((sum, c) => sum + c.amount, 0)
    const totalOptimization = costs.reduce((sum, c) => sum + (c.optimizationPotential || 0), 0)

    return (
      <div className='space-y-6'>
        <div className='rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white'>
          <h2 className='mb-2 text-2xl font-bold'>Value Analysis</h2>
          <p className='text-orange-100'>
            Comprehensive cost-benefit analysis with quality metrics and optimization opportunities
          </p>
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-4'>
          <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
            <div className='mb-1 text-sm text-gray-500'>Total Cost</div>
            <div className='text-3xl font-bold text-gray-900 dark:text-white'>
              ${(totalCost / 1000).toFixed(0)}K
            </div>
          </div>
          <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
            <div className='mb-1 text-sm text-gray-500'>Optimization Potential</div>
            <div className='text-3xl font-bold text-green-600'>
              ${(totalOptimization / 1000).toFixed(0)}K
            </div>
          </div>
          <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
            <div className='mb-1 text-sm text-gray-500'>Potential Savings</div>
            <div className='text-3xl font-bold text-purple-600'>
              {((totalOptimization / totalCost) * 100).toFixed(1)}%
            </div>
          </div>
          <div className='rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800'>
            <div className='mb-1 text-sm text-gray-500'>Risk Score (Avg)</div>
            <div className='text-3xl font-bold text-yellow-600'>
              {((risks.reduce((sum, r) => sum + r.riskScore, 0) / risks.length) * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <div className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
              Cost Breakdown
            </h3>
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={costs}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ category, percentage }) => `${category}: ${percentage}%`}
                  outerRadius={80}
                  fill='#8884d8'
                  dataKey='amount'
                >
                  {costs.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={Object.values(COLORS)[index % Object.values(COLORS).length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
            <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
              Optimization Potential
            </h3>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={costs.filter((c) => c.optimizationPotential)}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='category' angle={-45} textAnchor='end' height={80} />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey='optimizationPotential'
                  fill={COLORS.success}
                  name='Potential Savings ($)'
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
          <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>ROI Analysis</h3>
          <ResponsiveContainer width='100%' height={400}>
            <BarChart data={opportunities}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='area' angle={-45} textAnchor='end' height={80} />
              <YAxis
                yAxisId='left'
                orientation='left'
                stroke={COLORS.danger}
                label={{ value: 'Savings ($)', angle: -90, position: 'insideLeft' }}
              />
              <YAxis
                yAxisId='right'
                orientation='right'
                stroke={COLORS.success}
                label={{ value: 'ROI (x)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId='left'
                dataKey='potentialSavings'
                fill={COLORS.danger}
                name='Potential Savings'
              />
              <Bar yAxisId='right' dataKey='roi' fill={COLORS.success} name='ROI Multiplier' />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      analysis: productAnalysisData,
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `product-analysis-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <div className='mx-auto max-w-7xl px-4 py-8'>
        <div className='mb-8'>
          <div className='mb-4 flex items-center justify-between'>
            <h1 className='text-4xl font-bold text-gray-900 dark:text-white'>
              Product Analysis Dashboard
            </h1>
            <button
              onClick={handleExport}
              className='flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
            >
              <Download className='h-5 w-5' />
              Export Analysis
            </button>
          </div>
          <p className='text-lg text-gray-600 dark:text-gray-400'>
            Comprehensive product analysis using six industry-standard methodologies
          </p>
        </div>

        <div className='mb-6 rounded-lg bg-white shadow-lg dark:bg-gray-800'>
          <div className='flex overflow-x-auto border-b dark:border-gray-700'>
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 whitespace-nowrap px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <Icon className='h-5 w-5' />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className='mb-8'>
          {activeTab === 'pbs' && renderPBS()}
          {activeTab === 'systems' && renderSystemsEngineering()}
          {activeTab === 'system-analysis' && renderSystemAnalysis()}
          {activeTab === 'requirements' && renderRequirements()}
          {activeTab === 'value-engineering' && renderValueEngineering()}
          {activeTab === 'value-analysis' && renderValueAnalysis()}
        </div>
      </div>
    </div>
  )
}

export default ComprehensiveProductAnalysis
