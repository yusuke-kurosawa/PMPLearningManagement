import React, { useState, useMemo } from 'react'
import {
  Package,
  Target,
  CheckCircle2,
  Circle,
  AlertCircle,
  TrendingUp,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Star,
  Calendar,
  Users,
  GitBranch,
  Zap,
  BarChart3,
  Layers,
} from 'lucide-react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ZAxis,
  BarChart,
  Bar,
} from 'recharts'
import { epics, userStories, backlogItems } from '../../data/planningData'
import { UserStory, Epic, BacklogItem, Priority } from '../../types/planning'

const PRIORITY_COLORS = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#22c55e',
}

const PRIORITY_SCORE = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
}

const STORY_SIZES: number[] = [1, 2, 3, 5, 8, 13, 21]

export const UserStoryBacklog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEpic, setSelectedEpic] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'priority' | 'points' | 'value'>('priority')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [view, setView] = useState<'list' | 'matrix' | 'invest' | 'poker'>('list')
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null)
  const [estimationSession, setEstimationSession] = useState<number | null>(null)

  // Filter and sort stories
  const filteredStories = useMemo(() => {
    const filtered = userStories.filter((story) => {
      const matchesSearch =
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesEpic = selectedEpic === 'all' || story.epicId === selectedEpic
      const matchesPriority = selectedPriority === 'all' || story.priority === selectedPriority

      return matchesSearch && matchesEpic && matchesPriority
    })

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      if (sortBy === 'priority') {
        comparison = PRIORITY_SCORE[a.priority] - PRIORITY_SCORE[b.priority]
      } else if (sortBy === 'points') {
        comparison = a.storyPoints - b.storyPoints
      } else if (sortBy === 'value') {
        const epicA = epics.find((e) => e.id === a.epicId)
        const epicB = epics.find((e) => e.id === b.epicId)
        comparison = (epicA?.businessValue || 0) - (epicB?.businessValue || 0)
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [userStories, searchTerm, selectedEpic, selectedPriority, sortBy, sortOrder])

  // Priority Matrix data (Value vs Effort)
  const priorityMatrixData = useMemo(() => {
    return userStories.map((story) => {
      const epic = epics.find((e) => e.id === story.epicId)
      return {
        id: story.id,
        title: story.title,
        effort: story.storyPoints,
        value: epic?.businessValue || 5,
        priority: story.priority,
        status: story.status,
      }
    })
  }, [])

  // INVEST Criteria scoring
  const calculateInvestScore = (story: UserStory): number => {
    // Simplified INVEST scoring
    let score = 0

    // Independent: Has few dependencies
    if (story.dependencies.length <= 1) {
      score += 16.67
    }

    // Negotiable: Can be refined
    score += 16.67

    // Valuable: Based on epic business value
    const epic = epics.find((e) => e.id === story.epicId)
    if (epic && epic.businessValue >= 7) {
      score += 16.67
    }

    // Estimable: Has story points
    if (story.storyPoints > 0) {
      score += 16.67
    }

    // Small: Story points <= 8
    if (story.storyPoints <= 8) {
      score += 16.67
    }

    // Testable: Has acceptance criteria
    if (story.acceptanceCriteria.length >= 2) {
      score += 16.67
    }

    return Math.round(score)
  }

  // Story statistics
  const backlogStats = useMemo(() => {
    const total = userStories.length
    const byPriority = {
      Critical: userStories.filter((s) => s.priority === 'Critical').length,
      High: userStories.filter((s) => s.priority === 'High').length,
      Medium: userStories.filter((s) => s.priority === 'Medium').length,
      Low: userStories.filter((s) => s.priority === 'Low').length,
    }
    const totalPoints = userStories.reduce((acc, s) => acc + s.storyPoints, 0)
    const avgPoints = Math.round(totalPoints / total)
    const notStarted = userStories.filter((s) => s.status === 'Not Started').length

    return {
      total,
      byPriority,
      totalPoints,
      avgPoints,
      notStarted,
      readyForSprint: userStories.filter(
        (s) =>
          s.status === 'Not Started' &&
          s.acceptanceCriteria.length >= 2 &&
          s.dependencies.length <= 1
      ).length,
    }
  }, [])

  const renderStoryCard = (story: UserStory, showDetails = false) => {
    const epic = epics.find((e) => e.id === story.epicId)
    const investScore = calculateInvestScore(story)

    return (
      <div
        key={story.id}
        onClick={() => setSelectedStory(story)}
        className={`cursor-pointer rounded-xl border-2 bg-white p-5 shadow-sm transition-all dark:bg-gray-800 ${
          selectedStory?.id === story.id
            ? 'border-blue-500 shadow-lg dark:border-blue-400'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:hover:border-gray-600'
        }`}
      >
        <div className='mb-3 flex items-start justify-between'>
          <div className='flex items-center gap-2'>
            <span className='text-xs font-bold text-gray-500 dark:text-gray-400'>
              {story.id.toUpperCase()}
            </span>
            <span
              className='rounded-full px-2 py-1 text-xs font-semibold'
              style={{
                backgroundColor: `${PRIORITY_COLORS[story.priority]}20`,
                color: PRIORITY_COLORS[story.priority],
              }}
            >
              {story.priority}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='rounded-lg bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
              {story.storyPoints} pts
            </span>
          </div>
        </div>

        <h3 className='mb-2 font-semibold text-gray-900 dark:text-white'>{story.title}</h3>

        {showDetails && (
          <>
            <div className='mb-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-700/50 dark:text-gray-300'>
              <div className='mb-1'>
                <span className='font-semibold'>As a</span> {story.asA},
              </div>
              <div className='mb-1'>
                <span className='font-semibold'>I want</span> {story.iWant},
              </div>
              <div>
                <span className='font-semibold'>So that</span> {story.soThat}.
              </div>
            </div>

            <div className='mb-3'>
              <div className='mb-2 text-xs font-semibold text-gray-600 dark:text-gray-400'>
                Acceptance Criteria
              </div>
              <div className='space-y-1'>
                {story.acceptanceCriteria.map((ac) => (
                  <div key={ac.id} className='flex items-start gap-2 text-sm'>
                    {ac.isMet ? (
                      <CheckCircle2 className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-600' />
                    ) : (
                      <Circle className='mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400' />
                    )}
                    <span className='text-gray-700 dark:text-gray-300'>{ac.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className='flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400'>
          {epic && (
            <div className='flex items-center gap-1'>
              <Package className='h-3 w-3' />
              <span>{epic.title}</span>
            </div>
          )}
          {story.assignee && (
            <div className='flex items-center gap-1'>
              <Users className='h-3 w-3' />
              <span>{story.assignee.name}</span>
            </div>
          )}
          {story.dependencies.length > 0 && (
            <div className='flex items-center gap-1'>
              <GitBranch className='h-3 w-3' />
              <span>{story.dependencies.length} deps</span>
            </div>
          )}
          <div className='flex items-center gap-1'>
            <Star className='h-3 w-3' />
            <span>INVEST: {investScore}%</span>
          </div>
        </div>

        <div className='mt-3 flex items-center gap-2'>
          {story.tags.map((tag) => (
            <span
              key={tag}
              className='rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-6 dark:from-gray-900 dark:to-slate-900'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='mb-2 text-4xl font-bold text-gray-900 dark:text-white'>
          User Story Backlog
        </h1>
        <p className='text-gray-600 dark:text-gray-400'>
          Manage, prioritize, and estimate user stories with INVEST criteria
        </p>
      </div>

      {/* Stats */}
      <div className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
        <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                {backlogStats.total}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>Total Stories</div>
            </div>
            <Target className='h-8 w-8 text-blue-600 dark:text-blue-400' />
          </div>
        </div>

        <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                {backlogStats.totalPoints}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>Total Points</div>
            </div>
            <Zap className='h-8 w-8 text-yellow-600 dark:text-yellow-400' />
          </div>
        </div>

        <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                {backlogStats.avgPoints}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>Avg Points</div>
            </div>
            <BarChart3 className='h-8 w-8 text-purple-600 dark:text-purple-400' />
          </div>
        </div>

        <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                {backlogStats.notStarted}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>Not Started</div>
            </div>
            <Circle className='h-8 w-8 text-gray-600 dark:text-gray-400' />
          </div>
        </div>

        <div className='rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                {backlogStats.readyForSprint}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>Sprint Ready</div>
            </div>
            <CheckCircle2 className='h-8 w-8 text-green-600 dark:text-green-400' />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className='mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
        <div className='flex flex-wrap gap-4'>
          {/* Search */}
          <div className='min-w-[200px] flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
              <input
                type='text'
                placeholder='Search stories...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
              />
            </div>
          </div>

          {/* Epic Filter */}
          <select
            value={selectedEpic}
            onChange={(e) => setSelectedEpic(e.target.value)}
            className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
          >
            <option value='all'>All Epics</option>
            {epics.map((epic) => (
              <option key={epic.id} value={epic.id}>
                {epic.title}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
          >
            <option value='all'>All Priorities</option>
            <option value='Critical'>Critical</option>
            <option value='High'>High</option>
            <option value='Medium'>Medium</option>
            <option value='Low'>Low</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
          >
            <option value='priority'>Sort by Priority</option>
            <option value='points'>Sort by Points</option>
            <option value='value'>Sort by Value</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className='rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          >
            {sortOrder === 'asc' ? (
              <SortAsc className='h-5 w-5' />
            ) : (
              <SortDesc className='h-5 w-5' />
            )}
          </button>
        </div>
      </div>

      {/* View Selector */}
      <div className='mb-6 flex w-fit gap-2 rounded-xl bg-white p-2 shadow-md dark:bg-gray-800'>
        {[
          { id: 'list', label: 'List View', icon: Layers },
          { id: 'matrix', label: 'Priority Matrix', icon: BarChart3 },
          { id: 'invest', label: 'INVEST Analysis', icon: CheckCircle2 },
          { id: 'poker', label: 'Planning Poker', icon: Target },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id as any)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all ${
              view === id
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <Icon className='h-4 w-4' />
            {label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      {view === 'list' && (
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          <div className='lg:col-span-2'>
            <div className='space-y-4'>
              {filteredStories.map((story) => renderStoryCard(story))}
            </div>
          </div>

          {/* Story Details Sidebar */}
          {selectedStory && (
            <div className='lg:col-span-1'>
              <div className='sticky top-6 rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
                <h3 className='mb-4 text-xl font-bold text-gray-900 dark:text-white'>
                  Story Details
                </h3>
                {renderStoryCard(selectedStory, true)}
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'matrix' && (
        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
          <h2 className='mb-6 text-2xl font-bold text-gray-900 dark:text-white'>
            Value vs Effort Matrix
          </h2>
          <ResponsiveContainer width='100%' height={500}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
              <CartesianGrid strokeDasharray='3 3' opacity={0.1} />
              <XAxis
                type='number'
                dataKey='effort'
                name='Effort (Story Points)'
                label={{ value: 'Effort (Story Points)', position: 'bottom', offset: 40 }}
              />
              <YAxis
                type='number'
                dataKey='value'
                name='Business Value'
                label={{ value: 'Business Value', angle: -90, position: 'left', offset: 40 }}
              />
              <ZAxis type='number' range={[100, 400]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className='rounded-lg bg-gray-900 p-3 text-white shadow-lg'>
                        <div className='mb-1 font-semibold'>{data.title}</div>
                        <div className='text-sm'>Effort: {data.effort} points</div>
                        <div className='text-sm'>Value: {data.value}/10</div>
                        <div className='text-sm'>Priority: {data.priority}</div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Scatter name='Stories' data={priorityMatrixData}>
                {priorityMatrixData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.priority as Priority]} />
                ))}
              </Scatter>
              {/* Quadrant lines */}
              <line
                x1='0'
                y1='50%'
                x2='100%'
                y2='50%'
                stroke='#94a3b8'
                strokeWidth={2}
                strokeDasharray='5 5'
              />
              <line
                x1='50%'
                y1='0'
                x2='50%'
                y2='100%'
                stroke='#94a3b8'
                strokeWidth={2}
                strokeDasharray='5 5'
              />
            </ScatterChart>
          </ResponsiveContainer>
          <div className='mt-6 grid grid-cols-2 gap-4 text-sm'>
            <div className='rounded-lg bg-green-50 p-4 dark:bg-green-900/20'>
              <div className='mb-1 font-semibold text-green-900 dark:text-green-100'>
                Quick Wins (High Value, Low Effort)
              </div>
              <div className='text-green-700 dark:text-green-300'>Prioritize these first</div>
            </div>
            <div className='rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20'>
              <div className='mb-1 font-semibold text-blue-900 dark:text-blue-100'>
                Major Projects (High Value, High Effort)
              </div>
              <div className='text-blue-700 dark:text-blue-300'>Plan carefully and execute</div>
            </div>
            <div className='rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20'>
              <div className='mb-1 font-semibold text-yellow-900 dark:text-yellow-100'>
                Fill-Ins (Low Value, Low Effort)
              </div>
              <div className='text-yellow-700 dark:text-yellow-300'>Use to fill capacity</div>
            </div>
            <div className='rounded-lg bg-red-50 p-4 dark:bg-red-900/20'>
              <div className='mb-1 font-semibold text-red-900 dark:text-red-100'>
                Time Sinks (Low Value, High Effort)
              </div>
              <div className='text-red-700 dark:text-red-300'>Avoid or reconsider</div>
            </div>
          </div>
        </div>
      )}

      {view === 'invest' && (
        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
          <h2 className='mb-6 text-2xl font-bold text-gray-900 dark:text-white'>
            INVEST Criteria Analysis
          </h2>
          <div className='mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20'>
            <h3 className='mb-2 font-semibold text-blue-900 dark:text-blue-100'>
              INVEST Principles
            </h3>
            <div className='grid grid-cols-2 gap-3 text-sm text-blue-700 dark:text-blue-300 md:grid-cols-3'>
              <div>
                <strong>I</strong>ndependent - Can be developed independently
              </div>
              <div>
                <strong>N</strong>egotiable - Details can be refined
              </div>
              <div>
                <strong>V</strong>aluable - Delivers value to stakeholders
              </div>
              <div>
                <strong>E</strong>stimable - Can be estimated accurately
              </div>
              <div>
                <strong>S</strong>mall - Can be completed in one sprint
              </div>
              <div>
                <strong>T</strong>estable - Has clear acceptance criteria
              </div>
            </div>
          </div>
          <div className='space-y-3'>
            {filteredStories.map((story) => {
              const investScore = calculateInvestScore(story)
              return (
                <div
                  key={story.id}
                  className='flex items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50'
                >
                  <div className='flex-1'>
                    <div className='mb-2 flex items-center gap-3'>
                      <span className='text-xs font-bold text-gray-500 dark:text-gray-400'>
                        {story.id.toUpperCase()}
                      </span>
                      <span className='font-semibold text-gray-900 dark:text-white'>
                        {story.title}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700'>
                        <div
                          className='h-2 rounded-full transition-all'
                          style={{
                            width: `${investScore}%`,
                            backgroundColor:
                              investScore >= 80
                                ? '#10b981'
                                : investScore >= 60
                                  ? '#eab308'
                                  : '#f59e0b',
                          }}
                        />
                      </div>
                      <span className='w-12 text-sm font-semibold text-gray-700 dark:text-gray-300'>
                        {investScore}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {view === 'poker' && (
        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800'>
          <h2 className='mb-6 text-2xl font-bold text-gray-900 dark:text-white'>
            Planning Poker Estimation
          </h2>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
            {/* Story to Estimate */}
            <div className='lg:col-span-2'>
              {selectedStory ? (
                <>
                  <div className='mb-6'>{renderStoryCard(selectedStory, true)}</div>
                  <div className='mb-6'>
                    <h3 className='mb-4 font-semibold text-gray-900 dark:text-white'>
                      Select Story Points (Fibonacci)
                    </h3>
                    <div className='grid grid-cols-4 gap-3 md:grid-cols-7'>
                      {STORY_SIZES.map((size) => (
                        <button
                          key={size}
                          onClick={() => setEstimationSession(size)}
                          className={`aspect-square rounded-xl text-2xl font-bold transition-all ${
                            estimationSession === size
                              ? 'scale-110 bg-blue-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:scale-105 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                  {estimationSession && (
                    <div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <div className='font-semibold text-green-900 dark:text-green-100'>
                            Estimation: {estimationSession} story points
                          </div>
                          <div className='text-sm text-green-700 dark:text-green-300'>
                            Click to confirm and move to next story
                          </div>
                        </div>
                        <button className='rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700'>
                          Confirm
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className='py-12 text-center text-gray-500 dark:text-gray-400'>
                  Select a story from the list to start estimation
                </div>
              )}
            </div>

            {/* Story List */}
            <div className='lg:col-span-1'>
              <h3 className='mb-4 font-semibold text-gray-900 dark:text-white'>
                Unestimated Stories
              </h3>
              <div className='max-h-[600px] space-y-2 overflow-y-auto'>
                {filteredStories
                  .filter((s) => s.status === 'Not Started')
                  .map((story) => (
                    <button
                      key={story.id}
                      onClick={() => setSelectedStory(story)}
                      className={`w-full rounded-lg p-3 text-left transition-all ${
                        selectedStory?.id === story.id
                          ? 'border-2 border-blue-500 bg-blue-100 dark:bg-blue-900/30'
                          : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className='mb-1 text-sm font-semibold text-gray-900 dark:text-white'>
                        {story.title}
                      </div>
                      <div className='text-xs text-gray-600 dark:text-gray-400'>
                        {story.id.toUpperCase()} • {story.priority}
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserStoryBacklog
