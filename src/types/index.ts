/**
 * Comprehensive Type Definitions for PMP Learning Management System
 */

// ============================================================================
// User and Authentication Types
// ============================================================================

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
  preferences?: UserPreferences
  progress?: UserProgress
}

export type UserRole = 'student' | 'instructor' | 'admin'

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'ja' | 'es' | 'fr'
  notifications: NotificationPreferences
  studyReminders: boolean
  autoSave: boolean
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  inApp: boolean
  studyReminders: boolean
  achievementAlerts: boolean
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// ============================================================================
// PMBOK Process Types
// ============================================================================

export interface PMBOKProcess {
  id: string
  name: string
  processGroup: ProcessGroup
  knowledgeArea: KnowledgeArea
  description: string
  inputs: ITTOItem[]
  tools: ITTOItem[]
  outputs: ITTOItem[]
  version: 6 | 7
  difficulty: DifficultyLevel
  estimatedTime: number // in minutes
  prerequisites?: string[]
}

export type ProcessGroup =
  | 'Initiating'
  | 'Planning'
  | 'Executing'
  | 'Monitoring and Controlling'
  | 'Closing'

export type KnowledgeArea =
  | 'Integration Management'
  | 'Scope Management'
  | 'Schedule Management'
  | 'Cost Management'
  | 'Quality Management'
  | 'Resource Management'
  | 'Communications Management'
  | 'Risk Management'
  | 'Procurement Management'
  | 'Stakeholder Management'

export interface ITTOItem {
  id: string
  name: string
  description: string
  category: 'input' | 'tool' | 'technique' | 'output'
  relatedProcesses: string[]
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

// ============================================================================
// Learning Progress Types
// ============================================================================

export interface UserProgress {
  userId: string
  overallProgress: number // 0-100
  processProgress: ProcessProgress[]
  examScores: ExamScore[]
  studyTime: StudyTime
  achievements: Achievement[]
  lastActivity: Date
}

export interface ProcessProgress {
  processId: string
  status: 'not-started' | 'in-progress' | 'completed' | 'mastered'
  completionPercentage: number
  lastStudied: Date
  studyCount: number
  notes?: string
  bookmarked: boolean
}

export interface ExamScore {
  examId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  timeTaken: number // in seconds
  date: Date
  knowledgeAreaScores: Record<KnowledgeArea, number>
}

export interface StudyTime {
  total: number // in minutes
  today: number
  thisWeek: number
  thisMonth: number
  byKnowledgeArea: Record<KnowledgeArea, number>
  byProcessGroup: Record<ProcessGroup, number>
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: Date
  category: AchievementCategory
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export type AchievementCategory =
  | 'study-streak'
  | 'exam-performance'
  | 'completion'
  | 'mastery'
  | 'collaboration'
  | 'contribution'

// ============================================================================
// Exam and Question Types
// ============================================================================

export interface ExamQuestion {
  id: string
  question: string
  options: QuestionOption[]
  correctAnswer: number
  explanation: string
  knowledgeArea: KnowledgeArea
  processGroup: ProcessGroup
  difficulty: DifficultyLevel
  tags: string[]
  imageUrl?: string
}

export interface QuestionOption {
  id: number
  text: string
  isCorrect: boolean
}

export interface MockExam {
  id: string
  name: string
  description: string
  questions: ExamQuestion[]
  duration: number // in minutes
  passingScore: number // percentage
  difficulty: DifficultyLevel
  version: 6 | 7
}

// ============================================================================
// Collaboration Types
// ============================================================================

export interface StudyGroup {
  id: string
  name: string
  description: string
  members: GroupMember[]
  createdBy: string
  createdAt: Date
  isPrivate: boolean
  maxMembers: number
  tags: string[]
  activity: GroupActivity[]
}

export interface GroupMember {
  userId: string
  role: 'owner' | 'moderator' | 'member'
  joinedAt: Date
  contribution: number
}

export interface GroupActivity {
  id: string
  type: 'message' | 'file' | 'quiz' | 'milestone'
  userId: string
  content: string
  timestamp: Date
  reactions?: Reaction[]
}

export interface Reaction {
  emoji: string
  userId: string
}

export interface SharedNote {
  id: string
  title: string
  content: string
  authorId: string
  collaborators: string[]
  processId?: string
  knowledgeArea?: KnowledgeArea
  tags: string[]
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  version: number
}

// ============================================================================
// Visualization Types
// ============================================================================

export interface NetworkNode {
  id: string
  label: string
  type: 'process' | 'input' | 'tool' | 'output'
  group: ProcessGroup | KnowledgeArea
  x?: number
  y?: number
  color?: string
  size?: number
}

export interface NetworkLink {
  source: string
  target: string
  type: 'input' | 'output' | 'dependency'
  strength?: number
  label?: string
}

export interface VisualizationConfig {
  layout: 'force' | 'circular' | 'hierarchical' | 'radial'
  theme: 'default' | 'dark' | 'colorful' | 'minimal'
  showLabels: boolean
  showLegend: boolean
  animationSpeed: number
  nodeSize: 'uniform' | 'byImportance' | 'byConnections'
}

// ============================================================================
// AI Coaching Types
// ============================================================================

export interface AICoachingSession {
  id: string
  userId: string
  topic: string
  messages: ChatMessage[]
  recommendations: Recommendation[]
  startedAt: Date
  endedAt?: Date
  feedback?: SessionFeedback
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

export interface Recommendation {
  id: string
  type: 'study' | 'practice' | 'review' | 'exam'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  estimatedTime: number
  relatedProcesses: string[]
  completed: boolean
}

export interface SessionFeedback {
  rating: 1 | 2 | 3 | 4 | 5
  helpful: boolean
  comments?: string
}

// ============================================================================
// System and Configuration Types
// ============================================================================

export interface SystemConfig {
  apiUrl: string
  wsUrl: string
  analyticsEnabled: boolean
  maintenanceMode: boolean
  features: FeatureFlags
}

export interface FeatureFlags {
  aiCoaching: boolean
  collaboration: boolean
  advancedAnalytics: boolean
  offlineMode: boolean
  betaFeatures: boolean
}

export interface PerformanceMetrics {
  pageLoadTime: number
  apiResponseTime: number
  renderTime: number
  memoryUsage: number
  errorRate: number
  timestamp: Date
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  metadata?: ResponseMetadata
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: Date
}

export interface ResponseMetadata {
  page?: number
  pageSize?: number
  totalCount?: number
  totalPages?: number
  timestamp: Date
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

// ============================================================================
// Form and Validation Types
// ============================================================================

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea'
  value: unknown
  validation?: ValidationRule[]
  options?: SelectOption[]
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom'
  value?: unknown
  message: string
  validator?: (value: unknown) => boolean
}

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

// ============================================================================
// Event Types
// ============================================================================

export interface AppEvent {
  type: string
  payload?: unknown
  timestamp: Date
  userId?: string
  sessionId?: string
}

export interface TouchGesture {
  type: 'tap' | 'swipe' | 'pinch' | 'longPress'
  direction?: 'up' | 'down' | 'left' | 'right'
  startX: number
  startY: number
  endX: number
  endY: number
  duration: number
  distance: number
}

// ============================================================================
// Utility Types
// ============================================================================

export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type AsyncState<T> = {
  data: T | null
  loading: boolean
  error: Error | null
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type ValueOf<T> = T[keyof T]

// Export everything as a namespace for convenience
export * as Types from './index'
