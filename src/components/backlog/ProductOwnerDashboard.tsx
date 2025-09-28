/**
 * Product Owner Dashboard Component
 * Comprehensive dashboard for product owners with metrics, ROI tracking, and backlog health
 */

import React, { useMemo } from 'react'
import {
  TrendingUp,
  DollarSign,
  Target,
  Users,
  BarChart3,
  PieChart,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Star,
  Zap,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts'
import { mockUserStories, mockEpics, mockVelocityData } from '../../data/backlogData'

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1']

export const ProductOwnerDashboard: React.FC = () => {
  // Calculate backlog metrics
  const backlogMetrics = useMemo(() => {
    const total = mockUserStories.length
    const byStatus = {
      new: mockUserStories.filter((s) => s.status === 'New').length,
      refined: mockUserStories.filter((s) => s.status === 'Refined').length,
      ready: mockUserStories.filter((s) => s.status === 'Ready').length,
      inProgress: mockUserStories.filter((s) => s.status === 'In Progress').length,
      done: mockUserStories.filter((s) => s.status === 'Done').length,
      blocked: mockUserStories.filter((s) => s.status === 'Blocked').length,
    }

    const totalPoints = mockUserStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0)
    const avgPoints = totalPoints / mockUserStories.filter((s) => s.storyPoints).length

    const totalBusinessValue = mockUserStories.reduce((sum, s) => sum + s.businessValue, 0)
    const totalUserValue = mockUserStories.reduce((sum, s) => sum + s.userValue, 0)

    const refinementRate = ((byStatus.refined + byStatus.ready) / total) * 100

    return {
      total,
      byStatus,
      totalPoints,
      avgPoints,
      totalBusinessValue,
      totalUserValue,
      refinementRate,
    }
  }, [])

  // Epic progress data
  const epicProgressData = useMemo(() => {
    return mockEpics.map((epic) => {
      const epicStories = mockUserStories.filter((s) => s.epicId === epic.id)
      const completedStories = epicStories.filter((s) => s.status === 'Done').length
      const totalStories = epicStories.length
      const progress = totalStories > 0 ? (completedStories / totalStories) * 100 : 0

      return {
        name: epic.title.substring(0, 25) + '...',
        completed: completedStories,
        total: totalStories,
        progress,
        businessValue: epic.businessValue,
      }
    })
  }, [])

  // Story status distribution
  const statusDistribution = useMemo(() => {
    return [
      { name: 'New', value: backlogMetrics.byStatus.new, color: '#9ca3af' },
      { name: 'Refined', value: backlogMetrics.byStatus.refined, color: '#3b82f6' },
      { name: 'Ready', value: backlogMetrics.byStatus.ready, color: '#10b981' },
      { name: 'In Progress', value: backlogMetrics.byStatus.inProgress, color: '#8b5cf6' },
      { name: 'Done', value: backlogMetrics.byStatus.done, color: '#059669' },
      { name: 'Blocked', value: backlogMetrics.byStatus.blocked, color: '#ef4444' },
    ].filter((item) => item.value > 0)
  }, [backlogMetrics])

  // Priority distribution
  const priorityDistribution = useMemo(() => {
    return [
      {
        name: 'Critical',
        value: mockUserStories.filter((s) => s.priority === 'Critical').length,
        color: '#ef4444',
      },
      {
        name: 'High',
        value: mockUserStories.filter((s) => s.priority === 'High').length,
        color: '#f97316',
      },
      {
        name: 'Medium',
        value: mockUserStories.filter((s) => s.priority === 'Medium').length,
        color: '#eab308',
      },
      {
        name: 'Low',
        value: mockUserStories.filter((s) => s.priority === 'Low').length,
        color: '#22c55e',
      },
    ]
  }, [])

  // Value vs Effort scatter data
  const valueEffortData = useMemo(() => {
    return mockUserStories.slice(0, 30).map((story) => ({
      name: story.title.substring(0, 20),
      value: story.businessValue + story.userValue,
      effort: story.effort,
      points: story.storyPoints || 5,
    }))
  }, [])

  // ROI projections by epic
  const roiData = useMemo(() => {
    return mockEpics.map((epic) => {
      const epicStories = mockUserStories.filter((s) => s.epicId === epic.id)
      const totalValue = epicStories.reduce((sum, s) => sum + s.businessValue + s.userValue, 0)
      const totalEffort = epicStories.reduce((sum, s) => sum + s.effort, 0)
      const roi = totalEffort > 0 ? (totalValue / totalEffort) * 100 : 0

      return {
        name: epic.title.substring(0, 20),
        value: totalValue,
        effort: totalEffort,
        roi: roi.toFixed(1),
        category: epic.category,
      }
    })
  }, [])

  // Backlog health indicators
  const healthIndicators = useMemo(() => {
    const readyForSprint = mockUserStories.filter((s) => s.status === 'Ready').length
    const blockedItems = mockUserStories.filter((s) => s.blockers.length > 0).length
    const dependenciesIssues = mockUserStories.filter((s) => s.dependencies.length > 3).length
    const oldStories = mockUserStories.filter((s) => {
      const daysSinceCreation =
        (Date.now() - new Date(s.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      return daysSinceCreation > 90 && s.status === 'New'
    }).length

    return {
      readyForSprint,
      blockedItems,
      dependenciesIssues,
      oldStories,
      refinementRate: backlogMetrics.refinementRate,
    }
  }, [backlogMetrics])

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='mx-auto max-w-[1800px]'>
        {/* Header */}
        <div className='mb-6'>
          <h1 className='mb-2 text-3xl font-bold text-gray-900'>Product Owner Dashboard</h1>
          <p className='text-gray-600'>
            Backlog health, value delivery tracking, and strategic metrics
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className='mb-6 grid gap-4 md:grid-cols-6'>
          <div className='rounded-lg bg-white p-4 shadow'>
            <div className='mb-2 flex items-center gap-2 text-sm text-gray-600'>
              <Target className='h-4 w-4' />
              Total Stories
            </div>
            <div className='text-2xl font-bold text-gray-900'>{backlogMetrics.total}</div>
            <div className='text-xs text-gray-500'>{backlogMetrics.totalPoints} points</div>
          </div>

          <div className='rounded-lg bg-white p-4 shadow'>
            <div className='mb-2 flex items-center gap-2 text-sm text-gray-600'>
              <CheckCircle2 className='h-4 w-4' />
              Ready Stories
            </div>
            <div className='text-2xl font-bold text-green-600'>{backlogMetrics.byStatus.ready}</div>
            <div className='text-xs text-gray-500'>For next sprint</div>
          </div>

          <div className='rounded-lg bg-white p-4 shadow'>
            <div className='mb-2 flex items-center gap-2 text-sm text-gray-600'>
              <Activity className='h-4 w-4' />
              In Progress
            </div>
            <div className='text-2xl font-bold text-purple-600'>
              {backlogMetrics.byStatus.inProgress}
            </div>
            <div className='text-xs text-gray-500'>Active work</div>
          </div>

          <div className='rounded-lg bg-white p-4 shadow'>
            <div className='mb-2 flex items-center gap-2 text-sm text-gray-600'>
              <AlertCircle className='h-4 w-4' />
              Blocked
            </div>
            <div className='text-2xl font-bold text-red-600'>{healthIndicators.blockedItems}</div>
            <div className='text-xs text-gray-500'>Need attention</div>
          </div>

          <div className='rounded-lg bg-white p-4 shadow'>
            <div className='mb-2 flex items-center gap-2 text-sm text-gray-600'>
              <Zap className='h-4 w-4' />
              Refinement Rate
            </div>
            <div className='text-2xl font-bold text-blue-600'>
              {backlogMetrics.refinementRate.toFixed(0)}%
            </div>
            <div className='text-xs text-gray-500'>Stories refined</div>
          </div>

          <div className='rounded-lg bg-white p-4 shadow'>
            <div className='mb-2 flex items-center gap-2 text-sm text-gray-600'>
              <Star className='h-4 w-4' />
              Avg Story Points
            </div>
            <div className='text-2xl font-bold text-indigo-600'>
              {backlogMetrics.avgPoints.toFixed(1)}
            </div>
            <div className='text-xs text-gray-500'>Per story</div>
          </div>
        </div>

        <div className='grid gap-6 lg:grid-cols-2'>
          {/* Epic Progress */}
          <div className='rounded-lg bg-white p-6 shadow'>
            <div className='mb-4 flex items-center gap-2'>
              <BarChart3 className='h-5 w-5 text-blue-600' />
              <h2 className='text-lg font-semibold text-gray-900'>Epic Progress</h2>
            </div>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={epicProgressData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  dataKey='name'
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor='end'
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey='completed' fill='#10b981' name='Completed' />
                <Bar dataKey='total' fill='#e5e7eb' name='Total' />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Story Status Distribution */}
          <div className='rounded-lg bg-white p-6 shadow'>
            <div className='mb-4 flex items-center gap-2'>
              <PieChart className='h-5 w-5 text-purple-600' />
              <h2 className='text-lg font-semibold text-gray-900'>Story Status Distribution</h2>
            </div>
            <ResponsiveContainer width='100%' height={300}>
              <RechartsPieChart>
                <Pie
                  data={statusDistribution}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill='#8884d8'
                  dataKey='value'
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {/* Velocity Trend */}
          <div className='rounded-lg bg-white p-6 shadow'>
            <div className='mb-4 flex items-center gap-2'>
              <TrendingUp className='h-5 w-5 text-green-600' />
              <h2 className='text-lg font-semibold text-gray-900'>Velocity Trend</h2>
            </div>
            <ResponsiveContainer width='100%' height={250}>
              <LineChart data={mockVelocityData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='sprintName' tick={{ fontSize: 11 }} />
                <YAxis label={{ value: 'Story Points', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='committed'
                  stroke='#3b82f6'
                  strokeWidth={2}
                  name='Committed'
                />
                <Line
                  type='monotone'
                  dataKey='completed'
                  stroke='#10b981'
                  strokeWidth={2}
                  name='Completed'
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Priority Distribution */}
          <div className='rounded-lg bg-white p-6 shadow'>
            <div className='mb-4 flex items-center gap-2'>
              <Target className='h-5 w-5 text-orange-600' />
              <h2 className='text-lg font-semibold text-gray-900'>Priority Distribution</h2>
            </div>
            <div className='space-y-3'>
              {priorityDistribution.map((item) => (
                <div key={item.name}>
                  <div className='mb-1 flex items-center justify-between text-sm'>
                    <span className='font-medium text-gray-700'>{item.name}</span>
                    <span className='font-semibold' style={{ color: item.color }}>
                      {item.value} stories
                    </span>
                  </div>
                  <div className='h-3 w-full rounded-full bg-gray-200'>
                    <div
                      className='h-3 rounded-full transition-all'
                      style={{
                        width: `${(item.value / backlogMetrics.total) * 100}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Value vs Effort Matrix */}
        <div className='mt-6 rounded-lg bg-white p-6 shadow'>
          <div className='mb-4 flex items-center gap-2'>
            <DollarSign className='h-5 w-5 text-green-600' />
            <h2 className='text-lg font-semibold text-gray-900'>Value vs Effort Analysis</h2>
            <span className='text-sm text-gray-500'>(Top 30 stories)</span>
          </div>
          <ResponsiveContainer width='100%' height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                type='number'
                dataKey='effort'
                name='Effort'
                label={{ value: 'Effort', position: 'insideBottom', offset: -5 }}
                domain={[0, 10]}
              />
              <YAxis
                type='number'
                dataKey='value'
                name='Value'
                label={{ value: 'Value', angle: -90, position: 'insideLeft' }}
                domain={[0, 20]}
              />
              <ZAxis type='number' dataKey='points' range={[50, 400]} name='Story Points' />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={valueEffortData} fill='#3b82f6' />
            </ScatterChart>
          </ResponsiveContainer>
          <div className='mt-4 grid grid-cols-2 gap-4 text-sm'>
            <div className='rounded-lg bg-green-50 p-3'>
              <div className='font-semibold text-green-800'>
                High Value, Low Effort (Quick Wins)
              </div>
              <div className='text-green-700'>Prioritize these stories first</div>
            </div>
            <div className='rounded-lg bg-blue-50 p-3'>
              <div className='font-semibold text-blue-800'>
                High Value, High Effort (Major Projects)
              </div>
              <div className='text-blue-700'>Strategic investments</div>
            </div>
            <div className='rounded-lg bg-yellow-50 p-3'>
              <div className='font-semibold text-yellow-800'>Low Value, Low Effort (Fill-ins)</div>
              <div className='text-yellow-700'>Quick wins but lower impact</div>
            </div>
            <div className='rounded-lg bg-red-50 p-3'>
              <div className='font-semibold text-red-800'>Low Value, High Effort (Avoid)</div>
              <div className='text-red-700'>Reconsider or eliminate</div>
            </div>
          </div>
        </div>

        {/* ROI by Epic */}
        <div className='mt-6 rounded-lg bg-white p-6 shadow'>
          <div className='mb-4 flex items-center gap-2'>
            <DollarSign className='h-5 w-5 text-emerald-600' />
            <h2 className='text-lg font-semibold text-gray-900'>ROI Projections by Epic</h2>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b-2 border-gray-200'>
                  <th className='pb-3 text-left text-sm font-semibold text-gray-700'>Epic</th>
                  <th className='pb-3 text-left text-sm font-semibold text-gray-700'>Category</th>
                  <th className='pb-3 text-right text-sm font-semibold text-gray-700'>
                    Total Value
                  </th>
                  <th className='pb-3 text-right text-sm font-semibold text-gray-700'>
                    Total Effort
                  </th>
                  <th className='pb-3 text-right text-sm font-semibold text-gray-700'>ROI %</th>
                </tr>
              </thead>
              <tbody>
                {roiData
                  .sort((a, b) => parseFloat(b.roi) - parseFloat(a.roi))
                  .map((epic, index) => (
                    <tr key={index} className='border-b border-gray-100'>
                      <td className='py-3 text-sm text-gray-900'>{epic.name}</td>
                      <td className='py-3'>
                        <span className='rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800'>
                          {epic.category}
                        </span>
                      </td>
                      <td className='py-3 text-right text-sm font-semibold text-gray-900'>
                        {epic.value}
                      </td>
                      <td className='py-3 text-right text-sm text-gray-700'>{epic.effort}</td>
                      <td className='py-3 text-right'>
                        <span
                          className={`rounded px-2 py-1 text-sm font-bold ${
                            parseFloat(epic.roi) > 200
                              ? 'bg-green-100 text-green-800'
                              : parseFloat(epic.roi) > 150
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {epic.roi}%
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Backlog Health Alerts */}
        <div className='mt-6 rounded-lg bg-white p-6 shadow'>
          <div className='mb-4 flex items-center gap-2'>
            <AlertCircle className='h-5 w-5 text-amber-600' />
            <h2 className='text-lg font-semibold text-gray-900'>Backlog Health Alerts</h2>
          </div>
          <div className='grid gap-4 md:grid-cols-2'>
            {healthIndicators.readyForSprint < 10 && (
              <div className='rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4'>
                <div className='font-semibold text-amber-900'>Low Ready Story Count</div>
                <div className='text-sm text-amber-800'>
                  Only {healthIndicators.readyForSprint} stories ready for next sprint. Recommend
                  having 15-20.
                </div>
              </div>
            )}
            {healthIndicators.blockedItems > 5 && (
              <div className='rounded-lg border-l-4 border-red-500 bg-red-50 p-4'>
                <div className='font-semibold text-red-900'>High Blocker Count</div>
                <div className='text-sm text-red-800'>
                  {healthIndicators.blockedItems} stories are blocked. Address impediments
                  immediately.
                </div>
              </div>
            )}
            {healthIndicators.oldStories > 0 && (
              <div className='rounded-lg border-l-4 border-purple-500 bg-purple-50 p-4'>
                <div className='font-semibold text-purple-900'>Stale Stories</div>
                <div className='text-sm text-purple-800'>
                  {healthIndicators.oldStories} stories are over 90 days old. Review and update or
                  remove.
                </div>
              </div>
            )}
            {healthIndicators.refinementRate < 60 && (
              <div className='rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4'>
                <div className='font-semibold text-blue-900'>Low Refinement Rate</div>
                <div className='text-sm text-blue-800'>
                  Only {healthIndicators.refinementRate.toFixed(0)}% of stories are refined.
                  Schedule refinement sessions.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Default export for lazy loading
export default ProductOwnerDashboard
