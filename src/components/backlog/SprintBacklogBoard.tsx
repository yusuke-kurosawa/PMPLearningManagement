/**
 * Sprint Backlog Board Component
 * Kanban-style board for managing sprint work items with burndown chart
 */

import React, { useState, useMemo } from 'react'
import {
  Calendar,
  Target,
  TrendingDown,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  Plus,
  Activity,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Sprint, UserStory, Task, TaskStatus, DailyProgress } from '../../types/backlog'
import { mockSprints, mockUserStories, mockTeamMembers } from '../../data/backlogData'

type KanbanColumn = 'To Do' | 'In Progress' | 'Review' | 'Done'

export const SprintBacklogBoard: React.FC = () => {
  const [selectedSprint, setSelectedSprint] = useState<Sprint>(mockSprints[0])
  const [showBurndown, setShowBurndown] = useState(true)

  // Get stories for current sprint
  const sprintStories = useMemo(() => {
    return mockUserStories.filter((story) => selectedSprint.storyIds.includes(story.id))
  }, [selectedSprint])

  // Mock tasks for demonstration
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task1',
      storyId: 'story1',
      title: 'Set up tRPC router configuration',
      description: 'Configure tRPC with authentication middleware',
      status: 'In Progress',
      assignee: 'tm3',
      estimatedHours: 8,
      actualHours: 5,
      createdAt: '2025-09-20T10:00:00Z',
      updatedAt: '2025-09-22T15:30:00Z',
    },
    {
      id: 'task2',
      storyId: 'story1',
      title: 'Create API endpoints for user management',
      description: 'Implement CRUD operations for users',
      status: 'To Do',
      assignee: 'tm3',
      estimatedHours: 12,
      createdAt: '2025-09-20T10:00:00Z',
      updatedAt: '2025-09-20T10:00:00Z',
    },
    {
      id: 'task3',
      storyId: 'story1',
      title: 'Add error handling middleware',
      description: 'Global error handling and validation',
      status: 'To Do',
      assignee: 'tm7',
      estimatedHours: 6,
      createdAt: '2025-09-20T10:00:00Z',
      updatedAt: '2025-09-20T10:00:00Z',
    },
    {
      id: 'task4',
      storyId: 'story2',
      title: 'Design Prisma schema',
      description: 'Create database schema for all entities',
      status: 'Done',
      assignee: 'tm3',
      estimatedHours: 8,
      actualHours: 7,
      createdAt: '2025-09-20T10:00:00Z',
      updatedAt: '2025-09-21T16:00:00Z',
    },
    {
      id: 'task5',
      storyId: 'story2',
      title: 'Create migration scripts',
      description: 'Generate and test migration scripts',
      status: 'In Progress',
      assignee: 'tm3',
      estimatedHours: 4,
      actualHours: 3,
      createdAt: '2025-09-20T10:00:00Z',
      updatedAt: '2025-09-22T11:00:00Z',
    },
    {
      id: 'task6',
      storyId: 'story2',
      title: 'Add seed data',
      description: 'Create seed data for development',
      status: 'Review',
      assignee: 'tm7',
      estimatedHours: 3,
      actualHours: 3,
      createdAt: '2025-09-20T10:00:00Z',
      updatedAt: '2025-09-22T14:00:00Z',
    },
    {
      id: 'task7',
      storyId: 'story3',
      title: 'Implement JWT token generation',
      description: 'Create JWT auth service',
      status: 'To Do',
      assignee: 'tm4',
      estimatedHours: 6,
      createdAt: '2025-09-20T10:00:00Z',
      updatedAt: '2025-09-20T10:00:00Z',
    },
    {
      id: 'task8',
      storyId: 'story3',
      title: 'Add refresh token mechanism',
      description: 'Implement token refresh flow',
      status: 'To Do',
      assignee: 'tm4',
      estimatedHours: 4,
      createdAt: '2025-09-20T10:00:00Z',
      updatedAt: '2025-09-20T10:00:00Z',
    },
  ])

  // Mock burndown data
  const burndownData = useMemo(() => {
    const sprintStart = new Date(selectedSprint.startDate)
    const sprintEnd = new Date(selectedSprint.endDate)
    const totalDays = Math.ceil(
      (sprintEnd.getTime() - sprintStart.getTime()) / (1000 * 60 * 60 * 24)
    )

    const data = []
    for (let i = 0; i <= totalDays; i++) {
      const currentDate = new Date(sprintStart.getTime() + i * 24 * 60 * 60 * 1000)
      const ideal = selectedSprint.commitment * (1 - i / totalDays)
      // Mock actual progress
      const actual =
        i <= 2
          ? selectedSprint.commitment - i * 2
          : selectedSprint.commitment - i * 2 - Math.random() * 3

      data.push({
        day: `Day ${i + 1}`,
        date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ideal: Math.max(0, ideal),
        actual: Math.max(0, actual),
      })
    }
    return data
  }, [selectedSprint])

  // Calculate sprint metrics
  const sprintMetrics = useMemo(() => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.status === 'Done').length
    const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length
    const totalEstimatedHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0)
    const totalActualHours = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0)
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    // Calculate remaining work
    const donePoints = sprintStories
      .filter((s) => s.status === 'Done')
      .reduce((sum, s) => sum + (s.storyPoints || 0), 0)
    const remainingPoints = selectedSprint.commitment - donePoints

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      totalEstimatedHours,
      totalActualHours,
      completionRate,
      remainingPoints,
      donePoints,
    }
  }, [tasks, sprintStories, selectedSprint])

  // Get tasks by status
  const getTasksByStatus = (status: TaskStatus): Task[] => {
    return tasks.filter((task) => task.status === status)
  }

  // Get team member name
  const getTeamMemberName = (id?: string): string => {
    if (!id) {
      return 'Unassigned'
    }
    const member = mockTeamMembers.find((m) => m.id === id)
    return member ? member.name : 'Unknown'
  }

  // Get story by task
  const getStoryForTask = (task: Task): UserStory | undefined => {
    return sprintStories.find((s) => s.id === task.storyId)
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
          : task
      )
    )
  }

  // Status column config
  const columns: { status: TaskStatus; color: string; icon: React.ReactNode }[] = [
    {
      status: 'To Do',
      color: 'bg-gray-100 border-gray-300',
      icon: <Clock className='h-5 w-5 text-gray-600' />,
    },
    {
      status: 'In Progress',
      color: 'bg-blue-100 border-blue-300',
      icon: <Activity className='h-5 w-5 text-blue-600' />,
    },
    {
      status: 'Review',
      color: 'bg-yellow-100 border-yellow-300',
      icon: <AlertTriangle className='h-5 w-5 text-yellow-600' />,
    },
    {
      status: 'Done',
      color: 'bg-green-100 border-green-300',
      icon: <CheckCircle2 className='h-5 w-5 text-green-600' />,
    },
  ]

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='mx-auto max-w-[1800px]'>
        {/* Header */}
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='mb-2 text-3xl font-bold text-gray-900'>{selectedSprint.name}</h1>
            <p className='text-gray-600'>{selectedSprint.goal}</p>
          </div>

          <select
            value={selectedSprint.id}
            onChange={(e) => {
              const sprint = mockSprints.find((s) => s.id === e.target.value)
              if (sprint) {
                setSelectedSprint(sprint)
              }
            }}
            className='rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none'
          >
            {mockSprints.map((sprint) => (
              <option key={sprint.id} value={sprint.id}>
                {sprint.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sprint Info Cards */}
        <div className='mb-6 grid gap-4 md:grid-cols-5'>
          {/* Sprint Progress */}
          <div className='rounded-lg bg-white p-4 shadow'>
            <div className='mb-2 flex items-center gap-2 text-sm text-gray-600'>
              <Target className='h-4 w-4' />
              Sprint Progress
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              {sprintMetrics.donePoints}/{selectedSprint.commitment}
            </div>
            <div className='text-xs text-gray-500'>Story Points</div>
            <div className='mt-2 h-2 w-full rounded-full bg-gray-200'>
              <div
                className='h-2 rounded-full bg-blue-600 transition-all'
                style={{
                  width: `${(sprintMetrics.donePoints / selectedSprint.commitment) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Tasks Completed */}
          <div className='rounded-lg bg-white p-4 shadow'>
            <div className='mb-2 flex items-center gap-2 text-sm text-gray-600'>
              <CheckCircle2 className='h-4 w-4' />
              Tasks Completed
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              {sprintMetrics.completedTasks}/{sprintMetrics.totalTasks}
            </div>
            <div className='text-xs text-gray-500'>
              {sprintMetrics.completionRate.toFixed(1)}% Complete
            </div>
          </div>

          {/* Time Tracking */}
          <div className='rounded-lg bg-white p-4 shadow'>
            <div className='mb-2 flex items-center gap-2 text-sm text-gray-600'>
              <Clock className='h-4 w-4' />
              Time Spent
            </div>
            <div className='text-2xl font-bold text-gray-900'>
              {sprintMetrics.totalActualHours}/{sprintMetrics.totalEstimatedHours}h
            </div>
            <div className='text-xs text-gray-500'>Actual vs Estimated</div>
          </div>

          {/* Sprint Duration */}
          <div className='rounded-lg bg-white p-4 shadow'>
            <div className='mb-2 flex items-center gap-2 text-sm text-gray-600'>
              <Calendar className='h-4 w-4' />
              Sprint Duration
            </div>
            <div className='text-sm font-semibold text-gray-900'>
              {new Date(selectedSprint.startDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}{' '}
              -{' '}
              {new Date(selectedSprint.endDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </div>
            <div className='text-xs text-gray-500'>2 weeks</div>
          </div>

          {/* Impediments */}
          <div className='rounded-lg bg-white p-4 shadow'>
            <div className='mb-2 flex items-center gap-2 text-sm text-gray-600'>
              <AlertTriangle className='h-4 w-4' />
              Impediments
            </div>
            <div className='text-2xl font-bold text-red-600'>
              {selectedSprint.impediments.length}
            </div>
            <div className='text-xs text-gray-500'>Active Blockers</div>
          </div>
        </div>

        {/* Burndown Chart */}
        {showBurndown && (
          <div className='mb-6 rounded-lg bg-white p-6 shadow'>
            <div className='mb-4 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <TrendingDown className='h-5 w-5 text-blue-600' />
                <h2 className='text-lg font-semibold text-gray-900'>Sprint Burndown Chart</h2>
              </div>
              <button
                onClick={() => setShowBurndown(false)}
                className='text-sm text-gray-600 hover:text-gray-800'
              >
                Hide Chart
              </button>
            </div>
            <ResponsiveContainer width='100%' height={200}>
              <LineChart data={burndownData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='date' tick={{ fontSize: 12 }} />
                <YAxis
                  label={{
                    value: 'Story Points',
                    angle: -90,
                    position: 'insideLeft',
                    fontSize: 12,
                  }}
                />
                <Tooltip />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='ideal'
                  stroke='#9ca3af'
                  strokeWidth={2}
                  name='Ideal'
                  strokeDasharray='5 5'
                />
                <Line
                  type='monotone'
                  dataKey='actual'
                  stroke='#3b82f6'
                  strokeWidth={2}
                  name='Actual'
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Kanban Board */}
        <div className='grid grid-cols-4 gap-4'>
          {columns.map(({ status, color, icon }) => {
            const columnTasks = getTasksByStatus(status)

            return (
              <div key={status} className='flex flex-col'>
                {/* Column Header */}
                <div className={`mb-3 rounded-lg border-2 p-3 ${color}`}>
                  <div className='mb-2 flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      {icon}
                      <h3 className='font-semibold'>{status}</h3>
                    </div>
                    <span className='rounded-full bg-white px-2 py-0.5 text-sm font-semibold'>
                      {columnTasks.length}
                    </span>
                  </div>
                </div>

                {/* Tasks */}
                <div
                  className='flex-1 space-y-3'
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  {columnTasks.map((task) => {
                    const story = getStoryForTask(task)

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className='cursor-move rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-lg'
                      >
                        {/* Task Header */}
                        <div className='mb-2'>
                          {story && (
                            <div className='mb-1 text-xs font-medium text-blue-600'>
                              {story.title.substring(0, 30)}...
                            </div>
                          )}
                          <h4 className='font-semibold text-gray-900'>{task.title}</h4>
                        </div>

                        {/* Task Description */}
                        <p className='mb-3 text-sm text-gray-600'>{task.description}</p>

                        {/* Task Meta */}
                        <div className='space-y-2'>
                          <div className='flex items-center justify-between text-xs text-gray-500'>
                            <div className='flex items-center gap-1'>
                              <Clock className='h-3 w-3' />
                              {task.actualHours || 0}h / {task.estimatedHours}h
                            </div>
                            {story?.storyPoints && (
                              <span className='rounded bg-indigo-100 px-2 py-0.5 font-semibold text-indigo-800'>
                                {story.storyPoints} pts
                              </span>
                            )}
                          </div>

                          <div className='flex items-center gap-1 text-xs'>
                            <Users className='h-3 w-3 text-gray-400' />
                            <span className='text-gray-700'>
                              {getTeamMemberName(task.assignee)}
                            </span>
                          </div>

                          {/* Progress Bar */}
                          {task.actualHours && (
                            <div className='h-1.5 w-full rounded-full bg-gray-200'>
                              <div
                                className='h-1.5 rounded-full bg-blue-600 transition-all'
                                style={{
                                  width: `${Math.min(100, (task.actualHours / task.estimatedHours) * 100)}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {/* Add Task Button */}
                  <button className='flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-4 text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700'>
                    <Plus className='h-4 w-4' />
                    Add Task
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Impediments Section */}
        {selectedSprint.impediments.length > 0 && (
          <div className='mt-6 rounded-lg bg-red-50 p-6 shadow'>
            <div className='mb-4 flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5 text-red-600' />
              <h2 className='text-lg font-semibold text-red-900'>Active Impediments</h2>
            </div>
            <div className='space-y-3'>
              {selectedSprint.impediments.map((impediment) => (
                <div key={impediment.id} className='rounded-lg bg-white p-4'>
                  <div className='mb-2 flex items-center justify-between'>
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        impediment.severity === 'High'
                          ? 'bg-red-100 text-red-800'
                          : impediment.severity === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {impediment.severity}
                    </span>
                    <span className='text-xs text-gray-500'>
                      Reported by {getTeamMemberName(impediment.reportedBy)}
                    </span>
                  </div>
                  <p className='text-sm text-gray-700'>{impediment.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Default export for lazy loading
export default SprintBacklogBoard
