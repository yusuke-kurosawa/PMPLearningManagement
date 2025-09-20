/**
 * AI Learning Service
 * Facade for all AI-powered learning features
 */

import { PMPLearningAgent, LearningContext, StudyRecommendation } from './langchainAgent'
import { VectorStoreService } from './vectorStoreService'
import { ConversationMemoryService } from './conversationMemoryService'

export interface AIServiceConfig {
  modelProvider: 'openai' | 'anthropic'
  apiKey: string
  streaming?: boolean
  vectorStoreProvider?: 'pinecone' | 'qdrant' | 'chroma' | 'pgvector'
  vectorStoreApiKey?: string
  vectorStoreUrl?: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: any
}

export class AILearningService {
  private agent: PMPLearningAgent
  private vectorStore: VectorStoreService
  private conversationMemory: ConversationMemoryService
  private isInitialized: boolean = false

  constructor(private config: AIServiceConfig) {
    this.initialize()
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    // Initialize vector store
    this.vectorStore = new VectorStoreService({
      provider: this.config.vectorStoreProvider || 'chroma',
      embeddingProvider: 'openai',
      indexName: 'pmp-learning',
      dimension: 1536,
      apiKey: this.config.vectorStoreApiKey || this.config.apiKey,
      url: this.config.vectorStoreUrl || 'http://localhost:8000',
    })

    await this.vectorStore.initialize()

    // Initialize agent
    this.agent = new PMPLearningAgent({
      modelProvider: this.config.modelProvider,
      modelName: this.config.modelProvider === 'openai' ? 'gpt-4o' : 'claude-3-opus-20240229',
      temperature: 0.7,
      maxTokens: 2000,
      streaming: this.config.streaming || false,
      apiKey: this.config.apiKey,
      vectorStoreConfig: {
        provider: this.config.vectorStoreProvider || 'chroma',
        indexName: 'pmp-learning',
        dimension: 1536,
      },
      memoryConfig: {
        type: 'buffer',
        maxTokens: 2000,
        returnMessages: true,
      },
    })

    // Initialize conversation memory
    this.conversationMemory = new ConversationMemoryService(
      this.agent['memory'],
      this.vectorStore['vectorStore']
    )

    this.isInitialized = true
  }

  /**
   * Process a user message and get AI response
   */
  public async processMessage(
    message: string,
    userId: string,
    context?: Partial<LearningContext>
  ): Promise<{
    response: string
    recommendations?: StudyRecommendation[]
    studyPlan?: any
    resources?: any[]
  }> {
    await this.ensureInitialized()

    const fullContext = await this.buildLearningContext(userId, context)
    const result = await this.agent.processQuery(message, fullContext)

    // Save to conversation memory
    await this.conversationMemory.saveInteraction(userId, message, result.response)

    return result
  }

  /**
   * Stream AI response for real-time feedback
   */
  public async *streamResponse(
    message: string,
    context: any
  ): AsyncGenerator<string, void, unknown> {
    await this.ensureInitialized()

    const fullContext = await this.buildLearningContext(context.userId, context)

    yield* this.agent.streamResponse(message, fullContext)
  }

  /**
   * Get personalized study recommendations
   */
  public async getRecommendations(context: any): Promise<{
    recommendations: StudyRecommendation[]
  }> {
    await this.ensureInitialized()

    const fullContext = await this.buildLearningContext(context.userId, context)

    const result = await this.agent.processQuery(
      'Generate study recommendations based on my progress',
      fullContext
    )

    return {
      recommendations: result.recommendations || [],
    }
  }

  /**
   * Generate personalized study plan
   */
  public async generateStudyPlan(context: any): Promise<any> {
    await this.ensureInitialized()

    const fullContext = await this.buildLearningContext(context.userId, context)

    const result = await this.agent.processQuery(
      'Create a detailed study plan for my PMP exam preparation',
      fullContext
    )

    return result.studyPlan
  }

  /**
   * Analyze learning progress
   */
  public async analyzeProgress(context: any): Promise<{
    summary: string
    patterns: any[]
    insights: string[]
    recommendations: string[]
  }> {
    await this.ensureInitialized()

    const sessions = await this.getRecentSessions(context.userId)
    const analysis = await this.agent.analyzeLearningPatterns(context.userId, sessions)

    return {
      summary: this.generateProgressSummary(context, analysis),
      ...analysis,
    }
  }

  /**
   * Generate adaptive quiz
   */
  public async generateAdaptiveQuiz(context: any, questionCount: number = 10): Promise<any[]> {
    await this.ensureInitialized()

    const fullContext = await this.buildLearningContext(context.userId, context)

    return this.agent.generateAdaptiveQuiz(fullContext, questionCount)
  }

  /**
   * Analyze weak areas
   */
  public async analyzeWeaknesses(context: any): Promise<{
    summary: string
    weakAreas: any[]
    recommendations: string[]
  }> {
    await this.ensureInitialized()

    const fullContext = await this.buildLearningContext(context.userId, context)

    const result = await this.agent.processQuery(
      'Analyze my weak areas and provide improvement strategies',
      fullContext
    )

    return {
      summary: result.response,
      weakAreas: context.currentProgress?.weakAreas || [],
      recommendations: result.recommendations?.map((r) => r.reason) || [],
    }
  }

  /**
   * Get learning insights
   */
  public async getLearningInsights(context: any): Promise<{
    patterns: string[]
    insights: string[]
    recommendations: string[]
  }> {
    await this.ensureInitialized()

    const sessions = await this.getRecentSessions(context.userId)
    const analysis = await this.agent.analyzeLearningPatterns(context.userId, sessions)

    return {
      patterns: this.formatPatterns(analysis.patterns),
      insights: analysis.insights,
      recommendations: analysis.recommendations,
    }
  }

  /**
   * Get conversation history
   */
  public async getConversationHistory(userId: string, limit: number = 50): Promise<Message[]> {
    await this.ensureInitialized()

    const turns = await this.conversationMemory.getConversationHistory({
      userId,
      limit,
    })

    return turns.map((turn) => ({
      id: turn.id,
      role: turn.role as 'user' | 'assistant' | 'system',
      content: turn.content,
      timestamp: turn.timestamp,
      metadata: turn.metadata,
    }))
  }

  /**
   * Search conversations semantically
   */
  public async searchConversations(
    userId: string,
    query: string,
    limit: number = 10
  ): Promise<Message[]> {
    await this.ensureInitialized()

    const turns = await this.conversationMemory.searchConversations(userId, query, limit)

    return turns.map((turn) => ({
      id: turn.id,
      role: turn.role as 'user' | 'assistant' | 'system',
      content: turn.content,
      timestamp: turn.timestamp,
      metadata: turn.metadata,
    }))
  }

  /**
   * Clear user conversation history
   */
  public async clearHistory(userId: string): Promise<void> {
    await this.ensureInitialized()
    await this.conversationMemory.clearUserHistory(userId)
  }

  /**
   * Export user learning data
   */
  public async exportUserData(userId: string): Promise<any> {
    await this.ensureInitialized()

    const [conversationData, profile] = await Promise.all([
      this.conversationMemory.exportUserHistory(userId),
      this.conversationMemory.getUserProfile(userId),
    ])

    return {
      exportDate: new Date().toISOString(),
      userId,
      profile,
      conversations: conversationData,
    }
  }

  /**
   * Build complete learning context
   */
  private async buildLearningContext(
    userId: string,
    partialContext?: Partial<LearningContext>
  ): Promise<LearningContext> {
    const profile = await this.conversationMemory.getUserProfile(userId)
    const sessions = await this.getRecentSessions(userId)

    const defaultContext: LearningContext = {
      userId,
      currentProgress: {
        knowledgeAreas: [],
        processGroups: [],
        overallScore: 0,
        totalStudyHours: 0,
        lastActivityDate: new Date(),
        strengths: [],
        weaknesses: [],
      },
      learningStyle: profile.preferences.learningStyle,
      availableTimePerDay: profile.goals.dailyStudyTime,
      targetScore: profile.goals.targetScore,
      examDate: profile.goals.examDate,
      previousSessions: sessions,
    }

    return {
      ...defaultContext,
      ...partialContext,
      currentProgress: {
        ...defaultContext.currentProgress,
        ...partialContext?.currentProgress,
      },
    }
  }

  /**
   * Get recent learning sessions
   */
  private async getRecentSessions(userId: string): Promise<any[]> {
    const turns = await this.conversationMemory.getConversationHistory({
      userId,
      limit: 100,
    })

    // Group by session and create session summaries
    const sessions: Map<string, any> = new Map()

    turns.forEach((turn) => {
      const sessionId = turn.sessionId
      if (!sessions.has(sessionId)) {
        sessions.set(sessionId, {
          sessionId,
          date: turn.timestamp,
          duration: 0,
          topicsCovered: [],
          performance: 0,
        })
      }

      const session = sessions.get(sessionId)
      if (turn.metadata?.topics) {
        session.topicsCovered.push(...turn.metadata.topics)
      }
    })

    return Array.from(sessions.values()).slice(0, 10)
  }

  /**
   * Generate progress summary
   */
  private generateProgressSummary(context: any, analysis: any): string {
    const { currentProgress } = context
    const overallScore = currentProgress?.overall || 0
    const trend = analysis.patterns.find((p) => p.type === 'performance_trend')

    let summary = `Your current overall score is ${overallScore}%. `

    if (trend?.data?.improving) {
      summary += `Great news! Your performance is improving with a recent average of ${trend.data.recentAverage.toFixed(1)}%. `
    } else {
      summary += `Your performance needs attention. Focus on consistent practice to improve. `
    }

    if (currentProgress?.weakAreas?.length > 0) {
      summary += `Key areas to focus on: ${currentProgress.weakAreas.slice(0, 3).join(', ')}. `
    }

    if (overallScore >= 75) {
      summary += "You're on track for exam success! Keep up the excellent work."
    } else if (overallScore >= 60) {
      summary += "You're making good progress. Intensify your efforts on weak areas."
    } else {
      summary += 'Focus on building a strong foundation across all knowledge areas.'
    }

    return summary
  }

  /**
   * Format learning patterns for display
   */
  private formatPatterns(patterns: any[]): string[] {
    return patterns.map((pattern) => {
      switch (pattern.type) {
        case 'time_preference':
          return `You study best during ${pattern.data.preferredTime} sessions`
        case 'performance_trend':
          return pattern.data.improving
            ? 'Your performance is trending upward'
            : 'Your performance needs improvement'
        case 'topic_affinity':
          return `Strong topics: ${pattern.data.strongTopics.slice(0, 3).join(', ')}`
        default:
          return 'Learning pattern identified'
      }
    })
  }

  /**
   * Ensure service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    if (this.agent) {
      await this.agent.cleanup()
    }
    if (this.vectorStore) {
      await this.vectorStore.cleanup()
    }
    if (this.conversationMemory) {
      await this.conversationMemory.cleanup()
    }
  }
}

export default AILearningService
