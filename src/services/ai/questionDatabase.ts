/**
 * Question Database Schema and Vector Store Management
 * Handles storage, retrieval, and similarity search for questions
 */

import { Pinecone } from '@pinecone-database/pinecone'
import { QdrantClient } from '@qdrant/js-client-rest'
import { ChromaClient, Collection } from 'chromadb'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Document } from '@langchain/core/documents'
import type { GeneratedQuestion } from './questionGenerationAgent'
import type { IRTParameters } from './difficultyAdjustmentEngine'

/**
 * Database schema for questions (PostgreSQL/Supabase)
 */
export interface QuestionDBSchema {
  id: string
  question_text: string
  options: string[] // JSON array
  correct_answer: string | string[] // JSON
  explanation: string
  domain: 'people' | 'process' | 'business_environment'
  knowledge_area: string
  process?: string
  difficulty: 'easy' | 'medium' | 'hard'
  type: 'single' | 'multiple' | 'scenario' | 'calculation' | 'drag_drop'
  blooms_level: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create'
  estimated_time: number
  tags: string[] // JSON array
  references: string[] // JSON array
  distractors?: object // JSON
  context_scenario?: string
  learning_objective: string
  common_mistakes?: string[] // JSON array
  hints?: string[] // JSON array
  related_concepts: string[] // JSON array
  difficulty_factors?: object // JSON

  // IRT parameters
  irt_a?: number // Discrimination
  irt_b?: number // Difficulty
  irt_c?: number // Guessing

  // Performance metrics
  times_answered: number
  correct_count: number
  incorrect_count: number
  average_time_spent: number
  discrimination_index?: number
  difficulty_index?: number

  // Quality metrics
  quality_score?: number
  clarity_score?: number
  relevance_score?: number
  fairness_score?: number
  last_quality_check?: Date

  // Metadata
  created_by: string
  created_at: Date
  updated_at: Date
  version: number
  is_active: boolean
  is_verified: boolean
  review_status: 'pending' | 'approved' | 'rejected' | 'needs_revision'
  review_notes?: string

  // Vector embedding ID
  vector_id?: string
}

/**
 * Vector store configuration
 */
export interface VectorStoreConfig {
  provider: 'pinecone' | 'qdrant' | 'chroma' | 'weaviate'
  apiKey?: string
  environment?: string
  indexName?: string
  collectionName?: string
  dimension?: number
  metric?: 'cosine' | 'euclidean' | 'dot_product'
  url?: string
}

/**
 * Question search parameters
 */
export interface QuestionSearchParams {
  query?: string
  domain?: string[]
  knowledgeArea?: string[]
  difficulty?: string[]
  type?: string[]
  bloomsLevel?: string[]
  tags?: string[]
  minQualityScore?: number
  isVerified?: boolean
  limit?: number
  offset?: number
  sortBy?: 'relevance' | 'difficulty' | 'quality' | 'performance' | 'created' | 'updated'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Question performance update
 */
export interface QuestionPerformanceUpdate {
  questionId: string
  isCorrect: boolean
  timeSpent: number
  studentAbility: number
  attemptNumber: number
}

/**
 * Unified Question Database Manager
 */
export class QuestionDatabaseManager {
  private vectorStore: PineconeVectorStore | QdrantVectorStore | ChromaVectorStore
  private embeddings: OpenAIEmbeddings
  private dbClient: any // Supabase or other DB client

  constructor(vectorConfig: VectorStoreConfig, dbClient: any) {
    this.dbClient = dbClient
    this.embeddings = new OpenAIEmbeddings({
      modelName: 'text-embedding-3-small',
      openAIApiKey: process.env.OPENAI_API_KEY,
    })

    // Initialize vector store based on provider
    switch (vectorConfig.provider) {
      case 'pinecone':
        this.vectorStore = new PineconeVectorStore(vectorConfig, this.embeddings)
        break
      case 'qdrant':
        this.vectorStore = new QdrantVectorStore(vectorConfig, this.embeddings)
        break
      case 'chroma':
        this.vectorStore = new ChromaVectorStore(vectorConfig, this.embeddings)
        break
      default:
        throw new Error(`Unsupported vector store provider: ${vectorConfig.provider}`)
    }
  }

  /**
   * Initialize database tables and indexes
   */
  async initialize() {
    // Create questions table if not exists
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question_text TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_answer JSONB NOT NULL,
        explanation TEXT,
        domain VARCHAR(50) NOT NULL,
        knowledge_area VARCHAR(100),
        process VARCHAR(100),
        difficulty VARCHAR(20) NOT NULL,
        type VARCHAR(50) NOT NULL,
        blooms_level VARCHAR(20),
        estimated_time INTEGER,
        tags JSONB,
        references JSONB,
        distractors JSONB,
        context_scenario TEXT,
        learning_objective TEXT,
        common_mistakes JSONB,
        hints JSONB,
        related_concepts JSONB,
        difficulty_factors JSONB,
        
        irt_a FLOAT,
        irt_b FLOAT,
        irt_c FLOAT,
        
        times_answered INTEGER DEFAULT 0,
        correct_count INTEGER DEFAULT 0,
        incorrect_count INTEGER DEFAULT 0,
        average_time_spent FLOAT DEFAULT 0,
        discrimination_index FLOAT,
        difficulty_index FLOAT,
        
        quality_score FLOAT,
        clarity_score FLOAT,
        relevance_score FLOAT,
        fairness_score FLOAT,
        last_quality_check TIMESTAMP,
        
        created_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        version INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        is_verified BOOLEAN DEFAULT false,
        review_status VARCHAR(20) DEFAULT 'pending',
        review_notes TEXT,
        
        vector_id VARCHAR(255)
      );
      
      CREATE INDEX IF NOT EXISTS idx_questions_domain ON questions(domain);
      CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
      CREATE INDEX IF NOT EXISTS idx_questions_knowledge_area ON questions(knowledge_area);
      CREATE INDEX IF NOT EXISTS idx_questions_quality_score ON questions(quality_score);
      CREATE INDEX IF NOT EXISTS idx_questions_is_active ON questions(is_active);
      CREATE INDEX IF NOT EXISTS idx_questions_review_status ON questions(review_status);
    `

    await this.dbClient.query(createTableQuery)

    // Initialize vector store
    await this.vectorStore.initialize()
  }

  /**
   * Save a new question or update existing
   */
  async saveQuestion(
    question: GeneratedQuestion,
    createdBy: string,
    qualityScore?: number
  ): Promise<string> {
    // Generate embedding for the question
    const embedding = await this.embeddings.embedQuery(question.question)

    // Save to vector store
    const vectorId = await this.vectorStore.upsert({
      id: question.id,
      values: embedding,
      metadata: {
        domain: question.domain,
        knowledgeArea: question.knowledgeArea,
        difficulty: question.difficulty,
        type: question.type,
        bloomsLevel: question.bloomsLevel,
        tags: question.tags,
      },
    })

    // Save to database
    const dbRecord: Partial<QuestionDBSchema> = {
      id: question.id,
      question_text: question.question,
      options: question.options,
      correct_answer: question.correctAnswer,
      explanation: question.explanation,
      domain: question.domain,
      knowledge_area: question.knowledgeArea,
      process: question.process,
      difficulty: question.difficulty,
      type: question.type,
      blooms_level: question.bloomsLevel,
      estimated_time: question.estimatedTime,
      tags: question.tags,
      references: question.references,
      distractors: question.distractors,
      context_scenario: question.contextScenario,
      learning_objective: question.learningObjective,
      common_mistakes: question.commonMistakes,
      hints: question.hints,
      related_concepts: question.relatedConcepts,
      difficulty_factors: question.difficultyFactors,
      quality_score: qualityScore,
      created_by: createdBy,
      vector_id: vectorId,
    }

    const { data, error } = await this.dbClient.from('questions').upsert(dbRecord).select().single()

    if (error) {
      throw error
    }

    return data.id
  }

  /**
   * Search questions with semantic similarity
   */
  async searchQuestions(params: QuestionSearchParams): Promise<QuestionDBSchema[]> {
    let results: QuestionDBSchema[] = []

    if (params.query) {
      // Semantic search using vector store
      const embedding = await this.embeddings.embedQuery(params.query)
      const vectorResults = await this.vectorStore.search({
        vector: embedding,
        topK: params.limit || 20,
        filter: this.buildVectorFilter(params),
      })

      // Get full records from database
      const ids = vectorResults.map((r) => r.id)
      const { data, error } = await this.dbClient
        .from('questions')
        .select('*')
        .in('id', ids)
        .eq('is_active', true)

      if (error) {
        throw error
      }
      results = data
    } else {
      // Direct database search
      let query = this.dbClient.from('questions').select('*').eq('is_active', true)

      // Apply filters
      if (params.domain) {
        query = query.in('domain', params.domain)
      }
      if (params.knowledgeArea) {
        query = query.in('knowledge_area', params.knowledgeArea)
      }
      if (params.difficulty) {
        query = query.in('difficulty', params.difficulty)
      }
      if (params.type) {
        query = query.in('type', params.type)
      }
      if (params.bloomsLevel) {
        query = query.in('blooms_level', params.bloomsLevel)
      }
      if (params.minQualityScore) {
        query = query.gte('quality_score', params.minQualityScore)
      }
      if (params.isVerified !== undefined) {
        query = query.eq('is_verified', params.isVerified)
      }

      // Apply sorting
      const sortColumn = this.getSortColumn(params.sortBy)
      query = query.order(sortColumn, { ascending: params.sortOrder === 'asc' })

      // Apply pagination
      if (params.limit) {
        query = query.limit(params.limit)
      }
      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 20) - 1)
      }

      const { data, error } = await query
      if (error) {
        throw error
      }
      results = data
    }

    return results
  }

  /**
   * Get similar questions to avoid duplication
   */
  async findSimilarQuestions(
    questionText: string,
    threshold: number = 0.85,
    limit: number = 5
  ): Promise<Array<{ question: QuestionDBSchema; similarity: number }>> {
    const embedding = await this.embeddings.embedQuery(questionText)

    const vectorResults = await this.vectorStore.search({
      vector: embedding,
      topK: limit * 2, // Get more to filter by threshold
      includeScores: true,
    })

    // Filter by similarity threshold
    const similarResults = vectorResults.filter((r) => r.score >= threshold).slice(0, limit)

    // Get full records
    const ids = similarResults.map((r) => r.id)
    const { data, error } = await this.dbClient.from('questions').select('*').in('id', ids)

    if (error) {
      throw error
    }

    // Combine with similarity scores
    return similarResults.map((vr) => ({
      question: data.find((q: QuestionDBSchema) => q.id === vr.id)!,
      similarity: vr.score,
    }))
  }

  /**
   * Update question performance metrics
   */
  async updatePerformance(update: QuestionPerformanceUpdate) {
    const { data: question, error: fetchError } = await this.dbClient
      .from('questions')
      .select('*')
      .eq('id', update.questionId)
      .single()

    if (fetchError) {
      throw fetchError
    }

    // Update metrics
    const newTimesAnswered = question.times_answered + 1
    const newCorrectCount = question.correct_count + (update.isCorrect ? 1 : 0)
    const newIncorrectCount = question.incorrect_count + (update.isCorrect ? 0 : 1)
    const newAvgTimeSpent =
      (question.average_time_spent * question.times_answered + update.timeSpent) / newTimesAnswered

    // Calculate difficulty index (percentage correct)
    const difficultyIndex = newCorrectCount / newTimesAnswered

    // Update discrimination index (simplified)
    // In production, this would use more sophisticated IRT calculations
    const discriminationIndex =
      Math.abs(update.studentAbility - question.irt_b || 0) * (update.isCorrect ? 1 : -1) * 0.1 +
      (question.discrimination_index || 0) * 0.9

    const { error: updateError } = await this.dbClient
      .from('questions')
      .update({
        times_answered: newTimesAnswered,
        correct_count: newCorrectCount,
        incorrect_count: newIncorrectCount,
        average_time_spent: newAvgTimeSpent,
        difficulty_index: difficultyIndex,
        discrimination_index: discriminationIndex,
        updated_at: new Date(),
      })
      .eq('id', update.questionId)

    if (updateError) {
      throw updateError
    }
  }

  /**
   * Update IRT parameters
   */
  async updateIRTParameters(questionId: string, params: IRTParameters) {
    const { error } = await this.dbClient
      .from('questions')
      .update({
        irt_a: params.a,
        irt_b: params.b,
        irt_c: params.c,
        updated_at: new Date(),
      })
      .eq('id', questionId)

    if (error) {
      throw error
    }
  }

  /**
   * Update quality scores
   */
  async updateQualityScores(
    questionId: string,
    scores: {
      overall: number
      clarity: number
      relevance: number
      fairness: number
    }
  ) {
    const { error } = await this.dbClient
      .from('questions')
      .update({
        quality_score: scores.overall,
        clarity_score: scores.clarity,
        relevance_score: scores.relevance,
        fairness_score: scores.fairness,
        last_quality_check: new Date(),
        updated_at: new Date(),
      })
      .eq('id', questionId)

    if (error) {
      throw error
    }
  }

  /**
   * Get question statistics
   */
  async getQuestionStatistics(questionId: string): Promise<{
    performance: any
    quality: any
    usage: any
  }> {
    const { data, error } = await this.dbClient
      .from('questions')
      .select(
        `
        times_answered,
        correct_count,
        incorrect_count,
        average_time_spent,
        discrimination_index,
        difficulty_index,
        quality_score,
        clarity_score,
        relevance_score,
        fairness_score,
        created_at,
        updated_at,
        review_status
      `
      )
      .eq('id', questionId)
      .single()

    if (error) {
      throw error
    }

    return {
      performance: {
        timesAnswered: data.times_answered,
        correctRate: data.times_answered > 0 ? data.correct_count / data.times_answered : 0,
        averageTimeSpent: data.average_time_spent,
        discriminationIndex: data.discrimination_index,
        difficultyIndex: data.difficulty_index,
      },
      quality: {
        overallScore: data.quality_score,
        clarityScore: data.clarity_score,
        relevanceScore: data.relevance_score,
        fairnessScore: data.fairness_score,
        lastChecked: data.last_quality_check,
      },
      usage: {
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        reviewStatus: data.review_status,
        ageInDays: Math.floor(
          (Date.now() - new Date(data.created_at).getTime()) / (1000 * 60 * 60 * 24)
        ),
      },
    }
  }

  /**
   * Bulk import questions
   */
  async bulkImport(questions: GeneratedQuestion[], createdBy: string): Promise<number> {
    let successCount = 0

    for (const question of questions) {
      try {
        await this.saveQuestion(question, createdBy)
        successCount++
      } catch (error) {
        console.error(`Failed to import question ${question.id}:`, error)
      }
    }

    return successCount
  }

  /**
   * Export questions
   */
  async exportQuestions(params: QuestionSearchParams): Promise<GeneratedQuestion[]> {
    const dbQuestions = await this.searchQuestions(params)

    return dbQuestions.map(
      (q) =>
        ({
          id: q.id,
          question: q.question_text,
          options: q.options,
          correctAnswer: q.correct_answer,
          explanation: q.explanation,
          domain: q.domain,
          knowledgeArea: q.knowledge_area,
          process: q.process,
          difficulty: q.difficulty,
          type: q.type,
          bloomsLevel: q.blooms_level,
          estimatedTime: q.estimated_time,
          tags: q.tags,
          references: q.references,
          distractors: q.distractors,
          contextScenario: q.context_scenario,
          learningObjective: q.learning_objective,
          commonMistakes: q.common_mistakes,
          hints: q.hints,
          relatedConcepts: q.related_concepts,
          difficultyFactors: q.difficulty_factors,
        }) as GeneratedQuestion
    )
  }

  /**
   * Helper methods
   */

  private buildVectorFilter(params: QuestionSearchParams): any {
    const filter: any = {}

    if (params.domain) {
      filter.domain = { $in: params.domain }
    }
    if (params.knowledgeArea) {
      filter.knowledgeArea = { $in: params.knowledgeArea }
    }
    if (params.difficulty) {
      filter.difficulty = { $in: params.difficulty }
    }
    if (params.type) {
      filter.type = { $in: params.type }
    }
    if (params.bloomsLevel) {
      filter.bloomsLevel = { $in: params.bloomsLevel }
    }
    if (params.tags) {
      filter.tags = { $in: params.tags }
    }

    return filter
  }

  private getSortColumn(sortBy?: string): string {
    const columnMap: Record<string, string> = {
      relevance: 'quality_score',
      difficulty: 'difficulty_index',
      quality: 'quality_score',
      performance: 'discrimination_index',
      created: 'created_at',
      updated: 'updated_at',
    }

    return columnMap[sortBy || 'created'] || 'created_at'
  }
}

/**
 * Pinecone Vector Store Implementation
 */
class PineconeVectorStore {
  private client: Pinecone
  private index: any
  private config: VectorStoreConfig
  private embeddings: OpenAIEmbeddings

  constructor(config: VectorStoreConfig, embeddings: OpenAIEmbeddings) {
    this.config = config
    this.embeddings = embeddings
    this.client = new Pinecone({
      apiKey: config.apiKey!,
      environment: config.environment!,
    })
  }

  async initialize() {
    this.index = this.client.index(this.config.indexName!)
  }

  async upsert(data: { id: string; values: number[]; metadata: any }): Promise<string> {
    await this.index.upsert([
      {
        id: data.id,
        values: data.values,
        metadata: data.metadata,
      },
    ])
    return data.id
  }

  async search(params: {
    vector: number[]
    topK: number
    filter?: any
    includeScores?: boolean
  }): Promise<Array<{ id: string; score: number }>> {
    const results = await this.index.query({
      vector: params.vector,
      topK: params.topK,
      filter: params.filter,
      includeMetadata: false,
      includeValues: false,
    })

    return results.matches.map((match: any) => ({
      id: match.id,
      score: match.score,
    }))
  }
}

/**
 * Qdrant Vector Store Implementation
 */
class QdrantVectorStore {
  private client: QdrantClient
  private config: VectorStoreConfig
  private embeddings: OpenAIEmbeddings

  constructor(config: VectorStoreConfig, embeddings: OpenAIEmbeddings) {
    this.config = config
    this.embeddings = embeddings
    this.client = new QdrantClient({
      url: config.url || 'http://localhost:6333',
    })
  }

  async initialize() {
    // Create collection if not exists
    try {
      await this.client.getCollection(this.config.collectionName!)
    } catch {
      await this.client.createCollection(this.config.collectionName!, {
        vectors: {
          size: this.config.dimension || 1536,
          distance: this.config.metric === 'cosine' ? 'Cosine' : 'Euclid',
        },
      })
    }
  }

  async upsert(data: { id: string; values: number[]; metadata: any }): Promise<string> {
    await this.client.upsert(this.config.collectionName!, {
      points: [
        {
          id: data.id,
          vector: data.values,
          payload: data.metadata,
        },
      ],
    })
    return data.id
  }

  async search(params: {
    vector: number[]
    topK: number
    filter?: any
    includeScores?: boolean
  }): Promise<Array<{ id: string; score: number }>> {
    const results = await this.client.search(this.config.collectionName!, {
      vector: params.vector,
      limit: params.topK,
      filter: params.filter,
    })

    return results.map((result: any) => ({
      id: result.id,
      score: result.score,
    }))
  }
}

/**
 * Chroma Vector Store Implementation
 */
class ChromaVectorStore {
  private client: ChromaClient
  private collection: Collection | null = null
  private config: VectorStoreConfig
  private embeddings: OpenAIEmbeddings

  constructor(config: VectorStoreConfig, embeddings: OpenAIEmbeddings) {
    this.config = config
    this.embeddings = embeddings
    this.client = new ChromaClient({
      path: config.url || 'http://localhost:8000',
    })
  }

  async initialize() {
    this.collection = await this.client.getOrCreateCollection({
      name: this.config.collectionName!,
      metadata: { 'hnsw:space': this.config.metric || 'cosine' },
    })
  }

  async upsert(data: { id: string; values: number[]; metadata: any }): Promise<string> {
    if (!this.collection) {
      throw new Error('Collection not initialized')
    }

    await this.collection.add({
      ids: [data.id],
      embeddings: [data.values],
      metadatas: [data.metadata],
    })
    return data.id
  }

  async search(params: {
    vector: number[]
    topK: number
    filter?: any
    includeScores?: boolean
  }): Promise<Array<{ id: string; score: number }>> {
    if (!this.collection) {
      throw new Error('Collection not initialized')
    }

    const results = await this.collection.query({
      queryEmbeddings: [params.vector],
      nResults: params.topK,
      where: params.filter,
    })

    return results.ids[0].map((id: string, index: number) => ({
      id,
      score: results.distances ? 1 - results.distances[0][index] : 0,
    }))
  }
}

export default QuestionDatabaseManager
