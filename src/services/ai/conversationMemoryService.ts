/**
 * Conversation Memory Service
 * Manages conversation history, context, and personalization for each user
 */

import {
  BufferMemory,
  ConversationSummaryMemory,
  VectorStoreRetrieverMemory,
} from 'langchain/memory'
import { ChatMessageHistory } from 'langchain/stores/message/in_memory'
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'
import { Document } from '@langchain/core/documents'
import { VectorStore } from '@langchain/core/vectorstores'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

export interface ConversationTurn {
  id: string
  userId: string
  sessionId: string
  timestamp: Date
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: {
    intent?: string
    topics?: string[]
    sentiment?: number
    confidence?: number
    tokens?: number
  }
}

export interface ConversationSession {
  id: string
  userId: string
  startTime: Date
  endTime?: Date
  topic?: string
  summary?: string
  turns: ConversationTurn[]
  metadata?: {
    totalTokens?: number
    averageResponseTime?: number
    userSatisfaction?: number
  }
}

export interface UserMemoryProfile {
  userId: string
  preferences: {
    learningStyle: 'visual' | 'textual' | 'practical' | 'mixed'
    responseLength: 'concise' | 'detailed' | 'balanced'
    difficultyPreference: 'beginner' | 'intermediate' | 'advanced'
    languageStyle: 'formal' | 'casual' | 'technical'
  }
  knowledge: {
    strongAreas: string[]
    weakAreas: string[]
    recentTopics: string[]
    masteredConcepts: string[]
  }
  interaction: {
    totalSessions: number
    totalTurns: number
    averageSessionLength: number
    lastInteraction: Date
    preferredTimeOfDay?: string
  }
  goals: {
    examDate?: Date
    targetScore: number
    dailyStudyTime: number
    focusAreas: string[]
  }
}

export interface MemorySearchOptions {
  userId: string
  query?: string
  sessionId?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  topics?: string[]
}

/**
 * Conversation Memory Service
 */
export class ConversationMemoryService {
  private supabase: SupabaseClient
  private messageHistories: Map<string, ChatMessageHistory>
  private userProfiles: Map<string, UserMemoryProfile>
  private activeSessions: Map<string, ConversationSession>
  private memoryBuffer: BufferMemory | ConversationSummaryMemory
  private vectorMemory?: VectorStoreRetrieverMemory

  constructor(memory: BufferMemory | ConversationSummaryMemory, vectorStore?: VectorStore) {
    this.memoryBuffer = memory
    this.messageHistories = new Map()
    this.userProfiles = new Map()
    this.activeSessions = new Map()

    // Initialize Supabase client for persistent storage
    this.supabase = createClient(
      process.env.VITE_SUPABASE_URL || '',
      process.env.VITE_SUPABASE_ANON_KEY || ''
    )

    // Initialize vector memory if vector store is provided
    if (vectorStore) {
      this.vectorMemory = new VectorStoreRetrieverMemory({
        vectorStoreRetriever: vectorStore.asRetriever(),
        memoryKey: 'history',
        returnDocs: true,
      })
    }

    this.loadUserProfiles()
  }

  /**
   * Load user profiles from persistent storage
   */
  private async loadUserProfiles(): Promise<void> {
    try {
      const { data: profiles } = await this.supabase.from('user_memory_profiles').select('*')

      if (profiles) {
        profiles.forEach((profile) => {
          this.userProfiles.set(profile.user_id, this.deserializeProfile(profile))
        })
      }
    } catch (error) {
      console.error('Failed to load user profiles:', error)
    }
  }

  /**
   * Get or create user memory profile
   */
  public async getUserProfile(userId: string): Promise<UserMemoryProfile> {
    if (this.userProfiles.has(userId)) {
      return this.userProfiles.get(userId)!
    }

    // Try to load from database
    const { data: profile } = await this.supabase
      .from('user_memory_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (profile) {
      const userProfile = this.deserializeProfile(profile)
      this.userProfiles.set(userId, userProfile)
      return userProfile
    }

    // Create new profile
    const newProfile: UserMemoryProfile = {
      userId,
      preferences: {
        learningStyle: 'mixed',
        responseLength: 'balanced',
        difficultyPreference: 'intermediate',
        languageStyle: 'formal',
      },
      knowledge: {
        strongAreas: [],
        weakAreas: [],
        recentTopics: [],
        masteredConcepts: [],
      },
      interaction: {
        totalSessions: 0,
        totalTurns: 0,
        averageSessionLength: 0,
        lastInteraction: new Date(),
      },
      goals: {
        targetScore: 75,
        dailyStudyTime: 60,
        focusAreas: [],
      },
    }

    this.userProfiles.set(userId, newProfile)
    await this.saveUserProfile(newProfile)
    return newProfile
  }

  /**
   * Update user memory profile
   */
  public async updateUserProfile(
    userId: string,
    updates: Partial<UserMemoryProfile>
  ): Promise<void> {
    const profile = await this.getUserProfile(userId)

    // Deep merge updates
    const updatedProfile: UserMemoryProfile = {
      ...profile,
      ...updates,
      preferences: { ...profile.preferences, ...updates.preferences },
      knowledge: { ...profile.knowledge, ...updates.knowledge },
      interaction: { ...profile.interaction, ...updates.interaction },
      goals: { ...profile.goals, ...updates.goals },
    }

    this.userProfiles.set(userId, updatedProfile)
    await this.saveUserProfile(updatedProfile)
  }

  /**
   * Save user profile to database
   */
  private async saveUserProfile(profile: UserMemoryProfile): Promise<void> {
    try {
      await this.supabase.from('user_memory_profiles').upsert({
        user_id: profile.userId,
        preferences: profile.preferences,
        knowledge: profile.knowledge,
        interaction: profile.interaction,
        goals: profile.goals,
        updated_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Failed to save user profile:', error)
    }
  }

  /**
   * Start a new conversation session
   */
  public async startSession(userId: string, topic?: string): Promise<ConversationSession> {
    const sessionId = this.generateSessionId()

    const session: ConversationSession = {
      id: sessionId,
      userId,
      startTime: new Date(),
      topic,
      turns: [],
      metadata: {
        totalTokens: 0,
        averageResponseTime: 0,
      },
    }

    this.activeSessions.set(sessionId, session)

    // Initialize message history for this session
    this.messageHistories.set(sessionId, new ChatMessageHistory())

    // Update user interaction stats
    const profile = await this.getUserProfile(userId)
    await this.updateUserProfile(userId, {
      interaction: {
        ...profile.interaction,
        totalSessions: profile.interaction.totalSessions + 1,
        lastInteraction: new Date(),
      },
    })

    return session
  }

  /**
   * End a conversation session
   */
  public async endSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId)
    if (!session) {
      return
    }

    session.endTime = new Date()

    // Generate session summary
    session.summary = await this.generateSessionSummary(session)

    // Save to database
    await this.saveSession(session)

    // Clean up
    this.activeSessions.delete(sessionId)
    this.messageHistories.delete(sessionId)

    // Update user stats
    const profile = await this.getUserProfile(session.userId)
    const sessionLength = session.turns.length
    const newAverage =
      (profile.interaction.averageSessionLength * profile.interaction.totalSessions +
        sessionLength) /
      (profile.interaction.totalSessions + 1)

    await this.updateUserProfile(session.userId, {
      interaction: {
        ...profile.interaction,
        averageSessionLength: newAverage,
      },
    })
  }

  /**
   * Save an interaction to memory
   */
  public async saveInteraction(
    userId: string,
    userMessage: string,
    assistantResponse: string,
    sessionId?: string
  ): Promise<void> {
    // Get or create session
    let session: ConversationSession
    if (sessionId && this.activeSessions.has(sessionId)) {
      session = this.activeSessions.get(sessionId)!
    } else {
      session = await this.startSession(userId)
    }

    // Create conversation turns
    const userTurn: ConversationTurn = {
      id: this.generateTurnId(),
      userId,
      sessionId: session.id,
      timestamp: new Date(),
      role: 'user',
      content: userMessage,
      metadata: {
        intent: await this.detectIntent(userMessage),
        topics: await this.extractTopics(userMessage),
      },
    }

    const assistantTurn: ConversationTurn = {
      id: this.generateTurnId(),
      userId,
      sessionId: session.id,
      timestamp: new Date(),
      role: 'assistant',
      content: assistantResponse,
      metadata: {
        topics: await this.extractTopics(assistantResponse),
        tokens: this.estimateTokens(assistantResponse),
      },
    }

    // Add to session
    session.turns.push(userTurn, assistantTurn)

    // Update message history
    const history = this.messageHistories.get(session.id)
    if (history) {
      await history.addMessage(new HumanMessage(userMessage))
      await history.addMessage(new AIMessage(assistantResponse))
    }

    // Update memory buffer
    await this.memoryBuffer.saveContext({ input: userMessage }, { output: assistantResponse })

    // Update vector memory if available
    if (this.vectorMemory) {
      await this.vectorMemory.saveContext({ input: userMessage }, { output: assistantResponse })
    }

    // Update user profile with recent topics
    await this.updateRecentTopics(userId, [
      ...(userTurn.metadata.topics || []),
      ...(assistantTurn.metadata.topics || []),
    ])

    // Auto-save session periodically
    if (session.turns.length % 10 === 0) {
      await this.saveSession(session)
    }
  }

  /**
   * Retrieve conversation history
   */
  public async getConversationHistory(options: MemorySearchOptions): Promise<ConversationTurn[]> {
    const { userId, sessionId, startDate, endDate, limit = 50, topics } = options

    let query = this.supabase
      .from('conversation_turns')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (sessionId) {
      query = query.eq('session_id', sessionId)
    }

    if (startDate) {
      query = query.gte('timestamp', startDate.toISOString())
    }

    if (endDate) {
      query = query.lte('timestamp', endDate.toISOString())
    }

    if (topics && topics.length > 0) {
      query = query.contains('metadata->topics', topics)
    }

    const { data: turns } = await query

    return turns?.map(this.deserializeTurn) || []
  }

  /**
   * Search conversation history using semantic search
   */
  public async searchConversations(
    userId: string,
    query: string,
    limit: number = 10
  ): Promise<ConversationTurn[]> {
    if (!this.vectorMemory) {
      // Fallback to text search
      return this.textSearchConversations(userId, query, limit)
    }

    // Use vector memory for semantic search
    const docs = await this.vectorMemory.vectorStoreRetriever.getRelevantDocuments(query, {
      k: limit,
      filter: { userId },
    })

    // Convert documents back to conversation turns
    return docs.map((doc) => this.documentToTurn(doc))
  }

  /**
   * Text-based conversation search fallback
   */
  private async textSearchConversations(
    userId: string,
    query: string,
    limit: number
  ): Promise<ConversationTurn[]> {
    const { data: turns } = await this.supabase
      .from('conversation_turns')
      .select('*')
      .eq('user_id', userId)
      .textSearch('content', query)
      .limit(limit)

    return turns?.map(this.deserializeTurn) || []
  }

  /**
   * Get conversation context for a user
   */
  public async getConversationContext(userId: string, maxTurns: number = 10): Promise<string> {
    const recentTurns = await this.getConversationHistory({
      userId,
      limit: maxTurns,
    })

    if (recentTurns.length === 0) {
      return 'No previous conversation history.'
    }

    const context = recentTurns
      .reverse()
      .map((turn) => `${turn.role}: ${turn.content}`)
      .join('\n')

    return `Previous conversation:\n${context}`
  }

  /**
   * Get personalized context for the user
   */
  public async getPersonalizedContext(userId: string): Promise<string> {
    const profile = await this.getUserProfile(userId)

    const context = `
User Learning Profile:
- Learning Style: ${profile.preferences.learningStyle}
- Difficulty Preference: ${profile.preferences.difficultyPreference}
- Response Length: ${profile.preferences.responseLength}
- Strong Areas: ${profile.knowledge.strongAreas.join(', ') || 'Not identified yet'}
- Weak Areas: ${profile.knowledge.weakAreas.join(', ') || 'Not identified yet'}
- Recent Topics: ${profile.knowledge.recentTopics.slice(0, 5).join(', ') || 'None'}
- Study Goal: ${profile.goals.targetScore}% score
- Daily Study Time: ${profile.goals.dailyStudyTime} minutes
- Focus Areas: ${profile.goals.focusAreas.join(', ') || 'General'}
${profile.goals.examDate ? `- Exam Date: ${profile.goals.examDate.toLocaleDateString()}` : ''}
    `.trim()

    return context
  }

  /**
   * Detect user intent from message
   */
  private async detectIntent(message: string): Promise<string> {
    const intents = {
      question: /\?|what|how|why|when|where|who|explain|describe/i,
      practice: /practice|quiz|test|exam|question|exercise/i,
      review: /review|summarize|recap|overview|summary/i,
      plan: /plan|schedule|study|prepare|roadmap/i,
      help: /help|assist|guide|support|stuck/i,
      progress: /progress|score|performance|how am i doing/i,
      definition: /define|meaning|what is|terminology/i,
    }

    for (const [intent, pattern] of Object.entries(intents)) {
      if (pattern.test(message)) {
        return intent
      }
    }

    return 'general'
  }

  /**
   * Extract topics from text
   */
  private async extractTopics(text: string): Promise<string[]> {
    const topics = []

    // PMBOK knowledge areas
    const knowledgeAreas = [
      'Integration',
      'Scope',
      'Schedule',
      'Cost',
      'Quality',
      'Resource',
      'Communications',
      'Risk',
      'Procurement',
      'Stakeholder',
    ]

    // Process groups
    const processGroups = [
      'Initiating',
      'Planning',
      'Executing',
      'Monitoring and Controlling',
      'Closing',
    ]

    // Check for knowledge areas
    knowledgeAreas.forEach((area) => {
      if (text.toLowerCase().includes(area.toLowerCase())) {
        topics.push(area)
      }
    })

    // Check for process groups
    processGroups.forEach((group) => {
      if (text.toLowerCase().includes(group.toLowerCase())) {
        topics.push(group)
      }
    })

    // Check for ITTO mentions
    if (/input|tool|technique|output|itto/i.test(text)) {
      topics.push('ITTO')
    }

    // Check for specific concepts
    const concepts = [
      'WBS',
      'Critical Path',
      'Earned Value',
      'Risk Register',
      'Stakeholder Analysis',
      'Change Control',
      'Quality Assurance',
    ]

    concepts.forEach((concept) => {
      if (text.toLowerCase().includes(concept.toLowerCase())) {
        topics.push(concept)
      }
    })

    return [...new Set(topics)] // Remove duplicates
  }

  /**
   * Update user's recent topics
   */
  private async updateRecentTopics(userId: string, newTopics: string[]): Promise<void> {
    if (newTopics.length === 0) {
      return
    }

    const profile = await this.getUserProfile(userId)
    const recentTopics = [...newTopics, ...profile.knowledge.recentTopics]

    // Keep only unique topics and limit to 20
    const uniqueTopics = [...new Set(recentTopics)].slice(0, 20)

    await this.updateUserProfile(userId, {
      knowledge: {
        ...profile.knowledge,
        recentTopics: uniqueTopics,
      },
    })
  }

  /**
   * Generate session summary
   */
  private async generateSessionSummary(session: ConversationSession): Promise<string> {
    if (session.turns.length === 0) {
      return 'Empty session'
    }

    const topics = new Set<string>()
    const intents = new Set<string>()

    session.turns.forEach((turn) => {
      if (turn.metadata?.topics) {
        turn.metadata.topics.forEach((topic) => topics.add(topic))
      }
      if (turn.metadata?.intent) {
        intents.add(turn.metadata.intent)
      }
    })

    const duration = session.endTime
      ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60)
      : 0

    return (
      `Session lasted ${duration} minutes with ${session.turns.length} turns. ` +
      `Topics covered: ${Array.from(topics).join(', ')}. ` +
      `User intents: ${Array.from(intents).join(', ')}.`
    )
  }

  /**
   * Save session to database
   */
  private async saveSession(session: ConversationSession): Promise<void> {
    try {
      // Save session
      await this.supabase.from('conversation_sessions').upsert({
        id: session.id,
        user_id: session.userId,
        start_time: session.startTime.toISOString(),
        end_time: session.endTime?.toISOString(),
        topic: session.topic,
        summary: session.summary,
        metadata: session.metadata,
      })

      // Save turns
      if (session.turns.length > 0) {
        await this.supabase.from('conversation_turns').upsert(
          session.turns.map((turn) => ({
            id: turn.id,
            user_id: turn.userId,
            session_id: turn.sessionId,
            timestamp: turn.timestamp.toISOString(),
            role: turn.role,
            content: turn.content,
            metadata: turn.metadata,
          }))
        )
      }
    } catch (error) {
      console.error('Failed to save session:', error)
    }
  }

  /**
   * Estimate token count for text
   */
  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4)
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Generate unique turn ID
   */
  private generateTurnId(): string {
    return `turn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Deserialize profile from database
   */
  private deserializeProfile(data: any): UserMemoryProfile {
    return {
      userId: data.user_id,
      preferences: data.preferences,
      knowledge: data.knowledge,
      interaction: {
        ...data.interaction,
        lastInteraction: new Date(data.interaction.lastInteraction),
      },
      goals: {
        ...data.goals,
        examDate: data.goals.examDate ? new Date(data.goals.examDate) : undefined,
      },
    }
  }

  /**
   * Deserialize turn from database
   */
  private deserializeTurn(data: any): ConversationTurn {
    return {
      id: data.id,
      userId: data.user_id,
      sessionId: data.session_id,
      timestamp: new Date(data.timestamp),
      role: data.role,
      content: data.content,
      metadata: data.metadata,
    }
  }

  /**
   * Convert document to conversation turn
   */
  private documentToTurn(doc: Document): ConversationTurn {
    return {
      id: doc.metadata.id || this.generateTurnId(),
      userId: doc.metadata.userId,
      sessionId: doc.metadata.sessionId,
      timestamp: new Date(doc.metadata.timestamp),
      role: doc.metadata.role,
      content: doc.pageContent,
      metadata: doc.metadata,
    }
  }

  /**
   * Clear all conversation history for a user
   */
  public async clearUserHistory(userId: string): Promise<void> {
    try {
      await this.supabase.from('conversation_turns').delete().eq('user_id', userId)

      await this.supabase.from('conversation_sessions').delete().eq('user_id', userId)

      // Clear from memory
      for (const [sessionId, session] of this.activeSessions.entries()) {
        if (session.userId === userId) {
          this.activeSessions.delete(sessionId)
          this.messageHistories.delete(sessionId)
        }
      }
    } catch (error) {
      console.error('Failed to clear user history:', error)
    }
  }

  /**
   * Export user conversation history
   */
  public async exportUserHistory(userId: string): Promise<any> {
    const profile = await this.getUserProfile(userId)
    const sessions = await this.supabase
      .from('conversation_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })

    const turns = await this.getConversationHistory({ userId, limit: 1000 })

    return {
      exportDate: new Date().toISOString(),
      userId,
      profile,
      sessions: sessions.data,
      conversationCount: turns.length,
      conversations: turns,
    }
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    // Save all active sessions
    for (const session of this.activeSessions.values()) {
      await this.endSession(session.id)
    }

    // Clear memory
    this.messageHistories.clear()
    this.userProfiles.clear()
    this.activeSessions.clear()
  }
}

export default ConversationMemoryService
