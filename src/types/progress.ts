/**
 * Progress and Learning Types
 * @description Shared types for learning progress, PMBOK processes, and study sessions
 * @module types/progress
 */

// ========================================
// Constants
// ========================================

/** Process Categories (Knowledge Areas) Mapping */
export const processCategories = {
  integration: '統合管理',
  scope: 'スコープ管理',
  schedule: 'スケジュール管理',
  cost: 'コスト管理',
  quality: '品質管理',
  resource: '資源管理',
  communications: 'コミュニケーション管理',
  risk: 'リスク管理',
  procurement: '調達管理',
  stakeholder: 'ステークホルダー管理',
} as const

/** Process Groups Mapping */
export const processGroups = {
  initiating: '立ち上げ',
  planning: '計画',
  executing: '実行',
  monitoring: '監視・コントロール',
  closing: '終結',
} as const

// ========================================
// Type Definitions
// ========================================

/** Process Category (Knowledge Area) Type */
export type ProcessCategory = keyof typeof processCategories

/** Process Group Type */
export type ProcessGroup = keyof typeof processGroups

/**
 * Knowledge Area Definition Interface
 */
export interface KnowledgeArea {
  /** Knowledge Area ID */
  id: ProcessCategory
  /** Knowledge Area Name */
  name: string
  /** Description (Optional) */
  description?: string
}

/**
 * Process Group Definition Interface
 */
export interface ProcessGroupDefinition {
  /** Process Group ID */
  id: ProcessGroup
  /** Process Group Name */
  name: string
  /** Description (Optional) */
  description?: string
}

/**
 * PMBOK Process Definition Interface
 */
export interface PMBOKProcess {
  /** Process Unique ID */
  id: string
  /** Process Name */
  name: string
  /** Knowledge Area */
  knowledgeArea: ProcessCategory
  /** Process Group */
  processGroup: ProcessGroup
  /** Process Description (Optional) */
  description?: string
  /** PMBOK Version (Optional) */
  version?: number[]
}

/**
 * Individual Process Progress Information
 */
export interface ProcessProgress {
  /** Completion Flag */
  completed: boolean
  /** Understanding Level (0-100) */
  understanding: number
  /** User Notes */
  notes: string
  /** Last Study Date */
  lastStudied: string | null
  /** Study Count */
  studyCount?: number
  /** Difficulty Rating (1-5) */
  difficulty?: number
}

/**
 * Flashcard Learning Session Record
 */
export interface FlashCardSession {
  /** Session Timestamp */
  timestamp: string
  /** Total Cards */
  totalCards: number
  /** Correct Answers */
  correctAnswers: number
  /** Duration (minutes) */
  duration: number
  /** Session Type */
  sessionType: 'itto' | 'general' | 'custom'
  /** Target Area (Optional) */
  targetArea?: ProcessCategory
}

/**
 * Mock Exam Result Record
 */
export interface ExamResult {
  /** Exam Timestamp */
  timestamp: string
  /** Exam Results Detail */
  results: {
    /** Total Score */
    score: number
    /** Correct Answers */
    correct: number
    /** Total Questions */
    total: number
    /** Domain Scores */
    domainScores: Record<string, number>
    /** Time Spent (minutes) */
    timeSpent: number
  }
  /** Exam Type */
  examType: 'full' | 'domain' | 'quick'
  /** Passed Flag */
  passed: boolean
}

/**
 * Study Session Record
 */
export interface StudySession {
  /** Session Date */
  date: string
  /** Duration (minutes) */
  duration: number
  /** Process Count */
  processCount: number
  /** Session Type */
  type?: 'reading' | 'practice' | 'review' | 'exam'
  /** Focus Area */
  focusArea?: ProcessCategory
}

/**
 * Learning Goal Setting
 */
export interface LearningGoal {
  /** Goal ID */
  id: string
  /** Goal Title */
  title: string
  /** Goal Description */
  description: string
  /** Deadline */
  deadline: string
  /** Completed Flag */
  completed: boolean
  /** Created At */
  createdAt: string
}

/**
 * Comprehensive Progress Data Structure
 */
export interface ProgressData {
  /** Knowledge Area Progress */
  knowledgeAreas: Record<ProcessCategory, unknown>
  /** Process Group Progress */
  processGroups: Record<ProcessGroup, unknown>
  /** Individual Process Progress */
  processes: Record<string, ProcessProgress>
  /** Study Session History */
  studySessions: StudySession[]
  /** Flashcard Session History */
  flashCardSessions?: FlashCardSession[]
  /** Exam Results History */
  examResults?: ExamResult[]
  /** Learning Goals */
  goals: Record<string, LearningGoal>
  /** Last Updated */
  lastUpdated: string | null
}

/**
 * Process Data Structure
 */
export interface ProcessData {
  /** Knowledge Areas List */
  knowledgeAreas: KnowledgeArea[]
  /** Process Groups List */
  processGroups: ProcessGroupDefinition[]
  /** Processes List */
  processes: PMBOKProcess[]
}

/**
 * Flashcard Statistics Information
 */
export interface FlashCardStats {
  /** Total Sessions */
  totalSessions: number
  /** Total Cards */
  totalCards: number
  /** Average Accuracy */
  averageAccuracy: number
  /** Total Study Time (minutes) */
  totalStudyTime: number
  /** Last Session */
  lastSession: string | null
}

/**
 * Mock Exam Statistics Information
 */
export interface ExamStats {
  /** Total Exams */
  totalExams: number
  /** Average Score */
  averageScore: number
  /** Highest Score */
  highestScore: number
  /** Pass Count */
  passCount: number
  /** Latest Exam Date */
  latestExam: string | null
}

/**
 * Study Statistics Information
 */
export interface StudyStats {
  /** Total Study Time (minutes) */
  totalStudyTime: number
  /** Total Sessions */
  totalSessions: number
  /** Average Session Duration (minutes) */
  averageSessionDuration: number
  /** Study Streak (days) */
  currentStreak: number
  /** Longest Streak (days) */
  longestStreak: number
  /** Last Study Date */
  lastStudyDate: string | null
}

/**
 * Progress Statistics (Aggregate)
 */
export interface ProgressStatistics {
  /** Overall Progress Percentage */
  overallProgress: number
  /** Processes Completed */
  processesCompleted: number
  /** Total Processes */
  totalProcesses: number
  /** Flashcard Statistics */
  flashCardStats: FlashCardStats
  /** Exam Statistics */
  examStats: ExamStats
  /** Study Statistics */
  studyStats: StudyStats
  /** Knowledge Area Statistics */
  knowledgeAreaStats: Record<
    ProcessCategory,
    {
      progress: number
      completedProcesses: number
      totalProcesses: number
    }
  >
}