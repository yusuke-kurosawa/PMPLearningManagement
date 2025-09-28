import React, { useState, useMemo } from 'react'
import {
  Calendar,
  Target,
  TrendingUp,
  Users,
  Clock,
  Activity,
  CheckCircle2,
  Circle,
  AlertCircle,
  Play,
  Pause,
  SkipForward,
  BarChart3,
  Zap,
  MessageSquare,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { sprints, userStories, velocityHistory, teamMembers } from '../../data/planningData'
import { Sprint, UserStory, SprintStatus } from '../../types/planning'

const STATUS_COLORS = {
  Planning: '#6366f1',
  Active: '#10b981',
  Review: '#8b5cf6',
  Completed: '#3b82f6',
  Cancelled: '#ef4444',
}

const STORY_STATUS_COLORS = {
  'Not Started': '#94a3b8',
  'In Progress': '#3b82f6',
  Completed: '#10b981',
  Blocked: '#ef4444',
  'On Hold': '#f59e0b',
}

const STORY_STATUS_ICONS = {
  'Not Started': Circle,
  'In Progress': Activity,
  Completed: CheckCircle2,
  Blocked: AlertCircle,
  'On Hold': Pause,
}

export const IterationPlanningDashboard: React.FC = () => {
  const [selectedSprint, setSelectedSprint] = useState<Sprint>(sprints[1]) // Active sprint
  const [view, setView] = useState<'board' | 'velocity' | 'capacity' | 'standup'>('board')
  const [selectedColumn, setSelectedColumn] = useState<string>('all')

  // Get stories for selected sprint
  const sprintStories = useMemo(() => {
    return userStories.filter((story) => selectedSprint.committedStories.includes(story.id))
  }, [selectedSprint])

  // Calculate sprint metrics
  const sprintMetrics = useMemo(() => {
    const stories = sprintStories
    const totalStories = stories.length
    const completedStories = stories.filter((s) => s.status === 'Completed').length
    const inProgressStories = stories.filter((s) => s.status === 'In Progress').length
    const blockedStories = stories.filter((s) => s.status === 'Blocked').length

    const totalPoints = stories.reduce((acc, s) => acc + s.storyPoints, 0)
    const completedPoints = stories
      .filter((s) => s.status === 'Completed')
      .reduce((acc, s) => acc + s.storyPoints, 0)

    const duration = Math.ceil(
      (selectedSprint.endDate.getTime() - selectedSprint.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    )
    const elapsed = Math.ceil(
      (new Date().getTime() - selectedSprint.startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    const daysRemaining = Math.max(0, duration - elapsed)
    const percentTimeElapsed = Math.max(0, Math.min(100, (elapsed / duration) * 100))

    return {
      totalStories,
      completedStories,
      inProgressStories,
      blockedStories,
      totalPoints,
      completedPoints,
      remainingPoints: totalPoints - completedPoints,
      percentComplete: Math.round((completedPoints / totalPoints) * 100) || 0,
      duration,
      elapsed,
      daysRemaining,
      percentTimeElapsed: Math.round(percentTimeElapsed),
      velocityTrend:
        completedPoints >= selectedSprint.targetVelocity
          ? 'above'
          : completedPoints >= selectedSprint.targetVelocity * 0.8
            ? 'on-track'
            : 'below',
      capacityUsed: Math.round((selectedSprint.actualEffort / selectedSprint.teamCapacity) * 100),
    }
  }, [selectedSprint, sprintStories])

  // Velocity trend data
  const velocityTrendData = useMemo(() => {
    const allSprints = [...velocityHistory, ...sprints.filter((s) => s.status === 'Completed')]
    return allSprints.map((sprint) => ({
      name: sprint.name || sprint.sprintName,
      planned: sprint.targetVelocity || sprint.planned,
      completed: sprint.velocity || sprint.completed,
    }))
  }, [])

  // Daily burndown calculation
  const burndownData = useMemo(() => {
    const duration = sprintMetrics.duration
    const totalPoints = sprintMetrics.totalPoints
    const currentCompleted = sprintMetrics.completedPoints

    const data = []
    for (let day = 0; day <= duration; day++) {
      const ideal = totalPoints - (totalPoints / duration) * day
      const actual = day <= sprintMetrics.elapsed ? totalPoints - currentCompleted : null

      data.push({
        day: `D${day}`,
        ideal: Math.max(0, Math.round(ideal)),
        actual: actual !== null ? Math.max(0, Math.round(actual)) : null,
      })
    }
    return data
  }, [sprintMetrics])

  // Team capacity breakdown
  const teamCapacityData = useMemo(() => {
    return teamMembers.map((member) => {
      const memberStories = sprintStories.filter((s) => s.assignee?.id === member.id)
      const committed = memberStories.reduce((acc, s) => acc + s.storyPoints, 0)
      const completed = memberStories
        .filter((s) => s.status === 'Completed')
        .reduce((acc, s) => acc + s.storyPoints, 0)

      return {
        name: member.name,
        capacity: member.capacity,
        committed: committed * 4, // Rough conversion: 1 point = 4 hours
        completed: completed * 4,
        available: member.capacity - committed * 4,
      }
    })
  }, [sprintStories])

  // Team performance radar
  const teamPerformanceData = useMemo(() => {
    return [
      {
        metric: 'Velocity',
        value: (sprintMetrics.completedPoints / sprintMetrics.totalPoints) * 100,
      },
      { metric: 'Quality', value: 85 }, // Mock data
      { metric: 'Capacity', value: sprintMetrics.capacityUsed },
      {
        metric: 'Predictability',
        value: (sprintMetrics.completedStories / sprintMetrics.totalStories) * 100 || 0,
      },
      { metric: 'Focus', value: sprintMetrics.blockedStories === 0 ? 100 : 70 },
    ]
  }, [sprintMetrics])

  // Group stories by status
  const storiesByStatus = useMemo(() => {
    return {
      'Not Started': sprintStories.filter((s) => s.status === 'Not Started'),
      'In Progress': sprintStories.filter((s) => s.status === 'In Progress'),
      Completed: sprintStories.filter((s) => s.status === 'Completed'),
      Blocked: sprintStories.filter((s) => s.status === 'Blocked'),
    }
  }, [sprintStories])

  const renderStoryCard = (story: UserStory) => {
    const StatusIcon = STORY_STATUS_ICONS[story.status]

    return (
      <div
        key={story.id}
        className='cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-600 dark:bg-gray-700'
      >
        <div className='mb-3 flex items-start justify-between'>
          <div className='flex items-center gap-2'>
            <StatusIcon className='h-4 w-4' style={{ color: STORY_STATUS_COLORS[story.status] }} />
            <span className='text-xs font-semibold text-gray-500 dark:text-gray-400'>
              {story.id.toUpperCase()}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='rounded bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
              {story.storyPoints}
            </span>
          </div>
        </div>
        <h4 className='mb-2 text-sm font-semibold text-gray-900 dark:text-white'>{story.title}</h4>
        <p className='mb-3 line-clamp-2 text-xs text-gray-600 dark:text-gray-400'>
          {story.description}
        </p>
        {story.assignee && (
          <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
            <Users className='h-3 w-3' />
            <span>{story.assignee.name}</span>
          </div>
        )}
        {story.blockers && story.blockers.length > 0 && (
          <div className='mt-2 rounded bg-red-100 px-2 py-1 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300'>
            {story.blockers.length} blocker(s)
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6 dark:from-gray-900 dark:to-slate-900'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='mb-2 text-4xl font-bold text-gray-900 dark:text-white'>
          Iteration Planning Dashboard
        </h1>
        <p className='text-gray-600 dark:text-gray-400'>
          Manage sprints, track velocity, and optimize team capacity
        </p>
      </div>

      {/* Sprint Selector */}
      <div className='mb-6 flex flex-wrap gap-3'>
        {sprints.map((sprint) => (
          <button
            key={sprint.id}
            onClick={() => setSelectedSprint(sprint)}
            className={`rounded-xl px-6 py-3 font-medium transition-all ${
              selectedSprint.id === sprint.id
                ? 'scale-105 bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:shadow-md dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            <div className='flex items-center gap-2'>
              <Activity className='h-4 w-4' />
              <span>{sprint.name}</span>
              <span
                className='rounded-full px-2 py-0.5 text-xs font-semibold'
                style={{
                  backgroundColor: `${STATUS_COLORS[sprint.status]}30`,
                  color: STATUS_COLORS[sprint.status],
                }}
              >
                {sprint.status}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Sprint Info Bar */}
      <div className='mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
          <div>
            <div className='mb-1 text-sm text-gray-600 dark:text-gray-400'>Sprint Goal</div>
            <div className='font-semibold text-gray-900 dark:text-white'>{selectedSprint.goal}</div>
          </div>
          <div>
            <div className='mb-1 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400'>
              <Calendar className='h-4 w-4' />
              Duration
            </div>
            <div className='font-semibold text-gray-900 dark:text-white'>
              {selectedSprint.startDate.toLocaleDateString()} -{' '}
              {selectedSprint.endDate.toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className='mb-1 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400'>
              <Clock className='h-4 w-4' />
              Time Remaining
            </div>
            <div className='font-semibold text-gray-900 dark:text-white'>
              {sprintMetrics.daysRemaining} days ({100 - sprintMetrics.percentTimeElapsed}%)
            </div>
          </div>
          <div>
            <div className='mb-1 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400'>
              <Zap className='h-4 w-4' />
              Velocity Target
            </div>
            <div className='font-semibold text-gray-900 dark:text-white'>
              {sprintMetrics.completedPoints} / {sprintMetrics.totalPoints} pts
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        {/* Story Progress */}
        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30'>
              <CheckCircle2 className='h-6 w-6 text-blue-600 dark:text-blue-400' />
            </div>
            <span className='text-2xl font-bold text-gray-400'>
              {sprintMetrics.completedStories}/{sprintMetrics.totalStories}
            </span>
          </div>
          <h3 className='mb-1 text-2xl font-bold text-gray-900 dark:text-white'>
            {Math.round((sprintMetrics.completedStories / sprintMetrics.totalStories) * 100) || 0}%
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>Stories Completed</p>
          <div className='mt-3 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
            <div
              className='h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all'
              style={{
                width: `${Math.round((sprintMetrics.completedStories / sprintMetrics.totalStories) * 100) || 0}%`,
              }}
            />
          </div>
        </div>

        {/* Velocity */}
        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='rounded-xl bg-green-100 p-3 dark:bg-green-900/30'>
              <TrendingUp className='h-6 w-6 text-green-600 dark:text-green-400' />
            </div>
            <span
              className='rounded-full px-3 py-1 text-xs font-semibold'
              style={{
                backgroundColor:
                  sprintMetrics.velocityTrend === 'above'
                    ? '#10b98120'
                    : sprintMetrics.velocityTrend === 'on-track'
                      ? '#3b82f620'
                      : '#f59e0b20',
                color:
                  sprintMetrics.velocityTrend === 'above'
                    ? '#10b981'
                    : sprintMetrics.velocityTrend === 'on-track'
                      ? '#3b82f6'
                      : '#f59e0b',
              }}
            >
              {sprintMetrics.velocityTrend}
            </span>
          </div>
          <h3 className='mb-1 text-2xl font-bold text-gray-900 dark:text-white'>
            {sprintMetrics.completedPoints}
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>Story Points Completed</p>
          <div className='mt-3 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
            <div
              className='h-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all'
              style={{ width: `${sprintMetrics.percentComplete}%` }}
            />
          </div>
        </div>

        {/* Capacity */}
        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='rounded-xl bg-purple-100 p-3 dark:bg-purple-900/30'>
              <Users className='h-6 w-6 text-purple-600 dark:text-purple-400' />
            </div>
            <span className='text-2xl font-bold text-gray-400'>
              {selectedSprint.actualEffort}/{selectedSprint.teamCapacity}h
            </span>
          </div>
          <h3 className='mb-1 text-2xl font-bold text-gray-900 dark:text-white'>
            {sprintMetrics.capacityUsed}%
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>Capacity Utilized</p>
          <div className='mt-3 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
            <div
              className='h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all'
              style={{ width: `${sprintMetrics.capacityUsed}%` }}
            />
          </div>
        </div>

        {/* Blockers */}
        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='rounded-xl bg-orange-100 p-3 dark:bg-orange-900/30'>
              <AlertCircle className='h-6 w-6 text-orange-600 dark:text-orange-400' />
            </div>
            <span className='text-2xl font-bold text-gray-400'>
              {sprintMetrics.inProgressStories}
            </span>
          </div>
          <h3 className='mb-1 text-2xl font-bold text-gray-900 dark:text-white'>
            {sprintMetrics.blockedStories}
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>Blocked Stories</p>
          <div className='mt-3 text-xs text-gray-500 dark:text-gray-400'>
            {sprintMetrics.inProgressStories} in progress
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className='mb-6 flex w-fit gap-2 rounded-xl bg-white p-2 shadow-md dark:bg-gray-800'>
        {[
          { id: 'board', label: 'Sprint Board', icon: Target },
          { id: 'velocity', label: 'Velocity', icon: TrendingUp },
          { id: 'capacity', label: 'Capacity', icon: Users },
          { id: 'standup', label: 'Daily Standup', icon: MessageSquare },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id as any)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all ${
              view === id
                ? 'bg-purple-600 text-white shadow-md'
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
        {view === 'board' && (
          <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
            <h2 className='mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white'>
              <Target className='h-6 w-6' />
              Sprint Board
            </h2>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
              {Object.entries(storiesByStatus).map(([status, stories]) => (
                <div key={status} className='flex flex-col'>
                  <div
                    className='mb-2 rounded-t-xl p-3 font-semibold text-white'
                    style={{
                      backgroundColor:
                        STORY_STATUS_COLORS[status as keyof typeof STORY_STATUS_COLORS],
                    }}
                  >
                    <div className='flex items-center justify-between'>
                      <span>{status}</span>
                      <span className='rounded-full bg-white/20 px-2 py-0.5 text-xs'>
                        {stories.length}
                      </span>
                    </div>
                  </div>
                  <div className='flex-1 space-y-3'>
                    {stories.map((story) => renderStoryCard(story))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'velocity' && (
          <>
            {/* Velocity Trend */}
            <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
              <h2 className='mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white'>
                <TrendingUp className='h-6 w-6' />
                Velocity Trend
              </h2>
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={velocityTrendData}>
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
                  <Line
                    type='monotone'
                    dataKey='planned'
                    stroke='#8b5cf6'
                    strokeWidth={2}
                    name='Planned'
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

            {/* Burndown Chart */}
            <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
              <h2 className='mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white'>
                <Activity className='h-6 w-6' />
                Sprint Burndown
              </h2>
              <ResponsiveContainer width='100%' height={300}>
                <AreaChart data={burndownData}>
                  <CartesianGrid strokeDasharray='3 3' opacity={0.1} />
                  <XAxis dataKey='day' />
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
                    dataKey='ideal'
                    stroke='#94a3b8'
                    fill='#cbd5e1'
                    name='Ideal'
                  />
                  <Area
                    type='monotone'
                    dataKey='actual'
                    stroke='#3b82f6'
                    fill='#93c5fd'
                    name='Actual'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {view === 'capacity' && (
          <>
            {/* Team Capacity */}
            <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
              <h2 className='mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white'>
                <Users className='h-6 w-6' />
                Team Capacity Allocation
              </h2>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={teamCapacityData}>
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
                    dataKey='capacity'
                    fill='#94a3b8'
                    name='Total Capacity'
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar dataKey='committed' fill='#3b82f6' name='Committed' radius={[8, 8, 0, 0]} />
                  <Bar dataKey='completed' fill='#10b981' name='Completed' radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Team Performance Radar */}
            <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
              <h2 className='mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white'>
                <BarChart3 className='h-6 w-6' />
                Team Performance Metrics
              </h2>
              <ResponsiveContainer width='100%' height={400}>
                <RadarChart data={teamPerformanceData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey='metric' />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name='Performance'
                    dataKey='value'
                    stroke='#8b5cf6'
                    fill='#8b5cf6'
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {view === 'standup' && (
          <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
            <h2 className='mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white'>
              <MessageSquare className='h-6 w-6' />
              Daily Standup Tracker
            </h2>
            <div className='space-y-6'>
              {teamMembers.map((member) => {
                const memberStories = sprintStories.filter((s) => s.assignee?.id === member.id)
                const activeStory = memberStories.find((s) => s.status === 'In Progress')

                return (
                  <div key={member.id} className='rounded-xl bg-gray-50 p-5 dark:bg-gray-700/50'>
                    <div className='mb-4 flex items-start justify-between'>
                      <div>
                        <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                          {member.name}
                        </h3>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>{member.role}</p>
                      </div>
                      <div className='text-right'>
                        <div className='text-sm text-gray-600 dark:text-gray-400'>
                          Assigned Stories
                        </div>
                        <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                          {memberStories.length}
                        </div>
                      </div>
                    </div>
                    <div className='space-y-3'>
                      <div className='rounded-lg bg-white p-3 dark:bg-gray-800'>
                        <div className='mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400'>
                          Currently Working On
                        </div>
                        {activeStory ? (
                          <div className='text-sm text-gray-900 dark:text-white'>
                            {activeStory.title}
                          </div>
                        ) : (
                          <div className='text-sm italic text-gray-500 dark:text-gray-400'>
                            No active story
                          </div>
                        )}
                      </div>
                      <div className='rounded-lg bg-white p-3 dark:bg-gray-800'>
                        <div className='mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400'>
                          Progress
                        </div>
                        <div className='text-sm text-gray-900 dark:text-white'>
                          {memberStories.filter((s) => s.status === 'Completed').length} completed,{' '}
                          {memberStories.filter((s) => s.status === 'In Progress').length} in
                          progress
                        </div>
                      </div>
                      {memberStories.some((s) => s.blockers && s.blockers.length > 0) && (
                        <div className='rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20'>
                          <div className='mb-1 text-xs font-semibold text-red-600 dark:text-red-400'>
                            Blockers
                          </div>
                          {memberStories
                            .filter((s) => s.blockers && s.blockers.length > 0)
                            .map((s) => (
                              <div key={s.id} className='text-sm text-red-700 dark:text-red-300'>
                                {s.title}: {s.blockers?.join(', ')}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default IterationPlanningDashboard
