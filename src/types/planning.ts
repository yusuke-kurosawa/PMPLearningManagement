// Planning System Type Definitions

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low'
export type Status = 'Not Started' | 'In Progress' | 'Completed' | 'Blocked' | 'On Hold'
export type ReleasePhase = 'Planning' | 'Development' | 'Testing' | 'UAT' | 'Deployed'
export type StorySize = 1 | 2 | 3 | 5 | 8 | 13 | 21
export type SprintStatus = 'Planning' | 'Active' | 'Review' | 'Completed' | 'Cancelled'

export interface TeamMember {
  id: string
  name: string
  role: string
  capacity: number // hours per sprint
  skills: string[]
  avatar?: string
}

export interface Task {
  id: string
  title: string
  description: string
  assignee?: TeamMember
  estimatedHours: number
  actualHours?: number
  status: Status
  blockers?: string[]
}

export interface AcceptanceCriteria {
  id: string
  description: string
  isMet: boolean
}

export interface UserStory {
  id: string
  epicId: string
  title: string
  description: string
  asA: string // As a...
  iWant: string // I want...
  soThat: string // So that...
  acceptanceCriteria: AcceptanceCriteria[]
  storyPoints: StorySize
  priority: Priority
  status: Status
  iterationId?: string
  releaseId?: string
  assignee?: TeamMember
  tasks: Task[]
  dependencies: string[] // Story IDs
  blockers?: string[]
  createdDate: Date
  completedDate?: Date
  tags: string[]
}

export interface Epic {
  id: string
  title: string
  description: string
  businessValue: number // 1-10
  priority: Priority
  status: Status
  releaseId: string
  userStories: string[] // Story IDs
  startDate?: Date
  endDate?: Date
  progress: number // percentage
  owner: TeamMember
}

export interface Sprint {
  id: string
  name: string
  releaseId: string
  number: number
  goal: string
  startDate: Date
  endDate: Date
  status: SprintStatus
  velocity: number // story points
  targetVelocity: number
  committedStories: string[] // Story IDs
  completedStories: string[]
  teamCapacity: number // total hours
  actualEffort: number // hours spent
  retrospectiveNotes?: string
  dailyStandups: DailyStandup[]
}

export interface DailyStandup {
  date: Date
  attendees: TeamMember[]
  updates: {
    memberId: string
    yesterday: string
    today: string
    blockers: string[]
  }[]
}

export interface Release {
  id: string
  name: string
  version: string
  description: string
  phase: ReleasePhase
  startDate: Date
  endDate: Date
  deploymentDate?: Date
  epics: string[] // Epic IDs
  sprints: string[] // Sprint IDs
  features: Feature[]
  goals: string[]
  risks: Risk[]
  dependencies: Dependency[]
  progress: number
  healthStatus: 'On Track' | 'At Risk' | 'Off Track'
}

export interface Feature {
  id: string
  name: string
  description: string
  category: 'Backend' | 'Frontend' | 'Integration' | 'Infrastructure' | 'UX' | 'AI/ML'
  priority: Priority
  effort: number // in story points
  value: number // business value 1-10
  dependencies: string[]
}

export interface Risk {
  id: string
  description: string
  probability: 'Low' | 'Medium' | 'High'
  impact: 'Low' | 'Medium' | 'High'
  mitigation: string
  owner?: TeamMember
  status: 'Identified' | 'Mitigating' | 'Resolved'
}

export interface Dependency {
  id: string
  from: string // Feature/Story ID
  to: string // Feature/Story ID
  type: 'Blocks' | 'Requires' | 'Related'
  description: string
}

export interface VelocityMetric {
  sprintId: string
  sprintName: string
  planned: number
  completed: number
  carryOver: number
  date: Date
}

export interface CapacityMetric {
  sprintId: string
  teamMemberId: string
  plannedHours: number
  actualHours: number
  availableHours: number
}

export interface PlanningMetrics {
  averageVelocity: number
  velocityTrend: 'Increasing' | 'Stable' | 'Decreasing'
  scopeCreep: number // percentage
  requirementsVolatility: number // percentage
  releaseProgress: number // percentage
  sprintPredictability: number // percentage
  defectRate: number
  customerSatisfaction: number // 1-10
}

export interface BacklogItem {
  id: string
  type: 'Epic' | 'Story' | 'Task' | 'Bug' | 'TechDebt'
  title: string
  priority: Priority
  effort: number
  value: number
  readinessScore: number // 0-100
  investCriteria: {
    independent: boolean
    negotiable: boolean
    valuable: boolean
    estimable: boolean
    small: boolean
    testable: boolean
  }
}

export interface SprintPlanningSession {
  id: string
  sprintId: string
  date: Date
  attendees: TeamMember[]
  selectedStories: UserStory[]
  totalPoints: number
  teamCapacity: number
  confidence: 'High' | 'Medium' | 'Low'
  notes: string
  actions: string[]
}

export interface EstimationSession {
  id: string
  storyId: string
  participants: TeamMember[]
  estimates: {
    memberId: string
    points: StorySize
    reasoning?: string
  }[]
  finalEstimate: StorySize
  consensus: boolean
  duration: number // minutes
  date: Date
}

export interface RetrospectiveItem {
  id: string
  sprintId: string
  category: 'What Went Well' | 'What Could Be Improved' | 'Action Items'
  description: string
  votes: number
  owner?: TeamMember
  status?: 'Open' | 'In Progress' | 'Completed'
}

export interface ValueStreamMetric {
  id: string
  phase: string
  leadTime: number // hours
  processTime: number // hours
  efficiency: number // percentage
  waitTime: number // hours
  rework: number // percentage
}
