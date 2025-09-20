/**
 * Learning Domain Interfaces
 * @description Domain interfaces for learning management functionality
 * @module interfaces/domain/learning
 */

import {
  IEntity,
  IAggregateRoot,
  IValueObject,
  IRepository,
  IDomainService,
  ICommand,
  IQuery,
  IValidationResult,
} from '../core/base.interfaces'

// ============================================================================
// PMBOK Domain Interfaces
// ============================================================================

/**
 * PMBOK Process interface
 */
export interface IPMBOKProcess extends IEntity<IPMBOKProcessData> {
  readonly processId: string
  readonly name: string
  readonly processGroup: IProcessGroup
  readonly knowledgeArea: IKnowledgeArea
  readonly description: string
  readonly version: PMBOKVersion

  /**
   * Gets process inputs
   */
  getInputs(): IITTO[]

  /**
   * Gets process tools and techniques
   */
  getToolsAndTechniques(): IITTO[]

  /**
   * Gets process outputs
   */
  getOutputs(): IITTO[]

  /**
   * Gets related processes
   */
  getRelatedProcesses(): IPMBOKProcess[]

  /**
   * Checks if process belongs to a specific knowledge area
   */
  belongsToKnowledgeArea(area: string): boolean

  /**
   * Checks if process belongs to a specific process group
   */
  belongsToProcessGroup(group: string): boolean
}

/**
 * Process Group interface
 */
export interface IProcessGroup extends IValueObject<ProcessGroupData> {
  readonly name: ProcessGroupName
  readonly description: string
  readonly order: number

  /**
   * Gets all processes in this group
   */
  getProcesses(): IPMBOKProcess[]

  /**
   * Checks if a process belongs to this group
   */
  containsProcess(processId: string): boolean
}

/**
 * Knowledge Area interface
 */
export interface IKnowledgeArea extends IValueObject<KnowledgeAreaData> {
  readonly name: KnowledgeAreaName
  readonly description: string
  readonly order: number

  /**
   * Gets all processes in this area
   */
  getProcesses(): IPMBOKProcess[]

  /**
   * Gets key concepts for this area
   */
  getKeyConcepts(): string[]

  /**
   * Gets area complexity level
   */
  getComplexityLevel(): ComplexityLevel
}

/**
 * ITTO (Input, Tool, Technique, Output) interface
 */
export interface IITTO extends IEntity<IITTOData> {
  readonly name: string
  readonly description: string
  readonly type: ITTOType
  readonly category?: string

  /**
   * Gets processes that use this ITTO
   */
  getRelatedProcesses(): IPMBOKProcess[]

  /**
   * Checks if ITTO is an input for a process
   */
  isInputFor(processId: string): boolean

  /**
   * Checks if ITTO is an output from a process
   */
  isOutputFrom(processId: string): boolean

  /**
   * Gets ITTO dependencies
   */
  getDependencies(): IITTO[]
}

// ============================================================================
// Learning Path Interfaces
// ============================================================================

/**
 * Learning Path aggregate root
 */
export interface ILearningPath extends IAggregateRoot<ILearningPathData> {
  readonly userId: string
  readonly title: string
  readonly description: string
  readonly targetCertification: CertificationType
  readonly estimatedDuration: number // in hours
  readonly progress: number // 0-100

  /**
   * Adds a learning module to the path
   */
  addModule(module: ILearningModule): void

  /**
   * Removes a module from the path
   */
  removeModule(moduleId: string): void

  /**
   * Updates module progress
   */
  updateModuleProgress(moduleId: string, progress: number): void

  /**
   * Gets current module
   */
  getCurrentModule(): ILearningModule | null

  /**
   * Gets next recommended module
   */
  getNextModule(): ILearningModule | null

  /**
   * Calculates overall progress
   */
  calculateProgress(): number

  /**
   * Gets completion estimate
   */
  getEstimatedCompletionDate(): Date

  /**
   * Marks path as completed
   */
  complete(): void
}

/**
 * Learning Module interface
 */
export interface ILearningModule extends IEntity<ILearningModuleData> {
  readonly title: string
  readonly description: string
  readonly type: ModuleType
  readonly duration: number // in minutes
  readonly difficulty: DifficultyLevel
  readonly prerequisites: string[]

  /**
   * Gets module content
   */
  getContent(): ILearningContent[]

  /**
   * Gets module assessments
   */
  getAssessments(): IAssessment[]

  /**
   * Checks if prerequisites are met
   */
  arePrerequisitesMet(completedModules: string[]): boolean

  /**
   * Gets module learning objectives
   */
  getLearningObjectives(): string[]

  /**
   * Tracks module engagement
   */
  trackEngagement(userId: string, duration: number): void
}

/**
 * Learning Content interface
 */
export interface ILearningContent extends IEntity<ILearningContentData> {
  readonly title: string
  readonly type: ContentType
  readonly content: string | ArrayBuffer
  readonly metadata: ContentMetadata
  readonly tags: string[]

  /**
   * Renders content for display
   */
  render(): string | React.ReactNode

  /**
   * Gets content duration
   */
  getDuration(): number

  /**
   * Tracks content view
   */
  trackView(userId: string): void

  /**
   * Gets related content
   */
  getRelatedContent(): ILearningContent[]
}

// ============================================================================
// Assessment Interfaces
// ============================================================================

/**
 * Assessment interface
 */
export interface IAssessment extends IAggregateRoot<IAssessmentData> {
  readonly title: string
  readonly type: AssessmentType
  readonly duration: number // in minutes
  readonly passingScore: number // percentage
  readonly questions: IQuestion[]
  readonly knowledgeAreas: IKnowledgeArea[]

  /**
   * Starts the assessment
   */
  start(userId: string): IAssessmentSession

  /**
   * Submits an answer
   */
  submitAnswer(sessionId: string, questionId: string, answer: unknown): void

  /**
   * Completes the assessment
   */
  complete(sessionId: string): IAssessmentResult

  /**
   * Gets assessment statistics
   */
  getStatistics(): IAssessmentStatistics

  /**
   * Generates a practice assessment
   */
  generatePractice(count: number): IAssessment
}

/**
 * Question interface
 */
export interface IQuestion extends IEntity<IQuestionData> {
  readonly text: string
  readonly type: QuestionType
  readonly options?: IQuestionOption[]
  readonly correctAnswer: unknown
  readonly explanation: string
  readonly difficulty: DifficultyLevel
  readonly knowledgeArea: IKnowledgeArea
  readonly processGroup?: IProcessGroup
  readonly tags: string[]

  /**
   * Validates an answer
   */
  validateAnswer(answer: unknown): boolean

  /**
   * Gets question hints
   */
  getHints(): string[]

  /**
   * Gets related learning content
   */
  getRelatedContent(): ILearningContent[]

  /**
   * Tracks question performance
   */
  trackPerformance(correct: boolean, timeSpent: number): void
}

/**
 * Question Option interface
 */
export interface IQuestionOption extends IValueObject<IQuestionOptionData> {
  readonly id: string
  readonly text: string
  readonly isCorrect: boolean
  readonly explanation?: string
}

/**
 * Assessment Session interface
 */
export interface IAssessmentSession extends IEntity<IAssessmentSessionData> {
  readonly assessmentId: string
  readonly userId: string
  readonly startedAt: Date
  readonly endedAt?: Date
  readonly answers: Map<string, unknown>
  readonly timeRemaining: number

  /**
   * Records an answer
   */
  recordAnswer(questionId: string, answer: unknown): void

  /**
   * Gets unanswered questions
   */
  getUnansweredQuestions(): IQuestion[]

  /**
   * Calculates current score
   */
  calculateScore(): number

  /**
   * Pauses the session
   */
  pause(): void

  /**
   * Resumes the session
   */
  resume(): void
}

/**
 * Assessment Result interface
 */
export interface IAssessmentResult extends IEntity<IAssessmentResultData> {
  readonly sessionId: string
  readonly userId: string
  readonly assessmentId: string
  readonly score: number
  readonly passed: boolean
  readonly completedAt: Date
  readonly timeSpent: number
  readonly detailedResults: IDetailedResult[]

  /**
   * Gets performance by knowledge area
   */
  getKnowledgeAreaPerformance(): Map<string, number>

  /**
   * Gets performance by process group
   */
  getProcessGroupPerformance(): Map<string, number>

  /**
   * Gets weak areas
   */
  getWeakAreas(): IKnowledgeArea[]

  /**
   * Gets strong areas
   */
  getStrongAreas(): IKnowledgeArea[]

  /**
   * Generates improvement recommendations
   */
  generateRecommendations(): ILearningRecommendation[]
}

// ============================================================================
// Progress Tracking Interfaces
// ============================================================================

/**
 * User Progress aggregate root
 */
export interface IUserProgress extends IAggregateRoot<IUserProgressData> {
  readonly userId: string
  readonly overallProgress: number
  readonly studyStreak: number
  readonly totalStudyTime: number
  readonly lastActivityAt: Date

  /**
   * Updates process progress
   */
  updateProcessProgress(processId: string, progress: number): void

  /**
   * Records study time
   */
  recordStudyTime(minutes: number, area?: IKnowledgeArea): void

  /**
   * Adds achievement
   */
  addAchievement(achievement: IAchievement): void

  /**
   * Gets progress by knowledge area
   */
  getProgressByKnowledgeArea(): Map<string, number>

  /**
   * Gets progress by process group
   */
  getProgressByProcessGroup(): Map<string, number>

  /**
   * Calculates readiness score
   */
  calculateReadinessScore(): number

  /**
   * Gets learning velocity
   */
  getLearningVelocity(): number
}

/**
 * Achievement interface
 */
export interface IAchievement extends IEntity<IAchievementData> {
  readonly name: string
  readonly description: string
  readonly icon: string
  readonly category: AchievementCategory
  readonly rarity: AchievementRarity
  readonly points: number
  readonly unlockedAt?: Date

  /**
   * Checks if achievement is unlocked
   */
  isUnlocked(progress: IUserProgress): boolean

  /**
   * Gets unlock criteria
   */
  getUnlockCriteria(): string

  /**
   * Awards achievement to user
   */
  award(userId: string): void
}

/**
 * Study Session interface
 */
export interface IStudySession extends IEntity<IStudySessionData> {
  readonly userId: string
  readonly startedAt: Date
  readonly endedAt?: Date
  readonly duration: number
  readonly focusArea?: IKnowledgeArea
  readonly processesStudied: string[]
  readonly noteTaken: boolean

  /**
   * Ends the study session
   */
  end(): void

  /**
   * Adds studied process
   */
  addStudiedProcess(processId: string): void

  /**
   * Calculates session effectiveness
   */
  calculateEffectiveness(): number

  /**
   * Gets session summary
   */
  getSummary(): ISessionSummary
}

// ============================================================================
// Recommendation Interfaces
// ============================================================================

/**
 * Learning Recommendation interface
 */
export interface ILearningRecommendation extends IEntity<IRecommendationData> {
  readonly type: RecommendationType
  readonly title: string
  readonly description: string
  readonly priority: Priority
  readonly estimatedTime: number
  readonly targetArea?: IKnowledgeArea
  readonly targetProcess?: IPMBOKProcess
  readonly resources: ILearningContent[]

  /**
   * Accepts the recommendation
   */
  accept(): void

  /**
   * Dismisses the recommendation
   */
  dismiss(): void

  /**
   * Gets recommendation score
   */
  getScore(): number

  /**
   * Tracks recommendation effectiveness
   */
  trackEffectiveness(helpful: boolean): void
}

/**
 * AI Coaching interface
 */
export interface IAICoaching extends IDomainService {
  /**
   * Generates personalized recommendations
   */
  generateRecommendations(
    userId: string,
    context: ILearningContext
  ): Promise<ILearningRecommendation[]>

  /**
   * Analyzes learning patterns
   */
  analyzeLearningPatterns(userId: string): Promise<ILearningPatternAnalysis>

  /**
   * Predicts exam readiness
   */
  predictExamReadiness(userId: string): Promise<IReadinessPrediction>

  /**
   * Provides adaptive feedback
   */
  provideAdaptiveFeedback(sessionId: string): Promise<IAdaptiveFeedback>

  /**
   * Suggests study schedule
   */
  suggestStudySchedule(userId: string, targetDate: Date): Promise<IStudySchedule>
}

// ============================================================================
// Repository Interfaces
// ============================================================================

/**
 * Learning Path Repository
 */
export interface ILearningPathRepository extends IRepository<ILearningPath, string> {
  /**
   * Finds paths by user
   */
  findByUser(userId: string): Promise<ILearningPath[]>

  /**
   * Finds active paths
   */
  findActive(userId: string): Promise<ILearningPath[]>

  /**
   * Finds paths by certification
   */
  findByCertification(certification: CertificationType): Promise<ILearningPath[]>
}

/**
 * Assessment Repository
 */
export interface IAssessmentRepository extends IRepository<IAssessment, string> {
  /**
   * Finds assessments by type
   */
  findByType(type: AssessmentType): Promise<IAssessment[]>

  /**
   * Finds assessments by knowledge area
   */
  findByKnowledgeArea(area: IKnowledgeArea): Promise<IAssessment[]>

  /**
   * Gets popular assessments
   */
  findPopular(limit: number): Promise<IAssessment[]>
}

/**
 * Progress Repository
 */
export interface IProgressRepository extends IRepository<IUserProgress, string> {
  /**
   * Finds progress by user
   */
  findByUser(userId: string): Promise<IUserProgress | null>

  /**
   * Gets leaderboard
   */
  getLeaderboard(limit: number): Promise<IUserProgress[]>

  /**
   * Finds users by progress range
   */
  findByProgressRange(min: number, max: number): Promise<IUserProgress[]>
}

// ============================================================================
// Command and Query Interfaces
// ============================================================================

/**
 * Start Learning Path Command
 */
export interface IStartLearningPathCommand extends ICommand {
  readonly certification: CertificationType
  readonly targetDate: Date
  readonly studyHoursPerDay: number
}

/**
 * Submit Assessment Command
 */
export interface ISubmitAssessmentCommand extends ICommand {
  readonly sessionId: string
  readonly answers: Map<string, unknown>
}

/**
 * Get Learning Progress Query
 */
export interface IGetLearningProgressQuery extends IQuery {
  readonly includeDetails: boolean
  readonly dateRange?: { start: Date; end: Date }
}

/**
 * Get Recommendations Query
 */
export interface IGetRecommendationsQuery extends IQuery {
  readonly count: number
  readonly filterByArea?: string
  readonly includeCompleted: boolean
}

// ============================================================================
// Type Definitions
// ============================================================================

export type PMBOKVersion = 6 | 7

export type ProcessGroupName =
  | 'Initiating'
  | 'Planning'
  | 'Executing'
  | 'Monitoring and Controlling'
  | 'Closing'

export type KnowledgeAreaName =
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

export type ITTOType = 'input' | 'tool' | 'technique' | 'output'

export type CertificationType = 'PMP' | 'CAPM' | 'PMI-ACP' | 'PMI-RMP'

export type ModuleType = 'video' | 'reading' | 'interactive' | 'practice' | 'assessment'

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export type ContentType = 'video' | 'article' | 'infographic' | 'simulation' | 'flashcard'

export type AssessmentType = 'quiz' | 'mock-exam' | 'practice' | 'diagnostic' | 'final'

export type QuestionType = 'multiple-choice' | 'true-false' | 'drag-drop' | 'hotspot' | 'scenario'

export type AchievementCategory =
  | 'study-streak'
  | 'exam-performance'
  | 'completion'
  | 'mastery'
  | 'collaboration'

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary'

export type RecommendationType = 'study' | 'practice' | 'review' | 'assessment' | 'break'

export type Priority = 'low' | 'medium' | 'high' | 'critical'

export type ComplexityLevel = 'simple' | 'moderate' | 'complex' | 'very-complex'

// ============================================================================
// Data Interfaces
// ============================================================================

export interface IPMBOKProcessData {
  processId: string
  name: string
  processGroup: ProcessGroupName
  knowledgeArea: KnowledgeAreaName
  description: string
  version: PMBOKVersion
  inputs: IITTOData[]
  tools: IITTOData[]
  outputs: IITTOData[]
}

export interface IITTOData {
  id: string
  name: string
  description: string
  type: ITTOType
  category?: string
  relatedProcessIds: string[]
}

export interface ProcessGroupData {
  name: ProcessGroupName
  description: string
  order: number
}

export interface KnowledgeAreaData {
  name: KnowledgeAreaName
  description: string
  order: number
  keyConcepts: string[]
  complexity: ComplexityLevel
}

export interface ILearningPathData {
  userId: string
  title: string
  description: string
  targetCertification: CertificationType
  modules: ILearningModuleData[]
  estimatedDuration: number
  progress: number
  startedAt: Date
  completedAt?: Date
}

export interface ILearningModuleData {
  id: string
  title: string
  description: string
  type: ModuleType
  duration: number
  difficulty: DifficultyLevel
  prerequisites: string[]
  content: ILearningContentData[]
  assessments: string[]
  progress: number
}

export interface ILearningContentData {
  id: string
  title: string
  type: ContentType
  content: string | ArrayBuffer
  metadata: ContentMetadata
  tags: string[]
  duration: number
}

export interface ContentMetadata {
  author?: string
  source?: string
  lastUpdated?: Date
  version?: string
  format?: string
  size?: number
}

export interface IAssessmentData {
  id: string
  title: string
  type: AssessmentType
  duration: number
  passingScore: number
  questions: IQuestionData[]
  knowledgeAreas: string[]
}

export interface IQuestionData {
  id: string
  text: string
  type: QuestionType
  options?: IQuestionOptionData[]
  correctAnswer: unknown
  explanation: string
  difficulty: DifficultyLevel
  knowledgeArea: string
  processGroup?: string
  tags: string[]
  hints: string[]
}

export interface IQuestionOptionData {
  id: string
  text: string
  isCorrect: boolean
  explanation?: string
}

export interface IAssessmentSessionData {
  id: string
  assessmentId: string
  userId: string
  startedAt: Date
  endedAt?: Date
  answers: Record<string, unknown>
  timeRemaining: number
  paused: boolean
}

export interface IAssessmentResultData {
  id: string
  sessionId: string
  userId: string
  assessmentId: string
  score: number
  passed: boolean
  completedAt: Date
  timeSpent: number
  detailedResults: IDetailedResult[]
}

export interface IDetailedResult {
  questionId: string
  answer: unknown
  correct: boolean
  timeSpent: number
}

export interface IUserProgressData {
  userId: string
  overallProgress: number
  processProgress: Map<string, number>
  knowledgeAreaProgress: Map<string, number>
  processGroupProgress: Map<string, number>
  studyStreak: number
  totalStudyTime: number
  achievements: string[]
  lastActivityAt: Date
}

export interface IAchievementData {
  id: string
  name: string
  description: string
  icon: string
  category: AchievementCategory
  rarity: AchievementRarity
  points: number
  criteria: string
}

export interface IStudySessionData {
  id: string
  userId: string
  startedAt: Date
  endedAt?: Date
  duration: number
  focusArea?: string
  processesStudied: string[]
  noteTaken: boolean
  effectiveness: number
}

export interface ISessionSummary {
  duration: number
  processesStudied: number
  knowledgeAreasCovered: string[]
  effectiveness: number
  keyTakeaways: string[]
}

export interface IRecommendationData {
  id: string
  type: RecommendationType
  title: string
  description: string
  priority: Priority
  estimatedTime: number
  targetArea?: string
  targetProcess?: string
  resourceIds: string[]
  score: number
}

export interface ILearningContext {
  currentProgress: IUserProgress
  recentAssessments: IAssessmentResult[]
  studyHistory: IStudySession[]
  preferences: ILearningPreferences
}

export interface ILearningPreferences {
  preferredContentTypes: ContentType[]
  studyTimePreference: 'morning' | 'afternoon' | 'evening' | 'night'
  sessionDuration: number
  difficulty: DifficultyLevel
}

export interface ILearningPatternAnalysis {
  peakPerformanceTimes: string[]
  preferredContentTypes: ContentType[]
  averageSessionDuration: number
  strongAreas: IKnowledgeArea[]
  weakAreas: IKnowledgeArea[]
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
}

export interface IReadinessPrediction {
  readinessScore: number
  predictedExamScore: number
  confidence: number
  recommendedStudyHours: number
  areasNeedingImprovement: IKnowledgeArea[]
}

export interface IAdaptiveFeedback {
  sessionId: string
  overallPerformance: 'excellent' | 'good' | 'fair' | 'needs-improvement'
  strengths: string[]
  improvements: string[]
  nextSteps: string[]
  motivationalMessage: string
}

export interface IStudySchedule {
  userId: string
  targetDate: Date
  dailySchedule: IDailyStudyPlan[]
  milestones: IStudyMilestone[]
  totalHours: number
}

export interface IDailyStudyPlan {
  date: Date
  duration: number
  focusArea: IKnowledgeArea
  modules: ILearningModule[]
  assessments: IAssessment[]
}

export interface IStudyMilestone {
  date: Date
  title: string
  description: string
  targetProgress: number
}

export interface IAssessmentStatistics {
  totalAttempts: number
  averageScore: number
  passRate: number
  averageTime: number
  difficultyDistribution: Map<DifficultyLevel, number>
}

// Export all interfaces as a namespace
export * as LearningInterfaces from './learning.interfaces'
