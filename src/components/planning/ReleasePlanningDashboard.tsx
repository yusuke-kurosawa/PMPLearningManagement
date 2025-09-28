import React, { useState, useMemo } from 'react'
import {
  Calendar,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Package,
  GitBranch,
  BarChart3,
  Activity,
} from 'lucide-react'
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
import { releases, epics, sprints } from '../../data/planningData'
import { Release, ReleasePhase } from '../../types/planning'

const PHASE_COLORS = {
  Planning: '#6366f1',
  Development: '#3b82f6',
  Testing: '#f59e0b',
  UAT: '#8b5cf6',
  Deployed: '#10b981',
}

const PRIORITY_COLORS = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#22c55e',
}

const HEALTH_COLORS = {
  'On Track': '#10b981',
  'At Risk': '#f59e0b',
  'Off Track': '#ef4444',
}

export const ReleasePlanningDashboard: React.FC = () => {
  const [selectedRelease, setSelectedRelease] = useState<Release>(releases[0])
  const [view, setView] = useState<'timeline' | 'features' | 'risks' | 'metrics'>('timeline')

  // Calculate release metrics
  const releaseMetrics = useMemo(() => {
    const release = selectedRelease
    const releaseEpics = epics.filter((e) => release.epics.includes(e.id))
    const releaseSprints = sprints.filter((s) => release.sprints.includes(s.id))

    const totalFeatures = release.features.length
    const completedFeatures = release.features.filter(
      (f) =>
        epics.find((e) => e.userStories.some((us) => us.includes(f.id)))?.status === 'Completed'
    ).length

    const totalSprints = releaseSprints.length
    const completedSprints = releaseSprints.filter((s) => s.status === 'Completed').length

    const totalVelocity = releaseSprints.reduce((acc, s) => acc + s.velocity, 0)
    const avgVelocity = totalSprints > 0 ? totalVelocity / completedSprints || 0 : 0

    const totalEffort = release.features.reduce((acc, f) => acc + f.effort, 0)
    const completedEffort = Math.round((completedFeatures / totalFeatures) * totalEffort)

    return {
      totalFeatures,
      completedFeatures,
      featureCompletion: Math.round((completedFeatures / totalFeatures) * 100),
      totalSprints,
      completedSprints,
      sprintCompletion: Math.round((completedSprints / totalSprints) * 100),
      avgVelocity: Math.round(avgVelocity),
      totalEffort,
      completedEffort,
      effortCompletion: Math.round((completedEffort / totalEffort) * 100),
      totalEpics: releaseEpics.length,
      completedEpics: releaseEpics.filter((e) => e.status === 'Completed').length,
      totalRisks: release.risks.length,
      mitigatedRisks: release.risks.filter((r) => r.status === 'Resolved').length,
    }
  }, [selectedRelease])

  // Timeline data for visualization
  const timelineData = useMemo(() => {
    return releases.map((release) => {
      const duration = Math.ceil(
        (release.endDate.getTime() - release.startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      const elapsed = Math.ceil(
        (new Date().getTime() - release.startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      const percentComplete = Math.max(0, Math.min(100, (elapsed / duration) * 100))

      return {
        name: release.name,
        version: release.version,
        progress: release.progress,
        timeProgress: Math.round(percentComplete),
        startDate: release.startDate.toLocaleDateString(),
        endDate: release.endDate.toLocaleDateString(),
        phase: release.phase,
      }
    })
  }, [])

  // Feature breakdown by category
  const featureCategoryData = useMemo(() => {
    const categories = selectedRelease.features.reduce(
      (acc, feature) => {
        const category = feature.category
        if (!acc[category]) {
          acc[category] = { category, count: 0, effort: 0 }
        }
        acc[category].count++
        acc[category].effort += feature.effort
        return acc
      },
      {} as Record<string, { category: string; count: number; effort: number }>
    )

    return Object.values(categories)
  }, [selectedRelease])

  // Burnup chart data
  const burnupData = useMemo(() => {
    const releaseSprints = sprints.filter((s) => selectedRelease.sprints.includes(s.id))
    let cumulativeCompleted = 0
    const totalScope = selectedRelease.features.reduce((acc, f) => acc + f.effort, 0)

    return releaseSprints.map((sprint, index) => {
      cumulativeCompleted += sprint.velocity
      return {
        sprint: `S${sprint.number}`,
        completed: cumulativeCompleted,
        total: totalScope,
        ideal: Math.round((totalScope / releaseSprints.length) * (index + 1)),
      }
    })
  }, [selectedRelease])

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 dark:from-gray-900 dark:to-slate-900'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='mb-2 text-4xl font-bold text-gray-900 dark:text-white'>
          Release Planning Dashboard
        </h1>
        <p className='text-gray-600 dark:text-gray-400'>
          Plan, track, and manage releases with comprehensive visibility
        </p>
      </div>

      {/* Release Selector */}
      <div className='mb-6 flex flex-wrap gap-3'>
        {releases.map((release) => (
          <button
            key={release.id}
            onClick={() => setSelectedRelease(release)}
            className={`rounded-xl px-6 py-3 font-medium transition-all ${
              selectedRelease.id === release.id
                ? 'scale-105 bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:shadow-md dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            <div className='flex items-center gap-2'>
              <Package className='h-4 w-4' />
              <span>{release.name}</span>
              <span className='text-xs opacity-75'>{release.version}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        {/* Progress */}
        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30'>
              <TrendingUp className='h-6 w-6 text-blue-600 dark:text-blue-400' />
            </div>
            <span
              className='rounded-full px-3 py-1 text-xs font-semibold'
              style={{
                backgroundColor: `${HEALTH_COLORS[selectedRelease.healthStatus]}20`,
                color: HEALTH_COLORS[selectedRelease.healthStatus],
              }}
            >
              {selectedRelease.healthStatus}
            </span>
          </div>
          <h3 className='mb-1 text-2xl font-bold text-gray-900 dark:text-white'>
            {selectedRelease.progress}%
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>Overall Progress</p>
          <div className='mt-3 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
            <div
              className='h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all'
              style={{ width: `${selectedRelease.progress}%` }}
            />
          </div>
        </div>

        {/* Features */}
        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='rounded-xl bg-green-100 p-3 dark:bg-green-900/30'>
              <CheckCircle2 className='h-6 w-6 text-green-600 dark:text-green-400' />
            </div>
            <span className='text-2xl font-bold text-gray-400'>
              {releaseMetrics.completedFeatures}/{releaseMetrics.totalFeatures}
            </span>
          </div>
          <h3 className='mb-1 text-2xl font-bold text-gray-900 dark:text-white'>
            {releaseMetrics.featureCompletion}%
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>Features Completed</p>
          <div className='mt-3 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
            <div
              className='h-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all'
              style={{ width: `${releaseMetrics.featureCompletion}%` }}
            />
          </div>
        </div>

        {/* Sprints */}
        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='rounded-xl bg-purple-100 p-3 dark:bg-purple-900/30'>
              <Activity className='h-6 w-6 text-purple-600 dark:text-purple-400' />
            </div>
            <span className='text-2xl font-bold text-gray-400'>
              {releaseMetrics.completedSprints}/{releaseMetrics.totalSprints}
            </span>
          </div>
          <h3 className='mb-1 text-2xl font-bold text-gray-900 dark:text-white'>
            {releaseMetrics.avgVelocity}
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>Avg Velocity</p>
          <div className='mt-3 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
            <div
              className='h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all'
              style={{ width: `${releaseMetrics.sprintCompletion}%` }}
            />
          </div>
        </div>

        {/* Risks */}
        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='rounded-xl bg-orange-100 p-3 dark:bg-orange-900/30'>
              <AlertTriangle className='h-6 w-6 text-orange-600 dark:text-orange-400' />
            </div>
            <span className='text-2xl font-bold text-gray-400'>
              {releaseMetrics.mitigatedRisks}/{releaseMetrics.totalRisks}
            </span>
          </div>
          <h3 className='mb-1 text-2xl font-bold text-gray-900 dark:text-white'>
            {releaseMetrics.totalRisks}
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>Active Risks</p>
          <div className='mt-3 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
            <div
              className='h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all'
              style={{
                width: `${releaseMetrics.totalRisks > 0 ? (releaseMetrics.mitigatedRisks / releaseMetrics.totalRisks) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className='mb-6 flex w-fit gap-2 rounded-xl bg-white p-2 shadow-md dark:bg-gray-800'>
        {[
          { id: 'timeline', label: 'Timeline', icon: Calendar },
          { id: 'features', label: 'Features', icon: Target },
          { id: 'risks', label: 'Risks', icon: AlertTriangle },
          { id: 'metrics', label: 'Metrics', icon: BarChart3 },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id as any)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all ${
              view === id
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <Icon className='h-4 w-4' />
            {label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className='space-y-6'>
        {view === 'timeline' && (
          <>
            {/* Release Timeline */}
            <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
              <h2 className='mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white'>
                <Calendar className='h-6 w-6' />
                Release Timeline
              </h2>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={timelineData}>
                  <CartesianGrid strokeDasharray='3 3' opacity={0.1} />
                  <XAxis dataKey='name' />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey='progress'
                    fill='#3b82f6'
                    name='Work Progress'
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey='timeProgress'
                    fill='#8b5cf6'
                    name='Time Progress'
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Burnup Chart */}
            <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
              <h2 className='mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white'>
                <TrendingUp className='h-6 w-6' />
                Release Burnup Chart
              </h2>
              <ResponsiveContainer width='100%' height={300}>
                <AreaChart data={burnupData}>
                  <CartesianGrid strokeDasharray='3 3' opacity={0.1} />
                  <XAxis dataKey='sprint' />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                    }}
                  />
                  <Legend />
                  <Area
                    type='monotone'
                    dataKey='total'
                    stroke='#94a3b8'
                    fill='#cbd5e1'
                    name='Total Scope'
                  />
                  <Area
                    type='monotone'
                    dataKey='ideal'
                    stroke='#8b5cf6'
                    fill='#c4b5fd'
                    name='Ideal'
                  />
                  <Area
                    type='monotone'
                    dataKey='completed'
                    stroke='#10b981'
                    fill='#6ee7b7'
                    name='Completed'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {view === 'features' && (
          <>
            {/* Feature Categories */}
            <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
              <h2 className='mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white'>
                <Target className='h-6 w-6' />
                Feature Breakdown by Category
              </h2>
              <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                <ResponsiveContainer width='100%' height={300}>
                  <PieChart>
                    <Pie
                      data={featureCategoryData}
                      dataKey='count'
                      nameKey='category'
                      cx='50%'
                      cy='50%'
                      outerRadius={100}
                      label
                    >
                      {featureCategoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'][
                              index % 6
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className='space-y-3'>
                  {featureCategoryData.map((cat, index) => (
                    <div
                      key={cat.category}
                      className='rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50'
                    >
                      <div className='mb-2 flex items-center justify-between'>
                        <span className='font-semibold text-gray-900 dark:text-white'>
                          {cat.category}
                        </span>
                        <span className='text-sm text-gray-600 dark:text-gray-400'>
                          {cat.count} features • {cat.effort} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature List */}
            <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
              <h2 className='mb-6 text-2xl font-bold text-gray-900 dark:text-white'>Features</h2>
              <div className='space-y-3'>
                {selectedRelease.features.map((feature) => (
                  <div
                    key={feature.id}
                    className='rounded-xl bg-gray-50 p-4 transition-shadow hover:shadow-md dark:bg-gray-700/50'
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='mb-2 flex items-center gap-3'>
                          <h3 className='font-semibold text-gray-900 dark:text-white'>
                            {feature.name}
                          </h3>
                          <span
                            className='rounded-full px-2 py-1 text-xs font-semibold'
                            style={{
                              backgroundColor: `${PRIORITY_COLORS[feature.priority]}20`,
                              color: PRIORITY_COLORS[feature.priority],
                            }}
                          >
                            {feature.priority}
                          </span>
                          <span className='rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
                            {feature.category}
                          </span>
                        </div>
                        <p className='mb-2 text-sm text-gray-600 dark:text-gray-400'>
                          {feature.description}
                        </p>
                        <div className='flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400'>
                          <span>Effort: {feature.effort} pts</span>
                          <span>Value: {feature.value}/10</span>
                          {feature.dependencies.length > 0 && (
                            <span className='flex items-center gap-1'>
                              <GitBranch className='h-3 w-3' />
                              {feature.dependencies.length} dependencies
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {view === 'risks' && (
          <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
            <h2 className='mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white'>
              <AlertTriangle className='h-6 w-6' />
              Risk Management
            </h2>
            <div className='space-y-4'>
              {selectedRelease.risks.map((risk) => {
                const riskScore =
                  (risk.probability === 'High' ? 3 : risk.probability === 'Medium' ? 2 : 1) *
                  (risk.impact === 'High' ? 3 : risk.impact === 'Medium' ? 2 : 1)

                return (
                  <div
                    key={risk.id}
                    className='rounded-xl border-l-4 bg-gray-50 p-5 dark:bg-gray-700/50'
                    style={{
                      borderColor:
                        riskScore >= 6 ? '#ef4444' : riskScore >= 3 ? '#f59e0b' : '#10b981',
                    }}
                  >
                    <div className='mb-3 flex items-start justify-between'>
                      <div className='flex-1'>
                        <h3 className='mb-2 font-semibold text-gray-900 dark:text-white'>
                          {risk.description}
                        </h3>
                        <div className='mb-3 flex items-center gap-3'>
                          <span className='rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'>
                            {risk.probability} Probability
                          </span>
                          <span className='rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300'>
                            {risk.impact} Impact
                          </span>
                          <span className='rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
                            {risk.status}
                          </span>
                        </div>
                        <div className='text-sm text-gray-600 dark:text-gray-400'>
                          <strong>Mitigation:</strong> {risk.mitigation}
                        </div>
                        {risk.owner && (
                          <div className='mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
                            <Users className='h-3 w-3' />
                            <span>Owner: {risk.owner.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {view === 'metrics' && (
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* Effort Breakdown */}
            <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
              <h2 className='mb-6 text-2xl font-bold text-gray-900 dark:text-white'>
                Effort Distribution
              </h2>
              <ResponsiveContainer width='100%' height={250}>
                <BarChart data={featureCategoryData}>
                  <CartesianGrid strokeDasharray='3 3' opacity={0.1} />
                  <XAxis dataKey='category' />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                    }}
                  />
                  <Bar dataKey='effort' fill='#8b5cf6' radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Release Goals */}
            <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
              <h2 className='mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white'>
                <Target className='h-6 w-6' />
                Release Goals
              </h2>
              <div className='space-y-3'>
                {selectedRelease.goals.map((goal, index) => (
                  <div
                    key={index}
                    className='flex items-start gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50'
                  >
                    <div className='mt-0.5'>
                      <CheckCircle2 className='h-5 w-5 text-green-600 dark:text-green-400' />
                    </div>
                    <span className='text-gray-700 dark:text-gray-300'>{goal}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReleasePlanningDashboard
