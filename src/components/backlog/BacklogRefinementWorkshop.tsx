/**
 * Backlog Refinement Workshop Component
 * Tools for story refinement sessions with INVEST criteria and Definition of Ready
 */

import React, { useState } from 'react'
import {
  CheckCircle2,
  Circle,
  Split,
  Scale,
  Users,
  FileText,
  Zap,
  Target,
  AlertTriangle,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react'
import {
  UserStory,
  RefinementChecklist,
  SplittingPattern,
  AcceptanceCriteria,
} from '../../types/backlog'
import { mockUserStories } from '../../data/backlogData'

const INVEST_CRITERIA = [
  { key: 'independent', label: 'Independent', description: 'Can be developed independently' },
  { key: 'negotiable', label: 'Negotiable', description: 'Details can be negotiated' },
  { key: 'valuable', label: 'Valuable', description: 'Delivers value to users/stakeholders' },
  { key: 'estimable', label: 'Estimable', description: 'Can be estimated by the team' },
  { key: 'small', label: 'Small', description: 'Can be completed in one sprint' },
  { key: 'testable', label: 'Testable', description: 'Has clear acceptance criteria' },
]

const SPLITTING_PATTERNS: {
  pattern: SplittingPattern
  label: string
  description: string
  example: string
}[] = [
  {
    pattern: 'workflow-steps',
    label: 'Workflow Steps',
    description: 'Split by steps in a workflow',
    example: 'Register → Verify Email → Complete Profile',
  },
  {
    pattern: 'business-rules',
    label: 'Business Rules',
    description: 'Split by different business rules',
    example: 'Basic user → Premium user → Enterprise user',
  },
  {
    pattern: 'happy-sad-paths',
    label: 'Happy/Sad Paths',
    description: 'Split by success and error scenarios',
    example: 'Success case → Error handling → Edge cases',
  },
  {
    pattern: 'simple-complex',
    label: 'Simple/Complex',
    description: 'Start with simple version, add complexity',
    example: 'Basic search → Advanced filters → AI suggestions',
  },
  {
    pattern: 'data-variations',
    label: 'Data Variations',
    description: 'Split by data types or sources',
    example: 'Text data → Images → Video → Files',
  },
  {
    pattern: 'operations-crud',
    label: 'CRUD Operations',
    description: 'Split by Create, Read, Update, Delete',
    example: 'View → Create → Edit → Delete',
  },
  {
    pattern: 'defer-performance',
    label: 'Defer Performance',
    description: 'Start with working solution, optimize later',
    example: 'Working solution → Performance optimization',
  },
  {
    pattern: 'spike-implementation',
    label: 'Spike + Implementation',
    description: 'Research spike before implementation',
    example: 'Technical spike → Implementation',
  },
]

export const BacklogRefinementWorkshop: React.FC = () => {
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(mockUserStories[0])
  const [investChecks, setInvestChecks] = useState<Record<string, boolean>>({})
  const [readinessChecks, setReadinessChecks] = useState<Record<string, boolean>>({})
  const [selectedPattern, setSelectedPattern] = useState<SplittingPattern | null>(null)
  const [newAcceptanceCriteria, setNewAcceptanceCriteria] = useState('')
  const [estimationVotes, setEstimationVotes] = useState<Record<string, number>>({})

  // Calculate readiness score
  const readinessScore = useMemo(() => {
    if (!selectedStory) {
      return 0
    }
    const checks = [
      selectedStory.description.length > 20,
      selectedStory.acceptanceCriteria.length >= 3,
      selectedStory.storyPoints !== undefined,
      selectedStory.priority !== undefined,
      selectedStory.dependencies.length === 0 || selectedStory.dependencies.every((d) => d !== ''),
      Object.values(investChecks).filter(Boolean).length >= 4,
    ]
    return (checks.filter(Boolean).length / checks.length) * 100
  }, [selectedStory, investChecks])

  // Calculate INVEST score
  const investScore = useMemo(() => {
    const total = INVEST_CRITERIA.length
    const checked = Object.values(investChecks).filter(Boolean).length
    return (checked / total) * 100
  }, [investChecks])

  // Handle INVEST check toggle
  const toggleInvestCheck = (key: string) => {
    setInvestChecks((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Fibonacci sequence for estimation
  const fibonacciSequence = [1, 2, 3, 5, 8, 13, 21]

  // Cast estimation vote
  const voteEstimation = (memberId: string, points: number) => {
    setEstimationVotes((prev) => ({ ...prev, [memberId]: points }))
  }

  // Calculate average estimation
  const averageEstimation = useMemo(() => {
    const votes = Object.values(estimationVotes)
    if (votes.length === 0) {
      return 0
    }
    return Math.round(votes.reduce((sum, v) => sum + v, 0) / votes.length)
  }, [estimationVotes])

  if (!selectedStory) {
    return null
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='mx-auto max-w-7xl'>
        {/* Header */}
        <div className='mb-6'>
          <h1 className='mb-2 text-3xl font-bold text-gray-900'>Backlog Refinement Workshop</h1>
          <p className='text-gray-600'>
            Collaborative story refinement with INVEST criteria and Definition of Ready
          </p>
        </div>

        {/* Story Selector */}
        <div className='mb-6 rounded-lg bg-white p-4 shadow'>
          <label className='mb-2 block text-sm font-medium text-gray-700'>
            Select Story to Refine
          </label>
          <select
            value={selectedStory.id}
            onChange={(e) => {
              const story = mockUserStories.find((s) => s.id === e.target.value)
              if (story) {
                setSelectedStory(story)
                setInvestChecks({})
                setEstimationVotes({})
              }
            }}
            className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none'
          >
            {mockUserStories.slice(0, 10).map((story) => (
              <option key={story.id} value={story.id}>
                {story.title} - {story.status}
              </option>
            ))}
          </select>
        </div>

        <div className='grid gap-6 lg:grid-cols-3'>
          {/* Left Column - Story Details */}
          <div className='space-y-6 lg:col-span-2'>
            {/* Story Card */}
            <div className='rounded-lg bg-white p-6 shadow'>
              <h2 className='mb-4 text-xl font-semibold text-gray-900'>{selectedStory.title}</h2>
              <div className='mb-4 rounded-lg bg-blue-50 p-4'>
                <p className='text-sm text-gray-700'>
                  <span className='font-semibold'>As a</span> {selectedStory.asA},{' '}
                  <span className='font-semibold'>I want</span> {selectedStory.iWant},{' '}
                  <span className='font-semibold'>so that</span> {selectedStory.soThat}
                </p>
              </div>
              <p className='text-gray-700'>{selectedStory.description}</p>
            </div>

            {/* INVEST Criteria */}
            <div className='rounded-lg bg-white p-6 shadow'>
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-gray-900'>INVEST Criteria</h3>
                <div className='flex items-center gap-2'>
                  <div className='text-2xl font-bold text-blue-600'>{investScore.toFixed(0)}%</div>
                  <div className='text-xs text-gray-500'>Score</div>
                </div>
              </div>
              <div className='space-y-3'>
                {INVEST_CRITERIA.map((criterion) => (
                  <div
                    key={criterion.key}
                    className='flex items-start gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50'
                  >
                    <button
                      onClick={() => toggleInvestCheck(criterion.key)}
                      className='mt-0.5 flex-shrink-0'
                    >
                      {investChecks[criterion.key] ? (
                        <CheckCircle2 className='h-6 w-6 text-green-600' />
                      ) : (
                        <Circle className='h-6 w-6 text-gray-400' />
                      )}
                    </button>
                    <div className='flex-1'>
                      <div className='font-semibold text-gray-900'>{criterion.label}</div>
                      <div className='text-sm text-gray-600'>{criterion.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Acceptance Criteria */}
            <div className='rounded-lg bg-white p-6 shadow'>
              <h3 className='mb-4 text-lg font-semibold text-gray-900'>Acceptance Criteria</h3>
              <div className='mb-4 space-y-2'>
                {selectedStory.acceptanceCriteria.map((ac) => (
                  <div
                    key={ac.id}
                    className='flex items-start gap-3 rounded-lg border border-gray-200 p-3'
                  >
                    <input type='checkbox' checked={ac.completed} readOnly className='mt-1' />
                    <span className='flex-1 text-sm text-gray-700'>{ac.description}</span>
                  </div>
                ))}
              </div>

              <div className='flex gap-2'>
                <input
                  type='text'
                  placeholder='Add new acceptance criterion...'
                  value={newAcceptanceCriteria}
                  onChange={(e) => setNewAcceptanceCriteria(e.target.value)}
                  className='flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none'
                />
                <button className='rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'>
                  Add
                </button>
              </div>
            </div>

            {/* Story Splitting */}
            <div className='rounded-lg bg-white p-6 shadow'>
              <div className='mb-4 flex items-center gap-2'>
                <Split className='h-5 w-5 text-purple-600' />
                <h3 className='text-lg font-semibold text-gray-900'>Story Splitting Patterns</h3>
              </div>
              <p className='mb-4 text-sm text-gray-600'>
                If the story is too large, use these patterns to split it into smaller stories
              </p>
              <div className='grid gap-3 md:grid-cols-2'>
                {SPLITTING_PATTERNS.map((pattern) => (
                  <button
                    key={pattern.pattern}
                    onClick={() => setSelectedPattern(pattern.pattern)}
                    className={`rounded-lg border-2 p-4 text-left transition-colors ${
                      selectedPattern === pattern.pattern
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    <div className='mb-1 font-semibold text-gray-900'>{pattern.label}</div>
                    <div className='mb-2 text-xs text-gray-600'>{pattern.description}</div>
                    <div className='text-xs text-purple-700'>Example: {pattern.example}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Refinement Tools */}
          <div className='space-y-6'>
            {/* Readiness Score */}
            <div className='rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 p-6 text-white shadow'>
              <div className='mb-2 flex items-center gap-2'>
                <Target className='h-5 w-5' />
                <h3 className='text-lg font-semibold'>Definition of Ready</h3>
              </div>
              <div className='mb-4 text-5xl font-bold'>{readinessScore.toFixed(0)}%</div>
              <div className='h-2 w-full rounded-full bg-white/30'>
                <div
                  className='h-2 rounded-full bg-white transition-all'
                  style={{ width: `${readinessScore}%` }}
                />
              </div>
              <div className='mt-4 space-y-2 text-sm'>
                <div className='flex items-center gap-2'>
                  {selectedStory.description.length > 20 ? (
                    <CheckCircle2 className='h-4 w-4' />
                  ) : (
                    <Circle className='h-4 w-4' />
                  )}
                  Clear description
                </div>
                <div className='flex items-center gap-2'>
                  {selectedStory.acceptanceCriteria.length >= 3 ? (
                    <CheckCircle2 className='h-4 w-4' />
                  ) : (
                    <Circle className='h-4 w-4' />
                  )}
                  Acceptance criteria (3+)
                </div>
                <div className='flex items-center gap-2'>
                  {selectedStory.storyPoints ? (
                    <CheckCircle2 className='h-4 w-4' />
                  ) : (
                    <Circle className='h-4 w-4' />
                  )}
                  Story points estimated
                </div>
                <div className='flex items-center gap-2'>
                  {selectedStory.priority ? (
                    <CheckCircle2 className='h-4 w-4' />
                  ) : (
                    <Circle className='h-4 w-4' />
                  )}
                  Priority assigned
                </div>
                <div className='flex items-center gap-2'>
                  {selectedStory.dependencies.length === 0 ? (
                    <CheckCircle2 className='h-4 w-4' />
                  ) : (
                    <Circle className='h-4 w-4' />
                  )}
                  No blocking dependencies
                </div>
                <div className='flex items-center gap-2'>
                  {investScore >= 66 ? (
                    <CheckCircle2 className='h-4 w-4' />
                  ) : (
                    <Circle className='h-4 w-4' />
                  )}
                  INVEST criteria met
                </div>
              </div>
            </div>

            {/* Planning Poker */}
            <div className='rounded-lg bg-white p-6 shadow'>
              <div className='mb-4 flex items-center gap-2'>
                <Scale className='h-5 w-5 text-orange-600' />
                <h3 className='text-lg font-semibold text-gray-900'>Planning Poker</h3>
              </div>
              <p className='mb-4 text-sm text-gray-600'>
                Team members vote on story point estimation
              </p>

              <div className='mb-4 grid grid-cols-4 gap-2'>
                {fibonacciSequence.map((points) => (
                  <button
                    key={points}
                    onClick={() => voteEstimation('currentUser', points)}
                    className={`rounded-lg border-2 py-3 font-bold transition-colors ${
                      estimationVotes['currentUser'] === points
                        ? 'border-orange-600 bg-orange-50 text-orange-700'
                        : 'border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                    }`}
                  >
                    {points}
                  </button>
                ))}
              </div>

              {Object.keys(estimationVotes).length > 0 && (
                <div className='rounded-lg bg-orange-50 p-4'>
                  <div className='mb-2 text-sm font-semibold text-gray-700'>Team Votes:</div>
                  <div className='mb-3 flex gap-2'>
                    {Object.values(estimationVotes).map((vote, i) => (
                      <span
                        key={i}
                        className='rounded bg-orange-200 px-2 py-1 text-sm font-bold text-orange-800'
                      >
                        {vote}
                      </span>
                    ))}
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-700'>Consensus Estimate:</span>
                    <span className='text-2xl font-bold text-orange-700'>
                      {averageEstimation} points
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Discussion Notes */}
            <div className='rounded-lg bg-white p-6 shadow'>
              <div className='mb-4 flex items-center gap-2'>
                <MessageSquare className='h-5 w-5 text-blue-600' />
                <h3 className='text-lg font-semibold text-gray-900'>Discussion Notes</h3>
              </div>
              <textarea
                placeholder='Add refinement discussion notes...'
                rows={6}
                className='w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none'
              />
            </div>

            {/* Actions */}
            <div className='space-y-3'>
              <button className='flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700'>
                <ThumbsUp className='h-5 w-5' />
                Mark as Ready for Sprint
              </button>
              <button className='flex w-full items-center justify-center gap-2 rounded-lg border-2 border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50'>
                <FileText className='h-5 w-5' />
                Create Technical Spike
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Default export for lazy loading
export default BacklogRefinementWorkshop
