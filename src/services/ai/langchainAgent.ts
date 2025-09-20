/**
 * LangChain Agent Architecture for PMP Learning Personalization
 * This module implements the core AI agent for personalized learning recommendations
 */

import { ChatOpenAI } from '@langchain/openai'
import { ChatAnthropic } from '@langchain/anthropic'
import {
  AgentExecutor,
  createOpenAIFunctionsAgent,
  createStructuredChatAgent,
} from 'langchain/agents'
import { SystemMessage, HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages'
import { RunnableSequence, RunnablePassthrough, RunnableLambda } from '@langchain/core/runnables'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { PromptTemplate, ChatPromptTemplate } from '@langchain/core/prompts'
import { Tool } from '@langchain/core/tools'
import { BufferMemory, ConversationSummaryMemory } from 'langchain/memory'
import { VectorStoreRetriever } from '@langchain/core/vectorstores'
import { Document } from '@langchain/core/documents'

// Import our custom tools and services
import { PMBOKKnowledgeTool } from './tools/pmbokKnowledgeTool'
import { LearningProgressAnalyzer } from './tools/learningProgressAnalyzer'
import { StudyPlanGenerator } from './tools/studyPlanGenerator'
import { QuizGenerator } from './tools/quizGenerator'
import { WeaknessIdentifier } from './tools/weaknessIdentifier'
import { ContentRecommender } from './tools/contentRecommender'
import { VectorStoreService } from './vectorStoreService'
import { ConversationMemoryService } from './conversationMemoryService'

// Configuration interfaces
export interface AgentConfig {
  modelProvider: 'openai' | 'anthropic'
  modelName: string
  temperature: number
  maxTokens: number
  streaming: boolean
  apiKey: string
  vectorStoreConfig: VectorStoreConfig
  memoryConfig: MemoryConfig
}

export interface VectorStoreConfig {
  provider: 'pinecone' | 'qdrant' | 'chroma' | 'pgvector'
  indexName: string
  dimension: number
  apiKey?: string
  url?: string
}

export interface MemoryConfig {
  type: 'buffer' | 'summary' | 'vector'
  maxTokens: number
  returnMessages: boolean
}

export interface LearningContext {
  userId: string
  currentProgress: UserProgress
  examDate?: Date
  learningStyle: 'visual' | 'textual' | 'practical' | 'mixed'
  availableTimePerDay: number // in minutes
  targetScore: number
  previousSessions: SessionHistory[]
}

export interface UserProgress {
  knowledgeAreas: KnowledgeAreaProgress[]
  processGroups: ProcessGroupProgress[]
  overallScore: number
  totalStudyHours: number
  lastActivityDate: Date
  strengths: string[]
  weaknesses: string[]
}

export interface KnowledgeAreaProgress {
  name: string
  score: number
  questionsAnswered: number
  correctAnswers: number
  lastReviewDate: Date
  confidence: number
}

export interface ProcessGroupProgress {
  name: string
  score: number
  processesCompleted: number
  totalProcesses: number
}

export interface SessionHistory {
  sessionId: string
  date: Date
  duration: number
  topicsCovered: string[]
  performance: number
  feedback?: string
}

export interface StudyRecommendation {
  type: 'flashcard' | 'mock_exam' | 'reading' | 'video' | 'practice'
  topic: string
  knowledgeArea: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: number
  priority: 'high' | 'medium' | 'low'
  reason: string
  resources: Resource[]
}

export interface Resource {
  id: string
  title: string
  type: string
  url?: string
  content?: string
  metadata: Record<string, any>
}

/**
 * Main PMP Learning Agent class that orchestrates all AI capabilities
 */
export class PMPLearningAgent {
  private agent: AgentExecutor
  private llm: ChatOpenAI | ChatAnthropic
  private memory: BufferMemory | ConversationSummaryMemory
  private vectorStore: VectorStoreService
  private conversationMemory: ConversationMemoryService
  private tools: Tool[]
  private retriever: VectorStoreRetriever

  constructor(private config: AgentConfig) {
    this.initializeLLM()
    this.initializeMemory()
    this.initializeVectorStore()
    this.initializeTools()
    this.initializeAgent()
  }

  /**
   * Initialize the Language Model based on configuration
   */
  private initializeLLM(): void {
    const baseConfig = {
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      streaming: this.config.streaming,
    }

    if (this.config.modelProvider === 'openai') {
      this.llm = new ChatOpenAI({
        ...baseConfig,
        modelName: this.config.modelName,
        openAIApiKey: this.config.apiKey,
      })
    } else {
      this.llm = new ChatAnthropic({
        ...baseConfig,
        modelName: this.config.modelName,
        anthropicApiKey: this.config.apiKey,
      })
    }
  }

  /**
   * Initialize memory system for conversation context
   */
  private initializeMemory(): void {
    const memoryConfig = {
      returnMessages: this.config.memoryConfig.returnMessages,
      memoryKey: 'chat_history',
      inputKey: 'input',
      outputKey: 'output',
    }

    if (this.config.memoryConfig.type === 'buffer') {
      this.memory = new BufferMemory(memoryConfig)
    } else {
      this.memory = new ConversationSummaryMemory({
        ...memoryConfig,
        llm: this.llm,
        maxTokenLimit: this.config.memoryConfig.maxTokens,
      })
    }

    this.conversationMemory = new ConversationMemoryService(this.memory)
  }

  /**
   * Initialize vector store for PMBOK knowledge retrieval
   */
  private async initializeVectorStore(): Promise<void> {
    this.vectorStore = new VectorStoreService(this.config.vectorStoreConfig)
    await this.vectorStore.initialize()
    this.retriever = this.vectorStore.asRetriever({
      k: 5,
      searchType: 'similarity',
      scoreThreshold: 0.7,
    })
  }

  /**
   * Initialize all tools available to the agent
   */
  private initializeTools(): void {
    this.tools = [
      new PMBOKKnowledgeTool(this.retriever),
      new LearningProgressAnalyzer(),
      new StudyPlanGenerator(),
      new QuizGenerator(this.vectorStore),
      new WeaknessIdentifier(),
      new ContentRecommender(this.vectorStore),
    ]
  }

  /**
   * Initialize the main agent executor
   */
  private async initializeAgent(): Promise<void> {
    const systemPrompt = this.createSystemPrompt()

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', systemPrompt],
      ['placeholder', '{chat_history}'],
      ['human', '{input}'],
      ['placeholder', '{agent_scratchpad}'],
    ])

    const agent = await createOpenAIFunctionsAgent({
      llm: this.llm,
      tools: this.tools,
      prompt,
    })

    this.agent = new AgentExecutor({
      agent,
      tools: this.tools,
      memory: this.memory,
      verbose: process.env.NODE_ENV === 'development',
      maxIterations: 5,
      earlyStoppingMethod: 'generate',
    })
  }

  /**
   * Create the system prompt for the agent
   */
  private createSystemPrompt(): string {
    return `You are an expert PMP (Project Management Professional) learning assistant specializing in personalized education for the PMBOK (Project Management Body of Knowledge) certification exam.

Your responsibilities include:
1. Analyzing user learning progress and identifying knowledge gaps
2. Creating personalized study plans based on exam dates and available time
3. Recommending appropriate learning materials (flashcards, mock exams, readings)
4. Answering questions about PMBOK concepts with accurate, detailed explanations
5. Adapting difficulty levels based on user performance
6. Providing motivation and study tips

Key principles:
- Always reference specific PMBOK knowledge areas and process groups
- Provide practical examples from real project management scenarios
- Adapt your language and explanations to the user's expertise level
- Focus on areas where the user shows weakness
- Celebrate progress and maintain positive reinforcement
- Consider the user's learning style (visual, textual, practical)
- Optimize study sessions for maximum retention

When analyzing progress:
- Identify patterns in correct/incorrect answers
- Recognize knowledge area interdependencies
- Suggest review cycles for previously learned material
- Estimate time needed to reach target scores

When creating study plans:
- Balance different learning methods
- Include regular assessment checkpoints
- Adjust based on available study time
- Prioritize weak areas while maintaining strengths
- Include breaks and review sessions

Remember: Your goal is to help users pass the PMP exam efficiently while building genuine project management expertise.`
  }

  /**
   * Main method to process user queries with learning context
   */
  public async processQuery(
    query: string,
    context: LearningContext
  ): Promise<{
    response: string
    recommendations?: StudyRecommendation[]
    studyPlan?: any
    resources?: Resource[]
  }> {
    try {
      // Enhance query with learning context
      const enhancedInput = await this.enhanceQueryWithContext(query, context)

      // Execute agent with enhanced input
      const result = await this.agent.invoke({
        input: enhancedInput,
        userId: context.userId,
        learningContext: JSON.stringify(context),
      })

      // Parse and structure the response
      const structuredResponse = await this.structureResponse(result.output, context)

      // Store conversation in memory for future context
      await this.conversationMemory.saveInteraction(
        context.userId,
        query,
        structuredResponse.response
      )

      return structuredResponse
    } catch (error) {
      console.error('Error processing query:', error)
      throw new Error(`Failed to process learning query: ${error.message}`)
    }
  }

  /**
   * Enhance user query with relevant learning context
   */
  private async enhanceQueryWithContext(query: string, context: LearningContext): Promise<string> {
    const contextSummary = this.summarizeLearningContext(context)

    return `User Query: ${query}

Learning Context:
${contextSummary}

Please provide a personalized response considering the user's current progress, learning style, and goals.`
  }

  /**
   * Summarize learning context for prompt enhancement
   */
  private summarizeLearningContext(context: LearningContext): string {
    const { currentProgress, examDate, learningStyle, availableTimePerDay, targetScore } = context

    const weakAreas = currentProgress.knowledgeAreas
      .filter((area) => area.score < 70)
      .map((area) => area.name)
      .join(', ')

    const strongAreas = currentProgress.knowledgeAreas
      .filter((area) => area.score >= 80)
      .map((area) => area.name)
      .join(', ')

    const daysUntilExam = examDate
      ? Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 'Not set'

    return `
- Overall Progress: ${currentProgress.overallScore}%
- Target Score: ${targetScore}%
- Study Hours Completed: ${currentProgress.totalStudyHours}
- Days Until Exam: ${daysUntilExam}
- Available Time Per Day: ${availableTimePerDay} minutes
- Learning Style: ${learningStyle}
- Weak Areas: ${weakAreas || 'None identified'}
- Strong Areas: ${strongAreas || 'None identified'}
- Last Activity: ${currentProgress.lastActivityDate.toLocaleDateString()}
    `.trim()
  }

  /**
   * Structure the agent's response with recommendations and resources
   */
  private async structureResponse(
    rawResponse: string,
    context: LearningContext
  ): Promise<{
    response: string
    recommendations?: StudyRecommendation[]
    studyPlan?: any
    resources?: Resource[]
  }> {
    // Generate recommendations based on context
    const recommendations = await this.generateRecommendations(context)

    // Fetch relevant resources
    const resources = await this.fetchRelevantResources(context.currentProgress.weaknesses)

    // Generate study plan if needed
    const studyPlan = await this.generateStudyPlan(context)

    return {
      response: rawResponse,
      recommendations,
      studyPlan,
      resources,
    }
  }

  /**
   * Generate personalized study recommendations
   */
  private async generateRecommendations(context: LearningContext): Promise<StudyRecommendation[]> {
    const recommendations: StudyRecommendation[] = []

    // Analyze weak areas
    for (const area of context.currentProgress.knowledgeAreas) {
      if (area.score < 70) {
        recommendations.push({
          type: this.determineRecommendationType(area, context.learningStyle),
          topic: area.name,
          knowledgeArea: area.name,
          difficulty: this.determineDifficulty(area.score),
          estimatedTime: this.estimateStudyTime(area),
          priority: area.score < 50 ? 'high' : 'medium',
          reason: `Your score in ${area.name} is ${area.score}%, which needs improvement to reach your target.`,
          resources: await this.fetchAreaResources(area.name),
        })
      }
    }

    // Add reinforcement for borderline areas
    for (const area of context.currentProgress.knowledgeAreas) {
      if (area.score >= 70 && area.score < 80) {
        recommendations.push({
          type: 'practice',
          topic: area.name,
          knowledgeArea: area.name,
          difficulty: 'medium',
          estimatedTime: 30,
          priority: 'low',
          reason: `Reinforce your knowledge in ${area.name} to maintain and improve your ${area.score}% score.`,
          resources: await this.fetchAreaResources(area.name),
        })
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }

  /**
   * Determine the best recommendation type based on learning style
   */
  private determineRecommendationType(
    area: KnowledgeAreaProgress,
    learningStyle: string
  ): StudyRecommendation['type'] {
    const typeMap = {
      visual: ['flashcard', 'video'],
      textual: ['reading', 'flashcard'],
      practical: ['practice', 'mock_exam'],
      mixed: ['flashcard', 'practice', 'reading'],
    }

    const types = typeMap[learningStyle] || typeMap.mixed
    return types[Math.floor(Math.random() * types.length)] as StudyRecommendation['type']
  }

  /**
   * Determine difficulty level based on current score
   */
  private determineDifficulty(score: number): 'easy' | 'medium' | 'hard' {
    if (score < 40) {
      return 'easy'
    }
    if (score < 70) {
      return 'medium'
    }
    return 'hard'
  }

  /**
   * Estimate study time needed for an area
   */
  private estimateStudyTime(area: KnowledgeAreaProgress): number {
    const baseTime = 60 // Base 60 minutes
    const scoreFactor = (100 - area.score) / 100
    const confidenceFactor = (100 - area.confidence) / 100

    return Math.round(baseTime * (1 + scoreFactor + confidenceFactor * 0.5))
  }

  /**
   * Fetch resources for a specific knowledge area
   */
  private async fetchAreaResources(areaName: string): Promise<Resource[]> {
    const documents = await this.vectorStore.similaritySearch(
      `PMBOK ${areaName} concepts processes tools techniques`,
      3
    )

    return documents.map((doc, index) => ({
      id: `resource-${areaName}-${index}`,
      title: doc.metadata.title || `${areaName} Resource ${index + 1}`,
      type: doc.metadata.type || 'document',
      content: doc.pageContent,
      metadata: doc.metadata,
    }))
  }

  /**
   * Fetch relevant resources based on weaknesses
   */
  private async fetchRelevantResources(weaknesses: string[]): Promise<Resource[]> {
    const resources: Resource[] = []

    for (const weakness of weaknesses.slice(0, 3)) {
      const docs = await this.fetchAreaResources(weakness)
      resources.push(...docs)
    }

    return resources
  }

  /**
   * Generate a personalized study plan
   */
  private async generateStudyPlan(context: LearningContext): Promise<any> {
    const { examDate, availableTimePerDay, currentProgress } = context

    if (!examDate) {
      return null
    }

    const daysUntilExam = Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    const totalAvailableHours = (daysUntilExam * availableTimePerDay) / 60
    const requiredScore = context.targetScore - currentProgress.overallScore

    // Calculate time allocation for each weak area
    const weakAreas = currentProgress.knowledgeAreas
      .filter((area) => area.score < context.targetScore)
      .sort((a, b) => a.score - b.score)

    const studyPlan = {
      totalDays: daysUntilExam,
      totalHours: totalAvailableHours,
      dailySchedule: this.createDailySchedule(weakAreas, daysUntilExam, availableTimePerDay),
      milestones: this.createMilestones(daysUntilExam, currentProgress, context.targetScore),
      focusAreas: weakAreas.map((area) => ({
        name: area.name,
        currentScore: area.score,
        targetScore: context.targetScore,
        allocatedHours: this.calculateAllocatedHours(area, totalAvailableHours, weakAreas.length),
      })),
    }

    return studyPlan
  }

  /**
   * Create daily study schedule
   */
  private createDailySchedule(
    weakAreas: KnowledgeAreaProgress[],
    daysUntilExam: number,
    availableTimePerDay: number
  ): any[] {
    const schedule = []
    const areasPerDay = Math.min(2, weakAreas.length)

    for (let day = 0; day < Math.min(daysUntilExam, 30); day++) {
      const dayAreas = weakAreas.slice(
        (day * areasPerDay) % weakAreas.length,
        ((day * areasPerDay) % weakAreas.length) + areasPerDay
      )

      schedule.push({
        day: day + 1,
        date: new Date(Date.now() + day * 24 * 60 * 60 * 1000),
        topics: dayAreas.map((area) => area.name),
        duration: availableTimePerDay,
        activities: this.generateDailyActivities(dayAreas, availableTimePerDay),
      })
    }

    return schedule
  }

  /**
   * Generate daily learning activities
   */
  private generateDailyActivities(areas: KnowledgeAreaProgress[], availableTime: number): any[] {
    const activities = []
    const timePerArea = availableTime / areas.length

    for (const area of areas) {
      activities.push({
        area: area.name,
        activities: [
          {
            type: 'review',
            duration: timePerArea * 0.3,
            description: `Review ${area.name} concepts`,
          },
          {
            type: 'practice',
            duration: timePerArea * 0.5,
            description: `Practice questions for ${area.name}`,
          },
          {
            type: 'summary',
            duration: timePerArea * 0.2,
            description: `Summarize and note key points`,
          },
        ],
      })
    }

    return activities
  }

  /**
   * Create study milestones
   */
  private createMilestones(
    daysUntilExam: number,
    currentProgress: UserProgress,
    targetScore: number
  ): any[] {
    const milestones = []
    const scoreIncrement = (targetScore - currentProgress.overallScore) / 4

    for (let i = 1; i <= 4; i++) {
      milestones.push({
        week: i,
        targetScore: Math.round(currentProgress.overallScore + scoreIncrement * i),
        date: new Date(Date.now() + i * 7 * 24 * 60 * 60 * 1000),
        assessment: i % 2 === 0 ? 'mock_exam' : 'quiz',
        focus: i <= 2 ? 'weak_areas' : 'all_areas',
      })
    }

    return milestones
  }

  /**
   * Calculate allocated study hours for an area
   */
  private calculateAllocatedHours(
    area: KnowledgeAreaProgress,
    totalHours: number,
    totalAreas: number
  ): number {
    const baseAllocation = totalHours / totalAreas
    const scoreFactor = (100 - area.score) / 100

    return Math.round(baseAllocation * (1 + scoreFactor * 0.5))
  }

  /**
   * Stream responses for real-time feedback
   */
  public async *streamResponse(
    query: string,
    context: LearningContext
  ): AsyncGenerator<string, void, unknown> {
    const enhancedInput = await this.enhanceQueryWithContext(query, context)

    const stream = await this.llm.stream([
      new SystemMessage(this.createSystemPrompt()),
      new HumanMessage(enhancedInput),
    ])

    for await (const chunk of stream) {
      yield chunk.content as string
    }
  }

  /**
   * Analyze learning patterns for insights
   */
  public async analyzeLearningPatterns(
    userId: string,
    sessions: SessionHistory[]
  ): Promise<{
    patterns: any[]
    insights: string[]
    recommendations: string[]
  }> {
    const patterns = this.identifyPatterns(sessions)
    const insights = this.generateInsights(patterns)
    const recommendations = await this.generatePatternRecommendations(patterns)

    return {
      patterns,
      insights,
      recommendations,
    }
  }

  /**
   * Identify learning patterns from session history
   */
  private identifyPatterns(sessions: SessionHistory[]): any[] {
    const patterns = []

    // Time of day analysis
    const timeDistribution = this.analyzeTimeDistribution(sessions)
    patterns.push({
      type: 'time_preference',
      data: timeDistribution,
    })

    // Performance trends
    const performanceTrend = this.analyzePerformanceTrend(sessions)
    patterns.push({
      type: 'performance_trend',
      data: performanceTrend,
    })

    // Topic affinity
    const topicAffinity = this.analyzeTopicAffinity(sessions)
    patterns.push({
      type: 'topic_affinity',
      data: topicAffinity,
    })

    return patterns
  }

  /**
   * Analyze time distribution of learning sessions
   */
  private analyzeTimeDistribution(sessions: SessionHistory[]): any {
    const hourCounts = new Array(24).fill(0)

    sessions.forEach((session) => {
      const hour = new Date(session.date).getHours()
      hourCounts[hour]++
    })

    const peakHour = hourCounts.indexOf(Math.max(...hourCounts))

    return {
      distribution: hourCounts,
      peakHour,
      preferredTime: peakHour < 12 ? 'morning' : peakHour < 17 ? 'afternoon' : 'evening',
    }
  }

  /**
   * Analyze performance trend over time
   */
  private analyzePerformanceTrend(sessions: SessionHistory[]): any {
    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    const trend = sortedSessions.map((session) => ({
      date: session.date,
      performance: session.performance,
    }))

    const recentAvg = trend.slice(-5).reduce((sum, t) => sum + t.performance, 0) / 5
    const overallAvg = trend.reduce((sum, t) => sum + t.performance, 0) / trend.length

    return {
      data: trend,
      recentAverage: recentAvg,
      overallAverage: overallAvg,
      improving: recentAvg > overallAvg,
    }
  }

  /**
   * Analyze topic affinity from sessions
   */
  private analyzeTopicAffinity(sessions: SessionHistory[]): any {
    const topicPerformance = {}

    sessions.forEach((session) => {
      session.topicsCovered.forEach((topic) => {
        if (!topicPerformance[topic]) {
          topicPerformance[topic] = {
            count: 0,
            totalPerformance: 0,
          }
        }
        topicPerformance[topic].count++
        topicPerformance[topic].totalPerformance += session.performance
      })
    })

    const topicScores = Object.entries(topicPerformance).map(([topic, data]: [string, any]) => ({
      topic,
      averagePerformance: data.totalPerformance / data.count,
      frequency: data.count,
    }))

    return {
      scores: topicScores.sort((a, b) => b.averagePerformance - a.averagePerformance),
      strongTopics: topicScores.filter((t) => t.averagePerformance > 80).map((t) => t.topic),
      weakTopics: topicScores.filter((t) => t.averagePerformance < 60).map((t) => t.topic),
    }
  }

  /**
   * Generate insights from identified patterns
   */
  private generateInsights(patterns: any[]): string[] {
    const insights = []

    patterns.forEach((pattern) => {
      switch (pattern.type) {
        case 'time_preference':
          insights.push(
            `You perform best during ${pattern.data.preferredTime} study sessions (peak at ${pattern.data.peakHour}:00).`
          )
          break
        case 'performance_trend':
          insights.push(
            pattern.data.improving
              ? `Your performance is improving! Recent average: ${pattern.data.recentAverage.toFixed(1)}%`
              : `Your performance needs attention. Recent average: ${pattern.data.recentAverage.toFixed(1)}%`
          )
          break
        case 'topic_affinity':
          if (pattern.data.strongTopics.length > 0) {
            insights.push(`You excel in: ${pattern.data.strongTopics.slice(0, 3).join(', ')}`)
          }
          if (pattern.data.weakTopics.length > 0) {
            insights.push(`Focus areas needed: ${pattern.data.weakTopics.slice(0, 3).join(', ')}`)
          }
          break
      }
    })

    return insights
  }

  /**
   * Generate recommendations based on patterns
   */
  private async generatePatternRecommendations(patterns: any[]): Promise<string[]> {
    const recommendations = []

    patterns.forEach((pattern) => {
      switch (pattern.type) {
        case 'time_preference':
          recommendations.push(
            `Schedule your most challenging topics during your ${pattern.data.preferredTime} sessions for optimal retention.`
          )
          break
        case 'performance_trend':
          if (!pattern.data.improving) {
            recommendations.push(
              'Consider varying your study methods or taking more frequent breaks to improve retention.'
            )
          }
          break
        case 'topic_affinity':
          if (pattern.data.weakTopics.length > 0) {
            recommendations.push(
              `Allocate 60% of your study time to weak areas: ${pattern.data.weakTopics.slice(0, 2).join(', ')}`
            )
          }
          break
      }
    })

    return recommendations
  }

  /**
   * Generate adaptive quiz questions based on performance
   */
  public async generateAdaptiveQuiz(
    context: LearningContext,
    questionCount: number = 10
  ): Promise<any[]> {
    const questions = []
    const weakAreas = context.currentProgress.knowledgeAreas
      .filter((area) => area.score < 70)
      .map((area) => area.name)

    // 60% questions from weak areas, 40% from other areas
    const weakQuestionCount = Math.ceil(questionCount * 0.6)
    const otherQuestionCount = questionCount - weakQuestionCount

    // Generate questions for weak areas
    for (let i = 0; i < weakQuestionCount && weakAreas.length > 0; i++) {
      const area = weakAreas[i % weakAreas.length]
      const question = await this.generateQuestionForArea(area, 'medium')
      questions.push(question)
    }

    // Generate questions for other areas
    for (let i = 0; i < otherQuestionCount; i++) {
      const randomArea = this.selectRandomArea(context.currentProgress.knowledgeAreas)
      const difficulty = this.selectAdaptiveDifficulty(randomArea.score)
      const question = await this.generateQuestionForArea(randomArea.name, difficulty)
      questions.push(question)
    }

    return questions
  }

  /**
   * Generate a question for a specific knowledge area
   */
  private async generateQuestionForArea(area: string, difficulty: string): Promise<any> {
    const prompt = `Generate a ${difficulty} difficulty PMP exam question about ${area}. 
    Include 4 answer options with one correct answer. 
    Provide explanation for the correct answer.
    Format as JSON with: question, options, correctAnswer, explanation`

    const response = await this.llm.invoke([
      new SystemMessage('You are a PMP exam question generator.'),
      new HumanMessage(prompt),
    ])

    try {
      return JSON.parse(response.content as string)
    } catch {
      // Fallback structure if parsing fails
      return {
        question: `Sample question about ${area}`,
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        explanation: 'Sample explanation',
        area,
        difficulty,
      }
    }
  }

  /**
   * Select a random knowledge area
   */
  private selectRandomArea(areas: KnowledgeAreaProgress[]): KnowledgeAreaProgress {
    return areas[Math.floor(Math.random() * areas.length)]
  }

  /**
   * Select adaptive difficulty based on score
   */
  private selectAdaptiveDifficulty(score: number): string {
    if (score < 60) {
      return 'easy'
    }
    if (score < 80) {
      return 'medium'
    }
    return 'hard'
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    await this.vectorStore.cleanup()
    await this.conversationMemory.cleanup()
  }
}

export default PMPLearningAgent
