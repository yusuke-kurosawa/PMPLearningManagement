/**
 * Offline AI Service
 * Provides AI functionality with offline fallback and intelligent caching
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { conversationExamples, questionTemplates } from './prompts/conversationExamples'
import { completeProcesses } from '../../data/pmbok/completeProcesses'
import { pmpGlossary } from '../../data/pmpGlossary'

interface AICacheDBSchema {
  responses: {
    key: string
    value: {
      query: string
      response: string
      timestamp: number
      context?: any
      ttl: number
    }
  }
  embeddings: {
    key: string
    value: {
      text: string
      embedding: number[]
      timestamp: number
    }
  }
  studyPlans: {
    key: string
    value: {
      userId: string
      plan: any
      timestamp: number
      expiresAt: number
    }
  }
  recommendations: {
    key: string
    value: {
      userId: string
      recommendations: any[]
      context: any
      timestamp: number
    }
  }
  quizzes: {
    key: string
    value: {
      topic: string
      questions: any[]
      difficulty: string
      timestamp: number
    }
  }
}

export class OfflineAIService {
  private db: IDBPDatabase<AICache> | null = null
  private readonly DB_NAME = 'ai-offline-cache'
  private readonly DB_VERSION = 1
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours
  private readonly MAX_CACHE_SIZE = 100 * 1024 * 1024 // 100MB
  private isOnline: boolean = navigator.onLine

  constructor() {
    this.initializeDB()
    this.setupNetworkListeners()
    this.preloadEssentialData()
  }

  /**
   * Initialize IndexedDB for offline storage
   */
  private async initializeDB(): Promise<void> {
    try {
      this.db = await openDB<AICache>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          // Responses cache
          if (!db.objectStoreNames.contains('responses')) {
            const responseStore = db.createObjectStore('responses')
            responseStore.createIndex('timestamp', 'timestamp')
          }

          // Embeddings cache
          if (!db.objectStoreNames.contains('embeddings')) {
            const embeddingStore = db.createObjectStore('embeddings')
            embeddingStore.createIndex('timestamp', 'timestamp')
          }

          // Study plans cache
          if (!db.objectStoreNames.contains('studyPlans')) {
            const planStore = db.createObjectStore('studyPlans')
            planStore.createIndex('userId', 'userId')
            planStore.createIndex('expiresAt', 'expiresAt')
          }

          // Recommendations cache
          if (!db.objectStoreNames.contains('recommendations')) {
            const recStore = db.createObjectStore('recommendations')
            recStore.createIndex('userId', 'userId')
            recStore.createIndex('timestamp', 'timestamp')
          }

          // Quizzes cache
          if (!db.objectStoreNames.contains('quizzes')) {
            const quizStore = db.createObjectStore('quizzes')
            quizStore.createIndex('topic', 'topic')
            quizStore.createIndex('timestamp', 'timestamp')
          }
        },
      })
    } catch (error) {
      console.error('Failed to initialize offline DB:', error)
    }
  }

  /**
   * Setup network status listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncOfflineData()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  /**
   * Preload essential data for offline use
   */
  private async preloadEssentialData(): Promise<void> {
    try {
      // Cache common responses
      for (const example of conversationExamples) {
        await this.cacheResponse(example.userQuery, example.aiResponse, {
          category: example.category,
        })
      }

      // Cache PMBOK process data
      await this.cacheProcessData()

      // Cache glossary terms
      await this.cacheGlossaryData()
    } catch (error) {
      console.error('Failed to preload data:', error)
    }
  }

  /**
   * Cache PMBOK process data for offline access
   */
  private async cacheProcessData(): Promise<void> {
    if (!this.db) {
      return
    }

    const processQueries = [
      'What are the Integration Management processes?',
      'Explain the Planning Process Group',
      'What are the outputs of Risk Management?',
      'List all Executing processes',
    ]

    for (const query of processQueries) {
      const response = this.generateProcessResponse(query)
      await this.cacheResponse(query, response, { type: 'process' })
    }
  }

  /**
   * Cache glossary data for offline access
   */
  private async cacheGlossaryData(): Promise<void> {
    if (!this.db) {
      return
    }

    for (const term of pmpGlossary.slice(0, 50)) {
      const query = `What is ${term.term}?`
      const response = `**${term.term}**\n\n${term.definition}\n\nCategory: ${term.category}`
      await this.cacheResponse(query, response, { type: 'glossary' })
    }
  }

  /**
   * Get AI response with offline fallback
   */
  public async getResponse(
    query: string,
    context: any,
    onlineService?: any
  ): Promise<{
    response: string
    isOffline: boolean
    cached: boolean
  }> {
    const cacheKey = this.generateCacheKey(query, context)

    // Check cache first
    const cachedResponse = await this.getCachedResponse(cacheKey)
    if (cachedResponse && this.isCacheValid(cachedResponse)) {
      return {
        response: cachedResponse.response,
        isOffline: false,
        cached: true,
      }
    }

    // If online and service available, get fresh response
    if (this.isOnline && onlineService) {
      try {
        const response = await onlineService.processMessage(query, context)

        // Cache the response
        await this.cacheResponse(query, response.response, context)

        return {
          response: response.response,
          isOffline: false,
          cached: false,
        }
      } catch (error) {
        console.error('Online service failed, falling back to offline:', error)
      }
    }

    // Offline fallback
    const offlineResponse = await this.generateOfflineResponse(query, context)
    return {
      response: offlineResponse,
      isOffline: true,
      cached: false,
    }
  }

  /**
   * Generate offline response using local data
   */
  private async generateOfflineResponse(query: string, context: any): Promise<string> {
    const lowerQuery = query.toLowerCase()

    // Check for exact matches in examples
    const exactMatch = conversationExamples.find(
      (example) => example.userQuery.toLowerCase() === lowerQuery
    )
    if (exactMatch) {
      return exactMatch.aiResponse
    }

    // Detect intent and generate appropriate response
    const intent = this.detectIntent(query)

    switch (intent) {
      case 'definition':
        return this.generateDefinitionResponse(query)
      case 'process':
        return this.generateProcessResponse(query)
      case 'itto':
        return this.generateITTOResponse(query)
      case 'study_plan':
        return this.generateOfflineStudyPlan(context)
      case 'quiz':
        return this.generateOfflineQuiz(query, context)
      case 'progress':
        return this.generateProgressSummary(context)
      default:
        return this.generateGenericResponse(query)
    }
  }

  /**
   * Detect user intent from query
   */
  private detectIntent(query: string): string {
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes('what is') || lowerQuery.includes('define')) {
      return 'definition'
    }
    if (lowerQuery.includes('process') || lowerQuery.includes('processes')) {
      return 'process'
    }
    if (
      lowerQuery.includes('input') ||
      lowerQuery.includes('output') ||
      lowerQuery.includes('itto')
    ) {
      return 'itto'
    }
    if (lowerQuery.includes('study plan') || lowerQuery.includes('schedule')) {
      return 'study_plan'
    }
    if (lowerQuery.includes('quiz') || lowerQuery.includes('test')) {
      return 'quiz'
    }
    if (lowerQuery.includes('progress') || lowerQuery.includes('how am i doing')) {
      return 'progress'
    }

    return 'general'
  }

  /**
   * Generate definition response from glossary
   */
  private generateDefinitionResponse(query: string): string {
    const searchTerm = query
      .toLowerCase()
      .replace('what is', '')
      .replace('define', '')
      .replace('?', '')
      .trim()

    const term = pmpGlossary.find((item) => item.term.toLowerCase().includes(searchTerm))

    if (term) {
      return `**${term.term}**\n\n${term.definition}\n\n**Category:** ${term.category}\n\n${
        term.example ? `**Example:** ${term.example}` : ''
      }\n\n*Note: This response is from offline cache. Connect to internet for more detailed explanations.*`
    }

    return `I couldn't find a definition for "${searchTerm}" in my offline database. Please connect to the internet for a comprehensive answer.`
  }

  /**
   * Generate process response from local data
   */
  private generateProcessResponse(query: string): string {
    const processData = Object.values(completeProcesses)
    const lowerQuery = query.toLowerCase()

    // Find relevant processes
    const relevantProcesses = processData.filter((process) => {
      return (
        lowerQuery.includes(process.knowledgeArea.toLowerCase()) ||
        lowerQuery.includes(process.processGroup.toLowerCase()) ||
        lowerQuery.includes(process.name.toLowerCase())
      )
    })

    if (relevantProcesses.length > 0) {
      let response = '**Relevant Processes:**\n\n'

      relevantProcesses.slice(0, 5).forEach((process) => {
        response += `**${process.name}**\n`
        response += `- Knowledge Area: ${process.knowledgeArea}\n`
        response += `- Process Group: ${process.processGroup}\n`
        response += `- Description: ${process.description || 'No description available'}\n\n`
      })

      response += '*Note: This is offline data. Connect for complete ITTO details and examples.*'
      return response
    }

    return 'No matching processes found in offline cache. Please connect to internet for comprehensive process information.'
  }

  /**
   * Generate ITTO response from local data
   */
  private generateITTOResponse(query: string): string {
    const processData = Object.values(completeProcesses)
    const lowerQuery = query.toLowerCase()

    const process = processData.find((p) => lowerQuery.includes(p.name.toLowerCase()))

    if (process && process.itto) {
      let response = `**${process.name} - ITTO**\n\n`

      response += '**Inputs:**\n'
      process.itto.inputs?.slice(0, 5).forEach((input) => {
        response += `- ${input.name}\n`
      })

      response += '\n**Tools & Techniques:**\n'
      process.itto.toolsTechniques?.slice(0, 5).forEach((tool) => {
        response += `- ${tool.name}\n`
      })

      response += '\n**Outputs:**\n'
      process.itto.outputs?.slice(0, 5).forEach((output) => {
        response += `- ${output.name}\n`
      })

      response += '\n*Offline version - connect for detailed descriptions.*'
      return response
    }

    return 'ITTO information not available offline for this query. Please connect to internet.'
  }

  /**
   * Generate offline study plan
   */
  private generateOfflineStudyPlan(context: any): string {
    const daysUntilExam = context.examDate
      ? Math.ceil((new Date(context.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 60

    const hoursPerDay = context.availableTimePerDay || 2
    const totalHours = daysUntilExam * hoursPerDay

    return `**Offline Study Plan Generator**

Based on your information:
- Days until exam: ${daysUntilExam}
- Study time per day: ${hoursPerDay} hours
- Total study hours: ${totalHours}

**Recommended Schedule:**

**Week 1-2: Foundation**
- Review all 10 Knowledge Areas
- Understand 5 Process Groups
- Daily: ${hoursPerDay} hours mixed reading and flashcards

**Week 3-4: Deep Dive**
- Master ITTO for critical processes
- Focus on weak areas: ${context.currentProgress?.weakAreas?.join(', ') || 'Risk, Cost, Schedule'}
- Daily practice questions: 20-30

**Week 5-6: Practice**
- Full mock exams on weekends
- Daily quiz sessions
- Review incorrect answers

**Final Week: Polish**
- Light review only
- Confidence building
- Exam strategy practice

*This is a basic offline template. Connect to internet for a personalized, detailed plan with specific resources and adaptive scheduling.*`
  }

  /**
   * Generate offline quiz
   */
  private generateOfflineQuiz(query: string, context: any): string {
    const topic = this.extractTopic(query)

    // Simple question template
    const questions = [
      {
        question: `Which document formally authorizes a project?`,
        options: [
          'A) Project Management Plan',
          'B) Project Charter',
          'C) Business Case',
          'D) Statement of Work',
        ],
        correct: 'B',
        explanation:
          'The Project Charter formally authorizes the project and gives the PM authority.',
      },
      {
        question: `What is the formula for Cost Variance (CV)?`,
        options: ['A) EV - AC', 'B) EV - PV', 'C) BAC - EAC', 'D) AC - PV'],
        correct: 'A',
        explanation: 'Cost Variance = Earned Value - Actual Cost (CV = EV - AC)',
      },
    ]

    let response = `**Quick Practice Quiz - ${topic || 'General'}**\n\n`

    questions.forEach((q, index) => {
      response += `**Question ${index + 1}:**\n${q.question}\n\n`
      q.options.forEach((opt) => (response += `${opt}\n`))
      response += `\n**Answer:** ${q.correct}\n`
      response += `**Explanation:** ${q.explanation}\n\n`
    })

    response += '*Offline quiz with limited questions. Connect for adaptive, personalized quizzes.*'
    return response
  }

  /**
   * Generate progress summary from local data
   */
  private generateProgressSummary(context: any): string {
    const progress = context.currentProgress || {}

    return `**Learning Progress Summary (Offline)**

**Overall Score:** ${progress.overall || 0}%
**Study Hours:** ${progress.totalStudyHours || 0}
**Questions Practiced:** ${progress.questionsAnswered || 0}

**Knowledge Areas:**
${
  progress.knowledgeAreas
    ?.slice(0, 5)
    .map((area) => `- ${area.name}: ${area.score}%`)
    .join('\n') || 'No data available offline'
}

**Recommendations:**
1. Focus on areas below 70%
2. Maintain daily practice routine
3. Review weak topics regularly

*This is cached data. Connect to internet for real-time progress analysis and personalized recommendations.*`
  }

  /**
   * Generate generic response
   */
  private generateGenericResponse(query: string): string {
    return `I understand you're asking about: "${query}"

I'm currently in offline mode with limited functionality. I can help with:
- Basic PMBOK definitions
- Process information
- Simple study planning
- General PMP guidance

For detailed, personalized responses and advanced features like:
- AI-powered analysis
- Custom study plans
- Adaptive quizzes
- Real-time progress tracking

Please connect to the internet.

Meanwhile, you can:
1. Review flashcards
2. Practice with offline questions
3. Study PMBOK processes
4. Review your notes`
  }

  /**
   * Extract topic from query
   */
  private extractTopic(query: string): string {
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

    for (const area of knowledgeAreas) {
      if (query.toLowerCase().includes(area.toLowerCase())) {
        return area + ' Management'
      }
    }

    return 'General PMBOK'
  }

  /**
   * Cache a response
   */
  private async cacheResponse(query: string, response: string, context?: any): Promise<void> {
    if (!this.db) {
      return
    }

    const cacheKey = this.generateCacheKey(query, context)

    try {
      await this.db.put(
        'responses',
        {
          query,
          response,
          timestamp: Date.now(),
          context,
          ttl: this.CACHE_TTL,
        },
        cacheKey
      )

      // Clean up old cache if needed
      await this.cleanupCache()
    } catch (error) {
      console.error('Failed to cache response:', error)
    }
  }

  /**
   * Get cached response
   */
  private async getCachedResponse(cacheKey: string): Promise<any> {
    if (!this.db) {
      return null
    }

    try {
      return await this.db.get('responses', cacheKey)
    } catch (error) {
      console.error('Failed to get cached response:', error)
      return null
    }
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(cached: any): boolean {
    const now = Date.now()
    return now - cached.timestamp < cached.ttl
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(query: string, context?: any): string {
    const normalizedQuery = query.toLowerCase().trim()
    const contextKey = context ? JSON.stringify(context).substring(0, 100) : ''
    return `${normalizedQuery}_${contextKey}`
  }

  /**
   * Clean up old cache entries
   */
  private async cleanupCache(): Promise<void> {
    if (!this.db) {
      return
    }

    try {
      const tx = this.db.transaction('responses', 'readwrite')
      const index = tx.store.index('timestamp')
      const cutoffTime = Date.now() - this.CACHE_TTL

      for await (const cursor of index.iterate()) {
        if (cursor.value.timestamp < cutoffTime) {
          await cursor.delete()
        }
      }

      await tx.done
    } catch (error) {
      console.error('Failed to cleanup cache:', error)
    }
  }

  /**
   * Sync offline data when coming back online
   */
  private async syncOfflineData(): Promise<void> {
    // This would sync any offline interactions back to the server
    console.log('Syncing offline data...')

    // Get all cached responses that were generated offline
    // Send them to the server for learning/analytics
    // Update local cache with fresh data
  }

  /**
   * Get cache statistics
   */
  public async getCacheStats(): Promise<{
    totalEntries: number
    cacheSize: number
    oldestEntry: Date | null
    mostRecent: Date | null
  }> {
    if (!this.db) {
      return {
        totalEntries: 0,
        cacheSize: 0,
        oldestEntry: null,
        mostRecent: null,
      }
    }

    const entries = await this.db.getAllKeys('responses')
    const allData = await this.db.getAll('responses')

    let oldestTime = Date.now()
    let newestTime = 0
    let totalSize = 0

    allData.forEach((item) => {
      const size = JSON.stringify(item).length
      totalSize += size

      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
      }
      if (item.timestamp > newestTime) {
        newestTime = item.timestamp
      }
    })

    return {
      totalEntries: entries.length,
      cacheSize: totalSize,
      oldestEntry: oldestTime ? new Date(oldestTime) : null,
      mostRecent: newestTime ? new Date(newestTime) : null,
    }
  }

  /**
   * Clear all cache
   */
  public async clearCache(): Promise<void> {
    if (!this.db) {
      return
    }

    const stores = ['responses', 'embeddings', 'studyPlans', 'recommendations', 'quizzes']

    for (const store of stores) {
      await this.db.clear(store)
    }
  }

  /**
   * Export cache for backup
   */
  public async exportCache(): Promise<any> {
    if (!this.db) {
      return null
    }

    const data = {
      responses: await this.db.getAll('responses'),
      studyPlans: await this.db.getAll('studyPlans'),
      recommendations: await this.db.getAll('recommendations'),
      quizzes: await this.db.getAll('quizzes'),
      exportDate: new Date().toISOString(),
    }

    return data
  }

  /**
   * Import cache from backup
   */
  public async importCache(data: any): Promise<void> {
    if (!this.db || !data) {
      return
    }

    try {
      // Clear existing cache
      await this.clearCache()

      // Import responses
      if (data.responses) {
        for (const item of data.responses) {
          await this.db.put('responses', item.value, item.key)
        }
      }

      // Import other stores similarly
      // ...
    } catch (error) {
      console.error('Failed to import cache:', error)
    }
  }
}

export default OfflineAIService
