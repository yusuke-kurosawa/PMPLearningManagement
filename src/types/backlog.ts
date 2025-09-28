/**
 * Backlog Management System Type Definitions
 * Comprehensive types for Product/Sprint Backlog management
 */

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low'
export type StoryStatus =
  | 'New'
  | 'Refined'
  | 'Ready'
  | 'In Progress'
  | 'Review'
  | 'Done'
  | 'Blocked'
export type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Done'
export type StoryPoints = 1 | 2 | 3 | 5 | 8 | 13 | 21
export type EpicCategory =
  | 'Learning'
  | 'Assessment'
  | 'Analytics'
  | 'AI'
  | 'Infrastructure'
  | 'Collaboration'
  | 'Mobile'
  | 'Performance'

export interface Epic {
  id: string
  title: string
  description: string
  category: EpicCategory
  businessValue: number // 1-10
  targetRelease: string
  status: 'Planned' | 'In Progress' | 'Completed'
  stories: string[] // story IDs
}

export interface AcceptanceCriteria {
  id: string
  description: string
  completed: boolean
}

export interface UserStory {
  id: string
  epicId: string
  title: string
  description: string
  asA: string // User role
  iWant: string // Goal
  soThat: string // Benefit
  acceptanceCriteria: AcceptanceCriteria[]
  priority: Priority
  status: StoryStatus
  storyPoints?: StoryPoints
  businessValue: number // 1-10
  userValue: number // 1-10
  effort: number // 1-10
  tags: string[]
  dependencies: string[] // IDs of dependent stories
  blockers: string[]
  assignee?: string
  createdAt: string
  updatedAt: string
  refinedAt?: string
  sprintId?: string
  comments: Comment[]
  votes: number // Stakeholder votes
}

export interface Task {
  id: string
  storyId: string
  title: string
  description: string
  status: TaskStatus
  assignee?: string
  estimatedHours: number
  actualHours?: number
  createdAt: string
  updatedAt: string
}

export interface TechnicalSpike {
  id: string
  title: string
  description: string
  purpose: string
  timeboxHours: number
  findings?: string
  status: 'Planned' | 'In Progress' | 'Completed'
  relatedStories: string[]
}

export interface Sprint {
  id: string
  name: string
  goal: string
  startDate: string
  endDate: string
  status: 'Planning' | 'Active' | 'Review' | 'Retrospective' | 'Completed'
  capacity: number // Total story points
  commitment: number // Committed story points
  completed: number // Completed story points
  storyIds: string[]
  velocityTarget: number
  impediments: Impediment[]
}

export interface Impediment {
  id: string
  description: string
  severity: 'High' | 'Medium' | 'Low'
  status: 'Open' | 'In Progress' | 'Resolved'
  reportedBy: string
  reportedAt: string
  resolvedAt?: string
}

export interface TeamMember {
  id: string
  name: string
  role: 'Product Owner' | 'Scrum Master' | 'Developer' | 'Designer' | 'QA' | 'Stakeholder'
  capacity: number // Hours per sprint
  avatar?: string
}

export interface Comment {
  id: string
  userId: string
  userName: string
  text: string
  createdAt: string
}

export interface BacklogMetrics {
  totalStories: number
  readyStories: number
  inProgressStories: number
  completedStories: number
  averageStoryPoints: number
  averageVelocity: number
  totalBusinessValue: number
  refinementRate: number // Percentage of stories refined
}

export interface VelocityData {
  sprintName: string
  committed: number
  completed: number
  date: string
}

export interface ValueEffortMatrix {
  storyId: string
  value: number
  effort: number
  priority: Priority
}

export interface RefinementChecklist {
  hasDescription: boolean
  hasAcceptanceCriteria: boolean
  hasEstimation: boolean
  hasPriority: boolean
  hasDependenciesReviewed: boolean
  isINVEST: boolean // Independent, Negotiable, Valuable, Estimable, Small, Testable
}

export interface ProductBacklog {
  stories: UserStory[]
  epics: Epic[]
  spikes: TechnicalSpike[]
  lastUpdated: string
}

export interface SprintBacklog {
  sprint: Sprint
  stories: UserStory[]
  tasks: Task[]
  dailyProgress: DailyProgress[]
}

export interface DailyProgress {
  date: string
  remainingPoints: number
  completedPoints: number
  addedPoints: number
}

export interface DefinitionOfReady {
  criteria: string[]
  checklist: { [key: string]: boolean }
}

export interface DefinitionOfDone {
  criteria: string[]
  checklist: { [key: string]: boolean }
}

// Story Splitting Patterns
export type SplittingPattern =
  | 'workflow-steps'
  | 'business-rules'
  | 'happy-sad-paths'
  | 'simple-complex'
  | 'data-variations'
  | 'operations-crud'
  | 'defer-performance'
  | 'spike-implementation'

export interface StorySplit {
  pattern: SplittingPattern
  originalStoryId: string
  splitStories: Partial<UserStory>[]
  reason: string
}
