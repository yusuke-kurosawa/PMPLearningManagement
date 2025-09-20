/**
 * Collaboration Domain Interfaces
 * @description Domain interfaces for collaboration and social learning features
 * @module interfaces/domain/collaboration
 */

import {
  IEntity,
  IAggregateRoot,
  IValueObject,
  IRepository,
  IDomainService,
  ICommand,
  IQuery,
  IDomainEvent,
  IValidationResult,
} from '../core/base.interfaces'

import {
  IKnowledgeArea,
  IProcessGroup,
  IPMBOKProcess,
  ILearningContent,
  IUserProgress,
} from './learning.interfaces'

// ============================================================================
// Study Group Interfaces
// ============================================================================

/**
 * Study Group aggregate root
 */
export interface IStudyGroup extends IAggregateRoot<IStudyGroupData> {
  readonly groupId: string
  readonly name: string
  readonly description: string
  readonly ownerId: string
  readonly members: IGroupMember[]
  readonly settings: IGroupSettings
  readonly createdAt: Date
  readonly isActive: boolean

  /**
   * Adds a member to the group
   */
  addMember(userId: string, role?: MemberRole): void

  /**
   * Removes a member from the group
   */
  removeMember(userId: string): void

  /**
   * Updates member role
   */
  updateMemberRole(userId: string, role: MemberRole): void

  /**
   * Posts an announcement
   */
  postAnnouncement(announcement: IAnnouncement): void

  /**
   * Schedules a study session
   */
  scheduleSession(session: IGroupStudySession): void

  /**
   * Archives the group
   */
  archive(): void

  /**
   * Gets group statistics
   */
  getStatistics(): IGroupStatistics

  /**
   * Checks if user can perform action
   */
  canUserPerformAction(userId: string, action: GroupAction): boolean
}

/**
 * Group Member interface
 */
export interface IGroupMember extends IValueObject<IGroupMemberData> {
  readonly userId: string
  readonly role: MemberRole
  readonly joinedAt: Date
  readonly contributionScore: number
  readonly isActive: boolean

  /**
   * Updates contribution score
   */
  updateContribution(points: number): void

  /**
   * Gets member permissions
   */
  getPermissions(): GroupPermission[]

  /**
   * Checks if member has permission
   */
  hasPermission(permission: GroupPermission): boolean
}

/**
 * Group Settings interface
 */
export interface IGroupSettings extends IValueObject<IGroupSettingsData> {
  readonly isPrivate: boolean
  readonly maxMembers: number
  readonly allowInvites: boolean
  readonly requireApproval: boolean
  readonly studyFocus: IKnowledgeArea[]
  readonly targetCertification?: string
  readonly language: string
  readonly timezone: string

  /**
   * Validates settings
   */
  validate(): IValidationResult

  /**
   * Updates a setting
   */
  update(key: string, value: unknown): IGroupSettings
}

/**
 * Group Study Session interface
 */
export interface IGroupStudySession extends IEntity<IGroupStudySessionData> {
  readonly sessionId: string
  readonly groupId: string
  readonly title: string
  readonly description: string
  readonly scheduledAt: Date
  readonly duration: number // in minutes
  readonly facilitatorId: string
  readonly attendees: ISessionAttendee[]
  readonly materials: IStudyMaterial[]
  readonly meetingUrl?: string

  /**
   * Adds an attendee
   */
  addAttendee(userId: string): void

  /**
   * Removes an attendee
   */
  removeAttendee(userId: string): void

  /**
   * Adds study material
   */
  addMaterial(material: IStudyMaterial): void

  /**
   * Starts the session
   */
  start(): void

  /**
   * Ends the session
   */
  end(): void

  /**
   * Records session notes
   */
  recordNotes(notes: string): void

  /**
   * Gets session recording
   */
  getRecording(): ISessionRecording | null
}

// ============================================================================
// Discussion Forum Interfaces
// ============================================================================

/**
 * Discussion Thread aggregate root
 */
export interface IDiscussionThread extends IAggregateRoot<IDiscussionThreadData> {
  readonly threadId: string
  readonly title: string
  readonly authorId: string
  readonly category: DiscussionCategory
  readonly tags: string[]
  readonly posts: IDiscussionPost[]
  readonly isPinned: boolean
  readonly isLocked: boolean
  readonly viewCount: number

  /**
   * Adds a post to the thread
   */
  addPost(post: IDiscussionPost): void

  /**
   * Edits a post
   */
  editPost(postId: string, content: string): void

  /**
   * Deletes a post
   */
  deletePost(postId: string): void

  /**
   * Pins the thread
   */
  pin(): void

  /**
   * Locks the thread
   */
  lock(): void

  /**
   * Adds a reaction to a post
   */
  addReaction(postId: string, userId: string, reaction: string): void

  /**
   * Marks as resolved
   */
  markAsResolved(): void

  /**
   * Gets thread engagement score
   */
  getEngagementScore(): number
}

/**
 * Discussion Post interface
 */
export interface IDiscussionPost extends IEntity<IDiscussionPostData> {
  readonly postId: string
  readonly threadId: string
  readonly authorId: string
  readonly content: string
  readonly parentId?: string // for nested replies
  readonly createdAt: Date
  readonly updatedAt?: Date
  readonly reactions: IReaction[]
  readonly mentions: string[]
  readonly attachments: IAttachment[]
  readonly isAnswer: boolean

  /**
   * Edits the post content
   */
  edit(content: string): void

  /**
   * Adds a reaction
   */
  addReaction(reaction: IReaction): void

  /**
   * Removes a reaction
   */
  removeReaction(userId: string, emoji: string): void

  /**
   * Marks as answer
   */
  markAsAnswer(): void

  /**
   * Gets reply count
   */
  getReplyCount(): number

  /**
   * Reports the post
   */
  report(reason: string): void
}

/**
 * Reaction interface
 */
export interface IReaction extends IValueObject<IReactionData> {
  readonly emoji: string
  readonly userId: string
  readonly timestamp: Date
}

// ============================================================================
// Shared Resources Interfaces
// ============================================================================

/**
 * Shared Note aggregate root
 */
export interface ISharedNote extends IAggregateRoot<ISharedNoteData> {
  readonly noteId: string
  readonly title: string
  readonly content: string
  readonly authorId: string
  readonly collaborators: ICollaborator[]
  readonly relatedProcess?: IPMBOKProcess
  readonly tags: string[]
  readonly version: number
  readonly isPublic: boolean

  /**
   * Updates note content
   */
  updateContent(content: string, userId: string): void

  /**
   * Adds a collaborator
   */
  addCollaborator(userId: string, permission: CollaboratorPermission): void

  /**
   * Removes a collaborator
   */
  removeCollaborator(userId: string): void

  /**
   * Creates a new version
   */
  createVersion(): INoteVersion

  /**
   * Restores a previous version
   */
  restoreVersion(versionId: string): void

  /**
   * Adds a comment
   */
  addComment(comment: INoteComment): void

  /**
   * Exports note to format
   */
  export(format: ExportFormat): string | ArrayBuffer

  /**
   * Gets note history
   */
  getHistory(): INoteHistory[]
}

/**
 * Collaborator interface
 */
export interface ICollaborator extends IValueObject<ICollaboratorData> {
  readonly userId: string
  readonly permission: CollaboratorPermission
  readonly addedAt: Date
  readonly lastActivity?: Date

  /**
   * Updates permission
   */
  updatePermission(permission: CollaboratorPermission): ICollaborator

  /**
   * Checks if can edit
   */
  canEdit(): boolean

  /**
   * Checks if can delete
   */
  canDelete(): boolean
}

/**
 * Study Material interface
 */
export interface IStudyMaterial extends IEntity<IStudyMaterialData> {
  readonly materialId: string
  readonly title: string
  readonly description: string
  readonly type: MaterialType
  readonly url?: string
  readonly content?: string | ArrayBuffer
  readonly uploadedBy: string
  readonly size?: number
  readonly format?: string
  readonly relatedTopics: string[]

  /**
   * Downloads the material
   */
  download(): Promise<ArrayBuffer>

  /**
   * Gets material preview
   */
  getPreview(): string | null

  /**
   * Tracks material usage
   */
  trackUsage(userId: string): void

  /**
   * Validates material format
   */
  validateFormat(): boolean
}

// ============================================================================
// Mentorship Interfaces
// ============================================================================

/**
 * Mentorship Program interface
 */
export interface IMentorshipProgram extends IAggregateRoot<IMentorshipProgramData> {
  readonly programId: string
  readonly mentorId: string
  readonly menteeIds: string[]
  readonly topic: string
  readonly description: string
  readonly duration: number // in weeks
  readonly status: MentorshipStatus
  readonly sessions: IMentorshipSession[]

  /**
   * Adds a mentee
   */
  addMentee(userId: string): void

  /**
   * Removes a mentee
   */
  removeMentee(userId: string): void

  /**
   * Schedules a session
   */
  scheduleSession(session: IMentorshipSession): void

  /**
   * Updates program status
   */
  updateStatus(status: MentorshipStatus): void

  /**
   * Gets program progress
   */
  getProgress(): number

  /**
   * Completes the program
   */
  complete(): void

  /**
   * Gets feedback summary
   */
  getFeedbackSummary(): IMentorshipFeedback
}

/**
 * Mentorship Session interface
 */
export interface IMentorshipSession extends IEntity<IMentorshipSessionData> {
  readonly sessionId: string
  readonly programId: string
  readonly scheduledAt: Date
  readonly duration: number
  readonly topic: string
  readonly objectives: string[]
  readonly attendees: string[]
  readonly notes?: string
  readonly recording?: string

  /**
   * Starts the session
   */
  start(): void

  /**
   * Ends the session
   */
  end(): void

  /**
   * Records session notes
   */
  recordNotes(notes: string): void

  /**
   * Adds session feedback
   */
  addFeedback(feedback: ISessionFeedback): void

  /**
   * Gets session summary
   */
  getSummary(): ISessionSummary
}

// ============================================================================
// Notification Interfaces
// ============================================================================

/**
 * Notification interface
 */
export interface INotification extends IEntity<INotificationData> {
  readonly notificationId: string
  readonly userId: string
  readonly type: NotificationType
  readonly title: string
  readonly message: string
  readonly priority: NotificationPriority
  readonly isRead: boolean
  readonly actionUrl?: string
  readonly metadata?: Record<string, unknown>

  /**
   * Marks as read
   */
  markAsRead(): void

  /**
   * Dismisses the notification
   */
  dismiss(): void

  /**
   * Gets notification actions
   */
  getActions(): INotificationAction[]

  /**
   * Executes an action
   */
  executeAction(actionId: string): void
}

/**
 * Notification Preferences interface
 */
export interface INotificationPreferences extends IValueObject<INotificationPreferencesData> {
  readonly email: boolean
  readonly push: boolean
  readonly inApp: boolean
  readonly digest: DigestFrequency
  readonly quietHours?: IQuietHours
  readonly categories: Map<NotificationCategory, boolean>

  /**
   * Updates a preference
   */
  updatePreference(key: string, value: unknown): INotificationPreferences

  /**
   * Checks if notification should be sent
   */
  shouldSendNotification(type: NotificationType, time: Date): boolean
}

// ============================================================================
// Service Interfaces
// ============================================================================

/**
 * Collaboration Service interface
 */
export interface ICollaborationService extends IDomainService {
  /**
   * Finds study partners
   */
  findStudyPartners(userId: string, criteria: IMatchCriteria): Promise<IStudyPartnerMatch[]>

  /**
   * Suggests study groups
   */
  suggestGroups(userId: string): Promise<IStudyGroup[]>

  /**
   * Analyzes group dynamics
   */
  analyzeGroupDynamics(groupId: string): Promise<IGroupDynamicsAnalysis>

  /**
   * Moderates content
   */
  moderateContent(content: string): Promise<IModerationResult>

  /**
   * Generates collaboration insights
   */
  generateInsights(userId: string): Promise<ICollaborationInsights>
}

/**
 * Real-time Collaboration Service
 */
export interface IRealtimeCollaborationService extends IDomainService {
  /**
   * Joins a collaboration session
   */
  joinSession(sessionId: string, userId: string): Promise<void>

  /**
   * Leaves a collaboration session
   */
  leaveSession(sessionId: string, userId: string): Promise<void>

  /**
   * Broadcasts change to collaborators
   */
  broadcastChange(sessionId: string, change: ICollaborationChange): Promise<void>

  /**
   * Syncs document state
   */
  syncDocument(sessionId: string): Promise<IDocumentState>

  /**
   * Handles conflict resolution
   */
  resolveConflict(conflict: IConflict): Promise<IResolution>
}

// ============================================================================
// Repository Interfaces
// ============================================================================

/**
 * Study Group Repository
 */
export interface IStudyGroupRepository extends IRepository<IStudyGroup, string> {
  /**
   * Finds groups by member
   */
  findByMember(userId: string): Promise<IStudyGroup[]>

  /**
   * Finds public groups
   */
  findPublic(criteria?: ISearchCriteria): Promise<IStudyGroup[]>

  /**
   * Finds groups by certification
   */
  findByCertification(certification: string): Promise<IStudyGroup[]>

  /**
   * Gets recommended groups
   */
  findRecommended(userId: string, limit: number): Promise<IStudyGroup[]>
}

/**
 * Discussion Repository
 */
export interface IDiscussionRepository extends IRepository<IDiscussionThread, string> {
  /**
   * Finds threads by category
   */
  findByCategory(category: DiscussionCategory): Promise<IDiscussionThread[]>

  /**
   * Finds threads by author
   */
  findByAuthor(userId: string): Promise<IDiscussionThread[]>

  /**
   * Searches threads
   */
  search(query: string): Promise<IDiscussionThread[]>

  /**
   * Gets trending threads
   */
  findTrending(limit: number): Promise<IDiscussionThread[]>
}

/**
 * Shared Note Repository
 */
export interface ISharedNoteRepository extends IRepository<ISharedNote, string> {
  /**
   * Finds notes by author
   */
  findByAuthor(userId: string): Promise<ISharedNote[]>

  /**
   * Finds notes by collaborator
   */
  findByCollaborator(userId: string): Promise<ISharedNote[]>

  /**
   * Finds public notes
   */
  findPublic(tags?: string[]): Promise<ISharedNote[]>

  /**
   * Searches notes
   */
  search(query: string): Promise<ISharedNote[]>
}

// ============================================================================
// Event Interfaces
// ============================================================================

/**
 * Member Joined Event
 */
export interface IMemberJoinedEvent extends IDomainEvent {
  readonly groupId: string
  readonly userId: string
  readonly role: MemberRole
}

/**
 * Post Created Event
 */
export interface IPostCreatedEvent extends IDomainEvent {
  readonly threadId: string
  readonly postId: string
  readonly authorId: string
}

/**
 * Note Shared Event
 */
export interface INoteSharedEvent extends IDomainEvent {
  readonly noteId: string
  readonly sharedBy: string
  readonly sharedWith: string[]
}

// ============================================================================
// Command and Query Interfaces
// ============================================================================

/**
 * Create Study Group Command
 */
export interface ICreateStudyGroupCommand extends ICommand {
  readonly name: string
  readonly description: string
  readonly settings: IGroupSettingsData
}

/**
 * Join Study Group Command
 */
export interface IJoinStudyGroupCommand extends ICommand {
  readonly groupId: string
  readonly message?: string
}

/**
 * Create Discussion Thread Command
 */
export interface ICreateDiscussionThreadCommand extends ICommand {
  readonly title: string
  readonly content: string
  readonly category: DiscussionCategory
  readonly tags: string[]
}

/**
 * Share Note Command
 */
export interface IShareNoteCommand extends ICommand {
  readonly noteId: string
  readonly collaborators: string[]
  readonly permissions: CollaboratorPermission[]
}

/**
 * Get Study Groups Query
 */
export interface IGetStudyGroupsQuery extends IQuery {
  readonly filter?: GroupFilter
  readonly sortBy?: GroupSortBy
  readonly limit?: number
}

/**
 * Search Discussions Query
 */
export interface ISearchDiscussionsQuery extends IQuery {
  readonly searchTerm: string
  readonly category?: DiscussionCategory
  readonly tags?: string[]
  readonly authorId?: string
}

// ============================================================================
// Type Definitions
// ============================================================================

export type MemberRole = 'owner' | 'admin' | 'moderator' | 'member'

export type GroupAction =
  | 'invite_members'
  | 'remove_members'
  | 'edit_settings'
  | 'schedule_session'
  | 'post_announcement'
  | 'moderate_content'

export type GroupPermission =
  | 'manage_members'
  | 'manage_settings'
  | 'manage_content'
  | 'create_sessions'
  | 'delete_group'

export type DiscussionCategory =
  | 'general'
  | 'study-tips'
  | 'exam-prep'
  | 'knowledge-area'
  | 'process-group'
  | 'resources'
  | 'success-stories'

export type CollaboratorPermission = 'view' | 'comment' | 'edit' | 'admin'

export type MaterialType = 'document' | 'presentation' | 'video' | 'link' | 'exercise'

export type ExportFormat = 'pdf' | 'docx' | 'md' | 'html' | 'txt'

export type MentorshipStatus = 'pending' | 'active' | 'paused' | 'completed' | 'cancelled'

export type NotificationType =
  | 'group-invite'
  | 'group-announcement'
  | 'session-reminder'
  | 'new-post'
  | 'mention'
  | 'reply'
  | 'note-shared'
  | 'achievement'

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

export type NotificationCategory =
  | 'groups'
  | 'discussions'
  | 'notes'
  | 'sessions'
  | 'achievements'
  | 'system'

export type DigestFrequency = 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never'

export type GroupFilter = 'my-groups' | 'public' | 'recommended' | 'active'

export type GroupSortBy = 'name' | 'members' | 'activity' | 'created'

// ============================================================================
// Data Interfaces
// ============================================================================

export interface IStudyGroupData {
  groupId: string
  name: string
  description: string
  ownerId: string
  members: IGroupMemberData[]
  settings: IGroupSettingsData
  createdAt: Date
  isActive: boolean
  statistics: IGroupStatistics
}

export interface IGroupMemberData {
  userId: string
  role: MemberRole
  joinedAt: Date
  contributionScore: number
  isActive: boolean
}

export interface IGroupSettingsData {
  isPrivate: boolean
  maxMembers: number
  allowInvites: boolean
  requireApproval: boolean
  studyFocus: string[]
  targetCertification?: string
  language: string
  timezone: string
}

export interface IGroupStudySessionData {
  sessionId: string
  groupId: string
  title: string
  description: string
  scheduledAt: Date
  duration: number
  facilitatorId: string
  attendees: ISessionAttendeeData[]
  materials: string[]
  meetingUrl?: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
}

export interface ISessionAttendeeData {
  userId: string
  rsvpStatus: 'yes' | 'no' | 'maybe'
  attended?: boolean
}

export interface IDiscussionThreadData {
  threadId: string
  title: string
  authorId: string
  category: DiscussionCategory
  tags: string[]
  posts: IDiscussionPostData[]
  isPinned: boolean
  isLocked: boolean
  isResolved: boolean
  viewCount: number
  createdAt: Date
  lastActivity: Date
}

export interface IDiscussionPostData {
  postId: string
  threadId: string
  authorId: string
  content: string
  parentId?: string
  createdAt: Date
  updatedAt?: Date
  reactions: IReactionData[]
  mentions: string[]
  attachments: IAttachmentData[]
  isAnswer: boolean
  isDeleted: boolean
}

export interface IReactionData {
  emoji: string
  userId: string
  timestamp: Date
}

export interface IAttachmentData {
  id: string
  filename: string
  url: string
  size: number
  mimeType: string
}

export interface ISharedNoteData {
  noteId: string
  title: string
  content: string
  authorId: string
  collaborators: ICollaboratorData[]
  relatedProcessId?: string
  tags: string[]
  version: number
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  history: INoteHistoryData[]
}

export interface ICollaboratorData {
  userId: string
  permission: CollaboratorPermission
  addedAt: Date
  lastActivity?: Date
}

export interface INoteHistoryData {
  versionId: string
  content: string
  editedBy: string
  editedAt: Date
  changeDescription?: string
}

export interface IStudyMaterialData {
  materialId: string
  title: string
  description: string
  type: MaterialType
  url?: string
  uploadedBy: string
  size?: number
  format?: string
  relatedTopics: string[]
  downloads: number
  rating?: number
}

export interface IMentorshipProgramData {
  programId: string
  mentorId: string
  menteeIds: string[]
  topic: string
  description: string
  duration: number
  status: MentorshipStatus
  sessions: IMentorshipSessionData[]
  startDate: Date
  endDate?: Date
}

export interface IMentorshipSessionData {
  sessionId: string
  programId: string
  scheduledAt: Date
  duration: number
  topic: string
  objectives: string[]
  attendees: string[]
  notes?: string
  recording?: string
  feedback?: ISessionFeedbackData[]
}

export interface ISessionFeedbackData {
  userId: string
  rating: number
  comments?: string
  helpful: boolean
}

export interface INotificationData {
  notificationId: string
  userId: string
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  isRead: boolean
  actionUrl?: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

export interface INotificationPreferencesData {
  email: boolean
  push: boolean
  inApp: boolean
  digest: DigestFrequency
  quietHours?: IQuietHoursData
  categories: Record<NotificationCategory, boolean>
}

export interface IQuietHoursData {
  enabled: boolean
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  timezone: string
}

export interface INotificationAction {
  id: string
  label: string
  action: string
  style?: 'primary' | 'secondary' | 'danger'
}

export interface IAnnouncement {
  id: string
  title: string
  content: string
  authorId: string
  priority: 'low' | 'normal' | 'high'
  expiresAt?: Date
}

export interface IGroupStatistics {
  totalMembers: number
  activeMembers: number
  totalSessions: number
  completedSessions: number
  totalPosts: number
  engagementScore: number
}

export interface ISessionRecording {
  url: string
  duration: number
  format: string
  size: number
}

export interface INoteComment {
  id: string
  userId: string
  content: string
  timestamp: Date
  resolved?: boolean
}

export interface INoteVersion {
  versionId: string
  content: string
  createdBy: string
  createdAt: Date
  changeLog?: string
}

export interface INoteHistory {
  action: 'created' | 'edited' | 'shared' | 'commented'
  userId: string
  timestamp: Date
  details?: string
}

export interface IMentorshipFeedback {
  overallRating: number
  mentorRating: number
  programEffectiveness: number
  wouldRecommend: boolean
  testimonials: string[]
}

export interface ISessionSummary {
  attendanceRate: number
  engagementLevel: number
  keyTopicsCovered: string[]
  actionItems: string[]
  nextSession?: Date
}

export interface IMatchCriteria {
  knowledgeAreas?: IKnowledgeArea[]
  processGroups?: IProcessGroup[]
  experienceLevel?: string
  timezone?: string
  language?: string
  availability?: string[]
}

export interface IStudyPartnerMatch {
  userId: string
  matchScore: number
  commonInterests: string[]
  complementarySkills: string[]
}

export interface IGroupDynamicsAnalysis {
  participationBalance: number
  communicationFrequency: number
  topContributors: string[]
  inactiveMembers: string[]
  healthScore: number
  recommendations: string[]
}

export interface IModerationResult {
  isApproved: boolean
  confidence: number
  issues?: string[]
  suggestedEdits?: string
}

export interface ICollaborationInsights {
  mostActiveGroups: IStudyGroup[]
  topContributions: IDiscussionPost[]
  learningImpact: number
  networkSize: number
  engagementTrend: number[]
}

export interface ISearchCriteria {
  query?: string
  tags?: string[]
  dateRange?: { start: Date; end: Date }
  sortBy?: string
  limit?: number
}

export interface ICollaborationChange {
  type: 'insert' | 'delete' | 'update'
  position?: number
  content?: string
  userId: string
  timestamp: Date
}

export interface IDocumentState {
  content: string
  version: number
  collaborators: string[]
  lastModified: Date
}

export interface IConflict {
  type: 'edit' | 'delete'
  localChange: ICollaborationChange
  remoteChange: ICollaborationChange
}

export interface IResolution {
  accepted: ICollaborationChange
  rejected: ICollaborationChange
  merged?: string
}

// Export all interfaces as a namespace
export * as CollaborationInterfaces from './collaboration.interfaces'
