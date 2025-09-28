/**
 * Product Backlog Manager Component
 * Comprehensive backlog management with prioritization and refinement tools
 */

import React, { useState, useMemo } from 'react'
import {
  List,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Star,
  Clock,
  Users,
  Tag,
  AlertCircle,
  TrendingUp,
  Target,
  MessageSquare,
  Edit3,
  Trash2,
  Copy,
  Move,
} from 'lucide-react'
import { UserStory, Epic, Priority, StoryStatus, EpicCategory } from '../../types/backlog'
import { mockUserStories, mockEpics } from '../../data/backlogData'

type SortField = 'priority' | 'value' | 'effort' | 'votes' | 'created'
type ViewMode = 'list' | 'matrix' | 'kanban'

export const ProductBacklogManager: React.FC = () => {
  const [stories, setStories] = useState<UserStory[]>(mockUserStories)
  const [epics] = useState<Epic[]>(mockEpics)
  const [selectedEpic, setSelectedEpic] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<StoryStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('priority')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null)
  const [draggedStory, setDraggedStory] = useState<string | null>(null)

  // Priority scoring for sorting
  const getPriorityScore = (priority: Priority): number => {
    const scores = { Critical: 4, High: 3, Medium: 2, Low: 1 }
    return scores[priority]
  }

  // Value calculation (business value + user value)
  const getValueScore = (story: UserStory): number => {
    return story.businessValue + story.userValue
  }

  // Filter stories
  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      const matchesEpic = selectedEpic === 'all' || story.epicId === selectedEpic
      const matchesPriority = selectedPriority === 'all' || story.priority === selectedPriority
      const matchesStatus = selectedStatus === 'all' || story.status === selectedStatus
      const matchesSearch =
        searchQuery === '' ||
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesEpic && matchesPriority && matchesStatus && matchesSearch
    })
  }, [stories, selectedEpic, selectedPriority, selectedStatus, searchQuery])

  // Sort stories
  const sortedStories = useMemo(() => {
    const sorted = [...filteredStories].sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'priority':
          comparison = getPriorityScore(b.priority) - getPriorityScore(a.priority)
          break
        case 'value':
          comparison = getValueScore(b) - getValueScore(a)
          break
        case 'effort':
          comparison = a.effort - b.effort
          break
        case 'votes':
          comparison = b.votes - a.votes
          break
        case 'created':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          break
      }

      return sortDirection === 'asc' ? -comparison : comparison
    })

    return sorted
  }, [filteredStories, sortField, sortDirection])

  // Handle sort toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Drag and drop handlers
  const handleDragStart = (storyId: string) => {
    setDraggedStory(storyId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetStoryId: string) => {
    if (!draggedStory || draggedStory === targetStoryId) {
      return
    }

    const newStories = [...stories]
    const draggedIndex = newStories.findIndex((s) => s.id === draggedStory)
    const targetIndex = newStories.findIndex((s) => s.id === targetStoryId)

    const [removed] = newStories.splice(draggedIndex, 1)
    newStories.splice(targetIndex, 0, removed)

    setStories(newStories)
    setDraggedStory(null)
  }

  // Priority badge color
  const getPriorityColor = (priority: Priority): string => {
    const colors = {
      Critical: 'bg-red-100 text-red-800 border-red-300',
      High: 'bg-orange-100 text-orange-800 border-orange-300',
      Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      Low: 'bg-green-100 text-green-800 border-green-300',
    }
    return colors[priority]
  }

  // Status badge color
  const getStatusColor = (status: StoryStatus): string => {
    const colors = {
      New: 'bg-gray-100 text-gray-800',
      Refined: 'bg-blue-100 text-blue-800',
      Ready: 'bg-green-100 text-green-800',
      'In Progress': 'bg-purple-100 text-purple-800',
      Review: 'bg-yellow-100 text-yellow-800',
      Done: 'bg-emerald-100 text-emerald-800',
      Blocked: 'bg-red-100 text-red-800',
    }
    return colors[status]
  }

  // Get epic info
  const getEpic = (epicId: string): Epic | undefined => {
    return epics.find((e) => e.id === epicId)
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='mx-auto max-w-7xl'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='mb-2 text-3xl font-bold text-gray-900'>Product Backlog</h1>
          <p className='text-gray-600'>
            Prioritized list of work items for PMP Learning Management System
          </p>
        </div>

        {/* Filters and Search */}
        <div className='mb-6 rounded-lg bg-white p-6 shadow'>
          <div className='mb-4 grid gap-4 md:grid-cols-4'>
            {/* Search */}
            <div className='relative md:col-span-2'>
              <Search className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
              <input
                type='text'
                placeholder='Search stories, tags, descriptions...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none'
              />
            </div>

            {/* Epic Filter */}
            <select
              value={selectedEpic}
              onChange={(e) => setSelectedEpic(e.target.value)}
              className='rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none'
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
              onChange={(e) => setSelectedPriority(e.target.value as Priority | 'all')}
              className='rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none'
            >
              <option value='all'>All Priorities</option>
              <option value='Critical'>Critical</option>
              <option value='High'>High</option>
              <option value='Medium'>Medium</option>
              <option value='Low'>Low</option>
            </select>
          </div>

          {/* Status Filter and View Toggle */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Filter className='h-5 w-5 text-gray-400' />
              <span className='text-sm font-medium text-gray-700'>Status:</span>
              {(['all', 'New', 'Refined', 'Ready', 'In Progress', 'Blocked'] as const).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                      selectedStatus === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'all' ? 'All' : status}
                  </button>
                )
              )}
            </div>

            <div className='text-sm text-gray-600'>
              Showing {sortedStories.length} of {stories.length} stories
            </div>
          </div>
        </div>

        {/* Sort Controls */}
        <div className='mb-4 flex items-center justify-between rounded-lg bg-white p-4 shadow'>
          <div className='flex items-center gap-2'>
            <List className='h-5 w-5 text-gray-400' />
            <span className='text-sm font-medium text-gray-700'>Sort by:</span>
            {[
              { field: 'priority' as SortField, label: 'Priority' },
              { field: 'value' as SortField, label: 'Value' },
              { field: 'effort' as SortField, label: 'Effort' },
              { field: 'votes' as SortField, label: 'Votes' },
              { field: 'created' as SortField, label: 'Created' },
            ].map(({ field, label }) => (
              <button
                key={field}
                onClick={() => handleSort(field)}
                className={`flex items-center gap-1 rounded px-3 py-1 text-sm font-medium transition-colors ${
                  sortField === field
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
                {sortField === field &&
                  (sortDirection === 'asc' ? (
                    <ChevronUp className='h-4 w-4' />
                  ) : (
                    <ChevronDown className='h-4 w-4' />
                  ))}
              </button>
            ))}
          </div>
        </div>

        {/* Backlog Items */}
        <div className='space-y-3'>
          {sortedStories.map((story, index) => {
            const epic = getEpic(story.epicId)
            const valueScore = getValueScore(story)

            return (
              <div
                key={story.id}
                draggable
                onDragStart={() => handleDragStart(story.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(story.id)}
                onClick={() => setSelectedStory(story)}
                className={`cursor-move rounded-lg bg-white p-5 shadow transition-shadow hover:shadow-lg ${
                  draggedStory === story.id ? 'opacity-50' : ''
                }`}
              >
                {/* Story Header */}
                <div className='mb-3 flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='mb-2 flex items-center gap-2'>
                      <span className='text-sm font-medium text-gray-500'>#{index + 1}</span>
                      <span
                        className={`rounded border px-2 py-0.5 text-xs font-semibold ${getPriorityColor(
                          story.priority
                        )}`}
                      >
                        {story.priority}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-semibold ${getStatusColor(story.status)}`}
                      >
                        {story.status}
                      </span>
                      {story.storyPoints && (
                        <span className='rounded bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-800'>
                          {story.storyPoints} pts
                        </span>
                      )}
                      {epic && (
                        <span className='rounded bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800'>
                          {epic.title}
                        </span>
                      )}
                    </div>
                    <h3 className='mb-2 text-lg font-semibold text-gray-900'>{story.title}</h3>
                    <p className='mb-3 text-sm text-gray-700'>{story.description}</p>

                    {/* User Story Format */}
                    <div className='mb-3 rounded-lg bg-blue-50 p-3 text-sm'>
                      <p className='text-gray-700'>
                        <span className='font-semibold'>As a</span> {story.asA},{' '}
                        <span className='font-semibold'>I want</span> {story.iWant},{' '}
                        <span className='font-semibold'>so that</span> {story.soThat}
                      </p>
                    </div>

                    {/* Acceptance Criteria */}
                    <div className='mb-3'>
                      <div className='mb-1 text-xs font-semibold text-gray-700'>
                        Acceptance Criteria (
                        {story.acceptanceCriteria.filter((ac) => ac.completed).length}/
                        {story.acceptanceCriteria.length})
                      </div>
                      <div className='space-y-1'>
                        {story.acceptanceCriteria.slice(0, 2).map((ac) => (
                          <div key={ac.id} className='flex items-start gap-2 text-xs text-gray-600'>
                            <input
                              type='checkbox'
                              checked={ac.completed}
                              readOnly
                              className='mt-0.5'
                            />
                            <span>{ac.description}</span>
                          </div>
                        ))}
                        {story.acceptanceCriteria.length > 2 && (
                          <div className='text-xs text-gray-500'>
                            +{story.acceptanceCriteria.length - 2} more criteria...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className='flex flex-wrap gap-1'>
                      {story.tags.map((tag) => (
                        <span
                          key={tag}
                          className='inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-700'
                        >
                          <Tag className='h-3 w-3' />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Metrics and Actions */}
                  <div className='ml-4 flex flex-col items-end gap-2'>
                    {/* Value/Effort Score */}
                    <div className='text-right'>
                      <div className='mb-1 flex items-center gap-1 text-xs text-gray-500'>
                        <Star className='h-3 w-3' />
                        Value
                      </div>
                      <div className='text-lg font-bold text-blue-600'>{valueScore}/20</div>
                    </div>
                    <div className='text-right'>
                      <div className='mb-1 flex items-center gap-1 text-xs text-gray-500'>
                        <TrendingUp className='h-3 w-3' />
                        Effort
                      </div>
                      <div className='text-lg font-bold text-orange-600'>{story.effort}/10</div>
                    </div>

                    {/* Votes */}
                    <div className='flex items-center gap-1 rounded bg-purple-50 px-2 py-1'>
                      <Users className='h-4 w-4 text-purple-600' />
                      <span className='text-sm font-semibold text-purple-700'>{story.votes}</span>
                    </div>

                    {/* Dependencies/Blockers */}
                    {story.dependencies.length > 0 && (
                      <div className='flex items-center gap-1 text-xs text-amber-600'>
                        <AlertCircle className='h-4 w-4' />
                        {story.dependencies.length} deps
                      </div>
                    )}
                    {story.blockers.length > 0 && (
                      <div className='flex items-center gap-1 text-xs text-red-600'>
                        <AlertCircle className='h-4 w-4' />
                        {story.blockers.length} blockers
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className='flex items-center justify-between border-t pt-3'>
                  <div className='flex items-center gap-4 text-xs text-gray-500'>
                    <div className='flex items-center gap-1'>
                      <Clock className='h-4 w-4' />
                      Created {new Date(story.createdAt).toLocaleDateString()}
                    </div>
                    {story.assignee && (
                      <div className='flex items-center gap-1'>
                        <Users className='h-4 w-4' />
                        Assigned
                      </div>
                    )}
                    <div className='flex items-center gap-1'>
                      <MessageSquare className='h-4 w-4' />
                      {story.comments.length}
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <button className='rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600'>
                      <Edit3 className='h-4 w-4' />
                    </button>
                    <button className='rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600'>
                      <Copy className='h-4 w-4' />
                    </button>
                    <button className='rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600'>
                      <Move className='h-4 w-4' />
                    </button>
                    <button className='rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600'>
                      <Trash2 className='h-4 w-4' />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {sortedStories.length === 0 && (
          <div className='rounded-lg bg-white p-12 text-center shadow'>
            <Target className='mx-auto mb-4 h-12 w-12 text-gray-400' />
            <h3 className='mb-2 text-lg font-semibold text-gray-900'>No stories found</h3>
            <p className='text-gray-600'>Try adjusting your filters or create a new story</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Default export for lazy loading
export default ProductBacklogManager
