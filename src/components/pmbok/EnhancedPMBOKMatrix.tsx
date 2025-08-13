/**
 * Enhanced PMBOK Matrix with Database Integration and Advanced Features
 * Developer 4: PMBOK Integration Developer Implementation
 */

import React, { useState, useEffect, useMemo } from 'react'
import {
  Search,
  Filter,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Star,
  StarOff,
  Eye,
  ExternalLink,
  Download,
  Settings,
  RotateCcw,
  Bookmark,
  BookmarkCheck,
  Lightbulb,
  ArrowRight,
  Clock,
  Users,
  TrendingUp,
  Info,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { api } from '../../lib/api/client'
import { useToast } from '../../hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { Switch } from '../ui/switch'
import { Separator } from '../ui/separator'

interface PMBOKProcess {
  id: string
  name: string
  knowledgeArea: string
  processGroup: string
  description: string
  purpose: string
  keyBenefits: string[]
  inputs: Array<{
    id: string
    name: string
    description: string
    isKey: boolean
  }>
  outputs: Array<{
    id: string
    name: string
    description: string
    isKey: boolean
  }>
  toolsAndTechniques: Array<{
    id: string
    name: string
    description: string
    category: string
    isKey: boolean
  }>
  pmbok6Id?: string
  pmbok7Domains?: string[]
  pmbok7Principles?: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  studyTime: number // estimated study time in minutes
  prerequisites?: string[]
  relatedProcesses: string[]
  tags: string[]
  lastUpdated: Date
  version: 6 | 7
}

interface UserProgress {
  processId: string
  studyTime: number
  masteryLevel: 'not_started' | 'learning' | 'familiar' | 'proficient' | 'mastered'
  lastStudied?: Date
  bookmarked: boolean
  notes?: string
  completedActivities: string[]
}

const KNOWLEDGE_AREAS = [
  'Project Integration Management',
  'Project Scope Management',
  'Project Schedule Management',
  'Project Cost Management',
  'Project Quality Management',
  'Project Resource Management',
  'Project Communications Management',
  'Project Risk Management',
  'Project Procurement Management',
  'Project Stakeholder Management',
]

const PROCESS_GROUPS = [
  'Initiating',
  'Planning',
  'Executing',
  'Monitoring and Controlling',
  'Closing',
]

const PMBOK7_PERFORMANCE_DOMAINS = [
  'Stakeholders',
  'Team',
  'Development Approach and Life Cycle',
  'Planning',
  'Project Work',
  'Delivery',
  'Measurement',
  'Uncertainty',
]

const EnhancedPMBOKMatrix: React.FC = () => {
  const { toast } = useToast()

  // State
  const [processes, setProcesses] = useState<PMBOKProcess[]>([])
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters and search
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedKnowledgeArea, setSelectedKnowledgeArea] = useState<string>('all')
  const [selectedProcessGroup, setSelectedProcessGroup] = useState<string>('all')
  const [selectedVersion, setSelectedVersion] = useState<6 | 7 | 'both'>(7)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false)
  const [showOnlyUnstudied, setShowOnlyUnstudied] = useState(false)

  // UI state
  const [expandedProcesses, setExpandedProcesses] = useState<Set<string>>(new Set())
  const [selectedProcess, setSelectedProcess] = useState<PMBOKProcess | null>(null)
  const [showProcessDetails, setShowProcessDetails] = useState(false)
  const [viewMode, setViewMode] = useState<'matrix' | 'list' | 'cards'>('matrix')
  const [compactMode, setCompactMode] = useState(false)

  // Load data
  useEffect(() => {
    loadPMBOKData()
    loadUserProgress()
  }, [])

  const loadPMBOKData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await api.pmbok.getProcesses.query({
        version: selectedVersion === 'both' ? undefined : selectedVersion,
        includeDetails: true,
      })

      setProcesses(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load PMBOK data'
      setError(message)
      toast({
        title: 'Failed to Load PMBOK Data',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserProgress = async () => {
    try {
      const progress = await api.pmbok.getUserProgress.query()
      const progressMap = progress.reduce(
        (acc, p) => {
          acc[p.processId] = p
          return acc
        },
        {} as Record<string, UserProgress>
      )

      setUserProgress(progressMap)
    } catch (error) {
      console.error('Failed to load user progress:', error)
    }
  }

  // Filter processes
  const filteredProcesses = useMemo(() => {
    return processes.filter((process) => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          process.name.toLowerCase().includes(query) ||
          process.description.toLowerCase().includes(query) ||
          process.knowledgeArea.toLowerCase().includes(query) ||
          process.processGroup.toLowerCase().includes(query) ||
          process.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          process.inputs.some((input) => input.name.toLowerCase().includes(query)) ||
          process.outputs.some((output) => output.name.toLowerCase().includes(query)) ||
          process.toolsAndTechniques.some((tool) => tool.name.toLowerCase().includes(query))

        if (!matchesSearch) return false
      }

      // Knowledge area filter
      if (selectedKnowledgeArea !== 'all' && process.knowledgeArea !== selectedKnowledgeArea) {
        return false
      }

      // Process group filter
      if (selectedProcessGroup !== 'all' && process.processGroup !== selectedProcessGroup) {
        return false
      }

      // Version filter
      if (selectedVersion !== 'both' && process.version !== selectedVersion) {
        return false
      }

      // Difficulty filter
      if (selectedDifficulty !== 'all' && process.difficulty !== selectedDifficulty) {
        return false
      }

      // Bookmarked filter
      if (showOnlyBookmarked && !userProgress[process.id]?.bookmarked) {
        return false
      }

      // Unstudied filter
      if (showOnlyUnstudied && userProgress[process.id]?.masteryLevel !== 'not_started') {
        return false
      }

      return true
    })
  }, [
    processes,
    searchQuery,
    selectedKnowledgeArea,
    selectedProcessGroup,
    selectedVersion,
    selectedDifficulty,
    showOnlyBookmarked,
    showOnlyUnstudied,
    userProgress,
  ])

  // Group processes by knowledge area and process group for matrix view
  const processMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, PMBOKProcess[]>> = {}

    KNOWLEDGE_AREAS.forEach((ka) => {
      matrix[ka] = {}
      PROCESS_GROUPS.forEach((pg) => {
        matrix[ka][pg] = filteredProcesses.filter(
          (process) => process.knowledgeArea === ka && process.processGroup === pg
        )
      })
    })

    return matrix
  }, [filteredProcesses])

  // Handle process interactions
  const toggleBookmark = async (processId: string) => {
    const currentProgress = userProgress[processId]
    const newBookmarkedState = !currentProgress?.bookmarked

    // Optimistic update
    setUserProgress((prev) => ({
      ...prev,
      [processId]: {
        ...prev[processId],
        processId,
        studyTime: prev[processId]?.studyTime || 0,
        masteryLevel: prev[processId]?.masteryLevel || 'not_started',
        bookmarked: newBookmarkedState,
        completedActivities: prev[processId]?.completedActivities || [],
      },
    }))

    try {
      await api.pmbok.updateUserProgress.mutate({
        processId,
        updates: { bookmarked: newBookmarkedState },
      })

      toast({
        title: newBookmarkedState ? 'Process Bookmarked' : 'Bookmark Removed',
        description: `${processes.find((p) => p.id === processId)?.name}`,
      })
    } catch (error) {
      // Revert on error
      setUserProgress((prev) => ({
        ...prev,
        [processId]: {
          ...prev[processId],
          bookmarked: !newBookmarkedState,
        },
      }))

      toast({
        title: 'Failed to Update Bookmark',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    }
  }

  const updateMasteryLevel = async (processId: string, level: UserProgress['masteryLevel']) => {
    const currentProgress = userProgress[processId]

    // Optimistic update
    setUserProgress((prev) => ({
      ...prev,
      [processId]: {
        ...prev[processId],
        processId,
        studyTime: prev[processId]?.studyTime || 0,
        masteryLevel: level,
        bookmarked: prev[processId]?.bookmarked || false,
        completedActivities: prev[processId]?.completedActivities || [],
        lastStudied: new Date(),
      },
    }))

    try {
      await api.pmbok.updateUserProgress.mutate({
        processId,
        updates: {
          masteryLevel: level,
          lastStudied: new Date(),
        },
      })

      toast({
        title: 'Progress Updated',
        description: `Mastery level set to ${level.replace('_', ' ')}`,
      })
    } catch (error) {
      // Revert on error
      setUserProgress((prev) => ({
        ...prev,
        [processId]: currentProgress || {
          processId,
          studyTime: 0,
          masteryLevel: 'not_started',
          bookmarked: false,
          completedActivities: [],
        },
      }))

      toast({
        title: 'Failed to Update Progress',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    }
  }

  const toggleExpanded = (processId: string) => {
    setExpandedProcesses((prev) => {
      const next = new Set(prev)
      if (next.has(processId)) {
        next.delete(processId)
      } else {
        next.add(processId)
      }
      return next
    })
  }

  const showDetails = (process: PMBOKProcess) => {
    setSelectedProcess(process)
    setShowProcessDetails(true)
  }

  const getMasteryColor = (level: UserProgress['masteryLevel']) => {
    switch (level) {
      case 'mastered':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'proficient':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'familiar':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'learning':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getProgressStats = () => {
    const total = processes.length
    const studied = Object.values(userProgress).filter(
      (p) => p.masteryLevel !== 'not_started'
    ).length
    const mastered = Object.values(userProgress).filter((p) => p.masteryLevel === 'mastered').length
    const bookmarked = Object.values(userProgress).filter((p) => p.bookmarked).length

    return { total, studied, mastered, bookmarked }
  }

  const stats = getProgressStats()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
            <h3 className="mb-2 text-lg font-semibold">Loading PMBOK Data</h3>
            <p className="text-gray-600">Fetching process information...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl p-4">
          {/* Header */}
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">PMBOK Process Matrix</h1>
                <p className="text-gray-600">
                  Interactive guide to PMBOK{' '}
                  {selectedVersion === 'both' ? '6th & 7th' : `${selectedVersion}th`} Edition
                  processes
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => loadPMBOKData()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}

            {/* Progress Overview */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 p-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Processes</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-yellow-100 p-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Studied</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.studied}</p>
                      <Progress value={(stats.studied / stats.total) * 100} className="mt-1 h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-100 p-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Mastered</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.mastered}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-purple-100 p-2">
                      <Bookmark className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Bookmarked</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.bookmarked}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Controls */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Search */}
                  <div className="relative min-w-[300px] flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      placeholder="Search processes, inputs, outputs, tools..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Version Toggle */}
                  <Select
                    value={selectedVersion.toString()}
                    onValueChange={(value) => setSelectedVersion(value as any)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">PMBOK 6</SelectItem>
                      <SelectItem value="7">PMBOK 7</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Knowledge Area Filter */}
                  <Select value={selectedKnowledgeArea} onValueChange={setSelectedKnowledgeArea}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Knowledge Area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Knowledge Areas</SelectItem>
                      {KNOWLEDGE_AREAS.map((ka) => (
                        <SelectItem key={ka} value={ka}>
                          {ka}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Process Group Filter */}
                  <Select value={selectedProcessGroup} onValueChange={setSelectedProcessGroup}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Process Group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Process Groups</SelectItem>
                      {PROCESS_GROUPS.map((pg) => (
                        <SelectItem key={pg} value={pg}>
                          {pg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* View Mode */}
                  <Select value={viewMode} onValueChange={setViewMode as any}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="matrix">Matrix</SelectItem>
                      <SelectItem value="list">List</SelectItem>
                      <SelectItem value="cards">Cards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={showOnlyBookmarked} onCheckedChange={setShowOnlyBookmarked} />
                    <label className="text-sm text-gray-600">Bookmarked only</label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch checked={showOnlyUnstudied} onCheckedChange={setShowOnlyUnstudied} />
                    <label className="text-sm text-gray-600">Unstudied only</label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch checked={compactMode} onCheckedChange={setCompactMode} />
                    <label className="text-sm text-gray-600">Compact mode</label>
                  </div>

                  <Badge variant="outline" className="ml-auto">
                    {filteredProcesses.length} of {processes.length} processes
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content based on view mode */}
          {viewMode === 'matrix' ? (
            /* Matrix View */
            <div className="overflow-x-auto">
              <div className="min-w-[1200px]">
                <div className="grid grid-cols-6 gap-2">
                  {/* Header row */}
                  <div className="p-2 text-sm font-semibold text-gray-700"></div>
                  {PROCESS_GROUPS.map((pg) => (
                    <div
                      key={pg}
                      className="rounded bg-gray-100 p-2 text-center text-sm font-semibold text-gray-700"
                    >
                      {pg}
                    </div>
                  ))}

                  {/* Matrix rows */}
                  {KNOWLEDGE_AREAS.map((ka) => (
                    <React.Fragment key={ka}>
                      <div className="flex min-h-[100px] items-center rounded bg-gray-100 p-2 text-sm font-semibold text-gray-700">
                        <span className="-rotate-90 transform whitespace-nowrap">
                          {ka.replace('Project ', '')}
                        </span>
                      </div>
                      {PROCESS_GROUPS.map((pg) => (
                        <div
                          key={`${ka}-${pg}`}
                          className="min-h-[100px] rounded border border-gray-200 p-2"
                        >
                          {processMatrix[ka][pg].map((process) => {
                            const progress = userProgress[process.id]
                            const isExpanded = expandedProcesses.has(process.id)

                            return (
                              <div
                                key={process.id}
                                className={`mb-2 rounded border transition-all duration-200 last:mb-0 ${
                                  progress?.masteryLevel
                                    ? getMasteryColor(progress.masteryLevel)
                                    : 'border-gray-200 bg-white'
                                } ${compactMode ? 'text-xs' : 'text-sm'}`}
                              >
                                <div className="p-2">
                                  <div className="flex items-start justify-between">
                                    <div className="min-w-0 flex-1">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            onClick={() => showDetails(process)}
                                            className="block w-full truncate text-left font-medium text-gray-900 hover:text-blue-600"
                                          >
                                            {process.name}
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="max-w-xs">{process.description}</p>
                                        </TooltipContent>
                                      </Tooltip>

                                      <div className="mt-1 flex items-center gap-1">
                                        <Badge variant="outline" className="text-xs">
                                          PMBOK {process.version}
                                        </Badge>
                                        <Badge
                                          variant={
                                            process.difficulty === 'advanced'
                                              ? 'destructive'
                                              : process.difficulty === 'intermediate'
                                                ? 'default'
                                                : 'secondary'
                                          }
                                          className="text-xs"
                                        >
                                          {process.difficulty}
                                        </Badge>
                                      </div>
                                    </div>

                                    <div className="ml-2 flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleBookmark(process.id)}
                                        className="h-auto p-1"
                                      >
                                        {progress?.bookmarked ? (
                                          <BookmarkCheck className="h-3 w-3 text-blue-600" />
                                        ) : (
                                          <Bookmark className="h-3 w-3 text-gray-400" />
                                        )}
                                      </Button>

                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleExpanded(process.id)}
                                        className="h-auto p-1"
                                      >
                                        {isExpanded ? (
                                          <ChevronUp className="h-3 w-3" />
                                        ) : (
                                          <ChevronDown className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>

                                  {isExpanded && (
                                    <div className="mt-2 space-y-2 border-t border-gray-200 pt-2">
                                      <div className="text-xs text-gray-600">
                                        <strong>Purpose:</strong> {process.purpose}
                                      </div>

                                      <div className="text-xs">
                                        <strong>Key Inputs:</strong>{' '}
                                        {process.inputs
                                          .filter((i) => i.isKey)
                                          .map((i) => i.name)
                                          .join(', ')}
                                      </div>

                                      <div className="text-xs">
                                        <strong>Key Outputs:</strong>{' '}
                                        {process.outputs
                                          .filter((o) => o.isKey)
                                          .map((o) => o.name)
                                          .join(', ')}
                                      </div>

                                      <div className="mt-2 flex items-center gap-2">
                                        <Select
                                          value={progress?.masteryLevel || 'not_started'}
                                          onValueChange={(level: UserProgress['masteryLevel']) =>
                                            updateMasteryLevel(process.id, level)
                                          }
                                        >
                                          <SelectTrigger className="h-6 text-xs">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="not_started">Not Started</SelectItem>
                                            <SelectItem value="learning">Learning</SelectItem>
                                            <SelectItem value="familiar">Familiar</SelectItem>
                                            <SelectItem value="proficient">Proficient</SelectItem>
                                            <SelectItem value="mastered">Mastered</SelectItem>
                                          </SelectContent>
                                        </Select>

                                        <Button size="sm" onClick={() => showDetails(process)}>
                                          <ExternalLink className="mr-1 h-3 w-3" />
                                          Details
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ) : viewMode === 'list' ? (
            /* List View */
            <div className="space-y-2">
              {filteredProcesses.map((process) => {
                const progress = userProgress[process.id]
                const isExpanded = expandedProcesses.has(process.id)

                return (
                  <Card
                    key={process.id}
                    className={`transition-all duration-200 ${
                      progress?.masteryLevel ? getMasteryColor(progress.masteryLevel) : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">{process.name}</h3>
                            <Badge variant="outline">{process.knowledgeArea}</Badge>
                            <Badge variant="secondary">{process.processGroup}</Badge>
                            <Badge variant="outline">PMBOK {process.version}</Badge>
                          </div>

                          <p className="mb-3 text-gray-600">{process.description}</p>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>🎯 {process.purpose}</span>
                            <span>⏱️ ~{process.studyTime} min</span>
                            <span>📊 {process.difficulty}</span>
                          </div>
                        </div>

                        <div className="ml-4 flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBookmark(process.id)}
                          >
                            {progress?.bookmarked ? (
                              <BookmarkCheck className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Bookmark className="h-4 w-4" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(process.id)}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>

                          <Button size="sm" onClick={() => showDetails(process)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                              <h4 className="mb-2 font-medium text-gray-900">Key Inputs</h4>
                              <ul className="space-y-1 text-sm text-gray-600">
                                {process.inputs
                                  .filter((i) => i.isKey)
                                  .slice(0, 5)
                                  .map((input) => (
                                    <li key={input.id}>• {input.name}</li>
                                  ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="mb-2 font-medium text-gray-900">
                                Key Tools & Techniques
                              </h4>
                              <ul className="space-y-1 text-sm text-gray-600">
                                {process.toolsAndTechniques
                                  .filter((t) => t.isKey)
                                  .slice(0, 5)
                                  .map((tool) => (
                                    <li key={tool.id}>• {tool.name}</li>
                                  ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="mb-2 font-medium text-gray-900">Key Outputs</h4>
                              <ul className="space-y-1 text-sm text-gray-600">
                                {process.outputs
                                  .filter((o) => o.isKey)
                                  .slice(0, 5)
                                  .map((output) => (
                                    <li key={output.id}>• {output.name}</li>
                                  ))}
                              </ul>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Mastery Level:</span>
                              <Select
                                value={progress?.masteryLevel || 'not_started'}
                                onValueChange={(level: UserProgress['masteryLevel']) =>
                                  updateMasteryLevel(process.id, level)
                                }
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="not_started">Not Started</SelectItem>
                                  <SelectItem value="learning">Learning</SelectItem>
                                  <SelectItem value="familiar">Familiar</SelectItem>
                                  <SelectItem value="proficient">Proficient</SelectItem>
                                  <SelectItem value="mastered">Mastered</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {progress?.lastStudied && (
                              <div className="text-sm text-gray-500">
                                Last studied: {format(progress.lastStudied, 'MMM dd, yyyy')}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            /* Cards View */
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProcesses.map((process) => {
                const progress = userProgress[process.id]

                return (
                  <Card
                    key={process.id}
                    className={`transition-all duration-200 hover:shadow-lg ${
                      progress?.masteryLevel ? getMasteryColor(progress.masteryLevel) : ''
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg leading-tight">{process.name}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBookmark(process.id)}
                          className="h-auto p-1"
                        >
                          {progress?.bookmarked ? (
                            <BookmarkCheck className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          {process.knowledgeArea}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {process.processGroup}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          PMBOK {process.version}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <p className="mb-4 line-clamp-3 text-sm text-gray-600">
                        {process.description}
                      </p>

                      <div className="space-y-3">
                        <div className="text-xs text-gray-500">
                          <strong>Purpose:</strong> {process.purpose}
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Study time: ~{process.studyTime} min</span>
                          <Badge
                            variant={
                              process.difficulty === 'advanced'
                                ? 'destructive'
                                : process.difficulty === 'intermediate'
                                  ? 'default'
                                  : 'secondary'
                            }
                            className="text-xs"
                          >
                            {process.difficulty}
                          </Badge>
                        </div>

                        <Separator />

                        <div className="flex items-center gap-2">
                          <Select
                            value={progress?.masteryLevel || 'not_started'}
                            onValueChange={(level: UserProgress['masteryLevel']) =>
                              updateMasteryLevel(process.id, level)
                            }
                          >
                            <SelectTrigger className="h-8 flex-1 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not_started">Not Started</SelectItem>
                              <SelectItem value="learning">Learning</SelectItem>
                              <SelectItem value="familiar">Familiar</SelectItem>
                              <SelectItem value="proficient">Proficient</SelectItem>
                              <SelectItem value="mastered">Mastered</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button size="sm" onClick={() => showDetails(process)}>
                            <Eye className="mr-1 h-3 w-3" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Process Details Dialog */}
          <Dialog open={showProcessDetails} onOpenChange={setShowProcessDetails}>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selectedProcess?.name}
                  <Badge variant="outline">PMBOK {selectedProcess?.version}</Badge>
                  {selectedProcess && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => selectedProcess && toggleBookmark(selectedProcess.id)}
                    >
                      {userProgress[selectedProcess.id]?.bookmarked ? (
                        <BookmarkCheck className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {selectedProcess?.knowledgeArea} • {selectedProcess?.processGroup}
                </DialogDescription>
              </DialogHeader>

              {selectedProcess && (
                <Tabs defaultValue="overview" className="mt-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="itto">ITTO Details</TabsTrigger>
                    <TabsTrigger value="relationships">Relationships</TabsTrigger>
                    <TabsTrigger value="study">Study Guide</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div>
                      <h3 className="mb-2 text-lg font-semibold">Description</h3>
                      <p className="text-gray-700">{selectedProcess.description}</p>
                    </div>

                    <div>
                      <h3 className="mb-2 text-lg font-semibold">Purpose</h3>
                      <p className="text-gray-700">{selectedProcess.purpose}</p>
                    </div>

                    <div>
                      <h3 className="mb-2 text-lg font-semibold">Key Benefits</h3>
                      <ul className="list-inside list-disc space-y-1 text-gray-700">
                        {selectedProcess.keyBenefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>

                    {selectedProcess.pmbok7Domains && selectedProcess.pmbok7Domains.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-lg font-semibold">PMBOK 7 Performance Domains</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedProcess.pmbok7Domains.map((domain) => (
                            <Badge key={domain} variant="secondary">
                              {domain}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="itto" className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                      <div>
                        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                          <ArrowRight className="h-5 w-5 text-blue-600" />
                          Inputs ({selectedProcess.inputs.length})
                        </h3>
                        <div className="space-y-2">
                          {selectedProcess.inputs.map((input) => (
                            <div
                              key={input.id}
                              className={`rounded border p-3 ${
                                input.isKey
                                  ? 'border-blue-200 bg-blue-50'
                                  : 'border-gray-200 bg-gray-50'
                              }`}
                            >
                              <div className="mb-1 flex items-center gap-2">
                                <span className="text-sm font-medium">{input.name}</span>
                                {input.isKey && <Star className="h-3 w-3 text-blue-600" />}
                              </div>
                              <p className="text-xs text-gray-600">{input.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                          <Settings className="h-5 w-5 text-green-600" />
                          Tools & Techniques ({selectedProcess.toolsAndTechniques.length})
                        </h3>
                        <div className="space-y-2">
                          {selectedProcess.toolsAndTechniques.map((tool) => (
                            <div
                              key={tool.id}
                              className={`rounded border p-3 ${
                                tool.isKey
                                  ? 'border-green-200 bg-green-50'
                                  : 'border-gray-200 bg-gray-50'
                              }`}
                            >
                              <div className="mb-1 flex items-center gap-2">
                                <span className="text-sm font-medium">{tool.name}</span>
                                {tool.isKey && <Star className="h-3 w-3 text-green-600" />}
                                <Badge variant="outline" className="text-xs">
                                  {tool.category}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600">{tool.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                          <ArrowRight className="h-5 w-5 rotate-180 transform text-purple-600" />
                          Outputs ({selectedProcess.outputs.length})
                        </h3>
                        <div className="space-y-2">
                          {selectedProcess.outputs.map((output) => (
                            <div
                              key={output.id}
                              className={`rounded border p-3 ${
                                output.isKey
                                  ? 'border-purple-200 bg-purple-50'
                                  : 'border-gray-200 bg-gray-50'
                              }`}
                            >
                              <div className="mb-1 flex items-center gap-2">
                                <span className="text-sm font-medium">{output.name}</span>
                                {output.isKey && <Star className="h-3 w-3 text-purple-600" />}
                              </div>
                              <p className="text-xs text-gray-600">{output.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="relationships" className="space-y-4">
                    {selectedProcess.relatedProcesses.length > 0 && (
                      <div>
                        <h3 className="mb-3 text-lg font-semibold">Related Processes</h3>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {selectedProcess.relatedProcesses.map((relatedId) => {
                            const relatedProcess = processes.find((p) => p.id === relatedId)
                            if (!relatedProcess) return null

                            return (
                              <div
                                key={relatedId}
                                className="cursor-pointer rounded border border-gray-200 p-3 hover:bg-gray-50"
                                onClick={() => setSelectedProcess(relatedProcess)}
                              >
                                <div className="text-sm font-medium">{relatedProcess.name}</div>
                                <div className="text-xs text-gray-600">
                                  {relatedProcess.knowledgeArea}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {selectedProcess.prerequisites && selectedProcess.prerequisites.length > 0 && (
                      <div>
                        <h3 className="mb-3 text-lg font-semibold">Prerequisites</h3>
                        <ul className="list-inside list-disc space-y-1 text-gray-700">
                          {selectedProcess.prerequisites.map((prereq, index) => (
                            <li key={index}>{prereq}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="study" className="space-y-4">
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                        <Lightbulb className="h-5 w-5 text-yellow-600" />
                        Study Recommendations
                      </h3>

                      <div className="space-y-3">
                        <div className="rounded border border-blue-200 bg-blue-50 p-4">
                          <h4 className="mb-2 font-medium text-blue-900">📚 Study Focus Areas</h4>
                          <ul className="space-y-1 text-sm text-blue-800">
                            <li>• Understand the process purpose and when it&apos;s performed</li>
                            <li>• Memorize key inputs, tools & techniques, and outputs</li>
                            <li>• Know the relationships with other processes</li>
                            <li>• Practice with sample scenarios and questions</li>
                          </ul>
                        </div>

                        <div className="rounded border border-green-200 bg-green-50 p-4">
                          <h4 className="mb-2 font-medium text-green-900">
                            ⏱️ Estimated Study Time
                          </h4>
                          <p className="text-sm text-green-800">
                            {selectedProcess.studyTime} minutes for initial review
                            <br />
                            Additional 30-60 minutes for practice and reinforcement
                          </p>
                        </div>

                        <div className="rounded border border-yellow-200 bg-yellow-50 p-4">
                          <h4 className="mb-2 font-medium text-yellow-900">🎯 Learning Tips</h4>
                          <ul className="space-y-1 text-sm text-yellow-800">
                            <li>• Create flashcards for ITTO elements</li>
                            <li>• Draw process flow diagrams</li>
                            <li>• Connect to real-world project examples</li>
                            <li>• Use mnemonics for complex lists</li>
                          </ul>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-sm text-gray-600">Current Mastery Level:</span>
                        <Select
                          value={userProgress[selectedProcess.id]?.masteryLevel || 'not_started'}
                          onValueChange={(level: UserProgress['masteryLevel']) =>
                            updateMasteryLevel(selectedProcess.id, level)
                          }
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not_started">Not Started</SelectItem>
                            <SelectItem value="learning">Learning</SelectItem>
                            <SelectItem value="familiar">Familiar</SelectItem>
                            <SelectItem value="proficient">Proficient</SelectItem>
                            <SelectItem value="mastered">Mastered</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default EnhancedPMBOKMatrix
